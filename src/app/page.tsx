"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import Header from "@/components/Header";
import GlobalFilter from "@/components/GlobalFilter";
import KPIGrid from "@/components/KPIGrid";
import ScenarioComparison from "@/components/ScenarioComparison";
import CoachingInterventions from "@/components/CoachingInterventions";
import SOPDropoff from "@/components/SOPDropoff";
import AdherenceDistribution from "@/components/AdherenceDistribution";
import CriticalViolations from "@/components/CriticalViolations";

export default function Dashboard() {
  const [selectedScenario, setSelectedScenario] = useState("All Scenarios");

  return (
    <>
      <Header />
      <main className={styles.container}>
        <GlobalFilter selectedScenario={selectedScenario} setSelectedScenario={setSelectedScenario} />

        <div className={styles.kpiGrid}>
          <KPIGrid />
        </div>

        <div className={styles.chartsGrid}>
          <ScenarioComparison />
          <AdherenceDistribution />
        </div>

        <div className={styles.chartsGrid}>
          <CoachingInterventions />
          <CriticalViolations />
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.bottomRowGrid} style={{ gridTemplateColumns: '1fr' }}>
            <SOPDropoff selectedScenario={selectedScenario} />
          </div>
        </div>
      </main>
    </>
  );
}
