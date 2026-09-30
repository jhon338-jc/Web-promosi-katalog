/* ==========================================================================
   tools/check-http.js - SMOKE TEST: pastikan semua file penting terbaca server

   Jalankan:  node tools/serve.js 8099
              node tools/check-http.js 8099
              node tools/check-http.js 8099 /repo     (mode subfolder)

   Menguji apakah setiap file inti wirklich bisa diakses lewat HTTP dengan
   status 200 dan tipe konten yang benar. Ini meniru kondisi file di hosting.
   ========================================================================== */

const http = require("http");

const port = Number(process.argv[2] || 8099);
const prefix = (process.argv[3] || "").replace(/\/+$/, "");
const files = [
  ["/", "text/html"],
  ["/index.html", "text/html"],
  ["/config.js", "text/javascript"],
  ["/script.js", "text/javascript"],
  ["/styles.css", "text/css"],
  ["/manifest.json", "application/json"],
  ["/sw.js", "text/javascript"],
  ["/icons/icon-192.png", "image/png"],
  ["/icons/icon-512.png", "image/png"],
  ["/icons/icon-maskable-512.png", "image/png"],
];

let gagal = 0;
let selesai = 0;

function cek(path, mauTipe) {
  const url = prefix + path;
  http
    .get({ host: "127.0.0.1", port: port, path: url }, function (res) {
      const tipe = String(res.headers["content-type"] || "");
      const ok = res.statusCode === 200 && tipe.indexOf(mauTipe) === 0;
      if (!ok) gagal++;
      console.log(
        (ok ? " OK   " : " GAGAL ") +
          String(res.statusCode).padEnd(4) +
          url.padEnd(34) +
          tipe
      );
      selesai++;
      if (selesai === files.length) selesaiSemua();
    })
    .on("error", function (e) {
      gagal++;
      console.log(" GAGAL 000 " + url.padEnd(34) + e.message);
      selesai++;
      if (selesai === files.length) selesaiSemua();
    });
}

function selesaiSemua() {
  console.log("---------------------------------------------");
  console.log(gagal ? " " + gagal + " file bermasalah." : " Semua file terbaca dengan benar.");
  console.log("==============================================");
  process.exit(gagal ? 1 : 0);
}

console.log("==============================================");
console.log(" SMOKE TEST HTTP (port " + port + ", prefix " + (prefix || "/") + ")");
console.log("==============================================");
files.forEach(function (f) {
  cek(f[0], f[1]);
});
