/** Subpixel / scrollbar tolerance when comparing scroll vs client width. */
export const MODULE_TABLE_SCROLL_EPSILON = 4;

/**
 * Scroll container for module tables: vertical scroll always; horizontal only when needed.
 * `scrollbar-gutter: stable` avoids vertical scrollbar stealing width and triggering phantom horizontal scroll.
 */
export function moduleTableScrollContainerClass(hasHorizontalOverflow: boolean, extra = '') {
  return [
    'min-h-0 min-w-0',
    'overflow-y-auto',
    '[scrollbar-gutter:stable]',
    hasHorizontalOverflow ? 'overflow-x-auto' : 'overflow-x-hidden',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}
