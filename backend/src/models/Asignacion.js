import React, { useState, useEffect } from 'react';
import { asignacionesAPI, colaboradoresAPI, calendarioAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Asignaciones.css';

const Asignaciones = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creandoAsignacion, setCreandoAsignacion] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
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

      const [asigRes, colabRes, eventRes] = await Promise.all([
        asignacionesAPI.obtenerTodas(),
        colaboradoresAPI.obtenerTodos(),
        calendarioAPI.obtenerActivos()
      ]);

      const asignacionesData = Array.isArray(asigRes.data.asignaciones) 
        ? asigRes.data.asignaciones 
        : [];
      
      const colaboradoresData = Array.isArray(colabRes.data.colaboradores) 
        ? colabRes.data.colaboradores 
        : [];
      
      const eventosData = Array.isArray(eventRes.data.eventos) 
        ? eventRes.data.eventos 
        : [];

      console.log('📊 Datos cargados:', {
        asignaciones: asignacionesData.length,
        colaboradores: colaboradoresData.length,
        eventos: eventosData.length
      });

      setAsignaciones(asignacionesData);
      setColaboradores(colaboradoresData);
      setEventos(eventosData);

    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.colaborador_id || !formData.evento_id) {
      setError('⚠️ Por favor, selecciona un colaborador y un evento');
      return;
    }

    // Verificar duplicados en el frontend
    const yaExiste = asignaciones.some(
      asig => asig.colaborador_id === parseInt(formData.colaborador_id) && 
              asig.evento_id === parseInt(formData.evento_id)
    );

    if (yaExiste) {
      setError('⚠️ Esta asignación ya existe. Por favor, selecciona otra combinación.');
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      setError(null);
      setSuccessMessage('');
      setCreandoAsignacion(true);

      console.log('📤 Creando asignación:', {
        colaborador_id: formData.colaborador_id,
        evento_id: formData.evento_id
      });

      // ✅ CREAR LA ASIGNACIÓN
      const response = await asignacionesAPI.crear(
        parseInt(formData.colaborador_id),
        parseInt(formData.evento_id)
      );

      console.log('✅ Respuesta del servidor:', response.data);

      // ✅ LIMPIAR FORMULARIO Y CERRAR INMEDIATAMENTE
      setFormData({ colaborador_id: '', evento_id: '' });
      setMostrarFormulario(false);

      // ✅ RECARGAR TODAS LAS ASIGNACIONES PARA ASEGURAR DATOS COMPLETOS
      const asigRes = await asignacionesAPI.obtenerTodas();
      const asignacionesActualizadas = asigRes.data.asignaciones || [];
      
      console.log('🔄 Asignaciones actualizadas:', asignacionesActualizadas.length);
      
      setAsignaciones(asignacionesActualizadas);

      // ✅ MENSAJE DE ÉXITO
      setSuccessMessage('✅ Asignación creada exitosamente (correo pendiente de envío)');

      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);

    } catch (error) {
      console.error('❌ Error al crear asignación:', error);
      
      const mensajeError = error.response?.data?.mensaje || error.response?.data?.error;
      
      if (mensajeError && mensajeError.includes('ya existe')) {
        setError('⚠️ Esta asignación ya existe. Por favor, selecciona otra combinación.');
      } else {
        setError(`❌ Error: ${mensajeError || 'No se pudo crear la asignación'}`);
      }

      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setCreandoAsignacion(false);
    }
  };

  const handleEliminar = async (colaboradorId, eventoId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta asignación?')) {
      return;
    }

    try {
      setError(null);
      setSuccessMessage('');
      
      await asignacionesAPI.eliminar(colaboradorId, eventoId);
      
      // ✅ ELIMINAR DE LA TABLA INMEDIATAMENTE
      setAsignaciones(prev => 
        prev.filter(asig => 
          !(asig.colaborador_id === colaboradorId && asig.evento_id === eventoId)
        )
      );
      
      setSuccessMessage('✅ Asignación eliminada exitosamente');

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      setError('❌ Error al eliminar la asignación');
      
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const handleCancelar = () => {
    setFormData({ colaborador_id: '', evento_id: '' });
    setMostrarFormulario(false);
    setError(null);
    setSuccessMessage('');
  };

  const handleNuevaAsignacion = () => {
    setError(null);
    setSuccessMessage('');
    setMostrarFormulario(!mostrarFormulario);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (error) {
      setError(null);
    }
  };

  if (loading && asignaciones.length === 0) {
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
            onClick={handleNuevaAsignacion}
            className="btn btn-primary"
            disabled={colaboradores.length === 0 || eventos.length === 0}
          >
            <span>➕</span>
            Nueva Asignación
          </button>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {colaboradores.length === 0 && (
          <div className="alert alert-warning">
            ⚠️ No hay colaboradores registrados.
          </div>
        )}

        {eventos.length === 0 && (
          <div className="alert alert-warning">
            ⚠️ No hay eventos activos.
          </div>
        )}

        {mostrarFormulario && (
          <div className="form-card">
            <h3>Nueva Asignación</h3>

            <form onSubmit={handleSubmit} className="assignment-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="colaborador_id">Colaborador *</label>
                  <select
                    id="colaborador_id"
                    name="colaborador_id"
                    value={formData.colaborador_id}
                    onChange={(e) => handleInputChange('colaborador_id', e.target.value)}
                    className="form-input"
                    required
                    disabled={creandoAsignacion}
                  >
                    <option value="">Seleccionar...</option>
                    {colaboradores.map(colaborador => (
                      <option key={colaborador.id} value={colaborador.id}>
                        {colaborador.nombre_completo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="evento_id">Evento *</label>
                  <select
                    id="evento_id"
                    name="evento_id"
                    value={formData.evento_id}
                    onChange={(e) => handleInputChange('evento_id', e.target.value)}
                    className="form-input"
                    required
                    disabled={creandoAsignacion}
                  >
                    <option value="">Seleccionar...</option>
                    {eventos.map(evento => (
                      <option key={evento.id} value={evento.id}>
                        {evento.nombre_evento} - {new Date(evento.fecha_inicio).toLocaleDateString('es-CO')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={handleCancelar} 
                  className="btn btn-secondary"
                  disabled={creandoAsignacion}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={creandoAsignacion || !formData.colaborador_id || !formData.evento_id}
                >
                  {creandoAsignacion ? 'Creando...' : 'Crear Asignación'}
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
                    <td>
                      {asig.fecha_inicio && !isNaN(new Date(asig.fecha_inicio)) 
                        ? new Date(asig.fecha_inicio).toLocaleDateString('es-CO')
                        : 'Invalid Date'
                      }
                    </td>
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