import { describe, expect, it } from 'vitest';
import {
  createEmptyIdentityDocumentDraft,
  getExpiryDisplayStatus,
  hasValidationErrors,
  validateIdentityDocumentDraft,
} from './identityDocumentValidation';

describe('validateIdentityDocumentDraft', () => {
  it('requires document type', () => {
    const draft = { ...createEmptyIdentityDocumentDraft(), documentType: '' };
    const errors = validateIdentityDocumentDraft(draft);
    expect(errors.documentType).toBe('Document Type is required.');
  });

  it('requires issuing jurisdiction', () => {
    const draft = { ...createEmptyIdentityDocumentDraft(), documentType: 'Passport' };
    const errors = validateIdentityDocumentDraft(draft);
    expect(errors.issuingJurisdiction).toBe('Issuing Jurisdiction is required.');
  });

  it('requires document number with minimum length', () => {
    const draft = {
      ...createEmptyIdentityDocumentDraft(),
      documentType: 'Passport',
      issuingJurisdiction: 'Canada',
      documentNumber: 'AB',
    };
    const errors = validateIdentityDocumentDraft(draft);
    expect(errors.documentNumber).toBe('Document Number must be at least 3 characters.');
  });

  it('rejects future issue date', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const draft = {
      ...createEmptyIdentityDocumentDraft(),
      documentType: 'Passport',
      issuingJurisdiction: 'Canada',
      documentNumber: 'AB1234567',
      issueDate: future.toISOString().slice(0, 10),
    };
    const errors = validateIdentityDocumentDraft(draft);
    expect(errors.issueDate).toBe('Issue Date cannot be a future date.');
  });

  it('passes valid draft', () => {
    const draft = {
      ...createEmptyIdentityDocumentDraft(),
      documentType: 'Passport',
      issuingJurisdiction: 'Canada',
      documentNumber: 'AB1234567',
      issueDate: '2020-01-01',
    };
    expect(hasValidationErrors(validateIdentityDocumentDraft(draft))).toBe(false);
  });
});

describe('getExpiryDisplayStatus', () => {
  it('flags expired dates', () => {
    expect(getExpiryDisplayStatus('2000-01-01')).toBe('expired');
  });
});
