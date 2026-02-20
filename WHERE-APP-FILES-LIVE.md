# Where the app files live (and what Codemagic uses)

There are **two different places** the app shell (index.html, js/app.js, css/shell.css, etc.) can live. They serve different purposes.

---

## 1. GitHub repo → **Codemagic → iOS App Store** (native app)

**Location:** This repo (**elionreigns/prayerapp**) on GitHub.

**Folder that matters:** **`localapp/www/`**

- That’s where the app UI lives: `index.html`, `js/app.js`, `css/shell.css`, `js/config-loader.js`, `js/storage.js`, etc.
- **Codemagic** connects to this **GitHub repo**, builds from **`localapp/`** (the Capacitor project), and produces the **.ipa** you upload to App Store Connect.
- So: **the App Store build does not use anything from your website’s `/app/` folder.** It only uses what’s in the repo under `localapp/`.

**Summary:**  
**GitHub repo** = source of truth for the **native iOS app** (Codemagic → App Store).

---

## 2. Your website’s `/app/` folder → **browser** (web app)

**Location:** On your **live server** at **https://www.prayerauthority.com/app/**.

- On the server that’s usually: **`public_html/app/`** (or whatever your web root is).
- You get those files by copying the **contents** of **`localapp/www/`** from this repo (or from your workspace) **into** `public_html/app/`. So:
  - `localapp/www/index.html` → `public_html/app/index.html`
  - `localapp/www/js/` → `public_html/app/js/`
  - `localapp/www/css/` → `public_html/app/css/`
  - (and `games/` if you use David vs Goliath)
- When someone opens **https://www.prayerauthority.com/app/** in a **browser** (desktop or phone), they get this copy. No App Store, no Codemagic—just the web.

**Summary:**  
**Website `/app/`** = the **same app UI** served as a **web page** so people can use it in the browser. It’s a **deployment copy** of what’s in `localapp/www/`.

---

## Are they the same or different?

- **Same design, two deployments:**
  - **Repo `localapp/www/`** → used by Codemagic to build the **native iOS app** (App Store).
  - **Site `public_html/app/`** → **web** version at prayerauthority.com/app/ (you upload a copy of `localapp/www/` there).

- They can **get out of sync** if you change one place and don’t update the other. Best practice: **edit only in the repo (`localapp/www/`)**, then:
  1. Push to GitHub (so Codemagic gets the latest for the next iOS build).
  2. Upload the updated `localapp/www/` contents to `public_html/app/` if you want the browser version updated too (see DEPLOY-THESE-TO-LIVE.txt and HOST-APP-SHELL-FOR-PHONE.md).

---

## Quick reference

| Purpose | Where the files live | Used by |
|--------|----------------------|--------|
| **Native iOS app (App Store)** | **This repo: `localapp/www/`** (on GitHub) | Codemagic → .ipa → App Store Connect |
| **Web app (browser at prayerauthority.com/app/)** | **Your server: `public_html/app/`** | Users opening the URL in Safari/Chrome |

So: **yes, the `/app` folder on your website is different from what’s on GitHub.** The one on GitHub (inside **localapp/**) is what gets sent to Codemagic and then to the iOS App Store. The one on your site is a separate copy for the browser.
