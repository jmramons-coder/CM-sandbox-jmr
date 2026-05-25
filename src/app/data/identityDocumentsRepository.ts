import type {
  IdentityDocumentAuditEntry,
  IdentityDocumentDraft,
  IdentityDocumentHistoryEntry,
  IdentityDocumentRecord,
  UnmaskAuditEntry,
} from '../domain/identityDocuments';
import { encryptDocumentNumber } from '../utils/identityDocumentCrypto';
import { findJurisdictionByLabel } from './issuingJurisdictions';

const STORAGE_KEY = 'amplify-identity-documents';
const UNMASK_AUDIT_KEY = 'amplify-identity-documents-unmask-audit';

type Store = Record<string, IdentityDocumentRecord[]>;

let memoryStore: Store | null = null;

function canPersistToLocalStorage(): boolean {
  return (
    typeof localStorage !== 'undefined'
    && typeof localStorage.getItem === 'function'
    && typeof localStorage.setItem === 'function'
  );
}

function loadStore(): Store {
  if (memoryStore) return memoryStore;
  if (!canPersistToLocalStorage()) {
    memoryStore = seedInitialStore();
    return memoryStore;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    memoryStore = raw ? normalizeStore(JSON.parse(raw) as Store) : seedInitialStore();
    persistStore(memoryStore);
  } catch {
    memoryStore = seedInitialStore();
  }
  return memoryStore;
}

function persistStore(store: Store): void {
  memoryStore = store;
  if (canPersistToLocalStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function snapshotRecord(record: IdentityDocumentRecord): IdentityDocumentHistoryEntry['snapshot'] {
  const { history: _h, auditLog: _a, ...snapshot } = record;
  return snapshot;
}

function appendHistory(
  record: IdentityDocumentRecord,
  action: IdentityDocumentHistoryEntry['action'],
  userId: string,
): IdentityDocumentHistoryEntry {
  if (!record.history) record.history = [];
  const entry: IdentityDocumentHistoryEntry = {
    id: `hist-${record.id}-${Date.now()}`,
    documentId: record.id,
    action,
    snapshot: snapshotRecord(record),
    userId,
    timestamp: nowIso(),
  };
  record.history.push(entry);
  return entry;
}

function appendAudit(
  record: IdentityDocumentRecord,
  action: IdentityDocumentAuditEntry['action'],
  userId: string,
): void {
  if (!record.auditLog) record.auditLog = [];
  record.auditLog.push({ action, userId, timestamp: nowIso() });
}

function normalizeRecord(raw: Partial<IdentityDocumentRecord> | null | undefined): IdentityDocumentRecord | null {
  if (!raw?.id || !raw.partyId) return null;
  return {
    id: raw.id,
    partyId: raw.partyId,
    documentType: raw.documentType ?? '',
    issuingJurisdiction: raw.issuingJurisdiction ?? '',
    documentNumberEncrypted: raw.documentNumberEncrypted ?? '',
    issueDate: raw.issueDate ?? null,
    expiryDate: raw.expiryDate ?? null,
    additionalInformation: raw.additionalInformation ?? null,
    createdAt: raw.createdAt ?? nowIso(),
    createdBy: raw.createdBy ?? 'unknown',
    updatedAt: raw.updatedAt ?? null,
    updatedBy: raw.updatedBy ?? null,
    deletedAt: raw.deletedAt ?? null,
    deletedBy: raw.deletedBy ?? null,
    history: Array.isArray(raw.history) ? raw.history : [],
    auditLog: Array.isArray(raw.auditLog) ? raw.auditLog : [],
  };
}

function normalizeStore(raw: Store): Store {
  const next: Store = {};
  for (const [partyId, list] of Object.entries(raw)) {
    if (!Array.isArray(list)) continue;
    const normalized = list
      .map((entry) => normalizeRecord(entry))
      .filter((entry): entry is IdentityDocumentRecord => entry !== null);
    if (normalized.length > 0) next[partyId] = normalized;
  }
  return Object.keys(next).length > 0 ? next : seedInitialStore();
}

export function listActiveDocuments(partyId: string): IdentityDocumentRecord[] {
  if (!partyId) return [];
  const store = loadStore();
  return (store[partyId] ?? []).filter((doc) => Boolean(doc?.id && !doc.deletedAt));
}

export function getDocumentById(
  partyId: string,
  documentId: string,
): IdentityDocumentRecord | undefined {
  return loadStore()[partyId]?.find((doc) => doc.id === documentId && !doc.deletedAt);
}

export function findDuplicateDocument(
  partyId: string,
  documentType: string,
  issuingJurisdiction: string,
  plainDocumentNumber: string,
  excludeId?: string,
): IdentityDocumentRecord | undefined {
  const normalizedType = documentType.trim().toLowerCase();
  const jurisdiction =
    findJurisdictionByLabel(issuingJurisdiction)?.label ?? issuingJurisdiction.trim();
  const normalizedJurisdiction = jurisdiction.toLowerCase();
  const encrypted = encryptDocumentNumber(plainDocumentNumber.trim());

  return listActiveDocuments(partyId).find((doc) => {
    if (excludeId && doc.id === excludeId) return false;
    return (
      doc.documentType.trim().toLowerCase() === normalizedType
      && doc.issuingJurisdiction.trim().toLowerCase() === normalizedJurisdiction
      && doc.documentNumberEncrypted === encrypted
    );
  });
}

export function createDocument(
  partyId: string,
  draft: IdentityDocumentDraft,
  userId: string,
): IdentityDocumentRecord {
  const store = loadStore();
  const jurisdiction =
    findJurisdictionByLabel(draft.issuingJurisdiction)?.label
    ?? draft.issuingJurisdiction.trim();
  const timestamp = nowIso();
  const record: IdentityDocumentRecord = {
    id: `idoc-${partyId}-${Date.now()}`,
    partyId,
    documentType: draft.documentType.trim(),
    issuingJurisdiction: jurisdiction,
    documentNumberEncrypted: encryptDocumentNumber(draft.documentNumber),
    issueDate: draft.issueDate || null,
    expiryDate: draft.expiryDate || null,
    additionalInformation: draft.additionalInformation.trim() || null,
    createdAt: timestamp,
    createdBy: userId,
    updatedAt: null,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    history: [],
    auditLog: [],
  };
  appendHistory(record, 'create', userId);
  appendAudit(record, 'create', userId);
  store[partyId] = [...(store[partyId] ?? []), record];
  persistStore(store);
  return record;
}

export function updateAdditionalInfo(
  partyId: string,
  documentId: string,
  additionalInformation: string,
  userId: string,
): IdentityDocumentRecord | undefined {
  const store = loadStore();
  const list = store[partyId] ?? [];
  const index = list.findIndex((doc) => doc.id === documentId && !doc.deletedAt);
  if (index < 0) return undefined;

  const record = { ...list[index] };
  record.additionalInformation = additionalInformation.trim() || null;
  record.updatedAt = nowIso();
  record.updatedBy = userId;
  appendHistory(record, 'update', userId);
  appendAudit(record, 'update', userId);
  list[index] = record;
  store[partyId] = list;
  persistStore(store);
  return record;
}

export function softDeleteDocument(
  partyId: string,
  documentId: string,
  userId: string,
): boolean {
  const store = loadStore();
  const list = store[partyId] ?? [];
  const index = list.findIndex((doc) => doc.id === documentId && !doc.deletedAt);
  if (index < 0) return false;

  const record = { ...list[index] };
  record.deletedAt = nowIso();
  record.deletedBy = userId;
  appendHistory(record, 'delete', userId);
  appendAudit(record, 'delete', userId);
  list[index] = record;
  store[partyId] = list;
  persistStore(store);
  return true;
}

export function logUnmask(
  partyId: string,
  documentId: string,
  documentType: string,
  userId: string,
): void {
  const entry: UnmaskAuditEntry = {
    partyId,
    documentId,
    documentType,
    userId,
    timestamp: nowIso(),
  };
  const store = loadStore();
  const list = store[partyId] ?? [];
  const index = list.findIndex((doc) => doc.id === documentId);
  if (index >= 0) {
    appendAudit(list[index], 'unmask', userId);
    persistStore(store);
  }

  if (canPersistToLocalStorage()) {
    try {
      const raw = localStorage.getItem(UNMASK_AUDIT_KEY);
      const audit: UnmaskAuditEntry[] = raw ? JSON.parse(raw) : [];
      audit.push(entry);
      localStorage.setItem(UNMASK_AUDIT_KEY, JSON.stringify(audit));
    } catch {
      /* ignore */
    }
  }
}

export function getUnmaskAuditLog(): UnmaskAuditEntry[] {
  if (!canPersistToLocalStorage()) return [];
  try {
    const raw = localStorage.getItem(UNMASK_AUDIT_KEY);
    return raw ? (JSON.parse(raw) as UnmaskAuditEntry[]) : [];
  } catch {
    return [];
  }
}

/** Reset store for tests. */
export function __resetIdentityDocumentsStore(): void {
  memoryStore = null;
  if (canPersistToLocalStorage() && typeof localStorage.removeItem === 'function') {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(UNMASK_AUDIT_KEY);
  }
}

function seedInitialStore(): Store {
  const userId = 'sandbox-user';
  const marcPassport: IdentityDocumentRecord = {
    id: 'idoc-cli-marc-passport',
    partyId: 'CLI-MARC',
    documentType: 'Passport',
    issuingJurisdiction: 'Canada',
    documentNumberEncrypted: encryptDocumentNumber('AB1234567'),
    issueDate: '2018-03-15',
    expiryDate: '2028-03-14',
    additionalInformation: null,
    createdAt: '2019-05-01T12:00:00.000Z',
    createdBy: userId,
    updatedAt: null,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    history: [],
    auditLog: [{ action: 'create', userId, timestamp: '2019-05-01T12:00:00.000Z' }],
  };
  appendHistory(marcPassport, 'create', userId);

  const agentLicence: IdentityDocumentRecord = {
    id: 'idoc-agt-licence',
    partyId: 'AGT-BEAULIEU',
    documentType: "Driver's Licence",
    issuingJurisdiction: 'Quebec',
    documentNumberEncrypted: encryptDocumentNumber('B1234-567890-12'),
    issueDate: '2020-06-01',
    expiryDate: '2026-06-01',
    additionalInformation: 'Renewal pending',
    createdAt: '2020-06-15T10:00:00.000Z',
    createdBy: userId,
    updatedAt: null,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    history: [],
    auditLog: [{ action: 'create', userId, timestamp: '2020-06-15T10:00:00.000Z' }],
  };
  appendHistory(agentLicence, 'create', userId);

  return {
    'CLI-MARC': [marcPassport],
    'AGT-BEAULIEU': [agentLicence],
  };
}
