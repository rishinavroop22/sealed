plugins {
    id("com.android.application") version "8.12.0" apply false
    id("org.jetbrains.kotlin.android") version "2.4.0" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.4.0" apply false
    id("com.google.gms.google-services") version "4.4.3" apply false
}

// Optional: a line "sealed.buildDir=C:/some/folder" in local.properties moves build output there.
// Useful when the project sits in a synced folder (OneDrive) or a path with non-English letters.
val localProps = java.util.Properties().apply {
    val f = rootProject.file("local.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}
localProps.getProperty("sealed.buildDir")?.let { dir ->
    allprojects { layout.buildDirectory.set(file("$dir/${if (path == ":") "root" else name}")) }
}
