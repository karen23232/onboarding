const NotificacionService = require('../services/notificacionService');
const pool = require('../config/database');

class NotificacionController {
  // Enviar correo de prueba
  static async enviarCorreoPrueba(req, res) {
    try {
      const { destinatario } = req.body;
      
      if (!destinatario) {
        return res.status(400).json({ 
          error: 'Debes proporcionar un destinatario' 
        });
      }

      await NotificacionService.enviarCorreoPrueba(destinatario);
      
      res.status(200).json({
        mensaje: '✅ Correo de prueba enviado exitosamente',
        destinatario
      });
    } catch (error) {
      console.error('Error al enviar correo de prueba:', error);
      res.status(500).json({ 
        error: 'Error al enviar correo de prueba',
        detalle: error.message 
      });
    }
  }
  // Agregar al final de la clase NotificacionController

  // Ejecutar alertas manualmente
  static async ejecutarAlertasManual(req, res) {
    try {
      const AlertasJob = require('../jobs/alertasJob');
      const resultado = await AlertasJob.ejecutarManualmente();
      
      res.status(200).json({
        mensaje: '✅ Verificación de alertas ejecutada',
        eventos_procesados: resultado.eventos,
        notificaciones_enviadas: resultado.notificaciones
      });
    } catch (error) {
      console.error('Error al ejecutar alertas:', error);
      res.status(500).json({ 
        error: 'Error al ejecutar alertas',
        detalle: error.message 
      });
    }
  }

  // Ejecutar alertas
  static async ejecutarAlertas(req, res) {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + 7);

      const query = `
        SELECT 
          co.id as evento_id,
          co.nombre_evento,
          co.tipo,
          co.descripcion,
          co.fecha_inicio,
          co.fecha_fin,
          c.id as colaborador_id,
          c.nombre_completo as colaborador_nombre,
          c.correo as colaborador_correo
        FROM calendario_onboardings co
        INNER JOIN asignaciones a ON co.id = a.evento_id
        INNER JOIN colaboradores c ON a.colaborador_id = c.id
        WHERE co.fecha_inicio::date = $1::date
        AND a.completado = false
      `;

      const resultado = await pool.query(query, [fechaLimite.toISOString().split('T')[0]]);

      if (resultado.rows.length === 0) {
        return res.status(200).json({
          mensaje: 'No hay eventos próximos para alertar',
          fecha_verificada: fechaLimite.toISOString().split('T')[0]
        });
      }

      // Agrupar por evento
      const eventosPorId = {};
      resultado.rows.forEach(row => {
        if (!eventosPorId[row.evento_id]) {
          eventosPorId[row.evento_id] = {
            id: row.evento_id,
            nombre_evento: row.nombre_evento,
            tipo: row.tipo,
            descripcion: row.descripcion,
            fecha_inicio: row.fecha_inicio,
            fecha_fin: row.fecha_fin,
            colaboradores: []
          };
        }
        eventosPorId[row.evento_id].colaboradores.push({
          colaborador_id: row.colaborador_id,
          colaborador_nombre: row.colaborador_nombre,
          colaborador_correo: row.colaborador_correo
        });
      });

      // Enviar alertas
      const promesas = Object.values(eventosPorId).map(evento =>
        NotificacionService.enviarAlertaOnboarding(evento, evento.colaboradores)
      );

      await Promise.all(promesas);

      res.status(200).json({
        mensaje: '✅ Alertas enviadas exitosamente',
        eventos_procesados: Object.keys(eventosPorId).length,
        colaboradores_notificados: resultado.rows.length
      });
    } catch (error) {
      console.error('Error al ejecutar alertas:', error);
      res.status(500).json({ 
        error: 'Error al ejecutar alertas',
        detalle: error.message 
      });
    }
  }
}

module.exports = NotificacionController;