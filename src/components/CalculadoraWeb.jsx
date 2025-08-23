// src/components/CalculadoraWeb.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmailService } from '../utils/emailService';
import { ExchangeService, formatUSD, formatARS } from '../utils/exchangeService';
import LinkedInShareButton from './LinkedInShareButton';

function WebCalculator() {
  const emailService = new EmailService();
  const fxService = new ExchangeService();

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
  const [fx, setFx] = useState({ rate: null, source: null, loading: false, error: null });

  // ===== Validación email (límite aumentado a 320)
  const [emailValidation, setEmailValidation] = useState({ isValid: false, message: '', touched: false });
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!email) return { isValid: false, message: '' };
    if (!emailRegex.test(email)) return { isValid: false, message: 'Formato de email inválido' };
    if (email.length > 320) return { isValid: false, message: 'Email demasiado largo' };
    const domain = email.split('@')[1];
    if (domain && domain.length < 2) return { isValid: false, message: 'Dominio inválido' };
    const disposableEmails = ['10minutemail.com','tempmail.org','guerrillamail.com','mailinator.com','temp-mail.org','throwaway.email','yopmail.com','maildrop.cc','sharklasers.com'];
    if (disposableEmails.some(d => domain?.toLowerCase().includes(d))) {
      return { isValid: false, message: 'Por favor usa un email profesional válido' };
    }
    return { isValid: true, message: 'Email válido' };
  };
  const handleEmailChange = (email) => { setFormData(p => ({ ...p, email })); if (emailValidation.touched) setEmailValidation({ ...validateEmail(email), touched: true }); };
  const handleEmailBlur = () => setEmailValidation({ ...validateEmail(formData.email), touched: true });

  // ===== Deep-link: abrir automáticamente con #web / ?tool=web / /calculadora-web
  useEffect(() => {
    const path = window.location.pathname || '';
    const q = new URLSearchParams(window.location.search);
    const hash = (window.location.hash || '').replace('#', '');
    if (hash === 'web' || q.get('tool') === 'web' || path.includes('/calculadora-web')) {
      setIsOpen(true);
    }
  }, []);

  // ===== Sincronizar URL al abrir/cerrar (sin recargar)
  const openWithUrl = () => {
    setIsOpen(true);
    const url = new URL(window.location.href);
    url.hash = 'web';
    url.searchParams.set('tool', 'web');
    window.history.replaceState({}, '', url.toString());
  };
  const closeAndCleanUrl = () => {
    setIsOpen(false);
    const url = new URL(window.location.href);
    if (url.hash === '#web') url.hash = '';
    if (url.searchParams.get('tool') === 'web') url.searchParams.delete('tool');
    window.history.replaceState({}, '', url.toString());
  };

  // ===== Datos
  const businessSectors = [
    { value: 'retail', label: 'Retail/Comercio', leadValue: 150, conversionRate: 0.03 },
    { value: 'services', label: 'Servicios Profesionales', leadValue: 500, conversionRate: 0.05 },
    { value: 'restaurant', label: 'Restaurante/Comida', leadValue: 80, conversionRate: 0.04 },
    { value: 'health', label: 'Salud/Medicina', leadValue: 300, conversionRate: 0.06 },
    { value: 'education', label: 'Educación', leadValue: 200, conversionRate: 0.04 },
    { value: 'real-estate', label: 'Inmobiliaria', leadValue: 2000, conversionRate: 0.02 },
    { value: 'consulting', label: 'Consultoría', leadValue: 1000, conversionRate: 0.05 },
    { value: 'technology', label: 'Tecnología', leadValue: 800, conversionRate: 0.04 },
    { value: 'manufacturing', label: 'Manufactura', leadValue: 1500, conversionRate: 0.03 },
    { value: 'other', label: 'Otro', leadValue: 300, conversionRate: 0.04 }
  ];

  const revenueRanges = [
    { value: '0-10k', label: 'Hasta $10K USD/mes', factor: 0.8 },
    { value: '10k-50k', label: '$10K - $50K USD/mes', factor: 1.0 },
    { value: '50k-100k', label: '$50K - $100K USD/mes', factor: 1.2 },
    { value: '100k-500k', label: '$100K - $500K USD/mes', factor: 1.5 },
    { value: '500k+', label: 'Más de $500K USD/mes', factor: 2.0 }
  ];

  const websiteTypes = [
    { value: 'landing', label: 'Landing Page', baseCost: 400, multiplier: 1.0 },
    { value: 'business', label: 'Sitio Web Empresarial', baseCost: 1000, multiplier: 1.2 },
    { value: 'ecommerce', label: 'E-commerce', baseCost: 2000, multiplier: 1.8 },
    { value: 'portfolio', label: 'Portfolio/Catálogo', baseCost: 1200, multiplier: 1.1 },
    { value: 'blog', label: 'Blog/Noticias', baseCost: 1500, multiplier: 1.3 },
    { value: 'webapp', label: 'Aplicación Web', baseCost: 6000, multiplier: 2.5 },
    { value: 'membership', label: 'Sitio de Membresías', baseCost: 2500, multiplier: 2.0 }
  ];

  const pageRanges = [
    { value: '1-3', label: '1-3 páginas', multiplier: 1.0 },
    { value: '4-8', label: '4-8 páginas', multiplier: 1.3 },
    { value: '9-15', label: '9-15 páginas', multiplier: 1.6 },
    { value: '16-30', label: '16-30 páginas', multiplier: 2.0 },
    { value: '30+', label: 'Más de 30 páginas', multiplier: 2.5 }
  ];

  const availableFeatures = [
    { value: 'contact-form', label: 'Formularios de Contacto', cost: 200 },
    { value: 'booking', label: 'Sistema de Reservas', cost: 600 },
    { value: 'payments', label: 'Pagos Online', cost: 500 },
    { value: 'user-login', label: 'Login de Usuarios', cost: 400 },
    { value: 'search', label: 'Búsqueda Avanzada', cost: 400 },
    { value: 'chat', label: 'Chat en Vivo', cost: 300 },
    { value: 'multilang', label: 'Multi-idioma', cost: 350 },
    { value: 'analytics', label: 'Analytics Avanzado', cost: 250 },
    { value: 'inventory', label: 'Gestión de Inventario', cost: 700 },
    { value: 'crm', label: 'Integración CRM', cost: 200 }
  ];

  const designLevels = [
    { value: 'basic', label: 'Básico - Plantilla Personalizada', multiplier: 1.0 },
    { value: 'custom', label: 'Personalizado - Diseño Único', multiplier: 1.5 },
    { value: 'premium', label: 'Premium - Diseño de Lujo', multiplier: 2.0 }
  ];

  const integrationOptions = [
    { value: 'email-marketing', label: 'Email Marketing (Mailchimp, etc.)', cost: 200 },
    { value: 'social-media', label: 'Redes Sociales', cost: 150 },
    { value: 'google-ads', label: 'Google Ads & Analytics', cost: 300 },
    { value: 'erp', label: 'Sistema ERP', cost: 1000 },
    { value: 'accounting', label: 'Software Contable', cost: 800 },
    { value: 'shipping', label: 'Sistemas de Envío', cost: 500 }
  ];

  // ===== Cálculo
  const calculateWebProject = () => {
    setLoading(true);
    setTimeout(() => {
      const sectorData = businessSectors.find(s => s.value === formData.sector);
      const websiteTypeData = websiteTypes.find(w => w.value === formData.websiteType);
      const pageData = pageRanges.find(p => p.value === formData.pageCount);
      const designData = designLevels.find(d => d.value === formData.designLevel);
      const revenueData = revenueRanges.find(r => r.value === formData.monthlyRevenue);

      const baseCost = websiteTypeData?.baseCost || 2000;
      const pageMultiplier = pageData?.multiplier || 1.0;
      const designMultiplier = designData?.multiplier || 1.0;

      const featuresCost = formData.features.reduce((acc, v) => {
        const f = availableFeatures.find(x => x.value === v);
        return acc + (f?.cost || 0);
      }, 0);

      const integrationsCost = formData.integrations.reduce((acc, v) => {
        const i = integrationOptions.find(x => x.value === v);
        return acc + (i?.cost || 0);
      }, 0);

      const developmentCost = Math.round((baseCost * pageMultiplier * designMultiplier) + featuresCost + integrationsCost);
      const urgencyMultiplier = formData.urgency === 'urgent' ? 1.5 : formData.urgency === 'normal' ? 1.0 : 0.9;
      const finalCost = Math.round(developmentCost * urgencyMultiplier);

      const leadValue = sectorData?.leadValue || 300;
      const conversionRate = sectorData?.conversionRate || 0.04;
      const revenueMultiplier = revenueData?.factor || 1.0;

      const monthlyVisitors = 1000 * revenueMultiplier;
      const monthlyLeads = Math.round(monthlyVisitors * conversionRate);
      const monthlyNewCustomers = Math.round(monthlyLeads * 0.2);
      const monthlyRevenue = monthlyNewCustomers * leadValue;
      const annualRevenue = monthlyRevenue * 12;

      const roi = Math.round(((annualRevenue - finalCost) / finalCost) * 100);
      const paybackMonths = Math.round((finalCost / (monthlyRevenue || 1)) * 10) / 10;

      const baseCalc = Math.round(baseCost * pageMultiplier * designMultiplier);
      const baseWeeks = websiteTypeData?.multiplier ? websiteTypeData.multiplier * 2 : 4;
      const complexityWeeks = Math.ceil((featuresCost + integrationsCost) / 1000);
      const totalWeeks = Math.round(baseWeeks + complexityWeeks);

      setResults({
        developmentCost: finalCost,
        developmentWeeks: totalWeeks,
        monthlyLeads,
        monthlyRevenue: Math.round(monthlyRevenue),
        annualRevenue: Math.round(annualRevenue),
        roi,
        paybackMonths,
        breakdown: {
          baseCost: baseCalc,
          featuresCost,
          integrationsCost,
          urgencyAdjustment: Math.round(developmentCost * (urgencyMultiplier - 1))
        },
        projections: {
          monthlyVisitors,
          conversionRate: Math.round(conversionRate * 100),
          leadValue
        }
      });

      setLoading(false);
      setStep(3);
    }, 800);
  };

  // Cotización al pasar a resultados
  useEffect(() => {
    const fetchRate = async () => {
      setFx(prev => ({ ...prev, loading: true, error: null }));
      try {
        const { rate, source } = await fxService.getLatest();
        setFx({ rate, source, loading: false, error: null });
      } catch {
        setFx({ rate: 1050, source: 'fallback', loading: false, error: 'No se pudo obtener cotización, usando fallback' });
      }
    };
    if (step === 3 && results && !fx.rate && !fx.loading) fetchRate();
  }, [step, results]); // eslint-disable-line

  // Helpers
  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter(i => i !== value) : [...prev[field], value]
    }));
  };

  const resetCalculator = () => {
    setStep(1);
    setFormData({
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
    setResults(null);
    setEmailStatus({ loading: false, sent: false, error: null });
    setEmailValidation({ isValid: false, message: '', touched: false });
    setFx({ rate: null, source: null, loading: false, error: null });
    closeAndCleanUrl(); // limpiar URL también al resetear
  };

  const sendWebLeadData = async () => {
    const emailValid = validateEmail(formData.email);
    if (!emailValid.isValid) {
      setEmailValidation({ ...emailValid, touched: true });
      alert('Por favor, ingresa un email válido antes de continuar.');
      return;
    }
    setEmailStatus({ loading: true, sent: false, error: null });
    try {
      const leadData = {
        ...formData,
        calculatedResults: results,
        timestamp: new Date().toISOString(),
        source: 'Web Development Calculator'
      };
      const response = await emailService.sendWebLead(leadData);
      if (response.success) {
        setEmailStatus({ loading: false, sent: true, error: null });
        const leads = JSON.parse(localStorage.getItem('web_leads') || '[]');
        leads.push(leadData);
        localStorage.setItem('web_leads', JSON.stringify(leads));
        alert(`¡Gracias ${formData.company}! Te enviaré una propuesta detallada en las próximas 24 horas.`);
      }
    } catch {
      setEmailStatus({ loading: false, sent: false, error: 'Error enviando información. Intenta por WhatsApp.' });
      alert('Error enviando información. Te contacto por WhatsApp para enviarte la propuesta.');
    }
  };

  const isStep1Valid = formData.company && formData.email && emailValidation.isValid && formData.sector && formData.monthlyRevenue;

  // URL pública del backend (Render) para compartir con OG tags
  const backendPublic = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');
  const shareUrl = backendPublic && results
    ? `${backendPublic}/share/web-proposal?` + new URLSearchParams({
        c: formData.company || 'Proyecto Web',
        usd: String(results.developmentCost || 0),
        ars: fx.rate ? String(Math.round(results.developmentCost * fx.rate)) : '',
        roi: String(results.roi || 0),
        w:   String(results.developmentWeeks || 0)
      }).toString()
    : (typeof window !== 'undefined' ? window.location.origin : '');

  return (
    <>
      {/* Botón flotante */}
      <motion.button
        onClick={openWithUrl}
        className="fixed bottom-20 left-6 z-40 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 2 }}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
        </svg>
        <span className="font-semibold">Cotizar Web</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeAndCleanUrl}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto relative"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Calculadora de Desarrollo Web</h2>
                    <p className="text-blue-100 mt-1">Descubre el costo y ROI de tu nuevo sitio web</p>
                  </div>
                  <button onClick={closeAndCleanUrl} className="text-white hover:text-blue-200 transition-colors">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-blue-100"><span>Paso {step} de 3</span></div>
                  <div className="mt-2 w-full bg-blue-600 rounded-full h-2">
                    <motion.div className="bg-white rounded-full h-2" initial={{ width: 0 }} animate={{ width: `${(step / 3) * 100}%` }} transition={{ duration: 0.5 }} />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Paso 1 */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Información de tu Negocio</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">Ayúdanos a entender tu negocio para calcularte un ROI personalizado</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre del Negocio *</label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Ej: Mi Empresa SA"
                          maxLength={120}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                        <div className="relative">
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleEmailChange(e.target.value)}
                            onBlur={handleEmailBlur}
                            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors ${
                              emailValidation.touched
                                ? emailValidation.isValid ? 'border-green-500 dark:border-green-500' : 'border-red-500 dark:border-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="tu@empresa.com"
                            maxLength={320}
                          />
                          {emailValidation.touched && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              {emailValidation.isValid ? (
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                              ) : (
                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                              )}
                            </div>
                          )}
                        </div>
                        {emailValidation.touched && emailValidation.message && (
                          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`text-xs mt-1 ${emailValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>{emailValidation.message}</motion.p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="+54 9 11 1234-5678"
                          maxLength={40}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sector del Negocio *</label>
                        <select value={formData.sector} onChange={(e) => handleInputChange('sector', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                          <option value="">Selecciona tu sector</option>
                          {businessSectors.map(sector => (<option key={sector.value} value={sector.value}>{sector.label}</option>))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ingresos Mensuales Actuales *</label>
                        <select value={formData.monthlyRevenue} onChange={(e) => handleInputChange('monthlyRevenue', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                          <option value="">Selecciona el rango</option>
                          {revenueRanges.map(range => (<option key={range.value} value={range.value}>{range.label}</option>))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">¿Cómo consigues clientes actualmente?</label>
                        <textarea
                          value={formData.currentClientMethod}
                          onChange={(e) => handleInputChange('currentClientMethod', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          rows={3}
                          placeholder="Ej: Redes sociales, recomendaciones, publicidad..."
                          maxLength={1000}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">¿Tienes sitio web actual?</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['No tengo', 'Básico/Desactualizado', 'Sí, pero quiero renovar'].map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleInputChange('currentWebsite', option)}
                            className={`p-3 border-2 rounded-lg text-center transition-colors ${formData.currentWebsite === option ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <motion.button
                        onClick={() => setStep(2)}
                        disabled={!isStep1Valid}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: isStep1Valid ? 1.02 : 1 }}
                        whileTap={{ scale: isStep1Valid ? 0.98 : 1 }}
                      >
                        Siguiente →
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Paso 2 */}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Requerimientos de tu Sitio Web</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">Selecciona las características que necesitás</p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Sitio Web *</label>
                          <select value={formData.websiteType} onChange={(e) => handleInputChange('websiteType', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                            <option value="">Selecciona el tipo</option>
                            {websiteTypes.map(type => (<option key={type.value} value={type.value}>{type.label}</option>))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Número de Páginas *</label>
                          <select value={formData.pageCount} onChange={(e) => handleInputChange('pageCount', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                            <option value="">Selecciona el rango</option>
                            {pageRanges.map(range => (<option key={range.value} value={range.value}>{range.label}</option>))}
                          </select>
                        </div>

                        <div>
                          <label className="block text sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nivel de Diseño *</label>
                          <select value={formData.designLevel} onChange={(e) => handleInputChange('designLevel', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                            <option value="">Selecciona el nivel</option>
                            {designLevels.map(level => (<option key={level.value} value={level.value}>{level.label}</option>))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Urgencia del Proyecto</label>
                          <select value={formData.urgency} onChange={(e) => handleInputChange('urgency', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                            <option value="">Selecciona urgencia</option>
                            <option value="relaxed">Sin prisa (3+ meses)</option>
                            <option value="normal">Normal (1-2 meses)</option>
                            <option value="urgent">Urgente (menos de 1 mes)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Funcionalidades Necesarias</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {availableFeatures.map(feature => (
                            <button key={feature.value} type="button" onClick={() => handleMultiSelect('features', feature.value)} className={`p-3 border-2 rounded-lg text-left transition-colors ${formData.features.includes(feature.value) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}>
                              <div className="font-medium">{feature.label}</div>
                              <div className="text-sm text-gray-500">+{formatUSD(feature.cost)}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Integraciones Requeridas</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {integrationOptions.map(integration => (
                            <button key={integration.value} type="button" onClick={() => handleMultiSelect('integrations', integration.value)} className={`p-3 border-2 rounded-lg text-left transition-colors ${formData.integrations.includes(integration.value) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}>
                              <div className="font-medium">{integration.label}</div>
                              <div className="text-sm text-gray-500">+{formatUSD(integration.cost)}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-6">
                      <motion.button onClick={() => setStep(1)} className="px-8 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        ← Anterior
                      </motion.button>
                      <motion.button
                        onClick={calculateWebProject}
                        disabled={!formData.websiteType || !formData.pageCount || !formData.designLevel}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      >
                        Calcular Proyecto 🚀
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Paso 3: Resultados + ARS + Share + Link de pago */}
                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Calculando tu proyecto personalizado...</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Analizando requerimientos y calculando ROI</p>
                      </div>
                    ) : results && (
                      <>
                        <div className="text-center mb-2">
                          <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">¡Tu Propuesta Web Personalizada!</h3>
                          <p className="text-gray-600 dark:text-gray-400 mt-2">Costo de desarrollo + ROI proyectado para {formData.company}</p>

                          {/* Compartir en LinkedIn con OG tags desde backend público */}
                          <LinkedInShareButton url={shareUrl} counter="right" className="mt-4 flex justify-center" fallback={false} />
                        </div>

                        {/* Métricas principales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-xl text-center">
                            <div className="text-2xl font-bold">{formatUSD(results.developmentCost)}</div>
                            <div className="text-blue-100 text-sm font-medium">Costo Total (USD)</div>
                            {fx.rate && <div className="mt-1 text-xs text-blue-100">≈ {formatARS(Math.round(results.developmentCost * fx.rate))}</div>}
                          </div>

                          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl text-center">
                            <div className="text-2xl font-bold">{results.roi}%</div>
                            <div className="text-green-100 text-sm font-medium">ROI Anual</div>
                          </div>

                          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl text-center">
                            <div className="text-2xl font-bold">{results.developmentWeeks}</div>
                            <div className="text-purple-100 text-sm font-medium">Semanas de Desarrollo</div>
                          </div>

                          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl text-center">
                            <div className="text-2xl font-bold">{formatUSD(results.monthlyRevenue)}</div>
                            <div className="text-orange-100 text-sm font-medium">Ingresos Extra/Mes</div>
                            {fx.rate && <div className="mt-1 text-xs text-orange-100">≈ {formatARS(Math.round(results.monthlyRevenue * fx.rate))}</div>}
                          </div>
                        </div>

                        {/* Detalles + cotización */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">💰 Desglose de Costos</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Desarrollo base:</span><span className="font-semibold">{formatUSD(results.breakdown.baseCost)}</span></div>
                              {results.breakdown.featuresCost > 0 && <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Funcionalidades extra:</span><span className="font-semibold">{formatUSD(results.breakdown.featuresCost)}</span></div>}
                              {results.breakdown.integrationsCost > 0 && <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Integraciones:</span><span className="font-semibold">{formatUSD(results.breakdown.integrationsCost)}</span></div>}
                              {results.breakdown.urgencyAdjustment > 0 && <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Ajuste por urgencia:</span><span className="font-semibold">{formatUSD(results.breakdown.urgencyAdjustment)}</span></div>}
                              <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between font-bold text-lg">
                                  <span>Total:</span>
                                  <span className="text-blue-600">{formatUSD(results.developmentCost)}</span>
                                </div>
                                {fx.rate && <div className="mt-1 text-sm text-gray-700 dark:text-gray-200">≈ {formatARS(Math.round(results.developmentCost * fx.rate))} <span className="ml-2 text-xs opacity-70">Cotización: ${fx.rate} ARS/USD ({fx.source})</span></div>}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">📈 Proyección de Resultados</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Visitantes mensuales:</span><span className="font-semibold">{results.projections.monthlyVisitors.toLocaleString()}</span></div>
                              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Leads mensuales:</span><span className="font-semibold">{results.monthlyLeads}</span></div>
                              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Tasa de conversión:</span><span className="font-semibold">{results.projections.conversionRate}%</span></div>
                              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Valor por lead:</span><span className="font-semibold">{formatUSD(results.projections.leadValue)}</span></div>
                              <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between font-bold"><span>Ingresos anuales extra:</span><span className="text-green-600">{formatUSD(results.annualRevenue)}</span></div>
                                {fx.rate && <div className="mt-1 text-sm text-gray-700 dark:text-gray-200">≈ {formatARS(Math.round(results.annualRevenue * fx.rate))}</div>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* CTA: Enviar + WhatsApp + Link de pago fijo */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-6 text-center">
                          <h4 className="text-xl font-bold mb-2">¿Listo para aumentar tus ventas online?</h4>
                          <p className="text-blue-100 mb-4">Te envío una propuesta detallada con plan de desarrollo y garantías</p>

                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <motion.button
                              onClick={sendWebLeadData}
                              disabled={emailStatus.loading}
                              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              whileHover={{ scale: emailStatus.loading ? 1 : 1.05 }}
                              whileTap={{ scale: emailStatus.loading ? 1 : 0.95 }}
                            >
                              {emailStatus.loading ? 'Enviando...' : 'Solicitar Propuesta'}
                            </motion.button>

                            <a
                              href="https://link.mercadopago.com.ar/marianoaliandri"
                              target="_blank" rel="noopener noreferrer"
                              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold"
                            >
                              💳 Pagar por link (Mercado Pago)
                            </a>

                            <motion.button
                              onClick={() => {
                                const msg = `Hola! Calculé mi sitio web:\n\nEmpresa: ${formData.company}\nCosto: ${formatUSD(results.developmentCost)}${fx.rate ? ` (~ ${formatARS(Math.round(results.developmentCost * fx.rate))})` : ''}\nROI: ${results.roi}%\nTiempo: ${results.developmentWeeks} semanas\n\n¿Agendamos una reunión?`;
                                window.open(`https://wa.me/+542995414422?text=${encodeURIComponent(msg)}`, '_blank');
                              }}
                              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            >
                              💬 WhatsApp Directo
                            </motion.button>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                          <motion.button onClick={resetCalculator} className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            🔄 Nueva Cotización
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              const txt = `Calculadora Web - ${formData.company}\n\nCosto desarrollo: ${formatUSD(results.developmentCost)}${fx.rate ? ` (~ ${formatARS(Math.round(results.developmentCost * fx.rate))})` : ''}\nTiempo: ${results.developmentWeeks} semanas\nROI proyectado: ${results.roi}%\nIngresos/año: ${formatUSD(results.annualRevenue)}${fx.rate ? ` (~ ${formatARS(Math.round(results.annualRevenue * fx.rate))})` : ''}\n\n${new Date().toLocaleDateString('es-AR')}`;
                              navigator.share?.({ title: `Calculadora Web - ${formData.company}`, text: txt }) || navigator.clipboard?.writeText(txt);
                            }}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          >
                            📊 Compartir Propuesta (copiar)
                          </motion.button>
                        </div>
                      </>
                    )}
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

export default WebCalculator;

