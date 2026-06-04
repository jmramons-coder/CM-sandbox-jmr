import type { CaseSummary } from '../../types';
import type { SystemDataset } from '../../data/multi-case-dataset';
import { resolveCaseTableAiDigest } from '../../utils/caseTableAiDigest';

export function CaseTableAiDigestCell({
  summary,
  dataset,
}: {
  summary: CaseSummary;
  dataset?: SystemDataset;
}) {
  const digest = resolveCaseTableAiDigest(summary, dataset);

  if (digest.kind === 'empty') {
    return <span className="text-[12px] text-text-muted">—</span>;
  }

  const hasContext = digest.context.trim() !== '—';
  const hasFocus = Boolean(digest.focus?.trim());

  if (!hasContext && !hasFocus) {
    return <span className="text-[12px] text-text-muted">—</span>;
  }

  return (
    <div className="min-w-0 space-y-1" title={digest.full}>
      {hasContext ? (
        <p className="line-clamp-1 text-[11px] leading-snug text-text-muted">
          <span className="font-semibold uppercase tracking-[0.2px] text-text-muted/90">Context · </span>
          {digest.context}
        </p>
      ) : null}
      {hasFocus ? (
        <p className="line-clamp-2 text-[12px] font-normal leading-snug text-text-primary">
          <span className="text-text-primary">{digest.focusLabel} · </span>
          {digest.focus}
        </p>
      ) : null}
    </div>
  );
}
