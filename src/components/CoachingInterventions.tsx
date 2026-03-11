"use client";

import React from "react";
import styles from "./CoachingInterventions.module.css";
import { Users } from "lucide-react";

interface AgentStat {
    id: string;
    name: string;
    email: string;
    totalSessions: number;
    analyzedSessions: number;
    adherenceCounts: Record<string, number>;
    totalViolations: number;
    avgComplianceRate: number;
}

interface CoachingInterventionsProps {
    agents?: AgentStat[];
    loading?: boolean;
}

export default function CoachingInterventions({ agents = [], loading = false }: CoachingInterventionsProps) {
    // Show agents with analyzed sessions, sorted by worst compliance
    const needsCoaching = agents
        .filter((a) => a.analyzedSessions > 0)
        .sort((a, b) => a.avgComplianceRate - b.avgComplianceRate)
        .slice(0, 5);

    const getComplianceColor = (rate: number) => {
        if (rate >= 80) return "var(--score-proficient)";
        if (rate >= 60) return "var(--score-developmental)";
        return "var(--score-immediate)";
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div>
                    <h3 className={styles.title}>Actionable Coaching Interventions</h3>
                    <span className={styles.subtitle}>Staff members needing immediate role-play training</span>
                </div>
                <div className={styles.iconWrapper}>
                    <Users size={20} className={styles.usersIcon} />
                </div>
            </div>

            <div className={styles.listContainer}>
                <div className={styles.listHeader}>
                    <span>Staff Member</span>
                    <span>Compliance Score</span>
                </div>

                {loading ? (
                    <div className={styles.skeletonList}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className={styles.skeletonItem}>
                                <div className={`${styles.skeletonAvatar} skeleton`}></div>
                                <div className={styles.skeletonInfo}>
                                    <div className={`${styles.skeletonLine} skeleton`} style={{ width: '120px' }}></div>
                                    <div className={`${styles.skeletonLine} skeleton`} style={{ width: '80px', height: '10px' }}></div>
                                </div>
                                <div className={`${styles.skeletonBadge} skeleton`}></div>
                            </div>
                        ))}
                    </div>
                ) : needsCoaching.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🏆</div>
                        <p>No coaching interventions needed at this time.</p>
                    </div>
                ) : (
                    needsCoaching.map((agent) => {
                        const topTag = Object.entries(agent.adherenceCounts)
                            .sort((a, b) => b[1] - a[1])[0];
                        return (
                            <div key={agent.id} className={styles.coachingItem}>
                                <div className={styles.staffMeta}>
                                    <div className={styles.avatar}>{agent.name.charAt(0).toUpperCase()}</div>
                                    <div className={styles.staffInfo}>
                                        <span className={styles.staffName}>{agent.name}</span>
                                        <span className={styles.staffRole}>
                                            {agent.analyzedSessions} sessions • {agent.totalSessions} total
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.issueInfo}>
                                    <span className={styles.issueLabel}>Most Common Tag:</span>
                                    <span className={styles.issueText}>{topTag ? topTag[0] : "—"}</span>
                                </div>

                                <div
                                    className={styles.failureBadge}
                                    style={{ color: getComplianceColor(agent.avgComplianceRate) }}
                                >
                                    {agent.avgComplianceRate}% SOP
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
