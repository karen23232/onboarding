import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay un token al cargar la aplicación
  useEffect(() => {
    const verificarAutenticacion = async () => {
      const token = localStorage.getItem('token');
      const userStorage = localStorage.getItem('user');

      if (token && userStorage) {
        try {
          // Verificar que el token siga siendo válido
          const response = await authAPI.verificarToken();
          setUser(response.data.usuario);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token inválido:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    verificarAutenticacion();
  }, []);

  // Login
  const login = async (correo, password) => {
    try {
      const response = await authAPI.login(correo, password);
      const { usuario, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));

      setUser(usuario);
      setIsAuthenticated(true);

      return { success: true, usuario };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al iniciar sesión'
      };
    }
  };

  // Registro
  const registro = async (datosUsuario) => {
    try {
      const response = await authAPI.registro(datosUsuario);
      const { usuario, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));

      setUser(usuario);
      setIsAuthenticated(true);

      return { success: true, usuario };
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al registrarse'
      };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Actualizar usuario
  const actualizarUsuario = (usuarioActualizado) => {
    setUser(usuarioActualizado);
    localStorage.setItem('user', JSON.stringify(usuarioActualizado));
  };

  // Verificar si el usuario tiene un rol específico
  const tieneRol = (roles) => {
    if (!user) return false;
    if (typeof roles === 'string') {
      return user.rol === roles;
    }
    if (Array.isArray(roles)) {
      return roles.includes(user.rol);
    }
    return false;
  };

  // Verificar si es admin
  const esAdmin = () => tieneRol('admin');

  // Verificar si es admin o RRHH
  const esAdminORRHH = () => tieneRol(['admin', 'rrhh']);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    registro,
    logout,
    actualizarUsuario,
    tieneRol,
    esAdmin,
    esAdminORRHH
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;