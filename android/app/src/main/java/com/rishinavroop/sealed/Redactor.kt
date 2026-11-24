package com.rishinavroop.sealed

// Sealing logic, ported line for line from web/js/redact.js. Pure Kotlin: no network, no model calls.
// android/parity.mjs and ParityTest check that both give the same output.

data class Entity(val text: String, val type: String, val source: String = "model")
data class Sealed(val text: String, val map: Map<String, String>)

object Redactor {
    private val TYPES = setOf("NAME", "DOCTOR", "FACILITY", "ADDRESS", "ID", "CONTACT", "DOB")
    private val I = RegexOption.IGNORE_CASE

    private val PATTERNS = listOf(
        "CONTACT" to Regex("""[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}"""),
        "CONTACT" to Regex("""(?:\+91[\s\-]?|\b0)?[6-9]\d{4}[\s\-]?\d{5}\b"""),
        "ID" to Regex("""\b\d{4}[\s\-]\d{4}[\s\-]\d{4}\b"""), // Aadhaar
        "ID" to Regex("""\b[A-Z]{5}\d{4}[A-Z]\b"""), // PAN
    )

    private class Field(val type: String, val re: Regex, val whole: Boolean = false)

    private val FIELDS = listOf(
        Field("NAME", Regex("""(?im)\b(?:Patient(?:'s)?\s*Name|Name\s*of\s*Patient|Pt\.?\s*Name|Name)\s*[:\-]\s*([^\n\r]+?)(?=\s{2,}|\t|\s+(?:Age|Sex|Gender|DOB|UHID|MRN)\b|$)""")),
        Field("DOCTOR", Regex("""(?im)\b(?:Ref(?:erred|erring)?\.?\s*(?:By|Doctor|Dr\.?)|Consultant|Doctor|Physician|Pathologist)\s*[:\-]\s*([^\n\r]+?)(?=\s{2,}|\t|$)""")),
        Field("DOCTOR", Regex("""\bDr\.? ?[A-Z][a-zA-Z.]*(?: [A-Z][a-zA-Z.]+){0,2}"""), whole = true),
        Field("ID", Regex("""(?i)\b(?:UHID|MRN|MR\s*No|Patient\s*ID|Reg(?:istration)?\.?\s*No|Lab\s*(?:No|ID)|Sample\s*(?:No|ID)|Bill\s*No|Accession\s*No|Barcode|IP\s*No|OP\s*No)\.?\s*[:#\-]?\s*([A-Z0-9][A-Z0-9/\-]{3,})""")),
        Field("DOB", Regex("""(?i)\b(?:DOB|D\.O\.B\.?|Date\s*of\s*Birth)\s*[:\-]?\s*(\d{1,2}[/\-.\s](?:\d{1,2}|[A-Za-z]{3,9})[/\-.\s]\d{2,4})""")),
        Field("ADDRESS", Regex("""(?i)\b(?:Address|Addr)[ \t]*[:\-][ \t]*([^\n\r]+)""")),
        // Labelled place fields such as "CITY: MYSORE", value on the same line.
        Field("ADDRESS", Regex("""(?im)\b(?:City|Town|Locality|Area|Village|Taluk|District|Dist|Landmark)[ \t]*:[ \t]*([A-Za-z][A-Za-z .'\-]{1,40}?)[ \t]*(?=\s{2,}|[A-Z]{3,}[ \t]*:|$)""")),
        // A street line, recognised by street words.
        Field("ADDRESS", Regex("""(?im)^[ \t]*([^\n:]{0,60}\b(?:Road|Rd|Street|Circle|Cross|Layout|Nagar|Lane|Marg|Colony|Sector|Phase|Stage|Extension|Apartments?|Residency|Society)\b[^\n]{0,80}?)[ \t,]*$""")),
        // City with a short postal code ("Mysore - 23").
        Field("ADDRESS", Regex("""(?m)^[ \t]*([A-Z][A-Za-z]{2,}[ \t]*-[ \t]*\d{2,6})\b""")),
        // Any labelled phone number, including landlines.
        Field("CONTACT", Regex("""(?i)\b(?:Ph|Phone|Tel|Telephone|Mob|Mobile|Contact|Cell)\.?\s*(?:No\.?)?\s*[:\-]?\s*(\+?\d[\d\s\-]{6,16}\d)""")),
        // Lab or hospital name: a short line naming a facility, usually the letterhead.
        Field("FACILITY", Regex("""(?im)^[ \t]*([A-Za-z][A-Za-z.&' \-]{2,60}\b(?:Diagnostics?|Laborator(?:y|ies)|Labs?|Hospitals?|Clinic|Centre|Center|Pathology|Healthcare|Medical|Imaging|Scans?|Nursing Home)\b[A-Za-z.&' \-]{0,40}?)[ \t]*(?=\s{2,}|$)""")),
        // A street address on its own line, recognised by an Indian 6-digit PIN code.
        Field("ADDRESS", Regex("""(?m)^[ \t]*([A-Za-z0-9][^\n\r:]{4,80}?\b[1-9]\d{2}\s?\d{3})\b""")),
    )
    private val UNIT_LINE = Regex("""\d\s*(?:mg|g/dl|u/l|iu|meq|mmol|ng|pg|µ|%|cells|lakh|/cumm|fl\b)""", I)

