import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { createTask } from '../data/datasetMutations';
import { ASSIGNEE_OPTIONS } from '../data/userDirectory';
import { getSystemDataset } from '../data/objectRepository';
import type { DataSourceSettings, ObjectRef } from '../domain/objectRefs';
import {
  CreationFooter,
  CreationInput,
  CREATION_MODAL_HEADER_CLASS,
  CreationModalBackdrop,
  CreationSearchSelect,
  CreationSelect,
  CreationTextarea,
  type SelectOption,
} from './CreationModalControls';
import { RESPONSIVE_FORM_DIALOG_CLASS } from './responsiveDialog';
import { CreationSection } from './creation/CreationSection';
import { CreationReviewSection } from './creation/CreationReviewSection';
import {
  TaskCaseContextCard,
  TaskLinkKindFilter,
  TaskLinkModeChooser,
  TaskReviewSummary,
  type TaskLinkMode,
} from './tasks/TaskCreationSections';
import { LINK_KIND_ICON } from './tasks/TaskCreationSections';
import { toCaseSearchSelectOption } from '../utils/case-display';
import { toAgentSearchSelectOption } from '../utils/agent-display';
import { formatPolicyListSubtitle } from '../utils/policy-display';

const DUE_WINDOW_OPTIONS = ['Same day', '24 hours', '48 hours', '2d', '5 business days', '10 business days'];

