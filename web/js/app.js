// Sealed: UI flow. The three AI routes are defined in firebase.js.
import {
  sealerModel, quickModel, deepModel,
  deviceModelStatus, warmDeviceModel, appCheckReady, debugToken,
} from "./firebase.js";
import {
  findPatternEntities, mergeEntities, seal, unseal, chunk, readJson,
} from "./redact.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const state = { raw: "", entities: [], sealed: "", map: {}, device: "unavailable", usedModel: false };

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
    available: ["On-device model: ready", "ok"],
    downloadable: ["On-device model: will download on first use", "warn"],
    downloading: ["On-device model: downloading…", "warn"],
    unavailable: ["On-device model: not available in this browser", "warn"],
  }[state.device] || ["On-device model: unknown", "warn"];
  chip.textContent = label[0];
  chip.className = "chip " + label[1];
  const net = $("chip-net");
  net.textContent = navigator.onLine ? "Network: online" : "Network: offline";
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
      ${e.payload ? `<details><summary>${e.where === "cloud" ? "See exactly what was sent" : "See what the model read"}</summary><pre>${esc(e.payload)}</pre></details>` : ""}
    </li>`).join("");
}
const sourceOf = (result) =>
  String(result?.response?.inferenceSource || "").toLowerCase().includes("device") ? "device" : "cloud";

function setStep(n) {
  document.querySelectorAll(".rail li").forEach((li) => {
    const s = Number(li.dataset.step);
    li.className = s < n ? "done" : s === n ? "on" : "";
  });
}

// ---------- step 1 -> 2: seal on device ----------
const SEAL_PROMPT = (text) => `You are a privacy filter for medical documents.
Find the personal identifiers in the DOCUMENT: names of the patient, relatives and doctors,
names of hospitals and labs, street addresses, ID numbers, phone numbers, emails, dates of birth.

Rules:
- Copy ONLY the identifying words themselves, exactly as written. Never include the field label.
  Example: from "Patient Name: Mr. Ravi Kumar" return "Mr. Ravi Kumar", not the whole line.
  Example: from "Remarks: Ravi feels dizzy" return "Ravi", not the sentence.
- Never return test names, results, units, reference ranges, age, sex or whole sentences.
- Each item must be a short phrase from a single line.

Return only JSON: {"entities":[{"text":"...","type":"NAME|DOCTOR|FACILITY|ADDRESS|ID|CONTACT|DOB"}]}

DOCUMENT:
${text}`;

async function sealReport() {
  const raw = $("report").value.trim();
  if (!raw) { $("report").focus(); return; }
  const btn = $("btn-seal"), note = $("seal-progress");
  btn.disabled = true; note.hidden = false; note.className = "note";
  note.textContent = "Finding identifiers with pattern matching…";
  state.raw = raw;

  let entities = findPatternEntities(raw);
  log("local", `Pattern matching found ${entities.length} identifiers. No AI, no network.`);

  state.usedModel = false;
  await refreshStatus();
if (debugToken) {
  const dev = $("dev-banner");
  dev.hidden = false;
  dev.querySelector("code").textContent = debugToken;
}
  if (state.device !== "unavailable") {
    try {
      note.textContent = state.device === "available"
        ? "Reading the report with the on-device model…"
        : "Downloading the on-device model (first time only)…";
      await warmDeviceModel((p) => { note.textContent = `Downloading the on-device model: ${Math.round(p * 100)}%`; });
      const parts = chunk(raw);
      let found = [];
      for (let i = 0; i < parts.length; i++) {
        note.textContent = `Reading the report with the on-device model (part ${i + 1} of ${parts.length})…`;
        const result = await sealerModel.generateContent(SEAL_PROMPT(parts[i]));
        const json = readJson(result.response.text());
        if (json?.entities) found = found.concat(json.entities);
      }
      const before = entities.length;
      entities = mergeEntities(entities, found, raw);
      state.usedModel = true;
      log("device", `On-device model read the full report and found ${entities.length - before} more identifiers. Nothing was sent anywhere.`);
    } catch (err) {
      console.warn("[Sealed] on-device sealing failed:", err);
      log("local", "The on-device model could not run, so only pattern matching was used. The report was NOT sent to the cloud.");
    }
    await refreshStatus();
if (debugToken) {
  const dev = $("dev-banner");
  dev.hidden = false;
  dev.querySelector("code").textContent = debugToken;
}
  }

  state.entities = entities;
  renderReview();
  btn.disabled = false; note.hidden = true;
  $("step-add").hidden = true; $("step-review").hidden = false; $("step-explain").hidden = true;
  setStep(3);
  $("step-review").scrollIntoView({ behavior: "smooth", block: "start" });
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
    note.textContent = "The original never left this browser. Read the sealed version below; if anything personal is still visible, hide it before continuing.";
  } else {
    src.textContent = "Sealed by pattern matching only"; src.className = "where";
    note.className = "note warn";
    note.textContent = "This browser has no on-device AI model, so Sealed used pattern matching only and did not send your report anywhere. Please read the sealed version carefully and hide anything personal that remains.";
  }
}

// ---------- step 3: deep explanation ----------
const EXPLAIN_PROMPT = (sealed) => `You explain medical lab reports and prescriptions to patients in plain, calm language.
The REPORT below has been anonymised: tokens like [NAME_1] or [DOCTOR_1] replace personal details. Keep those tokens unchanged if you refer to them.
Do not diagnose. Do not recommend specific medicines or doses. Encourage discussing results with a doctor.
Return only JSON with this shape:
{"summary":"2-3 sentence overview",
 "urgent":"one sentence if any value needs prompt medical attention, otherwise empty string",
 "findings":[{"test":"name","value":"value with unit","reference":"reference range","status":"low|normal|high|unclear","meaning":"1-2 plain sentences"}],
 "questions":["3 to 5 questions the patient could ask their doctor"]}

