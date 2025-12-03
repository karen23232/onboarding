import React, { useState, useEffect } from 'react';
import { asignacionesAPI, colaboradoresAPI, calendarioAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Asignaciones.css';

const Asignaciones = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    colaborador_id: '',
    evento_id: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Iniciando carga de datos...');

      const [asigRes, colabRes, eventRes] = await Promise.all([
        asignacionesAPI.obtenerTodas(),
        colaboradoresAPI.obtenerTodos(),
        calendarioAPI.obtenerActivos()
      ]);

      console.log('📦 Respuestas recibidas:', {
        asignaciones: asigRes.data,
        colaboradores: colabRes.data,
        eventos: eventRes.data
      });

      // Extraer datos de forma segura
      const asignacionesData = Array.isArray(asigRes.data.asignaciones) 
        ? asigRes.data.asignaciones 
        : [];
      
      const colaboradoresData = Array.isArray(colabRes.data.colaboradores) 
        ? colabRes.data.colaboradores 
        : [];
      
      const eventosData = Array.isArray(eventRes.data.eventos) 
        ? eventRes.data.eventos 
        : [];

      console.log('✅ Datos procesados:', {
        asignaciones: asignacionesData.length,
        colaboradores: colaboradoresData.length,
        eventos: eventosData.length
      });

      setAsignaciones(asignacionesData);
      setColaboradores(colaboradoresData);
      setEventos(eventosData);

      // Mostrar advertencias si hay arrays vacíos
      if (colaboradoresData.length === 0) {
        console.warn('⚠️ No hay colaboradores en la base de datos');
      }
      if (eventosData.length === 0) {
        console.warn('⚠️ No hay eventos activos en la base de datos');
      }

    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      console.error('❌ Detalles del error:', error.response?.data);
      setError('Error al cargar los datos. Por favor, recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones adicionales
    if (!formData.colaborador_id || !formData.evento_id) {
      alert('Por favor, selecciona un colaborador y un evento');
      return;
    }

    try {
      console.log('📤 Creando asignación:', formData);

      await asignacionesAPI.crear(
        parseInt(formData.colaborador_id),
        parseInt(formData.evento_id)
      );

      alert('Asignación creada exitosamente');
      setFormData({ colaborador_id: '', evento_id: '' });
      setMostrarFormulario(false);
      cargarDatos();
    } catch (error) {
      console.error('❌ Error al crear asignación:', error);
      const mensajeError = error.response?.data?.error || 'Error al crear asignación';
      alert(mensajeError);
    }
  };

  const handleEliminar = async (colaboradorId, eventoId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta asignación?')) {
      return;
    }

    try {
      await asignacionesAPI.eliminar(colaboradorId, eventoId);
      alert('Asignación eliminada exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('❌ Error al eliminar asignación:', error);
      alert('Error al eliminar la asignación');
    }
  };

  const handleCancelar = () => {
    setFormData({ colaborador_id: '', evento_id: '' });
    setMostrarFormulario(false);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando asignaciones...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="error-container">
            <h2>❌ Error</h2>
            <p>{error}</p>
            <button onClick={cargarDatos} className="btn btn-primary">
              Reintentar
            </button>
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
            <h1>Gestión de Asignaciones</h1>
            <p className="page-subtitle">
              Asigna colaboradores a eventos de onboarding
            </p>
          </div>
          <button 
            onClick={() => setMostrarFormulario(!mostrarFormulario)} 
            className="btn btn-primary"
            disabled={colaboradores.length === 0 || eventos.length === 0}
          >
            <span>➕</span>
            Nueva Asignación
          </button>
        </div>

        {/* Advertencias si no hay datos */}
        {colaboradores.length === 0 && (
          <div className="alert alert-warning">
            ⚠️ No hay colaboradores registrados. Por favor, registra colaboradores primero.
          </div>
        )}

        {eventos.length === 0 && (
          <div className="alert alert-warning">
            ⚠️ No hay eventos activos. Por favor, crea eventos en el calendario primero.
          </div>
        )}

        {mostrarFormulario && (
          <div className="form-card">
            <h3>Nueva Asignación</h3>
            
            {/* Debug info - Remover en producción */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{
                background: '#f8f9fa',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '15px',
                fontSize: '12px'
              }}>
                <strong>Debug:</strong> 
                Colaboradores: {colaboradores.length} | 
                Eventos: {eventos.length}
              </div>
            )}

            <form onSubmit={handleSubmit} className="assignment-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="colaborador_id">Colaborador *</label>
                  <select
                    id="colaborador_id"
                    name="colaborador_id"
                    value={formData.colaborador_id}
                    onChange={(e) => setFormData({...formData, colaborador_id: e.target.value})}
                    className="form-input"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {colaboradores.map(colaborador => (
                      <option key={colaborador.id} value={colaborador.id}>
                        {colaborador.nombre_completo}
                      </option>
                    ))}
                  </select>
                  {colaboradores.length === 0 && (
                    <small style={{color: '#dc3545'}}>
                      No hay colaboradores disponibles
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="evento_id">Evento *</label>
                  <select
                    id="evento_id"
                    name="evento_id"
                    value={formData.evento_id}
                    onChange={(e) => setFormData({...formData, evento_id: e.target.value})}
                    className="form-input"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {eventos.map(evento => (
                      <option key={evento.id} value={evento.id}>
                        {evento.nombre_evento} - {new Date(evento.fecha_inicio).toLocaleDateString('es-CO')}
                      </option>
                    ))}
                  </select>
                  {eventos.length === 0 && (
                    <small style={{color: '#dc3545'}}>
                      No hay eventos disponibles
                    </small>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={handleCancelar} 
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={colaboradores.length === 0 || eventos.length === 0}
                >
                  Crear Asignación
                </button>
              </div>
            </form>
          </div>
        )}

        {asignaciones.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>Evento</th>
                  <th>Tipo</th>
                  <th>Fecha Evento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asignaciones.map((asig, idx) => (
                  <tr key={`${asig.colaborador_id}-${asig.evento_id}-${idx}`}>
                    <td className="td-name">{asig.nombre_completo}</td>
                    <td>{asig.nombre_evento}</td>
                    <td><span className="badge badge-info">{asig.tipo}</span></td>
                    <td>{new Date(asig.fecha_inicio).toLocaleDateString('es-CO')}</td>
                    <td>
                      {asig.completado ? (
                        <span className="badge badge-success">✓ Completado</span>
                      ) : (
                        <span className="badge badge-warning">Pendiente</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleEliminar(asig.colaborador_id, asig.evento_id)}
                        className="btn-icon btn-delete"
                        title="Eliminar asignación"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔗</div>
            <h3>No hay asignaciones</h3>
            <p>Comienza creando tu primera asignación</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Asignaciones;