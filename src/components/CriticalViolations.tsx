"use client";

import React from "react";
import styles from "./CriticalViolations.module.css";
import { AlertCircle } from "lucide-react";

interface Violation {
    id: string;
    scenario: string;
    description: string;
    count: number;
}

const mockViolations: Violation[] = [
    { id: "v1", scenario: "Admission", description: "Failed to confirm Room Tariff & Deposit", count: 14 },
    { id: "v2", scenario: "Discharge", description: "Incorrect Complimentary Meal Timings shared", count: 8 },
    { id: "v3", scenario: "Pre-OP", description: "Missed Mandatory Policies (Attendant / Visiting Hours)", count: 7 },
    { id: "v4", scenario: "Cash FC", description: "Forgot to present Financial Estimate", count: 5 },
    { id: "v5", scenario: "Admission", description: "Did not collect Aadhaar / Insurance Papers", count: 4 },
];

export default function CriticalViolations() {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div>
                    <h3 className={styles.title}>Critical Violations & Red Flags</h3>
                    <span className={styles.subtitle}>Most frequent compliance omissions</span>
                </div>
                <div className={styles.iconWrapper}>
                    <AlertCircle size={20} className={styles.alertIcon} />
                </div>
            </div>

            <div className={styles.listContainer}>
                {mockViolations.map((violation, index) => (
                    <div key={violation.id} className={styles.violationItem}>
                        <span className={styles.rank}>#{index + 1}</span>
                        <div className={styles.descriptionWrapper}>
                            <span className={styles.scenarioTag}>{violation.scenario}</span>
                            <span className={styles.description}>{violation.description}</span>
                        </div>
                        <span className={styles.count}>{violation.count} instances</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
