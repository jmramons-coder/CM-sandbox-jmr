import type {
  DatasetDocumentRecord,
  DatasetRequestRecord,
  DatasetTaskRecord,
  DocumentEvidenceRecord,
} from './multi-case-dataset';
import { getTaskCrewStepSeed } from './taskCrewReasoningSeeds';

export const EMPIRE_ADDR_CLIENT_ID = 'CLI-EMP-008';
export const EMPIRE_ADDR_CLIENT_NAME = 'Eleanor Whitfield';
export const EMPIRE_ADDR_POLICY_ID = 'POL-EMP-TL-2020-008905';
export const EMPIRE_ADDR_POLICY_LABEL = 'Empire Term Life 15';
export const EMPIRE_ADDR_SECOND_POLICY_ID = 'POL-EMP-WL-2018-004512';
export const EMPIRE_ADDR_SECOND_POLICY_LABEL = 'Solution 10 participating';
export const EMPIRE_ADDR_PRODUCT = 'Empire Term Life 15';
export const EMPIRE_ADDR_REQUEST_ID = 'REQ-EMP-2026-007';
export const TASK_EMP_ADDR_001_ID = 'task_emp_addr_001';
export const EMPIRE_ADDR_DOCUMENT_ID = 'doc_emp_addr_change_form';

const crewSteps = getTaskCrewStepSeed(TASK_EMP_ADDR_001_ID) ?? [];

