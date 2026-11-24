package com.rishinavroop.sealed

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.codescanner.GmsBarcodeScannerOptions
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning

@Composable
internal fun PersonPicker(vm: SealedViewModel) {
    var adding by remember { mutableStateOf(false) }
    var name by remember { mutableStateOf("") }
    Text("Report for", fontSize = 13.sp, color = Muted)
    Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        vm.everyone.forEach { p -> FilterChip(selected = vm.person == p.id, onClick = { vm.choose(p.id) }, label = { Text(p.name) }) }
        FilterChip(selected = adding, onClick = { adding = !adding }, label = { Text("+ Add") }, modifier = Modifier.semantics { contentDescription = "Add a family member" })
    }
    if (adding) {
        OutlinedTextField(name, { name = it.take(30) }, Modifier.fillMaxWidth(), singleLine = true, label = { Text("Family member's name or nickname") }, supportingText = { Text("Kept only on this phone. The cloud sees an anonymous id.") })
        OutlinedButton(enabled = name.isNotBlank(), onClick = { vm.addPerson(name); name = ""; adding = false }) { Text("Add") }
    }
}

@Composable
internal fun SaveRow(vm: SealedViewModel) {
    OutlinedTextField(
        vm.month, { vm.month = it.take(7) }, Modifier.fillMaxWidth(), singleLine = true,
        label = { Text("Report month (year-month)") }, placeholder = { Text("2026-05") },
        supportingText = { Text("Found on this phone. Only the month is saved, for the timeline.") },
    )
    Button(onClick = { vm.save() }, enabled = vm.busy == null && !vm.saved, modifier = Modifier.fillMaxWidth()) {
        Text(if (vm.saved) "Saved to ${vm.personName}'s timeline" else "Save to ${vm.personName}'s timeline")
    }
}

@Composable
internal fun TimelinePanel(vm: SealedViewModel) = Panel {
    val mine = vm.mine
    val series = remember(mine) { Timeline.series(mine) }
    val many = remember(series) { Timeline.notableFirst(series.filter { it.points.size > 1 }) }
    val dated = mine.count { it.month.isNotEmpty() }
    Title("Health timeline")
    Text("${vm.personName} · $dated dated report${if (dated == 1) "" else "s"}" + if (vm.person == Timeline.SAMPLE_ID) " (2 built-in samples)" else "", fontSize = 13.sp, color = Muted)
    if (series.isEmpty()) Text("Save reports for ${vm.personName} with their month, and values like HbA1c, creatinine or TSH will be tracked here across labs and years.", color = Muted)
    (many.ifEmpty { series }).take(8).forEach { s ->
        Column(Modifier.fillMaxWidth().background(Color.White, RoundedCornerShape(10.dp)).padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row {
                Text(s.label, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                if (s.reference.isNotEmpty()) Text("range ${s.reference}", fontSize = 12.sp, color = Muted)
            }
            Sparkline(s)
            Text(Timeline.sentence(s), fontSize = 13.sp)
        }
    }
    if (many.isEmpty() && series.isNotEmpty()) Text("Only one dated report so far. Add another to see changes over time.", fontSize = 13.sp, color = Muted)
    if (many.isNotEmpty()) OutlinedButton(onClick = { vm.explainTrend(many) }, enabled = vm.busy == null) { Text("Explain these changes") }
    vm.trend?.let { t ->
        when (t.where) {
            "device" -> Chip("On this phone", DeviceGreen, DeviceBg)
            "cloud" -> Chip("Cloud, numbers only", CloudBlue, CloudBg)
            else -> Chip("Code", Muted, ChipBg)
        }
        Text(t.text)
        Text("Directions and ranges were worked out by Sealed's code.", fontSize = 12.sp, color = Muted)
    }
}

// The values in order, with the reference range as a shaded band.
@Composable
private fun Sparkline(s: Series) {
    val measurer = rememberTextMeasurer()
    Canvas(Modifier.fillMaxWidth().height(92.dp).semantics { contentDescription = Timeline.sentence(s) }) {
        val band = Timeline.band(s.reference)
        val values = s.points.map { it.value } + listOfNotNull(band?.first, band?.second)
        var lo = values.min()
        var hi = values.max()
        if (lo == hi) { lo -= 1; hi += 1 }
        val pad = (hi - lo) * 0.15
        lo -= pad; hi += pad
        val side = 22.dp.toPx()
        val edge = 18.dp.toPx()
        fun x(i: Int) = if (s.points.size == 1) size.width / 2 else side + i * (size.width - 2 * side) / (s.points.size - 1)
        fun y(v: Double) = (size.height - edge - (v - lo) / (hi - lo) * (size.height - 2 * edge)).toFloat()
        if (band != null) {
            val top = y(band.second ?: hi)
            val bottom = y(band.first ?: lo)
            drawRect(DeviceBg, Offset(0f, top), Size(size.width, bottom - top))
        }
        val path = Path()
        s.points.forEachIndexed { i, p -> if (i == 0) path.moveTo(x(i), y(p.value)) else path.lineTo(x(i), y(p.value)) }
        drawPath(path, Ink, style = Stroke(2.dp.toPx()))
        s.points.forEachIndexed { i, p ->
            drawCircle(if (p.status == "low" || p.status == "high") Wax else DeviceGreen, 4.dp.toPx(), Offset(x(i), y(p.value)))
            val label = measurer.measure(Timeline.number(p.value), TextStyle(fontSize = 11.sp, color = Ink))
            drawText(label, topLeft = Offset((x(i) - label.size.width / 2).coerceIn(0f, size.width - label.size.width), y(p.value) - label.size.height - 5.dp.toPx()))
        }
    }
}

@Composable
internal fun HistoryPanel(vm: SealedViewModel) = Panel {
    Title("Your history")
    Text("Sealed copies only, in a private account with no name or email. The key that restores names stays on this phone.", fontSize = 13.sp, color = Muted)
    vm.historyNote?.let { Text(it, color = Warn, fontSize = 13.sp) }
    val mine = vm.items.filter { it.profile == vm.person }
    if (mine.isEmpty()) Text("Nothing saved for ${vm.personName} yet.", color = Muted)
    mine.forEach { r ->
        var sure by remember(r.id) { mutableStateOf(false) }
        val title = r.explanation?.findings?.take(3)?.joinToString(", ") { it.test }?.ifBlank { null } ?: "Report"
        Row(verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClick = { vm.openSaved(r) }, modifier = Modifier.weight(1f), shape = RoundedCornerShape(6.dp), contentPadding = PaddingValues(4.dp)) {
                Column(Modifier.fillMaxWidth()) {
                    Text(title, color = Ink)
                    Text("${Timeline.monthLabel(r.month)} · ${r.hidden} hidden · ${r.language}", fontSize = 12.sp, color = Muted)
                }
            }
            TextButton(onClick = { if (sure) vm.delete(r) else sure = true }, enabled = vm.busy == null) { Text(if (sure) "Delete for good" else "Delete") }
        }
    }
    HorizontalDivider(color = Line)
    LinkBox(vm)
}

