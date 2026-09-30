/* ==========================================================================
   SCRIPT.JS - SEMUA LOGIKA KATALOG WARUNG
   ==========================================================================
   File ini tidak perlu diedit oleh pemilik warung.
   Semua yang perlu diubah ada di config.js.

   DAFTAR BAGIAN:
     1.  Utilitas (format rupiah, escape HTML, gambar cadangan)
     2.  State aplikasi
     3.  Tema terang / gelap
     4.  Info warung & status buka/tutup
     5.  Katalog menu: filter, search, sort, render
     6.  Modal detail menu + varian
     7.  Keranjang belanja (localStorage)
     8.  Checkout WhatsApp
     9.  Galeri, testimoni carousel, FAQ
     10. Toast, navigasi bawah, back to top
     11. Admin Panel + IndexedDB foto + export ZIP
     12. SEO, PWA, dan inisialisasi
   ========================================================================== */

(function () {
  "use strict";

  /* ========================================================================
     1. UTILITAS
     ======================================================================== */

  /** Format angka jadi Rupiah: 25000 -> "Rp 25.000" */
  function formatRupiah(angka) {
    const n = Math.round(Number(angka) || 0);
    return "Rp " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  /** Versi tanpa "Rp" (untuk nomor rekening) */
  function formatNumber(angka) {
    const n = Math.round(Number(angka) || 0);
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "");
  }

  /** Escape HTML supaya teks dari config tidak merusak halaman */
  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /** Ambil elemen by id */
  const $ = (id) => document.getElementById(id);

  /** Inisial huruf untuk avatar testimoni */
  function initials(nama) {
    return String(nama || "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("");
  }

  /** localStorage aman (tidak crash di mode privat) */
  function lsGet(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }
  function lsSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }
  function lsDel(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      /* abaikan */
    }
  }

  /** Debounce: jangan panggil fungsi terlalu sering */
  function debounce(fn, wait) {
    let t;
    return function () {
      const args = arguments;
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), wait);
    };
  }

  /** Gambar cadangan bertema kuning kalau foto gagal dimuat */
  const PLACEHOLDER_SVG =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#FFF3C4"/><stop offset="100%" stop-color="#FFC107"/>' +
        "</linearGradient></defs>" +
        '<rect width="400" height="300" fill="url(#g)"/>' +
        '<text x="200" y="155" font-size="88" text-anchor="middle" fill="#E65100">&#127869;</text>' +
        '<text x="200" y="200" font-size="15" text-anchor="middle" fill="#8D6E63" ' +
        'font-family="sans-serif">Foto belum tersedia</text>' +
        "</svg>"
    );

  /** Atribut onerror untuk <img> supaya otomatis ganti gambar cadangan */
  const ONERR = "this.onerror=null;this.src='" + PLACEHOLDER_SVG + "';";

  /**
   * URL dasar folder website (selalu berakhir dengan "/").
   * Dipakai supaya path aset lokal tetap benar baik di hosting root
   * (https://namadomain.com/) maupun subfolder (https://user.github.io/repo/).
   */
  const BASE = (function () {
    try {
      const s = document.currentScript;
      if (s && s.src) return new URL(".", s.src).href;
    } catch (e) {
      /* diabaikan, pakai fallback di bawah */
    }
    return (document.baseURI || "./").replace(/[?#].*$/, "");
  })();

  /**
   * Ubah path aset lokal menjadi URL absolut.
   * URL internet / data: / blob: dibiarkan apa adanya.
   * Path yang diawali "/" (mis. "/images/menu/x.jpg") dipangkas supaya ikut
   * menyesuaikan folder, bukan mengarah ke root domain.
   */
  function aset(path) {
    const p = String(path || "").trim();
    if (!p) return "";
    if (/^(https?:|data:|blob:|mailto:|tel:|#|\/\/)/i.test(p)) return p;
    try {
      return new URL(p.replace(/^\/+/, ""), BASE).href;
    } catch (e) {
      return p;
    }
  }

  /** Ambil URL foto (mendukung path lokal dan URL internet) */
  function fotoURL(path) {
    const p = path && String(path).trim() ? String(path).trim() : "";
    return p ? aset(p) : PLACEHOLDER_SVG;
  }

  /** Scroll halus ke elemen */
  function scrollKe(sel) {
    const el = typeof sel === "string" ? $(sel.replace(/^#/, "")) : sel;
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /* ========================================================================
     2. STATE APLIKASI
     ======================================================================== */

  const CFG = window.config || {};
  const MENU_CFG = Array.isArray(CFG.menu) ? CFG.menu : [];

  const STATE = {
    kategori: "Semua",
    query: "",
    sort: "rekomendasi",
    cart: [],
    cartOpen: false,
    modalItem: null,
    adminOpen: false,
    adminTab: "menu",
    testiIndex: 0,
    testiTimer: null,
    fotoTargetIdx: -1,
  };

  /** Urutan kategori yang selalu ditampilkan di depan */
  const KATEGORI_TETAP = ["Makanan", "Minuman", "Snack", "Paket", "Promo"];

  /** Kunci localStorage */
  const K_CART = "katalog.cart.v1";
  const K_ORDER = "katalog.order.v1";
  const K_THEME = "katalog.theme.v1";
  const K_DRAFT = "katalog.draft.v1";

  /** Menu aktif = config.js + hasil edit Admin Panel (kalau ada) */
  let MENU = MENU_CFG;

  /** Daftar kategori yang muncul sebagai tab filter */
  function daftarKategori() {
    const set = new Set();
    MENU.forEach((m) => m.kategori && set.add(m.kategori));
    const hasil = ["Semua"];
    KATEGORI_TETAP.forEach((k) => {
      if (set.has(k)) hasil.push(k);
    });
    Array.from(set)
      .filter((k) => hasil.indexOf(k) === -1)
      .sort()
      .forEach((k) => hasil.push(k));
    return hasil;
  }

  /* ========================================================================
     3. TEMA TERANG / GELAP
     ======================================================================== */

  function applyTheme(tema) {
    document.documentElement.setAttribute("data-theme", tema);
    lsSet(K_THEME, tema);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", tema === "dark" ? "#2D1B0E" : "#FFC107");
  }

  function initTheme() {
    const simpan = lsGet(K_THEME, "");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(simpan || (prefersDark ? "dark" : "light"));

    const btn = $("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      const baru =
        document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(baru);
      toast(
        baru === "dark"
          ? "Mode gelap aktif. Lebih nyaman dilihat malam hari."
          : "Mode terang aktif. Good, sunlight!",
        "info"
      );
    });
  }

  /* ========================================================================
     4. INFO WARUNG & STATUS BUKA/TUTUP
     ======================================================================== */

  /** "08:00-21:00" -> { buka: 480, tutup: 1260 } dalam menit */
  function parseJam(teks) {
    if (!teks) return null;
    const m = String(teks).match(
      /(\d{1,2})\s*[:.\s]\s*(\d{2})\s*-\s*(\d{1,2})\s*[:.\s]\s*(\d{2})/
    );
    if (!m) return null;
    return {
      buka: Number(m[1]) * 60 + Number(m[2]),
      tutup: Number(m[3]) * 60 + Number(m[4]),
    };
  }

  /** "08:00-21:00" -> "08.00 - 21.00" (lebih enak dibaca orang Indonesia) */
  function jamPretty(teks) {
    if (!teks) return "";
    return String(teks)
      .split("-")
      .map((b) => b.trim().replace(":", "."))
      .join(" - ");
  }

  /** Jam buka untuk hari ini */
  function jamHariIni() {
    const jb = CFG.jamBuka || {};
    const hari = new Date().getDay(); // 0=Minggu ... 6=Sabtu
    return hari === 0 || hari === 6 ? jb.sabtu_minggu : jb.senin_jumat;
  }

  /** Perbarui lencana BUKA / TUTUP. Dipanggil ulang tiap 30 detik. */
  function updateStatus() {
    const pill = $("status-pill");
    const dot = $("status-dot");
    const teks = $("status-text");
    if (!pill || !dot || !teks) return;

    const jb = CFG.jamBuka || {};
    const hariIni = new Date().getDay();
    const tutupHari = Array.isArray(jb.hariTutup) ? jb.hariTutup : [];
    const jam = jamHariIni();
    const p = parseJam(jam);
    const namaHari = [
      "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
    ][hariIni];

    let buka = false;
    let label = "Jadwal buka belum diatur";

    if (tutupHari.indexOf(hariIni) !== -1) {
      label = "TUTUP hari " + namaHari;
    } else if (p) {
      const sekarang = new Date().getHours() * 60 + new Date().getMinutes();
      // Menangani jam buka yang melewati tengah malam (buka > tutup)
      buka =
        p.buka <= p.tutup
          ? sekarang >= p.buka && sekarang < p.tutup
          : sekarang >= p.buka || sekarang < p.tutup;
      const bagian = jamPretty(jam).split(" - ");
      label = buka
        ? "BUKA sekarang - tutup " + (bagian[1] || "")
        : "TUTUP - buka " + (bagian[0] || "");
    }

    dot.className = "status-dot " + (buka ? "buka" : "tutup");
    teks.textContent = label;
    pill.setAttribute("aria-label", "Status warung: " + label);
  }

  /** Nomor WA untuk ditampilkan (628xx -> 08xx) */
  function formatWaTampil() {
    const wa = String(CFG.whatsapp || "");
    if (wa.startsWith("62")) return "0" + wa.slice(2);
    return wa || "-";
  }

  /** Bangun link wa.me */
  function waLink(pesan) {
    const nomor = String(CFG.whatsapp || "").replace(/\D/g, "");
    if (!nomor) return "#";
    return "https://wa.me/" + nomor + (pesan ? "?text=" + encodeURIComponent(pesan) : "");
  }

  /** Render semua bagian info warung */
  function renderInfo() {
    const nama = CFG.namaWarung || "Warung Saya";
    const tagline = CFG.tagline || "";
    const deskripsi = CFG.deskripsiSingkat || "";

    /* Logo */
    ["brand-logo", "footer-logo"].forEach(function (id) {
      const el = $(id);
      if (!el) return;
      el.setAttribute("onerror", ONERR);
      el.src = fotoURL(CFG.logo);
      el.alt = "Logo " + nama;
    });

    /* Nama & tagline */
    ["brand-name", "footer-name", "footer-name-2"].forEach(function (id) {
      const el = $(id);
      if (el) el.textContent = nama;
    });
    const bt = $("brand-tag");
    if (bt) bt.textContent = tagline;
    const ft = $("footer-tagline");
    if (ft) ft.textContent = tagline;
    const fd = $("footer-desc");
    if (fd) fd.textContent = deskripsi;

    /* Hero */
    const hTitle = $("hero-title");
    if (hTitle) hTitle.textContent = nama;
    const hTag = $("hero-tagline");
    if (hTag) hTag.textContent = tagline;
    const hDesc = $("hero-desc");
    if (hDesc) hDesc.textContent = deskripsi;

    const hImg = $("hero-img");
    if (hImg) {
      hImg.setAttribute("onerror", ONERR);
      hImg.src = fotoURL(CFG.banner);
      hImg.alt = "Suasana " + nama;
    }
    /* Foto banner jadi latar hero lewat CSS variable */
    document.documentElement.style.setProperty(
      "--hero-img",
      'url("' + fotoURL(CFG.banner) + '")'
    );

    /* Jam buka ringkas di hero */
    const hJam = $("hero-jam");
    if (hJam) {
      const jb = CFG.jamBuka || {};
      const ikon =
        '<svg class="h-4 w-4 flex-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
        'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
        'stroke-linejoin="round" aria-hidden="true">' +
        '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';
      hJam.innerHTML =
        '<span class="inline-flex items-center gap-1.5">' + ikon +
        "Senin - Jumat: " + esc(jamPretty(jb.senin_jumat)) + "</span>" +
        '<span class="inline-flex items-center gap-1.5">' + ikon +
        "Sabtu - Minggu: " + esc(jamPretty(jb.sabtu_minggu)) + "</span>";
    }

    /* Teks kartu kecil di hero */
    const cardSub = $("hero-card-sub");
    if (cardSub) {
      const o = CFG.ongkir || {};
      cardSub.textContent = o.aktif
        ? "Gratis ongkir untuk area " + (o.area || "dekat")
        : "Dapur dibuka setiap hari, dari pagi sampai malam";
    }

    /* Telepon */
    const tbn = String(CFG.telepon || "");
    const telNum = tbn.replace(/[^0-9+]/g, "");
    const qTel = $("quick-telepon");
    if (qTel) qTel.href = telNum ? "tel:" + telNum : "#";
    const fTel = $("footer-telepon");
    if (fTel) {
      fTel.href = telNum ? "tel:" + telNum : "#";
      fTel.textContent = tbn || "-";
    }

    /* Peta & rute */
    const mapsLink = CFG.mapsLink || "#";
    ["quick-rute", "btn-rute"].forEach(function (id) {
      const el = $(id);
      if (el) el.href = mapsLink;
    });
    const mapFrame = $("map-frame");
    if (mapFrame) mapFrame.src = CFG.mapsEmbed || "about:blank";

    /* Alamat */
    const fAlamat = $("footer-alamat");
    if (fAlamat) fAlamat.textContent = CFG.alamatLengkap || CFG.alamat || "-";

    /* WhatsApp di footer */
    const fWa = $("footer-wa");
    if (fWa) {
      fWa.textContent = formatWaTampil();
      fWa.href = waLink("");
    }

    /* Tahun */
    const fYear = $("footer-year");
    if (fYear) fYear.textContent = new Date().getFullYear();

    renderInfoRows();
    renderFooterJam();
    renderSosmed();
    updateStatus();
  }

  /** Baris-baris info: alamat, jam buka, telepon, whatsapp */
  function renderInfoRows() {
    const box = $("info-rows");
    if (!box) return;

    const ikon = function (p) {
      return (
        '<span class="info-ico"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
        'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
        'stroke-linejoin="round" aria-hidden="true">' + p + "</svg></span>"
      );
    };

    const jb = CFG.jamBuka || {};
    const tbn = String(CFG.telepon || "");

    const baris = [
      {
        i: ikon('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>'),
        label: "Alamat",
        value: esc(CFG.alamatLengkap || CFG.alamat || "-"),
      },
      {
        i: ikon('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
        label: "Jam Buka",
        value:
          esc("Senin - Jumat: " + jamPretty(jb.senin_jumat)) +
          "<br>" +
          esc("Sabtu - Minggu: " + jamPretty(jb.sabtu_minggu)),
      },
      {
        i: ikon(
          '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>'
        ),
        label: "Telepon",
        value:
          '<a href="tel:' + esc(tbn.replace(/[^0-9+]/g, "")) + '">' +
          esc(tbn || "-") + "</a>",
      },
      {
        i: ikon(
          '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.79a9.9 9.9 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.9 9.9 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.89-9.89 9.89"/>'
        ),
        label: "WhatsApp",
        value:
          '<a href="' + esc(waLink("")) + '" target="_blank" rel="noopener noreferrer">' +
          esc(formatWaTampil()) + "</a>",
      },
    ];

    box.innerHTML = baris
      .map(function (b) {
        return (
          '<div class="info-row">' + b.i +
          '<div class="min-w-0 flex-1">' +
          '<p class="info-label">' + esc(b.label) + "</p>" +
          '<p class="info-value">' + b.value + "</p>" +
          "</div></div>"
        );
      })
      .join("");
  }

  /** Jam buka di footer */
  function renderFooterJam() {
    const ul = $("footer-jam");
    if (!ul) return;
    const jb = CFG.jamBuka || {};
    const namaHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const tutupHari = Array.isArray(jb.hariTutup) ? jb.hariTutup : [];

    let html =
      '<li class="flex items-start justify-between gap-2"><span>Senin - Jumat</span>' +
      '<strong class="shrink-0 text-white">' + esc(jamPretty(jb.senin_jumat) || "-") + "</strong></li>" +
      '<li class="flex items-start justify-between gap-2"><span>Sabtu - Minggu</span>' +
      '<strong class="shrink-0 text-white">' + esc(jamPretty(jb.sabtu_minggu) || "-") + "</strong></li>";

    if (tutupHari.length) {
      html +=
        '<li class="mt-1 text-white/80">Tutup: ' +
        esc(tutupHari.map((d) => namaHari[d]).join(", ")) + "</li>";
    }
    ul.innerHTML = html;
  }

  /** Ikon sosial media di footer */
  function renderSosmed() {
    const box = $("footer-sosmed");
    if (!box) return;
    const s = CFG.sosmed || {};

    const defs = [
      {
        key: "instagram",
        label: "Instagram",
        path:
          '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
      },
      {
        key: "tiktok",
        label: "TikTok",
        path:
          '<path d="M16 3c0 4.4 2.6 6.6 6 7v3c-2.5 0-4.6-.9-6.2-2.4V16a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.2A2.9 2.9 0 1 0 13.2 16V3h2.8z"/>',
      },
      {
        key: "facebook",
        label: "Facebook",
        path:
          '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
      },
      {
        key: "whatsapp",
        label: "WhatsApp",
        path:
          '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
      },
    ];

    box.innerHTML = defs
      .filter(function (d) {
        return d.key === "whatsapp" ? !!CFG.whatsapp : !!s[d.key];
      })
      .map(function (d) {
        const href = d.key === "whatsapp" ? waLink("") : s[d.key];
        return (
          '<a class="sosmed-btn" href="' + esc(href) + '" target="_blank" ' +
          'rel="noopener noreferrer" aria-label="' + esc(d.label) + '" title="' +
          esc(d.label) + '">' +
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
          'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
          'stroke-linejoin="round" aria-hidden="true">' + d.path + "</svg></a>"
        );
      })
      .join("");
  }

  /* ========================================================================
     5. KATALOG MENU: FILTER, SEARCH, SORT, RENDER
     ======================================================================== */

  /** Badge yang dianggap "laris" untuk urutan rekomendasi */
  function badgeBobot(badge) {
    return badge === "Best Seller" || badge === "Promo";
  }

  /** Badge -> HTML */
  function badgeHTML(badge, tersedia) {
    if (tersedia === false) return '<span class="badge badge-habis">HABIS</span>';
    if (!badge) return "";
    const map = {
      "Best Seller": { cls: "badge-best", ikon: "&#128293;" },
      Baru: { cls: "badge-baru", ikon: "&#10024;" },
      Promo: { cls: "badge-promo", ikon: "&#127881;" },
    };
    const m = map[badge];
    if (!m) return '<span class="badge badge-best">' + esc(badge) + "</span>";
    return '<span class="badge ' + m.cls + '">' + m.ikon + " " + esc(badge) + "</span>";
  }

  /** Render tab filter kategori */
  function renderFilterCats() {
    const box = $("filter-cats");
    if (!box) return;
    box.innerHTML = daftarKategori()
      .map(function (k) {
        const n = k === "Semua" ? MENU.length : MENU.filter((m) => m.kategori === k).length;
        return (
          '<button type="button" role="tab" data-kat="' + esc(k) + '" ' +
          'aria-selected="' + (STATE.kategori === k ? "true" : "false") + '" ' +
          'class="filter-chip' + (STATE.kategori === k ? " active" : "") + '">' +
          esc(k) + ' <span class="count">' + n + "</span></button>"
        );
      })
      .join("");
  }

  /** Menu setelah filter kategori + pencarian + urutan */
  function menuTersaring() {
    let list = MENU.slice();

    if (STATE.kategori && STATE.kategori !== "Semua") {
      list = list.filter((m) => m.kategori === STATE.kategori);
    }

    const q = STATE.query.trim().toLowerCase();
    if (q) {
      list = list.filter(function (m) {
        return (
          String(m.nama || "").toLowerCase().indexOf(q) !== -1 ||
          String(m.deskripsi || "").toLowerCase().indexOf(q) !== -1 ||
          String(m.kategori || "").toLowerCase().indexOf(q) !== -1
        );
      });
    }

    switch (STATE.sort) {
      case "termurah":
        list.sort((a, b) => (Number(a.harga) || 0) - (Number(b.harga) || 0));
        break;
      case "termahal":
        list.sort((a, b) => (Number(b.harga) || 0) - (Number(a.harga) || 0));
        break;
      case "bestseller":
        list.sort(function (a, b) {
          const ab = badgeBobot(a.badge) ? 0 : 1;
          const bb = badgeBobot(b.badge) ? 0 : 1;
          if (ab !== bb) return ab - bb;
          return (Number(a.harga) || 0) - (Number(b.harga) || 0);
        });
        break;
      case "nama":
        list.sort((a, b) => String(a.nama).localeCompare(String(b.nama), "id"));
        break;
      default:
        list.sort(function (a, b) {
          const ab = badgeBobot(a.badge) ? 0 : 1;
          const bb = badgeBobot(b.badge) ? 0 : 1;
          if (ab !== bb) return ab - bb;
          return (Number(a.harga) || 0) - (Number(b.harga) || 0);
        });
    }
    return list;
  }

  /** Render grid kartu menu */
  function renderMenu() {
    const grid = $("menu-grid");
    if (!grid) return;
    const list = menuTersaring();

    const count = $("menu-count");
    if (count) {
      const ket = STATE.kategori !== "Semua" ? ' kategori "' + STATE.kategori + '"' : "";
      const cari = STATE.query ? ' untuk "' + STATE.query + '"' : "";
      count.textContent =
        "Menampilkan " + list.length + " menu" + ket + cari + " dari " + MENU.length + " menu.";
    }

    /* ---- Empty state ---- */
    if (!list.length) {
      grid.className = "";
      grid.innerHTML =
        '<div class="empty-state" style="grid-column:1/-1">' +
        '<div class="empty-ico">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
        'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
        'stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>' +
        "<h4>Menu tidak ditemukan</h4>" +
        "<p>Tidak ada menu yang cocok. Coba kata kunci lain atau tampilkan semua menu.</p>" +
        '<button class="btn btn-primary" type="button" id="reset-filter">Tampilkan Semua Menu</button>' +
        "</div>";
      const reset = $("reset-filter");
      if (reset) {
        reset.addEventListener("click", function () {
          STATE.kategori = "Semua";
          STATE.query = "";
          const si = $("search-input");
          if (si) si.value = "";
          const sb = $("search-box");
          if (sb) sb.classList.remove("has-value");
          renderFilterCats();
          renderMenu();
        });
      }
      return;
    }

    grid.className = "menu-grid";

    grid.innerHTML = list
      .map(function (m) {
        const tersedia = m.tersedia !== false;
        const harga = Number(m.harga) || 0;
        const punyaVarian = m.varian && Object.keys(m.varian).length > 0;
        const adaTombolDetail = punyaVarian && tersedia;

        return (
          '<article class="menu-card reveal' + (tersedia ? "" : " habis") +
          '" data-id="' + esc(m.id) + '">' +

          /* Foto 4:3 + badge kategori + badge status */
          '<div class="menu-card-media">' +
          '<img src="' + esc(fotoURL(m.foto)) + '" alt="' + esc(m.nama) + '" ' +
          'loading="lazy" decoding="async" width="400" height="300" onerror="' + ONERR + '">' +
          (m.kategori ? '<span class="chip-cat">' + esc(m.kategori) + "</span>" : "") +
          '<span class="absolute right-2 top-2">' + badgeHTML(m.badge, tersedia) + "</span>" +
          "</div>" +

          '<div class="menu-card-body">' +
          '<h3 class="menu-card-name">' + esc(m.nama) + "</h3>" +
          '<p class="menu-card-desc">' + esc(m.deskripsi || "") + "</p>" +

          '<div class="menu-card-foot">' +
          '<span class="price">' + formatRupiah(harga) +
          (punyaVarian ? '<span class="price-strike">+ varian</span>' : "") + "</span>" +
          '<button class="btn-add" type="button" data-add="' + esc(m.id) + '"' +
          (tersedia ? "" : ' disabled aria-disabled="true"') + ">" +
          (tersedia
            ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
              'stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">' +
              '<path d="M12 5v14M5 12h14"/></svg> Tambah'
            : "HABIS") +
          "</button></div>" +

          (adaTombolDetail
            ? '<button class="mt-1 w-full text-center text-xs font-bold text-amberdark ' +
              'underline-offset-4 hover:underline" type="button" data-detail="' +
              esc(m.id) + '">Lihat pilihan varian</button>'
            : "") +

          "</div></article>"
        );
      })
      .join("");

    observeReveal(grid);
  }

  /** Render ulang filter + grid sekaligus */
  function renderAllMenu() {
    renderFilterCats();
    renderMenu();
  }

  /* ---------- Scroll reveal (Intersection Observer) ---------- */
  let revealObserver = null;

  function initReveal() {
    if (!("IntersectionObserver" in window)) return;
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-visible");
          revealObserver.unobserve(e.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
  }

  function observeReveal(root) {
    const nodes = (root || document).querySelectorAll(".reveal, .reveal-x");
    nodes.forEach(function (n) {
      if (revealObserver) revealObserver.observe(n);
      else n.classList.add("is-visible");
    });
  }

  /* ========================================================================
     6. MODAL DETAIL MENU + VARIAN
     ======================================================================== */

  /** Pilihan varian yang sedang aktif di modal */
  let varianDipilih = null;

  /** Label ramah untuk tiap jenis varian */
  function labelVarian(key) {
    const map = {
      levelPedas: "Level Pedas",
      ukuran: "Ukuran / Porsi",
      topping: "Topping Tambahan",
      opsi: "Pilih Bumbu / Gaya",
    };
    return map[key] || key;
  }

  /** Buka modal detail untuk item tertentu */
  function openModal(id) {
    const item = MENU.find((m) => String(m.id) === String(id));
    if (!item) return;
    if (item.tersedia === false) {
      toast(item.nama + " sedang HABIS. Silakan pilih menu lain ya.", "err");
      return;
    }

    STATE.modalItem = item;
    const root = $("modal-root");
    const panel = $("modal-panel");
    if (!root || !panel) return;

    const harga = Number(item.harga) || 0;
    const v = item.varian || {};

    /* Kumpulkan grup varian.
       Tunggal: levelPedas, ukuran.  Banyak: topping, opsi. */
    const groups = [];
    ["levelPedas", "ukuran"].forEach(function (key) {
      if (Array.isArray(v[key]) && v[key].length) {
        groups.push({ key: key, label: labelVarian(key), multi: false, opsi: v[key] });
      }
    });
    ["topping", "opsi"].forEach(function (key) {
      if (Array.isArray(v[key]) && v[key].length) {
        groups.push({ key: key, label: labelVarian(key), multi: true, opsi: v[key] });
      }
    });

    /* Pilihan awal */
    varianDipilih = { single: {}, multi: {}, qty: 1, catatan: "" };
    groups.forEach(function (g) {
      if (!g.multi) varianDipilih.single[g.key] = g.opsi[0];
    });

    /* ---- Bangun HTML modal ---- */
    let html = "";

    /* Foto */
    html +=
      '<div class="modal-media">' +
      '<img src="' + esc(fotoURL(item.foto)) + '" alt="' + esc(item.nama) + '" ' +
      'onerror="' + ONERR + '" width="800" height="600">' +
      '<button class="modal-close" type="button" id="modal-close" aria-label="Tutup">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">' +
      '<path d="M18 6 6 18M6 6l12 12"/></svg></button></div>';

    /* Konten */
    html += '<div class="modal-body">';

    /* Nama + badge */
    html +=
      '<div class="flex items-start justify-between gap-3">' +
      '<div class="min-w-0"><h3 class="font-head text-xl font-extrabold leading-tight text-brown">' +
      esc(item.nama) + "</h3>" +
      '<p class="mt-1 text-sm text-muted">' + esc(item.kategori || "") + "</p></div>" +
      badgeHTML(item.badge, item.tersedia) +
      "</div>";

    /* Deskripsi lengkap */
    html +=
      '<p class="mt-2.5 text-sm leading-relaxed text-brown/85">' +
      esc(item.deskripsi || "") + "</p>";

    /* Harga dasar */
    html +=
      '<div class="mt-3 flex items-baseline gap-2">' +
      '<span class="price text-2xl" id="modal-harga">' + formatRupiah(harga) + "</span>" +
      "</div>";

    /* Grup varian */
    groups.forEach(function (g) {
      html +=
        '<div class="varian-group"><p class="varian-label">' + esc(g.label) +
        (g.multi
          ? ' <span class="normal-case tracking-normal font-medium text-muted">(boleh pilih lebih dari satu)</span>'
          : "") +
        "</p>";

      if (g.multi) {
        html += '<div class="opt-cards">';
        g.opsi.forEach(function (o) {
          const nama = typeof o === "string" ? o : o.nama;
          const h = typeof o === "string" ? 0 : Number(o.harga) || 0;
          html +=
            '<label class="opt-card">' +
            '<input type="checkbox" data-multi="' + esc(g.key) + '" data-val="' +
            esc(nama) + '">' +
            '<span class="oc-name">' + esc(nama) + "</span>" +
            (h > 0 ? '<span class="oc-price">+' + formatRupiah(h) + "</span>" : "") +
            "</label>";
        });
        html += "</div>";
      } else {
        html += '<div class="opt-chips">';
        g.opsi.forEach(function (o, i) {
          html +=
            '<button type="button" class="opt-chip' + (i === 0 ? " active" : "") + '" ' +
            'data-single="' + esc(g.key) + '" data-val="' + esc(o) + '">' +
            esc(o) + "</button>";
        });
        html += "</div>";
      }
      html += "</div>";
    });

    /* Catatan khusus */
    html +=
      '<div class="varian-group"><p class="varian-label">Catatan Khusus ' +
      '<span class="normal-case tracking-normal font-medium text-muted">(opsional)</span></p>' +
      '<textarea class="textarea" id="modal-catatan" rows="2" ' +
      'placeholder="Contoh: tanpa bawang, sambal dipisah, es sedikit icing..."></textarea></div>';

    /* Jumlah */
    html +=
      '<div class="mt-5 flex items-center gap-3">' +
      '<span class="varian-label mb-0">Jumlah</span>' +
      '<div class="qty">' +
      '<button type="button" data-qty="min" aria-label="Kurangi jumlah">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">' +
      '<path d="M5 12h14"/></svg></button>' +
      '<span class="qty-val" id="modal-qty">1</span>' +
      '<button type="button" data-qty="max" aria-label="Tambah jumlah">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">' +
      '<path d="M12 5v14M5 12h14"/></svg></button></div></div>';

    /* Tombol tambah */
    html +=
      '<button class="btn btn-primary btn-block btn-lg mt-4" type="button" id="modal-add">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>' +
      '<path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>' +
      '</svg>Tambah ke Keranjang <span id="modal-total"></span></button>';

    html += "</div>";

    panel.innerHTML = html;
    root.classList.add("open");
    document.body.classList.add("sheet-open");
    pasangEventModal(item, groups, harga);

    const closeBtn = $("modal-close");
    if (closeBtn) closeBtn.focus();
  }

  /** Total harga topping/menu tambahan yang sedang dipilih (per 1 porsi) */
  function toppingTotal(item) {
    if (!varianDipilih) return 0;
    const v = (item && item.varian) || {};
    let tambahan = 0;
    Object.keys(varianDipilih.multi).forEach(function (key) {
      const pilih = varianDipilih.multi[key] || [];
      const daftar = v[key] || [];
      pilih.forEach(function (nama) {
        const o = daftar.find(function (x) {
          return String(typeof x === "string" ? x : x.nama) === nama;
        });
        if (o && typeof o !== "string") tambahan += Number(o.harga) || 0;
      });
    });
    return tambahan;
  }

  /** Hitung total harga (base + topping) x qty */
  function hitungTotal(item, hargaDasar) {
    if (!varianDipilih) return hargaDasar;
    return (hargaDasar + toppingTotal(item)) * varianDipilih.qty;
  }

  /** Event handler di dalam modal */
  function pasangEventModal(item, groups, harga) {
    const panel = $("modal-panel");

    const cb = $("modal-close");
    if (cb) cb.addEventListener("click", closeModal);

    /* Pilihan tunggal (chip) */
    panel.querySelectorAll("[data-single]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        const key = chip.getAttribute("data-single");
        varianDipilih.single[key] = chip.getAttribute("data-val");
        panel.querySelectorAll('[data-single="' + key + '"]').forEach(function (c) {
          c.classList.toggle("active", c === chip);
        });
      });
    });

    /* Pilihan banyak (checkbox) */
    panel.querySelectorAll("[data-multi]").forEach(function (cbx) {
      cbx.addEventListener("change", function () {
        const key = cbx.getAttribute("data-multi");
        const val = cbx.getAttribute("data-val");
        if (!varianDipilih.multi[key]) varianDipilih.multi[key] = [];
        if (cbx.checked) {
          if (varianDipilih.multi[key].indexOf(val) === -1) varianDipilih.multi[key].push(val);
        } else {
          varianDipilih.multi[key] = varianDipilih.multi[key].filter((x) => x !== val);
        }
        const card = cbx.closest(".opt-card");
        if (card) card.classList.toggle("active", cbx.checked);
        updateModalTotal();
      });
    });

    /* Jumlah */
    panel.querySelectorAll("[data-qty]").forEach(function (b) {
      b.addEventListener("click", function () {
        const arah = b.getAttribute("data-qty");
        varianDipilih.qty = Math.max(
          1,
          Math.min(99, varianDipilih.qty + (arah === "max" ? 1 : -1))
        );
        const q = $("modal-qty");
        if (q) q.textContent = varianDipilih.qty;
        updateModalTotal();
      });
    });

    /* Catatan */
    const nota = $("modal-catatan");
    if (nota) {
      nota.addEventListener("input", function () {
        varianDipilih.catatan = nota.value;
      });
    }

    /* Tombol tambah */
    const add = $("modal-add");
    if (add) add.addEventListener("click", function () { tambahDariModal(item, harga); });

    updateModalTotal();
  }

  /** Perbarui label total pada tombol tambah */
  function updateModalTotal() {
    const el = $("modal-total");
    if (!el || !STATE.modalItem) return;
    el.textContent =
      "(" + formatRupiah(hitungTotal(STATE.modalItem, Number(STATE.modalItem.harga) || 0)) + ")";
  }

  /** Masukkan item dari modal ke keranjang */
  function tambahDariModal(item, harga) {
    const label = [];

    Object.keys(varianDipilih.single).forEach(function (key) {
      const val = varianDipilih.single[key];
      if (val) label.push(labelVarian(key) + ": " + val);
    });
    Object.keys(varianDipilih.multi).forEach(function (key) {
      const arr = varianDipilih.multi[key] || [];
      if (arr.length) label.push(labelVarian(key) + ": " + arr.join(", "));
    });

    /* PENTING: harga yang disimpan ke keranjang harus sudah termasuk topping,
       supaya subtotal, ongkir, dan pesan WhatsApp selalu benar. */
    tambahKeCart({
      menuId: item.id,
      nama: item.nama,
      harga: (Number(harga) || 0) + toppingTotal(item),
      foto: item.foto,
      varian: label.join(" | "),
      catatan: (varianDipilih.catatan || "").trim(),
      qty: varianDipilih.qty,
    });

    closeModal();
  }

  /** Tutup modal */
  function closeModal() {
    const root = $("modal-root");
    if (root) root.classList.remove("open");
    document.body.classList.remove("sheet-open");
    STATE.modalItem = null;
    varianDipilih = null;
  }

  function initModal() {
    const backdrop = $("modal-backdrop");
    if (backdrop) backdrop.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if ($("modal-root") && $("modal-root").classList.contains("open")) closeModal();
    });
  }

  /* ========================================================================
     7. KERANJANG BELANJA  (disimpan di localStorage)
     ======================================================================== */

  /** Muat keranjang dari localStorage */
  function loadCart() {
    try {
      const arr = JSON.parse(lsGet(K_CART, "[]"));
      STATE.cart = Array.isArray(arr) ? arr.filter((x) => x && x.menuId) : [];
    } catch (e) {
      STATE.cart = [];
    }
  }

  function saveCart() {
    lsSet(K_CART, JSON.stringify(STATE.cart));
  }

  /** Kunci unik: id + varian + catatan, supaya tiap kombinasi baris sendiri */
  function cartKey(item) {
    return item.menuId + "::" + (item.varian || "") + "::" + (item.catatan || "");
  }

  /** Jumlah seluruh item */
  function totalItem() {
    return STATE.cart.reduce((s, x) => s + (Number(x.qty) || 0), 0);
  }

  /** Subtotal (belum termasuk ongkir) */
  function subtotal() {
    return STATE.cart.reduce(
      (s, x) => s + (Number(x.harga) || 0) * (Number(x.qty) || 0),
      0
    );
  }

  /** Ongkos kirim sesuai config */
  function hitungOngkir() {
    const o = CFG.ongkir || {};
    if (!o.aktif || ORDER.tipe !== "Delivery") return 0;
    if (ongkirGratis()) return 0;
    return Number(o.nominal) || 0;
  }

  /** True kalau dapat gratis ongkir */
  function ongkirGratis() {
    const o = CFG.ongkir || {};
    return !!(
      o.aktif &&
      o.gratisDiatas > 0 &&
      ORDER.tipe === "Delivery" &&
      subtotal() >= o.gratisDiatas
    );
  }

  /** Tambah item ke keranjang */
  function tambahKeCart(item) {
    const key = cartKey(item);
    const found = STATE.cart.find((x) => cartKey(x) === key);
    if (found) {
      found.qty = Math.min(99, (Number(found.qty) || 0) + item.qty);
    } else {
      STATE.cart.push({
        menuId: item.menuId,
        nama: item.nama,
        harga: Number(item.harga) || 0,
        foto: item.foto,
        varian: item.varian || "",
        catatan: item.catatan || "",
        qty: Math.max(1, Number(item.qty) || 1),
      });
    }
    saveCart();
    renderCart();
    toast(item.nama + " masuk ke keranjang", "ok");
  }

  /** Ubah qty (0 = hapus) */
  function setQty(key, qty) {
    const item = STATE.cart.find((x) => cartKey(x) === key);
    if (!item) return;
    item.qty = Math.max(0, Math.min(99, qty));
    if (item.qty === 0) STATE.cart = STATE.cart.filter((x) => cartKey(x) !== key);
    saveCart();
    renderCart();
  }

  function hapusItem(key) {
    const item = STATE.cart.find((x) => cartKey(x) === key);
    STATE.cart = STATE.cart.filter((x) => cartKey(x) !== key);
    saveCart();
    renderCart();
    if (item) toast(item.nama + " dihapus dari keranjang", "info");
  }

  function kosongkanCart() {
    if (!STATE.cart.length) return;
    STATE.cart = [];
    saveCart();
    renderCart();
    toast("Keranjang dikosongkan", "info");
  }

  /** Data pesanan (dipakai form keranjang dan generate pesan WA) */
  const ORDER = {
    tipe: "Take Away",
    nama: "",
    meja: "",
    alamat: "",
    catatan: "",
  };

  function loadOrder() {
    try {
      const o = JSON.parse(lsGet(K_ORDER, "{}"));
      if (o && typeof o === "object") {
        ORDER.tipe = o.tipe || "Take Away";
        ORDER.nama = o.nama || "";
        ORDER.meja = o.meja || "";
        ORDER.alamat = o.alamat || "";
        ORDER.catatan = o.catatan || "";
      }
    } catch (e) {
      /* abaikan */
    }
  }
  function saveOrder() {
    lsSet(K_ORDER, JSON.stringify(ORDER));
  }

  /** Render keranjang ke sheet (mobile) dan sidebar (desktop) */
  function renderCart() {
    const inner = $("cart-sheet-inner");
    const slot = $("cart-sidebar-slot");
    if (inner) inner.innerHTML = buildCartHTML(true);
    if (slot) slot.innerHTML = buildCartHTML(false);

    /* Badge jumlah item */
    const n = totalItem();
    ["cart-fab-badge", "bn-cart-dot"].forEach(function (id) {
      const el = $(id);
      if (!el) return;
      el.textContent = n;
      el.classList.toggle("hidden", n === 0);
    });

    /* Tombol keranjang mengambang */
    const fab = $("cart-fab");
    if (fab) {
      if (n === 0) fab.classList.add("hidden");
      else {
        fab.classList.remove("hidden");
        const ft = $("cart-fab-total");
        if (ft) ft.textContent = formatRupiah(subtotal());
      }
    }

    /* Keranjang kosong -> tutup sheet */
    if (n === 0 && STATE.cartOpen) closeCart();

    pasangEventCart();
  }

  /** Ikon svg kecil (dipakai ulang) */
  function svg(p, extra) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true"' + (extra || "") + ">" + p + "</svg>"
    );
  }
  function svgIsi(extra) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" ' +
      'aria-hidden="true"' + (extra || "") + ">"
    );
  }

  /**
   * Keranjang muncul di dua tempat sekaligus (bottom sheet mobile + sidebar
   * desktop), jadi setiap id diberi prefiks berbeda supaya tidak kembar.
   */
  const PRE_SHEET = "sheet-";
  const PRE_SIDE = "side-";

  /** Ambil elemen dari KEDUA versi keranjang sekaligus. */
  function $keduaVersi(nama) {
    return document.querySelectorAll("#" + PRE_SHEET + nama + ", #" + PRE_SIDE + nama);
  }

  /**
   * Bangun HTML keranjang.
   * @param {boolean} sheet - true = bottom sheet (mobile), false = sidebar (desktop)
   */
  function buildCartHTML(sheet) {
    const pre = sheet ? PRE_SHEET : PRE_SIDE;
    const cid = function (nama) {
      return pre + nama;
    };
    const n = totalItem();
    const sub = subtotal();
    const ongkir = hitungOngkir();
    const total = sub + ongkir;
    const o = CFG.ongkir || {};
    let html = "";

    /* ---- Kepala ---- */
    html +=
      '<div class="cart-head"><h3>Keranjang</h3>' +
      '<span class="count">' + n + " item</span>" +
      (n > 0 && sheet
        ? '<button class="ml-auto mr-1 text-xs font-bold text-muted hover:text-promo" ' +
          'type="button" id="' + cid("cart-clear") + '">Kosongkan</button>'
        : "") +
      (sheet
        ? '<button class="cart-close" type="button" id="' + cid("cart-close") + '" ' +
          'aria-label="Tutup keranjang">' +
          svg('<path d="M18 6 6 18M6 6l12 12"/>', ' class="h-5 w-5"') +
          "</button>"
        : "") +
      "</div>";

    /* ---- Body (scroll) ---- */
    html += '<div class="cart-body">';

    /* EMPTY STATE */
    if (n === 0) {
      html +=
        '<div class="empty-state"><div class="empty-ico">' +
        svg(
          '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>' +
            '<path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>'
        ) +
        "</div><h4>Keranjang masih kosong</h4>" +
        "<p>Yuk pesan dulu! Pilih menu favoritmu di katalog.</p>" +
        '<button class="btn btn-primary" type="button" id="' + cid("cart-browse") +
        '">Lihat Menu</button></div></div>';
      return html + '<div class="cart-foot"></div>';
    }

    /* DAFTAR ITEM */
    STATE.cart.forEach(function (item) {
      const key = cartKey(item);
      const jumlah = (Number(item.harga) || 0) * (Number(item.qty) || 0);
      const kunciEsc = esc(key);

      html +=
        '<div class="cart-item" data-key="' + kunciEsc + '">' +
        '<img class="cart-item-media" src="' + esc(fotoURL(item.foto)) + '" alt="' +
        esc(item.nama) + '" loading="lazy" onerror="' + ONERR + '">' +
        '<div class="min-w-0">' +
        '<p class="cart-item-name">' + esc(item.nama) + "</p>" +
        (item.varian ? '<p class="cart-item-var">' + esc(item.varian) + "</p>" : "") +
        (item.catatan ? '<p class="cart-item-note">"' + esc(item.catatan) + '"</p>' : "") +
        '<p class="mt-1 text-xs font-semibold text-muted">' + formatRupiah(item.harga) +
        " / item</p></div>" +
        '<div class="cart-item-right"><span class="cart-item-price">' + formatRupiah(jumlah) + "</span>" +
        '<div class="flex items-center gap-1.5"><div class="qty">' +
        '<button type="button" data-cart-minus="' + kunciEsc + '" aria-label="Kurangi ' +
        esc(item.nama) + '">' + svg('<path d="M5 12h14"/>') + "</button>" +
        '<span class="qty-val">' + (Number(item.qty) || 0) + "</span>" +
        '<button type="button" data-cart-plus="' + kunciEsc + '" aria-label="Tambah ' +
        esc(item.nama) + '">' + svg('<path d="M12 5v14M5 12h14"/>') + "</button></div>" +
        '<button class="cart-item-del" type="button" data-cart-del="' + kunciEsc +
        '" aria-label="Hapus ' + esc(item.nama) + '">' +
        svg('<path d="M18 6 6 18M6 6l12 12"/>') + "</button>" +
        "</div></div></div>";
    });

    /* FORM PESANAN */
    html += '<div class="mt-4">';

    /* Tipe pesanan */
    const tipeList = [
      { v: "Dine-in", l: "Dine-in", p: '<path d="M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2M7 2v20M17 2v8a2 2 0 0 0 2 2h-4a2 2 0 0 1-2-2V2M9 16.5a2.5 2.5 0 0 0 2.5 2.5H14"/>' },
      { v: "Take Away", l: "Take Away", p: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>' },
      { v: "Delivery", l: "Delivery", p: '<circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M9 18h6M15 6h3a2 2 0 0 1 2 2v7"/>' },
    ];
    html += '<p class="varian-label">Tipe Pesanan <span class="req">*</span></p><div class="type-picker">';
    tipeList.forEach(function (t) {
      html +=
        '<button type="button" class="type-opt' + (ORDER.tipe === t.v ? " active" : "") +
        '" data-type="' + esc(t.v) + '">' + svg(t.p) + "<span>" + esc(t.l) + "</span></button>";
    });
    html += "</div>";

    /* Nama pelanggan */
    html +=
      '<div class="field mt-3"><label for="' + cid("f-nama") +
      '">Nama Pelanggan <span class="req">*</span></label>' +
      '<input class="input" id="' + cid("f-nama") +
      '" type="text" placeholder="Contoh: Budi Santoso" ' +
      'autocomplete="name" value="' + esc(ORDER.nama) + '">' +
      '<p class="err-msg" id="' + cid("e-nama") +
      '">' + svg('<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>', ' class="h-3 w-3"') +
      "<span>Nama pelanggan wajib diisi.</span></p></div>";

    /* Nomor meja (hanya Dine-in) */
    if (ORDER.tipe === "Dine-in") {
      html +=
        '<div class="field"><label for="' + cid("f-meja") + '">Nomor Meja</label>' +
        '<input class="input" id="' + cid("f-meja") +
        '" type="text" inputmode="numeric" placeholder="Contoh: 5" value="' +
        esc(ORDER.meja) + '">' +
        '<p class="hint">' + svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>', ' class="h-3 w-3"') +
        "Boleh dikosongkan kalau belum tahu.</p></div>";
    }

    /* Alamat (hanya Delivery) */
    if (ORDER.tipe === "Delivery") {
      html +=
        '<div class="field"><label for="' + cid("f-alamat") +
        '">Alamat Pengiriman <span class="req">*</span></label>' +
        '<textarea class="textarea" id="' + cid("f-alamat") +
        '" rows="2" placeholder="Contoh: Jl. Melati No. 10, RT 02 / RW 05, Jakarta Timur">' +
        esc(ORDER.alamat) + "</textarea>" +
        '<p class="hint">' + svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>', ' class="h-3 w-3"') +
        "Sertakan patokan agar kurir tidak nyasar." +
        (o.minOrder > 0 ? " Minimal order " + formatRupiah(o.minOrder) + "." : "") +
        "</p>" +
        '<p class="err-msg" id="' + cid("e-alamat") +
        '">' + svg('<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>', ' class="h-3 w-3"') +
        "<span>Alamat wajib diisi untuk pesanan delivery.</span></p></div>";
    }

    /* Catatan tambahan */
    html +=
      '<div class="field"><label for="' + cid("f-catatan") + '">Catatan Tambahan</label>' +
      '<textarea class="textarea" id="' + cid("f-catatan") +
      '" rows="2" placeholder="Contoh: tolong cepat ya, sambal secukupnya">' +
      esc(ORDER.catatan) + "</textarea></div>";

    html += "</div></div>"; /* tutup form + cart-body */

    /* ---- KAKI: RINGKASAN + TOMBOL WHATSAPP ---- */
    html += '<div class="cart-foot">';

    html +=
      '<div class="total-row"><span class="lbl">Subtotal (' + n + " item)</span>" +
      '<span class="val">' + formatRupiah(sub) + "</span></div>";

    if (o.aktif && ORDER.tipe === "Delivery") {
      const labelOngkir = "Ongkir" + (o.area ? " (" + o.area + ")" : "");
      if (ongkirGratis()) {
        html +=
          '<div class="total-row free"><span class="lbl">' + esc(labelOngkir) +
          '</span><span class="val">GRATIS</span></div>';
      } else {
        html +=
          '<div class="total-row"><span class="lbl">' + esc(labelOngkir) +
          '</span><span class="val">' + formatRupiah(ongkir) + "</span></div>";
      }
    }

    html +=
      '<div class="total-row grand"><span class="lbl">Total Bayar</span>' +
      '<span class="val">' + formatRupiah(total) + "</span></div>";

    /* Info pembayaran (opsional) */
    const rek = CFG.rekening || {};
    if ((rek.bank && rek.nomor) || rek.qris) {
      html +=
        '<div class="pay-box"><p class="pb-title">' +
        svg('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>', ' class="h-4 w-4"') +
        "Info Pembayaran</p>";
      if (rek.bank && rek.nomor) {
        html +=
          '<div class="pb-line"><span>Bank</span><strong>' + esc(rek.bank) + "</strong></div>" +
          '<div class="pb-line"><span>No. Rekening</span><strong>' +
          esc(formatNumber(rek.nomor)) + "</strong></div>" +
          '<div class="pb-line"><span>Atas Nama</span><strong>' +
          esc(rek.atasNama || "-") + "</strong></div>";
      }
      if (rek.qris) {
        html +=
          '<img class="pay-qris" src="' + esc(rek.qris) + '" alt="QRIS pembayaran" ' +
          'loading="lazy" onerror="this.style.display=\'none\'">';
      }
      if (rek.catatan) html += '<p class="pay-note">' + esc(rek.catatan) + "</p>";
      html += "</div>";
    }

    /* Tombol WhatsApp */
    html +=
      '<button class="btn btn-wa btn-block btn-lg mt-3" type="button" id="' + cid("checkout-wa") +
      '">' +
      svgIsi(' class="h-5 w-5"') +
      '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.79a9.9 9.9 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.9 9.9 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.89-9.89 9.89"/>' +
      "</svg>Pesan via WhatsApp</button>";

    html +=
      '<p class="mt-2 text-center text-[0.72rem] leading-relaxed text-muted">' +
      "Tekan tombol di atas, WhatsApp terbuka dengan pesan rapi. Tinggal tekan Kirim.</p>";

    html += "</div>";
    return html;
  }

  /** Pasang event handler keranjang (setiap kali render) */
  function pasangEventCart() {
    /* Elemen ini ada dua kali (mobile + desktop), jadi dipasang ke keduanya. */
    $keduaVersi("cart-close").forEach(function (b) {
      b.addEventListener("click", closeCart);
    });
    $keduaVersi("cart-clear").forEach(function (b) {
      b.addEventListener("click", kosongkanCart);
    });
    $keduaVersi("cart-browse").forEach(function (b) {
      b.addEventListener("click", function () {
        closeCart();
        scrollKe("#menu");
      });
    });

    document.querySelectorAll("[data-cart-minus]").forEach(function (b) {
      b.addEventListener("click", function () {
        const key = b.getAttribute("data-cart-minus");
        const item = STATE.cart.find((x) => cartKey(x) === key);
        if (item) setQty(key, (Number(item.qty) || 0) - 1);
      });
    });
    document.querySelectorAll("[data-cart-plus]").forEach(function (b) {
      b.addEventListener("click", function () {
        const key = b.getAttribute("data-cart-plus");
        const item = STATE.cart.find((x) => cartKey(x) === key);
        if (item) setQty(key, (Number(item.qty) || 0) + 1);
      });
    });
    document.querySelectorAll("[data-cart-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        hapusItem(b.getAttribute("data-cart-del"));
      });
    });
    document.querySelectorAll("[data-type]").forEach(function (b) {
      b.addEventListener("click", function () {
        ORDER.tipe = b.getAttribute("data-type");
        saveOrder();
        renderCart();
      });
    });

    /* Field form ada di mobile + desktop, jadi event dipasang ke keduanya.
       Isinya disimpan ke satu objek ORDER yang sama. */
    [
      { id: "f-nama", err: "e-nama", kunci: "nama" },
      { id: "f-meja", err: "", kunci: "meja" },
      { id: "f-alamat", err: "e-alamat", kunci: "alamat" },
      { id: "f-catatan", err: "", kunci: "catatan" },
    ].forEach(function (f) {
      $keduaVersi(f.id).forEach(function (el) {
        el.addEventListener("input", function () {
          ORDER[f.kunci] = el.value;
          saveOrder();
          el.classList.remove("invalid");
          if (f.err) {
            $keduaVersi(f.err).forEach(function (p) {
              p.classList.remove("show");
            });
          }
        });
      });
    });

    $keduaVersi("checkout-wa").forEach(function (b) {
      b.addEventListener("click", checkoutWhatsApp);
    });
  }

  function openCart() {
    const root = $("cart-root");
    if (!root) return;
    STATE.cartOpen = true;
    renderCart();
    root.classList.add("open");
    document.body.classList.add("sheet-open");
  }

  function closeCart() {
    const root = $("cart-root");
    if (!root) return;
    STATE.cartOpen = false;
    root.classList.remove("open");
    document.body.classList.remove("sheet-open");
  }

  function initCartUI() {
    const fab = $("cart-fab");
    if (fab) fab.addEventListener("click", openCart);
    const bn = $("bn-cart");
    if (bn) bn.addEventListener("click", openCart);
    const bd = $("cart-backdrop");
    if (bd) bd.addEventListener("click", closeCart);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && STATE.cartOpen) closeCart();
    });
  }

  /* ========================================================================
     8. CHECKOUT WHATSAPP
     ======================================================================== */

  /** Susun teks pesan WhatsApp yang rapi */
  function buatPesanWA() {
    const namaWarung = CFG.namaWarung || "Warung";
    const sub = subtotal();
    const ongkir = hitungOngkir();
    const total = sub + ongkir;
    const L = [];

    L.push("*Halo " + namaWarung + ", saya mau pesan:*");
    L.push("");

    STATE.cart.forEach(function (item, i) {
      const jumlah = (Number(item.harga) || 0) * (Number(item.qty) || 0);
      const detail = item.varian ? " (" + item.varian + ")" : "";
      L.push(i + 1 + ". " + item.nama + detail + " x" + item.qty + " = " + formatRupiah(jumlah));
      if (item.catatan) L.push("   _Catatan:_ " + item.catatan);
    });

    L.push("");
    if (ongkir > 0) {
      L.push("Subtotal: " + formatRupiah(sub));
      L.push("Ongkir: " + formatRupiah(ongkir));
    }
    L.push("*Total: " + formatRupiah(total) + "*");
    L.push("");
    L.push("*Nama:* " + (ORDER.nama.trim() || "-"));
    L.push("*Tipe:* " + ORDER.tipe);

    if (ORDER.tipe === "Dine-in" && ORDER.meja.trim()) L.push("*No. Meja:* " + ORDER.meja.trim());
    if (ORDER.tipe === "Delivery" && ORDER.alamat.trim()) L.push("*Alamat:* " + ORDER.alamat.trim());
    if (ORDER.catatan.trim()) L.push("*Catatan:* " + ORDER.catatan.trim());

    const rek = CFG.rekening || {};
    if (rek.bank && rek.nomor && ORDER.tipe === "Delivery") {
      L.push("");
      L.push(
        "_Pembayaran: " + rek.bank + " " + formatNumber(rek.nomor) +
          " a.n. " + (rek.atasNama || "-") + "_"
      );
    }

    L.push("");
    L.push("_Dikirim dari katalog digital " + namaWarung + "_");
    return L.join("\n");
  }

  /** Validasi form pesanan */
  function validasiOrder() {
    let ok = true;

    /* Tandai error di kedua versi keranjang sekaligus */
    const tandai = function (idField, idErr, benar) {
      $keduaVersi(idField).forEach(function (el) {
        el.classList.toggle("invalid", !benar);
      });
      if (idErr) {
        $keduaVersi(idErr).forEach(function (p) {
          p.classList.toggle("show", !benar);
        });
      }
    };

    tandai("f-nama", "e-nama", !!ORDER.nama.trim());

    if (!ORDER.nama.trim()) ok = false;

    if (ORDER.tipe === "Delivery") {
      const adaAlamat = !!ORDER.alamat.trim();
      tandai("f-alamat", "e-alamat", adaAlamat);
      if (!adaAlamat) ok = false;

      const o = CFG.ongkir || {};
      if (o.minOrder > 0 && subtotal() < o.minOrder) {
        toast("Minimal order delivery " + formatRupiah(o.minOrder) + " ya kak.", "err");
        ok = false;
      }
    }

    if (!ok) toast("Lengkapi dulu data pesanan yang ditandai merah.", "err");
    return ok;
  }

  /** Aksi tombol "Pesan via WhatsApp" */
  function checkoutWhatsApp() {
    if (!STATE.cart.length) {
      toast("Keranjang masih kosong. Pilih menu dulu ya!", "err");
      return;
    }
    if (!String(CFG.whatsapp || "").replace(/\D/g, "")) {
      toast("Nomor WhatsApp belum diatur di config.js.", "err");
      return;
    }
    if (!validasiOrder()) return;

    const pesan = buatPesanWA();
    window.open(waLink(pesan), "_blank", "noopener");

    /* Simpan pesanan terakhir, lalu kosongkan keranjang supaya pelanggan
       tidak mengirim pesanan lama dua kali. Kalau batal kirim, tinggal
       pilih menu lagi (riwayat pesanan tetap ada di browser). */
    lsSet(
      "katalog.pesanan.terakhir",
      JSON.stringify({
        waktu: new Date().toISOString(),
        total: subtotal() + hitungOngkir(),
        isi: pesan,
      })
    );

    STATE.cart = [];
    saveCart();
    renderCart();
    closeCart();

    toast(
      "WhatsApp terbuka. Tekan Kirim untuk konfirmasi, keranjang sudah dikosongkan.",
      "ok",
      4600
    );
  }

  /* ========================================================================
     9. GALERI, TESTIMONI CAROUSEL, FAQ
     ======================================================================== */

  function renderGaleri() {
    const box = $("gallery-grid");
    if (!box) return;
    const g = Array.isArray(CFG.galeri) ? CFG.galeri : [];
    if (!g.length) {
      box.innerHTML = "";
      return;
    }
    box.innerHTML = g
      .map(function (item) {
        const judul = typeof item === "string" ? "" : item.judul || "";
        const foto = typeof item === "string" ? item : item.foto;
        return (
          '<figure class="gallery-item reveal">' +
          '<img src="' + esc(fotoURL(foto)) + '" alt="' + esc(judul || "Suasana warung") +
          '" loading="lazy" decoding="async" onerror="' + ONERR + '">' +
          (judul ? '<figcaption class="gallery-cap">' + esc(judul) + "</figcaption>" : "") +
          "</figure>"
        );
      })
      .join("");
    observeReveal(box);
  }

  /* ---------- Testimoni ---------- */
  const TESTI_INTERVAL = 4500;

  function starsHTML(rating) {
    let h = '<span class="stars" aria-label="Rating ' + rating + ' dari 5">';
    for (let i = 1; i <= 5; i++) {
      const filled = i <= Math.round(rating);
      h +=
        '<svg class="' + (filled ? "" : "empty") + '" viewBox="0 0 24 24" fill="' +
        (filled ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="1.5" ' +
        'stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' +
        "</svg>";
    }
    return h + "</span>";
  }

  function renderTestimoni() {
    const track = $("testi-track");
    if (!track) return;
    const t = Array.isArray(CFG.testimoni) ? CFG.testimoni : [];

    if (!t.length) {
      track.innerHTML =
        '<div class="testi-slide"><div class="testi-card">' +
        '<p class="testi-meta">Belum ada ulasan.</p></div></div>';
      const d = $("testi-dots");
      if (d) d.innerHTML = "";
      return;
    }

    track.innerHTML = t
      .map(function (item) {
        return (
          '<div class="testi-slide"><figure class="testi-card">' +
          starsHTML(Number(item.rating) || 5) +
          '<blockquote class="testi-quote">"' + esc(item.pesan) + '"</blockquote>' +
          '<div class="testi-avatar" aria-hidden="true">' + esc(initials(item.nama)) + "</div>" +
          '<figcaption><p class="testi-name">' + esc(item.nama) + "</p>" +
          '<p class="testi-meta">Pelanggan</p></figcaption></figure></div>'
        );
      })
      .join("");

    const dots = $("testi-dots");
    if (dots) {
      dots.innerHTML = t
        .map(function (_, i) {
          return (
            '<button class="testi-dot' + (i === STATE.testiIndex ? " active" : "") +
            '" type="button" data-testi="' + i + '" aria-label="Ulasan ' + (i + 1) + '"></button>'
          );
        })
        .join("");
      dots.querySelectorAll("[data-testi]").forEach(function (b) {
        b.addEventListener("click", function () {
          STATE.testiIndex = Number(b.getAttribute("data-testi"));
          geserTesti();
          restartTesti();
        });
      });
    }

    geserTesti();
    restartTesti();
  }

  function geserTesti() {
    const track = $("testi-track");
    if (!track) return;
    track.style.transform = "translateX(-" + STATE.testiIndex * 100 + "%)";
    const dots = $("testi-dots");
    if (!dots) return;
    dots.querySelectorAll(".testi-dot").forEach(function (d, i) {
      d.classList.toggle("active", i === STATE.testiIndex);
    });
  }

  function restartTesti() {
    if (STATE.testiTimer) clearInterval(STATE.testiTimer);
    const total = Array.isArray(CFG.testimoni) ? CFG.testimoni.length : 0;
    if (total <= 1) return;
    STATE.testiTimer = setInterval(function () {
      STATE.testiIndex = (STATE.testiIndex + 1) % total;
      geserTesti();
    }, TESTI_INTERVAL);
  }

  /** Geser carousel dengan swipe (mobile) */
  function initTestiSwipe() {
    const vp = $("testi-viewport");
    if (!vp) return;
    let x0 = null;
    vp.addEventListener(
      "touchstart",
      function (e) {
        x0 = e.touches[0].clientX;
      },
      { passive: true }
    );
    vp.addEventListener(
      "touchend",
      function (e) {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0;
        const total = Array.isArray(CFG.testimoni) ? CFG.testimoni.length : 0;
        if (Math.abs(dx) > 40 && total > 1) {
          STATE.testiIndex = (STATE.testiIndex + (dx < 0 ? 1 : -1) + total) % total;
          geserTesti();
          restartTesti();
        }
        x0 = null;
      },
      { passive: true }
    );
  }

  /* ---------- FAQ ---------- */
  function renderFaq() {
    const box = $("faq-list");
    if (!box) return;
    const f = Array.isArray(CFG.faq) ? CFG.faq : [];
    if (!f.length) {
      box.innerHTML = "";
      return;
    }

    box.innerHTML = f
      .map(function (item, i) {
        return (
          '<div class="faq-item reveal" data-faq="' + i + '">' +
          '<button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a-' + i + '">' +
          '<span class="faq-ico">' +
          svg('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>', " class=\"h-4 w-4\"") +
          "</span><span>" + esc(item.tanya) + "</span>" +
          svg('<path d="m6 9 6 6 6-6"/>', ' class="chev"') +
          "</button>" +
          '<div class="faq-a" id="faq-a-' + i + '"><div><p>' + esc(item.jawab) + "</p></div></div>" +
          "</div>"
        );
      })
      .join("");

    box.querySelectorAll(".faq-q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const item = btn.closest(".faq-item");
        const wasOpen = item.classList.contains("open");
        box.querySelectorAll(".faq-item").forEach(function (x) {
          x.classList.remove("open");
          const q = x.querySelector(".faq-q");
          if (q) q.setAttribute("aria-expanded", "false");
        });
        if (!wasOpen) {
          item.classList.add("open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    observeReveal(box);
  }

  /* ========================================================================
     10. TOAST, FILTER UI, NAVIGASI, BACK TO TOP
     ======================================================================== */

  /**
   * Notifikasi kecil slid dari atas.
   * @param {string} pesan
   * @param {"ok"|"err"|"info"} jenis
   * @param {number} durasi - milidetik
   */
  function toast(pesan, jenis, durasi) {
    const wrap = $("toast-wrap");
    if (!wrap) return;
    jenis = jenis || "ok";
    durasi = durasi || 2800;

    const ikon =
      jenis === "ok"
        ? '<path d="M20 6 9 17l-5-5"/>'
        : '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>';

    const el = document.createElement("div");
    el.className = "toast " + jenis;
    el.innerHTML = svg(ikon, ' class="h-5 w-5"') + '<span class="min-w-0 flex-1">' + esc(pesan) + "</span>";

    wrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 280);
    }, durasi);

    while (wrap.children.length > 3) wrap.removeChild(wrap.firstChild);
  }

  /** Event filter kategori, pencarian, dan urutan */
  function initFilterUI() {
    const cats = $("filter-cats");
    if (cats) {
      cats.addEventListener("click", function (e) {
        const btn = e.target.closest("[data-kat]");
        if (!btn) return;
        STATE.kategori = btn.getAttribute("data-kat");
        renderFilterCats();
        renderMenu();
      });
    }

    const si = $("search-input");
    const box = $("search-box");
    const clr = $("search-clear");
    const cari = debounce(function () {
      STATE.query = si ? si.value : "";
      renderMenu();
    }, 180);

    if (si) {
      si.addEventListener("input", function () {
        if (box) box.classList.toggle("has-value", !!si.value);
        cari();
      });
    }
    if (clr) {
      clr.addEventListener("click", function () {
        if (si) si.value = "";
        if (box) box.classList.remove("has-value");
        STATE.query = "";
        renderMenu();
        if (si) si.focus();
      });
    }

    const ss = $("sort-select");
    if (ss) {
      ss.addEventListener("change", function () {
        STATE.sort = ss.value;
        renderMenu();
      });
    }
  }

  /** Klik tombol tambah / lihat varian / kartu menu (event delegation) */
  function initMenuClicks() {
    const grid = $("menu-grid");
    if (!grid) return;

    grid.addEventListener("click", function (e) {
      /* Tombol "+ Tambah" */
      const add = e.target.closest("[data-add]");
      if (add) {
        const item = MENU.find((m) => String(m.id) === String(add.getAttribute("data-add")));
        if (!item) return;
        if (item.tersedia === false) {
          toast(item.nama + " sedang HABIS.", "err");
          return;
        }
        const punyaVarian = item.varian && Object.keys(item.varian).length > 0;
        if (punyaVarian) {
          openModal(item.id);
        } else {
          tambahKeCart({
            menuId: item.id,
            nama: item.nama,
            harga: item.harga,
            foto: item.foto,
            varian: "",
            catatan: "",
            qty: 1,
          });
        }
        return;
      }

      /* Tombol "Lihat pilihan varian" */
      const det = e.target.closest("[data-detail]");
      if (det) {
        openModal(det.getAttribute("data-detail"));
        return;
      }

      /* Klik kartu -> buka detail (bila tersedia) */
      const card = e.target.closest("[data-id]");
      if (card) {
        const id = card.getAttribute("data-id");
        const item = MENU.find((m) => String(m.id) === String(id));
        if (item && item.tersedia !== false) openModal(id);
      }
    });
  }

  /** Tandai item bottom nav yang aktif sesuai posisi scroll */
  function initBottomNav() {
    const items = Array.prototype.slice.call(document.querySelectorAll("[data-bn]"));
    if (!items.length || !("IntersectionObserver" in window)) return;

    const sections = items
      .map(function (a) {
        return $(a.getAttribute("data-bn"));
      })
      .filter(Boolean);
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          items.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("data-bn") === e.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      obs.observe(s);
    });
  }

  /** Tombol kembali ke atas */
  function initToTop() {
    const btn = $("to-top");
    if (!btn) return;
    window.addEventListener(
      "scroll",
      function () {
        btn.classList.toggle("show", window.scrollY > 500);
      },
      { passive: true }
    );
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /** Semua tombol WhatsApp umum */
  function initWaButtons() {
    const pesan =
      "Halo " + (CFG.namaWarung || "Warung") + ", saya mau tanya-tanya soal menu. Boleh dibantu?";

    ["wa-float", "wa-header-btn"].forEach(function (id) {
      const el = $(id);
      if (el) el.href = waLink(pesan);
    });

    ["hero-wa-btn", "cta-wa-btn"].forEach(function (id) {
      const el = $(id);
      if (!el) return;
      el.addEventListener("click", function () {
        if (!CFG.whatsapp) {
          toast("Nomor WhatsApp belum diatur di config.js.", "err");
          return;
        }
        window.open(waLink(pesan), "_blank", "noopener");
      });
    });
  }

  /* ========================================================================
     11. ADMIN PANEL + IndexedDB + EXPORT ZIP

     Alur kerja pemilik (hosting tanpa server):
       1. Klik ikon pensil di baris filter -> Panel Pemilik terbuka
       2. Tab Menu    : ubah nama / harga / foto / status tersedia
       3. Tab Foto    : unggah foto (tersimpan di browser, bukan di server)
       4. Tab Export  : unduh config.js  ATAU  unduh Project (.zip)
       5. Ganti file di project, lalu upload ulang ke hosting

     CATATAN: karena hosting stateless, langkah 4 WAJIB dilakukan supaya
     perubahan benar-benar tersimpan permanen di project.
     ======================================================================== */

  /* ---------- IndexedDB (penyimpanan foto di browser) ---------- */
  const DB_NAME = "katalog-warung-img";
  const DB_STORE = "foto";
  let dbImg = null;

  function openDB() {
    return new Promise(function (resolve, reject) {
      if (dbImg) return resolve(dbImg);
      if (!("indexedDB" in window)) {
        return reject(new Error("IndexedDB tidak didukung browser ini"));
      }
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        const db = req.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: "path" });
        }
      };
      req.onsuccess = function () {
        dbImg = req.result;
        resolve(dbImg);
      };
      req.onerror = function () {
        reject(req.error);
      };
    });
  }

  function idbPut(path, blob, namaAsli) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        const tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).put({ path: path, blob: blob, nama: namaAsli });
        tx.oncomplete = function () {
          resolve(path);
        };
        tx.onerror = function () {
          reject(tx.error);
        };
      });
    });
  }

  function idbAll() {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        const req = db.transaction(DB_STORE, "readonly").objectStore(DB_STORE).getAll();
        req.onsuccess = function () {
          resolve(req.result || []);
        };
        req.onerror = function () {
          reject(req.error);
        };
      });
    });
  }

  function idbDelete(path) {
    return openDB().then(function (db) {
      return new Promise(function (resolve) {
        const tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).delete(path);
        tx.oncomplete = resolve;
        tx.onerror = resolve;
      });
    });
  }

  function idbClear() {
    return openDB().then(function (db) {
      return new Promise(function (resolve) {
        const tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).clear();
        tx.oncomplete = resolve;
        tx.onerror = resolve;
      });
    });
  }

  /** Buat URL objek dari blob agar bisa dipratinjau */
  function objectUrl(blob) {
    return URL.createObjectURL(blob);
  }

  /** Lepaskan URL objek pratinjau supaya tidak bocor */
  function revokeObjUrls() {
    document.querySelectorAll("[data-objurl]").forEach(function (el) {
      const u = el.getAttribute("src");
      if (u && u.indexOf("blob:") === 0) URL.revokeObjectURL(u);
    });
  }

  /* ---------- Draft config dari Admin Panel ---------- */
  function loadDraft() {
    try {
      const d = JSON.parse(lsGet(K_DRAFT, ""));
      if (d && Array.isArray(d.menu)) {
        MENU = d.menu;
        return d;
      }
    } catch (e) {
      /* abaikan */
    }
    return null;
  }

  function saveDraft(data) {
    lsSet(K_DRAFT, JSON.stringify(data));
    MENU = data.menu;
  }

  function resetDraft() {
    lsDel(K_DRAFT);
    MENU = MENU_CFG;
  }

  /** Config aktif = draft kalau ada, kalau tidak isi config.js */
  function configAktif() {
    const d = loadDraft();
    return d || JSON.parse(JSON.stringify(CFG));
  }

  /* ---------- Buka / tutup panel ---------- */
  function openAdmin() {
    const root = $("admin-root");
    if (!root) return;
    STATE.adminOpen = true;
    renderAdminTab();
    root.classList.add("open");
    document.body.classList.add("sheet-open");
  }

  function closeAdmin() {
    const root = $("admin-root");
    if (!root) return;
    STATE.adminOpen = false;
    root.classList.remove("open");
    document.body.classList.remove("sheet-open");
    revokeObjUrls();
  }

  function initAdminUI() {
    const open = $("admin-open");
    if (open) open.addEventListener("click", openAdmin);
    const close = $("admin-close");
    if (close) close.addEventListener("click", closeAdmin);
    const bd = $("admin-backdrop");
    if (bd) bd.addEventListener("click", closeAdmin);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && STATE.adminOpen) closeAdmin();
    });

    const tabs = $("admin-tabs");
    if (tabs) {
      tabs.addEventListener("click", function (e) {
        const b = e.target.closest("[data-atab]");
        if (!b) return;
        STATE.adminTab = b.getAttribute("data-atab");
        tabs.querySelectorAll("[data-atab]").forEach(function (x) {
          x.classList.toggle("active", x === b);
        });
        renderAdminTab();
      });
    }
  }

  function renderAdminTab() {
    const box = $("admin-panel-body");
    if (!box) return;
    revokeObjUrls();

    if (STATE.adminTab === "menu") box.innerHTML = adminMenuHTML();
    else if (STATE.adminTab === "gambar") box.innerHTML = adminGambarHTML();
    else if (STATE.adminTab === "info") box.innerHTML = adminInfoHTML();
    else box.innerHTML = adminExportHTML();

    pasangEventAdmin();
    if (STATE.adminTab === "gambar") muatDaftarFoto();
    if (STATE.adminTab === "export") muatJumlahFoto();
  }

  /* ---------- TAB 1: MENU ---------- */
  function adminMenuHTML() {
    const cfg = configAktif();
    const adaDraft = !!lsGet(K_DRAFT, "");
    let html = "";

    html +=
      '<div class="admin-note">' +
      svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>', ' class="h-4 w-4"') +
      "<div>Perubahan di sini tersimpan di <strong>browser ini saja</strong>. Setelah selesai, " +
      "buka tab <strong>Export</strong>, unduh <code>config.js</code> terbaru, lalu ganti file " +
      "tersebut di project dan upload ulang ke hosting.</div></div>";

    html +=
      '<div class="admin-actions">' +
      '<button class="btn btn-ghost btn-sm" type="button" id="adm-reset">Kembalikan ke config.js</button>' +
      '<button class="btn btn-primary btn-sm" type="button" id="adm-tambah">+ Tambah Menu Baru</button>' +
      "</div>";

    if (adaDraft) {
      html +=
        '<p class="mt-2 text-xs font-bold text-amberdark">Ada menu yang berbeda dari file config.js asli.</p>';
    }

    cfg.menu.forEach(function (m, i) {
      html +=
        '<div class="admin-card" data-idx="' + i + '">' +
        '<div class="admin-item-head">' +
        '<img class="admin-thumb" src="' + esc(fotoURL(m.foto)) + '" alt="" onerror="' + ONERR + '">' +
        '<div class="min-w-0 flex-1">' +
        '<p class="admin-item-title">' + esc(m.nama) + "</p>" +
        '<p class="admin-item-meta">#' + esc(m.id) + " - " + esc(m.kategori) + " - " +
        formatRupiah(m.harga) + "</p></div>" +
        '<button class="icon-btn" type="button" data-del="' + i + '" aria-label="Hapus menu" title="Hapus">' +
        svg('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>', ' class="h-4 w-4"') +
        "</button></div>" +

        '<div class="grid-2">' +
        adminField("adm-nama-" + i, "Nama Menu", m.nama) +
        adminField("adm-kat-" + i, "Kategori", m.kategori) +
        adminField("adm-harga-" + i, "Harga (angka saja)", String(m.harga), "number") +
        '<div class="field"><label for="adm-badge-' + i + '">Badge</label>' +
        '<select class="select" id="adm-badge-' + i + '">' +
        ["", "Best Seller", "Baru", "Promo"]
          .map(function (b) {
            const aktif = (m.badge || "") === b;
            return '<option value="' + esc(b) + '"' + (aktif ? " selected" : "") + ">" +
              (b || "Tanpa badge") + "</option>";
          })
          .join("") +
        "</select></div>" +
        adminField("adm-foto-" + i, "Path / URL Foto", m.foto || "", "text", true) +
        adminField("adm-desk-" + i, "Deskripsi", m.deskripsi || "", "text", true) +
        '<div class="field"><label class="flex cursor-pointer items-center gap-2">' +
        '<input type="checkbox" id="adm-tersedia-' + i + '"' + (m.tersedia !== false ? " checked" : "") +
        ' style="width:17px;height:17px;accent-color:#FF8F00"> Tersedia</label></div>' +
        "</div>" +

        '<div class="admin-actions">' +
        '<button class="btn btn-ghost btn-sm" type="button" data-pilih-foto="' + i + '">Pilih Foto</button>' +
        "</div></div>";
    });

    return html;
  }

  function adminField(id, label, nilai, type, span) {
    return (
      '<div class="field' + (span ? " span-2" : "") + '">' +
      '<label for="' + id + '">' + esc(label) + "</label>" +
      '<input class="input" id="' + id + '" type="' + (type || "text") +
      '" value="' + esc(nilai) + '"></div>'
    );
  }

  /* ---------- Simpan perubahan menu (langsung ke draft) ---------- */
  function simpanPerubahanMenu() {
    const cfg = configAktif();
    cfg.menu.forEach(function (m, i) {
      const ambil = function (id) {
        const el = $(id);
        return el ? el.value : null;
      };
      const nama = ambil("adm-nama-" + i);
      if (nama !== null) m.nama = nama;
      const kat = ambil("adm-kat-" + i);
      if (kat !== null) m.kategori = kat;
      const harga = ambil("adm-harga-" + i);
      if (harga !== null) m.harga = Number(String(harga).replace(/\D/g, "")) || 0;
      const foto = ambil("adm-foto-" + i);
      if (foto !== null) m.foto = foto;
      const desk = ambil("adm-desk-" + i);
      if (desk !== null) m.deskripsi = desk;
      const badge = ambil("adm-badge-" + i);
      if (badge !== null) m.badge = badge || null;
      const t = $("adm-tersedia-" + i);
      if (t) m.tersedia = t.checked;
    });
    saveDraft(cfg);
  }

  /* ---------- TAB 2: FOTO ---------- */
  function adminGambarHTML() {
    let html = "";

    html +=
      '<div class="admin-note">' +
      svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>', ' class="h-4 w-4"') +
      "<div>Foto yang diunggah di sini <strong>disimpan di browser</strong> (IndexedDB), bukan di server. " +
      "Setelah diunggah, pakai path-nya di menu (contoh <code>images/menu/ayam.jpg</code>), lalu unduh " +
      "Project (.zip) di tab <strong>Export</strong>. File <code>images</code>-mu ikut terbawa di dalamnya.</div></div>";

    html +=
      '<label class="admin-drop" id="adm-drop">' +
      "<strong>Klik untuk pilih foto</strong> atau seret file ke sini" +
      '<span class="mt-1 block text-xs">JPG / PNG / WEBP. Rasio 4:3 disarankan, maksimal sekitar 1 MB per foto.</span>' +
      '<input type="file" id="adm-file" accept="image/*" multiple class="hidden"></label>';

    html += '<div class="mt-3" id="adm-img-status"></div>';
    html +=
      '<p class="mt-4 text-sm font-extrabold text-brown">Foto tersimpan di browser</p>' +
      '<div class="mt-2" id="adm-img-list"></div>';
    html +=
      '<div class="admin-actions">' +
      '<button class="btn btn-ghost btn-sm" type="button" id="adm-img-clear">Hapus Semua Foto</button>' +
      "</div>";

    return html;
  }

  function statusFoto(pesan, jenis) {
    const el = $("adm-img-status");
    if (!el) return;
    el.className =
      "mt-3 rounded-2xl px-3 py-2 text-xs font-semibold " +
      (jenis === "err"
        ? "bg-red-50 text-red-700"
        : jenis === "ok"
        ? "bg-green-50 text-green-700"
        : "bg-amber-50 text-amber-900");
    el.textContent = pesan;
  }

  function muatDaftarFoto() {
    const list = $("adm-img-list");
    if (!list) return;
    idbAll()
      .then(function (rows) {
        if (!rows.length) {
          list.innerHTML = '<div class="storage-note">Belum ada foto yang diunggah.</div>';
          return;
        }
        list.innerHTML = "";
        rows.forEach(function (r) {
          const card = document.createElement("div");
          card.className = "admin-card flex items-center gap-2.5";
          card.innerHTML =
            '<img class="admin-thumb" src="' + objectUrl(r.blob) + '" alt="" data-objurl="1">' +
            '<div class="min-w-0 flex-1"><p class="truncate text-xs font-bold text-brown">' +
            esc(r.nama || r.path) + '</p><p class="truncate text-[0.68rem] text-muted">' +
            esc(r.path) + "</p></div>" +
            '<button class="icon-btn" type="button" data-img-del="' + esc(r.path) +
            '" aria-label="Hapus foto" style="width:32px;height:32px">' +
            svg('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>', ' class="h-4 w-4"') +
            "</button>";
          list.appendChild(card);
        });
      })
      .catch(function () {
        list.innerHTML =
          '<div class="storage-note">Browser tidak mendukung penyimpanan foto. ' +
          "Gunakan Chrome / Edge terbaru, atau langsung letakkan file di folder /images.</div>";
      });
  }

  /** Ubah nama file jadi slug path yang aman */
  function slugFoto(namaFile) {
    const base = String(namaFile)
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const ext = (String(namaFile).match(/\.([a-z0-9]+)$/i) || [, "jpg"])[1].toLowerCase();
    /* Path relatif (tanpa garis mula) supaya ikut folder website saat dipindah. */
    return "images/menu/" + (base || "foto") + "." + ext;
  }

  function prosesFileFoto(files) {
    const arr = Array.prototype.slice.call(files).filter(function (f) {
      return /^image\//.test(f.type);
    });
    if (!arr.length) {
      statusFoto("Tidak ada file gambar yang valid.", "err");
      return;
    }

    statusFoto("Menyimpan " + arr.length + " foto ke browser...", "");
    let selesai = 0;

    arr.forEach(function (file) {
      const path = slugFoto(file.name);
      idbPut(path, file, file.name)
        .then(function () {
          selesai++;
          if (selesai === arr.length) {
            statusFoto(
              selesai + " foto tersimpan. Pakai path-nya di menu, lalu export Project (.zip).",
              "ok"
            );
            muatDaftarFoto();
            toast(selesai + " foto berhasil disimpan", "ok");
          }
        })
        .catch(function () {
          statusFoto("Gagal menyimpan " + file.name + ". Coba file yang lebih kecil.", "err");
        });
    });
  }

  /* ---------- TAB 3: INFO WARUNG ---------- */
  function adminInfoHTML() {
    const cfg = configAktif();
    const f = function (id, label, nilai, span, hint) {
      return (
        '<div class="field' + (span ? " span-2" : "") + '">' +
        '<label for="' + id + '">' + esc(label) + "</label>" +
        '<input class="input" id="' + id + '" type="text" value="' + esc(nilai || "") + '">' +
        (hint ? '<p class="hint">' + esc(hint) + "</p>" : "") +
        "</div>"
      );
    };
    const jb = cfg.jamBuka || {};

    let html =
      '<div class="admin-note">' +
      svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>', ' class="h-4 w-4"') +
      "<div>Isi data warung di bawah, perubahan langsung terlihat di katalog. " +
      "Jangan lupa unduh <code>config.js</code> di tab Export supaya permanen.</div></div>";

    html +=
      '<div class="admin-card"><div class="grid-2">' +
      f("adm-namaWarung", "Nama Warung", cfg.namaWarung, true) +
      f("adm-tagline", "Tagline", cfg.tagline, true) +
      f("adm-whatsapp", "Nomor WhatsApp (628xxx)", cfg.whatsapp, false, "Tanpa tanda + dan tanpa spasi") +
      f("adm-telepon", "Telepon", cfg.telepon) +
      f("adm-alamat", "Alamat", cfg.alamat, true) +
      f("adm-jam-sf", "Jam Senin-Jumat", jb.senin_jumat, false, "Format: 08:00-21:00") +
      f("adm-jam-sm", "Jam Sabtu-Minggu", jb.sabtu_minggu, false, "Format: 09:00-22:00") +
      f("adm-mapsLink", "Link Google Maps", cfg.mapsLink, true) +
      "</div></div>";

    return html;
  }

  function simpanPerubahanInfo() {
    const cfg = configAktif();
    const ambil = function (id) {
      const el = $(id);
      return el ? el.value : null;
    };
    const nama = ambil("adm-namaWarung");
    if (nama !== null) cfg.namaWarung = nama;
    const tag = ambil("adm-tagline");
    if (tag !== null) cfg.tagline = tag;
    const wa = ambil("adm-whatsapp");
    if (wa !== null) cfg.whatsapp = String(wa).replace(/\D/g, "");
    const tel = ambil("adm-telepon");
    if (tel !== null) cfg.telepon = tel;
    const al = ambil("adm-alamat");
    if (al !== null) cfg.alamat = al;
    const sf = ambil("adm-jam-sf");
    if (sf !== null) cfg.jamBuka = Object.assign({}, cfg.jamBuka, { senin_jumat: sf });
    const sm = ambil("adm-jam-sm");
    if (sm !== null) cfg.jamBuka = Object.assign({}, cfg.jamBuka, { sabtu_minggu: sm });
    const ml = ambil("adm-mapsLink");
    if (ml !== null) cfg.mapsLink = ml;
    saveDraft(cfg);
  }

  /* ---------- TAB 4: EXPORT ---------- */
  function adminExportHTML() {
    let html =
      '<div class="admin-note">' +
      svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>', ' class="h-4 w-4"') +
      "<div><strong>Unduh config.js</strong> - unduh file config terbaru, ganti file " +
      "<code>config.js</code> di project, lalu upload ulang ke hosting.<br>" +
      "<strong>Unduh Project (.zip)</strong> - satu paket berisi config.js terbaru DAN semua foto " +
      "yang sudah diunggah. Ekstrak (unzip), lalu upload isinya ke hosting.</div></div>";

    html +=
      '<div class="admin-card"><div class="grid-2">' +
      '<div class="field"><label>Jumlah menu</label><div class="input" style="background:var(--surface-2)">' +
      MENU.length + " menu</div></div>" +
      '<div class="field"><label>Foto di browser</label><div class="input" id="adm-foto-count" ' +
      'style="background:var(--surface-2)">Memuat...</div></div>' +
      "</div></div>";

    html +=
      '<div class="admin-actions">' +
      '<button class="btn btn-primary btn-sm" type="button" id="adm-export-js">Unduh config.js</button>' +
      '<button class="btn btn-ghost btn-sm" type="button" id="adm-export-zip">Unduh Project (.zip)</button>' +
      "</div>";

    html +=
      '<p class="mt-4 text-sm font-extrabold text-brown">Pratinjau (250 baris pertama)</p>' +
      '<pre class="storage-note mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-[0.68rem] leading-relaxed">' +
      esc(teksConfigJS().split("\n").slice(0, 250).join("\n")) + "</pre>";

    return html;
  }

  function muatJumlahFoto() {
    const el = $("adm-foto-count");
    if (!el) return;
    idbAll()
      .then(function (rows) {
        el.textContent = rows.length + " foto";
      })
      .catch(function () {
        el.textContent = "tidak tersedia";
      });
  }

  /* ---------- Buat teks file config.js ---------- */
  function teksConfigJS() {
    const cfg = configAktif();
    return (
      "/* config.js - diunduh dari Panel Pemilik (" +
      new Date().toLocaleString("id-ID") + ")\n" +
      "   Ganti file config.js di project dengan file ini, lalu upload ulang. */\n\n" +
      "const config = " + JSON.stringify(cfg, null, 2) + ";\n\n" +
      'if (typeof window !== "undefined") window.config = config;\n'
    );
  }

  /** Trigger download file teks */
  function downloadTeks(namaFile, isi, tipe) {
    const blob = new Blob([isi], { type: tipe || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = namaFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1500);
  }

  /* ========================================================================
     11b. PENULIS ZIP (store-only, tanpa library)

     Menghasilkan file .zip yang valid tanpa kompresi, supaya pemilik bisa
     mengunduh config.js + folder images/ dalam satu paket.

     Struktur ZIP: Local File Header + Data + Central Directory + EOCD.
     ======================================================================== */

  const CRC_TABLE = (function () {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
      c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  /** Bangun Uint8Array ZIP dari daftar file { name, data } */
  function buatZip(files) {
    const enc = new TextEncoder();
    const central = [];
    let offset = 0;

    files.forEach(function (f) {
      const nameBytes = enc.encode(f.name);
      const data = f.data;
      const crc = crc32(data);
      const size = data.length;

      const cd = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(cd.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true); /* nama file UTF-8 */
      cv.setUint16(10, 0, true); /* method 0 = store */
      cv.setUint16(12, 0, true); /* waktu */
      cv.setUint16(14, 0x21, true); /* tanggal */
      cv.setUint32(16, crc, true);
      cv.setUint32(20, size, true);
      cv.setUint32(24, size, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);
      cd.set(nameBytes, 46);
      central.push({ bytes: cd, offset: offset });
      offset += 30 + nameBytes.length + size;
    });

    const cdSize = central.reduce(function (s, c) {
      return s + c.bytes.length;
    }, 0);

    const out = new Uint8Array(offset + cdSize + 22);
    let p = 0;

    files.forEach(function (f) {
      const nameBytes = enc.encode(f.name);
      const data = f.data;
      const crc = crc32(data);
      const size = data.length;

      const lfh = new Uint8Array(30 + nameBytes.length);
      const lv = new DataView(lfh.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0x0800, true);
      lv.setUint16(8, 0, true);
      lv.setUint16(10, 0, true);
      lv.setUint16(12, 0x21, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, size, true);
      lv.setUint32(22, size, true);
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);
      lfh.set(nameBytes, 30);

      out.set(lfh, p);
      p += lfh.length;
      out.set(data, p);
      p += data.length;
    });

    central.forEach(function (c) {
      out.set(c.bytes, p);
      p += c.bytes.length;
    });

    const ev = new DataView(out.buffer, p, 22);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, central.length, true);
    ev.setUint16(10, central.length, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, p, true);
    ev.setUint16(20, 0, true);

    return out;
  }

  /**
   * Ambil file inti project (index, css, js, manifest, sw, ikon) dari server
   * supaya ZIP yang diunduh benar-benar bisa langsung di-upload ulang.
   * Kalau website dibuka lewat file:// ambilnya gagal, fungsi ini return [].
   */
  function ambilFileInti() {
    const daftar = [
      "index.html",
      "styles.css",
      "script.js",
      "manifest.json",
      "sw.js",
      "icons/icon-32.png",
      "icons/icon-152.png",
      "icons/icon-180.png",
      "icons/icon-192.png",
      "icons/icon-512.png",
      "icons/icon-maskable-512.png",
    ];

    return Promise.all(
      daftar.map(function (rel) {
        return fetch(aset(rel), { cache: "no-cache" })
          .then(function (res) {
            if (!res.ok) throw new Error("404 " + rel);
            return res.arrayBuffer().then(function (buf) {
              return { name: rel, data: new Uint8Array(buf) };
            });
          })
          .catch(function () {
            return null;
          });
      })
    ).then(function (hasil) {
      return hasil.filter(Boolean);
    });
  }

  /** Unduh project sebagai .zip (file inti + config.js + semua foto) */
  function exportProjectZip() {
    const btn = $("adm-export-zip");
    const label = btn ? btn.querySelector("span") : null;
    if (btn) btn.disabled = true;
    if (label) label.textContent = "Menyiapkan file...";

    const enc = new TextEncoder();

    Promise.all([ambilFileInti(), idbAll()])
      .then(function (res) {
        const inti = res[0];
        const rows = res[1];

        const files = inti.slice();
        files.push({ name: "config.js", data: enc.encode(teksConfigJS()) });

        return Promise.all(
          rows.map(function (r) {
            return r.blob.arrayBuffer().then(function (buf) {
              files.push({
                name: String(r.path).replace(/^\/+/, ""),
                data: new Uint8Array(buf),
              });
            });
          })
        ).then(function () {
          const zip = buatZip(files);
          const url = URL.createObjectURL(new Blob([zip], { type: "application/zip" }));
          const a = document.createElement("a");
          a.href = url;
          a.download = "warung-katalog.zip";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function () {
            URL.revokeObjectURL(url);
          }, 2000);

          const pesan =
            "Project diunduh: " +
            files.length +
            " file (termasuk " +
            inti.length +
            " file inti + config.js + " +
            rows.length +
            " foto). Ekstrak lalu upload isinya.";
          toast(pesan, "ok", 5200);

          if (!inti.length) {
            setTimeout(function () {
              toast(
                "File inti tidak ikut terbawa (website dibuka lewat file://). " +
                  "ZIP hanya berisi config.js dan foto - jangan hapus file lain di hosting.",
                "err",
                7000
              );
            }, 1200);
          }
        });
      })
      .catch(function () {
        toast("Gagal menyiapkan ZIP. Coba muat ulang halaman.", "err");
      })
      .then(function () {
        if (btn) btn.disabled = false;
        if (label) label.textContent = "Unduh Project (.zip)";
      });
  }

  /* ---------- Event handler Admin Panel ---------- */
  function pasangEventAdmin() {
    /* --- Tab Menu --- */
    const reset = $("adm-reset");
    if (reset) {
      reset.addEventListener("click", function () {
        if (!confirm("Kembalikan semua perubahan ke isi config.js asli?")) return;
        resetDraft();
        renderAllMenu();
        renderAdminTab();
        toast("Menu dikembalikan ke config.js asli.", "info");
      });
    }

    const tambah = $("adm-tambah");
    if (tambah) {
      tambah.addEventListener("click", function () {
        const cfg = configAktif();
        const maxId = cfg.menu.reduce(function (m, x) {
          return Math.max(m, Number(x.id) || 0);
        }, 0);
        cfg.menu.push({
          id: maxId + 1,
          kategori: "Makanan",
          nama: "Menu Baru",
          harga: 20000,
          foto: "",
          deskripsi: "Deskripsi singkat menu ini.",
          badge: null,
          tersedia: true,
          varian: {},
        });
        saveDraft(cfg);
        renderAllMenu();
        renderAdminTab();
        toast("Menu baru ditambahkan. Isi detailnya di bawah.", "ok");
      });
    }

    document.querySelectorAll("[data-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        const i = Number(b.getAttribute("data-del"));
        const cfg = configAktif();
        const nama = cfg.menu[i] ? cfg.menu[i].nama : "?";
        if (!confirm('Hapus menu "' + nama + '" dari katalog?')) return;
        cfg.menu.splice(i, 1);
        saveDraft(cfg);
        renderAllMenu();
        renderAdminTab();
        toast("Menu dihapus.", "info");
      });
    });

    document.querySelectorAll("[data-pilih-foto]").forEach(function (b) {
      b.addEventListener("click", function () {
        const i = Number(b.getAttribute("data-pilih-foto"));
        const picker = document.createElement("input");
        picker.type = "file";
        picker.accept = "image/*";
        picker.addEventListener("change", function () {
          if (!picker.files || !picker.files[0]) return;
          const file = picker.files[0];
          const path = slugFoto(file.name);
          idbPut(path, file, file.name).then(function () {
            const cfg = configAktif();
            cfg.menu[i].foto = path;
            saveDraft(cfg);
            renderAllMenu();
            renderAdminTab();
            toast("Foto disimpan. Path sudah diisi otomatis.", "ok");
          });
        });
        picker.click();
      });
    });

    /* Simpan ketikan admin -> draft (penting: sebelum render ulang) */
    if (STATE.adminTab === "menu") {
      ["input", "change"].forEach(function (evt) {
        const box = $("admin-panel-body");
        if (box) {
          box.addEventListener(evt, debounce(function () {
            simpanPerubahanMenu();
            renderFilterCats();
          }, 350));
        }
      });
    }

    if (STATE.adminTab === "info") {
      const box = $("admin-panel-body");
      if (box) {
        box.addEventListener(
          "input",
          debounce(function () {
            simpanPerubahanInfo();
            renderInfo();
          }, 500)
        );
      }
    }

    /* --- Tab Foto --- */
    const drop = $("adm-drop");
    const file = $("adm-file");
    if (drop && file) {
      drop.addEventListener("dragover", function (e) {
        e.preventDefault();
        drop.classList.add("dragover");
      });
      drop.addEventListener("dragleave", function () {
        drop.classList.remove("dragover");
      });
      drop.addEventListener("drop", function (e) {
        e.preventDefault();
        drop.classList.remove("dragover");
        if (e.dataTransfer && e.dataTransfer.files) prosesFileFoto(e.dataTransfer.files);
      });
      file.addEventListener("change", function () {
        if (file.files && file.files.length) prosesFileFoto(file.files);
        file.value = "";
      });
    }

    const imgClear = $("adm-img-clear");
    if (imgClear) {
      imgClear.addEventListener("click", function () {
        if (!confirm("Hapus semua foto yang tersimpan di browser ini?")) return;
        idbClear()
          .then(function () {
            muatDaftarFoto();
            statusFoto("Semua foto di browser sudah dihapus.", "info");
            toast("Foto di browser dihapus.", "info");
          })
          .catch(function () {
            toast("Gagal menghapus foto.", "err");
          });
      });
    }

    document.querySelectorAll("[data-img-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        idbDelete(b.getAttribute("data-img-del")).then(function () {
          muatDaftarFoto();
          toast("Foto dihapus dari browser.", "info");
        });
      });
    });

    /* --- Tab Export --- */
    const expJs = $("adm-export-js");
    if (expJs) {
      expJs.addEventListener("click", function () {
        downloadTeks("config.js", teksConfigJS());
        toast("config.js diunduh. Ganti file tersebut di project lalu upload ulang.", "ok", 4000);
      });
    }

    const expZip = $("adm-export-zip");
    if (expZip) expZip.addEventListener("click", exportProjectZip);
  }

  /* ========================================================================
     12. SEO, PWA, INISIALISASI
     ======================================================================== */

  /**
   * Ubah "08:00-21:00" menjadi "08:00" atau "21:00" untuk schema.org.
   * Aman dipanggil walau jadwal kosong / tidak valid.
   * @param {string} teks
   * @param {number} bagian - 0 = jam buka, 1 = jam tutup
   */
  function jamIso(teks, bagian) {
    const bagianArr = String(teks || "")
      .split("-")
      .map(function (b) {
        return b.trim();
      });
    const hasil = bagianArr[bagian === 1 ? 1 : 0] || "";
    return /^\d{1,2}:\d{2}$/.test(hasil) ? hasil : undefined;
  }

  function renderSEO() {
    const nama = CFG.namaWarung || "Warung";
    const tagline = CFG.tagline || "";
    const deskripsi =
      CFG.deskripsiSingkat || ("Katalog menu " + nama + ". Pesan lewat WhatsApp.");
    const gambar = fotoURL(CFG.banner);
    const url = window.location.href.split("#")[0];

    document.title = "Katalog Menu " + nama + " - " + tagline;

    const setMeta = function (selector, value) {
      const el = document.querySelector(selector);
      if (el) el.setAttribute("content", value);
    };
    const setProp = function (prop, value) {
      const el = document.querySelector('meta[property="' + prop + '"]');
      if (el) el.setAttribute("content", value);
    };

    setMeta('meta[name="description"]', deskripsi);
    setMeta('meta[name="author"]', nama);
    document.querySelectorAll('link[rel="canonical"]').forEach(function (l) {
      l.setAttribute("href", url);
    });

    setProp("og:site_name", nama);
    setProp("og:title", "Katalog Menu " + nama);
    setProp("og:description", deskripsi);
    setProp("og:image", gambar);

    setMeta('meta[name="twitter:title"]', "Katalog Menu " + nama);
    setMeta('meta[name="twitter:description"]', deskripsi);
    setMeta('meta[name="twitter:image"]', gambar);

    /* Schema.org Restaurant */
    const jb = CFG.jamBuka || {};
    const schema = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: nama,
      description: deskripsi,
      image: gambar,
      url: url,
      servesCuisine: "Masakan Indonesia",
      priceRange: "Rp 5.000 - Rp 95.000",
      telephone: CFG.telepon || undefined,
      address: {
        "@type": "PostalAddress",
        streetAddress: CFG.alamatLengkap || CFG.alamat || "",
        addressCountry: "ID",
      },
      acceptsReservations: "True",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: jamIso(jb.senin_jumat, 0),
          closes: jamIso(jb.senin_jumat, 1),
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Saturday", "Sunday"],
          opens: jamIso(jb.sabtu_minggu, 0),
          closes: jamIso(jb.sabtu_minggu, 1),
        },
      ],
      potentialAction: {
        target: {
          "@type": "EntryPoint",
          urlTemplate: waLink("{order}"),
        },
      },
    };

    const ld = $("jsonld-restaurant");
    if (ld) ld.textContent = JSON.stringify(schema, null, 2);
  }

  /** Daftarkan Service Worker (PWA + mode offline) */
  function initSW() {
    if (!("serviceWorker" in navigator)) return;
    if (window.location.protocol === "file:") return; /* tidak jalan di file:// */
    window.addEventListener("load", function () {
      /* Path relatif supaya aman di hosting root maupun subfolder (GitHub Pages). */
      navigator.serviceWorker.register(aset("sw.js"), { scope: BASE }).catch(function () {
        /* gagal daftar service worker tidak kritis */
      });
    });
  }

  /** Peringatan install PWA (Android) */
  function initInstallPrompt() {
    let deferred = null;
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      deferred = e;
    });
    /* Simpan agar bisa dipakai tombol pasang aplikasi di masa depan */
    window.__warungInstallPrompt = function () {
      if (!deferred) {
        toast("Gunakan menu browser -> Tambah ke Layar Utama.", "info");
        return;
      }
      deferred.prompt();
      deferred = null;
    };
  }

  /** Jalankan semuanya saat DOM siap */
  function init() {
    /* 1. Muat data tersimpan */
    loadCart();
    loadOrder();
    loadDraft();

    /* 2. Inisialisasi komponen */
    initReveal();
    initTheme();
    initModal();
    initCartUI();
    initFilterUI();
    initMenuClicks();
    initBottomNav();
    initToTop();
    initWaButtons();
    initAdminUI();
    initTestiSwipe();
    initSW();
    initInstallPrompt();

    /* 3. Render konten */
    renderInfo();
    renderAllMenu();
    renderGaleri();
    renderTestimoni();
    renderFaq();
    renderCart();
    renderSEO();

    /* 4. Animasi section statis */
    observeReveal(document);

    /* 5. Status buka/tutup diperbarui tiap 30 detik */
    setInterval(updateStatus, 30000);

    /* 6. Peringatan kalau nomor WhatsApp belum diisi */
    if (!String(CFG.whatsapp || "").replace(/\D/g, "")) {
      setTimeout(function () {
        toast(
          "Nomor WhatsApp belum diisi. Buka config.js dan isi field whatsapp.",
          "err",
          5000
        );
      }, 1500);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
