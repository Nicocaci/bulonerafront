import { Link } from "react-router-dom";
import "../css/BreadCrumb.css";

const Breadcrumb = ({ items }) => {
  return (
    <nav className="breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="breadcrumb-item">
            {isLast || !item.path ? (
              <span className="breadcrumb-current">{item.label}</span>
            ) : (
              <Link to={item.path} className="breadcrumb-link">
                {item.label}
              </Link>
            )}
            {!isLast && <span className="breadcrumb-separator">›</span>}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;