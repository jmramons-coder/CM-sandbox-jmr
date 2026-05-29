import type { ReactNode } from 'react';
import { Database, ExternalLink, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { MODULE_TABLE_ROW_KEBAB_ENABLED } from '../../constants/moduleTableRowActions';
import type { CaseDocument, CaseRequirement } from '../../types';
import { AiInsightInline } from '../AiInsightCell';
import { LozengeTag } from '../LozengeTag';
import { PriorityChip } from '../ds';
import { DocumentMiniPreviewThumb } from '../DocumentMiniPreviewThumb';
import {
  isRequirementAiSourced,
  isTaskAiSourced,
  MiniAiSourceBadge,
} from '../ModuleCellHelpers';
import { getDocumentSourceLabel } from '../ModuleCellHelpers';
import { getStatusLozengeType } from '../../utils/status-display';
import { ModuleMobileListCardShell } from '../ModuleMobileListCard';

export function CaseTabCardMetaField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">{label}</p>
      <div className="mt-0.5 min-w-0 text-[12px] font-semibold leading-snug text-text-primary">{children}</div>
    </div>
  );
}

function DocumentValidatedIconTag({ status }: { status: string }) {
  if (status === 'Validated') {
    return (
      <span
        className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-brand-green/35 bg-[#e5f5ea] text-brand-green"
        title="Validated"
        aria-label="Validated"
      >
        <span className="text-[11px] font-bold">✓</span>
      </span>
    );
  }
  return (
    <LozengeTag label={status} type={getStatusLozengeType(status, 'document')} subtle size="compact" />
  );
}

function documentHasAiInsight(doc: CaseDocument) {
  return Boolean(doc.aiSummary || doc.insight || doc.aiAction);
}

export function requirementSourceLabel(source: string): string {
  if (source === 'ai_rule_engine') return 'AI Rule Engine';
  if (source === 'id_verification') return 'ID Verification';
  if (source === 'employer_portal') return 'Employer Portal';
  if (source === 'pharmacy_check') return 'Pharmacy Check';
  return source;
}

export type CaseContextTaskRow = {
  id: string;
  taskType: string;
  priority: string;
  status: string;
  dueDate: string;
  stage?: string;
  aiGenerated?: boolean;
  assignee: string;
  task?: {
    aiSummary?: string;
    description?: string;
    origin?: string;
    hasAI?: boolean;
    aiGenerated?: boolean;
  };
};

export function CaseTaskMobileCard({
  row,
  selected,
  onSelect,
}: {
  row: CaseContextTaskRow;
  selected: boolean;
  onSelect: () => void;
}) {
  const resolvedTask = row.task;
  const showAiSourceBadge =
    row.aiGenerated ||
    isTaskAiSourced(resolvedTask ?? { aiGenerated: row.aiGenerated, origin: resolvedTask?.origin });
  const summary = resolvedTask?.aiSummary ?? resolvedTask?.description;

  return (
    <ModuleMobileListCardShell selected={selected} onSelect={onSelect}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {showAiSourceBadge ? <MiniAiSourceBadge /> : null}
          <PriorityChip priority={row.priority} />
          <LozengeTag label={row.status} type={getStatusLozengeType(row.status, 'task')} subtle />
        </div>
      </div>

      <h3 className="mb-2 text-sm font-semibold leading-snug text-text-heading">{row.taskType}</h3>

      {summary ? (
        <div className="mb-3">
          <AiInsightInline summary={summary} showSourceBadge={false} />
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        <CaseTabCardMetaField label="Stage">
          <span className="break-words">{row.stage || '—'}</span>
        </CaseTabCardMetaField>
        <CaseTabCardMetaField label="Due">
          <span className="break-words">{row.dueDate || '—'}</span>
        </CaseTabCardMetaField>
        <CaseTabCardMetaField label="Assignee">
          <span className="break-words">{row.assignee || '—'}</span>
        </CaseTabCardMetaField>
        <CaseTabCardMetaField label="Task ID">
          <span className="break-words font-mono text-[11px]">{row.id}</span>
        </CaseTabCardMetaField>
      </div>
    </ModuleMobileListCardShell>
  );
}

export function CaseDocumentMobileCard({
  row,
  selected,
  onSelect,
  onOpenRequirementTab,
}: {
  row: CaseDocument;
  selected: boolean;
  onSelect: () => void;
  onOpenRequirementTab: () => void;
}) {
  const summary = row.aiSummary || row.insight;

  return (
    <div
      data-keep-sidepanel="card"
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`flex cursor-pointer items-stretch overflow-hidden rounded-lg border transition-all hover:shadow-md active:scale-[0.99] ${
        selected ? 'border-brand-blue bg-surface-selected-alt' : 'border-border-default bg-white'
      }`}
    >
      <div className="min-w-0 flex-1 p-4">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {documentHasAiInsight(row) ? <MiniAiSourceBadge /> : null}
          <LozengeTag label={row.category} type="Neutral" subtle size="compact" />
          <DocumentValidatedIconTag status={row.status} />
        </div>

        <h3 className="mb-2 text-sm font-semibold leading-snug text-text-heading">{row.name}</h3>

        {summary ? (
          <div className="mb-3">
            <AiInsightInline summary={summary} showSourceBadge={false} />
          </div>
        ) : null}

        <div className="mb-3 grid grid-cols-2 gap-x-3 gap-y-3">
          <CaseTabCardMetaField label="Stage">
            <span className="break-words">{row.stage || '—'}</span>
          </CaseTabCardMetaField>
          <CaseTabCardMetaField label="Uploaded">
            <span className="break-words">{row.uploaded || '—'}</span>
          </CaseTabCardMetaField>
        </div>

        <div className="mb-1 flex items-center gap-1.5 text-[12px] text-text-muted">
          <Database className="size-3.5 shrink-0 text-[#c4c8ce]" strokeWidth={2} aria-hidden />
          <span className="min-w-0 truncate">{getDocumentSourceLabel(row.source)}</span>
        </div>

        {row.linkedRequirement ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpenRequirementTab();
            }}
            className="mt-1 text-left text-[12px] font-semibold text-brand-blue underline decoration-brand-blue/30"
          >
            {row.linkedRequirement}
          </button>
        ) : null}
      </div>

      <div className="w-px shrink-0 self-stretch bg-border-default" aria-hidden />

      <div className="flex w-[114px] shrink-0 flex-col self-stretch">
        <div className="flex min-h-[136px] flex-1 items-center justify-center bg-[#f7f8fa] p-2">
          <DocumentMiniPreviewThumb
            documentId={row.id}
            filename={row.filename ?? row.name}
            fileUrl={row.fileUrl}
            fileAvailable={row.fileAvailable}
            className="!flex !h-full !min-h-[114px] !w-[88px] !rounded-[6px]"
          />
        </div>
        {row.fileSize ? (
          <div className="border-t border-border-soft px-1.5 py-2 text-center text-[10px] font-medium leading-tight text-text-muted">
            {row.fileSize}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function CaseRequirementMobileCard({
  row,
  selected,
  onSelect,
  kebabOpen,
  onKebabToggle,
  onEdit,
  onDelete,
  externalHref,
  externalCode,
}: {
  row: CaseRequirement;
  selected: boolean;
  onSelect: () => void;
  kebabOpen: boolean;
  onKebabToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  externalHref: string;
  externalCode: string;
}) {
  const sourceText = requirementSourceLabel(row.source);
  const showAi = isRequirementAiSourced(row.source) || Boolean(row.aiSummary);
  const summary = row.aiSummary || row.notes;

  return (
    <div
      data-keep-sidepanel="card"
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`cursor-pointer rounded-lg border p-4 text-left transition-all hover:shadow-md active:scale-[0.99] ${
        selected ? 'border-brand-blue bg-surface-selected-alt' : 'border-border-default bg-white'
      } ${row.status === 'Overdue' && !selected ? 'border-[#cd2c23]/25' : ''}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {showAi ? <MiniAiSourceBadge /> : null}
          <LozengeTag label={row.category} type="Neutral" subtle size="compact" />
          <LozengeTag label={row.status} type={getStatusLozengeType(row.status, 'requirement')} subtle />
        </div>
        {MODULE_TABLE_ROW_KEBAB_ENABLED ? (
          <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={onKebabToggle}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted"
              aria-label="Requirement actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {kebabOpen ? (
              <>
                <div className="fixed inset-0 z-[10]" onClick={onKebabToggle} />
                <div className="absolute right-0 top-full z-[20] mt-1 w-[140px] overflow-hidden rounded-lg border border-border-default bg-white py-1 shadow-[0_8px_24px_rgba(27,28,30,0.12)]">
                  <button
                    type="button"
                    onClick={onEdit}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-muted"
                  >
                    <Pencil className="h-3.5 w-3.5 text-text-secondary" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand-red hover:bg-[#fde5e4]"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <h3 className="mb-2 text-sm font-semibold leading-snug text-text-heading">{row.name}</h3>

      {summary ? (
        <div className="mb-3">
          <AiInsightInline summary={summary} showSourceBadge={false} />
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        <CaseTabCardMetaField label="Due">
          <span className="break-words">{row.dueDate || '—'}</span>
        </CaseTabCardMetaField>
        <CaseTabCardMetaField label="Follow-up">
          <span className="break-words">{row.followUpDate || '—'}</span>
        </CaseTabCardMetaField>
        <CaseTabCardMetaField label="Stage">
          <span className="break-words">{row.stage || '—'}</span>
        </CaseTabCardMetaField>
        <CaseTabCardMetaField label="Source">
          <span className="break-words">{sourceText}</span>
        </CaseTabCardMetaField>
        <CaseTabCardMetaField label="External">
          <a
            href={externalHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 font-mono text-[11px] text-brand-blue underline decoration-brand-blue/30"
          >
            {externalCode}
            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
          </a>
        </CaseTabCardMetaField>
        <CaseTabCardMetaField label="Phase">
          <span className="break-words capitalize">{row.phase ? row.phase.replace('-', ' ') : '—'}</span>
        </CaseTabCardMetaField>
      </div>
    </div>
  );
}
