package com.rishinavroop.sealed

// Health checks that run as plain code on the phone: no model, no network.
// Ported from web/js/redact.js (range check) and web/js/health.js (parsing, critical values).

data class Finding(
    val test: String,
    val value: String,
    val reference: String = "",
    val status: String = "unclear",
    val meaning: String = "",
    val corrected: Boolean = false,
)

data class Critical(val test: String, val value: String, val why: String)

object Health {
    private val I = RegexOption.IGNORE_CASE
    private val NUM = Regex("""-?\d+(?:\.\d+)?""")

    fun numberIn(s: String): Double? = NUM.find(s.replace(",", ""))?.value?.toDoubleOrNull()

    // ---------- range check ----------
    private val RANGE = Regex("""(-?\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(-?\d+(?:\.\d+)?)""", I)
    private val MANY = Regex("""\d\s*(?:-|–|—|to)\s*\d""", I)
    private val GROUPS = Regex("""\b(male|female|men|women|M:|F:|adult|child)""", I)
    private val UNDER = Regex("""^\s*(<|<=|≤|up to|upto|below|less than)\s*(-?\d+(?:\.\d+)?)""", I)
    private val OVER = Regex("""^\s*(>|>=|≥|above|over)\s*(-?\d+(?:\.\d+)?)""", I)

    // Several ranges in one place (for example separate ranges for men and women): never pick one.
    private fun severalRanges(ref: String) = MANY.findAll(ref).count() > 1 || GROUPS.containsMatchIn(ref)

    fun rangeStatus(value: String, reference: String): String? {
        val v = numberIn(value) ?: return null
        val ref = reference.replace(",", "")
        if (ref.isEmpty()) return null
        if (severalRanges(ref)) return null
        RANGE.find(ref)?.let { m ->
            val lo = m.groupValues[1].toDouble()
            val hi = m.groupValues[2].toDouble()
            if (!(lo < hi)) return null
            return if (v < lo) "low" else if (v > hi) "high" else "normal"
        }
        UNDER.find(ref)?.let { return if (v > it.groupValues[2].toDouble()) "high" else "normal" }
        OVER.find(ref)?.let { return if (v < it.groupValues[2].toDouble()) "low" else "normal" }
        return null
    }

    // Low and high limits of one clear range, for the chart.
    fun bounds(reference: String): Pair<Double?, Double?>? {
        val ref = reference.replace(",", "")
        if (severalRanges(ref)) return null
        RANGE.find(ref)?.let { return it.groupValues[1].toDouble() to it.groupValues[2].toDouble() }
        UNDER.find(ref)?.let { return null to it.groupValues[2].toDouble() }
        OVER.find(ref)?.let { return it.groupValues[2].toDouble() to null }
        return null
    }

    private val PLAIN = mapOf("low" to "below", "normal" to "within", "high" to "above")

    fun plainMeaning(status: String, reference: String) =
        PLAIN[status]?.let { "Your result is $it the reference range of $reference. Ask your doctor what this means for you." }
            ?: "Sealed could not compare this with one clear reference range. Ask your doctor what it means for you."

    // The code decides every label. If the model disagreed, its wording may be wrong too, so it is replaced.
    // When the report gives no single clear range the label is "unclear", never the model's guess.
    fun check(findings: List<Finding>): Pair<List<Finding>, Int> {
        var corrected = 0
        val out = findings.map { f ->
            val s = rangeStatus(f.value, f.reference)
            when {
                s == null -> if (f.status == "unclear") f else f.copy(status = "unclear", meaning = plainMeaning("unclear", f.reference))
                f.status == s -> f
                else -> {
                    corrected++
                    f.copy(status = s, meaning = plainMeaning(s, f.reference), corrected = true)
                }
            }
        }
        return out to corrected
    }

    // Numbers the model copied are compared with the report itself. A wrong value or range is replaced.
    // Tests that appear more than once are left alone unless no printed value matches.
    fun reconcile(findings: List<Finding>, fromReport: List<Finding>): Pair<List<Finding>, Int> {
        val byKey = fromReport.groupBy { normaliseTest(it.test) }
        var fixed = 0
        val out = findings.map { f ->
            val printed = byKey[normaliseTest(f.test)] ?: return@map f
            val same = printed.firstOrNull { numberIn(it.value) == numberIn(f.value) }
            val source = same ?: printed.singleOrNull() ?: return@map f
            val sameRange = rangeNumbers(source.reference) == rangeNumbers(f.reference)
            if (same != null && (sameRange || source.reference.isEmpty())) return@map f
            fixed++
            val ref = source.reference.ifEmpty { f.reference }
            if (same != null) f.copy(reference = ref) else f.copy(value = source.value, reference = ref, meaning = source.meaning, corrected = true)
        }
        return out to fixed
    }

