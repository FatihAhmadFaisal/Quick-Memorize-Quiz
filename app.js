'use strict';

/* ============================================================
   Quick Memorize Quiz
   ------------------------------------------------------------
   Alur kerja:
   1. Materi diambil dari mode input yang aktif saja: catatan
      tempel bebas atau formulir soal terstruktur.
   2. Setiap poin / baris dianalisis menjadi kartu.
   3. Kartu dipakai untuk menyusun kuis pilihan ganda dan T/F.
   Semua proses berjalan lokal di browser.
   ============================================================ */

const STOPWORDS = new Set([
  'yang', 'dan', 'atau', 'untuk', 'dengan', 'pada', 'dalam', 'dari', 'ke', 'di',
  'sebagai', 'oleh', 'ini', 'itu', 'adalah', 'ialah', 'merupakan', 'yaitu', 'yakni',
  'secara', 'agar', 'karena', 'jika', 'bila', 'juga', 'telah', 'akan', 'dapat',
  'the', 'a', 'an', 'of', 'to', 'in', 'is', 'are', 'and', 'or', 'for', 'with', 'by',
]);

// Kata kerja yang sering muncul setelah subjek; jangan dijadikan bagian frasa kunci.
const VERB_WORDS = new Set([
  'terjadi', 'membantu', 'mempelajari', 'memperbarui', 'menemukan', 'dimulai',
  'digunakan', 'dilakukan', 'membuat', 'menjadi', 'memiliki', 'berfungsi',
  'mengubah', 'menghasilkan', 'dihasilkan', 'meningkatkan', 'mengurangi',
  'menyebabkan', 'berpengaruh', 'terbentuk', 'terdiri', 'disebut', 'dilatih',
  'dipakai', 'mendapat', 'memberi', 'berisi', 'meliputi',
  'happens', 'occurs', 'means', 'helps', 'allows', 'enables', 'requires',
  'describes', 'refers', 'causes', 'improves', 'reduces', 'increases',
  'learns', 'predicts', 'uses', 'works', 'contains', 'includes',
]);

const SAMPLE_NOTES = `Machine Learning adalah cabang kecerdasan buatan yang memungkinkan sistem belajar dari data tanpa diprogram secara eksplisit.
Supervised learning: model dilatih memakai data berlabel untuk memprediksi hasil baru.
Unsupervised learning — model menemukan pola tersembunyi pada data tanpa label.
Overfitting terjadi ketika model terlalu hafal data latih sehingga performanya buruk pada data baru.
Regularisasi adalah teknik mengurangi overfitting dengan memberi penalti pada model yang terlalu kompleks.
Neural network: jaringan saraf tiruan yang tersusun dari lapisan neuron buatan.
Fungsi aktivasi ReLU membantu jaringan saraf mempelajari hubungan non-linear.
Gradient descent ialah algoritma optimasi yang memperbarui bobot model ke arah penurunan error.
Cross-validation adalah metode evaluasi model dengan membagi data menjadi beberapa lipatan.
Confusion matrix: tabel yang merangkum performa klasifikasi berdasarkan prediksi benar dan salah.`;

const SAMPLE_NOTES_EN = `Machine Learning is a branch of artificial intelligence that lets systems learn from data without explicit programming.
Supervised learning: a model is trained on labeled data to predict new outcomes.
Unsupervised learning — a model finds hidden patterns in unlabeled data.
Overfitting happens when a model memorizes the training data, hurting performance on new data.
Regularization is a technique that reduces overfitting by penalizing overly complex models.
Neural network: an artificial network built from layers of artificial neurons.
ReLU activation helps neural networks learn non-linear relationships.
Gradient descent is an optimization algorithm that updates model weights toward lower error.
Cross-validation is an evaluation method that splits data into several folds.
Confusion matrix: a table summarizing classification performance from correct and incorrect predictions.`;

const SAMPLE_STRUCTURED = [
  {
    term: 'Machine Learning',
    explanation: 'Cabang kecerdasan buatan yang memungkinkan sistem belajar dari data tanpa diprogram secara eksplisit.',
  },
  {
    term: 'Supervised learning',
    explanation: 'Model dilatih memakai data berlabel untuk memprediksi hasil baru.',
  },
  {
    term: 'Unsupervised learning',
    explanation: 'Model menemukan pola tersembunyi pada data tanpa label.',
  },
  {
    term: 'Overfitting',
    explanation: 'Model terlalu hafal data latih sehingga performanya buruk pada data baru.',
  },
  {
    term: 'Regularisasi',
    explanation: 'Teknik mengurangi overfitting dengan memberi penalti pada model yang terlalu kompleks.',
  },
  {
    term: 'Neural network',
    explanation: 'Jaringan saraf tiruan yang tersusun dari lapisan neuron buatan.',
  },
  {
    term: 'Fungsi aktivasi ReLU',
    explanation: 'Membantu jaringan saraf mempelajari hubungan non-linear.',
  },
  {
    term: 'Gradient descent',
    explanation: 'Algoritma optimasi yang memperbarui bobot model ke arah penurunan error.',
  },
  {
    term: 'Cross-validation',
    explanation: 'Metode evaluasi model dengan membagi data menjadi beberapa lipatan.',
  },
  {
    term: 'Confusion matrix',
    explanation: 'Tabel yang merangkum performa klasifikasi berdasarkan prediksi benar dan salah.',
  },
];

const SAMPLE_STRUCTURED_EN = [
  {
    term: 'Machine Learning',
    explanation: 'A branch of artificial intelligence that lets systems learn from data without explicit programming.',
  },
  {
    term: 'Supervised learning',
    explanation: 'A model is trained on labeled data to predict new outcomes.',
  },
  {
    term: 'Unsupervised learning',
    explanation: 'A model finds hidden patterns in unlabeled data.',
  },
  {
    term: 'Overfitting',
    explanation: 'A model memorizes the training data, hurting performance on new data.',
  },
  {
    term: 'Regularization',
    explanation: 'A technique that reduces overfitting by penalizing overly complex models.',
  },
  {
    term: 'Neural network',
    explanation: 'An artificial network built from layers of artificial neurons.',
  },
  {
    term: 'ReLU activation',
    explanation: 'Helps neural networks learn non-linear relationships.',
  },
  {
    term: 'Gradient descent',
    explanation: 'An optimization algorithm that updates model weights toward lower error.',
  },
  {
    term: 'Cross-validation',
    explanation: 'An evaluation method that splits data into several folds.',
  },
  {
    term: 'Confusion matrix',
    explanation: 'A table summarizing classification performance from correct and incorrect predictions.',
  },
];

/* ============================================================
   Kamus bahasa (ID / EN)
   ============================================================ */

const STORAGE_KEY = 'ai-study-buddy.lang';
const NOTES_KEY = 'ai-study-buddy.notes';
const FEYNMAN_KEY = 'ai-study-buddy.feynman';
const THEME_KEY = 'ai-study-buddy.theme';
const DEFAULT_THEME = 'blue';

// Palet aksen v10. Urutan di sini sama dengan urutan pada menu.
const THEMES = [
  { id: 'blue', swatch: '#4f46e5' },
  { id: 'red', swatch: '#dc2626' },
  { id: 'orange', swatch: '#f97316' },
  { id: 'green', swatch: '#15803d' },
  { id: 'yellow', swatch: '#eab308' },
  { id: 'pink', swatch: '#db2777' },
  { id: 'black', swatch: '#111827' },
  { id: 'purple', swatch: '#9333ea' },
  { id: 'brown', swatch: '#92400e' },
  { id: 'gray', swatch: '#475569' },
  { id: 'dark-green', swatch: '#166534' },
  { id: 'cyan', swatch: '#06b6d4' },
  { id: 'teal', swatch: '#0f766e' },
  { id: 'olive', swatch: '#556b2f' },
];
const MAX_IMPORT_BYTES = 12 * 1024 * 1024;
const STORAGE_VERSION = 5;
const EXPORT_VERSION = 9;
const FEYNMAN_VERSION = 1;
const FEYNMAN_HISTORY_LIMIT = 30;
const FEYNMAN_MIN_CHARS = 20;
const MAX_STRUCTURED_ROWS = 100;
const MIN_STRUCTURED_ROWS = 2;

// Batas gambar: sumber boleh besar, tetapi hasil kompresi dijaga kecil agar
// localStorage tidak cepat penuh.
const MAX_IMAGE_SOURCE_BYTES = 12 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1024;
const IMAGE_JPEG_QUALITY = 0.72;
const IMAGE_TARGET_BYTES = 180 * 1024;
const MAX_IMAGE_DATA_URL_LENGTH = 400 * 1024;

// Validasi catatan memakai jumlah huruf/angka, bukan jumlah kata, agar
// pasangan singkat seperti "DB: Basis data" tetap bisa diolah.
const MIN_NOTE_MEANINGFUL_CHARS = 10;
const MIN_CARD_TEXT_CHARS = 10;

