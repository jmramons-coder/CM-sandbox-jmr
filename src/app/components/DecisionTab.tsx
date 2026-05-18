import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ArrowRight, Check, CheckCircle2, Clock, ClipboardCheck, FileCheck2, X, XCircle } from 'lucide-react';
import type { AssessmentFactor, CaseDecisionFlow, CaseDecisionOutcome, CaseOverview, DecisionTabState, DecisionType, HumanDecision } from '../types';
import { AiConfidenceKpi } from './AiSummaryWithConfidenceCard';

interface DecisionTabProps {
  caseData: CaseOverview;
  decisionTabState: DecisionTabState;
  onDecisionRecorded: (decision: HumanDecision) => void;
  onOpenAIFactors: () => void;
  openSignal?: number;
}

function optionTagClass(tagCls: string) {
  if (tagCls === 'pf') return 'bg-[#e5f5ea] text-brand-green';
  if (tagCls === 'pp') return 'bg-[#fff4e6] text-[#8a5a00]';
  if (tagCls === 'pr') return 'bg-surface-selected text-brand-blue';
  if (tagCls === 'po') return 'bg-[#fde5e4] text-brand-red';
  return 'bg-surface-muted text-text-secondary';
}

function submitButtonClass(style?: string) {
  if (style === 'success') return 'bg-brand-green text-white hover:bg-[#006f2a]';
  if (style === 'warning') return 'bg-[#8a5a00] text-white hover:bg-[#6f4700]';
  if (style === 'danger') return 'bg-brand-red text-white hover:bg-[#a7201a]';
  if (style === 'info') return 'bg-brand-blue text-white hover:bg-brand-blue-hover';
  return 'bg-brand-navy text-white hover:bg-brand-blue-hover';
}

function outcomeToneClass(outcome?: CaseDecisionOutcome) {
  const text = `${outcome?.optionId ?? ''} ${outcome?.title ?? ''}`.toLowerCase();
  if (text.includes('declin')) return 'bg-[#fde5e4] text-brand-red';
  if (text.includes('defer') || text.includes('postpone') || text.includes('review') || text.includes('escalat')) return 'bg-[#fff4e6] text-[#8a5a00]';
  return 'bg-[#e5f5ea] text-brand-green';
}

function mapDecisionType(optionId: string): DecisionType {
  if (optionId.includes('decline')) return 'decline';
  if (optionId.includes('approve') || optionId.includes('standard')) return 'approve';
  if (optionId.includes('rated')) return 'modified_offer';
  return 'request_info';
}

function OutcomeIcon({ outcome }: { outcome?: CaseDecisionOutcome }) {
  const icon = outcome?.icon;
  const cls = 'size-6';
  if (icon === 'ti-clock') return <Clock className={cls} />;
  if (icon === 'ti-circle-x') return <XCircle className={cls} />;
  if (icon === 'ti-alert-triangle') return <AlertTriangle className={cls} />;
  if (icon === 'ti-arrow-right') return <ArrowRight className={cls} />;
  if (icon === 'ti-file-certificate') return <FileCheck2 className={cls} />;
  return <Check className={cls} />;
}

function getRecommendedDecisionOption(flow: CaseDecisionFlow) {
  return flow.options.find((option) => option.id === flow.aiRecommendation.recommendedOptionId);
}

function RecommendedActionCallout({ option }: { option: CaseDecisionFlow['options'][number] }) {
  return (
    <div className="rounded-lg border border-border-soft bg-white px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Recommendation</p>
      <p className="mt-1 text-[14px] font-semibold leading-snug text-brand-blue">{option.title}</p>
    </div>
  );
}

function DecisionSummaryWithConfidence({ text, confidence }: { text: string; confidence?: number | null }) {
  const showConfidence = confidence != null && !Number.isNaN(confidence);

  return (
    <div className="flex overflow-hidden">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Summary</p>
        <p className="mt-2 text-[12px] leading-relaxed text-text-primary">{text}</p>
      </div>
      {showConfidence ? (
        <>
          <div className="mx-4 w-px shrink-0 self-stretch bg-border-soft" aria-hidden />
          <div className="flex shrink-0 items-center pr-1">
            <AiConfidenceKpi value={confidence} description="Confidence in recommended action" />
          </div>
        </>
      ) : null}
    </div>
  );
}

