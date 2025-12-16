// netlify/functions/instagram-webhook.js
// Webhook para recibir mensajes de Instagram y responder con IA
import crypto from 'crypto';
import admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar Firebase Admin (solo una vez)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

// Contexto adaptado para Instagram
const MARIANO_CONTEXT_INSTAGRAM = `
Sos el asistente comercial profesional de Mariano Aliandri. Tu objetivo es calificar leads y generar la confianza necesaria para que el cliente desee ser contactado por Mariano personalmente.

TU PERSONALIDAD PROFESIONAL:
- **Consultor Experto:** No solo respondés preguntas, entendés el problema de fondo del cliente.
- **Empatía Empresarial:** Comprendés que contratar servicios de desarrollo o análisis de datos es una inversión importante.
- **Proactivo pero Natural:** Guiás la conversación hacia el cierre sin presionar.
- **Lenguaje Profesional Argentino:** Usás "vos" (sos, tenés, querés) pero manteniendo total profesionalismo.

SERVICIOS DE MARIANO (Para recomendar según necesidad):

**DESARROLLO WEB & APLICACIONES:**
- Sitios web corporativos modernos (React, Next.js)
- Aplicaciones web personalizadas
- E-commerce y plataformas de venta online
- Automatización de procesos con web apps
- Stack: React, Next.js, Node.js, TypeScript

**ANÁLISIS DE DATOS & BI:**
- Dashboards ejecutivos en Power BI
- Reportes automatizados y KPIs
- Análisis predictivo y forecasting
- Consultoría en Business Intelligence
- Excel avanzado con Power Query y Power Pivot

**PYTHON & AUTOMATIZACIÓN:**
- Web scraping para recolección de datos
- Automatización de procesos repetitivos
- Scripts de análisis de datos
- Integración de APIs
- ETL y procesamiento de datos

**CONSULTORÍA:**
- Auditoría de procesos y datos actuales
- Diseño de arquitectura de soluciones
- Definición de KPIs y métricas
- Capacitación de equipos

IMPORTANTE - FORMATO INSTAGRAM:
- Respuestas CORTAS (máx 700 caracteres por mensaje)
- Usa emojis estratégicamente 💡 📊 🚀
- Si necesitas explicar mucho, ofrece agendar llamada o seguir por WhatsApp
- Respuestas rápidas: usa bullets en vez de párrafos
- Prioriza captura de contacto sobre explicaciones técnicas largas

ESTRATEGIA DE CONVERSACIÓN (Embudo Consultivo):

1. **FASE DE APERTURA - Entender la necesidad:**
   - Si preguntan por un servicio específico, mostrá interés genuino
   - Hacé preguntas inteligentes pero breves

2. **FASE DE CUALIFICACIÓN - Identificar el proyecto:**
   - Conectá su necesidad con la solución de Mariano
   - Destacá beneficios tangibles en 1-2 líneas

3. **FASE DE CIERRE - Solicitar datos de contacto:**
   - Cuando el cliente muestra interés, ofrecé consulta inicial gratuita
   - SIEMPRE pedí: nombre, email, teléfono/WhatsApp
   - Ejemplo breve:
     "Perfecto! 🎯 Mariano ofrece una consulta inicial gratuita de 30 min para entender tu proyecto.

     ¿Me compartís:
     • Nombre
     • Email
     • WhatsApp

     Te contacta en 24hs! 📱"

REGLAS DE ORO INSTAGRAM:
- Mensajes cortos y directos
- Si la respuesta necesita +700 caracteres, ofrece WhatsApp
- Usa emojis para ser visual (no exageres)
- Cierre Natural: No pidas datos hasta que haya interés real
- Menciona la consulta gratuita como gancho
- Si detectas email/teléfono en el mensaje, confirmalo

FORMATO AL CAPTURAR LEAD:
"¡Excelente! 🙌 Para que Mariano prepare la mejor propuesta para tu proyecto de [PROYECTO], necesito:
• Nombre completo
• Email
• WhatsApp

Mariano se comunica en 24hs para coordinar la consulta gratuita. ¿Ok?"
`;

// Validar firma HMAC de Meta
function validateSignature(payload, signature) {
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', process.env.INSTAGRAM_APP_SECRET)
    .update(payload)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// Enviar mensaje a Instagram
async function sendInstagramMessage(recipientId, message) {
  const url = 'https://graph.instagram.com/v21.0/me/messages';

  // Split de mensajes largos
  const messages = message.length > 800 ? splitMessage(message) : [message];

  for (const msg of messages) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INSTAGRAM_PAGE_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: msg }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[Instagram Send Error]', error);
        throw new Error(`Instagram API Error: ${error.error?.message || 'Unknown'}`);
      }

      // Pequeña pausa entre mensajes múltiples
      if (messages.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('[Instagram Send Failed]', error);
      throw error;
    }
  }
}

// Split de mensajes largos
function splitMessage(text) {
  const maxLength = 800;
  const messages = [];
  let currentMsg = '';

  const lines = text.split('\n');

  for (const line of lines) {
    if ((currentMsg + line + '\n').length > maxLength) {
      if (currentMsg) messages.push(currentMsg.trim());
      currentMsg = line + '\n';
    } else {
      currentMsg += line + '\n';
    }
  }

  if (currentMsg) messages.push(currentMsg.trim());

  return messages;
}

// Cargar historial de conversación
async function getConversationHistory(igId) {
  try {
    const messagesRef = db
      .collection('instagram_conversations')
      .doc(igId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(10);

    const snapshot = await messagesRef.get();
    const messages = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      messages.push({
        role: data.isBot ? 'model' : 'user',
        parts: [{ text: data.text }]
      });
    });

    return messages.reverse(); // Oldest first para Gemini
  } catch (error) {
    console.error('[Firestore History Error]', error);
    return [];
  }
}

