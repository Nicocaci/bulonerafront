import React from "react";
import { Link } from "react-router-dom";
import "../css/Footer.css";
import { CONTACTO, urlWhatsapp } from "../utils/contacto.js";

// Footer oscuro en los dos temas (como el navbar). Abajo, la firma de quien hizo el sitio.
const Footer = () => {
  const anio = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__contenedor">
        <div className="footer__marca">
          <Link to="/" aria-label="Bulonera El Triángulo, inicio">
            <img
              src="/logo-texto-blanco.svg"
              width={140}
              height={70}
              alt="Bulonera El Triángulo"
              className="footer__logo"
            />
          </Link>
          <p className="footer__lema">
            Bulones, herramientas y seguridad industrial. Envíos a todo el país o retiro en el local.
          </p>
          <div className="footer__redes">
            <a href={CONTACTO.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
              </svg>
            </a>
            <a href={urlWhatsapp()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" />
              </svg>
            </a>
          </div>
        </div>

        <nav className="footer__columna" aria-label="Tienda">
          <h2 className="footer__titulo">Tienda</h2>
          <Link to="/productos?todos=true">Todos los productos</Link>
          <Link to="/productos?ofertas=true">Ofertas</Link>
          <Link to="/perfil">Mi cuenta</Link>
          <Link to="/faq">Preguntas frecuentes</Link>
        </nav>

        <nav className="footer__columna" aria-label="Empresa">
          <h2 className="footer__titulo">Empresa</h2>
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/contacto">Contacto y cotizaciones</Link>
        </nav>

        <div className="footer__columna">
          <h2 className="footer__titulo">Contacto</h2>
          <span>
            {CONTACTO.direccion}
            <br />
            {CONTACTO.localidad}
          </span>
          <a href={urlWhatsapp()} target="_blank" rel="noopener noreferrer">
            {CONTACTO.telefonoVisible}
          </a>
          <a href={`mailto:${CONTACTO.email}`} className="footer__email">
            {CONTACTO.email}
          </a>
          <span className="footer__horario">
            {CONTACTO.horarioSemana}
            <br />
            {CONTACTO.horarioSabado}
          </span>
        </div>
      </div>

      <div className="footer__base">
        <div className="footer__base-contenedor">
          <span>
            © {anio} Bulonera El Triángulo S.R.L. · Pagos seguros con Mercado Pago
          </span>
          <a
            href="https://codelabs.com.ar"
            target="_blank"
            rel="noopener"
            className="footer__firma"
          >
            Hecho por
            <img src="/codelabs-logo.webp" width={96} height={22} alt="Codelabs" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
