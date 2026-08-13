import { useState } from "react";
import "../css/Contacto.css";
import MapaBulonera from "../utils/MapaBulonera.jsx";
import { FcShop, FcAbout } from "react-icons/fc";
import {
  FaRegClock,
  FaLock,
  FaWhatsapp,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
} from "react-icons/fa";
import { BsFillQuestionSquareFill, BsFillSendFill } from "react-icons/bs";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { IoIosPaper } from "react-icons/io";
import axiosInstance from "../utils/axiosConfig.js";
import Swal from "sweetalert2";

const Contacto = () => {
  const phoneNumber = "5491151544062";
  const message = "Hola! Quiero hacer una consulta sobre sus productos";
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    empresa: "",
    telefono: "",
    mensaje: "",
  });
  const [archivos, setArchivos] = useState([]);

  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const nuevosArchivos = Array.from(e.target.files);
    setArchivos((prev) => [...prev, ...nuevosArchivos]);
  };

  const removeArchivo = (index) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        data.append(key, value),
      );
      archivos.forEach((file) => data.append("archivos", file));

      const response = await axiosInstance.post("/api/email/send", data);

      Swal.fire({
        icon: "success",
        title: "Mensaje enviado",
        text: response.data.message,
        confirmButtonColor: "#000",
      });

      setFormData({
        nombre: "",
        email: "",
        empresa: "",
        telefono: "",
        mensaje: "",
      });
      setArchivos([]);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al enviar el mensaje",
        confirmButtonColor: "#000",
      });
    }
  };

  //Funcion Helper para elegir el icono del archivo seleccionado
  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();

    switch (ext) {
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
        return <FaFileImage color="#805ad5" />;
      default:
        return <FaFile color="#718096" />;
    }
  };

  return (
    <div className="contacto-container">
      <div className="grid-contacto">
        <div className="formulario-contacto">
          <div className="header-cotizacion">
            <div className="banner-content">
              <div className="content-1-coti">
                <IoIosPaper size={50} color="#07478d" />
                <p className="titulo-contacto">Solicita una Cotización</p>
              </div>
              <p className="subtitulo-contacto">
                Tenés una lista de materiales, un plano o una foto?
              </p>
              <p className="subtitulo-contacto">
                Enviános lo que tengas y te respondemos con una cotización
              </p>
              <a
                className="a-none"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="btn-wp">
                  <FaWhatsapp size={30} />
                  <p>Hablar por WhatsApp</p>
                </div>
              </a>

              <div className="divider">
                <span className="divider-line"></span>
                <span className="divider-text">o completá el formulario ↓</span>
                <span className="divider-line"></span>
              </div>
            </div>
          </div>
          <div className="seccion-cotizacion">
            <div className="form-container-coti">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <p className="titulo-form">Que necesitas?</p>
                  <p className="subtitulo-form">
                    Contanos con el mayor detalle posible para poder ayudarte
                  </p>
                  <textarea
                    name="mensaje"
                    id="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    rows="10"
                    placeholder="Escribí el detalle..."
                    required
                    className="text-area"
                  ></textarea>
                  <div>
                    <p className="titulo-form">Ajuntar archivos (opcional)</p>
                    <p className="subtitulo-form">
                      Pódes subir planos, lista de materiales, fotos o cualquier
                      documento que nos ayude
                    </p>
                    <div className="file-upload">
                      <label htmlFor="archivos" className="file-upload-label">
                        <div className="file-upload-box">
                          <svg
                            className="upload-icon"
                            viewBox="0 0 24 24"
                            width="40"
                            height="40"
                          >
                            <path
                              fill="currentColor"
                              d="M12 2L12 15M12 2L7 7M12 2L17 7M5 18H19V21H5V18Z"
                            />
                          </svg>
                          <p>
                            <strong>Arrastrá archivos aquí</strong>
                          </p>
                          <p>o</p>
                          <span className="btn-seleccionar">
                            Seleccionar archivos
                          </span>
                        </div>
                        <input
                          type="file"
                          id="archivos"
                          name="archivos"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                          multiple
                          hidden
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="file-upload-hint">
                        Formatos permitidos:{" "}
                        <FaFilePdf className="inline-icon" color="#e53e3e" />{" "}
                        PDF,{" "}
                        <FaFileWord className="inline-icon" color="#2b579a" />{" "}
                        Word,{" "}
                        <FaFileExcel className="inline-icon" color="#217346" />{" "}
                        Excel,{" "}
                        <FaFileImage className="inline-icon" color="#805ad5" />{" "}
                        Imágenes (JPG, PNG)
                      </p>

                      <ul className="archivos-seleccionados">
                        {archivos.map((file, i) => (
                          <li key={i}>
                            <span className="file-icon">
                              {getFileIcon(file.name)}
                            </span>
                            {file.name}
                            <button
                              className="remove-file-btn"
                              type="button"
                              onClick={() => removeArchivo(i)}
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="form-group d-flex-row">
                  <div>
                    <label className="label-form" htmlFor="nombre">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Juan"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="empresa">Empresa/Comercio (Opcional)</label>
                    <input
                      type="text"
                      id="empresa"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      placeholder="Mi empresa S.R.L"
                    />
                  </div>
                </div>

                <div className="form-group d-flex-row">
                  <div>
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="juan@miempresa.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="telefono">Teléfono *</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder=""
                      required
                    />
                  </div>
                </div>
                <div>
                  <button className="btn-form" type="submit">
                    <BsFillSendFill />
                    Solicitar Cotización
                  </button>
                </div>
              </form>
            </div>
            <div className="cotizacion-detalle">
              <div className="cotizacion-border">
                <div className="content-1-coti">
                  <BsFillQuestionSquareFill size={50} color="#07478d" />
                  <p className="titulo-detalle">
                    ¿No sabés exactamente lo que necesitás?
                  </p>
                </div>
                <div className="text-content-coti">
                  <p>No hay problema.</p>
                  <p>
                    Pódes enviarme una foto, un plano, una muestra o una lista
                    de materiales. Nosotros te ayudamos a identificar el
                    producto
                  </p>
                </div>
              </div>
              <div className="cotizacion-border">
                <div className="content-1-coti">
                  <FaRegClock size={40} color="#07478d" />
                  <p className="titulo-detalle">Respuesta rápida</p>
                </div>
                <div className="text-content-coti">
                  <p>
                    Respondemos las solicitudes dentro del horario comercial.
                  </p>
                </div>
              </div>
              <div className="cotizacion-border">
                <div className="content-1-coti">
                  <MdOutlineVerifiedUser size={40} color="#07478D" />
                  <p className="titulo-detalle">Asesoriamiento experto</p>
                </div>
                <div className="text-content-coti">
                  <p>
                    Te ayudamos a encontrar el producto correcto, inculso si no
                    conocés el código o la medida.
                  </p>
                </div>
              </div>
              <div className="cotizacion-border-none">
                <div className="content-1-coti">
                  <FaLock size={40} color="#07478D" />
                  <p className="titulo-detalle">Información segura</p>
                </div>
                <div className="text-content-coti">
                  <p>Tus datos y archivos están protegidos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="atencion-cliente-container">
          <div className="atencion-cliente-titulo">
            <p className="titulo-contacto">Atención al cliente</p>
            <p>Dispuestos a atenderte, de tu lado, con profesionalismo</p>
          </div>
          <div className="atencion-cliente-descripcion">
            <div className="atencion-grid-1">
              <FcShop size={60} />
              <div style={{ marginLeft: "10px" }}>
                <p className="horario-atencion">Lunes a Viernes: 8hs – 18hs</p>
                <p className="horario-atencion">Sábados: 8hs – 13hs</p>
              </div>
            </div>

            <div className="atencion-grid-2">
              <FcAbout size={60} />
              <div style={{ marginLeft: "10px" }}>
                <p className="horario-atencion">
                  eltrianguloventasonline@gmail.com
                </p>
              </div>
            </div>
          </div>
          <div className="container-mapa">
            <p className="subtitulo-contacto">Nuestra Sucursal</p>
            <MapaBulonera />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
