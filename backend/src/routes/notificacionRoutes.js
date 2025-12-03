const express = require('express');
const router = express.Router();
const NotificacionController = require('../controllers/notificacionController');
const { verificarAutenticacion, verificarAdminORRHH } = require('../middleware/authMiddleware');

router.post('/prueba', verificarAutenticacion, NotificacionController.enviarCorreoPrueba);
router.post('/ejecutar-alertas', verificarAutenticacion, verificarAdminORRHH, NotificacionController.ejecutarAlertas);

// NUEVA RUTA: Ejecutar verificación manual del cron job
router.post('/verificar-alertas-manual', verificarAutenticacion, verificarAdminORRHH, NotificacionController.ejecutarAlertasManual);

module.exports = router;