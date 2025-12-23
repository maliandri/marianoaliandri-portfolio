// src/components/DashboardStats.jsx
// ✨ VERSIÓN ADAPTADA PARA BADGE CENTRAL
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FirebaseAnalyticsService } from "../utils/firebaseservice";

export default function DashboardStats({
  isOpen: isOpenProp,
  onClose: onCloseProp,
  hideFloatingButton = false
}) {
  const [stats, setStats] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    likes: 0,
    dislikes: 0,
    topPages: [],
    topProducts: [],
    registeredUsers: 0
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [firebaseService] = useState(() => new FirebaseAnalyticsService());

  // 🔄 Estado híbrido para el modal
  const [openInternal, setOpenInternal] = useState(false);
  const open = isOpenProp !== undefined ? isOpenProp : openInternal;
  
  // Función de setOpen adaptada
  const setOpen = (value) => {
    if (onCloseProp && !value) {
      onCloseProp(); // Usar callback del padre
    } else if (isOpenProp === undefined) {
      setOpenInternal(value); // Usar estado interno
    }
  };

  // ===== Reloj
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ===== Stats de Firebase
  useEffect(() => {
    let cleanup;
    (async () => {
      try {
        setLoading(true);
        await firebaseService.recordVisit();

        // Cargar estadísticas extendidas
        const extendedStats = await firebaseService.getExtendedStats();
        setStats(extendedStats);

        // Suscribirse a actualizaciones básicas en tiempo real
        cleanup = firebaseService.subscribeToStats((basicStats) => {
          setStats(prev => ({
            ...prev,
            ...basicStats
          }));
        });
      } catch {
        // Fallback a localStorage
        const savedVisits = localStorage.getItem("siteVisits");
        const newVisits = savedVisits ? parseInt(savedVisits) + 1 : 1;
        localStorage.setItem("siteVisits", String(newVisits));
        const savedLikes = localStorage.getItem("siteLikes");
        const savedDislikes = localStorage.getItem("siteDislikes");
        setStats({
          totalVisits: newVisits,
          uniqueVisitors: newVisits,
          likes: savedLikes ? parseInt(savedLikes) : 0,
          dislikes: savedDislikes ? parseInt(savedDislikes) : 0,
          topPages: [],
          topProducts: [],
          registeredUsers: 0
        });
      } finally {
        setLoading(false);
      }
    })();
    return () => typeof cleanup === "function" && cleanup();
  }, [firebaseService]);

  // ===== Deep-link: solo si NO está controlado por padre
  useEffect(() => {
    if (isOpenProp !== undefined) return; // Controlado por padre
    
    const path = window.location.pathname || "";
    const query = new URLSearchParams(window.location.search);
    const hash = (window.location.hash || "").replace("#", "");
    
    if (hash === "stats" || query.get("tool") === "stats" || path.includes("/stats")) {
      setOpenInternal(true);
    }
  }, [isOpenProp]);

  // ===== Helpers
  const pct = () => {
    const t = stats.likes + stats.dislikes;
    return t === 0 ? 0 : Math.round((stats.likes / t) * 100);
  };
  
  const fmt = (n) =>
    n >= 1_000_000 
      ? (n / 1_000_000).toFixed(1) + "M" 
      : n >= 1000 
      ? (n / 1000).toFixed(1) + "K" 
      : n.toString();

  return (
    <>
      {/* 🎯 Botón flotante - SOLO SI NO ESTÁ CONTROLADO POR BADGE */}
      {!hideFloatingButton && (
        <motion.button
          onClick={() => setOpen(true)}
          className="fixed bottom-72 left-6 z-40 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"    
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          aria-label="Estadísticas"
          title="Estadísticas WEB"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M3 3a1 1 0 000 2h1v10a1 1 0 001 1h11a1 1 0 100-2H6V3a1 1 0 00-1-1H3z" />
            <path d="M9 7a1 1 0 00-1 1v7h2V8a1 1 0 00-1-1zm4-3a1 1 0 00-1 1v10h2V5a1 1 0 00-1-1zm4 6a1 1 0 00-1 1v4h2v-4a1 1 0 00-1-1z" />
          </svg>
          <span className="font-semibold">Estadísticas</span>
        </motion.button>
      )}

      {/* Modal centrado - Expandido */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                Estadísticas
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-sm px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
            </div>

            {/* Reloj */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              {currentTime.toLocaleString("es-ES")}
            </p>

            {/* Grid de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Estadísticas básicas */}
              <Item
                label="Visitas Totales"
                value={loading ? "…" : fmt(stats.totalVisits)}
                color="blue"
              />
              <Item
                label="Visitantes Únicos"
                value={loading ? "…" : fmt(stats.uniqueVisitors)}
                color="purple"
              />
              <Item
                label="Usuarios Registrados"
                value={loading ? "…" : fmt(stats.registeredUsers)}
                color="indigo"
              />
              <Item
                label="Me gusta"
                value={loading ? "…" : fmt(stats.likes)}
                color="green"
              />
              <Item
                label="No me gusta"
                value={loading ? "…" : fmt(stats.dislikes)}
                color="red"
              />

              {/* Barra de satisfacción */}
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl">
                <div className="text-[11px] text-gray-600 dark:text-gray-400">
                  Satisfacción
                </div>
                <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {pct()}%
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <motion.div
                    className="bg-orange-600 dark:bg-orange-400 h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct()}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            </div>

            {/* Grid de listas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {/* Páginas más visitadas */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span>📄</span>
                  Páginas más visitadas
                </h3>
                {loading ? (
                  <p className="text-xs text-gray-500">Cargando...</p>
                ) : stats.topPages && stats.topPages.length > 0 ? (
                  <div className="space-y-2">
                    {stats.topPages.map((page, index) => (
                      <div
                        key={page.id}
                        className="flex items-center justify-between text-xs bg-white dark:bg-gray-800 p-2 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-400 w-4">#{index + 1}</span>
                          <span className="text-gray-700 dark:text-gray-300 truncate max-w-[180px]">
                            {page.title || page.path}
                          </span>
                        </div>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {fmt(page.views)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No hay datos disponibles</p>
                )}
              </div>

              {/* Productos más visitados */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span>🛍️</span>
                  Productos más visitados
                </h3>
                {loading ? (
                  <p className="text-xs text-gray-500">Cargando...</p>
                ) : stats.topProducts && stats.topProducts.length > 0 ? (
                  <div className="space-y-2">
                    {stats.topProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between text-xs bg-white dark:bg-gray-800 p-2 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-400 w-4">#{index + 1}</span>
                          <span className="text-gray-700 dark:text-gray-300 truncate max-w-[180px]">
                            {product.productName}
                          </span>
                        </div>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {fmt(product.views)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No hay datos disponibles</p>
                )}
              </div>
            </div>

            {/* Footer con estado de conexión */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
              <div
                className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-[11px] ${
                  loading
                    ? "bg-yellow-100/70 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                    : "bg-green-100/70 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                }`}
              >
                <span 
                  className={`w-2 h-2 rounded-full ${
                    loading ? "bg-yellow-500 animate-pulse" : "bg-green-500"
                  }`} 
                />
                {loading ? "Sincronizando…" : "Conectado a Firebase"}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

// Componente auxiliar para items de stats
function Item({ label, value, color }) {
  const colorMap = {
    blue: "bg-blue-50 dark:bg-blue-900/20",
    purple: "bg-purple-50 dark:bg-purple-900/20",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20",
    green: "bg-green-50 dark:bg-green-900/20",
    red: "bg-red-50 dark:bg-red-900/20",
  };
  
  return (
    <div className={`${colorMap[color]} p-3 rounded-xl`}>
      <div className="text-[11px] text-gray-600 dark:text-gray-400">
        {label}
      </div>
      <div className="text-base font-bold text-gray-900 dark:text-gray-100">
        {value}
      </div>
    </div>
  );
}
