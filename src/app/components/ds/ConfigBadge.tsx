import type { ReactNode } from 'react';
import { cn } from '../ui/utils';

type ConfigBadgeTone = 'neutral' | 'warning' | 'accent';

const TONE_CLASS: Record<ConfigBadgeTone, string> = {
  neutral: 'border-border-default bg-surface-muted text-text-secondary',
  warning: 'border-brand-amber/30 bg-brand-amber/10 text-brand-orange',
  accent: 'border-brand-accent/30 bg-brand-accent-light text-brand-accent',
};

export function ConfigBadge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: ConfigBadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-[20px] items-center gap-[4px] rounded-[6px] border-[1.5px] px-[6px] text-[11px] font-bold leading-none',
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
