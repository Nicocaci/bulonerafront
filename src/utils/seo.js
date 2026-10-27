// Títulos, descripciones y datos estructurados de cada página (Fase 6).
// Lo usan los dos lados:
// - server.js los escribe en el HTML antes de enviarlo (para Google y para las vistas
//   previas de WhatsApp y Facebook, que no ejecutan JavaScript).
// - El sitio los actualiza al navegar entre páginas (utils/metaDocumento.js).
// Sin dependencias del navegador ni de Vite: tiene que poder correr en Node.
import { nombreCategoria } from "./categorias.js";

export const SITIO = {
  nombre: "Bulonera El Triángulo",
  url: "https://buloneraeltriangulo.com",
  imagen: "https://buloneraeltriangulo.com/og-image.jpg",
  logo: "https://buloneraeltriangulo.com/logo-fondo-blanco.png",
};

const DESCRIPCION_SITIO =
  "Bulonera El Triángulo: bulones, herramientas y elementos de seguridad industrial. Comprá online y recibí en tu casa o retirá por el local.";

const conMarca = (titulo) => `${titulo} | ${SITIO.nombre}`;

// Páginas privadas o de un solo uso: no se indexan
const NO_INDEXAR = ["/carrito", "/checkout", "/perfil", "/gracias"];

