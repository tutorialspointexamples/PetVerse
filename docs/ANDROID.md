# PetVerse Android (Capacitor)

Browser virtual-pet game packaged for Play Store–style distribution via Capacitor.

## Prerequisites
- Node.js 20+ and npm
- Android Studio / Android SDK (API 24+)
- JDK 17

## Setup
```bash
npm install
npm run build
npx cap add android   # first time only
npx cap sync android
npx cap open android
```

Or use the helper scripts:
```bash
npm run cap:sync
npm run cap:android
```

## Permissions
Mic talk-back needs `RECORD_AUDIO` in `AndroidManifest.xml` (Capacitor WebView prompts on first use).

Suggested manifest snippet (already typical for Capacitor apps):
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

## Store packaging checklist
1. Set `appId` / display name in `capacitor.config.json` (PetVerse branding — not Outfit7 IDs).
2. Generate release keystore; configure `android/app/build.gradle` signing.
3. Bump `versionCode` / `versionName` before each Play upload.
4. `npm run build && npx cap sync android`
5. Build signed AAB from Android Studio (Build → Generate Signed Bundle).
6. Provide Play Console screenshots, short/full description, content rating, privacy policy URL.
7. Wire real ads/IAP SDKs before production (see Monetization).

## Monetization
Ads and IAP use mock stubs in `src/monetization/stubs.ts` until store SDKs are wired:
- Rewarded ad → coins + fuel (skipped instantly if Remove Ads owned)
- Coin packs, fuel can, style pack, Remove Ads (persisted as `adFree`)

Replace stubs with:
- [Google Play Billing](https://developer.android.com/google/play/billing) via a Capacitor plugin
- [AdMob Rewarded](https://developers.google.com/admob/android/rewarded) (or preferred network)

Keep the game fully playable offline without purchases (MTT2 parity).

## Offline
Progress saves to `localStorage` (`petverse-save-v4`). No network is required after install for core care, travel, mini-games, or skills.
