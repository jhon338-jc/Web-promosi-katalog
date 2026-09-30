# Katalog Menu Warung — Source Code Lengkap

Website katalog menu untuk warung makan, kedai kopi, atau rumah makan yang
ingin pesanan masuk lewat **WhatsApp** tanpa perlu aplikasi, database, atau
biaya bulanan.

Sudah termasuk:

- 20 menu demo siap ganti
- Dark mode (terang/gelap)
- Panel Pemilik untuk ubah menu, unggah foto, dan unduh project
- Pesan WhatsApp otomatis yang sudah rapi
- Bisa dipasang di HP seperti aplikasi (PWA)
- SEO + schema.org agar mudah ditemukan di Google

---

## 1. Isi Folder

```
├── index.html          Struktur halaman (sebagian besar tidak perlu diedit)
├── config.js           ★ SEMUA ISI WEBSITE ADA DI SINI
├── styles.css          Tampilan & warna
├── script.js           Logika interaksi
├── manifest.json       Pengaturan PWA
├── sw.js               Service worker (mode offline)
├── images/             Foto asli Anda (ada README di dalamnya)
├── icons/              Ikon aplikasi
└── tools/              Alat bantu (opsional, boleh dihapus)
```

**Yang paling sering diubah: `config.js`.** Semua teks, harga, foto, jam
buka, nomor WhatsApp, dan lainnya ada di satu file itu.

---

## 2. Cara Menjalankan

Tidak perlu install apa pun dan tidak perlu build.

**Cara 1 — klik dua kali**

Klik dua kali `index.html`. Website langsung terbuka di browser.

> Catatan: beberapa fitur (PWA / offline) tidak jalan dari `file://`.
> Untuk fitur penuh, jalankan lewat server lokal seperti di Cara 2.

**Cara 2 — server lokal (disarankan)**

- **Live Server** (VS Code): klik kanan `index.html` → *Open with Live Server*
- **XAMPP**: copy folder ke `C:\xampp\htdocs\warung`, lalu buka
  `http://localhost/warung/`
- **Node.js**:
  ```bash
  npx serve .
  ```
  atau pakai server bawaan project ini (tanpa perlu `npx`):
  ```bash
  npm run serve
  ```
  Untuk mencoba seperti hosting sub-folder (GitHub Pages):
  ```bash
  node tools/serve.js 8080 /warung
  # lalu buka http://localhost:8080/warung/
  ```

---

## 3. Mengubah Isi Warung

Buka `config.js`, lalu ubah bagian ini:

```js
const config = {
  namaWarung: "Warung Makan Bu Sari",   // ← nama warung
  tagline: "Dapur rumahan, harga warung",// ← tagline
  whatsapp: "6281234567890",             // ← WAJIB diganti
  telepon: "021-3899-1234",              // ← nomor telepon
  alamat: "Jl. Merdeka No. 10, Jakarta",// ← alamat
  jamBuka: {
    senin_jumat: "08:00-21:00",
    sabtu_minggu: "09:00-22:00",
  },
  menu: [ /* daftar menu */ ],
};
```

### Aturan penting

| Isian | Aturan |
| --- | --- |
| `whatsapp` | Format `628xxx` — **tanpa** `+`, **tanpa** spasi, **tanpa** tanda hubung |
| `jamBuka` | Format 24 jam `HH:MM-HH:MM` |
| `harga` | Angka saja, **tanpa** titik atau koma: `15000` (bukan `15.000`) |
| `foto` | URL `https://...` atau path lokal `images/menu/nama.jpg` |

Path foto lokal boleh ditulis relatif (`images/menu/nama.jpg`, **disarankan**)
atau diawali garis mula (`/images/menu/nama.jpg`). Dua-duanya otomatis menyesuaikan
folder website, jadi website tetap benar baik di domain root maupun sub-folder
GitHub Pages.

Status **BUKA / TUTUP** di header otomatis mengikuti `jamBuka`, jadi setiap
hari Anda tidak perlu edit apa pun.

### Menambah menu

Tambahkan satu objek baru di dalam `menu`:

