/**
 * Row-level kebab menus on module tables. Disabled until inline row actions are
 * implemented — users should open the side panel by clicking the row instead.
 */
export const MODULE_TABLE_ROW_KEBAB_ENABLED = false;

/** Sticky `right` offset for the status column when a kebab column trails it. */
export function moduleTableStatusStickyRightPx(trailingColWidth: number): number | undefined {
  return MODULE_TABLE_ROW_KEBAB_ENABLED ? trailingColWidth : undefined;
}

/** Tailwind sticky-right class for a status column adjacent to optional kebab column. */
export function moduleTableStatusStickyRightClass(trailingColWidth: 48 | 64 | 80): string {
  if (!MODULE_TABLE_ROW_KEBAB_ENABLED) return 'sticky right-0';
  if (trailingColWidth === 48) return 'sticky right-[48px]';
  if (trailingColWidth === 64) return 'sticky right-[64px]';
  return 'sticky right-[80px]';
}
