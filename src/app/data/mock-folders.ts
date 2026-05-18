import { CASE_OVERVIEWS } from './mock-cases';
import type { CaseOverview, FolderNavItem, FolderSummary } from '../types';

/**
 * The mock folders are authored in English here as a baseline. Translated
 * views are produced by the selectors in `useFolders.ts`, which look up
 * `fixtures:folders.<id>.*` keys for the active language and fall back to
 * these values when no translation is provided.
 */
export type FolderRecord = FolderSummary;

export const MOCK_FOLDERS: FolderRecord[] = [
  {
    id: 'FLD-5546112',
    folderType: 'case',
    claimant: 'Billy Bud',
    product: 'Guardian IP · 8 wk deferred',
    benefit: '£11,250/mo',
    status: 'Active',
    rag: 'Green',
    created: 'Feb 12, 2026',
    subCases: [
      {
        id: 'SC-PRE-5546112',
        label: 'Case 1: Pre-Approval',
        phase: 'pre-approval',
        status: 'Pending Decision',
        rag: 'Green',
        activeStage: 5,
        owner: 'Victor Ramon',
      },
      {
        id: 'SC-POST-5546112',
        label: 'Case 2: Post-Approval',
        phase: 'post-approval',
        status: 'Not Started',
        rag: 'Green',
        activeStage: 0,
        owner: 'Unassigned',
      },
    ],
  },
  {
    id: 'FLD-7622343',
    folderType: 'case',
    claimant: 'Marc Tremblay',
    product: 'Guardian IP · 4 wk deferred',
    benefit: '£6,200/mo',
    status: 'Active',
    rag: 'Amber',
    created: 'Mar 10, 2026',
    subCases: [
      {
        id: 'SC-PRE-7622343',
        label: 'Case 1: Pre-Approval',
        phase: 'pre-approval',
        status: 'Completed',
        rag: 'Green',
        activeStage: 6,
        owner: 'Victor Ramon',
      },
      {
        id: 'SC-POST-7622343',
        label: 'Case 2: Post-Approval',
        phase: 'post-approval',
        status: 'Recovery Underway',
        rag: 'Amber',
        activeStage: 2,
        owner: 'Victor Ramon',
      },
    ],
  },
  {
    id: 'FLD-998987',
    folderType: 'case',
    claimant: 'Elena Rossi',
    product: 'Guardian IP · 13 wk deferred',
    benefit: '£5,100/mo',
    status: 'Active',
    rag: 'Green',
    created: 'Jan 28, 2026',
    subCases: [
      {
        id: 'SC-PRE-998987',
        label: 'Case 1: Pre-Approval',
        phase: 'pre-approval',
        status: 'Completed',
        rag: 'Green',
        activeStage: 6,
        owner: 'Sophie Laurent',
      },
      {
        id: 'SC-POST-998987',
        label: 'Case 2: Post-Approval',
        phase: 'post-approval',
        status: 'RTW Planning',
        rag: 'Green',
        activeStage: 4,
        owner: 'Sophie Laurent',
      },
    ],
  },
  /* New entity-style folder. Renders via FolderRouter -> EntityFolderOverview. */
  {
    id: 'POL-9847231',
    kind: 'entity',
    folderType: 'policy',
    claimant: 'Tremblay, Marc',
    product: 'Whole Life · Performax Gold',
    benefit: '—',
    status: 'Active',
    rag: 'Green',
    created: 'Apr 15, 2019',
    subCases: [],
  },
  {
    id: 'CLI-MARC',
    kind: 'entity',
    folderType: 'client',
    claimant: 'Tremblay, Marc',
    product: 'Client · Policyholder',
    benefit: 'POL-9847231',
    status: 'Active',
    rag: 'Green',
    created: 'Nov 3, 1982',
    subCases: [],
  },
  {
    id: 'AGT-BEAULIEU',
    kind: 'entity',
    folderType: 'agent',
    claimant: 'Beaulieu, Nathalie',
    product: 'Agent · Primary Servicing Agent',
    benefit: 'POL-9847231',
    status: 'Active',
    rag: 'Green',
    created: 'Mar 22, 2011',
    subCases: [],
  },
];

const SOURCE_CASE_MAP: Record<string, string> = {
  'FLD-5546112': 'IP26-5546112',
  'FLD-7622343': 'IP66-7622343',
  'FLD-998987': 'WP66-998987',
};

function buildSubCaseOverview(
  folderId: string,
  subCaseId: string,
  phase: 'pre-approval' | 'post-approval',
  activeStage: number,
): CaseOverview {
  const sourceCaseId = SOURCE_CASE_MAP[folderId];
  const base = CASE_OVERVIEWS[sourceCaseId] ?? CASE_OVERVIEWS['IP26-5546112'];

  return {
    ...base,
    id: subCaseId,
    phase,
    stageLabels: phase === 'pre-approval' ? base.preApprovalStages : base.postApprovalStages,
    activeStage,
    requirements: base.requirements.filter((r) => r.phase === phase),
  };
}

export const FOLDER_OVERVIEWS: Record<string, CaseOverview> = {};

for (const folder of MOCK_FOLDERS) {
  for (const sc of folder.subCases) {
    FOLDER_OVERVIEWS[`${folder.id}/${sc.id}`] = buildSubCaseOverview(
      folder.id,
      sc.id,
      sc.phase,
      sc.activeStage,
    );
  }
}

export const DEFAULT_OPEN_FOLDERS: FolderNavItem[] = [
  {
    folderId: 'FLD-5546112',
    claimant: 'Billy Bud',
    rag: 'Green',
    subCases: [
      { id: 'SC-PRE-5546112', label: 'Case 1: Pre-Approval' },
      { id: 'SC-POST-5546112', label: 'Case 2: Post-Approval' },
    ],
  },
  {
    folderId: 'FLD-7622343',
    claimant: 'Marc Tremblay',
    rag: 'Amber',
    subCases: [
      { id: 'SC-PRE-7622343', label: 'Case 1: Pre-Approval' },
      { id: 'SC-POST-7622343', label: 'Case 2: Post-Approval' },
    ],
  },
  /* Pre-open the demo Policy so the entity tree is visible from first load. */
  {
    folderId: 'POL-9847231',
    claimant: 'Tremblay, Marc',
    rag: 'Green',
    subCases: [],
  },
  {
    folderId: 'CLI-MARC',
    claimant: 'Tremblay, Marc',
    rag: 'Green',
    subCases: [],
  },
  {
    folderId: 'AGT-BEAULIEU',
    claimant: 'Beaulieu, Nathalie',
    rag: 'Green',
    subCases: [],
  },
  {
    folderId: 'FLD-998987',
    claimant: 'Elena Rossi',
    rag: 'Green',
    subCases: [
      { id: 'SC-PRE-998987', label: 'Case 1: Pre-Approval' },
      { id: 'SC-POST-998987', label: 'Case 2: Post-Approval' },
    ],
  },
];

export function getFolderOverview(folderId: string, subCaseId: string): CaseOverview | undefined {
  return FOLDER_OVERVIEWS[`${folderId}/${subCaseId}`];
}

export function getFolderById(folderId: string): FolderSummary | undefined {
  return MOCK_FOLDERS.find((f) => f.id === folderId);
}
