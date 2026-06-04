import type { SystemDataset } from './multi-case-dataset';
import { getEquisoftDocumentPreviewUrl } from '../utils/sbli-document-assets';

export const SHARED_DEMO_NEUTRAL_CARRIER = {
  name: 'Harbor Life',
  policyPrefix: 'HARBOR-TL',
  onlineChannel: 'harborlife.com',
  datasetLabel: 'US demo cases',
  environmentFit:
    'Four US life-insurance demo cases (claims and new business) with tasks, requirements, documents, and evidence.',
  description:
    'Shared demo dataset for Equisoft and carrier-branded environments. Four cases with full task, requirement, document, and evidence coverage.',
} as const;

/** Longest phrases first so partial replacements do not corrupt longer labels. */
const STRING_REPLACEMENTS: ReadonlyArray<{ from: string; to: string }> = [
  { from: 'SBLI Simple Term Life', to: 'Simple Term Life' },
  { from: 'SBLI Term Life 20', to: 'Term Life 20' },
  { from: 'SBLI Death Benefit Claim Form', to: 'Death Benefit Claim Form' },
  { from: 'SBLI WOP Claim Form', to: 'Waiver of Premium Claim Form' },
  { from: 'SBLI Simple Term Life Online Application', to: 'Simple Term Life Online Application' },
  { from: 'SBLI Term Life 20 Application', to: 'Term Life 20 Application' },
  { from: 'SBLI Claimant Portal', to: 'Client portal' },
  { from: 'SBLI Broker Portal', to: 'Broker portal' },
  { from: 'SBLI broker portal', to: 'Broker portal' },
  { from: 'SBLI claimant portal', to: 'Client portal' },
  { from: 'SBLI.com (direct online)', to: 'harborlife.com (direct online)' },
  { from: 'SBLI.com', to: SHARED_DEMO_NEUTRAL_CARRIER.onlineChannel },
  { from: 'SBLI-TL-', to: `${SHARED_DEMO_NEUTRAL_CARRIER.policyPrefix}-` },
  { from: 'SBLI WOP', to: 'Waiver of Premium' },
  { from: 'SBLI demo cases', to: SHARED_DEMO_NEUTRAL_CARRIER.datasetLabel },
  { from: 'SBLI demo workload', to: 'US demo workload' },
  { from: 'SBLI', to: SHARED_DEMO_NEUTRAL_CARRIER.name },
];

const SKIP_VALUE_KEYS = new Set([
  'schemaVersion',
  'generationProfileId',
  'sourceCaseNumber',
  'caseTypeCode',
  'workflowTemplateId',
  'caseTypeId',
  'taskId',
  'linkedCaseId',
  'linkedRequirementId',
  'clientId',
]);

/** Stable foreign keys — policy numbers (SBLI-TL-*) are rewritten consistently across refs. */
function isStableIdentifier(value: string): boolean {
  if (value.includes('/documents/sbli/')) return true;
  if (/^CD\d{2}-\d+$/.test(value)) return true;
  if (/^NB\d{2}-\d+$/.test(value)) return true;
  if (/^REQ-\d{4}-\d+$/i.test(value)) return true;
  if (/^req_[a-z0-9_]+$/i.test(value)) return true;
  if (/^task_[a-z0-9_]+$/i.test(value)) return true;
  if (/^doc_[a-z0-9_]+$/i.test(value)) return true;
  if (/^usr-[a-z0-9-]+$/i.test(value)) return true;
  if (/^cli_[a-z0-9_]+$/i.test(value)) return true;
  if (/^agent_[a-z0-9_]+$/i.test(value)) return true;
  if (/^app_[a-z0-9_]+$/i.test(value)) return true;
  if (/^pol_[a-z0-9_]+$/i.test(value)) return true;
  return false;
}

function shouldSkipStringReplacement(key: string | undefined, value: string): boolean {
  if (key && SKIP_VALUE_KEYS.has(key)) return true;
  if (key === 'id' || key === 'policyNumber') {
    return isStableIdentifier(value);
  }
  if (isStableIdentifier(value)) return true;
  return false;
}

function applyStringReplacements(text: string): string {
  let result = text;
  for (const { from, to } of STRING_REPLACEMENTS) {
    if (!result.includes(from)) continue;
    result = result.split(from).join(to);
  }
  return result;
}

function neutralizeValue(value: unknown, key?: string): unknown {
  if (typeof value === 'string') {
    if (shouldSkipStringReplacement(key, value)) return value;
    return applyStringReplacements(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => neutralizeValue(item));
  }
  if (value && typeof value === 'object') {
    return neutralizeRecord(value as Record<string, unknown>);
  }
  return value;
}

function neutralizeRecord(record: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    next[key] = neutralizeValue(value, key);
  }
  return next;
}

/** Harbor Life address-change form preview for Equisoft default (SBLI keeps `/documents/sbli/`). */
export function applyEquisoftDocumentPreviewOverrides(dataset: SystemDataset): SystemDataset {
  const addrFormUrl = getEquisoftDocumentPreviewUrl('doc_addr_change_form');
  if (!addrFormUrl) return dataset;

  return {
    ...dataset,
    documents: dataset.documents.map((doc) =>
      doc.id === 'doc_addr_change_form'
        ? { ...doc, fileUrl: addrFormUrl, fileAvailable: true, placeholderReason: undefined }
        : doc,
    ),
    documentEvidence: dataset.documentEvidence.map((evidence) =>
      evidence.documentId === 'doc_addr_change_form'
        ? {
            ...evidence,
            pages: evidence.pages.map((page) => ({ ...page, image: addrFormUrl })),
          }
        : evidence,
    ),
  };
}

export function neutralizeSharedDemoDataset(dataset: SystemDataset): SystemDataset {
  const clone = structuredClone(dataset) as SystemDataset;
  const neutralized = neutralizeRecord(clone as unknown as Record<string, unknown>) as unknown as SystemDataset;

  return applyEquisoftDocumentPreviewOverrides({
    ...neutralized,
    label: SHARED_DEMO_NEUTRAL_CARRIER.datasetLabel,
    organizationLabel: SHARED_DEMO_NEUTRAL_CARRIER.name,
    environmentFit: SHARED_DEMO_NEUTRAL_CARRIER.environmentFit,
    description: SHARED_DEMO_NEUTRAL_CARRIER.description,
  });
}

export function applyNeutralCarrierToText(text: string): string {
  return applyStringReplacements(text);
}

export function usesSbliBrandedDemoData(demoEnvironmentId: string | null | undefined): boolean {
  return demoEnvironmentId === 'demo-sbli';
}
