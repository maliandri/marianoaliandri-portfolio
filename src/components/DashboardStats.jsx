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
      {/*
        Botón para mostrar/ocultar el panel de estadísticas.  
        Lo colocamos en la esquina inferior izquierda, alineado con la fila de botones flotantes (ATS, Cotizar, ROI).
        Usamos bottom calc con safe-area-inset-bottom para que no quede oculto en móviles con notch.
      */}
      <motion.button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed left-4 z-[60] px-3 py-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 text-sm font-medium
          bottom-[calc(env(safe-area-inset-bottom)+1rem)] sm:bottom-[calc(env(safe-area-inset-bottom)+1.25rem)]"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        aria-label="Mostrar/ocultar estadísticas"
        title="Estadísticas"
      >
        Estadísticas
      </motion.button>

      {/*
        Panel de estadísticas.  
        Se posiciona encima de la fila de botones flotantes mediante bottom calc con un desplazamiento (8.5rem en móviles, 9.5rem en sm).  
        Se hace más estrecho (w-64 y w-72) y se ajustan tamaños de texto y paddings.
      */}
      <motion.div
        className={
          `fixed left-4 z-[55]
          bottom-[calc(env(safe-area-inset-bottom)+8.5rem)]
          sm:bottom-[calc(env(safe-area-inset-bottom)+9.5rem)]
          w-64 sm:w-72
          bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700
          p-4 sm:p-5
          ${isVisible ? 'pointer-events-auto' : 'pointer-events-none'}`
        }
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        initial={{ opacity: 0, y: 20, scale: 0.95, originY: 1, originX: 0 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : 20,
          scale: isVisible ? 1 : 0.95
        }}
        transition={{ duration: 0.25 }}
      >
        {/* Cabecera del reloj, más compacta */}
        <div className="text-center mb-3">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono leading-none">
            {formatTime(currentTime)}
          </div>
          <div className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 capitalize">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Indicador de conexión */}
        <div className="flex items-center justify-center mb-3">
          <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full text-[11px] ${
            loading
              ? 'bg-yellow-100/70 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
              : 'bg-green-100/70 dark:bg-green-900/20 text-green-700 dark:text-green-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
            {loading ? 'Conectando…' : '🌍 Base de datos global'}
          </div>
        </div>

        {/* Contenedor de estadísticas */}
        <div className="space-y-2.5">
          {/* Tarjeta de Visitas Totales */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-[11px] text-gray-600 dark:text-gray-400">Visitas Totales</div>
                <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {loading ? '…' : formatNumber(stats.totalVisits)}
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Visitantes Únicos */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <div>
                <div className="text-[11px] text-gray-600 dark:text-gray-400">Visitantes Únicos</div>
                <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {loading ? '…' : formatNumber(stats.uniqueVisitors)}
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Likes */}
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-lg">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
              </div>
              <div>
                <div className="text-[11px] text-gray-600 dark:text-gray-400">Me gusta</div>
                <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {loading ? '…' : formatNumber(stats.likes)}
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Dislikes */}
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-100 dark:bg-red-800 rounded-lg">
                <svg className="w-4 h-4 text-red-600 dark:text-red-400 rotate-180" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
              </div>
              <div>
                <div className="text-[11px] text-gray-600 dark:text-gray-400">No me gusta</div>
                <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {loading ? '…' : formatNumber(stats.dislikes)}
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Satisfacción */}
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 dark:bg-orange-800 rounded-lg">
                <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-[11px] text-gray-600 dark:text-gray-400">Satisfacción</div>
                <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {loading ? '…' : calculateSatisfaction()}%
                </div>
                <div className="mt-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <motion.div
                    className="bg-orange-600 dark:bg-orange-400 h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateSatisfaction()}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer compacto */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-[11px] text-gray-500 dark:text-gray-400 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Datos actualizados en tiempo real
            </div>
            <div className="mt-0.5">{loading ? 'Sincronizando…' : 'Conectado a Firebase'}</div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default DashboardStatsV2;