const TRANSLATIONS = {
  id: {
    'app.title': 'Quick Memorize Quiz — Catatan Jadi Flashcard & Kuis',
    'app.meta': 'Ubah catatan kuliah menjadi flashcard interaktif dan kuis pilihan ganda secara instan.',
    'app.subtitle': 'Catatan kuliah jadi flashcard & kuis dalam sekejap.',
    'app.footer': 'Dibuat untuk belajar lebih cepat. Semua materi diproses langsung di browser.',

    'theme.title': 'Warna aksen',
    'theme.blue': 'Biru',
    'theme.red': 'Merah',
    'theme.orange': 'Orange',
    'theme.green': 'Hijau',
    'theme.yellow': 'Kuning',
    'theme.pink': 'Pink',
    'theme.black': 'Hitam',
    'theme.purple': 'Ungu',
    'theme.brown': 'Coklat',
    'theme.gray': 'Abu-abu',
    'theme.dark-green': 'Hijau Gelap',
    'theme.cyan': 'Cyan',
    'theme.teal': 'Teal',
    'theme.olive': 'Zaitun',

    'stats.cards': '{n} kartu',
    'stats.questions': '{n} soal',

    'input.title': '1. Masukkan materimu',
    'input.sample': 'Pakai contoh',
    'input.desc': 'Satu poin per baris, atau tulis bebas. Kami akan memecah dan menyusunnya otomatis.',
    'input.scrollHint': 'untuk menggulir area ini',
    'input.label': 'Catatan kuliah',
    'input.placeholder': 'Contoh:\nOverfitting terjadi ketika model terlalu hafal data latih.\nNeural network: jaringan saraf tiruan berlapis.\nGradient descent adalah algoritma optimasi bobot.',
    'input.chars': '{n} karakter',
    'input.points': '{n} poin',
    'input.generate': 'Buat Flashcard & Kuis',
    'input.loading': 'Menyusun materi…',

    'mode.aria': 'Mode input materi',
    'mode.paste': 'Tempel Teks',
    'mode.structured': 'Formulir Soal',

    'structured.desc': 'Isi satu istilah dan penjelasannya per baris. Setiap baris lengkap menjadi satu kartu.',
    'structured.add': 'Tambahkan Soal',
    'structured.rowsAria': 'Daftar soal terstruktur',
    'structured.empty': 'Belum ada soal. Klik “Tambahkan Soal” untuk mulai.',
    'structured.rowLabel': 'Soal {n}',
    'structured.term': 'Term / Istilah / Pertanyaan',
    'structured.termPlaceholder': 'Contoh: Overfitting, atau Apa itu overfitting?',
    'structured.explanation': 'Explanation / Penjelasan / Jawaban',
    'structured.explanationPlaceholder': 'Contoh: Model terlalu hafal data latih sehingga buruk pada data baru.',
    'structured.remove': 'Hapus soal {n}',
    'structured.count': '{complete} dari {total} soal lengkap',
    'structured.imageAdd': 'Foto',
    'structured.imageChange': 'Ganti foto',
    'structured.imageRemove': 'Hapus foto',
    'structured.imageAddAria': 'Tambahkan foto untuk {field} soal {n}',
    'structured.imageChangeAria': 'Ganti foto untuk {field} soal {n}',
    'structured.imageRemoveAria': 'Hapus foto dari {field} soal {n}',
    'structured.imageFieldTerm': 'istilah',
    'structured.imageFieldExplanation': 'penjelasan',
    'structured.formatGroup': 'Format teks',
    'structured.formatBold': 'Tebal',
    'structured.formatItalic': 'Miring',
    'structured.formatSup': 'Pangkat, contoh x^2',
    'structured.formatSub': 'Indeks, contoh H_2O',
    'structured.imageProcessing': 'Memproses…',
    'structured.imageErrorType': 'File harus berupa gambar (JPG, PNG, atau WebP).',
    'structured.imageErrorSize': 'Gambar terlalu besar. Maksimal 12 MB.',
    'structured.imageErrorRead': 'Gambar tidak bisa diproses. Coba file lain.',
    'structured.imageTermLabel': 'Soal bergambar {n}',
    'structured.errorMin': 'Isi minimal dua baris lengkap: istilah dan penjelasan.',
    'structured.errorIncomplete': 'Soal {n} belum lengkap. Isi istilah dan penjelasannya (teks atau foto), atau kosongkan baris itu.',
    'structured.errorDuplicateQuestion': 'Soal {first} dan {second} identik: istilah dan jawabannya sama. Ubah foto atau jawabannya agar berbeda.',
    'structured.errorEmpty': 'Formulir masih kosong. Tambahkan minimal dua soal lengkap, ya.',
    'structured.errorMax': 'Maksimal {n} soal dalam satu formulir.',

    'tips.title': 'Tips agar hasilnya bagus',
    'tips.one': 'Gunakan format <code class="code-chip">Istilah: penjelasan</code> untuk kartu definisi.',
    'tips.two': 'Baris tanpa titik dua akan diubah menjadi kartu isian rumpang.',
    'tips.three': 'Minimal 2 poin agar kuis bisa dibuat.',
    'tips.four': 'Catatan tersimpan otomatis di browser ini.',
    'structured.tips.one': 'Setiap baris lengkap menjadi <strong>kartu definisi</strong>, soal MCQ, dan pernyataan T/F.',
    'structured.tips.two': 'Isi minimal <strong>dua baris lengkap</strong>: istilah dan penjelasan.',
    'structured.tips.three': 'Istilah boleh sama asalkan foto atau jawabannya berbeda; hanya soal yang benar-benar kembar yang ditolak.',
    'structured.tips.four': 'Setiap kotak bisa berisi teks, foto, atau keduanya. Foto dikompres otomatis.',
    'structured.tips.five': 'Data formulir dan fotonya tersimpan otomatis di browser ini.',
    'structured.tips.six': 'Tulis **tebal**, *miring*, x^2, atau H_2O — atau pakai tombol format di tiap kotak.',

    'storage.clear': 'Hapus semua',
    'storage.clearConfirm': 'Yakin? Klik lagi',
    'storage.saved': 'Tersimpan',
    'storage.export': 'Simpan File',
    'storage.import': 'Buka File',
    'storage.exported': 'File catatan berhasil diunduh.',
    'storage.imported': 'File “{name}” berhasil dimuat.',
    'storage.emptyExport': 'Belum ada catatan untuk disimpan.',
    'storage.invalidJson': 'File JSON tidak valid. Periksa kembali isinya.',
    'storage.invalidFile': 'File tidak berisi catatan yang bisa dibaca.',
    'storage.fileTooLarge': 'File terlalu besar. Maksimal 12 MB.',
    'storage.readError': 'Gagal membaca file. Silakan coba lagi.',
    'storage.quota': 'Penyimpanan browser penuh. Hapus beberapa foto agar materi tetap tersimpan.',

    'empty.title': 'Materi belajarmu muncul di sini',
    'empty.desc': 'Tempel catatan atau isi formulir soal, lalu tekan <span class="font-semibold text-slate-700">Buat Flashcard &amp; Kuis</span>.',
    'empty.f1': '<strong class="font-semibold text-slate-700">Flashcard 3D.</strong> Klik kartu untuk membalik.',
    'empty.f2': '<strong class="font-semibold text-slate-700">Kuis pilihan ganda.</strong> Lengkap dengan pembahasan.',
    'empty.f3': '<strong class="font-semibold text-slate-700">Skor otomatis.</strong> Pantau hasil belajarmu.',
    'empty.f4': '<strong class="font-semibold text-slate-700">Metode Feynman.</strong> Jelaskan konsep dengan bahasamu sendiri.',
    'empty.f5': '<strong class="font-semibold text-slate-700">Drag-to-Answer.</strong> Tarik garis untuk mencocokkan pertanyaan dan jawaban.',

    'tabs.cards': 'Flashcard',
    'tabs.quiz': 'Kuis',
    'tabs.tf': 'True / False',
    'tabs.match': 'Cocokkan',
    'tabs.feynman': 'Feynman',
    'tabs.aria': 'Mode belajar',
    'action.new': 'Catatan baru',

    'feynman.label': 'Metode Feynman',
    'feynman.title': 'Ajari orang lain, bukan menghafal',
    'feynman.desc': 'Pilih satu konsep, jelaskan dengan bahasamu sendiri, lalu bandingkan dengan catatan asli untuk menemukan celah pemahaman.',
    'feynman.stepsAria': 'Langkah metode Feynman',
    'feynman.step1Short': 'Pilih konsep',
    'feynman.step2Short': 'Jelaskan',
    'feynman.step3Short': 'Review',
    'feynman.step1Title': '1. Pilih atau tulis konsep',
    'feynman.step1Desc': 'Gunakan konsep dari flashcard yang sudah kamu buat, atau tulis konsep baru yang ingin kamu uji.',
    'feynman.sourceAria': 'Sumber konsep',
    'feynman.sourceCard': 'Dari flashcard',
    'feynman.sourceManual': 'Tulis manual',
    'feynman.cardLabel': 'Pilih konsep',
    'feynman.cardEmpty': 'Belum ada flashcard. Tulis konsep secara manual.',
    'feynman.cardImageOption': ' (bergambar)',
    'feynman.cardImageAlt': 'Gambar pada kartu “{concept}”',
    'feynman.answerImageAlt': 'Gambar jawaban asli untuk “{concept}”',
    'feynman.cardImageCaption': 'Gambar dari kartu',
    'feynman.answerImageCaption': 'Gambar jawaban asli',
    'feynman.previewLabel': 'Pratinjau kartu',
    'feynman.previewHint': 'Gambar ini bagian dari pertanyaan, bukan jawabannya.',
    'feynman.manualLabel': 'Judul konsep',
    'feynman.manualPlaceholder': 'Contoh: Hukum Newton II',
    'feynman.referenceLabel': 'Catatan asli / kunci jawaban (opsional)',
    'feynman.referencePlaceholder': 'Tempel jawaban dari catatanmu di sini agar bisa dibandingkan.',
    'feynman.referenceHint': 'Kalau dikosongkan, langkah review tetap bisa dilakukan tanpa pembanding.',
    'feynman.nextExplain': 'Lanjut: jelaskan',
    'feynman.back': 'Kembali',
    'feynman.nextReview': 'Lanjut: review',
    'feynman.step2Title': '2. Jelaskan dengan bahasa sederhana',
    'feynman.step2Desc': 'Jelaskan konsep ini dengan bahasa sederhana seolah-olah kamu sedang mengajar orang lain.',
    'feynman.conceptBadge': 'Konsep: {concept}',
    'feynman.explanationLabel': 'Penjelasanmu',
    'feynman.explanationPlaceholder': 'Mulai dari ide besarnya, lalu jelaskan dengan kata-katamu sendiri...',
    'feynman.richHint': 'Boleh pakai **tebal**, *miring*, x^2, atau H_2O.',
    'feynman.charCount': '{n} karakter',
    'feynman.wordCount': '{n} kata',
    'feynman.step3Title': '3. Review & temukan celah',
    'feynman.step3Desc': 'Bandingkan penjelasanmu dengan catatan asli, lalu tandai hal yang masih perlu diperbaiki.',
    'feynman.yourExplanation': 'Penjelasanmu',
    'feynman.originalNotes': 'Catatan asli',
    'feynman.noExplanation': 'Penjelasan masih kosong.',
    'feynman.noReference': 'Belum ada catatan asli untuk konsep ini. Tambahkan lewat “Tulis manual” bila ingin pembanding.',
    'feynman.gapTitle': 'Analisis celah otomatis',
    'feynman.gapAllGood': 'Semua kata kunci utama dari catatan asli sudah muncul di penjelasanmu.',
    'feynman.gapFound': '{n} kata kunci dari catatan asli belum muncul. Coba jelaskan juga:',
    'feynman.gapNoReference': 'Tambahkan catatan asli (opsional) di langkah 1 untuk melihat analisis celah.',
    'feynman.gapImageOnly': 'Catatan asli untuk konsep ini berupa gambar, jadi analisis kata kunci tidak tersedia. Bandingkan gambarnya secara manual.',
    'feynman.gapShort': 'Penjelasanmu masih pendek. Tambahkan ide utama dan contoh agar lebih jelas.',
    'feynman.gapKeywordAria': 'Kata kunci yang belum muncul: {word}',
    'feynman.checklistTitle': 'Evaluasi mandiri',
    'feynman.checkSimple': 'Penjelasannya sudah sederhana dan mudah dipahami.',
    'feynman.checkJargon': 'Tidak ada istilah rumit yang belum dijelaskan.',
    'feynman.checkExample': 'Ada contoh atau analogi yang membantu.',
    'feynman.checkComplete': 'Ide utamanya sudah tercakup semua.',
    'feynman.editExplanation': 'Ubah penjelasan',
    'feynman.newConcept': 'Konsep baru',
    'feynman.save': 'Simpan latihan',
    'feynman.savedNotice': 'Latihan tersimpan di riwayat.',
    'feynman.historyTitle': 'Riwayat latihan',
    'feynman.historyEmpty': 'Belum ada latihan tersimpan. Simpan hasil review untuk melihat riwayat di sini.',
    'feynman.historyScore': '{n}/4 checklist',
    'feynman.historyLoad': 'Muat',
    'feynman.historyDelete': 'Hapus',
    'feynman.historyLoadAria': 'Muat latihan {concept}',
    'feynman.historyDeleteAria': 'Hapus riwayat {concept}',
    'feynman.untitled': 'Konsep tanpa judul',
    'feynman.hintChooseConcept': 'Pilih konsep dulu sebelum lanjut.',
    'feynman.hintManualConcept': 'Tulis judul konsep minimal 2 karakter.',
    'feynman.hintEmptyExplanation': 'Tulis penjelasan minimal 20 karakter agar bisa direview.',
    'feynman.hintNoCards': 'Belum ada flashcard. Pilih “Tulis manual” untuk memulai.',
    'feynman.hintSaveQuota': 'Riwayat tidak bisa disimpan karena penyimpanan browser penuh.',
    'feynman.restoredDraft': 'Draf latihan terakhir dimuat kembali.',

    'card.counter': 'Kartu {i} / {n}',
    'card.clickToFlip': 'Klik kartu untuk membalik',
    'card.questionBadge': 'Pertanyaan',
    'card.termBadge': 'Istilah',
    'card.clozeBadge': 'Isian rumpang',
    'card.answerBadge': 'Jawaban',
    'card.reveal': 'Klik untuk melihat jawaban',
    'card.back': 'Klik untuk kembali',
    'card.prev': 'Sebelumnya',
    'card.next': 'Berikutnya',
    'card.prevAria': 'Kartu sebelumnya',
    'card.nextAria': 'Kartu berikutnya',
    'card.flip': 'Balik kartu',
    'card.shuffle': 'Acak Kartu',
    'card.showQuestion': 'Lihat pertanyaan',
    'card.question': 'Apa yang dimaksud dengan “{term}”?',
    'card.aria': 'Flashcard. Tekan Enter atau klik untuk membalik.',
    'card.keys': 'Gunakan <kbd class="kbd">←</kbd> <kbd class="kbd">→</kbd> untuk berpindah, <kbd class="kbd">Space</kbd> untuk membalik.',

    'image.alt': 'Gambar soal',
    'image.termLabel': 'gambar ini',

    'quiz.counter': 'Soal {i} / {n}',
    'quiz.score': '{n} benar',
    'quiz.promptCloze': 'Lengkapi bagian rumpang pada poin berikut.',
    'quiz.promptMatch': 'Manakah definisi yang paling tepat untuk “{term}”?',
    'quiz.promptImage': 'Manakah definisi yang paling tepat untuk gambar berikut?',
    'quiz.explainCloze': 'Jawaban yang benar: “{term}”.',
    'quiz.correctTitle': 'Tepat sekali!',
    'quiz.wrongTitle': 'Belum tepat.',
    'quiz.next': 'Soal berikutnya →',
    'quiz.keyHint': 'Tekan → untuk lanjut',
    'quiz.seeResult': 'Lihat hasil',
    'quiz.shuffle': 'Acak Kuis',
    'quiz.emptyTitle': 'Kuis belum bisa dibuat',
    'quiz.emptyDesc': 'Butuh minimal dua poin dengan istilah berbeda. Coba tulis catatan dengan format <code class="code-chip">Istilah: penjelasan</code>.',
    'quiz.optionsAria': 'Pilihan jawaban',
    'quiz.resultLabel': 'Hasil kuis',
    'quiz.reviewLabel': 'Materi untuk diulang',

    'tf.counter': 'Soal {i} / {n}',
    'tf.statementLabel': 'Pernyataan',
    'tf.true': 'Benar',
    'tf.false': 'Salah',
    'tf.shuffle': 'Acak T/F',
    'tf.emptyTitle': 'Kuis True / False belum bisa dibuat',
    'tf.emptyDesc': 'Butuh minimal dua pasangan <code class="code-chip">Istilah: penjelasan</code> agar pernyataan benar dan salah bisa disusun.',
    'tf.correctTitle': 'Tepat!',
    'tf.wrongTitle': 'Belum tepat.',
    'tf.explainTrue': 'Pernyataan itu benar: “{term}” memang cocok dengan penjelasan tersebut.',
    'tf.explainFalse': 'Pernyataan itu salah. Penjelasan tersebut sebenarnya milik “{correctTerm}”.',
    'tf.resultLabel': 'Hasil True / False',
    'tf.retry': 'Ulangi kuis T/F',

    'match.label': 'Drag-to-Answer',
    'match.title': 'Tarik garis, cocokkan pasangan',
    'match.desc': 'Hubungkan pertanyaan di kiri dengan jawaban acak di kanan. Tarik dari titik pertanyaan ke titik jawaban, atau ketuk pertanyaan lalu ketuk jawabannya.',
    'match.instructions': 'Tarik dari titik di kanan pertanyaan ke titik di kiri jawaban.',
    'match.batch': 'Batch {i} / {n}',
    'match.pairs': '{n} pasangan',
    'match.questionsAria': 'Pertanyaan',
    'match.answersAria': 'Jawaban acak',
    'match.connectQuestion': 'Hubungkan pertanyaan: {text}',
    'match.connectAnswer': 'Pilih jawaban: {text}',
    'match.pending': 'Pertanyaan dipilih. Sekarang ketuk atau tarik ke jawaban yang cocok.',
    'match.check': 'Periksa Jawaban',
    'match.next': 'Batch berikutnya →',
    'match.finish': 'Lihat hasil',
    'match.retryBatch': 'Ulangi sambungan',
    'match.restart': 'Ulangi dari awal',
    'match.feedbackAll': 'Semua {n} pasangan benar!',
    'match.feedbackSome': '{correct} dari {n} pasangan benar. Garis merah menunjukkan pasangan yang belum tepat.',
    'match.feedbackReady': 'Semua pertanyaan sudah terhubung. Tekan Periksa Jawaban.',
    'match.score': '{n} benar',
    'match.emptyTitle': 'Cocokkan belum bisa dibuat',
    'match.emptyDesc': 'Butuh minimal dua pasangan pertanyaan dan jawaban. Buat flashcard dengan format Istilah: penjelasan terlebih dahulu.',
    'match.summaryLabel': 'Hasil Drag-to-Answer',
    'match.summaryTitle': 'Sesi selesai!',
    'match.summaryText': '{correct} dari {total} pasangan berhasil dicocokkan dengan benar.',
    'match.imageOnly': 'Gambar tanpa teks',
    'match.questionImageAlt': 'Gambar pertanyaan',
    'match.answerImageAlt': 'Gambar jawaban',
    'match.noPairs': 'Butuh 2 pasangan',

    'timer.button': 'Atur timer kuis',
    'timer.menu': 'Pilih durasi timer',
    'timer.menuTitle': 'Durasi timer',
    'timer.seconds': '{n} detik',
    'timer.timeUpTitle': 'Waktu habis!',
    'timer.timeUpNote': 'Soal dianggap salah.',

    'streak.aria': 'Jawaban benar beruntun: {n}',
    'streak.title': 'Jawaban benar beruntun',
    'celebrate.badge': 'Skor luar biasa!',
    'celebrate.announce': 'Skor {percent}%! Konfeti selebrasi!',

    'result.retry': 'Ulangi kuis',
    'result.summary': '{score} dari {total} soal benar. {text}',
    'result.great': 'Luar biasa!',
    'result.greatText': 'Kamu sudah menguasai hampir seluruh materi. Pertahankan!',
    'result.good': 'Bagus sekali!',
    'result.goodText': 'Sebagian besar materi sudah kamu pahami. Rapikan sisanya, ya.',
    'result.ok': 'Cukup baik',
    'result.okText': 'Dasarnya sudah ada. Ulangi materi yang masih keliru agar lebih mantap.',
    'result.low': 'Terus berlatih!',
    'result.lowText': 'Baca ulang poin yang masih sulit, lalu ulangi kuisnya.',

    'hint.empty': 'Catatan masih kosong. Tempel catatan kuliahmu dulu, ya.',
    'hint.short': 'Catatan terlalu pendek. Tambahkan penjelasan pada minimal dua poin, misalnya "Istilah: penjelasan".',
    'hint.fewCards': 'Belum cukup poin yang bisa diolah. Pastikan ada minimal dua poin, misalnya dua baris "Istilah: penjelasan".',
    'hint.error': 'Terjadi kesalahan saat menyusun materi. Silakan coba lagi.',
  },

  en: {
    'app.title': 'Quick Memorize Quiz — Turn Notes into Flashcards & Quizzes',
    'app.meta': 'Turn your lecture notes into interactive flashcards and multiple-choice quizzes instantly.',
    'app.subtitle': 'Turn your lecture notes into flashcards & quizzes in seconds.',
    'app.footer': 'Built for faster studying. Everything is processed right in your browser.',

    'theme.title': 'Accent color',
    'theme.blue': 'Blue',
    'theme.red': 'Red',
    'theme.orange': 'Orange',
    'theme.green': 'Green',
    'theme.yellow': 'Yellow',
    'theme.pink': 'Pink',
    'theme.black': 'Black',
    'theme.purple': 'Purple',
    'theme.brown': 'Brown',
    'theme.gray': 'Gray',
    'theme.dark-green': 'Dark Green',
    'theme.cyan': 'Cyan',
    'theme.teal': 'Teal',
    'theme.olive': 'Olive',

    'stats.cards': '{n} cards',
    'stats.questions': '{n} questions',

    'input.title': '1. Add your material',
    'input.sample': 'Use sample',
    'input.desc': "One point per line, or write freely. We'll split and organize it for you.",
    'input.scrollHint': 'to scroll this area',
    'input.label': 'Lecture notes',
    'input.placeholder': 'Example:\nOverfitting occurs when a model memorizes the training data too closely.\nNeural network: an artificial neural network with stacked layers.\nGradient descent is an algorithm that optimizes model weights.',
    'input.chars': '{n} characters',
    'input.points': '{n} points',
    'input.generate': 'Create Flashcards & Quiz',
    'input.loading': 'Preparing material…',

    'mode.aria': 'Input mode',
    'mode.paste': 'Paste Text',
    'mode.structured': 'Question Form',

    'structured.desc': 'Fill in one term and its explanation per row. Each complete row becomes one card.',
    'structured.add': 'Add Question',
    'structured.rowsAria': 'Structured question list',
    'structured.empty': 'No questions yet. Click “Add Question” to start.',
    'structured.rowLabel': 'Question {n}',
    'structured.term': 'Term / Question',
    'structured.termPlaceholder': 'Example: Overfitting, or What is overfitting?',
    'structured.explanation': 'Explanation / Answer',
    'structured.explanationPlaceholder': 'Example: A model memorizes the training data, hurting performance on new data.',
    'structured.remove': 'Remove question {n}',
    'structured.count': '{complete} of {total} complete',
    'structured.imageAdd': 'Photo',
    'structured.imageChange': 'Change photo',
    'structured.imageRemove': 'Remove photo',
    'structured.imageAddAria': 'Add a photo for the {field} of question {n}',
    'structured.imageChangeAria': 'Change the photo for the {field} of question {n}',
    'structured.imageRemoveAria': 'Remove the photo from the {field} of question {n}',
    'structured.imageFieldTerm': 'term',
    'structured.imageFieldExplanation': 'explanation',
    'structured.formatGroup': 'Text formatting',
    'structured.formatBold': 'Bold',
    'structured.formatItalic': 'Italic',
    'structured.formatSup': 'Superscript, e.g. x^2',
    'structured.formatSub': 'Subscript, e.g. H_2O',
    'structured.imageProcessing': 'Processing…',
    'structured.imageErrorType': 'The file must be an image (JPG, PNG, or WebP).',
    'structured.imageErrorSize': 'The image is too large. The maximum is 12 MB.',
    'structured.imageErrorRead': 'The image could not be processed. Try another file.',
    'structured.imageTermLabel': 'Image question {n}',
    'structured.errorMin': 'Add at least two complete rows: a term and an explanation.',
    'structured.errorIncomplete': 'Question {n} is incomplete. Fill in both the term and explanation (text or photo), or clear that row.',
    'structured.errorDuplicateQuestion': 'Questions {first} and {second} are identical: the term and the answer are the same. Change the photo or the answer so they differ.',
    'structured.errorEmpty': 'The form is still empty. Add at least two complete questions.',
    'structured.errorMax': 'A form can contain at most {n} questions.',

    'tips.title': 'Tips for better results',
    'tips.one': 'Use the format <code class="code-chip">Term: explanation</code> for definition cards.',
    'tips.two': 'Lines without a colon become fill-in-the-blank cards.',
    'tips.three': 'At least 2 points are needed to build a quiz.',
    'tips.four': 'Your notes are saved automatically in this browser.',
    'structured.tips.one': 'Each complete row becomes a <strong>definition card</strong>, MCQ, and T/F statement.',
    'structured.tips.two': 'Add at least <strong>two complete rows</strong>: term and explanation.',
    'structured.tips.three': 'The same term is allowed when the photo or answer differs; only identical questions are rejected.',
    'structured.tips.four': 'Each field can hold text, a photo, or both. Photos are compressed automatically.',
    'structured.tips.five': 'Form data and photos are saved automatically in this browser.',
    'structured.tips.six': 'Write **bold**, *italic*, x^2, or H_2O — or use the format buttons in each field.',

    'storage.clear': 'Clear all',
    'storage.clearConfirm': 'Sure? Click again',
    'storage.saved': 'Saved',
    'storage.export': 'Save File',
    'storage.import': 'Open File',
    'storage.exported': 'Your notes file has been downloaded.',
    'storage.imported': 'File “{name}” loaded successfully.',
    'storage.emptyExport': 'There are no notes to export yet.',
    'storage.invalidJson': "That JSON file isn't valid. Please check its contents.",
    'storage.invalidFile': "The file doesn't contain readable notes.",
    'storage.fileTooLarge': 'That file is too large. The maximum size is 12 MB.',
    'storage.readError': "Couldn't read that file. Please try again.",
    'storage.quota': 'Browser storage is full. Remove some photos so your material keeps saving.',

    'empty.title': 'Your study material appears here',
    'empty.desc': 'Paste your notes or fill in the question form, then press <span class="font-semibold text-slate-700">Create Flashcards &amp; Quiz</span>.',
    'empty.f1': '<strong class="font-semibold text-slate-700">3D flashcards.</strong> Click a card to flip it.',
    'empty.f2': '<strong class="font-semibold text-slate-700">Multiple-choice quiz.</strong> Complete with explanations.',
    'empty.f3': '<strong class="font-semibold text-slate-700">Automatic scoring.</strong> See how well you did.',
    'empty.f4': '<strong class="font-semibold text-slate-700">Feynman technique.</strong> Explain concepts in your own words.',
    'empty.f5': '<strong class="font-semibold text-slate-700">Drag-to-Answer.</strong> Draw lines to match questions with answers.',

    'tabs.cards': 'Flashcards',
    'tabs.quiz': 'Quiz',
    'tabs.tf': 'True / False',
    'tabs.match': 'Match',
    'tabs.feynman': 'Feynman',
    'tabs.aria': 'Study mode',
    'action.new': 'New notes',

    'feynman.label': 'Feynman technique',
    'feynman.title': 'Teach someone else, don’t just memorize',
    'feynman.desc': 'Pick one concept, explain it in your own words, then compare it with the original notes to find the gaps in your understanding.',
    'feynman.stepsAria': 'Feynman technique steps',
    'feynman.step1Short': 'Pick a concept',
    'feynman.step2Short': 'Explain',
    'feynman.step3Short': 'Review',
    'feynman.step1Title': '1. Pick or type a concept',
    'feynman.step1Desc': 'Use a concept from the flashcards you already made, or type a new concept you want to test yourself on.',
    'feynman.sourceAria': 'Concept source',
    'feynman.sourceCard': 'From flashcards',
    'feynman.sourceManual': 'Type manually',
    'feynman.cardLabel': 'Pick a concept',
    'feynman.cardEmpty': 'There are no flashcards yet. Type a concept manually.',
    'feynman.cardImageOption': ' (has image)',
    'feynman.cardImageAlt': 'Image from the “{concept}” card',
    'feynman.answerImageAlt': 'Original answer image for “{concept}”',
    'feynman.cardImageCaption': 'Image from the card',
    'feynman.answerImageCaption': 'Original answer image',
    'feynman.previewLabel': 'Card preview',
    'feynman.previewHint': 'This image is part of the prompt, not the answer.',
    'feynman.manualLabel': 'Concept title',
    'feynman.manualPlaceholder': 'Example: Newton’s second law',
    'feynman.referenceLabel': 'Original notes / answer key (optional)',
    'feynman.referencePlaceholder': 'Paste the answer from your notes here so it can be compared.',
    'feynman.referenceHint': 'If you leave this empty, the review step still works without a reference.',
    'feynman.nextExplain': 'Next: explain',
    'feynman.back': 'Back',
    'feynman.nextReview': 'Next: review',
    'feynman.step2Title': '2. Explain it in simple language',
    'feynman.step2Desc': 'Explain this concept in simple language as if you were teaching someone else.',
    'feynman.conceptBadge': 'Concept: {concept}',
    'feynman.explanationLabel': 'Your explanation',
    'feynman.explanationPlaceholder': 'Start with the big idea, then explain it in your own words...',
    'feynman.richHint': 'You can use **bold**, *italic*, x^2, or H_2O.',
    'feynman.charCount': '{n} characters',
    'feynman.wordCount': '{n} words',
    'feynman.step3Title': '3. Review & find the gaps',
    'feynman.step3Desc': 'Compare your explanation with the original notes, then mark what still needs work.',
    'feynman.yourExplanation': 'Your explanation',
    'feynman.originalNotes': 'Original notes',
    'feynman.noExplanation': 'Your explanation is still empty.',
    'feynman.noReference': 'There are no original notes for this concept yet. Add them through “Type manually” if you want a reference.',
    'feynman.gapTitle': 'Automatic gap analysis',
    'feynman.gapAllGood': 'Every main keyword from the original notes appears in your explanation.',
    'feynman.gapFound': '{n} keywords from the original notes are missing. Try explaining these too:',
    'feynman.gapNoReference': 'Add original notes (optional) in step 1 to see a gap analysis.',
    'feynman.gapImageOnly': 'The original notes for this concept are an image, so keyword analysis is not available. Compare the images manually.',
    'feynman.gapShort': 'Your explanation is still short. Add the main idea and an example to make it clearer.',
    'feynman.gapKeywordAria': 'Missing keyword: {word}',
    'feynman.checklistTitle': 'Self-assessment',
    'feynman.checkSimple': 'The explanation is simple and easy to understand.',
    'feynman.checkJargon': 'There are no complicated terms left unexplained.',
    'feynman.checkExample': 'There is a helpful example or analogy.',
    'feynman.checkComplete': 'All the main ideas are covered.',
    'feynman.editExplanation': 'Edit explanation',
    'feynman.newConcept': 'New concept',
    'feynman.save': 'Save practice',
    'feynman.savedNotice': 'Practice saved to history.',
    'feynman.historyTitle': 'Practice history',
    'feynman.historyEmpty': 'No saved practice yet. Save a review to see it in the history here.',
    'feynman.historyScore': '{n}/4 checklist',
    'feynman.historyLoad': 'Load',
    'feynman.historyDelete': 'Delete',
    'feynman.historyLoadAria': 'Load practice for {concept}',
    'feynman.historyDeleteAria': 'Delete practice history for {concept}',
    'feynman.untitled': 'Untitled concept',
    'feynman.hintChooseConcept': 'Pick a concept before continuing.',
    'feynman.hintManualConcept': 'Type a concept title of at least 2 characters.',
    'feynman.hintEmptyExplanation': 'Write at least 20 characters so your explanation can be reviewed.',
    'feynman.hintNoCards': 'There are no flashcards yet. Choose “Type manually” to start.',
    'feynman.hintSaveQuota': 'History could not be saved because browser storage is full.',
    'feynman.restoredDraft': 'Your last practice draft was restored.',

    'card.counter': 'Card {i} / {n}',
    'card.clickToFlip': 'Click the card to flip',
    'card.questionBadge': 'Question',
    'card.termBadge': 'Term',
    'card.clozeBadge': 'Fill in the blank',
    'card.answerBadge': 'Answer',
    'card.reveal': 'Click to reveal the answer',
    'card.back': 'Click to flip back',
    'card.prev': 'Previous',
    'card.next': 'Next',
    'card.prevAria': 'Previous card',
    'card.nextAria': 'Next card',
    'card.flip': 'Flip card',
    'card.shuffle': 'Shuffle Cards',
    'card.showQuestion': 'Show question',
    'card.question': 'What does “{term}” mean?',
    'card.aria': 'Flashcard. Press Enter or click to flip.',
    'card.keys': 'Use <kbd class="kbd">←</kbd> <kbd class="kbd">→</kbd> to move, <kbd class="kbd">Space</kbd> to flip.',

    'image.alt': 'Question image',
    'image.termLabel': 'this image',

    'quiz.counter': 'Question {i} / {n}',
    'quiz.score': '{n} correct',
    'quiz.promptCloze': 'Fill in the blank in the following point.',
    'quiz.promptMatch': 'Which definition best matches “{term}”?',
    'quiz.promptImage': 'Which definition best matches this image?',
    'quiz.explainCloze': 'Correct answer: “{term}”.',
    'quiz.correctTitle': 'Correct!',
    'quiz.wrongTitle': 'Not quite.',
    'quiz.next': 'Next question →',
    'quiz.keyHint': 'Press → to continue',
    'quiz.seeResult': 'See results',
    'quiz.shuffle': 'Shuffle Quiz',
    'quiz.emptyTitle': "Quiz can't be created yet",
    'quiz.emptyDesc': 'You need at least two points with different terms. Try notes formatted as <code class="code-chip">Term: explanation</code>.',
    'quiz.optionsAria': 'Answer choices',
    'quiz.resultLabel': 'Quiz result',
    'quiz.reviewLabel': 'Topics to review',

    'tf.counter': 'Question {i} / {n}',
    'tf.statementLabel': 'Statement',
    'tf.true': 'True',
    'tf.false': 'False',
    'tf.shuffle': 'Shuffle T/F',
    'tf.emptyTitle': "True / False quiz can't be created yet",
    'tf.emptyDesc': 'You need at least two <code class="code-chip">Term: explanation</code> pairs so true and false statements can be created.',
    'tf.correctTitle': 'Correct!',
    'tf.wrongTitle': 'Not quite.',
    'tf.explainTrue': 'That statement is true: “{term}” does match that explanation.',
    'tf.explainFalse': 'That statement is false. That explanation actually belongs to “{correctTerm}”.',
    'tf.resultLabel': 'True / False result',
    'tf.retry': 'Retry T/F quiz',

    'match.label': 'Drag-to-Answer',
    'match.title': 'Draw a line, match the pair',
    'match.desc': 'Connect the questions on the left with the shuffled answers on the right. Drag from a question dot to an answer dot, or tap a question then tap its answer.',
    'match.instructions': 'Drag from the dot on the right of a question to the dot on the left of an answer.',
    'match.batch': 'Batch {i} / {n}',
    'match.pairs': '{n} pairs',
    'match.questionsAria': 'Questions',
    'match.answersAria': 'Shuffled answers',
    'match.connectQuestion': 'Connect the question: {text}',
    'match.connectAnswer': 'Choose the answer: {text}',
    'match.pending': 'Question selected. Now tap or drag to its matching answer.',
    'match.check': 'Check Answers',
    'match.next': 'Next batch →',
    'match.finish': 'See results',
    'match.retryBatch': 'Redo connections',
    'match.restart': 'Start over',
    'match.feedbackAll': 'All {n} pairs are correct!',
    'match.feedbackSome': '{correct} of {n} pairs are correct. The red lines show the pairs that need another look.',
    'match.feedbackReady': 'Every question is connected. Press Check Answers.',
    'match.score': '{n} correct',
    'match.emptyTitle': 'Matching cannot be created yet',
    'match.emptyDesc': 'You need at least two question-and-answer pairs. Create flashcards in the Term: explanation format first.',
    'match.summaryLabel': 'Drag-to-Answer result',
    'match.summaryTitle': 'Session complete!',
    'match.summaryText': 'You matched {correct} of {total} pairs correctly.',
    'match.imageOnly': 'Image without text',
    'match.questionImageAlt': 'Question image',
    'match.answerImageAlt': 'Answer image',
    'match.noPairs': 'Need 2 pairs',

    'timer.button': 'Set quiz timer',
    'timer.menu': 'Choose timer duration',
    'timer.menuTitle': 'Timer duration',
    'timer.seconds': '{n} seconds',
    'timer.timeUpTitle': "Time's up!",
    'timer.timeUpNote': 'This question is marked incorrect.',

    'streak.aria': 'Correct answer streak: {n}',
    'streak.title': 'Consecutive correct answers',
    'celebrate.badge': 'Outstanding score!',
    'celebrate.announce': 'Score {percent}%! Confetti celebration!',

    'result.retry': 'Retry quiz',
    'result.summary': '{score} of {total} correct. {text}',
    'result.great': 'Outstanding!',
    'result.greatText': "You've mastered almost all of the material. Keep it up!",
    'result.good': 'Great job!',
    'result.goodText': 'Most of the material is clear. Polish the rest.',
    'result.ok': 'Not bad',
    'result.okText': 'The basics are there. Review the tricky parts to make them stick.',
    'result.low': 'Keep practicing!',
    'result.lowText': 'Re-read the points you found hard, then retry the quiz.',

    'hint.empty': 'Your notes are still empty. Paste your lecture notes first.',
    'hint.short': 'Your notes are too short. Add explanations to at least two points, for example "Term: explanation".',
    'hint.fewCards': 'Not enough usable points yet. Make sure there are at least two points, for example two "Term: explanation" lines.',
    'hint.error': 'Something went wrong while preparing your material. Please try again.',
  },
};

function loadLanguage() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'id' || saved === 'en') return saved;
  } catch (error) {
    // localStorage bisa diblokir; abaikan dan pakai bahasa default.
  }
  return 'id';
}

function loadTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved && THEMES.some((theme) => theme.id === saved)) return saved;
  } catch (error) {
    // localStorage bisa diblokir; abaikan dan pakai tema default.
  }
  return DEFAULT_THEME;
}

let lang = loadLanguage();
let currentTheme = loadTheme();

function t(key, values = {}) {
  const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.id;
  let text = dictionary[key] ?? TRANSLATIONS.id[key] ?? key;

  Object.entries(values).forEach(([name, value]) => {
    text = text.split(`{${name}}`).join(String(value));
  });

  return text;
}

const state = {
  cards: [],
  quiz: [],
  cardIndex: 0,
  flipped: false,
  quizIndex: 0,
  score: 0,
  streak: 0,
  answered: false,
  tf: [],
  tfIndex: 0,
  tfScore: 0,
  tfStreak: 0,
  tfAnswered: false,
  loading: false,
  inputMode: 'paste',
  structuredRows: [],
};

let generateTimer = null;
let structuredRowSeed = 0;

/* ---------- Status Metode Feynman (v12.0–v12.1) ---------- */
const FEYNMAN_CHECK_KEYS = ['simple', 'jargon', 'example', 'complete'];

const feynmanState = {
  step: 1,
  source: 'card',
  cardIndex: 0,
  concept: '',
  reference: '',
  explanation: '',
  checklist: { simple: false, jargon: false, example: false, complete: false },
  hint: '',
  notice: '',
};

let feynmanHistory = [];
let feynmanSaveTimer = null;

/* ---------- Status Drag-to-Answer (v13.0) ---------- */
const MATCH_BATCH_SIZE = 5;

const matchState = {
  pairs: [],
  pairMap: new Map(),
  batches: [],
  batchIndex: 0,
  answerOrder: [],
  links: new Map(),
  checked: false,
  batchScores: new Map(),
  pendingQuestion: null,
  drag: null,
  summary: false,
};

let matchLineFrame = null;

// Kata umum yang tidak perlu dianggap sebagai celah pemahaman.
const FEYNMAN_STOPWORDS = new Set([
  'yang', 'dengan', 'untuk', 'dari', 'pada', 'adalah', 'dalam', 'akan', 'atau',
  'juga', 'karena', 'sebagai', 'oleh', 'ini', 'itu', 'dan', 'tidak', 'bisa',
  'dapat', 'agar', 'saat', 'ketika', 'jika', 'kalau', 'lebih', 'sangat', 'sudah',
  'belum', 'masih', 'hanya', 'antara', 'setiap', 'suatu', 'sebuah', 'para',
  'kami', 'kita', 'mereka', 'saya', 'kamu', 'anda', 'tersebut', 'secara',
  'the', 'and', 'that', 'this', 'with', 'from', 'into', 'when', 'then', 'than',
  'have', 'has', 'had', 'are', 'was', 'were', 'will', 'would', 'can', 'could',
  'should', 'about', 'their', 'there', 'which', 'while', 'your', 'you', 'for',
  'not', 'but', 'its', 'they', 'them', 'these', 'those', 'some', 'such',
]);

const $ = (selector) => document.querySelector(selector);