    // "135-145" and "135 - 145" are the same range.
    private fun rangeNumbers(ref: String) = NUM.findAll(ref.replace(",", "")).map { it.value.trimStart('-').toDouble() }.toList()

    // The count shown to people always comes from code, never from a model.
    fun countLine(findings: List<Finding>): String {
        if (findings.isEmpty()) return ""
        val out = findings.count { it.status == "low" || it.status == "high" }
        val unclear = findings.count { it.status == "unclear" }
        return "$out of ${findings.size} results outside the range printed on the report" + if (unclear > 0) ", $unclear with no clear range." else "."
    }

    // ---------- test names ----------
    private val SYNONYMS = listOf(
        "hba1c" to """\b(hba1c|hb\s*a1c|glycated\s+ha?emoglobin|glycosylated)""",
        "haemoglobin" to """^(ha?emoglobin|hb|hgb)\b(?!\s*a1c)""",
        "fasting glucose" to """(fasting\s+(blood\s+)?(glucose|sugar)|glucose\s*[\-,(]?\s*fasting|\bfbs\b|\bfbg\b)""",
        "post-meal glucose" to """(post\s*prandial|\bppbs\b|\bpp\s*glucose|glucose\s*[\-,(]?\s*pp\b)""",
        "random glucose" to """(random\s+(blood\s+)?(glucose|sugar)|\brbs\b)""",
        "creatinine" to """^(serum\s+)?creatinine\b""",
        "urea" to """^(blood\s+)?urea\b(?!\s*nitrogen)""",
        "uric acid" to """\buric\s+acid""",
        "tsh" to """\b(tsh|thyroid\s+stimulating)""",
        "vitamin d" to """(vitamin\s*d|25\s*-?\s*oh)""",
        "vitamin b12" to """(vitamin\s*b\s*12|cobalamin)""",
        "total cholesterol" to """^(total\s+)?cholesterol\b(?!.*(hdl|ldl|vldl|ratio))""",
        "ldl cholesterol" to """\bldl\b""",
        "hdl cholesterol" to """\bhdl\b""",
        "triglycerides" to """triglyceride""",
        "alt (sgpt)" to """(\bsgpt\b|\balt\b|alanine\s+(amino)?transaminase)""",
        "ast (sgot)" to """(\bsgot\b|\bast\b|aspartate\s+(amino)?transaminase)""",
        "alkaline phosphatase" to """alkaline\s+phosphatase|\balp\b""",
        "bilirubin total" to """bilirubin.*total|total\s+bilirubin""",
        "bilirubin direct" to """bilirubin.*direct|direct\s+bilirubin""",
        "albumin" to """^(serum\s+)?albumin\b""",
        "platelets" to """platelet""",
        "wbc" to """(\bwbc\b|white\s+blood|total\s+leu[ck]ocyte|\btlc\b)""",
        "sodium" to """^sodium|\bna\+?\b""",
        "potassium" to """^potassium|\bk\+\b""",
        "egfr" to """\begfr\b""",
    ).map { (k, r) -> k to Regex(r, I) }
    private val GROUP_PREFIX = Regex("""^(electrolytes|biochemistry|chemistry|liver function test|lft|kft)\s+""", I)

    fun normaliseTest(name: String): String {
        val n = name.replace(GROUP_PREFIX, "").trim()
        if (n.contains("ratio", ignoreCase = true)) {
            val r = "ratio " + n.lowercase().replace(Regex("""\bsr\.?\s*"""), "").replace(Regex("[^a-z]+"), " ")
                .replace(Regex("""\bratio\b"""), "").replace(Regex("""\s+"""), " ").trim()
            return if (r == "ratio a g") "ratio albumin globulin" else r
        }
        SYNONYMS.firstOrNull { it.second.containsMatchIn(n) }?.let { return it.first }
        return n.lowercase().replace(Regex("[^a-z0-9 ()]+"), " ").replace(Regex("""\s+"""), " ").trim()
    }

    // ---------- critical values ----------
    // General adult thresholds, shown as "contact a doctor today", never as a diagnosis.
    private class Limits(val low: Double?, val high: Double)

