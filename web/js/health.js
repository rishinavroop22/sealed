import { rangeStatus, severalRanges, plainMeaning } from "./redact.js";

// Health features that run as plain code on the device: no model, no network.
// - test name normalisation and value parsing for the timeline
// - critical-value alerts (instant, offline, before any AI runs)
// - report month detection
// - small SVG trend charts
// - read aloud in Indian languages

// ---------- test names ----------
const SYNONYMS = [
  ["hba1c", /\b(hba1c|hb\s*a1c|glycated\s+ha?emoglobin|glycosylated)/i],
  ["haemoglobin", /^(ha?emoglobin|hb|hgb)\b(?!\s*a1c)/i],
  ["fasting glucose", /(fasting\s+(blood\s+)?(glucose|sugar)|glucose\s*[-,(]?\s*fasting|\bfbs\b|\bfbg\b)/i],
  ["post-meal glucose", /(post\s*prandial|\bppbs\b|\bpp\s*glucose|glucose\s*[-,(]?\s*pp\b)/i],
  ["random glucose", /(random\s+(blood\s+)?(glucose|sugar)|\brbs\b)/i],
  ["creatinine", /^(serum\s+)?creatinine\b/i],
  ["urea", /^(blood\s+)?urea\b(?!\s*nitrogen)/i],
  ["uric acid", /\buric\s+acid/i],
  ["tsh", /\b(tsh|thyroid\s+stimulating)/i],
  ["vitamin d", /(vitamin\s*d|25\s*-?\s*oh)/i],
  ["vitamin b12", /(vitamin\s*b\s*12|cobalamin)/i],
  ["total cholesterol", /^(total\s+)?cholesterol\b(?!.*(hdl|ldl|vldl|ratio))/i],
  ["ldl cholesterol", /\bldl\b/i],
  ["hdl cholesterol", /\bhdl\b/i],
  ["triglycerides", /triglyceride/i],
  ["alt (sgpt)", /(\bsgpt\b|\balt\b|alanine\s+(amino)?transaminase)/i],
  ["ast (sgot)", /(\bsgot\b|\bast\b|aspartate\s+(amino)?transaminase)/i],
  ["alkaline phosphatase", /alkaline\s+phosphatase|\balp\b/i],
  ["bilirubin total", /bilirubin.*total|total\s+bilirubin/i],
  ["bilirubin direct", /bilirubin.*direct|direct\s+bilirubin/i],
  ["albumin", /^(serum\s+)?albumin\b/i],
  ["platelets", /platelet/i],
  ["wbc", /(\bwbc\b|white\s+blood|total\s+leu[ck]ocyte|\btlc\b)/i],
  ["sodium", /^sodium|\bna\+?\b/i],
  ["potassium", /^potassium|\bk\+\b/i],
  ["egfr", /\begfr\b/i],
];

export function normaliseTest(name) {
  const n = String(name || "").replace(/^(electrolytes|biochemistry|chemistry|liver function test|lft|kft)\s+/i, "").trim();
  // Ratios ("SGOT/SGPT ratio", "A/G ratio") must never be matched to a single test.
  if (/ratio/i.test(n)) return ("ratio " + n.toLowerCase().replace(/\bsr\.?\s*/g, "").replace(/[^a-z]+/g, " ").replace(/\bratio\b/g, "").replace(/\s+/g, " ").trim()).replace(/^ratio a g$/, "ratio albumin globulin");
  for (const [key, re] of SYNONYMS) if (re.test(n)) return key;
  return n.toLowerCase().replace(/[^a-z0-9 ()]+/g, " ").replace(/\s+/g, " ").trim();
}

export const numberIn = (s) => {
  const m = String(s ?? "").replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};

// ---------- critical values ----------
// General adult thresholds where a result usually needs prompt medical attention.
// They are deliberately conservative and shown as "contact a doctor today", never as a diagnosis.
const CRITICAL = {
  "potassium": { low: 2.8, high: 6.2, unit: "mEq/L" },
  "sodium": { low: 120, high: 160, unit: "mEq/L" },
  "fasting glucose": { low: 50, high: 400, unit: "mg/dL" },
  "random glucose": { low: 50, high: 400, unit: "mg/dL" },
  "post-meal glucose": { low: 50, high: 400, unit: "mg/dL" },
  "haemoglobin": { low: 7, high: 20, unit: "g/dL" },
  "creatinine": { high: 5, unit: "mg/dL" },
  "hba1c": { high: 12, unit: "%" },
  "alt (sgpt)": { high: 1000, unit: "U/L" },
  "ast (sgot)": { high: 1000, unit: "U/L" },
  "bilirubin total": { high: 15, unit: "mg/dL" },
};

// Platelets are written as 2.6 (lakh/cumm), 260 (10^3/uL) or 260000 (/cumm): convert to thousands per uL.
function plateletsK(v, unitText) {
  const u = String(unitText).toLowerCase();
  if (/lakh/.test(u)) return v * 100;
  if (v > 5000) return v / 1000;
  return v;
}

export function criticalFindings(findings) {
  const out = [];
  for (const f of findings || []) {
    const key = normaliseTest(f.test);
    let v = numberIn(f.value);
    if (v === null) continue;
    if (key === "platelets") {
      const k = plateletsK(v, f.value);
      if (k < 50) out.push({ test: f.test, value: f.value, why: "very low" });
      else if (k > 1000) out.push({ test: f.test, value: f.value, why: "very high" });
      continue;
    }
    const c = CRITICAL[key];
    if (!c) continue;
    if (c.low !== undefined && v < c.low) out.push({ test: f.test, value: f.value, why: "very low" });
    else if (c.high !== undefined && v > c.high) out.push({ test: f.test, value: f.value, why: "very high" });
  }
  return out;
}

// ---------- report month ----------
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
// Finds the report or sample date in the ORIGINAL text, on the device. Only "YYYY-MM" is ever stored.
// Reports also contain older dates (birth dates, accreditation, method notes), so: prefer dates on a
// collected / received / reported line; otherwise take the most recent date that is not in the future.
export function detectMonth(raw, today = new Date()) {
  const text = String(raw || "");
  const limit = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const found = [];
  const add = (y, mo, idx) => {
    if (y < 100) y += 2000;
    if (mo < 1 || mo > 12 || y < 2000) return;
    const ym = `${y}-${String(mo).padStart(2, "0")}`;
    if (ym <= limit) found.push({ ym, idx });
  };
  for (const m of text.matchAll(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/g)) add(+m[3], +m[2], m.index);
  for (const m of text.matchAll(/\b(?:\d{1,2}(?:st|nd|rd|th)?[\s-]*)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,.-]*(\d{4})\b/gi)) add(+m[2], MONTHS[m[1].toLowerCase()], m.index);
  if (!found.length) return "";
  const labelled = found.filter(({ idx }) => {
    const lineStart = text.lastIndexOf("\n", idx) + 1;
    const before = text.slice(Math.max(lineStart, idx - 60), idx);
    return /(collect|receiv|report|sample|regist|test\s*date|date\s*of\s*(test|report))/i.test(before) && !/(birth|dob|d\.o\.b)/i.test(before);
  });
  const pool = labelled.length ? labelled : found;
  return pool.map((f) => f.ym).sort().pop();
}

export const monthLabel = (ym) => {
  if (!ym) return "Undated";
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short", year: "numeric" });
};

// ---------- timeline ----------
// items: saved reports [{ month, explanation: { findings } }] for one person.
// Returns series per test: { key, label, unit, reference, points: [{ month, value, status }] }
export function buildSeries(items) {
  const byKey = new Map();
  const sorted = [...items].filter((i) => i.month).sort((a, b) => a.month.localeCompare(b.month));
  for (const item of sorted) {
    for (const f of (item.results?.length ? item.results : item.explanation?.findings) || []) {
      const v = numberIn(f.value);
      if (v === null) continue;
      const key = normaliseTest(f.test);
      if (!byKey.has(key)) byKey.set(key, { key, label: f.test, unit: "", reference: f.reference || "", points: [] });
      const s = byKey.get(key);
      const unit = String(f.value).replace(/^[\s\d.,-]+/, "").trim();
      if (unit && !s.unit) s.unit = unit;
      const existing = s.points.find((p) => p.month === item.month);
      const status = rangeStatus(f.value, f.reference) || ""; // labels come from code, never from a model
      if (existing) Object.assign(existing, { value: v, reference: f.reference || "", status });
      else s.points.push({ month: item.month, value: v, reference: f.reference || "", status });
      if (f.reference) s.reference = f.reference;
    }
  }
  return [...byKey.values()]
    .sort((a, b) => b.points.length - a.points.length || a.key.localeCompare(b.key));
}

const WHERE = { low: "below range", normal: "in range", high: "above range" };
const tag = (p) => (WHERE[p.status] ? ` (${WHERE[p.status]})` : "");

export function trendSentence(s) {
  const p = s.points;
  const unit = s.unit ? " " + s.unit : "";
  if (p.length < 2) return `${s.label}: ${p[0].value}${unit}${tag(p[0])} in ${monthLabel(p[0].month)}.`;
  const first = p[0], last = p[p.length - 1];
  const diff = last.value - first.value;
  const pct = first.value ? Math.round((diff / Math.abs(first.value)) * 100) : 0;
  const dir = Math.abs(pct) < 5 ? "stayed about the same" : diff > 0 ? `rose ${Math.abs(pct)}%` : `fell ${Math.abs(pct)}%`;
  return `${s.label} ${dir}: ${first.value}${tag(first)} in ${monthLabel(first.month)}, ${last.value}${unit}${tag(last)} in ${monthLabel(last.month)}.`;
}

// Facts computed by code (direction, size of change, in or out of each report's own range).
// The AI only rephrases these; it is never asked to compare numbers itself.
export function trendFacts(series) {
  return series.map(trendSentence).join("\n");
}

// Changes worth showing first: moved out of range, moved back into range, or changed by 20% or more.
export function notableFirst(series) {
  const score = (s) => {
    const a = s.points[0], b = s.points[s.points.length - 1];
    const crossed = a.status !== b.status && (WHERE[a.status] || WHERE[b.status]) ? 2 : 0;
    const out = b.status === "low" || b.status === "high" ? 1 : 0;
    const big = a.value ? Math.min(1, Math.abs((b.value - a.value) / a.value) / 0.2) : 0;
    return crossed + out + big;
  };
  return [...series].sort((x, y) => score(y) - score(x));
}

function refBand(reference) {
  const r = String(reference || "").replace(/,/g, "");
  if (severalRanges(r)) return null; // no band when men and women have different ranges
  let m = r.match(/(-?\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(-?\d+(?:\.\d+)?)/i);
  if (m) return [parseFloat(m[1]), parseFloat(m[2])];
  m = r.match(/^\s*(?:<|<=|≤|up\s*to|upto|less\s+than|below)\s*(-?\d+(?:\.\d+)?)/i);
  if (m) return [null, parseFloat(m[1])];
  m = r.match(/^\s*(?:>|>=|≥)\s*(-?\d+(?:\.\d+)?)/i);
  if (m) return [parseFloat(m[1]), null];
  return null;
}

// A small accessible SVG chart with the reference range as a shaded band.
export function sparkline(s, w = 280, h = 90) {
  const pts = s.points;
  const band = refBand(s.reference);
  const vals = pts.map((p) => p.value).concat(band ? band.filter((x) => x !== null) : []);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (lo === hi) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.15; lo -= pad; hi += pad;
  const x = (i) => (pts.length === 1 ? w / 2 : 14 + (i * (w - 28)) / (pts.length - 1));
  const y = (v) => h - 14 - ((v - lo) / (hi - lo)) * (h - 28);
  const bandRect = band
    ? (() => {
        const top = y(band[1] ?? hi), bottom = y(band[0] ?? lo);
        return `<rect x="0" y="${Math.min(top, bottom).toFixed(1)}" width="${w}" height="${Math.abs(bottom - top).toFixed(1)}" class="band"/>`;
      })()
    : "";
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const inRange = (v) => !band || ((band[0] === null || v >= band[0]) && (band[1] === null || v <= band[1]));
  const dots = pts.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="4" class="${inRange(p.value) ? "ok" : "out"}"><title>${monthLabel(p.month)}: ${p.value}</title></circle>
    <text x="${x(i).toFixed(1)}" y="${(y(p.value) - 8).toFixed(1)}" text-anchor="middle" class="v">${p.value}</text>`).join("");
  const label = trendSentence(s) + (s.reference ? ` Reference range ${s.reference}.` : "");
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${label.replace(/"/g, "&quot;")}">${bandRect}<path d="${line}" class="ln"/>${dots}</svg>`;
}

// ---------- read aloud ----------
const LANG = { English: "en-IN", Hindi: "hi-IN", Telugu: "te-IN", Tamil: "ta-IN", Kannada: "kn-IN", Malayalam: "ml-IN", Marathi: "mr-IN", Bengali: "bn-IN", Gujarati: "gu-IN" };

export function voiceFor(language) {
  if (!("speechSynthesis" in self)) return null;
  const code = LANG[language] || "en-IN";
  const voices = speechSynthesis.getVoices();
  return voices.find((v) => v.lang === code) || voices.find((v) => v.lang.startsWith(code.slice(0, 2))) || null;
}

export function speak(text, language, onEnd) {
  if (!("speechSynthesis" in self)) return false;
  speechSynthesis.cancel();
  const voice = voiceFor(language);
  if (!voice && language !== "English") return false;
  const u = new SpeechSynthesisUtterance(text);
  if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = "en-IN";
  u.rate = 0.92;
  u.onend = () => onEnd?.();
  speechSynthesis.speak(u);
  return true;
}
export const stopSpeaking = () => { try { speechSynthesis.cancel(); } catch {} };

// ---------- network proof ----------
// Counts requests to the cloud model endpoint while a step runs, using the browser's own resource timing.
const AI_HOSTS = /firebasevertexai\.googleapis\.com|generativelanguage\.googleapis\.com|aiplatform\.googleapis\.com/;
export function watchCloudAI() {
  const seen = [];
  let obs = null;
  try {
    obs = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (AI_HOSTS.test(e.name)) seen.push(e.name);
    });
    obs.observe({ type: "resource", buffered: false });
  } catch {}
  return {
    stop: () => new Promise((r) => setTimeout(() => { try { obs?.disconnect(); } catch {} r(seen.length); }, 300)),
  };
}

