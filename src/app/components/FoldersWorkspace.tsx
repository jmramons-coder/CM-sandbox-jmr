import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Folders, MoreVertical, X } from 'lucide-react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useDataSourceSettings } from '../contexts/PlatformSettingsContext';
import { useFoldersNav } from '../contexts/FoldersNavContext';
import { getDatasetEntityFolderType, getEntityFolderViewFromDataset } from '../data/entityReadModels';
import { MOCK_FOLDERS } from '../data/mock-folders';
import { getEntityFolderById, isEntityFolderId } from '../data/mock-entity-folders';
import { filterDatasetBySettings, getSystemDataset } from '../data/objectRepository';
import { useTranslatedFolder, useTranslatedEntityFolder } from '../data/useFolders';
import { entitySlug, type EntitySubFolderGroup } from '../domain/entityFolders';
import { useMobileSidePanelLayout } from '../hooks/useMobileSidePanelLayout';
import { useResizableSidePanel } from '../hooks/useResizableSidePanel';
import { UI_CLASS } from '../constants/design-tokens';
import { getStatusLozengeType } from '../utils/status-display';
import { EntitySubFolderLeafRow, TreeBranch, TreeCaret } from './folders/FolderTreePrimitives';
import { LozengeTag } from './LozengeTag';
import { TABLE_LINK_CLASS } from './ModuleCellHelpers';
import {
  LAYOUT_HEADER_HEIGHT_PX,
  MAIN_NAV_WIDTH_PX,
  SidePanelResizeStrip,
  SidePanelToggle,
} from './WorkspaceSidePanelChrome';

const NAV_MENU_PANEL_CLASS =
  'absolute right-0 top-full z-[90] mt-1 min-w-[148px] rounded-[8px] border border-brand-navy/20 bg-white py-1 shadow-[0_4px_14px_var(--color-brand-blue-ring)]';