const els = {
  notes: $('#notes'),
  charCount: $('#char-count'),
  lineCount: $('#line-count'),
  btnSample: $('#btn-sample'),
  btnGenerate: $('#btn-generate'),
  generateLabel: $('#generate-label'),
  generateIcon: $('#generate-icon'),
  generateSpinner: $('#generate-spinner'),
  formHint: $('#form-hint'),

  modeButtons: Array.from(document.querySelectorAll('.mode-tab')),
  pastePanel: $('#paste-panel'),
  structuredPanel: $('#structured-panel'),
  pasteCounts: $('#paste-counts'),
  structuredCount: $('#structured-count'),
  structuredRows: $('#structured-rows'),
  structuredEmpty: $('#structured-empty'),
  btnAddRow: $('#btn-add-row'),
  tipsPaste: $('#tips-paste'),
  tipsStructured: $('#tips-structured'),

  btnClear: $('#btn-clear'),
  clearLabel: $('#clear-label'),
  btnExport: $('#btn-export'),
  btnImport: $('#btn-import'),
  fileInput: $('#file-input'),
  saveStatus: $('#save-status'),

  stats: $('#stats'),
  statCards: $('#stat-cards'),
  statQuiz: $('#stat-quiz'),

  studyEmpty: $('#study-empty'),
  studyPanels: $('#study-panels'),
  tabButtons: Array.from(document.querySelectorAll('.tab-btn')),
  langButtons: Array.from(document.querySelectorAll('.lang-btn')),

  themePicker: $('#theme-picker'),
  themeToggle: $('#theme-toggle'),
  themeMenu: $('#theme-menu'),
  themeOptions: $('#theme-options'),
  themeCurrentName: $('#theme-current-name'),
  themeCurrentSwatch: $('#theme-current-swatch'),

  tabCards: $('#tab-cards'),
  tabQuiz: $('#tab-quiz'),
  tabTf: $('#tab-tf'),
  tabMatch: $('#tab-match'),
  tabFeynman: $('#tab-feynman'),

  feynmanSteps: Array.from(document.querySelectorAll('.feynman-step-pill')),
  feynmanSourceButtons: Array.from(document.querySelectorAll('.feynman-source-btn')),
  feynmanStep1: $('#feynman-step-1'),
  feynmanStep2: $('#feynman-step-2'),
  feynmanStep3: $('#feynman-step-3'),
  feynmanHint: $('#feynman-hint'),
  feynmanCardPicker: $('#feynman-card-picker'),
  feynmanManualPicker: $('#feynman-manual-picker'),
  feynmanCardSelect: $('#feynman-card-select'),
  feynmanCardEmpty: $('#feynman-card-empty'),
  feynmanCardPreview: $('#feynman-card-preview'),
  feynmanConceptInput: $('#feynman-concept-input'),
  feynmanReferenceInput: $('#feynman-reference-input'),
  feynmanConceptVisual: $('.feynman-concept-visual'),
  feynmanConceptFigure: $('#feynman-concept-figure'),
  feynmanConceptImage: $('#feynman-concept-image'),
  feynmanConceptBadge: $('#feynman-concept-badge'),
  feynmanToolbar: $('#feynman-toolbar'),
  feynmanExplanation: $('#feynman-explanation'),
  feynmanCharCount: $('#feynman-char-count'),
  feynmanUserText: $('#feynman-user-text'),
  feynmanReferenceText: $('#feynman-reference-text'),
  feynmanReferenceFigure: $('#feynman-reference-figure'),
  feynmanReferenceImage: $('#feynman-reference-image'),
  feynmanGapText: $('#feynman-gap-text'),
  feynmanGapChips: $('#feynman-gap-chips'),
  feynmanChecks: Array.from(document.querySelectorAll('[data-feynman-check]')),
  feynmanSaveNotice: $('#feynman-save-notice'),
  feynmanHistoryList: $('#feynman-history-list'),
  feynmanHistoryEmpty: $('#feynman-history-empty'),
  feynmanHistoryCount: $('#feynman-history-count'),
  feynmanNext1: $('#feynman-next-1'),
  feynmanNext2: $('#feynman-next-2'),
  feynmanPrev2: $('#feynman-prev-2'),
  feynmanPrev3: $('#feynman-prev-3'),
  feynmanSave: $('#feynman-save'),
  feynmanRestart: $('#feynman-restart'),

  matchEmpty: $('#match-empty'),
  matchBody: $('#match-body'),
  matchSummary: $('#match-summary'),
  matchBatchInfo: $('#match-batch-info'),
  matchScore: $('#match-score'),
  matchBoard: $('#match-board'),
  matchQuestions: $('#match-questions'),
  matchAnswers: $('#match-answers'),
  matchOverlay: $('#match-overlay'),
  matchFeedback: $('#match-feedback'),
  matchCheck: $('#btn-match-check'),
  matchNext: $('#btn-match-next'),
  matchReset: $('#btn-match-reset'),
  matchRestart: $('#btn-match-restart'),
  matchSummaryRing: $('#match-summary-ring'),
  matchSummaryPercent: $('#match-summary-percent'),
  matchSummaryText: $('#match-summary-text'),

  cardCounter: $('#card-counter'),
  cardProgress: $('#card-progress'),
  flashcard: $('#flashcard'),
  cardBadge: $('#card-badge'),
  cardFront: $('#card-front'),
  cardBack: $('#card-back'),
  cardNumber: $('#card-number'),
  cardNumberBack: $('#card-number-back'),
  cardPrev: $('#card-prev'),
  cardNext: $('#card-next'),
  cardFlip: $('#card-flip'),
  cardShuffle: $('#card-shuffle'),

  quizBody: $('#quiz-body'),
  quizEmpty: $('#quiz-empty'),
  quizResult: $('#quiz-result'),
  quizCounter: $('#quiz-counter'),
  quizScore: $('#quiz-score'),
  quizStreak: $('#quiz-streak'),
  quizStreakValue: $('#quiz-streak-value'),
  quizProgress: $('#quiz-progress'),
  quizPrompt: $('#quiz-prompt'),
  quizContext: $('#quiz-context'),
  quizOptions: $('#quiz-options'),
  quizFeedback: $('#quiz-feedback'),
  quizNext: $('#quiz-next'),
  quizNextHint: $('#quiz-next-hint'),
  quizShuffle: $('#quiz-shuffle'),
  quizTimer: $('#quiz-timer'),
  quizTimerMenu: $('#quiz-timer-menu'),
  quizTimerProgress: $('#quiz-timer-progress'),
  quizTimerOptions: Array.from(document.querySelectorAll('#quiz-timer-menu .timer-option')),

  resultRing: $('#result-ring'),
  resultPercent: $('#result-percent'),
  resultTitle: $('#result-title'),
  resultText: $('#result-text'),
  resultReview: $('#result-review'),
  quizCelebration: $('#quiz-celebration'),
  btnRetry: $('#btn-retry'),
  btnShuffleResult: $('#btn-shuffle-result'),
  btnNew: $('#btn-new'),
  btnNew2: $('#btn-new-2'),

  tfEmpty: $('#tf-empty'),
  tfBody: $('#tf-body'),
  tfResult: $('#tf-result'),
  tfCounter: $('#tf-counter'),
  tfScore: $('#tf-score'),
  tfStreak: $('#tf-streak'),
  tfStreakValue: $('#tf-streak-value'),
  tfProgress: $('#tf-progress'),
  tfTerm: $('#tf-term'),
  tfDefinition: $('#tf-definition'),
  tfFeedback: $('#tf-feedback'),
  tfNext: $('#tf-next'),
  tfNextHint: $('#tf-next-hint'),
  tfTrue: $('#tf-true'),
  tfFalse: $('#tf-false'),
  tfShuffle: $('#tf-shuffle'),
  tfTimer: $('#tf-timer'),
  tfTimerMenu: $('#tf-timer-menu'),
  tfTimerProgress: $('#tf-timer-progress'),
  tfTimerOptions: Array.from(document.querySelectorAll('#tf-timer-menu .timer-option')),
  tfResultRing: $('#tf-result-ring'),
  tfResultPercent: $('#tf-result-percent'),
  tfResultTitle: $('#tf-result-title'),
  tfResultText: $('#tf-result-text'),
  tfCelebration: $('#tf-celebration'),
  btnTfRetry: $('#btn-tf-retry'),
  btnTfShuffleResult: $('#btn-tf-shuffle-result'),
  btnTfNew: $('#btn-tf-new'),

  confettiCanvas: $('#confetti-canvas'),
  celebrationStatus: $('#celebration-status'),
};

/* ============================================================
   Utilitas
   ============================================================ */

