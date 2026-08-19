import React, { useState, useEffect, useRef } from "react";
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
  iva: 21,
  stock: 0,
  estado: "activo",
  peso: "",
  alto: "",
  ancho: "",
  largo: "",
  oferta: {
    activa: false,
    descuento: 0,
    vence: "",
  },
};

const ProductForm = ({ editingProduct, setEditingProduct, refetch }) => {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef();

  useEffect(() => {
    if (editingProduct) {
      setForm({
        ...initialState,
        ...editingProduct,
        imagen: [],
        oferta: {
          activa: editingProduct.oferta?.activa ?? false,
          descuento: editingProduct.oferta?.descuento ?? 0,
          // Convertir fecha ISO a formato YYYY-MM-DD para el input date
          vence: editingProduct.oferta?.vence
            ? new Date(editingProduct.oferta.vence).toISOString().split("T")[0]
            : "",
        },
      });
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const numericFields = ["precio", "iva", "peso", "alto", "ancho", "largo"];

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : numericFields.includes(name)
            ? value === ""
              ? ""
              : parseFloat(value)
            : name === "stock"
              ? parseInt(value || 0, 10)
              : value,
    }));
  };

  // Handler específico para los campos anidados de oferta
  const handleOfertaChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      oferta: {
        ...prev.oferta,
        [name]:
          type === "checkbox"
            ? checked
            : name === "descuento"
              ? value === ""
                ? 0
                : parseFloat(value)
              : value,
      },
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
        if (key === "imagen") return;
        // Serializar el objeto oferta como JSON string
        if (key === "oferta") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value ?? "");
        }
      });

      form.imagen.forEach((file) => {
        formData.append("imagen", file);
      });

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
    <form ref={formRef} onSubmit={handleSubmit} className="profile-form">
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

      <div className="form-grid">
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

      {/* ── Sección Medidas y peso (Enviopack) ── */}
      <fieldset style={{ marginTop: "12px", padding: "12px", borderRadius: "6px" }}>
        <legend>Medidas y peso</legend>

        <div className="flex-form">
          <div className="column-form">
            <label htmlFor="peso">Peso (kg):</label>
            <input
              id="peso"
              name="peso"
              type="number"
              step="0.01"
              min="0"
              value={form.peso}
              onChange={handleChange}
              placeholder="Peso"
            />
          </div>
        </div>

        <div className="form-grid" style={{ marginTop: "10px" }}>
          <div className="column-form">
            <label htmlFor="alto">Alto (cm):</label>
            <input
              id="alto"
              name="alto"
              type="number"
              min="0"
              value={form.alto}
              onChange={handleChange}
              placeholder="Alto"
            />
          </div>
          <div className="column-form">
            <label htmlFor="ancho">Ancho (cm):</label>
            <input
              id="ancho"
              name="ancho"
              type="number"
              min="0"
              value={form.ancho}
              onChange={handleChange}
              placeholder="Ancho"
            />
          </div>
          <div className="column-form">
            <label htmlFor="largo">Largo (cm):</label>
            <input
              id="largo"
              name="largo"
              type="number"
              min="0"
              value={form.largo}
              onChange={handleChange}
              placeholder="Largo"
            />
          </div>
        </div>
      </fieldset>

      {/* ── Sección Oferta ── */}
      <fieldset style={{ marginTop: "12px", padding: "12px", borderRadius: "6px" }}>
        <legend>Oferta</legend>

        <label>
          <input
            type="checkbox"
            name="activa"
            checked={form.oferta.activa}
            onChange={handleOfertaChange}
          />
          {" "}Activar oferta
        </label>

        {/* Solo mostrar descuento y fecha si la oferta está activa */}
        {form.oferta.activa && (
          <div className="flex-form" style={{ marginTop: "10px" }}>
            <div className="column-form">
              <label htmlFor="descuento">Descuento (%):</label>
              <input
                id="descuento"
                name="descuento"
                type="number"
                min="0"
                max="100"
                value={form.oferta.descuento}
                onChange={handleOfertaChange}
                placeholder="0"
              />
            </div>
            <div className="column-form">
              <label htmlFor="vence">Vence:</label>
              <input
                id="vence"
                name="vence"
                type="date"
                value={form.oferta.vence}
                onChange={handleOfertaChange}
              />
            </div>
          </div>
        )}
      </fieldset>

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