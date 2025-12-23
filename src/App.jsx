import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import "./index.css";

// Context
import { CartProvider } from "./context/CartContext.jsx";

// Firebase
import { FirebaseAnalyticsService } from "./utils/firebaseservice";

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
import VisitorCounter from "./components/VisitorCounter.jsx";
import AIChatBot from "./components/AIChatBot.jsx";
import AuthButton from "./components/AuthButton.jsx";
import ShopButton from "./components/ShopButton.jsx";
import Footer from "./components/Footer.jsx";

// Herramientas
import KpiRadar from "./components/KpiRadar";
import DashboardStats from "./components/DashboardStats";
import CVATSUploader from "./components/CVATSUploader";
import ROICalculator from "./components/Calculadora";
import WebCalculator from "./components/CalculadoraWeb";

// HomePage Component
const HomePage = () => (
  <>
    <SEO
      title="Mariano Aliandri | Dev. Full Stack, React, Python & Data"
      description="Desarrollador Full Stack y Analista de Datos con experiencia en React y Python. Explora mi portfolio de proyectos y habilidades en Power BI."
      canonical="/"
    />

    <main className="animation-section">
      <div className="animation-content-wrapper">
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
      </div>
    </main>
  </>
);

// Páginas
import ProfilePage from "./pages/ProfilePage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import StorePage from "./pages/StorePage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

export default function App() {
  const location = useLocation();
  const [activeTool, setActiveTool] = useState(null);
  const [firebaseService] = useState(() => new FirebaseAnalyticsService());

  // Tracking automático de páginas visitadas
  useEffect(() => {
    const pageMap = {
      '/': 'Home',
      '/perfil': 'Perfil de Usuario',
      '/mis-compras': 'Mis Compras',
      '/tienda': 'Tienda',
      '/admin': 'Panel de Administración'
    };

    const pageTitle = pageMap[location.pathname] || 'Página desconocida';
    firebaseService.trackPageView(location.pathname, pageTitle);
  }, [location.pathname, firebaseService]);

  // Abrir herramienta
  const openTool = (toolId) => {
    setActiveTool(toolId);
  };

  // Cerrar herramienta
  const closeTool = () => {
    setActiveTool(null);
    // Limpiar URL
    const url = new URL(window.location.href);
    url.hash = "";
    url.searchParams.delete("tool");
    window.history.replaceState({}, "", url.toString());
  };

  // Verificar si estamos en home
  const isHomePage = location.pathname === '/';

  return (
    <CartProvider>
      <div className="App font-sans min-h-screen text-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500 relative overflow-x-hidden">

        {/* Barra superior con Tienda, Autenticación, Chat y Likes - Centrada y Fija */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <ShopButton />
            <AuthButton />
            <AIChatBot />
            <LikeSystem />
            <VisitorCounter />
            <ThemeToggle />
          </div>
        </div>

        {/* Herramientas (Modales) */}
        <DashboardStats
          isOpen={activeTool === 'stats'}
          onClose={closeTool}
          hideFloatingButton={true}
        />
        <CVATSUploader
          isOpen={activeTool === 'ats'}
          onClose={closeTool}
          hideFloatingButton={true}
        />
        <ROICalculator
          isOpen={activeTool === 'roi'}
          onClose={closeTool}
          hideFloatingButton={true}
        />
        <WebCalculator
          isOpen={activeTool === 'web'}
          onClose={closeTool}
          hideFloatingButton={true}
        />
        <KpiRadar
          isOpen={activeTool === 'kpi'}
          onClose={closeTool}
          hideFloatingButton={true}
        />

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/mis-compras" element={<OrdersPage />} />
          <Route path="/tienda" element={<StorePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>

        {/* BOTONES FLOTANTES - Solo en home */}
        {isHomePage && (
          <div className="floating-buttons-container">
            {/* Web Calculator */}
            <button
              className="floating-button"
              onClick={() => openTool('web')}
              title="Cotizar Web"
            >
              <span className="button-icon">🌐</span>
              <span className="button-label">Cotizar Web</span>
            </button>

            {/* ROI Calculator */}
            <button
              className="floating-button"
              onClick={() => openTool('roi')}
              title="Calcular ROI"
            >
              <span className="button-icon">💰</span>
              <span className="button-label">Calcular ROI</span>
            </button>

            {/* Analizador ATS */}
            <button
              className="floating-button"
              onClick={() => openTool('ats')}
              title="Analizador ATS"
            >
              <span className="button-icon">📄</span>
              <span className="button-label">Analizador ATS</span>
            </button>

            {/* Estadísticas */}
            <button
              className="floating-button"
              onClick={() => openTool('stats')}
              title="Estadísticas"
            >
              <span className="button-icon">📊</span>
              <span className="button-label">Estadísticas</span>
            </button>

            {/* KPI Radar */}
            <button
              className="floating-button"
              onClick={() => openTool('kpi')}
              title="Radar KPI"
            >
              <span className="button-icon">🎯</span>
              <span className="button-label">Radar KPI</span>
            </button>

          </div>
        )}

        <Footer />
      </div>
    </CartProvider>
  );
}
