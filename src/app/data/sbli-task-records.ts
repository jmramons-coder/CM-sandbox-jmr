import type { DatasetDocumentRecord, DatasetRequirementRecord, DatasetTaskRecord, DocumentEvidenceRecord } from './multi-case-dataset';

export const SBLI_TASK_RECORDS: DatasetTaskRecord[] = [
  {
    "id": "task_cd5180",
    "kind": "task",
    "taskId": "task_cd5180",
    "label": "Register WOP claim & verify rider in force",
    "status": "Completed",
    "priority": "Normal",
    "assignee": "Victor Ramon",
    "assigneeKind": "user",
    "caseType": "CD",
    "caseSubtype": "disability_benefit",
    "hasAI": false,
    "aiGenerated": false,
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "Register WOP claim & verify rider in force",
      "description": "Validate that the Waiver of Premium rider is active on policy SBLI-TL-2021-004821 and create the claim record in Amplify. Confirm policy is in force and that the disability event qualifies under the WOP rider definition.",
      "checklist": [
        "Confirm policy in-force status in policy admin system",
        "Verify WOP rider is active and not excluded",
        "Create claim record — sub-type: Waiver of premium",
        "Set initial status to FNOL received"
      ]
    },
    "aiNarrative": null,
    "evidenceDocuments": [
      {
        "id": "doc_wop_form_cd26",
        "name": "WOP Claim Form — Billy Bud.pdf",
        "size": "240 KB",
        "category": "Claim",
        "aiSummary": "FNOL complete. Total disability and accident date declared by claimant.",
        "followUps": 0
      },
      {
        "id": "doc_policy_cd26",
        "name": "Policy Certificate — SBLI-TL-2021-004821.pdf",
        "size": "320 KB",
        "category": "Policy",
        "aiSummary": "Policy in force. WOP rider confirmed active since policy issue Mar 2021.",
        "followUps": 0
      }
    ],
    "contextCards": [
      {
        "type": "step_readiness",
        "stageLabel": "FNOL RECEIVED",
        "description": "Policy verified in force. WOP rider active since Mar 2021.",
        "stats": {
          "status": "FNOL received",
          "requirements": "0/7",
          "open": "0",
          "docs": "2"
        },
        "actionBtn": "Open case"
      },
      {
        "type": "policy_card",
        "contextLabel": "policy context",
        "title": "Policy snapshot",
        "description": "SBLI Term Life 20 | $500,000 death benefit | WOP rider active | Term 2021–2041",
        "kv": [
          {
            "label": "Policy number",
            "value": "SBLI-TL-2021-004821"
          },
          {
            "label": "WOP rider",
            "value": "Active since Mar 2021"
          },
          {
            "label": "Monthly premium",
            "value": "$38/month"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      }
    ],
    "dueDate": "2026-01-30",
    "stage": "fnol_received",
    "slaRemaining": "2026-01-30",
    "slaStatus": "normal",
    "origin": "FNOL received",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-01-30",
    "description": "Validate that the Waiver of Premium rider is active on policy SBLI-TL-2021-004821 and create the claim record in Amplify. Confirm policy is in force and that the disability event qualifies under the WOP rider definition.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Completed",
      "contextTitle": "Register WOP claim & verify rider in force",
      "contextSummary": "Validate that the Waiver of Premium rider is active on policy SBLI-TL-2021-004821 and create the claim record in Amplify. Confirm policy is in force and that the disability event qualifies under the WOP rider definition.",
      "suggestions": [
        "Confirm policy in-force status in policy admin system",
        "Verify WOP rider is active and not excluded",
        "Create claim record — sub-type: Waiver of premium",
        "Set initial status to FNOL received"
      ],
      "evidenceDocumentId": "doc_wop_form_cd26"
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "document",
        "id": "doc_wop_form_cd26",
        "label": "WOP Claim Form — Billy Bud.pdf"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_fnol_wop_claim_form",
        "label": "FNOL — WOP claim form"
      },
      {
        "kind": "document",
        "id": "doc_policy_cd26",
        "label": "Policy Certificate — SBLI-TL-2021-004821.pdf"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_policy_rider_verification",
        "label": "Policy & rider verification"
      }
    ]
  },
  {
    "id": "task_cd5181",
    "kind": "task",
    "taskId": "task_cd5181",
    "label": "Triage: assign to life claims — WOP",
    "status": "Completed",
    "priority": "Normal",
    "assignee": "System",
    "assigneeKind": "team",
    "caseType": "CD",
    "caseSubtype": "disability_benefit",
    "hasAI": false,
    "aiGenerated": false,
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "Triage: assign to life claims — WOP",
      "description": "Route the newly registered WOP claim to the appropriate life claims assessor team. Check occupational class and benefit type to assign the correct team queue. Billy Bud is Class 4 (manual labour) — route to disability claims specialist team.",
      "checklist": [
        "Review claim sub-type — WOP / disability",
        "Check occupational class (Class 4 — manual labour)",
        "Route to life claims disability team",
        "Set SLA clock — 30 business days from FNOL"
      ]
    },
    "aiNarrative": null,
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "step_readiness",
        "stageLabel": "INITIAL TRIAGE",
        "description": "Claim registered and ready for triage routing.",
        "stats": {
          "status": "Initial triage",
          "requirements": "0/7",
          "open": "0",
          "docs": "0"
        },
        "actionBtn": "Open case"
      },
      {
        "type": "claim_snapshot",
        "claimId": "CD26-5546112",
        "description": "Motorcycle accident Jan 30, 2026. Total disability claim.",
        "kv": [
          {
            "label": "Date of loss",
            "value": "Jan 30, 2026"
          },
          {
            "label": "Cause",
            "value": "Motorcycle accident"
          },
          {
            "label": "Benefit type",
            "value": "Waiver of premium"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      }
    ],
    "dueDate": "2026-02-01",
    "stage": "initial_triage",
    "slaRemaining": "2026-02-01",
    "slaStatus": "normal",
    "origin": "Initial triage",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-02-01",
    "description": "Route the newly registered WOP claim to the appropriate life claims assessor team. Check occupational class and benefit type to assign the correct team queue. Billy Bud is Class 4 (manual labour) — route to disability claims specialist team.",
    "queue": "team_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Completed",
      "contextTitle": "Triage: assign to life claims — WOP",
      "contextSummary": "Route the newly registered WOP claim to the appropriate life claims assessor team. Check occupational class and benefit type to assign the correct team queue. Billy Bud is Class 4 (manual labour) — route to disability claims specialist team.",
      "suggestions": [
        "Review claim sub-type — WOP / disability",
        "Check occupational class (Class 4 — manual labour)",
        "Route to life claims disability team",
        "Set SLA clock — 30 business days from FNOL"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      }
    ]
  },
  {
    "id": "task_cd5190",
    "kind": "task",
    "taskId": "task_cd5190",
    "label": "Request employer inability-to-work confirmation",
    "status": "Completed",
    "priority": "High",
    "assignee": "Victor Ramon",
    "assigneeKind": "user",
    "caseType": "CD",
    "caseSubtype": "disability_benefit",
    "hasAI": false,
    "aiGenerated": false,
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "Request employer inability-to-work confirmation",
      "description": "Contact FastRoute Couriers HR to request a formal letter confirming Billy Bud's employment status, last day worked, and ongoing absence. Required to satisfy the unable-to-work-for-profit definition under the WOP rider.",
      "checklist": [
        "Locate employer contact in policy admin",
        "Draft employer confirmation request",
        "Send via employer portal",
        "Set follow-up date for Feb 12",
        "Flag as blocking if not received by Feb 12"
      ]
    },
    "aiNarrative": null,
    "evidenceDocuments": [
      {
        "id": "doc_employer_cd26",
        "name": "Employer Confirmation Letter.pdf",
        "size": "180 KB",
        "category": "Employment",
        "aiSummary": "FastRoute Couriers confirms last day worked Jan 30, 2026 and ongoing absence.",
        "followUps": 0
      }
    ],
    "contextCards": [
      {
        "type": "person_card",
        "contextLabel": "claimant context",
        "title": "Insured — Billy Bud",
        "description": "Motorcycle courier, Class 4. Accident Jan 30, 2026. Currently unable to perform any courier duties.",
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
      {
        "type": "step_readiness",
        "stageLabel": "REQ. GATHERING",
        "description": "Employer confirmation required to validate unable-to-work-for-profit definition.",
        "stats": {
          "status": "Req. gathering",
          "requirements": "2/7",
          "open": "3",
          "docs": "1"
        },
        "actionBtn": "Open case"
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      },
      {
        "type": "add_requirement",
        "label": "Add requirement"
      }
    ],
    "dueDate": "2026-02-08",
    "stage": "requirement_gathering",
    "slaRemaining": "2026-02-08",
    "slaStatus": "warning",
    "origin": "Req. gathering",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-02-08",
    "description": "Contact FastRoute Couriers HR to request a formal letter confirming Billy Bud's employment status, last day worked, and ongoing absence. Required to satisfy the unable-to-work-for-profit definition under the WOP rider.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Completed",
      "contextTitle": "Request employer inability-to-work confirmation",
      "contextSummary": "Contact FastRoute Couriers HR to request a formal letter confirming Billy Bud's employment status, last day worked, and ongoing absence. Required to satisfy the unable-to-work-for-profit definition under the WOP rider.",
      "suggestions": [
        "Locate employer contact in policy admin",
        "Draft employer confirmation request",
        "Send via employer portal",
        "Set follow-up date for Feb 12",
        "Flag as blocking if not received by Feb 12"
      ],
      "evidenceDocumentId": "doc_employer_cd26"
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "document",
        "id": "doc_employer_cd26",
        "label": "Employer Confirmation Letter.pdf"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_employer_inability_to_work_confirmation",
        "label": "Employer inability-to-work confirmation"
      }
    ]
  },
  {
    "id": "task_cd5191",
    "kind": "task",
    "taskId": "task_cd5191",
    "label": "Order APS from Dr. Chen",
    "status": "Completed",
    "priority": "High",
    "assignee": "Victor Ramon",
    "assigneeKind": "user",
    "caseType": "CD",
    "caseSubtype": "disability_benefit",
    "hasAI": false,
    "aiGenerated": false,
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "Order APS from Dr. Chen",
      "description": "Request the Attending Physician Statement from Dr. Chen (St. Luke's Orthopedics) covering Billy Bud's right knee replacement and functional prognosis. The APS must confirm total disability under the own-occupation and unable-to-work-for-profit definitions.",
      "checklist": [
        "Access SBLI medical provider portal",
        "Locate Dr. Chen — St. Luke's Orthopedics",
        "Submit APS request — specify WOP disability standard",
        "Set follow-up date for Feb 18",
        "Note: APS must confirm total disability definition explicitly"
      ]
    },
    "aiNarrative": null,
    "evidenceDocuments": [
      {
        "id": "doc_aps_cd26",
        "name": "Attending Physician Statement.pdf",
        "size": "890 KB",
        "category": "Medical",
        "aiSummary": "APS confirms functional limitation and supports claim decision readiness.",
        "followUps": 2
      }
    ],
    "contextCards": [
      {
        "type": "person_card",
        "contextLabel": "claimant context",
        "title": "Insured — Billy Bud",
        "description": "Right knee replacement Jan 30, 2026. Orthopedic case — functional limitation assessment required.",
        "kv": [
          {
            "label": "Diagnosis",
            "value": "S82.2 · M17.1"
          },
          {
            "label": "Surgeon",
            "value": "Dr. Chen, St. Luke's"
          },
          {
            "label": "Disability definition",
            "value": "Own occupation"
          }
        ]
      },
      {
        "type": "step_readiness",
        "stageLabel": "REQ. GATHERING",
        "description": "APS is the primary medical evidence for total disability determination.",
        "stats": {
          "status": "Req. gathering",
          "requirements": "3/7",
          "open": "2",
          "docs": "2"
        },
        "actionBtn": "Open case"
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      },
      {
        "type": "add_requirement",
        "label": "Add requirement"
      }
    ],
    "dueDate": "2026-02-10",
    "stage": "requirement_gathering",
    "slaRemaining": "2026-02-10",
    "slaStatus": "warning",
    "origin": "Req. gathering",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-02-10",
    "description": "Request the Attending Physician Statement from Dr. Chen (St. Luke's Orthopedics) covering Billy Bud's right knee replacement and functional prognosis. The APS must confirm total disability under the own-occupation and unable-to-work-for-profit definitions.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Completed",
      "contextTitle": "Order APS from Dr. Chen",
      "contextSummary": "Request the Attending Physician Statement from Dr. Chen (St. Luke's Orthopedics) covering Billy Bud's right knee replacement and functional prognosis. The APS must confirm total disability under the own-occupation and unable-to-work-for-profit definitions.",
      "suggestions": [
        "Access SBLI medical provider portal",
        "Locate Dr. Chen — St. Luke's Orthopedics",
        "Submit APS request — specify WOP disability standard",
        "Set follow-up date for Feb 18",
        "Note: APS must confirm total disability definition explicitly"
      ],
      "evidenceDocumentId": "doc_aps_cd26"
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "document",
        "id": "doc_aps_cd26",
        "label": "Attending Physician Statement.pdf"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_attending_physician_statement",
        "label": "Attending Physician Statement"
      }
    ]
  },
  {
    "id": "task_cd5203",
    "kind": "task",
    "taskId": "task_cd5203",
    "label": "Chase FCE — overdue",
    "status": "In Queue",
    "priority": "High",
    "assignee": "Richard Daniels",
    "assigneeKind": "user",
    "caseType": "CD",
    "caseSubtype": "disability_benefit",
    "hasAI": false,
    "aiGenerated": false,
    "alert": {
      "type": "overdue",
      "message": "FCE overdue by 35 days. This is a blocking requirement for the medical review stage. SLA breached — escalate if not received by end of day."
    },
    "summary": {
      "contextLabel": "Task context",
      "title": "Chase FCE — overdue",
      "description": "The Functional Capacity Evaluation from the specialist is 35 days overdue. This document is required to confirm the total disability standard. Contact the specialist directly and escalate if no response within 24 hours.",
      "checklist": [
        "Check portal for any uploaded FCE document",
        "Call specialist office directly (second contact)",
        "Send formal chase letter if no verbal response",
        "Update requirement status and log communication",
        "Escalate to Victor Ramon if no response by 5pm"
      ]
    },
    "aiNarrative": null,
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "requirement_card",
        "stageLabel": "MEDICAL REVIEW",
        "title": "Requirement — Functional Capacity Evaluation",
        "badge": "Overdue",
        "badgeStatus": "danger",
        "description": "Ordered Mar 10 from specialist. No response received. Required to confirm total disability standard under WOP rider.",
        "kv": [
          {
            "label": "Due date",
            "value": "Mar 10, 2026"
          },
          {
            "label": "Ordered by",
            "value": "Victor Ramon"
          },
          {
            "label": "Source",
            "value": "specialist_upload"
          }
        ]
      },
      {
        "type": "step_readiness",
        "stageLabel": "MEDICAL REVIEW",
        "description": "Medical review blocked pending FCE. Pre-disability earnings verification also outstanding.",
        "stats": {
          "status": "Medical review",
          "requirements": "5/7",
          "open": "FCE",
          "docs": "5"
        },
        "actionBtn": "Open case"
      },
      {
        "type": "person_card",
        "contextLabel": "",
        "title": "Insured — Billy Bud",
        "description": "Post-surgery recovery ongoing. FCE was scheduled with specialist. Patient confirmed appointment Mar 24.",
        "kv": [
          {
            "label": "Occupation",
            "value": "Motorcycle courier"
          },
          {
            "label": "Rehab status",
            "value": "Ongoing"
          },
          {
            "label": "FCE scheduled",
            "value": "Mar 24, 2026"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      },
      {
        "type": "add_requirement",
        "label": "Add requirement"
      }
    ],
    "dueDate": "2026-05-15",
    "stage": "medical_review",
    "slaRemaining": "2026-05-15",
    "slaStatus": "danger",
    "origin": "Medical review",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-05-15",
    "description": "The Functional Capacity Evaluation from the specialist is 35 days overdue. This document is required to confirm the total disability standard. Contact the specialist directly and escalate if no response within 24 hours.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "In Queue",
      "contextTitle": "Chase FCE — overdue",
      "contextSummary": "The Functional Capacity Evaluation from the specialist is 35 days overdue. This document is required to confirm the total disability standard. Contact the specialist directly and escalate if no response within 24 hours.",
      "suggestions": [
        "Check portal for any uploaded FCE document",
        "Call specialist office directly (second contact)",
        "Send formal chase letter if no verbal response",
        "Update requirement status and log communication",
        "Escalate to Victor Ramon if no response by 5pm"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_requirement_functional_capacity_evaluation",
        "label": "Requirement — Functional Capacity Evaluation"
      }
    ]
  },
  {
    "id": "task_cd5210",
    "kind": "task",
    "taskId": "task_cd5210",
    "label": "Review surgical report & APS for total disability",
    "status": "Completed",
    "priority": "High",
    "assignee": "Victor Ramon",
    "assigneeKind": "user",
    "caseType": "CD",
    "caseSubtype": "disability_benefit",
    "hasAI": false,
    "aiGenerated": false,
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "Review surgical report & APS for total disability",
      "description": "Review the surgical report from St. Luke's and the APS from Dr. Chen. Confirm both documents collectively satisfy the total disability definition under the WOP rider. Log findings and pass to AI narrative generation.",
      "checklist": [
        "Open surgical report — confirm procedure and prognosis",
        "Open APS — confirm total disability declaration",
        "Cross-reference diagnosis codes S82.2 and M17.1",
        "Confirm no exclusions triggered",
        "Pass to AI narrative task (task_cd5211)"
      ]
    },
    "aiNarrative": null,
    "evidenceDocuments": [
      {
        "id": "doc_aps_cd26",
        "name": "Attending Physician Statement.pdf",
        "size": "890 KB",
        "category": "Medical",
        "aiSummary": "APS confirms functional limitation and supports claim decision readiness.",
        "followUps": 2
      },
      {
        "id": "doc_surgical_cd26",
        "name": "Surgical Report — Right Knee.pdf",
        "size": "1.2 MB",
        "category": "Medical",
        "aiSummary": "Right knee replacement documented. 6–9 month recovery precludes manual labour.",
        "followUps": 1
      }
    ],
    "contextCards": [
      {
        "type": "step_readiness",
        "stageLabel": "MEDICAL REVIEW",
        "description": "APS and surgical report both validated. Medical review stage progressing.",
        "stats": {
          "status": "Medical review",
          "requirements": "5/7",
          "open": "0",
          "docs": "5"
        },
        "actionBtn": "Open case"
      },
      {
        "type": "claim_snapshot",
        "contextLabel": "claim context",
        "title": "Claim snapshot",
        "description": "Motorcycle accident Jan 30, 2026. Right knee replacement. Total disability onset same date.",
        "kv": [
          {
            "label": "Date of loss",
            "value": "Jan 30, 2026"
          },
          {
            "label": "Cause",
            "value": "Motorcycle accident"
          },
          {
            "label": "Claim end",
            "value": "TBD — pending decision"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      },
      {
        "type": "complete_return",
        "label": "Complete & Return to me"
      }
    ],
    "dueDate": "2026-03-08",
    "stage": "medical_review",
    "slaRemaining": "2026-03-08",
    "slaStatus": "warning",
    "origin": "Medical review",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-03-08",
    "description": "Review the surgical report from St. Luke's and the APS from Dr. Chen. Confirm both documents collectively satisfy the total disability definition under the WOP rider. Log findings and pass to AI narrative generation.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Completed",
      "contextTitle": "Review surgical report & APS for total disability",
      "contextSummary": "Review the surgical report from St. Luke's and the APS from Dr. Chen. Confirm both documents collectively satisfy the total disability definition under the WOP rider. Log findings and pass to AI narrative generation.",
      "suggestions": [
        "Open surgical report — confirm procedure and prognosis",
        "Open APS — confirm total disability declaration",
        "Cross-reference diagnosis codes S82.2 and M17.1",
        "Confirm no exclusions triggered",
        "Pass to AI narrative task (task_cd5211)"
      ],
      "evidenceDocumentId": "doc_aps_cd26"
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "document",
        "id": "doc_aps_cd26",
        "label": "Attending Physician Statement.pdf"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_attending_physician_statement",
        "label": "Attending Physician Statement"
      },
      {
        "kind": "document",
        "id": "doc_surgical_cd26",
        "label": "Surgical Report — Right Knee.pdf"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_surgical_report",
        "label": "Surgical Report"
      }
    ]
  },
  {
    "id": "task_cd5211",
    "kind": "task",
    "taskId": "task_cd5211",
    "label": "AI: generate total disability assessment narrative",
    "status": "Completed",
    "priority": "Normal",
    "assignee": "AI Agent",
    "assigneeKind": "team",
    "caseType": "CD",
    "caseSubtype": "disability_benefit",
    "hasAI": true,
    "aiGenerated": true,
    "aiConfidence": 91,
    "aiSummary": "Total disability confirmed based on APS (Dr. Chen), surgical report (St. Luke's), and employer confirmation. Right knee replacement with 6–9 month recovery precludes performance of any motorcycle courier duties. Own-occupation and unable-to-work-for-profit definitions both satisfied. Pre-existing T2D (2016) managed — no exclusion applies. WOP rider conditions met.",
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "AI: generate total disability assessment narrative",
      "description": "AI has analyzed all available medical evidence and generated a structured disability assessment narrative. The narrative covers functional limitation, disability definition compliance, and absence of exclusions. Review and confirm the AI output is accurate before proceeding to decision.",
      "checklist": [
        "Review AI disability assessment narrative",
        "Verify confidence score (91%)",
        "Confirm all disability criteria addressed",
        "Approve narrative for decision stage",
        "Flag any discrepancies for manual review"
      ]
    },
    "aiNarrative": {
      "text": "Total disability confirmed based on APS (Dr. Chen), surgical report (St. Luke's), and employer confirmation. Right knee replacement with 6–9 month recovery precludes performance of any motorcycle courier duties. Own-occupation and unable-to-work-for-profit definitions both satisfied. Pre-existing T2D (2016) managed — no exclusion applies. WOP rider conditions met.",
      "confidence": 91,
      "generatedBy": "AI Agent",
      "generatedAt": "2026-03-09"
    },
    "evidenceDocuments": [
      {
        "id": "doc_aps_cd26",
        "name": "Attending Physician Statement.pdf",
        "size": "890 KB",
        "category": "Medical",
        "aiSummary": "APS confirms functional limitation and supports claim decision readiness.",
        "followUps": 2
      }
    ],
    "contextCards": [
      {
        "type": "step_readiness",
        "stageLabel": "MEDICAL REVIEW",
        "description": "AI narrative generated. All medical evidence assessed. Disability conditions met.",
        "stats": {
          "status": "Medical review",
          "requirements": "5/7",
          "open": "0",
          "docs": "5"
        },
        "actionBtn": "Open case"
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      }
    ],
    "dueDate": "2026-03-09",
    "stage": "medical_review",
    "slaRemaining": "2026-03-09",
    "slaStatus": "normal",
    "origin": "Medical review",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-03-09",
    "description": "AI has analyzed all available medical evidence and generated a structured disability assessment narrative. The narrative covers functional limitation, disability definition compliance, and absence of exclusions. Review and confirm the AI output is accurate before proceeding to decision.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Completed",
      "contextTitle": "AI: generate total disability assessment narrative",
      "contextSummary": "AI has analyzed all available medical evidence and generated a structured disability assessment narrative. The narrative covers functional limitation, disability definition compliance, and absence of exclusions. Review and confirm the AI output is accurate before proceeding to decision.",
      "suggestions": [
        "Review AI disability assessment narrative",
        "Verify confidence score (91%)",
        "Confirm all disability criteria addressed",
        "Approve narrative for decision stage",
        "Flag any discrepancies for manual review"
      ],
      "evidenceDocumentId": "doc_aps_cd26"
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "document",
        "id": "doc_aps_cd26",
        "label": "Attending Physician Statement.pdf"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_attending_physician_statement",
        "label": "Attending Physician Statement"
      }
    ]
  },
  {
    "id": "task_cd5220",
    "kind": "task",
    "taskId": "task_cd5220",
    "label": "Chase pre-disability earnings verification",
    "status": "In Queue",
    "priority": "High",
    "assignee": "Richard Daniels",
    "assigneeKind": "user",
    "caseType": "CD",
    "caseSubtype": "disability_benefit",
    "hasAI": false,
    "aiGenerated": false,
    "alert": {
      "type": "warning",
      "message": "Pre-disability earnings verification is required before WOP approval can be issued. Payout calculation depends on this document."
    },
    "summary": {
      "contextLabel": "Task context",
      "title": "Chase pre-disability earnings verification",
      "description": "The pre-disability earnings statement from FastRoute Couriers payroll system is outstanding. Required to confirm the monthly premium waiver amount and benefit period. Contact payroll directly and escalate if not received by end of day.",
      "checklist": [
        "Contact FastRoute payroll department",
        "Request earnings statement for Jan 2025 – Jan 2026",
        "Confirm monthly earnings match policy benefit",
        "Upload to case when received",
        "Escalate to Victor Ramon if not received by EOD"
      ]
    },
    "aiNarrative": null,
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "policy_card",
        "contextLabel": "claim benefit context",
        "title": "Benefit context",
        "description": "Monthly WOP benefit tied to pre-disability earnings. Policy: $38/month premium waiver upon approval.",
        "kv": [
          {
            "label": "Monthly premium to waive",
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
      {
        "type": "step_readiness",
        "stageLabel": "DECISION",
        "description": "Decision stage. 2 requirements outstanding (FCE, earnings verification). Core disability evidence complete.",
        "stats": {
          "status": "Pending decision",
          "requirements": "5/7",
          "open": "2",
          "docs": "5"
        },
        "actionBtn": "Open case"
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      },
      {
        "type": "add_requirement",
        "label": "Add requirement"
      }
    ],
    "dueDate": "2026-05-15",
    "stage": "decision",
    "slaRemaining": "2026-05-15",
    "slaStatus": "warning",
    "origin": "Decision",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-05-15",
    "description": "The pre-disability earnings statement from FastRoute Couriers payroll system is outstanding. Required to confirm the monthly premium waiver amount and benefit period. Contact payroll directly and escalate if not received by end of day.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "In Queue",
      "contextTitle": "Chase pre-disability earnings verification",
      "contextSummary": "The pre-disability earnings statement from FastRoute Couriers payroll system is outstanding. Required to confirm the monthly premium waiver amount and benefit period. Contact payroll directly and escalate if not received by end of day.",
      "suggestions": [
        "Contact FastRoute payroll department",
        "Request earnings statement for Jan 2025 – Jan 2026",
        "Confirm monthly earnings match policy benefit",
        "Upload to case when received",
        "Escalate to Victor Ramon if not received by EOD"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      }
    ]
  },
  {
    "id": "task_cd5221",
    "kind": "task",
    "taskId": "task_cd5221",
    "label": "Approve WOP rider — waive premiums",
    "status": "In Queue",
    "priority": "High",
    "assignee": "Victor Ramon",
    "assigneeKind": "user",
    "caseType": "CD",
    "caseSubtype": "disability_benefit",
    "hasAI": true,
    "aiGenerated": true,
    "aiConfidence": 91,
    "aiSummary": "Total disability confirmed. Own-occupation and unable-to-work-for-profit definitions both satisfied. Pre-existing T2D — no exclusion applies. WOP rider conditions met. Recommend approval.",
    "alert": null,
    "summary": {
      "contextLabel": "Decision control point",
      "title": "Approve WOP rider — waive premiums",
      "description": "All core conditions for WOP rider approval are met. Review the complete disability file, confirm the total disability standard is satisfied, and issue the WOP approval decision. Premiums are retroactively waiveable from Jan 30, 2026.",
      "checklist": [
        "Confirm FCE received (or proceed with available evidence)",
        "Confirm earnings verification received",
        "Review AI disability assessment (confidence 91%)",
        "Verify no policy exclusions apply",
        "Issue WOP approval — waive monthly premiums from Jan 30, 2026",
        "Trigger payment adjustment event to policy admin system"
      ]
    },
    "aiNarrative": {
      "text": "Total disability confirmed. Own-occupation and unable-to-work-for-profit definitions both satisfied. Pre-existing T2D — no exclusion applies. WOP rider conditions met. Recommend approval.",
      "confidence": 91,
      "generatedBy": "AI Agent",
      "generatedAt": "2026-03-09"
    },
    "evidenceDocuments": [
      {
        "id": "doc_aps_cd26",
        "name": "Attending Physician Statement.pdf",
        "size": "890 KB",
        "category": "Medical",
        "aiSummary": "APS confirms functional limitation and supports claim decision readiness.",
        "followUps": 2
      },
      {
        "id": "doc_surgical_cd26",
        "name": "Surgical Report — Right Knee.pdf",
        "size": "1.2 MB",
        "category": "Medical",
        "aiSummary": "Right knee replacement documented. 6–9 month recovery precludes manual labour.",
        "followUps": 1
      }
    ],
    "contextCards": [
      {
        "type": "scoring_factors",
        "stageLabel": "DECISION",
        "title": "AI disability assessment",
        "badge": "Confidence 91%",
        "badgeStatus": "ai",
        "description": "AI narrative generated Mar 9, 2026. All disability conditions assessed as met.",
        "factors": [
          {
            "name": "APS confirms total disability",
            "direction": "positive",
            "pct": 95
          },
          {
            "name": "Surgical report — knee replacement",
            "direction": "positive",
            "pct": 90
          },
          {
            "name": "Employer confirmation received",
            "direction": "positive",
            "pct": 100
          },
          {
            "name": "Pre-existing T2D — no exclusion",
            "direction": "positive",
            "pct": 85
          },
          {
            "name": "FCE pending — minor uncertainty",
            "direction": "negative",
            "pct": 30
          }
        ]
      },
      {
        "type": "step_readiness",
        "stageLabel": "DECISION",
        "description": "Decision stage. Core disability evidence complete. 2 minor requirements outstanding.",
        "stats": {
          "status": "Pending decision",
          "requirements": "5/7",
          "open": "2",
          "docs": "5"
        },
        "actionBtn": "Open case"
      },
      {
        "type": "policy_card",
        "contextLabel": "policy benefit context",
        "title": "WOP premium schedule",
        "description": "Monthly premium $38. Retroactive waiver from Jan 30, 2026 pending approval.",
        "kv": [
          {
            "label": "Monthly premium",
            "value": "$38/month"
          },
          {
            "label": "Waiver from",
            "value": "Jan 30, 2026"
          },
          {
            "label": "Waiting period",
            "value": "90 days — satisfied"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      },
      {
        "type": "complete_return",
        "label": "Complete & Return to me"
      },
      {
        "type": "send_approver",
        "label": "Send to approver"
      }
    ],
    "dueDate": "2026-05-15",
    "stage": "decision",
    "slaRemaining": "2026-05-15",
    "slaStatus": "warning",
    "origin": "Decision",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-05-15",
    "description": "All core conditions for WOP rider approval are met. Review the complete disability file, confirm the total disability standard is satisfied, and issue the WOP approval decision. Premiums are retroactively waiveable from Jan 30, 2026.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 2,
    "panelContext": {
      "summaryStatus": "In Queue",
      "contextTitle": "Approve WOP rider — waive premiums",
      "contextSummary": "All core conditions for WOP rider approval are met. Review the complete disability file, confirm the total disability standard is satisfied, and issue the WOP approval decision. Premiums are retroactively waiveable from Jan 30, 2026.",
      "suggestions": [
        "Confirm FCE received (or proceed with available evidence)",
        "Confirm earnings verification received",
        "Review AI disability assessment (confidence 91%)",
        "Verify no policy exclusions apply",
        "Issue WOP approval — waive monthly premiums from Jan 30, 2026",
        "Trigger payment adjustment event to policy admin system"
      ],
      "evidenceDocumentId": "doc_aps_cd26"
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "document",
        "id": "doc_aps_cd26",
        "label": "Attending Physician Statement.pdf"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_attending_physician_statement",
        "label": "Attending Physician Statement"
      },
      {
        "kind": "document",
        "id": "doc_surgical_cd26",
        "label": "Surgical Report — Right Knee.pdf"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_surgical_report",
        "label": "Surgical Report"
      }
    ]
  },
  {
    "id": "task_cd6100",
    "kind": "task",
    "taskId": "task_cd6100",
    "label": "Register FNOL & verify policy in force",
    "status": "Completed",
    "priority": "Normal",
    "assignee": "System",
    "assigneeKind": "team",
    "caseType": "CD",
    "caseSubtype": "death_benefit",
    "hasAI": false,
    "aiGenerated": false,
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "Register FNOL & verify policy in force",
      "description": "Register the death benefit claim filed by Marie Dupont (spouse/beneficiary). Verify policy SBLI-TL-2019-009102 was in force on date of death (Jan 28, 2026) and that Marie Dupont is listed as primary beneficiary.",
      "checklist": [
        "Confirm policy in-force status on Jan 28, 2026",
        "Verify no premium lapses in prior 12 months",
        "Confirm Marie Dupont as 100% primary beneficiary",
        "Create death benefit claim record",
        "Set initial status to FNOL received"
      ]
    },
    "aiNarrative": null,
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "claim_snapshot",
        "claimId": "CD44-6679812",
        "description": "Death benefit claim — Thomas Dupont, acute MI, Jan 28, 2026.",
        "kv": [
          {
            "label": "Date of death",
            "value": "Jan 28, 2026"
          },
          {
            "label": "Cause",
            "value": "Acute myocardial infarction"
          },
          {
            "label": "Death benefit",
            "value": "$500,000"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      }
    ],
    "dueDate": "2026-02-03",
    "stage": "fnol_received",
    "slaRemaining": "2026-02-03",
    "slaStatus": "normal",
    "origin": "FNOL received",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-02-03",
    "description": "Register the death benefit claim filed by Marie Dupont (spouse/beneficiary). Verify policy SBLI-TL-2019-009102 was in force on date of death (Jan 28, 2026) and that Marie Dupont is listed as primary beneficiary.",
    "queue": "team_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Completed",
      "contextTitle": "Register FNOL & verify policy in force",
      "contextSummary": "Register the death benefit claim filed by Marie Dupont (spouse/beneficiary). Verify policy SBLI-TL-2019-009102 was in force on date of death (Jan 28, 2026) and that Marie Dupont is listed as primary beneficiary.",
      "suggestions": [
        "Confirm policy in-force status on Jan 28, 2026",
        "Verify no premium lapses in prior 12 months",
        "Confirm Marie Dupont as 100% primary beneficiary",
        "Create death benefit claim record",
        "Set initial status to FNOL received"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "CD44-6679812"
      }
    ]
  },
  {
    "id": "task_cd6102",
    "kind": "task",
    "taskId": "task_cd6102",
    "label": "AI: verify beneficiary & ownership",
    "status": "Completed",
    "priority": "High",
    "assignee": "AI Agent",
    "assigneeKind": "team",
    "caseType": "CD",
    "caseSubtype": "death_benefit",
    "hasAI": true,
    "aiGenerated": true,
    "aiConfidence": 98,
    "aiSummary": "Beneficiary verification complete. Marie Dupont confirmed as 100% primary beneficiary. No ownership changes since policy issue. No outstanding loans. Policy unencumbered. Contingent beneficiary: Sophie Dupont (daughter).",
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "AI: verify beneficiary & ownership",
      "description": "AI agent cross-references policy admin records to confirm beneficiary designation, ownership, and assignment at time of death. Verifies no policy loans outstanding that would reduce death benefit.",
      "checklist": [
        "Query policy admin for beneficiary record",
        "Confirm Marie Dupont — 100% primary, spouse",
        "Verify no ownership assignment changes in past 24 months",
        "Confirm no outstanding policy loans",
        "Log verification result"
      ]
    },
    "aiNarrative": {
      "text": "Beneficiary verification complete. Marie Dupont confirmed as 100% primary beneficiary. No ownership changes since policy issue. No outstanding loans. Policy unencumbered. Contingent beneficiary: Sophie Dupont (daughter).",
      "confidence": 98,
      "generatedBy": "AI Agent",
      "generatedAt": "2026-02-04"
    },
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "person_card",
        "contextLabel": "beneficiary context",
        "title": "Beneficiary — Marie Dupont",
        "description": "Spouse of insured. Primary beneficiary at 100%. Identity to be verified in requirement gathering stage.",
        "kv": [
          {
            "label": "Relationship",
            "value": "Spouse"
          },
          {
            "label": "Share",
            "value": "100%"
          },
          {
            "label": "Contingent",
            "value": "Sophie Dupont (daughter)"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      }
    ],
    "dueDate": "2026-02-04",
    "stage": "initial_triage",
    "slaRemaining": "2026-02-04",
    "slaStatus": "warning",
    "origin": "Initial triage",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-02-04",
    "description": "AI agent cross-references policy admin records to confirm beneficiary designation, ownership, and assignment at time of death. Verifies no policy loans outstanding that would reduce death benefit.",
    "queue": "team_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Completed",
      "contextTitle": "AI: verify beneficiary & ownership",
      "contextSummary": "AI agent cross-references policy admin records to confirm beneficiary designation, ownership, and assignment at time of death. Verifies no policy loans outstanding that would reduce death benefit.",
      "suggestions": [
        "Query policy admin for beneficiary record",
        "Confirm Marie Dupont — 100% primary, spouse",
        "Verify no ownership assignment changes in past 24 months",
        "Confirm no outstanding policy loans",
        "Log verification result"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "CD44-6679812"
      }
    ]
  },
  {
    "id": "task_cd6103",
    "kind": "task",
    "taskId": "task_cd6103",
    "label": "AI: contestability period calculation",
    "status": "Completed",
    "priority": "High",
    "assignee": "AI Agent",
    "assigneeKind": "team",
    "caseType": "CD",
    "caseSubtype": "death_benefit",
    "hasAI": true,
    "aiGenerated": true,
    "aiConfidence": 100,
    "aiSummary": "Contestability period calculation complete. Policy issued Feb 1, 2019. Date of death Jan 28, 2026. Policy in force for 6 years 11 months. 2-year contestability window fully lapsed. Standard review applies — no contestability investigation required. Note: standard MIB comparison still conducted per procedure.",
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "AI: contestability period calculation",
      "description": "Calculate whether the 2-year contestability period was in effect at time of death. Policy was issued Feb 2019; death occurred Jan 28, 2026. If contestability has lapsed, the claim proceeds to standard review. If within contestability, a full disclosure review is required.",
      "checklist": [
        "Retrieve policy issue date from policy admin",
        "Calculate months in force at date of death",
        "Determine contestability status",
        "Log result and flag if review required"
      ]
    },
    "aiNarrative": {
      "text": "Contestability period calculation complete. Policy issued Feb 1, 2019. Date of death Jan 28, 2026. Policy in force for 6 years 11 months. 2-year contestability window fully lapsed. Standard review applies — no contestability investigation required. Note: standard MIB comparison still conducted per procedure.",
      "confidence": 100,
      "generatedBy": "AI Agent",
      "generatedAt": "2026-02-04"
    },
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "policy_card",
        "contextLabel": "policy context",
        "title": "Policy — contestability status",
        "description": "SBLI Term Life 20 | Issued Feb 2019 | Contestability lapsed",
        "kv": [
          {
            "label": "Issue date",
            "value": "Feb 1, 2019"
          },
          {
            "label": "Date of death",
            "value": "Jan 28, 2026"
          },
          {
            "label": "Time in force",
            "value": "6 years 11 months"
          },
          {
            "label": "Contestability",
            "value": "Lapsed — standard review"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      }
    ],
    "dueDate": "2026-02-04",
    "stage": "initial_triage",
    "slaRemaining": "2026-02-04",
    "slaStatus": "warning",
    "origin": "Initial triage",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-02-04",
    "description": "Calculate whether the 2-year contestability period was in effect at time of death. Policy was issued Feb 2019; death occurred Jan 28, 2026. If contestability has lapsed, the claim proceeds to standard review. If within contestability, a full disclosure review is required.",
    "queue": "team_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Completed",
      "contextTitle": "AI: contestability period calculation",
      "contextSummary": "Calculate whether the 2-year contestability period was in effect at time of death. Policy was issued Feb 2019; death occurred Jan 28, 2026. If contestability has lapsed, the claim proceeds to standard review. If within contestability, a full disclosure review is required.",
      "suggestions": [
        "Retrieve policy issue date from policy admin",
        "Calculate months in force at date of death",
        "Determine contestability status",
        "Log result and flag if review required"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "CD44-6679812"
      }
    ]
  },
  {
    "id": "task_cd6120",
    "kind": "task",
    "taskId": "task_cd6120",
    "label": "AI: MIB vs. application disclosure comparison",
    "status": "Completed",
    "priority": "High",
    "assignee": "AI Agent",
    "assigneeKind": "team",
    "caseType": "CD",
    "caseSubtype": "death_benefit",
    "hasAI": true,
    "aiGenerated": true,
    "aiConfidence": 96,
    "aiSummary": "MIB comparison complete. Report returned one prior record consistent with disclosed cardiac history. Application disclosed family history of heart disease and mild hypertension — both confirmed in MIB. Cause of death (I21.9 acute MI) is consistent with disclosed conditions. No undisclosed conditions identified. No material misrepresentation. Contestability risk: none.",
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "AI: MIB vs. application disclosure comparison",
      "description": "AI agent runs a systematic comparison between the MIB report for Thomas Dupont and the original application disclosures. Identifies any discrepancies that could indicate material misrepresentation. Output is a structured comparison document.",
      "checklist": [
        "Retrieve MIB report for Thomas Dupont",
        "Retrieve original application health disclosures",
        "Cross-reference all disclosed conditions against MIB record",
        "Flag any undisclosed conditions",
        "Generate comparison document with findings"
      ]
    },
    "aiNarrative": {
      "text": "MIB comparison complete. Report returned one prior record consistent with disclosed cardiac history. Application disclosed family history of heart disease and mild hypertension — both confirmed in MIB. Cause of death (I21.9 acute MI) is consistent with disclosed conditions. No undisclosed conditions identified. No material misrepresentation. Contestability risk: none.",
      "confidence": 96,
      "generatedBy": "AI Agent",
      "generatedAt": "2026-05-10"
    },
    "evidenceDocuments": [
      {
        "id": "doc_mib_cd44",
        "name": "MIB Disclosure Comparison.pdf",
        "size": "420 KB",
        "category": "Investigative",
        "aiSummary": "No discrepancies found — application disclosures match MIB record.",
        "followUps": 0
      }
    ],
    "contextCards": [
      {
        "type": "step_readiness",
        "stageLabel": "CONTESTABILITY REVIEW",
        "description": "MIB comparison complete. No discrepancies. Awaiting human sign-off.",
        "stats": {
          "status": "Contestability review",
          "requirements": "8/9",
          "open": "0",
          "docs": "7"
        },
        "actionBtn": "Open case"
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      }
    ],
    "dueDate": "2026-05-10",
    "stage": "contestability_review",
    "slaRemaining": "2026-05-10",
    "slaStatus": "warning",
    "origin": "Contestability review",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-05-10",
    "description": "AI agent runs a systematic comparison between the MIB report for Thomas Dupont and the original application disclosures. Identifies any discrepancies that could indicate material misrepresentation. Output is a structured comparison document.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Completed",
      "contextTitle": "AI: MIB vs. application disclosure comparison",
      "contextSummary": "AI agent runs a systematic comparison between the MIB report for Thomas Dupont and the original application disclosures. Identifies any discrepancies that could indicate material misrepresentation. Output is a structured comparison document.",
      "suggestions": [
        "Retrieve MIB report for Thomas Dupont",
        "Retrieve original application health disclosures",
        "Cross-reference all disclosed conditions against MIB record",
        "Flag any undisclosed conditions",
        "Generate comparison document with findings"
      ],
      "evidenceDocumentId": "doc_mib_cd44"
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "CD44-6679812"
      },
      {
        "kind": "document",
        "id": "doc_mib_cd44",
        "label": "MIB Disclosure Comparison.pdf"
      },
      {
        "kind": "requirement",
        "id": "req_cd44_6679812_contestability_review_mib_vs_application",
        "label": "Contestability review — MIB vs. application"
      }
    ]
  },
  {
    "id": "task_cd6121",
    "kind": "task",
    "taskId": "task_cd6121",
    "label": "Review contestability findings & clear for decision",
    "status": "In Queue",
    "priority": "High",
    "assignee": "Victor Ramon",
    "assigneeKind": "user",
    "caseType": "CD",
    "caseSubtype": "death_benefit",
    "hasAI": true,
    "aiGenerated": true,
    "aiConfidence": 96,
    "aiSummary": "MIB report for Thomas Dupont returned one prior record consistent with disclosed cardiac history. No undisclosed conditions. Cause of death consistent with disclosures. No material misrepresentation. Contestability risk: none.",
    "alert": null,
    "summary": {
      "contextLabel": "Decision control point",
      "title": "Review contestability findings & clear for decision",
      "description": "The AI-generated MIB vs. application comparison has been completed with no discrepancies found. Review the comparison report, confirm no material misrepresentation exists, and clear the case for final decision. The $500,000 death benefit payout to Marie Dupont via ACH is pending this sign-off.",
      "checklist": [
        "Open and review MIB_disclosure_comparison.pdf",
        "Confirm no discrepancies between MIB record and application",
        "Check cause of death aligns with disclosed health history",
        "Clear contestability review — mark complete",
        "Pass to decision stage for payout authorization"
      ]
    },
    "aiNarrative": {
      "text": "MIB report for Thomas Dupont returned one prior record consistent with disclosed cardiac history. No undisclosed conditions. Cause of death consistent with disclosures. No material misrepresentation. Contestability risk: none.",
      "confidence": 96,
      "generatedBy": "AI Agent",
      "generatedAt": "2026-05-10"
    },
    "evidenceDocuments": [
      {
        "id": "doc_mib_cd44",
        "name": "MIB Disclosure Comparison.pdf",
        "size": "420 KB",
        "category": "Investigative",
        "aiSummary": "No discrepancies found — application disclosures match MIB record.",
        "followUps": 0
      }
    ],
    "contextCards": [
      {
        "type": "step_readiness",
        "stageLabel": "CONTESTABILITY REVIEW",
        "description": "All requirements fulfilled. 1 document linked. Awaiting final human review sign-off.",
        "stats": {
          "status": "Pending Decision",
          "requirements": "1/1",
          "open": "0",
          "docs": "1"
        },
        "actionBtn": "Open case"
      },
      {
        "type": "claim_snapshot",
        "contextLabel": "claim snapshot context",
        "title": "Claim snapshot",
        "description": "Motorcycle accident Jan 28, 2026. Acute MI. $500,000 death benefit to Marie Dupont via ACH.",
        "kv": [
          {
            "label": "Date of death",
            "value": "Jan 28, 2026"
          },
          {
            "label": "Cause",
            "value": "Acute myocardial infarction"
          },
          {
            "label": "Payout",
            "value": "$500,000 ACH to Marie Dupont"
          }
        ]
      },
      {
        "type": "person_card",
        "contextLabel": "",
        "title": "Beneficiary — Marie Dupont",
        "description": "Spouse. Identity verified, ACH routing confirmed. 412 Maple St, Portland, OR.",
        "kv": [
          {
            "label": "Relationship",
            "value": "Spouse"
          },
          {
            "label": "Payment method",
            "value": "ACH bank transfer"
          },
          {
            "label": "Bank verified",
            "value": "Yes"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      },
      {
        "type": "send_approver",
        "label": "Send to approver"
      }
    ],
    "dueDate": "2026-05-16",
    "stage": "contestability_review",
    "slaRemaining": "2026-05-16",
    "slaStatus": "warning",
    "origin": "Contestability review",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-05-16",
    "description": "The AI-generated MIB vs. application comparison has been completed with no discrepancies found. Review the comparison report, confirm no material misrepresentation exists, and clear the case for final decision. The $500,000 death benefit payout to Marie Dupont via ACH is pending this sign-off.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 2,
    "panelContext": {
      "summaryStatus": "In Queue",
      "contextTitle": "Review contestability findings & clear for decision",
      "contextSummary": "The AI-generated MIB vs. application comparison has been completed with no discrepancies found. Review the comparison report, confirm no material misrepresentation exists, and clear the case for final decision. The $500,000 death benefit payout to Marie Dupont via ACH is pending this sign-off.",
      "suggestions": [
        "Open and review MIB_disclosure_comparison.pdf",
        "Confirm no discrepancies between MIB record and application",
        "Check cause of death aligns with disclosed health history",
        "Clear contestability review — mark complete",
        "Pass to decision stage for payout authorization"
      ],
      "evidenceDocumentId": "doc_mib_cd44"
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "CD44-6679812"
      },
      {
        "kind": "document",
        "id": "doc_mib_cd44",
        "label": "MIB Disclosure Comparison.pdf"
      },
      {
        "kind": "requirement",
        "id": "req_cd44_6679812_contestability_review_mib_vs_application",
        "label": "Contestability review — MIB vs. application"
      }
    ]
  },
  {
    "id": "task_cd6130",
    "kind": "task",
    "taskId": "task_cd6130",
    "label": "Approve $500,000 death benefit payout to Marie Dupont",
    "status": "To Do",
    "priority": "High",
    "assignee": "Victor Ramon",
    "assigneeKind": "user",
    "caseType": "CD",
    "caseSubtype": "death_benefit",
    "hasAI": false,
    "aiGenerated": false,
    "alert": null,
    "summary": {
      "contextLabel": "Decision control point",
      "title": "Approve $500,000 death benefit payout to Marie Dupont",
      "description": "Issue the final death benefit decision and authorize the $500,000 ACH payout to Marie Dupont. All requirements are met. Contestability review cleared. Beneficiary identity and bank details verified. Policy in force with no lapses. No exclusions apply.",
      "checklist": [
        "Confirm contestability review cleared (preceding task)",
        "Verify ACH routing number on file for Marie Dupont",
        "Authorize payout of $500,000 death benefit",
        "Trigger disbursement event to policy admin system",
        "Send decision letter and payout confirmation to beneficiary"
      ]
    },
    "aiNarrative": null,
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "step_readiness",
        "stageLabel": "DECISION",
        "description": "All requirements met. Contestability cleared. Ready for payout authorization.",
        "stats": {
          "status": "Pending Decision",
          "requirements": "7/9",
          "open": "0",
          "docs": "7"
        },
        "actionBtn": "Open case"
      },
      {
        "type": "person_card",
        "contextLabel": "",
        "title": "Beneficiary — Marie Dupont",
        "description": "Identity verified. ACH routing confirmed. Address: 412 Maple St, Portland, OR.",
        "kv": [
          {
            "label": "Payment method",
            "value": "ACH bank transfer"
          },
          {
            "label": "Bank verified",
            "value": "Yes"
          },
          {
            "label": "Contingent",
            "value": "Sophie Dupont"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      },
      {
        "type": "send_approver",
        "label": "Send to approver"
      }
    ],
    "dueDate": null,
    "stage": "decision",
    "slaRemaining": null,
    "slaStatus": "warning",
    "origin": "Decision",
    "sourceContext": "SBLI task seed",
    "createdDate": null,
    "description": "Issue the final death benefit decision and authorize the $500,000 ACH payout to Marie Dupont. All requirements are met. Contestability review cleared. Beneficiary identity and bank details verified. Policy in force with no lapses. No exclusions apply.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 2,
    "panelContext": {
      "summaryStatus": "To Do",
      "contextTitle": "Approve $500,000 death benefit payout to Marie Dupont",
      "contextSummary": "Issue the final death benefit decision and authorize the $500,000 ACH payout to Marie Dupont. All requirements are met. Contestability review cleared. Beneficiary identity and bank details verified. Policy in force with no lapses. No exclusions apply.",
      "suggestions": [
        "Confirm contestability review cleared (preceding task)",
        "Verify ACH routing number on file for Marie Dupont",
        "Authorize payout of $500,000 death benefit",
        "Trigger disbursement event to policy admin system",
        "Send decision letter and payout confirmation to beneficiary"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "CD44-6679812"
      }
    ]
  },
  {
    "id": "task_nb4011",
    "kind": "task",
    "taskId": "task_nb4011",
    "label": "AI: verify broker licensing & E&O",
    "status": "Completed",
    "priority": "Normal",
    "assignee": "AI Agent",
    "assigneeKind": "team",
    "caseType": "NB",
    "caseSubtype": "full_underwriting",
    "hasAI": true,
    "aiGenerated": true,
    "aiConfidence": 100,
    "aiSummary": "Broker verification complete. Northstar Advisory holds active SBLI appointment (renewed 2025-11-01). State license current. E&O coverage active through 2027-01-15. No compliance issues identified.",
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "AI: verify broker licensing & E&O",
      "description": "AI agent verifies that the submitting broker (Northstar Advisory) holds a current SBLI appointment, valid state license, and active E&O coverage. Blocks application progression if any issue is detected.",
      "checklist": [
        "Query licensing system for Northstar Advisory",
        "Confirm SBLI appointment active",
        "Verify E&O coverage current",
        "Log verification result"
      ]
    },
    "aiNarrative": {
      "text": "Broker verification complete. Northstar Advisory holds active SBLI appointment (renewed 2025-11-01). State license current. E&O coverage active through 2027-01-15. No compliance issues identified.",
      "confidence": 100,
      "generatedBy": "AI Agent",
      "generatedAt": "2026-05-12"
    },
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "application_snapshot",
        "contextLabel": "application context",
        "title": "Application — NB66-7622343",
        "description": "SBLI Term Life 20 application via Northstar Advisory. $625,000 / 20 years.",
        "kv": [
          {
            "label": "Product",
            "value": "SBLI Term Life 20"
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
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      }
    ],
    "dueDate": "2026-05-12",
    "stage": "application_received",
    "slaRemaining": "2026-05-12",
    "slaStatus": "normal",
    "origin": "Application received",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-05-12",
    "description": "AI agent verifies that the submitting broker (Northstar Advisory) holds a current SBLI appointment, valid state license, and active E&O coverage. Blocks application progression if any issue is detected.",
    "queue": "team_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Completed",
      "contextTitle": "AI: verify broker licensing & E&O",
      "contextSummary": "AI agent verifies that the submitting broker (Northstar Advisory) holds a current SBLI appointment, valid state license, and active E&O coverage. Blocks application progression if any issue is detected.",
      "suggestions": [
        "Query licensing system for Northstar Advisory",
        "Confirm SBLI appointment active",
        "Verify E&O coverage current",
        "Log verification result"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "NB66-7622343"
      }
    ]
  },
  {
    "id": "task_nb4020",
    "kind": "task",
    "taskId": "task_nb4020",
    "label": "AI: order MIB + MVR + Rx check",
    "status": "Completed",
    "priority": "High",
    "assignee": "AI Agent",
    "assigneeKind": "team",
    "caseType": "NB",
    "caseSubtype": "full_underwriting",
    "hasAI": true,
    "aiGenerated": true,
    "aiConfidence": 100,
    "aiSummary": "Three-source check complete. MIB: one prior decline flagged (2022, carrier unknown) — requires underwriter review and applicant explanation. MVR: clean record, no violations. Rx history: Metformin 500mg confirmed, consistent with disclosed T2 Diabetes. Accelerated underwriting path disqualified due to MIB flag — routed to traditional full underwriting.",
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "AI: order MIB + MVR + Rx check",
      "description": "AI agent simultaneously orders three standard underwriting checks: MIB (Medical Information Bureau), MVR (Motor Vehicle Report), and prescription history. Results are automatically ingested and any flags are surfaced for underwriter review.",
      "checklist": [
        "Order MIB report for Marc Tremblay",
        "Order MVR for Marc Tremblay",
        "Order prescription history check",
        "Ingest results and flag anomalies",
        "Route flagged results to underwriter for review"
      ]
    },
    "aiNarrative": {
      "text": "Three-source check complete. MIB: one prior decline flagged (2022, carrier unknown) — requires underwriter review and applicant explanation. MVR: clean record, no violations. Rx history: Metformin 500mg confirmed, consistent with disclosed T2 Diabetes. Accelerated underwriting path disqualified due to MIB flag — routed to traditional full underwriting.",
      "confidence": 100,
      "generatedBy": "AI Agent",
      "generatedAt": "2026-05-13"
    },
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "application_snapshot",
        "contextLabel": "application context",
        "title": "Application — initial review",
        "description": "MIB flag detected — prior decline 2022. Accelerated UW disqualified.",
        "kv": [
          {
            "label": "MIB result",
            "value": "Prior decline 2022 — flagged"
          },
          {
            "label": "MVR result",
            "value": "Clean record"
          },
          {
            "label": "Rx result",
            "value": "Metformin confirmed"
          },
          {
            "label": "UW path",
            "value": "Traditional (MIB flag)"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      }
    ],
    "dueDate": "2026-05-13",
    "stage": "initial_review",
    "slaRemaining": "2026-05-13",
    "slaStatus": "warning",
    "origin": "Initial review",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-05-13",
    "description": "AI agent simultaneously orders three standard underwriting checks: MIB (Medical Information Bureau), MVR (Motor Vehicle Report), and prescription history. Results are automatically ingested and any flags are surfaced for underwriter review.",
    "queue": "team_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Completed",
      "contextTitle": "AI: order MIB + MVR + Rx check",
      "contextSummary": "AI agent simultaneously orders three standard underwriting checks: MIB (Medical Information Bureau), MVR (Motor Vehicle Report), and prescription history. Results are automatically ingested and any flags are surfaced for underwriter review.",
      "suggestions": [
        "Order MIB report for Marc Tremblay",
        "Order MVR for Marc Tremblay",
        "Order prescription history check",
        "Ingest results and flag anomalies",
        "Route flagged results to underwriter for review"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "NB66-7622343"
      }
    ]
  },
  {
    "id": "task_nb4021",
    "kind": "task",
    "taskId": "task_nb4021",
    "label": "Review MIB hit — prior decline 2022",
    "status": "Completed",
    "priority": "High",
    "assignee": "Victor Ramon",
    "assigneeKind": "user",
    "caseType": "NB",
    "caseSubtype": "full_underwriting",
    "hasAI": false,
    "aiGenerated": false,
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "Review MIB hit — prior decline 2022",
      "description": "An MIB hit identified a prior life insurance application decline in 2022 with an unknown carrier. Review the MIB report, determine if the applicant disclosed this on the application, and decide whether to request an explanation letter.",
      "checklist": [
        "Review MIB report details",
        "Cross-reference with application disclosures",
        "Confirm applicant disclosed the prior decline",
        "Decide: request explanation letter before proceeding",
        "Update UW path to traditional if not already done"
      ]
    },
    "aiNarrative": null,
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "scoring_factors",
        "stageLabel": "INITIAL REVIEW",
        "title": "Preliminary scoring",
        "badge": "+75 debits",
        "badgeStatus": "warning",
        "description": "AI preliminary scoring based on available data. APS and paramedical pending.",
        "factors": [
          {
            "name": "T2 Diabetes (diet-controlled)",
            "direction": "debit",
            "pct": 70
          },
          {
            "name": "BMI 27.4",
            "direction": "debit",
            "pct": 30
          },
          {
            "name": "Non-smoker",
            "direction": "credit",
            "pct": 40
          },
          {
            "name": "HbA1c 48 — well controlled",
            "direction": "credit",
            "pct": 25
          },
          {
            "name": "MIB prior decline — unresolved",
            "direction": "debit",
            "pct": 60
          }
        ]
      },
      {
        "type": "person_card",
        "contextLabel": "applicant context",
        "title": "Applicant — Marc Tremblay",
        "description": "Age 42. T2D diagnosed 2019. Non-smoker. Metformin 500mg. MIB: prior decline 2022.",
        "kv": [
          {
            "label": "DOB",
            "value": "03 Jun 1983"
          },
          {
            "label": "Condition",
            "value": "T2 Diabetes (2019)"
          },
          {
            "label": "HbA1c",
            "value": "48 mmol/mol"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      }
    ],
    "dueDate": "2026-05-13",
    "stage": "initial_review",
    "slaRemaining": "2026-05-13",
    "slaStatus": "warning",
    "origin": "Initial review",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-05-13",
    "description": "An MIB hit identified a prior life insurance application decline in 2022 with an unknown carrier. Review the MIB report, determine if the applicant disclosed this on the application, and decide whether to request an explanation letter.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Completed",
      "contextTitle": "Review MIB hit — prior decline 2022",
      "contextSummary": "An MIB hit identified a prior life insurance application decline in 2022 with an unknown carrier. Review the MIB report, determine if the applicant disclosed this on the application, and decide whether to request an explanation letter.",
      "suggestions": [
        "Review MIB report details",
        "Cross-reference with application disclosures",
        "Confirm applicant disclosed the prior decline",
        "Decide: request explanation letter before proceeding",
        "Update UW path to traditional if not already done"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "NB66-7622343"
      }
    ]
  },
  {
    "id": "task_nb4030",
    "kind": "task",
    "taskId": "task_nb4030",
    "label": "Order APS from Dr. Kowalski",
    "status": "In Queue",
    "priority": "High",
    "assignee": "Victor Ramon",
    "assigneeKind": "user",
    "caseType": "NB",
    "caseSubtype": "full_underwriting",
    "hasAI": false,
    "aiGenerated": false,
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "Order APS from Dr. Kowalski",
      "description": "Request the Attending Physician Statement from Dr. Kowalski (Kowalski Family Medicine) covering Marc Tremblay's T2 Diabetes management history. The APS is critical to validate the preliminary debit/credit scoring and contextualize the 2022 MIB prior decline.",
      "checklist": [
        "Access SBLI medical provider portal",
        "Locate Dr. Kowalski — Kowalski Family Medicine",
        "Submit APS request — specify T2D management, HbA1c history, complications",
        "Set follow-up date for May 18",
        "Flag APS as blocking for UW review stage"
      ]
    },
    "aiNarrative": null,
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "scoring_factors",
        "stageLabel": "REQ. GATHERING",
        "title": "AI scoring — APS impact areas",
        "badge": "+75 debits",
        "badgeStatus": "warning",
        "description": "APS from Dr. Kowalski will clarify T2D control quality and may modify the preliminary +50 debit.",
        "factors": [
          {
            "name": "T2D debit (pending APS detail)",
            "direction": "debit",
            "pct": 70
          },
          {
            "name": "HbA1c credit (confirmed 48)",
            "direction": "credit",
            "pct": 40
          },
          {
            "name": "Family history (pending APS)",
            "direction": "debit",
            "pct": 30
          }
        ]
      },
      {
        "type": "person_card",
        "contextLabel": "applicant context",
        "title": "Applicant — Marc Tremblay",
        "description": "Age 42. T2D diagnosed 2019, diet-controlled. Metformin 500mg. HbA1c 48.",
        "kv": [
          {
            "label": "Condition",
            "value": "T2 Diabetes (2019)"
          },
          {
            "label": "HbA1c",
            "value": "48 mmol/mol"
          },
          {
            "label": "Medication",
            "value": "Metformin 500mg"
          }
        ]
      },
      {
        "type": "step_readiness",
        "stageLabel": "REQ. GATHERING",
        "description": "APS is current blocker for UW review progression.",
        "stats": {
          "status": "Req. gathering",
          "requirements": "5/9",
          "open": "3",
          "docs": "5"
        },
        "actionBtn": "Open case"
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      },
      {
        "type": "add_requirement",
        "label": "Add requirement"
      }
    ],
    "dueDate": "2026-05-16",
    "stage": "requirement_gathering",
    "slaRemaining": "2026-05-16",
    "slaStatus": "warning",
    "origin": "Req. gathering",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-05-16",
    "description": "Request the Attending Physician Statement from Dr. Kowalski (Kowalski Family Medicine) covering Marc Tremblay's T2 Diabetes management history. The APS is critical to validate the preliminary debit/credit scoring and contextualize the 2022 MIB prior decline.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "In Queue",
      "contextTitle": "Order APS from Dr. Kowalski",
      "contextSummary": "Request the Attending Physician Statement from Dr. Kowalski (Kowalski Family Medicine) covering Marc Tremblay's T2 Diabetes management history. The APS is critical to validate the preliminary debit/credit scoring and contextualize the 2022 MIB prior decline.",
      "suggestions": [
        "Access SBLI medical provider portal",
        "Locate Dr. Kowalski — Kowalski Family Medicine",
        "Submit APS request — specify T2D management, HbA1c history, complications",
        "Set follow-up date for May 18",
        "Flag APS as blocking for UW review stage"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "NB66-7622343"
      }
    ]
  },
  {
    "id": "task_nb4031",
    "kind": "task",
    "taskId": "task_nb4031",
    "label": "Paramedical exam — blood draw follow-up",
    "status": "Open",
    "priority": "Normal",
    "assignee": "Quest Diagnostics",
    "assigneeKind": "user",
    "caseType": "NB",
    "caseSubtype": "full_underwriting",
    "hasAI": true,
    "aiSummary": "Paramedical exam scheduled with Quest Diagnostics for May 19, 2026. Blood draw and vitals capture required. Results will feed into final UW scoring alongside APS.",
    "aiAction": "Review requirement",
    "alert": null,
    "dueDate": "2026-05-19",
    "stage": "requirement_gathering",
    "slaRemaining": "2026-05-19",
    "slaStatus": "normal",
    "origin": "paramedical_vendor",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-05-14",
    "description": "Paramedical exam scheduled with Quest Diagnostics for May 19, 2026. Blood draw and vitals capture required. Results will feed into final UW scoring alongside APS.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Scheduled",
      "contextTitle": "Paramedical exam — blood draw",
      "contextSummary": "Paramedical exam scheduled with Quest Diagnostics for May 19, 2026. Blood draw and vitals capture required. Results will feed into final UW scoring alongside APS.",
      "suggestions": [
        "Paramedical exam completed at scheduled time",
        "Blood draw processed by accredited lab",
        "Vitals recorded: height, weight, BP, pulse"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "New Business — Full Underwriting"
      },
      {
        "kind": "requirement",
        "id": "req_mt_006",
        "label": "Paramedical exam — blood draw"
      }
    ]
  },
  {
    "id": "task_nb4032",
    "kind": "task",
    "taskId": "task_nb4032",
    "label": "Request prior decline explanation letter from applicant",
    "status": "In Queue",
    "priority": "High",
    "assignee": "Richard Daniels",
    "assigneeKind": "user",
    "caseType": "NB",
    "caseSubtype": "full_underwriting",
    "hasAI": false,
    "aiGenerated": false,
    "alert": {
      "type": "warning",
      "message": "MIB prior decline from 2022 adds +50 debits to preliminary scoring. Until explained, underwriting cannot issue a final offer. If applicant cannot explain, coverage may be declined."
    },
    "summary": {
      "contextLabel": "Task context",
      "title": "Request prior decline explanation letter from applicant",
      "description": "An MIB hit identified a prior life insurance application decline in 2022 with an unknown carrier. Marc Tremblay must provide a written explanation of the circumstances of the prior decline before underwriting can assess the risk fully.",
      "checklist": [
        "Draft prior decline explanation request letter",
        "Send to Marc Tremblay via email and portal notification",
        "Specify: carrier name, year, coverage amount, reason for decline if known",
        "Set deadline: May 18, 2026",
        "Flag as blocking for UW review stage"
      ]
    },
    "aiNarrative": null,
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "requirement_card",
        "stageLabel": "REQ. GATHERING",
        "title": "MIB hit — prior decline 2022",
        "badge": "Unresolved",
        "badgeStatus": "warning",
        "description": "MIB report returned one hit: prior life insurance decline, 2022, carrier unknown. Application disclosed a prior decline — information matches. Explanation required to assess materiality.",
        "kv": [
          {
            "label": "MIB record year",
            "value": "2022"
          },
          {
            "label": "Carrier",
            "value": "Unknown"
          },
          {
            "label": "App disclosure",
            "value": "Confirmed — matches"
          }
        ]
      },
      {
        "type": "person_card",
        "contextLabel": "applicant context",
        "title": "Applicant — Marc Tremblay",
        "description": "Age 42. Applied via Northstar Advisory. T2D disclosed, non-smoker. Paramedical exam scheduled May 19.",
        "kv": [
          {
            "label": "DOB",
            "value": "03 Jun 1983"
          },
          {
            "label": "Channel",
            "value": "SBLI broker"
          },
          {
            "label": "Broker",
            "value": "Northstar Advisory"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      },
      {
        "type": "add_requirement",
        "label": "Add requirement"
      }
    ],
    "dueDate": "2026-05-18",
    "stage": "requirement_gathering",
    "slaRemaining": "2026-05-18",
    "slaStatus": "warning",
    "origin": "Req. gathering",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-05-18",
    "description": "An MIB hit identified a prior life insurance application decline in 2022 with an unknown carrier. Marc Tremblay must provide a written explanation of the circumstances of the prior decline before underwriting can assess the risk fully.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "In Queue",
      "contextTitle": "Request prior decline explanation letter from applicant",
      "contextSummary": "An MIB hit identified a prior life insurance application decline in 2022 with an unknown carrier. Marc Tremblay must provide a written explanation of the circumstances of the prior decline before underwriting can assess the risk fully.",
      "suggestions": [
        "Draft prior decline explanation request letter",
        "Send to Marc Tremblay via email and portal notification",
        "Specify: carrier name, year, coverage amount, reason for decline if known",
        "Set deadline: May 18, 2026",
        "Flag as blocking for UW review stage"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "NB66-7622343"
      },
      {
        "kind": "requirement",
        "id": "req_nb66_7622343_mib_hit_prior_decline_2022",
        "label": "MIB hit — prior decline 2022"
      }
    ]
  },
  {
    "id": "task_nb4040",
    "kind": "task",
    "taskId": "task_nb4040",
    "label": "UW debit/credit scoring — final review",
    "status": "To Do",
    "priority": "High",
    "assignee": "Victor Ramon",
    "assigneeKind": "user",
    "caseType": "NB",
    "caseSubtype": "full_underwriting",
    "hasAI": false,
    "aiGenerated": false,
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "UW debit/credit scoring — final review",
      "description": "Review all evidence and apply the final underwriting debit/credit scoring to determine the mortality rating for Marc Tremblay. APS, paramedical exam results, and prior decline explanation must be received before this task can be completed.",
      "checklist": [
        "Confirm APS received and reviewed",
        "Confirm paramedical exam results received",
        "Confirm prior decline explanation received and assessed",
        "Apply final debit/credit table scoring",
        "Determine offer type: standard / rated / loaded / decline",
        "Document scoring rationale"
      ]
    },
    "aiNarrative": null,
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "scoring_factors",
        "stageLabel": "UW REVIEW",
        "title": "Preliminary scoring — pending final",
        "badge": "+75 debits est.",
        "badgeStatus": "warning",
        "description": "Preliminary +75 debits. Final score pending APS, paramedical, and prior decline explanation.",
        "factors": [
          {
            "name": "T2 Diabetes (diet-controlled)",
            "direction": "debit",
            "pct": 70
          },
          {
            "name": "BMI 27.4",
            "direction": "debit",
            "pct": 30
          },
          {
            "name": "Non-smoker",
            "direction": "credit",
            "pct": 40
          },
          {
            "name": "HbA1c 48 — well controlled",
            "direction": "credit",
            "pct": 25
          },
          {
            "name": "MIB prior decline",
            "direction": "debit",
            "pct": 60
          },
          {
            "name": "Paramedical — pending",
            "direction": "pending",
            "pct": 0
          }
        ]
      },
      {
        "type": "step_readiness",
        "stageLabel": "UW REVIEW",
        "description": "Pending APS, paramedical results, and prior decline explanation.",
        "stats": {
          "status": "UW review",
          "requirements": "5/9",
          "open": "3",
          "docs": "5"
        },
        "actionBtn": "Open case"
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      },
      {
        "type": "send_approver",
        "label": "Send to approver"
      }
    ],
    "dueDate": null,
    "stage": "underwriting_review",
    "slaRemaining": null,
    "slaStatus": "warning",
    "origin": "Underwriting review",
    "sourceContext": "SBLI task seed",
    "createdDate": null,
    "description": "Review all evidence and apply the final underwriting debit/credit scoring to determine the mortality rating for Marc Tremblay. APS, paramedical exam results, and prior decline explanation must be received before this task can be completed.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 2,
    "panelContext": {
      "summaryStatus": "To Do",
      "contextTitle": "UW debit/credit scoring — final review",
      "contextSummary": "Review all evidence and apply the final underwriting debit/credit scoring to determine the mortality rating for Marc Tremblay. APS, paramedical exam results, and prior decline explanation must be received before this task can be completed.",
      "suggestions": [
        "Confirm APS received and reviewed",
        "Confirm paramedical exam results received",
        "Confirm prior decline explanation received and assessed",
        "Apply final debit/credit table scoring",
        "Determine offer type: standard / rated / loaded / decline",
        "Document scoring rationale"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "NB66-7622343"
      }
    ]
  },
  {
    "id": "task_nb4041",
    "kind": "task",
    "taskId": "task_nb4041",
    "label": "AI: generate rated offer recommendation",
    "status": "To Do",
    "priority": "High",
    "assignee": "AI Agent",
    "assigneeKind": "team",
    "caseType": "NB",
    "caseSubtype": "full_underwriting",
    "hasAI": true,
    "aiGenerated": true,
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "AI: generate rated offer recommendation",
      "description": "AI agent synthesizes all underwriting evidence — APS, paramedical results, scoring factors, prior decline explanation — and produces a structured offer recommendation for the underwriter to review and approve.",
      "checklist": [
        "Aggregate all evidence sources",
        "Apply mortality scoring model",
        "Generate offer recommendation: standard / rated / loaded / decline",
        "Provide confidence level and supporting rationale",
        "Route to underwriter for final decision"
      ]
    },
    "aiNarrative": null,
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "application_snapshot",
        "contextLabel": "application context",
        "title": "Application — NB66-7622343",
        "description": "Pending APS, paramedical, and prior decline explanation before AI can generate offer.",
        "kv": [
          {
            "label": "Status",
            "value": "Pending requirements"
          },
          {
            "label": "UW path",
            "value": "Traditional"
          },
          {
            "label": "Preliminary rating",
            "value": "+75 debits"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      }
    ],
    "dueDate": null,
    "stage": "underwriting_review",
    "slaRemaining": null,
    "slaStatus": "warning",
    "origin": "Underwriting review",
    "sourceContext": "SBLI task seed",
    "createdDate": null,
    "description": "AI agent synthesizes all underwriting evidence — APS, paramedical results, scoring factors, prior decline explanation — and produces a structured offer recommendation for the underwriter to review and approve.",
    "queue": "team_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "To Do",
      "contextTitle": "AI: generate rated offer recommendation",
      "contextSummary": "AI agent synthesizes all underwriting evidence — APS, paramedical results, scoring factors, prior decline explanation — and produces a structured offer recommendation for the underwriter to review and approve.",
      "suggestions": [
        "Aggregate all evidence sources",
        "Apply mortality scoring model",
        "Generate offer recommendation: standard / rated / loaded / decline",
        "Provide confidence level and supporting rationale",
        "Route to underwriter for final decision"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "NB66-7622343"
      }
    ]
  },
  {
    "id": "task_nb2011",
    "kind": "task",
    "taskId": "task_nb2011",
    "label": "AI: MIB check & accelerated UW eligibility",
    "status": "Completed",
    "priority": "Normal",
    "assignee": "AI Agent",
    "assigneeKind": "team",
    "caseType": "NB",
    "caseSubtype": "simplified_underwriting",
    "hasAI": true,
    "aiGenerated": true,
    "aiConfidence": 100,
    "aiSummary": "MIB check complete — no alerts. Accelerated UW eligibility confirmed: Age 35 (within 18–50 limit) ✓ | Coverage $350,000 (within $1M limit) ✓ | No adverse health disclosures ✓ | No MIB alerts ✓. All four criteria passed. Routing to SBLI Simple Term accelerated path. Same-day coverage eligible pending tele-interview.",
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "AI: MIB check & accelerated UW eligibility",
      "description": "AI agent runs MIB check and evaluates all four SBLI Simple Term Life eligibility criteria simultaneously. If all criteria pass, the case is routed to the accelerated (no-exam) path. If any criterion fails, the case is escalated to traditional underwriting.",
      "checklist": [
        "Order MIB report",
        "Evaluate: age 18–50",
        "Evaluate: coverage amount ≤$1,000,000",
        "Evaluate: no adverse health disclosures",
        "Evaluate: no MIB alerts",
        "Route to accelerated path if all pass"
      ]
    },
    "aiNarrative": {
      "text": "MIB check complete — no alerts. Accelerated UW eligibility confirmed: Age 35 (within 18–50 limit) ✓ | Coverage $350,000 (within $1M limit) ✓ | No adverse health disclosures ✓ | No MIB alerts ✓. All four criteria passed. Routing to SBLI Simple Term accelerated path. Same-day coverage eligible pending tele-interview.",
      "confidence": 100,
      "generatedBy": "AI Agent",
      "generatedAt": "2026-05-13"
    },
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "application_snapshot",
        "contextLabel": "application context",
        "title": "Application — NB98-9989870",
        "description": "SBLI Simple Term Life. $350,000 / 20-year. All accelerated UW criteria passed.",
        "kv": [
          {
            "label": "Product",
            "value": "SBLI Simple Term Life"
          },
          {
            "label": "Death benefit",
            "value": "$350,000"
          },
          {
            "label": "UW path",
            "value": "Accelerated — no exam"
          },
          {
            "label": "Same-day coverage",
            "value": "Eligible"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      }
    ],
    "dueDate": "2026-05-13",
    "stage": "application_received",
    "slaRemaining": "2026-05-13",
    "slaStatus": "normal",
    "origin": "Application received",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-05-13",
    "description": "AI agent runs MIB check and evaluates all four SBLI Simple Term Life eligibility criteria simultaneously. If all criteria pass, the case is routed to the accelerated (no-exam) path. If any criterion fails, the case is escalated to traditional underwriting.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Completed",
      "contextTitle": "AI: MIB check & accelerated UW eligibility",
      "contextSummary": "AI agent runs MIB check and evaluates all four SBLI Simple Term Life eligibility criteria simultaneously. If all criteria pass, the case is routed to the accelerated (no-exam) path. If any criterion fails, the case is escalated to traditional underwriting.",
      "suggestions": [
        "Order MIB report",
        "Evaluate: age 18–50",
        "Evaluate: coverage amount ≤$1,000,000",
        "Evaluate: no adverse health disclosures",
        "Evaluate: no MIB alerts",
        "Route to accelerated path if all pass"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB98-9989870",
        "label": "NB98-9989870"
      }
    ]
  },
  {
    "id": "task_nb2021",
    "kind": "task",
    "taskId": "task_nb2021",
    "label": "Conduct tele-interview — SBLI health questionnaire",
    "status": "In Queue",
    "priority": "High",
    "assignee": "Richard Daniels",
    "assigneeKind": "user",
    "caseType": "NB",
    "caseSubtype": "simplified_underwriting",
    "hasAI": false,
    "aiGenerated": false,
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "Conduct tele-interview — SBLI health questionnaire",
      "description": "Conduct the SBLI in-house health questionnaire via telephone with Elena Rossi. The questionnaire covers four sections: cardiovascular, respiratory, musculoskeletal, and mental health. All responses must be recorded verbatim. AI scoring will run automatically post-interview.",
      "checklist": [
        "Call Elena Rossi at scheduled time (May 17, 10:00 AM)",
        "Complete all 4 questionnaire sections",
        "Record all responses in telephony system",
        "Flag any adverse responses for manual review",
        "Confirm identity verbally (DOB, address)",
        "Submit completed questionnaire to trigger AI scoring (task_nb2030)"
      ]
    },
    "aiNarrative": null,
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "step_readiness",
        "stageLabel": "TELE-INTERVIEW",
        "description": "Tele-interview is the only underwriting step. No blood draw or exam required.",
        "stats": {
          "status": "Tele-interview",
          "requirements": "2/4",
          "open": "2",
          "docs": "3"
        },
        "actionBtn": "Open case"
      },
      {
        "type": "person_card",
        "contextLabel": "applicant context",
        "title": "Applicant — Elena Rossi",
        "description": "Age 35. Direct online applicant (SBLI.com). Non-smoker, BMI 23.1, no adverse disclosures.",
        "kv": [
          {
            "label": "DOB",
            "value": "22 Jan 1991"
          },
          {
            "label": "Channel",
            "value": "Direct — SBLI.com"
          },
          {
            "label": "BMI",
            "value": "23.1 — Normal"
          }
        ]
      },
      {
        "type": "questionnaire_card",
        "title": "Health questionnaire — 4 sections",
        "badge": "Pending",
        "badgeStatus": "warning",
        "description": "All four sections to be completed during this interview. AI scoring triggered automatically upon submission.",
        "sections": [
          {
            "name": "Cardiovascular",
            "status": "pending"
          },
          {
            "name": "Respiratory",
            "status": "pending"
          },
          {
            "name": "Musculoskeletal",
            "status": "pending"
          },
          {
            "name": "Mental health",
            "status": "pending"
          }
        ],
        "interviewDate": "2026-05-17",
        "interviewTime": "10:00 AM"
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      }
    ],
    "dueDate": "2026-05-17",
    "stage": "tele_interview",
    "slaRemaining": "2026-05-17",
    "slaStatus": "warning",
    "origin": "Tele-interview",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-05-17",
    "description": "Conduct the SBLI in-house health questionnaire via telephone with Elena Rossi. The questionnaire covers four sections: cardiovascular, respiratory, musculoskeletal, and mental health. All responses must be recorded verbatim. AI scoring will run automatically post-interview.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "In Queue",
      "contextTitle": "Conduct tele-interview — SBLI health questionnaire",
      "contextSummary": "Conduct the SBLI in-house health questionnaire via telephone with Elena Rossi. The questionnaire covers four sections: cardiovascular, respiratory, musculoskeletal, and mental health. All responses must be recorded verbatim. AI scoring will run automatically post-interview.",
      "suggestions": [
        "Call Elena Rossi at scheduled time (May 17, 10:00 AM)",
        "Complete all 4 questionnaire sections",
        "Record all responses in telephony system",
        "Flag any adverse responses for manual review",
        "Confirm identity verbally (DOB, address)",
        "Submit completed questionnaire to trigger AI scoring (task_nb2030)"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB98-9989870",
        "label": "NB98-9989870"
      }
    ]
  },
  {
    "id": "task_nb2030",
    "kind": "task",
    "taskId": "task_nb2030",
    "label": "AI: score health questionnaire responses",
    "status": "Completed",
    "priority": "High",
    "assignee": "AI Agent",
    "assigneeKind": "team",
    "caseType": "NB",
    "caseSubtype": "simplified_underwriting",
    "hasAI": true,
    "aiGenerated": true,
    "aiConfidence": 97,
    "aiSummary": "Questionnaire scoring complete — all four sections clean. Cardiovascular, respiratory, musculoskeletal, and mental health: no adverse responses. Eligibility criteria satisfied. Standard rates recommended. No manual review flags.",
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "AI: score health questionnaire responses",
      "description": "AI agent scores all four sections of the SBLI health questionnaire against the Simple Term Life eligibility criteria. Adverse responses are flagged with confidence scores. Output feeds directly into the human review task (task_nb2031).",
      "checklist": [
        "Receive completed questionnaire from telephony system",
        "Score cardiovascular section",
        "Score respiratory section",
        "Score musculoskeletal section",
        "Score mental health section",
        "Flag any adverse responses for underwriter review",
        "Generate scoring summary for task_nb2031"
      ]
    },
    "aiNarrative": {
      "text": "Questionnaire scoring complete — all four sections clean. Cardiovascular, respiratory, musculoskeletal, and mental health: no adverse responses. Eligibility criteria satisfied. Standard rates recommended. No manual review flags.",
      "confidence": 97,
      "generatedBy": "AI Agent",
      "generatedAt": "2026-05-17"
    },
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "application_snapshot",
        "contextLabel": "application context",
        "title": "Application — NB98-9989870",
        "description": "Tele-interview responses scored. All sections passed — ready for human review (task_nb2031).",
        "kv": [
          {
            "label": "Status",
            "value": "Scoring complete"
          },
          {
            "label": "Outcome",
            "value": "Clean pass — standard rates"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      }
    ],
    "dueDate": "2026-05-17",
    "stage": "questionnaire_review",
    "slaRemaining": "2026-05-17",
    "slaStatus": "warning",
    "origin": "Questionnaire review",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-05-17",
    "description": "AI agent scores all four sections of the SBLI health questionnaire against the Simple Term Life eligibility criteria. Adverse responses are flagged with confidence scores. Output feeds directly into the human review task (task_nb2031).",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 1,
    "panelContext": {
      "summaryStatus": "Completed",
      "contextTitle": "AI: score health questionnaire responses",
      "contextSummary": "AI agent scores all four sections of the SBLI health questionnaire against the Simple Term Life eligibility criteria. Adverse responses are flagged with confidence scores. Output feeds directly into the human review task (task_nb2031).",
      "suggestions": [
        "Receive completed questionnaire from telephony system",
        "Score cardiovascular section",
        "Score respiratory section",
        "Score musculoskeletal section",
        "Score mental health section",
        "Flag any adverse responses for underwriter review",
        "Generate scoring summary for task_nb2031"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB98-9989870",
        "label": "NB98-9989870"
      }
    ]
  },
  {
    "id": "task_nb2031",
    "kind": "task",
    "taskId": "task_nb2031",
    "label": "Review AI scoring & flag exceptions",
    "status": "To Do",
    "priority": "Normal",
    "assignee": "Victor Ramon",
    "assigneeKind": "user",
    "caseType": "NB",
    "caseSubtype": "simplified_underwriting",
    "hasAI": true,
    "aiGenerated": true,
    "aiConfidence": 95,
    "aiSummary": "Pending tele-interview completion. AI scoring will assess all four health questionnaire sections against SBLI Simple Term eligibility criteria. Expected outcome: clean pass based on application profile (age 35, no disclosures, no MIB alerts, BMI 23.1).",
    "alert": null,
    "summary": {
      "contextLabel": "Task context",
      "title": "Review AI scoring & flag exceptions",
      "description": "Review the AI-scored health questionnaire from Elena Rossi's tele-interview. Check for any adverse responses that require manual underwriter review. If clean, confirm case can proceed to standard rates decision. If exceptions flagged, escalate to senior underwriter.",
      "checklist": [
        "Open AI questionnaire scoring report",
        "Review all 4 section scores and individual response flags",
        "Check for adverse responses in cardiovascular or mental health sections",
        "If all clean: mark review complete and pass to decision",
        "If exceptions flagged: escalate to senior underwriter"
      ]
    },
    "aiNarrative": {
      "text": "Pending tele-interview completion. AI scoring will assess all four health questionnaire sections against SBLI Simple Term eligibility criteria. Expected outcome: clean pass based on application profile (age 35, no disclosures, no MIB alerts, BMI 23.1).",
      "confidence": 95,
      "generatedBy": "AI Agent",
      "generatedAt": null,
      "status": "pre-generated — pending interview input"
    },
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "step_readiness",
        "stageLabel": "QUESTIONNAIRE REVIEW",
        "description": "AI scoring pending interview completion. Expected clean pass.",
        "stats": {
          "status": "Questionnaire review",
          "requirements": "2/4",
          "open": "2",
          "docs": "3"
        },
        "actionBtn": "Open case"
      },
      {
        "type": "person_card",
        "contextLabel": "applicant context",
        "title": "Applicant — Elena Rossi",
        "description": "Strong risk profile. Age 35, BMI 23.1, non-smoker, no adverse health disclosures.",
        "kv": [
          {
            "label": "DOB",
            "value": "22 Jan 1991"
          },
          {
            "label": "BMI",
            "value": "23.1 (self-declared)"
          },
          {
            "label": "Smoker",
            "value": "Non-smoker"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      },
      {
        "type": "complete_return",
        "label": "Complete & Return to me"
      },
      {
        "type": "send_approver",
        "label": "Send to approver"
      }
    ],
    "dueDate": "2026-05-18",
    "stage": "questionnaire_review",
    "slaRemaining": "2026-05-18",
    "slaStatus": "normal",
    "origin": "Questionnaire review",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-05-18",
    "description": "Review the AI-scored health questionnaire from Elena Rossi's tele-interview. Check for any adverse responses that require manual underwriter review. If clean, confirm case can proceed to standard rates decision. If exceptions flagged, escalate to senior underwriter.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 2,
    "panelContext": {
      "summaryStatus": "To Do",
      "contextTitle": "Review AI scoring & flag exceptions",
      "contextSummary": "Review the AI-scored health questionnaire from Elena Rossi's tele-interview. Check for any adverse responses that require manual underwriter review. If clean, confirm case can proceed to standard rates decision. If exceptions flagged, escalate to senior underwriter.",
      "suggestions": [
        "Open AI questionnaire scoring report",
        "Review all 4 section scores and individual response flags",
        "Check for adverse responses in cardiovascular or mental health sections",
        "If all clean: mark review complete and pass to decision",
        "If exceptions flagged: escalate to senior underwriter"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB98-9989870",
        "label": "NB98-9989870"
      }
    ]
  },
  {
    "id": "task_nb2040",
    "kind": "task",
    "taskId": "task_nb2040",
    "label": "Issue decision — standard rates or refer to full UW",
    "status": "To Do",
    "priority": "High",
    "assignee": "Victor Ramon",
    "assigneeKind": "user",
    "caseType": "NB",
    "caseSubtype": "simplified_underwriting",
    "hasAI": false,
    "aiGenerated": false,
    "alert": null,
    "summary": {
      "contextLabel": "Decision control point",
      "title": "Issue decision — standard rates or refer to full UW",
      "description": "Based on the completed tele-interview and AI questionnaire scoring, issue the final underwriting decision. If all sections are clean, issue at standard rates. If any section flagged exceptions, refer to full traditional underwriting.",
      "checklist": [
        "Review AI questionnaire scoring summary",
        "Confirm no exceptions flagged in any section",
        "Issue decision: standard rates",
        "Or: escalate to traditional UW if exceptions present",
        "Trigger policy issuance event to admin system"
      ]
    },
    "aiNarrative": null,
    "evidenceDocuments": [],
    "contextCards": [
      {
        "type": "application_snapshot",
        "contextLabel": "application context",
        "title": "Application — NB98-9989870",
        "description": "SBLI Simple Term Life. $350,000 / 20-year. Accelerated UW. Decision pending questionnaire review.",
        "kv": [
          {
            "label": "Product",
            "value": "SBLI Simple Term Life"
          },
          {
            "label": "Death benefit",
            "value": "$350,000"
          },
          {
            "label": "Premium (indicative)",
            "value": "$22/month"
          },
          {
            "label": "Expected outcome",
            "value": "Standard rates"
          }
        ]
      },
      {
        "type": "step_readiness",
        "stageLabel": "DECISION",
        "description": "Pending questionnaire review completion. All other criteria met.",
        "stats": {
          "status": "Decision",
          "requirements": "3/4",
          "open": "1",
          "docs": "3"
        },
        "actionBtn": "Open case"
      }
    ],
    "actions": [
      {
        "type": "complete",
        "label": "Complete",
        "isPrimary": true
      },
      {
        "type": "send_approver",
        "label": "Send to approver"
      }
    ],
    "dueDate": "2026-05-19",
    "stage": "decision",
    "slaRemaining": "2026-05-19",
    "slaStatus": "warning",
    "origin": "Decision",
    "sourceContext": "SBLI task seed",
    "createdDate": "2026-05-19",
    "description": "Based on the completed tele-interview and AI questionnaire scoring, issue the final underwriting decision. If all sections are clean, issue at standard rates. If any section flagged exceptions, refer to full traditional underwriting.",
    "queue": "my_tasks",
    "requiredAuthorityLevel": 2,
    "panelContext": {
      "summaryStatus": "To Do",
      "contextTitle": "Issue decision — standard rates or refer to full UW",
      "contextSummary": "Based on the completed tele-interview and AI questionnaire scoring, issue the final underwriting decision. If all sections are clean, issue at standard rates. If any section flagged exceptions, refer to full traditional underwriting.",
      "suggestions": [
        "Review AI questionnaire scoring summary",
        "Confirm no exceptions flagged in any section",
        "Issue decision: standard rates",
        "Or: escalate to traditional UW if exceptions present",
        "Trigger policy issuance event to admin system"
      ]
    },
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB98-9989870",
        "label": "NB98-9989870"
      }
    ]
  }
];