function escapeHtml(value) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value ?? '').replace(/[&<>"']/g, (char) => map[char]);
}

/** Fisher-Yates shuffle: acak array tanpa mengubah array asli. */
function shuffleArray(list) {
  const array = list.slice();
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function uniqueBy(items, keyOf) {
  const seen = new Set();
  const result = [];
  items.forEach((item) => {
    if (!item) return;
    const key = keyOf(item).trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push(item);
  });
  return result;
}

function capitalize(text) {
  const value = String(text ?? '');
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/* ---------- Gambar ---------- */

const imageKeyCache = new Map();

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

/** Kunci ringkas untuk data URL agar tidak membandingkan string base64 panjang. */
function imageKey(dataUrl) {
  if (!dataUrl) return '';
  const cached = imageKeyCache.get(dataUrl);
  if (cached) return cached;

  const key = `${dataUrl.length}-${hashString(dataUrl)}`;
  imageKeyCache.set(dataUrl, key);
  if (imageKeyCache.size > 240) {
    const oldest = imageKeyCache.keys().next().value;
    imageKeyCache.delete(oldest);
  }
  return key;
}

/**
 * Nilai sebuah field = teks + gambar. Keduanya ikut menjadi identitas supaya
 * dua nilai berteks sama tetapi fotonya berbeda tetap dianggap berbeda
 * (v9.1). Nilai tanpa teks dan tanpa foto dianggap kosong.
 */
function valueKey(text, image = '') {
  const normalized = String(text ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
  const imagePart = image ? imageKey(image) : '';
  if (!normalized && !imagePart) return '';
  return `t:${normalized}|i:${imagePart}`;
}

/**
 * Identitas satu soal lengkap: pasangan pertanyaan (teks + foto) dan
 * jawaban (teks + foto). Dipakai untuk menolak hanya soal yang benar-benar
 * kembar, bukan sekadar istilah berteks sama.
 */
function questionKey(term, termImage, explanation, explanationImage) {
  return `${valueKey(term, termImage)}||${valueKey(explanation, explanationImage)}`;
}

function isImageDataUrl(value) {
  return typeof value === 'string'
    && value.length > 22
    && value.length <= MAX_IMAGE_DATA_URL_LENGTH
    && /^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(value);
}

function normalizeImageValue(value) {
  return isImageDataUrl(value) ? value : '';
}

function imageMarkup(dataUrl, { alt = '', className = 'study-image' } = {}) {
  if (!isImageDataUrl(dataUrl)) return '';
  return `<img class="${className}" src="${escapeHtml(dataUrl)}" alt="${escapeHtml(alt)}" decoding="async" />`;
}

function fieldHasContent(text, image) {
  return Boolean(String(text ?? '').trim() || normalizeImageValue(image));
}

function dataUrlBytes(dataUrl) {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return dataUrl.length;
  const base64 = dataUrl.slice(comma + 1);
  return Math.floor((base64.length * 3) / 4);
}

/* ---------- Rich text ringan (v11.0) ---------- */

// Hanya tag ini yang boleh hidup di dalam teks materi. Semua tag lain
// di-escape lebih dulu, sehingga tidak ada jalan masuk untuk XSS.
const RICH_TEXT_TAGS = new Set(['b', 'i', 'strong', 'em', 'sup', 'sub']);
const RICH_TEXT_TAG_RE = /<(\/?)([a-z][a-z0-9]*)\s*\/?>/gi;
const RICH_TEXT_TOKEN_RE = /\u0000(\d+)\u0001/g;

/**
 * Ubah teks materi menjadi HTML aman.
 *
 * Urutan kerja sengaja dibuat begini:
 * 1. Tag yang diizinkan ditukar dengan token unik.
 * 2. Sisa teks di-escape, jadi `<script>` atau atribut berbahaya mati di sini.
 * 3. Sintaks ringan diterjemahkan: **tebal**, *miring*, x^2, H_2O.
 * 4. Token dikembalikan menjadi tag aslinya, lalu penanda rumpang dan baris
 *    baru diproses.
 *
 * Karena escaping terjadi sebelum sintaks diterjemahkan, tidak ada input
 * pengguna yang bisa menghasilkan tag di luar daftar putih di atas.
 */
function formatRichText(value) {
  const tags = [];
  const openTags = [];
  let text = String(value ?? '');

  text = text.replace(RICH_TEXT_TAG_RE, (match, closing, rawName) => {
    const name = rawName.toLowerCase();
    if (!RICH_TEXT_TAGS.has(name)) return match;

    if (closing) {
      // Tag penutup tanpa pasangan dibuang agar tidak merusak format sekitarnya.
      const last = openTags.lastIndexOf(name);
      if (last < 0) return '';
      openTags.splice(last, 1);
    } else {
      openTags.push(name);
    }

    const token = `\u0000${tags.length}\u0001`;
    tags.push(`<${closing ? '/' : ''}${name}>`);
    return token;
  });

  text = escapeHtml(text)
    // **tebal** lalu *miring* (diproses berurutan agar ** tidak terbaca miring).
    // Penanda harus menempel pada kata, jadi "5 * 3 * 2" tidak ikut dimiringkan.
    .replace(/\*\*([^\s*](?:[^*\n]*[^\s*])?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^\s*](?:[^*\n]*[^\s*])?)\*(?!\*)/g, '$1<em>$2</em>')
    // Pangkat: x^{n+1}, x^2, x^n.
    .replace(/\^\{([^}\n]+)\}/g, '<sup>$1</sup>')
    .replace(/\^(\d+(?:[.,]\d+)?)/g, '<sup>$1</sup>')
    .replace(/\^([A-Za-z])(?![A-Za-z0-9])/g, '<sup>$1</sup>')
    // Indeks: H_{2}O, H_2O, x_i. Garis bawah di dalam kata (file_name)
    // dibiarkan apa adanya karena huruf setelahnya masih bagian kata.
    .replace(/_\{([^}\n]+)\}/g, '<sub>$1</sub>')
    .replace(/_(\d+)/g, '<sub>$1</sub>')
    .replace(/_([A-Za-z])(?![A-Za-z0-9])/g, '<sub>$1</sub>');

  text = text.replace(RICH_TEXT_TOKEN_RE, (match, index) => tags[Number(index)] ?? '');

  return text
    .replace(/\[____\]/g, '<span class="blank" aria-label="bagian rumpang"></span>')
    .replace(/\n/g, '<br>');
}

/* ============================================================
   Parsing catatan
   ============================================================ */

function extractSegments(raw) {
  const segments = [];

  raw.split(/\r?\n/).forEach((rawLine) => {
    let line = rawLine.trim();
    if (!line) return;

    line = line
      .replace(/^[-*•·–—]+\s*/, '')
      .replace(/^\d+[.)]\s+/, '')
      .replace(/^#+\s*/, '')
      .trim();
    if (!line) return;

    const sentences = line.match(/[^.!?]+(?:[.!?]+|$)/g) || [line];
    const parts = sentences.map((part) => part.trim()).filter(Boolean);

    // Kalimat panjang dipecah, kecuali baris memang berupa satu poin utuh.
    if (parts.length > 1 && parts.every((part) => part.split(/\s+/).length >= 5)) {
      segments.push(...parts);
    } else {
      segments.push(line);
    }
  });

  return uniqueBy(segments, (segment) => segment.replace(/\s+/g, ' '));
}

function cleanTerm(value) {
  const term = value
    .replace(/^[\s"'“”‘’(\[]+/, '')
    .replace(/[\s"'“”‘’)\].,;:]+$/, '')
    .trim();

  if (term.length < 2 || term.length > 70) return '';
  if (term.split(/\s+/).length > 8) return '';
  return term;
}

function detectPair(text) {
  // Pasangan eksplisit boleh memakai penjelasan pendek, misalnya "DB: Basis data".
  const withSeparator = text.match(/^(.{2,70}?)\s*(?::|—|–|\s-\s|\s=\s|\s→\s)\s*(.{3,})$/);
  if (withSeparator) {
    const term = cleanTerm(withSeparator[1]);
    if (term) return { term, definition: capitalize(withSeparator[2].trim()) };
  }

  const withVerb = text.match(
    /^(.{3,70}?)\s+(adalah|ialah|merupakan|yaitu|yakni|merujuk pada|refers to|is|are|means)\s+(.{15,})$/i,
  );
  if (withVerb) {
    const term = cleanTerm(withVerb[1]);
    if (term) return { term, definition: capitalize(withVerb[3].trim()) };
  }

  return null;
}

function keyPhrase(sentence) {
  const words = sentence.replace(/[“”"'()[\]]/g, '').split(/\s+/).filter(Boolean);
  let start = 0;
  while (start < 3 && start < words.length && STOPWORDS.has(words[start].toLowerCase())) {
    start += 1;
  }
  if (start >= words.length) return '';

  const phrase = [words[start]];
  if (words[start].length <= 14 && start + 1 < words.length) {
    const next = words[start + 1];
    const nextLower = next.toLowerCase();
    const looksLikeVerb = /^(me|ber|ter|di)[a-z]{3,}$/.test(nextLower);
    if (!STOPWORDS.has(nextLower) && !VERB_WORDS.has(nextLower) && !looksLikeVerb) {
      phrase.push(next);
    }
  }

  const cleaned = phrase.join(' ').replace(/[.,;:!?]+$/, '');
  return cleaned.length >= 3 ? cleaned : '';
}

function buildCards(segments) {
  const cards = [];

  segments.forEach((segment) => {
    const text = segment.replace(/\s+/g, ' ').trim();
    if (text.length < MIN_CARD_TEXT_CHARS) return;

    const pair = detectPair(text);
    if (pair) {
      cards.push({
        kind: 'definition',
        term: pair.term,
        definition: pair.definition,
        source: text,
        sourceMode: 'paste',
      });
      return;
    }

    const phrase = keyPhrase(text);
    if (!phrase) return;

    const index = text.toLowerCase().indexOf(phrase.toLowerCase());
    const cloze = index >= 0
      ? `${text.slice(0, index)}[____]${text.slice(index + phrase.length)}`
      : text;

    cards.push({
      kind: 'concept',
      term: phrase,
      definition: text,
      source: text,
      cloze,
      sourceMode: 'paste',
    });
  });

  return uniqueBy(cards, (card) => card.term);
}

/* ============================================================
   Formulir soal terstruktur
   ============================================================ */

function cleanStructuredValue(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function createStructuredRow(term = '', explanation = '', termImage = '', explanationImage = '') {
  structuredRowSeed += 1;
  return {
    id: `srow-${structuredRowSeed}`,
    term: String(term ?? ''),
    explanation: String(explanation ?? ''),
    termImage: normalizeImageValue(termImage),
    explanationImage: normalizeImageValue(explanationImage),
  };
}

function createEmptyStructuredRows(count = MIN_STRUCTURED_ROWS) {
  return Array.from({ length: count }, () => createStructuredRow());
}

/** Terima data dari localStorage / impor dan buang entri yang bukan objek. */
function normalizeStructuredRows(rows) {
  if (!Array.isArray(rows)) return null;

  return rows
    .slice(0, MAX_STRUCTURED_ROWS)
    .filter((row) => row && typeof row === 'object')
    .map((row) => createStructuredRow(
      typeof row.term === 'string' ? row.term : '',
      typeof row.explanation === 'string'
        ? row.explanation
        : typeof row.definition === 'string'
          ? row.definition
          : '',
      row.termImage,
      row.explanationImage,
    ));
}

function autoGrowTextarea(field) {
  if (!field) return;
  field.style.height = 'auto';
  field.style.height = `${Math.max(field.scrollHeight, 44)}px`;
}

function autoGrowStructuredRows() {
  els.structuredRows.querySelectorAll('.structured-input').forEach(autoGrowTextarea);
}

function focusStructuredCell(rowId, field = 'term') {
  const rowEl = Array.from(els.structuredRows.children)
    .find((element) => element.dataset.rowId === rowId);
  if (!rowEl) return;

  const fieldEl = rowEl.querySelector(`[data-field="${field}"]`);
  if (fieldEl) fieldEl.focus();
}

function structuredImageValue(row, field) {
  return normalizeImageValue(field === 'term' ? row.termImage : row.explanationImage);
}

function structuredImageButton(row, index, field, disabled) {
  const image = structuredImageValue(row, field);
  const fieldName = t(field === 'term' ? 'structured.imageFieldTerm' : 'structured.imageFieldExplanation');
  const key = image ? 'structured.imageChangeAria' : 'structured.imageAddAria';
  const label = t(image ? 'structured.imageChange' : 'structured.imageAdd');

  return `
    <button
      type="button"
      class="image-btn"
      data-pick-image="${field}"
      data-row-id="${row.id}"
      aria-label="${escapeHtml(t(key, { field: fieldName, n: index + 1 }))}"
      title="${escapeHtml(t(key, { field: fieldName, n: index + 1 }))}"${disabled}
    >
      <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.12" aria-hidden="true">
        <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1.2-2h5.4l1.2 2h1.6A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" stroke-linejoin="round" />
        <circle cx="12" cy="12.5" r="3.2" />
      </svg>
      <span>${escapeHtml(label)}</span>
    </button>`;
}

function structuredImagePreview(row, index, field, disabled) {
  const image = structuredImageValue(row, field);
  if (!image) {
    return `<div class="structured-image-preview hidden" data-image-preview="${field}"></div>`;
  }

  const fieldName = t(field === 'term' ? 'structured.imageFieldTerm' : 'structured.imageFieldExplanation');
  const removeLabel = t('structured.imageRemoveAria', { field: fieldName, n: index + 1 });

  return `
    <div class="structured-image-preview" data-image-preview="${field}">
      ${imageMarkup(image, { alt: t('image.alt'), className: 'structured-thumb' })}
      <button
        type="button"
        class="image-remove"
        data-remove-image="${field}"
        data-row-id="${row.id}"
        aria-label="${escapeHtml(removeLabel)}"
        title="${escapeHtml(removeLabel)}"${disabled}
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" stroke-linecap="round" />
        </svg>
      </button>
    </div>`;
}

const RICH_FORMAT_TOOLS = [
  { tag: 'b', glyph: 'B', className: 'is-bold', labelKey: 'structured.formatBold' },
  { tag: 'i', glyph: 'I', className: 'is-italic', labelKey: 'structured.formatItalic' },
  { tag: 'sup', glyph: 'x²', className: '', labelKey: 'structured.formatSup' },
  { tag: 'sub', glyph: 'x₂', className: '', labelKey: 'structured.formatSub' },
];

/** Toolbar format yang bisa dipakai textarea mana pun lewat id target. */
function formatToolbarMarkup(targetId, disabled = '') {
  const buttons = RICH_FORMAT_TOOLS.map((tool) => {
    const label = t(tool.labelKey);
    const glyphClass = tool.className ? `format-glyph ${tool.className}` : 'format-glyph';

    return `
      <button
        type="button"
        class="format-btn"
        data-format="${tool.tag}"
        data-format-target="${escapeHtml(targetId)}"
        aria-label="${escapeHtml(label)}"
        title="${escapeHtml(label)}"${disabled}
      >
        <span class="${glyphClass}" aria-hidden="true">${tool.glyph}</span>
      </button>`;
  }).join('');

  return `
    <div class="structured-toolbar" role="group" aria-label="${escapeHtml(t('structured.formatGroup'))}">
      ${buttons}
    </div>`;
}

/** Bungkus pilihan pada textarea dengan tag format, atau lepaskan jika sudah dibungkus. */
function applyRichFormat(button) {
  const targetId = button.dataset.formatTarget;
  const textarea = targetId ? document.getElementById(targetId) : null;
  if (!textarea || textarea.disabled) return;

  const tag = button.dataset.format;
  if (!RICH_FORMAT_TOOLS.some((tool) => tool.tag === tag)) return;

  const open = `<${tag}>`;
  const close = `</${tag}>`;
  const value = textarea.value;
  const start = Number.isInteger(textarea.selectionStart) ? textarea.selectionStart : value.length;
  const end = Number.isInteger(textarea.selectionEnd) ? textarea.selectionEnd : start;
  const selected = value.slice(start, end);
  const before = value.slice(Math.max(0, start - open.length), start);
  const after = value.slice(end, end + close.length);

  // Tekan tombol yang sama dua kali: lepaskan tag di sekitar pilihan.
  if (before.toLowerCase() === open && after.toLowerCase() === close) {
    textarea.setRangeText(selected, start - open.length, end + close.length, 'select');
  } else {
    textarea.setRangeText(`${open}${selected}${close}`, start, end, 'select');
    const innerStart = start + open.length;
    textarea.setSelectionRange(innerStart, innerStart + selected.length);
  }

  textarea.focus({ preventScroll: true });
  // Biarkan handler input yang sudah ada memperbarui state, counter, dan auto-save.
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

function structuredFieldMarkup(row, index, field, disabled) {
  const isTerm = field === 'term';
  const inputId = `structured-${isTerm ? 'term' : 'explanation'}-${row.id}`;
  const label = isTerm ? t('structured.term') : t('structured.explanation');
  const placeholder = isTerm
    ? t('structured.termPlaceholder')
    : t('structured.explanationPlaceholder');
  const value = isTerm ? row.term : row.explanation;
  const fieldName = t(isTerm ? 'structured.imageFieldTerm' : 'structured.imageFieldExplanation');
  const hasImage = Boolean(structuredImageValue(row, field));
  const inputLabel = t(hasImage ? 'structured.imageChangeAria' : 'structured.imageAddAria', {
    field: fieldName,
    n: index + 1,
  });
  const rows = isTerm ? 2 : 3;

  return `
    <div class="structured-field" data-field-wrap="${field}">
      <div class="structured-field-head">
        <label class="structured-label" for="${inputId}">${escapeHtml(label)}</label>
        ${structuredImageButton(row, index, field, disabled)}
      </div>
      ${formatToolbarMarkup(inputId, disabled)}
      <textarea
        id="${inputId}"
        class="structured-input"
        data-field="${field}"
        rows="${rows}"
        spellcheck="false"
        aria-label="${escapeHtml(label)}"
        placeholder="${escapeHtml(placeholder)}"${disabled}
      >${escapeHtml(value)}</textarea>
      <input
        type="file"
        class="structured-image-input"
        accept="image/*"
        data-image-input="${field}"
        data-row-id="${row.id}"
        aria-label="${escapeHtml(inputLabel)}"
        hidden${disabled}
      />
      ${structuredImagePreview(row, index, field, disabled)}
    </div>`;
}

function renderStructuredRows({ focusRowId = null, focusField = 'term' } = {}) {
  const rows = state.structuredRows;

  els.structuredRows.innerHTML = rows
    .map((row, index) => {
      const rowLabel = t('structured.rowLabel', { n: index + 1 });
      const removeLabel = t('structured.remove', { n: index + 1 });
      const disabled = state.loading ? ' disabled' : '';

      return `
        <article class="structured-row" data-row-id="${row.id}" aria-labelledby="structured-label-${row.id}">
          <div class="structured-row-head">
            <span id="structured-label-${row.id}" class="structured-row-number">${escapeHtml(rowLabel)}</span>
            <button
              type="button"
              class="row-remove"
              data-remove-row="${row.id}"
              aria-label="${escapeHtml(removeLabel)}"
              title="${escapeHtml(removeLabel)}"${disabled}
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
                <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M10 11v6M14 11v6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
          ${structuredFieldMarkup(row, index, 'term', disabled)}
          ${structuredFieldMarkup(row, index, 'explanation', disabled)}
        </article>`;
    })
    .join('');

  els.structuredEmpty.classList.toggle('hidden', rows.length > 0);
  els.btnAddRow.disabled = state.loading;

  window.requestAnimationFrame(() => {
    autoGrowStructuredRows();
    if (focusRowId) focusStructuredCell(focusRowId, focusField);
  });
}

/** Perbarui hanya pratinjau foto pada satu baris, tanpa render ulang seluruh form. */
function renderRowImagePreview(rowEl, field, row) {
  if (!rowEl || !rowEl.isConnected) return;

  const index = state.structuredRows.indexOf(row);
  const preview = rowEl.querySelector(`[data-image-preview="${field}"]`);
  const button = rowEl.querySelector(`[data-pick-image="${field}"]`);

  if (preview) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = structuredImagePreview(row, Math.max(index, 0), field, '');
    const next = wrapper.firstElementChild;
    if (next) preview.replaceWith(next);
  }

  if (button) {
    const fieldName = t(field === 'term' ? 'structured.imageFieldTerm' : 'structured.imageFieldExplanation');
    const hasImage = Boolean(structuredImageValue(row, field));
    const label = t(hasImage ? 'structured.imageChange' : 'structured.imageAdd');
    const aria = t(hasImage ? 'structured.imageChangeAria' : 'structured.imageAddAria', {
      field: fieldName,
      n: Math.max(index, 0) + 1,
    });
    button.setAttribute('aria-label', aria);
    button.setAttribute('title', aria);
    const text = button.querySelector('span');
    if (text) text.textContent = label;

    const input = rowEl.querySelector(`[data-image-input="${field}"]`);
    if (input) input.setAttribute('aria-label', aria);
  }
}

function clearStructuredErrors() {
  els.structuredRows.querySelectorAll('.structured-row').forEach((rowEl) => {
    rowEl.classList.remove('has-error');
    rowEl.querySelectorAll('[data-field]').forEach((field) => {
      field.removeAttribute('aria-invalid');
    });
  });
}

function setStructuredRowErrors(rowIds) {
  const flagged = new Set(rowIds);

  els.structuredRows.querySelectorAll('.structured-row').forEach((rowEl) => {
    const hasError = flagged.has(rowEl.dataset.rowId);
    rowEl.classList.toggle('has-error', hasError);
    rowEl.querySelectorAll('[data-field]').forEach((field) => {
      if (hasError) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    });
  });
}

function countCompleteStructuredRows() {
  return state.structuredRows.filter(
    (row) => fieldHasContent(row.term, row.termImage)
      && fieldHasContent(row.explanation, row.explanationImage),
  ).length;
}

function hasInputData() {
  return els.notes.value.trim().length > 0
    || state.structuredRows.some(
      (row) => fieldHasContent(row.term, row.termImage)
        || fieldHasContent(row.explanation, row.explanationImage),
    );
}

function structuredSourceText(term, definition) {
  if (term && definition) return `${term}: ${definition}`;
  if (term) return term;
  return definition;
}

function buildStructuredCards() {
  const cards = state.structuredRows
    .map((row) => ({
      term: cleanStructuredValue(row.term),
      definition: cleanStructuredValue(row.explanation),
      termImage: normalizeImageValue(row.termImage),
      definitionImage: normalizeImageValue(row.explanationImage),
    }))
    .filter((row) => fieldHasContent(row.term, row.termImage)
      && fieldHasContent(row.definition, row.definitionImage))
    .map((row) => ({
      kind: 'definition',
      term: row.term,
      definition: row.definition,
      termImage: row.termImage,
      definitionImage: row.definitionImage,
      source: structuredSourceText(row.term, row.definition),
      sourceMode: 'structured',
    }));

  // Penjelasan boleh sama antar soal; istilah juga boleh berteks sama asalkan
  // foto atau jawabannya berbeda. Hanya soal yang benar-benar kembar dibuang.
  return uniqueBy(
    cards,
    (card) => questionKey(card.term, card.termImage, card.definition, card.definitionImage),
  );
}

/**
 * Validasi mode formulir:
 * - baris kosong diabaikan,
 * - setiap sisi boleh berisi teks, foto, atau keduanya,
 * - baris yang hanya terisi separuh dianggap belum lengkap,
 * - minimal dua baris lengkap,
 * - istilah boleh sama asalkan foto pertanyaan atau jawabannya berbeda,
 * - hanya soal yang benar-benar kembar (pertanyaan dan jawaban sama) ditolak.
 */
function validateStructuredRows() {
  clearStructuredErrors();

  const rows = state.structuredRows;
  const cleaned = rows.map((row, index) => {
    const term = cleanStructuredValue(row.term);
    const explanation = cleanStructuredValue(row.explanation);
    const termImage = normalizeImageValue(row.termImage);
    const explanationImage = normalizeImageValue(row.explanationImage);

    return {
      row,
      index,
      term,
      explanation,
      termImage,
      explanationImage,
      hasTerm: fieldHasContent(term, termImage),
      hasExplanation: fieldHasContent(explanation, explanationImage),
    };
  });
  const meaningful = cleaned.filter((entry) => entry.hasTerm || entry.hasExplanation);

  if (meaningful.length === 0) {
    return {
      ok: false,
      hint: t('structured.errorEmpty'),
      focus: rows[0] ? { id: rows[0].id, field: 'term' } : null,
    };
  }

  const incomplete = meaningful.find((entry) => !entry.hasTerm || !entry.hasExplanation);
  if (incomplete) {
    setStructuredRowErrors([incomplete.row.id]);
    return {
      ok: false,
      hint: t('structured.errorIncomplete', { n: incomplete.index + 1 }),
      focus: {
        id: incomplete.row.id,
        field: incomplete.hasTerm ? 'explanation' : 'term',
      },
    };
  }

  const complete = meaningful;

  if (complete.length < MIN_STRUCTURED_ROWS) {
    return {
      ok: false,
      hint: t('structured.errorMin'),
      focus: { id: complete[0].row.id, field: 'term' },
    };
  }

  const seenQuestions = new Map();
  for (const entry of complete) {
    const key = questionKey(
      entry.term,
      entry.termImage,
      entry.explanation,
      entry.explanationImage,
    );
    if (seenQuestions.has(key)) {
      const first = seenQuestions.get(key);
      setStructuredRowErrors([first.row.id, entry.row.id]);
      return {
        ok: false,
        hint: t('structured.errorDuplicateQuestion', {
          first: first.index + 1,
          second: entry.index + 1,
        }),
        focus: { id: entry.row.id, field: 'term' },
      };
    }
    seenQuestions.set(key, entry);
  }

  return {
    ok: true,
    cards: complete.map((entry) => ({
      kind: 'definition',
      term: entry.term,
      definition: entry.explanation,
      termImage: entry.termImage,
      definitionImage: entry.explanationImage,
      source: structuredSourceText(entry.term, entry.explanation),
      sourceMode: 'structured',
    })),
  };
}

function addStructuredRow() {
  if (state.loading) return;

  if (state.structuredRows.length >= MAX_STRUCTURED_ROWS) {
    showHint(t('structured.errorMax', { n: MAX_STRUCTURED_ROWS }));
    return;
  }

  const row = createStructuredRow();
  state.structuredRows.push(row);
  clearHint();
  renderStructuredRows({ focusRowId: row.id });
  updateCounters();
  saveNotes();
  flashSaveStatus();
}

function removeStructuredRow(rowId) {
  if (state.loading) return;

  const index = state.structuredRows.findIndex((row) => row.id === rowId);
  if (index < 0) return;

  state.structuredRows.splice(index, 1);
  clearStructuredErrors();
  clearHint();
  renderStructuredRows();
  updateCounters();
  saveNotes();
  flashSaveStatus();
  els.btnAddRow.focus({ preventScroll: true });
}

/* ---------- Unggah & kompresi foto ---------- */

function loadImageSource(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      const error = new Error('decode');
      error.code = 'decode';
      reject(error);
    };
    image.src = url;
  });
}

/**
 * Kecilkan resolusi dan turunkan kualitas gambar sebelum disimpan sebagai
 * Base64. Target akhir di bawah IMAGE_TARGET_BYTES agar localStorage awet.
 */
async function compressImageFile(file) {
  if (!file || !String(file.type || '').startsWith('image/')) {
    const error = new Error('type');
    error.code = 'type';
    throw error;
  }

  if (file.size > MAX_IMAGE_SOURCE_BYTES) {
    const error = new Error('size');
    error.code = 'size';
    throw error;
  }

  const image = await loadImageSource(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;

  if (!sourceWidth || !sourceHeight) {
    const error = new Error('decode');
    error.code = 'decode';
    throw error;
  }

  let scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(sourceWidth, sourceHeight));
  let quality = IMAGE_JPEG_QUALITY;
  let dataUrl = '';

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      const error = new Error('decode');
      error.code = 'decode';
      throw error;
    }

    // Latar putih mencegah area transparan menjadi hitam saat dikonversi ke JPEG.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    dataUrl = canvas.toDataURL('image/jpeg', quality);

    if (dataUrlBytes(dataUrl) <= IMAGE_TARGET_BYTES) break;
    if (quality > 0.5) quality = Math.max(0.5, quality - 0.08);
    else scale *= 0.82;
  }

  if (!isImageDataUrl(dataUrl)) {
    const error = new Error('decode');
    error.code = 'decode';
    throw error;
  }

  return dataUrl;
}

function setRowImageBusy(rowEl, field, busy) {
  if (!rowEl) return;

  rowEl.classList.toggle('is-image-busy', busy);
  const wrap = rowEl.querySelector(`[data-field-wrap="${field}"]`);
  if (wrap) wrap.classList.toggle('is-image-busy', busy);

  const button = rowEl.querySelector(`[data-pick-image="${field}"]`);
  if (button) button.disabled = busy;

  if (busy && button) {
    const text = button.querySelector('span');
    if (text) text.textContent = t('structured.imageProcessing');
  }
}

function findStructuredRowElement(rowId) {
  return Array.from(els.structuredRows.children)
    .find((element) => element.dataset.rowId === rowId) || null;
}

async function applyImageFileToRow(rowId, field, file) {
  if (state.loading || !file || (field !== 'term' && field !== 'explanation')) return;

  const row = state.structuredRows.find((item) => item.id === rowId);
  const rowEl = findStructuredRowElement(rowId);
  if (!row || !rowEl) return;

  setRowImageBusy(rowEl, field, true);

  try {
    const dataUrl = await compressImageFile(file);
    const target = state.structuredRows.find((item) => item.id === rowId);
    if (!target) return;

    target[field === 'term' ? 'termImage' : 'explanationImage'] = dataUrl;
    clearStructuredErrors();
    clearHint();
    updateCounters();
    saveNotes();
    flashSaveStatus();
  } catch (error) {
    const key = error && error.code === 'size'
      ? 'structured.imageErrorSize'
      : error && error.code === 'type'
        ? 'structured.imageErrorType'
        : 'structured.imageErrorRead';
    showHint(t(key));
  } finally {
    const current = state.structuredRows.find((item) => item.id === rowId);
    const currentEl = findStructuredRowElement(rowId);
    if (currentEl) {
      setRowImageBusy(currentEl, field, false);
      if (current) renderRowImagePreview(currentEl, field, current);
    }
  }
}

function removeStructuredRowImage(rowId, field) {
  if (state.loading) return;

  const row = state.structuredRows.find((item) => item.id === rowId);
  if (!row || (field !== 'term' && field !== 'explanation')) return;

  row[field === 'term' ? 'termImage' : 'explanationImage'] = '';
  renderRowImagePreview(findStructuredRowElement(rowId), field, row);
  clearStructuredErrors();
  clearHint();
  updateCounters();
  saveNotes();
  flashSaveStatus();
}

function togglePanel(panel, active) {
  panel.hidden = !active;
  panel.classList.toggle('hidden', !active);
  panel.setAttribute('aria-hidden', String(!active));
}

function setInputMode(mode, { persist = true, focus = false } = {}) {
  const next = mode === 'structured' ? 'structured' : 'paste';
  state.inputMode = next;
  clearHint();

  els.modeButtons.forEach((button) => {
    const active = button.dataset.inputMode === next;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });

  togglePanel(els.pastePanel, next === 'paste');
  togglePanel(els.structuredPanel, next === 'structured');
  els.tipsPaste.classList.toggle('hidden', next !== 'paste');
  els.tipsStructured.classList.toggle('hidden', next !== 'structured');

  updateCounters();

  if (next === 'structured') {
    window.requestAnimationFrame(autoGrowStructuredRows);
  }

  if (persist) saveNotes();
  if (focus) focusActiveInput();
}

function focusActiveInput() {
  if (state.inputMode === 'structured') {
    const first = state.structuredRows[0];
    if (first) focusStructuredCell(first.id, 'term');
    else els.btnAddRow.focus();
    return;
  }

  els.notes.focus();
}

/* ============================================================
   Penyusunan kuis
   ============================================================ */

/**
 * Ambil maksimal empat opsi unik berurutan dari pool asli. Blok empat baris
 * dipakai agar pengecoh tetap dekat dengan konteks jawaban. Posisi jawaban
 * benar sendiri diacak terpisah oleh randomizeAnswerPositions().
 * Jawaban benar tidak pernah dipakai sebagai pengecoh, pengecoh kembar
 * dibuang, dan opsi yang juga sah untuk pertanyaan yang sama (misalnya
 * jawaban baris lain dengan istilah dan foto identik) tidak dipakai.
 */
function buildOptionWindow(pool, correctOption, excludedKeys = null) {
  const correctKey = valueKey(correctOption.text, correctOption.image);
  const uniquePool = uniqueOptionPool(pool).filter((option) => {
    if (!excludedKeys || excludedKeys.size === 0) return true;
    const key = valueKey(option.text, option.image);
    return key === correctKey || !excludedKeys.has(key);
  });
  const lowerCorrect = String(correctOption.text ?? '').trim().toLowerCase();

  let correctIndex = uniquePool.findIndex(
    (option) => valueKey(option.text, option.image) === correctKey,
  );

  if (correctIndex < 0 && lowerCorrect) {
    correctIndex = uniquePool.findIndex(
      (option) => String(option.text ?? '').trim().toLowerCase() === lowerCorrect,
    );
  }

  if (correctIndex < 0) {
    const options = [
      { text: correctOption.text, image: correctOption.image },
      ...uniquePool
        .filter((option) => valueKey(option.text, option.image) !== correctKey)
        .slice(0, 3),
    ];
    return { options, answerIndex: 0 };
  }

  const windowSize = 4;
  const blockStart = Math.min(
    Math.floor(correctIndex / windowSize) * windowSize,
    Math.max(0, uniquePool.length - windowSize),
  );

  const options = uniquePool.slice(blockStart, blockStart + windowSize);
  const answerIndex = options.findIndex(
    (option) => valueKey(option.text, option.image) === correctKey,
  );

  return {
    options,
    answerIndex: answerIndex >= 0 ? answerIndex : 0,
  };
}

function optionFrom(text, image) {
  return { text: String(text ?? ''), image: normalizeImageValue(image) };
}

function uniqueOptionPool(items) {
  const seen = new Set();
  const result = [];

  items.forEach((item) => {
    const option = optionFrom(item.text, item.image);
    const key = valueKey(option.text, option.image);
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push(option);
  });

  return result;
}

function makeQuestion(card, cards) {
  const termPool = uniqueOptionPool(
    cards.map((item) => ({ text: item.term, image: item.termImage })),
  );

  const definitionPool = uniqueOptionPool(
    cards
      .filter((item) => item.kind === 'definition')
      .map((item) => ({ text: item.definition, image: item.definitionImage })),
  );

  // Pertanyaan dikenali dari istilah + fotonya. Jawaban milik baris lain
  // dengan pertanyaan yang sama tetap sah, jadi tidak boleh dipakai sebagai
  // pengecoh.
  const termIdentity = valueKey(card.term, card.termImage);
  const siblingDefinitions = new Set();
  cards.forEach((item) => {
    if (valueKey(item.term, item.termImage) === termIdentity) {
      siblingDefinitions.add(valueKey(item.definition, item.definitionImage));
    }
  });

  const termText = String(card.term ?? '').trim();
  const sourceLower = String(card.source ?? '').toLowerCase();
  const termIndex = termText ? sourceLower.indexOf(termText.toLowerCase()) : -1;
  const canCloze = termIndex >= 0 && termPool.length >= 2;
  const canMatch = card.kind === 'definition' && definitionPool.length >= 2;

  // Bila jawaban unik terlalu sedikit untuk tiga pengecoh, pakai cloze dari
  // istilah unik agar soal tetap punya empat opsi yang berbeda.
  const useCloze = canCloze
    && (!canMatch || (definitionPool.length < 4 && termPool.length >= 4));

  if (canMatch && !useCloze) {
    const correct = optionFrom(card.definition, card.definitionImage);
    const { options, answerIndex } = buildOptionWindow(definitionPool, correct, siblingDefinitions);

    return {
      type: 'match',
      term: card.term,
      termImage: normalizeImageValue(card.termImage),
      definition: card.definition,
      definitionImage: normalizeImageValue(card.definitionImage),
      context: null,
      options,
      answerIndex,
      note: card.definition,
      noteImage: normalizeImageValue(card.definitionImage),
    };
  }

  if (canCloze) {
    const blanked = `${card.source.slice(0, termIndex)}[____]${card.source.slice(termIndex + card.term.length)}`;
    const correct = optionFrom(card.term, card.termImage);
    const { options, answerIndex } = buildOptionWindow(termPool, correct);

    return {
      type: 'cloze',
      term: card.term,
      termImage: normalizeImageValue(card.termImage),
      context: `“${blanked}”`,
      options,
      answerIndex,
      note: card.source,
      noteImage: '',
    };
  }

  return null;
}

function questionPrompt(question) {
  if (question.type === 'cloze') return t('quiz.promptCloze');
  if (String(question.term ?? '').trim()) {
    return t('quiz.promptMatch', { term: question.term });
  }
  return t('quiz.promptImage');
}

function questionExplanationHtml(question) {
  if (question.type === 'cloze') {
    return `
      <p class="rich-text">${formatRichText(t('quiz.explainCloze', { term: question.term }))}</p>
      ${imageMarkup(question.termImage, {
        alt: t('image.alt'),
        className: 'study-image feedback-image',
      })}`;
  }

  const termLabel = String(question.term ?? '').trim()
    ? `“${question.term}”`
    : t('image.termLabel');
  const definition = String(question.definition ?? '').trim();

  return `
    <p class="rich-text">${formatRichText(`${termLabel}${definition ? `: ${definition}` : ''}`)}</p>
    ${imageMarkup(question.definitionImage, {
      alt: t('image.alt'),
      className: 'study-image feedback-image',
    })}`;
}

function buildQuiz(cards) {
  const questions = [];

  // Satu soal per kartu, tanpa batas jumlah. Urutan soal mengikuti input,
  // tetapi posisi jawaban benar diacak agar tidak membentuk pola A-B-C-D.
  cards.forEach((card) => {
    const question = makeQuestion(card, cards);
    if (question) questions.push(question);
  });

  randomizeAnswerPositions(questions);

  return questions;
}

/**
 * Acak ulang opsi satu soal tanpa kehilangan jawaban benar.
 * Opsi ditandai sebelum diacak agar indeks jawaban tetap terlacak dengan tepat.
 */
function shuffleQuestionOptions(question) {
  if (!Array.isArray(question.options) || question.options.length < 2) return;
  if (!Number.isInteger(question.answerIndex)) return;
  if (question.answerIndex < 0 || question.answerIndex >= question.options.length) return;

  const taggedOptions = question.options.map((option, index) => ({
    option,
    isCorrect: index === question.answerIndex,
  }));

  const shuffled = shuffleArray(taggedOptions);
  question.options = shuffled.map((entry) => entry.option);
  question.answerIndex = shuffled.findIndex((entry) => entry.isCorrect);
}

/** Acak ulang opsi untuk seluruh soal MCQ aktif. */
function shuffleQuizOptions() {
  state.quiz.forEach(shuffleQuestionOptions);
}

/**
 * Sebar posisi jawaban benar secara acak dan merata ke seluruh soal.
 *
 * Setiap soal memakai posisi yang paling jarang terpakai agar sebaran A–D
 * seimbang, dan posisi yang sama tidak dipakai dua soal berturut-turut.
 * Hasilnya bukan pola tetap, tetapi tetap acak setiap kuis disusun ulang.
 * Opsi hanya ditukar posisinya, jadi pengecoh tetap unik dan jawaban benar
 * tidak pernah hilang.
 */
function randomizeAnswerPositions(questions) {
  const usable = questions.filter(
    (question) => Array.isArray(question.options)
      && question.options.length >= 2
      && Number.isInteger(question.answerIndex)
      && question.answerIndex >= 0
      && question.answerIndex < question.options.length,
  );
  if (usable.length === 0) return;

  const usage = [0, 0, 0, 0];
  const targets = [];
  let previous = -1;

  usable.forEach((question) => {
    const size = Math.min(question.options.length, usage.length);
    const candidates = [];
    for (let position = 0; position < size; position += 1) {
      if (position !== previous) candidates.push(position);
    }

    const pool = candidates.length > 0 ? candidates : [0];
    const lowest = Math.min(...pool.map((position) => usage[position]));
    const choices = pool.filter((position) => usage[position] === lowest);
    const target = choices[Math.floor(Math.random() * choices.length)];

    usage[target] += 1;
    previous = target;
    targets.push(target);
  });

  breakSequentialRun(targets, usable);

  usable.forEach((question, index) => {
    const target = targets[index];
    if (target === question.answerIndex) return;

    const displaced = question.options[question.answerIndex];
    question.options[question.answerIndex] = question.options[target];
    question.options[target] = displaced;
    question.answerIndex = target;
  });
}

/** Hindari pola A-B-C-D (naik atau turun) pada empat soal pertama. */
function breakSequentialRun(targets, questions) {
  if (targets.length < 4) return;

  const step = (targets[1] - targets[0] + 4) % 4;
  if (step !== 1 && step !== 3) return;

  const isRun = [0, 1, 2, 3].every(
    (offset) => targets[offset] === (targets[0] + offset * step) % 4,
  );
  if (!isRun) return;

  // Tukar dua posisi pertama, tetapi hanya bila keduanya valid untuk soal
  // yang bersangkutan (soal bisa memiliki kurang dari empat opsi).
  const canSwap = targets[1] < questions[0].options.length
    && targets[0] < questions[1].options.length;
  if (canSwap) [targets[0], targets[1]] = [targets[1], targets[0]];
}

/* ============================================================
   Penyusunan kuis True / False
   ============================================================ */

/**
 * Cocokkan setiap pernyataan salah dengan penjelasan milik istilah lain.
 *
 * `blockedKeys` berisi penjelasan yang sah untuk pertanyaan tersebut
 * (termasuk penjelasan baris lain dengan istilah dan foto yang sama), supaya
 * pernyataan yang sebenarnya benar tidak pernah dilabeli salah.
 *
 * Memakai algoritma Kuhn (pencocokan bipartit) supaya satu penjelasan hanya
 * dipakai sebagai pengecoh satu kali. Soal yang tidak mendapat pasangan
 * dibiarkan -1 dan nanti berubah menjadi pernyataan benar.
 */
function matchTfDistractors(blockedKeys, definitions) {
  const heldBy = definitions.map(() => -1);
  const chosen = blockedKeys.map(() => -1);

  const tryAssign = (questionIndex, visited) => {
    for (let valueIndex = 0; valueIndex < definitions.length; valueIndex += 1) {
      if (visited[valueIndex]) continue;
      if (blockedKeys[questionIndex].has(definitions[valueIndex].key)) continue;

      visited[valueIndex] = true;
      if (heldBy[valueIndex] === -1 || tryAssign(heldBy[valueIndex], visited)) {
        heldBy[valueIndex] = questionIndex;
        chosen[questionIndex] = valueIndex;
        return true;
      }
    }

    return false;
  };

  blockedKeys.forEach((_, questionIndex) => {
    tryAssign(questionIndex, definitions.map(() => false));
  });

  return chosen;
}

/**
 * Susun pernyataan dari pasangan definisi (Istilah: penjelasan).
 *
 * Jumlah pernyataan benar dan salah dibuat seimbang (selisih maksimal satu).
 * Pernyataan salah memakai penjelasan milik istilah lain, dan setiap
 * penjelasan hanya boleh menjadi pengecoh satu kali dalam satu sesi. Jawaban
 * asli tetap boleh tampil pada pernyataan benarnya sendiri.
 *
 * Opsi `{ randomize: true }` dipakai tombol Acak untuk mengacak kombinasi,
 * pengecoh, dan urutan pernyataan.
 */
function buildTrueFalseQuestions(cards, { randomize = false } = {}) {
  const pairs = cards.filter((card) => card.kind === 'definition');
  if (pairs.length < 2) return [];

  // Satu entri per penjelasan unik (teks + foto). Bila beberapa istilah berbagi
  // penjelasan yang sama, istilah pertama dipakai sebagai pemilik untuk feedback.
  const definitions = [];
  const seenDefinitions = new Set();
  pairs.forEach((pair) => {
    const key = valueKey(pair.definition, pair.definitionImage);
    if (!key || seenDefinitions.has(key)) return;
    seenDefinitions.add(key);
    definitions.push({
      key,
      definition: pair.definition,
      image: normalizeImageValue(pair.definitionImage),
      term: pair.term,
      termImage: normalizeImageValue(pair.termImage),
    });
  });

  // Penjelasan milik istilah yang sama (termasuk baris lain dengan istilah
  // dan foto identik) tetap sah, jadi tidak boleh menjadi pengecoh salah.
  const blockedByTerm = new Map();
  pairs.forEach((pair) => {
    const termKey = valueKey(pair.term, pair.termImage);
    if (!blockedByTerm.has(termKey)) blockedByTerm.set(termKey, new Set());
    blockedByTerm.get(termKey).add(valueKey(pair.definition, pair.definitionImage));
  });

  // Pola benar/salah seimbang: 2 soal -> 1 benar, 3 soal -> 2 benar, dst.
  const trueTarget = Math.ceil(pairs.length / 2);
  const falseTarget = pairs.length - trueTarget;

  // Cari pengecoh unik untuk semua soal lebih dulu (bukan hanya soal yang
  // sudah ditandai salah), lalu pilih soal mana yang tampil sebagai salah.
  // Dengan begitu soal yang punya pengecoh tetap bisa menyeimbangkan jumlah
  // Benar/Salah walau ada penjelasan yang kembar.
  const pool = randomize ? shuffleArray(definitions) : definitions;
  const chosen = matchTfDistractors(
    pairs.map((pair) => blockedByTerm.get(valueKey(pair.term, pair.termImage))),
    pool,
  );
  const matched = pairs.map((_, index) => index).filter((index) => chosen[index] >= 0);

  let falseIndexes;

  if (randomize) {
    falseIndexes = shuffleArray(matched).slice(0, falseTarget);
  } else {
    // Pola bawaan: soal ke-2, ke-4, dst. menjadi pernyataan salah.
    falseIndexes = matched
      .filter((index) => index % 2 === 1)
      .slice(0, falseTarget);

    if (falseIndexes.length < falseTarget) {
      const filler = matched.filter((index) => !falseIndexes.includes(index));
      falseIndexes = falseIndexes.concat(filler.slice(0, falseTarget - falseIndexes.length));
    }
  }

  const mismatches = new Map();
  falseIndexes.forEach((pairIndex) => {
    mismatches.set(pairIndex, pool[chosen[pairIndex]]);
  });

  const questions = pairs.map((pair, index) => {
    const mismatch = mismatches.get(index);

    // Tidak ada penjelasan lain yang tersisa, jadi tampilkan pasangan aslinya.
    if (!mismatch) {
      return {
        term: pair.term,
        termImage: normalizeImageValue(pair.termImage),
        definition: pair.definition,
        definitionImage: normalizeImageValue(pair.definitionImage),
        isTrue: true,
        correctTerm: pair.term,
        correctTermImage: normalizeImageValue(pair.termImage),
        selected: undefined,
        correct: undefined,
      };
    }

    return {
      term: pair.term,
      termImage: normalizeImageValue(pair.termImage),
      definition: mismatch.definition,
      definitionImage: mismatch.image,
      isTrue: false,
      correctTerm: mismatch.term,
      correctTermImage: mismatch.termImage,
      selected: undefined,
      correct: undefined,
    };
  });

  return randomize ? shuffleArray(questions) : questions;
}

/* ============================================================
   Render: flashcard
   ============================================================ */

function renderCard(options = {}) {
  const { animate = true, resetFace = true } = options;
  const card = state.cards[state.cardIndex];
  if (!card) return;

  if (resetFace) resetFlip();

  els.cardCounter.textContent = t('card.counter', { i: state.cardIndex + 1, n: state.cards.length });
  els.cardProgress.style.width = `${((state.cardIndex + 1) / state.cards.length) * 100}%`;
  const isStructured = card.sourceMode === 'structured';
  els.cardBadge.textContent = isStructured
    ? t('card.termBadge')
    : card.kind === 'definition'
      ? t('card.questionBadge')
      : t('card.clozeBadge');
  els.cardNumber.textContent = String(state.cardIndex + 1);
  els.cardNumberBack.textContent = String(state.cardIndex + 1);

  let frontText;
  if (card.kind === 'definition') {
    frontText = isStructured
      ? card.term
      : t('card.question', { term: card.term });
  } else {
    frontText = `“${card.cloze}”`;
  }

  const frontImage = card.kind === 'definition' && isStructured
    ? normalizeImageValue(card.termImage)
    : '';

  els.cardFront.className = card.kind === 'definition'
    ? 'card-content card-content--question'
    : 'card-content card-content--cloze';
  els.cardFront.innerHTML = `
    ${frontText ? `<div class="card-text rich-text">${formatRichText(frontText)}</div>` : ''}
    ${imageMarkup(frontImage, { alt: t('image.alt'), className: 'study-image card-image' })}`;

  els.cardBack.className = 'card-content card-content--answer';
  if (card.kind === 'definition') {
    els.cardBack.innerHTML = `
      ${card.definition ? `<div class="card-text rich-text">${formatRichText(card.definition)}</div>` : ''}
      ${imageMarkup(card.definitionImage, {
        alt: t('image.alt'),
        className: 'study-image card-image',
      })}`;
  } else {
    els.cardBack.innerHTML = `
      <span class="text-xl font-extrabold rich-text">${formatRichText(card.term)}</span>
      <span class="mt-2 block text-sm leading-relaxed text-white/80 rich-text">${formatRichText(card.definition)}</span>
    `;
  }

  els.cardPrev.disabled = state.cardIndex === 0;
  els.cardNext.disabled = state.cardIndex === state.cards.length - 1;
  els.cardFlip.textContent = t(state.flipped ? 'card.showQuestion' : 'card.flip');

  // Animasi halus saat kartu berganti.
  if (animate) {
    els.flashcard.classList.remove('card-swap');
    void els.flashcard.offsetWidth;
    els.flashcard.classList.add('card-swap');
  }
}

function resetFlip() {
  state.flipped = false;
  els.flashcard.classList.remove('is-flipped');
  els.flashcard.setAttribute('aria-pressed', 'false');
  els.cardFlip.textContent = t('card.flip');
}

function toggleFlip() {
  state.flipped = !state.flipped;
  els.flashcard.classList.toggle('is-flipped', state.flipped);
  els.flashcard.setAttribute('aria-pressed', String(state.flipped));
  els.cardFlip.textContent = t(state.flipped ? 'card.showQuestion' : 'card.flip');
}

function goToCard(step) {
  const next = state.cardIndex + step;
  if (next < 0 || next >= state.cards.length) return;
  state.cardIndex = next;
  renderCard();
}

/** Acak urutan flashcard tanpa mengubah isi catatan atau data kartu. */
function shuffleCards() {
  if (state.cards.length < 2) return;

  const current = state.cards[state.cardIndex];
  state.cards = shuffleArray(state.cards);

  // Pastikan kartu yang tampil benar-benar berbeda dari kartu sebelumnya.
  if (state.cards[0] === current) {
    const swapIndex = 1 + Math.floor(Math.random() * (state.cards.length - 1));
    [state.cards[0], state.cards[swapIndex]] = [state.cards[swapIndex], state.cards[0]];
  }

  state.cardIndex = 0;
  renderCard();
}

/* ============================================================
   Render: kuis
   ============================================================ */

function renderQuizQuestion() {
  const question = state.quiz[state.quizIndex];
  if (!question) return;

  const answered = Boolean(question.timedOut)
    || (question.selected !== undefined && question.selected !== null);
  state.answered = answered;

  els.quizCounter.textContent = t('quiz.counter', { i: state.quizIndex + 1, n: state.quiz.length });
  els.quizScore.textContent = t('quiz.score', { n: state.score });
  renderQuizStreak();
  els.quizProgress.style.width = `${((state.quizIndex + (answered ? 1 : 0)) / state.quiz.length) * 100}%`;

  els.quizPrompt.innerHTML = `
    <span class="rich-text">${formatRichText(questionPrompt(question))}</span>
    ${imageMarkup(question.termImage, {
      alt: t('image.alt'),
      className: 'study-image quiz-image',
    })}`;

  if (question.context) {
    els.quizContext.innerHTML = formatRichText(question.context);
    els.quizContext.classList.remove('hidden');
  } else {
    els.quizContext.innerHTML = '';
    els.quizContext.classList.add('hidden');
  }

  els.quizOptions.innerHTML = question.options
    .map(
      (option, index) => `
        <button type="button" class="quiz-option" data-index="${index}">
          <span class="option-key">${'ABCD'[index] || index + 1}</span>
          <span class="option-body flex-1">
            ${option.text ? `<span class="option-text rich-text">${formatRichText(option.text)}</span>` : ''}
            ${imageMarkup(option.image, {
              alt: t('image.alt'),
              className: 'study-image option-image',
            })}
          </span>
        </button>`,
    )
    .join('');

  els.quizFeedback.className = 'quiz-feedback mt-4 hidden';
  els.quizFeedback.innerHTML = '';
  els.quizNext.classList.add('hidden');
  els.quizNextHint.classList.add('hidden');

  // Saat bahasa diganti di tengah kuis, jawaban yang sudah dipilih tetap ditampilkan.
  if (answered) paintAnswer(question);
  ensureTimerForQuestion(quizTimer);
}

function selectAnswer(index) {
  if (state.answered) return;

  const question = state.quiz[state.quizIndex];
  if (!question || index < 0 || index >= question.options.length) return;

  state.answered = true;
  question.selected = index;
  question.timedOut = false;
  question.correct = index === question.answerIndex;
  stopTimer(quizTimer, { deactivate: false });

  if (question.correct) {
    state.score += 1;
    state.streak += 1;
  } else {
    state.streak = 0;
  }

  els.quizScore.textContent = t('quiz.score', { n: state.score });
  renderQuizStreak({ bump: question.correct });
  els.quizProgress.style.width = `${((state.quizIndex + 1) / state.quiz.length) * 100}%`;

  paintAnswer(question);
}

function paintAnswer(question) {
  Array.from(els.quizOptions.children).forEach((button, buttonIndex) => {
    button.disabled = true;
    if (buttonIndex === question.answerIndex) button.classList.add('is-correct');
    else if (buttonIndex === question.selected) button.classList.add('is-wrong');
    else button.classList.add('is-dim');
  });

  const feedbackTitle = question.correct
    ? t('quiz.correctTitle')
    : question.timedOut
      ? t('timer.timeUpTitle')
      : t('quiz.wrongTitle');

  els.quizFeedback.className = `quiz-feedback mt-4 animate-in ${question.correct ? 'is-correct' : 'is-wrong'}`;
  els.quizFeedback.innerHTML = `
    <p class="font-extrabold">${feedbackTitle}</p>
    ${question.timedOut ? `<p class="mt-1 font-semibold">${t('timer.timeUpNote')}</p>` : ''}
    <div class="quiz-feedback-body mt-1">${questionExplanationHtml(question)}</div>
  `;

  els.quizNext.textContent = state.quizIndex === state.quiz.length - 1
    ? t('quiz.seeResult')
    : t('quiz.next');
  els.quizNext.classList.remove('hidden');
  els.quizNextHint.classList.remove('hidden');
}

function nextQuestion() {
  if (!state.answered) return;
  cancelTimerAdvance(quizTimer);

  if (state.quizIndex >= state.quiz.length - 1) {
    showQuizResult();
    return;
  }

  state.quizIndex += 1;
  renderQuizQuestion();
}

function scoreCopy(percent) {
  if (percent >= 90) return { title: 'result.great', text: 'result.greatText' };
  if (percent >= 70) return { title: 'result.good', text: 'result.goodText' };
  if (percent >= 50) return { title: 'result.ok', text: 'result.okText' };
  return { title: 'result.low', text: 'result.lowText' };
}

function showQuizResult({ celebrate = true } = {}) {
  const total = state.quiz.length;
  const percent = total ? Math.round((state.score / total) * 100) : 0;

  resetTimer(quizTimer);
  state.streak = 0;
  renderQuizStreak();

  els.quizBody.classList.add('hidden');
  els.quizResult.classList.remove('hidden');
  els.quizResult.classList.remove('animate-in');
  void els.quizResult.offsetWidth;
  els.quizResult.classList.add('animate-in');

  els.resultRing.style.setProperty('--p', String(percent));
  els.resultPercent.textContent = `${percent}%`;

  const copy = scoreCopy(percent);

  els.resultTitle.textContent = t(copy.title);
  els.resultText.textContent = t('result.summary', {
    score: state.score,
    total,
    text: t(copy.text),
  });

  const missed = state.quiz.filter((question) => question.correct === false);
  els.resultReview.innerHTML = missed.length
    ? `
      <p class="text-xs font-extrabold uppercase tracking-wider text-slate-400">${t('quiz.reviewLabel')}</p>
      <ul class="mt-2 space-y-2">
        ${missed
          .map(
            (question) => `
          <li class="rounded-xl bg-rose-50/80 px-3.5 py-2.5 text-xs leading-relaxed text-rose-700 ring-1 ring-rose-100">
            <span class="font-extrabold rich-text">${formatRichText(
              String(question.term ?? '').trim() || t('image.termLabel'),
            )}</span>
            ${imageMarkup(question.termImage, {
              alt: t('image.alt'),
              className: 'study-image review-image',
            })}
            <span class="mt-1 block text-rose-600/90 rich-text">${formatRichText(question.note || '')}</span>
            ${imageMarkup(question.noteImage, {
              alt: t('image.alt'),
              className: 'study-image review-image',
            })}
          </li>`,
          )
          .join('')}
      </ul>`
    : '';

  updateCelebration(els.quizCelebration, percent, celebrate);
}

function resetQuiz() {
  state.quizIndex = 0;
  state.score = 0;
  state.streak = 0;
  state.answered = false;
  state.quiz.forEach((question) => {
    question.correct = undefined;
    question.selected = undefined;
    question.timedOut = false;
  });
  resetTimer(quizTimer);

  renderQuizStreak();
  stopConfetti();
  els.quizCelebration.hidden = true;
  els.quizResult.classList.add('hidden');
  els.quizBody.classList.remove('hidden');
}

/** Acak urutan soal dan opsi, reset progres, lalu mulai lagi dari soal pertama. */
function shuffleQuiz() {
  if (state.quiz.length < 2) return;

  const current = state.quiz[state.quizIndex];
  state.quiz = shuffleArray(state.quiz);

  // Pastikan soal baru tidak sama dengan soal yang sedang tampil.
  if (state.quiz[0] === current) {
    const swapIndex = 1 + Math.floor(Math.random() * (state.quiz.length - 1));
    [state.quiz[0], state.quiz[swapIndex]] = [state.quiz[swapIndex], state.quiz[0]];
  }

  shuffleQuizOptions();
  resetQuiz();
  renderQuizQuestion();
}

/* ============================================================
   Render: kuis True / False
   ============================================================ */

function renderTfQuestion() {
  const question = state.tf[state.tfIndex];
  if (!question) return;

  const answered = Boolean(question.timedOut)
    || (question.selected !== undefined && question.selected !== null);
  state.tfAnswered = answered;

  els.tfCounter.textContent = t('tf.counter', { i: state.tfIndex + 1, n: state.tf.length });
  els.tfScore.textContent = t('quiz.score', { n: state.tfScore });
  renderTfStreak();
  els.tfProgress.style.width = `${((state.tfIndex + (answered ? 1 : 0)) / state.tf.length) * 100}%`;

  els.tfTerm.innerHTML = `
    ${question.term ? `<span class="rich-text">${formatRichText(question.term)}</span>` : ''}
    ${imageMarkup(question.termImage, {
      alt: t('image.alt'),
      className: 'study-image tf-image',
    })}`;
  els.tfDefinition.innerHTML = `
    ${question.definition ? `<span class="rich-text">${formatRichText(question.definition)}</span>` : ''}
    ${imageMarkup(question.definitionImage, {
      alt: t('image.alt'),
      className: 'study-image tf-image',
    })}`;

  [els.tfTrue, els.tfFalse].forEach((button) => {
    button.disabled = false;
    button.classList.remove('is-selected', 'is-correct', 'is-wrong', 'is-dim');
  });

  els.tfFeedback.className = 'quiz-feedback mt-4 hidden';
  els.tfFeedback.innerHTML = '';
  els.tfNext.classList.add('hidden');
  els.tfNextHint.classList.add('hidden');

  // Saat bahasa diganti, jawaban yang sudah dipilih tetap ditampilkan.
  if (answered) paintTfAnswer(question);
  ensureTimerForQuestion(tfTimer);
}

function selectTfAnswer(answer) {
  if (state.tfAnswered) return;

  const question = state.tf[state.tfIndex];
  if (!question) return;

  state.tfAnswered = true;
  question.selected = answer;
  question.timedOut = false;
  question.correct = answer === question.isTrue;
  stopTimer(tfTimer, { deactivate: false });

  if (question.correct) {
    state.tfScore += 1;
    state.tfStreak += 1;
  } else {
    state.tfStreak = 0;
  }

  els.tfScore.textContent = t('quiz.score', { n: state.tfScore });
  renderTfStreak({ bump: question.correct });
  els.tfProgress.style.width = `${((state.tfIndex + 1) / state.tf.length) * 100}%`;

  paintTfAnswer(question);
}

function paintTfAnswer(question) {
  [
    { button: els.tfTrue, value: true },
    { button: els.tfFalse, value: false },
  ].forEach(({ button, value }) => {
    button.disabled = true;
    button.classList.remove('is-selected', 'is-correct', 'is-wrong', 'is-dim');

    if (question.timedOut) {
      button.classList.add(value === question.isTrue ? 'is-correct' : 'is-dim');
    } else if (value === question.selected) {
      button.classList.add('is-selected');
      button.classList.add(question.correct ? 'is-correct' : 'is-wrong');
    } else {
      button.classList.add('is-dim');
    }
  });

  const feedbackTitle = question.correct
    ? t('tf.correctTitle')
    : question.timedOut
      ? t('timer.timeUpTitle')
      : t('tf.wrongTitle');

  els.tfFeedback.className = `quiz-feedback mt-4 animate-in ${question.correct ? 'is-correct' : 'is-wrong'}`;
  const termLabel = String(question.term ?? '').trim() || t('image.termLabel');
  const ownerLabel = String(question.correctTerm ?? '').trim() || t('image.termLabel');

  els.tfFeedback.innerHTML = `
    <p class="font-extrabold">${feedbackTitle}</p>
    ${question.timedOut ? `<p class="mt-1 font-semibold">${t('timer.timeUpNote')}</p>` : ''}
    <p class="mt-1 rich-text">${formatRichText(
      question.isTrue
        ? t('tf.explainTrue', { term: termLabel })
        : t('tf.explainFalse', { term: termLabel, correctTerm: ownerLabel }),
    )}</p>
    ${question.isTrue ? '' : imageMarkup(question.correctTermImage, {
      alt: t('image.alt'),
      className: 'study-image feedback-image',
    })}
  `;

  els.tfNext.textContent = state.tfIndex === state.tf.length - 1
    ? t('quiz.seeResult')
    : t('quiz.next');
  els.tfNext.classList.remove('hidden');
  els.tfNextHint.classList.remove('hidden');
}

function nextTfQuestion() {
  if (!state.tfAnswered) return;
  cancelTimerAdvance(tfTimer);

  if (state.tfIndex >= state.tf.length - 1) {
    showTfResult();
    return;
  }

  state.tfIndex += 1;
  renderTfQuestion();
}

function showTfResult({ celebrate = true } = {}) {
  const total = state.tf.length;
  const percent = total ? Math.round((state.tfScore / total) * 100) : 0;

  resetTimer(tfTimer);
  state.tfStreak = 0;
  renderTfStreak();

  els.tfBody.classList.add('hidden');
  els.tfResult.classList.remove('hidden');
  els.tfResult.classList.remove('animate-in');
  void els.tfResult.offsetWidth;
  els.tfResult.classList.add('animate-in');

  els.tfResultRing.style.setProperty('--p', String(percent));
  els.tfResultPercent.textContent = `${percent}%`;

  const copy = scoreCopy(percent);

  els.tfResultTitle.textContent = t(copy.title);
  els.tfResultText.textContent = t('result.summary', {
    score: state.tfScore,
    total,
    text: t(copy.text),
  });

  updateCelebration(els.tfCelebration, percent, celebrate);
}

function resetTf() {
  state.tfIndex = 0;
  state.tfScore = 0;
  state.tfStreak = 0;
  state.tfAnswered = false;
  state.tf.forEach((question) => {
    question.selected = undefined;
    question.correct = undefined;
    question.timedOut = false;
  });
  resetTimer(tfTimer);

  renderTfStreak();
  stopConfetti();
  els.tfCelebration.hidden = true;
  els.tfResult.classList.add('hidden');
  els.tfBody.classList.remove('hidden');
}

/** Acak ulang kombinasi + urutan soal T/F, lalu mulai dari awal. */
function shuffleTf() {
  const questions = buildTrueFalseQuestions(state.cards, { randomize: true });
  if (questions.length === 0) return;

  state.tf = questions;
  resetTf();
  renderTfQuestion();
}

/* ============================================================
   Streak & konfeti
   ============================================================ */

let confettiFrame = null;
let celebrationTimer = null;

/**
 * Perbarui chip streak. Indikator hanya tampil saat streak >= 2.
 * `bump` dipakai untuk animasi kecil setiap kali streak bertambah.
 */
function renderStreak(element, valueElement, value, { bump = false } = {}) {
  if (!element || !valueElement) return;

  const active = value >= 2;
  element.hidden = !active;
  element.classList.toggle('is-active', active);
  element.title = t('streak.title');

  if (!active) {
    element.removeAttribute('aria-label');
    element.classList.remove('is-bump');
    return;
  }

  valueElement.textContent = String(value);
  element.setAttribute('aria-label', t('streak.aria', { n: value }));

  if (bump) {
    element.classList.remove('is-bump');
    void element.offsetWidth;
    element.classList.add('is-bump');
  }
}

function renderQuizStreak(options = {}) {
  renderStreak(els.quizStreak, els.quizStreakValue, state.streak, options);
}

function renderTfStreak(options = {}) {
  renderStreak(els.tfStreak, els.tfStreakValue, state.tfStreak, options);
}

/**
 * Tampilkan badge selebrasi dan jalankan konfeti untuk skor >= 80%.
 * `celebrate=false` dipakai saat re-render bahasa agar konfeti tidak diulang.
 */
function updateCelebration(badge, percent, celebrate) {
  const shouldCelebrate = percent >= 80;
  badge.hidden = !shouldCelebrate;

  if (!shouldCelebrate) {
    if (celebrate) stopConfetti();
    return;
  }

  if (celebrate) launchConfetti(percent);
}

function announceCelebration(percent) {
  if (!els.celebrationStatus) return;

  window.clearTimeout(celebrationTimer);
  els.celebrationStatus.textContent = '';
  celebrationTimer = window.setTimeout(() => {
    els.celebrationStatus.textContent = t('celebrate.announce', { percent });
    celebrationTimer = null;
  }, 80);
}

/** Hentikan animasi konfeti dan bersihkan canvas. Aman dipanggil berkali-kali. */
function stopConfetti() {
  if (confettiFrame !== null) {
    window.cancelAnimationFrame(confettiFrame);
    confettiFrame = null;
  }

  window.clearTimeout(celebrationTimer);
  celebrationTimer = null;
  if (els.celebrationStatus) els.celebrationStatus.textContent = '';

  const canvas = els.confettiCanvas;
  if (!canvas) return;

  const context = canvas.getContext('2d');
  if (context) {
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }

  canvas.hidden = true;
}

/** Efek konfeti ringan: satu canvas, satu loop RAF, lalu hilang otomatis. */
function launchConfetti(percent) {
  const canvas = els.confettiCanvas;
  if (!canvas) return;

  const reducedMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    stopConfetti();
    announceCelebration(percent);
    return;
  }

  stopConfetti();

  const context = canvas.getContext('2d');
  if (!context) return;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  canvas.hidden = false;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const palette = ['#4f46e5', '#7c3aed', '#c026d3', '#f59e0b', '#10b981', '#0ea5e9', '#f43f5e'];
  const pieces = Array.from({ length: 110 }, () => ({
    x: Math.random() * width,
    y: -20 - Math.random() * height * 0.35,
    vx: (Math.random() - 0.5) * 2.2,
    vy: 2.4 + Math.random() * 3.4,
    size: 5 + Math.random() * 6,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.22,
    color: palette[Math.floor(Math.random() * palette.length)],
    shape: Math.random() < 0.28 ? 'circle' : 'rect',
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.02 + Math.random() * 0.03,
  }));

  const duration = 3600;
  const startedAt = performance.now();
  let lastFrameAt = startedAt;
  announceCelebration(percent);

  function drawFrame(now) {
    const elapsed = now - startedAt;
    const delta = Math.min((now - lastFrameAt) / (1000 / 60), 3);
    lastFrameAt = now;

    const fade = elapsed > duration - 600
      ? Math.max(0, (duration - elapsed) / 600)
      : 1;

    context.clearRect(0, 0, width, height);
    context.globalAlpha = fade;

    pieces.forEach((piece) => {
      piece.x += (piece.vx + Math.sin(piece.sway) * 0.8) * delta;
      piece.y += piece.vy * delta;
      piece.vy += 0.035 * delta;
      piece.angle += piece.spin * delta;
      piece.sway += piece.swaySpeed * delta;

      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.angle);
      context.fillStyle = piece.color;

      if (piece.shape === 'circle') {
        context.beginPath();
        context.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
        context.fill();
      } else {
        context.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
      }

      context.restore();
    });

    if (elapsed >= duration) {
      stopConfetti();
      return;
    }

    confettiFrame = window.requestAnimationFrame(drawFrame);
  }

  confettiFrame = window.requestAnimationFrame(drawFrame);
}

/* ============================================================
   Timer kuis
   ============================================================ */

const TIMER_DURATIONS = [5, 10, 30, 60];
const TIMER_FEEDBACK_DELAY = 1300;

function createTimerController({ button, menu, progress, options, isAvailable, onTimeout }) {
  return {
    button,
    menu,
    progress,
    options,
    isAvailable,
    onTimeout,
    duration: 0,
    remaining: 0,
    running: false,
    deadline: 0,
    frame: null,
    advanceTimer: null,
  };
}

const quizTimer = createTimerController({
  button: els.quizTimer,
  menu: els.quizTimerMenu,
  progress: els.quizTimerProgress,
  options: els.quizTimerOptions,
  isAvailable: () => state.quiz.length > 0
    && !state.answered
    && !els.tabQuiz.classList.contains('hidden')
    && !els.quizBody.classList.contains('hidden')
    && els.quizResult.classList.contains('hidden'),
  onTimeout: handleQuizTimeout,
});

const tfTimer = createTimerController({
  button: els.tfTimer,
  menu: els.tfTimerMenu,
  progress: els.tfTimerProgress,
  options: els.tfTimerOptions,
  isAvailable: () => state.tf.length > 0
    && !state.tfAnswered
    && !els.tabTf.classList.contains('hidden')
    && !els.tfBody.classList.contains('hidden')
    && els.tfResult.classList.contains('hidden'),
  onTimeout: handleTfTimeout,
});

// Status awal: timer nonaktif sampai ada soal yang siap dikerjakan.
syncTimerAvailability(quizTimer);
syncTimerAvailability(tfTimer);

function timerFraction(controller) {
  if (controller.duration <= 0) return 0;
  return Math.max(0, Math.min(1, controller.remaining / (controller.duration * 1000)));
}

function paintTimer(controller) {
  const fraction = timerFraction(controller);
  controller.progress.style.strokeDashoffset = String(100 - fraction * 100);
  controller.button.classList.toggle('is-low', controller.running && fraction <= 0.25);
}

function syncTimerOptions(controller) {
  controller.options.forEach((option) => {
    const seconds = Number(option.dataset.seconds);
    const selected = controller.duration === seconds;
    option.textContent = t('timer.seconds', { n: seconds });
    option.classList.toggle('is-selected', selected);
    option.setAttribute('aria-checked', String(selected));
  });
}

function refreshTimerLabels(controller) {
  controller.button.setAttribute('aria-label', t('timer.button'));
  controller.button.title = t('timer.button');
  controller.menu.setAttribute('aria-label', t('timer.menu'));

  const title = controller.menu.querySelector('.timer-menu-title');
  if (title) title.textContent = t('timer.menuTitle');

  syncTimerOptions(controller);
}

function closeTimerMenu(controller, { restoreFocus = false } = {}) {
  if (!controller.menu) return false;

  const wasOpen = !controller.menu.hidden;
  controller.menu.hidden = true;
  controller.button.setAttribute('aria-expanded', 'false');

  if (wasOpen && restoreFocus) controller.button.focus();
  return wasOpen;
}

function closeAllTimerMenus(options = {}) {
  const quizClosed = closeTimerMenu(quizTimer, options);
  const tfClosed = closeTimerMenu(tfTimer, options);
  return quizClosed || tfClosed;
}

function isTimerMenuOpen() {
  return !quizTimer.menu.hidden || !tfTimer.menu.hidden;
}

function openTimerMenu(controller) {
  if (controller.button.disabled) return;

  closeAllTimerMenus();
  syncTimerOptions(controller);
  controller.menu.hidden = false;
  controller.button.setAttribute('aria-expanded', 'true');
}

function toggleTimerMenu(controller) {
  if (controller.menu.hidden) {
    openTimerMenu(controller);
  } else {
    closeTimerMenu(controller);
  }
}

function syncTimerAvailability(controller) {
  const available = controller.isAvailable();
  controller.button.disabled = !available;

  if (!available) closeTimerMenu(controller);
}

function cancelTimerAdvance(controller) {
  if (controller.advanceTimer === null) return;

  window.clearTimeout(controller.advanceTimer);
  controller.advanceTimer = null;
}

function scheduleTimerAdvance(controller, callback) {
  cancelTimerAdvance(controller);
  controller.advanceTimer = window.setTimeout(() => {
    controller.advanceTimer = null;
    callback();
  }, TIMER_FEEDBACK_DELAY);
}

function stopTimer(controller, { deactivate = false } = {}) {
  controller.running = false;

  if (controller.frame !== null) {
    window.cancelAnimationFrame(controller.frame);
    controller.frame = null;
  }

  cancelTimerAdvance(controller);
  closeTimerMenu(controller);
  controller.button.classList.remove('is-low');

  if (deactivate) {
    controller.duration = 0;
    controller.remaining = 0;
    controller.progress.style.strokeDashoffset = '100';
    controller.button.classList.remove('is-active', 'is-low', 'is-timeout');
    syncTimerOptions(controller);
  } else {
    controller.button.classList.remove('is-timeout');
    paintTimer(controller);
    syncTimerOptions(controller);
  }

  syncTimerAvailability(controller);
}

function resetTimer(controller) {
  stopTimer(controller, { deactivate: true });
}

function startTimer(controller, seconds) {
  if (!controller.isAvailable() || !TIMER_DURATIONS.includes(seconds)) return;

  stopTimer(controller, { deactivate: false });

  controller.duration = seconds;
  controller.remaining = seconds * 1000;
  controller.deadline = performance.now() + controller.remaining;
  controller.running = true;

  controller.button.classList.add('is-active');
  controller.button.classList.remove('is-low', 'is-timeout');
  closeTimerMenu(controller);
  syncTimerOptions(controller);
  paintTimer(controller);
  syncTimerAvailability(controller);

  controller.frame = window.requestAnimationFrame((now) => tickTimer(controller, now));
}

function tickTimer(controller, now) {
  if (!controller.running) return;

  controller.remaining = Math.max(0, controller.deadline - now);
  paintTimer(controller);

  if (controller.remaining <= 0) {
    finishTimer(controller);
    return;
  }

  controller.frame = window.requestAnimationFrame((nextNow) => tickTimer(controller, nextNow));
}

function finishTimer(controller) {
  if (!controller.running) return;

  controller.remaining = 0;
  controller.running = false;

  if (controller.frame !== null) {
    window.cancelAnimationFrame(controller.frame);
    controller.frame = null;
  }

  cancelTimerAdvance(controller);
  controller.progress.style.strokeDashoffset = '100';
  controller.button.classList.remove('is-low');
  controller.button.classList.add('is-timeout');
  closeTimerMenu(controller);
  controller.onTimeout(controller);
}

function selectTimerDuration(controller, seconds) {
  if (!controller.isAvailable() || !TIMER_DURATIONS.includes(seconds)) return;

  startTimer(controller, seconds);
  controller.button.focus({ preventScroll: true });
}

function ensureTimerForQuestion(controller) {
  syncTimerAvailability(controller);

  if (!controller.isAvailable()) {
    if (controller.running) stopTimer(controller, { deactivate: false });
    return;
  }

  if (controller.duration > 0 && !controller.running) {
    startTimer(controller, controller.duration);
  }
}

function handleQuizTimeout(controller) {
  const question = state.quiz[state.quizIndex];
  if (!question || state.answered) return;

  state.answered = true;
  question.selected = null;
  question.correct = false;
  question.timedOut = true;
  state.streak = 0;

  els.quizScore.textContent = t('quiz.score', { n: state.score });
  renderQuizStreak();
  els.quizProgress.style.width = `${((state.quizIndex + 1) / state.quiz.length) * 100}%`;
  paintAnswer(question);
  syncTimerAvailability(controller);
  scheduleTimerAdvance(controller, advanceQuizAfterTimeout);
}

function advanceQuizAfterTimeout() {
  const question = state.quiz[state.quizIndex];
  if (!state.answered || !question || !question.timedOut) return;

  if (state.quizIndex >= state.quiz.length - 1) {
    showQuizResult();
    return;
  }

  state.quizIndex += 1;
  renderQuizQuestion();
}

function handleTfTimeout(controller) {
  const question = state.tf[state.tfIndex];
  if (!question || state.tfAnswered) return;

  state.tfAnswered = true;
  question.selected = null;
  question.correct = false;
  question.timedOut = true;
  state.tfStreak = 0;

  els.tfScore.textContent = t('quiz.score', { n: state.tfScore });
  renderTfStreak();
  els.tfProgress.style.width = `${((state.tfIndex + 1) / state.tf.length) * 100}%`;
  paintTfAnswer(question);
  syncTimerAvailability(controller);
  scheduleTimerAdvance(controller, advanceTfAfterTimeout);
}

function advanceTfAfterTimeout() {
  const question = state.tf[state.tfIndex];
  if (!state.tfAnswered || !question || !question.timedOut) return;

  if (state.tfIndex >= state.tf.length - 1) {
    showTfResult();
    return;
  }

  state.tfIndex += 1;
  renderTfQuestion();
}

/* ============================================================
   Render: keseluruhan
   ============================================================ */

function updateStats() {
  els.statCards.textContent = t('stats.cards', { n: state.cards.length });
  els.statQuiz.textContent = t('stats.questions', { n: state.quiz.length });
  els.stats.classList.remove('hidden');
}

function switchTab(tabName) {
  stopConfetti();

  els.tabButtons.forEach((button) => {
    const active = button.dataset.tab === tabName;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
  });

  els.tabCards.classList.toggle('hidden', tabName !== 'cards');
  els.tabQuiz.classList.toggle('hidden', tabName !== 'quiz');
  els.tabTf.classList.toggle('hidden', tabName !== 'tf');
  els.tabMatch.classList.toggle('hidden', tabName !== 'match');
  els.tabFeynman.classList.toggle('hidden', tabName !== 'feynman');

  if (tabName !== 'quiz') resetTimer(quizTimer);
  if (tabName !== 'tf') resetTimer(tfTimer);
  if (tabName !== 'match') cancelMatchDrag();

  closeAllTimerMenus();
  if (tabName === 'quiz') syncTimerAvailability(quizTimer);
  if (tabName === 'tf') syncTimerAvailability(tfTimer);
  if (tabName === 'match') renderMatch();
  if (tabName === 'feynman') renderFeynman();
}

function renderWorkspace() {
  const hasCards = state.cards.length > 0;

  els.studyEmpty.classList.toggle('hidden', hasCards);
  els.studyPanels.classList.toggle('hidden', !hasCards);
  updateStats();
  resetMatchSession();
  els.cardShuffle.disabled = state.cards.length < 2;
  els.quizShuffle.disabled = state.quiz.length < 2;
  els.btnShuffleResult.disabled = state.quiz.length < 2;
  els.tfShuffle.disabled = state.tf.length < 2;
  els.btnTfShuffleResult.disabled = state.tf.length < 2;

  if (!hasCards) return;

  state.cardIndex = 0;
  renderCard();

  resetQuiz();
  if (state.quiz.length > 0) {
    els.quizEmpty.classList.add('hidden');
    renderQuizQuestion();
  } else {
    els.quizBody.classList.add('hidden');
    els.quizResult.classList.add('hidden');
    els.quizEmpty.classList.remove('hidden');
  }

  resetTf();
  if (state.tf.length > 0) {
    els.tfEmpty.classList.add('hidden');
    renderTfQuestion();
  } else {
    els.tfBody.classList.add('hidden');
    els.tfResult.classList.add('hidden');
    els.tfEmpty.classList.remove('hidden');
  }

  switchTab('cards');
}

/* ============================================================
   Tema warna aksen (v10.0)
   ============================================================ */

let themeMenuOpen = false;

function getThemeOptionButtons() {
  if (!els.themeOptions) return [];
  return Array.from(els.themeOptions.querySelectorAll('.theme-option'));
}

function focusThemeOption(button) {
  if (!button) return;
  getThemeOptionButtons().forEach((option) => {
    option.tabIndex = -1;
  });
  button.tabIndex = 0;
  button.focus();
}

function refreshThemeUi() {
  const theme = THEMES.find((item) => item.id === currentTheme) || THEMES[0];

  if (els.themeCurrentSwatch) {
    els.themeCurrentSwatch.style.setProperty('--swatch', theme.swatch);
  }

  if (els.themeCurrentName) {
    els.themeCurrentName.textContent = t(`theme.${theme.id}`);
  }

  if (els.themeToggle) {
    const label = t('theme.title');
    els.themeToggle.title = label;
    els.themeToggle.setAttribute('aria-label', label);
  }

  if (els.themeOptions) {
    els.themeOptions.setAttribute('aria-label', t('theme.title'));
    getThemeOptionButtons().forEach((option) => {
      const isSelected = option.dataset.theme === currentTheme;
      const name = option.querySelector('.theme-name');
      if (name) name.textContent = t(`theme.${option.dataset.theme}`);
      option.classList.toggle('is-selected', isSelected);
      option.setAttribute('aria-selected', String(isSelected));
      option.tabIndex = isSelected ? 0 : -1;
    });
  }
}

function applyTheme(themeId, options = {}) {
  const { persist = true } = options;
  const theme = THEMES.find((item) => item.id === themeId);
  currentTheme = theme ? theme.id : DEFAULT_THEME;

  document.documentElement.dataset.theme = currentTheme;
  refreshThemeUi();

  if (persist) {
    try {
      window.localStorage.setItem(THEME_KEY, currentTheme);
    } catch (error) {
      // Penyimpanan diblokir: tema hanya berlaku untuk sesi ini.
    }
  }
}

function buildThemeOptions() {
  if (!els.themeOptions) return;

  els.themeOptions.innerHTML = '';
  THEMES.forEach((theme) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'theme-option';
    option.dataset.theme = theme.id;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', 'false');
    option.tabIndex = -1;

    const dot = document.createElement('span');
    dot.className = 'theme-dot';
    dot.style.setProperty('--swatch', theme.swatch);
    dot.setAttribute('aria-hidden', 'true');

    const name = document.createElement('span');
    name.className = 'theme-name';

    const check = document.createElement('span');
    check.className = 'theme-check';
    check.setAttribute('aria-hidden', 'true');
    check.textContent = '\u2713';

    option.append(dot, name, check);
    option.addEventListener('click', () => {
      applyTheme(theme.id);
      closeThemeMenu({ focusToggle: true });
    });

    els.themeOptions.append(option);
  });
}

