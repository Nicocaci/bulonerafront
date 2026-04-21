import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../../../utils/axiosConfig.js";

const initialState = {
  sku: "",
  item: "",
  imagen: [],
  descripcion: "",
  marca: "",
  categoria: "",
  subcategoria: "",
  precio: "",
  iva: 0,
  stock: 0,
  estado: "activo",
  oferta: false,
};

const ProductForm = ({ editingProduct, setEditingProduct, refetch }) => {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setForm({
        ...initialState,
        ...editingProduct,
        imagen: [],
      });
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "precio" || name === "iva"
            ? value === ""
              ? ""
              : parseFloat(value)
            : name === "stock"
              ? parseInt(value || 0, 10)
              : value,
    }));
  };

  const handleImage = (e) => {
    setForm((prev) => ({
      ...prev,
      imagen: Array.from(e.target.files),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key !== "imagen") {
          formData.append(key, value ?? "");
        }
      });

      form.imagen.forEach((file) => {
        formData.append("imagen", file);
      });

      // DEBUG
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      if (editingProduct?._id) {
        await axiosInstance.put(
          `/api/products/${editingProduct._id}`,
          formData,
        );
        Swal.fire("OK", "Actualizado", "success");
      } else {
        await axiosInstance.post("/api/products", formData);
        Swal.fire("Nuevo Producto", "Creado", "success");
      }

      setForm(initialState);
      setEditingProduct(null);
      refetch();
    } catch (err) {
      console.error("ERROR BACKEND:", err.response?.data);
      Swal.fire("Error", err.response?.data?.message || "Algo falló", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <div className="flex-form">
        <div className="column-form">
          <label htmlFor="sku">SKU:</label>
          <input
            id="sku"
            name="sku"
            value={form.sku}
            onChange={handleChange}
            placeholder="SKU"
          />
        </div>
        <div className="column-form">
          <label htmlFor="item">Nombre:</label>
          <input
            id="item"
            name="item"
            value={form.item}
            onChange={handleChange}
            placeholder="Nombre"
          />
        </div>
      </div>
      <label htmlFor="imagen">Imágenes:</label>
      <input
        id="imagen"
        name="imagen"
        type="file"
        multiple
        onChange={handleImage}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "14px",
        }}
      >
        <input
          name="marca"
          value={form.marca}
          onChange={handleChange}
          placeholder="Marca"
        />
        <input
          name="categoria"
          value={form.categoria}
          onChange={handleChange}
          placeholder="Categoría"
        />
        <input
          name="subcategoria"
          value={form.subcategoria}
          onChange={handleChange}
          placeholder="Subcategoría"
        />
      </div>
      <label htmlFor="descripcion">Descripción:</label>
      <textarea
        name="descripcion"
        value={form.descripcion}
        onChange={handleChange}
      />
      <div className="flex-form">
        <div className="column-form">
          <label htmlFor="precio">Precio:</label>
          <input
            id="precio"
            name="precio"
            type="number"
            value={form.precio}
            onChange={handleChange}
            placeholder="Precio"
          />
        </div>
        <div className="column-form">
          <label htmlFor="stock">Stock:</label>
          <input
            id="stock"
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            placeholder="Stock"
          />
        </div>
      </div>
      <label>
        Oferta Destacada
        <input
          type="checkbox"
          name="oferta"
          checked={form.oferta}
          onChange={handleChange}
        />
      </label>
      <button disabled={submitting}>
        {editingProduct ? "Actualizar" : "Crear"}
      </button>

      {editingProduct && (
        <button type="button" onClick={() => setEditingProduct(null)}>
          Cancelar
        </button>
      )}
    </form>
  );
};

export default ProductForm;
