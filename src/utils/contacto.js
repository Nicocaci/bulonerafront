// Datos de contacto del negocio en un solo lugar (antes estaban repetidos en varios
// componentes). Si cambia algún dato, se cambia acá.
export const CONTACTO = {
  whatsapp: "5491151544062",
  telefonoVisible: "+54 9 11 5154-4062",
  email: "eltrianguloventasonline@gmail.com",
  direccion: "Camino General Belgrano 6444",
  localidad: "Gutiérrez (CP 1884)",
  horarioSemana: "Lunes a viernes: 8 a 18 h",
  horarioSabado: "Sábados: 8 a 13 h",
  instagram: "https://www.instagram.com/buloneraeltriangulo/",
};

export const MENSAJE_WHATSAPP = "Hola! Quiero hacer una consulta sobre sus productos";

export const urlWhatsapp = (mensaje = MENSAJE_WHATSAPP) =>
  `https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent(mensaje)}`;
