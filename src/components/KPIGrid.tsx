import React from "react";
import styles from "./KPIGrid.module.css";
import { FileText, Activity, CheckCircle, AlertOctagon, TrendingUp, TrendingDown } from "lucide-react";

interface KPIGridProps {
    totalSessions?: number;
    analyzedSessions?: number;
    sessionTrend?: {
        percentage: number;
        label: string;
        isPositive: boolean;
        value: number;
    };
    sopComplianceRate?: number;
    totalCriticalViolations?: number;
    adherenceCounts?: Record<string, number>;
    loading?: boolean;
}

export default function KPIGrid({
    totalSessions = 0,
    analyzedSessions = 0,
    sessionTrend,
    sopComplianceRate = 0,
    totalCriticalViolations = 0,
    adherenceCounts = {},
    loading = false,
}: KPIGridProps) {
    const goodOrBetter = (adherenceCounts["Very Good"] ?? 0) + (adherenceCounts["Good"] ?? 0);
    const totalTagged = Object.values(adherenceCounts).reduce((a, b) => a + b, 0);
    const positiveRate = totalTagged > 0 ? Math.round((goodOrBetter / totalTagged) * 100) : 0;

    if (loading) {
        return (
            <div style={{ display: "contents" }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`${styles.card} ${styles.loadingCard}`}>
                        <div className={styles.cardHeader}>
                            <div className={`${styles.skeletonTitle} skeleton`}></div>
                            <div className={`${styles.skeletonIcon} skeleton`}></div>
                        </div>
                        <div className={`${styles.skeletonValue} skeleton`}></div>
                        <div className={`${styles.skeletonTrend} skeleton`}></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div style={{ display: "contents" }}>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>Total Sessions Analyzed</span>
                    <div className={styles.iconWrapper}>
                        <FileText size={20} />
                    </div>
                </div>
                <div className={styles.cardValue}>{analyzedSessions.toLocaleString()}</div>
                <div className={styles.trend}>
                    {sessionTrend ? (
                        <>
                            {sessionTrend.isPositive ? (
                                <TrendingUp size={16} className={styles.trendPositive} />
                            ) : (
                                <TrendingDown size={16} className={styles.trendNegative} />
                            )}
                            <span className={sessionTrend.isPositive ? styles.trendPositive : styles.trendNegative} style={{ marginRight: '6px' }}>
                                {sessionTrend.isPositive ? '+' : ''}{sessionTrend.percentage}%
                            </span>
                            <span style={{ color: "var(--color-text-secondary)" }}>
                                {sessionTrend.label}
                            </span>
                        </>
                    ) : (
                        <span style={{ color: "var(--color-text-secondary)" }}>
                            Analyzing trends...
                        </span>
                    )}
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>Positive Adherence Rate</span>
                    <div className={styles.iconWrapper}>
                        <Activity size={20} />
                    </div>
                </div>
                <div className={styles.cardValue}>
                    {positiveRate}<span style={{ fontSize: "20px", color: "var(--color-text-secondary)" }}>%</span>
                </div>
                <div className={styles.trend}>
                    {positiveRate >= 50 ? (
                        <TrendingUp size={16} className={styles.trendPositive} />
                    ) : (
                        <TrendingDown size={16} className={styles.trendNegative} />
                    )}
                    <span className={positiveRate >= 50 ? styles.trendPositive : styles.trendNegative}>
                        Good + Very Good sessions
                    </span>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>SOP Compliance Rate</span>
                    <div className={styles.iconWrapper}>
                        <CheckCircle size={20} />
                    </div>
                </div>
                <div className={styles.cardValue}>{sopComplianceRate}%</div>
                <div className={styles.trend}>
                    {sopComplianceRate >= 70 ? (
                        <TrendingUp size={16} className={styles.trendPositive} />
                    ) : (
                        <TrendingDown size={16} className={styles.trendNegative} />
                    )}
                    <span className={sopComplianceRate >= 70 ? styles.trendPositive : styles.trendNegative}>
                        Steps completed correctly
                    </span>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>Critical Alerts</span>
                    <div className={`${styles.iconWrapper} ${styles.alert}`}>
                        <AlertOctagon size={20} />
                    </div>
                </div>
                <div className={`${styles.cardValue} ${styles.alert}`}>{totalCriticalViolations}</div>
                <div className={styles.trend}>
                    <span className={styles.trendNegative}>Violations across all sessions</span>
                </div>
            </div>
        </div>
    );
}
