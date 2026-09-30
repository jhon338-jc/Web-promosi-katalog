/* Optimalkan images/logo.png jadi beberapa ukuran ringan untuk web:
     images/logo-192.png  -> ikon PWA 192
     images/logo-256.png  -> header (2x layar retina)
     images/logo-512.png  -> apple-touch-icon & share/OG
   File asli images/logo.png tidak dihapus.
   Pakai decoder/encoder PNG sendiri (zlib bawaan Node.js, tanpa dependency). */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "images", "logo.png");

if (!fs.existsSync(src)) {
  console.log("SKIP: images/logo.png tidak ada, logo tidak dioptimasi.");
  process.exit(0);
}

/* ---------- decoder PNG (8-bit, color type 0/2/4/6, tanpa interlace) ---------- */
function bacaPNG(file) {
  const buf = fs.readFileSync(file);
  let p = 8; /* lewati signature */
  let w = 0,
    h = 0,
    depth = 0,
    ctype = 0;
  const idat = [];

  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString("ascii", p + 4, p + 8);
    const data = buf.slice(p + 8, p + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      depth = data[8];
      ctype = data[9];
      if (data[12] !== 0) throw new Error("PNG interlaced tidak didukung.");
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    p += 12 + len;
  }

  if (depth !== 8) throw new Error("Bit depth " + depth + " tidak didukung.");
  const channel = { 0: 1, 2: 3, 4: 2, 6: 4 }[ctype];
  if (!channel) throw new Error("Color type " + ctype + " tidak didukung.");

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * channel;
  const out = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride);

  for (let y = 0; y < h; y++) {
    const filter = raw[y * (stride + 1)];
    const line = Buffer.from(raw.slice(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    /* undo filter */
    for (let i = 0; i < stride; i++) {
      const a = i >= channel ? line[i - channel] : 0;
      const b = prev[i];
      const c = i >= channel ? prev[i - channel] : 0;
      if (filter === 1) line[i] = (line[i] + a) & 255;
      else if (filter === 2) line[i] = (line[i] + b) & 255;
      else if (filter === 3) line[i] = (line[i] + ((a + b) >> 1)) & 255;
      else if (filter === 4) {
        const pp = a + b - c;
        const pa = Math.abs(pp - a),
          pb = Math.abs(pp - b),
          pc = Math.abs(pp - c);
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        line[i] = (line[i] + pr) & 255;
      }
    }
    /* RGB -> RGBA */
    for (let x = 0; x < w; x++) {
      const si = x * channel;
      const di = (y * w + x) * 4;
      if (ctype === 6) {
        out[di] = line[si];
        out[di + 1] = line[si + 1];
        out[di + 2] = line[si + 2];
        out[di + 3] = line[si + 3];
      } else if (ctype === 2) {
        out[di] = line[si];
        out[di + 1] = line[si + 1];
        out[di + 2] = line[si + 2];
        out[di + 3] = 255;
      } else if (ctype === 4) {
        out[di] = out[di + 1] = out[di + 2] = line[si];
        out[di + 3] = line[si + 1];
      } else {
        out[di] = out[di + 1] = out[di + 2] = line[si];
        out[di + 3] = 255;
      }
    }
    prev = line;
  }
  return { w, h, data: out };
}

/* ---------- encoder PNG ---------- */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function tulisPNG(file, w, h, rgba) {
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; /* filter: none */
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const data = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  fs.writeFileSync(file, data);
}

/* ---------- resize (box filter, rasio asli dipertahankan) ---------- */
function resize(img, lebarBaru) {
  if (img.w <= lebarBaru) return img;
  const skala = lebarBaru / img.w;
  const w = lebarBaru;
  const h = Math.round(img.h * skala);
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const y0 = Math.floor(y / skala);
    const y1 = Math.min(img.h, Math.max(y0 + 1, Math.floor((y + 1) / skala)));
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor(x / skala);
      const x1 = Math.min(img.w, Math.max(x0 + 1, Math.floor((x + 1) / skala)));
      let r = 0,
        g = 0,
        b = 0,
        a = 0,
        n = 0;
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const si = (sy * img.w + sx) * 4;
          const al = img.data[si + 3];
          r += img.data[si] * al;
          g += img.data[si + 1] * al;
          b += img.data[si + 2] * al;
          a += al;
          n++;
        }
      }
      const di = (y * w + x) * 4;
      if (a > 0) {
        out[di] = Math.round(r / a);
        out[di + 1] = Math.round(g / a);
        out[di + 2] = Math.round(b / a);
      }
      out[di + 3] = Math.round(a / n);
    }
  }
  return { w, h, data: out };
}

