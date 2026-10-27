import React, { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProducts } from "../../../hooks/useProducts.js";
import { catalogoKeys } from "../../../hooks/useCatalogo.js";
import ProductForm from "./products/ProductForm.jsx";
import ProductTable from "./products/ProductTable.jsx";
import Pagination from "../../../components/Pagination.jsx";
import "../../../css/productAdmin.css";

const ProductsPage = () => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchNombre, setSearchNombre] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const productsPerPage = 7;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchNombre);
      setCurrentPage(1); // resetear página acá, no en el onChange
    }, 300);
    return () => clearTimeout(t);
  }, [searchNombre]);

  const { data, isLoading, refetch } = useProducts({
    page: currentPage,
    limit: productsPerPage,
    search: debouncedSearch,
  });

  const handleEdit = useCallback((product) => {
    setEditingProduct(product);
  }, []);

  // Después de crear, editar o borrar: se actualiza la tabla del admin y se descarta
  // la caché del catálogo (home, productos, detalle) para que muestre los datos nuevos.
  const queryClient = useQueryClient();
  const handleRefetch = useCallback(() => {
    refetch();
    queryClient.invalidateQueries({ queryKey: catalogoKeys.todo });
  }, [refetch, queryClient]);

  return (
    <>
      <section className="admin-section" aria-labelledby="titulo-form-producto">
        <h2 id="titulo-form-producto" className="titulo-admin-section">
          {editingProduct ? `Editar: ${editingProduct.item}` : "Nuevo producto"}
        </h2>
        <ProductForm
          editingProduct={editingProduct}
          setEditingProduct={setEditingProduct}
          refetch={handleRefetch}
        />
      </section>

      <section className="admin-section" aria-labelledby="titulo-lista-productos">
        <h2 id="titulo-lista-productos" className="titulo-admin-section">
          Lista de productos
        </h2>
        <input
          className="search-input"
          type="search"
          aria-label="Buscar productos"
          placeholder="Buscar por nombre o SKU..."
          value={searchNombre}
          onChange={(e) => setSearchNombre(e.target.value)}
        />

        <div className="users-table-container">
          <ProductTable
            productos={data?.products || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            refetch={handleRefetch}
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={data?.pagination?.totalPages || 1}
          onPageChange={setCurrentPage}
        />
      </section>
    </>
  );
};

export default ProductsPage;
