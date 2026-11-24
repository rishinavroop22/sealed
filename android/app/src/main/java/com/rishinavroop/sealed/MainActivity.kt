package com.rishinavroop.sealed

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInParent
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// Same colours as web/css/app.css.
internal val Wax = Color(0xFFA8281D)
internal val Paper = Color(0xFFF6F1E7)
internal val CardColor = Color(0xFFFFFDF8)
internal val Ink = Color(0xFF1D1B16)
internal val Muted = Color(0xFF6B6558)
internal val Line = Color(0xFFE2D9C6)
internal val ChipBg = Color(0xFFEFE9DB)
internal val DeviceGreen = Color(0xFF1F6F54)
internal val DeviceBg = Color(0xFFE3F1EA)
internal val CloudBlue = Color(0xFF2B4F9C)
internal val CloudBg = Color(0xFFE4EAF7)
internal val Warn = Color(0xFF8A5A00)
internal val WarnBg = Color(0xFFFBF0D4)
internal val AlertBg = Color(0xFFFBE4E1)

private val LANGUAGES = listOf("English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi", "Bengali", "Gujarati")

class MainActivity : ComponentActivity() {
    private val vm: SealedViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        if (savedInstanceState == null) receive(intent)
        setContent {
            MaterialTheme(
                colorScheme = lightColorScheme(
                    primary = Wax, background = Paper, surface = CardColor, onSurface = Ink, onBackground = Ink,
                    surfaceContainerHighest = CardColor, outline = Muted, secondaryContainer = DeviceBg, onSecondaryContainer = Ink,
                ),
            ) { SealedScreen(vm) }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        receive(intent)
    }

    override fun onResume() {
        super.onResume()
        vm.recheckDevice()
    }

    // A report shared from another app (photo, PDF or text), or text selected anywhere.
    private fun receive(intent: Intent?) {
        when (intent?.action) {
            Intent.ACTION_VIEW -> intent.data?.let { vm.readInvite(it.toString()) } // a code opened from the phone's camera
            Intent.ACTION_PROCESS_TEXT -> intent.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT)?.let { vm.setText(it.toString()) }
            Intent.ACTION_SEND -> {
                val uri = if (Build.VERSION.SDK_INT >= 33) intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
                else @Suppress("DEPRECATION") intent.getParcelableExtra(Intent.EXTRA_STREAM)
                if (uri != null) vm.open(uri) else intent.getStringExtra(Intent.EXTRA_TEXT)?.let { vm.setText(it) }
            }
        }
    }
}

@Composable
fun SealedScreen(vm: SealedViewModel) {
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri -> uri?.let { vm.open(it) } }
    val scroll = rememberScrollState()
    var explainAt by remember { mutableIntStateOf(0) }
    LaunchedEffect(vm.shown) { if (vm.opened && vm.shown != null) { withFrameNanos {}; scroll.animateScrollTo(explainAt) } }

    Box(Modifier.fillMaxSize().background(Paper).safeDrawingPadding()) {
        Column(
            Modifier.fillMaxSize().verticalScroll(scroll).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Header(vm)
            AddStep(vm) { picker.launch(arrayOf("image/*", "application/pdf", "text/plain")) }
            vm.sealed?.let { if (!vm.opened) ReviewStep(vm, it) }
            vm.shown?.let { ex -> Box(Modifier.onGloballyPositioned { explainAt = it.positionInParent().y.toInt() }) { ExplainStep(vm, ex) } }
            TimelinePanel(vm)
            HistoryPanel(vm)
            Ledger(vm)
            Spacer(Modifier.height(72.dp))
        }
        Column(Modifier.align(Alignment.BottomCenter).padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            vm.error?.let { Note(it, Wax, AlertBg) }
            vm.busy?.let { Busy(it) }
        }
    }
}

