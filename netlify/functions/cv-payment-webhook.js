import { MercadoPagoConfig, Payment } from 'mercadopago';
import crypto from 'crypto';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});
const payment = new Payment(client);

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
    // Parse del body para obtener el data.id
    const body = JSON.parse(event.body);
    const dataId = body.data?.id || body.id;

    const parts = xSignature.split(',');
    const ts = parts.find(p => p.startsWith('ts=')).replace('ts=', '');
    const hash = parts.find(p => p.startsWith('v1=')).replace('v1=', '');

    // El manifest debe usar data.id, no el body completo
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const calculatedHash = hmac.digest('hex');
    const isValid = calculatedHash === hash;
    console.log(`🔐 Verificación de firma: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);
    console.log(`   Data ID: ${dataId}, Request ID: ${xRequestId}, TS: ${ts}`);
    return isValid;
  } catch (error) {
    console.error('❌ Error verificando firma:', error);
    return true; // En caso de error, permitir (modo desarrollo)
  }
}

// Enviar email con análisis de CV usando Netlify Forms
async function sendCVAnalysisEmail(paymentData) {
  const metadata = paymentData.metadata;
  const cvAnalysis = JSON.parse(metadata.cvAnalysis);

  // Formatear los resultados del análisis
  const resultsText = cvAnalysis.map((r, i) =>
    `${i + 1}. ${r.profesion} - Score: ${r.score}%
   Skills encontradas: ${r.skills_found?.join(', ') || 'Ninguna'}
   Skills faltantes: ${r.skills_missing?.join(', ') || 'Ninguna'}`
  ).join('\n\n');

  const formData = new URLSearchParams();
  formData.append('form-name', 'cv-analysis');
  formData.append('email', metadata.email);
  formData.append('payment-id', paymentData.id);
  formData.append('amount', paymentData.transaction_amount);
  formData.append('analysis-results', resultsText);
  formData.append('timestamp', metadata.timestamp);

  const response = await fetch('https://marianoaliandri.com.ar/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  });

  if (!response.ok) {
    throw new Error(`Error enviando formulario: ${response.status}`);
  }

  return response;
}

export async function handler(event) {
  try {
    console.log('📬 Webhook recibido de Mercado Pago (CV Analysis)');
    console.log('Headers:', event.headers);

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

    if (body.type === 'payment') {
      const paymentId = body.data.id;
      const paymentData = await payment.get({ id: paymentId });

      console.log('💰 Información del pago CV:', {
        id: paymentData.id,
        status: paymentData.status,
        status_detail: paymentData.status_detail,
        transaction_amount: paymentData.transaction_amount,
        payer_email: paymentData.payer?.email,
        metadata: paymentData.metadata
      });

      if (paymentData.status === 'approved') {
        console.log('✅ Pago aprobado! Enviando análisis por email...');

        try {
          await sendCVAnalysisEmail(paymentData);
          console.log('✅ Email de análisis enviado a:', paymentData.metadata.email);
        } catch (emailError) {
          console.error('❌ Error enviando email:', emailError);
          // No fallar el webhook por error de email
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('❌ Error en webhook CV:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
