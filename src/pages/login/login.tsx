import { useState } from 'react';
import { useUser } from '../../context/usercontext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';
import { validateFormMail } from '../../validateFunctions/validateFormMail';
import { validateFormPass } from '../../validateFunctions/validateFormPass';
import { useAlert } from '../../context/alertcontext';

import { processUserImageUrl } from '../../utils/imageUpload';

const Login = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [email, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid: validEmail, emailError } = validateFormMail(email);
    const { isValid: validPassword, passError } = validateFormPass(password);

    setEmailError(validEmail ? '' : emailError);
    setPassError(validPassword ? '' : passError);
    if (!validEmail || !validPassword) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/usuario/login`,
        { email, password },
        { withCredentials: true }
      );

      const usuario = response.data;
      console.log('Datos del usuario desde login:', usuario);

      const processedImageUrl = processUserImageUrl(usuario.img);
      console.log('URL de imagen procesada en login:', processedImageUrl);

      login({
        email: usuario.email,
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        img: processedImageUrl,
      });

      navigate('/');
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400 && data.message === 'Contraseña incorrecta') {
          setAuthError('La contraseña es incorrecta.');
        } else if (status === 404) {
          setAuthError('El usuario no existe.');
        } else if (
          status === 400 &&
          data.message === 'Email y contraseña son requeridos'
        ) {
          setAuthError('Por favor completá ambos campos.');
        } else {
          setAuthError('Ocurrió un error al iniciar sesión.');
        }
      } else {
        setAuthError('No se pudo conectar con el servidor.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Iniciar Sesión</h2>
        </div>
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="usuario" className="form-label">
              Usuario
            </label>
            <div className="input-wrapper">
              <span className="input-icon">@</span>
              <input
                type="text"
                id="usuario"
                value={email}
                onChange={(e) => {
                  const val = e.target.value;
                  setMail(val);
                  const { isValid, emailError } = validateFormMail(val);
                  setEmailError(isValid ? '' : emailError);
                  setAuthError('');
                }}
                className={`form-input ${
                  emailError ? 'input-invalid' : email ? 'input-valid' : ''
                }`}
                placeholder="Ingrese su correo"
              />
            </div>
            {emailError && <div className="error-text">{emailError}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="clave" className="form-label">
              Contraseña
            </label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="clave"
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                  const { isValid, passError } = validateFormPass(val);
                  setPassError(isValid ? '' : passError);
                  setAuthError('');
                }}
                className={`form-input ${
                  passError || authError === 'La contraseña es incorrecta.'
                    ? 'input-invalid'
                    : password
                    ? 'input-valid'
                    : ''
                }`}
                placeholder="Ingrese su contraseña"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {passError && <div className="error-text">{passError}</div>}
          </div>

          {authError && <div className="error-text">{authError}</div>}

          <div className="button-group">
            <button type="submit" className="login-button">
              Ingresar
            </button>
            <button
              type="button"
              className="create-user-button"
              onClick={() => navigate('/signup')}
            >
              Crear usuario
            </button>
            <button
              type="button"
              className="forgot-password-link"
              onClick={() =>
                showAlert(
                  'No se puede hacer nada, la proxima no seas tan boludo.',
                  'info'
                )
              }
            >
              Olvidaste tu contraseña?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { Login };
