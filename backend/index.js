const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Configuración de CORS más permisiva
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (aplicaciones móviles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://marianoaliandri.netlify.app',
      'https://marianoaliandri.com.ar',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4173'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Origen no permitido por CORS:', origin);
      callback(null, true); // Temporalmente permitir todos los orígenes para debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-HTTP-Method-Override'
  ]
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware adicional para manejar CORS preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-HTTP-Method-Override');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Configuración correcta para Zoho Mail
const createTransporter = () => {
  console.log('Creando transporter con:', {
    host: 'smtp.zoho.com',
    port: 587,
    user: process.env.ZOHO_USER,
    passConfigured: !!process.env.ZOHO_PASS
  });

  return nodemailer.createTransporter({
    host: 'smtp.zoho.com',
    port: 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.ZOHO_USER,
      pass: process.env.ZOHO_PASS
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

    // Verificar la conexión primero
    await transporter.verify();
    console.log('Conexión SMTP verificada correctamente');

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
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para enviar el Web lead
app.post('/api/send-web-lead', async (req, res) => {
  const leadData = req.body;
  console.log('Recibida petición para Web lead:', leadData.company);

  try {
    const transporter = createTransporter();

    // Verificar la conexión primero
    await transporter.verify();
    console.log('Conexión SMTP verificada correctamente');

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
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend funcionando correctamente!',
    timestamp: new Date().toISOString(),
    environment: {
      zohoUser: process.env.ZOHO_USER ? 'Configurado' : 'No configurado',
      zohoPass: process.env.ZOHO_PASS ? 'Configurado' : 'No configurado',
      toEmail: process.env.TO_EMAIL || 'No configurado'
    }
  });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment variables:');
  console.log('ZOHO_USER:', process.env.ZOHO_USER ? 'Configurado ✓' : 'No configurado ✗');
  console.log('ZOHO_PASS:', process.env.ZOHO_PASS ? 'Configurado ✓' : 'No configurado ✗');
  console.log('TO_EMAIL:', process.env.TO_EMAIL || 'Usando ZOHO_USER por defecto');
});