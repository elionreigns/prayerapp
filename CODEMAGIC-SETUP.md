# How to Use Codemagic with GitHub to Build the iOS App

This guide walks you through connecting your GitHub repo to Codemagic, building the Power Prayer iOS app in the cloud, and what you need for Apple’s requirements.

---

## Part 1: Connect GitHub to Codemagic

1. **Sign up at Codemagic**  
   Go to [codemagic.io](https://codemagic.io) and create an account. The **free tier includes 500 build minutes per month** (enough for many iOS builds); you typically don’t need to pay Codemagic to get Power Prayer built. You do need Apple’s $99/year Developer Program to submit to the App Store.

2. **Add application and connect GitHub**  
   - In the Codemagic dashboard, click **Add application**.  
   - Choose **GitHub** as the Git provider.  
   - If asked, click **Authorize Codemagic CI/CD** and approve access.  
   - Install the **Codemagic CI/CD** GitHub App: choose your account (e.g. `elionreigns`) and either **All repositories** or **Only select repositories** and pick **prayerapp**.  
   - Click **Finish: Add application**.

3. **Select your repo and branch**  
   - Select repository: **elionreigns/prayerapp**.  
   - Select branch: **main** (or the branch you use for releases).  
   - **Project type:** choose **Flutter**, **React Native**, **Other**, or **Xcode** — for Capacitor, **Other** or **Xcode** is fine; the build is driven by the `codemagic.yaml` we add.

4. **Working directory**  
   You can leave **Working directory** empty. The repo’s **codemagic.yaml** is written to run from the repo root and use the `localapp` folder for all build steps.

5. **Check for configuration file**  
   In Codemagic, open your app and click **Check for configuration file** (or start a build). Codemagic will find the `codemagic.yaml` in the repo root and use it for the build.

---

## Part 2: Apple Signing & App Store Connect (required to build and submit)

You need an **Apple Developer Program** account ($99/year) and signing set up so Codemagic can produce an installable .ipa and (optionally) upload to App Store Connect.

### A. Apple Developer Program

- Enroll at [developer.apple.com/programs](https://developer.apple.com/programs/).  
- After approval, you get access to **App Store Connect** and can create the app and get the **App ID** (numeric) for Power Prayer.

### B. Create the app in App Store Connect

- Go to [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → **+** → **New App**.  
- Platform: **iOS**.  
- Name: **Power Prayer** (or your chosen name).  
- Bundle ID: must match the app: **com.prayerauthority.powerprayer** (this is in `localapp/capacitor.config.json`).  
- After creation, open the app → **App Information** and note the **Apple ID** (numeric, e.g. `1234567890`) — you’ll use it in Codemagic or in `codemagic.yaml` as `APP_STORE_APP_ID`.

### C. App Store Connect API key (for Codemagic to upload the .ipa)

- In App Store Connect: **Users and Access** → **Integrations** → **App Store Connect API** → **Generate API Key**.  
- Name it (e.g. “Codemagic”), choose **App Manager** (or Admin).  
- Download the **.p8** key file **once** (you can’t download it again).  
- Note the **Key ID** and **Issuer ID** shown there.

### D. Add Apple integration in Codemagic

- In Codemagic: **Team settings** (or your app) → **Integrations** → **App Store Connect**.  
- Add **App Store Connect API key**:  
  - Upload the **.p8** file (or paste its contents).  
  - Enter **Issuer ID** and **Key ID**.  
  - Save and name the integration (e.g. `codemagic`).

### E. Code signing in Codemagic

- In your **application** in Codemagic, open **Code signing** (or the step that configures iOS signing).  
- **Distribution type:** **App Store**.  
- **Bundle ID:** `com.prayerauthority.powerprayer`.  
- Either:  
  - Use **Automatic code signing**: connect your **Apple ID** (developer account) and let Codemagic create the certificate and provisioning profile, or  
  - Use **Manual**: upload your own **Distribution certificate** and **App Store provisioning profile** (created in Apple Developer Portal).

After this, when you run a build, Codemagic will sign the app and can upload the .ipa to App Store Connect.

---

## Part 3: Running a Build

1. In Codemagic, open your **Power Prayer** application.  
2. Select branch **main** (or your release branch).  
3. Click **Start new build**.  
4. Codemagic will:  
   - Clone the repo (or use the `codemagic.yaml` from the repo).  
   - Install dependencies, run `npx cap sync ios`, install CocoaPods, build the Xcode project, and produce an **.ipa**.  
   - If publishing is configured, upload the .ipa to App Store Connect (and optionally to TestFlight).

After a successful build you’ll see the .ipa in **Artifacts** and, if publishing is on, the build in App Store Connect under **TestFlight** or **App Store** (once you submit).

---

## Part 4: Does the App Meet Apple’s Requirements?

**Yes, the app is built to meet Apple’s guidelines**, as long as you complete the **non-code** items that Apple expects from you (metadata, policy, account).

- **Guideline 4.2 (Minimum functionality)**  
  The app is not a simple “web clip”: it has a native shell, in-app chatbots (Dream Interpreter, Biblical Counsel, etc.), P48X with journal and calendar, Red Letters, prayer forms, and games. See **APP-STORE-COMPLIANCE.md** for how to describe this in Review notes.

- **Privacy (5.1)**  
  The app includes a **Privacy Policy** link in the drawer (menu → Legal & Support). Use **https://www.prayerauthority.com/prayers/privacy.php** as the Privacy Policy URL in App Store Connect as well.

- **Before You Submit**  
  - **Demo account:** Apple needs to log in to test. Create an account on your site and put the **email** and **password** in App Store Connect → Your App → App Review Information → **Notes**. See **BEFORE-YOU-SUBMIT.md** for the exact steps and a copy-paste template.  
  - **Backend live:** Keep **prayerauthority.com** and all APIs **live** during review.  
  - **Support URL:** Set in App Store Connect. The app includes a **Contact** link in the drawer (Legal & Support).

Use **BEFORE-YOU-SUBMIT.md** for the full 100% readiness checklist and **APP-STORE-COMPLIANCE.md** for the full compliance reference.

---

## Quick reference

| Step | Where | What |
|------|--------|------|
| Connect repo | Codemagic dashboard | Add application → GitHub → select **elionreigns/prayerapp** |
| Working directory | App settings | Set to **localapp** (or use repo’s `codemagic.yaml` as-is) |
| Build config | Repo or Codemagic UI | Use **codemagic.yaml** in repo root for build steps |
| Apple Developer | developer.apple.com | $99/year; required to submit |
| App Store Connect | appstoreconnect.apple.com | Create app, get App ID, create API key |
| Signing | Codemagic → Code signing | Automatic (Apple ID) or manual (certificate + profile) |
| Privacy & demo | App Store Connect + Review notes | Privacy policy URL; demo account in notes |
| Full Apple checklist | **APP-STORE-COMPLIANCE.md** | Use before submitting |

---

## Troubleshooting

- **Build fails on “pod install”**  
  Make sure the **Working directory** is `localapp` (or that the YAML runs from `localapp`), so that `ios/App/Podfile` and `package.json` are found.

- **Code signing errors**  
  Confirm the Bundle ID in Codemagic (and in Xcode/Capacitor) is **com.prayerauthority.powerprayer** and that the provisioning profile is for **App Store** distribution.

- **Upload to App Store Connect fails**  
  Check that the App Store Connect API key has **App Manager** (or Admin) role and that the **App ID** (numeric) in your config matches the app in App Store Connect.

For more on Codemagic and iOS:  
- [Codemagic – Building a native iOS app](https://docs.codemagic.io/yaml-quick-start/building-a-native-ios-app)  
- [Codemagic – App Store Connect publishing](https://docs.codemagic.io/yaml-publishing/app-store-connect)
