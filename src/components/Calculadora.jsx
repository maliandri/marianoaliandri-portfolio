// src/components/Calculadora.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmailService } from '../utils/emailService';

// ⇩ Cotización y formateadores
import { ExchangeService, formatUSD, formatARS } from '../utils/exchangeService';

function ROICalculator() {
  const emailService = new EmailService();
  const fxService = new ExchangeService();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    company: '',
    email: '',
    phone: '',
    sector: '',
    employees: '',
    monthlyRevenue: '',
    currentDataTools: '',
    dataProcessingHours: '',
    decisionMakingTime: '',
    reportGenerationTime: ''
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ loading: false, sent: false, error: null });

  // Cotización ARS
  const [fx, setFx] = useState({ rate: null, source: null, loading: false, error: null });

  // ===== Validación email
  const [emailValidation, setEmailValidation] = useState({
    isValid: false,
    message: '',
    touched: false
  });

  // ↑ AUMENTADO el límite de longitud a 320
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!email) return { isValid: false, message: '' };
    if (!emailRegex.test(email)) return { isValid: false, message: 'Formato de email inválido' };
    if (email.length > 320) return { isValid: false, message: 'Email demasiado largo' };
    const domain = email.split('@')[1];
    if (domain && domain.length < 2) return { isValid: false, message: 'Dominio inválido' };
    const disposableEmails = ['10minutemail.com','tempmail.org','guerrillamail.com','mailinator.com','temp-mail.org','throwaway.email','yopmail.com','maildrop.cc','sharklasers.com'];
    if (disposableEmails.some(d => domain?.toLowerCase().includes(d))) {
      return { isValid: false, message: 'Por favor usa un email corporativo válido' };
    }
    return { isValid: true, message: 'Email válido' };
  };

  const handleEmailChange = (email) => {
    setFormData(prev => ({ ...prev, email }));
    if (emailValidation.touched) setEmailValidation({ ...validateEmail(email), touched: true });
  };
  const handleEmailBlur = () => setEmailValidation({ ...validateEmail(formData.email), touched: true });

  // ===== Deep-link: abrir automáticamente con #roi / ?tool=roi / /calculadora-roi
  useEffect(() => {
    const path = window.location.pathname || '';
    const q = new URLSearchParams(window.location.search);
    const hash = (window.location.hash || '').replace('#', '');
    if (hash === 'roi' || q.get('tool') === 'roi' || path.includes('/calculadora-roi')) {
      setIsOpen(true);
    }
  }, []);

  // ===== Sincronizar URL al abrir/cerrar (sin recargar)
  const openWithUrl = () => {
    setIsOpen(true);
    const url = new URL(window.location.href);
    url.hash = 'roi';
    url.searchParams.set('tool', 'roi');
    window.history.replaceState({}, '', url.toString());
  };
  const closeAndCleanUrl = () => {
    setIsOpen(false);
    const url = new URL(window.location.href);
    if (url.hash === '#roi') url.hash = '';
    if (url.searchParams.get('tool') === 'roi') url.searchParams.delete('tool');
    window.history.replaceState({}, '', url.toString());
  };

  // ===== Datos base
  const sectors = [
    { value: 'retail', label: 'Retail/Comercio', factor: 1.2 },
    { value: 'manufacturing', label: 'Manufactura', factor: 1.5 },
    { value: 'finance', label: 'Finanzas/Banca', factor: 1.8 },
    { value: 'healthcare', label: 'Salud', factor: 1.3 },
    { value: 'technology', label: 'Tecnología', factor: 1.6 },
    { value: 'consulting', label: 'Consultoría', factor: 1.4 },
    { value: 'education', label: 'Educación', factor: 1.1 },
    { value: 'logistics', label: 'Logística', factor: 1.3 },
    { value: 'other', label: 'Otro', factor: 1.0 }
  ];
  const employeeRanges = [
    { value: '1-10', label: '1-10 empleados', factor: 0.8 },
    { value: '11-50', label: '11-50 empleados', factor: 1.0 },
    { value: '51-200', label: '51-200 empleados', factor: 1.2 },
    { value: '201-500', label: '201-500 empleados', factor: 1.5 },
    { value: '500+', label: '500+ empleados', factor: 2.0 }
  ];
  const revenueRanges = [
    { value: '0-100k', label: 'Hasta $100K USD/mes', factor: 0.5 },
    { value: '100k-500k', label: '$100K - $500K USD/mes', factor: 1.0 },
    { value: '500k-1m', label: '$500K - $1M USD/mes', factor: 1.5 },
    { value: '1m-5m', label: '$1M - $5M USD/mes', factor: 2.0 },
    { value: '5m+', label: 'Más de $5M USD/mes', factor: 3.0 }
  ];

  // ===== Cálculo
  const calculateROI = () => {
    setLoading(true);
    setTimeout(() => {
      const sectorData = sectors.find(s => s.value === formData.sector);
      const employeeData = employeeRanges.find(e => e.value === formData.employees);
      const revenueData = revenueRanges.find(r => r.value === formData.monthlyRevenue);

      const dataProcessingHours = parseInt(formData.dataProcessingHours) || 20;
      const decisionMakingTime = parseInt(formData.decisionMakingTime) || 5;
      const reportGenerationTime = parseInt(formData.reportGenerationTime) || 8;

      const sectorFactor = sectorData?.factor || 1.0;
      const employeeFactor = employeeData?.factor || 1.0;
      const revenueFactor = revenueData?.factor || 1.0;

      const timeReduction = 0.7;
      const errorReduction = 0.85;
      const decisionSpeed = 0.6;

      const monthlySavings = {
        timeProcessing: (dataProcessingHours * 4 * 50) * timeReduction * employeeFactor,
        fasterDecisions: (decisionMakingTime * 1000) * decisionSpeed * sectorFactor,
        reportEfficiency: (reportGenerationTime * 4 * 40) * timeReduction * revenueFactor,
        errorReduction: (dataProcessingHours * 2 * 100) * errorReduction
      };

      const totalMonthlySavings = Object.values(monthlySavings).reduce((a, b) => a + b, 0);
      const annualSavings = totalMonthlySavings * 12;

      const baseInvestment = 15000;
      const implementationCost = baseInvestment * sectorFactor * (employeeFactor * 0.5 + 0.5);

      const roi = ((annualSavings - implementationCost) / implementationCost) * 100;
      const paybackMonths = implementationCost / (totalMonthlySavings || 1);

      setResults({
        monthlySavings: Math.round(totalMonthlySavings),
        annualSavings: Math.round(annualSavings),
        implementationCost: Math.round(implementationCost),
        roi: Math.round(roi),
        paybackMonths: Math.round(paybackMonths * 10) / 10,
        breakdown: {
          timeProcessing: Math.round(monthlySavings.timeProcessing),
          fasterDecisions: Math.round(monthlySavings.fasterDecisions),
          reportEfficiency: Math.round(monthlySavings.reportEfficiency),
          errorReduction: Math.round(monthlySavings.errorReduction)
        },
        improvements: {
          timeReduction: Math.round(timeReduction * 100),
          errorReduction: Math.round(errorReduction * 100),
          decisionSpeed: Math.round(decisionSpeed * 100)
        }
      });

      setLoading(false);
      setStep(3);
    }, 800);
  };

  // Obtener cotización al llegar a resultados
  useEffect(() => {
    const fetchRate = async () => {
      setFx(prev => ({ ...prev, loading: true, error: null }));
      try {
        const { rate, source } = await fxService.getLatest();
        setFx({ rate, source, loading: false, error: null });
      } catch (e) {
        setFx({ rate: 1050, source: 'fallback', loading: false, error: 'No se pudo obtener cotización, usando fallback' });
      }
    };
    if (step === 3 && results && !fx.rate && !fx.loading) fetchRate();
  }, [step, results]); // eslint-disable-line

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const resetCalculator = () => {
    setStep(1);
    setFormData({
      company: '',
      email: '',
      phone: '',
      sector: '',
      employees: '',
      monthlyRevenue: '',
      currentDataTools: '',
      dataProcessingHours: '',
      decisionMakingTime: '',
      reportGenerationTime: ''
    });
    setResults(null);
    setEmailStatus({ loading: false, sent: false, error: null });
    setEmailValidation({ isValid: false, message: '', touched: false });
    setFx({ rate: null, source: null, loading: false, error: null });
    closeAndCleanUrl(); // limpiar URL también al resetear
  };

  const sendLeadData = async () => {
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
        calculatedROI: results,
        timestamp: new Date().toISOString(),
        source: 'ROI Calculator'
      };
      const response = await emailService.sendROILead(leadData);
      if (response.success) {
        setEmailStatus({ loading: false, sent: true, error: null });
        const leads = JSON.parse(localStorage.getItem('roi_leads') || '[]');
        leads.push(leadData);
        localStorage.setItem('roi_leads', JSON.stringify(leads));
        alert(`¡Gracias ${formData.company}! Te contactaremos pronto con un análisis detallado.`);
      }
    } catch (e) {
      setEmailStatus({ loading: false, sent: false, error: 'Error enviando información. Intenta por WhatsApp.' });
      alert('Error enviando información. Intenta contactar por WhatsApp.');
    }
  };

  const isStep1Valid =
    formData.company &&
    formData.email &&
    emailValidation.isValid &&
    formData.sector &&
    formData.employees &&
    formData.monthlyRevenue;

  return (
    <>
      {/* Botón flotante */}
      <motion.button
        onClick={openWithUrl}
        className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.5 }}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
        <span className="font-semibold">Calcular ROI</span>
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
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Calculadora de ROI</h2>
                    <p className="text-green-100 mt-1">Descubre cuánto puedes ahorrar con análisis de datos</p>
                  </div>
                  <button onClick={closeAndCleanUrl} className="text-white hover:text-green-200 transition-colors">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-green-100">
                    <span>Paso {step} de 3</span>
                  </div>
                  <div className="mt-2 w-full bg-green-600 rounded-full h-2">
                    <motion.div className="bg-white rounded-full h-2" initial={{ width: 0 }} animate={{ width: `${(step / 3) * 100}%` }} transition={{ duration: 0.5 }} />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Paso 1 */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Información de tu Empresa</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">Necesitamos algunos datos para calcular tu ROI personalizado</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre de la Empresa *</label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Ej: Mi Empresa SA"
                          maxLength={120} // permite más caracteres razonables para el nombre
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Corporativo *</label>
                        <div className="relative">
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleEmailChange(e.target.value)}
                            onBlur={handleEmailBlur}
                            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-colors ${
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
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                        {emailValidation.touched && emailValidation.message && (
                          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`text-xs mt-1 ${emailValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                            {emailValidation.message}
                          </motion.p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          placeholder="+54 9 11 1234-5678"
                          maxLength={40}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sector de la Empresa *</label>
                        <select value={formData.sector} onChange={(e) => handleInputChange('sector', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white">
                          <option value="">Selecciona tu sector</option>
                          {sectors.map(sector => (<option key={sector.value} value={sector.value}>{sector.label}</option>))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Número de Empleados *</label>
                        <select value={formData.employees} onChange={(e) => handleInputChange('employees', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white">
                          <option value="">Selecciona el rango</option>
                          {employeeRanges.map(range => (<option key={range.value} value={range.value}>{range.label}</option>))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ingresos Mensuales *</label>
                        <select value={formData.monthlyRevenue} onChange={(e) => handleInputChange('monthlyRevenue', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white">
                          <option value="">Selecciona el rango</option>
                          {revenueRanges.map(range => (<option key={range.value} value={range.value}>{range.label}</option>))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <motion.button
                        onClick={() => setStep(2)}
                        disabled={!isStep1Valid}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Situación Actual de Datos</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">Contanos cómo trabajan hoy</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Herramientas actuales</label>
                        <textarea
                          value={formData.currentDataTools}
                          onChange={(e) => handleInputChange('currentDataTools', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          rows={3}
                          placeholder="Ej: Excel, Google Sheets, proceso manual..."
                          maxLength={1000} // más caracteres
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Horas/semana procesando datos</label>
                          <input type="number" min="1" max="168" placeholder="20" value={formData.dataProcessingHours} onChange={(e) => handleInputChange('dataProcessingHours', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Días para decisiones</label>
                          <input type="number" min="1" max="30" placeholder="5" value={formData.decisionMakingTime} onChange={(e) => handleInputChange('decisionMakingTime', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Horas/semana generando reportes</label>
                          <input type="number" min="1" max="40" placeholder="8" value={formData.reportGenerationTime} onChange={(e) => handleInputChange('reportGenerationTime', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-6">
                      <motion.button onClick={() => setStep(1)} className="px-8 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        ← Anterior
                      </motion.button>
                      <motion.button onClick={calculateROI} className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        Calcular ROI 🚀
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Paso 3: Resultados + ARS */}
                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Calculando tu ROI...</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Procesando datos</p>
                      </div>
                    ) : results && (
                      <>
                        <div className="text-center mb-2">
                          <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Resultados para {formData.company}</h3>
                          <p className="text-gray-600 dark:text-gray-400 mt-2">Ahorros y retorno estimado</p>
                        </div>

                        {/* Métricas principales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl text-center">
                            <div className="text-2xl font-bold">{formatUSD(results.implementationCost)}</div>
                            <div className="text-green-100 text-sm font-medium">Inversión estimada (USD)</div>
                            {fx.rate && <div className="mt-1 text-xs text-green-100">≈ {formatARS(Math.round(results.implementationCost * fx.rate))}</div>}
                          </div>

                          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-xl text-center">
                            <div className="text-2xl font-bold">{results.roi}%</div>
                            <div className="text-blue-100 text-sm font-medium">ROI Anual</div>
                          </div>

                          <div className="bg-gradient-to-br from紫-500 to-purple-600 text-white p-6 rounded-xl text-center">
                            <div className="text-2xl font-bold">{formatUSD(results.monthlySavings)}</div>
                            <div className="text-purple-100 text-sm font-medium">Ahorro Mensual</div>
                            {fx.rate && <div className="mt-1 text-xs text-purple-100">≈ {formatARS(Math.round(results.monthlySavings * fx.rate))}</div>}
                          </div>

                          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl text-center">
                            <div className="text-2xl font-bold">{results.paybackMonths}</div>
                            <div className="text-orange-100 text-sm font-medium">Meses para recuperar</div>
                          </div>
                        </div>

                        {/* Total anual (USD + ARS) */}
                        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="font-bold text-lg">Ahorro anual estimado</div>
                            <div className="text-xl font-extrabold text-green-600">{formatUSD(results.annualSavings)}</div>
                          </div>
                          {fx.rate && (
                            <div className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                              ≈ {formatARS(Math.round(results.annualSavings * fx.rate))}
                              <span className="ml-2 text-xs opacity-70">Cotización usada: ${fx.rate} ARS / USD ({fx.source})</span>
                            </div>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                          <motion.button onClick={resetCalculator} className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            🔄 Nueva Calculación
                          </motion.button>
                          <motion.button
                            onClick={sendLeadData}
                            disabled={emailStatus.loading}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: emailStatus.loading ? 1 : 1.02 }}
                            whileTap={{ scale: emailStatus.loading ? 1 : 0.98 }}
                          >
                            {emailStatus.loading ? 'Enviando...' : 'Recibir Análisis por Email'}
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

export default ROICalculator;
