let csrfToken = '';
let currentAccount = null;
let selectedPlatform = 'sparx_maths';
let selectedLoginType = 'normal';

const loginPanel = document.querySelector('#login-panel');
const accountPanel = document.querySelector('#account-panel');

async function resumeSession() {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error === 'discord_signin_failed') {
        showMessage(document.querySelector('#login-message'), 'Discord sign-in failed. Check the OAuth redirect URL and Discord client credentials.');
    } else if (params.get('signin') === 'discord') {
        try {
            const result = await request('/api/auth/session');
            csrfToken = result.csrfToken;
            renderAccounts(result.account);
            showAccountView();
            window.history.replaceState({}, '', '/account.html');
            return;
        } catch (error) {
            showMessage(document.querySelector('#login-message'), error.message);
        }
    }
}

resumeSession();

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            'content-type': 'application/json',
            ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
            ...(options.headers || {})
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed.');
    return data;
}

function showMessage(element, message, error = true) {
    element.textContent = message;
    element.hidden = false;
    element.classList.toggle('error', error);
}

function renderAccounts(account) {
    currentAccount = account;
    document.querySelector('#account-summary').textContent =
        `Discord ID ${account.discordId} · License ${account.license || 'none'} · ${account.slots} account slots`;

    const saved = document.querySelector('#saved-accounts');
    if (!account.savedAccounts.length) {
        saved.innerHTML = '<p>No saved accounts yet.</p>';
    } else {
        saved.innerHTML = account.savedAccounts.map(item => `
            <article class="stat-card account-row">
                <div><strong>${escapeHtml(item.app.replace('_', ' '))}</strong><br>${escapeHtml(item.username)}</div>
                <div class="account-actions">
                    <button type="button" class="secondary-button run-account" data-id="${item.id}" data-app="${escapeHtml(item.app)}">open</button>
                    <button type="button" class="secondary-button delete-account" data-id="${item.id}">delete</button>
                </div>
            </article>
        `).join('');
    }

    document.querySelector('#main-accounts').innerHTML = account.mainAccounts.length
        ? account.mainAccounts.map(platform => `
            <article class="stat-card account-row">
                <strong>${escapeHtml(platform.replace('_', ' '))}</strong>
                <button type="button" class="secondary-button remove-main" data-platform="${escapeHtml(platform)}">remove</button>
            </article>
        `).join('')
        : '<p>No main accounts configured.</p>';
}

function escapeHtml(value) {
    const element = document.createElement('span');
    element.textContent = value;
    return element.innerHTML;
}

function showAccountView() {
    loginPanel.hidden = true;
    accountPanel.hidden = false;
}

document.querySelector('#auth-login-form').addEventListener('submit', async event => {
    event.preventDefault();
    const message = document.querySelector('#login-message');
    try {
        const result = await request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                usernameOrEmail: document.querySelector('#auth-login').value.trim(),
                password: document.querySelector('#auth-password').value
            })
        });
        csrfToken = result.csrfToken;
        renderAccounts(result.account);
        showAccountView();
    } catch (error) {
        showMessage(message, error.message);
    }
});

document.querySelector('#register-form').addEventListener('submit', async event => {
    event.preventDefault();
    const message = document.querySelector('#login-message');
    try {
        const result = await request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username: document.querySelector('#register-username').value.trim(),
                email: document.querySelector('#register-email').value.trim(),
                password: document.querySelector('#register-password').value
            })
        });
        showMessage(message, result.message, false);
        if (result.csrfToken) {
            csrfToken = result.csrfToken;
            const session = await request('/api/auth/session');
            renderAccounts(session.account);
            showAccountView();
        }
    } catch (error) {
        showMessage(message, error.message);
    }
});

document.querySelectorAll('[data-platform]').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('[data-platform]').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        selectedPlatform = button.dataset.platform;
    });
});

document.querySelectorAll('[data-login-type]').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('[data-login-type]').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        selectedLoginType = button.dataset.loginType;
    });
});

document.querySelectorAll('[data-login-method]').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('[data-login-method]').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        const cookieMode = button.dataset.loginMethod === 'cookie';
        document.querySelector('.username-fields').hidden = cookieMode;
        document.querySelector('.cookie-fields').hidden = !cookieMode;
    });
});