```js
{
  id: 21,
  kategori: "Makanan",
  nama: "Nasi Ayam Goreng",
  harga: 22000,
  foto: "images/menu/nasi-ayam.jpg",
  deskripsi: "Nasi putih, ayam goreng renyah, sambal, lalapan.",
  badge: "Best Seller",   // atau: "Baru", "Promo", null
  tersedia: true,         // false = tampil tapi ada label HABIS
  varian: {
    level: ["Pedas Sedang", "Pedas Kental", "Tidak Pedas"],
    topping: [
      { nama: "Telur", harga: 3000 },
      { nama: "Ayam Extra", harga: 8000 },
    ],
  },
},
```

`varian` boleh diisi atau dikosongkan (`{}`). Kalau ada `topping`, harganya
otomatis ditambahkan ke subtotal dan pesan WhatsApp.

---

## 4. Memasang Foto

Ada dua cara.

### Cara A — lewat Panel Pemilik (paling mudah)

1. Buka website di browser
2. Klik ikon **pensil** di baris filter katalog
3. Buka tab **Foto**, seret foto ke kotak unggah
4. Tab **Menu** → klik **Pilih Foto** untuk menempelkan foto ke menu
5. Tab **Export** → klik **Unduh Project (.zip)**
6. Ekstrak file `.zip`, lalu upload **seluruh isinya** ke hosting

> Isi ZIP: `index.html`, `styles.css`, `script.js`, `manifest.json`, `sw.js`,
> folder `icons/`, `config.js` terbaru, dan folder `images/` berisi foto yang
> Anda unggah. Jadi cukup replace seluruh file di hosting dengan isi ZIP.
>
> File inti hanya ikut terbawa kalau website dibuka lewat server (bukan
> klik dua kali `file://`). Kalau tidak, ZIP tetap berisi `config.js` + foto.

### Cara B — manual

1. Masukkan file ke `images/menu/`, `images/galeri/`, atau `images/`
2. Tulis path-nya di `config.js`

```js
foto: "images/menu/nasi-ayam.jpg",
```

> **Penting:** hosting biasa tidak bisa menyimpan file. Karena itu setiap
> perubahan dari Panel Pemilik **wajib** diunduh dan di-upload ulang agar
> permanen. Lihat `images/README.md` untuk daftar folder.

---

## 5. Panel Pemilik

Buka lewat ikon pensil di baris filter. Empat tab:

| Tab | Fungsi |
| --- | --- |
| **Menu** | Ubah nama, harga, kategori, badge, status tersedia, foto. Tambah / hapus menu. |
| **Foto** | Unggah foto ke browser, lihat daftar, hapus. |
| **Info** | Ubah nama warung, tagline, WhatsApp, alamat, jam buka, link Maps. |
| **Export** | Unduh `config.js` saja, atau unduh Project `.zip` berisi file inti + foto. |

Semua perubahan langsung terlihat di katalog untuk mencoba, lalu disimpan
di browser sampai Anda melakukan export.

> Keranjang disimpan di browser pelanggan, jadi masih ada setelah ditutup dan
> dibuka lagi. Keranjang baru dikosongkan setelah tombol **Pesan via WhatsApp**
> ditekan, supaya pesanan lama tidak terkirim dua kali.

---

## 6. Deploy ke Hosting (Gratis)

**Netlify** — paling cepat:

