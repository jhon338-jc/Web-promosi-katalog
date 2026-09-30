/* tools/check-icon.js - cek histogram warna icon (untuk verifikasi internal) */
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

const file = process.argv[2] || path.join(__dirname, "..", "icons", "icon-512.png");
const b = fs.readFileSync(file);

let p = 8, w = 0, h = 0;
const idat = [];
while (p < b.length) {
  const len = b.readUInt32BE(p);
  const type = b.toString("ascii", p + 4, p + 8);
  const data = b.slice(p + 8, p + 8 + len);
  if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); }
  if (type === "IDAT") idat.push(data);
  p += 12 + len;
}

const raw = zlib.inflateSync(Buffer.concat(idat));
const stride = w * 4 + 1;
let hijauMuda = 0, white = 0, krem = 0, hijauDeep = 0, transparan = 0, other = 0;

/* Klasifikasi warna: palet eco WARKAP (lihat :root di styles.css)
     #7BA05B hijau muda | #FDFCF8 putih tulang | #F5F1E8 krem
     #4A7C3F hijau utama                                        */
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const o = y * stride + 1 + x * 4;
    const r = raw[o], g = raw[o + 1], bl = raw[o + 2], a = raw[o + 3];
    if (a < 128) { transparan++; continue; }
    if (r > 100 && r < 145 && g > 140 && g < 180 && bl > 70 && bl < 110) hijauMuda++;
    else if (r > 250 && g > 250 && bl > 245) white++;
    else if (r > 235 && g > 230 && bl > 215) krem++;
    else if (r > 55 && r < 95 && g > 105 && g < 145 && bl > 45 && bl < 85) hijauDeep++;
    else other++;
  }
}

const tot = w * h;
const persen = (n) => ((n / tot) * 100).toFixed(1) + "%";
console.log("file  :", path.basename(file));
console.log("size  :", w + "x" + h, "|", (b.length / 1024).toFixed(1), "KB");
console.log("hijau muda  :", persen(hijauMuda));
console.log("putih tulang:", persen(white));
console.log("krem        :", persen(krem));
console.log("hijau utama :", persen(hijauDeep));
console.log("transparan  :", persen(transparan));
console.log("lainnya     :", persen(other));

/* Guard: icon harus benar-benar memakai palet hijau, bukan kuning lama. */
const pctHijau = ((hijauMuda + hijauDeep) / tot) * 100;
if (pctHijau < 10) {
  console.error("GAGAL  hanya " + pctHijau.toFixed(1) + "% piksel hijau. Jalankan: npm run icons");
  process.exit(1);
}
