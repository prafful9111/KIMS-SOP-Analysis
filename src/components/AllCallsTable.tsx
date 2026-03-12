"use client";

import React, { useState, useEffect } from "react";
import { Search, AlertCircle, FileText, X } from "lucide-react";
import styles from "./AllCallsTable.module.css";
import { capitalizeName } from "./GlobalFilter";

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
    audio_files?: { id: string, url: string, order: number }[];
    sop_adherence_checklist?: { step: string, status: string, notes: string }[];
}

interface AllCallsTableProps {
    selectedScenario?: string;
    selectedStaff?: string;
    dateRange?: string;
}

export default function AllCallsTable({
    selectedScenario,
    selectedStaff,
    dateRange = "all"
}: AllCallsTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [calls, setCalls] = useState<SessionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCall, setSelectedCall] = useState<SessionData | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'evaluation' | 'sop'>('details');
    const [scoreSortOrder, setScoreSortOrder] = useState<'none' | 'high-to-low' | 'low-to-high'>('none');

    // Score mapping for sorting
    const scoreMap: Record<string, number> = {
        "Exceptional": 5,
        "Proficient": 4,
        "Good": 4,
        "Average": 3,
        "Developmental": 2,
        "Weak": 2,
        "Immediate Action": 1,
        "Very Weak": 1,
    };

    // Cache for session data
    const cacheRef = React.useRef<Record<string, SessionData[]>>({});

    useEffect(() => {
        const abortController = new AbortController();

        const fetchSessions = async () => {
            const cacheKey = `${selectedScenario}-${selectedStaff}-${dateRange}`;

            // Return cached data if available
            if (cacheRef.current[cacheKey]) {
                setCalls(cacheRef.current[cacheKey]);
                setLoading(false);
                return;
            }

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
    }, [selectedScenario, selectedStaff, dateRange]);

    const filteredCalls = calls
        .filter(call => {
            const searchMatch = call.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                call.id.toLowerCase().includes(searchTerm.toLowerCase());
            return searchMatch;
        })
        .sort((a, b) => {
            if (scoreSortOrder === 'none') return 0;

            const scoreA = scoreMap[a.adherence_tag || ""] || 0;
            const scoreB = scoreMap[b.adherence_tag || ""] || 0;

            if (scoreSortOrder === 'high-to-low') {
                return scoreB - scoreA;
            } else {
                return scoreA - scoreB;
            }
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
                        placeholder="Search by Staff Name or Call ID..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filterWrapper}>
                    <span className={styles.filterLabel}>Sort by Score:</span>
                    <select
                        className={styles.scoreSelect}
                        value={scoreSortOrder}
                        onChange={(e) => setScoreSortOrder(e.target.value as any)}
                    >
                        <option value="none">All Scores</option>
                        <option value="high-to-low">Highest First</option>
                        <option value="low-to-high">Lowest First</option>
                    </select>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Call ID</th>
                            <th>Date & Time</th>
                            <th>Staff Name</th>
                            <th>Department</th>
                            <th>Adherence</th>
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
                            <tr 
                                key={call.id} 
                                className={styles.tableRow} 
                                onClick={async () => {
                                    setSelectedCall(call);
                                    setModalLoading(true);
                                    try {
                                        const res = await fetch(`/api/dashboard/sessions/${call.id}`);
                                        if (res.ok) {
                                            const data = await res.json();
                                            const session = data.session;
                                            
                                            // Extract SOP checklist from analysis_json
                                            const checklist = session.analysis_json?.result?.sop_adherence_checklist || [];
                                            
                                            setSelectedCall({
                                                ...call,
                                                audio_files: session.audio_files,
                                                sop_adherence_checklist: checklist,
                                                transcript: session.transcript || call.transcript
                                            });
                                        }
                                    } catch (err) {
                                        console.error("Failed to fetch session details", err);
                                    } finally {
                                        setModalLoading(false);
                                    }
                                }}
                            >
                                <td className={styles.callId}>{call.id.substring(0, 8)}</td>
                                <td className={styles.dateCell}>{new Date(call.created_at).toLocaleString()}</td>
                                <td><span className={styles.agentName}>{capitalizeName(call.agent_name)}</span></td>
                                <td><span className={styles.scenarioBadge}>{call.scenario_name}</span></td>
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
                        <div className={styles.tabsContainer}>
                            <button
                                className={`${styles.modalTab} ${activeTab === 'details' ? styles.active : ''}`}
                                onClick={() => setActiveTab('details')}
                            >
                                Call Details
                            </button>
                            <button
                                className={`${styles.modalTab} ${activeTab === 'evaluation' ? styles.active : ''}`}
                                onClick={() => setActiveTab('evaluation')}
                            >
                                Staff Evaluation
                            </button>
                            <button
                                className={`${styles.modalTab} ${activeTab === 'sop' ? styles.active : ''}`}
                                onClick={() => setActiveTab('sop')}
                            >
                                SOP Adherence
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            {modalLoading ? (
                                <div className={styles.modalLoading}>
                                    <div className="skeleton" style={{ height: '100px', width: '100%', marginBottom: '20px' }}></div>
                                    <div className="skeleton" style={{ height: '200px', width: '100%' }}></div>
                                </div>
                            ) : activeTab === 'details' ? (
                                <>
                                    <div className={styles.modalFullWidth}>
                                        <div className={styles.modalSection}>
                                            <h4>Staff Information</h4>
                                            <div className={styles.infoList}>
                                                <p><strong>Name:</strong> {capitalizeName(selectedCall.agent_name)}</p>
                                                <p><strong>Department:</strong> {selectedCall.scenario_name}</p>
                                                <p><strong>Date / Time:</strong> {new Date(selectedCall.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {selectedCall.audio_files && selectedCall.audio_files.length > 0 && (
                                            <div className={styles.modalSection}>
                                                <h4>Session Recordings ({selectedCall.audio_files.length})</h4>
                                                <div className={styles.audioList}>
                                                    {selectedCall.audio_files.map((file, idx) => (
                                                        <div key={file.id} className={styles.audioItem}>
                                                            <span className={styles.audioLabel}>Recording {idx + 1}</span>
                                                            <audio controls className={styles.audioPlayer}>
                                                                <source src={file.url} type="audio/mpeg" />
                                                                Your browser does not support the audio element.
                                                            </audio>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className={styles.modalSection}>
                                            <h4>Call Transcript</h4>
                                            <div className={styles.transcriptContainer}>
                                                {selectedCall.transcript ? (
                                                    <div className={styles.transcriptText}>
                                                        {selectedCall.transcript.replace(/\*\*/g, '').split('\n').map((line, i) => (
                                                            <p key={i} className={styles.transcriptLine}>{line}</p>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className={styles.emptyTranscriptText}>No transcript available for this session.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : activeTab === 'sop' ? (
                                <div className={styles.modalFullWidth}>
                                    <div className={styles.modalSection}>
                                        <h4>Step-by-Step SOP Adherence</h4>
                                        <div className={styles.sopChecklist}>
                                            {selectedCall.sop_adherence_checklist && selectedCall.sop_adherence_checklist.length > 0 ? (
                                                selectedCall.sop_adherence_checklist.map((item, i) => (
                                                    <div key={i} className={`${styles.sopItem} ${styles[item.status.replace(/ /g, '')]}`}>
                                                        <div className={styles.sopStatus}>
                                                            {item.status === 'Completed' ? '✓' : '✕'}
                                                        </div>
                                                        <div className={styles.sopContent}>
                                                            <div className={styles.sopStepText}>{item.step}</div>
                                                            {item.notes && <div className={styles.sopNote}>{item.notes}</div>}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className={styles.emptyText}>No SOP tracking data available.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.modalSection}>
                                        <h4>Overall Evaluation</h4>
                                        <p><strong>Adherence Tag:</strong> <span className={`${styles.qualityTagModal} ${getTagClass(selectedCall.adherence_tag)}`}>{selectedCall.adherence_tag || "Unknown"}</span></p>
                                        <div className={styles.marginTop}>
                                            <strong>Call Summary:</strong>
                                            {selectedCall.summary ? (
                                                <div className={styles.summaryText}>{selectedCall.summary}</div>
                                            ) : (
                                                <p className={styles.cleanText}>No summary available for this session.</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.modalSection}>
                                        <h4>Critical Alerts & Missing Steps ({selectedCall.red_flags_count})</h4>
                                        {selectedCall.red_flags_count > 0 ? (
                                            <ul className={styles.violationList}>
                                                {selectedCall.red_flags.map((flag, i) => (
                                                    <li key={i}>{flag}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className={styles.cleanText}>✓ Excellent execution. No critical alerts or missed steps found.</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
