import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import {
  CreationFooter,
  CreationInput,
  CREATION_MODAL_HEADER_CLASS,
  CreationModalBackdrop,
  CreationSearchSelect,
  CREATION_LINKED_ENTITIES_GRID_CLASS,
  CreationSecondaryButton,
  CreationSelect,
  CreationTextarea,
} from './CreationModalControls';
import { RESPONSIVE_FORM_DIALOG_CLASS } from './responsiveDialog';
import {
  RequestAudienceChooser,
  RequestCategoryFilter,
  RequestCreationSection,
  RequestReviewSummary,
  RequestTemplateGrid,
} from './requests/RequestCreationSections';
import { CreationReviewSection } from './creation/CreationReviewSection';
import {
  ALL_CATEGORY_FILTER,
  categoriesForMode,
  defaultTemplateForMode,
  filterTemplates,
  findTemplate,
  type RequestCreationMode,
} from './requests/requestCreationConfig';
import { createRequest, createSimpleServiceRequest } from '../data/datasetMutations';
import { DEMO_CURRENT_PERSONA } from '../data/demoPersonas';
import { ASSIGNEE_OPTIONS } from '../data/userDirectory';
import { getSystemDataset } from '../data/objectRepository';
import type { DataSourceSettings } from '../domain/objectRefs';
import type { RequestPriority, RequestSourceChannel } from '../types';
import { toCaseSearchSelectOption } from '../utils/case-display';
import { formatPolicyListSubtitle } from '../utils/policy-display';

type ChainedTaskDraft = {
  id: string;
  title: string;
  type: string;
  assignee: string;
  dueWindow: string;
  description: string;
};

const TASK_TYPES = ['Follow-up call', 'Send reminder', 'Review evidence', 'Update record', 'Decision review', 'QC check'];
const DUE_OPTIONS = ['Same day', '24 hours', '48 hours', '5 business days', '10 business days'];

function newTask(): ChainedTaskDraft {
  return {
    id: `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title: '',
    type: 'Follow-up call',
    assignee: ASSIGNEE_OPTIONS[0]?.value ?? ASSIGNEE_OPTIONS[0]?.label ?? 'Operations queue',
    dueWindow: '48 hours',
    description: '',
  };
}

export function CreateRequestModal({
  dataSource,
  onCreated,
  onOpenChange,
  open,
  embedded = false,
  onFlowBack,
}: {
  dataSource: DataSourceSettings;
  onCreated: (input: { datasetId: string; requestId: string }) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  embedded?: boolean;
  onFlowBack?: () => void;
}) {
  const dataset = useMemo(() => getSystemDataset(dataSource.activeDatasetId), [dataSource.activeDatasetId]);
  const [mode, setMode] = useState<RequestCreationMode>('external');
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORY_FILTER);
  const [templateId, setTemplateId] = useState(defaultTemplateForMode('external').id);
  const template = findTemplate(templateId) ?? defaultTemplateForMode(mode);
  const visibleTemplates = useMemo(() => filterTemplates(mode, categoryFilter), [mode, categoryFilter]);
  const categoryOptions = useMemo(() => categoriesForMode(mode), [mode]);

  const [title, setTitle] = useState(template.defaultTitle);
  const [priority, setPriority] = useState<RequestPriority>('Normal');
  const [sourceChannel, setSourceChannel] = useState<RequestSourceChannel>(template.defaultChannel);
  const [requester, setRequester] = useState('');
  const [clientId, setClientId] = useState('');
  const [caseId, setCaseId] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [requirementId, setRequirementId] = useState('');
  const [due, setDue] = useState('');
  const [notes, setNotes] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [tasks, setTasks] = useState<ChainedTaskDraft[]>([]);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(true);

  const selectedClient = dataset.clients.find((client) => client.id === clientId);
  const selectedCase = dataset.cases.find((caseRecord) => caseRecord.id === caseId);
  const selectedPolicy = dataset.policies.find((policy) => policy.policyNumber === policyNumber || policy.id === policyNumber);
  const selectedRequirement = dataset.requirements.find((requirement) => requirement.id === requirementId);

  const requirementOptions = dataset.requirements
    .filter((requirement) => !caseId || requirement.linkedObjects.some((ref) => ref.kind === 'case' && ref.id === caseId))
    .map((requirement) => ({ value: requirement.id, label: requirement.label, description: requirement.category }));
  const clientOptions = dataset.clients.map((client) => ({
    value: client.id,
    label: client.name,
    status: client.status,
    statusContext: 'entityTable' as const,
    avatarLabel: client.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    contactMeta: {
      date: client.profile?.dob,
      email: client.profile?.email,
      phone: client.profile?.phone,
      address: client.profile?.address ?? client.profile?.location,
    },
  }));

  const isAddressServiceTemplate = templateId === 'int-address-service';
  const canSubmit =
    Boolean(title.trim()) &&
    Boolean(templateId) &&
    (mode === 'internal' ? Boolean(clientId) : Boolean(requester.trim())) &&
    (!isAddressServiceTemplate || (Boolean(policyNumber) && Boolean(newAddress.trim()) && !caseId));

  const applyTemplate = (nextId: string) => {
    const next = findTemplate(nextId);
    if (!next) return;
    setTemplateId(next.id);
    setTitle(next.defaultTitle);
    setSourceChannel(next.defaultChannel);
  };

  const handleModeChange = (nextMode: RequestCreationMode) => {
    setMode(nextMode);
    setCategoryFilter(ALL_CATEGORY_FILTER);
    const nextTemplate = defaultTemplateForMode(nextMode);
    applyTemplate(nextTemplate.id);
  };

  const handleCategoryChange = (nextCategory: string) => {
    setCategoryFilter(nextCategory);
    const pool = filterTemplates(mode, nextCategory);
    if (!pool.some((item) => item.id === templateId)) {
      applyTemplate(pool[0]?.id ?? defaultTemplateForMode(mode).id);
    }
  };

  const reset = () => {
    const initial = defaultTemplateForMode('external');
    setMode('external');
    setCategoryFilter(ALL_CATEGORY_FILTER);
    setTemplateId(initial.id);
    setTitle(initial.defaultTitle);
    setPriority('Normal');
    setSourceChannel(initial.defaultChannel);
    setRequester('');
    setClientId('');
    setCaseId('');
    setPolicyNumber('');
    setRequirementId('');
    setDue('');
    setNotes('');
    setCurrentAddress('');
    setNewAddress('');
    setTasks([]);
    setTasksOpen(false);
    setReviewOpen(true);
  };

  const submit = () => {
    if (!canSubmit) return;
    const activeTemplate = findTemplate(templateId) ?? template;
    const clientName = dataset.clients.find((client) => client.id === clientId)?.name;
    const result =
      isAddressServiceTemplate && clientId && policyNumber && !caseId
        ? createSimpleServiceRequest(dataSource.activeDatasetId, {
            title,
            workflowId: 'address_change',
            clientId,
            policyNumber,
            requester: clientName,
            priority,
            due,
            source: 'Manual client request',
            sourceChannel,
            assignedTo: DEMO_CURRENT_PERSONA.name,
            currentAddress: currentAddress || selectedClient?.profile?.address || '',
            newAddress,
            effectiveDate: due || undefined,
            notes,
          })
        : createRequest(dataSource.activeDatasetId, {
            title,
            category: activeTemplate.category,
            priority,
            due,
            source: mode === 'external' ? 'Manual external request' : 'Manual client request',
            sourceChannel,
            sourceDetail: activeTemplate.label,
            requester: mode === 'external' ? requester : clientName,
            clientId: clientId || undefined,
            caseId: caseId || undefined,
            policyNumber: policyNumber || undefined,
            requirementId: requirementId || undefined,
            notes,
            assignedTo: 'Operations queue',
            tasks: tasks.filter((task) => task.title.trim()).map((task) => ({
              title: task.title,
              type: task.type,
              assignee: task.assignee,
              dueWindow: task.dueWindow,
              description: task.description,
            })),
          });
    const requestId =
      result.record && 'request' in result.record ? result.record.request.id : result.record.id;
    onCreated({ datasetId: result.datasetId, requestId });
    reset();
    onOpenChange(false);
  };

  if (!open) return null;

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const form = (
    <>
        <DialogHeader className={CREATION_MODAL_HEADER_CLASS}>
          <DialogTitle>Create request</DialogTitle>
          <DialogDescription>
            Choose who you are contacting, pick a template, then complete the details. Review before submitting.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            <RequestCreationSection title="Who is this request for?" subtitle="External parties or the client/policyholder.">
              <RequestAudienceChooser mode={mode} onChange={handleModeChange} />
            </RequestCreationSection>

            <RequestCreationSection title="Request type" subtitle="Filter templates by category.">
              <RequestCategoryFilter categories={categoryOptions} value={categoryFilter} onChange={handleCategoryChange} />
            </RequestCreationSection>

            <RequestCreationSection title="Template" subtitle="Pick the workflow that best matches what you need to send.">
              <RequestTemplateGrid
                templates={visibleTemplates}
                selectedId={templateId}
                onSelect={(item) => applyTemplate(item.id)}
              />
            </RequestCreationSection>

            <RequestCreationSection title="Request details" subtitle="Title, priority, channel, and due date.">
              <div className="grid gap-4">
                <CreationInput label="Title" required value={title} onChange={(event) => setTitle(event.target.value)} />
                <div className="grid gap-4 lg:grid-cols-3">
                  <CreationSelect label="Priority" value={priority} onValueChange={(value) => setPriority(value as RequestPriority)} options={['Urgent', 'High', 'Normal'].map((item) => ({ value: item, label: item }))} />
                  <CreationSelect label="Channel" value={sourceChannel} onValueChange={(value) => setSourceChannel(value as RequestSourceChannel)} options={[{ value: 'client_portal', label: 'Client portal' }, { value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }]} />
                  <CreationInput label="Due" value={due} onChange={(event) => setDue(event.target.value)} placeholder="Apr 30, 2026 or 5 business days" />
                </div>
                {mode === 'external' ? (
                  <CreationInput label="Recipient" required value={requester} onChange={(event) => setRequester(event.target.value)} placeholder="Clinic, employer, lab, or contact name" />
                ) : (
                  <CreationSearchSelect label="Client" required value={clientId} onValueChange={setClientId} placeholder="Search clients..." options={clientOptions} />
                )}
                <CreationTextarea label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Instructions, delivery notes, or evidence details." />
              </div>
            </RequestCreationSection>

            <RequestCreationSection title="Linked records" subtitle="Optional context for routing and evidence.">
              <div className={CREATION_LINKED_ENTITIES_GRID_CLASS}>
                <CreationSearchSelect label="Client" value={clientId} onValueChange={setClientId} placeholder="Search clients..." options={clientOptions} />
                <CreationSearchSelect
                  label="Case"
                  value={caseId}
                  onValueChange={setCaseId}
                  placeholder="Search cases"
                  options={dataset.cases.map((caseRecord) => toCaseSearchSelectOption(caseRecord))}
                />
                <CreationSearchSelect
                  label="Policy"
                  value={policyNumber}
                  onValueChange={setPolicyNumber}
                  placeholder="Search policies"
                  options={dataset.policies.map((policy) => ({
                    value: policy.policyNumber ?? policy.id,
                    label: policy.label,
                    description: policy.policyNumber ?? policy.id,
                    subtitle: formatPolicyListSubtitle(policy),
                    status: policy.status,
                    statusContext: 'entityTable' as const,
                  }))}
                />
                <CreationSearchSelect label="Requirement" value={requirementId} onValueChange={setRequirementId} placeholder="Search requirements" options={requirementOptions} />
              </div>
              {isAddressServiceTemplate ? (
                <p className="mt-2 text-sm text-text-muted">
                  Leave case empty for simple policy-service intake. A linked service task is created automatically.
                </p>
              ) : null}
            </RequestCreationSection>

            {isAddressServiceTemplate ? (
              <RequestCreationSection title="Mailing address" subtitle="Current and new addresses for policy admin.">
                <div className="grid gap-4">
                  <CreationInput
                    label="Current address on file"
                    value={currentAddress}
                    onChange={(event) => setCurrentAddress(event.target.value)}
                    placeholder={selectedClient?.profile?.address ?? 'From client profile'}
                  />
                  <CreationInput
                    label="New mailing address"
                    required
                    value={newAddress}
                    onChange={(event) => setNewAddress(event.target.value)}
                    placeholder="Street, city, state, ZIP"
                  />
                </div>
              </RequestCreationSection>
            ) : null}

            <RequestCreationSection
              title="Follow-up tasks"
              subtitle="Optional tasks created with this request."
              collapsible
              open={tasksOpen}
              onOpenChange={setTasksOpen}
              action={
                <CreationSecondaryButton
                  onClick={(event) => {
                    event.stopPropagation();
                    setTasks((current) => [...current, newTask()]);
                    setTasksOpen(true);
                  }}
                >
                  <Plus className="size-3.5" />
                  Add
                </CreationSecondaryButton>
              }
            >
              {tasks.length === 0 ? (
                <p className="text-sm text-text-muted">No follow-up tasks yet.</p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="grid gap-3 rounded-lg border border-border-default bg-white p-4">
                      <div className="flex items-start gap-3">
                        <div className="grid min-w-0 flex-1 gap-4 lg:grid-cols-2">
                          <CreationInput label="Task title" value={task.title} onChange={(event) => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, title: event.target.value } : item))} />
                          <CreationSelect label="Task type" value={task.type} onValueChange={(value) => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, type: value } : item))} options={TASK_TYPES.map((item) => ({ value: item, label: item }))} />
                          <CreationSelect label="Assignee" compactOptions value={task.assignee} onValueChange={(value) => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, assignee: value } : item))} options={ASSIGNEE_OPTIONS.map((item) => ({ value: item.value ?? item.label, label: item.label, description: item.type }))} />
                          <CreationSelect label="Due window" value={task.dueWindow} onValueChange={(value) => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, dueWindow: value } : item))} options={DUE_OPTIONS.map((item) => ({ value: item, label: item }))} />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => setTasks((current) => current.filter((item) => item.id !== task.id))} className="mt-5 text-text-muted hover:text-brand-red">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <CreationTextarea label="Description" value={task.description} onChange={(event) => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, description: event.target.value } : item))} />
                    </div>
                  ))}
                </div>
              )}
            </RequestCreationSection>

            <CreationReviewSection
              title="Review"
              subtitle="Confirm everything looks correct before creating."
              open={reviewOpen}
              onOpenChange={setReviewOpen}
            >
              <RequestReviewSummary
                title={title}
                templateLabel={template.label}
                priority={priority}
                sourceChannel={sourceChannel}
                mode={mode}
                requesterLabel={mode === 'external' ? requester : selectedClient?.name ?? ''}
                notes={notes}
                due={due || undefined}
                linked={[
                  { label: 'Client', value: selectedClient?.name ?? 'None' },
                  { label: 'Case', value: selectedCase?.title ?? 'None' },
                  { label: 'Policy', value: selectedPolicy?.label ?? 'None' },
                  { label: 'Requirement', value: selectedRequirement?.label ?? 'None' },
                  { label: 'Tasks', value: tasks.length ? `${tasks.length} chained` : 'None' },
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
          submitLabel="Create request"
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
