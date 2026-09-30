/* ==========================================================================
   tools/check-runtime.js - UJI JALAN script.js TANPA BROWSER

   Jalankan:  node tools/check-runtime.js

   Cara kerja: membuat tiruan DOM yang minimal, lalu menjalankan config.js +
   script.js di dalamnya. Kalau ada error saat website pertama dibuka,
   test ini akan langsung menangkapnya.

   Yang diuji:
     - website bisa init tanpa error
     - 20 menu ter-render ke #menu-grid
     - filter kategori terisi
     - keranjang ter-render ke sheet DAN sidebar (dengan id berbeda)
     - galeri, testimoni, FAQ ter-render
     - <title> dan JSON-LD SEO terisi
     - status buka/tutup terisi
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

/* ---------- Kumpulkan id yang ada di index.html ---------- */
const idsHtml = new Set();
{
  const re = /\sid="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) idsHtml.add(m[1]);
}

/* ---------- Tiruan DOM ---------- */
let dibuat = 0;

function classList(el) {
  return {
    add() {},
    remove() {},
    toggle() {},
    contains() {
      return false;
    },
  };
}

function buatEl(tag) {
  dibuat++;
  const el = {
    tagName: String(tag || "div").toUpperCase(),
    _html: "",
    _text: "",
    id: "",
    className: "",
    style: {
      setProperty() {},
      removeProperty() {},
      getPropertyValue() {
        return "";
      },
    },
    dataset: {},
    children: [],
    attrs: {},
    value: "",
    classList: null,
    setAttribute(k, v) {
      this.attrs[k] = String(v);
      if (k === "id") this.id = String(v);
    },
    getAttribute(k) {
      return k in this.attrs ? this.attrs[k] : null;
    },
    removeAttribute(k) {
      delete this.attrs[k];
    },
    appendChild(c) {
      this.children.push(c);
      return c;
    },
    removeChild(c) {
      const i = this.children.indexOf(c);
      if (i >= 0) this.children.splice(i, 1);
      return c;
    },
    addEventListener() {},
    removeEventListener() {},
    querySelector() {
      return buatEl("div");
    },
    querySelectorAll() {
      return [];
    },
    closest() {
      return null;
    },
    contains() {
      return false;
    },
    focus() {},
    blur() {},
    click() {},
    getBoundingClientRect() {
      return { top: 0, left: 0, width: 0, height: 0, right: 0, bottom: 0 };
    },
    scrollIntoView() {},
  };
  el.classList = classList(el);
  Object.defineProperty(el, "innerHTML", {
    get() {
      return this._html;
    },
    set(v) {
      this._html = String(v);
    },
  });
  Object.defineProperty(el, "innerText", {
    get() {
      return this._text;
    },
    set(v) {
      this._text = String(v);
    },
  });
  Object.defineProperty(el, "textContent", {
    get() {
      return this._text;
    },
    set(v) {
      this._text = String(v);
    },
  });
  Object.defineProperty(el, "firstChild", {
    get() {
      return this.children[0] || null;
    },
  });
  return el;
}

const elemen = {};
idsHtml.forEach(function (id) {
  elemen[id] = buatEl("div");
  elemen[id].id = id;
});

const storage = {};

/* Isi keranjang dengan 1 item lebih dulu supaya form pesanan ikut ter-render
   (saat keranjang kosong, buildCartHTML berhenti sebelum bagian form). */
storage["katalog.cart.v1"] = JSON.stringify([
  {
    menuId: 1,
    nama: "Nasi Goreng Spesial",
    harga: 18500,
    foto: "/images/menu/nasi-goreng.jpg",
    varian: "Level Pedas: Pedas Sedang | Topping: Telur",
    catatan: "Tanpa sambal",
    qty: 2,
  },
]);

