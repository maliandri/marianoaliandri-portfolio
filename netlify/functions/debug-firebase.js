// netlify/functions/debug-firebase.js
// Función de diagnóstico para ver qué hay en Firestore
import admin from 'firebase-admin';

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
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    console.log('🔍 Iniciando diagnóstico de Firebase...');

    // Contar documentos en cada colección
    const collections = ['users', 'orders', 'products'];
    const results = {};

    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      results[collectionName] = {
        count: snapshot.size,
        docs: []
      };

      snapshot.forEach(doc => {
        results[collectionName].docs.push({
          id: doc.id,
          data: doc.data()
        });
      });
    }

    console.log('✅ Diagnóstico completo:', results);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Diagnóstico de Firebase',
        collections: results
      }, null, 2)
    };
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error en diagnóstico',
        message: error.message
      })
    };
  }
};
