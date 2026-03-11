"use client";

import React from "react";
import styles from "./CriticalViolations.module.css";
import { AlertCircle } from "lucide-react";
import { capitalizeName } from "./GlobalFilter";

interface AgentMetric {
    name: string;
    count: number;
}

interface ViolationEntry {
    violation: string;
    count: number;
    topAgents: AgentMetric[];
}

interface CriticalViolationsProps {
    topViolations?: ViolationEntry[];
    loading?: boolean;
    selectedScenarioName?: string;
    onViolationClick?: (violation: string) => void;
}

export default function CriticalViolations({
    topViolations = [],
    loading = false,
    selectedScenarioName = "All Departments",
    onViolationClick
}: CriticalViolationsProps) {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div>
                    <h3 className={styles.title}>Critical Violations & Red Flags</h3>
                    <span className={styles.subtitle}>
                        {selectedScenarioName === "All Departments"
                            ? "Compliance omissions across all monitored sessions"
                            : `Omissions specifically for ${selectedScenarioName}`}
                    </span>
                </div>
                <div className={styles.iconWrapper}>
                    <AlertCircle size={20} className={styles.alertIcon} />
                </div>
            </div>

            <div className={styles.listContainer}>
                {loading ? (
                    <div className={styles.skeletonList}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={styles.skeletonItem}>
                                <div className={`${styles.skeletonRank} skeleton`}></div>
                                <div className={`${styles.skeletonText} skeleton`}></div>
                            </div>
                        ))}
                    </div>
                ) : topViolations.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>✨</div>
                        <p>No violations recorded — great job!</p>
                    </div>
                ) : (
                    <div className={styles.gridContainer}>
                        {topViolations.map((v, index) => (
                            <div 
                                key={index} 
                                className={styles.violationCard}
                                onClick={() => onViolationClick?.(v.violation)}
                            >
                                <div className={styles.violationMain}>
                                    <span className={styles.rankBadge}>#{index + 1}</span>
                                    <div className={styles.violationContent}>
                                        <div className={styles.descriptionRow}>
                                            <span className={styles.description}>{v.violation}</span>
                                            <span className={styles.occurrenceCount}>{v.count} {v.count === 1 ? "instance" : "instances"}</span>
                                        </div>

                                        <div className={styles.agentBreakdown}>
                                            <span className={styles.breakdownLabel}>Affected Staff:</span>
                                            <div className={styles.agentList}>
                                                {v.topAgents.map((agent, i) => (
                                                    <div key={i} className={styles.agentTag}>
                                                        <span className={styles.agentName}>{capitalizeName(agent.name)}</span>
                                                        <span className={styles.agentCount}>{agent.count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
