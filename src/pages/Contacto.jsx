import React from 'react';
import '../css/Contacto.css';
import MapaBulonera from '../utils/MapaBulonera';
import { FcShop, FcAbout } from "react-icons/fc";

const Contacto = () => {
  return (
    <div className='contacto-container'>
      <p className='titulo-contacto'>Contáctanos</p>
      <div>
      </div>

      <div className='grid-contacto'>
        <div className='atencion-cliente-container'>
          <div className='atencion-cliente-titulo'>
            <p className='subtitulo-contacto'>Atención al cliente</p>
            <p style={{ fontFamily: "cursive" }}>Dispuestos a atenderte, de tu lado, con profesionalismo</p>
          </div>
          <div className='atencion-cliente-descripcion'>

            <div className='atencion-grid-1'>
              <FcShop size={60} />
              <div style={{ marginLeft: "10px" }}>
                <p className='horario-atencion'>Lunes a Viernes: 8hs – 19hs</p>
                <p className='horario-atencion'>Sábados: 8hs – 12:30hs</p>
              </div>
            </div>

            <div className='atencion-grid-2'>
              <FcAbout size={60} />
              <div style={{ marginLeft: "10px" }}>
                <p className='horario-atencion'>buloeltriangulo@gmail.com</p>
              </div>
            </div>
          </div>
          <div className='container-mapa'>
            <p className='subtitulo-contacto'>Nuestra Sucursal</p>
            <MapaBulonera />
          </div>
        </div>
        <div className='formulario-contacto'>
          <p><span className='titulo-bulonera'>Dejanos tu mensaje</span></p>
          <form action="">
            <div className='form-group'>
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id='nombre'
                name='nombre'
                placeholder='Juan'
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor="empresa">Empresa/Comercio *</label>
              <input
                type="text"
                id='empresa'
                name='empresa'
                placeholder='Mi empresa S.R.L'

              />
            </div>

            <div className='form-group'>
              <label htmlFor="email">Email *</label>
              <input type="email"
                id='email'
                name='email'
                required
                placeholder='juan@miempresa.com'
              />
            </div>

            <div className='form-group'>
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id='telefono'
                name='telefono'
                placeholder='+54 9 11 1234 5678'
                required
              />
            </div>
            <div className='form-group'>
              <label htmlFor="mensaje">Mensaje</label>
              <textarea
                name="mensaje"
                id="mensaje"
                rows="10"
                style={{
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  resize: "vertical",
                  transition: "border-color 0.3s ease"
                }}
                placeholder='Escribe tu mensaje aquí...'
                required
              ></textarea>
            </div>

            <button className='btn-form' type='submit'>Enviar</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Contacto;