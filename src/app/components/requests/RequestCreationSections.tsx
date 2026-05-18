import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Calendar,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Globe,
  ListChecks,
  Mail,
  Phone,
  Shield,
  UserRound,
} from 'lucide-react';
import { PriorityChip } from '../ds';
import { CreationPreviewCard, ReviewMetaBadge } from '../creation/CreationPreviewCard';
import type { RequestSourceChannel } from '../../types';
import { type RequestCreationMode, type RequestCreationTemplate } from './requestCreationConfig';

export function RequestCreationSection({
  children,
  subtitle,
  title,
  action,
  collapsible,
  open = true,
  onOpenChange,
}: {
  children: ReactNode;
  subtitle?: string;
  title: string;
  action?: ReactNode;
  collapsible?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const header = (
    <div className="flex w-full items-start justify-between gap-3 text-left">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        {collapsible ? (
          <ChevronDown
            className={`size-4 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );

  return (
    <section className="rounded-lg border border-border-default bg-white">
      {collapsible ? (
        <button
          type="button"
          onClick={() => onOpenChange?.(!open)}
          className="flex w-full items-start px-4 py-4 sm:px-5"
        >
          {header}
        </button>
      ) : (
        <div className="px-4 py-4 sm:px-5">{header}</div>
      )}
      {open ? (
        <div className="space-y-4 px-4 pb-4 pt-1 sm:px-5">{children}</div>
      ) : null}
    </section>
  );
}

export function RequestAudienceChooser({
  mode,
  onChange,
}: {
  mode: RequestCreationMode;
  onChange: (mode: RequestCreationMode) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <AudienceCard
        active={mode === 'external'}
        onClick={() => onChange('external')}
        icon={Briefcase}
        title="External party"
        description="Doctors, hospitals, labs, employers, and other third parties."
      />
      <AudienceCard
        active={mode === 'internal'}
        onClick={() => onChange('internal')}
        icon={UserRound}
        title="Client / policyholder"
        description="Forms, signatures, payment updates, and identity checks sent to the client."
      />
    </div>
  );
}

function AudienceCard({
  active,
  description,
  icon: Icon,
  onClick,
  title,
}: {
  active: boolean;
  description: string;
  icon: typeof Briefcase;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
        active
          ? 'border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue'
          : 'border-border-default bg-white hover:border-brand-blue/40'
      }`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
          active ? 'bg-brand-blue text-white' : 'bg-surface-muted text-text-secondary'
        }`}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-text-primary">{title}</span>
        <span className="mt-0.5 block text-xs leading-snug text-text-muted">{description}</span>
      </span>
    </button>
  );
}

export function RequestCategoryFilter({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value: string;
  onChange: (category: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const active = value === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              active
                ? 'border-brand-blue bg-brand-blue text-white'
                : 'border-border-default bg-white text-text-secondary hover:border-brand-blue/40 hover:text-brand-blue'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

export function RequestTemplateGrid({
  templates,
  selectedId,
  onSelect,
}: {
  templates: RequestCreationTemplate[];
  selectedId: string;
  onSelect: (template: RequestCreationTemplate) => void;
}) {
  if (templates.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border-default bg-surface-muted px-3 py-4 text-center text-sm text-text-muted">
        No templates for this type. Choose another request type or audience.
      </p>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => {
        const active = template.id === selectedId;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            className={`min-w-0 rounded-lg border px-3 py-2.5 text-left transition-colors ${
              active
                ? 'border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue'
                : 'border-border-default bg-white hover:border-brand-blue/40 hover:bg-surface-hover'
            }`}
          >
            <span className="block text-sm font-semibold leading-snug text-text-primary">{template.label}</span>
            {active ? (
              <span className="mt-1 block text-xs leading-snug text-text-muted line-clamp-2">{template.description}</span>
            ) : (
              <span className="mt-0.5 block text-[11px] text-text-muted">{template.category}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

const CHANNEL_META: Record<string, { label: string; icon: LucideIcon }> = {
  client_portal: { label: 'Client portal', icon: Globe },
  email: { label: 'Email', icon: Mail },
  phone: { label: 'Phone', icon: Phone },
};

const LINKED_ICON: Record<string, LucideIcon> = {
  Client: UserRound,
  Case: Briefcase,
  Policy: Shield,
  Requirement: ClipboardCheck,
  Tasks: ListChecks,
};

function formatChannelLabel(channel: string) {
  return CHANNEL_META[channel]?.label ?? channel.replace(/_/g, ' ');
}

export function RequestReviewSummary({
  title,
  templateLabel,
  priority,
  sourceChannel,
  mode,
  requesterLabel,
  notes,
  linked,
  due,
}: {
  title: string;
  templateLabel: string;
  priority: string;
  sourceChannel: RequestSourceChannel | string;
  mode: RequestCreationMode;
  requesterLabel: string;
  notes: string;
  linked: { label: string; value: string }[];
  due?: string;
}) {
  const ChannelIcon = CHANNEL_META[sourceChannel]?.icon ?? Globe;
  const channelLabel = formatChannelLabel(sourceChannel);
  const ModeIcon = mode === 'external' ? Briefcase : UserRound;

  return (
    <CreationPreviewCard
      eyebrow="Request preview"
      title={title.trim() || 'Untitled request'}
      subtitle={templateLabel}
      badges={
        <>
          <ReviewMetaBadge
            icon={ModeIcon}
            label={mode === 'external' ? 'External party' : 'Client / policyholder'}
            tone="accent"
          />
          <PriorityChip priority={priority} />
          <ReviewMetaBadge icon={ChannelIcon} label={channelLabel} />
          {due ? <ReviewMetaBadge icon={Calendar} label={due} /> : null}
        </>
      }
      highlight={{
        label: mode === 'external' ? 'Sending to' : 'Client recipient',
        value: requesterLabel,
        icon: ModeIcon,
        emptyLabel: 'Recipient not set yet',
      }}
      linked={linked.map((row) => ({
        ...row,
        icon: LINKED_ICON[row.label],
      }))}
      notes={notes}
      notesLabel="Internal notes"
    />
  );
}
