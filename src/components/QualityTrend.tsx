"use client";

import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import styles from "./QualityTrend.module.css";

const trendData = [
    { day: "1", score: 82 },
    { day: "5", score: 84 },
    { day: "10", score: 83 },
    { day: "15", score: 86 },
    { day: "20", score: 88 },
    { day: "25", score: 87 },
    { day: "30", score: 92 },
];

export default function QualityTrend() {
    return (
        <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>30-Day Quality Trend</h2>
            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={trendData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)" }} dy={10} />
                        <YAxis domain={['dataMin - 5', 'dataMax + 5']} axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)" }} />
                        <Tooltip
                            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "var(--shadow-medium)" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="var(--color-primary)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorScore)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
