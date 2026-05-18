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
 * `scrollbar-gutter: stable` avoids vertical scrollbar stealing width and triggering phantom horizontal scroll.
 */
export function moduleTableScrollContainerClass(hasHorizontalOverflow: boolean, extra = '') {
  return [
    'app-scrollbar relative isolate min-h-0 min-w-0',
    'overflow-y-auto',
    '[scrollbar-gutter:stable]',
    hasHorizontalOverflow ? 'overflow-x-auto' : 'overflow-x-hidden',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}
