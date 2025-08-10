const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Si no se cargan del .env, usar valores directos (TEMPORAL)
if (!process.env.ZOHO_USER) {
    process.env.ZOHO_USER = 'tupaginaweb@marianoaliandri.com.ar';
    process.env.ZOHO_PASS = 'wNbidCYn8ZjV';
    process.env.TO_EMAIL = 'tupaginaweb@marianoaliandri.com.ar';
    process.env.MP_ACCESS_TOKEN = 'TAPP_USR-3855389865496676-080907-0626d04a2576ab86f776472712b20283-80550955';
    process.env.PAYPAL_CLIENT_ID = 'AQkOz-Aq6Kq4GalFF4bdMl-p1SPXLycWyBt7anHrlpUses9gYcxt_7i4IJznnilKMOSHrSyh1omD5Av-';
    process.env.PAYPAL_CLIENT_SECRET = 'EE-G8QFDLcykUXd69dr-Lze3niZF5dvmohkz7VD9UYY--MlCeZ9hEm1RukHABHWV_10abpLPyiqGsCUU';
}

const app = express();

// ==================== CONFIGURACIÓN CORS ====================

const allowedOrigins = [
    'https://marianoaliandri.netlify.app',
    'https://marianoaliandri.com.ar',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`⚠️ Intento de acceso denegado por CORS desde: ${origin}`);
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// ==================== CONFIGURACIÓN DE SERVICIOS ====================

// Nodemailer
const createTransporter = () => {
    return nodemailer.createTransport({
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
};

// MercadoPago
let MercadoPagoConfig, Preference, Payment;
let preferenceClient, paymentClient;

if (process.env.MP_ACCESS_TOKEN) {
    try {
        const mercadopago = require('mercadopago');
        MercadoPagoConfig = mercadopago.MercadoPagoConfig;
        Preference = mercadopago.Preference;
        Payment = mercadopago.Payment;

        const client = new MercadoPagoConfig({
            accessToken: process.env.MP_ACCESS_TOKEN,
            options: { timeout: 5000 }
        });
        preferenceClient = new Preference(client);
        paymentClient = new Payment(client);
        console.log('✅ MercadoPago configurado correctamente');
    } catch (error) {
        console.warn('⚠️ Error al configurar MercadoPago. Asegúrate de haber instalado `mercadopago`.');
    }
} else {
    console.log('⚠️ MP_ACCESS_TOKEN no configurado - MercadoPago deshabilitado');
}

// PayPal
let paypal;
let paypalClient;

if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
    try {
        paypal = require('@paypal/checkout-server-sdk');
        const Environment = process.env.NODE_ENV === 'production' 
          ? paypal.core.LiveEnvironment 
          : paypal.core.SandboxEnvironment;

        paypalClient = new paypal.core.PayPalHttpClient(
            new Environment(
                process.env.PAYPAL_CLIENT_ID,
                process.env.PAYPAL_CLIENT_SECRET
            )
        );
        console.log('✅ PayPal configurado correctamente');
    } catch (error) {
        console.warn('⚠️ Error al configurar PayPal. Asegúrate de haber instalado `@paypal/checkout-server-sdk`.');
    }
} else {
    console.log('⚠️ PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET no configurados - PayPal deshabilitado');
}

// ==================== ENDPOINTS DE EMAIL ====================

app.post('/api/send-roi-lead', async (req, res) => {
    const leadData = req.body;
    
    if (!leadData.email || !leadData.company || !leadData.calculatedROI) {
        return res.status(400).json({ success: false, error: 'Faltan datos requeridos: email, company, calculatedROI' });
    }

    if (!process.env.ZOHO_USER || !process.env.ZOHO_PASS) {
        return res.status(500).json({ success: false, error: 'Configuración de email no disponible' });
    }

    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.ZOHO_USER,
            to: process.env.TO_EMAIL || process.env.ZOHO_USER,
            subject: `Nuevo Lead ROI: ${leadData.company}`,
            html: `
                <h2>¡Nuevo Lead de Calculadora ROI!</h2>
                <p><strong>Empresa:</strong> ${leadData.company}</p>
                <p><strong>Email:</strong> ${leadData.email}</p>
                <p><strong>Teléfono:</strong> ${leadData.phone || 'No especificado'}</p>
                <p><strong>ROI Calculado:</strong> ${leadData.calculatedROI.roi}%</p>
                <p><strong>Ahorro Anual:</strong> $${leadData.calculatedROI.annualSavings}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email ROI enviado a ${leadData.email}`);
        res.status(200).json({ success: true, message: 'Email sent successfully!' });

    } catch (error) {
        console.error('❌ Error enviando correo ROI:', error);
        res.status(500).json({ success: false, error: 'Error al enviar el email' });
    }
});

