// Sealed: UI flow. The AI routes are defined in firebase.js, file reading in ingest.js,
// sealing logic in redact.js and saved history in store.js.
import {
  getModels, deviceModelStatus, warmDeviceModel, appCheckReady, debugToken, sourceOf, configReady,
} from "./firebase.js";
import { findPatternEntities, mergeEntities, seal, sealQuestion, unseal, chunk, readJson, checkFindings, countLine } from "./redact.js";
import { readFile } from "./ingest.js";
import {
  criticalFindings, quickParse, detectMonth, monthLabel, buildSeries, trendSentence, sparkline,
  speak, stopSpeaking, voiceFor, watchCloudAI, mergeResults, reconcile, trendFacts, notableFirst,
} from "./health.js";

const $ = (id) => document.getElementById(id);
// Wires an event to an element if it exists. A missing element (for example an older cached page)
// then disables only that one control instead of stopping the whole app.
function on(id, type, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(type, fn);
  else console.warn(`[Sealed] #${id} not found; reload the page to get the latest version.`);
}
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const state = {
  raw: "", entities: [], sealed: "", map: {}, device: "unavailable", usedModel: false,
  explanation: null, explainWhere: "", savedId: null, month: "",
};
const person = () => $("person").value || "me";
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
Sample Collected on: 06/11/2026

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

// ---------- sample family member ----------
// A built-in sample person with two earlier reports, so anyone trying Sealed sees the timeline at once.
// These are only numbers for the chart: no AI output is pre-written, and they never leave the browser.
const DEMO = { id: "demo", name: "Lakshmi (sample)" };
const demoResults = (hb, a1c, fbs, tsh, vitd, chol, crea) => [
  { test: "Haemoglobin", value: `${hb} g/dL`, reference: "12.0 - 15.0" },
  { test: "HbA1c", value: `${a1c} %`, reference: "< 5.7" },
  { test: "Fasting Blood Glucose", value: `${fbs} mg/dL`, reference: "70 - 100" },
  { test: "TSH", value: `${tsh} uIU/mL`, reference: "0.4 - 4.0" },
  { test: "Vitamin D (25-OH)", value: `${vitd} ng/mL`, reference: "30 - 100" },
  { test: "Total Cholesterol", value: `${chol} mg/dL`, reference: "< 200" },
  { test: "Serum Creatinine", value: `${crea} mg/dL`, reference: "0.6 - 1.1" },
];
const DEMO_ITEMS = [
  { id: "demo-1", profile: "demo", month: "2025-02", demo: true, results: demoResults(11.6, 5.5, 94, 2.8, 24, 192, 0.7) },
  { id: "demo-2", profile: "demo", month: "2025-09", demo: true, results: demoResults(10.7, 5.9, 104, 4.4, 19, 214, 0.8) },
];

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

  const watch = watchCloudAI();
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

  const aiRequests = await watch.stop();
  log("local", `Proof: ${aiRequests} request${aiRequests === 1 ? "" : "s"} to any cloud AI service while sealing (measured by the browser).`);
  state.entities = entities;
  state.month = detectMonth(raw);
  $("report-month").value = state.month;
  renderAlerts($("review-alert"), criticalFindings(quickParse(raw)), true);
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
// No model, on the device or in the cloud, may name or suggest a condition: only what the test measures
// and where the value sits against its range.
const SMALL_MODEL_RULE = "Only say what each test measures and whether the result is below, within or above its reference range. Do not name or suggest any disease, condition or cause, and do not guess.";

