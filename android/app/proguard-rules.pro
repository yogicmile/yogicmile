# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Keep Capacitor Core
-keep class com.getcapacitor.** { *; }
-keepclassmembers class * {
    @com.getcapacitor.* <methods>;
}

# Keep WebView
-keep class org.webkit.** { *; }
-keep class android.webkit.** { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep native libraries (CRITICAL for step tracking)
-keep class **.R
-keep class **.R$* {
    <fields>;
}

# Keep AndroidX
-keep class androidx.** { *; }
-keep interface androidx.** { *; }

# Keep Google Play Services
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Keep Kotlin
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**

# Keep custom native plugins
-keep class app.lovable.yogicmile.steps.** { *; }
-keep class app.lovable.yogicmile.MainActivity { *; }

# Don't obfuscate native library names
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes SourceFile,LineNumberTable
