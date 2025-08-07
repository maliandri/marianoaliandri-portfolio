import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function LikeSystem() {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  // Cargar datos al iniciar
  useEffect(() => {
    loadCounts();
    loadUserVote();
  }, []);

  const loadCounts = async () => {
    try {
      // Intentar cargar desde countapi.xyz
      const [likesResponse, dislikesResponse] = await Promise.all([
        fetch(`https://api.countapi.xyz/get/portfolio-mariano/likes`),
        fetch(`https://api.countapi.xyz/get/portfolio-mariano/dislikes`)
      ]);

      if (likesResponse.ok && dislikesResponse.ok) {
        const likesData = await likesResponse.json();
        const dislikesData = await dislikesResponse.json();

        setLikes(likesData.value || 0);
        setDislikes(dislikesData.value || 0);
        
        // Guardar también en localStorage como backup
        localStorage.setItem('siteLikes', (likesData.value || 0).toString());
        localStorage.setItem('siteDislikes', (dislikesData.value || 0).toString());
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.log('Usando localStorage como fallback para likes');
      setUseLocalStorage(true);
      
      // Fallback a localStorage
      const savedLikes = localStorage.getItem('siteLikes');
      const savedDislikes = localStorage.getItem('siteDislikes');
      
      setLikes(savedLikes ? parseInt(savedLikes) : 0);
      setDislikes(savedDislikes ? parseInt(savedDislikes) : 0);
    } finally {
      setLoading(false);
    }
  };

  const loadUserVote = () => {
    const savedUserVote = localStorage.getItem('userVote');
    if (savedUserVote) setUserVote(savedUserVote);
  };

  const updateLocalStorage = (newLikes, newDislikes) => {
    localStorage.setItem('siteLikes', newLikes.toString());
    localStorage.setItem('siteDislikes', newDislikes.toString());
  };

  const handleVote = async (voteType) => {
    if (loading) return;

    setLoading(true);
    
    try {
      let newLikes = likes;
      let newDislikes = dislikes;
      let newUserVote = voteType;

      // Lógica de votación
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

      // Actualizar estado local inmediatamente
      setLikes(newLikes);
      setDislikes(newDislikes);
      setUserVote(newUserVote);
      
      // Guardar en localStorage
      updateLocalStorage(newLikes, newDislikes);
      localStorage.setItem('userVote', newUserVote || '');

      // Intentar actualizar API si está disponible
      if (!useLocalStorage) {
        try {
          // Solo intentar si la API está funcionando
          const change = newUserVote === voteType ? 1 : (userVote === voteType ? -1 : 0);
          if (change !== 0) {
            if (voteType === 'like') {
              await fetch(`https://api.countapi.xyz/hit/portfolio-mariano/likes/${change}`);
            } else {
              await fetch(`https://api.countapi.xyz/hit/portfolio-mariano/dislikes/${change}`);
            }
          }
        } catch (error) {
          console.log('API no disponible, usando solo localStorage');
          setUseLocalStorage(true);
        }
      }

    } catch (error) {
      console.error('Error updating vote:', error);
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
          {useLocalStorage ? 'Local' : 'Global'}: {likes + dislikes} votos
        </motion.div>
      )}
    </motion.div>
  );
}

export default LikeSystem;