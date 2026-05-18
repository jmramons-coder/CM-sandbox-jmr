import {
  ClipboardList,
  FileText,
  LifeBuoy,
  Shield,
  UserCheck,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CaseKind, ClaimSubType } from '../../types';
import { claimSubTypeLabel } from '../../domain/claimSubTypes';
import { PriorityChip } from '../ds';
import { ChooserCard, ChipFilter } from '../creation/ChooserCard';
import { CreationPreviewCard, ReviewMetaBadge } from '../creation/CreationPreviewCard';

const CASE_KIND_META: Record<
  CaseKind,
  { title: string; description: string; icon: LucideIcon }
> = {
  claim: {
    title: 'Claim',
    description: 'Disability, life, and benefit claims with requirements and evidence.',
    icon: Shield,
  },
  new_business: {
    title: 'New business',
    description: 'Applications, underwriting, and policy issuance workflows.',
    icon: ClipboardList,
  },
  customer_service: {
    title: 'Customer service',
    description: 'Policy changes, billing questions, and service requests.',
    icon: LifeBuoy,
  },
  agent_onboarding: {
    title: 'Agent onboarding',
    description: 'Producer contracting, licensing, and appointment setup.',
    icon: UserCheck,
  },
};

const LINKED_ICON = {
  Client: UserRound,
  Agent: UserCheck,
  Policy: Shield,
  Application: FileText,
} as const;

export function CaseKindChooser({
  value,
  onChange,
}: {
  value: CaseKind;
  onChange: (kind: CaseKind) => void;
}) {
  const kinds = Object.keys(CASE_KIND_META) as CaseKind[];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {kinds.map((kind) => {
        const meta = CASE_KIND_META[kind];
        return (
          <ChooserCard
            key={kind}
            active={value === kind}
            onClick={() => onChange(kind)}
            icon={meta.icon}
            title={meta.title}
            description={meta.description}
          />
        );
      })}
    </div>
  );
}

export function ClaimSubTypeFilter({
  options,
  value,
  onChange,
}: {
  options: ClaimSubType[];
  value: ClaimSubType;
  onChange: (value: ClaimSubType) => void;
}) {
  return (
    <ChipFilter
      options={options.map((item) => ({ value: item, label: claimSubTypeLabel(item) }))}
      value={value}
      onChange={(next) => onChange(next as ClaimSubType)}
    />
  );
}

export function CaseReviewSummary({
  title,
  caseKind,
  claimSubType,
  priority,
  assignee,
  primaryPartyLabel,
  linked,
  briefing,
}: {
  title: string;
  caseKind: CaseKind;
  claimSubType?: ClaimSubType;
  priority: string;
  assignee: string;
  primaryPartyLabel: string;
  linked: { label: string; value: string }[];
  briefing?: string;
}) {
  const kindMeta = CASE_KIND_META[caseKind];
  const subtitle =
    claimSubType && (caseKind === 'claim' || caseKind === 'new_business')
      ? `${kindMeta.title} · ${claimSubTypeLabel(claimSubType)}`
      : kindMeta.title;

  return (
    <CreationPreviewCard
      eyebrow="Case preview"
      title={title || `${kindMeta.title} case`}
      subtitle={subtitle}
      badges={
        <>
          <ReviewMetaBadge icon={kindMeta.icon} label={kindMeta.title} tone="accent" />
          <PriorityChip priority={priority} />
          <ReviewMetaBadge icon={UserRound} label={assignee} tone="neutral" />
        </>
      }
      highlight={{
        label: caseKind === 'agent_onboarding' ? 'Primary agent' : 'Primary party',
        value: primaryPartyLabel,
        icon: caseKind === 'agent_onboarding' ? UserCheck : UserRound,
        emptyLabel: 'Primary party not selected',
      }}
      linked={linked.map((row) => ({
        ...row,
        icon: LINKED_ICON[row.label as keyof typeof LINKED_ICON],
      }))}
      notes={briefing}
      notesLabel="Initial briefing"
    />
  );
}
