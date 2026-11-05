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

  // Atributos de accesibilidad de un campo con su error
  const conError = (campo) =>
    errores[campo]
      ? { "aria-invalid": true, "aria-describedby": `error-${campo}` }
      : {};

  const mensajeError = (campo) =>
    errores[campo] && (
      <small id={`error-${campo}`} className="auth-modal__error">
        {errores[campo]}
      </small>
    );

  return (
    <div className="auth-modal-overlay">
      <div
        className="auth-modal"
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
          ×
        </button>
        <h2 className="auth-modal__title" id="auth-modal-titulo">
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h2>
        <p className="auth-modal__subtitle">
          {mode === "login"
            ? "Accedé a tu cuenta para continuar con tu compra."
            : "Registrate para continuar con tu compra."}
        </p>

        <form onSubmit={handleSubmit} className="auth-modal__form" noValidate>
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

          {mode === "register" && (
            <>
              <label>
                Nombre
                <input
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                  placeholder="Ej: Ana López"
                  {...conError("name")}
                />
                {mensajeError("name")}
              </label>

              <label>
                Apellido
                <input
                  type="text"
                  name="lastName"
                  value={formValues.lastName}
                  onChange={handleChange}
                  placeholder="Ej: González"
                  {...conError("lastName")}
                />
                {mensajeError("lastName")}
              </label>

              <label>
                DNI
                <input
                  type="text"
                  name="dni"
                  value={formValues.dni}
                  onChange={handleChange}
                  placeholder="Ej: 12345678"
                  {...conError("dni")}
                />
                {mensajeError("dni")}
              </label>

              <label>
                Dirección
                <input
                  type="text"
                  name="address"
                  value={formValues.address}
                  onChange={handleChange}
                  placeholder="Ej: Av. Siempre Viva 123"
                  {...conError("address")}
                />
                {mensajeError("address")}
              </label>
            </>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              {...conError("email")}
            />
            {mensajeError("email")}
          </label>

          <label>
            Contraseña
            <input
              type="password"
              name="password"
              value={formValues.password}
              onChange={handleChange}
              placeholder="*******"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              aria-invalid={errores.password ? true : undefined}
              aria-describedby={
                [errores.password && "error-password", mode === "register" && "password-hint"]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
            />
            {mensajeError("password")}
            {mode === "register" && !errores.password && (
              <small id="password-hint" className="auth-modal__hint">
                Mínimo {MIN_PASSWORD} caracteres.
              </small>
            )}
          </label>

          {mode === "register" && (
            <label>
              Confirmar contraseña
              <input
                type="password"
                name="confirmPassword"
                value={formValues.confirmPassword}
                onChange={handleChange}
                placeholder="*******"
                {...conError("confirmPassword")}
              />
              {mensajeError("confirmPassword")}
            </label>
          )}

          <button
            type="submit"
            className="auth-modal__submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Procesando..."
              : mode === "login"
                ? "Iniciar sesión"
                : "Registrarme"}
          </button>

          <button
            type="button"
            className="auth-modal__toggle"
            onClick={handleModeToggle}
            disabled={isSubmitting}
          >
            {mode === "login"
              ? "¿No tenés cuenta? Registrate"
              : "¿Ya tenés cuenta? Iniciá sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
