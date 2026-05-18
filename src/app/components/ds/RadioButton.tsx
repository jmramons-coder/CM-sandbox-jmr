import { cn } from '../ui/utils';

export function RadioButton({
  checked,
  className,
  'aria-label': ariaLabel,
}: {
  checked: boolean;
  className?: string;
  'aria-label'?: string;
}) {
  return (
    <span
      role="radio"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={cn(
        'relative inline-block size-[18px] shrink-0 rounded-full border-[2.5px] bg-white align-middle',
        checked ? 'border-brand-blue' : 'border-border-default',
        className,
      )}
    >
      {checked ? (
        <span className="absolute left-1/2 top-1/2 block size-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue" />
      ) : null}
    </span>
  );
}
