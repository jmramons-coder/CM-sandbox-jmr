import { useEffect, useRef, useState, type ComponentType, type ReactNode, type SVGProps } from 'react';
import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  GitBranch,
  GripVertical,
  Hash,
  HeartPulse,
  List,
  Plus,
  Send,
  Settings2,
  Shield,
  ToggleLeft,
  Type,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { ConfigBadge } from '../ds';
import { AiCueSparkle } from '../AiCueSparkle';
import type { EAppTemplate, FormField, FormStep, QuestionSection, FieldType } from '../../data/mock-eapp';
import type { ReflexOverrides } from './EAppForm';

/* ─── Human-readable branch descriptions ─── */

const SECTION_BRANCH_DESC: Record<string, string> = {
  'tobacco-detail': 'IF applicant answers "Yes" to tobacco use in the last 12 months',
  'medication-detail': 'IF applicant answers "Yes" to currently taking medications',
  'income-verification': 'IF face amount ≥ $250,000',
  'contingent-ben': 'AFTER primary beneficiary section is completed (AI-generated)',
  'contact': 'AFTER personal details section is completed (AI-generated, pre-filled from client profile)',
  'riders': 'AI-recommended based on applicant profile (age, coverage, health)',
  'term-riders': 'AI-recommended based on term length and coverage amount',
};

const FIELD_BRANCH_DESC: Record<string, string> = {
  'riderLongTermCare': 'IF face amount ≥ $100,000',
  'employer': 'IF employment status = "Employed"',
};

const UW_ROUTING: Record<string, string> = {
  'tobacco-detail': 'Routes to tobacco risk assessment. Frequency + type affect rate class.',
  'income-verification': 'Financial verification required for high face amounts. Existing insurance and replacement intent assessed.',
  'medication-detail': 'Medication list forwarded to Rx check and UW workbench as structured data.',
};

const FIELD_ICON: Record<FieldType, typeof Type> = {
  text: Type,
  number: Hash,
  date: Calendar,
  select: List,
  radio: ToggleLeft,
  checkbox: CheckSquare,
  textarea: AlignLeft,
};

type StepIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

type FollowUpDropTarget = {
  id: string;
  position: 'before' | 'after';
};

const STEP_ICONS: Record<string, StepIcon> = {
  applicant: User,
  beneficiary: Users,
  coverage: Shield,
  medical: HeartPulse,
  financial: Wallet,
  review: ClipboardCheck,
  submission: Send,
};

function getStepIcon(stepId: string): StepIcon {
  return STEP_ICONS[stepId] ?? Settings2;
}

/* ─── Modal ─── */

