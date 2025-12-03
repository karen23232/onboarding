const Asignacion = require('../models/Asignacion');
const Colaborador = require('../models/Colaborador');
const CalendarioOnboarding = require('../models/CalendarioOnboarding');

class AsignacionController {
  static async crear(req, res) {
    try {
      const { colaborador_id, evento_id } = req.body;
      
      if (!colaborador_id || !evento_id) {
        return res.status(400).json({ 
          error: 'Se requieren colaborador_id y evento_id' 
        });
      }

      const colaborador = await Colaborador.obtenerPorId(colaborador_id);
      if (!colaborador) {
        return res.status(404).json({ error: 'Colaborador no encontrado' });
      }

      const evento = await CalendarioOnboarding.obtenerPorId(evento_id);
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      const existe = await Asignacion.existe(colaborador_id, evento_id);
      if (existe) {
        return res.status(400).json({ 
          mensaje: 'Esta asignación ya existe',
          error: 'Esta asignación ya existe' 
        });
      }

      const nuevaAsignacion = await Asignacion.crear(colaborador_id, evento_id);
      
      // ✅ RESPONDER INMEDIATAMENTE (sin esperar el correo)
      res.status(201).json({
        mensaje: 'Asignación creada exitosamente',
        asignacion: nuevaAsignacion,
        correo_programado: true
      });

      // 🔍 DEBUG: Ver qué datos estamos enviando al servicio de correo
      console.log('🔍 ========== DEBUG CORREO ==========');
      console.log('🔍 Colaborador completo:', JSON.stringify(colaborador, null, 2));
      console.log('🔍 Evento completo:', JSON.stringify(evento, null, 2));
      console.log('🔍 Correo del colaborador:', colaborador.correo);
      console.log('🔍 Email del colaborador:', colaborador.email);
      console.log('🔍 Nombre del evento:', evento.nombre_evento);
      console.log('🔍 ===================================');

      // 📧 ENVIAR CORREO EN SEGUNDO PLANO (SIN AWAIT)
      const NotificacionService = require('../services/notificacionService');
      NotificacionService.enviarCorreoConfirmacionAsignacion(colaborador, evento)
        .then(() => {
          console.log(`✅ Correo de confirmación enviado a ${colaborador.correo || colaborador.email}`);
        })
        .catch(emailError => {
          console.error(`❌ Error al enviar correo:`, emailError.message);
          console.error(`❌ Stack completo:`, emailError.stack);
        });

    } catch (error) {
      console.error('Error al crear asignación:', error);
      res.status(500).json({ 
        error: 'Error al crear asignación',
        mensaje: error.message 
      });
    }
  }

  static async obtenerTodas(req, res) {
    try {
      const asignaciones = await Asignacion.obtenerTodas();
      
      res.status(200).json({
        total: asignaciones.length,
        asignaciones
      });
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      res.status(500).json({ 
        error: 'Error al obtener asignaciones',
        detalle: error.message 
      });
    }
  }

  static async obtenerPorColaborador(req, res) {
    try {
      const { id } = req.params;
      const asignaciones = await Asignacion.obtenerPorColaborador(id);
      
      res.status(200).json({
        total: asignaciones.length,
        colaborador_id: id,
        asignaciones
      });
    } catch (error) {
      console.error('Error al obtener asignaciones por colaborador:', error);
      res.status(500).json({ 
        error: 'Error al obtener asignaciones por colaborador',
        detalle: error.message 
      });
    }
  }

  static async obtenerPorEvento(req, res) {
    try {
      const { id } = req.params;
      const asignaciones = await Asignacion.obtenerPorEvento(id);
      
      res.status(200).json({
        total: asignaciones.length,
        evento_id: id,
        asignaciones
      });
    } catch (error) {
      console.error('Error al obtener asignaciones por evento:', error);
      res.status(500).json({ 
        error: 'Error al obtener asignaciones por evento',
        detalle: error.message 
      });
    }
  }

  static async marcarCompletada(req, res) {
    try {
      const { colaborador_id, evento_id } = req.params;
      
      const asignacionActualizada = await Asignacion.marcarCompletada(
        colaborador_id, 
        evento_id
      );
      
      if (!asignacionActualizada) {
        return res.status(404).json({ error: 'Asignación no encontrada' });
      }
      
      res.status(200).json({
        mensaje: 'Asignación marcada como completada',
        asignacion: asignacionActualizada
      });
    } catch (error) {
      console.error('Error al marcar asignación como completada:', error);
      res.status(500).json({ 
        error: 'Error al marcar asignación como completada',
        detalle: error.message 
      });
    }
  }

