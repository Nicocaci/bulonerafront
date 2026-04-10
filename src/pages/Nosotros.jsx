import React from 'react';
import '../css/Nosotros.css';
import { useInView } from 'react-intersection-observer';
import { motion } from "framer-motion";
import { FaTruck } from "react-icons/fa";
import { AiFillSafetyCertificate } from "react-icons/ai";
import { GrCatalogOption } from "react-icons/gr";

import CountUp from 'react-countup';

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
            <section className='nosotros-container'>
                <div className='nosotros-header'>
                    <h1>Institucional</h1>
                </div>
                <div className='nosotros-content-inicio'>
                    <motion.div
                        ref={imageRef}
                        className="image-wrapper"
                    >
                        {/* Overlay rojo: entra (0->1) y luego sale (1->0) */}
                        <motion.div
                            className="image-reveal"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: [0, 1, 0] }}
                            viewport={{ once: true, amount: 0.45 }}
                            transition={{ duration: 1.2, ease: "easeInOut", times: [0, 0.5, 1] }}
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

                    <div className='nosotros-text'>
                        <p className='bulonera-titulo'>BULONERA EL TRIANGULO S.R.L</p>
                        <h2 className='bulonera-subtitulo'>Donde nos necesites... Ahí estamos</h2>
                        <p className='bulonera-contenido'>Más de 30 años acompañando a la construcción con herramientas de calidad.</p>
                    </div>
                </div>
            </section>


            <div ref={ref} className='nosotros-stats'>
                <div className='stats-group'>
                    <p className='stats-numero'>
                        {inView && <CountUp
                            end={30}
                            duration={5}
                            enableScrollSpy
                            scrollSpyDelay={200}
                        />} +
                    </p>
                    <p className='stats-text'>Años de trayectoria</p>
                </div>
                <div className='stats-group'>
                    <p className='stats-numero'>
                        {inView && <CountUp
                            end={50}
                            duration={2}
                            enableScrollSpy
                            scrollSpyDelay={200}
                        />} +
                    </p>
                    <p className='stats-text'>Marcas</p>
                </div>
                <div className='stats-group'>
                    <p className='stats-numero'>
                        {inView && <CountUp
                            end={1000}
                            duration={5}
                            enableScrollSpy
                            scrollSpyDelay={200}
                        />} +
                    </p>
                    <p className='stats-text'>Clientes</p>
                </div>
            </div>


            <section className='nostros-container'>
                <div className='nosotros-content-2'>
                    <div className='nosotros-text-2'>
                        <p style={{ color: '#ffffff' }}>
                            Hace más de 30 años nos dedicamos a la distribución de herramientas e insumos para la
                            construcción, acompañando a profesionales, empresas y particulares con productos de
                            calidad y un servicio de confianza.
                        </p>
                        <p style={{ color: '#ffffff' }}>
                            Ofrecemos una amplia variedad de herramientas, equipos e insumos, seleccionados para
                            cubrir las necesidades reales del rubro de la construcción. Trabajamos con las mejores
                            marcas del mercado y, además, importamos directamente muchos de nuestros productos, lo
                            que nos permite ofrecer precios altamente competitivos sin resignar calidad.
                        </p>
                    </div>
                    <div className="nosotros-imagen">
                        <img className='img-bulonera' style={{ boxShadow: '0 8px 8px rgba(255, 255, 255, 0.15)' }} src="/foto-interior.png" alt="foto-interior" />
                    </div>
                </div>
            </section>


            <div className='nosotros-stats-2'>
                <div className='stats-group-2' >
                    <FaTruck size={50} color="#ffffff" />
                    <p className=''>Envíos a domicilio</p>
                </div>
                <div className='stats-group-2'>
                    <AiFillSafetyCertificate size={50} color='#ffffff' />
                    <p>Garantía Oficial</p>
                </div>
                <div className='stats-group-2'>
                    <GrCatalogOption size={50} color='#ffffff' />
                    <p>Amplio Catalogo</p>
                </div>
            </div>


            <section className='nosotros-container-2'>
                <div className='nosotros-content'>
                    <div className='nosotros-image'>
                        <img className='img-bulonera' src="/foto-logistica.png" alt="foto-logistica" />
                    </div>
                    <div className='nosotros-text'>
                        <p className='bulonera-contenido-2'>
                            Contamos con envíos a domicilio, garantizando entregas rápidas y seguras para que puedas
                            recibir tu pedido donde lo necesites. Nuestra trayectoria, experiencia y compromiso nos respaldan. Seguimos creciendo junto a
                            nuestros clientes, brindando soluciones confiables para cada proyecto.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Nosotros;
