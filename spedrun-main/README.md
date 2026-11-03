# Huge thanks to ChurroAI for providing the source code of their bot. We are using this src as a base for our bot.

# Introduction
This project was made to help students automatically complete their homework with the use of AI and requests while avoiding detection. You may use the code and database for whatever use case, but providing credit back to this original project is preferable. Sparx maths v2 is currently brokem it needs fixing dr frost shoud work it works for me.

The installation guide below is a step-by-step guide on how to set-up the bot on your own computer. The bot may or may not work on a cloud server due to Cloudflare.

*If you are only planning to use the bot for personal use, you can use the bot for free in the discord server, linked **below.***

## Discord Server
### https://discord.gg/ZWF5VzuXSk
*If the invite link is invalid, please send a Direct Message to **weavernetwork**, or **ezkoala**.*

## Prerequisites

Before starting, ensure you have the following installed on your system:
- **[Node.js](https://nodejs.org/en/download)**
- **[Python](https://www.python.org/downloads/)**
- **[Visual Studio Code](https://code.visualstudio.com/)** (or your preferred code editor)
- **[MiKTeX](https://miktex.org/download)**

## Creating the Discord Bot

1. Go to the **[Discord Developer Portal](https://discord.com/developers/applications)** and click **New Application**.
2. Navigate to the **Bot** tab on the left menu.
3. Scroll down to **Privileged Gateway Intents** and enable all three:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent
![Discord Bot Intents Screenshot](https://i.postimg.cc/J7Y2vwLy/Screenshot-2026-04-10-153939.png)
4. Navigate to the **OAuth2 > URL Generator** tab.
5. Under **Scopes**, select `bot`. Under **Bot Permissions**, select `Administrator`. 
![URL Generator](https://i.postimg.cc/YCCfH0zG/image.png)
6. Copy the generated URL at the bottom of the page, paste it into your browser, and add the bot to your server.

## Setting up the Database

Before installing the bot, you need to set up your database. Follow the instructions provided in the database repository:  


## Installing and Configuring the Discord Bot

1. **Prepare your workspace.**
   Download the folder using the "Download Folder" button at the top of the page and extract it in File Explorer, open it in VS Code, and open a new terminal.

   ![Open Folder](https://i.postimg.cc/vB0bCPYd/image.png)
   ![New Terminal](https://i.postimg.cc/qvQ9QNj2/image.png)

2. **Install dependencies.**
   Run the following commands in your terminal:
   ```bash
   npm install
   npx playwright install
   python -m venv venv; .\venv\Scripts\python -m pip install --upgrade pip; .\venv\Scripts\python -m pip install -r requirements.txt
   ```

3. **Set up your environment variables and configuration.**
   Create two new files in your folder: `.env` and `config.json`. Fill them out using the provided `.example` files as a guide. 
   * You **must** provide a value for any fields that are completely empty (`""`). 
   * For the other fields, you may use the default values provided in the example files.

   > **Tip: Finding Discord IDs**
   > Ensure you use the **ID** of roles and channels, not their names. You can get these by enabling **Developer Mode** in your Discord Advanced Settings, then right-clicking the channel or role and selecting "Copy ID".

   ![Developer Mode](https://i.postimg.cc/q7xg1XW5/image.png)
   ![Channel ID](https://i.postimg.cc/tJXchyWz/image.png)
   ![Role ID](https://i.postimg.cc/zDt7dnr5/image.png)
   ![Config](https://i.postimg.cc/9MGPtnjv/image.png)
   ![Env](https://i.postimg.cc/DmV8j2dc/image.png)

### Configuring Progress Bar Emojis

In order to use the progress bar, you must upload the custom emojis to your Discord application.

1. Go to the **Emojis** section of your bot in the Discord Developer Portal.
2. Upload the images found in the `emojis/progress_bar` folder of your project.
3. Once uploaded, click **Copy Markdown**. Your clipboard will now contain a string formatted like `<:emoji_name:id>`.
4. Navigate to your `config.json` file and paste the copied markdown into the relevant fields.

![Emojis Upload](https://i.postimg.cc/65GWjJP4/image.png)
![Emojis Folder](https://i.postimg.cc/kgbyg4pR/image.png)
![Copy Markdown](https://i.postimg.cc/0yQLWpj4/image.png)

### Configuring the Env

You will need to gather several keys and IDs to fill out your `.env` file. Here is where to find them:

* **CLIENT_ID**: Discord Developer Portal -> **General Information** -> Copy **Application ID**.
* **DISCORD_TOKEN**: Discord Developer Portal -> **Bot** -> Click **Reset Token**.
  ![Discord Token](https://i.postimg.cc/mrZnKTtV/image.png)
* **RESOURCE_WEBHOOK_URL** & **LOGS_WEBHOOK_URL** & **STARTUP_WEBHOOK_URL** & **ERROR_WEBHOOK_URL**: Go to your target Discord channel's **Settings** -> **Integrations** -> **Webhooks** and create/copy the Webhook URL.
  ![Webhook](https://i.postimg.cc/dt6r4CZX/image.png)
* **SUPABASEURL**: Formatted as `https://PROJECT_ID.supabase.co`. You can find your Project ID in Supabase under **Settings** -> **General**.

  ![Supabase Settings General](https://i.postimg.cc/T172WThF/image.png)
* **SUPABASEKEY**: In Supabase, go to **Settings** -> **API Keys** and copy the `secret` key.

![Env Example](https://i.postimg.cc/DmV8j2dc/image.png)

### Configuring AI API Keys

AI provider keys are read from the bot's `.env` file. Set at least one provider key, for example `GEMINI_API_KEY` for Gemini; supported names are `GEMINI_API_KEY`, `MISTRAL_API_KEY`, `QWEN_API_KEY`, and `OPENROUTER_API_KEY`. Choose a model for the same provider in the bot's AI settings. You can generate a Gemini key at [Google AI Studio](https://aistudio.google.com/api-keys).

Do not put provider keys in `apikeys.txt`. The `.env.example` file lists the available environment variables; copy those names into `.env` and set the values there. Keep `.env` private and do not commit it.

## Configuring Commands

To make the Discord bot's commands appear, ensure your terminal is in the bot folder and run:
   ```bash
   node deployment
   ```
   > **Note:** You only need to do this once. Run it again only if new commands are added or existing ones are modified. The commands will remain registered even if the bot goes offline.

## Running the Discord Bot

Once all your files are configured and saved, ensure your terminal is in the bot folder and run:
   ```bash
   node launcher
   ```

**Congrats! Your bot should now be online and running!**

## Setting Up the Website

The website can sign users in with Discord or a username and email. It also uses the same Supabase accounts and encrypted saved-platform accounts as the bot.

### 1. Create the website database table

Open the Supabase project, go to **SQL Editor**, and run [`database/web_auth.sql`](database/web_auth.sql).

This creates the `web_users` table used to connect Supabase email users, Discord users, and bot accounts.

### 2. Configure email sign-in

In Supabase, open **Authentication > Providers > Email** and enable email sign-up.

For this website, turn confirmation emails off in **Authentication > Providers > Email**. The application creates immediately usable local sessions and does not require an email server. Configure the project URL and allowed redirect URLs under **Authentication > URL Configuration**:

- Local development site URL: `http://localhost:3001`
- Production site URL: the public URL where `webServer.js` is hosted
- Password-reset redirect: `<PUBLIC_SITE_URL>/account.html?action=reset-password`

Find the public Supabase anon/publishable key under the project's API settings and add both database keys to `.env`:

```dotenv
SUPABASEURL="https://PROJECT_ID.supabase.co"
SUPABASEKEY="your-secret-server-key"
SUPABASE_ANON_KEY="your-public-or-anon-key"
WEB_PORT="3001"
WEB_COOKIE_SECURE="false"
WEB_PUBLIC_URL="http://localhost:3001"
```

Keep `SUPABASEKEY` on the server only. Never place the secret key in website JavaScript or commit it to GitHub.

### 3. Configure Discord sign-in

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and select the bot application.
2. Open **OAuth2** and add a redirect matching the URL in `DISCORD_OAUTH_REDIRECT_URI`.
3. For local development, add:

   `http://localhost:3001/api/auth/discord/callback`

4. Copy the application client ID and client secret into `.env`:

```dotenv
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
DISCORD_OAUTH_REDIRECT_URI="http://localhost:3001/api/auth/discord/callback"
```

The OAuth client ID and redirect URI are not secrets, but the client secret must never be put in Discord messages, committed files, or website JavaScript.

To configure it:

1. In the Discord Developer Portal, open the application already used by the bot.
2. Go to **OAuth2**.
3. Copy the **Client ID** value and put it in `DISCORD_CLIENT_ID`.
4. Click **Reset Secret**. Discord will only show the secret once, so copy it immediately into `DISCORD_CLIENT_SECRET`.
5. Under **Redirects**, add exactly this local value and click **Save Changes**:

   `http://localhost:3001/api/auth/discord/callback`

6. Do not add the redirect under the separate OAuth2 URL Generator. Redirects belong in the **OAuth2 > Redirects** section.
7. Start the website server:

   ```bash
   npm run website
   ```

8. Visit `http://localhost:3001/account.html`, select **Sign in with Discord**, and approve the `identify` and `email` permissions.

If Discord says the redirect URI is invalid, ensure it is identical in the Developer Portal and `.env`, including `/api/auth/discord/callback` and the absence of a trailing slash.

For a hosted website, replace the redirect with your HTTPS address in both places, for example:

```dotenv
DISCORD_OAUTH_REDIRECT_URI="https://hielkeai.example/api/auth/discord/callback"
WEB_PUBLIC_URL="https://hielkeai.example"
WEB_COOKIE_SECURE="true"
```

Discord Developer Portal production redirect:

`https://hielkeai.example/api/auth/discord/callback`

For production, replace the localhost origin with the HTTPS production origin everywhere it appears in the Discord OAuth configuration and `.env`.

### 4. Start the account-sync website

Install the bot dependencies, then run:

```bash
npm run website
```

For a Raspberry Pi 5, use the startup script instead. It checks the configuration,
starts the website, and starts the Discord bot when its token is configured:

```bash
chmod +x startup.sh
./startup.sh
```

Open `http://localhost:3001/account.html`.

The website server:

- shares saved platform accounts with the bot through the Supabase accounts table
- supports username/email and Discord sign-in
- supports optional Supabase password-reset emails, but does not require account email verification
- uses secure HttpOnly browser sessions with CSRF protection
- can log in to supported saved platform accounts and read their homework

### 5. Publish the static website

The files in `website/` can be hosted with GitHub Pages, a static host, or a reverse proxy. Dynamic `/api/*` requests must be sent to the Node.js server started with `npm run website`; GitHub Pages alone cannot run that server.

In production, serve the Node app over HTTPS behind a reverse proxy and set:

```dotenv
WEB_COOKIE_SECURE="true"
WEB_PUBLIC_URL="https://your-domain.example"
DISCORD_OAUTH_REDIRECT_URI="https://your-domain.example/api/auth/discord/callback"
```

*For any issues or updates needed in this readme, please DM **ezkoala** on Discord, or ping in the Discord.*
