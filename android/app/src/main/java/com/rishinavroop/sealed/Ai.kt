package com.rishinavroop.sealed

import android.graphics.Bitmap
import com.google.firebase.Firebase
import com.google.firebase.ai.DownloadStatus
import com.google.firebase.ai.GenerativeModel
import com.google.firebase.ai.InferenceMode
import com.google.firebase.ai.InferenceSource
import com.google.firebase.ai.OnDeviceConfig
import com.google.firebase.ai.OnDeviceModelStatus
import com.google.firebase.ai.ai
import com.google.firebase.ai.type.GenerativeBackend
import com.google.firebase.ai.type.PublicPreviewAPI
import com.google.firebase.ai.type.content
import com.google.firebase.ai.type.generationConfig
import com.google.firebase.remoteconfig.remoteConfig
import kotlinx.coroutines.delay
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withTimeoutOrNull

// Every model call goes through Firebase AI Logic, mirroring the web app's routes.
@OptIn(PublicPreviewAPI::class)
class Ai {
    var cloudModel = "gemini-3.5-flash-lite"; private set
    private var quickRoute = "prefer_on_device"

    // The cloud model and the quick-question route can change without a release.
    suspend fun loadConfig() {
        val rc = Firebase.remoteConfig
        runCatching { rc.setDefaultsAsync(mapOf("cloud_model" to cloudModel, "quick_route" to quickRoute)).await() }
        withTimeoutOrNull(4000) { runCatching { rc.fetchAndActivate().await() } }
        cloudModel = rc.getString("cloud_model").ifBlank { cloudModel }
        quickRoute = rc.getString("quick_route").ifBlank { quickRoute }
    }

    private fun model(mode: InferenceMode, json: Boolean = false): GenerativeModel =
        Firebase.ai(backend = GenerativeBackend.googleAI()).generativeModel(
            modelName = cloudModel,
            generationConfig = if (json) generationConfig { responseMimeType = "application/json" } else null,
            onDeviceConfig = OnDeviceConfig(mode = mode),
        )

    // Sealing and photo reading: ONLY_ON_DEVICE. The raw report can never reach the cloud,
    // even if the on-device model is missing. There is deliberately no fallback.
    private val sealer by lazy { model(InferenceMode.ONLY_ON_DEVICE) }

    // Full explanation: PREFER_IN_CLOUD, on-device when there is no network.
    private val deep get() = model(InferenceMode.PREFER_IN_CLOUD, json = true)

    // Quick questions: route from Remote Config.
    private val quick
        get() = model(
            when (quickRoute) {
                "only_on_device" -> InferenceMode.ONLY_ON_DEVICE
                "prefer_in_cloud" -> InferenceMode.PREFER_IN_CLOUD
                else -> InferenceMode.PREFER_ON_DEVICE
            },
        )

    // ---------- on-device model ----------
    suspend fun deviceStatus(): String = runCatching {
        when (sealer.onDeviceExtension?.checkStatus()) {
            OnDeviceModelStatus.AVAILABLE -> "available"
            OnDeviceModelStatus.DOWNLOADABLE -> "downloadable"
            OnDeviceModelStatus.DOWNLOADING -> "downloading"
            else -> "unavailable"
        }
    }.getOrDefault("unavailable")

    suspend fun download(onProgress: (String) -> Unit) {
        var total = 0L
        sealer.onDeviceExtension?.download()?.collect { s ->
            when (s) {
                is DownloadStatus.DownloadStarted -> {
                    total = s.bytesToDownload
                    onProgress("Downloading the on-device model (first time only)…")
                }
                is DownloadStatus.DownloadInProgress -> {
                    val pct = if (total > 0) " ${s.totalBytesDownloaded * 100 / total}%" else " ${s.totalBytesDownloaded / 1_000_000} MB"
                    onProgress("Downloading the on-device model:$pct")
                }
                is DownloadStatus.DownloadCompleted -> onProgress("On-device model ready")
                is DownloadStatus.DownloadFailed -> onProgress("The on-device model could not be downloaded")
            }
        }
    }

    suspend fun warmUp() { runCatching { sealer.onDeviceExtension?.warmUp() } }
    suspend fun deviceModelName(): String? = runCatching { sealer.onDeviceExtension?.getModelName() }.getOrNull()

