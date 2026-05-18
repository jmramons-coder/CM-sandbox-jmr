import { LozengeTag } from '../LozengeTag';
import { getStatusLozengeType, getStatusShort } from '../../utils/status-display';
import { ListOptionSubtitle } from './ListOptionSubtitle';

/** Shared case row body for search listboxes (ID + status, case type underneath). */
export function CaseSearchOptionContent({
  caseId,
  caseTypeLine,
  status,
  titleClassName = 'text-sm font-semibold text-text-primary',
}: {
  caseId: string;
  caseTypeLine?: string;
  status?: string;
  titleClassName?: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`truncate ${titleClassName}`}>{caseId}</span>
        {status ? (
          <LozengeTag
            label={getStatusShort(status)}
            type={getStatusLozengeType(status, 'case')}
            subtle
            size="compact"
            className="shrink-0"
          />
        ) : null}
      </div>
      {caseTypeLine ? <ListOptionSubtitle text={caseTypeLine} /> : null}
    </div>
  );
}
