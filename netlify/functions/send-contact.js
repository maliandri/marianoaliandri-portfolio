// netlify/functions/send-contact.js - VERSIÓN CORREGIDA
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Manejar preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Solo POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('🚀 Function iniciada');
    console.log('Environment check:', {
      hasZohoUser: !!process.env.ZOHO_USER,
      hasZohoPass: !!process.env.ZOHO_PASS,
      functionTimeout: context.getRemainingTimeInMillis()
    });

    // Parse del body
    const data = JSON.parse(event.body);
    console.log('📧 Data recibida:', { email: data.email, name: data.name });

    // Validaciones básicas
    if (!data.email || !data.email.includes('@')) {
      console.log('❌ Email inválido');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email válido requerido' })
      };
    }

    if (!data.name && !data.company) {
      console.log('❌ Falta nombre o empresa');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Nombre o empresa requerido' })
      };
    }

    // Crear transporter con configuración robusta
    console.log('🔧 Creando transporter...');
    const transporter = nodemailer.createTransporter({
      host: 'smtp.zoho.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS
      },
      tls: {
        rejectUnauthorized: false
      },
      // Configuración para Netlify
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000
    });

    // Verificar conexión ANTES de enviar
    console.log('🔍 Verificando conexión SMTP...');
    try {
      await transporter.verify();
      console.log('✅ Conexión SMTP verificada');
    } catch (verifyError) {
      console.error('❌ Error verificando SMTP:', verifyError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Error de conexión email',
          details: verifyError.message 
        })
      };
    }

    // Email principal con HTML más simple (por si hay problemas de rendering)
    const mailOptions = {
      from: `"Portfolio Web" <${process.env.ZOHO_USER}>`,
      to: process.env.TO_EMAIL || process.env.ZOHO_USER,
      replyTo: data.email,
      subject: `Nuevo contacto: ${data.company || data.name}`,
      html: `
        <h2>Nuevo mensaje desde portfolio</h2>
        <p><strong>Nombre:</strong> ${data.name || 'No especificado'}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Teléfono:</strong> ${data.phone || 'No especificado'}</p>
        <p><strong>Empresa:</strong> ${data.company || 'No especificado'}</p>
        <p><strong>Servicio:</strong> ${data.service || 'Consulta general'}</p>
        <p><strong>Presupuesto:</strong> ${data.budget || 'No especificado'}</p>
        
        ${data.message ? `
          <h3>Mensaje:</h3>
          <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #007acc;">
            <p>${data.message}</p>
          </div>
        ` : ''}
        
        <hr>
        <small style="color: #666;">
          Enviado: ${new Date().toLocaleString('es-ES')}<br>
          Desde: Portfolio Web
        </small>
      `,
      // Incluir también versión text por compatibilidad
      text: `
        Nuevo contacto desde portfolio
        
        Nombre: ${data.name || 'No especificado'}
        Email: ${data.email}
        Teléfono: ${data.phone || 'No especificado'}
        Empresa: ${data.company || 'No especificado'}
        Servicio: ${data.service || 'Consulta general'}
        Presupuesto: ${data.budget || 'No especificado'}
        
        ${data.message ? `Mensaje: ${data.message}` : ''}
        
        Enviado: ${new Date().toLocaleString('es-ES')}
      `
    };

    console.log('📤 Enviando email principal...');
    const mainResult = await transporter.sendMail(mailOptions);
    console.log('✅ Email principal enviado:', mainResult.messageId);

    // Email de confirmación (opcional, solo si el principal funcionó)
    try {
      const confirmationOptions = {
        from: `"Mariano Aliandri" <${process.env.ZOHO_USER}>`,
        to: data.email,
        subject: `Gracias por contactarme, ${data.name || data.company}`,
        html: `
          <h2>¡Gracias por contactarme!</h2>
          <p>Hola ${data.name || 'estimado cliente'},</p>
          <p>He recibido tu mensaje y te responderé en las próximas <strong>24 horas</strong>.</p>
          <p>Si es urgente, puedes contactarme por WhatsApp: 
             <a href="https://wa.me/+542995414422">+54 299 541-4422</a>
          </p>
          <br>
          <p>Saludos,<br><strong>Mariano Aliandri</strong></p>
        `
      };

      console.log('📤 Enviando confirmación...');
      await transporter.sendMail(confirmationOptions);
      console.log('✅ Confirmación enviada');
    } catch (confirmError) {
      console.log('⚠️ Error enviando confirmación (no crítico):', confirmError.message);
      // No fallar si la confirmación falla
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Mensaje enviado exitosamente',
        debug: {
          timestamp: new Date().toISOString(),
          messageId: mainResult.messageId
        }
      })
    };

  } catch (error) {
    console.error('💥 Error en function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        details: error.message,
        debug: {
          timestamp: new Date().toISOString(),
          errorType: error.constructor.name
        }
      })
    };
  }
};