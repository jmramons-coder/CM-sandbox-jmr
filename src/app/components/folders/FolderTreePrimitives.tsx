import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { useTranslatedEntityFolder } from '../../data/useFolders';
import { useDataSourceSettings } from '../../contexts/PlatformSettingsContext';
import { filterDatasetBySettings, getSystemDataset } from '../../data/objectRepository';
import { getEntityFolderViewFromDataset } from '../../data/entityReadModels';
import { resolveEntityFolderId } from '../../data/gi-demo-entity-records';

export function TreeBranch({
  isFirst,
  isLast: _isLast = false,
  isActive: _isActive = false,
  shortenFirstTail,
}: {
  isFirst: boolean;
  isLast?: boolean;
  isActive?: boolean;
  shortenFirstTail?: boolean;
}) {
  return null;
}

export function TreeCaret({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      width={10}
      height={10}
      viewBox="0 0 10 10"
      className={`shrink-0 ${className ?? ''}`}
      aria-hidden
    >
      {open ? (
        <path d="M1.5 3 L5 7.5 L8.5 3Z" fill="currentColor" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" strokeWidth="2.2" />
      ) : (
        <path d="M3 1.5 L7.5 5 L3 8.5Z" fill="currentColor" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" strokeWidth="2.2" />
      )}
    </svg>
  );
}

export function EntitySubFolderLeafRow({
  childId,
  parentId,
  slug,
  isActive,
  isFirst,
  isLast,
  shortenFirstTail,
  onHideChild,
  onNavigate,
}: {
  childId: string;
  parentId: string;
  slug: string;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  shortenFirstTail: boolean;
  onHideChild: (id: string) => void;
  onNavigate: (path: string) => void;
}) {
  const { t } = useTranslation('folders');
  const dataSource = useDataSourceSettings();
  const activeDataset = useMemo(
    () => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource),
    [dataSource],
  );
  const resolvedChildId = resolveEntityFolderId(childId) ?? childId;
  const childDef = useTranslatedEntityFolder(resolvedChildId);
  const datasetChild = useMemo(
    () => getEntityFolderViewFromDataset(activeDataset, resolvedChildId),
    [activeDataset, resolvedChildId],
  );
  const label = datasetChild?.header.title ?? childDef?.header.title ?? childId;
  const removeLabel = t('workspace.removeAria', { label });

  return (
    <div className="relative">
      <TreeBranch
        isFirst={isFirst}
        isLast={isLast}
        isActive={isActive}
        shortenFirstTail={shortenFirstTail}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => onNavigate(`/folders/${parentId}/${slug}/${childId}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigate(`/folders/${parentId}/${slug}/${childId}`);
          }
        }}
        className={`group -ml-[6px] flex w-[calc(100%+6px)] cursor-pointer items-center gap-2 rounded-[8px] border px-2 py-1.5 text-left text-[12px] transition-colors ${
          isActive
            ? 'border-brand-blue-border bg-white font-semibold text-brand-blue'
            : 'border-transparent text-brand-navy hover:border-brand-blue-border hover:bg-surface-selected-alt'
        }`}
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span
          role="button"
          tabIndex={-1}
          aria-label={removeLabel}
          title={t('workspace.removeTitle')}
          className="inline-flex shrink-0 rounded p-0.5 text-[#60666e] hover:bg-[#dbdee1]"
          onClick={(e) => {
            e.stopPropagation();
            onHideChild(childId);
          }}
        >
          <X className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}
