const { verificarToken } = require('../utils/jwtUtils');

const verificarAutenticacion = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token no proporcionado' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verificarToken(token);

    if (!decoded) {
      return res.status(401).json({ 
        error: 'Token inválido o expirado' 
      });
    }

    req.usuario = decoded;
    next();
  } catch (error) {
    console.error('Error en verificación de autenticación:', error);
    res.status(401).json({ 
      error: 'Error de autenticación',
      detalle: error.message 
    });
  }
};

const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para acceder a este recurso',
        rolRequerido: rolesPermitidos,
        tuRol: req.usuario.rol
      });
    }

    next();
  };
};

const verificarAdmin = verificarRol('admin');

const verificarAdminORRHH = verificarRol('admin', 'rrhh');

module.exports = {
  verificarAutenticacion,
  verificarRol,
  verificarAdmin,
  verificarAdminORRHH
};