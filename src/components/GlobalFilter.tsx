"use client";

import React, { useState } from "react";
import styles from "./GlobalFilter.module.css";
import { MapPin, Calendar, Building2, Filter, RotateCcw } from "lucide-react";

interface GlobalFilterProps {
    selectedScenario?: string;
    setSelectedScenario?: (val: string) => void;
}

export default function GlobalFilter({ selectedScenario, setSelectedScenario }: GlobalFilterProps) {
    const [dateRangeType, setDateRangeType] = useState("Last 30 Days");

    const handleReset = () => {
        if (setSelectedScenario) setSelectedScenario("All Scenarios");
        setDateRangeType("Last 30 Days");
    };

    return (
        <div className={styles.filterContainer}>
            <div className={styles.filterGroup}>
                <Calendar className={styles.icon} size={18} />
                <select
                    className={styles.select}
                    value={dateRangeType}
                    onChange={(e) => setDateRangeType(e.target.value)}
                >
                    <option value="Today">Today</option>
                    <option value="Yesterday">Yesterday</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="Custom Range">Custom Range...</option>
                </select>
            </div>

            {dateRangeType === "Custom Range" && (
                <>
                    <div className={styles.divider}></div>
                    <div className={styles.filterGroup}>
                        <span className={styles.label}>Start Date:</span>
                        <input type="date" className={styles.dateInput} />
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.filterGroup}>
                        <span className={styles.label}>End Date:</span>
                        <input type="date" className={styles.dateInput} />
                    </div>
                </>
            )}

            <div className={styles.divider}></div>

            <div className={styles.filterGroup}>
                <Building2 size={18} color="var(--color-text-secondary)" />
                <select className={styles.select} defaultValue="">
                    <option value="" disabled>Select Department / Unit</option>
                    <option value="discharge">Discharge</option>
                    <option value="opd">OPD</option>
                    <option value="icu">ICU</option>
                    <option value="emergency">Emergency</option>
                </select>
            </div>

            <div className={styles.filterGroup}>
                <Filter className={styles.icon} size={18} />
                <select
                    className={styles.select}
                    value={selectedScenario}
                    onChange={(e) => setSelectedScenario?.(e.target.value)}
                >
                    <option value="All Scenarios">All Scenarios</option>
                    <option value="Cash - Financial Counselling">Cash - Financial Counselling</option>
                    <option value="Pre-OP & Day Care Admission">Pre-OP & Day Care Admission</option>
                    <option value="Room Admission">Room Admission</option>
                    <option value="Discharge">Discharge</option>
                    <option value="PWO">PWO</option>
                </select>
            </div>

            <div className={styles.divider}></div>

            <button className={styles.resetBtn} onClick={handleReset}>
                <RotateCcw size={16} />
                Reset Filters
            </button>
        </div>
    );
}