@Composable
private fun LinkBox(vm: SealedViewModel) {
    val context = LocalContext.current
    var pasting by remember { mutableStateOf(false) }
    var code by remember { mutableStateOf("") }
    Text(if (vm.linked) "Linked to your family timeline" else "Link with your laptop", fontWeight = FontWeight.SemiBold, fontFamily = FontFamily.Serif, fontSize = 17.sp, modifier = Modifier.semantics { heading() })
    Text(
        if (vm.linked) "This phone shares one sealed timeline with your other devices. Names are not in it."
        else "On the laptop, open Sealed and choose Link a phone. Only sealed reports are shared. Names travel inside the code, never through the cloud.",
        fontSize = 13.sp, color = Muted,
    )
    if (vm.linked) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(onClick = { vm.refreshHistory() }, enabled = vm.busy == null) { Text("Refresh") }
            OutlinedButton(onClick = { vm.leave() }, enabled = vm.busy == null) { Text("Unlink this phone") }
        }
        return
    }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Button(enabled = vm.busy == null, onClick = {
            val options = GmsBarcodeScannerOptions.Builder().setBarcodeFormats(Barcode.FORMAT_QR_CODE).build()
            GmsBarcodeScanning.getClient(context, options).startScan()
                .addOnSuccessListener { vm.readInvite(it.rawValue.orEmpty()) }
                .addOnFailureListener { vm.scanFailed("The scanner is not ready on this phone yet. Paste the code instead.") }
        }) { Text("Scan a code") }
        OutlinedButton(onClick = { pasting = !pasting }) { Text("Paste a code") }
    }
    if (pasting) {
        OutlinedTextField(code, { code = it }, Modifier.fillMaxWidth(), singleLine = true, label = { Text("Link from the laptop") })
        OutlinedButton(enabled = code.isNotBlank(), onClick = { vm.readInvite(code); code = ""; pasting = false }) { Text("Continue") }
    }
    vm.invite?.let { i ->
        AlertDialog(
            containerColor = CardColor,
            onDismissRequest = { vm.cancelInvite() },
            title = { Text("Link this phone?") },
            text = { Text("People in this timeline: ${i.people.joinToString(", ") { it.name }}.${vm.mergeNote(i)}\n\nOnly continue if you made this code yourself, or someone in your family showed it to you. Reports you save will be visible, sealed, on the linked devices.") },
            confirmButton = { TextButton(onClick = { vm.join() }, enabled = vm.busy == null) { Text("Link this phone") } },
            dismissButton = { TextButton(onClick = { vm.cancelInvite() }) { Text("Cancel") } },
        )
    }
}
