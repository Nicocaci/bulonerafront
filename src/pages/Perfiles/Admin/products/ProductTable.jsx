import React from "react";
import axiosInstance from "../../../../utils/axiosConfig.js";
import { getImageUrl } from "../../../../utils/imageUtils.js";
import Swal from "sweetalert2";
import { memo } from "react";

const ProductTable = memo(({ productos, isLoading, onEdit, refetch }) => {
  const handleDelete = async (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminarlo",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axiosInstance.delete(`/api/products/${id}`);
        refetch();
      }
    });
  };

  if (isLoading) return <p>Cargando...</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Imagen</th>
          <th>Nombre</th>
          <th>Categoria</th>
          <th>Subcategoria</th>
          <th>Precio</th>
          <th>Medidas</th>
          <th>Oferta Destacada</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {productos.map((p) => (
          <tr key={p._id}>
            <td>
              <img src={getImageUrl(p.imagen?.[0])} width={50} />
            </td>
            <td>{p.item}</td>
            <td>{p.categoria}</td>
            <td>{p.subcategoria}</td>
            <td>${p.precio.toLocaleString('es-AR')}</td>
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
              <button onClick={() => onEdit(p)}>Editar</button>
              <button onClick={() => handleDelete(p._id)}>Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});

export default ProductTable;