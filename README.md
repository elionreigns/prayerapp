# Power Prayer App (prayerapp)

Full Power Prayer app with native in-app screens that cross-sync with [Prayer Authority](https://www.prayerauthority.com). Use on the web at **https://www.prayerauthority.com/app/** or build for iOS/Android with Capacitor.

## Contents

- **localapp/** — Capacitor app (www = web shell; native tools: Red Letters, Dream Interpreter, Biblical Counsel, Urim & Thummim, P48X, Spousal Translator, David vs Goliath, Bible Map). Login, registration, dashboard, and prayers open in iframe and sync with the site.
- **SEE-IT-LIVE-AND-APPSTORE.md** — **Start here:** see the app live (no Vercel/env vars) and package for App Store after the $99 developer license.
- **APP-LOGIN-AND-CHATBOT-FLOW.md** — How login and chatbots work when someone downloads the app (synced with the website; one session, one account).
- **APP-ARCHITECTURE.md** — What loads from the site (iframe) vs what’s built into the app.
- **WHERE-APP-FILES-LIVE.md** — Where the app files live: repo (Codemagic/iOS) vs website `/app/` (browser).
- **HolyVibe.md** — Single source of truth; main vs localapp; data flow; App Store checklist.
- **HOST-APP-SHELL-FOR-PHONE.md** — Deploy the web app to `public_html/app/` so users can open it on their phone.
- **ENV-GITHUB-APPSTORE.md** — No env vars in the app; server config; what to push; App Store steps.
- **GITHUB-REPO-SETUP.md** — One-time repo and push instructions.
- **DEPLOY-THESE-TO-LIVE.txt** — Files to deploy to the live site (including app shell to `public_html/app/`).

## Deploy web app to site

Copy `localapp/www/*` to your server’s `public_html/app/`. Ensure `app-config.php` is at the site root so the app can load `SITE_URL` when opened from prayerauthority.com.

## Build native (iOS/Android)

From `localapp/`: `npm install`, `npx cap sync`. Open in Xcode/Android Studio or use CI (e.g. GitHub Actions, Codemagic). See ENV-GITHUB-APPSTORE.md and GITHUB-REPO-SETUP.md.
