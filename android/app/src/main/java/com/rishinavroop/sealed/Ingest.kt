package com.rishinavroop.sealed

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.ImageDecoder
import android.graphics.Rect
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import kotlin.math.abs
import kotlin.math.max

// Reads photos and PDFs on the phone. Nothing here uses the network: text recognition is bundled in the app.
object Ingest {
    private const val MAX_SIDE = 2400
    private const val MAX_PAGES = 8
    private val ocr by lazy { TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS) }

    data class Read(val text: String, val byModel: Boolean, val note: String)

    suspend fun readImage(ctx: Context, uri: Uri, ai: Ai?): Read {
        val bmp = withContext(Dispatchers.IO) {
            ImageDecoder.decodeBitmap(ImageDecoder.createSource(ctx.contentResolver, uri)) { d, info, _ ->
                d.allocator = ImageDecoder.ALLOCATOR_SOFTWARE
                d.setTargetSampleSize(max(1, max(info.size.width, info.size.height) / MAX_SIDE))
            }
        }
        val plain = recognise(bmp)
        // The on-device model reads the photo too. Its text is used only when its numbers agree with
        // plain text recognition, so a misread or cut-off result can never change the report.
        val fromModel = if (ai != null) runCatching { ai.transcribe(bmp) }.getOrDefault("") else ""
        return if (fromModel.isNotBlank() && numbersAgree(fromModel, plain)) {
            Read(fromModel, true, "Photo read by the on-device model; its numbers match on-device text recognition")
        } else {
            Read(plain, false, "Photo read by on-device text recognition")
        }
    }

    suspend fun readPdf(ctx: Context, uri: Uri, onPage: (Int, Int) -> Unit): Read {
        val fd = ctx.contentResolver.openFileDescriptor(uri, "r") ?: error("The PDF could not be opened.")
        fd.use {
            PdfRenderer(it).use { pdf ->
                val n = minOf(pdf.pageCount, MAX_PAGES)
                val pages = (0 until n).map { i ->
                    onPage(i + 1, n)
                    recognise(withContext(Dispatchers.IO) { render(pdf, i) })
                }
                val more = if (pdf.pageCount > n) " (first $n of ${pdf.pageCount} pages)" else ""
                return Read(pages.joinToString("\n\n"), false, "PDF read by on-device text recognition$more")
            }
        }
    }

    private fun render(pdf: PdfRenderer, index: Int): Bitmap = pdf.openPage(index).use { page ->
        val scale = MAX_SIDE.toFloat() / max(page.width, page.height)
        Bitmap.createBitmap((page.width * scale).toInt(), (page.height * scale).toInt(), Bitmap.Config.ARGB_8888).also {
            it.eraseColor(Color.WHITE)
            page.render(it, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
        }
    }

    private suspend fun recognise(bmp: Bitmap): String {
        val result = ocr.process(InputImage.fromBitmap(bmp, 0)).await()
        return rows(result.textBlocks.flatMap { it.lines }.mapNotNull { l -> l.boundingBox?.let { Piece(l.text, it) } })
    }

    private class Piece(val text: String, val box: Rect)

    // Text recognition returns table columns as separate blocks. Put pieces at the same height back on one line.
    private fun rows(pieces: List<Piece>): String {
        val rows = mutableListOf<MutableList<Piece>>()
        for (p in pieces.sortedBy { it.box.centerY() }) {
            val row = rows.lastOrNull()
            val mid = row?.map { it.box.centerY() }?.average() ?: 0.0
            if (row != null && abs(p.box.centerY() - mid) < 0.5 * minOf(p.box.height(), row.maxOf { it.box.height() })) row += p
            else rows += mutableListOf(p)
        }
        return rows.joinToString("\n") { r -> r.sortedBy { it.box.left }.joinToString("   ") { it.text } }
    }

    private val NUMBER = Regex("""\d+(?:\.\d+)?""")

    private fun numbersAgree(a: String, b: String): Boolean {
        val x = NUMBER.findAll(a).map { it.value }.toSet()
        val y = NUMBER.findAll(b).map { it.value }.toSet()
        if (x.isEmpty() || y.isEmpty()) return false
        val both = x.intersect(y).size.toDouble()
        return both / x.size >= 0.95 && both / y.size >= 0.9
    }
}
