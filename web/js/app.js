// Sealed: UI flow. The AI routes are defined in firebase.js, file reading in ingest.js,
// sealing logic in redact.js and saved history in store.js.
import {
  getModels, deviceModelStatus, warmDeviceModel, appCheckReady, debugToken, sourceOf, configReady,
} from "./firebase.js";
import { findPatternEntities, mergeEntities, seal, unseal, chunk, readJson, checkFindings } from "./redact.js";
import { readFile } from "./ingest.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const state = {
  raw: "", entities: [], sealed: "", map: {}, device: "unavailable", usedModel: false,
  explanation: null, explainWhere: "", savedId: null,
};
const localOnly = () => $("local-only").checked;
const language = () => $("language").value;

// History is optional: if Firestore cannot load (offline first visit, blocked), the app still works.
let store = null;
const storeReady = import("./store.js").then((m) => (store = m)).catch((err) => {
  console.warn("[Sealed] history unavailable:", err);
  return null;
});

const SAMPLE = `CITY DIAGNOSTICS & RESEARCH CENTRE
Road No. 12, Banjara Hills, Hyderabad 500034   Ph: 040-2335 0000

Patient Name: Mrs. Lakshmi Devi Rao        Age: 54 Years    Sex: Female
UHID: HYD/2291/88        Lab No: CD-774120
Ref. By: Dr. Arvind Menon        Phone: +91 98480 12345
Address: Flat 302, Sai Residency, Jubilee Hills, Hyderabad
DOB: 14/03/1972

TEST                     RESULT      UNIT        REFERENCE RANGE
Haemoglobin              9.8         g/dL        12.0 - 15.0
Total WBC Count          7,400       /cumm       4,000 - 11,000
Platelet Count           2.6         lakh/cumm   1.5 - 4.5
Fasting Blood Glucose    118         mg/dL       70 - 100
HbA1c                    6.3         %           < 5.7
TSH                      6.9         uIU/mL      0.4 - 4.0
Total Cholesterol        231         mg/dL       < 200
Vitamin D (25-OH)        14          ng/mL       30 - 100
Serum Creatinine         0.8         mg/dL       0.6 - 1.1

Remarks: Lakshmi reports tiredness for two months. Kindly correlate clinically.
Reported by Dr. S. Fatima Khan, MD (Pathology)`;

// ---------- status chips ----------
async function refreshStatus() {
  state.device = await deviceModelStatus();
  const chip = $("chip-device");
  const label = {
    available: ["On-device AI: ready", "ok"],
    downloadable: ["On-device AI: downloads on first use", "warn"],
    downloading: ["On-device AI: downloading…", "warn"],
    unavailable: ["On-device AI: not in this browser", "warn"],
  }[state.device] || ["On-device AI: unknown", "warn"];
  chip.textContent = label[0];
  chip.className = "chip " + label[1];
  const net = $("chip-net");
  net.textContent = navigator.onLine ? "Online" : "Offline";
  net.className = "chip " + (navigator.onLine ? "cloud" : "warn");
}
addEventListener("online", refreshStatus);
addEventListener("offline", refreshStatus);

// ---------- ledger ----------
const ledger = [];
function log(where, what, payload) {
  ledger.unshift({ where, what, payload, at: new Date() });
  $("ledger").innerHTML = ledger.map((e) => `
    <li>
      <span class="where ${e.where === "device" ? "device" : e.where === "cloud" ? "cloud" : ""}">${e.where === "device" ? "On this device" : e.where === "cloud" ? "Cloud" : "Local code"}</span>
      <span>${esc(e.what)} <small>${e.at.toLocaleTimeString()}</small></span>
      ${e.payload ? `<details><summary>${e.where === "cloud" ? "See exactly what was sent" : "See the text"}</summary><pre>${esc(e.payload)}</pre></details>` : ""}
    </li>`).join("");
}

