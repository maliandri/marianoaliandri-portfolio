import { GoogleGenerativeAI } from '@google/generative-ai';

// Contexto del asistente de Mariano Aliandri
const MARIANO_CONTEXT = `Eres el asistente virtual de Mariano Aliandri, un desarrollador Full Stack y Analista de Datos especializado en:

SERVICIOS PRINCIPALES:
- Análisis de Datos con Power BI, Excel avanzado (Power Query, Power Pivot, Macros)
- Desarrollo Web Full Stack (React, Next.js, Node.js, JavaScript/Python)
- Business Intelligence y consultoría en inteligencia empresarial
- Web scraping y automatización con Python
- Dashboards interactivos y visualización de datos
- KPIs estratégicos y optimización de procesos

INFORMACIÓN DE CONTACTO:
- WhatsApp: +54 299 541-4422
- Email: marianoaliandri@gmail.com
- Ubicación: Neuquén, Argentina

PROCESO DE TRABAJO:
1. Consulta inicial gratuita (1 hora)
2. Análisis de necesidades
3. Propuesta detallada con presupuesto
4. Desarrollo e implementación
5. Capacitación y soporte continuo

PRECIOS ORIENTATIVOS:
- Consulta inicial: Gratuita
- Proyectos desde: $500 USD
- Retainer mensual desde: $1,500 USD
- Personalizado según alcance del proyecto

INSTRUCCIONES:
- Sé amigable, profesional y conciso
- Enfócate en cómo Mariano puede resolver problemas de negocio con datos
- Ofrece ejemplos concretos de soluciones
- Invita a agendar una reunión gratuita si el usuario muestra interés
- Si no sabes algo específico, sugiere contactar directamente a Mariano
- Responde en español de manera natural y conversacional
- NO inventes información que no esté en este contexto

CAPTURA DE LEADS:
Cuando el usuario muestre interés genuino (pide más información, quiere ser contactado, solicita cotización, etc.):
1. Pregunta amablemente: "¿Te gustaría que Mariano se comunique contigo? Si querés, puedo pedirte tus datos para que te contacte."
2. Si acepta, pide EXACTAMENTE en este formato:
   "Perfecto! Por favor compartime:
   📧 Tu email:
   📱 Tu teléfono (opcional):
   👤 Tu nombre:"
3. Cuando el usuario proporcione los datos, responde con un JSON ESTRICTO así:
   {"lead": true, "nombre": "Juan Pérez", "email": "juan@example.com", "telefono": "299-123-4567", "interes": "descripción breve del interés"}
4. IMPORTANTE: El JSON debe estar en una línea separada, sin texto adicional antes o después.`;

const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

export async function handler(event) {
  // Handle OPTIONS for CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: responseHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: responseHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { message, conversationHistory = [] } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers: responseHeaders,
        body: JSON.stringify({ error: 'Mensaje requerido' })
      };
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY no configurada');
      throw new Error('Configuración incompleta');
    }

    console.log('📤 Iniciando chat con Gemini...');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    // Convertir historial al formato de Gemini
    const geminiHistory = [];

    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        if (msg.role && msg.parts && msg.parts[0] && msg.parts[0].text) {
          geminiHistory.push({
            role: msg.role,
            parts: [{ text: msg.parts[0].text }]
          });
        }
      });
    }

    // Iniciar chat con contexto e historial
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: MARIANO_CONTEXT }] },
        { role: "model", parts: [{ text: "Entendido. Soy el asistente virtual de Mariano Aliandri, listo para ayudar." }] },
        ...geminiHistory
      ]
    });

    const result = await chat.sendMessage(message);
    const response = await result.response.text();

    console.log('✅ Respuesta recibida de Gemini');
    console.log('📏 Longitud:', response.length, 'caracteres');

    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({
        response: response,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ Error en función chat:', error);
    console.error('📋 Tipo:', error.constructor.name);
    console.error('💬 Mensaje:', error.message);

    let errorMessage = "Error al procesar el mensaje";
    let statusCode = 500;

    if (error.message?.includes("API key")) {
      errorMessage = "Error de configuración: API key no válida";
      statusCode = 503;
    } else if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      errorMessage = "Límite de uso alcanzado, intenta más tarde";
      statusCode = 429;
    } else if (error.message?.includes("blocked") || error.message?.includes("safety")) {
      errorMessage = "Contenido bloqueado por políticas de seguridad";
      statusCode = 400;
    }

    return {
      statusCode,
      headers: responseHeaders,
      body: JSON.stringify({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      })
    };
  }
}
