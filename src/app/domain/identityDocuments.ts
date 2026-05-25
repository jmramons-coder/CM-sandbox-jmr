/** Identity documents domain — party-scoped PII records with encryption, history, and audit. */

import type { EntityFolderDef } from './entityFolders';

export type PartyKind = 'client' | 'agent' | 'participant';

export type PartyContext = {
  partyId: string;
  partyKind: PartyKind;
  displayName: string;
};

export type IdentityDocumentAuditAction = 'create' | 'update' | 'delete' | 'unmask';

export type IdentityDocumentAuditEntry = {
  action: IdentityDocumentAuditAction;
  userId: string;
  timestamp: string;
};

export type UnmaskAuditEntry = {
  partyId: string;
  documentId: string;
  documentType: string;
  userId: string;
  timestamp: string;
};

/** Full snapshot retained on each CRUD operation (AC-22). */
export type IdentityDocumentHistoryEntry = {
  id: string;
  documentId: string;
  action: 'create' | 'update' | 'delete';
  snapshot: Omit<IdentityDocumentRecord, 'history' | 'auditLog'>;
  userId: string;
  timestamp: string;
};

export type IdentityDocumentRecord = {
  id: string;
  partyId: string;
  documentType: string;
  issuingJurisdiction: string;
  documentNumberEncrypted: string;
  issueDate: string | null;
  expiryDate: string | null;
  additionalInformation: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  history: IdentityDocumentHistoryEntry[];
  auditLog: IdentityDocumentAuditEntry[];
};

export type IdentityDocumentDraft = {
  id: string;
  documentType: string;
  issuingJurisdiction: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  additionalInformation: string;
};

export type IdentityDocumentValidationError = {
  field: keyof IdentityDocumentDraft | 'form';
  message: string;
};

export type IdentityDocumentFieldErrors = Partial<
  Record<keyof IdentityDocumentDraft, string>
>;

export function partyContextFromFolder(folder: EntityFolderDef): PartyContext {
  return {
    partyId: folder.id,
    partyKind: folder.type as PartyKind,
    displayName: folder.header.title,
  };
}

export function partyContextFromEntityRef(
  entityId: string,
  entityType: PartyKind,
  displayName: string,
): PartyContext {
  return { partyId: entityId, partyKind: entityType, displayName };
}
