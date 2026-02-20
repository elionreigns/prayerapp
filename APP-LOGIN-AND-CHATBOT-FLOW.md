# How Login & Chatbots Work When Someone Downloads the App

The app **is** connected to your website. When a user installs the app from the App Store, it talks to **https://www.prayerauthority.com** over the internet. There is no “offline app” that’s disconnected—the app is a **client** of your live site. This doc explains the flow so login stays in sync and chatbots (and other tools) work.

---

## 1. The app is always “connected” to the website

- The app knows your site URL: **https://www.prayerauthority.com** (set in code; when the app is opened from your site at `/app/`, it can also load it from `app-config.php`).
- Every time the user opens **Login**, **Dashboard**, or any prayer form, the app loads that **real page from your site** inside the app (in a WebView/iframe). So they are literally on your website, just inside the app’s shell.
- When they use **Dream Interpreter**, **Biblical Counsel**, **Urim & Thummim**, **Spousal Translator**, **P48X**, etc., the app calls your site’s **APIs** (e.g. `dreambot_api.php`, `chatbot_api.php`) over HTTPS. Same server, same account.

So: **downloading the app does not mean “not connected.”** It means: “this device now has a native shell that loads your site and calls your APIs.” They must be online to log in and to use chatbots.

---

## 2. Step-by-step: what happens after they open the app

1. **User opens the app (e.g. from the Home screen)**  
   - App starts. It uses **SITE = https://www.prayerauthority.com** (or whatever came from `app-config.php` if the app was loaded from your domain).

2. **User taps “Login” in the menu**  
   - App sets the content area to your **real login page**:  
     `https://www.prayerauthority.com/prayers/login.php`  
   - That URL is loaded **inside the app** (iframe/WebView). So the user sees your normal login (and Register, Google Sign-In, etc.).

3. **User logs in on that page**  
   - They enter email/password or use “Sign in with Google” on **your** page.  
   - The form is submitted to **your server**. Your server creates a session and sets a **session cookie** for the domain `www.prayerauthority.com`.  
   - That cookie is stored in the **same WebView** that the app uses. So the app and the website share the same session.

4. **After login, the app “knows” they’re logged in**  
   - The app calls:  
     `GET https://www.prayerauthority.com/prayers/app_login_status.php`  
     with **credentials: 'include'** so the browser/WebView sends the cookie.  
   - Your server reads the same session and returns `{ loggedIn: true, displayName: "…" }`.  
   - The app then shows **username + green dot** in the header and **“Signed in as …”** in the drawer.

5. **User opens a chatbot (e.g. Dream Interpreter)**  
   - The app shows its **own** chat UI (no iframe).  
   - When the user sends a message, the app does:  
     `POST https://www.prayerauthority.com/prayers/dreambot_api.php`  
     with **credentials: 'include'** and the message body.  
   - The WebView sends the **same session cookie** with this request. Your server sees the logged-in user and runs the chatbot. Response comes back and the app shows it in the chat.

6. **Same for all other tools**  
   - Biblical Counsel, Urim & Thummim, Spousal Translator, P48X (save/load/journal), Red Letters, etc. all call your APIs with **credentials: 'include'**.  
   - So as long as the user has logged in once (in the app, on your login page), every API call is authenticated with that same session. No separate “app login”—it’s **one account, one session, synced with the website**.

---

## 3. Summary table

| Step | What happens | Where it runs |
|------|-------------------------------|----------------|
| Open app | App loads; SITE = prayerauthority.com | Device |
| Tap Login | App loads **your** login URL in the content area | Your site (inside app) |
| User submits login | Form posts to your server; session cookie set | Your server |
| App checks status | `app_login_status.php` with cookie | Your server |
| User opens chatbot | App calls e.g. `dreambot_api.php` with cookie | Your server |
| Chatbot responds | Server sees session, runs bot, returns reply | Your server |

So: **Login is synced with the website** because the app never has its own login form—it shows **your** login page and uses the **same** session cookie for all requests (iframe pages and API calls).

---

## P48X Google Calendar sync (same from app or site)

When a user taps **Connect Google Calendar** or **Activate Daily Schedule** in the app, the app calls the same server endpoints as the website: `google_auth.php` (to connect their Google account) and `schedule_notifications.php` (to create the daily reflection events). The server **always** builds calendar/email links to the **website**:  
`https://www.prayerauthority.com/prayers/p48x.php?quality=…#journal-area-anchor`.  
So when they click a reminder link (from Gmail or Google Calendar), it opens the **website** P48X page, scrolls to the reflection area (`#journal-area-anchor`), and shows a **random** prompt for that quality—same behavior whether they set up the schedule from the app or from the site. The app does not change this; reminder links are not opened in the app so the full site experience (scroll + random thought) is preserved.

---

## 4. What the app code does to make this work

- **Login/Register/Dashboard/Prayers**  
  - These paths are **not** “native” screens. The app sets `iframe.src = SITE + path` (e.g. `/prayers/login.php`), so the user always gets the real site and the cookie is set in the same WebView.

- **Every API call**  
  - Red Letters, Dreams, Counsel, Urim, Translator, P48X, schedule, and `app_login_status.php` use **`fetch(..., { credentials: 'include' })`** so the session cookie is sent. No extra “app token”—the existing website session is used.

- **Login state in the UI**  
  - After iframe load and when opening the app, the app calls `app_login_status.php`. If the cookie is valid, the server returns the display name and the app shows the green dot and “Signed in as [name].”

---

## 5. What you need on the server

- **app_login_status.php** must be on the live site (see DEPLOY-THESE-TO-LIVE.txt). It reads the same session as your login script and returns JSON.  
- Your login flow must set a **session cookie** for `www.prayerauthority.com` (normal PHP session is fine).  
- If the app is ever embedded in a different top-level origin (e.g. a third-party wrapper), your session cookie may need **SameSite=None; Secure** so it’s sent with cross-origin requests. For the normal Capacitor app loading your login page in an iframe and then calling your APIs from the same WebView, standard session cookies are enough.

---

## 6. “What if they’re not connected?”

- If the device has **no internet**, the user cannot load the login page or any API. The app will show network errors or timeouts. That’s expected.  
- When they’re **back online**, they open the app again, tap Login, and log in on your page as above. After that, chatbots and all tools work again with the same synced account.

So: **when someone downloads the app from the App Store, they are not “disconnected” from the website.** They get a native shell that loads your site for login and prayers and calls your site for chatbots, with one account and one session. The flow above is what makes that work.
