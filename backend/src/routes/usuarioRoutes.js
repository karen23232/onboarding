const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');
const { 
  verificarAutenticacion, 
  verificarAdmin,
  verificarAdminORRHH 
} = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

// Rutas que requieren admin o RRHH
router.get('/', verificarAdminORRHH, UsuarioController.obtenerTodos);
router.get('/rol/:rol', verificarAdminORRHH, UsuarioController.obtenerPorRol);

// Rutas que pueden usar admin o el propio usuario
router.get('/:id', UsuarioController.obtenerPorId);
router.put('/:id', UsuarioController.actualizar);

// Rutas que solo puede usar admin
router.patch('/:id/desactivar', verificarAdmin, UsuarioController.desactivar);
router.patch('/:id/activar', verificarAdmin, UsuarioController.activar);
router.delete('/:id', verificarAdmin, UsuarioController.eliminar);

module.exports = router;