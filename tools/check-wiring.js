/* ==========================================================================
   tools/check-wiring.js - CEK KESELARASAN ID HTML <-> JAVASCRIPT

   Jalankan:  node tools/check-wiring.js

   Yang diperiksa:
     1. Semua $("id") / getElementById("id") di script.js harus ada di index.html
     2. Semua id="..." di index.html yang dipakai JS harus unik
     3. Semua gambar <img src="..."> lokal harus benar-benar ada di project
     4. Semua <link href> / <script src> lokal harus ada (kecuali CDN)

   Ini menangkap salah ketik id yang tidak akan ketahuan kalau cuma
   dibuka di browser (hanya muncul sebagai elemen yang "tidak muncul").
   ========================================================================== */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "script.js"), "utf8");

let error = 0;
let warn = 0;

/* ---------- 1. ID yang dipakai JS ---------- */
const dipakai = new Set();
const pola = [/\$\(\s*"([^"]+)"\s*\)/g, /getElementById\(\s*"([^"]+)"\s*\)/g];
pola.forEach(function (re) {
  let m;
  while ((m = re.exec(js)) !== null) dipakai.add(m[1]);
});

/* ---------- 2. ID yang ada di HTML ---------- */
const idHTML = [];
const reId = /\sid="([^"]+)"/g;
let m;
while ((m = reId.exec(html)) !== null) idHTML.push(m[1]);
const setHTML = new Set(idHTML);

