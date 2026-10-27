import { useEffect } from "react";

const ENFOCABLES =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Comportamiento de diálogo accesible para un modal (Fase 6):
 * - al abrir, el foco va al primer campo (o al primer botón);
 * - Tab no sale del diálogo;
 * - Escape lo cierra (salvo que haya un aviso de SweetAlert encima);
 * - la página de atrás no se desplaza;
 * - al cerrar, el foco vuelve a donde estaba.
 */
export function useDialogo(ref, onCerrar, { activo = true } = {}) {
  useEffect(() => {
    if (!activo) return;
    const dialogo = ref.current;
    if (!dialogo) return;

    const previo = document.activeElement;
    const primerCampo = dialogo.querySelector("input, select, textarea") || dialogo.querySelector(ENFOCABLES);
    primerCampo?.focus();

    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const alTeclado = (e) => {
      if (e.key === "Escape") {
        if (document.querySelector(".swal2-container")) return; // el aviso se cierra primero
        onCerrar?.();
        return;
      }
      if (e.key !== "Tab") return;
      const enfocables = [...dialogo.querySelectorAll(ENFOCABLES)].filter(
        (el) => el.offsetParent !== null,
      );
      if (!enfocables.length) return;
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (e.shiftKey && (document.activeElement === primero || !dialogo.contains(document.activeElement))) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (document.activeElement === ultimo || !dialogo.contains(document.activeElement))) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener("keydown", alTeclado);

    return () => {
      document.removeEventListener("keydown", alTeclado);
      document.body.style.overflow = overflow;
      if (previo && document.contains(previo)) previo.focus?.();
    };
    // onCerrar puede cambiar en cada render: no hace falta volver a enfocar por eso
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo, ref]);
}
