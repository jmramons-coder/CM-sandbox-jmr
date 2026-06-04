'use client';

import { useState } from 'react';
import { Checkbox } from '../ui/checkbox';
import type { CaseRequirementSuggestionsArtifact, CopilotExecuteAction } from '../AiCopilotFooter';

type SuggestionItem = CaseRequirementSuggestionsArtifact['items'][number];

function RequirementSuggestionItemCard({
  item,
  checked,
  onToggle,
}: {
  item: SuggestionItem;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <li
      className={`overflow-hidden rounded-lg border bg-white transition-colors ${
        checked ? 'border-brand-blue/25 bg-brand-blue-light' : 'border-border-soft'
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
          </div>
          <p className="mt-0.5 text-[12px] leading-relaxed text-text-muted">{item.reasoning}</p>
          {item.category ? (
            <p className="mt-1 text-[11px] text-text-muted">{item.category}</p>
          ) : null}
        </div>
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => onToggle(value === true)}
          aria-label={`Select ${item.label}`}
          className="mt-0.5 shrink-0"
        />
      </div>
    </li>
  );
}

export function CaseRequirementSuggestionsCard({
  artifact,
  onExecuteAction,
}: {
  artifact: CaseRequirementSuggestionsArtifact;
  onExecuteAction?: (action: CopilotExecuteAction) => void;
}) {
  const [selected, setSelected] = useState(
    () => new Set(artifact.items.map((item) => item.id)),
  );

  const toggle = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const count = selected.size;
  const total = artifact.items.length;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border-soft bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className="flex items-center border-b border-border-soft bg-surface-muted/30 px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-text-primary">AI suggested requirements</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
            {total} proposed · {count} selected · added to the case on approve
          </p>
        </div>
      </div>
      <div className="space-y-3 px-3.5 py-3">
        <ul className="space-y-2">
          {artifact.items.map((item) => (
            <RequirementSuggestionItemCard
              key={item.id}
              item={item}
              checked={selected.has(item.id)}
              onToggle={(checked) => toggle(item.id, checked)}
            />
          ))}
        </ul>
        <button
          type="button"
          disabled={!onExecuteAction || count === 0}
          onClick={() =>
            onExecuteAction?.({
              kind: 'apply_requirement_suggestions',
              caseId: artifact.caseId,
              taskId: artifact.taskId,
              requirementIds: [...selected],
            })
          }
          className="w-full rounded-lg bg-brand-blue px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-blue-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Approve & create on case ({count})
        </button>
      </div>
    </div>
  );
}
