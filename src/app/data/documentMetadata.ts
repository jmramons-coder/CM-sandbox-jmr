export function getDocumentFileType(fileName?: string, explicitType?: string): string {
  if (explicitType?.trim()) return explicitType.trim().toUpperCase();
  const extension = fileName?.split('.').pop();
  if (!extension || extension === fileName) return 'FILE';
  return extension.replace(/[^a-zA-Z0-9]+/g, '').toUpperCase() || 'FILE';
}

export function formatDocumentFileInfo(fileType?: string, fileSize?: string): string {
  return [fileType, fileSize].filter(Boolean).join(' · ');
}

const DOCUMENT_SOURCE_LABELS: Record<string, string> = {
  ai: 'AI Agent',
  ai_extraction: 'AI Extraction',
  ai_agent: 'AI Agent',
  ai_rule_engine: 'AI Rule Engine',
  claimant_upload: 'Claimant Upload',
  claimant_portal: 'Claimant Portal',
  client_portal: 'Client Portal',
  dataset_import: 'Dataset Import',
  employer_portal: 'Employer Portal',
  hospital_feed: 'Hospital Feed',
  id_verification: 'ID Verification',
  medical_provider: 'Medical Provider',
  metadata_only: 'Metadata Only',
  mib: 'MIB',
  mvr_system: 'MVR System',
  payroll_system: 'Payroll System',
  pharmacy_check: 'Pharmacy Check',
  physio_portal: 'Physio Portal',
  policy_admin: 'Policy Admin',
  specialist_upload: 'Specialist Upload',
  broker_portal: 'Broker Portal',
};

export function getDocumentSourceLabel(source: string): string {
  const key = source.trim().toLowerCase().replace(/\s+/g, '_');
  if (DOCUMENT_SOURCE_LABELS[key]) return DOCUMENT_SOURCE_LABELS[key];
  if (key.includes('_')) {
    return key
      .split('_')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  return source.trim();
}