    // Words the model sometimes flags that are clinical, not personal. Never redact these.
    private val KEEP = Regex("""^(na|n/a|nil|none|nan|op|ip|electrolytes|biochemistry|haematology|hematology|lipid profile|lipid|profile|kidney|liver|thyroid|function|tests?|panel|routine|examination|serology|immunology|diabetes|complete|count|differential|hormones?|vitamins?|minerals|enzymes|cardiac|iron studies|urine|stool|summary|investigation|department|specimen|method|technology|units?|value|interval|name|names|patient|address|addr|ref|ref\.? by|self|doctor|dr|consultant|landmark|locality|city|state|area|age|sex|gender|sample|barcode|date|report|male|female|m|f|years?|yrs?|normal|high|low|positive|negative|fasting|serum|plasma|blood|urine|report|test|result|hemoglobin|haemoglobin|glucose|cholesterol|platelets?|wbc|rbc|tsh|hba1c|creatinine|vitamin\s*\w+)$""", I)
    private val SENTENCE = Regex("""\b(?:reports?|reported|was|were|is|are|has|have|had|kindly|advised|please|correlate|shows?|noted|for|with)\b""", I)
    private val TITLES = Regex("""^(mr|mrs|ms|miss|dr|shri|smt|sri|kumari|master|baby|md|prof)\.?$""", I)

    // Generic address words that are safe to leave visible on their own.
    private val GENERIC_PLACE = Regex("""^(road|rd|main|cross|street|st|lane|ln|new|old|near|opp|opposite|behind|city|locality|landmark|layout|stage|phase|block|sector|flat|house|h\.?no|no|floor|area|dist|district|taluk|state|india|colony|apartment|apartments|residency|hills|nagar|extension|ext|post|po|village|town|west|east|north|south|the|and|of)$""", I)
    private val GENERIC_FACILITY = Regex("""^(diagnostics?|laborator(y|ies)|labs?|hospitals?|clinic|centre|center|pathology|healthcare|medical|research|imaging|scans?|technologies|ltd|limited|pvt)$""", I)
    private val SHORT_NUMBER = Regex("""^\d+(\.\d+)?\s*%?$""")
    private val DATE_LIKE = Regex("""\d{1,2}[/\-. ](?:\d{1,2}|[A-Za-z]{3,9})[/\-. ]\d{2,4}""")
    private val SPACES = Regex("""\s+""")

    private fun words(t: String) = t.split(SPACES).count { it.isNotEmpty() }
    private fun isWord(c: Char) = c in 'a'..'z' || c in 'A'..'Z' || c in '0'..'9' || c == '_'
    private fun hasDigit(t: String) = t.any { it in '0'..'9' }

    fun findPatternEntities(text: String): List<Entity> {
        val found = mutableListOf<Entity>()
        for ((type, re) in PATTERNS) re.findAll(text).forEach { found += Entity(it.value.trim(), type, "pattern") }
        for (f in FIELDS) f.re.findAll(text).forEach { m ->
            val v = (if (f.whole) m.value else m.groupValues.getOrElse(1) { "" }).trim().trimEnd(',', ';', '.')
            if (f.type == "ADDRESS" && UNIT_LINE.containsMatchIn(v)) return@forEach
            if (v.isNotEmpty()) found += Entity(v, f.type, "pattern")
        }
        return clean(found, text)
    }

    // Tidy one candidate from the model: drop field labels and credentials it copied along.
    private fun tidy(raw: String, type: String): String {
        var t = raw.trim().split('\n', '\r').first().trim()
        t = t.replace(Regex("""^[A-Za-z][A-Za-z .'/]{1,28}:\s+"""), "")
        t = t.replace(Regex("""^(?:reported|referred|ref\.?|signed|verified|checked|authori[sz]ed)\s+by\s*:?\s*""", I), "")
        if (type == "DOCTOR" || type == "NAME") t = t.replace(Regex(""",\s*(?:MD|MBBS|DM|MS|DNB|MCh|FRCP|PhD)\b.*$""", I), "")
        return t.trimEnd(',', ';', ':', '.').trim()
    }

