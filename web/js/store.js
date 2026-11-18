// Sign-in and saved history.
// Firebase Authentication (anonymous) gives each browser a private account with no name or email.
// Cloud Firestore stores ONLY sealed text. The key that turns [NAME_1] back into a real
// name is kept in this browser's local storage and is never uploaded.
import { app } from "./firebase.js";
import {
  getAuth, signInAnonymously, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, addDoc, getDocs, deleteDoc, doc,
  query, orderBy, limit, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

const auth = getAuth(app);
let db;
try {
  db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
} catch (err) {
  console.warn("[Sealed] Firestore offline cache unavailable:", err);
  db = initializeFirestore(app, {});
}

// Resolves with the signed-in user's id, or null if sign-in is not possible (for example offline on first visit).
export const userReady = new Promise((resolve) => {
  let settled = false;
  const done = (uid) => { if (!settled) { settled = true; resolve(uid); } };
  onAuthStateChanged(auth, (user) => {
    if (user) done(user.uid);
    else signInAnonymously(auth).catch((err) => { console.warn("[Sealed] sign-in failed:", err); done(null); });
  });
  setTimeout(() => done(auth.currentUser?.uid || null), 8000);
});

const KEYS = "sealed.keys.v1";
const readKeys = () => { try { return JSON.parse(localStorage.getItem(KEYS) || "{}"); } catch { return {}; } };
const writeKeys = (k) => { try { localStorage.setItem(KEYS, JSON.stringify(k)); } catch {} };
export const localKey = (id) => readKeys()[id] || null;

const reports = (uid) => collection(db, "users", uid, "reports");

// Save a sealed report and its explanation. `map` (placeholder -> real value) stays on this device.
export async function saveReport({ sealed, explanation, where, language, hidden, profile, month, results }, map) {
  const uid = await userReady;
  if (!uid) throw new Error("Not signed in. Connect to the internet once to enable saving.");
  const ref = await addDoc(reports(uid), {
    sealed,
    explanation: JSON.stringify(explanation ?? null),
    where, language, hidden,
    // An opaque person id ("p3k9"); the person's name stays in this browser. Month only, never a full date.
    profile: profile || "me", month: month || "",
    results: results || [],
    createdAt: serverTimestamp(),
  });
  const keys = readKeys(); keys[ref.id] = map; writeKeys(keys);
  return ref.id;
}

export async function listReports() {
  const uid = await userReady;
  if (!uid) return [];
  const snap = await getDocs(query(reports(uid), orderBy("createdAt", "desc"), limit(100)));
  return snap.docs.map((d) => {
    const v = d.data();
    let explanation = null;
    try { explanation = JSON.parse(v.explanation || "null"); } catch {}
    return {
      id: d.id, sealed: v.sealed || "", explanation, where: v.where || "cloud",
      language: v.language || "English", hidden: v.hidden || 0,
      profile: v.profile || "me", month: v.month || "", results: Array.isArray(v.results) ? v.results : [],
      createdAt: v.createdAt?.toDate?.() || new Date(),
    };
  });
}

export async function removeReport(id) {
  const uid = await userReady;
  if (!uid) return;
  await deleteDoc(doc(db, "users", uid, "reports", id));
  const keys = readKeys(); delete keys[id]; writeKeys(keys);
}

// ---------- people (family profiles) ----------
// Names are kept only in this browser. Firestore sees an opaque id.
const PEOPLE = "sealed.people.v1";
export function people() {
  try {
    const list = JSON.parse(localStorage.getItem(PEOPLE) || "null");
    if (Array.isArray(list) && list.length) return list;
  } catch {}
  return [{ id: "me", name: "Me" }];
}
export function addPerson(name) {
  const list = people();
  const id = "p" + Math.random().toString(36).slice(2, 6);
  list.push({ id, name: String(name).trim().slice(0, 30) });
  try { localStorage.setItem(PEOPLE, JSON.stringify(list)); } catch {}
  return id;
}
