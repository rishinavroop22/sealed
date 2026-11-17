package com.rishinavroop.sealed

import android.graphics.Bitmap
import com.google.firebase.Firebase
import com.google.firebase.ai.InferenceMode
import com.google.firebase.ai.OnDeviceConfig
import com.google.firebase.ai.ai
import com.google.firebase.ai.ondevice.DownloadStatus
import com.google.firebase.ai.ondevice.FirebaseAIOnDevice
import com.google.firebase.ai.ondevice.OnDeviceModelStatus
import com.google.firebase.ai.type.GenerativeBackend
import com.google.firebase.ai.type.PublicPreviewAPI
import com.google.firebase.ai.type.content
import com.google.firebase.remoteconfig.remoteConfig
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withTimeoutOrNull
import org.json.JSONObject

// All model calls go through Firebase AI Logic, mirroring the web app's routes.
// If Android Studio flags an import, use Alt+Enter: the on-device SDK is a beta and package names may move.
@OptIn(PublicPreviewAPI::class)
class Ai {
    var cloudModel = "gemini-3.5-flash-lite"; private set
    var quickRoute = "prefer_on_device"; private set

    suspend fun loadConfig() {
        val rc = Firebase.remoteConfig
        rc.setDefaultsAsync(mapOf("cloud_model" to cloudModel, "quick_route" to quickRoute))
        withTimeoutOrNull(4000) { runCatching { rc.fetchAndActivate().await() } }
        cloudModel = rc.getString("cloud_model").ifBlank { cloudModel }
        quickRoute = rc.getString("quick_route").ifBlank { quickRoute }
    }

    private fun model(mode: InferenceMode) =
        Firebase.ai(backend = GenerativeBackend.googleAI())
            .generativeModel(modelName = cloudModel, onDeviceConfig = OnDeviceConfig(mode = mode))

    // Sealing and photo reading: ONLY_ON_DEVICE, the raw report never reaches the cloud.
    private val sealer get() = model(InferenceMode.ONLY_ON_DEVICE)
    // Full explanation: PREFER_IN_CLOUD, on-device when offline.
    private val deep get() = model(InferenceMode.PREFER_IN_CLOUD)
    // Quick questions: route from Remote Config.
    private val quick get() = model(
        when (quickRoute) {
            "only_on_device" -> InferenceMode.ONLY_ON_DEVICE
            "prefer_in_cloud" -> InferenceMode.PREFER_IN_CLOUD
            else -> InferenceMode.PREFER_ON_DEVICE
        }
    )
    private val local get() = model(InferenceMode.ONLY_ON_DEVICE)

    suspend fun deviceStatus(): String = runCatching {
        when (FirebaseAIOnDevice.checkStatus()) {
            OnDeviceModelStatus.AVAILABLE -> "available"
            OnDeviceModelStatus.DOWNLOADABLE -> "downloadable"
            OnDeviceModelStatus.DOWNLOADING -> "downloading"
            else -> "unavailable"
        }
    }.getOrDefault("unavailable")

    suspend fun download(onProgress: (String) -> Unit) {
        FirebaseAIOnDevice.download().collect { s ->
            when (s) {
                is DownloadStatus.DownloadStarted -> onProgress("Downloading the on-device model…")
                is DownloadStatus.DownloadInProgress -> onProgress("Downloading: ${s.totalBytesDownloaded / 1_000_000} MB")
                is DownloadStatus.DownloadCompleted -> onProgress("On-device model ready")
                is DownloadStatus.DownloadFailed -> onProgress("Download failed")
            }
        }
    }

    data class Answer(val text: String, val where: String)

    private fun whereOf(source: Any?) = if (source.toString().contains("DEVICE", ignoreCase = true)) "device" else "cloud"

    suspend fun transcribe(bitmap: Bitmap): String {
        val r = sealer.generateContent(content {
            image(bitmap)
            text("Transcribe all the text in this medical report image. Keep line breaks and keep each test on one line with its result, unit and range. Output only the text.")
        })
        return r.text.orEmpty().trim()
    }

    suspend fun findEntities(text: String): List<Entity> {
        val prompt = """List the personal identifiers in this medical document: names of the patient, relatives and doctors; hospital and lab names; street addresses; ID numbers; phone numbers; emails; dates of birth.
Copy only the identifying words exactly as written, never the field label or a whole sentence. Never list tests, results, units, ranges, age or sex.
Return only JSON: {"entities":[{"text":"...","type":"NAME|DOCTOR|FACILITY|ADDRESS|ID|CONTACT|DOB"}]}

DOCUMENT:
$text"""
        val raw = sealer.generateContent(prompt).text.orEmpty()
        val json = runCatching { JSONObject(raw.substring(raw.indexOf('{'), raw.lastIndexOf('}') + 1)) }.getOrNull()
            ?: return emptyList()
        val arr = json.optJSONArray("entities") ?: return emptyList()
        return (0 until arr.length()).mapNotNull { i ->
            arr.optJSONObject(i)?.let { Entity(it.optString("text"), it.optString("type"), "model") }
        }
    }

    suspend fun explain(sealed: String, language: String, deviceOnly: Boolean): Answer {
        val prompt = """You explain medical lab reports to patients in plain, calm language.
The REPORT is anonymised: tokens like [NAME_1] replace personal details; keep them unchanged.
Do not diagnose or recommend medicines. Encourage discussing results with a doctor.
Write in $language. Use short paragraphs: a 2-3 sentence summary, then one line per test with its status (low, normal or high) and meaning, then 3 questions to ask the doctor.

REPORT:
$sealed"""
        val r = (if (deviceOnly) local else deep).generateContent(prompt)
        return Answer(r.text.orEmpty(), whereOf(r.inferenceSource))
    }

    suspend fun ask(sealed: String, question: String, deviceOnly: Boolean): Answer {
        val prompt = "Answer the patient's QUESTION about their anonymised lab REPORT in at most 4 plain sentences. Do not diagnose or prescribe.\n\nREPORT:\n$sealed\n\nQUESTION: $question"
        val r = (if (deviceOnly) local else quick).generateContent(prompt)
        return Answer(r.text.orEmpty(), whereOf(r.inferenceSource))
    }
}
