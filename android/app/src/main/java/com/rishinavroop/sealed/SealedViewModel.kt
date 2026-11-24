package com.rishinavroop.sealed

import android.app.Application
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.TrafficStats
import android.net.Uri
import android.os.Process
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class LedgerEntry(val where: String, val text: String, val sent: String?, val time: String)
data class Reply(val question: String, val text: String, val where: String)
data class Shown(val data: Explanation, val where: String, val note: String, val critical: List<Critical>)

// Holds everything on screen, so turning the phone does not lose a report.
class SealedViewModel(app: Application) : AndroidViewModel(app) {
    private val ai = Ai()

    var device by mutableStateOf("checking"); private set
    var deviceModel by mutableStateOf<String?>(null); private set
    var deviceOnly by mutableStateOf(false)
    var language by mutableStateOf("English")
    var report by mutableStateOf("")
    var fileNote by mutableStateOf<String?>(null); private set
    var busy by mutableStateOf<String?>(null); private set
    var error by mutableStateOf<String?>(null); private set

    var entities by mutableStateOf(listOf<Entity>()); private set
    var sealed by mutableStateOf<Sealed?>(null); private set
    var usedModel by mutableStateOf(false); private set
    var proof by mutableStateOf<String?>(null); private set
    var earlyAlerts by mutableStateOf(listOf<Critical>()); private set
    var shown by mutableStateOf<Shown?>(null); private set
    val replies = mutableStateListOf<Reply>()
    val ledger = mutableStateListOf<LedgerEntry>()

    private var raw = ""
    val cloudModel get() = ai.cloudModel

    private fun log(where: String, text: String, sent: String? = null) {
        ledger.add(0, LedgerEntry(where, text, sent, SimpleDateFormat("HH:mm:ss", Locale.US).format(Date())))
    }

    init {
        viewModelScope.launch {
            ai.loadConfig()
            refreshDevice()
        }
    }

    private suspend fun refreshDevice() {
        device = ai.deviceStatus()
        if (device == "available") {
            deviceModel = ai.deviceModelName()
            ai.warmUp()
        }
    }

    // Phones can report the model only after a restart or an update of AICore, so check again on return.
    fun recheckDevice() {
        if (busy == null && device != "available" && device != "checking") viewModelScope.launch { device = ai.deviceStatus() }
    }

    fun downloadModel() = task("Downloading the on-device model…") {
        ai.download { busy = it }
        refreshDevice()
    }

    private fun task(label: String, block: suspend () -> Unit) {
        if (busy != null) return
        busy = label
        error = null
        viewModelScope.launch {
            try {
                block()
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                error = e.message ?: e.javaClass.simpleName
            } finally {
                busy = null
            }
        }
    }

    fun online(): Boolean {
        val cm = getApplication<Application>().getSystemService(ConnectivityManager::class.java)
        val caps = cm.getNetworkCapabilities(cm.activeNetwork ?: return false) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
    }

    // ---------- step 1: add a report ----------
    fun setText(text: String) {
        report = text
        fileNote = null
        startOver()
    }

    private fun startOver() {
        sealed = null
        shown = null
        entities = emptyList()
        earlyAlerts = emptyList()
        proof = null
        replies.clear()
    }

    fun open(uri: Uri) = task("Reading the file on this phone…") {
        val ctx = getApplication<Application>()
        val type = ctx.contentResolver.getType(uri).orEmpty()
        val read = when {
            type == "application/pdf" || uri.path.orEmpty().endsWith(".pdf", true) ->
                Ingest.readPdf(ctx, uri) { i, n -> busy = "Reading page $i of $n on this phone…" }
            type.startsWith("text/") -> {
                val t = withContext(Dispatchers.IO) { ctx.contentResolver.openInputStream(uri)?.use { it.readBytes().decodeToString() }.orEmpty() }
                Ingest.Read(t, false, "Text file loaded")
            }
            else -> Ingest.readImage(ctx, uri, ai.takeIf { device == "available" })
        }
        if (read.text.isBlank()) error("No text was found in this file.")
        setText(read.text)
        fileNote = "${read.note}. Nothing was uploaded. Check the text, then seal it."
        log(if (read.byModel) "device" else "local", "${read.note}. Nothing was uploaded.")
    }

    // ---------- step 2: seal on this phone ----------
    fun seal() {
        val text = report.trim()
        if (text.isEmpty()) return
        task("Finding identifiers with pattern matching…") {
            startOver()
            raw = text
            val calls = ai.cloudCalls
            val before = TrafficStats.getUidTxBytes(Process.myUid())
            var found = withContext(Dispatchers.Default) { Redactor.findPatternEntities(text) }
            log("local", "Pattern matching found ${found.size} identifier(s). No AI, no network.")
            usedModel = false
            if (device == "available") {
                try {
                    val extra = ai.findEntities(text) { i, n ->
                        busy = if (n > 1) "On-device model reading part $i of $n…" else "On-device model reading the report…"
                    }
                    val merged = withContext(Dispatchers.Default) { Redactor.merge(found, extra, text) }
                    log("device", "On-device model read the full report and found ${maxOf(0, merged.size - found.size)} more. Nothing was sent anywhere.")
                    found = merged
                    usedModel = true
                } catch (e: CancellationException) {
                    throw e
                } catch (e: Exception) {
                    log("local", "The on-device model could not run, so only pattern matching was used. The report was NOT sent to the cloud.")
                }
            }
            val after = TrafficStats.getUidTxBytes(Process.myUid())
            val made = "${ai.cloudCalls - calls} cloud AI requests while sealing."
            proof = if (before == TrafficStats.UNSUPPORTED.toLong() || after < before) made
            else "$made Android counted ${after - before} bytes sent by Sealed."
            log("local", "Proof: $proof")
            entities = found
            sealed = Redactor.seal(text, found)
            earlyAlerts = Health.criticalFindings(Health.quickParse(text))
        }
    }