@Composable
private fun Header(vm: SealedViewModel) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(24.dp).background(Wax, RoundedCornerShape(50)))
        Spacer(Modifier.width(8.dp))
        Text("Sealed", fontSize = 22.sp, fontWeight = FontWeight.SemiBold, fontFamily = FontFamily.Serif)
        Spacer(Modifier.weight(1f))
        when (vm.device) {
            "available" -> Chip("On-device AI ready", DeviceGreen, DeviceBg)
            "checking" -> Chip("Checking this phone…", Muted, ChipBg)
            "downloading" -> Chip("On-device AI downloading", Warn, WarnBg)
            "downloadable" -> Chip("On-device AI not downloaded", Warn, WarnBg)
            else -> Chip("No on-device AI here", Warn, WarnBg)
        }
    }
    Text("A private health record for your family's lab reports.", fontSize = 26.sp, fontFamily = FontFamily.Serif, lineHeight = 32.sp, modifier = Modifier.semantics { heading() })
    Text("Names, numbers and addresses are hidden on this phone before anything is explained.", color = Muted)
    if (vm.device == "downloadable") OutlinedButton(onClick = { vm.downloadModel() }, enabled = vm.busy == null) { Text("Download the on-device AI model") }
    if (vm.device == "unavailable") Text("This phone has no Gemini Nano model. Sealed still hides identifiers with pattern rules, and never sends the original.", fontSize = 13.sp, color = Muted)
    vm.deviceModel?.let { Text("On-device model: $it", fontSize = 13.sp, color = Muted) }

    Panel {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("Device-only mode", fontWeight = FontWeight.SemiBold)
                Text("Nothing at all is sent to the cloud", fontSize = 13.sp, color = Muted)
            }
            Switch(checked = vm.deviceOnly, onCheckedChange = { vm.deviceOnly = it }, modifier = Modifier.semantics { contentDescription = "Device-only mode" })
        }
        PersonPicker(vm)
        Text("Explain in", fontSize = 13.sp, color = Muted)
        Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            LANGUAGES.forEach { l ->
                FilterChip(selected = vm.language == l, enabled = !vm.deviceOnly, onClick = { vm.language = l }, label = { Text(l) })
            }
        }
    }
}

@Composable
private fun AddStep(vm: SealedViewModel, choose: () -> Unit) = Panel {
    Title("1. Add a report")
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        OutlinedButton(onClick = choose, enabled = vm.busy == null) { Text("Photo or PDF") }
        OutlinedButton(onClick = { vm.useSample() }, enabled = vm.busy == null) { Text("Use a sample") }
    }
    vm.fileNote?.let { Note(it, DeviceGreen, DeviceBg) }
    OutlinedTextField(
        vm.report, { vm.setText(it) },
        Modifier.fillMaxWidth().heightIn(min = 140.dp, max = 320.dp),
        textStyle = LocalTextStyle.current.copy(fontFamily = FontFamily.Monospace, fontSize = 12.sp),
        label = { Text("Report text") },
        placeholder = { Text("Paste a report, or share one to Sealed from WhatsApp") },
    )
    Button(onClick = { vm.seal() }, enabled = vm.report.isNotBlank() && vm.busy == null, modifier = Modifier.fillMaxWidth()) { Text("Seal it on this phone") }
}

@Composable
private fun ReviewStep(vm: SealedViewModel, s: Sealed) = Panel {
    val ctx = LocalContext.current
    var extra by remember { mutableStateOf("") }
    var showHidden by remember { mutableStateOf(false) }

    Title("2. Check what leaves this phone")
    Alerts(vm.earlyAlerts)
    if (vm.usedModel) Note("Sealed by on-device AI and pattern rules. The original never left this phone.", DeviceGreen, DeviceBg)
    else Note("Sealed by pattern rules only. Read the sealed version carefully and hide anything personal that remains.", Warn, WarnBg)
    vm.proof?.let { Text("Proof: $it", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = DeviceGreen) }

    Box(
        Modifier.fillMaxWidth().heightIn(max = 360.dp).background(Color.White, RoundedCornerShape(10.dp))
            .verticalScroll(rememberScrollState()).horizontalScroll(rememberScrollState()).padding(10.dp),
    ) {
        SelectionContainer {
            Text(
                buildAnnotatedString {
                    var last = 0
                    Regex("""\[[A-Z]+_\d+\]""").findAll(s.text).forEach { m ->
                        append(s.text.substring(last, m.range.first))
                        withStyle(SpanStyle(background = Ink, color = Paper, fontWeight = FontWeight.Bold)) { append(m.value.trim('[', ']')) }
                        last = m.range.last + 1
                    }
                    append(s.text.substring(last))
                },
                fontFamily = FontFamily.Monospace, fontSize = 11.sp, softWrap = false,
            )
        }
    }

    TextButton(onClick = { showHidden = !showHidden }) {
        Text("${if (showHidden) "Hide" else "Show"} the list of ${s.map.size} hidden item${if (s.map.size == 1) "" else "s"}")
    }
    if (showHidden) s.map.forEach { (ph, original) ->
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(original, fontSize = 14.sp)
                val by = when (vm.entities.firstOrNull { it.text.equals(original, true) }?.source) { "model" -> "on-device AI"; "you" -> "you"; else -> "pattern rule" }
                Text("${ph.trim('[', ']')} · found by $by", fontSize = 12.sp, color = Muted)
            }
            TextButton(onClick = { vm.unhide(original) }, modifier = Modifier.semantics { contentDescription = "Stop hiding $original" }) { Text("Show") }
        }
    }
    OutlinedTextField(extra, { extra = it }, Modifier.fillMaxWidth(), singleLine = true, label = { Text("Hide something else") }, placeholder = { Text("Type it as it appears") })
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        OutlinedButton(onClick = { vm.hide(extra); extra = "" }, enabled = extra.isNotBlank()) { Text("Hide it") }
        OutlinedButton(onClick = {
            val send = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, s.text)
            ctx.startActivity(Intent.createChooser(send, "Share the sealed version"))
        }) { Text("Share sealed text") }
    }
    Button(onClick = { vm.explain() }, enabled = vm.busy == null, modifier = Modifier.fillMaxWidth()) {
        Text(if (vm.deviceOnly) "Explain on this phone" else "Send sealed version for explanation")
    }
}

