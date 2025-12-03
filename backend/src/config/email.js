const nodemailer = require('nodemailer');

console.log('📧 Iniciando configuración de email...');
console.log('   Host:', process.env.EMAIL_HOST);
console.log('   Port:', process.env.EMAIL_PORT);
console.log('   User:', process.env.EMAIL_USER);
console.log('   Password:', process.env.EMAIL_PASSWORD ? '✅ Configurada' : '❌ NO CONFIGURADA');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // false para puerto 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  pool: true,
  maxConnections: 5,
  maxMessages: 10,
  rateDelta: 1000,
  rateLimit: 5
});

// Verificar conexión
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Error en configuración de email:', error.message);
    console.error('');
    console.error('⚠️  VERIFICA:');
    console.error('   1. Contraseña de aplicación correcta (sin espacios)');
    console.error('   2. Verificación en 2 pasos ACTIVA');
    console.error('   3. Puerto 587 abierto');
    console.error('');
  } else {
    console.log('✅ Servidor de email listo');
    console.log('');
  }
});

transporter.on('error', (error) => {
  console.error('❌ Error del transporter:', error.message);
});

// ========================================
// FUNCIONES PARA ENVIAR CORREOS
// ========================================

/**
 * Envía correo de notificación cuando se crea una asignación
 */
const enviarCorreoAsignacion = async (destinatario, datosAsignacion) => {
  const { colaborador, evento, tipo, fecha } = datosAsignacion;

  // Formatear fecha en español
  const fechaFormateada = new Date(fecha).toLocaleDateString('es-CO', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Sistema de Onboarding" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: `🎯 Nueva Asignación de Onboarding - ${tipo}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background-color: #003d7a; 
            color: white; 
            padding: 30px 20px; 
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content { 
            background-color: #f9f9f9; 
            padding: 30px 20px; 
            border-radius: 0 0 8px 8px;
          }
          .details { 
            background-color: white; 
            padding: 20px; 
            border-left: 4px solid #003d7a; 
            margin: 20px 0;
            border-radius: 4px;
          }
          .details p {
            margin: 10px 0;
          }
          .footer { 
            text-align: center; 
            margin-top: 20px; 
            color: #666; 
            font-size: 12px;
            padding: 20px;
          }
          .button { 
            background-color: #003d7a; 
            color: white !important; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block; 
            margin-top: 20px;
            font-weight: bold;
          }
          .emoji {
            font-size: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Nueva Asignación de Onboarding</h1>
            <p style="margin: 10px 0 0 0;">Banco de Bogotá</p>
          </div>
          <div class="content">
            <p>Hola <strong>${colaborador}</strong>,</p>
            <p>Se te ha asignado un nuevo evento de onboarding. Por favor, toma nota de los siguientes detalles:</p>
            
            <div class="details">
              <p><strong>📋 Evento:</strong> ${evento}</p>
              <p><strong>🏷️ Tipo:</strong> ${tipo}</p>
              <p><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
            </div>
            
            <p>Este evento es parte importante de tu proceso de integración. Por favor, asegúrate de:</p>
            <ul>
              <li>Marcar esta fecha en tu calendario</li>
              <li>Prepararte con anticipación</li>
              <li>Confirmar tu asistencia</li>
            </ul>
            
            <center>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/calendario" class="button">
                Ver mi Calendario
              </a>
            </center>
          </div>
          <div class="footer">
            <p>━━━━━━━━━━━━━━━━━━━━━━</p>
            <p><strong>Sistema de Onboarding - Banco de Bogotá</strong></p>
            <p>Este es un correo automático. Por favor, no respondas a este mensaje.</p>
            <p>Si tienes dudas, contacta al área de Recursos Humanos.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    console.log(`📤 Enviando correo de asignación a: ${destinatario}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo de asignación enviado exitosamente');
    console.log('   Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar correo de asignación:', error.message);
    throw error;
  }
};

/**
 * Envía recordatorio 7 días antes del evento
 */
const enviarRecordatorioEvento = async (destinatario, datosAsignacion) => {
  const { colaborador, evento, tipo, fecha } = datosAsignacion;

  const fechaFormateada = new Date(fecha).toLocaleDateString('es-CO', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Sistema de Onboarding" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: `⏰ Recordatorio: Evento de Onboarding en 7 días`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background-color: #FFA500; 
            color: white; 
            padding: 30px 20px; 
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content { 
            background-color: #f9f9f9; 
            padding: 30px 20px; 
            border-radius: 0 0 8px 8px;
          }
          .details { 
            background-color: white; 
            padding: 20px; 
            border-left: 4px solid #FFA500; 
            margin: 20px 0;
            border-radius: 4px;
          }
          .details p {
            margin: 10px 0;
          }
          .alert-box {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            margin-top: 20px; 
            color: #666; 
            font-size: 12px;
            padding: 20px;
          }
          .button { 
            background-color: #FFA500; 
            color: white !important; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block; 
            margin-top: 20px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Recordatorio de Evento</h1>
            <p style="margin: 10px 0 0 0;">Banco de Bogotá</p>
          </div>
          <div class="content">
            <p>Hola <strong>${colaborador}</strong>,</p>
            
            <div class="alert-box">
              <p style="margin: 0; text-align: center;">
                <strong>⚠️ Tu evento está próximo a realizarse en 7 días</strong>
              </p>
            </div>
            
            <p>Te recordamos los detalles de tu evento de onboarding:</p>
            
            <div class="details">
              <p><strong>📋 Evento:</strong> ${evento}</p>
              <p><strong>🏷️ Tipo:</strong> ${tipo}</p>
              <p><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
            </div>
            
            <p><strong>Recomendaciones:</strong></p>
            <ul>
              <li>Revisa los materiales preparatorios si los hay</li>
              <li>Prepara tus preguntas con anticipación</li>
              <li>Confirma la ubicación o enlace del evento</li>
              <li>Llega con 10 minutos de anticipación</li>
            </ul>
            
            <center>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/calendario" class="button">
                Ver mi Calendario
              </a>
            </center>
          </div>
          <div class="footer">
            <p>━━━━━━━━━━━━━━━━━━━━━━</p>
            <p><strong>Sistema de Onboarding - Banco de Bogotá</strong></p>
            <p>Este es un correo automático. Por favor, no respondas a este mensaje.</p>
            <p>Si tienes dudas, contacta al área de Recursos Humanos.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    console.log(`📤 Enviando recordatorio a: ${destinatario}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Recordatorio enviado exitosamente');
    console.log('   Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar recordatorio:', error.message);
    throw error;
  }
};

module.exports = {
  transporter,
  enviarCorreoAsignacion,
  enviarRecordatorioEvento
};