# Quick Memorize Quiz — v12.0 (Feynman Technique Mode)

Ubah catatan kuliah menjadi **flashcard 3D**, **kuis pilihan ganda**, dan **kuis True / False** langsung di browser. Tidak ada backend; semua pemrosesan berjalan lokal.

Versi 12.0 mempertahankan seluruh fitur v11.0 — termasuk **format teks & matematika dasar**, pemilih warna aksen, dukungan foto, dan tata letak seluler — lalu menambahkan **Metode Feynman**: alur tiga langkah untuk memilih konsep, menjelaskannya dengan bahasa sendiri, lalu membandingkannya dengan catatan asli.

## Fitur

- **Dua mode input yang terpisah** — pilih **Tempel Teks** untuk menulis catatan bebas, atau **Formulir Soal** untuk mengisi istilah dan penjelasan satu per satu. Kedua mode tidak pernah aktif bersamaan, dan tombol **Buat Flashcard & Kuis** hanya membaca mode yang sedang aktif.
- **Formulir soal terstruktur dengan foto** — tombol **Tambahkan Soal** menambahkan baris bernomor baru. Setiap baris memiliki kolom **Term / Istilah / Pertanyaan** dan **Explanation / Penjelasan / Jawaban** yang tersusun vertikal. Di samping setiap kolom ada tombol **Foto**; klik untuk memilih gambar dari perangkat atau seret file langsung ke kolomnya. Setiap kolom boleh berisi teks saja, foto saja, atau teks dan foto sekaligus. Baris bisa dihapus, dan formulir menampilkan jumlah soal yang sudah lengkap.
- **Kompresi foto otomatis** — sebelum disimpan sebagai Base64, gambar diperkecil (maksimal 1024 px) dan dikonversi ke JPEG dengan kualitas sekitar 0,72. Ukurannya terus diturunkan bila masih terlalu besar, dengan target di bawah 180 KB per foto. Pratinjau foto tampil di formulir dan bisa dihapus kapan saja tanpa menghapus teksnya. Jika penyimpanan browser penuh, aplikasi menampilkan peringatan agar beberapa foto dihapus.
- **Validasi formulir** — baris kosong diabaikan, tetapi baris yang baru terisi separuh ditandai. Sebuah kolom dianggap terisi jika ada teks atau fotonya. Materi baru bisa dibuat jika ada minimal dua baris lengkap. Istilah boleh sama antar baris selama foto pertanyaan atau jawabannya berbeda; hanya soal yang benar-benar kembar (pertanyaan dan jawaban sama persis) yang ditolak.
- **Flashcard otomatis** — catatan tempel dipecah menjadi kartu definisi dan kartu isian rumpang. Kartu dari formulir terstruktur selalu berupa kartu definisi, menampilkan istilah dan fotonya secara langsung di sisi depan, lalu penjelasan beserta fotonya di sisi belakang, dan tidak memakai soal rumpang.
- **Kuis pilihan ganda** — setiap baris valid menjadi satu soal tanpa batas 8 soal. Setiap nomor berisi satu jawaban benar dan hingga tiga pengecoh unik; opsi kembar (teks dan foto sama) dan pengecoh yang sama dengan jawaban benar otomatis dibuang. Opsi dan pembahasan ikut menampilkan foto bila ada, sehingga soal dengan teks, foto, atau keduanya tetap terbaca. Urutan soal dan susunan opsi mengikuti urutan input, tetapi posisi jawaban benar (A–D) diacak. Pengacakan urutan soal dan opsi secara menyeluruh hanya terjadi ketika tombol **Acak Kuis** diklik. Tersedia pembahasan jawaban, skor otomatis, dan daftar materi untuk diulang.
- **Posisi jawaban benar yang bervariasi** — meski **Acak Kuis** tidak dipakai, posisi jawaban benar disebar acak dan merata di antara pilihan A–D, sehingga tidak membentuk pola tetap seperti 1=A, 2=B, 3=C, 4=D. Posisi diacak ulang setiap kali kuis dibuat, diulang, atau halaman dimuat kembali, jadi tidak selalu sama dengan sesi sebelumnya. Pengecoh tetap unik dan jawaban benar tidak pernah hilang.
- **Kuis True / False** — pernyataan disusun dari pasangan istilah–penjelasan dengan urutan mengikuti input dan pola benar/salah yang seimbang. Setiap pernyataan menampilkan teks dan/atau foto secara proporsional. Setiap penjelasan milik istilah lain hanya dipakai sekali sebagai pengecoh dalam satu sesi, sedangkan jawaban asli pada pernyataan benar tetap boleh tampil. Tombol **Acak T/F** membuat kombinasi, pengecoh, serta urutan pernyataan acak dengan aturan yang sama. Ada feedback instan dan skor akhir.
- **Pengecoh T/F unik** — satu penjelasan tidak bisa menjadi pasangan salah dua kali dalam sesi T/F yang sama. Bila tidak ada penjelasan lain yang tersisa, soal otomatis tampil sebagai pernyataan benar. Jumlah pernyataan Benar dan Salah juga dijaga hampir seimbang, dengan selisih maksimal satu pernyataan.
- **Streak & konfeti** — kuis pilihan ganda dan True / False menampilkan indikator api 🔥 saat jawaban benar beruntun mencapai 2 atau lebih. Streak kembali ke 0 saat jawaban salah, kuis direset/diacak, atau kuis selesai. Skor akhir minimal 80% memicu animasi konfeti di layar hasil.
- **Acak kartu & kuis** — tombol shuffle mengacak urutan flashcard. Pada kuis pilihan ganda dan True / False, materi yang baru dibuat atau diulang tetap memakai urutan input. Urutan soal, susunan opsi, dan kombinasi T/F diacak penuh hanya saat tombol **Acak** diklik; khusus MCQ, posisi jawaban benar tetap diacak setiap kali kuis disusun. Progres (skor, jawaban, indeks, streak) direset, lalu kuis dimulai dari soal pertama.
- **Pintasan lanjut soal** — setelah menjawab soal pilihan ganda atau True / False, tekan **→** (`ArrowRight`) untuk langsung lanjut tanpa mengklik tombol Next. Hanya panah kanan yang memicu aksi ini; panah kiri/atas/bawah dan tombol lain tidak melompatkan soal. Pintasan nonaktif sebelum jawaban dipilih, saat mengetik di kolom input, atau saat menu timer/tema terbuka.
- **Gulir area input dengan keyboard** — klik area **Tempel Teks** atau **Formulir Soal** (termasuk kotak teks dan kolom isian di dalamnya), lalu tekan **↑** / **↓** untuk menggulir isi area secara mulus ketika materinya panjang. Panah atas/bawah hanya bekerja di area input yang sedang aktif dan tidak mengganggu navigasi flashcard maupun pintasan **→** di kuis. Di dalam kotak teks, kursor tetap bisa dipindah lewat klik, Home/End, atau Shift + panah.
- **Timer kuis interaktif** — tombol ikon jam di kiri tombol Acak pada kuis pilihan ganda dan True / False membuka pilihan durasi 5, 10, 30, atau 60 detik. Cincin melingkar di sekitar ikon menyusut sesuai sisa waktu. Timer memulai ulang penuh di setiap soal; jika waktu habis, soal dianggap salah, umpan balik ditampilkan, lalu kuis otomatis lanjut ke soal berikutnya atau ke layar hasil. Tombol Acak/Ulangi dan perpindahan tab mematikan serta mereset timer.
- **Dua bahasa (ID/EN)** — seluruh antarmuka berganti bahasa lewat toggle di header, termasuk label formulir, tips per mode, label aksesibilitas streak, label timer, dan pesan selebrasi. Pilihan bahasa diingat.
- **Pemilih warna aksen (v10)** — tombol palet di header, tepat di samping toggle ID/EN, membuka menu berisi 14 warna: **Biru** (default), **Merah**, **Orange**, **Hijau**, **Kuning**, **Pink**, **Hitam**, **Ungu**, **Coklat**, **Abu-abu**, **Hijau Gelap**, **Cyan**, **Teal**, dan **Zaitun**. Warna langsung diterapkan saat opsi diklik tanpa memuat ulang halaman. Yang berubah hanya warna aksen — tombol aktif, lencana, progress bar, tombol utama, tab, tautan, dan sorotan formulir — sedangkan latar putih dan warna netral tetap seperti semula. Pilihan disimpan di `localStorage` dan dipulihkan sebelum halaman selesai dimuat agar tidak berkedip. Menu mendukung klik, sentuhan, serta navigasi keyboard (panah, Home, End, Escape).
- **Metode Feynman (v12.0)** — tab **Feynman** menambahkan alur belajar tiga langkah. **Langkah 1** memilih konsep dari flashcard yang sudah ada atau mengetik konsep baru beserta catatan aslinya. **Langkah 2** meminta penjelasan dengan bahasa sederhana seolah-olah mengajar orang lain, lengkap dengan toolbar format dan penghitung karakter/kata. **Langkah 3** menampilkan penjelasanmu berdampingan dengan catatan asli, analisis celah otomatis (kata kunci yang belum muncul), dan checklist evaluasi mandiri. Hasil latihan bisa disimpan ke riwayat, dimuat kembali, atau dihapus.
- **Riwayat Feynman lokal** — draf langkah terakhir dan hingga 30 latihan tersimpan di `localStorage` dengan kunci terpisah, sehingga struktur data catatan v11.0 dan file ekspor tidak berubah. Draf dipulihkan saat halaman dibuka kembali, dan setiap latihan menyimpan konsep, penjelasan, catatan asli, checklist, kata kunci yang belum muncul, serta waktu pembuatan.
- **Format teks & matematika dasar (v11.0)** — teks istilah, penjelasan, pertanyaan, opsi jawaban, pembahasan, pernyataan T/F, penjelasan Feynman, dan catatan asli Feynman mendukung **tebal**, *miring*, pangkat, dan indeks. Tulis `**tebal**`, `*miring*`, `x^2`, `H_2O`, `x^{n+1}`, atau `H_{2}O`; tag `<b>`, `<i>`, `<strong>`, `<em>`, `<sup>`, dan `<sub>` juga dikenali. Di **Formulir Soal** dan **Feynman**, setiap area teks punya tombol format **B**, *I*, x², dan x₂ yang membungkus teks terpilih secara instan (tekan tombol yang sama lagi untuk melepasnya). Format disimpan sebagai teks biasa, jadi data lama tetap kompatibel dan file JSON tidak berubah skemanya.
- **Render aman (anti-XSS)** — semua teks di-escape lebih dulu, lalu hanya tag format di atas yang diizinkan kembali. Tag lain seperti `<script>`, atribut event, atau `<img onerror>` tetap tampil sebagai teks biasa. Sintaks ringan diterjemahkan setelah escaping, sehingga tidak ada input pengguna yang bisa menyuntikkan HTML berbahaya.
- **Tampilan seluler & target sentuh (v10.1)** — header, toggle ID/EN, pemilih tema, indikator kartu/soal, dan kontrol kuis otomatis turun ke baris sendiri pada layar sempit tanpa saling menumpuk. Tab utama memenuhi lebar layar, tombol aksi hasil kuis tersusun vertikal, dan seluruh kontrol interaktif — unggah/hapus foto, tombol format, hapus baris, opsi tema, tab, timer, navigasi kartu, serta tombol jawaban — memiliki target sentuh minimal 44 px. Menu tema dan timer dibatasi agar tetap berada di dalam viewport, dan ukuran huruf input dinaikkan saat mode seluler untuk mencegah zoom otomatis iOS.
- **Auto-save** — catatan, formulir, dan foto tersimpan otomatis di `localStorage`, termasuk mode input yang sedang aktif. Draf Feynman dan riwayat latihan disimpan terpisah. Saat halaman dibuka kembali, materi dari mode aktif dibuat ulang otomatis dan draf Feynman terakhir dipulihkan.
- **Hapus semua** — tombol reset dua langkah untuk membersihkan catatan, formulir, foto, materi belajar, draf Feynman, riwayat Feynman, dan penyimpanan lokal terkait.
- **Ekspor & impor file** — unduh kedua mode input beserta foto dan hasil kartu/kuis sebagai JSON, lalu muat kembali file JSON atau TXT kapan saja. File ekspor v7 dan v8 tetap bisa diimpor.

