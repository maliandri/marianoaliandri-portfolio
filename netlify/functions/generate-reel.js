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

    const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

    // Videos de fondo de Pexels (vertical 9:16 para reels)
    let backgroundVideoUrl = null;

    if (PEXELS_API_KEY) {
      try {
        // Buscar videos verticales aleatorios en Pexels
        const pexelsQueries = ['abstract', 'particles', 'neon', 'bokeh', 'sparkle', 'geometric'];
        const randomQuery = pexelsQueries[Math.floor(Math.random() * pexelsQueries.length)];

        const pexelsResponse = await fetch(`https://api.pexels.com/videos/search?query=${randomQuery}&orientation=portrait&per_page=15`, {
          headers: {
            'Authorization': PEXELS_API_KEY
          }
        });

        if (pexelsResponse.ok) {
          const pexelsData = await pexelsResponse.json();
          if (pexelsData.videos && pexelsData.videos.length > 0) {
            const randomVideo = pexelsData.videos[Math.floor(Math.random() * pexelsData.videos.length)];
            // Buscar archivo de video en resolución HD vertical
            const videoFile = randomVideo.video_files.find(f => f.height >= 1280 && f.width / f.height < 1) || randomVideo.video_files[0];
            backgroundVideoUrl = videoFile.link;
            console.log('🎥 Video de fondo de Pexels:', backgroundVideoUrl);
          }
        }
      } catch (error) {
        console.log('⚠️ No se pudo obtener video de Pexels, usando solo imagen:', error.message);
      }
    }

    // Transiciones y efectos aleatorios
    const transitions = ['carouselLeft', 'carouselRight', 'slideLeft', 'slideRight', 'zoom', 'fade'];
    const effects = ['zoomIn', 'zoomOut'];

    // Seleccionar efectos aleatorios
    const randomTransitionIn = transitions[Math.floor(Math.random() * transitions.length)];
    const randomTransitionOut = transitions[Math.floor(Math.random() * transitions.length)];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];

    console.log('🎲 Elementos aleatorios seleccionados:');
    console.log('- Transición entrada:', randomTransitionIn);
    console.log('- Transición salida:', randomTransitionOut);
    console.log('- Efecto:', randomEffect);

    // Configurar el video con Shotstack (30 segundos con video de fondo y transiciones)
    const tracks = [];

    // Track 1: Video de fondo de Pexels (si está disponible)
    if (backgroundVideoUrl) {
      tracks.push({
        clips: [
          {
            asset: {
              type: 'video',
              src: backgroundVideoUrl
            },
            start: 0,
            length: 30,
            fit: 'crop',
            opacity: 0.3 // Semi-transparente para que se vea el producto
          }
        ]
      });
    }

    // Track 2: Imagen del producto con efectos aleatorios
    tracks.push({
      clips: [
        {
          asset: {
            type: 'image',
            src: imageUrl
          },
          start: 0,
          length: 30,
          fit: 'contain',
          scale: 0.7,
          effect: randomEffect,
          transition: {
            in: randomTransitionIn,
            out: randomTransitionOut
          }
        }
      ]
    });

    const videoConfig = {
      timeline: {
        background: '#000000',
        tracks: tracks.concat([
          // Track 3: Nombre del producto (arriba)
          {
            clips: [
              {
                asset: {
                  type: 'title',
                  text: productName,
                  style: 'minimal',
                  color: '#ffffff',
                  size: 'small',
                  position: 'top'
                },
                start: 0.5,
                length: 29.5,
                offset: {
                  y: 0.1
                },
                transition: {
                  in: 'slideDown',
                  out: 'slideUp'
                }
              }
            ]
          },
          // Track 4: Precio (abajo)
          {
            clips: [
              {
                asset: {
                  type: 'title',
                  text: price ? `Desde ${price}` : 'Consultar precio',
                  style: 'minimal',
                  color: '#00ff00',
                  size: 'x-small',
                  position: 'bottom'
                },
                start: 1,
                length: 29,
                offset: {
                  y: -0.1
                },
                transition: {
                  in: 'zoom',
                  out: 'zoom'
                }
              }
            ]
          }
        ])
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
