import roleSeed from './dashboard-role-seed.json';
import { TEAMS } from './mock-tasks';
import { DIRECTORY_TEAMS, DIRECTORY_USERS, userId as directoryUserId } from './userDirectory';
import type { PlatformUser, PlatformUserRole, TrainingRecord } from '../domain/access/platformUser';

const seedUsers = roleSeed.users as Record<
  string,
  { name: string; initials: string; email: string; role: string; band: number; team: string; maxAuthority: number | null }
>;

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
}

function emailFromName(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '');
  return `${slug}@amplify.demo`;
}

function defaultTraining(role: PlatformUserRole, band: number): TrainingRecord[] {
  const base: TrainingRecord[] = [
    {
      id: 'tr-system',
      title: 'Amplify Case Management — Core',
      category: 'system',
      status: 'current',
      completedAt: '2025-11-01',
    },
    {
      id: 'tr-compliance',
      title: 'Data privacy & audit handling',
      category: 'compliance',
      status: 'current',
      completedAt: '2026-01-15',
      expiresAt: '2027-01-15',
    },
  ];
  if (role === 'manager' || band >= 4) {
    base.push({
      id: 'tr-authority',
      title: 'Decision authority — Band 4+',
      category: 'authority',
      status: band >= 4 ? 'current' : 'expiring_soon',
      completedAt: '2025-09-01',
      expiresAt: '2026-09-01',
    });
  }
  if (role === 'assessor' || role === 'senior_assessor') {
    base.push({
      id: 'tr-claims',
      title: 'Claims assessment — Medical & vocational',
      category: 'product',
      status: band >= 3 ? 'current' : 'planned',
      completedAt: band >= 3 ? '2025-06-01' : undefined,
      expiresAt: band >= 3 ? '2026-06-01' : undefined,
    });
  }
  return base;
}

function roleFromFlags(isManager: boolean, band: number): PlatformUserRole {
  if (isManager) return 'manager';
  if (band >= 4) return 'senior_assessor';
  return 'assessor';
}

const catalogById = new Map<string, PlatformUser>();

function upsertUser(input: {
  id?: string;
  name: string;
  email?: string;
  initials?: string;
  role?: PlatformUserRole;
  band?: number;
  maxAuthority?: number | null;
  teamIds?: string[];
  maxConcurrentTasks?: number;
}) {
  const id = input.id ?? directoryUserId(input.name);
  const existing = catalogById.get(id);
  const teamIds = Array.from(new Set([...(existing?.teamIds ?? []), ...(input.teamIds ?? [])]));
  const teamLabels = teamIds
    .map((teamId) => DIRECTORY_TEAMS.find((team) => team.id === teamId)?.name ?? TEAMS.find((t) => t.id === teamId)?.name)
    .filter((label): label is string => Boolean(label));

  const band = input.band ?? existing?.band ?? 2;
  const role = input.role ?? existing?.role ?? roleFromFlags(false, band);

  catalogById.set(id, {
    id,
    name: input.name,
    initials: input.initials ?? existing?.initials ?? initialsFromName(input.name),
    email: input.email ?? existing?.email ?? emailFromName(input.name),
    role,
    status: existing?.status ?? 'active',
    band,
    maxAuthority: input.maxAuthority ?? existing?.maxAuthority ?? (role === 'manager' ? null : 250_000),
    teamIds,
    teamLabels: teamLabels.length ? teamLabels : existing?.teamLabels ?? ['Operations'],
    maxConcurrentTasks: input.maxConcurrentTasks ?? existing?.maxConcurrentTasks ?? 18,
    training: existing?.training ?? defaultTraining(role, band),
  });
}

TEAMS.forEach((team) => {
  team.members.forEach((member) => {
    upsertUser({
      name: member.name,
      band: member.authorityLevel,
      role: roleFromFlags(member.isManager, member.authorityLevel),
      teamIds: [team.id],
      maxConcurrentTasks: member.isManager ? 24 : 18,
    });
  });
});

DIRECTORY_USERS.forEach((user) => {
  upsertUser({
    id: user.id,
    name: user.name,
    band: user.authorityLevel,
    role: roleFromFlags(user.isManager, user.authorityLevel),
    teamIds: user.teamIds,
  });
});

Object.values(seedUsers).forEach((seed) => {
  upsertUser({
    name: seed.name,
    email: seed.email,
    initials: seed.initials,
    role: seed.role === 'manager' ? 'manager' : 'assessor',
    band: seed.band,
    maxAuthority: seed.maxAuthority,
    teamIds: DIRECTORY_TEAMS.filter((t) => t.name === seed.team).map((t) => t.id),
  });
});

roleSeed.teamAssessors.forEach((row: { name: string; initials: string }) => {
  upsertUser({ name: row.name, initials: row.initials });
});

const sarahId = directoryUserId('Sarah Mitchell');
const victorId = directoryUserId('Victor Ramon');
if (catalogById.has(sarahId) && catalogById.has(victorId)) {
  const victor = catalogById.get(victorId)!;
  catalogById.set(victorId, { ...victor, managerId: sarahId });
}

export const PLATFORM_USERS: PlatformUser[] = Array.from(catalogById.values()).sort((a, b) =>
  a.name.localeCompare(b.name),
);

export function getPlatformUserById(id: string): PlatformUser | undefined {
  return catalogById.get(id);
}

export function getPlatformUserByName(name: string): PlatformUser | undefined {
  return PLATFORM_USERS.find((user) => user.name === name);
}

export function resolveUserIdFromNameOrId(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (catalogById.has(value)) return value;
  return getPlatformUserByName(value)?.id;
}
