import type { DynamicDocumentData } from '../components/DynamicDocumentSidePanel';
import { resolveDocumentFindingHighlight } from '../utils/document-evidence-highlights';
import { resolveDocumentPreviewUrl } from '../utils/sbli-document-assets';
import type { SystemDataset } from './multi-case-dataset';
import { getDocumentFileType, getDocumentSourceLabel } from './documentMetadata';

export const MOCK_DOCUMENT_EVIDENCE: Record<string, DynamicDocumentData> = {
  'DOC-1001': {
    documentId: 'DOC-1001',
    documentTitle: 'Address Change Verification Package.pdf',
    category: 'Client portal request',
    status: 'Partial match',
    fileSize: '640 KB',
    fileType: 'PDF',
    caseId: 'IP26-5546112',
    caseReference: 'REQ-24001',
    claimant: 'Billy Bud',
    source: 'Client Portal',
    linkedRequirement: 'Address Verification',
    linkedRequirementHref: '/cases/IP26-5546112#tab=requirements',
    received: 'May 15, 2026, 2:22 PM EST',
    totalPages: 1,
    pages: [
      {
        number: 1,
        image: '/request-adress_change-dd2100ce-bebe-4031-ab3a-45dc96d1e07b.png',
        label: 'Address change verification',
      },
    ],
    summary: {
      label: 'Verification summary',
      status: 'Partial match',
      text: 'The requested new mailing address is supported by the bank statement and external verification service, but the utility bill uses a different unit format and the required government-issued ID was not provided.',
      contextTitle: 'Why this request matters',
      contextText:
        'This package determines whether Billy Bud’s mailing address can be updated for claim correspondence and policy records. The request can proceed only after the partial address match is reviewed and the missing identity document is collected.',
    },
    evidence: [
      {
        id: 'unit-format-variance',
        marker: 1,
        page: 1,
        severity: 'Medium',
        title: 'Confirm unit-format variance',
        quote: 'Utility Bill: 440 King St #18, Toronto, ON M5A 1N6. Requested Address: 440 King Street East, Apt 18B, Toronto, ON M5A 1N6.',
        reasoning: 'The address lines are substantially similar, but the uploaded utility bill uses “#18” while the client requested “Apt 18B”. The package flags this as a partial match.',
        impact: 'Confirm whether the unit values refer to the same residence before updating policy records.',
        tone: 'warning',
        highlight: resolveDocumentFindingHighlight('unit-format-variance'),
      },
      {
        id: 'missing-government-id',
        marker: 2,
        page: 1,
        severity: 'High',
        title: 'Government-issued ID missing',
        quote: 'Government-issued ID — Missing.',
        reasoning: 'The supporting document checklist marks the government-issued ID as missing, so full identity verification is incomplete.',
        impact: 'Request the missing ID before accepting the address change as fully verified.',
        tone: 'danger',
        highlight: resolveDocumentFindingHighlight('missing-government-id'),
      },
      {
        id: 'client-statement-scope',
        marker: 3,
        page: 1,
        severity: 'Medium',
        title: 'Confirm update scope',
        quote: 'This change should apply to: Claim Correspondence, Policy Records. Billing Statements is not selected.',
        reasoning: 'The client selected claim correspondence and policy records only. Billing statement address updates may require a separate confirmation.',
        impact: 'Update only the selected records unless the claimant confirms billing statements should also change.',
        tone: 'warning',
        highlight: resolveDocumentFindingHighlight('client-statement-scope'),
      },
    ],
    actions: [
      { id: 'confirm-unit-format', label: 'Confirm unit format' },
      { id: 'request-government-id', label: 'Request government ID' },
      { id: 'approve-address-change', label: 'Approve selected updates', variant: 'primary' },
    ],
  },
};

function getDatasetDocumentEvidence(documentId: string, dataset?: SystemDataset): DynamicDocumentData | null {
  if (!dataset) return null;
  const evidence = dataset.documentEvidence.find((item) => item.documentId === documentId);
  const document = dataset.documents.find((item) => item.id === documentId);
  if (!evidence && !document) return null;
  const caseId = document?.linkedObjects?.find((ref) => ref.kind === 'case')?.id;
  const caseRecord = caseId ? dataset.cases.find((item) => item.id === caseId) : undefined;
  return {
    documentId,
    documentTitle: document?.label ?? evidence?.title ?? documentId,
    category: document?.category ?? 'Dataset evidence',
    status: document?.status ?? 'Pending Review',
    fileSize: document?.fileSize ?? 'Metadata only',
    fileType: getDocumentFileType(document?.label ?? evidence?.title, document?.fileType),
    caseId: caseId ?? 'N/A',
    caseReference: caseId ?? 'N/A',
    claimant: caseRecord?.primaryParty.label ?? 'Dataset',
    source: getDocumentSourceLabel(document?.source ?? 'dataset'),
    linkedRequirement: document?.linkedRequirement ?? 'Dataset evidence',
    linkedRequirementHref: caseId ? `/cases/${caseId}#tab=requirements` : '/cases',
    received: document?.uploaded ?? 'N/A',
    totalPages: evidence?.pages.length ?? 1,
    pages: evidence?.pages.map((page) => ({
      number: page.number,
      image: resolveDocumentPreviewUrl({
        documentId,
        filename: document?.filename,
        fileUrl: document?.fileUrl,
        fileAvailable: document?.fileAvailable,
        pageImage: page.image,
        legacyFallback: '/request-adress_change-dd2100ce-bebe-4031-ab3a-45dc96d1e07b.png',
      }),
      label: page.label,
    })) ?? [
      {
        number: 1,
        image: resolveDocumentPreviewUrl({
          documentId,
          filename: document?.filename,
          fileUrl: document?.fileUrl,
          fileAvailable: document?.fileAvailable,
          legacyFallback: '/request-adress_change-dd2100ce-bebe-4031-ab3a-45dc96d1e07b.png',
        }),
        label: document?.label ?? 'Document metadata',
      },
    ],
    summary: {
      label: 'Dataset evidence summary',
      status: document?.status ?? 'Metadata',
      text: evidence?.summary ?? document?.aiSummary ?? document?.placeholderReason ?? 'Dataset document metadata is available.',
      contextTitle: 'Why this document matters',
      contextText: document?.reqContext ?? `This evidence is linked to ${caseRecord?.title ?? caseId ?? 'the active data context'}.`,
    },
    evidence: evidence?.findings.map((finding, index) => ({
      id: finding.id,
      marker: index + 1,
      page: 1,
      severity: finding.severity,
      title: finding.title,
      quote: finding.quote ?? finding.title,
      reasoning: finding.reasoning,
      impact: finding.impact,
      tone: finding.severity === 'High' ? 'danger' : 'warning',
      highlight: resolveDocumentFindingHighlight(finding.id, index),
    })) ?? [],
    scoringContext: document?.scoringContext,
    actions: [
      { id: 'mark-reviewed', label: 'Mark evidence reviewed', variant: 'primary' },
    ],
  };
}

export function getDocumentEvidence(documentId?: string, dataset?: SystemDataset): DynamicDocumentData | null {
  if (!documentId) return null;
  const datasetEvidence = getDatasetDocumentEvidence(documentId, dataset);
  if (datasetEvidence) return datasetEvidence;
  return MOCK_DOCUMENT_EVIDENCE[documentId] ?? null;
}
