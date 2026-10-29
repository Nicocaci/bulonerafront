import express from "express";
import compression from "compression";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  SITIO,
  jsonLdNegocio,
  jsonLdProducto,
  jsonParaScript,
  metaDeProducto,
  metaDeRuta,
} from "./src/utils/seo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const app = express();
const PORT = process.env.PORT || 3000;

// URL de la API para leer productos (las mismas variables que usa el build de Vite;
// en Railway están disponibles también mientras corre el servidor)
const API_URL = (process.env.API_URL || process.env.VITE_API_URL || "").replace(/\/+$/, "");
const TIEMPO_MAXIMO_API = 1500; // ms: si la API tarda más, se manda el HTML sin datos del producto

app.disable("x-powered-by");

// Comprime JS, CSS, HTML y SVG (el JS principal pasa de ~720 KB a ~230 KB transferidos)
app.use(compression());

// /assets: archivos con un hash en el nombre (cambian de nombre en cada build), así que el
// navegador los puede guardar un año sin volver a pedirlos. Si piden uno que no existe
// (por ejemplo, de un build anterior) responde 404 en lugar del index.html.
app.use(
  "/assets",
  express.static(path.join(DIST, "assets"), {
    immutable: true,
    maxAge: "1y",
    fallthrough: false,
  }),
);

// Fuentes autohospedadas: no cambian de nombre, pero casi nunca cambian
app.use(
  "/fonts",
  express.static(path.join(DIST, "fonts"), { maxAge: "30d", fallthrough: false }),
);

// Resto de los archivos de public/ (logos, fotos, favicon, robots.txt): 1 día de caché.
// index: false para que "/" no se sirva desde acá con esa caché, y el index.html pedido
// directo tampoco se guarda.
app.use(
  express.static(DIST, {
    maxAge: "1d",
    index: false,
    setHeaders: (res, archivo) => {
      if (archivo.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
    },
  }),
);

// ─── Consultas a la API con tiempo máximo y caché corta ────────
const cache = new Map();
const NO_EXISTE = Symbol("no existe"); // la API respondió 404

async function pedirApi(ruta, minutosCache) {
  if (!API_URL) return null;
  const guardado = cache.get(ruta);
  if (guardado && guardado.vence > Date.now()) return guardado.datos;

  const control = new AbortController();
  const corte = setTimeout(() => control.abort(), TIEMPO_MAXIMO_API);
  try {
    const res = await fetch(`${API_URL}${ruta}`, { signal: control.signal });
    if (res.status === 404) return NO_EXISTE;
    if (!res.ok) return null;
    const datos = await res.json();
    if (cache.size > 1000) cache.clear();
    cache.set(ruta, { datos, vence: Date.now() + minutosCache * 60 * 1000 });
    return datos;
  } catch {
    return null; // API caída o lenta: se sigue sin esos datos
  } finally {
    clearTimeout(corte);
  }
}

// ─── HTML con el título, la descripción y los datos de cada página ──
// index.html se lee una vez al arrancar (cambia solo con un deploy)
let htmlBase = null;
const leerHtmlBase = () => {
  if (!htmlBase) htmlBase = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
  return htmlBase;
};

const escapar = (texto = "") =>
  String(texto)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const reemplazarMeta = (html, atributo, nombre, valor) =>
  html.replace(
    new RegExp(`(<meta\\s+${atributo}="${nombre}"\\s+content=")[^"]*(")`),
    `$1${escapar(valor)}$2`,
  );

function armarHtml(meta, jsonLd = []) {
  let html = leerHtmlBase();
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapar(meta.titulo)}</title>`);
  html = html.replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${escapar(meta.descripcion)}$2`,
  );
  html = html.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
    `$1${escapar(meta.canonical)}$2`,
  );
  html = reemplazarMeta(html, "property", "og:type", meta.tipo || "website");
  html = reemplazarMeta(html, "property", "og:title", meta.titulo);
  html = reemplazarMeta(html, "property", "og:description", meta.descripcion);
  html = reemplazarMeta(html, "property", "og:image", meta.imagen || SITIO.imagen);
  html = reemplazarMeta(html, "property", "og:url", meta.canonical);

  const extra = [`<meta name="robots" content="${meta.indexar ? "index, follow" : "noindex, follow"}" />`];
  if (meta.tipo === "product" && meta.precio != null) {
    extra.push(`<meta property="product:price:amount" content="${escapar(Number(meta.precio).toFixed(2))}" />`);
    extra.push('<meta property="product:price:currency" content="ARS" />');
  }
  for (const datos of jsonLd) {
    extra.push(`<script type="application/ld+json">${jsonParaScript(datos)}</script>`);
  }
  return html.replace("</head>", `    ${extra.join("\n    ")}\n  </head>`);
}

