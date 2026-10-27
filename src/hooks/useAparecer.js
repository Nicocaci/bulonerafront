import { useEffect, useRef } from "react";

// Animación al hacer scroll sin librerías (reemplaza a framer-motion y
// react-intersection-observer). Los elementos con `data-aparecer` dentro del
// contenedor reciben la clase "visible" la primera vez que entran en pantalla.
// La animación está en CSS: si el navegador no tiene IntersectionObserver, o si el
// usuario pidió reducir el movimiento, no se oculta nada y todo se ve desde el inicio.
const useAparecer = () => {
  const ref = useRef(null);

  useEffect(() => {
    const contenedor = ref.current;
    if (!contenedor || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const elementos = contenedor.querySelectorAll("[data-aparecer]");
    const observer = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("visible");
            observer.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    contenedor.classList.add("con-animacion");
    elementos.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      contenedor.classList.remove("con-animacion");
    };
  }, []);

  return ref;
};

export default useAparecer;
