import React from 'react';
import '../css/Home.css';
import ProductosDestacados from '../components/ProductosDestacados.jsx';
import BrandSlider from '../utils/BrandSlider.jsx';
import { Link } from 'react-router-dom';
import { FaToolbox, FaTools} from "react-icons/fa";
import { FcSettings, FcShipped } from "react-icons/fc";

const Home = () => {

    return (
        <div>
            <div className='home-banner'>
                <video className='banner-video' src="/video-home.mp4" autoPlay loop muted></video>
            </div>
            <BrandSlider />
            <div className='container-destacado'>
                <div className='container-herramientas'>
                    <p className='titulo-herramientas'>CATEGORÍA DE HERRAMIENTAS</p>
                    <div className='grid-herramientas'>
                        <Link className='link-home' to="/productos?categoria=manuales">
                            <div className='grid'>
                                <img className='img-herramientas' src="/manuales.png" alt="herramientas" />
                                <p className='descripcion-herramientas'>MANUALES</p>
                            </div>
                        </Link>

                        <Link className='link-home' to="/productos?categoria=motorizadas">
                            <div className='grid'>
                                <img className='img-herramientas' src="/motorizadas.png" alt="herramientas motorizadas" />
                                <p className='descripcion-herramientas'>MOTORIZADAS</p>
                            </div>
                        </Link>

                        <Link className='link-home' to="/productos?categoria=insumos">
                            <div className='grid'>
                                <img className='img-herramientas' src="/insumos.png" alt="herramientas motorizadas" />
                                <p className='descripcion-herramientas'>INSUMOS</p>
                            </div>
                        </Link>

                        <Link className='link-home' to="/productos?categoria=motorizadas">
                            <div className='grid'>
                                <img className='img-herramientas' src="/seguridad.png" alt="herramientas motorizadas" />
                                <p className='descripcion-herramientas'>SEGURIDAD INDUSTRIAL</p>
                            </div>
                        </Link>
                    </div>
                </div>
                <div className='container-caja-herramientas'>
                    <p className='titulo-herramientas'>ARMÁ TU CAJA DE HERRAMIENTAS</p>
                    <div className='caja-herramientas'>
                        <div className='card-caja-herramientas'>
                            <div className='icono-caja-herramientas'>
                                <p className='step-caja-herramientas'>Paso 1 </p>
                                <FaToolbox size={30} />
                            </div>
                            <p className='descripcion-caja-herramientas'>Elige la Caja de Herramientas  </p>
                        </div>
                        <div className='card-caja-herramientas'>
                            <div className='icono-caja-herramientas'>
                                <p className='step-caja-herramientas'>Paso 2</p>
                                <FaTools size={30} />
                            </div>
                            <p className='descripcion-caja-herramientas'>Selecciona Herramientas Basicas</p>
                        </div>
                        <div className='card-caja-herramientas'>
                            <div className='icono-caja-herramientas'>
                                <p className='step-caja-herramientas'>Paso 3</p>
                                <FcSettings size={30} />
                            </div>
                            <p className='descripcion-caja-herramientas'>Selecciona los Insumos que necesites</p>
                        </div>
                        <div className='card-caja-herramientas'>
                            <div className='icono-caja-herramientas'>
                            <p className='step-caja-herramientas'>Paso 4</p>
                            <FcShipped size={30} />
                            </div>
                            <p className='descripcion-caja-herramientas'>Finaliza el pago y recibe tu pedido</p>
                        </div>
                    </div>
                    <div className='btn-caja-herramientas'>
                        <Link to="/caja-herramientas">
                            <button className='btn-caja'>COMENZAR EL ARMADO</button>
                        </Link>
                    </div>
                </div>
                <div className='pd-container'>
                    <ProductosDestacados />
                </div>

            </div>
        </div>
    )
}

export default Home