## Tema warna aksen

Warna aksen diatur lewat tombol palet di header. Perubahan berlaku instan dan hanya menyentuh elemen beraksen, bukan latar utama:

| Nama | ID tema | Nama | ID tema |
| --- | --- | --- | --- |
| Biru (default) | `blue` | Coklat | `brown` |
| Merah | `red` | Abu-abu | `gray` |
| Orange | `orange` | Hijau Gelap | `dark-green` |
| Hijau | `green` | Cyan | `cyan` |
| Kuning | `yellow` | Teal | `teal` |
| Pink | `pink` | Zaitun | `olive` |
| Hitam | `black` | Ungu | `purple` |

Preferensi disimpan di `localStorage` dengan kunci `ai-study-buddy.theme`. Skrip kecil di `<head>` menerapkan tema tersimpan sebelum stylesheet dimuat, sehingga warna tidak berkedip saat halaman dibuka kembali. Untuk kembali ke tampilan awal, pilih **Biru**.

## Tampilan seluler

Mulai v10.1, aplikasi tetap nyaman dipakai di ponsel Android dan iOS:

- Header dan kontrolnya menjadi satu kolom penuh pada layar kecil; toggle **ID/EN**, pemilih tema, dan statistik tidak lagi bertumpuk.
- Tab **Flashcard / Kuis / True / False / Feynman** memenuhi lebar layar dengan tinggi sentuh yang cukup, dan tombol hasil kuis tersusun vertikal.
- Langkah Feynman, tombol sumber konsep, tombol riwayat, dan tombol aksi review memiliki target sentuh minimal 44 px; dua kartu perbandingan otomatis menumpuk satu kolom.
- Tombol bahasa, tema, timer, acak, navigasi kartu, jawaban kuis, unggah foto, hapus foto, dan hapus baris memiliki target sentuh minimal 44 px.
- Menu warna tema dan menu durasi timer diposisikan ulang serta dibatasi lebarnya agar tidak terpotong di tepi layar.
- Kolom teks memakai ukuran huruf 16 px pada layar kecil supaya iOS tidak memperbesar halaman saat kolom difokuskan.
- Perangkat berlayar sentuh juga mendapat target sentuh yang sama saat ponsel dipakai dalam mode lanskap.

