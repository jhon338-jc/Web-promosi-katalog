/* ==========================================================================
   CONFIG.JS - SATU-SATUNYA FILE YANG PERLU DIEDIT PEMILIK WARUNG
   ==========================================================================

   >> BACA DULU SEBELUM EDIT <<

   File ini berisi SELURUH isi website: nama, alamat, jam buka, menu, harga,
   foto, sampai warna aksen semuanya ada di sini.

   CARA PAKAI
   1. Ganti nilai di dalam tanda kutip "..." dengan data warung Anda.
   2. Nomor WhatsApp: format "628xxx", tanpa "+", tanpa spasi.
   3. Harga: angka saja. Tulis 15000, bukan 15.000.
   4. Setelah selesai, klik "Unduh config.js" di Panel Pemilik, lalu upload
      file itu ke hosting supaya perubahannya permanen.

   ATURAN WAJIB
   - whatsapp  : "628xxx" (kode negara + nomor). Benar: "6281234567890".
                 Salah: "+62 812-3456-7890".
   - jamBuka   : format 24 jam "HH:MM-HH:MM". Untuk buka nonstop, set
                 buka24Jam: true (lihat bagian jamBuka).
   - foto      : URL "https://..." atau path lokal "images/menu/x.jpg".
                 Path relatif ikut folder website, jadi aman di hosting root
                 maupun sub-folder GitHub Pages.
   - harga: 0  : harga belum dipublikasikan. Item tampil dengan label
                 "Tanya Harga" dan tidak bisa masuk keranjang.
   - Kalau file foto tidak ditemukan, website otomatis pakai gambar cadangan
     bertema kuning, jadi tidak akan pernah tampil kotak kosong.
   ========================================================================== */

