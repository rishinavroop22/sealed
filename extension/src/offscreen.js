import { sealText } from "./sealer.js";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.target !== "offscreen" || msg.type !== "seal") return false;
  sealText(msg.text)
    .then((r) => sendResponse({ ok: true, ...r }))
    .catch((err) => sendResponse({ ok: false, error: String(err?.message || err) }));
  return true;
});