// ---------- quick parse ----------
// Reads "Test name [METHOD] value unit range" lines straight from the report text with fixed rules,
// so critical values are flagged the moment a report is added (even offline) and the timeline
// does not depend on which tests an AI explanation chose to mention.
const NOT_A_TEST = /^(page|lab|sample|barcode|ref|age|dob|date|report|uhid|mrd|bill|phone|ph|patient|name|time|received|collected|registered|printed|reported)\b/i;
// Method words some labs print between the test name and the value.
const METHODS = "photometry|spectrophotometry|calculated|calculation|immunoassay|c\\.?l\\.?i\\.?a|e\\.?c\\.?l\\.?i\\.?a|elisa|hplc|turbidimetry|nephelometry|potentiometry|ise(?:\\s+direct|\\s+indirect)?|colorimetric|enzymatic|flow\\s+cytometry|automated|impedance|derived";
export function quickParse(raw) {
  const out = [];
  for (const line of String(raw || "").split(/\r?\n/)) {
    const m = line.match(new RegExp(String.raw`^\s*([A-Za-z][A-Za-z0-9 ().,\/'+-]{1,60}?)\s+(?:(?:${METHODS})\s+)?(-?\d[\d,]*(?:\.\d+)?)\s*([A-Za-zµ%][A-Za-z%µ\/^0-9.]*)?\s*(.*)$`, "i"));
    if (!m || NOT_A_TEST.test(m[1])) continue;
    const key = normaliseTest(m[1]);
    if (!key || key.length > 40 || /^\d/.test(key)) continue;
    const rest = (m[4] || "").trim();
    const ref = rest.match(/((?:<|>|<=|>=|≤|≥|up\s*to|upto|less\s+than|below|more\s+than|above)\s*\d[\d.,]*|\d[\d.,]*\s*(?:-|–|to)\s*\d[\d.,]*)/i);
    // A line with separate ranges for men and women keeps them all, so no single one is ever picked.
    const reference = severalRanges(rest) ? rest : ref ? ref[1].trim() : "";
    out.push({ test: m[1].trim().replace(/[\s-]+$/, ""), value: `${m[2]} ${m[3] || ""}`.trim(), reference });
  }
  return out;
}

