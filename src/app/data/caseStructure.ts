import type {
  CaseContextCard,
  CaseGeneralInformation,
  CaseIdentification,
  CaseInformationSection,
  CaseRecord,
  CaseStructuredField,
  CaseTabConfiguration,
  CaseWorkflowState,
  ObjectRef,
} from '../domain/objectRefs';
import { getWorkflowDefinition } from '../domain/workflows';
import type { SystemDataset } from './multi-case-dataset';
import { resolveClaimSubType, claimSubTypeLabel } from '../domain/claimSubTypes';

function fieldFromSection(field: CaseRecord['sections'][number]['fields'][number]): CaseStructuredField {
  return {
    id: field.id,
    label: field.label,
    value: field.value,
    type: field.objectRef ? 'reference' : 'text',
    source: field.objectRef,
    enabled: true,
    muted: field.muted,
  };
}

function compactFields(fields: Array<CaseStructuredField | false | null | undefined>): CaseStructuredField[] {
  return fields.filter((field): field is CaseStructuredField => Boolean(field && field.value));
}

function getLinkedObject(record: CaseRecord, kind: ObjectRef['kind']) {
  return (record.linkedObjects ?? []).find((ref) => ref.kind === kind);
}

function makeSla(record: CaseRecord): CaseContextCard['sla'] {
  if (record.contextCard?.sla) return record.contextCard.sla;
  if (record.priority === 'Urgent' || record.priority === 'High') {
    return { label: 'Today', status: 'warning' };
  }
  return { label: '2d', status: 'normal' };
}

function buildIdentification(record: CaseRecord): CaseIdentification {
  const workflow = getWorkflowDefinition(record.workflowTemplateId);
  const claimSubtype =
    record.caseKind === 'claim' ? claimSubTypeLabel(resolveClaimSubType(record)) : '';
  const caseTypeLabel =
    claimSubtype || workflow?.caseNoun || workflow?.label || record.caseTypeCode;
  return {
    caseId: record.id,
    caseTypeId: record.workflowTemplateId,
    caseTypeLabel,
    status: record.status,
    statusCode: record.statusCode,
    externalIds: [
      ...(record.claimDetails?.claimNumber && record.claimDetails.claimNumber !== record.id
        ? [{ system: 'claims', value: record.claimDetails.claimNumber, label: 'Claim number' }]
        : []),
    ],
  };
}

function buildContextCard(record: CaseRecord, dataset: SystemDataset): CaseContextCard {
  const policyRef = getLinkedObject(record, 'policy');
  const applicationRef = getLinkedObject(record, 'application');
  const policy = dataset.policies.find((item) => item.id === policyRef?.id);
  const application = dataset.applications.find((item) => item.id === applicationRef?.id);
  const facts = record.facts ?? [];
  const benefitFact = facts.find((fact) => fact.category === 'financial' || fact.id === 'benefit');
  const productFact = facts.find((fact) => fact.id === 'product' || fact.category === 'application');
  const planRef = applicationRef ?? policyRef;

  const primaryParty = record.primaryParty ?? { kind: 'client' as const, id: `${record.id}-party`, label: 'Unknown' };
  return {
    primaryPartyRef: primaryParty,
    planRef,
    policyRef,
    applicationRef,
    headlineMetrics: compactFields([
      {
        id: 'primary-party',
        label: primaryParty.kind === 'agent' ? 'Agent' : record.caseKind === 'claim' ? 'Claimant' : 'Applicant',
        value: primaryParty.label ?? primaryParty.id,
        type: 'reference',
        source: primaryParty,
      },
      planRef && {
        id: 'plan',
        label: application ? 'Application' : 'Plan',
        value: application?.label ?? policy?.label ?? planRef.label ?? planRef.id,
        type: 'reference',
        source: planRef,
      },
      {
        id: 'product',
        label: 'Product',
        value: policy?.product ?? application?.product ?? productFact?.value ?? '',
        type: 'text',
        source: policyRef ?? applicationRef,
      },
      {
        id: 'monthly-benefit',
        label: 'Monthly benefit',
        value: policy?.monthlyBenefit ?? policy?.coverageAmount ?? benefitFact?.value ?? '',
        type: 'currency',
        source: policyRef,
      },
    ]),
    sla: makeSla(record),
  };
}

