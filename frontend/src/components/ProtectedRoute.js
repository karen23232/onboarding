import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles, verificar que el usuario tenga uno de ellos
  if (roles && roles.length > 0) {
    const tieneRol = roles.includes(user?.rol);
    if (!tieneRol) {
      return (
        <div className="error-container">
          <h2>⛔ Acceso Denegado</h2>
          <p>No tienes permisos para acceder a esta página.</p>
          <button onClick={() => window.history.back()}>Volver</button>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;