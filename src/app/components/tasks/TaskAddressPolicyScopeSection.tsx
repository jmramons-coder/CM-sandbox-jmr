'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { AddressChangeDurationKind, AddressChangePolicyScopePayload } from '../../types';
import { Checkbox } from '../ui/checkbox';

export function buildInitialAddressPolicyScopeSelection(
  scope: AddressChangePolicyScopePayload,
): Set<string> {
  if (scope.defaultSelectedPolicyIds?.length) {
    return new Set(scope.defaultSelectedPolicyIds);
  }
  return new Set(
    scope.policies.filter((policy) => policy.defaultSelected !== false).map((policy) => policy.id),
  );
}

function PolicyScopeRow({
  label,
  detail,
  checked,
  onToggle,
}: {
  label: string;
  detail?: string;
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
          <span className="text-[13px] font-semibold text-text-primary">{label}</span>
          {detail ? <p className="mt-0.5 text-[12px] leading-relaxed text-text-muted">{detail}</p> : null}
        </div>
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => onToggle(value === true)}
          aria-label={`Apply address change to ${label}`}
          className="mt-0.5 shrink-0"
        />
      </div>
    </li>
  );
}

function DurationOption({
  label,
  description,
  selected,
  onSelect,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
        selected
          ? 'border-brand-blue/30 bg-brand-blue-light shadow-[inset_0_0_0_1px_rgba(0,82,204,0.12)]'
          : 'border-border-soft bg-[#fafbfc] hover:border-border-default hover:bg-white'
      }`}
    >
      <span
        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
          selected ? 'border-brand-blue bg-brand-blue' : 'border-border-default bg-white'
        }`}
        aria-hidden
      >
        {selected ? <span className="size-1.5 rounded-full bg-white" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-[13px] font-semibold text-text-primary">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[12px] leading-relaxed text-text-secondary">{description}</span>
        ) : null}
      </span>
    </button>
  );
}

export function TaskAddressPolicyScopeSection({
  scope,
  selectedPolicyIds,
  onSelectedPolicyIdsChange,
  duration,
  onDurationChange,
  className = '',
}: {
  scope: AddressChangePolicyScopePayload;
  selectedPolicyIds: Set<string>;
  onSelectedPolicyIdsChange: (ids: Set<string>) => void;
  duration: AddressChangeDurationKind;
  onDurationChange: (duration: AddressChangeDurationKind) => void;
  className?: string;
}) {
  const [sectionOpen, setSectionOpen] = useState(true);

  if (!scope.policies.length) return null;

  const selectedCount = selectedPolicyIds.size;
  const total = scope.policies.length;

  const togglePolicy = (id: string, checked: boolean) => {
    const next = new Set(selectedPolicyIds);
    if (checked) next.add(id);
    else next.delete(id);
    onSelectedPolicyIdsChange(next);
  };

  const temporaryDescription = scope.temporaryEndDate
    ? `Through ${scope.temporaryEndDate}${scope.temporaryNote ? ` · ${scope.temporaryNote}` : ''}`
    : scope.temporaryNote;

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
          <span className="text-[13px] font-semibold text-text-primary">Policies & duration</span>
          <span className="mt-0.5 block text-[11px] text-text-secondary">
            {selectedCount} of {total} policies selected · effective {scope.effectiveDate}
          </span>
        </span>
      </button>

      {sectionOpen ? (
        <div className="space-y-4 px-3.5 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24px] text-text-muted">
              Apply change to
            </p>
            <ul className="mt-2 space-y-2">
              {scope.policies.map((policy) => (
                <PolicyScopeRow
                  key={policy.id}
                  label={policy.label}
                  detail={policy.detail}
                  checked={selectedPolicyIds.has(policy.id)}
                  onToggle={(checked) => togglePolicy(policy.id, checked)}
                />
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24px] text-text-muted">
              Change duration
            </p>
            <div className="mt-2 space-y-2">
              <DurationOption
                label="Permanent"
                description="Update mailing address until changed again"
                selected={duration === 'permanent'}
                onSelect={() => onDurationChange('permanent')}
              />
              <DurationOption
                label="Temporary"
                description={temporaryDescription ?? 'Forwarding or seasonal address for a limited period'}
                selected={duration === 'temporary'}
                onSelect={() => onDurationChange('temporary')}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
