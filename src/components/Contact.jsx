import React from "react";
import { motion } from "framer-motion";

// Componente para la sección de contacto
function Contact() {
  return (
    <motion.section
      id="contact"
      className="text-center p-8 md:p-12 rounded-3xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      aria-labelledby="contact-heading"
    >
      <h2 id="contact-heading" className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">
        ¡Hablemos!
      </h2>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
        Estoy disponible para nuevos proyectos y colaboraciones.
      </p>
      <nav className="mt-8 flex flex-col sm:flex-row justify-center gap-4" aria-label="Opciones de contacto">
        {/* Enlace de correo electrónico */}
        <a
          href="mailto:marianoaliandri@gmail.com"
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-md hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300"
          aria-label="Enviar correo electrónico a Mariano Aliandri"
        >
          Enviar un correo
        </a>
        {/* Enlace de LinkedIn */}
        <a
          href="https://www.linkedin.com/in/mariano-aliandri-816b4024/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-full hover:bg-indigo-600 hover:text-white transform hover:scale-105 transition-all duration-300"
          aria-label="Visitar perfil de LinkedIn de Mariano Aliandri (se abre en nueva pestaña)"
        >
          Visitar LinkedIn
        </a>
      </nav>
    </motion.section>
  );
}

export default Contact;
