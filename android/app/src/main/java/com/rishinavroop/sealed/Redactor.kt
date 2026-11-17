package com.rishinavroop.sealed

// Sealing logic, ported from web/js/redact.js. Pure Kotlin: no network, no model calls.

data class Entity(val text: String, val type: String, val source: String = "model")
data class Sealed(val text: String, val map: Map<String, String>)

object Redactor {
    private val TYPES = setOf("NAME", "DOCTOR", "FACILITY", "ADDRESS", "ID", "CONTACT", "DOB")

    private val PATTERNS = listOf(
        "CONTACT" to Regex("""[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"""),
        "CONTACT" to Regex("""(?:\+91[\s-]?|\b0)?[6-9]\d{4}[\s-]?\d{5}\b"""),
        "ID" to Regex("""\b\d{4}[\s-]\d{4}[\s-]\d{4}\b"""), // Aadhaar
        "ID" to Regex("""\b[A-Z]{5}\d{4}[A-Z]\b"""),        // PAN
    )

    private data class Field(val type: String, val re: Regex, val whole: Boolean = false)
    private val FIELDS = listOf(
        Field("NAME", Regex("""(?im)\b(?:Patient(?:'s)?\s*Name|Name\s*of\s*Patient|Pt\.?\s*Name|Name)\s*[:\-]\s*([^\n\r]+?)(?=\s{2,}|\t|\s+(?:Age|Sex|Gender|DOB|UHID|MRN)\b|$)""")),
        Field("DOCTOR", Regex("""(?im)\b(?:Ref(?:erred|erring)?\.?\s*(?:By|Doctor|Dr\.?)|Consultant|Doctor|Physician|Pathologist)\s*[:\-]\s*([^\n\r]+?)(?=\s{2,}|\t|$)""")),
        Field("DOCTOR", Regex("""\bDr\.? ?[A-Z][a-zA-Z.]*(?: [A-Z][a-zA-Z.]+){0,2}"""), whole = true),
        Field("ID", Regex("""(?i)\b(?:UHID|MRN|MR\s*No|Patient\s*ID|Reg(?:istration)?\.?\s*No|Lab\s*(?:No|ID)|Sample\s*(?:No|ID)|Bill\s*No|Accession\s*No|Barcode|IP\s*No|OP\s*No)\.?\s*[:#\-]?\s*([A-Z0-9][A-Z0-9/\-]{3,})""")),
        Field("DOB", Regex("""(?i)\b(?:DOB|D\.O\.B\.?|Date\s*of\s*Birth)\s*[:\-]?\s*(\d{1,2}[/\-.\s](?:\d{1,2}|[A-Za-z]{3,9})[/\-.\s]\d{2,4})""")),
        Field("ADDRESS", Regex("""(?i)\b(?:Address|Addr)\s*[:\-]\s*([^\n\r]+)""")),
    )

    private val KEEP = Regex("""(?i)^(male|female|m|f|years?|yrs?|normal|high|low|positive|negative|fasting|serum|plasma|blood|urine|report|test|result|hemoglobin|haemoglobin|glucose|cholesterol|platelets?|wbc|rbc|tsh|hba1c|creatinine|vitamin\s*\w+)$""")
    private val SENTENCE = Regex("""(?i)\b(?:reports?|reported|was|were|is|are|has|have|had|kindly|advised|please|correlate|shows?|noted|for|with)\b""")
    private val TITLES = Regex("""(?i)^(mr|mrs|ms|miss|dr|shri|smt|sri|kumari|master|baby|md|prof)\.?$""")

    private fun words(t: String) = t.trim().split(Regex("\\s+")).count { it.isNotEmpty() }

    fun findPatternEntities(text: String): List<Entity> {
        val found = mutableListOf<Entity>()
        for ((type, re) in PATTERNS) re.findAll(text).forEach { found += Entity(it.value.trim(), type, "pattern") }
        for (f in FIELDS) f.re.findAll(text).forEach { m ->
            val v = (if (f.whole) m.value else m.groupValues.getOrNull(1) ?: "").trim().trimEnd(',', ';', '.')
            if (v.isNotEmpty()) found += Entity(v, f.type, "pattern")
        }
        return clean(found, text)
    }

