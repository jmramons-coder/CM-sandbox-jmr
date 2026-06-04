import {
  AlertTriangle,
  CheckSquare,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  ListTodo,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useCaseBriefCompanionPanelOpen } from '../hooks/useCaseBriefCompanionPanelOpen';
import { useNavigate } from 'react-router';
import { AiCueSparkle } from './AiCueSparkle';
import { MiniAiSourceBadge } from './ModuleCellHelpers';
import type {
  DailyBriefContent,
  DailyBriefHighlightIcon,
  DailyBriefHighlightTone,
  DailyBriefLinkKind,
  DailyBriefSegment,
} from '../domain/dailyBrief';

type DailyBriefCardProps = {
  content: DailyBriefContent;
  className?: string;
  /** Case file overview: no title pill, one-line preview with chevron to expand. */
  variant?: 'default' | 'case';
};

const CUE_ICONS: Record<DailyBriefHighlightIcon, LucideIcon> = {
  sla: Clock,
  blocker: AlertTriangle,
  focus: ListTodo,
  decision: ClipboardCheck,
  progress: Clock,
};

const LINK_KIND_ICONS: Partial<Record<DailyBriefLinkKind, LucideIcon>> = {
  task: CheckSquare,
  requirement: ClipboardList,
};

const CUE_TONE_CLASS: Record<DailyBriefHighlightTone, string> = {
  neutral: 'border-border-soft/90 bg-white/80 text-text-secondary',
  warn: 'border-[#f0d9a8]/90 bg-white/85 text-[#9a7b2e]',
  urgent: 'border-[#f5c4c2]/90 bg-white/85 text-[#b44a48]',
  action: 'border-[color-mix(in_srgb,var(--brand-accent)_22%,transparent)] bg-white/85 text-brand-accent',
  positive: 'border-[#b8e6c8]/90 bg-white/85 text-[#3d8b5a]',
};

function InlineBriefCue({
  label,
  tone,
  icon,
}: {
  label: string;
  tone: DailyBriefHighlightTone;
  icon: DailyBriefHighlightIcon;
}) {
  const Icon = CUE_ICONS[icon];

  return (
    <span
      className={`mx-0.5 inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-1.5 py-0.5 align-middle text-[10px] font-semibold leading-none tracking-[0.2px] shadow-[0_1px_2px_rgba(27,28,30,0.03)] backdrop-blur-[2px] ${CUE_TONE_CLASS[tone]}`}
      aria-hidden
    >
      <Icon className="size-3 shrink-0 opacity-85" strokeWidth={2.25} />
      <span className="uppercase">{label}</span>
    </span>
  );
}

function InlineBriefLink({
  label,
  route,
  kind,
  onNavigate,
}: {
  label: string;
  route: string;
  kind: DailyBriefLinkKind;
  onNavigate: (route: string) => void;
}) {
  const KindIcon = LINK_KIND_ICONS[kind];

  return (
    <button
      type="button"
      onClick={() => onNavigate(route)}
      className="mx-[0.2em] inline-flex cursor-pointer items-baseline gap-0.5 border-0 bg-transparent p-0 text-[14px] font-normal leading-[1.7] text-brand-blue underline underline-offset-2 transition-colors duration-200 hover:text-brand-blue-hover sm:text-[15px] sm:leading-[1.75]"
    >
      <span className="underline underline-offset-2">{label}</span>
      {KindIcon ? (
        <KindIcon
          className="size-3 shrink-0 translate-y-[0.08em] text-brand-blue/65 no-underline"
          strokeWidth={2.25}
          aria-hidden
        />
      ) : null}
    </button>
  );
}

