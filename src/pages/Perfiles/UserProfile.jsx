import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance, { getErrorMessage } from "../../utils/axiosConfig";
import { ANCHO_MINIATURA, getImageUrl, usarPlaceholder } from "../../utils/imageUtils";
import { CONTACTO, urlWhatsapp } from "../../utils/contacto.js";
import "../../css/MiCuenta.css";

// Estados que ve el cliente (el backend ya no manda los intentos de pago pendientes o
// rechazados). Las clases de color son las mismas del panel admin.
const ESTADOS = {
  pagado: "Pagado · lo estamos preparando",
  pendiente: "Pendiente",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
  reembolsado: "Reembolsado",
};

// Las compras que todavía no llegaron se muestran abiertas; las demás, cerradas
const ESTADOS_EN_CURSO = ["pagado", "pendiente", "enviado"];

const CAMPOS = [
  { name: "nombre", label: "Nombre", type: "text", autoComplete: "given-name" },
  { name: "apellido", label: "Apellido", type: "text", autoComplete: "family-name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "dni", label: "DNI", type: "text", autoComplete: "off" },
  { name: "direccion", label: "Dirección", type: "text", autoComplete: "street-address" },
];

const pesos = (n) => `$${Number(n || 0).toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;

const fecha = (order) => new Date(order.date || order.createdAt).toLocaleDateString("es-AR");

const cantidadProductos = (order) =>
  (order.products || []).reduce((acc, p) => acc + (p.quantity || 0), 0);

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

const datosIniciales = (data = {}) => ({
  nombre: data.nombre || "",
  apellido: data.apellido || "",
  dni: data.dni || "",
  direccion: data.direccion || "",
  email: data.email || "",
});

// ─── Una compra ────────────────────────────────────────────────
function Compra({ order }) {
  const [abierta, setAbierta] = useState(ESTADOS_EN_CURSO.includes(order.status));
  const idDetalle = `compra-${order._id}`;
  const retiro = order.envio?.metodo === "retiro_local";
  const correo = [order.shippingMethod?.correo, order.shippingMethod?.servicio]
    .filter(Boolean)
    .join(" · ");
  const seguimiento = order.enviopack?.trackingNumber;
  const unidades = cantidadProductos(order);

  return (
    <article className="compra">
      <header className="compra__cabecera">
        <h3 className="compra__numero">Pedido #{order.orderNumber ?? order._id.slice(-5)}</h3>
        <span className="compra__fecha">{fecha(order)}</span>
        <span className={`estado-orden estado-orden--${order.status}`}>
          {ESTADOS[order.status] || order.status}
        </span>
        {!abierta && (
          <span className="compra__unidades">{plural(unidades, "producto", "productos")}</span>
        )}
        <span className="compra__total">{pesos(order.total)}</span>
        <button
          type="button"
          className="compra__ver"
          aria-expanded={abierta}
          aria-controls={idDetalle}
          onClick={() => setAbierta((v) => !v)}
        >
          {abierta ? "Ocultar detalle" : "Ver detalle"}
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </header>

      {abierta && (
        <div className="compra__detalle" id={idDetalle}>
          <ul className="compra__productos">
            {order.products.map((item, i) => {
              const producto =
                item.product && typeof item.product === "object" ? item.product : null;
              const nombre = item.nombre || producto?.item || "Producto";
              const imagen = Array.isArray(producto?.imagen)
                ? producto.imagen[0]
                : producto?.imagen;
              const contenido = (
                <>
                  <img
                    src={getImageUrl(imagen, ANCHO_MINIATURA)}
                    alt=""
                    width={56}
                    height={56}
                    loading="lazy"
                    onError={usarPlaceholder}
                  />
                  <span className="compra__producto-texto">
                    <span className="compra__producto-nombre">{nombre}</span>
                    <span className="compra__producto-precio">
                      {item.quantity} × {pesos(item.precioUnitario)}
                    </span>
                  </span>
                </>
              );
              return (
                <li key={item._id || i}>
                  {producto?._id ? (
                    <Link to={`/producto/${producto._id}`} className="compra__producto">
                      {contenido}
                    </Link>
                  ) : (
                    <span className="compra__producto">{contenido}</span>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="compra__entrega">
            {retiro ? (
              <>
                <strong>Retiro en el local</strong>
                <span>{CONTACTO.direccion}, Gutiérrez · Lun a vie 8 a 18 h · Sáb 8 a 13 h</span>
              </>
            ) : (
              <>
                <strong>Envío a domicilio</strong>
                {correo && <span>{correo}</span>}
                <span>
                  {seguimiento ? (
                    <>
                      Seguimiento: <b>{seguimiento}</b>
                    </>
                  ) : (
                    "El número de seguimiento aparece cuando despachamos el pedido."
                  )}
                </span>
              </>
            )}
            {order.subtotal > 0 && (
              <span className="compra__montos">
                <span>
                  <span>Productos</span>
                  <span>{pesos(order.subtotal)}</span>
                </span>
                {!retiro && (
                  <span>
                    <span>Envío</span>
                    <span>{pesos(order.shippingCost)}</span>
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

// ─── Página ────────────────────────────────────────────────────
const UserProfile = () => {
  const { getProfile, updateProfile, refreshUser, logOut } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState(datosIniciales());
  // Mobile: se ve una sección a la vez
  const [pestana, setPestana] = useState("compras");

  const compras = useQuery({
    queryKey: ["mis-compras"],
    queryFn: () => axiosInstance.get("/api/orders").then((res) => res.data),
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setProfileData(data);
        setFormData(datosIniciales(data));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: getErrorMessage(error, "No se pudo cargar el perfil"),
          confirmButtonColor: "#3085d6",
        });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [getProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await updateProfile(null, formData);
      await refreshUser();
      setIsEditing(false);
      Swal.fire({
        icon: "success",
        title: "Perfil actualizado",
        text: "Tus datos se han actualizado correctamente.",
        confirmButtonColor: "#28a745",
      });
      const data = await getProfile();
      setProfileData(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(error, "No se pudo actualizar el perfil"),
        confirmButtonColor: "#d33",
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profileData) setFormData(datosIniciales(profileData));
  };

  if (loading) {
    return (
      <div className="mi-cuenta">
        <p className="mi-cuenta__mensaje">Cargando tu cuenta...</p>
      </div>
    );
  }

  const nombre = profileData?.nombre || "";
  const nombreCompleto = `${profileData?.nombre || ""} ${profileData?.apellido || ""}`.trim();
  const lista = compras.data ?? [];

  return (
    <div className="mi-cuenta">
      <div className="mi-cuenta__interior">
        <div className="mi-cuenta__encabezado">
          <h1>Mi cuenta</h1>
          <p>
            {nombre ? `Hola, ${nombre}.` : "Hola."}
            <span className="mi-cuenta__solo-desktop"> Acá ves tus compras y tus datos.</span>
          </p>
        </div>

        <nav className="mi-cuenta__pestanas" aria-label="Secciones de la cuenta">
          {[
            ["compras", "Mis compras"],
            ["datos", "Mis datos"],
          ].map(([id, texto]) => (
            <button
              key={id}
              type="button"
              aria-pressed={pestana === id}
              onClick={() => setPestana(id)}
            >
              {texto}
            </button>
          ))}
        </nav>

        <div className="mi-cuenta__grilla">
          {/* Datos */}
          <aside
            className={`mi-cuenta__datos ${pestana === "datos" ? "" : "mi-cuenta__oculto-mobile"}`}
            aria-labelledby="titulo-datos"
          >
            <div className="mi-cuenta__persona">
              <span className="mi-cuenta__avatar" aria-hidden="true">
                {(nombre || "?").charAt(0).toUpperCase()}
              </span>
              <div>
                <h2 id="titulo-datos">{nombreCompleto || "Mis datos"}</h2>
                <p>Cliente</p>
              </div>
            </div>

            {!isEditing ? (
              <>
                <dl className="mi-cuenta__lista-datos">
                  <div>
                    <dt>Email</dt>
                    <dd>{profileData?.email || "—"}</dd>
                  </div>
                  <div>
                    <dt>DNI</dt>
                    <dd>{profileData?.dni || "—"}</dd>
                  </div>
                  <div>
                    <dt>Dirección</dt>
                    <dd>{profileData?.direccion || "—"}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="mi-cuenta__boton-borde"
                  onClick={() => setIsEditing(true)}
                >
                  Editar mis datos
                </button>
              </>
            ) : (
              <form className="mi-cuenta__form" onSubmit={handleSubmit}>
                {CAMPOS.map((c) => (
                  <div key={c.name} className="mi-cuenta__campo">
                    <label htmlFor={`cuenta-${c.name}`}>{c.label}</label>
                    <input
                      id={`cuenta-${c.name}`}
                      name={c.name}
                      type={c.type}
                      autoComplete={c.autoComplete}
                      value={formData[c.name]}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                ))}
                <div className="mi-cuenta__form-acciones">
                  <button type="submit" className="mi-cuenta__boton" disabled={guardando}>
                    {guardando ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    className="mi-cuenta__boton-borde"
                    onClick={handleCancel}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div className="mi-cuenta__extras">
              <a href={urlWhatsapp()} target="_blank" rel="noopener noreferrer">
                ¿Dudas con una compra? Escribinos
                <span aria-hidden="true">→</span>
              </a>
              <button type="button" className="mi-cuenta__salir" onClick={logOut}>
                Cerrar sesión
              </button>
            </div>
          </aside>

          {/* Compras */}
          <section
            className={`mi-cuenta__compras ${pestana === "compras" ? "" : "mi-cuenta__oculto-mobile"}`}
            aria-labelledby="titulo-compras"
          >
            <div className="mi-cuenta__compras-encabezado">
              <h2 id="titulo-compras">Mis compras</h2>
              {lista.length > 0 && <span>{plural(lista.length, "compra", "compras")}</span>}
            </div>

            {compras.isLoading && <p className="mi-cuenta__mensaje">Cargando tus compras...</p>}
            {compras.isError && (
              <p className="mi-cuenta__mensaje mi-cuenta__mensaje--error">
                {getErrorMessage(compras.error, "No se pudieron cargar tus compras.")}
              </p>
            )}
            {compras.isSuccess && lista.length === 0 && (
              <div className="mi-cuenta__vacio">
                <p>Todavía no hiciste compras.</p>
                <Link to="/productos?todos=true" className="mi-cuenta__boton">
                  Ver productos
                </Link>
              </div>
            )}
            {lista.map((order) => (
              <Compra key={order._id} order={order} />
            ))}

            <p className="mi-cuenta__ayuda-mobile">
              ¿Dudas con una compra?{" "}
              <a href={urlWhatsapp()} target="_blank" rel="noopener noreferrer">
                Escribinos por WhatsApp
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
