# Sealed for Android

The same hybrid design as the web app: Gemini Nano on the phone and Gemini in the cloud, both through Firebase AI Logic.

## What it does

1. **Add a report.** Paste it, pick a photo or PDF, share one from WhatsApp or the gallery, or select text in any app and choose "Seal this report".
2. **Seal it on the phone.** Pattern rules and the on-device model replace every identifier with a placeholder. A proof line shows the number of cloud AI requests made and the bytes Android counted leaving the app while sealing.
3. **Check what leaves.** Read the sealed text, hide more, or share the sealed version.
4. **Explain.** Only sealed text goes to the cloud model, in 9 Indian languages. Offline or in device-only mode, it stays on the phone.
5. **Code checks the AI.** Every high or low label comes from code and the range printed on the report. Dangerous values raise an alert before any AI runs.
6. **Privacy ledger.** Every step, with the exact text of every request, including requests that failed.

## Routes

| Step | Mode |
|---|---|
| Read a photo | Bundled text recognition, plus `ONLY_ON_DEVICE` when the phone has Gemini Nano. The model's text is used only if its numbers match |
| Read a PDF | Bundled text recognition (on the phone) |
| Seal | Pattern rules, plus `ONLY_ON_DEVICE` |
| Explanation | `PREFER_IN_CLOUD`; `ONLY_ON_DEVICE` when offline or in device-only mode |
| Quick questions | `PREFER_ON_DEVICE` (set by Remote Config `quick_route`); `ONLY_ON_DEVICE` when offline or in device-only mode |

On phones without Gemini Nano, sealing uses pattern rules only and says so. The report is never sent to the cloud to be sealed.

## Build

You need Android Studio (or JDK 17+ and the Android SDK) and your own Firebase project.

1. In the Firebase console, add an Android app with package name `com.rishinavroop.sealed`.
2. Download `google-services.json` into `android/app/`. It is git-ignored. Never commit it.
3. Open the `android` folder in Android Studio and press Run, or run `./gradlew :app:assembleDebug`.
4. In Logcat, filter by `DebugAppCheckProvider` and copy the debug token. Register it in the Firebase console under App Check, Apps, Manage debug tokens. Without it, cloud explanations fall back to the phone.

If the project is in a folder with non-English letters on Windows, `gradlew` cannot start from there. Build from Android Studio, or use an installed Gradle 8.14.3. To keep build output out of a synced folder, add this line to `local.properties`:

```
sealed.buildDir=C:/some/folder
```

Minimum Android version: 9 (API 28). Gemini Nano needs a supported phone, for example a Galaxy S25 or Pixel 9, with a locked bootloader.

## Tests

`ParityTest` checks that the Kotlin sealing and range-check code gives the same output as the web app's JavaScript. It runs on the JVM and on a phone, because Android has a different regular-expression engine. All test reports are invented.

```
node android/parity.mjs                     # refresh expected output from web/js
./gradlew :app:testDebugUnitTest            # on the computer
./gradlew :app:connectedDebugAndroidTest    # on a phone or emulator
```
