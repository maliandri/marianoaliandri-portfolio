// backend/index.js — Backend limpio + OG share + ATS + BCRA/Stocks
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

/* =======================
   BCRA + STOCKS (NUEVO)
   ======================= */

// fetch (Node <18) fallback a node-fetch
const fetch = global.fetch || ((...a) => import('node-fetch').then(({ default: f }) => f(...a)));

// Cache en memoria simple
const CACHE = new Map();
function cachedFetch(key, fetcher, ttlMs = 10 * 60 * 1000) {
  const now = Date.now();
  const hit = CACHE.get(key);
  if (hit && (now - hit.t) < ttlMs) return Promise.resolve(hit.v);
  return Promise.resolve(fetcher()).then(v => {
    CACHE.set(key, { t: now, v });
    return v;
  });
}

// Base de BCRA v3.0 (Monetarias)
const BCRA_BASE = 'https://api.bcra.gob.ar/estadisticas/v3.0';

// Lista de variables monetarias
app.get('/api/bcra/monetarias', async (req, res) => {
  try {
    const data = await cachedFetch('bcra_monetarias_list', async () => {
      const r = await fetch(`${BCRA_BASE}/Monetarias`);
      if (!r.ok) throw new Error(`BCRA Monetarias ${r.status}`);
      return r.json();
    }, 10 * 60 * 1000);
    res.json(data);
  } catch (e) {
    console.error('BCRA monetarias error:', e);
    res.status(502).json({ error: 'BCRA Monetarias no disponible' });
  }
});

// Serie por idVariable con ?desde&hasta&limit&offset
app.get('/api/bcra/monetarias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const u = new URL(`${BCRA_BASE}/Monetarias/${id}`);
    for (const k of ['desde','hasta','limit','offset']) {
      if (req.query[k]) u.searchParams.set(k, req.query[k]);
    }
    const cacheKey = `bcra_monetarias_${id}_${u.search}`;
    const data = await cachedFetch(cacheKey, async () => {
      const r = await fetch(u);
      if (!r.ok) throw new Error(`BCRA Serie ${r.status}`);
      return r.json();
    }, 5 * 60 * 1000);
    res.json(data);
  } catch (e) {
    console.error('BCRA serie error:', e);
    res.status(502).json({ error: 'Serie BCRA no disponible' });
  }
});

// Stocks (Yahoo Finance chart v8; no oficial)
app.get('/api/stocks/chart', async (req, res) => {
  const symbol = (req.query.symbol || '^MERV').toString();
  const range = (req.query.range || '6mo').toString();     // 1mo,3mo,6mo,1y,5y,max
  const interval = (req.query.interval || '1d').toString(); // 1d,1wk,1mo

  const key = `yf_${symbol}_${range}_${interval}`;
  try {
    const payload = await cachedFetch(key, async () => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
      if (!r.ok) throw new Error(`Yahoo Finance ${r.status}`);
      const j = await r.json();
      const result = j?.chart?.result?.[0] || {};
      const ts = result.timestamp || [];
      const closes = result.indicators?.quote?.[0]?.close || [];
      const points = ts.map((t,i)=>({ date: new Date(t*1000).toISOString().slice(0,10), close: closes[i] ?? null }));
      return { symbol, range, interval, last: points.at(-1)?.close ?? null, points };
    }, 5 * 60 * 1000);
    res.json(payload);
  } catch (e) {
    console.error('Stocks error:', e);
    res.status(502).json({ error: 'Mercado no disponible' });
  }
});

/* =======================
   FIN BCRA + STOCKS
   ======================= */

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
