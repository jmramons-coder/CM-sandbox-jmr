import { cn } from '../ui/utils';
import { getRagDotClass } from '../../utils/status-display';

type Rag = 'Red' | 'Amber' | 'Green';

interface RagDotProps {
  rag: Rag;
  className?: string;
}

export function RagDot({ rag, className }: RagDotProps) {
  return (
    <span
      className={cn(
        'size-2 shrink-0 rounded-full',
        getRagDotClass(rag),
        className,
      )}
    />
  );
}
