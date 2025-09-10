// src/components/DashboardStats.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FirebaseAnalyticsService } from "../utils/firebaseservice";

export default function DashboardStatsV2() {
  const [stats, setStats] = useState({ totalVisits: 0, uniqueVisitors: 0, likes: 0, dislikes: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [firebaseService] = useState(() => new FirebaseAnalyticsService());

  // Reloj
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Inicializar analytics + cleanup de suscripción
  useEffect(() => {
    let cleanup;
    (async () => {
      try {
        setLoading(true);
        await firebaseService.recordVisit();
        const currentStats = await firebaseService.getStats();
        setStats(currentStats);
        cleanup = firebaseService.subscribeToStats((updated) => setStats(updated));
      } catch (err) {
        console.error("Error inicializando analytics:", err);
        // Fallback localStorage
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
        });
      } finally {
        setLoading(false);
      }
    })();
    return () => typeof cleanup === "function" && cleanup();
  }, [firebaseService]);

  const calculateSatisfaction = () => {
    const tot = stats.likes + stats.dislikes;
    return tot === 0 ? 0 : Math.round((stats.likes / tot) * 100);
  };

  const formatNumber = (n) => (n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toString());

  return (
    <>
      {/* Botón redondo, igual que los demás */}
      <button
        onClick={() => setOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-12 h-12 shadow-lg flex items-center justify-center"
        aria-label="Estadísticas"
        title="Estadísticas"
      >
        {/* Ícono simple */}
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M3 3a1 1 0 000 2h1v10a1 1 0 001 1h11a1 1 0 100-2H6V3a1 1 0 00-1-1H3z" />
          <path d="M9 7a1 1 0 00-1 1v7h2V8a1 1 0 00-1-1zm4-3a1 1 0 00-1 1v10h2V5a1 1 0 00-1-1zm4 6a1 1 0 00-1 1v4h2v-4a1 1 0 00-1-1z" />
        </svg>
      </button>

      {/* Modal centrado */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-5 w-80 max-w-md border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">Estadísticas</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-sm px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {currentTime.toLocaleString("es-ES")}
            </p>

            <div className="space-y-2">
              <Item label="Visitas Totales" value={loading ? "…" : formatNumber(stats.totalVisits)} color="blue" />
              <Item label="Visitantes Únicos" value={loading ? "…" : formatNumber(stats.uniqueVisitors)} color="purple" />
              <Item label="Me gusta" value={loading ? "…" : formatNumber(stats.likes)} color="green" />
              <Item label="No me gusta" value={loading ? "…" : formatNumber(stats.dislikes)} color="red" />
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl">
                <div className="text-[11px] text-gray-600 dark:text-gray-400">Satisfacción</div>
                <div className="text-base font-bold text-gray-900 dark:text-gray-100">{calculateSatisfaction()}%</div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <motion.div
                    className="bg-orange-600 dark:bg-orange-400 h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateSatisfaction()}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
              <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-[11px] ${
                loading
                  ? "bg-yellow-100/70 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                  : "bg-green-100/70 dark:bg-green-900/20 text-green-700 dark:text-green-400"
              }`}>
                <span className={`w-2 h-2 rounded-full ${loading ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`} />
                {loading ? "Sincronizando…" : "Conectado a Firebase"}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

function Item({ label, value, color }) {
  const colorMap = {
    blue: "bg-blue-50 dark:bg-blue-900/20",
    purple: "bg-purple-50 dark:bg-purple-900/20",
    green: "bg-green-50 dark:bg-green-900/20",
    red: "bg-red-50 dark:bg-red-900/20",
  };
  return (
    <div className={`${colorMap[color]} p-3 rounded-xl`}>
      <div className="text-[11px] text-gray-600 dark:text-gray-400">{label}</div>
      <div className="text-base font-bold text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  );
}