REPORT:
${sealed}`;

async function explain() {
  const btn = $("btn-explain");
  btn.disabled = true; btn.textContent = "Sending sealed version…";
  const prompt = EXPLAIN_PROMPT(state.sealed);
  try {
    const result = await deepModel.generateContent(prompt);
    const where = sourceOf(result);
    log(where, where === "cloud"
      ? `Sealed report sent to the cloud model (${state.sealed.length} characters, ${Object.keys(state.map).length} identifiers hidden).`
      : "No network, so the on-device model wrote the explanation. Nothing was sent.", state.sealed);
    renderExplanation(readJson(result.response.text()), result.response.text(), where);
  } catch (err) {
    console.error("[Sealed] explanation failed:", err);
    $("explain-body").innerHTML = `<p class="note warn">The explanation could not be generated. ${appCheckReady ? "" : "Cloud access is not configured for this site yet. "}${esc(err?.message || err)}</p>`;
    $("explain-source").textContent = "";
    log("local", "Explanation request failed. Nothing was received.");
  }
  btn.disabled = false; btn.textContent = "Send sealed version for explanation";
  $("step-explain").hidden = false; setStep(4);
  $("step-explain").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderExplanation(data, rawText, where) {
  const src = $("explain-source");
  src.textContent = where === "device" ? "Written on this device" : "Written in the cloud from the sealed version";
  src.className = "where " + where;
  const show = (s) => esc(unseal(s, state.map)); // names restored locally, for your eyes only
  if (!data) { $("explain-body").innerHTML = `<p class="summary">${show(rawText)}</p>`; return; }
  $("explain-body").innerHTML = `
    <p class="summary">${show(data.summary)}</p>
    ${data.urgent ? `<p class="urgent">${show(data.urgent)}</p>` : ""}
    <div class="findings">${(data.findings || []).map((f) => `
      <div class="finding">
        <span class="status ${esc(String(f.status || "").toLowerCase())}">${esc(f.status || "")}</span>
        <div class="name">${show(f.test)}</div>
        <div class="val">${show(f.value)}${f.reference ? ` · ref ${show(f.reference)}` : ""}</div>
        <p>${show(f.meaning)}</p>
      </div>`).join("")}</div>
    ${data.questions?.length ? `<h3 style="margin-top:18px">Questions for your doctor</h3><ol class="questions">${data.questions.map((q) => `<li>${show(q)}</li>`).join("")}</ol>` : ""}`;
}

// ---------- quick questions (prefer on-device) ----------
async function ask(question) {
  // Seal the question too, in case it contains a name or number.
  const extra = findPatternEntities(question);
  const qSealed = seal(question, mergeEntities(state.entities.filter((e) => question.toLowerCase().includes(e.text.toLowerCase())), extra, question)).sealed;
  const box = document.createElement("div");
  box.className = "answer";
  box.innerHTML = `<div class="q">${esc(question)}</div><div class="a">Thinking…</div>`;
  $("answers").prepend(box);
  const prompt = `Answer the patient's QUESTION about their anonymised lab REPORT in at most 4 plain sentences. Do not diagnose or prescribe.

REPORT:
${state.sealed}

QUESTION: ${qSealed}`;
  try {
    const result = await quickModel.generateContent(prompt);
    const where = sourceOf(result);
    box.querySelector(".q").insertAdjacentHTML("beforeend", `<span class="where ${where}">${where === "device" ? "On this device" : "Cloud"}</span>`);
    box.querySelector(".a").textContent = unseal(result.response.text(), state.map);
    log(where, where === "device" ? "Quick question answered by the on-device model. Nothing was sent." : "Quick question and sealed report sent to the cloud model.", where === "cloud" ? prompt : null);
  } catch (err) {
    box.querySelector(".a").textContent = "Could not answer: " + (err?.message || err);
  }
}

// ---------- wiring ----------
$("btn-sample").addEventListener("click", () => { $("report").value = SAMPLE; $("report").focus(); });
$("btn-seal").addEventListener("click", sealReport);
$("btn-explain").addEventListener("click", explain);
$("btn-back").addEventListener("click", () => { $("step-add").hidden = false; $("step-review").hidden = true; setStep(1); });
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

refreshStatus();
if (debugToken) {
  const dev = $("dev-banner");
  dev.hidden = false;
  dev.querySelector("code").textContent = debugToken;
}
