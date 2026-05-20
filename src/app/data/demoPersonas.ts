import type { TeamMember } from '../types';

/** Signed-in demo user shown in the header and used as the default task assignee. */
export const DEMO_CURRENT_PERSONA = {
  name: 'Victor Ramon',
  email: 'victor.ramon@guardian.co.uk',
  initials: 'VR',
  authorityLevel: 4,
  isManager: true,
} as const;

export function toTeamMember(persona: typeof DEMO_CURRENT_PERSONA): TeamMember {
  return {
    name: persona.name,
    authorityLevel: persona.authorityLevel,
    isManager: persona.isManager,
  };
}
