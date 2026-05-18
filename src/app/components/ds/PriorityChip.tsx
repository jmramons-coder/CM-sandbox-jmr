import { FilterChip } from './FilterChip';
import { formatPriorityChipLabel, getPriorityChipDot } from '../../utils/status-display';

interface PriorityChipProps {
  priority: string;
  className?: string;
}

/** Read-only priority pill using the same FilterChip style as the home Case portfolio widget. */
export function PriorityChip({ priority, className }: PriorityChipProps) {
  return (
    <FilterChip
      readOnly
      dot={getPriorityChipDot(priority)}
      label={formatPriorityChipLabel(priority)}
      className={className}
    />
  );
}
