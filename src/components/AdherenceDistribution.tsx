"use client";

import React from "react";
import styles from "./AdherenceDistribution.module.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const mockDistribution = [
    { name: "Very Good", value: 35, color: "var(--score-exceptional)" },
    { name: "Good", value: 45, color: "var(--score-proficient)" },
    { name: "Average", value: 15, color: "#8B95A1" }, // Neutral greyish for average
    { name: "Weak", value: 3, color: "var(--score-developmental)" },
    { name: "Very Weak", value: 2, color: "var(--score-immediate)" },
];

export default function AdherenceDistribution() {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Adherence Tag Distribution</h3>
                <span className={styles.subtitle}>Overall QA Ratings</span>
            </div>
            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={mockDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {mockDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "var(--shadow-medium)" }}
                            formatter={(value: any) => [`${value}%`, "Calls"]}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
