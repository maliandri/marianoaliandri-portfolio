import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessageToGemini, initializeChat } from '../utils/geminiHelper';

function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef(null);

  // Base de conocimientos del bot
  const knowledgeBase = {
    greetings: [
      "¡Hola! Soy el asistente virtual de Mariano Aliandri. ¿En qué puedo ayudarte hoy?",
      "¡Hola! ¿Cómo puedo asistirte con tus necesidades de análisis de datos?",
      "¡Bienvenido! Estoy aquí para ayudarte con cualquier consulta sobre nuestros servicios."
    ],
    services: {
      'análisis de datos': 'Ofrezco servicios completos de análisis de datos incluyendo: limpieza y procesamiento de datos, creación de dashboards interactivos, análisis predictivo, y reportes automatizados. ¿Te interesa algún área específica?',
      'power bi': 'Soy especialista en Power BI. Puedo ayudarte con: creación de dashboards profesionales, modelado de datos, DAX avanzado, integración con múltiples fuentes de datos, y capacitación para tu equipo.',
      'excel': 'Ofrezco servicios avanzados de Excel: automatización con macros, Power Query para ETL, Power Pivot para análisis multidimensional, y dashboards dinámicos.',
      'consultoría': 'Proporciono consultoría estratégica en inteligencia empresarial: auditoría de procesos actuales, diseño de arquitectura de datos, KPIs y métricas, y roadmap de implementación.',
      'python': 'Desarrollo soluciones en Python para: web scraping, automatización de procesos, análisis estadístico avanzado, machine learning, y APIs para integración de datos.'
    },
    pricing: 'Los precios varían según el alcance del proyecto. Ofrezco: Consulta inicial gratuita (1 hora), proyectos desde $500 USD, retainer mensual desde $1,500 USD. ¿Te gustaría una cotización personalizada?',
    process: 'Mi proceso de trabajo incluye: 1) Consulta inicial gratuita, 2) Análisis de necesidades, 3) Propuesta detallada, 4) Desarrollo e implementación, 5) Capacitación y soporte. Todo con comunicación constante.',
    contact: 'Puedes contactarme por: WhatsApp: +54 299 541-4422, Email: marianoaliandri@gmail.com, o directamente desde este chat. ¿Cuál prefieres?',
    scheduling: 'Para agendar una reunión, puedes: usar el botón "Agendar Reunión" que aparecerá, enviarme un WhatsApp, o decirme tu disponibilidad y yo te propongo horarios.',
    experience: 'Tengo amplia experiencia en análisis de datos e inteligencia empresarial, especializado en Power BI, Excel avanzado, Python, y web scraping. He trabajado con empresas de diversos sectores ayudándoles a optimizar sus procesos con datos.'
  };

  const quickReplies = [
    { text: "¿Qué servicios ofreces?", key: "services" },
    { text: "Precios y cotizaciones", key: "pricing" },
    { text: "Agendar reunión", key: "meeting" },
    { text: "Proceso de trabajo", key: "process" },
    { text: "Power BI", key: "powerbi" },
    { text: "Contacto", key: "contact" }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Inicializar chat y mensaje de bienvenida
      initializeChat();
      setTimeout(() => {
        addBotMessage(knowledgeBase.greetings[0]);
      }, 500);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text,
      isBot: true,
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text,
      isBot: false,
      timestamp: new Date()
    }]);
  };

  const simulateTyping = (duration = 1500) => {
    setIsTyping(true);
    return new Promise(resolve => {
      setTimeout(() => {
        setIsTyping(false);
        resolve();
      }, duration);
    });
  };

  // Función para llamar a la API de Gemini via helper
  const getGeminiResponse = async (userInput) => {
    try {
      const response = await sendMessageToGemini(userInput, messages.slice(-10));
      return response;
    } catch (error) {
      console.error('Error al obtener respuesta de Gemini:', error);
      // Fallback a respuesta local en caso de error
      return getFallbackResponse(userInput);
    }
  };

  // Respuesta de fallback en caso de que falle Gemini
  const getFallbackResponse = (userInput) => {
    const input = userInput.toLowerCase();

    // Saludos
    if (input.match(/(hola|hello|hi|buenos días|buenas tardes|buenas noches)/)) {
      return knowledgeBase.greetings[Math.floor(Math.random() * knowledgeBase.greetings.length)];
    }

    // Servicios específicos
    for (const [key, response] of Object.entries(knowledgeBase.services)) {
      if (input.includes(key) || input.includes(key.replace(' ', ''))) {
        return response;
      }
    }

    // Precios
    if (input.match(/(precio|costo|cotización|presupuesto|cuánto|tarifa)/)) {
      return knowledgeBase.pricing;
    }

    // Proceso
    if (input.match(/(proceso|cómo trabajas|metodología|pasos)/)) {
      return knowledgeBase.process;
    }

    // Contacto
    if (input.match(/(contacto|teléfono|email|whatsapp|llamar)/)) {
      return knowledgeBase.contact;
    }

    // Reunión/Agenda
    if (input.match(/(reunión|cita|agendar|meeting|horario|disponibilidad)/)) {
      return knowledgeBase.scheduling;
    }

    // Experiencia
    if (input.match(/(experiencia|portfolio|trabajos|proyectos|clientes)/)) {
      return knowledgeBase.experience;
    }

    // Agradecimientos
    if (input.match(/(gracias|thank you|perfecto|excelente|genial)/)) {
      return '¡De nada! ¿Hay algo más en lo que pueda ayudarte? Estoy aquí para resolver todas tus dudas sobre análisis de datos.';
    }

    // Despedidas
    if (input.match(/(adiós|bye|nos vemos|hasta luego|chau)/)) {
      return '¡Hasta luego! No dudes en contactarme cuando necesites ayuda con análisis de datos. ¡Que tengas un excelente día!';
    }

    // Respuesta por defecto con sugerencias
    return `Entiendo que preguntas sobre "${userInput}". Te puedo ayudar con:\n\n• Análisis de datos y Power BI\n• Consultoría en inteligencia empresarial\n• Automatización con Python y Excel\n• Precios y cotizaciones\n• Agendar una reunión gratuita\n\n¿Sobre cuál te gustaría saber más?`;
  };

  const handleSendMessage = async (message = inputValue) => {
    if (!message.trim()) return;

    // Agregar mensaje del usuario
    addUserMessage(message);
    setInputValue('');
    setShowQuickReplies(false);

    // Simular escritura del bot
    await simulateTyping(2000);

    // Obtener respuesta de Gemini (con fallback automático)
    const response = await getGeminiResponse(message);

    // Detectar si la respuesta contiene datos de lead
    try {
      const leadMatch = response.match(/\{"lead":\s*true.*?\}/);
      if (leadMatch) {
        const leadData = JSON.parse(leadMatch[0]);

        // Extraer el mensaje antes del JSON
        const messageBeforeJson = response.substring(0, response.indexOf(leadMatch[0])).trim();
        if (messageBeforeJson) {
          addBotMessage(messageBeforeJson);
        }

        // Enviar lead por email
        const { emailService } = await import('../utils/emailService.js');
        await emailService.sendChatbotLead({
          nombre: leadData.nombre,
          email: leadData.email,
          telefono: leadData.telefono || 'No proporcionado',
          interes: leadData.interes,
          conversacion: messages.slice(-10).map(m => `${m.isBot ? 'Bot' : 'Usuario'}: ${m.text}`).join('\n')
        });

        // Confirmar al usuario
        setTimeout(() => {
          addBotMessage('✅ ¡Perfecto! Tus datos han sido enviados. Mariano se pondrá en contacto contigo a la brevedad. ¡Gracias por tu interés!');
        }, 1000);

        return;
      }
    } catch (error) {
      console.warn('Error procesando lead:', error);
    }

    // Si no hay lead, mostrar la respuesta normal
    addBotMessage(response);

    // Mostrar botones especiales según el contexto
    if (message.toLowerCase().includes('reunión') || message.toLowerCase().includes('agendar')) {
      setTimeout(() => {
        addBotMessage('👆 Puedes usar el botón de arriba para agendar directamente, o dime tu disponibilidad y coordino contigo.');
      }, 1000);
    }
  };

  const handleQuickReply = (reply) => {
    handleSendMessage(reply.text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openCalendar = () => {
    window.open('https://calendly.com/marianoaliandri', '_blank');
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent('Hola Mariano! Vengo del chat de tu web y me gustaría agendar una reunión para hablar sobre análisis de datos.');
    window.open(`https://wa.me/+542995414422?text=${message}`, '_blank');
  };

  // Función para cerrar el chat
  const closeChat = () => {
    setIsOpen(false);
    // Opcional: limpiar mensajes al cerrar
    // setMessages([]);
    // setShowQuickReplies(true);
  };

  // Función para convertir links en texto a HTML clickeable
  const renderMessageWithLinks = (text, isBot) => {
    // Color del link según quién habla
    const linkClass = isBot
      ? 'text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 font-semibold'
      : 'text-blue-100 underline hover:text-white font-semibold';

    // Convertir URLs directas a links
    let processedText = text.replace(
      /(https?:\/\/[^\s]+)/g,
      `<a href="$1" target="_blank" rel="noopener noreferrer" class="${linkClass}">$1</a>`
    );

    // Convertir markdown links [texto](url) a HTML
    processedText = processedText.replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      `<a href="$2" target="_blank" rel="noopener noreferrer" class="${linkClass}">$1</a>`
    );

    return processedText;
  };

  return (
    <>
     {/* Botón flotante del chat */}
<motion.button
  onClick={() => setIsOpen(!isOpen)}
  className={`fixed top-1/2 right-6 z-40 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center transform -translate-y-1/2 ${
    isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
  }`}
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  initial={{ opacity: 0, scale: 0 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5, delay: 2 }}
>
  <motion.div
    animate={{ rotate: isOpen ? 180 : 0 }}
    transition={{ duration: 0.3 }}
  >
    {isOpen ? (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ) : (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )}
  </motion.div>
        
        {/* Indicador de mensajes nuevos */}
        {!isOpen && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 3 }}
          >
            <span className="text-xs text-white font-bold">!</span>
          </motion.div>
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-36 right-6 z-40 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Asistente IA</h3>
                <p className="text-xs text-blue-100">
                  {isTyping ? 'Escribiendo...' : 'En línea • Responde en segundos'}
                </p>
              </div>
              <div className="flex gap-2">
                <motion.button
                  onClick={openCalendar}
                  className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Agendar reunión"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                </motion.button>
                <motion.button
                  onClick={openWhatsApp}
                  className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
                  </svg>
                </motion.button>
                {/* NUEVO: Botón de cerrar en el header */}
                <motion.button
                  onClick={closeChat}
                  className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-red-500 hover:bg-opacity-100 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Cerrar chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    message.isBot
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      : 'bg-blue-600 text-white'
                  }`}>
                    <div
                      className="text-sm whitespace-pre-line"
                      dangerouslySetInnerHTML={{ __html: renderMessageWithLinks(message.text, message.isBot) }}
                    />
                    <span className={`text-xs mt-1 block ${
                      message.isBot ? 'text-gray-500 dark:text-gray-400' : 'text-blue-100'
                    }`}>
                      {message.timestamp.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick replies */}
              {showQuickReplies && messages.length <= 1 && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Respuestas rápidas:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickReplies.map((reply, index) => (
                      <motion.button
                        key={reply.key}
                        onClick={() => handleQuickReply(reply)}
                        className="p-2 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {reply.text}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  disabled={isTyping}
                />
                <motion.button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: inputValue.trim() && !isTyping ? 1.05 : 1 }}
                  whileTap={{ scale: inputValue.trim() && !isTyping ? 0.95 : 1 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Presiona Enter para enviar • Powered by IA
                </p>
                {/* NUEVO: Botón de cerrar adicional en el footer */}
                <motion.button
                  onClick={closeChat}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cerrar
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AIChatBot;