export const EMPIRE_SIMPLE_REQUEST_RECORDS: DatasetRequestRecord[] = [
  {
    id: EMPIRE_ADDR_REQUEST_ID,
    kind: 'request',
    label: `Mailing address change — ${EMPIRE_ADDR_CLIENT_NAME}`,
    name: `Mailing address change — ${EMPIRE_ADDR_CLIENT_NAME}`,
    status: 'In progress',
    source: 'Client portal',
    channel: 'Client portal',
    sourceChannel: 'client_portal',
    sourceDetail: 'Empire Life policyholder portal',
    category: 'Address Change',
    subtype: 'Policy service — address change',
    priority: 'Normal',
    requester: EMPIRE_ADDR_CLIENT_NAME,
    requesterRole: 'Policyholder / Insured',
    requesterInitials: 'EW',
    clientId: EMPIRE_ADDR_CLIENT_ID,
    policyNumber: EMPIRE_ADDR_POLICY_ID,
    received: 'May 14, 2026',
    receivedFull: '2026-05-14',
    receivedTime: '11:08',
    statusCls: 'pq',
    assignee: 'Victor Ramon',
    assignedTo: 'Victor Ramon',
    due: 'May 17, 2026',
    requestMode: 'external',
    templateId: 'address_change',
    aiSummary: `${EMPIRE_ADDR_CLIENT_NAME} submitted a mailing address change for policy ${EMPIRE_ADDR_POLICY_ID} via the client portal. New residence at 15 Laurier Avenue West, Ottawa ON is supported by the signed change form and bank statement; lease agreement shows unit as Apt 204 vs Unit 204 on the form. No claim case opened — handled as a simple policy-service task.`,
    summary: `${EMPIRE_ADDR_CLIENT_NAME} submitted a mailing address change for policy ${EMPIRE_ADDR_POLICY_ID} via the client portal. New residence at 15 Laurier Avenue West, Ottawa ON is supported by the signed change form and bank statement; lease agreement shows unit as Apt 204 vs Unit 204 on the form. No claim case opened — handled as a simple policy-service task.`,
    nextAction: 'Complete address change review',
    linkedTasks: [TASK_EMP_ADDR_001_ID],
    form: {
      submitted: '2026-05-14 at 11:08',
      channel: 'Empire Life Client Portal',
      formType: 'Empire Life Address Change Form v2.0',
      formVersion: '2.0',
      fields: [
        { label: 'Policy number', value: EMPIRE_ADDR_POLICY_ID },
        { label: 'Current address on file', value: '88 Front Street East, Toronto ON M5E 1C3' },
        { label: 'New mailing address', value: '15 Laurier Avenue West, Unit 204, Ottawa ON K1P 5J9' },
        { label: 'Effective date', value: 'May 14, 2026' },
        { label: 'Change duration', value: 'Permanent' },
        { label: 'Policies in scope', value: `${EMPIRE_ADDR_POLICY_ID} only (1 of 2 on file)` },
        { label: 'Documents attached', value: 'Mailing_address_change_form_whitfield.pdf, Bank_statement_May2026.pdf' },
      ],
    },
    aiActions: [
      {
        ts: '2026-05-14 11:09',
        actor: 'AI Agent',
        actorType: 'AI Agent',
        icon: 'ti-sparkles',
        dotCls: 'rp-tl-dot-ai',
        action: 'Request received and parsed',
        detail: `Address change form validated. Policy ${EMPIRE_ADDR_POLICY_ID} confirmed in force. Requester matched to insured ${EMPIRE_ADDR_CLIENT_NAME} (${EMPIRE_ADDR_CLIENT_ID}).`,
      },
      {
        ts: '2026-05-14 11:10',
        actor: 'AI Agent',
        actorType: 'AI Agent',
        icon: 'ti-sparkles',
        dotCls: 'rp-tl-dot-ai',
        action: 'Address verification — partial match',
        detail: 'Bank statement supports new street address. Lease lists "Apt 204" vs "Unit 204" on form — flagged for human confirmation. Government ID not required for in-province move.',
      },
      {
        ts: '2026-05-14 11:10',
        actor: 'AI Agent',
        actorType: 'AI Agent',
        icon: 'ti-sparkles',
        dotCls: 'rp-tl-dot-ai',
        action: 'OFAC screening completed',
        detail: 'LexisNexis Bridger Insight XG — clear result for Eleanor Whitfield and Ottawa address. No SDN or consolidated list matches.',
      },
      {
        ts: '2026-05-14 11:11',
        actor: 'System',
        actorType: 'System',
        icon: 'ti-bolt',
        dotCls: 'rp-tl-dot-system',
        action: 'Simple service task created',
        detail: `Task ${TASK_EMP_ADDR_001_ID} assigned to Victor Ramon. No claim case created — policy administration path only.`,
      },
    ],
    humanActions: [
      {
        ts: 'May 14, 2026',
        actor: 'Victor Ramon',
        actorType: 'Human',
        icon: 'ti-user',
        dotCls: 'rp-tl-dot-human',
        action: 'Past address history reviewed',
        detail: 'Confirmed Toronto-to-Ottawa move within Ontario. Client selected one policy only; Solution 10 whole life remains on Toronto mailing address.',
      },
    ],
    linkedObjects: [
      { kind: 'client', id: EMPIRE_ADDR_CLIENT_ID, label: EMPIRE_ADDR_CLIENT_NAME, href: `/folders/${EMPIRE_ADDR_CLIENT_ID}` },
      { kind: 'policy', id: EMPIRE_ADDR_POLICY_ID, label: EMPIRE_ADDR_POLICY_LABEL, href: `/folders/${EMPIRE_ADDR_POLICY_ID}` },
      { kind: 'task', id: TASK_EMP_ADDR_001_ID, label: 'Review address change request' },
      { kind: 'document', id: EMPIRE_ADDR_DOCUMENT_ID, label: `Address change form — ${EMPIRE_ADDR_CLIENT_NAME}.pdf` },
    ],
  },
];