const EXPLAIN_PROMPT = (sealed, lang) => `You explain medical lab reports and prescriptions to patients in plain, calm language.
${SMALL_MODEL_RULE} This also applies to the summary and the questions.
The REPORT below has been anonymised: tokens like [NAME_1] or [DOCTOR_1] replace personal details. Keep those tokens unchanged if you refer to them.
Do not diagnose. Do not recommend specific medicines or doses. Encourage discussing results with a doctor.
Write every text value in ${lang}. Keep test names, numbers and units as in the report.
Return only JSON with this shape:
{"summary":"2-3 sentences on what this report covers; never count results or say which are low or high, the app does that",
 "urgent":"one sentence if any value needs prompt medical attention, otherwise empty string",
 "findings" (include EVERY test in the report, normal ones too):[{"test":"name","value":"value with unit","reference":"reference range","status":"low|normal|high|unclear","meaning":"1-2 plain sentences"}],
 "questions":["3 to 5 questions the patient could ask their doctor"]}

REPORT:
${sealed}`;

async function explain() {
  const btn = $("btn-explain");
  btn.disabled = true;
  state.explanation = null;
  $("explain-body").innerHTML = ""; $("explain-source").textContent = ""; $("btn-save").hidden = true;
  $("share-box").hidden = true; $("share-box").innerHTML = "";
  const useLocal = localOnly() || !navigator.onLine;
  const lang = useLocal ? "English" : language();
  $("explain-language").dataset.lang = lang;
  progress(true, useLocal ? "Writing the explanation on this device…" : "Sending the sealed version to the cloud model…");
  const prompt = EXPLAIN_PROMPT(state.sealed, lang);
  try {
    const m = await getModels();
    if (useLocal) await warmDeviceModel(null, ["deepLocal"]);
    const result = await (useLocal ? m.deepLocal : m.deep).generateContent(prompt);
    const where = sourceOf(result);
    const text = result.response.text();
    state.explanation = readJson(text) || { summary: text, findings: [], questions: [] };
    const fixed = reconcile(state.explanation.findings, quickParse(state.sealed));
    if (fixed) log("local", `Sealed replaced ${fixed} value${fixed === 1 ? "" : "s"} or range${fixed === 1 ? "" : "s"} the model copied wrongly from the report.`);
    const { corrected } = checkFindings(state.explanation);
    if (corrected) log("local", `Range check corrected ${corrected} result label${corrected === 1 ? "" : "s"} the model got wrong.`);
    state.explainWhere = where;
    log(where, where === "cloud"
      ? `Sealed report sent to the cloud model ${m.config.cloudModel} (${state.sealed.length} characters, ${Object.keys(state.map).length} identifiers hidden).`
      : "The on-device model wrote the explanation. Nothing was sent.", where === "cloud" ? state.sealed : null);
    renderExplanation(state.explanation, where, state.map);
    renderAlerts($("explain-alert"), criticalFindings(state.explanation.findings), false);
    $("btn-retry-cloud").hidden = true;
    if (useLocal && language() !== "English") $("explain-note").textContent = "On-device explanations are written in English. Turn off device-only mode for other languages.";
    else if (!useLocal && where === "device") {
      $("explain-note").textContent = "The cloud model was busy or failed, so Firebase AI Logic switched to the on-device model automatically. Nothing extra was sent.";
      $("btn-retry-cloud").hidden = false;
      log("device", "Cloud model unavailable: Firebase AI Logic fell back to the on-device model (PREFER_IN_CLOUD).");
    } else $("explain-note").textContent = "";
    $("btn-save").hidden = false; $("btn-save").disabled = false; $("btn-save").textContent = `Save to ${personName()}'s timeline`;
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
    ${countLine(data.findings) ? `<p class="count"><strong>${esc(countLine(data.findings))}</strong></p>` : ""}
    <p class="summary">${view(data.summary)}</p>
    ${data.urgent ? `<p class="urgent" role="alert">${view(data.urgent)}</p>` : ""}
    <div class="findings">${(data.findings || []).map((f) => `
      <div class="finding">
        <span class="status ${statusClass(f.status)}">${esc(f.status || "")}</span>
        <div class="name">${view(f.test)}</div>
        <div class="val">${view(f.value)}${f.reference ? ` · ref ${view(f.reference)}` : ""}</div>
        <p>${view(f.meaning)}</p>${f.checked ? `<p class="checked">Corrected by Sealed from the report</p>` : ""}
      </div>`).join("")}</div>
    ${data.questions?.length ? `<h3 class="qhead">Questions for your doctor</h3><ol class="questions">${data.questions.map((q) => `<li>${view(q)}</li>`).join("")}</ol>` : ""}`;
}

// ---------- quick questions ----------
async function ask(question) {
  // Seal the question too, in case it contains a name or number.
  const qSealed = sealQuestion(question, state.map);
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
      profile: person(), month: $("report-month").value || state.month,
      results: mergeResults(state.explanation?.findings, quickParse(state.raw)),
    }, state.map);
    btn.textContent = "Saved";
    log("cloud", `Saved the sealed copy to ${personName()}'s timeline (Firestore): sealed text, results and the month only. Names and the key that restores them stayed on this device.`, state.sealed);
    renderHistory();
  } catch (err) {
    console.warn("[Sealed] save failed:", err);
    btn.disabled = false; btn.textContent = `Save to ${personName()}'s timeline`;
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
  renderTimeline();
  const mine = historyItems.filter((h) => h.profile === person());
  if (!mine.length) { list.innerHTML = `<li class="empty">Nothing saved for ${esc(personName())} yet.${person() === DEMO.id ? " The two earlier sample reports are built in and only feed the timeline." : " Saved reports appear here, sealed."}</li>`; return; }
  list.innerHTML = mine.map((h) => {
    const key = store.localKey(h.id);
    const title = h.explanation?.findings?.slice(0, 3).map((f) => f.test).filter(Boolean).join(", ") || "Report";
    return `<li>
      <button type="button" class="hist-open" data-open="${esc(h.id)}">
        <span class="hist-title">${esc(title)}</span>
        <span class="hist-meta">${esc(monthLabel(h.month))} · ${h.hidden} hidden · ${esc(h.language)}${key ? "" : " · names not on this device"}</span>
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
  state.month = h.month; $("report-month").value = h.month || "";
  $("explain-language").dataset.lang = h.language || "English";
  state.entities = Object.values(map).map((t) => ({ text: t, type: "NAME", source: "you" }));
  renderExplanation(h.explanation || { summary: "", findings: [] }, h.where, map);
  renderAlerts($("explain-alert"), criticalFindings(h.explanation?.findings), false);
  $("explain-note").textContent = Object.keys(map).length ? "Opened from your history." : "Opened from your history. The names are not stored on this device, so tokens are shown instead.";
  $("btn-save").hidden = true;
  $("answers").innerHTML = "";
  log("local", "Opened a saved report from history.");
  show("step-explain"); setStep(4);
}

// ---------- people ----------
function allPeople() {
  return (store?.people() || [{ id: "me", name: "Me" }]).concat([DEMO]);
}
function personName(id = person()) {
  return allPeople().find((p) => p.id === id)?.name || "Me";
}
function renderPeople(selected) {
  const list = allPeople();
  $("person").innerHTML = list.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join("") + `<option value="__add">+ Add a family member…</option>`;
  $("person").value = selected && list.some((p) => p.id === selected) ? selected : list[0].id;
}

// ---------- critical alerts ----------
function renderAlerts(box, crit, beforeAI) {
  if (!crit.length) { box.hidden = true; box.innerHTML = ""; return; }
  box.hidden = false;
  box.innerHTML = `<strong>Contact a doctor today.</strong> ${crit.map((c) => `${esc(c.test)} is ${esc(c.why)} (${esc(c.value)})`).join("; ")}.
    <small>${beforeAI ? "Found by a fixed check on this device before any AI ran, so it works offline." : "Flagged by a fixed check on this device."} Thresholds are general adult values and are not a diagnosis.</small>`;
  log("local", `Critical-value check flagged ${crit.length} result${crit.length === 1 ? "" : "s"}. No AI involved.`);
}

// ---------- timeline ----------
async function renderTimeline() {
  const box = $("timeline");
  const mine = historyItems.filter((h) => h.profile === person()).concat(person() === DEMO.id ? DEMO_ITEMS : []);
  const series = buildSeries(mine);
  const dated = mine.filter((h) => h.month).length;
  $("timeline-who").textContent = `${personName()} · ${dated} dated report${dated === 1 ? "" : "s"}${person() === DEMO.id ? " (2 built-in samples)" : ""}`;
  if (!series.length) {
    box.innerHTML = `<p class="note">Save reports for ${esc(personName())} with their month, and values like HbA1c, creatinine or TSH will be tracked here across labs and years.</p>`;
    $("btn-trends").hidden = true;
    return;
  }
  const multi = notableFirst(series.filter((s) => s.points.length > 1));
  const show = (multi.length ? multi : series).slice(0, 12);
  box.innerHTML = `<div class="trend-grid">${show.map((s) => `
    <figure class="trend">
      <figcaption><strong>${esc(s.label)}</strong><span>${esc(s.reference ? "ref " + s.reference : "")}</span></figcaption>
      ${sparkline(s)}
      <p>${esc(trendSentence(s))}</p>
    </figure>`).join("")}</div>
    ${multi.length ? "" : `<p class="note">Only one dated report so far. Add another for ${esc(personName())} to see changes over time.</p>`}`;
  $("btn-trends").hidden = !multi.length;
  state.series = multi;
}

async function explainTrends() {
  const btn = $("btn-trends");
  const series = state.series || [];
  if (!series.length) return;
  btn.disabled = true;
  const facts = trendFacts(series.slice(0, 10));
  const prompt = `Rewrite these FACTS about one person's lab results over time as 3 to 5 plain, calm sentences for a patient.
Use only what the FACTS say: do not change any number, direction or "in range" / "above range" / "below range" label, and do not compare anything yourself.
Mention first the results that are now outside their range. Do not name any disease or cause. End by suggesting they show these changes to their doctor.

FACTS:
${facts}`;
  const out = $("trend-summary");
  out.hidden = false; out.textContent = "Writing a summary…";
  try {
    const m = await getModels();
    const local = localOnly() || !navigator.onLine;
    const result = await (local ? m.quickLocal : m.summary).generateContent(prompt);
    const where = sourceOf(result);
    out.innerHTML = `<span class="where ${where}">${where === "device" ? "On this device" : "Cloud"}</span> ${esc(result.response.text().trim())}
      <small class="facts-note">Directions and ranges were worked out by Sealed's code; the AI only put them into words.</small>`;
    log(where, where === "device" ? "Trend summary written on this device from code-computed facts. Nothing was sent." : "Trend summary: only test names, numbers and months were sent to the cloud.", where === "cloud" ? facts : null);
  } catch (err) {
    out.textContent = "Could not write the summary: " + (err?.message || err);
  }
  btn.disabled = false;
}

// ---------- read aloud and doctor sheet ----------
function spokenText() {
  const d = state.explanation; if (!d) return "";
  const u = (t) => unseal(t || "", state.map);
  return [u(d.summary), u(d.urgent), ...(d.findings || []).filter((f) => f.status !== "normal").map((f) => `${u(f.test)}: ${u(f.meaning)}`), ...(d.questions || []).map(u)].filter(Boolean).join(". ");
}
function readAloud() {
  const btn = $("btn-speak");
  if (btn.dataset.on) { stopSpeaking(); btn.dataset.on = ""; btn.textContent = "Read aloud"; return; }
  const lang = $("explain-language").dataset.lang || "English";
  const ok = speak(spokenText(), lang, () => { btn.dataset.on = ""; btn.textContent = "Read aloud"; });
  if (!ok) { $("explain-note").textContent = `This computer has no ${lang} voice installed. Add one in Windows Settings, Time & language, Speech.`; return; }
  btn.dataset.on = "1"; btn.textContent = "Stop reading";
  log("local", `Reading the explanation aloud in ${lang} with this computer's own voice. Nothing was sent.`);
}

function buildSheet() {
  const d = state.explanation || {};
  const u = (t) => esc(unseal(t || "", state.map));
  const abnormal = (d.findings || []).filter((f) => ["low", "high"].includes(String(f.status).toLowerCase()));
  const crit = criticalFindings(d.findings);
  const trends = (state.series || []).slice(0, 6);
  $("print-sheet").innerHTML = `
    <h1>Lab results to discuss</h1>
    <p class="meta">${esc(personName())} · ${esc(monthLabel($("report-month").value || state.month))} · prepared with Sealed</p>
    ${crit.length ? `<p class="crit">Needs prompt attention: ${crit.map((c) => `${esc(c.test)} ${esc(c.value)}`).join(", ")}</p>` : ""}
    <h2>Outside the reference range</h2>
    ${abnormal.length ? `<table><tr><th>Test</th><th>Result</th><th>Reference</th><th></th></tr>${abnormal.map((f) => `<tr><td>${u(f.test)}</td><td>${u(f.value)}</td><td>${u(f.reference)}</td><td>${esc(f.status)}</td></tr>`).join("")}</table>` : "<p>None.</p>"}
    ${trends.length ? `<h2>Changes over time</h2><ul>${trends.map((s) => `<li>${esc(trendSentence(s))}</li>`).join("")}</ul>` : ""}
    <h2>Questions</h2><ol>${(d.questions || []).map((q) => `<li>${u(q)}</li>`).join("")}</ol>
    <p class="foot">Plain-language summary, not a diagnosis. Results checked against each report's own reference ranges.</p>`;
}
// ---------- doctor share link ----------
// Tokens such as [NAME_1] are replaced with neutral words: the doctor already knows the patient,
// and names never leave this device.
function neutral(text) {
  return String(text ?? "")
    .replace(/\[NAME_\d+\]/g, "the patient")
    .replace(/\[DOCTOR_\d+\]/g, "the doctor")
    .replace(/\[(FACILITY|ADDRESS|ID|CONTACT|DOB)_\d+\]/g, "(hidden)");
}

async function shareWithDoctor() {
  const d = state.explanation;
  const box = $("share-box");
  if (!d) return;
  const btn = $("btn-share");
  btn.disabled = true;
  box.hidden = false;
  box.innerHTML = `<p class="note">Creating a private link…</p>`;
  try {
    await storeReady;
    if (!store) throw new Error("Sharing is not available in this browser.");
    const findings = (d.findings || []).map((f) => ({
      test: neutral(f.test), value: neutral(f.value), reference: neutral(f.reference || ""),
      status: String(f.status || "unclear").toLowerCase(), meaning: neutral(f.meaning || ""),
    }));
    const payload = {
      month: $("report-month").value || state.month || "",
      language: $("explain-language").dataset.lang || "English",
      summary: neutral(d.summary || ""),
      urgent: neutral(d.urgent || ""),
      findings,
      questions: (d.questions || []).map(neutral),
      trends: (state.series || []).slice(0, 8).map((s) => ({ label: s.label, unit: s.unit, reference: s.reference, points: s.points.map((p) => ({ month: p.month, value: p.value, status: p.status || "" })) })),
      critical: criticalFindings(d.findings).map((c) => ({ test: neutral(c.test), value: neutral(c.value), why: c.why })),
      where: state.explainWhere || "",
    };
    const { id, expiresAt } = await store.createShare(payload, 7);
    // The id goes after '#', which browsers never send to any server, so it stays out of server logs.
    const url = new URL(`share.html#${id}`, location.href).href;
    state.shareId = id;
    box.innerHTML = `
      <strong>Private link for the doctor</strong>
      <div class="link"><input id="share-url" type="text" readonly value="${esc(url)}" aria-label="Share link"><button class="ghost" id="btn-copy-share" type="button">Copy</button></div>
      <small>Shows the results, ranges, changes over time and questions. No names, addresses or IDs. Expires ${expiresAt.toLocaleDateString()}.</small>
      <button class="ghost" id="btn-stop-share" type="button">Stop sharing now</button>`;
    log("cloud", `Created a doctor link (expires ${expiresAt.toLocaleDateString()}): results, ranges, trends and questions only. No names.`, JSON.stringify(payload, null, 2));
  } catch (err) {
    console.warn("[Sealed] share failed:", err);
    box.innerHTML = `<p class="note warn">Could not create the link: ${esc(err?.message || err)}</p>`;
  }
  btn.disabled = false;
}

function printSheet() {
  buildSheet();
  log("local", "Prepared a one-page sheet for the doctor, on this device.");
  window.print();
}

// ---------- first-run guidance ----------
const WELCOME = "sealed.welcome.v1";
function showWelcome() {
  let hidden = false;
  try { hidden = localStorage.getItem(WELCOME) === "hidden"; } catch {}
  $("welcome").hidden = hidden;
  if (!hidden) updateReadiness();
}
function mark(li, kind, text) {
  const m = $(li).querySelector(".mark"), t = $(li).querySelector("span:last-child");
  m.className = "mark " + kind; m.textContent = kind === "ok" ? "✓" : "!";
  t.innerHTML = text;
}
async function updateReadiness() {
  if ($("welcome").hidden) return;
  const status = state.device || (await deviceModelStatus());
  if (status === "available") mark("ready-device", "ok", "On-device AI (Gemini Nano) is ready in this browser.");
  else if (status === "downloadable" || status === "downloading") mark("ready-device", "ok", "On-device AI is supported. Gemini Nano downloads on the first run (a few minutes).");
  else { mark("ready-device", "warn", "On-device AI is not turned on in this browser. Sealed will use pattern rules only. <a href=\"#setup\" id=\"open-setup\">How to turn it on</a>"); $("setup").hidden = false; }
  mark("ready-cloud", navigator.onLine ? "ok" : "warn", navigator.onLine ? "Online: cloud explanations are available, for sealed text only." : "Offline: explanations will be written on this device.");
}
async function tour() {
  $("btn-tour").disabled = true;
  $("btn-sample").click();
  $("step-add").scrollIntoView({ behavior: "smooth", block: "start" });
  await sealReport();
  $("btn-tour").disabled = false;
  log("local", "Sample run: next, read what will leave, then press the red button to get the explanation.");
}

// ---------- wiring ----------
on("btn-sample", "click", () => {
  $("report").value = SAMPLE; $("file-note").hidden = true;
  if (person() !== DEMO.id) {
    $("person").value = DEMO.id;
    $("trend-summary").hidden = true;
    renderHistory();
    log("local", "Switched to the sample family member, who has two earlier built-in reports for the timeline.");
  }
  $("report").focus();
});
on("btn-file", "click", () => $("file-input").click());
on("file-input", "change", (ev) => { loadFile(ev.target.files?.[0]); ev.target.value = ""; });
const drop = $("step-add");
drop.addEventListener("dragover", (ev) => { ev.preventDefault(); drop.classList.add("drag"); });
drop.addEventListener("dragleave", () => drop.classList.remove("drag"));
drop.addEventListener("drop", (ev) => { ev.preventDefault(); drop.classList.remove("drag"); loadFile(ev.dataTransfer.files?.[0]); });

on("btn-seal", "click", sealReport);
on("btn-tour", "click", tour);
on("welcome-close", "click", () => {
  $("welcome").hidden = true;
  try { localStorage.setItem(WELCOME, "hidden"); } catch {}
});
on("welcome", "click", (ev) => { if (ev.target.id === "open-setup") { ev.preventDefault(); $("setup").open = true; $("setup").scrollIntoView({ behavior: "smooth", block: "nearest" }); } });
addEventListener("online", updateReadiness);
addEventListener("offline", updateReadiness);
on("btn-explain", "click", explain);
on("btn-save", "click", saveCurrent);
on("btn-speak", "click", readAloud);
on("btn-retry-cloud", "click", () => { $("btn-retry-cloud").hidden = true; explain(); });
on("btn-print", "click", printSheet);
on("btn-share", "click", shareWithDoctor);
on("share-box", "click", async (ev) => {
  if (ev.target.id === "btn-copy-share") {
    $("share-url").select();
    try { await navigator.clipboard.writeText($("share-url").value); ev.target.textContent = "Copied"; } catch { document.execCommand("copy"); ev.target.textContent = "Copied"; }
  }
  if (ev.target.id === "btn-stop-share" && state.shareId) {
    ev.target.disabled = true;
    try {
      await store.deleteShare(state.shareId);
      $("share-box").innerHTML = `<p class="note">Sharing stopped. The link no longer works.</p>`;
      log("local", "Stopped sharing: the doctor link was deleted.");
      state.shareId = null;
    } catch (err) { ev.target.disabled = false; log("local", "Could not stop sharing: " + (err?.message || err)); }
  }
});
on("btn-trends", "click", explainTrends);
on("person", "change", () => {
  if ($("person").value === "__add") {
    $("add-person").hidden = false; $("new-person").focus();
    renderPeople(); return;
  }
  $("trend-summary").hidden = true;
  renderHistory();
});
on("form-person", "submit", (ev) => {
  ev.preventDefault();
  const name = $("new-person").value.trim();
  if (!name || !store) return;
  const id = store.addPerson(name);
  $("new-person").value = ""; $("add-person").hidden = true;
  renderPeople(id);
  log("local", `Added ${name}. The name is stored only in this browser.`);
  renderHistory();
});
on("btn-back", "click", () => { show("step-add"); $("step-review").hidden = true; setStep(1); });
on("btn-new", "click", () => {
  $("report").value = ""; $("file-note").hidden = true;
  $("step-review").hidden = true; $("step-explain").hidden = true; show("step-add"); setStep(1);
});
on("local-only", "change", () => {
  $("language").disabled = localOnly();
  if (!$("step-review").hidden) renderReview();
  log("local", localOnly() ? "Device-only mode on: nothing will be sent to the cloud." : "Device-only mode off: the sealed version may be sent to the cloud.");
});
on("hidden-list", "click", (ev) => {
  const value = ev.target?.dataset?.unhide;
  if (!value) return;
  state.entities = state.entities.filter((e) => e.text !== value);
  renderReview();
});
on("form-hide", "submit", (ev) => {
  ev.preventDefault();
  const value = $("hide-input").value.trim();
  if (value && state.raw.toLowerCase().includes(value.toLowerCase())) {
    state.entities = mergeEntities(state.entities, [{ text: value, type: "NAME", source: "you" }], state.raw);
    renderReview();
  }
  $("hide-input").value = "";
});
on("form-ask", "submit", (ev) => {
  ev.preventDefault();
  const q = $("ask-input").value.trim();
  if (q) { ask(q); $("ask-input").value = ""; }
});
on("history-list", "click", async (ev) => {
  const open = ev.target.closest("[data-open]")?.dataset.open;
  const del = ev.target.closest("[data-del]")?.dataset.del;
  if (open) openSaved(open);
  if (del) {
    ev.target.disabled = true;
    try { await store.removeReport(del); log("local", "Deleted a saved report."); } catch (err) { console.warn(err); }
    renderHistory();
  }
});

refreshStatus().then(showWelcome);
storeReady.then(() => { renderPeople(); renderHistory(); });
if ("speechSynthesis" in self) speechSynthesis.getVoices();
configReady.then((c) => { $("chip-model").textContent = `Cloud model: ${c.cloudModel}`; });
if (debugToken) {
  const dev = $("dev-banner");
  dev.hidden = false;
  dev.querySelector("code").textContent = debugToken;
}
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  navigator.serviceWorker.register("sw.js").catch((err) => console.warn("[Sealed] offline cache unavailable:", err));
}
