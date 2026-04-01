import React from "react";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import axiosInstance from "../../../utils/axiosConfig";
import Cookies from "js-cookie";
import { getImageUrl } from "../../../utils/imageUtils";

const NewProduct = ({ user }) => {
  const { user: authUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(7); // Productos por página
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalProductos, setTotalProductos] = useState(0);
  // Filtro de búsqueda por nombre (debounced)
  const [searchNombre, setSearchNombre] = useState("");
  const [debouncedSearchNombre, setDebouncedSearchNombre] = useState("");

  const [productForm, setProductForm] = useState({
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
  });
  const [fileNames, setFileNames] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Debounce para evitar llamadas en cada tecla (más sensible para búsquedas parciales)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchNombre(searchNombre);
      // Si se inicia una nueva búsqueda, resetear la página
      if (searchNombre.trim() !== "") setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchNombre]);

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      try {
        const headers = {};
        const token = authUser?.token || Cookies.get("access_token");
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // Agregar parámetros de paginación y búsqueda
        const params = {
          page: currentPage,
          limit: productsPerPage,
        };

        if (debouncedSearchNombre && debouncedSearchNombre.trim() !== "") {
          // Búsqueda por texto (nombre o SKU parcial) — primero intentar lookup exacto por SKU, si aplica
          const q = debouncedSearchNombre.trim();
          const isSkuCandidate =
            !/\s/.test(q) && q.length >= 3 && q.length <= 50; // heurística: no espacios, tamaño razonable

          if (isSkuCandidate) {
            try {
              const skuResp = await axiosInstance.get(
                `/api/products/sku/${encodeURIComponent(q)}`,
                { headers },
              );
              if (skuResp && skuResp.data) {
                const producto = skuResp.data;
                setProductos([producto]);
                setTotalPaginas(1);
                setTotalProductos(1);
                setLoading(false);
                return; // encontrado SKU exacto -> mostramos y salimos
              }
            } catch (err) {
              // Si fue 404, no hay producto exacto -> continuar con búsqueda normal
              if (err.response && err.response.status === 404) {
                // no-op, caerá al fetch por q
              } else {
                console.error("Error al buscar por SKU exacto:", err);
              }
            }
          }

          // Enviar el parámetro de búsqueda al backend (q) para búsqueda por nombre o SKU parcial
          params.q = q;
        }

        const response = await axiosInstance.get("/api/products", {
          headers,
          params,
        });

        // El backend devuelve un objeto con products y pagination
        const result = response.data;

        if (result.products && Array.isArray(result.products)) {
          // Si por alguna razón el backend no filtra por q, aplicamos un filtro de respaldo en el frontend
          const productosObtenidos = result.products;
          const productosFinal =
            debouncedSearchNombre && debouncedSearchNombre.trim() !== ""
              ? productosObtenidos.filter(
                  (p) =>
                    p.item &&
                    p.item
                      .toLowerCase()
                      .includes(debouncedSearchNombre.toLowerCase()),
                )
              : productosObtenidos;

          setProductos(productosFinal);

          // Acceder a la paginación desde result.pagination
          const pagination = result.pagination || {};
          // Si el backend proporciona total, usarlo; si no, usar la longitud del array filtrado
          setTotalPaginas(
            pagination.totalPages ||
              Math.ceil(
                (pagination.total || productosFinal.length) / productsPerPage,
              ),
          );
          setTotalProductos(pagination.total || productosFinal.length);
        } else if (Array.isArray(result)) {
          // Fallback por si el backend devuelve un array directamente
          const productosFinal =
            debouncedSearchNombre && debouncedSearchNombre.trim() !== ""
              ? result.filter(
                  (p) =>
                    p.item &&
                    p.item
                      .toLowerCase()
                      .includes(debouncedSearchNombre.toLowerCase()),
                )
              : result;

          setProductos(productosFinal);
          setTotalPaginas(Math.ceil(productosFinal.length / productsPerPage));
          setTotalProductos(productosFinal.length);
        } else {
          setProductos([]);
          setTotalPaginas(1);
          setTotalProductos(0);
        }
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setProductos([]);
        setTotalPaginas(1);
        setTotalProductos(0);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, [authUser, currentPage, productsPerPage, debouncedSearchNombre]);

  const buildHeaders = () => {
    const headers = {};
    const token = authUser?.token || Cookies.get("access_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]:
        name === "precio" || name === "iva"
          ? value === ""
            ? ""
            : parseFloat(value)
          : name === "stock"
            ? value === ""
              ? 0
              : parseInt(value, 10)
            : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProductForm((prev) => ({
      ...prev,
      imagen: files,
    }));
    setFileNames(files.map((file) => file.name));
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    // Validación simple
    if (
      !productForm.sku ||
      !productForm.item ||
      !productForm.imagen ||
      productForm.imagen.length === 0 ||
      !productForm.descripcion ||
      !productForm.marca ||
      !productForm.categoria ||
      !productForm.subcategoria ||
      productForm.stock === 0 ||
      productForm.precio === "" ||
      productForm.precio <= 0
    ) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "Completa todos los campos. Debes cargar al menos una imagen.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("sku", productForm.sku);
      formData.append("item", productForm.item);
      formData.append("descripcion", productForm.descripcion);
      formData.append("marca", productForm.marca);
      formData.append("categoria", productForm.categoria);
      formData.append("subcategoria", productForm.subcategoria);
      formData.append("precio", productForm.precio);
      formData.append("iva", productForm.iva);
      formData.append("estado", productForm.estado);
      formData.append("stock", productForm.stock);

      // 👇 MULTIPLES IMÁGENES
      if (productForm.imagen && productForm.imagen.length > 0) {
        Array.from(productForm.imagen).forEach((file) => {
          formData.append("imagen", file);
        });
      }

      console.log("DEBUG FORM DATA");
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const { data } = await axiosInstance.post("/api/products", formData, {
        headers: {
          ...buildHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Producto creado",
        text: "El producto fue cargado correctamente",
      });

      setCurrentPage(1);

      // recargar productos
      const response = await axiosInstance.get("/api/products", {
        headers: buildHeaders(),
        params: { page: 1, limit: productsPerPage },
      });

      const result = response.data;
      setProductos(result.products || []);
      setTotalPaginas(result.pagination?.totalPages || 1);
      setTotalProductos(result.pagination?.total || 0);

      // reset form
      setProductForm({
        sku: "",
        item: "",
        imagen: [],
        descripcion: "",
        marca: "",
        categoria: "",
        subcategoria: "",
        stock: 0,
        precio: "",
        iva: 0,
        estado: "activo",
      });
    } catch (error) {
      console.error("ERROR:", error.response?.data || error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudo crear el producto",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!editingProduct) return;

    // Validación (las imágenes son opcionales al editar)
    if (
      !productForm.sku ||
      !productForm.item ||
      !productForm.descripcion ||
      !productForm.categoria ||
      !productForm.subcategoria ||
      productForm.stock === 0 ||
      productForm.precio === "" ||
      productForm.precio <= 0
    ) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "Por favor, completa todos los campos requeridos. El precio debe ser mayor a 0.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    setSubmitting(true);

    try {
      const headers = buildHeaders();

      // Si hay archivos nuevos, usar FormData
      if (productForm.imagenes.length > 0) {
        const formData = new FormData();
        formData.append("sku", productForm.sku);
        formData.append("item", productForm.item);
        formData.append("descripcion", productForm.descripcion);
        formData.append("marca", productForm.marca);
        formData.append("categoria", productForm.categoria);
        formData.append("subcategoria", productForm.subcategoria);
        formData.append("stock", productForm.stock);
        formData.append("precio", parseFloat(productForm.precio));
        formData.append("iva", parseFloat(productForm.iva) || 0);
        formData.append("estado", productForm.estado);

        // Agregar archivos
        productForm.imagenes.forEach((file) => {
          if (file) {
            formData.append("imagen", file);
          }
        });

        // Debug: logear productForm y contenido de FormData antes de actualizar
        console.log(
          "Actualizando producto (FormData), productForm:",
          productForm,
        );

        for (const entry of formData.entries())
          console.log("formData", entry[0], entry[1]);

        await axiosInstance.put(`/api/products/${editingProduct}`, formData, {
          headers: {
            ...headers,
          },
        });
      } else {
        // Si no hay archivos nuevos, enviar como JSON
        const productData = {
          sku: productForm.sku,
          item: productForm.item,
          subcategoria: productForm.subcategoria,
          stock: productForm.stock,
          descripcion: productForm.descripcion,
          categoria: productForm.categoria,
          precio: parseFloat(productForm.precio),
          iva: parseFloat(productForm.iva) || 0,
          estado: productForm.estado,
        };

        await axiosInstance.put(
          `/api/products/${editingProduct}`,
          productData,
          {
            headers: headers,
          },
        );
      }

      Swal.fire({
        icon: "success",
        title: "Producto actualizado",
        text: "El producto ha sido actualizado correctamente.",
        confirmButtonColor: "#28a745",
      });

      // Recargar productos
      const response = await axiosInstance.get("/api/products", {
        headers: buildHeaders(),
        params: {
          page: currentPage,
          limit: productsPerPage,
        },
      });
      // El backend devuelve un objeto con products y pagination
      const result = response.data;
      if (result.products && Array.isArray(result.products)) {
        setProductos(result.products);
        const pagination = result.pagination || {};
        setTotalPaginas(
          pagination.totalPages ||
            Math.ceil((pagination.total || 0) / productsPerPage),
        );
        setTotalProductos(pagination.total || result.products.length);
      } else if (Array.isArray(result)) {
        setProductos(result);
        setTotalPaginas(Math.ceil(result.length / productsPerPage));
        setTotalProductos(result.length);
      } else {
        setProductos([]);
        setTotalPaginas(1);
        setTotalProductos(0);
      }

      // Limpiar formulario y edición
      setEditingProduct(null);
      setProductForm({
        sku: "",
        item: "",
        subcategoria: "",
        stock: 0,
        imagen: null,
        imagenes: [],
        descripcion: "",
        marca: "",
        categoria: "",
        precio: "",
        iva: 0,
        estado: "activo",
      });
      // Limpiar el input de archivo
      const fileInput = document.getElementById("imagen");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "No se pudo actualizar el producto";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#d33",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProduct = (producto) => {
    setEditingProduct(producto._id || producto.id);
    setProductForm({
      sku: producto.sku || "",
      item: producto.item || "",
      imagen: producto.imagen || null,
      imagenes: [],
      descripcion: producto.descripcion || "",
      marca: producto.marca || "",
      categoria: producto.categoria || "",
      subcategoria: producto.subcategoria || "",
      stock: producto.stock || 0,
      precio: producto.precio || "",
      iva: producto.iva || 0,
      estado: producto.estado || "activo",
    });
    // Limpiar el input de archivo
    const fileInput = document.getElementById("imagen");
    if (fileInput) fileInput.value = "";
    // Scroll al formulario
    document
      .querySelector(".profile-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteProduct = async (productoId) => {
    const confirmResult = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirmResult.isConfirmed) {
      try {
        await axiosInstance.delete(`/api/products/${productoId}`);
        Swal.fire({
          icon: "success",
          title: "Producto eliminado",
          text: "El producto ha sido eliminado correctamente.",
          confirmButtonColor: "#3085d6",
        });
        // Refrescar la lista de productos
        setProductos((prev) => prev.filter((p) => p._id !== productoId));
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.response?.data?.message ||
            error.message ||
            "No se pudo eliminar el producto.",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setProductForm({
      sku: "",
      item: "",
      imagen: null,
      imagenes: [],
      descripcion: "",
      marca: "",
      categoria: "",
      subcategoria: "",
      stock: 0,
      precio: "",
      iva: 0,
      estado: "activo",
    });
    // Limpiar el input de archivo
    const fileInput = document.getElementById("imagen");
    if (fileInput) fileInput.value = "";
  };

  const cambiarPagina = (nuevaPagina) => {
    setCurrentPage(nuevaPagina);
    // Scroll al inicio de la tabla
    document
      .querySelector(".admin-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className="admin-section">
        <p className="titulo-admin-section">Crear Producto</p>
        <form
          onSubmit={editingProduct ? handleUpdateProduct : handleSubmitProduct}
          className="profile-form"
        >
          <div className="form-group">
            <label htmlFor="sku">SKU *</label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={productForm.sku}
              onChange={handleInputChange}
              placeholder="Ej: PROD-001"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="item">Nombre del Producto *</label>
            <input
              type="text"
              id="item"
              name="item"
              value={productForm.item}
              onChange={handleInputChange}
              placeholder="Ej: Taladro Eléctrico"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="imagen">
              Imágenes del Producto {!editingProduct && "*"} (máximo 10)
            </label>
            <input
              type="file"
              id="imagen"
              name="imagen"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              required
            />

            <small
              style={{
                color: "#666",
                fontSize: "0.85rem",
                marginTop: "5px",
                display: "block",
              }}
            >
              {editingProduct
                ? "Selecciona nuevas imágenes solo si deseas reemplazarlas. Si no seleccionas ninguna, se mantendrán las imágenes actuales."
                : "Puedes seleccionar hasta 10 imágenes. Si seleccionas múltiples, todas se subirán."}
            </small>
            {productForm.imagen.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#438796",
                    fontWeight: "bold",
                  }}
                >
                  {productForm.imagen.length} imagen(es) seleccionada(s):
                </p>
                <ul
                  style={{
                    fontSize: "0.85rem",
                    color: "#666",
                    marginTop: "5px",
                    paddingLeft: "20px",
                  }}
                >
                  {productForm.imagen.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={productForm.descripcion}
              onChange={handleInputChange}
              placeholder="Descripción detallada del producto"
              rows="4"
              style={{
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "1rem",
                fontFamily: "inherit",
                resize: "vertical",
                transition: "border-color 0.3s ease",
              }}
              onFocus={(e) => {
                e.target.style.outline = "none";
                e.target.style.borderColor = "#438796";
                e.target.style.boxShadow = "0 0 0 3px rgba(67, 135, 150, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ccc";
                e.target.style.boxShadow = "none";
              }}
              required
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
            }}
          >
            <div className="form-group">
              <label htmlFor="categoria">Categoría *</label>
              <input
                type="text"
                id="categoria"
                name="categoria"
                value={productForm.categoria}
                onChange={handleInputChange}
                placeholder="Ej: Herramientas Eléctricas"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="subcategoria">Sub Categoría *</label>
              <input
                type="text"
                id="subcategoria"
                name="subcategoria"
                value={productForm.subcategoria}
                onChange={handleInputChange}
                placeholder="Ej: Taladros"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="marca">Marca*</label>
              <input
                type="text"
                id="marca"
                name="marca"
                value={productForm.marca}
                onChange={handleInputChange}
                placeholder="Ej: Makita"
                required
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
            }}
          >
            <div className="form-group">
              <label htmlFor="precio">Precio *</label>
              <input
                type="number"
                id="precio"
                name="precio"
                value={productForm.precio}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="iva">IVA (%)</label>
              <input
                type="number"
                id="iva"
                name="iva"
                value={productForm.iva}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock *</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={productForm.stock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="estado">Estado *</label>
            <select
              id="estado"
              name="estado"
              value={productForm.estado}
              onChange={handleInputChange}
              style={{
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "1rem",
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "border-color 0.3s ease",
              }}
              onFocus={(e) => {
                e.target.style.outline = "none";
                e.target.style.borderColor = "#438796";
                e.target.style.boxShadow = "0 0 0 3px rgba(67, 135, 150, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ccc";
                e.target.style.boxShadow = "none";
              }}
              required
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="profile-save-btn"
              disabled={submitting}
              style={{
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting
                ? editingProduct
                  ? "Actualizando..."
                  : "Creando..."
                : editingProduct
                  ? "Actualizar Producto"
                  : "Crear Producto"}
            </button>
            {editingProduct ? (
              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleCancelEdit}
                disabled={submitting}
              >
                Cancelar Edición
              </button>
            ) : (
              <button
                type="button"
                className="profile-cancel-btn"
                onClick={() => {
                  setProductForm({
                    sku: "",
                    item: "",
                    imagen: null,
                    imagenes: [],
                    descripcion: "",
                    categoria: "",
                    subcategoria: "",
                    precio: "",
                    iva: 0,
                    stock: 0,
                    estado: "activo",
                  });
                  // Limpiar el input de archivo
                  const fileInput = document.getElementById("imagen");
                  if (fileInput) fileInput.value = "";
                }}
                disabled={submitting}
              >
                Limpiar
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="admin-section">
        <h2 className="titulo-admin-section">Lista de Productos</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchNombre}
              onChange={(e) => {
                setSearchNombre(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                minWidth: "220px",
              }}
            />
            <button
              type="button"
              onClick={() => {
                setSearchNombre("");
                setDebouncedSearchNombre("");
                setCurrentPage(1);
              }}
              disabled={!searchNombre}
              style={{
                padding: "8px 12px",
                backgroundColor: searchNombre ? "#438796" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: searchNombre ? "pointer" : "not-allowed",
              }}
            >
              Limpiar
            </button>
          </div>

          {debouncedSearchNombre && (
            <div style={{ fontSize: "0.9rem", color: "#666" }}>
              Resultados para:{" "}
              <strong style={{ color: "#438796" }}>
                {debouncedSearchNombre}
              </strong>
            </div>
          )}
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>IVA</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!Array.isArray(productos) || productos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-users">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                productos.map((producto) => (
                  <tr key={producto._id || producto.id}>
                    <td
                      style={{
                        maxWidth: "300px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {producto.sku || "N/A"}
                    </td>
                    <td>
                      <img
                        src={getImageUrl(
                          // Usar siempre la primera imagen disponible
                          Array.isArray(producto.imagen)
                            ? producto.imagen[0]
                            : Array.isArray(producto.imagenes)
                              ? producto.imagenes[0]
                              : producto.imagen,
                        )}
                        alt={producto.item || "Producto"}
                        className="imagen-tabla"
                        onError={(e) => {
                          const attemptedUrl = e.target.src;
                          console.error(
                            "❌ Error cargando imagen del producto:",
                            {
                              producto: producto.item,
                              rutaOriginal: producto.imagen,
                              urlIntentada: attemptedUrl,
                              apiUrl:
                                import.meta.env.VITE_API_URL ||
                                "http://localhost:3000",
                            },
                          );
                          e.target.src = "/vite.svg";
                        }}
                      />
                    </td>
                    <td>{producto.item || "N/A"}</td>
                    <td>{producto.categoria || "N/A"}</td>

                    <td>
                      $
                      {producto.precio
                        ? Number(producto.precio).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "0.00"}
                    </td>
                    <td>{producto.iva ? `${producto.iva}%` : "0%"}</td>
                    <td>
                      <span
                        className={`role-badge ${
                          producto.estado === "activo"
                            ? "role-admin"
                            : "role-user"
                        }`}
                      >
                        {producto.estado === "activo" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditProduct(producto)}
                        style={{
                          marginRight: "10px",
                          padding: "6px 12px",
                          backgroundColor: "#438796",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDeleteProduct(
                            producto._id || producto.id,
                            producto.item || "Producto",
                          )
                        }
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Controles de paginación */}
        {totalPaginas > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ fontSize: "0.9rem", color: "#666" }}>
              <p style={{ margin: 0 }}>
                Mostrando {productos.length} de {totalProductos} productos
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                className="btn-paginacion"
                onClick={() => cambiarPagina(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 16px",
                  backgroundColor: currentPage === 1 ? "#ccc" : "#438796",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                  opacity: currentPage === 1 ? 0.6 : 1,
                }}
              >
                Anterior
              </button>

              <div style={{ display: "flex", gap: "4px" }}>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                  (numero) => {
                    // Mostrar solo algunas páginas alrededor de la actual
                    if (
                      numero === 1 ||
                      numero === totalPaginas ||
                      (numero >= currentPage - 1 && numero <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={numero}
                          className={`btn-pagina ${currentPage === numero ? "activa" : ""}`}
                          onClick={() => cambiarPagina(numero)}
                          style={{
                            padding: "8px 12px",
                            backgroundColor:
                              currentPage === numero ? "#438796" : "white",
                            color: currentPage === numero ? "white" : "#438796",
                            border: "1px solid #438796",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight:
                              currentPage === numero ? "bold" : "normal",
                          }}
                        >
                          {numero}
                        </button>
                      );
                    } else if (
                      numero === currentPage - 2 ||
                      numero === currentPage + 2
                    ) {
                      return (
                        <span
                          key={numero}
                          style={{ padding: "8px", color: "#666" }}
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  },
                )}
              </div>

              <button
                className="btn-paginacion"
                onClick={() => cambiarPagina(currentPage + 1)}
                disabled={currentPage === totalPaginas}
                style={{
                  padding: "8px 16px",
                  backgroundColor:
                    currentPage === totalPaginas ? "#ccc" : "#438796",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor:
                    currentPage === totalPaginas ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                  opacity: currentPage === totalPaginas ? 0.6 : 1,
                }}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NewProduct;
