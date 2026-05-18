import type { CSSProperties, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import {
  MODULE_TABLE_CHECKBOX_COL_TRAILING_CLASS,
  MODULE_TABLE_CHECKBOX_COL_WIDTH,
  MODULE_TABLE_CHECKBOX_LEFT_GUTTER_CLASS,
} from './ModuleCellHelpers';
import { cn } from './ui/utils';

export const MODULE_TABLE_CHECKBOX_COL_STYLE: CSSProperties = {
  width: MODULE_TABLE_CHECKBOX_COL_WIDTH,
  minWidth: MODULE_TABLE_CHECKBOX_COL_WIDTH,
  maxWidth: MODULE_TABLE_CHECKBOX_COL_WIDTH,
};

/** Inner layout shared by header and body so checkboxes stay horizontally aligned. */
const CHECKBOX_CELL_INNER_CLASS = `flex min-h-12 items-center ${MODULE_TABLE_CHECKBOX_LEFT_GUTTER_CLASS} ${MODULE_TABLE_CHECKBOX_COL_TRAILING_CLASS}`;

type ModuleTableCheckboxColumnCellProps = {
  as: 'th' | 'td';
  surfaceClassName?: string;
  className?: string;
  children: ReactNode;
} & (ThHTMLAttributes<HTMLTableCellElement> | TdHTMLAttributes<HTMLTableCellElement>);

export function ModuleTableCheckboxColumnCell({
  as,
  surfaceClassName,
  className,
  children,
  style,
  ...rest
}: ModuleTableCheckboxColumnCellProps) {
  const Tag = as;

  return (
    <Tag
      className={cn(
        'sticky left-0 box-border border-b border-border-default p-0 align-middle',
        as === 'th' ? 'top-0 bg-surface-primary' : '',
        surfaceClassName,
        className,
      )}
      style={{ ...MODULE_TABLE_CHECKBOX_COL_STYLE, ...style }}
      {...rest}
    >
      <div className={CHECKBOX_CELL_INNER_CLASS}>{children}</div>
    </Tag>
  );
}
