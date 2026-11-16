# Sealed

**Understand your medical report without giving up your identity.**

Sealed is a web app for patients and families. It reads a lab report or prescription with an AI model that runs inside the browser, removes everything that identifies the person, shows exactly what is left, and only then sends that sealed version to a cloud model for a full plain-language explanation.

Built for [#BuildHybridAI 2026](https://firebasehybridaihackathon.devpost.com/) with **Firebase AI Logic hybrid inference**.

## Why hybrid matters here

In most hybrid apps the cloud is a fallback. In Sealed, the split between device and cloud is the product:

| Step | Firebase AI Logic mode | Where it runs | Why |
|---|---|---|---|
| Find and remove identifiers | `ONLY_ON_DEVICE` | Gemini Nano in Chrome | The raw report must never leave the device, so there is deliberately no cloud fallback. |
| Quick questions | `PREFER_ON_DEVICE` | Device, else cloud | Private, free and works offline; falls back to the cloud on devices without a local model. |
| Full explanation | `PREFER_IN_CLOUD` | Cloud, else device | The larger model gives the best explanation, but only ever sees the sealed text. Offline, the device model answers instead. |

Every answer is labelled with where it ran (from `response.inferenceSource`), and the **privacy ledger** shows the exact text of anything sent to the cloud.

If a browser has no on-device model, Sealed falls back to pattern matching for sealing, tells the user plainly, and asks them to review the sealed text before anything is sent.

## How it works

1. **Add report**: paste the report text.
2. **Seal on this device**: pattern matching catches fixed-format identifiers (phone, email, IDs, labelled names). The on-device model then reads the full report and finds free-form identifiers such as a first name used in a remark.
3. **Check what leaves**: identifiers are replaced by tokens such as `[NAME_1]`. The user can hide more, or un-hide, before sending.
4. **Explanation**: the cloud model explains the sealed report. Names are put back on the device, for display only.

## Tech

- Firebase AI Logic (`firebase/ai`) for every model call: see `web/js/firebase.js`
- Firebase App Check (reCAPTCHA Enterprise; debug provider on localhost)
- Firebase Hosting
- Plain HTML, CSS and JavaScript modules loaded from Google's CDN. There is no build step.

## Run it locally

Requirements: Chrome 139 or later on desktop, with `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input` enabled for on-device AI.

```
python -m http.server 5173 --directory web
```

Open http://localhost:5173. On Windows you can double-click `start-local.bat` instead.

On first load, Chrome's console prints an App Check debug token. Register it in the Firebase console under App Check > Apps > Manage debug tokens to enable cloud calls from localhost. To use your own Firebase project, replace the values in `web/js/firebase-config.js`.

## Project layout

```
web/index.html          the app
web/css/app.css         styles
web/js/firebase.js      Firebase, App Check and the three hybrid models
web/js/redact.js        sealing logic (pure functions)
web/js/app.js           UI flow and privacy ledger
```

## Disclaimer

Sealed explains reports in plain language. It does not diagnose and is not a substitute for a doctor.

## License

Apache 2.0. See [LICENSE](LICENSE).
