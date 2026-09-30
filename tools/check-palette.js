/* Audit warna: pastikan tidak ada hex di luar 8 warna palet WARKAP.
   Palet resmi: #4A7C3F #7BA05B #A8C686 #F5F1E8 #FDFCF8 #2E4A26 #5C6B54 #E8A33D
   Diizinkan juga: #FFFFFF dan #000000 (netral), plus hijau WhatsApp
   #25D366 / #1DA851 (warna fungsi tombol WhatsApp, bukan dekorasi). */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PALET = {
  "4A7C3F": "hijau utama",
  "7BA05B": "hijau muda",
  A8C686: "hijau sage",
  F5F1E8: "krem",
  FDFCF8: "putih tulang",
  "2E4A26": "hijau gelap",
  "5C6B54": "abu hijau",
  E8A33D: "oranye hangat",
};
const BOLEH = {
  FFFFFF: "putih netral",
  "000000": "hitam netral",
  "25D366": "hijau WhatsApp",
  "1DA851": "hijau WhatsApp tua",
};

const file = process.argv[2] || "styles.css";
const teks = fs.readFileSync(path.join(root, file), "utf8");
const found = new Map();

/* tangkap #rgb dan #rrggbb */
const re = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
let m;
while ((m = re.exec(teks))) {
  let hex = m[1].toUpperCase();
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const line = teks.slice(0, m.index).split("\n").length;
  if (!found.has(hex)) found.set(hex, []);
  found.get(hex).push(line);
}

const oke = [];
const rusak = [];
for (const [hex, lines] of found) {
  if (PALET[hex]) oke.push([hex, PALET[hex], lines.length]);
  else if (BOLEH[hex]) oke.push([hex, BOLEH[hex], lines.length]);
  else rusak.push([hex, lines.slice(0, 6)]);
}

console.log("AUDIT WARNA " + file);
console.log("=".repeat(52));
oke.forEach((row) => console.log("  OK             #" + row[0] + "  " + row[1] + "  (" + row[2] + "x)"));
if (rusak.length) {
  console.log("-".repeat(52));
  rusak.forEach((row) => console.log("  DI LUAR PALET  #" + row[0] + "  baris: " + row[1].join(", ")));
}
console.log("=".repeat(52));
console.log(rusak.length ? rusak.length + " warna di luar palet!" : "Semua warna dalam palet. Aman.");
process.exit(rusak.length ? 1 : 0);
