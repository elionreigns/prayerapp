# HolyVibe — Vision, Vibe Code & How to Make It All Possible

**Single source of truth** for the **Power Prayer** (and later Complimentinator) iPhone apps: what you want, how the app holds data, main app vs localapp, App Store readiness, and vibe/technical approach. Keep this doc updated so anyone (or AI) knows the full picture.

---

## Part 1: Summary of What You’ve Asked For (This Conversation)

### Two apps
- **Power Prayer** — Full suite: prayers, chatbots, tools, Spiritual Gifts, P48X, Red Letters, etc., in one iPhone app with a hamburger menu.
- **Complimentinator** — Standalone iPhone app: the ’90s-style Complimentinator with UK voices, graphics, power on/off, audio; same account as the site.

### Account & auth (synced with the site)
- Users must **log in / create an account** to get full access.
- **Registration and login are synced with the website** — one account for site and apps.
- **Google Sign-In / OAuth** — Same flow as on the site (e.g. petition.php); users can register or log in with Google in the app.
- After login, they get the **full experience**: saved history, chatbots, reflections, Spiritual Gifts results, etc.

### Power Prayer content and menu
- **Account:** Login, Register, Dashboard (can be embedded/iframe from the site so auth is identical).
- **Prayers (only these):** Prayers Home (index), Ask Journal, Altar, Healing Prayer, Salvation, Jehoshaphat, Bank, Requests, Prayed, **Forgive**, **Red Letters** (and everything related to Red Letters).
- **Tools & chatbots:** Dream Interpreter, Biblical Counsel, Urim & Thummim, **Spiritual Gifts Test** (as its own app-like flow — take test, save, show top 3; can retake and update), Spousal Translator, P48X Reflections, Vitamins, Battle Sword, David vs Goliath, Bible Map.

### Spiritual Gifts Test
- Accessible from the dashboard on the site; in the app it should be **a first-class “app”** like Dream Interpreter or Urim.
- User can take the test, **save results**, see **top 3** (like on the dashboard), **retake** and update; all **saved in the app** and synced (via your backend) so they can access everything after login.

### Red Letters
- **Many files and JSONs** on the site: `redletters.php`, `redletters_api.php`, `data/redletters_web.json`, `redletters_refs.json`, `redletters_kjv.json`, `redletters_amp.json`, builder scripts, etc.
- You want a **separate, dedicated version** of Red Letters in the app: **freshly built UI**, same content and API, but designed as a proper in-app experience (not just an iframe of the site).
- **Only thing that should be “synced” with the site** in the sense of shared secrets: the **config** (API keys, codes, etc.). That config must **never** live in the app; it stays on the server and is used only by your backend.

### Config and API safety
- Site uses **config.php** (SITE_URL, API keys for Bible, OpenAI, Google, ElevenLabs, etc., DB credentials, Google OAuth client id/secret, secret codes for Urim/Counsel/Translator/Dreams).
- **Do not put API keys or secrets inside the app binary.** The app should get the **full benefit** of the site (all features, APIs, chatbots) by **calling your server** after login; the server has the config and does the work.
- Options: (1) App loads site pages in WebView/iframe (session cookie = already logged in; server has config). (2) App uses a **fresh native UI** and calls your **backend APIs** (e.g. `/prayers/ajax_login.php`, `/prayers/redletters_api.php`, chatbot endpoints); config stays on server; app only gets session cookie or token after login.

### UI and vibe
- **Blue and yellow theme**, **intuitive iPhone** feel.
- **Futuristic animations** as they navigate (smooth, modern transitions).
- **Holy of Holies / Solomon’s Temple** feel: like the glory cloud after Solomon’s sacrifices, or the dream where God appeared to Solomon and blessed him for asking for wisdom — weighty, sacred, beautiful, not gimmicky.

### Complimentinator app
- **UK voices**, **graphics** that look good, **power on/off**, **audio** when turning on/off — **no missing features** from the site; build it so the same experience (or better) lives in the app, with account synced.

