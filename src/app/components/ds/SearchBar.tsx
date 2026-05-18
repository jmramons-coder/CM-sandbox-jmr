import { Search } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../ui/utils';

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Wrapper className applied to the outer container. Use this to tweak ordering, alignment, or override the default width caps. */
  containerClassName?: string;
}

/**
 * Modernized search bar shared across modules. Mirrors the pattern used in
 * `FoldersModule` and `EntitySubFolderListView`: single rounded input with the
 * search icon padded inside on the left, brand-blue focus ring, and a 700px
 * desktop max-width that grows to fill its row alongside filters.
 *
 * The Figma 2-piece component still lives in `src/imports/SearchInput.tsx` if
 * the legacy look is needed.
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Search',
  containerClassName,
  className,
  ...inputProps
}: SearchBarProps) {
  return (
    <div className={cn('relative w-full md:max-w-[700px] md:flex-1', containerClassName)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-9 w-full rounded-lg border border-border-default bg-white pl-9 pr-3 text-sm text-text-primary outline-none placeholder:text-text-placeholder focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20',
          className,
        )}
        {...inputProps}
      />
    </div>
  );
}
