const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configuración de CORS para permitir requests desde tu dominio
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

exports.handler = async (event, context) => {
  // Manejar preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Solo aceptar POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Obtener la API key desde variables de entorno
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY no está configurada");
    }

    // Parsear el body del request
    const { message, conversationHistory } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Mensaje requerido" }),
      };
    }

    // Inicializar Gemini 2.5 Flash (más rápido y eficiente)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Contexto del sistema para Gemini
    const systemContext = `Eres el asistente virtual de Mariano Aliandri, un desarrollador Full Stack y Analista de Datos especializado en:

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
- NO inventes información que no esté en este contexto`;

    // Construir el historial de conversación para Gemini
    let fullPrompt = systemContext + "\n\n";

    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        fullPrompt += `${msg.isBot ? 'Asistente' : 'Usuario'}: ${msg.text}\n`;
      });
    }

    fullPrompt += `Usuario: ${message}\nAsistente:`;

    // Generar respuesta con Gemini
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: text,
        timestamp: new Date().toISOString(),
      }),
    };

  } catch (error) {
    console.error("Error en función chat:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Error al procesar el mensaje",
        details: error.message,
      }),
    };
  }
};
