"use client";

import React from "react";
import styles from "./CoachingInterventions.module.css";
import { Users, ArrowRight } from "lucide-react";

const mockCoaching = [
    { id: "c1", staff: "Sarah Jenkins", role: "Admissions Exec", scenario: "Admission", specificIssue: "Verify Insurance Eligibility", failureRate: "42%" },
    { id: "c2", staff: "Rahul Sharma", role: "FC Executive", scenario: "Cash FC", specificIssue: "Explain Room Tariff & Deposit", failureRate: "35%" },
    { id: "c3", staff: "Anita Desai", role: "Discharge Coord", scenario: "Discharge", specificIssue: "Dis Process Explanation inc TAT", failureRate: "28%" },
    { id: "c4", staff: "Vikram Singh", role: "PWO", scenario: "PWO", specificIssue: "Record grievance in portal", failureRate: "25%" }
];

export default function CoachingInterventions() {
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
                    <span>Specific Critical Step Failed</span>
                </div>
                {mockCoaching.map((item) => (
                    <div key={item.id} className={styles.coachingItem}>
                        <div className={styles.staffMeta}>
                            <div className={styles.avatar}>{item.staff.charAt(0)}</div>
                            <div className={styles.staffInfo}>
                                <span className={styles.staffName}>{item.staff}</span>
                                <span className={styles.staffRole}>{item.role} • {item.scenario}</span>
                            </div>
                        </div>

                        <div className={styles.issueInfo}>
                            <span className={styles.issueLabel}>Needs Coaching For:</span>
                            <span className={styles.issueText}>{item.specificIssue}</span>
                        </div>
                        <div className={styles.failureBadge}>
                            {item.failureRate} Failed
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
