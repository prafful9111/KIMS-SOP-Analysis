"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import { LayoutDashboard, ChevronLeft, ChevronRight, Activity, PhoneCall } from "lucide-react";

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
            <div className={styles.topSection}>
                <div className={styles.logoContainer}>
                    <Activity className={styles.logoIcon} size={28} />
                    <div className={styles.logoText}>
                        KIMS <span>HOSPITALS&trade;</span>
                    </div>
                </div>
                <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className={styles.navMenu}>
                <Link href="/" className={`${styles.navItem} ${pathname === "/" ? styles.active : ""}`}>
                    <LayoutDashboard className={styles.navIcon} size={20} />
                    <span className={styles.navText}>Overview</span>
                </Link>
                <Link href="/all-calls" className={`${styles.navItem} ${pathname === "/all-calls" ? styles.active : ""}`}>
                    <PhoneCall className={styles.navIcon} size={20} />
                    <span className={styles.navText}>All Calls</span>
                </Link>
            </nav>
        </aside>
    );
}
