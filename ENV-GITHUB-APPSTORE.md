# Environment variables, GitHub, and App Store

---

## 1. Do you need to set environment variables for the app?

**No.** The **Power Prayer app** (the HTML/JS shell and native screens) does not use environment variables. It only needs to know your site’s base URL.

- **When the app runs on your site** (e.g. at `https://www.prayerauthority.com/app/`): it fetches **`/app-config.php`** once. That endpoint reads **SITE_URL** from your server’s **config** (e.g. `public_html/prayers/config.php` or your main `config.php`) and returns only that. So you change the URL in **one place** (your server config), and the app uses it. No env vars in the app.
- **When the app runs on localhost** (preview) or in the **iOS build**: it uses the fallback in **`www/js/config.js`** (e.g. `SITE_URL: 'https://www.prayerauthority.com'`). You can leave that as-is; the live app at `/app/` will override it via `app-config.php`.

**Server-side (your website):**  
Your PHP config (e.g. `config.php`, `prayers/config.php`) holds SITE_URL, API keys, DB credentials, etc. You can keep using that file. If you prefer **environment variables** on the server (e.g. for different environments), you would set them on the **host** (cPanel, .env, or your server’s env) and have **config.php** read them, e.g. `define('SITE_URL', getenv('SITE_URL') ?: 'https://www.prayerauthority.com');`. That’s optional and only affects the server; the app still gets SITE_URL from **app-config.php**, which uses whatever your config defines.

**Summary:**  
- **App:** No env vars. It gets SITE_URL from `app-config.php` when on your domain, or from `config.js` when on localhost/Capacitor.  
- **Server:** Keep using your existing config file; optionally move values to server env and read them in config.php.  
- **Never** put API keys or secrets in the app or in GitHub.

---

## 2. Getting the app on GitHub

You **don’t have to** use GitHub to run the app (e.g. at `/app/` or on your phone). You use GitHub when you want:

- Backup and version control  
- Building the **iOS app** in the cloud (Codemagic, GitHub Actions)  
- Editing the project from another computer  

**What to push (no secrets):**

- Push the **app** folder(s): e.g. **`localapp`** (or **`power-prayer`**) and any docs (HolyVibe.md, DEPLOYMENT.md, etc.).
- **Do not push:** `config.php`, any file with API keys, DB credentials, OAuth client secrets, or the main site’s `public_html` (unless it’s a separate repo with no secrets). The app repo should contain **only** the app (HTML/JS/CSS, Capacitor config, `config.js` with the default SITE_URL).  
- **`app-config.php`** is on the **server** (in `public_html/`). It is not part of the app repo; the app just **calls** that URL when it runs on your site.

**Steps:**

1. Create a **new repo** on GitHub (e.g. `elionreigns/prayer-authority-app`). Leave it empty (no README yet).
2. On your PC, open a terminal in the folder that has your app (e.g. the folder that contains `localapp` or `real applications`).
3. Initialize and push only the app (and docs you want), for example:

   ```bash
   cd "c:\Users\erict\OneDrive\Desktop\Cursor Sites #2\PRAYER AUTHORITY 2026\2-17-public_html"
   git init
   git add localapp real applications/HolyVibe.md real applications/DEPLOY-FROM-PC.md real applications/ACCESS-FROM-ANYWHERE.md real applications/HOST-APP-SHELL-FOR-PHONE.md real applications/ENV-GITHUB-APPSTORE.md real applications/GITHUB-REPO-SETUP.md
   git add real applications/power-prayer
   git status
   ```

   Make sure **no** `config.php` or secret files are listed. Add a **`.gitignore`** if needed:

   ```
   config.php
   .env
   *.pem
   node_modules/
   ios/App/Pods/
   ```

   Then:

   ```bash
   git commit -m "Power Prayer app (localapp + main), HolyVibe, deploy docs"
   git branch -M main
   git remote add origin https://github.com/elionreigns/prayer-authority-app.git
   git push -u origin main
   ```

   (Use your real repo URL.)

4. If you use **GitHub Actions** to build iOS: add your **Apple Developer** and (optionally) **App Store Connect** secrets in the repo’s **Settings → Secrets**. See **GITHUB-REPO-SETUP.md** and **DEPLOY-FROM-PC.md**.

---

## 3. Getting the app into the Apple App Store

1. **Apple Developer Program** — Enroll at [developer.apple.com/programs](https://developer.apple.com/programs) ($99/year).
2. **Build the .ipa**  
   - **Option A:** On a **Mac** with Xcode: open the app project (e.g. `localapp` or `power-prayer`), run `npm install`, `npx cap sync ios`, `npx cap open ios`, then **Product → Archive → Distribute App** to App Store Connect.  
   - **Option B:** From a **PC** (no Mac): push the app to **GitHub**, then use **Codemagic** or **GitHub Actions** to build the .ipa in the cloud. Point the build to the folder that has the app (e.g. `localapp` or `real applications/power-prayer`). See **DEPLOY-FROM-PC.md**.
3. **App Store Connect** — Create the app (bundle ID e.g. `com.prayerauthority.powerprayer`), upload the build, fill in description, screenshots, keywords, category, age rating, **privacy policy URL**, and price. Complete **App Privacy**. Submit for review.

The app does **not** need any environment variables for the store. It only needs your site to be live so that when users open the app, it can load login and APIs from your domain; **SITE_URL** is in `config.js` (and, when run on your site, from **app-config.php**).

---

## 4. Quick reference

| Question | Answer |
|---------|--------|
| Set env vars in the app? | No. App uses `config.js` and, on your site, `app-config.php`. |
| Set env vars on the server? | Optional. Keep using config.php; optionally read from server env there. |
| Push config.php to GitHub? | No. Never push secrets. |
| What to push to GitHub? | App folder(s) (localapp and/or power-prayer), HolyVibe, deploy docs. No config.php, no public_html with secrets. |
| Build for App Store without a Mac? | Push to GitHub, then use Codemagic or GitHub Actions (see DEPLOY-FROM-PC.md). |
| Where does SITE_URL come from? | From `app-config.php` when the app is at prayerauthority.com; from `config.js` on localhost/Capacitor. |
