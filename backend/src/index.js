const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
require('dotenv').config();

// Importar email.js PRIMERO para inicializar
require('./config/email');

const authRoutes = require('./routes/authRoutes');
const colaboradorRoutes = require('./routes/colaboradorRoutes');
const calendarioRoutes = require('./routes/calendarioRoutes');
const asignacionRoutes = require('./routes/asignacionRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');

// ⚡ NUEVO: Importar AlertasJob
const AlertasJob = require('./jobs/alertasJob');

const { rutaNoEncontrada, manejadorErrores } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/colaboradores', colaboradorRoutes);
app.use('/api/calendario', calendarioRoutes);
app.use('/api/asignaciones', asignacionRoutes);
app.use('/api/notificaciones', notificacionRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API del Sistema de Gestión de Onboarding - Banco de Bogotá',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      colaboradores: '/api/colaboradores',
      calendario: '/api/calendario',
      asignaciones: '/api/asignaciones',
      notificaciones: '/api/notificaciones'
    }
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ 
      status: 'OK', 
      database: 'Conectado',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Desconectado',
      error: error.message 
    });
  }
});

// Manejo de errores
app.use(rutaNoEncontrada);
app.use(manejadorErrores);

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log('');
  console.log('===========================================');
  console.log('🚀 SERVIDOR INICIADO');
  console.log('===========================================');
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log('===========================================');
  console.log('');

  // ⚡ NUEVO: Iniciar cron job de alertas
  AlertasJob.iniciar();
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    pool.end(() => {
      console.log('✅ Pool de base de datos cerrado');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    pool.end(() => {
      console.log('✅ Pool de base de datos cerrado');
      process.exit(0);
    });
  });
});

module.exports = app;