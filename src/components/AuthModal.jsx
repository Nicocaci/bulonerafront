import React, { useState, useContext } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import '../css/AuthModal.css';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';


const AuthModal = ({ onClose }) => {
  const { login } = useContext(AuthContext);
  const [formValues, setFormValues] = useState({
    name: '',
    lastName: '',
    dni: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [mode, setMode] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleModeToggle = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isRegisterMode = mode === 'register';
    const requiredFields = isRegisterMode
      ? ['name', 'lastName', 'dni', 'address', 'email', 'password', 'confirmPassword']
      : ['email', 'password'];

    const hasEmptyRequired = requiredFields.some((field) => !formValues[field]);
    if (hasEmptyRequired) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Completá todos los campos obligatorios.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    if (isRegisterMode && formValues.password !== formValues.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'Las contraseñas no coinciden.',
        confirmButtonColor: '#d33',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (isRegisterMode) {
        await axiosInstance.post('/api/user/registro', {
          nombre: formValues.name,
          apellido: formValues.lastName,
          dni: formValues.dni,
          direccion: formValues.address,
          email: formValues.email,
          password: formValues.password,
          role: 'user',
        });

        // Mostrar alerta de éxito del registro
        await Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Tu cuenta ha sido creada correctamente.',
          confirmButtonColor: '#28a745',
          timer: 2500,
          showConfirmButton: true,
        });
      }

      const { data } = await axiosInstance.post('/api/user/iniciarSesion', {
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
      
      // Cerrar el modal primero para que el Swal se vea bien
      onClose();
      
      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: mode === 'register' 
          ? 'Tu sesión ha sido iniciada.' 
          : 'Sesión iniciada correctamente.',
        confirmButtonColor: '#28a745',
        timer: 3000,
        showConfirmButton: true,
      });
    } catch (requestError) {
      const message =
        requestError.response?.data?.mensaje ||
        requestError.response?.data?.message ||
        `No se pudo completar el ${mode === 'login' ? 'inicio de sesión' : 'registro'}. Intenta nuevamente.`;
      
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Entendido',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="auth-modal__close" onClick={onClose} aria-label="Cerrar formulario">
          ×
        </button>
        <h2 className="auth-modal__title">
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </h2>
        <p className="auth-modal__subtitle">
          {mode === 'login'
            ? 'Accedé a tu cuenta para continuar con tu compra.'
            : 'Registrate para continuar con tu compra.'}
        </p>

        <form onSubmit={handleSubmit} className="auth-modal__form">
          {mode === 'register' && (
            <>
              <label>
                Nombre completo
                <input
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                  placeholder="Ej: Ana López"
                />
              </label>

              <label>
                Apellido
                <input
                  type="text"
                  name="lastName"
                  value={formValues.lastName}
                  onChange={handleChange}
                  placeholder="Ej: González"
                />
              </label>

              <label>
                DNI
                <input
                  type="text"
                  name="dni"
                  value={formValues.dni}
                  onChange={handleChange}
                  placeholder="Ej: 12345678"
                />
              </label>

              <label>
                Dirección
                <input
                  type="text"
                  name="address"
                  value={formValues.address}
                  onChange={handleChange}
                  placeholder="Ej: Av. Siempre Viva 123"
                />
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
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              name="password"
              value={formValues.password}
              onChange={handleChange}
              placeholder="*******"
            />
          </label>

          {mode === 'register' && (
            <label>
              Confirmar contraseña
              <input
                type="password"
                name="confirmPassword"
                value={formValues.confirmPassword}
                onChange={handleChange}
                placeholder="*******"
              />
            </label>
          )}

          <button type="submit" className="auth-modal__submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Procesando...'
              : mode === 'login'
              ? 'Iniciar sesión'
              : 'Registrarme'}
          </button>

          <button
            type="button"
            className="auth-modal__toggle"
            onClick={handleModeToggle}
            disabled={isSubmitting}
          >
            {mode === 'login'
              ? '¿No tenés cuenta? Registrate'
              : '¿Ya tenés cuenta? Iniciá sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;

