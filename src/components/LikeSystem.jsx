import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FirebaseAnalyticsService } from '../utils/firebaseservice';

function LikeSystemV2() {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseService] = useState(() => new FirebaseAnalyticsService());

  // Cargar datos al iniciar
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas y voto del usuario en paralelo
      const [stats, userVoteData] = await Promise.all([
        firebaseService.getStats(),
        firebaseService.getUserVote()
      ]);

      setLikes(stats.likes || 0);
      setDislikes(stats.dislikes || 0);
      setUserVote(userVoteData);

    } catch (error) {
      console.error('Error inicializando datos:', error);
      // Fallback a localStorage si Firebase falla
      await fallbackToLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const fallbackToLocalStorage = async () => {
    const savedLikes = localStorage.getItem('siteLikes');
    const savedDislikes = localStorage.getItem('siteDislikes');
    const savedUserVote = localStorage.getItem('userVote');
    
    setLikes(savedLikes ? parseInt(savedLikes) : 0);
    setDislikes(savedDislikes ? parseInt(savedDislikes) : 0);
    setUserVote(savedUserVote || null);
  };

  const handleVote = async (voteType) => {
    if (loading) return;

    const previousVote = userVote;
    const previousLikes = likes;
    const previousDislikes = dislikes;

    try {
      setLoading(true);

      // Actualizar UI optimísticamente
      let newUserVote = voteType;
      let newLikes = likes;
      let newDislikes = dislikes;

      if (userVote === voteType) {
        // Quitar voto
        newUserVote = null;
        if (voteType === 'like') {
          newLikes = Math.max(0, likes - 1);
        } else {
          newDislikes = Math.max(0, dislikes - 1);
        }
      } else if (userVote && userVote !== voteType) {
        // Cambiar voto
        if (userVote === 'like') {
          newLikes = Math.max(0, likes - 1);
          newDislikes = dislikes + 1;
        } else {
          newDislikes = Math.max(0, dislikes - 1);
          newLikes = likes + 1;
        }
      } else {
        // Nuevo voto
        if (voteType === 'like') {
          newLikes = likes + 1;
        } else {
          newDislikes = dislikes + 1;
        }
      }

      // Actualizar UI inmediatamente
      setUserVote(newUserVote);
      setLikes(newLikes);
      setDislikes(newDislikes);

      // Intentar guardar en Firebase
      try {
        const result = await firebaseService.handleVote(voteType);
        
        // Si Firebase devuelve resultado diferente, corregir
        if (result !== newUserVote) {
          setUserVote(result);
        }

        // Recargar stats para asegurar sincronización
        const updatedStats = await firebaseService.getStats();
        setLikes(updatedStats.likes || 0);
        setDislikes(updatedStats.dislikes || 0);

      } catch (firebaseError) {
        console.error('Error con Firebase, usando localStorage:', firebaseError);
        
        // Fallback: guardar en localStorage
        localStorage.setItem('siteLikes', newLikes.toString());
        localStorage.setItem('siteDislikes', newDislikes.toString());
        localStorage.setItem('userVote', newUserVote || '');
      }

    } catch (error) {
      console.error('Error general en votación:', error);
      
      // Revertir cambios en caso de error
      setUserVote(previousVote);
      setLikes(previousLikes);
      setDislikes(previousDislikes);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      {/* Botón de Like */}
      <motion.button
        onClick={() => handleVote('like')}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 ${
          userVote === 'like'
            ? 'bg-green-500 text-white scale-105'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900'
        } border border-gray-200 dark:border-gray-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        whileHover={{ scale: userVote === 'like' ? 1.05 : 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ 
            scale: userVote === 'like' ? [1, 1.3, 1] : 1,
            rotate: userVote === 'like' ? [0, 15, -15, 0] : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
        </motion.div>
        <span className="font-medium">{loading ? '...' : likes}</span>
      </motion.button>

      {/* Botón de Dislike */}
      <motion.button
        onClick={() => handleVote('dislike')}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 ${
          userVote === 'dislike'
            ? 'bg-red-500 text-white scale-105'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900'
        } border border-gray-200 dark:border-gray-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        whileHover={{ scale: userVote === 'dislike' ? 1.05 : 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ 
            scale: userVote === 'dislike' ? [1, 1.3, 1] : 1,
            rotate: userVote === 'dislike' ? [0, -15, 15, 0] : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <svg className="w-5 h-5 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
        </motion.div>
        <span className="font-medium">{loading ? '...' : dislikes}</span>
      </motion.button>

      {/* Indicador de estado */}
      {!loading && (likes > 0 || dislikes > 0) && (
        <motion.div
          className="text-xs text-gray-500 dark:text-gray-400 text-center bg-white dark:bg-gray-800 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          🌍 Global: {likes + dislikes} votos
        </motion.div>
      )}
    </motion.div>
  );
}

export default LikeSystemV2;