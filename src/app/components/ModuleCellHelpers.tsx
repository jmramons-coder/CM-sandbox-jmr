import type { CSSProperties, ReactNode } from 'react';
import { stripSummaryTitleDecorators } from '../utils/summaryText';
import { getStatusLozengeType } from '../utils/status-display';
import { AiCueSparkle } from './AiCueSparkle';
import { LozengeTag } from './LozengeTag';
import { PriorityChip } from './ds';

export const TABLE_LINK_CLASS = 'text-[13px] font-semibold text-brand-blue underline underline-offset-2 hover:underline';
/** Primary table ID/name link with ellipsis (case list, folder list, requests, etc.). */
export const TABLE_LINK_TRUNCATE_CLASS = `block max-w-full overflow-hidden text-ellipsis whitespace-nowrap ${TABLE_LINK_CLASS}`;
export const TABLE_TEXT_CLASS = 'text-[13px] text-text-primary';
export const TABLE_SUBTEXT_CLASS = 'text-[11px] text-text-muted';

/** Even purple ↔ blue blend; blue only edges in on the far right. Stops lifted ~10% toward white for a lighter glass read. */
const MINI_AI_BADGE_GRADIENT =
  'linear-gradient(100deg, color-mix(in srgb, color-mix(in srgb, var(--brand-accent, #602fa0) 80%, transparent) 90%, white) 0%, color-mix(in srgb, color-mix(in srgb, var(--brand-accent, #602fa0) 60%, var(--brand-primary, #006296)) 90%, white) 28%, color-mix(in srgb, color-mix(in srgb, var(--brand-accent, #602fa0) 44%, var(--brand-primary, #006296)) 90%, white) 50%, color-mix(in srgb, color-mix(in srgb, var(--brand-accent, #602fa0) 36%, var(--brand-primary, #006296)) 90%, white) 72%, color-mix(in srgb, color-mix(in srgb, var(--brand-primary, #006296) 64%, var(--brand-accent, #602fa0)) 90%, white) 88%, color-mix(in srgb, color-mix(in srgb, var(--brand-primary, #006296) 72%, var(--brand-accent, #602fa0)) 90%, white) 100%)';

/** Compact AI pill for table first columns (case / task / requirement id). */
export function MiniAiSourceBadge() {
  return (
    <span
      className="inline-flex h-[22px] shrink-0 items-center gap-1 rounded-[6px] border border-white/28 px-2 text-[10px] font-bold uppercase leading-none tracking-[0.35px] text-white shadow-[0_2px_8px_rgba(27,28,30,0.16),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-md backdrop-saturate-150"
      style={{ backgroundImage: MINI_AI_BADGE_GRADIENT }}
      aria-label="AI"
    >
      <AiCueSparkle size={10} className="!text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]" />
      <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]">AI</span>
    </span>
  );
}

/** Task table first column: muted ID above, task name as primary label. */
export function TaskTableFirstColumnCell({
  taskId,
  taskName,
  aiSourced = false,
  className = '',
}: {
  taskId: string;
  taskName: string;
  aiSourced?: boolean;
  className?: string;
}) {
  return (
    <TableFirstColumnContent aiSourced={aiSourced} className={className}>
      <div className="min-w-0">
        <span className={`block truncate ${TABLE_SUBTEXT_CLASS}`} title={taskId}>
          {taskId}
        </span>
        <span className={`mt-0.5 block truncate ${TABLE_TEXT_CLASS} font-semibold`} title={taskName}>
          {taskName}
        </span>
      </div>
    </TableFirstColumnContent>
  );
}

/** Row-level AI indicator beside the primary cell label (left of main text). */
export function TableFirstColumnContent({
  children,
  aiSourced = false,
  className = '',
}: {
  children: ReactNode;
  aiSourced?: boolean;
  className?: string;
}) {
  return (
    <span className={['flex min-w-0 items-center gap-2', className].filter(Boolean).join(' ')}>
      {aiSourced ? <MiniAiSourceBadge /> : null}
      <span className="min-w-0 flex-1">{children}</span>
    </span>
  );
}

/** Shared body cell alignment for module data tables. */
export const TABLE_CELL_ALIGN_CLASS = 'align-middle';

/** Matches module toolbar `px-6` so table content aligns with SearchBar. */
export const MODULE_TABLE_LEFT_GUTTER_CLASS = 'pl-6';

