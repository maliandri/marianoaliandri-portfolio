import { initMercadoPago } from '@mercadopago/sdk-react';

// Public Key de Mercado Pago (Prueba)
const MERCADOPAGO_PUBLIC_KEY = 'APP_USR-beb2f9a7-c49c-42c2-9549-9b531ae22579';

// Inicializar Mercado Pago
let isInitialized = false;

export const initializeMercadoPago = () => {
  if (!isInitialized) {
    initMercadoPago(MERCADOPAGO_PUBLIC_KEY, {
      locale: 'es-AR'
    });
    isInitialized = true;
    console.log('✅ Mercado Pago inicializado');
  }
};

// Función para crear una preferencia de pago
export const createPaymentPreference = async (paymentData) => {
  try {
    const response = await fetch('/.netlify/functions/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creando preferencia de pago:', error);
    throw error;
  }
};