### Store and deployment
- **$10** on the App Store; one-time purchase so people can use the chatbots and tools fully.
- **Store display:** title, description, keywords, What’s New, etc., ready for App Store Connect.
- **Deployment:** App should be **fully ready** for submission; you may not have Xcode/Mac yet — when you do (and after the **$99/year Apple Developer** signup), you can build and submit.
- **Localhost preview:** So you can **see the app** (shell, menu, flow) in the browser before submitting; dependencies installed, `npm run preview` / `npm run preview:open` to load it fully on localhost.

### Build approach
- **“Real applications”** folder: build the iPhone app **from scratch** in terms of UI and structure, but **reuse** the site’s backend, auth, and data so users get “the most out of what we have on the site” in the **comfort of a dedicated iPhone app** with a **great UI** and **all the features** (and room for more).

---

## Part 2: Red Letters — What Exists & How to Build the App Version

### What’s on the site
- **redletters.php** — Main page: session, config, header, layout; loads data via JS from the API.
- **redletters_api.php** — Returns JSON; reads `data/redletters_web.json`, remaps keys (Melchizedek, Angel of the LORD, Matthew, Mark, Luke, John, Revelation), no API keys exposed.
- **data/redletters_web.json** — Words of Christ (WEB); structured by section.
- **data/redletters_refs.json**, **redletters_kjv.json**, **redletters_amp.json** — Other versions/refs.
- **redletters_build_*.php**, **data/redletters_builder_core.php** — Build/processing; not needed for the app’s read-only experience.

### App approach: “separate version”
- **Option A (recommended):** Build a **dedicated Red Letters screen** in the app (new UI, blue/yellow, Holy of Holies vibe). On load, the app calls **your** `https://www.prayerauthority.com/prayers/redletters_api.php`. No secrets in that API — it’s public JSON. The app renders the sections (Melchizedek, Angel of the LORD, Matthew, Mark, Luke, John, Revelation) with native-style list/detail, search, and smooth animations. **Config stays on server;** the API is just file-backed JSON.
- **Option B:** Bundle a **copy** of `redletters_web.json` (or a stripped version) inside the app so Red Letters works offline; optional “Refresh” to pull from the API when online. Still no config in the app.
- **Sync with site:** Only in the sense that the **data** comes from the same source (your API or same JSON). No API keys or config in the app.

---

## Part 3: Config & API Safety — “Connect After They Login”

### Principle
- **Secrets (API keys, DB, OAuth client secret)** live only in **config.php** on the server, never in the app binary.
- The app **connects** to the site after login: either by loading your pages in a WebView (same session) or by calling your backend with the session cookie / token.

### Ways to “safely connect” so the app gets the full site experience

1. **WebView / iframe (current Power Prayer shell)**  
   - App shell is native (menu, theme); content area loads `https://www.prayerauthority.com/...` (login, dashboard, prayers, tools).  
   - User logs in on your site (or in an embedded login page); session cookie is in the WebView.  
   - Every tool (Red Letters, chatbots, Spiritual Gifts, etc.) runs on **your server**; server has config and API keys.  
   - **Pros:** No config in app; full site behavior and Google OAuth as on the web. **Cons:** UI is the website’s UI inside the app (unless you replace sections with native screens that call APIs).

2. **Hybrid: native UI + backend APIs**  
   - App has its **own screens** (e.g. Red Letters list/detail, Spiritual Gifts flow, P48X).  
   - Auth: load your **login/register** page in WebView once (or use Google Sign-In SDK in the app and your backend endpoint to create/link session). After login, app stores session cookie or token.  
   - All **data** and **AI** calls go to your domain:  
     - `GET /prayers/redletters_api.php`  
     - `POST /prayers/ajax_login.php`, `/translator/chatbot_api.php`, etc.  
   - Your server reads **config.php** and uses API keys; the app never sees them.  
   - **Pros:** Great native UI, full control, config stays on server. **Cons:** More app-side work; OAuth in-app may need Google Sign-In SDK + backend session endpoint.

3. **“App config” endpoint (optional)**  
   - Expose a **non-secret** endpoint, e.g. `GET /api/app-config.php` (or with auth), that returns only:  
     - `SITE_URL`, feature flags, maybe Red Letters API URL.  
   - No API keys, no DB credentials. App uses this for base URLs and toggles only.

