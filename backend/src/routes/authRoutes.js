const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { verificarAutenticacion } = require('../middleware/authMiddleware');

router.post('/registro', AuthController.registro);
router.post('/login', AuthController.login);
router.get('/perfil', verificarAutenticacion, AuthController.perfil);
router.post('/cambiar-password', verificarAutenticacion, AuthController.cambiarPassword);
router.get('/verificar-token', verificarAutenticacion, AuthController.verificarToken);

module.exports = router;