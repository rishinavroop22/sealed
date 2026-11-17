package com.rishinavroop.sealed

import android.content.Intent
import android.graphics.Bitmap
import android.graphics.ImageDecoder
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

private val Wax = Color(0xFFA8281D)
private val Paper = Color(0xFFF6F1E7)
private val DeviceGreen = Color(0xFF1F6F54)
private val CloudBlue = Color(0xFF2B4F9C)

class MainActivity : ComponentActivity() {
    private var shared by mutableStateOf<Intent?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        shared = intent
        setContent { MaterialTheme(colorScheme = lightColorScheme(primary = Wax, background = Paper)) { SealedScreen(shared) } }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        shared = intent
    }
}

data class LedgerEntry(val where: String, val text: String)

@Composable
fun SealedScreen(shared: Intent?) {
    val ctx = androidx.compose.ui.platform.LocalContext.current
    val scope = rememberCoroutineScope()
    val ai = remember { Ai() }

    var deviceStatus by remember { mutableStateOf("checking") }
    var deviceOnly by remember { mutableStateOf(false) }
    var language by remember { mutableStateOf("English") }
    var report by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf<String?>(null) }
    var entities by remember { mutableStateOf(listOf<Entity>()) }
    var sealed by remember { mutableStateOf<Sealed?>(null) }
    var usedModel by remember { mutableStateOf(false) }
    var explanation by remember { mutableStateOf<Ai.Answer?>(null) }
    var question by remember { mutableStateOf("") }
    val answers = remember { mutableStateListOf<Pair<String, Ai.Answer>>() }
    val ledger = remember { mutableStateListOf<LedgerEntry>() }
    fun log(where: String, text: String) = ledger.add(0, LedgerEntry(where, text))

    fun readImage(uri: Uri) = scope.launch {
        busy = "Reading the photo with the on-device model…"
        runCatching {
            val bmp: Bitmap = ImageDecoder.decodeBitmap(ImageDecoder.createSource(ctx.contentResolver, uri)) { d, _, _ ->
                d.allocator = ImageDecoder.ALLOCATOR_SOFTWARE
            }
            report = ai.transcribe(bmp)
            log("device", "Photo read by the on-device model. Nothing was uploaded.")
        }.onFailure { log("local", "Could not read the photo: ${it.message}") }
        busy = null
    }

    val picker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri -> uri?.let { readImage(it) } }

    LaunchedEffect(Unit) {
        ai.loadConfig()
        deviceStatus = ai.deviceStatus()
        if (deviceStatus == "downloadable") ai.download { busy = it }.also { busy = null; deviceStatus = ai.deviceStatus() }
    }
    LaunchedEffect(shared) {
        val i = shared ?: return@LaunchedEffect
        if (i.action == Intent.ACTION_SEND) {
            i.getStringExtra(Intent.EXTRA_TEXT)?.let { report = it }
            @Suppress("DEPRECATION")
            (i.getParcelableExtra<Uri>(Intent.EXTRA_STREAM))?.let { readImage(it) }
        }
    }

    fun doSeal() = scope.launch {
        busy = "Finding identifiers…"
        var found = Redactor.findPatternEntities(report)
        log("local", "Pattern matching found ${found.size} identifiers. No AI, no network.")
        usedModel = false
        if (deviceStatus == "available") {
            runCatching {
                busy = "On-device model reading the report…"
                val before = found.size
                found = Redactor.merge(found, ai.findEntities(report), report)
                usedModel = true
                log("device", "On-device model found ${maxOf(0, found.size - before)} more identifiers. Nothing was sent.")
            }.onFailure { log("local", "On-device model could not run; pattern matching only. Nothing was sent.") }
        }
        entities = found
        sealed = Redactor.seal(report, found)
        explanation = null; answers.clear()
        busy = null
    }

    fun doExplain() = scope.launch {
        val s = sealed ?: return@launch
        busy = if (deviceOnly) "Writing the explanation on this device…" else "Sending the sealed version to the cloud…"
        runCatching { ai.explain(s.text, if (deviceOnly) "English" else language, deviceOnly) }
            .onSuccess {
                explanation = it
                log(it.where, if (it.where == "cloud") "Sealed report sent to ${ai.cloudModel} (${s.map.size} identifiers hidden)." else "Explanation written on this device. Nothing was sent.")
            }
            .onFailure { log("local", "Explanation failed: ${it.message}") }
        busy = null
    }

    Column(
        Modifier.fillMaxSize().background(Paper).verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(22.dp).background(Wax, RoundedCornerShape(50)))
            Spacer(Modifier.width(8.dp))
            Text("Sealed", fontSize = 22.sp, fontWeight = FontWeight.SemiBold, fontFamily = FontFamily.Serif)
            Spacer(Modifier.weight(1f))
            Chip(if (deviceStatus == "available") "On-device AI ready" else "On-device AI: $deviceStatus", if (deviceStatus == "available") DeviceGreen else Color.Gray)
        }
        Text("Understand your medical report. Keep your name out of it.", fontSize = 24.sp, fontFamily = FontFamily.Serif, lineHeight = 30.sp)

        Card {
            Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("Device-only mode", fontWeight = FontWeight.SemiBold)
                        Text("Nothing at all is sent to the cloud", fontSize = 13.sp, color = Color.Gray)
                    }
                    Switch(checked = deviceOnly, onCheckedChange = { deviceOnly = it })
                }
                Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi", "Bengali").forEach { l ->
                        FilterChip(selected = language == l, enabled = !deviceOnly, onClick = { language = l }, label = { Text(l) })
                    }
                }
            }
        }

        busy?.let {
            Row(Modifier.fillMaxWidth().background(Color(0xFF1D1B16), RoundedCornerShape(12.dp)).padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                CircularProgressIndicator(Modifier.size(16.dp), color = Color.White, strokeWidth = 2.dp)
                Spacer(Modifier.width(10.dp)); Text(it, color = Color.White)
            }
        }

        Card {
            Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("1. Add your report", fontWeight = FontWeight.SemiBold, fontFamily = FontFamily.Serif, fontSize = 18.sp)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }) { Text("Choose a photo") }
                    OutlinedButton(onClick = { report = SAMPLE }) { Text("Sample") }
                }
                OutlinedTextField(report, { report = it }, Modifier.fillMaxWidth().heightIn(min = 160.dp),
                    textStyle = LocalTextStyle.current.copy(fontFamily = FontFamily.Monospace, fontSize = 12.sp),
                    placeholder = { Text("Paste or share a report here") })
                Button(onClick = { doSeal() }, enabled = report.isNotBlank() && busy == null, modifier = Modifier.fillMaxWidth()) { Text("Seal it on this device") }
            }
        }

        sealed?.let { s ->
            Card {
                Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("2. Check what leaves this device", fontWeight = FontWeight.SemiBold, fontFamily = FontFamily.Serif, fontSize = 18.sp)
                    Text(if (usedModel) "Sealed by on-device AI. The original never left this phone." else "Sealed by pattern matching only. Check carefully before sending.",
                        fontSize = 13.sp, color = if (usedModel) DeviceGreen else Color(0xFF8A5A00))
                    Text("${s.map.size} items hidden", fontSize = 13.sp, color = Color.Gray)
                    Box(Modifier.fillMaxWidth().background(Color.White, RoundedCornerShape(10.dp)).horizontalScroll(rememberScrollState()).padding(10.dp)) {
                        Text(buildAnnotatedString {
                            var last = 0
                            Regex("""\[[A-Z]+_\d+]""").findAll(s.text).forEach { m ->
                                append(s.text.substring(last, m.range.first))
                                withStyle(SpanStyle(background = Color(0xFF1D1B16), color = Paper, fontWeight = FontWeight.Bold)) { append(m.value.trim('[', ']')) }
                                last = m.range.last + 1
                            }
                            append(s.text.substring(last))
                        }, fontFamily = FontFamily.Monospace, fontSize = 11.sp, softWrap = false)
                    }
                    Button(onClick = { doExplain() }, enabled = busy == null, modifier = Modifier.fillMaxWidth()) {
                        Text(if (deviceOnly) "Explain on this device" else "Send sealed version for explanation")
                    }
                }
            }
        }

        explanation?.let { ex ->
            val s = sealed!!
            Card {
                Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("3. Your explanation", fontWeight = FontWeight.SemiBold, fontFamily = FontFamily.Serif, fontSize = 18.sp, modifier = Modifier.weight(1f))
                        Chip(if (ex.where == "device") "On this device" else "Cloud", if (ex.where == "device") DeviceGreen else CloudBlue)
                    }
                    Text(Redactor.unseal(ex.text, s.map))
                    Text("Sealed explains reports in plain language. It does not diagnose or replace your doctor.", fontSize = 12.sp, color = Color.Gray)
                    OutlinedTextField(question, { question = it }, Modifier.fillMaxWidth(), placeholder = { Text("Ask a quick question") })
                    OutlinedButton(enabled = question.isNotBlank() && busy == null, onClick = {
                        val q = question; question = ""
                        scope.launch {
                            busy = "Answering…"
                            val qs = Redactor.seal(q, Redactor.merge(entities.filter { q.contains(it.text, true) }, Redactor.findPatternEntities(q), q)).text
                            runCatching { ai.ask(s.text, qs, deviceOnly) }.onSuccess {
                                answers.add(0, q to it.copy(text = Redactor.unseal(it.text, s.map)))
                                log(it.where, if (it.where == "device") "Quick question answered on this device." else "Quick question sent to the cloud, sealed.")
                            }
                            busy = null
                        }
                    }) { Text("Ask") }
                    answers.forEach { (q, a) ->
                        Text(q, fontWeight = FontWeight.SemiBold)
                        Chip(if (a.where == "device") "On this device" else "Cloud", if (a.where == "device") DeviceGreen else CloudBlue)
                        Text(a.text)
                    }
                }
            }
        }

        Card {
            Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("Privacy ledger", fontWeight = FontWeight.SemiBold, fontFamily = FontFamily.Serif, fontSize = 18.sp)
                if (ledger.isEmpty()) Text("Nothing has run yet.", color = Color.Gray)
                ledger.forEach { e ->
                    Row(verticalAlignment = Alignment.Top) {
                        Chip(when (e.where) { "device" -> "Device"; "cloud" -> "Cloud"; else -> "Local" },
                            when (e.where) { "device" -> DeviceGreen; "cloud" -> CloudBlue; else -> Color.Gray })
                        Spacer(Modifier.width(8.dp)); Text(e.text, fontSize = 13.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun Chip(text: String, color: Color) {
    Text(text, color = color, fontSize = 12.sp, fontWeight = FontWeight.SemiBold,
        modifier = Modifier.background(color.copy(alpha = 0.12f), RoundedCornerShape(50)).padding(horizontal = 10.dp, vertical = 4.dp))
}

const val SAMPLE = """CITY DIAGNOSTICS & RESEARCH CENTRE
Road No. 12, Banjara Hills, Hyderabad 500034   Ph: 040-2335 0000

Patient Name: Mrs. Lakshmi Devi Rao        Age: 54 Years    Sex: Female
UHID: HYD/2291/88        Lab No: CD-774120
Ref. By: Dr. Arvind Menon        Phone: +91 98480 12345
DOB: 14/03/1972

TEST                     RESULT      UNIT        REFERENCE RANGE
Haemoglobin              9.8         g/dL        12.0 - 15.0
Fasting Blood Glucose    118         mg/dL       70 - 100
HbA1c                    6.3         %           < 5.7
TSH                      6.9         uIU/mL      0.4 - 4.0
Vitamin D (25-OH)        14          ng/mL       30 - 100

Remarks: Lakshmi reports tiredness for two months. Kindly correlate clinically.
Reported by Dr. S. Fatima Khan, MD (Pathology)"""
