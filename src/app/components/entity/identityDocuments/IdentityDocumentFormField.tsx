import type { ReactNode } from 'react';

export const FIELD_LABEL_CLASS =
  'block text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted';

/** Wraps fields in a responsive grid; cells flow to new rows when width is tight. */
export const IDENTITY_DOCUMENT_FORM_GRID =
  'grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-x-4 gap-y-4';

export const IDENTITY_DOCUMENT_DRAFT_CARD =
  'relative rounded-lg border border-border-soft bg-white p-4 pt-4 sm:pr-14';

export function IdentityDocumentFormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
}) {
  const labelEl = htmlFor ? (
    <label htmlFor={htmlFor} className={FIELD_LABEL_CLASS}>
      {label}
    </label>
  ) : (
    <span className={FIELD_LABEL_CLASS}>{label}</span>
  );

  return (
    <div className="flex min-w-0 flex-col">
      {labelEl}
      <div className="mt-1 min-h-9 w-full">{children}</div>
      <p
        className={`mt-1 min-h-[18px] text-[11px] leading-[18px] ${
          error ? 'text-red-600' : 'invisible'
        }`}
        aria-live="polite"
      >
        {error || ' '}
      </p>
    </div>
  );
}

export function IdentityDocumentReadonlyField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className={FIELD_LABEL_CLASS}>{label}</span>
      <p
        className={`mt-1 flex min-h-9 items-center text-[13px] text-text-primary ${
          mono ? 'font-mono' : ''
        }`}
      >
        {value}
      </p>
      <p className="mt-1 min-h-[18px] text-[11px] leading-[18px] invisible" aria-hidden>
        {' '}
      </p>
    </div>
  );
}