Tata letak desktop tidak berubah: dua kolom, ukuran tombol ringkas, dan seluruh fitur v10 tetap berjalan seperti sebelumnya.

## Cara menjalankan

Buka `index.html` di browser. Koneksi internet diperlukan untuk Tailwind CSS (CDN) dan Google Fonts.

Untuk pengalaman terbaik (dan agar `localStorage` konsisten), jalankan server statis lokal:

```bash
python -m http.server 8000
```

Lalu buka `http://127.0.0.1:8000`.

## Struktur file

| File | Isi |
| --- | --- |
| `index.html` | Struktur halaman, tab mode input, formulir soal dinamis, flashcard, kuis pilihan ganda, kuis True / False, panel Feynman tiga langkah, kontrol timer, pemilih warna aksen, dan tombol penyimpanan |
| `style.css` | Gaya kustom: token warna aksen dan 14 tema, panel, tab mode, baris formulir, toolbar format teks, alur dan riwayat Feynman, kontrol foto, tombol, kartu 3D, kuis, pilihan benar/salah, streak, cincin timer, konfeti, status simpan, serta aturan responsif dan target sentuh seluler |
| `app.js` | Parsing catatan, formulir terstruktur, toolbar format, render rich text + sanitasi, unggah dan kompresi foto, validasi, penyusunan kartu/kuis/TF, alur Feynman + analisis celah + riwayat lokal, pengacakan lewat tombol Acak, timer kuis, streak, konfeti, i18n, tema aksen, auto-save, ekspor/impor |

