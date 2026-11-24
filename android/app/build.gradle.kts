plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("com.google.gms.google-services")
}

android {
    namespace = "com.rishinavroop.sealed"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.rishinavroop.sealed"
        minSdk = 28 // firebase-ai-ondevice needs 26; ImageDecoder needs 28
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"
        ndk { abiFilters += listOf("arm64-v8a", "x86_64") } // phones and emulators; keeps the APK small
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            // For sharing an APK with testers. Not a Play Store signing key.
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    // The same tests run on the JVM and on a phone (Android has a different regex engine).
    sourceSets {
        getByName("test") { java.srcDir("src/sharedTest/java"); resources.srcDir("src/sharedTest/resources") }
        getByName("androidTest") { java.srcDir("src/sharedTest/java"); resources.srcDir("src/sharedTest/resources") }
    }
    buildFeatures { compose = true; buildConfig = true }
}

kotlin {
    compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) }
}

dependencies {
    // Firebase AI Logic: cloud + on-device (Gemini Nano through ML Kit Prompt API).
    // The on-device SDK is not in the Firebase BoM yet, so versions are pinned.
    implementation("com.google.firebase:firebase-ai:18.2.0")
    implementation("com.google.firebase:firebase-ai-ondevice:16.0.0-beta08")

    implementation(platform("com.google.firebase:firebase-bom:35.2.0"))
    implementation("com.google.firebase:firebase-appcheck-debug")
    implementation("com.google.firebase:firebase-appcheck-playintegrity")
    implementation("com.google.firebase:firebase-config")

    // On-device text recognition, bundled in the app, for photos and PDFs on any phone.
    implementation("com.google.mlkit:text-recognition:16.0.1")

    implementation(platform("androidx.compose:compose-bom:2025.09.00"))
    implementation("androidx.activity:activity-compose:1.10.1")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.9.2")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.10.2")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.json:json:20250517")
    androidTestImplementation("androidx.test:runner:1.7.0")
    androidTestImplementation("androidx.test.ext:junit:1.3.0")
}
