"use client";

import React, { useState, useEffect } from "react";
import { Search, AlertCircle, FileText, X } from "lucide-react";
import styles from "./AllCallsTable.module.css";

interface SessionData {
    id: string;
    agent_name: string;
    scenario_name: string;
    created_at: string;
    adherence_tag?: string;
    red_flags_count: number;
    red_flags: string[];
    summary: string;
    duration?: string;
    transcript?: string;
}

interface AllCallsTableProps {
    selectedScenario?: string;
    selectedAgent?: string;
    dateRange?: string;
}

export default function AllCallsTable({
    selectedScenario,
    selectedAgent,
    dateRange = "all"
}: AllCallsTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [calls, setCalls] = useState<SessionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCall, setSelectedCall] = useState<SessionData | null>(null);

    // Cache for session data
    const cacheRef = React.useRef<Record<string, SessionData[]>>({});

    useEffect(() => {
        const abortController = new AbortController();

        const fetchSessions = async () => {
            const cacheKey = `${selectedScenario}-${selectedAgent}-${dateRange}`;

            // Return cached data if available
            if (cacheRef.current[cacheKey]) {
                setCalls(cacheRef.current[cacheKey]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (selectedScenario && selectedScenario !== "all" && selectedScenario !== "All Scenarios") {
                    params.append('scenario', selectedScenario);
                }
                if (selectedAgent && selectedAgent !== "all") {
                    params.append('agent', selectedAgent);
                }
                params.append('dateRange', dateRange);

                const res = await fetch(`/api/dashboard/sessions?${params.toString()}`, {
                    signal: abortController.signal
                });

                if (res.ok) {
                    const data = await res.json();
                    const sessions = data.sessions || [];
                    setCalls(sessions);
                    // Cache the result
                    cacheRef.current[cacheKey] = sessions;
                }
            } catch (error: any) {
                if (error.name === 'AbortError') return;
                console.error("Failed to fetch sessions", error);
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchSessions();

        return () => abortController.abort();
    }, [selectedScenario, selectedAgent, dateRange]);

    const filteredCalls = calls.filter(call => {
        const searchMatch = call.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            call.id.toLowerCase().includes(searchTerm.toLowerCase());
        return searchMatch;
    });

    const getTagClass = (tag?: string) => {
        switch (tag) {
            case "Exceptional": return styles.tagExceptional;
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

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by Agent Name or Call ID..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Call ID</th>
                            <th>Date & Time</th>
                            <th>Agent Name</th>
                            <th>Scenario</th>
                            <th>Duration</th>
                            <th>Adherence Tag</th>
                            <th>Red Flags</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className={styles.emptyState}>Loading sessions...</td>
                            </tr>
                        ) : filteredCalls.length > 0 ? filteredCalls.map((call) => (
                            <tr key={call.id} className={styles.tableRow} onClick={() => setSelectedCall(call)}>
                                <td className={styles.callId}>{call.id.substring(0, 8)}</td>
                                <td className={styles.dateCell}>{new Date(call.created_at).toLocaleString()}</td>
                                <td><span className={styles.agentName}>{call.agent_name}</span></td>
                                <td><span className={styles.scenarioBadge}>{call.scenario_name}</span></td>
                                <td className={styles.durationCell}>{call.duration || "N/A"}</td>
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
                                <td>
                                    <button className={styles.viewBtn}>
                                        <FileText size={16} />
                                        <span>Details</span>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={8} className={styles.emptyState}>
                                    No call recordings found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedCall && (
                <div className={styles.modalOverlay} onClick={() => setSelectedCall(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Call Details: {selectedCall.id.substring(0, 8)}</h3>
                            <button className={styles.closeBtn} onClick={() => setSelectedCall(null)}><X size={20} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.modalSection}>
                                <h4>Agent Information</h4>
                                <p><strong>Name:</strong> {selectedCall.agent_name}</p>
                                <p><strong>Scenario:</strong> {selectedCall.scenario_name}</p>
                                <p><strong>Date / Time:</strong> {new Date(selectedCall.created_at).toLocaleString()}</p>
                                <p className={styles.marginTop}><strong>Adherence Tag:</strong> <span className={`${styles.qualityTagModal} ${getTagClass(selectedCall.adherence_tag)}`}>{selectedCall.adherence_tag || "Unknown"}</span></p>
                            </div>
                            <div className={styles.modalSection}>
                                <h4>Critical Violations Identified ({selectedCall.red_flags_count})</h4>
                                {selectedCall.red_flags_count > 0 ? (
                                    <ul className={styles.violationList}>
                                        {selectedCall.red_flags.map((flag, i) => (
                                            <li key={i}>{flag}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className={styles.cleanText}>✓ No critical red flags detected during this interaction. Excellent execution.</p>
                                )}
                            </div>
                            <div className={styles.modalSection}>
                                <h4>Call Transcript</h4>
                                <div className={styles.transcriptContainer}>
                                    {selectedCall.transcript ? (
                                        <div className={styles.transcriptText}>
                                            {selectedCall.transcript.split('\n').map((line, i) => (
                                                <p key={i} className={styles.transcriptLine}>{line}</p>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className={styles.emptyTranscriptText}>No transcript available for this session.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
