import { Question } from '../types';

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q-1',
    category: 'Mantiq',
    difficulty: 'Oson',
    question: "Ketma-ketlikdagi bo'sh o'rinni to'ldiring: 2, 6, 12, 20, 30, ?",
    options: ['38', '40', '42', '44'],
    correctIndex: 2, // 42
    explanation: "Ketma-ketlikdagi farqlar 2 ga oshib bormoqda: +4, +6, +8, +10, +12. Demak, 30 + 12 = 42 (yoki n*(n+1) formulasi: 1*2, 2*3, 3*4, 4*5, 5*6, 6*7=42).",
  },
  {
    id: 'q-2',
    category: 'Visual',
    difficulty: "O'rta",
    svgType: 'matrix3x3',
    question: "3x3 matritsadagi so'roq belgisi (?) o'rnidagi shakl qaysi mantiqqa mos keladi? (Har bir qatorda chiziqlar soni yig'indisi o'zgarmas)",
    options: [
      '3 ta gorizontal va 1 ta vertikal chiziq',
      '2 ta gorizontal va 2 ta vertikal chiziq',
      'Faqat bitta diagonal chiziq',
      'To\'liq aylana ichidagi 4 ta nuqta'
    ],
    correctIndex: 1,
    explanation: "Har bir gorizontal qatorda vertikal va gorizontal chiziqlar sonining umumiy yig'indisi har doim 6 taga teng bo'ladi.",
  },
  {
    id: 'q-3',
    category: 'Matematik',
    difficulty: "O'rta",
    question: "Agar 5 ta mashina 5 daqiqada 5 ta detal yasasa, 100 ta mashina 100 ta detalni necha daqiqada yasaydi?",
    options: ['100 daqiqa', '50 daqiqa', '20 daqiqa', '5 daqiqa'],
    correctIndex: 3, // 5 daqiqa
    explanation: "1 ta mashina 1 ta detalni yasash uchun 5 daqiqa sarflaydi. Demak, 100 ta mashina parallel ravishda 100 ta detalni ham xuddi shunday 5 daqiqada yasaydi.",
  },
  {
    id: 'q-4',
    category: 'Mantiq',
    difficulty: 'Oson',
    question: "Kitob : O'qimoq :: Gitara : ?",
    options: ['Tinglamoq', 'Chertmoq / Chalmoq', 'Musiqa', 'Sim'],
    correctIndex: 1, // Chalmoq
    explanation: "Kitob unga nisbatan qilinadigan asosiy harakat bilan bog'langan (kitob o'qiladi). Xuddi shunday gitara chalinadi.",
  },
  {
    id: 'q-5',
    category: 'Visual',
    difficulty: 'Qiyin',
    svgType: 'shapes',
    question: "Quyidagi ketma-ketlikda burchaklar soni: Uchburchak (3), Kvadrat (4), Beshburchak (5), Oltiburchak (6). Keyingi element qaysi?",
    options: [
      'Yettiburchak (7 burchak)',
      'Sakkizburchak (8 burchak)',
      'Yulduz shakli',
      'Doira (0 burchak)'
    ],
    correctIndex: 0, // Yettiburchak
    explanation: "Shakllardagi burchaklar soni ketma-ket 1 taga oshib bormoqda: 3 -> 4 -> 5 -> 6 -> 7 (Yettiburchak / Heptagon).",
  },
  {
    id: 'q-6',
    category: 'Matematik',
    difficulty: "O'rta",
    question: "Uchta ketma-ket toq sonlarning yig'indisi 57 ga teng. Eng katta sonni toping.",
    options: ['17', '19', '21', '23'],
    correctIndex: 2, // 21
    explanation: "O'rtadagi son: 57 / 3 = 19. Ketma-ket toq sonlar: 17, 19, 21. Demak eng kattasi 21.",
  },
  {
    id: 'q-7',
    category: 'Fazoviy',
    difficulty: 'Qiyin',
    svgType: 'cube',
    question: "Kvadrat qog'oz yoyilmasida qarama-qarshi tomonlar yig'indisi 7 ga teng bo'lishi kerak. 3 raqamiga qarama-qarshi yuzada qaysi son bo'ladi?",
    options: ['2', '4', '5', '6'],
    correctIndex: 1, // 4
    explanation: "Standart zar qoidasiga ko'ra qarama-qarshi tomonlar yig'indisi 7: 7 - 3 = 4 bo'ladi.",
  },
  {
    id: 'q-8',
    category: 'Mantiq',
    difficulty: "O'rta",
    question: "Barcha atirgullar guldir. Ba'zi gullar tez so'liydi. Demak:",
    options: [
      'Barcha atirgullar tez so\'liydi',
      'Hech qaysi atirgul so\'limaydi',
      'Ba\'zi atirgullar tez so\'lishi mumkin',
      'Faqat atirgullar tez so\'liydi'
    ],
    correctIndex: 2,
    explanation: "Mantiqiy sillogizm: 'Ba'zi gullar' to'plamiga atirgullar ham kirishi mumkin, shuning uchun ba'zi atirgullar tez so'lishi ehtimoli to'g'ri.",
  },
  {
    id: 'q-9',
    category: 'Matematik',
    difficulty: 'Qiyin',
    question: "Sonlar mantiqi: 3 -> 8, 4 -> 15, 5 -> 24, 7 -> ?",
    options: ['45', '48', '50', '52'],
    correctIndex: 1, // 48
    explanation: "Qoida: n² - 1. (3² - 1 = 8; 4² - 1 = 15; 5² - 1 = 24; demak 7² - 1 = 49 - 1 = 48).",
  },
  {
    id: 'q-10',
    category: 'Visual',
    difficulty: "O'rta",
    svgType: 'patternSeries',
    question: "Soat mili har bir qadamda 45 gradus soat yo'nalishi bo'ylab burilmoqda. 12:00 dan boshlab 5 marta burilgach, soat mili qaysi yo'nalishni ko'rsatadi?",
    options: ['Janubiy-Sharq (135°)', 'Janubiy-G\'arb (225°)', 'G\'arb (270°)', 'Shimoliy-G\'arb (315°)'],
    correctIndex: 1, // 225° Janubiy-G'arb
    explanation: "5 * 45° = 225°. 12:00 (0°) dan 225° soat yo'nalishida burilish Janubiy-G'arb yo'nalishini (7:30 pozitsiyasi) ko'rsatadi.",
  },
  {
    id: 'q-11',
    category: 'Mantiq',
    difficulty: 'Oson',
    question: "Otaning yoshi 36 da, o'g'lining yoshi 10 da. Necha yildan keyin ota o'g'lidan 2 baravar katta bo'ladi?",
    options: ['12 yil', '14 yil', '16 yil', '18 yil'],
    correctIndex: 2, // 16 yil
    explanation: "Ota va o'g'il o'rtasidagi yosh farqi har doim 26 yil (36 - 10 = 26). Ota o'g'lidan 2 baravar katta bo'lganda, o'g'il 26 yoshda, ota esa 52 yoshda bo'ladi. 26 - 10 = 16 yildan keyin.",
  },
  {
    id: 'q-12',
    category: 'Matematik',
    difficulty: "O'rta",
    question: "Ketma-ketlikdagi qonuniyatni toping: 1, 1, 2, 3, 5, 8, 13, ?",
    options: ['18', '21', '24', '26'],
    correctIndex: 1, // 21
    explanation: "Fibonachchi qatori: har bir keyingi son oldingi ikki sonning yig'indisiga teng (8 + 13 = 21).",
  },
  {
    id: 'q-13',
    category: 'Visual',
    difficulty: 'Qiyin',
    svgType: 'matrix3x3',
    question: "Qora va oq katakchalar shaxmat tartibida almashmoqda. 4x4 doskada nechta qora va nechta oq katakcha bor?",
    options: ['8 qora, 8 oq', '9 qora, 7 oq', '10 qora, 6 oq', '7 qora, 9 oq'],
    correctIndex: 0, // 8 qora, 8 oq
    explanation: "4x4 doskada jami 16 ta katakcha bor. Shaxmat tartibida ular teng bo'linadi: 16 / 2 = 8 ta qora va 8 ta oq.",
  },
  {
    id: 'q-14',
    category: 'Fazoviy',
    difficulty: 'Qiyin',
    question: "Bir poyezd 120 km/soat tezlikda harakatlanmoqda. U 1 km uzunlikdagi tunneldan to'liq chiqib ketishi uchun (poyezd uzunligi 500 m) necha soniya kerak?",
    options: ['30 soniya', '45 soniya', '60 soniya', '75 soniya'],
    correctIndex: 1, // 45 soniya
    explanation: "Umumiy bosib o'tish kerak bo'lgan masofa = tunnel uzunligi + poyezd uzunligi = 1000m + 500m = 1500 metr (1.5 km). Tezlik = 120 km/soat = 120 * 1000 / 3600 = 33.33 m/s. Vaqt = 1500 / 33.33 = 45 soniya.",
  },
  {
    id: 'q-15',
    category: 'Mantiq',
    difficulty: "O'rta",
    question: "Agar barcha X lar Y bo'lsa va barcha Y lar Z bo'lsa, quyidagilardan qaysi biri qat'iy to'g'ri?",
    options: [
      'Barcha Z lar X dir',
      'Barcha X lar Z dir',
      'Ba\'zi Z lar faqat Y dir',
      'Hech qaysi X Z emas'
    ],
    correctIndex: 1, // Barcha X lar Z dir
    explanation: "Tranzitivlik qoidasi: X ⊂ Y va Y ⊂ Z bo'lsa, albatta X ⊂ Z (barcha X lar Z to'plamiga tegishli).",
  },
  {
    id: 'q-16',
    category: 'Matematik',
    difficulty: 'Oson',
    question: "Bir shisha idish va uning qopqog'i birgalikda 1 dollar 10 sent turadi. Idish qopqoqdan 1 dollar qimmat. Qopqoq narxi qancha?",
    options: ['10 sent', '5 sent', '1 sent', '15 sent'],
    correctIndex: 1, // 5 sent
    explanation: "Idish narxi x + 1.00, qopqoq x. x + (x + 1.00) = 1.10 => 2x = 0.10 => x = 0.05 dollar (5 sent).",
  },
  {
    id: 'q-17',
    category: 'Fazoviy',
    difficulty: "O'rta",
    question: "Bir kubikning 6 ta tomoni qizil rangga bo'yaldi va u 27 ta kichik teng kubchalarga bo'lindi. Nechta kichik kubchaning hech qaysi tomoni bo'yalmagan?",
    options: ['0 ta', '1 ta', '6 ta', '8 ta'],
    correctIndex: 1, // 1 ta
    explanation: "3x3x3 kubda faqat eng markaziy, ichki 1 ta kubchaning hech qanday tashqi tomoni bo'yalmaydi ((3-2)³ = 1).",
  },
  {
    id: 'q-18',
    category: 'Visual',
    difficulty: "O'rta",
    svgType: 'shapes',
    question: "Ko'zgu aks ettirish mantiqi: Gorizontal o'q bo'yicha akslantirilganda qaysi harf shakli o'zgarmay qoladi?",
    options: ['A', 'E', 'M', 'T'],
    correctIndex: 1, // E
    explanation: "E harfi gorizontal simmetriya o'qiga ega bo'lib, yuqori va pastki qismi bir xil bo'lgani sababli gorizontal ko'zguda o'zgarmaydi. A, M, T esa vertikal simmetriyaga ega.",
  },
  {
    id: 'q-19',
    category: 'Mantiq',
    difficulty: 'Qiyin',
    question: "To'rtta kishi (Ali, Vali, G'ani, Botir) poygada qatnashdi. Ali birinchi emas, Vali esa Botirdan keyin, G'ani esa Validan oldin keldi. Birinchi bo'lib kim keldi?",
    options: ['Ali', 'Vali', 'G\'ani', 'Botir'],
    correctIndex: 3, // Botir
    explanation: "Ali 1-emas. Vali Botirdan keyin keldi (Botir > Vali). G'ani Validan oldin keldi. Demak, Botir eng birinchi marraga yetib kelgan!",
  },
  {
    id: 'q-20',
    category: 'Matematik',
    difficulty: 'Qiyin',
    question: "Ketma-ketlik: 3, 5, 9, 17, 33, ?",
    options: ['49', '65', '67', '71'],
    correctIndex: 1, // 65
    explanation: "Har bir son 2 ga ko'paytirilib, 1 ayirilmoqda: 3*2-1=5, 5*2-1=9, 9*2-1=17, 17*2-1=33, 33*2-1 = 65. (Yoki farqlar: +2, +4, +8, +16, +32).",
  },
];

export const OPPONENTS: { name: string; city: string; avatar: string; rating: number; speed: number }[] = [
  { name: 'Sardorbek', city: 'Toshkent', avatar: '⚡', rating: 1420, speed: 4500 },
  { name: 'Madinabonu', city: 'Samarqand', avatar: '👑', rating: 1380, speed: 5200 },
  { name: 'Jasur_Cyber', city: "Farg'ona", avatar: '🧠', rating: 1490, speed: 3800 },
  { name: 'Bobur_Logic', city: 'Buxoro', avatar: '🎯', rating: 1350, speed: 6000 },
  { name: 'Nodira_AI', city: 'Andijon', avatar: '🚀', rating: 1520, speed: 3500 },
  { name: 'Aziz_Daho', city: 'Namangan', avatar: '💎', rating: 1460, speed: 4200 },
];