function TreeCollapse({
  open,
  children,
  className = '',
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid overflow-hidden transition-[grid-template-rows,opacity,transform] duration-200 ease-out ${
        open ? 'grid-rows-[1fr] opacity-100 translate-y-0' : 'grid-rows-[0fr] opacity-0 -translate-y-1'
      }`}
    >
      <div className={`min-h-0 overflow-hidden ${className}`}>
        {children}
      </div>
    </div>
  );
}

function FoldersSidebarSection({
  title,
  expanded,
  onToggleExpanded,
  menuOpen,
  onMenuOpenChange,
  menuRef,
  menuAriaLabel,
  dropdown,
  expandedContent,
}: {
  title: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  menuOpen: boolean;
  onMenuOpenChange: (next: boolean) => void;
  menuRef: RefObject<HTMLDivElement | null>;
  menuAriaLabel: string;
  dropdown: ReactNode;
  expandedContent: ReactNode | null;
}) {
  return (
    <>
      <div className="flex w-full items-center gap-1 px-2 py-1.5">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left text-[13px] font-medium text-text-muted"
          onClick={onToggleExpanded}
        >
          <span className="inline-flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-[3px] border border-[#b7bbc2] text-[16px] font-normal leading-none text-text-muted">
            {expanded ? '−' : '+'}
          </span>
          <span>{title}</span>
        </button>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={menuAriaLabel}
            onClick={(e) => {
              e.stopPropagation();
              onMenuOpenChange(!menuOpen);
            }}
            className={`inline-flex h-7 w-[22px] shrink-0 items-center justify-center rounded-[6px] transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/25 ${
              menuOpen ? 'bg-surface-muted text-brand-blue' : 'text-[#868F9B]'
            }`}
          >
            <MoreVertical className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
          {menuOpen ? dropdown : null}
        </div>
      </div>
      <TreeCollapse open={expanded}>{expandedContent}</TreeCollapse>
    </>
  );
}

function SubFolderGroupNode({
  group,
  parentId,
  groupExpanded,
  onToggleGroup,
  isGroupActive,
  isChildActive,
  hiddenSubFolders,
  onHideChild,
  onNavigate,
}: {
  group: EntitySubFolderGroup;
  parentId: string;
  groupExpanded: boolean;
  onToggleGroup: () => void;
  isGroupActive: boolean;
  isChildActive: (childId: string) => boolean;
  hiddenSubFolders: Set<string>;
  onHideChild: (childId: string) => void;
  onNavigate: (path: string) => void;
}) {
  const { t } = useTranslation('folders');
  const slug = entitySlug(group.type);
  const visibleChildIds = group.childIds.filter((id) => !hiddenSubFolders.has(id));
  /* The group's display label comes from the translated entity copy table
   * so it follows the active language, while `entitySlug()` deliberately
   * stays in English to keep URLs stable across locales. */
  const groupLabel = t(`entity.copy.${group.type}.plural` as never);
  /* Clicking the group row navigates to its list page AND ensures the group
   * is expanded in the tree so the user immediately sees its leaves. The
   * caret keeps its toggle behaviour (stopPropagation below) so it can be
   * used to collapse without leaving the page. */
  const handleRowActivate = () => {
    if (isGroupActive && groupExpanded) {
      onToggleGroup();
      return;
    }
    onNavigate(`/folders/${parentId}/${slug}`);
    if (!groupExpanded) onToggleGroup();
  };
  const [groupHovered, setGroupHovered] = useState(false);
  const shortenFirstTail = isGroupActive || groupHovered;

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onMouseEnter={() => setGroupHovered(true)}
        onMouseLeave={() => setGroupHovered(false)}
        onClick={handleRowActivate}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleRowActivate();
          }
        }}
        className={`flex w-full cursor-pointer items-center gap-1.5 rounded-[8px] border px-2 py-1.5 text-[13px] transition-colors ${
          isGroupActive
            ? 'border-brand-blue-border bg-white font-semibold text-brand-blue'
            : 'border-transparent text-brand-navy hover:border-brand-blue-border hover:bg-surface-selected-alt'
        }`}
      >
        <span
          role="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            onToggleGroup();
          }}
          className={`inline-flex h-6 w-[18px] shrink-0 cursor-pointer items-center justify-center rounded transition-colors hover:bg-surface-muted ${
            isGroupActive ? 'text-brand-blue' : 'text-[#868F9B]'
          }`}
        >
          <TreeCaret open={groupExpanded} />
        </span>
        <span className="min-w-0 flex-1 truncate">{groupLabel}</span>
      </div>
      <TreeCollapse open={groupExpanded} className="relative ml-[21px] pl-[14px]">
          {visibleChildIds.length === 0 ? (
            <div className="rounded-[6px] border border-dashed border-border-default bg-white/40 px-2 py-2 text-center text-[11px] leading-snug text-text-muted">
              {t('workspace.empty.allHidden')}
            </div>
          ) : null}
          {visibleChildIds.map((childId, i) => (
            <EntitySubFolderLeafRow
              key={childId}
              childId={childId}
              parentId={parentId}
              slug={slug}
              isActive={isChildActive(childId)}
              isFirst={i === 0}
              isLast={i === visibleChildIds.length - 1}
              shortenFirstTail={shortenFirstTail}
              onHideChild={onHideChild}
              onNavigate={onNavigate}
            />
          ))}
      </TreeCollapse>
    </div>
  );
}

/* IP-style folder row (Cases section). Pulled out so the translated claimant
 * and sub-case labels stay in sync with the active language. The lozenge
 * tone (statusType) is computed by the parent off the English status so the
 * variant detection rules don't need to be retranslated. */
function IpFolderRow({
  folderId,
  isFolderActive,
  isExpanded,
  activeSubCaseId,
  statusType,
  onNavigate,
  onToggleExpanded,
  onExpand,
  onRemove,
}: {
  folderId: string;
  isFolderActive: boolean;
  isExpanded: boolean;
  activeSubCaseId: string | undefined;
  statusType: 'Alert' | 'Neutral' | 'Success' | 'Informative' | 'Warning';
  onNavigate: (path: string) => void;
  onToggleExpanded: (id: string) => void;
  onExpand: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useTranslation('folders');
  const folder = useTranslatedFolder(folderId);
  const claimant = folder?.claimant ?? '';
  /* Translated status label (e.g. "Actif" in FR) — derived from the translated
   * folder so the lozenge text matches the active language. */
  const statusShort = folder ? folder.status.split(':')[0]?.trim() || folder.status : '';
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (isFolderActive && isExpanded) {
            onToggleExpanded(folderId);
            return;
          }
          onNavigate(`/folders/${folderId}`);
          onExpand(folderId);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (isFolderActive && isExpanded) {
              onToggleExpanded(folderId);
            } else {
              onNavigate(`/folders/${folderId}`);
              onExpand(folderId);
            }
          }
        }}
        className={`group flex w-full cursor-pointer items-center gap-1.5 rounded-[8px] border px-2 py-1.5 text-sm transition-colors ${
          isFolderActive
            ? 'border-brand-blue-border bg-white text-brand-blue'
            : 'border-transparent text-brand-navy hover:border-brand-blue-border hover:bg-surface-selected-alt'
        }`}
      >
        <span
          role="button"
          tabIndex={-1}
          onClick={(e) => { e.stopPropagation(); onToggleExpanded(folderId); }}
          className={`inline-flex h-7 w-[22px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/25 ${
            isFolderActive ? 'text-brand-blue' : 'text-[#868F9B]'
          }`}
        >
          <TreeCaret open={isExpanded} />
        </span>
        <span className="min-w-0 flex-1 truncate">{folderId} {claimant}</span>
        <div className="flex items-center gap-[5px]">
          <LozengeTag label={statusShort} type={statusType} subtle className="shrink-0" />
        </div>
        <span
          role="button"
          tabIndex={-1}
          aria-label={t('workspace.removeAria', { label: folderId })}
          title={t('workspace.removeTitle')}
          className="inline-flex shrink-0 rounded p-0.5 text-[#60666e] hover:bg-[#dbdee1]"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(folderId);
          }}
        >
          <X className="h-3 w-3" />
        </span>
      </div>

      <TreeCollapse open={isExpanded && Boolean(folder)} className="relative ml-[21px] pl-[14px]">
        {folder
          ? folder.subCases.map((sc, i) => {
              const isSubActive = activeSubCaseId === sc.id;
              return (
                <div key={sc.id} className="relative">
                  <TreeBranch isFirst={i === 0} isLast={i === folder.subCases.length - 1} />
                  <button
                    onClick={() => onNavigate(`/folders/${folderId}/${sc.id}`)}
                    className={`-ml-[6px] flex w-[calc(100%+6px)] items-center gap-2 rounded-[8px] border px-2 py-1.5 text-left text-[12px] transition-colors ${
                      isSubActive
                        ? 'border-brand-blue-border bg-white font-semibold text-brand-blue'
                        : 'border-transparent text-brand-navy hover:border-brand-blue-border hover:bg-surface-selected-alt'
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">{sc.label}</span>
                  </button>
                </div>
              );
            })
          : null}
      </TreeCollapse>
    </div>
  );
}

