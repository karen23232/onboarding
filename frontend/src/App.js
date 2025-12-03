import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas públicas
import Login from './pages/Login';
import Registro from './pages/Registro';

// Páginas protegidas
import Dashboard from './pages/Dashboard';
import Colaboradores from './pages/Colaboradores';
import Calendario from './pages/Calendario';
import Asignaciones from './pages/Asignaciones';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/colaboradores"
            element={
              <ProtectedRoute>
                <Colaboradores />
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendario"
            element={
              <ProtectedRoute>
                <Calendario />
              </ProtectedRoute>
            }
          />

          <Route
            path="/asignaciones"
            element={
              <ProtectedRoute roles={['admin', 'rrhh']}>
                <Asignaciones />
              </ProtectedRoute>
            }
          />

          {/* Ruta por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;