const cron = require('node-cron');
const pool = require('../config/database');
const NotificacionService = require('../services/notificacionService');

class AlertasJob {
  // Ejecutar verificación de alertas
  static async ejecutarVerificacion() {
    try {
      console.log('');
      console.log('🔔 ===============================================');
      console.log('🔔 INICIANDO VERIFICACIÓN DE ALERTAS');
      console.log('🔔 ===============================================');
      console.log(`📅 Fecha actual: ${new Date().toLocaleString('es-CO')}`);
      
      // Calcular fecha límite (7 días desde hoy)
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + 7);
      const fechaLimiteStr = fechaLimite.toISOString().split('T')[0];
      
      console.log(`📅 Verificando eventos para: ${fechaLimiteStr}`);
      console.log('');

      // Buscar eventos que inician en 7 días con colaboradores asignados
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
        AND co.activo = true
        ORDER BY co.nombre_evento, c.nombre_completo
      `;

      const resultado = await pool.query(query, [fechaLimiteStr]);

      if (resultado.rows.length === 0) {
        console.log('ℹ️  No hay eventos próximos para alertar');
        console.log(`   (Buscando eventos para el ${fechaLimiteStr})`);
        console.log('');
        console.log('🔔 ===============================================');
        console.log('');
        return {
          eventos: 0,
          notificaciones: 0
        };
      }

      console.log(`📧 Se encontraron ${resultado.rows.length} colaborador(es) a notificar`);
      console.log('');

      // Agrupar colaboradores por evento
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

      // Mostrar resumen de eventos
      console.log('📋 EVENTOS A PROCESAR:');
      Object.values(eventosPorId).forEach(evento => {
        console.log(`   • ${evento.nombre_evento} (${evento.tipo})`);
        console.log(`     Colaboradores: ${evento.colaboradores.length}`);
      });
      console.log('');

      // Enviar alertas para cada evento
      let notificacionesEnviadas = 0;
      for (const evento of Object.values(eventosPorId)) {
        console.log(`📤 Procesando: ${evento.nombre_evento}`);
        
        try {
          const resultados = await NotificacionService.enviarAlertaOnboarding(
            evento, 
            evento.colaboradores
          );
          
          const exitosas = resultados.filter(r => r !== null).length;
          notificacionesEnviadas += exitosas;
          
          console.log(`   ✅ Enviadas: ${exitosas}/${evento.colaboradores.length}`);
        } catch (error) {
          console.error(`   ❌ Error al enviar alertas del evento:`, error.message);
        }
      }

      console.log('');
      console.log('✅ VERIFICACIÓN COMPLETADA');
      console.log(`   Eventos procesados: ${Object.keys(eventosPorId).length}`);
      console.log(`   Notificaciones enviadas: ${notificacionesEnviadas}`);
      console.log('🔔 ===============================================');
      console.log('');

      return {
        eventos: Object.keys(eventosPorId).length,
        notificaciones: notificacionesEnviadas
      };

    } catch (error) {
      console.error('');
      console.error('❌ ERROR EN VERIFICACIÓN DE ALERTAS:');
      console.error('   ', error.message);
      console.error('');
      console.error('Stack:', error.stack);
      console.error('');
      throw error;
    }
  }

  // Iniciar cron job
  static iniciar() {
    console.log('');
    console.log('⏰ ===============================================');
    console.log('⏰ CONFIGURANDO CRON JOB DE ALERTAS');
    console.log('⏰ ===============================================');
    console.log('📅 Horario: Todos los días a las 9:00 AM');
    console.log('🔔 Función: Enviar alertas 7 días antes de eventos');
    console.log('⏰ ===============================================');
    console.log('');

    // Ejecutar todos los días a las 9:00 AM (Colombia)
    // Formato: segundo minuto hora día mes día-semana
    cron.schedule('0 9 * * *', async () => {
      await this.ejecutarVerificacion();
    }, {
      timezone: "America/Bogota"
    });

    // OPCIONAL: Para testing, también ejecutar cada hora
    // Descomenta esta línea si quieres probar más frecuentemente
    // cron.schedule('0 * * * *', async () => {
    //   console.log('⏰ [TEST] Ejecución de prueba por hora');
    //   await this.ejecutarVerificacion();
    // });

    console.log('✅ Cron job de alertas configurado exitosamente');
    console.log('');
  }

  // Ejecutar manualmente (para pruebas)
  static async ejecutarManualmente() {
    console.log('🔧 Ejecutando verificación manual...');
    return await this.ejecutarVerificacion();
  }
}

module.exports = AlertasJob;