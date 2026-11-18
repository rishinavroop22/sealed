// Sealing inside the extension: pattern rules plus Gemini Nano through Firebase AI Logic.
// ONLY_ON_DEVICE: this extension never sends anything to a cloud model.
import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend, InferenceMode } from "firebase/ai";
import { findPatternEntities, mergeEntities, seal, unseal, chunk, readJson } from "../shared/redact.js";

const firebaseConfig = {
  apiKey: "AIzaSyBNhTUtYR2NrarGlhKCs84yC1quvaEruWk",
  authDomain: "sealed-hybrid-ai.firebaseapp.com",
  projectId: "sealed-hybrid-ai",
  storageBucket: "sealed-hybrid-ai.firebasestorage.app",
  messagingSenderId: "864197298923",
  appId: "1:864197298923:web:6112612c5cc5f073a28cae",
};

const textIO = {
  expectedInputs: [{ type: "text", languages: ["en"] }],
  expectedOutputs: [{ type: "text", languages: ["en"] }],
};

const ENTITY_SCHEMA = {
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

const PROMPT = (text) => `List the personal identifiers in this medical document: names of the patient, relatives and doctors; hospital and lab names; street addresses; ID numbers; phone numbers; emails; dates of birth.
Copy only the identifying words exactly as written, never the field label or a whole sentence. Never list tests, results, units, ranges, age or sex.
Return JSON: {"entities":[{"text":"...","type":"NAME|DOCTOR|FACILITY|ADDRESS|ID|CONTACT|DOB"}]}

DOCUMENT:
${text}`;

let model = null;
function sealerModel() {
  if (model) return model;
  const app = initializeApp(firebaseConfig, "sealed-extension");
  const ai = getAI(app, { backend: new GoogleAIBackend() });
  model = getGenerativeModel(ai, {
    mode: InferenceMode.ONLY_ON_DEVICE,
    onDeviceParams: { createOptions: textIO, promptOptions: { responseConstraint: ENTITY_SCHEMA } },
  });
  return model;
}

export async function deviceStatus() {
  try {
    if (!("LanguageModel" in self)) return "unavailable";
    return await self.LanguageModel.availability(textIO);
  } catch {
    return "unavailable";
  }
}

// Returns { sealed, map, count, usedModel }.
export async function sealText(raw) {
  let entities = findPatternEntities(raw);
  let usedModel = false;
  if ((await deviceStatus()) === "available") {
    try {
      const m = sealerModel();
      try { await m.initializeDeviceModel?.(); } catch {}
      let found = [];
      for (const part of chunk(raw, 2400)) {
        const result = await m.generateContent(PROMPT(part));
        const json = readJson(result.response.text());
        if (json?.entities) found = found.concat(json.entities);
      }
      entities = mergeEntities(entities, found, raw);
      usedModel = true;
    } catch (err) {
      console.warn("[Sealed] on-device model could not run; pattern rules only.", err);
    }
  }
  const { sealed, map } = seal(raw, entities);
  return { sealed, map, count: Object.keys(map).length, usedModel };
}

export { unseal };
