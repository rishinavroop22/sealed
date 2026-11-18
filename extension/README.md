# Sealed for Chrome: seal before you paste

People paste lab reports into AI chatbots to understand them, along with their name, phone number, address and hospital ID. This extension catches that paste on ChatGPT, Gemini, Claude, Copilot, Perplexity, DeepSeek, Grok and Meta AI, and offers to seal the report on the device first.

- **On-device only.** Sealing uses pattern rules plus Gemini Nano through Firebase AI Logic with `InferenceMode.ONLY_ON_DEVICE`. The extension never calls a cloud model and sends nothing anywhere.
- **Nothing is pasted until you choose:** *Seal and paste*, *Paste original* or *Cancel*.
- **Restore names** in the chatbot's answer from the toolbar popup. The restore key lives in `chrome.storage.session` and is cleared when Chrome closes.
- Shares its sealing rules with the web app (`web/js/redact.js`, `web/js/health.js`).

## Install (developer mode)

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and choose the `extension/dist` folder.
3. Paste a lab report into a supported chatbot, or try the test page at https://rishinavroop22.github.io/sealed/demo-chat.html.

Gemini Nano needs desktop Chrome 138 or later with the on-device model downloaded (open the Sealed web app once). Without it, the extension seals with pattern rules and says so.

## Build

```
cd extension
npm install
npm run build
```

Chrome extensions may not load code from the internet, so the Firebase JS SDK is bundled into `dist/`.
