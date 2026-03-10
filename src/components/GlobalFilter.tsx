"use client";

import React, { useState } from "react";
import styles from "./GlobalFilter.module.css";
import { MapPin, Calendar, Building2, Filter, RotateCcw } from "lucide-react";

interface GlobalFilterProps {
    selectedScenario?: string;
    setSelectedScenario?: (val: string) => void;
    selectedAgent?: string;
    setSelectedAgent?: (val: string) => void;
    dateRange?: string;
    setDateRange?: (val: string) => void;
}

export default function GlobalFilter({
    selectedScenario,
    setSelectedScenario,
    selectedAgent,
    setSelectedAgent,
    dateRange,
    setDateRange
}: GlobalFilterProps) {
    const [scenarios, setScenarios] = React.useState<any[]>([]);
    const [agents, setAgents] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [scenariosRes, agentsRes] = await Promise.all([
                    fetch('/api/dashboard/scenarios'),
                    fetch('/api/dashboard/agents')
                ]);

                if (scenariosRes.ok) {
                    const data = await scenariosRes.json();
                    setScenarios(data.scenarios || []);
                }
                if (agentsRes.ok) {
                    const data = await agentsRes.json();
                    setAgents(data.agents || []);
                }
            } catch (err) {
                console.error("Failed to fetch filters", err);
            }
        };
        fetchFilters();
    }, []);

    const handleReset = () => {
        if (setSelectedScenario) setSelectedScenario("all");
        if (setSelectedAgent) setSelectedAgent("all");
        if (setDateRange) setDateRange("30d");
    };

    const dateOptions = [
        { label: "Today", value: "1d" },
        { label: "Yesterday", value: "yesterday" },
        { label: "Last 7 Days", value: "7d" },
        { label: "Last 30 Days", value: "30d" },
        { label: "All Time", value: "all" },
    ];

    return (
        <div className={styles.filterContainer}>
            <div className={styles.filterGroup}>
                <Calendar className={styles.icon} size={18} />
                <select
                    className={styles.select}
                    value={dateRange}
                    onChange={(e) => setDateRange?.(e.target.value)}
                >
                    {dateOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                    <option value="Custom Range">Custom Range...</option>
                </select>
            </div>

            {dateRange === "Custom Range" && (
                <>
                    <div className={styles.divider}></div>
                    <div className={styles.filterGroup}>
                        <span className={styles.label}>Start Date:</span>
                        <input type="date" className={styles.dateInput} />
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.filterGroup}>
                        <span className={styles.label}>End Date:</span>
                        <input type="date" className={styles.dateInput} />
                    </div>
                </>
            )}

            <div className={styles.divider}></div>

            <div className={styles.filterGroup}>
                <Filter className={styles.icon} size={18} />
                <select
                    className={styles.select}
                    value={selectedScenario}
                    onChange={(e) => setSelectedScenario?.(e.target.value)}
                >
                    <option value="all">All Scenarios</option>
                    {scenarios.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.filterGroup}>
                <Building2 className={styles.icon} size={18} />
                <select
                    className={styles.select}
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent?.(e.target.value)}
                >
                    <option value="all">All Agents</option>
                    {agents.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.divider}></div>

            <button className={styles.resetBtn} onClick={handleReset}>
                <RotateCcw size={16} />
                Reset Filters
            </button>
        </div>
    );
}
