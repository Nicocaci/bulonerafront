// Nombres de categoría para mostrar. En la base algunas están sin tildes
// ("Herramientas Electricas", "Jardin"): acá se muestran bien escritas.
// El valor original se sigue usando en los links y filtros.

// Sin tildes y en minúsculas, para comparar nombres
export const normalizarTexto = (texto = "") =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const NOMBRES = {
  "herramientas electricas": "Herramientas eléctricas",
  "herramientas manuales": "Herramientas manuales",
  "herramientas inalambricas": "Herramientas inalámbricas",
  jardin: "Jardín",
};

export const nombreCategoria = (valor = "") => NOMBRES[normalizarTexto(valor)] || valor;
