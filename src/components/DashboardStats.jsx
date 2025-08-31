import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FirebaseAnalyticsService } from '../utils/firebaseservice';

function DashboardStatsV2() {
  const [stats, setStats] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    likes: 0,
    dislikes: 0
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [firebaseService] = useState(() => new FirebaseAnalyticsService());

  // Actualizar el reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Registrar visita y cargar estadísticas al iniciar
  useEffect(() => {
    initializeAnalytics();
  }, []);

  const initializeAnalytics = async () => {
    try {
      setLoading(true);
      
      // Registrar la visita
      await firebaseService.recordVisit();
      
      // Cargar estadísticas actuales
      const currentStats = await firebaseService.getStats();
      setStats(currentStats);

      // Suscribirse a actualizaciones en tiempo real (opcional)
      const unsubscribe = firebaseService.subscribeToStats((updatedStats) => {
        setStats(updatedStats);
      });

      // Cleanup subscription on unmount
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };

    } catch (error) {
      console.error('Error inicializando analytics:', error);
      
      // Fallback a localStorage
      await fallbackToLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const fallbackToLocalStorage = async () => {
    // Incrementar visitas locales
    const savedVisits = localStorage.getItem('siteVisits');
    const newVisits = savedVisits ? parseInt(savedVisits) + 1 : 1;
    localStorage.setItem('siteVisits', newVisits.toString());

    // Cargar datos locales
    const savedLikes = localStorage.getItem('siteLikes');
    const savedDislikes = localStorage.getItem('siteDislikes');
    
    setStats({
      totalVisits: newVisits,
      uniqueVisitors: newVisits, // En localStorage no distinguimos
      likes: savedLikes ? parseInt(savedLikes) : 0,
      dislikes: savedDislikes ? parseInt(savedDislikes) : 0
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateSatisfaction = () => {
    const total = stats.likes + stats.dislikes;
    if (total === 0) return 0;
    return Math.round((stats.likes / total) * 100);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <>
      {/* Botón para mostrar/ocultar dashboard */}
      <motion.button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-6 left-6 z-60 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      </motion.button>

      {/* Dashboard */}
      <motion.div
        className={`fixed top-20 left-6 z-50 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 ${
          isVisible ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        initial={{ opacity: 0, x: -100, scale: 0.8 }}
        animate={{ 
          opacity: isVisible ? 1 : 0, 
          x: isVisible ? 0 : -100,
          scale: isVisible ? 1 : 0.8
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Reloj */}
        <div className="text-center mb-6">
          <motion.div
            className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 font-mono"
            key={currentTime.getSeconds()}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.2 }}
          >
            {formatTime(currentTime)}
          </motion.div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 capitalize">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Indicador de conexión */}
        <div className="flex items-center justify-center mb-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
            loading 
              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
              : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
            }`}></div>
            {loading ? 'Conectando...' : '🌍 Base de datos global'}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="space-y-4">
          {/* Visitas Totales */}
          <motion.div
            className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Visitas Totales</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {loading ? '...' : formatNumber(stats.totalVisits)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Visitantes Únicos */}
          <motion.div
            className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Visitantes Únicos</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {loading ? '...' : formatNumber(stats.uniqueVisitors)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Likes */}
          <motion.div
            className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Me gusta</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {loading ? '...' : formatNumber(stats.likes)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dislikes */}
          <motion.div
            className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">No me gusta</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {loading ? '...' : formatNumber(stats.dislikes)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Satisfacción */}
          <motion.div
            className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                  <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Satisfacción</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {loading ? '...' : calculateSatisfaction()}%
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-orange-600 dark:bg-orange-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${calculateSatisfaction()}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Footer del dashboard */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Datos actualizados en tiempo real
            </div>
            <div className="mt-1">
              {loading ? 'Sincronizando...' : 'Conectado a Firebase'}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default DashboardStatsV2;