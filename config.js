/* ==========================================================================
   CONFIG.JS - SATU-SATUNYA FILE YANG PERLU DIEDIT PEMILIK WARUNG
   ==========================================================================
   Ganti semua nilai di bawah ini, lalu save. Selesai. Tidak perlu edit
   file lain (index.html / script.js / styles.css) sama sekali.

   CARA PAKAI:
   1. Ganti namaWarung, tagline, whatsapp  -> syarat utama, wajib.
   2. Ganti jamBuka  -> status BUKA/TUTUP di website jadi otomatis.
   3. Ganti isi array "menu"  -> katalogmu.
   4. Upload foto ke folder /images/ lalu tulis path-nya di field "foto".

   PENTING:
   - Format whatsapp HARUS "628xxx" (kode negara + nomor, TANPA "+", TANPA spasi).
     Contoh benar  : "6281234567890"
     Contoh salah  : "+62 812-3456-7890"
   - "jamBuka" memakai format 24 jam "HH:MM-HH:MM".
     Kalau buka sampai tengah malam, tulis jam awal lebih besar dari jam
     akhir, contoh "17:00-02:00".
    - Foto boleh diisi URL internet (https://...) ATAU path lokal
      ("images/menu/xxx.jpg"). Path relatif ikut folder website, jadi aman
      di hosting root maupun sub-folder.
   - Kalau file foto tidak ditemukan, website otomatis pakai gambar
     cadangan bertema kuning. Jadi tidak akan pernah tampil kotak kosong.
   ========================================================================== */

