import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { FormField } from '../../data/mock-eapp';

export function EAppFieldRenderer({
  field,
  value,
  onChange,
  highlighted = false,
}: {
  field: FormField;
  value: unknown;
  onChange: (val: unknown) => void;
  highlighted?: boolean;
}) {
  const val = value ?? '';
  const isPrefilled = field.prefill !== undefined && val === field.prefill;
  const fieldId = `field-${field.id}`;

  const labelEl = (
    <label htmlFor={fieldId} className="mb-1 flex items-center text-[12px] font-semibold text-text-secondary">
      {field.label}
      {field.required ? <span className="ml-0.5 text-brand-red">*</span> : null}
    </label>
  );

  const baseClass =
    'w-full rounded-md px-3 py-2 text-[13px] text-text-primary outline-none transition-all placeholder:text-[#a9aeb5] focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:bg-surface-muted';
  const borderClass = isPrefilled
    ? 'border border-[#d4c8f0] bg-gradient-to-r from-[#fdfdff] to-[#faf8fe]'
    : 'border border-[#c4cbd2] bg-white';
  const highlightClass = highlighted
    ? 'ring-2 ring-brand-accent/30 shadow-[0_0_0_3px_rgba(96,47,160,0.10)]'
    : '';

  if (field.type === 'checkbox') {
    return (
      <label className="flex cursor-pointer items-start gap-2.5 py-1">
        <input
          type="checkbox"
          checked={val === true}
          onChange={(e) => onChange(e.target.checked)}
          className={`mt-0.5 size-4 shrink-0 cursor-pointer rounded accent-brand-blue ${
            isPrefilled ? 'ring-1 ring-[#d4c8f0] ring-offset-1' : ''
          } ${highlightClass}`}
        />
        <span className="text-[13px] text-text-primary">
          {field.label}
          {field.required ? <span className="ml-0.5 text-brand-red">*</span> : null}
        </span>
        {field.helpText ? (
          <span className="ml-auto shrink-0 text-[11px] text-text-muted">{field.helpText}</span>
        ) : null}
      </label>
    );
  }

  if (field.type === 'radio') {
    return (
      <fieldset className="flex flex-col gap-1.5">
        {labelEl}
        <div className={`flex flex-wrap gap-2 rounded-md ${highlightClass}`}>
          {(field.options ?? []).map((opt) => {
            const optPrefilled = isPrefilled && opt === field.prefill;
            return (
              <label
                key={opt}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-[13px] text-text-primary transition-colors hover:border-[#c4cbd2] has-[:checked]:border-brand-blue has-[:checked]:bg-surface-selected-alt ${
                  optPrefilled && val === opt
                    ? 'border border-[#d4c8f0] bg-gradient-to-r from-[#fdfdff] to-[#faf8fe]'
                    : 'border border-border-soft bg-white'
                }`}
              >
                <input
                  type="radio"
                  name={field.id}
                  value={opt}
                  checked={val === opt}
                  onChange={() => onChange(opt)}
                  className="size-4 cursor-pointer accent-brand-blue"
                />
                {opt}
              </label>
            );
          })}
        </div>
        {field.helpText ? (
          <p className="text-[11px] text-text-muted">{field.helpText}</p>
        ) : null}
      </fieldset>
    );
  }

  if (field.type === 'select') {
    const options = (field.options ?? []).filter(Boolean);
    const strVal = String(val);
    return (
      <div>
        {labelEl}
        <Select value={strVal || undefined} onValueChange={(v) => onChange(v)}>
          <SelectTrigger
            id={fieldId}
            className={`w-full rounded-md px-3 py-2 text-[13px] ${
              isPrefilled
                ? 'border-[#d4c8f0] bg-gradient-to-r from-[#fdfdff] to-[#faf8fe]'
                : 'border-[#c4cbd2] bg-white'
            } ${highlightClass}`}
          >
            <SelectValue placeholder={field.placeholder ?? 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div>
        {labelEl}
        <textarea
          id={fieldId}
          value={String(val)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={`${baseClass} ${borderClass} ${highlightClass} resize-y min-h-[80px]`}
        />
        {field.helpText ? (
          <p className="mt-1 text-[11px] text-text-muted">{field.helpText}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      {labelEl}
      <input
        id={fieldId}
        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
        value={String(val)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={`${baseClass} ${borderClass} ${highlightClass}`}
      />
      {field.helpText ? (
        <p className="mt-1 text-[11px] text-text-muted">{field.helpText}</p>
      ) : null}
    </div>
  );
}
