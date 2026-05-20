import { DIRECTORY_TEAMS, DIRECTORY_USERS } from '../data/userDirectory';
import { TEAMS } from '../data/mock-tasks';
import type { Task } from '../types';

const NON_PERSON_LABELS = new Set([
  'unassigned',
  'operations queue',
  'operations team',
  'system',
  'ai agent',
]);

function isDisplayablePerson(name?: string): name is string {
  if (!name?.trim()) return false;
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
