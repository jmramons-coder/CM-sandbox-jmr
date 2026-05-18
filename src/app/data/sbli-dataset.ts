import type { DatasetDocumentRecord, DatasetTaskRecord, DocumentEvidenceRecord, SystemDataset } from './multi-case-dataset';
import type { CaseRecord, CaseStructuredField, CaseTabConfiguration, CaseWorkflowStepState } from '../domain/objectRefs';
import { SBLI_DOCUMENT_EVIDENCE_RECORDS, SBLI_DOCUMENT_RECORDS, SBLI_TASK_RECORDS } from './sbli-task-records';
import { SBLI_CASE_WORKFLOW_GI_RECORDS } from './sbli-case-workflow-gi-records';
import { SBLI_DECISION_FLOW_RECORDS } from './sbli-decision-records';
import { SBLI_REQUEST_RECORDS } from './sbli-request-records';
import { SBLI_SCORING_RECORDS } from './sbli-scoring-records';
import {
  SBLI_REQUIREMENT_DOCUMENT_LINKS,
  SBLI_REQUIREMENT_DOCUMENT_RECORDS,
  SBLI_REQUIREMENT_RECORDS,
  SBLI_REQUIREMENT_TASK_RECORDS,
} from './sbli-requirement-records';
import {
  SBLI_AGENT_RECORDS,
  SBLI_APPLICATION_RECORDS,
  SBLI_CASE_ENTITY_LINKS,
  SBLI_CLIENT_RECORDS,
  SBLI_POLICY_RECORDS,
} from './sbli-entity-records';
import {
  SBLI_SIMPLE_DOCUMENT_EVIDENCE,
  SBLI_SIMPLE_DOCUMENT_RECORDS,
  SBLI_SIMPLE_REQUEST_RECORDS,
  SBLI_SIMPLE_TASK_RECORDS,
} from './sbli-simple-service-records';
import { getSbliDocumentPreviewUrl } from '../utils/sbli-document-assets';

const requirementDocumentLinksById = new Map(SBLI_REQUIREMENT_DOCUMENT_LINKS.map((link) => [link.id, link]));
const legacyRequirementIdMap: Record<string, string> = {
  req_cd26_5546112_fnol_wop_claim_form: 'req_bb_001',
  req_cd26_5546112_policy_rider_verification: 'req_bb_002',
  req_cd26_5546112_employer_inability_to_work_confirmation: 'req_bb_003',
  req_cd26_5546112_attending_physician_statement: 'req_bb_004',
  req_cd26_5546112_surgical_report: 'req_bb_005',
  req_cd26_5546112_requirement_functional_capacity_evaluation: 'req_bb_006',
  req_cd44_6679812_contestability_review_mib_vs_application: 'req_sd_007',
  req_nb66_7622343_attending_physician_statement_aps: 'req_mt_005',
  req_nb66_7622343_mib_hit_prior_decline_2022: 'req_mt_007',
};

const requirementLabelsById = new Map(SBLI_REQUIREMENT_RECORDS.map((requirement) => [requirement.id, requirement.label]));

function withRichRequirementRefs<T extends { linkedObjects: Array<{ kind: string; id: string; label?: string }> }>(row: T): T {
  return {
    ...row,
    linkedObjects: row.linkedObjects.map((ref) => {
      if (ref.kind !== 'requirement') return ref;
      const id = legacyRequirementIdMap[ref.id] ?? ref.id;
      return { ...ref, id, label: requirementLabelsById.get(id) ?? ref.label ?? id };
    }),
  };
}

function withRequirementTaskLinks(task: DatasetTaskRecord): DatasetTaskRecord {
  return withRichRequirementRefs(task);
}

function withRequirementDocumentLinks(document: DatasetDocumentRecord): DatasetDocumentRecord {
  const remapped = withRichRequirementRefs(document);
  const link = requirementDocumentLinksById.get(document.id);
  if (!link) {
    const linkedRequirementId = document.linkedRequirementId ? legacyRequirementIdMap[document.linkedRequirementId] ?? document.linkedRequirementId : undefined;
    return {
      ...remapped,
      linkedRequirementId,
      linkedRequirement: linkedRequirementId ? requirementLabelsById.get(linkedRequirementId) ?? document.linkedRequirement : document.linkedRequirement,
    };
  }
  const requirementRefs = link.requirementIds.map((id, index) => ({
    kind: 'requirement' as const,
    id,
    label: link.requirementLabels[index] ?? id,
  }));
  const linkedObjects = [
    { kind: 'case' as const, id: link.caseId, label: link.caseId },
    ...requirementRefs,
    ...(document.linkedObjects ?? []).filter((ref) => ref.kind !== 'case' && ref.kind !== 'requirement'),
  ];
  return {
    ...remapped,
    linkedCase: link.caseId,
    linkedCaseId: link.caseId,
    linkedRequirement: link.requirementLabels[0] ?? document.linkedRequirement,
    linkedRequirementId: link.requirementIds[0] ?? document.linkedRequirementId,
    linkedObjects,
  };
}

function withRequirementEvidenceLinks(evidence: DocumentEvidenceRecord): DocumentEvidenceRecord {
  return withRichRequirementRefs(evidence);
}

function withSbliDocumentAssets(document: DatasetDocumentRecord): DatasetDocumentRecord {
  const previewUrl = getSbliDocumentPreviewUrl(document.id, document.filename);
  if (!previewUrl) return document;
  return {
    ...document,
    fileUrl: previewUrl,
    fileAvailable: true,
    fileSize: document.fileSize === 'No file' ? 'PNG · Preview' : document.fileSize,
    placeholderReason: undefined,
    uploaded: document.uploaded ?? document.uploadedAt ?? 'May 17, 2026',
    uploadedAt: document.uploadedAt ?? document.uploaded ?? '2026-05-17',
  };
}

function withSbliEvidenceAssets(evidence: DocumentEvidenceRecord): DocumentEvidenceRecord {
  const previewUrl = getSbliDocumentPreviewUrl(evidence.documentId);
  if (!previewUrl) return evidence;
  return {
    ...evidence,
    pages: evidence.pages.map((page) => ({ ...page, image: previewUrl })),
  };
}

function enrichSbliDocument(document: DatasetDocumentRecord): DatasetDocumentRecord {
  return withSbliDocumentAssets(withRequirementDocumentLinks(document));
}

function enrichSbliEvidence(evidence: DocumentEvidenceRecord): DocumentEvidenceRecord {
  return withSbliEvidenceAssets(withRequirementEvidenceLinks(evidence));
}

function tabIdFromLabel(label: string): CaseTabConfiguration {
  const normalized = label.toLowerCase();
  const id =
    normalized === 'general information' ? 'overview'
      : normalized === 'relationships' ? 'related_cases'
        : normalized === 'activities' ? 'history'
          : normalized === 'application' ? 'activation'
            : normalized;
  const utilityEntity =
    id === 'requirements' ? 'requirement' as const
      : id === 'tasks' ? 'task' as const
        : id === 'documents' ? 'document' as const
          : id === 'communications' ? 'communication' as const
            : id === 'history' ? 'event' as const
              : undefined;
  return { id, label, enabled: true, utilityEntity };
}

function stepStatusFromState(state: 'done' | 'active' | 'next'): CaseWorkflowStepState['status'] {
  if (state === 'done') return 'completed';
  if (state === 'active') return 'active';
  return 'pending';
}

