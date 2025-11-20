import React from "react";
import { motion } from "framer-motion";
import tuFoto from "../assets/image_12a02c.jpg";

// Componente para la sección principal (Hero) del portafolio
function Hero() {
  return (
    <motion.section
      className="text-center p-8 md:p-12 rounded-3xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      aria-label="Presentación principal"
    >
      <motion.div
        className="mx-auto w-32 h-32 md:w-40 md:h-40 overflow-hidden rounded-full border-4 border-indigo-500 shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <img
          src={tuFoto}
          alt="Mariano Aliandri - Desarrollador Full Stack y Analista de Datos"
          className="w-full h-full object-cover"
          width="160"
          height="160"
          loading="eager"
        />
      </motion.div>
      <motion.h1
        className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        Mariano Aliandri - Desarrollador Full Stack & Analista de Datos
      </motion.h1>
      <motion.p
        className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        Analista de datos e inteligencia Empresarial.
        Desarrollador web con pasión por crear soluciones elegantes y eficientes.
        Bienvenido a mi portafolio.
      </motion.p>
      <motion.a
        href="https://wa.me/+542995414422"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-block px-8 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 ease-in-out"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        aria-label="Contactar por WhatsApp a Mariano Aliandri"
      >
        Contactar por WhatsApp
      </motion.a>
    </motion.section>
  );
}

export default Hero;
