import type { ComponentProps, ElementType } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../ui/utils';

interface StatCardProps extends Omit<ComponentProps<'div'>, 'children'> {
  icon: ElementType;
  value: string | number;
  label: string;
  trendPositive?: boolean;
  iconColor?: string;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  trendPositive,
  iconColor = 'text-brand-blue',
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border-default bg-surface-card px-5 py-4 shadow-sm',
        className,
      )}
      {...props}
    >
      <Icon className={cn('size-5 shrink-0', iconColor)} aria-hidden />
      <div className="min-w-0">
        <p className="text-[20px] font-bold leading-tight text-text-heading">{value}</p>
        <p className="truncate text-[11px] text-text-muted">{label}</p>
      </div>
      {trendPositive !== undefined && (
        <div className="ml-auto shrink-0">
          {trendPositive ? (
            <TrendingUp className="size-3.5 text-brand-green" />
          ) : (
            <TrendingDown className="size-3.5 text-brand-red" />
          )}
        </div>
      )}
    </div>
  );
}
