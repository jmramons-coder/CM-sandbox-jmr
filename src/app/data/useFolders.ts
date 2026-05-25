/**
 * Translated views over the (English-source) folder fixtures.
 *
 * The mock data files (`mock-folders.ts`, `mock-entity-folders.ts`) keep
 * structural metadata — IDs, kinds, types, dates, numbers — and the EN
 * baseline strings so legacy code that still reads them directly keeps
 * working. These hooks layer translations on top by looking up
 * `fixtures:folders.<id>.<field>` keys (and entity-folder equivalents)
 * for the active language, falling back to the EN baseline when a key is
 * missing. That gives us full per-language fixtures without forcing every
 * consumer to refactor at once.
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MOCK_FOLDERS, type FolderRecord } from './mock-folders';
import {
  MOCK_ENTITY_FOLDERS,
  type EntityFolderRecord,
} from './mock-entity-folders';
import type {
  EntityBadge,
  EntityBanner,
  EntityField,
  EntityFolderDef,
  EntityTab,
  EntityTableColumn,
  EntityTableSection,
  InfoSection,
} from '../domain/entityFolders';
import type { FolderSummary } from '../types';

/**
 * Helper: try a translation key and return the result only when it actually
 * resolves to something different from the key itself. We use this everywhere
 * so that missing translations fall back to the original English string
 * instead of leaking the key path into the UI.
 */
function tIfPresent(t: (k: string) => string, key: string): string | undefined {
  const result = t(key);
  return result === key ? undefined : result;
}

/* ─── Folder summaries (IP + entity headers in the All folders table) ─── */

function translateFolder(
  folder: FolderRecord,
  t: (k: string) => string,
): FolderSummary {
  const base = `folders.${folder.id}`;
  return {
    ...folder,
    claimant: tIfPresent(t, `${base}.claimant`) ?? folder.claimant,
    product: tIfPresent(t, `${base}.product`) ?? folder.product,
    benefit: tIfPresent(t, `${base}.benefit`) ?? folder.benefit,
    status: tIfPresent(t, `${base}.status`) ?? folder.status,
    subCases: folder.subCases.map((sc) => ({
      ...sc,
      label: tIfPresent(t, `${base}.subCases.${sc.id}.label`) ?? sc.label,
      status: tIfPresent(t, `${base}.subCases.${sc.id}.status`) ?? sc.status,
      owner: tIfPresent(t, `${base}.subCases.${sc.id}.owner`) ?? sc.owner,
    })),
  };
}

/** All MOCK_FOLDERS, with their translatable fields swapped for the active language. */
export function useTranslatedFolders(): FolderSummary[] {
  const { t } = useTranslation('fixtures');
  return useMemo(
    () => MOCK_FOLDERS.map((f) => translateFolder(f, t)),
    [t],
  );
}

/** Single folder lookup — same merge logic as the list selector. */
export function useTranslatedFolder(id: string | undefined): FolderSummary | undefined {
  const { t } = useTranslation('fixtures');
  return useMemo(() => {
    if (!id) return undefined;
    const raw = MOCK_FOLDERS.find((f) => f.id === id);
    return raw ? translateFolder(raw, t) : undefined;
  }, [id, t]);
}

/* ─── Entity folders (Policy / Agent / Coverage / Participant overviews) ─── */

function translateBadges(
  badges: EntityBadge[],
  t: (k: string) => string,
  base: string,
): EntityBadge[] {
  /* Fixture JSON: `{ type, status, role }`. Grey outlined pill = entity type;
   * lozenge tone = live status (Informative, Success, Warning, etc.). */
  const byKind = (kind: string) => tIfPresent(t, `${base}.badges.${kind}`);
  return badges.map((b) => {
    const isEntityTypeBadge = b.tone === undefined || b.tone === 'default';
    if (isEntityTypeBadge) {
      return { ...b, label: byKind('type') ?? byKind('role') ?? b.label };
    }
    return { ...b, label: byKind('status') ?? b.label };
  });
}

function translateTabs(tabs: EntityTab[], t: (k: string) => string, base: string): EntityTab[] {
  return tabs.map((tab) => ({
    ...tab,
    label: tIfPresent(t, `${base}.tabs.${tab.id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`) ?? tab.label,
  }));
}

function translateBanner(
  banner: EntityBanner | undefined,
  t: (k: string) => string,
  base: string,
): EntityBanner | undefined {
  if (!banner) return banner;
  const localized = tIfPresent(t, `${base}.banner`);
  return localized ? { ...banner, message: localized } : banner;
}

function translateColumns(
  columns: EntityTableColumn[],
  t: (k: string) => string,
  base: string,
): EntityTableColumn[] {
  return columns.map((col) => ({
    ...col,
    label: tIfPresent(t, `${base}.columns.${col.key}`) ?? col.label,
  }));
}

