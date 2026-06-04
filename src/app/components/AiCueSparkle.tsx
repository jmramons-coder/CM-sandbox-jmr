import { useId } from 'react';
import { Sparkle } from 'lucide-react';
import { cn } from './ui/utils';

export type AiCueSparkleProps = {
  /** Icon box size in px. */
  size?: number;
  /** Purple → blue brand blend on the sparkle (secondary AI avatars, light surfaces). */
  brandGradientFill?: boolean;
  /** Extra classes; use `!text-white` etc. when the cue sits on a dark pill (overrides fill/stroke color). */
  className?: string;
  /**
   * When true, spin runs when a `.group` ancestor is hovered (add `group` on the row/button).
   * Otherwise spin runs when the icon itself is hovered.
   */
  spinOnParentHover?: boolean;
  'aria-hidden'?: boolean;
};

/**
 * Single four-point sparkle — shared AI visual cue (tables, banners, inline insight rows).
 * Filled shape (no ring/ping); hover plays a short one-shot spin.
 */
export function AiCueSparkle({
  size = 14,
  brandGradientFill = false,
  className = '',
  spinOnParentHover = false,
  'aria-hidden': ariaHidden = true,
}: AiCueSparkleProps) {
  const gradientId = `ai-sparkle-grad-${useId().replace(/:/g, '')}`;
  const interactionClass = spinOnParentHover
    ? 'motion-safe:group-hover:[animation:aiCueSparkleSpin_0.55s_ease-in-out_1] motion-reduce:group-hover:[animation:none]'
    : 'motion-safe:hover:[animation:aiCueSparkleSpin_0.55s_ease-in-out_1] motion-reduce:hover:[animation:none]';

  const gradientPaint = brandGradientFill ? `url(#${gradientId})` : undefined;

  return (
    <span
      className={`inline-block shrink-0 leading-[0] ${interactionClass}`}
      style={{ width: size, height: size }}
      aria-hidden={ariaHidden}
    >
      {brandGradientFill ? (
        <svg aria-hidden className="absolute h-0 w-0 overflow-hidden">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="15%" x2="100%" y2="90%">
              <stop offset="0%" stopColor="var(--brand-accent, #602fa0)" />
              <stop offset="48%" stopColor="var(--brand-accent, #602fa0)" />
              <stop offset="100%" stopColor="var(--brand-primary, #006296)" />
            </linearGradient>
          </defs>
        </svg>
      ) : null}
      <Sparkle
        size={size}
        strokeWidth={1.5}
        className={cn('block shrink-0 fill-current text-brand-accent', className)}
        style={
          brandGradientFill
            ? {
                fill: gradientPaint,
                stroke: gradientPaint,
                color: gradientPaint,
              }
            : undefined
        }
        aria-hidden
      />
    </span>
  );
}
