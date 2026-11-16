// Firebase web configuration for the Sealed project.
// These values identify the Firebase project to the browser; they are not secrets.
// Access to the Gemini API is protected by Firebase App Check, not by this key.
export const firebaseConfig = {
  apiKey: "AIzaSyBNhTUtYR2NrarGlhKCs84yC1quvaEruWk",
  authDomain: "sealed-hybrid-ai.firebaseapp.com",
  projectId: "sealed-hybrid-ai",
  storageBucket: "sealed-hybrid-ai.firebasestorage.app",
  messagingSenderId: "864197298923",
  appId: "1:864197298923:web:6112612c5cc5f073a28cae",
  measurementId: "G-4CZ8G9EECG"
};

// reCAPTCHA Enterprise site key used by Firebase App Check on the hosted site.
// (A site key is public by design.) Restricted to this project's hosted domains.
export const RECAPTCHA_ENTERPRISE_SITE_KEY = "6LcqmSMuAAAAAOXGnr8ebVHjZSN6X_8oRCRWEXN8";

// Cloud model used for the deep explanation. Remote Config can override this later.
export const CLOUD_MODEL = "gemini-3.5-flash-lite";
