import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTableHorizontalScroll } from '../hooks/useTableHorizontalScroll';
import { moduleTableScrollContainerClass } from '../utils/module-table-scroll';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import {
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  History,
  Maximize2,
  X,
  Clock,
  List,
  LayoutGrid,
  Search,
  MessageSquareText,
  Lightbulb,
  ListChecks,
  ClipboardList,
  ExternalLink,
  Download,
  Check,
  Upload,
  MoreVertical,
  Pencil,
  Trash2,
  Briefcase,
  ClipboardCheck,
  FileText,
  Save,
  Stamp,
  Scale,
  type LucideIcon,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { getCaseOverview } from '../data/mock-cases';
import { deleteEntity, upsertRequirement } from '../data/datasetMutations';
import { useCasesNav } from '../contexts/CasesNavContext';
import { AiCueSparkle } from './AiCueSparkle';
import { SidePanelAiSummary } from './AiSummaryWithConfidenceCard';
import { AiInsightCell, AiInsightInline, FilterDropdown } from './index';
import { LozengeTag } from './LozengeTag';
import { Checkbox } from './ui/checkbox';
import { DecisionTab } from './DecisionTab';
import { getInsightBundle } from './caseInsightsData';
import { AiClientProfilePanel } from './AiClientProfilePanel';
import { AiCopilotDock, type ChatTurn } from './AiCopilotFooter';
import { CaseInsightsPanel } from './CaseInsightsPanel';
import { getDeathClaimPreApprovalStepTooltip, getNewBusinessPreApprovalStepTooltip, getPostApprovalStepTooltip, getPreApprovalStepTooltip } from './stepperStepTooltips';
import type { CaseDocument, CaseOverview, CasePhase, CaseRAGStatus, CaseRequirement, HumanDecision, Task } from '../types';
import type { UnderwritingScoring, UnderwritingScoringItem } from '../domain/objectRefs';
import { resolveTaskForCaseContextRow } from '../utils/caseContextualTask';
import { TaskDetailEmbeddedView, TaskDetailSidePanel, type TaskPanelNavigationPayload } from './TaskDetailSidePanel';
import {
  documentIdFromPanelContext,
  documentPanelContextId,
  pushWorkspacePanelContext,
  requirementPanelContextId,
  taskPanelContextId,
} from '../utils/workspacePanelContextUtils';
import { CreateTaskModal } from './CreateTaskModal';
import { RequirementContextBody } from './RequirementContextBody';
import { WorkspaceObjectSidePanel, type WorkspacePanelContext } from './WorkspaceObjectSidePanel';
import { DynamicDocumentSidePanel, type DynamicDocumentData } from './DynamicDocumentSidePanel';
import { getDocumentEvidence } from '../data/mock-document-evidence';
import { getDocumentFileType } from '../data/documentMetadata';
import { AiActivityToast, type AiActivitySequence } from './AiActivityToast';
import { deleteScoringItem, deriveHumanNet, deriveRiskClass, normalizeScoring, scoreBarPct, toScoringRows, upsertScoringItem, type ScoringItemType, type ScoringRow } from '../domain/scoring';
import { useLiveContextOverlay } from '../contexts/LiveContextProvider';
import { getDefaultSidePanelWidth } from '../utils/sidepanel-width';
import { useDataSourceSettings, usePlatformSettings } from '../contexts/PlatformSettingsContext';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';
import { getCaseType, parseCaseTypeCodeFromId, resolveCopy } from '../domain/caseTypes';
import { claimSubTypeLabel, resolveClaimSubType } from '../domain/claimSubTypes';
import { copilotClaimContextHint } from '../domain/claimSubTypeContent';
import { buildDatasetAssistantReply } from '../domain/assistantResponses';
import { PriorityChip, SearchBar, SectionLabel } from './ds';
import { WorkspaceAssistantPanel } from './WorkspaceAssistantPanel';
import { ModuleTabsBar } from './ModuleTabsBar';
import { deriveDocumentSummaryTitle, documentSummarySubtitle } from '../utils/summaryText';
import {
  isRequirementAiSourced,
  SummaryTableColumnHeader,
  TABLE_LINK_CLASS,
  TABLE_SUBTEXT_CLASS,
  TABLE_TEXT_CLASS,
  TableFirstColumnContent,
  TaskTableFirstColumnCell,
  TwoLineSummaryCell,
} from './ModuleCellHelpers';
import { getStatusLozengeType } from '../utils/status-display';
import { filterDatasetBySettings, getSystemDataset, listActivityEvents, listCaseSummaries, listCommunications, listDocuments, listRequirements, listTasks } from '../data/objectRepository';
import { isEntityEnabled, resolveEffectiveCaseTypeAnatomy } from '../domain/runtimeDataConfig';
import type { EffectiveCaseTypeAnatomy } from '../domain/entityAnatomy';
import type { CaseGeneralInformationCard, CaseGeneralInformationCollapsible, CaseWorkflowSubwayStage } from '../domain/objectRefs';

/** External source host for requirements (replace with env-driven URL in production). */
const EXTERNAL_SOURCE_ORIGIN = 'https://oipa.example.com';

function requirementExternalHref(caseId: string, row: CaseRequirement): string {
  return row.oipaUrl ?? `${EXTERNAL_SOURCE_ORIGIN}/claims/${encodeURIComponent(caseId)}/requirements/${row.id}`;
}

/** Short reference shown in the requirements table (links to external source). */
function requirementExternalCode(row: CaseRequirement): string {
  return `R-${row.id}`;
}

function caseTabFromWorkflowLabel(label: string): CaseTab | null {
  const normalized = label.toLowerCase();
  if (normalized === 'general information') return 'overview';
  if (normalized === 'requirements') return 'requirements';
  if (normalized === 'tasks') return 'tasks';
  if (normalized === 'documents') return 'documents';
  if (normalized === 'communications') return 'communications';
  if (normalized === 'relationships') return 'related_cases';
  if (normalized === 'activities') return 'history';
  if (normalized === 'scoring') return 'scoring';
  if (normalized === 'application') return 'activation';
  return null;
}

function documentToCaseContextRow(document: CaseDocument): CaseDocumentContextRow {
  return {
    id: document.id,
    name: document.name,
    category: document.category,
    status: document.status,
    uploaded: document.uploaded,
    source: document.source,
    aiSummary: document.aiSummary,
    linkedRequirement: document.linkedRequirement,
    linkedRequirementId: document.linkedRequirementId,
    fileSize: document.fileSize,
    fileType: document.fileType,
  };
}

type CaseTab = 'overview' | 'tasks' | 'requirements' | 'decision' | 'communications' | 'documents' | 'requests' | 'related_cases' | 'history' | 'scoring' | 'licensing' | 'contracts' | 'activation';
type CaseDocumentContextRow = {
  id?: string;
  name: string;
  category: string;
  status: string;
  uploaded: string;
  source: string;
  aiSummary: string;
  linkedRequirement: string;
  linkedRequirementId?: string;
  fileSize?: string;
  fileType?: string;
};

type CaseRelationshipRow = {
  id: string;
  kind: 'case' | 'client' | 'policy' | 'agent' | 'application';
  label: string;
  relationship: string;
  status?: string;
  details?: string;
  href?: string;
};

const CASE_TAB_LABELS: Record<CaseTab, string> = {
  overview: 'General information',
  tasks: 'Tasks',
  requirements: 'Requirements',
  decision: 'Decision',
  communications: 'Communications',
  documents: 'Documents',
  requests: 'Requests',
  related_cases: 'Relationships',
  history: 'Activities',
  scoring: 'Scoring',
  licensing: 'Licensing',
  contracts: 'Contracts',
  activation: 'Activation',
};

function caseTabMilestoneIcon(Icon: LucideIcon) {
  return <Icon className="size-[17px] shrink-0" strokeWidth={2.25} aria-hidden />;
}

/** Icons for final-action milestone tabs (submission, decision, etc.). */
function resolveCaseWorkspaceTabIcon(
  tab: CaseTab,
  label: string,
  caseKind: CaseOverview['caseKind'] | undefined,
  anatomy: EffectiveCaseTypeAnatomy | undefined,
): ReactNode | undefined {
  if (tab !== 'decision') return undefined;

  const anatomyRow = anatomy?.tabs.find((row) => (row.caseTabId ?? row.id) === tab);
  const anatomyId = anatomyRow?.id;
  const normalizedLabel = label.trim().toLowerCase();

  if (anatomyId === 'submission' || normalizedLabel === 'submission') {
    return caseTabMilestoneIcon(Stamp);
  }

  if (caseKind === 'new_business') {
    return caseTabMilestoneIcon(Briefcase);
  }

  if (normalizedLabel === 'decision' || anatomyId === 'decision') {
    return caseTabMilestoneIcon(Scale);
  }

  return undefined;
}

/** Prefer merged case-type anatomy labels (e.g. Resolution for service) over static defaults. */
function resolveCaseWorkspaceTabLabel(tab: CaseTab, anatomy: EffectiveCaseTypeAnatomy | undefined): string {
  const rows = anatomy?.tabs ?? [];
  const byId = rows.find((row) => row.id === tab);
  if (byId?.label) return byId.label;
  const byRoute = rows.find((row) => row.caseTabId === tab);
  if (byRoute?.label) return byRoute.label;
  return CASE_TAB_LABELS[tab];
}

const CASE_TAB_ORDER: CaseTab[] = [
  'overview',
  'requirements',
  'tasks',
  'decision',
  'communications',
  'documents',
  'requests',
  'related_cases',
  'history',
];

/** Tabs restorable from `#tab=` hashes (includes anatomy-specific routes). */
const RESTORABLE_CASE_TABS: CaseTab[] = [...CASE_TAB_ORDER, 'scoring'];

type AIPanelTab = 'summary' | 'insights' | 'factors';

const ragDot: Record<string, string> = { Green: 'bg-[#008533]', Amber: 'bg-[#f5a200]', Red: 'bg-[#cd2c23]' };

const RAG_LOZENGE: Record<CaseRAGStatus, { label: string; type: 'Success' | 'Warning' | 'Alert' }> = {
  Green: { label: 'GREEN', type: 'Success' },
  Amber: { label: 'AMBER', type: 'Warning' },
  Red: { label: 'RED', type: 'Alert' },
};

function relatedCaseStatusLozengeType(status: string): 'Success' | 'Warning' | 'Alert' | 'Neutral' | 'Informative' {
  if (status === 'Declined' || status === 'Terminated: Declined') return 'Alert';
  if (status.startsWith('Terminated:') || status.startsWith('Closed:')) return 'Neutral';
  if (status === 'Approved') return 'Success';
  if (status.startsWith('Active')) return 'Informative';
  if (status === 'Pending Requirements' || status === 'Pending Decision' || status === 'In Progress')
    return 'Warning';
  return 'Informative';
}

function casePhaseLabel(phase: CasePhase): string {
  return phase === 'pre-approval' ? 'Pre-approval' : 'Post-approval';
}

function CaseInfoGrid({
  fields,
  columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  className = '',
}: {
  fields: Array<{ label: string; value: React.ReactNode; muted?: boolean }>;
  columns?: string;
  className?: string;
}) {
  return (
    <dl className={`grid gap-x-6 gap-y-5 ${columns} ${className}`}>
      {fields.map((field) => (
        <div key={field.label} className="flex min-w-0 flex-col gap-1">
          <dt className="text-[12px] font-normal leading-[16px] text-text-secondary">
            {field.label}
          </dt>
          <dd className={`min-w-0 text-[14px] leading-[20px] ${
            field.muted ? 'font-normal text-text-secondary' : 'font-semibold text-text-primary'
          }`}>
            {field.value || <span className="font-normal text-text-muted">-</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function richValueClass(valueColor?: 'danger' | 'warning' | null) {
  if (valueColor === 'danger') return 'text-brand-red';
  if (valueColor === 'warning') return 'text-[#a36d00]';
  return 'text-text-primary';
}

function GeneralInfoValue({ field }: { field: { value: string; valueType?: string | null; valueHighlight?: string | null; badge?: string | null; badgeType?: string | null } }) {
  const pillClass =
    field.valueType === 'pill_success' ? 'bg-[#e5f5ea] text-brand-green'
      : field.valueType === 'pill_warning' ? 'bg-[#fff4e6] text-[#8a5a00]'
        : field.valueType === 'pill_info' ? 'bg-surface-selected text-brand-blue'
          : field.valueType === 'pill_neutral' ? 'bg-surface-muted text-text-secondary'
            : '';
  const textClass = field.valueHighlight === 'danger' ? 'text-brand-red' : field.valueHighlight === 'warning' ? 'text-[#a36d00]' : 'text-text-primary';
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className={field.valueType ? `rounded-full px-2 py-0.5 text-[11px] font-semibold ${pillClass}` : `text-[12px] font-medium ${textClass}`}>
        {field.value}
      </span>
      {field.badge ? (
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${field.badgeType === 'warning' ? 'bg-[#fff4e6] text-[#8a5a00]' : 'bg-[#e5f5ea] text-brand-green'}`}>
          {field.badge}
        </span>
      ) : null}
    </span>
  );
}

function GeneralInformationCardView({ card }: { card: CaseGeneralInformationCard }) {
  const title = (
    <div className="px-4 pb-1 pt-3">
      <p className="text-[13px] font-semibold text-black">
      {card.title}
      </p>
    </div>
  );
  if (card.type === 'scoring_bar_chart') {
    return (
      <div className="overflow-hidden rounded-lg border border-border-soft bg-white lg:col-span-2">
        {title}
        <div className="space-y-3 p-3">
          <p className={`text-[12px] font-semibold ${card.summaryStatus === 'danger' ? 'text-brand-red' : card.summaryStatus === 'success' ? 'text-brand-green' : 'text-[#a36d00]'}`}>
            {card.summary}
          </p>
          <div className="grid gap-x-6 gap-y-2 md:grid-cols-2">
            {card.factors.map((factor) => (
              <div key={factor.name} className="rounded-lg border border-border-soft bg-[#fbfcfd] px-3 py-2">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <span className="min-w-0 text-[12px] font-medium leading-snug text-text-primary">{factor.name}</span>
                  <span className={`shrink-0 text-[12px] font-semibold ${factor.direction === 'credit' ? 'text-brand-green' : 'text-brand-red'}`}>{factor.points}</span>
                </div>
                <span className="block h-2 overflow-hidden rounded-full bg-surface-muted">
                  <span
                    className={`block h-full rounded-full ${factor.direction === 'credit' ? 'bg-brand-green' : 'bg-brand-red'}`}
                    style={{ width: `${Math.max(0, Math.min(100, factor.barPct))}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
          {card.note ? <p className="text-[11px] leading-relaxed text-text-muted">{card.note}</p> : null}
        </div>
      </div>
    );
  }
  if (card.type === 'status_tile_grid') {
    return (
      <div className="overflow-hidden rounded-lg border border-border-soft bg-white lg:col-span-2">
        {title}
        <div className="p-3">
          {card.note ? <p className="mb-3 text-[12px] text-text-secondary">{card.note}</p> : null}
          <div className="grid gap-2 sm:grid-cols-4">
            {card.tiles.map((tile) => (
              <div key={tile.label} className="rounded-md border border-border-soft bg-[#fbfcfd] p-3">
                <div className="text-[10px] uppercase tracking-[0.03em] text-text-muted">{tile.label}</div>
                <div className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${tile.status === 'complete' ? 'bg-[#e5f5ea] text-brand-green' : tile.status === 'flagged' ? 'bg-[#fde5e4] text-brand-red' : 'bg-[#fff4e6] text-[#8a5a00]'}`}>
                  {tile.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`overflow-hidden rounded-lg border border-border-soft bg-white ${card.layout === '4_col' ? 'lg:col-span-2' : ''}`}>
      {title}
      <div className={`grid gap-x-4 gap-y-3 p-3 ${card.layout === '4_col' ? 'sm:grid-cols-4' : 'sm:grid-cols-2'}`}>
        {card.fields.map((field) => (
          <div key={field.label} className="min-w-0">
            <dt className="text-[10px] text-text-muted">{field.label}</dt>
            <dd className="mt-1 min-w-0"><GeneralInfoValue field={field} /></dd>
          </div>
        ))}
      </div>
    </div>
  );
}

function GIScoringCard({
  onAdd,
  onFullView,
  onRowClick,
  scoring,
}: {
  onAdd: (type: ScoringItemType) => void;
  onFullView: () => void;
  onRowClick: (row: ScoringRow) => void;
  scoring: UnderwritingScoring;
}) {
  const normalized = normalizeScoring(scoring);
  const rows = toScoringRows(normalized);
  const net = deriveHumanNet(normalized);
  const summary = `${net >= 0 ? '+' : ''}${net} net — ${deriveRiskClass(net)}`;
  return (
    <div className="overflow-hidden rounded-lg border border-border-soft bg-white lg:col-span-2">
      <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-3">
        <p className="text-[13px] font-semibold text-black">AI debit/credit scoring summary</p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => onAdd('debit')} className="rounded-full border border-border-soft px-2 py-1 text-[11px] font-semibold text-text-secondary hover:border-brand-blue hover:text-brand-blue">+ Add</button>
          <button type="button" onClick={onFullView} className="rounded-full border border-border-soft px-2 py-1 text-[11px] font-semibold text-text-secondary hover:border-brand-blue hover:text-brand-blue">Full view →</button>
        </div>
      </div>
      <div className="space-y-3 p-3">
        <p className="text-[12px] font-semibold text-[#a36d00]">{summary}</p>
        <div className="grid gap-x-6 gap-y-2 md:grid-cols-2">
          {rows.map((row) => (
            <button key={`${row.type}-${row.id}`} type="button" onClick={() => onRowClick(row)} className={`rounded-lg border px-3 py-2 text-left transition-colors hover:border-brand-blue/40 ${row.pending ? 'border-dashed bg-[#fbfcfd]' : 'border-border-soft bg-white'}`}>
              <div className="mb-2 flex items-start justify-between gap-3">
                <span className="min-w-0 text-[12px] font-medium leading-snug text-text-primary">
                  {row.displayName}{row.pending ? ' △' : ''}{row.confidence === 'low' ? ' est.' : ''}
                </span>
                <span className={`shrink-0 text-[12px] font-semibold ${row.type === 'credit' ? 'text-brand-green' : 'text-brand-red'}`}>{row.points > 0 ? `+${row.points}` : row.points}</span>
              </div>
              <span className="block h-2 overflow-hidden rounded-full bg-surface-muted">
                <span className={`block h-full rounded-full ${row.type === 'credit' ? 'bg-brand-green' : 'bg-brand-red'}`} style={{ width: `${scoreBarPct(row, rows)}%` }} />
              </span>
            </button>
          ))}
        </div>
        {normalized.pending?.length ? <p className="text-[11px] leading-relaxed text-text-muted">Pending: {normalized.pending.join(', ')}. Final rating subject to change.</p> : null}
      </div>
    </div>
  );
}

function GeneralInformationRichView({
  cards,
  collapsibles,
  onScoreAdd,
  onScoreFullView,
  onScoreRowClick,
  scoring,
}: {
  cards: CaseGeneralInformationCard[];
  collapsibles: CaseGeneralInformationCollapsible[];
  onScoreAdd?: (type: ScoringItemType) => void;
  onScoreFullView?: () => void;
  onScoreRowClick?: (row: ScoringRow) => void;
  scoring?: UnderwritingScoring;
}) {
  const renderedScoring = { current: false };
  return (
    <>
      <div className="grid gap-3 lg:grid-cols-2">
        {cards.map((card) => {
          if (card.type === 'scoring_bar_chart' && scoring && onScoreAdd && onScoreFullView && onScoreRowClick) {
            renderedScoring.current = true;
            return <GIScoringCard key={card.id} scoring={scoring} onAdd={onScoreAdd} onFullView={onScoreFullView} onRowClick={onScoreRowClick} />;
          }
          return <GeneralInformationCardView key={card.id} card={card} />;
        })}
        {scoring && !renderedScoring.current && onScoreAdd && onScoreFullView && onScoreRowClick ? (
          <GIScoringCard scoring={scoring} onAdd={onScoreAdd} onFullView={onScoreFullView} onRowClick={onScoreRowClick} />
        ) : null}
      </div>
      {collapsibles.length ? (
        <div className="mt-3 grid gap-3">
          {collapsibles.map((item) => (
            <div key={item.id} className="rounded-lg border border-border-soft bg-white px-4 py-3">
              <p className="text-[13px] font-semibold text-black">{item.title}</p>
              {item.subtitle ? <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">{item.subtitle}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}

function WorkflowMetaSubway({ stages }: { stages: CaseWorkflowSubwayStage[] }) {
  const ordered = [...stages].sort((a, b) => a.order - b.order);
  return (
    <div className="w-full overflow-visible rounded-b-lg bg-[rgba(250,250,250,0.8)]">
      <div className="no-scrollbar min-w-0 touch-pan-x overflow-x-auto overflow-y-visible overscroll-x-contain px-5 py-3">
        <div className="inline-flex min-w-full justify-center">
          <div className="flex w-max shrink-0 items-center py-0.5">
        {ordered.map((stage, index) => {
          const done = stage.state === 'done';
          const active = stage.state === 'active';
          const next = ordered[index + 1];
          const connectorDone = done && next && (next.state === 'done' || next.state === 'active');
          return (
            <div key={stage.slug} className="flex shrink-0 cursor-default items-center">
              {index > 0 ? (
                <span className={`mx-1 h-[2px] w-4 shrink-0 transition-colors duration-300 sm:mx-2 sm:w-8 md:mx-3 md:w-10 ${connectorDone ? 'bg-[#008533]' : 'bg-[#dbdee1]'}`} />
              ) : null}
              <div className="flex min-w-0 max-w-[min(100%,11rem)] items-start gap-1.5 sm:max-w-none sm:items-center sm:gap-2">
                <span className={`relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 sm:mt-0 ${
                  done ? 'bg-[#008533] text-white' : active ? 'bg-brand-blue text-white' : 'border border-[#b7bbc2] bg-white text-text-muted'
                }`}>
                  {active ? <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-blue opacity-60 animate-ping" /> : null}
                  {done ? '✓' : stage.order}
                  {index > 0 && index < ordered.length - 1 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white bg-brand-accent shadow-sm">
                      <AiCueSparkle size={7} className="!text-white" aria-hidden />
                    </span>
                  ) : null}
                </span>
                <span className={`min-w-0 flex-1 text-sm leading-snug transition-colors duration-300 ${active ? 'font-semibold text-text-heading' : done ? 'font-semibold text-brand-green' : 'text-text-muted'}`}>
                  <span className="block max-sm:truncate" title={stage.name}>{stage.name}</span>
                  {active && stage.subLabel ? (
                    <span className="mt-1 inline-flex rounded-full bg-surface-selected px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-blue sm:ml-1.5 sm:mt-0">
                      {stage.subLabel}
                    </span>
                  ) : stage.subLabel ? (
                    <span className="mt-0.5 block text-[10px] font-normal text-text-muted">{stage.subLabel}</span>
                  ) : null}
                </span>
              </div>
            </div>
          );
        })}
          </div>
        </div>
      </div>
    </div>
  );
}

function createEmptyScoring(caseId: string): NonNullable<CaseOverview['underwritingScoring']> {
  return {
    baseScore: 0,
    debitTotal: 0,
    creditTotal: 0,
    netScore: 0,
    mappedDecision: 'Standard',
    riskClass: 'Standard NT',
    debits: [],
    credits: [],
    flatExtras: [],
    exclusions: [],
    evidence: [
      { id: `${caseId}-evidence`, label: 'Evidence review', status: 'amber', issueCount: 0 },
    ],
    aiComparison: {
      netScore: 0,
      riskClass: 'Standard NT',
      narrative: 'No AI scoring baseline available yet.',
    },
    underwriterNotes: '',
  };
}

function getScoringStatusClass(status: string) {
  if (status === 'green') return 'bg-[#e7f4ec] text-[#008533]';
  if (status === 'red') return 'bg-[#fde5e4] text-[#cd2c23]';
  return 'bg-[#fff4e6] text-[#a36d00]';
}

function UnderwritingScoringTab({
  caseId,
  onOpenScoreModal,
  scoring,
  onChange,
}: {
  caseId: string;
  onOpenScoreModal: (type: ScoringItemType, item?: UnderwritingScoringItem) => void;
  scoring: CaseOverview['underwritingScoring'];
  onChange: (next: NonNullable<CaseOverview['underwritingScoring']>) => void;
}) {
  const value = scoring ?? createEmptyScoring(caseId);
  const normalized = normalizeScoring(value);
  const [scoreListTab, setScoreListTab] = useState<'debits' | 'credits'>('debits');
  const debitTotal = normalized.debitTotal;
  const creditTotal = normalized.creditTotal;
  const netScore = deriveHumanNet(normalized);
  const mappedDecision = deriveRiskClass(netScore);
  const update = (patch: Partial<NonNullable<CaseOverview['underwritingScoring']>>) => {
    onChange(normalizeScoring({
      ...normalized,
      ...patch,
    } as UnderwritingScoring));
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-surface-primary p-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="overflow-hidden rounded-xl border border-border-soft bg-white">
          <div className="flex items-center justify-between border-b border-border-soft bg-white px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold text-text-primary">Scoring items</p>
              <p className="mt-0.5 text-[11px] text-text-muted">Review and edit debit/credit factors.</p>
            </div>
            <div className="flex overflow-hidden rounded-full border border-border-default bg-white p-0.5">
              <button type="button" onClick={() => setScoreListTab('debits')} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${scoreListTab === 'debits' ? 'bg-brand-blue text-white' : 'text-text-secondary hover:bg-surface-muted'}`}>Debits {normalized.debits.length}</button>
              <button type="button" onClick={() => setScoreListTab('credits')} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${scoreListTab === 'credits' ? 'bg-brand-blue text-white' : 'text-text-secondary hover:bg-surface-muted'}`}>Credits {normalized.credits.length}</button>
            </div>
          </div>
          <ScoringItemSection
            title={scoreListTab === 'debits' ? 'Impairments (Debits)' : 'Credits'}
            actionLabel={scoreListTab === 'debits' ? 'Add debit' : 'Add credit'}
            items={scoreListTab === 'debits' ? normalized.debits : normalized.credits}
            onAdd={() => onOpenScoreModal(scoreListTab === 'debits' ? 'debit' : 'credit')}
            onEdit={(item) => onOpenScoreModal(scoreListTab === 'debits' ? 'debit' : 'credit', item)}
            embedded
          />
        </section>

        <aside className="space-y-3">
          <div className={`rounded-xl border p-4 ${netScore >= 300 ? 'border-[#cd2c23] bg-[#fffafa]' : 'border-border-soft bg-white'}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Running score summary</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
              <DataScoreMetric label="Debits" value={`+${debitTotal}`} tone="danger" />
              <DataScoreMetric label="Credits" value={String(creditTotal)} tone="success" />
              <DataScoreMetric label="Net score" value={`+${netScore}`} tone={netScore >= 300 ? 'danger' : 'neutral'} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="rounded-full bg-surface-primary px-2.5 py-1 text-[11px] font-semibold text-text-secondary">Mapped: {mappedDecision}</span>
              <span className="text-[13px] font-semibold text-text-primary">{normalized.humanClass ?? normalized.riskClass}</span>
            </div>
          </div>
          <div className="rounded-xl border border-border-soft bg-white p-4">
            <p className="text-[12px] font-semibold text-text-primary">AI vs. your scoring</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-lg border border-brand-accent/20 bg-brand-accent-light p-3">
                <p className="text-[11px] font-semibold text-brand-accent">AI</p>
                <p className="mt-1 text-[14px] font-semibold text-text-primary">Net: {normalized.aiNet ?? normalized.aiComparison?.netScore ?? 'N/A'}</p>
                <p className="text-[11px] text-text-muted">{normalized.aiClass ?? normalized.aiComparison?.riskClass ?? 'N/A'}</p>
              </div>
              <div className="rounded-lg border border-border-soft bg-surface-primary p-3">
                <p className="text-[11px] font-semibold text-text-secondary">You</p>
                <p className={`mt-1 text-[14px] font-semibold ${netScore >= 300 ? 'text-[#cd2c23]' : 'text-text-primary'}`}>Net: +{netScore}</p>
                <p className="text-[11px] text-text-muted">{normalized.humanClass ?? normalized.riskClass}</p>
              </div>
            </div>
          </div>
          <section className="rounded-xl border border-border-soft bg-white p-4">
            <div className="flex items-center gap-2">
              <AiCueSparkle size={16} className="!text-brand-blue" />
              <div>
                <p className="text-[13px] font-semibold text-text-primary">Evidence reference</p>
                <p className="text-[11px] text-text-muted">Pending items that may change the score.</p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {(normalized.pending ?? []).map((item) => (
                <div key={item} className="flex items-center justify-between rounded-lg border border-border-soft bg-white px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-text-primary">{item}</p>
                    <p className="text-[10px] text-text-muted">Pending evidence</p>
                  </div>
                  <span className="rounded-full bg-[#fff4e6] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#8a5a00]">
                    pending
                  </span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function DataScoreMetric({ label, value, tone }: { label: string; value: string; tone: 'danger' | 'success' | 'neutral' }) {
  return (
    <div>
      <p className="text-[10px] text-text-muted">{label}</p>
      <p className={`mt-0.5 text-[14px] font-semibold ${tone === 'danger' ? 'text-[#cd2c23]' : tone === 'success' ? 'text-[#008533]' : 'text-text-primary'}`}>{value}</p>
    </div>
  );
}

function ScoringItemSection({
  title,
  actionLabel,
  embedded = false,
  items,
  onAdd,
  onEdit,
}: {
  title: string;
  actionLabel: string;
  embedded?: boolean;
  items: NonNullable<CaseOverview['underwritingScoring']>['debits'];
  onAdd: () => void;
  onEdit: (item: UnderwritingScoringItem) => void;
}) {
  return (
    <section className={embedded ? '' : 'overflow-hidden rounded-xl border border-border-soft bg-white'}>
      <div className={`flex items-center justify-between border-b border-border-soft px-4 py-3 ${embedded ? 'bg-white' : 'bg-surface-primary'}`}>
        <p className="text-[13px] font-semibold text-text-primary">{title}</p>
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold text-brand-blue hover:bg-white">
          <Plus className="size-3.5" />
          {actionLabel}
        </button>
      </div>
      <div className="space-y-2 p-3">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border-soft px-4 py-8 text-center text-[12px] text-text-muted">No records yet.</div>
        ) : items.map((item) => (
          <button key={item.id} type="button" onClick={() => onEdit(item)} className={`w-full rounded-lg border p-3 text-left transition-colors hover:border-brand-blue/40 ${item.pending ? 'border-dashed bg-[#fbfcfd]' : 'border-border-soft bg-white'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">{item.category}</p>
                <p className="mt-1 text-[13px] font-semibold text-text-primary">{item.condition ?? item.factor ?? item.label}</p>
                {item.notes ? <p className="mt-1 line-clamp-2 text-[11px] italic leading-relaxed text-text-secondary">{item.notes}</p> : null}
              </div>
              <span className={`shrink-0 text-[13px] font-semibold ${item.points > 0 ? 'text-brand-red' : 'text-brand-green'}`}>{item.points > 0 ? `+${item.points}` : item.points}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.pending ? <span className="rounded-full bg-[#fff4e6] px-2 py-0.5 text-[10px] font-semibold text-[#8a5a00]">pending</span> : null}
              {item.aiGenerated ? <span className="rounded-full bg-brand-accent-light px-2 py-0.5 text-[10px] font-semibold text-brand-accent">AI</span> : null}
              {item.confidence ? <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-text-secondary">{item.confidence}</span> : null}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function ScoreItemModal({
  initialItem,
  onClose,
  onDelete,
  onSave,
  type,
}: {
  initialItem?: UnderwritingScoringItem;
  onClose: () => void;
  onDelete?: () => void;
  onSave: (item: UnderwritingScoringItem) => void;
  type: ScoringItemType;
}) {
  const [category, setCategory] = useState(initialItem?.category ?? (type === 'debit' ? 'Medical' : 'Lifestyle'));
  const [name, setName] = useState(initialItem?.condition ?? initialItem?.factor ?? initialItem?.label ?? '');
  const [points, setPoints] = useState(String(initialItem?.points ?? (type === 'debit' ? 25 : -10)));
  const [icd, setIcd] = useState(initialItem?.icd ?? initialItem?.code ?? '');
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low'>(initialItem?.confidence ?? 'medium');
  const [pending, setPending] = useState(Boolean(initialItem?.pending));
  const [notes, setNotes] = useState(initialItem?.notes ?? '');
  const canSave = name.trim().length > 0;
  return createPortal(
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 px-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="w-[520px] max-w-[94vw] overflow-hidden rounded-xl border border-border-default bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
        <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
          <div>
            <h2 className="text-[17px] font-semibold text-text-primary">{initialItem ? 'Edit' : 'Add'} {type === 'debit' ? 'debit' : 'credit'}</h2>
            <p className="mt-1 text-[12px] text-text-secondary">Update the underwriting scoring item.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-text-secondary hover:bg-surface-muted"><X className="size-5" /></button>
        </div>
        <div className="grid gap-3 p-5 md:grid-cols-2">
          <label className="text-[11px] font-semibold text-text-muted">Category<input value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-border-soft px-3 text-[12px] text-text-primary outline-none focus:border-brand-blue" /></label>
          <label className="text-[11px] font-semibold text-text-muted">Points<input type="number" value={points} onChange={(event) => setPoints(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-border-soft px-3 text-[12px] text-text-primary outline-none focus:border-brand-blue" /></label>
          <label className="md:col-span-2 text-[11px] font-semibold text-text-muted">{type === 'debit' ? 'Condition' : 'Factor'}<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-border-soft px-3 text-[12px] text-text-primary outline-none focus:border-brand-blue" /></label>
          <label className="text-[11px] font-semibold text-text-muted">ICD / code<input value={icd} onChange={(event) => setIcd(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-border-soft px-3 text-[12px] text-text-primary outline-none focus:border-brand-blue" /></label>
          <label className="text-[11px] font-semibold text-text-muted">Confidence<select value={confidence} onChange={(event) => setConfidence(event.target.value as typeof confidence)} className="mt-1 h-9 w-full rounded-md border border-border-soft px-3 text-[12px] text-text-primary outline-none focus:border-brand-blue"><option value="high">high</option><option value="medium">medium</option><option value="low">low</option></select></label>
          <label className="md:col-span-2 flex items-center gap-2 text-[12px] font-semibold text-text-secondary"><input type="checkbox" checked={pending} onChange={(event) => setPending(event.target.checked)} /> Pending evidence</label>
          <label className="md:col-span-2 text-[11px] font-semibold text-text-muted">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mt-1 w-full rounded-md border border-border-soft px-3 py-2 text-[12px] text-text-primary outline-none focus:border-brand-blue" /></label>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border-default px-5 py-4">
          <div>{initialItem && onDelete ? <button type="button" onClick={onDelete} className="rounded-full border border-brand-red px-4 py-2 text-[12px] font-semibold text-brand-red hover:bg-[#fde5e4]">Delete</button> : null}</div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-full border border-border-default px-4 py-2 text-[12px] font-semibold text-text-secondary hover:bg-surface-muted">Cancel</button>
            <button
              type="button"
              disabled={!canSave}
              onClick={() => {
                const numeric = Number(points) || 0;
                const signedPoints = type === 'debit' ? Math.abs(numeric) : -Math.abs(numeric);
                onSave({
                  ...(initialItem ?? {}),
                  id: initialItem?.id ?? `${type}-${Date.now()}`,
                  label: name.trim(),
                  direction: type,
                  category,
                  points: signedPoints,
                  condition: type === 'debit' ? name.trim() : undefined,
                  factor: type === 'credit' ? name.trim() : undefined,
                  icd,
                  code: icd,
                  confidence,
                  pending,
                  aiGenerated: initialItem?.aiGenerated ?? false,
                  notes,
                });
              }}
              className="rounded-full bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const AI_PANEL_MIN_WIDTH = 420;
/** Left chrome (nav + minimum case strip); used with 0.7 factor for max drawable width. */
const AI_PANEL_VIEWPORT_RESERVE = 160;

function maxAiPanelWidth(innerWidth: number): number {
  return Math.max(
    AI_PANEL_MIN_WIDTH,
    Math.floor((innerWidth - AI_PANEL_VIEWPORT_RESERVE) * 0.7),
  );
}

function clampAiPanelWidth(innerWidth: number, width: number): number {
  return Math.max(AI_PANEL_MIN_WIDTH, Math.min(width, maxAiPanelWidth(innerWidth)));
}

/** Default open width: 60% of viewport, clamped to min/max. */
function defaultAiPanelWidth(innerWidth: number): number {
  return clampAiPanelWidth(innerWidth, Math.round(innerWidth * 0.6));
}

const REQ_CATEGORIES = ['Medical', 'Rehabilitation', 'Employment', 'Documentation', 'Pharmacy'];

function RequirementModal({ onClose, onSave, initial }: {
  onClose: () => void;
  onSave: (req: { name: string; category: string; dueDate: string; followUpDate: string; notes: string }) => void;
  initial?: { name: string; category: string; dueDate: string; followUpDate: string; notes?: string };
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [followUpDate, setFollowUpDate] = useState(initial?.followUpDate ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const canSubmit = name.trim().length > 0 && category !== '';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40">
      <div className="relative flex w-[520px] flex-col rounded-xl border border-border-default bg-white shadow-[0_24px_48px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between border-b border-[#e8eaed] px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">{isEdit ? 'Edit Requirement' : 'Add Requirement'}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-text-secondary hover:bg-surface-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-primary">Name <span className="text-brand-red">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Monthly Physician Follow-Up" className="h-10 w-full rounded-md border border-[#b7bbc2] bg-white px-3 text-sm text-text-primary outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-primary">Category <span className="text-brand-red">*</span></label>
            <div className="relative">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 w-full appearance-none rounded-md border border-[#b7bbc2] bg-white px-3 pr-8 text-sm text-text-primary outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue">
                <option value="">Select category...</option>
                {REQ_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-primary">Due Date</label>
              <input type="text" value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="e.g. Apr 30, 2026" className="h-10 w-full rounded-md border border-[#b7bbc2] bg-white px-3 text-sm text-text-primary outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-primary">Follow-Up Date</label>
              <input type="text" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} placeholder="e.g. May 5, 2026" className="h-10 w-full rounded-md border border-[#b7bbc2] bg-white px-3 text-sm text-text-primary outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-primary">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add details, context, or instructions..." rows={3} className="w-full rounded-md border border-[#b7bbc2] bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[#e8eaed] px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-full border border-border-default px-5 py-2.5 text-xs font-bold uppercase tracking-[0.4px] text-text-secondary transition-colors hover:bg-surface-muted">Cancel</button>
          <button type="button" disabled={!canSubmit} onClick={() => onSave({ name: name.trim(), category, dueDate: dueDate || 'TBD', followUpDate: followUpDate || 'TBD', notes: notes.trim() })} className="rounded-full bg-brand-blue px-6 py-2.5 text-xs font-bold uppercase tracking-[0.4px] text-white transition-colors enabled:hover:bg-brand-blue-hover disabled:cursor-not-allowed disabled:opacity-45">{isEdit ? 'Save Changes' : 'Add Requirement'}</button>
        </div>
      </div>
    </div>
  );
}

export function CaseView({
  dataOverride,
  singlePhase,
  breadcrumb,
}: {
  dataOverride?: CaseOverview;
  singlePhase?: CasePhase;
  breadcrumb?: React.ReactNode;
} = {}) {
  const { caseId = 'IP26-5546112' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addOpenCase } = useCasesNav();
  const [activeTab, setActiveTab] = useState<CaseTab>('overview');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPanelExiting, setAiPanelExiting] = useState(false);
  const [tabViews, setTabViews] = useState<Record<Exclude<CaseTab, 'overview' | 'decision'>, 'table' | 'list'>>({
    tasks: 'table',
    requirements: 'table',
    communications: 'table',
    documents: 'table',
    requests: 'table',
    related_cases: 'table',
    history: 'table',
  scoring: 'table',
  licensing: 'table',
  contracts: 'table',
  activation: 'table',
  });
  const [stageFilters, setStageFilters] = useState<Record<string, string>>({});
  const [tabSearchQueries, setTabSearchQueries] = useState<Partial<Record<'tasks' | 'documents' | 'requirements', string>>>({});
  const [selectedRequirementIds, setSelectedRequirementIds] = useState<Array<number | string>>([]);
  const [reqPhaseTab, setReqPhaseTab] = useState<'pre-approval' | 'post-approval'>('pre-approval');
  const [showAddReqModal, setShowAddReqModal] = useState(false);
  const [editingReq, setEditingReq] = useState<CaseRequirement | null>(null);
  const [reqKebabOpen, setReqKebabOpen] = useState<number | null>(null);
  const [panelWidth, setPanelWidth] = useState(() =>
    typeof window !== 'undefined' ? defaultAiPanelWidth(window.innerWidth) : AI_PANEL_MIN_WIDTH,
  );
  const [isResizing, setIsResizing] = useState(false);
  const [aiPanelTab, setAiPanelTab] = useState<AIPanelTab>('insights');
  const [aiCopilotMessages, setAiCopilotMessages] = useState<ChatTurn[]>([]);
  const [copilotSurfaceOpen, setCopilotSurfaceOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'neutral' } | null>(null);
  const [phaseTransition, setPhaseTransition] = useState<'idle' | 'completing' | 'scrolling'>('idle');
  const [selectionMenu, setSelectionMenu] = useState<{ visible: boolean; x: number; y: number; text: string }>({
    visible: false,
    x: 0,
    y: 0,
    text: '',
  });
  const [expandedSections, setExpandedSections] = useState({
    claimantPlan: true,
    insured: false,
    beneficiary: false,
    benefits: false,
  });
  const [documentsTableScrollEl, setDocumentsTableScrollEl] = useState<HTMLDivElement | null>(null);
  const { showLeftStickyEdge, showRightStickyEdge, hasHorizontalOverflow } =
    useTableHorizontalScroll(documentsTableScrollEl);
  const [selectedCaseTask, setSelectedCaseTask] = useState<Task | null>(null);
  const [taskDetailPanelWidth, setTaskDetailPanelWidth] = useState(() => getDefaultSidePanelWidth({ min: 420 }));
  const [taskDetailPanelResizing, setTaskDetailPanelResizing] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<CaseRequirement | null>(null);
  const [selectedCaseDocument, setSelectedCaseDocument] = useState<CaseDocumentContextRow | null>(null);
  const [reqDetailPanelWidth, setReqDetailPanelWidth] = useState(() => getDefaultSidePanelWidth({ min: 420 }));
  const [reqDetailPanelResizing, setReqDetailPanelResizing] = useState(false);
  const [docDetailPanelWidth, setDocDetailPanelWidth] = useState(() => getDefaultSidePanelWidth({ min: 480 }));
  const [docDetailPanelResizing, setDocDetailPanelResizing] = useState(false);
  const [casePanelContexts, setCasePanelContexts] = useState<WorkspacePanelContext[]>([]);
  const [activeCasePanelContextId, setActiveCasePanelContextId] = useState('');
  const openCasePanelContext = useCallback((context: WorkspacePanelContext) => {
    setCasePanelContexts((current) => pushWorkspacePanelContext(current, context));
    setActiveCasePanelContextId(context.id);
  }, []);
  const closeCaseSidePanel = useCallback(() => {
    setCasePanelContexts([]);
    setActiveCasePanelContextId('');
    setSelectedCaseTask(null);
    setSelectedRequirement(null);
    setSelectedCaseDocument(null);
  }, []);
  const openCaseTaskPanel = useCallback((task: Task | null) => {
    if (!task) {
      closeCaseSidePanel();
      return;
    }
    setSelectedCaseTask(task);
    openCasePanelContext({
      id: taskPanelContextId(task.id),
      label: task.taskId ?? task.id,
      icon: ClipboardList,
      clearable: true,
    });
  }, [closeCaseSidePanel, openCasePanelContext]);
  const openRequirementPanel = useCallback((requirement: CaseRequirement | null) => {
    if (!requirement) {
      setSelectedRequirement(null);
      return;
    }
    setSelectedRequirement(requirement);
    openCasePanelContext({
      id: requirementPanelContextId(String(requirement.datasetRequirementId ?? requirement.id)),
      label: `R-${requirement.datasetRequirementId ?? requirement.id}`,
      icon: ClipboardCheck,
      clearable: true,
    });
  }, [openCasePanelContext]);
  const openCaseDocumentPanel = useCallback((document: CaseDocumentContextRow | null) => {
    if (!document) {
      setSelectedCaseDocument(null);
      return;
    }
    setSelectedCaseDocument(document);
    openCasePanelContext({
      id: documentPanelContextId(document.id ?? document.name),
      label: document.name,
      icon: FileText,
      clearable: true,
    });
  }, [openCasePanelContext]);
  const [aiActivitySeq, setAiActivitySeq] = useState<AiActivitySequence | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const bumpData = useCallback(() => setDataVersion((v) => v + 1), []);
  const [decisionModalSignal, setDecisionModalSignal] = useState(0);
  const [newCaseTaskReady, setNewCaseTaskReady] = useState(false);
  const [newTaskBadge, setNewTaskBadge] = useState(false);
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);
  const [benefitIncrease, setBenefitIncrease] = useState(false);
  const [benefitSeen, setBenefitSeen] = useState(false);
  const [benefitPopupForced, setBenefitPopupForced] = useState(false);
  const [overdueTaskReady, setOverdueTaskReady] = useState(false);
  const [overdueTaskCompleted, setOverdueTaskCompleted] = useState(false);
  const [reqCascadeStarted, setReqCascadeStarted] = useState(false);
  const [aiActivityEnabled, setAiActivityEnabled] = useState(() => {
    try { return sessionStorage.getItem('amplify-ai-activity') !== '0'; } catch { return true; }
  });
  useEffect(() => {
    const sync = () => {
      try { setAiActivityEnabled(sessionStorage.getItem('amplify-ai-activity') !== '0'); } catch { /* */ }
    };
    window.addEventListener('amplify-ai-activity-toggle', sync);
    return () => window.removeEventListener('amplify-ai-activity-toggle', sync);
  }, []);

  const { settings: platformSettings, updateDataSource } = usePlatformSettings();
  const dataSource = useDataSourceSettings();
  const currency = useCurrencyFormatter();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const activeDataset = useMemo(
    () => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource),
    [dataSource],
  );
  const data = useMemo(
    () =>
      dataOverride ??
      getCaseOverview(caseId, activeDataset, dataSource.legacyMockOverlayEnabled, {
        anatomy: platformSettings.anatomy,
        enabledObjectDomains: dataSource.enabledObjectDomains,
      }),
    [
      caseId,
      dataOverride,
      activeDataset,
      dataSource.legacyMockOverlayEnabled,
      dataSource.enabledObjectDomains,
      platformSettings.anatomy,
    ],
  );
  const [scoringDraft, setScoringDraft] = useState(data.underwritingScoring);
  const [scoreModal, setScoreModal] = useState<{ type: ScoringItemType; item?: UnderwritingScoringItem } | null>(null);
  useEffect(() => {
    setScoringDraft(data.underwritingScoring);
  }, [data.id, data.underwritingScoring]);
  const updateScoring = useCallback((next: UnderwritingScoring) => {
    setScoringDraft(next);
    data.underwritingScoring = next;
    bumpData();
  }, [bumpData, data]);
  const openScoreModal = useCallback((type: ScoringItemType, item?: UnderwritingScoringItem) => {
    setScoreModal({ type, item });
  }, []);
  const saveScoreItem = useCallback((item: UnderwritingScoringItem) => {
    if (!scoringDraft || !scoreModal) return;
    updateScoring(upsertScoringItem(scoringDraft, scoreModal.type, item));
    setScoreModal(null);
  }, [scoreModal, scoringDraft, updateScoring]);
  const deleteScoreItem = useCallback(() => {
    if (!scoringDraft || !scoreModal?.item) return;
    updateScoring(deleteScoringItem(scoringDraft, scoreModal.type, scoreModal.item.id));
    setScoreModal(null);
  }, [scoreModal, scoringDraft, updateScoring]);
  const caseSummary = useMemo(
    () => listCaseSummaries(activeDataset).find((item) => item.id === caseId),
    [activeDataset, caseId],
  );

  /* Resolve case type from the id prefix and look it up in the registry. */
  const casesAiAssistantEnabled = platformSettings.preferences.casesAiAssistantEnabled !== false;
  const caseType = useMemo(
    () => getCaseType(parseCaseTypeCodeFromId(caseId), platformSettings.caseTypes),
    [caseId, platformSettings.caseTypes],
  );
  const caseTypeCopy = useMemo(() => resolveCopy(caseType), [caseType]);
  const caseAnatomy = useMemo(
    () => resolveEffectiveCaseTypeAnatomy(data.caseKind, platformSettings.anatomy, dataSource.enabledObjectDomains),
    [data.caseKind, platformSettings.anatomy, dataSource.enabledObjectDomains],
  );

  // Live context: case + active tab; refines further when a task or requirement is opened.
  const tabLabel = resolveCaseWorkspaceTabLabel(activeTab, caseAnatomy);
  const baseHref = `/cases/${caseId}${activeTab === 'overview' ? '' : `#tab=${activeTab}`}`;
  const caseTabOverlay = useMemo(
    () => ({
      id: `case:${caseId}:${activeTab}`,
      kind: activeTab === 'overview' ? ('caseDetail' as const) : ('caseTab' as const),
      icon: Briefcase,
      crumbs: activeTab === 'overview' ? ['Cases', caseId] : ['Cases', caseId, tabLabel],
      label: activeTab === 'overview' ? caseId : `${caseId} · ${tabLabel}`,
      href: baseHref,
    }),
    [caseId, activeTab, tabLabel, baseHref],
  );
  useLiveContextOverlay(caseTabOverlay);

  const taskOverlay = useMemo(
    () =>
      selectedCaseTask
        ? {
            id: `case:${caseId}:task:${selectedCaseTask.id}`,
            kind: 'caseTask' as const,
            icon: ClipboardList,
            crumbs: ['Cases', caseId, 'Tasks', selectedCaseTask.id],
            label: `${caseId} · Task ${selectedCaseTask.id}`,
            href: `/cases/${caseId}#tab=tasks&task=${selectedCaseTask.id}`,
          }
        : null,
    [caseId, selectedCaseTask],
  );
  useLiveContextOverlay(taskOverlay);

  const requirementOverlay = useMemo(
    () =>
      selectedRequirement
        ? {
            id: `requirement:${selectedRequirement.datasetRequirementId ?? selectedRequirement.id}`,
            kind: 'caseRequirement' as const,
            icon: ClipboardCheck,
            crumbs: ['Cases', caseId, 'Requirements', String(selectedRequirement.datasetRequirementId ?? selectedRequirement.id)],
            label: `${caseId} · ${selectedRequirement.name}`,
            href: `/cases/${caseId}#tab=requirements&req=${encodeURIComponent(String(selectedRequirement.datasetRequirementId ?? selectedRequirement.id))}`,
          }
        : null,
    [caseId, selectedRequirement],
  );
  useLiveContextOverlay(requirementOverlay);

  // Restore tab + selection from URL hash so the AI context history can navigate back here.
  useEffect(() => {
    const hash = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const tab = params.get('tab');
    if (tab === 'activation' && data.caseKind === 'new_business') {
      setActiveTab(data.underwritingScoring ? 'scoring' : 'requirements');
    } else if (tab && RESTORABLE_CASE_TABS.includes(tab as CaseTab)) {
      setActiveTab(tab as CaseTab);
    }
    const reqIdRaw = params.get('req');
    if (reqIdRaw) {
      const found = data.requirements.find((r) => String(r.id) === reqIdRaw || r.datasetRequirementId === reqIdRaw);
      if (found) openRequirementPanel(found);
    }
    // Task restoration is best-effort: if the contextual task list contains it.
    // (The case-task data source lives below; we leave the overlay's own setter to handle it.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.caseKind, data.underwritingScoring, location.hash, caseId]);

  useEffect(() => {
    if (data.caseKind === 'new_business' && activeTab === 'activation') {
      setActiveTab(data.underwritingScoring ? 'scoring' : 'requirements');
    }
  }, [activeTab, data.caseKind, data.underwritingScoring]);

  /**
   * Platform-guide preview hooks. The Platform Guide modal embeds CaseView in an
   * iframe; `?guide=...` lets the guide pre-select a particular case state for
   * a specific walkthrough step without mutating the canonical demo flow.
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const guide = params.get('guide');
    if (!guide) return;
    if (guide === 'confirm-plan' && data.phase === 'post-approval') {
      data.activeStage = 2;
      bumpData();
      const cycleMs = 7000;
      const advanceAt = 2500;
      let cancelled = false;
      const timers = new Set<ReturnType<typeof setTimeout>>();
      const schedule = (fn: () => void, ms: number) => {
        const t = setTimeout(() => { timers.delete(t); if (!cancelled) fn(); }, ms);
        timers.add(t);
      };
      const cycle = () => {
        data.activeStage = 2;
        bumpData();
        schedule(() => {
          data.activeStage = 3;
          bumpData();
        }, advanceAt);
        schedule(cycle, cycleMs);
      };
      cycle();
      return () => { cancelled = true; timers.forEach(clearTimeout); };
    } else if (guide === 'benefit-bump') {
      setBenefitIncrease(true);
      const cycleMs = 7000;
      const showAt = 2500;
      const hideAt = 5500;
      let cancelled = false;
      const timers = new Set<ReturnType<typeof setTimeout>>();
      const schedule = (fn: () => void, ms: number) => {
        const t = setTimeout(() => { timers.delete(t); if (!cancelled) fn(); }, ms);
        timers.add(t);
      };
      const cycle = () => {
        setBenefitPopupForced(false);
        setBenefitSeen(false);
        schedule(() => { setBenefitPopupForced(true); setBenefitSeen(true); }, showAt);
        schedule(() => setBenefitPopupForced(false), hideAt);
        schedule(cycle, cycleMs);
      };
      cycle();
      return () => { cancelled = true; timers.forEach(clearTimeout); };
    } else if (guide === 'task-pushed' && data.id === 'IP26-5546200') {
      // Requirements tab with Plan Verification pending (stage 2), 10 reqs visible.
      // After 2s the Tasks badge pulses from 2 → 3 in red. Stays on requirements.
      if (data.requirements.length === 0) {
        data.requirements = [
          { id: 1, name: 'Restoration Plan Interview', category: 'Documentation', rag: 'Amber' as const, status: 'Pending' as const, dueDate: 'Apr 1, 2026', followUpDate: 'Apr 3, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' as const, notes: 'Initial meeting with claimant to review and agree on the restoration plan.' },
          { id: 2, name: 'Monthly Physician Follow-Up', category: 'Medical', rag: 'Amber' as const, status: 'Pending' as const, dueDate: 'Apr 15, 2026', followUpDate: 'Apr 20, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' as const },
          { id: 3, name: 'Weekly PT Sessions', category: 'Rehabilitation', rag: 'Amber' as const, status: 'Pending' as const, dueDate: 'Apr 10, 2026', followUpDate: 'Apr 14, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' as const },
          { id: 4, name: 'At-Home Exercise Compliance', category: 'Rehabilitation', rag: 'Green' as const, status: 'Pending' as const, dueDate: 'Apr 20, 2026', followUpDate: 'Apr 25, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' as const },
          { id: 5, name: 'Orthopaedic Specialist Review', category: 'Medical', rag: 'Amber' as const, status: 'Pending' as const, dueDate: 'Apr 22, 2026', followUpDate: 'Apr 28, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' as const },
          { id: 6, name: 'Medication Compliance Check', category: 'Pharmacy', rag: 'Green' as const, status: 'Pending' as const, dueDate: 'Apr 18, 2026', followUpDate: 'Apr 22, 2026', source: 'pharmacy_check', trigger: 'AI Monitoring', phase: 'post-approval' as const },
          { id: 7, name: 'Functional Capacity Re-assessment', category: 'Medical', rag: 'Amber' as const, status: 'Pending' as const, dueDate: 'May 5, 2026', followUpDate: 'May 10, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' as const },
          { id: 8, name: 'Pain Management Progress Report', category: 'Medical', rag: 'Amber' as const, status: 'Pending' as const, dueDate: 'Apr 30, 2026', followUpDate: 'May 5, 2026', source: 'ai_rule_engine', trigger: 'AI Monitoring', phase: 'post-approval' as const },
          { id: 9, name: 'Employer RTW Accommodation Plan', category: 'Employment', rag: 'Green' as const, status: 'Pending' as const, dueDate: 'May 15, 2026', followUpDate: 'May 20, 2026', source: 'employer_portal', trigger: 'AI Restoration Plan', phase: 'post-approval' as const },
          { id: 10, name: 'Final Review Interview', category: 'Documentation', rag: 'Green' as const, status: 'Pending' as const, dueDate: 'Jun 15, 2026', followUpDate: 'Jun 20, 2026', source: 'ai_rule_engine', trigger: 'AI Case Completion', phase: 'post-approval' as const },
        ];
      }
      data.activeStage = 2;
      setReqPhaseTab('post-approval');
      openCaseTaskPanel(null);
      bumpData();
      // 8s cycle: overview → cursor clicks Requirements at 2s → badge 2→3 at 5s
      const cycleMs = 8000;
      const reqAt = 2000;
      const badgeAt = 5000;
      let cancelled = false;
      const timers = new Set<ReturnType<typeof setTimeout>>();
      const schedule = (fn: () => void, ms: number) => {
        const t = setTimeout(() => { timers.delete(t); if (!cancelled) fn(); }, ms);
        timers.add(t);
      };
      const cycle = () => {
        setActiveTab('overview');
        setNewCaseTaskReady(false);
        setNewTaskBadge(false);
        schedule(() => setActiveTab('requirements'), reqAt);
        schedule(() => {
          setNewCaseTaskReady(true);
          setNewTaskBadge(true);
        }, badgeAt);
        schedule(cycle, cycleMs);
      };
      cycle();
      return () => { cancelled = true; timers.forEach(clearTimeout); };
    } else if (guide === 'accept-meeting' && data.id === 'IP26-5546200') {
      // 3-click loop synced with the cursor overlay in PlatformGuideModal:
      //   1) Click Tasks tab  → tasks content appears        (~1.5s)
      //   2) Click first row  → side panel slides in          (~3.5s)
      //   3) Click ACCEPT MEETING in the side panel           (~6.5s)
      //   Reset at 9s. Only newCaseTaskReady (no overdueTaskReady) so the
      //   appointment task is the first row, matching the cursor target.
      setNewCaseTaskReady(true);
      setActiveTab('overview');
      const apptRow = {
        id: 'TSK-BB-APPT-01',
        taskType: 'Review proposed appointment — validate meeting time with Billy Bud',
        priority: 'High' as const,
        status: 'To Do',
        dueDate: 'Apr 1, 2026',
        assignee: 'Victor Ramon',
      };
      const apptTask = resolveTaskForCaseContextRow(apptRow, data);
      const cycleMs = 9000;
      const showTasksAt = 1500;
      const openPanelAt = 3500;
      let cancelled = false;
      const timers = new Set<ReturnType<typeof setTimeout>>();
      const schedule = (fn: () => void, ms: number) => {
        const t = setTimeout(() => { timers.delete(t); if (!cancelled) fn(); }, ms);
        timers.add(t);
      };
      const cycle = () => {
        setActiveTab('overview');
        openCaseTaskPanel(null);
        schedule(() => setActiveTab('tasks'), showTasksAt);
        schedule(() => openCaseTaskPanel(apptTask), openPanelAt);
        schedule(cycle, cycleMs);
      };
      cycle();
      return () => { cancelled = true; timers.forEach(clearTimeout); };
    } else if (guide === 'approve-flow' && data.id === 'IP26-5546112') {
      // Self-running approval cycle synced to the cursor animation in the guide.
      // Starts on Overview so the Requirements content only appears on "click".
      // Cursor clicks Requirements at ~1s, Decision at ~3.4s, Record Decision at ~5.5s.
      // Approval fires 0.8s after the 3rd click so the completed state appears AFTER the pulse.
      const cycleMs = 9000;
      const requirementsAt = 1000;
      const decisionAt = 3400;
      const approveAt = 6300;
      const initialDecisionTabState = data.decisionTabState;
      const approvedDecision: HumanDecision = {
        decisionType: 'approve',
        reasonCodes: ['ai_recommended'],
        notes: 'AI recommendation accepted. All 7 requirements fulfilled.',
        recordedBy: 'Victor Ramon',
        recordedAt: new Date().toISOString(),
      };
      let cancelled = false;
      const timers = new Set<ReturnType<typeof setTimeout>>();
      const schedule = (fn: () => void, ms: number) => {
        const t = setTimeout(() => {
          timers.delete(t);
          if (cancelled) return;
          fn();
        }, ms);
        timers.add(t);
      };
      const cycle = () => {
        data.humanDecision = undefined;
        data.decisionTabState = initialDecisionTabState;
        setActiveTab('overview');
        bumpData();
        schedule(() => setActiveTab('requirements'), requirementsAt);
        schedule(() => setActiveTab('decision'), decisionAt);
        schedule(() => {
          data.humanDecision = approvedDecision;
          data.decisionTabState = 'completed';
          bumpData();
        }, approveAt);
        schedule(cycle, cycleMs);
      };
      cycle();
      return () => {
        cancelled = true;
        timers.forEach(clearTimeout);
      };
    } else if (guide === 'new-case-appears' && data.id === 'IP26-5546112') {
      // Set decision as completed so all stepper steps show done.
      // The sidebar + navigation cycle is handled by CasesWorkspace.
      data.humanDecision = {
        decisionType: 'approve',
        reasonCodes: ['ai_recommended'],
        notes: 'AI recommendation accepted. All 7 requirements fulfilled.',
        recordedBy: 'Victor Ramon',
        recordedAt: new Date().toISOString(),
      };
      data.decisionTabState = 'completed';
      setActiveTab('overview');
      bumpData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, caseId]);
  const [aiToastPauseAfter, setAiToastPauseAfter] = useState<string | null>('create-case');
  useEffect(() => {
    if (caseId === 'IP26-5546200' && aiToastPauseAfter === 'create-case') {
      const timer = setTimeout(() => setAiToastPauseAfter('nc-restore'), 500);
      return () => clearTimeout(timer);
    }
  }, [caseId, aiToastPauseAfter]);
  useEffect(() => {
    if (caseId === 'IP26-5546200' && activeTab === 'requirements' && aiToastPauseAfter === 'nc-restore') {
      const timer = setTimeout(() => setAiToastPauseAfter(null), 300);
      return () => clearTimeout(timer);
    }
  }, [caseId, activeTab, aiToastPauseAfter]);

  useEffect(() => {
    if (caseId !== 'IP26-5546200' || !overdueTaskCompleted || reqCascadeStarted) return;
    if (activeTab !== 'requirements') return;
    setReqCascadeStarted(true);
    const reqs = data.requirements;
    const pending = reqs.filter((r) => r.status !== 'Fulfilled' && r.status !== 'Completed');
    let idx = 0;
    const cascadeNext = () => {
      if (idx >= pending.length) {
        data.activeStage = 4;
        data.decisionTabState = 'active';
        if (caseSummary) caseSummary.status = 'Active: Case Completion';
        data.caseStatus = 'Active: Case Completion';
        bumpData();
        if (aiActivityEnabled) {
          setAiActivitySeq({
            id: `completion-${Date.now()}`,
            title: 'AI Crew — Case Completion',
            stepDelayMs: 700,
            startedAt: Date.now(),
            steps: [
              { id: 'cc-verify', label: 'Verifying all requirements fulfilled', status: 'pending' },
              { id: 'cc-assess', label: 'Running final recovery assessment — 94% confidence', status: 'pending' },
              { id: 'cc-rtw', label: 'Return-to-work confirmation received from employer', status: 'pending' },
              { id: 'cc-rec', label: 'Recommendation: Close Case — recovery complete', status: 'pending' },
              { id: 'cc-ready', label: 'Decision tab unlocked — ready for final review', status: 'pending' },
            ],
          });
        }
        return;
      }
      pending[idx].status = 'Fulfilled';
      pending[idx].rag = 'Green';
      idx++;
      bumpData();
      setTimeout(cascadeNext, 800);
    };
    const timer = setTimeout(cascadeNext, 1500);
    return () => clearTimeout(timer);
  }, [caseId, activeTab, overdueTaskCompleted, reqCascadeStarted, data, caseSummary, bumpData]);

  const relatedCases = useMemo(
    () => listCaseSummaries(activeDataset).filter((c) => c.claimant === data.claimantName && c.id !== data.id),
    [activeDataset, data.claimantName, data.id],
  );
  const workflowMeta = data.workflowMeta;
  const workflowContextSlots = workflowMeta?.contextBar ? [...workflowMeta.contextBar].sort((a, b) => a.slot - b.slot) : [];
  const richGeneralInfoCards = data.generalInformation?.cards ?? [];
  const richGeneralInfoCollapsibles = data.generalInformation?.collapsibles ?? [];
  const hasRichGeneralInfo = richGeneralInfoCards.length > 0;
  const contextMetrics = data.contextCard?.headlineMetrics ?? [];
  const contextMetric = (id: string) => contextMetrics.find((metric) => metric.id === id);
  const primaryPartyMetric = contextMetric('primary-party');
  const planMetric = contextMetric('plan');
  const benefitMetric = contextMetric('monthly-benefit');
  const productMetric = contextMetric('product');
  const structuredGeneralSections = data.generalInformation?.sections?.filter((section) => section.enabled !== false) ?? [];
  const primaryPartyDisplayName = data.primaryPartyPolicyRole
    ? `${data.claimantName} (${data.primaryPartyPolicyRole})`
    : data.claimantName;
  const relationshipRows = useMemo<CaseRelationshipRow[]>(() => {
    const rows: CaseRelationshipRow[] = [];
    const addRef = (ref: NonNullable<CaseOverview['linkedObjects']>[number] | CaseOverview['primaryParty'], fallbackRelationship: string) => {
      if (!['case', 'client', 'policy', 'agent', 'application'].includes(ref.kind)) return;
      if (ref.kind === 'case' && ref.id === data.id) return;
      const id = `${ref.kind}-${ref.id}`;
      if (rows.some((row) => row.id === id)) return;
      rows.push({
        id,
        kind: ref.kind as CaseRelationshipRow['kind'],
        label: ref.label ?? ref.id,
        relationship: ref.role ?? fallbackRelationship,
        status: ref.kind === 'case' ? listCaseSummaries(activeDataset).find((item) => item.id === ref.id)?.status : undefined,
        details: ref.summary,
        href: ref.href ?? (ref.kind === 'case' ? `/cases/${encodeURIComponent(ref.id)}` : `/folders/${encodeURIComponent(ref.id)}`),
      });
    };
    if (data.primaryParty) addRef(data.primaryParty, data.primaryPartyLabel ?? 'Primary party');
    data.participants?.forEach((ref) => addRef(ref, ref.role ?? 'Participant'));
    data.linkedObjects?.forEach((ref) => addRef(ref, 'Linked entity'));
    relatedCases.forEach((related) => {
      const id = `case-${related.id}`;
      if (rows.some((row) => row.id === id)) return;
      rows.push({
        id,
        kind: 'case',
        label: related.id,
        relationship: 'Related case for same primary party',
        status: related.status,
        details: `${related.product} · ${currency.localize(related.benefit)}`,
        href: `/cases/${encodeURIComponent(related.id)}`,
      });
    });
    return rows;
  }, [activeDataset, data.id, data.linkedObjects, data.participants, data.primaryParty, data.primaryPartyLabel, relatedCases]);
  const preApprovalReqs = useMemo(() => data.requirements.filter((r) => r.phase === 'pre-approval'), [data.requirements]);
  const postApprovalReqs = useMemo(() => data.requirements.filter((r) => r.phase === 'post-approval'), [data.requirements]);
  const selectedRequirementRecord = useMemo(() => {
    if (!selectedRequirement) return undefined;
    if (selectedRequirement.datasetRequirementId) {
      return activeDataset.requirements.find((requirement) => requirement.id === selectedRequirement.datasetRequirementId);
    }
    const requirementRef = selectedRequirement.objectRefs?.find((ref) => ref.kind === 'requirement');
    if (requirementRef) {
      return activeDataset.requirements.find((requirement) => requirement.id === requirementRef.id);
    }
    return activeDataset.requirements.find((requirement) =>
      requirement.label === selectedRequirement.name &&
      requirement.linkedObjects.some((ref) => ref.kind === 'case' && ref.id === data.id),
    );
  }, [activeDataset.requirements, data.id, selectedRequirement]);
  const selectedRequirementDocuments = useMemo(() => {
    if (!selectedRequirement) return [];
    const ids = new Set(selectedRequirement.linkedDocs ?? selectedRequirementRecord?.linkedDocs ?? []);
    if (!ids.size) return [];
    return listDocuments(activeDataset, { caseId: data.id }).filter((document) => ids.has(document.id));
  }, [activeDataset, data.id, selectedRequirement, selectedRequirementRecord]);
  const selectedRequirementTasks = useMemo(() => {
    if (!selectedRequirement) return [];
    const ids = new Set(selectedRequirement.linkedTasks ?? selectedRequirementRecord?.linkedTasks ?? []);
    if (!ids.size) return [];
    return listTasks(activeDataset, { caseId: data.id }).filter((task) => ids.has(task.id) || Boolean(task.taskId && ids.has(task.taskId)));
  }, [activeDataset, data.id, selectedRequirement, selectedRequirementRecord]);
  const filteredRequirements = reqPhaseTab === 'pre-approval' ? preApprovalReqs : postApprovalReqs;

  const requirementTotalCount = data.requirements.length;
  const requirementCompletedCount = data.requirements.filter((item) => item.status === 'Fulfilled' || item.status === 'Waived').length;
  const requirementCompletionPct = requirementTotalCount > 0 ? Math.round((requirementCompletedCount / requirementTotalCount) * 100) : 0;

  const phaseReqTotal = filteredRequirements.length;
  const phaseReqCompleted = filteredRequirements.filter((r) => r.status === 'Fulfilled' || r.status === 'Waived').length;
  const phaseReqPct = phaseReqTotal > 0 ? Math.round((phaseReqCompleted / phaseReqTotal) * 100) : 0;
  const phaseReqBarColor = phaseReqPct >= 60 ? '#008533' : '#f5a200';

  const preReqCompleted = preApprovalReqs.filter((r) => r.status === 'Fulfilled' || r.status === 'Waived').length;
  const preReqPct = preApprovalReqs.length > 0 ? Math.round((preReqCompleted / preApprovalReqs.length) * 100) : 0;
  const postReqCompleted = postApprovalReqs.filter((r) => r.status === 'Fulfilled' || r.status === 'Waived').length;
  const postReqPct = postApprovalReqs.length > 0 ? Math.round((postReqCompleted / postApprovalReqs.length) * 100) : 0;

  const isPostApprovalPhase = data.phase === 'post-approval';
  const hasPostApprovalReqs = postApprovalReqs.length > 0;

  const reqCountByStatus = useMemo(() => {
    const counts: Record<string, number> = { Fulfilled: 0, Pending: 0, Overdue: 0, Waived: 0, Completed: 0 };
    for (const r of filteredRequirements) counts[r.status] = (counts[r.status] || 0) + 1;
    return counts;
  }, [filteredRequirements]);
  const requirementKpis = useMemo(() => {
    const completed = data.requirements.filter((item) =>
      item.status === 'Fulfilled' || item.status === 'Waived' || item.status === 'Completed',
    ).length;
    const overdue = data.requirements.filter((item) => item.status === 'Overdue').length;
    const pending = data.requirements.filter((item) => item.status === 'Pending').length;
    const ordered = data.requirements.filter((item) => item.status === 'Ordered').length;
    const needsAttention = overdue + pending;
    return { completed, overdue, pending, ordered, needsAttention };
  }, [data.requirements]);
  const reqBarColor = requirementCompletionPct >= 60 ? '#008533' : requirementCompletionPct >= 25 ? '#f5a200' : '#f5a200';

  const fullCaseStatus = workflowMeta?.status ?? caseSummary?.status ?? data.caseStatus;
  const caseStatusShort = fullCaseStatus.startsWith('Closed:') ? fullCaseStatus : fullCaseStatus.split(':')[0]?.trim() || data.caseStatus;
  const caseStatusLozengeType = (() => {
    const fullStatus = caseSummary?.status ?? data.caseStatus;
    if (fullStatus === 'Declined' || fullStatus === 'Terminated: Declined') return 'Alert' as const;
    if (fullStatus.startsWith('Terminated:')) return 'Neutral' as const;
    if (fullStatus.startsWith('Closed:')) return 'Neutral' as const;
    if (fullStatus === 'Approved') return 'Success' as const;
    if (fullStatus.startsWith('Active')) return 'Informative' as const;
    if (fullStatus === 'Pending Requirements' || fullStatus === 'Pending Decision' || fullStatus === 'In Progress') return 'Warning' as const;
    return 'Informative' as const;
  })();

  const aiBanner = useMemo(() => {
    const completed = data.decisionTabState === 'completed';
    const human = data.humanDecision?.decisionType;

    if (data.phase === 'post-approval' && completed && human === 'approve') {
      if (data.activeStage === 1) {
        return {
          contextLabel: 'Restoration planning',
          narrative:
            'Claim approved — meet with the client to review the Guardian restoration plan (physician cadence, PT, RTW guardrails) before Recovery Underway. AI proposes three interview slots from your calendar; the claimant picks a time on the portal or email, and the matching task appears in My Tasks when they respond.',
          badgeLabel: 'Schedule meeting',
          badgeTone: 'success' as const,
        };
      }
      return {
        contextLabel: 'Case monitoring',
        narrative: `Post-approval journey in progress for ${data.claimantName}. Follow tasks and requirements through Recovery, Monitoring, and RTW planning — AI surfaces risks and milestones as the case evolves.`,
        badgeLabel: 'Monitor',
        badgeTone: 'info' as const,
      };
    }

    if (data.phase === 'post-approval' && completed && human && human !== 'approve') {
      return {
        contextLabel: 'Claims Analysis',
        narrative:
          human === 'decline'
            ? 'Decision recorded. Complete claimant communications and closure tasks per policy workflow — review tasks and the Communications tab for next steps.'
            : human === 'modified_offer'
              ? 'Modified offer recorded. Notify the claimant and track acceptance through tasks and communications.'
              : 'Information request recorded. Gather outstanding items from tasks before revisiting the decision.',
        badgeLabel: human === 'decline' ? 'Declined' : human === 'modified_offer' ? 'Modified offer' : 'Info request',
        badgeTone: human === 'decline' ? ('danger' as const) : ('warning' as const),
      };
    }

    if (data.phase === 'pre-approval' && completed && human === 'approve') {
      return {
        contextLabel: 'Restoration planning',
        narrative:
          'Claim approved — moving to post-approval. Your next priority is the restoration plan interview: schedule with the claimant to align on the plan before Recovery Underway (see My Tasks).',
        badgeLabel: 'Approved',
        badgeTone: 'success' as const,
      };
    }

    if (data.phase === 'pre-approval' && !completed) {
      const locked = data.decisionTabState === 'locked';
      return {
        contextLabel: 'Claims Analysis',
        narrative: locked
          ? (data.headerCallout ?? 'Complete outstanding requirements before opening the Decision tab.')
          : data.aiNarrative,
        badgeLabel: data.aiRecommendation,
        badgeTone:
          data.aiRecommendation === 'Approve'
            ? ('success' as const)
            : data.aiRecommendation === 'Close'
              ? ('info' as const)
              : ('warning' as const),
      };
    }

    return {
      contextLabel: 'Claims Analysis',
      narrative: data.aiNarrative,
      badgeLabel: data.aiRecommendation,
      badgeTone:
        data.aiRecommendation === 'Approve'
          ? ('success' as const)
          : data.aiRecommendation === 'Close'
            ? ('info' as const)
            : ('warning' as const),
    };
  }, [
    data.phase,
    data.decisionTabState,
    data.activeStage,
    data.aiNarrative,
    data.aiRecommendation,
    data.headerCallout,
    data.claimantName,
    data.humanDecision?.decisionType,
  ]);

  const isDecisionStep =
    data.phase === 'pre-approval' &&
    data.preApprovalStages.length > 0 &&
    data.activeStage === data.preApprovalStages.length;
  const effectivePhase = singlePhase ?? data.phase;
  const isStepperBusy = phaseTransition !== 'idle';
  const activeStepForPhase = data.activeStage;
  const isTerminated = (caseSummary?.status ?? data.caseStatus).startsWith('Terminated:');

  const stepperViewportRef = useRef<HTMLDivElement>(null);
  const preStepClusterRef = useRef<HTMLDivElement>(null);
  const postStepClusterRef = useRef<HTMLDivElement>(null);
  const aiPanelAsideRef = useRef<HTMLAsideElement | null>(null);

  useEffect(() => {
    if (!dataOverride) addOpenCase(caseId);
    const phase = singlePhase ?? (data.phase === 'post-approval' ? 'post-approval' : 'pre-approval');
    setReqPhaseTab(phase);
    setSelectedRequirementIds([]);
  }, [caseId, addOpenCase, data.phase, dataOverride, singlePhase]);

  useEffect(() => {
    if (!toast) return;
    const ms = toast.tone === 'success' ? 4500 : 4000;
    const timer = setTimeout(() => setToast(null), ms);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!showAIPanel) setCopilotSurfaceOpen(false);
  }, [showAIPanel]);

  useEffect(() => {
    if (!casesAiAssistantEnabled) {
      setShowAIPanel(false);
      setAiPanelExiting(false);
      setCopilotSurfaceOpen(false);
    }
  }, [casesAiAssistantEnabled]);

  const openAiPanel = useCallback(() => {
    if (!casesAiAssistantEnabled) return;
    setAiPanelExiting(false);
    setShowAIPanel(true);
  }, [casesAiAssistantEnabled]);

  const closeAiPanel = useCallback(() => {
    setCopilotSurfaceOpen(false);
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShowAIPanel(false);
      setAiPanelExiting(false);
      return;
    }
    setAiPanelExiting(true);
  }, []);

  useEffect(() => {
    if (!aiPanelExiting) return;
    const id = window.setTimeout(() => {
      setShowAIPanel(false);
      setAiPanelExiting(false);
    }, 300);
    return () => clearTimeout(id);
  }, [aiPanelExiting]);

  useEffect(() => {
    if (!showAIPanel || aiPanelExiting) return;

    const onPointerDown = (e: PointerEvent) => {
      const aside = aiPanelAsideRef.current;
      if (!aside) return;
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (aside.contains(target)) return;
      const el = target instanceof Element ? target : null;
      if (el?.closest('[data-ai-panel-ignore-outside]')) return;
      // Bubble phase + double rAF: let the browser finish this gesture frame and paint before
      // starting slideOut / overlay fade (capture pointerdown was competing and felt like a flash).
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          closeAiPanel();
        });
      });
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [showAIPanel, aiPanelExiting, closeAiPanel]);

  useEffect(() => {
    if (phaseTransition === 'idle') return;
    let timer: ReturnType<typeof setTimeout>;
    if (phaseTransition === 'completing') {
      timer = setTimeout(() => {
        data.phase = 'post-approval';
        data.stageLabels = data.postApprovalStages;
        data.activeStage = 1;
        setReqPhaseTab('post-approval');
        setPhaseTransition('scrolling');
      }, 1200);
    } else if (phaseTransition === 'scrolling') {
      timer = setTimeout(() => setPhaseTransition('idle'), 700);
    }
    return () => clearTimeout(timer);
  }, [phaseTransition, data]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = window.innerWidth - event.clientX;
      setPanelWidth(clampAiPanelWidth(window.innerWidth, nextWidth));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    if (!taskDetailPanelResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      const maxWidth = Math.min(1200, Math.round(window.innerWidth * 0.75));
      if (newWidth >= 420 && newWidth <= maxWidth) setTaskDetailPanelWidth(newWidth);
    };
    const handleMouseUp = () => {
      setTaskDetailPanelResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [taskDetailPanelResizing]);

  useEffect(() => {
    closeCaseSidePanel();
  }, [activeTab, data.id, closeCaseSidePanel]);

  useEffect(() => {
    setActiveTab('overview');
  }, [caseId]);

  useEffect(() => {
    if (!reqDetailPanelResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      const maxWidth = Math.min(1000, Math.round(window.innerWidth * 0.72));
      if (newWidth >= 420 && newWidth <= maxWidth) setReqDetailPanelWidth(newWidth);
    };
    const handleMouseUp = () => setReqDetailPanelResizing(false);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [reqDetailPanelResizing]);

  useEffect(() => {
    if (!docDetailPanelResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      const maxWidth = Math.min(1200, Math.round(window.innerWidth * 0.75));
      if (newWidth >= 520 && newWidth <= maxWidth) setDocDetailPanelWidth(newWidth);
    };
    const handleMouseUp = () => {
      setDocDetailPanelResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [docDetailPanelResizing]);

  useEffect(() => {
    const onResize = () => {
      setPanelWidth((w) => clampAiPanelWidth(window.innerWidth, w));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const handleGlobalMouseDown = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) hideSelectionMenu();
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hideSelectionMenu();
    };
    document.addEventListener('mousedown', handleGlobalMouseDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleGlobalMouseDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hideSelectionMenu = () => {
    setSelectionMenu({ visible: false, x: 0, y: 0, text: '' });
  };

  const handleSummarySelection = (event: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      hideSelectionMenu();
      return;
    }
    const text = selection.toString().trim();
    if (!text) {
      hideSelectionMenu();
      return;
    }
    const anchorNode = selection.anchorNode;
    if (!anchorNode || !event.currentTarget.contains(anchorNode)) {
      hideSelectionMenu();
      return;
    }
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    if (!rect.width && !rect.height) {
      hideSelectionMenu();
      return;
    }
    setSelectionMenu({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      text,
    });
  };

  const insightBundle = useMemo(
    () =>
      getInsightBundle(
        data.id,
        data.phase,
        data.preApprovalStages,
        data.postApprovalStages,
        data.decisionTabState,
        { claimSubType: data.claimSubType, caseKind: data.caseKind },
      ),
    [data.id, data.phase, data.preApprovalStages, data.postApprovalStages, data.decisionTabState, data.claimSubType, data.caseKind],
  );

  const handleCopilotSend = useCallback((text: string) => {
    const uid = `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setAiCopilotMessages((m) => [...m, { id: uid, role: 'user', text, at: Date.now() }]);
    const short = text.length > 80 ? `${text.slice(0, 80)}…` : text;
    const hint = copilotClaimContextHint(data.caseKind, data.claimSubType);
    const datasetReply = buildDatasetAssistantReply(activeDataset, text, `case:${data.id}`);
    const fallback = `Preview — copilot would respond about “${short}” using case ${data.id} and this workspace. A live integration would stream an answer with citations, policy hooks, and suggested follow-ups.`;
    const body = datasetReply?.text ?? fallback;
    const replyText = hint ? `${hint}\n\n${body}` : body;
    window.setTimeout(() => {
      const aid = `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setAiCopilotMessages((m) => [
        ...m,
        {
          id: aid,
          role: 'assistant',
          text: replyText,
          at: Date.now(),
        },
      ]);
    }, 420);
  }, [activeDataset, data.id, data.caseKind, data.claimSubType]);

  const canUseLegacyCaseFallbacks = dataSource.legacyMockOverlayEnabled && (data.id === 'IP26-5546112' || data.id === 'IP26-5546200');

  const contextualTasks = useMemo(() => {
    const prioritizeCreatedTask = <T extends { id: string }>(rows: T[]) => {
      if (!createdTaskId) return rows;
      const created = rows.find((row) => row.id === createdTaskId);
      if (!created) return rows;
      return [created, ...rows.filter((row) => row.id !== createdTaskId)];
    };
    const datasetRows = listTasks(activeDataset, { caseId: data.id }).map((task) => ({
      id: task.id,
      taskType: task.taskType,
      priority: task.priority === 'URGENT' ? 'Urgent' : task.priority === 'HIGH' ? 'High' : 'Normal',
      status: task.status,
      dueDate: task.slaRemaining,
      stage: task.stage,
      aiGenerated: task.aiGenerated,
      aiConfidence: task.aiConfidence,
      assignee: task.assignedTo || 'Unassigned',
      task,
    }));
    if (!canUseLegacyCaseFallbacks) return prioritizeCreatedTask(datasetRows);
    if (data.id === 'IP26-5546112') {
      const decisionPending = data.phase === 'pre-approval' && data.decisionTabState !== 'completed';

      const decisionRow = {
        id: 'TSK-BB-DEC-01',
        taskType: 'Decision — verify requirements & AI recommendation',
        priority: 'High' as const,
        status: 'To Do',
        dueDate: 'Mar 26, 2026',
        assignee: 'Victor Ramon',
      };
      const tail = [
        { id: 'TSK-6112-02', taskType: 'Validate PT appointment outcomes', priority: 'Normal' as const, status: 'To Do', dueDate: 'Mar 30, 2026', assignee: 'Victor Ramon' },
        { id: 'TSK-6112-03', taskType: 'Confirm claimant adherence plan', priority: 'Normal' as const, status: 'In Queue', dueDate: 'Apr 2, 2026', assignee: 'Marina Scott' },
      ];
      if (decisionPending) {
        return prioritizeCreatedTask([decisionRow, ...tail, ...datasetRows]);
      }
      return prioritizeCreatedTask([...tail, ...datasetRows]);
    }
    if (data.id === 'IP26-5546200') {
      const baseTasks = [
        { id: 'TSK-BB-RP-02', taskType: 'Review restoration plan progress', priority: 'Normal' as const, status: 'To Do', dueDate: 'Apr 5, 2026', assignee: 'Victor Ramon' },
        { id: 'TSK-BB-PT-01', taskType: 'Validate PT appointment outcomes', priority: 'Normal' as const, status: 'To Do', dueDate: 'Apr 10, 2026', assignee: 'Victor Ramon' },
      ];
      const tasks: Array<{ id: string; taskType: string; priority: string; status: string; dueDate: string; assignee: string }> = [];
      if (overdueTaskReady) {
        tasks.push({ id: 'TSK-BB-OD-01', taskType: 'Follow up on overdue requirement — Weekly PT Sessions', priority: 'High' as const, status: overdueTaskCompleted ? 'Completed' : 'Overdue', dueDate: 'Apr 12, 2026', assignee: 'Victor Ramon' });
      }
      if (newCaseTaskReady) {
        tasks.push({ id: 'TSK-BB-APPT-01', taskType: 'Review proposed appointment — validate meeting time with Billy Bud', priority: 'High' as const, status: 'To Do', dueDate: 'Apr 1, 2026', assignee: 'Victor Ramon' });
      }
      return prioritizeCreatedTask([...tasks, ...baseTasks, ...datasetRows]);
    }
    return prioritizeCreatedTask(datasetRows);
  }, [activeDataset, canUseLegacyCaseFallbacks, data.id, data.phase, data.decisionTabState, newCaseTaskReady, overdueTaskReady, overdueTaskCompleted, dataVersion, createdTaskId]);

  useEffect(() => {
    const hash = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const taskId = params.get('task');
    if (!taskId) return;
    const found = contextualTasks.find((row) => row.id === taskId);
    if (!found) return;
    setActiveTab('tasks');
    setTabViews((prev) => ({ ...prev, tasks: 'table' }));
    openCaseTaskPanel(found.task ?? resolveTaskForCaseContextRow(found, data));
  }, [contextualTasks, data, location.hash, openCaseTaskPanel]);

  const communications = useMemo(
    () => {
      const datasetRows = listCommunications(activeDataset, data.id).map((row) => ({
        date: row.createdAt ? new Date(row.createdAt).toLocaleDateString() : row.id,
        channel: row.channel,
        direction: row.direction,
        contact: row.contact ?? row.linkedObjects.find((ref) => ref.kind === 'client')?.label ?? data.claimantName,
        summary: row.subject,
        owner: row.assignee ?? row.status,
        stage: row.stage,
      }));
      if (!canUseLegacyCaseFallbacks) return datasetRows;
      return datasetRows.length ? datasetRows : [
        { date: 'Mar 18, 2026', channel: 'Phone', direction: 'Outbound', contact: data.claimantName, summary: 'Discussed PT adherence and medication compliance.', owner: 'Victor Ramon' },
        { date: 'Mar 15, 2026', channel: 'Email', direction: 'Inbound', contact: 'Dr. Harding', summary: 'Uploaded updated orthopaedic review notes.', owner: 'Case Intake Bot' },
        { date: 'Mar 11, 2026', channel: 'Portal', direction: 'Inbound', contact: data.claimantName, summary: 'Submitted pain-level update and mobility log.', owner: 'Victor Ramon' },
      ];
    },
    [activeDataset, canUseLegacyCaseFallbacks, data.claimantName, data.id]
  );

  const documents = useMemo(
    () => {
      const datasetRows = listDocuments(activeDataset, { caseId: data.id }).map((document) => ({
        id: document.id,
        name: document.name,
        category: document.category,
        status: document.status,
        stage: document.stage,
        uploaded: document.uploaded,
        source: document.source,
        insight: document.insight,
        aiInsight: document.aiInsight,
        aiConfidence: document.aiConfidence,
        aiSummary: document.aiSummary,
        linkedRequirement: document.linkedRequirement,
        linkedRequirementId: document.linkedRequirementId,
        fileSize: document.fileSize,
        fileType: document.fileType,
      }));
      if (!canUseLegacyCaseFallbacks) return datasetRows;
      return datasetRows.length ? datasetRows : [
        { name: 'Orthopaedic surgical report.pdf', category: 'Medical', status: 'Validated', uploaded: 'Feb 4, 2026', source: 'hospital_feed', aiSummary: 'Consistent surgical findings, no complications, expected recovery trajectory confirmed', linkedRequirement: 'Surgical Follow-Up' },
        { name: 'PT session notes week-03.pdf', category: 'Rehabilitation', status: 'Validated', uploaded: 'Mar 6, 2026', source: 'physio_portal', aiSummary: 'Minor setback detected — increased knee pain, physiotherapist recommends reduced intensity for 2 weeks', linkedRequirement: 'Physical Therapy Appt. (Mar 6)' },
        { name: 'Medication compliance summary.pdf', category: 'Pharmacy', status: 'Validated', uploaded: 'Mar 12, 2026', source: 'pharmacy_check', aiSummary: 'Insulin and GLP-1 compliance confirmed via pharmacy records, dietary adherence unverified', linkedRequirement: 'Physician Follow-Up' },
      ];
    },
    [activeDataset, canUseLegacyCaseFallbacks, data.id]
  );
  const selectedCaseDocumentData = useMemo<DynamicDocumentData | null>(() => {
    if (!selectedCaseDocument) return null;
    const datasetEvidence = getDocumentEvidence(selectedCaseDocument.id, activeDataset);
    if (datasetEvidence) return datasetEvidence;
    return {
      documentId: selectedCaseDocument.name.replace(/\.[^.]+$/, '').slice(0, 12).toUpperCase(),
      documentTitle: selectedCaseDocument.name,
      category: `${selectedCaseDocument.category} document`,
      status: selectedCaseDocument.status,
      fileSize: selectedCaseDocument.fileSize ?? 'No file',
      fileType: selectedCaseDocument.fileType ?? getDocumentFileType(selectedCaseDocument.name),
      caseId: data.id,
      caseReference: data.policyNumber ?? data.id,
      claimant: data.claimantName,
      source: selectedCaseDocument.source,
      linkedRequirement: selectedCaseDocument.linkedRequirement,
      linkedRequirementHref: `/cases/${data.id}#tab=requirements`,
      received: selectedCaseDocument.uploaded,
      totalPages: 12,
      pages: [
        { number: 2, image: '/evidence-medical-report-page-2.png', label: 'Physical examination' },
        { number: 3, image: '/evidence-medical-report-page.png', label: 'Medical history and plan' },
      ],
      summary: {
        label: 'Summary',
        status: 'Review evidence',
        text: selectedCaseDocument.aiSummary,
      },
      evidence: dataSource.legacyMockOverlayEnabled === false ? [] : [
        {
          id: 'treatment-gap',
          marker: 1,
          page: 3,
          severity: 'Medium',
          title: 'Confirm treatment continuity',
          quote: 'He has attended physiotherapy intermittently and was prescribed NSAIDs for pain relief.',
          reasoning: 'The report says physiotherapy was intermittent, but does not confirm visit frequency, duration, or adherence.',
          impact: 'Ask for treatment frequency before using this as recovery evidence.',
          tone: 'warning',
          highlight: { top: '35.0%', left: '2.4%', width: '93%', height: '3.2%' },
        },
        {
          id: 'rtw-gap',
          marker: 2,
          page: 3,
          severity: 'High',
          title: 'Request return-to-work plan',
          quote: 'Patient reports difficulty with prolonged sitting (>30 mins) and bending. Capable of light duties with restrictions.',
          reasoning: 'Restrictions are documented, but there is no timeline, activity plan, or employer accommodation path.',
          impact: 'Do not close the control gap until an RTW plan is requested.',
          tone: 'danger',
          highlight: { top: '64.3%', left: '2.4%', width: '93%', height: '6.2%' },
        },
      ],
      actions: [
        { id: 'review-requirement', label: 'Review requirement' },
        { id: 'create-follow-up', label: 'Create follow-up', variant: 'primary' },
      ],
    };
  }, [activeDataset, data.claimantName, data.id, data.policyNumber, dataSource.legacyMockOverlayEnabled, selectedCaseDocument]);
  const resolveCasePanelContext = useCallback((contextId: string) => {
    setActiveCasePanelContextId(contextId);
    if (contextId.startsWith('task:')) {
      const id = contextId.slice('task:'.length);
      const found = listTasks(activeDataset, { caseId: data.id }).find((task) => task.id === id || task.taskId === id);
      if (found) setSelectedCaseTask(found);
      return;
    }
    if (contextId.startsWith('requirement:')) {
      const id = contextId.slice('requirement:'.length);
      const found = data.requirements.find((requirement) => String(requirement.id) === id || String(requirement.datasetRequirementId) === id);
      if (found) setSelectedRequirement(found);
      return;
    }
    if (contextId.startsWith('document:')) {
      const id = documentIdFromPanelContext(contextId) ?? contextId.slice('document:'.length);
      const found = documents.find((document) => document.id === id || document.name === id);
      if (found) setSelectedCaseDocument(found);
    }
  }, [activeDataset, data.id, data.requirements, documents]);
  const handleCasePanelContextChange = useCallback((contextId: string) => {
    resolveCasePanelContext(contextId);
  }, [resolveCasePanelContext]);
  const clearCasePanelContext = useCallback((contextId: string) => {
    let nextContextId: string | undefined;
    setCasePanelContexts((current) => {
      const index = current.findIndex((context) => context.id === contextId);
      const next = index >= 0 ? current[index + 1] ?? current[index - 1] : undefined;
      nextContextId = next?.id;
      return current.filter((context) => context.id !== contextId);
    });
    if (contextId.startsWith('task:')) setSelectedCaseTask(null);
    if (contextId.startsWith('requirement:')) setSelectedRequirement(null);
    if (contextId.startsWith('document:')) setSelectedCaseDocument(null);
    if (nextContextId) {
      queueMicrotask(() => resolveCasePanelContext(nextContextId!));
      return;
    }
    closeCaseSidePanel();
  }, [closeCaseSidePanel, resolveCasePanelContext]);
  const handleCasePanelNavigationChange = useCallback((payload: TaskPanelNavigationPayload) => {
    setCasePanelContexts(payload.contexts);
    resolveCasePanelContext(payload.activeContextId);
  }, [resolveCasePanelContext]);

  const historyEvents = useMemo(
    () => {
      const datasetRows = listActivityEvents(activeDataset, data.id).map((event) => ({
        date: new Date(event.timestamp).toLocaleDateString(),
        event: event.label,
        detail: event.detail ?? `${event.actor} event linked to ${event.linkedObjects.length} entities.`,
        stage: event.stage,
      }));
      if (!canUseLegacyCaseFallbacks) return datasetRows;
      return datasetRows.length ? datasetRows : [
        { date: 'Mar 26, 2026', event: 'AI recommendation refreshed', detail: 'Confidence updated to 91% after latest PT notes.' },
        { date: 'Mar 12, 2026', event: 'Medical setback flagged', detail: 'Potential knee reinjury detected during rehab monitoring.' },
        { date: 'Feb 26, 2026', event: 'Restoration plan initiated', detail: 'AI rule engine generated weekly PT + physician cadence.' },
      ];
    },
    [activeDataset, canUseLegacyCaseFallbacks, data.id]
  );

  const stageOptionsFor = useCallback(<T extends { stage?: string }>(rows: T[]) => {
    return Array.from(new Set(rows.map((row) => row.stage).filter((stage): stage is string => Boolean(stage)))).sort();
  }, []);
  const stageMatches = useCallback(<T extends { stage?: string }>(tab: string, row: T) => {
    const selectedStage = stageFilters[tab];
    return !selectedStage || row.stage === selectedStage;
  }, [stageFilters]);
  const stagedTasks = useMemo(() => contextualTasks.filter((row) => stageMatches('tasks', row)), [contextualTasks, stageMatches]);
  const stagedRequirements = useMemo(() => data.requirements.filter((row) => stageMatches('requirements', row)), [data.requirements, stageMatches]);
  const requirementSearchQuery = (tabSearchQueries.requirements ?? '').trim().toLowerCase();
  const searchedRequirements = useMemo(() => {
    if (!requirementSearchQuery) return stagedRequirements;
    return stagedRequirements.filter((row) => {
      const sourceLabel =
        row.source === 'ai_rule_engine' ? 'AI Rule Engine' :
        row.source === 'id_verification' ? 'ID Verification' :
        row.source === 'employer_portal' ? 'Employer Portal' :
        row.source === 'pharmacy_check' ? 'Pharmacy Check' :
        row.source;
      const haystack = [
        row.name,
        row.category,
        row.stage,
        row.status,
        row.dueDate,
        row.followUpDate,
        row.source,
        sourceLabel,
        row.notes,
        row.trigger,
        row.phase,
        row.aiSummary,
        row.responsibleParty,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(requirementSearchQuery);
    });
  }, [stagedRequirements, requirementSearchQuery]);
  const stagedDocuments = useMemo(() => documents.filter((row) => stageMatches('documents', row)), [documents, stageMatches]);
  const taskSearchQuery = (tabSearchQueries.tasks ?? '').trim().toLowerCase();
  const searchedTasks = useMemo(() => {
    if (!taskSearchQuery) return stagedTasks;
    return stagedTasks.filter((row) => {
      const haystack = [
        row.id,
        row.task?.taskId,
        row.taskType,
        row.status,
        row.priority,
        row.assignee,
        row.stage,
        row.dueDate,
        row.task?.aiSummary,
        row.task?.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(taskSearchQuery);
    });
  }, [stagedTasks, taskSearchQuery]);
  const documentSearchQuery = (tabSearchQueries.documents ?? '').trim().toLowerCase();
  const searchedDocuments = useMemo(() => {
    if (!documentSearchQuery) return stagedDocuments;
    return stagedDocuments.filter((row) => {
      const haystack = [
        row.name,
        row.category,
        row.stage,
        row.insight,
        row.aiSummary,
        row.uploaded,
        row.source,
        row.linkedRequirement,
        row.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(documentSearchQuery);
    });
  }, [stagedDocuments, documentSearchQuery]);
  const stagedCommunications = useMemo(() => communications.filter((row) => stageMatches('communications', row)), [communications, stageMatches]);
  const stagedHistoryEvents = useMemo(() => historyEvents.filter((row) => stageMatches('history', row)), [historyEvents, stageMatches]);
  const activeStageOptions = useMemo(() => {
    if (activeTab === 'tasks') return stageOptionsFor(contextualTasks);
    if (activeTab === 'requirements') return stageOptionsFor(data.requirements);
    if (activeTab === 'documents') return stageOptionsFor(documents);
    if (activeTab === 'communications') return stageOptionsFor(communications);
    if (activeTab === 'history') return stageOptionsFor(historyEvents);
    return [];
  }, [activeTab, communications, contextualTasks, data.requirements, documents, historyEvents, stageOptionsFor]);

  const workflowMetaTabOrder = workflowMeta?.tabs
    .map(caseTabFromWorkflowLabel)
    .filter((tab): tab is CaseTab => Boolean(tab));
  const anatomyTabIds = new Set<CaseTab>([
    'overview',
    'scoring',
    ...(caseAnatomy?.tabs.map((tab) => (tab.caseTabId ?? tab.id) as CaseTab) ?? []),
    'requirements',
    'decision',
    'tasks',
    'documents',
    'communications',
    'related_cases',
    'history',
  ]);
  const candidateCaseTabOrder = [
    ...CASE_TAB_ORDER,
    ...(caseAnatomy?.tabs.map((tab) => (tab.caseTabId ?? tab.id) as CaseTab) ?? []),
  ]
    .filter((tab, index, arr) => arr.indexOf(tab) === index && anatomyTabIds.has(tab));
  const hasUnderwritingScoring = Boolean(data.underwritingScoring ?? scoringDraft);
  let effectiveCaseTabOrder = workflowMetaTabOrder?.length
    ? workflowMetaTabOrder
    : candidateCaseTabOrder.includes('scoring')
    ? candidateCaseTabOrder.filter((tab) => tab !== 'scoring').flatMap((tab) => tab === 'requirements' ? [tab, 'scoring' as CaseTab] : [tab])
    : candidateCaseTabOrder;
  if (data.caseKind === 'new_business') {
    effectiveCaseTabOrder = effectiveCaseTabOrder.filter((tab) => tab !== 'activation');
    if (hasUnderwritingScoring && !effectiveCaseTabOrder.includes('scoring')) {
      const requirementsIndex = effectiveCaseTabOrder.indexOf('requirements');
      effectiveCaseTabOrder = requirementsIndex >= 0
        ? [
            ...effectiveCaseTabOrder.slice(0, requirementsIndex + 1),
            'scoring',
            ...effectiveCaseTabOrder.slice(requirementsIndex + 1),
          ]
        : ['overview', 'requirements', 'scoring', ...effectiveCaseTabOrder.filter((tab) => tab !== 'overview' && tab !== 'requirements')];
    }
  }
  const effectiveCaseTabOrderWithDecision = [
    ...effectiveCaseTabOrder.filter((tab) => tab !== 'decision'),
    'decision' as CaseTab,
  ];

  const caseTabs = effectiveCaseTabOrderWithDecision
    .filter((tab) => {
      if (tab === 'tasks') return isEntityEnabled(dataSource, 'task');
      if (tab === 'documents') return isEntityEnabled(dataSource, 'document');
      if (tab === 'communications') return isEntityEnabled(dataSource, 'communication');
      if (tab === 'history') return isEntityEnabled(dataSource, 'event');
      if (tab === 'requirements') return isEntityEnabled(dataSource, 'requirement');
      if (tab === 'requests') return isEntityEnabled(dataSource, 'request');
      return true;
    })
    .map((tab) => {
    const isDecisionLocked = tab === 'decision' && data.decisionTabState === 'locked' && data.phase !== 'post-approval';
    const isDecisionCompleted = tab === 'decision' && data.decisionTabState === 'completed';

    const label =
      workflowMeta?.tabs.find((workflowLabel) => caseTabFromWorkflowLabel(workflowLabel) === tab) ??
      resolveCaseWorkspaceTabLabel(tab, caseAnatomy);

    return {
      id: tab,
      label,
      icon: resolveCaseWorkspaceTabIcon(tab, label, data.caseKind, caseAnatomy),
      count: tab === 'related_cases' && relationshipRows.length > 0 ? relationshipRows.length : null,
      disabled: isDecisionLocked,
      title: isDecisionLocked ? 'Requirements must be met before making a decision' : undefined,
      suffix: (
        <>
          {tab === 'requirements' ? (
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold leading-none shadow-sm ${
              requirementCompletionPct === 100
                ? 'border-[#a8d6b8] bg-[#e5f5ea] text-brand-green'
                : reqCountByStatus.Overdue > 0
                  ? 'border-[#f3b6b1] bg-[#fde5e4] text-brand-red'
                  : 'border-[#f1cf93] bg-[#fff4e6] text-[#8a5a00]'
            }`}>
              {requirementCompletedCount}/{requirementTotalCount}
            </span>
          ) : null}
          {tab === 'tasks' && contextualTasks.length > 0 ? (
            <span className={`inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full border px-1.5 text-[11px] font-bold leading-none shadow-sm ${
              newTaskBadge ? 'animate-pulse border-[#cd2c23] bg-[#cd2c23] text-white' : 'border-border-soft bg-white text-text-secondary'
            }`}>
              {contextualTasks.length}
            </span>
          ) : null}
          {isDecisionCompleted ? (
            <span className="inline-flex items-center justify-center rounded-full bg-[#e5f5ea] p-1 text-brand-green">
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          ) : null}
        </>
      ),
    };
  });

  return (
    <div className="relative flex h-full min-h-0 min-w-0 overflow-x-hidden bg-surface-primary">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="bg-surface-primary px-6 py-3">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className="inline-flex h-[20px] items-center gap-1 rounded-[6px] border border-[#d0d5dd] bg-white px-[6px] text-xs font-semibold text-text-secondary"
                title={caseType?.description ?? `${data.caseTypeLabel} · ${data.lineOfBusiness}`}
              >
                {workflowMeta?.breadcrumb ? (
                  <span>{workflowMeta.breadcrumb}</span>
                ) : (
                  <>
                    <span>{caseTypeCopy.caseNoun}</span>
                    <span className="text-[#a9aeb5]">·</span>
                    <span>
                      {data.identification?.caseTypeLabel
                    ?? (data.caseKind === 'claim'
                      ? claimSubTypeLabel(
                          resolveClaimSubType({
                            caseKind: 'claim',
                            caseTypeCode: data.caseTypeCode ?? '',
                            claimDetails: data.claimSubType ? { claimSubType: data.claimSubType } : undefined,
                          }),
                        ) || undefined
                      : undefined)
                    ?? caseType?.label
                    ?? data.caseTypeLabel
                    ?? data.lineOfBusiness}
                    </span>
                  </>
                )}
              </span>
              <LozengeTag label={caseStatusShort} type={caseStatusLozengeType} subtle />
            </div>
            <h1 className="text-2xl font-semibold text-text-primary">{data.identification?.caseId ?? data.id}</h1>
          </div>
          <div className="flex items-center gap-2">
            {data.phase === 'post-approval' && data.activeStage === 2 && (
              <button
                type="button"
                onClick={() => {
                  data.activeStage = 3;
                  if (caseSummary) caseSummary.status = 'Active: Recovery Underway';
                  data.caseStatus = 'Active: Recovery Underway';
                  const firstReq = data.requirements.find((r) => r.name === 'Restoration Plan Interview');
                  if (firstReq) {
                    firstReq.status = 'Fulfilled';
                    firstReq.rag = 'Green';
                  }
                  bumpData();
                  setTimeout(() => {
                    const overdueReq = data.requirements.find((r) => r.name === 'Weekly PT Sessions');
                    if (overdueReq) {
                      overdueReq.status = 'Overdue';
                      overdueReq.rag = 'Red';
                    }
                    setOverdueTaskReady(true);
                    setNewTaskBadge(true);
                    bumpData();
                    if (aiActivityEnabled) {
                      setAiActivitySeq({
                        id: `overdue-${Date.now()}`,
                        title: 'AI Crew — Monitoring',
                        stepDelayMs: 800,
                        startedAt: Date.now(),
                        steps: [
                          { id: 'od-detect', label: 'Overdue requirement detected — Weekly PT Sessions', status: 'pending' },
                          { id: 'od-task', label: 'Task created: Follow up on overdue requirement', status: 'pending' },
                        ],
                      });
                    }
                  }, 4000);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#008533] bg-[#e5f5ea] px-3 py-1.5 text-xs font-bold uppercase leading-none tracking-wide text-brand-green transition-colors hover:bg-[#d0edda]"
              >
                <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                CONFIRM PLAN
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setActiveTab('decision');
                setDecisionModalSignal((value) => value + 1);
              }}
              className={`group/dec relative inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase leading-none tracking-wide transition-colors ${
                data.decisionTabState === 'completed'
                  ? 'border border-[#008533] bg-[#e5f5ea] text-brand-green'
                  : data.decisionTabState === 'locked' && data.phase !== 'post-approval'
                    ? 'cursor-not-allowed border border-[#e8eaed] text-[#b7bbc2]'
                    : 'border border-brand-blue text-brand-blue hover:bg-surface-selected'
              }`}
              disabled={false}
            >
              {workflowMeta?.headerActions.find((action) => action.type === 'primary')?.label.toUpperCase() ?? 'DECISION'}
              {data.decisionTabState === 'completed' && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />}
              {data.decisionTabState === 'locked' && data.phase !== 'post-approval' && (
                <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded border border-border-default bg-white px-2.5 py-1.5 text-[11px] font-medium text-text-secondary shadow-[0_4px_10px_rgba(27,28,30,0.12)] group-hover/dec:inline-flex">
                  Requirements must be met before making a decision
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setCreateTaskOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-brand-blue px-3 py-1.5 text-xs font-bold uppercase leading-none tracking-wide text-brand-blue transition-colors hover:bg-surface-selected"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              {workflowMeta?.headerActions.find((action) => action.label.toLowerCase().includes('task'))?.label.toUpperCase() ?? 'CREATE TASK'}
            </button>
          </div>
        </div>
        <div className="mb-3 flex items-start justify-end gap-4">
          {casesAiAssistantEnabled ? (
            <button
              type="button"
              onClick={() => {
                openAiPanel();
              }}
              className="group relative ml-auto flex shrink-0 cursor-pointer items-center gap-3.5 rounded-xl border border-[#e8eaed] bg-white px-5 py-3.5 text-left shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all hover:border-[#d8c7f1] hover:bg-[#fcfbff] hover:shadow-[0_4px_14px_rgba(96,47,160,0.14)] ml-6"
            >
              <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-brand-accent">
                <AiCueSparkle size={13} className="!text-white" spinOnParentHover aria-hidden />
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-[9px] font-normal tracking-wide text-text-muted">amplify</span>
                <span className="text-[13px] font-bold text-brand-accent">Assistant</span>
              </span>
              <ChevronRight className="h-5 w-5 text-brand-accent transition-colors group-hover:text-brand-accent-hover" strokeWidth={2} />
            </button>
          ) : null}
        </div>
        <div className="mb-4 rounded-lg border border-[#e8eaed] bg-white">
          {workflowContextSlots.length ? (
            <div className="flex items-stretch rounded-t-lg bg-white">
              {workflowContextSlots.map((slot, index) => (
                <div key={slot.slot} className="contents">
                  <div className="flex flex-1 flex-col justify-center px-5 py-3">
                    <SectionLabel>{slot.label}</SectionLabel>
                    <span className={`text-[15px] font-semibold ${richValueClass(slot.valueColor)}`}>{slot.value}</span>
                    {slot.sub ? (
                      <span className={`mt-0.5 text-[11px] ${slot.subType === 'reference_link' ? 'text-brand-blue underline underline-offset-2' : 'text-text-muted'}`}>
                        {slot.sub}
                      </span>
                    ) : null}
                  </div>
                  {index < workflowContextSlots.length - 1 ? <div className="w-px self-stretch bg-[#e8eaed]" /> : null}
                </div>
              ))}
            </div>
          ) : null}
          <div className={`${workflowContextSlots.length ? 'hidden' : 'flex'} items-stretch rounded-t-lg bg-white`}>
          <div className="flex flex-1 flex-col justify-center px-4 py-3">
            <SectionLabel>{primaryPartyMetric?.label ?? 'Applicant'}</SectionLabel>
            <span className="text-[15px] font-semibold text-text-primary">{primaryPartyMetric?.value ?? primaryPartyDisplayName}</span>
          </div>
          <div className="w-px self-stretch bg-[#e8eaed]" />
          <div className="flex flex-1 flex-col justify-center px-4 py-3">
            <SectionLabel>{planMetric?.label ?? 'Plan'}</SectionLabel>
            <span className="text-[15px] font-semibold text-text-primary">{planMetric?.value ?? productMetric?.value ?? data.productName}</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="mt-0.5 inline-flex items-center gap-1 text-xs text-brand-blue underline underline-offset-2 hover:underline">
              {data.policyNumber}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="w-px self-stretch bg-[#e8eaed]" />
          <div
            className="group/benefit relative flex flex-1 flex-col justify-center px-4 py-3"
            onMouseEnter={() => setBenefitSeen(true)}
          >
            <SectionLabel>{benefitMetric?.label ?? 'Monthly Benefit'}</SectionLabel>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-text-primary">
                {benefitIncrease
                  ? currency.format(6562)
                  : currency.localize(benefitMetric?.value ?? data.monthlyBenefit)}
              </span>
              {benefitIncrease && (
                <span className={`inline-flex items-center gap-1 text-[15px] font-bold text-[#a36d00] ${!benefitSeen ? 'animate-pulse' : ''}`}>
                  ↑ +{currency.format(312)} · 5%
                </span>
              )}
            </div>
            {benefitIncrease && (
              <div className={`pointer-events-none absolute left-0 top-full z-[60] mt-1 w-[280px] rounded-lg border border-border-soft bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ${benefitPopupForced ? 'block' : 'hidden group-hover/benefit:block'}`}>
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="inline-flex h-[6px] w-[6px] rounded-full bg-[#f5a200]" />
                  <span className="text-[11px] font-bold text-[#a36d00]">Benefit Change Detected</span>
                </div>
                <p className="mb-2 text-[10px] leading-snug text-text-secondary">Automatically detected via eLISSIA policy administration system.</p>
                <dl className="space-y-1 text-[11px]">
                  <div className="flex justify-between"><dt className="text-text-muted">Effective Date</dt><dd className="font-semibold text-text-primary">Apr 1, 2026</dd></div>
                  <div className="flex justify-between"><dt className="text-text-muted">Reason</dt><dd className="font-semibold text-text-primary">CPI indexation — auto-applied</dd></div>
                  <div className="flex justify-between"><dt className="text-text-muted">Previous Amount</dt><dd className="text-text-primary">{currency.format(6250)}</dd></div>
                  <div className="flex justify-between"><dt className="text-text-muted">New Amount</dt><dd className="font-semibold text-brand-green">{currency.format(6562)}</dd></div>
                  <div className="flex justify-between"><dt className="text-text-muted">Increase</dt><dd className="font-semibold text-brand-green">+{currency.format(312)} (5%)</dd></div>
                </dl>
                <a href="#" onClick={(e) => e.preventDefault()} className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-blue underline underline-offset-2 hover:underline">
                  View in eLISSIA <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
          <div className="w-px self-stretch bg-[#e8eaed]" />
          <div className="flex flex-1 flex-col justify-center px-4 py-3">
            <SectionLabel>SLA</SectionLabel>
            <span className="flex items-center gap-1.5 text-[15px] font-semibold text-text-primary">
              <Clock className="h-4 w-4 text-text-muted" />
              {data.contextCard?.sla?.label ?? caseSummary?.sla ?? '—'}
            </span>
          </div>
          
        </div>
          <div className="h-px w-full bg-[#e8eaed]" />
          {workflowMeta?.subwayStages?.length ? <WorkflowMetaSubway stages={workflowMeta.subwayStages} /> : null}
          <div className={`w-full overflow-visible rounded-b-lg ${isTerminated ? 'bg-surface-muted/60' : 'bg-[rgba(250,250,250,0.8)]'}`}>
            <div className={`${workflowMeta?.subwayStages?.length ? 'hidden' : ''} mx-auto w-full max-w-[1100px] pb-2.5 pt-1.5`}>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col px-[4px]">
                <div ref={stepperViewportRef} className="relative min-w-0 w-full overflow-visible">
                  <div className="min-w-0 w-full overflow-x-clip overflow-y-visible py-1">
                    <div className="flex min-h-[48px] w-full items-center">
                    <TooltipPrimitive.Provider delayDuration={350} skipDelayDuration={200}>

                    {effectivePhase === 'pre-approval' && (
                    <div className="flex w-full shrink-0 min-w-0 flex-col justify-center">
                      <div
                        className="no-scrollbar -mx-1 min-w-0 touch-pan-x overflow-x-auto overflow-y-visible overscroll-x-contain px-1 py-1.5"
                      >
                        <div className="inline-flex min-w-full justify-center">
                          <div ref={preStepClusterRef} className="flex w-max shrink-0 items-center py-0.5">
                      {data.preApprovalStages.map((label, idx) => {
                        const step = idx + 1;
                        const isDone = isTerminated || step < activeStepForPhase || (phaseTransition === 'completing' && step === activeStepForPhase) || (step === activeStepForPhase && data.decisionTabState === 'completed');
                        const isActive = !isTerminated && step === activeStepForPhase && activeStepForPhase <= data.preApprovalStages.length && phaseTransition !== 'completing' && data.decisionTabState !== 'completed';
                        const isDecisionActive = isActive && isDecisionStep;
                        const isDeathClaimWorkflow = data.workflowTemplateId === 'claim-death-benefit';
                        const aiMode = isDeathClaimWorkflow
                          ? step === 2
                            ? 'Semi-auto'
                            : step === 3
                              ? 'Semi-auto'
                              : step === 4
                                ? 'Manual'
                                : null
                          : step === 2
                            ? 'Auto'
                            : step === 3
                              ? 'Semi-auto'
                              : step === 4
                                ? 'Semi-auto'
                                : step === 5
                                  ? 'Manual'
                                  : null;
                        const preTip =
                          data.caseKind === 'new_business'
                            ? getNewBusinessPreApprovalStepTooltip(
                                idx,
                                isDone,
                                isActive,
                                data.decisionTabState,
                                isDecisionStep,
                              )
                            : isDeathClaimWorkflow
                              ? getDeathClaimPreApprovalStepTooltip(
                                  idx,
                                  isDone,
                                  isActive,
                                  data.decisionTabState,
                                  isDecisionStep,
                                )
                              : getPreApprovalStepTooltip(
                                  idx,
                                  isDone,
                                  isActive,
                                  data.decisionTabState,
                                  isDecisionStep,
                                  aiMode,
                                );
                        return (
                          <TooltipPrimitive.Root key={label}>
                            <TooltipPrimitive.Trigger asChild>
                              <div
                                tabIndex={0}
                                className="flex shrink-0 cursor-default items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
                              >
                            {idx > 0 ? (
                              <div
                                className={`mx-1 h-[2px] w-4 shrink-0 transition-colors duration-300 sm:mx-2 sm:w-8 md:mx-3 md:w-10 ${
                                  isDone || (idx < activeStepForPhase || (phaseTransition === 'completing' && idx === activeStepForPhase))
                                    ? isTerminated ? 'bg-[#b7bbc2]' : 'bg-[#008533]'
                                    : 'bg-[#dbdee1]'
                                }`}
                              />
                            ) : null}
                            <div className="flex min-w-0 max-w-[min(100%,11rem)] items-start gap-1.5 sm:max-w-none sm:items-center sm:gap-2">
                              <div className={`relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 sm:mt-0 ${
                                isTerminated
                                  ? 'bg-[#b7bbc2] text-white'
                                  : isDecisionActive
                                    ? 'bg-brand-blue text-white'
                                    : isActive
                                      ? 'bg-brand-blue text-white'
                                      : isDone
                                        ? 'bg-[#008533] text-white'
                                        : 'bg-white border border-[#b7bbc2] text-text-muted'
                              }`}>
                                {!isTerminated && isDecisionActive ? (
                                  <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-blue opacity-60 animate-ping" />
                                ) : !isTerminated && isActive ? (
                                  <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-blue opacity-60 animate-ping" />
                                ) : null}
                                {isDone ? '✓' : step}
                                {!isTerminated && aiMode ? (
                                    <span className="absolute -right-1 -top-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white bg-brand-accent shadow-sm">
                                      <AiCueSparkle size={7} className="!text-white" aria-hidden />
                                    </span>
                                ) : null}
                              </div>
                              <span
                                className={`min-w-0 flex-1 text-sm leading-snug transition-colors duration-300 ${
                                  isTerminated
                                    ? 'text-text-muted'
                                    : isDecisionActive
                                      ? 'font-semibold text-brand-blue'
                                      : isActive
                                        ? 'font-semibold text-text-heading'
                                        : isDone
                                          ? 'font-semibold text-brand-green'
                                          : 'text-text-muted'
                                }`}
                              >
                                <span className="block max-sm:truncate" title={label}>
                                  {label}
                                </span>
                                {!isTerminated && isDecisionActive ? (
                                  <span className="mt-1 inline-flex rounded-full bg-surface-selected px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-blue sm:ml-1.5 sm:mt-0">
                                    Ready
                                  </span>
                                ) : !isTerminated && isActive ? (
                                  <span className="mt-1 inline-flex rounded-full bg-surface-selected px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-blue sm:ml-1.5 sm:mt-0">
                                    Pending
                                  </span>
                                ) : null}
                              </span>
                            </div>
                              </div>
                            </TooltipPrimitive.Trigger>
                            <TooltipPrimitive.Portal>
                              <TooltipPrimitive.Content
                                side="top"
                                align="center"
                                sideOffset={10}
                                collisionPadding={16}
                                className="z-[300] max-w-[min(288px,calc(100vw-32px))] rounded-lg border border-[#e8eaed] bg-white px-3 py-2.5 text-left shadow-[0_8px_30px_rgba(27,28,30,0.1)] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
                              >
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
                                <p className="mt-1.5 text-[11px] leading-relaxed text-text-secondary">
                                  <span className="text-text-secondary">{preTip.title}</span>
                                  {' — '}
                                  {preTip.body}
                                </p>
                              </TooltipPrimitive.Content>
                            </TooltipPrimitive.Portal>
                          </TooltipPrimitive.Root>
                        );
                      })}
                          </div>
                        </div>
                      </div>
                    </div>
                    )}

                    {effectivePhase === 'post-approval' && (
                    <div className="flex w-full shrink-0 min-w-0 flex-col justify-center">
                      <div
                        className="no-scrollbar -mx-1 min-w-0 touch-pan-x overflow-x-auto overflow-y-visible overscroll-x-contain px-1 py-1.5"
                      >
                        <div className="inline-flex min-w-full justify-center">
                          <div ref={postStepClusterRef} className="flex w-max shrink-0 items-center py-0.5">
                      {data.postApprovalStages.map((label, idx) => {
                        const step = idx + 1;
                        const isDone = isTerminated || step < activeStepForPhase;
                        const isActive = !isTerminated && step === activeStepForPhase && activeStepForPhase >= 1;
                        const postTip = getPostApprovalStepTooltip(idx, isDone, isActive);
                        return (
                          <TooltipPrimitive.Root key={label}>
                            <TooltipPrimitive.Trigger asChild>
                              <div
                                tabIndex={0}
                                className="flex shrink-0 cursor-default items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
                              >
                            {idx > 0 ? (
                              <div
                                className={`mx-1 h-[2px] w-4 shrink-0 transition-colors duration-300 sm:mx-2 sm:w-8 md:mx-3 md:w-10 ${
                                  isDone || idx < activeStepForPhase
                                    ? isTerminated ? 'bg-[#b7bbc2]' : 'bg-[#008533]'
                                    : 'bg-[#dbdee1]'
                                }`}
                              />
                            ) : null}
                            <div className="flex min-w-0 max-w-[min(100%,11rem)] items-start gap-1.5 sm:max-w-none sm:items-center sm:gap-2">
                              <div className={`relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 sm:mt-0 ${
                                isTerminated
                                  ? 'bg-[#b7bbc2] text-white'
                                  : isActive
                                    ? 'bg-brand-blue text-white'
                                    : isDone
                                      ? 'bg-[#008533] text-white'
                                      : 'bg-white border border-[#b7bbc2] text-text-muted'
                              }`}>
                                {!isTerminated && isActive && (
                                  <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-blue opacity-60 animate-ping" />
                                )}
                                {isDone ? '✓' : step}
                              </div>
                              <span
                                className={`min-w-0 flex-1 text-sm leading-snug transition-colors duration-300 ${
                                  isTerminated
                                    ? 'text-text-muted'
                                    : isActive
                                      ? 'font-semibold text-text-heading'
                                      : isDone
                                        ? 'font-semibold text-brand-green'
                                        : 'text-text-muted'
                                }`}
                              >
                                <span className="block max-sm:truncate" title={label}>
                                  {label}
                                </span>
                                {!isTerminated && isActive && (
                                  <span className="mt-1 inline-flex rounded-full bg-surface-selected px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-blue sm:ml-1.5 sm:mt-0">
                                    Pending
                                  </span>
                                )}
                              </span>
                            </div>
                              </div>
                            </TooltipPrimitive.Trigger>
                            <TooltipPrimitive.Portal>
                              <TooltipPrimitive.Content
                                side="top"
                                align="center"
                                sideOffset={10}
                                collisionPadding={16}
                                className="z-[300] max-w-[min(288px,calc(100vw-32px))] rounded-lg border border-[#e8eaed] bg-white px-3 py-2.5 text-left shadow-[0_8px_30px_rgba(27,28,30,0.1)] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
                              >
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
                                <p className="mt-1.5 text-[11px] leading-relaxed text-text-secondary">
                                  <span className="text-text-secondary">{postTip.title}</span>
                                  {' — '}
                                  {postTip.body}
                                </p>
                              </TooltipPrimitive.Content>
                            </TooltipPrimitive.Portal>
                          </TooltipPrimitive.Root>
                        );
                      })}
                          </div>
                        </div>
                      </div>
                    </div>
                    )}
                    </TooltipPrimitive.Provider>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-primary px-6">
        <ModuleTabsBar
          tabs={caseTabs}
          activeId={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'tasks') setNewTaskBadge(false);
          }}
        />
      </div>

      <div className={activeTab === 'overview' || activeTab === 'decision' ? 'flex-1 overflow-y-auto p-6' : 'flex min-h-0 flex-1 flex-col'}>
        {activeTab === 'decision' && (
          <DecisionTab
            caseData={data}
            decisionTabState={data.decisionTabState}
            openSignal={decisionModalSignal}
            onDecisionRecorded={(decision) => {
              data.humanDecision = decision;
              data.decisionTabState = 'completed';
              if (data.phase === 'pre-approval' && data.preApprovalStages.length > 0) {
                data.activeStage = data.preApprovalStages.length;
              }
              const label = decision.decisionOutcome?.title ?? decision.decisionTitle ?? (decision.decisionType === 'approve' ? 'Approved' : decision.decisionType === 'decline' ? 'Declined' : decision.decisionType === 'close_case' ? 'Recovery Complete' : decision.decisionType === 'modified_offer' ? 'Modified Offer' : 'Info Requested');
              if (caseSummary) caseSummary.status = `Closed: ${label}`;
              data.caseStatus = `Closed: ${label}`;
              setActiveTab('decision');
              bumpData();
              if (aiActivityEnabled && caseId === 'IP26-5546112' && decision.decisionType === 'approve') {
                setTimeout(() => {
                  setAiActivitySeq({
                    id: `decision-${Date.now()}`,
                    title: 'AI Crew — Post-Approval Setup',
                    stepDelayMs: 800,
                    startedAt: Date.now(),
                    steps: [
                      { id: 'create-case', label: 'Creating post-approval case IP26-5546200', status: 'pending' },
                      { id: 'nc-restore', label: 'Building restoration plan & generating requirements', status: 'pending' },
                      { id: 'nc-schedule', label: 'Scheduling client meeting — 3 time slots proposed', status: 'pending' },
                      { id: 'nc-confirm', label: 'Billy Bud confirmed preferred time slot', status: 'pending' },
                      { id: 'nc-task', label: 'Task created: Review proposed appointment — validate meeting time', status: 'pending' },
                    ],
                  });
                }, 500);
              }
            }}
            onOpenAIFactors={() => {
              if (!casesAiAssistantEnabled) return;
              openAiPanel();
              setAiPanelTab('factors');
            }}
          />
        )}
        {['licensing', 'contracts', 'activation'].includes(activeTab) && (
          <div className="rounded-xl border border-border-default bg-white p-6">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Case type anatomy
            </p>
            <h2 className="mt-2 text-xl font-semibold text-text-primary">{resolveCaseWorkspaceTabLabel(activeTab, caseAnatomy)}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
              This tab is enabled by the {data.caseTypeLabel} business-line anatomy. The full tab content renderer is the next step; for now this confirms the runtime can conditionally expose case-type-specific features.
            </p>
          </div>
        )}
        {activeTab === 'overview' && (
          <div className="max-w-[1200px] space-y-4">
            {hasRichGeneralInfo && data.generalInformation?.aiSummary ? (
              <SidePanelAiSummary
                text={data.generalInformation.aiSummary.text}
                confidence={data.generalInformation.aiSummary.confidence}
                generatedAt={data.generalInformation.aiSummary.generatedAt}
              />
            ) : null}
            {hasRichGeneralInfo ? (
              <GeneralInformationRichView
                cards={richGeneralInfoCards}
                collapsibles={richGeneralInfoCollapsibles}
                scoring={scoringDraft}
                onScoreAdd={(type) => openScoreModal(type)}
                onScoreFullView={() => setActiveTab('scoring')}
                onScoreRowClick={(row) => openScoreModal(row.type, row)}
              />
            ) : null}
            {!hasRichGeneralInfo && data.facts?.find((fact) => fact.id.includes('initial-fact') || fact.label.toLowerCase().includes('initial briefing')) ? (
              <div className="rounded-lg border border-brand-blue/20 bg-brand-blue/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-blue">Initial briefing</p>
                <p className="mt-2 text-sm leading-relaxed text-text-primary">
                  {data.facts.find((fact) => fact.id.includes('initial-fact') || fact.label.toLowerCase().includes('initial briefing'))?.value}
                </p>
              </div>
            ) : null}
            {!hasRichGeneralInfo && data.aiNarrative ? (
              <SidePanelAiSummary variant="accent" text={data.aiNarrative} confidence={data.aiConfidence ?? undefined} />
            ) : null}
            {!hasRichGeneralInfo && structuredGeneralSections.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {structuredGeneralSections.map((section) => (
                  <div key={section.id} className="rounded-lg border border-border-default bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">{section.label}</p>
                    {section.description ? <p className="mt-1 text-xs text-text-secondary">{section.description}</p> : null}
                    <CaseInfoGrid
                      columns="grid-cols-1 sm:grid-cols-2"
                      className={section.description ? 'mt-4' : 'mt-3'}
                      fields={section.fields
                        .filter((field) => field.enabled !== false)
                        .map((field) => ({
                          label: field.label,
                          value: field.value,
                          muted: field.muted,
                        }))}
                    />
                    {section.subsections?.filter((subsection) => subsection.enabled !== false).map((subsection) => (
                      <div key={subsection.id} className="mt-4 border-t border-border-soft pt-4">
                        <p className="mb-3 text-xs font-semibold text-text-heading">{subsection.label}</p>
                        <CaseInfoGrid
                          columns="grid-cols-1 sm:grid-cols-2"
                          fields={subsection.fields
                            .filter((field) => field.enabled !== false)
                            .map((field) => ({ label: field.label, value: field.value, muted: field.muted }))}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : !hasRichGeneralInfo && data.caseKind && data.caseKind !== 'claim' && caseAnatomy?.overviewSections?.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {caseAnatomy.overviewSections.map((section) => (
                  <div key={section.id} className="rounded-lg border border-border-default bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">{section.label}</p>
                    <CaseInfoGrid
                      columns="grid-cols-1 sm:grid-cols-2"
                      className="mt-3"
                      fields={section.fields.map((field) => ({
                        label: field,
                        value: data.facts?.find((fact) => fact.id === field || fact.label.toLowerCase() === field.toLowerCase())?.value ?? '-',
                        muted: true,
                      }))}
                    />
                  </div>
                ))}
              </div>
            ) : null}
            {!hasRichGeneralInfo && !structuredGeneralSections.length ? <div className="rounded-lg border border-border-default bg-white p-4">
              <button
                type="button"
                onClick={() => toggleSection('claimantPlan')}
                className="flex w-full items-center justify-between text-left"
              >
                <h3 className="text-base font-semibold text-text-heading">
                  {data.sections?.[0]?.label ?? 'Claimant & Plan'}
                </h3>
                {expandedSections.claimantPlan ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {expandedSections.claimantPlan ? (
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-text-heading">
                      {data.primaryPartyLabel ?? 'Claimant'}
                    </h4>
                    <CaseInfoGrid
                      columns="grid-cols-1 sm:grid-cols-2"
                      fields={[
                        { label: 'Name', value: primaryPartyDisplayName },
                        { label: 'Gender', value: data.claimantProfile.gender, muted: true },
                        { label: 'DOB', value: data.claimantProfile.dob, muted: true },
                        { label: 'Smoking', value: data.claimantProfile.smoker, muted: true },
                        { label: 'Location', value: data.claimantProfile.location, muted: true },
                        { label: 'Email', value: data.claimantProfile.email, muted: true },
                        { label: 'Phone', value: data.claimantProfile.phone, muted: true },
                      ]}
                    />
                  </div>
                  <div className="border-t border-border-soft pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                    <h4 className="mb-3 text-sm font-semibold text-text-heading">
                      {data.caseKind && data.caseKind !== 'claim' ? 'Case context' : 'Plan'}
                    </h4>
                    <CaseInfoGrid
                      columns="grid-cols-1 sm:grid-cols-2"
                      fields={[
                        { label: 'Name', value: data.productName },
                        {
                          label: 'Policy',
                          value: (
                            <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex min-w-0 items-center gap-1 text-brand-blue underline underline-offset-2 hover:underline">
                              {data.policyNumber} <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          ),
                        },
                        { label: 'Type', value: data.productType, muted: true },
                        { label: data.caseKind && data.caseKind !== 'claim' ? 'Financial value' : 'Monthly Benefit', value: currency.localize(data.monthlyBenefit) },
                        { label: data.caseKind && data.caseKind !== 'claim' ? 'Target outcome' : 'Claim End Date', value: data.claimEndDate, muted: true },
                      ]}
                    />
                  </div>
                  <div className="border-t border-border-soft pt-6 lg:col-span-2">
                    <h4 className="mb-3 text-sm font-semibold text-text-heading">{data.caseTypeLabel} information</h4>
                    <CaseInfoGrid
                      fields={
                        data.caseKind && data.caseKind !== 'claim' && data.facts?.length
                          ? data.facts.map((fact) => ({
                              label: fact.label,
                              value: fact.value,
                              muted: fact.importance !== 'primary',
                            }))
                          : [
                              { label: 'Claim number', value: data.claimNumber },
                              { label: 'Date of loss', value: data.dateOfLoss, muted: true },
                              { label: 'Disability onset', value: data.disabilityOnset, muted: true },
                              { label: 'Cause', value: data.cause, muted: true },
                              { label: 'Pre-existing conditions', value: data.preExistingConditions, muted: true },
                            ]
                      }
                    />
                  </div>
                </div>
              ) : null}
            </div> : null}

            {!hasRichGeneralInfo && !structuredGeneralSections.length ? [
              ['insured', 'Insured', 'Include client information and coverage'],
              ['beneficiary', 'Beneficiary', ''],
              ['benefits', 'Paid & Planned Benefits', ''],
            ].map(([key, title, subtitle]) => {
              const k = key as keyof typeof expandedSections;
              return (
                <div key={key} className="rounded-lg border border-border-default bg-white">
                  <button onClick={() => toggleSection(k)} className="flex w-full items-center justify-between px-4 py-3">
                    <div>
                      <div className="text-left text-sm font-semibold text-text-heading">{title}</div>
                      {subtitle ? <div className="text-left text-xs text-text-muted">{subtitle}</div> : null}
                    </div>
                    {expandedSections[k] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {expandedSections[k] && (
                    <div className="p-4 text-sm">
                      {k === 'benefits' && (
                        <div className="grid grid-cols-2 gap-4">
                          <table className="w-full text-sm"><thead><tr className="border-b border-border-default"><th className="pb-2 text-left font-medium text-text-secondary">Date Paid</th><th className="pb-2 text-right font-medium text-text-secondary">Amount</th></tr></thead><tbody>{data.paidBenefits.map((row) => <tr key={row.date} className="border-b border-border-divider"><td className="py-2">{row.date}</td><td className="py-2 text-right">{currency.localize(row.amount)}</td></tr>)}</tbody></table>
                          <table className="w-full text-sm"><thead><tr className="border-b border-border-default"><th className="pb-2 text-left font-medium text-text-secondary">Payment Date</th><th className="pb-2 text-right font-medium text-text-secondary">Amount</th></tr></thead><tbody>{data.plannedBenefits.map((row) => <tr key={row.date} className="border-b border-border-divider"><td className="py-2">{row.date}</td><td className="py-2 text-right">{currency.localize(row.amount)}</td></tr>)}</tbody></table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }) : null}
          </div>
        )}

        {activeTab !== 'overview' && activeTab !== 'decision' && (
          <div className="flex min-h-0 flex-1 flex-col bg-white">
            <div className="border-b border-border-default bg-surface-primary px-6 py-3">
              <div className="flex items-center justify-between gap-4">
                {activeTab === 'tasks' || activeTab === 'documents' || activeTab === 'requirements' ? (
                  <SearchBar
                    containerClassName="min-w-0 flex-1 md:max-w-none"
                    value={tabSearchQueries[activeTab] ?? ''}
                    onChange={(value) => setTabSearchQueries((prev) => ({ ...prev, [activeTab]: value }))}
                    placeholder={
                      activeTab === 'tasks'
                        ? 'Search tasks…'
                        : activeTab === 'documents'
                          ? 'Search documents…'
                          : 'Search requirements…'
                    }
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                ) : (
                  <div className="shrink-0">
                    <h3 className="text-base font-semibold text-text-heading">
                      {resolveCaseWorkspaceTabLabel(activeTab, caseAnatomy)}
                    </h3>
                  </div>
                )}
                <div className="flex shrink-0 items-center gap-3">
                  {activeStageOptions.length > 0 ? (
                    <FilterDropdown
                      label="Stage"
                      options={['All', ...activeStageOptions]}
                      value={stageFilters[activeTab] || 'All'}
                      onChange={(value) => setStageFilters((prev) => ({ ...prev, [activeTab]: value === 'All' ? '' : value }))}
                    />
                  ) : null}
                  {activeTab === 'requirements' && (
                    <button
                      type="button"
                      onClick={() => setShowAddReqModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand-blue px-3 py-1.5 text-xs font-semibold leading-none text-brand-blue transition-colors hover:bg-surface-selected"
                    >
                      <Plus className="h-3 w-3" />
                      ADD REQUIREMENT
                    </button>
                  )}
                  {activeTab === 'documents' && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue transition-colors hover:bg-surface-selected"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      ADD DOCUMENT
                    </button>
                  )}
                  {activeTab !== 'scoring' ? (
                  <div className="overflow-hidden rounded-full border border-border-default bg-white p-0.5">
                    <button
                      onClick={() => setTabViews((prev) => ({ ...prev, [activeTab]: 'table' }))}
                      className={`rounded-full p-1.5 ${tabViews[activeTab as Exclude<CaseTab, 'overview' | 'decision'>] === 'table' ? 'bg-brand-blue text-white' : 'text-text-secondary hover:bg-surface-muted'}`}
                      title="Table view"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setTabViews((prev) => ({ ...prev, [activeTab]: 'list' }))}
                      className={`rounded-full p-1.5 ${tabViews[activeTab as Exclude<CaseTab, 'overview' | 'decision'>] === 'list' ? 'bg-brand-blue text-white' : 'text-text-secondary hover:bg-surface-muted'}`}
                      title="List view"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                  </div>
                  ) : null}
                </div>
              </div>
              {activeTab === 'requirements' ? (
                <div className="mt-3 flex flex-wrap items-center gap-5 border-t border-border-soft pt-3">
                  {[
                    { label: 'Complete', value: `${requirementCompletionPct}%`, className: 'text-brand-green' },
                    { label: 'Attention', value: requirementKpis.needsAttention, className: requirementKpis.needsAttention > 0 ? 'text-brand-red' : 'text-text-primary' },
                    { label: 'Progress', value: requirementKpis.ordered, className: 'text-brand-blue' },
                    { label: 'Completed', value: requirementKpis.completed, className: 'text-brand-green' },
                    { label: 'Total', value: requirementTotalCount, className: 'text-text-primary' },
                  ].map((item) => (
                    <div key={item.label} className="min-w-[56px] text-center">
                      <p className={`text-[14px] font-semibold leading-none ${item.className}`}>{item.value}</p>
                      <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.35px] text-text-muted">{item.label}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {activeTab === 'scoring' && (
              <UnderwritingScoringTab
                caseId={data.id}
                scoring={scoringDraft}
                onChange={updateScoring}
                onOpenScoreModal={openScoreModal}
              />
            )}

            {(activeTab === 'tasks' && tabViews.tasks === 'table') && (
              <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden bg-white">
                <div
                  ref={setDocumentsTableScrollEl}
                  className={moduleTableScrollContainerClass(hasHorizontalOverflow, 'flex-1')}
                >
                  <table className="w-full border-separate border-spacing-0">
                    <thead className="sticky top-0 z-[1] bg-surface-primary">
                      <tr>
                        <th
                          className={`relative min-w-[220px] w-[240px] border-b border-border-default bg-surface-primary pl-6 pr-2 py-3 text-left align-middle text-sm font-medium text-text-secondary sticky left-0 z-[6] ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                        >
                          {showLeftStickyEdge ? (
                            <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                          ) : null}
                          Task
                        </th>
                        <th className="border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle whitespace-nowrap">
                          <SummaryTableColumnHeader className="text-sm font-medium text-text-secondary" />
                        </th>
                        <th className="border-b border-border-default bg-surface-primary px-2 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Stage</th>
                        <th className="border-b border-border-default bg-surface-primary px-2 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Priority</th>
                        <th className="border-b border-border-default bg-surface-primary px-2 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Due Date</th>
                        <th className="border-b border-border-default bg-surface-primary px-2 py-3 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Assignee</th>
                        <th
                          className={`relative border-b border-border-default bg-surface-primary py-3 pl-2 pr-2 text-left align-middle text-sm font-medium text-text-secondary sticky right-[64px] z-[6] ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                        >
                          {showRightStickyEdge ? (
                            <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                          ) : null}
                          Status
                        </th>
                        <th className="relative h-12 w-[64px] min-h-12 min-w-[64px] max-w-[64px] bg-surface-primary p-0 align-middle sticky right-0 z-[7]">
                          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-[9] h-full min-h-12 w-[calc(100%+3px)] border-b border-border-default bg-surface-primary" />
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchedTasks.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <ListChecks className="h-8 w-8 text-[#dbdee1]" />
                              <p className="text-sm font-medium text-text-muted">
                                {contextualTasks.length === 0 ? 'No tasks yet' : 'No tasks match your search'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                      {searchedTasks.map((row) => {
                        const resolved = row.task ?? resolveTaskForCaseContextRow(row, data);
                        const selected = selectedCaseTask?.id === resolved.id;
                        const statusType = row.status === 'Completed' ? 'Success' as const : row.status === 'In Queue' ? 'Warning' as const : row.status === 'To Do' ? 'Discovery' as const : row.status === 'Overdue' ? 'Alert' as const : 'Neutral' as const;
                        return (
                          <tr
                            key={row.id}
                            data-keep-sidepanel="row"
                            role="button"
                            tabIndex={0}
                            onClick={() => openCaseTaskPanel(resolved)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openCaseTaskPanel(resolved);
                              }
                            }}
                            className={`cursor-pointer border-b border-border-default transition-colors ${selected ? 'bg-surface-selected-alt' : 'bg-white hover:bg-surface-hover'}`}
                          >
                            <td
                              className={`relative min-w-[220px] w-[240px] border-b border-border-default pl-6 pr-2 py-3 align-middle sticky left-0 z-[6] ${selected ? 'bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover'} ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                            >
                              {showLeftStickyEdge ? (
                                <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                              ) : null}
                              <TaskTableFirstColumnCell
                                taskId={resolved.taskId ?? row.id}
                                taskName={row.taskType}
                                aiSourced={Boolean(row.aiGenerated)}
                              />
                            </td>
                            <td className="border-b border-border-default px-2 py-3 text-sm text-text-primary">
                              <span className="line-clamp-2">{row.task?.aiSummary ?? row.task?.description ?? '—'}</span>
                            </td>
                            <td className="border-b border-border-default px-2 py-3 whitespace-nowrap text-sm text-text-primary">
                              {row.stage ? <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-text-secondary">{row.stage}</span> : <span className="text-text-muted">—</span>}
                            </td>
                            <td className="border-b border-border-default px-2 py-3 whitespace-nowrap">
                              <PriorityChip priority={row.priority} />
                            </td>
                            <td className="border-b border-border-default px-2 py-3 whitespace-nowrap text-sm text-text-primary">{row.dueDate}</td>
                            <td className="border-b border-border-default px-2 py-3 whitespace-nowrap text-sm text-text-primary">{row.assignee}</td>
                            <td
                              className={`relative border-b border-border-default py-3 pl-2 pr-2 align-top text-sm sticky right-[64px] z-[6] ${selected ? 'bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover'} ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                            >
                              {showRightStickyEdge ? (
                                <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                              ) : null}
                              <LozengeTag label={row.status} type={statusType} subtle />
                            </td>
                            <td className={`relative box-border min-h-12 w-[64px] min-w-[64px] max-w-[64px] border-b border-border-default p-0 align-middle sticky right-0 z-[7] ${selected ? 'bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover'}`}>
                              <span aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 z-[7] h-full w-[calc(100%+3px)] ${selected ? 'bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover'}`} />
                              <div className="relative z-10 flex h-full min-h-12 items-center justify-center px-1">
                                <MoreVertical className="h-4 w-4 text-text-secondary" />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(activeTab === 'requirements' && tabViews.requirements === 'table') && (
              <div className="min-h-0 flex-1 flex flex-col overflow-hidden bg-white">
                <div
                  ref={setDocumentsTableScrollEl}
                  className={moduleTableScrollContainerClass(hasHorizontalOverflow, 'flex-1')}
                >
                <table className="w-full border-separate border-spacing-0">
                  <thead className="sticky top-0 z-[1] bg-surface-primary">
                    <tr>
                      <th
                        className={`relative min-w-[280px] w-[320px] border-b border-border-default bg-surface-primary pl-6 pr-3 py-2 text-left align-middle text-sm font-medium text-text-secondary sticky left-0 z-[6] ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                      >
                        {showLeftStickyEdge ? (
                          <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                        ) : null}
                        Name
                      </th>
                      <th className="border-b border-border-default bg-surface-primary px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Category</th>
                      <th className="border-b border-border-default bg-surface-primary px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Stage</th>
                      <th className="border-b border-border-default bg-surface-primary px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Due Date</th>
                      <th className="border-b border-border-default bg-surface-primary px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Follow-Up</th>
                      <th className="border-b border-border-default bg-surface-primary px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Source</th>
                      <th className="max-w-[160px] border-b border-border-default bg-surface-primary px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap">Notes</th>
                      <th className="border-b border-border-default bg-surface-primary px-3 py-2 text-left text-sm font-medium text-text-secondary whitespace-nowrap">External Source</th>
                      <th
                        className={`relative border-b border-border-default bg-surface-primary py-2 pl-2 pr-2 text-left align-middle text-sm font-medium text-text-secondary sticky right-[64px] z-[6] ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                      >
                        {showRightStickyEdge ? (
                          <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                        ) : null}
                        Status
                      </th>
                      <th className="relative h-10 w-[64px] min-h-10 min-w-[64px] max-w-[64px] bg-surface-primary p-0 align-middle sticky right-0 z-[7]">
                        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-[9] h-full min-h-10 w-[calc(100%+3px)] border-b border-border-default bg-surface-primary" />
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchedRequirements.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-16 text-center">
                          <p className="text-sm font-medium text-text-muted">
                            {data.requirements.length === 0 ? 'No requirements yet' : 'No requirements match your search'}
                          </p>
                        </td>
                      </tr>
                    ) : null}
                    {searchedRequirements.map((row) => {
                    const isFulfilled = row.status === 'Fulfilled' || row.status === 'Waived';
                    const isAmber = row.rag === 'Amber' && !isFulfilled;
                    const rowBg = 'bg-white';
                    const textClass = isFulfilled ? 'text-text-muted' : 'text-text-primary';
                    const isSelected = selectedRequirement?.id === row.id;
                    return (
                    <tr
                      key={row.id}
                      data-keep-sidepanel="row"
                      role="button"
                      tabIndex={0}
                      onClick={() => openRequirementPanel(row)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRequirementPanel(row); }
                      }}
                    className={`border-b border-border-default ${isSelected ? 'bg-surface-selected-alt' : rowBg} group cursor-pointer hover:bg-surface-hover`}
                    >
                      <td className={`relative min-w-[280px] w-[320px] border-b border-border-default pl-6 pr-3 py-3 align-middle text-sm ${isFulfilled ? 'font-normal' : 'font-medium'} ${textClass} sticky left-0 z-[6] ${isSelected ? 'bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover'} ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}>
                        {showLeftStickyEdge ? (
                          <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                        ) : null}
                        <TableFirstColumnContent aiSourced={isRequirementAiSourced(row.source)} className="break-words">
                          {row.name}
                        </TableFirstColumnContent>
                      </td>
                      <td className={`border-b border-border-default bg-inherit whitespace-nowrap px-3 py-3 text-sm ${textClass}`}>{row.category}</td>
                      <td className={`border-b border-border-default bg-inherit whitespace-nowrap px-3 py-3 text-sm ${textClass}`}>
                        {row.stage ? <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-text-secondary">{row.stage}</span> : <span className="text-text-muted">—</span>}
                      </td>
                      <td className={`border-b border-border-default bg-inherit whitespace-nowrap px-3 py-3 text-sm ${textClass}`}>{row.dueDate}</td>
                      <td className={`border-b border-border-default bg-inherit whitespace-nowrap px-3 py-3 text-sm ${textClass}`}>{row.followUpDate}</td>
                      <td className="border-b border-border-default bg-inherit px-3 py-3 text-sm">
                        <span className="group relative">
                          <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            row.source === 'ai_rule_engine' ? 'bg-brand-accent-light text-brand-accent' :
                            row.source === 'id_verification' ? 'bg-surface-selected text-brand-blue' :
                            'bg-surface-muted text-text-secondary'
                          }`}>
                            {row.source === 'ai_rule_engine' ? 'AI Rule Engine' :
                             row.source === 'id_verification' ? 'ID Verification' :
                             row.source === 'employer_portal' ? 'Employer Portal' :
                             row.source === 'pharmacy_check' ? 'Pharmacy Check' :
                             row.source}
                          </span>
                          {row.source === 'ai_rule_engine' && (
                            <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded border border-border-default bg-white px-2.5 py-1.5 text-[11px] font-medium text-text-secondary shadow-[0_4px_10px_rgba(27,28,30,0.12)] group-hover:inline-flex">
                              Created by the AI rule engine based on the restoration plan
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="max-w-[160px] border-b border-border-default bg-inherit px-3 py-3 text-sm">
                        {row.notes ? (
                          <span className="block truncate text-[12px] text-text-secondary" title={row.notes}>{row.notes}</span>
                        ) : (
                          <span className="text-[12px] text-[#b7bbc2]">—</span>
                        )}
                      </td>
                      <td className="border-b border-border-default bg-inherit px-3 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={requirementExternalHref(data.id, row)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 whitespace-nowrap font-mono text-[13px] font-medium text-brand-blue underline decoration-brand-blue/25 underline-offset-2 hover:decoration-brand-blue"
                          title="Open in external source"
                        >
                          {requirementExternalCode(row)}
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                        </a>
                      </td>
                      <td className={`relative border-b border-border-default py-3 pl-2 pr-2 align-top text-sm sticky right-[64px] z-[6] ${isSelected ? 'bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover'} ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}>
                        {showRightStickyEdge ? (
                          <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                        ) : null}
                        <LozengeTag
                          label={row.status}
                          type={
                            row.status === 'Fulfilled' || row.status === 'Waived' || row.status === 'Completed' ? 'Success'
                            : row.status === 'Overdue' ? 'Alert'
                            : row.status === 'Pending' ? 'Discovery'
                            : 'Neutral'
                          }
                          subtle
                        />
                      </td>
                      <td className={`relative box-border min-h-12 w-[64px] min-w-[64px] max-w-[64px] border-b border-border-default p-0 align-middle sticky right-0 z-[7] ${isSelected ? 'bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover'}`} onClick={(e) => e.stopPropagation()}>
                        <span aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 z-[7] h-full w-[calc(100%+3px)] ${isSelected ? 'bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover'}`} />
                        <div className="relative z-10 flex h-full min-h-12 items-center justify-center px-1">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() => setReqKebabOpen(reqKebabOpen === row.id ? null : row.id)}
                            className="rounded p-1 text-text-secondary hover:bg-surface-muted"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {reqKebabOpen === row.id && (
                            <>
                              <div className="fixed inset-0 z-[10]" onClick={() => setReqKebabOpen(null)} />
                              <div className="absolute right-0 top-full z-[20] mt-1 w-[140px] overflow-hidden rounded-lg border border-border-default bg-white py-1 shadow-[0_8px_24px_rgba(27,28,30,0.12)]">
                                <button type="button" onClick={() => { setReqKebabOpen(null); setEditingReq(row); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-muted">
                                  <Pencil className="h-3.5 w-3.5 text-text-secondary" /> Edit
                                </button>
                                <button type="button" onClick={() => {
                                  const result = deleteEntity(dataSource.activeDatasetId, { kind: 'requirement', id: row.datasetRequirementId ?? String(row.id), label: row.name });
                                  updateDataSource({ activeDatasetId: result.datasetId });
                                  data.requirements = data.requirements.filter((r) => r.id !== row.id);
                                  setReqKebabOpen(null);
                                  bumpData();
                                }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand-red hover:bg-[#fde5e4]">
                                  <Trash2 className="h-3.5 w-3.5" /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                        </div>
                      </td>
                    </tr>
                  );})}</tbody>
                </table>
                </div>
              </div>
            )}

            {(activeTab === 'communications' && tabViews.communications === 'table') && (
              <div
                ref={setDocumentsTableScrollEl}
                className={moduleTableScrollContainerClass(hasHorizontalOverflow, 'flex-1 bg-white')}
              >
                <table className="w-full">
                  <thead className="sticky top-0 z-[1] bg-surface-primary"><tr className="border-b border-border-default">
                    <th className="w-10 pl-6 pr-3 py-2 text-left"><Checkbox className="size-4 rounded-[4px]" /></th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-text-secondary">Date</th><th className="px-3 py-2 text-left text-sm font-medium text-text-secondary">Stage</th><th className="px-3 py-2 text-left text-sm font-medium text-text-secondary">Channel</th><th className="px-3 py-2 text-left text-sm font-medium text-text-secondary">Direction</th><th className="px-3 py-2 text-left text-sm font-medium text-text-secondary">Contact</th><th className="px-3 py-2 text-left align-middle"><SummaryTableColumnHeader className="text-sm font-medium text-text-secondary" /></th><th className="px-3 py-2 text-left text-sm font-medium text-text-secondary">Assignee</th>
                  </tr></thead>
                  <tbody>{stagedCommunications.map((row, idx) => (
                    <tr key={`${row.date}-${idx}`} className="border-b border-border-default bg-white hover:bg-surface-hover">
                      <td className="pl-6 pr-3 py-3 text-sm"><Checkbox className="size-4 rounded-[4px]" /></td><td className="px-3 py-3 text-sm">{row.date}</td><td className="px-3 py-3 text-sm">{row.stage ? <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-text-secondary">{row.stage}</span> : '—'}</td><td className="px-3 py-3 text-sm">{row.channel}</td><td className="px-3 py-3 text-sm">{row.direction}</td><td className="px-3 py-3 text-sm">{row.contact}</td><td className="px-3 py-3 text-sm">{row.summary}</td><td className="px-3 py-3 text-sm">{row.owner}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}

            {(activeTab === 'documents' && tabViews.documents === 'table') && (
              <div
                ref={setDocumentsTableScrollEl}
                className={moduleTableScrollContainerClass(hasHorizontalOverflow, 'flex-1 bg-white')}
              >
                {/*
                  Column order matches Tasks/Documents modules: scrollable middle, then Status + Actions
                  stickied on the right. Right sticky cells must be last in DOM order or they overlap
                  middle columns when scrolling.
                */}
                <table className="w-full border-separate border-spacing-0">
                  <thead className="sticky top-0 z-[1] bg-surface-primary">
                    <tr>
                      <th
                        className={`relative min-w-[240px] w-[280px] max-w-[320px] border-b border-border-default bg-surface-primary pl-6 pr-2 py-3 text-left align-middle text-sm font-normal text-text-secondary sticky left-0 z-[6] ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                      >
                        {showLeftStickyEdge ? (
                          <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                        ) : null}
                        Document
                      </th>
                      <th className="border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle text-sm font-normal text-text-secondary">
                        Category
                      </th>
                      <th className="border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle text-sm font-normal text-text-secondary">
                        Stage
                      </th>
                      <th className="min-w-[260px] max-w-[320px] border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle">
                        <SummaryTableColumnHeader className="text-sm font-normal leading-[20px] text-text-secondary" />
                      </th>
                      <th className="border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle text-sm font-normal text-text-secondary">
                        Uploaded
                      </th>
                      <th className="border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle text-sm font-normal text-text-secondary">
                        Source
                      </th>
                      <th className="min-w-[200px] border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle text-sm font-normal text-text-secondary">
                        Requirement
                      </th>
                      <th
                        className={`relative border-b border-border-default bg-surface-primary py-3 pl-2 pr-2 text-left align-middle text-sm font-normal text-text-secondary sticky right-[96px] z-[6] ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                      >
                        {showRightStickyEdge ? (
                          <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                        ) : null}
                        Status
                      </th>
                      {/* Match TaskModule: dedicated actions column header is visually empty; bleed masks subpixel sticky gaps */}
                      <th className="relative h-12 w-[96px] min-h-12 min-w-[96px] max-w-[96px] bg-surface-primary p-0 align-middle sticky right-0 z-[7]">
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-y-0 left-0 z-[9] h-full min-h-12 w-[calc(100%+3px)] border-b border-border-default bg-surface-primary"
                        />
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchedDocuments.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-16 text-center">
                          <p className="text-sm font-medium text-text-muted">
                            {documents.length === 0 ? 'No documents yet' : 'No documents match your search'}
                          </p>
                        </td>
                      </tr>
                    ) : null}
                    {searchedDocuments.map((row) => (
                      <tr
                        key={row.name}
                        data-keep-sidepanel="row"
                        role="button"
                        tabIndex={0}
                        onClick={() => openCaseDocumentPanel(row)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openCaseDocumentPanel(row);
                          }
                        }}
                        className={`group cursor-pointer transition-colors ${selectedCaseDocument?.name === row.name ? 'bg-surface-selected-alt' : 'bg-white hover:bg-surface-hover'}`}
                      >
                        <td
                          className={`relative min-w-[240px] w-[280px] max-w-[320px] border-b border-border-default pl-6 pr-2 py-3 text-sm font-medium text-text-primary sticky left-0 z-[6] ${selectedCaseDocument?.name === row.name ? 'bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover'} ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                        >
                          {showLeftStickyEdge ? (
                            <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                          ) : null}
                          <span className="break-words">{row.name}</span>
                        </td>
                        <td className={`border-b border-border-default bg-inherit px-2 py-3 ${TABLE_TEXT_CLASS}`}>
                          {row.category}
                        </td>
                        <td className={`border-b border-border-default bg-inherit px-2 py-3 ${TABLE_TEXT_CLASS}`}>
                          {row.stage ? <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-text-secondary">{row.stage}</span> : <span className="text-text-muted">—</span>}
                        </td>
                        <td className="min-w-[260px] max-w-[320px] border-b border-border-default bg-inherit px-2 py-3 align-top">
                          <TwoLineSummaryCell
                            title={deriveDocumentSummaryTitle(row.name, row.insight ?? row.aiSummary)}
                            summary={documentSummarySubtitle(row.name, row.insight ?? row.aiSummary)}
                          />
                        </td>
                        <td className={`border-b border-border-default bg-inherit px-2 py-3 whitespace-nowrap ${TABLE_TEXT_CLASS}`}>
                          {row.uploaded}
                        </td>
                        <td className={`border-b border-border-default bg-inherit px-2 py-3 whitespace-nowrap ${TABLE_TEXT_CLASS}`}>
                          {row.source}
                        </td>
                        <td className="min-w-[200px] border-b border-border-default bg-inherit px-2 py-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab('requirements');
                            }}
                            className={`text-left ${TABLE_LINK_CLASS}`}
                          >
                            {row.linkedRequirement}
                          </button>
                        </td>
                        <td
                          className={`relative border-b border-border-default py-3 pl-2 pr-2 align-top text-sm sticky right-[96px] z-[6] ${selectedCaseDocument?.name === row.name ? 'bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover'} ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                        >
                          {showRightStickyEdge ? (
                            <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                          ) : null}
                          <LozengeTag label={row.status} type={getStatusLozengeType(row.status, 'document')} subtle />
                        </td>
                        <td className={`relative box-border min-h-12 w-[96px] min-w-[96px] max-w-[96px] border-b border-border-default p-0 align-middle sticky right-0 z-[7] ${selectedCaseDocument?.name === row.name ? 'bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover'}`}>
                          <span
                            aria-hidden
                            className={`pointer-events-none absolute inset-y-0 left-0 z-[7] h-full w-[calc(100%+3px)] ${selectedCaseDocument?.name === row.name ? 'bg-surface-selected-alt' : 'bg-white group-hover:bg-surface-hover'}`}
                          />
                          <div className="relative z-10 flex h-full min-h-12 items-center justify-center gap-0.5 px-1">
                            <button
                              type="button"
                              className="rounded p-1 text-text-secondary hover:bg-surface-muted hover:text-text-heading"
                              title="Download"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded p-1 text-text-secondary hover:bg-surface-muted hover:text-text-heading"
                              title="Open in new tab"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(activeTab === 'related_cases' && tabViews.related_cases === 'table') && (
              <div
                ref={setDocumentsTableScrollEl}
                className={moduleTableScrollContainerClass(hasHorizontalOverflow, 'flex-1 bg-white')}
              >
                <table className="w-full">
                  <thead className="sticky top-0 z-[1] bg-surface-primary">
                    <tr className="border-b border-border-default">
                      <th className="w-10 pl-6 pr-3 py-2 text-left"><Checkbox className="size-4 rounded-[4px]" /></th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-text-secondary">Entity</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-text-secondary">Type</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-text-secondary">Relationship</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-text-secondary">Status</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-text-secondary">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relationshipRows.length === 0 ? (
                      <tr className="border-b border-border-default bg-white">
                        <td colSpan={7} className={`px-6 py-8 text-center ${TABLE_SUBTEXT_CLASS}`}>
                          No main entity relationships found for this case.
                        </td>
                      </tr>
                    ) : (
                      relationshipRows.map((row) => (
                          <tr key={row.id} className="border-b border-border-default bg-white hover:bg-surface-hover">
                            <td className="pl-6 pr-3 py-3">
                              <Checkbox className="size-4 rounded-[4px]" />
                            </td>
                            <td className="px-3 py-3">
                              <Link to={row.href ?? '#'} className={TABLE_LINK_CLASS}>
                                {row.label}
                              </Link>
                            </td>
                            <td className={`px-3 py-3 capitalize ${TABLE_TEXT_CLASS}`}>{row.kind}</td>
                            <td className={`px-3 py-3 ${TABLE_TEXT_CLASS}`}>{row.relationship}</td>
                            <td className="whitespace-nowrap px-3 py-3">
                              {row.status ? <LozengeTag label={row.status} type={row.kind === 'case' ? relatedCaseStatusLozengeType(row.status) : getStatusLozengeType(row.status, 'entityTable')} subtle /> : <span className="text-text-muted">—</span>}
                            </td>
                            <td className={`px-3 py-3 ${TABLE_SUBTEXT_CLASS}`}>{row.details ?? '—'}</td>
                          </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {(activeTab === 'history' && tabViews.history === 'table') && (
              <div
                ref={setDocumentsTableScrollEl}
                className={moduleTableScrollContainerClass(hasHorizontalOverflow, 'flex-1 bg-white')}
              >
                <table className="w-full">
                  <thead className="sticky top-0 z-[1] bg-surface-primary"><tr className="border-b border-border-default">
                    <th className="w-10 pl-6 pr-3 py-2 text-left"><Checkbox className="size-4 rounded-[4px]" /></th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-text-secondary">Date</th><th className="px-3 py-2 text-left text-sm font-medium text-text-secondary">Stage</th><th className="px-3 py-2 text-left text-sm font-medium text-text-secondary">Event</th><th className="px-3 py-2 text-left text-sm font-medium text-text-secondary">Details</th>
                  </tr></thead>
                  <tbody>{stagedHistoryEvents.map((row, idx) => (
                    <tr key={`${row.date}-${idx}`} className="border-b border-border-default bg-white hover:bg-surface-hover">
                      <td className="pl-6 pr-3 py-3 text-sm"><Checkbox className="size-4 rounded-[4px]" /></td><td className="px-3 py-3 text-sm">{row.date}</td><td className="px-3 py-3 text-sm">{row.stage ? <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-text-secondary">{row.stage}</span> : '—'}</td><td className="px-3 py-3 text-sm">{row.event}</td><td className="px-3 py-3 text-sm">{row.detail}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}

            {activeTab !== 'overview' && activeTab !== 'decision' && tabViews[activeTab as Exclude<CaseTab, 'overview' | 'decision'>] === 'list' && (
              activeTab === 'tasks' ? (
                <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
                  <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-3">
                      {searchedTasks.length === 0 && (
                        <div className="flex flex-col items-center gap-2 py-16">
                          <ListChecks className="h-8 w-8 text-[#dbdee1]" />
                          <p className="text-sm font-medium text-text-muted">
                            {contextualTasks.length === 0 ? 'No tasks yet' : 'No tasks match your search'}
                          </p>
                        </div>
                      )}
                      {searchedTasks.map((row) => {
                        const resolved = row.task ?? resolveTaskForCaseContextRow(row, data);
                        const selected = selectedCaseTask?.id === resolved.id;
                        return (
                          <div
                            key={row.id}
                            data-keep-sidepanel="card"
                            role="button"
                            tabIndex={0}
                            onClick={() => openCaseTaskPanel(resolved)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openCaseTaskPanel(resolved);
                              }
                            }}
                            className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                              selected ? 'border-brand-blue bg-surface-selected-alt' : 'border-border-default bg-white hover:border-brand-blue-border hover:bg-surface-hover'
                            }`}
                          >
                            <div className="mb-1">
                              <p className={`truncate ${TABLE_SUBTEXT_CLASS}`}>{row.id}</p>
                              <p className="mt-0.5 truncate text-sm font-semibold text-text-primary">{row.taskType}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                              <PriorityChip priority={row.priority} />
                              <span>{row.status} · Due {row.dueDate} · {row.assignee}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                {activeTab === 'requirements' && (
                  <div className="space-y-3">
                    {searchedRequirements.length === 0 ? (
                      <p className="py-16 text-center text-sm font-medium text-text-muted">
                        {data.requirements.length === 0 ? 'No requirements yet' : 'No requirements match your search'}
                      </p>
                    ) : null}
                    {searchedRequirements.map((row) => {
                      const isFulfilled = row.status === 'Fulfilled' || row.status === 'Waived';
                      const isOverdue = row.status === 'Overdue';
                      const statusColor = isFulfilled ? 'text-brand-green' : isOverdue ? 'text-brand-red' : row.status === 'Pending' ? 'text-[#a36d00]' : 'text-brand-blue';
                      const statusBg = isFulfilled ? 'bg-[#e5f5ea]' : isOverdue ? 'bg-[#fde5e4]' : row.status === 'Pending' ? 'bg-[#fff4e6]' : 'bg-surface-selected';
                      const isSelected = selectedRequirement?.id === row.id;
                      const sourceText =
                        row.source === 'ai_rule_engine' ? 'AI Rule Engine' :
                        row.source === 'id_verification' ? 'ID Verification' :
                        row.source === 'employer_portal' ? 'Employer Portal' :
                        row.source === 'pharmacy_check' ? 'Pharmacy Check' :
                        row.source;
                      return (
                        <div
                          key={row.id}
                          data-keep-sidepanel="card"
                          role="button"
                          tabIndex={0}
                          onClick={() => openRequirementPanel(row)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRequirementPanel(row); }
                          }}
                          className={`cursor-pointer rounded-xl border bg-white p-4 transition-colors ${isSelected ? 'border-brand-blue bg-surface-selected-alt' : isOverdue ? 'border-[#cd2c23]/25' : 'border-border-default'} hover:border-brand-blue/40`}
                        >
                          <div className="mb-3 flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="truncate text-sm font-semibold text-text-primary">{row.name}</span>
                                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3px] text-text-secondary">{row.category}</span>
                              </div>
                              <p className="mt-1 text-xs text-text-muted">
                                {row.trigger || 'Manual requirement'} · {row.phase ? row.phase.replace('-', ' ') : 'No phase'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBg} ${statusColor}`}>{row.status}</span>
                              <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button type="button" onClick={() => setReqKebabOpen(reqKebabOpen === row.id ? null : row.id)} className="rounded p-1 text-text-secondary hover:bg-surface-muted">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                                {reqKebabOpen === row.id && (
                                  <>
                                    <div className="fixed inset-0 z-[10]" onClick={() => setReqKebabOpen(null)} />
                                    <div className="absolute right-0 top-full z-[20] mt-1 w-[140px] overflow-hidden rounded-lg border border-border-default bg-white py-1 shadow-[0_8px_24px_rgba(27,28,30,0.12)]">
                                      <button type="button" onClick={() => { setReqKebabOpen(null); setEditingReq(row); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-muted">
                                        <Pencil className="h-3.5 w-3.5 text-text-secondary" /> Edit
                                      </button>
                                      <button type="button" onClick={() => {
                                        const result = deleteEntity(dataSource.activeDatasetId, { kind: 'requirement', id: row.datasetRequirementId ?? String(row.id), label: row.name });
                                        updateDataSource({ activeDatasetId: result.datasetId });
                                        data.requirements = data.requirements.filter((r) => r.id !== row.id);
                                        setReqKebabOpen(null);
                                        bumpData();
                                      }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand-red hover:bg-[#fde5e4]">
                                        <Trash2 className="h-3.5 w-3.5" /> Delete
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="grid gap-3 border-t border-border-divider pt-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <p className="font-semibold uppercase tracking-[0.3px] text-text-muted">Due</p>
                              <p className="mt-1 font-semibold text-text-primary">{row.dueDate}</p>
                            </div>
                            <div>
                              <p className="font-semibold uppercase tracking-[0.3px] text-text-muted">Follow-up</p>
                              <p className="mt-1 font-semibold text-text-primary">{row.followUpDate || '-'}</p>
                            </div>
                            <div>
                              <p className="font-semibold uppercase tracking-[0.3px] text-text-muted">Source</p>
                              <p className="mt-1 font-semibold text-text-primary">{sourceText}</p>
                            </div>
                            <div>
                              <p className="font-semibold uppercase tracking-[0.3px] text-text-muted">External ref</p>
                              <a
                                href={requirementExternalHref(data.id, row)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="mt-1 inline-flex items-center gap-1 font-mono font-semibold text-brand-blue underline underline-offset-2 hover:underline"
                                title="Open in external source"
                              >
                                {requirementExternalCode(row)}
                                <ExternalLink className="h-3 w-3" aria-hidden />
                              </a>
                            </div>
                          </div>
                          {row.notes ? (
                            <div className="mt-3 rounded-lg bg-surface-primary px-3 py-2 text-xs text-text-secondary">
                              {row.notes}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
                {activeTab === 'communications' && <div className="space-y-3">{stagedCommunications.map((row, idx) => <div key={`${row.date}-${idx}`} className="rounded-lg border border-border-default bg-white p-4"><div className="mb-1 text-sm font-semibold text-text-primary">{row.date} · {row.stage ?? 'No stage'} · {row.channel} · {row.direction}</div><div className="text-sm text-text-secondary">{row.contact} — {row.summary}</div></div>)}</div>}
                {activeTab === 'documents' && (
                  <div className="space-y-3">
                    {searchedDocuments.length === 0 ? (
                      <p className="py-16 text-center text-sm font-medium text-text-muted">
                        {documents.length === 0 ? 'No documents yet' : 'No documents match your search'}
                      </p>
                    ) : null}
                    {searchedDocuments.map((row) => (
                      <div
                        key={row.name}
                        data-keep-sidepanel="card"
                        role="button"
                        tabIndex={0}
                        onClick={() => openCaseDocumentPanel(row)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openCaseDocumentPanel(row);
                          }
                        }}
                        className={`cursor-pointer rounded-lg border p-4 transition-colors ${selectedCaseDocument?.name === row.name ? 'border-brand-blue bg-surface-selected-alt' : 'border-border-default bg-white hover:border-brand-blue/40'}`}
                      >
                        <div className="mb-1 flex items-start justify-between gap-3">
                          <div className="min-w-0 text-sm font-semibold text-text-primary">{row.name}</div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <LozengeTag label={row.status} type={getStatusLozengeType(row.status, 'document')} subtle />
                            <button type="button" className="rounded p-1 text-text-secondary hover:bg-surface-muted hover:text-text-heading" title="Download">
                              <Download className="h-4 w-4" />
                            </button>
                            <button type="button" className="rounded p-1 text-text-secondary hover:bg-surface-muted hover:text-text-heading" title="Open in new tab">
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-text-secondary">
                          {row.category} · {row.uploaded} · {row.source}
                        </div>
                        <div className="mt-2">
                          <AiInsightInline summary={row.aiSummary} />
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('requirements')}
                          className="mt-2 text-left text-sm text-brand-blue underline decoration-brand-blue/30 hover:decoration-brand-blue"
                        >
                          {row.linkedRequirement}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'related_cases' && (
                  <div className="space-y-3">
                    {relationshipRows.length === 0 ? (
                      <div className="rounded-lg border border-border-default bg-white p-4 text-sm text-text-secondary">No other cases for this client.</div>
                    ) : (
                      relationshipRows.map((row) => (
                          <div key={row.id} className="rounded-lg border border-border-default bg-white p-4">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <Link to={row.href ?? '#'} className="text-sm font-semibold text-brand-blue underline underline-offset-2 hover:underline">
                                {row.label}
                              </Link>
                              <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[10px] font-semibold capitalize text-text-muted">{row.kind}</span>
                              {row.status ? <LozengeTag label={row.status} type={row.kind === 'case' ? relatedCaseStatusLozengeType(row.status) : getStatusLozengeType(row.status, 'entityTable')} subtle /> : null}
                            </div>
                            <div className="text-sm text-text-secondary">
                              {row.relationship}{row.details ? ` · ${row.details}` : ''}
                            </div>
                          </div>
                      ))
                    )}
                  </div>
                )}
                {activeTab === 'history' && <div className="space-y-3">{stagedHistoryEvents.map((row, idx) => <div key={`${row.date}-${idx}`} className="rounded-lg border border-border-default bg-white p-4"><div className="mb-1 text-sm font-semibold text-text-primary">{row.date} · {row.stage ?? 'No stage'} · {row.event}</div><div className="text-sm text-text-secondary">{row.detail}</div></div>)}</div>}
              </div>
              )
            )}
          </div>
        )}
      </div>

      </div>
      {casePanelContexts.length > 0 && activeCasePanelContextId ? (
        <WorkspaceObjectSidePanel
          contexts={casePanelContexts}
          activeContextId={activeCasePanelContextId}
          onChangeContext={handleCasePanelContextChange}
          onClearContext={clearCasePanelContext}
          onClose={closeCaseSidePanel}
          panelWidth={taskDetailPanelWidth}
          onPanelWidthChange={setTaskDetailPanelWidth}
          isResizing={taskDetailPanelResizing}
          onResizeStart={() => setTaskDetailPanelResizing(true)}
          assistantContent={<WorkspaceAssistantPanel contextId={activeCasePanelContextId} />}
        >
          {activeCasePanelContextId.startsWith('task:') && selectedCaseTask ? (
            <TaskDetailEmbeddedView
              task={selectedCaseTask}
              panelWidth={taskDetailPanelWidth}
              onPanelWidthChange={setTaskDetailPanelWidth}
              onResizeStart={() => setTaskDetailPanelResizing(true)}
              onClose={closeCaseSidePanel}
              navigate={navigate}
              queueContext="my_tasks"
              variant="case"
              caseFileId={data.id}
              fixedOverlay
              panelContexts={casePanelContexts}
              activePanelContextId={activeCasePanelContextId}
              onPanelNavigationChange={handleCasePanelNavigationChange}
              onCompleteTask={(t) => {
                const ct = contextualTasks.find((x) => x.id === t.id);
                if (ct) ct.status = 'Completed';
                if (t.id === 'TSK-BB-OD-01') setOverdueTaskCompleted(true);
                closeCaseSidePanel();
                bumpData();
              }}
              onAcceptMeeting={() => {
                closeCaseSidePanel();
                setAiActivitySeq({
                  id: `accept-meeting-${Date.now()}`,
                  title: 'AI Crew — Meeting Confirmed',
                  stepDelayMs: 700,
                  startedAt: Date.now(),
                  steps: [
                    { id: 'mt-confirm', label: 'Confirming meeting time with Billy Bud', status: 'pending' },
                    { id: 'mt-release', label: 'Releasing 2 alternate calendar holds', status: 'pending' },
                    { id: 'mt-notify', label: 'Sending confirmation email — date, link, and agenda', status: 'pending' },
                    { id: 'mt-reminder', label: 'Scheduling reminders — 2 days and 1 hour before', status: 'pending' },
                    { id: 'mt-benefit', label: 'Benefit change detected — +5% CPI indexation via eLISSIA', status: 'pending' },
                  ],
                });
              }}
            />
          ) : null}
          {activeCasePanelContextId.startsWith('requirement:') && selectedRequirement ? (
            <RequirementContextBody
              requirement={selectedRequirement}
              caseId={data.id}
              documents={selectedRequirementDocuments}
              tasks={selectedRequirementTasks}
              scoring={scoringDraft}
              onOpenScoring={() => setActiveTab('scoring')}
              onOpenDocument={(document) => {
                openCaseDocumentPanel(documentToCaseContextRow(document));
              }}
              onOpenTask={(task) => {
                openCaseTaskPanel(task);
              }}
            />
          ) : null}
          {activeCasePanelContextId.startsWith('document:') && selectedCaseDocumentData ? (
            <DynamicDocumentSidePanel
              embedded
              open
              onOpenChange={(open) => {
                if (!open) {
                  const taskCtxId = selectedCaseTask ? taskPanelContextId(selectedCaseTask.id) : '';
                  if (taskCtxId && casePanelContexts.some((context) => context.id === taskCtxId)) {
                    resolveCasePanelContext(taskCtxId);
                    return;
                  }
                  clearCasePanelContext(activeCasePanelContextId);
                }
              }}
              document={selectedCaseDocumentData}
              activeInsightId={selectedCaseDocumentData.evidence[0]?.id ?? ''}
              onInsightChange={() => undefined}
              panelWidth={taskDetailPanelWidth}
              isResizing={false}
              onResizeStart={() => undefined}
            />
          ) : null}
        </WorkspaceObjectSidePanel>
      ) : null}
      {casesAiAssistantEnabled && showAIPanel && (
          <aside
            ref={aiPanelAsideRef}
            className={`fixed right-0 z-20 flex flex-col overflow-hidden border-l border-t border-border-default bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.08)] motion-reduce:animate-none ${
              aiPanelExiting
                ? 'animate-[slideOutRight_0.3s_ease-out_forwards]'
                : 'animate-[slideInRight_0.3s_ease-out_forwards]'
            }`}
            style={{
              width: `${panelWidth}px`,
              top: '48px',
              height: 'calc(100dvh - 48px)',
            }}
          >
            <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="shrink-0 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-start gap-0">
                    <div>
                      <p className="text-[10px] font-normal leading-tight tracking-wide text-text-muted">amplify</p>
                      <h2 className="text-lg font-semibold leading-snug text-text-primary">Assistant</h2>
                    </div>
                    <span className="ml-1 mt-0.5 flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full bg-brand-accent">
                      <AiCueSparkle size={8} className="!text-white" />
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => { closeAiPanel(); navigate('/copilot'); }}
                    className="rounded-full p-1.5 text-text-secondary hover:bg-surface-muted"
                    title="Open full page"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                  <button onClick={closeAiPanel} className="rounded-full p-1.5 text-text-secondary hover:bg-surface-muted">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              </div>

              <div className="shrink-0 border-b border-border-default bg-white px-6">
              <div className="flex gap-6">
                {([
                  ['insights', 'Case overview'],
                  ['summary', 'Client profile'],
                  ['factors', 'Assessment Factors'],
                ] as const).map(([tabId, label]) => (
                  <button
                    key={tabId}
                    type="button"
                    onClick={() => setAiPanelTab(tabId)}
                    className={`relative z-0 pb-3 pt-4 px-3 text-sm font-semibold transition-colors rounded-t-md hover:bg-surface-muted ${
                      aiPanelTab === tabId ? 'text-text-heading' : 'text-text-secondary'
                    }`}
                  >
                    {aiPanelTab === tabId ? (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute bottom-0 left-1/2 z-[1] h-1 w-[calc(100%+28px)] max-w-none -translate-x-1/2 bg-brand-blue"
                      />
                    ) : null}
                    <span className="relative z-[2] inline-flex items-center gap-2">
                      <span>{label}</span>
                      {tabId === 'factors' && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[#b7bbc2] bg-surface-muted px-1.5 text-[11px] font-bold text-text-secondary">
                          {data.assessmentFactors.length}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
              </div>

              <div className="relative flex min-h-0 min-w-0 flex-1 flex-col pb-[min(280px,36vh)]">
              {aiPanelTab === 'insights' ? (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <CaseInsightsPanel
                    activeStage={data.activeStage}
                    bundle={insightBundle}
                    onTextMouseUp={handleSummarySelection}
                    onCopilotToast={(msg) => setToast({ message: msg, tone: 'neutral' })}
                  />
                </div>
              ) : (
                <div className="h-full min-h-0 flex-1 overflow-y-auto">
                  {aiPanelTab === 'summary' && (
                    <AiClientProfilePanel data={data} onMouseUp={handleSummarySelection} />
                  )}

                  {aiPanelTab === 'factors' && (
                    <div className="px-6 py-5">
                      <h3 className="mb-4 text-sm font-semibold text-text-heading">Assessment Factors</h3>
                      <table className="w-full text-[13px]">
                        <thead>
                          <tr className="border-b border-border-default">
                            <th className="pb-2 pr-3 text-left font-medium text-text-secondary">Category</th>
                            <th className="pb-2 pr-3 text-left font-medium text-text-secondary">Item</th>
                            <th className="pb-2 pr-3 text-right font-medium text-text-secondary">Score</th>
                            <th className="pb-2 text-left font-medium text-text-secondary">Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.assessmentFactors.map((factor, idx) => (
                            <tr key={idx} className="border-b border-border-divider">
                              <td className="py-2.5 pr-3 text-text-secondary">{factor.category}</td>
                              <td className="py-2.5 pr-3 text-text-secondary">{factor.item}</td>
                              <td className={`py-2.5 pr-3 text-right font-semibold ${factor.score < 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                                {factor.score > 0 ? `+${factor.score}` : factor.score}
                              </td>
                              <td className="py-2.5 font-mono text-[11px] text-text-muted">{factor.source}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-border-default">
                            <td colSpan={2} className="py-3 text-sm font-semibold text-text-primary">
                              <div className="flex gap-6">
                                <span>Total Positive: <span className="text-brand-red">+{data.assessmentFactors.filter((f) => f.score > 0).reduce((s, f) => s + f.score, 0)}</span></span>
                                <span>Total Negative: <span className="text-brand-green">{data.assessmentFactors.filter((f) => f.score < 0).reduce((s, f) => s + f.score, 0)}</span></span>
                              </div>
                            </td>
                            <td className="py-3 text-right text-sm font-bold text-text-primary">{data.netAssessmentScore}</td>
                            <td className="py-3 text-[11px] text-text-muted">Net Score</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              )}
                {/* Full-width fades only for Client profile / Factors (Case overview handles fades inside narrative column) */}
                {aiPanelTab !== 'insights' ? (
                  <>
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 z-[8] h-[4.75rem] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.42)_32%,rgba(255,255,255,0.14)_62%,rgba(255,255,255,0.03)_88%,transparent_100%)]"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] h-[6.5rem] bg-[linear-gradient(to_top,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.4)_30%,rgba(255,255,255,0.12)_58%,rgba(255,255,255,0.03)_85%,transparent_100%)]"
                    />
                  </>
                ) : null}
              </div>

              <div
                className={`pointer-events-none absolute inset-0 z-[12] bg-[#9ca3af]/18 transition-opacity duration-300 ease-in-out motion-reduce:transition-none motion-reduce:duration-0 ${
                  copilotSurfaceOpen ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden={!copilotSurfaceOpen}
              />
            </div>

            <AiCopilotDock
              data={data}
              messages={aiCopilotMessages}
              onSendMessage={handleCopilotSend}
              aiPanelTab={aiPanelTab}
              onSurfaceOpenChange={setCopilotSurfaceOpen}
            />
            {/* Resize handle + grab dot */}
            <button
              type="button"
              aria-label="Resize AI panel"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizing(true);
              }}
              className="group pointer-events-auto absolute left-0 top-0 z-[50] flex h-full w-2.5 -translate-x-1/2 cursor-ew-resize items-center justify-center border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/35 focus-visible:ring-offset-0"
            >
              <span
                aria-hidden
                className={`pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 transition-colors ${
                  isResizing ? 'bg-brand-blue' : 'bg-transparent group-hover:bg-brand-blue'
                }`}
              />
              <span
                aria-hidden
                className={`pointer-events-none absolute left-1/2 top-1/2 flex h-9 w-2 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-colors ${
                  isResizing ? 'border-brand-blue' : 'border-border-default group-hover:border-brand-blue'
                }`}
              />
            </button>
          </aside>
      )}
      {casesAiAssistantEnabled && selectionMenu.visible && showAIPanel && (aiPanelTab === 'summary' || aiPanelTab === 'insights') && (
        <div
          data-ai-panel-ignore-outside
          className="fixed z-[90] -translate-x-1/2 -translate-y-full rounded-lg border border-border-default bg-white p-1 shadow-[0_8px_24px_rgba(27,28,30,0.18)]"
          style={{ left: `${selectionMenu.x}px`, top: `${selectionMenu.y}px` }}
        >
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setAiPanelTab('insights');
                hideSelectionMenu();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-surface-muted hover:text-text-heading"
              title="Dig deeper"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setAiPanelTab('insights');
                hideSelectionMenu();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-surface-muted hover:text-text-heading"
              title="Explain"
            >
              <MessageSquareText className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setAiPanelTab('insights');
                hideSelectionMenu();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-surface-muted hover:text-text-heading"
              title="Suggest"
            >
              <Lightbulb className="h-4 w-4" />
            </button>
            <div className="mx-1 h-6 w-px bg-[#dbdee1]" />
            <button
              onClick={() => {
                setActiveTab('tasks');
                closeAiPanel();
                hideSelectionMenu();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-surface-muted hover:text-text-heading"
              title="Open tasks"
            >
              <ListChecks className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setActiveTab('requirements');
                closeAiPanel();
                hideSelectionMenu();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-surface-muted hover:text-text-heading"
              title="Open requirements"
            >
              <ClipboardList className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                navigate(`/cases/${data.id}`);
                closeAiPanel();
                hideSelectionMenu();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:bg-surface-muted hover:text-text-heading"
              title="Open case"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {/* Toast — bottom-right; vivid green for confirmations, slate for copilot previews */}
      {toast && (
        <div
          data-ai-panel-ignore-outside
          className="fixed bottom-6 right-6 z-[200] max-w-[min(440px,calc(100vw-3rem))] animate-[fadeInUp_0.35s_ease-out]"
          role="status"
          aria-live="polite"
        >
          <div
            className={`flex items-start gap-3 rounded-lg border-2 px-5 py-4 ${
              toast.tone === 'success'
                ? 'border-white/30 bg-[#00a651] shadow-[0_12px_40px_rgba(0,133,65,0.5),0_4px_12px_rgba(0,0,0,0.15)]'
                : 'border-white/15 bg-[#2d3748] shadow-[0_12px_40px_rgba(0,0,0,0.22),0_4px_12px_rgba(0,0,0,0.12)]'
            }`}
          >
            <span
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                toast.tone === 'success' ? 'bg-white/20' : 'bg-white/10'
              }`}
            >
              {toast.tone === 'success' ? (
                <Check className="h-6 w-6 text-white" strokeWidth={2.5} aria-hidden />
              ) : (
                <MessageSquareText className="h-5 w-5 text-white/90" strokeWidth={2} aria-hidden />
              )}
            </span>
            <span className="min-w-0 pt-0.5 text-base font-semibold leading-snug text-white">{toast.message}</span>
          </div>
        </div>
      )}
      {(showAddReqModal || editingReq) && createPortal(
        <RequirementModal
          initial={editingReq ? { name: editingReq.name, category: editingReq.category, dueDate: editingReq.dueDate, followUpDate: editingReq.followUpDate, notes: editingReq.notes } : undefined}
          onClose={() => { setShowAddReqModal(false); setEditingReq(null); }}
          onSave={(req) => {
            const result = upsertRequirement(dataSource.activeDatasetId, {
              id: editingReq?.datasetRequirementId ?? (editingReq ? String(editingReq.id) : undefined),
              caseId: data.id,
              label: req.name,
              category: req.category,
              dueDate: req.dueDate,
              followUpDate: req.followUpDate,
              phase: reqPhaseTab,
              notes: req.notes,
            });
            updateDataSource({ activeDatasetId: result.datasetId });
            if (editingReq) {
              const target = data.requirements.find((r) => r.id === editingReq.id);
              if (target) {
                target.name = req.name;
                target.category = req.category;
                target.dueDate = req.dueDate;
                target.followUpDate = req.followUpDate;
                target.notes = req.notes || undefined;
              }
            } else {
              const nextId = data.requirements.length > 0 ? Math.max(...data.requirements.map((r) => r.id)) + 1 : 1;
              data.requirements.push({
                ...req,
                id: nextId,
                rag: 'Amber',
                status: 'Pending',
                source: 'manual',
                trigger: 'Assessor',
                phase: reqPhaseTab,
                notes: req.notes || undefined,
              });
            }
            setShowAddReqModal(false);
            setEditingReq(null);
            bumpData();
          }}
        />,
        document.body,
      )}
      <CreateTaskModal
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        dataSource={dataSource}
        initialCaseId={caseId}
        onCreated={({ datasetId, taskId }) => {
          const nextDataSource = { ...dataSource, activeDatasetId: datasetId };
          const createdTask = listTasks(filterDatasetBySettings(getSystemDataset(datasetId), nextDataSource), { caseId }).find((task) => task.id === taskId);
          updateDataSource({ activeDatasetId: datasetId });
          setCreateTaskOpen(false);
          setActiveTab('tasks');
          setTabViews((prev) => ({ ...prev, tasks: 'table' }));
          setCreatedTaskId(taskId);
          setNewTaskBadge(false);
          if (createdTask) openCaseTaskPanel(createdTask);
          navigate(`/cases/${caseId}#tab=tasks&task=${encodeURIComponent(taskId)}`, { replace: true });
          bumpData();
        }}
      />
      {scoreModal ? (
        <ScoreItemModal
          type={scoreModal.type}
          initialItem={scoreModal.item}
          onClose={() => setScoreModal(null)}
          onSave={saveScoreItem}
          onDelete={scoreModal.item ? deleteScoreItem : undefined}
        />
      ) : null}
      {aiActivityEnabled && (
        <AiActivityToast
          sequence={aiActivitySeq}
          onDismiss={() => setAiActivitySeq(null)}
          pauseAfterStepId={aiToastPauseAfter}
          onStepDone={(stepId) => {
            if (stepId === 'create-case') {
              addOpenCase('IP26-5546200');
            }
            const newCaseData = getCaseOverview('IP26-5546200', activeDataset, dataSource.legacyMockOverlayEnabled, {
              anatomy: platformSettings.anatomy,
              enabledObjectDomains: dataSource.enabledObjectDomains,
            });
            const newCaseSummary = listCaseSummaries(activeDataset).find((c) => c.id === 'IP26-5546200');
            if (stepId === 'nc-restore') {
              newCaseData.restorationPlan = [
                'Monthly physician follow-ups to monitor recovery progress',
                'Weekly physiotherapy sessions — focus on knee mobility and strength',
                'At-home exercises per physician statement — daily routine',
                'No full RTW for 2 months; potential half-time / limited duties when cleared',
              ];
              newCaseData.requirements = [
                { id: 1, name: 'Restoration Plan Interview', category: 'Documentation', rag: 'Amber' as const, status: 'Pending' as const, dueDate: 'Apr 1, 2026', followUpDate: 'Apr 3, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' as const, notes: 'Initial meeting with claimant to review and agree on the restoration plan — physician cadence, PT schedule, RTW guardrails.' },
                { id: 2, name: 'Monthly Physician Follow-Up', category: 'Medical', rag: 'Amber' as const, status: 'Pending' as const, dueDate: 'Apr 15, 2026', followUpDate: 'Apr 20, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' as const },
                { id: 3, name: 'Weekly PT Sessions', category: 'Rehabilitation', rag: 'Amber' as const, status: 'Pending' as const, dueDate: 'Apr 10, 2026', followUpDate: 'Apr 14, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' as const },
                { id: 4, name: 'At-Home Exercise Compliance', category: 'Rehabilitation', rag: 'Green' as const, status: 'Pending' as const, dueDate: 'Apr 20, 2026', followUpDate: 'Apr 25, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' as const },
                { id: 5, name: 'Orthopaedic Specialist Review', category: 'Medical', rag: 'Amber' as const, status: 'Pending' as const, dueDate: 'Apr 22, 2026', followUpDate: 'Apr 28, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' as const },
                { id: 6, name: 'Medication Compliance Check', category: 'Pharmacy', rag: 'Green' as const, status: 'Pending' as const, dueDate: 'Apr 18, 2026', followUpDate: 'Apr 22, 2026', source: 'pharmacy_check', trigger: 'AI Monitoring', phase: 'post-approval' as const },
                { id: 7, name: 'Functional Capacity Re-assessment', category: 'Medical', rag: 'Amber' as const, status: 'Pending' as const, dueDate: 'May 5, 2026', followUpDate: 'May 10, 2026', source: 'ai_rule_engine', trigger: 'AI Restoration Plan', phase: 'post-approval' as const },
                { id: 8, name: 'Pain Management Progress Report', category: 'Medical', rag: 'Amber' as const, status: 'Pending' as const, dueDate: 'Apr 30, 2026', followUpDate: 'May 5, 2026', source: 'ai_rule_engine', trigger: 'AI Monitoring', phase: 'post-approval' as const },
                { id: 9, name: 'Employer RTW Accommodation Plan', category: 'Employment', rag: 'Green' as const, status: 'Pending' as const, dueDate: 'May 15, 2026', followUpDate: 'May 20, 2026', source: 'employer_portal', trigger: 'AI Restoration Plan', phase: 'post-approval' as const },
                { id: 10, name: 'Final Review Interview', category: 'Documentation', rag: 'Green' as const, status: 'Pending' as const, dueDate: 'Jun 15, 2026', followUpDate: 'Jun 20, 2026', source: 'ai_rule_engine', trigger: 'AI Case Completion', phase: 'post-approval' as const, notes: 'Final meeting with claimant before case completion — review recovery outcomes, confirm RTW status, and close the restoration plan.' },
              ];
              newCaseData.activeStage = 2;
              setReqPhaseTab('post-approval');
              bumpData();
            }
            if (stepId === 'nc-task') {
              setNewCaseTaskReady(true);
              setNewTaskBadge(true);
              try {
                sessionStorage.setItem('amplify-billy-post-approval', '1');
                window.dispatchEvent(new Event('amplify-billy-flow'));
              } catch { /* */ }
            }
            if (stepId === 'mt-benefit') {
              setBenefitIncrease(true);
              bumpData();
            }
          }}
        />
      )}
    </div>
  );
}
