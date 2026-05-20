import roleSeed from './dashboard-role-seed.json';
import type { RoleView, TeamAssessorRow, UserProfile, AiConfidenceBar } from '../domain/access/roleView';

type SeedUsers = typeof roleSeed.users;

const seedUsers = roleSeed.users as SeedUsers;

export const USER_PROFILES: Record<RoleView, UserProfile> = {
  assessor: { ...seedUsers.assessor, role: 'assessor' },
  manager: { ...seedUsers.manager, role: 'manager' },
};

export const TEAM_ASSESSORS = roleSeed.teamAssessors as TeamAssessorRow[];

export const AI_CONFIDENCE_BARS = roleSeed.aiConfidenceBars as AiConfidenceBar[];

export function getUserProfile(roleView: RoleView): UserProfile {
  return USER_PROFILES[roleView];
}
