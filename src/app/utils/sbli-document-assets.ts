/** Public preview assets for SBLI sandbox documents (`public/documents/sbli/`). */
export const SBLI_DOCUMENT_PREVIEW_BASE = '/documents/sbli';

const LEGACY_PLACEHOLDER_PREVIEW = '/evidence-medical-report-page.png';

/**
 * PNG basename per `doc_*` id. MIB uses unique names in a single folder.
 * Other docs: seed `filename` with `.pdf` → same basename with `.png`.
 */
export const SBLI_DOCUMENT_ASSET_BY_ID: Record<string, string> = {
  doc_wop_form_cd26: 'WOP_claim_form_bud.png',
  doc_employer_cd26: 'employer_letter_fastroute.png',
  doc_aps_cd26: 'APS_drchen_ortho.png',
  doc_surgical_cd26: 'surgical_report_stlukes.png',
  doc_policy_cd26: 'policy_SBLI_TL2021.png',
  doc_death_cert_cd44: 'certified_death_certificate.png',
  doc_aps_cd44: 'attending_physician_statement_aps.png',
  doc_mib_cd44: 'MIB_disclosure_comparison.png',
  doc_app_nb66: 'signed_application_form.png',
  doc_mib_nb66: 'mib_report_nb66.png',
  doc_mvr_nb66: 'mvr_motor_vehicle_report.png',
  doc_rx_nb66: 'prescription_history_check.png',
  doc_aps_nb66: 'APS_drkowalski_diabetes.png',
  doc_app_nb98: 'signed_sbli_online_application.png',
  doc_mib_nb98: 'mib_report_nb98.png',
  doc_uw_nb98: 'sbli_health_questionnaire_tele_interview.png',
  doc_addr_change_form: 'Address_change_form_whitfield.png',
  doc_beneficiary_change_form: 'Beneficiary_change_form_chen.png',
};

export function getSbliDocumentAssetBasename(documentId: string, filename?: string): string | null {
  if (SBLI_DOCUMENT_ASSET_BY_ID[documentId]) {
    return SBLI_DOCUMENT_ASSET_BY_ID[documentId];
  }
  if (!filename?.trim()) return null;
  return filename.replace(/\.pdf$/i, '.png');
}

export function getSbliDocumentPreviewUrl(documentId: string, filename?: string): string {
  const basename = getSbliDocumentAssetBasename(documentId, filename);
  if (!basename) return '';
  return `${SBLI_DOCUMENT_PREVIEW_BASE}/${basename}`;
}

export function isSbliSandboxDocumentId(documentId: string): boolean {
  return documentId.startsWith('doc_') && Boolean(getSbliDocumentAssetBasename(documentId));
}

export function resolveDocumentPreviewUrl(options: {
  documentId: string;
  filename?: string;
  fileUrl?: string;
  fileAvailable?: boolean;
  pageImage?: string;
  legacyFallback?: string;
}): string {
  if (options.fileAvailable === false) return '';
  if (options.fileUrl?.trim()) return options.fileUrl.trim();
  const sbli = getSbliDocumentPreviewUrl(options.documentId, options.filename);
  if (sbli) return sbli;
  const pageImage = options.pageImage?.trim();
  if (pageImage && pageImage !== LEGACY_PLACEHOLDER_PREVIEW) return pageImage;
  return options.legacyFallback ?? LEGACY_PLACEHOLDER_PREVIEW;
}
