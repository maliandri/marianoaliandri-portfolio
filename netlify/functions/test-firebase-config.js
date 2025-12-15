// netlify/functions/test-firebase-config.js
// Función de diagnóstico para verificar configuración de Firebase

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // NO mostrar la clave completa por seguridad, solo info de diagnóstico
    const diagnostics = {
      projectId: {
        exists: !!projectId,
        value: projectId || 'NOT SET',
        length: projectId?.length || 0
      },
      clientEmail: {
        exists: !!clientEmail,
        value: clientEmail || 'NOT SET',
        length: clientEmail?.length || 0
      },
      privateKey: {
        exists: !!privateKey,
        length: privateKey?.length || 0,
        startsWithBegin: privateKey?.startsWith('-----BEGIN PRIVATE KEY-----'),
        endsWithEnd: privateKey?.includes('-----END PRIVATE KEY-----'),
        hasNewlines: privateKey?.includes('\\n'),
        hasRealNewlines: privateKey?.includes('\n'),
        firstChars: privateKey?.substring(0, 30) || 'NOT SET',
        lastChars: privateKey?.substring(privateKey.length - 30) || 'NOT SET'
      }
    };

    // Intentar parsear la clave
    let parseResult = 'No se intentó parsear';
    try {
      const parsedKey = privateKey?.replace(/\\n/g, '\n');
      parseResult = {
        success: true,
        lengthAfterReplace: parsedKey?.length || 0,
        startsCorrectly: parsedKey?.startsWith('-----BEGIN PRIVATE KEY-----'),
        endsCorrectly: parsedKey?.endsWith('-----END PRIVATE KEY-----\n') || parsedKey?.endsWith('-----END PRIVATE KEY-----')
      };
    } catch (err) {
      parseResult = {
        success: false,
        error: err.message
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Diagnóstico de configuración de Firebase',
        diagnostics,
        parseResult,
        recommendation: !privateKey
          ? 'FIREBASE_PRIVATE_KEY no está configurada'
          : !privateKey.includes('-----BEGIN PRIVATE KEY-----')
          ? 'FIREBASE_PRIVATE_KEY no tiene el formato correcto (falta BEGIN)'
          : !privateKey.includes('\\n')
          ? 'FIREBASE_PRIVATE_KEY debe tener \\n literales (dos caracteres), no saltos de línea reales'
          : 'La configuración parece correcta. Si aún falla, regenerá la clave en Firebase Console.'
      }, null, 2)
    };
  } catch (error) {
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