### Recommendation
- **Short term:** Keep the **shell + WebView/iframe** approach so login, Google OAuth, and every tool (including Red Letters) run on the site; config stays on server; you get one account everywhere.  
- **Next step:** Replace high-value screens (e.g. Red Letters, Spiritual Gifts, P48X) with **native screens** that call the same APIs (`redletters_api.php`, spiritual gifts save/fetch, p48x endpoints); auth still via your site (cookie or token). That gives the “freshly built with a great UI” feel while keeping config and secrets only on the server.

---

## Part 4: Vibe Code — Holy of Holies, Solomon, Glory Cloud

### Theme
- **Blue and yellow (gold):** Deep blues (tabernacle veil, night sky), gold/amber (glory, fire, wisdom).  
- **Holy of Holies:** Weight, reverence, “set apart”; subtle gradients (dark blue → soft gold), soft glow, not flashy.  
- **Solomon’s dream:** God appearing, choosing wisdom — clarity, light, peace; animations feel “blessed” and purposeful.

### UI ideas
- **Navigation:** Smooth, “futuristic” but sacred: soft fade/slide between screens; optional subtle particle or light streak on key transitions; no harsh motion.  
- **Headers / cards:** Slight gold border or inner glow; typography clear and dignified (e.g. serif for titles, clean sans for body).  
- **Lists (prayers, tools, Red Letters sections):** Cards or rows with soft shadow; tap feedback with a brief glow or scale.  
- **Red Letters screen:** Section headers (Melchizedek, Matthew, John, etc.) with a thin gold line or icon; verses in a readable, warm background; optional “glory” gradient behind the title.  
- **Empty / loading:** Gentle pulse or soft light instead of a generic spinner.

### Code-level vibe
- **CSS:** `--holy-blue`, `--holy-gold`, `--glow-soft`; transitions 0.3–0.5s ease; optional `backdrop-filter` for glass panels.  
- **Animations:** Prefer `transform` and `opacity`; optional `@keyframes` for a soft “glow breathe” on focus elements.  
- **Copy:** Short, clear; where it fits, a line like “Ask for wisdom” or “Words of Christ” to tie to the Solomon / Red Letters theme without overdoing it.

---

## Part 5: Ideas to Make It All Possible

### Auth (registration + login + Google OAuth)
- **Keep using your site’s login/register and Google OAuth** inside the app (WebView or in-app browser) so the same flow and session are used.  
- **Or:** Add an **app-specific endpoint**, e.g. `POST /api/app-login.php`, that accepts Google ID token (from Google Sign-In SDK in the app), validates it server-side, creates or finds the user, starts a session, returns a cookie or short-lived token. App then sends that cookie/token on API requests. Config (Google client id/secret) stays in config.php.

### Spiritual Gifts: app-like flow, save, top 3
- **Current:** Dashboard links to `spiritual_gifts_test.php`; results saved (e.g. in DB or session).  
- **In app:** Either (1) load that page in WebView (same save/top 3 as site), or (2) build a **native flow**: steps in-app, submit to your backend (e.g. save endpoint); a “Results” screen shows **top 3** from the same backend/dashboard data; “Retake” posts again and updates. Backend uses config and DB; app only sends answers and gets results.

### Red Letters: full experience in-app
- **Data:** App calls `redletters_api.php` (or bundled JSON for offline).  
- **UI:** New screen: sections → verses; search; optional “favorite” or “copy” stored locally or via a small backend endpoint. No config in app; API is public or session-optional.

### Complimentinator: no missing features
- **Either:** Load `https://www.prayerauthority.com/complimentor/` in the app (same UK voices, power on/off, audio, graphics), or **replicate** the UI and logic in the app and call your backend for “save compliment” (or use local storage for saves). If replicated, ensure power on/off, audio, and voice (UK) are all implemented so nothing is missing.

