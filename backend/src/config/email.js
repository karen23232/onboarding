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
  }
});

// Verificar conexión
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Error en configuración de email:', error.message);
    console.error('');
    console.error('⚠️  VERIFICA:');
    console.error('   1. La verificación en 2 pasos está ACTIVA en Gmail');
    console.error('   2. La contraseña de aplicación es correcta (sin espacios)');
    console.error('   3. El correo EMAIL_USER es correcto');
    console.error('');
  } else {
    console.log('✅ Servidor de email listo para enviar mensajes');
    console.log('');
  }
});

module.exports = transporter;