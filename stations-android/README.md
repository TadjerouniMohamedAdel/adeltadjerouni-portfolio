# Stations — daily goals (Android)

Offline Android app built from `SPEC.md` / the `Main.dc.html` prototype: Today · Journey · History · Setup.

- **UI**: `assets/` (plain HTML/CSS/JS, fonts bundled — no network needed).
- **Shell**: `src/app/stations/MainActivity.java` — full-screen WebView, system back handling,
  state persisted as one JSON document in `SharedPreferences` (`StationsStore` JS bridge).
- **Icon**: `python3 tools/make_icons.py` (needs Pillow) regenerates `res/mipmap-*/ic_launcher.png`.

## Build

```sh
sudo apt-get install android-sdk-platform-23 aapt dalvik-exchange zipalign apksigner
./build.sh            # -> build/stations-<version>.apk
```

Signing uses `stations-release.jks` (created on first build, git-ignored). Keep it: an update
must be signed with the same key or Android will refuse to install it over the old version.
Override with `STATIONS_KEYSTORE` / `STATIONS_KS_PASS`.

Min Android 6.0 (API 23), target API 34.

## Decisions on the spec's open questions

- **Forgotten days**: a day stays open until the end of the next day (late check-ins work,
  the Today screen shows "Yesterday"). Anything older is closed automatically with whatever
  was ticked, following the normal rules, and a sheet reports what happened.
  Closing a day early is not possible: once today is closed you can tick tomorrow's goals
  ahead, but tomorrow can only be closed once it starts.
- **Rewards after a reset**: rewards belong to the current run; a reset restarts the route
  (History still shows every counted day).
- **Editing past days**: not allowed; closed days keep a snapshot of the goals.
