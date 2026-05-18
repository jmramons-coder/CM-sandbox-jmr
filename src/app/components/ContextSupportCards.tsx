import { Link2 } from 'lucide-react';
import { Link } from 'react-router';
import type { ContextSupportCard } from '../domain/utilityContextCards';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';

function contextToneClass(tone: ContextSupportCard['tone']) {
  if (tone === 'danger') return 'border-brand-red/30 bg-white';
  if (tone === 'warning') return 'border-brand-orange/30 bg-white';
  if (tone === 'success') return 'border-brand-green/30 bg-white';
  if (tone === 'info') return 'border-brand-blue/25 bg-white';
  return 'border-border-soft bg-white';
}

function contextHeaderToneClass(tone: ContextSupportCard['tone']) {
  if (tone === 'danger') return 'bg-[#fff7f7] border-brand-red/20';
  if (tone === 'warning') return 'bg-[#fff8eb] border-brand-orange/20';
  if (tone === 'success') return 'bg-[#f3fbf6] border-brand-green/20';
  if (tone === 'info') return 'bg-brand-blue/5 border-brand-blue/15';
  return 'bg-surface-primary border-border-soft';
}

function metricToneClass(tone: ContextSupportCard['tone']) {
  if (tone === 'danger') return 'bg-[#fff7f7]';
  if (tone === 'warning') return 'bg-[#fffaf2]';
  if (tone === 'success') return 'bg-[#f3fbf6]';
  if (tone === 'info') return 'bg-brand-blue/5';
  return 'bg-surface-primary';
}

export function ContextSupportCardItem({ card, compact = false }: { card: ContextSupportCard; compact?: boolean }) {
  const currency = useCurrencyFormatter();
  const summary = card.layout === 'summary';
  const formatMetricValue = (value: string) => currency.localize(value);
  if (summary) {
    return (
      <section className={`overflow-hidden rounded-lg border ${contextToneClass(card.tone)}`}>
        <div className={`m-2.5 flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5 ${contextHeaderToneClass(card.tone)}`}>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link2 className="size-3.5 shrink-0 text-text-heading" />
              <p className="text-[12px] font-semibold text-text-primary">{card.title}</p>
              {card.subtitle ? <span className="truncate text-[11px] font-semibold uppercase tracking-[0.18px] text-text-muted">{card.subtitle}</span> : null}
            </div>
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-text-secondary">{card.body}</p>
          </div>
          {card.links?.[0] ? (
            <Link
              to={card.links[0].href}
              data-keep-sidepanel="link"
              className="shrink-0 rounded-full border border-border-default bg-white px-2.5 py-1 text-[10px] font-semibold text-text-secondary transition-colors hover:border-brand-blue hover:text-brand-blue"
            >
              {card.links[0].label}
            </Link>
          ) : null}
        </div>
        {card.metrics?.length ? (
          <div className="grid grid-cols-4 gap-1.5 px-3 py-2.5">
            {card.metrics.slice(0, 4).map((metric) => (
              <div key={`${card.id}-${metric.label}`} className={`min-w-0 rounded-md px-2 py-1.5 ${metricToneClass(card.tone)}`}>
                <p className="truncate text-[9px] text-text-muted">{metric.label}</p>
                <p className="truncate text-[11px] font-semibold text-text-primary">{formatMetricValue(metric.value)}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    );
  }
  return (
    <section className={`overflow-hidden rounded-lg border ${contextToneClass(card.tone)}`}>
      <div className={`m-3 flex items-start justify-between gap-3 rounded-lg border ${compact ? 'px-3 py-3' : 'px-4 py-3'} ${contextHeaderToneClass(card.tone)}`}>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link2 className="size-4 shrink-0 text-text-heading" />
            <p className="text-[13px] font-semibold text-text-primary">{card.title}</p>
          </div>
          {card.subtitle ? <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24px] text-text-muted">{card.subtitle}</p> : null}
        </div>
        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold text-text-muted">
          {card.kind.replace(/_/g, ' ')}
        </span>
      </div>
      <div className={compact ? 'px-3 pb-3 pt-0' : 'px-4 pb-4 pt-0'}>
        <p className="text-[12px] leading-relaxed text-text-secondary">{card.body}</p>
      {card.metrics?.length ? (
        <div className={`mt-3 grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {card.metrics.slice(0, compact ? 4 : 3).map((metric) => (
            <div key={`${card.id}-${metric.label}`} className={`min-w-0 rounded-lg px-3 py-2 ${metricToneClass(card.tone)}`}>
              <p className="text-[10px] text-text-muted">{metric.label}</p>
              <p className="truncate text-[13px] font-semibold text-text-primary">{formatMetricValue(metric.value)}</p>
            </div>
          ))}
        </div>
      ) : null}
      {card.links?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {card.links.map((link) => (
            <Link
              key={`${card.id}-${link.href}`}
              to={link.href}
              data-keep-sidepanel="link"
              className="inline-flex rounded-full border border-border-default bg-white px-2.5 py-1 text-[11px] font-semibold text-text-secondary transition-colors hover:border-brand-blue hover:text-brand-blue"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
      </div>
    </section>
  );
}

export function ContextSupportCardsSection({
  cards,
  className = 'mt-3',
  compact = false,
}: {
  cards: ContextSupportCard[];
  className?: string;
  compact?: boolean;
}) {
  if (!cards.length) return null;
  return (
    <div className={`${className} space-y-3`}>
      {cards.map((card) => (
        <ContextSupportCardItem key={card.id} card={card} compact={compact} />
      ))}
    </div>
  );
}
