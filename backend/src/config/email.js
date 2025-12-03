const nodemailer = require('nodemailer');

// Configuración del transporter de Nodemailer con Gmail usando puerto 465 (SSL)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true para puerto 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  // Opciones adicionales para evitar timeouts
  connectionTimeout: 10000, // 10 segundos
  greetingTimeout: 10000,
  socketTimeout: 10000,
  // Opciones de reintento
  pool: true,
  maxConnections: 1,
  rateDelta: 20000,
  rateLimit: 5
});

// Verificar la conexión al iniciar el servidor
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error en configuración de email:', error);
    console.error('❌ Verifica que EMAIL_USER y EMAIL_PASSWORD estén configurados correctamente');
  } else {
    console.log('✅ Servidor de email listo para enviar correos');
    console.log(`📧 Enviando desde: ${process.env.EMAIL_USER}`);
  }
});

module.exports = transporter;