    fun hide(words: String) {
        val w = words.trim()
        if (w.length < 2 || !raw.contains(w, ignoreCase = true)) {
            error = "\"$w\" is not in the report. Copy it exactly as it appears."
            return
        }
        error = null
        entities = Redactor.merge(entities, listOf(Entity(w, "NAME", "you")), raw)
        sealed = Redactor.seal(raw, entities)
        shown = null
    }

    fun unhide(original: String) {
        entities = entities.filterNot { it.text.equals(original, ignoreCase = true) }
        sealed = Redactor.seal(raw, entities)
        shown = null
    }

    // ---------- step 3: explain ----------
    fun explain() {
        val s = sealed ?: return
        val local = deviceOnly || !online()
        task(if (local) "Writing the explanation on this phone…" else "Sending the sealed version to the cloud model…") {
            shown = null
            replies.clear()
            if (local) {
                explainHere(s, if (deviceOnly) "Device-only mode: nothing was sent." else "You are offline, so this was written on the phone.")
                return@task
            }
            val prompt = Prompts.explain(s.text, language)
            try {
                val a = ai.explain(prompt)
                val data = ModelJson.explanation(a.text)
                if (a.where == "cloud") log("cloud", "Sealed report sent to the cloud model ${ai.cloudModel} (${s.text.length} characters, ${s.map.size} identifiers hidden).", prompt)
                else log("device", "Firebase AI Logic fell back to the on-device model (PREFER_IN_CLOUD). Nothing was sent.")
                if (data == null) {
                    explainHere(s, "The model's answer was incomplete, so Sealed wrote this on the phone.")
                } else {
                    show(data, a.where, "")
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                log("cloud", "Tried to send the sealed report to ${ai.cloudModel}, but the request failed: ${short(e)}", prompt)
                explainHere(s, "The cloud model could not be reached, so this was written on the phone. (${short(e)})")
            }
        }
    }

    private fun short(e: Exception) = (e.message ?: e.javaClass.simpleName).lineSequence().first().take(160)

    private fun show(data: Explanation, where: String, note: String) {
        val (matched, fixed) = Health.reconcile(data.findings, Health.fromCode(sealed?.text.orEmpty()))
        if (fixed > 0) log("local", "Sealed replaced $fixed value(s) or range(s) the model copied wrongly from the report.")
        val (checked, corrected) = Health.check(matched)
        if (corrected > 0) log("local", "Range check corrected $corrected result label${if (corrected == 1) "" else "s"} the model got wrong.")
        shown = Shown(data.copy(findings = checked), where, note, Health.criticalFindings(checked))
    }

    // On the phone, code reads every result and decides every label. The small model only writes the summary.
    private suspend fun explainHere(s: Sealed, note: String) {
        val findings = Health.fromCode(s.text)
        val out = findings.filter { it.status == "low" || it.status == "high" }
        val facts = findings.joinToString("\n") { f ->
            "${f.test}: ${f.value}" + when (f.status) {
                "low" -> ", below its range ${f.reference}"
                "high" -> ", above its range ${f.reference}"
                "normal" -> ", within its range ${f.reference}"
                else -> ""
            }
        }
        var where = "local"
        var summary = if (findings.isEmpty()) "Sealed could not read any results from this report on the phone."
        else "Sealed read these results from the report and compared each one with its printed range."
        if (device == "available" && findings.isNotEmpty()) {
            try {
                busy = "On-device model writing a summary…"
                val text = ai.summariseOnDevice(facts.take(6000))
                if (text.isNotBlank()) {
                    summary = text
                    where = "device"
                    log("device", "The on-device model wrote the summary on this phone.")
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                log("local", "The on-device model could not run: ${short(e)}")
            }
        }
        if (where == "local") log("local", "Results read and checked by code on this phone, with no AI.")
        val questions = out.take(4).map { "What does my ${it.status} ${it.test} (${it.value}) mean for me?" } +
            listOf("Do I need to repeat any of these tests, and when?")
        val english = if (language != "English") " On-device explanations are in English." else ""
        show(Explanation(summary, "", findings, questions), where, note + english)
    }

    // ---------- quick questions ----------
    fun ask(question: String) {
        val s = sealed ?: return
        val q = question.trim()
        if (q.isEmpty()) return
        val local = deviceOnly || !online()
        task("Answering…") {
            if (local && device != "available") error("Questions need the on-device AI model or an internet connection.")
            val sealedQ = Redactor.sealQuestion(q, s.map) // the question can hold a name or number too
            val prompt = Prompts.ask(s.text, sealedQ)
            val a = try {
                ai.ask(prompt, local)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                if (local) log("local", "The on-device model could not answer: ${short(e)}")
                else log("cloud", "Tried to send a sealed question and report, but the request failed: ${short(e)}", prompt)
                throw e
            }
            replies.add(0, Reply(q, Redactor.unseal(a.text, s.map), a.where))
            if (a.where == "device") log("device", "Quick question answered by the on-device model. Nothing was sent.")
            else log("cloud", "Quick question and sealed report sent to the cloud model.", prompt)
        }
    }
}
