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
  { type: LABEL.ID, re: /\b\d{4}(?:[ -]\d{4}){3}\b/g }, // 16-digit card
  { type: LABEL.ID, re: /\b[A-Z]{1,3}\d{7}\b/g }, // passport, voter card
  { type: LABEL.ID, re: /\b[A-Z]{2,5}[-\/]\d{4,}\b/g }, // codes such as "CC-2231"
  { type: LABEL.ID, re: /\b[A-Z]{2,6}[-\/]\d{2,4}[-\/]\d{3,}\b/g }, // codes such as "SPL/2023/8834"
  { type: LABEL.ID, re: /\b\d{9,}\b/g }, // no test result has nine digits in a row
  { type: LABEL.CONTACT, re: /\b0\d{2,4}[ -]\d{3,4}[ -]?\d{4}\b/g }, // landline
];

// Words that show a match is not a person's name ("Adult Male 20 years", "RBC Count 5 M").
const NOT_NAME = /\b(?:adults?|child(?:ren)?|infants?|newborns?|males?|females?|men|women|boys?|girls?|normal|above|below|over|under|up ?to|between|age|sex|range|count|total|serum|plasma|blood|urine|vitamin|free|test|result|value|high|low|risk|sample|specimen|method|machine|analy[sz]er|hand|phone|email|courier|lab|hospital|home|self|doctor|technician|pathologist|consultant)\b/i;

const NOT_PERSON = /\b(?:profile|function|panel|tests?|liver|kidney|thyroid|lipid|complete|blood|urine|iron|diabetes|vitamin|culture|hormone|cardiac|fever|serum|count|doctor|patient|lab|hospital|clinic|department)\b/i;

