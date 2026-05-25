import { describe, expect, it, beforeEach } from 'vitest';
import {
  __resetIdentityDocumentsStore,
  createDocument,
  findDuplicateDocument,
  listActiveDocuments,
  softDeleteDocument,
} from './identityDocumentsRepository';
import { createEmptyIdentityDocumentDraft } from '../utils/identityDocumentValidation';
import { MASKED_DOCUMENT_NUMBER_DISPLAY } from '../utils/identityDocumentCrypto';

describe('identityDocumentsRepository', () => {
  beforeEach(() => {
    __resetIdentityDocumentsStore();
  });

  it('creates and lists active documents with masked storage', () => {
    const draft = {
      ...createEmptyIdentityDocumentDraft(),
      documentType: 'Passport',
      issuingJurisdiction: 'Canada',
      documentNumber: 'XY9876543',
    };
    createDocument('party-test', draft, 'user-1');
    const docs = listActiveDocuments('party-test');
    expect(docs).toHaveLength(1);
    expect(docs[0].documentNumberEncrypted).not.toBe('XY9876543');
    expect(docs[0].history.length).toBeGreaterThan(0);
  });

  it('detects duplicate documents', () => {
    const draft = {
      ...createEmptyIdentityDocumentDraft(),
      documentType: 'Passport',
      issuingJurisdiction: 'Quebec',
      documentNumber: 'DUPE12345',
    };
    createDocument('party-dup', draft, 'user-1');
    const dup = findDuplicateDocument('party-dup', 'Passport', 'Quebec', 'DUPE12345');
    expect(dup).toBeDefined();
  });

  it('soft-deletes and hides from list', () => {
    const draft = {
      ...createEmptyIdentityDocumentDraft(),
      documentType: 'Passport',
      issuingJurisdiction: 'Canada',
      documentNumber: 'DEL123456',
    };
    const created = createDocument('party-del', draft, 'user-1');
    softDeleteDocument('party-del', created.id, 'user-1');
    expect(listActiveDocuments('party-del')).toHaveLength(0);
  });

  it('seeds demo parties', () => {
    expect(listActiveDocuments('CLI-MARC').length).toBeGreaterThan(0);
    expect(listActiveDocuments('CLI-MARC')[0].documentType).toBeTruthy();
    expect(MASKED_DOCUMENT_NUMBER_DISPLAY).toBe('************');
  });
});