async function htmlDeLaPagina(req) {
  const producto = req.path.match(/^\/producto\/([a-f0-9]{24})\/?$/i);
  if (producto) {
    const id = producto[1];
    const datos = await pedirApi(`/api/products/${id}`, 5);
    if (datos === NO_EXISTE) {
      // El producto no existe: que Google no lo guarde
      return armarHtml({ ...metaDeRuta("/"), canonical: `${SITIO.url}/producto/${id}`, indexar: false });
    }
    if (!datos || !datos.item) {
      // API caída o lenta: HTML general (sin noindex, para no sacar el producto de Google
      // por una falla momentánea)
      return armarHtml({ ...metaDeRuta("/"), canonical: `${SITIO.url}/producto/${id}` });
    }
    const meta = metaDeProducto(datos, id);
    return armarHtml(meta, meta.indexar ? [jsonLdProducto(datos, id)] : []);
  }

  const query = req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "";
  const meta = metaDeRuta(req.path, query);
  // Datos del negocio (dirección, horarios, teléfono) en el inicio y en Contacto
  const conNegocio = req.path === "/" || req.path.replace(/\/+$/, "") === "/contacto";
  return armarHtml(meta, conNegocio ? [jsonLdNegocio()] : []);
}

// ─── sitemap.xml: páginas, categorías y productos activos ──────
const PAGINAS_FIJAS = ["/", "/productos", "/nosotros", "/contacto", "/faq"];

async function armarSitemap() {
  const urls = PAGINAS_FIJAS.map((p) => `${SITIO.url}${p}`);

  const facetas = await pedirApi("/api/products/facetas", 60);
  for (const c of facetas?.categorias ?? []) {
    urls.push(`${SITIO.url}/productos?categoria=${encodeURIComponent(c.valor)}`);
  }

  // Todos los productos activos, de a 48 (el máximo por página de la API)
  for (let pagina = 1; pagina <= 100; pagina++) {
    const datos = await pedirApi(`/api/products?limit=48&page=${pagina}&vista=resumen`, 60);
    if (!datos?.products?.length) break;
    for (const p of datos.products) urls.push(`${SITIO.url}/producto/${p._id}`);
    if (pagina >= (datos.pagination?.totalPages ?? 1)) break;
  }

  const cuerpo = urls.map((u) => `  <url><loc>${escapar(u)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${cuerpo}\n</urlset>\n`;
}

app.get("/sitemap.xml", async (req, res) => {
  try {
    const xml = await armarSitemap();
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (error) {
    console.error("No se pudo armar el sitemap:", error?.message);
    res.status(500).send("No se pudo armar el sitemap");
  }
});

// Cualquier otra ruta es de la app (React Router). El index.html no se guarda en caché:
// así, después de un deploy, el navegador siempre toma la versión nueva.
// Si algo falla al armar el HTML de la página, se manda el index.html tal cual (como antes).
app.get(/.*/, async (req, res) => {
  res.set("Cache-Control", "no-cache");
  try {
    res.type("html").send(await htmlDeLaPagina(req));
  } catch (error) {
    console.error("No se pudo armar el HTML de la página:", error?.message);
    res.sendFile(path.join(DIST, "index.html"));
  }
});

// Errores de los archivos estáticos (sobre todo 404 de /assets y /fonts, que casi siempre
// son bots buscando archivos): una sola línea en el log en lugar del stack completo.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const ruta = String(req.originalUrl).slice(0, 200);
  if (status >= 500) {
    console.error(`${status} ${req.method} ${ruta}:`, err?.message);
  } else {
    console.warn(`${status} ${req.method} ${ruta}`);
  }
  if (res.headersSent) return;
  res.status(status).type("text").send(status === 404 ? "Not Found" : "Error");
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Frontend corriendo en puerto ${PORT}`);
    if (!API_URL) console.warn("⚠️ Falta API_URL / VITE_API_URL: las páginas de producto no van a tener sus datos para compartir.");
});
