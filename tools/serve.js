/* ==========================================================================
   tools/serve.js - SERVER LOKAL SEDERHANA (tanpa dependency)

   Jalankan:  node tools/serve.js
              node tools/serve.js 8080
              node tools/serve.js 8080 /repo

   Argumen ketiga (opsional) = prefix folder, untuk mencoba website seperti
   di GitHub Pages:  node tools/serve.js 8080 /repo
   lalu buka  http://localhost:8080/repo/
   Semua file inti memakai path relatif, jadi harusnya tetap jalan di subfolder.

   Berguna untuk mencoba website di HP pada jaringan yang sama:
   buka http://IP-KOMPUTER-INI:8080 di browser HP.
   ========================================================================== */

const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const root = path.join(__dirname, "..");
const port = Number(process.argv[2] || 8080);
let prefix = process.argv[3] || "";
if (prefix && prefix.charAt(0) !== "/") prefix = "/" + prefix;
prefix = prefix.replace(/\/+$/, "");

const tipe = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
};

const server = http.createServer(function (req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);

  /* Buang prefix folder (simulasi hosting di subfolder) */
  if (prefix) {
    if (urlPath === prefix) {
      res.writeHead(302, { Location: prefix + "/" });
      res.end();
      return;
    }
    if (urlPath.indexOf(prefix + "/") === 0) urlPath = urlPath.slice(prefix.length);
  }

  if (urlPath === "/") urlPath = "/index.html";

  /* Cegah keluar dari folder project */
  const target = path.join(root, path.normalize(urlPath));
  if (!target.startsWith(root)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("403 Forbidden");
    return;
  }

  fs.stat(target, function (err, stat) {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Tidak ditemukan: " + urlPath);
      return;
    }

    const ext = path.extname(target).toLowerCase();
    res.writeHead(200, {
      "Content-Type": tipe[ext] || "application/octet-stream",
      "Content-Length": stat.size,
      "Cache-Control": "no-cache",
    });
    fs.createReadStream(target).pipe(res);
  });
});

server.listen(port, function () {
  const alamat = [];
  const ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach((nama) => {
    (ifaces[nama] || []).forEach(function (i) {
      if (i.family === "IPv4" && !i.internal) alamat.push(i.address);
    });
  });

  console.log("Server lokal aktif. Jangan tutup jendela ini.");
  console.log("");
  console.log("  Di komputer ini :  http://localhost:" + port + prefix + "/");
  alamat.forEach(function (a) {
    console.log("  Di HP (WiFi sama):  http://" + a + ":" + port + prefix + "/");
  });
  if (prefix) console.log("  (mode subfolder " + prefix + " - simulasi GitHub Pages)");
  console.log("");
  console.log("Tekan Ctrl+C untuk menghentikan.");
});
