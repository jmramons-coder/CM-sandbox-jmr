import {
  AlertTriangle,
  ArrowUpCircle,
  CheckSquare,
  Clock,
  Users,
} from 'lucide-react';
import type { DashboardKpi, DashboardKpiTrend, DashboardSummaryCard, DashboardViewModel } from '../../domain/access/roleView';
import { AnimatedDisplayValue } from './dashboardMotion';
import { KPI_TREND_TEXT_CLASS } from './dashboardWidgetUtils';

const KPI_VALUE_CLASS: Record<string, string> = {
  red: 'text-brand-red',
  blue: 'text-brand-blue',
  grn: 'text-brand-green',
  amber: 'text-brand-orange',
};

const CARD_VALUE_CLASS: Record<string, string> = {
  red: 'text-brand-red',
  amber: 'text-brand-orange',
};

function resolveCardIcon(card: DashboardSummaryCard) {
  const icon = card.icon ?? '';
  if (icon.includes('users')) return Users;
  if (icon.includes('escalator')) return ArrowUpCircle;
  if (icon.includes('alert')) return AlertTriangle;
  if (icon.includes('clock')) return Clock;
  return CheckSquare;
}

function KpiChip({ kpi, trend }: { kpi: DashboardKpi; trend?: DashboardKpiTrend }) {
  const valueClass = KPI_VALUE_CLASS[kpi.cls] ?? 'text-text-primary';
  const trendClass = trend ? KPI_TREND_TEXT_CLASS[trend.cls] ?? 'text-text-muted' : '';

  return (
    <div className="flex min-w-0 flex-col items-center justify-center px-2 py-2.5 text-center sm:min-w-[120px] sm:items-start sm:px-4 sm:py-2 sm:text-left lg:min-w-[130px]">
      <AnimatedDisplayValue
        value={kpi.val}
        className={`text-[14px] font-semibold leading-tight sm:text-[16px] ${valueClass}`}
      />
      <p className="mt-0.5 text-[8px] font-semibold uppercase leading-tight tracking-[0.2px] text-text-muted sm:text-[9px] sm:tracking-[0.35px]">
        {kpi.label}
      </p>
      {trend ? (
        <p className={`mt-0.5 hidden text-[10px] font-medium sm:block ${trendClass}`}>
          {trend.arrow} {trend.label}
        </p>
      ) : null}
    </div>
  );
}

function SummaryCard({ card }: { card: DashboardSummaryCard }) {
  const Icon = resolveCardIcon(card);
  const valueClass = CARD_VALUE_CLASS[card.valCls] ?? 'text-text-primary';

  return (
    <div className="min-w-0 px-2 py-2.5 sm:px-5">
      <div className="flex flex-col items-center gap-1 text-center sm:grid sm:grid-cols-[16px_minmax(0,1fr)] sm:items-start sm:gap-2 sm:text-left">
        <Icon className="size-3.5 shrink-0 text-text-heading sm:mt-[2px]" />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold leading-tight text-text-heading sm:text-[13px]">{card.title}</p>
          <div className="mt-0.5 sm:mt-1">
            <AnimatedDisplayValue
              value={card.val}
              className={`text-[12px] font-semibold leading-tight sm:text-[22px] sm:leading-none ${valueClass}`}
            />
          </div>
          <p className="mt-0.5 hidden text-[11px] text-text-secondary sm:block">{card.sub}</p>
        </div>
      </div>
    </div>
  );
}

type DashboardHeroSectionProps = {
  viewModel: DashboardViewModel;
};

export function DashboardHeroSection({ viewModel }: DashboardHeroSectionProps) {
  const kpiCols = viewModel.kpis.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3';

  return (
    <section className="overflow-hidden rounded-xl border border-border-default bg-white">
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-1 sm:px-5 sm:py-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.4px] text-text-heading">
            {viewModel.eyebrow}
          </p>
          <h1 className="mt-0.5 text-[18px] font-semibold text-text-primary sm:text-[20px]">
            {viewModel.headline}
          </h1>
          <p className="mt-0.5 max-w-[640px] text-[12px] leading-snug text-text-secondary">
            {viewModel.sub}
          </p>
        </div>
        <div
          className={`grid w-full shrink-0 ${kpiCols} divide-x divide-border-default overflow-hidden rounded-lg border border-border-default bg-surface-primary sm:w-auto lg:max-w-[620px]`}
        >
          {viewModel.kpis.map((kpi, index) => (
            <KpiChip key={kpi.label} kpi={kpi} trend={viewModel.kpiTrends[index]} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-border-default border-t border-border-default bg-surface-primary">
        {viewModel.cards.map((card) => (
          <SummaryCard key={card.title} card={card} />
        ))}
      </div>
    </section>
  );
}
