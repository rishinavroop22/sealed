// Writes the expected sealing output from the web app's own code, so the Android tests can
// check that the Kotlin port gives the same result. All reports here are invented.
// Run: node android/parity.mjs
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), "sealed-parity-"));
writeFileSync(join(tmp, "package.json"), '{"type":"module"}');
for (const f of ["redact.js", "health.js", "qr.js", "sealing-cases.js", "sealing-score.js"]) writeFileSync(join(tmp, f), readFileSync(join(here, "../web/js", f)));
const r = await import(pathToFileURL(join(tmp, "redact.js")));
const h = await import(pathToFileURL(join(tmp, "health.js")));
const { CASES } = await import(pathToFileURL(join(tmp, "sealing-cases.js")));
const { parseCase } = await import(pathToFileURL(join(tmp, "sealing-score.js")));
const { qrGrid } = await import(pathToFileURL(join(tmp, "qr.js")));

const REPORTS = [
`CITY DIAGNOSTICS & RESEARCH CENTRE
Road No. 12, Banjara Hills, Hyderabad 500034   Ph: 040-2335 0000

Patient Name: Mrs. Lakshmi Devi Rao        Age: 54 Years    Sex: Female
UHID: HYD/2291/88        Lab No: CD-774120
Ref. By: Dr. Arvind Menon        Phone: +91 98480 12345
DOB: 14/03/1972

TEST                     RESULT      UNIT        REFERENCE RANGE
Haemoglobin              9.8         g/dL        12.0 - 15.0
Fasting Blood Glucose    118         mg/dL       70 - 100
HbA1c                    6.3         %           < 5.7
TSH                      6.9         uIU/mL      0.4 - 4.0
Vitamin D (25-OH)        14          ng/mL       30 - 100

Remarks: Lakshmi reports tiredness for two months. Kindly correlate clinically.
Reported by Dr. S. Fatima Khan, MD (Pathology)`,
`SUNRISE PATHOLOGY LABS
1061 Gandhi Main Road, Near Clock Circle
CITY: MYSORE
Mysore - 23
Name : Ramesh Kumar Iyer   Age : 61   Gender : M
Lab No : 8268
Aadhaar: 4821 7733 9012   PAN: ABCDE1234F   Email: ramesh.iyer@example.com
Consultant: Dr Meera Nair

Creatinine PHOTOMETRY 5.4 mg/dL 0.7 - 1.3
Potassium 6.5 mEq/L 3.5 - 5.1
SGOT/SGPT Ratio CALCULATED 1.2 Ratio < 2.0
Platelet Count 0.4 lakh/cumm 1.5 - 4.1
Total Cholesterol 1,210 mg/dL Up to 200
Haemoglobin 13.1 g/dL Male: 13 - 17 Female: 12 - 15
Ramesh was advised to walk daily. Gandhi statue landmark.`,
`Name- Sunita S Patil\nMob 9876543210\nAddress: Flat 4B, Rose Residency, Andheri West, Mumbai 400058\r\nUrea 30 mg/dL 15 - 40\r\nHDL Cholesterol 38 mg/dL > 40\r\nSunita visited Andheri clinic.`,
`No identifiers here.\nSodium 139 mmol/L 135 - 145`,
];
const RANGES = [
  ["9.8 g/dL", "12.0 - 15.0"], ["6.3 %", "< 5.7"], ["38", "> 40"], ["1,210", "Up to 200"],
  ["13", "Male: 13 - 17 Female: 12 - 15"], ["5", "5 to 9"], ["4", "≤ 4"], ["x", "1-2"], ["4", ""], ["12", "0.4 – 4.0"],
];
// Every report of the sealing test too (web/sealing-test.html).
for (const c of CASES) REPORTS.push(parseCase(c).text);
// What a small model might return, including mistakes the clean-up must reject.
const MODEL = [
  { text: "Patient Name: Lakshmi", type: "NAME" }, { text: "Haemoglobin", type: "NAME" },
  { text: "CITY DIAGNOSTICS", type: "FACILITY" }, { text: "54", type: "ID" },
  { text: "not in report", type: "NAME" }, { text: "Arvind Menon, MD", type: "DOCTOR" },
];

