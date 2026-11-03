require('dotenv').config();

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const { checkAccount, removeMainAccount } = require('./database/accounts');
const { checkAccounts, updateSavedAccounts } = require('./database/saved_accounts');
const hashCompare = require('./utils/hashCompare');
const loginWrapper = require('./utils/loginWrapper');
const { createClient } = require('@supabase/supabase-js');

const PORT = Number(process.env.WEB_PORT || 3001);
const WEBSITE_DIR = path.join(__dirname, 'website');
const sessions = new Map();
const SESSION_FILE = path.join(__dirname, 'data', 'website-sessions.json');
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
fs.mkdirSync(path.dirname(SESSION_FILE), { recursive: true });
try {
    const savedSessions = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    for (const [id, session] of Object.entries(savedSessions)) {
        if (session.expiresAt > Date.now()) sessions.set(id, session);
    }
} catch (error) {
    if (error.code !== 'ENOENT') console.error('Could not restore website sessions:', error.message);
}
const oauthStates = new Map();
const SESSION_COOKIE = 'hielke_session';
const authSupabase = process.env.SUPABASEURL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASEKEY)
    ? createClient(process.env.SUPABASEURL, process.env.SUPABASE_ANON_KEY || process.env.SUPABASEKEY)
    : null;
const databaseSupabase = process.env.SUPABASEURL && process.env.SUPABASEKEY
    ? createClient(process.env.SUPABASEURL, process.env.SUPABASEKEY)
    : null;
const PLATFORM_NAMES = [
    'sparx_maths', 'sparx_reader', 'sparx_science', 'drfrost',
    'educake', 'seneca', 'purplemash'
];
const platformSessions = new Map();

function json(response, status, value) {
    response.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store'
    });
    response.end(JSON.stringify(value));
}

function parseBody(request) {
    return new Promise((resolve, reject) => {
        let body = '';
        request.on('data', chunk => {
            body += chunk;
            if (body.length > 100_000) {
                reject(new Error('Request too large'));
                request.destroy();
            }
        });
        request.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch {
                reject(new Error('Invalid JSON'));
            }
        });
        request.on('error', reject);
    });
}

function readCookies(request) {
    const result = {};
    for (const part of (request.headers.cookie || '').split(';')) {
        const separator = part.indexOf('=');
        if (separator === -1) continue;
        const key = part.slice(0, separator).trim();
        result[key] = decodeURIComponent(part.slice(separator + 1).trim());
    }
    return result;
}

function persistSessions() {
    const safeSessions = {};
    for (const [id, session] of sessions) {
        const { masterPassword, ...safeSession } = session;
        safeSessions[id] = safeSession;
    }
    try {
        fs.writeFileSync(SESSION_FILE, JSON.stringify(safeSessions, null, 2));
    } catch (error) {
        console.error('Could not save website sessions:', error.message);
    }
}

function getSession(request) {
    const id = readCookies(request)[SESSION_COOKIE];
    if (!id) return null;
    const session = sessions.get(id);
    if (!session || session.expiresAt < Date.now()) {
        if (id) sessions.delete(id);
        return null;
    }
    session.expiresAt = Date.now() + SESSION_TTL_MS;
    persistSessions();
    return session;
}

function sessionCookie(id, expires) {
    const parts = [`${SESSION_COOKIE}=${encodeURIComponent(id)}`, 'Path=/', 'HttpOnly', 'SameSite=Strict'];
    if (expires) parts.push('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    else parts.push(`Max-Age=${SESSION_TTL_MS / 1000}`);
    if (process.env.WEB_COOKIE_SECURE === 'true') parts.push('Secure');
    return parts.join('; ');
}

function requireSession(request, response) {
    const session = getSession(request);
    if (!session) {
        json(response, 401, { error: 'Please sign in again.' });
        return null;
    }
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        const expected = session.csrfToken;
        const supplied = request.headers['x-csrf-token'];
        if (!supplied || supplied.length !== expected.length ||
            !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) {
            json(response, 403, { error: 'Invalid CSRF token.' });
            return null;
        }
    }
    return session;
}

