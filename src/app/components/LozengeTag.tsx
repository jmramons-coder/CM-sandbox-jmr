/**
 * LozengeTag Component
 * Reusable badge component with consistent styling based on type
 */

import { TYPOGRAPHY } from '../constants/design-tokens';
import type { LozengeType } from '../types';
import { AiCueSparkle } from './AiCueSparkle';

export interface LozengeTagProps {
  /** The text to display in the tag */
  label: string;
  /** The semantic type that determines styling */
  type: LozengeType;
  /** Whether to use subtle (outlined) style instead of solid */
  subtle?: boolean;
  /** Whether to show sparkle icon (for AI-related tags) */
  showSparkles?: boolean;
  /** Compact is used for dense table/sidebar badges; micro for copilot chips. */
  size?: 'micro' | 'compact' | 'default';
  /** Additional CSS classes */
  className?: string;
}

const LOZENGE_STYLES: Record<
  LozengeType,
  {
    solid: { bg: string; text: string; border: string };
    subtle: { bg: string; text: string; border: string };
  }
> = {
  Discovery: {
    solid: {
      bg: 'bg-brand-accent',
      text: 'text-white',
      border: 'border-brand-accent',
    },
    subtle: {
      bg: 'bg-brand-accent-light',
      text: 'text-brand-accent',
      border: 'border-brand-accent/30',
    },
  },
  Alert: {
    solid: {
      bg: 'bg-brand-red',
      text: 'text-white',
      border: 'border-brand-red',
    },
    subtle: {
      bg: 'bg-brand-red/10',
      text: 'text-brand-red',
      border: 'border-brand-red/30',
    },
  },
  Warning: {
    solid: {
      bg: 'bg-brand-amber',
      text: 'text-text-primary',
      border: 'border-brand-amber',
    },
    subtle: {
      bg: 'bg-brand-amber/10',
      text: 'text-brand-orange',
      border: 'border-brand-amber/30',
    },
  },
  Success: {
    solid: {
      bg: 'bg-brand-green',
      text: 'text-white',
      border: 'border-brand-green',
    },
    subtle: {
      bg: 'bg-brand-green/10',
      text: 'text-brand-green',
      border: 'border-brand-green/30',
    },
  },
  Informative: {
    solid: {
      bg: 'bg-brand-blue',
      text: 'text-white',
      border: 'border-brand-blue',
    },
    subtle: {
      bg: 'bg-surface-selected',
      text: 'text-brand-blue',
      border: 'border-brand-blue/40',
    },
  },
  Neutral: {
    solid: {
      bg: 'bg-text-secondary',
      text: 'text-white',
      border: 'border-text-secondary',
    },
    subtle: {
      bg: 'bg-surface-muted',
      text: 'text-text-secondary',
      border: 'border-border-default',
    },
  },
};

export function LozengeTag({
  label,
  type,
  subtle = false,
  showSparkles = false,
  size = 'compact',
  className,
}: LozengeTagProps) {
  const styles = subtle ? LOZENGE_STYLES[type].subtle : LOZENGE_STYLES[type].solid;
  const heightClass =
    size === 'micro' ? 'h-[18px]' : size === 'compact' ? 'h-[20px]' : 'h-[24px]';
  const paddingClass =
    size === 'micro' ? 'px-1' : size === 'compact' ? 'px-[6px]' : 'px-2';
  const textClass =
    size === 'micro'
      ? 'text-[10px] leading-none'
      : size === 'compact'
        ? 'text-[11px] leading-none'
        : 'text-[12px] leading-none';

  return (
    <div className={`inline-flex items-center align-middle ${className ?? ''}`}>
      <div
        className={`relative inline-flex ${heightClass} items-center justify-center gap-[4px] rounded-[6px] ${paddingClass} py-0 ${subtle ? 'border-[1.5px]' : 'border'} ${styles.bg} ${styles.border} ${styles.text}`}
      >
        {showSparkles && (
          <AiCueSparkle
            size={11}
            className={subtle ? '!text-brand-accent' : '!text-white'}
            aria-hidden
          />
        )}
        <span
          className={`flex h-full items-center justify-center whitespace-nowrap pt-px font-['Open_Sans:Bold',sans-serif] font-bold uppercase tracking-[0.4px] ${textClass}`}
          style={{ fontVariationSettings: TYPOGRAPHY.fontVariation }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