### One account, full site benefit
- **Login once** (site or app, same account).  
- **Server** holds config and runs all APIs (chatbots, Bible, dreams, counsel, translator, Spiritual Gifts, P48X, Red Letters data, etc.).  
- **App** is the “comfort of a dedicated iPhone app” with great UI; it either embeds the site or calls the same backend so users “get the most out of what we have on the site and more.”

---

## Part 6: File and JSON Reference (Red Letters)

| File | Purpose |
|------|--------|
| `prayers/redletters.php` | Main page; session, config, header; front-end loads API. |
| `prayers/redletters_api.php` | Public JSON API; reads `data/redletters_web.json`; remaps keys for front end. |
| `prayers/data/redletters_web.json` | Words of Christ (WEB) by section. |
| `prayers/data/redletters_refs.json` | Reference data. |
| `prayers/data/redletters_kjv.json` | KJV data (if used). |
| `prayers/data/redletters_amp.json` | AMP data (if used). |
| `prayers/data/redletters_ref_web.json` | WEB refs. |
| `prayers/redletters2_clean.php` | Alternate/clean page. |
| `prayers/redletters_build_*.php` | Build/worker scripts; not needed for app read experience. |
| `config.php` (root) | SITE_URL, API keys, DB, OAuth; **server only**, never in app. |

For the **app’s “separate” Red Letters version**, the only dependency is the **data shape** from `redletters_api.php` (or the JSON files). Build a new UI in the app that consumes that API; config stays on the server and is not “in” the app — the app “connects” to the site after login and uses these endpoints.

---

## Part 7: Summary in One Paragraph

You want **two iPhone apps** (Power Prayer and Complimentinator) that feel **freshly built** with a **great, intuitive UI** (blue & yellow, Holy of Holies / Solomon / glory cloud vibe, futuristic but sacred animations). **Registration and login are synced with the website**, including **Google OAuth**; **only the server** holds **config and API keys** — the app connects after login and gets the full site experience (prayers, chatbots, Spiritual Gifts, P48X, Red Letters, etc.) in the comfort of a dedicated app. **Red Letters** should have a **dedicated in-app version** (separate from the site page) using the same API/JSON but with its own UI; **Spiritual Gifts** is a first-class flow with save and top 3, synced with the backend. The app is **ready for deployment** (localhost preview now; when you have a Mac and the $99/year developer account, build and submit); **$10** one-time on the App Store with store copy ready. **HolyVibe** is the vibe code and idea doc: how to keep config safe, how to sync auth, and how to build each piece so the app delivers everything the site has and more.

---

## Part 8: GitHub repo & deploy from PC (no Mac)

### GitHub repo: elionreigns/prayerapp
- **What’s in the repo:** The **app** (localapp/ — Capacitor app), HolyVibe.md, APP-ARCHITECTURE.md, DEPLOY-THESE-TO-LIVE.txt, deploy/app_login_status.php, and related docs. **No** config.php, API keys, DB credentials, or OAuth secrets.
- **Public vs private:** The repo can be **public** as long as it contains **no secrets**. The app only has `SITE_URL` (e.g. `https://www.prayerauthority.com`) in `www/js/config.js`; that is not secret. All real APIs and Google OAuth run on your **server** (prayerauthority.com); the app loads login/register and tools from the site, so config never leaves the server. If you ever add site code or config templates to the repo, use **private** and keep `config.php` in `.gitignore`.
- **Deploy from PC:** Use **Codemagic** (connect repo, configure build + signing in UI) or **GitHub Actions** (workflow in repo; add `DEVELOPER_TEAM_ID` and optional App Store Connect API key as secrets). Both run macOS in the cloud and build the .ipa; you never need a Mac. See DEPLOY-FROM-PC.md.

