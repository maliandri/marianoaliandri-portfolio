// index.js — Backend limpio sin pasarelas de pago
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// ==================== CORS ====================
const allowedOrigins = [
  'https://marianoaliandri.netlify.app',
  'https://marianoaliandri.com.ar',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4000',
  'http://localhost:4173',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`⚠️ Intento de acceso denegado por CORS desde: ${origin}`);
    return callback(new Error('No permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ==================== MAIL ====================
if (!process.env.ZOHO_USER || !process.env.ZOHO_PASS) {
  console.error('❌ FALTAN CREDENCIALES DE EMAIL: ZOHO_USER y ZOHO_PASS requeridas en .env');
}

const createTransporter = () =>
  nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 587, // TLS
    secure: false,
    auth: {
      user: process.env.ZOHO_USER,
      pass: process.env.ZOHO_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

// Helper para moneda ARS
const fmtARS = (n) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

// ==================== ENDPOINTS DE EMAIL ====================
// Lead ROI
app.post('/api/send-roi-lead', async (req, res) => {
  const leadData = req.body;

  if (!leadData.email || !leadData.company || !leadData.calculatedROI) {
    return res
      .status(400)
      .json({ success: false, error: 'Faltan datos requeridos: email, company, calculatedROI' });
  }
  if (!process.env.ZOHO_USER || !process.env.ZOHO_PASS) {
    return res.status(500).json({ success: false, error: 'Configuración de email no disponible' });
  }

  try {
    const transporter = createTransporter();
    const { company, email, phone, calculatedROI } = leadData;

    const mailOptions = {
      from: process.env.ZOHO_USER,
      to: process.env.TO_EMAIL || process.env.ZOHO_USER,
      subject: `Nuevo Lead ROI: ${company}`,
      html: `
        <h2>¡Nuevo Lead de Calculadora ROI!</h2>
        <p><strong>Empresa:</strong> ${company}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${phone || 'No especificado'}</p>
        <p><strong>ROI Calculado:</strong> ${calculatedROI.roi}%</p>
        <p><strong>Ahorro Anual:</strong> ${fmtARS(calculatedROI.annualSavings)}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email ROI enviado para ${company}`);
    res.status(200).json({ success: true, message: 'Email enviado correctamente' });
  } catch (error) {
    console.error('❌ Error enviando correo ROI:', error);
    res.status(500).json({ success: false, error: 'Error al enviar el email' });
  }
});

// Lead Web
app.post('/api/send-web-lead', async (req, res) => {
  const leadData = req.body;

  if (!leadData.email || !leadData.company || !leadData.calculatedResults) {
    return res
      .status(400)
      .json({ success: false, error: 'Faltan datos requeridos: email, company, calculatedResults' });
  }
  if (!process.env.ZOHO_USER || !process.env.ZOHO_PASS) {
    return res.status(500).json({ success: false, error: 'Configuración de email no disponible' });
  }

  try {
    const transporter = createTransporter();
    const { company, email, calculatedResults } = leadData;

    const mailOptions = {
      from: process.env.ZOHO_USER,
      to: process.env.TO_EMAIL || process.env.ZOHO_USER,
      subject: `Nuevo Lead de Desarrollo Web: ${company}`,
      html: `
        <h2>¡Nuevo Lead de Desarrollo Web!</h2>
        <p><strong>Empresa:</strong> ${company}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Presupuesto Calculado:</strong> ${fmtARS(calculatedResults.developmentCost)}</p>
        <p><strong>ROI Estimado:</strong> ${calculatedResults.roi}%</p>
        <p><strong>Tiempo de Desarrollo:</strong> ${calculatedResults.developmentWeeks} semanas</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email Web enviado para ${company}`);
    res.status(200).json({ success: true, message: 'Email enviado correctamente' });
  } catch (error) {
    console.error('❌ Error enviando correo Web:', error);
    res.status(500).json({ success: false, error: 'Error al enviar el email' });
  }
});

// ==================== UTILIDAD ====================
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend funcionando correctamente!',
    timestamp: new Date().toISOString(),
    environment: {
      zohoUser: process.env.ZOHO_USER ? 'Configurado ✓' : 'No configurado ✗',
    },
  });
});

// ==================== ERRORES ====================
app.use((err, req, res, next) => {
  console.error('❌ Error del servidor:', err);
  res.status(500).json({ success: false, error: 'Error interno del servidor' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

// ==================== INICIO ====================
app.listen(PORT, () => {
  console.log(`🚀 Servidor en funcionamiento en el puerto ${PORT}`);
  console.log('Estado de variables de entorno:');
  console.log('ZOHO_USER:', process.env.ZOHO_USER ? 'Configurado ✓' : 'No configurado ✗');
});
