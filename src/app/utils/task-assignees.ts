import { CURRENT_DIRECTORY_USER, DIRECTORY_TEAMS, DIRECTORY_USERS, resolveAssigneeLabel } from '../data/userDirectory';
import { PLATFORM_USERS } from '../data/platformUserCatalog';
import { TEAMS } from '../data/mock-tasks';
import type { Task } from '../types';

const NON_PERSON_LABELS = new Set([
  'unassigned',
  'operations queue',
  'operations team',
  'system',
  'ai agent',
]);

export type TaskAssigneeRowModel = {
  name: string;
  subtitle: string;
  kind: 'human' | 'ai' | 'system' | 'neutral';
  initials?: string;
};

export function isAiAssigneeLabel(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return normalized === 'ai agent' || normalized === 'ai crew' || normalized.startsWith('ai ');
}

function isSystemAssigneeLabel(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return normalized === 'system' || normalized === 'automated';
}

function isNeutralQueueLabel(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return NON_PERSON_LABELS.has(normalized) && !isAiAssigneeLabel(name) && !isSystemAssigneeLabel(name);
}

function teamLabelForId(teamId: string): string | undefined {
  return DIRECTORY_TEAMS.find((team) => team.id === teamId)?.name ?? TEAMS.find((team) => team.id === teamId)?.name;
}

const USER_ID_PATTERN = /^(usr[-_]|USR[-_])/i;

function isOpaqueAssigneeToken(value: string): boolean {
  return USER_ID_PATTERN.test(value.trim());
}

/** Directory / roster lookup — never show raw usr-* ids or slugified dashes in UI. */
export function resolveHumanAssigneeName(
  raw: string | undefined,
  assigneeId?: string | null,
): string | null {
  const candidates = [assigneeId, raw].filter((value): value is string => Boolean(value?.trim()));

  for (const candidate of candidates) {
    const label = resolveAssigneeLabel(candidate);
    if (label && label !== 'Unassigned' && !isOpaqueAssigneeToken(label)) {
      if (label === 'Me') return CURRENT_DIRECTORY_USER?.name ?? label;
      return label;
    }
    const directoryUser = DIRECTORY_USERS.find((user) => user.id === candidate || user.name === candidate);
    if (directoryUser) return directoryUser.name;
    const platformUser = PLATFORM_USERS.find((user) => user.id === candidate || user.name === candidate);
    if (platformUser) return platformUser.name;
  }

  const trimmed = raw?.trim() ?? '';
  if (
    trimmed &&
    !isOpaqueAssigneeToken(trimmed) &&
    !isAiAssigneeLabel(trimmed) &&
    !isSystemAssigneeLabel(trimmed) &&
    !isNeutralQueueLabel(trimmed)
  ) {
    return trimmed;
  }

  return null;
}

/** Single assignee row for table cells — mirrors Requests module requester layout. */
export function resolveTaskAssigneeRow(
  task: Task,
  options?: { queueTeamId?: string },
): TaskAssigneeRowModel | null {
  const pickedUpName = resolveHumanAssigneeName(task.pickedUpBy, task.assigneeId);
  if (pickedUpName) {
    return { name: pickedUpName, subtitle: 'Picked up', kind: 'human' };
  }

  if (task.assigneeKind === 'team' && task.assigneeId) {
    const teamName = teamLabelForId(task.assigneeId) ?? task.assignedTo?.trim() ?? 'Team queue';
    const members = namesFromTeamId(task.assigneeId);
    const subtitle =
      members.length > 1
        ? `Team · ${members.length} members`
        : members.length === 1
          ? 'Team · 1 member'
          : 'Team queue';
    return { name: teamName, subtitle, kind: 'neutral' };
  }

  const assigned = task.assignedTo?.trim() ?? '';
  if (isAiAssigneeLabel(assigned)) {
    return { name: 'AI Agent', subtitle: 'Assignee', kind: 'ai' };
  }
  if (isSystemAssigneeLabel(assigned)) {
    return { name: 'System', subtitle: 'Assignee', initials: 'SY', kind: 'system' };
  }

  const assignedName = resolveHumanAssigneeName(task.assignedTo, task.assigneeId);
  if (assignedName) {
    return { name: assignedName, subtitle: 'Assignee', kind: 'human' };
  }
  if (isNeutralQueueLabel(assigned)) {
    return { name: assigned, subtitle: 'Queue', kind: 'neutral' };
  }

  const teamMembers = getTaskAssigneeNames(task, options);
  if (teamMembers.length === 1) {
    const name = teamMembers[0]!;
    if (isAiAssigneeLabel(name)) return { name: 'AI Agent', subtitle: 'Assignee', kind: 'ai' };
    const memberName = resolveHumanAssigneeName(name, undefined) ?? name;
    return { name: memberName, subtitle: 'Assignee', kind: 'human' };
  }
  if (teamMembers.length > 1) {
    const teamName = task.assignedTo?.trim() || teamLabelForId(options?.queueTeamId ?? '') || 'Team queue';
    return {
      name: teamName,
      subtitle: `Team · ${teamMembers.length} members`,
      kind: 'neutral',
    };
  }

  const display = resolveTaskAssigneeDisplayName(task);
  if (!display || display.toLowerCase() === 'unassigned') return null;
  if (isAiAssigneeLabel(display)) return { name: 'AI Agent', subtitle: 'Assignee', kind: 'ai' };
  if (isSystemAssigneeLabel(display)) return { name: 'System', subtitle: 'Assignee', initials: 'SY', kind: 'system' };
  if (isNeutralQueueLabel(display)) return { name: display, subtitle: 'Queue', kind: 'neutral' };
  if (isOpaqueAssigneeToken(display)) return null;
  return { name: display, subtitle: 'Assignee', kind: 'human' };
}

