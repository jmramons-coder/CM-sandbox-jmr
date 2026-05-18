import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  entitySlug,
  type EntityFolderDef,
  type EntityFolderType,
  type EntityFieldGridSection,
  type EntityTableSection,
  type InfoSection,
} from '../../domain/entityFolders';
import { useTranslatedEntityFolder } from '../../data/useFolders';
import { getEntityRelationships } from '../../data/mock-entity-folders';
import { filterDatasetBySettings, getSystemDataset, listRelationships } from '../../data/objectRepository';
import { getEntityFolderViewFromDataset } from '../../data/entityReadModels';
import { resolveEntityFolderId } from '../../data/gi-demo-entity-records';
import { useDataSourceSettings } from '../../contexts/PlatformSettingsContext';
import type { SystemDataset } from '../../data/multi-case-dataset';
import type { EntityRelationshipRow, RelationshipFolderType } from '../../data/mock-entity-folders';
import { useFoldersNav } from '../../contexts/FoldersNavContext';
import { TABLE_LINK_CLASS } from '../ModuleCellHelpers';
import { EntityBanner } from './EntityBanner';
import { EntityContactPanel } from './EntityContactPanel';
import { EntityFieldGridCard } from './EntityFieldGridCard';
import { EntityHeader, EntityHeaderActions } from './EntityHeader';
import { EntityTableSectionCard } from './EntityTableSectionCard';
import { EntityRelationshipTab } from './EntityRelationshipTab';
import { ModuleTabsBar } from '../ModuleTabsBar';
import {
  PolicyEntityConfigModal,
  type ConfigurableInfoSection,
} from './PolicyEntityConfigModal';

/** Generic entity folder overview page. Used for the main folder AND any sub-folder. */
export function EntityFolderOverview() {
  const params = useParams();
  const { addOpenFolder, showSubFolder } = useFoldersNav();
  /* The most-specific id segment in the URL — last param wins. */
  const rawFolderId =
    params.nestedId ?? params.childId ?? params.folderId ?? undefined;
  const folderId = resolveEntityFolderId(rawFolderId);
  const dataSource = useDataSourceSettings();
  const activeDataset = useMemo(() => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource), [dataSource]);
  const datasetFolder = useMemo(() => getEntityFolderViewFromDataset(activeDataset, folderId), [activeDataset, folderId]);
  const translatedFolder = useTranslatedEntityFolder(folderId);
  const folder = datasetFolder ?? translatedFolder;
  const rootId = params.folderId;

  /* Register the root entity folder in the sidebar nav whenever this view
   * mounts so it appears in the Policies tree. */
  useEffect(() => {
    if (rootId) addOpenFolder(rootId);
  }, [rootId, addOpenFolder]);

  /* If the user opened a sub-folder that was previously hidden via the X in
   * the sidebar, automatically un-hide it so it re-appears under its group. */
  useEffect(() => {
    const subId = params.nestedId ?? params.childId;
    if (subId) showSubFolder(subId);
  }, [params.nestedId, params.childId, showSubFolder]);

  if (!folder) {
    return <PlaceholderOverview folderId={folderId ?? '?'} rootId={rootId} />;
  }

  return <EntityFolderOverviewView folder={folder} rootId={rootId} activeDataset={activeDataset} />;
}

