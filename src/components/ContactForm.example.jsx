// src/components/ContactForm.example.jsx
// 📝 Ejemplo de formulario de contacto con React Hook Form + Zod
// Este archivo es un ejemplo de referencia para migrar formularios existentes
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFormValidation, getErrorMessage } from '../hooks/useFormValidation';
import { contactFormSchema } from '../schemas/firebaseSchemas';

export default function ContactFormExample() {
  const [submitStatus, setSubmitStatus] = useState(null);

  // 📝 Configurar el formulario con validación Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useFormValidation({
    schema: contactFormSchema,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      subject: '',
    },
    onSubmit: async (data) => {
      // Aquí iría la lógica para enviar el email
      console.log('Form data:', data);

      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubmitStatus({ type: 'success', message: '¡Mensaje enviado correctamente!' });
      reset();

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSubmitStatus(null), 3000);
    },
    onError: (error) => {
      setSubmitStatus({ type: 'error', message: 'Hubo un error al enviar el formulario' });
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Formulario de Contacto
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Nombre */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre *
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.name
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } focus:ring-2 focus:outline-none transition-colors`}
            placeholder="Tu nombre completo"
          />
          {getErrorMessage(errors, 'name') && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1"
            >
              {getErrorMessage(errors, 'name')}
            </motion.p>
          )}
        </div>

        {/* Campo Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email *
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } focus:ring-2 focus:outline-none transition-colors`}
            placeholder="tu@email.com"
          />
          {getErrorMessage(errors, 'email') && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1"
            >
              {getErrorMessage(errors, 'email')}
            </motion.p>
          )}
        </div>

        {/* Campo Teléfono (opcional) */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Teléfono (opcional)
          </label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.phone
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } focus:ring-2 focus:outline-none transition-colors`}
            placeholder="+54 11 1234-5678"
          />
          {getErrorMessage(errors, 'phone') && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1"
            >
              {getErrorMessage(errors, 'phone')}
            </motion.p>
          )}
        </div>

        {/* Campo Mensaje */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mensaje *
          </label>
          <textarea
            id="message"
            {...register('message')}
            rows={5}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.message
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } focus:ring-2 focus:outline-none transition-colors resize-none`}
            placeholder="Escribe tu mensaje aquí..."
          />
          {getErrorMessage(errors, 'message') && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1"
            >
              {getErrorMessage(errors, 'message')}
            </motion.p>
          )}
        </div>

        {/* Botón Submit */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
        </motion.button>

        {/* Status Message */}
        {submitStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              submitStatus.type === 'success'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}
          >
            {submitStatus.message}
          </motion.div>
        )}
      </form>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>💡 Ventajas de React Hook Form + Zod:</strong>
        </p>
        <ul className="text-xs text-blue-600 dark:text-blue-400 mt-2 space-y-1 list-disc list-inside">
          <li>Validación automática con tipos seguros</li>
          <li>Mejor rendimiento (menos re-renders)</li>
          <li>Manejo de errores integrado con Sentry</li>
          <li>Código más limpio y mantenible</li>
        </ul>
      </div>
    </div>
  );
}
