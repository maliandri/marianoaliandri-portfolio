import { GoogleGenerativeAI } from "@google/generative-ai";

// Configuración de CORS para permitir requests desde tu dominio
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

export const handler = async (event, context) => {
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
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY no está configurada en las variables de entorno");
      throw new Error("GEMINI_API_KEY no está configurada");
    }

    const { message, conversationHistory } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Mensaje requerido" }),
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

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

    const contents = [];

    // Priming the model with the system context
    contents.push({ role: "user", parts: [{ text: systemContext }] });
    contents.push({ role: "model", parts: [{ text: "Entendido. Soy el asistente virtual de Mariano Aliandri, listo para ayudar." }] });

    // Add existing conversation history (assuming it's already formatted correctly by the client)
    if (conversationHistory && conversationHistory.length > 0) {
      contents.push(...conversationHistory);
    }

    // Add the new user message
    contents.push({ role: "user", parts: [{ text: message }] });

    // Generate response with Gemini
    console.log("📤 Enviando prompt a Gemini con generateContent...");
    const result = await model.generateContent({ contents });
    const response = await result.response;
    const text = response.text();
    console.log("✅ Respuesta recibida de Gemini");

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
    console.error("Stack trace:", error.stack);

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