function EntityFolderOverviewView({
  folder,
  rootId,
  activeDataset,
}: {
  folder: EntityFolderDef;
  rootId?: string;
  activeDataset: SystemDataset;
}) {
  const { t } = useTranslation('folders');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const [activeTabId, setActiveTabId] = useState(requestedTab ?? folder.tabs[0]?.id ?? 'information');
  const [configOpen, setConfigOpen] = useState(false);
  const [informationConfig, setInformationConfig] = useState<ConfigurableInfoSection[]>(() =>
    toConfigurableSections(folder.information),
  );
  const [relationshipRows, setRelationshipRows] = useState(() => getEntityRelationships(folder.id));
  const datasetRelationshipRows = useMemo<EntityRelationshipRow[]>(() => {
    const sourceRef = { kind: folder.type as 'policy' | 'client' | 'agent', id: folder.id, label: folder.header.title };
    return listRelationships(activeDataset, sourceRef).filter((row) =>
      ['policy', 'client', 'agent'].includes(row.source.kind) || ['policy', 'client', 'agent'].includes(row.target.kind),
    ).map((row) => {
      const target = row.source.id === folder.id && row.source.kind === folder.type ? row.target : row.source;
      return {
        id: row.id,
        folderId: target.id,
        folderName: target.label ?? target.id,
        folderType: toRelationshipFolderType(target.kind),
        relationship: row.relationship,
        effectiveDate: row.effectiveDate ?? '',
        expirationDate: row.expirationDate ?? '',
        status: row.status?.toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      };
    }).filter((row) => row.folderType !== 'Participant');
  }, [activeDataset, folder.header.title, folder.id, folder.type]);
  const effectiveRelationshipRows = datasetRelationshipRows.length ? datasetRelationshipRows : relationshipRows;
  const activeTab = folder.tabs.find((tab) => tab.id === activeTabId) ?? folder.tabs[0];
  const visibleInformation = useMemo(
    () => informationConfig.filter((entry) => entry.visible).map(toVisibleInfoSection),
    [informationConfig],
  );

  useEffect(() => {
    const nextTab = requestedTab && folder.tabs.some((tab) => tab.id === requestedTab)
      ? requestedTab
      : folder.tabs[0]?.id ?? 'information';
    setActiveTabId(nextTab);
    setInformationConfig(toConfigurableSections(folder.information));
    setRelationshipRows(getEntityRelationships(folder.id));
    setConfigOpen(false);
  }, [folder.id, folder.information, folder.tabs, requestedTab]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface-primary">
      {/* Sticky header: breadcrumb + title + tabs */}
      <div className="shrink-0 border-b border-border-soft bg-surface-primary px-6 pt-4">
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <EntityBreadcrumb folder={folder} rootId={rootId} />
            <EntityHeaderActions
              header={folder.header}
              onConfigure={folder.type === 'policy' ? () => setConfigOpen(true) : undefined}
            />
          </div>

          <EntityHeader header={folder.header} />

          <ModuleTabsBar
            tabs={folder.tabs}
            activeId={activeTab?.id ?? folder.tabs[0]?.id}
            onChange={setActiveTabId}
            bleed
          />
        </div>
      </div>

      {/* Scrollable tab content */}
      <div className={`min-h-0 flex-1 overflow-y-auto ${activeTab?.id === 'relationship' ? '' : 'px-6 py-4'}`}>
        {activeTab?.id === 'information' ? (
          <div className="flex max-w-[900px] flex-col gap-4">
            {folder.header.banner ? (
              <EntityBanner banner={folder.header.banner} />
            ) : null}
            {visibleInformation.map((section) => (
              <SectionRenderer key={section.id} section={section} />
            ))}
          </div>
        ) : activeTab?.id === 'relationship' ? (
          <EntityRelationshipTab
            entityId={folder.id}
            rows={effectiveRelationshipRows}
            onAddRelationship={() => navigate(`${location.pathname}/relationship/add`)}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-border-default bg-white p-10 text-center text-[13px] text-text-muted">
            {t('entity.overview.notImplemented', { tab: activeTab?.label ?? '' })}
          </div>
        )}
      </div>
      {folder.type === 'policy' ? (
        <PolicyEntityConfigModal
          open={configOpen}
          sections={informationConfig}
          onOpenChange={setConfigOpen}
          onSave={setInformationConfig}
        />
      ) : null}
    </div>
  );
}

function toRelationshipFolderType(kind: string): RelationshipFolderType {
  if (kind === 'policy') return 'Policy';
  if (kind === 'client') return 'Client';
  if (kind === 'agent') return 'Agent';
  return 'Participant';
}

function toConfigurableSections(sections: InfoSection[]): ConfigurableInfoSection[] {
  return sections.map((section) => ({ section, visible: true }));
}

