/** Pastel avatar pairs used across person / client list rows (bg + initials color). */
export const PERSON_AVATAR_PALETTE = [
  { background: '#F7E8DF', foreground: '#5B230F' },
  { background: '#EEE9F1', foreground: '#1A1739' },
  { background: '#F5F1E6', foreground: '#78520F' },
  { background: '#E5F2F4', foreground: '#17494A' },
  { background: '#F0F4E8', foreground: '#405B17' },
  { background: '#E8EEF7', foreground: '#173D6F' },
] as const;

export type PersonAvatarColors = {
  background: string;
  foreground: string;
};

/** Derive up to two initials from a display name (supports "Last, First" and "First Last"). */
export function getPersonInitials(name: string, maxLength = 2): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';

  if (trimmed.includes(',')) {
    const [last = '', first = ''] = trimmed.split(',').map((part) => part.trim());
    const letters = [first[0], last[0]].filter(Boolean);
    if (letters.length) return letters.join('').slice(0, maxLength).toUpperCase();
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, maxLength).toUpperCase();
  return parts
    .map((part) => part[0])
    .join('')
    .slice(0, maxLength)
    .toUpperCase();
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Stable pastel colors from a seed (id or name). */
export function getPersonAvatarColors(seed: string): PersonAvatarColors {
  const index = hashString(seed.trim().toLowerCase() || 'default') % PERSON_AVATAR_PALETTE.length;
  return PERSON_AVATAR_PALETTE[index];
}

export function resolvePersonAvatar(
  name: string,
  options?: {
    initials?: string;
    seed?: string;
    backgroundColor?: string;
    textColor?: string;
  },
): { initials: string; colors: PersonAvatarColors } {
  const initials = (options?.initials ?? getPersonInitials(name)).slice(0, 2).toUpperCase() || '?';
  const palette = getPersonAvatarColors(options?.seed ?? name);
  const colors = options?.backgroundColor
    ? {
        background: options.backgroundColor,
        foreground:
          options.textColor ??
          PERSON_AVATAR_PALETTE.find((entry) => entry.background === options.backgroundColor)?.foreground ??
          palette.foreground,
      }
    : palette;
  return { initials, colors };
}
