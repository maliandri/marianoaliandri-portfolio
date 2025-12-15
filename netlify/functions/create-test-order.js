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

    // Crear productos reales que coincidan con los servicios del sitio
    const testProducts = [
      // CALCULADORA ROI
      {
        id: 'roi-consulting',
        name: 'Consulta Personalizada ROI',
        description: 'Análisis de retorno de inversión personalizado',
        priceUSD: 100,
        category: 'consulting',
        serviceType: 'roi-calculator',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      // CALCULADORA WEB - Precios base
      {
        id: 'landing-page',
        name: 'Landing Page',
        description: 'Página de aterrizaje profesional',
        priceUSD: 400,
        category: 'web-development',
        serviceType: 'web-calculator',
        websiteType: 'landing',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'business-website',
        name: 'Sitio Web Empresarial',
        description: 'Sitio web completo para empresas',
        priceUSD: 1000,
        category: 'web-development',
        serviceType: 'web-calculator',
        websiteType: 'business',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'ecommerce',
        name: 'E-commerce',
        description: 'Tienda online completa',
        priceUSD: 2000,
        category: 'web-development',
        serviceType: 'web-calculator',
        websiteType: 'ecommerce',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'portfolio',
        name: 'Portfolio/Catálogo',
        description: 'Sitio web tipo portfolio',
        priceUSD: 1200,
        category: 'web-development',
        serviceType: 'web-calculator',
        websiteType: 'portfolio',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'blog',
        name: 'Blog/Noticias',
        description: 'Sitio web con blog integrado',
        priceUSD: 1500,
        category: 'web-development',
        serviceType: 'web-calculator',
        websiteType: 'blog',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'webapp',
        name: 'Aplicación Web',
        description: 'Aplicación web personalizada',
        priceUSD: 6000,
        category: 'web-development',
        serviceType: 'web-calculator',
        websiteType: 'webapp',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'membership',
        name: 'Sitio de Membresías',
        description: 'Plataforma con sistema de membresías',
        priceUSD: 2500,
        category: 'web-development',
        serviceType: 'web-calculator',
        websiteType: 'membership',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      // TIENDA - Productos adicionales
      {
        id: 'ai-chatbot-website',
        name: 'Página Web con Atención IA',
        description: 'Sitio web con chatbot inteligente integrado',
        priceUSD: 800,
        category: 'web-development',
        serviceType: 'store',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'powerbi-dashboard',
        name: 'Dashboard Power BI',
        description: 'Dashboard interactivo personalizado',
        priceUSD: 1200,
        category: 'data-analytics',
        serviceType: 'store',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    // Guardar órdenes
    const cvOrderRef = await db.collection('orders').add(testOrderCV);
    const storeOrderRef = await db.collection('orders').add(testOrderStore);

    // Guardar productos con IDs específicos
    const productRefs = [];
    for (const product of testProducts) {
      const { id, ...productData } = product;
      await db.collection('products').doc(id).set(productData);
      productRefs.push(id);
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
