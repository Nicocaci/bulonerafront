import axiosInstance from "../utils/axiosConfig.js";
import { useQuery } from "@tanstack/react-query";
import ProductosDestacados from "./ProductosDestacados.jsx";

const MAX_RELACIONADOS = 15;

// El slider vive dentro de la columna del detalle (más angosta que el Home),
// por eso muestra menos cards por vista.
const BREAKPOINTS_DETALLE = {
  320: { slidesPerView: 2, spaceBetween: 12 },
  1024: { slidesPerView: 3, spaceBetween: 16 },
  1710: { slidesPerView: 4, spaceBetween: 16 },
};

const fetchProductos = async (params) => {
  const { data } = await axiosInstance.get("/api/products", {
    params: { ...params, limit: 20, vista: "resumen" },
  });
  return data.products || [];
};

// Productos relacionados: misma subcategoría (ej. baterías, otras amoladoras)
// y misma marca. Los que coinciden en ambas van primero.
const ProductosRelacionados = ({ producto }) => {
  const { _id, categoria, subcategoria, marca } = producto;

  const { data: relacionados = [] } = useQuery({
    queryKey: ["catalogo", "relacionados", _id],
    queryFn: async () => {
      const [mismaSubcategoria, mismaMarca] = await Promise.all([
        subcategoria
          ? fetchProductos({ category: categoria, subcategory: subcategoria })
          : [],
        marca ? fetchProductos({ marca }) : [],
      ]);

      const puntaje = (p) =>
        (p.subcategoria === subcategoria ? 1 : 0) +
        (p.marca === marca ? 1 : 0);

      const porId = new Map();
      [...mismaSubcategoria, ...mismaMarca].forEach((p) => {
        if (p._id !== _id && !porId.has(p._id)) porId.set(p._id, p);
      });

      return [...porId.values()]
        .sort((a, b) => puntaje(b) - puntaje(a))
        .slice(0, MAX_RELACIONADOS);
    },
    staleTime: 1000 * 60 * 5,
  });

  if (relacionados.length === 0) return null;

  return (
    <ProductosDestacados
      id="relacionados"
      className="productos-relacionados"
      breakpoints={BREAKPOINTS_DETALLE}
      titulo="Productos que te pueden interesar"
      productosIniciales={relacionados}
    />
  );
};

export default ProductosRelacionados;
