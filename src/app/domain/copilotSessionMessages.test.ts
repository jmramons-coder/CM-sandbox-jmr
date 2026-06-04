import { describe, expect, it } from 'vitest';
import type { ChatTurn } from '../components/AiCopilotFooter';
import {
  applyTaskOutcomeToMessages,
  isBriefRefreshTurn,
  shouldReplayCaseBriefIntro,
  stripBriefRefreshTurns,
} from './copilotSessionMessages';

describe('copilotSessionMessages', () => {
  it('detects and removes refresh briefing turns', () => {
    const refresh: ChatTurn = {
      id: 'brief-refresh-1',
      role: 'assistant',
      text: 'Here is your updated focus:',
      at: 1,
      artifact: { kind: 'case-brief', greetingName: 'Sarah', caseId: 'C-1', clientHeadline: '', openRequirements: [], focusLine: '' },
    };
    expect(isBriefRefreshTurn(refresh)).toBe(true);
    expect(stripBriefRefreshTurns([refresh])).toEqual([]);
  });

  it('skips intro replay after accept or user messages', () => {
    const briefOnly: ChatTurn[] = [
      {
        id: 'brief-1',
        role: 'assistant',
        text: '',
        at: 1,
        artifact: {
          kind: 'case-brief',
          greetingName: 'Sarah',
          caseId: 'C-1',
          clientHeadline: '',
          openRequirements: [],
          focusLine: 'Focus',
          focusTask: {
            id: 'task-1',
            label: 'Review',
            href: '/cases/C-1',
            verdict: 'Ready',
            semiAuto: true,
          },
        },
      },
    ];
    expect(shouldReplayCaseBriefIntro(briefOnly)).toBe(true);
    expect(
      shouldReplayCaseBriefIntro([
        ...briefOnly,
        { id: 'u-1', role: 'user', text: 'Accept Review', at: 2 },
      ]),
    ).toBe(false);
    expect(
      shouldReplayCaseBriefIntro([
        {
          ...briefOnly[0],
          artifact: {
            ...(briefOnly[0].artifact as { kind: 'case-brief' }),
            focusTask: {
              id: 'task-1',
              label: 'Review',
              href: '/cases/C-1',
              verdict: 'Ready',
              taskOutcome: 'accepted' as const,
            },
          },
        },
      ]),
    ).toBe(false);
  });

  it('marks case brief and action cards as accepted', () => {
    const messages: ChatTurn[] = [
      {
        id: 'brief-1',
        role: 'assistant',
        text: '',
        at: 1,
        artifact: {
          kind: 'case-brief',
          greetingName: 'Sarah',
          caseId: 'C-1',
          clientHeadline: '',
          openRequirements: [],
          focusLine: 'Focus',
          focusTask: {
            id: 'task-1',
            label: 'Review decision',
            href: '/cases/C-1#tab=tasks&task=task-1',
            verdict: 'Ready',
            semiAuto: true,
          },
        },
      },
      {
        id: 'card-1',
        role: 'assistant',
        text: 'Reasoning',
        at: 2,
        artifact: {
          kind: 'action-card',
          title: 'Review decision',
          description: 'Approve or amend',
          actions: [
            {
              id: 'approve',
              label: 'Approve',
              variant: 'primary',
              execute: { kind: 'task', taskId: 'task-1', actionType: 'complete' },
            },
          ],
        },
      },
    ];

    const next = applyTaskOutcomeToMessages(messages, 'task-1', 'accepted');
    expect(next[0].artifact?.kind).toBe('case-brief');
    if (next[0].artifact?.kind === 'case-brief') {
      expect(next[0].artifact.focusTask?.taskOutcome).toBe('accepted');
      expect(next[0].artifact.focusTask?.semiAuto).toBe(false);
      expect(next[0].artifact.focusTask?.statusLabel).toBe('Accepted');
    }
    if (next[1].artifact?.kind === 'action-card') {
      expect(next[1].artifact.resolved?.label).toBe('Accepted');
      expect(next[1].artifact.actions).toEqual([]);
    }
  });

  it('matches focus task by alternate task id', () => {
    const messages: ChatTurn[] = [
      {
        id: 'brief-1',
        role: 'assistant',
        text: '',
        at: 1,
        artifact: {
          kind: 'case-brief',
          greetingName: 'Sarah',
          caseId: 'C-1',
          clientHeadline: '',
          openRequirements: [],
          focusLine: 'Focus',
          focusTask: {
            id: 'internal-1',
            label: 'Review decision',
            href: '/cases/C-1#tab=tasks&task=internal-1',
            verdict: 'Ready',
            semiAuto: true,
          },
        },
      },
    ];

    const next = applyTaskOutcomeToMessages(messages, 'task-1', 'accepted', ['internal-1']);
    if (next[0].artifact?.kind === 'case-brief') {
      expect(next[0].artifact.focusTask?.taskOutcome).toBe('accepted');
    }
  });
});
