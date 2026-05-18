import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useDataSourceSettings } from './PlatformSettingsContext';
import {
  getDatasetEntityFolderType,
  getEntityFolderViewFromDataset,
  type DatasetEntityFolderType,
} from '../data/entityReadModels';
import { DEFAULT_OPEN_FOLDERS, MOCK_FOLDERS } from '../data/mock-folders';
import { getEntityFolderById, isEntityFolderId } from '../data/mock-entity-folders';
import { filterDatasetBySettings, getSystemDataset } from '../data/objectRepository';
import type { FolderNavItem } from '../types';

/* Section identifier used for visibility / expansion state. */
export type FoldersSidebarSectionId = 'cases' | 'policies' | 'agents' | 'clients';

type FoldersNavContextValue = {
  /* Open folders tracked in the sidebar. */
  openFolders: FolderNavItem[];
  addOpenFolder: (folderId: string) => void;
  removeOpenFolder: (folderId: string) => void;
  clearOpenFolders: () => void;

  /* Per-folder tree expansion. New folders are auto-expanded the first time
   * they're opened so the user immediately sees their sub-sections; subsequent
   * manual collapses are preserved. State is held in context so it survives
   * navigating to other modules and back. */
  expandedFolders: Set<string>;
  toggleFolderExpanded: (folderId: string) => void;
  /** Force a folder into the expanded state (idempotent — no-op if already expanded). */
  expandFolder: (folderId: string) => void;
  collapseAllFolders: () => void;

  /* Per-sub-folder-group expansion (key = "<parentId>:<groupType>"). */
  expandedGroups: Set<string>;
  toggleGroupExpanded: (key: string) => void;

  /* Section visibility — when hidden the whole section is removed from the
   * sidebar. Adding a folder of that type re-shows the section. */
  sectionVisible: Record<FoldersSidebarSectionId, boolean>;
  hideSection: (section: FoldersSidebarSectionId) => void;
  showSection: (section: FoldersSidebarSectionId) => void;

  /* Section header expand/collapse state (the "+ / −" toggle). */
  sectionExpanded: Record<FoldersSidebarSectionId, boolean>;
  toggleSectionExpanded: (section: FoldersSidebarSectionId) => void;

  /* Sub-folder leaves the user has explicitly hidden from the tree (e.g. an
   * individual Agent / Coverage / Participant under a Policy). Persisted in
   * context so the hidden state survives module navigation. Re-displaying is
   * done by navigating to that sub-folder's overview (handled where the
   * navigation occurs via showSubFolder). */
  hiddenSubFolders: Set<string>;
  hideSubFolder: (folderId: string) => void;
  showSubFolder: (folderId: string) => void;

  /* Full-page form overlay flag — when true, the workspace renders a branded
   * overlay covering the vertical nav and folder sidebar. */
  formOverlayActive: boolean;
  setFormOverlayActive: (active: boolean) => void;
};

const FoldersNavContext = createContext<FoldersNavContextValue | null>(null);

/** Returns the sidebar section for IP folders and top-level entity folders. */
function sectionForFolderId(
  folderId: string,
  datasetEntityType?: DatasetEntityFolderType,
): FoldersSidebarSectionId {
  const known = MOCK_FOLDERS.find((f) => f.id === folderId);
  if (known?.kind === 'entity') {
    if (known.folderType === 'agent') return 'agents';
    if (known.folderType === 'client') return 'clients';
    return 'policies';
  }
  if (known?.kind === 'ip') return 'cases';
  const entity = getEntityFolderById(folderId);
  if (entity?.type === 'agent') return 'agents';
  if (entity?.type === 'client') return 'clients';
  if (datasetEntityType === 'agent') return 'agents';
  if (datasetEntityType === 'client') return 'clients';
  if (datasetEntityType === 'policy' || datasetEntityType === 'application') return 'policies';
  if (isEntityFolderId(folderId)) return 'policies';
  return 'cases';
}

