import { sealText, unseal, deviceStatus } from "./sealer.js";

const $ = (id) => document.getElementById(id);

chrome.storage.sync.get({ enabled: true }, (v) => { $("enabled").checked = v.enabled; });
$("enabled").addEventListener("change", () => chrome.storage.sync.set({ enabled: $("enabled").checked }));

deviceStatus().then((s) => {
  $("status").textContent = s === "available" ? "Gemini Nano: ready on this device" : `Gemini Nano: ${s}. Pattern rules still work.`;
  $("status").className = s === "available" ? "ok" : "warn";
});

$("seal").addEventListener("click", async () => {
  const raw = $("in").value.trim();
  if (!raw) return;
  $("seal").disabled = true; $("seal").textContent = "Sealing on this device…";
  try {
    const r = await sealText(raw);
    await chrome.storage.session.set({ lastMap: r.map, lastCount: r.count, lastAt: Date.now() });
    $("in").value = r.sealed;
    $("note").textContent = `${r.count} personal detail${r.count === 1 ? "" : "s"} hidden${r.usedModel ? " with Gemini Nano and pattern rules" : " with pattern rules"}. Copy it into any chatbot.`;
    $("copy").hidden = false;
  } catch (err) {
    $("note").textContent = "Could not seal: " + (err?.message || err);
  }
  $("seal").disabled = false; $("seal").textContent = "Seal on this device";
});

$("copy").addEventListener("click", async () => {
  await navigator.clipboard.writeText($("in").value);
  $("copy").textContent = "Copied";
  setTimeout(() => { $("copy").textContent = "Copy"; }, 1500);
});

$("restore").addEventListener("click", async () => {
  const { lastMap } = await chrome.storage.session.get("lastMap");
  if (!lastMap) { $("restored").textContent = "Nothing sealed in this browser session yet."; return; }
  $("restored").textContent = unseal($("answer").value, lastMap);
});
