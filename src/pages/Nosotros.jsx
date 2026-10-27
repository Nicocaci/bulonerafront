import React from "react";
import { Link } from "react-router-dom";
import "../css/Nosotros.css";
import useAparecer from "../hooks/useAparecer.js";

const DATOS = [
  { numero: "1998", texto: "Año en que abrimos" },
  { numero: "+50", texto: "Marcas" },
  { numero: "+1.000", texto: "Clientes" },
];

const IconoBeneficio = ({ children }) => (
  <span className="nosotros-beneficio__icono" aria-hidden="true">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  </span>
);

const BENEFICIOS = [
  {
    titulo: "Envíos a todo el país",
    texto: "Despachamos tu pedido a cualquier punto del país o lo retirás en el local.",
    icono: (
      <>
        <path d="M2 7h11v9H2zM13 10h4l3 3v3h-7z" />
        <circle cx="6" cy="18" r="1.8" />
        <circle cx="17" cy="18" r="1.8" />
      </>
    ),
  },
  {
    titulo: "Garantía oficial",
    texto: "Somos distribuidores oficiales: cada producto tiene la garantía de su marca.",
    icono: (
      <>
        <path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" />
        <path d="M8.5 12l2.5 2.5 4.5-5" />
      </>
    ),
  },
  {
    titulo: "Amplio catálogo",
    texto: "Miles de productos para la industria, el taller y el hogar, en un solo lugar.",
    icono: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
  },
];

const Nosotros = () => {
  const ref = useAparecer();

  return (
    <div className="nosotros" ref={ref}>
      <section className="nosotros-hero">
        <div className="nosotros-hero__texto">
          <p className="nosotros__eyebrow nosotros-entrada">Bulonera El Triángulo S.R.L.</p>
          <h1 className="nosotros-hero__titulo nosotros-entrada" style={{ animationDelay: "0.08s" }}>
            Donde nos necesites, ahí estamos.
          </h1>
          <p className="nosotros-hero__bajada nosotros-entrada" style={{ animationDelay: "0.16s" }}>
            Desde 1998 brindamos soluciones en fijaciones, herramientas y productos de ferretería
            para la industria, el taller y el hogar.
          </p>
          <div className="nosotros-hero__acciones nosotros-entrada" style={{ animationDelay: "0.24s" }}>
            <Link to="/productos?todos=true" className="nosotros-btn nosotros-btn--marca">
              Ver productos
            </Link>
            <Link to="/contacto" className="nosotros-btn nosotros-btn--borde">
              Contactanos
            </Link>
          </div>
        </div>
        <img
          className="nosotros-hero__foto"
          src="/foto-bulonera.webp"
          width={400}
          height={600}
          alt="Frente del local de Bulonera El Triángulo"
        />
      </section>

      <section className="nosotros-datos" aria-label="En números">
        {DATOS.map((d, i) => (
          <div
            key={d.texto}
            className="nosotros-dato nosotros-entrada"
            style={{ animationDelay: `${0.3 + i * 0.08}s` }}
          >
            <p className="nosotros-dato__numero">{d.numero}</p>
            <p className="nosotros-dato__texto">{d.texto}</p>
          </div>
        ))}
      </section>

      <section className="nosotros-historia" data-aparecer>
        <img
          className="nosotros-historia__foto"
          src="/foto-interior.webp"
          width={500}
          height={300}
          loading="lazy"
          alt="Mostrador e interior del local con herramientas en exhibición"
        />
        <div className="nosotros-historia__texto">
          <p className="nosotros__eyebrow">Nuestra historia</p>
          <h2 className="nosotros__titulo">Un emprendimiento familiar que creció con sus clientes</h2>
          <p>
            Empezamos en 1998 con un objetivo claro: ofrecer productos de calidad y una atención
            basada en el conocimiento del rubro.
          </p>
          <p>
            Con los años ampliamos el stock y nos adaptamos a lo que necesitan nuestros clientes,
            sin cambiar la forma de atender: directa, ágil y orientada a resolver.
          </p>
        </div>
      </section>

      <section className="nosotros-beneficios">
        <div className="nosotros-beneficios__interior">
          <h2 className="nosotros__titulo" data-aparecer>
            Por qué elegirnos
          </h2>
          <div className="nosotros-beneficios__grilla">
            {BENEFICIOS.map((b, i) => (
              <div
                key={b.titulo}
                className="nosotros-beneficio"
                data-aparecer
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <IconoBeneficio>{b.icono}</IconoBeneficio>
                <h3>{b.titulo}</h3>
                <p>{b.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="nosotros-compromiso" data-aparecer>
        <div className="nosotros-compromiso__texto">
          <p className="nosotros__eyebrow nosotros__eyebrow--claro">Nuestro compromiso</p>
          <p className="nosotros-compromiso__frase">
            “Detrás de cada pedido hay un trabajo que no puede esperar.”
          </p>
          <p className="nosotros-compromiso__bajada">
            Por eso damos una respuesta clara, rápida y efectiva en cada caso.
          </p>
          <Link to="/contacto" className="nosotros-btn nosotros-btn--marca">
            Pedí tu cotización
          </Link>
        </div>
        <img
          className="nosotros-compromiso__foto"
          src="/foto-logistica.webp"
          width={500}
          height={300}
          loading="lazy"
          alt="Carga de pedidos en una camioneta de reparto"
        />
      </section>
    </div>
  );
};

export default Nosotros;
