"use client";

import React from "react";
import styles from "./SOPDropoff.module.css";

interface SOPDropoffProps {
    selectedScenario?: string;
}

const cashFCSteps = [
    { step: "Greet patient respectfully", completed: 85, missed: 5, incorrect: 10 },
    { step: "Offer seat to sit & ask for refreshments like water/tea/coffee etc.", completed: 78, missed: 12, incorrect: 10 },
    { step: "Introduce self and tell them that you are here to give a financial extimate of the patient for the admission being done", completed: 70, missed: 15, incorrect: 15 },
    { step: "Cross verify the patient details (Full Name, age, gender, Doctor name, privilege type, phone number / UMR number)", completed: 60, missed: 25, incorrect: 15 },
    { step: "Request for Admission request form / Out patient record (OP slip)", completed: 50, missed: 40, incorrect: 10 },
];

const preOPSteps = [
    { step: "Greet patient/attendant politely at admission counter", completed: 90, missed: 5, incorrect: 5 },
    { step: "Introduce self and department", completed: 85, missed: 10, incorrect: 5 },
    { step: "Ask reason for admission and collect patient details", completed: 80, missed: 10, incorrect: 10 },
    { step: "Confirm doctor admission advice / admission slip", completed: 72, missed: 20, incorrect: 8 },
    { step: "Capture patient details in HIS", completed: 65, missed: 25, incorrect: 10 },
];

const roomAdmissionSteps = [
    { step: "Greet patient/attender at admission counter", completed: 92, missed: 3, incorrect: 5 },
    { step: "Introduce self and role", completed: 88, missed: 7, incorrect: 5 },
    { step: "Confirm admission type and doctor advice", completed: 82, missed: 12, incorrect: 6 },
    { step: "Verify payment eligibility / insurance eligibility", completed: 75, missed: 18, incorrect: 7 },
    { step: "Allocate room based on availability & eligibility", completed: 70, missed: 20, incorrect: 10 },
];

const dischargeSteps = [
    { step: "Greet patient respectfully", completed: 90, missed: 5, incorrect: 5 },
    { step: "Introduce self & designation", completed: 86, missed: 8, incorrect: 6 },
    { step: "Checking the mode of Payment", completed: 78, missed: 15, incorrect: 7 },
    { step: "Dis Process Explaination inc TAT", completed: 70, missed: 20, incorrect: 10 },
];

const pwoSteps = [
    { step: "Greet patient/attendant politely while interacting", completed: 95, missed: 2, incorrect: 3 },
    { step: "Introduce self as Patient Welfare Officer and explain role", completed: 90, missed: 5, incorrect: 5 },
    { step: "Ask patient/attendant if they have any grievances or concerns", completed: 82, missed: 10, incorrect: 8 },
    { step: "Record grievance in the grievance management portal", completed: 75, missed: 15, incorrect: 10 },
    { step: "Escalate grievances/complaints to the concerned departmental HODs", completed: 68, missed: 22, incorrect: 10 },
];

export default function SOPDropoff({ selectedScenario }: SOPDropoffProps) {
    let data = cashFCSteps;
    if (selectedScenario === "Pre-OP & Day Care Admission") data = preOPSteps;
    else if (selectedScenario === "Room Admission") data = roomAdmissionSteps;
    else if (selectedScenario === "Discharge") data = dischargeSteps;
    else if (selectedScenario === "PWO") data = pwoSteps;

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Granular SOP Execution Status</h3>
                <span className={styles.subtitle}>Execution breakdown for: <strong>{selectedScenario && selectedScenario !== "All Scenarios" ? selectedScenario : "Cash FC"}</strong></span>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>SOP Step Description</th>
                            <th className={styles.centerCol}>Completed</th>
                            <th className={styles.centerCol}>Incorrect</th>
                            <th className={styles.centerCol}>Missed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index} className={styles.tableRow}>
                                <td>
                                    <div className={styles.stepInfo}>
                                        <span className={styles.stepNumber}>{index + 1}</span>
                                        <span className={styles.stepText}>{item.step}</span>
                                    </div>
                                </td>
                                <td className={styles.centerCol}>
                                    <span className={styles.badgeCompleted}>{item.completed}%</span>
                                </td>
                                <td className={styles.centerCol}>
                                    <span className={styles.badgeIncorrect}>{item.incorrect}%</span>
                                </td>
                                <td className={styles.centerCol}>
                                    <span className={styles.badgeMissed}>{item.missed}%</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
