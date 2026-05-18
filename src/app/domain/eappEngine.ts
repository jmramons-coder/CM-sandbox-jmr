/**
 * eApp state machine — resolves visible steps/sections, tracks answers,
 * computes completion, and validates submission readiness.
 */

import type {
  EAppTemplate,
  FormField,
  FormStep,
  QuestionSection,
} from '../data/mock-eapp';

/* ─── State ─── */

export interface EAppState {
  id: string;
  templateId: string;
  currentStepId: string;
  answers: Record<string, unknown>;
  visitedSteps: string[];
  completedSteps: string[];
  submittedAt?: string;
}

export function createEAppState(id: string, template: EAppTemplate): EAppState {
  return {
    id,
    templateId: template.id,
    currentStepId: template.steps[0]?.id ?? '',
    answers: {},
    visitedSteps: [template.steps[0]?.id ?? ''],
    completedSteps: [],
  };
}

/* ─── Step resolution ─── */

/**
 * Walk the template from the first step following `next()` branching to build
 * the ordered list of steps visible in the left nav. Steps past the current
 * one that haven't been visited yet still appear but are marked as "future".
 */
export function resolveVisibleSteps(
  template: EAppTemplate,
  answers: Record<string, unknown>,
): FormStep[] {
  const result: FormStep[] = [];
  const seen = new Set<string>();
  let stepId: string | null = template.steps[0]?.id ?? null;

  while (stepId && !seen.has(stepId)) {
    seen.add(stepId);
    const step = template.steps.find((s) => s.id === stepId);
    if (!step) break;
    result.push(step);
    if (step.next) {
      stepId = step.next(answers);
    } else {
      const idx = template.steps.indexOf(step);
      stepId = template.steps[idx + 1]?.id ?? null;
    }
  }

  return result;
}

/* ─── Section resolution ─── */

/**
 * For a given step, return the sections that should be rendered right now.
 * - Sections with `visibleWhen` only appear when the predicate is true.
 * - AI-generated sections only appear when every required field in all
 *   preceding non-AI sections within the same step has been answered.
 */
export function resolveVisibleSections(
  step: FormStep,
  answers: Record<string, unknown>,
): QuestionSection[] {
  const result: QuestionSection[] = [];
  let precedingSectionsComplete = true;

  for (const section of step.sections) {
    if (section.visibleWhen && !section.visibleWhen(answers)) continue;

    if (section.aiGenerated && !precedingSectionsComplete) continue;

    result.push(section);

    const reqFields = resolveVisibleFields(section, answers).filter((f) => f.required);
    const allAnswered = reqFields.every((f) => {
      const val = answers[f.id];
      if (f.type === 'checkbox') return val === true;
      return val !== undefined && val !== null && val !== '';
    });
    if (!allAnswered) precedingSectionsComplete = false;
  }

  return result;
}

/**
 * Filter a section's fields by their `visibleWhen` predicate.
 */
export function resolveVisibleFields(
  section: QuestionSection,
  answers: Record<string, unknown>,
): FormField[] {
  return section.fields.filter((f) => !f.visibleWhen || f.visibleWhen(answers));
}

/* ─── Completion ─── */

export function getCompletionPct(
  template: EAppTemplate,
  state: EAppState,
): number {
  const steps = resolveVisibleSteps(template, state.answers);
  let totalRequired = 0;
  let totalAnswered = 0;

  for (const step of steps) {
    if (step.id === 'review' || step.id === 'submission') continue;
    const sections = resolveVisibleSections(step, state.answers);
    for (const section of sections) {
      const fields = resolveVisibleFields(section, state.answers).filter((f) => f.required);
      totalRequired += fields.length;
      totalAnswered += fields.filter((f) => {
        const val = state.answers[f.id];
        if (f.type === 'checkbox') return val === true;
        return val !== undefined && val !== null && val !== '';
      }).length;
    }
  }

  if (totalRequired === 0) return 0;
  return Math.round((totalAnswered / totalRequired) * 100);
}

export function isStepComplete(
  step: FormStep,
  answers: Record<string, unknown>,
): boolean {
  if (step.id === 'review' || step.id === 'submission') return false;
  const sections = resolveVisibleSections(step, answers);
  for (const section of sections) {
    const fields = resolveVisibleFields(section, answers).filter((f) => f.required);
    for (const f of fields) {
      const val = answers[f.id];
      if (f.type === 'checkbox') {
        if (val !== true) return false;
      } else {
        if (val === undefined || val === null || val === '') return false;
      }
    }
  }
  return true;
}

export function canSubmit(
  template: EAppTemplate,
  state: EAppState,
): boolean {
  const steps = resolveVisibleSteps(template, state.answers);
  return steps
    .filter((s) => s.id !== 'review' && s.id !== 'submission')
    .every((s) => isStepComplete(s, state.answers));
}
