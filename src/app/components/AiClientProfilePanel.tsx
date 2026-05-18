'use client';

import type { MouseEventHandler } from 'react';
import { Calendar, Briefcase, FileText, HeartPulse, Mail, MapPin, Phone, User } from 'lucide-react';
import type { CaseAIRecommendation, CaseOverview } from '../types';

function recommendationBadgeClass(rec: CaseAIRecommendation): string {
  switch (rec) {
    case 'Approve':
      return 'bg-[#e5f5ea] text-brand-green';
    case 'Pending':
      return 'bg-[#fff4e6] text-[#a36d00]';
    case 'Close':
      return 'bg-surface-muted text-text-secondary';
    case 'Monitor':
      return 'bg-surface-selected text-brand-blue';
    default:
      return 'bg-surface-muted text-text-secondary';
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function firstSentence(text: string): string {
  const t = text.trim();
  const m = t.match(/^[^.!?]+[.!?]?/);
  return m ? m[0].trim() : t.slice(0, 160) + (t.length > 160 ? '\u2026' : '');
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9ba1a8]">
      {children}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-[5px]">
      <span className="shrink-0 text-[12.5px] text-[#9ba1a8]">{label}</span>
      <span className={`text-right text-[13px] text-[#1b1c1e] ${mono ? 'font-mono text-[12px]' : ''}`}>
        {value}
      </span>
    </div>
  );
}

export function AiClientProfilePanel({
  data,
  onMouseUp,
}: {
  data: CaseOverview;
  onMouseUp?: MouseEventHandler<HTMLDivElement>;
}) {
  const { claimantProfile } = data;
  const preExistingChips = data.preExistingConditions
    .split('\u00b7')
    .map((c) => c.trim())
    .filter(Boolean);
  const headline =
    data.aiNarrative.length > 140 ? `${data.aiNarrative.slice(0, 137).trim()}\u2026` : data.aiNarrative;
  const bioLead = data.aiDetailedResume[0] ? firstSentence(data.aiDetailedResume[0]) : headline;
  const workSnippet =
    data.aiDetailedResume[0]?.split('. ').slice(1, 3).join('. ') ||
    data.productType.split('\u00b7')[0]?.trim() ||
    data.productName;

  return (
    <div className="pb-8" onMouseUp={onMouseUp}>
      <div className="px-7 pt-7">

        {/* Identity */}
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#edf5f8] to-[#d4e9f2] text-sm font-bold tracking-tight text-brand-navy"
            aria-hidden
          >
            {initials(data.claimantName)}
          </div>
          <div className="min-w-0">
            <h3 className="text-[17px] font-semibold leading-tight text-[#1b1c1e]">{data.claimantName}</h3>
            <p className="mt-0.5 font-mono text-[11.5px] text-[#878f9a]">{data.id}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-surface-selected-alt px-2 py-[2px] text-[10.5px] font-semibold text-brand-navy">
                {data.lineOfBusiness}
              </span>
              <span
                className={`rounded-full px-2 py-[2px] text-[10.5px] font-semibold ${recommendationBadgeClass(data.aiRecommendation)}`}
              >
                {data.aiRecommendation}
              </span>
            </div>
          </div>
        </div>

        {/* Contact — inline row */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px]">
          <a
            href={`mailto:${claimantProfile.email}`}
            className="flex items-center gap-1.5 text-brand-blue transition-colors hover:text-brand-blue-hover"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden />
            {claimantProfile.email}
          </a>
          <span className="flex items-center gap-1.5 text-[#3d4148]">
            <Phone className="h-3.5 w-3.5 text-[#9ba1a8]" aria-hidden />
            {claimantProfile.phone}
          </span>
          <span className="flex items-center gap-1.5 text-[#3d4148]">
            <MapPin className="h-3.5 w-3.5 text-[#9ba1a8]" aria-hidden />
            {claimantProfile.location}
          </span>
        </div>

        <div className="my-6 h-px bg-[#eff0f1]" />

        {/* Stats row */}
        <div className="grid grid-cols-3 text-center">
          <div>
            <div className="text-[18px] font-semibold tabular-nums text-[#1b1c1e]">{data.monthlyBenefit}</div>
            <div className="mt-0.5 text-[10.5px] text-[#9ba1a8]">Monthly benefit</div>
          </div>
          <div className="border-x border-[#eff0f1]">
            <div className="text-[18px] font-semibold tabular-nums text-brand-blue">{data.aiConfidence}%</div>
            <div className="mt-0.5 text-[10.5px] text-[#9ba1a8]">AI confidence</div>
          </div>
          <div>
            <div className="text-[18px] font-semibold tabular-nums text-[#1b1c1e]">{data.assessmentFactors.length}</div>
            <div className="mt-0.5 text-[10.5px] text-[#9ba1a8]">Signals</div>
          </div>
        </div>

        <div className="my-6 h-px bg-[#eff0f1]" />

        {/* Narrative */}
        <p className="text-[13.5px] leading-[1.65] text-[#3d4148]">{headline}</p>

        <div className="my-6 h-px bg-[#eff0f1]" />

        {/* Health & incident */}
        <SectionLabel>Health &amp; incident</SectionLabel>
        <p className="text-[13px] leading-[1.6] text-[#3d4148]">{data.cause}</p>
        {preExistingChips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {preExistingChips.map((c, i) => (
              <span
                key={`${c}-${i}`}
                className="rounded-full bg-[#f6f7f8] px-2.5 py-[3px] text-[11px] text-text-secondary"
              >
                {c}
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 space-y-0">
          <Row label="Onset" value={data.disabilityOnset} />
          <Row label="Claim ref" value={data.claimNumber} mono />
        </div>

        <div className="my-6 h-px bg-[#eff0f1]" />

        {/* Work & cover */}
        <SectionLabel>Work &amp; cover</SectionLabel>
        <p className="text-[13px] leading-[1.6] text-[#3d4148]">{workSnippet}</p>
        <div className="mt-3 space-y-0">
          <Row label="Product" value={data.productType.split('\u00b7').map(s => s.trim()).join(' \u00b7 ')} />
          <Row label="Policy" value={data.policyNumber} mono />
        </div>

        <div className="my-6 h-px bg-[#eff0f1]" />

        {/* At a glance */}
        <SectionLabel>At a glance</SectionLabel>
        <p className="text-[13px] leading-[1.6] text-[#3d4148]">{bioLead}</p>
        {data.aiDetailedResume[1] && (
          <p className="mt-2 text-[12.5px] leading-[1.6] text-text-secondary">
            {firstSentence(data.aiDetailedResume[1])}
          </p>
        )}

        <div className="my-6 h-px bg-[#eff0f1]" />

        {/* Personal details */}
        <SectionLabel>Personal</SectionLabel>
        <div className="space-y-0">
          <Row label="Gender" value={claimantProfile.gender} />
          <Row label="Date of birth" value={claimantProfile.dob} />
          <Row label="Smoker" value={claimantProfile.smoker} />
        </div>
      </div>
    </div>
  );
}
