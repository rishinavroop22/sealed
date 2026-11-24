package com.rishinavroop.sealed

import android.content.Context
import android.util.Base64
import com.google.firebase.Firebase
import com.google.firebase.auth.auth
import com.google.firebase.firestore.CollectionReference
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestoreException
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.QuerySnapshot
import com.google.firebase.firestore.Source
import com.google.firebase.firestore.firestore
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withTimeoutOrNull
import org.json.JSONArray
import org.json.JSONObject

data class Person(val id: String, val name: String)
data class Invite(val family: String, val people: List<Person>)

// Sign-in and saved history, in the same format as web/js/store.js.
// Firestore stores ONLY sealed text. Names, and the key that restores them, stay in this app's private storage.
class Store(context: Context) {
    private val prefs = context.getSharedPreferences("sealed", Context.MODE_PRIVATE)
    private val db = Firebase.firestore

    // Anonymous: a private account with no name or email.
    private suspend fun uid(): String {
        Firebase.auth.currentUser?.let { return it.uid }
        return withTimeoutOrNull(10_000) { Firebase.auth.signInAnonymously().await().user?.uid }
            ?: error("Connect to the internet once to turn on saving.")
    }

    // ---------- people: names are kept only on this phone ----------
    fun people(): List<Person> = runCatching {
        val a = JSONArray(prefs.getString("people", "[]"))
        (0 until a.length()).map { a.getJSONObject(it).let { p -> Person(p.getString("id"), p.getString("name")) } }
    }.getOrDefault(emptyList()).ifEmpty { listOf(Person("me", "Me")) }

    private fun writePeople(list: List<Person>) {
        val a = JSONArray()
        list.forEach { a.put(JSONObject().put("id", it.id).put("name", it.name)) }
        prefs.edit().putString("people", a.toString()).apply()
    }

    fun addPerson(name: String): Person {
        val chars = "abcdefghijklmnopqrstuvwxyz0123456789"
        val p = Person("p" + (1..4).map { chars.random() }.joinToString(""), name.trim().take(30))
        writePeople(people() + p)
        return p
    }

    // ---------- the key that restores names, per report ----------
    private fun keys() = runCatching { JSONObject(prefs.getString("keys", "{}")!!) }.getOrDefault(JSONObject())
    fun keyFor(id: String): Map<String, String> =
        keys().optJSONObject(id)?.let { o -> o.keys().asSequence().associateWith { o.getString(it) } }.orEmpty()

    // ---------- reports ----------
    val family: String? get() = prefs.getString("family", null)
    private fun own(uid: String) = db.collection("users").document(uid).collection("reports")
    private fun shared(id: String) = db.collection("families").document(id).collection("reports")
    private fun reports(uid: String): CollectionReference = family?.let { shared(it) } ?: own(uid)

    suspend fun save(r: Saved, map: Map<String, String>) {
        val ref = reports(uid()).document()
        prefs.edit().putString("keys", keys().put(ref.id, JSONObject(map)).toString()).apply()
        val write = ref.set(
            mapOf(
                "sealed" to r.sealed,
                "explanation" to (r.explanation?.let { ModelJson.write(it) } ?: "null"),
                "where" to r.where, "language" to r.language, "hidden" to r.hidden,
                "profile" to r.profile, "month" to r.month,
                "results" to r.results.map { mapOf("test" to it.test, "value" to it.value, "reference" to it.reference) },
                "createdAt" to FieldValue.serverTimestamp(),
            ),
        )
        withTimeoutOrNull(8000) { write.await() } // offline: kept on the phone and sent later
    }

    suspend fun list(): List<Saved> {
        val uid = uid()
        val snap = try {
            read(reports(uid))
        } catch (e: FirebaseFirestoreException) {
            if (family == null || e.code != FirebaseFirestoreException.Code.PERMISSION_DENIED) throw e
            prefs.edit().remove("family").apply() // this phone was removed from the shared timeline
            read(reports(uid))
        }
        return snap.documents.map { d ->
            val rows = (d.get("results") as? List<*>).orEmpty().mapNotNull { it as? Map<*, *> }
            Saved(
                id = d.id, profile = d.getString("profile") ?: "me", month = d.getString("month").orEmpty(),
                results = rows.map { Finding("${it["test"] ?: ""}", "${it["value"] ?: ""}", "${it["reference"] ?: ""}") },
                sealed = d.getString("sealed").orEmpty(),
                explanation = d.getString("explanation")?.let { ModelJson.explanation(it) },
                where = d.getString("where") ?: "cloud", language = d.getString("language") ?: "English",
                hidden = (d.getLong("hidden") ?: 0L).toInt(),
            )
        }
    }

    private suspend fun read(c: CollectionReference): QuerySnapshot {
        val q = c.orderBy("createdAt", Query.Direction.DESCENDING).limit(100)
        return withTimeoutOrNull(8000) { q.get().await() } ?: q.get(Source.CACHE).await()
    }

    suspend fun delete(id: String) {
        val task = reports(uid()).document(id).delete()
        prefs.edit().putString("keys", keys().apply { remove(id) }.toString()).apply()
        withTimeoutOrNull(8000) { task.await() }
    }

    // ---------- family link ----------
    // The code holds an unguessable id and the family's names. Names are read here and never sent.
    fun readInvite(text: String): Invite? = runCatching {
        val code = Regex("""(?:[#?&](?:join|d)=)?([A-Za-z0-9_\-]{40,})\s*$""").find(text.trim())!!.groupValues[1]
        val o = JSONObject(String(Base64.decode(code, Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP), Charsets.UTF_8))
        val id = o.getString("f")
        require(Regex("^[0-9a-f]{32}$").matches(id))
        val a = o.getJSONArray("p")
        val list = (0 until a.length()).map { a.getJSONObject(it) }
            .filter { Regex("^[a-z0-9]{1,8}$").matches(it.getString("id")) }
            .map { Person(it.getString("id"), it.getString("name").take(30)) }
        Invite(id, list)
    }.getOrNull()

    suspend fun join(invite: Invite) {
        val uid = uid()
        db.collection("families").document(invite.family).collection("members").document(uid)
            .set(mapOf("joinedAt" to FieldValue.serverTimestamp())).await()
        val mine = own(uid).get().await().documents
        for (part in mine.chunked(100)) {
            val batch = db.batch()
            part.forEach { d ->
                batch.set(shared(invite.family).document(d.id), d.data.orEmpty())
                batch.delete(d.reference)
            }
            batch.commit().await()
        }
        prefs.edit().putString("family", invite.family).apply()
        writePeople(invite.people + people().filter { p -> invite.people.none { it.id == p.id } })
    }

    // Stops sharing on this phone. The shared timeline stays on the other devices.
    suspend fun leave() {
        val id = family ?: return
        val uid = uid()
        withTimeoutOrNull(8000) { runCatching { db.collection("families").document(id).collection("members").document(uid).delete().await() } }
        prefs.edit().remove("family").apply()
    }
}
