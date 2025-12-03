const express = require('express');
const router = express.Router();
const ColaboradorController = require('../controllers/colaboradorController');
const { verificarAutenticacion, verificarAdminORRHH } = require('../middleware/authMiddleware');

router.post('/', verificarAutenticacion, verificarAdminORRHH, ColaboradorController.crear);
router.get('/', verificarAutenticacion, ColaboradorController.obtenerTodos);
router.get('/filtrar', verificarAutenticacion, ColaboradorController.filtrar);
router.get('/:id', verificarAutenticacion, ColaboradorController.obtenerPorId);
router.put('/:id', verificarAutenticacion, verificarAdminORRHH, ColaboradorController.actualizar);
router.delete('/:id', verificarAutenticacion, verificarAdminORRHH, ColaboradorController.eliminar);
router.patch('/:id/completar-bienvenida', verificarAutenticacion, verificarAdminORRHH, ColaboradorController.completarOnboardingBienvenida);
router.patch('/:id/completar-tecnico', verificarAutenticacion, verificarAdminORRHH, ColaboradorController.completarOnboardingTecnico);

module.exports = router;