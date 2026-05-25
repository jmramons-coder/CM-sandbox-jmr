import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  ISSUING_JURISDICTIONS,
  searchJurisdictions,
  type JurisdictionOption,
} from '../../../data/issuingJurisdictions';

type JurisdictionComboboxProps = {
  value: string;
  onChange: (label: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  /** When false, parent field renders validation message (stable grid height). */
  showError?: boolean;
};

export function JurisdictionCombobox({
  value,
  onChange,
  placeholder = 'Select a jurisdiction',
  disabled = false,
  error,
  showError = true,
}: JurisdictionComboboxProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const results = useMemo(() => searchJurisdictions(query, 40), [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectOption = (option: JurisdictionOption) => {
    onChange(option.label);
    setQuery(option.label);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative min-w-0">
      <div className="relative">
        <input
          type="text"
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className={`h-9 w-full rounded-md border bg-white px-2.5 pr-8 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/25 ${
            error ? 'border-red-500' : 'border-border-default'
          }`}
        />
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
      </div>
      {showError && error ? (
        <p className="mt-1 text-[11px] text-red-600">{error}</p>
      ) : null}
      {open && !disabled ? (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border-default bg-white py-1 shadow-[0_8px_24px_rgba(27,28,30,0.12)]">
          {results.length === 0 ? (
            <li className="px-3 py-2 text-[12px] text-text-muted">No matches</li>
          ) : (
            results.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  className="flex w-full flex-col px-3 py-2 text-left hover:bg-surface-muted"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOption(option)}
                >
                  <span className="text-[13px] font-medium text-text-primary">{option.label}</span>
                  <span className="text-[10px] text-text-muted">{option.group}</span>
                </button>
              </li>
            ))
          )}
          {!query && (
            <li className="border-t border-border-soft px-3 py-1.5 text-[10px] text-text-muted">
              {ISSUING_JURISDICTIONS.length} jurisdictions available
            </li>
          )}
        </ul>
      ) : null}
    </div>
  );
}
