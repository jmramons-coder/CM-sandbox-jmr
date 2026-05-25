import { Eye } from 'lucide-react';

type DashboardEvidencePreviewButtonProps = {
  label: string;
  route: string;
  previewUrl?: string;
  previewTitle?: string;
  onNavigate: (route: string) => void;
};

/** View-evidence CTA with document mini preview on hover (home priority task). */
export function DashboardEvidencePreviewButton({
  label,
  route,
  previewUrl,
  previewTitle,
  onNavigate,
}: DashboardEvidencePreviewButtonProps) {
  return (
    <div className="group/evidence relative">
      <button
        type="button"
        onClick={() => onNavigate(route)}
        className="inline-flex max-w-full items-center gap-1 rounded-full border border-border-default bg-white px-2.5 py-1 text-[11px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
      >
        <Eye className="size-3 shrink-0" />
        {label}
      </button>
      {previewUrl ? (
        <div
          className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden w-[132px] rounded-lg border border-border-default bg-white p-2 shadow-[0_8px_24px_rgba(27,28,30,0.14)] group-hover/evidence:block"
          role="presentation"
        >
          <div className="relative aspect-[5/6] w-full overflow-hidden rounded-[5px] border border-border-soft bg-[#f7f8fa]">
            <img src={previewUrl} alt="" className="h-full w-full object-cover object-top" />
          </div>
          {previewTitle ? (
            <p className="mt-1.5 line-clamp-2 text-[10px] font-semibold leading-snug text-text-primary">
              {previewTitle}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