const documentStub = {
  readyState: "complete",
  title: "",
  documentElement: buatEl("html"),
  body: buatEl("body"),
  head: buatEl("head"),
  /* Disimulasikan di SUBFOLDER ("/repo/") supayaaszet() ikut diuji:
     website harus benar baik di root maupun di GitHub Pages. */
  baseURI: "https://warung.test/repo/",
  currentScript: { src: "https://warung.test/repo/script.js" },
  createElement: (t) => buatEl(t),
  createTextNode: (t) => ({ text: String(t) }),
  getElementById: (id) => (id in elemen ? elemen[id] : null),
  querySelector: () => buatEl("div"),
  querySelectorAll: () => [],
  addEventListener() {},
  removeEventListener() {},
};

const windowStub = {
  document: documentStub,
  location: {
    href: "https://warung.test/index.html",
    protocol: "https:",
    origin: "https://warung.test",
    pathname: "/index.html",
  },
  innerWidth: 1280,
  innerHeight: 800,
  scrollY: 0,
  localStorage: {
    getItem: (k) => (k in storage ? storage[k] : null),
    setItem: (k, v) => {
      storage[k] = String(v);
    },
    removeItem: (k) => {
      delete storage[k];
    },
  },
  addEventListener() {},
  removeEventListener() {},
  scrollTo() {},
  open() {},
  matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
  IntersectionObserver: function () {
    this.observe = () => {};
    this.unobserve = () => {};
    this.disconnect = () => {};
  },
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
  cancelAnimationFrame: () => {},
  getComputedStyle: () => ({ getPropertyValue: () => "" }),
};

/* URL asli (dipakai script.js untuk aset()) + tambahan createObjectURL */
class SandboxURL extends URL {}
SandboxURL.createObjectURL = () => "blob:test";
SandboxURL.revokeObjectURL = () => {};

const sandbox = {
  window: windowStub,
  document: documentStub,
  localStorage: windowStub.localStorage,
  navigator: { userAgent: "node-test", language: "id" },
  location: windowStub.location,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: () => 0, /*interval*/
  clearInterval: () => {},
  requestAnimationFrame: windowStub.requestAnimationFrame,
  cancelAnimationFrame: () => {},
  matchMedia: windowStub.matchMedia,
  IntersectionObserver: windowStub.IntersectionObserver,
  scrollTo: () => {},
  open: () => {},
  Image: function () {},
  Event: function () {},
  CustomEvent: function () {},
  Date: Date,
  Math: Math,
  JSON: JSON,
  TextEncoder: TextEncoder,
  TextDecoder: TextDecoder,
  URL: SandboxURL,
  Blob: typeof Blob !== "undefined" ? Blob : function () {},
  getComputedStyle: windowStub.getComputedStyle,
  fetch: () => Promise.reject(new Error("offline")),
};
sandbox.self = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

/* ---------- Jalankan ---------- */
let error = null;
try {
  vm.runInContext(fs.readFileSync(path.join(root, "config.js"), "utf8"), sandbox, {
    filename: "config.js",
  });

  /* Ganti 2 foto pertama dengan path lokal supaya aset() ikut teruji:
     tanpa garis mula (relatif) dan dengan garis mula (harus ikut folder). */
  if (sandbox.window && sandbox.window.config && sandbox.window.config.menu[1]) {
    sandbox.window.config.menu[0].foto = "images/menu/nasi-goreng.jpg";
    sandbox.window.config.menu[1].foto = "/images/menu/mie-goreng.jpg";
  }

  vm.runInContext(fs.readFileSync(path.join(root, "script.js"), "utf8"), sandbox, {
    filename: "script.js",
  });
} catch (e) {
  error = e;
}

/* ---------- Laporan ---------- */
let gagal = 0;
function cek(nama, kondisi, info) {
  if (kondisi) {
    console.log(" OK     " + nama);
  } else {
    gagal++;
    console.log(" GAGAL  " + nama + (info ? "  -> " + info : ""));
  }
}

console.log("==============================================");
console.log(" UJI RUNTIME script.js (tanpa browser)");
console.log("==============================================");

if (error) {
  gagal++;
  console.log(" GAGAL  website crash saat dijalankan");
  console.log("        " + error.message);
  console.log("        " + (error.stack || "").split("\n").slice(1, 4).join("\n        "));
}

