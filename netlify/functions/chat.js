// Configuración de CORS para permitir requests desde tu dominio
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

export const handler = async (event) => {
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

    // Construir el historial de conversación
    let historyText = '';

    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      try {
        historyText = conversationHistory
          .map(msg => {
            const role = msg.role === 'user' ? 'Usuario' : 'Asistente';
            const text = msg.parts && msg.parts[0] && msg.parts[0].text ? msg.parts[0].text : '';
            return `${role}: ${text}`;
          })
          .filter(line => line.trim().length > 0)
          .join('\n');
      } catch (historyError) {
        console.warn("⚠️ Error procesando historial, continuando sin él:", historyError);
        historyText = '';
      }
    }

    // Construir el prompt completo
    const fullPrompt = `${systemContext}

${historyText ? `HISTORIAL DE CONVERSACIÓN:\n${historyText}\n` : ''}
NUEVO MENSAJE DEL USUARIO:
${message}

RESPUESTA DEL ASISTENTE:`;

    // Llamar directamente a la API REST de Gemini
    console.log("📤 Enviando prompt a Gemini API REST...");
    console.log("📝 Longitud del prompt:", fullPrompt.length, "caracteres");

    // Usar la API v1 directamente
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Error de Gemini API:", errorData);
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    // Extraer el texto de la respuesta
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, no pude generar una respuesta.";

    console.log("✅ Respuesta recibida de Gemini");
    console.log("📏 Longitud respuesta:", text.length, "caracteres");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: text,
        timestamp: new Date().toISOString(),
      }),
    };

  } catch (error) {
    console.error("❌ Error en función chat:", error);
    console.error("📋 Tipo de error:", error.constructor.name);
    console.error("💬 Mensaje:", error.message);
    console.error("📚 Stack trace:", error.stack);

    // Determinar tipo de error para mejor mensaje
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
      headers,
      body: JSON.stringify({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