function toVisibleInfoSection(entry: ConfigurableInfoSection): InfoSection {
  if (entry.section.kind === 'fieldGrid' && entry.hiddenFieldIds?.length) {
    const hidden = new Set(entry.hiddenFieldIds);
    return {
      ...entry.section,
      fields: (entry.section as EntityFieldGridSection).fields.filter((field, index) => {
        const id = field.id ?? `field-${index}-${field.label.toLowerCase().replace(/\W+/g, '-')}`;
        return !hidden.has(id);
      }),
    };
  }
  if (entry.section.kind === 'tableSection' && entry.hiddenColumnKeys?.length) {
    const hidden = new Set(entry.hiddenColumnKeys);
    const columns = (entry.section as EntityTableSection).columns.filter((column) => !hidden.has(column.key));
    return {
      ...entry.section,
      columns,
      rows: (entry.section as EntityTableSection).rows.map((row) => ({
        ...row,
        cells: columns.reduce<typeof row.cells>((cells, column) => {
          cells[column.key] = row.cells[column.key];
          return cells;
        }, {}),
      })),
    };
  }
  return entry.section;
}

function SectionRenderer({ section }: { section: InfoSection }) {
  if (section.kind === 'fieldGrid') return <EntityFieldGridCard section={section} />;
  if (section.kind === 'tableSection') return <EntityTableSectionCard section={section} />;
  if (section.kind === 'contact') return <EntityContactPanel section={section} />;
  return null;
}

function EntityBreadcrumb({
  folder,
  rootId,
}: {
  folder: EntityFolderDef;
  rootId?: string;
}) {
  const { t } = useTranslation('folders');
  const trail = useBreadcrumbTrail(folder, rootId);
  return (
    <nav aria-label={t('entity.overview.breadcrumbAria')} className="flex flex-wrap items-center gap-1 text-[12px]">
      {trail.map((seg, idx) => {
        const isLast = idx === trail.length - 1;
        return (
          <span key={`${seg.label}-${idx}`} className="flex items-center gap-1">
            {idx > 0 ? <ChevronRight className="size-3 text-text-muted" /> : null}
            {seg.href && !isLast ? (
              <Link
                to={seg.href}
                className="text-text-muted transition-colors hover:text-text-secondary"
              >
                {seg.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-text-primary' : 'text-text-muted'}>
                {seg.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function useBreadcrumbTrail(
  folder: EntityFolderDef,
  rootId: string | undefined,
): { label: string; href?: string }[] {
  const { t } = useTranslation('folders');
  /* The parent's title needs to be translated too — pull it through the
   * fixture selector so it matches the policy's title in the sidebar. */
  const parent = useTranslatedEntityFolder(folder.parentId);
  const trail: { label: string; href?: string }[] = [
    { label: t('entity.overview.breadcrumbRoot'), href: '/folders' },
  ];
  if (folder.parentId && rootId === folder.parentId && parent) {
    trail.push({ label: parent.header.title, href: `/folders/${parent.id}` });
    trail.push({
      label: t(`entity.copy.${folder.type as EntityFolderType}.plural` as never),
      href: `/folders/${parent.id}/${entitySlug(folder.type)}`,
    });
  }
  trail.push({ label: folder.header.title });
  return trail;
}

/** Shown when a sub-folder row is clicked but no full overview exists yet. */
function PlaceholderOverview({
  folderId,
  rootId,
}: {
  folderId: string;
  rootId?: string;
}) {
  const { t } = useTranslation('folders');
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-surface-primary px-6 py-10 text-center">
      <p className="text-[14px] font-semibold text-text-primary">{folderId}</p>
      <p className="text-[13px] text-text-secondary">
        {t('entity.overview.placeholderBody')}
      </p>
      {rootId ? (
        <Link
          to={`/folders/${rootId}`}
          className={TABLE_LINK_CLASS}
        >
          {t('entity.overview.backToFolder')}
        </Link>
      ) : null}
    </div>
  );
}
