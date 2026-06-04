import { getDocumentEvidence } from '../data/mock-document-evidence';
import type { SystemDataset } from '../data/multi-case-dataset';
import { getDocumentFileType } from '../data/documentMetadata';
import type { DynamicDocumentData } from '../components/DynamicDocumentSidePanel';
import type { CaseDocumentContextRow } from '../components/cases/caseViewTypes';

type CaseDocumentPanelMeta = {
  caseId: string;
  claimantName: string;
  policyNumber?: string;
};

export function buildCaseDocumentPanelData(
  document: CaseDocumentContextRow,
  meta: CaseDocumentPanelMeta,
  dataset: SystemDataset,
  legacyMockOverlayEnabled: boolean,
): DynamicDocumentData | null {
  const datasetEvidence = getDocumentEvidence(document.id, dataset);
  if (datasetEvidence) return datasetEvidence;

  return {
    documentId: document.name.replace(/\.[^.]+$/, '').slice(0, 12).toUpperCase(),
    documentTitle: document.name,
    category: `${document.category} document`,
    status: document.status,
    fileSize: document.fileSize ?? 'No file',
    fileType: document.fileType ?? getDocumentFileType(document.name),
    caseId: meta.caseId,
    caseReference: meta.policyNumber ?? meta.caseId,
    claimant: document.claimant ?? meta.claimantName,
    source: document.source,
    linkedRequirement: document.linkedRequirement,
    linkedRequirementHref: `/cases/${meta.caseId}#tab=requirements`,
    received: document.uploaded,
    totalPages: 12,
    pages: [
      { number: 2, image: '/evidence-medical-report-page-2.png', label: 'Physical examination' },
      { number: 3, image: '/evidence-medical-report-page.png', label: 'Medical history and plan' },
    ],
    summary: {
      label: 'Description',
      status: document.status,
      text: document.reqContext?.trim() || document.aiSummary,
    },
    evidence: legacyMockOverlayEnabled === false ? [] : [
      {
        id: 'treatment-gap',
        marker: 1,
        page: 3,
        severity: 'Medium',
        title: 'Confirm treatment continuity',
        quote: 'He has attended physiotherapy intermittently and was prescribed NSAIDs for pain relief.',
        reasoning: 'The report says physiotherapy was intermittent, but does not confirm visit frequency, duration, or adherence.',
        impact: 'Ask for treatment frequency before using this as recovery evidence.',
        tone: 'warning',
        highlight: { top: '35.0%', left: '2.4%', width: '93%', height: '3.2%' },
      },
      {
        id: 'rtw-gap',
        marker: 2,
        page: 3,
        severity: 'High',
        title: 'Request return-to-work plan',
        quote: 'Patient reports difficulty with prolonged sitting (>30 mins) and bending. Capable of light duties with restrictions.',
        reasoning: 'Restrictions are documented, but there is no timeline, activity plan, or employer accommodation path.',
        impact: 'Do not close the control gap until an RTW plan is requested.',
        tone: 'danger',
        highlight: { top: '64.3%', left: '2.4%', width: '93%', height: '6.2%' },
      },
    ],
    actions: [],
  };
}
