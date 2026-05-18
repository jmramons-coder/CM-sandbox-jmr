import { LozengeTag } from '../LozengeTag';
import { getStatusLozengeType, getStatusShort } from '../../utils/status-display';
import { formatAgentListMetaLine } from '../../utils/agent-display';
import { ListOptionSubtitle } from './ListOptionSubtitle';

/** Shared agent row body: name + status (right), agency · email underneath. */
export function AgentSearchOptionContent({
  name,
  agency,
  email,
  status,
  titleClassName = 'text-sm font-semibold text-text-primary',
}: {
  name: string;
  agency?: string;
  email?: string;
  status?: string;
  titleClassName?: string;
}) {
  const metaLine = formatAgentListMetaLine({ agencyName: agency, email });

  return (
    <div className="min-w-0 flex-1">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <span className={`min-w-0 truncate ${titleClassName}`}>{name}</span>
        {status ? (
          <LozengeTag
            label={getStatusShort(status)}
            type={getStatusLozengeType(status, 'entityTable')}
            subtle
            size="compact"
            className="shrink-0"
          />
        ) : null}
      </div>
      {metaLine ? <ListOptionSubtitle text={metaLine} /> : null}
    </div>
  );
}
