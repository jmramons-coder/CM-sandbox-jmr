import { LayoutGrid, List, Plus, Upload } from 'lucide-react';
import type { EffectiveCaseTypeAnatomy } from '../../domain/entityAnatomy';
import { SearchBar } from '../ds';
import { resolveCaseTabDisplayLabel, type CaseTab } from './caseViewTypes';

/** Desktop tabs that render a data table (others are list/card-only). */
const CASE_TABS_WITH_TABLE = new Set<CaseTab>(['tasks', 'requirements', 'documents']);

type WorkTab = Exclude<CaseTab, 'overview' | 'decision'>;

export type CaseTabToolbarProps = {
  activeTab: WorkTab;
  isCompactShell: boolean;
  caseAnatomy: EffectiveCaseTypeAnatomy | undefined;
  workflowTabLabels?: string[];
  tabSearchQuery: string;
  onTabSearchChange: (value: string) => void;
  tabView: 'table' | 'list';
  onTabViewChange: (view: 'table' | 'list') => void;
  onAddRequirement: () => void;
  requirementCompletionPct: number;
  requirementKpis: {
    needsAttention: number;
    ordered: number;
    completed: number;
  };
  requirementTotalCount: number;
};

export function CaseTabToolbar({
  activeTab,
  isCompactShell,
  caseAnatomy,
  workflowTabLabels,
  tabSearchQuery,
  onTabSearchChange,
  tabView,
  onTabViewChange,
  onAddRequirement,
  requirementCompletionPct,
  requirementKpis,
  requirementTotalCount,
}: CaseTabToolbarProps) {
  const searchEnabled = activeTab === 'tasks' || activeTab === 'documents' || activeTab === 'requirements';

  return (
    <div className={`shrink-0 border-b border-border-default bg-surface-primary py-3 ${isCompactShell ? 'px-4' : 'px-6'}`}>
      <div className="flex items-center justify-between gap-4">
        {searchEnabled ? (
          <SearchBar
            containerClassName="min-w-0 flex-1 md:max-w-none"
            value={tabSearchQuery}
            onChange={onTabSearchChange}
            placeholder={
              activeTab === 'tasks'
                ? 'Search tasks…'
                : activeTab === 'documents'
                  ? 'Search documents…'
                  : 'Search requirements…'
            }
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        ) : (
          <div className="shrink-0">
            <h3 className="text-base font-semibold text-text-heading">
              {resolveCaseTabDisplayLabel(activeTab, { anatomy: caseAnatomy, workflowTabLabels })}
            </h3>
          </div>
        )}
        <div className="flex shrink-0 items-center gap-3">
          {activeTab === 'requirements' && (
            <button
              type="button"
              onClick={onAddRequirement}
              aria-label="Add requirement"
              className={
                isCompactShell
                  ? 'inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-brand-blue text-brand-blue transition-colors hover:bg-surface-selected'
                  : 'inline-flex items-center gap-1.5 rounded-full border border-brand-blue px-3 py-1.5 text-xs font-semibold leading-none text-brand-blue transition-colors hover:bg-surface-selected'
              }
            >
              <Plus className={isCompactShell ? 'h-5 w-5' : 'h-3 w-3'} />
              {!isCompactShell ? <span>ADD REQUIREMENT</span> : null}
            </button>
          )}
          {activeTab === 'documents' && !isCompactShell ? (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue transition-colors hover:bg-surface-selected"
            >
              <Upload className="h-3.5 w-3.5" />
              ADD DOCUMENT
            </button>
          ) : null}
          {activeTab === 'documents' && isCompactShell ? (
            <button
              type="button"
              aria-label="Add document"
              className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-brand-blue text-brand-blue transition-colors hover:bg-surface-selected"
            >
              <Upload className="h-5 w-5" />
            </button>
          ) : null}
          {activeTab !== 'scoring' && !isCompactShell && CASE_TABS_WITH_TABLE.has(activeTab) ? (
            <div className="overflow-hidden rounded-full border border-border-default bg-white p-0.5">
              <button
                type="button"
                onClick={() => onTabViewChange('table')}
                className={`rounded-full p-1.5 ${tabView === 'table' ? 'bg-brand-blue text-white' : 'text-text-secondary hover:bg-surface-muted'}`}
                title="Table view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onTabViewChange('list')}
                className={`rounded-full p-1.5 ${tabView === 'list' ? 'bg-brand-blue text-white' : 'text-text-secondary hover:bg-surface-muted'}`}
                title="List view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {activeTab === 'requirements' ? (
        <div className="mt-3 flex flex-wrap items-center gap-5 border-t border-border-soft pt-3">
          {[
            { label: 'Complete', value: `${requirementCompletionPct}%`, className: 'text-brand-green' },
            { label: 'Attention', value: requirementKpis.needsAttention, className: requirementKpis.needsAttention > 0 ? 'text-brand-red' : 'text-text-primary' },
            { label: 'Progress', value: requirementKpis.ordered, className: 'text-brand-blue' },
            { label: 'Completed', value: requirementKpis.completed, className: 'text-brand-green' },
            { label: 'Total', value: requirementTotalCount, className: 'text-text-primary' },
          ].map((item) => (
            <div key={item.label} className="min-w-[56px] text-center">
              <p className={`text-[14px] font-semibold leading-none ${item.className}`}>{item.value}</p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.35px] text-text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
