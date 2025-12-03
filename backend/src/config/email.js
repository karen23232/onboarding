const { Resend } = require('resend');

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Crear un objeto transporter compatible con tu código actual
const transporter = {
  sendMail: async (mailOptions) => {
    try {
      const result = await resend.emails.send({
        from: 'Onboarding <onboarding@resend.dev>', // Para testing usar el dominio de Resend
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html
      });
      
      console.log(`✅ Email enviado exitosamente a ${mailOptions.to}`);
      console.log(`📧 ID del mensaje: ${result.data.id}`);
      
      return {
        messageId: result.data.id,
        accepted: [mailOptions.to]
      };
    } catch (error) {
      console.error('❌ Error al enviar email con Resend:', error);
      throw error;
    }
  },
  
  verify: (callback) => {
    if (process.env.RESEND_API_KEY) {
      console.log('✅ Resend configurado correctamente');
      console.log('📧 Modo: Testing (usando dominio resend.dev)');
      console.log('💡 Los emails llegarán desde: onboarding@resend.dev');
      callback(null, true);
    } else {
      const error = new Error('❌ RESEND_API_KEY no está configurada');
      console.error(error.message);
      callback(error, false);
    }
  }
};

module.exports = transporter;