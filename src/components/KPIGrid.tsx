import React from "react";
import styles from "./KPIGrid.module.css";
import { FileText, Activity, CheckCircle, AlertOctagon, TrendingUp } from "lucide-react";

export default function KPIGrid() {
    return (
        <div style={{ display: "contents" }}>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>Calls Analyzed</span>
                    <div className={styles.iconWrapper}>
                        <FileText size={20} />
                    </div>
                </div>
                <div className={styles.cardValue}>1,245</div>
                <div className={styles.trend}>
                    <TrendingUp size={16} className={styles.trendPositive} />
                    <span className={styles.trendPositive}>+5%</span> from last month
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>Average Quality Score</span>
                    <div className={styles.iconWrapper}>
                        <Activity size={20} />
                    </div>
                </div>
                <div className={styles.cardValue}>88<span style={{ fontSize: "20px", color: "var(--color-text-secondary)" }}>/100</span></div>
                <div className={styles.trend}>
                    <TrendingUp size={16} className={styles.trendPositive} />
                    <span className={styles.trendPositive}>+2%</span> from last month
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>SOP Compliance Rate</span>
                    <div className={styles.iconWrapper}>
                        <CheckCircle size={20} />
                    </div>
                </div>
                <div className={styles.cardValue}>92%</div>
                <div className={styles.trend}>
                    <TrendingUp size={16} className={styles.trendPositive} />
                    <span className={styles.trendPositive}>+1%</span> from last month
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>Critical Alerts</span>
                    <div className={`${styles.iconWrapper} ${styles.alert}`}>
                        <AlertOctagon size={20} />
                    </div>
                </div>
                <div className={`${styles.cardValue} ${styles.alert}`}>12</div>
                <div className={styles.trend}>
                    <span className={styles.trendNegative}>Immediate Interventions</span>
                </div>
            </div>
        </div>
    );
}