function getPolicyLifecycleStatus(def: ReturnType<typeof getEntityFolderById>): 'ACTIVE' | 'INACTIVE' | null {
  const timelineItems = def?.information
    .find((section) => section.id === 'identification' && section.kind === 'fieldGrid')
    ?.rightPanel?.items;

  const effectiveDate = timelineItems?.find((item) => item.label.toLowerCase() === 'effective date')?.value;
  const terminationDate = timelineItems?.find((item) => item.label.toLowerCase() === 'termination date')?.value;

  if (!effectiveDate || effectiveDate === '-') return 'INACTIVE';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const effective = new Date(`${effectiveDate}T00:00:00`);
  const terminated = Boolean(
    terminationDate &&
      terminationDate !== '-' &&
      new Date(`${terminationDate}T00:00:00`) <= today,
  );

  return effective <= today && !terminated ? 'ACTIVE' : 'INACTIVE';
}

/* Entity-style policy row (Policies section). Same extraction reason as
 * IpFolderRow — gives us a hook seam for translated entity-folder data. */
function PolicyFolderRow({
  folderId,
  isFolderActive,
  isExpanded,
  expandedGroups,
  hiddenSubFolders,
  isEntityGroupActive,
  isEntityChildActive,
  onNavigate,
  onToggleExpanded,
  onExpand,
  onToggleGroup,
  onHideSubFolder,
  onRemove,
}: {
  folderId: string;
  isFolderActive: boolean;
  isExpanded: boolean;
  expandedGroups: Set<string>;
  hiddenSubFolders: Set<string>;
  isEntityGroupActive: (parentId: string, type: string) => boolean;
  isEntityChildActive: (childId: string) => boolean;
  onNavigate: (path: string) => void;
  onToggleExpanded: (id: string) => void;
  onExpand: (id: string) => void;
  onToggleGroup: (key: string) => void;
  onHideSubFolder: (def: { id: string }, group: EntitySubFolderGroup, hiddenId: string) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useTranslation('folders');
  const dataSource = useDataSourceSettings();
  const activeDataset = useMemo(
    () => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource),
    [dataSource],
  );
  const def = useTranslatedEntityFolder(folderId);
  const datasetDef = useMemo(
    () => getEntityFolderViewFromDataset(activeDataset, folderId),
    [activeDataset, folderId],
  );
  /* Always reach for the structural def to drive the sub-folder groups list
   * (counts / child IDs aren't language-dependent). */
  const structural = getEntityFolderById(folderId);
  const title = def?.header.title ?? datasetDef?.header.title ?? folderId;
  const statusShort = getPolicyLifecycleStatus(structural) ?? def?.header.status.toUpperCase() ?? t('module.fallbackStatus');
  const lifecycleStatusType = getStatusLozengeType(statusShort, 'entityTable');
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (isFolderActive && isExpanded) {
            onToggleExpanded(folderId);
            return;
          }
          onNavigate(`/folders/${folderId}`);
          onExpand(folderId);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (isFolderActive && isExpanded) {
              onToggleExpanded(folderId);
            } else {
              onNavigate(`/folders/${folderId}`);
              onExpand(folderId);
            }
          }
        }}
        className={`group flex w-full cursor-pointer items-center gap-1.5 rounded-[8px] border px-2 py-1.5 text-sm transition-colors ${
          isFolderActive
            ? 'border-brand-blue-border bg-white text-brand-blue'
            : 'border-transparent text-brand-navy hover:border-brand-blue-border hover:bg-surface-selected-alt'
        }`}
      >
        <span
          role="button"
          tabIndex={-1}
          onClick={(e) => { e.stopPropagation(); onToggleExpanded(folderId); }}
          className={`inline-flex h-7 w-[22px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/25 ${
            isFolderActive ? 'text-brand-blue' : 'text-[#868F9B]'
          }`}
        >
          <TreeCaret open={isExpanded} />
        </span>
        <span className="min-w-0 flex-1 truncate">{title}</span>
        <div className="flex items-center gap-[5px]">
          <LozengeTag label={statusShort} type={lifecycleStatusType} subtle className="shrink-0" />
        </div>
        <span
          role="button"
          tabIndex={-1}
          aria-label={t('workspace.removeAria', { label: title })}
          title={t('workspace.removeTitle')}
          className="inline-flex shrink-0 rounded p-0.5 text-[#60666e] hover:bg-[#dbdee1]"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(folderId);
          }}
        >
          <X className="h-3 w-3" />
        </span>
      </div>

      <TreeCollapse
        open={isExpanded && Boolean((datasetDef?.subFolderGroups ?? structural?.subFolderGroups)?.length)}
        className="ml-5 mt-0.5 space-y-0.5 pl-2.5"
      >
        {(datasetDef?.subFolderGroups ?? structural?.subFolderGroups)?.map((group) => (
          <SubFolderGroupNode
            key={group.type}
            group={group}
            parentId={structural.id}
            groupExpanded={expandedGroups.has(`${structural.id}:${group.type}`)}
            onToggleGroup={() => onToggleGroup(`${structural.id}:${group.type}`)}
            isGroupActive={isEntityGroupActive(structural.id, entitySlug(group.type))}
            isChildActive={isEntityChildActive}
            hiddenSubFolders={hiddenSubFolders}
            onHideChild={(hiddenId) => onHideSubFolder(structural, group, hiddenId)}
            onNavigate={onNavigate}
          />
        ))}
      </TreeCollapse>
    </div>
  );
}