1. Buka [app.netlify.com/drop](https://app.netlify.com/drop)
2. Seret seluruh folder project ke halaman tersebut
3. Website langsung online, HTTPS otomatis

**GitHub Pages**:

1. Buat repository baru, upload semua file
2. Settings → Pages → Source: `main` / `root`
3. Tunggu 1–2 menit, website online di `https://USERNAME.github.io/NAMA-REPO/`

> Tidak ada file yang perlu diedit untuk sub-folder. Semua path di
> `index.html`, `manifest.json`, dan `sw.js` sengaja dibuat **relatif**, jadi
> website langsung jalan baik di root (`namadomain.com/`) maupun di sub-folder
> (`user.github.io/nama-repo/`).

**Domain sendiri** (opsional): di Netlify → Domain settings → Add custom
domain. Ikuti panduan DNS yang diberikan.

---

## 7. Mengubah Warna

Semua warna ada di bagian atas `styles.css` pada blok `:root`:

```css
:root {
  --sunny: #ffc107;      /* kuning utama */
  --sunny-deep: #ffb300; /* kuning tua */
  --sunny-soft: #fff8e1; /* krem */
  --amber: #ff8f00;      /* oranye aksen */
  --brown: #4e342e;      /* cokelat teks */
  --brown-light: #8d6e63;
  --wa: #25d366;         /* hijau WhatsApp */
}
```

Ganti nilainya, seluruh website ikut berubah. Warna gelap (dark mode)
disetel otomatis lewat `color-scheme` dan variabel yang sama.

---

## 8. Mengubah Ikon Aplikasi

Ikon ada di `icons/`. Ganti dengan logo Anda (PNG 512x512, latar emas),
lalu jalankan ulang:

```bash
node tools/make-icons.js
```

---

## 9. Mode Offline & Menghapus Cache

Kalau website menampilkan versi lama setelah Anda mengubah file:

1. Naikkan nomor versi di `sw.js` bagian `CACHE_VERSION`, atau
2. Di browser: DevTools → Application → Storage → **Clear site data**

> `config.js` (daftar menu, harga, jam buka) **tidak** memakai cache lama, jadi
> perubahan menu langsung terlihat begitu di-upload.

---

## 10. Alat Bantu (Opsional)

Folder `tools/` berisi script Node.js tanpa dependency tambahan. Boleh
dihapus sebelum upload ke hosting, tapi berguna untuk mengecek hasil kerja.

```bash
node tools/check-config.js    # cek config.js: nomor WA, jam, harga, foto
node tools/check-wiring.js    # cek id HTML <-> JS, file yang hilang, path absolut
node tools/check-clean.js     # scan teks rusak / huruf asing
node tools/check-runtime.js   # jalankan website tanpa browser, cek error & isi halaman
node tools/check-http.js      # cek semua file bisa diakses lewat HTTP (butuh serve.js)
node tools/make-icons.js      # buat ulang icon PWA
node tools/inspect-lines.js script.js 2940 3000   # lihat sebagian isi file
```

Jalankan semuanya sekaligus:

```bash
npm run check
```

Atau uji lewat HTTP (meniru kondisi hosting, termasuk mode sub-folder):

```bash
npm run serve                              # terminal 1
node tools/check-http.js 8080              # terminal 2
node tools/serve.js 8081 /repo              # terminal 1 (mode sub-folder)
node tools/check-http.js 8081 /repo        # terminal 2
```

---

## 11. Yang Tidak Perlu Dilakukan

- Tidak perlu Node.js untuk menjalankan website
- Tidak perlu database, PHP, atau MySQL
- Tidak perlu akun hosting berbayar
- Tidak perlu proses build (`npm install`, webpack, dll)
- Tidak perlu mengedit file lain saat memindahkan ke hosting lain
- Tidak ada file yang mengirim data pelanggan ke server

---

## 12. Ringkasan Teknis

| Bagian | Teknologi |
| --- | --- |
| Tampilan | HTML5 + CSS3 (custom properties) + Tailwind CDN |
| Logika | Vanilla JavaScript (tanpa framework) |
| Data | `config.js` (mudah diedit pemilik) |
| Penyimpanan lokal | `localStorage` (keranjang, tema, draft) |
| Penyimpanan foto | IndexedDB (browser, lalu di-export) |
| Export | Penulis ZIP sendiri (tanpa library) |
| Offline | Service worker + Cache API |
| Path | Relatif, aman untuk hosting root maupun sub-folder |
| Deploy | Hosting statis (Netlify / GitHub Pages / cPanel) |

---

## 13. Bantuan

- Baca komentar di `config.js` — semua opsi sudah ada penjelasannya
- Jalankan `npm run check` untuk pesan error yang jelas
- Ganti isi tombol WhatsApp di `script.js` pada fungsi `buatPesanWA()`

---

## Lisensi

Lihat file `LICENSE.md`.
