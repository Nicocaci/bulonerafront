import { useState } from "react";
import "../css/Contacto.css";
import MapaBulonera from "../utils/MapaBulonera";
import { FcShop, FcAbout } from "react-icons/fc";
import axiosInstance from "../utils/axiosConfig.js";
import Swal from "sweetalert2";

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    empresa: "",
    telefono: "",
    mensaje: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/api/email/send", formData);
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
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al enviar el mensaje",
        confirmButtonColor: "#000",
      });
    }
  };
  return (
    <div className="contacto-container">
      <p className="titulo-contacto">Contáctanos</p>
      <div className="grid-contacto">
        <div className="atencion-cliente-container">
          <div className="atencion-cliente-titulo">
            <p className="subtitulo-contacto">Atención al cliente</p>
            <p>
              Dispuestos a atenderte, de tu lado, con profesionalismo
            </p>
          </div>
          <div className="atencion-cliente-descripcion">
            <div className="atencion-grid-1">
              <FcShop size={60} />
              <div style={{ marginLeft: "10px" }}>
                <p className="horario-atencion">Lunes a Viernes: 8hs – 19hs</p>
                <p className="horario-atencion">Sábados: 8hs – 12:30hs</p>
              </div>
            </div>

            <div className="atencion-grid-2">
              <FcAbout size={60} />
              <div style={{ marginLeft: "10px" }}>
                <p className="horario-atencion">b.eltraingulo@gmail.com</p>
              </div>
            </div>
          </div>
          <div className="container-mapa">
            <p className="subtitulo-contacto">Nuestra Sucursal</p>
            <MapaBulonera />
          </div>
        </div>
        <div className="formulario-contacto">
          <p>
            <span className="titulo-bulonera">Dejanos tu mensaje</span>
          </p>
          <form onSubmit={handleSubmit} >
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
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

            <div className="form-group">
              <label htmlFor="empresa">Empresa/Comercio *</label>
              <input
                type="text"
                id="empresa"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                placeholder="Mi empresa S.R.L"
              />
            </div>

            <div className="form-group">
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

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+54 9 11 1234 5678"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="mensaje">Mensaje</label>
              <textarea
                name="mensaje"
                id="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                rows="10"
                style={{
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  resize: "vertical",
                  transition: "border-color 0.3s ease",
                }}
                placeholder="Escribe tu mensaje aquí..."
                required
              ></textarea>
            </div>

            <button className="btn-form" type="submit">
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