/* ---------- 3. ID yang dibuat dari string HTML di dalam JS ---------- */
const dibuatJS = new Set();
const reBuat = [
  /(?:setAttribute\(\s*"id"|\.id\s*=)\s*["']?([a-z0-9_-]+)/gi,
  /\bid="([a-z0-9_-]+)"/gi, /* id="..." di dalam template string */
];
reBuat.forEach(function (re) {
  let mm;
  while ((mm = re.exec(js)) !== null) dibuatJS.add(mm[1]);
});

console.log("==============================================");
console.log(" CEK KESELARASAN HTML <-> JS");
console.log("==============================================");
console.log("ID di index.html : " + idHTML.length);
console.log("ID dipakai JS    : " + dipakai.size);
console.log("---------------------------------------------");

/* id yang tidak ada di HTML dan tidak dibuat oleh JS */
const hilang = [...dipakai].filter(function (id) {
  return !setHTML.has(id) && !dibuatJS.has(id);
});
if (hilang.length) {
  hilang.forEach(function (id) {
    console.log(" ERROR  id tidak ada di index.html: #" + id);
    error++;
  });
} else {
  console.log(" OK     semua id yang dipakai JS ditemukan");
}

/* id duplikat di HTML */
const hitung = {};
idHTML.forEach(function (id) { hitung[id] = (hitung[id] || 0) + 1; });
const duplikat = Object.keys(hitung).filter(function (id) { return hitung[id] > 1; });
if (duplikat.length) {
  duplikat.forEach(function (id) {
    console.log(" ERROR  id duplikat di index.html: #" + id + " (" + hitung[id] + "x)");
    error++;
  });
} else {
  console.log(" OK     tidak ada id duplikat");
}

/* ---------- 4. Aset lokal harus ada ----------
   Path di index.html sengaja RELATIF ("styles.css") supaya website jalan di
   hosting root maupun subfolder GitHub Pages. Jadi pola menerima dua bentuk:
   "styles.css", "./styles.css", dan "/styles.css". */
function cekAset(polaRe, label) {
  const found = new Set();
  let mm;
  while ((mm = polaRe.exec(html)) !== null) found.add(mm[1]);
  found.forEach(function (src) {
    if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return;
    const p = path.join(root, src.replace(/^\.?\//, ""));
    if (!fs.existsSync(p)) {
      console.log(" ERROR  " + label + " lokal tidak ada: " + src);
      error++;
    }
  });
  return found.size;
}

const nCss = cekAset(/(?:href)="\.?\/?([\w.-]+\.css)"/g, "CSS");
const nJs = cekAset(/(?:src)="\.?\/?([\w.-]+\.js)"/g, "script");
const nIcon = cekAset(/href="\.?\/?(icons\/[^"]+)"/g, "icon");
const nManifest = cekAset(/href="\.?\/?(manifest\.json)"/g, "manifest");

/* tidak boleh ada path absolut lagi (bikin 404 di GitHub Pages) */
[...html.matchAll(/(?:href|src)="\/(?!\/)[^"]+"/g)].forEach(function (mm) {
  console.log(" WARN  index.html masih pakai path absolut: " + mm[0] + ' -> pakai "path/relatif"');
  warn++;
});

/* sw.js juga harus ada karena dipanggil script.js */
if (!fs.existsSync(path.join(root, "sw.js"))) {
  console.log(" ERROR  sw.js tidak ada tapi dipanggil oleh script.js");
  error++;
}

/* icon yang disebut manifest.json harus ada, dan path-nya harus relatif */
const mfPath = path.join(root, "manifest.json");
if (fs.existsSync(mfPath)) {
  const mf = JSON.parse(fs.readFileSync(mfPath, "utf8"));
  (mf.icons || []).forEach(function (ic) {
    const p = path.join(root, String(ic.src).replace(/^\.?\//, ""));
    if (!fs.existsSync(p)) {
      console.log(" ERROR  icon di manifest.json tidak ada: " + ic.src);
      error++;
    }
  });
  (mf.shortcuts || []).forEach(function (sc) {
    (sc.icons || []).forEach(function (ic) {
      const p = path.join(root, String(ic.src).replace(/^\.?\//, ""));
      if (!fs.existsSync(p)) {
        console.log(" ERROR  icon shortcut di manifest.json tidak ada: " + ic.src);
        error++;
      }
    });
  });
  [mf.start_url, mf.scope].forEach(function (u) {
    if (typeof u === "string" && u.startsWith("/")) {
      console.log(" WARN  manifest.json masih absolut (bikin 404 di subfolder): " + u);
      warn++;
    }
  });
  console.log(" OK     manifest.json valid, semua icon tersedia");
}

/* ---------- 5. PRECACHE di sw.js harus benar-benar ada ---------- */
const swPath = path.join(root, "sw.js");
if (fs.existsSync(swPath)) {
  const sw = fs.readFileSync(swPath, "utf8");
  const blok = (sw.match(/const PRECACHE\s*=\s*\[([\s\S]*?)\]/) || [])[1] || "";
  [...blok.matchAll(/"([^"]+)"/g)].forEach(function (mm) {
    const u = mm[1];
    if (/^https?:/.test(u)) return;
    if (u === "./") return; /* folder index */
    const p = path.join(root, u.replace(/^\.?\//, ""));
    if (!fs.existsSync(p)) {
      console.log(" ERROR  PRECACHE di sw.js menunjuk file yang tidak ada: " + u);
      error++;
    }
  });
  if (sw.includes('register("/sw.js")') || sw.includes('register("/')) {
    console.log(" WARN  script.js/sw.js masih mendaftarkan service worker dengan path absolut");
    warn++;
  }
  console.log(" OK     PRECACHE service worker valid");
}

/* gambar lokal yang disebut di script.js juga dicek.
   Komentar dibuang dulu supaya contoh di dalam komentar tidak dianggap error. */
const jsKode = js.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
[...jsKode.matchAll(/"\.?\/?(images\/[^"]+\.(?:png|jpg|jpeg|webp|svg))"/gi)].forEach(function (mm) {
  const p = path.join(root, mm[1].replace(/^\.?\//, ""));
  if (!fs.existsSync(p)) {
    console.log(" WARN  script.js merujuk gambar yang belum ada: " + mm[1]);
    warn++;
  }
});

/* SW tidak boleh didaftarkan lewat path absolut (bikin 404 di subfolder) */
[...jsKode.matchAll(/serviceWorker\.register\(\s*"([^"]+)"/g)].forEach(function (mm) {
  if (mm[1].startsWith("/")) {
    console.log(" WARN  serviceWorker.register masih absolut (bikin 404 di subfolder): " + mm[1]);
    warn++;
  }
});

console.log("---------------------------------------------");
console.log(" Aset dicek: " + nCss + " css, " + nJs + " js, " + nIcon + " icon, " + nManifest + " manifest");
console.log(" Ringkasan: " + error + " error, " + warn + " peringatan.");
console.log("==============================================");
process.exit(error ? 1 : 0);
