import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Edit3,
  Send,
  Settings2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../ui/button';
import { EAPP_TEMPLATES, type FormField, type FormStep, type QuestionSection } from '../../data/mock-eapp';

/* ─── Reflex override types ─── */

export type ReflexOverrides = Record<
  string,
  {
    enabledFollowUps: Record<string, boolean>;
    addedFollowUps: FormField[];
    /** Override the question's required flag (only used by the form configuration). */
    required?: boolean;
    /** Per-follow-up required overrides (only used by the form configuration). */
    requiredFollowUps?: Record<string, boolean>;
    /** Optional follow-up display order configured in the form configuration. */
    followUpOrder?: string[];
    /** Custom top-level medical condition questions added from the configuration. */
    addedQuestions?: FormField[];
  }
>;

/** Merge template reflex follow-ups with runtime overrides. */
export function getEffectiveFollowUps(
  field: FormField,
  overrides: ReflexOverrides,
): FormField[] {
  if (!field.reflexFollowUps) return [];
  const ov = overrides[field.id];
  const templateOnes = field.reflexFollowUps
    .map((f) => ({
      ...f,
      enabled: ov?.enabledFollowUps[f.id] ?? f.enabled ?? true,
    }))
    .filter((f) => f.enabled !== false);
  const added = ov?.addedFollowUps ?? [];
  const merged = [...templateOnes, ...added];
  if (!ov?.followUpOrder?.length) return merged;
  const order = new Map(ov.followUpOrder.map((id, index) => [id, index]));
  return [...merged].sort((a, b) => {
    const aIndex = order.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = order.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });
}
import {
  canSubmit,
  createEAppState,
  isStepComplete,
  resolveVisibleFields,
  resolveVisibleSections,
  resolveVisibleSteps,
  type EAppState,
} from '../../domain/eappEngine';
import { AiCueSparkle } from '../AiCueSparkle';
import { EAppFieldRenderer } from './EAppFieldRenderer';
import { EAppStepNav } from './EAppStepNav';
import { createFeedEntry, type AiFeedEntry } from './EAppAiFeed';
import { EAppFormConfigModal } from './EAppFormConfigModal';
import { EAppAiAssistPanel } from './EAppAiAssistPanel';
import { AI_ASSIST_TARGETS } from './eappAiAssistData';
import { SurfaceCard, SectionLabel } from '../ds';

/* ─── Shimmer skeleton for AI-generated sections ─── */

function AIShimmer() {
  return (
    <div className="flex animate-pulse flex-col gap-3 py-2">
      <div className="h-3 w-2/5 rounded bg-[#e8eaed]" />
      <div className="h-8 w-full rounded-md bg-surface-muted" />
      <div className="flex gap-3">
        <div className="h-8 flex-1 rounded-md bg-surface-muted" />
        <div className="h-8 flex-1 rounded-md bg-surface-muted" />
      </div>
      <div className="h-8 w-3/4 rounded-md bg-surface-muted" />
    </div>
  );
}

/* ─── Main form component ─── */

