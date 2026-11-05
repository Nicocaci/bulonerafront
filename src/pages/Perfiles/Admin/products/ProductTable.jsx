import React from "react";
import axiosInstance, { getErrorMessage } from "../../../../utils/axiosConfig.js";
import { getImageUrl } from "../../../../utils/imageUtils.js";
import { formatearPrecio } from "../../../../utils/precio.js";
import { avisar } from "../../../../utils/avisos.js";
import { confirmar } from "../../../../utils/confirmar.js";
import { memo } from "react";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Cargador from "../../../../components/Cargador.jsx";


const ProductTable = memo(({ productos, isLoading, onEdit, refetch }) => {
  const handleDelete = async (id, nombre) => {
    const ok = await confirmar({
      titulo: nombre ? `¿Eliminar ${nombre}?` : "¿Eliminar este producto?",
      texto: "Esta acción no se puede deshacer.",
      confirmar: "Eliminar producto",
      peligro: true,
    });
    if (!ok) return;
    try {
      await axiosInstance.delete(`/api/products/${id}`);
      avisar.exito("Producto eliminado");
      refetch();
    } catch (err) {
      avisar.error("No se pudo eliminar el producto", getErrorMessage(err, "Probá de nuevo en unos segundos."));
    }
  };

  if (isLoading) return <Cargador tamano="bloque" texto="Cargando productos…" />;

  return (
    <table className="admin-tabla-simple">
      <thead>
        <tr>
          <th>Imagen</th>
          <th>Nombre</th>
          <th>Categoria</th>
          <th>Subcategoria</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Medidas</th>
          <th>Oferta Destacada</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {productos.map((p) => (
          <tr key={p._id} className={p.estado === "inactivo" ? "producto-inactivo" : undefined}>
            <td>
              <img src={getImageUrl(p.imagen?.[0])} width={50} height={50} alt="" />
            </td>
            <td>{p.item}</td>
            <td>{p.categoria}</td>
            <td>{p.subcategoria}</td>
            <td>{formatearPrecio(p.precio)}</td>
            <td>{p.stock}</td>
            <td>
              {p.alto ?? "-"}x{p.ancho ?? "-"}x{p.largo ?? "-"} cm
              <br />
              {p.peso ?? "-"} kg
            </td>
            <td>
              {p.oferta?.activa
                ? `${p.oferta.descuento}% ${p.oferta.vence ? `(vence: ${new Date(p.oferta.vence).toLocaleDateString("es-AR")})` : "(sin vencimiento)"}`
                : "No"}
            </td>
            <td>
              <span
                className={`estado-producto estado-producto--${p.estado === "inactivo" ? "inactivo" : "activo"}`}
                title={p.estado === "inactivo" ? "No se muestra en la tienda" : "Visible en la tienda"}
              >
                {p.estado === "inactivo" ? "Inactivo" : "Activo"}
              </span>
            </td>
            <td >
              <button
                type="button"
                className="admin-icono-boton admin-icono-boton--editar"
                aria-label={`Editar ${p.item}`}
                title="Editar"
                onClick={() => onEdit(p)}
              >
                <FaRegEdit aria-hidden="true" />
              </button>
              <button
                type="button"
                className="admin-icono-boton admin-icono-boton--borrar"
                aria-label={`Eliminar ${p.item}`}
                title="Eliminar"
                onClick={() => handleDelete(p._id, p.item)}
              >
                <MdDelete aria-hidden="true" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});

export default ProductTable;
