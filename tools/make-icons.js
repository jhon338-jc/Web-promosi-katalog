/* ==========================================================================
   tools/make-icons.js - BUAT ICON PNG TANPA INSTAL LIBRARY APAPUN

   Jalankan:  node tools/make-icons.js

   Menghasilkan file di folder icons/:
     icon-32.png, icon-152.png, icon-180.png, icon-192.png,
     icon-512.png, icon-maskable-512.png

   Semua gambar digambar manual per piksel lalu ditulis sebagai PNG asli
   (kompresi zlib bawaan Node.js). Owner boleh mengganti icon-nya sendiri,
   cukup simpan PNG 512x512 lalu jalankan ulang perintah di atas.
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

/* ---------------- Utilitas PNG ---------------- */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/** rgba: Uint8Array panjang w*h*4 -> Buffer PNG (RGBA, alpha untuk sudut bulat) */
function encodePNG(w, h, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; /* bit depth */
  ihdr[9] = 6; /* color type 6 = truecolor + alpha */
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  /* tiap baris diawali byte filter 0 (None) */
  const raw = Buffer.alloc(h * (w * 4 + 1));
  let p = 0;
  for (let y = 0; y < h; y++) {
    raw[p++] = 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      raw[p++] = rgba[i];
      raw[p++] = rgba[i + 1];
      raw[p++] = rgba[i + 2];
      raw[p++] = rgba[i + 3];
    }
  }

  const idat = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------------- Menggambar ---------------- */

/* Palet eco WARKAP - harus sama dengan blok :root di styles.css */
const GOLD = [123, 160, 91]; /* #7BA05B hijau muda */
const GOLD_DEEP = [74, 124, 63]; /* #4A7C3F hijau utama */
const CREAM = [245, 241, 232]; /* #F5F1E8 krem */
const BROWN = [46, 74, 38]; /* #2E4A26 hijau gelap */

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/** Rasio jarak titik ke bentuk, dipakai untuk anti-aliasing halus */
function sdCircle(px, py, cx, cy, r) {
  return Math.hypot(px - cx, py - cy) - r;
}
function sdRoundRect(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
}
function sdEllipse(px, py, cx, cy, rx, ry) {
  const nx = (px - cx) / rx;
  const ny = (py - cy) / ry;
  const d = Math.hypot(nx, ny);
  return (d - 1) * Math.min(rx, ry);
}

/** tumour 0..1 (1 = di dalam) dari signed distance */
function cover(d, aa) {
  return Math.max(0, Math.min(1, 0.5 - d / aa));
}

/**
 * Gambar ikon warung.
 * @param {number} size ukuran sisi dalam piksel
 * @param {boolean} maskable true = versi maskable (gambar lebih kecil, aman di Safe Zone)
 */
function drawIcon(size, maskable) {
  const rgba = new Uint8Array(size * size * 4);
  const aa = 1.15; /* lebar anti-alias */

  /* padding lebih besar untuk maskable supaya tidak terpotong shape bulat */
  const scale = maskable ? 0.62 : 0.82;
  const cx = size / 2;
  const cy = size / 2;

  /* ukuran komponen gambar (dalam satuan piksel) */
  const s = size * scale;
  const plateR = s * 0.5;
  const ringW = s * 0.085;

  /* fork di kiri, spoon di kanan */
  const toolGap = s * 0.2;
  const toolH = s * 0.62;
  const toolW = s * 0.075;
  const toolTop = cy - s * 0.31;
  const bowlRx = s * 0.085;
  const bowlRy = s * 0.11;

  const radius = maskable ? 0 : size * 0.22; /* sudut membulat */

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x + 0.5;
      const py = y + 0.5;

      /* ---- latar: gradien diagonal + sudut membulat ---- */
      let bg = mix(GOLD, GOLD_DEEP, (px / size) * 0.55 + (py / size) * 0.45);
      let aLatar = 1;
      if (radius > 0) {
        /* cover() = 1 di dalam bentuk, 0 di luar */
        aLatar = cover(sdRoundRect(px, py, cx, cy, size / 2, size / 2, radius), aa);
      }

      /* ---- piring: cincin putih + isi krem ---- */
      const dRing = Math.abs(sdCircle(px, py, cx, cy, plateR - ringW / 2)) - ringW / 2;
      const aRing = cover(dRing, aa);

      const dIsi = sdCircle(px, py, cx, cy, plateR - ringW);
      const aIsi = cover(dIsi, aa);

      /* aksen: cincin tipis emas di dalam piring, memberi kesan kedalaman */
      const dInner = Math.abs(sdCircle(px, py, cx, cy, plateR * 0.62)) - ringW * 0.16;
      const aGaris = cover(dInner, aa) * aIsi;

      /* ---- garpu: batang + 3 tines ---- */
      const fx = cx - toolGap - s * 0.16;
      let dFork = sdRoundRect(px, py, fx, cy + toolH * 0.22, toolW / 2, toolH * 0.28, toolW / 2);
      const tineH = toolH * 0.3;
      for (let ti = 0; ti < 3; ti++) {
        const tx = fx + (ti - 1) * toolW * 1.5;
        const dTine = sdRoundRect(px, py, tx, toolTop + tineH / 2, toolW * 0.34, tineH / 2, toolW * 0.34);
        dFork = Math.min(dFork, dTine);
      }
      const aFork = cover(dFork, aa);

      /* ---- sendok: mangkuk oval + batang ---- */
      const sx = cx + toolGap + s * 0.16;
      let dSpoon = sdEllipse(px, py, sx, toolTop + bowlRy, bowlRx, bowlRy);
      dSpoon = Math.min(
        dSpoon,
        sdRoundRect(px, py, sx, cy + toolH * 0.16, toolW / 2, toolH * 0.3, toolW / 2)
      );
      const aSpoon = cover(dSpoon, aa);

      /* ---- komposit (urutan penting: bentuk besar dulu, detail kecil
              selalu digambar di atasnya) ---- */
      let col = bg;

      /* 1. piring: cincin putih */
      col = mix(col, [255, 255, 255], aRing);
      /* 2. isi piring krem */
      col = mix(col, CREAM, aIsi);
      /* 3. cincin aksen di dalam piring - DI ATAS isi piring */
      col = mix(col, GOLD_DEEP, aGaris);
      /* 4. garpu & sendok */
      col = mix(col, [255, 255, 255], aFork);
      col = mix(col, [255, 255, 255], aSpoon);

      const i = (y * size + x) * 4;
      rgba[i] = Math.round(col[0]);
      rgba[i + 1] = Math.round(col[1]);
      rgba[i + 2] = Math.round(col[2]);
      rgba[i + 3] = Math.round(aLatar * 255);
    }
  }

  return encodePNG(size, size, rgba);
}

/* ---------------- Jalankan ---------------- */

const outDir = path.join(__dirname, "..", "icons");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const targets = [
  ["icon-32.png", 32, false],
  ["icon-152.png", 152, false],
  ["icon-180.png", 180, false],
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["icon-maskable-512.png", 512, true],
];

targets.forEach(([name, size, maskable]) => {
  const buf = drawIcon(size, maskable);
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log("  " + name.padEnd(24) + size + "x" + size + "  " + (buf.length / 1024).toFixed(1) + " KB");
});

console.log("\nSelesai. File icon ada di folder: " + outDir);
