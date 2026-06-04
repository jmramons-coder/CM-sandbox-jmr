import type { DatasetDocumentRecord, DatasetRequirementRecord, DatasetTaskRecord } from './multi-case-dataset';

export const SBLI_REQUIREMENT_RECORDS: DatasetRequirementRecord[] = [
  {
    "id": "req_bb_001",
    "kind": "requirement",
    "label": "FNOL — WOP claim form",
    "category": "Documentation",
    "status": "fulfilled",
    "stage": "fnol_received",
    "rag": "Green",
    "dueDate": "2026-01-30",
    "followUpDate": "2026-01-30",
    "source": "claimant_portal",
    "sourceType": "system",
    "responsibleParty": "Billy Bud (claimant)",
    "notes": "WOP form submitted by claimant via portal",
    "aiSummary": "FNOL form complete. All mandatory fields present. Total disability and accident date declared. Claim reference issued and registered in Amplify.",
    "fulfillmentCriteria": [
      "Completed SBLI WOP claim form received",
      "Claimant signature present",
      "Date of disability declared",
      "Cause of disability stated",
      "Policy number referenced"
    ],
    "linkedDocs": [
      "doc_wop_form_cd26"
    ],
    "linkedTasks": [
      "task_cd5180"
    ],
    "blockingImpact": null,
    "context": {
      "type": "claim",
      "label": "Claim context",
      "description": "WOP claim opened for Billy Bud following motorcycle accident Jan 30, 2026. FNOL is the entry point for the full claims workflow.",
      "kv": [
        {
          "label": "Case",
          "value": "CD26-5546112"
        },
        {
          "label": "Date of loss",
          "value": "Jan 30, 2026"
        },
        {
          "label": "Sub-type",
          "value": "Waiver of premium"
        }
      ]
    },
    "history": [
      {
        "date": "2026-01-30",
        "action": "Requirement fulfilled — WOP claim form received via portal",
        "user": "System",
        "dot": "green"
      },
      {
        "date": "2026-01-30",
        "action": "Requirement created — FNOL stage triggered on case creation",
        "user": "System",
        "dot": "blue"
      }
    ],
    "trigger": "Claim context",
    "requirementRef": "req_bb_001",
    "phase": "pre-approval",
    "workflowStepId": "fnol_received",
    "aiInsight": true,
    "aiConfidence": 94,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "Claim — Waiver of Premium"
      },
      {
        "kind": "document",
        "id": "doc_wop_form_cd26",
        "label": "doc_wop_form_cd26"
      },
      {
        "kind": "task",
        "id": "task_cd5180",
        "label": "task_cd5180"
      }
    ]
  },
  {
    "id": "req_bb_002",
    "kind": "requirement",
    "label": "Policy & rider verification",
    "category": "Compliance",
    "status": "fulfilled",
    "stage": "initial_triage",
    "rag": "Green",
    "dueDate": "2026-02-02",
    "followUpDate": "2026-02-02",
    "source": "policy_admin",
    "sourceType": "system",
    "responsibleParty": "System (auto-verified)",
    "notes": "WOP rider confirmed active since policy issue Mar 2021",
    "aiSummary": "Policy SBLI-TL-2021-004821 confirmed in force on date of loss. Waiver of Premium rider active since Mar 2021. No exclusions apply to declared cause of disability.",
    "fulfillmentCriteria": [
      "Policy confirmed in force on date of loss",
      "WOP rider confirmed active",
      "No relevant exclusions identified",
      "Policy not lapsed or surrendered"
    ],
    "linkedDocs": [
      "doc_policy_cd26"
    ],
    "linkedTasks": [
      "task_cd5181"
    ],
    "blockingImpact": null,
    "context": {
      "type": "policy",
      "label": "Policy context",
      "description": "SBLI Term Life 20 — $500,000 death benefit, 20-year term. WOP rider active since policy issue Mar 2021.",
      "kv": [
        {
          "label": "Policy",
          "value": "SBLI-TL-2021-004821"
        },
        {
          "label": "WOP rider",
          "value": "Active since Mar 2021"
        },
        {
          "label": "Premium",
          "value": "$38/month"
        }
      ]
    },
    "history": [
      {
        "date": "2026-02-01",
        "action": "Requirement fulfilled — auto-verified from policy admin system",
        "user": "System",
        "dot": "green"
      },
      {
        "date": "2026-01-30",
        "action": "Requirement created — initial triage stage",
        "user": "System",
        "dot": "blue"
      }
    ],
    "trigger": "Policy context",
    "requirementRef": "req_bb_002",
    "phase": "pre-approval",
    "workflowStepId": "initial_triage",
    "aiInsight": true,
    "aiConfidence": 94,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "Claim — Waiver of Premium"
      },
      {
        "kind": "document",
        "id": "doc_policy_cd26",
        "label": "doc_policy_cd26"
      },
      {
        "kind": "task",
        "id": "task_cd5181",
        "label": "task_cd5181"
      }
    ]
  },
  {
    "id": "req_bb_003",
    "kind": "requirement",
    "label": "Employer inability-to-work confirmation",
    "category": "Employment",
    "status": "fulfilled",
    "stage": "requirement_gathering",
    "rag": "Green",
    "dueDate": "2026-02-10",
    "followUpDate": "2026-02-10",
    "source": "employer_portal",
    "sourceType": "external",
    "responsibleParty": "FastRoute Couriers HR",
    "notes": "FastRoute Couriers HR confirmed Billy Bud last worked Jan 30, 2026",
    "aiSummary": "Employer confirmation received. Last day worked Jan 30, 2026 confirmed. No return to work scheduled. Sick pay exhausted May 1, 2026. Satisfies unable-to-work-for-profit definition under WOP rider.",
    "fulfillmentCriteria": [
      "Employer confirms last day worked",
      "Employer confirms ongoing inability to work",
      "Alternative/modified duties status confirmed",
      "Confirmation on company letterhead or via portal"
    ],
    "linkedDocs": [
      "doc_employer_cd26"
    ],
    "linkedTasks": [
      "task_cd5190"
    ],
    "blockingImpact": null,
    "context": {
      "type": "person",
      "label": "Claimant context",
      "description": "Billy Bud — motorcycle courier, Class 4 manual. FastRoute Couriers Ltd. Unable to perform any delivery duties post-accident.",
      "kv": [
        {
          "label": "Occupation",
          "value": "Motorcycle courier"
        },
        {
          "label": "Employer",
          "value": "FastRoute Couriers Ltd"
        },
        {
          "label": "Last day worked",
          "value": "Jan 30, 2026"
        }
      ]
    },
    "history": [
      {
        "date": "2026-02-09",
        "action": "Requirement fulfilled — employer letter received and validated",
        "user": "System",
        "dot": "green"
      },
      {
        "date": "2026-02-05",
        "action": "Employer portal request sent",
        "user": "Victor Ramon",
        "dot": "blue"
      },
      {
        "date": "2026-02-03",
        "action": "Requirement created — requirement gathering stage",
        "user": "Victor Ramon",
        "dot": "blue"
      }
    ],
    "trigger": "Claimant context",
    "requirementRef": "req_bb_003",
    "phase": "pre-approval",
    "workflowStepId": "requirement_gathering",
    "aiInsight": true,
    "aiConfidence": 94,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "Claim — Waiver of Premium"
      },
      {
        "kind": "document",
        "id": "doc_employer_cd26",
        "label": "doc_employer_cd26"
      },
      {
        "kind": "task",
        "id": "task_cd5190",
        "label": "task_cd5190"
      }
    ]
  },
  {
    "id": "req_bb_004",
    "kind": "requirement",
    "label": "Attending Physician Statement (APS)",
    "category": "Medical",
    "status": "fulfilled",
    "stage": "requirement_gathering",
    "rag": "Green",
    "dueDate": "2026-02-20",
    "followUpDate": "2026-02-20",
    "source": "medical_provider",
    "sourceType": "medical",
    "responsibleParty": "Dr. Chen — St. Luke's Orthopedics",
    "notes": "APS from treating orthopedist confirming total disability",
    "aiSummary": "APS received from Dr. Chen. Functional limitation documented. Own-occupation definition satisfied. Total disability standard met. T2 Diabetes confirmed as unrelated to current disability episode.",
    "fulfillmentCriteria": [
      "APS on physician letterhead",
      "Total disability declaration explicit",
      "Functional limitations described",
      "Prognosis and recovery timeline included",
      "Diagnosis codes present (S82.2, M17.1)"
    ],
    "linkedDocs": [
      "doc_aps_cd26"
    ],
    "linkedTasks": [
      "task_cd5191",
      "task_cd5210",
      "task_cd5211"
    ],
    "blockingImpact": null,
    "context": {
      "type": "person",
      "label": "Medical context",
      "description": "Dr. Chen (St. Luke's Orthopedics) is the attending surgeon. APS covers post-operative functional status following right knee arthroplasty Jan 30, 2026.",
      "kv": [
        {
          "label": "Physician",
          "value": "Dr. Chen"
        },
        {
          "label": "Specialty",
          "value": "Orthopedic surgery"
        },
        {
          "label": "Diagnosis",
          "value": "S82.2 · M17.1"
        }
      ]
    },
    "history": [
      {
        "date": "2026-02-22",
        "action": "Requirement fulfilled — APS received and AI-validated",
        "user": "System",
        "dot": "green"
      },
      {
        "date": "2026-02-15",
        "action": "APS chase sent — approaching due date",
        "user": "Victor Ramon",
        "dot": "blue"
      },
      {
        "date": "2026-02-10",
        "action": "APS request sent via provider portal",
        "user": "Victor Ramon",
        "dot": "blue"
      },
      {
        "date": "2026-02-08",
        "action": "Requirement created",
        "user": "Victor Ramon",
        "dot": "blue"
      }
    ],
    "trigger": "Medical context",
    "requirementRef": "req_bb_004",
    "phase": "pre-approval",
    "workflowStepId": "requirement_gathering",
    "aiInsight": true,
    "aiConfidence": 94,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "Claim — Waiver of Premium"
      },
      {
        "kind": "document",
        "id": "doc_aps_cd26",
        "label": "doc_aps_cd26"
      },
      {
        "kind": "task",
        "id": "task_cd5191",
        "label": "task_cd5191"
      },
      {
        "kind": "task",
        "id": "task_cd5210",
        "label": "task_cd5210"
      },
      {
        "kind": "task",
        "id": "task_cd5211",
        "label": "task_cd5211"
      }
    ]
  },
  {
    "id": "req_bb_005",
    "kind": "requirement",
    "label": "Surgical Report — Right Knee",
    "category": "Medical",
    "status": "fulfilled",
    "stage": "medical_review",
    "rag": "Green",
    "dueDate": "2026-03-05",
    "followUpDate": "2026-03-05",
    "source": "medical_provider",
    "sourceType": "medical",
    "responsibleParty": "St. Luke's Hospital Records",
    "notes": "Full OR report — right knee arthroplasty Jan 30, 2026",
    "aiSummary": "Surgical report confirms total right knee arthroplasty performed Jan 30, 2026. 6–9 month recovery precludes any manual labour. Evidence supports total disability determination.",
    "fulfillmentCriteria": [
      "Official hospital surgical report",
      "Procedure type confirmed (arthroplasty)",
      "Surgeon name and credentials",
      "Post-operative prognosis and restrictions",
      "Date of surgery matches date of loss"
    ],
    "linkedDocs": [
      "doc_surgical_cd26"
    ],
    "linkedTasks": [
      "task_cd5210",
      "task_cd5211"
    ],
    "blockingImpact": null,
    "context": {
      "type": "claim",
      "label": "Disability evidence",
      "description": "Surgical report is a core piece of evidence for the medical review stage. Combined with APS, it forms the medical basis for total disability determination.",
      "kv": [
        {
          "label": "Procedure",
          "value": "Right knee arthroplasty"
        },
        {
          "label": "Date",
          "value": "Jan 30, 2026"
        },
        {
          "label": "Recovery",
          "value": "6–9 months"
        }
      ]
    },
    "history": [
      {
        "date": "2026-03-04",
        "action": "Requirement fulfilled — surgical report received and validated",
        "user": "System",
        "dot": "green"
      },
      {
        "date": "2026-02-20",
        "action": "Records request sent to St. Luke's Hospital",
        "user": "Victor Ramon",
        "dot": "blue"
      },
      {
        "date": "2026-02-15",
        "action": "Requirement created — medical review stage",
        "user": "Victor Ramon",
        "dot": "blue"
      }
    ],
    "trigger": "Disability evidence",
    "requirementRef": "req_bb_005",
    "phase": "pre-approval",
    "workflowStepId": "medical_review",
    "aiInsight": true,
    "aiConfidence": 94,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "Claim — Waiver of Premium"
      },
      {
        "kind": "document",
        "id": "doc_surgical_cd26",
        "label": "doc_surgical_cd26"
      },
      {
        "kind": "task",
        "id": "task_cd5210",
        "label": "task_cd5210"
      },
      {
        "kind": "task",
        "id": "task_cd5211",
        "label": "task_cd5211"
      }
    ]
  },
  {
    "id": "req_bb_006",
    "kind": "requirement",
    "label": "Functional Capacity Evaluation (FCE)",
    "category": "Medical",
    "status": "overdue",
    "stage": "medical_review",
    "rag": "Red",
    "dueDate": "2026-03-10",
    "followUpDate": "2026-03-10",
    "source": "specialist_upload",
    "sourceType": "medical",
    "responsibleParty": "RehabCare Services (specialist)",
    "notes": "Overdue 35 days — critical for total disability confirmation",
    "aiSummary": "FCE ordered Mar 10. Specialist appointment confirmed Mar 24. Report not yet uploaded to portal. Blocking requirement — medical review stage cannot close without it. Two chase attempts made.",
    "fulfillmentCriteria": [
      "Completed FCE report from approved provider",
      "Maximum functional capacity documented",
      "Work capacity classification (sedentary/light/medium/heavy)",
      "Functional limitations mapped to occupation class",
      "Signed by qualified FCE evaluator"
    ],
    "linkedDocs": [],
    "linkedTasks": [
      "task_cd5203"
    ],
    "blockingImpact": {
      "stage": "Medical review → Decision",
      "impact": "Medical review stage cannot be closed. Decision task (CD-5221) cannot be triggered. SLA breached by 35 days.",
      "severity": "high"
    },
    "context": {
      "type": "person",
      "label": "Claimant context",
      "description": "FCE evaluates Billy Bud's residual functional capacity post-surgery. Class 4 manual labour occupation means a high functional threshold is required for return-to-work assessment.",
      "kv": [
        {
          "label": "Occupation class",
          "value": "Class 4 (manual)"
        },
        {
          "label": "FCE provider",
          "value": "RehabCare Services"
        },
        {
          "label": "Appointment",
          "value": "Mar 24, 2026"
        }
      ]
    },
    "history": [
      {
        "date": "2026-04-15",
        "action": "Second chase sent — no response from specialist",
        "user": "Richard Daniels",
        "dot": "amber"
      },
      {
        "date": "2026-03-30",
        "action": "First chase sent — FCE overdue by 20 days",
        "user": "Richard Daniels",
        "dot": "amber"
      },
      {
        "date": "2026-03-10",
        "action": "Due date passed — no document received",
        "user": "System",
        "dot": "amber"
      },
      {
        "date": "2026-02-28",
        "action": "FCE authorization sent to RehabCare",
        "user": "Victor Ramon",
        "dot": "blue"
      },
      {
        "date": "2026-02-25",
        "action": "Requirement created — medical review stage",
        "user": "Victor Ramon",
        "dot": "blue"
      }
    ],
    "trigger": "Claimant context",
    "requirementRef": "req_bb_006",
    "phase": "pre-approval",
    "workflowStepId": "medical_review",
    "aiInsight": true,
    "aiConfidence": 87,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "Claim — Waiver of Premium"
      },
      {
        "kind": "task",
        "id": "task_cd5203",
        "label": "task_cd5203"
      }
    ]
  },
  {
    "id": "req_bb_007",
    "kind": "requirement",
    "label": "Pre-disability Earnings Verification",
    "category": "Financial",
    "status": "overdue",
    "stage": "decision",
    "rag": "Red",
    "dueDate": "2026-05-01",
    "followUpDate": "2026-05-01",
    "source": "payroll_system",
    "sourceType": "external",
    "responsibleParty": "FastRoute Couriers Payroll",
    "notes": "Required to confirm monthly premium waiver benefit amount and benefit period",
    "aiSummary": "Earnings verification outstanding. FastRoute Couriers payroll department contacted twice. Required to confirm monthly pre-disability income to calculate the premium waiver benefit period.",
    "fulfillmentCriteria": [
      "Official payroll statement or P60 equivalent",
      "Earnings for 12 months prior to disability onset",
      "Signed by authorized payroll representative",
      "Confirms regular employment and salary grade",
      "Monthly earnings clearly stated"
    ],
    "linkedDocs": [],
    "linkedTasks": [
      "task_cd5220"
    ],
    "blockingImpact": {
      "stage": "Decision",
      "impact": "WOP approval decision (CD-5221) cannot be finalized. Monthly premium waiver amount cannot be calculated. Payout cannot be triggered.",
      "severity": "high"
    },
    "context": {
      "type": "policy",
      "label": "Benefit calculation context",
      "description": "Pre-disability earnings determine the exact monthly premium waiver amount. Policy monthly premium is $38 — verification confirms the earnings baseline for the benefit period.",
      "kv": [
        {
          "label": "Monthly premium",
          "value": "$38/month"
        },
        {
          "label": "Retroactive from",
          "value": "Jan 30, 2026"
        },
        {
          "label": "Waiting period end",
          "value": "Apr 30, 2026"
        }
      ]
    },
    "history": [
      {
        "date": "2026-05-14",
        "action": "Second chase sent to FastRoute payroll department",
        "user": "Richard Daniels",
        "dot": "amber"
      },
      {
        "date": "2026-05-05",
        "action": "First chase — due date passed May 1",
        "user": "Richard Daniels",
        "dot": "amber"
      },
      {
        "date": "2026-05-01",
        "action": "Due date passed — no document received",
        "user": "System",
        "dot": "amber"
      },
      {
        "date": "2026-04-20",
        "action": "Payroll verification request sent",
        "user": "Richard Daniels",
        "dot": "blue"
      },
      {
        "date": "2026-04-18",
        "action": "Requirement created — decision stage",
        "user": "Victor Ramon",
        "dot": "blue"
      }
    ],
    "trigger": "Benefit calculation context",
    "requirementRef": "req_bb_007",
    "phase": "pre-approval",
    "workflowStepId": "decision",
    "aiInsight": true,
    "aiConfidence": 87,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "Claim — Waiver of Premium"
      },
      {
        "kind": "task",
        "id": "task_cd5220",
        "label": "task_cd5220"
      }
    ]
  },
  {
    "id": "req_sd_001",
    "kind": "requirement",
    "label": "FNOL / Death notification",
    "category": "Documentation",
    "status": "fulfilled",
    "stage": "fnol_received",
    "rag": "Green",
    "dueDate": "2026-02-03",
    "followUpDate": "2026-02-03",
    "source": "claimant_portal",
    "sourceType": "system",
    "responsibleParty": "Marie Dupont (beneficiary)",
    "notes": "Filed by Marie Dupont via portal",
    "aiSummary": "Death notification complete. All mandatory FNOL fields present. Thomas Dupont death declared Jan 28, 2026. Marie Dupont identified as filing beneficiary.",
    "fulfillmentCriteria": [
      "FNOL form completed and signed",
      "Insured name and policy number confirmed",
      "Date and cause of death declared",
      "Beneficiary identity stated",
      "Submission via authorized channel"
    ],
    "linkedDocs": [],
    "linkedTasks": [
      "task_cd6100"
    ],
    "blockingImpact": null,
    "context": {
      "type": "claim",
      "label": "Claim context",
      "description": "Death benefit claim opened by Marie Dupont (spouse/beneficiary) following death of Thomas Dupont Jan 28, 2026.",
      "kv": [
        {
          "label": "Case",
          "value": "CD44-6679812"
        },
        {
          "label": "Date of death",
          "value": "Jan 28, 2026"
        },
        {
          "label": "Death benefit",
          "value": "$500,000"
        }
      ]
    },
    "history": [
      {
        "date": "2026-02-03",
        "action": "Requirement fulfilled — FNOL received via portal",
        "user": "System",
        "dot": "green"
      },
      {
        "date": "2026-02-03",
        "action": "Requirement created — case opened",
        "user": "System",
        "dot": "blue"
      }
    ],
    "trigger": "Claim context",
    "requirementRef": "req_sd_001",
    "phase": "pre-approval",
    "workflowStepId": "fnol_received",
    "aiInsight": true,
    "aiConfidence": 94,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "Claim — Death Benefit"
      },
      {
        "kind": "task",
        "id": "task_cd6100",
        "label": "task_cd6100"
      }
    ]
  },
  {
    "id": "req_sd_002",
    "kind": "requirement",
    "label": "Certified Death Certificate",
    "category": "Documentation",
    "status": "fulfilled",
    "stage": "initial_triage",
    "rag": "Green",
    "dueDate": "2026-02-05",
    "followUpDate": "2026-02-05",
    "source": "claimant_portal",
    "sourceType": "system",
    "responsibleParty": "Marie Dupont (beneficiary)",
    "notes": "State-issued certified copy — not photocopy",
    "aiSummary": "State-certified death certificate received. Cause: acute myocardial infarction (I21.9). Manner: natural. Date and place of death confirmed. Registrar signature present.",
    "fulfillmentCriteria": [
      "State-issued certified copy (not photocopy)",
      "Official cause of death stated with ICD-10 code",
      "Date of death matches FNOL",
      "Registrar or coroner signature present",
      "Issued within 90 days of death"
    ],
    "linkedDocs": [
      "doc_death_cert_cd44"
    ],
    "linkedTasks": [
      "task_cd6100"
    ],
    "blockingImpact": null,
    "context": {
      "type": "claim",
      "label": "Death verification",
      "description": "Certified death certificate is the primary legal document establishing the fact and cause of death for the death benefit claim.",
      "kv": [
        {
          "label": "COD",
          "value": "Acute MI (I21.9)"
        },
        {
          "label": "Manner",
          "value": "Natural"
        },
        {
          "label": "Date",
          "value": "Jan 28, 2026"
        }
      ]
    },
    "history": [
      {
        "date": "2026-02-05",
        "action": "Requirement fulfilled — certified death certificate uploaded",
        "user": "System",
        "dot": "green"
      },
      {
        "date": "2026-02-03",
        "action": "Requirement created — initial triage stage",
        "user": "System",
        "dot": "blue"
      }
    ],
    "trigger": "Death verification",
    "requirementRef": "req_sd_002",
    "phase": "pre-approval",
    "workflowStepId": "initial_triage",
    "aiInsight": true,
    "aiConfidence": 94,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "Claim — Death Benefit"
      },
      {
        "kind": "document",
        "id": "doc_death_cert_cd44",
        "label": "doc_death_cert_cd44"
      },
      {
        "kind": "task",
        "id": "task_cd6100",
        "label": "task_cd6100"
      }
    ]
  },
  {
    "id": "req_sd_003",
    "kind": "requirement",
    "label": "Attending Physician Statement (APS)",
    "category": "Medical",
    "status": "fulfilled",
    "stage": "requirement_gathering",
    "rag": "Green",
    "dueDate": "2026-02-12",
    "followUpDate": "2026-02-12",
    "source": "medical_provider",
    "sourceType": "medical",
    "responsibleParty": "Dr. Harmon — Portland Cardiology Group",
    "notes": "APS confirming COD consistent with disclosed cardiac history",
    "aiSummary": "APS from Dr. Harmon confirms cause of death is consistent with Thomas Dupont's disclosed cardiac history. No red flags or undisclosed conditions noted.",
    "fulfillmentCriteria": [
      "APS from treating or attending physician",
      "Confirms cause of death",
      "References prior medical history",
      "No contradictions with application disclosures",
      "Signed on physician letterhead"
    ],
    "linkedDocs": [
      "doc_aps_cd44"
    ],
    "linkedTasks": [
      "task_cd6110"
    ],
    "blockingImpact": null,
    "context": {
      "type": "person",
      "label": "Medical context",
      "description": "Dr. Harmon (Portland Cardiology Group) was Thomas Dupont's treating cardiologist. APS confirms cardiac history consistent with disclosed hypertension and coronary artery disease.",
      "kv": [
        {
          "label": "Physician",
          "value": "Dr. Harmon"
        },
        {
          "label": "Specialty",
          "value": "Cardiology"
        },
        {
          "label": "COD confirmed",
          "value": "Acute MI — consistent"
        }
      ]
    },
    "history": [
      {
        "date": "2026-02-11",
        "action": "Requirement fulfilled — APS received and validated",
        "user": "System",
        "dot": "green"
      },
      {
        "date": "2026-02-05",
        "action": "APS request sent via provider portal",
        "user": "Victor Ramon",
        "dot": "blue"
      },
      {
        "date": "2026-02-04",
        "action": "Requirement created",
        "user": "Victor Ramon",
        "dot": "blue"
      }
    ],
    "trigger": "Medical context",
    "requirementRef": "req_sd_003",
    "phase": "pre-approval",
    "workflowStepId": "requirement_gathering",
    "aiInsight": true,
    "aiConfidence": 94,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "Claim — Death Benefit"
      },
      {
        "kind": "document",
        "id": "doc_aps_cd44",
        "label": "doc_aps_cd44"
      },
      {
        "kind": "task",
        "id": "task_cd6110",
        "label": "task_cd6110"
      }
    ]
  },
  {
    "id": "req_sd_004",
    "kind": "requirement",
    "label": "Toxicology Report",
    "category": "Medical",
    "status": "fulfilled",
    "stage": "requirement_gathering",
    "rag": "Green",
    "dueDate": "2026-02-18",
    "followUpDate": "2026-02-18",
    "source": "medical_provider",
    "sourceType": "medical",
    "responsibleParty": "County Medical Examiner",
    "notes": "No substances detected — natural death confirmed",
    "aiSummary": "Toxicology report received. No controlled substances or alcohol detected. Natural death by cardiac event confirmed. No exclusions triggered.",
    "fulfillmentCriteria": [
      "Official toxicology report from medical examiner or hospital",
      "Substances panel results included",
      "Result consistent with declared cause of death",
      "Signed by authorized examiner"
    ],
    "linkedDocs": [],
    "linkedTasks": [],
    "blockingImpact": null,
    "context": {
      "type": "claim",
      "label": "Claim verification",
      "description": "Toxicology is ordered as standard on all death benefit claims to confirm no policy exclusions apply (e.g. substance-related death).",
      "kv": [
        {
          "label": "Result",
          "value": "No substances detected"
        },
        {
          "label": "Source",
          "value": "County medical examiner"
        },
        {
          "label": "Exclusions triggered",
          "value": "None"
        }
      ]
    },
    "history": [
      {
        "date": "2026-02-17",
        "action": "Requirement fulfilled — toxicology received",
        "user": "System",
        "dot": "green"
      },
      {
        "date": "2026-02-05",
        "action": "Toxicology request sent to medical examiner",
        "user": "Victor Ramon",
        "dot": "blue"
      },
      {
        "date": "2026-02-04",
        "action": "Requirement created",
        "user": "Victor Ramon",
        "dot": "blue"
      }
    ],
    "trigger": "Claim verification",
    "requirementRef": "req_sd_004",
    "phase": "pre-approval",
    "workflowStepId": "requirement_gathering",
    "aiInsight": true,
    "aiConfidence": 94,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "Claim — Death Benefit"
      }
    ]
  },
  {
    "id": "req_sd_005",
    "kind": "requirement",
    "label": "Claimant identity verification",
    "category": "Compliance",
    "status": "fulfilled",
    "stage": "requirement_gathering",
    "rag": "Green",
    "dueDate": "2026-02-10",
    "followUpDate": "2026-02-10",
    "source": "id_verification",
    "sourceType": "system",
    "responsibleParty": "Richard Daniels",
    "notes": "Government ID confirmed via identity verification system",
    "aiSummary": "Marie Dupont identity confirmed via government-issued ID. Name, date of birth, and address match policy records and portal submission.",
    "fulfillmentCriteria": [
      "Government-issued photo ID (passport or driver's license)",
      "Name matches policy beneficiary record",
      "DOB confirmed",
      "Address matches or discrepancy explained",
      "ID not expired"
    ],
    "linkedDocs": [],
    "linkedTasks": [
      "task_cd6112"
    ],
    "blockingImpact": null,
    "context": {
      "type": "person",
      "label": "Beneficiary context",
      "description": "Marie Dupont is the primary beneficiary at 100%. Identity verification is required before ACH payout can be authorized.",
      "kv": [
        {
          "label": "Beneficiary",
          "value": "Marie Dupont (spouse)"
        },
        {
          "label": "Share",
          "value": "100%"
        },
        {
          "label": "Payment",
          "value": "ACH bank transfer"
        }
      ]
    },
    "history": [
      {
        "date": "2026-02-10",
        "action": "Requirement fulfilled — ID verified via portal",
        "user": "System",
        "dot": "green"
      },
      {
        "date": "2026-02-05",
        "action": "Identity verification request sent to Marie Dupont",
        "user": "Richard Daniels",
        "dot": "blue"
      },
      {
        "date": "2026-02-04",
        "action": "Requirement created",
        "user": "Richard Daniels",
        "dot": "blue"
      }
    ],
    "trigger": "Beneficiary context",
    "requirementRef": "req_sd_005",
    "phase": "pre-approval",
    "workflowStepId": "requirement_gathering",
    "aiInsight": true,
    "aiConfidence": 94,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "Claim — Death Benefit"
      },
      {
        "kind": "task",
        "id": "task_cd6112",
        "label": "task_cd6112"
      }
    ]
  },
  {
    "id": "req_sd_006",
    "kind": "requirement",
    "label": "Bank account verification (ACH)",
    "category": "Financial",
    "status": "fulfilled",
    "stage": "requirement_gathering",
    "rag": "Green",
    "dueDate": "2026-02-12",
    "followUpDate": "2026-02-12",
    "source": "claimant_portal",
    "sourceType": "external",
    "responsibleParty": "Marie Dupont (beneficiary)",
    "notes": "ACH routing and account number verified — account in beneficiary name",
    "aiSummary": "ACH routing number and bank account confirmed. Account held in name of Marie Dupont. $500,000 death benefit disbursement ready upon decision approval.",
    "fulfillmentCriteria": [
      "Bank account holder name matches beneficiary",
      "Routing number valid",
      "Account number confirmed",
      "Micro-deposit or equivalent verification completed",
      "ACH authorization signed"
    ],
    "linkedDocs": [],
    "linkedTasks": [],
    "blockingImpact": null,
    "context": {
      "type": "policy",
      "label": "Disbursement context",
      "description": "ACH bank verification is the final financial requirement before the $500,000 death benefit can be disbursed to Marie Dupont upon decision approval.",
      "kv": [
        {
          "label": "Payment method",
          "value": "ACH bank transfer"
        },
        {
          "label": "Amount",
          "value": "$500,000"
        },
        {
          "label": "Beneficiary",
          "value": "Marie Dupont"
        }
      ]
    },
    "history": [
      {
        "date": "2026-02-12",
        "action": "Requirement fulfilled — ACH verified",
        "user": "System",
        "dot": "green"
      },
      {
        "date": "2026-02-05",
        "action": "Bank verification request sent",
        "user": "Richard Daniels",
        "dot": "blue"
      },
      {
        "date": "2026-02-04",
        "action": "Requirement created",
        "user": "Richard Daniels",
        "dot": "blue"
      }
    ],
    "trigger": "Disbursement context",
    "requirementRef": "req_sd_006",
    "phase": "pre-approval",
    "workflowStepId": "requirement_gathering",
    "aiInsight": true,
    "aiConfidence": 94,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "Claim — Death Benefit"
      }
    ]
  },
  {
    "id": "req_sd_007",
    "kind": "requirement",
    "label": "Contestability review — MIB vs. application",
    "category": "Investigative",
    "status": "in_review",
    "stage": "contestability_review",
    "rag": "Amber",
    "dueDate": "2026-05-16",
    "followUpDate": "2026-05-16",
    "source": "MIB",
    "sourceType": "system",
    "responsibleParty": "Victor Ramon (human sign-off required)",
    "notes": "AI comparison complete — no discrepancies — pending human assessor sign-off",
    "aiSummary": "AI-generated MIB vs. application comparison complete. No material misrepresentation found. Cause of death consistent with disclosed cardiac history. Pending human assessor sign-off before case can proceed to final decision.",
    "fulfillmentCriteria": [
      "MIB report retrieved and reviewed",
      "Application disclosures cross-referenced against MIB",
      "No undisclosed conditions identified",
      "Cause of death consistent with disclosures",
      "Human assessor sign-off recorded"
    ],
    "linkedDocs": [
      "doc_mib_cd44"
    ],
    "linkedTasks": [
      "task_cd6120",
      "task_cd6121"
    ],
    "blockingImpact": {
      "stage": "Decision",
      "impact": "Contestability review must be cleared before the $500,000 payout decision can be authorized. Victor Ramon sign-off is the only remaining step.",
      "severity": "medium"
    },
    "context": {
      "type": "claim",
      "label": "Contestability context",
      "description": "Policy was in force 6y 11m — contestability lapsed. Standard MIB review is still required by procedure. AI comparison returned clean.",
      "kv": [
        {
          "label": "Contestability",
          "value": "Lapsed — 6y 11m"
        },
        {
          "label": "MIB result",
          "value": "No discrepancies"
        },
        {
          "label": "Sign-off needed",
          "value": "Victor Ramon"
        }
      ]
    },
    "history": [
      {
        "date": "2026-05-10",
        "action": "AI comparison completed — no discrepancies found",
        "user": "AI Agent",
        "dot": "green"
      },
      {
        "date": "2026-05-08",
        "action": "MIB report retrieved from bureau",
        "user": "AI Agent",
        "dot": "blue"
      },
      {
        "date": "2026-05-05",
        "action": "Contestability review requirement created",
        "user": "Victor Ramon",
        "dot": "blue"
      }
    ],
    "trigger": "Contestability context",
    "requirementRef": "req_sd_007",
    "phase": "pre-approval",
    "workflowStepId": "contestability_review",
    "aiInsight": true,
    "aiConfidence": 90,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "Claim — Death Benefit"
      },
      {
        "kind": "document",
        "id": "doc_mib_cd44",
        "label": "doc_mib_cd44"
      },
      {
        "kind": "task",
        "id": "task_cd6120",
        "label": "task_cd6120"
      },
      {
        "kind": "task",
        "id": "task_cd6121",
        "label": "task_cd6121"
      }
    ]
  },
  {
    "id": "req_mt_001",
    "kind": "requirement",
    "label": "Signed application form",
    "category": "Documentation",
    "status": "fulfilled",
    "stage": "application_received",
    "rag": "Green",
    "dueDate": "2026-05-12",
    "followUpDate": "2026-05-12",
    "source": "broker_portal",
    "sourceType": "system",
    "responsibleParty": "Northstar Advisory (broker)",
    "notes": "SBLI broker submission via portal — all fields complete",
    "aiSummary": "Application complete and signed. T2 Diabetes and 2022 prior decline both disclosed. All mandatory fields present. Broker signature confirmed. Submission via authorized SBLI broker portal.",
    "fulfillmentCriteria": [
      "Application fully completed with no blank mandatory fields",
      "Applicant wet or e-signature present",
      "Health disclosures section completed honestly",
      "Broker/agent signature confirmed",
      "Submitted via authorized SBLI broker portal"
    ],
    "linkedDocs": [
      "doc_app_nb66"
    ],
    "linkedTasks": [
      "task_nb4011"
    ],
    "blockingImpact": null,
    "context": {
      "type": "application",
      "label": "Application context",
      "description": "SBLI Term Life 20 application submitted by Northstar Advisory on behalf of Marc Tremblay. $625,000 death benefit / 20-year term.",
      "kv": [
        {
          "label": "Applicant",
          "value": "Marc Tremblay"
        },
        {
          "label": "Death benefit",
          "value": "$625,000"
        },
        {
          "label": "Channel",
          "value": "SBLI broker network"
        }
      ]
    },
    "history": [
      {
        "date": "2026-05-12",
        "action": "Requirement fulfilled — signed application received",
        "user": "System",
        "dot": "green"
      },
      {
        "date": "2026-05-12",
        "action": "Requirement created on application receipt",
        "user": "System",
        "dot": "blue"
      }
    ],
    "trigger": "Application context",
    "requirementRef": "req_mt_001",
    "phase": "pre-approval",
    "workflowStepId": "application_received",
    "aiInsight": true,
    "aiConfidence": 94,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "New Business — Full Underwriting"
      },
      {
        "kind": "document",
        "id": "doc_app_nb66",
        "label": "doc_app_nb66"
      },
      {
        "kind": "task",
        "id": "task_nb4011",
        "label": "task_nb4011"
      }
    ]
  },
  {
    "id": "req_mt_002",
    "kind": "requirement",
    "label": "MIB report",
    "category": "Medical",
    "status": "fulfilled",
    "stage": "initial_review",
    "rag": "Green",
    "dueDate": "2026-05-13",
    "followUpDate": "2026-05-13",
    "source": "MIB",
    "sourceType": "system",
    "responsibleParty": "System (AI Agent — auto-ordered)",
    "notes": "Prior decline 2022 flagged — accelerated UW disqualified, routed to traditional",
    "aiSummary": "MIB report returned with one flag: prior life insurance decline, 2022, carrier unknown. Accelerated UW path disqualified. Applicant disclosed this on the application — disclosure matches. Explanation letter required from applicant.",
    "fulfillmentCriteria": [
      "MIB report retrieved from bureau",
      "Results reviewed for anomalies",
      "Prior decline disclosed on application confirmed as matching",
      "UW path determination made based on results"
    ],
    "linkedDocs": [
      "doc_mib_nb66"
    ],
    "linkedTasks": [
      "task_nb4020",
      "task_nb4021"
    ],
    "blockingImpact": null,
    "context": {
      "type": "application",
      "label": "Underwriting context",
      "description": "MIB hit triggers traditional full UW path. Prior decline in 2022 adds +50 debits to preliminary scoring. Explanation letter required from applicant before UW review.",
      "kv": [
        {
          "label": "MIB result",
          "value": "Prior decline 2022"
        },
        {
          "label": "UW path",
          "value": "Traditional (flagged)"
        },
        {
          "label": "Debit impact",
          "value": "+50 debits"
        }
      ]
    },
    "history": [
      {
        "date": "2026-05-13",
        "action": "Requirement fulfilled — MIB returned with prior decline flag",
        "user": "AI Agent",
        "dot": "green"
      },
      {
        "date": "2026-05-13",
        "action": "MIB ordered automatically on application receipt",
        "user": "AI Agent",
        "dot": "blue"
      },
      {
        "date": "2026-05-12",
        "action": "Requirement created",
        "user": "System",
        "dot": "blue"
      }
    ],
    "trigger": "Underwriting context",
    "requirementRef": "req_mt_002",
    "phase": "pre-approval",
    "workflowStepId": "initial_review",
    "aiInsight": true,
    "aiConfidence": 94,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "New Business — Full Underwriting"
      },
      {
        "kind": "document",
        "id": "doc_mib_nb66",
        "label": "doc_mib_nb66"
      },
      {
        "kind": "task",
        "id": "task_nb4020",
        "label": "task_nb4020"
      },
      {
        "kind": "task",
        "id": "task_nb4021",
        "label": "task_nb4021"
      }
    ]
  },
  {
    "id": "req_mt_003",
    "kind": "requirement",
    "label": "MVR (Motor Vehicle Report)",
    "category": "Background",
    "status": "fulfilled",
    "stage": "initial_review",
    "rag": "Green",
    "dueDate": "2026-05-13",
    "followUpDate": "2026-05-13",
    "source": "MVR_system",
    "sourceType": "system",
    "responsibleParty": "System (AI Agent — auto-ordered)",
    "notes": "Clean driving record — no risk loading required",
    "aiSummary": "MVR returned clean. No moving violations, DUIs, or license suspensions in past 5 years. No risk loading required for driving history.",
    "fulfillmentCriteria": [
      "MVR report retrieved for applicant",
      "Past 5-year driving history reviewed",
      "No material violations identified",
      "Risk loading determination made and documented"
    ],
    "linkedDocs": [
      "doc_mvr_nb66"
    ],
    "linkedTasks": [
      "task_nb4020"
    ],
    "blockingImpact": null,
    "context": {
      "type": "application",
      "label": "Background check",
      "description": "MVR is a standard underwriting check ordered alongside MIB. Clean result — no impact on preliminary scoring.",
      "kv": [
        {
          "label": "Result",
          "value": "Clean record"
        },
        {
          "label": "Risk loading",
          "value": "None"
        },
        {
          "label": "Period reviewed",
          "value": "5 years"
        }
      ]
    },
    "history": [
      {
        "date": "2026-05-13",
        "action": "Requirement fulfilled — MVR returned clean",
        "user": "AI Agent",
        "dot": "green"
      },
      {
        "date": "2026-05-13",
        "action": "MVR ordered automatically",
        "user": "AI Agent",
        "dot": "blue"
      }
    ],
    "trigger": "Background check",
    "requirementRef": "req_mt_003",
    "phase": "pre-approval",
    "workflowStepId": "initial_review",
    "aiInsight": true,
    "aiConfidence": 94,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "New Business — Full Underwriting"
      },
      {
        "kind": "document",
        "id": "doc_mvr_nb66",
        "label": "doc_mvr_nb66"
      },
      {
        "kind": "task",
        "id": "task_nb4020",
        "label": "task_nb4020"
      }
    ]
  },
  {
    "id": "req_mt_004",
    "kind": "requirement",
    "label": "Prescription history check",
    "category": "Medical",
    "status": "fulfilled",
    "stage": "initial_review",
    "rag": "Green",
    "dueDate": "2026-05-13",
    "followUpDate": "2026-05-13",
    "source": "rx_database",
    "sourceType": "system",
    "responsibleParty": "System (AI Agent — auto-ordered)",
    "notes": "Metformin 500mg confirmed — consistent with T2D disclosure",
    "aiSummary": "Prescription history confirms Metformin 500mg dispensed consistently since 2019. Consistent with disclosed T2 Diabetes. No other medications flagged. No undisclosed conditions inferred.",
    "fulfillmentCriteria": [
      "Rx database query returned for applicant",
      "Medications cross-referenced with application health disclosures",
      "No undisclosed medications identified",
      "T2D disclosure confirmed via Metformin record"
    ],
    "linkedDocs": [
      "doc_rx_nb66"
    ],
    "linkedTasks": [
      "task_nb4020"
    ],
    "blockingImpact": null,
    "context": {
      "type": "application",
      "label": "Medical disclosure context",
      "description": "Rx check validates health disclosures. Metformin 500mg confirms T2D (2019) as disclosed. No additional undisclosed conditions detected.",
      "kv": [
        {
          "label": "Medication",
          "value": "Metformin 500mg"
        },
        {
          "label": "Since",
          "value": "2019"
        },
        {
          "label": "Undisclosed conditions",
          "value": "None"
        }
      ]
    },
    "history": [
      {
        "date": "2026-05-13",
        "action": "Requirement fulfilled — Rx confirmed consistent with disclosure",
        "user": "AI Agent",
        "dot": "green"
      },
      {
        "date": "2026-05-13",
        "action": "Rx check ordered automatically",
        "user": "AI Agent",
        "dot": "blue"
      }
    ],
    "trigger": "Medical disclosure context",
    "requirementRef": "req_mt_004",
    "phase": "pre-approval",
    "workflowStepId": "initial_review",
    "aiInsight": true,
    "aiConfidence": 94,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "New Business — Full Underwriting"
      },
      {
        "kind": "document",
        "id": "doc_rx_nb66",
        "label": "doc_rx_nb66"
      },
      {
        "kind": "task",
        "id": "task_nb4020",
        "label": "task_nb4020"
      }
    ]
  },
  {
    "id": "req_mt_005",
    "kind": "requirement",
    "label": "Attending Physician Statement (APS)",
    "category": "Medical",
    "status": "overdue",
    "stage": "requirement_gathering",
    "rag": "Red",
    "dueDate": "2026-05-16",
    "followUpDate": "2026-05-16",
    "source": "medical_provider",
    "sourceType": "medical",
    "responsibleParty": "Dr. Kowalski — Kowalski Family Medicine",
    "notes": "APS to validate T2D management history and contextualize MIB prior decline flag",
    "aiSummary": "APS request sent to Dr. Kowalski. Covering T2D management history, HbA1c trend, medication compliance, and any complications. Required to validate preliminary scoring and contextualize the 2022 prior decline.",
    "fulfillmentCriteria": [
      "APS on physician letterhead covering T2D management",
      "HbA1c history for minimum 3 years",
      "Any diabetes-related complications documented or denied",
      "Medication compliance confirmed",
      "Physician overall health status assessment"
    ],
    "linkedDocs": [],
    "linkedTasks": [
      "task_nb4030"
    ],
    "blockingImpact": {
      "stage": "UW review",
      "impact": "UW final scoring (NB-4040) cannot be completed without APS. Paramedical results will also be incomplete without APS context. Application decision blocked.",
      "severity": "high"
    },
    "context": {
      "type": "application",
      "label": "Scoring context",
      "description": "APS from Dr. Kowalski will clarify T2D severity and may modify the preliminary +50 T2D debit. Final offer cannot be generated without it.",
      "kv": [
        {
          "label": "Physician",
          "value": "Dr. Kowalski"
        },
        {
          "label": "T2D debit (prelim)",
          "value": "+50"
        },
        {
          "label": "HbA1c on file",
          "value": "48 mmol/mol"
        }
      ]
    },
    "history": [
      {
        "date": "2026-05-15",
        "action": "Due date passed — APS not yet received",
        "user": "System",
        "dot": "amber"
      },
      {
        "date": "2026-05-14",
        "action": "APS request sent via provider portal",
        "user": "Victor Ramon",
        "dot": "blue"
      },
      {
        "date": "2026-05-14",
        "action": "Requirement created",
        "user": "Victor Ramon",
        "dot": "blue"
      }
    ],
    "trigger": "Scoring context",
    "requirementRef": "req_mt_005",
    "phase": "pre-approval",
    "workflowStepId": "requirement_gathering",
    "aiInsight": true,
    "aiConfidence": 87,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "New Business — Full Underwriting"
      },
      {
        "kind": "task",
        "id": "task_nb4030",
        "label": "task_nb4030"
      }
    ]
  },
  {
    "id": "req_mt_006",
    "kind": "requirement",
    "label": "Paramedical exam — blood draw",
    "category": "Medical",
    "status": "scheduled",
    "stage": "requirement_gathering",
    "rag": "Amber",
    "dueDate": "2026-05-19",
    "followUpDate": "2026-05-19",
    "source": "paramedical_vendor",
    "sourceType": "medical",
    "responsibleParty": "Quest Diagnostics",
    "notes": "Scheduled May 19 — MIB flag requires full traditional UW exam",
    "aiSummary": "Paramedical exam scheduled with Quest Diagnostics for May 19, 2026. Blood draw and vitals capture required. Results will feed into final UW scoring alongside APS.",
    "fulfillmentCriteria": [
      "Paramedical exam completed at scheduled time",
      "Blood draw processed by accredited lab",
      "Vitals recorded: height, weight, BP, pulse",
      "Lab panels resulted: glucose, cholesterol, HbA1c, CBC",
      "Report signed by certified paramedic"
    ],
    "linkedDocs": [],
    "linkedTasks": [
      "task_nb4031"
    ],
    "blockingImpact": null,
    "context": {
      "type": "application",
      "label": "Exam context",
      "description": "Traditional UW path requires paramedical exam due to MIB flag. Quest Diagnostics is the approved SBLI vendor for this applicant's zip code.",
      "kv": [
        {
          "label": "Provider",
          "value": "Quest Diagnostics"
        },
        {
          "label": "Scheduled",
          "value": "May 19, 2026"
        },
        {
          "label": "Key panels",
          "value": "Glucose, HbA1c, CBC"
        }
      ]
    },
    "history": [
      {
        "date": "2026-05-14",
        "action": "Exam scheduled — Quest Diagnostics, May 19, 2026",
        "user": "Victor Ramon",
        "dot": "green"
      },
      {
        "date": "2026-05-14",
        "action": "Requirement created",
        "user": "Victor Ramon",
        "dot": "blue"
      }
    ],
    "trigger": "Exam context",
    "requirementRef": "req_mt_006",
    "phase": "pre-approval",
    "workflowStepId": "requirement_gathering",
    "aiInsight": true,
    "aiConfidence": 90,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "New Business — Full Underwriting"
      },
      {
        "kind": "task",
        "id": "task_nb4031",
        "label": "task_nb4031"
      }
    ]
  },
  {
    "id": "req_mt_007",
    "kind": "requirement",
    "label": "Prior decline explanation letter",
    "category": "Documentation",
    "status": "overdue",
    "stage": "underwriting_review",
    "rag": "Red",
    "dueDate": "2026-05-18",
    "followUpDate": "2026-05-18",
    "source": "applicant",
    "sourceType": "external",
    "responsibleParty": "Marc Tremblay (applicant)",
    "notes": "Applicant must explain 2022 MIB prior decline in writing",
    "aiSummary": "Explanation letter requested from Marc Tremblay regarding 2022 prior decline. Outstanding. Blocking requirement — final UW scoring and offer generation cannot proceed without it.",
    "fulfillmentCriteria": [
      "Written explanation from applicant (letter or portal statement)",
      "Carrier name identified",
      "Coverage amount applied for stated",
      "Reason for decline explained clearly",
      "Health changes since 2022 described if applicable"
    ],
    "linkedDocs": [],
    "linkedTasks": [
      "task_nb4032"
    ],
    "blockingImpact": {
      "stage": "UW review → Decision",
      "impact": "Final UW scoring (NB-4040) and AI offer recommendation (NB-4041) cannot proceed. Without explanation, underwriters cannot determine if the 2022 decline materially impacts current risk.",
      "severity": "high"
    },
    "context": {
      "type": "application",
      "label": "MIB context",
      "description": "Prior decline in 2022 is the most significant open risk factor. Explanation may resolve or escalate the +50 debit assigned to this flag in preliminary scoring.",
      "kv": [
        {
          "label": "MIB year",
          "value": "2022"
        },
        {
          "label": "Carrier",
          "value": "Unknown"
        },
        {
          "label": "Debit impact",
          "value": "+50 (unresolved)"
        }
      ]
    },
    "history": [
      {
        "date": "2026-05-15",
        "action": "Due date passed — no response from applicant",
        "user": "System",
        "dot": "amber"
      },
      {
        "date": "2026-05-14",
        "action": "Explanation request sent via portal and email",
        "user": "Richard Daniels",
        "dot": "blue"
      },
      {
        "date": "2026-05-14",
        "action": "Requirement created",
        "user": "Victor Ramon",
        "dot": "blue"
      }
    ],
    "trigger": "MIB context",
    "requirementRef": "req_mt_007",
    "phase": "pre-approval",
    "workflowStepId": "underwriting_review",
    "aiInsight": true,
    "aiConfidence": 87,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "New Business — Full Underwriting"
      },
      {
        "kind": "task",
        "id": "task_nb4032",
        "label": "task_nb4032"
      }
    ]
  },
  {
    "id": "req_er_001",
    "kind": "requirement",
    "label": "Signed SBLI online application",
    "category": "Documentation",
    "status": "fulfilled",
    "stage": "application_received",
    "rag": "Green",
    "dueDate": "2026-05-13",
    "followUpDate": "2026-05-13",
    "source": "sbli.com",
    "sourceType": "system",
    "responsibleParty": "Elena Rossi (applicant)",
    "notes": "Direct online submission via SBLI.com — all four accelerated UW criteria met",
    "aiSummary": "Application complete and submitted online. No adverse health disclosures. Non-smoker declared. BMI 23.1 self-declared. All four SBLI Simple Term accelerated UW eligibility criteria passed.",
    "fulfillmentCriteria": [
      "Application fully completed online",
      "Electronic signature captured",
      "No adverse health disclosures flagged",
      "All four Simple Term UW criteria passed (age, coverage, no disclosures, no MIB)",
      "MIB check triggered automatically"
    ],
    "linkedDocs": [
      "doc_app_nb98"
    ],
    "linkedTasks": [
      "task_nb2011"
    ],
    "blockingImpact": null,
    "context": {
      "type": "application",
      "label": "Application context",
      "description": "SBLI Simple Term Life application submitted via SBLI.com direct-to-consumer channel. No broker involved. Accelerated UW path confirmed.",
      "kv": [
        {
          "label": "Applicant",
          "value": "Elena Rossi"
        },
        {
          "label": "Death benefit",
          "value": "$350,000"
        },
        {
          "label": "Channel",
          "value": "Direct — SBLI.com"
        }
      ]
    },
    "history": [
      {
        "date": "2026-05-13",
        "action": "Requirement fulfilled — application received via SBLI.com",
        "user": "System",
        "dot": "green"
      },
      {
        "date": "2026-05-13",
        "action": "Requirement created on application submission",
        "user": "System",
        "dot": "blue"
      }
    ],
    "trigger": "Application context",
    "requirementRef": "req_er_001",
    "phase": "pre-approval",
    "workflowStepId": "application_received",
    "aiInsight": true,
    "aiConfidence": 94,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB98-9989870",
        "label": "New Business — Simplified Underwriting"
      },
      {
        "kind": "document",
        "id": "doc_app_nb98",
        "label": "doc_app_nb98"
      },
      {
        "kind": "task",
        "id": "task_nb2011",
        "label": "task_nb2011"
      }
    ]
  },
  {
    "id": "req_er_002",
    "kind": "requirement",
    "label": "MIB report",
    "category": "Medical",
    "status": "fulfilled",
    "stage": "application_received",
    "rag": "Green",
    "dueDate": "2026-05-13",
    "followUpDate": "2026-05-13",
    "source": "MIB",
    "sourceType": "system",
    "responsibleParty": "System (AI Agent — auto-ordered)",
    "notes": "No alerts — all four accelerated UW criteria confirmed, Simple Term path active",
    "aiSummary": "MIB check returned no records for Elena Rossi. All four accelerated UW eligibility criteria confirmed. Routed to SBLI Simple Term no-exam path. Same-day coverage eligible.",
    "fulfillmentCriteria": [
      "MIB report retrieved",
      "No prior declines or adverse records found",
      "Eligibility criteria confirmed: age 18–50, coverage ≤$1M, no adverse disclosures, no MIB alerts",
      "Simple Term accelerated UW path confirmed"
    ],
    "linkedDocs": [
      "doc_mib_nb98"
    ],
    "linkedTasks": [
      "task_nb2011"
    ],
    "blockingImpact": null,
    "context": {
      "type": "application",
      "label": "Eligibility context",
      "description": "Clean MIB result confirms the fourth and final accelerated UW criterion. No-exam path confirmed. Same-day coverage eligible pending tele-interview.",
      "kv": [
        {
          "label": "MIB result",
          "value": "No alerts"
        },
        {
          "label": "Criteria passed",
          "value": "4 of 4"
        },
        {
          "label": "UW path",
          "value": "Accelerated — no exam"
        }
      ]
    },
    "history": [
      {
        "date": "2026-05-13",
        "action": "Requirement fulfilled — MIB clear, accelerated UW confirmed",
        "user": "AI Agent",
        "dot": "green"
      },
      {
        "date": "2026-05-13",
        "action": "MIB ordered automatically on application submission",
        "user": "AI Agent",
        "dot": "blue"
      }
    ],
    "trigger": "Eligibility context",
    "requirementRef": "req_er_002",
    "phase": "pre-approval",
    "workflowStepId": "application_received",
    "aiInsight": true,
    "aiConfidence": 94,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB98-9989870",
        "label": "New Business — Simplified Underwriting"
      },
      {
        "kind": "document",
        "id": "doc_mib_nb98",
        "label": "doc_mib_nb98"
      },
      {
        "kind": "task",
        "id": "task_nb2011",
        "label": "task_nb2011"
      }
    ]
  },
  {
    "id": "req_er_003",
    "kind": "requirement",
    "label": "SBLI health questionnaire (tele-interview)",
    "category": "Medical",
    "status": "scheduled",
    "stage": "tele_interview",
    "rag": "Amber",
    "dueDate": "2026-05-17",
    "followUpDate": "2026-05-17",
    "source": "telephony_system",
    "sourceType": "system",
    "responsibleParty": "Richard Daniels (SBLI assessor)",
    "notes": "4 sections — cardiovascular, respiratory, musculoskeletal, mental health",
    "aiSummary": "Tele-interview scheduled May 17 at 10:00 AM. Richard Daniels assigned. Four questionnaire sections to be completed. AI scoring runs automatically post-interview submission.",
    "fulfillmentCriteria": [
      "All 4 questionnaire sections completed during interview",
      "All responses recorded verbatim in telephony system",
      "No section left incomplete",
      "Identity confirmed verbally (DOB, address)",
      "Questionnaire submitted to trigger AI scoring task (NB-2030)"
    ],
    "linkedDocs": [
      "doc_uw_nb98"
    ],
    "linkedTasks": [
      "task_nb2021",
      "task_nb2030",
      "task_nb2031"
    ],
    "blockingImpact": {
      "stage": "Questionnaire review → Decision",
      "impact": "AI questionnaire scoring (NB-2030) cannot run until interview is completed. Human review (NB-2031) and final decision (NB-2040) are both downstream. Same-day coverage window closes if delayed beyond May 17.",
      "severity": "medium"
    },
    "context": {
      "type": "application",
      "label": "Interview context",
      "description": "Tele-interview is the only underwriting step for SBLI Simple Term Life. No blood draw or physical exam required. Covers all four SBLI health questionnaire sections.",
      "kv": [
        {
          "label": "Interviewer",
          "value": "Richard Daniels"
        },
        {
          "label": "Scheduled",
          "value": "May 17, 10:00 AM"
        },
        {
          "label": "Sections",
          "value": "Cardiovascular, Respiratory, MSK, MH"
        }
      ]
    },
    "history": [
      {
        "date": "2026-05-14",
        "action": "Appointment confirmed — May 17 10:00 AM",
        "user": "System",
        "dot": "green"
      },
      {
        "date": "2026-05-14",
        "action": "SMS reminder sent to Elena Rossi",
        "user": "System",
        "dot": "blue"
      },
      {
        "date": "2026-05-14",
        "action": "Interview prep email sent to Elena Rossi",
        "user": "Richard Daniels",
        "dot": "blue"
      },
      {
        "date": "2026-05-13",
        "action": "Requirement created — tele-interview stage",
        "user": "System",
        "dot": "blue"
      }
    ],
    "trigger": "Interview context",
    "requirementRef": "req_er_003",
    "phase": "pre-approval",
    "workflowStepId": "tele_interview",
    "aiInsight": true,
    "aiConfidence": 90,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB98-9989870",
        "label": "New Business — Simplified Underwriting"
      },
      {
        "kind": "document",
        "id": "doc_uw_nb98",
        "label": "doc_uw_nb98"
      },
      {
        "kind": "task",
        "id": "task_nb2021",
        "label": "task_nb2021"
      },
      {
        "kind": "task",
        "id": "task_nb2030",
        "label": "task_nb2030"
      },
      {
        "kind": "task",
        "id": "task_nb2031",
        "label": "task_nb2031"
      }
    ]
  },
  {
    "id": "req_er_004",
    "kind": "requirement",
    "label": "Identity verification",
    "category": "Compliance",
    "status": "not_started",
    "stage": "questionnaire_review",
    "rag": "Red",
    "dueDate": "2026-05-18",
    "followUpDate": "2026-05-18",
    "source": "id_verification",
    "sourceType": "system",
    "responsibleParty": "System (AI Agent — auto-triggered post-interview)",
    "notes": "Triggered automatically upon tele-interview completion — not yet initiated",
    "aiSummary": "Identity verification not yet initiated. Will be triggered automatically upon completion of the tele-interview. Standard government ID check against application name, DOB, and address.",
    "fulfillmentCriteria": [
      "Government ID verified against application name and DOB",
      "Address confirmed or discrepancy explained",
      "ID document not expired",
      "Verification completed before decision stage trigger"
    ],
    "linkedDocs": [],
    "linkedTasks": [
      "task_nb2032"
    ],
    "blockingImpact": {
      "stage": "Decision",
      "impact": "Final decision (NB-2040) cannot be issued without identity verification. Auto-triggered post-interview — will initiate automatically when NB-2021 is completed.",
      "severity": "low"
    },
    "context": {
      "type": "application",
      "label": "Compliance context",
      "description": "Identity verification is a regulatory requirement for all life insurance policies before issuance. Auto-triggered after tele-interview completion.",
      "kv": [
        {
          "label": "Trigger",
          "value": "Post-tele-interview completion"
        },
        {
          "label": "Method",
          "value": "Government ID check"
        },
        {
          "label": "Assigned to",
          "value": "AI Agent"
        }
      ]
    },
    "history": [
      {
        "date": "2026-05-13",
        "action": "Requirement created — auto-triggers on tele-interview completion",
        "user": "System",
        "dot": "blue"
      }
    ],
    "trigger": "Compliance context",
    "requirementRef": "req_er_004",
    "phase": "pre-approval",
    "workflowStepId": "questionnaire_review",
    "aiInsight": true,
    "aiConfidence": 90,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB98-9989870",
        "label": "New Business — Simplified Underwriting"
      },
      {
        "kind": "task",
        "id": "task_nb2032",
        "label": "task_nb2032"
      }
    ]
  }
];

