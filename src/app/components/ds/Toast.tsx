import type { CSSProperties, ReactNode } from 'react';
import {
  AlertTriangle,
  Check,
  CircleAlert,
  Info,
  Lightbulb,
  X,
} from 'lucide-react';
import { COLORS } from '../../constants/design-tokens';
import { cn } from '../ui/utils';

export type ToastVariant = 'neutral' | 'success' | 'warning' | 'alert' | 'discovery';

const VARIANT_TOKENS: Record<
  ToastVariant,
  { bg: string; text: string; Icon: typeof Info }
> = {
  neutral: { bg: COLORS.toast.neutral.bg, text: COLORS.toast.neutral.text, Icon: Info },
  success: { bg: COLORS.toast.success.bg, text: COLORS.toast.success.text, Icon: Check },
  warning: { bg: COLORS.toast.warning.bg, text: COLORS.toast.warning.text, Icon: AlertTriangle },
  alert: { bg: COLORS.toast.alert.bg, text: COLORS.toast.alert.text, Icon: CircleAlert },
  discovery: { bg: COLORS.toast.discovery.bg, text: COLORS.toast.discovery.text, Icon: Lightbulb },
};

export type ToastProps = {
  message: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
  className?: string;
};

export function Toast({ message, variant = 'neutral', onDismiss, className }: ToastProps) {
  const tokens = VARIANT_TOKENS[variant];
  const { Icon } = tokens;

  return (
    <div
      data-ai-panel-ignore-outside
      className={cn(
        'flex w-full max-w-[min(440px,calc(100vw-3rem))] items-center gap-3 rounded-md px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.15)] animate-[fadeInUp_0.35s_ease-out]',
        className,
      )}
      style={
        {
          backgroundColor: tokens.bg,
          color: tokens.text,
        } as CSSProperties
      }
      role="status"
      aria-live="polite"
    >
      <Icon className="size-5 shrink-0" strokeWidth={2} aria-hidden />
      <p className="min-w-0 flex-1 text-sm font-semibold leading-snug">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 opacity-90 transition-opacity hover:opacity-100"
          style={{ color: tokens.text }}
          aria-label="Dismiss notification"
        >
          <X className="size-4" strokeWidth={2} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

/** Product Guide / settings preview — all five variants. */
export function ToastVariantGallery({ className }: { className?: string }) {
  const samples: { variant: ToastVariant; message: string }[] = [
    { variant: 'neutral', message: 'Document currently uploading…' },
    { variant: 'success', message: 'Task CD-5180 completed' },
    { variant: 'warning', message: 'Your license is about to expire' },
    { variant: 'alert', message: 'Unable to delete user' },
    { variant: 'discovery', message: 'A discovery message!' },
  ];

  return (
    <div className={cn('space-y-2', className)}>
      {samples.map(({ variant, message }) => (
        <Toast key={variant} variant={variant} message={message} onDismiss={() => undefined} />
      ))}
    </div>
  );
}

export function ToastVariantGallerySection(): ReactNode {
  return (
    <section className="rounded-xl border border-border-default bg-white p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Toast feedback</h3>
      <p className="mt-2 text-sm text-text-secondary">
        Five semantic variants for action feedback — bottom-right, auto-dismiss, manual dismiss.
      </p>
      <div className="mt-4">
        <ToastVariantGallery />
      </div>
    </section>
  );
}