export const SBLI_REQUIREMENT_RECORDS: DatasetRequirementRecord[] = [
  {
    "id": "req_cd26_5546112_attending_physician_statement",
    "kind": "requirement",
    "label": "Attending Physician Statement",
    "requirementRef": "Attending Physician Statement",
    "category": "Medical",
    "status": "Pending",
    "stage": "requirement_gathering",
    "dueDate": "2026-02-10",
    "source": "medical_provider",
    "trigger": "SBLI task seed",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
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
      },
      {
        "kind": "task",
        "id": "task_cd5221",
        "label": "task_cd5221"
      }
    ]
  },
  {
    "id": "req_cd26_5546112_employer_inability_to_work_confirmation",
    "kind": "requirement",
    "label": "Employer inability-to-work confirmation",
    "requirementRef": "Employer inability-to-work confirmation",
    "category": "Employment",
    "status": "Pending",
    "stage": "requirement_gathering",
    "dueDate": "2026-02-08",
    "source": "employer_portal",
    "trigger": "SBLI task seed",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
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
    "id": "req_cd26_5546112_fnol_wop_claim_form",
    "kind": "requirement",
    "label": "FNOL — WOP claim form",
    "requirementRef": "FNOL — WOP claim form",
    "category": "Claim",
    "status": "Pending",
    "stage": "fnol_received",
    "dueDate": "2026-01-30",
    "source": "claimant_portal",
    "trigger": "SBLI task seed",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
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
    "id": "req_cd26_5546112_policy_rider_verification",
    "kind": "requirement",
    "label": "Policy & rider verification",
    "requirementRef": "Policy & rider verification",
    "category": "Policy",
    "status": "Pending",
    "stage": "fnol_received",
    "dueDate": "2026-01-30",
    "source": "policy_admin",
    "trigger": "SBLI task seed",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "document",
        "id": "doc_policy_cd26",
        "label": "doc_policy_cd26"
      },
      {
        "kind": "task",
        "id": "task_cd5180",
        "label": "task_cd5180"
      }
    ]
  },
  {
    "id": "req_cd26_5546112_requirement_functional_capacity_evaluation",
    "kind": "requirement",
    "label": "Requirement — Functional Capacity Evaluation",
    "requirementRef": "Requirement — Functional Capacity Evaluation",
    "category": "Documentation",
    "status": "Pending",
    "stage": "medical_review",
    "dueDate": "2026-05-15",
    "source": "task_context_card",
    "trigger": "SBLI task seed",
    "workflowStepId": "medical_review",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "task",
        "id": "task_cd5203",
        "label": "task_cd5203"
      }
    ]
  },
  {
    "id": "req_cd26_5546112_surgical_report",
    "kind": "requirement",
    "label": "Surgical Report",
    "requirementRef": "Surgical Report",
    "category": "Medical",
    "status": "Pending",
    "stage": "medical_review",
    "dueDate": "2026-03-08",
    "source": "medical_provider",
    "trigger": "SBLI task seed",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
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
        "id": "task_cd5221",
        "label": "task_cd5221"
      }
    ]
  },
  {
    "id": "req_cd44_6679812_contestability_review_mib_vs_application",
    "kind": "requirement",
    "label": "Contestability review — MIB vs. application",
    "requirementRef": "Contestability review — MIB vs. application",
    "category": "Investigative",
    "status": "Pending",
    "stage": "contestability_review",
    "dueDate": "2026-05-10",
    "source": "ai_agent",
    "trigger": "SBLI task seed",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "CD44-6679812"
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
    "id": "req_nb66_7622343_attending_physician_statement_aps",
    "kind": "requirement",
    "label": "Attending Physician Statement (APS)",
    "requirementRef": "Attending Physician Statement (APS)",
    "category": "Medical",
    "status": "Pending",
    "source": "medical_provider",
    "trigger": "SBLI task seed",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "NB66-7622343"
      },
      {
        "kind": "document",
        "id": "doc_aps_nb66",
        "label": "doc_aps_nb66"
      }
    ]
  },
  {
    "id": "req_nb66_7622343_mib_hit_prior_decline_2022",
    "kind": "requirement",
    "label": "MIB hit — prior decline 2022",
    "requirementRef": "MIB hit — prior decline 2022",
    "category": "Investigative",
    "status": "Pending",
    "stage": "requirement_gathering",
    "dueDate": "2026-05-18",
    "source": "task_context_card",
    "trigger": "SBLI task seed",
    "workflowStepId": "requirement_gathering",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "NB66-7622343"
      },
      {
        "kind": "task",
        "id": "task_nb4032",
        "label": "task_nb4032"
      }
    ]
  }
];