function publicSavedAccounts(accounts) {
    return accounts.map((account, index) => ({
        id: index,
        app: account.app || '',
        username: account.username || (account.cookie ? 'Cookie login' : ''),
        hasSchool: Boolean(account.school),
        type: account.type || null
    }));
}

async function websiteAccountSummary(session) {
    if (!session.discordId) return {
        discordId: null,
        email: session.email || null,
        username: session.username || session.discordUsername || null,
        license: null,
        slots: 0,
        mainAccounts: [],
        savedAccounts: []
    };
    const account = await checkAccount(session.discordId);
    if (!account) return {
        discordId: session.discordId,
        email: session.email || null,
        username: session.username || session.discordUsername || null,
        license: null,
        slots: 0,
        mainAccounts: [],
        savedAccounts: []
    };
    const savedAccounts = account.saved_accounts
        ? (await checkAccounts(session.discordId, session.masterPassword || '') || [])
        : [];
    return {
        discordId: session.discordId,
        email: session.email || null,
        username: session.username || session.discordUsername || null,
        license: account.license || null,
        slots: account.slots ?? 0,
        mainAccounts: Object.keys(account.main_accounts || {}),
        savedAccounts: publicSavedAccounts(savedAccounts)
    };
}

async function handleApi(request, response, pathname) {
    if (pathname === '/api/auth/config' && request.method === 'GET') {
        return json(response, 200, {
            discordOAuthEnabled: Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
            emailVerificationEnabled: false
        });
    }

    if (pathname === '/api/auth/register' && request.method === 'POST') {
        const { username, email, password, discordId = null } = await parseBody(request);
        if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(username || '')) {
            return json(response, 400, { error: 'Username must be 3-32 letters, numbers, dots, underscores or hyphens.' });
        }
        if (!email || !password || password.length < 8) {
            return json(response, 400, { error: 'Use a valid email and a password of at least 8 characters.' });
        }
        if (!authSupabase || !databaseSupabase) return json(response, 503, { error: 'Supabase authentication is not configured.' });

        const { data: existing } = await databaseSupabase
            .from('web_users')
            .select('id')
            .or(`username.eq.${username},email.eq.${email}`)
            .limit(1);
        if (existing?.length) return json(response, 409, { error: 'That username or email is already in use.' });

        const { data, error } = await authSupabase.auth.signUp({
            email,
            password,
            options: { data: { username } }
        });
        if (error) return json(response, 400, { error: error.message });

        const { error: mappingError } = await databaseSupabase.from('web_users').insert({
            auth_user_id: data.user?.id || null,
            username,
            email,
            discord_id: discordId || null,
            password_verified: true,
            email_verified: Boolean(data.user?.email_confirmed_at)
        });
        if (mappingError) return json(response, 500, { error: 'Account was created but its profile could not be linked.' });

        let sessionResult = null;
        if (data.session) {
            const id = crypto.randomBytes(32).toString('hex');
            const session = {
                authUserId: data.user.id,
                email: data.user.email,
                username,
                supabaseAccessToken: data.session.access_token,
                csrfToken: crypto.randomBytes(24).toString('hex'),
                expiresAt: Date.now() + SESSION_TTL_MS
            };
            sessions.set(id, session);
            persistSessions();
            response.setHeader('set-cookie', sessionCookie(id));
            sessionResult = { csrfToken: session.csrfToken };
        }

        return json(response, 201, {
            requiresEmailVerification: false,
            ...sessionResult,
            message: data.session
                ? 'Account created and ready to use.'
                : 'Account created. Sign in with your username and password.'
        });
    }

    if (pathname === '/api/auth/login' && request.method === 'POST') {
        const { usernameOrEmail, password } = await parseBody(request);
        if (!usernameOrEmail || !password) return json(response, 400, { error: 'Enter your username/email and password.' });
        if (!authSupabase || !databaseSupabase) return json(response, 503, { error: 'Authentication is not configured.' });

        let email = usernameOrEmail;
        if (!usernameOrEmail.includes('@')) {
            const { data, error } = await databaseSupabase
                .from('web_users')
                .select('email')
                .eq('username', usernameOrEmail)
                .maybeSingle();
            if (error || !data) return json(response, 401, { error: 'Unknown username.' });
            email = data.email;
        }

        const { data, error } = await authSupabase.auth.signInWithPassword({ email, password });
        if (error) return json(response, 401, { error: error.message });
        const { data: profile } = await databaseSupabase
            .from('web_users')
            .select('*')
            .eq('auth_user_id', data.user.id)
            .maybeSingle();
        const id = crypto.randomBytes(32).toString('hex');
        sessions.set(id, {
            discordId: profile?.discord_id ? String(profile.discord_id) : null,
            authUserId: data.user.id,
            email: data.user.email,
            username: profile?.username || usernameOrEmail,
            supabaseAccessToken: data.session.access_token,
            csrfToken: crypto.randomBytes(24).toString('hex'),
            expiresAt: Date.now() + SESSION_TTL_MS
        });
        persistSessions();
        response.setHeader('set-cookie', sessionCookie(id));
        return json(response, 200, { csrfToken: sessions.get(id).csrfToken, account: await websiteAccountSummary(sessions.get(id)) });
    }

    if (pathname === '/api/auth/reset-request' && request.method === 'POST') {
        const { email } = await parseBody(request);
        if (!email || !authSupabase) return json(response, 400, { error: 'Enter your account email.' });
        const { error } = await authSupabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.WEB_PUBLIC_URL || `http://localhost:${PORT}`}/account.html?action=reset-password`
        });
        if (error) return json(response, 400, { error: error.message });
        return json(response, 200, { message: 'If an account exists for that email, a reset link has been sent.' });
    }

    if (pathname === '/api/auth/discord' && request.method === 'GET') {
        if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
            return json(response, 503, { error: 'Discord sign-in is not configured.' });
        }
        const state = crypto.randomBytes(24).toString('hex');
        oauthStates.set(state, Date.now() + 10 * 60 * 1000);
        const redirect = new URL('https://discord.com/oauth2/authorize');
        redirect.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID);
        redirect.searchParams.set('redirect_uri', process.env.DISCORD_OAUTH_REDIRECT_URI || `http://localhost:${PORT}/api/auth/discord/callback`);
        redirect.searchParams.set('response_type', 'code');
        redirect.searchParams.set('scope', 'identify email');
        redirect.searchParams.set('state', state);
        response.writeHead(302, { location: redirect.toString() });
        response.end();
        return;
    }

    if (pathname === '/api/auth/session' && request.method === 'GET') {
        const session = getSession(request);
        if (!session) return json(response, 401, { error: 'Not signed in.' });
        return json(response, 200, {
            csrfToken: session.csrfToken,
            account: await websiteAccountSummary(session)
        });
    }

    if (pathname === '/api/auth/discord/callback' && request.method === 'GET') {
        const { code, state, error: oauthError } = Object.fromEntries(new URL(request.url, 'http://localhost').searchParams);
        if (oauthError || !code || !oauthStates.has(state) || oauthStates.get(state) < Date.now()) {
            response.writeHead(302, { location: '/account.html?error=discord_signin_failed' });
            response.end();
            return;
        }

        oauthStates.delete(state);
        const redirectUri = process.env.DISCORD_OAUTH_REDIRECT_URI || `http://localhost:${PORT}/api/auth/discord/callback`;
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri
            })
        });
        const tokenData = await tokenResponse.json();
        const identityResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { authorization: "Bearer " + tokenData.access_token }
        });
        if (!tokenResponse.ok) {
            response.writeHead(302, { location: '/account.html?error=discord_signin_failed' });
            response.end();
            return;
        }
        const identity = await identityResponse.json();
        const discordId = String(identity.id || '');
        if (!discordId) {
            response.writeHead(302, { location: '/account.html?error=discord_signin_failed' });
            response.end();
            return;
        }
        const id = crypto.randomBytes(32).toString('hex');
        sessions.set(id, {
            discordId,
            discordUsername: identity.username,
            email: identity.email || null,
            csrfToken: crypto.randomBytes(24).toString('hex'),
            expiresAt: Date.now() + SESSION_TTL_MS
        });
        persistSessions();
        if (databaseSupabase && identity.email) {
            await databaseSupabase.from('web_users').upsert({
                discord_id: discordId,
                email: identity.email,
                username: identity.username
            }, { onConflict: 'discord_id' });
        }
        response.setHeader('set-cookie', sessionCookie(id));
        response.writeHead(302, { location: '/account.html?signin=discord' });
        response.end();
        return;
    }
    if (pathname === '/api/login' && request.method === 'POST') {
        const { discordId, masterPassword = '' } = await parseBody(request);
        if (!discordId || !/^\d+$/.test(String(discordId))) {
            return json(response, 400, { error: 'Enter your numeric Discord user ID.' });
        }

        const account = await checkAccount(String(discordId));
        if (!account) return json(response, 401, { error: 'No Hielke AI account was found for that Discord ID.' });

        const passwordCorrect = account.master_password === null
            ? masterPassword === ''
            : await hashCompare(masterPassword, account.master_password);
        if (!passwordCorrect) return json(response, 401, { error: 'The Discord ID or master password is incorrect.' });

        let savedAccounts = [];
        if (account.saved_accounts) {
            savedAccounts = await checkAccounts(String(discordId), masterPassword);
            if (savedAccounts === false) return json(response, 401, { error: 'Saved accounts could not be unlocked.' });
            savedAccounts ||= [];
        }

        const id = crypto.randomBytes(32).toString('hex');
        sessions.set(id, {
            discordId: String(discordId),
            masterPassword,
            csrfToken: crypto.randomBytes(24).toString('hex'),
            expiresAt: Date.now() + SESSION_TTL_MS
        });
        persistSessions();
        response.setHeader('set-cookie', sessionCookie(id));
        return json(response, 200, {
            csrfToken: sessions.get(id).csrfToken,
            account: {
                discordId: String(discordId),
                license: account.license || null,
                slots: account.slots ?? 0,
                mainAccounts: Object.keys(account.main_accounts || {}),
                savedAccounts: publicSavedAccounts(savedAccounts)
            }
        });
    }

    if (pathname === '/api/logout' && request.method === 'POST') {
        const session = requireSession(request, response);
        if (!session) return;
        sessions.delete(readCookies(request)[SESSION_COOKIE]);
        persistSessions();
        response.setHeader('set-cookie', sessionCookie('', true));
        return json(response, 200, { ok: true });
    }

    let session = getSession(request);
    if (!session && pathname === '/api/platform/login' && request.method === 'POST') {
        const id = crypto.randomBytes(32).toString('hex');
        session = {
            discordId: null,
            csrfToken: crypto.randomBytes(24).toString('hex'),
            expiresAt: Date.now() + 60 * 60 * 1000
        };
        sessions.set(id, session);
        persistSessions();
        response.setHeader('set-cookie', sessionCookie(id));
    } else {
        session = requireSession(request, response);
    }
    if (!session) return;

    if (pathname === '/api/account' && request.method === 'GET') {
        const account = await checkAccount(session.discordId);
        const savedAccounts = account.saved_accounts
            ? (await checkAccounts(session.discordId, session.masterPassword) || [])
            : [];
        return json(response, 200, {
            csrfToken: session.csrfToken,
            account: {
                discordId: session.discordId,
                license: account.license || null,
                slots: account.slots ?? 0,
                mainAccounts: Object.keys(account.main_accounts || {}),
                savedAccounts: publicSavedAccounts(savedAccounts)
            }
        });
    }

    if (pathname === '/api/saved-accounts' && request.method === 'POST') {
        const account = await checkAccount(session.discordId);
        let savedAccounts = account.saved_accounts
            ? (await checkAccounts(session.discordId, session.masterPassword) || [])
            : [];
        const details = await parseBody(request);
        const app = String(details.app || '');
        if (!PLATFORM_NAMES.includes(app)) return json(response, 400, { error: 'Choose a supported platform.' });

        let loginDetails;
        if (details.cookie) {
            loginDetails = { app, cookie: String(details.cookie).trim() };
        } else {
            if (!details.username || !details.password) {
                return json(response, 400, { error: 'Enter both a username and password.' });
            }
            loginDetails = {
                app,
                username: String(details.username).trim(),
                password: String(details.password),
                ...(details.school && { school: String(details.school).trim() }),
                ...(details.type && { type: String(details.type) })
            };
        }
        if (!loginDetails.cookie && savedAccounts.some(item => item.app === app && item.username === loginDetails.username)) {
            return json(response, 409, { error: 'An account with that username is already saved.' });
        }
        if (savedAccounts.length >= 25) return json(response, 409, { error: 'You can save up to 25 accounts.' });

        savedAccounts.push(loginDetails);
        await updateSavedAccounts(session.discordId, savedAccounts, session.masterPassword);
        return json(response, 200, { savedAccounts: publicSavedAccounts(savedAccounts) });
    }

    if (pathname === '/api/saved-accounts' && request.method === 'DELETE') {
        const { id } = await parseBody(request);
        const account = await checkAccount(session.discordId);
        let savedAccounts = account.saved_accounts
            ? (await checkAccounts(session.discordId, session.masterPassword) || [])
            : [];
        if (!Number.isInteger(id) || !savedAccounts[id]) {
            return json(response, 400, { error: 'Invalid saved account.' });
        }
        savedAccounts.splice(id, 1);
        await updateSavedAccounts(session.discordId, savedAccounts, session.masterPassword);
        return json(response, 200, { savedAccounts: publicSavedAccounts(savedAccounts) });
    }

    if (pathname === '/api/main-accounts' && request.method === 'DELETE') {
        const { platform } = await parseBody(request);
        if (!PLATFORM_NAMES.includes(platform)) return json(response, 400, { error: 'Invalid platform.' });
        await removeMainAccount(session.discordId, platform);
        return json(response, 200, { ok: true });
    }

    if (pathname === '/api/platform/login' && request.method === 'POST') {
        const body = await parseBody(request);
        let details = body.details || body.loginDetails;
        if (Number.isInteger(body.accountId) && session.discordId && session.masterPassword) {
            const botAccount = await checkAccount(session.discordId);
            if (!botAccount?.saved_accounts) return json(response, 404, { error: 'No saved accounts are available.' });
            const savedAccounts = await checkAccounts(session.discordId, session.masterPassword);
            details = savedAccounts?.[body.accountId];
        }
        if (!details && body.platform && !body.savedOnly) {
            details = {
                app: body.platform,
                ...(body.username && { username: String(body.username) }),
                ...(body.password && { password: String(body.password) }),
                ...(body.school && { school: String(body.school) }),
                ...(body.cookie && { cookie: String(body.cookie) }),
                ...(body.type && { type: String(body.type) })
            };
        }
        if (!details?.app) return json(response, 400, { error: 'Choose a platform and enter its login details.' });
        if (!details.cookie && (!details.username || !details.password)) {
            return json(response, 400, { error: 'Enter the platform username and password, or its cookie.' });
        }

        const platformParts = details.app.split('_');
        const parent = platformParts[0] === 'sparx' ? 'sparx' : details.app;
        const child = platformParts[0] === 'sparx' ? platformParts[1] : null;
        let authToken;
        let cookies;
        if (details.cookie) {
            const getTokenRequest = require(path.join(__dirname, 'autocompleters', parent, 'getTokenRequest.js'));
            authToken = await getTokenRequest(details.cookie);
            cookies = details.cookie;
        } else {
            const login = require(path.join(__dirname, 'autocompleters', parent, 'login.js'));
            const loginResult = await loginWrapper(() => login(details));
            authToken = loginResult.authToken;
            cookies = loginResult.cookies;
            if (loginResult.status === 'error') throw new Error(loginResult.message || 'Platform login failed.');
        }
        if (!authToken) return json(response, 401, { error: 'Platform rejected the saved login.' });

        const requesticatorPath = child
            ? path.join(__dirname, 'autocompleters', parent, 'children', child, 'requesticator.js')
            : path.join(__dirname, 'autocompleters', parent, 'requesticator.js');
        const Requesticator = require(requesticatorPath);
        const requesticator = child ? new Requesticator(authToken, details, cookies) : new Requesticator(authToken, details);
        platformSessions.set(`${session.csrfToken}:${details.app}`, {
            requesticator,
            authToken,
            cookies,
            details
        });
        let accountInfo = null;
        if (typeof requesticator.getAccountId === 'function') accountInfo = await requesticator.getAccountId();
        let homeworks = null;
        if (typeof requesticator.getHomeworks === 'function') homeworks = await requesticator.getHomeworks();

        return json(response, 200, {
            app: details.app,
            accountId: accountInfo ? String(accountInfo) : null,
            homeworks: Array.isArray(homeworks) ? homeworks.slice(0, 50) : homeworks,
            connected: true,
            csrfToken: session.csrfToken
        });
    }

    return json(response, 404, { error: 'Not found.' });
}