export function EAppFormConfigModal({
  open,
  onOpenChange,
  template,
  reflexOverrides,
  onReflexOverridesChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: EAppTemplate;
  reflexOverrides: ReflexOverrides;
  onReflexOverridesChange: (overrides: ReflexOverrides) => void;
}) {
  const [activeStepId, setActiveStepId] = useState(template.steps[0]?.id ?? '');
  const activeStep = template.steps.find((s) => s.id === activeStepId) ?? template.steps[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[1360px] p-0 gap-0 overflow-hidden rounded-xl flex"
        style={{ width: 'min(1360px, calc(100vw - 2rem))', height: 'min(880px, calc(100vh - 2rem))' }}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Form Configuration — {template.name}</DialogTitle>

        {/* ─── Left sidebar ─── */}
        <aside className="flex w-[220px] shrink-0 flex-col border-r border-[#ececec] bg-surface-primary">
          <div className="px-5 pb-3 pt-5">
            <p className="text-[13px] font-semibold text-text-primary">Form configuration</p>
            <p className="mt-0.5 truncate text-[11px] text-text-muted" title={template.name}>
              {template.name}
            </p>
          </div>
          <nav
            role="tablist"
            aria-label="Form steps"
            className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-4"
          >
            {template.steps.map((step) => {
              const isActive = step.id === activeStepId;
              const Icon = getStepIcon(step.id);
              return (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveStepId(step.id)}
                  className={`group relative flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] transition-colors ${
                    isActive
                      ? 'bg-[#ececec] font-semibold text-text-primary'
                      : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{step.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ─── Right content pane ─── */}
        <section className="flex min-w-0 flex-1 flex-col bg-white">
          <header className="flex items-start justify-between gap-4 px-7 pb-2 pt-6">
            <div className="min-w-0">
              <h2 className="text-[17px] font-semibold text-text-primary">{activeStep.label}</h2>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="-mr-1 -mt-1 rounded-md p-1.5 text-text-secondary hover:bg-surface-muted hover:text-text-primary"
            >
              <X className="size-4" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-6 pt-2">
            {activeStep.id === 'review' || activeStep.id === 'submission' ? (
              <div className="flex items-center justify-center py-16 text-[13px] text-text-muted">
                System-generated step — no configurable fields.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {activeStep.sections.map((section, sIdx) => (
                  <SectionConfig
                    key={section.id}
                    section={section}
                    index={sIdx}
                    reflexOverrides={reflexOverrides}
                    onReflexOverridesChange={onReflexOverridesChange}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Section card ─── */

function SectionConfig({
  section,
  index,
  reflexOverrides,
  onReflexOverridesChange,
}: {
  section: QuestionSection;
  index: number;
  reflexOverrides: ReflexOverrides;
  onReflexOverridesChange: (overrides: ReflexOverrides) => void;
}) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const branchDesc = SECTION_BRANCH_DESC[section.id];
  const uwRouting = UW_ROUTING[section.id];
  const reflexFieldCount = section.fields.filter((f) => f.reflexFollowUps?.length).length;
  const [expanded, setExpanded] = useState(section.id === 'health-conditions');

  useEffect(() => {
    if (!expanded) return;
    const timeout = window.setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [expanded]);

  return (
    <div ref={sectionRef} className="rounded-lg border border-border-soft bg-white">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-primary ${
          expanded ? 'rounded-t-lg' : 'rounded-lg'
        }`}
      >
        {expanded ? (
          <ChevronDown className="size-3.5 shrink-0 text-text-secondary" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0 text-text-secondary" />
        )}
        <span className="text-[13px] font-semibold text-text-primary">{section.title}</span>
        <div className="ml-auto flex items-center gap-2">
          {section.aiGenerated ? (
            <ConfigBadge tone="accent">
              <AiCueSparkle size={12} className="!text-current" /> AI Generated
            </ConfigBadge>
          ) : null}
          {reflexFieldCount > 0 ? (
            <ConfigBadge tone="warning">
              <GitBranch className="size-3" /> {reflexFieldCount} reflex
            </ConfigBadge>
          ) : branchDesc ? (
            <ConfigBadge tone="warning">
              <GitBranch className="size-3" /> 1 branch
            </ConfigBadge>
          ) : null}
          <ConfigBadge>{section.fields.length} fields</ConfigBadge>
        </div>
      </button>

      {expanded ? (
        <div className="border-t border-border-divider">
          {branchDesc ? (
            <div className="flex items-start gap-2 border-b border-dashed border-border-soft bg-[#fffbf5] px-4 py-2.5">
              <GitBranch className="mt-0.5 size-3.5 shrink-0 text-[#a36d00]" />
              <div>
                <p className="text-[11px] font-semibold text-[#8a5a00]">{branchDesc}</p>
                {uwRouting ? (
                  <p className="mt-0.5 text-[10px] text-[#a36d00]">UW: {uwRouting}</p>
                ) : null}
              </div>
            </div>
          ) : null}

          {section.description ? (
            <div className="border-b border-border-divider px-4 py-2">
              <p className="text-[11px] italic text-text-muted">{section.description}</p>
            </div>
          ) : null}

          <div className="divide-y divide-border-divider">
            {getSectionConfigFields(section, reflexOverrides).map((field, fieldIndex) => (
              <FieldConfig
                key={field.id}
                sectionId={section.id}
                field={field}
                defaultOpen={section.id === 'health-conditions' && fieldIndex === 0}
                reflexOverrides={reflexOverrides}
                onReflexOverridesChange={onReflexOverridesChange}
              />
            ))}
            {section.id === 'health-conditions' ? (
              <AddHealthConditionQuestion onAdd={(field) => addHealthConditionQuestion(reflexOverrides, onReflexOverridesChange, field)} />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getSectionConfigFields(section: QuestionSection, reflexOverrides: ReflexOverrides) {
  if (section.id !== 'health-conditions') return section.fields;
  const customQuestions = reflexOverrides.__healthConditions?.addedQuestions ?? [];
  return [...section.fields, ...customQuestions];
}

function addHealthConditionQuestion(
  reflexOverrides: ReflexOverrides,
  onReflexOverridesChange: (overrides: ReflexOverrides) => void,
  field: FormField,
) {
  const current = reflexOverrides.__healthConditions?.addedQuestions ?? [];
  onReflexOverridesChange({
    ...reflexOverrides,
    __healthConditions: {
      enabledFollowUps: {},
      addedFollowUps: [],
      addedQuestions: [...current, field],
    },
  });
}

/* ─── Field row (with reflex tree editor) ─── */

function FieldConfig({
  sectionId,
  field,
  defaultOpen = false,
  reflexOverrides,
  onReflexOverridesChange,
}: {
  sectionId: string;
  field: FormField;
  defaultOpen?: boolean;
  reflexOverrides: ReflexOverrides;
  onReflexOverridesChange: (overrides: ReflexOverrides) => void;
}) {
  const Icon = FIELD_ICON[field.type] ?? Type;
  const branchDesc = FIELD_BRANCH_DESC[field.id];
  const hasReflex = (field.reflexFollowUps?.length ?? 0) > 0;
  const isMedicalFollowUpQuestion = sectionId === 'health-conditions' && hasReflex;
  const [reflexExpanded, setReflexExpanded] = useState(isMedicalFollowUpQuestion);

  const ov = reflexOverrides[field.id];
  const enabledMap = ov?.enabledFollowUps ?? {};
  const requiredFollowUpMap = ov?.requiredFollowUps ?? {};
  const followUpOrder = ov?.followUpOrder ?? [];
  const addedFollowUps = ov?.addedFollowUps ?? [];

  const baseOverride = {
    enabledFollowUps: enabledMap,
    addedFollowUps,
    required: ov?.required,
    requiredFollowUps: requiredFollowUpMap,
    followUpOrder,
  } as const;

  const isFollowUpEnabled = (fuId: string, defaultEnabled?: boolean) =>
    enabledMap[fuId] ?? defaultEnabled ?? true;

  const isFollowUpRequired = (fuId: string, defaultRequired?: boolean) =>
    requiredFollowUpMap[fuId] ?? defaultRequired ?? false;

  const toggleFollowUp = (fuId: string, enabled: boolean) => {
    onReflexOverridesChange({
      ...reflexOverrides,
      [field.id]: {
        ...baseOverride,
        enabledFollowUps: { ...enabledMap, [fuId]: enabled },
      },
    });
  };

  const toggleFollowUpRequired = (fuId: string, required: boolean) => {
    onReflexOverridesChange({
      ...reflexOverrides,
      [field.id]: {
        ...baseOverride,
        requiredFollowUps: { ...requiredFollowUpMap, [fuId]: required },
      },
    });
  };

  const addFollowUp = (fu: FormField) => {
    const currentIds = getOrderedFollowUps([...(field.reflexFollowUps ?? []), ...addedFollowUps], followUpOrder).map((item) => item.id);
    onReflexOverridesChange({
      ...reflexOverrides,
      [field.id]: {
        ...baseOverride,
        enabledFollowUps: { ...enabledMap, [fu.id]: true },
        addedFollowUps: [...addedFollowUps, fu],
        followUpOrder: [...currentIds, fu.id],
      },
    });
  };

  const reorderFollowUp = (draggedId: string, target: FollowUpDropTarget | null) => {
    if (!target || draggedId === target.id) return;
    const ordered = getOrderedFollowUps([...(field.reflexFollowUps ?? []), ...addedFollowUps], followUpOrder);
    const next = moveFollowUpToDropTarget(ordered, draggedId, target);
    onReflexOverridesChange({
      ...reflexOverrides,
      [field.id]: {
        ...baseOverride,
        followUpOrder: next.map((item) => item.id),
      },
    });
  };

  const allFollowUps = getOrderedFollowUps([...(field.reflexFollowUps ?? []), ...addedFollowUps], followUpOrder);
  const enabledCount = allFollowUps.filter(
    (fu) => isFollowUpEnabled(fu.id, fu.enabled),
  ).length;
  const useMedicalBranchConfigurator = isMedicalFollowUpQuestion;

  const requiredOverride = ov?.required;
  const effectiveRequired = requiredOverride ?? field.required ?? false;
  const toggleRequired = (next: boolean) => {
    onReflexOverridesChange({
      ...reflexOverrides,
      [field.id]: {
        ...baseOverride,
        required: next,
      },
    });
  };

  if (useMedicalBranchConfigurator) {
    return (
      <MedicalAnswerPath
        field={field}
        defaultOpen={defaultOpen}
        followUps={allFollowUps}
        enabledCount={enabledCount}
        required={effectiveRequired}
        onToggleRequired={toggleRequired}
        isFollowUpEnabled={isFollowUpEnabled}
        onToggleFollowUp={toggleFollowUp}
        isFollowUpRequired={isFollowUpRequired}
        onToggleFollowUpRequired={toggleFollowUpRequired}
        onReorderFollowUp={reorderFollowUp}
        onAddFollowUp={addFollowUp}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-primary">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-text-primary">{field.label}</p>
          {branchDesc ? (
            <p className="mt-0.5 truncate text-[11px] text-text-secondary">{branchDesc}</p>
          ) : field.helpText ? (
            <p className="mt-0.5 truncate text-[11px] text-text-secondary">{field.helpText}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ConfigBadge>
            <Icon className="size-3" />
            {field.type}
          </ConfigBadge>
          {field.options ? (
            <ConfigBadge>{field.options.length} options</ConfigBadge>
          ) : null}
          {field.prefill ? (
            <ConfigBadge tone="accent">
              <AiCueSparkle size={12} className="!text-current" />
              Pre-fill
            </ConfigBadge>
          ) : null}
          {field.required ? (
            <ConfigBadge tone="warning">Required</ConfigBadge>
          ) : null}
          {hasReflex ? (
            <button
              type="button"
              onClick={() => setReflexExpanded(!reflexExpanded)}
              className="inline-flex"
            >
              <ConfigBadge tone="warning">
                <GitBranch className="size-3" />
                {enabledCount}/{allFollowUps.length} follow-ups
              </ConfigBadge>
            </button>
          ) : null}
        </div>
      </div>

      {hasReflex && reflexExpanded ? (
        <div className="border-t border-border-divider bg-surface-primary px-4 py-3">
          <p className="mb-2 text-[11px] font-semibold text-text-primary">
            If answer is "Yes", ask these follow-up questions
          </p>
          <div className="flex flex-col gap-1.5">
            {allFollowUps.map((fu) => (
              <FollowUpToggleRow
                key={fu.id}
                followUp={fu}
                enabled={isFollowUpEnabled(fu.id, fu.enabled)}
                onToggle={(enabled) => toggleFollowUp(fu.id, enabled)}
                compact
              />
            ))}
          </div>
          <AddFollowUpForm fieldId={field.id} onAdd={addFollowUp} />
        </div>
      ) : null}
    </div>
  );
}

function getOrderedFollowUps(followUps: FormField[], order: string[]) {
  if (!order.length) return followUps;
  const orderMap = new Map(order.map((id, index) => [id, index]));
  return [...followUps].sort((a, b) => {
    const aIndex = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });
}

function getFollowUpDropTarget(
  followUps: FormField[],
  draggedId: string | null,
  targetId: string,
): FollowUpDropTarget | null {
  if (!draggedId || draggedId === targetId) return null;
  const draggedIndex = followUps.findIndex((item) => item.id === draggedId);
  const targetIndex = followUps.findIndex((item) => item.id === targetId);
  if (draggedIndex < 0 || targetIndex < 0) return null;
  return {
    id: targetId,
    position: targetIndex > draggedIndex ? 'after' : 'before',
  };
}

function moveFollowUpToDropTarget(
  followUps: FormField[],
  draggedId: string,
  target: FollowUpDropTarget,
): FormField[] {
  const draggedItem = followUps.find((item) => item.id === draggedId);
  if (!draggedItem) return followUps;
  const remaining = followUps.filter((item) => item.id !== draggedId);
  const targetIndex = remaining.findIndex((item) => item.id === target.id);
  if (targetIndex < 0) return followUps;
  const next = [...remaining];
  next.splice(target.position === 'after' ? targetIndex + 1 : targetIndex, 0, draggedItem);
  return next;
}

function MedicalAnswerPath({
  field,
  defaultOpen = false,
  followUps,
  enabledCount,
  required,
  onToggleRequired,
  isFollowUpEnabled,
  onToggleFollowUp,
  isFollowUpRequired,
  onToggleFollowUpRequired,
  onReorderFollowUp,
  onAddFollowUp,
}: {
  field: FormField;
  defaultOpen?: boolean;
  followUps: FormField[];
  enabledCount: number;
  required: boolean;
  onToggleRequired: (next: boolean) => void;
  isFollowUpEnabled: (fuId: string, defaultEnabled?: boolean) => boolean;
  onToggleFollowUp: (fuId: string, enabled: boolean) => void;
  isFollowUpRequired: (fuId: string, defaultRequired?: boolean) => boolean;
  onToggleFollowUpRequired: (fuId: string, required: boolean) => void;
  onReorderFollowUp: (draggedId: string, target: FollowUpDropTarget | null) => void;
  onAddFollowUp: (fu: FormField) => void;
}) {
  const questionRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(defaultOpen);
  const [draggingFollowUpId, setDraggingFollowUpId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<FollowUpDropTarget | null>(null);

  useEffect(() => {
    if (!expanded) return;
    const timeout = window.setTimeout(() => {
      questionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [expanded]);

  return (
    <div ref={questionRef} className={expanded ? 'bg-surface-primary' : ''}>
      <div className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-primary">
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse question' : 'Expand question'}
          onClick={() => setExpanded((prev) => !prev)}
          className="flex shrink-0 items-center justify-center rounded text-text-secondary"
        >
          {expanded ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate text-[13px] font-semibold text-text-primary">{field.label}</p>
        </button>
        <div className="flex shrink-0 items-center gap-3">
          <ConfigBadge tone="warning">{enabledCount}/{followUps.length} active follow-ups</ConfigBadge>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex" onClick={(event) => event.stopPropagation()}>
                <Switch
                  checked={required}
                  onCheckedChange={onToggleRequired}
                  aria-label={`Mark ${field.label} as required`}
                  className="data-[state=checked]:bg-brand-blue"
                />
              </span>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={8}>
              Set this question as required
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {expanded ? (
        <div className="relative ml-9 mb-3 pl-6 pb-3">
          <span className="pointer-events-none absolute left-0 top-6 bottom-[24px] w-px bg-border-default" aria-hidden />

          <div className="relative mb-4">
            <span className="pointer-events-none absolute -left-6 top-3 h-3 w-6 rounded-tl-md border-l border-t border-border-default bg-surface-primary" aria-hidden />
            <AnswerOutcomeRow
              tone="yes"
              answer="Yes"
              description="Ask the selected follow-up questions inline."
            >
              <div className="flex flex-col">
                {followUps.map((fu, index) => {
                  const showPlaceholderBefore =
                    dropTarget?.id === fu.id && dropTarget.position === 'before';
                  const showPlaceholderAfter =
                    dropTarget?.id === fu.id && dropTarget.position === 'after';

                  return (
                    <div key={fu.id}>
                      {showPlaceholderBefore ? (
                        <FollowUpDropPlaceholder
                          onDragOver={() => setDropTarget(getFollowUpDropTarget(followUps, draggingFollowUpId, fu.id))}
                          onDrop={(draggedId) => {
                            onReorderFollowUp(draggedId, dropTarget);
                            setDraggingFollowUpId(null);
                            setDropTarget(null);
                          }}
                        />
                      ) : null}
                      <FollowUpPathRow
                        followUp={fu}
                        enabled={isFollowUpEnabled(fu.id, fu.enabled)}
                        onToggle={(enabled) => onToggleFollowUp(fu.id, enabled)}
                        required={isFollowUpRequired(fu.id, fu.required)}
                        onToggleRequired={(value) => onToggleFollowUpRequired(fu.id, value)}
                        onReorder={onReorderFollowUp}
                        onDragStart={() => setDraggingFollowUpId(fu.id)}
                        onDragEnd={() => {
                          setDraggingFollowUpId(null);
                          setDropTarget(null);
                        }}
                        onDragTarget={() => setDropTarget(getFollowUpDropTarget(followUps, draggingFollowUpId, fu.id))}
                        dropTarget={dropTarget}
                        dragging={draggingFollowUpId === fu.id}
                        isLast={index === followUps.length - 1}
                      />
                      {showPlaceholderAfter ? (
                        <FollowUpDropPlaceholder
                          className="mt-1"
                          onDragOver={() => setDropTarget(getFollowUpDropTarget(followUps, draggingFollowUpId, fu.id))}
                          onDrop={(draggedId) => {
                            onReorderFollowUp(draggedId, dropTarget);
                            setDraggingFollowUpId(null);
                            setDropTarget(null);
                          }}
                        />
                      ) : null}
                    </div>
                  );
                })}
                <div className="pl-5">
                  <AddFollowUpForm fieldId={field.id} onAdd={onAddFollowUp} />
                </div>
              </div>
            </AnswerOutcomeRow>
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute -left-6 top-0 h-3 w-6 rounded-bl-md border-b border-l border-border-default bg-surface-primary" aria-hidden />
            <AnswerOutcomeRow
              tone="no"
              answer="No"
              description="Continue to the next question. No follow-up is asked."
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AnswerOutcomeRow({
  tone,
  answer,
  description,
  children,
}: {
  tone: 'yes' | 'no';
  answer: string;
  description: string;
  children?: ReactNode;
}) {
  const isYes = tone === 'yes';
  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-[22px] min-w-[40px] items-center justify-center rounded-full px-2 text-[11px] font-bold ${
            isYes ? 'bg-brand-blue text-white' : 'bg-surface-muted text-text-secondary'
          }`}
        >
          {answer}
        </span>
        <span className="text-[11px] text-text-secondary">{description}</span>
      </div>
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

function FollowUpPathRow({
  followUp,
  enabled,
  onToggle,
  required,
  onToggleRequired,
  onReorder,
  onDragStart,
  onDragEnd,
  onDragTarget,
  dropTarget,
  dragging,
  isLast = false,
}: {
  followUp: FormField;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  required: boolean;
  onToggleRequired: (value: boolean) => void;
  onReorder: (draggedId: string, target: FollowUpDropTarget | null) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragTarget: () => void;
  dropTarget: FollowUpDropTarget | null;
  dragging: boolean;
  isLast?: boolean;
}) {
  const FuIcon = FIELD_ICON[followUp.type] ?? Type;
  const toggleEnabled = () => onToggle(!enabled);
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onClick={toggleEnabled}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleEnabled();
        }
      }}
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', followUp.id);
        event.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        event.preventDefault();
        onDragTarget();
      }}
      onDrop={(event) => {
        event.preventDefault();
        const draggedId = event.dataTransfer.getData('text/plain');
        if (draggedId) onReorder(draggedId, dropTarget);
        onDragEnd();
      }}
      className={`relative flex items-center gap-2.5 px-2.5 py-2 transition-colors ${
        enabled ? 'text-text-primary' : 'text-[#a9aeb5]'
      } ${isLast ? '' : 'border-b border-dashed border-border-soft'} cursor-grab hover:bg-surface-primary active:cursor-grabbing ${
        dragging ? 'bg-surface-hover opacity-60' : ''
      }`}
    >
      <button
        type="button"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        className="flex size-5 shrink-0 cursor-grab items-center justify-center rounded text-text-muted hover:bg-surface-muted hover:text-text-primary active:cursor-grabbing"
        aria-label={`Reorder follow-up: ${followUp.label}`}
      >
        <GripVertical className="size-3.5" />
      </button>
      <Checkbox
        checked={enabled}
        onCheckedChange={(value) => onToggle(value === true)}
        onClick={(event) => event.stopPropagation()}
        aria-label={`Activate follow-up: ${followUp.label}`}
      />
      <span className={`min-w-0 flex-1 truncate text-[11px] ${enabled ? 'text-text-primary' : 'line-through'}`}>
        {followUp.label}
      </span>
      <span className="w-[82px] shrink-0 text-center">
        <span className="inline-flex items-center gap-1 rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[8px] text-text-muted">
          <FuIcon className="size-2.5" />
          {followUp.type}
        </span>
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex w-[52px] shrink-0 justify-end"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <Switch
              checked={required}
              onCheckedChange={onToggleRequired}
              aria-label={`Mark ${followUp.label} as required`}
              className="data-[state=checked]:bg-brand-blue"
            />
          </span>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={8}>
          Set this follow-up as required
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function FollowUpDropPlaceholder({
  className = '',
  onDragOver,
  onDrop,
}: {
  className?: string;
  onDragOver: () => void;
  onDrop: (draggedId: string) => void;
}) {
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDrop={(event) => {
        event.preventDefault();
        const draggedId = event.dataTransfer.getData('text/plain');
        if (draggedId) onDrop(draggedId);
      }}
      className={`px-2.5 py-1 ${className}`}
    >
      <div className="h-8 rounded-md border border-dashed border-border-default bg-surface-muted" />
    </div>
  );
}

function FollowUpToggleRow({
  followUp,
  enabled,
  onToggle,
  compact = false,
}: {
  followUp: FormField;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  compact?: boolean;
}) {
  const FuIcon = FIELD_ICON[followUp.type] ?? Type;
  return (
    <label
      className={`flex cursor-pointer items-center gap-2.5 rounded-md border transition-colors ${
        compact ? 'px-2.5 py-2' : 'px-3 py-2.5'
      } ${enabled ? 'border-border-soft bg-white' : 'border-transparent bg-surface-muted opacity-60'}`}
    >
      <Checkbox
        checked={enabled}
        onCheckedChange={(value) => onToggle(value === true)}
        aria-label={`Activate follow-up: ${followUp.label}`}
      />
      <span className={`min-w-0 flex-1 truncate text-[11px] ${enabled ? 'text-text-primary' : 'text-[#a9aeb5] line-through'}`}>
        {followUp.label}
      </span>
      <span className="inline-flex items-center gap-1 rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[8px] text-text-muted">
        <FuIcon className="size-2.5" />
        {followUp.type}
      </span>
      {followUp.required ? (
        <span className="text-[8px] font-bold text-brand-red">REQ</span>
      ) : null}
    </label>
  );
}

/* ─── Add follow-up inline form ─── */

function AddFollowUpForm({
  fieldId,
  onAdd,
}: {
  fieldId: string;
  onAdd: (fu: FormField) => void;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [type, setType] = useState<FieldType>('text');
  const [options, setOptions] = useState('');

  const handleAdd = () => {
    if (!label.trim()) return;
    const id = `${fieldId}_custom_${Date.now().toString(36)}`;
    const fu: FormField = {
      id,
      label: label.trim(),
      type,
      enabled: true,
    };
    if ((type === 'select' || type === 'radio') && options.trim()) {
      fu.options = options.split(',').map((o) => o.trim()).filter(Boolean);
    }
    onAdd(fu);
    setLabel('');
    setType('text');
    setOptions('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-brand-blue hover:underline"
      >
        <Plus className="size-3" /> Add follow-up question
      </button>
    );
  }

  const supportsOptions = type === 'select' || type === 'radio';

  return (
    <div className="mt-2 rounded-md border border-border-soft bg-white p-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-text-primary">Question</span>
        <textarea
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Type the follow-up question..."
          rows={2}
          className="w-full resize-y rounded border border-[#c4cbd2] px-2 py-1.5 text-[12px] leading-snug text-text-primary outline-none placeholder:text-text-placeholder focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
          autoFocus
        />
      </label>

      <div className="mt-3 grid grid-cols-[200px_minmax(0,1fr)] items-start gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-text-primary">Answer type</span>
          <Select value={type} onValueChange={(v) => setType(v as FieldType)}>
            <SelectTrigger className="h-9 border-[#c4cbd2] bg-white text-[12px]">
              <SelectValue placeholder="Select answer type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Short text</SelectItem>
              <SelectItem value="textarea">Long text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="select">Dropdown</SelectItem>
              <SelectItem value="radio">Multiple choice</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span
            className={`text-[11px] font-semibold ${
              supportsOptions ? 'text-text-primary' : 'text-text-muted'
            }`}
          >
            Options
          </span>
          <input
            type="text"
            value={supportsOptions ? options : ''}
            onChange={(e) => setOptions(e.target.value)}
            disabled={!supportsOptions}
            placeholder={
              supportsOptions
                ? 'Comma-separated, e.g. Yes, No, Maybe'
                : 'Available for Dropdown or Multiple choice'
            }
            className="w-full rounded border border-[#c4cbd2] px-2 py-1.5 text-[12px] outline-none placeholder:text-text-placeholder focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted disabled:placeholder:text-text-placeholder"
          />
        </label>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-1.5 text-[11px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!label.trim()}
          className="inline-flex items-center gap-1 rounded-full bg-brand-blue px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-brand-blue-hover disabled:opacity-40"
        >
          <Plus className="size-3" />
          Add follow-up
        </button>
      </div>
    </div>
  );
}

function AddHealthConditionQuestion({ onAdd }: { onAdd: (field: FormField) => void }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [required, setRequired] = useState(true);

  const reset = () => {
    setQuestion('');
    setRequired(true);
    setOpen(false);
  };

  const handleAdd = () => {
    if (!question.trim()) return;
    const id = `condCustom_${Date.now().toString(36)}`;
    onAdd({
      id,
      label: question.trim(),
      type: 'radio',
      options: ['No', 'Yes'],
      required,
      reflexFollowUps: [],
    });
    reset();
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 px-4 py-4 text-[12px] font-semibold text-brand-blue transition-colors hover:bg-surface-primary"
      >
          <Plus className="size-3.5" />
          Create a new question
      </button>
    );
  }

  return (
    <div className="bg-surface-primary px-4 py-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-text-primary">New health condition question</p>
          <p className="mt-0.5 text-[11px] text-text-secondary">Create a high-level Yes/No question. Add Yes/No follow-ups after it is created.</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Switch
                checked={required}
                onCheckedChange={setRequired}
                aria-label="Set new health condition question as required"
                className="data-[state=checked]:bg-brand-blue"
              />
            </span>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8}>
            Set this question as required
          </TooltipContent>
        </Tooltip>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-text-primary">Question</span>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Example: Kidney disease or urinary disorder?"
          rows={2}
          className="w-full resize-y rounded-md border border-[#c4cbd2] bg-white px-3 py-2 text-[12px] text-text-primary outline-none placeholder:text-text-placeholder focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
        />
      </label>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-md px-3 py-1.5 text-[11px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!question.trim()}
          className="rounded-full bg-brand-blue px-4 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-brand-blue-hover disabled:opacity-40"
        >
          Add question
        </button>
      </div>
    </div>
  );
}
