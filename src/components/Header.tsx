"use client";

import React from "react";
import { Bell, User } from "lucide-react";
import styles from "./Header.module.css";

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <h1 className={styles.title}>SOP Compliance & Quality Overview</h1>
            </div>
            <div className={styles.rightSection}>
                <button className={styles.iconButton} aria-label="Notifications">
                    <Bell size={24} />
                    <span className={styles.badge} />
                </button>
                <div className={styles.avatar}>
                    <User size={24} />
                </div>
            </div>
        </header>
    );
}
