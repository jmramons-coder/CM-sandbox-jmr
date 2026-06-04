'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SuggestedRequirementProposal } from '../../types';
import { Checkbox } from '../ui/checkbox';

function initialSelectedIds(proposals: SuggestedRequirementProposal[]): Set<string> {
  return new Set(
    proposals.filter((item) => item.defaultSelected !== false).map((item) => item.id),
  );
}

function RequirementSuggestionRow({
  item,
  checked,
  onToggle,
}: {
  item: SuggestedRequirementProposal;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <li
      className={`overflow-hidden rounded-lg border bg-white transition-colors ${
        checked ? 'border-brand-blue/25 bg-brand-blue-light' : 'border-border-soft bg-[#fafbfc]'
      }`}
    >
      <div className="flex items-start gap-2 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-semibold text-text-primary">{item.label}</span>
            {item.blocking ? (
              <span className="rounded-full bg-[#fde5e4] px-1.5 py-0.5 text-[10px] font-semibold text-brand-red">
                Blocking
              </span>
            ) : null}
            {item.sourceLabel ? (
              <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                {item.sourceLabel}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-[12px] leading-relaxed text-text-muted">{item.reasoning}</p>
          {item.category ? (
            <p className="mt-1 text-[11px] text-text-muted">{item.category}</p>
          ) : null}
        </div>
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => onToggle(value === true)}
          aria-label={`Include ${item.label} when approving`}
          className="mt-0.5 shrink-0"
        />
      </div>
    </li>
  );
}

export function TaskSuggestedRequirementsSection({
  proposals,
  selectedIds,
  onSelectionChange,
  className = '',
}: {
  proposals: SuggestedRequirementProposal[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  className?: string;
}) {
  const [sectionOpen, setSectionOpen] = useState(true);

  if (!proposals.length) return null;

  const selectedCount = selectedIds.size;
  const total = proposals.length;

  const toggle = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    onSelectionChange(next);
  };

  return (
    <section
      className={`overflow-hidden rounded-xl border border-border-soft bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] ${className}`}
    >
      <button
        type="button"
        onClick={() => setSectionOpen((value) => !value)}
        className="flex w-full items-center gap-2.5 border-b border-border-soft bg-surface-muted/30 px-3.5 py-3 text-left transition-colors hover:bg-surface-muted/50"
        aria-expanded={sectionOpen}
      >
        <ChevronDown
          className={`size-4 shrink-0 text-brand-blue transition-transform ${sectionOpen ? '' : '-rotate-90'}`}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="text-[13px] font-semibold text-text-primary">AI suggested requirements</span>
          <span className="mt-0.5 block text-[11px] text-text-secondary">
            {total} proposed · {selectedCount} selected · added to the case when you approve
          </span>
        </span>
      </button>

      {sectionOpen ? (
        <ul className="space-y-2 px-3.5 py-3">
          {proposals.map((item) => (
            <RequirementSuggestionRow
              key={item.id}
              item={item}
              checked={selectedIds.has(item.id)}
              onToggle={(checked) => toggle(item.id, checked)}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export { initialSelectedIds as buildInitialSuggestedRequirementSelection };
