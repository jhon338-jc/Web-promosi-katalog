/* ==========================================================================
   tools/check-config.js - VALIDASI config.js SEBELUM DIJUAL / DI-UPLOAD

   Jalankan:  node tools/check-config.js

   Memeriksa:
     - file config.js bisa di-parse
     - field wajib pemilik ada & terisi
     - format nomor WhatsApp benar
     - format jam buka "HH:MM-HH:MM"
     - tiap menu punya id / kategori / nama / harga / foto
     - harga berupa angka, tidak negatif
     - struktur varian & testimoni / faq / galeri

   Keluar dengan kode error bila ada masalah, jadi bisa dipakai diotomatis.
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const configPath = path.join(root, "config.js");

let error = 0;
let warn = 0;
const problems = [];

function gagal(pesan) { problems.push("ERROR  " + pesan); error++; }
function hati(pesan) { problems.push("WARN   " + pesan); warn++; }

if (!fs.existsSync(configPath)) {
  console.error("config.js tidak ditemukan di: " + configPath);
  process.exit(1);
}

/* ---- 1. parse config.js dalam sandbox/browser-palsu ---- */
const kode = fs.readFileSync(configPath, "utf8");
const sandbox = { window: {}, console };
try {
  vm.createContext(sandbox);
  vm.runInContext(kode, sandbox, { filename: "config.js" });
} catch (e) {
  console.error("config.js gagal di-parse:\n  " + e.message);
  process.exit(1);
}

const cfg = sandbox.window.config;
if (!cfg) {
  console.error("config.js tidak Mengekspor window.config");
  process.exit(1);
}

/* ---- 2. field wajib pemilik ---- */
const wajibIsi = [
  "namaWarung",
  "tagline",
  "whatsapp",
  "telepon",
  "alamat",
  "alamatLengkap",
  "mapsEmbed",
  "mapsLink",
  "deskripsiSingkat",
];
wajibIsi.forEach(function (k) {
  const v = cfg[k];
  if (v === undefined || v === null || String(v).trim() === "") gagal("field wajib kosong: " + k);
});

/* ---- 3. format WhatsApp ---- */
if (cfg.whatsapp) {
  const wa = String(cfg.whatsapp);
  if (!/^62\d{8,15}$/.test(wa)) {
    gagal('whatsapp "' + wa + '" tidak valid. Format: 628xxx (tanpa "+", tanpa spasi)');
  }
}

/* ---- 4. jam buka ---- */
if (!cfg.jamBuka) {
  gagal("jamBuka belum ada");
} else {
  ["senin_jumat", "sabtu_minggu"].forEach(function (k) {
    const v = cfg.jamBuka[k];
    if (!v) return gagal("jamBuka." + k + " kosong");
    if (!/^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/.test(String(v).trim())) {
      gagal('jamBuka.' + k + ' = "' + v + '" harus format HH:MM-HH:MM (contoh 08:00-21:00)');
    }
  });
}

/* ---- 5. menu ---- */
if (!Array.isArray(cfg.menu) || !cfg.menu.length) {
  gagal("menu kosong atau bukan array");
} else {
  const idDipakai = {};
  cfg.menu.forEach(function (m, i) {
    const t = "menu[" + i + "] (" + (m.nama || "?") + ")";
    if (m.id === undefined || m.id === null || m.id === "") gagal(t + ": id kosong");
    else if (idDipakai[m.id]) gagal(t + ": id " + m.id + " duplikat");
    else idDipakai[m.id] = true;

    if (!m.kategori) gagal(t + ": kategori kosong");
    if (!m.nama) gagal(t + ": nama kosong");

    const harga = Number(m.harga);
    if (!Number.isFinite(harga)) gagal(t + ": harga bukan angka ('" + m.harga + "')");
    else if (harga < 0) gagal(t + ": harga negatif");
    else if (harga < 100) hati(t + ": harga suspiciously kecil (" + harga + ")");

    if (!m.foto) gagal(t + ": foto kosong, akan muncul placeholder");
    else if (!/^https?:\/\/|^\//.test(m.foto)) {
      gagal(t + ": foto harus URL http(s) atau path lokal diawali / (contoh /images/menu/x.jpg)");
    }

    if (m.varian && typeof m.varian !== "object") gagal(t + ": varian harus object");
    if (m.varian) {
      Object.keys(m.varian).forEach(function (vk) {
        if (!Array.isArray(m.varian[vk])) {
          gagal(t + ": varian." + vk + " harus array");
          return;
        }
        if (!m.varian[vk].length) hati(t + ": varian." + vk + " kosong, tidak ada yang bisa dipilih");
        m.varian[vk].forEach(function (o, oi) {
          if (typeof o === "string") return;
          if (!o || !o.nama) gagal(t + ": varian." + vk + "[" + oi + "] tidak punya nama");
          if (o.harga !== undefined && !Number.isFinite(Number(o.harga))) {
            gagal(t + ": varian." + vk + "[" + oi + "] harga bukan angka");
          }
        });
      });
    }
  });
}

/* ---- 6. data pendukung ---- */
["testimoni", "faq", "galeri", "sosmed", "ongkir"].forEach(function (k) {
  if (cfg[k] === undefined) hati(k + " belum ada di config (bagian ini akan dilewati)");
});

if (Array.isArray(cfg.faq)) {
  cfg.faq.forEach(function (f, i) {
    if (!f.tanya || !f.jawab) gagal("faq[" + i + "]: tanya/jawab kosong");
  });
}
if (Array.isArray(cfg.testimoni)) {
  cfg.testimoni.forEach(function (t, i) {
    if (!t.nama) gagal("testimoni[" + i + "]: nama kosong");
    if (!t.pesan) gagal("testimoni[" + i + "]: pesan kosong");
    if (t.rating !== undefined) {
      const r = Number(t.rating);
      if (!Number.isFinite(r) || r < 0 || r > 5) {
        gagal("testimoni[" + i + "]: rating harus angka 0-5 (dapat pecahan, contoh 4.5)");
      }
    }
  });
}
if (Array.isArray(cfg.galeri)) {
  cfg.galeri.forEach(function (g, i) {
    if (!g.src && !g.foto) gagal("galeri[" + i + "]: tidak ada src/foto");
  });
}

/* ---- 7. laporkan ---- */
const jml = Array.isArray(cfg.menu) ? cfg.menu.length : 0;
console.log("==============================================");
console.log(" VALIDASI config.js");
console.log("==============================================");
console.log("Nama warung : " + (cfg.namaWarung || "-"));
console.log("WhatsApp    : " + (cfg.whatsapp || "-"));
console.log("Jumlah menu : " + jml);
console.log("Testimoni   : " + (cfg.testimoni ? cfg.testimoni.length : 0));
console.log("FAQ         : " + (cfg.faq ? cfg.faq.length : 0));
console.log("Galeri      : " + (cfg.galeri ? cfg.galeri.length : 0));
console.log("---------------------------------------------");

if (!problems.length) {
  console.log(" SEMUA OK. Tidak ada error, tidak ada peringatan.");
  console.log("==============================================");
  process.exit(0);
}

problems.forEach(function (p) {
  console.log(" " + p);
});
console.log("---------------------------------------------");
console.log(" Ringkasan: " + error + " error, " + warn + " peringatan.");
console.log("==============================================");
process.exit(error ? 1 : 0);
