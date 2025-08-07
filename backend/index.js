const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors()); // Habilita CORS para que tu frontend pueda hacer peticiones

// Endpoint para enviar el Web lead
app.post('/api/send-web-lead', async (req, res) => {
  const leadData = req.body;
  console.log('Recibida petición para Web lead:', leadData.company);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST,
      port: process.env.ZOHO_SMTP_PORT,
      secure: process.env.ZOHO_SMTP_SECURE === 'true',
      auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: process.env.ZOHO_USER,
      to: process.env.TO_EMAIL,
      subject: `Nuevo Lead de Desarrollo Web: ${leadData.company}`,
      html: `
        <h2>¡Nuevo Lead de Desarrollo Web!</h2>
        <p><strong>De:</strong> ${leadData.company}</p>
        <p><strong>Email:</strong> ${leadData.email}</p>
        <p><strong>Teléfono:</strong> ${leadData.phone || 'No especificado'}</p>
        <p><strong>Presupuesto:</strong> $${leadData.budget}</p>
        <p><strong>ROI Estimado:</strong> ${leadData.calculatedResults.estimatedROI}%</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email enviado correctamente.');
    res.status(200).json({ message: 'Email sent successfully!' });

  } catch (error) {
    console.error('Error enviando correo:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});