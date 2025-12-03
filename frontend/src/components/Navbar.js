import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout, esAdminORRHH } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/dashboard" className="brand-link">
            <img src="/assets/images/Logo.png" alt="Logo" className="logo-image" />

            <span className="brand-text">Banco de Bogotá</span>
          </Link>
        </div>

        <div className="navbar-menu">
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          
          <Link to="/colaboradores" className="nav-link">
            Colaboradores
          </Link>

          <Link to="/calendario" className="nav-link">
            Calendario
          </Link>

          {esAdminORRHH() && (
            <Link to="/asignaciones" className="nav-link">
              Asignaciones
            </Link>
          )}
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">
              {user?.nombre_completo?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.nombre_completo}</span>
              <span className="user-role">
                {user?.rol === 'admin' ? 'Admin' : 
                 user?.rol === 'rrhh' ? 'RRHH' : 
                 ' Colaborador'}
              </span>
            </div>
          </div>
          
          <button onClick={handleLogout} className="btn-logout">
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;