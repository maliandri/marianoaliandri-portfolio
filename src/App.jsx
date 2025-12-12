import React from "react";
import { Routes, Route } from "react-router-dom";
// import { motion } from "framer-motion"; // No lo estás usando aquí, se puede comentar

// Context
import { CartProvider } from "./context/CartContext.jsx";

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
import AuthButton from "./components/AuthButton.jsx";
import ShopButton from "./components/ShopButton.jsx";
import Footer from "./components/Footer.jsx";

// Páginas
import ProfilePage from "./pages/ProfilePage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import StorePage from "./pages/StorePage.jsx";

import "./index.css";

// El contenido original de tu página principal ahora vive aquí
const HomePage = () => (
  <>
    <SEO
      title="Mariano Aliandri | Dev. Full Stack, React, Python & Data"
      description="Desarrollador Full Stack y Analista de Datos con experiencia en React y Python. Explora mi portfolio de proyectos y habilidades en Power BI."
      canonical="/"
    />
    
    {/* IMPORTANTE: Hero suele tener fondos de ancho completo. 
       Si Hero tiene un fondo que debe ir de borde a borde de la pantalla,
       debería estar FUERA de este 'max-w-5xl'. 
       
       Si el Hero se ve "encajonado", muévelo fuera del <main> justo antes de él.
    */}
    <main className="max-w-5xl mx-auto p-4 space-y-20 relative">
      <Hero />
      <section id="servicios" aria-label="Servicios profesionales">
        <ServiciosCarousel />
      </section>
      <section id="skills" aria-label="Habilidades técnicas">
        <Skills />
      </section>
      <section aria-label="Carrousel de-imagenes">
        <Carrousel />
      </section>
      <section id="contact" aria-label="Información de contacto">
        <Contact />
      </section>
    </main>
  </>
);

export default function App() {
  return (
    <CartProvider>
      {/* AGREGADO: 'relative' y 'overflow-x-hidden'
          Esto evita que elementos decorativos rompan el ancho de la página */}
      <div className="font-sans min-h-screen text-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500 relative overflow-x-hidden">
        {/* Barra superior con Tienda y Autenticación */}
        <div className="fixed top-6 right-20 z-50 flex items-center gap-3">
          <ShopButton />
          <AuthButton />
        </div>

        <ThemeToggle />
        <LikeSystem />
        <FloatingActions />
        <AIChatBot />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/mis-compras" element={<OrdersPage />} />
          <Route path="/tienda" element={<StorePage />} />
          {/* Las rutas de pago se han eliminado según lo solicitado */}
        </Routes>

        <Footer />
      </div>
    </CartProvider>
  );
}