// Script para convertir la FIREBASE_PRIVATE_KEY al formato correcto para Netlify
// Ejecutar: node convert-private-key.js

import fs from 'fs';

// Lee el archivo JSON de Firebase Service Account
const serviceAccountPath = './marianoaliandri-3b135-firebase-adminsdk-fbsvc-076863249a.json';

try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  const privateKey = serviceAccount.private_key;

  console.log('='.repeat(80));
  console.log('CONFIGURACIÓN DE FIREBASE_PRIVATE_KEY PARA NETLIFY');
  console.log('='.repeat(80));
  console.log('\n');

  console.log('📋 PASO 1: Ir a Netlify Dashboard');
  console.log('https://app.netlify.com → Tu sitio → Site configuration → Environment variables');
  console.log('\n');

  console.log('📋 PASO 2: Agregar/Editar la variable FIREBASE_PRIVATE_KEY');
  console.log('\n');

  console.log('📋 PASO 3: Copiar EXACTAMENTE este valor (TODO EN UNA LÍNEA):');
  console.log('-'.repeat(80));
  console.log(privateKey);
  console.log('-'.repeat(80));
  console.log('\n');

  console.log('✅ IMPORTANTE:');
  console.log('- Debe estar TODO EN UNA SOLA LÍNEA (sin saltos de línea)');
  console.log('- Los \\n son LITERALES (dos caracteres: barra + n)');
  console.log('- Incluye -----BEGIN PRIVATE KEY----- y -----END PRIVATE KEY-----');
  console.log('\n');

  console.log('📋 PASO 4: Configurar también estas variables:');
  console.log('\nFIREBASE_PROJECT_ID');
  console.log(serviceAccount.project_id);
  console.log('\nFIREBASE_CLIENT_EMAIL');
  console.log(serviceAccount.client_email);
  console.log('\n');

  console.log('📋 PASO 5: Scopes');
  console.log('Para cada variable, marcar: All (Builds, Functions, Post-processing)');
  console.log('\n');

  console.log('📋 PASO 6: Guardar y hacer un nuevo deploy');
  console.log('\n');

  // Guardar en archivo para copiar fácil
  fs.writeFileSync('PRIVATE_KEY_FOR_NETLIFY.txt', privateKey);
  console.log('✅ También guardé la clave en: PRIVATE_KEY_FOR_NETLIFY.txt');
  console.log('   (podés copiarla desde ahí)');
  console.log('\n');

  console.log('='.repeat(80));

} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n');
  console.log('💡 Asegurate de tener el archivo:');
  console.log('   marianoaliandri-3b135-firebase-adminsdk-fbsvc-076863249a.json');
  console.log('   en la raíz del proyecto');
}
