import axios from 'axios';

// ✅ CORRECCIÓN: Remover /api del final
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('🌐 API_URL configurada:', API_URL);

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
    
    // Log para debug
    console.log('📤 Request:', config.method.toUpperCase(), config.url);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.config?.url, error.response?.status);
    
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
  login: (correo, password) => api.post('/api/auth/login', { correo, password }),
  registro: (datosUsuario) => api.post('/api/auth/registro', datosUsuario),
  perfil: () => api.get('/api/auth/perfil'),
  verificarToken: () => api.get('/api/auth/verificar-token'),
  cambiarPassword: (passwordActual, passwordNuevo) => 
    api.post('/api/auth/cambiar-password', {
      password_actual: passwordActual,
      password_nuevo: passwordNuevo
    })
};

// Funciones de colaboradores
export const colaboradoresAPI = {
  obtenerTodos: () => api.get('/api/colaboradores'),
  obtenerPorId: (id) => api.get(`/api/colaboradores/${id}`),
  crear: (datos) => api.post('/api/colaboradores', datos),
  actualizar: (id, datos) => api.put(`/api/colaboradores/${id}`, datos),
  eliminar: (id) => api.delete(`/api/colaboradores/${id}`),
  filtrar: (params) => api.get('/api/colaboradores/filtrar', { params }),
  completarBienvenida: (id) => api.patch(`/api/colaboradores/${id}/completar-bienvenida`),
  completarTecnico: (id, fecha) => api.patch(`/api/colaboradores/${id}/completar-tecnico`, { fecha })
};

// Funciones de calendario
export const calendarioAPI = {
  obtenerTodos: () => api.get('/api/calendario'),
  obtenerActivos: () => api.get('/api/calendario/activos'),
  obtenerProximos: (dias) => api.get(`/api/calendario/proximos?dias=${dias}`),
  obtenerParaAlertas: () => api.get('/api/calendario/alertas'),
  obtenerPorTipo: (tipo) => api.get(`/api/calendario/tipo/${tipo}`),
  obtenerDelAnio: (anio) => api.get(`/api/calendario/anio/${anio}`),
  obtenerPorId: (id) => api.get(`/api/calendario/${id}`),
  crear: (datos) => api.post('/api/calendario', datos),
  actualizar: (id, datos) => api.put(`/api/calendario/${id}`, datos),
  eliminar: (id) => api.delete(`/api/calendario/${id}`),
  activar: (id) => api.patch(`/api/calendario/${id}/activar`),
  desactivar: (id) => api.patch(`/api/calendario/${id}/desactivar`)
};

// Funciones de asignaciones
export const asignacionesAPI = {
  obtenerTodas: () => api.get('/api/asignaciones'),
  obtenerPorColaborador: (colaboradorId) => api.get(`/api/asignaciones/colaborador/${colaboradorId}`),
  obtenerPorEvento: (eventoId) => api.get(`/api/asignaciones/evento/${eventoId}`),
  obtenerPendientes: (colaboradorId) => api.get(`/api/asignaciones/colaborador/${colaboradorId}/pendientes`),
  obtenerCompletadas: (colaboradorId) => api.get(`/api/asignaciones/colaborador/${colaboradorId}/completadas`),
  crear: (colaboradorId, eventoId) => api.post('/api/asignaciones', { colaborador_id: colaboradorId, evento_id: eventoId }),
  asignarMultiples: (colaboradoresIds, eventoId) => 
    api.post('/api/asignaciones/multiples', { colaboradores_ids: colaboradoresIds, evento_id: eventoId }),
  marcarCompletada: (colaboradorId, eventoId) => 
    api.patch(`/api/asignaciones/${colaboradorId}/${eventoId}/completar`),
  marcarNoCompletada: (colaboradorId, eventoId) => 
    api.patch(`/api/asignaciones/${colaboradorId}/${eventoId}/no-completar`),
  eliminar: (colaboradorId, eventoId) => api.delete(`/api/asignaciones/${colaboradorId}/${eventoId}`)
};

// Funciones de usuarios (admin)
export const usuariosAPI = {
  obtenerTodos: () => api.get('/api/usuarios'),
  obtenerPorId: (id) => api.get(`/api/usuarios/${id}`),
  obtenerPorRol: (rol) => api.get(`/api/usuarios/rol/${rol}`),
  actualizar: (id, datos) => api.put(`/api/usuarios/${id}`, datos),
  desactivar: (id) => api.patch(`/api/usuarios/${id}/desactivar`),
  activar: (id) => api.patch(`/api/usuarios/${id}/activar`),
  eliminar: (id) => api.delete(`/api/usuarios/${id}`)
};

// Funciones de notificaciones
export const notificacionesAPI = {
  enviarPrueba: (destinatario) => api.post('/api/notificaciones/prueba', { destinatario }),
  ejecutarAlertas: () => api.post('/api/notificaciones/ejecutar-alertas')
};

export default api;