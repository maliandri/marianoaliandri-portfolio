// netlify/functions/debug-email.js - Para diagnosticar problemas
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      environment: {
        hasZohoUser: !!process.env.ZOHO_USER,
        hasZohoPass: !!process.env.ZOHO_PASS,
        hasToEmail: !!process.env.TO_EMAIL,
        zohoUserLength: process.env.ZOHO_USER ? process.env.ZOHO_USER.length : 0,
        zohoPassLength: process.env.ZOHO_PASS ? process.env.ZOHO_PASS.length : 0
      },
      netlifyContext: {
        functionName: context.functionName,
        functionVersion: context.functionVersion,
        memoryLimitInMB: context.memoryLimitInMB,
        timeRemaining: context.getRemainingTimeInMillis()
      }
    };

    // Test básico de nodemailer
    try {
      const nodemailer = require('nodemailer');
      
      const testTransporter = nodemailer.createTransporter({
        host: 'smtp.zoho.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.ZOHO_USER,
          pass: process.env.ZOHO_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verificar conexión
      const verified = await testTransporter.verify();
      diagnostics.emailTest = {
        transporterCreated: true,
        connectionVerified: verified,
        error: null
      };

    } catch (emailError) {
      diagnostics.emailTest = {
        transporterCreated: false,
        connectionVerified: false,
        error: emailError.message
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(diagnostics, null, 2)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Debug failed',
        message: error.message,
        stack: error.stack
      }, null, 2)
    };
  }
};