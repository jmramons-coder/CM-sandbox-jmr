import { cn } from '../ui/utils';

export type ClientListMetaProps = {
  date?: string;
  email?: string;
  phone?: string;
  address?: string;
  /** When true, missing email/phone render as "No email" / "No phone" (participant search). */
  showEmptyContactPlaceholders?: boolean;
  className?: string;
};

function MetaDivider() {
  return <span className="shrink-0 text-border-default" aria-hidden>·</span>;
}

function MetaSegment({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn('min-w-0 truncate', className)} title={value}>
      {value}
    </span>
  );
}

/** Client listbox rows: date · email · phone on row 2; address on row 3. */
export function ClientListMeta({
  date,
  email,
  phone,
  address,
  showEmptyContactPlaceholders = false,
  className,
}: ClientListMetaProps) {
  const emailValue = email || (showEmptyContactPlaceholders ? 'No email' : undefined);
  const phoneValue = phone || (showEmptyContactPlaceholders ? 'No phone' : undefined);
  const contactLine = [date, emailValue, phoneValue].filter(Boolean) as string[];

  if (!contactLine.length && !address) return null;

  return (
    <div className={cn('mt-0.5 min-w-0', className)}>
      {contactLine.length > 0 ? (
        <div className="flex min-w-0 max-w-full items-center gap-1.5 overflow-hidden text-xs text-text-muted">
          {contactLine.map((segment, index) => (
            <span key={`${segment}-${index}`} className="flex min-w-0 items-center gap-1.5 overflow-hidden">
              {index > 0 ? <MetaDivider /> : null}
              <MetaSegment
                value={segment}
                className={index === 0 ? 'max-w-[120px] shrink-0' : 'min-w-0 flex-1'}
              />
            </span>
          ))}
        </div>
      ) : null}
      {address ? (
        <p className="mt-0.5 truncate text-xs text-text-muted" title={address}>
          {address}
        </p>
      ) : null}
    </div>
  );
}
