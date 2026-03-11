"use client";

import React, { useState } from "react";
import styles from "./GlobalFilter.module.css";
import { MapPin, Calendar, Building2, Filter, RotateCcw } from "lucide-react";

interface GlobalFilterProps {
    selectedScenario?: string;
    setSelectedScenario?: (val: string) => void;
    selectedStaff?: string;
    setSelectedStaff?: (val: string) => void;
    dateRange?: string;
    setDateRange?: (val: string) => void;
    hideStaffFilter?: boolean;
}

export const capitalizeName = (name: string) => {
    if (!name) return "";
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export default function GlobalFilter({
    selectedScenario,
    setSelectedScenario,
    selectedStaff,
    setSelectedStaff,
    dateRange,
    setDateRange,
    hideStaffFilter = false
}: GlobalFilterProps) {
    const [scenarios, setScenarios] = React.useState<any[]>([]);
    const [staffList, setStaffList] = React.useState<any[]>([]);

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
                    setStaffList(data.agents || []);
                }
            } catch (err) {
                console.error("Failed to fetch filters", err);
            }
        };
        fetchFilters();
    }, []);

    const handleReset = () => {
        if (setSelectedScenario) setSelectedScenario("all");
        if (setSelectedStaff) setSelectedStaff("all");
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

            <div className={styles.divider}></div>

            <div className={styles.filterGroup}>
                <Filter className={styles.icon} size={18} />
                <select
                    className={styles.select}
                    value={selectedScenario}
                    onChange={(e) => setSelectedScenario?.(e.target.value)}
                >
                    <option value="all">All Departments</option>
                    {scenarios.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            {!hideStaffFilter && (
                <>
                    <div className={styles.divider}></div>
                    <div className={styles.filterGroup}>
                        <Building2 className={styles.icon} size={18} />
                        <select
                            className={styles.select}
                            value={selectedStaff}
                            onChange={(e) => setSelectedStaff?.(e.target.value)}
                        >
                            <option value="all">All Staff</option>
                            {staffList.map(a => (
                                <option key={a.id} value={a.id}>{capitalizeName(a.name)}</option>
                            ))}
                        </select>
                    </div>
                </>
            )}

            <button className={styles.resetBtn} onClick={handleReset}>
                <RotateCcw size={16} />
                Reset
            </button>
        </div>
    );
}
