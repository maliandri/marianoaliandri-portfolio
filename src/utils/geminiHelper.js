export const initializeChat = () => {
  console.log("🔌 Chat de Mariano conectado al servidor seguro.");
};

export const sendMessageToGemini = async (userMessage, currentHistory = []) => {
  try {
    // ✅ Verificar que currentHistory sea un array antes de usar .map()
    const formattedHistory = Array.isArray(currentHistory)
      ? currentHistory.map(msg => ({
          role: msg.isBot ? 'model' : 'user',
          parts: [{ text: msg.text }]
        }))
      : [];

    // 🔧 DETECCIÓN DE ENTORNO
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

    if (!isProduction) {
      // ⚠️ DESARROLLO LOCAL: Simular respuesta (sin API key expuesta)
      console.warn('⚠️ Modo desarrollo: Usando respuestas simuladas');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay de red

      return `Hola! 👋 Soy el asistente de Mariano (modo desarrollo).

En producción me conecto a Gemini AI para darte respuestas inteligentes sobre:
- Análisis de Datos y Power BI
- Desarrollo Web Full Stack
- Consultoría en Business Intelligence
- Python, Excel, automatización

Para probar en local con Gemini real, usá:
\`\`\`
netlify dev
\`\`\`

¿En qué puedo ayudarte hoy?`;
    }

    // ✅ PRODUCCIÓN: Usar Netlify Function
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        conversationHistory: formattedHistory
      })
    });

    if (!response.ok) {
      throw new Error(`Error servidor: ${response.status}`);
    }

    const data = await response.json();
    return data.response;

  } catch (error) {
    console.error('❌ Error comunicando con Gemini:', error);
    return "Disculpá, estoy teniendo un breve problema de conexión. ¿Podrías repetir tu consulta en unos instantes?";
  }
};
