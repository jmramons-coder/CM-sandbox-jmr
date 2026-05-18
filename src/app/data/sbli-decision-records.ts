import type { CaseDecisionFlow } from '../domain/objectRefs';

export const SBLI_DECISION_FLOW_RECORDS: Record<string, CaseDecisionFlow & { caseKey: string }> = {
  "CD26-5546112": {
    "caseId": "CD26-5546112",
    "caseType": "CD",
    "caseSubtype": "wop_disability",
    "title": "Decision — CD26-5546112",
    "subtitle": "Claim · Waiver of premium · Billy Bud",
    "steps": [
      "Review",
      "Decision",
      "Attestation",
      "Confirm"
    ],
    "keyFacts": [
      {
        "label": "Claimant",
        "value": "Billy Bud"
      },
      {
        "label": "Policy",
        "value": "SBLI-TL-2021-004821"
      },
      {
        "label": "Monthly premium",
        "value": "$38/month"
      },
      {
        "label": "Waiting period",
        "value": "Satisfied Apr 30, 2026"
      },
      {
        "label": "Total disability",
        "value": "Confirmed"
      },
      {
        "label": "AI confidence",
        "value": "91%"
      }
    ],
    "aiRecommendation": {
      "text": "Total disability confirmed. Own-occupation and unable-to-work-for-profit definitions satisfied. Pre-existing T2D not contributing. WOP rider conditions met. Recommend approval.",
      "confidence": 91,
      "recommendedOptionId": "approve"
    },
    "warnings": [
      {
        "text": "FCE report outstanding (overdue 35 days). Disability determination rests primarily on APS and surgical report."
      },
      {
        "text": "Pre-disability earnings verification outstanding. Monthly premium waiver calculated at $38/month based on policy records."
      }
    ],
    "options": [
      {
        "id": "approve",
        "title": "Approve WOP — waive premiums",
        "description": "Approve the Waiver of Premium claim. Monthly premium of $38 waived retroactively from Jan 30, 2026. Trigger premium adjustment event to policy admin system.",
        "tag": "Recommended by AI",
        "tagCls": "pf",
        "submitLabel": "Approve WOP",
        "submitStyle": "success"
      },
      {
        "id": "defer",
        "title": "Defer decision — pending FCE",
        "description": "Defer the decision until the Functional Capacity Evaluation report is received. SLA will be further breached. Send notification to claimant.",
        "tag": "SLA risk",
        "tagCls": "pp",
        "submitLabel": "Defer decision",
        "submitStyle": "warning"
      },
      {
        "id": "decline",
        "title": "Decline WOP claim",
        "description": "Decline the Waiver of Premium claim. Provide reason code and generate decline letter. Claimant retains appeal rights.",
        "tag": "Irreversible",
        "tagCls": "po",
        "submitLabel": "Decline claim",
        "submitStyle": "danger"
      }
    ],
    "confirmChecks": [
      "I have reviewed all available medical evidence",
      "I confirm the total disability standard is met under the policy definition",
      "I understand this decision will trigger a premium waiver event in the policy admin system",
      "I confirm this decision is within my authority level"
    ],
    "outcomes": {
      "approve": {
        "optionId": "approve",
        "icon": "ti-circle-check",
        "iconBg": "var(--green-bg)",
        "iconColor": "var(--green-t)",
        "title": "WOP approved",
        "subtitle": "Premium waiver triggered retroactively from Jan 30, 2026. Policy admin system event queued. Claimant notification will be sent within 24 hours.",
        "nextSteps": [
          "Premium waiver event sent to policy admin system",
          "Monthly premium of $38 suspended from Jan 30, 2026",
          "Claimant decision letter generated",
          "Case status updated to Active — Approved"
        ]
      },
      "defer": {
        "optionId": "defer",
        "icon": "ti-clock",
        "iconBg": "var(--amber-bg)",
        "iconColor": "var(--amber-t)",
        "title": "Decision deferred",
        "subtitle": "Case held pending FCE receipt. SLA further breached. Claimant and broker notified of delay.",
        "nextSteps": [
          "Chase task created for FCE (urgent)",
          "Claimant notification sent",
          "SLA escalation flag raised",
          "Case returns to medical review stage"
        ]
      },
      "decline": {
        "optionId": "decline",
        "icon": "ti-circle-x",
        "iconBg": "var(--red-bg)",
        "iconColor": "var(--red-t)",
        "title": "Claim declined",
        "subtitle": "WOP claim declined. Decline letter generated. Claimant has 90 days to appeal.",
        "nextSteps": [
          "Decline letter generated with reason code",
          "Claimant notification sent",
          "Appeal window opened (90 days)",
          "Case status updated to Declined"
        ]
      }
    },
    "caseKey": "bb"
  },
  "CD44-6679812": {
    "caseId": "CD44-6679812",
    "caseType": "CD",
    "caseSubtype": "death_benefit",
    "title": "Decision — CD44-6679812",
    "subtitle": "Claim · Death benefit · Marie Dupont (beneficiary)",
    "steps": [
      "Review",
      "Decision",
      "Attestation",
      "Confirm"
    ],
    "keyFacts": [
      {
        "label": "Insured (deceased)",
        "value": "Thomas Dupont"
      },
      {
        "label": "Beneficiary",
        "value": "Marie Dupont"
      },
      {
        "label": "Death benefit",
        "value": "$500,000 ACH"
      },
      {
        "label": "Contestability",
        "value": "Lapsed — 6y 11m"
      },
      {
        "label": "MIB comparison",
        "value": "No discrepancies"
      },
      {
        "label": "AI confidence",
        "value": "96%"
      }
    ],
    "aiRecommendation": {
      "text": "MIB vs. application comparison complete — no material misrepresentation. Cause of death (acute MI) consistent with disclosed cardiac history. Contestability period lapsed. All requirements met. Recommend approval of $500,000 ACH payout.",
      "confidence": 96,
      "recommendedOptionId": "approve"
    },
    "warnings": [
      {
        "text": "Contestability review sign-off required. AI comparison is complete with no discrepancies — human attestation is the only remaining step before payout authorization."
      }
    ],
    "options": [
      {
        "id": "approve",
        "title": "Approve $500,000 ACH payout to Marie Dupont",
        "description": "Authorize the full $500,000 death benefit payout via ACH to the verified bank account of Marie Dupont. Trigger disbursement event to policy admin system.",
        "tag": "Recommended by AI",
        "tagCls": "pf",
        "submitLabel": "Approve payout",
        "submitStyle": "success"
      },
      {
        "id": "review",
        "title": "Request further review",
        "description": "Flag the claim for senior review before payout. Used when assessor has concerns not captured in AI comparison. Specify reason in notes.",
        "tag": "Escalation",
        "tagCls": "pr",
        "submitLabel": "Escalate for review",
        "submitStyle": "info"
      },
      {
        "id": "decline",
        "title": "Decline death benefit claim",
        "description": "Decline the claim. Generate decline letter with reason code. Beneficiary retains appeal rights.",
        "tag": "Irreversible",
        "tagCls": "po",
        "submitLabel": "Decline claim",
        "submitStyle": "danger"
      }
    ],
    "confirmChecks": [
      "I have reviewed the AI MIB vs. application comparison and confirm no discrepancies",
      "I confirm the cause of death is consistent with the insured's disclosed health history",
      "I confirm the contestability period has fully lapsed (6 years 11 months)",
      "I confirm beneficiary identity and ACH routing have been verified",
      "I confirm this decision is within my authority level"
    ],
    "outcomes": {
      "approve": {
        "optionId": "approve",
        "icon": "ti-circle-check",
        "iconBg": "var(--green-bg)",
        "iconColor": "var(--green-t)",
        "title": "Death benefit approved",
        "subtitle": "$500,000 ACH disbursement authorized. Policy admin event queued. Marie Dupont will receive payment within 3–5 business days.",
        "nextSteps": [
          "ACH disbursement event sent to policy admin ($500,000)",
          "Decision letter and payout confirmation generated for Marie Dupont",
          "Case status updated to Closed — Paid",
          "Policy SBLI-TL-2019-009102 marked Terminated"
        ]
      },
      "review": {
        "optionId": "review",
        "icon": "ti-alert-triangle",
        "iconBg": "var(--amber-bg)",
        "iconColor": "var(--amber-t)",
        "title": "Escalated for senior review",
        "subtitle": "Case flagged for senior assessor review. Marie Dupont will be notified of additional review period (up to 10 business days).",
        "nextSteps": [
          "Senior review task created and assigned",
          "Claimant notified of review extension",
          "SLA clock paused pending review outcome",
          "Case status updated to Senior Review"
        ]
      },
      "decline": {
        "optionId": "decline",
        "icon": "ti-circle-x",
        "iconBg": "var(--red-bg)",
        "iconColor": "var(--red-t)",
        "title": "Claim declined",
        "subtitle": "Death benefit claim declined. Decline letter generated with reason code. Beneficiary has 90 days to appeal.",
        "nextSteps": [
          "Decline letter generated with reason code",
          "Marie Dupont notified",
          "Appeal window opened (90 days)",
          "Case status updated to Declined"
        ]
      }
    },
    "caseKey": "sd"
  },
  "NB66-7622343": {
    "caseId": "NB66-7622343",
    "caseType": "NB",
    "caseSubtype": "full_underwriting",
    "title": "Decision — NB66-7622343",
    "subtitle": "New business · Full underwriting · Marc Tremblay",
    "steps": [
      "Review",
      "Offer type",
      "Terms",
      "Confirm"
    ],
    "_note_steps": "MT uses custom step labels because NB full UW decisions are offer-type selections, not binary approve/decline. Step 2 is 'Offer type' not 'Decision', step 3 is 'Terms' not 'Attestation'.",
    "keyFacts": [
      {
        "label": "Applicant",
        "value": "Marc Tremblay"
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
        "label": "Preliminary rating",
        "value": "+75 debits"
      },
      {
        "label": "UW path",
        "value": "Traditional"
      },
      {
        "label": "APS / Paramedical",
        "value": "Outstanding"
      }
    ],
    "aiRecommendation": {
      "text": "Preliminary scoring shows +75 debits based on T2D, BMI, and unresolved MIB prior decline. APS and paramedical results outstanding — final decision cannot be made at this stage. If proceeding early, a rated offer at Table 2 (+75 debits) is the likely outcome.",
      "confidence": 72,
      "recommendedOptionId": "postpone",
      "_note": "Confidence is lower (72%) because key evidence (APS, paramedical) is still outstanding. AI recommends postponing rather than issuing an offer prematurely."
    },
    "warnings": [
      {
        "text": "APS from Dr. Kowalski is overdue. Final scoring cannot be completed without it."
      },
      {
        "text": "Prior decline explanation letter from applicant outstanding. UW review cannot proceed."
      },
      {
        "text": "Paramedical exam scheduled May 19. Results required before final offer generation."
      }
    ],
    "options": [
      {
        "id": "rated",
        "title": "Issue rated offer",
        "description": "Issue a conditional rated offer at the preliminary scoring level (+75 debits, approx. Table 2). Subject to revision pending APS and paramedical results. Broker must confirm applicant acceptance.",
        "tag": "Conditional",
        "tagCls": "pp",
        "submitLabel": "Issue rated offer",
        "submitStyle": "warning"
      },
      {
        "id": "postpone",
        "title": "Postpone — await outstanding requirements",
        "description": "Postpone the decision until APS, paramedical results, and prior decline explanation are all received. Recommended path.",
        "tag": "Recommended",
        "tagCls": "pf",
        "submitLabel": "Postpone decision",
        "submitStyle": "success"
      },
      {
        "id": "standard",
        "title": "Issue at standard rates",
        "description": "Issue at standard rates. Only available if all requirements are received and final scoring is complete.",
        "tag": "Requires all reqs",
        "tagCls": "pr",
        "submitLabel": "Issue standard offer",
        "submitStyle": "info"
      },
      {
        "id": "decline",
        "title": "Decline application",
        "description": "Decline the application based on available information. Generate decline letter with reason code.",
        "tag": "Irreversible",
        "tagCls": "po",
        "submitLabel": "Decline application",
        "submitStyle": "danger"
      }
    ],
    "confirmChecks": [
      "I have reviewed all available underwriting evidence",
      "I understand this offer is conditional on outstanding requirements (APS, paramedical)",
      "I confirm this decision is within my underwriting authority",
      "I confirm the broker will be notified of the conditional offer terms"
    ],
    "outcomes": {
      "rated": {
        "optionId": "rated",
        "icon": "ti-file-certificate",
        "iconBg": "var(--amber-bg)",
        "iconColor": "var(--amber-t)",
        "title": "Rated offer issued",
        "subtitle": "Conditional rated offer sent to Northstar Advisory. $625,000 / 20-year at Table 2 (+75 debits, est. $118/month). Subject to final APS and paramedical results.",
        "nextSteps": [
          "Conditional offer sent to Northstar Advisory",
          "Broker notified — 30-day acceptance window",
          "APS and paramedical chase tasks remain active",
          "Final offer to be confirmed upon receipt of all requirements"
        ]
      },
      "postpone": {
        "optionId": "postpone",
        "icon": "ti-clock",
        "iconBg": "var(--blue-bg)",
        "iconColor": "var(--blue-t)",
        "title": "Decision postponed",
        "subtitle": "Case held pending APS, paramedical, and prior decline explanation. No offer issued. Broker notified.",
        "nextSteps": [
          "Broker notification sent — requirements outstanding",
          "Chase tasks remain active (APS, explanation letter)",
          "Paramedical exam May 19 confirmed",
          "Case returns to requirement gathering stage"
        ]
      },
      "standard": {
        "optionId": "standard",
        "icon": "ti-circle-check",
        "iconBg": "var(--green-bg)",
        "iconColor": "var(--green-t)",
        "title": "Standard offer issued",
        "subtitle": "Application approved at standard rates. Policy offer sent to Northstar Advisory.",
        "nextSteps": [
          "Standard offer sent to Northstar Advisory",
          "Policy issuance event queued",
          "Broker notified — 30-day acceptance window",
          "Case status updated to Offer Issued"
        ]
      },
      "decline": {
        "optionId": "decline",
        "icon": "ti-circle-x",
        "iconBg": "var(--red-bg)",
        "iconColor": "var(--red-t)",
        "title": "Application declined",
        "subtitle": "Application declined. Decline letter generated with reason code. Applicant has 90 days to appeal.",
        "nextSteps": [
          "Decline letter generated",
          "Marc Tremblay and broker notified",
          "Appeal window opened (90 days)",
          "Case status updated to Declined"
        ]
      }
    },
    "caseKey": "mt"
  },
  "NB98-9989870": {
    "caseId": "NB98-9989870",
    "caseType": "NB",
    "caseSubtype": "simplified_underwriting",
    "title": "Decision — NB98-9989870",
    "subtitle": "New business · Simplified underwriting · Elena Rossi",
    "steps": [
      "Review",
      "Decision",
      "Attestation",
      "Confirm"
    ],
    "keyFacts": [
      {
        "label": "Applicant",
        "value": "Elena Rossi"
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
        "label": "UW path",
        "value": "Accelerated — no exam"
      },
      {
        "label": "MIB result",
        "value": "No alerts"
      },
      {
        "label": "Tele-interview",
        "value": "Scheduled May 17"
      }
    ],
    "aiRecommendation": {
      "text": "Clean application profile. No MIB alerts. All four accelerated UW criteria passed. Tele-interview pending May 17 — AI questionnaire scoring will run automatically post-interview. Anticipated clean pass — standard rates likely.",
      "confidence": 95,
      "recommendedOptionId": "standard",
      "_note": "High confidence (95%) because all eligibility criteria are met. The only pending step is the tele-interview, which is expected to pass based on the clean application profile."
    },
    "warnings": [
      {
        "text": "Tele-interview not yet completed (scheduled May 17). AI questionnaire scoring cannot run until interview is submitted."
      },
      {
        "text": "Identity verification pending — will auto-trigger post-interview. Required before policy issuance."
      }
    ],
    "options": [
      {
        "id": "standard",
        "title": "Issue at standard rates",
        "description": "Issue SBLI Simple Term Life at standard non-smoker rates pending clean tele-interview completion. Same-day coverage eligible.",
        "tag": "Recommended post-interview",
        "tagCls": "pf",
        "submitLabel": "Issue at standard rates",
        "submitStyle": "success"
      },
      {
        "id": "refer",
        "title": "Refer to full underwriting",
        "description": "Transfer case to traditional full underwriting path if tele-interview reveals adverse health information requiring deeper assessment.",
        "tag": "Escalation path",
        "tagCls": "pr",
        "submitLabel": "Refer to full UW",
        "submitStyle": "info"
      },
      {
        "id": "decline",
        "title": "Decline application",
        "description": "Decline the application. Generate decline letter with reason code.",
        "tag": "Irreversible",
        "tagCls": "po",
        "submitLabel": "Decline application",
        "submitStyle": "danger"
      }
    ],
    "confirmChecks": [
      "I confirm the tele-interview has been completed and all sections passed",
      "I confirm the AI questionnaire scoring returned no adverse flags",
      "I confirm identity verification is complete",
      "I confirm this decision is within my authority level"
    ],
    "outcomes": {
      "standard": {
        "optionId": "standard",
        "icon": "ti-circle-check",
        "iconBg": "var(--green-bg)",
        "iconColor": "var(--green-t)",
        "title": "Policy issued at standard rates",
        "subtitle": "SBLI Simple Term Life — $350,000 / 20-year issued at standard non-smoker rates. LegacyShield vault activated. Policy documents sent to Elena Rossi.",
        "nextSteps": [
          "Policy issuance event sent to policy admin",
          "Policy documents generated and sent to Elena Rossi",
          "LegacyShield vault activated",
          "Case status updated to Closed — Issued"
        ]
      },
      "refer": {
        "optionId": "refer",
        "icon": "ti-arrow-right",
        "iconBg": "var(--blue-bg)",
        "iconColor": "var(--blue-t)",
        "title": "Referred to full underwriting",
        "subtitle": "Case transferred to traditional full UW path. Elena Rossi and broker notified. APS and paramedical exam will be required.",
        "nextSteps": [
          "Full UW tasks created (APS, paramedical, MIB review)",
          "Elena Rossi notified of additional requirements",
          "Case type updated to Full Underwriting",
          "SLA clock reset for traditional UW path"
        ]
      },
      "decline": {
        "optionId": "decline",
        "icon": "ti-circle-x",
        "iconBg": "var(--red-bg)",
        "iconColor": "var(--red-t)",
        "title": "Application declined",
        "subtitle": "Application declined. Decline letter generated. Applicant has 90 days to appeal.",
        "nextSteps": [
          "Decline letter generated with reason code",
          "Elena Rossi notified",
          "Appeal window opened (90 days)",
          "Case status updated to Declined"
        ]
      }
    },
    "caseKey": "er"
  }
};