/** Checkbox column left inset: toolbar gutter + 4px visual nudge. */
export const MODULE_TABLE_CHECKBOX_LEFT_GUTTER_CLASS = 'pl-7';

/** Trailing inset between checkbox control and the next sticky column (~half of legacy pr-3). */
export const MODULE_TABLE_CHECKBOX_COL_TRAILING_CLASS = 'pr-1.5';

/** Horizontal padding on the first sticky data column after the checkbox column. */
export const MODULE_TABLE_FIRST_STICKY_COL_PADDING_CLASS = 'pl-1 pr-2';

/** Checkbox column width: left gutter + control + trailing inset. */
export const MODULE_TABLE_CHECKBOX_COL_WIDTH = 70;

export function isDocumentRowAiSourced(
  source?: string,
  aiSummary?: string,
  insight?: string,
): boolean {
  if (aiSummary || insight) return true;
  if (!source) return false;
  const lower = source.toLowerCase();
  return lower.includes('ai');
}

export function isRequirementAiSourced(source: string): boolean {
  return source === 'ai_rule_engine';
}

export function isTaskAiSourced(task: {
  origin?: string;
  hasAI?: boolean;
  aiGenerated?: boolean;
}): boolean {
  if (task.aiGenerated) return true;
  const origin = task.origin?.toLowerCase() ?? '';
  return origin.includes('ai') || origin.includes('monitoring') || origin.includes('restoration') || Boolean(task.hasAI);
}

export function isTaskSystemSourced(task: { origin?: string }): boolean {
  const origin = task.origin?.toLowerCase() ?? '';
  return (
    origin.includes('system')
    || origin.includes('compliance')
    || origin.includes('calendar')
    || origin.includes('hygiene')
    || origin.includes('exhaustion')
  );
}

export type ModuleSourceTagVariant = 'ai' | 'system' | 'manual';

const MODULE_SOURCE_TAG_CLASS: Record<ModuleSourceTagVariant, string> = {
  ai: 'bg-brand-accent-light text-brand-accent',
  system: 'bg-surface-selected text-brand-blue',
  manual: 'bg-surface-muted text-text-secondary',
};

