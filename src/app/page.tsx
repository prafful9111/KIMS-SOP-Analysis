"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import Header from "@/components/Header";
import GlobalFilter from "@/components/GlobalFilter";
import KPIGrid from "@/components/KPIGrid";
import ScenarioComparison from "@/components/ScenarioComparison";
import CoachingInterventions from "@/components/CoachingInterventions";
import SOPDropoff from "@/components/SOPDropoff";
import QualityInsights from "@/components/QualityInsights";
import CriticalViolations from "@/components/CriticalViolations";
import SessionListModal, { ModalFilterType } from "@/components/SessionListModal";

export default function Dashboard() {
  const [selectedScenario, setSelectedScenario] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState("all");
  const [dateRange, setDateRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [scenarioComparison, setScenarioComparison] = useState<any[]>([]);
  const [sopDropoff, setSopDropoff] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  // Modal State
  const [modalFilter, setModalFilter] = useState<{ type: ModalFilterType; value?: string }>({ type: null });

  // Cache to store API responses keyed by filter params
  const cacheRef = React.useRef<Record<string, any>>({});

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      const cacheKey = `${selectedScenario}-${selectedStaff}-${dateRange}`;

      // Serve from cache if available
      if (cacheRef.current[cacheKey]) {
        const cached = cacheRef.current[cacheKey];
        setDashboardData(cached.stats);
        setScenarioComparison(cached.scenarios);
        setSopDropoff(cached.dropoff);
        setAgents(cached.agents);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          scenario: selectedScenario,
          agent: selectedStaff,
          dateRange: dateRange
        }).toString();

        const [statsRes, scenarioRes, dropoffRes, agentsRes] = await Promise.all([
          fetch(`/api/dashboard/stats?${queryParams}`, { signal: abortController.signal }),
          fetch(`/api/dashboard/scenario-comparison?${queryParams}`, { signal: abortController.signal }),
          fetch(`/api/dashboard/sop-dropoff?${queryParams}`, { signal: abortController.signal }),
          fetch(`/api/dashboard/agents?${queryParams}`, { signal: abortController.signal })
        ]);

        if (!statsRes.ok || !scenarioRes.ok || !dropoffRes.ok || !agentsRes.ok) {
          throw new Error("One or more requests failed");
        }

        const [stats, scenariosData, dropoffData, agentsData] = await Promise.all([
          statsRes.json(),
          scenarioRes.json(),
          dropoffRes.json(),
          agentsRes.json()
        ]);

        const scenarios = scenariosData.scenarios || [];
        const dropoff = dropoffData.steps || [];
        const agentsSorted = agentsData.agents || [];

        // Update state
        setDashboardData(stats);
        setScenarioComparison(scenarios);
        setSopDropoff(dropoff);
        setAgents(agentsSorted);

        // Store in cache
        cacheRef.current[cacheKey] = {
          stats,
          scenarios,
          dropoff,
          agents: agentsSorted
        };
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        console.error("Failed to fetch dashboard data", error);
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => abortController.abort();
  }, [selectedScenario, selectedStaff, dateRange]);

  return (
    <>
      <Header />
      <main className={styles.container}>
        <GlobalFilter
          selectedScenario={selectedScenario}
          setSelectedScenario={setSelectedScenario}
          selectedStaff={selectedStaff}
          setSelectedStaff={setSelectedStaff}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        <div className={styles.kpiGrid}>
          <KPIGrid
            totalSessions={dashboardData?.totalSessions}
            analyzedSessions={dashboardData?.analyzedSessions}
            sessionTrend={dashboardData?.sessionTrend}
            sopComplianceRate={dashboardData?.sopComplianceRate}
            totalCriticalViolations={dashboardData?.totalCriticalViolations}
            adherenceCounts={dashboardData?.adherenceCounts}
            loading={loading}
            onPositiveAdherenceClick={() => setModalFilter({ type: "positive" })}
            onCriticalAlertsClick={() => setModalFilter({ type: "critical" })}
          />
        </div>

        <div className={styles.chartsGrid}>
          <ScenarioComparison scenarios={scenarioComparison} loading={loading} />
          <QualityInsights 
            adherenceCounts={dashboardData?.adherenceCounts} 
            loading={loading} 
            onTagClick={(tag) => setModalFilter({ type: "tag", value: tag })}
          />
        </div>

        <div className={styles.fullWidthRow}>
          <CriticalViolations
            topViolations={dashboardData?.topViolations}
            loading={loading}
            selectedScenarioName={scenarioComparison.find(s => s.id === selectedScenario)?.name || "All Departments"}
            onViolationClick={(violation) => setModalFilter({ type: "violation", value: violation })}
          />
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.bottomRowGrid} style={{ gridTemplateColumns: '1fr' }}>
            <SOPDropoff
              selectedScenario={scenarioComparison.find(s => s.id === selectedScenario)?.name || "All Departments"}
              steps={sopDropoff}
              loading={loading}
            />
          </div>
        </div>
      </main>

      <SessionListModal
        isOpen={modalFilter.type !== null}
        onClose={() => setModalFilter({ type: null })}
        filterType={modalFilter.type}
        filterValue={modalFilter.value}
        selectedScenario={selectedScenario}
        selectedStaff={selectedStaff}
        dateRange={dateRange}
      />
    </>
  );
}
