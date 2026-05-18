import type { UnderwritingScoring } from '../domain/objectRefs';

export const SBLI_SCORING_RECORDS: Record<string, UnderwritingScoring> = {
  "NB66-7622343": {
    "caseKey": "mt",
    "caseId": "NB66-7622343",
    "aiNet": 25,
    "aiClass": "rated",
    "humanNet": null,
    "humanClass": null,
    "pending": [
      "Blood profile",
      "Paramedical exam",
      "APS from Dr. Kowalski"
    ],
    "debits": [
      {
        "id": "d1",
        "category": "Medical",
        "condition": "Type 2 Diabetes (diet-controlled)",
        "points": 50,
        "icd": "E11.9",
        "confidence": "high",
        "notes": "Diet-controlled T2D since 2019. Metformin 500mg. HbA1c 48 mmol/mol at last check. APS will confirm current management and complication status.",
        "pending": false,
        "aiGenerated": true,
        "label": "Type 2 Diabetes (diet-controlled)",
        "direction": "debit"
      },
      {
        "id": "d2",
        "category": "Build",
        "condition": "BMI 27.4",
        "points": 25,
        "icd": "",
        "confidence": "high",
        "notes": "Self-declared 5'10\" / 192 lb. Paramedical exam will confirm. Overweight range — standard +25 debit applies.",
        "pending": false,
        "aiGenerated": true,
        "label": "BMI 27.4",
        "direction": "debit"
      },
      {
        "id": "d3",
        "category": "Investigative",
        "condition": "MIB prior decline — unresolved",
        "points": 50,
        "icd": "",
        "confidence": "medium",
        "notes": "2022 decline from unknown carrier. Applicant disclosed on application. Written explanation letter requested — due May 18. Debit held at +50 pending resolution. May reduce or be removed once explanation received.",
        "pending": true,
        "aiGenerated": true,
        "label": "MIB prior decline — unresolved",
        "direction": "debit"
      },
      {
        "id": "d4",
        "category": "Family history",
        "condition": "Father MI age 58",
        "points": 15,
        "icd": "",
        "confidence": "low",
        "notes": "Disclosed by applicant. Father experienced MI at age 58. Estimated +15 debit — APS will clarify applicant's own cardiac risk. Pending confirmation.",
        "pending": true,
        "aiGenerated": true,
        "label": "Father MI age 58",
        "direction": "debit"
      }
    ],
    "credits": [
      {
        "id": "c1",
        "category": "Lifestyle",
        "factor": "Non-smoker (verified Rx)",
        "points": -30,
        "icd": "",
        "confidence": "high",
        "notes": "Rx database confirms no nicotine replacement therapy prescriptions. Non-smoker status verified. Standard -30 lifestyle credit applied.",
        "pending": false,
        "aiGenerated": true,
        "label": "Non-smoker (verified Rx)",
        "direction": "credit"
      },
      {
        "id": "c2",
        "category": "Medical",
        "factor": "HbA1c 48 — well controlled",
        "points": -20,
        "icd": "",
        "confidence": "high",
        "notes": "HbA1c 48 mmol/mol falls within the well-controlled T2D threshold. Qualifies for -20 credit per SBLI medical underwriting guidelines for T2D applicants with HbA1c ≤ 53.",
        "pending": false,
        "aiGenerated": true,
        "label": "HbA1c 48 — well controlled",
        "direction": "credit"
      }
    ],
    "offerControls": {
      "tableRating": "",
      "riskClass": "rated",
      "uwNotes": ""
    },
    "baseScore": 0,
    "debitTotal": 140,
    "creditTotal": 50,
    "netScore": 90,
    "mappedDecision": "rated",
    "riskClass": "rated",
    "tableRating": "",
    "underwriterNotes": "",
    "flatExtras": [],
    "exclusions": [],
    "evidence": [
      {
        "id": "pending-1",
        "label": "Blood profile",
        "status": "amber",
        "issueCount": 1
      },
      {
        "id": "pending-2",
        "label": "Paramedical exam",
        "status": "amber",
        "issueCount": 1
      },
      {
        "id": "pending-3",
        "label": "APS from Dr. Kowalski",
        "status": "amber",
        "issueCount": 1
      }
    ],
    "aiComparison": {
      "netScore": 25,
      "riskClass": "rated"
    }
  },
  "NB98-9989870": {
    "caseKey": "er",
    "caseId": "NB98-9989870",
    "aiNet": -50,
    "aiClass": "standard",
    "humanNet": null,
    "humanClass": null,
    "pending": [
      "Tele-interview questionnaire",
      "Identity verification"
    ],
    "debits": [],
    "credits": [
      {
        "id": "c1",
        "category": "Lifestyle",
        "factor": "Non-smoker (self-declared)",
        "points": -30,
        "icd": "",
        "confidence": "medium",
        "notes": "Self-declared non-smoker on application. Tele-interview will confirm. Credit applied provisionally — will be removed if tele-interview reveals otherwise.",
        "pending": true,
        "aiGenerated": true,
        "label": "Non-smoker (self-declared)",
        "direction": "credit"
      },
      {
        "id": "c2",
        "category": "Build",
        "factor": "BMI 23.1 — normal range",
        "points": -20,
        "icd": "",
        "confidence": "medium",
        "notes": "Self-declared BMI 23.1. Normal range qualifies for build credit under SBLI simplified UW guidelines. Tele-interview and identity verification will confirm declared height and weight.",
        "pending": true,
        "aiGenerated": true,
        "label": "BMI 23.1 — normal range",
        "direction": "credit"
      }
    ],
    "offerControls": {
      "tableRating": "",
      "riskClass": "standard",
      "uwNotes": ""
    },
    "baseScore": 0,
    "debitTotal": 0,
    "creditTotal": 50,
    "netScore": -50,
    "mappedDecision": "standard",
    "riskClass": "standard",
    "tableRating": "",
    "underwriterNotes": "",
    "flatExtras": [],
    "exclusions": [],
    "evidence": [
      {
        "id": "pending-1",
        "label": "Tele-interview questionnaire",
        "status": "amber",
        "issueCount": 1
      },
      {
        "id": "pending-2",
        "label": "Identity verification",
        "status": "amber",
        "issueCount": 1
      }
    ],
    "aiComparison": {
      "netScore": -50,
      "riskClass": "standard"
    }
  }
};