app.post('/api/send-web-lead', async (req, res) => {
    const leadData = req.body;

    if (!leadData.email || !leadData.company || !leadData.calculatedResults) {
        return res.status(400).json({ success: false, error: 'Faltan datos requeridos: email, company, calculatedResults' });
    }

    if (!process.env.ZOHO_USER || !process.env.ZOHO_PASS) {
        return res.status(500).json({ success: false, error: 'Configuración de email no disponible' });
    }

    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.ZOHO_USER,
            to: process.env.TO_EMAIL || process.env.ZOHO_USER,
            subject: `Nuevo Lead de Desarrollo Web: ${leadData.company}`,
            html: `
                <h2>¡Nuevo Lead de Desarrollo Web!</h2>
                <p><strong>Empresa:</strong> ${leadData.company}</p>
                <p><strong>Email:</strong> ${leadData.email}</p>
                <p><strong>Presupuesto Calculado:</strong> $${leadData.calculatedResults.developmentCost}</p>
                <p><strong>ROI Estimado:</strong> ${leadData.calculatedResults.roi}%</p>
                <p><strong>Tiempo de Desarrollo:</strong> ${leadData.calculatedResults.developmentWeeks} semanas</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email Web enviado a ${leadData.email}`);
        res.status(200).json({ success: true, message: 'Email sent successfully!' });

    } catch (error) {
        console.error('❌ Error enviando correo Web:', error);
        res.status(500).json({ success: false, error: 'Error al enviar el email' });
    }
});

// ==================== ENDPOINTS DE PAGOS ====================

app.post('/api/create-web-payment', async (req, res) => {
    const { projectData, clientData, amount, paymentType = 'full' } = req.body;

    if (!preferenceClient) {
        return res.status(500).json({ error: 'MercadoPago no está configurado' });
    }

    if (!projectData || !clientData || !amount) {
        return res.status(400).json({ error: 'Faltan datos requeridos: projectData, clientData, amount' });
    }

    try {
        // CONVERTIR USD A ARS AUTOMÁTICAMENTE
        let finalAmount = amount;
        let currency = 'USD';
        
        // Obtener cotización para MercadoPago
        try {
            const response = await fetch('https://api.bluelytics.com.ar/v2/latest');
            const data = await response.json();
            const dolarRate = Math.round((data.oficial.value_buy + data.oficial.value_sell) / 2);
            
            // Convertir a pesos argentinos
            finalAmount = Math.round(amount * dolarRate);
            currency = 'ARS';
            
            console.log(`💱 Conversión: $${amount} USD = $${finalAmount} ARS (Rate: ${dolarRate})`);
            
        } catch (exchangeError) {
            console.warn('⚠️ Error obteniendo cotización, usando fallback');
            finalAmount = Math.round(amount * 1050); // Fallback rate
            currency = 'ARS';
        }

        const title = paymentType === 'advance' 
            ? `Adelanto 50% - Proyecto Web ${clientData.company}`
            : `Proyecto Web Completo - ${clientData.company}`;

        const preferenceData = {
            items: [{
                id: `web_project_${Date.now()}`,
                title: title,
                unit_price: finalAmount, // Ya convertido a ARS
                quantity: 1,
                currency_id: currency    // ARS para MercadoPago
            }],
            payer: {
                name: clientData.company,
                email: clientData.email
            },
            external_reference: JSON.stringify({
                type: 'web_project',
                clientEmail: clientData.email,
                company: clientData.company,
                paymentType: paymentType,
                projectData: projectData,
                originalAmountUSD: amount,  // Guardar monto original
                convertedAmountARS: finalAmount,
                timestamp: new Date().toISOString()
            }),
            notification_url: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/webhook/mercadopago`,
            back_urls: {
                success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?type=web&payment=${paymentType}`,
                failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failure?type=web`,
                pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-pending?type=web`
            },
            auto_return: 'approved'
        };

        const response = await preferenceClient.create({ body: preferenceData });
        
        console.log('✅ Preferencia MercadoPago creada:', response.id);

        res.json({ 
            success: true,
            init_point: response.init_point,
            preference_id: response.id,
            amount_usd: amount,
            amount_ars: finalAmount,
            exchange_rate: Math.round(finalAmount / amount)
        });

    } catch (error) {
        console.error('❌ Error creando preferencia MercadoPago:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al crear la preferencia de pago',
            details: error.message 
        });
    }
});

