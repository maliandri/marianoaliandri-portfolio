// Netlify Function para publicar en redes sociales via Make.com
// Actúa como proxy para evitar problemas de CORS

export async function handler(event) {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const aiProvider = data.aiProvider || 'groq';

    // Webhooks de Make.com
    const webhooks = {
      gemini: 'https://hook.us2.make.com/bjiutspm6dl2nai4ty3p77b6ml1ml1xl',
      groq: 'https://hook.us2.make.com/jhzkug127k9nfq1vcb623gj1s0ns27xk'
    };

    const webhookURL = webhooks[aiProvider];

    if (!webhookURL) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid AI provider' })
      };
    }

    console.log(`🤖 Usando AI: ${aiProvider.toUpperCase()}`);
    console.log(`📡 Webhook: ${webhookURL}`);

    // Enviar datos a Make.com
    const response = await fetch(webhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Make.com webhook failed: ${response.status}`);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        message: 'Publicación enviada correctamente'
      })
    };

  } catch (error) {
    console.error('❌ Error en publish-social:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}