export function FoldersNavProvider({ children }: React.PropsWithChildren) {
  const dataSource = useDataSourceSettings();
  const activeDataset = useMemo(
    () => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource),
    [dataSource],
  );
  const [openFolders, setOpenFolders] = useState<FolderNavItem[]>(DEFAULT_OPEN_FOLDERS);
  /* Folders default to COLLAPSED in the sidebar. The user expands them by
   * clicking the caret on the folder row. */
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());
  const [sectionVisible, setSectionVisible] = useState<Record<FoldersSidebarSectionId, boolean>>({
    cases: true,
    policies: true,
    agents: true,
    clients: true,
  });
  const [sectionExpanded, setSectionExpanded] = useState<Record<FoldersSidebarSectionId, boolean>>({
    cases: false,
    policies: true,
    agents: true,
    clients: true,
  });
  const [hiddenSubFolders, setHiddenSubFolders] = useState<Set<string>>(() => new Set());
  const [formOverlayActive, setFormOverlayActive] = useState(false);

  const showSection = useCallback((section: FoldersSidebarSectionId) => {
    setSectionVisible((prev) => (prev[section] ? prev : { ...prev, [section]: true }));
    setSectionExpanded((prev) => (prev[section] ? prev : { ...prev, [section]: true }));
  }, []);

  const hideSection = useCallback((section: FoldersSidebarSectionId) => {
    setSectionVisible((prev) => (prev[section] ? { ...prev, [section]: false } : prev));
  }, []);

  const toggleSectionExpanded = useCallback((section: FoldersSidebarSectionId) => {
    setSectionExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const addOpenFolder = useCallback(
    (folderId: string) => {
      const datasetEntityType = getDatasetEntityFolderType(activeDataset, folderId);
      /* Re-show the corresponding section in case it was hidden via the kebab.
       * Adding from /folders should always make the new folder visible. */
      showSection(sectionForFolderId(folderId, datasetEntityType));
      setOpenFolders((prev) => {
        if (prev.some((f) => f.folderId === folderId)) return prev;
        /* Newly added folders are auto-expanded so the user can see their
         * sub-sections immediately on first open. Manual collapses on
         * already-open folders are preserved (we only expand here when the
         * folder isn't already in the open list). */
        setExpandedFolders((expPrev) => {
          if (expPrev.has(folderId)) return expPrev;
          const next = new Set(expPrev);
          next.add(folderId);
          return next;
        });
        const folder = MOCK_FOLDERS.find((f) => f.id === folderId);
        if (folder) {
          return [
            {
              folderId,
              claimant: folder.claimant,
              rag: folder.rag,
              subCases: folder.subCases.map((sc) => ({ id: sc.id, label: sc.label })),
            },
            ...prev,
          ];
        }
        /* Fallback for entity folders that aren't (yet) in MOCK_FOLDERS — pull
         * from the entity registry so the sidebar can still track them. */
        const entity = getEntityFolderById(folderId);
        if (entity) {
          return [
            {
              folderId,
              claimant: entity.header.title,
              rag: 'Green',
              subCases: [],
            },
            ...prev,
          ];
        }
        const datasetFolder = getEntityFolderViewFromDataset(activeDataset, folderId);
        if (datasetFolder) {
          return [
            {
              folderId,
              claimant: datasetFolder.header.title,
              rag: 'Green',
              subCases: [],
            },
            ...prev,
          ];
        }
        return prev;
      });
    },
    [activeDataset, showSection],
  );

  const removeOpenFolder = useCallback((folderId: string) => {
    setOpenFolders((prev) => prev.filter((f) => f.folderId !== folderId));
    setExpandedFolders((prev) => {
      if (!prev.has(folderId)) return prev;
      const next = new Set(prev);
      next.delete(folderId);
      return next;
    });
  }, []);

  const clearOpenFolders = useCallback(() => {
    setOpenFolders([]);
    setExpandedFolders(new Set());
  }, []);

  const toggleFolderExpanded = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  }, []);

  const expandFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      if (prev.has(folderId)) return prev;
      const next = new Set(prev);
      next.add(folderId);
      return next;
    });
  }, []);

  const collapseAllFolders = useCallback(() => {
    setExpandedFolders(new Set());
    setExpandedGroups(new Set());
  }, []);

  const toggleGroupExpanded = useCallback((key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const hideSubFolder = useCallback((folderId: string) => {
    setHiddenSubFolders((prev) => {
      if (prev.has(folderId)) return prev;
      const next = new Set(prev);
      next.add(folderId);
      return next;
    });
  }, []);

  const showSubFolder = useCallback((folderId: string) => {
    setHiddenSubFolders((prev) => {
      if (!prev.has(folderId)) return prev;
      const next = new Set(prev);
      next.delete(folderId);
      return next;
    });
  }, []);

  const value = useMemo<FoldersNavContextValue>(
    () => ({
      openFolders,
      addOpenFolder,
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
      showSection,
      sectionExpanded,
      toggleSectionExpanded,
      hiddenSubFolders,
      hideSubFolder,
      showSubFolder,
      formOverlayActive,
      setFormOverlayActive,
    }),
    [
      openFolders,
      addOpenFolder,
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
      showSection,
      sectionExpanded,
      toggleSectionExpanded,
      hiddenSubFolders,
      hideSubFolder,
      showSubFolder,
      formOverlayActive,
    ],
  );

  return <FoldersNavContext.Provider value={value}>{children}</FoldersNavContext.Provider>;
}

export function useFoldersNav() {
  const ctx = useContext(FoldersNavContext);
  if (!ctx) {
    throw new Error('useFoldersNav must be used within FoldersNavProvider');
  }
  return ctx;
}
