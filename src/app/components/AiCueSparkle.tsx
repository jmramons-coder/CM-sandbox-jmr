import { Sparkle } from 'lucide-react';

export type AiCueSparkleProps = {
  /** Icon box size in px. */
  size?: number;
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
  className = '',
  spinOnParentHover = false,
  'aria-hidden': ariaHidden = true,
}: AiCueSparkleProps) {
  const interactionClass = spinOnParentHover
    ? 'motion-safe:group-hover:[animation:aiCueSparkleSpin_0.55s_ease-in-out_1] motion-reduce:group-hover:[animation:none]'
    : 'motion-safe:hover:[animation:aiCueSparkleSpin_0.55s_ease-in-out_1] motion-reduce:hover:[animation:none]';

  return (
    <span
      className={`inline-block shrink-0 leading-[0] ${interactionClass}`}
      style={{ width: size, height: size }}
      aria-hidden={ariaHidden}
    >
      <Sparkle
        size={size}
        strokeWidth={1.5}
        className={`block shrink-0 fill-current text-brand-accent ${className}`}
        aria-hidden
      />
    </span>
  );
}