    // The on-device model is shared by every app on the phone, so a call can briefly find it busy.
    private suspend fun <T> retryBusy(block: suspend () -> T): T {
        repeat(2) { n ->
            try {
                return block()
            } catch (e: Exception) {
                val text = generateSequence<Throwable>(e) { it.cause }.take(4).joinToString { it.message.orEmpty() }
                if (!text.contains("busy", ignoreCase = true)) throw e
                delay(1500L * (n + 1))
            }
        }
        return block()
    }

    data class Answer(val text: String, val where: String)

    // Calls that were allowed to use the cloud. Sealing must never change this number.
    var cloudCalls = 0; private set

    private fun whereOf(source: InferenceSource) = if (source == InferenceSource.ON_DEVICE) "device" else "cloud"

    // ---------- on this phone only ----------
    suspend fun transcribe(bitmap: Bitmap): String = retryBusy {
        sealer.generateContent(
            content {
                image(bitmap)
                text("Transcribe all the text in this medical report image. Keep line breaks and keep each test on one line with its result, unit and range. Output only the text.")
            },
        ).text.orEmpty().trim()
    }

    // Small pieces keep each answer inside the on-device model's short output limit.
    suspend fun findEntities(text: String, onPart: (Int, Int) -> Unit): List<Entity> {
        val parts = Redactor.chunk(text, 1200)
        return parts.flatMapIndexed { i, part ->
            onPart(i + 1, parts.size)
            val raw = retryBusy { sealer.generateContent(Prompts.seal(part)).text.orEmpty() }
            ModelJson.entities(raw)
        }
    }

    // FACTS are lines computed by code, so the small model only rephrases them.
    suspend fun summariseOnDevice(facts: String): String =
        retryBusy { sealer.generateContent(Prompts.summary(facts)).text.orEmpty().trim() }

    // ---------- sealed text only ----------
    suspend fun explain(prompt: String): Answer {
        cloudCalls++
        val r = deep.generateContent(prompt)
        return Answer(r.text.orEmpty(), whereOf(r.inferenceSource))
    }

    suspend fun ask(prompt: String, deviceOnly: Boolean): Answer {
        if (!deviceOnly) cloudCalls++
        val r = retryBusy { (if (deviceOnly) sealer else quick).generateContent(prompt) }
        return Answer(r.text.orEmpty().trim(), whereOf(r.inferenceSource))
    }
}

object Prompts {
    // No model, on the phone or in the cloud, may name or suggest a condition.
    const val SMALL_MODEL_RULE = "Only say what each test measures and whether the result is below, within or above its reference range. Do not name or suggest any disease, condition or cause, and do not guess."

    fun seal(text: String) = """List the personal identifiers in this medical document: names of the patient, relatives and doctors; hospital and lab names; street addresses; ID numbers; phone numbers; emails; dates of birth.
Copy only the identifying words exactly as written, never the field label or a whole sentence. Never list tests, results, units, ranges, age or sex.
Return only JSON: {"entities":[{"text":"...","type":"NAME|DOCTOR|FACILITY|ADDRESS|ID|CONTACT|DOB"}]}

DOCUMENT:
$text"""

    fun explain(sealed: String, language: String) = """You explain medical lab reports and prescriptions to patients in plain, calm language.
The REPORT below has been anonymised: tokens like [NAME_1] or [DOCTOR_1] replace personal details. Keep those tokens unchanged if you refer to them.
$SMALL_MODEL_RULE This also applies to the summary and the questions.
Do not diagnose. Do not recommend specific medicines or doses. Encourage discussing results with a doctor.
Write every text value in $language. Keep test names, numbers and units as in the report.
Return only JSON with this shape:
{"summary":"2-3 sentences on what this report covers; never count results or say which are low or high, the app does that",
 "urgent":"one sentence if any value needs prompt medical attention, otherwise empty string",
 "findings" (include EVERY test in the report, normal ones too):[{"test":"name","value":"value with unit","reference":"reference range","status":"low|normal|high|unclear","meaning":"1-2 plain sentences"}],
 "questions":["3 to 5 questions the patient could ask their doctor"]}

REPORT:
$sealed"""

    fun summary(facts: String) = """Rewrite these FACTS from a lab report as 2 to 4 plain, calm sentences for a patient. $SMALL_MODEL_RULE Do not add facts or count results. End by suggesting they discuss the report with their doctor.

FACTS:
$facts"""

    fun ask(sealed: String, question: String) = """Answer the patient's QUESTION about their anonymised lab REPORT in at most 3 plain sentences. $SMALL_MODEL_RULE Do not diagnose or prescribe. Suggest asking their doctor what it means for them.

REPORT:
$sealed

QUESTION: $question"""
}
