// Reading reports from files. Everything here stays on the device:
// PDFs are parsed in the browser, and photos or scans are transcribed by the
// on-device model through Firebase AI Logic (ONLY_ON_DEVICE). Nothing is uploaded.
import { getModels, warmDeviceModel } from "./firebase.js";

const PDFJS = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/";

const READ_PROMPT = `Transcribe ALL the text in this medical report image, from the very top to the bottom.
Start with the header: the lab or hospital name, and the patient details such as name, age, sex, ID numbers, dates and the referring doctor. Then the tests.
Keep the original line breaks. Keep each test name on the same line as its result, unit and reference range.
Output only the transcribed text, with no comments.`;

// Scale an image down and return base64 JPEG data (no data: prefix).
async function toJpegBase64(source, max = 1600) {
  const bitmap = source instanceof HTMLCanvasElement ? source : await createImageBitmap(source);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9).split(",")[1];
}

async function transcribe(source, onStatus) {
  onStatus?.("Reading the image with the on-device model…");
  await warmDeviceModel((p) => onStatus?.(`Downloading the on-device model: ${Math.round(p * 100)}%`), ["reader"]);
  const { reader } = await getModels();
  const data = await toJpegBase64(source);
  const result = await reader.generateContent([
    READ_PROMPT,
    { type: "inlineData", inlineData: { data, mimeType: "image/jpeg" } },
  ]);
  return result.response.text().trim();
}

// Rebuild lines of text from PDF text items, keeping column gaps.
function pageToText(items) {
  const rows = new Map();
  for (const it of items) {
    if (!it.str) continue;
    const y = Math.round(it.transform[5] / 3) * 3;
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push({ x: it.transform[4], w: it.width || 0, s: it.str });
  }
  return [...rows.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, parts]) => {
      parts.sort((a, b) => a.x - b.x);
      let line = "", end = null;
      for (const p of parts) {
        if (end !== null) line += p.x - end > 12 ? "    " : p.x - end > 1.5 ? " " : "";
        line += p.s;
        end = p.x + p.w;
      }
      return line.trimEnd();
    })
    .filter((l) => l.trim())
    .join("\n");
}

async function readPdf(file, onStatus) {
  onStatus?.("Opening the PDF on this device…");
  const pdfjs = await import(PDFJS + "pdf.min.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.mjs";
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = Math.min(pdf.numPages, 8);
  const texts = [];
  for (let i = 1; i <= pages; i++) {
    onStatus?.(`Reading page ${i} of ${pages}…`);
    const page = await pdf.getPage(i);
    texts.push(pageToText((await page.getTextContent()).items));
  }
  const text = texts.join("\n\n").trim();
  if (text.replace(/\s/g, "").length >= 40) return { text, how: "pdf-text" };

  // A scanned PDF has no text layer: render the pages and read them with the on-device model.
  const out = [];
  for (let i = 1; i <= Math.min(pages, 3); i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width; canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    out.push(await transcribe(canvas, (s) => onStatus?.(`Page ${i}: ${s}`)));
  }
  return { text: out.join("\n\n").trim(), how: "pdf-scan" };
}

// Returns { text, how } where how is "text", "pdf-text", "pdf-scan" or "image".
export async function readFile(file, onStatus) {
  const name = (file.name || "").toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return readPdf(file, onStatus);
  if (file.type === "image/jpeg" || file.type === "image/png") {
    return { text: await transcribe(file, onStatus), how: "image" };
  }
  if (file.type.startsWith("text/") || name.endsWith(".txt")) return { text: await file.text(), how: "text" };
  throw new Error("Sealed can read PDF, JPEG, PNG and text files.");
}
