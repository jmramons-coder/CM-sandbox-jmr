import type { ActionCardArtifact, CaseBriefArtifact, ChatArtifact, ChatTurn } from '../components/AiCopilotFooter';

export type CopilotTaskOutcome = 'accepted' | 'amended';

export function isBriefRefreshTurn(turn: ChatTurn): boolean {
  if (turn.id.startsWith('brief-refresh-')) return true;
  if (turn.artifact?.kind === 'case-brief' && turn.text?.toLowerCase().includes('updated focus')) {
    return true;
  }
  return false;
}

export function stripBriefRefreshTurns(messages: ChatTurn[]): ChatTurn[] {
  return messages.filter((turn) => !isBriefRefreshTurn(turn));
}

/** True only for a pristine case briefing (no user turns, no accept/amend yet). */
export function shouldReplayCaseBriefIntro(messages: ChatTurn[]): boolean {
  const thread = stripBriefRefreshTurns(messages);
  if (!thread.length) return true;
  if (thread.some((turn) => turn.role === 'user')) return false;
  if (
    thread.some(
      (turn) =>
        (turn.artifact?.kind === 'case-brief' && turn.artifact.focusTask?.taskOutcome != null) ||
        (turn.artifact?.kind === 'action-card' && turn.artifact.resolved != null),
    )
  ) {
    return false;
  }
  return thread.length === 1 && thread[0]?.artifact?.kind === 'case-brief';
}

function artifactTargetsTask(
  artifactTaskId: string | undefined,
  taskId: string,
  alternateTaskIds: string[] = [],
): boolean {
  if (!artifactTaskId) return false;
  return artifactTaskId === taskId || alternateTaskIds.includes(artifactTaskId);
}

function patchCaseBriefArtifact(
  artifact: CaseBriefArtifact,
  taskId: string,
  outcome: CopilotTaskOutcome,
  statusLabel: string,
  alternateTaskIds: string[] = [],
): CaseBriefArtifact {
  if (!artifact.focusTask || !artifactTargetsTask(artifact.focusTask.id, taskId, alternateTaskIds)) {
    return artifact;
  }
  return {
    ...artifact,
    focusTask: {
      ...artifact.focusTask,
      semiAuto: false,
      taskOutcome: outcome,
      statusLabel,
    },
  };
}

function patchActionCardArtifact(
  artifact: ActionCardArtifact,
  taskId: string,
  outcome: CopilotTaskOutcome,
  statusLabel: string,
  alternateTaskIds: string[] = [],
): ActionCardArtifact {
  const targetsTask = artifact.actions.some((action) =>
    artifactTargetsTask(action.execute?.taskId, taskId, alternateTaskIds),
  );
  if (!targetsTask) return artifact;
  return {
    ...artifact,
    resolved: {
      label: statusLabel,
      tone: outcome === 'accepted' ? 'success' : 'warning',
    },
    actions: [],
  };
}

function patchArtifact(
  artifact: ChatArtifact,
  taskId: string,
  outcome: CopilotTaskOutcome,
  statusLabel: string,
  alternateTaskIds: string[] = [],
): ChatArtifact {
  if (artifact.kind === 'case-brief') {
    return patchCaseBriefArtifact(artifact, taskId, outcome, statusLabel, alternateTaskIds);
  }
  if (artifact.kind === 'action-card') {
    return patchActionCardArtifact(artifact, taskId, outcome, statusLabel, alternateTaskIds);
  }
  return artifact;
}

export function applyTaskOutcomeToMessages(
  messages: ChatTurn[],
  taskId: string,
  outcome: CopilotTaskOutcome,
  alternateTaskIds: string[] = [],
): ChatTurn[] {
  const statusLabel = outcome === 'accepted' ? 'Accepted' : 'Amend recorded';
  return messages.map((turn) => {
    if (!turn.artifact) return turn;
    const artifact = patchArtifact(turn.artifact, taskId, outcome, statusLabel, alternateTaskIds);
    if (artifact === turn.artifact) return turn;
    return { ...turn, artifact };
  });
}

export function taskOutcomeAlternateIds(task: { id: string; taskId?: string }): string[] {
  if (task.taskId && task.taskId !== task.id) return [task.taskId];
  return [];
}
