/** Viewport breakpoints aligned with Tailwind defaults and mobile shell plan. */
export const BREAKPOINTS = {
  mobileMax: 767,
  tabletMin: 768,
  desktopMin: 1024,
} as const;

export type ViewportLayout = 'mobile' | 'tablet' | 'desktop';

export function resolveViewportLayout(width: number): ViewportLayout {
  if (width < BREAKPOINTS.tabletMin) return 'mobile';
  if (width < BREAKPOINTS.desktopMin) return 'tablet';
  return 'desktop';
}

/** Shell uses compact layout (bottom nav, stacked panels) below desktop. */
export function isCompactShellLayout(layout: ViewportLayout): boolean {
  return layout !== 'desktop';
}
