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
  query, orderBy, limit, serverTimestamp, setDoc, Timestamp, updateDoc, writeBatch,
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

// ---------- family link ----------
// Linked devices share one sealed timeline under /families/{unguessable id}. Names are not in it: they travel only
// inside the QR code, after "#" in the link, which browsers never send to a server.
const FAMILY = "sealed.family.v1";
export const family = () => { try { return JSON.parse(localStorage.getItem(FAMILY) || "null"); } catch { return null; } };
const setFamily = (f) => { try { f ? localStorage.setItem(FAMILY, JSON.stringify(f)) : localStorage.removeItem(FAMILY); } catch {} };
const INVITE_MINUTES = 10;
const inviteUntil = () => Timestamp.fromMillis(Date.now() + INVITE_MINUTES * 60 * 1000);
const newId = () => [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");

const own = (uid) => collection(db, "users", uid, "reports");
const reports = (uid) => (family() ? collection(db, "families", family().id, "reports") : own(uid));

// Moves this device's own saved reports into the shared timeline.
async function moveToFamily(uid, id) {
  const snap = await getDocs(query(own(uid), limit(200)));
  for (let i = 0; i < snap.docs.length; i += 100) {
    const batch = writeBatch(db);
    for (const d of snap.docs.slice(i, i + 100)) {
      batch.set(doc(db, "families", id, "reports", d.id), d.data());
      batch.delete(d.ref);
    }
    await batch.commit();
  }
}

// Opens the shared timeline for new devices for 10 minutes and returns the code's contents.
export async function createInvite() {
  const uid = await userReady;
  if (!uid) throw new Error("Connect to the internet to link a device.");
  let f = family();
  if (f) {
    await updateDoc(doc(db, "families", f.id), { inviteUntil: inviteUntil() });
  } else {
    f = { id: newId() };
    await setDoc(doc(db, "families", f.id), { owner: uid, createdAt: serverTimestamp(), inviteUntil: inviteUntil() });
    await setDoc(doc(db, "families", f.id, "members", uid), { joinedAt: serverTimestamp() });
    await moveToFamily(uid, f.id);
    setFamily(f);
  }
  return encodeInvite({ f: f.id, p: people() });
}

export function encodeInvite(invite) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(invite)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Returns { f, p } or null if the code is not a Sealed code.
export function decodeInvite(code) {
  try {
    const v = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(code.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))));
    if (!/^[0-9a-f]{32}$/.test(v.f) || !Array.isArray(v.p)) return null;
    const p = v.p.filter((x) => /^[a-z0-9]{1,8}$/.test(x?.id) && typeof x.name === "string").map((x) => ({ id: x.id, name: x.name.slice(0, 30) }));
    return { f: v.f, p };
  } catch { return null; }
}

export async function joinFamily(invite) {
  const uid = await userReady;
  if (!uid) throw new Error("Connect to the internet to link this device.");
  await setDoc(doc(db, "families", invite.f, "members", uid), { joinedAt: serverTimestamp() });
  await moveToFamily(uid, invite.f);
  setFamily({ id: invite.f });
  const list = people().filter((p) => !invite.p.some((x) => x.id === p.id));
  writePeople([...invite.p, ...list]);
}

// Stops sharing on this device. The shared timeline stays on the other devices.
export async function leaveFamily() {
  const uid = await userReady, f = family();
  if (uid && f) await deleteDoc(doc(db, "families", f.id, "members", uid)).catch((err) => console.warn("[Sealed] leave:", err));
  setFamily(null);
}

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
  let snap;
  try {
    snap = await getDocs(query(reports(uid), orderBy("createdAt", "desc"), limit(100)));
  } catch (err) {
    if (!family() || err?.code !== "permission-denied") throw err;
    setFamily(null); // this device was removed from the shared timeline
    snap = await getDocs(query(reports(uid), orderBy("createdAt", "desc"), limit(100)));
  }
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
  await deleteDoc(doc(reports(uid), id));
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
  writePeople(list);
  return id;
}
function writePeople(list) { try { localStorage.setItem(PEOPLE, JSON.stringify(list)); } catch {} }

// ---------- doctor share links ----------
// A share is a read-only snapshot under /shares/{random id}: sealed results, trends and questions only.
// No names (they never leave the browser). It expires after the chosen number of days and the owner can delete it.
export async function createShare(payload, days = 7) {
  const uid = await userReady;
  if (!uid) throw new Error("Not signed in. Connect to the internet once to enable sharing.");
  const ref = doc(collection(db, "shares"));
  const expiresAt = Timestamp.fromMillis(Date.now() + days * 24 * 60 * 60 * 1000);
  await setDoc(ref, { ...payload, owner: uid, createdAt: serverTimestamp(), expiresAt });
  return { id: ref.id, expiresAt: expiresAt.toDate() };
}

export async function deleteShare(id) {
  await deleteDoc(doc(db, "shares", id));
}
