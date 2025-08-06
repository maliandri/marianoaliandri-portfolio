import React from 'react';
import { motion } from 'framer-motion';

// Componente para la sección de proyectos
function Proyectos() {
  return (
    <motion.section
      id="proyectos"
      className="p-8 md:p-12 rounded-3xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-50">
        Mis proyectos
      </h2>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Proyecto 1 */}
        <motion.div
          className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-700 shadow-md transform hover:scale-105 transition-all duration-300"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
            Web Scrapper para Sitio Mercado Libre.
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Hosteo de un web scrapper en python de Mercado Libre. Próximamente, alojaré el servicio en esta web.
          </p>
        </motion.div>
        
        {/* Proyecto 2 */}
        <motion.div
          className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-700 shadow-md transform hover:scale-105 transition-all duration-300"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
            Análisis de Datos con Power Bi - Excel
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Un proyecto de análisis de datos para generar informes y visualizaciones a partir de grandes conjuntos de datos.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}

// Hace que el componente esté disponible para otros archivos
export default Proyectos;
