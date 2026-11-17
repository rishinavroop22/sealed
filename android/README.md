# Sealed for Android

The same hybrid design as the web app, with Gemini Nano through Firebase AI Logic and ML Kit's Prompt API.

## Before the first build

1. In the Firebase console, add an Android app to the `sealed-hybrid-ai` project with package name `com.rishinavroop.sealed`.
2. Download `google-services.json` and put it in `android/app/`. It is git-ignored.
3. Open the `android` folder in Android Studio and let Gradle sync. If an import is flagged (the on-device SDK is a beta), use Alt+Enter.
4. Run on a phone with Gemini Nano (for example a Galaxy S25). Find the App Check debug token in Logcat (tag `DebugAppCheckProvider`) and register it in the Firebase console under App Check, Apps, Manage debug tokens.

## Routes

| Step | Mode |
|---|---|
| Read a photo | `ONLY_ON_DEVICE` |
| Seal | `ONLY_ON_DEVICE` |
| Explanation | `PREFER_IN_CLOUD`, or `ONLY_ON_DEVICE` in device-only mode |
| Quick questions | from Remote Config `quick_route` |

Share a photo of a report from WhatsApp or the gallery straight into Sealed.