document.querySelector('#direct-login-form').addEventListener('submit', async event => {
    event.preventDefault();
    const message = document.querySelector('#direct-login-message');
    const cookie = document.querySelector('#platform-cookie').value.trim();
    const username = document.querySelector('#platform-username').value.trim();
    const password = document.querySelector('#platform-password').value;
    try {
        const result = await request('/api/platform/login', {
            method: 'POST',
            body: JSON.stringify({
                platform: selectedPlatform,
                cookie,
                username,
                password,
                school: document.querySelector('#platform-school').value.trim(),
                type: selectedLoginType
            })
        });
        csrfToken = result.csrfToken || csrfToken;
        const homeworkCount = Array.isArray(result.homeworks) ? result.homeworks.length : 0;
        showMessage(message, `Connected to ${result.app}. Platform ID ${result.accountId || 'unavailable'}; ${homeworkCount} homework items found.`, false);
    } catch (error) {
        showMessage(message, error.message);
    }
});

document.querySelector('#reset-form').addEventListener('submit', async event => {
    event.preventDefault();
    const message = document.querySelector('#login-message');
    try {
        const result = await request('/api/auth/reset-request', {
            method: 'POST',
            body: JSON.stringify({ email: document.querySelector('#reset-email').value.trim() })
        });
        showMessage(message, result.message, false);
    } catch (error) {
        showMessage(message, error.message);
    }
});

document.querySelector('#account-login-form').addEventListener('submit', async event => {
    event.preventDefault();
    const message = document.querySelector('#login-message');
    try {
        const result = await request('/api/login', {
            method: 'POST',
            body: JSON.stringify({
                discordId: document.querySelector('#discord-id').value.trim(),
                masterPassword: document.querySelector('#master-password').value
            })
        });
        csrfToken = result.csrfToken;
        renderAccounts(result.account);
        showAccountView();
    } catch (error) {
        showMessage(message, error.message);
    }
});

document.querySelector('#cookie-login').addEventListener('change', event => {
    document.querySelector('#credential-fields').hidden = event.target.checked;
    document.querySelector('#cookie-field').hidden = !event.target.checked;
});

document.querySelector('#saved-account-form').addEventListener('submit', async event => {
    event.preventDefault();
    const message = document.querySelector('#save-message');
    const cookieLogin = document.querySelector('#cookie-login').checked;
    try {
        const result = await request('/api/saved-accounts', {
            method: 'POST',
            body: JSON.stringify({
                app: document.querySelector('#platform').value,
                cookie: cookieLogin ? document.querySelector('#cookie').value.trim() : '',
                username: document.querySelector('#username').value.trim(),
                password: document.querySelector('#password').value,
                school: document.querySelector('#school').value.trim()
            })
        });
        currentAccount.savedAccounts = result.savedAccounts;
        renderAccounts(currentAccount);
        event.target.reset();
        document.querySelector('#credential-fields').hidden = false;
        document.querySelector('#cookie-field').hidden = true;
        showMessage(message, 'Account saved.', false);
    } catch (error) {
        showMessage(message, error.message);
    }
});

document.querySelector('#saved-accounts').addEventListener('click', async event => {
    const runButton = event.target.closest('.run-account');
    if (runButton) {
        try {
            const result = await request('/api/platform/login', {
                method: 'POST',
                body: JSON.stringify({ accountId: Number(runButton.dataset.id), platform: runButton.dataset.app })
            });
            const homeworkCount = Array.isArray(result.homeworks) ? result.homeworks.length : 0;
            alert(`Connected to ${result.app}. Platform account ID: ${result.accountId || 'unavailable'}.\n${homeworkCount} homework items available.`);
        } catch (error) {
            alert(error.message);
        }
        return;
    }
    const button = event.target.closest('.delete-account');
    if (!button) return;
    try {
        const result = await request('/api/saved-accounts', {
            method: 'DELETE',
            body: JSON.stringify({ id: Number(button.dataset.id) })
        });
        currentAccount.savedAccounts = result.savedAccounts;
        renderAccounts(currentAccount);
    } catch (error) {
        alert(error.message);
    }
});

document.querySelector('#main-accounts').addEventListener('click', async event => {
    const button = event.target.closest('.remove-main');
    if (!button) return;
    try {
        await request('/api/main-accounts', {
            method: 'DELETE',
            body: JSON.stringify({ platform: button.dataset.platform })
        });
        currentAccount.mainAccounts = currentAccount.mainAccounts.filter(item => item !== button.dataset.platform);
        renderAccounts(currentAccount);
    } catch (error) {
        alert(error.message);
    }
});

document.querySelector('#logout-button').addEventListener('click', async () => {
    await request('/api/logout', { method: 'POST', body: '{}' });
    csrfToken = '';
    accountPanel.hidden = true;
    loginPanel.hidden = false;
});
