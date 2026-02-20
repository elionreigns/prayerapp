# Before You Submit — 100% Readiness Checklist

Use this list when you’re about to submit Power Prayer to the App Store. Everything here is required or strongly recommended by Apple or by the app design.

---

## 1. Demo account (App Review notes) — required

**What it is:** Apple’s reviewers must be able to **log in** to your app to test it. If they can’t sign in, they may reject the app or delay review.

**You have to create this account yourself** (one time) on your live site. The app and repo cannot create it for you.

### Step 1: Create the demo account on your site (do this once)

**Easiest: run the one-time PHP script (bypasses secret codes for all chatbots)**

1. Upload **prayers/create_demo_user.php** to your server (it’s in your `public_html/prayers/` folder).
2. In a browser, open **https://www.prayerauthority.com/prayers/create_demo_user.php** (or click the link to confirm). The script creates user **dem0** with password **0med** and sets **app_demo_user = 1** so this account has **full access** to Dream Interpreter, Spousal Translator, Biblical Counsel, and Urim & Thummim **without entering any secret codes** (on the site or in the app).
3. Delete or rename **create_demo_user.php** after use for security.

**Alternative: SQL in MySQL editor**

1. Add the column and user with SQL. In your `prayers` folder you have **CREATE-DEMO-USER.sql**. It requires a bcrypt hash for the password: run `php -r "echo password_hash('0med', PASSWORD_BCRYPT);"` and replace `YOUR_BCRYPT_HASH_FOR_0MED` in the SQL file, then run the statements in your MySQL editor. The same SQL file explains how to add the **app_demo_user** column and insert **dem0** so this user bypasses secret codes.

**Or: register manually**

1. Go to **https://www.prayerauthority.com** → **Register** and create username **dem0**, password **0med** (or an email like dem0appreview@gmail.com if the form requires email).
2. Then in MySQL run:  
   `UPDATE users SET app_demo_user = 1, verified = 1, approved = 1 WHERE username = 'dem0';`  
   (Your `users` table must have the **app_demo_user** column—it’s added automatically by **db_connect.php** on the next page load, or by the SQL in CREATE-DEMO-USER.sql.)

3. Confirm the account: log in on the site or in the app at https://www.prayerauthority.com/app/. You should see your name and green dot, and all four chatbots should work without asking for a secret code.
4. Leave this account active until the app is approved.

### Step 2: When you submit in App Store Connect, paste the credentials

