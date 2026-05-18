import type { CaseGeneralInformation, CaseWorkflowMeta } from '../domain/objectRefs';

export type SbliCaseWorkflowGiRecord = {
  workflowMeta: CaseWorkflowMeta;
  generalInformation: CaseGeneralInformation;
};

export const SBLI_CASE_WORKFLOW_GI_RECORDS: Record<string, SbliCaseWorkflowGiRecord> = {
  "CD26-5546112": {
    "workflowMeta": {
      "caseId": "CD26-5546112",
      "type": "CD",
      "subtype": "disability_benefit",
      "breadcrumb": "Claim · Waiver of premium",
      "status": "Pending decision",
      "statusClass": "pending_decision",
      "assignee": "Victor Ramon",
      "contextBar": [
        {
          "slot": 1,
          "label": "Claimant",
          "value": "Billy Bud",
          "sub": null,
          "valueColor": null
        },
        {
          "slot": 2,
          "label": "Policy",
          "value": "SBLI Term Life 20",
          "sub": "SBLI-TL-2021-004821",
          "subType": "reference_link",
          "valueColor": null
        },
        {
          "slot": 3,
          "label": "Monthly premium",
          "value": "$38/month",
          "sub": "WOP rider — waiver pending",
          "subType": "descriptor",
          "valueColor": null,
          "rationale": "This is a WOP disability claim — the relevant financial figure is the monthly premium being waived, not a death benefit payout"
        },
        {
          "slot": 4,
          "label": "SLA",
          "value": "Today",
          "sub": null,
          "valueColor": "danger"
        }
      ],
      "subwayStages": [
        {
          "order": 1,
          "name": "FNOL received",
          "slug": "fnol_received",
          "state": "done",
          "subLabel": null
        },
        {
          "order": 2,
          "name": "Initial triage",
          "slug": "initial_triage",
          "state": "done",
          "subLabel": null
        },
        {
          "order": 3,
          "name": "Req. gathering",
          "slug": "req_gathering",
          "state": "done",
          "subLabel": null
        },
        {
          "order": 4,
          "name": "Medical review",
          "slug": "medical_review",
          "state": "done",
          "subLabel": null
        },
        {
          "order": 5,
          "name": "Decision",
          "slug": "decision",
          "state": "active",
          "subLabel": "Ready"
        }
      ],
      "tabs": [
        "General information",
        "Requirements",
        "Tasks",
        "Documents",
        "Communications",
        "Relationships",
        "Activities"
      ],
      "headerActions": [
        {
          "label": "Decision",
          "type": "primary"
        },
        {
          "label": "Create task",
          "type": "secondary",
          "icon": "plus"
        }
      ]
    },
    "generalInformation": {
      "sections": [],
      "aiSummary": {
        "text": "Billy Bud, insured under SBLI Term Life 20 ($500,000 / 20-year, issued Mar 2021), filed a Waiver of Premium claim following a motorcycle accident Jan 30, 2026. Total disability confirmed. 90-day waiting period satisfied Apr 30, 2026. All medical evidence received. No exclusions triggered. Ready for approval decision.",
        "confidence": 91,
        "generatedAt": "2026-05-14"
      },
      "cards": [
        {
          "id": "insured_policy",
          "title": "Insured & policy",
          "type": "key_value_grid",
          "layout": "2_col",
          "fields": [
            {
              "label": "Insured",
              "value": "Billy Bud"
            },
            {
              "label": "Date of birth",
              "value": "12 Mar 1984"
            },
            {
              "label": "Policy number",
              "value": "SBLI-TL-2021-004821"
            },
            {
              "label": "Product",
              "value": "SBLI Term Life 20"
            },
            {
              "label": "Death benefit",
              "value": "$500,000"
            },
            {
              "label": "Term",
              "value": "20 years (2021–2041)"
            },
            {
              "label": "Monthly premium",
              "value": "$38/month"
            },
            {
              "label": "Policy status",
              "value": "In force",
              "valueType": "pill_success"
            }
          ]
        },
        {
          "id": "claim_information",
          "title": "Claim information",
          "type": "key_value_grid",
          "layout": "2_col",
          "fields": [
            {
              "label": "Claim number",
              "value": "CD26-5546112"
            },
            {
              "label": "Sub-type",
              "value": "Waiver of premium"
            },
            {
              "label": "Rider",
              "value": "Waiver of Premium rider"
            },
            {
              "label": "Date of loss",
              "value": "30 Jan 2026"
            },
            {
              "label": "Waiting period end",
              "value": "30 Apr 2026"
            },
            {
              "label": "Cause",
              "value": "Motorcycle accident"
            },
            {
              "label": "Diagnosis (ICD-10)",
              "value": "S82.2 · M17.1"
            },
            {
              "label": "Exclusion triggered",
              "value": "None",
              "valueType": "pill_success"
            }
          ]
        },
        {
          "id": "disability_occupation",
          "title": "Disability & occupation assessment",
          "type": "key_value_grid",
          "layout": "4_col",
          "fields": [
            {
              "label": "Occupation",
              "value": "Motorcycle courier"
            },
            {
              "label": "Occ. class",
              "value": "Class 4 (manual)"
            },
            {
              "label": "Total disability",
              "value": "Confirmed",
              "valueType": "pill_success"
            },
            {
              "label": "Unable to work for profit",
              "value": "Confirmed",
              "valueType": "pill_success"
            },
            {
              "label": "Last day worked",
              "value": "30 Jan 2026"
            },
            {
              "label": "Employer",
              "value": "FastRoute Couriers Ltd"
            },
            {
              "label": "Rehab potential",
              "value": "Moderate",
              "valueType": "pill_warning"
            },
            {
              "label": "RTW target",
              "value": "TBD post-decision"
            }
          ]
        }
      ],
      "collapsibles": [
        {
          "id": "full_coverage",
          "title": "Insured — full coverage details",
          "subtitle": "Policy, riders, beneficiaries"
        },
        {
          "id": "premium_waiver_schedule",
          "title": "Premium waiver schedule",
          "subtitle": "Projected premiums waived pending approval"
        },
        {
          "id": "policy_riders",
          "title": "Policy riders on file",
          "subtitle": "Waiver of premium · Accidental death benefit · LegacyShield"
        }
      ]
    }
  },
  "CD44-6679812": {
    "workflowMeta": {
      "caseId": "CD44-6679812",
      "type": "CD",
      "subtype": "death_benefit",
      "breadcrumb": "Claim · Death benefit",
      "status": "Pending decision",
      "statusClass": "pending_decision",
      "assignee": "Victor Ramon",
      "contextBar": [
        {
          "slot": 1,
          "label": "Beneficiary",
          "value": "Marie Dupont",
          "sub": null,
          "valueColor": null,
          "rationale": "This is a death benefit claim — the active person is the beneficiary, not the insured (deceased)"
        },
        {
          "slot": 2,
          "label": "Policy",
          "value": "SBLI Term Life 20",
          "sub": "SBLI-TL-2019-009102",
          "subType": "reference_link",
          "valueColor": null
        },
        {
          "slot": 3,
          "label": "Payout",
          "value": "$500,000 ACH",
          "sub": "Pending contestability sign-off",
          "subType": "descriptor",
          "valueColor": null,
          "rationale": "Death benefit claim — payout amount and method is the key financial fact; labeled Payout (not Death benefit) to indicate it's in motion"
        },
        {
          "slot": 4,
          "label": "SLA",
          "value": "3d remaining",
          "sub": null,
          "valueColor": "warning"
        }
      ],
      "subwayStages": [
        {
          "order": 1,
          "name": "FNOL received",
          "slug": "fnol_received",
          "state": "done",
          "subLabel": null
        },
        {
          "order": 2,
          "name": "Initial triage",
          "slug": "initial_triage",
          "state": "done",
          "subLabel": null
        },
        {
          "order": 3,
          "name": "Req. gathering",
          "slug": "req_gathering",
          "state": "done",
          "subLabel": null
        },
        {
          "order": 4,
          "name": "Contestability review",
          "slug": "contestability_review",
          "state": "active",
          "subLabel": "Active"
        },
        {
          "order": 5,
          "name": "Decision",
          "slug": "decision",
          "state": "next",
          "subLabel": null
        }
      ],
      "tabs": [
        "General information",
        "Requirements",
        "Tasks",
        "Documents",
        "Communications",
        "Relationships",
        "Activities"
      ],
      "headerActions": [
        {
          "label": "Decision",
          "type": "primary"
        },
        {
          "label": "Create task",
          "type": "secondary",
          "icon": "plus"
        }
      ]
    },
    "generalInformation": {
      "sections": [],
      "aiSummary": {
        "text": "Death benefit claim filed Feb 3, 2026 by Marie Dupont (spouse/primary beneficiary) following death of insured Thomas Dupont on Jan 28, 2026. Cause: acute myocardial infarction. Policy in force 6y 11m — contestability lapsed. APS, toxicology, and identity verification complete. No exclusions. MIB comparison clean — human sign-off pending. Ready for $500k ACH payout decision.",
        "confidence": 96,
        "generatedAt": "2026-05-10"
      },
      "cards": [
        {
          "id": "deceased_insured_policy",
          "title": "Deceased insured & policy",
          "type": "key_value_grid",
          "layout": "2_col",
          "fields": [
            {
              "label": "Insured (deceased)",
              "value": "Thomas Dupont"
            },
            {
              "label": "Date of death",
              "value": "28 Jan 2026"
            },
            {
              "label": "Policy number",
              "value": "SBLI-TL-2019-009102"
            },
            {
              "label": "Product",
              "value": "SBLI Term Life 20"
            },
            {
              "label": "Death benefit",
              "value": "$500,000"
            },
            {
              "label": "Issue date",
              "value": "Feb 2019"
            },
            {
              "label": "Status at death",
              "value": "In force",
              "valueType": "pill_success"
            },
            {
              "label": "Contestability lapsed",
              "value": "Yes — 6y 11m",
              "valueType": "pill_success"
            }
          ]
        },
        {
          "id": "claim_information",
          "title": "Claim information",
          "type": "key_value_grid",
          "layout": "2_col",
          "fields": [
            {
              "label": "Claim number",
              "value": "CD44-6679812"
            },
            {
              "label": "Sub-type",
              "value": "Death benefit"
            },
            {
              "label": "Claim filed",
              "value": "03 Feb 2026"
            },
            {
              "label": "Cause of death",
              "value": "Acute myocardial infarction"
            },
            {
              "label": "ICD-10",
              "value": "I21.9"
            },
            {
              "label": "Manner of death",
              "value": "Natural"
            },
            {
              "label": "Exclusions identified",
              "value": "None",
              "valueType": "pill_success"
            },
            {
              "label": "Accel. death benefit",
              "value": "N/A — death",
              "valueType": "pill_neutral"
            }
          ]
        },
        {
          "id": "beneficiary_information",
          "title": "Beneficiary information",
          "type": "key_value_grid",
          "layout": "4_col",
          "fields": [
            {
              "label": "Primary beneficiary",
              "value": "Marie Dupont"
            },
            {
              "label": "Relationship",
              "value": "Spouse"
            },
            {
              "label": "Share",
              "value": "100%"
            },
            {
              "label": "Identity verified",
              "value": "Confirmed",
              "valueType": "pill_success"
            },
            {
              "label": "Address",
              "value": "412 Maple St, Portland, OR"
            },
            {
              "label": "Payment method",
              "value": "ACH bank transfer"
            },
            {
              "label": "Bank verified",
              "value": "Confirmed",
              "valueType": "pill_success"
            },
            {
              "label": "Contingent beneficiary",
              "value": "Sophie Dupont (daughter)"
            }
          ]
        }
      ],
      "collapsibles": [
        {
          "id": "policy_riders",
          "title": "Policy riders on file",
          "subtitle": "Accelerated death benefit · Accidental death benefit · LegacyShield"
        },
        {
          "id": "contestability_detail",
          "title": "Contestability review detail",
          "subtitle": "Application disclosures vs. MIB — AI comparison complete, no discrepancies"
        },
        {
          "id": "payment_disbursement",
          "title": "Payment & disbursement",
          "subtitle": "$500,000 ACH payout — pending contestability sign-off"
        }
      ]
    }
  },
  "NB66-7622343": {
    "workflowMeta": {
      "caseId": "NB66-7622343",
      "type": "NB",
      "subtype": "full_underwriting",
      "breadcrumb": "New business · Full underwriting",
      "status": "Active",
      "statusClass": "active",
      "assignee": "Victor Ramon",
      "contextBar": [
        {
          "slot": 1,
          "label": "Applicant",
          "value": "Marc Tremblay",
          "sub": null,
          "valueColor": null
        },
        {
          "slot": 2,
          "label": "Product",
          "value": "SBLI Term Life 20",
          "sub": "APP-7622343",
          "subType": "reference_link",
          "valueColor": null
        },
        {
          "slot": 3,
          "label": "UW path",
          "value": "Traditional",
          "sub": "+75 debits — rated offer likely",
          "subType": "descriptor",
          "valueColor": "warning",
          "rationale": "NB full UW case — the UW path and preliminary risk rating is what the assessor needs at a glance, not a death benefit figure"
        },
        {
          "slot": 4,
          "label": "SLA",
          "value": "5d remaining",
          "sub": null,
          "valueColor": null
        }
      ],
      "subwayStages": [
        {
          "order": 1,
          "name": "App. received",
          "slug": "application_received",
          "state": "done",
          "subLabel": null
        },
        {
          "order": 2,
          "name": "Initial review",
          "slug": "initial_review",
          "state": "done",
          "subLabel": null
        },
        {
          "order": 3,
          "name": "Req. gathering",
          "slug": "req_gathering",
          "state": "active",
          "subLabel": "In progress"
        },
        {
          "order": 4,
          "name": "UW review",
          "slug": "underwriting_review",
          "state": "next",
          "subLabel": null
        },
        {
          "order": 5,
          "name": "Decision",
          "slug": "decision",
          "state": "next",
          "subLabel": null
        }
      ],
      "tabs": [
        "General information",
        "Requirements",
        "Scoring",
        "Tasks",
        "Documents",
        "Communications",
        "Relationships",
        "Activities"
      ],
      "headerActions": [
        {
          "label": "Decision",
          "type": "primary"
        },
        {
          "label": "Create task",
          "type": "secondary",
          "icon": "plus"
        }
      ]
    },
    "generalInformation": {
      "sections": [],
      "aiSummary": {
        "text": "Marc Tremblay, age 42, applied for SBLI Term Life 20 — $625,000 death benefit, 20-year term via SBLI broker network. Non-smoker, BMI 27.4. Disclosed T2 Diabetes (2019, diet-controlled, HbA1c 48 mmol/mol). MIB hit: prior decline 2022 — disqualifies accelerated UW. Paramedical exam scheduled May 19. APS outstanding. Preliminary scoring: +75 debits — rated offer anticipated.",
        "confidence": 88,
        "generatedAt": "2026-05-13"
      },
      "cards": [
        {
          "id": "application_intake",
          "title": "Application intake",
          "type": "key_value_grid",
          "layout": "2_col",
          "fields": [
            {
              "label": "Applicant",
              "value": "Marc Tremblay"
            },
            {
              "label": "Date of birth",
              "value": "03 Jun 1983"
            },
            {
              "label": "Application date",
              "value": "12 May 2026"
            },
            {
              "label": "Channel",
              "value": "SBLI broker network"
            },
            {
              "label": "Product",
              "value": "SBLI Term Life 20"
            },
            {
              "label": "Death benefit",
              "value": "$625,000"
            },
            {
              "label": "Premium (indicative)",
              "value": "$85/month"
            },
            {
              "label": "UW path",
              "value": "Traditional (MIB flag)",
              "valueType": "pill_warning"
            }
          ]
        },
        {
          "id": "insured_health_profile",
          "title": "Insured health profile",
          "type": "key_value_grid",
          "layout": "2_col",
          "fields": [
            {
              "label": "Height / Weight",
              "value": "5'10\" / 192 lb"
            },
            {
              "label": "BMI",
              "value": "27.4 — Overweight",
              "valueHighlight": "warning"
            },
            {
              "label": "Smoker status",
              "value": "Non-smoker",
              "valueType": "pill_success"
            },
            {
              "label": "Disclosed condition",
              "value": "T2 Diabetes (2019)"
            },
            {
              "label": "HbA1c",
              "value": "48 mmol/mol (2025)"
            },
            {
              "label": "Medication",
              "value": "Metformin 500mg"
            },
            {
              "label": "MIB flag",
              "value": "Prior decline 2022",
              "valueType": "pill_warning"
            },
            {
              "label": "Family history",
              "value": "Father: MI age 58"
            }
          ]
        },
        {
          "id": "ai_scoring_summary",
          "title": "AI debit/credit scoring summary",
          "type": "scoring_bar_chart",
          "aiGenerated": true,
          "summary": "+75 debits — rated offer anticipated",
          "summaryStatus": "warning",
          "note": "Pending: blood profile, paramedical exam, APS. Final rating subject to change.",
          "factors": [
            {
              "name": "Type 2 Diabetes (diet-controlled)",
              "direction": "debit",
              "points": "+50",
              "barPct": 70
            },
            {
              "name": "BMI 27.4",
              "direction": "debit",
              "points": "+25",
              "barPct": 30
            },
            {
              "name": "Non-smoker (verified Rx)",
              "direction": "credit",
              "points": "-30",
              "barPct": 40
            },
            {
              "name": "HbA1c 48 — well controlled",
              "direction": "credit",
              "points": "-20",
              "barPct": 25
            },
            {
              "name": "MIB prior decline — unresolved",
              "direction": "debit",
              "points": "+50 ⚠",
              "barPct": 60
            },
            {
              "name": "Father MI age 58",
              "direction": "debit",
              "points": "+15 est.",
              "barPct": 20
            }
          ]
        },
        {
          "id": "riders_selected",
          "title": "Riders selected",
          "type": "key_value_grid",
          "layout": "2_col",
          "fields": [
            {
              "label": "Accelerated death benefit",
              "value": "Included free",
              "valueType": "pill_success"
            },
            {
              "label": "Up to",
              "value": "50% of face amount (terminal illness)"
            },
            {
              "label": "Waiver of premium",
              "value": "Selected",
              "valueType": "pill_info"
            },
            {
              "label": "Accidental death benefit",
              "value": "Selected",
              "valueType": "pill_info"
            }
          ]
        },
        {
          "id": "beneficiary",
          "title": "Beneficiary",
          "type": "key_value_grid",
          "layout": "2_col",
          "fields": [
            {
              "label": "Primary beneficiary",
              "value": "Claire Tremblay (spouse)"
            },
            {
              "label": "Share",
              "value": "70%"
            },
            {
              "label": "Contingent beneficiary",
              "value": "Thomas Tremblay (child)"
            },
            {
              "label": "Share",
              "value": "30%"
            }
          ]
        }
      ],
      "collapsibles": [
        {
          "id": "conversion_option",
          "title": "Conversion option",
          "subtitle": "Eligible to convert to SBLI Whole Life before age 70 — no new medical exam required"
        },
        {
          "id": "application_full_detail",
          "title": "Application — full disclosure detail",
          "subtitle": "Health declarations, beneficiary designations, agent information"
        }
      ]
    }
  },
  "NB98-9989870": {
    "workflowMeta": {
      "caseId": "NB98-9989870",
      "type": "NB",
      "subtype": "simplified_underwriting",
      "breadcrumb": "New business · Simplified underwriting",
      "status": "Active",
      "statusClass": "active",
      "assignee": "Richard Daniels",
      "contextBar": [
        {
          "slot": 1,
          "label": "Applicant",
          "value": "Elena Rossi",
          "sub": null,
          "valueColor": null
        },
        {
          "slot": 2,
          "label": "Product",
          "value": "SBLI Simple Term Life",
          "sub": "APP-998987",
          "subType": "reference_link",
          "valueColor": null
        },
        {
          "slot": 3,
          "label": "UW path",
          "value": "Accelerated",
          "sub": "No exam · Same-day eligible",
          "subType": "descriptor",
          "valueColor": null,
          "rationale": "NB simplified UW case — the accelerated no-exam path is the key distinguishing fact; same-day eligibility is the most actionable info for the assessor"
        },
        {
          "slot": 4,
          "label": "SLA",
          "value": "2d remaining",
          "sub": null,
          "valueColor": "warning"
        }
      ],
      "subwayStages": [
        {
          "order": 1,
          "name": "App. received",
          "slug": "application_received",
          "state": "done",
          "subLabel": null
        },
        {
          "order": 2,
          "name": "Tele-interview",
          "slug": "tele_interview",
          "state": "active",
          "subLabel": "Pending"
        },
        {
          "order": 3,
          "name": "Questionnaire review",
          "slug": "questionnaire_review",
          "state": "next",
          "subLabel": null
        },
        {
          "order": 4,
          "name": "Decision",
          "slug": "decision",
          "state": "next",
          "subLabel": null
        }
      ],
      "tabs": [
        "General information",
        "Requirements",
        "Scoring",
        "Tasks",
        "Documents",
        "Communications",
        "Relationships",
        "Activities"
      ],
      "headerActions": [
        {
          "label": "Decision",
          "type": "primary"
        },
        {
          "label": "Create task",
          "type": "secondary",
          "icon": "plus"
        }
      ]
    },
    "generalInformation": {
      "sections": [],
      "aiSummary": {
        "text": "Elena Rossi, age 35, applied online for SBLI Simple Term Life — $350,000 death benefit, 20-year term. Accelerated UW path confirmed: age 18–50 ✓, coverage under $1M ✓, no adverse disclosures ✓, no MIB alerts ✓. Same-day coverage eligible pending tele-interview May 17. LegacyShield digital vault activated. Anticipated clean pass — standard rates likely.",
        "confidence": 95,
        "generatedAt": "2026-05-13"
      },
      "cards": [
        {
          "id": "application_intake",
          "title": "Application intake",
          "type": "key_value_grid",
          "layout": "2_col",
          "fields": [
            {
              "label": "Applicant",
              "value": "Elena Rossi"
            },
            {
              "label": "Date of birth",
              "value": "22 Jan 1991"
            },
            {
              "label": "Application date",
              "value": "13 May 2026"
            },
            {
              "label": "Channel",
              "value": "Direct — SBLI.com"
            },
            {
              "label": "Product",
              "value": "SBLI Simple Term Life"
            },
            {
              "label": "Death benefit",
              "value": "$350,000"
            },
            {
              "label": "Term",
              "value": "20 years"
            },
            {
              "label": "UW path",
              "value": "Accelerated — no exam",
              "valueType": "pill_info"
            }
          ]
        },
        {
          "id": "accelerated_uw_eligibility",
          "title": "Accelerated UW eligibility",
          "type": "key_value_grid",
          "layout": "2_col",
          "fields": [
            {
              "label": "Age (18–50 limit)",
              "value": "35",
              "badge": "Pass",
              "badgeType": "success"
            },
            {
              "label": "Coverage (≤$1M limit)",
              "value": "$350,000",
              "badge": "Pass",
              "badgeType": "success"
            },
            {
              "label": "Adverse disclosures",
              "value": "None",
              "valueType": "pill_success"
            },
            {
              "label": "MIB alert",
              "value": "None",
              "valueType": "pill_success"
            },
            {
              "label": "Smoker status",
              "value": "Non-smoker",
              "valueType": "pill_success"
            },
            {
              "label": "BMI (self-declared)",
              "value": "23.1 — Normal"
            },
            {
              "label": "Medical exam required",
              "value": "No",
              "valueType": "pill_neutral"
            },
            {
              "label": "Same-day coverage",
              "value": "Eligible",
              "valueType": "pill_success"
            }
          ]
        },
        {
          "id": "riders_included",
          "title": "Riders included",
          "type": "key_value_grid",
          "layout": "2_col",
          "fields": [
            {
              "label": "Accelerated death benefit",
              "value": "Included free",
              "valueType": "pill_success"
            },
            {
              "label": "Up to",
              "value": "50% of face amount (terminal illness)"
            },
            {
              "label": "LegacyShield digital vault",
              "value": "Included free",
              "valueType": "pill_success"
            },
            {
              "label": "Purpose",
              "value": "Estate planning & document storage"
            }
          ]
        },
        {
          "id": "beneficiary",
          "title": "Beneficiary",
          "type": "key_value_grid",
          "layout": "2_col",
          "fields": [
            {
              "label": "Primary beneficiary",
              "value": "Marco Rossi (spouse)"
            },
            {
              "label": "Share",
              "value": "100%"
            },
            {
              "label": "Contingent beneficiary",
              "value": "Not designated"
            },
            {
              "label": "LegacyShield vault",
              "value": "Activated",
              "valueType": "pill_success"
            }
          ]
        }
      ],
      "collapsibles": [
        {
          "id": "conversion_option",
          "title": "Conversion option",
          "subtitle": "Eligible to convert to SBLI Whole Life before age 70 — no new medical exam required"
        },
        {
          "id": "application_full_detail",
          "title": "Application — full submission detail",
          "subtitle": "Health declarations, coverage selections, beneficiary designations"
        }
      ]
    }
  }
};
