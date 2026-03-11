"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import styles from "./ScenarioComparison.module.css";

interface ScenarioStat {
    id: string;
    name: string;
    totalSessions: number;
    sopComplianceRate: number;
    adherenceCounts: Record<string, number>;
}

interface ScenarioComparisonProps {
    scenarios?: ScenarioStat[];
    loading?: boolean;
}

function SkeletonBar() {
    const [height, setHeight] = React.useState("60%");
    React.useEffect(() => {
        setHeight(`${Math.random() * 60 + 20}%`);
    }, []);
    return <div className={`${styles.skeletonBar} skeleton`} style={{ height }}></div>;
}

export default function ScenarioComparison({ scenarios = [], loading = false }: ScenarioComparisonProps) {
    const getBarColor = (score: number) => {
        if (score >= 90) return "var(--score-exceptional)";
        if (score >= 70) return "var(--score-proficient)";
        if (score >= 50) return "var(--score-developmental)";
        return "var(--score-immediate)";
    };

    const chartData = scenarios.map((s) => ({
        name: s.name.length > 12 ? s.name.substring(0, 12) + "…" : s.name,
        fullName: s.name,
        score: s.sopComplianceRate,
        sessions: s.totalSessions,
    }));

    // Fallback if no data
    const displayData = chartData.length > 0 ? chartData : [
        { name: "No data", fullName: "No data yet", score: 0, sessions: 0 }
    ];

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h2 className={styles.title}>Departments Performance Comparison</h2>
                <span className={styles.subtitle}>
                    {loading ? "Loading metrics..." : chartData.length > 0 ? "SOP compliance rate by department" : "No call data available for the selected filters"}
                </span>
            </div>

            <div className={`${styles.chartContainer} ${loading ? styles.loading : ""}`}>
                {loading ? (
                    <div className={styles.skeletonContainer}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={styles.skeletonBarWrapper}>
                                <SkeletonBar />
                                <div className={`${styles.skeletonLabel} skeleton`}></div>
                            </div>
                        ))}
                    </div>
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={displayData}
                            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis dataKey="name" tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "var(--color-text-secondary)", fontSize: 13 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "var(--shadow-medium)" }}
                                cursor={{ fill: "rgba(0,0,0,0.02)" }}
                                formatter={(value: any, _name: any, props: any) => [
                                    `${value}% compliance (${props?.payload?.sessions ?? 0} sessions)`,
                                    "SOP Score"
                                ]}
                                labelFormatter={(_label: any, payload: any) =>
                                    payload?.[0]?.payload?.fullName ?? _label
                                }
                            />
                            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                {displayData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📊</div>
                        <p>No recording data found for this selection.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