/** @deprecated Use resolveTaskAssigneeRow — kept for any stacked callers. */
export function resolveTaskAssigneePills(
  task: Task,
  options?: { queueTeamId?: string },
): Array<{ label: string; kind: TaskAssigneeRowModel['kind'] }> {
  const row = resolveTaskAssigneeRow(task, options);
  if (!row) return [];
  return [{ label: row.name, kind: row.kind }];
}

function isDisplayablePerson(name?: string): boolean {
  if (!name?.trim()) return false;
  if (isOpaqueAssigneeToken(name)) return false;
  return !NON_PERSON_LABELS.has(name.trim().toLowerCase());
}

function namesFromTeamId(teamId: string): string[] {
  const directoryTeam = DIRECTORY_TEAMS.find((team) => team.id === teamId);
  if (directoryTeam) {
    return directoryTeam.memberIds
      .map((memberId) => DIRECTORY_USERS.find((user) => user.id === memberId)?.name)
      .filter((name): name is string => Boolean(name));
  }
  const mockTeam = TEAMS.find((team) => team.id === teamId);
  return mockTeam?.members.map((member) => member.name) ?? [];
}

/** Resolves people to show in mobile task assignee avatar stacks. */
export function getTaskAssigneeNames(task: Task, options?: { queueTeamId?: string }): string[] {
  if (task.assigneeKind === 'team' && task.assigneeId) {
    return namesFromTeamId(task.assigneeId);
  }

  const teamByLabel = TEAMS.find((team) => team.name === task.assignedTo);
  if (teamByLabel && task.assigneeKind === 'team') {
    return teamByLabel.members.map((member) => member.name);
  }

  const names: string[] = [];
  if (isDisplayablePerson(task.assignedTo)) {
    names.push(task.assignedTo.trim());
  }
  if (isDisplayablePerson(task.pickedUpBy) && !names.includes(task.pickedUpBy.trim())) {
    names.push(task.pickedUpBy.trim());
  }

  if (names.length === 0 && task.queue === 'team_tasks' && options?.queueTeamId) {
    return namesFromTeamId(options.queueTeamId);
  }

  return names;
}

function isOpaqueId(value: string): boolean {
  return /^(usr[-_]|USR[-_]|CLI[-_])/i.test(value);
}

/** Human-readable assignee for panels and tags — never raw usr-* ids. */
export function resolveTaskAssigneeDisplayName(
  task: Pick<Task, 'assignedTo' | 'pickedUpBy' | 'assigneeId' | 'assigneeKind'>,
  options?: { currentUserName?: string; roster?: Array<{ id: string; name: string }> },
): string {
  const rosterResolved = (() => {
    if (task.assigneeId && options?.roster) {
      const byId = options.roster.find((user) => user.id === task.assigneeId);
      if (byId) return byId.name;
    }
    const raw = (task.pickedUpBy || task.assignedTo || '').trim();
    if (options?.roster && raw) {
      const byRaw = options.roster.find((user) => user.id === raw || user.name === raw);
      if (byRaw) return byRaw.name;
    }
    return null;
  })();

  if (rosterResolved) return rosterResolved;

  const resolved = resolveHumanAssigneeName(task.pickedUpBy || task.assignedTo, task.assigneeId);
  if (resolved) return resolved;

  const raw = (task.pickedUpBy || task.assignedTo || '').trim();
  if (!raw || raw.toLowerCase() === 'unassigned') return 'Unassigned';
  if (raw === 'Me' && options?.currentUserName) return options.currentUserName;
  if (!isOpaqueAssigneeToken(raw)) return raw;
  return 'Unassigned';
}

/** Human-readable claimant — prefer client name over CLI-* / usr-* ids. */
export function resolveTaskClaimantDisplayName(
  task: Pick<Task, 'claimantName'>,
  caseRecord: { primaryParty?: { kind: string; id: string; label?: string } } | undefined,
  clients: Array<{ id: string; name: string }>,
): string {
  const party = caseRecord?.primaryParty;
  if (party?.kind === 'client') {
    const client = clients.find((row) => row.id === party.id);
    if (client?.name) return client.name;
    if (party.label && !isOpaqueId(party.label)) return party.label;
  }

  const raw = task.claimantName?.trim();
  if (raw && raw !== 'N/A' && !isOpaqueId(raw)) return raw;
  if (party?.label && !isOpaqueId(party.label)) return party.label;
  return raw && raw !== 'N/A' ? raw : 'N/A';
}
