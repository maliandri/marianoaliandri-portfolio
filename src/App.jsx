import React from "react";
import { motion } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";

// ========================================
// COMPONENTE SEO
// ========================================
import SEO from "./components/SEO.jsx";

// ========================================
// SECCIONES EXISTENTES
// ========================================
import Hero from "./components/Hero.jsx";
import ServiciosCarousel from "./components/ServiciosCarousel.jsx";
import Skills from "./components/Skills.jsx";
import Contact from "./components/Contact.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import LikeSystem from "./components/LikeSystem.jsx";
import AIChatBot from "./components/AIChatBot.jsx";

// ========================================
// CONTENEDOR DE ACCIONES FLOTANTES
// ========================================
import FloatingActions from "./components/FloatingActions.jsx";

import "./index.css";

export default function App() {
  return (
    <HelmetProvider>
      {/* ========================================
          SEO GLOBAL - META TAGS
          Configura todos los meta tags de la página principal
      ========================================= */}
      <SEO
        title="Mariano Aliandri | Desarrollador Full Stack & BI"
        description="Desarrollador Full Stack y Analista de Datos en Neuquén. Especialista en React, Python, Power BI y consultoría BI."
        keywords="Mariano Aliandri, desarrollador full stack, React, Next.js, Python, Power BI, análisis de datos, consultoría BI, Neuquén Argentina"
        image="https://marianoaliandri.com.ar/og-image.jpg"
        url="https://marianoaliandri.com.ar"
        type="website"
      />

      <div className="font-sans min-h-screen text-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500">
        <ThemeToggle />
        <LikeSystem />

        {/* Botones/Modales flotantes agrupados */}
        <FloatingActions />

        {/* Chatbot flotante */}
        <AIChatBot />

        {/* Contenido principal */}
        <main className="max-w-5xl mx-auto p-4 space-y-20">
          <Hero />
          <section aria-label="Servicios profesionales">
            <ServiciosCarousel />
          </section>
          <section aria-label="Habilidades técnicas">
            <Skills />
          </section>
          <section aria-label="Información de contacto">
            <Contact />
          </section>
        </main>
      </div>
    </HelmetProvider>
  );
}