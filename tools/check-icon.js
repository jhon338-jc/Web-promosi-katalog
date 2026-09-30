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
let gold = 0, white = 0, cream = 0, accent = 0, transparan = 0, other = 0;

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const o = y * stride + 1 + x * 4;
    const r = raw[o], g = raw[o + 1], bl = raw[o + 2], a = raw[o + 3];
    if (a < 128) { transparan++; continue; }
    if (r > 240 && g > 175 && g < 225 && bl < 75) gold++;
    else if (r > 246 && g > 246 && bl > 246) white++;
    else if (r > 240 && g > 230 && bl > 190 && bl < 240) cream++;
    else if (r > 240 && g > 120 && g < 175 && bl < 40) accent++;
    else other++;
  }
}

const tot = w * h;
console.log("file  :", path.basename(file));
console.log("size  :", w + "x" + h, "|", (b.length / 1024).toFixed(1), "KB");
console.log("latar emas  :", ((gold / tot) * 100).toFixed(1) + "%");
console.log("putih       :", ((white / tot) * 100).toFixed(1) + "%");
console.log("krem piring :", ((cream / tot) * 100).toFixed(1) + "%");
console.log("aksen emas  :", ((accent / tot) * 100).toFixed(1) + "%");
console.log("transparan  :", ((transparan / tot) * 100).toFixed(1) + "%");
console.log("lainnya     :", ((other / tot) * 100).toFixed(1) + "%");
