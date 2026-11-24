package com.rishinavroop.sealed

import org.json.JSONObject

data class Explanation(
    val summary: String,
    val urgent: String = "",
    val findings: List<Finding> = emptyList(),
    val questions: List<String> = emptyList(),
)

// Tolerant readers for model output.
object ModelJson {
    private fun objectIn(raw: String): JSONObject? {
        val i = raw.indexOf('{')
        val j = raw.lastIndexOf('}')
        return if (i in 0 until j) runCatching { JSONObject(raw.substring(i, j + 1)) }.getOrNull() else null
    }

    private val ITEM = Regex("""\{[^{}]*\}""")

    // Reads each {"text","type"} object on its own, so an answer cut off by the output limit still counts.
    fun entities(raw: String): List<Entity> = ITEM.findAll(raw).mapNotNull { m ->
        val o = runCatching { JSONObject(m.value) }.getOrNull() ?: return@mapNotNull null
        val text = o.optString("text")
        if (text.isBlank()) null else Entity(text, o.optString("type").uppercase(), "model")
    }.toList()

    fun explanation(raw: String): Explanation? {
        val o = objectIn(raw) ?: return null
        if (!o.has("summary")) return null
        val f = o.optJSONArray("findings")
        val q = o.optJSONArray("questions")
        return Explanation(
            summary = o.optString("summary"),
            urgent = o.optString("urgent"),
            findings = (0 until (f?.length() ?: 0)).mapNotNull { f!!.optJSONObject(it) }.map {
                Finding(it.optString("test"), it.optString("value"), it.optString("reference"), it.optString("status").lowercase(), it.optString("meaning"))
            },
            questions = (0 until (q?.length() ?: 0)).map { q!!.optString(it) }.filter { it.isNotBlank() },
        )
    }
}
