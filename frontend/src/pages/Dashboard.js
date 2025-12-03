import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colaboradoresAPI, calendarioAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalColaboradores: 0,
    onboardingCompletado: 0,
    onboardingPendiente: 0,
    proximosEventos: 0
  });
  const [proximosEventos, setProximosEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar colaboradores
      const colabResponse = await colaboradoresAPI.obtenerTodos();
      const colaboradores = colabResponse.data.colaboradores || [];

      // Calcular estadísticas
      const completado = colaboradores.filter(c => 
        c.onboarding_bienvenida && c.onboarding_tecnico
      ).length;
      const pendiente = colaboradores.length - completado;

      // Cargar próximos eventos
      const eventosResponse = await calendarioAPI.obtenerProximos(30);
      const eventos = eventosResponse.data.eventos || [];

      setStats({
        totalColaboradores: colaboradores.length,
        onboardingCompletado: completado,
        onboardingPendiente: pendiente,
        proximosEventos: eventos.length
      });

      setProximosEventos(eventos.slice(0, 5));
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-content-wrapper">
          <div className="dashboard-header">
            <div>
              <h1>¡Bienvenid@, {user?.nombre_completo}!</h1>
              <p className="dashboard-subtitle">
                Sistema de gestión de onboarding para nuevos colaboradores. 
                Administra el onboarding de bienvenida general y los programas técnicos 
                como Journey to Cloud, asegurando una integración exitosa de todo el equipo.
              </p>
            </div>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className="stats-grid">
            <div className="stat-card stat-blue">
              <div className="stat-content">
                <div className="stat-value">{stats.totalColaboradores}</div>
                <div className="stat-label">Total Colaboradores</div>
              </div>
            </div>

            <div className="stat-card stat-green">
              <div className="stat-content">
                <div className="stat-value">{stats.onboardingCompletado}</div>
                <div className="stat-label">Onboarding Completado</div>
              </div>
            </div>

            <div className="stat-card stat-orange">
              <div className="stat-content">
                <div className="stat-value">{stats.onboardingPendiente}</div>
                <div className="stat-label">Onboarding Pendiente</div>
              </div>
            </div>

            <div className="stat-card stat-purple">
              <div className="stat-content">
                <div className="stat-value">{stats.proximosEventos}</div>
                <div className="stat-label">Próximos Eventos</div>
              </div>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="quick-actions">
            <h2 className="section-title">Accesos Rápidos</h2>
            <div className="actions-grid">
              <Link to="/colaboradores" className="action-card">
                <div className="action-content">
                  <h3>Gestionar Colaboradores</h3>
                  <p>Ver, crear y editar colaboradores</p>
                </div>
                <div className="action-arrow">→</div>
              </Link>

              <Link to="/calendario" className="action-card">
                <div className="action-content">
                  <h3>Ver Calendario</h3>
                  <p>Eventos de onboarding programados</p>
                </div>
                <div className="action-arrow">→</div>
              </Link>

              <Link to="/asignaciones" className="action-card">
                <div className="action-content">
                  <h3>Asignaciones</h3>
                  <p>Asignar colaboradores a eventos</p>
                </div>
                <div className="action-arrow">→</div>
              </Link>
            </div>
          </div>

          {/* Próximos eventos */}
          <div className="upcoming-events">
            <div className="section-header">
              <h2 className="section-title">Próximos Eventos</h2>
              <Link to="/calendario" className="see-all-link">
                Ver todos →
              </Link>
            </div>

            {proximosEventos.length > 0 ? (
              <div className="events-list">
                {proximosEventos.map((evento) => (
                  <div key={evento.id} className="event-card">
                    <div className="event-date">
                      <div className="event-day">
                        {new Date(evento.fecha_inicio).getDate()}
                      </div>
                      <div className="event-month">
                        {new Date(evento.fecha_inicio).toLocaleDateString('es-CO', { month: 'short' })}
                      </div>
                    </div>
                    <div className="event-info">
                      <h3>{evento.nombre_evento}</h3>
                      <p className="event-description">{evento.descripcion || 'Sin descripción'}</p>
                      <div className="event-meta">
                        <span className="event-type">{evento.tipo}</span>
                        <span className="event-range">
                          {formatearFecha(evento.fecha_inicio)} - {formatearFecha(evento.fecha_fin)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No hay eventos próximos en los próximos 30 días</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;