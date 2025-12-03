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

        // ✅ ENVIAR CON TIMEOUT
        try {
          const info = await Promise.race([
            transporter.sendMail(mailOptions),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout al enviar correo')), 20000) // 20 segundos
            )
          ]);
          
          // Registrar la notificación enviada
          await this.registrarNotificacionEnviada(
            evento.id, 
            colaborador.colaborador_id, 
            'alerta_semanal'
          );

          console.log(`✅ Correo enviado a ${colaborador.colaborador_correo}: ${info.messageId}`);
          return info;
        } catch (emailError) {
          console.error(`❌ Error enviando correo a ${colaborador.colaborador_correo}:`, emailError.message);
          return null;
        }
      });

      const resultados = await Promise.allSettled(promesas);
      const exitosas = resultados.filter(r => r.status === 'fulfilled' && r.value !== null);
      return exitosas.map(r => r.value);
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

      // ✅ ENVIAR CON TIMEOUT
      const info = await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout al enviar correo')), 20000)
        )
      ]);

      console.log(`✅ Correo de bienvenida enviado a ${colaborador.correo}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Error al enviar correo de bienvenida:', error);
      throw error;
    }
  }

  /**
   * ✅ NUEVO: Enviar correo de confirmación cuando se crea una asignación
   */
  static async enviarCorreoConfirmacionAsignacion(colaborador, evento) {
    try {
      const fechaEvento = new Date(evento.fecha_inicio).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const fechaFin = new Date(evento.fecha_fin).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: colaborador.correo,
        subject: `✅ Has sido asignado a: ${evento.nombre_evento}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #003da5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .event-box { background-color: white; padding: 20px; border-left: 4px solid #003da5; margin: 20px 0; border-radius: 4px; }
              .event-detail { margin: 10px 0; padding: 8px 0; }
              .label { font-weight: bold; color: #003da5; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🎉 Nueva Asignación de Onboarding</h1>
              </div>
              <div class="content">
                <p>Hola <strong>${colaborador.nombre_completo}</strong>,</p>
                
                <p>Te informamos que has sido asignado al siguiente evento de onboarding técnico:</p>
                
                <div class="event-box">
                  <h2 style="margin-top: 0; color: #003da5;">${evento.nombre_evento}</h2>
                  
                  <div class="event-detail">
                    <span class="label">📋 Tipo:</span> ${evento.tipo}
                  </div>
                  
                  <div class="event-detail">
                    <span class="label">📅 Fecha de inicio:</span> ${fechaEvento}
                  </div>
                  
                  <div class="event-detail">
                    <span class="label">📅 Fecha de fin:</span> ${fechaFin}
                  </div>
                  
                  ${evento.descripcion ? `
                    <div class="event-detail">
                      <span class="label">📝 Descripción:</span><br>
                      ${evento.descripcion}
                    </div>
                  ` : ''}
                </div>
                
                <p><strong>⏰ Recordatorio:</strong> Recibirás una alerta por correo una semana antes del evento.</p>
                
                <p>Si tienes alguna pregunta, no dudes en contactar al equipo de Recursos Humanos.</p>
                
                <p style="margin-top: 30px;">
                  Saludos cordiales,<br>
                  <strong>Equipo de Recursos Humanos</strong><br>
                  Banco de Bogotá
                </p>
              </div>
              
              <div class="footer">
                <p>Este es un mensaje automático del Sistema de Gestión de Onboarding.</p>
                <p>© ${new Date().getFullYear()} Banco de Bogotá. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      // ✅ ENVIAR CON TIMEOUT DE 20 SEGUNDOS
      const info = await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout al enviar correo de confirmación')), 20000)
        )
      ]);

      console.log(`✅ Correo de confirmación enviado a ${colaborador.correo}: ${info.messageId || 'sin ID'}`);
      return info;

    } catch (error) {
      console.error(`❌ Error al enviar correo de confirmación a ${colaborador.correo}:`, error.message);
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
            <p><strong>Fecha de prueba:</strong> ${new Date().toLocaleString('es-CO')}</p>
            <p style="margin-top: 30px;">
              <strong>Equipo de Onboarding - Banco de Bogotá</strong>
            </p>
          </div>
        `
      };

      // ✅ ENVIAR CON TIMEOUT
      const info = await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout al enviar correo de prueba')), 20000)
        )
      ]);

      console.log(`✅ Correo de prueba enviado: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Error al enviar correo de prueba:', error);
      throw error;
    }
  }
}

module.exports = NotificacionService;