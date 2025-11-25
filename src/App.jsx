import React from "react";
import { Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";

// SEO y Componentes de Página
import SEO from "./components/SEO.jsx";
import Hero from "./components/Hero.jsx";
import ServiciosCarousel from "./components/ServiciosCarousel.jsx";
import Skills from "./components/Skills.jsx";
import Carrousel from "./components/Carrousel.jsx";
import Contact from "./components/Contact.jsx";

// Componentes UI
import ThemeToggle from "./components/ThemeToggle.jsx";
import LikeSystem from "./components/LikeSystem.jsx";
import AIChatBot from "./components/AIChatBot.jsx";
import FloatingActions from "./components/FloatingActions.jsx";

import "./index.css";

// El contenido original de tu página principal ahora vive aquí
const HomePage = () => (
  <>
    <SEO
      title="Mariano Aliandri | Dev. Full Stack, React, Python & Data"
      description="Desarrollador Full Stack y Analista de Datos con experiencia en React y Python. Explora mi portfolio de proyectos y habilidades en Power BI."
      canonical="/"
    />
    <main className="max-w-5xl mx-auto p-4 space-y-20">
      <Hero />
      <section aria-label="Servicios profesionales">
        <ServiciosCarousel />
      </section>
      <section aria-label="Habilidades técnicas">
        <Skills />
      </section>
      <section aria-label="Carrousel de-imagenes">
        <Carrousel />
      </section>
      <section aria-label="Información de contacto">
        <Contact />
      </section>
    </main>
  </>
);

export default function App() {
  return (
    <div className="font-sans min-h-screen text-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500">
      <ThemeToggle />
      <LikeSystem />
      <FloatingActions />
      <AIChatBot />

      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Las rutas de pago se han eliminado según lo solicitado */}
      </Routes>
    </div>
  );
}