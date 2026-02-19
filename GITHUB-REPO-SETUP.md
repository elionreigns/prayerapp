# GitHub repo setup — one-time

Use this when you create the **new project** on GitHub ([github.com/elionreigns](https://github.com/elionreigns)) and push the app so you can deploy from PC (like you do with helicopter tours on Oahu).

---

## 1. What to push (this folder = repo root)

Push the **contents** of the `real applications` folder as the **root** of your new repo. That way the repo has:

- `power-prayer/` — the Capacitor app
- `HolyVibe.md`
- `DEPLOY-FROM-PC.md`
- `README.md`
- `GITHUB-REPO-SETUP.md` (this file)
- `.gitignore`
- `.github/workflows/ios-power-prayer-app-store.yml`

**Do not push:** `config.php`, any file with API keys, DB credentials, or OAuth client secrets. The app only knows `SITE_URL` (e.g. https://www.prayerauthority.com); the **server** has all config and APIs.

---

## 2. Public vs private

- **Public is fine** for this repo because it contains **no secrets**. Registration, login, and Google OAuth run on your **website** (prayerauthority.com); the app loads those pages. API keys and config stay on the server.
- **Use private** if you later add site code or any file that could reference secrets (and keep `config.php` in `.gitignore`).

---

## 3. Create the repo and push (from PC)

1. On GitHub: **New repository** (e.g. name: `prayer-authority-app`). You can leave it empty (no README, no .gitignore).
2. On your PC, open a terminal in the folder that **contains** the `real applications` contents (e.g. you might be inside `real applications` or you might copy its contents into a new folder).

   **If you’re inside the project that has a parent folder with `real applications`:**

   ```bash
   cd "c:\Users\erict\OneDrive\Desktop\Cursor Sites #2\PRAYER AUTHORITY 2026\2-17-public_html\real applications"
   git init
   git add .
   git status
   ```
   Check that **no** `config.php` or secret files are staged. Then:

   ```bash
   git commit -m "Power Prayer app + HolyVibe + deploy from PC"
   git branch -M main
   git remote add origin https://github.com/elionreigns/prayer-authority-app.git
   git push -u origin main
   ```
   (Replace `prayer-authority-app` with your actual repo name.)

3. After push, add the **secret** for iOS build:
   - Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
   - Name: `DEVELOPER_TEAM_ID`
   - Value: your Apple Developer Team ID (10 characters, from [developer.apple.com/account](https://developer.apple.com/account) → Membership).

---

## 4. When you’re satisfied and ready to deploy

1. **Run the workflow:** Repo → **Actions** → “iOS Power Prayer — App Store build” → **Run workflow**.
2. When it finishes, open the run and **download the artifact** (the .ipa).
3. **Upload to App Store Connect:** Either use [Codemagic](https://codemagic.io) (connect this repo; it can build and upload for you), or add App Store Connect API key as secrets and uncomment the upload step in the workflow (see DEPLOY-FROM-PC.md).
4. In [App Store Connect](https://appstoreconnect.apple.com): create the app (bundle ID `com.prayerauthority.powerprayer`), attach the build, fill in listing and price ($10), submit for review.

You never need a Mac; the build runs on GitHub’s (or Codemagic’s) Macs.
