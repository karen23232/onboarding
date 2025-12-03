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
  // ✅ TIMEOUTS PARA EVITAR BLOQUEOS
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  // Pool para múltiples correos
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

module.exports = transporter;