/** Subpixel / scrollbar tolerance when comparing scroll vs client width. */
export const MODULE_TABLE_SCROLL_EPSILON = 4;

/**
 * Let the table grow past the viewport so horizontal scroll + sticky columns work.
 * Avoid `table-fixed w-full`, which squeezes columns and disables overflow detection.
 */
export const MODULE_TABLE_LAYOUT_CLASS = 'w-max min-w-full border-separate border-spacing-0';

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