function openThemeMenu(position = 'selected') {
  if (!els.themeMenu || !els.themeToggle) return;

  const options = getThemeOptionButtons();
  if (options.length === 0) return;

  els.themeMenu.hidden = false;
  els.themeMenu.classList.add('is-open');
  els.themeToggle.setAttribute('aria-expanded', 'true');
  themeMenuOpen = true;

  let index = options.findIndex((option) => option.dataset.theme === currentTheme);
  if (index < 0) index = 0;
  if (position === 'last') index = options.length - 1;

  focusThemeOption(options[index]);
}

function closeThemeMenu(options = {}) {
  const { focusToggle = false } = options;
  if (!els.themeMenu || !els.themeToggle) return;

  els.themeMenu.hidden = true;
  els.themeMenu.classList.remove('is-open');
  els.themeToggle.setAttribute('aria-expanded', 'false');
  themeMenuOpen = false;

  if (focusToggle) els.themeToggle.focus();
}

function toggleThemeMenu() {
  if (themeMenuOpen) {
    closeThemeMenu({ focusToggle: true });
  } else {
    openThemeMenu();
  }
}

function handleThemeMenuKeydown(event) {
  const options = getThemeOptionButtons();
  if (options.length === 0) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closeThemeMenu({ focusToggle: true });
    return;
  }

  if (event.key === 'Tab') {
    closeThemeMenu();
    return;
  }

  const currentIndex = options.indexOf(document.activeElement);
  let nextIndex = -1;

  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % options.length;
  } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
    nextIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
  } else if (event.key === 'Home') {
    nextIndex = 0;
  } else if (event.key === 'End') {
    nextIndex = options.length - 1;
  }

  if (nextIndex >= 0) {
    event.preventDefault();
    focusThemeOption(options[nextIndex]);
  }
}

