import { describe, expect, it } from 'vitest';
import { GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT } from '../components/AiCopilotFooter';
import { DEMO_CASE_IDS } from '../data/demoCaseIds';
import { SBLI_DATASET } from '../data/sbli-dataset';
import { buildAssistantReply } from './assistantReplyBuilder';
import { findDatasetAssistantResponse } from './assistantResponses';

describe('assistantResponses', () => {
  it('includes curated SBLI assistant responses', () => {
    expect(SBLI_DATASET.assistantResponses.length).toBeGreaterThan(5);
  });

  it('matches case priorities prompt in dataset', () => {
    const match = findDatasetAssistantResponse(SBLI_DATASET, GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT);
    expect(match).toBeTruthy();
    expect(match?.linkedObjects.some((ref) => ref.id === DEMO_CASE_IDS.wopClaim)).toBe(true);
  });

  it('builds dynamic case priorities with case-links artifact', () => {
    const reply = buildAssistantReply(SBLI_DATASET, GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT);
    expect(reply?.text).toContain('CD26-5546112');
    expect(reply?.artifact?.kind).toBe('case-links');
  });

  it('builds case-context reply for CD26', () => {
    const reply = buildAssistantReply(
      SBLI_DATASET,
      'Give a concise case summary for handoff.',
      `case:${DEMO_CASE_IDS.wopClaim}`,
    );
    expect(reply?.text).toContain('Billy Bud');
  });

  it('resolves legacy IP26 context to SBLI case', () => {
    const reply = buildAssistantReply(
      SBLI_DATASET,
      'Give a concise case summary for handoff.',
      'case:IP26-5546112',
    );
    expect(reply?.text).toContain('Billy Bud');
  });
});
