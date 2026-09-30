/* ==========================================================================
   SW.JS - SERVICE WORKER (PWA + MODE OFFLINE)
   ==========================================================================

   Cara kerja:
   - File inti website (index, css, js, config, manifest, ikon) di-cache
     saat instalasi supaya halaman tetap bisa dibuka tanpa internet.
   - Foto: strategi "stale-while-revalidate". Tampilkan versi lama yang sudah
     tersimpan sambil mengambil versi baru di belakang layar. Cocok untuk foto
     menu supaya halaman tidak lambat.

   CARA MENGHAPUS CACHE (penting setelah ganti file):
     1. Buka website di browser
     2. Buka DevTools -> tab Application -> Storage -> Clear site data
     atau
     3. Naikkan versi CACHE_VERSION di bawah ini lalu upload ulang.

   CATATAN PENTING:
   Jangan cache file config.js selamanya. Kalau config.js di-cache, perubahan
   menu tidak akan muncul bagi pengunjung sampai cache dibersihkan. Karena itu
   config.js memakai strategi "network first".
   ========================================================================== */

/* Naikkan nomor ini setiap kali kamu mengubah file inti website. */
const CACHE_VERSION = "v2.1.0-warkap-logo";
const CACHE_NAME = "katalog-warkap-" + CACHE_VERSION;

/* ------------------------------------------------------------------
   PATH ASET

   Semua path ditulis RELATIF ("./index.html"), bukan absolut ("/index.html").
  _relative_ supaya website tetap benar di dua jenis hosting:
     - hosting root  : https://namadomain.com/            (Netlify, VPS)
     - hosting sub   : https://user.github.io/nama-repo/  (GitHub Pages)

   Kalau pathnya absolut, semua file inti akan 404 di GitHub Pages.
   ------------------------------------------------------------------ */
const PRECACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./images/logo-crop.png",
  "./images/logo-192.png",
  "./images/logo-512.png",
  "./images/logo-maskable-512.png",
];

/* Dipakai untuk fallback halaman offline (path relatif terhadap sw.js) */
const HALAMAN_OFFLINE = "./index.html";

/* ------------------------------------------------------------------
   INSTALL: simpan file inti ke cache
   ------------------------------------------------------------------ */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        /* addAll gagal semua kalau satu file 404, jadi pakai request
           satu per satu supaya yang lain tetap tersimpan */
        return Promise.all(
          PRECACHE.map((url) =>
            cache.add(new Request(url, { cache: "reload" })).catch(() => null)
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

/* ------------------------------------------------------------------
   ACTIVATE: hapus cache versi lama
   ------------------------------------------------------------------ */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith("katalog-warung-") && k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ------------------------------------------------------------------
   FETCH: tentukan strategi per jenis file
   ------------------------------------------------------------------ */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  /* Jangan Intercept yang bukan GET (mis. POST ke API lain) */
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  /* Jangan sentuh domain lain kecuali font & gambar CDN */
  const sameOrigin = url.origin === self.location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com/.test(url.hostname);
  const isImage = req.destination === "image";
  if (!sameOrigin && !isFont && !isImage) return;

  /* --- 1. config.js: NETWORK FIRST ---------------------------------
     Perubahan menu harus langsung terlihat, jangan sampai tertahan cache. */
  if (sameOrigin && url.pathname.endsWith("/config.js")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then(
            (hit) =>
              hit ||
              new Response(
                "const config = { namaWarung: 'Offline', menu: [] };",
                { headers: { "Content-Type": "text/javascript" } }
              )
          )
        )
    );
    return;
  }

  /* --- 2. Navigasi (opening halaman): NETWORK FIRST ----------------
     Selalu coba ambil versi terbaru dari server, jatuh ke cache saat offline. */
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(HALAMAN_OFFLINE, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(HALAMAN_OFFLINE)
            .then((hit) => hit || caches.match("./").then((h2) => h2 || caches.match(PRECACHE[0])))
        )
    );
    return;
  }

  /* --- 3. Aset statis milik sendiri: CACHE FIRST ------------------
     styles.css / script.js / ikon: jarang berubah, ambil dari cache. */
  if (sameOrigin) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res && res.status === 200 && res.type === "basic") {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  /* --- 4. Foto & font dari CDN: STALE WHILE REVALIDATE -------------
     Tampilkan yang sudah ada, perbarui diam-diam di belakang layar. */
  event.respondWith(
    caches.match(req).then((hit) => {
      const jaringan = fetch(req)
        .then((res) => {
          if (res && (res.status === 200 || res.type === "opaque")) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || jaringan;
    })
  );
});

/* ------------------------------------------------------------------
   PESAN DARI HALAMAN
   ------------------------------------------------------------------ */

/** Minta service worker segera mengambil versi baru */
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