function DecisionAiAssessmentBar({ flow }: { flow: CaseDecisionFlow }) {
  const confidence = flow.aiRecommendation.confidence;
  const recommendedOption = getRecommendedDecisionOption(flow);
  return (
    <section className="shrink-0 border-t border-border-soft bg-white px-5 py-4">
      <DecisionSummaryWithConfidence text={flow.aiRecommendation.text} confidence={confidence} />
      {recommendedOption ? (
        <div className="mt-4 border-t border-border-soft pt-4">
          <RecommendedActionCallout option={recommendedOption} />
        </div>
      ) : null}
    </section>
  );
}

function Stepper({ flow, step }: { flow: CaseDecisionFlow; step: number }) {
  return (
    <div className="shrink-0 border-b border-border-default bg-white px-5 py-4">
      <div className="flex items-center">
        {flow.steps.map((label, index) => {
          const done = index < step;
          const active = index === step;
          return (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <span className={`relative flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${done ? 'bg-brand-green text-white' : active ? 'bg-brand-blue text-white ring-2 ring-brand-blue/25' : 'border border-border-default bg-white text-text-muted'}`}>
                {active ? <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-blue opacity-50 animate-ping" /> : null}
                {done ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span className={`ml-2 whitespace-nowrap text-[12px] font-semibold ${active || done ? 'text-text-primary' : 'text-text-muted'}`}>{label}</span>
              {index < flow.steps.length - 1 ? <span className="mx-3 h-px flex-1 bg-border-default" /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DecisionModal({ flow, onClose, onRecorded }: { flow: CaseDecisionFlow; onClose: () => void; onRecorded: (decision: HumanDecision) => void }) {
  const [step, setStep] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const selectedOption = flow.options.find((option) => option.id === selectedId);
  const selectedOutcome = selectedId ? flow.outcomes[selectedId] : undefined;
  const allChecked = flow.confirmChecks.every((_, index) => checks[index]);

  const submit = () => {
    if (!selectedOption || !selectedOutcome) return;
    onRecorded({
      decisionType: mapDecisionType(selectedOption.id),
      decisionOptionId: selectedOption.id,
      decisionTitle: selectedOption.title,
      decisionOutcome: selectedOutcome,
      reasonCodes: [selectedOption.tag],
      notes,
      recordedBy: 'Victor Ramon',
      recordedAt: new Date().toISOString(),
    });
    setStep(3);
  };

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/45 px-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="flex max-h-[90vh] w-[600px] max-w-[94vw] flex-col overflow-hidden rounded-xl border border-border-default bg-white shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
        <div className="shrink-0 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[17px] font-semibold text-text-primary">{flow.title}</h2>
              <p className="mt-1 text-[12px] text-text-secondary">{flow.subtitle}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-md p-1 text-text-secondary hover:bg-surface-muted"><X className="size-5" /></button>
          </div>
        </div>
        <Stepper flow={flow} step={step} />
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto bg-surface-primary px-5 py-4">
          {step === 0 ? (
            <div className="space-y-4">
              {flow.warnings.map((warning) => <div key={warning.text} className="rounded-lg border border-[#f5d7aa] bg-[#fff4e6] px-3 py-2 text-[12px] leading-relaxed text-[#633806]">{warning.text}</div>)}
              <section>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.35px] text-text-muted">Case summary</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {flow.keyFacts.map((fact) => <div key={fact.label} className="rounded-lg border border-border-soft bg-white px-3 py-2"><p className="text-[10px] text-text-muted">{fact.label}</p><p className="mt-0.5 text-[13px] font-semibold text-text-primary">{fact.value}</p></div>)}
                </div>
              </section>
            </div>
          ) : null}
          {step === 1 ? (
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35px] text-text-muted">Select decision</p>
              {flow.options.map((option) => {
                const selected = selectedId === option.id;
                return <button key={option.id} type="button" onClick={() => setSelectedId(option.id)} className={`flex w-full gap-3 rounded-lg border bg-white p-4 text-left transition-colors ${selected ? 'border-2 border-brand-blue bg-surface-selected-alt' : 'border-border-soft hover:border-brand-blue/40'}`}><span className={`mt-0.5 flex size-4 shrink-0 rounded-full border ${selected ? 'border-brand-blue bg-brand-blue shadow-[inset_0_0_0_4px_white]' : 'border-border-default bg-white'}`} /><span className="min-w-0"><span className={`block text-[14px] font-semibold ${selected ? 'text-brand-blue' : 'text-text-primary'}`}>{option.title}</span><span className="mt-1 block text-[12px] leading-relaxed text-text-secondary">{option.description}</span><span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${optionTagClass(option.tagCls)}`}>{option.tag}</span></span></button>;
              })}
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder="Add decision rationale..." className="w-full rounded-lg border border-border-default bg-white px-3 py-2 text-[13px] text-text-primary outline-none focus:border-brand-blue" />
            </div>
          ) : null}
          {step === 2 ? (
            <div className="space-y-4">
              <section className="rounded-lg border border-border-soft bg-white p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.35px] text-text-muted">Decision summary</p><div className="mt-3 divide-y divide-border-soft text-[12px]"><div className="flex justify-between py-2"><span className="text-text-muted">Case</span><span className="font-semibold text-text-primary">{flow.caseId}</span></div><div className="flex justify-between py-2"><span className="text-text-muted">Decision</span><span className="font-semibold text-text-primary">{selectedOption?.title ?? 'N/A'}</span></div><div className="flex justify-between py-2"><span className="text-text-muted">Assessor</span><span className="font-semibold text-text-primary">Victor Ramon</span></div>{notes ? <div className="py-2"><span className="text-text-muted">Notes</span><p className="mt-1 text-text-primary">{notes}</p></div> : null}</div></section>
              <section className="rounded-lg border border-border-soft bg-white p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.35px] text-text-muted">Attestation</p><div className="mt-3 space-y-2">{flow.confirmChecks.map((check, index) => <button key={check} type="button" onClick={() => setChecks((current) => ({ ...current, [index]: !current[index] }))} className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-surface-muted"><span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border ${checks[index] ? 'border-brand-navy bg-brand-navy text-white' : 'border-border-default bg-white'}`}>{checks[index] ? <Check className="size-3" /> : null}</span><span className="text-[12px] text-text-primary">{check}</span></button>)}</div></section>
            </div>
          ) : null}
          {step === 3 ? (
            <div className="space-y-4 text-center"><div className={`mx-auto flex size-14 items-center justify-center rounded-full ${outcomeToneClass(selectedOutcome)}`}><OutcomeIcon outcome={selectedOutcome} /></div><div><h3 className="text-[18px] font-semibold text-text-primary">{selectedOutcome?.title}</h3><p className="mt-2 text-[12px] leading-relaxed text-text-secondary">{selectedOutcome?.subtitle}</p></div><div className="overflow-hidden rounded-lg border border-border-soft bg-white text-left">{selectedOutcome?.nextSteps.map((next) => <div key={next} className="flex items-start gap-2 border-b border-border-soft px-3 py-2 last:border-b-0"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-green" /><span className="text-[12px] text-text-primary">{next}</span></div>)}</div></div>
          ) : null}
          </div>
          {step === 0 ? <DecisionAiAssessmentBar flow={flow} /> : null}
        </div>
        <div className="shrink-0 border-t border-border-default bg-white px-5 py-4"><div className="flex items-center justify-between gap-3"><button type="button" onClick={() => step === 0 ? onClose() : setStep((current) => Math.max(0, current - 1))} className="rounded-full border border-border-default px-4 py-2 text-[12px] font-semibold text-text-secondary hover:bg-surface-muted">{step === 0 ? 'Cancel' : 'Back'}</button>{step === 0 ? <button type="button" onClick={() => setStep(1)} className="rounded-full bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white">Review decision options</button> : null}{step === 1 ? <button type="button" disabled={!selectedOption} onClick={() => setStep(2)} className="rounded-full bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-40">Continue to {flow.steps[2].toLowerCase()}</button> : null}{step === 2 ? <button type="button" disabled={!allChecked} onClick={submit} className={`rounded-full px-4 py-2 text-[12px] font-semibold disabled:opacity-40 ${submitButtonClass(selectedOption?.submitStyle)}`}>{selectedOption?.submitLabel ?? 'Confirm'}</button> : null}{step === 3 ? <button type="button" onClick={onClose} className="rounded-full bg-brand-green px-4 py-2 text-[12px] font-semibold text-white">Done</button> : null}</div></div>
      </div>
    </div>,
    document.body,
  );
}

function DecisionEmptyState({ caseData, onOpen }: { caseData: CaseOverview; onOpen: () => void }) {
  return <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-border-soft bg-white p-8 text-center"><div className="max-w-md"><div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-surface-selected text-brand-blue"><ClipboardCheck className="size-6" /></div><h3 className="text-[18px] font-semibold text-text-primary">Decision not recorded yet</h3><p className="mt-2 text-[13px] leading-relaxed text-text-secondary">Review the AI recommendation, select an option, complete attestation, and record the outcome for {caseData.id}.</p><button type="button" onClick={onOpen} className="mt-5 rounded-full bg-brand-navy px-5 py-2.5 text-[13px] font-semibold text-white">Open decision modal</button></div></div>;
}

function formatRecordedAt(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function AssessmentFactorsTable({ factors, netScore }: { factors: AssessmentFactor[]; netScore: number }) {
  const totalPositive = factors.filter((factor) => factor.score > 0).reduce((sum, factor) => sum + factor.score, 0);
  const totalNegative = factors.filter((factor) => factor.score < 0).reduce((sum, factor) => sum + factor.score, 0);

  return (
    <div className="overflow-hidden rounded-md border border-border-soft">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-border-soft bg-surface-muted/60">
            <th className="px-2.5 py-2 text-left font-semibold text-text-muted">Category</th>
            <th className="px-2.5 py-2 text-left font-semibold text-text-muted">Item</th>
            <th className="px-2.5 py-2 text-right font-semibold text-text-muted">Score</th>
            <th className="px-2.5 py-2 text-left font-semibold text-text-muted">Source</th>
          </tr>
        </thead>
        <tbody>
          {factors.map((factor, index) => (
            <tr key={`${factor.category}-${factor.item}-${index}`} className="border-b border-border-soft last:border-b-0">
              <td className="px-2.5 py-2 text-text-secondary">{factor.category}</td>
              <td className="px-2.5 py-2 text-text-primary">{factor.item}</td>
              <td className={`px-2.5 py-2 text-right font-semibold ${factor.score < 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                {factor.score > 0 ? `+${factor.score}` : factor.score}
              </td>
              <td className="px-2.5 py-2 font-mono text-[10px] text-text-muted">{factor.source}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-surface-muted/40">
            <td colSpan={2} className="px-2.5 py-2.5 text-[11px] font-semibold text-text-primary">
              <span className="mr-4">
                Total positive: <span className="text-brand-red">+{totalPositive}</span>
              </span>
              <span>
                Total negative: <span className="text-brand-green">{totalNegative}</span>
              </span>
            </td>
            <td className="px-2.5 py-2.5 text-right text-[13px] font-bold text-text-heading">{netScore}</td>
            <td className="px-2.5 py-2.5 text-[10px] text-text-muted">Net score</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function DecisionAiSummaryPanel({ caseData }: { caseData: CaseOverview }) {
  const flow = caseData.decisionFlow;
  const flowRecommendation = flow?.aiRecommendation;
  const structuredRecommendation = caseData.aiDecisionRecommendation;
  const recommendedOption = flow ? getRecommendedDecisionOption(flow) : undefined;
  const confidence =
    structuredRecommendation?.confidence ?? flowRecommendation?.confidence ?? caseData.aiConfidence;
  const summaryText =
    flowRecommendation?.text ?? structuredRecommendation?.narrative ?? caseData.aiNarrative;
  const factors =
    caseData.assessmentFactors.length > 0
      ? caseData.assessmentFactors
      : structuredRecommendation?.factors ?? [];

  if (!summaryText && factors.length === 0) return null;

  return (
    <section className="rounded-lg border border-border-soft bg-white p-4">
      {summaryText ? <DecisionSummaryWithConfidence text={summaryText} confidence={confidence} /> : null}
      {recommendedOption ? (
        <div className={summaryText ? 'mt-4 border-t border-border-soft pt-4' : ''}>
          <RecommendedActionCallout option={recommendedOption} />
        </div>
      ) : null}
      {factors.length > 0 ? (
        <div className={summaryText ? 'mt-4 border-t border-border-soft pt-3' : 'pt-1'}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Assessment factors</p>
          <AssessmentFactorsTable factors={factors} netScore={caseData.netAssessmentScore} />
        </div>
      ) : null}
    </section>
  );
}

function FinalDecisionSection({
  caseData,
  decision,
  outcome,
}: {
  caseData: CaseOverview;
  decision: HumanDecision;
  outcome: CaseDecisionOutcome;
}) {
  const aiRecommendation = caseData.aiDecisionRecommendation;

  return (
    <section className="rounded-lg border border-border-soft bg-white p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">Final decision</p>
      <div className="mt-3 flex flex-wrap items-start gap-3">
        <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${outcomeToneClass(outcome)}`}>
          {decision.decisionTitle ?? outcome.title}
        </span>
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${outcomeToneClass(outcome)}`}>
          <OutcomeIcon outcome={outcome} />
        </div>
      </div>
      <h3 className="mt-3 text-[18px] font-semibold text-text-heading">{outcome.title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">{outcome.subtitle}</p>

      <dl className="mt-4 grid gap-3 border-t border-border-soft pt-4 text-[12px] sm:grid-cols-2">
        <div>
          <dt className="text-text-muted">Recorded by</dt>
          <dd className="mt-0.5 font-semibold text-text-primary">{decision.recordedBy}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Recorded at</dt>
          <dd className="mt-0.5 font-semibold text-text-primary">{formatRecordedAt(decision.recordedAt)}</dd>
        </div>
        {aiRecommendation?.benefitAmount && decision.decisionType === 'approve' ? (
          <div>
            <dt className="text-text-muted">Benefit position</dt>
            <dd className="mt-0.5 font-semibold text-text-primary">{aiRecommendation.benefitAmount}</dd>
          </div>
        ) : null}
        {decision.modifiedTerms ? (
          <>
            <div>
              <dt className="text-text-muted">Modified benefit</dt>
              <dd className="mt-0.5 font-semibold text-text-primary">{decision.modifiedTerms.modifiedBenefit}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Benefit period</dt>
              <dd className="mt-0.5 font-semibold text-text-primary">{decision.modifiedTerms.benefitPeriod}</dd>
            </div>
            {decision.modifiedTerms.exclusions ? (
              <div className="sm:col-span-2">
                <dt className="text-text-muted">Exclusions</dt>
                <dd className="mt-0.5 text-text-primary">{decision.modifiedTerms.exclusions}</dd>
              </div>
            ) : null}
          </>
        ) : null}
        {decision.declineRationale ? (
          <div className="sm:col-span-2">
            <dt className="text-text-muted">Decline rationale</dt>
            <dd className="mt-0.5 text-text-primary">{decision.declineRationale}</dd>
          </div>
        ) : null}
        {decision.notes ? (
          <div className="sm:col-span-2">
            <dt className="text-text-muted">Rationale</dt>
            <dd className="mt-0.5 leading-relaxed text-text-primary">{decision.notes}</dd>
          </div>
        ) : null}
      </dl>

      {outcome.nextSteps.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-border-soft">
          <p className="border-b border-border-soft bg-surface-muted/50 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3px] text-text-muted">
            Next steps
          </p>
          {outcome.nextSteps.map((step) => (
            <div key={step} className="flex items-start gap-2 border-b border-border-soft bg-white px-3 py-2 last:border-b-0">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-green" />
              <span className="text-[12px] text-text-primary">{step}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function DecisionOutcomeView({ caseData }: { caseData: CaseOverview }) {
  const decision = caseData.humanDecision;
  const outcome = decision?.decisionOutcome;
  if (!decision || !outcome) return <DecisionEmptyState caseData={caseData} onOpen={() => undefined} />;
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
      <FinalDecisionSection caseData={caseData} decision={decision} outcome={outcome} />
      <DecisionAiSummaryPanel caseData={caseData} />
    </div>
  );
}

export function DecisionTab({ caseData, decisionTabState, onDecisionRecorded, onOpenAIFactors, openSignal = 0 }: DecisionTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => { if (openSignal > 0) setModalOpen(true); }, [openSignal]);
  const flow = caseData.decisionFlow;
  const completed = decisionTabState === 'completed' && caseData.humanDecision?.decisionOutcome;
  if (!flow) return <div className="rounded-lg border border-border-soft bg-white p-6 text-sm text-text-secondary">No decision flow is configured for this case.</div>;
  return <div className="max-w-[1200px]">{completed ? <DecisionOutcomeView caseData={caseData} /> : <DecisionEmptyState caseData={caseData} onOpen={() => setModalOpen(true)} />}{modalOpen ? <DecisionModal flow={flow} onClose={() => setModalOpen(false)} onRecorded={onDecisionRecorded} /> : null}</div>;
}