const config = {
  /* ----------------------------------------------------------------------
     IDENTITAS WARUNG
     ---------------------------------------------------------------------- */
  namaWarung: "WARKAP (Warkop by diatap) CIANJUR",
  namaPendek: "WARKAP Cianjur",
  kategoriBisnis: "Kedai Kopi",
  tagline: "Warkop by diatap - view sawah, buka 24 jam",
  deskripsiSingkat:
    "Kedai kopi 24 jam di Nagrak, Cianjur. Area outdoor dengan pemandangan persawahan, suasana sejuk dan tenang, harga warung Rp 25.000-50.000 per orang. Cocok buat nongkrong, belajar, kerja dengan laptop, sampai live music.",

  /* Badge di header: rating, jumlah ulasan, rentang harga.
     Kosongkan field ini kalau tidak ingin menampilkannya. */
  rating: 4.5,
  jumlahUlasan: 556,
  rentangHarga: "Rp25.000 - Rp50.000 / orang",

  /* Warna aksen: warkap (kuning-amber) | teal | terracotta | ungu | forests */
  temaWarna: "warkap",

  // Logo: foto bulat. Ganti ke "images/logo.png" setelah upload.
  logo:
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=200&h=200&q=80",

  // Foto banner hero. Rasio ideal: lebar (1600 x 900).
  banner:
    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1600&h=900&q=80",

  /* ----------------------------------------------------------------------
     KONTAK - GANTI NOMOR WHATSAPP DAN TELEPON (masih placeholder)
     ---------------------------------------------------------------------- */
  whatsapp: "6281234567890",
  telepon: "081234567890",

  alamat: "Jl. Gatot Mangkupraja No.1, Nagrak, Cianjur",
  alamatLengkap:
    "Jl. Gatot Mangkupraja No.1, Nagrak, Kec. Cianjur, Kabupaten Cianjur, Jawa Barat 43215",
  plusCode: "54F6+RV Nagrak, Kabupaten Cianjur, Jawa Barat",

  // Cara dapat URL embed: Google Maps -> lokasi -> Share -> Embed a map ->
  // salin yang berawalan "src=".
  mapsEmbed:
    "https://www.google.com/maps?q=WARKAP+Warkop+by+diatap+Cianjur&output=embed",

  // Tombol "Petunjuk Arah" (membuka aplikasi peta di HP).
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=WARKAP+Warkop+by+diatap+Jl.+Gatot+Mangkupraja+Cianjur",

  /* ----------------------------------------------------------------------
     JAM BUKA - website otomatis deteksi status BUKA / TUTUP
     WARKAP buka nonstop, jadi buka24Jam: true.
     ---------------------------------------------------------------------- */
  jamBuka: {
    buka24Jam: true,
    label24Jam: "Buka 24 jam, setiap hari",
    // dipakai hanya kalau buka24Jam: false
    senin_jumat: "08:00-21:00",
    sabtu_minggu: "09:00-22:00",
    // Daftar hari tutup. Contoh: [0] = tutup setiap Minggu.
    hariTutup: [],
  },

  /* ----------------------------------------------------------------------
     FASILITAS - tampil sebagai chip di bawah hero. Boleh dikosongkan [].
     ---------------------------------------------------------------------- */
  fasilitas: [
    "Dine-in",
    "Takeaway",
    "Outdoor / Open-air",
    "Table service",
    "Toilet",
    "Parkir gratis",
    "Area parkir luas",
    "Bayar mobile / NFC",
    "Cocok anak-anak",
    "Cocok rombongan",
    "Cocok pelajar",
    "Cocok wisatawan",
    "Bisa kerja / laptop",
    "Live music",
    "View sawah",
    "Suasana sejuk",
  ],

  /* ----------------------------------------------------------------------
     SOSIAL MEDIA - boleh dikosongkan dengan ""
     ---------------------------------------------------------------------- */
  sosmed: {
    instagram: "https://www.instagram.com/warkap.24jam/",
    tiktok: "",
    facebook: "",
  },

  /* ----------------------------------------------------------------------
     PEMBAYARAN (opsional)
     Kalau rekening kosong DAN QRIS kosong, blok ini disembunyikan otomatis.
     Isi "qris" dengan "images/qris.png" setelah upload.
     ---------------------------------------------------------------------- */
  rekening: {
    bank: "",
    nomor: "",
    atasNama: "",
    qris: "",
    catatan: "",
  },

  /* ----------------------------------------------------------------------
     PENGIRIMAN (opsional)
     gratisDiatas: 0 = tidak ada aturan gratis ongkir.
     minOrder: 0 = tidak ada minimal order.
     ---------------------------------------------------------------------- */
  ongkir: {
    aktif: false,
    jenis: "Flat",
    nominal: 0,
    gratisDiatas: 0,
    area: "",
    catatan: "",
    minOrder: 0,
  },

  /* ----------------------------------------------------------------------
     TESTIMONI - rating 1 sampai 5, boleh desimal (contoh 4.5)

     PENTING: ini RINGKASAN ULASAN PUBLIK, bukan kutipan asli. Karena data
     kutipan verbatim belum tersedia, field "nama" sengaja diisi label
     ringkasan supaya tidak terlihat seperti nama pelanggan sungguhan.
     Keluhan juga ditampilkan supaya tidak cuma pujian.

     Ganti dengan kutipan asli + nama pelanggan kalau sudah ada.
     ---------------------------------------------------------------------- */
  testimoni: [
    {
      nama: "Ringkasan ulasan: suasana",
      pesan:
        "View sawah dan area outdoor jadi yang paling sering disebut menonjol. Suasana adem dan tenang, enak buat kerja atau tugas.",
      rating: 5,
    },
    {
      nama: "Ringkasan ulasan: lokasi & parkir",
      pesan:
        "Lapangan luas, parkir gratis, dan lokasi mudah dijangkau. Cocok buat rombongan yang ngobrol lama karena nggak terlalu padat.",
      rating: 4,
    },
    {
      nama: "Ringkasan ulasan: buat nugas",
      pesan:
        "Sering dipakai buat membawa laptop dan mengerjakan tugas. Area outdoor dan kursi yang lega jadi nilai plus.",
      rating: 4,
    },
    {
      nama: "Ringkasan ulasan: harga",
      pesan:
        "Harga disebut terjangkau untuk Cianjur. Porsi Chicken Bowl Rp 18.000 disebut cukup besar.",
      rating: 4,
    },
    {
      nama: "Ringkasan ulasan: live music",
      pesan:
        "Live music lokal jadi nilai tambah buat nongkrong sore. Keluhan yang muncul: saat ramai, antrean makanan kadang agak lama.",
      rating: 4,
    },
    {
      nama: "Ringkasan ulasan: rasa",
      pesan:
        "Menu dinilai luas untuk harganya. Keluhan yang muncul: rasa mie kadang berubah-ubah, sebagian pelanggan merasa ada yang kurang gurih atau terlalu berminyak.",
      rating: 3,
    },
  ],

  /* ----------------------------------------------------------------------
     FAQ
     ---------------------------------------------------------------------- */
  faq: [
    {
      tanya: "Apakah buka 24 jam?",
      jawab:
        "Ya, WARKAP buka 24 jam setiap hari termasuk hari libur. Status buka selalu hijau di bagian atas halaman ini. Kalau ada hari tertentu yang tutup, statusnya berubah otomatis.",
    },
    {
      tanya: "Harga untuk satu orang berapa?",
      jawab:
        "Secara keseluruhan rentangnya Rp 25.000 sampai Rp 50.000 per orang. Makanan dan snack mulai dari Rp 5.000 (nasi, telur, kornet), roti bakar Rp 14.000-17.000, Chicken Bowl Rp 18.000-20.000. Daftar lengkap ada di katalog.",
    },
    {
      tanya: "Suasana WARKAP seperti apa?",
      jawab:
        "Area outdoor dan open-air dengan pemandangan persawahan, terasa sejuk dan teduh. Cocok buat nongkrong, belajar, bekerja memakai laptop, sampai ada live music di sore hari.",
    },
    {
      tanya: "Fasilitas apa saja yang tersedia?",
      jawab:
        "Dine-in, takeaway, table service, toilet, parkir gratis di jalan dengan area parkir luas, pembayaran mobile atau NFC, dan tempatnya aman untuk anak-anak maupun rombongan.",
    },
    {
      tanya: "Bisa pesan delivery atau takeaway?",
      jawab:
        "Ambil di tempat (takeaway) dan dine-in selalu bisa karena tempatnya buka nonstop. Untuk delivery, tanya langsung ke kasir lewat WhatsApp karena area pengantar belum kami tetapkan di website ini.",
    },
    {
      tanya: "Lokasinya mudah ditemukan?",
      jawab:
        "Sangat strategis, di Cianjur. Plus Code-nya 54F6+RV Nagrak, Kabupaten Cianjur, Jawa Barat. Klik tombol Petunjuk Arah di halaman ini untuk langsung membuka peta.",
    },
    {
      tanya: "Kenapa ada menu yang tulisannya Tanya Harga?",
      jawab:
        "Beberapa minuman seperti Kopi Kapal Api, Kopi Liong, Good Day, dan Nutrisari belum tercantum harga resmi di sumber. Kami tidak asal menebak. Silakan tanya langsung ke kasir atau lewat WhatsApp, nanti dikasih tahu harga terbaru.",
    },
  ],

  /* ----------------------------------------------------------------------
     GALERI - ganti dengan foto asli: "images/galeri/1.jpg" dan seterusnya.
     ---------------------------------------------------------------------- */
  galeri: [
    {
      foto:
        "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80",
      judul: "View sawah dari area outdoor",
    },
    {
      foto:
        "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=800&q=80",
      judul: "Sudut duduk warkop",
    },
    {
      foto:
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7c0b?auto=format&fit=crop&w=800&q=80",
      judul: "Meja buat yang kerja",
    },
    {
      foto:
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
      judul: "Suasana sore yang tenang",
    },
    {
      foto:
        "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80",
      judul: "Tempat duduk berdua",
    },
    {
      foto:
        "https://images.unsplash.com/photo-1559305616-3f99cd43e353?auto=format&fit=crop&w=800&q=80",
      judul: "Suasana live music",
    },
    {
      foto:
        "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80",
      judul: "Area outdoor terbuka",
    },
    {
      foto:
        "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=800&q=80",
      judul: "Tempat nongkrong sore",
    },
  ],

  /* ----------------------------------------------------------------------
     KATALOG MENU - WARKAP (Warkop by diatap) Cianjur
     ----------------------------------------------------------------------
     ATURAN PENTING:
     - id       : nomor unik, WAJIB berbeda tiap item.
     - kategori : pakai nama yang sama secara konsisten. Kategori baru
                  otomatis muncul sebagai tab filter.
     - harga    : ANGKA SAJA tanpa "Rp" dan tanpa titik. Contoh: 15000
     - foto     : URL "https://..." atau path lokal "images/menu/x.jpg"
     - badge    : "Best Seller" | "Baru" | "Promo" | null (boleh null)
     - tersedia : false = tampil sebagai "HABIS" dan tidak bisa dipesan
     - varian   : opsional, bisa berisi
                     levelPedas : array (radio, pilih 1)
                     topping    : array { nama, harga } (boleh pilih >1)
                     saos/suhu/gula : array (radio, pilih 1)
                  Kalau kosong ({}) tidak tampil pilihan apa pun.
     - harga 0  : harga belum dipublikasikan. Tampil "Tanya Harga" dan
                  tidak bisa dimasukkan ke keranjang.
     ---------------------------------------------------------------------- */
  menu: [
    /* ===================== SNACK ===================== */
    {
      id: 1,
      kategori: "Snack",
      nama: "Omelette",
      harga: 11000,
      foto:
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Telur dadar isi keju, dipanggang. Cocok buat nemanin ngopi.",
      badge: null,
      tersedia: true,
      varian: {
        topping: [
          { nama: "Extra telur", harga: 3000 },
          { nama: "Keju ekstra", harga: 3000 },
          { nama: "Sosis", harga: 4000 },
        ],
      },
    },
    {
      id: 2,
      kategori: "Snack",
      nama: "Tahu Cabe Garam",
      harga: 13000,
      foto:
        "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Tahu goreng dengan cabe garam dan daun kari. Pedasnya nendang.",
      badge: "Best Seller",
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Kental"],
      },
    },
    {
      id: 3,
      kategori: "Snack",
      nama: "Kentang Chips",
      harga: 13000,
      foto:
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Kentang goreng tipis dengan sedikit garam. Renyahnya nggak pelit.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 4,
      kategori: "Snack",
      nama: "Cireng",
      harga: 14000,
      foto:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Cireng kriuk renyah di luar, kenyal di dalam. Enak buat sharing.",
      badge: null,
      tersedia: true,
      varian: {
        levelPedas: ["Original", "Rujak", "Ayam Bawang"],
      },
    },
    {
      id: 5,
      kategori: "Snack",
      nama: "Singkong Kriuk",
      harga: 14000,
      foto:
        "https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Singkong goreng kriuk yang tipis dan garing. Cocok buat sore santai.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 6,
      kategori: "Snack",
      nama: "Kentang Goreng",
      harga: 14000,
      foto:
        "https://images.unsplash.com/photo-1573080496988-b0c1a2d0d3a8?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Kentang goreng baton dengan mayo atau keju cair.",
      badge: null,
      tersedia: true,
      varian: {
        topping: [
          { nama: "Extra kentang", harga: 5000 },
          { nama: "Keju sauce", harga: 2000 },
        ],
      },
    },
    {
      id: 7,
      kategori: "Snack",
      nama: "Onion Ring",
      harga: 16000,
      foto:
        "https://images.unsplash.com/photo-1639024471283-03518883c2b8?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Cincin bawang goreng bertabur garam, renyah dan gurih.",
      badge: null,
      tersedia: true,
      varian: {
        saos: ["Original", "BBQ", "Balado"],
      },
    },
    {
      id: 8,
      kategori: "Snack",
      nama: "Kids Platter",
      harga: 16000,
      foto:
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Aneka snack ukuran kecil buat anak: kentang goreng, chicken, dan minuman.",
      badge: "Cocok Anak",
      tersedia: true,
      varian: {},
    },
    {
      id: 9,
      kategori: "Snack",
      nama: "Platter Warkap",
      harga: 16000,
      foto:
        "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Paket campur snack favorit: cireng, kentang, tahu, dan dimsum.",
      badge: "Paket Hemat",
      tersedia: true,
      varian: {},
    },

    /* ===================== DESSERT ===================== */
    {
      id: 10,
      kategori: "Dessert",
      nama: "Pisang Goreng Warkap",
      harga: 13000,
      foto:
        "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Pisang goreng dengan lapisan tipis, masih hangat dan legit.",
      badge: "Best Seller",
      tersedia: true,
      varian: {
        topping: [
          { nama: "Es krim", harga: 4000 },
          { nama: "Susu kental manis", harga: 2000 },
        ],
      },
    },
    {
      id: 11,
      kategori: "Dessert",
      nama: "Pisang Comot",
      harga: 14000,
      foto:
        "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Pisang goreng comot berlapis gula melimpah dan wangi pandan.",
      badge: null,
      tersedia: true,
      varian: {
        topping: [
          { nama: "Es krim", harga: 4000 },
          { nama: "Kental manis", harga: 2000 },
        ],
      },
    },
    {
      id: 12,
      kategori: "Dessert",
      nama: "Roti Bakar Coklat",
      harga: 15000,
      foto:
        "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Roti bakar panggang dengan isian coklat yang melimpah.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 13,
      kategori: "Dessert",
      nama: "Roti Bakar Keju",
      harga: 15000,
      foto:
        "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Roti bakar dengan keju melimpah yang legit.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 14,
      kategori: "Dessert",
      nama: "Roti Bakar Srikaya",
      harga: 15000,
      foto:
        "https://images.unsplash.com/photo-1619535860434-cf9b902a0f14?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Roti bakar isian srikaya yang manis dengan tekstur lembut.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 15,
      kategori: "Dessert",
      nama: "Roti Bakar Matcha",
      harga: 16000,
      foto:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Roti bakar isian matcha yang sedikit pahit dan wangi.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 16,
      kategori: "Dessert",
      nama: "Roti Bakar Tiramisu",
      harga: 16000,
      foto:
        "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Roti bakar tiramisu dengan susu kental dan cokelat.",
      badge: null,
      tersedia: true,
      varian: {},
    },

    /* ===================== KETAN ===================== */
    {
      id: 17,
      kategori: "Ketan",
      nama: "Ketan Hitam Special",
      harga: 16000,
      foto:
        "https://images.unsplash.com/photo-1601303516534-bf0b1eb97f3f?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Ketan hitam kelapa, kental manis, dan wangi pandan.",
      badge: "Komodo",
      tersedia: true,
      varian: {},
    },
    {
      id: 18,
      kategori: "Ketan",
      nama: "Ketan Susu Keju",
      harga: 13000,
      foto:
        "https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Ketan goreng manis dengan taburan keju yang melimpah.",
      badge: null,
      tersedia: true,
      varian: {},
    },

    /* ===================== SNACK SERIES ===================== */
    {
      id: 19,
      kategori: "Snack Series",
      nama: "Potato Chip",
      harga: 8000,
      foto:
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Potato chip tipis dan renyah. Porsi paling ramah diTipsdompet.",
      badge: "Paling Murah",
      tersedia: true,
      varian: {},
    },
    {
      id: 20,
      kategori: "Snack Series",
      nama: "Tahu Cabe Garam",
      harga: 10000,
      foto:
        "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Tahu goreng cabe garam dengan porsi hemat buat ngemil.",
      badge: null,
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Kental"],
      },
    },
    {
      id: 21,
      kategori: "Snack Series",
      nama: "Kentang Goreng",
      harga: 10000,
      foto:
        "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Kentang goreng porsi ekonomis, enak buat ngemil sore.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 22,
      kategori: "Snack Series",
      nama: "Bakpao Ayam",
      harga: 12000,
      foto:
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Bakpao panggang isi ayam, dibungkus daun sawit.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 23,
      kategori: "Snack Series",
      nama: "Onion Ring",
      harga: 12000,
      foto:
        "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Onion ring renyah, versi lebih ringan dari yang ada di menu Snack.",
      badge: null,
      tersedia: true,
      varian: {
        saos: ["Original", "BBQ", "Balado"],
      },
    },
    {
      id: 24,
      kategori: "Snack Series",
      nama: "Warkap Platter",
      harga: 15000,
      foto:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Plateran lengkap buatarmac bareng teman.",
      badge: "Paket Hemat",
      tersedia: true,
      varian: {},
    },
    {
      id: 25,
      kategori: "Snack Series",
      nama: "Dimsum",
      harga: 15000,
      foto:
        "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Dimsum kukus puan yang hangat dan ringan.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 26,
      kategori: "Snack Series",
      nama: "Singkong Goreng",
      harga: 15000,
      foto:
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Singkong goreng dengan potongan lebih besar.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 27,
      kategori: "Snack Series",
      nama: "Platter Combo",
      harga: 20000,
      foto:
        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Paket kombinasi beberapa snack. Paling worth it buat rame-rame.",
      badge: "Best Value",
      tersedia: true,
      varian: {},
    },
    {
      id: 28,
      kategori: "Snack Series",
      nama: "Cireng Rujak",
      harga: 20000,
      foto:
        "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Cireng rujak asam pedas dengan saus rujak khas.",
      badge: null,
      tersedia: true,
      varian: {
        levelPedas: ["Level 1", "Level 2", "Level 3"],
      },
    },

    /* ===================== WOK SERIES ===================== */
    {
      id: 29,
      kategori: "Wok Series",
      nama: "Nasi Telur Pontianak",
      harga: 10000,
      foto:
        "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Nasi goreng telur khas Pontianak yang gurih.",
      badge: "Komodo",
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Kental"],
      },
    },
    {
      id: 30,
      kategori: "Wok Series",
      nama: "Nasi Gila",
      harga: 12000,
      foto:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Nasi goreng dengan level pedas tinggi. Namanya bukan candaan.",
      badge: "Pedas",
      tersedia: true,
      varian: {
        levelPedas: ["Level 1", "Level 2", "Level 3", "Level 4"],
      },
    },
    {
      id: 31,
      kategori: "Wok Series",
      nama: "Nasi Goreng Warkap",
      harga: 12000,
      foto:
        "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Nasi goreng andalan WARKAP dengan racikan bumbu khas.",
      badge: "Best Seller",
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Kental"],
        topping: [
          { nama: "Telur", harga: 3000 },
          { nama: "Kornet", harga: 5000 },
          { nama: "Ayam suwir", harga: 6000 },
        ],
      },
    },
    {
      id: 32,
      kategori: "Wok Series",
      nama: "Mie Bangladesh",
      harga: 12000,
      foto:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Mie goreng dengan aroma smoky yang gurih dan sedikit pedas.",
      badge: null,
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Kental"],
      },
    },
    {
      id: 33,
      kategori: "Wok Series",
      nama: "Mie Nyemek",
      harga: 12000,
      foto:
        "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Mie nyemek khas. Namanya bukan soal harga, porsinya tetap normal.",
      badge: null,
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Kental"],
      },
    },
    {
      id: 34,
      kategori: "Wok Series",
      nama: "Mie Goreng Warkap",
      harga: 12000,
      foto:
        "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Mie goreng andalan WARKAP dengan saus khas yang gurih.",
      badge: "Best Seller",
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Kental"],
        topping: [
          { nama: "Telur", harga: 3000 },
          { nama: "Kornet", harga: 5000 },
        ],
      },
    },
    {
      id: 35,
      kategori: "Wok Series",
      nama: "Kwetiau Special Warkap",
      harga: 15000,
      foto:
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Kwetiau dengan campuran seafood dan daging.",
      badge: null,
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Kental"],
      },
    },
    {
      id: 36,
      kategori: "Wok Series",
      nama: "Cuanki Ori",
      harga: 17000,
      foto:
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Cuanki original tanpa versioning tambahan.",
      badge: null,
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Kental"],
      },
    },
    {
      id: 37,
      kategori: "Wok Series",
      nama: "Cuanki Special",
      harga: 20000,
      foto:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Cuanki dengan ayam, bakso, dan kuah yang lebih banyak.",
      badge: "Komodo",
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Kental"],
        topping: [
          { nama: "Telur", harga: 3000 },
          { nama: "Kornet", harga: 5000 },
        ],
      },
    },
    {
      id: 38,
      kategori: "Wok Series",
      nama: "Nasi",
      harga: 5000,
      foto:
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Nasi putih yang hangat. Porsinya standar, bisa nambah.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 39,
      kategori: "Wok Series",
      nama: "Telur",
      harga: 5000,
      foto:
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Telur dimasak. Bisa digoreng, direbus, atau diorak.",
      badge: null,
      tersedia: true,
      varian: {
        topping: [
          { nama: "Mie", harga: 5000 },
          { nama: "Kornet", harga: 5000 },
        ],
      },
    },
    {
      id: 40,
      kategori: "Wok Series",
      nama: "Kornet",
      harga: 5000,
      foto:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Kornet sosis, bisa request digoreng atau diheated.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 41,
      kategori: "Wok Series",
      nama: "Kerupuk",
      harga: 5000,
      foto:
        "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Kerupuk sebagai pelengkap wajib buat makan mie.",
      badge: null,
      tersedia: true,
      varian: {},
    },

    /* ===================== CHICKEN BOWL ===================== */
    {
      id: 42,
      kategori: "Chicken Bowl",
      nama: "Chicken Bowl Cabai Garam",
      harga: 18000,
      foto:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Ayam dalam bowl dengan saus khas yang pedas dan gurih.",
      badge: "Best Seller",
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Kental"],
        topping: [
          { nama: "Nasi", harga: 5000 },
          { nama: "Kerupuk", harga: 3000 },
        ],
      },
    },
    {
      id: 43,
      kategori: "Chicken Bowl",
      nama: "Chicken Bowl Teriyaki",
      harga: 18000,
      foto:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Ayam dalam bowl dengan saus teriyaki yang manis legit.",
      badge: null,
      tersedia: true,
      varian: {
        topping: [
          { nama: "Nasi", harga: 5000 },
          { nama: "Kerupuk", harga: 3000 },
        ],
      },
    },
    {
      id: 44,
      kategori: "Chicken Bowl",
      nama: "Chicken Bowl Asam Manis",
      harga: 18000,
      foto:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Ayam dalam bowl dengan saus asam manis yang balance.",
      badge: null,
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Kental"],
        topping: [
          { nama: "Nasi", harga: 5000 },
          { nama: "Kerupuk", harga: 3000 },
        ],
      },
    },
    {
      id: 45,
      kategori: "Chicken Bowl",
      nama: "Chicken Bowl Katsu",
      harga: 20000,
      foto:
        "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Ayam katsu crispy dengan saus khas dan nasi hangat.",
      badge: "Komodo",
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Kental"],
        topping: [
          { nama: "Nasi", harga: 5000 },
          { nama: "Kerupuk", harga: 3000 },
        ],
      },
    },

    /* ===================== INDOMIE ===================== */
    {
      id: 46,
      kategori: "Indomie",
      nama: "Indomie Goreng",
      harga: 10000,
      foto:
        "https://images.unsplash.com/photo-1619895092538-0f92b0d1d3c4?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Indomie goreng dengan telur, kerupuk, atau dimsum.",
      badge: "Komodo",
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Kental"],
        topping: [
          { nama: "Telur", harga: 3000 },
          { nama: "Kornet", harga: 5000 },
          { nama: "Dimsum", harga: 5000 },
        ],
      },
    },
    {
      id: 47,
      kategori: "Indomie",
      nama: "Indomie Rebus",
      harga: 10000,
      foto:
        "https://images.unsplash.com/photo-1619895092538-0f92b0d1d3c4?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Indomie rebus berkuah, bisa pedas atau polos.",
      badge: null,
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Kental"],
        topping: [
          { nama: "Telur", harga: 3000 },
          { nama: "Kornet", harga: 5000 },
        ],
      },
    },
    {
      id: 48,
      kategori: "Indomie",
      nama: "Indomie Combo",
      harga: 20000,
      foto:
        "https://images.unsplash.com/photo-1619895092538-0f92b0d1d3c4?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Indomie plus dimsum, kerupuk, dan minuman. Paket paling hemat.",
      badge: "Paket Hemat",
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Kental"],
      },
    },
    {
      id: 49,
      kategori: "Indomie",
      nama: "Mie Kari Special",
      harga: 20000,
      foto:
        "https://images.unsplash.com/photo-1619895092538-0f92b0d1d3c4?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Mie kari yang kental dan gurih dengan saus kedelai kental manis.",
      badge: null,
      tersedia: true,
      varian: {
        levelPedas: ["Tidak Pedas", "Pedas Sedang", "Pedas Kental"],
        topping: [
          { nama: "Telur", harga: 3000 },
          { nama: "Kornet", harga: 5000 },
        ],
      },
    },

    /* ===================== ROTI BAKAR ===================== */
    {
      id: 50,
      kategori: "Roti Bakar",
      nama: "Roti Bakar Coklat",
      harga: 14000,
      foto:
        "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Roti bakar coklat yang lumer dan masih hangat.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 51,
      kategori: "Roti Bakar",
      nama: "Roti Bakar Strawberry",
      harga: 14000,
      foto:
        "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Roti bakar isian strawberry yang manis dan fresh.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 52,
      kategori: "Roti Bakar",
      nama: "Roti Bakar Kacang",
      harga: 14000,
      foto:
        "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Roti bakar isian kacang yang gurih dan legit.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 53,
      kategori: "Roti Bakar",
      nama: "Roti Bakar Matcha",
      harga: 15000,
      foto:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Roti bakar isian matcha yang sedikit pahit dan wangi.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 54,
      kategori: "Roti Bakar",
      nama: "Roti Bakar Tiramisu",
      harga: 15000,
      foto:
        "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Roti bakar isian tiramisu dengan susu dan cokelat.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 55,
      kategori: "Roti Bakar",
      nama: "Roti Bakar Nutella",
      harga: 17000,
      foto:
        "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Roti bakar isian Nutella yang lumer, paling luxurious di menu ini.",
      badge: "Komodo",
      tersedia: true,
      varian: {},
    },

    /* ===================== MINUMAN =====================
       Harga 0 = belum dipublikasikan, tampil "Tanya Harga". */
    {
      id: 56,
      kategori: "Minuman",
      nama: "Tea",
      harga: 12000,
      foto:
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Teh hangat atau dingin, cocok buat nemenin ngopi sore.",
      badge: null,
      tersedia: true,
      varian: {
        suhu: ["Hangat", "Dingin"],
        gula: ["Normal", "Less Sugar", "No Sugar"],
      },
    },
    {
      id: 57,
      kategori: "Minuman",
      nama: "Wark P",
      harga: 12000,
      foto:
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Signature drink WARKAP. Cokelat kental dan creamy.",
      badge: "Signature",
      tersedia: true,
      varian: {
        suhu: ["Hangat", "Dingin"],
        gula: ["Normal", "Less Sugar", "No Sugar"],
      },
    },
    {
      id: 58,
      kategori: "Minuman",
      nama: "Kopi Kapal Api",
      harga: 0,
      foto:
        "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Kopi sachet klasik. Harga resmi belum dipublikasikan, tanya kasir.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 59,
      kategori: "Minuman",
      nama: "Kopi Liong",
      harga: 0,
      foto:
        "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Kopi klasik legendaris. Harga belum dipublikasikan, tanya kasir.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 60,
      kategori: "Minuman",
      nama: "Good Day All Variant",
      harga: 0,
      foto:
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Minuman siap minum semua varian. Harga belum dipublikasikan.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 61,
      kategori: "Minuman",
      nama: "Good Day Freeze Keju",
      harga: 0,
      foto:
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Good Day freeze variant keju. Harga belum dipublikasikan.",
      badge: null,
      tersedia: true,
      varian: {},
    },
    {
      id: 62,
      kategori: "Minuman",
      nama: "Nutrisari All Variant",
      harga: 0,
      foto:
        "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
      deskripsi: "Nutrisari semua varian. Harga belum dipublikasikan, tanya kasir.",
      badge: null,
      tersedia: true,
      varian: {},
    },
  ],
};

if (typeof window !== "undefined") window.config = config;
