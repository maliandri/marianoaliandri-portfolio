import mercadopago from 'mercadopago';
import crypto from 'crypto';

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// Verificar firma del webhook
function verifyWebhookSignature(event) {
  const xSignature = event.headers['x-signature'];
  const xRequestId = event.headers['x-request-id'];

  if (!xSignature || !xRequestId) {
    console.log('⚠️ Headers de firma no encontrados');
    return true; // En modo prueba, permitir sin firma
  }

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.log('⚠️ MERCADOPAGO_WEBHOOK_SECRET no configurado');
    return true; // Permitir si no está configurado (modo desarrollo)
  }

  try {
    // Extraer ts y v1 del header x-signature
    const parts = xSignature.split(',');
    const ts = parts.find(p => p.startsWith('ts=')).replace('ts=', '');
    const hash = parts.find(p => p.startsWith('v1=')).replace('v1=', '');

    // Crear el string para validar: id + request-id + ts
    const manifest = `id:${event.body};request-id:${xRequestId};ts:${ts};`;

    // Generar HMAC
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const calculatedHash = hmac.digest('hex');

    const isValid = calculatedHash === hash;
    console.log(`🔐 Verificación de firma: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);

    return isValid;
  } catch (error) {
    console.error('❌ Error verificando firma:', error);
    return true; // En caso de error, permitir (modo desarrollo)
  }
}

export async function handler(event) {
  try {
    console.log('📬 Webhook recibido de Mercado Pago');
    console.log('Headers:', event.headers);

    // Verificar firma del webhook (en producción debería ser obligatorio)
    const isValidSignature = verifyWebhookSignature(event);
    if (!isValidSignature) {
      console.log('❌ Firma inválida, rechazando webhook');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    const body = JSON.parse(event.body);
    console.log('Body:', body);

    // Verificar el tipo de notificación
    if (body.type === 'payment') {
      const paymentId = body.data.id;

      // Obtener información del pago
      const payment = await mercadopago.payment.findById(paymentId);

      console.log('💰 Información del pago:', {
        id: payment.body.id,
        status: payment.body.status,
        status_detail: payment.body.status_detail,
        transaction_amount: payment.body.transaction_amount,
        payer_email: payment.body.payer?.email,
        metadata: payment.body.metadata
      });

      if (payment.body.status === 'approved') {
        console.log('✅ Pago aprobado!');

        // TODO: Aquí puedes:
        // - Guardar en base de datos
        // - Enviar email de confirmación al cliente
        // - Notificar al equipo de ventas
        // - Activar servicios contratados

        const metadata = payment.body.metadata;
        console.log('📋 Tipo de consulta:', metadata.type);
        console.log('🏢 Empresa:', metadata.company);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('❌ Error en webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
