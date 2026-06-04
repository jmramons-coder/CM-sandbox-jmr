import { ChevronRight, Gauge } from 'lucide-react';
import type { UnderwritingRequirementAssessment, UnderwritingScoring } from '../domain/objectRefs';
import { SidePanelSummaryBox } from '../AiSummaryWithConfidenceCard';
import { normalizeScoring } from '../../domain/scoring';
import {
  formatScoringCellValue,
  formatScoringCompactSummary,
  formatScoringHeaderSummary,
  formatScoringRiskLabel,
} from '../../utils/underwritingScoringPresentation';

function AssessmentTableRow({ row }: { row: UnderwritingRequirementAssessment }) {
  return (
    <tr className={`border-b border-border-soft last:border-b-0 ${row.pending ? 'bg-[#fbfcfd]' : ''}`}>
      <td className="px-3 py-2.5 align-top">
        <p className="text-[12px] font-semibold text-text-primary">{row.requirement}</p>
        {row.pending ? (
          <span className="mt-1 inline-flex rounded-full bg-[#fff4e6] px-2 py-0.5 text-[10px] font-semibold text-[#8a5a00]">
            Pending
          </span>
        ) : null}
      </td>
      <td className="px-3 py-2.5 align-top text-[12px] leading-relaxed text-text-primary">{row.assessment}</td>
      <td className="px-3 py-2.5 align-top text-[12px] font-semibold text-brand-green">
        {formatScoringCellValue(row.positiveScore)}
      </td>
      <td className="px-3 py-2.5 align-top text-[12px] font-semibold text-brand-red">
        {formatScoringCellValue(row.negativeScore)}
      </td>
      <td className="px-3 py-2.5 align-top text-[12px] leading-relaxed text-text-secondary">
        {formatScoringCellValue(row.notes)}
      </td>
    </tr>
  );
}

function ScoringPointsKpi({ scoring }: { scoring: UnderwritingScoring }) {
  const normalized = normalizeScoring(scoring);
  const netLabel = formatScoringCompactSummary(normalized);
  const riskLabel = formatScoringRiskLabel(normalized);

  return (
    <div className="flex w-[108px] shrink-0 flex-col items-end gap-0.5 border-l border-border-soft pl-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Points</p>
      <p className="text-[26px] font-semibold tabular-nums leading-none text-text-primary">{netLabel}</p>
      <p className="mt-1 text-[11px] font-semibold text-brand-red">+{normalized.debitTotal} debits</p>
      <p className="text-[11px] font-semibold text-brand-green">−{normalized.creditTotal} credits</p>
      <p className="mt-1 text-right text-[10px] font-medium leading-snug text-text-secondary">{riskLabel}</p>
    </div>
  );
}

export function CaseScoringSidePanel({ scoring }: { scoring: UnderwritingScoring }) {
  const assessments = scoring.requirementAssessments ?? [];
  const aiNarrative = scoring.aiComparison?.narrative;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-surface-primary">
      <div className="border-b border-border-soft bg-white px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Current scoring</p>
        <p className="mt-1 text-[20px] font-semibold text-text-primary">{formatScoringRiskLabel(scoring)}</p>
        {scoring.pending?.length ? (
          <p className="mt-2 text-[12px] text-text-secondary">
            Pending evidence: {scoring.pending.join(' · ')}
          </p>
        ) : null}
      </div>

      <div className="space-y-4 p-5">
        {aiNarrative ? (
          <SidePanelSummaryBox label="AI assessment">
            <div className="flex items-start gap-4">
              <p className="min-w-0 flex-1 text-[12px] leading-relaxed text-text-primary">{aiNarrative}</p>
              <ScoringPointsKpi scoring={scoring} />
            </div>
          </SidePanelSummaryBox>
        ) : (
          <SidePanelSummaryBox label="Scoring summary">
            <div className="flex justify-end">
              <ScoringPointsKpi scoring={scoring} />
            </div>
          </SidePanelSummaryBox>
        )}

        <section className="overflow-hidden rounded-xl border border-border-soft bg-white">
          <div className="border-b border-border-soft px-4 py-3">
            <p className="text-[13px] font-semibold text-text-primary">Requirement assessments</p>
            <p className="mt-0.5 text-[11px] text-text-muted">
              Findings by requirement — positive and negative score impacts
            </p>
          </div>
          {assessments.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border-soft bg-surface-primary">
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Requirement</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Assessment</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">+ Score</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">− Score</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((row) => (
                    <AssessmentTableRow key={row.id} row={row} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-10 text-center text-[12px] text-text-muted">
              No requirement assessments recorded yet.
            </div>
          )}
        </section>

        {scoring.underwriterNotes ? (
          <section className="rounded-xl border border-border-soft bg-white px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Underwriter notes</p>
            <p className="mt-2 text-[12px] leading-relaxed text-text-primary">{scoring.underwriterNotes}</p>
          </section>
        ) : null}
      </div>
    </div>
  );
}

export function CaseScoringApplicantAffordance({
  scoring,
  onOpen,
  active = false,
}: {
  scoring: UnderwritingScoring;
  onOpen: () => void;
  active?: boolean;
}) {
  const summary = formatScoringHeaderSummary(scoring);
  const points = formatScoringCompactSummary(scoring);
  const riskLabel = formatScoringRiskLabel(scoring);

  return (
    <button
      type="button"
      data-keep-sidepanel
      onClick={onOpen}
      title={`Scoring — ${summary}`}
      aria-label={`Open scoring — ${summary}`}
      aria-pressed={active}
      className={`group/score flex min-w-0 flex-1 flex-col justify-center rounded-md px-1 py-2 text-left transition-colors ${
        active ? 'bg-brand-accent-light/40' : 'hover:bg-[#fcfbff]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5">
            <Gauge
              className={`size-3.5 shrink-0 ${active ? 'text-brand-accent' : 'text-text-muted group-hover/score:text-brand-accent'}`}
              strokeWidth={2.25}
              aria-hidden
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Scoring</span>
          </span>
          <span className="mt-1 block truncate text-[11px] font-medium text-text-secondary">{riskLabel}</span>
          <span className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-brand-blue group-hover/score:underline">
            Details
            <ChevronRight className="size-3.5" aria-hidden />
          </span>
        </div>
        <span className="shrink-0 text-[15px] font-semibold tabular-nums leading-none text-text-primary">{points} pts</span>
      </div>
    </button>
  );
}

export function CaseScoringHeaderButton({
  scoring,
  onOpen,
  active = false,
  compact = false,
}: {
  scoring: UnderwritingScoring;
  onOpen: () => void;
  active?: boolean;
  compact?: boolean;
}) {
  const summary = formatScoringHeaderSummary(scoring);

  return (
    <button
      type="button"
      data-keep-sidepanel
      onClick={onOpen}
      title={`Scoring — ${summary}`}
      aria-label={`Open scoring — ${summary}`}
      aria-pressed={active}
      className={`group/score inline-flex items-center justify-center gap-1.5 rounded-full border transition-colors ${
        active
          ? 'border-brand-accent bg-brand-accent-light text-brand-accent'
          : 'border-[#e8eaed] bg-white text-text-secondary hover:border-brand-accent/35 hover:bg-[#fcfbff] hover:text-brand-accent'
      } ${compact ? 'min-h-[40px] min-w-[40px] shrink-0 px-0' : 'px-2.5 py-1.5'}`}
    >
      <Gauge className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
      {!compact ? (
        <span className="max-w-[96px] truncate text-[11px] font-semibold leading-none">{summary}</span>
      ) : null}
    </button>
  );
}
