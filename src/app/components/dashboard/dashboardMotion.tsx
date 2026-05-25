import { useEffect, useMemo, useState } from 'react';

/** Survives SPA navigation — intro motion runs once per full page load. */
let dashboardIntroMotionPlayed = false;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function markDashboardIntroMotionPlayed(): void {
  dashboardIntroMotionPlayed = true;
}

function shouldPlayDashboardIntroMotion(): boolean {
  return !dashboardIntroMotionPlayed && !prefersReducedMotion();
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** 0 → 1 on first home visit this session; optional delay for staggered widgets. */
export function useMountProgress(durationMs = 520, delayMs = 0): number {
  const [progress, setProgress] = useState(() => (shouldPlayDashboardIntroMotion() ? 0 : 1));

  useEffect(() => {
    if (!shouldPlayDashboardIntroMotion()) {
      setProgress(1);
      return;
    }

    setProgress(0);
    let start: number | null = null;
    let frame = 0;

    const timeout = window.setTimeout(() => {
      const tick = (now: number) => {
        if (start === null) start = now;
        const p = Math.min(1, (now - start) / durationMs);
        setProgress(easeOutCubic(p));
        if (p < 1) frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(frame);
    };
  }, [durationMs, delayMs]);

  return progress;
}

function formatCurrencyDisplay(value: number, template: string): string {
  const rounded = Math.round(value);
  if (template.includes('M')) {
    const m = value / 1_000_000;
    const digits = template.includes('.') ? 1 : 0;
    return `$${m.toFixed(digits)}M`;
  }
  if (template.includes('K')) {
    const k = value / 1_000;
    const digits = template.includes('.') ? 1 : 0;
    return `$${k.toFixed(digits)}K`;
  }
  if (template.includes(',')) {
    return `$${rounded.toLocaleString('en-US')}`;
  }
  return `$${rounded}`;
}

export function parseAnimatableValue(
  raw: string,
): { end: number; format: (value: number) => string } | null {
  const value = raw.trim();
  if (!value) return null;

  if (value.endsWith('%')) {
    const end = Number.parseFloat(value);
    if (Number.isNaN(end)) return null;
    return {
      end,
      format: (v) => `${Math.round(v)}%`,
    };
  }

  if (/^\d+$/.test(value)) {
    const end = Number.parseInt(value, 10);
    return { end, format: (v) => String(Math.round(v)) };
  }

  if (value.startsWith('$')) {
    const compact = value.replace(/[$,]/g, '');
    let multiplier = 1;
    let numeric = compact;
    if (compact.endsWith('K')) {
      multiplier = 1_000;
      numeric = compact.slice(0, -1);
    } else if (compact.endsWith('M')) {
      multiplier = 1_000_000;
      numeric = compact.slice(0, -1);
    }
    const end = Number.parseFloat(numeric) * multiplier;
    if (Number.isNaN(end)) return null;
    return { end, format: (v) => formatCurrencyDisplay(v, value) };
  }

  return null;
}

type AnimatedDisplayValueProps = {
  value: string;
  progress?: number;
  className?: string;
};

export function AnimatedDisplayValue({ value, progress, className }: AnimatedDisplayValueProps) {
  const parsed = useMemo(() => parseAnimatableValue(value), [value]);
  const autoProgress = useMountProgress(520);
  const t = progress ?? autoProgress;

  if (!parsed) {
    return <span className={className}>{value}</span>;
  }

  return <span className={className}>{parsed.format(parsed.end * t)}</span>;
}

type AnimatedFillBarProps = {
  percent: number;
  progress: number;
  className?: string;
};

export function AnimatedFillBar({ percent, progress, className }: AnimatedFillBarProps) {
  const width = Math.max(0, Math.min(100, percent * progress));
  return (
    <span
      className={className}
      style={{ width: `${width}%` }}
    />
  );
}
