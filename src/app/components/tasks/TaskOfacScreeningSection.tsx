import { ShieldCheck } from 'lucide-react';
import type { TaskReviewPayload } from '../../types';

export function TaskOfacScreeningSection({
  screening,
  className = '',
}: {
  screening: NonNullable<TaskReviewPayload['ofacScreening']>;
  className?: string;
}) {
  const clear = screening.result.toLowerCase() === 'clear';

  return (
    <section className={`overflow-hidden rounded-lg border border-border-soft bg-white ${className}`.trim()}>
      <div className="border-b border-border-soft px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`size-4 ${clear ? 'text-brand-green' : 'text-[#8a5a00]'}`} />
          <p className="text-[13px] font-semibold text-text-primary">OFAC / sanctions screening</p>
        </div>
        <p className="mt-0.5 text-[11px] text-text-secondary">{screening.provider}</p>
      </div>
      <div className="space-y-2 p-4 text-[12px]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-text-secondary">Result</span>
          <span className={`font-semibold ${clear ? 'text-brand-green' : 'text-[#8a5a00]'}`}>{screening.result}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-text-secondary">Screened</span>
          <span className="font-semibold text-text-primary">{screening.screenedAt}</span>
        </div>
        {screening.detail ? (
          <p className="mt-2 leading-relaxed text-text-secondary">{screening.detail}</p>
        ) : null}
      </div>
    </section>
  );
}
