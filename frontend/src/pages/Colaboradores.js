import React, { useState, useEffect } from 'react';
import { colaboradoresAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Colaboradores.css';

const Colaboradores = () => {
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [colaboradorEditando, setColaboradorEditando] = useState(null);
  const [filtro, setFiltro] = useState('todos');
  const [formData, setFormData] = useState({
    nombre_completo: '',
    correo: '',
    fecha_ingreso: '',
    notas: ''
  });

  // Obtener usuario actual y verificar permisos
  const usuarioActual = JSON.parse(localStorage.getItem('user') || '{}');
  const rolUsuario = usuarioActual.rol || 'colaborador';
  
  const puedeGestionarColaboradores = 
    rolUsuario === 'admin' || 
    rolUsuario === 'rrhh';

  useEffect(() => {
    cargarColaboradores();
  }, []);

  const cargarColaboradores = async () => {
    try {
      setLoading(true);
      const response = await colaboradoresAPI.obtenerTodos();
      setColaboradores(response.data.colaboradores || []);
    } catch (error) {
      console.error('Error al cargar colaboradores:', error);
      alert('Error al cargar colaboradores');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!puedeGestionarColaboradores) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }
    
    try {
      if (modoEdicion && colaboradorEditando) {
        // Actualizar
        await colaboradoresAPI.actualizar(colaboradorEditando.id, formData);
        alert('Colaborador actualizado exitosamente');
      } else {
        // Crear nuevo
        await colaboradoresAPI.crear(formData);
        alert('Colaborador registrado exitosamente');
      }
      
      resetForm();
      cargarColaboradores();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Error al guardar colaborador');
    }
  };

  const handleEditar = (colaborador) => {
    if (!puedeGestionarColaboradores) {
      alert('No tienes permisos para editar colaboradores');
      return;
    }
    
    setModoEdicion(true);
    setColaboradorEditando(colaborador);
    
    setFormData({
      nombre_completo: colaborador.nombre_completo,
      correo: colaborador.correo,
      fecha_ingreso: colaborador.fecha_ingreso || '',
      notas: colaborador.notas || ''
    });
    setMostrarModal(true);
  };

  const handleEliminar = async (id) => {
    if (!puedeGestionarColaboradores) {
      alert('No tienes permisos para eliminar colaboradores');
      return;
    }
    
    if (!window.confirm('¿Estás seguro de eliminar este colaborador?')) return;
    
    try {
      await colaboradoresAPI.eliminar(id);
      alert('Colaborador eliminado exitosamente');
      cargarColaboradores();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar colaborador');
    }
  };

  const handleCompletarBienvenida = async (id) => {
    if (!puedeGestionarColaboradores) {
      alert('No tienes permisos para marcar onboardings como completados');
      return;
    }
    
    try {
      await colaboradoresAPI.completarBienvenida(id);
      alert('Onboarding de bienvenida marcado como completado');
      cargarColaboradores();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar estado');
    }
  };

  const handleCompletarTecnico = async (id) => {
    if (!puedeGestionarColaboradores) {
      alert('No tienes permisos para marcar onboardings como completados');
      return;
    }
    
    const fecha = prompt('Ingresa la fecha de completación (YYYY-MM-DD):', 
                         new Date().toISOString().split('T')[0]);
    if (!fecha) return;
    
    try {
      await colaboradoresAPI.completarTecnico(id, fecha);
      alert('Onboarding técnico marcado como completado');
      cargarColaboradores();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar estado');
    }
  };

  const handleMarcarIncompletoBienvenida = async (id) => {
    if (!puedeGestionarColaboradores) {
      alert('No tienes permisos para marcar onboardings como incompletos');
      return;
    }
    
    if (!window.confirm('¿Estás seguro de marcar este onboarding como incompleto?')) return;
    
    try {
      await colaboradoresAPI.marcarIncompletoBienvenida(id);
      alert('Onboarding de bienvenida marcado como incompleto');
      cargarColaboradores();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar estado');
    }
  };

  const handleMarcarIncompletoTecnico = async (id) => {
    if (!puedeGestionarColaboradores) {
      alert('No tienes permisos para marcar onboardings como incompletos');
      return;
    }
    
    if (!window.confirm('¿Estás seguro de marcar este onboarding como incompleto? Se eliminará también la fecha de completación.')) return;
    
    try {
      await colaboradoresAPI.marcarIncompletoTecnico(id);
      alert('Onboarding técnico marcado como incompleto');
      cargarColaboradores();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar estado');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_completo: '',
      correo: '',
      fecha_ingreso: '',
      notas: ''
    });
    setMostrarModal(false);
    setModoEdicion(false);
    setColaboradorEditando(null);
  };

  const colaboradoresFiltrados = colaboradores.filter(c => {
    if (filtro === 'todos') return true;
    if (filtro === 'pendiente_bienvenida') return !c.onboarding_bienvenida;
    if (filtro === 'pendiente_tecnico') return !c.onboarding_tecnico;
    if (filtro === 'completados') return c.onboarding_bienvenida && c.onboarding_tecnico;
    return true;
  });

  const formatearFecha = (fechaString) => {
    if (!fechaString) return '-';
    
    const [año, mes, dia] = fechaString.split('-');
    return `${dia}/${mes}/${año}`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando colaboradores...</p>
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
            <h1>Gestión de Colaboradores</h1>
            <p className="page-subtitle">
              {puedeGestionarColaboradores 
                ? 'Registra y gestiona el onboarding de nuevos colaboradores'
                : 'Consulta el estado de onboarding de los colaboradores'
              }
            </p>
          </div>
          
          {puedeGestionarColaboradores && (
            <button 
              onClick={() => setMostrarModal(true)} 
              className="btn btn-primary"
            >
              <span>➕</span>
              Nuevo Colaborador
            </button>
          )}
        </div>

        {!puedeGestionarColaboradores && (
          <div className="info-banner">
            <span className="info-icon">ℹ️</span>
            <span className="info-text">Modo solo lectura - Solo Admin y RRHH pueden gestionar colaboradores</span>
          </div>
        )}

        {/* Filtros */}
        <div className="filters-container">
          <button 
            className={`filter-btn ${filtro === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltro('todos')}
          >
            Todos ({colaboradores.length})
          </button>
          <button 
            className={`filter-btn ${filtro === 'pendiente_bienvenida' ? 'active' : ''}`}
            onClick={() => setFiltro('pendiente_bienvenida')}
          >
            Pendiente Bienvenida ({colaboradores.filter(c => !c.onboarding_bienvenida).length})
          </button>
          <button 
            className={`filter-btn ${filtro === 'pendiente_tecnico' ? 'active' : ''}`}
            onClick={() => setFiltro('pendiente_tecnico')}
          >
            Pendiente Técnico ({colaboradores.filter(c => !c.onboarding_tecnico).length})
          </button>
          <button 
            className={`filter-btn ${filtro === 'completados' ? 'active' : ''}`}
            onClick={() => setFiltro('completados')}
          >
            Completados ({colaboradores.filter(c => c.onboarding_bienvenida && c.onboarding_tecnico).length})
          </button>
        </div>

        {/* Modal de Formulario */}
        {mostrarModal && puedeGestionarColaboradores && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{modoEdicion ? 'Editar Colaborador' : 'Nuevo Colaborador'}</h2>
                <button onClick={resetForm} className="btn-close">✕</button>
              </div>
              
              <form onSubmit={handleSubmit} className="colaborador-form">
                <div className="form-group">
                  <label htmlFor="nombre_completo">Nombre Completo *</label>
                  <input
                    type="text"
                    id="nombre_completo"
                    className="form-input"
                    value={formData.nombre_completo}
                    onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
                    required
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="correo">Correo Electrónico *</label>
                  <input
                    type="email"
                    id="correo"
                    className="form-input"
                    value={formData.correo}
                    onChange={(e) => setFormData({...formData, correo: e.target.value})}
                    required
                    placeholder="correo@bancobogota.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fecha_ingreso">Fecha de Ingreso *</label>
                  <input
                    type="date"
                    id="fecha_ingreso"
                    className="form-input"
                    value={formData.fecha_ingreso}
                    onChange={(e) => setFormData({...formData, fecha_ingreso: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notas">Notas (Opcional)</label>
                  <textarea
                    id="notas"
                    className="form-input"
                    rows="3"
                    value={formData.notas}
                    onChange={(e) => setFormData({...formData, notas: e.target.value})}
                    placeholder="Información adicional..."
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {modoEdicion ? 'Actualizar' : 'Registrar'} Colaborador
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabla de Colaboradores */}
        {colaboradoresFiltrados.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Fecha Ingreso</th>
                  <th>Onboarding Bienvenida</th>
                  <th>Onboarding Técnico</th>
                  <th>Fecha Técnico</th>
                  {puedeGestionarColaboradores && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {colaboradoresFiltrados.map(colaborador => (
                  <tr key={colaborador.id}>
                    <td className="td-name">{colaborador.nombre_completo}</td>
                    <td>{colaborador.correo}</td>
                    <td>{formatearFecha(colaborador.fecha_ingreso)}</td>
                    
                    {/* ✅ COLUMNA ONBOARDING BIENVENIDA CON BOTÓN INCOMPLETO */}
                    <td>
                      {colaborador.onboarding_bienvenida ? (
                        puedeGestionarColaboradores ? (
                          <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span className="badge badge-success">✓ Completado</span>
                            <button 
                              onClick={() => handleMarcarIncompletoBienvenida(colaborador.id)}
                              className="badge badge-secondary clickable"
                              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                              title="Marcar como incompleto"
                            >
                              Incompleto
                            </button>
                          </div>
                        ) : (
                          <span className="badge badge-success">✓ Completado</span>
                        )
                      ) : puedeGestionarColaboradores ? (
                        <button 
                          onClick={() => handleCompletarBienvenida(colaborador.id)}
                          className="badge badge-warning clickable"
                        >
                          Marcar Completado
                        </button>
                      ) : (
                        <span className="badge badge-warning">Pendiente</span>
                      )}
                    </td>
                    
                    {/* ✅ COLUMNA ONBOARDING TÉCNICO CON BOTÓN INCOMPLETO */}
                    <td>
                      {colaborador.onboarding_tecnico ? (
                        puedeGestionarColaboradores ? (
                          <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span className="badge badge-success">✓ Completado</span>
                            <button 
                              onClick={() => handleMarcarIncompletoTecnico(colaborador.id)}
                              className="badge badge-secondary clickable"
                              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                              title="Marcar como incompleto"
                            >
                              Incompleto
                            </button>
                          </div>
                        ) : (
                          <span className="badge badge-success">✓ Completado</span>
                        )
                      ) : puedeGestionarColaboradores ? (
                        <button 
                          onClick={() => handleCompletarTecnico(colaborador.id)}
                          className="badge badge-warning clickable"
                        >
                          Marcar Completado
                        </button>
                      ) : (
                        <span className="badge badge-warning">Pendiente</span>
                      )}
                    </td>
                    
                    <td>{formatearFecha(colaborador.fecha_onboarding_tecnico)}</td>
                    
                    {puedeGestionarColaboradores && (
                      <td className="td-actions">
                        <button
                          onClick={() => handleEditar(colaborador)}
                          className="btn-icon btn-edit"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleEliminar(colaborador.id)}
                          className="btn-icon btn-delete"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No hay colaboradores {filtro !== 'todos' ? 'con este filtro' : 'registrados'}</h3>
            {puedeGestionarColaboradores && (
              <p>Comienza registrando tu primer colaborador</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Colaboradores;