function setStep(n) {
  document.querySelectorAll(".rail li").forEach((li) => {
    const s = Number(li.dataset.step);
    li.className = s < n ? "done" : s === n ? "on" : "";
  });
}
function show(section) {
  $(section).hidden = false;
  $(section).scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- progress ----------
let timer = null;
function progress(on, text = "") {
  const box = $("progress");
  clearInterval(timer);
  if (!on) { box.hidden = true; return; }
  box.hidden = false;
  const started = Date.now();
  const tick = () => { $("progress-time").textContent = `${Math.round((Date.now() - started) / 1000)}s`; };
  $("progress-text").textContent = text;
  tick(); timer = setInterval(tick, 500);
}
const say = (text) => { $("progress-text").textContent = text; };

// ---------- step 1: get the report ----------
async function loadFile(file) {
  if (!file) return;
  const note = $("file-note");
  note.hidden = false; note.className = "note";
  progress(true, "Reading the file on this device…");
  try {
    const { text, how } = await readFile(file, say);
    if (!text.trim()) throw new Error("No text found in this file.");
    $("report").value = text;
    const label = { "pdf-text": "Text taken from the PDF", "pdf-scan": "Scanned PDF read by the on-device model", image: "Photo read by the on-device model", text: "Text file loaded" }[how];
    note.textContent = `${label}. Nothing was uploaded. Check the text below, then seal it.`;
    log(how === "image" || how === "pdf-scan" ? "device" : "local", `${label} (${file.name}). Nothing was uploaded.`);
  } catch (err) {
    console.warn("[Sealed] file read failed:", err);
    note.className = "note warn";
    note.textContent = /device|LanguageModel|available/i.test(String(err))
      ? "Reading photos needs the on-device model, which this browser does not have. Paste the text instead, or use a PDF."
      : `Could not read this file: ${err?.message || err}`;
  }
  progress(false);
}

// ---------- step 1 -> 2: seal on device ----------
const SEAL_PROMPT = (text) => `List the personal identifiers in this medical document: names of the patient, relatives and doctors; hospital and lab names; street addresses; ID numbers; phone numbers; emails; dates of birth.
Copy only the identifying words exactly as written, never the field label or a whole sentence. Never list tests, results, units, ranges, age or sex.
Return JSON: {"entities":[{"text":"...","type":"NAME|DOCTOR|FACILITY|ADDRESS|ID|CONTACT|DOB"}]}

DOCUMENT:
${text}`;

async function sealReport() {
  const raw = $("report").value.trim();
  if (!raw) { $("report").focus(); return; }
  const btn = $("btn-seal");
  btn.disabled = true;
  state.raw = raw; state.savedId = null;
  progress(true, "Finding identifiers with pattern matching…");

  let entities = findPatternEntities(raw);
  log("local", `Pattern matching found ${entities.length} identifiers. No AI, no network.`);

  state.usedModel = false;
  await refreshStatus();
  if (state.device !== "unavailable") {
    try {
      say(state.device === "available" ? "Reading the report with the on-device model…" : "Downloading the on-device model (first time only)…");
      await warmDeviceModel((p) => say(`Downloading the on-device model: ${Math.round(p * 100)}%`), ["sealer"]);
      const { sealer } = await getModels();
      const parts = chunk(raw, 2400);
      let found = [];
      for (let i = 0; i < parts.length; i++) {
        say(parts.length > 1 ? `On-device model reading part ${i + 1} of ${parts.length}…` : "On-device model reading the report…");
        const result = await sealer.generateContent(SEAL_PROMPT(parts[i]));
        const json = readJson(result.response.text());
        if (json?.entities) found = found.concat(json.entities);
      }
      const before = entities.length;
      entities = mergeEntities(entities, found, raw);
      state.usedModel = true;
      log("device", `On-device model read the full report and found ${Math.max(0, entities.length - before)} more identifiers. Nothing was sent anywhere.`);
    } catch (err) {
      console.warn("[Sealed] on-device sealing failed:", err);
      log("local", "The on-device model could not run, so only pattern matching was used. The report was NOT sent to the cloud.");
    }
    await refreshStatus();
  }

  state.entities = entities;
  renderReview();
  btn.disabled = false;
  progress(false);
  $("step-add").hidden = true; $("step-explain").hidden = true;
  show("step-review"); setStep(3);
}

function renderReview() {
  const { sealed, map } = seal(state.raw, state.entities);
  state.sealed = sealed; state.map = map;
  $("sealed-view").innerHTML = esc(sealed).replace(/\[([A-Z]+_\d+)\]/g, '<mark class="tok">$1</mark>');
  const items = Object.entries(map);
  $("hidden-count").textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;
  $("hidden-list").innerHTML = items.map(([ph, original]) => {
    const e = state.entities.find((x) => x.text === original);
    return `<li><span class="ph">${esc(ph.slice(1, -1))}</span><span class="orig">${esc(original)}</span>
      <span class="src">${e?.source === "pattern" ? "pattern" : e?.source === "you" ? "you" : "on-device AI"}</span>
      <button type="button" data-unhide="${esc(original)}" aria-label="Stop hiding ${esc(original)}">×</button></li>`;
  }).join("") || "<li>No identifiers found. Check the text and hide anything personal yourself.</li>";

  const src = $("seal-source"), note = $("seal-note");
  if (state.usedModel) {
    src.textContent = "Sealed by on-device AI"; src.className = "where device";
    note.className = "note";
    note.textContent = "The original never left this browser. Read the sealed version; if anything personal is still visible, hide it before continuing.";
  } else {
    src.textContent = "Sealed by pattern matching only"; src.className = "where";
    note.className = "note warn";
    note.textContent = "This browser has no on-device AI model, so Sealed used pattern matching only and did not send your report anywhere. Read the sealed version carefully and hide anything personal that remains.";
  }
  const btn = $("btn-explain");
  btn.textContent = localOnly() || !navigator.onLine ? "Explain on this device" : "Send sealed version for explanation";
}

// ---------- step 3: explanation ----------
// The small on-device model can state medical facts wrongly, so on-device prompts are stricter:
// what the test measures and where the value sits against its range, never a condition or cause.
const SMALL_MODEL_RULE = "Only say what each test measures and whether the result is below, within or above its reference range. Do not name or suggest any disease, condition or cause, and do not guess.";

const EXPLAIN_PROMPT = (sealed, lang, small = false) => `You explain medical lab reports and prescriptions to patients in plain, calm language.${small ? "\n" + SMALL_MODEL_RULE : ""}
The REPORT below has been anonymised: tokens like [NAME_1] or [DOCTOR_1] replace personal details. Keep those tokens unchanged if you refer to them.
Do not diagnose. Do not recommend specific medicines or doses. Encourage discussing results with a doctor.
Write every text value in ${lang}. Keep test names, numbers and units as in the report.
Return only JSON with this shape:
{"summary":"2-3 sentence overview",
 "urgent":"one sentence if any value needs prompt medical attention, otherwise empty string",
 "findings":[{"test":"name","value":"value with unit","reference":"reference range","status":"low|normal|high|unclear","meaning":"1-2 plain sentences"}],
 "questions":["3 to 5 questions the patient could ask their doctor"]}

REPORT:
${sealed}`;

async function explain() {
  const btn = $("btn-explain");
  btn.disabled = true;
  const useLocal = localOnly() || !navigator.onLine;
  const lang = useLocal ? "English" : language();
  progress(true, useLocal ? "Writing the explanation on this device…" : "Sending the sealed version to the cloud model…");
  const prompt = EXPLAIN_PROMPT(state.sealed, lang, useLocal);
  try {
    const m = await getModels();
    if (useLocal) await warmDeviceModel(null, ["deepLocal"]);
    const result = await (useLocal ? m.deepLocal : m.deep).generateContent(prompt);
    const where = sourceOf(result);
    const text = result.response.text();
    state.explanation = readJson(text) || { summary: text, findings: [], questions: [] };
    const { corrected } = checkFindings(state.explanation);
    if (corrected) log("local", `Range check corrected ${corrected} result label${corrected === 1 ? "" : "s"} the model got wrong.`);
    state.explainWhere = where;
    log(where, where === "cloud"
      ? `Sealed report sent to the cloud model ${m.config.cloudModel} (${state.sealed.length} characters, ${Object.keys(state.map).length} identifiers hidden).`
      : "The on-device model wrote the explanation. Nothing was sent.", where === "cloud" ? state.sealed : null);
    renderExplanation(state.explanation, where, state.map);
    if (useLocal && language() !== "English") $("explain-note").textContent = "On-device explanations are written in English. Turn off device-only mode for other languages.";
    else $("explain-note").textContent = "";
    $("btn-save").hidden = false; $("btn-save").disabled = false; $("btn-save").textContent = "Save sealed copy to history";
  } catch (err) {
    console.error("[Sealed] explanation failed:", err);
    $("explain-body").innerHTML = `<p class="note warn">The explanation could not be generated. ${useLocal ? "This browser's on-device model could not run. " : appCheckReady ? "" : "Cloud access is not configured for this site yet. "}${esc(err?.message || err)}</p>`;
    $("explain-source").textContent = "";
    $("btn-save").hidden = true;
    log("local", "Explanation request failed. Nothing was received.");
  }
  progress(false);
  btn.disabled = false;
  $("answers").innerHTML = "";
  show("step-explain"); setStep(4);
}

function renderExplanation(data, where, map) {
  const src = $("explain-source");
  src.textContent = where === "device" ? "Written on this device" : "Written in the cloud from the sealed version";
  src.className = "where " + where;
  const view = (s) => esc(unseal(s, map)); // names restored locally, for your eyes only
  const statusClass = (s) => ["low", "normal", "high"].includes(String(s).toLowerCase()) ? String(s).toLowerCase() : "unclear";
  $("explain-body").innerHTML = `
    <p class="summary">${view(data.summary)}</p>
    ${data.urgent ? `<p class="urgent" role="alert">${view(data.urgent)}</p>` : ""}
    <div class="findings">${(data.findings || []).map((f) => `
      <div class="finding">
        <span class="status ${statusClass(f.status)}">${esc(f.status || "")}</span>
        <div class="name">${view(f.test)}</div>
        <div class="val">${view(f.value)}${f.reference ? ` · ref ${view(f.reference)}` : ""}</div>
        <p>${view(f.meaning)}</p>${f.checked ? `<p class="checked">Label corrected by Sealed's range check</p>` : ""}
      </div>`).join("")}</div>
    ${data.questions?.length ? `<h3 class="qhead">Questions for your doctor</h3><ol class="questions">${data.questions.map((q) => `<li>${view(q)}</li>`).join("")}</ol>` : ""}`;
}

// ---------- quick questions ----------
async function ask(question) {
  // Seal the question too, in case it contains a name or number.
  const hits = state.entities.filter((e) => question.toLowerCase().includes(e.text.toLowerCase()));
  const qSealed = seal(question, mergeEntities(hits, findPatternEntities(question), question)).sealed;
  const box = document.createElement("div");
  box.className = "answer";
  box.innerHTML = `<div class="q">${esc(question)}</div><div class="a">Thinking…</div>`;
  $("answers").prepend(box);
  const m = await getModels();
  const local = localOnly() || !navigator.onLine;
  // Quick questions may run on the small on-device model even when online (PREFER_ON_DEVICE), so always use the strict rule.
  const prompt = `Answer the patient's QUESTION about their anonymised lab REPORT in at most 3 plain sentences. ${SMALL_MODEL_RULE} Do not diagnose or prescribe. Suggest asking their doctor what it means for them.

REPORT:
${state.sealed}

QUESTION: ${qSealed}`;
  try {
    if (local) await warmDeviceModel(null, ["quickLocal"]);
    const result = await (local ? m.quickLocal : m.quick).generateContent(prompt);
    const where = sourceOf(result);
    box.querySelector(".q").insertAdjacentHTML("beforeend", ` <span class="where ${where}">${where === "device" ? "On this device" : "Cloud"}</span>`);
    box.querySelector(".a").textContent = unseal(result.response.text(), state.map);
    log(where, where === "device" ? "Quick question answered by the on-device model. Nothing was sent." : "Quick question and sealed report sent to the cloud model.", where === "cloud" ? prompt : null);
  } catch (err) {
    box.querySelector(".a").textContent = "Could not answer: " + (err?.message || err);
  }
}

// ---------- history ----------
async function saveCurrent() {
  const btn = $("btn-save");
  btn.disabled = true; btn.textContent = "Saving…";
  try {
    await storeReady;
    if (!store) throw new Error("History is not available in this browser.");
    state.savedId = await store.saveReport({
      sealed: state.sealed, explanation: state.explanation, where: state.explainWhere,
      language: localOnly() ? "English" : language(), hidden: Object.keys(state.map).length,
    }, state.map);
    btn.textContent = "Saved";
    log("cloud", "Saved the sealed copy to your private history (Firestore). The key that restores names stayed on this device.", state.sealed);
    renderHistory();
  } catch (err) {
    console.warn("[Sealed] save failed:", err);
    btn.disabled = false; btn.textContent = "Save sealed copy to history";
    log("local", `Could not save: ${err?.message || err}`);
  }
}

let historyItems = [];
async function renderHistory() {
  const list = $("history-list");
  await storeReady;
  if (!store) { list.innerHTML = `<li class="empty">History is not available in this browser.</li>`; return; }
  try {
    historyItems = await store.listReports();
  } catch (err) {
    console.warn("[Sealed] history load failed:", err);
    list.innerHTML = `<li class="empty">History could not be loaded${navigator.onLine ? "" : " while offline"}.</li>`;
    return;
  }
  if (!historyItems.length) { list.innerHTML = `<li class="empty">Nothing saved yet. Saved reports appear here, sealed.</li>`; return; }
  list.innerHTML = historyItems.map((h) => {
    const key = store.localKey(h.id);
    const title = h.explanation?.findings?.slice(0, 3).map((f) => f.test).filter(Boolean).join(", ") || "Report";
    return `<li>
      <button type="button" class="hist-open" data-open="${esc(h.id)}">
        <span class="hist-title">${esc(title)}</span>
        <span class="hist-meta">${h.createdAt.toLocaleDateString()} · ${h.hidden} hidden · ${esc(h.language)}${key ? "" : " · names not on this device"}</span>
      </button>
      <button type="button" class="hist-del" data-del="${esc(h.id)}" aria-label="Delete this saved report">Delete</button>
    </li>`;
  }).join("");
}

function openSaved(id) {
  const h = historyItems.find((x) => x.id === id);
  if (!h) return;
  const map = store?.localKey(id) || {};
  state.sealed = h.sealed; state.map = map; state.explanation = h.explanation; state.explainWhere = h.where;
  state.entities = Object.values(map).map((t) => ({ text: t, type: "NAME", source: "you" }));
  renderExplanation(h.explanation || { summary: "", findings: [] }, h.where, map);
  $("explain-note").textContent = Object.keys(map).length ? "Opened from your history." : "Opened from your history. The names are not stored on this device, so tokens are shown instead.";
  $("btn-save").hidden = true;
  $("answers").innerHTML = "";
  log("local", "Opened a saved report from history.");
  show("step-explain"); setStep(4);
}

// ---------- wiring ----------
$("btn-sample").addEventListener("click", () => { $("report").value = SAMPLE; $("file-note").hidden = true; $("report").focus(); });
$("btn-file").addEventListener("click", () => $("file-input").click());
$("file-input").addEventListener("change", (ev) => { loadFile(ev.target.files?.[0]); ev.target.value = ""; });
const drop = $("step-add");
drop.addEventListener("dragover", (ev) => { ev.preventDefault(); drop.classList.add("drag"); });
drop.addEventListener("dragleave", () => drop.classList.remove("drag"));
drop.addEventListener("drop", (ev) => { ev.preventDefault(); drop.classList.remove("drag"); loadFile(ev.dataTransfer.files?.[0]); });

$("btn-seal").addEventListener("click", sealReport);
$("btn-explain").addEventListener("click", explain);
$("btn-save").addEventListener("click", saveCurrent);
$("btn-back").addEventListener("click", () => { show("step-add"); $("step-review").hidden = true; setStep(1); });
$("btn-new").addEventListener("click", () => {
  $("report").value = ""; $("file-note").hidden = true;
  $("step-review").hidden = true; $("step-explain").hidden = true; show("step-add"); setStep(1);
});
$("local-only").addEventListener("change", () => {
  $("language").disabled = localOnly();
  if (!$("step-review").hidden) renderReview();
  log("local", localOnly() ? "Device-only mode on: nothing will be sent to the cloud." : "Device-only mode off: the sealed version may be sent to the cloud.");
});
$("hidden-list").addEventListener("click", (ev) => {
  const value = ev.target?.dataset?.unhide;
  if (!value) return;
  state.entities = state.entities.filter((e) => e.text !== value);
  renderReview();
});
$("form-hide").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const value = $("hide-input").value.trim();
  if (value && state.raw.toLowerCase().includes(value.toLowerCase())) {
    state.entities = mergeEntities(state.entities, [{ text: value, type: "NAME", source: "you" }], state.raw);
    renderReview();
  }
  $("hide-input").value = "";
});
$("form-ask").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const q = $("ask-input").value.trim();
  if (q) { ask(q); $("ask-input").value = ""; }
});
$("history-list").addEventListener("click", async (ev) => {
  const open = ev.target.closest("[data-open]")?.dataset.open;
  const del = ev.target.closest("[data-del]")?.dataset.del;
  if (open) openSaved(open);
  if (del) {
    ev.target.disabled = true;
    try { await store.removeReport(del); log("local", "Deleted a saved report."); } catch (err) { console.warn(err); }
    renderHistory();
  }
});

refreshStatus();
renderHistory();
configReady.then((c) => { $("chip-model").textContent = `Cloud model: ${c.cloudModel}`; });
if (debugToken) {
  const dev = $("dev-banner");
  dev.hidden = false;
  dev.querySelector("code").textContent = debugToken;
}
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  navigator.serviceWorker.register("sw.js").catch((err) => console.warn("[Sealed] offline cache unavailable:", err));
}
