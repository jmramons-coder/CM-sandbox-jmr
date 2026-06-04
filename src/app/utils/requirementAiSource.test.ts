import { describe, expect, it } from 'vitest';
import { inferRequirementAiGenerated, isRequirementAiSourced } from './requirementAiSource';

describe('requirementAiSource', () => {
  it('detects AI rule engine source', () => {
    expect(isRequirementAiSourced('ai_rule_engine')).toBe(true);
    expect(
      isRequirementAiSourced({
        source: 'claimant_portal',
        trigger: 'Claim context',
      }),
    ).toBe(false);
  });

  it('detects AI triggers and explicit aiGenerated flag', () => {
    expect(
      inferRequirementAiGenerated({
        source: 'employer_portal',
        trigger: 'AI Restoration Plan',
      }),
    ).toBe(true);
    expect(
      inferRequirementAiGenerated({
        source: 'manual',
        trigger: 'Assessor',
        aiGenerated: true,
      }),
    ).toBe(true);
  });

  it('detects requirements created from AI recommendation history', () => {
    expect(
      inferRequirementAiGenerated({
        source: 'medical_provider',
        trigger: 'Scoring context',
        history: [
          {
            date: '2026-05-16',
            action: 'Requirement created from AI recommendation package',
            user: 'AI Agent',
            dot: 'blue',
          },
        ],
      }),
    ).toBe(true);
  });
});