export const EMPIRE_SIMPLE_TASK_RECORDS: DatasetTaskRecord[] = [
  {
    id: TASK_EMP_ADDR_001_ID,
    kind: 'task',
    taskId: TASK_EMP_ADDR_001_ID,
    label: 'Review address change request',
    status: 'In Queue',
    priority: 'High',
    assignee: 'Victor Ramon',
    assigneeKind: 'user',
    caseType: 'Service',
    caseSubtype: 'address_change',
    hasAI: true,
    aiGenerated: true,
    aiConfidence: 88,
    executionMode: 'semi_auto',
    aiSummary: `Update mailing address for ${EMPIRE_ADDR_CLIENT_NAME} on policy ${EMPIRE_ADDR_POLICY_ID}. National Address Registry verified the Ottawa address; confirm Apt vs Unit formatting before updating policy admin.`,
    summary: {
      contextLabel: 'Suggested next steps',
      title: 'Address change',
      description: `Policy service task for mailing address update on ${EMPIRE_ADDR_POLICY_ID}.`,
      checklist: [
        'Confirm Unit 204 vs Apt 204 variance between form and lease agreement',
        'Update policy admin mailing address after verification',
        'Send confirmation letter to new address',
      ],
    },
    aiNarrative: {
      text: 'Verified mailing address against the National Address Registry. Registry canonical format matches except for unit label — confirm Apt vs Unit before updating policy admin.',
      confidence: 88,
      generatedAt: 'May 14, 2026',
      generatedBy: 'AI Agent',
    },
    review: {
      verdict:
        'Verified the mailing address change against the National Address Registry. Registry canonical format matches the client request except for unit label (Apt vs Unit).',
      confidence: 88,
      crewSteps,
      addressDecision: {
        effectiveDate: 'May 14, 2026',
        clientRequestedAddress: '15 Laurier Avenue West, Unit 204, Ottawa ON K1P 5J9',
        registryName: 'National Address Registry',
        registryNote:
          'Registry returned one near-match at the same street address. Unit label differs: form shows Unit 204; registry canonical format is Apt 204.',
        options: [
          {
            id: 'registry-match',
            label: '15 Laurier Avenue West, Apt 204, Ottawa ON K1P 5J9',
            source: 'National Address Registry',
            recommended: true,
            diffNote: 'Recommended · registry canonical format (Apt vs Unit on form)',
          },
          {
            id: 'client-request',
            label: '15 Laurier Avenue West, Unit 204, Ottawa ON K1P 5J9',
            source: 'Client request',
            diffNote: 'As submitted on signed change form',
          },
        ],
        defaultOptionId: 'registry-match',
      },
      addressPolicyScope: {
        effectiveDate: 'May 14, 2026',
        duration: 'permanent',
        temporaryEndDate: 'May 31, 2026',
        temporaryNote: 'Return to permanent address on file after forwarding period',
        defaultSelectedPolicyIds: [EMPIRE_ADDR_POLICY_ID],
        policies: [
          {
            id: EMPIRE_ADDR_POLICY_ID,
            label: `${EMPIRE_ADDR_POLICY_ID} · ${EMPIRE_ADDR_PRODUCT}`,
            detail: 'Owner · In force',
            defaultSelected: true,
          },
          {
            id: EMPIRE_ADDR_SECOND_POLICY_ID,
            label: `${EMPIRE_ADDR_SECOND_POLICY_ID} · ${EMPIRE_ADDR_SECOND_POLICY_LABEL}`,
            detail: 'Owner · In force · Mailing address unchanged (Toronto ON)',
            defaultSelected: false,
          },
        ],
      },
    },
    evidenceDocuments: [
      {
        id: EMPIRE_ADDR_DOCUMENT_ID,
        name: `Address change form — ${EMPIRE_ADDR_CLIENT_NAME}.pdf`,
        size: '186 KB',
        category: 'Policy service',
        aiSummary: 'Signed address change form with effective date May 14, 2026.',
        followUps: 0,
      },
    ],
    contextCards: [],
    actions: [
      { type: 'complete', label: 'Approve', isPrimary: true },
      { type: 'request_info', label: 'Amend', isPrimary: false },
    ],
    product: EMPIRE_ADDR_PRODUCT,
    dueDate: '2026-05-17',
    stage: 'policy_service',
    slaRemaining: '2d',
    slaStatus: 'normal',
    origin: 'Client portal',
    sourceContext: 'Simple policy service — address change',
    createdFrom: { kind: 'request', id: EMPIRE_ADDR_REQUEST_ID, label: EMPIRE_ADDR_REQUEST_ID },
    createdDate: '2026-05-14',
    description: `Review and apply mailing address change for policyholder ${EMPIRE_ADDR_CLIENT_NAME}. No claim case — policy administration only.`,
    queue: 'my_tasks',
    requiredAuthorityLevel: 1,
    panelContext: {
      summaryStatus: 'In Queue',
      contextTitle: 'Simple tasks — Address change',
      contextSummary: `Update mailing address for ${EMPIRE_ADDR_CLIENT_NAME} on policy ${EMPIRE_ADDR_POLICY_ID}. National Address Registry verified the Ottawa address; confirm unit formatting before updating policy admin.`,
      suggestions: [
        'Confirm Unit 204 vs Apt 204 variance between form and lease agreement',
        'Update policy admin mailing address after verification',
        'Send confirmation letter to new address',
      ],
      evidenceDocumentId: EMPIRE_ADDR_DOCUMENT_ID,
    },
    linkedObjects: [
      { kind: 'request', id: EMPIRE_ADDR_REQUEST_ID, label: EMPIRE_ADDR_REQUEST_ID, href: '/requests#request=REQ-EMP-2026-007' },
      { kind: 'client', id: EMPIRE_ADDR_CLIENT_ID, label: EMPIRE_ADDR_CLIENT_NAME, href: `/folders/${EMPIRE_ADDR_CLIENT_ID}`, role: 'owner' },
      { kind: 'policy', id: EMPIRE_ADDR_POLICY_ID, label: EMPIRE_ADDR_POLICY_LABEL, href: `/folders/${EMPIRE_ADDR_POLICY_ID}` },
      { kind: 'document', id: EMPIRE_ADDR_DOCUMENT_ID, label: `Address change form — ${EMPIRE_ADDR_CLIENT_NAME}.pdf` },
    ],
  },
];