// Guardar mensaje en Firestore
async function saveMessage(igId, username, text, isBot) {
  try {
    await db
      .collection('instagram_conversations')
      .doc(igId)
      .collection('messages')
      .add({
        text,
        isBot,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        username
      });

    // Actualizar metadata de conversación
    await db.collection('instagram_conversations').doc(igId).set({
      username,
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessage: text.substring(0, 100)
    }, { merge: true });
  } catch (error) {
    console.error('[Firestore Save Error]', error);
  }
}

// Detectar lead
function detectLead(message, history) {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const phoneRegex = /(\+?54\s?9?\s?)?(\d{2,4}[\s-]?\d{6,8}|\d{10,})/g;

  const email = message.match(emailRegex)?.[0] || null;
  const phone = message.match(phoneRegex)?.[0] || null;

  // Detectar intención de contacto
  const intentPatterns = [
    /quiero.*contacto/i,
    /c[oó]mo.*comunic/i,
    /necesito.*presupuesto/i,
    /me.*interesa/i,
    /coordin.*llamada/i,
    /hablamos/i
  ];

  const hasIntent = intentPatterns.some(p => p.test(message));

  return {
    isLead: !!(email || phone || hasIntent),
    email,
    phone,
    hasIntent
  };
}

// Guardar lead
async function saveLead(igId, username, leadData, conversationHistory) {
  try {
    await db.collection('instagram_leads').add({
      igId,
      username,
      email: leadData.email,
      phone: leadData.phone,
      capturedAt: admin.firestore.FieldValue.serverTimestamp(),
      leadSource: 'instagram_dm',
      status: 'new',
      conversationHistory: conversationHistory.slice(-5).map(msg => ({
        role: msg.role,
        text: msg.parts[0].text
      }))
    });

    console.log('[Lead Captured]', { igId, username, email: leadData.email });
  } catch (error) {
    console.error('[Lead Save Error]', error);
  }
}

// Procesar mensaje con Gemini AI
async function processWithAI(userMessage, history) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: MARIANO_CONTEXT_INSTAGRAM
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userMessage);

    return result.response.text();
  } catch (error) {
    console.error('[Gemini AI Error]', error);
    return '¡Hola! 👋 Gracias por contactarte. Estoy teniendo problemas técnicos temporales. ¿Podrías escribirme por WhatsApp al +54 299 541 4422? Mariano te atiende al instante. ¡Gracias!';
  }
}

// Procesar mensaje asíncronamente
async function processMessageAsync(senderId, username, messageText) {
  try {
    // Guardar mensaje del usuario
    await saveMessage(senderId, username, messageText, false);

    // Cargar historial
    const history = await getConversationHistory(senderId);

    // Detectar lead
    const leadInfo = detectLead(messageText, history);

    // Procesar con IA
    const aiResponse = await processWithAI(messageText, history);

    // Guardar respuesta del bot
    await saveMessage(senderId, username, aiResponse, true);

    // Enviar respuesta a Instagram
    await sendInstagramMessage(senderId, aiResponse);

    // Si es lead, guardar
    if (leadInfo.isLead) {
      await saveLead(senderId, username, leadInfo, history);
    }

    console.log('[Message Processed]', { senderId, username, isLead: leadInfo.isLead });
  } catch (error) {
    console.error('[Process Error]', error);

    // Mensaje de fallback
    try {
      await sendInstagramMessage(
        senderId,
        '¡Hola! 👋 Gracias por contactarte. Tengo un problema técnico temporal. ' +
        'Escribile a Mariano por WhatsApp: +54 299 541 4422 🚀'
      );
    } catch (sendError) {
      console.error('[Fallback Send Error]', sendError);
    }
  }
}

// Handler principal
export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Hub-Signature-256',
    'Content-Type': 'application/json'
  };

  // OPTIONS request (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // GET: Verificación de webhook de Meta
  if (event.httpMethod === 'GET') {
    const mode = event.queryStringParameters?.['hub.mode'];
    const token = event.queryStringParameters?.['hub.verify_token'];
    const challenge = event.queryStringParameters?.['hub.challenge'];

    console.log('[Webhook Verification]', { mode, token: token?.substring(0, 10) });

    if (mode === 'subscribe' && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
      console.log('[Webhook Verified] ✅');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: challenge
      };
    }

    console.error('[Webhook Verification Failed] ❌');
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Verification failed' }) };
  }

  // POST: Recibir mensajes
  if (event.httpMethod === 'POST') {
    try {
      // Validar firma HMAC
      const signature = event.headers['x-hub-signature-256'] || event.headers['X-Hub-Signature-256'];

      if (!signature || !validateSignature(event.body, signature)) {
        console.error('[Invalid Signature] ❌');
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Invalid signature' }) };
      }

      const data = JSON.parse(event.body);

      // Verificar que es un mensaje
      if (data.object !== 'instagram') {
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ignored' }) };
      }

      // Procesar cada entrada
      for (const entry of data.entry || []) {
        for (const messaging of entry.messaging || []) {
          if (messaging.message && messaging.message.text) {
            const senderId = messaging.sender.id;
            const messageText = messaging.message.text;
            const username = messaging.sender.username || `user_${senderId.substring(0, 8)}`;

            console.log('[Message Received]', {
              senderId,
              username,
              messageLength: messageText.length
            });

            // Procesar asíncronamente (NO esperar)
            processMessageAsync(senderId, username, messageText).catch(err => {
              console.error('[Async Process Error]', err);
            });
          }
        }
      }

      // Responder inmediatamente a Meta (requerido)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'EVENT_RECEIVED' })
      };

    } catch (error) {
      console.error('[Webhook Error]', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Internal error' })
      };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};
