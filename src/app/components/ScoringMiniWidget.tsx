import { ChevronRight, Gauge } from 'lucide-react';
import type { UnderwritingScoring } from '../domain/objectRefs';
import { deriveHumanNet, deriveRiskClass, toScoringRows } from '../domain/scoring';

export function ScoringMiniWidget({
  compact = false,
  onOpenScoring,
  scoring,
}: {
  compact?: boolean;
  onOpenScoring?: () => void;
  scoring?: UnderwritingScoring;
}) {
  if (!scoring) return null;
  const rows = toScoringRows(scoring).sort((a, b) => b.absPoints - a.absPoints);
  const net = deriveHumanNet(scoring);
  const netLabel = net >= 0 ? `+${net}` : String(net);
  const riskClass = deriveRiskClass(net);

  if (compact) {
    const topFactors = rows.slice(0, 2);
    return (
      <section className="mt-4 flex items-center gap-2 rounded-md border border-border-soft bg-[#fbfcfd] px-3 py-2">
        <Gauge className="size-3.5 shrink-0 text-text-muted" strokeWidth={2.25} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] leading-snug text-text-secondary">
            <span className="font-semibold text-text-primary">{netLabel} pts</span>
            <span className="text-text-muted"> · </span>
            {riskClass}
            {topFactors.length ? (
              <>
                <span className="text-text-muted"> · </span>
                {topFactors.map((row, index) => (
                  <span key={`${row.type}-${row.id}`}>
                    {index > 0 ? '; ' : null}
                    {row.displayName}{' '}
                    <span className={row.type === 'credit' ? 'text-brand-green' : 'text-brand-red'}>
                      {row.points > 0 ? `+${row.points}` : row.points}
                    </span>
                  </span>
                ))}
              </>
            ) : null}
          </p>
        </div>
        {onOpenScoring ? (
          <button
            type="button"
            onClick={onOpenScoring}
            className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-semibold text-brand-blue hover:underline"
          >
            Scoring
            <ChevronRight className="size-3" aria-hidden />
          </button>
        ) : null}
      </section>
    );
  }

  const visibleRows = rows.slice(0, 4);
  return (
    <section className="mt-3 rounded-lg border border-border-soft bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35px] text-text-muted">Scoring</p>
          <p className="mt-1 text-[14px] font-semibold text-text-primary">
            {netLabel} · {riskClass}
          </p>
        </div>
        {onOpenScoring ? (
          <button type="button" onClick={onOpenScoring} className="rounded-full border border-border-soft px-2 py-1 text-[11px] font-semibold text-text-secondary hover:border-brand-blue hover:text-brand-blue">
            View →
          </button>
        ) : null}
      </div>
      <div className="mt-3 space-y-2">
        {visibleRows.map((row) => (
          <div key={`${row.type}-${row.id}`}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="truncate text-[11px] text-text-primary">{row.displayName}</span>
              <span className={`text-[11px] font-semibold ${row.type === 'credit' ? 'text-brand-green' : 'text-brand-red'}`}>{row.points > 0 ? `+${row.points}` : row.points}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