function buildWorkflowState(record: CaseRecord): CaseWorkflowState {
  const workflow = getWorkflowDefinition(record.workflowTemplateId);
  const activeIndex = workflow?.steps.findIndex((step) => step.id === record.activeStepId) ?? -1;
  return {
    templateId: record.workflowTemplateId,
    phaseId: record.phaseId,
    activeStepId: record.activeStepId,
    steps: workflow?.steps.map((step, index) => ({
      id: step.id,
      label: step.label,
      phaseId: step.phaseId,
      status: step.id === record.activeStepId ? 'active' : activeIndex >= 0 && index < activeIndex ? 'completed' : 'pending',
    })) ?? [],
  };
}

function buildTabs(record: CaseRecord): CaseTabConfiguration[] {
  return [
    { id: 'overview', label: 'General information', enabled: true },
    { id: 'requirements', label: 'Requirements', enabled: true, utilityEntity: 'requirement' },
    { id: 'tasks', label: 'Tasks', enabled: true, utilityEntity: 'task' },
    { id: 'decision', label: 'Decision', enabled: true },
    { id: 'communications', label: 'Communications', enabled: true, utilityEntity: 'communication' },
    { id: 'documents', label: 'Documents', enabled: true, utilityEntity: 'document' },
    { id: 'related_cases', label: 'Relationships', enabled: true },
    { id: 'history', label: 'Activities', enabled: true, utilityEntity: 'event' },
    ...(record.tabs ?? []).filter((tab) => !['overview', 'requirements', 'tasks', 'decision', 'communications', 'documents', 'related_cases', 'history'].includes(tab.id)),
  ];
}

function buildClaimInformation(record: CaseRecord): CaseInformationSection | null {
  if (!record.claimDetails) return null;
  return {
    id: 'claim-information',
    label: 'Claim information',
    enabled: true,
    fields: compactFields([
      {
        id: 'claim-sub-type',
        label: 'Claim sub-type',
        value: claimSubTypeLabel(resolveClaimSubType(record)),
        type: 'status',
      },
      { id: 'claim-number', label: 'Claim number', value: record.claimDetails.claimNumber ?? record.id, type: 'text' },
      { id: 'date-of-loss', label: 'Date of loss', value: record.claimDetails.dateOfLoss ?? '', type: 'date' },
      { id: 'disability-onset', label: 'Disability onset', value: record.claimDetails.disabilityOnset ?? '', type: 'date' },
      { id: 'cause', label: 'Cause', value: record.claimDetails.cause ?? '', type: 'text' },
      { id: 'pre-existing-conditions', label: 'Pre-existing conditions', value: record.claimDetails.preExistingConditions ?? '', type: 'text' },
      { id: 'claim-end-date', label: 'Claim end date', value: record.claimDetails.claimEndDate ?? '', type: 'date' },
    ]),
  };
}

function buildGeneralInformation(record: CaseRecord): CaseGeneralInformation {
  const rawSections = record.sections ?? [];
  const facts = record.facts ?? [];
  const existingSections = rawSections.map((section) => ({
    id: section.id,
    label: section.label,
    description: section.description,
    enabled: true,
    fields: section.fields.map(fieldFromSection),
  }));
  const claimInformation = buildClaimInformation(record);
  const factSection: CaseInformationSection | null = facts.length
    ? {
        id: 'case-facts',
        label: 'Case facts',
        enabled: true,
        fields: facts.map((fact) => ({
          id: fact.id,
          label: fact.label,
          value: fact.value,
          type: 'text',
          source: fact.sourceObject,
          enabled: true,
        })),
      }
    : null;

  const sections = [
    ...existingSections,
    ...(claimInformation && !existingSections.some((section) => section.id === claimInformation.id) ? [claimInformation] : []),
    ...(existingSections.length === 0 && factSection ? [factSection] : []),
  ];

  return { sections };
}

export function normalizeCaseStructure(record: CaseRecord, dataset: SystemDataset): CaseRecord {
  return {
    ...record,
    identification: record.identification ?? buildIdentification(record),
    contextCard: record.contextCard ?? buildContextCard(record, dataset),
    workflowState: record.workflowState ?? buildWorkflowState(record),
    tabs: record.tabs ?? buildTabs(record),
    generalInformation: record.generalInformation ?? buildGeneralInformation(record),
  };
}
