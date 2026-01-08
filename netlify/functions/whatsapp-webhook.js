// netlify/functions/whatsapp-webhook.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const twilio = require('twilio');

// Contexto del asistente de Mariano, extraído de chat.js para consistencia.
const MARIANO_CONTEXT = `
Sos el asistente comercial profesional de Mariano Aliandri. Tu objetivo es calificar leads y generar la confianza necesaria para que el cliente desee ser contactado por Mariano personalmente.

TU PERSONALIDAD PROFESIONAL:
- **Consultor Experto:** No solo respondés preguntas, entendés el problema de fondo del cliente.
- **Empatía Empresarial:** Comprendés que contratar servicios de desarrollo o análisis de datos es una inversión importante.
- **Proactivo pero Natural:** Guiás la conversación hacia el cierre sin presionar.
- **Lenguaje Profesional Argentino:** Usás "vos" (sos, tenés, querés) pero manteniendo total profesionalismo.

SERVICIOS DE MARIANO (Para recomendar según necesidad):
- **DESARROLLO WEB & APLICACIONES:** Sitios y apps a medida (React, Next.js, Node.js).
- **ANÁLISIS DE DATOS & BI:** Dashboards en Power BI, reportes automáticos, KPIs.
- **PYTHON & AUTOMATIZACIÓN:** Web scraping, scripts, integración de APIs.
- **CONSULTORÍA:** Auditoría, diseño de arquitectura, definición de KPIs.

ESTRATEGIA DE CONVERSACIÓN:
1. **ENTENDER:** Hacé preguntas para entender el desafío del cliente.
2. **CUALIFICAR:** Conectá su necesidad con un servicio específico de Mariano, mostrando beneficios.
3. **CIERRE:** Cuando muestren interés, ofrecé una consulta inicial gratuita y pedí nombre, email y teléfono para que Mariano los contacte.

REGLAS DE ORO:
- Siempre terminá con una pregunta para mantener la conversación viva.
- Si preguntan precios: "Los precios varían según el proyecto. En una consulta inicial gratuita, Mariano evalúa tu caso y te da un presupuesto a medida. ¿Coordinamos esa llamada?".
`;

// Inicializar clientes de API. Las credenciales deben estar en las variables de entorno de Netlify.
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed', headers: { 'Allow': 'POST' } };
  }

  try {
    // Validar que las variables de entorno están cargadas.
    if (!accountSid || !authToken || !process.env.GEMINI_API_KEY) {
      console.error('Error: Faltan variables de entorno (TWILIO y/o GEMINI).');
      // No se puede enviar respuesta por Twilio si falta la config.
      return { statusCode: 500, body: 'Internal Server Error: Missing configuration' };
    }

    // 1. --- PARSEAR EL MENSAJE ENTRANTE DE TWILIO ---
    const params = new URLSearchParams(event.body);
    const incomingMsg = params.get('Body');
    const from = params.get('From'); // Número del usuario
    const to = params.get('To');     // Tu número de Twilio

    if (!incomingMsg || !from) {
      console.warn('Webhook recibido sin mensaje o remitente.');
      return { statusCode: 400, body: 'Bad Request: Missing message body or sender.'};
    }
     
    console.log(`Mensaje recibido de ${from}: "${incomingMsg}"`);

    // 2. --- GENERAR RESPUESTA CON GEMINI AI ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const history = [
      { role: "user", parts: [{ text: MARIANO_CONTEXT }] },
      { role: "model", parts: [{ text: "Comprendido. Soy el asistente virtual de Mariano Aliandri. ¿En qué puedo ayudarte hoy?" }] }
    ];
    
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(incomingMsg);
    const aiResponse = await result.response.text();

    // 3. --- ENVIAR RESPUESTA VÍA WHATSAPP CON TWILIO ---
    await twilioClient.messages.create({
      body: aiResponse,
      from: to,   // Tu número de Twilio
      to: from    // El número del usuario
    });
   
    console.log(`Respuesta de IA enviada a ${from}: "${aiResponse}"`);

    // 4. --- RESPONDER A TWILIO ---
    // Twilio espera una respuesta vacía con código 204 para confirmar la recepción.
    return {
      statusCode: 204
    };

  } catch (error) {
    console.error('Error en el webhook de WhatsApp:', error);
    // Si ocurre un error, es útil registrarlo pero Twilio no necesita un body.
    // Enviar un error 500 puede hacer que Twilio reintente el webhook, lo cual no queremos.
    // Devolvemos 204 para evitar reintentos, aunque haya habido un error procesando.
    return {
      statusCode: 204
    };
  }
};
