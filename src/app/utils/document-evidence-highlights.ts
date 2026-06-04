export type DocumentHighlightRect = {
  top: string;
  left: string;
  width: string;
  height: string;
};

/** Body-text highlights align to the document's left margin (medical letters). */
const BODY_TEXT_LEFT = 2.4;
const BODY_TEXT_WIDTH = 93;

/** Claim / intake forms — left column field blocks (left ≥ 18% skips body-text nudge). */
const FORM_FIELD_LEFT = 20;
const FORM_FIELD_WIDTH = 72;

/** Full-width form section blocks (Harbor Life / neutral address-change form). */
const FORM_SECTION_LEFT = 6;
const FORM_SECTION_WIDTH = 88;

export type DocumentHighlightPreviewVariant = 'sbli' | 'equisoft';

const FINDING_HIGHLIGHT_BY_ID: Record<string, DocumentHighlightRect> = {
  // Attending Physician Statement (Dr. Chen ortho)
  doc_aps_cd26_anchor_1: { top: '37.8%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '5.8%' },
  doc_aps_cd26_anchor_2: { top: '52.4%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '13.5%' },
  doc_aps_cd26_anchor_3: { top: '71.6%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '8.2%' },
  // Surgical report (St. Luke's) — distinct layout from APS
  doc_surgical_cd26_anchor_1: { top: '22%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '8%' },
  doc_surgical_cd26_anchor_2: { top: '48%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '14%' },
  // WOP claim form
  doc_wop_form_cd26_anchor_1: { top: '34%', left: `${FORM_FIELD_LEFT}%`, width: `${FORM_FIELD_WIDTH}%`, height: '7%' },
  // Employer confirmation letter
  doc_employer_cd26_anchor_1: { top: '40%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '6%' },
  doc_employer_cd26_anchor_2: { top: '58%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '9%' },
  // Policy certificate
  doc_policy_cd26_anchor_1: { top: '45%', left: '10%', width: '80%', height: '12%' },
  // MIB disclosure comparison (CD44)
  doc_mib_cd44_anchor_1: { top: '32%', left: '6%', width: '88%', height: '10%' },
  doc_mib_cd44_anchor_2: { top: '52%', left: '6%', width: '88%', height: '12%' },
  // Death certificate (CD44)
  doc_death_cert_cd44_anchor_1: { top: '38%', left: '12%', width: '76%', height: '8%' },
  doc_death_cert_cd44_anchor_2: { top: '52%', left: '12%', width: '76%', height: '8%' },
  // Attending physician statement (CD44)
  doc_aps_cd44_anchor_1: { top: '36%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '7%' },
  doc_aps_cd44_anchor_2: { top: '54%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '11%' },
  // Simple service — address / beneficiary forms (SBLI Policy Service Request layout)
  doc_addr_change_form_anchor_1: {
    top: '34.2%',
    left: `${FORM_SECTION_LEFT}%`,
    width: `${FORM_SECTION_WIDTH}%`,
    height: '14.8%',
  },
  doc_beneficiary_change_form_anchor_1: { top: '46%', left: `${FORM_FIELD_LEFT}%`, width: `${FORM_FIELD_WIDTH}%`, height: '9%' },
  // Legacy mock request package (DOC-1001)
  'missing-government-id': { top: '52.0%', left: `${BODY_TEXT_LEFT}%`, width: '68%', height: '3.4%' },
  'client-statement-scope': { top: '27.1%', left: '58%', width: '36%', height: '10%' },
  'unit-format-variance': { top: '61.6%', left: '28%', width: '48%', height: '11.2%' },
  // Empire Life · Amélie Dubois NB-2026-4401 (682×1024 portrait unless noted)
  // Application — page 1: Section C coverage, Section B tobacco, Section D child rider
  doc_emp_nb_app_anchor_1: { top: '50.5%', left: `${FORM_FIELD_LEFT}%`, width: '44%', height: '7.5%' },
  doc_emp_nb_app_anchor_2: { top: '41%', left: `${FORM_FIELD_LEFT}%`, width: '38%', height: '5.5%' },
  doc_emp_nb_app_anchor_3: { top: '65.5%', left: `${FORM_FIELD_LEFT}%`, width: `${FORM_FIELD_WIDTH}%`, height: '14%' },
  // Needs analysis — §3 coverage gap bar (main column), §4 Solution 20 recommendation (exclude sidebar)
  doc_emp_nb_needs_anchor_1: { top: '49%', left: `${FORM_FIELD_LEFT}%`, width: '58%', height: '6%' },
  doc_emp_nb_needs_anchor_2: { top: '63%', left: `${FORM_FIELD_LEFT}%`, width: '58%', height: '9%' },
  // MIB — applicant block, CLEAR result banner
  doc_emp_nb_mib_anchor_1: { top: '43.5%', left: `${FORM_SECTION_LEFT}%`, width: `${FORM_SECTION_WIDTH}%`, height: '9%' },
  doc_emp_nb_mib_anchor_2: { top: '23.5%', left: `${FORM_SECTION_LEFT}%`, width: `${FORM_SECTION_WIDTH}%`, height: '13%' },
  // Lab requisition — status (top-left), tests ordered table
  doc_emp_nb_lab_req_anchor_1: { top: '52.5%', left: `${FORM_SECTION_LEFT}%`, width: `${FORM_SECTION_WIDTH}%`, height: '19%' },
  doc_emp_nb_lab_req_anchor_2: { top: '13.5%', left: `${FORM_SECTION_LEFT}%`, width: '44%', height: '7%' },
  // Rx report — prescription rows, clinical summary flag
  doc_emp_nb_rx_anchor_1: { top: '43.5%', left: `${FORM_SECTION_LEFT}%`, width: `${FORM_SECTION_WIDTH}%`, height: '10%' },
  doc_emp_nb_rx_anchor_2: { top: '52.5%', left: `${FORM_SECTION_LEFT}%`, width: `${FORM_SECTION_WIDTH}%`, height: '5.5%' },
  doc_emp_nb_rx_anchor_3: { top: '62%', left: `${FORM_SECTION_LEFT}%`, width: `${FORM_SECTION_WIDTH}%`, height: '10%' },
  // Advisor portal notification (1024×682 landscape — main panel ~28% from left)
  doc_emp_nb_scuba_sent_anchor_1: { top: '18%', left: '28%', width: '67%', height: '11%' },
  doc_emp_nb_scuba_sent_anchor_2: { top: '44%', left: '28%', width: '64%', height: '16%' },
  // Email reminder (1024×682 landscape)
  doc_emp_nb_scuba_reminder_anchor_1: { top: '29%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '11%' },
  doc_emp_nb_scuba_reminder_anchor_2: { top: '41.5%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '7.5%' },
  // APS draft — DRAFT banner, clinical reason box, physician/clinic block
  doc_emp_nb_aps_request_anchor_1: { top: '5.5%', left: '58%', width: '36%', height: '6.5%' },
  doc_emp_nb_aps_request_anchor_2: { top: '45.5%', left: `${FORM_SECTION_LEFT}%`, width: `${FORM_SECTION_WIDTH}%`, height: '10%' },
  doc_emp_nb_aps_request_anchor_3: { top: '36%', left: `${FORM_SECTION_LEFT}%`, width: `${FORM_SECTION_WIDTH}%`, height: '9%' },
  // Decline letter — subject + decline paragraph, scuba conflict, primary still active
  doc_emp_nb_add_ins_decline_anchor_1: { top: '42%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '8.5%' },
  doc_emp_nb_add_ins_decline_anchor_2: { top: '53.5%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '9%' },
  doc_emp_nb_add_ins_decline_anchor_3: { top: '63%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '7.5%' },
};

/** Harbor Life mailing-address form (`Mailing_address_change_form_whitfield.png`). */
const EQUISOFT_FINDING_HIGHLIGHT_BY_ID: Record<string, DocumentHighlightRect> = {
  doc_addr_change_form_anchor_1: {
    top: '30.8%',
    left: `${FORM_SECTION_LEFT}%`,
    width: `${FORM_SECTION_WIDTH}%`,
    height: '11.4%',
  },
};

const DEFAULT_BODY_HIGHLIGHTS: DocumentHighlightRect[] = [
  { top: '37.8%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '5.8%' },
  { top: '52.4%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '12%' },
  { top: '71.6%', left: `${BODY_TEXT_LEFT}%`, width: `${BODY_TEXT_WIDTH}%`, height: '8%' },
];

/**
 * Nudge margin-aligned highlights further left so wrapped body copy is fully covered.
 * Skips column-positioned regions (e.g. right-side form fields) where left is already far right.
 */
export function normalizeDocumentHighlight(rect: DocumentHighlightRect): DocumentHighlightRect {
  const leftPct = Number.parseFloat(rect.left);
  const widthPct = Number.parseFloat(rect.width);

  if (leftPct >= 18) {
    return rect;
  }

  const targetLeft = Math.min(leftPct, BODY_TEXT_LEFT);
  const leftDelta = leftPct - targetLeft;
  const nextWidth = Math.min(98 - targetLeft, widthPct + leftDelta + 1.5);

  return {
    top: rect.top,
    left: `${targetLeft}%`,
    width: `${nextWidth}%`,
    height: rect.height,
  };
}

export function resolveDocumentFindingHighlight(
  findingId: string,
  fallbackIndex = 0,
  options?: { previewVariant?: DocumentHighlightPreviewVariant },
): DocumentHighlightRect {
  const variantPreset =
    options?.previewVariant === 'equisoft'
      ? EQUISOFT_FINDING_HIGHLIGHT_BY_ID[findingId]
      : undefined;
  const preset = variantPreset ?? FINDING_HIGHLIGHT_BY_ID[findingId];
  const rect = preset ?? DEFAULT_BODY_HIGHLIGHTS[fallbackIndex % DEFAULT_BODY_HIGHLIGHTS.length];
  return normalizeDocumentHighlight(rect);
}

export function resolveDocumentPreviewHighlightVariant(
  previewUrl: string,
): DocumentHighlightPreviewVariant | undefined {
  if (previewUrl.includes('/documents/equisoft/')) return 'equisoft';
  if (previewUrl.includes('/documents/sbli/')) return 'sbli';
  if (previewUrl.includes('/documents/empire/')) return 'sbli';
  return undefined;
}

export const EMPIRE_NB_AMELIE_FINDING_IDS = [
  'doc_emp_nb_app_anchor_1',
  'doc_emp_nb_app_anchor_2',
  'doc_emp_nb_app_anchor_3',
  'doc_emp_nb_needs_anchor_1',
  'doc_emp_nb_needs_anchor_2',
  'doc_emp_nb_mib_anchor_1',
  'doc_emp_nb_mib_anchor_2',
  'doc_emp_nb_lab_req_anchor_1',
  'doc_emp_nb_lab_req_anchor_2',
  'doc_emp_nb_rx_anchor_1',
  'doc_emp_nb_rx_anchor_2',
  'doc_emp_nb_rx_anchor_3',
  'doc_emp_nb_scuba_sent_anchor_1',
  'doc_emp_nb_scuba_sent_anchor_2',
  'doc_emp_nb_scuba_reminder_anchor_1',
  'doc_emp_nb_scuba_reminder_anchor_2',
  'doc_emp_nb_aps_request_anchor_1',
  'doc_emp_nb_aps_request_anchor_2',
  'doc_emp_nb_aps_request_anchor_3',
  'doc_emp_nb_add_ins_decline_anchor_1',
  'doc_emp_nb_add_ins_decline_anchor_2',
  'doc_emp_nb_add_ins_decline_anchor_3',
] as const;

export function empireFindingHasDedicatedHighlight(findingId: string): boolean {
  return Boolean(FINDING_HIGHLIGHT_BY_ID[findingId]);
}

/** Every SBLI seeded finding id should resolve to a document-specific preset (not generic fallback). */
export const SBLI_DOCUMENT_FINDING_IDS = [
  'doc_aps_cd26_anchor_1',
  'doc_aps_cd26_anchor_2',
  'doc_aps_cd26_anchor_3',
  'doc_surgical_cd26_anchor_1',
  'doc_surgical_cd26_anchor_2',
  'doc_wop_form_cd26_anchor_1',
  'doc_employer_cd26_anchor_1',
  'doc_employer_cd26_anchor_2',
  'doc_policy_cd26_anchor_1',
  'doc_mib_cd44_anchor_1',
  'doc_mib_cd44_anchor_2',
  'doc_death_cert_cd44_anchor_1',
  'doc_death_cert_cd44_anchor_2',
  'doc_aps_cd44_anchor_1',
  'doc_aps_cd44_anchor_2',
  'doc_addr_change_form_anchor_1',
  'doc_beneficiary_change_form_anchor_1',
] as const;

export function sbliFindingHasDedicatedHighlight(findingId: string): boolean {
  return Boolean(FINDING_HIGHLIGHT_BY_ID[findingId]);
}