app.post('/api/create-paypal-payment', async (req, res) => {
    const { projectData, clientData, amount, paymentType = 'full' } = req.body;

    if (!paypalClient) {
        return res.status(500).json({ error: 'PayPal no está configurado' });
    }

    if (!projectData || !clientData || !amount) {
        return res.status(400).json({ error: 'Faltan datos requeridos: projectData, clientData, amount' });
    }

    try {
        const description = paymentType === 'advance' 
            ? `Adelanto 50% - Proyecto Web ${clientData.company}`
            : `Proyecto Web Completo - ${clientData.company}`;

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: amount.toString()
                },
                description: description,
                custom_id: JSON.stringify({
                    type: 'web_project',
                    clientEmail: clientData.email,
                    company: clientData.company,
                    paymentType: paymentType,
                    projectData: projectData,
                    timestamp: new Date().toISOString()
                })
            }],
            payer: {
                name: {
                    given_name: clientData.company.split(' ')[0],
                    surname: clientData.company.split(' ').slice(1).join(' ') || 'Company'
                },
                email_address: clientData.email
            },
            application_context: {
                return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?type=web&payment=${paymentType}&processor=paypal`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failure?type=web&processor=paypal`,
                brand_name: 'Mariano Aliandri - Web Development',
                landing_page: 'BILLING',
                user_action: 'PAY_NOW'
            }
        });

        const order = await paypalClient.execute(request);
        
        const approvalUrl = order.result.links.find(
            link => link.rel === 'approve'
        ).href;

        console.log('✅ Orden PayPal creada:', order.result.id);

        res.json({ 
            success: true,
            approval_url: approvalUrl,
            order_id: order.result.id
        });

    } catch (error) {
        console.error('❌ Error creando orden PayPal:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al crear la orden PayPal',
            details: error.message 
        });
    }
});

