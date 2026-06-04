import { describe, expect, it } from 'vitest';
import { getDocumentEvidence } from './mock-document-evidence';
import { getSystemDataset, listDocuments } from './objectRepository';
import { EMPIRE_DEMO_CASE_IDS } from './empireDemoCaseIds';
import { empireFindingHasDedicatedHighlight } from '../utils/document-evidence-highlights';

const EMPIRE_NB_DOC_IDS = [
  'doc_emp_nb_app',
  'doc_emp_nb_needs',
  'doc_emp_nb_mib',
  'doc_emp_nb_lab_req',
  'doc_emp_nb_rx',
  'doc_emp_nb_scuba_sent',
  'doc_emp_nb_scuba_reminder',
  'doc_emp_nb_aps_request',
  'doc_emp_nb_add_ins_decline',
] as const;

describe('empire document previews', () => {
  const dataset = getSystemDataset('empire-ca-demo');
  const caseId = EMPIRE_DEMO_CASE_IDS.nbFullUw;

  it('exposes file previews for Amélie Dubois NB documents', () => {
    for (const documentId of EMPIRE_NB_DOC_IDS) {
      const row = dataset.documents.find((doc) => doc.id === documentId);
      expect(row?.fileAvailable, documentId).toBe(true);
      expect(row?.fileUrl, documentId).toContain('/documents/empire/');
    }
  });

  it('builds dynamic document panel data with at least one page image', () => {
    for (const documentId of EMPIRE_NB_DOC_IDS) {
      const evidence = getDocumentEvidence(documentId, dataset);
      expect(evidence, documentId).toBeTruthy();
      expect(evidence!.pages.length, documentId).toBeGreaterThan(0);
      expect(evidence!.pages[0]?.image?.trim(), documentId).toContain('/documents/empire/');
    }
  });

  it('seeds AI insights with document-specific anchors for each NB preview', () => {
    for (const documentId of EMPIRE_NB_DOC_IDS) {
      const evidence = getDocumentEvidence(documentId, dataset);
      expect(evidence?.evidence.length, documentId).toBeGreaterThan(0);
      for (const insight of evidence?.evidence ?? []) {
        expect(empireFindingHasDedicatedHighlight(insight.id), insight.id).toBe(true);
        expect(insight.highlight.top).toBeTruthy();
      }
    }
  });

  it('lists case documents in global module', () => {
    const docs = listDocuments(dataset, { caseId });
    for (const documentId of EMPIRE_NB_DOC_IDS) {
      expect(docs.some((doc) => doc.id === documentId)).toBe(true);
    }
  });
});
