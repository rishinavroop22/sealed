// Sealing logic. Pure functions: no network, no model calls, fully testable.
// Step A (here): pattern matching for identifiers with a fixed shape.
// Step B (app.js): the on-device model finds free-form identifiers; mergeEntities() adds them.

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const LABEL = {
  NAME: "NAME", DOCTOR: "DOCTOR", FACILITY: "FACILITY", ADDRESS: "ADDRESS",
  ID: "ID", CONTACT: "CONTACT", DOB: "DOB",
};

const PATTERNS = [
  { type: LABEL.CONTACT, re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { type: LABEL.CONTACT, re: /(?:\+91[\s-]?|\b0)?[6-9]\d{4}[\s-]?\d{5}\b/g },
  { type: LABEL.ID, re: /\b\d{4}[\s-]\d{4}[\s-]\d{4}\b/g }, // Aadhaar
  { type: LABEL.ID, re: /\b[A-Z]{5}\d{4}[A-Z]\b/g }, // PAN
];

// "Label: value" fields where the value is the identifier.
const FIELDS = [
  { type: LABEL.NAME, re: /\b(?:Patient(?:'s)?\s*Name|Name\s*of\s*Patient|Pt\.?\s*Name|Name)\s*[:\-]\s*([^\n\r]+?)(?=\s{2,}|\t|\s+(?:Age|Sex|Gender|DOB|UHID|MRN)\b|$)/gim },
  { type: LABEL.DOCTOR, re: /\b(?:Ref(?:erred|erring)?\.?\s*(?:By|Doctor|Dr\.?)|Consultant|Doctor|Physician|Pathologist)\s*[:\-]\s*([^\n\r]+?)(?=\s{2,}|\t|$)/gim },
  { type: LABEL.DOCTOR, re: /\bDr\.? ?[A-Z][a-zA-Z.]*(?: [A-Z][a-zA-Z.]+){0,2}/g, whole: true },
  { type: LABEL.ID, re: /\b(?:UHID|MRN|MR\s*No|Patient\s*ID|Reg(?:istration)?\.?\s*No|Lab\s*(?:No|ID)|Sample\s*(?:No|ID)|Bill\s*No|Accession\s*No|Barcode|IP\s*No|OP\s*No)\.?\s*[:#\-]?\s*([A-Z0-9][A-Z0-9\/\-]{3,})/gi },
  { type: LABEL.DOB, re: /\b(?:DOB|D\.O\.B\.?|Date\s*of\s*Birth)\s*[:\-]?\s*(\d{1,2}[\/\-.\s](?:\d{1,2}|[A-Za-z]{3,9})[\/\-.\s]\d{2,4})/gi },
  { type: LABEL.ADDRESS, re: /\b(?:Address|Addr)[ \t]*[:\-][ \t]*([^\n\r]+)/gi },
  // Labelled place fields such as "CITY: MYSORE" or "LOCALITY: ...", value on the same line.
  { type: LABEL.ADDRESS, re: /\b(?:City|Town|Locality|Area|Village|Taluk|District|Dist|Landmark)[ \t]*:[ \t]*([A-Za-z][A-Za-z .'-]{1,40}?)[ \t]*(?=\s{2,}|[A-Z]{3,}[ \t]*:|$)/gim },
  // A street line ("MIG-7, New Kantharaja Urs Road, Near ... Circle"), recognised by street words.
  { type: LABEL.ADDRESS, re: /^[ \t]*([^\n:]{0,60}\b(?:Road|Rd|Street|Circle|Cross|Layout|Nagar|Lane|Marg|Colony|Sector|Phase|Stage|Extension|Apartments?|Residency|Society)\b[^\n]{0,80}?)[ \t,]*$/gim },
  // City with a short postal code ("Mysore - 23").
  { type: LABEL.ADDRESS, re: /^[ \t]*([A-Z][A-Za-z]{2,}[ \t]*-[ \t]*\d{2,6})\b/gm },
  // Any labelled phone number, including landlines such as "Ph: 040-2335 0000".
  { type: LABEL.CONTACT, re: /\b(?:Ph|Phone|Tel|Telephone|Mob|Mobile|Contact|Cell)\.?\s*(?:No\.?)?\s*[:\-]?\s*(\+?\d[\d\s\-]{6,16}\d)/gi },
  // Lab or hospital name: a short line naming a facility, usually the letterhead.
  { type: LABEL.FACILITY, re: /^[ \t]*([A-Za-z][A-Za-z.&' -]{2,60}\b(?:Diagnostics?|Laborator(?:y|ies)|Labs?|Hospitals?|Clinic|Centre|Center|Pathology|Healthcare|Medical|Imaging|Scans?|Nursing Home)\b[A-Za-z.&' -]{0,40}?)[ \t]*(?=\s{2,}|$)/gim },
  // A street address on its own line, recognised by an Indian 6-digit PIN code.
  { type: LABEL.ADDRESS, re: /^[ \t]*([A-Za-z0-9][^\n\r:]{4,80}?\b[1-9]\d{2}\s?\d{3})\b/gm },
];

// Words the model sometimes flags that are clinical, not personal. Never redact these.
const KEEP = /^(na|n\/a|nil|none|nan|op|ip|electrolytes|biochemistry|haematology|hematology|lipid profile|lipid|profile|kidney|liver|thyroid|function|tests?|panel|routine|examination|serology|immunology|diabetes|complete|count|differential|hormones?|vitamins?|minerals|enzymes|cardiac|iron studies|urine|stool|summary|investigation|department|specimen|method|technology|units?|value|interval|name|names|patient|address|addr|ref|ref\.? by|self|doctor|dr|consultant|landmark|locality|city|state|area|age|sex|gender|sample|barcode|date|report|male|female|m|f|years?|yrs?|normal|high|low|positive|negative|fasting|serum|plasma|blood|urine|report|test|result|hemoglobin|haemoglobin|glucose|cholesterol|platelets?|wbc|rbc|tsh|hba1c|creatinine|vitamin\s*\w+)$/i;

export function findPatternEntities(text) {
  const found = [];
  for (const { type, re } of PATTERNS) {
    for (const m of text.matchAll(re)) found.push({ text: m[0].trim(), type, source: "pattern" });
  }
  for (const { type, re, whole } of FIELDS) {
    for (const m of text.matchAll(re)) {
      const value = (whole ? m[0] : m[1] || "").trim().replace(/[,;.]+$/, "");
      if (type === LABEL.ADDRESS && /\d\s*(?:mg|g\/dl|u\/l|iu|meq|mmol|ng|pg|µ|%|cells|lakh|\/cumm|fl\b)/i.test(value)) continue;
      if (value) found.push({ text: value, type, source: "pattern" });
    }
  }
  return cleanEntities(found, text);
}

// Tidy one candidate from the model: drop field labels and credentials it copied along.
function tidy(raw, type) {
  let t = String(raw).trim();
  if (/[\n\r]/.test(t)) t = t.split(/[\n\r]/)[0].trim();
  t = t.replace(/^[A-Za-z][A-Za-z .'\/]{1,28}:\s+/, ""); // "Patient Name: X" -> "X"
  t = t.replace(/^(?:reported|referred|ref\.?|signed|verified|checked|authori[sz]ed)\s+by\s*:?\s*/i, "");
  if (type === "DOCTOR" || type === "NAME") t = t.replace(/,\s*(?:MD|MBBS|DM|MS|DNB|MCh|FRCP|PhD)\b.*$/i, "");
  return t.replace(/[,;:.]+$/, "").trim();
}

const SENTENCE = /\b(?:reports?|reported|was|were|is|are|has|have|had|kindly|advised|please|correlate|shows?|noted|for|with)\b/i;
const words = (t) => t.split(/\s+/).filter(Boolean).length;

// Does this candidate look like the kind of identifier it claims to be?
function plausible(t, type) {
  switch (type) {
    case "DOB": return /\d{1,2}[\/\-. ](?:\d{1,2}|[A-Za-z]{3,9})[\/\-. ]\d{2,4}/.test(t);
    case "CONTACT": return t.includes("@") || (t.match(/\d/g) || []).length >= 7;
    case "ID": return /\d/.test(t) && t.length >= 4 && words(t) <= 3;
    case "NAME":
    case "DOCTOR": return words(t) <= 5 && !/\d/.test(t) && !SENTENCE.test(t);
    case "FACILITY": return words(t) <= 8 && !SENTENCE.test(t);
    case "ADDRESS": return words(t) <= 18;
    default: return false;
  }
}

// Keep only entities that literally occur in the text and look like identifiers.
export function cleanEntities(entities, text) {
  const seen = new Set();
  const out = [];
  const lower = text.toLowerCase();
  for (const e of entities || []) {
    if (!e || typeof e.text !== "string") continue;
    const type = LABEL[e.type] || "NAME";
    const t = e.source === "you" ? e.text.trim() : tidy(e.text, type);
    if (t.length < 2 || t.length > 120) continue;
    if (KEEP.test(t)) continue;
    // Short bare numbers are usually results or ages, unless pattern matching found them under an ID label ("Lab No : 8268").
    if (/^\d+(\.\d+)?\s*%?$/.test(t) && t.length < 6 && !(e.source === "pattern" && type === "ID")) continue;
    if (e.source !== "you" && !plausible(t, type)) continue;
    if (!lower.includes(t.toLowerCase())) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ text: t, type, source: e.source || "model" });
  }
  return dropNested(addAddressParts(addNameParts(out.map((e) => withHouseNumber(widenFacility(e, text), text)), text), text), text);
}

// "1061 Gandhi Main Road": a house or flat number written just before an address belongs to it.
function withHouseNumber(e, text) {
  if (e.type !== "ADDRESS") return e;
  const m = text.match(new RegExp(`(?:^|[\\s,:])((?:#\\s?)?\\d[\\dA-Za-z/-]{0,8}[ ,]+)${escapeRe(e.text)}`, "im"));
  return m ? { ...e, text: m[1] + e.text } : e;
}

// "CITY DIAGNOSTICS" on the line "CITY DIAGNOSTICS & RESEARCH CENTRE": hide the whole short line.
function widenFacility(e, text) {
  if (e.type !== "FACILITY") return e;
  const line = text.split(/\r?\n/).find((l) => l.toLowerCase().includes(e.text.toLowerCase()));
  if (!line) return e;
  const full = line.trim();
  const extra = full.toLowerCase().replace(e.text.toLowerCase(), "").trim();
  if (extra && words(extra) <= 4 && !/[\d:]/.test(extra) && words(full) <= 9) return { ...e, text: full };
  return e;
}

// Generic address words that are safe to leave visible on their own.
const GENERIC_PLACE = /^(road|rd|main|cross|street|st|lane|ln|new|old|near|opp|opposite|behind|city|locality|landmark|layout|stage|phase|block|sector|flat|house|h\.?no|no|floor|area|dist|district|taluk|state|india|colony|apartment|apartments|residency|hills|nagar|extension|ext|post|po|village|town|west|east|north|south|the|and|of)$/i;

// Addresses are often split over several lines. Hide each distinctive word of a hidden
// address wherever it appears, so fragments like a street or area name cannot leak.
function addAddressParts(entities, text) {
  let rest = text;
  for (const e of entities) rest = rest.split(new RegExp(escapeRe(e.text), "gi")).join(" ");
  const have = new Set(entities.map((e) => e.text.toLowerCase()));
  const extra = [];
  for (const e of entities) {
    if (e.type !== "ADDRESS" && e.type !== "FACILITY") continue;
    for (const part of e.text.split(/[\s,.:;()\/-]+/)) {
      if (part.length < 4 || /\d/.test(part) || GENERIC_PLACE.test(part) || KEEP.test(part) || have.has(part.toLowerCase())) continue;
      if (e.type === "FACILITY" && /^(diagnostics?|laborator(y|ies)|labs?|hospitals?|clinic|centre|center|pathology|healthcare|medical|research|imaging|scans?|technologies|ltd|limited|pvt)$/i.test(part)) continue;
      if (new RegExp(`\\b${escapeRe(part)}\\b`, "i").test(rest)) {
        have.add(part.toLowerCase());
        extra.push({ text: part, type: e.type, source: "pattern" });
      }
    }
  }
  return entities.concat(extra);
}

// Drop an item that only ever appears inside a longer hidden item (e.g. part of an address).
function dropNested(entities, text) {
  return entities.filter((e) => {
    const parents = entities.filter((o) => o !== e && o.text.length > e.text.length && o.text.toLowerCase().includes(e.text.toLowerCase()));
    if (!parents.length) return true;
    let rest = text;
    for (const o of parents) rest = rest.split(new RegExp(escapeRe(o.text), "gi")).join(" ");
    return rest.toLowerCase().includes(e.text.toLowerCase());
  });
}

const TITLES = /^(mr|mrs|ms|miss|dr|shri|smt|sri|kumari|master|baby|md|prof)\.?$/i;

// If "Lakshmi Devi Rao" is hidden, also hide a lone "Lakshmi" elsewhere in the report.
function addNameParts(entities, text) {
  let rest = text;
  for (const e of entities) rest = rest.split(new RegExp(escapeRe(e.text), "gi")).join(" ");
  const have = new Set(entities.map((e) => e.text.toLowerCase()));
  const extra = [];
  for (const e of entities) {
    if (e.type !== "NAME" && e.type !== "DOCTOR") continue;
    for (const part of e.text.split(/[\s.]+/)) {
      if (part.length < 3 || TITLES.test(part) || KEEP.test(part) || have.has(part.toLowerCase())) continue;
      if (new RegExp(`\\b${escapeRe(part)}\\b`, "i").test(rest)) {
        have.add(part.toLowerCase());
        extra.push({ text: part, type: e.type, source: "pattern" });
      }
    }
  }
  return entities.concat(extra);
}

export function mergeEntities(a, b, text) {
  return cleanEntities([...(a || []), ...(b || [])], text);
}

// Replace every identifier with a numbered placeholder such as [NAME_1].
// Returns the sealed text and the private map used to restore names on this device.
export function seal(text, entities) {
  const sorted = [...entities].sort((x, y) => y.text.length - x.text.length);
  const counters = {};
  const map = {}; // placeholder -> original
  const byValue = {}; // original (lowercase) -> placeholder
  let sealed = text;
  for (const e of sorted) {
    const key = e.text.toLowerCase();
    if (!byValue[key]) {
      counters[e.type] = (counters[e.type] || 0) + 1;
      const ph = `[${e.type}_${counters[e.type]}]`;
      byValue[key] = ph;
      map[ph] = e.text;
    }
    const edge = /^\w+$/.test(e.text) ? "\\b" : "";
    sealed = sealed.replace(new RegExp(edge + escapeRe(e.text) + edge, "gi"), byValue[key]);
  }
  return { sealed, map };
}

// Put the real values back, on this device only, for display.
export function unseal(text, map) {
  let out = String(text ?? "");
  for (const [ph, original] of Object.entries(map || {})) out = out.split(ph).join(original);
  return out;
}

// Split long reports so each piece fits the on-device model's context window.
export function chunk(text, size = 2800) {
  const parts = [];
  let rest = text;
  while (rest.length > size) {
    let cut = rest.lastIndexOf("\n", size);
    if (cut < size * 0.5) cut = size;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  if (rest.trim()) parts.push(rest);
  return parts;
}

// Tolerant JSON reader for model output.
export function readJson(raw) {
  if (!raw) return null;
  const s = String(raw).replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try { return JSON.parse(s); } catch {}
  const i = s.indexOf("{"), j = s.lastIndexOf("}");
  if (i >= 0 && j > i) { try { return JSON.parse(s.slice(i, j + 1)); } catch {} }
  return null;
}

// ---------- Range check ----------
// Models sometimes mislabel a result. Where the value and reference range are plain numbers,
// the code decides low / normal / high itself and corrects the model.
const num = (s) => {
  const m = String(s ?? "").replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};

export function rangeStatus(value, reference) {
  const v = num(value);
  const ref = String(reference ?? "").replace(/,/g, "");
  if (v === null || !ref) return null;
  // Several ranges (for example separate ranges for men and women): don't guess.
  if ((ref.match(/\d\s*(?:-|–|—|to)\s*\d/gi) || []).length > 1 || /\b(male|female|men|women|M:|F:|adult|child)/i.test(ref)) return null;
  let m = ref.match(/(-?\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(-?\d+(?:\.\d+)?)/i);
  if (m) {
    const lo = parseFloat(m[1]), hi = parseFloat(m[2]);
    if (!(lo < hi)) return null;
    return v < lo ? "low" : v > hi ? "high" : "normal";
  }
  m = ref.match(/^\s*(<|<=|≤|up to|upto|below|less than)\s*(-?\d+(?:\.\d+)?)/i);
  if (m) return v > parseFloat(m[2]) ? "high" : "normal";
  m = ref.match(/^\s*(>|>=|≥|above|over)\s*(-?\d+(?:\.\d+)?)/i);
  if (m) return v < parseFloat(m[2]) ? "low" : "normal";
  return null;
}

const PLAIN = { low: "below", normal: "within", high: "above" };

// Correct each finding's status. If the model's label was wrong, its wording may be wrong too,
// so replace it with a plain, correct sentence.
export function checkFindings(data) {
  if (!data || !Array.isArray(data.findings)) return { data, corrected: 0 };
  let corrected = 0;
  for (const f of data.findings) {
    const s = rangeStatus(f.value, f.reference);
    if (!s) continue;
    if (String(f.status || "").toLowerCase() !== s) {
      corrected++;
      f.status = s;
      f.meaning = `Your result is ${PLAIN[s]} the reference range of ${f.reference}. Ask your doctor what this means for you.`;
      f.checked = true;
    }
  }
  return { data, corrected };
}
