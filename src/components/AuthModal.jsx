import React, { useState, useContext, useRef } from "react";
import axiosInstance from "../utils/axiosConfig";
import { AuthContext } from "../context/AuthContext";
import "../css/AuthModal.css";
import { avisar } from "../utils/avisos.js";
import { useDialogo } from "../hooks/useDialogo.js";

// Mismos límites que el backend (user-controller.js)
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

const CAMPOS_REGISTRO = ["name", "lastName", "dni", "address", "email", "password", "confirmPassword"];
const CAMPOS_LOGIN = ["email", "password"];

// Errores de cada campo (se muestran debajo del campo, no en una ventana aparte)
const validar = (valores, esRegistro) => {
  const errores = {};
  const requeridos = esRegistro ? CAMPOS_REGISTRO : CAMPOS_LOGIN;
  requeridos.forEach((campo) => {
    if (!valores[campo]) errores[campo] = "Completá este campo.";
  });
  if (!errores.email && !/^\S+@\S+\.\S+$/.test(valores.email)) {
    errores.email = "Ingresá un email válido.";
  }
  if (esRegistro && !errores.password) {
    if (valores.password.length < MIN_PASSWORD) {
      errores.password = `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
    } else if (valores.password.length > MAX_PASSWORD) {
      errores.password = `La contraseña puede tener hasta ${MAX_PASSWORD} caracteres.`;
    }
  }
  if (esRegistro && !errores.confirmPassword && valores.password !== valores.confirmPassword) {
    errores.confirmPassword = "Las contraseñas no coinciden.";
  }
  return errores;
};

const AuthModal = ({ onClose }) => {
  const { login, register } = useContext(AuthContext);
  const [formValues, setFormValues] = useState({
    name: "",
    lastName: "",
    dni: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");

  const [mode, setMode] = useState("login");
  // Diálogo accesible: foco en el primer campo, Tab no sale, Escape cierra
  const dialogoRef = useRef(null);
  useDialogo(dialogoRef, onClose);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verPassword, setVerPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Al corregir un campo, su error se va
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleModeToggle = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setErrores({});
    setErrorGeneral("");
    setVerPassword(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isRegisterMode = mode === "register";
    const nuevosErrores = validar(formValues, isRegisterMode);
    setErrores(nuevosErrores);
    setErrorGeneral("");

    const primeroConError = Object.keys(nuevosErrores)[0];
    if (primeroConError) {
      dialogoRef.current?.querySelector(`[name="${primeroConError}"]`)?.focus();
      return;
    }

    try {
      setIsSubmitting(true);

      if (isRegisterMode) {
        await register({
          nombre: formValues.name,
          apellido: formValues.lastName,
          dni: formValues.dni,
          direccion: formValues.address,
          email: formValues.email,
          password: formValues.password,
          role: "user",
        });

        onClose();
        avisar.exito("¡Registro exitoso!", "Tu cuenta fue creada y tu carrito fue guardado.");
        return; // 🔥 IMPORTANTE: corta acá
      }

      const { data } = await axiosInstance.post("/api/user/iniciarSesion", {
        email: formValues.email,
        password: formValues.password,
      });

      // El token puede venir en data.token o en una cookie HTTP-only
      // Si viene en cookie, el backend la establece automáticamente
      // Si viene en data, la guardamos manualmente
      const userData = {
        name: formValues.name || data.name,
        email: formValues.email || data.email,
        id: data.id || data._id,
        role: data.role,
        cart: data.cart ?? [],
        token: data.token, // Si el backend envía el token en la respuesta
      };

      // Usar el contexto de autenticación para hacer login
      login(userData);

      onClose();
      avisar.exito("¡Bienvenido!", "Sesión iniciada correctamente.");
    } catch (requestError) {
      const message =
        requestError.response?.data?.mensaje ||
        requestError.response?.data?.message ||
        `No se pudo completar el ${mode === "login" ? "inicio de sesión" : "registro"}. Intenta nuevamente.`;

      // El error del servidor se muestra arriba del formulario
      setErrorGeneral(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const esRegistro = mode === "register";

  // Atributos de accesibilidad de un campo con su error (y su ayuda, si tiene)
  const atributos = (campo, ayuda) => {
    const describe = [errores[campo] && `error-${campo}`, ayuda].filter(Boolean).join(" ");
    return {
      id: `auth-${campo}`,
      name: campo,
      value: formValues[campo],
      onChange: handleChange,
      "aria-invalid": errores[campo] ? true : undefined,
      "aria-describedby": describe || undefined,
    };
  };

  const mensajeError = (campo) =>
    errores[campo] && (
      <small id={`error-${campo}`} className="auth-modal__error">
        {errores[campo]}
      </small>
    );

  // Campo con la etiqueta arriba y el error debajo
  const campo = (nombre, etiqueta, props = {}, clase = "") => (
    <div className={`auth-modal__campo ${clase}`}>
      <label htmlFor={`auth-${nombre}`}>{etiqueta}</label>
      <input type="text" {...props} {...atributos(nombre)} />
      {mensajeError(nombre)}
    </div>
  );

  return (
    <div className="auth-modal-overlay">
      <div
        className={`auth-modal ${esRegistro ? "auth-modal--registro" : ""}`}
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-titulo"
      >
        <button
          type="button"
          className="auth-modal__close"
          onClick={onClose}
          aria-label="Cerrar formulario"
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="auth-modal__encabezado">
          <h2 className="auth-modal__title" id="auth-modal-titulo">
            {esRegistro ? "Crear cuenta" : "Iniciar sesión"}
          </h2>
          <p className="auth-modal__subtitle">
            {esRegistro
              ? "Registrate para continuar con tu compra."
              : "Accedé a tu cuenta para continuar con tu compra."}
          </p>
        </div>

        {errorGeneral && (
          <div className="auth-modal__error-general" role="alert">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.5v5" />
              <path d="M12 16v.01" />
            </svg>
            <span>{errorGeneral}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`auth-modal__form ${esRegistro ? "auth-modal__form--registro" : ""}`}
          noValidate
        >
          {esRegistro && (
            <>
              {campo("name", "Nombre", { placeholder: "Ej: Ana", autoComplete: "given-name" })}
              {campo("lastName", "Apellido", { placeholder: "Ej: González", autoComplete: "family-name" })}
              {campo("dni", "DNI", { placeholder: "Ej: 12345678", inputMode: "numeric" }, "auth-modal__campo--ancho-mobile")}
              {campo("address", "Dirección", { placeholder: "Ej: Av. Siempre Viva 123", autoComplete: "street-address" }, "auth-modal__campo--ancho-mobile")}
            </>
          )}

          {campo(
            "email",
            "Email",
            { type: "email", placeholder: "correo@ejemplo.com", autoComplete: "email" },
            "auth-modal__campo--ancho",
          )}

          <div className={`auth-modal__campo ${esRegistro ? "auth-modal__campo--ancho-mobile" : ""}`}>
            <label htmlFor="auth-password">Contraseña</label>
            <div className="auth-modal__password">
              <input
                type={verPassword ? "text" : "password"}
                autoComplete={esRegistro ? "new-password" : "current-password"}
                {...atributos("password", esRegistro && !errores.password ? "password-hint" : undefined)}
              />
              <button
                type="button"
                className="auth-modal__ver"
                onClick={() => setVerPassword((v) => !v)}
                aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={verPassword}
              >
                {verPassword ? (
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.8 9.8 0 0 0 5.4-1.6" />
                    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                  </svg>
                ) : (
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {mensajeError("password")}
            {esRegistro && !errores.password && (
              <small id="password-hint" className="auth-modal__hint">
                Mínimo {MIN_PASSWORD} caracteres.
              </small>
            )}
          </div>

          {esRegistro &&
            campo(
              "confirmPassword",
              "Confirmar contraseña",
              { type: verPassword ? "text" : "password", autoComplete: "new-password" },
              "auth-modal__campo--ancho-mobile",
            )}

          <button type="submit" className="auth-modal__submit" disabled={isSubmitting}>
            {isSubmitting ? "Procesando..." : esRegistro ? "Registrarme" : "Iniciar sesión"}
          </button>
        </form>

        <div className="auth-modal__separador">
          <span>{esRegistro ? "¿Ya tenés cuenta?" : "¿No tenés cuenta?"}</span>
        </div>

        <button
          type="button"
          className="auth-modal__toggle"
          onClick={handleModeToggle}
          disabled={isSubmitting}
        >
          {esRegistro ? "Iniciar sesión" : "Crear una cuenta"}
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
