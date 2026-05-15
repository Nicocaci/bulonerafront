import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const delta = 1;
    const range = [];
    const result = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) result.push(l + 1);
        else if (i - l > 2) result.push("...");
      }
      result.push(i);
      l = i;
    }

    return result;
  };

  return (
    <div className="pagination">
      <button
        className="pagination-button nav-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <MdNavigateBefore />

      </button>

      {getPages().map((page, index) =>
        page === "..." ? (
          <span key={`dots-${index}`} className="pagination-dots">
            ···
          </span>
        ) : (
          <button
            key={page}
            className={`pagination-button ${page === currentPage ? "active" : ""}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ),
      )}

      <button
        className="pagination-button nav-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <MdNavigateNext />
      </button>
    </div>
  );
};

export default Pagination;
