const Usuario = require('../models/Usuario');
const { generarToken } = require('../utils/jwtUtils');

class AuthController {




  static async registro(req, res) {
  try {
    const { nombre_completo, correo, password, rol } = req.body;

    if (!nombre_completo || !correo || !password) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos: nombre_completo, correo, password' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ 
        error: 'Formato de correo inválido' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    const correoExiste = await Usuario.existeCorreo(correo);
    if (correoExiste) {
      return res.status(400).json({ 
        error: 'Ya existe un usuario con ese correo electrónico' 
      });
    }

    // AQUÍ NO DEBE HABER NADA SOBRE VERIFICAR ROLES
    // Solo esto:
    const nuevoUsuario = await Usuario.crear({
      nombre_completo,
      correo,
      password,
      rol: rol || 'colaborador'
    });

    const token = generarToken({
      id: nuevoUsuario.id,
      correo: nuevoUsuario.correo,
      rol: nuevoUsuario.rol
    });

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: nuevoUsuario,
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario',
      detalle: error.message 
    });
  }
}
 
  

  static async login(req, res) {
    try {
      const { correo, password } = req.body;

      if (!correo || !password) {
        return res.status(400).json({ 
          error: 'Correo y contraseña son requeridos' 
        });
      }

      const usuario = await Usuario.obtenerPorCorreo(correo);

      if (!usuario) {
        return res.status(401).json({ 
          error: 'Credenciales inválidas' 
        });
      }

      if (!usuario.activo) {
        return res.status(401).json({ 
          error: 'Usuario desactivado. Contacta al administrador.' 
        });
      }

      const passwordValido = await Usuario.verificarPassword(password, usuario.password);

      if (!passwordValido) {
        return res.status(401).json({ 
          error: 'Credenciales inválidas' 
        });
      }

      await Usuario.actualizarUltimoAcceso(usuario.id);

      const token = generarToken({
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol
      });

      const { password: _, ...usuarioSinPassword } = usuario;

      res.status(200).json({
        mensaje: 'Login exitoso',
        usuario: usuarioSinPassword,
        token
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ 
        error: 'Error al iniciar sesión',
        detalle: error.message 
      });
    }
  }

  static async perfil(req, res) {
    try {
      const usuario = await Usuario.obtenerPorId(req.usuario.id);

      if (!usuario) {
        return res.status(404).json({ 
          error: 'Usuario no encontrado' 
        });
      }

      res.status(200).json({
        usuario
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ 
        error: 'Error al obtener perfil',
        detalle: error.message 
      });
    }
  }

  static async cambiarPassword(req, res) {
    try {
      const { password_actual, password_nuevo } = req.body;

      if (!password_actual || !password_nuevo) {
        return res.status(400).json({ 
          error: 'Se requieren password_actual y password_nuevo' 
        });
      }

      if (password_nuevo.length < 6) {
        return res.status(400).json({ 
          error: 'La nueva contraseña debe tener al menos 6 caracteres' 
        });
      }

      const queryUsuario = `SELECT * FROM usuarios WHERE id = $1`;
      const pool = require('../config/database');
      const resultadoUsuario = await pool.query(queryUsuario, [req.usuario.id]);
      
      if (resultadoUsuario.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const usuario = resultadoUsuario.rows[0];
      const passwordValido = await Usuario.verificarPassword(password_actual, usuario.password);
      
      if (!passwordValido) {
        return res.status(400).json({ 
          error: 'La contraseña actual es incorrecta' 
        });
      }

      await Usuario.actualizar(req.usuario.id, { password: password_nuevo });

      res.status(200).json({
        mensaje: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(500).json({ 
        error: 'Error al cambiar contraseña',
        detalle: error.message 
      });
    }
  }

  static async verificarToken(req, res) {
    try {
      const usuario = await Usuario.obtenerPorId(req.usuario.id);

      if (!usuario || !usuario.activo) {
        return res.status(401).json({ 
          error: 'Token inválido o usuario inactivo' 
        });
      }

      res.status(200).json({
        valido: true,
        usuario
      });
    } catch (error) {
      console.error('Error al verificar token:', error);
      res.status(500).json({ 
        error: 'Error al verificar token',
        detalle: error.message 
      });
    }
  }
}

module.exports = AuthController;