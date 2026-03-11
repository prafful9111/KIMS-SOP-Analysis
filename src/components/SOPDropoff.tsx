"use client";

import React from "react";
import styles from "./SOPDropoff.module.css";

interface SOPStep {
    step: string;
    completed: number;
    missed: number;
    incorrectlyExecuted: number;
    na: number;
    total: number;
    completionRate: number;
}

interface SOPDropoffProps {
    selectedScenario?: string;
    steps?: SOPStep[];
    loading?: boolean;
}

export default function SOPDropoff({ selectedScenario, steps = [], loading = false }: SOPDropoffProps) {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Granular SOP Execution Status</h3>
                <span className={styles.subtitle}>
                    {selectedScenario === "All Scenarios"
                        ? "Granular execution breakdown across all sessions"
                        : `Step-by-step compliance for ${selectedScenario}`}
                </span>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>SOP Step Description</th>
                            <th className={styles.centerCol}>Completed</th>
                            <th className={styles.centerCol}>Incorrect</th>
                            <th className={styles.centerCol}>Missed</th>
                            <th className={styles.centerCol}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <tr key={i}>
                                    <td>
                                        <div className={styles.skeletonStep}>
                                            <div className={`${styles.skeletonNumber} skeleton`}></div>
                                            <div className={`${styles.skeletonText} skeleton`}></div>
                                        </div>
                                    </td>
                                    <td><div className="skeleton" style={{ height: '24px', borderRadius: '12px' }}></div></td>
                                    <td><div className="skeleton" style={{ height: '24px', borderRadius: '12px' }}></div></td>
                                    <td><div className="skeleton" style={{ height: '24px', borderRadius: '12px' }}></div></td>
                                    <td><div className="skeleton" style={{ height: '20px', width: '24px', margin: '0 auto' }}></div></td>
                                </tr>
                            ))
                        ) : steps.length === 0 ? (
                            <tr>
                                <td colSpan={5}>
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}>📝</div>
                                        <p>No sessions found for the current selection.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            steps.map((item, index) => (
                                <tr key={index} className={styles.tableRow}>
                                    <td>
                                        <div className={styles.stepInfo}>
                                            <span className={styles.stepNumber}>{index + 1}</span>
                                            <span className={styles.stepText}>{item.step}</span>
                                        </div>
                                    </td>
                                    <td className={styles.centerCol}>
                                        <span className={styles.badgeCompleted}>{item.completed}</span>
                                    </td>
                                    <td className={styles.centerCol}>
                                        <span className={styles.badgeIncorrect}>{item.incorrectlyExecuted}</span>
                                    </td>
                                    <td className={styles.centerCol}>
                                        <span className={styles.badgeMissed}>{item.missed}</span>
                                    </td>
                                    <td className={styles.centerCol}>
                                        <span style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>
                                            {item.total - item.na}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