    private val CRITICAL = mapOf(
        "potassium" to Limits(2.8, 6.2),
        "sodium" to Limits(120.0, 160.0),
        "fasting glucose" to Limits(50.0, 400.0),
        "random glucose" to Limits(50.0, 400.0),
        "post-meal glucose" to Limits(50.0, 400.0),
        "haemoglobin" to Limits(7.0, 20.0),
        "creatinine" to Limits(null, 5.0),
        "hba1c" to Limits(null, 12.0),
        "alt (sgpt)" to Limits(null, 1000.0),
        "ast (sgot)" to Limits(null, 1000.0),
        "bilirubin total" to Limits(null, 15.0),
    )

    fun criticalFindings(findings: List<Finding>): List<Critical> = findings.mapNotNull { f ->
        val key = normaliseTest(f.test)
        val v = numberIn(f.value) ?: return@mapNotNull null
        if (key == "platelets") {
            // 2.6 (lakh/cumm), 260 (10^3/uL) or 260000 (/cumm): convert to thousands per uL.
            val k = if (f.value.contains("lakh", true)) v * 100 else if (v > 5000) v / 1000 else v
            return@mapNotNull if (k < 50) Critical(f.test, f.value, "very low") else if (k > 1000) Critical(f.test, f.value, "very high") else null
        }
        val c = CRITICAL[key] ?: return@mapNotNull null
        if (c.low != null && v < c.low) Critical(f.test, f.value, "very low")
        else if (v > c.high) Critical(f.test, f.value, "very high")
        else null
    }

    // ---------- quick parse ----------
    private val NOT_A_TEST = Regex("""^(page|lab|sample|barcode|ref|age|dob|date|report|uhid|mrd|bill|phone|ph|patient|name|time|received|collected|registered|printed|reported|bed|ward|room|class|policy|emp|employee|order|booking|aadhaa?r|abha|mobile|contact|pin|token|visit|invoice|receipt|card|claim)\b""", I)
    private const val METHODS = """photometry|spectrophotometry|calculated|calculation|immunoassay|c\.?l\.?i\.?a|e\.?c\.?l\.?i\.?a|elisa|hplc|turbidimetry|nephelometry|potentiometry|ise(?:\s+direct|\s+indirect)?|colorimetric|enzymatic|flow\s+cytometry|automated|impedance|derived"""
    private val LINE = Regex("""^\s*([A-Za-z][A-Za-z0-9 ().,/'+\-]{1,60}?)\s+(?:(?:$METHODS)\s+)?(-?\d[\d,]*(?:\.\d+)?)\s*([A-Za-zµ%][A-Za-z%µ/^0-9.]*)?\s*(.*)$""", I)
    private val REF = Regex("""((?:<|>|<=|>=|≤|≥|up\s*to|upto|less\s+than|below|more\s+than|above)\s*\d[\d.,]*|\d[\d.,]*\s*(?:-|–|to)\s*\d[\d.,]*)""", I)

    private val BARS = Regex("""[\t ]*\|[\t ]*""")
    private val COLON = Regex("""^([ \t]*[A-Za-z](?:[^:]{0,59}[^:\d])?|[ \t]*[A-Za-z][^:]{0,60}(?=:[ \t])):[ \t]*(?=-?\d)""")

    private fun parseLine(printed: String): Finding? {
        // "TSH | 6.9 | uIU/mL | 0.4 - 4.0" and "TSH: 6.9 uIU/mL (Ref: 0.4 - 4.0)" read the same as a printed table.
        val line = COLON.replace(BARS.replace(printed, "  "), "$1 ")
        val m = LINE.find(line) ?: return null
        val name = m.groupValues[1]
        if (NOT_A_TEST.containsMatchIn(name)) return null
        val key = normaliseTest(name)
        if (key.isEmpty() || key.length > 40 || key[0] in '0'..'9') return null
        val rest = m.groupValues[4].trim()
        // A line with separate ranges for men and women keeps them all, so no single one is ever picked.
        val ref = if (severalRanges(rest)) rest else REF.find(rest)?.groupValues?.get(1)?.trim().orEmpty()
        val value = "${m.groupValues[2]} ${m.groupValues[3]}".trim()
        return Finding(name.trim().trimEnd { it.isWhitespace() || it == '-' }, value, ref)
    }

    // Reads "Test name [METHOD] value unit range" lines straight from the report text with fixed rules.
    fun quickParse(raw: String): List<Finding> = raw.lines().mapNotNull { parseLine(it) }

    // Results decided entirely by code: value, range, label and a plain sentence.
    fun fromCode(text: String): List<Finding> = quickParse(text).map { f ->
        val s = rangeStatus(f.value, f.reference) ?: "unclear"
        f.copy(status = s, meaning = plainMeaning(s, f.reference))
    }
}
