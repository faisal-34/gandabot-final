# GandaBot — App Store & Play Store Deployment Guide

Package ID: `com.gandabot.app` (new business developer account)

---

## Prerequisites

- Node.js 18+
- Java 17+ (for Android builds)
- Android Studio (for Android)
- Xcode 15+ on macOS (for iOS)
- Apple Developer account (business)
- Google Play Console account (business)

---

## Step 1 — Generate App Icons

Place your 512×512 source PNG at `public/icons/icon-source.png`, then:

```bash
npm install
npm run icons
```

This generates all required sizes in `public/icons/`.

---

## Step 2 — Google Play Store (TWA — Trusted Web Activity)

TWA wraps your live PWA (`https://www.gandabot.com`) in a native Android shell.
No Kotlin/Java code needed — it's 100% your web app.

### 2a. Install Bubblewrap

```bash
npm install -g @bubblewrap/cli
bubblewrap doctor   # installs JDK + Android SDK if missing
```

### 2b. Create a signing keystore (ONE TIME — keep this safe!)

```bash
keytool -genkey -v \
  -keystore android.keystore \
  -alias gandabot \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**⚠️ Never commit `android.keystore` to git — add it to `.gitignore`**

### 2c. Get your SHA-256 fingerprint

```bash
keytool -list -v -keystore android.keystore -alias gandabot
```

Copy the `SHA256:` value (looks like `AB:CD:EF:...`) and paste it into:
`public/.well-known/assetlinks.json` → `sha256_cert_fingerprints`

Deploy the updated file to production so Google can verify ownership.

### 2d. Initialise the TWA project

```bash
npm run twa:init
# Answer prompts — it reads twa-manifest.json automatically
```

This creates an `android-twa/` directory.

### 2e. Build the APK / AAB

```bash
cd android-twa
npm run twa:build
# Output: app-release-signed.apk and app-release-signed.aab
```

Upload the `.aab` to Google Play Console → Production → New release.

### 2f. Verify TWA verification on device

After publishing, open Chrome on Android, navigate to your site — it should
open in full-screen without the Chrome URL bar (the TWA verification passed).

---

## Step 3 — Apple App Store (Capacitor)

Capacitor wraps your live web app in a native iOS/Android shell with full
native plugin support.

### 3a. Install Capacitor native platforms

```bash
npm install
npx cap add ios
npx cap add android
```

### 3b. Sync web assets to native

```bash
npm run build       # builds Next.js
npx cap sync        # copies to ios/ and android/
```

### 3c. Open in Xcode

```bash
npm run cap:open:ios
```

In Xcode:
1. Set **Team** to your Apple business developer account
2. Change **Bundle Identifier** to `com.gandabot.app`
3. Set **Version** to `1.0.0` and **Build** to `1`
4. Select **Any iOS Device (arm64)** as the target
5. **Product → Archive** to create a release build
6. Upload to App Store Connect via **Organizer**

### 3d. App Store Connect setup

1. Create new app at appstoreconnect.apple.com
2. Bundle ID: `com.gandabot.app`
3. Fill in: name, subtitle, description, screenshots, keywords
4. Submit for review

---

## Step 4 — Update flow (after code changes)

### Play Store update

```bash
# 1. Bump appVersionCode in twa-manifest.json
# 2. Rebuild
cd android-twa && npm run twa:build
# 3. Upload new .aab to Play Console
```

### App Store update

```bash
npm run build
npx cap sync
# Open Xcode → bump version → Archive → Upload
```

---

## Environment Variables (Vercel / Production)

Ensure these are set in your Vercel project:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://www.gandabot.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase → Settings → API |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From Clerk dashboard |
| `CLERK_SECRET_KEY` | From Clerk dashboard |

---

## File Structure Added

```
public/
  manifest.json              ← PWA manifest
  .well-known/
    assetlinks.json          ← TWA Digital Asset Links (Play Store)
  icons/
    icon-source.png          ← YOUR SOURCE ICON (add this!)
    icon-72x72.png           ← generated
    icon-96x96.png           ← generated
    icon-192x192.png         ← generated
    icon-512x512.png         ← generated
    icon-maskable-192x192.png ← generated
    icon-maskable-512x512.png ← generated

twa-manifest.json            ← Bubblewrap TWA config
capacitor.config.ts          ← Capacitor iOS/Android config
scripts/
  generate-icons.mjs         ← Icon generation script
android-twa/                 ← Created by bubblewrap init (gitignore)
ios/                         ← Created by cap add ios (gitignore)
android/                     ← Created by cap add android (gitignore)
android.keystore             ← YOUR KEYSTORE (NEVER commit this!)
```

---

## .gitignore additions needed

```
android.keystore
android-twa/
ios/
android/
public/icons/icon-*.png
public/sw.js
public/workbox-*.js
```
