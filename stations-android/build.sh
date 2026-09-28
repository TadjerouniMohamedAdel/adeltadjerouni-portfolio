#!/usr/bin/env bash
# Builds a signed release APK without Gradle, using Ubuntu's Android SDK packages:
#   sudo apt-get install android-sdk-platform-23 aapt dalvik-exchange zipalign apksigner
# Output: build/stations-<version>.apk
# Signing key: $STATIONS_KEYSTORE (default: ./stations-release.jks, created if missing).
set -euo pipefail
cd "$(dirname "$0")"

ANDROID_JAR=${ANDROID_JAR:-/usr/lib/android-sdk/platforms/android-23/android.jar}
KEYSTORE=${STATIONS_KEYSTORE:-stations-release.jks}
KS_PASS=${STATIONS_KS_PASS:-stations}
VERSION=$(sed -n 's/.*android:versionName="\([^"]*\)".*/\1/p' AndroidManifest.xml)

rm -rf build && mkdir -p build/gen build/classes build/dex

aapt package -f -m -J build/gen -M AndroidManifest.xml -S res -I "$ANDROID_JAR"

javac -nowarn -Xlint:-options -source 8 -target 8 -encoding UTF-8 \
  -bootclasspath "$ANDROID_JAR" -d build/classes \
  $(find src build/gen -name '*.java')

dalvik-exchange --dex --min-sdk-version=23 --output=build/dex/classes.dex build/classes

aapt package -f -M AndroidManifest.xml -S res -A assets -I "$ANDROID_JAR" \
  -F build/unaligned.apk build/dex

zipalign -f -p 4 build/unaligned.apk build/aligned.apk

if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -keystore "$KEYSTORE" -storepass "$KS_PASS" -keypass "$KS_PASS" \
    -alias stations -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Stations, O=Stations, C=DZ" >/dev/null 2>&1
  echo "Created signing key $KEYSTORE (keep it: updates must be signed with the same key)"
fi

apksigner sign --ks "$KEYSTORE" --ks-pass "pass:$KS_PASS" --ks-key-alias stations \
  --min-sdk-version 23 --out "build/stations-$VERSION.apk" build/aligned.apk
apksigner verify --min-sdk-version 23 "build/stations-$VERSION.apk"
rm -f build/unaligned.apk build/aligned.apk build/*.idsig
echo "Built build/stations-$VERSION.apk"
