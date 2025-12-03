require('dotenv').config();
const transporter = require('./src/config/email');

async function testEmail() {
  try {
    console.log('📧 Enviando correo de prueba...');
    console.log('   Desde:', process.env.EMAIL_FROM);
    console.log('   Para:', process.env.EMAIL_USER);
    console.log('');
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: '✅ Prueba - Sistema Onboarding Banco de Bogotá',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #003d82;">¡El sistema funciona correctamente! 🎉</h2>
          <p>Este correo confirma que el sistema de notificaciones está configurado y funcionando.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📅 Fecha:</strong> ${new Date().toLocaleString('es-CO')}</p>
            <p><strong>🏦 Sistema:</strong> Gestión de Onboarding</p>
            <p><strong>✉️ Destinatario:</strong> ${process.env.EMAIL_USER}</p>
          </div>
          <p>Si recibes este mensaje, el sistema está listo para enviar alertas de onboarding.</p>
          <p style="margin-top: 30px;">
            <strong>Equipo de Desarrollo - Banco de Bogotá</strong>
          </p>
        </div>
      `
    });

    console.log('✅ ¡Correo enviado exitosamente!');
    console.log('   Message ID:', info.messageId);
    console.log('');
    console.log('🔍 Revisa tu bandeja de entrada en: 1526dani@gmail.com');
    console.log('   (Si no lo ves, revisa la carpeta de spam)');
    console.log('');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al enviar correo:', error.message);
    console.error('');
    console.error('Detalles del error:', error);
    process.exit(1);
  }
}

testEmail();