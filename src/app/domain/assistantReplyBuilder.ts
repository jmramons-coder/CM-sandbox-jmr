import type { ChatArtifact } from '../components/AiCopilotFooter';
import { GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT } from '../constants/copilot-prompts';
import type { SystemDataset } from '../data/multi-case-dataset';
import type { CaseRecord } from './objectRefs';
import { buildDatasetAssistantReply, findDatasetAssistantResponse } from './assistantResponses';
import { resolveSbliCaseId } from '../data/demoCaseIds';

export type AssistantReply = {
  text: string;
  artifact?: ChatArtifact;
  followUps?: string[];
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function casePartyLabel(record: CaseRecord): string {
  return record.primaryParty?.label ?? record.title;
}

function toneForCase(record: CaseRecord): 'critical' | 'warning' | 'neutral' {
  if (record.slaStatus === 'breached' || record.priority === 'Urgent') return 'critical';
  if (record.statusCode === 'pending_decision' || record.status?.toLowerCase().includes('pending')) return 'warning';
  return 'neutral';
}

function buildCaseLinksArtifact(dataset: SystemDataset, title: string): ChatArtifact {
  const items = [...dataset.cases]
    .sort((a, b) => {
      const score = (r: CaseRecord) =>
        (r.slaStatus === 'breached' ? 4 : 0) +
        (r.priority === 'Urgent' ? 2 : 0) +
        (r.statusCode === 'pending_decision' ? 1 : 0);
      return score(b) - score(a);
    })
    .map((record) => ({
      caseId: record.id,
      claimant: casePartyLabel(record),
      summary: `${record.caseTypeLabel ?? record.title} · ${record.status ?? 'Open'}`,
      tone: toneForCase(record),
    }));
  return { kind: 'case-links', title, items };
}

function buildDynamicCasePrioritiesReply(dataset: SystemDataset): AssistantReply {
  const ranked = [...dataset.cases].sort((a, b) => {
    const score = (r: CaseRecord) =>
      (r.slaStatus === 'breached' ? 4 : 0) +
      (r.priority === 'Urgent' ? 2 : 0) +
      (r.statusCode === 'pending_decision' ? 1 : 0);
    return score(b) - score(a);
  });

  const lines = ranked.map((record, index) => {
    const party = casePartyLabel(record);
    const sla =
      record.slaStatus === 'breached'
        ? 'SLA breached'
        : record.slaDue
          ? `due ${record.slaDue}`
          : record.status ?? 'open';
    return `${index + 1}. **${record.id} · ${party}** — ${record.caseTypeLabel ?? record.title}. ${sla}.`;
  });

  return {
    text:
      "Here's how I'd prioritize your SBLI demo workload this week:\n\n" +
      lines.join('\n\n') +
      '\n\nOpen any case from the list below.',
    artifact: buildCaseLinksArtifact(dataset, 'Cases needing attention'),
    followUps: [
      `Summarize ${ranked[0]?.id ?? 'my top case'} for handoff.`,
      'Help me plan my work: summarize my open tasks, due dates, and suggested order to tackle them.',
    ],
  };
}

function buildDynamicTasksReply(dataset: SystemDataset): AssistantReply {
  const openTasks = dataset.tasks
    .filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled')
    .slice(0, 8);

  const items = openTasks.map((task) => ({
    id: task.id,
    label: task.label,
    done: false,
    caseId: task.linkedObjects?.find((ref) => ref.kind === 'case')?.id,
    dueDate: task.dueDate,
    priority: (task.priority === 'High' || task.priority === 'Urgent' ? 'High' : 'Normal') as 'High' | 'Normal',
  }));

  const text =
    openTasks.length === 0
      ? 'No open tasks in the active dataset.'
      : `You have **${openTasks.length}** open tasks. Suggested order: decision-ready claims first, then underwriting evidence gaps.\n\n` +
        openTasks
          .slice(0, 5)
          .map((t, i) => {
            const caseRef = t.linkedObjects?.find((ref) => ref.kind === 'case');
            return `${i + 1}. ${t.label}${caseRef ? ` (${caseRef.id})` : ''} — ${t.status}`;
          })
          .join('\n');

  return {
    text,
    artifact: { kind: 'task-list', title: 'Open tasks', items },
    followUps: [GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT],
  };
}

function buildDraftFromResponse(response: string, title: string): ChatArtifact | undefined {
  if (!response.includes('Subject:')) return undefined;
  const subjectMatch = response.match(/Subject:\s*(.+)/);
  const bodyStart = response.indexOf('\n\n');
  if (!subjectMatch || bodyStart < 0) return undefined;
  return {
    kind: 'draft',
    title,
    subject: subjectMatch[1].trim(),
    body: response.slice(bodyStart).trim(),
    actions: [{ id: 'copy', label: 'Copy to clipboard' }],
  };
}

function artifactFromDatasetMatch(dataset: SystemDataset, match: NonNullable<ReturnType<typeof findDatasetAssistantResponse>>): ChatArtifact | undefined {
  const caseRefs = match.linkedObjects.filter((ref) => ref.kind === 'case');
  if (normalize(match.prompt) === normalize(GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT) && caseRefs.length > 0) {
    return buildCaseLinksArtifact(dataset, 'Your active cases');
  }
  const draft = buildDraftFromResponse(match.response, 'Draft message');
  if (draft) return draft;
  if (caseRefs.length >= 2) {
    return {
      kind: 'case-links',
      title: 'Related cases',
      items: caseRefs.map((ref) => {
        const record = dataset.cases.find((c) => c.id === ref.id);
        return {
          caseId: ref.id,
          claimant: ref.label ?? record?.primaryParty?.label ?? ref.id,
          summary: record?.status ?? 'Open',
          tone: record ? toneForCase(record) : 'neutral',
        };
      }),
    };
  }
  return undefined;
}

function resolveContextId(contextId?: string): string | undefined {
  if (!contextId) return undefined;
  const [kind, id] = contextId.split(':');
  if (kind === 'case') return `case:${resolveSbliCaseId(id)}`;
  return contextId;
}

export function buildAssistantReply(
  dataset: SystemDataset,
  prompt: string,
  contextId?: string,
): AssistantReply | null {
  const resolvedContext = resolveContextId(contextId);
  const needle = normalize(prompt);

  if (needle === normalize(GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT)) {
    return buildDynamicCasePrioritiesReply(dataset);
  }
  if (needle.includes('summarize my open tasks') || needle.includes('plan my work')) {
    return buildDynamicTasksReply(dataset);
  }
  if (needle.includes('prioritize in my queue')) {
    const priorities = buildDynamicCasePrioritiesReply(dataset);
    return {
      ...priorities,
      text:
        'Queue focus for today:\n\n' +
        priorities.text.replace("Here's how I'd prioritize your SBLI demo workload this week:\n\n", ''),
    };
  }

  const staticReply = buildDatasetAssistantReply(dataset, prompt, resolvedContext);
  if (staticReply) {
    const match = findDatasetAssistantResponse(dataset, prompt, resolvedContext);
    const artifact = match ? artifactFromDatasetMatch(dataset, match) : undefined;
    return {
      text: staticReply.text,
      followUps: staticReply.followUps,
      artifact,
    };
  }

  if (resolvedContext?.startsWith('case:')) {
    const caseId = resolvedContext.slice('case:'.length);
    const record = dataset.cases.find((c) => c.id === caseId);
    if (record) {
      const party = casePartyLabel(record);
      return {
        text: `**${record.id} · ${party}**\n\n${record.caseTypeLabel ?? record.title} — ${record.status ?? 'Open'}. Ask for a handoff summary or why the AI recommends the current outcome.`,
        followUps: ['Give a concise case summary for handoff.', 'Why does the AI recommend this outcome?'],
      };
    }
  }

  return null;
}
