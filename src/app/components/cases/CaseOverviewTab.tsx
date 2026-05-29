import type {
  CaseGeneralInformationCard,
  CaseGeneralInformationCollapsible,
  CaseInformationSection,
} from '../../domain/objectRefs';
import type { CaseBriefContent } from '../../domain/caseBrief';
import type { UnderwritingScoring } from '../../domain/objectRefs';
import {
  deriveHumanNet,
  deriveRiskClass,
  normalizeScoring,
  scoreBarPct,
  toScoringRows,
  type ScoringItemType,
  type ScoringRow,
} from '../../domain/scoring';
import { DailyBriefCard } from '../DailyBriefCard';

function CaseInfoGrid({
  fields,
  columns = 'grid-cols-2 lg:grid-cols-3',
  className = '',
}: {
  fields: Array<{ label: string; value: React.ReactNode; muted?: boolean }>;
  columns?: string;
  className?: string;
}) {
  return (
    <dl className={`grid gap-x-4 gap-y-4 sm:gap-x-6 sm:gap-y-5 ${columns} ${className}`}>
      {fields.map((field) => (
        <div key={field.label} className="flex min-w-0 flex-col gap-1">
          <dt className="text-[13px] font-normal leading-[18px] text-text-secondary sm:text-[12px] sm:leading-[16px]">
            {field.label}
          </dt>
          <dd className={`min-w-0 text-[15px] leading-[22px] sm:text-[14px] sm:leading-[20px] ${
            field.muted ? 'font-normal text-text-secondary' : 'font-semibold text-text-primary'
          }`}>
            {field.value || <span className="font-normal text-text-muted">-</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function GeneralInfoValue({ field }: { field: { value: string; valueType?: string | null; valueHighlight?: string | null; badge?: string | null; badgeType?: string | null } }) {
  const pillClass =
    field.valueType === 'pill_success' ? 'bg-[#e5f5ea] text-brand-green'
      : field.valueType === 'pill_warning' ? 'bg-[#fff4e6] text-[#8a5a00]'
        : field.valueType === 'pill_info' ? 'bg-surface-selected text-brand-blue'
          : field.valueType === 'pill_neutral' ? 'bg-surface-muted text-text-secondary'
            : '';
  const textClass = field.valueHighlight === 'danger' ? 'text-brand-red' : field.valueHighlight === 'warning' ? 'text-[#a36d00]' : 'text-text-primary';
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className={field.valueType ? `rounded-full px-2 py-0.5 text-[12px] font-semibold sm:text-[11px] ${pillClass}` : `text-[14px] font-medium sm:text-[12px] ${textClass}`}>
        {field.value}
      </span>
      {field.badge ? (
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${field.badgeType === 'warning' ? 'bg-[#fff4e6] text-[#8a5a00]' : 'bg-[#e5f5ea] text-brand-green'}`}>
          {field.badge}
        </span>
      ) : null}
    </span>
  );
}

function GeneralInformationCardView({ card }: { card: CaseGeneralInformationCard }) {
  const title = (
    <div className="px-4 pb-1 pt-3">
      <p className="text-[14px] font-semibold text-black sm:text-[13px]">
      {card.title}
      </p>
    </div>
  );
  if (card.type === 'scoring_bar_chart') {
    return (
      <div className="overflow-hidden rounded-lg border border-border-soft bg-white lg:col-span-2">
        {title}
        <div className="space-y-3 p-3">
          <p className={`text-[12px] font-semibold ${card.summaryStatus === 'danger' ? 'text-brand-red' : card.summaryStatus === 'success' ? 'text-brand-green' : 'text-[#a36d00]'}`}>
            {card.summary}
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:gap-x-6 md:grid-cols-2">
            {card.factors.map((factor) => (
              <div key={factor.name} className="rounded-lg border border-border-soft bg-[#fbfcfd] px-3 py-2">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <span className="min-w-0 text-[12px] font-medium leading-snug text-text-primary">{factor.name}</span>
                  <span className={`shrink-0 text-[12px] font-semibold ${factor.direction === 'credit' ? 'text-brand-green' : 'text-brand-red'}`}>{factor.points}</span>
                </div>
                <span className="block h-2 overflow-hidden rounded-full bg-surface-muted">
                  <span
                    className={`block h-full rounded-full ${factor.direction === 'credit' ? 'bg-brand-green' : 'bg-brand-red'}`}
                    style={{ width: `${Math.max(0, Math.min(100, factor.barPct))}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
          {card.note ? <p className="text-[11px] leading-relaxed text-text-muted">{card.note}</p> : null}
        </div>
      </div>
    );
  }
  if (card.type === 'status_tile_grid') {
    return (
      <div className="overflow-hidden rounded-lg border border-border-soft bg-white lg:col-span-2">
        {title}
        <div className="p-3">
          {card.note ? <p className="mb-3 text-[12px] text-text-secondary">{card.note}</p> : null}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {card.tiles.map((tile) => (
              <div key={tile.label} className="rounded-md border border-border-soft bg-[#fbfcfd] p-3">
                <div className="text-[11px] uppercase tracking-[0.03em] text-text-muted sm:text-[10px]">{tile.label}</div>
                <div className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${tile.status === 'complete' ? 'bg-[#e5f5ea] text-brand-green' : tile.status === 'flagged' ? 'bg-[#fde5e4] text-brand-red' : 'bg-[#fff4e6] text-[#8a5a00]'}`}>
                  {tile.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`overflow-hidden rounded-lg border border-border-soft bg-white ${card.layout === '4_col' ? 'lg:col-span-2' : ''}`}>
      {title}
      <div className={`grid grid-cols-2 gap-x-3 gap-y-4 p-3 sm:gap-x-4 sm:gap-y-3 ${card.layout === '4_col' ? 'sm:grid-cols-4' : ''}`}>
        {card.fields.map((field) => (
          <div key={field.label} className="min-w-0">
            <dt className="text-[12px] text-text-muted sm:text-[10px]">{field.label}</dt>
            <dd className="mt-1.5 min-w-0 sm:mt-1"><GeneralInfoValue field={field} /></dd>
          </div>
        ))}
      </div>
    </div>
  );
}

function GIScoringCard({
  onAdd,
  onFullView,
  onRowClick,
  scoring,
}: {
  onAdd: (type: ScoringItemType) => void;
  onFullView: () => void;
  onRowClick: (row: ScoringRow) => void;
  scoring: UnderwritingScoring;
}) {
  const normalized = normalizeScoring(scoring);
  const rows = toScoringRows(normalized);
  const net = deriveHumanNet(normalized);
  const summary = `${net >= 0 ? '+' : ''}${net} net — ${deriveRiskClass(net)}`;
  return (
    <div className="overflow-hidden rounded-lg border border-border-soft bg-white lg:col-span-2">
      <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-3">
        <p className="text-[13px] font-semibold text-black">AI debit/credit scoring summary</p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => onAdd('debit')} className="rounded-full border border-border-soft px-2 py-1 text-[11px] font-semibold text-text-secondary hover:border-brand-blue hover:text-brand-blue">+ Add</button>
          <button type="button" onClick={onFullView} className="rounded-full border border-border-soft px-2 py-1 text-[11px] font-semibold text-text-secondary hover:border-brand-blue hover:text-brand-blue">Full view →</button>
        </div>
      </div>
      <div className="space-y-3 p-3">
        <p className="text-[12px] font-semibold text-[#a36d00]">{summary}</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:gap-x-6 md:grid-cols-2">
          {rows.map((row) => (
            <button key={`${row.type}-${row.id}`} type="button" onClick={() => onRowClick(row)} className={`rounded-lg border px-3 py-2 text-left transition-colors hover:border-brand-blue/40 ${row.pending ? 'border-dashed bg-[#fbfcfd]' : 'border-border-soft bg-white'}`}>
              <div className="mb-2 flex items-start justify-between gap-3">
                <span className="min-w-0 text-[12px] font-medium leading-snug text-text-primary">
                  {row.displayName}{row.pending ? ' △' : ''}{row.confidence === 'low' ? ' est.' : ''}
                </span>
                <span className={`shrink-0 text-[12px] font-semibold ${row.type === 'credit' ? 'text-brand-green' : 'text-brand-red'}`}>{row.points > 0 ? `+${row.points}` : row.points}</span>
              </div>
              <span className="block h-2 overflow-hidden rounded-full bg-surface-muted">
                <span className={`block h-full rounded-full ${row.type === 'credit' ? 'bg-brand-green' : 'bg-brand-red'}`} style={{ width: `${scoreBarPct(row, rows)}%` }} />
              </span>
            </button>
          ))}
        </div>
        {normalized.pending?.length ? <p className="text-[11px] leading-relaxed text-text-muted">Pending: {normalized.pending.join(', ')}. Final rating subject to change.</p> : null}
      </div>
    </div>
  );
}

function GeneralInformationRichView({
  cards,
  collapsibles,
  onScoreAdd,
  onScoreFullView,
  onScoreRowClick,
  scoring,
}: {
  cards: CaseGeneralInformationCard[];
  collapsibles: CaseGeneralInformationCollapsible[];
  onScoreAdd?: (type: ScoringItemType) => void;
  onScoreFullView?: () => void;
  onScoreRowClick?: (row: ScoringRow) => void;
  scoring?: UnderwritingScoring;
}) {
  const renderedScoring = { current: false };
  return (
    <>
      <div className="grid gap-3 lg:grid-cols-2">
        {cards.map((card) => {
          if (card.type === 'scoring_bar_chart' && scoring && onScoreAdd && onScoreFullView && onScoreRowClick) {
            renderedScoring.current = true;
            return <GIScoringCard key={card.id} scoring={scoring} onAdd={onScoreAdd} onFullView={onScoreFullView} onRowClick={onScoreRowClick} />;
          }
          return <GeneralInformationCardView key={card.id} card={card} />;
        })}
        {scoring && !renderedScoring.current && onScoreAdd && onScoreFullView && onScoreRowClick ? (
          <GIScoringCard scoring={scoring} onAdd={onScoreAdd} onFullView={onScoreFullView} onRowClick={onScoreRowClick} />
        ) : null}
      </div>
      {collapsibles.length ? (
        <div className="mt-3 grid gap-3">
          {collapsibles.map((item) => (
            <div key={item.id} className="rounded-lg border border-border-soft bg-white px-4 py-3">
              <p className="text-[13px] font-semibold text-black">{item.title}</p>
              {item.subtitle ? <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">{item.subtitle}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}

export type CaseOverviewTabProps = {
  caseBrief?: CaseBriefContent | null;
  richCards: CaseGeneralInformationCard[];
  richCollapsibles: CaseGeneralInformationCollapsible[];
  structuredSections: CaseInformationSection[];
  hasDatasetGeneralInformation: boolean;
  scoring?: UnderwritingScoring;
  onScoreAdd: (type: ScoringItemType) => void;
  onScoreFullView: () => void;
  onScoreRowClick: (row: ScoringRow) => void;
};

export function CaseOverviewTab({
  caseBrief,
  richCards,
  richCollapsibles,
  structuredSections,
  hasDatasetGeneralInformation,
  scoring,
  onScoreAdd,
  onScoreFullView,
  onScoreRowClick,
}: CaseOverviewTabProps) {
  return (
    <div className="max-w-[1200px] space-y-4">
      {caseBrief ? <DailyBriefCard content={caseBrief} /> : null}
      {richCards.length > 0 || richCollapsibles.length > 0 ? (
        <GeneralInformationRichView
          cards={richCards}
          collapsibles={richCollapsibles}
          scoring={scoring}
          onScoreAdd={onScoreAdd}
          onScoreFullView={onScoreFullView}
          onScoreRowClick={onScoreRowClick}
        />
      ) : null}
      {structuredSections.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {structuredSections.map((section) => (
            <div key={section.id} className="rounded-lg border border-border-default bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">{section.label}</p>
              {section.description ? <p className="mt-1 text-xs text-text-secondary">{section.description}</p> : null}
              <CaseInfoGrid
                className={section.description ? 'mt-4' : 'mt-3'}
                fields={section.fields
                  .filter((field) => field.enabled !== false)
                  .map((field) => ({
                    label: field.label,
                    value: field.value,
                    muted: field.muted,
                  }))}
              />
              {section.subsections?.filter((subsection) => subsection.enabled !== false).map((subsection) => (
                <div key={subsection.id} className="mt-4 border-t border-border-soft pt-4">
                  <p className="mb-3 text-xs font-semibold text-text-heading">{subsection.label}</p>
                  <CaseInfoGrid
                    fields={subsection.fields
                      .filter((field) => field.enabled !== false)
                      .map((field) => ({ label: field.label, value: field.value, muted: field.muted }))}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}
      {!hasDatasetGeneralInformation ? (
        <div className="rounded-lg border border-border-default bg-white p-4">
          <p className="text-sm text-text-secondary">
            General information is not configured for this case. Select a case from the list or switch to the correct dataset in Platform Settings.
          </p>
        </div>
      ) : null}
    </div>
  );
}
