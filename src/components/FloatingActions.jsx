// src/components/FloatingActions.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KpiRadar from "./KpiRadar";
import DashboardStatsV2 from "./DashboardStats";
import CVATSUploader from "./CVATSUploader";
import ROICalculator from "./Calculadora";
import WebCalculator from "./CalculadoraWeb";

export default function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false);

  // Herramientas disponibles
  const tools = [
    {
      id: "stats",
      name: "Estadísticas",
      icon: "📊",
      color: "from-violet-600 to-purple-700",
      description: "Métricas del sitio",
      hash: "stats"
    },
    {
      id: "ats",
      name: "Analizador ATS",
      icon: "📄",
      color: "from-red-600 to-rose-600",
      description: "Analiza tu CV",
      hash: "ats"
    },
    {
      id: "roi",
      name: "Calcular ROI",
      icon: "💰",
      color: "from-green-500 to-emerald-600",
      description: "ROI de datos",
      hash: "roi"
    },
    {
      id: "web",
      name: "Cotizar Web",
      icon: "🌐",
      color: "from-blue-500 to-indigo-600",
      description: "Presupuesto web",
      hash: "web"
    },
    {
      id: "kpi",
      name: "Radar KPI",
      icon: "🎯",
      color: "from-fuchsia-600 to-purple-700",
      description: "KPIs por sector",
      hash: "kpi"
    }
  ];

  const openTool = (tool) => {
    setIsOpen(false);
    // Usar el sistema de deep-links que ya tienen los componentes
    const url = new URL(window.location.href);
    url.hash = tool.hash;
    url.searchParams.set("tool", tool.hash);
    window.history.pushState({}, "", url.toString());
    // Forzar que se dispare el evento
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  return (
    <>
      {/* ===== BOTÓN PRINCIPAL ===== */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-[60] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-4 rounded-2xl shadow-2xl hover:shadow-purple-500/50 border-2 border-white/30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h8M4 18h12" />
            </svg>
          )}
        </motion.div>
        
        <motion.div
          className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 }}
        >
          {tools.length}
        </motion.div>
      </motion.button>

      {/* ===== PANEL DE HERRAMIENTAS ===== */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[58]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              className="fixed bottom-24 left-6 z-[59] w-80 max-w-[calc(100vw-3rem)] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-purple-300 dark:border-purple-700 overflow-hidden"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 20 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-2xl">🚀</span>
                    Herramientas
                  </h3>
                  <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-purple-100">Análisis y calculadoras profesionales</p>
              </div>

              {/* Botones */}
              <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                {tools.map((tool, i) => (
                  <motion.button
                    key={tool.id}
                    onClick={() => openTool(tool)}
                    className={`w-full bg-gradient-to-r ${tool.color} text-white p-4 rounded-xl shadow-lg hover:shadow-xl text-left group relative overflow-hidden`}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12" />
                    <div className="relative flex items-center gap-3">
                      <div className="text-3xl">{tool.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-base">{tool.name}</div>
                        <div className="text-xs opacity-90">{tool.description}</div>
                      </div>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 border-t border-purple-200 dark:border-purple-800">
                <motion.div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  <p className="text-xs text-gray-700 dark:text-gray-300 text-center">
                    💡 <strong>Todas gratuitas</strong> y sin registro
                  </p>
                </motion.div>
                <motion.div className="flex gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                  <a href="https://wa.me/+542995414422" target="_blank" rel="noopener noreferrer" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl text-center flex items-center justify-center gap-2 shadow-md">
                    <span>💬</span><span>WhatsApp</span>
                  </a>
                  <a href="mailto:marianoaliandri@gmail.com" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl text-center flex items-center justify-center gap-2 shadow-md">
                    <span>✉️</span><span>Email</span>
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Componentes renderizados (invisibles, solo para deep-links) */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <DashboardStatsV2 />
        <CVATSUploader />
        <ROICalculator />
        <WebCalculator />
        <KpiRadar />
      </div>
    </>
  );
}