/* ============================================================
   Bahasa
   ============================================================ */

function applyLanguage(nextLang, options = {}) {
  const { persist = true } = options;
  lang = nextLang === 'en' ? 'en' : 'id';

  document.documentElement.lang = lang;
  document.title = t('app.title');
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', t('app.meta'));

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    element.innerHTML = t(element.dataset.i18nHtml);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.setAttribute('placeholder', t(element.dataset.i18nPlaceholder));
  });

  document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAria));
  });

  els.langButtons.forEach((button) => {
    const isActive = button.dataset.lang === lang;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  refreshThemeUi();

  disarmClear();
  clearHint();

  refreshTimerLabels(quizTimer);
  refreshTimerLabels(tfTimer);

  renderStructuredRows();
  updateCounters();
  updateStats();
  renderFeynman();
  renderMatch();
  setLoading(state.loading);

  if (state.cards.length > 0) {
    renderCard({ animate: false, resetFace: false });

    if (!els.quizResult.classList.contains('hidden')) {
      showQuizResult({ celebrate: false });
    } else if (state.quiz.length > 0) {
      renderQuizQuestion();
    }

    if (!els.tfResult.classList.contains('hidden')) {
      showTfResult({ celebrate: false });
    } else if (state.tf.length > 0) {
      renderTfQuestion();
    }
  }

  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      // Penyimpanan diblokir: preferensi hanya berlaku untuk sesi ini.
    }
  }
}

/* ============================================================
   Aksi utama
   ============================================================ */

function updateCounters() {
  const value = els.notes.value;
  const points = value.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
  const completeRows = countCompleteStructuredRows();

  els.charCount.textContent = t('input.chars', { n: value.length });
  els.lineCount.textContent = t('input.points', { n: points });
  els.structuredCount.textContent = t('structured.count', {
    complete: completeRows,
    total: state.structuredRows.length,
  });

  const pasteActive = state.inputMode === 'paste';
  els.pasteCounts.classList.toggle('hidden', !pasteActive);
  els.structuredCount.classList.toggle('hidden', pasteActive);
}

function showHint(message, type = 'error') {
  els.formHint.textContent = message;
  els.formHint.className = `form-hint${type === 'success' ? ' is-success' : ''}`;
}

function clearHint() {
  els.formHint.textContent = '';
  els.formHint.className = 'form-hint hidden';
}

function setLoading(loading) {
  state.loading = loading;
  els.btnGenerate.disabled = loading;
  els.btnSample.disabled = loading;
  els.btnExport.disabled = loading;
  els.btnImport.disabled = loading;
  els.btnAddRow.disabled = loading;
  els.notes.disabled = loading;

  els.modeButtons.forEach((button) => {
    button.disabled = loading;
  });

  els.structuredRows.querySelectorAll(
    '.structured-input, .row-remove, .image-btn, .image-remove, .structured-image-input, .format-btn',
  ).forEach((field) => {
    field.disabled = loading;
  });

  els.generateSpinner.classList.toggle('hidden', !loading);
  els.generateIcon.classList.toggle('hidden', loading);
  els.generateLabel.textContent = loading ? t('input.loading') : t('input.generate');
}

/* ============================================================
   Penyimpanan catatan (auto-save, ekspor, impor)
   ============================================================ */

let saveTimer = null;
let saveStatusTimer = null;
let clearArmed = false;
let clearTimer = null;
let lastSaveSucceeded = true;

function structuredRowsForStorage() {
  return state.structuredRows.map((row) => ({
    term: row.term,
    explanation: row.explanation,
    termImage: normalizeImageValue(row.termImage),
    explanationImage: normalizeImageValue(row.explanationImage),
  }));
}

let saveQuotaWarned = false;

function isQuotaError(error) {
  return Boolean(error) && (
    error.name === 'QuotaExceededError'
    || error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    || error.code === 22
    || error.code === 1014
  );
}

function saveNotes() {
  try {
    window.localStorage.setItem(
      NOTES_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        inputMode: state.inputMode,
        notes: els.notes.value,
        structured: structuredRowsForStorage(),
        updatedAt: new Date().toISOString(),
      }),
    );
    saveQuotaWarned = false;
    lastSaveSucceeded = true;
  } catch (error) {
    // localStorage bisa diblokir; aplikasi tetap berjalan tanpa auto-save.
    lastSaveSucceeded = false;
    if (!saveQuotaWarned && isQuotaError(error)) {
      saveQuotaWarned = true;
      showHint(t('storage.quota'));
    }
  }
}

function scheduleSave() {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    saveTimer = null;
    saveNotes();
    flashSaveStatus();
  }, 350);
}

function flashSaveStatus() {
  if (!els.saveStatus || !lastSaveSucceeded) return;

  els.saveStatus.classList.add('is-visible');
  window.clearTimeout(saveStatusTimer);
  saveStatusTimer = window.setTimeout(() => {
    els.saveStatus.classList.remove('is-visible');
  }, 1900);
}

function readSavedInput() {
  const fallback = { inputMode: 'paste', notes: '', structured: null };

  try {
    const raw = window.localStorage.getItem(NOTES_KEY);
    if (!raw) return fallback;

    try {
      const parsed = JSON.parse(raw);

      if (typeof parsed === 'string') {
        return { ...fallback, notes: parsed };
      }

      if (!parsed || typeof parsed !== 'object') return fallback;

      return {
        inputMode: parsed.inputMode === 'structured' ? 'structured' : 'paste',
        notes: typeof parsed.notes === 'string'
          ? parsed.notes
          : typeof parsed.text === 'string'
            ? parsed.text
            : '',
        structured: Array.isArray(parsed.structured)
          ? normalizeStructuredRows(parsed.structured)
          : null,
      };
    } catch (error) {
      return { ...fallback, notes: raw }; // cadangan untuk data lama berupa teks biasa
    }
  } catch (error) {
    return fallback;
  }
}

function clearSavedNotes() {
  window.clearTimeout(saveTimer);
  saveTimer = null;

  try {
    window.localStorage.removeItem(NOTES_KEY);
  } catch (error) {
    // abaikan
  }
}

/** Pasang kartu yang sudah divalidasi lalu segarkan seluruh area belajar. */
function applyCards(cards, options = {}) {
  state.cards = cards;
  state.quiz = buildQuiz(cards);
  state.tf = buildTrueFalseQuestions(cards);
  state.cardIndex = 0;
  state.quizIndex = 0;
  state.score = 0;
  state.streak = 0;
  state.answered = false;
  state.tfIndex = 0;
  state.tfScore = 0;
  state.tfStreak = 0;
  state.tfAnswered = false;

  if (options.resetFeynman) {
    resetFeynmanDraft({ persist: false, render: false });
  }

  renderWorkspace();
  feynmanState.cardIndex = feynmanCardIndex();
  if (options.resetFeynman) persistFeynman();
  renderFeynman();
}

/** Muat kembali kedua mode input lalu susun materi dari mode yang aktif. */
function restoreSavedInput() {
  const saved = readSavedInput();

  els.notes.value = saved.notes;
  const hasStructuredContent = Array.isArray(saved.structured)
    && saved.structured.some(
      (row) => fieldHasContent(row.term, row.termImage)
        || fieldHasContent(row.explanation, row.explanationImage),
    );
  const hasSavedContent = saved.notes.trim().length > 0 || hasStructuredContent;
  state.structuredRows = saved.structured === null || !hasSavedContent
    ? createEmptyStructuredRows()
    : saved.structured;

  renderStructuredRows();
  setInputMode(saved.inputMode, { persist: false });
  updateCounters();

  const cards = state.inputMode === 'structured'
    ? buildStructuredCards()
    : buildCards(extractSegments(saved.notes));

  if (cards.length < 2) return;

  applyCards(cards);
}

/* ============================================================
   Metode Feynman (v12.0–v12.1)
   ============================================================ */

function feynmanCardIndex(value = feynmanState.cardIndex) {
  const max = state.cards.length - 1;
  if (max < 0) return 0;

  const index = Number(value);
  if (!Number.isInteger(index)) return 0;
  return Math.min(Math.max(index, 0), max);
}

/** Ambil judul konsep, kunci jawaban, dan gambar dari sebuah kartu. */
function feynmanCardInfo(card) {
  if (!card) {
    return { concept: '', reference: '', image: '', referenceImage: '' };
  }

  const reference = String(card.definition ?? card.source ?? '').trim();
  const concept = String(card.term ?? '').trim()
    || richTextToText(reference).slice(0, 80)
    || t('feynman.untitled');

  return {
    concept,
    reference,
    image: normalizeImageValue(card.termImage),
    referenceImage: normalizeImageValue(card.definitionImage),
  };
}

/**
 * Kartu yang sedang dipakai Feynman. Gambar hanya diambil dari kartu asli,
 * bukan dari state, supaya draf dan riwayat tetap ringan tanpa base64.
 */
function activeFeynmanCard() {
  if (feynmanState.source !== 'card') return null;
  return state.cards[feynmanCardIndex()] || null;
}