export function FoldersWorkspace() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('folders');
  const params = useParams();
  const folderId = params.folderId;
  const subCaseId = params.subCaseId;
  /* `childType` shares the same URL slot as `subCaseId`. Both names refer to
   * the second segment under /folders/:folderId. */
  const childType = params.childType;
  const childId = params.childId;
  const {
    openFolders,
    removeOpenFolder,
    clearOpenFolders,
    expandedFolders,
    toggleFolderExpanded,
    expandFolder,
    collapseAllFolders,
    expandedGroups,
    toggleGroupExpanded,
    sectionVisible,
    hideSection,
    sectionExpanded,
    toggleSectionExpanded,
    hiddenSubFolders,
    hideSubFolder,
    formOverlayActive,
  } = useFoldersNav();
  const dataSource = useDataSourceSettings();
  const activeDataset = useMemo(
    () => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource),
    [dataSource],
  );
  const {
    panelWidth,
    sidePanelOpen,
    setSidePanelOpen,
    isResizing,
    setIsResizing,
  } = useResizableSidePanel();
  const { effectivePanelWidth, showPanelContent, peekWidth } = useMobileSidePanelLayout(
    panelWidth,
    sidePanelOpen,
  );
  const sidePanelWasOpen = useRef(true);

  useEffect(() => {
    if (formOverlayActive) {
      sidePanelWasOpen.current = sidePanelOpen;
      setSidePanelOpen(false);
    } else {
      if (sidePanelWasOpen.current) setSidePanelOpen(true);
    }
  }, [formOverlayActive]); // eslint-disable-line react-hooks/exhaustive-deps
  const [casesMenuOpen, setCasesMenuOpen] = useState(false);
  const [policiesMenuOpen, setPoliciesMenuOpen] = useState(false);
  const [agentsMenuOpen, setAgentsMenuOpen] = useState(false);
  const [clientsMenuOpen, setClientsMenuOpen] = useState(false);
  const casesMenuRef = useRef<HTMLDivElement>(null);
  const policiesMenuRef = useRef<HTMLDivElement>(null);
  const agentsMenuRef = useRef<HTMLDivElement>(null);
  const clientsMenuRef = useRef<HTMLDivElement>(null);

  const anyNavMenuOpen = casesMenuOpen || policiesMenuOpen || agentsMenuOpen || clientsMenuOpen;

  useEffect(() => {
    if (!anyNavMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (casesMenuRef.current?.contains(t)) return;
      if (policiesMenuRef.current?.contains(t)) return;
      if (agentsMenuRef.current?.contains(t)) return;
      if (clientsMenuRef.current?.contains(t)) return;
      setCasesMenuOpen(false);
      setPoliciesMenuOpen(false);
      setAgentsMenuOpen(false);
      setClientsMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setCasesMenuOpen(false);
      setPoliciesMenuOpen(false);
      setAgentsMenuOpen(false);
      setClientsMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [anyNavMenuOpen]);

  const folderById = new Map(MOCK_FOLDERS.map((f) => [f.id, f]));

  const getFolderStatusLozengeType = (id: string) => {
    const folder = folderById.get(id);
    const entity = getEntityFolderById(id);
    const datasetEntity = getEntityFolderViewFromDataset(activeDataset, id);
    const full = folder?.status ?? entity?.header.status ?? datasetEntity?.header.status ?? 'Active';
    return getStatusLozengeType(full, 'folder');
  };

  /* Partition opened folders into IP (sub-cases tree) and entity (sub-folder
   * groups tree). Anything with a known entity definition or matching the
   * entity id pattern is treated as entity; everything else stays IP. */
  const { ipOpenFolders, policyOpenFolders, agentOpenFolders, clientOpenFolders } = useMemo(() => {
    const ip: typeof openFolders = [];
    const policy: typeof openFolders = [];
    const agent: typeof openFolders = [];
    const client: typeof openFolders = [];
    for (const item of openFolders) {
      const kind = folderById.get(item.folderId)?.kind;
      const datasetEntityType = getDatasetEntityFolderType(activeDataset, item.folderId);
      const isEntity =
        kind === 'entity' ||
        (kind !== 'ip' && (isEntityFolderId(item.folderId) || !!datasetEntityType));
      if (!isEntity) {
        ip.push(item);
        continue;
      }
      const folderType =
        folderById.get(item.folderId)?.folderType ??
        getEntityFolderById(item.folderId)?.type ??
        datasetEntityType;
      if (folderType === 'agent') agent.push(item);
      else if (folderType === 'client') client.push(item);
      else policy.push(item);
    }
    return { ipOpenFolders: ip, policyOpenFolders: policy, agentOpenFolders: agent, clientOpenFolders: client };
  }, [activeDataset, openFolders]);

  const isEntityFolderActive = (id: string) =>
    folderId === id && !subCaseId && !childType && !childId;

  /* A group (Agents / Coverages / Participants list) is "active" only when the
   * user is on its list view itself — never when they have drilled into a
   * specific child. That keeps the active highlight on a single row at a time
   * (the list, OR the child — never both). */
  const isEntityGroupActive = (parentId: string, type: string) =>
    folderId === parentId && childType === type && !childId;

  const isEntityChildActive = (childIdParam: string) =>
    childId === childIdParam || params.nestedId === childIdParam;

  return (
    <div className="relative flex h-full min-h-0 min-w-0 overflow-x-visible">
      <aside
        className={`relative flex min-h-0 shrink-0 flex-col overflow-hidden ${UI_CLASS.workspaceTopLeftRadius} ${UI_CLASS.sidePanelBackground} border-r border-border-default ${sidePanelOpen ? 'z-10' : 'z-0'}`}
        style={{ width: effectivePanelWidth, transition: 'width 0.2s ease' }}
        aria-hidden={!sidePanelOpen}
      >
        {showPanelContent ? (
          <>
        <div className="px-5 pb-2 pt-4">
          <div className="mb-3">
            <h2 className="text-3xl font-semibold text-text-primary">{t('workspace.heading')}</h2>
          </div>
          <button
            onClick={() => navigate('/folders')}
            className={`flex w-full items-center gap-2.5 rounded-[8px] border px-2 py-2 text-left text-sm font-semibold ${
              location.pathname === '/folders'
                ? 'border-brand-blue/40 bg-white text-brand-blue'
                : 'border-transparent bg-transparent text-brand-navy hover:bg-[#f8f9fa]'
            }`}
          >
            <Folders className="h-[18px] w-[18px] shrink-0 opacity-[0.92]" strokeWidth={1.75} aria-hidden />
            <span>{t('workspace.allFolders')}</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-3">
          {sectionVisible.cases ? (
          <FoldersSidebarSection
            title={t('workspace.casesSection')}
            expanded={sectionExpanded.cases}
            onToggleExpanded={() => toggleSectionExpanded('cases')}
            menuOpen={casesMenuOpen}
            onMenuOpenChange={setCasesMenuOpen}
            menuRef={casesMenuRef}
            menuAriaLabel={t('workspace.casesMenuAria')}
            dropdown={
              <div role="menu" className={NAV_MENU_PANEL_CLASS}>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
                  onClick={() => {
                    collapseAllFolders();
                    setCasesMenuOpen(false);
                  }}
                >
                  {t('workspace.menu.collapseAll')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
                  onClick={() => {
                    clearOpenFolders();
                    setCasesMenuOpen(false);
                    navigate('/folders');
                  }}
                >
                  {t('workspace.menu.removeAll')}
                </button>
                <div className="my-1 h-px bg-border-divider" role="separator" />
                <button
                  type="button"
                  role="menuitem"
                  className="w-full px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
                  onClick={() => {
                    hideSection('cases');
                    setCasesMenuOpen(false);
                  }}
                >
                  {t('workspace.menu.hideSection')}
                </button>
              </div>
            }
            expandedContent={
              <div className="mb-3 mt-1 space-y-1">
              {ipOpenFolders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border-default bg-white/40 px-3 py-4 text-center text-[12px] leading-snug text-text-muted">
                  {t('workspace.empty.noCases')}
                </div>
              ) : null}
              {ipOpenFolders.map((item) => (
                <IpFolderRow
                  key={item.folderId}
                  folderId={item.folderId}
                  isFolderActive={folderId === item.folderId && !subCaseId}
                  isExpanded={expandedFolders.has(item.folderId)}
                  activeSubCaseId={folderId === item.folderId ? subCaseId : undefined}
                  statusType={getFolderStatusLozengeType(item.folderId)}
                  onNavigate={navigate}
                  onToggleExpanded={toggleFolderExpanded}
                  onExpand={expandFolder}
                  onRemove={(id) => {
                    removeOpenFolder(id);
                    if (folderId === id) navigate('/folders');
                  }}
                />
              ))}
              </div>
            }
          />
          ) : null}

          {sectionVisible.policies ? (
          <FoldersSidebarSection
            title={t('workspace.policiesSection')}
            expanded={sectionExpanded.policies}
            onToggleExpanded={() => toggleSectionExpanded('policies')}
            menuOpen={policiesMenuOpen}
            onMenuOpenChange={setPoliciesMenuOpen}
            menuRef={policiesMenuRef}
            menuAriaLabel={t('workspace.policiesMenuAria')}
            dropdown={
              <div role="menu" className={NAV_MENU_PANEL_CLASS}>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
                  onClick={() => {
                    collapseAllFolders();
                    setPoliciesMenuOpen(false);
                  }}
                >
                  {t('workspace.menu.collapseAll')}
                </button>
                <div className="my-1 h-px bg-border-divider" role="separator" />
                <button
                  type="button"
                  role="menuitem"
                  className="w-full px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
                  onClick={() => {
                    hideSection('policies');
                    setPoliciesMenuOpen(false);
                  }}
                >
                  {t('workspace.menu.hideSection')}
                </button>
              </div>
            }
            expandedContent={
              <div className="mb-3 mt-1 space-y-1">
                {policyOpenFolders.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border-default bg-white/40 px-3 py-4 text-center text-[12px] leading-snug text-text-muted">
                    {t('workspace.empty.noPolicies')}
                  </div>
                ) : null}
                {policyOpenFolders.map((item) => (
                  <PolicyFolderRow
                    key={item.folderId}
                    folderId={item.folderId}
                    isFolderActive={isEntityFolderActive(item.folderId)}
                    isExpanded={expandedFolders.has(item.folderId)}
                    expandedGroups={expandedGroups}
                    hiddenSubFolders={hiddenSubFolders}
                    isEntityGroupActive={isEntityGroupActive}
                    isEntityChildActive={isEntityChildActive}
                    onNavigate={navigate}
                    onToggleExpanded={toggleFolderExpanded}
                    onExpand={expandFolder}
                    onToggleGroup={toggleGroupExpanded}
                    onHideSubFolder={(def, group, hiddenId) => {
                      hideSubFolder(hiddenId);
                      /* If the hidden sub-folder is the active route,
                       * bounce back to the parent group's list view so the
                       * user isn't stranded on a hidden item. */
                      if (params.childId === hiddenId || params.nestedId === hiddenId) {
                        navigate(`/folders/${def.id}/${entitySlug(group.type)}`);
                      }
                    }}
                    onRemove={(id) => {
                      removeOpenFolder(id);
                      if (folderId === id) navigate('/folders');
                    }}
                  />
                ))}
              </div>
            }
          />
          ) : null}

          {sectionVisible.agents ? (
          <FoldersSidebarSection
            title={t('workspace.agentsSection')}
            expanded={sectionExpanded.agents}
            onToggleExpanded={() => toggleSectionExpanded('agents')}
            menuOpen={agentsMenuOpen}
            onMenuOpenChange={setAgentsMenuOpen}
            menuRef={agentsMenuRef}
            menuAriaLabel={t('workspace.agentsMenuAria')}
            dropdown={
              <div role="menu" className={NAV_MENU_PANEL_CLASS}>
                <button type="button" role="menuitem" className="w-full px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none" onClick={() => { collapseAllFolders(); setAgentsMenuOpen(false); }}>
                  {t('workspace.menu.collapseAll')}
                </button>
                <div className="my-1 h-px bg-border-divider" role="separator" />
                <button type="button" role="menuitem" className="w-full px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none" onClick={() => { hideSection('agents'); setAgentsMenuOpen(false); }}>
                  {t('workspace.menu.hideSection')}
                </button>
              </div>
            }
            expandedContent={
              <div className="mb-3 mt-1 space-y-1">
                {agentOpenFolders.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border-default bg-white/40 px-3 py-4 text-center text-[12px] leading-snug text-text-muted">
                    {t('workspace.empty.noAgents')}
                  </div>
                ) : null}
                {agentOpenFolders.map((item) => (
                  <PolicyFolderRow
                    key={item.folderId}
                    folderId={item.folderId}
                    isFolderActive={isEntityFolderActive(item.folderId)}
                    isExpanded={expandedFolders.has(item.folderId)}
                    expandedGroups={expandedGroups}
                    hiddenSubFolders={hiddenSubFolders}
                    isEntityGroupActive={isEntityGroupActive}
                    isEntityChildActive={isEntityChildActive}
                    onNavigate={navigate}
                    onToggleExpanded={toggleFolderExpanded}
                    onExpand={expandFolder}
                    onToggleGroup={toggleGroupExpanded}
                    onHideSubFolder={(def, group, hiddenId) => {
                      hideSubFolder(hiddenId);
                      if (params.childId === hiddenId || params.nestedId === hiddenId) {
                        navigate(`/folders/${def.id}/${entitySlug(group.type)}`);
                      }
                    }}
                    onRemove={(id) => {
                      removeOpenFolder(id);
                      if (folderId === id) navigate('/folders');
                    }}
                  />
                ))}
              </div>
            }
          />
          ) : null}

          {sectionVisible.clients ? (
          <FoldersSidebarSection
            title={t('workspace.clientsSection')}
            expanded={sectionExpanded.clients}
            onToggleExpanded={() => toggleSectionExpanded('clients')}
            menuOpen={clientsMenuOpen}
            onMenuOpenChange={setClientsMenuOpen}
            menuRef={clientsMenuRef}
            menuAriaLabel={t('workspace.clientsMenuAria')}
            dropdown={
              <div role="menu" className={NAV_MENU_PANEL_CLASS}>
                <button type="button" role="menuitem" className="w-full px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none" onClick={() => { collapseAllFolders(); setClientsMenuOpen(false); }}>
                  {t('workspace.menu.collapseAll')}
                </button>
                <div className="my-1 h-px bg-border-divider" role="separator" />
                <button type="button" role="menuitem" className="w-full px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none" onClick={() => { hideSection('clients'); setClientsMenuOpen(false); }}>
                  {t('workspace.menu.hideSection')}
                </button>
              </div>
            }
            expandedContent={
              <div className="mb-3 mt-1 space-y-1">
                {clientOpenFolders.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border-default bg-white/40 px-3 py-4 text-center text-[12px] leading-snug text-text-muted">
                    {t('workspace.empty.noClients')}
                  </div>
                ) : null}
                {clientOpenFolders.map((item) => (
                  <PolicyFolderRow
                    key={item.folderId}
                    folderId={item.folderId}
                    isFolderActive={isEntityFolderActive(item.folderId)}
                    isExpanded={expandedFolders.has(item.folderId)}
                    expandedGroups={expandedGroups}
                    hiddenSubFolders={hiddenSubFolders}
                    isEntityGroupActive={isEntityGroupActive}
                    isEntityChildActive={isEntityChildActive}
                    onNavigate={navigate}
                    onToggleExpanded={toggleFolderExpanded}
                    onExpand={expandFolder}
                    onToggleGroup={toggleGroupExpanded}
                    onHideSubFolder={(def, group, hiddenId) => {
                      hideSubFolder(hiddenId);
                      if (params.childId === hiddenId || params.nestedId === hiddenId) {
                        navigate(`/folders/${def.id}/${entitySlug(group.type)}`);
                      }
                    }}
                    onRemove={(id) => {
                      removeOpenFolder(id);
                      if (folderId === id) navigate('/folders');
                    }}
                  />
                ))}
              </div>
            }
          />
          ) : null}

          {!sectionVisible.cases && !sectionVisible.policies && !sectionVisible.agents && !sectionVisible.clients ? (
            <div className="rounded-lg border border-dashed border-border-default bg-white/40 px-3 py-6 text-center text-[12px] leading-snug text-text-muted">
              {t('workspace.empty.allSectionsHidden')}
              <button
                type="button"
                onClick={() => navigate('/folders')}
                className={`ml-1 ${TABLE_LINK_CLASS}`}
              >
                {t('workspace.allFolders')}
              </button>
              {' '}{t('workspace.empty.allSectionsHiddenSuffix')}
            </div>
          ) : null}
        </div>

        <SidePanelResizeStrip isResizing={isResizing} onResizePointerDown={() => setIsResizing(true)} />
          </>
        ) : null}
      </aside>
      <SidePanelToggle
        open={sidePanelOpen}
        panelWidth={effectivePanelWidth}
        panelEdgeOffset={effectivePanelWidth}
        closedOffset={peekWidth}
        layoutAnchored
        isResizing={isResizing}
        onToggle={() => {
          setIsResizing(false);
          setSidePanelOpen((prev) => !prev);
        }}
        ariaLabelOpen={t('workspace.panel.open')}
        ariaLabelClose={t('workspace.panel.close')}
      />

      {formOverlayActive ? (
        <div
          aria-hidden
          className="pointer-events-none"
          style={{
            position: 'fixed',
            top: LAYOUT_HEADER_HEIGHT_PX,
            left: 0,
            width: MAIN_NAV_WIDTH_PX + effectivePanelWidth,
            bottom: 0,
            zIndex: 25,
            backgroundColor: 'rgba(30, 41, 59, 0.18)',
            transition: 'width 0.2s ease',
          }}
        />
      ) : null}

      <div className="relative z-0 min-w-0 flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
