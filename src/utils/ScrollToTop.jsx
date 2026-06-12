// ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // o con animación suave:
    // window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

export default ScrollToTop;