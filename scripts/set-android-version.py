# Play Store har upload par bada versionCode maangta hai: GitHub run number use hota hai
import glob
import re
import sys

run = sys.argv[1]
done = False
for path in glob.glob("android/app/build.gradle*"):
    s = open(path, encoding="utf-8").read()
    s2 = re.sub(r"(versionCode\s*=?\s*)\d+", lambda m: m.group(1) + run, s)
    s2 = re.sub(r'(versionName\s*=?\s*)"[^"]*"', lambda m: m.group(1) + f'"1.0.{run}"', s2)
    if s2 != s:
        open(path, "w", encoding="utf-8").write(s2)
        print(f"{path}: versionCode={run}, versionName=1.0.{run}")
        done = True
if not done:
    print("WARNING: versionCode/versionName pattern not found; default version use hoga")
