// netlify/functions/create-test-order.js
import admin from 'firebase-admin';

// Inicializar Firebase Admin (solo una vez)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { adminPassword } = JSON.parse(event.body);

    // Verificar que sea admin
    if (adminPassword !== process.env.ADMIN_PASSWORD && adminPassword !== 'Maliandri$#652542026') {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No autorizado' })
      };
    }

    console.log('✅ Creando orden de prueba...');

    // Crear orden de prueba de CV Analysis
    const testOrderCV = {
      type: 'cv_analysis',
      customerEmail: 'test@example.com',
      status: 'completed',
      totalARS: 15000,
      totalUSD: 15,
      paymentId: 'TEST-CV-' + Date.now(),
      items: [
        {
          name: 'Análisis de CV Profesional',
          quantity: 1,
          priceARS: 15000,
          priceUSD: 15
        }
      ],
      cvAnalysis: JSON.stringify([
        'Experiencia laboral bien estructurada',
        'Falta agregar skills técnicas',
        'Sugerencia: agregar certificaciones'
      ]),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      paymentMethod: 'credit_card'
    };

    // Crear orden de prueba de Tienda
    const testOrderStore = {
      type: 'store',
      userId: 'test-user-id',
      customerEmail: 'cliente@example.com',
      status: 'approved',
      totalARS: 25000,
      totalUSD: 25,
      paymentId: 'TEST-STORE-' + Date.now(),
      items: [
        {
          name: 'Desarrollo Web Personalizado',
          quantity: 1,
          priceARS: 25000,
          priceUSD: 25
        }
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      paymentMethod: 'debit_card'
    };

    // Crear productos de prueba
    const testProducts = [
      {
        name: 'Desarrollo Web Básico',
        description: 'Sitio web estático con hasta 5 páginas',
        priceARS: 50000,
        priceUSD: 50,
        category: 'web',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Desarrollo Web Premium',
        description: 'Sitio web dinámico con base de datos',
        priceARS: 150000,
        priceUSD: 150,
        category: 'web',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Análisis de CV Profesional',
        description: 'Análisis completo de CV con IA',
        priceARS: 15000,
        priceUSD: 15,
        category: 'cv',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Consultoría de Marketing Digital',
        description: 'Asesoramiento personalizado en marketing',
        priceARS: 75000,
        priceUSD: 75,
        category: 'consultoria',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    // Guardar órdenes
    const cvOrderRef = await db.collection('orders').add(testOrderCV);
    const storeOrderRef = await db.collection('orders').add(testOrderStore);

    // Guardar productos
    const productRefs = [];
    for (const product of testProducts) {
      const ref = await db.collection('products').add(product);
      productRefs.push(ref.id);
    }

    console.log('✅ Órdenes y productos de prueba creados');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Datos de prueba creados exitosamente',
        data: {
          orders: {
            cvOrder: cvOrderRef.id,
            storeOrder: storeOrderRef.id
          },
          products: productRefs
        }
      })
    };
  } catch (error) {
    console.error('❌ Error creando órdenes de prueba:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error creando órdenes',
        message: error.message
      })
    };
  }
};
