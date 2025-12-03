const Usuario = require('../models/Usuario');

class UsuarioController {
  // Obtener todos los usuarios (solo admin)
  static async obtenerTodos(req, res) {
    try {
      const usuarios = await Usuario.obtenerTodos();
      
      res.status(200).json({
        total: usuarios.length,
        usuarios
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ 
        error: 'Error al obtener usuarios',
        detalle: error.message 
      });
    }
  }

  // Obtener usuario por ID (solo admin o el mismo usuario)
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar permisos: solo admin o el mismo usuario
      if (req.usuario.rol !== 'admin' && req.usuario.id !== parseInt(id)) {
        return res.status(403).json({ 
          error: 'No tienes permisos para ver este usuario' 
        });
      }

      const usuario = await Usuario.obtenerPorId(id);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      res.status(200).json({ usuario });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ 
        error: 'Error al obtener usuario',
        detalle: error.message 
      });
    }
  }

  // Actualizar usuario (solo admin o el mismo usuario)
  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const datosActualizados = req.body;
      
      // Verificar permisos
      if (req.usuario.rol !== 'admin' && req.usuario.id !== parseInt(id)) {
        return res.status(403).json({ 
          error: 'No tienes permisos para actualizar este usuario' 
        });
      }

      // Solo admin puede cambiar el rol
      if (datosActualizados.rol && req.usuario.rol !== 'admin') {
        return res.status(403).json({ 
          error: 'Solo administradores pueden cambiar roles' 
        });
      }

      // Verificar que el usuario existe
      const usuarioExistente = await Usuario.obtenerPorId(id);
      if (!usuarioExistente) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const usuarioActualizado = await Usuario.actualizar(id, datosActualizados);
      
      res.status(200).json({
        mensaje: 'Usuario actualizado exitosamente',
        usuario: usuarioActualizado
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ 
        error: 'Error al actualizar usuario',
        detalle: error.message 
      });
    }
  }

  // Desactivar usuario (solo admin)
  static async desactivar(req, res) {
    try {
      const { id } = req.params;
      
      // No permitir que un admin se desactive a sí mismo
      if (req.usuario.id === parseInt(id)) {
        return res.status(400).json({ 
          error: 'No puedes desactivarte a ti mismo' 
        });
      }

      const usuarioDesactivado = await Usuario.desactivar(id);
      
      if (!usuarioDesactivado) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      res.status(200).json({
        mensaje: 'Usuario desactivado exitosamente',
        usuario: usuarioDesactivado
      });
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      res.status(500).json({ 
        error: 'Error al desactivar usuario',
        detalle: error.message 
      });
    }
  }

  // Activar usuario (solo admin)
  static async activar(req, res) {
    try {
      const { id } = req.params;
      
      const usuarioActivado = await Usuario.activar(id);
      
      if (!usuarioActivado) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      res.status(200).json({
        mensaje: 'Usuario activado exitosamente',
        usuario: usuarioActivado
      });
    } catch (error) {
      console.error('Error al activar usuario:', error);
      res.status(500).json({ 
        error: 'Error al activar usuario',
        detalle: error.message 
      });
    }
  }

  // Eliminar usuario permanentemente (solo admin)
  static async eliminar(req, res) {
    try {
      const { id } = req.params;
      
      // No permitir que un admin se elimine a sí mismo
      if (req.usuario.id === parseInt(id)) {
        return res.status(400).json({ 
          error: 'No puedes eliminarte a ti mismo' 
        });
      }

      const usuarioEliminado = await Usuario.eliminar(id);
      
      if (!usuarioEliminado) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      res.status(200).json({
        mensaje: 'Usuario eliminado exitosamente',
        usuario: usuarioEliminado
      });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ 
        error: 'Error al eliminar usuario',
        detalle: error.message 
      });
    }
  }

  // Obtener usuarios por rol (solo admin y RRHH)
  static async obtenerPorRol(req, res) {
    try {
      const { rol } = req.params;
      
      // Validar rol
      const rolesValidos = ['admin', 'rrhh', 'colaborador'];
      if (!rolesValidos.includes(rol)) {
        return res.status(400).json({ 
          error: 'Rol inválido. Roles válidos: admin, rrhh, colaborador' 
        });
      }

      const usuarios = await Usuario.obtenerPorRol(rol);
      
      res.status(200).json({
        total: usuarios.length,
        rol,
        usuarios
      });
    } catch (error) {
      console.error('Error al obtener usuarios por rol:', error);
      res.status(500).json({ 
        error: 'Error al obtener usuarios por rol',
        detalle: error.message 
      });
    }
  }
}

module.exports = UsuarioController;