    private fun tidy(raw: String, type: String): String {
        var t = raw.trim().lines().first().trim()
        t = t.replace(Regex("""^[A-Za-z][A-Za-z .'/]{1,28}:\s+"""), "")
        t = t.replace(Regex("""(?i)^(?:reported|referred|ref\.?|signed|verified|checked|authori[sz]ed)\s+by\s*:?\s*"""), "")
        if (type == "DOCTOR" || type == "NAME") t = t.replace(Regex("""(?i),\s*(?:MD|MBBS|DM|MS|DNB|MCh|FRCP|PhD)\b.*$"""), "")
        return t.trimEnd(',', ';', ':', '.').trim()
    }

    private fun plausible(t: String, type: String): Boolean = when (type) {
        "DOB" -> Regex("""\d{1,2}[/\-. ](?:\d{1,2}|[A-Za-z]{3,9})[/\-. ]\d{2,4}""").containsMatchIn(t)
        "CONTACT" -> t.contains('@') || t.count { it.isDigit() } >= 7
        "ID" -> t.any { it.isDigit() } && t.length >= 4 && words(t) <= 3
        "NAME", "DOCTOR" -> words(t) <= 5 && t.none { it.isDigit() } && !SENTENCE.containsMatchIn(t)
        "FACILITY" -> words(t) <= 8 && !SENTENCE.containsMatchIn(t)
        "ADDRESS" -> words(t) <= 18
        else -> false
    }

    fun clean(entities: List<Entity>, text: String): List<Entity> {
        val lower = text.lowercase()
        val seen = mutableSetOf<String>()
        val out = mutableListOf<Entity>()
        for (e in entities) {
            val type = if (e.type in TYPES) e.type else "NAME"
            val t = if (e.source == "you") e.text.trim() else tidy(e.text, type)
            if (t.length < 2 || t.length > 120 || KEEP.matches(t)) continue
            if (Regex("""^\d+(\.\d+)?\s*%?$""").matches(t) && t.length < 6) continue
            if (e.source != "you" && !plausible(t, type)) continue
            if (!lower.contains(t.lowercase())) continue
            if (!seen.add(t.lowercase())) continue
            out += Entity(t, type, e.source)
        }
        return dropNested(addNameParts(out, text), text)
    }

    fun merge(a: List<Entity>, b: List<Entity>, text: String) = clean(a + b, text)

    private fun removeAll(text: String, values: List<String>): String {
        var rest = text
        for (v in values) rest = rest.replace(v, " ", ignoreCase = true)
        return rest
    }

    private fun addNameParts(entities: List<Entity>, text: String): List<Entity> {
        val rest = removeAll(text, entities.map { it.text })
        val have = entities.map { it.text.lowercase() }.toMutableSet()
        val extra = mutableListOf<Entity>()
        for (e in entities.filter { it.type == "NAME" || it.type == "DOCTOR" }) {
            for (part in e.text.split(Regex("[\\s.]+"))) {
                if (part.length < 3 || TITLES.matches(part) || KEEP.matches(part) || part.lowercase() in have) continue
                if (Regex("\\b${Regex.escape(part)}\\b", RegexOption.IGNORE_CASE).containsMatchIn(rest)) {
                    have += part.lowercase(); extra += Entity(part, e.type, "pattern")
                }
            }
        }
        return entities + extra
    }

    private fun dropNested(entities: List<Entity>, text: String) = entities.filter { e ->
        val parents = entities.filter { it !== e && it.text.length > e.text.length && it.text.contains(e.text, ignoreCase = true) }
        parents.isEmpty() || removeAll(text, parents.map { it.text }).contains(e.text, ignoreCase = true)
    }

    fun seal(text: String, entities: List<Entity>): Sealed {
        val counters = mutableMapOf<String, Int>()
        val map = linkedMapOf<String, String>()
        val byValue = mutableMapOf<String, String>()
        var sealed = text
        for (e in entities.sortedByDescending { it.text.length }) {
            val key = e.text.lowercase()
            val ph = byValue.getOrPut(key) {
                val n = (counters[e.type] ?: 0) + 1; counters[e.type] = n
                "[${e.type}_$n]".also { map[it] = e.text }
            }
            val edge = if (Regex("^\\w+$").matches(e.text)) "\\b" else ""
            sealed = sealed.replace(Regex(edge + Regex.escape(e.text) + edge, RegexOption.IGNORE_CASE), Regex.escapeReplacement(ph))
        }
        return Sealed(sealed, map)
    }

    fun unseal(text: String, map: Map<String, String>): String {
        var out = text
        for ((ph, original) in map) out = out.replace(ph, original)
        return out
    }
}
