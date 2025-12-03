const express = require('express');
const router = express.Router();
const AsignacionController = require('../controllers/asignacionController');
const { verificarAutenticacion, verificarAdminORRHH } = require('../middleware/authMiddleware');

router.get('/', verificarAutenticacion, AsignacionController.obtenerTodas);
router.get('/colaborador/:id', verificarAutenticacion, AsignacionController.obtenerPorColaborador);
router.get('/colaborador/:id/pendientes', verificarAutenticacion, AsignacionController.obtenerPendientes);
router.get('/colaborador/:id/completadas', verificarAutenticacion, AsignacionController.obtenerCompletadas);
router.get('/evento/:id', verificarAutenticacion, AsignacionController.obtenerPorEvento);

router.post('/', verificarAutenticacion, verificarAdminORRHH, AsignacionController.crear);
router.post('/multiples', verificarAutenticacion, verificarAdminORRHH, AsignacionController.asignarMultiples);
router.patch('/:colaborador_id/:evento_id/completar', verificarAutenticacion, verificarAdminORRHH, AsignacionController.marcarCompletada);
router.patch('/:colaborador_id/:evento_id/no-completar', verificarAutenticacion, verificarAdminORRHH, AsignacionController.marcarNoCompletada);
router.delete('/:colaborador_id/:evento_id', verificarAutenticacion, verificarAdminORRHH, AsignacionController.eliminar);

module.exports = router;