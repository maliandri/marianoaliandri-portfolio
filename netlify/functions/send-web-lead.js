const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.default.createTransporter({
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

const sendEmail = async (mailOptions) => {
  const transporter = createTransporter();
  await transporter.sendMail(mailOptions);
};

const buildEmailContent = (leadData) => {
  // Contenido del email
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Nuevo Web Lead - ${leadData.company}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
        h1 { color: #0056b3; }
        ul { list-style-type: none; padding: 0; }
        li { margin-bottom: 10px; }
        strong { color: #555; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>¡Nuevo Lead de Desarrollo Web!</h1>
        <p><strong>De:</strong> ${leadData.company}</p>
        <p><strong>Email:</strong> <a href="mailto:${leadData.email}">${leadData.email}</a></p>
        <p><strong>Teléfono:</strong> ${leadData.phone || 'No especificado'}</p>
        <p><strong>Origen:</strong> ${leadData.source}</p>
        <p><strong>Timestamp:</strong> ${leadData.timestamp}</p>
        
        <h2>Resumen del Proyecto</h2>
        <ul>
          <li><strong>Presupuesto Seleccionado:</strong> $${leadData.budget}</li>
          <li><strong>Características Elegidas:</strong> ${leadData.features.join(', ') || 'Ninguna'}</li>
          <li><strong>Características Personalizadas:</strong> ${leadData.customFeatures || 'No especificado'}</li>
          <li><strong>Diseño Web:</strong> ${leadData.design}</li>
          <li><strong>Método de Contacto Preferido:</strong> ${leadData.contactMethod || 'No especificado'}</li>
        </ul>
        
        <h2>Resultados Calculados</h2>
        <ul>
          <li><strong>Costo Estimado:</strong> $${leadData.calculatedResults.cost}</li>
          <li><strong>Tiempo Estimado:</strong> ${leadData.calculatedResults.time} semanas</li>
          <li><strong>ROI Estimado:</strong> ${leadData.calculatedResults.estimatedROI}%</li>
        </ul>
      </div>
    </body>
    </html>
  `;
  return htmlContent;
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const data = JSON.parse(event.body);
    const emailBody = buildEmailContent(data);

    const mailOptions = {
      from: process.env.ZOHO_USER,
      to: process.env.TO_EMAIL,
      subject: `Nuevo Lead de Desarrollo Web: ${data.company}`,
      html: emailBody,
    };

    await sendEmail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Email sent successfully!',
      }),
    };
  } catch (error) {
    console.error('Error enviando Web lead:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Error procesando lead de desarrollo web',
        error: error.message,
      }),
    };
  }
};