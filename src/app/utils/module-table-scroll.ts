/** Subpixel / scrollbar tolerance when comparing scroll vs client width. */
export const MODULE_TABLE_SCROLL_EPSILON = 4;

/**
 * Fill the scroll area at wide viewports; `minWidth` on the table (inline style) still
 * forces horizontal scroll + sticky packs when the viewport is narrower than the column minimums.
 * Avoid `table-fixed` — it squeezes columns and breaks overflow detection.
 */
export const MODULE_TABLE_LAYOUT_CLASS = 'w-full min-w-full border-separate border-spacing-0';

/** Primary text column — grows to absorb extra width beside fixed sticky/utility columns. */
export const MODULE_TABLE_SUMMARY_COL_CLASS = 'w-full min-w-[320px]';

/**
 * Scroll container for module tables: vertical scroll always; horizontal only when needed.
 * `scrollbar-gutter: auto` reserves gutter only when a vertical scrollbar is present (unlike
 * `stable`, which leaves a permanent white strip on the right when content does not scroll).
 */
export function moduleTableScrollContainerClass(hasHorizontalOverflow: boolean, extra = '') {
  return [
    'app-scrollbar relative isolate min-h-0 min-w-0',
    'overflow-y-auto',
    '[scrollbar-gutter:auto]',
    hasHorizontalOverflow ? 'overflow-x-auto' : 'overflow-x-hidden',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

export type ModuleTableRowSurfaceOptions = {
  selected?: boolean;
  locked?: boolean;
  restricted?: boolean;
};

/**
 * Per-cell background for module tables with horizontal scroll + sticky columns.
 * Apply on every <td> (and checkbox/sticky cells) — not only sticky edges.
 * Matches Task module: explicit bg + group-hover on each cell avoids gaps when scrolling.
 */
export function moduleTableRowSurface({
  selected = false,
  locked = false,
  restricted = false,
}: ModuleTableRowSurfaceOptions = {}): string {
  if (locked) return 'bg-surface-hover group-hover:bg-surface-hover';
  if (restricted) return 'bg-surface-primary group-hover:bg-surface-primary';
  if (selected) return 'bg-surface-selected-alt group-hover:bg-surface-selected-alt';
  return 'bg-white group-hover:bg-surface-hover';
}

/** Row wrapper: group hover is driven by cell surfaces above, not tr:hover. */
export const MODULE_TABLE_ROW_INTERACTIVE_CLASS = 'group cursor-pointer';