export function CreateTaskModal({
  initialCaseId,
  onCreated,
  onOpenChange,
  open,
  dataSource,
  embedded = false,
  onFlowBack,
}: {
  initialCaseId?: string;
  onCreated: (input: { datasetId: string; taskId: string }) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  dataSource: DataSourceSettings;
  embedded?: boolean;
  onFlowBack?: () => void;
}) {
  const dataset = useMemo(() => getSystemDataset(dataSource.activeDatasetId), [dataSource.activeDatasetId]);
  const isCaseContextCreation = Boolean(initialCaseId);
  const activeCaseContext = initialCaseId ? dataset.cases.find((item) => item.id === initialCaseId) : undefined;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [assignee, setAssignee] = useState(ASSIGNEE_OPTIONS[0]?.value ?? ASSIGNEE_OPTIONS[0]?.label ?? 'Unassigned');
  const [queue, setQueue] = useState<'my_tasks' | 'team_tasks'>('my_tasks');
  const [dueWindow, setDueWindow] = useState('48 hours');
  const [caseId, setCaseId] = useState(initialCaseId ?? '');
  const [linkMode, setLinkMode] = useState<TaskLinkMode>('linked');
  const [linkedKind, setLinkedKind] = useState<string>('case');
  const [linkedObjectId, setLinkedObjectId] = useState(initialCaseId ?? '');
  const [reviewOpen, setReviewOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    setCaseId(initialCaseId ?? '');
    setLinkMode(initialCaseId ? 'linked' : 'linked');
    setLinkedKind('case');
    setLinkedObjectId(initialCaseId ?? '');
  }, [initialCaseId, open]);

  const linkedObjectOptions = useMemo<SelectOption[]>(() => {
    switch (linkedKind) {
      case 'case':
        return dataset.cases.map((item) => toCaseSearchSelectOption(item));
      case 'requirement':
        return dataset.requirements.map((item) => ({ value: item.id, label: item.label, description: item.category }));
      case 'request':
        return dataset.requests.map((item) => ({
          value: item.id,
          label: item.label,
          status: item.status,
          statusContext: 'case' as const,
        }));
      case 'document':
        return dataset.documents.map((item) => ({
          value: item.id,
          label: item.label,
          status: item.status,
          statusContext: 'document' as const,
        }));
      case 'client':
        return dataset.clients.map((item) => ({
          value: item.id,
          label: item.name,
          status: item.status,
          statusContext: 'entityTable' as const,
          avatarLabel: item.name
            .split(/\s+/)
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
          contactMeta: {
            date: item.profile?.dob,
            email: item.profile?.email,
            phone: item.profile?.phone,
            address: item.profile?.address ?? item.profile?.location,
          },
        }));
      case 'policy':
        return dataset.policies.map((item) => ({
          value: item.id,
          label: item.label,
          description: item.policyNumber ?? item.id,
          subtitle: formatPolicyListSubtitle(item),
          status: item.status,
          statusContext: 'entityTable' as const,
        }));
      case 'agent':
        return dataset.agents.map((item) => toAgentSearchSelectOption(item));
      case 'application':
        return dataset.applications.map((item) => ({
          value: item.id,
          label: item.label,
          status: item.status,
          statusContext: 'application' as const,
          metadata: [item.product, item.submitted].filter(Boolean) as string[],
        }));
      default:
        return [];
    }
  }, [dataset, linkedKind]);

  const linkedObjectSummary = linkedObjectOptions.find((option) => option.value === linkedObjectId);
  const standalone = !isCaseContextCreation && linkMode === 'standalone';
  const contextComplete = isCaseContextCreation || standalone || Boolean(linkedKind && linkedObjectId);
  const canSubmit = Boolean(title.trim()) && Boolean(assignee && queue) && contextComplete;

  const contextLabel = isCaseContextCreation
    ? activeCaseContext?.title ?? initialCaseId ?? ''
    : standalone
      ? 'Standalone task'
      : linkedObjectSummary?.label ?? '';

  const resetDraft = () => {
    setTitle('');
    setDescription('');
    setPriority('Normal');
    setAssignee(ASSIGNEE_OPTIONS[0]?.value ?? ASSIGNEE_OPTIONS[0]?.label ?? 'Unassigned');
    setQueue('my_tasks');
    setDueWindow('48 hours');
    setCaseId(initialCaseId ?? '');
    setLinkMode('linked');
    setLinkedKind('case');
    setLinkedObjectId(initialCaseId ?? '');
    setReviewOpen(true);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetDraft();
    onOpenChange(nextOpen);
  };

  const submit = () => {
    if (!canSubmit) return;
    const effectiveLinkedKind = isCaseContextCreation ? 'case' : linkedKind;
    const effectiveLinkedObjectId = isCaseContextCreation ? initialCaseId : linkedObjectId;
    const effectiveLinkedObjectLabel = isCaseContextCreation
      ? activeCaseContext?.title ?? initialCaseId ?? ''
      : linkedObjectSummary?.label ?? linkedObjectId;
    const linkedObjects: ObjectRef[] =
      !standalone && effectiveLinkedKind && effectiveLinkedObjectId
        ? [{ kind: effectiveLinkedKind as ObjectRef['kind'], id: effectiveLinkedObjectId, label: effectiveLinkedObjectLabel }]
        : [];
    const result = createTask(dataSource.activeDatasetId, {
      title,
      description,
      priority,
      assignee,
      dueWindow,
      queue,
      caseId: isCaseContextCreation
        ? initialCaseId
        : !standalone && linkedKind === 'case'
          ? linkedObjectId || caseId || undefined
          : caseId || undefined,
      linkedObjects,
      origin: caseId ? 'Case file' : 'Manual task',
    });
    onCreated({ datasetId: result.datasetId, taskId: result.record.id });
    resetDraft();
    onOpenChange(false);
  };

  if (!open) return null;

  const form = (
    <>
        <DialogHeader className={CREATION_MODAL_HEADER_CLASS}>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>
            Describe the work, link context if needed, assign ownership, then review before creating.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <p className="mb-4 text-[12px] text-text-secondary">
            Required fields are marked with an <span className="font-semibold text-brand-red">*</span>.
          </p>
          <div className="space-y-4">
            <CreationSection title="Task details" subtitle="What needs to be done and by when.">
              <div className="grid gap-4">
                <CreationInput
                  required
                  label="Title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Task title"
                />
                <CreationTextarea
                  label="Description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What needs to be done?"
                />
                <div className="grid gap-4 lg:grid-cols-2">
                  <CreationSelect
                    label="Priority"
                    value={priority}
                    onValueChange={setPriority}
                    options={['Urgent', 'High', 'Normal'].map((item) => ({ value: item, label: item }))}
                  />
                  <CreationSelect
                    label="Due window"
                    value={dueWindow}
                    onValueChange={setDueWindow}
                    options={DUE_WINDOW_OPTIONS.map((item) => ({ value: item, label: item }))}
                  />
                </div>
              </div>
            </CreationSection>

            <CreationSection title="Context" subtitle="Link this task to existing work or keep it standalone.">
              {isCaseContextCreation && activeCaseContext ? (
                <TaskCaseContextCard
                  caseId={activeCaseContext.id}
                  title={activeCaseContext.title}
                  status={activeCaseContext.status}
                  caseType={activeCaseContext.caseTypeCode ?? activeCaseContext.caseKind}
                />
              ) : (
                <div className="grid gap-4">
                  <TaskLinkModeChooser
                    mode={linkMode}
                    onChange={(next) => {
                      setLinkMode(next);
                      if (next === 'standalone') setLinkedObjectId('');
                    }}
                  />
                  {linkMode === 'linked' ? (
                    <>
                      <div>
                        <p className="mb-2 text-sm font-medium text-text-primary">Object type</p>
                        <TaskLinkKindFilter
                          value={linkedKind}
                          onChange={(value) => {
                            setLinkedKind(value);
                            setLinkedObjectId('');
                          }}
                        />
                      </div>
                      <CreationSearchSelect
                        required
                        label="Linked object"
                        value={linkedObjectId}
                        onValueChange={setLinkedObjectId}
                        placeholder={`Search ${linkedKind || 'objects'}`}
                        options={linkedObjectOptions}
                        disabled={linkedObjectOptions.length === 0}
                        dropdownMinWidth={linkedKind === 'client' ? 560 : 420}
                      />
                    </>
                  ) : null}
                </div>
              )}
            </CreationSection>

            <CreationSection title="Assignment" subtitle="Who owns this task and which queue it lands in.">
              <div className="grid gap-4 lg:grid-cols-2">
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
                <CreationSelect
                  required
                  label="Queue"
                  value={queue}
                  onValueChange={(value) => setQueue(value as 'my_tasks' | 'team_tasks')}
                  options={[
                    { value: 'my_tasks', label: 'My tasks' },
                    { value: 'team_tasks', label: 'Team queue' },
                  ]}
                />
              </div>
            </CreationSection>

            <CreationReviewSection
              title="Review"
              subtitle="Confirm everything looks correct before creating."
              open={reviewOpen}
              onOpenChange={setReviewOpen}
            >
              <TaskReviewSummary
                title={title}
                description={description}
                priority={priority}
                dueWindow={dueWindow}
                assignee={assignee}
                queueLabel={queue === 'my_tasks' ? 'My tasks' : 'Team queue'}
                contextLabel={contextLabel}
                contextIcon={
                  isCaseContextCreation || linkedKind === 'case'
                    ? LINK_KIND_ICON.case
                    : LINK_KIND_ICON[linkedKind] ?? LINK_KIND_ICON.case
                }
                linked={[
                  {
                    label: 'Linked object',
                    value: standalone ? 'None' : linkedObjectSummary?.label ?? 'None',
                  },
                  {
                    label: 'Case',
                    value:
                      isCaseContextCreation
                        ? activeCaseContext?.title ?? initialCaseId ?? 'None'
                        : linkedKind === 'case'
                          ? linkedObjectSummary?.label ?? 'None'
                          : 'None',
                  },
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
          submitLabel="Create task"
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
