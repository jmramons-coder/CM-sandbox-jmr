'use client';

import { useEffect, useRef } from 'react';
import { usePresentationModeEnabled } from '../../contexts/PlatformSettingsContext';

const RIPPLE_DURATION_MS = 520;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function PresentationModeOverlay() {
  const enabled = usePresentationModeEnabled();
  const layerRef = useRef<HTMLDivElement>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = prefersReducedMotion();
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      reducedMotionRef.current = mq.matches;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (layerRef.current) layerRef.current.replaceChildren();
      return;
    }

    const layer = layerRef.current;

    const spawnRipple = (clientX: number, clientY: number) => {
      if (!layer) return;
      const ripple = document.createElement('span');
      ripple.className = reducedMotionRef.current
        ? 'presentation-ripple presentation-ripple--reduced'
        : 'presentation-ripple';
      ripple.style.left = `${clientX}px`;
      ripple.style.top = `${clientY}px`;
      layer.appendChild(ripple);

      const remove = () => ripple.remove();
      if (reducedMotionRef.current) {
        window.setTimeout(remove, 120);
        return;
      }
      ripple.addEventListener('animationend', remove, { once: true });
      window.setTimeout(remove, RIPPLE_DURATION_MS + 80);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      spawnRipple(event.clientX, event.clientY);
    };

    document.addEventListener('pointerdown', onPointerDown, { capture: true });

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, { capture: true });
      if (layer) layer.replaceChildren();
    };
  }, [enabled]);

  if (!enabled) return null;

  return <div ref={layerRef} className="presentation-mode-layer" aria-hidden />;
}
