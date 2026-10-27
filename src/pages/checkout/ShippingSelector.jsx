import { useEffect, useState } from "react";
import { useShippingOptions } from "../../hooks/useShippingOptions";
import { formatearPrecio } from "../../utils/precio.js";

// Mismo formato que valida el backend
const CP_VALIDO = /^\d{4,8}$/;
// Espera a que el cliente deje de escribir antes de cotizar (antes se cotizaba en cada tecla)
const ESPERA_MS = 600;

const esLaMisma = (a, b) => a?.servicio === b?.servicio && a?.correo === b?.correo;

export default function ShippingSelector({ provincia, codigoPostal, peso, paquetes, selected, onSelect }) {
  const { options, loading, error, fetchOptions } = useShippingOptions();
  const [consulta, setConsulta] = useState(null);

  const cp = String(codigoPostal || "").trim();
  const cpValido = CP_VALIDO.test(cp);

  useEffect(() => {
    if (!provincia || !cpValido) {
      setConsulta(null);
      return;
    }
    const t = setTimeout(() => {
      setConsulta({ provincia, codigo_postal: cp, peso, paquetes });
    }, ESPERA_MS);
    return () => clearTimeout(t);
  }, [provincia, cp, cpValido, peso, paquetes]);

  useEffect(() => {
    if (consulta) fetchOptions(consulta);
  }, [consulta, fetchOptions]);

  // Si cambió la dirección y la opción elegida ya no está entre las nuevas, se desmarca
  useEffect(() => {
    if (loading || !consulta || !selected) return;
    if (!options.some((opt) => esLaMisma(opt, selected))) onSelect(null);
  }, [options, loading, consulta, selected, onSelect]);

  if (!cpValido) {
    return (
      <p className="shipping-selector-empty">
        Ingresá un código postal válido (de 4 a 8 números) para ver las opciones de envío.
      </p>
    );
  }
  if (loading || !consulta) {
    return <p className="shipping-selector-loading">Calculando opciones de envío...</p>;
  }
  if (error) return <p className="shipping-selector-error">{error}</p>;
  if (!options.length) return <p className="shipping-selector-empty">No hay opciones de envío disponibles para tu zona.</p>;

  return (
    <div className="shipping-selector">
      {options.map((opt, i) => {
        const isSelected = esLaMisma(selected, opt);

        return (
          <label key={i} className={`checkout-opcion checkout-opcion--fila ${isSelected ? "checkout-opcion--elegida" : ""}`}>
            <input
              type="radio"
              name="shipping"
              checked={isSelected}
              onChange={() => onSelect(opt)}
            />
            <span className="checkout-opcion__texto">
              <strong>
                {opt.correo || "Envío"} · {opt.tipo === "sucursal" ? "a sucursal" : "a domicilio"}
              </strong>
              <span className="checkout-opcion__detalle">
                {opt.servicio}
                {opt.horas_entrega ? ` · entrega estimada en ${opt.horas_entrega} h` : ""}
              </span>
            </span>
            <span className="checkout-opcion__precio">{formatearPrecio(opt.valor)}</span>
          </label>
        );
      })}
    </div>
  );
}