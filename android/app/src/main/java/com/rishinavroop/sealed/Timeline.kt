package com.rishinavroop.sealed

import java.util.Calendar
import java.util.Locale
import kotlin.math.abs
import kotlin.math.min

// The health timeline, ported from web/js/health.js. Pure Kotlin: no network, no model calls.

data class Saved(
    val id: String,
    val profile: String,
    val month: String,
    val results: List<Finding>,
    val sealed: String = "",
    val explanation: Explanation? = null,
    val where: String = "cloud",
    val language: String = "English",
    val hidden: Int = 0,
    val sample: Boolean = false,
)

data class Point(val month: String, val value: Double, val reference: String, val status: String)
data class Series(val key: String, val label: String, val unit: String, val reference: String, val points: List<Point>)

object Timeline {
    private val MONTHS = listOf("jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec")
    private val NUMERIC = Regex("""\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b""")
    private val NAMED = Regex("""\b(?:\d{1,2}(?:st|nd|rd|th)?[\s\-]*)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,.\-]*(\d{4})\b""", RegexOption.IGNORE_CASE)
    private val REPORT_DATE = Regex("""(collect|receiv|report|sample|regist|test\s*date|date\s*of\s*(test|report))""", RegexOption.IGNORE_CASE)
    private val BIRTH = Regex("""(birth|dob|d\.o\.b)""", RegexOption.IGNORE_CASE)

    fun thisMonth(): String = Calendar.getInstance().let { String.format(Locale.US, "%04d-%02d", it.get(Calendar.YEAR), it.get(Calendar.MONTH) + 1) }

    // Finds the report or sample date in the original text, on the phone. Only "YYYY-MM" is ever stored.
    fun detectMonth(text: String, limit: String = thisMonth()): String {
        val found = mutableListOf<Pair<String, Int>>()
        fun add(year: Int, month: Int, at: Int) {
            val y = if (year < 100) year + 2000 else year
            if (month !in 1..12 || y < 2000) return
            val ym = String.format(Locale.US, "%04d-%02d", y, month)
            if (ym <= limit) found += ym to at
        }
        NUMERIC.findAll(text).forEach { m -> add(m.groupValues[3].toInt(), m.groupValues[2].toInt(), m.range.first) }
        NAMED.findAll(text).forEach { m -> add(m.groupValues[2].toInt(), MONTHS.indexOf(m.groupValues[1].lowercase()) + 1, m.range.first) }
        if (found.isEmpty()) return ""
        val labelled = found.filter { (_, at) ->
            val lineStart = text.lastIndexOf('\n', at) + 1
            val before = text.substring(maxOf(lineStart, at - 60).coerceIn(0, at), at)
            REPORT_DATE.containsMatchIn(before) && !BIRTH.containsMatchIn(before)
        }
        return labelled.ifEmpty { found }.maxOf { it.first }
    }

    fun monthLabel(ym: String): String {
        val m = Regex("""^(\d{4})-(\d{2})$""").find(ym) ?: return "Undated"
        val i = m.groupValues[2].toInt()
        if (i !in 1..12) return "Undated"
        return MONTHS[i - 1].replaceFirstChar { it.uppercase() } + " " + m.groupValues[1]
    }

    fun isMonth(s: String) = Regex("""^20\d{2}-(0[1-9]|1[0-2])$""").matches(s)

    private val LEADING_NUMBER = Regex("""^[\s\d.,\-]+""")

    // One series per test, across labs and years. Labels come from code, never from a model.
    fun series(items: List<Saved>): List<Series> {
        val byKey = linkedMapOf<String, Series>()
        for (item in items.filter { it.month.isNotEmpty() }.sortedBy { it.month }) {
            for (f in item.results.ifEmpty { item.explanation?.findings.orEmpty() }) {
                val v = Health.numberIn(f.value) ?: continue
                val key = Health.normaliseTest(f.test)
                val s = byKey[key] ?: Series(key, f.test, "", f.reference, emptyList())
                val p = Point(item.month, v, f.reference, Health.rangeStatus(f.value, f.reference).orEmpty())
                val at = s.points.indexOfFirst { it.month == item.month }
                byKey[key] = s.copy(
                    unit = s.unit.ifEmpty { f.value.replace(LEADING_NUMBER, "").trim() },
                    reference = f.reference.ifEmpty { s.reference },
                    points = if (at >= 0) s.points.toMutableList().also { it[at] = p } else s.points + p,
                )
            }
        }
        return byKey.values.sortedWith(compareByDescending<Series> { it.points.size }.thenBy { it.key })
    }

