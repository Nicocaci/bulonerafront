import React, { useState, useEffect } from "react";
import { useProducts } from "../../../hooks/useProducts.js";
import ProductForm from "./products/ProductForm.jsx";
import ProductTable from "./products/ProductTable.jsx";
import Pagination from "../../../components/Pagination.jsx";
import "../../../css/productAdmin.css"

const ProductsPage = () => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchNombre, setSearchNombre] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const productsPerPage = 7;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchNombre), 300);
    return () => clearTimeout(t);
  }, [searchNombre]);

  const { data, isLoading, refetch } = useProducts({
    page: currentPage,
    limit: productsPerPage,
    search: debouncedSearch,
  });

  return (
    <div className="admin-section">
      <h2>Productos</h2>

      <ProductForm
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        refetch={refetch}
      />

      <h2>Buscar Productos</h2>
      <input
        placeholder="Buscar..."
        value={searchNombre}
        onChange={(e) => {
          setSearchNombre(e.target.value);
          setCurrentPage(1);
        }}
      />

      <div className="users-table-container">
      <ProductTable
        productos={data?.products || []}
        isLoading={isLoading}
        onEdit={setEditingProduct}
        refetch={refetch}
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