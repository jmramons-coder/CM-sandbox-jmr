import type { CSSProperties } from 'react';
import { cn } from '../ui/utils';
import { resolvePersonAvatar } from '../../utils/person-avatar';

export type InitialsAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASS: Record<InitialsAvatarSize, string> = {
  xs: 'size-7 text-[10px]',
  sm: 'size-8 text-[11px]',
  md: 'size-9 text-[12px]',
  lg: 'size-12 text-[14px]',
  xl: 'size-14 text-[15px]',
};

export function InitialsAvatar({
  name,
  initials,
  seed,
  backgroundColor,
  textColor,
  size = 'md',
  className,
  style,
  'aria-label': ariaLabel,
}: {
  name: string;
  initials?: string;
  /** Stable key for color (defaults to `name`). */
  seed?: string;
  backgroundColor?: string;
  textColor?: string;
  size?: InitialsAvatarSize;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}) {
  const resolved = resolvePersonAvatar(name, {
    initials,
    seed,
    backgroundColor,
    textColor,
  });

  return (
    <span
      role="img"
      aria-label={ariaLabel ?? name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold leading-none',
        SIZE_CLASS[size],
        className,
      )}
      style={{
        backgroundColor: resolved.colors.background,
        color: resolved.colors.foreground,
        ...style,
      }}
    >
      {resolved.initials}
    </span>
  );
}
