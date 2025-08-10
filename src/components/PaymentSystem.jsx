import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Shield, CheckCircle, AlertCircle, X } from 'lucide-react';

// ==========================================================
// 🚨 CONFIGURACIÓN: ASEGÚRATE DE TENER ESTAS VARIABLES DE ENTORNO EN TU .env
// ==========================================================
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const MERCADOPAGO_PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
// ==========================================================

// El componente ahora acepta props para ser reutilizable
const PaymentSystem = ({ visible, onClose, initialAmount, initialDescription, clientData }) => {
    const [selectedMethod, setSelectedMethod] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);

    // Efecto para actualizar el estado cuando el modal se abre con nuevos datos
    useEffect(() => {
        if (visible) {
            setAmount(initialAmount || '');
            setDescription(initialDescription || '');
            setPaymentStatus(null); // Limpia estados anteriores
            setSelectedMethod(''); // Deselecciona método anterior
            
            // Inicializa los SDK de pago solo cuando el modal es visible
            initMercadoPago();
            if (document.getElementById('paypal-button-container')) {
                // Limpiar el contenedor de PayPal para evitar duplicados
                document.getElementById('paypal-button-container').innerHTML = '';
            }
            initPayPal();
        }
    }, [visible, initialAmount, initialDescription]);


    // Lógica para manejar el retorno de MercadoPago (sin cambios)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        if (status) {
            window.history.replaceState({}, document.title, window.location.pathname);
            switch (status) {
                case 'success': setPaymentStatus({ type: 'success', message: '¡Pago completado exitosamente!' }); break;
                case 'failure': setPaymentStatus({ type: 'error', message: 'El pago no pudo ser procesado.' }); break;
                case 'pending': setPaymentStatus({ type: 'info', message: 'El pago está pendiente de aprobación.' }); break;
                default: break;
            }
        }
    }, []);

    const initMercadoPago = () => {
        if (window.mp) return; // Evitar reinicializar
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.onload = () => {
            if (window.MercadoPago && MERCADOPAGO_PUBLIC_KEY) {
                window.mp = new window.MercadoPago(MERCADOPAGO_PUBLIC_KEY, { locale: 'es-AR' });
            }
        };
        document.head.appendChild(script);
    };

    const initPayPal = () => {
        if (!PAYPAL_CLIENT_ID || !document.getElementById('paypal-button-container')) return;
        
        const scriptId = 'paypal-sdk-script';
        if (document.getElementById(scriptId)) {
            renderPayPalButtons();
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
        script.onload = () => renderPayPalButtons();
        document.head.appendChild(script);
    };
    
    const renderPayPalButtons = () => {
        if (window.paypal && document.getElementById('paypal-button-container')) {
            // Limpiar botones existentes para evitar duplicados
            document.getElementById('paypal-button-container').innerHTML = '';

            window.paypal.Buttons({
                createOrder: async () => {
                    try {
                        const response = await fetch(`${BACKEND_URL}/api/create-paypal-payment`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                amount: parseFloat(amount) || 10.00,
                                projectData: { description },
                                clientData: { 
                                    company: clientData?.company || 'Cliente', 
                                    email: clientData?.email || 'cliente@ejemplo.com' 
                                },
                                paymentType: 'full'
                            })
                        });
                        if (!response.ok) throw new Error('Error en la respuesta del servidor de PayPal.');
                        const order = await response.json();
                        return order.order_id; // Debería ser order.order_id según tu backend
                    } catch (error) {
                        setPaymentStatus({ type: 'error', message: `Error al crear orden de PayPal: ${error.message}` });
                        return Promise.reject(error);
                    }
                },
                onApprove: (data, actions) => {
                    return actions.order.capture().then((details) => {
                        setPaymentStatus({ type: 'success', message: `Pago completado. ID: ${details.id}` });
                    });
                },
                onError: (err) => {
                    setPaymentStatus({ type: 'error', message: 'Error en el pago con PayPal.' });
                }
            }).render('#paypal-button-container');
        }
    };

    const handleMercadoPagoPayment = async () => {
        if (!amount || !description) {
            setPaymentStatus({ type: 'error', message: 'Por favor completa todos los campos' });
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/create-web-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    projectData: { description },
                    clientData: {
                        company: clientData?.company || 'Cliente',
                        email: clientData?.email || 'cliente@email.com',
                        phone: clientData?.phone || ''
                    },
                    paymentType: 'full'
                })
            });
            const data = await response.json();
            if (data.success) {
                window.location.href = data.init_point;
            } else {
                throw new Error(data.error || 'Error al crear el pago');
            }
        } catch (error) {
            setPaymentStatus({ type: 'error', message: `Error al procesar el pago: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };
    
    // El resto del JSX se mantiene igual
    const paymentMethods = [{ id: 'mercadopago', name: 'MercadoPago', description: 'Tarjetas de crédito/débito, efectivo', logo: '💳', color: 'bg-blue-500' }, { id: 'paypal', name: 'PayPal', description: 'Pago seguro internacional', logo: '🅿️', color: 'bg-yellow-500' }];
    const getStatusColors = (type) => { switch (type) { case 'success': return 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'; case 'error': return 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'; case 'info': return 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'; default: return ''; } };

    if (!visible) return null;

    return (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="relative max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full sm:w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 m-4 z-[10001]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <X className="w-6 h-6" />
                </button>
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">Sistema de Pagos</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">Selecciona tu método de pago preferido para el servicio.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción del servicio</label>
                            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Desarrollo web personalizado" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors" readOnly />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monto (USD)</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100.00" min="1" step="0.01" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors" readOnly />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Método de pago</label>
                            <div className="space-y-4">{paymentMethods.map((method) => (<div key={method.id} className={`p-5 border rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${selectedMethod === method.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`} onClick={() => setSelectedMethod(method.id)}><div className="flex items-center space-x-4"><div className={`w-12 h-12 ${method.color} rounded-full flex-shrink-0 flex items-center justify-center text-white text-xl shadow-lg`}>{method.logo}</div><div><h3 className="font-bold text-lg text-gray-900 dark:text-white">{method.name}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{method.description}</p></div></div></div>))}</div>
                        </motion.div>
                    </div>
                    <div className="space-y-6">
                        <AnimatePresence mode="wait">
                            {selectedMethod === 'mercadopago' && ( <motion.div key="mercadopago" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="p-8 bg-gray-50 dark:bg-gray-700 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-600"><h3 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">Pagar con MercadoPago</h3><button onClick={handleMercadoPagoPayment} disabled={isLoading || !amount || !description} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]">{isLoading ? 'Procesando...' : `Pagar con MercadoPago`}</button><p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">Serás redirigido para completar el pago de forma segura.</p></motion.div>)}
                            {selectedMethod === 'paypal' && ( <motion.div key="paypal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="p-8 bg-gray-50 dark:bg-gray-700 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-600"><h3 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">Pagar con PayPal</h3><div id="paypal-button-container" className="w-full"></div></motion.div>)}
                            {!selectedMethod && ( <motion.div key="placeholder" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} className="p-8 bg-gray-50 dark:bg-gray-700 rounded-2xl shadow-inner text-center flex flex-col items-center justify-center h-full min-h-[250px] border border-gray-200 dark:border-gray-600"><CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse"/><p className="text-lg text-gray-600 dark:text-gray-400 font-medium">Selecciona una opción de pago</p></motion.div>)}
                        </AnimatePresence>
                        <AnimatePresence>{paymentStatus && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`p-5 rounded-xl flex items-center space-x-4 shadow-md ${getStatusColors(paymentStatus.type)}`}>{paymentStatus.type === 'success' && <CheckCircle className="w-6 h-6"/>}{paymentStatus.type === 'error' && <AlertCircle className="w-6 h-6"/>}<span className="text-sm font-medium">{paymentStatus.message}</span></motion.div>)}</AnimatePresence>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl shadow-inner border border-green-200 dark:border-green-800"><div className="flex items-center space-x-3 mb-2"><Shield className="w-6 h-6 text-green-600"/><span className="font-bold text-lg text-green-800 dark:text-green-300">Pagos Seguros</span></div><p className="text-sm text-green-700 dark:text-green-400">Todos los pagos están protegidos con cifrado SSL y son procesados por plataformas certificadas.</p></motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSystem;