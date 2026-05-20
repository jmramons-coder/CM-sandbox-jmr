import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { createCase } from '../data/datasetMutations';
import { ASSIGNEE_OPTIONS } from '../data/userDirectory';
import { getSystemDataset } from '../data/objectRepository';
import type { DataSourceSettings } from '../domain/objectRefs';
import type { CaseKind, ClaimSubType } from '../types';
import {
  defaultSubTypeForCaseKind,
  subTypeSectionLabel,
  subTypesForCaseKind,
} from '../domain/claimSubTypes';
import {
  CreationFooter,
  CreationInput,
  CREATION_MODAL_HEADER_CLASS,
  CreationModalBackdrop,
  CreationSearchSelect,
  CREATION_LINKED_ENTITIES_GRID_CLASS,
  CreationSelect,
  CreationTextarea,
} from './CreationModalControls';
import { RESPONSIVE_FORM_DIALOG_CLASS } from './responsiveDialog';
import { CreationSection } from './creation/CreationSection';
import { CreationReviewSection } from './creation/CreationReviewSection';
import { CaseKindChooser, CaseReviewSummary, ClaimSubTypeFilter } from './cases/CaseCreationSections';
import { toAgentSearchSelectOption } from '../utils/agent-display';
import { formatPolicyListSubtitle } from '../utils/policy-display';

