package com.rishinavroop.sealed

import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

// The Kotlin sealing and range-check code must match the web app's code (see android/parity.mjs).
// Runs both on the JVM and on a phone, because Android uses a different regular-expression engine.
class ParityTest {
    private val golden = JSONObject(ParityTest::class.java.classLoader!!.getResource("parity.json")!!.readText())
    private fun JSONArray.objects() = (0 until length()).map { getJSONObject(it) }
    private fun JSONArray.entities() = objects().map { Entity(it.getString("text"), it.getString("type"), it.optString("source", "model")) }

    @Test fun sealsExactlyLikeTheWebApp() {
        val model = golden.getJSONArray("model").entities()
        for (r in golden.getJSONArray("reports").objects()) {
            val text = r.getString("text")
            val found = Redactor.findPatternEntities(text)
            assertEquals(r.getJSONArray("pattern").entities(), found)
            val merged = Redactor.merge(found, model, text)
            assertEquals(r.getJSONArray("merged").entities(), merged)
            val sealed = Redactor.seal(text, merged)
            assertEquals(r.getString("sealed"), sealed.text)
            val map = r.getJSONObject("map")
            assertEquals(map.keys().asSequence().associateWith { map.getString(it) }, sealed.map)
        }
    }

    @Test fun readsResultsLikeTheWebApp() {
        for (r in golden.getJSONArray("reports").objects()) {
            val parsed = Health.quickParse(r.getString("text"))
            assertEquals(
                r.getJSONArray("parsed").objects().map { Finding(it.getString("test"), it.getString("value"), it.getString("reference")) },
                parsed,
            )
            val keys = r.getJSONArray("keys")
            assertEquals((0 until keys.length()).map { keys.getString(it) }, parsed.map { Health.normaliseTest(it.test) })
            assertEquals(
                r.getJSONArray("critical").objects().map { Critical(it.getString("test"), it.getString("value"), it.getString("why")) },
                Health.criticalFindings(parsed),
            )
        }
    }

    @Test fun checksRangesLikeTheWebApp() {
        for (r in golden.getJSONArray("ranges").objects()) {
            val expected = if (r.isNull("status")) null else r.getString("status")
            assertEquals(r.toString(), expected, Health.rangeStatus(r.getString("value"), r.getString("reference")))
        }
    }

    @Test fun sealsQuestionsLikeTheWebApp() {
        val text = golden.getJSONArray("reports").getJSONObject(0).getString("text")
        val map = Redactor.seal(text, Redactor.merge(Redactor.findPatternEntities(text), golden.getJSONArray("model").entities(), text)).map
        for (q in golden.getJSONArray("questions").objects()) {
            val sealed = Redactor.sealQuestion(q.getString("q"), map)
            assertEquals(q.getString("sealed"), sealed)
            assertFalse(sealed, Regex("lakshmi|rao|menon|98480", RegexOption.IGNORE_CASE).containsMatchIn(sealed))
        }
    }

    @Test fun checksTheModelLikeTheWebApp() {
        val g = golden.getJSONObject("findings")
        fun read(a: JSONArray) = a.objects().map { Finding(it.getString("test"), it.getString("value"), it.getString("reference"), it.getString("status"), it.getString("meaning")) }
        val text = golden.getJSONArray("reports").getJSONObject(0).getString("text")
        val (matched, fixed) = Health.reconcile(read(g.getJSONArray("input")), Health.fromCode(text))
        val (out, corrected) = Health.check(matched)
        assertEquals(g.getInt("fixed"), fixed)
        assertEquals(g.getInt("corrected"), corrected)
        assertEquals(read(g.getJSONArray("output")), out.map { it.copy(corrected = false) })
        assertEquals(g.getString("count"), Health.countLine(out))
    }

    @Test fun labelsComeFromCodeNotTheModel() {
        val (out, corrected) = Health.check(listOf(
            Finding("TSH", "6.9", "0.4 - 4.0", "normal", "fine"),
            Finding("Hb", "13", "Male: 13 - 17 Female: 12 - 15", "high", "bad"),
            Finding("Sodium", "139", "135 - 145", "normal", "in range"),
        ))
        assertEquals(listOf("high", "unclear", "normal"), out.map { it.status })
        assertEquals(1, corrected)
        assertEquals("in range", out[2].meaning)
        assertFalse(out[1].meaning.contains("bad"))
    }

    @Test fun neverPicksOneRangeWhenMenAndWomenDiffer() {
        val f = Health.fromCode("Haemoglobin 12.5 g/dL Male: 13 - 17 Female: 12 - 15\nTSH 6.9 uIU/mL 0.4 - 4.0")
        assertEquals(listOf("unclear", "high"), f.map { it.status })
    }

    @Test fun replacesNumbersTheModelCopiedWrongly() {
        val report = Health.fromCode("TSH 6.9 uIU/mL 0.4 - 4.0\nSodium 139 mmol/L 135 - 145")
        val (out, fixed) = Health.reconcile(listOf(
            Finding("TSH", "2.9 uIU/mL", "0.4 - 4.0", "normal", "fine"),
            Finding("Sodium", "139 mmol/L", "135-145", "normal", "fine"),
            Finding("Extra", "5", "1 - 9", "normal", "kept"),
        ), report)
        assertEquals(1, fixed)
        assertEquals("6.9 uIU/mL", out[0].value)
        assertEquals("fine", out[1].meaning)
        assertEquals("1 of 3 results outside the range printed on the report.", Health.countLine(Health.check(out).first))
    }

    @Test fun hidesPartsOfKnownNamesInQuestions() {
        val map = linkedMapOf("[NAME_1]" to "Mrs. Lakshmi Devi Rao", "[NAME_2]" to "Lakshmi", "[DOCTOR_1]" to "Dr. Arvind Menon", "[ADDRESS_1]" to "Road No. 12, Banjara Hills, Hyderabad 500034", "[ID_1]" to "HYD/2291/88")
        fun q(t: String) = Redactor.sealQuestion(t, map)
        assertEquals("Is [NAME_2] [NAME_1] TSH high? Call (hidden)", q("Is Lakshmi Rao TSH high? Call 9848012345"))
        assertEquals("Should [NAME_1] see [DOCTOR_1] in [ADDRESS_1]?", q("Should mrs. lakshmi devi rao see menon in Hyderabad?"))
        assertEquals("What does [ID_1] mean?", q("What does HYD/2291/88 mean?"))
        assertEquals("Is my TSH of 6.9 high?", q("Is my TSH of 6.9 high?"))
    }

    @Test fun readsEntitiesFromCutOffModelOutput() {
        val raw = "```json\n{\"entities\":[{\"text\":\"Asha Rao\",\"type\":\"NAME\"},{\"text\":\"Dr. B\",\"type\":\"DOCTOR\"},{\"text\":\"cut o"
        assertEquals(listOf("Asha Rao", "Dr. B"), ModelJson.entities(raw).map { it.text })
    }

    @Test fun rejectsModelTextThatIsNotJson() {
        assertTrue(ModelJson.explanation("The report looks fine.") == null)
        assertTrue(ModelJson.explanation("{\"summary\":\"ok\",\"findings\":[{\"test\":\"TSH\",\"value\":\"6.9\",") == null)
        assertEquals("ok", ModelJson.explanation("```json\n{\"summary\":\"ok\",\"findings\":[],\"questions\":[\"a?\"]}\n```")!!.summary)
    }
}