const htmlMenu = (elemen["menu-grid"] && elemen["menu-grid"].innerHTML) || "";
const htmlFilter = (elemen["filter-cats"] && elemen["filter-cats"].innerHTML) || "";
const sheetHtml = (elemen["cart-sheet-inner"] && elemen["cart-sheet-inner"].innerHTML) || "";
const sideHtml = (elemen["cart-sidebar-slot"] && elemen["cart-sidebar-slot"].innerHTML) || "";
const jsonld = (elemen["jsonld-restaurant"] && elemen["jsonld-restaurant"].textContent) || "";
const statusText = (elemen["status-text"] && elemen["status-text"].textContent) || "";
const galeriHtml = (elemen["gallery-grid"] && elemen["gallery-grid"].innerHTML) || "";
const testiHtml = (elemen["testi-track"] && elemen["testi-track"].innerHTML) || "";
const faqHtml = (elemen["faq-list"] && elemen["faq-list"].innerHTML) || "";

cek("tidak ada error saat init", !error, error && error.message);
cek("judul halaman terisi", documentStub.title.length > 10, documentStub.title);
cek("20 menu ter-render", (htmlMenu.match(/data-id="/g) || []).length === 20,
  (htmlMenu.match(/data-id="/g) || []).length + " kartu");
cek("filter kategori terisi", htmlFilter.length > 20, htmlFilter.length + " karakter");
cek("keranjang mobile ter-render", sheetHtml.indexOf("cart-foot") !== -1);
cek("keranjang desktop ter-render", sideHtml.length > 0);
cek("tidak ada id kembar di keranjang",
  sheetHtml.indexOf('id="f-nama"') === -1 && sideHtml.indexOf('id="f-nama"') === -1);
cek("keranjang punya id unik per tampilan",
  (sheetHtml + sideHtml).indexOf('id="sheet-f-nama"') !== -1 ||
  (sheetHtml + sideHtml).indexOf('id="side-f-nama"') !== -1,
  "id f-nama tidak ada sama sekali -> form mungkin tidak dirender karena keranjang kosong");

/* Mode debug: node tools/check-runtime.js --dump cart */
if (process.argv.indexOf("--dump") !== -1) {
  const apa = process.argv[process.argv.indexOf("--dump") + 1] || "cart";
  const sumber = { cart: sheetHtml, side: sideHtml, menu: htmlMenu, filter: htmlFilter };
  console.log("\n=== DUMP " + apa + " (" + (sumber[apa] || "").length + " karakter) ===");
  console.log((sumber[apa] || "").slice(0, 1500));
}
cek("status buka/tutup terisi", statusText.length > 0, JSON.stringify(statusText));
cek("galeri ter-render", galeriHtml.length > 100);
cek("testimoni ter-render", testiHtml.length > 100);
cek("FAQ ter-render", faqHtml.length > 100);
cek("JSON-LD terisi", jsonld.length > 50);
cek("JSON-LD valid", (function () {
  try {
    JSON.parse(jsonld);
    return true;
  } catch (e) {
    return false;
  }
})());

/*-onset: config harus terbaca */
cek("window.config terbaca", !!(sandbox.window && sandbox.window.config));
cek("jumlah menu di config 20",
  sandbox.window && sandbox.window.config && sandbox.window.config.menu.length === 20);

/*-onset: aset() harus menyesuaikan folder (uji hosting subfolder) */
const fotoRelatif = (htmlMenu.match(/src="([^"]*nasi-goreng[^"]*)"/i) || [])[1] || "";
const fotoSlash = (htmlMenu.match(/src="([^"]*mie-goreng[^"]*)"/i) || [])[1] || "";
cek("path foto relatif ikut folder website",
  fotoRelatif === "https://warung.test/repo/images/menu/nasi-goreng.jpg", fotoRelatif);
cek("path foto berawalan / ikut folder (bukan root domain)",
  fotoSlash === "https://warung.test/repo/images/menu/mie-goreng.jpg", fotoSlash);

console.log("---------------------------------------------");
console.log(" Elemen tiruan: " + dibuat + " | html: " + idsHtml.size + " id");
console.log(" Ringkasan: " + gagal + " masalah.");
console.log("==============================================");
process.exit(gagal ? 1 : 0);
