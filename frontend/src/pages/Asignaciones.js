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

    // Verificar si la asignación ya existe ANTES de enviar
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

      // ✅ OBTENER DATOS DEL COLABORADOR Y EVENTO SELECCIONADOS
      const colaboradorSeleccionado = colaboradores.find(
        c => c.id === parseInt(formData.colaborador_id)
      );
      
      const eventoSeleccionado = eventos.find(
        e => e.id === parseInt(formData.evento_id)
      );

      // ✅ CREAR OBJETO DE NUEVA ASIGNACIÓN TEMPORAL (OPTIMISTIC UPDATE)
      const nuevaAsignacionTemp = {
        colaborador_id: parseInt(formData.colaborador_id),
        evento_id: parseInt(formData.evento_id),
        nombre_completo: colaboradorSeleccionado?.nombre_completo || 'Colaborador',
        nombre_evento: eventoSeleccionado?.nombre_evento || 'Evento',
        tipo: eventoSeleccionado?.tipo || 'Sin tipo',
        fecha_inicio: eventoSeleccionado?.fecha_inicio || new Date(),
        completado: false,
        _temporal: true // Marcador temporal
      };

      // ✅ AGREGAR A LA TABLA INMEDIATAMENTE (ACTUALIZACIÓN OPTIMISTA)
      setAsignaciones(prev => [...prev, nuevaAsignacionTemp]);

      // ✅ LIMPIAR FORMULARIO Y CERRAR INMEDIATAMENTE
      setFormData({ colaborador_id: '', evento_id: '' });
      setMostrarFormulario(false);

      // ✅ MOSTRAR MENSAJE DE "CREANDO..."
      setSuccessMessage('⏳ Creando asignación y enviando notificación...');

      // ✅ CREAR LA ASIGNACIÓN EN EL BACKEND
      const response = await asignacionesAPI.crear(
        parseInt(formData.colaborador_id),
        parseInt(formData.evento_id)
      );

      console.log('✅ Asignación creada en backend:', response.data);

      // ✅ ACTUALIZAR LA ASIGNACIÓN TEMPORAL CON DATOS REALES
      setAsignaciones(prev => 
        prev.map(asig => 
          asig._temporal && 
          asig.colaborador_id === nuevaAsignacionTemp.colaborador_id &&
          asig.evento_id === nuevaAsignacionTemp.evento_id
            ? { ...response.data.asignacion || nuevaAsignacionTemp, _temporal: false }
            : asig
        )
      );

      // ✅ MENSAJE DE ÉXITO
      if (response.data.correo_enviado) {
        setSuccessMessage('✅ Asignación creada y correo enviado exitosamente');
      } else {
        setSuccessMessage('✅ Asignación creada exitosamente (correo pendiente de envío)');
      }

      // ✅ OCULTAR MENSAJE DESPUÉS DE 4 SEGUNDOS
      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);

    } catch (error) {
      console.error('❌ Error al crear asignación:', error);
      
      // ✅ REVERTIR LA ACTUALIZACIÓN OPTIMISTA SI FALLA
      setAsignaciones(prev => 
        prev.filter(asig => !asig._temporal)
      );
      
      const mensajeError = error.response?.data?.mensaje || error.response?.data?.error;
      
      if (mensajeError && mensajeError.includes('ya existe')) {
        setError('⚠️ Esta asignación ya existe. Por favor, selecciona otra combinación.');
      } else if (error.response?.status === 504 || error.code === 'ECONNABORTED') {
        // Timeout - la asignación puede haberse creado
        setError('⚠️ La operación tomó más tiempo del esperado. Recargando datos...');
        setTimeout(() => {
          cargarDatos();
        }, 2000);
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

    // Guardar copia para poder revertir si falla
    const asignacionesBackup = [...asignaciones];

    try {
      setError(null);
      setSuccessMessage('');
      
      // ✅ ELIMINAR DE LA TABLA INMEDIATAMENTE (OPTIMISTIC UPDATE)
      setAsignaciones(prev => 
        prev.filter(asig => 
          !(asig.colaborador_id === colaboradorId && asig.evento_id === eventoId)
        )
      );
      
      // ✅ LLAMAR AL BACKEND
      await asignacionesAPI.eliminar(colaboradorId, eventoId);
      
      setSuccessMessage('✅ Asignación eliminada exitosamente');

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      
      // ✅ REVERTIR SI FALLA
      setAsignaciones(asignacionesBackup);
      
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
                  <tr 
                    key={`${asig.colaborador_id}-${asig.evento_id}-${idx}`}
                    className={asig._temporal ? 'row-temporal' : ''}
                  >
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
                        disabled={asig._temporal}
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