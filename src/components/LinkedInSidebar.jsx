import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { linkedinPosts } from '../data/linkedinPosts';

const INTERVAL_MS = 7000;
const WHATSAPP_NUMBER = '5492996302273';

const slideVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
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

  // Collapsed — pestaña vertical pegada al borde derecho
  if (!isExpanded) {
    return (
      <>
        {/* Desktop collapsed tab */}
        <motion.button
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={toggleExpand}
          className="fixed top-[50%] -translate-y-1/2 right-0 z-40 hidden min-[1440px]:flex items-center gap-1.5 py-4 px-1.5 rounded-l-xl bg-gradient-to-b from-[#0A66C2] to-[#4c01f9] text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          style={{ writingMode: 'vertical-lr' }}
          whileHover={{ x: -3 }}
        >
          <span className="text-[10px] font-bold tracking-wider">LinkedIn 30 Días</span>
          <span className="text-[10px]">◀</span>
        </motion.button>

        {/* Mobile/tablet inline banner (siempre visible cuando colapsado en pantallas chicas) */}
        <MobileBanner
          post={post}
          currentIndex={currentIndex}
          total={total}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          goNext={goNext}
          goPrev={goPrev}
          handleWhatsApp={handleWhatsApp}
        />
      </>
    );
  }

  return (
    <>
      {/* ═══════════════════════════════════════════ */}
      {/* DESKTOP — sidebar fijo derecho (>= 1440px) */}
      {/* ═══════════════════════════════════════════ */}
      <motion.aside
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-[90px] right-2 w-[225px] z-40 hidden min-[1440px]:flex flex-col gap-1.5"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-[#0A66C2] flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">in</span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              30 Días
            </span>
          </div>
          <button
            onClick={toggleExpand}
            className="w-4 h-4 rounded-full bg-gray-200/80 dark:bg-gray-700/80 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            aria-label="Contraer sidebar"
            title="Contraer"
          >
            <span className="text-[8px] text-gray-500 dark:text-gray-400">✕</span>
          </button>
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 shadow-lg">
          {/* Timer bar */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`timer-${currentIndex}`}
              className="h-[2px] bg-gradient-to-r from-[#0A66C2] to-[#4c01f9]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: INTERVAL_MS / 1000, ease: 'linear' }}
            />
          </AnimatePresence>

          <div className="p-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex flex-col gap-1.5"
              >
                {/* Day badge */}
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4c01f9] to-[#0A66C2] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {post.day}
                  </span>
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">
                    Día {post.day}/{total}
                  </span>
                </div>

                {/* Problema */}
                <div>
                  <p className="text-[8px] uppercase tracking-wider text-red-500/80 dark:text-red-400/80 font-bold">
                    Problema
                  </p>
                  <p className="text-[12px] font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                    {post.problema}
                  </p>
                </div>

                {/* Solución */}
                <div>
                  <p className="text-[8px] uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80 font-bold">
                    Solución
                  </p>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug">
                    {post.propuesta}
                  </p>
                </div>

                {/* Gancho */}
                <div className="pt-1.5 border-t border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed italic">
                    "{post.gancho}"
                  </p>
                </div>

                {/* CTA */}
                <motion.button
                  onClick={handleWhatsApp}
                  className="w-full py-1 px-2 text-[10px] font-semibold rounded-lg bg-gradient-to-r from-[#4c01f9] to-[#0A66C2] text-white hover:shadow-md hover:shadow-indigo-500/25 transition-shadow cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {post.cta} →
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Nav compact */}
        <div className="flex items-center justify-center gap-2 px-1">
          <button
            onClick={goPrev}
            className="w-5 h-5 rounded-full bg-gray-200/80 dark:bg-gray-700/80 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            aria-label="Anterior"
          >
            <span className="text-[9px] text-gray-600 dark:text-gray-300">◀</span>
          </button>
          <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium tabular-nums">
            {post.day}/{total}
          </span>
          <button
            onClick={goNext}
            className="w-5 h-5 rounded-full bg-gray-200/80 dark:bg-gray-700/80 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            aria-label="Siguiente"
          >
            <span className="text-[9px] text-gray-600 dark:text-gray-300">▶</span>
          </button>
        </div>
      </motion.aside>

      {/* ═══════════════════════════════════════════ */}
      {/* < 1440px — banner horizontal inline         */}
      {/* ═══════════════════════════════════════════ */}
      <MobileBanner
        post={post}
        currentIndex={currentIndex}
        total={total}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        goNext={goNext}
        goPrev={goPrev}
        handleWhatsApp={handleWhatsApp}
      />
    </>
  );
}

function MobileBanner({ post, currentIndex, total, setIsPlaying, goNext, goPrev, handleWhatsApp }) {
  return (
    <div
      className="min-[1440px]:hidden w-full mt-8 mb-4"
      onTouchStart={() => setIsPlaying(false)}
      onTouchEnd={() => setTimeout(() => setIsPlaying(true), 3000)}
    >
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <div className="w-4 h-4 rounded bg-[#0A66C2] flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">in</span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          LinkedIn · 30 Días de Valor
        </span>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 shadow-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={`mob-timer-${currentIndex}`}
            className="h-[2px] bg-gradient-to-r from-[#0A66C2] to-[#4c01f9]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: INTERVAL_MS / 1000, ease: 'linear' }}
          />
        </AnimatePresence>

        <div className="p-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={`mob-${currentIndex}`}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4c01f9] to-[#0A66C2] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {post.day}
                    </span>
                    <span className="text-[9px] text-gray-400 dark:text-gray-500">Día {post.day}/{total}</span>
                  </div>
                  <p className="text-[12px] font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                    {post.problema}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {post.propuesta}
                  </p>
                </div>
                <motion.button
                  onClick={handleWhatsApp}
                  className="shrink-0 py-1.5 px-3 text-[10px] font-semibold rounded-lg bg-gradient-to-r from-[#4c01f9] to-[#0A66C2] text-white cursor-pointer"
                  whileTap={{ scale: 0.95 }}
                >
                  {post.cta} →
                </motion.button>
              </div>

              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed italic border-t border-gray-200/50 dark:border-gray-700/50 pt-1.5">
                "{post.gancho}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <button onClick={goPrev} className="text-gray-400 dark:text-gray-500 text-sm cursor-pointer" aria-label="Anterior">◀</button>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums">{post.day}/{total}</span>
        <button onClick={goNext} className="text-gray-400 dark:text-gray-500 text-sm cursor-pointer" aria-label="Siguiente">▶</button>
      </div>
    </div>
  );
}
