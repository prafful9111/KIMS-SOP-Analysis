"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import GlobalFilter from "@/components/GlobalFilter";
import AllCallsTable from "@/components/AllCallsTable";
import styles from "./page.module.css";

export default function AllCallsPage() {
    const [selectedScenario, setSelectedScenario] = useState("all");
    const [selectedStaff, setSelectedStaff] = useState("all");
    const [dateRange, setDateRange] = useState("all");

    return (
        <>
            <Header title="SOP Compliance & Quality Overview" />
            <main className={styles.main}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>All Calls</h1>
                    <p className={styles.pageSubtitle}>Detailed staff interaction data and SOP compliance results.</p>
                </div>

                <GlobalFilter
                    selectedScenario={selectedScenario}
                    setSelectedScenario={setSelectedScenario}
                    selectedStaff={selectedStaff}
                    setSelectedStaff={setSelectedStaff}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                />

                <div className={styles.tableContainer}>
                    <AllCallsTable
                        selectedScenario={selectedScenario}
                        selectedStaff={selectedStaff}
                        dateRange={dateRange}
                    />
                </div>
            </main>
        </>
    );
}
