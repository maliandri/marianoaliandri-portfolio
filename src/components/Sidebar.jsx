// src/components/Sidebar.jsx
import React from "react";
import { motion } from "framer-motion";

export default function Sidebar({ onToolOpen }) {
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

  const handleToolClick = (tool) => {
    // Actualizar URL
    const url = new URL(window.location.href);
    url.hash = tool.hash;
    url.searchParams.set("tool", tool.hash);
    window.history.pushState({}, "", url.toString());

    // Notificar al padre
    if (onToolOpen) {
      onToolOpen(tool);
    }
  };

  return (
    <aside className="w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-r-2 border-purple-300 dark:border-purple-700 flex flex-col sticky top-20 h-[calc(100vh-5rem)] self-start">
      {/* Header compacto */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-3">
        <h3 className="text-base font-bold flex items-center gap-2">
          <span className="text-lg">🚀</span>
          Herramientas
        </h3>
        <p className="text-xs text-purple-100">Análisis y calculadoras</p>
      </div>

      {/* Lista de herramientas compacta */}
      <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
        {tools.map((tool, i) => (
          <motion.button
            key={tool.id}
            onClick={() => handleToolClick(tool)}
            className={`w-full bg-gradient-to-r ${tool.color} text-white p-2.5 rounded-lg shadow-md hover:shadow-lg text-left group relative overflow-hidden`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02, x: 3 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Efecto shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12" />

            <div className="relative flex items-center gap-2">
              <div className="text-xl flex-shrink-0">{tool.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm leading-tight">{tool.name}</div>
                <div className="text-xs opacity-90 truncate">{tool.description}</div>
              </div>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer compacto con contacto */}
      <div className="flex-shrink-0 p-2 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 border-t border-purple-200 dark:border-purple-800">
        <motion.div
          className="mb-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-gray-700 dark:text-gray-300 text-center leading-tight">
            💡 <strong>Gratis</strong> y sin registro
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <a
            href="https://wa.me/+542995414422"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-lg text-center flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <span>💬</span><span>WhatsApp</span>
          </a>
          <a
            href="mailto:yo@marianoaliandri.com.ar"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-lg text-center flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <span>✉️</span><span>Email</span>
          </a>
        </motion.div>
      </div>
    </aside>
  );
}
