"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import Header from "@/components/Header";
import GlobalFilter, { capitalizeName } from "@/components/GlobalFilter";
import SessionListModal from "@/components/SessionListModal";
import {
    Users, AlertCircle, Trophy, Target,
    BarChart3, ShieldAlert
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface Agent {
    id: string;
    name: string;
    email: string;
    totalSessions: number;
    analyzedSessions: number;
    adherenceCounts: Record<string, number>;
    totalViolations: number;
    avgComplianceRate: number;
    highestViolationType?: string;
    topStrength?: string;
}

export default function StaffAnalysisPage() {
    const [selectedScenario, setSelectedScenario] = useState("all");
    const [selectedStaff, setSelectedStaff] = useState("all");
    const [dateRange, setDateRange] = useState("all");
    const [agents, setAgents] = useState<Agent[]>([]);
    const [allStaffAgents, setAllStaffAgents] = useState<Agent[]>([]);
    const [staffList, setStaffList] = useState<{ id: string, name: string }[]>([]);

    // Modal state for session drill-down
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAgentId, setModalAgentId] = useState("all");

    // Split loading states to prevent full page flicker
    const [teamLoading, setTeamLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(true);

    // Initial fetch for staff list
    useEffect(() => {
        const fetchStaffList = async () => {
            try {
                const res = await fetch('/api/dashboard/agents');
                if (res.ok) {
                    const data = await res.json();
                    setStaffList(data.agents || []);
                }
            } catch (err) {
                console.error("Failed to fetch staff list", err);
            }
        };
        fetchStaffList();
    }, []);

    // Fetch team stats (only when scenario or date changes)
    useEffect(() => {
        fetchTeamStats();
    }, [selectedScenario, dateRange]);

    // Fetch specific agent/table data (when anything changes)
    useEffect(() => {
        fetchTableData();
    }, [selectedScenario, dateRange, selectedStaff]);

    const fetchTeamStats = async () => {
        setTeamLoading(true);
        try {
            const params = new URLSearchParams({
                scenario: selectedScenario,
                dateRange: dateRange,
                agent: "all"
            });
            const res = await fetch(`/api/dashboard/agents?${params.toString()}`);
            const data = await res.json();
            if (data.agents) {
                setAllStaffAgents(data.agents);
            }
        } catch (error) {
            console.error("Failed to fetch team stats:", error);
        } finally {
            setTeamLoading(false);
        }
    };

    const fetchTableData = async () => {
        setTableLoading(true);
        try {
            const params = new URLSearchParams({
                scenario: selectedScenario,
                dateRange: dateRange,
                agent: selectedStaff
            });
            const res = await fetch(`/api/dashboard/agents?${params.toString()}`);
            const data = await res.json();
            if (data.agents) {
                setAgents(data.agents);
            }
        } catch (error) {
            console.error("Failed to fetch table data:", error);
        } finally {
            setTableLoading(false);
        }
    };

    // --- Data Processing for Team-Wide Top Cards ---
    const teamAnalyzed = allStaffAgents.filter(a => a.analyzedSessions > 0);
    const complianceLeader = teamAnalyzed.length > 0
        ? [...teamAnalyzed].sort((a, b) => b.avgComplianceRate - a.avgComplianceRate)[0]
        : null;

    const mostEvaluated = allStaffAgents.length > 0
        ? [...allStaffAgents].sort((a, b) => b.analyzedSessions - a.analyzedSessions)[0]
        : null;

    const coachingPriority = teamAnalyzed.length > 0
        ? [...teamAnalyzed].sort((a, b) => (b.totalViolations / (b.analyzedSessions || 1)) - (a.totalViolations / (a.analyzedSessions || 1)))[0]
        : null;

    const totalStatsSessions = allStaffAgents.reduce((sum, a) => sum + a.totalSessions, 0);
    const totalAnalyzed = allStaffAgents.reduce((sum, a) => sum + a.analyzedSessions, 0);
    const coverage = totalStatsSessions > 0 ? Math.round((totalAnalyzed / totalStatsSessions) * 100) : 0;

    // --- Data Processing for Performance Ranking (Team Stats) ---
    const chartData = teamAnalyzed
        .sort((a, b) => b.avgComplianceRate - a.avgComplianceRate)
        .slice(0, 10)
        .map(a => ({
            name: a.name.split(' ')[0],
            fullName: capitalizeName(a.name),
            score: a.avgComplianceRate
        }));

    const getPriorityLabel = (agent: Agent) => {
        if (agent.analyzedSessions === 0) return { label: "N/A", class: "" };
        const violationRate = agent.totalViolations / agent.analyzedSessions;
        if (violationRate > 0.4 || agent.avgComplianceRate < 40) return { label: "High", class: styles.priorityHigh };
        if (violationRate > 0.15 || agent.avgComplianceRate < 70) return { label: "Medium", class: styles.priorityMedium };
        return { label: "Low", class: styles.priorityLow };
    };

    // --- Actionable Reps (High Priority, low accuracy, or failing) ---
    const actionableReps = teamAnalyzed
        .filter(a => {
            const priority = getPriorityLabel(a);
            // Include high priority OR bottom 25% accuracy OR high violations
            return priority.label === "High" || a.avgComplianceRate < 70 || a.totalViolations > 1;
        })
        .sort((a, b) => {
            // Primarily show those with the most red flags
            if (b.totalViolations !== a.totalViolations) return b.totalViolations - a.totalViolations;
            // Then by lowest compliance rate
            return a.avgComplianceRate - b.avgComplianceRate;
        })
        .slice(0, 5);

    // --- Best and Worst Performers ---
    const bestPerformers = teamAnalyzed
        .sort((a, b) => b.avgComplianceRate - a.avgComplianceRate)
        .slice(0, 3);

    const worstPerformers = teamAnalyzed
        .sort((a, b) => a.avgComplianceRate - b.avgComplianceRate)
        .slice(0, 3);

    return (
        <>
            <Header title="SOP Compliance & Quality Overview" />
            <main className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.titleSection}>
                        <h1>Staff Analysis</h1>
                        <p>Unique insights into individual performance, rankings, and coaching focus.</p>
                    </div>
                    <GlobalFilter
                        selectedScenario={selectedScenario}
                        setSelectedScenario={setSelectedScenario}
                        selectedStaff={selectedStaff}
                        setSelectedStaff={setSelectedStaff}
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        hideStaffFilter={true}
                    />
                </div>

                <div className={styles.kpiGrid}>
                    <div className={styles.rewardCard}>
                        <div className={styles.rewardLabel}>
                            <Trophy size={14} style={{ marginRight: '6px', color: '#F9AB00' }} />
                            Compliance Leader
                        </div>
                        {teamLoading ? <div className="skeleton" style={{ height: '24px', width: '80%' }}></div> : (
                            <>
                                <div className={styles.rewardValue}>{complianceLeader ? capitalizeName(complianceLeader.name) : "N/A"}</div>
                                <div className={styles.rewardSubtext}>{complianceLeader?.avgComplianceRate}% accuracy score</div>
                            </>
                        )}
                    </div>

                    <div className={styles.rewardCard}>
                        <div className={styles.rewardLabel}>
                            <Target size={14} style={{ marginRight: '6px', color: 'var(--color-primary)' }} />
                            Most Evaluated
                        </div>
                        {teamLoading ? <div className="skeleton" style={{ height: '24px', width: '80%' }}></div> : (
                            <>
                                <div className={styles.rewardValue}>{mostEvaluated ? capitalizeName(mostEvaluated.name) : "N/A"}</div>
                                <div className={styles.rewardSubtext}>{mostEvaluated?.analyzedSessions} sessions</div>
                            </>
                        )}
                    </div>

                    <div className={`${styles.rewardCard} ${styles.priority}`}>
                        <div className={styles.rewardLabel}>
                            <ShieldAlert size={14} style={{ marginRight: '6px', color: 'var(--score-immediate)' }} />
                            Coaching Priority
                        </div>
                        {teamLoading ? <div className="skeleton" style={{ height: '24px', width: '80%' }}></div> : (
                            <>
                                <div className={styles.rewardValue}>{coachingPriority ? capitalizeName(coachingPriority.name) : "N/A"}</div>
                                <div className={styles.rewardSubtext}>Highest violation density</div>
                            </>
                        )}
                    </div>

                    <div className={styles.rewardCard}>
                        <div className={styles.rewardLabel}>
                            <Users size={14} style={{ marginRight: '6px', color: '#5F6368' }} />
                            Team Coverage
                        </div>
                        {teamLoading ? <div className="skeleton" style={{ height: '24px', width: '80%' }}></div> : (
                            <>
                                <div className={styles.rewardValue}>{coverage}%</div>
                                <div className={styles.rewardSubtext}>of sessions analyzed</div>
                            </>
                        )}
                    </div>
                </div>

                <div className={styles.analysisGrid}>
                    <div className={styles.analysisSection}>
                        <div className={styles.sectionHeader}>
                            <ShieldAlert size={18} color="var(--score-immediate)" />
                            <div className={styles.headerInfo}>
                                <h3>Actionable Reps</h3>
                                <span className={styles.statHint}>Agents with low accuracy or red flags</span>
                            </div>
                        </div>
                        <div className={styles.actionableList}>
                            {teamLoading ? [1, 2].map(i => <div key={i} className="skeleton" style={{ height: '70px', marginBottom: '12px' }}></div>) : 
                             actionableReps.length > 0 ? actionableReps.map(rep => (
                                <div key={rep.id} className={styles.actionableItem}>
                                    <div className={styles.repInfo}>
                                        <span className={styles.repName}>{capitalizeName(rep.name)}</span>
                                        <div className={styles.repStats}>
                                            <span className={styles.repMetric}>{rep.totalViolations} Red Flags</span>
                                            <span className={styles.repDivider}>•</span>
                                            <span className={styles.repMetric}>{rep.avgComplianceRate}% Accuracy</span>
                                        </div>
                                    </div>
                                    <button 
                                        className={styles.coachBtn}
                                        onClick={() => {
                                            setModalAgentId(rep.id);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        Review
                                    </button>
                                </div>
                            )) : <p className={styles.emptyText}>No immediate action required for this selection.</p>}
                        </div>
                    </div>

                    <div className={styles.analysisSection}>
                        <div className={styles.sectionHeader}>
                            <Trophy size={18} color="#F9AB00" />
                            <div className={styles.headerInfo}>
                                <h3>Top Performers</h3>
                                <span className={styles.statHint}>Highest accuracy across analyzed sessions</span>
                            </div>
                        </div>
                        <div className={styles.perfComparison}>
                            <div className={styles.perfColumn}>
                                {bestPerformers.length > 0 ? bestPerformers.map(a => (
                                    <div key={a.id} className={styles.miniAgentCard}>
                                        <div className={styles.repInfo}>
                                            <div className={styles.agentRank}>
                                                <div className={styles.trendUp}>↑</div>
                                                <span className={styles.repName}>{capitalizeName(a.name)}</span>
                                            </div>
                                            <div className={styles.repStats}>
                                                <span className={styles.agentScore} style={{ color: '#1B813E' }}>{a.avgComplianceRate}% Accuracy</span>
                                            </div>
                                        </div>
                                        <button 
                                            className={styles.coachBtn}
                                            onClick={() => {
                                                setModalAgentId(a.id);
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            Review
                                        </button>
                                    </div>
                                )) : <p className={styles.emptyText}>No data available.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <BarChart3 size={18} color="var(--color-primary)" />
                        <h3>Top 10 Performance Ranking</h3>
                    </div>
                    <div style={{ width: '100%', height: 260 }}>
                        {teamLoading ? (
                            <div className="skeleton" style={{ width: '100%', height: '100%' }}></div>
                        ) : chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E1E3E1" />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={80}
                                        tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--color-text-primary)' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0, 118, 182, 0.05)' }}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #E1E3E1', boxShadow: 'var(--shadow-medium)' }}
                                        labelFormatter={(label, items) => items[0]?.payload?.fullName || label}
                                        formatter={(value: any) => [`${value}%`, 'Compliance Score']}
                                    />
                                    <Bar
                                        dataKey="score"
                                        radius={[0, 4, 4, 0]}
                                        barSize={20}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#1B813E' : entry.score >= 50 ? '#0076B6' : '#D93025'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                                No staff data available for the current selection.
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.tableSection}>
                    <div className={styles.tableHeader}>
                        <h2>Detailed Staff Overview</h2>
                        <div className={styles.tableActions}>
                            <div className={styles.localFilter}>
                                <Users size={14} className={styles.filterIcon} />
                                <select
                                    className={styles.localSelect}
                                    value={selectedStaff}
                                    onChange={(e) => setSelectedStaff(e.target.value)}
                                >
                                    <option value="all">All Staff</option>
                                    {staffList.map(s => (
                                        <option key={s.id} value={s.id}>{capitalizeName(s.name)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.statsBadge} style={{ background: 'var(--color-background-alt)' }}>
                                <Users size={14} style={{ marginRight: '6px' }} />
                                {agents.length} Staff Member(s)
                            </div>
                        </div>
                    </div>

                    <div className={styles.tableWrapper}>
                        {tableLoading ? (
                            <div className={styles.loadingWrapper}>
                                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '40px', width: '100%', marginBottom: '8px', borderRadius: '4px' }}></div>)}
                            </div>
                        ) : agents.length > 0 ? (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>Staff Member</th>
                                        <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>Total Sessions</th>
                                        <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>Analyzed</th>
                                        <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>Compliance</th>
                                        <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>Violations</th>
                                        <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>Coaching Priority</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {agents.map((agent) => {
                                        const priority = getPriorityLabel(agent);
                                        return (
                                            <tr
                                                key={agent.id}
                                                className={styles.tableRow}
                                                onClick={() => {
                                                    setModalAgentId(agent.id);
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                <td>
                                                    <div className={styles.agentNameCell}>
                                                        <span className={styles.agentName}>{capitalizeName(agent.name)}</span>
                                                        <span className={styles.agentEmail}>{agent.email}</span>
                                                    </div>
                                                </td>
                                                <td>{agent.totalSessions}</td>
                                                <td>{agent.analyzedSessions}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ flex: 1, height: '6px', background: '#E1E3E1', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                                                            <div
                                                                style={{
                                                                    width: `${agent.avgComplianceRate}%`,
                                                                    height: '100%',
                                                                    background: agent.avgComplianceRate >= 80 ? '#1B813E' : agent.avgComplianceRate >= 50 ? '#0076B6' : '#D93025'
                                                                }}
                                                            />
                                                        </div>
                                                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{agent.avgComplianceRate}%</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ fontWeight: 600, color: agent.totalViolations > 0 ? 'var(--score-immediate)' : 'inherit' }}>
                                                        {agent.totalViolations}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`${styles.statsBadge} ${priority.class}`}>
                                                        {priority.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className={styles.emptyState}>
                                <AlertCircle size={48} />
                                <h3>No staff data found</h3>
                                <p>Try adjusting your filters or search criteria.</p>
                            </div>
                        )}
                    </div>
                </div>

                <SessionListModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    filterType={null}
                    selectedScenario={selectedScenario}
                    selectedStaff={modalAgentId}
                    dateRange={dateRange}
                />
            </main>
        </>
    );
}
