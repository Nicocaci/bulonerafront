import React, { useId, useState } from "react";
import "../css/Faq.css";

const faqs = [
  {
    category: "Cuenta",
    items: [
      {
        question: "¿Necesito una cuenta para comprar?",
        answer: "No. Podés comprar como invitado. Con una cuenta, tu carrito queda guardado.",
      },
      {
        question: "¿Cómo creo una cuenta?",
        answer: "Desde 'Iniciar sesión' → 'Registrate', completando tus datos. Tu cuenta queda activa al instante.",
      },
      {
        question: "¿Olvidé mi contraseña, qué hago?",
        answer: "Escribinos por WhatsApp o a eltrianguloventasonline@gmail.com y te ayudamos a recuperar el acceso.",
      },
    ],
  },
  {
    category: "Compras y pagos",
    items: [
      {
        question: "¿Cómo realizo una compra?",
        answer: "Agregá los productos al carrito, completá tus datos, elegí envío o retiro y pagá con Mercado Pago.",
      },
      {
        question: "¿Qué medios de pago aceptan?",
        answer: "Pagás a través de Mercado Pago, con tarjeta de crédito o débito o con dinero en cuenta, en un solo pago. No aceptamos pagos en efectivo por Rapipago ni Pago Fácil.",
      },
      {
        question: "¿Cómo sé que mi compra se confirmó?",
        answer: "Cuando Mercado Pago aprueba el pago, te llega un email de confirmación.",
      },
      {
        question: "¿Puedo modificar o cancelar mi pedido?",
        answer: "Escribinos cuanto antes por WhatsApp. Si todavía no se despachó, lo resolvemos.",
      },
    ],
  },
  {
    category: "Envíos y retiro",
    items: [
      {
        question: "¿Hacen envíos a todo el país?",
        answer: "Sí. El costo se calcula en el checkout según tu código postal y el peso del pedido.",
      },
      {
        question: "¿Cuánto tarda el envío?",
        answer: "Depende del correo y del servicio que elijas. En el checkout ves el plazo estimado de cada opción.",
      },
      {
        question: "¿Puedo retirar en el local?",
        answer: "Sí, sin costo, en Camino General Belgrano 6444, Gutiérrez. Lunes a viernes de 8 a 18 hs y sábados de 8 a 13 hs. Te avisamos por email cuando esté listo.",
      },
    ],
  },
  {
    category: "Devoluciones",
    items: [
      {
        question: "¿Cómo devuelvo un producto?",
        answer: "Las devoluciones se coordinan directamente con nosotros: escribinos por WhatsApp o por email con tu número de pedido. El costo del envío de la devolución corre por cuenta del comprador.",
      },
    ],
  },
];

const FaqItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  const answerId = useId();

  return (
    <div className={`faq-item ${open ? "faq-item--open" : ""}`}>
      <button
        type="button"
        className="faq-question"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={answerId}
      >
        <span>{question}</span>
        <span className={`faq-icon ${open ? "faq-icon--open" : ""}`} aria-hidden="true">▾</span>
      </button>
      {open && (
        <p className="faq-answer" id={answerId}>
          {answer}
        </p>
      )}
    </div>
  );
};

const Faq = () => {
  return (
    <div className="faq-container">
      <h1 className="faq-title">Preguntas frecuentes</h1>
      {faqs.map((group) => (
        <section key={group.category} className="faq-group">
          <h2 className="faq-category">{group.category}</h2>
          {group.items.map((item) => (
            <FaqItem key={item.question} {...item} />
          ))}
        </section>
      ))}
    </div>
  );
};

export default Faq;