export const EMPIRE_SIMPLE_DOCUMENT_RECORDS: DatasetDocumentRecord[] = [
  {
    id: EMPIRE_ADDR_DOCUMENT_ID,
    kind: 'document',
    label: `Address change form — ${EMPIRE_ADDR_CLIENT_NAME}.pdf`,
    filename: 'Mailing_address_change_form_whitfield.pdf',
    category: 'Policy service',
    status: 'Received',
    uploaded: 'May 14, 2026',
    uploadedAt: '2026-05-14',
    source: 'client_portal',
    claimant: EMPIRE_ADDR_CLIENT_NAME,
    reqContext: `Signed address change request for policy ${EMPIRE_ADDR_POLICY_ID}.`,
    fileSize: '186 KB',
    fileType: 'PDF',
    fileAvailable: true,
    fileUrl: '/documents/equisoft/Mailing_address_change_form_whitfield.png',
    aiSummary: 'Signed address change form with new mailing address and effective date May 14, 2026.',
    aiAction: 'Review',
    linkedObjects: [
      { kind: 'client', id: EMPIRE_ADDR_CLIENT_ID, label: EMPIRE_ADDR_CLIENT_NAME },
      { kind: 'policy', id: EMPIRE_ADDR_POLICY_ID, label: EMPIRE_ADDR_POLICY_LABEL },
      { kind: 'request', id: EMPIRE_ADDR_REQUEST_ID, label: EMPIRE_ADDR_REQUEST_ID },
      { kind: 'task', id: TASK_EMP_ADDR_001_ID, label: 'Review address change request' },
    ],
  },
];

export const EMPIRE_SIMPLE_DOCUMENT_EVIDENCE: DocumentEvidenceRecord[] = [
  {
    id: 'evidence_doc_emp_addr_change_form',
    kind: 'document_evidence',
    documentId: EMPIRE_ADDR_DOCUMENT_ID,
    title: `Address change form — ${EMPIRE_ADDR_CLIENT_NAME}.pdf`,
    summary: 'Signed policyholder request to update mailing address.',
    pages: [
      {
        number: 1,
        image: '/documents/equisoft/Mailing_address_change_form_whitfield.png',
        label: 'Page 1',
      },
    ],
    findings: [
      {
        id: 'doc_emp_addr_change_form_anchor_1',
        severity: 'Medium',
        title: 'New address captured',
        quote: '15 Laurier Avenue West, Unit 204',
        reasoning: 'Form shows complete new mailing address with policyholder signature.',
        impact: `Supports updating correspondence address on policy ${EMPIRE_ADDR_POLICY_ID}.`,
      },
    ],
    linkedObjects: [
      { kind: 'client', id: EMPIRE_ADDR_CLIENT_ID, label: EMPIRE_ADDR_CLIENT_NAME },
      { kind: 'policy', id: EMPIRE_ADDR_POLICY_ID, label: EMPIRE_ADDR_POLICY_LABEL },
      { kind: 'request', id: EMPIRE_ADDR_REQUEST_ID, label: EMPIRE_ADDR_REQUEST_ID },
      { kind: 'task', id: TASK_EMP_ADDR_001_ID, label: 'Review address change request' },
    ],
  },
];

export function buildEmpireAddressChangeTask(status?: string): DatasetTaskRecord {
  const base = EMPIRE_SIMPLE_TASK_RECORDS[0];
  if (!base) {
    throw new Error('Empire address change task seed is missing');
  }
  if (!status || status === base.status) return base;
  return { ...base, status };
}