function fieldFromContextSlot(slot: { slot: number; label: string; value: string; sub?: string | null; valueColor?: string | null }): CaseStructuredField {
  return {
    id: `workflow-slot-${slot.slot}`,
    label: slot.label,
    value: slot.value,
    type: slot.valueColor ? 'status' : 'text',
    enabled: true,
    muted: false,
  };
}

function withCaseEntityLinks(caseRecord: CaseRecord): CaseRecord {
  const linkedObjects = SBLI_CASE_ENTITY_LINKS[caseRecord.id];
  if (!linkedObjects?.length) return caseRecord;
  return { ...caseRecord, linkedObjects };
}

function withCaseWorkflowGi(caseRecord: CaseRecord): CaseRecord {
  const rich = SBLI_CASE_WORKFLOW_GI_RECORDS[caseRecord.id];
  if (!rich) return caseRecord;
  const activeStage = rich.workflowMeta.subwayStages.find((stage) => stage.state === 'active');
  const decisionFlow = SBLI_DECISION_FLOW_RECORDS[caseRecord.id];
  const underwritingScoring = SBLI_SCORING_RECORDS[caseRecord.id] ?? caseRecord.underwritingScoring;
  return {
    ...caseRecord,
    status: rich.workflowMeta.status,
    statusCode: rich.workflowMeta.statusClass,
    activeStepId: activeStage?.slug ?? caseRecord.activeStepId,
    assignee: {
      kind: 'case',
      id: caseRecord.id,
      label: rich.workflowMeta.assignee,
      role: 'owner',
    },
    identification: {
      ...(caseRecord.identification ?? {
        caseId: caseRecord.id,
        caseTypeId: caseRecord.workflowTemplateId,
        caseTypeLabel: caseRecord.caseTypeLabel ?? caseRecord.title,
        status: caseRecord.status,
        externalIds: [],
      }),
      caseId: rich.workflowMeta.caseId,
      caseTypeLabel: rich.workflowMeta.breadcrumb,
      status: rich.workflowMeta.status,
      statusCode: rich.workflowMeta.statusClass,
    },
    workflowMeta: rich.workflowMeta,
    contextCard: {
      ...(caseRecord.contextCard ?? {
        primaryPartyRef: caseRecord.primaryParty,
        headlineMetrics: [],
      }),
      headlineMetrics: rich.workflowMeta.contextBar.map(fieldFromContextSlot),
      sla: {
        dueAt: caseRecord.slaDue,
        label: rich.workflowMeta.contextBar.find((slot) => slot.label.toLowerCase() === 'sla')?.value ?? caseRecord.contextCard?.sla?.label ?? 'N/A',
        status: rich.workflowMeta.contextBar.some((slot) => slot.valueColor === 'danger') ? 'breached' : rich.workflowMeta.contextBar.some((slot) => slot.valueColor === 'warning') ? 'warning' : 'normal',
      },
    },
    workflowState: {
      templateId: caseRecord.workflowTemplateId,
      phaseId: caseRecord.phaseId,
      activeStepId: activeStage?.slug ?? caseRecord.activeStepId,
      steps: rich.workflowMeta.subwayStages.map((stage) => ({
        id: stage.slug,
        label: stage.name,
        phaseId: caseRecord.phaseId,
        status: stepStatusFromState(stage.state),
      })),
    },
    tabs: rich.workflowMeta.tabs.map(tabIdFromLabel),
    generalInformation: rich.generalInformation,
    underwritingScoring,
    decisionFlow,
    analysis: {
      ...(caseRecord.analysis ?? {}),
      confidence: rich.generalInformation.aiSummary?.confidence ?? caseRecord.analysis?.confidence,
      narrative: rich.generalInformation.aiSummary?.text ?? caseRecord.analysis?.narrative,
    },
  };
}

