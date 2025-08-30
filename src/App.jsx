import React from "react";
import { motion } from "framer-motion";

// Secciones existentes
import Hero from "./components/Hero.jsx";
import ServiciosCarousel from "./components/ServiciosCarousel.jsx";
import Skills from "./components/Skills.jsx";
import Contact from "./components/Contact.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import LikeSystem from "./components/LikeSystem.jsx";
import DashboardStats from "./components/DashboardStats.jsx";
import AIChatBot from "./components/AIChatBot.jsx";

// Calculadoras
import ROICalculator from "./components/Calculadora.jsx";
import WebCalculator from "./components/CalculadoraWeb.jsx";

// 🔴 ATS (botón flotante + modal)
import CVATSUploader from "./components/CVATSUploader.jsx";

import "./index.css";

export default function App() {
  return (
    <main className="font-sans min-h-screen text-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500">
      <ThemeToggle />
      <DashboardStats />
      <LikeSystem />

      {/* Botones/Modales flotantes */}
      <ROICalculator />
      <CVATSUploader />
      <WebCalculator />
      <AIChatBot />

      {/* Contenido principal */}
      <div className="max-w-5xl mx-auto p-4 space-y-20">
        <Hero />
        <ServiciosCarousel />
        <Skills />
        <Contact />
      </div>
    </main>
  );
}