/* ---------- auto-crop: buang margin putih kosong di sekeliling logo ---------- */
function cropOtomatis(img, ambang) {
  const t = ambang === undefined ? 242 : ambang;
  let minX = img.w,
    minY = img.h,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < img.h; y++) {
    for (let x = 0; x < img.w; x++) {
      const i = (y * img.w + x) * 4;
      /* dianggap "latar" kalau hampir putih */
      if (img.data[i] < t || img.data[i + 1] < t || img.data[i + 2] < t) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return img; /* semua kosong, pakai asli */
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const pad = Math.round(Math.max(bw, bh) * 0.02);
  const x0 = Math.max(0, minX - pad);
  const y0 = Math.max(0, minY - pad);
  const w = Math.min(img.w - x0, bw + pad * 2);
  const h = Math.min(img.h - y0, bh + pad * 2);
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const s = ((y + y0) * img.w + x0) * 4;
    img.data.copy(out, y * w * 4, s, s + w * 4);
  }
  return { w, h, data: out };
}

/* ---------- square: logo di tengah atas warna latar (untuk PWA/Android) ---------- */
function kotak(img, sisi, warnaLatar, skalaLogo) {
  const out = Buffer.alloc(sisi * sisi * 4);
  /* isi latar */
  for (let i = 0; i < sisi * sisi; i++) {
    out[i * 4] = warnaLatar[0];
    out[i * 4 + 1] = warnaLatar[1];
    out[i * 4 + 2] = warnaLatar[2];
    out[i * 4 + 3] = 255;
  }
  /* logo diskalakan lalu dipaste di tengah */
  const target = Math.round(sisi * skalaLogo);
  const kecil = resize(img, target);
  const ox = Math.round((sisi - kecil.w) / 2);
  const oy = Math.round((sisi - kecil.h) / 2);
  for (let y = 0; y < kecil.h; y++) {
    for (let x = 0; x < kecil.w; x++) {
      const si = (y * kecil.w + x) * 4;
      const a = kecil.data[si + 3];
      if (!a) continue;
      const di = ((y + oy) * sisi + (x + ox)) * 4;
      const t = a / 255;
      out[di] = Math.round(kecil.data[si] * t + out[di] * (1 - t));
      out[di + 1] = Math.round(kecil.data[si + 1] * t + out[di + 1] * (1 - t));
      out[di + 2] = Math.round(kecil.data[si + 2] * t + out[di + 2] * (1 - t));
      out[di + 3] = 255;
    }
  }
  return { w: sisi, h: sisi, data: out };
}

const CREAM = [245, 241, 232]; /* #F5F1E8 */
const HIJAU = [74, 124, 63]; /* #4A7C3F */

console.log("Optimalkan logo dari images/logo.png (" + Math.round(fs.statSync(src).size / 1024) + " KB):");
const mentah = bacaPNG(src);
console.log("  sumber mentah " + mentah.w + "x" + mentah.h);

const asli = cropOtomatis(mentah);
console.log("  setelah crop " + asli.w + "x" + asli.h + "  (rasio " + (asli.w / asli.h).toFixed(2) + ":1)");

function simpan(nama, img) {
  const dest = path.join(root, "images", nama);
  tulisPNG(dest, img.w, img.h, img.data);
  console.log("  " + nama + "  " + img.w + "x" + img.h + "  " + Math.round(fs.statSync(dest).size / 1024) + " KB");
}

/* Header/footer: wordmark asli (rasio terjaga, sudah dipotong margin). */
simpan("logo-crop.png", resize(asli, 320));
simpan("logo-256.png", resize(asli, 256));

/* PWA/Android: wajib bujur sangkar. */
simpan("logo-192.png", kotak(asli, 192, CREAM, 0.9));
simpan("logo-512.png", kotak(asli, 512, CREAM, 0.9));
simpan("logo-maskable-512.png", kotak(asli, 512, HIJAU, 0.62));
console.log("Selesai.");
