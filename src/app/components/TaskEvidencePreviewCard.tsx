import { ChevronRight, FileText } from 'lucide-react';
import type { DynamicDocumentData, DynamicDocumentInsight } from './DynamicDocumentSidePanel';
import { formatDocumentFileInfo } from '../data/documentMetadata';
import {
  TASK_EVIDENCE_PREVIEW_MIN_HEIGHT_PX,
  TASK_EVIDENCE_PREVIEW_WIDTH_PX,
} from './taskEvidencePreviewLayout';

const MAX_VISIBLE_INSIGHTS = 3;

function toneDotClass(tone: DynamicDocumentInsight['tone']) {
  return tone === 'danger' ? 'bg-brand-red' : 'bg-[#f5a200]';
}

function EvidenceInsightMini({ insight }: { insight: DynamicDocumentInsight }) {
  return (
    <p className="flex min-w-0 items-center gap-1.5 text-[11px] leading-tight text-text-secondary">
      <span className={`size-1 shrink-0 rounded-full ${toneDotClass(insight.tone)}`} aria-hidden />
      <span className="truncate">{insight.title}</span>
    </p>
  );
}

export function TaskEvidencePreviewCard({
  title,
  fileType,
  fileSize,
  previewUrl,
  documentData,
  fallbackSummary,
  onOpen,
  disabled,
}: {
  title: string;
  fileType?: string;
  fileSize?: string;
  previewUrl: string;
  documentData?: DynamicDocumentData | null;
  fallbackSummary?: string;
  onOpen: () => void;
  disabled?: boolean;
}) {
  const insights = documentData?.evidence ?? [];
  const visibleInsights = insights.slice(0, MAX_VISIBLE_INSIGHTS);
  const hiddenCount = Math.max(0, insights.length - MAX_VISIBLE_INSIGHTS);
  const metaLine = formatDocumentFileInfo(fileType ?? 'PDF', fileSize);

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={disabled}
      data-testid="task-evidence-preview-card"
      className="group flex w-full items-stretch overflow-hidden rounded-lg border border-border-soft bg-white text-left transition-colors hover:border-brand-blue/40 disabled:cursor-default disabled:opacity-60"
    >
      <span className="shrink-0 p-2">
        <span
          data-testid="task-evidence-preview-thumb"
          className="relative flex items-start justify-center overflow-hidden rounded-[5px] border border-border-soft bg-[#f7f8fa] p-1"
          style={{
            width: TASK_EVIDENCE_PREVIEW_WIDTH_PX,
            height: TASK_EVIDENCE_PREVIEW_MIN_HEIGHT_PX,
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              data-testid="task-evidence-preview-image"
              className="max-h-full max-w-full object-contain object-top"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <FileText className="size-5 text-text-muted" aria-hidden />
            </span>
          )}
        </span>
      </span>

      <span className="mx-2 w-px shrink-0 self-stretch bg-border-soft" aria-hidden />

      <span
        className="flex min-w-0 flex-1 flex-col justify-start py-2 pr-2"
        data-testid="task-evidence-preview-content"
      >
        <p className="truncate text-[12px] font-semibold text-text-primary">{title}</p>
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-text-muted">{metaLine}</p>

        {visibleInsights.length ? (
          <div className="mt-1.5 space-y-1">
            {visibleInsights.map((insight) => (
              <EvidenceInsightMini key={insight.id} insight={insight} />
            ))}
            {hiddenCount > 0 ? (
              <p className="pl-2.5 text-[10px] text-text-muted">+{hiddenCount} more</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-1.5 line-clamp-1 text-[11px] text-text-secondary">
            {documentData?.summary.text ?? fallbackSummary ?? 'Review highlights on the document.'}
          </p>
        )}
      </span>

      <span className="w-px shrink-0 self-stretch bg-border-soft" aria-hidden />

      <span className="flex w-10 shrink-0 items-center justify-center text-text-muted transition-colors group-hover:text-brand-blue">
        <ChevronRight className="size-4" strokeWidth={2.25} aria-hidden />
      </span>
    </button>
  );
}

export {
  TASK_EVIDENCE_PREVIEW_IMAGE_FIT,
  TASK_EVIDENCE_PREVIEW_MIN_HEIGHT_PX,
  TASK_EVIDENCE_PREVIEW_WIDTH_PX,
} from './taskEvidencePreviewLayout';
