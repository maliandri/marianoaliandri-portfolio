// netlify/functions/send-web-lead.js
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
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);

    if (!data.email || !data.company) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email y empresa requeridos' })
      };
    }

    const transporter = createTransporter();
    
    // Email de lead Web (para ti)
    const mailOptions = {
      from: `"Portfolio Web Calculator" <${process.env.ZOHO_USER}>`,
      to: process.env.TO_EMAIL || process.env.ZOHO_USER,
      subject: `🌐 Nuevo Lead Web: ${data.company} - ${data.calculatedResults?.developmentCost ? '$' + data.calculatedResults.developmentCost.toLocaleString() : 'N/A'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🌐 Nuevo Lead de Desarrollo Web</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Cliente interesado en desarrollo web profesional</p>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1d4ed8; margin-top: 0;">💰 Cotización Calculada</h2>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 15px 0;">
                <div style="text-align: center; padding: 15px; background: #dbeafe; border-radius: 8px;">
                  <div style="font-size: 24px; font-weight: bold; color: #1d4ed8;">$${data.calculatedResults?.developmentCost?.toLocaleString() || '0'}</div>
                  <div style="font-size: 12px; color: #666; margin-top: 5px;">Costo Total</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px;">
                  <div style="font-size: 24px; font-weight: bold; color: #059669;">${data.calculatedResults?.roi || 'N/A'}%</div>
                  <div style="font-size: 12px; color: #666; margin-top: 5px;">ROI Proyectado</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #fef3f2; border-radius: 8px;">
                  <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${data.calculatedResults?.developmentWeeks || 'N/A'} sem</div>
                  <div style="font-size: 12px; color: #666; margin-top: 5px;">Tiempo Desarrollo</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #fff7ed; border-radius: 8px;">
                  <div style="font-size: 24px; font-weight: bold; color: #ea580c;">$${data.calculatedResults?.monthlyRevenue?.toLocaleString() || '0'}</div>
                  <div style="font-size: 12px; color: #666; margin-top: 5px;">Ingresos Extra/Mes</div>
                </div>
              </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0;">🏢 Información del Cliente</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px; font-weight: bold; color: #555; width: 30%;">Empresa:</td><td style="padding: 8px;">${data.company}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #555;">Sector:</td><td style="padding: 8px;">${data.sector || 'No especificado'}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #555;">Ingresos Mensuales:</td><td style="padding: 8px;">${data.monthlyRevenue || 'No especificado'}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #555;">Teléfono:</td><td style="padding: 8px;">${data.phone || 'No especificado'}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #555;">Sitio Actual:</td><td style="padding: 8px;">${data.currentWebsite || 'No especificado'}</td></tr>
              </table>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0;">🌐 Requerimientos del Proyecto</h3>
              <p><strong>Tipo de sitio:</strong> ${data.websiteType || 'No especificado'}</p>
              <p><strong>Número de páginas:</strong> ${data.pageCount || 'No especificado'}</p>
              <p><strong>Nivel de diseño:</strong> ${data.designLevel || 'No especificado'}</p>
              <p><strong>Urgencia:</strong> ${data.urgency || 'No especificado'}</p>
              <p><strong>Funcionalidades:</strong> ${data.features?.join(', ') || 'Ninguna especial'}</p>
              <p><strong>Integraciones:</strong> ${data.integrations?.join(', ') || 'Ninguna especial'}</p>
              <p><strong>Método actual clientes:</strong> ${data.currentClientMethod || 'No especificado'}</p>
            </div>

            <div style="background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px;">
              <h3 style="margin: 0 0 10px 0;">🎯 Acciones Recomendadas</h3>
              <p style="margin: 0 0 15px 0;">Cliente con proyecto de $${data.calculatedResults?.developmentCost?.toLocaleString() || '0'} y ROI de ${data.calculatedResults?.roi || 'N/A'}%</p>
              <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <a href="mailto:${data.email}?subject=Propuesta de desarrollo web para ${data.company}&body=Hola, vi tu cálculo de desarrollo web y me gustaría enviarte una propuesta detallada." 
                   style="background: white; color: #1d4ed8; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  📧 Enviar Propuesta
                </a>
                <a href="https://wa.me/+542995414422?text=Hola! Quiero contactar el lead de ${data.company} que calculó un proyecto web de $${data.calculatedResults?.developmentCost?.toLocaleString() || '0'}"
                   style="background: rgba(255,255,255,0.2); color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Lead de desarrollo web procesado exitosamente'
      })
    };

  } catch (error) {
    console.error('Error enviando Web lead:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error procesando lead de desarrollo web'
      })
    };
  }
};