import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  DollarSign,
  Briefcase,
  Mail,
  Smartphone,
  BarChart2,
  Globe,
  Layout,
  Layers,
  Feather,
  GitMerge,
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  ShoppingCart,
  Book,
  Code,
  Users,
  CreditCard,
  Lock,
} from 'lucide-react';

// Importamos el componente de pagos unificado
import PaymentSystem from './PaymentSystem';

// Clase simulada para el servicio de email (puedes reemplazarla por tu llamada real a la API)
class EmailService {
  async sendWebLead(leadData) {
    console.log('Simulando envío de lead:', leadData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  }
}

function WebCalculator() {
  const emailService = new EmailService();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company: '',
    email: '',
    phone: '',
    sector: '',
    monthlyRevenue: '',
    currentClientMethod: '',
    currentWebsite: '',
    websiteType: '',
    pageCount: '',
    features: [],
    designLevel: '',
    integrations: [],
    urgency: '',
    budget: ''
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ loading: false, sent: false, error: null });

  const [emailValidation, setEmailValidation] = useState({
    isValid: false,
    message: '',
    touched: false
  });

  // Este estado ahora solo controla la visibilidad del modal de pago externo
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Estados para el modal de mensajes (sin cambios)
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customModalContent, setCustomModalContent] = useState({
    title: '',
    message: '',
    type: 'info'
  });

  const showMessageModal = (title, message, type) => {
    setCustomModalContent({ title, message, type });
    setShowCustomModal(true);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!email) return { isValid: false, message: '' };
    if (!emailRegex.test(email)) return { isValid: false, message: 'Formato de email inválido' };
    const disposableEmails = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com'];
    const domain = email.split('@')[1];
    if (disposableEmails.some(d => domain?.toLowerCase().includes(d))) return { isValid: false, message: 'Por favor usa un email profesional' };
    return { isValid: true, message: 'Email válido' };
  };

  const handleEmailChange = (email) => {
    setFormData(prev => ({ ...prev, email }));
    if (emailValidation.touched) {
      setEmailValidation({ ...validateEmail(email), touched: true });
    }
  };

  const handleEmailBlur = () => {
    setEmailValidation({ ...validateEmail(formData.email), touched: true });
  };
  
  // Definiciones de datos (sin cambios)
  const businessSectors = [{ value: 'retail', label: 'Retail/Comercio', leadValue: 150, conversionRate: 0.03 }, { value: 'services', label: 'Servicios Profesionales', leadValue: 500, conversionRate: 0.05 }, { value: 'restaurant', label: 'Restaurante/Comida', leadValue: 80, conversionRate: 0.04 }, { value: 'health', label: 'Salud/Medicina', leadValue: 300, conversionRate: 0.06 }, { value: 'education', label: 'Educación', leadValue: 200, conversionRate: 0.04 }, { value: 'real-estate', label: 'Inmobiliaria', leadValue: 2000, conversionRate: 0.02 }, { value: 'consulting', label: 'Consultoría', leadValue: 1000, conversionRate: 0.05 }, { value: 'technology', label: 'Tecnología', leadValue: 800, conversionRate: 0.04 }, { value: 'manufacturing', label: 'Manufactura', leadValue: 1500, conversionRate: 0.03 }, { value: 'other', label: 'Otro', leadValue: 300, conversionRate: 0.04 }];
  const revenueRanges = [{ value: '0-10k', label: 'Hasta $10K USD/mes', factor: 0.8 }, { value: '10k-50k', label: '$10K - $50K USD/mes', factor: 1.0 }, { value: '50k-100k', label: '$50K - $100K USD/mes', factor: 1.2 }, { value: '100k-500k', label: '$100K - $500K USD/mes', factor: 1.5 }, { value: '500k+', label: 'Más de $500K USD/mes', factor: 2.0 }];
  const websiteTypes = [{ value: 'landing', label: 'Landing Page', baseCost: 400, multiplier: 1.0 }, { value: 'business', label: 'Sitio Web Empresarial', baseCost: 1000, multiplier: 1.2 }, { value: 'ecommerce', label: 'E-commerce', baseCost: 2000, multiplier: 1.8 }, { value: 'portfolio', label: 'Portfolio/Catálogo', baseCost: 1200, multiplier: 1.1 }, { value: 'blog', label: 'Blog/Noticias', baseCost: 1500, multiplier: 1.3 }, { value: 'webapp', label: 'Aplicación Web', baseCost: 6000, multiplier: 2.5 }, { value: 'membership', label: 'Sitio de Membresías', baseCost: 2500, multiplier: 2.0 }];
  const pageRanges = [{ value: '1-3', label: '1-3 páginas', multiplier: 1.0 }, { value: '4-8', label: '4-8 páginas', multiplier: 1.3 }, { value: '9-15', label: '9-15 páginas', multiplier: 1.6 }, { value: '16-30', label: '16-30 páginas', multiplier: 2.0 }, { value: '30+', label: 'Más de 30 páginas', multiplier: 2.5 }];
  const availableFeatures = [{ value: 'contact-form', label: 'Formularios de Contacto', cost: 200 }, { value: 'booking', label: 'Sistema de Reservas', cost: 600 }, { value: 'payments', label: 'Pagos Online', cost: 500 }, { value: 'user-login', label: 'Login de Usuarios', cost: 400 }, { value: 'search', label: 'Búsqueda Avanzada', cost: 400 }, { value: 'chat', label: 'Chat en Vivo', cost: 300 }, { value: 'multilang', label: 'Multi-idioma', cost: 350 }, { value: 'analytics', label: 'Analytics Avanzado', cost: 250 }, { value: 'inventory', label: 'Gestión de Inventario', cost: 700 }, { value: 'crm', label: 'Integración CRM', cost: 200 }];
  const designLevels = [{ value: 'basic', label: 'Básico - Plantilla Personalizada', multiplier: 1.0 }, { value: 'custom', label: 'Personalizado - Diseño Único', multiplier: 1.5 }, { value: 'premium', label: 'Premium - Diseño de Lujo', multiplier: 2.0 }];
  const integrationOptions = [{ value: 'email-marketing', label: 'Email Marketing (Mailchimp, etc.)', cost: 200 }, { value: 'social-media', label: 'Redes Sociales', cost: 150 }, { value: 'google-ads', label: 'Google Ads & Analytics', cost: 300 }, { value: 'erp', label: 'Sistema ERP', cost: 1000 }, { value: 'accounting', label: 'Software Contable', cost: 800 }, { value: 'shipping', label: 'Sistemas de Envío', cost: 500 }];

  // Todas las funciones de cálculo, input, etc. se mantienen igual (sin cambios)
  const calculateWebProject = () => { setLoading(true); setTimeout(() => { const sectorData = businessSectors.find(s => s.value === formData.sector); const websiteTypeData = websiteTypes.find(w => w.value === formData.websiteType); const pageData = pageRanges.find(p => p.value === formData.pageCount); const designData = designLevels.find(d => d.value === formData.designLevel); const revenueData = revenueRanges.find(r => r.value === formData.monthlyRevenue); let baseCost = websiteTypeData?.baseCost || 2000; const pageMultiplier = pageData?.multiplier || 1.0; const designMultiplier = designData?.multiplier || 1.0; const featuresCost = formData.features.reduce((total, featureValue) => { const feature = availableFeatures.find(f => f.value === featureValue); return total + (feature?.cost || 0); }, 0); const integrationsCost = formData.integrations.reduce((total, integrationValue) => { const integration = integrationOptions.find(i => i.value === integrationValue); return total + (integration?.cost || 0); }, 0); const developmentCost = Math.round((baseCost * pageMultiplier * designMultiplier) + featuresCost + integrationsCost); const urgencyMultiplier = formData.urgency === 'urgent' ? 1.5 : formData.urgency === 'normal' ? 1.0 : 0.9; const finalCost = Math.round(developmentCost * urgencyMultiplier); const leadValue = sectorData?.leadValue || 300; const conversionRate = sectorData?.conversionRate || 0.04; const revenueMultiplier = revenueData?.factor || 1.0; const monthlyVisitors = 1000 * revenueMultiplier; const monthlyLeads = Math.round(monthlyVisitors * conversionRate); const monthlyNewCustomers = Math.round(monthlyLeads * 0.2); const monthlyRevenue = monthlyNewCustomers * leadValue; const annualRevenue = monthlyRevenue * 12; const roi = Math.round(((annualRevenue - finalCost) / finalCost) * 100); const paybackMonths = Math.round((finalCost / monthlyRevenue) * 10) / 10; const baseWeeks = websiteTypeData?.multiplier ? websiteTypeData.multiplier * 2 : 4; const complexityWeeks = Math.ceil((featuresCost + integrationsCost) / 1000); const totalWeeks = Math.round(baseWeeks + complexityWeeks); setResults({ developmentCost: finalCost, developmentWeeks: totalWeeks, monthlyLeads, monthlyRevenue: Math.round(monthlyRevenue), annualRevenue: Math.round(annualRevenue), roi, paybackMonths, breakdown: { baseCost: Math.round(baseCost * pageMultiplier * designMultiplier), featuresCost, integrationsCost, urgencyAdjustment: Math.round(developmentCost * (urgencyMultiplier - 1)) }, projections: { monthlyVisitors, conversionRate: Math.round(conversionRate * 100), leadValue } }); setLoading(false); setStep(3); }, 2000); };
  const handleInputChange = (field, value) => { setFormData(prev => ({ ...prev, [field]: value })); };
  const handleMultiSelect = (field, value) => { setFormData(prev => ({ ...prev, [field]: prev[field].includes(value) ? prev[field].filter(item => item !== value) : [...prev[field], value] })); };
  const resetCalculator = () => { setStep(1); setFormData({ company: '', email: '', phone: '', sector: '', monthlyRevenue: '', currentClientMethod: '', currentWebsite: '', websiteType: '', pageCount: '', features: [], designLevel: '', integrations: [], urgency: '', budget: '' }); setResults(null); setEmailStatus({ loading: false, sent: false, error: null }); setEmailValidation({ isValid: false, message: '', touched: false }); };
  const sendWebLeadData = async () => { const emailValid = validateEmail(formData.email); if (!emailValid.isValid) { setEmailValidation({ ...emailValid, touched: true }); showMessageModal('Error de validación', 'Por favor, ingresa un email válido antes de continuar.', 'error'); return; } setEmailStatus({ loading: true, sent: false, error: null }); try { const leadData = { ...formData, calculatedResults: results, timestamp: new Date().toISOString(), source: 'Web Development Calculator', }; console.log('Web Lead generado:', leadData); const response = await emailService.sendWebLead(leadData); if (response.success) { setEmailStatus({ loading: false, sent: true, error: null }); showMessageModal('¡Gracias!', `¡Gracias ${formData.company}! Te enviaré una propuesta detallada en las próximas 24 horas.`, 'success'); } } catch (error) { console.error('Error enviando Web lead:', error); setEmailStatus({ loading: false, sent: false, error: 'Error enviando información. Intenta por WhatsApp.', }); showMessageModal('Error al enviar', 'Error enviando información. Te contacto por WhatsApp para enviarte la propuesta.', 'error'); } };
  const formatCurrency = (amount) => { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0, }).format(amount); };
  
  // Función simplificada para abrir el modal de pago
  const openPaymentModal = () => {
    setShowPaymentModal(true);
  };
  
  const isStep1Valid = formData.company && formData.email && emailValidation.isValid && formData.sector && formData.monthlyRevenue;
  const isStep2Valid = formData.websiteType && formData.pageCount && formData.designLevel && formData.urgency;

  return (
    <>
      {/* Botón flotante para abrir calculadora */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-6 z-40 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <BarChart2 className="w-5 h-5" />
        <span className="font-semibold">Cotizar Web</span>
      </motion.button>

      {/* Modal de mensajes personalizados (sin cambios) */}
      <AnimatePresence>
        {showCustomModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCustomModal(false)}
          >
            <motion.div
              className={`bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full mx-auto p-6 shadow-2xl relative`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-2 font-bold text-lg ${ customModalContent.type === 'success' ? 'text-green-600' : customModalContent.type === 'error' ? 'text-red-600' : 'text-blue-600' }`}>
                  {customModalContent.type === 'success' && <CheckCircle size={20} />}
                  {customModalContent.type === 'error' && <AlertTriangle size={20} />}
                  {customModalContent.type === 'info' && <Info size={20} />}
                  {customModalContent.title}
                </div>
                <button onClick={() => setShowCustomModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {customModalContent.message}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AQUÍ RENDERIZAMOS EL COMPONENTE DE PAGO EXTERNO 
        Le pasamos todos los datos necesarios como props.
      */}
      <PaymentSystem
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        initialAmount={results?.developmentCost.toString()}
        initialDescription={`Desarrollo web para ${formData.company}`}
        clientData={{
          company: formData.company,
          email: formData.email,
          phone: formData.phone
        }}
      />

      {/* Modal de la calculadora (sin el modal de pago anidado) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header con barra de progreso (sin cambios) */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Calculadora de Desarrollo Web</h2>
                    <p className="text-blue-100 mt-1">Descubre el costo y ROI de tu nuevo sitio web</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-white hover:text-blue-200 transition-colors">
                    <X className="w-8 h-8" />
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-blue-100">
                    <span>Paso {step} de 3</span>
                  </div>
                  <div className="mt-2 w-full bg-blue-600 rounded-full h-2">
                    <motion.div
                      className="bg-white rounded-full h-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${(step / 3) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Paso 1, 2 y 3 (sin cambios en su lógica interna) */}
                
                {/* Paso 1: Información del negocio */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    {/* ... Contenido del paso 1 sin cambios ... */}
                     <div className="text-center mb-8"><h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Información de tu Negocio</h3><p className="text-gray-600 dark:text-gray-400 mt-2">Ayúdanos a entender tu negocio para calcularte un ROI personalizado</p></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Briefcase className="inline-block h-4 w-4 mr-1"/> Nombre del Negocio *</label><input type="text" value={formData.company} onChange={(e) => handleInputChange('company', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required/></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Mail className="inline-block h-4 w-4 mr-1"/> Email Profesional *</label><input type="email" value={formData.email} onChange={(e) => handleEmailChange(e.target.value)} onBlur={handleEmailBlur} className={`w-full px-4 py-2 border rounded-md focus:ring-2 ${emailValidation.touched && !emailValidation.isValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`} required/>{emailValidation.touched && !emailValidation.isValid && (<p className="text-red-500 text-xs mt-1">{emailValidation.message}</p>)}</div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Smartphone className="inline-block h-4 w-4 mr-1"/> Teléfono</label><input type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><BarChart2 className="inline-block h-4 w-4 mr-1"/> Sector de Negocio *</label><select value={formData.sector} onChange={(e) => handleInputChange('sector', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required><option value="">Selecciona una opción</option>{businessSectors.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}</select></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><DollarSign className="inline-block h-4 w-4 mr-1"/> Ingreso Mensual Estimado *</label><select value={formData.monthlyRevenue} onChange={(e) => handleInputChange('monthlyRevenue', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required><option value="">Selecciona una opción</option>{revenueRanges.map(r => (<option key={r.value} value={r.value}>{r.label}</option>))}</select></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Globe className="inline-block h-4 w-4 mr-1"/> ¿Tienes un sitio web actual?</label><select value={formData.currentWebsite} onChange={(e) => handleInputChange('currentWebsite', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"><option value="">No</option><option value="yes">Sí</option></select></div></div><div className="mt-8 flex justify-end"><motion.button onClick={() => setStep(2)} className={`bg-blue-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 ${!isStep1Valid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`} whileHover={isStep1Valid ? { scale: 1.05 } : {}} whileTap={isStep1Valid ? { scale: 0.95 } : {}} disabled={!isStep1Valid}>Siguiente</motion.button></div>
                  </motion.div>
                )}

                {/* Paso 2: Detalles del proyecto */}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    {/* ... Contenido del paso 2 sin cambios ... */}
                    <div className="text-center mb-8"><h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Detalles de tu Proyecto Web</h3><p className="text-gray-600 dark:text-gray-400 mt-2">Elige las características y diseño que mejor se adapten a tu visión</p></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Layout className="inline-block h-4 w-4 mr-1"/> Tipo de Sitio Web *</label><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{websiteTypes.map(type => (<button key={type.value} onClick={() => handleInputChange('websiteType', type.value)} className={`p-4 rounded-lg border-2 text-left transition-all ${formData.websiteType === type.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-400 dark:bg-gray-700'}`}><span className="font-semibold text-gray-900 dark:text-gray-100">{type.label}</span><span className="block text-sm text-gray-600 dark:text-gray-400 mt-1">Desde {formatCurrency(type.baseCost)}</span></button>))}</div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Layers className="inline-block h-4 w-4 mr-1"/> Cantidad de Páginas *</label><select value={formData.pageCount} onChange={(e) => handleInputChange('pageCount', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required><option value="">Selecciona una opción</option>{pageRanges.map(p => (<option key={p.value} value={p.value}>{p.label}</option>))}</select></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Feather className="inline-block h-4 w-4 mr-1"/> Nivel de Diseño *</label><select value={formData.designLevel} onChange={(e) => handleInputChange('designLevel', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required><option value="">Selecciona una opción</option>{designLevels.map(d => (<option key={d.value} value={d.value}>{d.label}</option>))}</select></div></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Code className="inline-block h-4 w-4 mr-1"/> Funcionalidades Adicionales</label><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{availableFeatures.map(f => (<div key={f.value} onClick={() => handleMultiSelect('features', f.value)} className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${formData.features.includes(f.value) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-400 dark:bg-gray-700'}`}><span className="font-semibold text-gray-900 dark:text-gray-100">{f.label}</span><span className="block text-sm text-gray-600 dark:text-gray-400 mt-1">+{formatCurrency(f.cost)}</span></div>))}</div></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><GitMerge className="inline-block h-4 w-4 mr-1"/> Integraciones</label><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{integrationOptions.map(i => (<div key={i.value} onClick={() => handleMultiSelect('integrations', i.value)} className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${formData.integrations.includes(i.value) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-400 dark:bg-gray-700'}`}><span className="font-semibold text-gray-900 dark:text-gray-100">{i.label}</span><span className="block text-sm text-gray-600 dark:text-gray-400 mt-1">+{formatCurrency(i.cost)}</span></div>))}</div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Clock className="inline-block h-4 w-4 mr-1"/> Nivel de Urgencia *</label><select value={formData.urgency} onChange={(e) => handleInputChange('urgency', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required><option value="">Selecciona una opción</option><option value="normal">Normal (3-6 meses)</option><option value="urgent">Urgente (1-2 meses)</option><option value="flexible">Flexible (+6 meses)</option></select></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><DollarSign className="inline-block h-4 w-4 mr-1"/> Presupuesto</label><select value={formData.budget} onChange={(e) => handleInputChange('budget', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"><option value="">No definido</option><option value="<5k">Menos de $5,000 USD</option><option value="5k-10k">$5,000 - $10,000 USD</option><option value="10k-20k">$10,000 - $20,000 USD</option><option value="20k+">Más de $20,000 USD</option></select></div></div><div className="mt-8 flex justify-between"><motion.button onClick={() => setStep(1)} className="bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 hover:bg-gray-400" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><ChevronLeft className="inline-block h-4 w-4 mr-2"/>Anterior</motion.button><motion.button onClick={calculateWebProject} className={`bg-blue-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 ${!isStep2Valid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`} whileHover={isStep2Valid ? { scale: 1.05 } : {}} whileTap={isStep2Valid ? { scale: 0.95 } : {}} disabled={!isStep2Valid}>{loading ? 'Calculando...' : 'Ver Resultados'}</motion.button></div>
                  </motion.div>
                )}

                {/* Paso 3: Resultados */}
                {step === 3 && results && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    {/* ... Contenido del paso 3 sin cambios ... */}
                    <div className="text-center mb-8"><h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">¡Tu Presupuesto Estimado está Listo!</h3><p className="text-gray-600 dark:text-gray-400 mt-2">Aquí tienes el resumen de tu proyecto web y una estimación de su impacto.</p></div><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><motion.div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}><h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">💰 Costo de tu Proyecto</h4><div className="space-y-3"><div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Costo Base:</span><span className="font-semibold">{formatCurrency(results.breakdown.baseCost)}</span></div><div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Funcionalidades:</span><span className="font-semibold">{formatCurrency(results.breakdown.featuresCost)}</span></div><div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Integraciones:</span><span className="font-semibold">{formatCurrency(results.breakdown.integrationsCost)}</span></div>{results.breakdown.urgencyAdjustment > 0 && (<div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Ajuste por urgencia:</span><span className="font-semibold">{formatCurrency(results.breakdown.urgencyAdjustment)}</span></div>)}<div className="border-t pt-2 mt-2"><div className="flex justify-between font-bold text-lg"><span>Total:</span><span className="text-blue-600">{formatCurrency(results.developmentCost)}</span></div></div></div></motion.div><motion.div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}><h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">📈 Proyección de Resultados</h4><div className="space-y-3"><div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Potencial de Ingresos Anuales:</span><span className="font-semibold">{formatCurrency(results.annualRevenue)}</span></div><div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">ROI Anual Estimado:</span><span className={`font-semibold ${results.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>{results.roi}%</span></div><div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Tiempo de Recuperación:</span><span className="font-semibold">{results.paybackMonths} meses</span></div><div className="border-t pt-2 mt-2"><div className="flex justify-between font-bold text-lg"><span>Tiempo de Desarrollo:</span><span className="text-blue-600">{results.developmentWeeks} semanas</span></div></div></div></motion.div></div>
                    {/* Botones de acción (el onClick de "Pagar Ahora" se mantiene) */}
                    <motion.div className="mt-8 flex flex-col md:flex-row justify-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                      <motion.button onClick={sendWebLeadData} className="bg-green-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 hover:bg-green-600 flex items-center justify-center gap-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={emailStatus.loading || emailStatus.sent}> {emailStatus.loading ? (<><Zap className="animate-pulse"/> Enviando...</>) : emailStatus.sent ? (<><CheckCircle/> Enviado</>) : (<><Mail/> Recibir Propuesta</>)} </motion.button>
                      <motion.button onClick={openPaymentModal} className="bg-indigo-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 hover:bg-indigo-600 flex items-center justify-center gap-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}> <DollarSign/> Pagar Ahora </motion.button>
                      <motion.button onClick={resetCalculator} className="bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 hover:bg-gray-400 flex items-center justify-center gap-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}> <ChevronLeft/> Volver a Calcular </motion.button>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return <WebCalculator />;
}