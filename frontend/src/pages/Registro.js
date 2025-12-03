import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Registro.css';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    correo: '',
    password: '',
    confirmarPassword: '',
    rol: 'colaborador'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const navigate = useNavigate();
  const { registro } = useAuth();

  const roles = [
    {
      value: 'colaborador',
      label: '👤 Colaborador',
      descripcion: 'Usuario básico del sistema',
      permisos: ['Ver dashboard personal', 'Consultar calendario de eventos', 'Ver tus asignaciones de onboarding']
    },
    {
      value: 'rrhh',
      label: '👔 RRHH (Recursos Humanos)',
      descripcion: 'Gestión de personal y eventos',
      permisos: ['Gestionar colaboradores', 'Crear y editar eventos', 'Asignar colaboradores a onboardings']
    },
    {
      value: 'admin',
      label: '👑 Administrador',
      descripcion: 'Acceso completo al sistema',
      permisos: ['Acceso total al sistema', 'Gestionar usuarios y roles', 'Todas las funciones de RRHH']
    }
  ];

  // Función para validar la contraseña
  const validatePassword = (password) => {
    const validation = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordValidation(validation);
    return Object.values(validation).every(v => v === true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Validar contraseña en tiempo real
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.nombre_completo || !formData.correo || !formData.password || !formData.confirmarPassword) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    // Validar que la contraseña cumpla con todos los requisitos
    if (!validatePassword(formData.password)) {
      setError('La contraseña no cumple con todos los requisitos de seguridad');
      setLoading(false);
      return;
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    const result = await registro({
      nombre_completo: formData.nombre_completo,
      correo: formData.correo,
      password: formData.password,
      rol: formData.rol
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const rolSeleccionado = roles.find(r => r.value === formData.rol);

  return (
    <div className="registro-container">
      <div className="registro-left">
        <div className="registro-brand">
          <div className="brand-logo-box">
            <img src="/assets/images/Logo.png" alt="Logo" className="logo-image" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h1>Banco de Bogotá</h1>
            <p className="brand-subtitle">Sistema de Gestión de Onboarding</p>
          </div>
        </div>
        
        <div className="registro-info">
          <h3>¿Por qué registrarte?</h3>
          <ul className="info-list">
            <li>
              <span>Accede al dashboard completo</span>
            </li>
            <li>
              <span>Consulta eventos de onboarding</span>
            </li>
            <li>
              <span>Recibe notificaciones importantes</span>
            </li>
            <li>
              <span>Seguimiento de tu progreso</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="registro-right">
        <div className="registro-card">
          <div className="registro-header">
            <h2>Crear Cuenta</h2>
            <p>Únete al sistema de onboarding</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="registro-form">
            <div className="form-group">
              <label htmlFor="nombre_completo">Nombre Completo</label>
              <input
                type="text"
                id="nombre_completo"
                name="nombre_completo"
                className="form-input"
                placeholder="Juan Pérez"
                value={formData.nombre_completo}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="correo">Correo Electrónico</label>
              <input
                type="email"
                id="correo"
                name="correo"
                className="form-input"
                placeholder="tu.correo@bancobogota.com"
                value={formData.correo}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Crea una contraseña segura"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ paddingRight: '45px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  disabled={loading}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              
              {/* Indicador de requisitos de contraseña */}
              {formData.password && (
                <div className="password-requirements" style={{
                  marginTop: '10px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>
                  <div style={{ marginBottom: '8px', fontWeight: '600', color: '#495057' }}>
                    Requisitos de seguridad:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ 
                      color: passwordValidation.length ? '#28a745' : '#dc3545',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>{passwordValidation.length ? '✓' : '✗'}</span>
                      <span>Mínimo 8 caracteres</span>
                    </div>
                    <div style={{ 
                      color: passwordValidation.uppercase ? '#28a745' : '#dc3545',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>{passwordValidation.uppercase ? '✓' : '✗'}</span>
                      <span>Al menos una letra mayúscula (A-Z)</span>
                    </div>
                    <div style={{ 
                      color: passwordValidation.lowercase ? '#28a745' : '#dc3545',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>{passwordValidation.lowercase ? '✓' : '✗'}</span>
                      <span>Al menos una letra minúscula (a-z)</span>
                    </div>
                    <div style={{ 
                      color: passwordValidation.number ? '#28a745' : '#dc3545',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>{passwordValidation.number ? '✓' : '✗'}</span>
                      <span>Al menos un número (0-9)</span>
                    </div>
                    <div style={{ 
                      color: passwordValidation.special ? '#28a745' : '#dc3545',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>{passwordValidation.special ? '✓' : '✗'}</span>
                      <span>Al menos un carácter especial (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmarPassword">Confirmar Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmarPassword"
                  name="confirmarPassword"
                  className="form-input"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmarPassword}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ paddingRight: '45px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  disabled={loading}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {formData.confirmarPassword && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '13px',
                  color: formData.password === formData.confirmarPassword ? '#28a745' : '#dc3545',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>{formData.password === formData.confirmarPassword ? '✓' : '✗'}</span>
                  <span>
                    {formData.password === formData.confirmarPassword 
                      ? 'Las contraseñas coinciden' 
                      : 'Las contraseñas no coinciden'}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="rol">Selecciona tu Rol</label>
              <select
                id="rol"
                name="rol"
                className="form-select"
                value={formData.rol}
                onChange={handleChange}
                disabled={loading}
                required
              >
                {roles.map((rol) => (
                  <option key={rol.value} value={rol.value}>
                    {rol.label}
                  </option>
                ))}
              </select>
            </div>

            {rolSeleccionado && (
              <div className="rol-info-box">
                <div className="rol-info-header">
                  <span className="rol-info-icon">{rolSeleccionado.label.split(' ')[0]}</span>
                  <div>
                    <h4>{rolSeleccionado.label}</h4>
                    <p>{rolSeleccionado.descripcion}</p>
                  </div>
                </div>
                <div className="rol-permisos">
                  <strong>Permisos:</strong>
                  <ul>
                    {rolSeleccionado.permisos.map((permiso, index) => (
                      <li key={index}>✓ {permiso}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="registro-footer">
            <p>
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="link">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;