"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import GlobalFilter from "@/components/GlobalFilter";
import AllCallsTable from "@/components/AllCallsTable";
import styles from "./page.module.css";

export default function AllCallsPage() {
    const [selectedScenario, setSelectedScenario] = useState("All Scenarios");

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>All Calls</h1>
                    <p className={styles.pageSubtitle}>Detailed log of analyzed call recordings across all scenarios.</p>
                </div>

                <GlobalFilter
                    selectedScenario={selectedScenario}
                    setSelectedScenario={setSelectedScenario}
                />

                <div className={styles.tableContainer}>
                    <AllCallsTable selectedScenario={selectedScenario} />
                </div>
            </main>
        </>
    );
}