    // Does this candidate look like the kind of identifier it claims to be?
    private fun plausible(t: String, type: String): Boolean = when (type) {
        "DOB" -> DATE_LIKE.containsMatchIn(t)
        "CONTACT" -> '@' in t || t.count { it in '0'..'9' } >= 7
        "ID" -> hasDigit(t) && t.length >= 4 && words(t) <= 3
        "NAME", "DOCTOR" -> words(t) <= 5 && !hasDigit(t) && !SENTENCE.containsMatchIn(t)
        "FACILITY" -> words(t) <= 8 && !SENTENCE.containsMatchIn(t)
        "ADDRESS" -> words(t) <= 18
        else -> false
    }

    // Keep only entities that literally occur in the text and look like identifiers.
    fun clean(entities: List<Entity>, text: String): List<Entity> {
        val lower = text.lowercase()
        val seen = mutableSetOf<String>()
        val out = mutableListOf<Entity>()
        for (e in entities) {
            val type = if (e.type in TYPES) e.type else "NAME"
            val t = if (e.source == "you") e.text.trim() else tidy(e.text, type)
            if (t.length < 2 || t.length > 120 || KEEP.containsMatchIn(t)) continue
            // Short bare numbers are usually results or ages, unless found under an ID label ("Lab No : 8268").
            if (SHORT_NUMBER.containsMatchIn(t) && t.length < 6 && !(e.source == "pattern" && type == "ID")) continue
            if (e.source != "you" && !plausible(t, type)) continue
            if (!lower.contains(t.lowercase())) continue
            if (!seen.add(t.lowercase())) continue
            out += Entity(t, type, e.source)
        }
        val widened = out.map { withHouseNumber(widenFacility(it, text), text) }
        return dropNested(addAddressParts(addNameParts(widened, text), text), text)
    }

    fun merge(a: List<Entity>, b: List<Entity>, text: String) = clean(a + b, text)

    // "1061 Gandhi Main Road": a house number written just before an address belongs to it.
    private fun withHouseNumber(e: Entity, text: String): Entity {
        if (e.type != "ADDRESS") return e
        val re = Regex("""(?:^|[\s,:])((?:#\s?)?\d[\dA-Za-z/\-]{0,8}[ ,]+)""" + Regex.escape(e.text), setOf(I, RegexOption.MULTILINE))
        val m = re.find(text) ?: return e
        return e.copy(text = m.groupValues[1] + e.text)
    }

    // "CITY DIAGNOSTICS" on the line "CITY DIAGNOSTICS & RESEARCH CENTRE": hide the whole short line.
    private fun widenFacility(e: Entity, text: String): Entity {
        if (e.type != "FACILITY") return e
        val full = text.split("\r\n", "\n").firstOrNull { it.contains(e.text, ignoreCase = true) }?.trim() ?: return e
        val extra = full.lowercase().replaceFirst(e.text.lowercase(), "").trim()
        val ok = extra.isNotEmpty() && words(extra) <= 4 && !hasDigit(extra) && ':' !in extra && words(full) <= 9
        return if (ok) e.copy(text = full) else e
    }

    private fun removeAll(text: String, values: List<String>): String {
        var rest = text
        for (v in values) rest = rest.replace(v, " ", ignoreCase = true)
        return rest
    }

    private fun hasWord(rest: String, w: String) = Regex("\\b" + Regex.escape(w) + "\\b", I).containsMatchIn(rest)

    // Addresses are often split over several lines. Hide each distinctive word of a hidden address
    // wherever it appears, so fragments such as a street or area name cannot leak.
    private fun addAddressParts(entities: List<Entity>, text: String): List<Entity> {
        val rest = removeAll(text, entities.map { it.text })
        val have = entities.map { it.text.lowercase() }.toMutableSet()
        val extra = mutableListOf<Entity>()
        for (e in entities.filter { it.type == "ADDRESS" || it.type == "FACILITY" }) {
            for (part in e.text.split(Regex("""[\s,.:;()/\-]+"""))) {
                if (part.length < 4 || hasDigit(part) || GENERIC_PLACE.containsMatchIn(part) || KEEP.containsMatchIn(part) || part.lowercase() in have) continue
                if (e.type == "FACILITY" && GENERIC_FACILITY.containsMatchIn(part)) continue
                if (hasWord(rest, part)) {
                    have += part.lowercase()
                    extra += Entity(part, e.type, "pattern")
                }
            }
        }
        return entities + extra
    }

    // If "Lakshmi Devi Rao" is hidden, also hide a lone "Lakshmi" elsewhere in the report.
    private fun addNameParts(entities: List<Entity>, text: String): List<Entity> {
        val rest = removeAll(text, entities.map { it.text })
        val have = entities.map { it.text.lowercase() }.toMutableSet()
        val extra = mutableListOf<Entity>()
        for (e in entities.filter { it.type == "NAME" || it.type == "DOCTOR" }) {
            for (part in e.text.split(Regex("""[\s.]+"""))) {
                if (part.length < 3 || TITLES.containsMatchIn(part) || KEEP.containsMatchIn(part) || part.lowercase() in have) continue
                if (hasWord(rest, part)) {
                    have += part.lowercase()
                    extra += Entity(part, e.type, "pattern")
                }
            }
        }
        return entities + extra
    }

