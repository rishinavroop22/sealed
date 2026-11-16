// Firebase setup: App, App Check, and the three Firebase AI Logic hybrid models.
// Every model call in Sealed goes through Firebase AI Logic (firebase/ai).
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app-check.js";
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  InferenceMode,
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-ai.js";
import {
  firebaseConfig,
  RECAPTCHA_ENTERPRISE_SITE_KEY,
  CLOUD_MODEL,
} from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);

// App Check: debug provider on localhost, reCAPTCHA Enterprise on the hosted site.
const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
export let appCheckReady = false;
// On localhost only: a per-browser debug token, kept in this browser's storage and never in the repo.
export let debugToken = "";
try {
  if (isLocal) {
    try {
      debugToken = localStorage.getItem("sealedAppCheckDebugToken") || crypto.randomUUID();
      localStorage.setItem("sealedAppCheckDebugToken", debugToken);
    } catch { debugToken = crypto.randomUUID(); }
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  }
  if (isLocal || RECAPTCHA_ENTERPRISE_SITE_KEY) {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(
        RECAPTCHA_ENTERPRISE_SITE_KEY || "debug-provider-only"
      ),
      isTokenAutoRefreshEnabled: true,
    });
    appCheckReady = true;
  }
} catch (err) {
  console.warn("[Sealed] App Check not initialised:", err);
}

const ai = getAI(app, { backend: new GoogleAIBackend() });

const textIO = {
  expectedInputs: [{ type: "text", languages: ["en"] }],
  expectedOutputs: [{ type: "text", languages: ["en"] }],
};

// JSON shape the on-device model must return when finding identifiers.
export const ENTITY_SCHEMA = {
  type: "object",
  properties: {
    entities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          type: {
            type: "string",
            enum: ["NAME", "DOCTOR", "FACILITY", "ADDRESS", "ID", "CONTACT", "DOB"],
          },
        },
        required: ["text", "type"],
      },
    },
  },
  required: ["entities"],
};

// 1. The sealer. ONLY_ON_DEVICE: the raw report can never be sent to the cloud,
//    even if the on-device model is missing. There is no fallback by design.
export const sealerModel = getGenerativeModel(ai, {
  mode: InferenceMode.ONLY_ON_DEVICE,
  onDeviceParams: {
    createOptions: textIO,
    promptOptions: { responseConstraint: ENTITY_SCHEMA },
  },
});

// 2. Quick questions about the sealed report. PREFER_ON_DEVICE: answered locally
//    when possible (private, free, offline), in the cloud otherwise.
export const quickModel = getGenerativeModel(ai, {
  mode: InferenceMode.PREFER_ON_DEVICE,
  inCloudParams: { model: CLOUD_MODEL },
  onDeviceParams: { createOptions: textIO },
});

// 3. The deep explanation. PREFER_IN_CLOUD: the larger cloud model reads the
//    sealed report; if the device is offline, the on-device model answers instead.
export const deepModel = getGenerativeModel(ai, {
  mode: InferenceMode.PREFER_IN_CLOUD,
  inCloudParams: {
    model: CLOUD_MODEL,
    generationConfig: { responseMimeType: "application/json" },
  },
  onDeviceParams: { createOptions: textIO },
});

// Status of Chrome's built-in model: "available", "downloadable", "downloading" or "unavailable".
export async function deviceModelStatus() {
  try {
    if (!("LanguageModel" in self)) return "unavailable";
    return await self.LanguageModel.availability(textIO);
  } catch {
    return "unavailable";
  }
}

// Must be called from a user gesture (click). Starts the model download if needed.
export function warmDeviceModel(onProgress) {
  const jobs = [sealerModel, quickModel, deepModel].map((m) =>
    Promise.resolve()
      .then(() => m.initializeDeviceModel?.(onProgress))
      .catch((err) => console.warn("[Sealed] device model init:", err))
  );
  return Promise.all(jobs);
}

export { InferenceMode };
