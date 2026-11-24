package com.rishinavroop.sealed

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import java.util.Locale

// Reads text aloud with the phone's own voices.
class Voice(private val context: Context) {
    private val codes = mapOf("English" to "en", "Hindi" to "hi", "Telugu" to "te", "Tamil" to "ta", "Kannada" to "kn", "Malayalam" to "ml", "Marathi" to "mr", "Bengali" to "bn", "Gujarati" to "gu")
    private val main = Handler(Looper.getMainLooper())
    private var tts: TextToSpeech? = null

    fun speak(text: String, language: String, onDone: () -> Unit, onMissing: () -> Unit) {
        close()
        var engine: TextToSpeech? = null
        engine = TextToSpeech(context) { status ->
            main.post {
                val t = engine
                val locale = Locale.Builder().setLanguage(codes[language] ?: "en").setRegion("IN").build()
                if (status != TextToSpeech.SUCCESS || t == null || t.setLanguage(locale) < TextToSpeech.LANG_AVAILABLE) {
                    onMissing()
                } else {
                    t.setSpeechRate(0.92f)
                    val parts = text.split("\n").flatMap { it.chunked(TextToSpeech.getMaxSpeechInputLength() - 1) }.filter { it.isNotBlank() }
                    t.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                        override fun onStart(id: String?) {}
                        override fun onDone(id: String?) { if (id == "${parts.size - 1}") main.post { onDone() } }
                        @Deprecated("Deprecated in Java")
                        override fun onError(id: String?) { main.post { onDone() } }
                    })
                    parts.forEachIndexed { i, p -> t.speak(p, if (i == 0) TextToSpeech.QUEUE_FLUSH else TextToSpeech.QUEUE_ADD, null, "$i") }
                }
            }
        }
        tts = engine
    }

    fun stop() { tts?.stop() }

    fun close() {
        tts?.shutdown()
        tts = null
    }
}
