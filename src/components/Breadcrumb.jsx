import { Link } from "react-router-dom";
import "../css/BreadCrumb.css";

const Breadcrumb = ({ items }) => {
  return (
    <nav className="breadcrumb" aria-label="Ruta de navegación">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="breadcrumb-item">
            {isLast || !item.path ? (
              <span className="breadcrumb-current" aria-current={isLast ? "page" : undefined}>
                {item.label}
              </span>
            ) : (
              <Link to={item.path} className="breadcrumb-link">
                {item.label}
              </Link>
            )}
            {!isLast && (
              <span className="breadcrumb-separator" aria-hidden="true">
                /
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
