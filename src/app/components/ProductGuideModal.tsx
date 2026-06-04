import { useEffect, useState } from 'react';
import { ClipboardList, GitBranch, Users, X } from 'lucide-react';
import { SectionLabel, ToastVariantGallerySection } from './ds';

type WorkspaceTab = 'prd' | 'flows' | 'users' | 'scenarios';

interface ProductGuideModalProps {
  open: boolean;
  onClose: () => void;
}

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof ClipboardList;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? 'border-brand-blue bg-surface-selected text-text-heading'
          : 'border-border-default bg-white text-text-secondary hover:border-[#b7bbc2] hover:text-text-primary'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function PrdTab() {
  return (
    <div className="space-y-4">
    <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-xl border border-border-default bg-white p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Product Intent</h3>
        <h2 className="mt-2 text-2xl font-semibold text-text-heading">AI-first case management workspace</h2>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          Build a single, collaborative operating surface for case managers, supervisors, BA, design, and engineering.
          Amplify should reduce navigation friction, surface AI confidence clearly, and make every decision auditable.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[#e8eaed] bg-[#fafbfc] p-3">
            <SectionLabel>Primary outcomes</SectionLabel>
            <ul className="mt-2 space-y-1.5 text-sm text-text-secondary">
              <li>Faster case decisions with clear AI rationale</li>
              <li>Lower SLA breaches through proactive queue design</li>
              <li>Consistent post-approval monitoring and RTW transitions</li>
            </ul>
          </div>
          <div className="rounded-lg border border-[#e8eaed] bg-[#fafbfc] p-3">
            <SectionLabel>Non-goals</SectionLabel>
            <ul className="mt-2 space-y-1.5 text-sm text-text-secondary">
              <li>Replacing final human adjudication decisions</li>
              <li>Building a generic CRM</li>
              <li>Hiding source evidence behind summary-only UI</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border-default bg-white p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Scope (MVP)</h3>
        <div className="mt-3 space-y-3 text-sm">
          {[
            ['Case lifecycle', 'Intake, decision, post-approval monitoring, closure'],
            ['Amplify Assistant', 'Narrative summary, insights, factor scoring, assisted writing'],
            ['Manager controls', 'Team queue visibility, SLA risk flags, AI performance view'],
            ['Traceability', 'Decision rationale, source links, action history timeline'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-[#eceef0] px-3 py-2.5">
              <p className="text-[12px] font-semibold text-text-heading">{k}</p>
              <p className="mt-0.5 text-[13px] text-text-secondary">{v}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
    <ToastVariantGallerySection />
    </div>
  );
}

function FlowNode({
  title,
  detail,
  tone = 'neutral',
  className = '',
}: {
  title: string;
  detail: string;
  tone?: 'neutral' | 'ai' | 'human' | 'risk';
  className?: string;
}) {
  const toneClass =
    tone === 'ai'
      ? 'border-[#d8c7f1] bg-[#faf8fd]'
      : tone === 'human'
        ? 'border-brand-blue-border bg-surface-selected-alt'
        : tone === 'risk'
          ? 'border-[#f6d9d7] bg-[#fdf7f6]'
          : 'border-border-default bg-white';

  return (
    <div className={`rounded-xl border p-3 shadow-sm ${toneClass} ${className}`}>
      <p className="text-[12px] font-semibold text-text-heading">{title}</p>
      <p className="mt-1 text-[12px] leading-snug text-text-secondary">{detail}</p>
    </div>
  );
}

function WhiteboardFlowsTab() {
  return (
    <div className="h-full min-h-0 rounded-xl border border-border-default bg-[#f8fafb] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Illustrated product flows</h3>
        <span className="text-xs text-text-muted">Drag-style board (conceptual)</span>
      </div>

      <div className="relative min-h-[520px] overflow-auto rounded-lg border border-dashed border-[#cfd5db] bg-white p-4">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <path d="M210 86 C 300 86, 300 86, 390 86" stroke="#a7b3bf" strokeWidth="2" fill="none" strokeDasharray="5 5" />
          <path d="M570 86 C 650 86, 650 150, 720 190" stroke="#a7b3bf" strokeWidth="2" fill="none" strokeDasharray="5 5" />
          <path d="M210 230 C 320 230, 320 230, 430 230" stroke="#a7b3bf" strokeWidth="2" fill="none" strokeDasharray="5 5" />
          <path d="M610 230 C 680 230, 700 290, 770 330" stroke="#a7b3bf" strokeWidth="2" fill="none" strokeDasharray="5 5" />
        </svg>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FlowNode
            title="Intake & triage"
            detail="New claim enters queue. AI pre-reads docs, classifies complexity, and suggests priority."
            tone="human"
          />
          <FlowNode
            title="AI enrichment"
            detail="Confidence, narrative summary, missing evidence, and next-action checklist generated."
            tone="ai"
          />
          <FlowNode
            title="Decision touchpoint"
            detail="Assessor validates recommendations and records decision rationale with traceable sources."
            tone="human"
          />

          <FlowNode
            title="Post-approval orchestration"
            detail="AI schedules monitoring cadence, watches events, and flags exceptions proactively."
            tone="ai"
          />
          <FlowNode
            title="Risk exception lane"
            detail="Setback detection, SLA breach risk, or conflicting medical signals route to supervisor."
            tone="risk"
          />
          <FlowNode
            title="Closure readiness"
            detail="Requirements resolved, RTW evidence complete, closure recommendation prepared for final review."
            tone="human"
          />
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  return (
    <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-2">
      {[
        {
          role: 'Assessor / Case manager',
          goals: ['Make confident decisions quickly', 'Minimize context switching', 'Act only where judgment is needed'],
          pains: ['Scattered evidence across tabs', 'Unclear AI confidence boundaries'],
          needs: 'Clear recommendation + source traceability + one-click action paths.',
        },
        {
          role: 'Assessor manager / Supervisor',
          goals: ['Track team capacity and SLA health', 'Intervene on exceptions early'],
          pains: ['Reactive escalation', 'Limited visibility into AI-human split of work'],
          needs: 'Team-level risk board, exception queue, and AI performance governance signals.',
        },
        {
          role: 'Product + Design',
          goals: ['Keep workflows coherent across personas', 'Ensure UX explains trust + accountability'],
          pains: ['Feature fragmentation', 'Inconsistent component behavior'],
          needs: 'Shared end-to-end maps, reusable flow primitives, and explicit UX principles.',
        },
        {
          role: 'BA + Engineering',
          goals: ['Translate requirements into implementable stories', 'Maintain traceability to business outcomes'],
          pains: ['Ambiguous process definitions', 'Edge cases discovered late'],
          needs: 'Concrete scenarios, event contracts, and acceptance criteria tied to flows.',
        },
      ].map((u) => (
        <section key={u.role} className="rounded-xl border border-border-default bg-white p-4">
          <h3 className="text-sm font-semibold text-text-heading">{u.role}</h3>
          <div className="mt-3 space-y-2 text-[13px]">
            <p className="font-semibold text-text-secondary">Goals</p>
            <ul className="space-y-1 text-text-secondary">
              {u.goals.map((g) => (
                <li key={g}>- {g}</li>
              ))}
            </ul>
            <p className="pt-1 font-semibold text-text-secondary">Pain points</p>
            <ul className="space-y-1 text-text-secondary">
              {u.pains.map((p) => (
                <li key={p}>- {p}</li>
              ))}
            </ul>
            <p className="pt-1 text-text-secondary">
              <span className="font-semibold">Core need:</span> {u.needs}
            </p>
          </div>
        </section>
      ))}
    </div>
  );
}

function ScenariosTab() {
  const scenarios = [
    {
      title: 'Scenario A — Straight-through approval',
      context: 'High-confidence case with complete evidence package.',
      flow: 'AI recommends approve -> assessor validates -> post-approval plan starts automatically.',
      value: 'Cuts decision cycle time while preserving human accountability.',
    },
    {
      title: 'Scenario B — Missing evidence',
      context: 'Narrative strong but critical medical source absent.',
      flow: 'AI flags gap -> assessor orders requirement -> case pauses with SLA tracking.',
      value: 'Prevents premature approvals and improves audit quality.',
    },
    {
      title: 'Scenario C — Recovery setback',
      context: 'Monitoring detects worsening indicators after initial progress.',
      flow: 'Exception event raised -> manager notified -> plan adjusted and claimant follow-up task created.',
      value: 'Supports early intervention and reduces long-tail claim cost.',
    },
    {
      title: 'Scenario D — RTW and closure',
      context: 'Functional milestones met, remaining checklist incomplete.',
      flow: 'AI proposes closure readiness -> assessor verifies residual requirements -> closes with rationale.',
      value: 'Ensures closure consistency and lowers reopen risk.',
    },
  ];

  return (
    <div className="space-y-3">
      {scenarios.map((s) => (
        <section key={s.title} className="rounded-xl border border-border-default bg-white p-4">
          <h3 className="text-sm font-semibold text-text-heading">{s.title}</h3>
          <p className="mt-2 text-[13px] text-text-secondary">
            <span className="font-semibold text-text-secondary">Context:</span> {s.context}
          </p>
          <p className="mt-1.5 text-[13px] text-text-secondary">
            <span className="font-semibold text-text-secondary">Flow:</span> {s.flow}
          </p>
          <p className="mt-1.5 text-[13px] text-text-secondary">
            <span className="font-semibold text-text-secondary">Why it matters:</span> {s.value}
          </p>
        </section>
      ))}
    </div>
  );
}

export function ProductGuideModal({ open, onClose }: ProductGuideModalProps) {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<WorkspaceTab>('prd');

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    requestAnimationFrame(() => setVisible(true));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000]">
      <div
        className={`absolute inset-0 bg-black/35 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div
        className={`relative ml-[80px] mt-12 flex h-[calc(100vh-48px)] w-[calc(100vw-80px)] flex-col bg-[#f4f6f8] transition-all duration-200 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#d8dde2] bg-white px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">Case management platform</p>
            <h2 className="text-[16px] font-semibold text-text-heading">Product Concept Workspace (PRD + Flows)</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
            aria-label="Close workspace"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex shrink-0 items-center gap-2 border-b border-[#d8dde2] bg-white px-6 py-3">
          <TabButton active={tab === 'prd'} icon={ClipboardList} label="Intro & PRD" onClick={() => setTab('prd')} />
          <TabButton active={tab === 'flows'} icon={GitBranch} label="Whiteboard Flows" onClick={() => setTab('flows')} />
          <TabButton active={tab === 'users'} icon={Users} label="Users" onClick={() => setTab('users')} />
          <TabButton active={tab === 'scenarios'} icon={ClipboardList} label="Case Scenarios" onClick={() => setTab('scenarios')} />
        </div>

        <main className="min-h-0 flex-1 overflow-auto p-6">
          {tab === 'prd' && <PrdTab />}
          {tab === 'flows' && <WhiteboardFlowsTab />}
          {tab === 'users' && <UsersTab />}
          {tab === 'scenarios' && <ScenariosTab />}
        </main>
      </div>
    </div>
  );
}
