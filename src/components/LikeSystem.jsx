// LikeSystem.jsx - Versión con contador global
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function LikeSystem() {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);

  // API endpoint (usando countapi.xyz como ejemplo)
  const API_BASE = 'https://api.countapi.xyz';
  const NAMESPACE = 'portfolio-mariano';

  // Cargar datos globales al iniciar
  useEffect(() => {
    loadGlobalCounts();
    loadUserVote();
  }, []);

  const loadGlobalCounts = async () => {
    try {
      // Obtener contadores globales
      const [likesResponse, dislikesResponse] = await Promise.all([
        fetch(`${API_BASE}/get/${NAMESPACE}/likes`),
        fetch(`${API_BASE}/get/${NAMESPACE}/dislikes`)
      ]);

      const likesData = await likesResponse.json();
      const dislikesData = await dislikesResponse.json();

      setLikes(likesData.value || 0);
      setDislikes(dislikesData.value || 0);
    } catch (error) {
      console.error('Error loading global counts:', error);
      // Fallback a localStorage si falla la API
      const savedLikes = localStorage.getItem('siteLikes');
      const savedDislikes = localStorage.getItem('siteDislikes');
      if (savedLikes) setLikes(parseInt(savedLikes));
      if (savedDislikes) setDislikes(parseInt(savedDislikes));
    } finally {
      setLoading(false);
    }
  };

  const loadUserVote = () => {
    const savedUserVote = localStorage.getItem('userVote');
    if (savedUserVote) setUserVote(savedUserVote);
  };

  const handleVote = async (voteType) => {
    if (loading) return;

    setLoading(true);
    
    try {
      let newUserVote = voteType;

      // Si el usuario ya votó lo mismo, quitar el voto
      if (userVote === voteType) {
        newUserVote = null;
        // Decrementar contador global
        if (voteType === 'like') {
          await fetch(`${API_BASE}/hit/${NAMESPACE}/likes/-1`);
          setLikes(prev => Math.max(0, prev - 1));
        } else {
          await fetch(`${API_BASE}/hit/${NAMESPACE}/dislikes/-1`);
          setDislikes(prev => Math.max(0, prev - 1));
        }
      }
      // Si cambió su voto
      else if (userVote && userVote !== voteType) {
        if (userVote === 'like') {
          // Quitar like, agregar dislike
          await Promise.all([
            fetch(`${API_BASE}/hit/${NAMESPACE}/likes/-1`),
            fetch(`${API_BASE}/hit/${NAMESPACE}/dislikes/1`)
          ]);
          setLikes(prev => Math.max(0, prev - 1));
          setDislikes(prev => prev + 1);
        } else {
          // Quitar dislike, agregar like
          await Promise.all([
            fetch(`${API_BASE}/hit/${NAMESPACE}/dislikes/-1`),
            fetch(`${API_BASE}/hit/${NAMESPACE}/likes/1`)
          ]);
          setDislikes(prev => Math.max(0, prev - 1));
          setLikes(prev => prev + 1);
        }
      }
      // Nuevo voto
      else {
        if (voteType === 'like') {
          await fetch(`${API_BASE}/hit/${NAMESPACE}/likes/1`);
          setLikes(prev => prev + 1);
        } else {
          await fetch(`${API_BASE}/hit/${NAMESPACE}/dislikes/1`);
          setDislikes(prev => prev + 1);
        }
      }

      // Guardar voto del usuario localmente
      setUserVote(newUserVote);
      localStorage.setItem('userVote', newUserVote || '');

    } catch (error) {
      console.error('Error updating vote:', error);
      // Mostrar mensaje de error o usar fallback
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

      {/* Indicador de total global */}
      {!loading && (likes > 0 || dislikes > 0) && (
        <motion.div
          className="text-xs text-gray-500 dark:text-gray-400 text-center bg-white dark:bg-gray-800 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Global: {likes + dislikes} votos
        </motion.div>
      )}
    </motion.div>
  );
}

export default LikeSystem;