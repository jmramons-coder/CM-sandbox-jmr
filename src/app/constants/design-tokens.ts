/**
 * Design Tokens - Amplify Case Management
 * Central source of truth for design values
 */

// Brand Colors
export const COLORS = {
  // Primary Brand Colors
  brand: {
    navy: '#003a5a',
    blue: '#006296',
    green: '#008533',
    red: '#cd2c23',
  },
  
  // UI Colors
  ui: {
    background: {
      primary: '#fafafa',
      secondary: '#f1f2f2',
      white: '#ffffff',
    },
    border: {
      default: '#dbdee1',
      subtle: '#878f9a',
      medium: '#b7bbc2',
      dark: '#60666e',
    },
    text: {
      primary: '#1b1c1e',
      secondary: '#60666e',
      tertiary: '#878f9a',
    },
  },

  // Status Colors
  status: {
    success: {
      base: '#008533',
      light: '#e1f7ea',
      lighter: '#e5f5ea',
      bg: '#f6fbf8',
      text: '#004f1e',
    },
    warning: {
      base: '#f5a200',
      light: '#fff7e5',
      lighter: '#fff4e6',
      bg: '#fffbf5',
      text: '#9e6900',
      dark: '#a36d00',
    },
    alert: {
      base: '#cd2c23',
      light: '#faeae9',
      lighter: '#fde5e4',
      bg: '#fdf7f6',
      text: '#7b1a15',
    },
    info: {
      base: '#006296',
      light: '#e0f0f9',
      lighter: '#f3f9fd',
      bg: '#F3F9FD',
      text: '#003a5a',
      hover: '#84c6ea',
    },
    neutral: {
      base: '#60666e',
      light: '#f1f2f2',
      border: '#878f9a',
    },
    discovery: {
      base: '#602fa0',
      secondary: '#9b5fd6',
      light: '#efeaf5',
      lighter: '#f9f5ff',
      bg: '#f9f5ff',
      border: '#e5d5f8',
    },
  },

  /** Amplify action toast bars (semantic feedback). */
  toast: {
    neutral: { bg: '#2d3748', text: '#ffffff' },
    success: { bg: '#00a651', text: '#ffffff' },
    warning: { bg: '#f5a200', text: '#1b1c1e' },
    alert: { bg: '#cd2c23', text: '#ffffff' },
    discovery: { bg: '#602fa0', text: '#ffffff' },
  },
} as const;

/**
 * Module typography scale — semantic text-size tokens shared across module
 * pages (TaskModule, DocumentModule, FoldersModule, EntitySubFolderListView,
 * etc.). Use these instead of hardcoded `text-[Npx]` utilities so every
 * module page stays visually consistent.
 *
 * All values map to Tailwind's built-in text-* tokens:
 *   - text-2xl → 24 / 32 (size / line-height in px)
 *   - text-sm  → 14 / 20
 *   - text-xs  → 12 / 16
 */
export const MODULE_TEXT = {
  /** Page-level h1 title (24px). */
  pageTitle: 'text-2xl',
  /** Supporting paragraph / count line under the title (12px). */
  pageMeta: 'text-xs',
  /** Breadcrumb trail (12px). */
  breadcrumb: 'text-xs',
  /** Pill / uppercase action buttons (12px). */
  actionButton: 'text-xs',
  /** Search inputs, filter dropdown triggers, h-9 form controls (14px). */
  control: 'text-sm',
  /** Table column header labels (14px). */
  tableHeader: 'text-sm',
  /** Table body cells & link cells (14px). */
  tableCell: 'text-sm',
} as const;

/**
 * Shared class fragments for app chrome and module patterns. Keep Tailwind
 * class strings static here so they are discoverable by Tailwind's scanner.
 */
export const UI_CLASS = {
  primaryActionShadow:
    'shadow-[0px_6px_6px_0px_rgba(27,28,30,0.01),0px_5px_5px_0px_rgba(27,28,30,0.04),0px_2px_4px_0px_rgba(27,28,30,0.07),0px_0px_4px_0px_rgba(27,28,30,0.1)]',
  sidePanelBackground: 'bg-[#f3f4f5]',
  workspaceTopLeftRadius: '',
  stickyColumnShadow: 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]',
  treePathStroke: '#d8dce0',
  ragDot: {
    Green: 'bg-brand-green',
    Amber: 'bg-brand-amber',
    Red: 'bg-brand-red',
  },
  priorityDot: {
    URGENT: 'bg-brand-red',
    HIGH: 'bg-brand-amber',
    NORMAL: 'bg-border-medium',
  },
} as const;

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    primary: "'Open_Sans', sans-serif",
    regular: "'Open_Sans:Regular', sans-serif",
    semibold: "'Open_Sans:SemiBold', sans-serif",
    bold: "'Open_Sans:Bold', sans-serif",
  },
  fontSize: {
    xs: '11px',
    sm: '14px',
    base: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '32px',
  },
  lineHeight: {
    tight: '16px',
    normal: '20px',
    relaxed: '24px',
  },
  letterSpacing: {
    tight: '0.2px',
    normal: '0.24px',
    wide: '0.4px',
  },
  fontVariation: "'wdth' 100",
} as const;

// Spacing
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
} as const;

// Border Radius
export const BORDER_RADIUS = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  full: '9999px',
} as const;

// Shadows
export const SHADOWS = {
  sm: '0px 2px 8px rgba(0, 0, 0, 0.15)',
  md: '0px 4px 12px rgba(0, 0, 0, 0.2)',
  card: '0px 3px 6px 0px rgba(27, 28, 30, 0.1)',
  dropdown: '0px 51px 51px 4px rgba(0, 0, 0, 0.01), 0px 29px 29px 2px rgba(27, 28, 30, 0.04), 0px 13px 13px 1px rgba(27, 28, 30, 0.07), 0px 3px 6px 0px rgba(27, 28, 30, 0.1)',
  sticky: '-3px 0 6px 0 rgba(0, 0, 0, 0.05)',
} as const;

// Z-Index Layers
export const Z_INDEX = {
  base: 0,
  tableHeader: 1,
  stickyColumn: 1,
  stickyHeader: 2,
  verticalNav: 20,
  header: 10,
  dropdown: 200,
  modal: 1000,
} as const;