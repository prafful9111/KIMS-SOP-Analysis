"use client";

import React from "react";
import styles from "./AdherenceDistribution.module.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const TAG_COLORS: Record<string, string> = {
    "Very Good": "var(--score-exceptional)",
    "Good": "var(--score-proficient)",
    "Average": "#8B95A1",
    "Weak": "var(--score-developmental)",
    "Very Weak": "var(--score-immediate)",
};

const TAG_ORDER = ["Very Good", "Good", "Average", "Weak", "Very Weak"];

interface AdherenceDistributionProps {
    adherenceCounts?: Record<string, number>;
    loading?: boolean;
}

export default function AdherenceDistribution({ adherenceCounts = {}, loading = false }: AdherenceDistributionProps) {
    const data = TAG_ORDER
        .filter((tag) => (adherenceCounts[tag] ?? 0) > 0)
        .map((tag) => ({
            name: tag,
            value: adherenceCounts[tag] ?? 0,
            color: TAG_COLORS[tag] ?? "#8B95A1",
        }));

    // Fall back to "No data yet" slice if empty
    const chartData = data.length > 0 ? data : [{ name: "No data yet", value: 1, color: "var(--color-border)" }];

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Adherence Tag Distribution</h3>
                <span className={styles.subtitle}>
                    {loading ? "Calculating distribution..." : data.length > 0 ? `${Object.values(adherenceCounts).reduce((a, b) => a + b, 0)} total sessions` : "No sessions found"}
                </span>
            </div>
            <div className={styles.chartContainer}>
                {loading ? (
                    <div className={styles.skeletonWrapper}>
                        <div className={`${styles.skeletonCircle} skeleton`}></div>
                        <div className={styles.skeletonLegend}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className={styles.skeletonLegendItem}>
                                    <div className={`${styles.skeletonDot} skeleton`}></div>
                                    <div className={`${styles.skeletonLine} skeleton`}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "var(--shadow-medium)" }}
                                formatter={(value: any, name: any) => [`${value} sessions`, String(name)]}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🥧</div>
                        <p>No distribution data for this view.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
