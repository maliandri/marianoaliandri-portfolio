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

    // Configurar el video con Shotstack (30 segundos con video de fondo y animaciones)
    const videoConfig = {
      timeline: {
        background: '#000000',
        tracks: [
          // Track 1: Video de fondo animado (partículas)
          {
            clips: [
              {
                asset: {
                  type: 'video',
                  src: 'https://shotstack-assets.s3.amazonaws.com/footage/abstract-particles-purple.mp4'
                },
                start: 0,
                length: 30,
                fit: 'crop',
                opacity: 0.4 // Semi-transparente para no opacar el producto
              }
            ]
          },
          // Track 2: Imagen del producto con zoom y rotación
          {
            clips: [
              {
                asset: {
                  type: 'image',
                  src: imageUrl
                },
                start: 0,
                length: 30,
                fit: 'contain',
                scale: 0.7, // Más pequeño para dejar espacio a efectos
                position: 'center',
                offset: {
                  y: 0
                },
                effect: 'zoomIn',
                transition: {
                  in: 'carouselLeft',
                  out: 'carouselRight'
                }
              }
            ]
          },
          // Track 3: Overlay de partículas brillantes
          {
            clips: [
              {
                asset: {
                  type: 'video',
                  src: 'https://shotstack-assets.s3.amazonaws.com/footage/bokeh-gold.mp4'
                },
                start: 0,
                length: 30,
                fit: 'crop',
                opacity: 0.3
              }
            ]
          },
          // Track 4: Nombre del producto (arriba)
          {
            clips: [
              {
                asset: {
                  type: 'title',
                  text: productName,
                  style: 'future',
                  color: '#ffffff',
                  size: 'medium',
                  position: 'top'
                },
                start: 0.5,
                length: 29.5,
                offset: {
                  y: 0.15
                },
                transition: {
                  in: 'slideDown',
                  out: 'slideUp'
                }
              }
            ]
          },
          // Track 5: Precio (abajo)
          {
            clips: [
              {
                asset: {
                  type: 'title',
                  text: price ? `💰 ${price}` : '',
                  style: 'blockbuster',
                  color: '#00ff00',
                  size: 'small',
                  position: 'bottom'
                },
                start: 1,
                length: 29,
                offset: {
                  y: -0.15
                },
                transition: {
                  in: 'zoom',
                  out: 'zoom'
                }
              }
            ]
          }
        ]
      },
      output: {
        format: 'mp4',
        resolution: 'hd',
        aspectRatio: '9:16'
      }
    };

    console.log('🎬 Solicitando generación de video a Shotstack...');
    console.log('📋 Config:', JSON.stringify(videoConfig, null, 2));

    // Enviar request a Shotstack para generar el video
    // Usar stage (staging environment con watermark)
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
