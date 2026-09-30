# Folder `images/` - tempat foto asli warung Anda

Semua foto di website ini **tidak disimpan di server** (website ini statis).
Jadi foto ditaruh manual di folder ini, lalu path-nya ditulis di `config.js`.

## Struktur folder

```
images/
├── logo.png        → logo warung (1:1 / bulat, minimal 200x200 px)
├── banner.jpg      → foto banner hero (16:9, contoh 1600x900 px)
├── qris.png        → QRIS untuk pembayaran (1:1, minimal 400x400 px)
├── menu/           → foto menu, contoh: nasi-goreng.jpg
└── galeri/         → foto galeri warung, contoh: 1.jpg, 2.jpg, 3.jpg
```

## Cara memasang foto

1. Copy file foto ke folder yang sesuai di atas.
2. Buka `config.js`.
3. Ganti URL foto Unsplash (contoh) dengan path lokal Anda.

```js
// SEBELUM (foto demo dari internet)
foto: "https://images.unsplash.com/photo-xxx?auto=format&fit=crop&w=800&q=80",

// SESUDAH (foto asli Anda, path relatif)
foto: "images/menu/nasi-goreng.jpg",
```

Path juga boleh ditulis `"/images/menu/nasi-goreng.jpg"`; hasilnya sama saja,
karena website otomatis menyesuaikan foldernya sendiri.

## Tips foto yang bagus

| Jenis foto      | Rasio  | Ukuran ideal | Keterangan                        |
| --------------- | ------ | ------------ | --------------------------------- |
| Logo            | 1:1    | 200x200      | Persegi bulat, latar polos        |
| Banner hero     | 16:9   | 1600x900     | foto meja makan / suasana warung  |
| Foto menu       | 4:3    | 800x600      | foto atas, terang, tidak blur     |
| Foto galeri     | 4:3    | 800x600      | suasana dalam & luar warung       |
| QRIS            | 1:1    | 400x400      | QR harus jelas dan tidak buram    |

## Compress foto dulu

Foto besar membuat website lambat di HP. Kompres sebelum di-upload:

- **TinyPNG.com** — gratis, drag & drop, paling mudah untuk pemula.
- **Squoosh.app** — gratis, bisa atur kualitas manual.
- Targetkan ukuran **di bawah 300 KB** per foto menu.

## Cara cepat dari Panel Pemilik

Bisa juga tanpa menyentuh folder: buka **Panel Pemilik → tab Foto**, unggah foto
di browser, lalu unduh **Project (.zip)**. Isi `.zip` itu sudah berisi file inti
project, `config.js` terbaru, beserta folder `images/`, jadi tinggal ekstrak
lalu upload seluruh isinya ke hosting.

---

Folder `menu/` dan `galeri/` sengaja dibiarkan kosong supaya struktur project
tetap rapi. Jangan dihapus.