export const SBLI_REQUIREMENT_DOCUMENT_RECORDS: DatasetDocumentRecord[] = [
  {
    "id": "doc_death_cert_cd44",
    "kind": "document",
    "label": "Certified Death Certificate evidence",
    "filename": "certified_death_certificate.pdf",
    "category": "Evidence",
    "status": "Validated",
    "stage": "initial_triage",
    "uploaded": null,
    "uploadedAt": null,
    "source": "claimant_portal",
    "claimant": "Marie Dupont (beneficiary)",
    "reqContext": "Certified death certificate is the primary legal document establishing the fact and cause of death for the death benefit claim.",
    "insights": [],
    "followUps": 0,
    "insight": "State-certified death certificate received. Cause: acute myocardial infarction (I21.9). Manner: natural. Date and place of death confirmed. Registrar signature present.",
    "aiInsight": true,
    "aiConfidence": 92,
    "aiSummary": "State-certified death certificate received. Cause: acute myocardial infarction (I21.9). Manner: natural. Date and place of death confirmed. Registrar signature present.",
    "aiAction": "Review extracted evidence",
    "linkedRequirement": "Certified Death Certificate",
    "linkedRequirementId": "req_sd_002",
    "linkedCase": "CD44-6679812",
    "linkedCaseId": "CD44-6679812",
    "fileSize": "No file",
    "fileType": "PDF",
    "fileAvailable": false,
    "placeholderReason": "Requirement seed references this evidence document, but no source file was provided yet.",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "Claim — Death Benefit"
      },
      {
        "kind": "requirement",
        "id": "req_sd_002",
        "label": "Certified Death Certificate"
      }
    ]
  },
  {
    "id": "doc_aps_cd44",
    "kind": "document",
    "label": "Attending Physician Statement (APS) evidence",
    "filename": "attending_physician_statement_aps.pdf",
    "category": "Medical",
    "status": "Validated",
    "stage": "requirement_gathering",
    "uploaded": null,
    "uploadedAt": null,
    "source": "medical_provider",
    "claimant": "Marie Dupont (beneficiary)",
    "reqContext": "Dr. Harmon (Portland Cardiology Group) was Thomas Dupont's treating cardiologist. APS confirms cardiac history consistent with disclosed hypertension and coronary artery disease.",
    "insights": [],
    "followUps": 0,
    "insight": "APS from Dr. Harmon confirms cause of death is consistent with Thomas Dupont's disclosed cardiac history. No red flags or undisclosed conditions noted.",
    "aiInsight": true,
    "aiConfidence": 92,
    "aiSummary": "APS from Dr. Harmon confirms cause of death is consistent with Thomas Dupont's disclosed cardiac history. No red flags or undisclosed conditions noted.",
    "aiAction": "Review extracted evidence",
    "linkedRequirement": "Attending Physician Statement (APS)",
    "linkedRequirementId": "req_sd_003",
    "linkedCase": "CD44-6679812",
    "linkedCaseId": "CD44-6679812",
    "fileSize": "No file",
    "fileType": "PDF",
    "fileAvailable": false,
    "placeholderReason": "Requirement seed references this evidence document, but no source file was provided yet.",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "Claim — Death Benefit"
      },
      {
        "kind": "requirement",
        "id": "req_sd_003",
        "label": "Attending Physician Statement (APS)"
      }
    ]
  },
  {
    "id": "doc_app_nb66",
    "kind": "document",
    "label": "Signed application form evidence",
    "filename": "signed_application_form.pdf",
    "category": "Evidence",
    "status": "Validated",
    "stage": "application_received",
    "uploaded": null,
    "uploadedAt": null,
    "source": "broker_portal",
    "reqContext": "SBLI Term Life 20 application submitted by Northstar Advisory on behalf of Marc Tremblay. $625,000 death benefit / 20-year term.",
    "insights": [],
    "followUps": 0,
    "insight": "Application complete and signed. T2 Diabetes and 2022 prior decline both disclosed. All mandatory fields present. Broker signature confirmed. Submission via authorized SBLI broker portal.",
    "aiInsight": true,
    "aiConfidence": 92,
    "aiSummary": "Application complete and signed. T2 Diabetes and 2022 prior decline both disclosed. All mandatory fields present. Broker signature confirmed. Submission via authorized SBLI broker portal.",
    "aiAction": "Review extracted evidence",
    "linkedRequirement": "Signed application form",
    "linkedRequirementId": "req_mt_001",
    "linkedCase": "NB66-7622343",
    "linkedCaseId": "NB66-7622343",
    "fileSize": "No file",
    "fileType": "PDF",
    "fileAvailable": false,
    "placeholderReason": "Requirement seed references this evidence document, but no source file was provided yet.",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "New Business — Full Underwriting"
      },
      {
        "kind": "requirement",
        "id": "req_mt_001",
        "label": "Signed application form"
      }
    ]
  },
  {
    "id": "doc_mib_nb66",
    "kind": "document",
    "label": "MIB report evidence",
    "filename": "mib_report_nb66.pdf",
    "category": "Medical",
    "status": "Validated",
    "stage": "initial_review",
    "uploaded": null,
    "uploadedAt": null,
    "source": "MIB",
    "reqContext": "MIB hit triggers traditional full UW path. Prior decline in 2022 adds +50 debits to preliminary scoring. Explanation letter required from applicant before UW review.",
    "insights": [],
    "followUps": 0,
    "insight": "MIB report returned with one flag: prior life insurance decline, 2022, carrier unknown. Accelerated UW path disqualified. Applicant disclosed this on the application — disclosure matches. Explanation letter required from applicant.",
    "aiInsight": true,
    "aiConfidence": 92,
    "aiSummary": "MIB report returned with one flag: prior life insurance decline, 2022, carrier unknown. Accelerated UW path disqualified. Applicant disclosed this on the application — disclosure matches. Explanation letter required from applicant.",
    "aiAction": "Review extracted evidence",
    "linkedRequirement": "MIB report",
    "linkedRequirementId": "req_mt_002",
    "linkedCase": "NB66-7622343",
    "linkedCaseId": "NB66-7622343",
    "fileSize": "No file",
    "fileType": "PDF",
    "fileAvailable": false,
    "placeholderReason": "Requirement seed references this evidence document, but no source file was provided yet.",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "New Business — Full Underwriting"
      },
      {
        "kind": "requirement",
        "id": "req_mt_002",
        "label": "MIB report"
      }
    ]
  },
  {
    "id": "doc_mvr_nb66",
    "kind": "document",
    "label": "MVR (Motor Vehicle Report) evidence",
    "filename": "mvr_motor_vehicle_report.pdf",
    "category": "Legal",
    "status": "Validated",
    "stage": "initial_review",
    "uploaded": null,
    "uploadedAt": null,
    "source": "MVR_system",
    "reqContext": "MVR is a standard underwriting check ordered alongside MIB. Clean result — no impact on preliminary scoring.",
    "insights": [],
    "followUps": 0,
    "insight": "MVR returned clean. No moving violations, DUIs, or license suspensions in past 5 years. No risk loading required for driving history.",
    "aiInsight": true,
    "aiConfidence": 92,
    "aiSummary": "MVR returned clean. No moving violations, DUIs, or license suspensions in past 5 years. No risk loading required for driving history.",
    "aiAction": "Review extracted evidence",
    "linkedRequirement": "MVR (Motor Vehicle Report)",
    "linkedRequirementId": "req_mt_003",
    "linkedCase": "NB66-7622343",
    "linkedCaseId": "NB66-7622343",
    "fileSize": "No file",
    "fileType": "PDF",
    "fileAvailable": false,
    "placeholderReason": "Requirement seed references this evidence document, but no source file was provided yet.",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "New Business — Full Underwriting"
      },
      {
        "kind": "requirement",
        "id": "req_mt_003",
        "label": "MVR (Motor Vehicle Report)"
      }
    ]
  },
  {
    "id": "doc_rx_nb66",
    "kind": "document",
    "label": "Prescription history check evidence",
    "filename": "prescription_history_check.pdf",
    "category": "Medical",
    "status": "Validated",
    "stage": "initial_review",
    "uploaded": null,
    "uploadedAt": null,
    "source": "rx_database",
    "reqContext": "Rx check validates health disclosures. Metformin 500mg confirms T2D (2019) as disclosed. No additional undisclosed conditions detected.",
    "insights": [],
    "followUps": 0,
    "insight": "Prescription history confirms Metformin 500mg dispensed consistently since 2019. Consistent with disclosed T2 Diabetes. No other medications flagged. No undisclosed conditions inferred.",
    "aiInsight": true,
    "aiConfidence": 92,
    "aiSummary": "Prescription history confirms Metformin 500mg dispensed consistently since 2019. Consistent with disclosed T2 Diabetes. No other medications flagged. No undisclosed conditions inferred.",
    "aiAction": "Review extracted evidence",
    "linkedRequirement": "Prescription history check",
    "linkedRequirementId": "req_mt_004",
    "linkedCase": "NB66-7622343",
    "linkedCaseId": "NB66-7622343",
    "fileSize": "No file",
    "fileType": "PDF",
    "fileAvailable": false,
    "placeholderReason": "Requirement seed references this evidence document, but no source file was provided yet.",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "New Business — Full Underwriting"
      },
      {
        "kind": "requirement",
        "id": "req_mt_004",
        "label": "Prescription history check"
      }
    ]
  },
  {
    "id": "doc_app_nb98",
    "kind": "document",
    "label": "Signed SBLI online application evidence",
    "filename": "signed_sbli_online_application.pdf",
    "category": "Evidence",
    "status": "Validated",
    "stage": "application_received",
    "uploaded": null,
    "uploadedAt": null,
    "source": "sbli.com",
    "reqContext": "SBLI Simple Term Life application submitted via SBLI.com direct-to-consumer channel. No broker involved. Accelerated UW path confirmed.",
    "insights": [],
    "followUps": 0,
    "insight": "Application complete and submitted online. No adverse health disclosures. Non-smoker declared. BMI 23.1 self-declared. All four SBLI Simple Term accelerated UW eligibility criteria passed.",
    "aiInsight": true,
    "aiConfidence": 92,
    "aiSummary": "Application complete and submitted online. No adverse health disclosures. Non-smoker declared. BMI 23.1 self-declared. All four SBLI Simple Term accelerated UW eligibility criteria passed.",
    "aiAction": "Review extracted evidence",
    "linkedRequirement": "Signed SBLI online application",
    "linkedRequirementId": "req_er_001",
    "linkedCase": "NB98-9989870",
    "linkedCaseId": "NB98-9989870",
    "fileSize": "No file",
    "fileType": "PDF",
    "fileAvailable": false,
    "placeholderReason": "Requirement seed references this evidence document, but no source file was provided yet.",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB98-9989870",
        "label": "New Business — Simplified Underwriting"
      },
      {
        "kind": "requirement",
        "id": "req_er_001",
        "label": "Signed SBLI online application"
      }
    ]
  },
  {
    "id": "doc_mib_nb98",
    "kind": "document",
    "label": "MIB report evidence",
    "filename": "mib_report_nb98.pdf",
    "category": "Medical",
    "status": "Validated",
    "stage": "application_received",
    "uploaded": null,
    "uploadedAt": null,
    "source": "MIB",
    "reqContext": "Clean MIB result confirms the fourth and final accelerated UW criterion. No-exam path confirmed. Same-day coverage eligible pending tele-interview.",
    "insights": [],
    "followUps": 0,
    "insight": "MIB check returned no records for Elena Rossi. All four accelerated UW eligibility criteria confirmed. Routed to SBLI Simple Term no-exam path. Same-day coverage eligible.",
    "aiInsight": true,
    "aiConfidence": 92,
    "aiSummary": "MIB check returned no records for Elena Rossi. All four accelerated UW eligibility criteria confirmed. Routed to SBLI Simple Term no-exam path. Same-day coverage eligible.",
    "aiAction": "Review extracted evidence",
    "linkedRequirement": "MIB report",
    "linkedRequirementId": "req_er_002",
    "linkedCase": "NB98-9989870",
    "linkedCaseId": "NB98-9989870",
    "fileSize": "No file",
    "fileType": "PDF",
    "fileAvailable": false,
    "placeholderReason": "Requirement seed references this evidence document, but no source file was provided yet.",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB98-9989870",
        "label": "New Business — Simplified Underwriting"
      },
      {
        "kind": "requirement",
        "id": "req_er_002",
        "label": "MIB report"
      }
    ]
  },
  {
    "id": "doc_uw_nb98",
    "kind": "document",
    "label": "SBLI health questionnaire (tele-interview) evidence",
    "filename": "sbli_health_questionnaire_tele_interview.pdf",
    "category": "Medical",
    "status": "Processing",
    "stage": "tele_interview",
    "uploaded": null,
    "uploadedAt": null,
    "source": "telephony_system",
    "reqContext": "Tele-interview is the only underwriting step for SBLI Simple Term Life. No blood draw or physical exam required. Covers all four SBLI health questionnaire sections.",
    "insights": [],
    "followUps": 0,
    "insight": "Tele-interview scheduled May 17 at 10:00 AM. Richard Daniels assigned. Four questionnaire sections to be completed. AI scoring runs automatically post-interview submission.",
    "aiInsight": true,
    "aiConfidence": 84,
    "aiSummary": "Tele-interview scheduled May 17 at 10:00 AM. Richard Daniels assigned. Four questionnaire sections to be completed. AI scoring runs automatically post-interview submission.",
    "aiAction": "Await evidence file",
    "linkedRequirement": "SBLI health questionnaire (tele-interview)",
    "linkedRequirementId": "req_er_003",
    "linkedCase": "NB98-9989870",
    "linkedCaseId": "NB98-9989870",
    "fileSize": "No file",
    "fileType": "PDF",
    "fileAvailable": false,
    "placeholderReason": "Requirement seed references this evidence document, but no source file was provided yet.",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB98-9989870",
        "label": "New Business — Simplified Underwriting"
      },
      {
        "kind": "requirement",
        "id": "req_er_003",
        "label": "SBLI health questionnaire (tele-interview)"
      }
    ]
  }
];

