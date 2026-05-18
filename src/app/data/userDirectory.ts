import { CURRENT_USER, TEAMS } from './mock-tasks';

export type DirectoryUser = {
  id: string;
  name: string;
  role: string;
  authorityLevel: number;
  teamIds: string[];
  isManager: boolean;
};

export type DirectoryTeam = {
  id: string;
  name: string;
  memberIds: string[];
  queueLabel: string;
};

function userId(name: string) {
  return `usr-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

const usersById = new Map<string, DirectoryUser>();

TEAMS.forEach((team) => {
  team.members.forEach((member) => {
    const id = userId(member.name);
    const existing = usersById.get(id);
    usersById.set(id, {
      id,
      name: member.name,
      role: member.isManager ? 'Manager' : 'Operations user',
      authorityLevel: member.authorityLevel,
      teamIds: Array.from(new Set([...(existing?.teamIds ?? []), team.id])),
      isManager: member.isManager,
    });
  });
});

export const DIRECTORY_USERS = Array.from(usersById.values());

export const DIRECTORY_TEAMS: DirectoryTeam[] = TEAMS.map((team) => ({
  id: team.id,
  name: team.name,
  memberIds: team.members.map((member) => userId(member.name)),
  queueLabel: team.name,
}));

export const CURRENT_DIRECTORY_USER =
  DIRECTORY_USERS.find((user) => user.name === CURRENT_USER.name) ?? DIRECTORY_USERS[0];

export const ASSIGNEE_OPTIONS = [
  ...DIRECTORY_USERS.map((user) => ({
    id: user.id,
    label: user.id === CURRENT_DIRECTORY_USER?.id ? 'Me' : user.name,
    value: user.name,
    type: 'user' as const,
  })),
  ...DIRECTORY_TEAMS.map((team) => ({ id: team.id, label: team.name, value: team.name, type: 'team' as const })),
];

export function resolveAssigneeLabel(idOrLabel: string | undefined) {
  if (!idOrLabel) return 'Unassigned';
  return ASSIGNEE_OPTIONS.find((item) => item.id === idOrLabel || item.label === idOrLabel || item.value === idOrLabel)?.label ?? idOrLabel;
}

export function resolveAssigneeIdentity(idOrLabel: string | undefined) {
  const match = ASSIGNEE_OPTIONS.find((item) => item.id === idOrLabel || item.label === idOrLabel || item.value === idOrLabel);
  if (!match) {
    return {
      assigneeId: idOrLabel,
      assigneeKind: undefined as 'user' | 'team' | undefined,
      assigneeLabel: idOrLabel ?? 'Unassigned',
      assigneeValue: idOrLabel ?? 'Unassigned',
    };
  }
  return {
    assigneeId: match.id,
    assigneeKind: match.type,
    assigneeLabel: match.label,
    assigneeValue: match.value,
  };
}
