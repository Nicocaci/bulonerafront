import { SITIO } from "./seo.js";

// Actualiza <title> y los meta del <head> al navegar dentro del sitio (el HTML inicial
// ya llega con los de la página pedida, escritos por server.js).

const asegurar = (selector, crear) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = crear();
    document.head.appendChild(el);
  }
  return el;
};

const metaNombre = (name, content) => {
  const el = asegurar(`meta[name="${name}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute("name", name);
    return m;
  });
  el.setAttribute("content", content);
};

const metaPropiedad = (property, content) => {
  const el = asegurar(`meta[property="${property}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute("property", property);
    return m;
  });
  el.setAttribute("content", content);
};

export function aplicarMeta({ titulo, descripcion, canonical, indexar = true, imagen, tipo }) {
  if (typeof document === "undefined") return;
  if (titulo) document.title = titulo;
  if (descripcion) metaNombre("description", descripcion);
  metaNombre("robots", indexar ? "index, follow" : "noindex, follow");
  if (canonical) {
    const link = asegurar('link[rel="canonical"]', () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    });
    link.setAttribute("href", canonical);
  }
  metaPropiedad("og:title", titulo || SITIO.nombre);
  if (descripcion) metaPropiedad("og:description", descripcion);
  if (canonical) metaPropiedad("og:url", canonical);
  metaPropiedad("og:image", imagen || SITIO.imagen);
  metaPropiedad("og:type", tipo || "website");
}