1. Go to [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → **Power Prayer**.
2. Open the **version** you’re submitting (e.g. 1.0).
3. Scroll to **App Review Information**.
4. Set **Sign-in required** to **Yes**.
5. In **Notes**, paste this (use the **exact** username/email and password you created in Step 1):

   ```
   Demo account for App Review:
   Username/Email: dem0
   Password: 0med

   The app uses the same login as our website (prayerauthority.com). Use the Login item in the app menu to sign in. After login you can test: Dashboard, P48X Reflections, Dream Interpreter, Biblical Counsel, and prayer forms. Backend is live at https://www.prayerauthority.com.
   ```

   If you used a different email (e.g. dem0appreview@gmail.com) or password, replace the two lines above with your real credentials.

**Why:** Apple’s guidelines require an active demo account (or approved demo mode) so reviewers can test account-based features.

---

## 2. Backend live during review

- **prayerauthority.com** and all APIs (login, chatbots, P48X, Red Letters, etc.) must be **up and reachable** while the app is in review.
- If the site or API is down, reviewers can’t log in or use features and may reject the app.

---

## 3. Privacy policy

- **URL:** Use **https://www.prayerauthority.com/prayers/privacy.php** (already updated for the app and Apple).
- **In App Store Connect:** In your app’s **App Information** (or **App Privacy**), set **Privacy Policy URL** to that URL.
- **In the app:** The app drawer already includes a **Privacy Policy** link (menu → Legal & Support → Privacy Policy). No extra step needed.

---

## 4. Support / contact

- **In App Store Connect:** Set a **Support URL** (e.g. https://www.prayerauthority.com/contact or your contact page) and ensure **Contact** info is up to date.
- **In the app:** The drawer includes a **Contact** link (Legal & Support → Contact). No extra step needed.

---

## 5. App Review notes (what to say)

In **App Review Information** → **Notes**, you can add a short description so reviewers understand the app and 4.2 (minimum functionality):

```
Power Prayer is a native iOS app that provides prayer tools, reflection journals (P48X), and in-app chatbots (Dream Interpreter, Biblical Counsel, Urim & Thummim, Spousal Translator). Login, Dashboard, and prayer forms load our website inside the app; chatbots, P48X journal, Red Letters, David vs Goliath, and Bible Map run as in-app experiences with native UI. The app uses the same account and servers as prayerauthority.com. Demo account provided above for testing.
```

---

## 6. Metadata and listing

- **App name,** **description,** **screenshots,** and **keywords** match the real app (login, prayers, P48X, chatbots, etc.).
- **Category** and **age rating** are set.
- **Price** is set (e.g. free).

---

## 7. Build and test

- Build the app with **Codemagic** (or Xcode), upload the **.ipa** to App Store Connect.
- **Test on a real device** before submitting: open the app, log in with the demo account, try at least one chatbot and P48X. Fix any crashes or major bugs.

---

## Quick checklist (copy and tick)

| # | Item | Done |
|---|------|------|
| 1 | Demo account created on site; credentials added in App Store Connect → App Review Information (Notes) | ☐ |
| 2 | Backend (prayerauthority.com + APIs) live during review | ☐ |
| 3 | Privacy Policy URL in App Store Connect = https://www.prayerauthority.com/prayers/privacy.php | ☐ |
| 4 | Privacy Policy link in app (drawer → Legal & Support) — already added | ☑ |
| 5 | Support URL and contact info set in App Store Connect | ☐ |
| 6 | Contact link in app (drawer → Legal & Support) — already added | ☑ |
| 7 | App Review notes include demo account + short app description (optional but helpful) | ☐ |
| 8 | Metadata complete (name, description, screenshots, category, age, price) | ☐ |
| 9 | App tested on device; no critical bugs | ☐ |
| 10 | .ipa built (Codemagic) and uploaded to App Store Connect | ☐ |

When all items are done, submit the version for **App Review**. For build steps and code signing, see **CODEMAGIC-SETUP.md** and **APP-STORE-COMPLIANCE.md**.

---

## See the app online before you build (optional but recommended)

To **review the app in your browser** (same UI as the iOS build, including Privacy Policy and Contact in the drawer):

1. Upload the contents of **localapp/www/** to your live site’s **public_html/app/** (see **DEPLOY-THESE-TO-LIVE.txt**).
2. On the server, ensure **public_html/app/index.html** has `<base href="/app/">` in `<head>` so assets load correctly.
3. Open **https://www.prayerauthority.com/app/** on your phone or desktop. Use the menu to test Login (with your demo account dem0 / 0med), Privacy Policy, Contact, P48X, and a chatbot.

That way you see exactly what reviewers will see before you connect Codemagic and build the .ipa.

---

## Does Codemagic cost money?

**You can use Codemagic for $0** for typical use:

- **Free tier:** 500 build minutes per month on macOS (M2) builds, reset every month. One iOS build often takes about 10–20 minutes, so 500 minutes is enough for many builds per month.
- **If you go over:** You only pay per minute (e.g. about $0.095/min on macOS M2). For a single app and a few builds, you usually stay within the free 500 minutes.

So: connect Codemagic to GitHub, run the build; for getting Power Prayer built and submitted, **Codemagic itself does not have to cost you anything**. You still need the **Apple Developer Program ($99/year)** to submit to the App Store. See [Codemagic pricing](https://codemagic.io/pricing/) for current details.
