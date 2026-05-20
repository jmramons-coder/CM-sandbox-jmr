import { describe, expect, it } from 'vitest';
import { isCompactShellLayout, resolveViewportLayout } from '../constants/breakpoints';

describe('viewport layout breakpoints', () => {
  it('classifies mobile, tablet, and desktop widths', () => {
    expect(resolveViewportLayout(390)).toBe('mobile');
    expect(resolveViewportLayout(800)).toBe('tablet');
    expect(resolveViewportLayout(1280)).toBe('desktop');
  });

  it('uses compact shell below desktop', () => {
    expect(isCompactShellLayout('mobile')).toBe(true);
    expect(isCompactShellLayout('tablet')).toBe(true);
    expect(isCompactShellLayout('desktop')).toBe(false);
  });
});
