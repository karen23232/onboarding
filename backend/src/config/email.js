const nodemailer = require('nodemailer');

console.log('📧 Iniciando configuración de email...');
console.log('   Host:', process.env.EMAIL_HOST);
console.log('   Port:', process.env.EMAIL_PORT);
console.log('   User:', process.env.EMAIL_USER);
console.log('   Password:', process.env.EMAIL_PASSWORD ? '✅ Configurada' : '❌ NO CONFIGURADA');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // false para puerto 587, true para 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Solo para desarrollo
  },
  // ✅ AGREGAR TIMEOUTS PARA EVITAR BLOQUEOS
  connectionTimeout: 10000,  // 10 segundos para conectar
  greetingTimeout: 10000,    // 10 segundos para greeting
  socketTimeout: 15000,      // 15 segundos para operaciones de socket
  // Pool para manejar múltiples correos
  pool: true,
  maxConnections: 5,
  maxMessages: 10,
  // Rate limiting
  rateDelta: 1000,  // 1 segundo
  rateLimit: 5      // máximo 5 correos por segundo
});

// Verificar conexión al iniciar
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Error en configuración de email:', error.message);
    console.error('');
    console.error('⚠️  VERIFICA:');
    console.error('   1. La verificación en 2 pasos está ACTIVA en Gmail');
    console.error('   2. La contraseña de aplicación es correcta (sin espacios)');
    console.error('   3. El correo EMAIL_USER es correcto');
    console.error('   4. El puerto 587 está abierto en tu red');
    console.error('');
  } else {
    console.log('✅ Servidor de email listo para enviar mensajes');
    console.log('');
  }
});

// ✅ MANEJAR EVENTOS DE ERROR PARA NO CRASHEAR LA APP
transporter.on('error', (error) => {
  console.error('❌ Error del transporter de email:', error.message);
});

module.exports = transporter;