/** Ubah teks ber-markup menjadi teks polos untuk analisis celah. */
function richTextToText(value) {
  return String(value ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[*_]{1,3}/g, '')
    .replace(/[^\p{L}\p{N}\s-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeFeynmanChecklist(value) {
  const source = value && typeof value === 'object' ? value : {};

  return FEYNMAN_CHECK_KEYS.reduce((result, key) => {
    result[key] = Boolean(source[key]);
    return result;
  }, {});
}

function normalizeFeynmanEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;

  const concept = String(entry.concept ?? '').trim();
  const explanation = String(entry.explanation ?? '');
  if (!concept || !explanation.trim()) return null;

  const created = new Date(entry.createdAt);

  return {
    id: String(entry.id ?? `fx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
    concept: concept.slice(0, 200),
    explanation,
    reference: String(entry.reference ?? ''),
    source: entry.source === 'manual' ? 'manual' : 'card',
    missing: Array.isArray(entry.missing)
      ? entry.missing.slice(0, 8).map((word) => String(word))
      : [],
    checklist: normalizeFeynmanChecklist(entry.checklist),
    createdAt: Number.isNaN(created.getTime())
      ? new Date().toISOString()
      : created.toISOString(),
  };
}

function readFeynmanStore() {
  try {
    const raw = window.localStorage.getItem(FEYNMAN_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    return data && typeof data === 'object' && !Array.isArray(data) ? data : null;
  } catch (error) {
    return null;
  }
}

function feynmanDraftPayload() {
  return {
    step: feynmanState.step,
    source: feynmanState.source,
    cardIndex: feynmanState.cardIndex,
    concept: feynmanState.concept,
    reference: feynmanState.reference,
    explanation: feynmanState.explanation,
    checklist: { ...feynmanState.checklist },
    updatedAt: new Date().toISOString(),
  };
}

/** Tulis draf + riwayat ke kunci terpisah agar data v11.0 tetap utuh. */
function persistFeynman() {
  try {
    window.localStorage.setItem(
      FEYNMAN_KEY,
      JSON.stringify({
        version: FEYNMAN_VERSION,
        draft: feynmanDraftPayload(),
        history: feynmanHistory,
      }),
    );
    return true;
  } catch (error) {
    if (!saveQuotaWarned && isQuotaError(error)) {
      saveQuotaWarned = true;
      showHint(t('feynman.hintSaveQuota'));
    }
    return false;
  }
}

function queueFeynmanSave() {
  window.clearTimeout(feynmanSaveTimer);
  feynmanSaveTimer = window.setTimeout(() => {
    feynmanSaveTimer = null;
    persistFeynman();
  }, 400);
}

function resetFeynmanDraft({ persist = true, render = true } = {}) {
  feynmanState.step = 1;
  feynmanState.source = state.cards.length > 0 ? 'card' : 'manual';
  feynmanState.cardIndex = 0;
  feynmanState.concept = '';
  feynmanState.reference = '';
  feynmanState.explanation = '';
  feynmanState.checklist = normalizeFeynmanChecklist(null);
  feynmanState.hint = '';
  feynmanState.notice = '';

  if (persist) persistFeynman();
  if (render) renderFeynman();
}

function clearFeynmanStore() {
  window.clearTimeout(feynmanSaveTimer);
  feynmanSaveTimer = null;
  feynmanHistory = [];

  try {
    window.localStorage.removeItem(FEYNMAN_KEY);
  } catch (error) {
    // Penyimpanan diblokir; state di memori tetap dibersihkan.
  }

  resetFeynmanDraft({ persist: false });
}

function restoreFeynmanState() {
  const data = readFeynmanStore();
  if (!data) {
    resetFeynmanDraft({ persist: false });
    return;
  }

  if (Array.isArray(data.history)) {
    feynmanHistory = data.history
      .map(normalizeFeynmanEntry)
      .filter(Boolean)
      .slice(0, FEYNMAN_HISTORY_LIMIT);
  }

  const draft = data.draft && typeof data.draft === 'object' ? data.draft : null;
  if (draft) {
    feynmanState.source = draft.source === 'manual' ? 'manual' : 'card';
    feynmanState.cardIndex = feynmanCardIndex(draft.cardIndex);
    feynmanState.concept = String(draft.concept ?? '').slice(0, 200);
    feynmanState.reference = String(draft.reference ?? '');
    feynmanState.explanation = String(draft.explanation ?? '');
    feynmanState.checklist = normalizeFeynmanChecklist(draft.checklist);

    const step = Number(draft.step);
    feynmanState.step = Number.isInteger(step) ? Math.min(3, Math.max(1, step)) : 1;
  }

  renderFeynman();
}

/**
 * Cari kata kunci penting dari catatan asli yang belum muncul di penjelasan.
 * Pencocokan memakai awalan lima huruf agar bentuk berimbuhan tetap dianggap
 * sama, tanpa perlu kamus bahasa.
 */
function analyzeFeynmanGaps(explanation, reference) {
  const plainExplanation = richTextToText(explanation);
  const userWords = plainExplanation
    .toLowerCase()
    .split(/[^\p{L}\p{N}-]+/u)
    .filter(Boolean);
  const userSet = new Set(userWords);
  const userPrefixes = new Set(userWords.map((word) => word.slice(0, 5)));

  const seen = new Set();
  const missing = [];

  richTextToText(reference)
    .toLowerCase()
    .split(/[^\p{L}\p{N}-]+/u)
    .forEach((word) => {
      if (word.length < 4 || FEYNMAN_STOPWORDS.has(word) || /^\d+$/.test(word)) return;
      if (seen.has(word)) return;

      seen.add(word);
      if (userSet.has(word) || userPrefixes.has(word.slice(0, 5))) return;
      missing.push(word);
    });

  const wordCount = plainExplanation.split(/\s+/).filter(Boolean).length;

  return {
    missing: missing.slice(0, 6),
    short: wordCount < 20,
    wordCount,
  };
}

function updateFeynmanCounters() {
  if (!els.feynmanCharCount) return;

  const chars = feynmanState.explanation.length;
  const words = richTextToText(feynmanState.explanation).split(/\s+/).filter(Boolean).length;
  els.feynmanCharCount.textContent = `${t('feynman.charCount', { n: chars })} · ${t('feynman.wordCount', { n: words })}`;
}

function clearFeynmanHint() {
  feynmanState.hint = '';
  if (!els.feynmanHint) return;

  els.feynmanHint.textContent = '';
  els.feynmanHint.classList.add('hidden');
}

function renderFeynmanCardOptions() {
  if (!els.feynmanCardSelect) return;

  const hasCards = state.cards.length > 0;
  els.feynmanCardSelect.disabled = !hasCards;
  els.feynmanCardSelect.innerHTML = hasCards
    ? state.cards
      .map((card, index) => {
        const info = feynmanCardInfo(card);
        const label = info.image ? `${info.concept}${t('feynman.cardImageOption')}` : info.concept;
        return `<option value="${index}">${escapeHtml(label)}</option>`;
      })
      .join('')
    : `<option value="0">${escapeHtml(t('feynman.cardEmpty'))}</option>`;

  els.feynmanCardSelect.value = String(feynmanCardIndex());
  els.feynmanCardEmpty.classList.toggle('hidden', hasCards);
}

/**
 * Pratinjau gambar kartu di langkah 1. Kalau kartu tidak punya gambar,
 * seluruh blok disembunyikan supaya tidak menyisakan ruang kosong.
 */
function renderFeynmanCardPreview() {
  if (!els.feynmanCardPreview) return;

  const info = feynmanCardInfo(activeFeynmanCard());
  const hasImage = Boolean(info.image);

  els.feynmanCardPreview.classList.toggle('hidden', !hasImage);
  if (!hasImage) {
    els.feynmanCardPreview.innerHTML = '';
    return;
  }

  els.feynmanCardPreview.innerHTML = `
    <figure class="feynman-preview-figure">
      ${imageMarkup(info.image, {
        alt: t('feynman.cardImageAlt', { concept: info.concept }),
        className: 'feynman-preview-image',
      })}
      <figcaption class="feynman-preview-caption">${escapeHtml(t('feynman.cardImageCaption'))}</figcaption>
    </figure>
    <div class="feynman-preview-body">
      <p class="feynman-preview-label">${escapeHtml(t('feynman.previewLabel'))}</p>
      <p class="feynman-preview-text rich-text">${formatRichText(info.concept)}</p>
      <p class="feynman-preview-hint">${escapeHtml(t('feynman.previewHint'))}</p>
    </div>`;
}

/** Tampilkan gambar kartu di samping label konsep pada langkah 2. */
function renderFeynmanConceptVisual() {
  if (!els.feynmanConceptBadge) return;

  const concept = feynmanState.concept.trim();
  const info = feynmanCardInfo(activeFeynmanCard());
  const image = concept ? info.image : '';

  els.feynmanConceptBadge.innerHTML = formatRichText(
    concept ? t('feynman.conceptBadge', { concept }) : t('feynman.hintChooseConcept'),
  );
  els.feynmanConceptBadge.classList.toggle('is-empty', !concept);

  if (!els.feynmanConceptVisual || !els.feynmanConceptFigure || !els.feynmanConceptImage) return;

  els.feynmanConceptFigure.classList.toggle('hidden', !image);
  els.feynmanConceptVisual.classList.toggle('has-image', Boolean(image));

  if (image) {
    els.feynmanConceptImage.src = image;
    els.feynmanConceptImage.alt = t('feynman.cardImageAlt', { concept: info.concept });
  } else {
    els.feynmanConceptImage.removeAttribute('src');
    els.feynmanConceptImage.alt = '';
  }
}

function renderFeynmanChecklist() {
  els.feynmanChecks.forEach((input) => {
    input.checked = Boolean(feynmanState.checklist[input.dataset.feynmanCheck]);
  });
}

function renderFeynmanReview() {
  if (!els.feynmanUserText) return;

  const explanation = feynmanState.explanation.trim();
  const reference = feynmanState.reference.trim();
  const info = feynmanCardInfo(activeFeynmanCard());
  const referenceImage = info.referenceImage;
  const analysis = analyzeFeynmanGaps(feynmanState.explanation, feynmanState.reference);

  els.feynmanUserText.innerHTML = explanation
    ? formatRichText(explanation)
    : `<span class="feynman-placeholder">${escapeHtml(t('feynman.noExplanation'))}</span>`;

  els.feynmanReferenceText.innerHTML = reference
    ? formatRichText(reference)
    : (referenceImage ? '' : `<span class="feynman-placeholder">${escapeHtml(t('feynman.noReference'))}</span>`);

  if (els.feynmanReferenceFigure && els.feynmanReferenceImage) {
    els.feynmanReferenceFigure.classList.toggle('hidden', !referenceImage);

    if (referenceImage) {
      els.feynmanReferenceImage.src = referenceImage;
      els.feynmanReferenceImage.alt = t('feynman.answerImageAlt', { concept: info.concept });
    } else {
      els.feynmanReferenceImage.removeAttribute('src');
      els.feynmanReferenceImage.alt = '';
    }
  }

  if (!reference) {
    els.feynmanGapText.textContent = referenceImage
      ? t('feynman.gapImageOnly')
      : t('feynman.gapNoReference');
    els.feynmanGapChips.innerHTML = '';
    return;
  }

  const parts = [];
  if (analysis.short) parts.push(t('feynman.gapShort'));

  if (analysis.missing.length > 0) {
    parts.push(t('feynman.gapFound', { n: analysis.missing.length }));
  } else if (!analysis.short) {
    parts.push(t('feynman.gapAllGood'));
  }

  els.feynmanGapText.textContent = parts.join(' ');
  els.feynmanGapChips.innerHTML = analysis.missing
    .map((word) => `
      <span class="feynman-chip" aria-label="${escapeHtml(t('feynman.gapKeywordAria', { word }))}">
        ${escapeHtml(word)}
      </span>`)
    .join('');
}

function formatFeynmanDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  try {
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch (error) {
    return date.toLocaleString();
  }
}

function renderFeynmanHistory() {
  if (!els.feynmanHistoryList) return;

  els.feynmanHistoryCount.textContent = String(feynmanHistory.length);
  els.feynmanHistoryEmpty.classList.toggle('hidden', feynmanHistory.length > 0);

  els.feynmanHistoryList.innerHTML = feynmanHistory
    .map((entry) => {
      const score = FEYNMAN_CHECK_KEYS.filter((key) => entry.checklist[key]).length;
      const previewSource = richTextToText(entry.explanation);
      const preview = previewSource.slice(0, 140);
      const ellipsis = previewSource.length > 140 ? '…' : '';

      return `
        <li class="feynman-history-item">
          <div class="feynman-history-main">
            <p class="feynman-history-concept">${escapeHtml(entry.concept)}</p>
            <p class="feynman-history-meta">
              <span>${escapeHtml(formatFeynmanDate(entry.createdAt))}</span>
              <span class="feynman-history-score">${escapeHtml(t('feynman.historyScore', { n: score }))}</span>
            </p>
            <p class="feynman-history-preview">${escapeHtml(preview)}${ellipsis}</p>
          </div>
          <div class="feynman-history-actions">
            <button
              type="button"
              class="feynman-history-btn"
              data-feynman-load="${escapeHtml(entry.id)}"
              aria-label="${escapeHtml(t('feynman.historyLoadAria', { concept: entry.concept }))}"
            >${escapeHtml(t('feynman.historyLoad'))}</button>
            <button
              type="button"
              class="feynman-history-btn is-danger"
              data-feynman-delete="${escapeHtml(entry.id)}"
              aria-label="${escapeHtml(t('feynman.historyDeleteAria', { concept: entry.concept }))}"
            >${escapeHtml(t('feynman.historyDelete'))}</button>
          </div>
        </li>`;
    })
    .join('');
}

function renderFeynman() {
  if (!els.tabFeynman) return;

  feynmanState.cardIndex = feynmanCardIndex();
  feynmanState.step = Math.min(3, Math.max(1, feynmanState.step));

  els.feynmanSteps.forEach((pill) => {
    const step = Number(pill.dataset.feynmanStep);
    pill.classList.toggle('is-active', step === feynmanState.step);
    pill.classList.toggle('is-done', step < feynmanState.step);
    pill.setAttribute('aria-current', step === feynmanState.step ? 'step' : 'false');
  });

  [els.feynmanStep1, els.feynmanStep2, els.feynmanStep3].forEach((panel, index) => {
    panel.classList.toggle('hidden', feynmanState.step !== index + 1);
  });

  els.feynmanSourceButtons.forEach((button) => {
    const active = button.dataset.feynmanSource === feynmanState.source;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  els.feynmanCardPicker.classList.toggle('hidden', feynmanState.source !== 'card');
  els.feynmanManualPicker.classList.toggle('hidden', feynmanState.source !== 'manual');
  renderFeynmanCardOptions();

  if (els.feynmanConceptInput.value !== feynmanState.concept) {
    els.feynmanConceptInput.value = feynmanState.concept;
  }
  if (els.feynmanReferenceInput.value !== feynmanState.reference) {
    els.feynmanReferenceInput.value = feynmanState.reference;
  }
  if (els.feynmanExplanation.value !== feynmanState.explanation) {
    els.feynmanExplanation.value = feynmanState.explanation;
  }

  els.feynmanToolbar.innerHTML = formatToolbarMarkup('feynman-explanation');

  renderFeynmanCardPreview();
  renderFeynmanConceptVisual();

  updateFeynmanCounters();
  renderFeynmanChecklist();
  renderFeynmanReview();
  renderFeynmanHistory();

  els.feynmanHint.textContent = feynmanState.hint;
  els.feynmanHint.classList.toggle('hidden', !feynmanState.hint);
  els.feynmanSaveNotice.textContent = feynmanState.notice;
  els.feynmanSaveNotice.classList.toggle('hidden', !feynmanState.notice);
  els.feynmanSave.disabled = countMeaningfulChars(feynmanState.explanation) < FEYNMAN_MIN_CHARS;
}

function setFeynmanSource(source) {
  feynmanState.notice = '';
  feynmanState.hint = '';

  if (source === 'manual') {
    feynmanState.source = 'manual';
  } else if (state.cards.length === 0) {
    feynmanState.source = 'manual';
    feynmanState.hint = t('feynman.hintNoCards');
  } else {
    feynmanState.source = 'card';
    const info = feynmanCardInfo(state.cards[feynmanCardIndex()]);
    feynmanState.concept = info.concept;
    feynmanState.reference = info.reference;
  }

  persistFeynman();
  renderFeynman();
}

function syncFeynmanConcept() {
  if (feynmanState.source === 'card') {
    if (state.cards.length === 0) {
      feynmanState.hint = t('feynman.hintNoCards');
      return false;
    }

    const info = feynmanCardInfo(state.cards[feynmanCardIndex()]);
    if (!info.concept) {
      feynmanState.hint = t('feynman.hintChooseConcept');
      return false;
    }

    feynmanState.concept = info.concept;
    feynmanState.reference = info.reference;
    return true;
  }

  const concept = els.feynmanConceptInput.value.trim();
  if (concept.length < 2) {
    feynmanState.hint = t('feynman.hintManualConcept');
    return false;
  }

  feynmanState.concept = concept;
  feynmanState.reference = els.feynmanReferenceInput.value.trim();
  return true;
}

function syncFeynmanExplanation() {
  if (!els.feynmanExplanation) return;

  feynmanState.explanation = els.feynmanExplanation.value;
  updateFeynmanCounters();
}

function goToFeynmanStep(step) {
  const next = Math.min(3, Math.max(1, Number(step) || 1));
  feynmanState.hint = '';
  feynmanState.notice = '';

  if (next >= 2) {
    feynmanState.cardIndex = feynmanCardIndex();
    if (!syncFeynmanConcept()) {
      feynmanState.step = 1;
      renderFeynman();
      return;
    }
  }

  if (next === 3) {
    syncFeynmanExplanation();
    if (countMeaningfulChars(feynmanState.explanation) < FEYNMAN_MIN_CHARS) {
      feynmanState.step = 2;
      feynmanState.hint = t('feynman.hintEmptyExplanation');
      renderFeynman();
      els.feynmanExplanation.focus({ preventScroll: true });
      return;
    }
  }

  feynmanState.step = next;
  persistFeynman();
  renderFeynman();

  if (next === 2) {
    els.feynmanExplanation.focus({ preventScroll: true });
  }
}

function saveFeynmanPractice() {
  syncFeynmanExplanation();
  feynmanState.notice = '';
  feynmanState.hint = '';

  if (!syncFeynmanConcept()) {
    feynmanState.step = 1;
    renderFeynman();
    return;
  }

  if (countMeaningfulChars(feynmanState.explanation) < FEYNMAN_MIN_CHARS) {
    feynmanState.step = 2;
    feynmanState.hint = t('feynman.hintEmptyExplanation');
    renderFeynman();
    return;
  }

  feynmanHistory = [
    {
      id: `fx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      concept: feynmanState.concept,
      explanation: feynmanState.explanation.trim(),
      reference: feynmanState.reference.trim(),
      source: feynmanState.source,
      missing: analyzeFeynmanGaps(feynmanState.explanation, feynmanState.reference).missing,
      checklist: { ...feynmanState.checklist },
      createdAt: new Date().toISOString(),
    },
    ...feynmanHistory,
  ].slice(0, FEYNMAN_HISTORY_LIMIT);

  const saved = persistFeynman();
  feynmanState.notice = saved ? t('feynman.savedNotice') : t('feynman.hintSaveQuota');
  renderFeynman();
}

function loadFeynmanHistoryEntry(id) {
  const entry = feynmanHistory.find((item) => item.id === id);
  if (!entry) return;

  feynmanState.source = 'manual';
  feynmanState.concept = entry.concept;
  feynmanState.reference = entry.reference;
  feynmanState.explanation = entry.explanation;
  feynmanState.checklist = normalizeFeynmanChecklist(entry.checklist);
  feynmanState.step = 3;
  feynmanState.hint = '';
  feynmanState.notice = '';

  persistFeynman();
  renderFeynman();
}

function deleteFeynmanHistoryEntry(id) {
  feynmanHistory = feynmanHistory.filter((entry) => entry.id !== id);
  persistFeynman();
  renderFeynman();
}

function dateStamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function buildExportData() {
  const answered = state.quiz.filter(
    (question) => question.timedOut
      || (question.selected !== undefined && question.selected !== null),
  ).length;

  return {
    app: 'Quick Memorize Quiz',
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    language: lang,
    inputMode: state.inputMode,
    notes: els.notes.value,
    structured: structuredRowsForStorage(),
    summary: {
      cards: state.cards.length,
      questions: state.quiz.length,
      answered,
      correct: state.score,
      trueFalse: state.tf.length,
      structuredRows: countCompleteStructuredRows(),
    },
    cards: state.cards.map((card) => ({
      kind: card.kind,
      term: card.term,
      definition: card.definition,
      source: card.source,
      sourceMode: card.sourceMode || 'paste',
      termImage: normalizeImageValue(card.termImage),
      definitionImage: normalizeImageValue(card.definitionImage),
      ...(card.cloze ? { cloze: card.cloze } : {}),
    })),
    quiz: state.quiz.map((question) => ({
      type: question.type,
      term: question.term,
      termImage: normalizeImageValue(question.termImage),
      definition: question.definition ?? null,
      definitionImage: normalizeImageValue(question.definitionImage),
      context: question.context ?? null,
      options: question.options,
      answerIndex: question.answerIndex,
      note: question.note,
      noteImage: normalizeImageValue(question.noteImage),
      selected: question.selected ?? null,
      correct: question.correct ?? null,
      timedOut: Boolean(question.timedOut),
    })),
    trueFalse: state.tf.map((question) => ({
      term: question.term,
      termImage: normalizeImageValue(question.termImage),
      definition: question.definition,
      definitionImage: normalizeImageValue(question.definitionImage),
      isTrue: question.isTrue,
      correctTerm: question.correctTerm,
      correctTermImage: normalizeImageValue(question.correctTermImage),
      selected: question.selected ?? null,
      correct: question.correct ?? null,
      timedOut: Boolean(question.timedOut),
    })),
  };
}

function exportNotes() {
  if (!hasInputData()) {
    showHint(t('storage.emptyExport'));
    return;
  }

  const payload = JSON.stringify(buildExportData(), null, 2);
  const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `quick-memorize-quiz-${dateStamp()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  showHint(t('storage.exported'), 'success');
}

function importFromText(text, fileName = '') {
  const content = String(text ?? '').trim();
  if (!content) {
    showHint(t('storage.invalidFile'));
    return;
  }

  const isJson = /\.json$/i.test(fileName)
    || (!/\.(txt|md)$/i.test(fileName) && content.startsWith('{'));

  let data = null;
  if (isJson) {
    try {
      data = JSON.parse(content);
    } catch (error) {
      showHint(t('storage.invalidJson'));
      return;
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      showHint(t('storage.invalidFile'));
      return;
    }
  }

  let notes = content;
  let importedStructured = null;
  let inputMode = 'paste';

  if (isJson) {
    notes = typeof data.notes === 'string'
      ? data.notes
      : typeof data.text === 'string'
        ? data.text
        : '';

    if (Array.isArray(data.structured)) {
      importedStructured = normalizeStructuredRows(data.structured);
    }

    // File v7 dan file teks selalu kembali ke mode tempel; file v8/v9 membawa mode aktifnya.
    inputMode = data.inputMode === 'structured' ? 'structured' : 'paste';
  }

  const importedRows = importedStructured === null ? [] : importedStructured;
  const hasImportedData = notes.trim().length > 0
    || importedRows.some(
      (row) => fieldHasContent(row.term, row.termImage)
        || fieldHasContent(row.explanation, row.explanationImage),
    );

  if (!hasImportedData) {
    showHint(t('storage.invalidFile'));
    return;
  }

  els.notes.value = notes;

  if (importedStructured !== null) {
    state.structuredRows = importedStructured;
  }

  clearStructuredErrors();
  renderStructuredRows();
  setInputMode(inputMode, { persist: false });
  updateCounters();
  saveNotes();

  if (!generate()) return;

  showHint(t('storage.imported', { name: fileName || 'JSON' }), 'success');
}

function handleFileChange(event) {
  const file = event.target.files && event.target.files[0];
  event.target.value = '';
  if (!file) return;

  if (file.size > MAX_IMPORT_BYTES) {
    showHint(t('storage.fileTooLarge'));
    return;
  }

  const reader = new FileReader();
  reader.onload = () => importFromText(reader.result, file.name);
  reader.onerror = () => showHint(t('storage.readError'));
  reader.readAsText(file);
}

function disarmClear() {
  clearArmed = false;
  window.clearTimeout(clearTimer);
  els.btnClear.classList.remove('is-armed');
  els.clearLabel.textContent = t('storage.clear');
}

function handleClearClick() {
  if (!clearArmed) {
    clearArmed = true;
    els.btnClear.classList.add('is-armed');
    els.clearLabel.textContent = t('storage.clearConfirm');
    window.clearTimeout(clearTimer);
    clearTimer = window.setTimeout(disarmClear, 4000);
    return;
  }

  disarmClear();
  startOver();
}

function countMeaningfulChars(text) {
  return String(text ?? '').replace(/[^\p{L}\p{N}]+/gu, '').length;
}

function generate() {
  if (state.loading) return false;
  disarmClear();
  clearHint();

  let source;

  if (state.inputMode === 'structured') {
    const result = validateStructuredRows();

    if (!result.ok) {
      showHint(result.hint);
      if (result.focus) focusStructuredCell(result.focus.id, result.focus.field);
      else els.btnAddRow.focus();
      return false;
    }

    source = { mode: 'structured', cards: result.cards };
  } else {
    const raw = els.notes.value.trim();

    if (!raw) {
      showHint(t('hint.empty'));
      els.notes.focus();
      return false;
    }

    if (countMeaningfulChars(raw) < MIN_NOTE_MEANINGFUL_CHARS) {
      showHint(t('hint.short'));
      els.notes.focus();
      return false;
    }

    source = { mode: 'paste', raw };
  }

  saveNotes();
  setLoading(true);

  // Jeda singkat supaya terasa seperti sedang menganalisis materi.
  generateTimer = window.setTimeout(() => {
    generateTimer = null;

    try {
      const cards = source.mode === 'structured'
        ? source.cards
        : buildCards(extractSegments(source.raw));

      if (cards.length < 2) {
        showHint(source.mode === 'structured' ? t('structured.errorMin') : t('hint.fewCards'));
        return;
      }

      applyCards(cards, { resetFeynman: true });
      els.studyPanels.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      console.error('Gagal menyusun materi:', error);
      showHint(t('hint.error'));
    } finally {
      setLoading(false);
    }
  }, 520);

  return true;
}

function loadSample() {
  clearHint();

  if (state.inputMode === 'structured') {
    const sample = lang === 'en' ? SAMPLE_STRUCTURED_EN : SAMPLE_STRUCTURED;
    state.structuredRows = sample.map((row) => createStructuredRow(row.term, row.explanation));
    clearStructuredErrors();
    renderStructuredRows();
    updateCounters();
    focusActiveInput();
  } else {
    els.notes.value = lang === 'en' ? SAMPLE_NOTES_EN : SAMPLE_NOTES;
    updateCounters();
    els.notes.focus();
    els.notes.setSelectionRange(0, 0);
    els.notes.scrollTop = 0;
  }

  saveNotes();
  flashSaveStatus();
  generate();
}

function startOver() {
  if (generateTimer) {
    window.clearTimeout(generateTimer);
    generateTimer = null;
    setLoading(false);
  }

  disarmClear();
  clearSavedNotes();
  els.saveStatus.classList.remove('is-visible');

  state.cards = [];
  state.quiz = [];
  state.tf = [];
  clearFeynmanStore();
  state.cardIndex = 0;
  state.quizIndex = 0;
  state.score = 0;
  state.streak = 0;
  state.answered = false;
  state.tfIndex = 0;
  state.tfScore = 0;
  state.tfStreak = 0;
  state.tfAnswered = false;

  resetTimer(quizTimer);
  resetTimer(tfTimer);
  renderQuizStreak();
  renderTfStreak();
  stopConfetti();
  els.quizCelebration.hidden = true;
  els.tfCelebration.hidden = true;

  els.notes.value = '';
  state.structuredRows = createEmptyStructuredRows();
  clearStructuredErrors();
  renderStructuredRows();
  updateCounters();
  clearHint();
  els.studyPanels.classList.add('hidden');
  els.studyEmpty.classList.remove('hidden');
  updateStats();
  resetMatchSession();
  renderFeynman();
  focusActiveInput();
}

function retryQuiz() {
  // Setiap kali kuis diulang, posisi jawaban benar diacak lagi tanpa
  // mengubah urutan soal.
  randomizeAnswerPositions(state.quiz);
  resetQuiz();
  renderQuizQuestion();
}

function retryTf() {
  resetTf();
  renderTfQuestion();
}

/* ============================================================
   Drag-to-Answer / Matching (v13.0)
   ============================================================ */

function currentMatchBatch() {
  return matchState.batches[matchState.batchIndex] || [];
}

/**
 * Kunci jawaban untuk penilaian. Formulir soal mengizinkan dua istilah
 * berbeda memiliki penjelasan yang sama persis, jadi kecocokan dihitung
 * dari isi jawaban, bukan hanya id pasangannya.
 */
function matchAnswerKey(pair) {
  if (!pair) return '';
  return valueKey(pair.answer, pair.answerImage);
}

function isMatchCorrect(questionId, answerId) {
  if (!questionId || !answerId) return false;
  if (questionId === answerId) return true;

  const questionPair = matchState.pairMap.get(questionId);
  const answerPair = matchState.pairMap.get(answerId);
  const key = matchAnswerKey(questionPair);

  return key !== '' && key === matchAnswerKey(answerPair);
}

/** Buat pasangan unik dari flashcard yang sudah ada. */
function buildMatchPairs(cards) {
  const seen = new Set();
  const pairs = [];

  cards.forEach((card) => {
    if (!card) return;

    const question = String(card.term ?? '').trim();
    const answer = String(card.definition ?? card.source ?? '').trim();
    const questionImage = normalizeImageValue(card.termImage);
    const answerImage = normalizeImageValue(card.definitionImage);

    if (!question && !answer && !questionImage && !answerImage) return;

    const key = questionKey(question, questionImage, answer, answerImage);
    if (seen.has(key)) return;
    seen.add(key);

    pairs.push({
      id: `pair-${pairs.length}`,
      question,
      answer,
      questionImage,
      answerImage,
    });
  });

  return pairs;
}

/**
 * Bagi soal per batch maksimal lima. Kalau sisa terakhir hanya satu,
 * pindahkan satu soal dari batch sebelumnya agar tetap minimal dua.
 */
function buildMatchBatches(pairs) {
  const batches = [];

  for (let index = 0; index < pairs.length; index += MATCH_BATCH_SIZE) {
    batches.push(pairs.slice(index, index + MATCH_BATCH_SIZE));
  }

  if (batches.length > 1 && batches[batches.length - 1].length < 2) {
    const last = batches[batches.length - 1];
    const previous = batches[batches.length - 2];
    last.unshift(previous.pop());
  }

  return batches;
}

/** Acak urutan jawaban, tetapi hindari urutan yang sama persis dengan soal. */
function createMatchAnswerOrder(batch) {
  const order = shuffleArray(batch.map((pair) => pair.id));

  if (order.length > 1 && order.every((id, index) => id === batch[index].id)) {
    order.push(order.shift());
  }

  return order;
}

function resetMatchSession() {
  cancelMatchDrag();

  matchState.pairs = buildMatchPairs(state.cards);
  matchState.pairMap = new Map(matchState.pairs.map((pair) => [pair.id, pair]));
  matchState.batches = matchState.pairs.length >= 2 ? buildMatchBatches(matchState.pairs) : [];
  matchState.batchIndex = 0;
  matchState.answerOrder = [];
  matchState.links = new Map();
  matchState.checked = false;
  matchState.batchScores = new Map();
  matchState.pendingQuestion = null;
  matchState.summary = false;

  if (matchState.batches.length > 0) {
    matchState.answerOrder = createMatchAnswerOrder(matchState.batches[0]);
  }

  renderMatch();
}

function renderMatch() {
  if (!els.tabMatch) return;

  const hasPairs = matchState.pairs.length >= 2 && matchState.batches.length > 0;
  const showSummary = hasPairs && matchState.summary;

  els.matchEmpty.classList.toggle('hidden', hasPairs);
  els.matchBody.classList.toggle('hidden', !hasPairs || showSummary);
  els.matchSummary.classList.toggle('hidden', !showSummary);

  if (!hasPairs) {
    els.matchQuestions.innerHTML = '';
    els.matchAnswers.innerHTML = '';
    els.matchOverlay.innerHTML = '';
    if (els.matchBatchInfo) {
      els.matchBatchInfo.textContent = t('match.noPairs');
      els.matchBatchInfo.classList.remove('hidden');
    }
    if (els.matchScore) els.matchScore.classList.add('hidden');
    return;
  }

  if (showSummary) {
    renderMatchSummary();
    return;
  }

  if (matchState.batchIndex >= matchState.batches.length) {
    matchState.batchIndex = 0;
  }
  if (!matchState.answerOrder.length) {
    matchState.answerOrder = createMatchAnswerOrder(currentMatchBatch());
  }

  renderMatchBatch();
}

function renderMatchBatch() {
  const batch = currentMatchBatch();
  if (!batch.length) return;

  cancelMatchDrag();
  matchState.pendingQuestion = null;

  els.matchQuestions.innerHTML = batch.map(matchQuestionMarkup).join('');
  els.matchAnswers.innerHTML = matchState.answerOrder
    .map((id) => matchState.pairMap.get(id))
    .filter(Boolean)
    .map(matchAnswerMarkup)
    .join('');

  updateMatchHeader(batch);
  syncMatchUi();
}

function matchThumbMarkup(image, alt) {
  return imageMarkup(image, { alt, className: 'match-thumb' });
}

function matchTextMarkup(value) {
  const text = String(value ?? '').trim();
  return text
    ? formatRichText(text)
    : `<span class="match-muted">${escapeHtml(t('match.imageOnly'))}</span>`;
}

function matchAriaText(value) {
  const text = richTextToText(value);
  if (!text) return t('match.imageOnly');
  return text.length > 70 ? `${text.slice(0, 67)}…` : text;
}

function matchQuestionMarkup(pair) {
  const label = escapeHtml(t('match.connectQuestion', { text: matchAriaText(pair.question) }));

  return `
    <div class="match-item match-question" data-question-id="${pair.id}">
      <div class="match-content">
        ${matchThumbMarkup(pair.questionImage, t('match.questionImageAlt'))}
        <div class="match-text rich-text">${matchTextMarkup(pair.question)}</div>
      </div>
      <button
        type="button"
        class="match-anchor match-anchor--question"
        data-anchor-question="${pair.id}"
        aria-label="${label}"
        aria-pressed="false"
      >
        <span class="match-anchor-dot" aria-hidden="true"></span>
      </button>
    </div>`;
}

function matchAnswerMarkup(pair) {
  const label = escapeHtml(t('match.connectAnswer', { text: matchAriaText(pair.answer) }));

  return `
    <div class="match-item match-answer" data-answer-id="${pair.id}">
      <button
        type="button"
        class="match-anchor match-anchor--answer"
        data-anchor-answer="${pair.id}"
        aria-label="${label}"
      >
        <span class="match-anchor-dot" aria-hidden="true"></span>
      </button>
      <div class="match-content">
        ${matchThumbMarkup(pair.answerImage, t('match.answerImageAlt'))}
        <div class="match-text rich-text">${matchTextMarkup(pair.answer)}</div>
      </div>
    </div>`;
}

function updateMatchHeader(batch) {
  if (!els.matchBatchInfo) return;

  els.matchBatchInfo.textContent = `${t('match.batch', {
    i: matchState.batchIndex + 1,
    n: matchState.batches.length,
  })} · ${t('match.pairs', { n: batch.length })}`;
  els.matchBatchInfo.classList.remove('hidden');
  updateMatchScore();
}

function syncMatchUi() {
  const batch = currentMatchBatch();
  if (!batch.length || !els.matchQuestions || !els.matchAnswers) return;

  const answerOwners = new Map();
  matchState.links.forEach((answerId, questionId) => {
    answerOwners.set(answerId, questionId);
  });

  els.matchQuestions.querySelectorAll('.match-item').forEach((item) => {
    const questionId = item.dataset.questionId;
    const answerId = matchState.links.get(questionId);
    const linked = Boolean(answerId);
    const correct = linked && matchState.checked && isMatchCorrect(questionId, answerId);

    item.classList.toggle('is-linked', linked);
    item.classList.toggle('is-correct', correct);
    item.classList.toggle('is-wrong', linked && matchState.checked && !correct);

    const anchor = item.querySelector('.match-anchor');
    if (anchor) {
      const pending = matchState.pendingQuestion === questionId;
      anchor.classList.toggle('is-pending', pending);
      anchor.setAttribute('aria-pressed', String(pending));
      anchor.disabled = matchState.checked;
    }
  });

  els.matchAnswers.querySelectorAll('.match-item').forEach((item) => {
    const answerId = item.dataset.answerId;
    const questionId = answerOwners.get(answerId);
    const linked = Boolean(questionId);
    const correct = linked && matchState.checked && isMatchCorrect(questionId, answerId);

    item.classList.toggle('is-linked', linked);
    item.classList.toggle('is-correct', correct);
    item.classList.toggle('is-wrong', linked && matchState.checked && !correct);

    const anchor = item.querySelector('.match-anchor');
    if (anchor) anchor.disabled = matchState.checked;
  });

  updateMatchControls(batch);
  updateMatchFeedback(batch);
  updateMatchScore();
  scheduleMatchLines();
}

function updateMatchControls(batch) {
  const allLinked = batch.every((pair) => matchState.links.has(pair.id));
  const isLast = matchState.batchIndex >= matchState.batches.length - 1;

  if (els.matchCheck) {
    els.matchCheck.disabled = matchState.checked || !allLinked;
    els.matchCheck.classList.toggle('hidden', matchState.checked);
  }

  if (els.matchNext) {
    els.matchNext.classList.toggle('hidden', !matchState.checked);
    els.matchNext.textContent = isLast ? t('match.finish') : t('match.next');
  }

  if (els.matchReset) {
    els.matchReset.disabled = matchState.links.size === 0 && !matchState.checked;
  }
}

function updateMatchFeedback(batch) {
  if (!els.matchFeedback) return;

  let text = '';
  let tone = '';
  const allLinked = batch.every((pair) => matchState.links.has(pair.id));

  if (matchState.checked) {
    const correct = matchState.batchScores.get(matchState.batchIndex) || 0;
    text = correct === batch.length
      ? t('match.feedbackAll', { n: batch.length })
      : t('match.feedbackSome', { correct, n: batch.length });
    tone = correct === batch.length ? 'is-correct' : 'is-wrong';
  } else if (matchState.pendingQuestion) {
    text = t('match.pending');
    tone = 'is-info';
  } else if (allLinked) {
    text = t('match.feedbackReady');
    tone = 'is-info';
  }

  els.matchFeedback.textContent = text;
  els.matchFeedback.classList.toggle('hidden', !text);
  els.matchFeedback.classList.remove('is-correct', 'is-wrong', 'is-info');
  if (tone) els.matchFeedback.classList.add(tone);
}

function updateMatchScore() {
  if (!els.matchScore) return;

  const correct = Array.from(matchState.batchScores.values())
    .reduce((sum, value) => sum + value, 0);
  const hasScore = matchState.batchScores.size > 0;

  els.matchScore.textContent = t('match.score', { n: correct });
  els.matchScore.classList.toggle('hidden', !hasScore);
}

function renderMatchSummary() {
  const total = matchState.pairs.length;
  const correct = Array.from(matchState.batchScores.values())
    .reduce((sum, value) => sum + value, 0);
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

  if (els.matchSummaryPercent) {
    els.matchSummaryPercent.textContent = `${percent}%`;
  }
  if (els.matchSummaryRing) {
    els.matchSummaryRing.style.setProperty('--p', String(percent));
  }
  if (els.matchSummaryText) {
    els.matchSummaryText.textContent = t('match.summaryText', { correct, total });
  }
  if (els.matchBatchInfo) {
    els.matchBatchInfo.textContent = t('match.batch', {
      i: matchState.batches.length,
      n: matchState.batches.length,
    });
    els.matchBatchInfo.classList.remove('hidden');
  }

  updateMatchScore();
}

function scheduleMatchLines() {
  if (matchLineFrame) return;

  matchLineFrame = window.requestAnimationFrame(() => {
    matchLineFrame = null;
    renderMatchLines();
  });
}

function matchAnchorCenter(anchor, boardRect) {
  const rect = anchor.getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2 - boardRect.left,
    y: rect.top + rect.height / 2 - boardRect.top,
  };
}

function drawMatchLine(from, to, className) {
  if (!els.matchOverlay) return;

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', from.x.toFixed(2));
  line.setAttribute('y1', from.y.toFixed(2));
  line.setAttribute('x2', to.x.toFixed(2));
  line.setAttribute('y2', to.y.toFixed(2));
  line.setAttribute('class', className);
  els.matchOverlay.appendChild(line);
}

function renderMatchLines() {
  if (!els.matchOverlay || !els.matchBoard) return;

  els.matchOverlay.innerHTML = '';

  const batch = currentMatchBatch();
  if (!batch.length) return;

  const boardRect = els.matchBoard.getBoundingClientRect();
  if (boardRect.width < 1 || boardRect.height < 1) return;

  matchState.links.forEach((answerId, questionId) => {
    if (!batch.some((pair) => pair.id === questionId)) return;

    const questionAnchor = els.matchBoard.querySelector(
      `.match-anchor[data-anchor-question="${questionId}"]`,
    );
    const answerAnchor = els.matchBoard.querySelector(
      `.match-anchor[data-anchor-answer="${answerId}"]`,
    );
    if (!questionAnchor || !answerAnchor) return;

    const classes = ['match-line'];
    if (matchState.checked) {
      classes.push(isMatchCorrect(questionId, answerId) ? 'is-correct' : 'is-wrong');
    }

    drawMatchLine(
      matchAnchorCenter(questionAnchor, boardRect),
      matchAnchorCenter(answerAnchor, boardRect),
      classes.join(' '),
    );
  });

  const drag = matchState.drag;
  if (drag && drag.moved) {
    const questionAnchor = els.matchBoard.querySelector(
      `.match-anchor[data-anchor-question="${drag.questionId}"]`,
    );
    if (questionAnchor) {
      drawMatchLine(
        matchAnchorCenter(questionAnchor, boardRect),
        {
          x: drag.lastX - boardRect.left,
          y: drag.lastY - boardRect.top,
        },
        'match-line is-temp',
      );
    }
  }
}

function connectMatch(questionId, answerId) {
  if (!questionId || !answerId || matchState.checked) return;

  const batch = currentMatchBatch();
  const validQuestion = batch.some((pair) => pair.id === questionId);
  const validAnswer = batch.some((pair) => pair.id === answerId);
  if (!validQuestion || !validAnswer) return;

  matchState.links.forEach((linkedAnswerId, linkedQuestionId) => {
    if (linkedAnswerId === answerId) matchState.links.delete(linkedQuestionId);
  });

  matchState.links.set(questionId, answerId);
  matchState.pendingQuestion = null;
}

function unlinkMatchQuestion(questionId) {
  matchState.links.delete(questionId);
}

function startMatchDrag(anchor, event) {
  if (matchState.checked || matchState.summary) return;

  const questionId = anchor.dataset.anchorQuestion;
  if (!questionId) return;

  event.preventDefault();
  finishMatchDrag();
  unlinkMatchQuestion(questionId);
  matchState.pendingQuestion = questionId;
  matchState.drag = {
    pointerId: event.pointerId,
    questionId,
    anchor,
    startX: event.clientX,
    startY: event.clientY,
    lastX: event.clientX,
    lastY: event.clientY,
    moved: false,
  };

  try {
    anchor.setPointerCapture(event.pointerId);
  } catch (error) {
    // Pointer capture tidak wajib; event tetap dipantau lewat window.
  }

  els.matchBoard.classList.add('is-dragging');
  syncMatchUi();
}

function finishMatchDrag() {
  const drag = matchState.drag;

  if (drag) {
    try {
      if (drag.anchor.hasPointerCapture && drag.anchor.hasPointerCapture(drag.pointerId)) {
        drag.anchor.releasePointerCapture(drag.pointerId);
      }
    } catch (error) {
      // Abaikan bila pointer capture sudah dilepas browser.
    }
  }

  matchState.drag = null;
  if (els.matchBoard) els.matchBoard.classList.remove('is-dragging');
}

function cancelMatchDrag() {
  finishMatchDrag();
  matchState.pendingQuestion = null;
  scheduleMatchLines();
}

function handleMatchPointerDown(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (matchState.checked || matchState.summary) return;

  const questionAnchor = target.closest('.match-anchor--question');
  if (questionAnchor) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startMatchDrag(questionAnchor, event);
    return;
  }

  const answerAnchor = target.closest('.match-anchor--answer');
  if (answerAnchor && matchState.pendingQuestion) {
    event.preventDefault();
    const questionId = matchState.pendingQuestion;
    matchState.pendingQuestion = null;
    connectMatch(questionId, answerAnchor.dataset.anchorAnswer);
    syncMatchUi();
  }
}

function handleMatchPointerMove(event) {
  const drag = matchState.drag;
  if (!drag || event.pointerId !== drag.pointerId) return;

  drag.lastX = event.clientX;
  drag.lastY = event.clientY;

  if (!drag.moved) {
    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    if (distance > 6) drag.moved = true;
  }

  if (drag.moved && event.cancelable) event.preventDefault();
  scheduleMatchLines();
}

function handleMatchPointerUp(event) {
  const drag = matchState.drag;
  if (!drag || event.pointerId !== drag.pointerId) return;

  const { questionId, moved } = drag;
  const hit = document.elementFromPoint(event.clientX, event.clientY);
  const answerAnchor = hit instanceof Element ? hit.closest('.match-anchor--answer') : null;

  if (answerAnchor && els.matchBoard.contains(answerAnchor)) {
    matchState.pendingQuestion = null;
    connectMatch(questionId, answerAnchor.dataset.anchorAnswer);
  } else if (moved) {
    matchState.pendingQuestion = null;
  }

  finishMatchDrag();
  syncMatchUi();
}

function handleMatchPointerCancel(event) {
  const drag = matchState.drag;
  if (!drag || event.pointerId !== drag.pointerId) return;

  matchState.pendingQuestion = null;
  finishMatchDrag();
  syncMatchUi();
}

function handleMatchClick(event) {
  if (event.detail !== 0) return;

  const target = event.target;
  if (!(target instanceof Element)) return;
  if (matchState.checked || matchState.summary) return;

  const questionAnchor = target.closest('.match-anchor--question');
  if (questionAnchor) {
    const questionId = questionAnchor.dataset.anchorQuestion;

    if (matchState.pendingQuestion === questionId) {
      matchState.pendingQuestion = null;
      syncMatchUi();
      return;
    }

    unlinkMatchQuestion(questionId);
    matchState.pendingQuestion = questionId;
    syncMatchUi();
    return;
  }

  const answerAnchor = target.closest('.match-anchor--answer');
  if (answerAnchor && matchState.pendingQuestion) {
    const questionId = matchState.pendingQuestion;
    matchState.pendingQuestion = null;
    connectMatch(questionId, answerAnchor.dataset.anchorAnswer);
    syncMatchUi();
  }
}

function clearMatchLinks() {
  if (!currentMatchBatch().length) return;

  cancelMatchDrag();
  matchState.links.clear();
  matchState.checked = false;
  matchState.batchScores.delete(matchState.batchIndex);
  syncMatchUi();
}

function checkMatchAnswers() {
  const batch = currentMatchBatch();
  if (!batch.length || matchState.checked) return;
  if (!batch.every((pair) => matchState.links.has(pair.id))) return;

  matchState.checked = true;
  cancelMatchDrag();

  const correct = batch.reduce(
    (sum, pair) => (isMatchCorrect(pair.id, matchState.links.get(pair.id)) ? sum + 1 : sum),
    0,
  );
  matchState.batchScores.set(matchState.batchIndex, correct);
  syncMatchUi();
}

function nextMatchBatch() {
  if (!matchState.checked) return;

  if (matchState.batchIndex >= matchState.batches.length - 1) {
    matchState.summary = true;
    cancelMatchDrag();
    renderMatch();
    return;
  }

  matchState.batchIndex += 1;
  matchState.checked = false;
  matchState.links = new Map();
  matchState.pendingQuestion = null;
  matchState.answerOrder = createMatchAnswerOrder(currentMatchBatch());
  cancelMatchDrag();
  renderMatch();
}

function initMatchEvents() {
  if (!els.matchBoard) return;

  els.matchBoard.addEventListener('pointerdown', handleMatchPointerDown);
  els.matchBoard.addEventListener('click', handleMatchClick);
  window.addEventListener('pointermove', handleMatchPointerMove, { passive: false });
  window.addEventListener('pointerup', handleMatchPointerUp);
  window.addEventListener('pointercancel', handleMatchPointerCancel);
  window.addEventListener('resize', scheduleMatchLines);

  els.matchCheck.addEventListener('click', checkMatchAnswers);
  els.matchNext.addEventListener('click', nextMatchBatch);
  els.matchReset.addEventListener('click', clearMatchLinks);
  els.matchRestart.addEventListener('click', resetMatchSession);

  // Gambar yang selesai dimuat bisa mengubah tinggi kartu.
  els.matchBoard.addEventListener('load', scheduleMatchLines, true);

  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(scheduleMatchLines);
    observer.observe(els.matchBoard);
  }
}

/* ============================================================
   Event listener
   ============================================================ */

els.notes.addEventListener('input', () => {
  updateCounters();
  scheduleSave();
});

els.modeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.inputMode === state.inputMode) return;
    setInputMode(button.dataset.inputMode, { focus: true });
  });

  button.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();

    const modes = els.modeButtons.map((item) => item.dataset.inputMode);
    const current = modes.indexOf(state.inputMode);
    let next = current;

    if (event.key === 'ArrowRight') next = (current + 1) % modes.length;
    else if (event.key === 'ArrowLeft') next = (current - 1 + modes.length) % modes.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = modes.length - 1;

    if (next !== current) {
      setInputMode(modes[next], { focus: false });
      els.modeButtons[next].focus();
    }
  });
});

els.btnAddRow.addEventListener('click', addStructuredRow);

els.structuredRows.addEventListener('input', (event) => {
  const field = event.target instanceof Element
    ? event.target.closest('.structured-input')
    : null;
  if (!field) return;

  const rowEl = field.closest('.structured-row');
  if (!rowEl) return;

  const row = state.structuredRows.find((item) => item.id === rowEl.dataset.rowId);
  if (!row) return;

  const name = field.dataset.field;
  if (name !== 'term' && name !== 'explanation') return;

  row[name] = field.value;
  autoGrowTextarea(field);
  clearStructuredErrors();
  clearHint();
  updateCounters();
  scheduleSave();
});

els.structuredRows.addEventListener('mousedown', (event) => {
  if (!(event.target instanceof Element)) return;
  // Jangan biarkan fokus/selection textarea hilang saat tombol format diklik.
  if (event.target.closest('[data-format]')) event.preventDefault();
});

els.structuredRows.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;

  const formatButton = event.target.closest('[data-format]');
  if (formatButton) {
    applyRichFormat(formatButton);
    return;
  }

  const removeRow = event.target.closest('[data-remove-row]');
  if (removeRow) {
    removeStructuredRow(removeRow.dataset.removeRow);
    return;
  }

  const pickImage = event.target.closest('[data-pick-image]');
  if (pickImage) {
    const rowEl = pickImage.closest('.structured-row');
    const field = pickImage.dataset.pickImage;
    const input = rowEl
      ? rowEl.querySelector(`[data-image-input="${field}"]`)
      : null;
    if (input) input.click();
    return;
  }

  const removeImage = event.target.closest('[data-remove-image]');
  if (removeImage) {
    removeStructuredRowImage(removeImage.dataset.rowId, removeImage.dataset.removeImage);
  }
});

els.structuredRows.addEventListener('change', (event) => {
  const input = event.target instanceof Element
    ? event.target.closest('[data-image-input]')
    : null;
  if (!input) return;

  const file = input.files && input.files[0];
  input.value = '';
  if (!file) return;

  const rowEl = input.closest('.structured-row');
  if (!rowEl) return;

  void applyImageFileToRow(rowEl.dataset.rowId, input.dataset.imageInput, file);
});

els.structuredRows.addEventListener('dragover', (event) => {
  const field = event.target instanceof Element
    ? event.target.closest('.structured-field')
    : null;
  if (!field) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  field.classList.add('is-dragover');
});

els.structuredRows.addEventListener('dragleave', (event) => {
  const field = event.target instanceof Element
    ? event.target.closest('.structured-field')
    : null;
  if (!field) return;
  if (event.relatedTarget instanceof Node && field.contains(event.relatedTarget)) return;
  field.classList.remove('is-dragover');
});

els.structuredRows.addEventListener('drop', (event) => {
  const field = event.target instanceof Element
    ? event.target.closest('.structured-field')
    : null;
  if (!field) return;
  event.preventDefault();
  field.classList.remove('is-dragover');

  const rowEl = field.closest('.structured-row');
  const file = event.dataTransfer && event.dataTransfer.files
    ? event.dataTransfer.files[0]
    : null;
  if (!rowEl || !file) return;

  void applyImageFileToRow(rowEl.dataset.rowId, field.dataset.fieldWrap, file);
});

// Cegah browser membuka file bila foto terlepas di luar kolom formulir.
function isFileDrag(event) {
  const types = event.dataTransfer && event.dataTransfer.types;
  return Boolean(types) && Array.prototype.includes.call(types, 'Files');
}

document.addEventListener('dragover', (event) => {
  if (isFileDrag(event)) event.preventDefault();
});

document.addEventListener('drop', (event) => {
  if (isFileDrag(event)) event.preventDefault();
});

els.btnGenerate.addEventListener('click', generate);
els.btnSample.addEventListener('click', loadSample);
els.btnNew.addEventListener('click', startOver);
els.btnNew2.addEventListener('click', startOver);
els.btnRetry.addEventListener('click', retryQuiz);
els.btnShuffleResult.addEventListener('click', shuffleQuiz);

els.btnClear.addEventListener('click', handleClearClick);
els.btnExport.addEventListener('click', exportNotes);
els.btnImport.addEventListener('click', () => els.fileInput.click());
els.fileInput.addEventListener('change', handleFileChange);

window.addEventListener('beforeunload', saveNotes);

/* ---------- Metode Feynman (v12.0–v12.1) ---------- */
els.feynmanSourceButtons.forEach((button) => {
  button.addEventListener('click', () => setFeynmanSource(button.dataset.feynmanSource));
});

els.feynmanCardSelect.addEventListener('change', () => {
  feynmanState.cardIndex = feynmanCardIndex(els.feynmanCardSelect.value);
  const info = feynmanCardInfo(state.cards[feynmanState.cardIndex]);
  feynmanState.concept = info.concept;
  feynmanState.reference = info.reference;
  feynmanState.hint = '';
  feynmanState.notice = '';
  persistFeynman();
  renderFeynman();
});

els.feynmanConceptInput.addEventListener('input', () => {
  feynmanState.concept = els.feynmanConceptInput.value;
  clearFeynmanHint();
  queueFeynmanSave();
});

els.feynmanReferenceInput.addEventListener('input', () => {
  feynmanState.reference = els.feynmanReferenceInput.value;
  clearFeynmanHint();
  queueFeynmanSave();
});

els.feynmanExplanation.addEventListener('input', () => {
  syncFeynmanExplanation();
  clearFeynmanHint();
  feynmanState.notice = '';
  queueFeynmanSave();
});

// Fokus & selection textarea tidak boleh hilang saat tombol format diklik.
els.feynmanToolbar.addEventListener('mousedown', (event) => {
  if (event.target instanceof Element && event.target.closest('[data-format]')) {
    event.preventDefault();
  }
});

els.feynmanToolbar.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest('[data-format]');
  if (button) applyRichFormat(button);
});

els.feynmanChecks.forEach((input) => {
  input.addEventListener('change', () => {
    feynmanState.checklist[input.dataset.feynmanCheck] = input.checked;
    persistFeynman();
  });
});

els.feynmanNext1.addEventListener('click', () => goToFeynmanStep(2));
els.feynmanPrev2.addEventListener('click', () => goToFeynmanStep(1));
els.feynmanNext2.addEventListener('click', () => goToFeynmanStep(3));
els.feynmanPrev3.addEventListener('click', () => goToFeynmanStep(2));
els.feynmanSave.addEventListener('click', saveFeynmanPractice);
els.feynmanRestart.addEventListener('click', () => resetFeynmanDraft());

els.feynmanHistoryList.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;

  const loadButton = event.target.closest('[data-feynman-load]');
  if (loadButton) {
    loadFeynmanHistoryEntry(loadButton.dataset.feynmanLoad);
    return;
  }

  const deleteButton = event.target.closest('[data-feynman-delete]');
  if (deleteButton) deleteFeynmanHistoryEntry(deleteButton.dataset.feynmanDelete);
});

window.addEventListener('beforeunload', () => {
  if (!feynmanSaveTimer) return;
  window.clearTimeout(feynmanSaveTimer);
  feynmanSaveTimer = null;
  persistFeynman();
});

els.flashcard.addEventListener('click', toggleFlip);
els.flashcard.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleFlip();
  }
});

els.cardFlip.addEventListener('click', toggleFlip);
els.cardShuffle.addEventListener('click', shuffleCards);
els.cardPrev.addEventListener('click', () => goToCard(-1));
els.cardNext.addEventListener('click', () => goToCard(1));

els.quizOptions.addEventListener('click', (event) => {
  const button = event.target.closest('.quiz-option');
  if (!button) return;
  selectAnswer(Number(button.dataset.index));
});

els.quizNext.addEventListener('click', nextQuestion);
els.quizShuffle.addEventListener('click', shuffleQuiz);
els.quizTimer.addEventListener('click', () => toggleTimerMenu(quizTimer));
els.quizTimerOptions.forEach((option) => {
  option.addEventListener('click', () => {
    selectTimerDuration(quizTimer, Number(option.dataset.seconds));
  });
});

els.tfTrue.addEventListener('click', () => selectTfAnswer(true));
els.tfFalse.addEventListener('click', () => selectTfAnswer(false));
els.tfNext.addEventListener('click', nextTfQuestion);
els.tfShuffle.addEventListener('click', shuffleTf);
els.tfTimer.addEventListener('click', () => toggleTimerMenu(tfTimer));
els.tfTimerOptions.forEach((option) => {
  option.addEventListener('click', () => {
    selectTimerDuration(tfTimer, Number(option.dataset.seconds));
  });
});
els.btnTfRetry.addEventListener('click', retryTf);
els.btnTfShuffleResult.addEventListener('click', shuffleTf);
els.btnTfNew.addEventListener('click', startOver);

document.addEventListener('click', (event) => {
  const target = event.target;
  if (target instanceof Element && target.closest('.timer-control')) return;
  closeAllTimerMenus();
});

els.tabButtons.forEach((button) => {
  button.addEventListener('click', () => switchTab(button.dataset.tab));
});

els.langButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.lang === lang) return;
    applyLanguage(button.dataset.lang);
  });
});

if (els.themeToggle) {
  els.themeToggle.addEventListener('click', toggleThemeMenu);
  els.themeToggle.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openThemeMenu('selected');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openThemeMenu('last');
    } else if (event.key === 'Escape' && themeMenuOpen) {
      event.preventDefault();
      closeThemeMenu({ focusToggle: true });
    }
  });
}

if (els.themeMenu) {
  els.themeMenu.addEventListener('keydown', handleThemeMenuKeydown);
}

document.addEventListener('click', (event) => {
  const target = event.target;
  if (target instanceof Element && target.closest('.theme-picker')) return;
  if (themeMenuOpen) closeThemeMenu();
});

/* ============================================================
   Gulir area input dengan panah atas/bawah (v8.4)
   ============================================================ */

const INPUT_SCROLL_STEP = 72;

function canScroll(element) {
  return Boolean(element) && element.scrollHeight - element.clientHeight > 1;
}

/**
 * Panah atas/bawah hanya menggulir area input yang sedang aktif.
 * Mode tempel memakai scrollbar internal textarea, sedangkan mode
 * terstruktur memakai kontainer baris. Di layar sempit baris formulir
 * mengalir ke halaman, jadi halaman itulah yang digulir.
 */
function resolveInputScrollTarget(mode) {
  if (mode === 'paste') {
    return canScroll(els.notes) ? els.notes : null;
  }

  const rows = els.structuredRows;
  if (!rows) return null;

  const overflowY = window.getComputedStyle(rows).overflowY;
  if (overflowY === 'visible' || overflowY === 'hidden') {
    const page = document.scrollingElement;
    return canScroll(page) ? page : null;
  }

  return canScroll(rows) ? rows : null;
}

function handleInputAreaScroll(event) {
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return false;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return false;
  if (event.isComposing) return false;
  if (isTimerMenuOpen()) return false;

  const active = document.activeElement;
  const panel = active instanceof Element ? active.closest('.mode-panel') : null;
  if (!panel || panel.hidden) return false;

  const mode = panel === els.structuredPanel ? 'structured' : 'paste';
  if (mode !== state.inputMode) return false;

  const target = resolveInputScrollTarget(mode);
  if (!target) return false;

  event.preventDefault();
  target.scrollTop += event.key === 'ArrowUp' ? -INPUT_SCROLL_STEP : INPUT_SCROLL_STEP;
  return true;
}

document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === 'Escape' && closeAllTimerMenus({ restoreFocus: true })) return;
  if (isTimerMenuOpen()) return;
  if (themeMenuOpen) return;
  if (handleInputAreaScroll(event)) return;

  const tag = (document.activeElement?.tagName || '').toLowerCase();
  if (['input', 'textarea', 'select'].includes(tag)) return;
  if (els.studyPanels.classList.contains('hidden')) return;

  const cardsVisible = !els.tabCards.classList.contains('hidden');
  const quizVisible = !els.tabQuiz.classList.contains('hidden');
  const tfVisible = !els.tabTf.classList.contains('hidden');

  if (cardsVisible) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToCard(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToCard(-1);
    } else if ((event.key === ' ' || event.key === 'Enter') && tag !== 'button' && tag !== 'a') {
      event.preventDefault();
      toggleFlip();
    }
    return;
  }

  if (quizVisible && !els.quizBody.classList.contains('hidden')) {
    const choices = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 };
    const key = event.key.toLowerCase();

    if (Object.prototype.hasOwnProperty.call(choices, key)) {
      event.preventDefault();
      selectAnswer(choices[key]);
    } else if (
      event.key === 'ArrowRight'
      && !event.shiftKey
      && !event.repeat
      && state.answered
      && !els.quizNext.classList.contains('hidden')
    ) {
      event.preventDefault();
      nextQuestion();
    }
  }

  if (tfVisible && !els.tfBody.classList.contains('hidden')) {
    const key = event.key.toLowerCase();

    if (key === 't' || key === 'b') {
      event.preventDefault();
      selectTfAnswer(true);
    } else if (key === 'f' || key === 's') {
      event.preventDefault();
      selectTfAnswer(false);
    } else if (
      event.key === 'ArrowRight'
      && !event.shiftKey
      && !event.repeat
      && state.tfAnswered
      && !els.tfNext.classList.contains('hidden')
    ) {
      event.preventDefault();
      nextTfQuestion();
    }
  }
});

/* ============================================================
   Inisialisasi
   ============================================================ */

state.structuredRows = createEmptyStructuredRows();
renderStructuredRows();
setInputMode('paste', { persist: false });
updateCounters();
initMatchEvents();
renderWorkspace();
buildThemeOptions();
applyTheme(currentTheme, { persist: false });
applyLanguage(lang, { persist: false });
restoreSavedInput();
restoreFeynmanState();
if (document.fonts?.ready) document.fonts.ready.then(scheduleMatchLines);
