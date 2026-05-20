import { Link } from 'react-router';
import { LozengeTag } from '../LozengeTag';
import { getRelatedCaseStatusLozengeType, getStatusLozengeType } from '../../utils/status-display';
import type { CaseRelationshipRow } from './caseViewTypes';

export type CaseCommunicationRow = {
  date: string;
  channel: string;
  direction: string;
  contact: string;
  summary: string;
  stage?: string;
};

export type CaseHistoryEventRow = {
  date: string;
  event: string;
  detail: string;
  stage?: string;
};

export function CaseCommunicationsList({ rows }: { rows: CaseCommunicationRow[] }) {
  if (rows.length === 0) {
    return <p className="py-16 text-center text-sm font-medium text-text-muted">No communications yet</p>;
  }
  return (
    <div className="space-y-3">
      {rows.map((row, idx) => (
        <div key={`${row.date}-${idx}`} className="rounded-lg border border-border-default bg-white p-4">
          <div className="mb-1 text-sm font-semibold text-text-primary">
            {row.date} · {row.stage ?? 'No stage'} · {row.channel} · {row.direction}
          </div>
          <div className="text-sm text-text-secondary">{row.contact} — {row.summary}</div>
        </div>
      ))}
    </div>
  );
}

export function CaseHistoryEventsList({ rows }: { rows: CaseHistoryEventRow[] }) {
  if (rows.length === 0) {
    return <p className="py-16 text-center text-sm font-medium text-text-muted">No activity yet</p>;
  }
  return (
    <div className="space-y-3">
      {rows.map((row, idx) => (
        <div key={`${row.date}-${idx}`} className="rounded-lg border border-border-default bg-white p-4">
          <div className="mb-1 text-sm font-semibold text-text-primary">
            {row.date} · {row.stage ?? 'No stage'} · {row.event}
          </div>
          <div className="text-sm text-text-secondary">{row.detail}</div>
        </div>
      ))}
    </div>
  );
}

export function CaseRelationshipsList({ rows }: { rows: CaseRelationshipRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border-default bg-white p-4 text-sm text-text-secondary">
        No other cases for this client.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.id} className="rounded-lg border border-border-default bg-white p-4">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Link to={row.href ?? '#'} className="text-sm font-semibold text-brand-blue underline underline-offset-2 hover:underline">
              {row.label}
            </Link>
            <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[10px] font-semibold capitalize text-text-muted">{row.kind}</span>
            {row.status ? (
              <LozengeTag
                label={row.status}
                type={row.kind === 'case' ? getRelatedCaseStatusLozengeType(row.status) : getStatusLozengeType(row.status, 'entityTable')}
                subtle
              />
            ) : null}
          </div>
          <div className="text-sm text-text-secondary">
            {row.relationship}{row.details ? ` · ${row.details}` : ''}
          </div>
        </div>
      ))}
    </div>
  );
}