export const SBLI_DOCUMENT_RECORDS: DatasetDocumentRecord[] = [
  {
    "id": "doc_aps_cd26",
    "kind": "document",
    "label": "Attending Physician Statement.pdf",
    "filename": "APS_drchen_ortho.pdf",
    "category": "Medical",
    "status": "Validated",
    "uploaded": "2026-02-22",
    "uploadedAt": "2026-02-22",
    "source": "medical_provider",
    "claimant": "Billy Bud",
    "reqContext": "This evidence is linked to the Disability benefit claim review. The APS from Dr. Chen documents ongoing functional impairment following right knee replacement. It is the primary clinical evidence supporting the total disability determination under the WOP rider.",
    "insights": [
      {
        "anchor": "Anchor 1",
        "title": "Functional limitation confirmed",
        "body": "Physician statement aligns with functional capacity evidence. Right knee replacement precludes performance of manual courier duties.",
        "confidence": "High"
      },
      {
        "anchor": "Anchor 2",
        "title": "Total disability standard met",
        "body": "Dr. Chen confirms patient is unable to perform any duties of their own occupation. Own-occupation definition satisfied.",
        "confidence": "High"
      },
      {
        "anchor": "Anchor 3",
        "title": "Pre-existing condition note",
        "body": "T2 Diabetes noted as managed condition — physician confirms it is not contributing to current disability episode.",
        "confidence": "Medium"
      }
    ],
    "followUps": 2,
    "insight": "APS confirms functional limitation and supports claim decision readiness.",
    "aiInsight": true,
    "aiConfidence": 0.9,
    "aiSummary": "APS confirms functional limitation and supports claim decision readiness.",
    "aiAction": "Review evidence",
    "linkedRequirement": "Attending Physician Statement",
    "linkedRequirementId": "req_cd26_5546112_attending_physician_statement",
    "linkedCase": "CD26-5546112",
    "linkedCaseId": "CD26-5546112",
    "fileSize": "890 KB",
    "fileType": "PDF",
    "fileAvailable": true,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_attending_physician_statement",
        "label": "Attending Physician Statement"
      }
    ]
  },
  {
    "id": "doc_surgical_cd26",
    "kind": "document",
    "label": "Surgical Report — Right Knee.pdf",
    "filename": "surgical_report_stlukes.pdf",
    "category": "Medical",
    "status": "Validated",
    "uploaded": "2026-03-04",
    "uploadedAt": "2026-03-04",
    "source": "medical_provider",
    "claimant": "Billy Bud",
    "reqContext": "Surgical documentation from St. Luke's Hospital confirming the procedure performed Jan 30, 2026. Required to validate the nature and severity of the disability event.",
    "insights": [
      {
        "anchor": "Anchor 1",
        "title": "Surgery confirmed — Jan 30, 2026",
        "body": "Total right knee arthroplasty performed. Post-operative notes confirm full weight-bearing restricted for minimum 12 weeks.",
        "confidence": "High"
      },
      {
        "anchor": "Anchor 2",
        "title": "Recovery timeline — 6 to 9 months",
        "body": "Orthopedic prognosis: return to manual labour not expected before Q4 2026 at earliest.",
        "confidence": "High"
      }
    ],
    "followUps": 1,
    "insight": "Right knee replacement documented. 6–9 month recovery precludes manual labour.",
    "aiInsight": true,
    "aiConfidence": 0.9,
    "aiSummary": "Right knee replacement documented. 6–9 month recovery precludes manual labour.",
    "aiAction": "Review evidence",
    "linkedRequirement": "Surgical Report",
    "linkedRequirementId": "req_cd26_5546112_surgical_report",
    "linkedCase": "CD26-5546112",
    "linkedCaseId": "CD26-5546112",
    "fileSize": "1.2 MB",
    "fileType": "PDF",
    "fileAvailable": true,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_surgical_report",
        "label": "Surgical Report"
      }
    ]
  },
  {
    "id": "doc_wop_form_cd26",
    "kind": "document",
    "label": "WOP Claim Form — Billy Bud.pdf",
    "filename": "WOP_claim_form_bud.pdf",
    "category": "Claim",
    "status": "Validated",
    "uploaded": "2026-01-30",
    "uploadedAt": "2026-01-30",
    "source": "claimant_portal",
    "claimant": "Billy Bud",
    "reqContext": "Initial claim submission. All mandatory FNOL fields present. Sub-type declared as Waiver of Premium following total disability.",
    "insights": [
      {
        "anchor": "Anchor 1",
        "title": "Claim dates consistent",
        "body": "Accident date Jan 30, 2026 matches employer confirmation and attending physician records.",
        "confidence": "High"
      }
    ],
    "followUps": 0,
    "insight": "FNOL complete. Total disability and accident date declared by claimant.",
    "aiInsight": true,
    "aiConfidence": 0.9,
    "aiSummary": "FNOL complete. Total disability and accident date declared by claimant.",
    "aiAction": "Review evidence",
    "linkedRequirement": "FNOL — WOP claim form",
    "linkedRequirementId": "req_cd26_5546112_fnol_wop_claim_form",
    "linkedCase": "CD26-5546112",
    "linkedCaseId": "CD26-5546112",
    "fileSize": "240 KB",
    "fileType": "PDF",
    "fileAvailable": true,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_fnol_wop_claim_form",
        "label": "FNOL — WOP claim form"
      }
    ]
  },
  {
    "id": "doc_employer_cd26",
    "kind": "document",
    "label": "Employer Confirmation Letter.pdf",
    "filename": "employer_letter_fastroute.pdf",
    "category": "Employment",
    "status": "Validated",
    "uploaded": "2026-02-09",
    "uploadedAt": "2026-02-09",
    "source": "employer_portal",
    "claimant": "Billy Bud",
    "reqContext": "Employer confirmation required to validate the unable-to-work-for-profit definition under the WOP rider.",
    "insights": [
      {
        "anchor": "Anchor 1",
        "title": "Last day worked confirmed",
        "body": "FastRoute HR confirms Jan 30, 2026 as last active day. No return to work scheduled.",
        "confidence": "High"
      },
      {
        "anchor": "Anchor 2",
        "title": "Salary replacement note",
        "body": "Employer sick pay exhausted May 1, 2026. No income replacement currently in place.",
        "confidence": "Medium"
      }
    ],
    "followUps": 0,
    "insight": "FastRoute Couriers confirms last day worked Jan 30, 2026 and ongoing absence.",
    "aiInsight": true,
    "aiConfidence": 0.9,
    "aiSummary": "FastRoute Couriers confirms last day worked Jan 30, 2026 and ongoing absence.",
    "aiAction": "Review evidence",
    "linkedRequirement": "Employer inability-to-work confirmation",
    "linkedRequirementId": "req_cd26_5546112_employer_inability_to_work_confirmation",
    "linkedCase": "CD26-5546112",
    "linkedCaseId": "CD26-5546112",
    "fileSize": "180 KB",
    "fileType": "PDF",
    "fileAvailable": true,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_employer_inability_to_work_confirmation",
        "label": "Employer inability-to-work confirmation"
      }
    ]
  },
  {
    "id": "doc_policy_cd26",
    "kind": "document",
    "label": "Policy Certificate — SBLI-TL-2021-004821.pdf",
    "filename": "policy_SBLI_TL2021.pdf",
    "category": "Policy",
    "status": "Validated",
    "uploaded": "2026-02-01",
    "uploadedAt": "2026-02-01",
    "source": "policy_admin",
    "claimant": "Billy Bud",
    "reqContext": "Policy certificate confirming coverage terms, WOP rider inclusion, and in-force status at time of disability event.",
    "insights": [
      {
        "anchor": "Anchor 1",
        "title": "WOP rider active — no exclusions",
        "body": "Waiver of Premium rider confirmed active. No exclusions apply to the declared cause of disability.",
        "confidence": "High"
      }
    ],
    "followUps": 0,
    "insight": "Policy in force. WOP rider confirmed active since policy issue Mar 2021.",
    "aiInsight": true,
    "aiConfidence": 0.9,
    "aiSummary": "Policy in force. WOP rider confirmed active since policy issue Mar 2021.",
    "aiAction": "Review evidence",
    "linkedRequirement": "Policy & rider verification",
    "linkedRequirementId": "req_cd26_5546112_policy_rider_verification",
    "linkedCase": "CD26-5546112",
    "linkedCaseId": "CD26-5546112",
    "fileSize": "320 KB",
    "fileType": "PDF",
    "fileAvailable": true,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_policy_rider_verification",
        "label": "Policy & rider verification"
      }
    ]
  },
  {
    "id": "doc_mib_cd44",
    "kind": "document",
    "label": "MIB Disclosure Comparison.pdf",
    "filename": "MIB_disclosure_comparison.pdf",
    "category": "Investigative",
    "status": "Under Review",
    "uploaded": "2026-05-10",
    "uploadedAt": "2026-05-10",
    "source": "ai_agent",
    "claimant": "Marie Dupont",
    "reqContext": "AI-generated comparison of MIB report against application disclosures. Required as part of contestability review for death benefit claims. Policy was in force 6y 11m — contestability period has lapsed but standard review is required.",
    "insights": [
      {
        "anchor": "Anchor 1",
        "title": "No material misrepresentation",
        "body": "MIB report confirms prior cardiac history consistent with application disclosures. No undisclosed conditions identified.",
        "confidence": "High"
      },
      {
        "anchor": "Anchor 2",
        "title": "Cause of death consistent with disclosure",
        "body": "ICD-10 I21.9 (acute MI) is consistent with disclosed cardiac history and family history of heart disease.",
        "confidence": "High"
      }
    ],
    "followUps": 0,
    "insight": "No discrepancies found — application disclosures match MIB record.",
    "aiInsight": true,
    "aiConfidence": 0.9,
    "aiSummary": "No discrepancies found — application disclosures match MIB record.",
    "aiAction": "Review evidence",
    "linkedRequirement": "Contestability review — MIB vs. application",
    "linkedRequirementId": "req_cd44_6679812_contestability_review_mib_vs_application",
    "linkedCase": "CD44-6679812",
    "linkedCaseId": "CD44-6679812",
    "fileSize": "420 KB",
    "fileType": "PDF",
    "fileAvailable": true,
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "CD44-6679812"
      },
      {
        "kind": "requirement",
        "id": "req_cd44_6679812_contestability_review_mib_vs_application",
        "label": "Contestability review — MIB vs. application"
      }
    ]
  },
  {
    "id": "doc_aps_nb66",
    "kind": "document",
    "label": "Attending Physician Statement — Dr. Kowalski.pdf",
    "filename": "APS_drkowalski_diabetes.pdf",
    "category": "Medical",
    "status": "Pending Review",
    "uploaded": null,
    "uploadedAt": null,
    "source": "medical_provider",
    "claimant": "Marc Tremblay",
    "reqContext": "APS is critical to validate the preliminary debit/credit scoring — specifically the HbA1c trend, medication compliance, and any related complications. Also required to contextualize the 2022 MIB prior decline.",
    "insights": [],
    "followUps": 0,
    "insight": "APS requested from Dr. Kowalski — diabetes management history and HbA1c trend required.",
    "aiInsight": false,
    "aiSummary": "APS requested from Dr. Kowalski — diabetes management history and HbA1c trend required.",
    "aiAction": "Await file",
    "linkedRequirement": "Attending Physician Statement (APS)",
    "linkedRequirementId": "req_nb66_7622343_attending_physician_statement_aps",
    "linkedCase": "NB66-7622343",
    "linkedCaseId": "NB66-7622343",
    "fileSize": "760 KB",
    "fileType": "PDF",
    "fileAvailable": false,
    "placeholderReason": "Document requested but not yet received.",
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "NB66-7622343"
      },
      {
        "kind": "requirement",
        "id": "req_nb66_7622343_attending_physician_statement_aps",
        "label": "Attending Physician Statement (APS)"
      }
    ]
  }
];

