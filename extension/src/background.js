// Routes sealing requests from chatbot pages to an offscreen extension page, where the
// on-device model can run. Keeps the latest restore key in session storage (cleared when the browser closes).
async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument?.()) return;
  try {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["DOM_PARSER"],
      justification: "Run the on-device AI model and pattern rules that remove personal details from pasted text.",
    });
  } catch (err) {
    if (!String(err).includes("single offscreen")) throw err;
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.target === "offscreen") return false;
  if (msg?.type === "seal") {
    (async () => {
      try {
        await ensureOffscreen();
        const res = await chrome.runtime.sendMessage({ target: "offscreen", type: "seal", text: msg.text });
        if (res?.ok) await chrome.storage.session.set({ lastMap: res.map, lastCount: res.count, lastAt: Date.now() });
        sendResponse(res?.ok ? { ok: true, sealed: res.sealed, count: res.count, usedModel: res.usedModel } : res);
      } catch (err) {
        sendResponse({ ok: false, error: String(err?.message || err) });
      }
    })();
    return true;
  }
  return false;
});
