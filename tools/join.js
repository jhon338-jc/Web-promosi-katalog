/* ==========================================================================
   tools/join.js - gabungkan beberapa file .txt jadi satu file .js
   Jalankan: node tools/join.js config.js _p1.txt _p2.txt _p3.txt _p4.txt _p5.txt
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const out = process.argv[2];
const parts = process.argv.slice(3);
const root = path.join(__dirname, "..");
let teks = "";

parts.forEach(function (p) {
  const full = path.join(root, p);
  let isi = fs.readFileSync(full, "utf8");
  if (!/\n$/.test(isi)) isi += "\n";
  teks += isi;
});

fs.writeFileSync(path.join(root, out), teks, "utf8");
console.log(out + " ditulis: " + teks.split("\n").length + " baris dari " + parts.length + " bagian.");
