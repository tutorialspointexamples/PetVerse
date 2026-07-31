# PetVerse Android (Capacitor)

## Prerequisites
- Node.js + npm
- Android Studio / Android SDK (for a real device or emulator build)

## Setup
```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Mic talk-back needs the `RECORD_AUDIO` permission in the AndroidManifest (Capacitor prompts on first use in modern WebView).

## Monetization
Ads and IAP use mock stubs in `src/monetization/stubs.ts` until store SDKs are wired.
