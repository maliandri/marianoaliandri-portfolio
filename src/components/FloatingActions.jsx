// src/components/FloatingActions.jsx
import React, { useEffect } from "react";
import KpiRadar from "./KpiRadar";
import DashboardStats from "./DashboardStats";
import CVATSUploader from "./CVATSUploader";
import ROICalculator from "./Calculadora";
import WebCalculator from "./CalculadoraWeb";

export default function FloatingActions({ activeTool, onClose }) {
  // Herramientas disponibles
  const tools = [
    {
      id: "stats",
      hash: "stats",
      Component: DashboardStats
    },
    {
      id: "ats",
      hash: "ats",
      Component: CVATSUploader
    },
    {
      id: "roi",
      hash: "roi",
      Component: ROICalculator
    },
    {
      id: "web",
      hash: "web",
      Component: WebCalculator
    },
    {
      id: "kpi",
      hash: "kpi",
      Component: KpiRadar
    }
  ];

  // Detectar deep-links al cargar
  useEffect(() => {
    const detectDeepLink = () => {
      const path = window.location.pathname || "";
      const query = new URLSearchParams(window.location.search);
      const hash = (window.location.hash || "").replace("#", "");

      // Buscar qué herramienta debe abrirse
      const toolToOpen = tools.find(tool => {
        return (
          hash === tool.hash ||
          query.get("tool") === tool.hash ||
          path.includes(`/${tool.hash}`) ||
          path.includes(`/calculadora-${tool.hash}`) ||
          path.includes(`/analizador-${tool.hash}`)
        );
      });

      if (toolToOpen && !activeTool) {
        // Solo abrir si no hay herramienta activa ya
        // Aquí necesitaríamos una manera de notificar al App
        // Por ahora dejamos que el Sidebar maneje esto
      }
    };

    detectDeepLink();

    // Escuchar cambios en el hash
    window.addEventListener("hashchange", detectDeepLink);
    return () => window.removeEventListener("hashchange", detectDeepLink);
  }, [activeTool]); // eslint-disable-line

  // Renderizar los modales de las herramientas
  return (
    <>
      {tools.map(tool => {
        const Component = tool.Component;
        const isOpen = activeTool?.id === tool.id;

        return (
          <Component
            key={tool.id}
            isOpen={isOpen}
            onClose={onClose}
            hideFloatingButton={true}
          />
        );
      })}
    </>
  );
}
