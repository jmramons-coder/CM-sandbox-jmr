import type { ComponentType, ReactNode } from 'react';
import {
  Briefcase,
  Building2,
  GraduationCap,
  MapPin,
  UserRound,
} from 'lucide-react';
import type { UserDirectoryRow } from '../../domain/access/platformUser';
import { getUserHrProfile } from '../../data/userHrProfile';
import { getPlatformUserById } from '../../data/platformUserCatalog';

function formatAuthority(value: number | null): string {
  if (value == null) return 'Unlimited';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value.toLocaleString()}`;
}

function ProfileSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        <Icon className="size-3.5 shrink-0" aria-hidden />
        {title}
      </h3>
      {children}
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border-soft bg-surface-primary px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-0.5 text-[13px] font-medium text-text-primary">{value}</p>
    </div>
  );
}

type UserProfileOverviewSectionProps = {
  user: UserDirectoryRow;
};

export function UserProfileOverviewSection({ user }: UserProfileOverviewSectionProps) {
  const hr = getUserHrProfile(user);
  const manager = user.managerId ? getPlatformUserById(user.managerId) : undefined;

  return (
    <div className="space-y-6">
      <ProfileSection title="About" icon={UserRound}>
        <p className="text-[13px] leading-relaxed text-text-secondary">{hr.about}</p>
      </ProfileSection>

      <div className="grid grid-cols-2 gap-2">
        <InfoTile label="Employee ID" value={hr.employeeId} />
        <InfoTile label="Tenure" value={hr.tenureLabel} />
        <InfoTile label="Location" value={hr.location} />
        <InfoTile label="Employment" value={hr.employmentType} />
        <InfoTile label="Department" value={hr.department} />
        <InfoTile label="Started" value={hr.startDate} />
        {hr.reportsTo || manager ? (
          <InfoTile label="Reports to" value={hr.reportsTo ?? manager?.name ?? '—'} />
        ) : (
          <InfoTile label="Team" value={user.teamLabels.join(' · ') || '—'} />
        )}
        <InfoTile label="Authority band" value={`Band ${user.band}`} />
        <InfoTile label="Max authority" value={formatAuthority(user.maxAuthority)} />
      </div>

      <ProfileSection title="Core skills" icon={Briefcase}>
        <div className="flex flex-wrap gap-1.5">
          {hr.specialties.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-border-default bg-white px-2.5 py-1 text-[11px] font-medium text-text-primary"
            >
              {skill}
            </span>
          ))}
        </div>
      </ProfileSection>

      {hr.languages.length > 0 ? (
        <ProfileSection title="Languages" icon={MapPin}>
          <ul className="space-y-1 text-[13px] text-text-secondary">
            {hr.languages.map((lang) => (
              <li key={lang}>{lang}</li>
            ))}
          </ul>
        </ProfileSection>
      ) : null}

      <ProfileSection title="Experience" icon={Building2}>
        <ul className="space-y-0">
          {hr.experience.map((role, index) => (
            <li key={`${role.title}-${role.period}`} className="relative flex gap-3 pb-4 last:pb-0">
              {index < hr.experience.length - 1 ? (
                <span
                  className="absolute left-[5px] top-3 h-[calc(100%-4px)] w-px bg-border-default"
                  aria-hidden
                />
              ) : null}
              <span className="relative z-[1] mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-brand-blue bg-white" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-text-primary">{role.title}</p>
                <p className="text-[12px] text-text-secondary">{role.organization}</p>
                <p className="mt-0.5 text-[11px] text-text-muted">
                  {role.period}
                  {role.location ? ` · ${role.location}` : ''}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </ProfileSection>

      {hr.education.length > 0 ? (
        <ProfileSection title="Education" icon={GraduationCap}>
          <ul className="space-y-3">
            {hr.education.map((edu) => (
              <li key={`${edu.school}-${edu.degree}`} className="rounded-lg border border-border-soft bg-white px-3 py-2.5">
                <p className="text-[13px] font-semibold text-text-primary">{edu.school}</p>
                <p className="text-[12px] text-text-secondary">
                  {edu.degree} · {edu.year}
                </p>
              </li>
            ))}
          </ul>
        </ProfileSection>
      ) : null}

      <ProfileSection title="Workload snapshot" icon={Briefcase}>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-border-soft bg-white px-2 py-2.5">
            <p className="text-lg font-semibold text-text-heading">{user.workload.openTasks}</p>
            <p className="text-[10px] text-text-muted">Open tasks</p>
          </div>
          <div className="rounded-lg border border-border-soft bg-white px-2 py-2.5">
            <p
              className={`text-lg font-semibold ${user.workload.overdueTasks ? 'text-brand-red' : 'text-text-heading'}`}
            >
              {user.workload.overdueTasks}
            </p>
            <p className="text-[10px] text-text-muted">Overdue</p>
          </div>
          <div className="rounded-lg border border-border-soft bg-white px-2 py-2.5">
            <p className="text-lg font-semibold text-text-heading">{user.workload.capacityPct}%</p>
            <p className="text-[10px] text-text-muted">Capacity</p>
          </div>
        </div>
      </ProfileSection>
    </div>
  );
}