export const SBLI_REQUIREMENT_TASK_RECORDS: DatasetTaskRecord[] = [
  {
    "id": "task_cd6110",
    "kind": "task",
    "taskId": "task_cd6110",
    "label": "Attending Physician Statement (APS) follow-up",
    "status": "Completed",
    "priority": "Normal",
    "assignee": "Dr. Harmon — Portland Cardiology Group",
    "assigneeKind": "user",
    "caseType": "CD",
    "caseSubtype": "death_benefit",
    "hasAI": true,
    "aiSummary": "APS from Dr. Harmon confirms cause of death is consistent with Thomas Dupont's disclosed cardiac history. No red flags or undisclosed conditions noted.",
    "aiAction": "Review requirement",
    "alert": null,
    "dueDate": "2026-02-12",
    "stage": "requirement_gathering",
    "slaRemaining": "2026-02-12",
    "slaStatus": "normal",
    "origin": "medical_provider",
    "sourceContext": "SBLI requirement seed",
    "createdDate": "2026-02-04",
    "description": "APS from Dr. Harmon confirms cause of death is consistent with Thomas Dupont's disclosed cardiac history. No red flags or undisclosed conditions noted.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Fulfilled",
      "contextTitle": "Attending Physician Statement (APS)",
      "contextSummary": "APS from Dr. Harmon confirms cause of death is consistent with Thomas Dupont's disclosed cardiac history. No red flags or undisclosed conditions noted.",
      "suggestions": [
        "APS from treating or attending physician",
        "Confirms cause of death",
        "References prior medical history"
      ],
      "evidenceDocumentId": "doc_aps_cd44"
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "Claim — Death Benefit"
      },
      {
        "kind": "requirement",
        "id": "req_sd_003",
        "label": "Attending Physician Statement (APS)"
      },
      {
        "kind": "document",
        "id": "doc_aps_cd44",
        "label": "doc_aps_cd44"
      }
    ]
  },
  {
    "id": "task_cd6112",
    "kind": "task",
    "taskId": "task_cd6112",
    "label": "Claimant identity verification follow-up",
    "status": "Completed",
    "priority": "Normal",
    "assignee": "Richard Daniels",
    "assigneeKind": "user",
    "caseType": "CD",
    "caseSubtype": "death_benefit",
    "hasAI": true,
    "aiSummary": "Marie Dupont identity confirmed via government-issued ID. Name, date of birth, and address match policy records and portal submission.",
    "aiAction": "Review requirement",
    "alert": null,
    "dueDate": "2026-02-10",
    "stage": "requirement_gathering",
    "slaRemaining": "2026-02-10",
    "slaStatus": "normal",
    "origin": "id_verification",
    "sourceContext": "SBLI requirement seed",
    "createdDate": "2026-02-04",
    "description": "Marie Dupont identity confirmed via government-issued ID. Name, date of birth, and address match policy records and portal submission.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Fulfilled",
      "contextTitle": "Claimant identity verification",
      "contextSummary": "Marie Dupont identity confirmed via government-issued ID. Name, date of birth, and address match policy records and portal submission.",
      "suggestions": [
        "Government-issued photo ID (passport or driver's license)",
        "Name matches policy beneficiary record",
        "DOB confirmed"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "Claim — Death Benefit"
      },
      {
        "kind": "requirement",
        "id": "req_sd_005",
        "label": "Claimant identity verification"
      }
    ]
  },
  {
    "id": "task_nb2032",
    "kind": "task",
    "taskId": "task_nb2032",
    "label": "Identity verification follow-up",
    "status": "To Do",
    "priority": "Normal",
    "assignee": "System (AI Agent — auto-triggered post-interview)",
    "assigneeKind": "team",
    "caseType": "NB",
    "caseSubtype": "simplified_underwriting",
    "hasAI": true,
    "aiSummary": "Identity verification not yet initiated. Will be triggered automatically upon completion of the tele-interview. Standard government ID check against application name, DOB, and address.",
    "aiAction": "Review requirement",
    "alert": {
      "type": "warning",
      "message": "Final decision (NB-2040) cannot be issued without identity verification. Auto-triggered post-interview — will initiate automatically when NB-2021 is completed."
    },
    "dueDate": "2026-05-18",
    "stage": "questionnaire_review",
    "slaRemaining": "2026-05-18",
    "slaStatus": "normal",
    "origin": "id_verification",
    "sourceContext": "SBLI requirement seed",
    "createdDate": "2026-05-13",
    "description": "Identity verification not yet initiated. Will be triggered automatically upon completion of the tele-interview. Standard government ID check against application name, DOB, and address.",
    "queue": "team_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Not Started",
      "contextTitle": "Identity verification",
      "contextSummary": "Identity verification not yet initiated. Will be triggered automatically upon completion of the tele-interview. Standard government ID check against application name, DOB, and address.",
      "suggestions": [
        "Government ID verified against application name and DOB",
        "Address confirmed or discrepancy explained",
        "ID document not expired"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB98-9989870",
        "label": "New Business — Simplified Underwriting"
      },
      {
        "kind": "requirement",
        "id": "req_er_004",
        "label": "Identity verification"
      }
    ]
  }
];

