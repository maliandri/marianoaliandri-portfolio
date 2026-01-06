// src/components/DashboardStats.jsx
// ✨ VERSIÓN ADAPTADA PARA BADGE CENTRAL con React Query
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useBasicStats } from "../hooks/useFirebaseStats";

export default function DashboardStats({
  isOpen: isOpenProp,
  onClose: onCloseProp,
  hideFloatingButton = false
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [copying, setCopying] = useState(false);

  // 🔄 React Query para estadísticas con real-time updates
  const { data: stats, isLoading: loading, error } = useBasicStats();

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
    if (!stats) return 0;
    const t = stats.likes + stats.dislikes;
    return t === 0 ? 0 : Math.round((stats.likes / t) * 100);
  };

  const fmt = (n) => {
    if (n === null || n === undefined) return '0';
    const num = Number(n);
    if (isNaN(num)) return '0';
    return num >= 1_000_000
      ? (num / 1_000_000).toFixed(1) + "M"
      : num >= 1000
      ? (num / 1000).toFixed(1) + "K"
      : num.toString();
  };

  // Valores seguros para renderizado
  const safeStats = stats || {
    totalVisits: 0,
    uniqueVisitors: 0,
    likes: 0,
    dislikes: 0,
    topPages: [],
    topProducts: [],
    registeredUsers: 0
  };

  // Función para generar imagen 1080x1080 dibujada manualmente
  const handleCopyImage = async () => {
    setCopying(true);
    try {
      const canvas = document.createElement('canvas');
      const size = 1080;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Header
      ctx.fillStyle = '#4f46e5'; // indigo-600
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Estadísticas', size / 2, 100);

      // Fecha
      ctx.fillStyle = '#6b7280'; // gray-500
      ctx.font = '30px Arial';
      ctx.fillText(currentTime.toLocaleString('es-ES'), size / 2, 150);

      let y = 230;

      // Función para dibujar una tarjeta de estadística
      const drawCard = (label, value, color, x, cardY) => {
        const cardWidth = 320;
        const cardHeight = 140;

        // Fondo de la tarjeta
        ctx.fillStyle = color;
        ctx.fillRect(x, cardY, cardWidth, cardHeight);

        // Label
        ctx.fillStyle = '#6b7280';
        ctx.font = '28px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(label, x + 20, cardY + 40);

        // Valor
        ctx.fillStyle = '#111827'; // gray-900
        ctx.font = 'bold 50px Arial';
        ctx.fillText(value, x + 20, cardY + 100);
      };

      // Grid de estadísticas (3 columnas x 2 filas)
      const colors = {
        blue: '#dbeafe',
        purple: '#e9d5ff',
        indigo: '#e0e7ff',
        green: '#d1fae5',
        red: '#fee2e2',
        orange: '#fed7aa'
      };

      drawCard('Visitas Totales', fmt(safeStats.totalVisits), colors.blue, 60, y);
      drawCard('Visitantes Únicos', fmt(safeStats.uniqueVisitors), colors.purple, 400, y);
      drawCard('Usuarios Registrados', fmt(safeStats.registeredUsers), colors.indigo, 740, y);

      y += 170;

      drawCard('Me gusta', fmt(safeStats.likes), colors.green, 60, y);
      drawCard('No me gusta', fmt(safeStats.dislikes), colors.red, 400, y);

      // Satisfacción
      const cardX = 740;
      const cardWidth = 320;
      const cardHeight = 140;
      ctx.fillStyle = colors.orange;
      ctx.fillRect(cardX, y, cardWidth, cardHeight);
      ctx.fillStyle = '#6b7280';
      ctx.font = '28px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Satisfacción', cardX + 20, y + 40);
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 50px Arial';
      ctx.fillText(pct() + '%', cardX + 20, y + 100);

      y += 200;

      // Secciones de listas
      ctx.fillStyle = '#f9fafb'; // gray-50
      ctx.fillRect(60, y, 480, 300);
      ctx.fillRect(580, y, 480, 300);

      // Páginas más visitadas
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('📄 Páginas más visitadas', 80, y + 50);

      ctx.font = '24px Arial';
      ctx.fillStyle = '#6b7280';
      if (safeStats.topPages && safeStats.topPages.length > 0) {
        safeStats.topPages.slice(0, 5).forEach((page, i) => {
          const text = `#${i + 1} ${page.title || page.path}`;
          const truncated = text.length > 35 ? text.substring(0, 35) + '...' : text;
          ctx.fillText(truncated, 80, y + 100 + (i * 40));
        });
      } else {
        ctx.fillText('No hay datos disponibles', 80, y + 100);
      }

      // Productos más visitados
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 32px Arial';
      ctx.fillText('🛍️ Productos más visitados', 600, y + 50);

      ctx.font = '24px Arial';
      ctx.fillStyle = '#6b7280';
      if (safeStats.topProducts && safeStats.topProducts.length > 0) {
        safeStats.topProducts.slice(0, 5).forEach((product, i) => {
          const text = `#${i + 1} ${product.productName}`;
          const truncated = text.length > 35 ? text.substring(0, 35) + '...' : text;
          ctx.fillText(truncated, 600, y + 100 + (i * 40));
        });
      } else {
        ctx.fillText('No hay datos disponibles', 600, y + 100);
      }

      // Footer
      y += 340;
      ctx.fillStyle = '#10b981'; // green-500
      ctx.font = '26px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('● Conectado a Firebase', size / 2, y);

      // Convertir a blob y copiar
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Error al generar imagen');
          return;
        }

        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          alert('📋 Imagen copiada al portapapeles (1080x1080)');
        } catch (clipError) {
          console.error('Error al copiar al clipboard:', clipError);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'estadisticas-1080x1080.png';
          a.click();
          URL.revokeObjectURL(url);
          alert('📥 Imagen descargada (no se pudo copiar al portapapeles)');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error al generar imagen:', error);
      alert('Error al generar imagen: ' + error.message);
    } finally {
      setCopying(false);
    }
  };

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

      {/* Modal centrado - Cuadrado 1:1 (1080x1080) */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <motion.div
            id="stats-card"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl aspect-square overflow-y-auto border border-gray-200 dark:border-gray-700 flex flex-col"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                Estadísticas
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyImage}
                  disabled={copying}
                  className="text-sm px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50"
                >
                  {copying ? '⏳' : '📋 Copiar'}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-sm px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  Cerrar
                </button>
              </div>
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
                value={loading ? "…" : fmt(safeStats.totalVisits)}
                color="blue"
              />
              <Item
                label="Visitantes Únicos"
                value={loading ? "…" : fmt(safeStats.uniqueVisitors)}
                color="purple"
              />
              <Item
                label="Usuarios Registrados"
                value={loading ? "…" : fmt(safeStats.registeredUsers)}
                color="indigo"
              />
              <Item
                label="Me gusta"
                value={loading ? "…" : fmt(safeStats.likes)}
                color="green"
              />
              <Item
                label="No me gusta"
                value={loading ? "…" : fmt(safeStats.dislikes)}
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
                ) : safeStats.topPages && safeStats.topPages.length > 0 ? (
                  <div className="space-y-2">
                    {safeStats.topPages.map((page, index) => (
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
                ) : safeStats.topProducts && safeStats.topProducts.length > 0 ? (
                  <div className="space-y-2">
                    {safeStats.topProducts.map((product, index) => (
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
