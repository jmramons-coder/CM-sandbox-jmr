import type { LucideIcon } from 'lucide-react';
import { BarChart3, HandCoins, Inbox, Lightbulb } from 'lucide-react';
import { UI_CLASS } from '../constants/design-tokens';

const MODULE_COPY: Record<string, { title: string; description: string; Icon: LucideIcon }> = {
  finances: {
    title: 'Finances',
    description: 'Financial operations, billing signals, and payment workflows will appear here.',
    Icon: HandCoins,
  },
  requests: {
    title: 'Requests',
    description: 'Centralized intake and service requests will appear here.',
    Icon: Inbox,
  },
  insights: {
    title: 'Insights',
    description: 'Operational insights and intelligence views will appear here.',
    Icon: Lightbulb,
  },
  reports: {
    title: 'Reports',
    description: 'Reporting dashboards and exports will appear here.',
    Icon: BarChart3,
  },
};

export function ComingSoonModule({ moduleId }: { moduleId: keyof typeof MODULE_COPY }) {
  const meta = MODULE_COPY[moduleId];
  const Icon = meta.Icon;

  return (
    <div className={`flex h-full items-center justify-center ${UI_CLASS.workspaceTopLeftRadius} bg-surface-primary px-6`}>
      <div className="max-w-[420px] rounded-xl border border-border-default bg-white px-6 py-7 text-center shadow-[0_1px_2px_rgba(27,28,30,0.04)]">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-muted text-text-heading">
          <Icon className="size-5" />
        </div>
        <h1 className="mt-4 text-[22px] font-semibold text-text-primary">{meta.title}</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">{meta.description}</p>
        <span className="mt-4 inline-flex rounded-full bg-surface-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.4px] text-text-muted">
          Coming soon
        </span>
      </div>
    </div>
  );
}
