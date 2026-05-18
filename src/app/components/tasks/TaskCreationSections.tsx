import {
  Briefcase,
  Calendar,
  ClipboardCheck,
  FileText,
  Inbox,
  Link2,
  Shield,
  Unlink,
  UserRound,
} from 'lucide-react';
import { PriorityChip } from '../ds';
import { CreationPreviewCard, ReviewMetaBadge } from '../creation/CreationPreviewCard';
import { ChooserCard, ChipFilter } from '../creation/ChooserCard';

export type TaskLinkMode = 'linked' | 'standalone';

const LINK_KIND_OPTIONS = [
  { value: 'case', label: 'Case' },
  { value: 'requirement', label: 'Requirement' },
  { value: 'request', label: 'Request' },
  { value: 'document', label: 'Document' },
  { value: 'client', label: 'Client' },
  { value: 'policy', label: 'Policy' },
  { value: 'agent', label: 'Agent' },
  { value: 'application', label: 'Application' },
];

export const LINK_KIND_ICON: Record<string, typeof Briefcase> = {
  case: Briefcase,
  requirement: ClipboardCheck,
  request: Inbox,
  document: FileText,
  client: UserRound,
  policy: Shield,
  agent: UserRound,
  application: FileText,
};

export function TaskLinkModeChooser({
  mode,
  onChange,
}: {
  mode: TaskLinkMode;
  onChange: (mode: TaskLinkMode) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <ChooserCard
        active={mode === 'linked'}
        onClick={() => onChange('linked')}
        icon={Link2}
        title="Link to a record"
        description="Attach this task to a case, client, policy, or other object."
      />
      <ChooserCard
        active={mode === 'standalone'}
        onClick={() => onChange('standalone')}
        icon={Unlink}
        title="Standalone task"
        description="Create without linking to an existing record."
      />
    </div>
  );
}

export function TaskLinkKindFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return <ChipFilter options={LINK_KIND_OPTIONS} value={value} onChange={onChange} />;
}

export function TaskCaseContextCard({
  caseId,
  title,
  status,
  caseType,
}: {
  caseId: string;
  title: string;
  status?: string;
  caseType?: string;
}) {
  return (
    <div className="rounded-lg border border-border-soft bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3px] text-text-muted">Current case</p>
      <p className="mt-1 text-sm font-semibold text-text-primary">{title}</p>
      <p className="mt-0.5 font-mono text-xs text-text-secondary">{caseId}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {status ? <ReviewMetaBadge icon={Briefcase} label={status} tone="accent" /> : null}
        {caseType ? <ReviewMetaBadge icon={FileText} label={caseType} tone="neutral" /> : null}
      </div>
    </div>
  );
}

export function TaskReviewSummary({
  title,
  description,
  priority,
  dueWindow,
  assignee,
  queueLabel,
  contextLabel,
  contextIcon = Link2,
  linked,
}: {
  title: string;
  description: string;
  priority: string;
  dueWindow: string;
  assignee: string;
  queueLabel: string;
  contextLabel: string;
  contextIcon?: typeof Link2;
  linked: { label: string; value: string; icon?: typeof Briefcase }[];
}) {
  return (
    <CreationPreviewCard
      eyebrow="Task preview"
      title={title}
      subtitle={description.trim() || 'No description added'}
      badges={
        <>
          <PriorityChip priority={priority} />
          <ReviewMetaBadge icon={Calendar} label={`Due ${dueWindow}`} />
          <ReviewMetaBadge icon={Inbox} label={queueLabel} tone="navy" />
          <ReviewMetaBadge icon={UserRound} label={assignee} tone="neutral" />
        </>
      }
      highlight={{
        label: 'Work context',
        value: contextLabel,
        icon: contextIcon,
        emptyLabel: 'No context selected',
      }}
      linked={linked}
      linkedTitle="Routing & links"
    />
  );
}