const config = {
  /* ----------------------------------------------------------------------
     IDENTITAS WARUNG
     ---------------------------------------------------------------------- */
  namaWarung: "Warung Makan Bu Sari",
  tagline: "Masakan Rumahan Rasa Juara",
  deskripsiSingkat:
    "Warung rumahan legendaris sejak 2005. Nasi goreng, sate, soto, dan Aneka hidangan lain yang dimasak dengan resep keluarga. Digoreng segar, dikirim hangat ke depan pintu Anda.",

  // Logo: foto bulat. Ganti ke "images/logo.png" setelah upload.
  logo: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&w=200&h=200&q=80",

  // Foto banner hero. Rasio ideal: lebar (1600 x 900).
  banner: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&h=900&q=80",

  /* ----------------------------------------------------------------------
     KONTAK
     ---------------------------------------------------------------------- */
  whatsapp: "6281234567890", // format internasional tanpa "+"  (WAJIB)
  telepon: "081234567890", // nomor tampilan, boleh ada "0" / spasi / tanda hubung

  alamat: "Jl. Merdeka No. 123, Jakarta",
  alamatLengkap:
    "Jl. Merdeka No. 123, Kelurahan Sukamaju, Jakarta Timur, DKI Jakarta 13520",

  // Tempel URL embed Google Maps:
  // Buka Google Maps -> lokasi warung -> Share -> Embed a map -> salin yang
  // berawalan "src="
  mapsEmbed:
    "https://www.google.com/maps?q=Merdeka+Street+Jakarta&output=embed",

  // Link Google Maps untuk tombol "Petunjuk Arah" (membuka aplikasi peta).
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=Merdeka+Street+Jakarta",

  /* ----------------------------------------------------------------------
     JAM BUKA  ->  website otomatis deteksi status BUKA / TUTUP
     Isi dengan format "HH:MM-HH:MM" (24 jam).
     "0" = Minggu, "6" = Sabtu.
     ---------------------------------------------------------------------- */
  jamBuka: {
    senin_jumat: "08:00-21:00",
    sabtu_minggu: "09:00-22:00",
    // Opsional: daftar hari tutup. Contoh: [0] = tutup setiap Minggu.
    // Isi [] atau hapus baris ini kalau buka semua hari.
    hariTutup: [],
  },

  /* ----------------------------------------------------------------------
     SOSIAL MEDIA  (boleh dikosongkan dengan "")
     ---------------------------------------------------------------------- */
  sosmed: {
    instagram: "https://instagram.com/warungbusari",
    tiktok: "https://tiktok.com/@warungbusari",
    facebook: "https://facebook.com/warungbusari",
  },

  /* ----------------------------------------------------------------------
     PEMBAYARAN  (opsional)
     Kalau tidak ada rekening DAN QRIS kosong, blok ini otomatis
     disembunyikan dari keranjang.
     Isi "qris" dengan "images/qris.png" setelah upload.
     ---------------------------------------------------------------------- */
  rekening: {
    bank: "BCA",
    nomor: "1234567890",
    atasNama: "Sari Wijaya",
    qris: "",
    catatan: "Transfer sebelum konfirmasi ya kak, biar pesan tidak menunggu terlalu lama.",
  },

  /* ----------------------------------------------------------------------
     PENGATURAN PENGIRIMAN  (opsional)
     gratisDiatas: 0 berarti tidak ada aturan gratis ongkir.
     minOrder: 0 berarti tidak ada minimal order.
     ---------------------------------------------------------------------- */
  ongkir: {
    aktif: true,
    jenis: "Flat",
    nominal: 5000,
    gratisDiatas: 50000,
    area: "sekitar 5 km",
    catatan: "Minimal order Rp 10.000",
    minOrder: 10000,
  },

  /* ----------------------------------------------------------------------
     TESTIMONI PELANGGAN
     rating: 1 sampai 5, boleh desimal (contoh 4.5)
     ---------------------------------------------------------------------- */
  testimoni: [
    {
      nama: "Budi Santoso",
      pesan:
        "Nasi gorengnya juara! Pedasnya pas, porsinya besar. Sudah langganan tiap minggu.",
      rating: 5,
    },
    {
      nama: "Ani Rahmawati",
      pesan:
        "Cepat, murah, enak. Sate ayamnya juicy. Sangat recommended buat malam santai.",
      rating: 5,
    },
    {
      nama: "Dewi Lestari",
      pesan:
        "Kopi susu gula arennya creamy banget. Suasana warungnya adem dan bersih.",
      rating: 4.5,
    },
    {
      nama: "Rizky Pratama",
      pesan:
        "Pesan delivery jam 10 malam tetap panas. Suka banget karena bisa request level pedas.",
      rating: 5,
    },
    {
      nama: "Maya Sari",
      pesan:
        "Paket hematnya paling worth it. Nasi, ayam, sayur, semua lengkap dengan harga murah.",
      rating: 4.5,
    },
  ],

  /* ----------------------------------------------------------------------
     PERTANYAAN YANG SERING MUNCUL
     ---------------------------------------------------------------------- */
  faq: [
    {
      tanya: "Bisa delivery?",
      jawab:
        "Bisa. Area sekitar 5 km, ongkir flat Rp 5.000 dan gratis ongkir untuk belanja di atas Rp 50.000.",
    },
    {
      tanya: "Jam buka warung apa saja?",
      jawab:
        "Senin-Jumat 08.00-21.00 dan Sabtu-Minggu 09.00-22.00. Status buka/tutup muncul otomatis di bagian atas halaman ini.",
    },
    {
      tanya: "Apakah makanannya halal?",
      jawab:
        "Ya. Semua ayam dan daging kami beli dari poultry bersertifikat halal. Tidak ada daging babi di seluruh menu kami.",
    },
    {
      tanya: "Bisa pesan banyak sekaligus (catering)?",
      jawab:
        "Bisa. Untuk pesanan di atas 50 porsi, hubungi WhatsApp kami minimal H-1 supaya bahannya selalu siap.",
    },
    {
      tanya: "Bisa request level pedas dan catatan khusus?",
      jawab:
        'Bisa. Di halaman pemesanan tersedia pilihan level pedas (Level 0 sampai Level 3), pilihan topping, dan kolom catatan khusus, misalnya "tanpa bawang" atau "ekstra sambal".',
    },
    {
      tanya: "Metode pembayaran apa saja yang diterima?",
      jawab:
        "Tunai, transfer bank, dan QRIS. Pembayaran dilakukan setelah konfirmasi pesanan dari kami melalui WhatsApp.",
    },
  ],

  /* ----------------------------------------------------------------------
     GALERI SUASANA WARUNG
     Ganti dengan foto asli warungmu: "images/galeri/1.jpg" dan seterusnya.
     ---------------------------------------------------------------------- */
  galeri: [
    {
      foto: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
      judul: "Area indoor",
    },
    {
      foto: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      judul: "Meja tamu",
    },
    {
      foto: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80",
      judul: "Dapur terbuka",
    },
    {
      foto: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
      judul: "Sudut duduk",
    },
    {
      foto: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=800&q=80",
      judul: "Meja kayu",
    },
    {
      foto: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=800&q=80",
      judul: "Suasana hangat",
    },
    {
      foto: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
      judul: "Tempat duduk bersama",
    },
    {
      foto: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      judul: "Menu signature",
    },
  ],

  /* ----------------------------------------------------------------------
     KATALOG MENU
     ----------------------------------------------------------------------
     ATURAN PENTING:
     - id        : nomor unik, WAJIB berbeda tiap item. Jangan dipakai ulang.
     - kategori  : bebas, tapi pakai nama yang sama secara konsisten.
                  Kategori baru otomatis muncul sebagai tab filter.
     - harga     : ANGKA SAJA (tanpa "Rp", tanpa titik pemisah). Contoh: 25000
     - foto      : URL "https://..." atau path lokal "images/menu/xxx.jpg"
     - badge     : "Best Seller" | "Baru" | "Promo" | null  (boleh null)
     - tersedia  : false = tampil sebagai "HABIS" dan tidak bisa dipesan
     - varian    : bagian opsional. Bisa berisi:
                      * levelPedas : array pilihan TUNGGAL (radio)
                      * ukuran     : array pilihan TUNGGAL (radio)
                      * topping    : array { nama, harga }  (boleh pilih >1)
                      * opsi       : array { nama, harga }  (boleh pilih >1)
                   Kalau kosong semua (varian: {}) tidak tampil pilihan apa pun.
     ---------------------------------------------------------------------- */
  menu: [
    /* ======================= MAKANAN ======================= */
    {
      id: 1,
      kategori: "Makanan",
      nama: "Nasi Goreng Spesial",
      harga: 25000,
      foto: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
      deskripsi:
        "Nasi goreng dengan telur, ayam suwir, dan kerupuk. Digoreng segar di dapuri.",
      badge: "Best Seller",
      tersedia: true,
      varian: {
        levelPedas: ["Level 0", "Level 1", "Level 2", "Level 3"],
        topping: [
          { nama: "Telur Ceplok", harga: 5000 },
          { nama: "Ayam Tambahan", harga: 8000 },
          { nama: "Kerupuk Udang", harga: 4000 },
        ],
      },
    },
    {
      id: 2,
      kategori: "Makanan",
      nama: "Mie Goreng Jawa",
      harga: 22000,
      foto: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
      deskripsi:
        "Mie goreng khas Jawa dengan sayur, ayam, dan telur. Bumbu manis dan gurih.",
      badge: null,
      tersedia: true,
      varian: {
        levelPedas: ["Level 0", "Level 1", "Level 2"],
        ukuran: ["Regular", "Jumbo"],
      },
    },
    {
      id: 3,
      kategori: "Makanan",
      nama: "Ayam Bakar Madu",
      harga: 28000,
      foto: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80",
      deskripsi:
        "Ayam bakar dengan olesan madu, dibakar arang. Dilayani dengan lalapan dan sambal.",
      badge: "Best Seller",
      tersedia: true,
      varian: {
        topping: [
          { nama: "Nasi Putih", harga: 5000 },
          { nama: "Lalapan Ekstra", harga: 6000 },
        ],
      },
    },
    {
      id: 4,
      kategori: "Makanan",
      nama: "Sate Ayam 10 Tusuk",
      harga: 30000,
      foto: "https://images.unsplash.com/photo-1529563021893-cc83c992d75d?auto=format&fit=crop&w=800&q=80",
      deskripsi:
        "Sate ayam khas Jawa dengan bumbu kacang atau kecap. Bakar langsung di atas arang.",
      badge: null,
      tersedia: true,
      varian: {
        opsi: [
          { nama: "Bumbu Kacang", harga: 0 },
          { nama: "Bumbu Kecap", harga: 0 },
        ],
        levelPedas: ["Level 0", "Level 1", "Level 2", "Level 3"],
      },
    },
    {
      id: 5,
      kategori: "Makanan",
      nama: "Rendang Daging",
      harga: 45000,
      foto: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
      deskripsi:
        "Rendang sapi premium dengan santan dan rempah, dimasak lambat 5 jam.",
      badge: "Baru",
      tersedia: true,
      varian: {
        topping: [
          { nama: "Nasi Putih", harga: 5000 },
          { nama: "Nasi Goreng", harga: 10000 },
        ],
      },
    },
    {
      id: 6,
      kategori: "Makanan",
      nama: "Ayam Goreng Crispy",
      harga: 26000,
      foto: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Ayam goreng dengan lapisan renyah, dagingnya tetap juicy di dalam.",
      badge: null,
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Sambal Bawang", "Extra Pedas"],
        ukuran: ["1 Potong", "2 Potong", "1/2 Ekor"],
      },
    },
    {
      id: 7,
      kategori: "Makanan",
      nama: "Soto Ayam Lamongan",
      harga: 24000,
      foto: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
      deskripsi:
        "Soto ayam kuah bening gurih dengan koya, seledri, dan CDL. Hangat di badan.",
      badge: null,
      tersedia: true,
      varian: {
        ukuran: ["Regular", "Jumbo"],
        topping: [
          { nama: "Perbesar Kuah", harga: 0 },
          { nama: "Ayam Ekstra", harga: 8000 },
        ],
      },
    },

    /* ======================= MINUMAN ======================= */
    {
      id: 8,
      kategori: "Minuman",
      nama: "Es Teh Manis",
      harga: 5000,
      foto: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Teh manis dingin segar. Pelengkap wajib setiap makan.",
      badge: null,
      tersedia: true,
      varian: {
        ukuran: ["Regular", "Jumbo"],
        levelPedas: ["Gula Normal", "Gula Sedikit", "Nol Gula"],
      },
    },
    {
      id: 9,
      kategori: "Minuman",
      nama: "Es Jeruk Peras",
      harga: 12000,
      foto: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Jeruk peras asli diperas langsung, dingin dan kaya vitamin C.",
      badge: "Baru",
      tersedia: true,
      varian: {
        ukuran: ["Regular", "Jumbo"],
      },
    },
    {
      id: 10,
      kategori: "Minuman",
      nama: "Kopi Susu Gula Aren",
      harga: 18000,
      foto: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
      deskripsi:
        "Kopi susu dengan pemanis gula aren homemade. Kental dan creamy.",
      badge: "Best Seller",
      tersedia: true,
      varian: {
        ukuran: ["Hot", "Iced"],
        levelPedas: ["Gula Aren", "Less Sugar", "Oat Milk"],
      },
    },
    {
      id: 11,
      kategori: "Minuman",
      nama: "Jus Alpukat",
      harga: 20000,
      foto: "https://images.unsplash.com/photo-1622484212850-eb596d769edc?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Jus alpukat kental dengan susu dan cokelat. Cocok saat siang bolong.",
      badge: null,
      tersedia: true,
      varian: {
        ukuran: ["Regular", "Jumbo"],
      },
    },
    {
      id: 12,
      kategori: "Minuman",
      nama: "Es Kelapa Muda",
      harga: 15000,
      foto: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Kelapa muda langsung dari pohon, es kelapa muda, larutan gula merah.",
      badge: null,
      tersedia: true,
      varian: {
        ukuran: ["1 buah", "1 buah + Nata de Coco"],
      },
    },

    /* ======================= SNACK ======================= */
    {
      id: 13,
      kategori: "Snack",
      nama: "Pisang Goreng Cokelat",
      harga: 14000,
      foto: "https://images.unsplash.com/photo-1587241321921-91a834d6d191?auto=format&fit=crop&w=800&q=80",
      deskripsi:
        "Pisang goreng dengan olesan cokelat dan keju. Manis legit favorit anak-anak.",
      badge: null,
      tersedia: true,
      varian: {
        topping: [
          { nama: "Extra Cokelat", harga: 3000 },
          { nama: "Keju Susu", harga: 4000 },
        ],
      },
    },
    {
      id: 14,
      kategori: "Snack",
      nama: "Tahu Crispy",
      harga: 12000,
      foto: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
      deskripsi:
        "Tahu goreng crispy dengan saus Original dan Sambal Bawang. Renyah di luar.",
      badge: null,
      tersedia: true,
      varian: {
        ukuran: ["5 pcs", "10 pcs"],
      },
    },
    {
      id: 15,
      kategori: "Snack",
      nama: "Kerupuk Udang",
      harga: 8000,
      foto: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Kerupuk udang besar yang renyah, cocok untuk lauk tambahan.",
      badge: null,
      tersedia: true,
      varian: {
        ukuran: ["5 pcs", "10 pcs"],
      },
    },
    {
      id: 16,
      kategori: "Snack",
      nama: "Rujak Lengkap",
      harga: 16000,
      foto: "https://images.unsplash.com/photo-1580554530778-ca36943938b2?auto=format&fit=crop&w=800&q=80",
      deskripsi:
        "Rujak Jakarta: lontong, taoge, kolom, wortel, dan kemangi. Bumbu kacang gurih.",
      badge: null,
      tersedia: true,
      varian: {
        levelPedas: ["Level 0", "Level 1", "Level 2"],
      },
    },

    /* ======================= PAKET ======================= */
    {
      id: 17,
      kategori: "Paket",
      nama: "Paket Kombo 1",
      harga: 28000,
      foto: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
      deskripsi:
        "Nasi Goreng Spesial + Es Teh Manis. Hemat Rp 2.000 dibanding pesan terpisah.",
      badge: "Promo",
      tersedia: true,
      varian: {
        levelPedas: ["Level 0", "Level 1", "Level 2", "Level 3"],
      },
    },
    {
      id: 18,
      kategori: "Paket",
      nama: "Paket Hemat 2",
      harga: 38000,
      foto: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80",
      deskripsi:
        "Nasi Putih + Ayam Goreng Crispy + Sayur Asem + Air Mineral. Lengkap untuk makan siang.",
      badge: "Best Seller",
      tersedia: true,
      varian: {
        ukuran: ["1 Porsi", "2 Porsi"],
      },
    },

    /* ======================= PROMO ======================= */
    {
      id: 19,
      kategori: "Promo",
      nama: "Nasi Goreng Promo Lunch",
      harga: 20000,
      foto: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80",
      deskripsi:
        "Menu yang sama dengan Best Seller, khusus jam makan siang. Potongan 20%!",
      badge: "Promo",
      tersedia: true,
      varian: {
        levelPedas: ["Level 0", "Level 1", "Level 2"],
      },
    },
    {
      id: 20,
      kategori: "Promo",
      nama: "Paket Hemat Keluarga (4 Porsi)",
      harga: 95000,
      foto: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=800&q=80",
      deskripsi:
        "4x Nasi Goreng + 4x Ayam Bakar + 4x Es Teh. Cocok untuk makan malam keluarga.",
      badge: "Promo",
      // Contoh item HABIS: tampil badge "HABIS" dan tombolnya dinonaktifkan.
      tersedia: false,
      varian: {
        levelPedas: ["Level 0", "Level 1", "Level 2", "Level 3"],
      },
    },
  ],
};

/* Pasang ke window supaya bisa dibaca script.js.
   (Tidak perlu diubah / dihapus.) */
if (typeof window !== "undefined") window.config = config;