function serveStatic(request, response, pathname) {
    const requested = pathname === '/' ? '/index.html' : pathname;
    const normalized = path.normalize(requested).replace(/^(\.\.[/\\])+/, '');
    let filePath = path.join(WEBSITE_DIR, normalized);
    if (!filePath.startsWith(WEBSITE_DIR)) return json(response, 403, { error: 'Forbidden.' });

    if (!path.extname(filePath)) {
        const htmlPath = `${filePath}.html`;
        if (fs.existsSync(htmlPath)) filePath = htmlPath;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
            response.end('Not found');
            return;
        }
        const type = {
            '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
            '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
            '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
            '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.ttf': 'font/ttf'
        }[path.extname(filePath)] || 'application/octet-stream';
        let responseData = data;
        if (type.startsWith('text/html')) {
            const html = data.toString('utf8');
            const withStyles = html.includes('/assets/hielke-unified.css')
                ? html
                : html.replace('</head>', '<link rel="stylesheet" href="/assets/hielke-unified.css?v=2"></head>');
            responseData = withStyles.includes('/assets/discord-links.js')
                ? withStyles
                : withStyles.replace('</body>', '<script src="/assets/discord-links.js?v=2"></script></body>');
        }
        response.writeHead(200, { 'content-type': type, 'x-content-type-options': 'nosniff' });
        response.end(responseData);
    });
}

const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    try {
        if (url.pathname.startsWith('/api/')) await handleApi(request, response, url.pathname);
        else if (request.method === 'GET') serveStatic(request, response, url.pathname);
        else json(response, 405, { error: 'Method not allowed.' });
    } catch (error) {
        console.error('Web server error:', error);
        json(response, 500, { error: 'The website could not complete that request.' });
    }
});

setInterval(() => {
    for (const [id, session] of sessions) {
        if (session.expiresAt < Date.now()) sessions.delete(id);
    }
}, 60 * 60 * 1000).unref();

server.listen(PORT, () => {
    console.log(`Hielke AI website running at http://localhost:${PORT}`);
});
