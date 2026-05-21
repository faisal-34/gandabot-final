# iOS Native Feature Setup

Steps to complete after `npx cap sync ios` and opening in Xcode.

## 1. Siri Shortcuts — Info.plist

Add these entries to `ios/App/App/Info.plist` inside the root `<dict>`:

```xml
<key>NSUserActivityTypes</key>
<array>
  <string>com.gandabot.app.translate</string>
  <string>com.gandabot.app.chat</string>
  <string>com.gandabot.app.pronounce</string>
</array>
```

Then in Xcode → Signing & Capabilities → add the **Siri** capability.

## 2. AVFoundation TTS — no Xcode changes needed

`@capacitor-community/text-to-speech` uses `AVSpeechSynthesizer` automatically
when running on a real iOS device. No additional capability is required.

## 3. Siri URL Scheme — Info.plist

Verify `gandabot` URL scheme is registered (Capacitor adds this, but confirm):

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>gandabot</string>
    </array>
  </dict>
</array>
```

## 4. Offline Storage — no Xcode changes needed

`@capacitor/preferences` writes to `UserDefaults` automatically on iOS.
No capability or entitlement required.

## 5. Build & sync

```bash
npm run build
npx cap sync ios
npx cap open ios   # opens Xcode
```

Build → Product → Archive → Distribute App → App Store Connect.
