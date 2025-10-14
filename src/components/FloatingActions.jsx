// src/components/FloatingActions.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KpiRadar from "./KpiRadar";
import DashboardStatsV2 from "./DashboardStats";
import CVATSUploader from "./CVATSUploader";
import ROICalculator from "./Calculadora";
import WebCalculator from "./CalculadoraWeb";

export default function FloatingActions() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Contenedor principal - Adaptable móvil/desktop */}
      <div className="fixed bottom-6 left-6 z-40">
        {/* Botón de expansión (solo visible en móvil) */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-2xl shadow-2xl border-2 border-white/20 mb-3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            {isExpanded ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </motion.div>
          <motion.div
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            5
          </motion.div>
        </motion.button>

        {/* Panel de herramientas */}
        <motion.div
          className={`
            bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-indigo-200 dark:border-indigo-700 p-4
            ${isExpanded ? 'block' : 'hidden md:block'}
          `}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Header del panel */}
          <div className="mb-4 pb-3 border-b-2 border-indigo-200 dark:border-indigo-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              Herramientas
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Análisis y calculadoras gratuitas
            </p>
          </div>

          {/* Grid de botones de herramientas */}
          <div className="flex flex-col gap-2 w-full">
            {/* Estadísticas */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <DashboardStatsV2 />
            </motion.div>

            {/* ATS */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <CVATSUploader />
            </motion.div>

            {/* ROI */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <ROICalculator />
            </motion.div>

            {/* Web */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <WebCalculator />
            </motion.div>

            {/* KPI */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <KpiRadar />
            </motion.div>
          </div>

          {/* Footer con acciones rápidas */}
          <motion.div
            className="mt-4 pt-3 border-t-2 border-indigo-200 dark:border-indigo-700 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <a
              href="https://wa.me/+542995414422"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors text-center flex items-center justify-center gap-1"
            >
              <span>💬</span>
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <a
              href="mailto:marianoaliandri@gmail.com"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors text-center flex items-center justify-center gap-1"
            >
              <span>✉️</span>
              <span className="hidden sm:inline">Email</span>
            </a>
          </motion.div>

          {/* Tip */}
          <motion.p
            className="text-[10px] text-gray-500 dark:text-gray-400 text-center mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            💡 Todas las herramientas son gratuitas
          </motion.p>
        </motion.div>
      </div>

      {/* Backdrop para móvil cuando está expandido */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[39]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}