import { Award, ShieldCheck } from 'lucide-react';
import type { TrainingRecord, UserDirectoryRow } from '../../domain/access/platformUser';
import { groupUserTraining, trainingComplianceSummary } from '../../data/userHrProfile';
import { LozengeTag } from '../LozengeTag';

function trainingStatusType(
  status: TrainingRecord['status'],
): 'Success' | 'Warning' | 'Alert' | 'Neutral' {
  if (status === 'expired') return 'Alert';
  if (status === 'expiring_soon') return 'Warning';
  if (status === 'planned') return 'Neutral';
  return 'Success';
}

function trainingStatusLabel(status: TrainingRecord['status']): string {
  switch (status) {
    case 'expired':
      return 'Expired';
    case 'expiring_soon':
      return 'Expiring soon';
    case 'planned':
      return 'Planned';
    default:
      return 'Current';
  }
}

function CredentialCard({ record }: { record: TrainingRecord }) {
  const borderTone =
    record.status === 'expired'
      ? 'border-l-brand-red'
      : record.status === 'expiring_soon'
        ? 'border-l-brand-orange'
        : record.status === 'planned'
          ? 'border-l-border-default'
          : 'border-l-brand-green';

  return (
    <li
      className={`rounded-lg border border-border-default border-l-[3px] bg-white px-3 py-3 ${borderTone}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-text-primary">{record.title}</p>
          <p className="mt-0.5 text-[11px] text-text-muted">
            {record.completedAt ? `Completed ${record.completedAt}` : 'Not yet completed'}
            {record.expiresAt ? ` · Renews ${record.expiresAt}` : ''}
          </p>
        </div>
        <LozengeTag
          label={trainingStatusLabel(record.status)}
          type={trainingStatusType(record.status)}
          subtle
        />
      </div>
    </li>
  );
}

type UserProfileTrainingSectionProps = {
  user: UserDirectoryRow;
};

export function UserProfileTrainingSection({ user }: UserProfileTrainingSectionProps) {
  const summary = trainingComplianceSummary(user.training);
  const groups = groupUserTraining(user.training);
  const compliancePct = summary.total
    ? Math.round((summary.current / summary.total) * 100)
    : 100;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-primary to-white px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
            <ShieldCheck className="size-5 text-brand-blue" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-text-heading">Credential compliance</p>
            <p className="mt-0.5 text-[11px] text-text-secondary">
              {summary.current} of {summary.total} credentials current
              {summary.expiring > 0 ? ` · ${summary.expiring} expiring soon` : ''}
              {summary.expired > 0 ? ` · ${summary.expired} expired` : ''}
            </p>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  compliancePct < 70 ? 'bg-brand-red' : compliancePct < 100 ? 'bg-brand-orange' : 'bg-brand-green'
                }`}
                style={{ width: `${compliancePct}%` }}
              />
            </div>
          </div>
          <p className="shrink-0 text-lg font-semibold text-text-heading">{compliancePct}%</p>
        </div>
      </div>

      {user.trainingAlert ? (
        <p className="rounded-lg border border-brand-orange/30 bg-[#fff8f0] px-3 py-2 text-[12px] text-text-primary">
          Action needed: one or more credentials require renewal before assignment limits apply.
        </p>
      ) : null}

      {groups.map((group) => (
        <section key={group.id}>
          <div className="mb-2 flex items-center gap-1.5">
            <Award className="size-3.5 text-text-muted" aria-hidden />
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              {group.label}
            </h3>
          </div>
          <p className="mb-2.5 text-[11px] leading-relaxed text-text-secondary">{group.description}</p>
          <ul className="space-y-2">
            {group.records.map((record) => (
              <CredentialCard key={record.id} record={record} />
            ))}
          </ul>
        </section>
      ))}

      {groups.length === 0 ? (
        <p className="text-sm text-text-muted">No training records on file.</p>
      ) : null}
    </div>
  );
}
