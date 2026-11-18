// Firebase setup: App, App Check, Remote Config and the Firebase AI Logic hybrid models.
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
  getRemoteConfig,
  fetchAndActivate,
  getValue,
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-remote-config.js";
import {
  firebaseConfig,
  RECAPTCHA_ENTERPRISE_SITE_KEY,
  CLOUD_MODEL,
} from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);

// ---------- App Check: debug provider on localhost, reCAPTCHA Enterprise on the hosted site ----------
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

// ---------- Remote Config: the cloud model and the quick-question route can change without a release ----------
const DEFAULTS = { cloud_model: CLOUD_MODEL, quick_route: "prefer_on_device" };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const configReady = (async () => {
  const cfg = { cloudModel: DEFAULTS.cloud_model, quickRoute: DEFAULTS.quick_route, source: "default" };
  try {
    const rc = getRemoteConfig(app);
    rc.settings.minimumFetchIntervalMillis = isLocal ? 0 : 60 * 60 * 1000;
    rc.defaultConfig = DEFAULTS;
    await Promise.race([fetchAndActivate(rc), wait(4000)]);
    cfg.cloudModel = getValue(rc, "cloud_model").asString() || cfg.cloudModel;
    cfg.quickRoute = getValue(rc, "quick_route").asString() || cfg.quickRoute;
    cfg.source = getValue(rc, "cloud_model").getSource();
  } catch (err) {
    console.warn("[Sealed] Remote Config unavailable, using defaults:", err);
  }
  return cfg;
})();

// ---------- Firebase AI Logic ----------
const ai = getAI(app, { backend: new GoogleAIBackend() });

const textIO = {
  expectedInputs: [{ type: "text", languages: ["en"] }],
  expectedOutputs: [{ type: "text", languages: ["en"] }],
};
const imageIO = {
  expectedInputs: [{ type: "image" }, { type: "text", languages: ["en"] }],
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
          type: { type: "string", enum: ["NAME", "DOCTOR", "FACILITY", "ADDRESS", "ID", "CONTACT", "DOB"] },
        },
        required: ["text", "type"],
      },
    },
  },
  required: ["entities"],
};

// JSON shape of an explanation (used to constrain the on-device model; the cloud model gets it in the prompt).
export const EXPLAIN_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    urgent: { type: "string" },
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          test: { type: "string" },
          value: { type: "string" },
          reference: { type: "string" },
          status: { type: "string", enum: ["low", "normal", "high", "unclear"] },
          meaning: { type: "string" },
        },
        required: ["test", "value", "status", "meaning"],
      },
    },
    questions: { type: "array", items: { type: "string" } },
  },
  required: ["summary", "findings", "questions"],
};

const ROUTES = {
  prefer_on_device: InferenceMode.PREFER_ON_DEVICE,
  only_on_device: InferenceMode.ONLY_ON_DEVICE,
  prefer_in_cloud: InferenceMode.PREFER_IN_CLOUD,
};

let models;
export async function getModels() {
  if (models) return models;
  const cfg = await configReady;
  const cloud = { model: cfg.cloudModel };
  models = {
    config: cfg,

    // 1. The sealer. ONLY_ON_DEVICE: the raw report can never be sent to the cloud,
    //    even if the on-device model is missing. There is deliberately no fallback.
    sealer: getGenerativeModel(ai, {
      mode: InferenceMode.ONLY_ON_DEVICE,
      onDeviceParams: { createOptions: textIO, promptOptions: { responseConstraint: ENTITY_SCHEMA } },
    }),

    // 2. The reader. ONLY_ON_DEVICE: photos and scans are transcribed locally and never uploaded.
    reader: getGenerativeModel(ai, {
      mode: InferenceMode.ONLY_ON_DEVICE,
      onDeviceParams: { createOptions: imageIO },
    }),

    // 3. Quick questions about the sealed report. Route set by Remote Config
    //    (default PREFER_ON_DEVICE: private, free and offline; cloud on devices without a local model).
    quick: getGenerativeModel(ai, {
      mode: ROUTES[cfg.quickRoute] || InferenceMode.PREFER_ON_DEVICE,
      inCloudParams: cloud,
      onDeviceParams: { createOptions: textIO },
    }),
    quickLocal: getGenerativeModel(ai, {
      mode: InferenceMode.ONLY_ON_DEVICE,
      onDeviceParams: { createOptions: textIO },
    }),

    // 4. The full explanation. PREFER_IN_CLOUD: the larger cloud model reads the sealed
    //    report; with no network the on-device model answers instead.
    deep: getGenerativeModel(ai, {
      mode: InferenceMode.PREFER_IN_CLOUD,
      inCloudParams: { ...cloud, generationConfig: { responseMimeType: "application/json" } },
      onDeviceParams: { createOptions: textIO, promptOptions: { responseConstraint: EXPLAIN_SCHEMA } },
    }),
    // 5. Rephrasing code-computed trend facts. PREFER_IN_CLOUD: the facts hold only test names,
    //    numbers and months, and the larger model rephrases more reliably; offline it runs on the device.
    summary: getGenerativeModel(ai, {
      mode: InferenceMode.PREFER_IN_CLOUD,
      inCloudParams: cloud,
      onDeviceParams: { createOptions: textIO },
    }),

    // Device-only mode and offline: the explanation never leaves the device either.
    deepLocal: getGenerativeModel(ai, {
      mode: InferenceMode.ONLY_ON_DEVICE,
      onDeviceParams: { createOptions: textIO, promptOptions: { responseConstraint: EXPLAIN_SCHEMA } },
    }),
  };
  return models;
}

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
export async function warmDeviceModel(onProgress, names = ["sealer"]) {
  const m = await getModels();
  await Promise.all(
    names.map((n) =>
      Promise.resolve()
        .then(() => m[n].initializeDeviceModel?.(onProgress))
        .catch((err) => console.warn(`[Sealed] device model init (${n}):`, err))
    )
  );
}

export const sourceOf = (result) =>
  String(result?.response?.inferenceSource || "").toLowerCase().includes("device") ? "device" : "cloud";
