import React, { useState, useEffect } from 'react';
import { calendarioAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Calendario.css';

const Calendario = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anioSeleccionado, setAnioSeleccionado] = useState(2025);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre_evento: '',
    tipo: 'Journey to Cloud',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: ''
  });

  // Obtener usuario actual desde localStorage
  const usuarioActual = JSON.parse(localStorage.getItem('user') || '{}');
  const rolUsuario = usuarioActual.rol || 'colaborador';
  
  // CORRECCIÓN FINAL: Comparar con los roles en minúsculas de la base de datos
  const puedeGestionarEventos = 
    rolUsuario === 'admin' || 
    rolUsuario === 'rrhh';

  useEffect(() => {
    cargarEventos();
  }, [anioSeleccionado]);

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const response = await calendarioAPI.obtenerDelAnio(anioSeleccionado);
      setEventos(response.data.eventos || []);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      alert('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!puedeGestionarEventos) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }
    
    try {
      if (modoEdicion && eventoEditando) {
        // Actualizar evento existente
        await calendarioAPI.actualizar(eventoEditando.id, formData);
        alert('Evento actualizado exitosamente');
      } else {
        // Crear nuevo evento
        await calendarioAPI.crear(formData);
        alert('Evento creado exitosamente');
      }
      
      resetForm();
      cargarEventos();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Error al guardar evento');
    }
  };

  const handleEditar = (evento) => {
    if (!puedeGestionarEventos) {
      alert('No tienes permisos para editar eventos');
      return;
    }
    
    setModoEdicion(true);
    setEventoEditando(evento);
    setFormData({
      nombre_evento: evento.nombre_evento,
      tipo: evento.tipo,
      descripcion: evento.descripcion || '',
      fecha_inicio: evento.fecha_inicio.split('T')[0],
      fecha_fin: evento.fecha_fin.split('T')[0]
    });
    setMostrarModal(true);
  };

  const handleEliminar = async (id) => {
    if (!puedeGestionarEventos) {
      alert('No tienes permisos para eliminar eventos');
      return;
    }
    
    if (!window.confirm('¿Estás seguro de eliminar este evento?')) return;
    
    try {
      await calendarioAPI.eliminar(id);
      alert('Evento eliminado exitosamente');
      cargarEventos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar evento');
    }
  };

  const toggleActivo = async (evento) => {
    if (!puedeGestionarEventos) {
      alert('No tienes permisos para modificar el estado de eventos');
      return;
    }
    
    try {
      if (evento.activo) {
        await calendarioAPI.desactivar(evento.id);
      } else {
        await calendarioAPI.activar(evento.id);
      }
      cargarEventos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar estado del evento');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_evento: '',
      tipo: 'Journey to Cloud',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: ''
    });
    setMostrarModal(false);
    setModoEdicion(false);
    setEventoEditando(null);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const agruparPorMes = (eventos) => {
    const grupos = {};
    eventos.forEach(evento => {
      const mes = new Date(evento.fecha_inicio).toLocaleDateString('es-CO', { 
        month: 'long', 
        year: 'numeric' 
      });
      if (!grupos[mes]) {
        grupos[mes] = [];
      }
      grupos[mes].push(evento);
    });
    return grupos;
  };

  const eventosPorMes = agruparPorMes(eventos);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando calendario...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Calendario de Onboardings</h1>
            <p className="page-subtitle">
              Eventos de onboarding técnico programados para el año {anioSeleccionado}
            </p>
          </div>
          <div className="header-actions">
            <select 
              value={anioSeleccionado} 
              onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
              className="year-select"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
            
            {/* Solo mostrar botón si tiene permisos */}
            {puedeGestionarEventos && (
              <button 
                onClick={() => setMostrarModal(true)} 
                className="btn btn-primary"
              >
                <span>➕</span>
                Nuevo Evento
              </button>
            )}
          </div>
        </div>

        {/* Mensaje informativo para colaboradores */}
        {!puedeGestionarEventos && (
          <div className="info-banner">
            <span className="info-icon">ℹ️</span>
            <p>Estás viendo el calendario en modo de solo lectura. Solo los administradores y RRHH pueden gestionar eventos.</p>
          </div>
        )}

        {/* Modal de Formulario */}
        {mostrarModal && puedeGestionarEventos && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{modoEdicion ? 'Editar Evento' : 'Nuevo Evento'}</h2>
                <button onClick={resetForm} className="btn-close">✕</button>
              </div>
              
              <form onSubmit={handleSubmit} className="evento-form">
                <div className="form-group">
                  <label htmlFor="nombre_evento">Nombre del Evento *</label>
                  <input
                    type="text"
                    id="nombre_evento"
                    className="form-input"
                    value={formData.nombre_evento}
                    onChange={(e) => setFormData({...formData, nombre_evento: e.target.value})}
                    required
                    placeholder="Ej: Journey to Cloud - Q1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tipo">Tipo de Evento *</label>
                  <select
                    id="tipo"
                    className="form-input"
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    required
                  >
                    <option value="Journey to Cloud">Journey to Cloud</option>
                    <option value="Capítulo Técnico">Capítulo Técnico</option>
                    <option value="Onboarding General">Onboarding General</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="descripcion">Descripción</label>
                  <textarea
                    id="descripcion"
                    className="form-input"
                    rows="3"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    placeholder="Descripción del evento..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fecha_inicio">Fecha de Inicio *</label>
                    <input
                      type="date"
                      id="fecha_inicio"
                      className="form-input"
                      value={formData.fecha_inicio}
                      onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="fecha_fin">Fecha de Fin *</label>
                    <input
                      type="date"
                      id="fecha_fin"
                      className="form-input"
                      value={formData.fecha_fin}
                      onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {modoEdicion ? 'Actualizar' : 'Crear'} Evento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Eventos por Mes */}
        {Object.keys(eventosPorMes).length > 0 ? (
          <div className="calendar-grid">
            {Object.entries(eventosPorMes).map(([mes, eventosDelMes]) => (
              <div key={mes} className="month-section">
                <h2 className="month-title">{mes}</h2>
                <div className="events-list">
                  {eventosDelMes.map((evento) => (
                    <div key={evento.id} className="calendar-event-card">
                      <div className="event-header">
                        <div>
                          <h3>{evento.nombre_evento}</h3>
                          <span className={`event-badge ${evento.tipo.includes('Journey') ? 'badge-blue' : 'badge-purple'}`}>
                            {evento.tipo}
                          </span>
                          {!evento.activo && (
                            <span className="badge badge-inactive">Inactivo</span>
                          )}
                        </div>
                        
                        {/* Solo mostrar acciones si tiene permisos */}
                        {puedeGestionarEventos && (
                          <div className="event-actions">
                            <button
                              onClick={() => toggleActivo(evento)}
                              className={`btn-icon ${evento.activo ? 'btn-active' : 'btn-inactive'}`}
                              title={evento.activo ? 'Desactivar' : 'Activar'}
                            >
                              {evento.activo ? '✓' : '○'}
                            </button>
                            <button
                              onClick={() => handleEditar(evento)}
                              className="btn-icon btn-edit"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleEliminar(evento.id)}
                              className="btn-icon btn-delete"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                      {evento.descripcion && (
                        <p className="event-desc">{evento.descripcion}</p>
                      )}
                      <div className="event-dates">
                        <span className="date-label">📅 Inicio:</span>
                        <span>{formatearFecha(evento.fecha_inicio)}</span>
                      </div>
                      <div className="event-dates">
                        <span className="date-label">📅 Fin:</span>
                        <span>{formatearFecha(evento.fecha_fin)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No hay eventos programados</h3>
            <p>
              {puedeGestionarEventos 
                ? `Comienza creando tu primer evento de onboarding para ${anioSeleccionado}`
                : `No hay eventos programados para ${anioSeleccionado}`
              }
            </p>
            {puedeGestionarEventos && (
              <button onClick={() => setMostrarModal(true)} className="btn btn-primary">
                Crear Primer Evento
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Calendario;