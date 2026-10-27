import { useState } from "react";
import "../css/Contacto.css";
import MapaBulonera from "../utils/MapaBulonera.jsx";
import { FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFile } from "react-icons/fa";
import axiosInstance from "../utils/axiosConfig.js";
import Swal from "sweetalert2";
import { CONTACTO, urlWhatsapp } from "../utils/contacto.js";

// Mismos límites que el backend (config/multerConfig.js)
const MAX_ARCHIVOS = 5;
const MAX_MB = 7;
const EXTENSIONES_DOC = ["pdf", "doc", "docx", "xls", "xlsx"];

const extensionDe = (nombre = "") => nombre.split(".").pop().toLowerCase();

const esArchivoPermitido = (file) =>
  file.type.startsWith("image/") || EXTENSIONES_DOC.includes(extensionDe(file.name));

const escaparHtml = (texto) =>
  String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const FORM_VACIO = {
  nombre: "",
  email: "",
  empresa: "",
  telefono: "",
  mensaje: "",
};

// Ícono según el tipo de archivo adjuntado
const iconoArchivo = (nombre) => {
  switch (extensionDe(nombre)) {
    case "pdf":
      return <FaFilePdf color="#e53e3e" />;
    case "doc":
    case "docx":
      return <FaFileWord color="#2b579a" />;
    case "xls":
    case "xlsx":
      return <FaFileExcel color="#217346" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "webp":
    case "gif":
    case "heic":
      return <FaFileImage color="#805ad5" />;
    default:
      return <FaFile color="#718096" />;
  }
};

