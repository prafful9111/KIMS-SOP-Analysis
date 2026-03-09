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

const scenarioData = [
    { name: "Cash FC", score: 76 },
    { name: "Pre-OP", score: 82 },
    { name: "Room", score: 88 },
    { name: "Discharge", score: 81 },
    { name: "PWO", score: 85 },
];

export default function ScenarioComparison() {
    const getBarColor = (score: number) => {
        if (score >= 90) return "var(--score-exceptional)";
        if (score >= 80) return "var(--score-proficient)";
        if (score >= 70) return "var(--score-developmental)";
        return "var(--score-immediate)";
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h2 className={styles.title}>Scenario Performance Comparison</h2>
                <span className={styles.subtitle}>Average Quality Score across departments</span>
            </div>

            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={scenarioData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                        <XAxis dataKey="name" tick={{ fill: "var(--color-text-secondary)", fontSize: 13 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "var(--color-text-secondary)", fontSize: 13 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip
                            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "var(--shadow-medium)" }}
                            cursor={{ fill: "rgba(0,0,0,0.02)" }}
                            formatter={(value: any) => [`${value}%`, "Avg Score"]}
                        />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                            {scenarioData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
