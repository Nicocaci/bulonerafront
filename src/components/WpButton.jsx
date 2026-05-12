import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import "../css/WpButton.css";

const WpButton = () => {
  const phoneNumber = "+54 9 11 5154-4062";
  const message = "Hola! Quiero hacer una consulta sobre sus productos";

  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={url}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FaWhatsapp size={28} />
    </a>
  );
};

export default WpButton;
