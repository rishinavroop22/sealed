// Read-only view of a doctor share link. Loads one snapshot from Firestore; no sign-in, no AI.
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import { sparkline, trendSentence, monthLabel } from "./health.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const card = document.getElementById("share-card");
const id = (location.hash.slice(1) || new URLSearchParams(location.search).get("id") || "").trim();

async function load() {
  if (!/^[A-Za-z0-9]{16,40}$/.test(id)) throw new Error("This link is incomplete.");
  const db = getFirestore(initializeApp(firebaseConfig));
  const snap = await getDoc(doc(db, "shares", id));
  if (!snap.exists()) throw new Error("This link has expired or was stopped by the patient.");
  return snap.data();
}

function render(d) {
  const findings = d.findings || [];
  const abnormal = findings.filter((f) => ["low", "high"].includes(f.status));
  const normal = findings.filter((f) => !["low", "high"].includes(f.status));
  const expires = d.expiresAt?.toDate?.();
  document.title = `Lab results · ${monthLabel(d.month)} · Sealed`;
  card.innerHTML = `
    <div class="card-head">
      <h1 class="share-title">Lab results to discuss</h1>
      <span class="where">${esc(monthLabel(d.month))}${expires ? ` · link expires ${expires.toLocaleDateString()}` : ""}</span>
    </div>
    ${d.critical?.length ? `<div class="alert" role="alert"><strong>Needs prompt attention</strong>${d.critical.map((c) => `${esc(c.test)} ${esc(c.value)} (${esc(c.why)})`).join("; ")}</div>` : ""}
    ${d.summary ? `<p class="summary">${esc(d.summary)}</p>` : ""}
    <h2>Outside the reference range</h2>
    ${abnormal.length ? table(abnormal) : `<p class="note">None of the listed results are outside their range.</p>`}
    ${d.trends?.length ? `<h2>Changes over time</h2><div class="trend-grid">${d.trends.map((s) => `
      <figure class="trend"><figcaption><strong>${esc(s.label)}</strong><span>${esc(s.reference ? "ref " + s.reference : "")}</span></figcaption>
      ${sparkline(s)}<p>${esc(trendSentence(s))}</p></figure>`).join("")}</div>` : ""}
    ${d.questions?.length ? `<h2>The patient's questions</h2><ol class="questions">${d.questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ol>` : ""}
    ${normal.length ? `<details class="all-results"><summary>All other results (${normal.length})</summary>${table(normal)}</details>` : ""}`;
}

function table(rows) {
  return `<div class="table-wrap"><table class="results"><thead><tr><th>Test</th><th>Result</th><th>Reference</th><th>Status</th></tr></thead><tbody>
    ${rows.map((f) => `<tr><td>${esc(f.test)}</td><td>${esc(f.value)}</td><td>${esc(f.reference)}</td><td><span class="status ${esc(f.status)}">${esc(f.status)}</span></td></tr>`).join("")}
  </tbody></table></div>`;
}

load().then(render).catch((err) => {
  console.warn("[Sealed] share load failed:", err);
  card.innerHTML = `<p class="note warn">${esc(err?.message?.includes("permission") ? "This link has expired or was stopped by the patient." : err?.message || err)}</p>`;
});
