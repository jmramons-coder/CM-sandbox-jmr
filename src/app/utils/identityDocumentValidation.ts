import type { IdentityDocumentDraft, IdentityDocumentFieldErrors } from '../domain/identityDocuments';

const MS_PER_DAY = 86_400_000;
const MAX_YEARS_PAST = 100;
const MIN_DOCUMENT_NUMBER_LENGTH = 3;
const MAX_DOCUMENT_NUMBER_LENGTH = 50;
const MAX_ADDITIONAL_INFO_LENGTH = 500;

export function validateIdentityDocumentDraft(
  draft: IdentityDocumentDraft,
): IdentityDocumentFieldErrors {
  const errors: IdentityDocumentFieldErrors = {};

  if (!draft.documentType.trim()) {
    errors.documentType = 'Document Type is required.';
  }

  if (!draft.issuingJurisdiction.trim()) {
    errors.issuingJurisdiction = 'Issuing Jurisdiction is required.';
  }

  const docNumber = draft.documentNumber.trim();
  if (!docNumber) {
    errors.documentNumber = 'Document Number is required.';
  } else if (docNumber.length < MIN_DOCUMENT_NUMBER_LENGTH) {
    errors.documentNumber = 'Document Number must be at least 3 characters.';
  } else if (docNumber.length > MAX_DOCUMENT_NUMBER_LENGTH) {
    errors.documentNumber = `Document Number must be at most ${MAX_DOCUMENT_NUMBER_LENGTH} characters.`;
  }

  if (draft.issueDate) {
    const issue = parseDateOnly(draft.issueDate);
    const today = startOfToday();
    if (issue && issue > today) {
      errors.issueDate = 'Issue Date cannot be a future date.';
    } else if (issue && yearsBetween(issue, today) > MAX_YEARS_PAST) {
      errors.issueDate = 'Issue Date appears invalid. Please verify the date entered.';
    }
  }

  if (draft.expiryDate) {
    const expiry = parseDateOnly(draft.expiryDate);
    if (!expiry) {
      errors.expiryDate = 'Expiry Date must be a valid date.';
    }
  }

  if (draft.additionalInformation.length > MAX_ADDITIONAL_INFO_LENGTH) {
    errors.additionalInformation = `Additional Information must be at most ${MAX_ADDITIONAL_INFO_LENGTH} characters.`;
  }

  return errors;
}

export function hasValidationErrors(errors: IdentityDocumentFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export type ExpiryDisplayStatus = 'none' | 'warning' | 'expired';

export function getExpiryDisplayStatus(expiryDate: string | null): ExpiryDisplayStatus {
  if (!expiryDate) return 'none';
  const expiry = parseDateOnly(expiryDate);
  if (!expiry) return 'none';
  const today = startOfToday();
  if (expiry < today) return 'expired';
  const daysUntil = Math.ceil((expiry.getTime() - today.getTime()) / MS_PER_DAY);
  if (daysUntil <= 30) return 'warning';
  return 'none';
}

function parseDateOnly(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function yearsBetween(earlier: Date, later: Date): number {
  return (later.getTime() - earlier.getTime()) / (MS_PER_DAY * 365.25);
}

export function createEmptyIdentityDocumentDraft(): IdentityDocumentDraft {
  return {
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    documentType: '',
    issuingJurisdiction: '',
    documentNumber: '',
    issueDate: '',
    expiryDate: '',
    additionalInformation: '',
  };
}
