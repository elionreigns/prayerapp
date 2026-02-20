# See the app live + package for App Store

---

## 1. See it live (no Vercel, no env vars)

**You don’t need Vercel or any environment variables** for the app to work live. The app is designed to run on **your existing site** so it can use the same domain for login, APIs, and config.

### Best option: host on prayerauthority.com

1. **Upload these to your live server** (FTP/cPanel/File Manager), as in **DEPLOY-THESE-TO-LIVE.txt** (in your main project, or use the same paths):
   - `public_html/.htaccess` → your site’s `public_html/`
   - `public_html/security_config.php` → your `public_html/`
   - `public_html/prayers/header.php` → your `public_html/prayers/`
   - `public_html/app-config.php` → your `public_html/` (so the app can get SITE_URL)

2. **Upload the app folder:**  
   Upload the **contents** of **`localapp/www/`** (from this repo) into your site’s **`public_html/app/`** so you have:
   - `public_html/app/index.html`
   - `public_html/app/js/` (config.js, config-loader.js, app.js, storage.js)
   - `public_html/app/css/` (shell.css)
   - `public_html/app/games/` (for David vs Goliath)

   When the app is served at `/app/`, add `<base href="/app/" />` inside the `<head>` of `index.html` so assets load correctly.

3. **Open in a browser:**  
   **https://www.prayerauthority.com/app/**

The app will call `/app-config.php` on the same domain and get `SITE_URL` from your server config. No env vars in the app; everything stays on your server.

---

## 2. What about Vercel?

- **For “fully functioning”:** Hosting the app on **the same server as your site** (above) is the best option. Login, dashboard, and all APIs (dreams, counsel, prayers, etc.) are on prayerauthority.com; same-origin avoids CORS and keeps config simple.
- **If you still want Vercel** (e.g. a separate URL like `prayerapp.vercel.app`): you’d deploy the `localapp/www` folder as a static site, then either:
  - Set **one** build-time or runtime env var for the **site URL** (e.g. `SITE_URL=https://www.prayerauthority.com`) so the app knows where to load login and APIs, and
  - Allow your Vercel origin in CORS on your PHP backend (e.g. in `app-config.php` and any API endpoints).
- **Recommendation:** Use your current host for the app at **https://www.prayerauthority.com/app/** and skip Vercel unless you have a specific reason (e.g. CDN, preview URLs). No env vars needed on your host for the app to work.

---

## 3. Package for the App Store (after the $99 developer license)

1. **Apple Developer Program**  
   Enroll at [developer.apple.com/programs](https://developer.apple.com/programs) — **$99/year**. You need this before you can submit to the App Store.

2. **Build the iOS app**  
   This repo uses **Capacitor** (in `localapp/`). You have two ways to build:

   **Option A — On a Mac with Xcode**  
   - Clone this repo (or open your local copy).
   - In a terminal:
     ```bash
     cd localapp
     npm install
     npx cap sync ios
     npx cap open ios
     ```
   - Xcode opens. Select your **Team** (Apple Developer account) under **Signing & Capabilities**.
   - **Product → Archive**, then **Distribute App → App Store Connect**.

   **Option B — From a PC (no Mac)**  
   - Your code is already on GitHub (this repo).
   - Use a cloud build service:
     - **Codemagic** ([codemagic.io](https://codemagic.io)): connect this GitHub repo, set app path to `localapp`, add your Apple Developer credentials, and run an iOS build. It produces an .ipa you upload to App Store Connect.
     - **GitHub Actions**: add a workflow that runs on a Mac runner, runs `npm install`, `npx cap sync ios`, then builds and archives. You’d add repo secrets for your Apple certs/team ID. (See **GITHUB-REPO-SETUP.md** if you add a workflow.)

3. **App Store Connect**  
   - Go to [App Store Connect](https://appstoreconnect.apple.com).
   - **My Apps → + → New App**. Choose iOS, name (e.g. “Power Prayer”), bundle ID (e.g. `com.prayerauthority.powerprayer` — should match `localapp/ios/App/App/` in Xcode).
   - After the first successful upload from Xcode/Codemagic: select the build, add **description**, **screenshots**, **keywords**, **category**, **age rating**, **Privacy Policy URL**, and **price** (e.g. free or $0.99). Complete **App Privacy**.
   - Submit for review.

The app does **not** need environment variables for the store. It uses `config.js` (and, when opened from your site, `app-config.php`) for `SITE_URL`; your site just needs to be live so login and APIs work when users open the app.

---

## 4. Quick answers

| Goal | What to do |
|------|------------|
| **See it live** | Upload `localapp/www/` contents to your site’s `public_html/app/` and the other files from DEPLOY-THESE-TO-LIVE.txt. Open **https://www.prayerauthority.com/app/**. No Vercel, no env vars. |
| **Env vars in Vercel?** | Not required. If you host on Vercel anyway, set SITE_URL and allow CORS from Vercel on your PHP backend. |
| **App Store** | Pay $99/year for Apple Developer → build with Xcode (Mac) or Codemagic/GitHub Actions (PC) from `localapp/` → upload to App Store Connect → fill listing and submit. |
