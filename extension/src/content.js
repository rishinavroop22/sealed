// Watches pastes on AI chatbot sites. If the pasted text looks like a lab report with personal
// details, it offers to seal it on this device first. Nothing is pasted until the person chooses.
import { findPatternEntities } from "../shared/redact.js";
import { quickParse } from "../shared/health.js";

// Lets the Sealed web app and test page know the extension is active.
document.documentElement.dataset.sealedExtension = "on";

let enabled = true;
chrome.storage.sync.get({ enabled: true }, (v) => { enabled = v.enabled; });
chrome.storage.onChanged.addListener((c) => { if (c.enabled) enabled = c.enabled.newValue; });

const editable = (el) => el?.closest?.('textarea, input[type="text"], input:not([type]), [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]');

// Lab units next to a number ("9.8 g/dL", "83.3 U/L", "6.3 %"). Code, emails and notes rarely have them.
const LAB_UNIT = /\d\s*(?:mg\s*\/\s*d[lL]|g\s*\/\s*d[lL]|gm\s*\/\s*d[lL]|u\s*\/\s*l\b|iu\s*\/\s*m?l|uiu\s*\/\s*ml|µiu|meq\s*\/\s*l|mmol\s*\/\s*l|ng\s*\/\s*m[lL]|pg\s*\/\s*m[lL]|µg|mcg|\/\s*cumm|\/\s*µl|\/\s*ul\b|lakh|cells|\bfl\b|%)/i;

function looksLikeReport(text) {
  if (text.length < 60) return null;
  const lines = text.split(/\r?\n/);
  const labLines = lines.filter((l) => LAB_UNIT.test(l)).length;
  const tests = quickParse(text).filter((t) => LAB_UNIT.test(t.value)).length;
  const realUnits = lines.filter((l) => LAB_UNIT.test(l.replace(/\d\s*%/g, ""))).length; // "%" alone is common outside medicine
  if (labLines < 2 || tests < 2 || realUnits < 1) return null;
  return { tests, ids: findPatternEntities(text).length };
}

function insert(target, text) {
  target.focus();
  // insertText keeps the site's own editor (textarea or rich editor) in sync, like a real paste.
  if (!document.execCommand("insertText", false, text)) {
    if ("value" in target) {
      const s = target.selectionStart ?? target.value.length, e = target.selectionEnd ?? s;
      target.value = target.value.slice(0, s) + text + target.value.slice(e);
      target.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
}

let host = null;
function panel(html) {
  if (!host) {
    host = document.createElement("div");
    host.style.cssText = "position:fixed;right:20px;bottom:20px;z-index:2147483647;";
    host.attachShadow({ mode: "open" });
    document.documentElement.appendChild(host);
  }
  host.shadowRoot.innerHTML = `<style>
    .card{font:14px/1.45 system-ui,"Segoe UI",sans-serif;color:#1d1b16;background:#fffdf8;border:1px solid #e2d9c6;border-radius:14px;
      box-shadow:0 10px 30px rgba(0,0,0,.18);padding:16px 16px 14px;width:340px}
    .top{display:flex;align-items:center;gap:8px;margin-bottom:8px;font:600 16px Georgia,serif}
    .dot{width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#d4544a,#a8281d 60%,#7d1c14)}
    p{margin:0 0 10px}
    small{display:block;color:#6b6558;font-size:12.5px;margin-top:8px}
    .row{display:flex;gap:8px;flex-wrap:wrap}
    button{font:600 13.5px system-ui,sans-serif;border-radius:9px;padding:8px 12px;cursor:pointer;border:1px solid #e2d9c6;background:#fff;color:#1d1b16}
    button.p{background:#a8281d;border-color:#a8281d;color:#fff}
    .ok{color:#1f6f54;font-weight:600}
  </style><div class="card" role="dialog" aria-label="Sealed">${html}</div>`;
  return host.shadowRoot;
}
const close = () => { host?.remove(); host = null; };

document.addEventListener("paste", (ev) => {
  if (!enabled || ev.__sealed) return;
  const target = editable(ev.target);
  if (!target) return;
  const text = ev.clipboardData?.getData("text/plain") || "";
  const hit = looksLikeReport(text);
  if (!hit) return;
  ev.preventDefault();
  ev.stopImmediatePropagation();

  const root = panel(`
    <div class="top"><span class="dot"></span>Sealed</div>
    <p>This looks like a lab report${hit.ids ? ` with at least <b>${hit.ids}</b> personal detail${hit.ids === 1 ? "" : "s"}` : ""}. Seal it on this device before it goes to the chatbot?</p>
    <div class="row">
      <button class="p" data-a="seal">Seal and paste</button>
      <button data-a="orig">Paste original</button>
      <button data-a="cancel">Cancel</button>
    </div>
    <small>Sealing runs on this computer with Gemini Nano. Nothing is sent anywhere by Sealed.</small>`);

  root.addEventListener("click", async (e) => {
    const a = e.target?.dataset?.a;
    if (!a) return;
    if (a === "cancel") return close();
    if (a === "orig") { close(); return insert(target, text); }
    root.querySelector(".card").innerHTML = `<div class="top"><span class="dot"></span>Sealed</div><p>Sealing on this device…</p>`;
    const res = await chrome.runtime.sendMessage({ type: "seal", text });
    if (!res?.ok) {
      root.querySelector(".card").innerHTML = `<div class="top"><span class="dot"></span>Sealed</div><p>Could not seal: ${res?.error || "unknown error"}. Nothing was pasted.</p><div class="row"><button data-a="cancel">Close</button></div>`;
      return;
    }
    insert(target, res.sealed);
    root.querySelector(".card").innerHTML = `<div class="top"><span class="dot"></span>Sealed</div>
      <p class="ok">Pasted with ${res.count} personal detail${res.count === 1 ? "" : "s"} hidden.</p>
      <p>The chatbot sees tokens like [NAME_1]. To read its answer with names back, open the Sealed button in the toolbar and use “Restore names”.</p>
      <small>${res.usedModel ? "Sealed with pattern rules and Gemini Nano on this device." : "Sealed with pattern rules only (Gemini Nano is not available in this browser). Check the text before sending."}</small>
      <div class="row" style="margin-top:10px"><button data-a="cancel">Done</button></div>`;
  });
}, true);
