# What to Send In for App Store Approval

Use this when you’re ready to submit **Power Prayer** to Apple. Enter everything below in **App Store Connect** (and keep your backend live).

---

## 1. Demo account (required for reviewers to log in)

Apple must be able to sign in to test the app. Put this in **App Store Connect** so they can use it.

**Where:** App Store Connect → **My Apps** → **Power Prayer** → your version (e.g. 1.0) → scroll to **App Review Information**.

**Enter:**

- **Sign-in required:** **Yes**
- **Notes** (or Demo account / Contact):

```
Demo account for App Review:
Username: dem0
Password: 0med

The app uses the same login as our website (prayerauthority.com). Use the Login item in the app menu to sign in. After login you can test: Dashboard, P48X Reflections, Dream Interpreter, Biblical Counsel, Spousal Translator, Urim & Thummim, and prayer forms. This account has full access to all chatbots (no secret codes required). Backend is live at https://www.prayerauthority.com.
```

**Keep:** The account **dem0** / **0med** active and the backend (prayerauthority.com) live for the whole review period.

---

## 2. Privacy Policy URL

**Where:** App Store Connect → your app → **App Information** (or **App Privacy**).

**Enter:**  
**https://www.prayerauthority.com/prayers/privacy.php**

The app already links to this in the menu (Legal & Support → Privacy Policy).

---

## 3. Support URL

**Where:** App Store Connect → your app → **App Information**.

**Enter:** Your support or contact page, e.g.  
**https://www.prayerauthority.com/contact**  
(or whatever your real contact URL is).

The app already links to Contact in the menu (Legal & Support → Contact).

---

## 4. App Review notes (optional but helpful)

**Where:** Same **App Review Information** section as the demo account.

**You can add:**

```
Power Prayer is a native iOS app that provides prayer tools, reflection journals (P48X), and in-app chatbots (Dream Interpreter, Biblical Counsel, Urim & Thummim, Spousal Translator). Login, Dashboard, and prayer forms load our website inside the app; chatbots, P48X journal, Red Letters, David vs Goliath, and Bible Map run as in-app experiences with native UI. The app uses the same account and servers as prayerauthority.com. Demo account provided above for testing.
```

---

## 5. Rest of the listing (before you submit)

- **Name:** e.g. Power Prayer  
- **Subtitle / description:** What the app does (prayers, chatbots, P48X, etc.)  
- **Screenshots:** At least one per required device size (see App Store Connect)  
- **Keywords:** e.g. prayer, Bible, reflection, chatbot  
- **Category:** e.g. Lifestyle or Reference  
- **Age rating:** Set after completing the questionnaire  
- **Price:** e.g. Free  
- **App Privacy:** Complete the data collection questions (no tracking required for this app)

---

## 6. Build

- Build the app in **Codemagic** (or Xcode), upload the **.ipa** to App Store Connect.  
- In your version, select that build, then click **Submit for Review**.

---

## Quick checklist

| Item | Where in App Store Connect | Value |
|------|----------------------------|--------|
| Demo account | App Review Information → Notes | dem0 / 0med (see text above) |
| Sign-in required | App Review Information | Yes |
| Privacy Policy URL | App Information | https://www.prayerauthority.com/prayers/privacy.php |
| Support URL | App Information | Your contact page URL |
| Optional notes | App Review Information | Short app description (see above) |
| Backend live | Your server | prayerauthority.com + APIs up during review |

After you enter these and submit, Apple will review the app. For full pre-submit steps (Codemagic, Apple Developer, etc.), see **BEFORE-YOU-SUBMIT.md** and **CODEMAGIC-SETUP.md**.
