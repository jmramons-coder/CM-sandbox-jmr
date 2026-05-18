import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** App header height (Layout) — workspace sits below this */
export const LAYOUT_HEADER_HEIGHT_PX = 48;
/** Main vertical nav width (Layout aside) */
export const MAIN_NAV_WIDTH_PX = 96;
/** Vertical nav `pt-6` — matches `VerticalNav` rail */
export const MAIN_NAV_PADDING_TOP_PX = 24;
/** Plus control: `p-2` + 16px icon ⇒ 32px tall; Y center of + from top of nav column */
export const MAIN_NAV_PLUS_BUTTON_CENTER_Y_PX = MAIN_NAV_PADDING_TOP_PX + 16;

const toggleButtonClass =
  'flex h-10 w-5 shrink-0 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[6px] border border-border-default bg-white text-text-secondary shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow hover:border-[#868F9B] hover:shadow-[0_3px_12px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#868F9B]/35';

type SidePanelResizeStripProps = {
  onResizePointerDown: () => void;
  isResizing?: boolean;
};

/** Resize strip — render inside the open side panel `<aside>` so `absolute right-0` works. */
export function SidePanelResizeStrip({ onResizePointerDown, isResizing = false }: SidePanelResizeStripProps) {
  const { t } = useTranslation('nav');
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={t('sidePanel.resize')}
      className="group absolute right-0 top-0 z-[40] h-full w-5 translate-x-1/2 cursor-col-resize overflow-visible bg-transparent"
      onMouseDown={onResizePointerDown}
    />
  );
}

/**
 * Unified toggle button that smoothly animates between open (collapse chevron)
 * and closed (expand chevron) positions. Always rendered so the `left`
 * transition works continuously.
 */
export function SidePanelToggle({
  open,
  panelWidth,
  onToggle,
  isResizing = false,
  ariaLabelOpen,
  ariaLabelClose,
}: {
  open: boolean;
  panelWidth: number;
  onToggle: () => void;
  isResizing?: boolean;
  ariaLabelOpen?: string;
  ariaLabelClose?: string;
}) {
  const { t } = useTranslation('nav');
  const top = MAIN_NAV_PLUS_BUTTON_CENTER_Y_PX;
  const label = open
    ? (ariaLabelClose ?? t('sidePanel.close'))
    : (ariaLabelOpen ?? t('sidePanel.open'));
  const Chevron = open ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      aria-expanded={open}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      className={`absolute z-[30] -translate-x-1/2 ${toggleButtonClass}`}
      style={{
        left: open ? panelWidth : 0,
        top,
        transition: isResizing ? 'none' : 'left 0.2s ease',
      }}
    >
      <Chevron className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
    </button>
  );
}

