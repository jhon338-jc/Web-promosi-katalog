/* ==========================================================================
   tools/check-clean.js - SCAN KORUPSI TEKS (karakter dari bahasa lain)

   Jalankan:  node tools/check-clean.js

   Source code ini memakai Bahasa Indonesia, jadi di dalam teks tidak boleh
   ada huruf Mandarin, Jepang, Korea, Rusia, atau Arab yang tidak disengaja.
   Tool ini menangkap file yang sempat ingesting karakter aneh saat ditulis
   ulang (biasanya karena salah tempel payload).

   Yang diperiksa:
     - huruf CJK / Hiragana / Katakana / Hangul / Cyrillic / Arab
     - karakter replacement (U+FFFD) dan control character aneh
     - kurung kurawal ({ }) yang tidak seimbang pada file .js
     - baris yang terlalu panjang (indikasi teks menempel)
   ========================================================================== */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const targets = [
  "config.js",
  "index.html",
  "styles.css",
  "script.js",
  "sw.js",
  "manifest.json",
  "package.json",
  "README.md",
  "LICENSE.md",
  "images/README.md",
].concat(
  fs
    .readdirSync(path.join(root, "tools"))
    .filter(function (f) {
      return f.endsWith(".js");
    })
    .map(function (f) {
      return "tools/" + f;
    })
);

const polaAsing = /[\u2E80-\u9FFF\uAC00-\uD7AF\u0400-\u04FF\u0600-\u06FF\uFF01-\uFF5E]/g;
const polaBocah = /[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;

let error = 0;

console.log("==============================================");
console.log(" SCAN KORUPSI TEKS (" + targets.length + " file)");
console.log("==============================================");

targets.forEach(function (rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    console.log(" Lewati  " + rel + " (belum ada)");
    return;
  }

  const teks = fs.readFileSync(p, "utf8");
  const lines = teks.split(/\r?\n/);
  const masalah = [];

  lines.forEach(function (l, i) {
    const asing = l.match(polaAsing);
    if (asing) {
      masalah.push(
        "  baris " +
          (i + 1) +
          ": huruf asing [" +
          [...new Set(asing)].join("") +
          "] -> " +
          l.trim().slice(0, 60)
      );
    }
    const bocah = l.match(polaBocah);
    if (bocah) {
      masalah.push(
        "  baris " +
          (i + 1) +
          ": karakter rusak U+" +
          bocah[0].codePointAt(0).toString(16).toUpperCase()
      );
    }
    if (l.length > 20000) {
      masalah.push(
        "  baris " + (i + 1) + ": baris sangat panjang (" + l.length + " karakter) - indikasi teks menempel"
      );
    }
  });

  /* jumlah kurung kurawal harus seimbang */
  const kurawalBuka = (teks.match(/\{/g) || []).length;
  const kurawalTutup = (teks.match(/\}/g) || []).length;
  if (rel.endsWith(".js") && kurawalBuka !== kurawalTutup) {
    masalah.push(
      "  kurawal tidak seimbang: " + kurawalBuka + " buka vs " + kurawalTutup + " tutup"
    );
  }

  if (masalah.length) {
    console.log(" GAGAL   " + rel);
    masalah.slice(0, 5).forEach(function (m) {
      console.log(m);
    });
    if (masalah.length > 5) console.log("  ... dan " + (masalah.length - 5) + " masalah lain");
    error += masalah.length;
  } else {
    console.log(
      " OK     " +
        rel +
        " (" +
        lines.length +
        " baris" +
        (rel.endsWith(".js") ? ", kurawal " + kurawalBuka + "/" + kurawalTutup : "") +
        ")"
    );
  }
});

console.log("---------------------------------------------");
console.log(
  error ? " Ringkasan: " + error + " masalah ditemukan." : " Ringkasan: semua file bersih."
);
console.log("==============================================");
process.exit(error ? 1 : 0);
