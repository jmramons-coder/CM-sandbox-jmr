import type { RequestCategory, RequestSourceChannel } from '../../types';

export type RequestCreationMode = 'external' | 'internal';

export type RequestCreationTemplate = {
  id: string;
  mode: RequestCreationMode;
  label: string;
  category: RequestCategory;
  description: string;
  defaultTitle: string;
  recipientHint?: string;
  defaultChannel: RequestSourceChannel;
};

export const REQUEST_CREATION_TEMPLATES: RequestCreationTemplate[] = [
  {
    id: 'ext-aps',
    mode: 'external',
    label: 'Attending Physician Statement (APS)',
    category: 'Evidence',
    description: 'Request the treating physician to complete the APS questionnaire.',
    defaultTitle: 'APS — request to attending physician',
    recipientHint: 'GP or specialist clinic',
    defaultChannel: 'email',
  },
  {
    id: 'ext-blood',
    mode: 'external',
    label: 'Lab / blood test request',
    category: 'Evidence',
    description: 'Order new bloodwork or specific lab panels from a partner lab.',
    defaultTitle: 'Lab work — bloods & metabolic panel',
    recipientHint: 'Lab partner / diagnostics provider',
    defaultChannel: 'email',
  },
  {
    id: 'ext-imaging',
    mode: 'external',
    label: 'Imaging report (MRI / CT / X-ray)',
    category: 'Evidence',
    description: 'Request imaging report or films from a hospital or imaging centre.',
    defaultTitle: 'Imaging report request',
    recipientHint: 'Hospital records office',
    defaultChannel: 'email',
  },
  {
    id: 'ext-hospital',
    mode: 'external',
    label: 'Hospital records request',
    category: 'Evidence',
    description: 'Request discharge summary, operative notes, or full chart.',
    defaultTitle: 'Hospital records request',
    recipientHint: 'Hospital medical records department',
    defaultChannel: 'email',
  },
  {
    id: 'ext-employer',
    mode: 'external',
    label: 'Employer attendance / income confirmation',
    category: 'General',
    description: 'Ask the employer to confirm earnings, role, or attendance.',
    defaultTitle: 'Employer confirmation letter',
    recipientHint: 'HR / payroll contact',
    defaultChannel: 'email',
  },
  {
    id: 'ext-pharmacy',
    mode: 'external',
    label: 'Pharmacy claim history',
    category: 'Evidence',
    description: 'Pull dispensed medication history from the claimant’s pharmacy.',
    defaultTitle: 'Pharmacy dispensing history',
    recipientHint: 'Pharmacy chain or provider integration',
    defaultChannel: 'email',
  },
  {
    id: 'int-qac',
    mode: 'internal',
    label: 'QAC form',
    category: 'General',
    description: 'Send the Quality Assurance Confirmation form to the client.',
    defaultTitle: 'QAC form — completion required',
    defaultChannel: 'client_portal',
  },
  {
    id: 'int-beneficiary',
    mode: 'internal',
    label: 'Beneficiary update form',
    category: 'Beneficiary Change',
    description: 'Ask the client to confirm or update beneficiary designations.',
    defaultTitle: 'Beneficiary update form',
    defaultChannel: 'client_portal',
  },
  {
    id: 'int-bank',
    mode: 'internal',
    label: 'Bank / payment method update',
    category: 'Payment',
    description: 'Capture an updated bank instruction or payment method.',
    defaultTitle: 'Update payment method',
    defaultChannel: 'client_portal',
  },
  {
    id: 'int-address',
    mode: 'internal',
    label: 'Proof of residence',
    category: 'Address Change',
    description: 'Request supporting proof of residence (utility bill, lease).',
    defaultTitle: 'Proof of residence',
    defaultChannel: 'email',
  },
  {
    id: 'int-id',
    mode: 'internal',
    label: 'Identity / KYC verification',
    category: 'General',
    description: 'Re-run KYC or capture a new identity document.',
    defaultTitle: 'Identity re-verification',
    defaultChannel: 'client_portal',
  },
  {
    id: 'int-signature',
    mode: 'internal',
    label: 'Signature / consent',
    category: 'General',
    description: 'Send a document for client e-signature or consent capture.',
    defaultTitle: 'Signature requested',
    defaultChannel: 'client_portal',
  },
];

export const ALL_CATEGORY_FILTER = 'All';

export function categoriesForMode(mode: RequestCreationMode): string[] {
  const set = new Set<string>();
  REQUEST_CREATION_TEMPLATES.filter((tpl) => tpl.mode === mode).forEach((tpl) => set.add(tpl.category));
  return [ALL_CATEGORY_FILTER, ...Array.from(set).sort()];
}

export function filterTemplates(mode: RequestCreationMode, categoryFilter: string): RequestCreationTemplate[] {
  return REQUEST_CREATION_TEMPLATES.filter(
    (tpl) => tpl.mode === mode && (categoryFilter === ALL_CATEGORY_FILTER || tpl.category === categoryFilter),
  );
}

export function findTemplate(id: string): RequestCreationTemplate | undefined {
  return REQUEST_CREATION_TEMPLATES.find((tpl) => tpl.id === id);
}

export function defaultTemplateForMode(mode: RequestCreationMode): RequestCreationTemplate {
  return REQUEST_CREATION_TEMPLATES.find((tpl) => tpl.mode === mode) ?? REQUEST_CREATION_TEMPLATES[0];
}
