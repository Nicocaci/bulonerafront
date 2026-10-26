import express from "express";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const app = express();
const PORT = process.env.PORT || 3000;

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

// Resto de los archivos de public/ (logos, fotos, favicon): 1 día de caché.
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

// Cualquier otra ruta es de la app (React Router). El index.html no se guarda en caché:
// así, después de un deploy, el navegador siempre toma la versión nueva.
app.get(/.*/, (req, res) => {
  res.set("Cache-Control", "no-cache");
  res.sendFile(path.join(DIST, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Frontend corriendo en puerto ${PORT}`);
});
