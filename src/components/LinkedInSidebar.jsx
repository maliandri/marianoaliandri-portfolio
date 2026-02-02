import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { linkedinPosts } from '../data/linkedinPosts';

const INTERVAL_MS = 7000;
const WHATSAPP_NUMBER = '5492996302273';

const slideVariants = {
  enter: { opacity: 0, y: 30 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
};

export default function LinkedInSidebar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  const post = linkedinPosts[currentIndex];
  const total = linkedinPosts.length;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isPlaying, total]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleWhatsApp = useCallback(() => {
    const msg = encodeURIComponent(
      `Hola Mariano! Vi el Día ${post.day} de tu serie LinkedIn: "${post.problema}" — Me interesa saber más.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  }, [post]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Collapsed state — just a small tab
  if (!isExpanded) {
    return (
      <motion.button
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={toggleExpand}
        className="fixed top-[100px] right-0 z-40 hidden xl:flex items-center gap-1.5 py-3 px-2 rounded-l-xl bg-gradient-to-b from-[#0A66C2] to-[#4c01f9] text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
        style={{ writingMode: 'vertical-lr' }}
        whileHover={{ x: -3 }}
      >
        <span className="text-[10px] font-bold tracking-wider">LinkedIn 30 Días</span>
        <span className="text-[10px]">◀</span>
      </motion.button>
    );
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-[100px] right-3 w-[230px] z-40 hidden xl:flex flex-col gap-2"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Header with collapse button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-[#0A66C2] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">in</span>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            30 Días
          </span>
        </div>
        <button
          onClick={toggleExpand}
          className="w-5 h-5 rounded-full bg-gray-200/80 dark:bg-gray-700/80 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          aria-label="Contraer sidebar"
          title="Contraer"
        >
          <span className="text-[9px] text-gray-500 dark:text-gray-400">▶</span>
        </button>
      </div>

      {/* Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 shadow-lg">
        {/* Timer bar */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`timer-${currentIndex}`}
            className="h-[3px] bg-gradient-to-r from-[#0A66C2] to-[#4c01f9]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: INTERVAL_MS / 1000, ease: 'linear' }}
          />
        </AnimatePresence>

        <div className="p-3.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex flex-col gap-2"
            >
              {/* Day badge + counter */}
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4c01f9] to-[#0A66C2] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  {post.day}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                  Día {post.day} de {total}
                </span>
              </div>

              {/* Problema */}
              <div>
                <p className="text-[9px] uppercase tracking-wider text-red-500/80 dark:text-red-400/80 font-bold mb-0.5">
                  Problema
                </p>
                <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                  {post.problema}
                </p>
              </div>

              {/* Solución */}
              <div>
                <p className="text-[9px] uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80 font-bold mb-0.5">
                  Solución
                </p>
                <p className="text-[12px] text-gray-600 dark:text-gray-300 leading-snug">
                  {post.propuesta}
                </p>
              </div>

              {/* Gancho — contenido desarrollado */}
              <div className="mt-1 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed italic">
                  "{post.gancho}"
                </p>
              </div>

              {/* CTA */}
              <motion.button
                onClick={handleWhatsApp}
                className="mt-1 w-full py-1.5 px-3 text-[11px] font-semibold rounded-lg bg-gradient-to-r from-[#4c01f9] to-[#0A66C2] text-white hover:shadow-md hover:shadow-indigo-500/25 transition-shadow cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {post.cta} →
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={goPrev}
          className="w-6 h-6 rounded-full bg-gray-200/80 dark:bg-gray-700/80 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          aria-label="Anterior"
        >
          <span className="text-[10px] text-gray-600 dark:text-gray-300">◀</span>
        </button>

        {/* Progress dots */}
        <div className="flex gap-[3px] flex-wrap justify-center max-w-[160px]">
          {linkedinPosts.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-[6px] h-[6px] rounded-full transition-all duration-300 cursor-pointer ${
                i === currentIndex
                  ? 'bg-[#4c01f9] scale-150'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Día ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          className="w-6 h-6 rounded-full bg-gray-200/80 dark:bg-gray-700/80 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          aria-label="Siguiente"
        >
          <span className="text-[10px] text-gray-600 dark:text-gray-300">▶</span>
        </button>
      </div>
    </motion.aside>
  );
}
