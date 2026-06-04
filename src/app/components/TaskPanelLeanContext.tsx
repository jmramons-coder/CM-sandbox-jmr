'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Task, TaskContextCard } from '../types';
import { isAddressChangeServiceTask, isSimpleServiceTask } from '../utils/taskSimpleService';

function AddressContextBody({ card }: { card: TaskContextCard }) {
  const items = card.listItems ?? [];
  if (!items.length) return null;

  return (
    <ul className="space-y-1.5 text-[12px] leading-snug text-text-secondary">
      {items.map((item) => (
        <li key={item.title}>
          <span className="font-medium text-text-primary">{item.title}</span>
          {item.detail ? <span className="text-text-muted"> · {item.detail}</span> : null}
        </li>
      ))}
    </ul>
  );
}

function CompactKvBody({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <ul className="space-y-1 text-[12px] leading-snug text-text-secondary">
      {rows.map((row) => (
        <li key={row.label}>
          <span className="text-text-muted">{row.label}:</span> {row.value}
        </li>
      ))}
    </ul>
  );
}

function TaskContextCardSection({
  card,
  className = 'mt-4',
  defaultOpen = false,
}: {
  card: TaskContextCard;
  className?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const title = card.title ?? card.contextLabel ?? 'Context';
  const subtitle =
    card.contextLabel && card.title && card.contextLabel !== card.title ? card.contextLabel : undefined;
  const hasList = Boolean(card.listItems?.length);
  const hasKv = Boolean(card.kv?.length);
  if (!hasList && !hasKv) return null;

  return (
    <section
      className={`overflow-hidden rounded-xl border border-border-soft bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-surface-muted/50 ${
          open ? 'border-b border-border-soft bg-surface-muted/30' : 'bg-surface-muted/20'
        }`}
        aria-expanded={open}
      >
        <ChevronDown
          className={`size-4 shrink-0 text-brand-blue transition-transform ${open ? '' : '-rotate-90'}`}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="text-[13px] font-semibold text-text-primary">{title}</span>
          {subtitle ? (
            <span className="mt-0.5 block text-[11px] capitalize text-text-secondary">{subtitle}</span>
          ) : null}
        </span>
      </button>

      {open ? (
        <div className="space-y-2 px-3.5 py-3">
          {card.description ? (
            <p className="text-[12px] leading-relaxed text-text-secondary">{card.description}</p>
          ) : null}
          {hasList ? <AddressContextBody card={card} /> : null}
          {hasKv ? <CompactKvBody rows={card.kv ?? []} /> : null}
        </div>
      ) : null}
    </section>
  );
}

/** Lean contextual blocks for policy-service tasks (e.g. address history). */
export function TaskPanelLeanContext({ task }: { task: Task }) {
  if (!isSimpleServiceTask(task) || !task.contextCards?.length) return null;
  if (isAddressChangeServiceTask(task) && task.review?.addressPolicyScope) return null;

  if (isAddressChangeServiceTask(task)) {
    return (
      <>
        {task.contextCards.map((card, index) => (
          <TaskContextCardSection
            key={`${card.title ?? card.type}-${index}`}
            card={card}
            className={index === 0 ? 'mt-4' : 'mt-4'}
          />
        ))}
      </>
    );
  }

  const listCard = task.contextCards.find((card) => card.listItems?.length);
  if (listCard) {
    return <TaskContextCardSection card={listCard} className="mt-4" />;
  }

  const kvCard = task.contextCards.find((card) => card.kv?.length);
  if (!kvCard) return null;

  return <TaskContextCardSection card={kvCard} className="mt-4" />;
}
