import React, { useState, useEffect, useCallback } from "react";
import { useProducts } from "../../../hooks/useProducts.js";
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

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="admin-section">
      <p className="titulo-admin-section">Productos</p>

      <ProductForm
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        refetch={refetch}
      />

      <p className="titulo-admin-section">Lista de Productos</p>
      <input
        className="search-input"
        placeholder="Buscar..."
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
    </div>
  );
};

export default ProductsPage;