export function EAppForm() {
  const { appId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const templateId = searchParams.get('template') ?? 'tpl-whole-life';
  const template = useMemo(
    () => EAPP_TEMPLATES.find((t) => t.id === templateId) ?? EAPP_TEMPLATES[0],
    [templateId],
  );

  const [state, setState] = useState<EAppState>(() =>
    createEAppState(appId ?? 'new', template),
  );
  const [feedEntries, setFeedEntries] = useState<AiFeedEntry[]>([]);
  const [configOpen, setConfigOpen] = useState(false);
  const [reflexOverrides, setReflexOverrides] = useState<ReflexOverrides>({});
  const [expandedAiTargetId, setExpandedAiTargetId] = useState<string | null>(null);
  const [highlightedFieldId, setHighlightedFieldId] = useState<string | null>(null);
  const [aiPanelWidth, setAiPanelWidth] = useState(360);
  const [aiPanelResizing, setAiPanelResizing] = useState(false);
  const [submissionConsent, setSubmissionConsent] = useState(false);
  const [submissionSignature, setSubmissionSignature] = useState('');
  const scrollContainerRef = useRef<HTMLElement>(null);
  const fieldHighlightTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const pushFeedEntry = useCallback(
    (entry: AiFeedEntry) => setFeedEntries((prev) => [...prev, entry]),
    [],
  );

  /* Pre-fill from template defaults on mount + emit feed entries. */
  useEffect(() => {
    const prefills: Record<string, unknown> = {};
    const sectionPrefillCounts: Record<string, number> = {};
    for (const step of template.steps) {
      for (const section of step.sections) {
        let count = 0;
        for (const field of section.fields) {
          if (field.prefill !== undefined) {
            prefills[field.id] = field.prefill;
            count++;
          }
        }
        if (count > 0) sectionPrefillCounts[section.id] = count;
      }
    }
    setState((prev) => ({
      ...prev,
      answers: { ...prefills, ...prev.answers },
    }));
    const initEntries: AiFeedEntry[] = [];
    for (const sectionId of Object.keys(sectionPrefillCounts)) {
      initEntries.push(
        createFeedEntry('prefill', sectionId, {
          timestamp: Date.now() + initEntries.length,
        }),
      );
    }
    if (initEntries.length > 0) {
      setFeedEntries(initEntries);
    }
  }, [template]);

  /* Derived state */
  const visibleSteps = useMemo(
    () => resolveVisibleSteps(template, state.answers),
    [template, state.answers],
  );
  const currentStep = visibleSteps.find((s) => s.id === state.currentStepId) ?? visibleSteps[0];
  const currentStepIdx = visibleSteps.indexOf(currentStep);
  const isReview = currentStep.id === 'review';
  const isSubmission = currentStep.id === 'submission';
  const submitted = !!state.submittedAt;
  const submissionReady = canSubmit(template, state);
  const currentStepSections = useMemo(
    () => (isReview || isSubmission ? [] : resolveVisibleSections(currentStep, state.answers)),
    [currentStep, state.answers, isReview, isSubmission],
  );
  const currentStepAiTargets = useMemo(() => {
    const sectionIds = new Set(currentStepSections.map((section) => section.id));
    return AI_ASSIST_TARGETS.filter((target) => sectionIds.has(target.sectionId));
  }, [currentStepSections]);
  const currentStepSectionTitles = useMemo(
    () =>
      Object.fromEntries(
        currentStepSections.map((section) => [section.id, section.title]),
      ) as Record<string, string>,
    [currentStepSections],
  );
  const setAnswer = useCallback((fieldId: string, val: unknown) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [fieldId]: val },
    }));
  }, []);

  useEffect(() => {
    setExpandedAiTargetId(null);
  }, [state.currentStepId]);

  useEffect(() => {
    return () => {
      if (fieldHighlightTimerRef.current) {
        clearTimeout(fieldHighlightTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!aiPanelResizing) return;
    const onMove = (event: MouseEvent) => {
      const nextWidth = window.innerWidth - event.clientX;
      setAiPanelWidth(Math.min(560, Math.max(320, nextWidth)));
    };
    const onUp = () => setAiPanelResizing(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [aiPanelResizing]);

  const goToStep = useCallback(
    (stepId: string) => {
      setState((prev) => ({
        ...prev,
        currentStepId: stepId,
        visitedSteps: prev.visitedSteps.includes(stepId)
          ? prev.visitedSteps
          : [...prev.visitedSteps, stepId],
      }));
    },
    [],
  );

  const handleContinue = useCallback(() => {
    setState((prev) => {
      const completed = prev.completedSteps.includes(currentStep.id)
        ? prev.completedSteps
        : [...prev.completedSteps, currentStep.id];
      const nextStep = visibleSteps[currentStepIdx + 1];
      if (!nextStep) return { ...prev, completedSteps: completed };
      return {
        ...prev,
        completedSteps: completed,
        currentStepId: nextStep.id,
        visitedSteps: prev.visitedSteps.includes(nextStep.id)
          ? prev.visitedSteps
          : [...prev.visitedSteps, nextStep.id],
      };
    });
  }, [currentStep, visibleSteps, currentStepIdx]);

  const handleBack = useCallback(() => {
    if (currentStepIdx > 0) {
      goToStep(visibleSteps[currentStepIdx - 1].id);
    }
  }, [currentStepIdx, visibleSteps, goToStep]);

  const handleAiSectionEvent = useCallback(
    (sectionId: string, kind: 'section' | 'branch') => {
      pushFeedEntry(createFeedEntry(kind, sectionId));
    },
    [pushFeedEntry],
  );

  const handleJumpToField = useCallback((fieldId: string) => {
    const fieldNode = scrollContainerRef.current?.querySelector<HTMLElement>(
      `[data-eapp-field-id="${fieldId}"]`,
    );
    fieldNode?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedFieldId(fieldId);
    if (fieldHighlightTimerRef.current) {
      clearTimeout(fieldHighlightTimerRef.current);
    }
    fieldHighlightTimerRef.current = setTimeout(() => {
      setHighlightedFieldId(null);
    }, 1400);
  }, []);

  const handleSubmit = useCallback(() => {
    setState((prev) => ({
      ...prev,
      submittedAt: new Date().toISOString(),
      completedSteps: [...new Set([...prev.completedSteps, 'review', 'submission'])],
    }));
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => navigate('/eapp'), 2000);
  }, [navigate]);

  const showFormFooter = !submitted;
  const footerPrimaryLabel = isSubmission ? 'Submit application' : isReview ? 'Proceed to submission' : 'Continue';
  const footerPrimaryDisabled = isSubmission
    ? !submissionConsent || !submissionSignature.trim() || !submissionReady
    : false;
  const handleFooterPrimary = isSubmission ? handleSubmit : handleContinue;

  return (
    <div className="relative flex h-full min-h-0 bg-surface-primary">
      {/* Left column — step nav + quote summary, hugging content */}
      <aside className={`app-scrollbar flex w-[280px] shrink-0 flex-col gap-3 overflow-y-auto py-4 pl-5 pr-2 ${showFormFooter ? 'pb-[89px]' : ''}`}>
        {/* Steps panel — hugs content height */}
        <SurfaceCard className="flex flex-col overflow-hidden">
          <div className="border-b border-[#ececec] px-5 py-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/eapp')}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-brand-blue hover:underline"
              >
                <ChevronLeft className="size-3.5" />
                Back to applications
              </button>
              <div className="group relative">
                <button
                  type="button"
                  onClick={() => setConfigOpen(true)}
                  className="shrink-0 rounded-md p-1 text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary"
                  aria-label="Open form configuration"
                >
                  <Settings2 className="size-3.5" />
                </button>
                <span className="pointer-events-none absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded-md bg-[#1b1c1e] px-2 py-1 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  Form configuration
                </span>
              </div>
            </div>
            <p className="mt-1.5 truncate text-[13px] font-semibold text-text-primary" title={template.name}>
              {template.name}
            </p>
          </div>
          <EAppStepNav
            steps={visibleSteps}
            currentStepId={state.currentStepId}
            completedSteps={state.completedSteps}
            visitedSteps={state.visitedSteps}
            onNavigate={goToStep}
          />
        </SurfaceCard>

        {/* Quote summary island */}
        <QuoteSummaryIsland state={state} templateName={template.productType} />

        {/* AI Feed panel — sits above the form footer area, not pinned to the viewport bottom. */}
        {!submitted && feedEntries.length > 0 ? (
          <div>
            <EAppAiFeedPanel entries={feedEntries} />
          </div>
        ) : null}
      </aside>

      {/* Right content — single scrollbar at far right */}
      <main ref={scrollContainerRef} className="app-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto">
        <div className={`mx-auto max-w-[1080px] px-8 pt-6 ${showFormFooter ? 'pb-24' : 'pb-6'}`}>
          <div className="w-full">
            {submitted ? (
              <SubmittedState appId={state.id} templateName={template.name} />
            ) : isReview ? (
              <ReviewStep
                template={template}
                state={state}
                onEdit={goToStep}
              />
            ) : isSubmission ? (
              <SubmissionStep
                state={state}
                canSubmit={submissionReady}
                consent={submissionConsent}
                onConsentChange={setSubmissionConsent}
                signature={submissionSignature}
                onSignatureChange={setSubmissionSignature}
              />
            ) : (
              <FormStepContent
                step={currentStep}
                stepIndex={currentStepIdx}
                totalSteps={visibleSteps.length}
                answers={state.answers}
                onAnswer={setAnswer}
                onAiEvent={handleAiSectionEvent}
                reflexOverrides={reflexOverrides}
                highlightedFieldId={highlightedFieldId}
              />
            )}
          </div>
        </div>
      </main>
      {!submitted ? (
        <aside
          className={`relative flex h-full shrink-0 flex-col border-l border-border-default bg-surface-muted ${showFormFooter ? 'pb-[73px]' : ''}`}
          style={{ width: aiPanelWidth, transition: aiPanelResizing ? 'none' : 'width 0.16s ease' }}
        >
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize AI assistant panel"
            className={`absolute left-0 top-0 z-20 h-full w-[2px] -translate-x-1/2 cursor-col-resize transition-colors hover:bg-[#868F9B] ${
              aiPanelResizing ? 'bg-brand-navy' : 'bg-transparent'
            }`}
            onMouseDown={() => setAiPanelResizing(true)}
          />
          <EAppAiAssistPanel
            targets={currentStepAiTargets}
            sectionTitles={currentStepSectionTitles}
            expandedTargetId={expandedAiTargetId}
            onAnswer={setAnswer}
            onExpandedTargetChange={setExpandedAiTargetId}
            onJumpToField={handleJumpToField}
          />
        </aside>
      ) : null}
      {showFormFooter ? (
        <div className="absolute bottom-0 left-0 right-0 z-50 border-t border-border-default bg-surface-primary px-8 py-4">
          <div className="mx-auto flex max-w-[1080px] items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStepIdx === 0}
              className="flex items-center gap-1.5 rounded-full border border-border-default bg-white px-4 py-2 text-[13px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted disabled:opacity-40"
            >
              <ArrowLeft className="size-3.5" /> Back
            </button>
            <button
              type="button"
              onClick={handleFooterPrimary}
              disabled={footerPrimaryDisabled}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-40 ${
                isSubmission ? 'bg-[#008533] hover:bg-[#006b2a]' : ''
              }`}
              style={isSubmission ? undefined : { backgroundColor: 'var(--brand-primary)' }}
            >
              {isSubmission ? <Send className="size-3.5" /> : null}
              {footerPrimaryLabel}
              {!isSubmission ? <ArrowRight className="size-3.5" /> : null}
            </button>
          </div>
        </div>
      ) : null}
      <EAppFormConfigModal
        open={configOpen}
        onOpenChange={setConfigOpen}
        template={template}
        reflexOverrides={reflexOverrides}
        onReflexOverridesChange={setReflexOverrides}
      />
    </div>
  );
}

/* ─── Active step form content ─── */

function FormStepContent({
  step,
  stepIndex,
  totalSteps,
  answers,
  onAnswer,
  onAiEvent,
  reflexOverrides,
  highlightedFieldId,
}: {
  step: FormStep;
  stepIndex: number;
  totalSteps: number;
  answers: Record<string, unknown>;
  onAnswer: (fieldId: string, val: unknown) => void;
  onAiEvent?: (sectionId: string, kind: 'section' | 'branch') => void;
  reflexOverrides: ReflexOverrides;
  highlightedFieldId: string | null;
}) {
  const sections = useMemo(
    () => resolveVisibleSections(step, answers),
    [step, answers],
  );
  return (
    <div className="flex flex-col gap-6">
        <div>
          <SectionLabel>
            Step {stepIndex + 1} of {totalSteps}
          </SectionLabel>
          <h2 className="mt-1 text-xl font-semibold text-text-primary">{step.label}</h2>
        </div>

        {/* Sections + AI panel row — panel top aligns with first section */}
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1 flex flex-col gap-6">
            {sections.map((section) => (
              <div
                key={section.id}
                data-section-id={section.id}
              >
                <SectionRenderer
                  section={section}
                  answers={answers}
                  onAnswer={onAnswer}
                  onAiEvent={onAiEvent}
                  reflexOverrides={reflexOverrides}
                  highlightedFieldId={highlightedFieldId}
                />
              </div>
            ))}
          </div>

        </div>
    </div>
  );
}

/* ─── Section with AI shimmer ─── */

function SectionRenderer({
  section,
  answers,
  onAnswer,
  onAiEvent,
  reflexOverrides,
  highlightedFieldId,
}: {
  section: QuestionSection;
  answers: Record<string, unknown>;
  onAnswer: (fieldId: string, val: unknown) => void;
  onAiEvent?: (sectionId: string, kind: 'section' | 'branch') => void;
  reflexOverrides: ReflexOverrides;
  highlightedFieldId: string | null;
}) {
  const [revealed, setRevealed] = useState(!section.aiGenerated);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const emittedRef = useRef(false);

  useEffect(() => {
    if (!section.aiGenerated) {
      setRevealed(true);
      if (section.visibleWhen && !emittedRef.current) {
        emittedRef.current = true;
        onAiEvent?.(section.id, 'branch');
      }
      return;
    }
    setRevealed(false);
    emittedRef.current = false;
    timerRef.current = setTimeout(() => {
      setRevealed(true);
      if (!emittedRef.current) {
        emittedRef.current = true;
        onAiEvent?.(section.id, 'section');
      }
    }, 1200);
    return () => clearTimeout(timerRef.current);
  }, [section.id, section.aiGenerated, onAiEvent]);

  const visibleFields = useMemo(
    () => resolveVisibleFields(section, answers),
    [section, answers],
  );

  return (
    <div className="rounded-lg border border-border-soft bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-text-primary">{section.title}</h3>
      </div>
      {section.description ? (
        <p className="mb-4 text-[12px] text-text-secondary">{section.description}</p>
      ) : null}

      {!revealed ? (
        <AIShimmer />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {visibleFields.map((field) => (
            <FieldWithReflex
              key={field.id}
              field={field}
              answers={answers}
              onAnswer={onAnswer}
              reflexOverrides={reflexOverrides}
              highlighted={highlightedFieldId === field.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Renders a field and, if it has reflex follow-ups and the answer is "Yes",
 *  shows the enabled follow-up fields inline below it. */
function FieldWithReflex({
  field,
  answers,
  onAnswer,
  reflexOverrides,
  highlighted,
}: {
  field: FormField;
  answers: Record<string, unknown>;
  onAnswer: (fieldId: string, val: unknown) => void;
  reflexOverrides: ReflexOverrides;
  highlighted: boolean;
}) {
  const followUps =
    field.reflexFollowUps && answers[field.id] === 'Yes'
      ? getEffectiveFollowUps(field, reflexOverrides)
      : [];

  return (
    <div
      data-eapp-field-id={field.id}
      className={field.half ? 'col-span-1' : 'col-span-2'}
    >
      <EAppFieldRenderer
        field={field}
        value={answers[field.id]}
        onChange={(val) => onAnswer(field.id, val)}
        highlighted={highlighted}
      />
      {followUps.length > 0 ? (
        <div className="mt-3 rounded-lg border border-border-soft bg-white p-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {followUps.map((fu) => (
              <div key={fu.id} className={fu.half ? 'col-span-1' : 'col-span-2'}>
                <EAppFieldRenderer
                  field={fu}
                  value={answers[fu.id]}
                  onChange={(val) => onAnswer(fu.id, val)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ─── Review step ─── */

function ReviewStep({
  template,
  state,
  onEdit,
}: {
  template: typeof EAPP_TEMPLATES[number];
  state: EAppState;
  onEdit: (stepId: string) => void;
}) {
  const steps = resolveVisibleSteps(template, state.answers).filter(
    (s) => s.id !== 'review' && s.id !== 'submission',
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionLabel>
          Review
        </SectionLabel>
        <h2 className="mt-1 text-xl font-semibold text-text-primary">
          Review your application
        </h2>
        <p className="mt-1 text-[13px] text-text-secondary">
          Please review all information before proceeding to submission.
        </p>
      </div>

      {steps.map((step) => {
        const sections = resolveVisibleSections(step, state.answers);
        const complete = isStepComplete(step, state.answers);
        return (
          <div
            key={step.id}
            className="rounded-lg border border-border-soft bg-white p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {complete ? (
                  <CheckCircle2 className="size-4 text-brand-green" />
                ) : (
                  <span className="size-4 rounded-full border-2 border-border-default" />
                )}
                <h3 className="text-[14px] font-semibold text-text-primary">{step.label}</h3>
              </div>
              <button
                type="button"
                onClick={() => onEdit(step.id)}
                className="flex items-center gap-1 text-[12px] font-semibold text-brand-blue hover:underline"
              >
                <Edit3 className="size-3" /> Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {sections.flatMap((sec) =>
                resolveVisibleFields(sec, state.answers).map((field) => {
                  const val = state.answers[field.id];
                  if (val === undefined || val === null || val === '' || val === false) return null;
                  const display =
                    field.type === 'checkbox' ? 'Yes' : String(val);
                  return (
                    <div key={field.id} className={field.half ? 'col-span-1' : 'col-span-2'}>
                      <dt className="text-[11px] text-text-muted">{field.label}</dt>
                      <dd className="text-[13px] text-text-primary">{display}</dd>
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        );
      })}

    </div>
  );
}

/* ─── Submission step ─── */

function SubmissionStep({
  state,
  canSubmit: ready,
  consent,
  onConsentChange,
  signature,
  onSignatureChange,
}: {
  state: EAppState;
  canSubmit: boolean;
  consent: boolean;
  onConsentChange: (checked: boolean) => void;
  signature: string;
  onSignatureChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionLabel>
          Submission
        </SectionLabel>
        <h2 className="mt-1 text-xl font-semibold text-text-primary">Submit your application</h2>
        <p className="mt-1 text-[13px] text-text-secondary">
          Confirm consent and sign to finalize.
        </p>
      </div>

      <div className="rounded-lg border border-border-soft bg-white p-5">
        <h3 className="mb-4 text-[14px] font-semibold text-text-primary">
          Digital consent &amp; signature
        </h3>

        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border-soft bg-surface-primary p-4">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => onConsentChange(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-brand-blue"
          />
          <span className="text-[12px] leading-relaxed text-text-secondary">
            I certify that all information provided in this application is true and complete to the
            best of my knowledge. I authorize Catholic Life Insurance to obtain any necessary
            information to process this application. I understand that any misrepresentation may
            void the policy.
          </span>
        </label>

        <div className="mt-4">
          <label className="mb-1 block text-[12px] font-semibold text-text-secondary">
            Type your full name as a digital signature <span className="text-brand-red">*</span>
          </label>
          <input
            type="text"
            value={signature}
            onChange={(e) => onSignatureChange(e.target.value)}
            placeholder="e.g. Maxime Bouchard"
            className="w-full rounded-md border border-[#c4cbd2] bg-white px-3 py-2 font-serif text-[16px] italic text-text-primary outline-none placeholder:text-[#a9aeb5] focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>
      </div>

      {!ready ? (
        <div className="rounded-md border border-[#f3d2b6] bg-[#fff8e6] px-4 py-3 text-[12px] text-[#8a5a00]">
          Some required fields are incomplete. Please go back and fill them in before submitting.
        </div>
      ) : null}

    </div>
  );
}

/* ─── Post-submission success state ─── */

function SubmittedState({
  appId,
  templateName,
}: {
  appId: string;
  templateName: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-[#e5f5ea]">
        <CheckCircle2 className="size-8 text-brand-green" />
      </div>
      <h2 className="text-xl font-semibold text-text-primary">Application submitted!</h2>
      <p className="max-w-md text-[13px] text-text-secondary">
        Your <strong>{templateName}</strong> application ({appId}) has been submitted
        successfully. It will now be reviewed by the underwriting team.
      </p>
      <Button
        onClick={() => navigate('/eapp')}
        variant="outline"
        className="mt-2"
      >
        Return to dashboard
      </Button>
    </div>
  );
}

/* ─── Quote summary island ─── */

function QuoteSummaryIsland({
  state,
  templateName,
}: {
  state: EAppState;
  templateName: string;
}) {
  const faceAmount = state.answers.faceAmount as string | undefined;
  const frequency = state.answers.paymentFrequency as string | undefined;
  const hasEnoughData = !!faceAmount;

  return (
    <SurfaceCard className="px-5 py-4">
      <h3 className="text-[13px] font-semibold text-text-primary">Quote Summary</h3>
      {hasEnoughData ? (
        <dl className="mt-3 flex flex-col gap-2 text-[12px]">
          <div className="flex items-center justify-between">
            <dt className="text-text-muted">Product</dt>
            <dd className="font-medium text-text-primary">{templateName}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-text-muted">Face amount</dt>
            <dd className="font-medium text-text-primary">${faceAmount}</dd>
          </div>
          {frequency ? (
            <div className="flex items-center justify-between">
              <dt className="text-text-muted">Frequency</dt>
              <dd className="font-medium text-text-primary">{frequency}</dd>
            </div>
          ) : null}
          <div className="mt-1 border-t border-[#ececec] pt-2">
            <div className="flex items-center justify-between">
              <dt className="text-text-muted">Est. premium</dt>
              <dd className="text-[14px] font-semibold text-text-heading">
                —
              </dd>
            </div>
            <p className="mt-1 text-[10px] text-[#a9aeb5]">
              Premium estimate will update as you complete the application.
            </p>
          </div>
        </dl>
      ) : (
        <p className="mt-2 text-[12px] text-text-muted">
          Some fields are required to generate your quote.
        </p>
      )}
    </SurfaceCard>
  );
}

/* ─── AI Feed panel (sidebar, collapsed by default, header at bottom) ─── */

function EAppAiFeedPanel({ entries }: { entries: AiFeedEntry[] }) {
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [expanded, entries.length]);

  return (
    <SurfaceCard className="overflow-hidden">
      {/* Entries (above the header when expanded) */}
      {expanded ? (
        <div
          ref={listRef}
          className="app-scrollbar max-h-[240px] overflow-y-auto border-b border-[#f0f0f0]"
        >
          <div className="px-3 py-2 space-y-0">
            {entries.map((entry, idx) => (
              <div
                key={entry.id}
                className="flex items-start gap-2 py-1.5"
                style={{
                  animation: idx === entries.length - 1 ? 'aiActivityFadeIn 0.3s ease-out' : undefined,
                }}
              >
                <span className="mt-0.5 flex size-[14px] shrink-0 items-center justify-center rounded-full bg-[#e5f5ea]">
                  <CheckCircle2 className="size-2.5 text-brand-green" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] leading-snug text-text-primary" title={entry.title}>
                    {entry.title}
                  </span>
                  {entry.source ? (
                    <span className="block truncate text-[9px] text-[#a9aeb5]">{entry.source}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Header — always visible, acts as the toggle */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-2.5 bg-surface-primary px-3.5 py-2.5 text-left transition-colors hover:bg-surface-muted"
      >
        <AiCueSparkle size={14} className="shrink-0 !text-brand-accent" />
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-semibold text-brand-accent">AI Feed</span>
          <span className="ml-1.5 rounded-full bg-brand-accent-light px-1.5 py-0.5 text-[9px] font-bold text-brand-accent">
            {entries.length}
          </span>
        </div>
        <span
          className={`text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 6.5L5 3.5L8 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {/* Purple accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-brand-accent via-brand-accent/60 to-brand-accent" />
    </SurfaceCard>
  );
}