// Numbers the model copied are compared with the report itself. A wrong value or range is replaced.
// Tests that appear more than once are left alone unless one printed value matches.
const rangeNumbers = (ref) => (String(ref || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/g) || []).map(Number).join("|");
export function reconcile(findings, parsed) {
  const byKey = new Map();
  for (const p of parsed || []) {
    const k = normaliseTest(p.test);
    byKey.set(k, [...(byKey.get(k) || []), p]);
  }
  let fixed = 0;
  for (const f of findings || []) {
    const printed = byKey.get(normaliseTest(f.test));
    if (!printed) continue;
    const same = printed.find((p) => numberIn(p.value) === numberIn(f.value));
    const source = same || (printed.length === 1 ? printed[0] : null);
    if (!source || (same && (!source.reference || rangeNumbers(source.reference) === rangeNumbers(f.reference)))) continue;
    fixed++;
    f.reference = source.reference || f.reference || "";
    if (!same) {
      f.value = source.value;
      f.meaning = plainMeaning(rangeStatus(f.value, f.reference), f.reference);
      f.checked = true;
    }
  }
  return fixed;
}

// Results for the timeline: every test parsed from the report, with AI findings filling any gaps.
export function mergeResults(findings, parsed) {
  const byKey = new Map();
  for (const r of parsed || []) if (numberIn(r.value) !== null) byKey.set(normaliseTest(r.test), { test: r.test, value: r.value, reference: r.reference || "" });
  for (const f of findings || []) {
    const k = normaliseTest(f.test);
    if (!byKey.has(k) && numberIn(f.value) !== null) byKey.set(k, { test: f.test, value: f.value, reference: f.reference || "" });
    else if (byKey.has(k) && !byKey.get(k).reference && f.reference) byKey.get(k).reference = f.reference;
  }
  return [...byKey.values()].slice(0, 80);
}
