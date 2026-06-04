import type { Task } from '../../types';
import { resolveTaskTableAiDigest } from '../../utils/taskReviewProjection';

export function TaskTableAiDigestCell({ task }: { task: Task }) {
  const digest = resolveTaskTableAiDigest(task);

  if (digest.kind === 'empty') {
    return <span className="text-[12px] text-text-muted">—</span>;
  }

  const hasChecks = digest.items.length > 0 && digest.display !== '—';
  const hasApproval = Boolean(digest.recommendation?.trim());

  if (!hasChecks && !hasApproval) {
    return <span className="text-[12px] text-text-muted">—</span>;
  }

  return (
    <div className="min-w-0 space-y-1" title={digest.full}>
      {hasChecks ? (
        <p className="line-clamp-1 text-[11px] leading-snug text-text-muted">
          <span className="text-text-primary">Done · </span>
          {digest.display}
        </p>
      ) : null}
      {hasApproval ? (
        <p className="line-clamp-2 text-[12px] font-normal leading-snug text-text-primary">
          <span className="text-text-primary">Approve · </span>
          {digest.recommendation}
        </p>
      ) : null}
    </div>
  );
}
