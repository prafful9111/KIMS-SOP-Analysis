export interface SOPStepMaster {
    id: string;
    text: string;
    isCritical?: boolean;
}

export const OFFICIAL_SOP_STEPS: Record<string, SOPStepMaster[]> = {
    "Financial Counselling": [
        { id: "fc_1", text: "Greet, Offer Seat & Refreshments" },
        { id: "fc_2", text: "Introduce Self & State Purpose (Financial Estimate)" },
        { id: "fc_3", text: "Cross-verify Patient Details & Request OP Slip/Admission Form" },
        { id: "fc_4", text: "Call Doctor for Estimate Clarity/Confirmation" },
        { id: "fc_5", text: "Explain Room Types, Amenities & Tariffs" },
        { id: "fc_6", text: "Specify Treatment Type (Medical/Surgical Pkg/Open Bill)" },
        { id: "fc_7", text: "Explain Billing Heads (Room [24h+3h grace], Pharmacy, Prof Fees, etc.)" },
        { id: "fc_8", text: "Provide Standard Disclaimers" },
        { id: "fc_9", text: "Cash Advance Request (Full module amount if Cash Payer)" },
        { id: "fc_10", text: "Provide Contact Number for Concerns (2233)" },
        { id: "fc_ins_1", text: "Insurance: Request Policy Card, Sum Insured & Prior Usage" },
        { id: "fc_ins_2", text: "Insurance: Check/Explain Co-pay & Inform NMEs are paid by patient" },
        { id: "fc_ins_3", text: "Insurance: Request NME Advance ONLY (Rs 5000 - 10000)" },
        { id: "fc_ins_4", text: "Insurance: Explain Coverage Impacts (Room change, partial approval, enhancements)" },
        { id: "fc_ins_5", text: "Insurance: Request Signatures and OTPs" },
        { id: "fc_closure", text: "Closure: Explain Housekeeping Escort to Room" }
    ],
    "Pre-OP & Day Care Admission": [
        { id: "pre_1", text: "Greet patient/attendant politely at admission counter" },
        { id: "pre_2", text: "Introduce self and department" },
        { id: "pre_3", text: "Ask reason for admission and collect patient details" },
        { id: "pre_4", text: "Confirm doctor admission advice / admission slip" },
        { id: "pre_5", text: "Capture patient details in HIS" },
        { id: "pre_6", text: "Verify availability of bed category" },
        { id: "pre_7", text: "Inform patient about room tariff & deposit" },
        { id: "pre_8", text: "Confirm payment mode (Cash / Insurance / Corporate)" },
        { id: "pre_9", text: "Verify insurance eligibility / TPA details" },
        { id: "pre_10", text: "Ensure required consent forms are signed" },
        { id: "pre_11", text: "Collect admission deposit as per policy" },
        { id: "pre_12", text: "Complete admission entry in hospital system" },
        { id: "pre_13", text: "Ensure patient identification (Admission ID / Wrist Band)" },
        { id: "pre_14", text: "Inform ward about patient admission" },
        { id: "pre_15", text: "Guide patient/attendant to the assigned room" },
        { id: "pre_16", text: "Ensure proper handover to nursing staff" }
    ],
    "Room Admission": [
        { id: "rm_1", text: "Greet patient/attender at admission counter" },
        { id: "rm_2", text: "Introduce self and role" },
        { id: "rm_3", text: "Confirm admission type and doctor advice" },
        { id: "rm_4", text: "Verify payment eligibility / insurance eligibility" },
        { id: "rm_5", text: "Allocate room based on availability & eligibility" },
        { id: "rm_6", text: "Explain room tariff and deposit" },
        { id: "rm_7", text: "Arrange transport or GSA to escort patient" },
        { id: "rm_8", text: "Ensure patient & attender reach room safely" },
        { id: "rm_9", text: "Admission executive completes documentation in room" },
        { id: "rm_10", text: "Collect Aadhaar, insurance papers & required forms" },
        { id: "rm_11", text: "Complete admission consent and deposit process" },
        { id: "rm_12", text: "Admission System Registration" },
        { id: "rm_13", text: "Inform ward / nursing team of new admission" },
        { id: "rm_14", text: "Ensure smooth patient handover to ward staff" }
    ]
};

export const MAPPED_SCENARIOS: Record<string, string> = {
    "d25f37c0-7a5c-4a8d-93b9-c75ec59c0bcd": "Financial Counselling",
    "5": "Pre-OP & Day Care Admission",
    "6": "Room Admission"
};
