# IQ Level Uz — Firebase bilan ulangan, GitHub'ga joylash qo'llanmasi

## Nima o'zgardi

1. **Firebase Firestore ulandi** (`src/firebase.ts`) — skrinshotdagi haqiqiy
   loyiha konfiguratsiyasi (`iqbot-c1b8c`) bilan.
2. **Real, umumiy statistika** (`src/services/cloud.ts`):
   - `users` — har bir real foydalanuvchining profili (Telegram ID bo'yicha),
     abadiy eslab qolinadi.
   - `duels` — faqat haqiqatan bo'lib o'tgan duellar.
   - `stats/global` — saytdagi umumiy hisoblagichlar
     (`totalUsers`, `totalTestsCompleted`, `totalDuels`, `totalGamesPlayed`).
   Bularning barchasi **yangi Firebase loyihada 0 dan boshlanadi** va faqat
   haqiqiy harakatlardan o'sadi.
3. **Soxta/qattiq yozilgan raqamlar olib tashlandi**: admin paneldagi
   `+18` baza, qattiq yozilgan `"8 kishi"`, va boshlang'ich soxta duel
   ro'yxati (`INITIAL_RECENT_DUELS`).
4. Yangi ro'yxatdan o'tgan foydalanuvchi endi **haqiqatan 0 dan** boshlaydi
   (XP: 0, tanga: 0, darajasi: 1, nishonlar: yo'q).
5. `index.html` ga Telegram WebApp skripti qo'shildi — shu orqali app real
   Telegram foydalanuvchi ID'sini oladi va uni **doim eslab qoladi**
   (qurilma/sessiya almashsa ham).
6. **"1v1 Onlayn Duel" endi TO'LIQ HAQIQIY** (`src/services/duel.ts`):
   avvalgi versiyada raqib `Math.random()` bilan simulyatsiya qilingan bot
   edi. Endi ikkala tomon ham **haqiqiy, real foydalanuvchi**:
   - "Duel" bo'limiga kirgan foydalanuvchi Firestore'dagi haqiqiy "kutish
     xonasi"ga (`duelQueue`) yoziladi;
   - o'sha payt navbatda turgan boshqa real foydalanuvchi bilan **Firestore
     tranzaksiyasi** orqali xavfsiz moslashtiriladi (ikkita qurilma bir xil
     odamni bir vaqtda "band qilib olishi" mumkin emas);
   - 5 ta savol, ikkala tomonning javoblari va vaqtlari `matches` to'plamida
     real vaqtda sinxronlanadi — har ikkala telefon/brauzer bir xil
     savolni, bir xil vaqt bilan ko'radi;
   - g'alaba/mag'lubiyat, ball va Elo reyting o'zgarishi **shu ikki real
     odamning haqiqiy javoblaridan** hisoblanadi, hech qanday sun'iy/bot
     natija yo'q;
   - duel yakunida yagona haqiqiy yozuv `duels` to'plamiga va `totalDuels`
     hisoblagichiga **faqat bir marta** (tranzaksiya himoyasi bilan)
     yoziladi — ikkala qurilma ham ikki marta yozib qo'ymaydi.

   ⚠️ **Muhim cheklov**: bu — real 2 kishilik duel, shuning uchun ishlashi
   uchun **bir vaqtning o'zida kamida 2 ta real foydalanuvchi** "Duel"
   bo'limida bo'lishi kerak (masalan, 2 ta turli telefon yoki 2 ta brauzer
   oynasi bilan sinab ko'ring). Agar 25 soniya ichida raqib topilmasa, ekran
   "Hozircha faol raqib topilmadi — qayta urinish" xabarini ko'rsatadi.
   Agar raqib duel davomida ilovani yopib qo'ysa, uning javoblari shunchaki
   "javob berilmadi" (0 ball) deb hisoblanadi — bu keyingi versiyalarda
   yaxshilash mumkin bo'lgan joy.
7. **"Reyting" (Leaderboard) bo'limidagi 50 ta soxta, qo'lda yozilgan
   o'yinchi butunlay olib tashlandi** (`Sherzodbek_Genius`, `Zilola_AI` va
   h.k. — bular hech qachon mavjud bo'lmagan odamlar edi). Endi bu bo'lim
   `usersList`'ni, ya'ni haqiqiy `users` Firestore to'plamini ko'rsatadi:
   - reyting real IQ balliga qarab hisoblanadi;
   - "Siz"ning real o'rningiz ro'yxat ichidan qidirib topiladi (soxta
     if/else zinapoya emas);
   - hali hech kim test topshirmagan bo'lsa, ro'yxat **bo'sh** ko'rsatiladi
     ("Hali hech kim IQ testini yakunlamagan..."), 50 ta soxta odam bilan
     to'ldirilmaydi;
   - Top-3 sovg'alar matni endi admin panelidagi haqiqiy
     `weeklyPrizes` sozlamasidan olinadi, qattiq yozilgan emas.

## 1-qadam: Firestore'ni yoqish

1. https://console.firebase.google.com/project/iqbot-c1b8c → **Firestore Database** → **Create database** (agar hali yaratilmagan bo'lsa) → "Start in production mode".
2. **Rules** bo'limiga o'ting, loyihadagi `firestore.rules` faylining
   matnini nusxalab, **Publish** tugmasini bosing. (Bu safar bu faylda
   `duelQueue` va `matches` uchun ham yangi qoidalar bor — haqiqiy onlayn
   duel shular orqali ishlaydi, albatta qayta nusxalab publish qiling.)

## 2-qadam: GitHubga joylash

```bash
git init
git add .
git commit -m "IQ Level Uz - Firebase bilan"
git branch -M main
git remote add origin https://github.com/SIZNING_USERNAME/REPO_NOMI.git
git push -u origin main
```

## 3-qadam: GitHub Pages'ni yoqish

1. Repo → **Settings → Pages**
2. **Source**: "GitHub Actions" ni tanlang (loyihada tayyor
   `.github/workflows/deploy.yml` bor — push qilishning o'zi avtomatik
   build qilib, Pages'ga chiqaradi).
3. Bir necha daqiqadan so'ng sayt manzili shu yerda ko'rinadi:
   `https://SIZNING_USERNAME.github.io/REPO_NOMI/`

## 4-qadam: Telegram botga ulash

BotFather → sizning botingiz → **Bot Settings → Menu Button / Mini App** →
yuqoridagi GitHub Pages URL'ini kiriting.

## Qo'lda build qilish (ixtiyoriy)

```bash
npm install --legacy-peer-deps
npm run build
# tayyor HTML/CSS/JS: dist/ papkasida
```

`dist/` papkasining o'zi — to'liq statik HTML sayt, uni istalgan hostingga
(GitHub Pages, Netlify, Vercel, oddiy hosting) to'g'ridan-to'g'ri
yuklashingiz mumkin.