  static async marcarNoCompletada(req, res) {
    try {
      const { colaborador_id, evento_id } = req.params;
      
      const asignacionActualizada = await Asignacion.marcarNoCompletada(
        colaborador_id, 
        evento_id
      );
      
      if (!asignacionActualizada) {
        return res.status(404).json({ error: 'Asignación no encontrada' });
      }
      
      res.status(200).json({
        mensaje: 'Asignación marcada como no completada',
        asignacion: asignacionActualizada
      });
    } catch (error) {
      console.error('Error al marcar asignación como no completada:', error);
      res.status(500).json({ 
        error: 'Error al marcar asignación como no completada',
        detalle: error.message 
      });
    }
  }

  static async eliminar(req, res) {
    try {
      const { colaborador_id, evento_id } = req.params;
      
      const asignacionEliminada = await Asignacion.eliminar(colaborador_id, evento_id);
      
      if (!asignacionEliminada) {
        return res.status(404).json({ error: 'Asignación no encontrada' });
      }
      
      res.status(200).json({
        mensaje: 'Asignación eliminada exitosamente',
        asignacion: asignacionEliminada
      });
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      res.status(500).json({ 
        error: 'Error al eliminar asignación',
        detalle: error.message 
      });
    }
  }

  static async obtenerPendientes(req, res) {
    try {
      const { id } = req.params;
      const asignaciones = await Asignacion.obtenerPendientes(id);
      
      res.status(200).json({
        total: asignaciones.length,
        colaborador_id: id,
        asignaciones
      });
    } catch (error) {
      console.error('Error al obtener asignaciones pendientes:', error);
      res.status(500).json({ 
        error: 'Error al obtener asignaciones pendientes',
        detalle: error.message 
      });
    }
  }

  static async obtenerCompletadas(req, res) {
    try {
      const { id } = req.params;
      const asignaciones = await Asignacion.obtenerCompletadas(id);
      
      res.status(200).json({
        total: asignaciones.length,
        colaborador_id: id,
        asignaciones
      });
    } catch (error) {
      console.error('Error al obtener asignaciones completadas:', error);
      res.status(500).json({ 
        error: 'Error al obtener asignaciones completadas',
        detalle: error.message 
      });
    }
  }

  static async asignarMultiples(req, res) {
    try {
      const { colaboradores_ids, evento_id } = req.body;
      
      if (!colaboradores_ids || !Array.isArray(colaboradores_ids) || colaboradores_ids.length === 0) {
        return res.status(400).json({ 
          error: 'Se requiere un array de colaboradores_ids' 
        });
      }

      if (!evento_id) {
        return res.status(400).json({ 
          error: 'Se requiere evento_id' 
        });
      }

      const evento = await CalendarioOnboarding.obtenerPorId(evento_id);
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      const asignaciones = await Asignacion.asignarMultiples(colaboradores_ids, evento_id);
      
      // ✅ RESPONDER INMEDIATAMENTE
      res.status(201).json({
        mensaje: `${asignaciones.length} asignaciones creadas exitosamente`,
        total: asignaciones.length,
        asignaciones,
        correos_programados: true
      });

      // 📧 ENVIAR CORREOS EN SEGUNDO PLANO (SIN AWAIT)
      const NotificacionService = require('../services/notificacionService');
      
      // Enviar correos de forma asíncrona a todos
      colaboradores_ids.forEach(async (colaborador_id) => {
        try {
          const colaborador = await Colaborador.obtenerPorId(colaborador_id);
          if (colaborador) {
            // 🔍 DEBUG para cada colaborador
            console.log(`🔍 DEBUG Múltiple - Enviando a: ${colaborador.correo || colaborador.email}`);
            
            await NotificacionService.enviarCorreoConfirmacionAsignacion(colaborador, evento);
            console.log(`✅ Correo enviado a ${colaborador.correo || colaborador.email}`);
          } else {
            console.warn(`⚠️ Colaborador con ID ${colaborador_id} no encontrado`);
          }
        } catch (emailError) {
          console.error(`❌ Error al enviar correo a colaborador ${colaborador_id}:`, emailError.message);
        }
      });

    } catch (error) {
      console.error('Error al crear asignaciones múltiples:', error);
      res.status(500).json({ 
        error: 'Error al crear asignaciones múltiples',
        detalle: error.message 
      });
    }
  }
}

module.exports = AsignacionController;