const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// ==================== CONFIGURACIÓN BACKEND_URL PARA NGROK ====================
if (process.env.NODE_ENV !== 'production') {
    if (process.env.NGROK_URL) {
        process.env.BACKEND_URL = process.env.NGROK_URL;
        console.log(`🌐 Usando NGROK_URL para BACKEND_URL: ${process.env.BACKEND_URL}`);
    } else {
        console.warn('⚠️ NGROK_URL no está configurado en .env, se usará localhost');
        process.env.BACKEND_URL = 'http://localhost:4000';
    }
}

// Verificar que las variables de entorno estén configuradas
if (!process.env.ZOHO_USER || !process.env.ZOHO_PASS) {
    console.error('❌ FALTAN CREDENCIALES DE EMAIL: ZOHO_USER y ZOHO_PASS requeridas en .env');
}

if (!process.env.MP_ACCESS_TOKEN) {
    console.warn('⚠️ MP_ACCESS_TOKEN no configurado - MercadoPago será deshabilitado');
}

if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    console.warn('⚠️ PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET no configurados - PayPal será deshabilitado');
}

const app = express();
const PORT = process.env.PORT || 4000;

// ==================== CONFIGURACIÓN CORS ====================
const allowedOrigins = [
    'https://marianoaliandri.netlify.app',
    'https://marianoaliandri.com.ar',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4000',
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
app.use(bodyParser.json());

// ==================== CONFIGURACIÓN DE SERVICIOS ====================

// Nodemailer
const createTransporter = () => {
    return nodemailer.createTransporter({
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
        console.warn('⚠️ Error al configurar MercadoPago:', error.message);
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
        console.warn('⚠️ Error al configurar PayPal:', error.message);
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
        console.log(`✅ Email ROI enviado para ${leadData.company}`);
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
        console.log(`✅ Email Web enviado para ${leadData.company}`);
        res.status(200).json({ success: true, message: 'Email sent successfully!' });

    } catch (error) {
        console.error('❌ Error enviando correo Web:', error);
        res.status(500).json({ success: false, error: 'Error al enviar el email' });
    }
});

// ==================== ENDPOINTS DE PAGOS ====================

app.post('/api/create-web-payment', async (req, res) => {
    const { projectData, clientData, amount, paymentType = 'full' } = req.body;

    console.log('💰 Datos recibidos para crear pago:', {
        projectData,
        clientData,
        amount,
        paymentType
    });

    if (!preferenceClient) {
        console.error('❌ MercadoPago no configurado');
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
                unit_price: finalAmount,
                quantity: 1,
                currency_id: currency
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
                originalAmountUSD: amount,
                convertedAmountARS: finalAmount,
                timestamp: new Date().toISOString()
            }),
            notification_url: `${process.env.BACKEND_URL}/api/webhook/mercadopago`,
            back_urls: {
                success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?type=web&payment=${paymentType}`,
                failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failure?type=web`,
                pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-pending?type=web`
            },
            auto_return: 'approved'
        };

        console.log('🔧 Creando preferencia con datos:', preferenceData);

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
                            text: `Pago confirmado por $${paymentResponse.transaction_amount} para el proyecto de ${externalReference.company || 'Cliente'}.`
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

// ==================== MIDDLEWARE DE MANEJO DE ERRORES ====================

app.use((err, req, res, next) => {
    console.error('❌ Error del servidor:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
});

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

// ==================== INICIO DEL SERVIDOR ====================

app.listen(PORT, () => {
    console.log(`🚀 Servidor en funcionamiento en el puerto ${PORT}`);
    console.log('Estado de variables de entorno:');
    console.log('ZOHO_USER:', process.env.ZOHO_USER ? 'Configurado ✓' : 'No configurado ✗');
    console.log('MP_ACCESS_TOKEN:', process.env.MP_ACCESS_TOKEN ? 'Configurado ✓' : 'No configurado ✗');
    console.log('PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID ? 'Configurado ✓' : 'No configurado ✗');
    console.log('PAYPAL_CLIENT_SECRET:', process.env.PAYPAL_CLIENT_SECRET ? 'Configurado ✓' : 'No configurado ✗');
});