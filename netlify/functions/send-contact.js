// netlify/functions/send-contact.js
const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.zoho.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ZOHO_USER,
      pass: process.env.ZOHO_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Manejar preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);

    // Validación básica
    if (!data.email || !data.email.includes('@')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email válido requerido' })
      };
    }

    if (!data.name && !data.company) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Nombre o empresa requerido' })
      };
    }

    // Crear transportador
    const transporter = createTransporter();

    // Email principal (para ti)
    const mainMailOptions = {
      from: `"Portfolio Contact" <${process.env.ZOHO_USER}>`,
      to: process.env.TO_EMAIL || process.env.ZOHO_USER,
      subject: `Nuevo contacto desde portfolio - ${data.company || data.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Nuevo Mensaje de Contacto</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">Información del Contacto:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; font-weight: bold; color: #555;">Nombre:</td><td style="padding: 8px;">${data.name || 'No especificado'}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px;">${data.email}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; color: #555;">Teléfono:</td><td style="padding: 8px;">${data.phone || 'No especificado'}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; color: #555;">Empresa:</td><td style="padding: 8px;">${data.company || 'No especificado'}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; color: #555;">Servicio:</td><td style="padding: 8px;">${data.service || 'Consulta general'}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; color: #555;">Presupuesto:</td><td style="padding: 8px;">${data.budget || 'No especificado'}</td></tr>
            </table>
            
            ${data.message ? `
              <h3 style="color: #333; margin-top: 20px;">Mensaje:</h3>
              <div style="background: white; padding: 15px; border-left: 4px solid #667eea; border-radius: 4px;">
                ${data.message}
              </div>
            ` : ''}
            
            <div style="margin-top: 20px; padding: 10px; background: #e3f2fd; border-radius: 4px;">
              <p style="margin: 0; font-size: 12px; color: #666;">
                Enviado desde: Portfolio Web | 
                Fecha: ${new Date().toLocaleString('es-ES')}
              </p>
            </div>
          </div>
        </div>
      `
    };

    // Email de respuesta automática
    const autoReplyOptions = {
      from: `"Mariano Aliandri" <${process.env.ZOHO_USER}>`,
      to: data.email,
      subject: `Gracias por contactarme, ${data.name || data.company}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">¡Gracias por contactarme!</h1>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <p style="font-size: 16px; color: #333;">Hola ${data.name || 'estimado cliente'},</p>
            
            <p style="color: #555; line-height: 1.6;">
              He recibido tu mensaje y te responderé en las próximas <strong>24 horas</strong>. 
              Mientras tanto, puedes contactarme directamente por WhatsApp si es urgente.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://wa.me/+542995414422?text=Hola Mariano! Te escribo desde tu portfolio web" 
                 style="background: #25D366; color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; display: inline-block;">
                💬 WhatsApp Directo
              </a>
            </div>
            
            <div style="border-top: 1px solid #ddd; padding-top: 20px; font-size: 14px; color: #666; text-align: center;">
              <p style="margin: 5px 0;"><strong>Mariano Aliandri</strong></p>
              <p style="margin: 5px 0;">Analista de Datos e Inteligencia Empresarial</p>
              <p style="margin: 5px 0;">📧 yo@marianoaliandri.com.ar | 📱 +54 299 541-4422</p>
            </div>
          </div>
        </div>
      `
    };

    // Enviar ambos emails
    await Promise.all([
      transporter.sendMail(mainMailOptions),
      transporter.sendMail(autoReplyOptions)
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Mensaje enviado exitosamente'
      })
    };

  } catch (error) {
    console.error('Error enviando email:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error interno del servidor'
      })
    };
  }
};