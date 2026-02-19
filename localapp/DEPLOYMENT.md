# Power Prayer — Deployment & App Store Submission

## Can I submit without a Mac or Xcode?

**Short answer:** You need **Apple Developer Program ($99/year)** to publish on the App Store. To **build** the iOS app you need either:

- **Option A (recommended):** A **Mac** with **Xcode** installed. Then you build and submit from your machine.
- **Option B:** A **cloud build service** (e.g. [Codemagic](https://codemagic.io), [Bitrise](https://bitrise.io), or GitHub Actions with a macOS runner) that builds the `.ipa` for you. You still need the Apple Developer account to upload the build to App Store Connect. Some of these services can also submit for you.

So: **Developer account = required.** Mac + Xcode = required for building locally; optional if you use a cloud build.

This project is set up so that when you have a Mac (or a cloud builder) and an Apple Developer account, you can build and submit with the steps below.

---

## Deploy from PC only (no Mac ever)

You can build and submit to the App Store **entirely from your Windows PC** by using a **cloud build service** that runs macOS and Xcode for you. You never need to own or touch a Mac.

### What you need (all doable from PC)

- **Apple Developer Program** ($99/year) — sign up at [developer.apple.com](https://developer.apple.com/programs/).
- **Your app code in a Git repo** — e.g. GitHub (so the cloud service can clone and build it).
- **Apple signing credentials** — the cloud service will guide you to create or upload:
  - **Distribution certificate** (or let the service create it).
  - **Provisioning profile** for App Store distribution.
  - **App Store Connect API key** (recommended) so the service can upload the build for you.

### Option 1: Codemagic (easiest, good free tier)

[Codemagic](https://codemagic.io) runs macOS build machines and can build Capacitor apps and upload to App Store Connect. You configure everything from their website on your PC.

1. **Sign up** at [codemagic.io](https://codemagic.io) (free tier includes a limited number of build minutes).
2. **Connect your repository** (GitHub, GitLab, or Bitbucket) — point it at the repo that contains `real applications/power-prayer` (or the whole project).
3. **Add an application** in Codemagic and set:
   - **Build type:** iOS.
   - **Working directory:** `localapp` (this folder — use this if you want the store build with full native tools) or `real applications/power-prayer` for the main app.
   - **Build script:** install Node, run `npm ci`, `npx cap sync ios`, then build the Xcode project (Codemagic has presets for Cordova/Capacitor; you may use a custom script that runs `pod install` in `ios/App` and then `xcodebuild` to archive).
   - **Code signing:** In Codemagic’s UI, add your Apple Developer team, distribution certificate, and provisioning profile (or use “Automatic code signing” and give your Apple ID).
   - **Publishing:** Enable “App Store Connect” and add your App Store Connect API key (or Apple ID + app-specific password) so Codemagic uploads the .ipa after a successful build.
4. **Start a build** from the Codemagic dashboard. When it finishes, the build is in App Store Connect; you then complete the store listing and submit for review from [App Store Connect](https://appstoreconnect.apple.com) in your browser.

Codemagic’s docs: [Codemagic – iOS build and publish](https://docs.codemagic.io/yaml-publishing/app-store-connect/).

### Option 2: GitHub Actions (free for public repos, YAML in repo)

GitHub provides **macOS runners**; you add a workflow that builds the iOS app and uploads to App Store Connect. You edit the workflow on your PC and push; the build runs in the cloud.

1. **Push your project** to a GitHub repository (can be private; private repos get a limited amount of free macOS minutes per month).
2. **Apple credentials:** You need to provide signing credentials to the workflow. Common approach:
   - **App Store Connect API key** (recommended): In App Store Connect → Users and Access → Integrations → App Store Connect API, create a key with “App Manager” or “Admin” role. Download the `.p8` file once and store its contents as a **GitHub secret** (e.g. `APP_STORE_CONNECT_API_KEY_BASE64`).
   - **Certificate and provisioning profile:** Export from a Mac once (or use [fastlane match](https://docs.fastlane.tools/actions/match/)) and store as GitHub secrets (base64), or use **Apple’s automatic signing** via `xcodebuild` with your Apple ID (stored as secrets). Alternatively, use a service like [match](https://docs.fastlane.tools/actions/match/) or Codemagic to generate and store them, then reference in GitHub Actions.
3. **Add the workflow file** — see `.github/workflows/ios-app-store.yml` in this repo (if you add it) or the example below. The workflow:
   - Runs on `macos-latest`.
   - Checks out the repo, sets up Node, runs `npm ci`, `npx cap sync ios`, `cd ios/App && pod install`, then builds and archives with `xcodebuild`.
   - Uses your secrets to sign and upload to App Store Connect (e.g. with `xcrun altool --upload-app` or fastlane `upload_to_app_store`).

**Example GitHub Actions workflow** (place in `.github/workflows/ios-app-store.yml` in the **root of the repo** that contains `real applications/power-prayer`; adjust paths if your repo layout is different):

```yaml
name: Build and upload iOS to App Store Connect

on:
  workflow_dispatch:  # Run manually from GitHub Actions tab
  push:
    branches: [main]
    paths:
      - 'real applications/power-prayer/**'

env:
  APP_DIR: real applications/power-prayer

jobs:
  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: ${{ env.APP_DIR }}/package-lock.json

      - name: Install dependencies
        working-directory: ${{ env.APP_DIR }}
        run: npm ci

      - name: Sync Capacitor iOS
        working-directory: ${{ env.APP_DIR }}
        run: npx cap sync ios

      - name: Install CocoaPods
        run: gem install cocoapods

      - name: Pod install
        working-directory: ${{ env.APP_DIR }}/ios/App
        run: pod install

      - name: Build and archive (Xcode)
        env:
          DEVELOPER_TEAM_ID: ${{ secrets.DEVELOPER_TEAM_ID }}
          SCHEME: App
        run: |
          cd ${{ env.APP_DIR }}/ios/App
          xcodebuild -workspace App.xcworkspace -scheme App -configuration Release \
            -destination 'generic/platform=iOS' -archivePath build/App.xcarchive archive \
            CODE_SIGN_STYLE=Automatic DEVELOPMENT_TEAM=$DEVELOPER_TEAM_ID

      - name: Export IPA
        run: |
          cd ${{ env.APP_DIR }}/ios/App
          xcodebuild -exportArchive -archivePath build/App.xcarchive \
            -exportPath build -exportOptionsPlist exportOptions.plist

      - name: Upload to App Store Connect
        env:
          APP_STORE_CONNECT_ISSUER_ID: ${{ secrets.APP_STORE_CONNECT_ISSUER_ID }}
          APP_STORE_CONNECT_KEY_ID: ${{ secrets.APP_STORE_CONNECT_KEY_ID }}
          APP_STORE_CONNECT_KEY_BASE64: ${{ secrets.APP_STORE_CONNECT_KEY_BASE64 }}
        run: |
          # Decode key and upload with xcrun altool or use fastlane
          # Add step that calls: xcrun altool --upload-app -f build/App.ipa ...
```

You’ll need to create an **Export Options plist** for the archive export (or use fastlane) and add the GitHub secrets (team ID, App Store Connect API key, etc.). Codemagic is often easier for the first time because it handles a lot of this in the UI.

### Summary: PC-only path

| Step | Where |
|------|--------|
| Enroll in Apple Developer | [developer.apple.com](https://developer.apple.com) (from PC) |
| Put code in Git (e.g. GitHub) | From PC |
| Choose cloud builder | Codemagic or GitHub Actions |
| Configure build + signing | Codemagic dashboard or GitHub Actions YAML + secrets |
| Trigger build | Codemagic “Start build” or GitHub “Run workflow” |
| Upload to App Store Connect | Done by Codemagic or by your workflow |
| Submit for review | [App Store Connect](https://appstoreconnect.apple.com) in browser (from PC) |

You never need a Mac; the cloud provider’s Macs run Xcode and build the .ipa for you.

**Step-by-step PC-only guide:** see **[../DEPLOY-FROM-PC.md](../DEPLOY-FROM-PC.md)** in the `real applications` folder.  
**GitHub Actions workflow** (build on push or manually): **`.github/workflows/ios-power-prayer-app-store.yml`** in the repo root.

---

## 1. Preview on localhost (no Mac needed)

You can see the full app UI and flow on your PC **before** paying for the developer program or using a Mac.

1. **Install dependencies** (one time):
   ```bash
   cd "real applications/power-prayer"
   npm install
   ```

2. **Start the preview server**:
   ```bash
   npm run preview
   ```

3. **Open in your browser:**  
   Go to **http://localhost:3335**

   You’ll see the Power Prayer shell (header + hamburger menu). The main area loads the website (login, then any tool you pick from the menu). If the content area is blank (some browsers/sites block iframes from localhost), use the menu to open a link—there’s an option to open in a new tab so you can still test the flow.

4. **Optional — open preview in your default browser:**
   ```bash
   npm run preview:open
   ```
   (This runs the server and then opens http://localhost:3335 in your browser.)

Use this to confirm layout, menu items, and navigation before you spend on the developer program or build on a Mac.

---

## 2. When you’re ready to build for the App Store

### Prerequisites

- **Apple Developer Program** — [$99/year](https://developer.apple.com/programs/).
- **Mac with Xcode** — [Download Xcode](https://developer.apple.com/xcode/) from the Mac App Store (free).

### Steps

1. **In the project folder** (`real applications/power-prayer`):

   ```bash
   npm install
   npx cap sync ios
   npx cap open ios
   ```
   *(If you don’t have an `ios` folder yet, run `npx cap add ios` first, then `npx cap sync ios`.)*

2. **On a Mac, before first build:**  
   Open Terminal, go to `ios/App`, and run:
   ```bash
   pod install
   ```
   Then open `ios/App/App.xcworkspace` in Xcode (not the `.xcodeproj`). If you use `npx cap open ios`, it opens the right thing.

3. **In Xcode:**
   - Select the **Power Prayer** project in the left sidebar.
   - Under **Signing & Capabilities**, choose your **Team** (your Apple Developer account). Xcode will create or use an App ID like `com.prayerauthority.powerprayer`.
   - Pick a **device or simulator** and click **Run** to install and run the app.

4. **Create an archive for the App Store:**
   - In Xcode: **Product → Archive**.
   - When the archive is done, the **Organizer** window opens. Select the archive and click **Distribute App**.
   - Choose **App Store Connect** → **Upload**, follow the prompts. Your build will appear in [App Store Connect](https://appstoreconnect.apple.com) for submission.

5. **In App Store Connect:**
   - Create the app (e.g. “Power Prayer”) if you haven’t already.
   - Attach the uploaded build to a version, fill in description/screenshots/price ($10), and submit for review.

---

## 3. App Store readiness (already set in this project)

| Item | Value / location |
|------|-------------------|
| **Bundle ID** | `com.prayerauthority.powerprayer` (in `capacitor.config.json`) |
| **App name** | Power Prayer |
| **Version** | 1.0.0 (in `package.json`) |
| **Web content** | `www/` (shell + config; content loads from your site when online) |

Before submitting, you can bump the version in both `package.json` and, if needed, in Xcode (Target → General → Version / Build).

---

## 4. Checklist before submission

- [ ] Ran `npm run preview` and checked the app on localhost.
- [ ] Apple Developer Program enrolled ($99/year).
- [ ] Mac with Xcode installed (or cloud build configured).
- [ ] Ran `npx cap add ios`, `npx cap sync`, `npx cap open ios`.
- [ ] In Xcode: selected your Team for signing.
- [ ] Tested on a real device or simulator.
- [ ] Product → Archive → Distribute App → Upload to App Store Connect.
- [ ] In App Store Connect: app created, build attached, store listing (title, description, screenshots, price) filled and submitted for review.

Once this is done, the app is ready for deployment when you have the developer account and a way to build (Mac + Xcode or cloud).
