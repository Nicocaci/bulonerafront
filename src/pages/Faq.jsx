import React, { useState } from "react";
import "../css/Faq.css";

const faqs = [
    {
     category: "Perfil y cuenta",
     items: [
        {
            question: "¿Cómo inicio sesión?",
            answer: "Hacé clic en 'Iniciar sesión' y completá con tu email y contraseña. Si no tenés cuenta, podés registrarte gratis.",
        },
        {
            question: "¿Cómo creo una cuenta?",
            answer: "Hacé clic en 'Registrarse' y completá el formulario con tus datos. Recibirás un email de confirmación.",
       },
       {
            question: "¿Olvidé mi contraseña, qué hago?",
            answer: "En la página de inicio de sesión, hacé clic en '¿Olvidaste tu contraseña?' y seguí las instrucciones para restablecerla.",
       },
     ],       
    },
    {
    category: "Compras",
    items: [
      {
        question: "¿Cómo realizo una compra?",
        answer: "Elegí el producto, hacé clic en 'Agregar al carrito' y seguí los pasos. Aceptamos tarjetas de crédito, débito y transferencia.",
      },
      {
        question: "¿Puedo modificar o cancelar mi pedido?",
        answer: "Podés cancelar dentro de las 2 horas posteriores a la compra, siempre que no haya sido preparado para envío.",
      },
      {
        question: "¿Qué métodos de pago aceptan?",
        answer: "Aceptamos tarjetas de crédito, débito y transferencia bancaria.",
      },
    ],
  },
  {
    category: "Envíos",
    items: [
        {
        question: "¿Hacen envíos a todo el país?",
        answer: "Sí, realizamos envíos a todo el territorio argentino. El costo varía según la ubicación y el peso del pedido.",
        },
        {
        question: "¿Cuánto tarda el envío?",
        answer: "El envío estándar tarda entre 3 y 5 días hábiles. También ofrecemos express en 24 hs para el AMBA.",
      },
    ],
  },
  {
    category: "Devoluciones",
    items: [
      {
        question: "¿Cómo devuelvo un producto?",
        answer: "Tenés 30 días desde la entrega. El producto debe estar sin uso y con su embalaje original.",
      },
    ],
  },
];

const FaqItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq-item ${open ? "faq-item--open" : ""}`}>
      <button className="faq-question" onClick={() => setOpen(!open)}>
        <span>{question}</span>
        <span className={`faq-icon ${open ? "faq-icon--open" : ""}`}>▾</span>
      </button>
      {open && <p className="faq-answer">{answer}</p>}
    </div>
  );
};

const Faq = () => {
  return (
    <div className="faq-container">
      <h2 className="faq-title">Preguntas frecuentes</h2>
      {faqs.map((group) => (
        <div key={group.category} className="faq-group">
          <p className="faq-category">{group.category}</p>
          {group.items.map((item) => (
            <FaqItem key={item.question} {...item} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Faq;
