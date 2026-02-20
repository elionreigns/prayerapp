# Apple App Store Compliance Checklist

This doc summarizes **Apple’s App Store Review Guidelines** as they apply to the Power Prayer app so you can confirm the app is acceptable before submitting. Always treat [Apple’s official guidelines](https://developer.apple.com/app-store/review/guidelines/) as the source of truth.

---

## Official documentation

- **App Store Review Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Human Interface Guidelines:** https://developer.apple.com/design/human-interface-guidelines/
- **App Store Connect Help:** https://developer.apple.com/help/app-store-connect/

---

## Before You Submit (Apple’s list)

- [ ] **Demo account:** If the app includes login, provide an **active demo account** (and/or turn on backend) so App Review can sign in and use the app. If you can’t share credentials, use a built-in demo mode and get prior approval.
- [ ] **Backend live:** Ensure prayerauthority.com and all APIs (login, chatbots, P48X, etc.) are **live and reachable** during review.
- [ ] **No placeholders:** Remove placeholder text, empty pages, and non-functional URLs from the build and metadata.
- [ ] **Test on device:** Test the app on a real device for crashes and obvious bugs before submitting.
- [ ] **Metadata complete:** App name, description, screenshots, and privacy info must be accurate and complete in App Store Connect.
- [ ] **Contact info:** Your support/contact URL and App Review contact details must be up to date.

---

## Guideline 4.2 — Minimum Functionality (critical for hybrid/WebView apps)

Apple rejects apps that are “not sufficiently different from a mobile browsing experience” (e.g. a simple WebView of your site with no app-like value).

**Why Power Prayer is in a good position:**

- **Native shell:** Fixed header, drawer navigation, and native-style layout (not just a single URL bar).
- **In-app features:** Dream Interpreter, Biblical Counsel, Urim & Thummim, Spousal Translator, P48X (with quality buttons, question dropdown, journal, Google Calendar scheduling), Red Letters, David vs Goliath, Bible Map, etc. are presented inside the app with native-style UI and API calls—not as “open this website.”
- **Account integration:** Login/Register/Dashboard load your site in-app, and the same session is used for all tools (one account, one experience).
- **Clear purpose:** Prayer, reflection, and spiritual tools with lasting utility—not a repackaged bookmark.

**What to avoid:** Don’t describe the app as “access our website” or “mobile website.” In metadata and Review notes, emphasize the **app experience**: native navigation, in-app chatbots, P48X journal and calendar scheduling, prayer forms, and Red Letters all within the app.

---

## Safety (Section 1)

- **1.1 Objectionable content:** App content is prayer/reflection/spiritual tools; no objectionable or misleading religious content. Ensure any religious text or quotes are used respectfully and accurately.
- **1.5 Developer/contact info:** Provide a valid Support URL and contact so users and App Review can reach you. Include this in the app (e.g. in the drawer or a “Contact” / “Support” link) and in App Store Connect.

---

## Performance (Section 2)

- **2.1 App completeness:** Submit a final build: no “coming soon” or broken flows. Backend (prayerauthority.com) must be on and APIs working during review.
- **2.3 Accurate metadata:** Description and screenshots must match the real app (login, prayers, chatbots, P48X, etc.). Keep them updated with each significant change.

---

## Design (Section 4)

- **4.2 Minimum functionality:** See above; the app should present as a cohesive app, not a web clip.
- **4.7 Mini apps, chatbots, etc.:** Apps may offer “HTML5 and JavaScript mini apps … chatbots.” You are responsible for ensuring that all such content (e.g. Dream Interpreter, Biblical Counsel, Urim & Thummim, Spousal Translator) complies with the guidelines and applicable law. Your chatbots are faith-based tools; keep content appropriate and consistent with your app’s purpose.
- **4.8 Login:** If you use “Sign in with Google” or another third-party login, you must also offer an equivalent option (e.g. email/password or another provider that meets Apple’s criteria). Your app already uses **your own** login (email/password) and optionally Google; ensure both are available and that you’re not forcing a single third-party login as the only way to use the app.

---

## Privacy (Section 5.1)

- **Privacy policy:** You **must** have a **privacy policy** that:
  - Is linked in **App Store Connect** (metadata) and **inside the app** in an easily accessible place.
  - States what data you collect, how you collect it, and how you use it.
  - Describes data retention/deletion and how users can revoke consent or request deletion.
  - Identifies any third parties that receive user data (e.g. analytics, Google for calendar) and that they provide the same or equal protection.

- **Consent:** Do not collect or share personal data without permission. Do not require users to enable tracking, push, or location just to use the app.

If you don’t already have a privacy policy URL on prayerauthority.com, add one and link it in the app (e.g. footer or drawer) and in App Store Connect.

---

## Legal & other

- **5.2 Intellectual property:** Only use content you own or have rights to (text, images, branding).
- **5.6 Developer Code of Conduct:** Be accurate and respectful in App Store Connect, review responses, and support. No manipulation of reviews or rankings.

---

## Submission checklist (quick reference)

| Item | Action |
|------|--------|
| Demo account | Provide working login credentials (or approved demo mode) in App Review notes. |
| Backend | Ensure prayerauthority.com and APIs are live during review. |
| Privacy policy | Publish policy URL; add link in app and in App Store Connect. |
| Support/contact | Add Support URL and contact in App Store Connect and in the app. |
| 4.2 (minimum functionality) | In notes, describe native shell, in-app tools (chatbots, P48X, Red Letters, etc.), not “just a website.” |
| Login options | If using Google Sign-In, keep email/password (or equivalent) as an option. |
| Metadata | App name, description, screenshots match the actual experience. |
| Test on device | Run the built app on a real device; fix crashes and major bugs. |

---

## If you get a 4.2 rejection

- Use **App Store Connect** to reply to App Review and clarify how the app goes beyond a web view: native navigation, in-app chatbots, P48X with journal and calendar, prayer forms, Red Letters, games, etc.
- You can also [submit an appeal](https://developer.apple.com/contact/app-store/?topic=appeal) if you believe the decision was incorrect.

Keeping this checklist and the official guidelines in mind when preparing your build and metadata will help your submission align with Apple’s rules.
