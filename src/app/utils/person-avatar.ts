/** Pastel avatar backgrounds for person / entity headers (initials always black). */
export const ENTITY_AVATAR_INITIALS_COLOR = '#1B1C1E';

export const PERSON_AVATAR_PALETTE = [
  { background: '#F7E8DF', foreground: ENTITY_AVATAR_INITIALS_COLOR },
  { background: '#EEE9F1', foreground: ENTITY_AVATAR_INITIALS_COLOR },
  { background: '#F5F1E6', foreground: ENTITY_AVATAR_INITIALS_COLOR },
  { background: '#E5F2F4', foreground: ENTITY_AVATAR_INITIALS_COLOR },
  { background: '#F0F4E8', foreground: ENTITY_AVATAR_INITIALS_COLOR },
  { background: '#E8EEF7', foreground: ENTITY_AVATAR_INITIALS_COLOR },
] as const;

/** Legacy saturated header colors — replaced with seed-based pastels. */
const LEGACY_ENTITY_AVATAR_BACKGROUNDS = new Set(['#5b8abf', '#4a7aad', '#3d6d9e']);

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

function isPastelPaletteBackground(color: string): boolean {
  const normalized = color.trim().toLowerCase();
  return PERSON_AVATAR_PALETTE.some((entry) => entry.background.toLowerCase() === normalized);
}

/** Stable pastel background from a seed (id or name). */
export function getPersonAvatarColors(seed: string): PersonAvatarColors {
  const index = hashString(seed.trim().toLowerCase() || 'default') % PERSON_AVATAR_PALETTE.length;
  return PERSON_AVATAR_PALETTE[index];
}

function resolveBackgroundColor(seed: string, backgroundColor?: string): string {
  if (!backgroundColor) return getPersonAvatarColors(seed).background;
  const normalized = backgroundColor.trim().toLowerCase();
  if (LEGACY_ENTITY_AVATAR_BACKGROUNDS.has(normalized)) {
    return getPersonAvatarColors(seed).background;
  }
  if (isPastelPaletteBackground(backgroundColor)) {
    return backgroundColor;
  }
  return getPersonAvatarColors(seed).background;
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
  const seed = options?.seed ?? name;
  const background = resolveBackgroundColor(seed, options?.backgroundColor);
  const foreground = options?.textColor ?? ENTITY_AVATAR_INITIALS_COLOR;

  return {
    initials,
    colors: { background, foreground },
  };
}
