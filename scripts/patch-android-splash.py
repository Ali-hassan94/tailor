# Android 12+ ka chhota/blurry icon wala splash band karta hai (black background, khali icon).
# Poora saaf poster app ke andar (SplashOverlay) dikhta hai.
import os
import re

res = "android/app/src/main/res"
os.makedirs(f"{res}/drawable", exist_ok=True)

with open(f"{res}/drawable/splash_icon_empty.xml", "w") as f:
    f.write(
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<vector xmlns:android="http://schemas.android.com/apk/res/android"\n'
        '    android:width="24dp" android:height="24dp"\n'
        '    android:viewportWidth="24" android:viewportHeight="24">\n'
        '    <path android:fillColor="#00000000" android:pathData="M0,0h1v1h-1z"/>\n'
        "</vector>\n"
    )

path = f"{res}/values/styles.xml"
s = open(path, encoding="utf-8").read()
m = re.search(
    r'<style name="AppTheme\.NoActionBarLaunch"[^>]*parent="([^"]*)"[^>]*>.*?</style>',
    s,
    re.S,
)
if m and "SplashScreen" in m.group(1):
    new = (
        '<style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">\n'
        '        <item name="windowSplashScreenBackground">#0A0A0A</item>\n'
        '        <item name="windowSplashScreenAnimatedIcon">@drawable/splash_icon_empty</item>\n'
        '        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>\n'
        "    </style>"
    )
    s = s[: m.start()] + new + s[m.end():]
    open(path, "w", encoding="utf-8").write(s)
    print("Splash theme patched")
else:
    print("WARNING: launch theme not found or not SplashScreen based; skipped")