// "Label: value" fields where the value is the identifier.
const FIELDS = [
  { type: LABEL.NAME, re: /\b(?:Patient(?:'s)?\s*Name|Name\s*of\s*Patient|Pt\.?\s*Name|Name)\s*[:\-]\s*([^\n\r]+?)(?=\s{2,}|\t|[ \t]*[|;]|,[ \t]*[A-Z][A-Za-z .]*:|\s+(?:Age|Sex|Gender|DOB|UHID|MRN)\b|$)/gim },
  { type: LABEL.DOCTOR, re: /\b(?:Ref(?:erred|erring)?\.?\s*(?:By|Doctor|Dr\.?)|Consultant|Doctor|Physician|Pathologist)\s*[:\-]\s*([^\n\r]+?)(?=\s{2,}|\t|[ \t]*[|;]|$)/gim },
  { type: LABEL.DOCTOR, re: /\bDr\.? ?[A-Z][a-zA-Z.]*(?: [A-Z][a-zA-Z.]+){0,2}/g, whole: true },
  { type: LABEL.DOCTOR, re: /\bDR(?:\. ?| )[A-Z][A-Z.]*(?: [A-Z][A-Z.]*){0,3}\b/g, whole: true },
  { type: LABEL.ID, re: /\b(?:UHID|MRN|MR\s*No|Patient\s*ID|Reg(?:istration)?\.?\s*No|Lab\s*(?:No|ID)|Sample\s*(?:No|ID)|Bill\s*No|Accession\s*No|Barcode|IP\s*No|OP\s*No)\.?\s*[:#\-]?\s*([A-Z0-9][A-Z0-9\/\-]{3,})/gi },
  { type: LABEL.DOB, re: /\b(?:DOB|D\.O\.B\.?|Date\s*of\s*Birth)\s*[:\-]?\s*(\d{1,2}[\/\-.\s](?:\d{1,2}|[A-Za-z]{3,9})[\/\-.\s]\d{2,4})/gi },
  { type: LABEL.ADDRESS, re: /\b(?:Address|Addr)[ \t]*[:\-][ \t]*([^\n\r]+)/gi },
  // Labelled place fields such as "CITY: MYSORE" or "LOCALITY: ...", value on the same line.
  { type: LABEL.ADDRESS, re: /\b(?:City|Town|Locality|Area|Village|Taluk|District|Dist|Landmark|Location|Loc|Place)[ \t]*:[ \t]*([A-Za-z][A-Za-z .'-]{1,40}?)[ \t]*(?=\s{2,}|[A-Z]{3,}[ \t]*:|$)/gim },
  // A street line ("MIG-7, New Kantharaja Urs Road, Near ... Circle"), recognised by street words.
  { type: LABEL.ADDRESS, re: /^[ \t]*([^\n:]{0,60}\b(?:Road|Rd|Street|Circle|Cross|Layout|Nagar|Lane|Marg|Colony|Sector|Phase|Stage|Extension|Apartments?|Residency|Society)\b[^\n]{0,80}?)[ \t,]*$/gim },
  // City with a short postal code ("Mysore - 23").
  { type: LABEL.ADDRESS, re: /^[ \t]*([A-Z][A-Za-z]{2,}[ \t]*-[ \t]*\d{2,6})\b/gm },
  // Any labelled phone number, including landlines such as "Ph: 040-2335 0000".
  { type: LABEL.CONTACT, re: /\b(?:Ph|Phone|Tel|Telephone|Mob|Mobile|Contact|Cell)\.?\s*(?:No\.?)?\s*[:\-]?\s*(\+?\d[\d\s\-]{6,16}\d)/gi },
  // Lab or hospital name: a short line naming a facility, usually the letterhead.
  { type: LABEL.FACILITY, skip: /\b(?:processed|sample|slip|report|patient|collected|verified|tested)\b/i, re: /^[ \t]*([A-Za-z][A-Za-z.&' -]{2,60}\b(?:Diagnostics?|Laborator(?:y|ies)|Labs?|Hospitals?|Clinic|Polyclinic|Centre|Center|Pathology|Healthcare|Medical|Imaging|Scans?|Nursing Home)\b[A-Za-z.&' -]{0,40}?)[ \t]*(?=\s{2,}|,|$)/gim },
  // A street address on its own line, recognised by an Indian 6-digit PIN code.
  { type: LABEL.ADDRESS, skip: /\b(?:count|platelets?|wbc|rbc|total|absolute)\b/i, re: /^[ \t]*([A-Za-z0-9][^\n\r:]{4,80}?\b[1-9]\d{2}\s?\d{3})\b(?![ \t]*(?:\/|cells|cumm|per\b|IU|U\/|mg|ng|pg|copies|x ?10|<|\d))/gm },

  // ---------- people without a "Patient Name" label ----------
  // "Customer: ...", "Father Name : ...", "Insured: ..."
  { type: LABEL.NAME, re: /\b(?:Patient|Customer|Client|Insured|Beneficiary|Member|Booked\s*for|Report\s*for|Father|Mother|Husband|Wife|Spouse|Son|Daughter|Guardian|Attendant|Nominee|Emergency\s*Contact)(?:'s)?(?:[ \t]*Name)?[ \t]*[:\-][ \t]*([A-Za-z][A-Za-z.' -]{1,48}?)(?=\s{2,}|\t|[ \t]*[|;,(\/\d]|\s+(?:Age|Sex|Gender|DOB|UHID|MRN)\b|$)/gim },
  // "S/o", "D/o", "W/o", "C/o"
  { type: LABEL.NAME, re: /\b[SDWC][ \t]?\/[ \t]?o\.?[ \t]*[:\-]?[ \t]*([A-Za-z][A-Za-z.' -]{1,48}?)(?=\s{2,}|\t|[ \t]*[|;,(\/\d]|$)/gim },
  // A label on one line and the name on the next, as photo reading often gives.
  { type: LABEL.NAME, re: /^[ \t]*(?:Patient(?:'s)?[ \t]*Name|Pt\.?[ \t]*Name|Name)[ \t]*[:\-]?[ \t]*\r?\n[ \t]*([A-Za-z][A-Za-z.' ]{2,48})[ \t]*$/gim },
  { type: LABEL.DOCTOR, re: /^[ \t]*(?:Ref\.?[ \t]*(?:By|Dr)?\.?|Dr\.?|Doctor|Consultant)[ \t]*[:\-]?[ \t]*\r?\n[ \t]*([A-Za-z][A-Za-z.' ]{2,48})[ \t]*$/gim },
  // "Mrs Tapasi Ghosh", "Shri Ram Lal"
  { type: LABEL.NAME, re: /\b(?:Mr|Mrs|Ms|Miss|Shri|Smt|Sri|Kumari|MR|MRS|SMT|SHRI)(?:\. ?| )[A-Z][A-Za-z.']*(?: [A-Z][A-Za-z.']*){0,3}/g, whole: true },
  // "Dear Farhan Qureshi", "Regards, Karthik"
  { type: LABEL.NAME, re: /\b(?:Dear|Hello|Hey|Hi|Namaste|Regards|Thanks),? +(?!(?:Sir|Madam|Patient|Customer|Doctor|Team|All|Valued|User|Member|Client)\b)([A-Z][a-z]+(?:[ -][A-Z][a-z]+){0,2})/g },
  { type: LABEL.NAME, re: /\b(?:[Mm]y|[Hh]is|[Hh]er|[Pp]atient|,)\s+name(?:\s+is)?\s+([A-Z][a-z]+(?: [A-Z][a-z]+){0,3})/g },
  { type: LABEL.NAME, re: /^[ \t]*Forwarded(?: from)?:[ \t]*([A-Z][a-z]+(?: [A-Z][a-z]+){0,3})/gm },
  // A family member named in a sentence: "her husband Harjit".
  { type: LABEL.NAME, skip: NOT_NAME, re: /\b(?:husband|wife|spouse|son|daughter|mother|father|brother|sister|uncle|aunt|attendant|caretaker|nurse|technician|phlebotomist)(?: is)?,? ([A-Z][a-z]{2,}(?: [A-Z][a-z]+)?)/g },
  // "results for Moumita Das", "delivered to Suresh Prasad"
  { type: LABEL.NAME, skip: NOT_PERSON, re: /\b(?:[Rr]eports?|[Rr]esults?|[Dd]elivered|[Hh]anded|[Ii]nformed)(?: over)? (?:for|of|to) ([A-Z][a-z]+ [A-Z][a-z]+(?:-[A-Z][a-z]+)?)/g },
  // A name followed by an age or sex: "Imran Sheikh, 38 M", "Rohini Deshpande / 42 yrs".
  { type: LABEL.NAME, skip: NOT_NAME, re: /^[ \t]*([A-Z][A-Za-z.']+(?: [A-Z][A-Za-z.']*){0,3})[ \t]*[,\/]?\s*\d{1,3}[ \t]*(?:(?:[Yy]rs?|YRS?|[Yy]ears?|YEARS?)\b|[\/,]?[ \t]*(?:M|F|Male|Female|male|female|MALE|FEMALE)(?![A-Za-z\/]))/gm },
  // The word for "name" in Indian languages.
  { type: LABEL.NAME, re: /(?:नाम|नांव|పేరు|பெயர்|ಹೆಸರು|പേര്|নাম|નામ)[ \t]*[:\-][ \t]*([^\n\r\d,]{2,48}?)(?=\s{2,}|\t|[,\d]|$)/gm },
  // Staff who signed or handled the report.
  { type: LABEL.DOCTOR, skip: NOT_NAME, re: /\b(?:Verified|Checked|Reported|Collected|Authori[sz]ed|Approved|Prepared|Entered|Signed|Validated|Reviewed|Reporting)[ \t]+by[ \t]*[:\-]?[ \t]*([A-Za-z][A-Za-z.' -]{2,40}?)(?=\s{2,}|\t|[ \t]*[|;,(\/\d]|$)/gim },
  { type: LABEL.DOCTOR, skip: NOT_NAME, re: /\b(?:Phlebotomist|Technician|Technologist|Nurse|Microbiologist|Biochemist|Radiologist|Surgeon)[ \t]*[:\-][ \t]*([A-Za-z][A-Za-z.' -]{2,40}?)(?=\s{2,}|\t|[ \t]*[|;,(\/\d]|$)/gim },

  // ---------- numbers, places and organisations with other labels ----------
  { type: LABEL.ID, re: /\b(?:Booking|Order|Employee|Emp|Policy|Card|Member(?:ship)?|Claim|Passport|Aadhaa?r|ABHA|Voter|Invoice|Receipt|Visit|Episode|Case|File|Customer|Client|Request|Requisition|Specimen|Token|Reference)[ \t]*(?:ID|No|Number|Code|Card)?\.?[ \t]*(?:ID|No|Number)?\.?[ \t]*[:#][ \t]*([A-Z0-9][A-Z0-9\/\-]{3,24})/gi },
  { type: LABEL.ID, re: /\bRef\.?[ \t]*(?:No\.?)?[ \t]*[:#]?[ \t]*([A-Z]{1,5}[\/-][A-Z0-9\/-]{3,20})/gi },
  { type: LABEL.FACILITY, re: /\b(?:Employer|Company|Corporate|TPA|Insurer|Insurance|Hospital|Laboratory|Clinic|Branch|Collection[ \t]*Cent(?:re|er))[ \t]*(?:Name)?[ \t]*:[ \t]*([A-Za-z][A-Za-z.&' -]{2,50}?)(?=\s{2,}|\t|[,(\d]|$)/gim },
  // A lab or hospital named inside a sentence.
  { type: LABEL.FACILITY, skip: /patient|slip/i, re: /\b(?!(?:MD|DM|MS|MBBS|DNB|DCP|Consultant|Senior|Chief|Clinical|Department|Your|The|This|Our|All|Please|At|In|From)\b)([A-Z][A-Za-z&.']+(?: (?:[A-Z][A-Za-z&.']+|&)){0,3} (?:Diagnostics?|Laborator(?:y|ies)|Labs?|Hospitals?|Clinic|Polyclinic|Nursing Home|Healthcare)(?: (?:Centre|Center|Services|Pvt|Ltd))*)\b/g },
  { type: LABEL.FACILITY, re: /^[ \t]*([^\n\d:]{0,30}(?:पैथोलॉजी|अस्पताल|हॉस्पिटल|क्लिनिक|डायग्नोस्टिक|लैब)[^\n\d:]{0,30}?)[ \t]*$/gm },
  // The place after a lab or hospital name: "Shanti Memorial Hospital, Civil Lines, Nagpur".
  { type: LABEL.ADDRESS, re: /\b(?:Diagnostics?|Laborator(?:y|ies)|Labs?|Hospitals?|Clinic|Polyclinic|Cent(?:re|er)|Pathology|Institute),[ \t]*([A-Z0-9][A-Za-z0-9 .,'\/-]{3,80}?)[ \t]*$/gm },
  { type: LABEL.ADDRESS, re: /\b(?:Flat|Plot|House|H\.? ?No|D\.? ?No|Door ?No|Apt|Shop)\.?[ \t]*(?:No\.?)?[ \t]*[:\-]?[ \t]*\d[^\n\r]{4,80}/gi, whole: true },
  { type: LABEL.ADDRESS, re: /\b(?:Near|Opp\.?|Opposite|Behind|Beside)[ \t]+([A-Z][A-Za-z.']+(?: [A-Z][A-Za-z.']+){0,3})/g },
  { type: LABEL.ADDRESS, re: /(?:\b\d[\dA-Za-z\/-]{0,6},? )?\b[A-Z][A-Za-z]*(?: [A-Z][A-Za-z]*){0,2} (?:Nagar|Road|Street|Colony|Layout|Marg|Enclave|Vihar|Puram|Chowk|Bazaar|Bazar|Circus|Salai|Heights|Residency|Apartments?|Society)\b(?:, [A-Z][a-z]+(?: [A-Z][a-z]+)?){0,3}/g, whole: true },
  { type: LABEL.ADDRESS, re: /\b(?:Sector|Phase|Block|Ward)[ -]\d{1,3}[A-Z]?(?:, [A-Z][a-z]+(?: [A-Z][a-z]+)?)+/g, whole: true },
  // The line under a letterhead: "Mission Ward, Kochi".
  { type: LABEL.ADDRESS, skip: NOT_PERSON, re: /(?:Diagnostics?|DIAGNOSTICS?|Lab(?:orator(?:y|ies)|s)?|LAB(?:ORATOR(?:Y|IES)|S)?|Hospitals?|HOSPITALS?|Clinic|CLINIC|Polyclinic|Cent(?:re|er)|CENT(?:RE|ER)|Pathology|PATHOLOGY)[ \t]*\r?\n[ \t]*([A-Z0-9][A-Za-z0-9 .'\/-]{2,40},[ \t]*[A-Z][A-Za-z .,'-]{2,60})[ \t]*$/gm },
];

// Words the model sometimes flags that are clinical, not personal. Never redact these.
const KEEP = /^(covid-?\s?19|na|n\/a|nil|none|nan|op|ip|electrolytes|biochemistry|haematology|hematology|lipid profile|lipid|profile|kidney|liver|thyroid|function|tests?|panel|routine|examination|serology|immunology|diabetes|complete|count|differential|hormones?|vitamins?|minerals|enzymes|cardiac|iron studies|urine|stool|summary|investigation|department|specimen|method|technology|units?|value|interval|name|names|patient|address|addr|ref|ref\.? by|self|doctor|dr|consultant|landmark|locality|city|state|area|age|sex|gender|sample|barcode|date|report|male|female|m|f|years?|yrs?|normal|high|low|positive|negative|fasting|serum|plasma|blood|urine|report|test|result|hemoglobin|haemoglobin|glucose|cholesterol|platelets?|wbc|rbc|tsh|hba1c|creatinine|vitamin\s*\w+)$/i;

export function findPatternEntities(text) {
  const found = [];
  for (const { type, re } of PATTERNS) {
    for (const m of text.matchAll(re)) found.push({ text: m[0].trim(), type, source: "pattern" });
  }
  for (const { type, re, whole, skip } of FIELDS) {
    for (const m of text.matchAll(re)) {
      const value = (whole ? m[0] : m[1] || "").trim().replace(/[,;.]+$/, "");
      if (skip?.test(value)) continue;
      if (type === LABEL.ADDRESS && /\d\s*(?:mg(?!\s+(?:road|marg|rd))|g\/dl|u\/l|iu|meq|mmol|ng|pg|µ|%|cells|lakh|\/cumm|fl\b)/i.test(value)) continue;
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
    case "ID": return /\d/.test(t) && t.length >= 4 && words(t) <= 4;
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

const GENERIC_FACILITY = /^(clinical|diagnostics?|laborator(y|ies)|labs?|hospitals?|clinic|centre|center|pathology|healthcare|medical|research|imaging|scans?|technologies|ltd|limited|pvt)$/i;

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
      if (e.type === "FACILITY" && GENERIC_FACILITY.test(part)) continue;
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

// Seals a question about the report. Known items keep the placeholder they have in the report, and any
// part of a hidden name or address ("Rao" from "Lakshmi Devi Rao") is hidden too. Anything new becomes "(hidden)".
export function sealQuestion(question, map) {
  // Whole items come first, so they win over a part of another item with the same text.
  const known = Object.entries(map || {}).map(([ph, original]) => [original, ph]);
  for (const [ph, original] of Object.entries(map || {})) {
    const place = /^\[(ADDRESS|FACILITY)/.test(ph);
    if (!place && !/^\[(NAME|DOCTOR)/.test(ph)) continue;
    for (const part of original.split(/[\s,.:;()\/-]+/)) {
      const generic = place ? part.length < 4 || /\d/.test(part) || GENERIC_PLACE.test(part) || GENERIC_FACILITY.test(part) : part.length < 3 || TITLES.test(part);
      if (!generic && !KEEP.test(part)) known.push([part, ph]);
    }
    // Two or more words in a row from a place name identify it, even if each word is common ("City Diagnostics").
    if (place) {
      const w = original.split(/\s+/);
      for (let i = 0; i < w.length; i++) for (let j = i + 2; j <= w.length; j++) {
        const run = w.slice(i, j).join(" ").replace(/^[^\w]+|[^\w]+$/g, "");
        if (run.length >= 6 && run.includes(" ")) known.push([run, ph]);
      }
    }
  }
  // One private-use character stands in for each placeholder, so nothing can match inside another placeholder.
  const placed = [];
  let out = String(question ?? "").replace(/[\uE000-\uF8FF]/g, "");
  for (const [value, ph] of known.sort((a, b) => b[0].length - a[0].length)) {
    const before = /^\w/.test(value) ? "\\b" : "", after = /\w$/.test(value) ? "\\b" : "";
    out = out.replace(new RegExp(before + escapeRe(value) + after, "gi"), () => { placed.push(ph); return String.fromCharCode(0xE000 + placed.length - 1); });
  }
  for (const e of findPatternEntities(out).sort((a, b) => b.text.length - a.text.length)) {
    if (!/[\uE000-\uF8FF]/.test(e.text)) out = out.replace(new RegExp(escapeRe(e.text), "gi"), "(hidden)");
  }
  return out.replace(/[\uE000-\uF8FF]/g, (c) => placed[c.charCodeAt(0) - 0xE000] || "");
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

// Several ranges in one place (for example separate ranges for men and women): never pick one.
export const severalRanges = (ref) =>
  (String(ref ?? "").match(/\d\s*(?:-|–|—|to)\s*\d/gi) || []).length > 1 || /\b(male|female|men|women|M:|F:|adult|child)/i.test(String(ref ?? ""));

export function rangeStatus(value, reference) {
  const v = num(value);
  const ref = String(reference ?? "").replace(/,/g, "");
  if (v === null || !ref) return null;
  if (severalRanges(ref)) return null;
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

export const plainMeaning = (status, reference) => PLAIN[status]
  ? `Your result is ${PLAIN[status]} the reference range of ${reference}. Ask your doctor what this means for you.`
  : "Sealed could not compare this with one clear reference range. Ask your doctor what it means for you.";

// The code decides every label. If the model's label was wrong, its wording may be wrong too, so it is replaced.
// When the report gives no single clear range the label is "unclear", never the model's guess.
export function checkFindings(data) {
  if (!data || !Array.isArray(data.findings)) return { data, corrected: 0 };
  let corrected = 0;
  for (const f of data.findings) {
    const s = rangeStatus(f.value, f.reference);
    const said = String(f.status || "").toLowerCase();
    if (!s) {
      if (said !== "unclear") { f.status = "unclear"; f.meaning = plainMeaning("unclear"); }
    } else if (said !== s) {
      corrected++;
      f.status = s;
      f.meaning = plainMeaning(s, f.reference);
      f.checked = true;
    }
  }
  return { data, corrected };
}

// The count shown to people always comes from code, never from a model.
export function countLine(findings) {
  if (!findings?.length) return "";
  const st = findings.map((f) => String(f.status || "").toLowerCase());
  const out = st.filter((x) => x === "low" || x === "high").length;
  const unclear = st.filter((x) => x === "unclear").length;
  return `${out} of ${findings.length} results outside the range printed on the report` + (unclear ? `, ${unclear} with no clear range.` : ".");
}

// ---------- prompt for the on-device model ----------
export const SEAL_PROMPT = (text) => `List the personal identifiers in this medical document: names of the patient, relatives and doctors; hospital and lab names; street addresses; ID numbers; phone numbers; emails; dates of birth.
Copy only the identifying words exactly as written, never the field label or a whole sentence. Never list tests, results, units, ranges, age or sex.
Return JSON: {"entities":[{"text":"...","type":"NAME|DOCTOR|FACILITY|ADDRESS|ID|CONTACT|DOB"}]}

DOCUMENT:
${text}`;