function translateField(
  field: EntityField,
  t: (k: string) => string,
  fieldsBase: string,
  valuesBase: string,
): EntityField {
  /* Build a shorthand key from the label so the fixture JSON can use stable
   * camelCase names (e.g. "Line of business" → "lineOfBusiness"). The mock
   * data already provides explicit `id` slots in some places — prefer those. */
  const key =
    field.id ??
    field.label
      .toLowerCase()
      .replace(/\(.+?\)/g, '')
      .trim()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .map((part, idx) => (idx === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
      .join('');
  const translatedLabel = tIfPresent(t, `${fieldsBase}.${key}`);
  const translatedValue =
    typeof field.value === 'string'
      ? tIfPresent(t, `${valuesBase}.${key}`)
      : undefined;
  const translatedHint = field.hint
    ? tIfPresent(t, `${fieldsBase}.syncHint`)
    : undefined;
  return {
    ...field,
    label: translatedLabel ?? field.label,
    value: translatedValue ?? field.value,
    hint: translatedHint ?? field.hint,
  };
}

function translateSection(
  section: InfoSection,
  t: (k: string) => string,
  base: string,
): InfoSection {
  const sectionKey = section.id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const sectionBase = `${base}.sections.${sectionKey}`;
  const title = tIfPresent(t, `${sectionBase}.title`) ?? section.title;
  if (section.kind === 'fieldGrid') {
    return {
      ...section,
      title,
      fields: section.fields.map((f) =>
        translateField(f, t, `${sectionBase}.fields`, `${sectionBase}.values`),
      ),
      actions: section.actions?.map((a) => ({
        ...a,
        label: tIfPresent(t, `${sectionBase}.${a.id}Action`) ?? a.label,
      })),
      rightPanel: section.rightPanel
        ? {
            ...section.rightPanel,
            items: section.rightPanel.items.map((item) => ({
              ...item,
              label:
                tIfPresent(
                  t,
                  `${sectionBase}.timeline.${item.label
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, ' ')
                    .trim()
                    .split(/\s+/)
                    .map((part, idx) =>
                      idx === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
                    )
                    .join('')}`,
                ) ?? item.label,
            })),
          }
        : undefined,
    };
  }
  if (section.kind === 'tableSection') {
    const translated: EntityTableSection = {
      ...section,
      title,
      columns: translateColumns(section.columns, t, sectionBase),
      actions: section.actions?.map((a) => ({
        ...a,
        label: tIfPresent(t, `${sectionBase}.${a.id}Action`) ?? a.label,
      })),
      emptyState: section.emptyState
        ? { message: tIfPresent(t, `${sectionBase}.empty`) ?? section.emptyState.message }
        : undefined,
    };
    return translated;
  }
  /* contact section: only the title needs translating; the kinds / addresses
   * are surfaced via the `entity.contact` namespace inside the renderer. */
  return { ...section, title };
}

function translateEntityFolder(
  folder: EntityFolderRecord,
  t: (k: string) => string,
): EntityFolderDef {
  const base = `entityFolders.${folder.id}`;
  return {
    ...folder,
    header: {
      ...folder.header,
      title: tIfPresent(t, `${base}.title`) ?? folder.header.title,
      badges: translateBadges(folder.header.badges, t, base),
      banner: translateBanner(folder.header.banner, t, base),
    },
    tabs: translateTabs(folder.tabs, t, base),
    information: folder.information.map((s) => translateSection(s, t, base)),
  };
}

export function useTranslatedEntityFolder(id: string | undefined): EntityFolderDef | undefined {
  const { t } = useTranslation('fixtures');
  return useMemo(() => {
    if (!id) return undefined;
    const raw = MOCK_ENTITY_FOLDERS[id];
    return raw ? translateEntityFolder(raw, t) : undefined;
  }, [id, t]);
}

/* ─── Sub-folder list rows (Agents / Coverages / Participants tables) ─── */

export type AgentRow = { id: string; name: string; roles: string; phone?: string; email?: string };
export type CoverageRow = { id: string; name: string; type: string; level: string; amount?: string; annualPremium?: string };
export type ParticipantRow = { id: string; name: string; roles: string; phone?: string; email?: string };

function translateRow<T extends { id: string; name?: string; roles?: string; type?: string; level?: string }>(
  row: T,
  t: (k: string) => string,
  group: 'agents' | 'coverages' | 'participants',
): T {
  const base = `subFolderRows.${group}.${row.id}`;
  return {
    ...row,
    ...(row.name !== undefined ? { name: tIfPresent(t, `${base}.name`) ?? row.name } : {}),
    ...(row.roles !== undefined ? { roles: tIfPresent(t, `${base}.roles`) ?? row.roles } : {}),
    ...(row.type !== undefined ? { type: tIfPresent(t, `${base}.type`) ?? row.type } : {}),
    ...(row.level !== undefined ? { level: tIfPresent(t, `${base}.level`) ?? row.level } : {}),
  };
}

export function useTranslatedAgentRows(rows: AgentRow[]): AgentRow[] {
  const { t } = useTranslation('fixtures');
  return useMemo(() => rows.map((r) => translateRow(r, t, 'agents')), [rows, t]);
}

export function useTranslatedCoverageRows(rows: CoverageRow[]): CoverageRow[] {
  const { t } = useTranslation('fixtures');
  return useMemo(() => rows.map((r) => translateRow(r, t, 'coverages')), [rows, t]);
}

export function useTranslatedParticipantRows(rows: ParticipantRow[]): ParticipantRow[] {
  const { t } = useTranslation('fixtures');
  return useMemo(() => rows.map((r) => translateRow(r, t, 'participants')), [rows, t]);
}