app.post('/api/send-transfer-instructions', async (req, res) => {
    const { customer, transferData, projectDetails } = req.body;
    
    if (!customer?.email || !transferData?.amount) {
        return res.status(400).json({ error: 'Faltan datos requeridos: email del cliente o monto de transferencia.' });
    }

    if (!process.env.ZOHO_USER || !process.env.ZOHO_PASS) {
        return res.status(500).json({ success: false, error: 'Configuración de email no disponible' });
    }

    try {
        const transporter = createTransporter();
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
                <h2 style="color: #3B82F6;">💳 Instrucciones de Transferencia Bancaria</h2>
                <p>Hola ${customer.company},</p>
                <p>Hemos recibido tu solicitud de pago y aquí tienes los detalles para realizar la transferencia.</p>
                
                <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                    <h3>Detalles del Pago</h3>
                    <p><strong>Proyecto para:</strong> ${customer.company}</p>
                    <p><strong>Monto a pagar:</strong> <strong style="font-size: 1.2em;">$${transferData.amount} ${transferData.currency}</strong></p>
                    <p><strong>Referencia de Pago:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${transferData.reference}</code></p>
                </div>
                
                <h3>Datos Bancarios:</h3>
                ${transferData.accounts?.USD ? `
                <div style="background: white; border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px;">
                    <h4>💵 Cuenta en Dólares (USD)</h4>
                    <p><strong>Banco:</strong> ${transferData.accounts.USD.bank}</p>
                    <p><strong>Beneficiario:</strong> ${transferData.accounts.USD.beneficiary}</p>
                    <p><strong>Cuenta:</strong> ${transferData.accounts.USD.account}</p>
                    <p><strong>SWIFT:</strong> ${transferData.accounts.USD.swift}</p>
                </div>
                ` : ''}
                
                ${transferData.accounts?.ARS ? `
                <div style="background: white; border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px;">
                    <h4>🇦🇷 Cuenta en Pesos (ARS)</h4>
                    <p><strong>Banco:</strong> ${transferData.accounts.ARS.bank}</p>
                    <p><strong>Beneficiario:</strong> ${transferData.accounts.ARS.beneficiary}</p>
                    <p><strong>CBU:</strong> ${transferData.accounts.ARS.cbu}</p>
                    <p><strong>Alias:</strong> ${transferData.accounts.ARS.alias}</p>
                </div>
                ` : ''}
                
                <div style="background: #FEF3CD; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fcd34d;">
                    <h4 style="color: #9A3412; margin-top: 0;">⚠️ Importante:</h4>
                    <ul>
                        <li><strong>Recuerda incluir la referencia de pago:</strong> <code style="background: #e5e7eb; padding: 2px 4px; border-radius: 4px;">${transferData.reference}</code></li>
                        <li><strong>Envía el comprobante a:</strong> <a href="mailto:${process.env.TO_EMAIL}" style="color: #3B82F6;">${process.env.TO_EMAIL}</a></li>
                        <li>Procesaremos tu pago en un plazo de 24-48 horas.</li>
                    </ul>
                </div>
                
                <p>Muchas gracias,</p>
                <p>Mariano Aliandri</p>
            </div>
        `;

        await transporter.sendMail({
            from: process.env.ZOHO_USER,
            to: customer.email,
            cc: process.env.TO_EMAIL || process.env.ZOHO_USER,
            subject: `💳 Instrucciones de Pago - ${customer.company}`,
            html: emailContent
        });

        res.json({
            success: true,
            reference: transferData.reference,
            message: 'Instrucciones de transferencia enviadas exitosamente'
        });

    } catch (error) {
        console.error('❌ Error enviando instrucciones de transferencia:', error);
        res.status(500).json({ success: false, error: 'Error al enviar instrucciones de transferencia' });
    }
});

// ==================== WEBHOOKS ====================

app.post('/api/webhook/mercadopago', async (req, res) => {
    try {
        const { type, data } = req.body;
        
        console.log('🔔 Webhook MercadoPago recibido:', { type, data });
        
        if (type === 'payment' && paymentClient) {
            const paymentId = data.id;
            const paymentResponse = await paymentClient.get({ id: paymentId });
            
            if (paymentResponse.status === 'approved') {
                console.log('✅ Pago aprobado:', paymentResponse.id);
                
                try {
                    const externalReference = JSON.parse(paymentResponse.external_reference || '{}');

                    if (process.env.ZOHO_USER && process.env.ZOHO_PASS) {
                        const transporter = createTransporter();
                        await transporter.sendMail({
                            from: process.env.ZOHO_USER,
                            to: process.env.TO_EMAIL || process.env.ZOHO_USER,
                            subject: `💰 PAGO CONFIRMADO - ${externalReference.company || 'Cliente'}`,
                            text: `Pago confirmado por $${paymentResponse.transaction_amount} USD para el proyecto de ${externalReference.company || 'Cliente'}.`
                        });
                    }
                } catch (parseError) {
                    console.error('Error parseando external_reference:', parseError);
                }
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('❌ Error en webhook:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== RUTAS DE UTILIDAD ====================

app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend funcionando correctamente!',
        timestamp: new Date().toISOString(),
        environment: {
            zohoUser: process.env.ZOHO_USER ? 'Configurado ✓' : 'No configurado ✗',
            mpAccessToken: process.env.MP_ACCESS_TOKEN ? 'Configurado ✓' : 'No configurado ✗',
            paypalClientId: process.env.PAYPAL_CLIENT_ID ? 'Configurado ✓' : 'No configurado ✗',
            paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET ? 'Configurado ✓' : 'No configurado ✗'
        }
    });
});

app.use((err, req, res, next) => {
    console.error('❌ Error del servidor:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
});

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor en funcionamiento en el puerto ${PORT}`);
    console.log('Estado de variables de entorno:');
    console.log('ZOHO_USER:', process.env.ZOHO_USER ? 'Configurado ✓' : 'No configurado ✗');
    console.log('MP_ACCESS_TOKEN:', process.env.MP_ACCESS_TOKEN ? 'Configurado ✓' : 'No configurado ✗');
    console.log('PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID ? 'Configurado ✓' : 'No configurado ✗');
    console.log('PAYPAL_CLIENT_SECRET:', process.env.PAYPAL_CLIENT_SECRET ? 'Configurado ✓' : 'No configurado ✗');
});