@Composable
private fun ExplainStep(vm: SealedViewModel, ex: Shown) = Panel {
    var question by remember { mutableStateOf("") }
    fun view(t: String) = vm.view(t) // names restored on this phone, for your eyes only

    Title("3. Your explanation")
    when (ex.where) {
        "device" -> Chip("Written on this phone", DeviceGreen, DeviceBg)
        "cloud" -> Chip("Written in the cloud from the sealed version", CloudBlue, CloudBg)
        else -> Chip("Read by code on this phone", Muted, ChipBg)
    }
    if (ex.note.isNotBlank()) Text(ex.note, fontSize = 13.sp, color = Muted)
    OutlinedButton(onClick = { vm.readAloud() }) { Text(if (vm.speaking) "Stop reading" else "Read aloud") }
    Alerts(ex.critical)
    Health.countLine(ex.data.findings).let { if (it.isNotEmpty()) Text(it, fontWeight = FontWeight.SemiBold) }
    Text(view(ex.data.summary))
    if (ex.data.urgent.isNotBlank()) Note(view(ex.data.urgent), Wax, AlertBg)
    ex.data.findings.forEach { f -> Result(f, ::view) }
    if (ex.data.questions.isNotEmpty()) {
        Text("Questions for your doctor", fontWeight = FontWeight.SemiBold, fontFamily = FontFamily.Serif, fontSize = 17.sp, modifier = Modifier.semantics { heading() })
        ex.data.questions.forEachIndexed { i, q -> Text("${i + 1}. ${view(q)}") }
    }
    Text("High and low labels are decided by code from the range printed on the report. Sealed does not diagnose or replace your doctor.", fontSize = 12.sp, color = Muted)

    if (!vm.opened) SaveRow(vm)

    HorizontalDivider(color = Line)
    OutlinedTextField(question, { question = it }, Modifier.fillMaxWidth(), label = { Text("Ask a quick question") })
    OutlinedButton(enabled = question.isNotBlank() && vm.busy == null, onClick = { vm.ask(question); question = "" }) { Text("Ask") }
    vm.replies.forEach { r ->
        Text(r.question, fontWeight = FontWeight.SemiBold)
        if (r.where == "device") Chip("On this phone", DeviceGreen, DeviceBg) else Chip("Cloud, sealed text only", CloudBlue, CloudBg)
        Text(r.text)
    }
}

