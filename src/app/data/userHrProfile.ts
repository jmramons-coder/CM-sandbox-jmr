import type { PlatformUser, PlatformUserRole, TrainingRecord } from '../domain/access/platformUser';
import { getActiveDemoConfigurationId } from './datasetResolutionContext';
import { applyNeutralCarrierToText, usesSbliBrandedDemoData } from './sharedDemoDatasetNeutralize';
import { getPlatformUserById } from './platformUserCatalog';

export type UserHrExperience = {
  title: string;
  organization: string;
  period: string;
  location?: string;
};

export type UserHrEducation = {
  school: string;
  degree: string;
  year: string;
};

export type UserHrProfile = {
  headline: string;
  department: string;
  location: string;
  employeeId: string;
  startDate: string;
  tenureLabel: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract';
  reportsTo?: string;
  about: string;
  specialties: string[];
  languages: string[];
  experience: UserHrExperience[];
  education: UserHrEducation[];
};

const HR_BY_USER_ID: Record<string, UserHrProfile> = {
  'usr-victor-ramon': {
    headline: 'Senior Claims Assessor · Disability & income protection',
    department: 'Life Claims Operations',
    location: 'Boston, MA · Hybrid',
    employeeId: 'EMP-10482',
    startDate: '2019-03-11',
    tenureLabel: '7 yrs',
    employmentType: 'Full-time',
    reportsTo: 'Sarah Mitchell',
    about:
      'Claims professional focused on complex disability and income-protection cases. Partners with underwriting on authority escalations, mentors band-2 assessors, and uses AI-assisted review to keep SLAs without sacrificing decision quality.',
    specialties: [
      'Disability claims',
      'Income protection',
      'Medical evidence review',
      'Authority band 3 decisions',
      'AI-assisted assessment',
    ],
    languages: ['English (Native)', 'Spanish (Professional)'],
    experience: [
      {
        title: 'Senior Claims Assessor',
        organization: 'SBLI · Life Claims',
        period: '2022 – Present',
        location: 'Boston, MA',
      },
      {
        title: 'Claims Assessor II',
        organization: 'SBLI · Life Claims',
        period: '2019 – 2022',
      },
      {
        title: 'Claims Examiner',
        organization: 'Regional mutual carrier',
        period: '2015 – 2019',
      },
    ],
    education: [
      { school: 'Northeastern University', degree: 'B.S. Risk Management & Insurance', year: '2015' },
    ],
  },
  'usr-sarah-mitchell': {
    headline: 'Claims Manager · Life Claims portfolio',
    department: 'Life Claims Operations',
    location: 'Boston, MA · On-site',
    employeeId: 'EMP-08841',
    startDate: '2016-01-04',
    tenureLabel: '10 yrs',
    employmentType: 'Full-time',
    about:
      'Operations leader for the Life Claims assessor bench. Owns capacity planning, quality audits, and hiring for the IP Claims and UW liaison pods. Drives weekly SLA reviews and cross-team escalations with underwriting.',
    specialties: [
      'Team leadership',
      'Capacity planning',
      'Quality assurance',
      'Hiring & onboarding',
      'Regulatory oversight',
    ],
    languages: ['English (Native)'],
    experience: [
      {
        title: 'Claims Manager',
        organization: 'SBLI · Life Claims',
        period: '2020 – Present',
        location: 'Boston, MA',
      },
      {
        title: 'Assistant Manager, Claims',
        organization: 'SBLI · Life Claims',
        period: '2016 – 2020',
      },
    ],
    education: [
      { school: 'Boston University', degree: 'MBA, Operations Management', year: '2016' },
      { school: 'UMass Amherst', degree: 'B.A. Business Administration', year: '2012' },
    ],
  },
  'usr-richard-daniels': {
    headline: 'Claims Assessor · New business & contestability',
    department: 'Life Claims Operations',
    location: 'Hartford, CT · Remote',
    employeeId: 'EMP-11207',
    startDate: '2021-06-14',
    tenureLabel: '5 yrs',
    employmentType: 'Full-time',
    reportsTo: 'Sarah Mitchell',
    about:
      'Handles contestability reviews, MIB alignment, and new-business claim intake. Known for fast queue turnaround and clean handoffs to senior assessors on complex medical files.',
    specialties: ['Contestability', 'MIB research', 'Application vs policy matching', 'FNOL intake'],
    languages: ['English (Native)'],
    experience: [
      {
        title: 'Claims Assessor',
        organization: 'SBLI · Life Claims',
        period: '2021 – Present',
        location: 'Remote',
      },
      {
        title: 'Underwriting associate',
        organization: 'Regional life insurer',
        period: '2018 – 2021',
      },
    ],
    education: [
      { school: 'University of Connecticut', degree: 'B.S. Finance', year: '2018' },
    ],
  },
};

