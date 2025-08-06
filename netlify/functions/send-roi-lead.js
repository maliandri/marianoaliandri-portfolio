// netlify/functions/send-roi-lead.js
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
    
    // Email de lead ROI (para ti)
    const mailOptions = {
      from: `"Portfolio ROI Calculator" <${process.env.ZOHO_USER}>`,
      to: process.env.TO_EMAIL || process.env.ZOHO_USER,
      subject: `🚀 Nuevo Lead ROI: ${data.company} - ROI ${data.calculatedROI?.roi || 'N/A'}%`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🎯 Nuevo Lead de ROI Calculator</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Oportunidad de negocio de alta calidad</p>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #059669; margin-top: 0;">📊 Resultados del Cálculo ROI</h2>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 15px 0;">
                <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px;">
                  <div style="font-size: 24px; font-weight: bold; color: #059669;">${data.calculatedROI?.roi || 'N/A'}%</div>
                  <div style="font-size: 12px; color: #666; margin-top: 5px;">ROI Anual</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #eff6ff; border-radius: 8px;">
                  <div style="font-size: 24px; font-weight: bold; color: #2563eb;">$${data.calculatedROI?.annualSavings?.toLocaleString() || '0'}</div>
                  <div style="font-size: 12px; color: #666; margin-top: 5px;">Ahorro Anual</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #fef3f2; border-radius: 8px;">
                  <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${data.calculatedROI?.paybackMonths || 'N/A'} meses</div>
                  <div style="font-size: 12px; color: #666; margin-top: 5px;">Recuperación</div>
                </div>
              </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0;">🏢 Información de la Empresa</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px; font-weight: bold; color: #555; width: 30%;">Empresa:</td><td style="padding: 8px;">${data.company}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #555;">Sector:</td><td style="padding: 8px;">${data.sector || 'No especificado'}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #555;">Empleados:</td><td style="padding: 8px;">${data.employees || 'No especificado'}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #555;">Ingresos Mensuales:</td><td style="padding: 8px;">${data.monthlyRevenue || 'No especificado'}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #555;">Teléfono:</td><td style="padding: 8px;">${data.phone || 'No especificado'}</td></tr>
              </table>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">📈 Situación Actual</h3>
              <p><strong>Herramientas actuales:</strong> ${data.currentDataTools || 'No especificado'}</p>
              <p><strong>Horas semanales procesando datos:</strong> ${data.dataProcessingHours || 'No especificado'} horas</p>
              <p><strong>Días para decisiones importantes:</strong> ${data.decisionMakingTime || 'No especificado'} días</p>
              <p><strong>Horas semanales generando reportes:</strong> ${data.reportGenerationTime || 'No especificado'} horas</p>
            </div>

            <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px;">
              <h3 style="margin: 0 0 10px 0;">🎯 Acciones Recomendadas</h3>
              <p style="margin: 0 0 15px 0;">Lead de alta calidad con ROI potencial de ${data.calculatedROI?.roi || 'N/A'}%</p>
              <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <a href="mailto:${data.email}?subject=Propuesta personalizada para ${data.company}&body=Hola, vi tu calculación de ROI y me gustaría enviarte una propuesta personalizada." 
                   style="background: white; color: #059669; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  📧 Enviar Propuesta
                </a>
                <a href="https://wa.me/+542995414422?text=Hola! Quiero contactar el lead de ${data.company} que calculó un ROI de ${data.calculatedROI?.roi || 'N/A'}%"
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
        message: 'Lead procesado exitosamente'
      })
    };

  } catch (error) {
    console.error('Error enviando ROI lead:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error procesando lead'
      })
    };
  }
};