export const SBLI_DOCUMENT_EVIDENCE_RECORDS: DocumentEvidenceRecord[] = [
  {
    "id": "evidence_doc_aps_cd26",
    "kind": "document_evidence",
    "documentId": "doc_aps_cd26",
    "title": "Attending Physician Statement.pdf",
    "summary": "APS confirms functional limitation and supports claim decision readiness.",
    "pages": [
      {
        "number": 1,
        "image": "/evidence-medical-report-page.png",
        "label": "Page 1"
      }
    ],
    "findings": [
      {
        "id": "doc_aps_cd26_anchor_1",
        "severity": "High",
        "title": "Functional limitation confirmed",
        "quote": "Anchor 1",
        "reasoning": "Physician statement aligns with functional capacity evidence. Right knee replacement precludes performance of manual courier duties.",
        "impact": "This evidence is linked to the Disability benefit claim review. The APS from Dr. Chen documents ongoing functional impairment following right knee replacement. It is the primary clinical evidence supporting the total disability determination under the WOP rider."
      },
      {
        "id": "doc_aps_cd26_anchor_2",
        "severity": "High",
        "title": "Total disability standard met",
        "quote": "Anchor 2",
        "reasoning": "Dr. Chen confirms patient is unable to perform any duties of their own occupation. Own-occupation definition satisfied.",
        "impact": "This evidence is linked to the Disability benefit claim review. The APS from Dr. Chen documents ongoing functional impairment following right knee replacement. It is the primary clinical evidence supporting the total disability determination under the WOP rider."
      },
      {
        "id": "doc_aps_cd26_anchor_3",
        "severity": "Medium",
        "title": "Pre-existing condition note",
        "quote": "Anchor 3",
        "reasoning": "T2 Diabetes noted as managed condition — physician confirms it is not contributing to current disability episode.",
        "impact": "This evidence is linked to the Disability benefit claim review. The APS from Dr. Chen documents ongoing functional impairment following right knee replacement. It is the primary clinical evidence supporting the total disability determination under the WOP rider."
      }
    ],
    "linkedObjects": [
      {
        "kind": "document",
        "id": "doc_aps_cd26",
        "label": "Attending Physician Statement.pdf"
      },
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_attending_physician_statement",
        "label": "Attending Physician Statement"
      }
    ]
  },
  {
    "id": "evidence_doc_surgical_cd26",
    "kind": "document_evidence",
    "documentId": "doc_surgical_cd26",
    "title": "Surgical Report — Right Knee.pdf",
    "summary": "Right knee replacement documented. 6–9 month recovery precludes manual labour.",
    "pages": [
      {
        "number": 1,
        "image": "/evidence-medical-report-page.png",
        "label": "Page 1"
      }
    ],
    "findings": [
      {
        "id": "doc_surgical_cd26_anchor_1",
        "severity": "High",
        "title": "Surgery confirmed — Jan 30, 2026",
        "quote": "Anchor 1",
        "reasoning": "Total right knee arthroplasty performed. Post-operative notes confirm full weight-bearing restricted for minimum 12 weeks.",
        "impact": "Surgical documentation from St. Luke's Hospital confirming the procedure performed Jan 30, 2026. Required to validate the nature and severity of the disability event."
      },
      {
        "id": "doc_surgical_cd26_anchor_2",
        "severity": "High",
        "title": "Recovery timeline — 6 to 9 months",
        "quote": "Anchor 2",
        "reasoning": "Orthopedic prognosis: return to manual labour not expected before Q4 2026 at earliest.",
        "impact": "Surgical documentation from St. Luke's Hospital confirming the procedure performed Jan 30, 2026. Required to validate the nature and severity of the disability event."
      }
    ],
    "linkedObjects": [
      {
        "kind": "document",
        "id": "doc_surgical_cd26",
        "label": "Surgical Report — Right Knee.pdf"
      },
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_surgical_report",
        "label": "Surgical Report"
      }
    ]
  },
  {
    "id": "evidence_doc_wop_form_cd26",
    "kind": "document_evidence",
    "documentId": "doc_wop_form_cd26",
    "title": "WOP Claim Form — Billy Bud.pdf",
    "summary": "FNOL complete. Total disability and accident date declared by claimant.",
    "pages": [
      {
        "number": 1,
        "image": "/evidence-medical-report-page.png",
        "label": "Page 1"
      }
    ],
    "findings": [
      {
        "id": "doc_wop_form_cd26_anchor_1",
        "severity": "High",
        "title": "Claim dates consistent",
        "quote": "Anchor 1",
        "reasoning": "Accident date Jan 30, 2026 matches employer confirmation and attending physician records.",
        "impact": "Initial claim submission. All mandatory FNOL fields present. Sub-type declared as Waiver of Premium following total disability."
      }
    ],
    "linkedObjects": [
      {
        "kind": "document",
        "id": "doc_wop_form_cd26",
        "label": "WOP Claim Form — Billy Bud.pdf"
      },
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_fnol_wop_claim_form",
        "label": "FNOL — WOP claim form"
      }
    ]
  },
  {
    "id": "evidence_doc_employer_cd26",
    "kind": "document_evidence",
    "documentId": "doc_employer_cd26",
    "title": "Employer Confirmation Letter.pdf",
    "summary": "FastRoute Couriers confirms last day worked Jan 30, 2026 and ongoing absence.",
    "pages": [
      {
        "number": 1,
        "image": "/evidence-medical-report-page.png",
        "label": "Page 1"
      }
    ],
    "findings": [
      {
        "id": "doc_employer_cd26_anchor_1",
        "severity": "High",
        "title": "Last day worked confirmed",
        "quote": "Anchor 1",
        "reasoning": "FastRoute HR confirms Jan 30, 2026 as last active day. No return to work scheduled.",
        "impact": "Employer confirmation required to validate the unable-to-work-for-profit definition under the WOP rider."
      },
      {
        "id": "doc_employer_cd26_anchor_2",
        "severity": "Medium",
        "title": "Salary replacement note",
        "quote": "Anchor 2",
        "reasoning": "Employer sick pay exhausted May 1, 2026. No income replacement currently in place.",
        "impact": "Employer confirmation required to validate the unable-to-work-for-profit definition under the WOP rider."
      }
    ],
    "linkedObjects": [
      {
        "kind": "document",
        "id": "doc_employer_cd26",
        "label": "Employer Confirmation Letter.pdf"
      },
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_employer_inability_to_work_confirmation",
        "label": "Employer inability-to-work confirmation"
      }
    ]
  },
  {
    "id": "evidence_doc_policy_cd26",
    "kind": "document_evidence",
    "documentId": "doc_policy_cd26",
    "title": "Policy Certificate — SBLI-TL-2021-004821.pdf",
    "summary": "Policy in force. WOP rider confirmed active since policy issue Mar 2021.",
    "pages": [
      {
        "number": 1,
        "image": "/evidence-medical-report-page.png",
        "label": "Page 1"
      }
    ],
    "findings": [
      {
        "id": "doc_policy_cd26_anchor_1",
        "severity": "High",
        "title": "WOP rider active — no exclusions",
        "quote": "Anchor 1",
        "reasoning": "Waiver of Premium rider confirmed active. No exclusions apply to the declared cause of disability.",
        "impact": "Policy certificate confirming coverage terms, WOP rider inclusion, and in-force status at time of disability event."
      }
    ],
    "linkedObjects": [
      {
        "kind": "document",
        "id": "doc_policy_cd26",
        "label": "Policy Certificate — SBLI-TL-2021-004821.pdf"
      },
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "CD26-5546112"
      },
      {
        "kind": "requirement",
        "id": "req_cd26_5546112_policy_rider_verification",
        "label": "Policy & rider verification"
      }
    ]
  },
  {
    "id": "evidence_doc_mib_cd44",
    "kind": "document_evidence",
    "documentId": "doc_mib_cd44",
    "title": "MIB Disclosure Comparison.pdf",
    "summary": "No discrepancies found — application disclosures match MIB record.",
    "pages": [
      {
        "number": 1,
        "image": "/evidence-medical-report-page.png",
        "label": "Page 1"
      }
    ],
    "findings": [
      {
        "id": "doc_mib_cd44_anchor_1",
        "severity": "High",
        "title": "No material misrepresentation",
        "quote": "Anchor 1",
        "reasoning": "MIB report confirms prior cardiac history consistent with application disclosures. No undisclosed conditions identified.",
        "impact": "AI-generated comparison of MIB report against application disclosures. Required as part of contestability review for death benefit claims. Policy was in force 6y 11m — contestability period has lapsed but standard review is required."
      },
      {
        "id": "doc_mib_cd44_anchor_2",
        "severity": "High",
        "title": "Cause of death consistent with disclosure",
        "quote": "Anchor 2",
        "reasoning": "ICD-10 I21.9 (acute MI) is consistent with disclosed cardiac history and family history of heart disease.",
        "impact": "AI-generated comparison of MIB report against application disclosures. Required as part of contestability review for death benefit claims. Policy was in force 6y 11m — contestability period has lapsed but standard review is required."
      }
    ],
    "linkedObjects": [
      {
        "kind": "document",
        "id": "doc_mib_cd44",
        "label": "MIB Disclosure Comparison.pdf"
      },
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "CD44-6679812"
      },
      {
        "kind": "requirement",
        "id": "req_cd44_6679812_contestability_review_mib_vs_application",
        "label": "Contestability review — MIB vs. application"
      }
    ]
  },
  {
    "id": "evidence_doc_death_cert_cd44",
    "kind": "document_evidence",
    "documentId": "doc_death_cert_cd44",
    "title": "Certified Death Certificate.pdf",
    "summary": "Certified death certificate confirms date and cause of death for Thomas Dupont.",
    "pages": [
      {
        "number": 1,
        "image": "/evidence-medical-report-page.png",
        "label": "Page 1"
      }
    ],
    "findings": [
      {
        "id": "doc_death_cert_cd44_anchor_1",
        "severity": "High",
        "title": "Date of death confirmed",
        "quote": "Date of death: March 12, 2026",
        "reasoning": "Certified record shows death date consistent with claim notification timeline.",
        "impact": "Supports FNOL date alignment for the death benefit claim."
      },
      {
        "id": "doc_death_cert_cd44_anchor_2",
        "severity": "High",
        "title": "Cause of death recorded",
        "quote": "Cause: Acute myocardial infarction (I21.9)",
        "reasoning": "Primary cause matches attending physician statement and MIB cardiac history.",
        "impact": "Required for contestability and benefit determination on CD44-6679812."
      }
    ],
    "linkedObjects": [
      {
        "kind": "document",
        "id": "doc_death_cert_cd44",
        "label": "Certified Death Certificate.pdf"
      },
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "CD44-6679812"
      },
      {
        "kind": "requirement",
        "id": "req_sd_002",
        "label": "Certified Death Certificate"
      }
    ]
  },
  {
    "id": "evidence_doc_aps_cd44",
    "kind": "document_evidence",
    "documentId": "doc_aps_cd44",
    "title": "Attending Physician Statement.pdf",
    "summary": "APS corroborates cause of death and prior cardiac history for Thomas Dupont.",
    "pages": [
      {
        "number": 1,
        "image": "/evidence-medical-report-page.png",
        "label": "Page 1"
      }
    ],
    "findings": [
      {
        "id": "doc_aps_cd44_anchor_1",
        "severity": "High",
        "title": "Cause of death consistent",
        "quote": "Immediate cause: Acute myocardial infarction",
        "reasoning": "Physician statement aligns with certified death certificate primary cause.",
        "impact": "Closes medical causation loop for the death claim."
      },
      {
        "id": "doc_aps_cd44_anchor_2",
        "severity": "Medium",
        "title": "Prior cardiac history noted",
        "quote": "History of hypertension and prior angina",
        "reasoning": "Prior conditions were disclosed on application; no new undisclosed condition identified.",
        "impact": "Supports contestability review outcome when paired with MIB comparison."
      }
    ],
    "linkedObjects": [
      {
        "kind": "document",
        "id": "doc_aps_cd44",
        "label": "Attending Physician Statement.pdf"
      },
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "CD44-6679812"
      },
      {
        "kind": "requirement",
        "id": "req_sd_003",
        "label": "Attending Physician Statement (APS)"
      }
    ]
  }
];
