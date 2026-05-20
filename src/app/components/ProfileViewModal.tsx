import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import type { UserProfile } from '../domain/access/roleView';

type ProfileViewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
};

function formatAuthority(maxAuthority: number | null): string {
  if (maxAuthority == null) return 'Unlimited';
  if (maxAuthority >= 1_000_000) return `$${(maxAuthority / 1_000_000).toFixed(1)}M`;
  if (maxAuthority >= 1_000) return `$${Math.round(maxAuthority / 1_000)}K`;
  return `$${maxAuthority.toLocaleString()}`;
}

export function ProfileViewModal({ open, onOpenChange, profile }: ProfileViewModalProps) {
  const { t } = useTranslation('nav');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent layout="centered" className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{t('userMenu.profile')}</DialogTitle>
          <DialogDescription>{t('userMenu.profileDescription')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eef2f6] text-[13px] font-semibold text-text-primary ring-1 ring-[#d7dde3]">
              {profile.initials}
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-text-primary">{profile.name}</p>
              <p className="text-[12px] text-text-secondary">{profile.email}</p>
            </div>
          </div>
          <dl className="divide-y divide-border-default rounded-lg border border-border-default bg-surface-primary text-[13px]">
            <div className="flex items-center justify-between gap-4 px-3 py-2.5">
              <dt className="text-text-secondary">{t('userMenu.profileRole')}</dt>
              <dd className="font-semibold capitalize text-text-primary">{profile.role}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-3 py-2.5">
              <dt className="text-text-secondary">{t('userMenu.profileBand')}</dt>
              <dd className="font-semibold text-text-primary">{profile.band}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-3 py-2.5">
              <dt className="text-text-secondary">{t('userMenu.profileTeam')}</dt>
              <dd className="font-semibold text-text-primary">{profile.team}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-3 py-2.5">
              <dt className="text-text-secondary">{t('userMenu.profileAuthority')}</dt>
              <dd className="font-semibold text-text-primary">{formatAuthority(profile.maxAuthority)}</dd>
            </div>
          </dl>
        </div>
      </DialogContent>
    </Dialog>
  );
}