export const SBLI_DATASET: SystemDataset = {
  "id": "multi-case-demo",
  "schemaVersion": 2,
  "label": "SBLI demo cases",
  "organizationLabel": "SBLI",
  "environmentFit": "Four SBLI life-insurance cases (claims and new business) with tasks, requirements, documents, and evidence.",
  "enabledBusinessLines": [
    "claim",
    "new_business"
  ],
  "generationProfileId": "sbli-case-only-seed",
  "targetRecordCount": 111,
  "documentMode": "metadata_only",
  "displayCurrency": "GBP",
  "description": "Shared demo dataset for Equisoft and SBLI branded environments. Four cases with full task, requirement, document, and evidence coverage.",
  "objectDomains": [
    "case",
    "client",
    "policy",
    "agent",
    "application",
    "task",
    "requirement",
    "document",
    "request"
  ],
  "cases": [
    {
      "id": "CD26-5546112",
      "kind": "case",
      "caseKind": "claim",
      "caseTypeId": "ct_claim_disability",
      "caseTypeLabel": "Claim — Waiver of premium",
      "caseSubType": "waiver_of_premium",
      "sourceCaseNumber": "case_001",
      "caseTypeCode": "IP",
      "workflowTemplateId": "ct_claim_disability",
      "title": "Claim — Waiver of premium",
      "status": "Pending decision",
      "statusCode": "pending_decision",
      "createdAt": "2026-01-30",
      "priority": "Urgent",
      "phaseId": "pre-approval",
      "activeStepId": "decision",
      "slaDue": "2026-05-15",
      "slaStatus": "breached",
      "assignee": {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "Victor Ramon",
        "role": "owner"
      },
      "owner": {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "Victor Ramon",
        "role": "owner"
      },
      "identification": {
        "caseId": "CD26-5546112",
        "caseTypeId": "ct_claim_disability",
        "caseTypeLabel": "Claim — Waiver of premium",
        "status": "Pending decision",
        "statusCode": "pending_decision",
        "externalIds": [
          {
            "system": "SBLI seed",
            "value": "case_001",
            "label": "Seed case id"
          }
        ]
      },
      "contextCard": {
        "primaryPartyRef": {
          "kind": "case",
          "id": "CD26-5546112",
          "label": "Billy Bud",
          "role": "claimant"
        },
        "planRef": {
          "kind": "policy",
          "id": "SBLI-TL-2021-004821",
          "label": "SBLI Term Life 20"
        },
        "policyRef": {
          "kind": "policy",
          "id": "SBLI-TL-2021-004821",
          "label": "SBLI Term Life 20"
        },
        "headlineMetrics": [
          {
            "id": "primary-party",
            "label": "Claimant",
            "value": "Billy Bud",
            "type": "reference",
            "enabled": true,
            "muted": false
          },
          {
            "id": "plan",
            "label": "Policy",
            "value": "SBLI Term Life 20",
            "type": "reference",
            "enabled": true,
            "muted": false
          },
          {
            "id": "monthly-benefit",
            "label": "Death benefit",
            "value": "$500,000",
            "type": "currency",
            "enabled": true,
            "muted": false
          },
          {
            "id": "sla",
            "label": "SLA",
            "value": "Today",
            "type": "status",
            "enabled": true,
            "muted": false
          }
        ],
        "sla": {
          "dueAt": "2026-05-15",
          "label": "Today",
          "status": "breached"
        }
      },
      "workflowState": {
        "templateId": "ct_claim_disability",
        "phaseId": "pre-approval",
        "activeStepId": "decision",
        "steps": [
          {
            "id": "fnol_received",
            "label": "FNOL received",
            "phaseId": "pre-approval",
            "status": "completed"
          },
          {
            "id": "initial_triage",
            "label": "Initial triage",
            "phaseId": "pre-approval",
            "status": "completed"
          },
          {
            "id": "requirement_gathering",
            "label": "Req. gathering",
            "phaseId": "pre-approval",
            "status": "completed"
          },
          {
            "id": "medical_review",
            "label": "Medical review",
            "phaseId": "pre-approval",
            "status": "completed"
          },
          {
            "id": "decision",
            "label": "Decision",
            "phaseId": "pre-approval",
            "status": "active"
          }
        ]
      },
      "tabs": [
        {
          "id": "overview",
          "label": "General information",
          "enabled": true
        },
        {
          "id": "decision",
          "label": "Decision",
          "enabled": true
        }
      ],
      "generalInformation": {
        "sections": [
          {
            "id": "insured_and_policy",
            "label": "Insured & Policy",
            "enabled": true,
            "fields": [
              {
                "id": "insured",
                "label": "Insured",
                "value": "Billy Bud",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "date_of_birth",
                "label": "Date of birth",
                "value": "Mar 12, 1984",
                "type": "date",
                "enabled": true,
                "muted": false
              },
              {
                "id": "policy_number",
                "label": "Policy number",
                "value": "SBLI-TL-2021-004821",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "product",
                "label": "Product",
                "value": "SBLI Term Life 20",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "death_benefit",
                "label": "Death benefit",
                "value": "$500,000",
                "type": "currency",
                "enabled": true,
                "muted": false
              },
              {
                "id": "term",
                "label": "Term",
                "value": "20 years (2021-2041)",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "monthly_premium",
                "label": "Monthly premium",
                "value": "$38/month",
                "type": "currency",
                "enabled": true,
                "muted": false
              },
              {
                "id": "policy_status",
                "label": "Policy status",
                "value": "In Force",
                "type": "status",
                "enabled": true,
                "muted": false
              }
            ]
          },
          {
            "id": "claim_information",
            "label": "Claim Information",
            "enabled": true,
            "fields": [
              {
                "id": "claim_number",
                "label": "Claim number",
                "value": "CD26-5546112",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "sub_type",
                "label": "Sub-type",
                "value": "Waiver of premium",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "rider",
                "label": "Rider",
                "value": "Waiver of Premium rider",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "date_of_loss",
                "label": "Date of loss",
                "value": "Jan 30, 2026",
                "type": "date",
                "enabled": true,
                "muted": false
              },
              {
                "id": "waiting_period_end",
                "label": "Waiting period end",
                "value": "Apr 30, 2026",
                "type": "date",
                "enabled": true,
                "muted": false
              },
              {
                "id": "cause",
                "label": "Cause",
                "value": "Motorcycle accident",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "diagnosis",
                "label": "Diagnosis (ICD-10)",
                "value": "S82.2 · M17.1",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "exclusion",
                "label": "Exclusion triggered",
                "value": "None",
                "type": "status",
                "enabled": true,
                "muted": false
              }
            ]
          },
          {
            "id": "disability_assessment",
            "label": "Disability & Occupation Assessment",
            "enabled": true,
            "fields": [
              {
                "id": "occupation",
                "label": "Occupation",
                "value": "Motorcycle courier",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "occupation_class",
                "label": "Occ. class",
                "value": "Class 4 (manual)",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "total_disability",
                "label": "Total disability",
                "value": "Confirmed",
                "type": "status",
                "enabled": true,
                "muted": false
              },
              {
                "id": "unable_to_work",
                "label": "Unable to work for profit",
                "value": "Confirmed",
                "type": "status",
                "enabled": true,
                "muted": false
              },
              {
                "id": "last_day_worked",
                "label": "Last day worked",
                "value": "Jan 30, 2026",
                "type": "date",
                "enabled": true,
                "muted": false
              },
              {
                "id": "employer",
                "label": "Employer",
                "value": "FastRoute Couriers Ltd",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "rehab_potential",
                "label": "Rehab potential",
                "value": "Moderate",
                "type": "status",
                "enabled": true,
                "muted": false
              },
              {
                "id": "rtw_target",
                "label": "RTW target",
                "value": "TBD post-decision",
                "type": "text",
                "enabled": true,
                "muted": false
              }
            ]
          },
          {
            "id": "coverage_details",
            "label": "Insured - full coverage details",
            "enabled": true,
            "description": "Policy, riders, beneficiaries",
            "fields": []
          },
          {
            "id": "premium_waiver_schedule",
            "label": "Premium waiver schedule",
            "enabled": true,
            "description": "Projected premiums waived pending approval",
            "fields": []
          },
          {
            "id": "policy_riders",
            "label": "Policy riders on file",
            "enabled": true,
            "description": "Waiver of premium · Accidental death benefit · LegacyShield",
            "fields": []
          }
        ]
      },
      "primaryParty": {
        "kind": "case",
        "id": "CD26-5546112",
        "label": "Billy Bud",
        "role": "claimant"
      },
      "participants": [],
      "linkedObjects": [],
      "moduleSummaries": [],
      "facts": [
        {
          "id": "product",
          "label": "Product",
          "value": "SBLI Term Life 20",
          "category": "product",
          "importance": "primary"
        },
        {
          "id": "financial",
          "label": "Financial value",
          "value": "$500,000",
          "category": "financial",
          "importance": "primary"
        },
        {
          "id": "policy-number",
          "label": "Policy/application number",
          "value": "SBLI-TL-2021-004821",
          "category": "identifier",
          "importance": "primary"
        },
        {
          "id": "ai-summary-generated-at",
          "label": "AI summary generated at",
          "value": "2026-03-09",
          "category": "ai",
          "importance": "supporting"
        }
      ],
      "sections": [],
      "analysis": {
        "confidence": 91,
        "recommendation": "Pending decision",
        "narrative": "Billy Bud, insured under SBLI Term Life 20 ($500,000 / 20-year, issued Mar 2021), has filed a Waiver of Premium claim following a motorcycle accident on Jan 30, 2026 resulting in multiple leg fractures and right knee replacement. Own-occupation disability confirmed. Waiting period of 90 days satisfied Apr 30, 2026. All medical evidence received. No policy exclusions triggered. Rider conditions met — case ready for approval decision.",
        "detailedResume": [
          "Billy Bud, insured under SBLI Term Life 20 ($500,000 / 20-year, issued Mar 2021), has filed a Waiver of Premium claim following a motorcycle accident on Jan 30, 2026 resulting in multiple leg fractures and right knee replacement. Own-occupation disability confirmed. Waiting period of 90 days satisfied Apr 30, 2026. All medical evidence received. No policy exclusions triggered. Rider conditions met — case ready for approval decision."
        ],
        "assessmentLabel": "Decision",
        "netAssessmentScore": 91,
        "factors": []
      },
      "claimDetails": {
        "claimSubType": "waiver_of_premium",
        "claimNumber": "CD26-5546112",
        "dateOfLoss": "2026-01-30",
        "disabilityOnset": "2026-01-30",
        "cause": "Motorcycle accident — multiple leg fractures, right knee replacement",
        "preExistingConditions": "Type 2 Diabetes (2016) — diet-controlled"
      }
    },
    {
      "id": "CD44-6679812",
      "kind": "case",
      "caseKind": "claim",
      "caseTypeId": "ct_claim_death",
      "caseTypeLabel": "Claim — Death benefit",
      "caseSubType": "death_benefit",
      "sourceCaseNumber": "case_002",
      "caseTypeCode": "DTH",
      "workflowTemplateId": "ct_claim_death",
      "title": "Claim — Death benefit",
      "status": "Pending decision",
      "statusCode": "pending_decision",
      "createdAt": "2026-02-03",
      "priority": "High",
      "phaseId": "pre-approval",
      "activeStepId": "contestability_review",
      "slaDue": "2026-05-18",
      "slaStatus": "warning",
      "assignee": {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "Victor Ramon",
        "role": "owner"
      },
      "owner": {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "Victor Ramon",
        "role": "owner"
      },
      "identification": {
        "caseId": "CD44-6679812",
        "caseTypeId": "ct_claim_death",
        "caseTypeLabel": "Claim — Death benefit",
        "status": "Pending decision",
        "statusCode": "pending_decision",
        "externalIds": [
          {
            "system": "SBLI seed",
            "value": "case_002",
            "label": "Seed case id"
          }
        ]
      },
      "contextCard": {
        "primaryPartyRef": {
          "kind": "case",
          "id": "CD44-6679812",
          "label": "Thomas Dupont",
          "role": "claimant"
        },
        "planRef": {
          "kind": "policy",
          "id": "SBLI-TL-2019-009102",
          "label": "SBLI Term Life 20"
        },
        "policyRef": {
          "kind": "policy",
          "id": "SBLI-TL-2019-009102",
          "label": "SBLI Term Life 20"
        },
        "headlineMetrics": [
          {
            "id": "primary-party",
            "label": "Claimant",
            "value": "Marie Dupont (beneficiary)",
            "type": "reference",
            "enabled": true,
            "muted": false
          },
          {
            "id": "plan",
            "label": "Policy",
            "value": "SBLI Term Life 20",
            "type": "reference",
            "enabled": true,
            "muted": false
          },
          {
            "id": "monthly-benefit",
            "label": "Death benefit",
            "value": "$500,000",
            "type": "currency",
            "enabled": true,
            "muted": false
          },
          {
            "id": "sla",
            "label": "SLA",
            "value": "3d remaining",
            "type": "status",
            "enabled": true,
            "muted": false
          }
        ],
        "sla": {
          "dueAt": "2026-05-18",
          "label": "3d remaining",
          "status": "warning"
        }
      },
      "workflowState": {
        "templateId": "ct_claim_death",
        "phaseId": "pre-approval",
        "activeStepId": "contestability_review",
        "steps": [
          {
            "id": "fnol_received",
            "label": "FNOL received",
            "phaseId": "pre-approval",
            "status": "completed"
          },
          {
            "id": "initial_triage",
            "label": "Initial triage",
            "phaseId": "pre-approval",
            "status": "completed"
          },
          {
            "id": "requirement_gathering",
            "label": "Req. gathering",
            "phaseId": "pre-approval",
            "status": "completed"
          },
          {
            "id": "contestability_review",
            "label": "Contestability review",
            "phaseId": "pre-approval",
            "status": "active"
          },
          {
            "id": "decision",
            "label": "Decision",
            "phaseId": "pre-approval",
            "status": "pending"
          }
        ]
      },
      "tabs": [
        {
          "id": "overview",
          "label": "General information",
          "enabled": true
        },
        {
          "id": "decision",
          "label": "Decision",
          "enabled": true
        }
      ],
      "generalInformation": {
        "sections": [
          {
            "id": "deceased_insured_and_policy",
            "label": "Deceased Insured & Policy",
            "enabled": true,
            "fields": [
              {
                "id": "insured",
                "label": "Insured (deceased)",
                "value": "Thomas Dupont",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "date_of_death",
                "label": "Date of death",
                "value": "Jan 28, 2026",
                "type": "date",
                "enabled": true,
                "muted": false
              },
              {
                "id": "policy_number",
                "label": "Policy number",
                "value": "SBLI-TL-2019-009102",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "product",
                "label": "Product",
                "value": "SBLI Term Life 20",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "death_benefit",
                "label": "Death benefit",
                "value": "$500,000",
                "type": "currency",
                "enabled": true,
                "muted": false
              },
              {
                "id": "issue_date",
                "label": "Issue date",
                "value": "Feb 01, 2019",
                "type": "date",
                "enabled": true,
                "muted": false
              },
              {
                "id": "status_at_death",
                "label": "Status at death",
                "value": "In Force",
                "type": "status",
                "enabled": true,
                "muted": false
              },
              {
                "id": "contestability_lapsed",
                "label": "Contestability lapsed",
                "value": "Yes - 6y 11m",
                "type": "status",
                "enabled": true,
                "muted": false
              }
            ]
          },
          {
            "id": "claim_information",
            "label": "Claim Information",
            "enabled": true,
            "fields": [
              {
                "id": "claim_number",
                "label": "Claim number",
                "value": "CD44-6679812",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "sub_type",
                "label": "Sub-type",
                "value": "Death benefit",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "cause_of_death",
                "label": "Cause of death",
                "value": "Acute myocardial infarction",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "manner_of_death",
                "label": "Manner of death",
                "value": "Natural",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "exclusions",
                "label": "Exclusions identified",
                "value": "None",
                "type": "status",
                "enabled": true,
                "muted": false
              },
              {
                "id": "accelerated_death_benefit",
                "label": "Accel. death benefit",
                "value": "N/A - death",
                "type": "text",
                "enabled": true,
                "muted": false
              }
            ]
          },
          {
            "id": "beneficiary_information",
            "label": "Beneficiary Information",
            "enabled": true,
            "fields": [
              {
                "id": "primary_beneficiary",
                "label": "Primary beneficiary",
                "value": "Marie Dupont",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "relationship",
                "label": "Relationship",
                "value": "spouse",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "share",
                "label": "Share",
                "value": "undefined%",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "identity_verified",
                "label": "Identity verified",
                "value": "Confirmed",
                "type": "status",
                "enabled": true,
                "muted": false
              },
              {
                "id": "address",
                "label": "Address",
                "value": "412 Maple St, Portland, OR",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "payment_method",
                "label": "Payment method",
                "value": "ach_bank_transfer",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "bank_verified",
                "label": "Bank verified",
                "value": "Confirmed",
                "type": "status",
                "enabled": true,
                "muted": false
              },
              {
                "id": "contingent_beneficiary",
                "label": "Contingent beneficiary",
                "value": "Sophie Dupont (daughter)",
                "type": "text",
                "enabled": true,
                "muted": false
              }
            ]
          },
          {
            "id": "policy_riders",
            "label": "Policy riders on file",
            "enabled": true,
            "description": "Accelerated death benefit · Accidental death benefit · LegacyShield",
            "fields": []
          },
          {
            "id": "contestability_review",
            "label": "Contestability review detail",
            "enabled": true,
            "description": "Application disclosures vs. medical history comparison",
            "fields": []
          },
          {
            "id": "payment_disbursement",
            "label": "Payment & disbursement",
            "enabled": true,
            "description": "$500,000 ACH payout - pending decision",
            "fields": []
          }
        ]
      },
      "primaryParty": {
        "kind": "case",
        "id": "CD44-6679812",
        "label": "Thomas Dupont",
        "role": "claimant"
      },
      "participants": [],
      "linkedObjects": [],
      "moduleSummaries": [],
      "facts": [
        {
          "id": "product",
          "label": "Product",
          "value": "SBLI Term Life 20",
          "category": "product",
          "importance": "primary"
        },
        {
          "id": "financial",
          "label": "Financial value",
          "value": "$500,000",
          "category": "financial",
          "importance": "primary"
        },
        {
          "id": "policy-number",
          "label": "Policy/application number",
          "value": "SBLI-TL-2019-009102",
          "category": "identifier",
          "importance": "primary"
        },
        {
          "id": "ai-summary-generated-at",
          "label": "AI summary generated at",
          "value": "2026-05-10",
          "category": "ai",
          "importance": "supporting"
        }
      ],
      "sections": [],
      "analysis": {
        "confidence": 95,
        "recommendation": "Pending decision",
        "narrative": "Death benefit claim filed Feb 3, 2026 by Marie Dupont (spouse/primary beneficiary) following the death of insured Thomas Dupont on Jan 28, 2026. Cause of death: acute myocardial infarction. Policy SBLI-TL-2019-009102 (Term Life 20, $500,000) issued Feb 2019 — contestability window of 2 years has fully lapsed (6y 11m in force at death). APS, toxicology, and identity verification complete. No exclusions. Ready for final decision and $500k ACH payout.",
        "detailedResume": [
          "Death benefit claim filed Feb 3, 2026 by Marie Dupont (spouse/primary beneficiary) following the death of insured Thomas Dupont on Jan 28, 2026. Cause of death: acute myocardial infarction. Policy SBLI-TL-2019-009102 (Term Life 20, $500,000) issued Feb 2019 — contestability window of 2 years has fully lapsed (6y 11m in force at death). APS, toxicology, and identity verification complete. No exclusions. Ready for final decision and $500k ACH payout."
        ],
        "assessmentLabel": "Contestability Review",
        "netAssessmentScore": 95,
        "factors": []
      },
      "claimDetails": {
        "claimSubType": "death_benefit",
        "claimNumber": "CD44-6679812",
        "dateOfLoss": "2026-01-28",
        "cause": "Acute myocardial infarction",
        "preExistingConditions": "None"
      }
    },
    {
      "id": "NB66-7622343",
      "kind": "case",
      "caseKind": "new_business",
      "caseTypeId": "ct_nb_full_uw",
      "caseTypeLabel": "New business — Full underwriting",
      "caseSubType": "full_underwriting",
      "sourceCaseNumber": "case_003",
      "caseTypeCode": "NB",
      "workflowTemplateId": "ct_nb_full_uw",
      "title": "New business — Full underwriting",
      "status": "Active",
      "statusCode": "active",
      "createdAt": "2026-05-12",
      "priority": "Normal",
      "phaseId": "pre-approval",
      "activeStepId": "requirement_gathering",
      "slaDue": "2026-05-20",
      "slaStatus": "ok",
      "assignee": {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "Victor Ramon",
        "role": "owner"
      },
      "owner": {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "Victor Ramon",
        "role": "owner"
      },
      "identification": {
        "caseId": "NB66-7622343",
        "caseTypeId": "ct_nb_full_uw",
        "caseTypeLabel": "New business — Full underwriting",
        "status": "Active",
        "statusCode": "active",
        "externalIds": [
          {
            "system": "SBLI seed",
            "value": "case_003",
            "label": "Seed case id"
          }
        ]
      },
      "contextCard": {
        "primaryPartyRef": {
          "kind": "case",
          "id": "NB66-7622343",
          "label": "Marc Tremblay",
          "role": "applicant"
        },
        "planRef": {
          "kind": "application",
          "id": "APP-7622343",
          "label": "SBLI Term Life 20"
        },
        "applicationRef": {
          "kind": "application",
          "id": "APP-7622343",
          "label": "SBLI Term Life 20"
        },
        "headlineMetrics": [
          {
            "id": "primary-party",
            "label": "Applicant",
            "value": "Marc Tremblay",
            "type": "reference",
            "enabled": true,
            "muted": false
          },
          {
            "id": "plan",
            "label": "Product",
            "value": "SBLI Term Life 20",
            "type": "reference",
            "enabled": true,
            "muted": false
          },
          {
            "id": "monthly-benefit",
            "label": "Death benefit",
            "value": "$625,000",
            "type": "currency",
            "enabled": true,
            "muted": false
          },
          {
            "id": "sla",
            "label": "SLA",
            "value": "5d remaining",
            "type": "status",
            "enabled": true,
            "muted": false
          }
        ],
        "sla": {
          "dueAt": "2026-05-20",
          "label": "5d remaining",
          "status": "normal"
        }
      },
      "workflowState": {
        "templateId": "ct_nb_full_uw",
        "phaseId": "pre-approval",
        "activeStepId": "requirement_gathering",
        "steps": [
          {
            "id": "application_received",
            "label": "App. received",
            "phaseId": "pre-approval",
            "status": "completed"
          },
          {
            "id": "initial_review",
            "label": "Initial review",
            "phaseId": "pre-approval",
            "status": "completed"
          },
          {
            "id": "requirement_gathering",
            "label": "Req. gathering",
            "phaseId": "pre-approval",
            "status": "active"
          },
          {
            "id": "underwriting_review",
            "label": "UW review",
            "phaseId": "pre-approval",
            "status": "pending"
          },
          {
            "id": "decision",
            "label": "Decision",
            "phaseId": "pre-approval",
            "status": "pending"
          }
        ]
      },
      "tabs": [
        {
          "id": "overview",
          "label": "General information",
          "enabled": true
        },
        {
          "id": "decision",
          "label": "Decision",
          "enabled": true
        },
        {
          "id": "scoring",
          "label": "Scoring",
          "enabled": true
        },
        {
          "id": "application",
          "label": "Application",
          "enabled": true
        }
      ],
      "generalInformation": {
        "sections": [
          {
            "id": "application_intake",
            "label": "Application Intake",
            "enabled": true,
            "fields": [
              {
                "id": "applicant",
                "label": "Applicant",
                "value": "Marc Tremblay",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "date_of_birth",
                "label": "Date of birth",
                "value": "Jun 03, 1983",
                "type": "date",
                "enabled": true,
                "muted": false
              },
              {
                "id": "application_date",
                "label": "Application date",
                "value": "May 12, 2026",
                "type": "date",
                "enabled": true,
                "muted": false
              },
              {
                "id": "channel",
                "label": "Channel",
                "value": "Sbli Broker Network",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "product",
                "label": "Product",
                "value": "SBLI Term Life 20",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "death_benefit",
                "label": "Death benefit",
                "value": "$625,000",
                "type": "currency",
                "enabled": true,
                "muted": false
              },
              {
                "id": "premium",
                "label": "Premium (indicative)",
                "value": "$85/month",
                "type": "currency",
                "enabled": true,
                "muted": false
              },
              {
                "id": "uw_path",
                "label": "UW path",
                "value": "Traditional (MIB flag)",
                "type": "status",
                "enabled": true,
                "muted": false
              }
            ]
          },
          {
            "id": "insured_health_profile",
            "label": "Insured Health Profile",
            "enabled": true,
            "fields": [
              {
                "id": "height_weight",
                "label": "Height / Weight",
                "value": "5'10\" / 192 lb",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "bmi",
                "label": "BMI",
                "value": "27.4 - Overweight",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "smoker_status",
                "label": "Smoker status",
                "value": "Non Smoker",
                "type": "status",
                "enabled": true,
                "muted": false
              },
              {
                "id": "disclosed_condition",
                "label": "Disclosed condition",
                "value": "Type 2 Diabetes (2019) — diet-controlled",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "hba1c",
                "label": "HbA1c",
                "value": "48 mmol/mol (2025)",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "medication",
                "label": "Medication",
                "value": "Metformin 500mg",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "mib_flag",
                "label": "MIB flag",
                "value": "Prior decline — 2022, carrier unknown",
                "type": "status",
                "enabled": true,
                "muted": false
              },
              {
                "id": "family_history",
                "label": "Family history",
                "value": "Father: MI age 58",
                "type": "text",
                "enabled": true,
                "muted": false
              }
            ]
          },
          {
            "id": "ai_debit_credit_scoring",
            "label": "AI Debit/Credit Scoring Summary",
            "enabled": true,
            "fields": [
              {
                "id": "preliminary_mortality_rating",
                "label": "Preliminary mortality rating",
                "value": "+25 debits - rated offer anticipated",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "factor-0",
                "label": "Type 2 Diabetes (diet-controlled)",
                "value": "+50",
                "type": "number",
                "enabled": true,
                "muted": false
              },
              {
                "id": "factor-1",
                "label": "BMI 27.4",
                "value": "+25",
                "type": "number",
                "enabled": true,
                "muted": false
              },
              {
                "id": "factor-2",
                "label": "Non-smoker (verified)",
                "value": "-30",
                "type": "number",
                "enabled": true,
                "muted": false
              },
              {
                "id": "factor-3",
                "label": "HbA1c well-controlled",
                "value": "-20",
                "type": "number",
                "enabled": true,
                "muted": false
              },
              {
                "id": "factor-4",
                "label": "MIB prior decline — unresolved",
                "value": "+50",
                "type": "number",
                "enabled": true,
                "muted": false
              },
              {
                "id": "factor-5",
                "label": "Father MI age 58",
                "value": "+15",
                "type": "number",
                "enabled": true,
                "muted": false
              },
              {
                "id": "pending",
                "label": "Pending",
                "value": "blood profile, paramedical exam, APS. Final rating subject to change.",
                "type": "text",
                "enabled": true,
                "muted": false
              }
            ]
          },
          {
            "id": "riders_selected",
            "label": "Riders selected",
            "enabled": true,
            "description": "Accelerated death benefit (free) · Waiver of premium · Accidental death benefit",
            "fields": []
          },
          {
            "id": "beneficiary",
            "label": "Beneficiary",
            "enabled": true,
            "description": "2 beneficiaries on file",
            "fields": []
          },
          {
            "id": "conversion_option",
            "label": "Conversion option",
            "enabled": true,
            "description": "Eligible to convert to SBLI Whole Life before age 70 - no new exam",
            "fields": []
          }
        ]
      },
      "primaryParty": {
        "kind": "case",
        "id": "NB66-7622343",
        "label": "Marc Tremblay",
        "role": "applicant"
      },
      "participants": [],
      "linkedObjects": [],
      "moduleSummaries": [],
      "facts": [
        {
          "id": "product",
          "label": "Product",
          "value": "SBLI Term Life 20",
          "category": "product",
          "importance": "primary"
        },
        {
          "id": "financial",
          "label": "Financial value",
          "value": "$625,000",
          "category": "financial",
          "importance": "primary"
        },
        {
          "id": "policy-number",
          "label": "Policy/application number",
          "value": "APP-7622343",
          "category": "identifier",
          "importance": "primary"
        },
        {
          "id": "ai-summary-generated-at",
          "label": "AI summary generated at",
          "value": "2026-05-13",
          "category": "ai",
          "importance": "supporting"
        }
      ],
      "sections": [],
      "analysis": {
        "confidence": 88,
        "recommendation": "Active",
        "narrative": "Marc Tremblay, age 42, applied for SBLI Term Life 20 — $625,000 death benefit, 20-year term via SBLI broker network. Non-smoker, BMI 27.4. Disclosed T2 Diabetes (2019, diet-controlled, HbA1c 48). MIB hit: prior decline 2022 — explanation required. MIB flag disqualifies accelerated underwriting. Paramedical exam scheduled May 19. APS outstanding. AI preliminary scoring: +75 debits — rated offer anticipated.",
        "detailedResume": [
          "Marc Tremblay, age 42, applied for SBLI Term Life 20 — $625,000 death benefit, 20-year term via SBLI broker network. Non-smoker, BMI 27.4. Disclosed T2 Diabetes (2019, diet-controlled, HbA1c 48). MIB hit: prior decline 2022 — explanation required. MIB flag disqualifies accelerated underwriting. Paramedical exam scheduled May 19. APS outstanding. AI preliminary scoring: +75 debits — rated offer anticipated."
        ],
        "assessmentLabel": "Requirement Gathering",
        "netAssessmentScore": 88,
        "factors": []
      },
      "applicationFields": {
        "applicationIntake": {
          "applicant_name": "Marc Tremblay",
          "date_of_birth": "1983-06-03",
          "application_date": "2026-05-12",
          "distribution_channel": "sbli_broker_network",
          "broker": "Northstar Advisory",
          "product": "SBLI Term Life 20",
          "product_type": "term_life",
          "death_benefit": 625000,
          "term_years": 20,
          "monthly_premium_indicative": 85,
          "underwriting_path": "traditional",
          "underwriting_path_reason": "MIB flag — prior decline disqualifies accelerated UW"
        },
        "healthProfile": {
          "height_in": 70,
          "weight_lbs": 192,
          "bmi": 27.4,
          "bmi_classification": "overweight",
          "smoker_status": "non_smoker",
          "smoker_verified_via": "rx_database",
          "disclosed_conditions": [
            "Type 2 Diabetes (2019) — diet-controlled"
          ],
          "hba1c": 48,
          "hba1c_unit": "mmol/mol",
          "hba1c_date": "2025-01-01",
          "medications": [
            "Metformin 500mg"
          ],
          "mib_flag": true,
          "mib_flag_detail": "Prior decline — 2022, carrier unknown",
          "family_history": [
            "Father: MI age 58"
          ]
        },
        "aiScoring": {
          "preliminary_debit_total": 75,
          "preliminary_credit_total": 50,
          "net_debits": 25,
          "anticipated_offer": "rated",
          "scoring_status": "preliminary",
          "factors": [
            {
              "factor": "Type 2 Diabetes (diet-controlled)",
              "category": "medical",
              "direction": "debit",
              "points": 50,
              "confidence": "high"
            },
            {
              "factor": "BMI 27.4",
              "category": "build",
              "direction": "debit",
              "points": 25,
              "confidence": "high"
            },
            {
              "factor": "Non-smoker (verified)",
              "category": "lifestyle",
              "direction": "credit",
              "points": -30,
              "confidence": "high"
            },
            {
              "factor": "HbA1c well-controlled",
              "category": "medical",
              "direction": "credit",
              "points": -20,
              "confidence": "high"
            },
            {
              "factor": "MIB prior decline — unresolved",
              "category": "investigative",
              "direction": "debit",
              "points": 50,
              "confidence": "pending",
              "flag": "unresolved"
            },
            {
              "factor": "Father MI age 58",
              "category": "family_history",
              "direction": "watch",
              "points": 15,
              "confidence": "pending_aps"
            },
            {
              "factor": "Paramedical exam results",
              "category": "medical",
              "direction": "pending",
              "points": null,
              "confidence": "awaiting"
            }
          ]
        }
      },
      "underwritingScoring": {
        "baseScore": 0,
        "debitTotal": 75,
        "creditTotal": 50,
        "netScore": 25,
        "mappedDecision": "rated",
        "riskClass": "rated",
        "debits": [
          {
            "id": "factor-0",
            "label": "Type 2 Diabetes (diet-controlled)",
            "category": "medical",
            "points": 50,
            "notes": "high"
          },
          {
            "id": "factor-1",
            "label": "BMI 27.4",
            "category": "build",
            "points": 25,
            "notes": "high"
          },
          {
            "id": "factor-4",
            "label": "MIB prior decline — unresolved",
            "category": "investigative",
            "points": 50,
            "notes": "pending"
          },
          {
            "id": "factor-5",
            "label": "Father MI age 58",
            "category": "family_history",
            "points": 15,
            "notes": "pending_aps"
          }
        ],
        "credits": [
          {
            "id": "factor-2",
            "label": "Non-smoker (verified)",
            "category": "lifestyle",
            "points": -30,
            "notes": "high"
          },
          {
            "id": "factor-3",
            "label": "HbA1c well-controlled",
            "category": "medical",
            "points": -20,
            "notes": "high"
          }
        ],
        "flatExtras": [],
        "exclusions": [],
        "evidence": [],
        "aiComparison": {
          "netScore": 25,
          "riskClass": "rated",
          "narrative": "Marc Tremblay, age 42, applied for SBLI Term Life 20 — $625,000 death benefit, 20-year term via SBLI broker network. Non-smoker, BMI 27.4. Disclosed T2 Diabetes (2019, diet-controlled, HbA1c 48). MIB hit: prior decline 2022 — explanation required. MIB flag disqualifies accelerated underwriting. Paramedical exam scheduled May 19. APS outstanding. AI preliminary scoring: +75 debits — rated offer anticipated."
        }
      }
    },
    {
      "id": "NB98-9989870",
      "kind": "case",
      "caseKind": "new_business",
      "caseTypeId": "ct_nb_simplified",
      "caseTypeLabel": "New business — Simplified / accelerated underwriting",
      "caseSubType": "simplified_underwriting",
      "sourceCaseNumber": "case_004",
      "caseTypeCode": "NB",
      "workflowTemplateId": "ct_nb_simplified",
      "title": "New business — Simplified / accelerated underwriting",
      "status": "Active",
      "statusCode": "active",
      "createdAt": "2026-05-13",
      "priority": "High",
      "phaseId": "pre-approval",
      "activeStepId": "tele_interview",
      "slaDue": "2026-05-17",
      "slaStatus": "warning",
      "assignee": {
        "kind": "case",
        "id": "NB98-9989870",
        "label": "Richard Daniels",
        "role": "owner"
      },
      "owner": {
        "kind": "case",
        "id": "NB98-9989870",
        "label": "Richard Daniels",
        "role": "owner"
      },
      "identification": {
        "caseId": "NB98-9989870",
        "caseTypeId": "ct_nb_simplified",
        "caseTypeLabel": "New business — Simplified / accelerated underwriting",
        "status": "Active",
        "statusCode": "active",
        "externalIds": [
          {
            "system": "SBLI seed",
            "value": "case_004",
            "label": "Seed case id"
          }
        ]
      },
      "contextCard": {
        "primaryPartyRef": {
          "kind": "case",
          "id": "NB98-9989870",
          "label": "Elena Rossi",
          "role": "applicant"
        },
        "planRef": {
          "kind": "application",
          "id": "APP-998987",
          "label": "SBLI Simple Term Life"
        },
        "applicationRef": {
          "kind": "application",
          "id": "APP-998987",
          "label": "SBLI Simple Term Life"
        },
        "headlineMetrics": [
          {
            "id": "primary-party",
            "label": "Applicant",
            "value": "Elena Rossi",
            "type": "reference",
            "enabled": true,
            "muted": false
          },
          {
            "id": "plan",
            "label": "Product",
            "value": "SBLI Simple Term Life",
            "type": "reference",
            "enabled": true,
            "muted": false
          },
          {
            "id": "monthly-benefit",
            "label": "Death benefit",
            "value": "$350,000",
            "type": "currency",
            "enabled": true,
            "muted": false
          },
          {
            "id": "sla",
            "label": "SLA",
            "value": "2d remaining",
            "type": "status",
            "enabled": true,
            "muted": false
          }
        ],
        "sla": {
          "dueAt": "2026-05-17",
          "label": "2d remaining",
          "status": "warning"
        }
      },
      "workflowState": {
        "templateId": "ct_nb_simplified",
        "phaseId": "pre-approval",
        "activeStepId": "tele_interview",
        "steps": [
          {
            "id": "application_received",
            "label": "App. received",
            "phaseId": "pre-approval",
            "status": "completed"
          },
          {
            "id": "tele_interview",
            "label": "Tele-interview",
            "phaseId": "pre-approval",
            "status": "active"
          },
          {
            "id": "questionnaire_review",
            "label": "Questionnaire review",
            "phaseId": "pre-approval",
            "status": "pending"
          },
          {
            "id": "decision",
            "label": "Decision",
            "phaseId": "pre-approval",
            "status": "pending"
          }
        ]
      },
      "tabs": [
        {
          "id": "overview",
          "label": "General information",
          "enabled": true
        },
        {
          "id": "decision",
          "label": "Decision",
          "enabled": true
        },
        {
          "id": "scoring",
          "label": "Scoring",
          "enabled": true
        },
        {
          "id": "application",
          "label": "Application",
          "enabled": true
        }
      ],
      "generalInformation": {
        "sections": [
          {
            "id": "application_intake",
            "label": "Application Intake",
            "enabled": true,
            "fields": [
              {
                "id": "applicant",
                "label": "Applicant",
                "value": "Elena Rossi",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "date_of_birth",
                "label": "Date of birth",
                "value": "Jan 22, 1991",
                "type": "date",
                "enabled": true,
                "muted": false
              },
              {
                "id": "application_date",
                "label": "Application date",
                "value": "May 13, 2026",
                "type": "date",
                "enabled": true,
                "muted": false
              },
              {
                "id": "channel",
                "label": "Channel",
                "value": "Direct - SBLI.com",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "product",
                "label": "Product",
                "value": "SBLI Simple Term Life",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "death_benefit",
                "label": "Death benefit",
                "value": "$350,000",
                "type": "currency",
                "enabled": true,
                "muted": false
              },
              {
                "id": "term",
                "label": "Term",
                "value": "20 years",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "uw_path",
                "label": "UW path",
                "value": "Accelerated - no exam",
                "type": "status",
                "enabled": true,
                "muted": false
              }
            ]
          },
          {
            "id": "accelerated_uw_eligibility",
            "label": "Accelerated UW Eligibility",
            "enabled": true,
            "fields": [
              {
                "id": "age",
                "label": "Age (18-50 limit)",
                "value": "35 Pass",
                "type": "status",
                "enabled": true,
                "muted": false
              },
              {
                "id": "coverage",
                "label": "Coverage ($1M limit)",
                "value": "$350,000 Pass",
                "type": "status",
                "enabled": true,
                "muted": false
              },
              {
                "id": "adverse_disclosures",
                "label": "Adverse disclosures",
                "value": "None",
                "type": "status",
                "enabled": true,
                "muted": false
              },
              {
                "id": "mib_alert",
                "label": "MIB alert",
                "value": "None",
                "type": "status",
                "enabled": true,
                "muted": false
              },
              {
                "id": "smoker_status",
                "label": "Smoker status",
                "value": "Non Smoker",
                "type": "status",
                "enabled": true,
                "muted": false
              },
              {
                "id": "bmi",
                "label": "BMI (self-declared)",
                "value": "23.1 - Normal",
                "type": "text",
                "enabled": true,
                "muted": false
              },
              {
                "id": "medical_exam_required",
                "label": "Medical exam required",
                "value": "No",
                "type": "status",
                "enabled": true,
                "muted": false
              },
              {
                "id": "same_day_coverage",
                "label": "Same-day coverage",
                "value": "Eligible",
                "type": "status",
                "enabled": true,
                "muted": false
              }
            ]
          },
          {
            "id": "riders_included",
            "label": "Riders included",
            "enabled": true,
            "description": "Accelerated death benefit (free) · LegacyShield digital vault (free)",
            "fields": []
          },
          {
            "id": "beneficiary",
            "label": "Beneficiary",
            "enabled": true,
            "description": "Marco Rossi (spouse) - 100%",
            "fields": []
          },
          {
            "id": "conversion_option",
            "label": "Conversion option",
            "enabled": true,
            "description": "Eligible to convert to SBLI Whole Life before age 70 - no new exam",
            "fields": []
          }
        ]
      },
      "primaryParty": {
        "kind": "case",
        "id": "NB98-9989870",
        "label": "Elena Rossi",
        "role": "applicant"
      },
      "participants": [],
      "linkedObjects": [],
      "moduleSummaries": [],
      "facts": [
        {
          "id": "product",
          "label": "Product",
          "value": "SBLI Simple Term Life",
          "category": "product",
          "importance": "primary"
        },
        {
          "id": "financial",
          "label": "Financial value",
          "value": "$350,000",
          "category": "financial",
          "importance": "primary"
        },
        {
          "id": "policy-number",
          "label": "Policy/application number",
          "value": "APP-998987",
          "category": "identifier",
          "importance": "primary"
        },
        {
          "id": "ai-summary-generated-at",
          "label": "AI summary generated at",
          "value": "2026-05-13",
          "category": "ai",
          "importance": "supporting"
        }
      ],
      "sections": [],
      "analysis": {
        "confidence": 95,
        "recommendation": "Active",
        "narrative": "Elena Rossi, age 35, applied online for SBLI Simple Term Life — $350,000 death benefit, 20-year term. Accelerated underwriting path confirmed: age 18–50 ✓, coverage under $1M ✓, no adverse disclosures ✓, no MIB alerts ✓. Tele-interview scheduled May 17. In-house health questionnaire covers cardiovascular, respiratory, musculoskeletal, and mental health. Anticipated clean pass — standard rates likely. Same-day coverage eligible pending interview completion.",
        "detailedResume": [
          "Elena Rossi, age 35, applied online for SBLI Simple Term Life — $350,000 death benefit, 20-year term. Accelerated underwriting path confirmed: age 18–50 ✓, coverage under $1M ✓, no adverse disclosures ✓, no MIB alerts ✓. Tele-interview scheduled May 17. In-house health questionnaire covers cardiovascular, respiratory, musculoskeletal, and mental health. Anticipated clean pass — standard rates likely. Same-day coverage eligible pending interview completion."
        ],
        "assessmentLabel": "Tele Interview",
        "netAssessmentScore": 95,
        "factors": []
      },
      "applicationFields": {
        "applicationIntake": {
          "applicant_name": "Elena Rossi",
          "date_of_birth": "1991-01-22",
          "application_date": "2026-05-13",
          "distribution_channel": "direct_sbli_com",
          "product": "SBLI Simple Term Life",
          "product_type": "simple_term_life",
          "death_benefit": 350000,
          "term_years": 20,
          "monthly_premium_indicative": 22,
          "underwriting_path": "accelerated_no_exam",
          "same_day_coverage_eligible": true
        },
        "acceleratedUwEligibility": {
          "age_eligible": true,
          "age_at_entry": 35,
          "age_limit": 50,
          "coverage_eligible": true,
          "coverage_amount": 350000,
          "coverage_limit": 1000000,
          "adverse_disclosures": false,
          "mib_alert": false,
          "smoker_status": "non_smoker",
          "bmi_self_declared": 23.1,
          "bmi_classification": "normal",
          "medical_exam_required": false,
          "all_criteria_passed": true
        },
        "healthQuestionnaire": {
          "sections": [
            {
              "section": "cardiovascular",
              "status": "pending"
            },
            {
              "section": "respiratory",
              "status": "pending"
            },
            {
              "section": "musculoskeletal",
              "status": "pending"
            },
            {
              "section": "mental_health",
              "status": "pending"
            }
          ],
          "interview_date": "2026-05-17",
          "interview_time": "10:00",
          "interviewer": "Richard Daniels"
        }
      }
    }
  ].map((caseRecord) => withCaseWorkflowGi(withCaseEntityLinks(caseRecord as CaseRecord))),
  "clients": SBLI_CLIENT_RECORDS,
  "policies": SBLI_POLICY_RECORDS,
  "agents": SBLI_AGENT_RECORDS,
  "applications": SBLI_APPLICATION_RECORDS,
  "tasks": [
    ...SBLI_TASK_RECORDS.map(withRequirementTaskLinks),
    ...SBLI_REQUIREMENT_TASK_RECORDS,
    ...SBLI_SIMPLE_TASK_RECORDS,
  ],
  "requirements": SBLI_REQUIREMENT_RECORDS,
  "documents": [
    ...SBLI_DOCUMENT_RECORDS.map(enrichSbliDocument),
    ...SBLI_REQUIREMENT_DOCUMENT_RECORDS.map(enrichSbliDocument),
    ...SBLI_SIMPLE_DOCUMENT_RECORDS.map(enrichSbliDocument),
  ],
  "requests": [...SBLI_REQUEST_RECORDS, ...SBLI_SIMPLE_REQUEST_RECORDS],
  "communications": [],
  "notes": [],
  "activityEvents": [],
  "documentEvidence": [
    ...SBLI_DOCUMENT_EVIDENCE_RECORDS.map(enrichSbliEvidence),
    ...SBLI_SIMPLE_DOCUMENT_EVIDENCE.map(enrichSbliEvidence),
  ],
  "assistantResponses": [],
  "aiActions": [],
  "legacyMockOverlayEnabled": false
};
