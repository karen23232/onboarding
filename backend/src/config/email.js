const nodemailer = require('nodemailer');

// Configuración del transporter de Nodemailer con Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
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