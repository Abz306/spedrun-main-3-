require('dotenv').config();
const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const smartLogin = require('../../utils/smartLogin');

chromium.use(StealthPlugin());

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function educakeLogin(username, password, loginType, on2FA) {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();

    await page.goto('https://my.educake.co.uk/student-login', { waitUntil: 'networkidle', timeout: 20000 });

    const cookieButtonSelector = '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll';
    const cookieButton = await page.locator(cookieButtonSelector).first();
    if (await cookieButton.count()) {
      await cookieButton.click();
      console.log('Cookie consent accepted!');
    }

    if (loginType === 'Normal') {
      await page.waitForSelector('input[name="username"]', { state: 'visible', timeout: 10000 });
      await page.type('input[name="username"]', username);

      await page.waitForSelector('input[name="password"]', { state: 'visible', timeout: 10000 });
      await page.type('input[name="password"]', password);

      const loginButtonSelector = 'button[type="submit"]';
      await page.waitForSelector(loginButtonSelector, { state: 'visible', timeout: 10000 });
      await page.click(loginButtonSelector);
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    } else {
      await page.evaluate((index) => {
        const buttons = document.querySelectorAll('.sso-login.btn.white');
        buttons[index]?.click();
      }, loginType === 'Google' ? 0 : 1);

      const landedFunction = ({ url }) => url.includes('my.educake.co.uk/my-educake');
      await smartLogin(page, username, password, loginType, landedFunction, () => {}, on2FA);
    }

    console.log('Login complete!');
    await delay(3000);

    const cookiesArray = await page.context().cookies();
    const desiredOrder = ['PHPSESSID', 'cf_clearance', 'XSRF-TOKEN', '_dd_s'];
    const cookiesMap = new Map(cookiesArray.map(c => [c.name, `${c.name}=${c.value}`]));
    const orderedCookies = desiredOrder.map(name => cookiesMap.get(name)).filter(Boolean);

    return orderedCookies.join('; ');
  } catch (err) {
    console.log('Educake login error');
    console.log(err);
    return false;
  } finally {
    await browser.close();
  }
}

module.exports = { educakeLogin };