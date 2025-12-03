import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funciones de autenticación
export const authAPI = {
  login: (correo, password) => api.post('/auth/login', { correo, password }),
  registro: (datosUsuario) => api.post('/auth/registro', datosUsuario),
  perfil: () => api.get('/auth/perfil'),
  verificarToken: () => api.get('/auth/verificar-token'),
  cambiarPassword: (passwordActual, passwordNuevo) => 
    api.post('/auth/cambiar-password', {
      password_actual: passwordActual,
      password_nuevo: passwordNuevo
    })
};

// Funciones de colaboradores
export const colaboradoresAPI = {
  obtenerTodos: () => api.get('/colaboradores'),
  obtenerPorId: (id) => api.get(`/colaboradores/${id}`),
  crear: (datos) => api.post('/colaboradores', datos),
  actualizar: (id, datos) => api.put(`/colaboradores/${id}`, datos),
  eliminar: (id) => api.delete(`/colaboradores/${id}`),
  filtrar: (params) => api.get('/colaboradores/filtrar', { params }),
  completarBienvenida: (id) => api.patch(`/colaboradores/${id}/completar-bienvenida`),
  completarTecnico: (id, fecha) => api.patch(`/colaboradores/${id}/completar-tecnico`, { fecha })
};

// Funciones de calendario
export const calendarioAPI = {
  obtenerTodos: () => api.get('/calendario'),
  obtenerActivos: () => api.get('/calendario/activos'),
  obtenerProximos: (dias) => api.get(`/calendario/proximos?dias=${dias}`),
  obtenerParaAlertas: () => api.get('/calendario/alertas'),
  obtenerPorTipo: (tipo) => api.get(`/calendario/tipo/${tipo}`),
  obtenerDelAnio: (anio) => api.get(`/calendario/anio/${anio}`),
  obtenerPorId: (id) => api.get(`/calendario/${id}`),
  crear: (datos) => api.post('/calendario', datos),
  actualizar: (id, datos) => api.put(`/calendario/${id}`, datos),
  eliminar: (id) => api.delete(`/calendario/${id}`),
  activar: (id) => api.patch(`/calendario/${id}/activar`),
  desactivar: (id) => api.patch(`/calendario/${id}/desactivar`)
};

// Funciones de asignaciones
export const asignacionesAPI = {
  obtenerTodas: () => api.get('/asignaciones'),
  obtenerPorColaborador: (colaboradorId) => api.get(`/asignaciones/colaborador/${colaboradorId}`),
  obtenerPorEvento: (eventoId) => api.get(`/asignaciones/evento/${eventoId}`),
  obtenerPendientes: (colaboradorId) => api.get(`/asignaciones/colaborador/${colaboradorId}/pendientes`),
  obtenerCompletadas: (colaboradorId) => api.get(`/asignaciones/colaborador/${colaboradorId}/completadas`),
  crear: (colaboradorId, eventoId) => api.post('/asignaciones', { colaborador_id: colaboradorId, evento_id: eventoId }),
  asignarMultiples: (colaboradoresIds, eventoId) => 
    api.post('/asignaciones/multiples', { colaboradores_ids: colaboradoresIds, evento_id: eventoId }),
  marcarCompletada: (colaboradorId, eventoId) => 
    api.patch(`/asignaciones/${colaboradorId}/${eventoId}/completar`),
  marcarNoCompletada: (colaboradorId, eventoId) => 
    api.patch(`/asignaciones/${colaboradorId}/${eventoId}/no-completar`),
  eliminar: (colaboradorId, eventoId) => api.delete(`/asignaciones/${colaboradorId}/${eventoId}`)
};

// Funciones de usuarios (admin)
export const usuariosAPI = {
  obtenerTodos: () => api.get('/usuarios'),
  obtenerPorId: (id) => api.get(`/usuarios/${id}`),
  obtenerPorRol: (rol) => api.get(`/usuarios/rol/${rol}`),
  actualizar: (id, datos) => api.put(`/usuarios/${id}`, datos),
  desactivar: (id) => api.patch(`/usuarios/${id}/desactivar`),
  activar: (id) => api.patch(`/usuarios/${id}/activar`),
  eliminar: (id) => api.delete(`/usuarios/${id}`)
};

// Funciones de notificaciones
export const notificacionesAPI = {
  enviarPrueba: (destinatario) => api.post('/notificaciones/prueba', { destinatario }),
  ejecutarAlertas: () => api.post('/notificaciones/ejecutar-alertas')
};

export default api;