const QUESTIONS = [
  "Is Lakshmi Rao TSH high? Call 9848012345", "Should mrs. lakshmi devi rao see menon in Hyderabad?",
  "What does HYD/2291/88 mean?", "Is my TSH of 6.9 high?", "Does City Diagnostics use a fasting test?",
];
const FINDINGS = [
  { test: "TSH", value: "2.9 uIU/mL", reference: "0.4 - 4.0", status: "normal", meaning: "model" },
  { test: "Haemoglobin", value: "9.8 g/dL", reference: "12.0-15.0", status: "low", meaning: "model" },
  { test: "HbA1c", value: "6.3 %", reference: "< 7.5", status: "normal", meaning: "model" },
  { test: "Made up", value: "5", reference: "", status: "high", meaning: "model" },
];
const copy = (x) => JSON.parse(JSON.stringify(x));
const first = r.mergeEntities(r.findPatternEntities(REPORTS[0]), MODEL, REPORTS[0]);
const firstMap = r.seal(REPORTS[0], first).map;
const checked = copy(FINDINGS);
const fixed = h.reconcile(checked, h.quickParse(REPORTS[0]));
const { corrected } = r.checkFindings({ findings: checked });

// Saved reports for one person: crossing a range, a repeated month, spelling differences, and a missing range.
const TODAY = new Date(2026, 10, 15);
const DATES = ["Collected: 06/11/2026 DOB: 14/03/1972", "DOB: 14/03/2012\nReported on 2 Sep 2025", "Printed 01-02-24", "No date", "Sample 05/12/2027", "ISO 15189 valid to 03/2030\nReceived 9th March, 2024", ...REPORTS];
const SAVED = [
  { month: "2025-09", results: [{ test: "Haemoglobin", value: "10.7 g/dL", reference: "12.0 - 15.0" }, { test: "TSH", value: "4.4 uIU/mL", reference: "0.4 - 4.0" }] },
  { month: "2025-02", results: [{ test: "Hemoglobin (Hb)", value: "12.6 g/dL", reference: "12.0 - 15.0" }, { test: "TSH", value: "2.8 uIU/mL", reference: "0.4 - 4.0" }, { test: "Sodium", value: "139 mmol/L", reference: "" }] },
  { month: "2026-11", results: [{ test: "HAEMOGLOBIN", value: "9.8 g/dL", reference: "12.0 - 15.0" }, { test: "Sodium", value: "140 mmol/L", reference: "135 - 145" }, { test: "Total Cholesterol", value: "1,210 mg/dL", reference: "Up to 200" }] },
  { month: "2026-11", results: [{ test: "TSH", value: "0 uIU/mL", reference: "0.4 - 4.0" }] },
  { month: "", results: [{ test: "TSH", value: "99", reference: "" }] },
];
const series = h.buildSeries(SAVED);
const say = (s) => h.trendSentence(s).replace(/\bSept\b/g, "Sep");
const invite = (n) => "https://rishinavroop22.github.io/sealed/#join=" + Buffer.from(JSON.stringify({ f: "0123456789abcdef".repeat(2), p: Array.from({ length: n }, (_, i) => ({ id: "p" + i, name: "Amma अम्मा " + i })) })).toString("base64url");
const QR = ["A", "sealed", "x".repeat(120), invite(1), invite(3), invite(8), "é".repeat(150)];

const out = {
  months: DATES.map((text) => ({ text, month: h.detectMonth(text, TODAY) })),
  saved: SAVED, series, sentences: series.map(say), notable: h.notableFirst(series).map((s) => s.key),
  merged: h.mergeResults(FINDINGS, h.quickParse(REPORTS[0])),
  qr: QR.map((text) => ({ text, rows: qrGrid(text).map((row) => row.map((v) => (v ? "1" : "0")).join("")) })),
  model: MODEL,
  questions: QUESTIONS.map((q) => ({ q, sealed: r.sealQuestion(q, firstMap) })),
  findings: { input: FINDINGS, output: checked, fixed, corrected, count: r.countLine(checked) },
  reports: REPORTS.map((text) => {
    const merged = r.mergeEntities(r.findPatternEntities(text), MODEL, text);
    const s = r.seal(text, merged);
    const parsed = h.quickParse(text);
    return {
      text, pattern: r.findPatternEntities(text), merged, sealed: s.sealed, map: s.map, parsed,
      keys: parsed.map((f) => h.normaliseTest(f.test)), critical: h.criticalFindings(parsed),
    };
  }),
  ranges: RANGES.map(([value, reference]) => ({ value, reference, status: r.rangeStatus(value, reference) })),
};
const dir = join(here, "app/src/sharedTest/resources");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "parity.json"), JSON.stringify(out, null, 1));
console.log("wrote parity.json:", out.reports.length, "reports,", out.ranges.length, "ranges");