## Format input

### Tempel teks

Satu poin per baris. Baris dengan titik dua menjadi kartu definisi:

```text
Overfitting terjadi ketika model terlalu hafal data latih.
Neural network: jaringan saraf tiruan berlapis neuron buatan.
```

Baris tanpa titik dua otomatis menjadi kartu isian rumpang. Pasangan singkat seperti `DB: Basis data` atau `Kata: Penjelasan` tetap dikenali sebagai kartu definisi. Minimal dua poin agar kuis bisa dibuat.

### Formulir soal

Isi minimal dua baris lengkap:

| Term / Istilah / Pertanyaan | Explanation / Penjelasan / Jawaban |
| --- | --- |
| Overfitting | Model terlalu hafal data latih sehingga buruk pada data baru. |
| Regularisasi | Teknik mengurangi overfitting dengan memberi penalti pada model yang kompleks. |

Setiap baris lengkap menjadi satu kartu definisi, lalu dipakai untuk menyusun soal pilihan ganda dan pernyataan True / False. Istilah boleh sama asalkan foto pertanyaan atau jawabannya berbeda, sehingga dua soal dengan teks yang sama tetap tampil sebagai kartu dan soal terpisah. Hanya baris yang benar-benar kembar (pertanyaan dan jawaban sama persis) yang ditolak. Beberapa soal juga boleh memiliki penjelasan yang sama. Baris kosong boleh ditinggal, tetapi baris yang hanya terisi salah satu kolom akan ditandai dan harus dilengkapi atau dikosongkan.

