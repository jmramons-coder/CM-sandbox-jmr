import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { cn } from '../ui/utils';
import type { AiAssistTarget, AiSuggestedQuestion } from './eappAiAssistData';

export function EAppAiAssistPanel({
  targets,
  sectionTitles,
  expandedTargetId,
  onAnswer,
  onExpandedTargetChange,
  onJumpToField,
}: {
  targets: AiAssistTarget[];
  sectionTitles: Record<string, string>;
  expandedTargetId: string | null;
  onAnswer: (fieldId: string, val: unknown) => void;
  onExpandedTargetChange: (targetId: string | null) => void;
  onJumpToField: (fieldId: string) => void;
}) {
  const [checkedQs, setCheckedQs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (targets.length === 0) {
      onExpandedTargetChange(null);
      return;
    }
    const expandedTargetStillVisible = targets.some((target) => target.id === expandedTargetId);
    if (!expandedTargetStillVisible) {
      onExpandedTargetChange(targets[0].id);
    }
  }, [expandedTargetId, onExpandedTargetChange, targets]);

  const groupedTargets = useMemo(() => {
    const groups: Array<{ sectionId: string; title: string; targets: AiAssistTarget[] }> = [];
    for (const target of targets) {
      let group = groups.find((item) => item.sectionId === target.sectionId);
      if (!group) {
        group = {
          sectionId: target.sectionId,
          title: sectionTitles[target.sectionId] ?? target.sectionId,
          targets: [],
        };
        groups.push(group);
      }
      group.targets.push(target);
    }
    return groups;
  }, [sectionTitles, targets]);

  const toggleQuestion = (q: AiSuggestedQuestion) => {
    setCheckedQs((prev) => {
      const next = new Set(prev);
      if (next.has(q.id)) {
        next.delete(q.id);
      } else {
        next.add(q.id);
        if (q.fieldId && q.prefillValue) {
          onAnswer(q.fieldId, q.prefillValue);
        }
      }
      return next;
    });
  };

  const toggleTarget = (target: AiAssistTarget) => {
    const expanded = expandedTargetId === target.id;
    onExpandedTargetChange(expanded ? null : target.id);
  };

  return (
    <div className="flex h-full w-full flex-col bg-surface-muted">
      <div className="shrink-0 border-b border-border-default bg-surface-muted px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-text-muted">
              AI assist
            </div>
            <h3 className="mt-1 text-[18px] font-semibold leading-tight text-text-primary">Insights</h3>
          </div>
          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-text-secondary ring-1 ring-border-soft">
            {targets.length}
          </span>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">
          Actionable next steps for this page.
        </p>
      </div>

      <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {targets.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <h3 className="text-[18px] font-semibold text-text-primary">No AI suggestions for this step yet.</h3>
            <p className="mt-2 max-w-[230px] text-[13px] leading-relaxed text-text-secondary">
              We'll surface guidance here as you fill in details.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {groupedTargets.map((group) => (
              <section key={group.sectionId} className="flex flex-col gap-2">
                <div className="px-1">
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.4px] text-text-muted">
                    {group.title}
                  </h4>
                </div>
                {group.targets.map((target) => (
                  <InsightRow
                    key={target.id}
                    target={target}
                    expanded={expandedTargetId === target.id}
                    checkedQuestions={checkedQs}
                    onToggle={() => toggleTarget(target)}
                    onToggleQuestion={toggleQuestion}
                    onJumpToField={onJumpToField}
                  />
                ))}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InsightRow({
  target,
  expanded,
  checkedQuestions,
  onToggle,
  onToggleQuestion,
  onJumpToField,
}: {
  target: AiAssistTarget;
  expanded: boolean;
  checkedQuestions: Set<string>;
  onToggle: () => void;
  onToggleQuestion: (question: AiSuggestedQuestion) => void;
  onJumpToField: (fieldId: string) => void;
}) {
  const question = target.panel.suggestedQuestions[0];
  const questionChecked = question ? checkedQuestions.has(question.id) : false;

  return (
    <article
      className={cn(
        'rounded-xl border bg-white transition-colors',
        expanded ? 'border-brand-accent/35' : 'border-border-soft hover:border-border-default',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-2.5 px-3 py-3 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="truncate text-[14px] font-semibold leading-snug text-text-primary">{target.label}</span>
          <span className="mt-1 line-clamp-2 text-[13px] font-normal leading-snug text-text-secondary">
            {target.bestAction}
          </span>
        </span>
      </button>

      {expanded ? (
        <div className="border-t border-border-divider px-3 pb-3 pt-3">
          {question ? (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.4px] text-text-muted">
                Ask
              </p>
              <button
                type="button"
                onClick={() => onToggleQuestion(question)}
                className={cn(
                  'flex w-full items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors',
                  questionChecked
                    ? 'border-brand-accent/20 bg-brand-accent-light/25'
                    : 'border-border-divider bg-[#f8f9fa] hover:bg-white',
                )}
              >
                {questionChecked ? (
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand-accent" />
                ) : (
                  <Circle className="mt-0.5 size-3.5 shrink-0 text-[#c4cbd2]" />
                )}
                <span className={cn('text-[12px] font-medium leading-snug', questionChecked ? 'text-brand-accent' : 'text-text-primary')}>
                  {question.label}
                </span>
              </button>
            </div>
          ) : null}

          {target.fieldId ? (
            <button
              type="button"
              onClick={() => {
                if (target.fieldId) onJumpToField(target.fieldId);
              }}
              className="mt-3 inline-flex items-center rounded-full border border-border-default bg-white px-3 py-1.5 text-[11px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
            >
              Jump to field
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
