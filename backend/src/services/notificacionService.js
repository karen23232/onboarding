const transporter = require('../config/email');
const pool = require('../config/database');

class NotificacionService {
  // Enviar correo de alerta para un onboarding técnico
  static async enviarAlertaOnboarding(evento, colaboradores) {
    try {
      const promesas = colaboradores.map(async (colaborador) => {
        // Verificar si ya se envió la notificación
        const yaEnviado = await this.verificarNotificacionEnviada(
          evento.id, 
          colaborador.colaborador_id, 
          'alerta_semanal'
        );

        if (yaEnviado) {
          console.log(`📧 Notificación ya enviada a ${colaborador.colaborador_correo}`);
          return null;
        }

        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: colaborador.colaborador_correo,
          subject: `🔔 Recordatorio: Onboarding Técnico - ${evento.nombre_evento}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #003d82;">🎯 Recordatorio de Onboarding Técnico</h2>
              
              <p>Hola <strong>${colaborador.colaborador_nombre}</strong>,</p>
              
              <p>Te recordamos que tienes programado un onboarding técnico próximamente:</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #003d82; margin-top: 0;">${evento.nombre_evento}</h3>
                <p style="margin: 10px 0;">
                  <strong>📅 Fecha de inicio:</strong> ${this.formatearFecha(evento.fecha_inicio)}
                </p>
                <p style="margin: 10px 0;">
                  <strong>📅 Fecha de fin:</strong> ${this.formatearFecha(evento.fecha_fin)}
                </p>
                <p style="margin: 10px 0;">
                  <strong>📋 Tipo:</strong> ${evento.tipo}
                </p>
                ${evento.descripcion ? `<p style="margin: 10px 0;"><strong>📝 Descripción:</strong> ${evento.descripcion}</p>` : ''}
              </div>
              
              <p>Por favor, asegúrate de estar preparado para esta sesión.</p>
              
              <p style="margin-top: 30px;">
                Saludos,<br>
                <strong>Equipo de Onboarding - Banco de Bogotá</strong>
              </p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #666;">
                Este es un mensaje automático del sistema de gestión de onboarding. 
                Si tienes alguna pregunta, contacta al equipo de recursos humanos.
              </p>
            </div>
          `
        };

        // Enviar el correo
        const info = await transporter.sendMail(mailOptions);
        
        // Registrar la notificación enviada
        await this.registrarNotificacionEnviada(
          evento.id, 
          colaborador.colaborador_id, 
          'alerta_semanal'
        );

        console.log(`✅ Correo enviado a ${colaborador.colaborador_correo}: ${info.messageId}`);
        return info;
      });

      const resultados = await Promise.all(promesas);
      return resultados.filter(r => r !== null);
    } catch (error) {
      console.error('Error al enviar alertas:', error);
      throw error;
    }
  }

  // Enviar correo de bienvenida a nuevo colaborador
  static async enviarCorreoBienvenida(colaborador) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: colaborador.correo,
        subject: '🎉 ¡Bienvenido al Banco de Bogotá!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #003d82;">¡Bienvenido al Equipo! 🎉</h2>
            
            <p>Hola <strong>${colaborador.nombre_completo}</strong>,</p>
            
            <p>Es un placer darte la bienvenida al Banco de Bogotá. Estamos emocionados de que te unas a nuestro equipo.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #003d82; margin-top: 0;">Próximos Pasos</h3>
              <ul style="line-height: 1.8;">
                <li>Completar el onboarding de bienvenida general</li>
                <li>Asistir a las sesiones técnicas programadas</li>
                <li>Conocer a tu equipo y mentor asignado</li>
                <li>Familiarizarte con nuestras herramientas y procesos</li>
              </ul>
            </div>
            
            <p>Tu fecha de ingreso es: <strong>${this.formatearFecha(colaborador.fecha_ingreso)}</strong></p>
            
            <p>Recibirás notificaciones sobre tus onboardings programados. Mantente atento a tu correo.</p>
            
            <p style="margin-top: 30px;">
              ¡Éxitos en esta nueva etapa!<br>
              <strong>Equipo de Recursos Humanos - Banco de Bogotá</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #666;">
              Este es un mensaje automático del sistema de gestión de onboarding.
            </p>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Correo de bienvenida enviado a ${colaborador.correo}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Error al enviar correo de bienvenida:', error);
      throw error;
    }
  }

  // Verificar si ya se envió una notificación
  static async verificarNotificacionEnviada(evento_id, colaborador_id, tipo) {
    try {
      const query = `
        SELECT EXISTS(
          SELECT 1 FROM notificaciones_enviadas
          WHERE evento_id = $1 AND colaborador_id = $2 AND tipo = $3
        ) as existe
      `;
      
      const resultado = await pool.query(query, [evento_id, colaborador_id, tipo]);
      return resultado.rows[0].existe;
    } catch (error) {
      console.error('Error al verificar notificación:', error);
      return false;
    }
  }

  // Registrar notificación enviada
  static async registrarNotificacionEnviada(evento_id, colaborador_id, tipo) {
    try {
      const query = `
        INSERT INTO notificaciones_enviadas (evento_id, colaborador_id, tipo)
        VALUES ($1, $2, $3)
        ON CONFLICT (evento_id, colaborador_id, tipo) DO NOTHING
      `;
      
      await pool.query(query, [evento_id, colaborador_id, tipo]);
    } catch (error) {
      console.error('Error al registrar notificación:', error);
    }
  }

  // Formatear fecha
  static formatearFecha(fecha) {
    const opciones = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'America/Bogota'
    };
    return new Date(fecha).toLocaleDateString('es-CO', opciones);
  }

  // Enviar alerta de prueba
  static async enviarCorreoPrueba(destinatario) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: destinatario,
        subject: '✅ Prueba del Sistema de Notificaciones - Onboarding',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #003d82;">✅ Sistema de Notificaciones Activo</h2>
            <p>Este es un correo de prueba del sistema de gestión de onboarding.</p>
            <p>Si recibes este mensaje, significa que el sistema de notificaciones está funcionando correctamente.</p>
            <p style="margin-top: 30px;">
              <strong>Equipo de Onboarding - Banco de Bogotá</strong>
            </p>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Correo de prueba enviado: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Error al enviar correo de prueba:', error);
      throw error;
    }
  }
}

module.exports = NotificacionService;