### What’s built today (meets your requirements) — **DONE**
- **Repo:** **elionreigns/prayerapp** (this repo). **App Store build source:** `localapp/` — build from here with Codemagic (or Xcode) for iOS.
- **What syncs with the website (iframe only):** Login, Register, Dashboard, Prayed, Requests, and **all prayer forms** (Prayers Home, Ask, Altar, Healing, Salvation, Jehoshaphat, Bank, Forgive, Red Letters link, etc.). One account; membership and prayer data stay on the site. See **APP-ARCHITECTURE.md**.
- **What’s built into the app (native or in-app UI):** Red Letters (API + cache), Dream Interpreter, Biblical Counsel, Urim & Thummim, Spousal Translator, **P48X Reflections** (with Font Awesome icons, Google Calendar “Connect” + “Activate Daily Schedule,” warm calendar card styling, empty state “There are no entries yet”), David vs Goliath (local game), Bible Map (in-app iframe). Vitamins and Battle Sword open in-app (iframe to site). Spiritual Gifts Test opens in iframe (site). Same shell and menu; **login state:** header shows **username + green dot** when logged in; drawer shows “Signed in as [name].” (Requires **app_login_status.php** on live site — see DEPLOY-THESE-TO-LIVE.txt.)
- **App storage:** Last path, optional start path, Red Letters cache. No API keys or secrets in repo; only SITE_URL (from app-config on your server when hosted).
- **App Store readiness:** Repo is **pushed to GitHub** and ready for Codemagic. You still need: Apple Developer Program ($99/year), privacy policy URL on your site, App Store Connect listing (description, screenshots, etc.), then build → upload .ipa → submit. See checklist in Part 9.
- **Next (optional, not required for this submit):** Spiritual Gifts as native flow with save/top 3; Sign in with Apple if required; Complimentinator as second app.

