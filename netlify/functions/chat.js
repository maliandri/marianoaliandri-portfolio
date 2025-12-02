import { GoogleGenerativeAI } from '@google/generative-ai';

// Contexto del asistente de Mariano
const MARIANO_CONTEXT = `
Sos el asistente virtual de Mariano Aliandri, un Desarrollador Full Stack y Analista de Datos especializado en:
- React, Next.js, JavaScript/TypeScript
- Python, análisis de datos
- Power BI, Excel avanzado, Business Intelligence
- Consultoría en inteligencia empresarial

Tu trabajo es ayudar a potenciales clientes respondiendo preguntas sobre los servicios de Mariano de manera amigable y profesional.

Información de contacto:
- WhatsApp: +54 299 541-4422
- Email: marianoaliandri@gmail.com
- LinkedIn: linkedin.com/in/mariano-aliandri-816b4024/

Si un cliente quiere contacto directo, pedí sus datos (nombre, email, teléfono, mensaje) y confirma que se los enviarás a Mariano.
`;

const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: responseHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message, conversationHistory = [] } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers: responseHeaders,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY no está configurada');
      return {
        statusCode: 500,
        headers: responseHeaders,
        body: JSON.stringify({
          error: 'API key no configurada',
          response: 'El chatbot no está disponible temporalmente. Por favor, contactame por WhatsApp al +54 299 541-4422 o por email a marianoaliandri@gmail.com'
        })
      };
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800,
      }
    });

    // Construir historial en formato correcto
    let history = [
      { role: "user", parts: [{ text: MARIANO_CONTEXT }] },
      { role: "model", parts: [{ text: "Comprendido. Soy el asistente virtual de Mariano Aliandri." }] }
    ];

    // Agregar historial de conversación si existe
    if (conversationHistory && conversationHistory.length > 0) {
      const formattedHistory = conversationHistory.map(msg => ({
        role: msg.role,
        parts: msg.parts
      }));
      history = [...history, ...formattedHistory];
    }

    const chat = model.startChat({ history });

    const result = await chat.sendMessage(message);
    const response = await result.response.text();

    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({
        success: true,
        response: response
      })
    };

  } catch (error) {
    console.error('❌ Error en chat function:', error);
    return {
      statusCode: 500,
      headers: responseHeaders,
      body: JSON.stringify({
        error: 'Error al procesar el mensaje',
        response: 'Disculpá, estoy teniendo un problema de conexión. Por favor, contactame por WhatsApp al +54 299 541-4422 o por email a marianoaliandri@gmail.com',
        details: error.message
      })
    };
  }
}
