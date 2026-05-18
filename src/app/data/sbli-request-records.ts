import type { DatasetRequestRecord } from './multi-case-dataset';

export const SBLI_REQUEST_RECORDS: DatasetRequestRecord[] = [
  {
    "id": "REQ-2026-001",
    "kind": "request",
    "label": "Waiver of Premium — total disability following motorcycle accident",
    "status": "In progress",
    "source": "Claimant portal",
    "caseId": "CD26-5546112",
    "caseKey": "bb",
    "subtype": "WOP disability claim",
    "name": "Waiver of Premium — total disability following motorcycle accident",
    "category": "Claims",
    "priority": "High",
    "requester": "Billy Bud",
    "requesterRole": "Insured / Claimant",
    "requesterInitials": "BB",
    "channel": "Claimant portal",
    "received": "Jan 30, 2026",
    "receivedFull": "2026-01-30",
    "receivedTime": "14:22",
    "statusCls": "pq",
    "assignee": "Victor Ramon",
    "assignedTo": "Victor Ramon",
    "sourceChannel": "Claimant portal",
    "sourceDetail": "Claimant portal",
    "due": "Jan 30, 2026",
    "aiSummary": "Billy Bud submitted a Waiver of Premium claim via the SBLI claimant portal on Jan 30, 2026 following a motorcycle accident resulting in a right knee replacement and total disability. Policy SBLI-TL-2021-004821 is in force with an active WOP rider. Case CD26-5546112 is at the Decision stage pending two outstanding requirements (FCE and earnings verification). AI confidence: 91%.",
    "summary": "Billy Bud submitted a Waiver of Premium claim via the SBLI claimant portal on Jan 30, 2026 following a motorcycle accident resulting in a right knee replacement and total disability. Policy SBLI-TL-2021-004821 is in force with an active WOP rider. Case CD26-5546112 is at the Decision stage pending two outstanding requirements (FCE and earnings verification). AI confidence: 91%.",
    "nextAction": "Open case CD26-5546112",
    "form": {
      "submitted": "2026-01-30 at 14:22",
      "channel": "SBLI Claimant Portal",
      "formType": "SBLI WOP Claim Form v3.1",
      "formVersion": "3.1",
      "fields": [
        {
          "label": "Policy number",
          "value": "SBLI-TL-2021-004821"
        },
        {
          "label": "Date of disability",
          "value": "January 30, 2026"
        },
        {
          "label": "Cause of disability",
          "value": "Motorcycle accident — multiple fractures, right knee replacement"
        },
        {
          "label": "Occupation",
          "value": "Motorcycle courier, FastRoute Couriers Ltd"
        },
        {
          "label": "Occupational class",
          "value": "Class 4 — manual labour"
        },
        {
          "label": "Last day worked",
          "value": "January 30, 2026"
        },
        {
          "label": "Attending physician",
          "value": "Dr. Andrew Chen, St. Luke's Orthopedics"
        },
        {
          "label": "Claimant declaration",
          "value": "I certify I am totally disabled and unable to perform the duties of my occupation as a result of the above injury."
        },
        {
          "label": "Documents attached",
          "value": "WOP_claim_form_bud.pdf (240 KB)"
        }
      ]
    },
    "aiActions": [
      {
        "ts": "2026-01-30 14:23",
        "actor": "AI Agent",
        "actorType": "AI Agent",
        "icon": "ti-sparkles",
        "dotCls": "rp-tl-dot-ai",
        "action": "Request received and parsed",
        "detail": "SBLI WOP claim form validated. All mandatory fields present. Policy SBLI-TL-2021-004821 cross-referenced against policy admin — confirmed in force with active WOP rider."
      },
      {
        "ts": "2026-01-30 14:24",
        "actor": "AI Agent",
        "actorType": "AI Agent",
        "icon": "ti-sparkles",
        "dotCls": "rp-tl-dot-ai",
        "action": "WOP rider eligibility confirmed",
        "detail": "WOP rider active since Mar 2021. No exclusions apply to declared accident cause. 90-day waiting period clause noted — satisfied Apr 30, 2026."
      },
      {
        "ts": "2026-01-30 14:25",
        "actor": "System",
        "actorType": "System",
        "icon": "ti-bolt",
        "dotCls": "rp-tl-dot-system",
        "action": "Case CD26-5546112 created",
        "detail": "Disability benefit claim case opened. Sub-type: Waiver of premium. Assigned to Victor Ramon (Life Claims, Band 3). SLA: 30 business days."
      },
      {
        "ts": "2026-01-30 14:25",
        "actor": "AI Agent",
        "actorType": "AI Agent",
        "icon": "ti-sparkles",
        "dotCls": "rp-tl-dot-ai",
        "action": "Initial task set generated — 9 tasks created",
        "detail": "7 requirements identified across 5 workflow stages. 9 tasks created: CD-5180 (FNOL registration), CD-5181 (triage routing), CD-5190 (employer confirmation), CD-5191 (APS order), CD-5203 (FCE chase), CD-5210 (medical review), CD-5211 (AI narrative), CD-5220 (earnings chase), CD-5221 (approval decision)."
      },
      {
        "ts": "2026-01-30 14:26",
        "actor": "System",
        "actorType": "System",
        "icon": "ti-mail",
        "dotCls": "rp-tl-dot-system",
        "action": "Acknowledgment sent to claimant",
        "detail": "Automated acknowledgment email sent to Billy Bud. WOP rider confirmed in force. Assessor Victor Ramon assigned. Reference CD26-5546112. Next steps outlined."
      }
    ],
    "humanActions": [
      {
        "ts": "Feb 5, 2026",
        "actor": "Victor Ramon",
        "actorType": "Human",
        "icon": "ti-user",
        "dotCls": "rp-tl-dot-human",
        "action": "Employer confirmation requested",
        "detail": "FastRoute Couriers HR contacted via employer portal. Confirmation of last day worked and ongoing inability to work requested. Follow-up set Feb 12."
      },
      {
        "ts": "Feb 10, 2026",
        "actor": "Victor Ramon",
        "actorType": "Human",
        "icon": "ti-user",
        "dotCls": "rp-tl-dot-human",
        "action": "APS ordered from Dr. Chen",
        "detail": "Attending Physician Statement requested from Dr. Andrew Chen, St. Luke's Orthopedics. Specifying WOP total disability standard. Due Feb 20."
      },
      {
        "ts": "Feb 22, 2026",
        "actor": "System",
        "actorType": "System",
        "icon": "ti-circle-check",
        "dotCls": "rp-tl-dot-success",
        "action": "APS received and AI-validated — confidence 91%",
        "detail": "APS from Dr. Chen received. AI parsed — total disability confirmed. Own-occupation definition satisfied. T2D confirmed unrelated to disability episode."
      },
      {
        "ts": "Mar 9, 2026",
        "actor": "AI Agent",
        "actorType": "AI Agent",
        "icon": "ti-sparkles",
        "dotCls": "rp-tl-dot-ai",
        "action": "Total disability assessment narrative generated",
        "detail": "AI narrative generated with 91% confidence. All disability conditions met. WOP rider conditions satisfied. Recommend approval once FCE and earnings verification received."
      },
      {
        "ts": "May 14, 2026",
        "actor": "Richard Daniels",
        "actorType": "Human",
        "icon": "ti-alert-triangle",
        "dotCls": "rp-tl-dot-warn",
        "action": "SLA breach escalated — FCE and earnings outstanding",
        "detail": "FCE overdue 35 days. Earnings verification 14 days overdue. Second chase sent for both. Escalation flag raised. Decision stage ready on receipt."
      }
    ],
    "linkedCase": {
      "id": "CD26-5546112",
      "label": "Claim · Waiver of premium",
      "status": "Pending decision",
      "stage": "Decision",
      "statusCls": "pp"
    },
    "linkedTasks": [
      "task_cd5180",
      "task_cd5181",
      "task_cd5190",
      "task_cd5191",
      "task_cd5203",
      "task_cd5210",
      "task_cd5211",
      "task_cd5220",
      "task_cd5221"
    ],
    "linkedReqs": [
      "req_bb_001",
      "req_bb_002",
      "req_bb_003",
      "req_bb_004",
      "req_bb_005",
      "req_bb_006",
      "req_bb_007"
    ],
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "Claim · Waiver of premium"
      },
      {
        "kind": "task",
        "id": "task_cd5180",
        "label": "CD-5180"
      },
      {
        "kind": "task",
        "id": "task_cd5181",
        "label": "CD-5181"
      },
      {
        "kind": "task",
        "id": "task_cd5190",
        "label": "CD-5190"
      },
      {
        "kind": "task",
        "id": "task_cd5191",
        "label": "CD-5191"
      },
      {
        "kind": "task",
        "id": "task_cd5203",
        "label": "CD-5203"
      },
      {
        "kind": "task",
        "id": "task_cd5210",
        "label": "CD-5210"
      },
      {
        "kind": "task",
        "id": "task_cd5211",
        "label": "CD-5211"
      },
      {
        "kind": "task",
        "id": "task_cd5220",
        "label": "CD-5220"
      },
      {
        "kind": "task",
        "id": "task_cd5221",
        "label": "CD-5221"
      },
      {
        "kind": "requirement",
        "id": "req_bb_001",
        "label": "req_bb_001"
      },
      {
        "kind": "requirement",
        "id": "req_bb_002",
        "label": "req_bb_002"
      },
      {
        "kind": "requirement",
        "id": "req_bb_003",
        "label": "req_bb_003"
      },
      {
        "kind": "requirement",
        "id": "req_bb_004",
        "label": "req_bb_004"
      },
      {
        "kind": "requirement",
        "id": "req_bb_005",
        "label": "req_bb_005"
      },
      {
        "kind": "requirement",
        "id": "req_bb_006",
        "label": "req_bb_006"
      },
      {
        "kind": "requirement",
        "id": "req_bb_007",
        "label": "req_bb_007"
      }
    ]
  },
  {
    "id": "REQ-2026-002",
    "kind": "request",
    "label": "Death benefit claim — Thomas Dupont, acute myocardial infarction",
    "status": "In progress",
    "source": "Claimant portal",
    "caseId": "CD44-6679812",
    "caseKey": "sd",
    "subtype": "Death benefit claim",
    "name": "Death benefit claim — Thomas Dupont, acute myocardial infarction",
    "category": "Claims",
    "priority": "High",
    "requester": "Marie Dupont",
    "requesterRole": "Spouse / Primary beneficiary",
    "requesterInitials": "MD",
    "channel": "Claimant portal",
    "received": "Feb 3, 2026",
    "receivedFull": "2026-02-03",
    "receivedTime": "10:15",
    "statusCls": "pq",
    "assignee": "Victor Ramon",
    "assignedTo": "Victor Ramon",
    "sourceChannel": "Claimant portal",
    "sourceDetail": "Claimant portal",
    "due": "Feb 3, 2026",
    "aiSummary": "Marie Dupont (spouse, primary beneficiary 100%) submitted a death benefit claim on Feb 3, 2026 following the death of insured Thomas Dupont on Jan 28, 2026 from acute myocardial infarction. Policy SBLI-TL-2019-009102 was in force for 6 years 11 months — contestability has lapsed. AI MIB comparison complete — no discrepancies found. Pending human sign-off before $500,000 ACH disbursement. AI confidence: 96%.",
    "summary": "Marie Dupont (spouse, primary beneficiary 100%) submitted a death benefit claim on Feb 3, 2026 following the death of insured Thomas Dupont on Jan 28, 2026 from acute myocardial infarction. Policy SBLI-TL-2019-009102 was in force for 6 years 11 months — contestability has lapsed. AI MIB comparison complete — no discrepancies found. Pending human sign-off before $500,000 ACH disbursement. AI confidence: 96%.",
    "nextAction": "Open case CD44-6679812",
    "form": {
      "submitted": "2026-02-03 at 10:15",
      "channel": "SBLI Claimant Portal",
      "formType": "SBLI Death Benefit Claim Form v2.4",
      "formVersion": "2.4",
      "fields": [
        {
          "label": "Policy number",
          "value": "SBLI-TL-2019-009102"
        },
        {
          "label": "Insured (deceased)",
          "value": "Thomas Dupont (DOB Jul 7, 1961)"
        },
        {
          "label": "Date of death",
          "value": "January 28, 2026"
        },
        {
          "label": "Cause of death",
          "value": "Acute myocardial infarction"
        },
        {
          "label": "Place of death",
          "value": "Portland General Hospital, Portland, OR"
        },
        {
          "label": "Beneficiary",
          "value": "Marie Dupont (spouse) — 100% primary"
        },
        {
          "label": "Payment method",
          "value": "ACH bank transfer — routing and account to be verified"
        },
        {
          "label": "Beneficiary declaration",
          "value": "I certify I am the designated primary beneficiary under the above policy."
        },
        {
          "label": "Documents attached",
          "value": "FNOL_death_dupont.pdf"
        }
      ]
    },
    "aiActions": [
      {
        "ts": "2026-02-03 10:16",
        "actor": "AI Agent",
        "actorType": "AI Agent",
        "icon": "ti-sparkles",
        "dotCls": "rp-tl-dot-ai",
        "action": "Death claim request parsed and validated",
        "detail": "All mandatory FNOL fields present. Policy SBLI-TL-2019-009102 confirmed in force. Marie Dupont confirmed as 100% primary beneficiary in policy admin. No contingent beneficiary override."
      },
      {
        "ts": "2026-02-04 09:02",
        "actor": "AI Agent",
        "actorType": "AI Agent",
        "icon": "ti-sparkles",
        "dotCls": "rp-tl-dot-ai",
        "action": "Contestability period calculated — lapsed",
        "detail": "Policy issued Feb 1, 2019. Date of death Jan 28, 2026. Time in force: 6y 11m. 2-year contestability window fully lapsed. Standard review pathway confirmed."
      },
      {
        "ts": "2026-02-04 09:03",
        "actor": "System",
        "actorType": "System",
        "icon": "ti-bolt",
        "dotCls": "rp-tl-dot-system",
        "action": "Case CD44-6679812 created",
        "detail": "Death benefit claim case opened. Assigned to Victor Ramon. SLA: 10 business days. 9 requirements generated. 7 tasks created across FNOL, triage, req. gathering, contestability review, and decision stages."
      },
      {
        "ts": "2026-05-10 11:30",
        "actor": "AI Agent",
        "actorType": "AI Agent",
        "icon": "ti-sparkles",
        "dotCls": "rp-tl-dot-ai",
        "action": "MIB vs. application comparison completed — clean",
        "detail": "No discrepancies found. Application disclosures match MIB record. Cause of death (acute MI, I21.9) consistent with disclosed cardiac history. Contestability risk: none. AI confidence: 96%."
      },
      {
        "ts": "2026-05-10 11:31",
        "actor": "System",
        "actorType": "System",
        "icon": "ti-circle-check",
        "dotCls": "rp-tl-dot-success",
        "action": "Ready for decision — all requirements met",
        "detail": "All 7 requirements satisfied. Case progressed to Decision stage. Contestability human sign-off is the only remaining action before $500,000 ACH disbursement is authorized."
      }
    ],
    "humanActions": [
      {
        "ts": "Feb 4, 2026",
        "actor": "Victor Ramon",
        "actorType": "Human",
        "icon": "ti-user",
        "dotCls": "rp-tl-dot-human",
        "action": "Condolences acknowledgment sent to beneficiary",
        "detail": "Personalized condolences email sent to Marie Dupont. Requirements, timeline, and next steps outlined. Claimant dedicated line provided."
      },
      {
        "ts": "Feb 5, 2026",
        "actor": "Victor Ramon",
        "actorType": "Human",
        "icon": "ti-user",
        "dotCls": "rp-tl-dot-human",
        "action": "APS, toxicology, and identity verification initiated",
        "detail": "APS requested from Dr. Harmon (Portland Cardiology Group). Toxicology from county medical examiner. Identity verification form sent to Marie Dupont."
      },
      {
        "ts": "May 14, 2026",
        "actor": "Victor Ramon",
        "actorType": "Human",
        "icon": "ti-user",
        "dotCls": "rp-tl-dot-human",
        "action": "Status update call with beneficiary",
        "detail": "Called Marie Dupont. Decision expected May 16. ACH payout 2–3 business days post-approval. Marie Dupont expressed gratitude. No further requirements needed from beneficiary."
      }
    ],
    "linkedCase": {
      "id": "CD44-6679812",
      "label": "Claim · Death benefit",
      "status": "Pending decision",
      "stage": "Contestability review",
      "statusCls": "pp"
    },
    "linkedTasks": [
      "task_cd6100",
      "task_cd6102",
      "task_cd6103",
      "task_cd6110",
      "task_cd6120",
      "task_cd6121",
      "task_cd6130"
    ],
    "linkedReqs": [
      "req_sd_001",
      "req_sd_002",
      "req_sd_003",
      "req_sd_004",
      "req_sd_005",
      "req_sd_006",
      "req_sd_007"
    ],
    "linkedObjects": [
      {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "Claim · Death benefit"
      },
      {
        "kind": "task",
        "id": "task_cd6100",
        "label": "CD-6100"
      },
      {
        "kind": "task",
        "id": "task_cd6102",
        "label": "CD-6102"
      },
      {
        "kind": "task",
        "id": "task_cd6103",
        "label": "CD-6103"
      },
      {
        "kind": "task",
        "id": "task_cd6110",
        "label": "CD-6110"
      },
      {
        "kind": "task",
        "id": "task_cd6120",
        "label": "CD-6120"
      },
      {
        "kind": "task",
        "id": "task_cd6121",
        "label": "CD-6121"
      },
      {
        "kind": "task",
        "id": "task_cd6130",
        "label": "CD-6130"
      },
      {
        "kind": "requirement",
        "id": "req_sd_001",
        "label": "req_sd_001"
      },
      {
        "kind": "requirement",
        "id": "req_sd_002",
        "label": "req_sd_002"
      },
      {
        "kind": "requirement",
        "id": "req_sd_003",
        "label": "req_sd_003"
      },
      {
        "kind": "requirement",
        "id": "req_sd_004",
        "label": "req_sd_004"
      },
      {
        "kind": "requirement",
        "id": "req_sd_005",
        "label": "req_sd_005"
      },
      {
        "kind": "requirement",
        "id": "req_sd_006",
        "label": "req_sd_006"
      },
      {
        "kind": "requirement",
        "id": "req_sd_007",
        "label": "req_sd_007"
      }
    ]
  },
  {
    "id": "REQ-2026-003",
    "kind": "request",
    "label": "SBLI Term Life 20 application — Marc Tremblay, $625,000 / 20-year",
    "status": "In progress",
    "source": "SBLI broker portal",
    "caseId": "NB66-7622343",
    "caseKey": "mt",
    "subtype": "Life insurance application",
    "name": "SBLI Term Life 20 application — Marc Tremblay, $625,000 / 20-year",
    "category": "New business",
    "priority": "Normal",
    "requester": "Northstar Advisory",
    "requesterRole": "SBLI broker — submitting agent",
    "requesterInitials": "NA",
    "channel": "SBLI broker portal",
    "received": "May 12, 2026",
    "receivedFull": "2026-05-12",
    "receivedTime": "09:41",
    "statusCls": "pq",
    "assignee": "Victor Ramon",
    "assignedTo": "Victor Ramon",
    "sourceChannel": "SBLI broker portal",
    "sourceDetail": "SBLI broker portal",
    "due": "May 12, 2026",
    "aiSummary": "Northstar Advisory submitted a SBLI Term Life 20 application for Marc Tremblay (DOB Jun 3, 1983) — $625,000 death benefit / 20-year term. Applicant disclosed T2 Diabetes (2019) and a prior insurance decline (2022). MIB check confirmed the prior decline — accelerated UW disqualified, traditional full underwriting required. Preliminary AI scoring: +75 debits, rated offer anticipated. APS and prior decline explanation letter currently outstanding. Paramedical scheduled May 19.",
    "summary": "Northstar Advisory submitted a SBLI Term Life 20 application for Marc Tremblay (DOB Jun 3, 1983) — $625,000 death benefit / 20-year term. Applicant disclosed T2 Diabetes (2019) and a prior insurance decline (2022). MIB check confirmed the prior decline — accelerated UW disqualified, traditional full underwriting required. Preliminary AI scoring: +75 debits, rated offer anticipated. APS and prior decline explanation letter currently outstanding. Paramedical scheduled May 19.",
    "nextAction": "Open case NB66-7622343",
    "form": {
      "submitted": "2026-05-12 at 09:41",
      "channel": "SBLI Broker Portal",
      "formType": "SBLI Term Life 20 Application v5.2",
      "formVersion": "5.2",
      "fields": [
        {
          "label": "Applicant",
          "value": "Marc Tremblay (DOB Jun 3, 1983)"
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
          "label": "Term",
          "value": "20 years"
        },
        {
          "label": "Monthly premium (indicative)",
          "value": "$85/month (subject to final UW)"
        },
        {
          "label": "Smoker status",
          "value": "Non-smoker (self-declared)"
        },
        {
          "label": "Height / Weight",
          "value": "5'10\" / 192 lb — BMI 27.4"
        },
        {
          "label": "Health disclosures",
          "value": "Type 2 Diabetes (2019, diet-controlled, Metformin 500mg, HbA1c 48 mmol/mol). Prior life insurance application decline (2022, carrier unknown)."
        },
        {
          "label": "Beneficiary 1",
          "value": "Claire Tremblay (spouse) — 70%"
        },
        {
          "label": "Beneficiary 2",
          "value": "Thomas Tremblay (child) — 30%"
        },
        {
          "label": "Riders selected",
          "value": "Accelerated death benefit (free), Waiver of premium, Accidental death benefit"
        },
        {
          "label": "Broker",
          "value": "Northstar Advisory — SBLI appointment active, E&O current through 2027-01-15"
        }
      ]
    },
    "aiActions": [
      {
        "ts": "2026-05-12 09:42",
        "actor": "AI Agent",
        "actorType": "AI Agent",
        "icon": "ti-sparkles",
        "dotCls": "rp-tl-dot-ai",
        "action": "Application received and broker verified",
        "detail": "All mandatory fields present. T2 Diabetes and prior decline properly disclosed. Broker Northstar Advisory: SBLI appointment active, license current, E&O confirmed."
      },
      {
        "ts": "2026-05-13 08:15",
        "actor": "AI Agent",
        "actorType": "AI Agent",
        "icon": "ti-sparkles",
        "dotCls": "rp-tl-dot-ai",
        "action": "MIB + MVR + Rx checks completed",
        "detail": "MIB: prior decline 2022 confirmed — accelerated UW disqualified, traditional UW path required. MVR: clean record, no violations. Rx: Metformin 500mg confirmed, consistent with disclosed T2D."
      },
      {
        "ts": "2026-05-13 08:20",
        "actor": "AI Agent",
        "actorType": "AI Agent",
        "icon": "ti-sparkles",
        "dotCls": "rp-tl-dot-ai",
        "action": "Preliminary debit/credit scoring generated — +75 debits",
        "detail": "T2D (diet-controlled) +50 | BMI 27.4 +25 | Non-smoker (Rx verified) -30 | HbA1c 48 well-controlled -20 | MIB prior decline +50 (unresolved) | Father MI age 58 +15 est. Net: +75 debits. Rated offer at approx. Table 2 anticipated. Pending APS and paramedical for final score."
      },
      {
        "ts": "2026-05-13 08:21",
        "actor": "System",
        "actorType": "System",
        "icon": "ti-bolt",
        "dotCls": "rp-tl-dot-system",
        "action": "Case NB66-7622343 created — traditional UW path",
        "detail": "Full underwriting case created. Assigned to Victor Ramon. 7 requirements generated. 11 tasks created across application received, initial review, requirement gathering, UW review, and decision stages."
      },
      {
        "ts": "2026-05-13 08:22",
        "actor": "System",
        "actorType": "System",
        "icon": "ti-mail",
        "dotCls": "rp-tl-dot-system",
        "action": "Acknowledgment sent to applicant and broker",
        "detail": "Email to Marc Tremblay: application received, traditional UW path, MIB item requires follow-up. Northstar Advisory briefed on MIB flag, timeline, and outstanding requirements."
      }
    ],
    "humanActions": [
      {
        "ts": "May 13, 2026",
        "actor": "Victor Ramon",
        "actorType": "Human",
        "icon": "ti-user",
        "dotCls": "rp-tl-dot-human",
        "action": "MIB hit reviewed — traditional UW confirmed",
        "detail": "Prior decline 2022 reviewed. Applicant disclosed — match confirmed. Traditional full UW appropriate. Broker notified of path change from accelerated."
      },
      {
        "ts": "May 14, 2026",
        "actor": "Victor Ramon",
        "actorType": "Human",
        "icon": "ti-user",
        "dotCls": "rp-tl-dot-human",
        "action": "APS ordered from Dr. Kowalski",
        "detail": "APS request sent to Dr. Kowalski (Kowalski Family Medicine) covering T2D management history, HbA1c trend, complications, and overall health status. Due May 16."
      },
      {
        "ts": "May 14, 2026",
        "actor": "Victor Ramon",
        "actorType": "Human",
        "icon": "ti-user",
        "dotCls": "rp-tl-dot-human",
        "action": "Paramedical exam scheduled — Quest Diagnostics May 19",
        "detail": "Quest Diagnostics booked for Marc Tremblay on May 19, 2026. Blood draw, vitals, glucose, HbA1c, CBC. Applicant and broker notified."
      },
      {
        "ts": "May 14, 2026",
        "actor": "Richard Daniels",
        "actorType": "Human",
        "icon": "ti-user",
        "dotCls": "rp-tl-dot-human",
        "action": "Prior decline explanation letter requested from applicant",
        "detail": "Written explanation request sent to Marc Tremblay via portal and email. Must specify carrier, coverage amount, reason for decline. Due May 18. Blocking for UW review."
      },
      {
        "ts": "May 15, 2026",
        "actor": "System",
        "actorType": "System",
        "icon": "ti-alert-triangle",
        "dotCls": "rp-tl-dot-warn",
        "action": "APS due date passed — auto-chase triggered",
        "detail": "APS from Dr. Kowalski due May 16 — no response received. Automatic chase task NB-4030 created. Victor Ramon notified. Prior decline explanation also outstanding."
      }
    ],
    "linkedCase": {
      "id": "NB66-7622343",
      "label": "New business · Full underwriting",
      "status": "Active",
      "stage": "Req. gathering",
      "statusCls": "pf"
    },
    "linkedTasks": [
      "task_nb4011",
      "task_nb4020",
      "task_nb4021",
      "task_nb4030",
      "task_nb4032",
      "task_nb4040",
      "task_nb4041"
    ],
    "linkedReqs": [
      "req_mt_001",
      "req_mt_002",
      "req_mt_003",
      "req_mt_004",
      "req_mt_005",
      "req_mt_006",
      "req_mt_007"
    ],
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "New business · Full underwriting"
      },
      {
        "kind": "task",
        "id": "task_nb4011",
        "label": "NB-4011"
      },
      {
        "kind": "task",
        "id": "task_nb4020",
        "label": "NB-4020"
      },
      {
        "kind": "task",
        "id": "task_nb4021",
        "label": "NB-4021"
      },
      {
        "kind": "task",
        "id": "task_nb4030",
        "label": "NB-4030"
      },
      {
        "kind": "task",
        "id": "task_nb4032",
        "label": "NB-4032"
      },
      {
        "kind": "task",
        "id": "task_nb4040",
        "label": "NB-4040"
      },
      {
        "kind": "task",
        "id": "task_nb4041",
        "label": "NB-4041"
      },
      {
        "kind": "requirement",
        "id": "req_mt_001",
        "label": "req_mt_001"
      },
      {
        "kind": "requirement",
        "id": "req_mt_002",
        "label": "req_mt_002"
      },
      {
        "kind": "requirement",
        "id": "req_mt_003",
        "label": "req_mt_003"
      },
      {
        "kind": "requirement",
        "id": "req_mt_004",
        "label": "req_mt_004"
      },
      {
        "kind": "requirement",
        "id": "req_mt_005",
        "label": "req_mt_005"
      },
      {
        "kind": "requirement",
        "id": "req_mt_006",
        "label": "req_mt_006"
      },
      {
        "kind": "requirement",
        "id": "req_mt_007",
        "label": "req_mt_007"
      }
    ]
  },
  {
    "id": "REQ-2026-004",
    "kind": "request",
    "label": "SBLI Simple Term Life application — Elena Rossi, $350,000 / 20-year",
    "status": "In progress",
    "source": "SBLI.com",
    "caseId": "NB98-9989870",
    "caseKey": "er",
    "subtype": "Life insurance application",
    "name": "SBLI Simple Term Life application — Elena Rossi, $350,000 / 20-year",
    "category": "New business",
    "priority": "High",
    "requester": "Elena Rossi",
    "requesterRole": "Direct applicant — SBLI.com",
    "requesterInitials": "ER",
    "channel": "SBLI.com",
    "received": "May 13, 2026",
    "receivedFull": "2026-05-13",
    "receivedTime": "11:08",
    "statusCls": "pq",
    "assignee": "Richard Daniels",
    "assignedTo": "Richard Daniels",
    "sourceChannel": "SBLI.com",
    "sourceDetail": "SBLI.com",
    "due": "May 13, 2026",
    "aiSummary": "Elena Rossi (DOB Jan 22, 1991) applied online at SBLI.com for SBLI Simple Term Life — $350,000 / 20-year. No adverse health disclosures. Non-smoker, BMI 23.1. All four accelerated UW criteria passed — AI confirmed no-exam path. Case NB98-9989870 created under simplified underwriting. Tele-interview scheduled May 17 at 10:00 AM. Same-day coverage eligible upon clean interview completion. AI confidence: 95%.",
    "summary": "Elena Rossi (DOB Jan 22, 1991) applied online at SBLI.com for SBLI Simple Term Life — $350,000 / 20-year. No adverse health disclosures. Non-smoker, BMI 23.1. All four accelerated UW criteria passed — AI confirmed no-exam path. Case NB98-9989870 created under simplified underwriting. Tele-interview scheduled May 17 at 10:00 AM. Same-day coverage eligible upon clean interview completion. AI confidence: 95%.",
    "nextAction": "Open case NB98-9989870",
    "form": {
      "submitted": "2026-05-13 at 11:08",
      "channel": "SBLI.com (direct online)",
      "formType": "SBLI Simple Term Life Online Application v1.9",
      "formVersion": "1.9",
      "fields": [
        {
          "label": "Applicant",
          "value": "Elena Rossi (DOB Jan 22, 1991)"
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
          "label": "Monthly premium (indicative)",
          "value": "$22/month (standard non-smoker rates)"
        },
        {
          "label": "Smoker status",
          "value": "Non-smoker (self-declared)"
        },
        {
          "label": "BMI (self-declared)",
          "value": "23.1 — Normal range"
        },
        {
          "label": "Health disclosures",
          "value": "No adverse health conditions disclosed. No medications. No prior insurance declines."
        },
        {
          "label": "Beneficiary",
          "value": "Marco Rossi (spouse) — 100%"
        },
        {
          "label": "Riders",
          "value": "Accelerated death benefit (included free), LegacyShield digital vault (included free)"
        },
        {
          "label": "Electronic signature",
          "value": "Captured — May 13, 2026 at 11:08"
        }
      ]
    },
    "aiActions": [
      {
        "ts": "2026-05-13 11:09",
        "actor": "AI Agent",
        "actorType": "AI Agent",
        "icon": "ti-sparkles",
        "dotCls": "rp-tl-dot-ai",
        "action": "Online application received and auto-validated",
        "detail": "All mandatory fields complete. Electronic signature captured. No adverse disclosures. Application automatically screened for SBLI Simple Term eligibility."
      },
      {
        "ts": "2026-05-13 11:10",
        "actor": "AI Agent",
        "actorType": "AI Agent",
        "icon": "ti-sparkles",
        "dotCls": "rp-tl-dot-ai",
        "action": "MIB check completed — no alerts",
        "detail": "MIB returned clean for Elena Rossi. No prior declines, no adverse records. Fourth eligibility criterion confirmed."
      },
      {
        "ts": "2026-05-13 11:10",
        "actor": "AI Agent",
        "actorType": "AI Agent",
        "icon": "ti-sparkles",
        "dotCls": "rp-tl-dot-ai",
        "action": "All 4 accelerated UW criteria passed",
        "detail": "Age 35 ✓ (within 18–50 limit) | Coverage $350k ✓ (within $1M limit) | No adverse disclosures ✓ | No MIB alerts ✓. Accelerated no-exam path confirmed. Same-day coverage eligible pending tele-interview."
      },
      {
        "ts": "2026-05-13 11:11",
        "actor": "System",
        "actorType": "System",
        "icon": "ti-bolt",
        "dotCls": "rp-tl-dot-system",
        "action": "Case NB98-9989870 created — accelerated UW path",
        "detail": "Simplified underwriting case created. Assigned to Richard Daniels. 4 requirements generated. 9 tasks created across application received, tele-interview, questionnaire review, and decision stages."
      },
      {
        "ts": "2026-05-13 11:12",
        "actor": "System",
        "actorType": "System",
        "icon": "ti-mail",
        "dotCls": "rp-tl-dot-system",
        "action": "Acknowledgment sent to Elena Rossi",
        "detail": "Email sent confirming no-exam path, tele-interview to be scheduled within 24 hours, same-day coverage eligibility. LegacyShield digital vault activation initiated."
      },
      {
        "ts": "2026-05-14 09:00",
        "actor": "System",
        "actorType": "System",
        "icon": "ti-calendar",
        "dotCls": "rp-tl-dot-system",
        "action": "Tele-interview scheduled — May 17 at 10:00 AM",
        "detail": "Appointment confirmed with Richard Daniels. SMS and email reminders sent to Elena Rossi. Interview covers cardiovascular, respiratory, musculoskeletal, and mental health sections. AI questionnaire scoring will run automatically post-submission."
      }
    ],
    "humanActions": [
      {
        "ts": "May 14, 2026",
        "actor": "Richard Daniels",
        "actorType": "Human",
        "icon": "ti-user",
        "dotCls": "rp-tl-dot-human",
        "action": "Interview preparation email sent",
        "detail": "Email sent to Elena Rossi explaining the four questionnaire sections, approximate duration (10–15 min), and information to have available. Reschedule instructions included."
      },
      {
        "ts": "May 14, 2026",
        "actor": "System",
        "actorType": "System",
        "icon": "ti-message",
        "dotCls": "rp-tl-dot-system",
        "action": "SMS confirmation sent to applicant",
        "detail": "SBLI SMS sent: interview May 17 at 10:00 AM, call from SBLI number, reply RESCHEDULE if needed. Delivery confirmed."
      }
    ],
    "linkedCase": {
      "id": "NB98-9989870",
      "label": "New business · Simplified underwriting",
      "status": "Active",
      "stage": "Tele-interview",
      "statusCls": "pf"
    },
    "linkedTasks": [
      "task_nb2011",
      "task_nb2021",
      "task_nb2030",
      "task_nb2031",
      "task_nb2040"
    ],
    "linkedReqs": [
      "req_er_001",
      "req_er_002",
      "req_er_003",
      "req_er_004"
    ],
    "linkedObjects": [
      {
        "kind": "case",
        "id": "NB98-9989870",
        "label": "New business · Simplified underwriting"
      },
      {
        "kind": "task",
        "id": "task_nb2011",
        "label": "NB-2011"
      },
      {
        "kind": "task",
        "id": "task_nb2021",
        "label": "NB-2021"
      },
      {
        "kind": "task",
        "id": "task_nb2030",
        "label": "NB-2030"
      },
      {
        "kind": "task",
        "id": "task_nb2031",
        "label": "NB-2031"
      },
      {
        "kind": "task",
        "id": "task_nb2040",
        "label": "NB-2040"
      },
      {
        "kind": "requirement",
        "id": "req_er_001",
        "label": "req_er_001"
      },
      {
        "kind": "requirement",
        "id": "req_er_002",
        "label": "req_er_002"
      },
      {
        "kind": "requirement",
        "id": "req_er_003",
        "label": "req_er_003"
      },
      {
        "kind": "requirement",
        "id": "req_er_004",
        "label": "req_er_004"
      }
    ]
  }
];
