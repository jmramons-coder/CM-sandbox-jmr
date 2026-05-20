import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LAYOUT_HEADER_HEIGHT_PX } from './WorkspaceSidePanelChrome';

const CLOSE_ANIMATION_MS = 280;
const DRAWER_EASE_IN = 'cubic-bezier(0.22, 1, 0.36, 1)';
const DRAWER_EASE_OUT = 'cubic-bezier(0.4, 0, 0.78, 0)';

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function MobileNavDrawer({ open, onClose, children }: MobileNavDrawerProps) {
  const { t } = useTranslation('nav');
  const [isRendered, setIsRendered] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  const closeAnimationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      if (closeAnimationTimerRef.current !== null) {
        window.clearTimeout(closeAnimationTimerRef.current);
        closeAnimationTimerRef.current = null;
      }
      setIsRendered(true);
      setIsClosing(false);
      return;
    }
    if (!isRendered) return;
    setIsClosing(true);
    closeAnimationTimerRef.current = window.setTimeout(() => {
      setIsRendered(false);
      setIsClosing(false);
      closeAnimationTimerRef.current = null;
    }, CLOSE_ANIMATION_MS);
  }, [isRendered, open]);

  useEffect(() => {
    return () => {
      if (closeAnimationTimerRef.current !== null) {
        window.clearTimeout(closeAnimationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isRendered) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isRendered, onClose]);

  if (!isRendered || typeof document === 'undefined') return null;

  const panelHeight = `calc((100dvh - ${LAYOUT_HEADER_HEIGHT_PX}px) * 2 / 3)`;

  return createPortal(
    <aside
      role="dialog"
      aria-modal="false"
      aria-label={t('mobileNav.menuTitle')}
      className="mobile-nav-drawer fixed inset-x-0 z-[999] flex w-full origin-top flex-col overflow-hidden rounded-b-2xl border-b border-border-default border-t border-[#eceef0] bg-[#f5f5f7] shadow-[0_12px_40px_rgba(27,28,30,0.16)] will-change-transform lg:hidden"
      style={{
        top: LAYOUT_HEADER_HEIGHT_PX,
        height: panelHeight,
        maxHeight: panelHeight,
        animation: isClosing
          ? `mobileNavDrawerOut ${CLOSE_ANIMATION_MS}ms ${DRAWER_EASE_OUT} both`
          : `mobileNavDrawerIn ${CLOSE_ANIMATION_MS}ms ${DRAWER_EASE_IN} both`,
      }}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#eceef0] px-4 py-2">
        <p className="text-[15px] font-semibold text-text-primary">{t('mobileNav.menuTitle')}</p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-text-secondary hover:bg-white/80"
          aria-label={t('mobileNav.closeMenu')}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
    </aside>,
    document.body,
  );
}
