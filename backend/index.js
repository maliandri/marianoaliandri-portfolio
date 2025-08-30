// backend/index.js — Backend limpio + OG share + ATS
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

// === ATS: dependencias para subir/leer CV y matchear skills
const path = require('path');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const upload = multer({ storage: multer.memoryStorage() }); // no guardamos archivos en disco

// utils ATS (creá los archivos utils/atsKeywords.cjs y utils/textUtils.cjs como te pasé)
const { loadAtsDictionary, rankProfessionsForText } = require('./utils/atsKeywords.cjs');

const app = express();
const PORT = process.env.PORT || 4000;

// URLs públicas (Render / Front)
const BACKEND_URL = (process.env.BACKEND_URL || '').trim().replace(/\/+$/, '');
const FRONTEND_URL = (process.env.FRONTEND_URL || '').trim().replace(/\/+$/, '');

// ===== CORS
const allowedOrigins = [
  'https://marianoaliandri.netlify.app',
  'https://marianoaliandri.com.ar',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4000',
  'http://localhost:4173'
];
app.use(cors({
  origin: (origin, cb) => (!origin || allowedOrigins.includes(origin)) ? cb(null, true) : cb(new Error('No permitido por CORS')),
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Origin','X-Requested-With','Content-Type','Accept','Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ===== Mail
if (!process.env.ZOHO_USER || !process.env.ZOHO_PASS) {
  console.error('❌ FALTAN CREDENCIALES DE EMAIL: ZOHO_USER y ZOHO_PASS');
}
const createTransporter = () => nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 587,
  secure: false,
  auth: { user: process.env.ZOHO_USER, pass: process.env.ZOHO_PASS },
  tls: { rejectUnauthorized: false }
});

// Helpers
const fmtARS = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(n || 0));
const escapeHtml = (s="") => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

// ====== Email endpoints
app.post('/api/send-roi-lead', async (req, res) => {
  const leadData = req.body;
  if (!leadData.email || !leadData.company || !leadData.calculatedROI) return res.status(400).json({ success:false, error:'Faltan datos requeridos: email, company, calculatedROI' });
  if (!process.env.ZOHO_USER || !process.env.ZOHO_PASS) return res.status(500).json({ success:false, error:'Configuración de email no disponible' });

  try {
    const transporter = createTransporter();
    const { company, email, phone, calculatedROI } = leadData;
    await transporter.sendMail({
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
      `
    });
    res.json({ success:true, message:'Email enviado correctamente' });
  } catch (e) {
    console.error('❌ Error enviando ROI:', e);
    res.status(500).json({ success:false, error:'Error al enviar el email' });
  }
});

app.post('/api/send-web-lead', async (req, res) => {
  const leadData = req.body;
  if (!leadData.email || !leadData.company || !leadData.calculatedResults) return res.status(400).json({ success:false, error:'Faltan datos requeridos: email, company, calculatedResults' });
  if (!process.env.ZOHO_USER || !process.env.ZOHO_PASS) return res.status(500).json({ success:false, error:'Configuración de email no disponible' });

  try {
    const transporter = createTransporter();
    const { company, email, calculatedResults } = leadData;
    await transporter.sendMail({
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
      `
    });
    res.json({ success:true, message:'Email enviado correctamente' });
  } catch (e) {
    console.error('❌ Error enviando WEB:', e);
    res.status(500).json({ success:false, error:'Error al enviar el email' });
  }
});

