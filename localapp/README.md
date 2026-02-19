# Power Prayer — Localapp (full native tools)

This folder is a **copy of the Power Prayer app** with **native in-app screens** for the main tools so they don’t rely on the site’s UI — only on the site’s APIs. Use this when you want the “built on our end” experience and optionally as the **App Store build**.

---

## What’s in the app

- **Same shell:** Holy of Holies blue/gold, hamburger menu, Account (Login, Register, Dashboard), Prayers, Tools.
- **Native screens (no iframe for these):**  
  Red Letters (API + 24h cache), Dream Interpreter, Biblical Counsel, Urim & Thummim, P48X Reflections, Spousal Translator, **David vs Goliath** (game files in `www/games/davidvsgoliath/` — runs locally), Bible Map (iframe to site map).
- **Still in iframe (site):** Login, Register, Dashboard, Prayers Home and all prayer forms (Ask, Altar, Healing, etc.), Spiritual Gifts Test, Vitamins, Battle Sword.
- **App storage:** Last screen and optional start path saved in localStorage; Red Letters cached for 24h so it loads instantly when possible. Same as main app; no server needed for this.

Config and API keys stay on the server; the app only has `SITE_URL` in `www/js/config.js`.

---

## Preview on localhost

1. **Install once:** `npm install`
2. **Start preview:** `npm run preview`
3. **Open in browser:** http://localhost:3336

(Port 3336 so it doesn’t conflict with the main app on 3335.)

You’ll see the shell and menu. Open Dream Interpreter, Red Letters, David vs Goliath, etc. from the menu — they open as native in-app screens. Prayers and account open the live site in the iframe.

---

## When you’re ready for the App Store

You can build the **store version** from this folder so the shipped app has all main tools built in-app. Same as main app: **Apple Developer Program**, Mac + Xcode or Codemagic/GitHub Actions. See **DEPLOYMENT.md** and the main **real applications/power-prayer/APP-ROADMAP-AND-STORE.md** for privacy policy, listing, and checklist.

**Quick build (on a Mac):**
```bash
npm install
npx cap sync ios
npx cap open ios
```
Then in Xcode: Team, Archive, Distribute to App Store Connect.

---

## Single source of truth

**HolyVibe.md** in `real applications/` is the single source of truth for what you want, main app vs localapp, how the app holds data, and App Store readiness. Keep it updated.
