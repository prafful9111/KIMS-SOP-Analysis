"use client";

import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import styles from "./SessionListModal.module.css";
import { capitalizeName } from "./GlobalFilter";

interface SessionData {
    id: string;
    agent_name: string;
    scenario_name: string;
    created_at: string;
    adherence_tag?: string;
    red_flags_count: number;
    duration?: string;
}

export type ModalFilterType = "positive" | "critical" | "tag" | "violation" | null;

interface SessionListModalProps {
    isOpen: boolean;
    onClose: () => void;
    filterType: ModalFilterType;
    filterValue?: string;
    selectedScenario: string;
    selectedStaff: string;
    dateRange: string;
}

export default function SessionListModal({
    isOpen,
    onClose,
    filterType,
    filterValue,
    selectedScenario,
    selectedStaff,
    dateRange
}: SessionListModalProps) {
    const [calls, setCalls] = useState<SessionData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const fetchSessions = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (selectedScenario && selectedScenario !== "all" && selectedScenario !== "All Departments") {
                    params.append('scenario', selectedScenario);
                }
                if (selectedStaff && selectedStaff !== "all") {
                    params.append('agent', selectedStaff);
                }
                params.append('dateRange', dateRange);
                params.append('limit', '100'); // Fetch more to allow client-side filtering

                const res = await fetch(`/api/dashboard/sessions?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    let sessions: SessionData[] = data.sessions || [];

                    // Apply client-side filters
                    if (filterType === "positive") {
                        sessions = sessions.filter(s => s.adherence_tag === "Good" || s.adherence_tag === "Very Good");
                    } else if (filterType === "critical") {
                        sessions = sessions.filter(s => s.red_flags_count > 0);
                    } else if (filterType === "tag" && filterValue) {
                        sessions = sessions.filter(s => s.adherence_tag === filterValue);
                    } else if (filterType === "violation" && filterValue) {
                        // @ts-ignore - Assuming red_flags exists on the session object from API
                        sessions = sessions.filter(s => s.red_flags?.includes(filterValue));
                    }

                    setCalls(sessions);
                }
            } catch (error) {
                console.error("Failed to fetch sessions for modal", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [isOpen, filterType, filterValue, selectedScenario, selectedStaff, dateRange]);

    if (!isOpen) return null;

    const getTagClass = (tag?: string) => {
        switch (tag) {
            case "Exceptional": return styles.tagExceptional;
            case "Very Good":
            case "Proficient":
            case "Good": return styles.tagProficient;
            case "Average": return styles.tagAverage;
            case "Developmental":
            case "Weak": return styles.tagWeak;
            case "Immediate Action":
            case "Very Weak": return styles.tagImmediate;
            default: return "";
        }
    };

    let title = "Sessions List";
    if (filterType === "positive") title = "Sessions with Positive Adherence";
    if (filterType === "critical") title = "Sessions with Critical Alerts";
    if (filterType === "tag") title = `Sessions Tagged: ${filterValue}`;
    if (filterType === "violation") title = `Sessions with Violation: ${filterValue}`;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{title}</h3>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>
                <div className={styles.modalBody}>
                    {loading ? (
                        <div className={styles.loadingWrapper}>Loading sessions...</div>
                    ) : calls.length > 0 ? (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Call ID</th>
                                    <th>Date & Time</th>
                                    <th>Staff Name</th>
                                    <th>Department</th>
                                    <th>Adherence Tag</th>
                                    <th>Red Flags</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calls.map(call => (
                                    <tr key={call.id} className={styles.tableRow}>
                                        <td className={styles.callId}>{call.id.substring(0, 8)}</td>
                                        <td>{new Date(call.created_at).toLocaleString()}</td>
                                        <td className={styles.agentName}>{capitalizeName(call.agent_name)}</td>
                                        <td>{call.scenario_name}</td>
                                        <td>
                                            <span className={`${styles.qualityTag} ${getTagClass(call.adherence_tag)}`}>
                                                {call.adherence_tag || "Unknown"}
                                            </span>
                                        </td>
                                        <td>
                                            {call.red_flags_count > 0 ? (
                                                <div className={styles.flagWarning}>
                                                    <AlertCircle size={14} />
                                                    <span>{call.red_flags_count}</span>
                                                </div>
                                            ) : (
                                                <span className={styles.flagClean}>None</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.emptyState}>No matching sessions found for current filters.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
