const { Resend } = require('resend');

// ✅ VALIDAR que existe RESEND_API_KEY
if (!process.env.RESEND_API_KEY) {
  console.error('❌ ERROR CRÍTICO: RESEND_API_KEY no está configurado en las variables de entorno');
  throw new Error('RESEND_API_KEY no está configurado');
}

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Crear un objeto transporter compatible con tu código actual
const transporter = {
  sendMail: async (mailOptions) => {
    try {
      // ✅ VALIDACIÓN: Verificar que tenemos un destinatario
      if (!mailOptions.to) {
        throw new Error('No se proporcionó un destinatario (to)');
      }

      console.log(`📧 Intentando enviar correo a: ${mailOptions.to}`);
      console.log(`📝 Asunto: ${mailOptions.subject}`);

      const result = await resend.emails.send({
        from: 'Onboarding <onboarding@resend.dev>', // Para testing usar el dominio de Resend
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html
      });
      
      // ✅ VALIDACIÓN: Verificar que result y result.data existen
      if (!result) {
        throw new Error('Resend no devolvió ningún resultado');
      }

      // ✅ IMPORTANTE: Resend devuelve el ID directamente en result.data o result.id
      const messageId = result.data?.id || result.id || 'unknown';
      
      console.log(`✅ Email enviado exitosamente a ${mailOptions.to}`);
      console.log(`📧 ID del mensaje: ${messageId}`);
      
      return {
        messageId: messageId,
        accepted: [mailOptions.to],
        response: result
      };

    } catch (error) {
      // ✅ MEJOR MANEJO DE ERRORES
      console.error('❌ Error al enviar email con Resend:', error.message);
      
      // Mostrar más detalles del error si están disponibles
      if (error.response) {
        console.error('📄 Response error:', JSON.stringify(error.response, null, 2));
      }
      
      if (error.statusCode) {
        console.error('🔢 Status code:', error.statusCode);
      }

      // Re-lanzar el error con más contexto
      throw new Error(`Error al enviar correo a ${mailOptions.to}: ${error.message}`);
    }
  },
  
  verify: (callback) => {
    if (process.env.RESEND_API_KEY) {
      console.log('✅ Resend configurado correctamente');
      console.log('📧 Modo: Testing (usando dominio resend.dev)');
      console.log('💡 Los emails llegarán desde: onboarding@resend.dev');
      console.log('🔑 API Key configurada:', process.env.RESEND_API_KEY.substring(0, 10) + '...');
      
      // Callback de éxito
      if (callback) {
        callback(null, true);
      }
      return true;
    } else {
      const error = new Error('❌ RESEND_API_KEY no está configurada');
      console.error(error.message);
      
      if (callback) {
        callback(error, false);
      }
      return false;
    }
  }
};

// ✅ Verificar configuración al cargar el módulo
console.log('');
console.log('===========================================');
console.log('📧 INICIALIZANDO SISTEMA DE CORREOS');
console.log('===========================================');

try {
  transporter.verify();
  console.log('✅ Sistema de correos listo para usar');
} catch (error) {
  console.error('❌ Error al verificar configuración de correos:', error.message);
}

console.log('===========================================');
console.log('');

module.exports = transporter;