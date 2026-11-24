// The sealing test page. Uses the same rules, prompt and on-device model as the app.
import { CASES } from "./sealing-cases.js";
import { parseCase, scoreCase, total } from "./sealing-score.js";
import { findPatternEntities, mergeEntities, chunk, readJson, SEAL_PROMPT } from "./redact.js";
import { getModels, deviceModelStatus, warmDeviceModel } from "./firebase.js";
import { watchCloudAI } from "./health.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const PARSED = CASES.map(parseCase);
const inSet = () => PARSED.filter((p) => p.set === $("set").value);
const ai = new Map(); // parsed case -> score with the on-device model
let recorded = null, running = false;

const pct = (c) => (c.all ? Math.round((100 * (c.hidden ?? c.kept)) / c.all) : 0);
const cell = (c) => (c ? `<strong>${pct(c)}%</strong> <small>${c.hidden ?? c.kept} of ${c.all}</small>` : "–");
const ROWS = [
  ["All identifiers", (t) => t.all], ["Direct identifiers (names, IDs, contacts, birth dates)", (t) => t.direct],
  ["Names of patients and relatives", (t) => t.byType.NAME], ["ID numbers", (t) => t.byType.ID], ["Phone and email", (t) => t.byType.CONTACT],
  ["Dates of birth", (t) => t.byType.DOB], ["Doctors and staff", (t) => t.byType.DOCTOR], ["Labs, hospitals, companies", (t) => t.byType.FACILITY],
  ["Addresses", (t) => t.byType.ADDRESS], ["Results and medicines kept", (t) => t.results],
];

function render() {
  const cases = inSet();
  const rules = cases.map((p) => scoreCase(p, findPatternEntities(p.text)));
  const done = cases.filter((p) => ai.has(p));
  const ruleTotal = total(rules);
  const live = done.length === cases.length ? total(done.map((p) => ai.get(p))) : null;
  const saved = recorded?.[$("set").value];
  const aiTotal = live || (done.length ? null : saved?.total);
  $("score").innerHTML = ROWS.map(([label, get]) => `<tr><th scope="row">${esc(label)}</th><td>${cell(get(ruleTotal))}</td><td>${aiTotal ? cell(get(aiTotal)) : "–"}</td></tr>`).join("")
    + `<tr><th scope="row">Other text hidden by mistake</th><td>${ruleTotal.extra} items</td><td>${aiTotal ? aiTotal.extra + " items" : "–"}</td></tr>`;
  $("recorded").hidden = !!live || !saved || done.length > 0;
  if (saved) $("recorded").textContent = `The on-device AI column is a recorded run: ${saved.model}, ${saved.date}. Run it here to check.`;
  $("copy").hidden = !live;
  $("cases").innerHTML = cases.map((p, i) => {
    const s = ai.get(p) || rules[i];
    const missed = s.items.filter((x) => x.state !== "hidden");
    const words = [...new Set(missed.flatMap((x) => x.seen))].sort((a, b) => b.length - a.length);
    let html = esc(s.sealed).replace(/\[([A-Z]+_\d+)\]/g, '<mark class="tok">$1</mark>');
    for (const w of words) html = html.replace(new RegExp(`(?<![\\p{L}\\p{M}\\p{N}])${esc(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{M}\\p{N}])(?![^<]*>)`, "giu"), '<mark class="leak">$&</mark>');
    const ok = s.items.length - missed.length;
    return `<details class="case"><summary>${esc(p.kind)} <span class="where ${missed.length ? "" : "device"}">${ok} of ${s.items.length} hidden${ai.has(p) ? ", with AI" : ", rules only"}</span></summary><pre class="paper" tabindex="0">${html}</pre></details>`;
  }).join("");
}

async function run() {
  if (running) return;
  running = true;
  $("run").disabled = true; $("set").disabled = true;
  const cases = inSet();
  cases.forEach((p) => ai.delete(p));
  const watch = watchCloudAI();
  const started = Date.now();
  try {
    $("status").textContent = "Loading the on-device model…";
    await warmDeviceModel((p) => { $("status").textContent = `Downloading the on-device model: ${Math.round(p * 100)}%`; }, ["sealer"]);
    const { sealer } = await getModels();
    for (let i = 0; i < cases.length; i++) {
      const p = cases[i];
      const left = i ? Math.ceil((((Date.now() - started) / i) * (cases.length - i)) / 60000) : null;
      $("status").textContent = `Report ${i + 1} of ${cases.length}${left ? `, about ${left} min left` : ""}. Keep this tab open.`;
      let found = [];
      for (const part of chunk(p.text, 2400)) {
        const r = await sealer.generateContent(SEAL_PROMPT(part));
        found = found.concat(readJson(r.response.text())?.entities || []);
      }
      ai.set(p, scoreCase(p, mergeEntities(findPatternEntities(p.text), found, p.text)));
      render();
    }
    const n = await watch.stop();
    $("proof").textContent = `${n} cloud AI requests during the run`;
    $("status").textContent = `Finished in ${Math.max(1, Math.round((Date.now() - started) / 60000))} min.`;
  } catch (err) {
    console.warn("[Sealed] sealing test failed:", err);
    await watch.stop();
    $("status").textContent = "The on-device model could not run in this browser. The pattern rules column still works.";
  }
  running = false;
  $("run").disabled = false; $("set").disabled = false;
  render();
}

$("set").addEventListener("change", render);
$("run").addEventListener("click", run);
$("copy").addEventListener("click", async () => {
  const cases = inSet();
  const chrome = navigator.userAgentData?.brands?.find((b) => /Chrome/.test(b.brand))?.version || "";
  const out = { [$("set").value]: { date: new Date().toISOString().slice(0, 10), model: `Gemini Nano in Chrome ${chrome}`.trim(), total: total(cases.map((p) => ai.get(p))) } };
  try { await navigator.clipboard.writeText(JSON.stringify(out)); $("copy").textContent = "Copied"; } catch { $("status").textContent = JSON.stringify(out); }
});

render();
fetch("sealing-result.json").then((r) => (r.ok ? r.json() : null)).then((j) => { recorded = j; render(); }).catch(() => {});
deviceModelStatus().then((s) => {
  const chip = $("chip-device");
  chip.textContent = { available: "On-device AI: ready", downloadable: "On-device AI: downloads on first use", downloading: "On-device AI: downloading…" }[s] || "On-device AI: not in this browser";
  chip.className = "chip " + (s === "available" ? "ok" : "warn");
  if (s === "unavailable") { $("run").disabled = true; $("status").textContent = "This browser has no on-device AI, so only the rules column can run here."; }
});