// ====== Página de Share para LinkedIn (OG tags dinámicas)
app.get('/share/web-proposal', (req, res) => {
  const c   = escapeHtml(req.query.c || 'Proyecto Web');
  const usd = Number(req.query.usd || 0);
  const ars = Number(req.query.ars || 0);
  const roi = Number(req.query.roi || 0);
  const w   = Number(req.query.w || 0);

  const fmtUSD = new Intl.NumberFormat('en-US',{ style:'currency', currency:'USD', maximumFractionDigits:0 }).format(usd || 0);
  const fmtARSs = ars ? new Intl.NumberFormat('es-AR',{ style:'currency', currency:'ARS', maximumFractionDigits:0 }).format(ars) : '';
  const title  = `Propuesta Web para ${c}`;
  const desc   = `Costo estimado ${fmtUSD}${fmtARSs ? ` (~ ${fmtARSs})` : ''} · ROI ${roi}% · ${w} semanas`;

  const pageUrl = `${BACKEND_URL || ''}/share/web-proposal?` + new URLSearchParams({
    c, usd:String(usd||0), ars:String(ars||0), roi:String(roi||0), w:String(w||0)
  });

  const ogImage = `${BACKEND_URL || ''}/og-default.png`; // opcional (si la tenés)
  const portfolio = FRONTEND_URL || 'https://marianoaliandri.netlify.app';

  const html = `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><title>${title}</title><meta name="viewport" content="width=device-width, initial-scale=1">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${pageUrl}">
${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ''}
<meta name="robots" content="noindex,nofollow">
<style>
:root{color-scheme:dark}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Arial;
background:#0b1220;color:#e6e9ef;padding:32px}
.card{background:#111a2e;border:1px solid #1f2a44;border-radius:16px;padding:24px;max-width:720px}
.muted{color:#97a3b6}
a{color:#7db6ff}
</style>
</head><body>
  <div class="card">
    <h1>${title}</h1>
    <p>${desc}</p>
    <p class="muted">Vista previa para redes. Hacé clic para ir al portfolio.</p>
    <p><a href="${portfolio}">Visitar mi portfolio →</a></p>
  </div>
  <script>setTimeout(()=>{location.href='${portfolio}'},1200)</script>
</body></html>`;
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.status(200).send(html);
});

// ===== Utilidad
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend funcionando correctamente!',
    timestamp: new Date().toISOString(),
    environment: { zohoUser: process.env.ZOHO_USER ? 'Configurado ✓' : 'No configurado ✗', BACKEND_URL, FRONTEND_URL }
  });
});

// ======== ATS: carga de diccionario (CSV en /data) =========
let ATS_DICT = [];
(async () => {
  try {
    ATS_DICT = await loadAtsDictionary();
    console.log(`📚 ATS_DICT cargado: ${ATS_DICT.length} profesiones`);
  } catch (e) {
    console.error('❌ Error cargando diccionario ATS:', e.message);
  }
})();

// ======== ATS: endpoints =========

// Health extendido con info del ATS
app.get('/api/health', (_, res) => {
  res.json({
    ok: true,
    atsDictSize: ATS_DICT.length,
    timestamp: new Date().toISOString()
  });
});

// Matcheo por texto crudo (sin archivo)
app.post('/api/ats-match', (req, res) => {
  try {
    const { text = '', topN = 5, target } = req.body || {};
    if (!text.trim()) return res.status(400).json({ ok:false, error:'text requerido' });
    if (!ATS_DICT.length) return res.status(503).json({ ok:false, error:'Diccionario ATS no cargado' });

    const ranked = rankProfessionsForText(text, ATS_DICT, { topN: Number(topN) || 5, target });
    res.json({ ok:true, topN: Number(topN)||5, target: target||null, results: ranked });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error:'Error en ats-match' });
  }
});

// Análisis de CV (PDF/DOCX) — no persiste archivos
app.post('/api/analyze-cv', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok:false, error:'Falta archivo "cv"' });
    if (!ATS_DICT.length) return res.status(503).json({ ok:false, error:'Diccionario ATS no cargado' });

    let text = '';
    const name = (req.file.originalname || '').toLowerCase();

    if (name.endsWith('.pdf')) {
      const data = await pdfParse(req.file.buffer);
      text = data.text || '';
    } else if (name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = result.value || '';
    } else {
      return res.status(400).json({ ok:false, error:'Formato no soportado. Use PDF o DOCX.' });
    }

    if (!text.trim()) {
      return res.status(422).json({ ok:false, error:'No se pudo extraer texto. Si es un PDF escaneado, requiere OCR.' });
    }

    const topN = Number(req.body.topN || 5);
    const target = req.body.target || undefined;
    const ranked = rankProfessionsForText(text, ATS_DICT, { topN, target });

    res.json({
      ok:true,
      file: req.file.originalname,
      bytes: req.file.size,
      topN,
      target: target || null,
      results: ranked
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error:'Error procesando CV' });
  }
});

// ===== Errores
app.use((err, req, res, next) => { console.error('❌ Error del servidor:', err); res.status(500).json({ success:false, error:'Error interno del servidor' }); });
app.use((req, res) => { res.status(404).json({ success:false, error:'Ruta no encontrada' }); });

// ===== Start
app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
  console.log('BACKEND_URL:', BACKEND_URL || '(vacío)');
  console.log('FRONTEND_URL:', FRONTEND_URL || '(vacío)');
  console.log('ZOHO_USER:', process.env.ZOHO_USER ? 'Configurado ✓' : 'No configurado ✗');
});
