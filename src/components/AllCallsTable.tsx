"use client";

import React, { useState } from "react";
import { Search, AlertCircle, FileText } from "lucide-react";
import styles from "./AllCallsTable.module.css";

interface CallRecord {
    id: string;
    agentName: string;
    scenario: string;
    date: string;
    duration: string;
    qualityTag: "Very Good" | "Good" | "Average" | "Weak" | "Very Weak";
    criticalFlags: number;
}

const mockCalls: CallRecord[] = [
    { id: "CALL-1049", agentName: "Sarah Jenkins", scenario: "Admission", date: "2024-03-24 10:30 AM", duration: "04:15", qualityTag: "Weak", criticalFlags: 2 },
    { id: "CALL-1048", agentName: "Rahul Sharma", scenario: "Cash FC", date: "2024-03-24 10:15 AM", duration: "06:20", qualityTag: "Very Good", criticalFlags: 0 },
    { id: "CALL-1047", agentName: "Anita Desai", scenario: "Discharge", date: "2024-03-24 09:45 AM", duration: "03:50", qualityTag: "Average", criticalFlags: 1 },
    { id: "CALL-1046", agentName: "Vikram Singh", scenario: "PWO", date: "2024-03-23 04:30 PM", duration: "05:10", qualityTag: "Good", criticalFlags: 0 },
    { id: "CALL-1045", agentName: "Priya Patel", scenario: "Admission", date: "2024-03-23 02:15 PM", duration: "07:05", qualityTag: "Very Weak", criticalFlags: 3 },
    { id: "CALL-1044", agentName: "Arjun Reddy", scenario: "Discharge", date: "2024-03-23 11:10 AM", duration: "02:45", qualityTag: "Good", criticalFlags: 0 },
    { id: "CALL-1043", agentName: "Sarah Jenkins", scenario: "Pre-OP", date: "2024-03-23 09:20 AM", duration: "04:40", qualityTag: "Average", criticalFlags: 1 }
];

interface AllCallsTableProps {
    selectedScenario?: string;
}

export default function AllCallsTable({ selectedScenario }: AllCallsTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

    const filteredCalls = mockCalls.filter(call => {
        const matchesScenario = !selectedScenario || selectedScenario === "All Scenarios" || call.scenario === selectedScenario;
        const matchesSearch = call.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            call.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesScenario && matchesSearch;
    });

    const getTagClass = (tag: string) => {
        switch (tag) {
            case "Very Good": return styles.tagExceptional;
            case "Good": return styles.tagProficient;
            case "Average": return styles.tagAverage;
            case "Weak": return styles.tagWeak;
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
                        {filteredCalls.length > 0 ? filteredCalls.map((call) => (
                            <tr key={call.id} className={styles.tableRow} onClick={() => setSelectedCall(call)}>
                                <td className={styles.callId}>{call.id}</td>
                                <td className={styles.dateCell}>{call.date}</td>
                                <td><span className={styles.agentName}>{call.agentName}</span></td>
                                <td><span className={styles.scenarioBadge}>{call.scenario}</span></td>
                                <td className={styles.durationCell}>{call.duration}</td>
                                <td>
                                    <span className={`${styles.qualityTag} ${getTagClass(call.qualityTag)}`}>
                                        {call.qualityTag}
                                    </span>
                                </td>
                                <td>
                                    {call.criticalFlags > 0 ? (
                                        <div className={styles.flagWarning}>
                                            <AlertCircle size={14} />
                                            <span>{call.criticalFlags}</span>
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
                            <h3>Call Analysis Details: {selectedCall.id}</h3>
                            <button className={styles.closeBtn} onClick={() => setSelectedCall(null)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.modalSection}>
                                <h4>Agent Information</h4>
                                <p><strong>Name:</strong> {selectedCall.agentName}</p>
                                <p><strong>Scenario:</strong> {selectedCall.scenario}</p>
                                <p><strong>Date / Time:</strong> {selectedCall.date}</p>
                                <p className={styles.marginTop}><strong>Adherence Tag:</strong> <span className={`${styles.qualityTagModal} ${getTagClass(selectedCall.qualityTag)}`}>{selectedCall.qualityTag}</span></p>
                            </div>
                            <div className={styles.modalSection}>
                                <h4>AI Generated Summary</h4>
                                <p className={styles.summaryText}>
                                    The executive greeted the patient properly but failed to comprehensively explain the room tariff boundaries. Tone was polite but lacked necessary detailed financial disclosure resulting in a lower quality rating.
                                </p>
                            </div>
                            <div className={styles.modalSection}>
                                <h4>Critical Violations Identified ({selectedCall.criticalFlags})</h4>
                                {selectedCall.criticalFlags > 0 ? (
                                    <ul className={styles.violationList}>
                                        <li>Failed to confirm Room Tariff & Deposit completely.</li>
                                        <li>Did not explicitly state non-refundable processing fees.</li>
                                        {selectedCall.criticalFlags > 2 && <li>Missed mandatory greeting parameters.</li>}
                                    </ul>
                                ) : (
                                    <p className={styles.cleanText}>✓ No critical red flags detected during this interaction. Excellent execution.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