### Format teks & matematika dasar

Sintaks ringan ini berlaku untuk istilah, penjelasan, pertanyaan, opsi jawaban, pembahasan, dan pernyataan True / False:

| Tulis | Tampil |
| --- | --- |
| `**tebal**` | **tebal** |
| `*miring*` | *miring* |
| `x^2` | x<sup>2</sup> |
| `x^{n+1}` | x<sup>n+1</sup> |
| `H_2O` | H<sub>2</sub>O |
| `H_{2}O` | H<sub>2</sub>O |

Tag `<b>`, `<i>`, `<strong>`, `<em>`, `<sup>`, dan `<sub>` juga dikenali, dan tag penutupnya bersifat opsional. Di **Formulir Soal**, setiap kolom punya tombol **B**, *I*, x², dan x₂ untuk membungkus teks yang sedang dipilih; tekan tombol yang sama lagi untuk melepasnya.

Yang perlu diketahui:

- format hanya mengubah tampilan saat materi dirender, sedangkan teks asli tetap utuh di `localStorage` dan file ekspor;
- semua teks di-escape lebih dulu, lalu hanya tag format di atas yang dikembalikan, sehingga `<script>`, atribut event, dan tag berbahaya lain tidak bisa berjalan;
- garis bawah di tengah kata seperti `file_name` dibiarkan apa adanya; hanya `_2` atau `_i` yang berdiri sendiri yang diubah menjadi indeks.

### Foto pada formulir soal

Setiap kolom punya tombol **Foto** dan area yang menerima seret-lepas (*drag & drop*). Foto bisa dipakai sebagai pengganti teks atau sebagai pelengkap:

| Term / Istilah / Pertanyaan | Explanation / Penjelasan / Jawaban |
| --- | --- |
| `Overfitting` + foto kurva | Model terlalu hafal data latih. |
| Foto diagram arsitektur | Foto arsitektur jaringan + keterangan singkat. |
| Foto istilah | Foto penjelasan |

Aturan yang berlaku:

- teks saja, foto saja, atau teks + foto sama-sama valid;
- istilah boleh sama selama foto pertanyaan atau jawabannya berbeda — hanya baris yang benar-benar kembar (pertanyaan dan jawaban sama) yang ditolak;
- foto dikompres otomatis ke JPEG (maksimal 1024 px, target < 180 KB) sebelum menjadi Base64;
- pratinjau foto bisa dihapus lewat tombol × tanpa mengubah teks di kolom yang sama.

## Metode Feynman

Tab **Feynman** dipakai untuk menguji pemahaman, bukan menghafal. Alurnya tiga langkah:

