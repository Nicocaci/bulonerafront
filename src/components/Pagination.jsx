const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div>
      <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        Anterior
      </button>

      <span>{currentPage} / {totalPages}</span>

      <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        Siguiente
      </button>
    </div>
  );
};

export default Pagination;