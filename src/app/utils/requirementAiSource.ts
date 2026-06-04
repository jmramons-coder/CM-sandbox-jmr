import type { CaseRequirement } from '../types';

export function isAiRequirementSourceKey(source?: string): boolean {
  if (!source) return false;
  const key = source.trim().toLowerCase().replace(/\s+/g, '_');
  return (
    key === 'ai_rule_engine'
    || key.startsWith('ai_')
    || key === 'ai'
    || key.includes('ai_agent')
  );
}

function requirementHasAiTrigger(trigger?: string): boolean {
  return /\bai\b/i.test(trigger ?? '');
}

export function inferRequirementAiGenerated(
  row: Pick<CaseRequirement, 'source' | 'trigger' | 'aiGenerated' | 'history'>,
): boolean {
  if (row.aiGenerated) return true;
  if (isAiRequirementSourceKey(row.source)) return true;
  if (requirementHasAiTrigger(row.trigger)) return true;
  if (
    row.history?.some(
      (event) =>
        event.user === 'AI Agent'
        && /ai|recommendation/i.test(event.action),
    )
  ) {
    return true;
  }
  return false;
}

export function isRequirementAiSourced(
  input: Pick<CaseRequirement, 'source' | 'trigger' | 'aiGenerated' | 'history'> | string,
): boolean {
  if (typeof input === 'string') {
    return isAiRequirementSourceKey(input);
  }
  return inferRequirementAiGenerated(input);
}