const IconoWhatsapp = ({ size = 20 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" />
  </svg>
);

const IconoDato = ({ children }) => (
  <svg aria-hidden="true" className="contacto-dato__icono" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const Contacto = () => {
  const [formData, setFormData] = useState(FORM_VACIO);
  const [archivos, setArchivos] = useState([]);
  const [arrastrando, setArrastrando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Valida y agrega archivos (desde el selector o arrastrados)
  const agregarArchivos = (lista) => {
    const nuevos = Array.from(lista || []);
    if (!nuevos.length) return;

    const rechazados = [];
    const aceptados = [];

    nuevos.forEach((file) => {
      if (!esArchivoPermitido(file)) {
        rechazados.push(`${file.name}: formato no permitido`);
      } else if (file.size > MAX_MB * 1024 * 1024) {
        rechazados.push(`${file.name}: supera los ${MAX_MB} MB`);
      } else {
        aceptados.push(file);
      }
    });

    const sinRepetir = aceptados.filter(
      (f) => !archivos.some((p) => p.name === f.name && p.size === f.size),
    );
    const lugar = Math.max(MAX_ARCHIVOS - archivos.length, 0);
    if (sinRepetir.length > lugar) {
      rechazados.push(`Podés adjuntar hasta ${MAX_ARCHIVOS} archivos en total`);
    }
    const aAgregar = sinRepetir.slice(0, lugar);
    if (aAgregar.length) setArchivos([...archivos, ...aAgregar]);

    if (rechazados.length) {
      Swal.fire({
        icon: "warning",
        title: "Algunos archivos no se agregaron",
        html: rechazados.map((r) => `<div>${escaparHtml(r)}</div>`).join(""),
        confirmButtonColor: "#000",
      });
    }
  };

  const handleFileChange = (e) => {
    agregarArchivos(e.target.files);
    // Permite volver a elegir el mismo archivo después de quitarlo
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!arrastrando) setArrastrando(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Ignora el dragleave que se dispara al pasar sobre elementos hijos
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setArrastrando(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setArrastrando(false);
    agregarArchivos(e.dataTransfer.files);
  };

  const removeArchivo = (index) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      archivos.forEach((file) => data.append("archivos", file));

      const response = await axiosInstance.post("/api/email/send", data);

      Swal.fire({
        icon: "success",
        title: "Mensaje enviado",
        text: response.data.message,
        confirmButtonColor: "#000",
      });

      setFormData(FORM_VACIO);
      setArchivos([]);
    } catch (error) {
      let texto = error.response?.data?.message;
      if (!texto) {
        texto = error.response
          ? "No pudimos enviar tu consulta. Probá de nuevo o escribinos por WhatsApp."
          : "No pudimos conectarnos con el servidor. Revisá tu conexión o escribinos por WhatsApp.";
      }
      Swal.fire({
        icon: "error",
        title: "No se pudo enviar",
        text: texto,
        confirmButtonColor: "#000",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="contacto">
      <section className="contacto-hero">
        <div className="contacto-hero__interior">
          <div className="contacto-hero__texto">
            <p className="contacto__eyebrow">Cotizaciones</p>
            <h1 className="contacto-hero__titulo">Solicitá una cotización</h1>
            <p className="contacto-hero__bajada">
              ¿Tenés una lista de materiales, un plano o una foto? Envianos lo que tengas y te
              respondemos con una cotización.
            </p>
            <div className="contacto-hero__acciones">
              <a
                className="contacto-btn contacto-btn--whatsapp"
                href={urlWhatsapp()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconoWhatsapp />
                Hablar por WhatsApp
              </a>
              <a className="contacto-btn contacto-btn--borde" href="#formulario">
                Completar el formulario
              </a>
            </div>
          </div>
          <div className="contacto-hero__foto" aria-hidden="true" />
        </div>
      </section>

      <div className="contacto-cuerpo">
        <form id="formulario" className="contacto-form" onSubmit={handleSubmit}>
          <div>
            <h2 className="contacto-form__titulo">¿Qué necesitás?</h2>
            <p className="contacto-form__ayuda">
              Contanos con el mayor detalle posible para poder ayudarte.
            </p>
          </div>

          <label htmlFor="mensaje" className="solo-lectores">
            Detalle del pedido
          </label>
          <textarea
            name="mensaje"
            id="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            rows="6"
            placeholder='Ej.: 200 bulones hexagonales 1/2" x 2" zincados, 200 tuercas y arandelas…'
            required
            className="contacto-form__detalle"
          />

          <div className="contacto-adjuntos">
            <label
              htmlFor="archivos"
              className={`contacto-adjuntos__zona ${arrastrando ? "contacto-adjuntos__zona--activa" : ""}`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <svg aria-hidden="true" className="contacto-adjuntos__icono" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4M7 9l5-5 5 5" />
                <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
              </svg>
              <span className="contacto-adjuntos__texto">
                <strong>{arrastrando ? "Soltá los archivos acá" : "Adjuntá archivos (opcional)"}</strong>
                <span>
                  PDF, Word, Excel o imágenes · hasta {MAX_ARCHIVOS} archivos de {MAX_MB} MB
                </span>
              </span>
              <span className="contacto-adjuntos__boton">Elegir archivos</span>
              <input
                type="file"
                id="archivos"
                name="archivos"
                accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                multiple
                className="solo-lectores"
                onChange={handleFileChange}
              />
            </label>

            {archivos.length > 0 && (
              <ul className="contacto-adjuntos__lista">
                {archivos.map((file, i) => (
                  <li key={`${file.name}-${file.size}`}>
                    <span className="contacto-adjuntos__tipo">{iconoArchivo(file.name)}</span>
                    <span className="contacto-adjuntos__nombre">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeArchivo(i)}
                      aria-label={`Quitar ${file.name}`}
                    >
                      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="contacto-form__campos">
            <label className="contacto-campo contacto-campo--nombre">
              Nombre *
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Juan"
                autoComplete="name"
                required
              />
            </label>
            <label className="contacto-campo contacto-campo--email">
              Email *
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan@miempresa.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="contacto-campo contacto-campo--telefono">
              Teléfono *
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                autoComplete="tel"
                required
              />
            </label>
            <label className="contacto-campo contacto-campo--empresa">
              Empresa o comercio (opcional)
              <input
                type="text"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                placeholder="Mi empresa S.R.L."
                autoComplete="organization"
              />
            </label>
          </div>

          <button className="contacto-form__enviar" type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Solicitar cotización"}
          </button>
          <p className="contacto-form__nota">
            Te ayudamos aunque no sepas el código o la medida exacta.
          </p>
        </form>

        <aside className="contacto-lateral">
          <div className="contacto-atencion">
            <h2 className="contacto-atencion__titulo">Atención al cliente</h2>
            <div className="contacto-dato">
              <IconoDato>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </IconoDato>
              <p>
                {CONTACTO.horarioSemana}
                <br />
                {CONTACTO.horarioSabado}
              </p>
            </div>
            <div className="contacto-dato">
              <IconoDato>
                <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" />
              </IconoDato>
              <p>
                WhatsApp
                <br />
                <a href={urlWhatsapp()} target="_blank" rel="noopener noreferrer">
                  {CONTACTO.telefonoVisible}
                </a>
              </p>
            </div>
            <div className="contacto-dato">
              <IconoDato>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </IconoDato>
              <p>
                Email
                <br />
                <a href={`mailto:${CONTACTO.email}`} className="contacto-dato__email">
                  {CONTACTO.email}
                </a>
              </p>
            </div>
            <div className="contacto-dato">
              <IconoDato>
                <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </IconoDato>
              <p>
                {CONTACTO.direccion}
                <br />
                {CONTACTO.localidad}
              </p>
            </div>
          </div>
          <div className="contacto-mapa">
            <MapaBulonera />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Contacto;
