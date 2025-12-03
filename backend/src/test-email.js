// test-email.js
// Script para probar la configuración de correo

require('dotenv').config();
const NotificacionService = require('./services/notificacionService');

async function probarCorreo() {
  console.log('🧪 PRUEBA DE CONFIGURACIÓN DE CORREO');
  console.log('=====================================');
  console.log('');
  
  // Verificar variables de entorno
  console.log('📋 Configuración actual:');
  console.log('   EMAIL_HOST:', process.env.EMAIL_HOST || '❌ NO CONFIGURADO');
  console.log('   EMAIL_PORT:', process.env.EMAIL_PORT || '❌ NO CONFIGURADO');
  console.log('   EMAIL_USER:', process.env.EMAIL_USER || '❌ NO CONFIGURADO');
  console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Configurado' : '❌ NO CONFIGURADO');
  console.log('   EMAIL_FROM:', process.env.EMAIL_FROM || '❌ NO CONFIGURADO');
  console.log('');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Error: EMAIL_USER y EMAIL_PASSWORD deben estar configurados en .env');
    process.exit(1);
  }

  // Solicitar correo de destino
  const emailDestino = process.env.EMAIL_USER; // Por defecto enviar al mismo correo
  
  console.log(`📤 Enviando correo de prueba a: ${emailDestino}`);
  console.log('⏳ Espera un momento...');
  console.log('');

  try {
    const resultado = await NotificacionService.enviarCorreoPrueba(emailDestino);
    
    console.log('');
    console.log('✅ ¡ÉXITO! Correo enviado correctamente');
    console.log('   Message ID:', resultado.messageId);
    console.log('');
    console.log('📧 Revisa tu bandeja de entrada en:', emailDestino);
    console.log('');
    console.log('✅ La configuración de correo está funcionando correctamente');
    
  } catch (error) {
    console.log('');
    console.error('❌ ERROR al enviar correo:', error.message);
    console.error('');
    
    if (error.message.includes('Timeout')) {
      console.error('⚠️  PROBLEMA DE TIMEOUT:');
      console.error('   - Verifica tu conexión a internet');
      console.error('   - Asegúrate de que el puerto 587 esté abierto');
      console.error('   - Revisa tu firewall/antivirus');
    } else if (error.message.includes('Invalid login')) {
      console.error('⚠️  PROBLEMA DE AUTENTICACIÓN:');
      console.error('   - Verifica que EMAIL_USER sea correcto');
      console.error('   - Verifica que EMAIL_PASSWORD sea una "Contraseña de aplicación" válida');
      console.error('   - Para Gmail: https://myaccount.google.com/apppasswords');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('⚠️  PROBLEMA DE CONEXIÓN:');
      console.error('   - El servidor SMTP no está respondiendo');
      console.error('   - Verifica EMAIL_HOST y EMAIL_PORT');
    }
    
    console.error('');
    process.exit(1);
  }
}

// Ejecutar la prueba
probarCorreo().catch(error => {
  console.error('❌ Error inesperado:', error);
  process.exit(1);
});