export function CreateCaseModal({
  dataSource,
  onCreated,
  onOpenChange,
  open,
  embedded = false,
  onFlowBack,
}: {
  dataSource: DataSourceSettings;
  onCreated: (input: { datasetId: string; caseId: string }) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  embedded?: boolean;
  onFlowBack?: () => void;
}) {
  const navigate = useNavigate();
  const dataset = useMemo(() => getSystemDataset(dataSource.activeDatasetId), [dataSource.activeDatasetId]);

  const [caseKind, setCaseKind] = useState<CaseKind>('claim');
  const [claimSubType, setClaimSubType] = useState<ClaimSubType>('disability_benefit');
  const [primaryPartyId, setPrimaryPartyId] = useState('');
  const [policyId, setPolicyId] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [assignee, setAssignee] = useState(ASSIGNEE_OPTIONS[0]?.value ?? ASSIGNEE_OPTIONS[0]?.label ?? 'Unassigned');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [initialFact, setInitialFact] = useState('');
  const [reviewOpen, setReviewOpen] = useState(true);

  const clientOptions = dataset.clients.map((client) => ({
    value: client.id,
    label: client.name,
    status: client.status,
    statusContext: 'entityTable',
    avatarLabel: client.name
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    contactMeta: {
      date: client.profile?.dob,
      email: client.profile?.email,
      phone: client.profile?.phone,
      address: client.profile?.address ?? client.profile?.location,
    },
  }));

  const selectedClient = dataset.clients.find((client) => client.id === primaryPartyId);
  const selectedAgent = dataset.agents.find((agent) => agent.id === agentId);
  const selectedPolicy = dataset.policies.find((policy) => policy.id === policyId);
  const selectedApplication = dataset.applications.find((app) => app.id === applicationId);

  const linkedEntitiesComplete = caseKind === 'agent_onboarding' ? Boolean(agentId) : Boolean(primaryPartyId);
  const canSubmit = Boolean(assignee) && linkedEntitiesComplete;

  const primaryPartyLabel =
    caseKind === 'agent_onboarding' ? selectedAgent?.name ?? '' : selectedClient?.name ?? '';

  const caseSubTypeOptions = useMemo(() => subTypesForCaseKind(caseKind), [caseKind]);

  const handleCaseKindChange = (kind: CaseKind) => {
    setCaseKind(kind);
    const nextSubType = defaultSubTypeForCaseKind(kind);
    if (nextSubType) setClaimSubType(nextSubType);
    if (kind === 'agent_onboarding') {
      setPrimaryPartyId('');
    } else {
      setAgentId('');
    }
  };

  const resetDraft = () => {
    setCaseKind('claim');
    setClaimSubType('disability_benefit');
    setPrimaryPartyId('');
    setPolicyId('');
    setApplicationId('');
    setAgentId('');
    setAssignee(ASSIGNEE_OPTIONS[0]?.value ?? ASSIGNEE_OPTIONS[0]?.label ?? 'Unassigned');
    setTitle('');
    setPriority('Normal');
    setInitialFact('');
    setReviewOpen(true);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetDraft();
    onOpenChange(nextOpen);
  };

  const submit = () => {
    if (!canSubmit) return;
    const result = createCase(dataSource.activeDatasetId, {
      caseKind,
      ...(caseKind === 'claim' || caseKind === 'new_business' ? { claimSubType } : {}),
      primaryPartyId: caseKind === 'agent_onboarding' ? agentId : primaryPartyId,
      policyId: policyId || undefined,
      applicationId: applicationId || undefined,
      agentId: agentId || undefined,
      assignee,
      title,
      priority,
      initialFact,
    });
    onCreated({ datasetId: result.datasetId, caseId: result.record.id });
    resetDraft();
    onOpenChange(false);
    navigate(`/cases/${result.record.id}`);
  };

  if (!open) return null;

  const form = (
    <>
        <DialogHeader className={CREATION_MODAL_HEADER_CLASS}>
          <DialogTitle>Create case</DialogTitle>
          <DialogDescription>
            Pick the case type, link parties, add a briefing, then review before opening the case file.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <p className="mb-4 text-[12px] text-text-secondary">
            Required fields are marked with an <span className="font-semibold text-brand-red">*</span>.
          </p>
          <div className="space-y-4">
            <CreationSection title="Case type" subtitle="What kind of work this case will track.">
              <CaseKindChooser value={caseKind} onChange={handleCaseKindChange} />
              {caseSubTypeOptions.length > 0 ? (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-text-primary">{subTypeSectionLabel(caseKind)}</p>
                  <ClaimSubTypeFilter
                    options={[...caseSubTypeOptions]}
                    value={claimSubType}
                    onChange={setClaimSubType}
                  />
                </div>
              ) : null}
            </CreationSection>

            <CreationSection title="Case details" subtitle="Title, priority, and ownership.">
              <div className="grid gap-4 lg:grid-cols-2">
                <CreationInput
                  label="Title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Optional case title"
                />
                <CreationSelect
                  label="Priority"
                  value={priority}
                  onValueChange={setPriority}
                  options={['Urgent', 'High', 'Normal'].map((item) => ({ value: item, label: item }))}
                />
                <CreationSelect
                  required
                  label="Assignee"
                  compactOptions
                  value={assignee}
                  onValueChange={setAssignee}
                  options={ASSIGNEE_OPTIONS.map((item) => ({
                    value: item.value ?? item.label,
                    label: item.label,
                    description: item.type,
                  }))}
                />
              </div>
            </CreationSection>

            <CreationSection title="Linked entities" subtitle="Parties and records this case should reference.">
              <div className={CREATION_LINKED_ENTITIES_GRID_CLASS}>
                <CreationSearchSelect
                  required={caseKind !== 'agent_onboarding'}
                  label="Primary client"
                  value={primaryPartyId}
                  onValueChange={setPrimaryPartyId}
                  disabled={caseKind === 'agent_onboarding'}
                  placeholder="Search clients by name, email, phone, ID..."
                  options={clientOptions}
                  dropdownMinWidth={560}
                />
                <CreationSearchSelect
                  required={caseKind === 'agent_onboarding'}
                  label="Agent"
                  value={agentId}
                  onValueChange={setAgentId}
                  placeholder="Search agents"
                  options={dataset.agents.map((agent) => toAgentSearchSelectOption(agent))}
                />
                <CreationSearchSelect
                  label="Policy"
                  value={policyId}
                  onValueChange={setPolicyId}
                  placeholder="Search policies"
                  options={dataset.policies.map((policy) => ({
                    value: policy.id,
                    label: policy.label,
                    description: policy.policyNumber ?? policy.id,
                    subtitle: formatPolicyListSubtitle(policy),
                    status: policy.status,
                    statusContext: 'entityTable' as const,
                  }))}
                />
                <CreationSearchSelect
                  label="Application"
                  value={applicationId}
                  onValueChange={setApplicationId}
                  placeholder="Search applications"
                  options={dataset.applications.map((app) => ({
                    value: app.id,
                    label: app.label,
                    status: app.status,
                    statusContext: 'application' as const,
                    metadata: [app.product, app.submitted].filter(Boolean) as string[],
                  }))}
                />
              </div>
            </CreationSection>

            <CreationSection title="Initial briefing" subtitle="Optional starting context for the team.">
              <CreationTextarea
                label="Briefing note"
                value={initialFact}
                onChange={(event) => setInitialFact(event.target.value)}
                placeholder="Intake fact, referral context, or first case note"
              />
            </CreationSection>

            <CreationReviewSection
              title="Review"
              subtitle="Confirm everything looks correct before creating."
              open={reviewOpen}
              onOpenChange={setReviewOpen}
            >
              <CaseReviewSummary
                title={title}
                caseKind={caseKind}
                claimSubType={caseKind === 'claim' || caseKind === 'new_business' ? claimSubType : undefined}
                priority={priority}
                assignee={assignee}
                primaryPartyLabel={primaryPartyLabel}
                briefing={initialFact}
                linked={[
                  {
                    label: 'Client',
                    value: caseKind === 'agent_onboarding' ? 'N/A' : selectedClient?.name ?? 'None',
                  },
                  { label: 'Agent', value: selectedAgent?.name ?? 'None' },
                  { label: 'Policy', value: selectedPolicy?.label ?? 'None' },
                  { label: 'Application', value: selectedApplication?.label ?? 'None' },
                ]}
              />
            </CreationReviewSection>
          </div>
        </div>

        <CreationFooter
          canSubmit={canSubmit}
          isFirstStep
          isLastStep
          onFlowBack={onFlowBack}
          onCancel={() => handleOpenChange(false)}
          onSubmit={submit}
          submitLabel="Create case"
        />
    </>
  );

  if (embedded) {
    return <div className="flex min-h-0 flex-1 flex-col">{form}</div>;
  }

  return (
    <Dialog modal={false} open={open} onOpenChange={handleOpenChange}>
      {open ? <CreationModalBackdrop /> : null}
      <DialogContent layout="auto" className={RESPONSIVE_FORM_DIALOG_CLASS}>
        {form}
      </DialogContent>
    </Dialog>
  );
}
