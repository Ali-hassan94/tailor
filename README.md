# Shan Tailor – Android APK (Supabase + Offline)

## 1) Supabase setup (ek dafa)
1. Supabase Dashboard > **SQL Editor** > `supabase/setup.sql` ka poora content paste karo > **Run**.
2. **Authentication > Providers > Email** mein **Confirm email = OFF** karo (warna register ke baad login nahi hoga).
3. **Project Settings > API** se **anon / publishable key** copy karo.
4. App mein register karo, phir SQL Editor mein apne account ko admin (tailor) banao:
   `update public.profiles set role = 'tailor' where email = 'tumhari_email';`

## 2) GitHub se APK banana
1. Is folder ka sara content GitHub repo ke **root** mein upload/push karo.
2. Repo > **Settings > Secrets and variables > Actions > New repository secret**
   - `VITE_SUPABASE_ANON_KEY` = Supabase anon key
   - (optional) `VITE_SUPABASE_URL` = `https://kjrkprduhjedwzfnwiso.supabase.co`
3. **Actions** tab > **Build Android APK** > **Run workflow**.
4. Khatam hone par run page ke neeche **Artifacts > Shan-Tailor-APK** download karo, unzip karo, `app-debug.apk` phone mein install karo.

## Offline
- Pehli dafa login/register ke liye internet chahiye. Uske baad app offline khulti hai.
- Offline mein order/booking/measurement save hoti hain (phone mein), internet aate hi Supabase par apne aap chali jati hain.
- Dashboard offline mein last synced data dikhata hai.

## Zaroori
- Database **password app mein nahi** dalna. App sirf Project URL + anon key use karti hai.
- Purane `.env` (MongoDB URL, JWT secret) GitHub par upload mat karna; woh passwords badal do.
