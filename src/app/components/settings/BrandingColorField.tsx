import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, Pipette } from 'lucide-react';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsv(r: number, g: number, b: number) {
  const rf = r / 255;
  const gf = g / 255;
  const bf = b / 255;
  const max = Math.max(rf, gf, bf);
  const min = Math.min(rf, gf, bf);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    switch (max) {
      case rf:
        h = ((gf - bf) / d) % 6;
        break;
      case gf:
        h = (bf - rf) / d + 2;
        break;
      default:
        h = (rf - gf) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, v };
}

function hsvToRgb(h: number, s: number, v: number) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rf = 0;
  let gf = 0;
  let bf = 0;
  if (h < 60) [rf, gf, bf] = [c, x, 0];
  else if (h < 120) [rf, gf, bf] = [x, c, 0];
  else if (h < 180) [rf, gf, bf] = [0, c, x];
  else if (h < 240) [rf, gf, bf] = [0, x, c];
  else if (h < 300) [rf, gf, bf] = [x, 0, c];
  else [rf, gf, bf] = [c, 0, x];
  return { r: (rf + m) * 255, g: (gf + m) * 255, b: (bf + m) * 255 };
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

/* ─── Saturation/Value pad ─── */

function SVPad({
  hue,
  s,
  v,
  onChange,
}: {
  hue: number;
  s: number;
  v: number;
  onChange: (s: number, v: number) => void;
}) {
  const { t } = useTranslation('settings');
  const padRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromEvent = (clientX: number, clientY: number) => {
    const rect = padRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = clamp01((clientX - rect.left) / rect.width);
    const ny = clamp01((clientY - rect.top) / rect.height);
    onChange(nx, 1 - ny);
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      updateFromEvent(e.clientX, e.clientY);
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [onChange]);

  return (
    <div
      ref={padRef}
      role="slider"
      aria-label={t('branding.colorPicker.saturationAria')}
      aria-valuetext={t('branding.colorPicker.saturationValueText', {
        s: Math.round(s * 100),
        v: Math.round(v * 100),
      })}
      onMouseDown={(e) => {
        dragging.current = true;
        updateFromEvent(e.clientX, e.clientY);
      }}
      className="relative h-[140px] w-full cursor-crosshair overflow-hidden rounded-md"
      style={{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
        style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%` }}
      />
    </div>
  );
}

/* ─── Color picker popover ─── */

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const { t } = useTranslation('settings');
  const hsv = useMemo(() => hexToHsv(value), [value]);
  const [hex, setHex] = useState(value);
  const [hexEditing, setHexEditing] = useState(false);
  const [eyedropperError, setEyedropperError] = useState(false);
  const EyeDropperCtor = typeof window !== 'undefined'
    ? (window as unknown as { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper
    : undefined;
  const canUseEyeDropper = Boolean(EyeDropperCtor);

  useEffect(() => {
    if (!hexEditing) setHex(value);
  }, [value, hexEditing]);

  const commitHex = (raw: string) => {
    const cleaned = raw.trim().startsWith('#') ? raw.trim() : `#${raw.trim()}`;
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cleaned)) {
      if (cleaned.toLowerCase() !== value.toLowerCase()) onChange(cleaned);
      setHex(cleaned);
    } else {
      setHex(value);
    }
  };

  const setFromHsv = (h: number, s: number, v: number) => {
    const rgb = hsvToRgb(h, s, v);
    onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
  };

  const pickFromScreen = async () => {
    setEyedropperError(false);
    if (!EyeDropperCtor) {
      setEyedropperError(true);
      return;
    }
    try {
      const result = await new EyeDropperCtor().open();
      if (result?.sRGBHex) onChange(result.sRGBHex);
    } catch {
      /* User cancelled or browser blocked access; keep current color. */
    }
  };

  return (
    <div className="flex w-[240px] flex-col gap-3">
      <button
        type="button"
        onClick={pickFromScreen}
        disabled={!canUseEyeDropper}
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border-default bg-white px-2.5 text-[12px] font-semibold text-text-secondary transition-colors hover:border-brand-blue hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-45"
        title={canUseEyeDropper ? 'Pick a color from the logo or anywhere on screen' : 'Color sampling is not supported in this browser'}
      >
        <Pipette className="size-3.5" />
        Pick from logo
      </button>
      {eyedropperError ? (
        <p className="text-[11px] leading-snug text-text-muted">
          Browser color sampling is unavailable. Use the sliders or hex field.
        </p>
      ) : null}
      <SVPad
        hue={hsv.h}
        s={hsv.s}
        v={hsv.v}
        onChange={(s, v) => setFromHsv(hsv.h, s, v)}
      />

      {/* Hue slider */}
      <div className="relative h-3 w-full">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
          }}
        />
        <input
          aria-label={t('branding.colorPicker.hueAria')}
          type="range"
          min={0}
          max={360}
          step={1}
          value={Math.round(hsv.h)}
          onChange={(e) => setFromHsv(Number(e.target.value), hsv.s, hsv.v)}
          className="relative z-[1] h-3 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-3 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-transparent"
        />
      </div>

      {/* Hex field */}
      <div className="flex items-center gap-2">
        <span
          className="size-7 shrink-0 rounded border border-border-default"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={hexEditing ? hex : value}
          spellCheck={false}
          onFocus={() => {
            setHex(value);
            setHexEditing(true);
          }}
          onChange={(e) => setHex(e.target.value)}
          onBlur={() => {
            setHexEditing(false);
            commitHex(hex);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              setHex(value);
              setHexEditing(false);
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="flex-1 rounded border border-border-soft bg-white px-2 py-1 font-mono text-[12px] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
        />
      </div>
    </div>
  );
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useTranslation('settings');
  const textInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const openPicker = () => setOpen(true);

  /**
   * Clicking anywhere on the container opens the color picker, unless the click
   * landed on the text input or the copy button.
   */
  const onContainerClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-color-field-skip="true"]')) return;
    openPicker();
  };

  const commitDraft = () => {
    setEditing(false);
    const next = draft.trim();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(next)) {
      if (next.toLowerCase() !== value.toLowerCase()) onChange(next);
    } else {
      setDraft(value);
    }
  };

  const copy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(value);
      } else {
        const el = document.createElement('textarea');
        el.value = value;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* best effort */
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            onClick={onContainerClick}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
                e.preventDefault();
                openPicker();
              }
            }}
            aria-label={t('branding.colors.fieldAria', { label })}
            className="group flex cursor-pointer items-center gap-2 rounded-md border border-border-soft bg-white px-2 py-1.5 transition-colors hover:border-[#c4cbd2] focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none size-6 shrink-0 rounded border border-border-default"
              style={{ backgroundColor: value }}
            />
            <input
              ref={textInputRef}
              data-color-field-skip="true"
              type="text"
              value={editing ? draft : value}
              onFocus={() => setEditing(true)}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitDraft}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitDraft();
                  textInputRef.current?.blur();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setDraft(value);
                  setEditing(false);
                  textInputRef.current?.blur();
                }
              }}
              onClick={(e) => e.stopPropagation()}
              spellCheck={false}
              className={`w-full cursor-text rounded px-1.5 py-0.5 font-mono text-[12px] text-text-primary outline-none transition-colors ${
                editing ? 'bg-surface-muted' : 'bg-transparent hover:bg-[#f6f7f8]'
              }`}
            />
            <button
              type="button"
              data-color-field-skip="true"
              onClick={(e) => {
                e.stopPropagation();
                copy();
              }}
              aria-label={t('branding.colors.copyAria', { label })}
              title={copied ? t('branding.colors.copied') : t('branding.colors.copyHex')}
              className="shrink-0 rounded p-1 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
            >
              {copied ? (
                <Check className="size-3.5 text-[#1f7a5b]" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={10}
          collisionPadding={16}
          className="w-auto p-3"
        >
          <ColorPicker value={value} onChange={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
