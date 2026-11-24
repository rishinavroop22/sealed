# Devpost submission draft

## Project name
Sealed

## Tagline
A private health record for your family's lab reports: understand them, track them over years, and never give up anyone's identity.

## Inspiration
In India, lab reports arrive on WhatsApp as PDFs and photos, and people increasingly paste them into AI chatbots to understand them. Each report carries a full name, date of birth, phone number, address, hospital ID and the doctor's name, all sent to a server along with the health data. We wanted the explanation without the exposure.

## What it does
Sealed reads a lab report or prescription (pasted text, a PDF or a photo) with Gemini Nano running inside Chrome. It removes every identifier, shows the user exactly what is left, and only then sends that sealed text to a cloud Gemini model for a plain-language explanation in English or one of eight Indian languages. Names are put back on the device for display, so the explanation reads naturally while the cloud only ever saw tokens like [NAME_1].

Reports are saved to a health timeline per family member, so values like HbA1c, creatinine and liver enzymes can be followed across years and different labs, with each lab's reference range shaded on the chart. A fixed on-device check flags dangerous values ("contact a doctor today") the moment a report is added, before any AI runs and even offline. Explanations can be read aloud in Indian languages, and a one-page sheet can be printed for the next doctor's visit. A private, expiring link shows the doctor the results and trends with no names at all. The Android app does the same on the phone, including a report shared straight from WhatsApp, and a QR code links it to the laptop: the family's names travel inside the code, from screen to camera, and never through a server. A Chrome extension catches a lab report being pasted into ChatGPT, Gemini or another chatbot and seals it on the device first.

With no network, or in device-only mode, the on-device model writes the explanation and nothing is sent at all. A privacy ledger shows every AI call, where it ran, and the exact text of anything that left the device.

## How we built it
Every model call goes through Firebase AI Logic (the Web SDK, and the Kotlin SDK with Gemini Nano through AICore on Android), using four inference modes deliberately:

- ONLY_ON_DEVICE for reading photos and for sealing. The raw report must never reach the cloud, so there is no fallback by design.
- PREFER_IN_CLOUD for the full explanation: the best model when online, the on-device model offline.
- PREFER_ON_DEVICE for quick questions, set through Remote Config.
- ONLY_ON_DEVICE for everything in device-only mode.

Each response's inferenceSource labels the answer as "On this device" or "Cloud". Sealing uses two layers: pattern matching for fixed formats (phone numbers, email, Aadhaar, PAN, labelled IDs), then Gemini Nano with a JSON response constraint for free-form names, which our code validates and trims before use.

Other Firebase products: App Check (reCAPTCHA Enterprise on the web, Play Integrity on Android, with short-lived limited-use tokens for AI calls), Remote Config (cloud model and quick-question route), anonymous Authentication, and Cloud Firestore for a private history and a linked family timeline that store sealed text only; the key that restores names stays on the device. The Android app is Kotlin and Jetpack Compose. Its sealing and range-check code is tested to give exactly the same output as the web code on 74 reports, on the computer and on an Android device. The web app is plain HTML, CSS and JavaScript modules with no build step, hosted on GitHub Pages, and works offline through a service worker.

## Challenges
- The on-device model over-redacted at first, returning whole lines ("Remarks: Lakshmi reports tiredness…") and harmless fields like age. We added validation that trims labels, rejects sentences and checks each candidate's shape, and we hide stray first names once the full name is found.
- On a laptop without a strong GPU, Gemini Nano runs on the CPU, so sealing takes 10 to 20 seconds. We shortened the prompt, split long reports, and added a progress bar with a timer.
- The small on-device model sometimes states medical facts wrongly: in testing it called a normal platelet count "low" and linked a high TSH to the wrong thyroid condition. On-device prompts now only say what a test measures and where the value sits against its range, and the code checks every value against its reference range itself, correcting the label and logging the correction in the privacy ledger.
- Real reports are messy. On an actual lab PDF the patient's address was split across several lines, and on a phone photo the on-device reader first skipped the header with the patient's name. We added deterministic rules for labelled fields, street-style lines, PIN codes, city fields and house numbers, spread distinctive address words across the whole report, and told the reader to transcribe from the top so the header is sealed rather than silently dropped. After the fixes, a real PDF and two phone photos sealed with nothing identifying left and every test result kept.
- Knowing whether sealing works. We built a public test: 70 invented Indian reports with every identifier marked, scored by the app's own code, with every missed word shown. Twenty were written by Gemini after we froze the rules. On those, pattern rules alone rose from 58% to 80% of identifiers hidden, with 52 of 53 results and medicines left readable. Names written in free text are the weak spot (57%), which is what the on-device model and the review screen are for.
- Deciding which steps may fall back to the cloud. Sealing never does; that is the point.

## Accomplishments
- The cloud never sees the raw report, and the user can verify that word for word.
- A measured, public sealing score that shows its own misses.
- Hybrid inference used as a privacy architecture, not just a fallback.
- Explanations in Indian languages for families who read them better than English.

## What we learned
On-device and cloud models are good at different jobs. A small local model is well suited to finding names; a larger cloud model is better at explaining forty test results in Telugu. Putting the small one in front of the big one gives both privacy and quality.

## What's next
- Better sealing of names in free text, measured on the same public test.
- On-device explanations in Indian languages.
- An iPhone app, and testing with more families and labs.

## Built with
Written with an AI coding assistant (Claude). All code was written during the contest period.

firebase-ai-logic, gemini-nano, gemini, chrome-prompt-api, firebase-app-check, firebase-remote-config, firebase-authentication, cloud-firestore, recaptcha-enterprise, play-integrity, ml-kit, android, kotlin, jetpack-compose, pdf.js, javascript, html, css, github-pages

## Links
- Live demo: https://rishinavroop22.github.io/sealed/
- Sealing test: https://rishinavroop22.github.io/sealed/sealing-test.html
- Code: https://github.com/rishinavroop22/sealed
- Video: (add YouTube link)

## Testing instructions for judges
Open the live demo in desktop Chrome 139 or later and click "Try with a sample report" on the welcome card: it runs the whole flow on a sample family member with two earlier reports, so the health timeline is filled at once. The card also checks whether your Chrome has on-device AI and shows how to turn it on. For on-device AI, enable chrome://flags/#prompt-api-for-gemini-nano-multimodal-input and relaunch Chrome; the first run downloads Gemini Nano. Click "Use a sample report", then "Seal it on this device", review, then "Send sealed version for explanation". Try device-only mode, a quick question, or turning off Wi-Fi after the page has loaded once. Open the sealing test page to score the sealing code yourself. The Android app is in the `android` folder of the repository. In browsers without Gemini Nano the app still works, sealing with pattern matching only and saying so.
