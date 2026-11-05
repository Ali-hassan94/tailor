# FREE tareeqa (Play Store ke baghair)
1. Neeche "1) Upload key banana" aur "2) GitHub Secrets" wale qadam karein (JDK free hai).
2. GitHub > Actions > **Release APK (free download link)** > Run workflow.
3. Khatam hone par aap ka link: https://github.com/Ali-hassan94/tailor/releases/latest/download/Shan-Tailor.apk
4. Settings > Pages ko `main` / `/docs` par lagayein, to customers ke liye download page milega: https://ali-hassan94.github.io/tailor/
5. Ye link WhatsApp par bhej dein. Customer APK download karke install karta hai.

# Google Play par Shan Tailor daalne ka tareeqa (jab $25 ho jayein)

## 0) Pehle (ek dafa)
1. Debug APK (Build Android APK) naye Capacitor 8 ke saath chalayein aur phone par test karein ke sab theek hai.
2. Supabase SQL Editor mein `supabase/update_v9.sql` Run karein (account delete).
3. `docs/privacy-policy.html` aur `docs/delete-account.html` mein `[SHOP EMAIL YAHAN LIKHEIN]` aur `[SHOP PHONE YAHAN LIKHEIN]` apni details se badlein.
4. GitHub repo > Settings > Pages > "Deploy from a branch" > branch `main`, folder `/docs`. Link: https://ali-hassan94.github.io/tailor/privacy-policy.html

## 1) Upload key banana (ek dafa, bohat zaroori)
PowerShell:
```
winget install EclipseAdoptium.Temurin.21.JDK
```
PowerShell band karke dobara kholein, phir:
```
cd $HOME\Documents
keytool -genkeypair -v -keystore shan-tailor-upload.jks -alias shantailor -keyalg RSA -keysize 2048 -validity 10000
```
Password do baar poochega. Key password poochay to **Enter** dabayein (wahi password rahega). Is file aur password ka backup rakhein (Drive + USB). Kisi ko na dein, GitHub repo mein na daalein.

Base64 copy karein:
```
[Convert]::ToBase64String([IO.File]::ReadAllBytes("$HOME\Documents\shan-tailor-upload.jks")) | Set-Clipboard
```

## 2) GitHub Secrets (Settings > Secrets and variables > Actions)
- `ANDROID_KEYSTORE_BASE64` = jo abhi copy kiya
- `KEYSTORE_PASSWORD` = keystore ka password
- `KEY_ALIAS` = `shantailor`
- `KEY_PASSWORD` = wahi password (same)
- (pehle se hain) `VITE_SUPABASE_ANON_KEY`

## 3) AAB banana
Actions > **Build Play Store AAB** > Run workflow. Khatam hone par artifact `Shan-Tailor-PlayStore-AAB` download karein (zip ke andar `app-release.aab`).

## 4) Play Console
1. https://play.google.com/console par developer account banayein (ek dafa $25).
2. Create app: naam Shan Tailor, Free, App (game nahi).
3. Store listing: `store-assets/store-listing.txt` se text, `icon-512.png`, `feature-graphic-1024x500.png`, aur phone se kam az kam 2 screenshots.
4. App content: Privacy policy URL, Account deletion URL, Ads = No, Content rating questionnaire, Target audience (18+), Data safety (name, email, phone, photos, orders collect hote hain; encrypted in transit; user delete kar sakta hai).
5. App access: login zaroori hai, isliye Google reviewers ke liye ek **demo user account** (email + password) likhein. Supabase mein alag account register karke dein.
6. Testing > Closed testing: AAB upload karein, 12+ testers ki email list daalein. Naye personal account par 12 testers ko 14 din tak lagataar opt-in rehna hota hai, phir "Apply for production".
7. Production release.

Har naye release par Actions mein dobara "Build Play Store AAB" chalayein; versionCode khud barhta hai.
