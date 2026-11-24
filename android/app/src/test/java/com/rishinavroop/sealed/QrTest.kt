package com.rishinavroop.sealed

import com.google.zxing.common.BitMatrix
import com.google.zxing.qrcode.decoder.Decoder
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Test

// Reads the web app's own QR codes (web/js/qr.js) with a standard reader.
class QrTest {
    @Test fun aStandardReaderReadsTheWebAppsCodes() {
        val codes = JSONObject(QrTest::class.java.classLoader!!.getResource("parity.json")!!.readText()).getJSONArray("qr")
        for (i in 0 until codes.length()) {
            val c = codes.getJSONObject(i)
            val rows = c.getJSONArray("rows")
            val m = BitMatrix(rows.length())
            for (y in 0 until rows.length()) rows.getString(y).forEachIndexed { x, v -> if (v == '1') m.set(x, y) }
            assertEquals(c.getString("text"), Decoder().decode(m, mapOf(com.google.zxing.DecodeHintType.CHARACTER_SET to "UTF-8")).text)
        }
    }
}
