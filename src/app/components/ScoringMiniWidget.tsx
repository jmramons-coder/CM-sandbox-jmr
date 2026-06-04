import type { UnderwritingScoring } from '../domain/objectRefs';
import { deriveHumanNet, deriveRiskClass, scoreBarPct, toScoringRows } from '../domain/scoring';

export function ScoringMiniWidget({
  onOpenScoring,
  scoring,
}: {
  onOpenScoring?: () => void;
  scoring?: UnderwritingScoring;
}) {
  if (!scoring) return null;
  const rows = toScoringRows(scoring).sort((a, b) => b.absPoints - a.absPoints).slice(0, 4);
  const net = deriveHumanNet(scoring);
  return (
    <section className="mt-3 rounded-lg border border-border-soft bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35px] text-text-muted">Scoring</p>
          <p className="mt-1 text-[14px] font-semibold text-text-primary">
            {net >= 0 ? `+${net}` : net} · {deriveRiskClass(net)}
          </p>
        </div>
        {onOpenScoring ? (
          <button type="button" onClick={onOpenScoring} className="rounded-full border border-border-soft px-2 py-1 text-[11px] font-semibold text-text-secondary hover:border-brand-blue hover:text-brand-blue">
            View →
          </button>
        ) : null}
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={`${row.type}-${row.id}`}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="truncate text-[11px] text-text-primary">{row.displayName}</span>
              <span className={`text-[11px] font-semibold ${row.type === 'credit' ? 'text-brand-green' : 'text-brand-red'}`}>{row.points > 0 ? `+${row.points}` : row.points}</span>
            </div>
            <span className="block h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <span className={`block h-full rounded-full ${row.type === 'credit' ? 'bg-brand-green' : 'bg-brand-red'}`} style={{ width: `${scoreBarPct(row, rows)}%` }} />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