    // Drop an item that only ever appears inside a longer hidden item.
    private fun dropNested(entities: List<Entity>, text: String) = entities.filter { e ->
        val parents = entities.filter { it !== e && it.text.length > e.text.length && it.text.contains(e.text, ignoreCase = true) }
        parents.isEmpty() || removeAll(text, parents.map { it.text }).contains(e.text, ignoreCase = true)
    }

    // Replace every identifier with a numbered placeholder such as [NAME_1].
    fun seal(text: String, entities: List<Entity>): Sealed {
        val counters = mutableMapOf<String, Int>()
        val map = linkedMapOf<String, String>()
        val byValue = mutableMapOf<String, String>()
        var sealed = text
        for (e in entities.sortedByDescending { it.text.length }) {
            val ph = byValue.getOrPut(e.text.lowercase()) {
                val n = (counters[e.type] ?: 0) + 1
                counters[e.type] = n
                "[${e.type}_$n]".also { map[it] = e.text }
            }
            val edge = if (Regex("^[A-Za-z0-9_]+$").matches(e.text)) "\\b" else ""
            sealed = sealed.replace(Regex(edge + Regex.escape(e.text) + edge, I), Regex.escapeReplacement(ph))
        }
        return Sealed(sealed, map)
    }

    // Seals a question about the report. Known items keep the placeholder they have in the report, and any
    // part of a hidden name or address ("Rao" from "Lakshmi Devi Rao") is hidden too. Anything new becomes "(hidden)".
    fun sealQuestion(question: String, map: Map<String, String>): String {
        // Whole items come first, so they win over a part of another item with the same text.
        val known = map.map { (ph, original) -> original to ph }.toMutableList()
        for ((ph, original) in map) {
            val place = ph.startsWith("[ADDRESS") || ph.startsWith("[FACILITY")
            if (!place && !ph.startsWith("[NAME") && !ph.startsWith("[DOCTOR")) continue
            for (part in original.split(Regex("""[\s,.:;()/\-]+"""))) {
                val generic = if (place) part.length < 4 || hasDigit(part) || GENERIC_PLACE.containsMatchIn(part) || GENERIC_FACILITY.containsMatchIn(part)
                else part.length < 3 || TITLES.containsMatchIn(part)
                if (!generic && !KEEP.containsMatchIn(part)) known += part to ph
            }
            // Two or more words in a row from a place name identify it, even if each word is common ("City Diagnostics").
            if (place) {
                val w = original.split(SPACES)
                for (i in w.indices) for (j in i + 2..w.size) {
                    val run = w.subList(i, j).joinToString(" ").replace(Regex("^[^A-Za-z0-9_]+|[^A-Za-z0-9_]+$"), "")
                    if (run.length >= 6 && ' ' in run) known += run to ph
                }
            }
        }
        var out = question
        // One private-use character stands in for each placeholder, so nothing can match inside another placeholder.
        val placed = mutableListOf<String>()
        for ((value, ph) in known.sortedByDescending { it.first.length }) {
            val before = if (isWord(value.first())) "\\b" else ""
            val after = if (isWord(value.last())) "\\b" else ""
            out = Regex(before + Regex.escape(value) + after, I).replace(out) { placed += ph; (0xE000 + placed.size - 1).toChar().toString() }
        }
        for (e in findPatternEntities(out).sortedByDescending { it.text.length }) {
            if (e.text.none { it in '\uE000'..'\uF8FF' }) out = out.replace(e.text, "(hidden)", ignoreCase = true)
        }
        return out.map { c -> if (c in '\uE000'..'\uF8FF') placed.getOrElse(c.code - 0xE000) { "" } else c.toString() }.joinToString("")
    }

    // Put the real values back, on this device only, for display.
    fun unseal(text: String, map: Map<String, String>): String {
        var out = text
        for ((ph, original) in map) out = out.replace(ph, original)
        return out
    }

    // Split long reports so each piece fits the on-device model's context window.
    fun chunk(text: String, size: Int): List<String> {
        val parts = mutableListOf<String>()
        var rest = text
        while (rest.length > size) {
            var cut = rest.lastIndexOf('\n', size)
            if (cut < size * 0.5) cut = size
            parts += rest.substring(0, cut)
            rest = rest.substring(cut)
        }
        if (rest.isNotBlank()) parts += rest
        return parts
    }
}
