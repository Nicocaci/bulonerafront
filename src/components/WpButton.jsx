import { FaWhatsapp } from "react-icons/fa";
import { urlWhatsapp } from "../utils/contacto.js";
import "../css/WpButton.css";

// Botón flotante de WhatsApp (mismo número y mensaje de siempre, ahora desde utils/contacto.js)
const WpButton = () => (
  <a
    href={urlWhatsapp()}
    className="whatsapp-float"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Escribinos por WhatsApp (se abre en otra pestaña)"
  >
    <FaWhatsapp size={28} aria-hidden="true" />
  </a>
);

export default WpButton;
