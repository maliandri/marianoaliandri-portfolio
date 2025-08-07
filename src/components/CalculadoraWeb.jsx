// src/components/Calculadora.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmailService } from '../utils/emailService'; // Importa la clase completa

function WebCalculator() {
  const emailService = new EmailService(); // Crea una nueva instancia de la clase
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
    { value: 'landing', label: 'Landing Page', baseCost: 800, multiplier: 1.0 },
    { value: 'business', label: 'Sitio Web Empresarial', baseCost: 2000, multiplier: 1.2 },
    { value: 'ecommerce', label: 'E-commerce', baseCost: 4000, multiplier: 1.8 },
    { value: 'portfolio', label: 'Portfolio/Catálogo', baseCost: 1200, multiplier: 1.1 },
    { value: 'blog', label: 'Blog/Noticias', baseCost: 1500, multiplier: 1.3 },
    { value: 'webapp', label: 'Aplicación Web', baseCost: 6000, multiplier: 2.5 },
    { value: 'membership', label: 'Sitio de Membresías', baseCost: 3500, multiplier: 2.0 }
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
    { value: 'booking', label: 'Sistema de Reservas', cost: 800 },
    { value: 'payments', label: 'Pagos Online', cost: 600 },
    { value: 'user-login', label: 'Login de Usuarios', cost: 500 },
    { value: 'search', label: 'Búsqueda Avanzada', cost: 400 },
    { value: 'chat', label: 'Chat en Vivo', cost: 300 },
    { value: 'multilang', label: 'Multi-idioma', cost: 700 },
    { value: 'analytics', label: 'Analytics Avanzado', cost: 250 },
    { value: 'inventory', label: 'Gestión de Inventario', cost: 1200 },
    { value: 'crm', label: 'Integración CRM', cost: 600 }
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
    { value: 'accounting', label: 'Software Contable', cost: 600 },
    { value: 'shipping', label: 'Sistemas de Envío', cost: 400 }
  ];

  const calculateWebProject = () => {
    setLoading(true);
    
    setTimeout(() => {
      const sectorData = businessSectors.find(s => s.value === formData.sector);
      const websiteTypeData = websiteTypes.find(w => w.value === formData.websiteType);
      const pageData = pageRanges.find(p => p.value === formData.pageCount);
      const designData = designLevels.find(d => d.value === formData.designLevel);
      const revenueData = revenueRanges.find(r => r.value === formData.monthlyRevenue);

      // Cálculo de costos
      let baseCost = websiteTypeData?.baseCost || 2000;
      const pageMultiplier = pageData?.multiplier || 1.0;
      const designMultiplier = designData?.multiplier || 1.0;
      
      // Costo de funcionalidades adicionales
      const featuresCost = formData.features.reduce((total, featureValue) => {
        const feature = availableFeatures.find(f => f.value === featureValue);
        return total + (feature?.cost || 0);
      }, 0);

      // Costo de integraciones
      const integrationsCost = formData.integrations.reduce((total, integrationValue) => {
        const integration = integrationOptions.find(i => i.value === integrationValue);
        return total + (integration?.cost || 0);
      }, 0);

      // Cálculo final de desarrollo
      const developmentCost = Math.round(
        (baseCost * pageMultiplier * designMultiplier) + featuresCost + integrationsCost
      );

      // Factor de urgencia
      const urgencyMultiplier = formData.urgency === 'urgent' ? 1.5 : 
                               formData.urgency === 'normal' ? 1.0 : 0.9;
      
      const finalCost = Math.round(developmentCost * urgencyMultiplier);

      // Cálculo de ROI
      const leadValue = sectorData?.leadValue || 300;
      const conversionRate = sectorData?.conversionRate || 0.04;
      const revenueMultiplier = revenueData?.factor || 1.0;

      // Estimaciones conservadoras de mejora con web profesional
      const monthlyVisitors = 1000 * revenueMultiplier;
      const monthlyLeads = Math.round(monthlyVisitors * conversionRate);
      const monthlyNewCustomers = Math.round(monthlyLeads * 0.2); // 20% de leads se convierten
      const monthlyRevenue = monthlyNewCustomers * leadValue;
      const annualRevenue = monthlyRevenue * 12;

      // ROI
      const roi = Math.round(((annualRevenue - finalCost) / finalCost) * 100);
      const paybackMonths = Math.round((finalCost / monthlyRevenue) * 10) / 10;

      // Tiempo de desarrollo
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
          baseCost: Math.round(baseCost * pageMultiplier * designMultiplier),
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
    }, 2000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
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
  };

 const sendWebLeadData = async () => {
    setEmailStatus({ loading: true, sent: false, error: null });

    try {
      const leadData = {
        ...formData,
        calculatedResults: results,
        timestamp: new Date().toISOString(),
        source: 'Web Development Calculator',
      };

      console.log('Web Lead generado:', leadData);

      const response = await emailService.sendWebLead(leadData);

      if (response.success) {
        setEmailStatus({ loading: false, sent: true, error: null });
        const leads = JSON.parse(localStorage.getItem('web_leads') || '[]');
        leads.push(leadData);
        localStorage.setItem('web_leads', JSON.stringify(leads));
        alert(`¡Gracias ${formData.company}! Te enviaré una propuesta detallada en las próximas 24 horas.`);
      }
    } catch (error) {
      console.error('Error enviando Web lead:', error);
      setEmailStatus({
        loading: false,
        sent: false,
        error: 'Error enviando información. Intenta por WhatsApp.',
      });
      alert('Error enviando información. Te contacto por WhatsApp para enviarte la propuesta.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
        transition={{ duration: 0.5, delay: 2 }}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
        </svg>
        <span className="font-semibold">Cotizar Web</span>
      </motion.button>

      {/* Modal de la calculadora */}
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
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Calculadora de Desarrollo Web</h2>
                    <p className="text-blue-100 mt-1">
                      Descubre el costo y ROI de tu nuevo sitio web
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Progress bar */}
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
                {/* Paso 1: Información del negocio */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Información de tu Negocio
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Ayúdanos a entender tu negocio para calcularte un ROI personalizado
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nombre del Negocio *
                        </label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Ej: Mi Empresa SA"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="tu@empresa.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="+54 9 11 1234-5678"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Sector del Negocio *
                        </label>
                        <select
                          value={formData.sector}
                          onChange={(e) => handleInputChange('sector', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Selecciona tu sector</option>
                          {businessSectors.map(sector => (
                            <option key={sector.value} value={sector.value}>
                              {sector.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ingresos Mensuales Actuales *
                        </label>
                        <select
                          value={formData.monthlyRevenue}
                          onChange={(e) => handleInputChange('monthlyRevenue', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Selecciona el rango</option>
                          {revenueRanges.map(range => (
                            <option key={range.value} value={range.value}>
                              {range.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          ¿Cómo consigues clientes actualmente?
                        </label>
                        <textarea
                          value={formData.currentClientMethod}
                          onChange={(e) => handleInputChange('currentClientMethod', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          rows={3}
                          placeholder="Ej: Redes sociales, recomendaciones, publicidad..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ¿Tienes sitio web actual?
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['No tengo', 'Básico/Desactualizado', 'Sí, pero quiero renovar'].map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleInputChange('currentWebsite', option)}
                            className={`p-3 border-2 rounded-lg text-center transition-colors ${
                              formData.currentWebsite === option
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <motion.button
                        onClick={() => setStep(2)}
                        disabled={!formData.company || !formData.email || !formData.sector || !formData.monthlyRevenue}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Siguiente →
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Paso 2: Requerimientos técnicos */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Requerimientos de tu Sitio Web
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Selecciona las características que necesitas
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tipo de Sitio Web *
                          </label>
                          <select
                            value={formData.websiteType}
                            onChange={(e) => handleInputChange('websiteType', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Selecciona el tipo</option>
                            {websiteTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Número de Páginas *
                          </label>
                          <select
                            value={formData.pageCount}
                            onChange={(e) => handleInputChange('pageCount', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Selecciona el rango</option>
                            {pageRanges.map(range => (
                              <option key={range.value} value={range.value}>
                                {range.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nivel de Diseño *
                          </label>
                          <select
                            value={formData.designLevel}
                            onChange={(e) => handleInputChange('designLevel', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Selecciona el nivel</option>
                            {designLevels.map(level => (
                              <option key={level.value} value={level.value}>
                                {level.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Urgencia del Proyecto
                          </label>
                          <select
                            value={formData.urgency}
                            onChange={(e) => handleInputChange('urgency', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Selecciona urgencia</option>
                            <option value="relaxed">Sin prisa (3+ meses)</option>
                            <option value="normal">Normal (1-2 meses)</option>
                            <option value="urgent">Urgente (menos de 1 mes)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Funcionalidades Necesarias
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {availableFeatures.map(feature => (
                            <button
                              key={feature.value}
                              type="button"
                              onClick={() => handleMultiSelect('features', feature.value)}
                              className={`p-3 border-2 rounded-lg text-left transition-colors ${
                                formData.features.includes(feature.value)
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                              }`}
                            >
                              <div className="font-medium">{feature.label}</div>
                              <div className="text-sm text-gray-500">+${feature.cost}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Integraciones Requeridas
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {integrationOptions.map(integration => (
                            <button
                              key={integration.value}
                              type="button"
                              onClick={() => handleMultiSelect('integrations', integration.value)}
                              className={`p-3 border-2 rounded-lg text-left transition-colors ${
                                formData.integrations.includes(integration.value)
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                              }`}
                            >
                              <div className="font-medium">{integration.label}</div>
                              <div className="text-sm text-gray-500">+${integration.cost}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-6">
                      <motion.button
                        onClick={() => setStep(1)}
                        className="px-8 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        ← Anterior
                      </motion.button>
                      
                      <motion.button
                        onClick={calculateWebProject}
                        disabled={!formData.websiteType || !formData.pageCount || !formData.designLevel}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Calcular Proyecto 🚀
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Paso 3: Resultados */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          Calculando tu proyecto personalizado...
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                          Analizando requerimientos y calculando ROI
                        </p>
                      </div>
                    ) : results && (
                      <>
                        <div className="text-center mb-8">
                          <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            ¡Tu Propuesta Web Personalizada!
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Costo de desarrollo + ROI proyectado para {formData.company}
                          </p>
                        </div>

                        {/* Estado del email */}
                        <AnimatePresence>
                          {emailStatus.loading && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              Enviando propuesta...
                            </motion.div>
                          )}
                          
                          {emailStatus.sent && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              ¡Propuesta enviada! Te contactaré en 24 horas.
                            </motion.div>
                          )}
                          
                          {emailStatus.error && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg"
                            >
                              {emailStatus.error}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Métricas principales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <motion.div
                            className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-xl text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <div className="text-2xl font-bold">
                              {formatCurrency(results.developmentCost)}
                            </div>
                            <div className="text-blue-100 text-sm font-medium">
                              Costo Total
                            </div>
                          </motion.div>

                          <motion.div
                            className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <div className="text-2xl font-bold">
                              {results.roi}%
                            </div>
                            <div className="text-green-100 text-sm font-medium">
                              ROI Anual
                            </div>
                          </motion.div>

                          <motion.div
                            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="text-2xl font-bold">
                              {results.developmentWeeks}
                            </div>
                            <div className="text-purple-100 text-sm font-medium">
                              Semanas de Desarrollo
                            </div>
                          </motion.div>

                          <motion.div
                            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <div className="text-2xl font-bold">
                              {formatCurrency(results.monthlyRevenue)}
                            </div>
                            <div className="text-orange-100 text-sm font-medium">
                              Ingresos Extra/Mes
                            </div>
                          </motion.div>
                        </div>

                        {/* Call to action */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-6 text-center">
                          <h4 className="text-xl font-bold mb-2">
                            ¿Listo para aumentar tus ventas online?
                          </h4>
                          <p className="text-blue-100 mb-4">
                            Te envío una propuesta detallada con plan de desarrollo y garantías
                          </p>
                          <motion.button
                            onClick={sendWebLeadData}
                            disabled={emailStatus.loading}
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors mr-4 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                            whileHover={{ scale: emailStatus.loading ? 1 : 1.05 }}
                            whileTap={{ scale: emailStatus.loading ? 1 : 0.95 }}
                          >
                            {emailStatus.loading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                Enviando...
                              </>
                            ) : (
                              <>
                                🌐 Solicitar Propuesta
                              </>
                            )}
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              const message = `Hola! Calculé mi sitio web con tu calculadora:

Empresa: ${formData.company}
Costo: ${formatCurrency(results.developmentCost)}
ROI proyectado: ${results.roi}%
Tiempo: ${results.developmentWeeks} semanas

¿Podemos agendar una reunión?`;
                              window.open(`https://wa.me/+542995414422?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            💬 WhatsApp Directo
                          </motion.button>
                        </div>

                        {/* Detalles del proyecto */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <motion.div
                            className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                              💰 Desglose de Costos
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Desarrollo base:</span>
                                <span className="font-semibold">{formatCurrency(results.breakdown.baseCost)}</span>
                              </div>
                              {results.breakdown.featuresCost > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Funcionalidades extra:</span>
                                  <span className="font-semibold">{formatCurrency(results.breakdown.featuresCost)}</span>
                                </div>
                              )}
                              {results.breakdown.integrationsCost > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Integraciones:</span>
                                  <span className="font-semibold">{formatCurrency(results.breakdown.integrationsCost)}</span>
                                </div>
                              )}
                              {results.breakdown.urgencyAdjustment > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Ajuste por urgencia:</span>
                                  <span className="font-semibold">{formatCurrency(results.breakdown.urgencyAdjustment)}</span>
                                </div>
                              )}
                              <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between font-bold text-lg">
                                  <span>Total:</span>
                                  <span className="text-blue-600">{formatCurrency(results.developmentCost)}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>

                          <motion.div
                            className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                          >
                            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                              📈 Proyección de Resultados
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Visitantes mensuales:</span>
                                <span className="font-semibold">{results.projections.monthlyVisitors.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Leads mensuales:</span>
                                <span className="font-semibold">{results.monthlyLeads}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Tasa de conversión:</span>
                                <span className="font-semibold">{results.projections.conversionRate}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Valor por lead:</span>
                                <span className="font-semibold">{formatCurrency(results.projections.leadValue)}</span>
                              </div>
                              <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between font-bold">
                                  <span>Ingresos anuales extra:</span>
                                  <span className="text-green-600">{formatCurrency(results.annualRevenue)}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                          <motion.button
                            onClick={resetCalculator}
                            className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            🔄 Nueva Calculación
                          </motion.button>
                          
                          <motion.button
                            onClick={() => {
                              const resultsText = `Calculadora Web - ${formData.company}

Costo de desarrollo: ${formatCurrency(results.developmentCost)}
Tiempo: ${results.developmentWeeks} semanas
ROI proyectado: ${results.roi}%
Ingresos extra/año: ${formatCurrency(results.annualRevenue)}

Calculado: ${new Date().toLocaleDateString('es-ES')}
Contacto: marianoaliandri@gmail.com`;

                              navigator.share?.({
                                title: `Calculadora Web - ${formData.company}`,
                                text: resultsText
                              }) || navigator.clipboard?.writeText(resultsText);
                            }}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                            </svg>
                            📊 Compartir Propuesta
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
