import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!correo || !password) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    const result = await login(correo, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      if (result.error.includes('Credenciales inválidas')) {
        setError('❌ Correo o contraseña incorrectos');
      } else if (result.error.includes('desactivado')) {
        setError('⛔ Tu cuenta ha sido desactivada');
      } else {
        setError(result.error);
      }
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-logo-box">
            <img src="/assets/images/Logo.png" alt="Logo" className="logo-image" />

          </div>
          <h1 className="brand-title">Banco de Bogotá</h1>
        </div>

        <div className="welcome-section">
          <h2 className="welcome-title">Bienvenido</h2>
          <h3 className="welcome-subtitle">Sistema de Onboarding de Colaboradores</h3>
          <p className="welcome-description">
            Gestiona el onboarding de nuevos colaboradores de manera eficiente
          </p>
        </div>

        <div className="features-list">
          <div className="feature-item">
            <span className="feature-text">Seguimiento en tiempo real</span>
          </div>
          <div className="feature-item">
            <span className="feature-text">Gestión centralizada</span>
          </div>
          <div className="feature-item">
            <span className="feature-text">Alertas automáticas</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <h2>Iniciar Sesión</h2>
            <p>Ingresa a tu cuenta para continuar</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="correo">Correo Electrónico</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="correo"
                  className="form-input"
                  placeholder="tu@email.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input with-toggle"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
    

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>o</span>
          </div>

          <div className="login-footer">
            <p>
              ¿No tienes una cuenta? <Link to="/registro" className="link">Regístrate aquí</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;