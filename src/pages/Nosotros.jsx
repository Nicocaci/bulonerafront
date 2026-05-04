import React from "react";
import "../css/Nosotros.css";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { FaTruck } from "react-icons/fa";
import { AiFillSafetyCertificate } from "react-icons/ai";
import { GrCatalogOption } from "react-icons/gr";

import CountUp from "react-countup";

const Nosotros = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.4, // % visible para disparar
  });

  // referencia separada para la animación de la imagen
  const { ref: imageRef, inView: imageInView } = useInView({
    triggerOnce: true,
    threshold: 0.4,
  });

  return (
    <>
      <section className="nosotros-container">
        <div className="nosotros-header"></div>
        <div className="nosotros-content-inicio">
          <motion.div ref={imageRef} className="image-wrapper">
            {/* Overlay rojo: entra (0->1) y luego sale (1->0) */}
            <motion.div
              className="image-reveal"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: [0, 1, 0] }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{
                duration: 1.2,
                ease: "easeInOut",
                times: [0, 0.5, 1],
              }}
            />

            {/* Imagen: aparece después de que el overlay terminó */}
            <motion.img
              src="/foto-bulonera.png"
              alt="foto-bulonera-frente"
              className="img-bulonera"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: 0.5, duration: 0.35 }}
            />
          </motion.div>

          <div className="nosotros-text">
            <p className="bulonera-titulo">BULONERA EL TRIANGULO S.R.L</p>
            <h2 className="bulonera-subtitulo">
              Donde nos necesites... Ahí estamos
            </h2>
            <p className="bulonera-contenido">
              En Bulonera El Triángulo trabajamos hace más de dos décadas
              brindando soluciones en fijaciones, herramientas y productos de
              ferretería.
            </p>
          </div>
        </div>
      </section>

      <div ref={ref} className="nosotros-stats">
        <div className="stats-group">
          <p className="stats-numero">
            {inView && (
              <CountUp
                end={30}
                duration={5}
                enableScrollSpy
                scrollSpyDelay={200}
              />
            )}{" "}
            +
          </p>
          <p className="stats-text">Años de trayectoria</p>
        </div>
        <div className="stats-group">
          <p className="stats-numero">
            {inView && (
              <CountUp
                end={50}
                duration={2}
                enableScrollSpy
                scrollSpyDelay={200}
              />
            )}{" "}
            +
          </p>
          <p className="stats-text">Marcas</p>
        </div>
        <div className="stats-group">
          <p className="stats-numero">
            {inView && (
              <CountUp
                end={1000}
                duration={5}
                enableScrollSpy
                scrollSpyDelay={200}
              />
            )}{" "}
            +
          </p>
          <p className="stats-text">Clientes</p>
        </div>
      </div>

      <section className="nostros-container">
        <div className="nosotros-content-2">
          <div className="nosotros-text-2">
            <p style={{ color: "#ffffff", marginBottom: "10px", fontSize: "1.5rem" }}>NUESTRA HISTORIA</p>
            <p style={{ color: "#ffffff" }}>
              Bulonera El Triángulo fue fundada en 1998 como un emprendimiento
              familiar, con el objetivo de ofrecer productos de calidad y una
              atención basada en el conocimiento del rubro. A lo largo de los
              años, fuimos consolidándonos en el mercado, ampliando nuestro
              stock y adaptándonos a las necesidades de nuestros clientes,
              siempre con un enfoque claro: brindar soluciones concretas y
              confiables.
            </p>
            <p style={{ color: "#ffffff" }}>
              Hoy contamos con una trayectoria que respalda nuestro trabajo y
              una forma de atender que nos define desde el primer día: directa,
              ágil y orientada a resolver
            </p>
          </div>
          <div className="nosotros-imagen">
            <img
              className="img-bulonera"
              style={{ boxShadow: "0 8px 8px rgba(255, 255, 255, 0.15)" }}
              src="/foto-interior.png"
              alt="foto-interior"
            />
          </div>
        </div>
      </section>

      <div className="nosotros-stats-2">
        <div className="stats-group-2">
          <FaTruck size={50} color="#ffffff" />
          <p className="">Envíos a domicilio</p>
        </div>
        <div className="stats-group-2">
          <AiFillSafetyCertificate size={50} color="#ffffff" />
          <p>Garantía Oficial</p>
        </div>
        <div className="stats-group-2">
          <GrCatalogOption size={50} color="#ffffff" />
          <p>Amplio Catalogo</p>
        </div>
      </div>

      <section className="nosotros-container-2">
        <div className="nosotros-content">
          <div className="nosotros-image">
            <img
              className="img-bulonera"
              src="/foto-logistica.png"
              alt="foto-logistica"
            />
          </div>
          <div className="nosotros-text">
            <p style={{marginBottom: "10px"}}>🤝 NUESTRO COMPROMISO</p>
            <p className="bulonera-contenido-2">
              Entendemos que cada compra tiene un propósito concreto. Por eso,
              nuestro compromiso es simple: dar una respuesta clara, rápida y
              efectiva en cada caso. Porque detrás de cada pedido hay un trabajo
              que no puede esperar.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Nosotros;