/** Rounded source pill used in Tasks and Documents module tables. */
export function ModuleSourceTag({
  label,
  variant,
}: {
  label: string;
  variant: ModuleSourceTagVariant;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${MODULE_SOURCE_TAG_CLASS[variant]}`}
    >
      {label}
    </span>
  );
}

export function resolveTaskSourceVariant(task: {
  origin?: string;
  hasAI?: boolean;
  aiGenerated?: boolean;
}): ModuleSourceTagVariant {
  if (isTaskAiSourced(task)) return 'ai';
  if (isTaskSystemSourced(task)) return 'system';
  return 'manual';
}

export function TaskSourceTag(task: { origin?: string; hasAI?: boolean; aiGenerated?: boolean }) {
  const variant = resolveTaskSourceVariant(task);
  const label = variant === 'ai' ? 'AI Agent' : variant === 'system' ? 'System' : 'Manual';
  return <ModuleSourceTag label={label} variant={variant} />;
}

const DOCUMENT_SOURCE_LABELS: Record<string, string> = {
  ai_agent: 'AI Agent',
  ai: 'AI Agent',
  ai_extraction: 'AI Agent',
  ai_rule_engine: 'AI Agent',
  hospital_feed: 'Hospital Feed',
  physio_portal: 'Physio Portal',
  pharmacy_check: 'Pharmacy Check',
  employer_portal: 'Employer Portal',
  payroll_system: 'Payroll System',
  specialist_upload: 'Specialist Upload',
  id_verification: 'ID Verification',
  claimant_upload: 'Claimant Upload',
  claimant_portal: 'Claimant Portal',
  policy_admin: 'Policy Admin',
  medical_provider: 'Medical Provider',
  broker_portal: 'Broker Portal',
  mib: 'MIB',
  mvr_system: 'MVR System',
};

export function getDocumentSourceLabel(source: string): string {
  const key = source.trim().toLowerCase().replace(/\s+/g, '_');
  if (DOCUMENT_SOURCE_LABELS[key]) return DOCUMENT_SOURCE_LABELS[key];
  if (key.includes('_')) {
    return key
      .split('_')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  return source.trim();
}

export function resolveDocumentSourceVariant(source: string): ModuleSourceTagVariant {
  const key = source.trim().toLowerCase().replace(/\s+/g, '_');
  if (
    key === 'ai'
    || key.startsWith('ai_')
    || key === 'ai_extraction'
    || key === 'ai_agent'
    || key === 'ai_rule_engine'
  ) {
    return 'ai';
  }
  if (
    key.endsWith('_portal')
    || key.endsWith('_feed')
    || key.endsWith('_system')
    || key === 'medical_provider'
    || key === 'mib'
    || key === 'policy_admin'
    || key === 'id_verification'
    || key === 'pharmacy_check'
  ) {
    return 'system';
  }
  return 'manual';
}

export function DocumentSourceTag({ source }: { source: string }) {
  return (
    <ModuleSourceTag
      label={getDocumentSourceLabel(source)}
      variant={resolveDocumentSourceVariant(source)}
    />
  );
}

export function isCaseAiSourced(item: { aiSummary?: string; aiRecommendation?: string }): boolean {
  return Boolean(item.aiSummary || item.aiRecommendation);
}

/** Side panel: AI badge (when applicable), status lozenge, priority chip, object id on the right. */
export function SidePanelAiPriorityRow({
  aiSourced = false,
  status,
  priority,
  objectId,
  className = '',
}: {
  aiSourced?: boolean;
  status?: string;
  priority: string;
  objectId: string;
  className?: string;
}) {
  return (
    <div className={['mb-2 flex w-full min-w-0 flex-wrap items-center gap-2', className].filter(Boolean).join(' ')}>
      {aiSourced ? <MiniAiSourceBadge /> : null}
      {status ? (
        <LozengeTag label={status} type={getStatusLozengeType(status, 'task')} subtle />
      ) : null}
      <PriorityChip priority={priority} />
      <span className="ml-auto shrink-0 text-[12px] font-semibold text-text-muted/70">{objectId}</span>
    </div>
  );
}

export function SourcePill({
  label,
  tone,
}: {
  label: string;
  tone: 'ai' | 'system' | 'manual';
}) {
  const cls = tone === 'ai'
    ? 'bg-brand-accent-light text-brand-accent'
    : tone === 'system'
      ? 'bg-surface-selected text-brand-blue'
      : 'bg-surface-muted text-text-secondary';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

/** Orange sparkle superscript cue for AI-backed Summary columns in data tables. */
export function SummaryTableColumnHeader({
  className = 'text-sm font-normal leading-[20px] text-text-secondary',
  style,
  label = 'Summary',
}: {
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  return (
    <span className="inline-flex items-start gap-0">
      <span className={className} style={style}>
        {label}
      </span>
      <span
        className="ml-0.5 -mt-1 flex h-[12px] w-[12px] shrink-0 items-center justify-center rounded-full bg-brand-accent"
        aria-hidden
      >
        <AiCueSparkle size={7} className="!text-white" />
      </span>
    </span>
  );
}

/** Single-line table label with ellipsis and native tooltip for the full value. */
export function TableTruncatedLabel({
  text,
  className = TABLE_TEXT_CLASS,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={['block min-w-0 truncate', className].filter(Boolean).join(' ')} title={text}>
      {text}
    </span>
  );
}

export function TwoLineSummaryCell({
  title,
  summary,
  className = '',
  titleMaxLines = 1,
  titleWeight = 'semibold',
}: {
  title: string;
  summary?: string;
  className?: string;
  /** Max lines for the title row before ellipsis (default single line). */
  titleMaxLines?: 1 | 2;
  titleWeight?: 'normal' | 'semibold';
}) {
  const displayTitle = stripSummaryTitleDecorators(title);
  const displaySummary = summary ? stripSummaryTitleDecorators(summary) : undefined;
  const titleWeightClass = titleWeight === 'normal' ? 'font-normal' : 'font-semibold';
  const titleClass =
    titleMaxLines === 2
      ? `line-clamp-2 text-[13px] ${titleWeightClass} leading-snug text-text-primary`
      : `truncate text-[13px] ${titleWeightClass} text-text-primary`;

  return (
    <div className={`max-w-[520px] ${className}`}>
      <p className={titleClass} title={displayTitle}>
        {displayTitle}
      </p>
      {displaySummary ? <p className="mt-0.5 truncate text-[11px] text-text-muted">{displaySummary}</p> : null}
    </div>
  );
}
