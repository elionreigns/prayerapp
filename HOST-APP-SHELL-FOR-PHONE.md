# Use the app shell on your phone (e.g. at the beach)

You can use the **Power Prayer app shell** (blue/gold menu, hamburger, native Red Letters) on your phone in the **browser** — no need to build or install the iOS app. Just host the shell on your live site and open one URL.

---

## 1. Upload the app shell to your site

On your **live server** (prayerauthority.com), create a folder called **`app`** inside `public_html` and put the shell files there.

**From your PC:**

1. Open the folder:  
   `real applications\power-prayer\www`  
   (Or use `localapp\www` if you want the version with native Dreams, Counsel, Urim, etc.)

2. Upload **everything inside `www`** into your site’s **`public_html/app/`** folder so that:
   - `public_html/app/index.html` exists
   - `public_html/app/js/config.js` exists
   - `public_html/app/js/config-loader.js` exists (app pulls SITE_URL from your server)
   - `public_html/app/js/app.js` exists
   - `public_html/app/js/storage.js` exists
   - `public_html/app/css/shell.css` exists  

   So: the **contents** of `www` (index.html, js/, css/) go inside `public_html/app/`. Don’t upload a folder named `www` — only its contents.

   **Also upload** `public_html/app-config.php` to your site’s **`public_html/`** (root) if you haven’t already (see DEPLOY-THESE-TO-LIVE.txt). The app at `/app/` will call it to get SITE_URL from your config.

3. If you use **localapp** (native tools), also copy the **`games`** folder into `public_html/app/` so David vs Goliath works:  
   `localapp\www\games` → `public_html/app/games/`

**Using FTP/cPanel/File Manager:**  
- Create folder `app` in `public_html`.  
- Upload into `app`: `index.html`, and the folders `js`, `css` (and `games` if you used localapp).

---

## 2. Open it on your phone

On your phone (at the beach or anywhere), open the browser and go to:

**https://www.prayerauthority.com/app/**

You should see:
- Power Prayer header (blue/gold)
- “Application ☰ Navigation”
- Hamburger menu; tapping it opens Login, Prayers, Tools
- Main area loads the site (login, then whatever you pick)

Same app shell as on your computer; it just runs in the browser. Log in and use prayers, Red Letters, Dream Interpreter, etc., all from the shell.

---

## 3. Optional: “Add to Home Screen” (app-like icon)

On iPhone (Safari):
1. Open **https://www.prayerauthority.com/app/**
2. Tap the **Share** button
3. Tap **Add to Home Screen**
4. Name it “Power Prayer” and tap Add

You’ll get an icon on your home screen. Tapping it opens the app shell in the browser so it feels like opening an app at the beach.

---

## 4. Which folder to upload: main app vs localapp

| Upload this folder’s contents | What you get |
|-------------------------------|--------------|
| `real applications\power-prayer\www` | Shell + native Red Letters + storage; everything else in iframe. |
| `localapp\www` | Shell + native Red Letters, Dreams, Counsel, Urim, P48X, Translator, David vs Goliath (local), Bible Map; prayers still in iframe. Include the `games` folder for David vs Goliath. |

Use whichever you prefer; both work at **https://www.prayerauthority.com/app/**.

---

## 5. Checklist

- [ ] `public_html/app/index.html` exists (and opening it shows the Power Prayer shell).
- [ ] `public_html/app/js/` and `public_html/app/css/` are uploaded.
- [ ] If using localapp, `public_html/app/games/davidvsgoliath/` is uploaded.
- [ ] Site already has the frame-ancestors / header.php changes (from DEPLOY-THESE-TO-LIVE.txt) so the iframe loads correctly.
- [ ] On your phone, open **https://www.prayerauthority.com/app/** and use the shell at the beach.

No GitHub or iOS build required for this — just upload the shell to your site and use that URL on your phone.
