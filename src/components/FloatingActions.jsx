// src/components/FloatingActions.jsx
import React from "react";
import KpiRadar from "./KpiRadar";
import DashboardStatsV2 from "./DashboardStats";
import CVATSUploader from "./CVATSUploader";
import ROICalculator from "./Calculadora";
import WebCalculator from "./CalculadoraWeb";

export default function FloatingActions() {
  return (
    <div className="fixed left-2 bottom-24 sm:bottom-28 flex flex-col gap-2 z-50">
      <DashboardStatsV2 />
      <CVATSUploader />
      <ROICalculator />
      <WebCalculator />
      <KpiRadar />
    </div>
  );
}
