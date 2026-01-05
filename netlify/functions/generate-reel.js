// Netlify Function para generar videos con Shotstack
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { imageUrl, productName, price } = JSON.parse(event.body);

    if (!imageUrl || !productName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'imageUrl and productName are required' })
      };
    }

    const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY;

    if (!SHOTSTACK_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Shotstack API key not configured' })
      };
    }

    // Debug: verificar que la key existe (sin mostrar el valor completo por seguridad)
    console.log('🔑 API Key presente:', SHOTSTACK_API_KEY ? `Sí (${SHOTSTACK_API_KEY.substring(0, 8)}...)` : 'No');

    // Configurar el video con Shotstack
    const videoConfig = {
      timeline: {
        background: '#000000',
        tracks: [
          {
            clips: [
              {
                asset: {
                  type: 'image',
                  src: imageUrl
                },
                start: 0,
                length: 10, // 10 segundos
                fit: 'cover',
                scale: 1.1, // Efecto de zoom suave
                transition: {
                  in: 'fade',
                  out: 'fade'
                }
              }
            ]
          },
          {
            clips: [
              {
                asset: {
                  type: 'title',
                  text: productName,
                  style: 'future',
                  color: '#ffffff',
                  size: 'medium',
                  background: 'rgba(0,0,0,0.5)',
                  position: 'top'
                },
                start: 0,
                length: 10
              }
            ]
          },
          {
            clips: [
              {
                asset: {
                  type: 'title',
                  text: price || '',
                  style: 'blockbuster',
                  color: '#00ff00',
                  size: 'small',
                  background: 'rgba(0,0,0,0.7)',
                  position: 'bottom'
                },
                start: 0,
                length: 10
              }
            ]
          }
        ]
      },
      output: {
        format: 'mp4',
        resolution: 'hd', // 1080p
        aspectRatio: '9:16', // Vertical para reels
        size: {
          width: 1080,
          height: 1920
        },
        fps: 30,
        quality: 'high'
      }
    };

    console.log('🎬 Solicitando generación de video a Shotstack...');
    console.log('📋 Config:', JSON.stringify(videoConfig, null, 2));

    // Enviar request a Shotstack para generar el video
    const response = await fetch('https://api.shotstack.io/stage/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SHOTSTACK_API_KEY
      },
      body: JSON.stringify(videoConfig)
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error de Shotstack (status ' + response.status + '):', error);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: 'Failed to generate video',
          details: error,
          shotstackStatus: response.status
        })
      };
    }

    const result = await response.json();

    console.log('✅ Video solicitado. ID:', result.response.id);

    // El video tarda ~30 segundos en generarse
    // Retornamos el ID para que el cliente pueda consultar el estado
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        renderId: result.response.id,
        message: 'Video generation started',
        // URL para consultar el estado del render
        statusUrl: `https://api.shotstack.io/stage/render/${result.response.id}`
      })
    };

  } catch (error) {
    console.error('❌ Error en generate-reel:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