function BriefSentence({
  segments,
  onNavigate,
  clampOneLine = false,
  reserveMetaSpace = false,
}: {
  segments: DailyBriefSegment[];
  onNavigate: (route: string) => void;
  clampOneLine?: boolean;
  reserveMetaSpace?: boolean;
}) {
  return (
    <p
      className={`max-w-[52rem] text-[14px] font-normal leading-[1.7] text-[#1b1c1e] sm:text-[15px] sm:leading-[1.75] ${reserveMetaSpace ? 'pr-12 sm:pr-14' : ''} ${clampOneLine ? 'line-clamp-1' : ''}`.trim()}
    >
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={`t-${index}`}>{segment.value}</span>;
        }
        if (segment.type === 'cue') {
          return (
            <InlineBriefCue
              key={`q-${index}-${segment.label}`}
              label={segment.label}
              tone={segment.tone}
              icon={segment.icon}
            />
          );
        }
        return (
          <InlineBriefLink
            key={`l-${index}-${segment.route}`}
            label={segment.label}
            route={segment.route}
            kind={segment.kind}
            onNavigate={onNavigate}
          />
        );
      })}
    </p>
  );
}

function BriefMetaBadges() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <MiniAiSourceBadge />
    </div>
  );
}

/** Shared daily brief card — one UI for home and every module context. */
export function DailyBriefCard({
  content,
  className = '',
  variant = 'default',
}: DailyBriefCardProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const isCaseVariant = variant === 'case';
  const companionPanelOpen = useCaseBriefCompanionPanelOpen();
  const deEmphasized = isCaseVariant && companionPanelOpen;
  const segments =
    content.segments.length > 0
      ? content.segments
      : [{ type: 'text' as const, value: content.text }];

  return (
    <section
      className={`daily-brief-banner group relative overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)] transition-[box-shadow] duration-200 ${
        deEmphasized
          ? 'daily-brief-banner--deemphasized shadow-[0_1px_2px_rgba(27,28,30,0.04)]'
          : 'shadow-[0_1px_2px_rgba(27,28,30,0.04),0_12px_40px_color-mix(in_srgb,var(--brand-accent)_14%,transparent),0_4px_16px_color-mix(in_srgb,var(--brand-primary)_8%,transparent)]'
      } ${className}`.trim()}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="daily-brief-banner__orb daily-brief-banner__orb--accent" />
        <div className="daily-brief-banner__orb daily-brief-banner__orb--primary" />
        <div className="daily-brief-banner__orb daily-brief-banner__orb--soft" />
        <div className="daily-brief-banner__frost" />
        <div className="daily-brief-banner__shine" />
        <div className="daily-brief-banner__grain" />
      </div>

      <div
        className={`daily-brief-banner__body px-5 sm:px-6 ${isCaseVariant ? 'py-3 sm:py-3' : 'py-4 sm:py-[1.125rem]'}`}
      >
        {isCaseVariant ? (
          <div className={`flex gap-2 ${expanded ? 'items-start' : 'items-center'}`}>
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              aria-label={expanded ? 'Collapse case brief' : 'Expand case brief'}
              className="flex shrink-0 items-center leading-[1.7] text-brand-accent transition-colors hover:text-brand-blue sm:leading-[1.75]"
            >
              <ChevronRight
                className={`size-4 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
                strokeWidth={2.25}
                aria-hidden
              />
            </button>
            <div className="relative min-w-0 flex-1">
              <div className="pointer-events-auto absolute right-0 top-0 z-[1] flex items-center gap-2">
                <BriefMetaBadges />
              </div>
              <BriefSentence
                segments={segments}
                onNavigate={navigate}
                clampOneLine={!expanded}
                reserveMetaSpace={!expanded}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/65 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.32px] text-brand-accent shadow-[0_1px_3px_rgba(27,28,30,0.05)] backdrop-blur-md transition-[background-color,box-shadow] duration-300 group-hover:bg-white/75 group-hover:shadow-[0_2px_8px_color-mix(in_srgb,var(--brand-accent)_12%,transparent)]">
                <AiCueSparkle size={12} className="!text-brand-accent" spinOnParentHover />
                {content.title}
              </span>
              <BriefMetaBadges />
            </div>
            <BriefSentence segments={segments} onNavigate={navigate} />
          </>
        )}
      </div>
    </section>
  );
}
