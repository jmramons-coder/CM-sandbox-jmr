'use client';

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { AddressChangeDecisionPayload } from '../../types';

export function buildInitialAddressDecisionSelection(
  decision: AddressChangeDecisionPayload,
): string {
  const defaultOption = decision.options.find((option) => option.id === decision.defaultOptionId);
  const recommended = decision.options.find((option) => option.recommended);
  return defaultOption?.id ?? recommended?.id ?? decision.options[0]?.id ?? '';
}

function AddressOptionRow({
  option,
  selected,
  onSelect,
}: {
  option: AddressChangeDecisionPayload['options'][number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
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
            selected ? 'border-brand-blue bg-brand-blue text-white' : 'border-border-default bg-white'
          }`}
          aria-hidden
        >
          {selected ? <Check className="size-2.5" strokeWidth={3} /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-semibold text-text-primary">{option.label}</span>
            {option.recommended ? (
              <span className="rounded-full bg-brand-blue-light px-1.5 py-0.5 text-[10px] font-semibold text-brand-blue">
                Recommended
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block text-[11px] font-medium text-text-muted">{option.source}</span>
          {option.diffNote ? (
            <span className="mt-1 block text-[12px] leading-relaxed text-text-secondary">{option.diffNote}</span>
          ) : null}
        </span>
      </button>
    </li>
  );
}

export function TaskAddressDecisionSection({
  decision,
  selectedOptionId,
  onSelectionChange,
  className = '',
}: {
  decision: AddressChangeDecisionPayload;
  selectedOptionId: string;
  onSelectionChange: (optionId: string) => void;
  className?: string;
}) {
  const [sectionOpen, setSectionOpen] = useState(true);
  const registryName = decision.registryName ?? 'National Address Registry';

  if (!decision.options.length) return null;

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
          <span className="text-[13px] font-semibold text-text-primary">Address decision</span>
          <span className="mt-0.5 block text-[11px] text-text-secondary">
            Choose the address to apply when you approve
          </span>
        </span>
      </button>

      {sectionOpen ? (
        <div className="space-y-3 px-3.5 py-3">
          <dl className="grid gap-2 rounded-lg border border-border-soft bg-[#fafbfc] px-3 py-2.5 text-[12px]">
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <dt className="font-semibold text-text-muted">Requested effective date</dt>
              <dd className="text-text-primary">{decision.effectiveDate}</dd>
            </div>
            {decision.registryNote ? (
              <div>
                <dt className="font-semibold text-text-muted">{registryName}</dt>
                <dd className="mt-0.5 leading-relaxed text-text-secondary">{decision.registryNote}</dd>
              </div>
            ) : null}
          </dl>

          <p className="text-[11px] leading-relaxed text-text-muted">
            Requested address shown above · select which formatted address to apply on approve
          </p>

          <ul className="space-y-2">
            {decision.options.map((option) => (
              <AddressOptionRow
                key={option.id}
                option={option}
                selected={selectedOptionId === option.id}
                onSelect={() => onSelectionChange(option.id)}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
