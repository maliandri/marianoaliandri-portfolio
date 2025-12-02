// Netlify Function para el chatbot con Gemini AI
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async (req, context) => {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { message, conversationHistory = [] } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar que la API key esté configurada
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY no está configurada');
      return new Response(JSON.stringify({
        error: 'API key no configurada',
        response: 'El chatbot no está disponible temporalmente. Por favor, contactame por WhatsApp al +54 299 541-4422 o por email a marianoaliandri@gmail.com'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Inicializar el modelo
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Construir el contexto del chat
    const systemPrompt = `Sos el asistente virtual de Mariano Aliandri, un Desarrollador Full Stack y Analista de Datos especializado en:
- React, Next.js, JavaScript/TypeScript
- Python, análisis de datos
- Power BI, Excel avanzado, Business Intelligence
- Consultoría en inteligencia empresarial

Tu trabajo es ayudar a potenciales clientes respondiendo preguntas sobre los servicios de Mariano de manera amigable y profesional.

Información de contacto:
- WhatsApp: +54 299 541-4422
- Email: marianoaliandri@gmail.com
- LinkedIn: linkedin.com/in/mariano-aliandri-816b4024/

Si un cliente quiere contacto directo, pedí sus datos (nombre, email, teléfono, mensaje) y confirma que se los enviarás a Mariano.`;

    // Construir el prompt con contexto del sistema
    let fullMessage = message;

    // Si es la primera interacción (historial vacío), agregar contexto del sistema
    if (conversationHistory.length === 0) {
      fullMessage = `${systemPrompt}\n\nUsuario: ${message}`;
    }

    // Construir el historial de conversación
    // IMPORTANTE: El historial DEBE empezar con rol 'user'
    let chatHistory = conversationHistory.map(msg => ({
      role: msg.role,
      parts: msg.parts
    }));

    // Si el primer mensaje es del modelo, removerlo
    while (chatHistory.length > 0 && chatHistory[0].role === 'model') {
      chatHistory.shift();
    }

    // Iniciar chat con el historial
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
      },
    });

    // Enviar el mensaje
    const result = await chat.sendMessage(fullMessage);
    const response = result.response.text();

    return new Response(JSON.stringify({
      success: true,
      response: response
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error en chat function:', error);
    return new Response(JSON.stringify({
      error: 'Error al procesar el mensaje',
      response: 'Disculpá, estoy teniendo un problema de conexión. Por favor, contactame por WhatsApp al +54 299 541-4422 o por email a marianoaliandri@gmail.com',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
