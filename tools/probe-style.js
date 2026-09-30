/* tools/probe-style.js - cek computed style halaman sungguhan via Chrome DevTools Protocol.
   Pakai: node tools/probe-style.js <url> '<json array [ [selector, properti], ... ]>'
   Contoh:
     node tools/probe-style.js http://127.0.0.1:8097/ '[[":root","--gold"],[".hero","color"]]'
*/
const http = require("http");
const fs = require("fs");

const url = process.argv[2] || "http://127.0.0.1:8097/";
let pairs;
const raw = process.argv[3] || "";
if (!raw) {
  console.error("Butuh daftar probe. Contoh:");
  console.error('  node tools/probe-style.js <url> \'[[".hero","color"]]\'');
  process.exit(1);
}
try {
  pairs = JSON.parse(raw);
} catch (e) {
  try {
    pairs = JSON.parse(fs.readFileSync(raw, "utf8"));
  } catch (e2) {
    console.error("GAGAL parse probe. JSON atau path file.");
    console.error("Contoh: '[[\".hero\",\"color\"],[\":root\",\"--gold\"]]'");
    process.exit(1);
  }
}
if (!pairs.length) pairs = [[".hero", "backgroundImage"]];

const PORT = 9222;

function getJSON(path) {
  return new Promise((res, rej) => {
    http
      .get({ host: "127.0.0.1", port: PORT, path }, (r) => {
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () => {
          try {
            res(JSON.parse(d));
          } catch (e) {
            rej(e);
          }
        });
      })
      .on("error", rej);
  });
}

(async () => {
  const targets = await getJSON("/json/list");
  const page = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
  if (!page) throw new Error("tidak ada target page di Chrome debug");

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();

  const send = (method, params) =>
    new Promise((res) => {
      const msgId = ++id;
      pending.set(msgId, res);
      ws.send(JSON.stringify({ id: msgId, method, params: params || {} }));
    });

  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result);
      pending.delete(msg.id);
    }
  });

  await new Promise((r) => ws.addEventListener("open", r));
  await send("Page.enable");
  await send("Runtime.enable");

  /* Opsional: set lebar viewport, contoh: node probe-style.js <url> <probe> light 1440 */
  const lebar = Number(process.argv[5]);
  if (Number.isFinite(lebar) && lebar > 0) {
    await send("Emulation.setDeviceMetricsOverride", {
      width: lebar,
      height: 1200,
      deviceScaleFactor: 1,
      mobile: false,
    });
  }

  await send("Page.navigate", { url });
  await new Promise((r) => setTimeout(r, 3500));

  /* Buang service worker + cache supaya yang diuji benar-benar file terbaru. */
  await send("Runtime.evaluate", {
    expression:
      "(async()=>{const rs=await navigator.serviceWorker.getRegistrations();" +
      "for(const r of rs) await r.unregister();" +
      "const ks=await caches.keys();" +
      "for(const k of ks) await caches.delete(k);" +
      "return rs.length+' sw, '+ks.length+' cache dibersihkan';})()",
    awaitPromise: true,
    returnByValue: true,
  });

  /* Muat ulang denganabaikan cache. */
  await send("Page.reload", { ignoreCache: true });
  await new Promise((r) => setTimeout(r, 3500));

  const mode = await send("Runtime.evaluate", {
    expression: "document.documentElement.getAttribute('data-theme')",
    returnByValue: true,
  });
  console.log("mode tema:", mode && mode.result ? mode.result.value : "?");

  /* Paksa tema tertentu supaya bisa bandingkan light vs dark. */
  const maks = process.argv[4];
  if (maks === "light" || maks === "dark") {
    await send("Runtime.evaluate", {
      expression:
        "document.documentElement.setAttribute('data-theme'," +
        JSON.stringify(maks) +
        ");'ok'",
      returnByValue: true,
    });
    await new Promise((r) => setTimeout(r, 400));
    console.log("mode dipaksa:", maks);
  }
  console.log("-".repeat(64));

  for (const [sel, prop] of pairs) {
    /* Mode "js:<ekspresi>" untuk menjalankan JS bebas ( diagnostik ). */
    if (typeof sel === "string" && sel.slice(0, 3) === "js:") {
      const r = await send("Runtime.evaluate", {
        expression: sel.slice(3),
        returnByValue: true,
        awaitPromise: true,
      });
      const v = r && r.result ? r.result.value : JSON.stringify(r && r.exceptionDetails ? r.exceptionDetails.text : "?");
      console.log("--- JS ---");
      console.log(typeof v === "string" ? v : JSON.stringify(v, null, 2));
      continue;
    }
    const expr = `(function(){
      var el=document.querySelector(${JSON.stringify(sel)});
      if(!el) return "ELEMEN TIDAK ADA";
      return getComputedStyle(el).getPropertyValue(${JSON.stringify(prop)});
    })()`;
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
    const val = r && r.result ? r.result.value : "?";
    console.log((sel + " { " + prop + " }").padEnd(52), "=", val);
  }

  ws.close();
  process.exit(0);
})().catch((e) => {
  console.error("GAGAL:", e.message);
  process.exit(1);
});
