/* tools/inspect-lines.js - tampilkan rentang baris file tanpa error terminal
   Jalankan: node tools/inspect-lines.js <file> <mulai> <akhir> */
const fs = require("fs");
const file = process.argv[2];
const a = Number(process.argv[3] || 1);
const b = Number(process.argv[4] || a);
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

for (let i = a; i <= b && i <= lines.length; i++) {
  const l = lines[i - 1];
  const preview = l.length > 160 ? l.slice(0, 160) + " ...[potong " + l.length + " karakter]" : l;
  console.log(i + ": " + preview);
}
