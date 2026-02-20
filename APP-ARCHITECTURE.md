# Power Prayer App — What Syncs vs What's In-App

This doc clarifies what the App Store build does: **only account and prayer forms** use the website inside the app; **everything else** is built into the app so the experience is native and App Store–friendly.

---

## Synced with the website (loaded inside the app)

These open **in the app's iframe** so login, membership, and data stay on your site. One account everywhere.

- **Login** — Website login page  
- **Register** — Website registration  
- **Dashboard** — User dashboard (profile, etc.)  
- **Prayed** — Prayed list  
- **Requests** — Prayer requests  
- **All other prayer forms** — Prayers Home, Ask Journal, Altar, Healing, Salvation, Jehoshaphat, Bank, Forgive, Red Letters (link), etc.

So: **becoming a member and using prayer forms = synced with the website** inside the app. No duplicate auth; the app shell just shows your site in an iframe.

---

## Built into the app (native or in-app UI)

These are **rebuilt inside the app** (or shown in a dedicated in-app view). They use your site's APIs where needed but the UI is app-native so the experience is consistent and App Store–acceptable.

- **Red Letters** — Fetches from your API; rendered natively in the app  
- **Dream Interpreter** — In-app chat UI; calls your dreambot API  
- **Biblical Counsel** — In-app chat UI; calls your counsel API  
- **Urim & Thummim** — In-app chat UI; calls your chatbot3 API  
- **Spousal Translator** — In-app UI; calls your translator API  
- **P48X Reflections** — In-app journal UI; same backend (p48x_ajax), including **Google Calendar sync** (Connect Google + Activate Daily Schedule); design matches or exceeds the website  
- **David vs Goliath** — Game runs inside the app (local or from your site)  
- **Bible Map** — Shown in-app (iframe to your map page)  
- **Vitamins / Battle Sword** — Opened in the app (iframe to your site) so they're one tap from the menu  

So: **Red Letters, chatbots, P48X, David vs Goliath, Bible Map, Vitamins, Battle Sword** are all **inside the app**; only login, membership, dashboard, prayed, requests, and prayer forms are "pulled from the website" in the sense of loading your full web pages in the iframe.

---

## Summary for App Store

- **One account:** Users log in and register on your website (inside the app). Dashboard, prayed, requests, and prayer forms use that same session.  
- **Rest is in-app:** Reading (Red Letters), tools (chatbots, P48X, Translator), game (David vs Goliath), map, Vitamins, Battle Sword are all part of the app experience.  
- **No duplicate auth:** The app does not implement its own login system; it uses your site.  
- **Codemagic / iOS:** Build from this repo (e.g. `localapp/`). No secrets in the repo; config comes from your server when the app runs on your domain.