    private val WHERE = mapOf("low" to "below range", "normal" to "in range", "high" to "above range")
    private fun tag(p: Point) = WHERE[p.status]?.let { " ($it)" }.orEmpty()
    fun number(v: Double): String = if (v == Math.rint(v) && abs(v) < 1e15) v.toLong().toString() else v.toString()

    fun sentence(s: Series): String {
        val unit = if (s.unit.isEmpty()) "" else " " + s.unit
        val a = s.points.first()
        if (s.points.size < 2) return "${s.label}: ${number(a.value)}$unit${tag(a)} in ${monthLabel(a.month)}."
        val b = s.points.last()
        val diff = b.value - a.value
        val pct = if (a.value != 0.0) Math.round(diff / abs(a.value) * 100) else 0L
        val dir = if (abs(pct) < 5) "stayed about the same" else if (diff > 0) "rose ${abs(pct)}%" else "fell ${abs(pct)}%"
        return "${s.label} $dir: ${number(a.value)}${tag(a)} in ${monthLabel(a.month)}, ${number(b.value)}$unit${tag(b)} in ${monthLabel(b.month)}."
    }

    // Changes worth showing first: moved out of range, moved back into range, or changed by 20% or more.
    fun notableFirst(series: List<Series>): List<Series> = series.sortedByDescending { s ->
        val a = s.points.first()
        val b = s.points.last()
        val crossed = if (a.status != b.status && (a.status in WHERE || b.status in WHERE)) 2.0 else 0.0
        val out = if (b.status == "low" || b.status == "high") 1.0 else 0.0
        val big = if (a.value != 0.0) min(1.0, abs((b.value - a.value) / a.value) / 0.2) else 0.0
        crossed + out + big
    }

    // The shaded range on a chart. None when men and women have different ranges.
    fun band(reference: String): Pair<Double?, Double?>? = Health.bounds(reference)

    // Results for the timeline: every test read from the sealed report, with AI findings filling any gaps.
    fun merge(findings: List<Finding>, parsed: List<Finding>): List<Finding> {
        val byKey = linkedMapOf<String, Finding>()
        fun plain(f: Finding) = Finding(f.test, f.value, f.reference)
        for (r in parsed) if (Health.numberIn(r.value) != null) byKey[Health.normaliseTest(r.test)] = plain(r)
        for (f in findings) {
            val k = Health.normaliseTest(f.test)
            val have = byKey[k]
            if (have == null) {
                if (Health.numberIn(f.value) != null) byKey[k] = plain(f)
            } else if (have.reference.isEmpty() && f.reference.isNotEmpty()) byKey[k] = have.copy(reference = f.reference)
        }
        return byKey.values.take(80)
    }

    // ---------- sample family member ----------
    // Only numbers for the chart, so anyone trying Sealed sees the timeline at once. Nothing is uploaded.
    const val SAMPLE_ID = "demo"
    private fun sampleResults(hb: String, a1c: String, fbs: String, tsh: String, d: String) = listOf(
        Finding("Haemoglobin", "$hb g/dL", "12.0 - 15.0"), Finding("HbA1c", "$a1c %", "< 5.7"),
        Finding("Fasting Blood Glucose", "$fbs mg/dL", "70 - 100"), Finding("TSH", "$tsh uIU/mL", "0.4 - 4.0"),
        Finding("Vitamin D (25-OH)", "$d ng/mL", "30 - 100"),
    )
    val SAMPLES = listOf(
        Saved("demo-1", SAMPLE_ID, "2025-02", sampleResults("11.6", "5.5", "94", "2.8", "24"), sample = true),
        Saved("demo-2", SAMPLE_ID, "2025-09", sampleResults("10.7", "5.9", "104", "4.4", "19"), sample = true),
    )
}
