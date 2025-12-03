import React, { useState, useEffect } from 'react';
import { colaboradoresAPI } from '../services/api';
import '../styles/Modal.css';

const ModalColaborador = ({ colaborador, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    correo: '',
    fecha_ingreso: '',
    notas: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (colaborador) {
      setFormData({
        nombre_completo: colaborador.nombre_completo,
        correo: colaborador.correo,
        fecha_ingreso: colaborador.fecha_ingreso?.split('T')[0] || '',
        notas: colaborador.notas || ''
      });
    }
  }, [colaborador]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (colaborador) {
        await colaboradoresAPI.actualizar(colaborador.id, formData);
      } else {
        await colaboradoresAPI.crear(formData);
      }
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Error al guardar colaborador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{colaborador ? 'Editar Colaborador' : 'Nuevo Colaborador'}</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre Completo *</label>
            <input
              type="text"
              name="nombre_completo"
              className="form-input"
              value={formData.nombre_completo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Correo Electrónico *</label>
            <input
              type="email"
              name="correo"
              className="form-input"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Fecha de Ingreso *</label>
            <input
              type="date"
              name="fecha_ingreso"
              className="form-input"
              value={formData.fecha_ingreso}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Notas</label>
            <textarea
              name="notas"
              className="form-input"
              rows="4"
              value={formData.notas}
              onChange={handleChange}
              placeholder="Información adicional..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : colaborador ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalColaborador;