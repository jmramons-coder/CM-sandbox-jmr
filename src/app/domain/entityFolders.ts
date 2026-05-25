/**
 * Entity folder domain — generic, recursive folder model used by Policy,
 * Agent, Coverage, Participant (and future Lead, Application, Carrier, etc.).
 *
 * The IP claim folders use a different shape (FolderSummary + SubCaseSummary)
 * and stay on FolderView/FolderCaseView. Entity folders are pure data: an
 * EntityFolderDef carries everything the UI needs to render — header,
 * banner, tabs, information sections, and sub-folder groups.
 */

import type { ReactNode } from 'react';
import type { LozengeType } from '../types';
import { getStatusLozengeType } from '../utils/status-display';

export type EntityFolderType =
  | 'policy'
  | 'client'
  | 'agent'
  | 'coverage'
  | 'participant';

export type EntityStatus =
  | 'active'
  | 'terminated'
  | 'pending'
  | 'inactive'
  | 'in-queue';

/* ─── Header ─── */

export type EntityBadge = {
  label: string;
  /** Visual tone. Defaults to a neutral outlined pill. */
  tone?: 'default' | LozengeType;
};

export type EntityHeaderActionId =
  | 'add'
  | 'message'
  | 'count'
  | 'more';

export type EntityHeaderAction = {
  id: EntityHeaderActionId;
  label?: string;
  count?: number;
  disabled?: boolean;
};

export type EntityBanner = {
  tone: 'info' | 'warning' | 'alert' | 'success';
  message: string;
};

export type EntityTab = {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
};

/* ─── Information sections ─── */

export type EntityFieldValue = string | number | null;

export type EntityField = {
  id?: string;
  label: string;
  /** `null` renders as "-" (empty state). */
  value: EntityFieldValue;
  /** Render the value as a link. */
  href?: string;
  /** Render the value de-emphasized (default is bold). */
  muted?: boolean;
  /** Optional secondary label (e.g. "(Agent)"). */
  hint?: string;
};

export type EntityFieldGridLayout = 'grid-2' | 'grid-3' | 'grid-4';

export type EntitySectionAction = {
  id: string;
  label: string;
  icon?: 'add' | 'edit';
};

/** Right-side companion panel inside a field-grid card. */
export type EntityRightPanel =
  | {
      kind: 'timeline';
      icon?: 'calendar';
      items: { label: string; value: string }[];
    };

export type EntityFieldGridSection = {
  kind: 'fieldGrid';
  id: string;
  title: string;
  layout: EntityFieldGridLayout;
  fields: EntityField[];
  actions?: EntitySectionAction[];
  rightPanel?: EntityRightPanel;
};

export type EntityTableColumn = {
  key: string;
  label: string;
  align?: 'left' | 'right';
  sortable?: boolean;
};

export type EntityTableCell = ReactNode;

export type EntityTableRow = {
  id: string;
  cells: Record<string, EntityTableCell>;
  /** Optional click handler (overview link, etc.). */
  href?: string;
};

export type EntityPagination = {
  perPage: number;
  total: number;
};

export type EntityTableSection = {
  kind: 'tableSection';
  id: string;
  title: string;
  columns: EntityTableColumn[];
  rows: EntityTableRow[];
  actions?: EntitySectionAction[];
  pagination?: EntityPagination;
  /** Shown when `rows` is empty. */
  emptyState?: { message: string };
};

/** Custom contact section (Emails / Phones / Addresses). */
export type EntityContactSection = {
  kind: 'contact';
  id: string;
  title: string;
  emails?: { kind: 'Business' | 'Personal'; address: string }[];
  phones?: { kind: 'Business' | 'Personal' | 'Mobile'; number: string }[];
  addresses?: { kind: 'Business' | 'Residence'; address: string }[];
};

/** Interactive identity documents section (Client / Agent / Participant). */
export type EntityIdentityDocumentsSection = {
  kind: 'identityDocuments';
  id: string;
  title: string;
};

export type InfoSection =
  | EntityFieldGridSection
  | EntityTableSection
  | EntityContactSection
  | EntityIdentityDocumentsSection;

/* ─── Sub-folder grouping ─── */

export type EntitySubFolderGroup = {
  /** Type of children in this group. */
  type: EntityFolderType;
  /** Plural display label, e.g. "Agents". */
  label: string;
  /** Total count (may exceed the number of full mock entries). */
  count: number;
  /** IDs (in order) of children that exist in `MOCK_ENTITY_FOLDERS`. */
  childIds: string[];
};

/* ─── Folder definition ─── */

export type EntityFolderHeader = {
  title: string;
  badges: EntityBadge[];
  status: EntityStatus;
  banner?: EntityBanner;
  /** Optional avatar block (used on Agent / Participant). */
  avatar?: { initials?: string; color?: string };
  /** Header action affordances. The right group always includes `more`. */
  actions?: EntityHeaderAction[];
};

export function entityStatusDisplayLabel(status: EntityStatus): string {
  if (status === 'in-queue') return 'IN QUEUE';
  return status.toUpperCase();
}

/** Grey pill = entity type; lozenge = current status (never duplicate type). */
export function normalizeEntityHeaderBadges(header: EntityFolderHeader): EntityBadge[] {
  const typeBadge = header.badges.find((b) => b.tone === undefined || b.tone === 'default');
  const statusBadge = header.badges.find((b) => b.tone !== undefined && b.tone !== 'default');
  const statusLabel = entityStatusDisplayLabel(header.status);
  const statusTone = getStatusLozengeType(statusLabel, 'folder');

  const badges: EntityBadge[] = [];
  if (typeBadge) badges.push(typeBadge);

  if (statusBadge) {
    const duplicatesType =
      typeBadge &&
      statusBadge.label.trim().toLowerCase() === typeBadge.label.trim().toLowerCase();
    badges.push(duplicatesType ? { label: statusLabel, tone: statusTone } : statusBadge);
  } else if (typeBadge) {
    badges.push({ label: statusLabel, tone: statusTone });
  }

  return badges.length > 0 ? badges : header.badges;
}

export type EntityFolderDef = {
  id: string;
  type: EntityFolderType;
  /** Parent folder id (for sub-folders). */
  parentId?: string;
  header: EntityFolderHeader;
  tabs: EntityTab[];
  /** Information tab content (ordered). */
  information: InfoSection[];
  /** Sub-folder groups shown in the sidebar tree and on the page if needed. */
  subFolderGroups?: EntitySubFolderGroup[];
  /**
   * Description shown on the sub-folder list view that this folder belongs to
   * (only used when this is the LIST of children of its parent).
   */
  listDescription?: string;
};

/* ─── Copy / labels ─── */

export const ENTITY_COPY: Record<
  EntityFolderType,
  { singular: string; plural: string; codePrefix: string }
> = {
  policy: { singular: 'Policy', plural: 'Policies', codePrefix: 'POL' },
  client: { singular: 'Client', plural: 'Clients', codePrefix: 'CLI' },
  agent: { singular: 'Agent', plural: 'Agents', codePrefix: 'AGT' },
  coverage: { singular: 'Coverage', plural: 'Coverages', codePrefix: 'COV' },
  participant: {
    singular: 'Participant',
    plural: 'Participants',
    codePrefix: 'PAR',
  },
};

export function getEntityCopy(type: EntityFolderType) {
  return ENTITY_COPY[type];
}

/** Convert a plural URL slug ("agents") to its EntityFolderType. */
export function entityTypeFromSlug(slug: string | undefined): EntityFolderType | null {
  if (!slug) return null;
  const lower = slug.toLowerCase();
  for (const [type, copy] of Object.entries(ENTITY_COPY)) {
    if (copy.plural.toLowerCase() === lower) return type as EntityFolderType;
  }
  return null;
}

/** Inverse: type → URL slug. */
export function entitySlug(type: EntityFolderType): string {
  return ENTITY_COPY[type].plural.toLowerCase();
}
