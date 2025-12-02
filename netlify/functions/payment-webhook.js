import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);

    console.log('📬 Webhook recibido de Mercado Pago:', body);

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
        payer_email: payment.body.payer.email,
        metadata: payment.body.metadata
      });

      // Aquí puedes guardar en base de datos, enviar email, etc.
      // Por ejemplo, enviar un email al cliente confirmando el pago

      if (payment.body.status === 'approved') {
        console.log('✅ Pago aprobado!');
        // TODO: Enviar email de confirmación
        // TODO: Actualizar base de datos
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
