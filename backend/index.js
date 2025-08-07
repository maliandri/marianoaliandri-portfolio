const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: ['https://marianoaliandri.netlify.app', 'http://localhost:5173'],
  credentials: true
}));

// Configuración correcta para Zoho Mail
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.zoho.com', // Host correcto para Zoho
    port: 587, // Puerto SMTP
    secure: false, // false para STARTTLS
    auth: {
      user: process.env.ZOHO_USER, // tu@dominio.com
      pass: process.env.ZOHO_PASS  // Contraseña de la app
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Endpoint para enviar el ROI lead
app.post('/api/send-roi-lead', async (req, res) => {
  const leadData = req.body;
  console.log('Recibida petición para ROI lead:', leadData.company);

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.ZOHO_USER,
      to: process.env.TO_EMAIL || process.env.ZOHO_USER,
      subject: `Nuevo Lead ROI: ${leadData.company}`,
      html: `
        <h2>¡Nuevo Lead de Calculadora ROI!</h2>
        <p><strong>Empresa:</strong> ${leadData.company}</p>
        <p><strong>Email:</strong> ${leadData.email}</p>
        <p><strong>Teléfono:</strong> ${leadData.phone || 'No especificado'}</p>
        <p><strong>Sector:</strong> ${leadData.sector}</p>
        <p><strong>Empleados:</strong> ${leadData.employees}</p>
        <p><strong>ROI Calculado:</strong> ${leadData.calculatedROI?.roi}%</p>
        <p><strong>Ahorro Anual:</strong> $${leadData.calculatedROI?.annualSavings}</p>
        <p><strong>Tiempo:</strong> ${new Date().toLocaleString()}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email ROI enviado correctamente.');
    res.status(200).json({ success: true, message: 'Email sent successfully!' });

  } catch (error) {
    console.error('Error enviando correo ROI:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

// Endpoint para enviar el Web lead
app.post('/api/send-web-lead', async (req, res) => {
  const leadData = req.body;
  console.log('Recibida petición para Web lead:', leadData.company);

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.ZOHO_USER,
      to: process.env.TO_EMAIL || process.env.ZOHO_USER,
      subject: `Nuevo Lead de Desarrollo Web: ${leadData.company}`,
      html: `
        <h2>¡Nuevo Lead de Desarrollo Web!</h2>
        <p><strong>Empresa:</strong> ${leadData.company}</p>
        <p><strong>Email:</strong> ${leadData.email}</p>
        <p><strong>Teléfono:</strong> ${leadData.phone || 'No especificado'}</p>
        <p><strong>Sector:</strong> ${leadData.sector}</p>
        <p><strong>Tipo de Web:</strong> ${leadData.websiteType}</p>
        <p><strong>Páginas:</strong> ${leadData.pageCount}</p>
        <p><strong>Presupuesto Calculado:</strong> $${leadData.calculatedResults?.developmentCost}</p>
        <p><strong>ROI Estimado:</strong> ${leadData.calculatedResults?.roi}%</p>
        <p><strong>Tiempo de Desarrollo:</strong> ${leadData.calculatedResults?.developmentWeeks} semanas</p>
        <p><strong>Ingresos Proyectados:</strong> $${leadData.calculatedResults?.annualRevenue}/año</p>
        <p><strong>Funcionalidades:</strong> ${leadData.features?.join(', ') || 'Ninguna'}</p>
        <p><strong>Integraciones:</strong> ${leadData.integrations?.join(', ') || 'Ninguna'}</p>
        <p><strong>Método Actual de Clientes:</strong> ${leadData.currentClientMethod}</p>
        <p><strong>Web Actual:</strong> ${leadData.currentWebsite}</p>
        <p><strong>Urgencia:</strong> ${leadData.urgency}</p>
        <p><strong>Tiempo:</strong> ${new Date().toLocaleString()}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email Web enviado correctamente.');
    res.status(200).json({ success: true, message: 'Email sent successfully!' });

  } catch (error) {
    console.error('Error enviando correo Web:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('ZOHO_USER:', process.env.ZOHO_USER ? 'Configurado' : 'No configurado');
  console.log('ZOHO_PASS:', process.env.ZOHO_PASS ? 'Configurado' : 'No configurado');
});