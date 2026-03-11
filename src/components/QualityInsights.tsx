"use client";

import React from "react";
import styles from "./QualityInsights.module.css";

const TAG_COLORS: Record<string, string> = {
    "Very Good": "var(--score-exceptional)",
    "Good": "var(--score-proficient)",
    "Average": "#8B95A1",
    "Weak": "var(--score-developmental)",
    "Very Weak": "var(--score-immediate)",
};

const TAG_ORDER = ["Very Good", "Good", "Average", "Weak", "Very Weak"];

const TAG_DESCRIPTIONS: Record<string, string> = {
    "Very Good": "Perfect or near-perfect execution",
    "Good": "Minor omissions, overall acceptable",
    "Average": "Moderate adherence with recognizable gaps",
    "Weak": "Significant process deviations",
    "Very Weak": "Critical failures requiring immediate action"
};

interface QualityInsightsProps {
    adherenceCounts?: Record<string, number>;
    loading?: boolean;
    onTagClick?: (tag: string) => void;
}

export default function QualityInsights({ adherenceCounts = {}, loading = false, onTagClick }: QualityInsightsProps) {
    const totalSessions = Object.values(adherenceCounts).reduce((a, b) => a + b, 0);

    const data = TAG_ORDER
        .map((tag) => {
            const count = adherenceCounts[tag] ?? 0;
            const percentage = totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0;
            return {
                name: tag,
                value: count,
                percentage,
                color: TAG_COLORS[tag] ?? "#8B95A1",
                description: TAG_DESCRIPTIONS[tag]
            };
        });

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Quality Performance Overview</h3>
                <span className={styles.subtitle}>
                    {loading ? "Calculating distribution..." : totalSessions > 0 ? `Breakdown of ${totalSessions} tagged sessions (Click to view records)` : "No sessions found"}
                </span>
            </div>
            <div className={styles.listContainer}>
                {loading ? (
                    <div className={styles.skeletonWrapper}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={styles.skeletonRow}>
                                <div className={`${styles.skeletonText} skeleton`}></div>
                                <div className={`${styles.skeletonBar} skeleton`}></div>
                            </div>
                        ))}
                    </div>
                ) : totalSessions > 0 ? (
                    data.map((item, index) => (
                        <div 
                            key={index} 
                            className={styles.tagRow} 
                            onClick={() => onTagClick?.(item.name)}
                            title={item.description}
                        >
                            <div className={styles.tagInfo}>
                                <span className={styles.tagName}>
                                    <span className={styles.tagLabel} style={{ backgroundColor: item.color }}></span>
                                    {item.name}
                                </span>
                                <span className={styles.tagStats}>
                                    {item.value} ({item.percentage}%)
                                </span>
                            </div>
                            <div className={styles.barContainer}>
                                <div 
                                    className={styles.barFill} 
                                    style={{ 
                                        width: `${item.percentage}%`, 
                                        backgroundColor: item.color 
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📊</div>
                        <p>No distribution data for this view.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
