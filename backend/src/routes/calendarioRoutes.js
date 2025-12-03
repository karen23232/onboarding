const express = require('express');
const router = express.Router();
const CalendarioController = require('../controllers/calendarioController');
const { verificarAutenticacion, verificarAdminORRHH } = require('../middleware/authMiddleware');

router.get('/', verificarAutenticacion, CalendarioController.obtenerTodos);
router.get('/activos', verificarAutenticacion, CalendarioController.obtenerActivos);
router.get('/proximos', verificarAutenticacion, CalendarioController.obtenerProximos);
router.get('/alertas', verificarAutenticacion, CalendarioController.obtenerParaAlertas);
router.get('/rango', verificarAutenticacion, CalendarioController.obtenerPorRango);
router.get('/anio/:anio', verificarAutenticacion, CalendarioController.obtenerDelAnio);
router.get('/tipo/:tipo', verificarAutenticacion, CalendarioController.obtenerPorTipo);
router.get('/:id', verificarAutenticacion, CalendarioController.obtenerPorId);

router.post('/', verificarAutenticacion, verificarAdminORRHH, CalendarioController.crear);
router.put('/:id', verificarAutenticacion, verificarAdminORRHH, CalendarioController.actualizar);
router.delete('/:id', verificarAutenticacion, verificarAdminORRHH, CalendarioController.eliminar);
router.patch('/:id/activar', verificarAutenticacion, verificarAdminORRHH, CalendarioController.activar);
router.patch('/:id/desactivar', verificarAutenticacion, verificarAdminORRHH, CalendarioController.desactivar);

module.exports = router;