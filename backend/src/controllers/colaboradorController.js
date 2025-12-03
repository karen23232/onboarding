const Colaborador = require('../models/Colaborador');

class ColaboradorController {
  static async crear(req, res) {
    try {
      const datosColaborador = req.body;
      
      const colaboradorExistente = await Colaborador.obtenerPorCorreo(datosColaborador.correo);
      if (colaboradorExistente) {
        return res.status(400).json({ 
          error: 'Ya existe un colaborador con ese correo electrónico' 
        });
      }

      const nuevoColaborador = await Colaborador.crear(datosColaborador);
      
      res.status(201).json({
        mensaje: 'Colaborador creado exitosamente',
        colaborador: nuevoColaborador
      });
    } catch (error) {
      console.error('Error al crear colaborador:', error);
      res.status(500).json({ 
        error: 'Error al crear colaborador',
        detalle: error.message 
      });
    }
  }

  static async obtenerTodos(req, res) {
    try {
      const colaboradores = await Colaborador.obtenerTodos();
      
      res.status(200).json({
        total: colaboradores.length,
        colaboradores
      });
    } catch (error) {
      console.error('Error al obtener colaboradores:', error);
      res.status(500).json({ 
        error: 'Error al obtener colaboradores',
        detalle: error.message 
      });
    }
  }

  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const colaborador = await Colaborador.obtenerPorId(id);
      
      if (!colaborador) {
        return res.status(404).json({ error: 'Colaborador no encontrado' });
      }
      
      res.status(200).json({ colaborador });
    } catch (error) {
      console.error('Error al obtener colaborador:', error);
      res.status(500).json({ 
        error: 'Error al obtener colaborador',
        detalle: error.message 
      });
    }
  }

  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const datosActualizados = req.body;
      
      const colaboradorExistente = await Colaborador.obtenerPorId(id);
      if (!colaboradorExistente) {
        return res.status(404).json({ error: 'Colaborador no encontrado' });
      }

      if (datosActualizados.correo && datosActualizados.correo !== colaboradorExistente.correo) {
        const correoExiste = await Colaborador.obtenerPorCorreo(datosActualizados.correo);
        if (correoExiste) {
          return res.status(400).json({ 
            error: 'Ya existe un colaborador con ese correo electrónico' 
          });
        }
      }

      const colaboradorActualizado = await Colaborador.actualizar(id, datosActualizados);
      
      res.status(200).json({
        mensaje: 'Colaborador actualizado exitosamente',
        colaborador: colaboradorActualizado
      });
    } catch (error) {
      console.error('Error al actualizar colaborador:', error);
      res.status(500).json({ 
        error: 'Error al actualizar colaborador',
        detalle: error.message 
      });
    }
  }

  static async eliminar(req, res) {
    try {
      const { id } = req.params;
      
      const colaboradorEliminado = await Colaborador.eliminar(id);
      
      if (!colaboradorEliminado) {
        return res.status(404).json({ error: 'Colaborador no encontrado' });
      }
      
      res.status(200).json({
        mensaje: 'Colaborador eliminado exitosamente',
        colaborador: colaboradorEliminado
      });
    } catch (error) {
      console.error('Error al eliminar colaborador:', error);
      res.status(500).json({ 
        error: 'Error al eliminar colaborador',
        detalle: error.message 
      });
    }
  }

  static async completarOnboardingBienvenida(req, res) {
    try {
      const { id } = req.params;
      
      const colaboradorActualizado = await Colaborador.completarOnboardingBienvenida(id);
      
      if (!colaboradorActualizado) {
        return res.status(404).json({ error: 'Colaborador no encontrado' });
      }
      
      res.status(200).json({
        mensaje: 'Onboarding de bienvenida marcado como completado',
        colaborador: colaboradorActualizado
      });
    } catch (error) {
      console.error('Error al completar onboarding de bienvenida:', error);
      res.status(500).json({ 
        error: 'Error al completar onboarding de bienvenida',
        detalle: error.message 
      });
    }
  }

  static async completarOnboardingTecnico(req, res) {
    try {
      const { id } = req.params;
      const { fecha } = req.body;
      
      const colaboradorActualizado = await Colaborador.completarOnboardingTecnico(id, fecha);
      
      if (!colaboradorActualizado) {
        return res.status(404).json({ error: 'Colaborador no encontrado' });
      }
      
      res.status(200).json({
        mensaje: 'Onboarding técnico marcado como completado',
        colaborador: colaboradorActualizado
      });
    } catch (error) {
      console.error('Error al completar onboarding técnico:', error);
      res.status(500).json({ 
        error: 'Error al completar onboarding técnico',
        detalle: error.message 
      });
    }
  }

  static async filtrar(req, res) {
    try {
      const filtros = {};
      
      if (req.query.onboarding_bienvenida !== undefined) {
        filtros.onboarding_bienvenida = req.query.onboarding_bienvenida === 'true';
      }
      
      if (req.query.onboarding_tecnico !== undefined) {
        filtros.onboarding_tecnico = req.query.onboarding_tecnico === 'true';
      }
      
      const colaboradores = await Colaborador.filtrarPorEstado(filtros);
      
      res.status(200).json({
        total: colaboradores.length,
        filtros,
        colaboradores
      });
    } catch (error) {
      console.error('Error al filtrar colaboradores:', error);
      res.status(500).json({ 
        error: 'Error al filtrar colaboradores',
        detalle: error.message 
      });
    }
  }
}

module.exports = ColaboradorController;