function roleHeadline(role: PlatformUserRole, band: number): string {
  if (role === 'manager') return 'Claims Manager';
  if (role === 'team_lead') return 'Team Lead · Claims Operations';
  if (role === 'senior_assessor' || band >= 4) return 'Senior Claims Assessor';
  if (role === 'operations_admin') return 'Operations Administrator';
  return 'Claims Assessor';
}

function defaultHrProfile(user: PlatformUser): UserHrProfile {
  const manager = user.managerId ? getPlatformUserById(user.managerId) : undefined;
  const team = user.teamLabels[0] ?? 'Operations';
  return {
    headline: `${roleHeadline(user.role, user.band)} · ${team}`,
    department: 'Life Claims Operations',
    location: 'United States · Hybrid',
    employeeId: `EMP-${user.id.replace(/\D/g, '').slice(-5).padStart(5, '0')}`,
    startDate: '2020-01-01',
    tenureLabel: '—',
    employmentType: 'Full-time',
    reportsTo: manager?.name,
    about: `${user.name} supports ${team} with open claims work at authority band ${user.band}. Profile details are maintained in the workforce roster.`,
    specialties: [team, `Band ${user.band}`, roleLabel(user.role)],
    languages: ['English (Professional)'],
    experience: [
      {
        title: roleHeadline(user.role, user.band),
        organization: `SBLI · ${team}`,
        period: 'Present',
      },
    ],
    education: [],
  };
}

function roleLabel(role: PlatformUserRole): string {
  switch (role) {
    case 'senior_assessor':
      return 'Senior assessor';
    case 'team_lead':
      return 'Team lead';
    case 'operations_admin':
      return 'Operations admin';
    case 'manager':
      return 'Manager';
    default:
      return 'Assessor';
  }
}

function neutralizeHrProfile(profile: UserHrProfile): UserHrProfile {
  return {
    ...profile,
    headline: applyNeutralCarrierToText(profile.headline),
    department: applyNeutralCarrierToText(profile.department),
    about: applyNeutralCarrierToText(profile.about),
    specialties: profile.specialties.map((item) => applyNeutralCarrierToText(item)),
    experience: profile.experience.map((item) => ({
      ...item,
      title: applyNeutralCarrierToText(item.title),
      organization: applyNeutralCarrierToText(item.organization),
      period: applyNeutralCarrierToText(item.period),
      location: item.location ? applyNeutralCarrierToText(item.location) : undefined,
    })),
    education: profile.education.map((item) => ({
      ...item,
      school: applyNeutralCarrierToText(item.school),
      degree: applyNeutralCarrierToText(item.degree),
    })),
  };
}

export function getUserHrProfile(user: PlatformUser): UserHrProfile {
  const profile = HR_BY_USER_ID[user.id] ?? defaultHrProfile(user);
  if (usesSbliBrandedDemoData(getActiveDemoConfigurationId())) return profile;
  return neutralizeHrProfile(profile);
}

export type TrainingGroup = {
  id: string;
  label: string;
  description: string;
  records: TrainingRecord[];
};

const TRAINING_GROUP_META: Record<
  TrainingRecord['category'],
  { label: string; description: string }
> = {
  compliance: {
    label: 'Compliance & regulatory',
    description: 'Required for audit, privacy, and carrier obligations.',
  },
  product: {
    label: 'Product & claims competency',
    description: 'Line-of-business skills tied to case types you handle.',
  },
  authority: {
    label: 'Decision authority',
    description: 'Approvals tied to financial authority band.',
  },
  system: {
    label: 'Systems & tools',
    description: 'Platform access and workflow certification.',
  },
};

export function groupUserTraining(records: TrainingRecord[]): TrainingGroup[] {
  const order: TrainingRecord['category'][] = ['compliance', 'authority', 'product', 'system'];
  return order
    .map((category) => {
      const items = records.filter((record) => record.category === category);
      if (!items.length) return null;
      const meta = TRAINING_GROUP_META[category];
      return {
        id: category,
        label: meta.label,
        description: meta.description,
        records: items,
      };
    })
    .filter((group): group is TrainingGroup => group !== null);
}

export function trainingComplianceSummary(records: TrainingRecord[]): {
  current: number;
  total: number;
  expiring: number;
  expired: number;
} {
  const total = records.length;
  const current = records.filter((r) => r.status === 'current').length;
  const expiring = records.filter((r) => r.status === 'expiring_soon').length;
  const expired = records.filter((r) => r.status === 'expired').length;
  return { current, total, expiring, expired };
}