const recortar = (texto = "", max = 160) => {
  const limpio = String(texto).replace(/\s+/g, " ").trim();
  if (limpio.length <= max) return limpio;
  return `${limpio.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
};

/**
 * Meta de una ruta del sitio (sin contar el detalle de producto, que usa metaDeProducto).
 * Devuelve { titulo, descripcion, canonical, indexar }.
 */
export function metaDeRuta(pathname = "/", search = "") {
  const ruta = pathname.replace(/\/+$/, "") || "/";
  const params = new URLSearchParams(search);
  const base = { descripcion: DESCRIPCION_SITIO, indexar: true, canonical: `${SITIO.url}${ruta === "/" ? "/" : ruta}` };

  if (NO_INDEXAR.some((r) => ruta === r || ruta.startsWith(`${r}/`))) {
    const titulos = {
      "/carrito": "Tu carrito",
      "/checkout": "Finalizar compra",
      "/perfil": "Mi cuenta",
      "/gracias": "Compra finalizada",
    };
    const clave = NO_INDEXAR.find((r) => ruta === r || ruta.startsWith(`${r}/`));
    return { ...base, titulo: conMarca(titulos[clave]), indexar: false };
  }

  switch (ruta) {
    case "/":
      return { ...base, titulo: `${SITIO.nombre} | Herramientas y Seguridad Industrial` };
    case "/contacto":
      return {
        ...base,
        titulo: conMarca("Contacto y cotizaciones"),
        descripcion:
          "Pedí tu cotización por WhatsApp, email o con el formulario. Estamos en Camino General Belgrano 6444, Gutiérrez. Lunes a viernes de 8 a 18 h y sábados de 8 a 13 h.",
      };
    case "/nosotros":
      return {
        ...base,
        titulo: conMarca("Nosotros"),
        descripcion:
          "Desde 1998 brindamos soluciones en fijaciones, herramientas y productos de ferretería para la industria, el taller y el hogar.",
      };
    case "/faq":
      return {
        ...base,
        titulo: conMarca("Preguntas frecuentes"),
        descripcion:
          "Cómo comprar en Bulonera El Triángulo: envíos a todo el país, retiro sin cargo en el local, pagos con Mercado Pago y devoluciones.",
      };
    case "/productos": {
      const categoria = params.get("categoria");
      const marca = params.get("marca");
      const busqueda = params.get("search");
      if (busqueda) {
        // Los resultados de búsqueda no se indexan (serían infinitas páginas casi iguales)
        return { ...base, titulo: conMarca(`Resultados para "${recortar(busqueda, 40)}"`), indexar: false };
      }
      if (categoria) {
        const nombre = nombreCategoria(categoria);
        return {
          ...base,
          titulo: conMarca(nombre),
          descripcion: `${nombre} en Bulonera El Triángulo. Comprá online con envío a todo el país o retirá sin cargo en el local de Gutiérrez.`,
          canonical: `${SITIO.url}/productos?categoria=${encodeURIComponent(categoria)}`,
        };
      }
      if (marca) {
        return {
          ...base,
          titulo: conMarca(`Productos ${marca}`),
          descripcion: `Productos ${marca} en Bulonera El Triángulo. Comprá online con envío a todo el país o retirá sin cargo en el local de Gutiérrez.`,
          canonical: `${SITIO.url}/productos?marca=${encodeURIComponent(marca)}`,
        };
      }
      if (params.get("ofertas") === "true") {
        return {
          ...base,
          titulo: conMarca("Ofertas"),
          descripcion: "Productos con descuento en Bulonera El Triángulo, por tiempo limitado.",
          canonical: `${SITIO.url}/productos?ofertas=true`,
        };
      }
      return {
        ...base,
        titulo: conMarca("Todos los productos"),
        descripcion:
          "Bulones, fijaciones, herramientas manuales y eléctricas, soldadura y más. Comprá online con envío a todo el país.",
      };
    }
    default:
      return { ...base, titulo: `${SITIO.nombre} | Herramientas y Seguridad Industrial` };
  }
}

// Imagen de Cloudinary en JPG de 1200 px (WhatsApp y Facebook no siempre aceptan WebP/AVIF)
export const imagenParaCompartir = (url) => {
  if (typeof url !== "string" || !/^https:\/\/res\.cloudinary\.com\/.+\/upload\//.test(url)) {
    return SITIO.imagen;
  }
  return url.replace("/upload/", "/upload/f_jpg,q_auto,c_limit,w_1200/");
};

const primeraImagen = (producto) =>
  Array.isArray(producto?.imagen) ? producto.imagen[0] : producto?.imagen;

/** Meta del detalle de un producto (datos de GET /api/products/:id). */
export function metaDeProducto(producto, id) {
  const canonical = `${SITIO.url}/producto/${id || producto?._id}`;
  // La marca se agrega solo si el nombre no la incluye ya ("Amoladora Ronix 115 mm")
  const nombre = String(producto?.item || "");
  const marca =
    producto?.marca && !nombre.toLowerCase().includes(String(producto.marca).toLowerCase())
      ? ` ${producto.marca}`
      : "";
  const descripcion = producto?.descripcion && producto.descripcion.trim().length > 20
    ? recortar(producto.descripcion)
    : `Comprá ${producto?.item || "este producto"}${marca} en Bulonera El Triángulo. Envíos a todo el país o retiro sin cargo en Gutiérrez.`;
  return {
    titulo: conMarca(producto?.item || "Producto"),
    descripcion,
    canonical,
    imagen: imagenParaCompartir(primeraImagen(producto)),
    tipo: "product",
    indexar: producto?.estado !== "inactivo",
    precio: producto?.precioFinal ?? producto?.precioConIva,
  };
}

// ─── Datos estructurados (JSON-LD) ─────────────────────────────

export const jsonLdNegocio = () => ({
  "@context": "https://schema.org",
  "@type": "HardwareStore",
  "@id": `${SITIO.url}/#negocio`,
  name: SITIO.nombre,
  legalName: "Bulonera El Triángulo S.R.L.",
  url: `${SITIO.url}/`,
  logo: SITIO.logo,
  image: SITIO.imagen,
  telephone: "+54 9 11 5154-4062",
  email: "eltrianguloventasonline@gmail.com",
  foundingDate: "1998",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Camino General Belgrano 6444",
    addressLocality: "Gutiérrez",
    postalCode: "1884",
    addressRegion: "Buenos Aires",
    addressCountry: "AR",
  },
  // Coordenadas del local según el mapa de Google de la página de Contacto
  geo: { "@type": "GeoCoordinates", latitude: -34.8173, longitude: -58.1995 },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:00", closes: "13:00" },
  ],
  sameAs: ["https://www.instagram.com/buloneraeltriangulo/"],
});

export function jsonLdProducto(producto, id) {
  const meta = metaDeProducto(producto, id);
  const imagenes = (Array.isArray(producto?.imagen) ? producto.imagen : [producto?.imagen])
    .filter((u) => typeof u === "string" && u.startsWith("https://"))
    .slice(0, 5);
  const datos = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto?.item,
    description: meta.descripcion,
    sku: producto?.sku,
    image: imagenes.length ? imagenes : [SITIO.imagen],
    url: meta.canonical,
  };
  if (producto?.marca) datos.brand = { "@type": "Brand", name: producto.marca };
  if (producto?.categoria) datos.category = nombreCategoria(producto.categoria);
  if (meta.precio != null) {
    datos.offers = {
      "@type": "Offer",
      url: meta.canonical,
      priceCurrency: "ARS",
      price: Number(meta.precio).toFixed(2),
      availability:
        producto?.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: SITIO.nombre },
    };
  }
  return datos;
}

// Para meter JSON dentro de un <script>: evita que un "</script>" en los datos lo corte
export const jsonParaScript = (datos) => JSON.stringify(datos).replace(/</g, "\\u003c");
