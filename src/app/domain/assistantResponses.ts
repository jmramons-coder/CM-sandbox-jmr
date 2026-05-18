import type { SystemDataset } from '../data/multi-case-dataset';

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function contextMatches(contextId: string | undefined, linkedObjects: SystemDataset['assistantResponses'][number]['linkedObjects']) {
  if (!contextId) return false;
  const [kind, id] = contextId.split(':');
  return linkedObjects.some((ref) => ref.kind === kind && ref.id === id);
}

export function findDatasetAssistantResponse(dataset: SystemDataset, prompt: string, contextId?: string) {
  const needle = normalize(prompt);
  const scored = dataset.assistantResponses
    .map((response) => {
      const promptText = normalize(response.prompt ?? '');
      const contextScore = contextMatches(contextId, response.linkedObjects) ? 4 : 0;
      const promptScore =
        promptText === needle ? 4 : promptText.includes(needle) || needle.includes(promptText) ? 2 : 0;
      return { response, score: contextScore + promptScore };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.response;
}

export function buildDatasetAssistantReply(dataset: SystemDataset, prompt: string, contextId?: string) {
  const match = findDatasetAssistantResponse(dataset, prompt, contextId);
  if (!match) return null;
  const followUps = [
    'Give a concise case summary for handoff.',
    'Why does the AI recommend this outcome?',
    'What are the main risk drivers in the factor table?',
  ].filter((p) => normalize(p) !== normalize(prompt));
  return {
    text: match.response,
    followUps: followUps.slice(0, 3),
  };
}
