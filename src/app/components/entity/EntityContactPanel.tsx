import { Mail, MapPin, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { EntityContactSection } from '../../domain/entityFolders';
import { EntitySectionCard } from './EntitySectionCard';

type ContactRow = {
  icon: typeof Mail;
  groupLabel: string;
  items: { kind: string; value: string; href?: string }[];
};

function ContactRow({ row }: { row: ContactRow }) {
  const Icon = row.icon;
  return (
    <div className="flex items-start gap-3 border-b border-border-soft py-3 last:border-b-0">
      <div className="flex w-[120px] shrink-0 items-center gap-2 text-[13px] font-medium text-text-primary">
        <Icon className="size-4 text-text-secondary" />
        <span>{row.groupLabel}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {row.items.map((item, idx) => (
          <div
            key={`${item.kind}-${idx}`}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5"
          >
            <span className="w-[80px] shrink-0 text-[12px] font-normal text-text-secondary">
              {item.kind}
            </span>
            {item.href ? (
              <a
                href={item.href}
                className="break-all text-[13px] font-semibold text-brand-blue hover:underline"
              >
                {item.value}
              </a>
            ) : (
              <span className="break-all text-[13px] font-normal text-text-primary">
                {item.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Section card for emails / phones / addresses. Used by Agent / Participant.
 */
export function EntityContactPanel({ section }: { section: EntityContactSection }) {
  const { t } = useTranslation('folders');
  /* Translate contact "kind" labels (Business / Personal / Mobile / Residence)
   * via the shared entity.contact.kinds map so they follow the active language. */
  const kindLabel = (kind: string) =>
    t(`entity.contact.kinds.${kind}` as never, { defaultValue: kind });
  const rows: ContactRow[] = [];
  if (section.emails && section.emails.length > 0) {
    rows.push({
      icon: Mail,
      groupLabel: t('entity.contact.emails'),
      items: section.emails.map((e) => ({
        kind: kindLabel(e.kind),
        value: e.address,
        href: `mailto:${e.address}`,
      })),
    });
  }
  if (section.phones && section.phones.length > 0) {
    rows.push({
      icon: Phone,
      groupLabel: t('entity.contact.phones'),
      items: section.phones.map((p) => ({ kind: kindLabel(p.kind), value: p.number })),
    });
  }
  if (section.addresses && section.addresses.length > 0) {
    rows.push({
      icon: MapPin,
      groupLabel: t('entity.contact.addresses'),
      items: section.addresses.map((a) => ({ kind: kindLabel(a.kind), value: a.address })),
    });
  }

  return (
    <EntitySectionCard title={section.title}>
      <div className="flex flex-col">
        {rows.map((row, idx) => (
          <ContactRow row={row} key={`${row.groupLabel}-${idx}`} />
        ))}
      </div>
    </EntitySectionCard>
  );
}
