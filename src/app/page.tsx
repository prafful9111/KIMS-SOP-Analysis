"use client";

import React, { useState, useEffect } from "react";
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
  const [selectedScenario, setSelectedScenario] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [dateRange, setDateRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [scenarioComparison, setScenarioComparison] = useState<any[]>([]);
  const [sopDropoff, setSopDropoff] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          scenario: selectedScenario,
          agent: selectedAgent,
          dateRange: dateRange
        }).toString();

        const [statsRes, scenarioRes, dropoffRes, agentsRes] = await Promise.all([
          fetch(`/api/dashboard/stats?${queryParams}`),
          fetch(`/api/dashboard/scenario-comparison?${queryParams}`),
          fetch(`/api/dashboard/sop-dropoff?${queryParams}`),
          fetch(`/api/dashboard/agents?${queryParams}`)
        ]);

        if (statsRes.ok) setDashboardData(await statsRes.json());
        if (scenarioRes.ok) {
          const data = await scenarioRes.json();
          setScenarioComparison(data.scenarios || []);
        }
        if (dropoffRes.ok) {
          const data = await dropoffRes.json();
          setSopDropoff(data.steps || []);
        }
        if (agentsRes.ok) {
          const data = await agentsRes.json();
          setAgents(data.agents || []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedScenario, selectedAgent, dateRange]);

  return (
    <>
      <Header />
      <main className={styles.container}>
        <GlobalFilter
          selectedScenario={selectedScenario}
          setSelectedScenario={setSelectedScenario}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        <div className={styles.kpiGrid}>
          <KPIGrid
            totalSessions={dashboardData?.totalSessions}
            analyzedSessions={dashboardData?.analyzedSessions}
            sopComplianceRate={dashboardData?.sopComplianceRate}
            totalCriticalViolations={dashboardData?.totalCriticalViolations}
            adherenceCounts={dashboardData?.adherenceCounts}
            loading={loading}
          />
        </div>

        <div className={styles.chartsGrid}>
          <ScenarioComparison scenarios={scenarioComparison} loading={loading} />
          <AdherenceDistribution adherenceCounts={dashboardData?.adherenceCounts} loading={loading} />
        </div>

        <div className={styles.fullWidthRow}>
          <CriticalViolations
            topViolations={dashboardData?.topViolations}
            loading={loading}
            selectedScenarioName={scenarioComparison.find(s => s.id === selectedScenario)?.name || "All Scenarios"}
          />
        </div>

        <div className={styles.fullWidthRow}>
          <CoachingInterventions agents={agents} loading={loading} />
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.bottomRowGrid} style={{ gridTemplateColumns: '1fr' }}>
            <SOPDropoff
              selectedScenario={scenarioComparison.find(s => s.id === selectedScenario)?.name || "All Scenarios"}
              steps={sopDropoff}
              loading={loading}
            />
          </div>
        </div>
      </main>
    </>
  );
}
