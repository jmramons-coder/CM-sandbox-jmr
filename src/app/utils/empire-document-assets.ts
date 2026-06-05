/** Public preview assets for Empire Life demo documents (`public/documents/empire/`). */
export const EMPIRE_DOCUMENT_PREVIEW_BASE = '/documents/empire';

/** Amélie Dubois · NB-2026-4401 document previews. */
export const EMPIRE_DOCUMENT_ASSET_BY_ID: Record<string, string> = {
  doc_emp_nb_app: 'application_solution20_amelie_dubois.png',
  doc_emp_nb_needs: 'advisor_needs_analysis_amelie_dubois.png',
  doc_emp_nb_mib: 'mib_results_amelie_dubois.png',
  doc_emp_nb_lab_req: 'lab_requisition_dynacare_ottawa.png',
  doc_emp_nb_rx: 'rx_report_intelliscript_amelie_dubois.png',
  doc_emp_nb_scuba_sent: 'scuba_questionnaire_portal_notification.png',
  doc_emp_nb_scuba_reminder: 'email_scuba_questionnaire_reminder.png',
  doc_emp_nb_aps_request: 'aps_request_clinique_plateau.png',
  doc_emp_nb_add_ins_decline: 'letter_add_insured_decline_luc_dubois.png',
};

export function getEmpireDocumentAssetBasename(documentId: string): string | null {
  return EMPIRE_DOCUMENT_ASSET_BY_ID[documentId] ?? null;
}

export function getEmpireDocumentPreviewUrl(documentId: string, _filename?: string): string {
  const basename = getEmpireDocumentAssetBasename(documentId);
  if (!basename) return '';
  return `${EMPIRE_DOCUMENT_PREVIEW_BASE}/${basename}`;
}

export function isEmpirePreviewDocumentId(documentId: string): boolean {
  return Boolean(EMPIRE_DOCUMENT_ASSET_BY_ID[documentId]);
}
