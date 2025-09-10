// src/components/FloatingActions.jsx
import React from "react";
import CVATSUploader from "./CVATSUploader";
import ROICalculator from "./Calculadora";
import WebCalculator from "./CalculadoraWeb";

export default function FloatingActions() {
  return (
    // contenedor fijo en la esquina inferior izquierda (ajustable con breakpoints)
    <div className="fixed left-2 bottom-4 sm:bottom-12 flex flex-col gap-3 z-50">
      {/* Cada herramienta ya contiene su propio botón y modal */}
      <CVATSUploader />
      <ROICalculator />
      <WebCalculator />
    </div>
  );
}
