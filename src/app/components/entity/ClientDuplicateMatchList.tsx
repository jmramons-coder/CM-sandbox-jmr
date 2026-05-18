import { AlertTriangle, ExternalLink, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ClientDuplicateMatch } from '../../utils/client-matching';
import { LozengeTag } from '../LozengeTag';

export function ClientDuplicateMatchList({
  matches,
  onUseExisting,
}: {
  matches: ClientDuplicateMatch[];
  onUseExisting: (match: ClientDuplicateMatch) => void;
}) {
  const { t } = useTranslation('folders');
  if (matches.length === 0) return null;

  const highestConfidence = matches[0]?.confidence ?? 'low';

  return (
    <div className="rounded-lg border border-brand-amber/40 bg-brand-amber/10 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-brand-orange">
          <AlertTriangle className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">
              {t('entity.duplicateClient.title')}
            </h3>
            <LozengeTag
              label={t(`entity.duplicateClient.confidence.${highestConfidence}` as never)}
              type={highestConfidence === 'high' ? 'Alert' : highestConfidence === 'possible' ? 'Warning' : 'Neutral'}
              subtle
            />
          </div>
          <p className="mt-1 text-sm leading-5 text-text-secondary">
            {t('entity.duplicateClient.description')}
          </p>

          <div className="mt-3 space-y-2">
            {matches.map((match) => (
              <div key={match.client.id} className="rounded-lg border border-border-default bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {match.client.name}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {match.client.dob} · {match.client.gender}
                      {match.client.email ? ` · ${match.client.email}` : ''}
                      {match.client.phone ? ` · ${match.client.phone}` : ''}
                    </p>
                    {(match.client.address || match.client.parish) ? (
                      <p className="mt-0.5 text-xs text-text-muted">
                        {[match.client.address, match.client.parish].filter(Boolean).join(' · ')}
                      </p>
                    ) : null}
                  </div>
                  <LozengeTag
                    label={t(`entity.duplicateClient.confidence.${match.confidence}` as never)}
                    type={match.confidence === 'high' ? 'Alert' : match.confidence === 'possible' ? 'Warning' : 'Neutral'}
                    subtle
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {match.reasons.map((reason) => (
                    <span
                      key={reason}
                      className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-secondary"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onUseExisting(match)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-hover"
                  >
                    <UserCheck className="size-3.5" />
                    {t('entity.duplicateClient.useExisting')}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline"
                  >
                    <ExternalLink className="size-3.5" />
                    {t('entity.duplicateClient.reviewDetails')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
