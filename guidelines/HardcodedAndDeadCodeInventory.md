# Hardcoded And Dead Code Inventory

This inventory supports the app cleanup refactor. It focuses on code under `src/app`.

## Hardcoded Visual Values

- `src/app/components/CaseView.tsx`: highest concentration of inline hex colors, arbitrary sizes, status chip colors, and one-off alert styles.
- `src/app/components/PlatformSettingsModal.tsx`: many arbitrary spacing, color, and text-size classes.
- `src/app/components/DocumentModule.tsx`, `TaskModule.tsx`, `CasesModule.tsx`, `FoldersModule.tsx`: repeated table header classes, CTA shadows, status colors, sticky separators, and RAG dot colors.
- `src/app/components/FoldersWorkspace.tsx`, `CasesWorkspace.tsx`, `CopilotFullPage.tsx`: duplicated side-panel backgrounds, RAG maps, resize/toggle chrome, and sidebar tree styling.
- `src/app/components/entity/SubFolderFormShell.tsx`, `EntitySubFolderListView.tsx`: hardcoded form labels/placeholders and repeated control border colors.
- `src/app/components/LozengeTag.tsx`: semantic lozenge variants still include inline hex Tailwind classes even though `COLORS.status` exists.

## Duplicated Logic

- Status-to-lozenge mappings are duplicated in `FoldersWorkspace.tsx`, `FoldersModule.tsx`, `CasesModule.tsx`, `FolderView.tsx`, `TaskModule.tsx`, `DocumentModule.tsx`, and `EntityTableSectionCard.tsx`.
- RAG color mapping is duplicated in `FoldersWorkspace.tsx`, `CasesWorkspace.tsx`, `CaseView.tsx`, `CasesModule.tsx`, and `FoldersModule.tsx`.
- Module table scaffolding is repeated across `CasesModule.tsx`, `FoldersModule.tsx`, and `entity/EntitySubFolderListView.tsx`.
- Workspace side-panel behavior is repeated across `FoldersWorkspace.tsx`, `CasesWorkspace.tsx`, and `CopilotFullPage.tsx`.

## Dead Or Stale Code Candidates

- `generated-data-contexts/generic-smoke-context.json`: currently acts as a manual fixture; wire it into a test/import flow or move it to documentation if it is not a supported bundled seed.
- `src/app/domain/systemReadiness.ts`: documentation-style readiness inventory with no runtime importers; either surface it in Data Settings or move to docs.
- `src/app/components/eapp/EAppAiFeed.tsx`: helper exports are used by the eApp flow; keep only the used helper exports.
- `src/app/components/ui/*.tsx`: all current primitives should be checked with import search before removal; do not delete broad UI folders without a per-file audit.

## First Cleanup Targets

- Continue routing status and RAG display through `src/app/utils/status-display.ts`.
- Use `src/app/components/ModuleCellHelpers.tsx` for shared AI/source/summary cell patterns.
- Extend `design-tokens.ts` with reusable class fragments and sidebar/tree constants.
- Move folder sidebar tree pieces out of `FoldersWorkspace.tsx`.
- Add shared table header/table chrome primitives.
- Convert remaining form/table labels to i18n keys.
