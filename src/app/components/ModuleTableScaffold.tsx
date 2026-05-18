import { useState, type ReactNode } from 'react';
import { MODULE_TEXT } from '../constants/design-tokens';
import { useTableHorizontalScroll } from '../hooks/useTableHorizontalScroll';
import { moduleTableScrollContainerClass } from '../utils/module-table-scroll';

export function ModuleTableScrollArea({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const { hasHorizontalOverflow } = useTableHorizontalScroll(scrollEl);

  return (
    <div
      ref={setScrollEl}
      className={`app-scrollbar relative z-0 flex-1 bg-white ${moduleTableScrollContainerClass(hasHorizontalOverflow, className)}`}
    >
      {children}
    </div>
  );
}

/**
 * Card variation of the table scroll area — contained width, rounded edges,
 * suitable for dashboards that center a single table inside a section instead
 * of letting it span the full page like the workspace tables do.
 */
export function ModuleTableCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex flex-col overflow-hidden rounded-xl border border-border-default bg-white shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

/** Scroll area used inside a `ModuleTableCard` (no vertical flex stretch). */
export function ModuleTableCardScrollArea({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const { hasHorizontalOverflow } = useTableHorizontalScroll(scrollEl);

  return (
    <div
      ref={setScrollEl}
      className={`app-scrollbar relative z-0 min-w-0 bg-white ${moduleTableScrollContainerClass(hasHorizontalOverflow, className)}`}
    >
      {children}
    </div>
  );
}

export function ModuleTableShell({
  children,
  minWidth = '',
  className = '',
}: {
  children: ReactNode;
  minWidth?: string;
  className?: string;
}) {
  return (
    <table className={`w-full border-separate border-spacing-0 ${minWidth} ${className}`}>
      {children}
    </table>
  );
}

export function ModuleTableHeaderCell({
  children,
  align = 'left',
  className = '',
}: {
  children: ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}) {
  const alignment = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  return (
    <th
      className={`whitespace-nowrap border-b border-border-default bg-surface-primary px-2 py-3 align-middle ${MODULE_TEXT.tableHeader} font-semibold leading-[20px] text-text-primary ${alignment} ${className}`}
    >
      {children}
    </th>
  );
}

export function ModuleTableCell({
  children,
  align = 'left',
  className = '',
}: {
  children: ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}) {
  const alignment = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  return (
    <td
      className={`whitespace-nowrap border-b border-border-default px-2 py-3 align-middle ${MODULE_TEXT.tableCell} text-text-primary ${alignment} ${className}`}
    >
      {children}
    </td>
  );
}
