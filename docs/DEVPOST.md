# Devpost submission draft

## Project name
Sealed

## Tagline
Understand your medical report without giving up your identity.

## Inspiration
In India, lab reports arrive on WhatsApp as PDFs and photos, and people increasingly paste them into AI chatbots to understand them. Each report carries a full name, date of birth, phone number, address, hospital ID and the doctor's name, all sent to a server along with the health data. We wanted the explanation without the exposure.

## What it does
Sealed reads a lab report or prescription (pasted text, a PDF or a photo) with Gemini Nano running inside Chrome. It removes every identifier, shows the user exactly what is left, and only then sends that sealed text to a cloud Gemini model for a plain-language explanation in English or one of eight Indian languages. Names are put back on the device for display, so the explanation reads naturally while the cloud only ever saw tokens like [NAME_1].

With no network, or in device-only mode, the on-device model writes the explanation and nothing is sent at all. A privacy ledger shows every AI call, where it ran, and the exact text of anything that left the device.

## How we built it
Every model call goes through the Firebase AI Logic Web SDK, using four inference modes deliberately:

- ONLY_ON_DEVICE for reading photos and for sealing. The raw report must never reach the cloud, so there is no fallback by design.
- PREFER_IN_CLOUD for the full explanation: the best model when online, the on-device model offline.
- PREFER_ON_DEVICE for quick questions, set through Remote Config.
- ONLY_ON_DEVICE for everything in device-only mode.

Each response's inferenceSource labels the answer as "On this device" or "Cloud". Sealing uses two layers: pattern matching for fixed formats (phone numbers, email, Aadhaar, PAN, labelled IDs), then Gemini Nano with a JSON response constraint for free-form names, which our code validates and trims before use.

Other Firebase products: App Check (reCAPTCHA Enterprise, debug provider on localhost), Remote Config (cloud model and quick-question route), anonymous Authentication, and Cloud Firestore for a private history that stores sealed text only; the key that restores names stays in the browser. The app is plain HTML, CSS and JavaScript modules with no build step, hosted on GitHub Pages, and works offline through a service worker.

## Challenges
- The on-device model over-redacted at first, returning whole lines ("Remarks: Lakshmi reports tiredness…") and harmless fields like age. We added validation that trims labels, rejects sentences and checks each candidate's shape, and we hide stray first names once the full name is found.
- On a laptop without a strong GPU, Gemini Nano runs on the CPU, so sealing takes 10 to 20 seconds. We shortened the prompt, split long reports, and added a progress bar with a timer.
- The small on-device model sometimes states medical facts wrongly: in testing it called a normal platelet count "low" and linked a high TSH to the wrong thyroid condition. On-device prompts now only say what a test measures and where the value sits against its range, and the code checks every value against its reference range itself, correcting the label and logging the correction in the privacy ledger.
- Deciding which steps may fall back to the cloud. Sealing never does; that is the point.

## Accomplishments
- The cloud never sees the raw report, and the user can verify that word for word.
- Hybrid inference used as a privacy architecture, not just a fallback.
- Explanations in Indian languages for families who read them better than English.

## What we learned
On-device and cloud models are good at different jobs. A small local model is well suited to finding names; a larger cloud model is better at explaining forty test results in Telugu. Putting the small one in front of the big one gives both privacy and quality.

## What's next
- The Android version with Gemini Nano through Firebase AI Logic.
- Doctor share links that show only the sealed report.
- Tracking a value such as HbA1c across saved reports.

## Built with
firebase-ai-logic, gemini-nano, gemini, chrome-prompt-api, firebase-app-check, firebase-remote-config, firebase-authentication, cloud-firestore, recaptcha-enterprise, pdf.js, javascript, html, css, github-pages

## Links
- Live demo: https://rishinavroop22.github.io/sealed/
- Code: https://github.com/rishinavroop22/sealed
- Video: (add YouTube link)

## Testing instructions for judges
Open the live demo in desktop Chrome 139 or later. For on-device AI, enable chrome://flags/#prompt-api-for-gemini-nano-multimodal-input and relaunch Chrome; the first run downloads Gemini Nano. Click "Use a sample report", then "Seal it on this device", review, then "Send sealed version for explanation". Try device-only mode, a quick question, or turning off Wi-Fi after the page has loaded once. In browsers without Gemini Nano the app still works, sealing with pattern matching only and saying so.
