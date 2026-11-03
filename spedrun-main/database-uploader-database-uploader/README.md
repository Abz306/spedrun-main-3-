# Introduction

This repository will upload the database to supabase for your discord bot.

## Setup Guide

1. **Prepare your workspace.**
   Download the folder using the "Download Folder" button and extract it in File Explorer, open it in VS Code, and open a new terminal.

   ![Open Folder](https://i.postimg.cc/vB0bCPYd/image.png)
   ![New Terminal](https://i.postimg.cc/qvQ9QNj2/image.png)

### 3. Download and Set Up the Database

1. **Download the database** from the link below:  
   [Download Database](https://drive.google.com/file/d/1oq73FbrytgDQfIgF_Os53Yp8Ck3f6VrW/view?usp=sharing)

2. **Extract the downloaded file** in File Explorer.

   ![Extract](https://i.postimg.cc/WbW0kbby/image.png)  

3. **Move the extracted folder** into this project directory.

   ![Copy Folder](https://i.postimg.cc/N07hdnnW/image.png)  
   ![Paste Folder](https://i.postimg.cc/SQ1B1Cg1/image.png)

4. After completing the steps, your folder structure should look like this:

   ![Correct Structure](https://i.postimg.cc/6phJ0Sgj/image.png)

   If it looks like:


   ![Incorrect Structure](https://i.postimg.cc/bJpZ5Kw2/image.png)


   Then that means you copied it one level too high.
---

Create a `.env` file in the root directory and configure the `DATABASE_URL` using the guide below.

### Getting the Database URL

1. Open the search menu in Supabase. (Top Right)

![Search Menu Button](https://i.postimg.cc/PJYjH77x/image.png)


2. Search for `connection string`.
3. Navigate to **Direct** > **Session pooler** > **shared pooler** and copy the provided connection string.


![Shared Pooler](https://i.postimg.cc/HWhck8hj/image.png)

4. Replace `[YOUR-PASSWORD]` with the database password you created during setup. Ensure you remove the square brackets. If you have forgotten your password, see the reset instructions below.

5. Set this url as the `DATABASE_URL` in your `.env` file.


![Env Filled](https://i.postimg.cc/tgCTtFSC/image.png)
### Resetting the Database Password

If you have forgotten your database password, you can reset it by navigating to **Database** > **Settings** (under Configuration).
![Reset Database Password](https://i.postimg.cc/XJwWShmc/image.png)

## Running the Script

Run the following command in your terminal from the project folder:

```bash
npm install
node index
```

> **Note:** Do not worry if the console displays `No rows (.sql) file found in folder 'accounts'. Moving on.` This is the intended behavior.
