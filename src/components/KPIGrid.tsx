import React from "react";
import styles from "./KPIGrid.module.css";
import { FileText, Activity, CheckCircle, AlertOctagon, TrendingUp, TrendingDown, Info } from "lucide-react";

interface TrendData {
    percentage: number;
    label: string;
    isPositive: boolean;
}

interface KPIGridProps {
    totalSessions?: number;
    analyzedSessions?: number;
    sessionTrend?: TrendData;
    sopComplianceRate?: number;
    totalCriticalViolations?: number;
    adherenceCounts?: Record<string, number>;
    loading?: boolean;
    onPositiveAdherenceClick?: () => void;
    onCriticalAlertsClick?: () => void;
}

export default function KPIGrid({
    totalSessions = 0,
    analyzedSessions = 0,
    sessionTrend = { percentage: 12, label: "vs last month", isPositive: true },
    sopComplianceRate = 0,
    totalCriticalViolations = 0,
    adherenceCounts = {},
    loading = false,
    onPositiveAdherenceClick,
    onCriticalAlertsClick,
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

    const TrendIndicator = ({ trend, value }: { trend?: TrendData; value?: number }) => {
        if (!trend) return null;
        return (
            <div className={styles.trend}>
                {trend.isPositive ? (
                    <TrendingUp size={14} className={styles.trendPositive} />
                ) : (
                    <TrendingDown size={14} className={styles.trendNegative} />
                )}
                <span className={trend.isPositive ? styles.trendPositive : styles.trendNegative}>
                    {trend.isPositive ? '+' : ''}{trend.percentage}%
                </span>
                <span className={styles.trendLabel}>{trend.label}</span>
            </div>
        );
    };

    return (
        <div style={{ display: "contents" }}>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.titleWrapper}>
                        <span className={styles.cardTitle}>Total Sessions Analyzed</span>
                        <div className={styles.infoIconWrapper}>
                            <Info size={14} className={styles.infoIcon} />
                            <div className={styles.tooltipText}>Total depth of analysis across selected departments.</div>
                        </div>
                    </div>
                    <div className={styles.iconWrapper}>
                        <FileText size={20} />
                    </div>
                </div>
                <div className={styles.cardValue}>
                    {analyzedSessions.toLocaleString()}
                </div>
                <TrendIndicator trend={sessionTrend} />
            </div>

            <div 
                className={`${styles.card} ${onPositiveAdherenceClick ? styles.clickableCard : ''}`}
                onClick={onPositiveAdherenceClick}
            >
                <div className={styles.cardHeader}>
                    <div className={styles.titleWrapper}>
                        <span className={styles.cardTitle}>Positive Adherence Rate</span>
                        <div className={styles.infoIconWrapper}>
                            <Info size={14} className={styles.infoIcon} />
                            <div className={styles.tooltipText}>Staff exhibiting professional courtesy and empathy. (Good + Very Good sessions / Total)</div>
                        </div>
                    </div>
                    <div className={styles.iconWrapper}>
                        <Activity size={20} />
                    </div>
                </div>
                <div className={styles.cardValue}>
                    {positiveRate}<span style={{ fontSize: "20px", color: "var(--color-text-secondary)" }}>%</span>
                </div>
                <div className={styles.trend}>
                    <span style={{ color: "var(--color-text-secondary)", fontSize: "11px" }}>Quality Trend</span>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.titleWrapper}>
                        <span className={styles.cardTitle}>SOP Compliance Rate</span>
                        <div className={styles.infoIconWrapper}>
                            <Info size={14} className={styles.infoIcon} />
                            <div className={styles.tooltipText}>Percentage of mandatory steps followed correctly as per SOP.</div>
                        </div>
                    </div>
                    <div className={styles.iconWrapper}>
                        <CheckCircle size={20} />
                    </div>
                </div>
                <div className={styles.cardValue}>
                    {sopComplianceRate}%
                </div>
                <div className={styles.trend}>
                    <TrendingUp size={14} className={styles.trendPositive} />
                    <span className={styles.trendPositive}>Stable</span>
                </div>
            </div>

            <div 
                className={`${styles.card} ${onCriticalAlertsClick ? styles.clickableCard : ''}`}
                onClick={onCriticalAlertsClick}
            >
                <div className={styles.cardHeader}>
                    <div className={styles.titleWrapper}>
                        <span className={styles.cardTitle}>Critical Alerts</span>
                        <div className={styles.infoIconWrapper}>
                            <Info size={14} className={styles.infoIcon} />
                            <div className={styles.tooltipText}>Total high-priority violations detected in staff interactions.</div>
                        </div>
                    </div>
                    <div className={`${styles.iconWrapper} ${styles.alert}`}>
                        <AlertOctagon size={20} />
                    </div>
                </div>
                <div className={`${styles.cardValue} ${styles.alert}`}>{totalCriticalViolations}</div>
                <div className={styles.trend}>
                    <span className={styles.trendNegative}>Attention Required</span>
                </div>
            </div>
        </div>
    );
}
