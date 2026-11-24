// Scoring for the sealing test. Pure functions: no network, no model calls.
import { seal } from "./redact.js";

// Reads {{TYPE:text}} marks and "> " result lines out of a case.
export function parseCase(c) {
  const truth = [], results = [];
  const text = c.text.split("\n").map((line) => {
    const isResult = line.startsWith("> ");
    const plain = (isResult ? line.slice(2) : line).replace(/\{\{([A-Z]+):([^}]+)\}\}/g, (_, type, t) => { truth.push({ type, text: t }); return t; });
    if (isResult) results.push(plain);
    return plain;
  }).join("\n");
  return { ...c, text, truth, results };
}

// Words that identify nobody by themselves, so leaving one visible is not a leak.
const COMMON = /^(mr|mrs|ms|miss|master|baby|dr|md|the|and|near|old|new|road|street|floor|flat|plot|nagar|lines|view|stand|bus|city|care|family|centre|center|clinic|clinical|lab|labs|laboratory|diagnostics?|pathology|hospital|multispeciality|memorial|medical|scans|polyclinic|software|assist|3rd|1st|2nd)$/i;
// Two-digit fragments ("11" from a date) also occur in results, so a word needs 3 letters and a number 4 digits to count.
const parts = (t) => (t.includes("@") ? [t] : t.split(/[^\p{L}\p{M}\p{N}]+/u).filter((w) => (/^\p{N}+$/u.test(w) ? w.length >= 4 : w.length >= 3) && !COMMON.test(w)));
const has = (text, w) => new RegExp(`(?<![\\p{L}\\p{M}\\p{N}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{M}\\p{N}])`, "iu").test(text);

// An identifier counts as hidden only if not one of its own words or numbers is still readable anywhere.
export function scoreCase(p, entities) {
  const { sealed, map } = seal(p.text, entities);
  const left = sealed.replace(/\[[A-Z]+_\d+\]/g, " ");
  const items = p.truth.map((t) => {
    const ws = parts(t.text);
    const all = ws.length ? ws : [t.text];
    const seen = all.filter((w) => has(left, w));
    return { ...t, state: !seen.length ? "hidden" : seen.length === all.length ? "missed" : "partly", seen };
  });
  const lost = p.results.filter((r) => !sealed.includes(r));
  const truthText = p.truth.map((t) => t.text.toLowerCase());
  const extra = Object.values(map).filter((v) => !truthText.some((t) => t.includes(v.toLowerCase()) || v.toLowerCase().includes(t)));
  return { kind: p.kind, set: p.set, results: p.results.length, sealed, items, lost, extra };
}

// Direct identifiers point at the person by themselves.
const DIRECT = new Set(["NAME", "ID", "CONTACT", "DOB"]);
const count = (list) => ({ hidden: list.filter((i) => i.state === "hidden").length, all: list.length });

export function total(scores) {
  const items = scores.flatMap((s) => s.items);
  const results = scores.reduce((n, s) => n + s.results, 0), lost = scores.reduce((n, s) => n + s.lost.length, 0);
  return {
    all: count(items),
    direct: count(items.filter((i) => DIRECT.has(i.type))),
    results: { kept: results - lost, all: results },
    extra: scores.reduce((n, s) => n + s.extra.length, 0),
    byType: Object.fromEntries(["NAME", "ID", "CONTACT", "DOB", "DOCTOR", "FACILITY", "ADDRESS"].map((t) => [t, count(items.filter((i) => i.type === t))])),
  };
}