export const SBLI_REQUIREMENT_DOCUMENT_LINKS: Array<{
  id: string;
  caseId: string;
  requirementIds: string[];
  requirementLabels: string[];
}> = [
  {
    "id": "doc_wop_form_cd26",
    "caseId": "CD26-5546112",
    "requirementIds": [
      "req_bb_001"
    ],
    "requirementLabels": [
      "FNOL — WOP claim form"
    ]
  },
  {
    "id": "doc_policy_cd26",
    "caseId": "CD26-5546112",
    "requirementIds": [
      "req_bb_002"
    ],
    "requirementLabels": [
      "Policy & rider verification"
    ]
  },
  {
    "id": "doc_employer_cd26",
    "caseId": "CD26-5546112",
    "requirementIds": [
      "req_bb_003"
    ],
    "requirementLabels": [
      "Employer inability-to-work confirmation"
    ]
  },
  {
    "id": "doc_aps_cd26",
    "caseId": "CD26-5546112",
    "requirementIds": [
      "req_bb_004"
    ],
    "requirementLabels": [
      "Attending Physician Statement (APS)"
    ]
  },
  {
    "id": "doc_surgical_cd26",
    "caseId": "CD26-5546112",
    "requirementIds": [
      "req_bb_005"
    ],
    "requirementLabels": [
      "Surgical Report — Right Knee"
    ]
  },
  {
    "id": "doc_death_cert_cd44",
    "caseId": "CD44-6679812",
    "requirementIds": [
      "req_sd_002"
    ],
    "requirementLabels": [
      "Certified Death Certificate"
    ]
  },
  {
    "id": "doc_aps_cd44",
    "caseId": "CD44-6679812",
    "requirementIds": [
      "req_sd_003"
    ],
    "requirementLabels": [
      "Attending Physician Statement (APS)"
    ]
  },
  {
    "id": "doc_mib_cd44",
    "caseId": "CD44-6679812",
    "requirementIds": [
      "req_sd_007"
    ],
    "requirementLabels": [
      "Contestability review — MIB vs. application"
    ]
  },
  {
    "id": "doc_app_nb66",
    "caseId": "NB66-7622343",
    "requirementIds": [
      "req_mt_001"
    ],
    "requirementLabels": [
      "Signed application form"
    ]
  },
  {
    "id": "doc_mib_nb66",
    "caseId": "NB66-7622343",
    "requirementIds": [
      "req_mt_002"
    ],
    "requirementLabels": [
      "MIB report"
    ]
  },
  {
    "id": "doc_mvr_nb66",
    "caseId": "NB66-7622343",
    "requirementIds": [
      "req_mt_003"
    ],
    "requirementLabels": [
      "MVR (Motor Vehicle Report)"
    ]
  },
  {
    "id": "doc_rx_nb66",
    "caseId": "NB66-7622343",
    "requirementIds": [
      "req_mt_004"
    ],
    "requirementLabels": [
      "Prescription history check"
    ]
  },
  {
    "id": "doc_app_nb98",
    "caseId": "NB98-9989870",
    "requirementIds": [
      "req_er_001"
    ],
    "requirementLabels": [
      "Signed SBLI online application"
    ]
  },
  {
    "id": "doc_mib_nb98",
    "caseId": "NB98-9989870",
    "requirementIds": [
      "req_er_002"
    ],
    "requirementLabels": [
      "MIB report"
    ]
  },
  {
    "id": "doc_uw_nb98",
    "caseId": "NB98-9989870",
    "requirementIds": [
      "req_er_003"
    ],
    "requirementLabels": [
      "SBLI health questionnaire (tele-interview)"
    ]
  }
];