### Localhost: see the app before deploying
- **From this repo:** `cd localapp` → `npm install` → `npm run preview` → open the URL shown (e.g. http://localhost:3336) or open `localapp/www/index.html` in a browser. You’ll see the full shell, login state (after logging in on the site in the iframe), native Red Letters, Dreams, Counsel, Urim, P48X (with icons and calendar), Translator, David vs Goliath, Bible Map; Vitamins/Battle Sword and all prayers in iframe.

---

## Part 9: Single source of truth — What you want & how it works

### What you want (summary)
- **One Power Prayer app** (and later Complimentinator) with **full suite**: prayers, chatbots, tools, Red Letters, P48X, Spiritual Gifts, David vs Goliath, Bible Map, etc.
- **Registration and login synced with the website**; Google OAuth; one account for site and app. **Config and API keys only on the server** — app never holds secrets.
- **Main tools “built on our end”** where possible: Red Letters, Dream Interpreter, Biblical Counsel, Urim & Thummim, Spousal Translator, P48X Reflections, David vs Goliath, Bible Map — either **native in-app screens** that call your APIs, or (for David vs Goliath) the **game files in the app** so it doesn’t rely on the site. Prayers index and prayer forms can stay as site (iframe) or match site behavior.
- **App “holds” information** for the main applications: **last screen** and **preferences** (e.g. start screen) in **localStorage**; optional **cache** (e.g. Red Letters 24h) so content feels instant and works better offline. **Account data and saved content** (prayers, journal, chatbot history) stay on the **site/backend**; app is the client.
- **Holy of Holies / Solomon vibe**: blue & gold, sacred, futuristic but not gimmicky; smooth transitions.
- **App Store ready**: $10 one-time; privacy policy URL; deploy from PC (Codemagic/GitHub Actions); localhost preview so you can see it before submitting.

### App variant for App Store (this repo)
| What | Where | Use case |
|------|--------|----------|
| **App Store build** | `localapp/` in this repo (elionreigns/prayerapp) | Native screens for Red Letters, Dreams, Counsel, Urim, P48X (with icons + calendar), Translator, David vs Goliath, Bible Map; Vitamins/Battle Sword + prayers in iframe. Login state in header + drawer. **Build from `localapp/` with Codemagic** for iOS. See **APP-ARCHITECTURE.md** for what syncs vs what’s in-app. |

### How the app holds information
- **On device (localStorage):** Last path, optional start path, Red Letters cache (24h). Not sent to server unless user submits a form.
- **On server (site/APIs):** Login/session, prayer requests, journal, chatbot history, P48X entries, Spiritual Gifts results. App calls your APIs with session cookie (or token); config and keys stay in config.php.

### App Store acceptance checklist (your remaining steps)
- [ ] **Apple Developer Program** — Pay $99/year and enroll.
- [ ] **Privacy policy** — URL https://www.prayerauthority.com/prayers/privacy.php; set in App Store Connect. Link in app (drawer → Legal & Support) is already included.
- [x] **Demo account for App Review** — **Done.** User **dem0** / password **0med** (created via create_demo_user.php); full access to all chatbots (no secret codes). Put dem0 / 0med in App Store Connect → App Review Information → Notes. Exact text: **APP-STORE-SUBMISSION.md**.
- [ ] **App Store Connect** — Create the app; fill description, screenshots, keywords, category, age rating, price; complete App Privacy; set Support URL. Use **APP-STORE-SUBMISSION.md** for what to send (demo, privacy URL, support URL, notes).
- [ ] **Deploy live site files** — Upload everything in DEPLOY-THESE-TO-LIVE.txt (including **app_login_status.php** and the site files listed there for privacy + demo bypass). One-time: run create_demo_user.php to create dem0 (then delete that file).
- [ ] **Build & submit** — Connect this repo to **Codemagic** (free tier: 500 build min/month — no cost for typical use). Build from `localapp/`; upload .ipa; complete **BEFORE-YOU-SUBMIT.md**; submit. See **CODEMAGIC-SETUP.md** and **APP-STORE-SUBMISSION.md**.
- [x] No API keys or secrets in the app repo; only SITE_URL from your server. **Done.**
- [x] App requirements met: login/prayers synced with site; Red Letters, chatbots, P48X, David vs Goliath, Bible Map, Vitamins, Battle Sword in-app; P48X beautiful (icons, calendar, empty state); username + green dot when logged in; Privacy Policy + Contact in drawer; demo account with full chatbot access. **Done.**

### Requirements status — we’re done for your stated scope
Your requirements for the **Power Prayer app** (so it’s ready for Codemagic → iOS → App Store after you pay the $99 developer fee) are **met**:

| Requirement | Status |
|-------------|--------|
| **Login / membership synced with website** (Login, Register, Dashboard, Prayed, Requests, all prayer forms in iframe) | Done — one account; session shared. |
| **Red Letters, Bible Map, chatbots, P48X, David vs Goliath, Vitamins, Battle Sword** in the app (not all pulled from website; built in-app or in-app view) | Done — native/in-app for Red Letters, Dreams, Counsel, Urim, Translator, P48X, David vs Goliath, Bible Map; Vitamins/Battle Sword open in-app (iframe). |
| **P48X** looks beautiful, not barebones; **Google Calendar sync** (Connect + Activate Daily Schedule); **colors/icons** match or beat the site; **empty state** “no entries yet” not “could not load journal” | Done — Font Awesome icons on qualities + calendar buttons; warm calendar card; empty copy and error copy updated. |
| **Logged-in state in app:** **username at top + green dot**; drawer shows **“Signed in as [name]”** | Done — `app_login_status.php` on site; header and drawer wired. |
| **Repo ready for Codemagic** so you can build iOS and submit to App Store | Done — elionreigns/prayerapp pushed; build from `localapp/`. |

**Nothing else is required in the codebase** for this scope. Your remaining steps: pay Apple $99; deploy site files (DEPLOY-THESE-TO-LIVE.txt); set up App Store Connect using **APP-STORE-SUBMISSION.md** (demo dem0/0med, privacy URL, support URL); connect Codemagic to this repo → build → upload .ipa → submit.

**Codemagic:** Free tier = 500 build minutes/month — **no cost** for typical use. After signup: connect GitHub (elionreigns/prayerapp) → add Apple integration (App Store Connect API key) → code signing (bundle id com.prayerauthority.powerprayer) → start build → get .ipa. See **CODEMAGIC-SETUP.md**.

**App folder on site:** To make https://www.prayerauthority.com/app/ match the iOS build, upload **contents of localapp/www/** to **public_html/app/** and add `<base href="/app/">` in index.html on the server.

For **how login and chatbots work** when someone downloads the app (same session, same account, no “disconnect” from the website), see **APP-LOGIN-AND-CHATBOT-FLOW.md**.