1. **Pilih atau tulis konsep** — pilih salah satu kartu dari materi yang sudah dibuat, atau ketik konsep baru. Untuk konsep manual, catatan asli/kunci jawaban boleh diisi agar langkah review punya pembanding. Jawaban asli sengaja tidak ditampilkan di langkah ini supaya kamu menjelaskan dari ingatan.
2. **Jelaskan dengan bahasa sederhana** — tulis penjelasan seolah-olah sedang mengajar orang lain. Area teks mendukung format `**tebal**`, `*miring*`, `x^2`, dan `H_2O` lewat toolbar atau sintaks langsung. Penghitung karakter dan kata membantu menjaga panjang penjelasan; minimal 20 karakter agar bisa direview.
3. **Review & analisis celah** — penjelasanmu ditampilkan berdampingan dengan catatan asli. Analisis otomatis membandingkan kata kunci catatan asli dengan penjelasanmu dan menandai kata yang belum muncul (hingga enam chip). Checklist evaluasi mandiri mencakup kesederhanaan bahasa, istilah rumit, contoh/analogi, dan kelengkapan ide utama.

Latihan bisa disimpan ke **Riwayat latihan** (maksimal 30 entri). Setiap entri bisa dimuat kembali ke langkah review atau dihapus. Draf dan riwayat disimpan di kunci `ai-study-buddy.feynman`, terpisah dari catatan materi, sehingga impor/ekspor JSON dan data v11.0 tidak terpengaruh. Tombol **Hapus semua** membersihkan draf dan riwayat ini juga.

## Penyimpanan

- `ai-study-buddy.notes` — data terakhir dalam format JSON `{ version: 5, inputMode, notes, structured, updatedAt }`
  - `inputMode`: `"paste"` atau `"structured"`
  - `notes`: isi mode tempel teks
  - `structured`: array `{ term, explanation, termImage, explanationImage }`; field gambar berisi data URL Base64 atau string kosong
- `ai-study-buddy.lang` — preferensi bahasa (`id` atau `en`)
- `ai-study-buddy.theme` — preferensi warna aksen (`blue`, `red`, `orange`, `green`, `yellow`, `pink`, `black`, `purple`, `brown`, `gray`, `dark-green`, `cyan`, `teal`, atau `olive`)
- `ai-study-buddy.feynman` — draf dan riwayat Metode Feynman dalam format JSON `{ version: 1, draft, history }`
  - `draft`: `{ step, source, cardIndex, concept, reference, explanation, checklist, updatedAt }`
  - `history`: array maksimal 30 entri `{ id, concept, explanation, reference, source, missing, checklist, createdAt }`
  - `checklist`: `{ simple, jargon, example, complete }` berisi boolean

File ekspor memakai skema **versi 9** dan berisi `inputMode`, `notes`, `structured`, `cards`, `quiz`, `trueFalse`, serta `summary` (jumlah kartu/soal, jawaban terisi, skor, jumlah soal True / False, dan jumlah baris terstruktur yang lengkap). Setiap kartu, soal, opsi, dan pernyataan T/F menyertakan foto (`termImage`, `definitionImage`, `noteImage`, `correctTermImage`) bila ada. Setiap kartu menyertakan `sourceMode` (`paste` atau `structured`), dan setiap soal kuis menyertakan status `timedOut`. Ukuran file impor maksimal 12 MB agar ekspor berisi beberapa foto tetap bisa dimuat.

Skema penyimpanan catatan dan ekspor tidak berubah di v12.0. Riwayat Feynman memakai kunci sendiri dan tidak dimasukkan ke file ekspor materi. Sintaks format seperti `**tebal**` atau `H_2O` disimpan sebagai teks biasa, sehingga file lama tetap terbaca dan file baru tetap bisa dibuka di versi sebelumnya (format hanya akan tampil sebagai teks biasa).

Saat impor:

- file JSON v9 memulihkan kedua kumpulan data, foto, dan mode input yang tersimpan;
- file JSON v7/v8 atau file TXT membuka mode **Tempel Teks** (data formulir yang sudah ada tidak dihapus);
- materi langsung dibuat dari mode yang aktif setelah impor.
