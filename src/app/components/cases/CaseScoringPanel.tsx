import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';
import type { CaseOverview } from '../../types';
import type { UnderwritingScoring, UnderwritingScoringItem } from '../../domain/objectRefs';
import {
  deriveHumanNet,
  deriveRiskClass,
  normalizeScoring,
  type ScoringItemType,
} from '../../domain/scoring';
import { AiCueSparkle } from '../AiCueSparkle';

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

export function UnderwritingScoringTab({
  caseId,
  onOpenScoreModal,
  scoring,
  onChange,
  itemsSectionTitle = 'Scoring items',
}: {
  caseId: string;
  onOpenScoreModal: (type: ScoringItemType, item?: UnderwritingScoringItem) => void;
  scoring: CaseOverview['underwritingScoring'];
  onChange: (next: NonNullable<CaseOverview['underwritingScoring']>) => void;
  itemsSectionTitle?: string;
}) {
  const value = scoring ?? createEmptyScoring(caseId);
  const normalized = normalizeScoring(value);
  const [scoreListTab, setScoreListTab] = useState<'debits' | 'credits'>('debits');
  const debitTotal = normalized.debitTotal;
  const creditTotal = normalized.creditTotal;
  const netScore = deriveHumanNet(normalized);
  const mappedDecision = deriveRiskClass(netScore);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-surface-primary p-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="overflow-hidden rounded-xl border border-border-soft bg-white">
          <div className="flex items-center justify-between border-b border-border-soft bg-white px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold text-text-primary">{itemsSectionTitle}</p>
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

export function ScoreItemModal({
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
