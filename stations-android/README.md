# Improvement (Android)

Offline Android app for daily tasks, NoFap tracking, a journal and an urge log. It started as
"Stations" (`SPEC.md`); version 2.0 implements the Improvement update spec. Package id stays
`app.stations` so installs update in place.

- **UI**: `assets/` — plain HTML/CSS/JS, fonts bundled, no network.
- **Shell**: `src/app/stations/MainActivity.java` — full-screen WebView, system back handling,
  state persisted as one JSON document in `SharedPreferences` (`StationsStore` JS bridge), and
  dark/light system bars for the lock screen.
- **Icon**: `python3 tools/make_icons.py` (needs Pillow) regenerates `res/mipmap-*/ic_launcher.png`.

## Build

```sh
sudo apt-get install android-sdk-platform-23 aapt dalvik-exchange zipalign apksigner
./build.sh            # -> build/improvement-<version>.apk
```

Signing uses `stations-release.jks` (git-ignored). Keep it: an update must be signed with the same
key or Android refuses to install it over the existing app. `build.sh` stops if the key is missing
rather than silently creating a new one. Override with `STATIONS_KEYSTORE` / `STATIONS_KS_PASS`.

Min Android 6.0 (API 23), target API 34.

## Data

One JSON document (key `state`). 2.0 keeps every 1.x key and adds `journal`, `urges`, `actions`,
`nofapSince`, `security` and the one-time flag `historyResetV2` (the day history was cleared once
when upgrading to 2.0). The lock code is stored only as a salted SHA-256 hash; the unlock flag
lives in memory, so every fresh start of the app asks for the code.

## Behaviour notes

- **Forgotten days**: a day stays open until the end of the next day; older days are closed
  automatically with whatever was ticked.
- **Editing past days**: Days → open a day → "Edit this day" (check-ins and that day's minimum);
  later days are recounted. Changing the minimum in Settings applies from the open day on.
- **Urges**: an urge saved as "relapsed" moves NoFap "clean since" to that day.
