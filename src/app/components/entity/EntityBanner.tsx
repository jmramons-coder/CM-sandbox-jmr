import { AlertTriangle, CheckCircle, Info, OctagonAlert } from 'lucide-react';
import type { EntityBanner as EntityBannerType } from '../../domain/entityFolders';

const TONE: Record<EntityBannerType['tone'], { wrap: string; icon: typeof Info; iconColor: string }> = {
  info: {
    wrap: 'bg-surface-muted border-border-default text-text-primary',
    icon: Info,
    iconColor: 'text-text-secondary',
  },
  warning: {
    wrap: 'bg-[#fff7e5] border-[#f0c85c] text-[#7d5a00]',
    icon: AlertTriangle,
    iconColor: 'text-[#a36d00]',
  },
  alert: {
    wrap: 'bg-[#faeae9] border-[#e8918b] text-[#7d1a14]',
    icon: OctagonAlert,
    iconColor: 'text-[#cd2c23]',
  },
  success: {
    wrap: 'bg-[#e1f7ea] border-[#7dc4a0] text-[#0a5a25]',
    icon: CheckCircle,
    iconColor: 'text-[#008533]',
  },
};

export function EntityBanner({ banner }: { banner: EntityBannerType }) {
  const tone = TONE[banner.tone];
  const Icon = tone.icon;
  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-4 py-2.5 text-[13px] ${tone.wrap}`}
      role="status"
    >
      <Icon className={`size-4 shrink-0 ${tone.iconColor}`} />
      <span className="font-semibold">{banner.message}</span>
    </div>
  );
}