@Composable
private fun Result(f: Finding, view: (String) -> String) {
    val (label, fg, bg) = when (f.status) {
        "low" -> Triple("Low", Wax, AlertBg)
        "high" -> Triple("High", Wax, AlertBg)
        "normal" -> Triple("In range", DeviceGreen, DeviceBg)
        else -> Triple("No clear range", Muted, ChipBg)
    }
    Column(Modifier.fillMaxWidth().background(Color.White, RoundedCornerShape(10.dp)).padding(12.dp), verticalArrangement = Arrangement.spacedBy(3.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(view(f.test), fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
            Chip(label, fg, bg)
        }
        Text(view(f.value) + if (f.reference.isNotBlank()) " · range ${view(f.reference)}" else "", fontFamily = FontFamily.Monospace, fontSize = 13.sp)
        if (f.meaning.isNotBlank()) Text(view(f.meaning), fontSize = 14.sp)
        if (f.corrected) Text("Corrected by Sealed from the report", fontSize = 12.sp, color = Warn)
    }
}

@Composable
private fun Ledger(vm: SealedViewModel) = Panel {
    Title("Privacy ledger")
    Text("Everything Sealed did, and the exact text of every request it sent.", fontSize = 13.sp, color = Muted)
    if (vm.ledger.isEmpty()) Text("Nothing has run yet.", color = Muted)
    vm.ledger.forEach { e ->
        var open by remember(e) { mutableStateOf(false) }
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                when (e.where) {
                    "device" -> Chip("On-device AI", DeviceGreen, DeviceBg)
                    "cloud" -> Chip("Cloud", CloudBlue, CloudBg)
                    else -> Chip("Code", Muted, ChipBg)
                }
                Spacer(Modifier.width(8.dp))
                Text(e.time, fontSize = 12.sp, color = Muted)
            }
            Text(e.text, fontSize = 14.sp)
            e.sent?.let { sent ->
                TextButton(onClick = { open = !open }, contentPadding = PaddingValues(0.dp)) { Text(if (open) "Hide what was sent" else "Show exactly what was sent") }
                if (open) SelectionContainer { Text(sent, fontFamily = FontFamily.Monospace, fontSize = 11.sp, modifier = Modifier.background(Color.White, RoundedCornerShape(8.dp)).padding(8.dp)) }
            }
        }
    }
}

// ---------- small pieces ----------
@Composable
private fun Alerts(items: List<Critical>) {
    if (items.isEmpty()) return
    Note("Contact a doctor today. " + items.joinToString("; ") { "${it.test} ${it.value} is ${it.why}" } + ". This is a fixed safety check, not a diagnosis.", Wax, AlertBg)
}

@Composable
internal fun Panel(content: @Composable ColumnScope.() -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = CardColor, contentColor = Ink),
        border = BorderStroke(1.dp, Line), shape = RoundedCornerShape(14.dp), modifier = Modifier.fillMaxWidth(),
    ) { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp), content = content) }
}

@Composable
internal fun Title(text: String) = Text(text, fontWeight = FontWeight.SemiBold, fontFamily = FontFamily.Serif, fontSize = 20.sp, modifier = Modifier.semantics { heading() })

@Composable
internal fun Note(text: String, fg: Color, bg: Color) =
    Text(text, color = fg, fontSize = 14.sp, modifier = Modifier.fillMaxWidth().background(bg, RoundedCornerShape(10.dp)).padding(10.dp).semantics { liveRegion = LiveRegionMode.Polite })

@Composable
private fun Busy(text: String) {
    Row(
        Modifier.fillMaxWidth().background(Ink, RoundedCornerShape(12.dp)).padding(14.dp).semantics { liveRegion = LiveRegionMode.Polite },
        verticalAlignment = Alignment.CenterVertically,
    ) {
        CircularProgressIndicator(Modifier.size(18.dp), color = Color.White, strokeWidth = 2.dp)
        Spacer(Modifier.width(10.dp))
        Text(text, color = Color.White)
    }
}

@Composable
internal fun Chip(text: String, fg: Color, bg: Color) =
    Text(text, color = fg, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.background(bg, RoundedCornerShape(50)).padding(horizontal = 10.dp, vertical = 4.dp))

const val SAMPLE = """CITY DIAGNOSTICS & RESEARCH CENTRE
Road No. 12, Banjara Hills, Hyderabad 500034   Ph: 040-2335 0000

Patient Name: Mrs. Lakshmi Devi Rao        Age: 54 Years    Sex: Female
UHID: HYD/2291/88        Lab No: CD-774120
Ref. By: Dr. Arvind Menon        Phone: +91 98480 12345
DOB: 14/03/1972
Sample Collected on: 06/11/2026

TEST                     RESULT      UNIT        REFERENCE RANGE
Haemoglobin              9.8         g/dL        12.0 - 15.0
Fasting Blood Glucose    118         mg/dL       70 - 100
HbA1c                    6.3         %           < 5.7
TSH                      6.9         uIU/mL      0.4 - 4.0
Vitamin D (25-OH)        14          ng/mL       30 - 100

Remarks: Lakshmi reports tiredness for two months. Kindly correlate clinically.
Reported by Dr. S. Fatima Khan, MD (Pathology)"""
