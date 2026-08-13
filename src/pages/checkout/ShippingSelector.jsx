import { useEffect } from "react";
import { useShippingOptions } from "../../hooks/useShippingOptions";

export default function ShippingSelector({ provincia, codigoPostal, peso, paquetes, selected, onSelect }) {
  const { options, loading, error, fetchOptions } = useShippingOptions();

  useEffect(() => {
    if (!codigoPostal || !provincia) return;
    fetchOptions({ provincia, codigo_postal: codigoPostal, peso, paquetes });
  }, [provincia, codigoPostal, peso, paquetes, fetchOptions]);

  if (loading) return <p className="shipping-selector-loading">Calculando opciones de envío...</p>;
  if (error) return <p className="shipping-selector-error">{error}</p>;
  if (!options.length) return <p className="shipping-selector-empty">No hay opciones de envío disponibles para tu zona.</p>;

  return (
    <div className="shipping-selector">
      {options.map((opt, i) => {
        const isSelected =
          selected?.servicio === opt.servicio && selected?.correo === opt.correo;

        return (
          <label key={i} className={`shipping-option ${isSelected ? "selected" : ""}`}>
            <input
              type="radio"
              name="shipping"
              checked={isSelected}
              onChange={() => onSelect(opt)}
            />
            <div>
              <span className="shipping-option-tag">
                {opt.tipo === "sucursal" ? "A sucursal" : "A domicilio"}
              </span>
              <strong>{opt.correo || "Envío"} — {opt.servicio}</strong>
              <p>${opt.valor} · {opt.horas_entrega}hs estimadas</p>
            </div>
          </label>
        );
      })}
    </div>
  );
}