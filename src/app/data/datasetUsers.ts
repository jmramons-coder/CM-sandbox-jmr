import type { PlatformUser } from '../domain/access/platformUser';
import type { PlatformUserRecord, SystemDataset } from './multi-case-dataset';
import { PLATFORM_USERS } from './platformUserCatalog';

export function platformUserToRecord(user: PlatformUser): PlatformUserRecord {
  return {
    kind: 'user',
    id: user.id,
    name: user.name,
    initials: user.initials,
    email: user.email,
    role: user.role,
    status: user.status,
    band: user.band,
    maxAuthority: user.maxAuthority,
    teamIds: user.teamIds,
    teamLabels: user.teamLabels,
    managerId: user.managerId,
    maxConcurrentTasks: user.maxConcurrentTasks,
    training: user.training,
  };
}

export function recordToPlatformUser(record: PlatformUserRecord): PlatformUser {
  return {
    id: record.id,
    name: record.name,
    initials: record.initials,
    email: record.email,
    role: record.role,
    status: record.status,
    band: record.band,
    maxAuthority: record.maxAuthority,
    teamIds: record.teamIds,
    teamLabels: record.teamLabels,
    managerId: record.managerId,
    maxConcurrentTasks: record.maxConcurrentTasks,
    training: record.training,
  };
}

/** Canonical roster seeded from the platform catalog when a dataset has no users array yet. */
export function buildDefaultDatasetUsers(): PlatformUserRecord[] {
  return PLATFORM_USERS.map(platformUserToRecord);
}

export function listDatasetPlatformUsers(dataset: SystemDataset): PlatformUser[] {
  const records = dataset.users?.length ? dataset.users : buildDefaultDatasetUsers();
  return records.map(recordToPlatformUser);
}

export function getPlatformUserFromDataset(
  dataset: SystemDataset,
  idOrName: string | undefined,
): PlatformUser | undefined {
  if (!idOrName) return undefined;
  const users = listDatasetPlatformUsers(dataset);
  return users.find((user) => user.id === idOrName || user.name === idOrName);
}

function usersByName(users: PlatformUserRecord[]): Map<string, PlatformUserRecord> {
  return new Map(users.map((user) => [user.name, user]));
}

function usersById(users: PlatformUserRecord[]): Map<string, PlatformUserRecord> {
  return new Map(users.map((user) => [user.id, user]));
}

/** Backfill assigneeId on user-owned tasks/requests so workload links to roster ids. */
function normalizeDatasetAssignees(dataset: SystemDataset, users: PlatformUserRecord[]): SystemDataset {
  const byName = usersByName(users);
  const byId = usersById(users);

  return {
    ...dataset,
    tasks: dataset.tasks.map((task) => {
      if (task.assigneeKind !== 'user' || !task.assignee) return task;
      const user = byName.get(task.assignee) ?? (task.assigneeId ? byId.get(task.assigneeId) : undefined);
      if (!user) return task;
      return {
        ...task,
        assigneeId: user.id,
        assignee: user.name,
        assigneeKind: 'user' as const,
      };
    }),
    requests: dataset.requests.map((request) => {
      const assigneeName = request.assignee ?? request.assignedTo;
      if (request.assigneeKind !== 'user' || !assigneeName) return request;
      const user = byName.get(assigneeName) ?? (request.assigneeId ? byId.get(request.assigneeId) : undefined);
      if (!user) return request;
      return {
        ...request,
        assigneeId: user.id,
        assignee: user.name,
        assignedTo: user.name,
        assigneeKind: 'user' as const,
      };
    }),
  };
}

/** Ensure dataset.users exists and task assignees reference roster ids. */
export function hydrateDatasetUsers(dataset: SystemDataset): SystemDataset {
  const users = dataset.users?.length ? dataset.users : buildDefaultDatasetUsers();
  return normalizeDatasetAssignees({ ...dataset, users }, users);
}
