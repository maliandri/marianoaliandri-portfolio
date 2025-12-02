import mercadopago from 'mercadopago';

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

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
    const { title, price, quantity, payer, metadata } = JSON.parse(event.body);

    // Validar datos requeridos
    if (!title || !price || !quantity) {
      return {
        statusCode: 400,
        headers: responseHeaders,
        body: JSON.stringify({ error: 'Faltan datos requeridos' })
      };
    }

    // Crear preferencia de pago
    const preference = {
      items: [
        {
          title: title,
          unit_price: Number(price),
          quantity: Number(quantity),
        }
      ],
      payer: payer || {},
      back_urls: {
        success: `${process.env.URL}/success`,
        failure: `${process.env.URL}/failure`,
        pending: `${process.env.URL}/pending`
      },
      auto_return: 'approved',
      metadata: metadata || {},
      notification_url: `${process.env.URL}/.netlify/functions/payment-webhook`,
    };

    const response = await mercadopago.preferences.create(preference);

    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({
        id: response.body.id,
        init_point: response.body.init_point,
      })
    };

  } catch (error) {
    console.error('❌ Error creando preferencia de pago:', error);
    return {
      statusCode: 500,
      headers: responseHeaders,
      body: JSON.stringify({
        error: 'Error al crear la preferencia de pago',
        details: error.message
      })
    };
  }
}
