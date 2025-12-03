const cron = require('node-cron');
const CalendarioOnboarding = require('../models/CalendarioOnboarding');
const NotificacionService = require('./notificacionService');

class CronService {
  // Iniciar todos los trabajos programados
  static iniciar() {
    console.log('🕐 Iniciando trabajos programados (Cron Jobs)...');

    // Tarea diaria: Verificar eventos próximos y enviar alertas
    // Se ejecuta todos los días a las 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('🔔 Ejecutando verificación diaria de alertas...');
      await this.verificarYEnviarAlertas();
    });

    // Tarea de prueba (opcional): Se ejecuta cada 5 minutos para desarrollo
    // Descomentar solo para pruebas
    /*
    cron.schedule('*\/5 * * * *', async () => {
      console.log('🧪 Ejecutando verificación de prueba cada 5 minutos...');
      await this.verificarYEnviarAlertas();
    });
    */

    console.log('✅ Trabajos programados iniciados correctamente');
  }

  // Verificar eventos próximos y enviar alertas
  static async verificarYEnviarAlertas() {
    try {
      console.log('📋 Buscando eventos que requieren alertas...');
      
      // Obtener eventos que están a 7 días de distancia y tienen colaboradores asignados
      const eventos = await CalendarioOnboarding.obtenerParaAlertas();
      
      if (eventos.length === 0) {
        console.log('✅ No hay eventos próximos que requieran alertas');
        return;
      }

      console.log(`📧 Encontrados ${eventos.length} evento(s) que requieren alertas`);

      // Procesar cada evento
      for (const evento of eventos) {
        if (!evento.colaboradores_asignados || evento.colaboradores_asignados.length === 0) {
          console.log(`⚠️  Evento "${evento.nombre_evento}" no tiene colaboradores asignados`);
          continue;
        }

        console.log(`📤 Enviando alertas para: ${evento.nombre_evento}`);
        console.log(`   Colaboradores: ${evento.colaboradores_asignados.length}`);

        try {
          await NotificacionService.enviarAlertaOnboarding(evento, evento.colaboradores_asignados);
          console.log(`✅ Alertas enviadas para: ${evento.nombre_evento}`);
        } catch (error) {
          console.error(`❌ Error al enviar alertas para ${evento.nombre_evento}:`, error);
        }
      }

      console.log('✅ Verificación de alertas completada');
    } catch (error) {
      console.error('❌ Error en la verificación de alertas:', error);
    }
  }

  // Ejecutar verificación manual (útil para pruebas)
  static async ejecutarManual() {
    console.log('🔧 Ejecutando verificación manual de alertas...');
    await this.verificarYEnviarAlertas();
  }
}

module.exports = CronService;