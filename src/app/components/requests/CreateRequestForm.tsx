/**
 * Manual request creation form.
 *
 * Reuses the visual / structural patterns of the Folders "Add participant"
 * form (sticky header + scrollable body + sticky footer, left-nav + right
 * detail for repeating items). Designed so a CSR can compose any external or
 * internal request, attach it to the right policy / client / case /
 * requirement, and optionally chain follow-up tasks before saving.
 */

import React, {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  ClipboardCheck,
  Globe,
  Info,
  Mail,
  Phone,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { CreationSecondaryButton } from '../CreationModalControls';
import { ClientSearchCombobox, type MockClient } from '../entity/SubFolderFormShell';
import { getPersonAvatarColors, getPersonInitials } from '../../utils/person-avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { LozengeTag } from '../LozengeTag';
import { DEMO_CASE_IDS } from '../../data/demoCaseIds';
import { DEMO_CURRENT_PERSONA } from '../../data/demoPersonas';
import { getCaseOverview } from '../../data/mock-cases';
import { createRequest } from '../../data/datasetMutations';
import { filterDatasetBySettings, getSystemDataset, listCaseSummaries } from '../../data/objectRepository';
import { useDataSourceSettings, usePlatformSettings } from '../../contexts/PlatformSettingsContext';
import { MOCK_CLIENTS } from '../../data/mock-entity-folders';
import type { RequestCategory, RequestPriority, RequestSourceChannel } from '../../types';
import {
  ALL_CATEGORY_FILTER,
  categoriesForMode,
  defaultTemplateForMode,
  filterTemplates,
  REQUEST_CREATION_TEMPLATES,
  type RequestCreationMode,
  type RequestCreationTemplate,
} from './requestCreationConfig';
import {
  RequestAudienceChooser,
  RequestCategoryFilter,
  RequestReviewSummary,
  RequestTemplateGrid,
} from './RequestCreationSections';
import { CreationReviewSection } from '../creation/CreationReviewSection';

type RequestMode = RequestCreationMode;
type RequestTemplate = RequestCreationTemplate;

type ChainedTaskDraft = {
  id: string;
  title: string;
  type: string;
  assignee: string;
  dueWindow: string;
  description: string;
};

type CreateRequestDraft = {
  mode: RequestMode;
  templateId: string;
  category: RequestCategory;
  title: string;
  priority: RequestPriority;
  due: string;
  externalRecipientName: string;
  externalRecipientOrganization: string;
  externalRecipientEmail: string;
  externalRecipientPhone: string;
  internalClient: MockClient | null;
  sourceChannel: RequestSourceChannel;
  clientId: string;
  caseId: string;
  policyNumber: string;
  requirementId: string;
  notes: string;
  tasks: ChainedTaskDraft[];
};

const REQUEST_TEMPLATES = REQUEST_CREATION_TEMPLATES;

const PRIORITIES: RequestPriority[] = ['Urgent', 'High', 'Normal'];

const TASK_TYPES = [
  'Follow-up call',
  'Send reminder',
  'Review evidence',
  'Update record',
  'Decision review',
  'QC check',
];

const TASK_ASSIGNEE_OPTIONS = [
  'Me',
  'Auto-assign to case assignee',
  'Operations queue',
  'AI Intake',
  DEMO_CURRENT_PERSONA.name,
];

const TASK_DUE_OPTIONS = [
  'Same day',
  '24 hours',
  '48 hours',
  '5 business days',
  '10 business days',
];

const SOURCE_CHANNEL_OPTIONS: { value: RequestSourceChannel; label: string; icon: typeof Mail }[] = [
  { value: 'client_portal', label: 'Client portal', icon: Globe },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
];

let chainedTaskCounter = 1;

function createEmptyTask(): ChainedTaskDraft {
  return {
    id: `task-${chainedTaskCounter++}`,
    title: '',
    type: '',
    assignee: '',
    dueWindow: '',
    description: '',
  };
}

function buildInitialDraft(template: RequestTemplate): CreateRequestDraft {
  return {
    mode: template.mode,
    templateId: template.id,
    category: template.category,
    title: template.defaultTitle,
    priority: 'Normal',
    due: '',
    externalRecipientName: '',
    externalRecipientOrganization: '',
    externalRecipientEmail: '',
    externalRecipientPhone: '',
    internalClient: null,
    sourceChannel: template.defaultChannel,
    clientId: '',
    caseId: '',
    policyNumber: '',
    requirementId: '',
    notes: '',
    tasks: [],
  };
}

export function CreateRequestForm() {
  const navigate = useNavigate();
  const dataSource = useDataSourceSettings();
  const { updateDataSource } = usePlatformSettings();
  const activeDataset = useMemo(() => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource), [dataSource]);
  const caseOptions = useMemo(() => listCaseSummaries(activeDataset), [activeDataset]);
  const clientOptions = useMemo<MockClient[]>(() => {
    const datasetClients = activeDataset.clients.map((client) => {
      const avatarColors = getPersonAvatarColors(client.id);
      return {
        id: client.id,
        name: client.name,
        initials: getPersonInitials(client.name),
        status: client.status === 'inactive' ? 'inactive' as const : 'active' as const,
        category: client.category === 'dependent' || client.category === 'relatedParty' ? client.category : 'policyholder' as const,
        gender: client.profile?.gender ?? 'Not captured',
        dob: client.profile?.dob ?? '',
        age: 0,
        email: client.profile?.email ?? '',
        phone: client.profile?.phone,
        address: client.profile?.location,
        parish: client.profile?.location,
        taxId: client.taxId,
        avatarColor: avatarColors.background,
        avatarTextColor: avatarColors.foreground,
      };
    });
    return dataSource.legacyMockOverlayEnabled === false ? datasetClients : [...datasetClients, ...MOCK_CLIENTS];
  }, [activeDataset.clients, dataSource.legacyMockOverlayEnabled]);
  const [searchParams] = useSearchParams();
  const presetCaseId = searchParams.get('caseId') ?? '';
  const presetClientId = searchParams.get('clientId') ?? '';
  const presetSmartUpload = searchParams.get('smart') === '1';
  const initialTemplate = defaultTemplateForMode(presetSmartUpload ? 'internal' : 'external');

  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORY_FILTER);
  const [reviewOpen, setReviewOpen] = useState(true);

  const [draft, setDraft] = useState<CreateRequestDraft>(() => {
    const base = buildInitialDraft(
      presetSmartUpload
        ? (REQUEST_TEMPLATES.find((tpl) => tpl.id === 'int-address') ?? initialTemplate)
        : initialTemplate,
    );
    if (presetSmartUpload) {
      base.mode = 'internal';
      base.title = 'Client information update — address change';
      base.caseId = DEMO_CASE_IDS.wopClaim;
      base.notes =
        'Drafted from Smart Request analysis. Detected address change for Billy Bud with proof-of-residence and missing government ID follow-ups.';
    }
    if (presetCaseId) {
      base.caseId = presetCaseId;
      const matchedCase = caseOptions.find((row) => row.id === presetCaseId);
      if (matchedCase?.policyNumber) base.policyNumber = matchedCase.policyNumber;
    }
    if (presetClientId) {
      const matchedClient = clientOptions.find((c) => c.id === presetClientId);
      if (matchedClient) {
        base.internalClient = matchedClient;
        base.clientId = matchedClient.id;
      }
    }
    return base;
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const selectedTemplate = useMemo(
    () => REQUEST_TEMPLATES.find((tpl) => tpl.id === draft.templateId) ?? initialTemplate,
    [draft.templateId, initialTemplate],
  );

  const updateDraft = useCallback(<K extends keyof CreateRequestDraft>(key: K, value: CreateRequestDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const visibleTemplates = useMemo(
    () => filterTemplates(draft.mode, categoryFilter),
    [draft.mode, categoryFilter],
  );
  const categoryOptions = useMemo(() => categoriesForMode(draft.mode), [draft.mode]);

  const handleModeChange = useCallback((mode: RequestMode) => {
    const fallback = defaultTemplateForMode(mode);
    setCategoryFilter(ALL_CATEGORY_FILTER);
    setDraft((prev) => ({
      ...buildInitialDraft(fallback),
      caseId: prev.caseId,
      policyNumber: prev.policyNumber,
      clientId: prev.clientId,
      internalClient: prev.internalClient,
      requirementId: prev.requirementId,
      notes: prev.notes,
      tasks: prev.tasks,
    }));
  }, []);

  const handleCategoryFilterChange = useCallback(
    (nextCategory: string) => {
      setCategoryFilter(nextCategory);
      const pool = filterTemplates(draft.mode, nextCategory);
      const template = pool[0] ?? defaultTemplateForMode(draft.mode);
      setDraft((prev) => ({
        ...prev,
        templateId: template.id,
        category: template.category,
        title: template.defaultTitle,
        mode: template.mode,
        sourceChannel: template.defaultChannel,
      }));
    },
    [draft.mode],
  );

  const handleTemplateSelect = useCallback((template: RequestTemplate) => {
    setDraft((prev) => ({
      ...prev,
      templateId: template.id,
      category: template.category,
      title: template.defaultTitle,
      mode: template.mode,
      sourceChannel: template.defaultChannel,
    }));
  }, []);

  const handleCaseChange = useCallback((caseId: string) => {
    const matchedCase = caseOptions.find((row) => row.id === caseId);
    setDraft((prev) => ({
      ...prev,
      caseId,
      policyNumber: matchedCase?.policyNumber ?? prev.policyNumber,
      requirementId: '',
    }));
  }, [caseOptions]);

  const requirementOptions = useMemo(() => {
    if (!draft.caseId) return [];
    const overview = getCaseOverview(draft.caseId, activeDataset, false);
    return overview?.requirements ?? [];
  }, [activeDataset, dataSource.legacyMockOverlayEnabled, draft.caseId]);

  const policyOptions = useMemo(() => {
    const set = new Set<string>();
    caseOptions.forEach((row) => {
      if (row.policyNumber) set.add(row.policyNumber);
    });
    return Array.from(set);
  }, [caseOptions]);

  const handleAddTask = useCallback(() => {
    const next = createEmptyTask();
    setDraft((prev) => ({ ...prev, tasks: [...prev.tasks, next] }));
    setSelectedTaskId(next.id);
  }, []);

  const handleRemoveTask = useCallback((taskId: string) => {
    setDraft((prev) => {
      const remaining = prev.tasks.filter((t) => t.id !== taskId);
      return { ...prev, tasks: remaining };
    });
    setSelectedTaskId((prev) => (prev === taskId ? null : prev));
  }, []);

  const handleUpdateTask = useCallback(<K extends keyof ChainedTaskDraft>(taskId: string, key: K, value: ChainedTaskDraft[K]) => {
    setDraft((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, [key]: value } : task)),
    }));
  }, []);

  const selectedTask = draft.tasks.find((t) => t.id === selectedTaskId) ?? null;
  const isExternal = draft.mode === 'external';

  const reviewRequesterLabel = isExternal
    ? draft.externalRecipientName || draft.externalRecipientOrganization
    : draft.internalClient?.name ?? '';

  const reviewLinked = useMemo(() => {
    const caseRow = caseOptions.find((row) => row.id === draft.caseId);
    const requirement = requirementOptions.find((req) => String(req.id) === draft.requirementId);
    return [
      { label: 'Client', value: draft.internalClient?.name ?? (draft.clientId || 'None') },
      { label: 'Case', value: caseRow ? `${caseRow.id} – ${caseRow.claimant}` : 'None' },
      { label: 'Policy', value: draft.policyNumber || 'None' },
      {
        label: 'Requirement',
        value: requirement ? `${requirement.name} — ${requirement.status}` : 'None',
      },
      { label: 'Tasks', value: draft.tasks.length ? `${draft.tasks.length} chained` : 'None' },
    ];
  }, [caseOptions, draft.caseId, draft.clientId, draft.internalClient?.name, draft.policyNumber, draft.requirementId, draft.tasks.length, requirementOptions]);

  const validationIssues = useMemo(() => {
    const errors: string[] = [];
    if (!draft.title.trim()) errors.push('Add a request title.');
    if (isExternal && !draft.externalRecipientName.trim() && !draft.externalRecipientOrganization.trim()) {
      errors.push('Add a recipient name or organisation.');
    }
    if (!isExternal && !draft.internalClient) {
      errors.push('Pick a client to send the request to.');
    }
    return errors;
  }, [draft, isExternal]);

  const handleSubmit = useCallback(
    (options: { withTask?: boolean } = {}) => {
      if (validationIssues.length > 0) {
        setShowValidation(true);
        return;
      }
      if (options.withTask && draft.tasks.length === 0) {
        const next = createEmptyTask();
        setDraft((prev) => ({ ...prev, tasks: [next] }));
        setSelectedTaskId(next.id);
        return;
      }
      const result = createRequest(dataSource.activeDatasetId, {
        title: draft.title,
        category: draft.category,
        priority: draft.priority,
        due: draft.due,
        source: isExternal ? 'Manual external request' : 'Manual client request',
        sourceChannel: draft.sourceChannel,
        sourceDetail: selectedTemplate?.label,
        requester: isExternal
          ? draft.externalRecipientName || draft.externalRecipientOrganization || 'External party'
          : draft.internalClient?.name,
        clientId: draft.clientId || draft.internalClient?.id,
        caseId: draft.caseId,
        policyNumber: draft.policyNumber,
        requirementId: draft.requirementId,
        notes: draft.notes,
        assignedTo: 'Operations queue',
        tasks: draft.tasks.map((task) => ({
          title: task.title || `${draft.title} follow-up`,
          type: task.type,
          assignee: task.assignee,
          dueWindow: task.dueWindow,
          description: task.description,
        })),
      });
      updateDataSource({ activeDatasetId: result.datasetId });
      navigate(`/requests#request=${encodeURIComponent(result.record.id)}`);
    },
    [dataSource.activeDatasetId, draft, isExternal, navigate, selectedTemplate?.label, updateDataSource, validationIssues.length],
  );

  return (
    <FormShell
      title="Create new request"
      subtitle="Choose audience and template, complete the details, then review before submitting."
      onCancel={() => navigate(-1)}
      onSubmit={() => handleSubmit()}
      onSubmitWithTask={() => handleSubmit({ withTask: true })}
      submitDisabled={validationIssues.length > 0 && showValidation}
      tasksCount={draft.tasks.length}
    >
      <p className="mb-4 text-sm italic text-text-primary">
        Required fields are marked with a <span className="text-brand-red">*</span>.
      </p>

      {presetSmartUpload ? (
        <div className="mb-4 rounded-lg border border-brand-accent/25 bg-brand-accent-light/50 px-4 py-3">
          <p className="text-sm font-semibold text-brand-accent">Smart Request draft</p>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            Fields below were prefilled from Smart Request. Review the detected request type,
            case linkage, and notes before creating the intake package.
          </p>
        </div>
      ) : null}

      {showValidation && validationIssues.length > 0 ? (
        <div className="mb-4 rounded-md border border-brand-red/40 bg-[#fdecec] px-4 py-3 text-sm text-brand-red">
          <p className="font-semibold">Some required information is missing</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {validationIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <SectionCard title="1. Who & what" subtitle="Audience, request type, and template.">
        <div className="space-y-6">
          <div>
            <Label required>Send to</Label>
            <RequestAudienceChooser mode={draft.mode} onChange={handleModeChange} />
          </div>

          <div>
            <Label>Request type</Label>
            <RequestCategoryFilter
              categories={categoryOptions}
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
            />
            <p className="mt-1.5 text-xs text-text-muted">Routing category: {draft.category}</p>
          </div>

          <div>
            <Label required>Template</Label>
            <RequestTemplateGrid
              templates={visibleTemplates}
              selectedId={draft.templateId}
              onSelect={handleTemplateSelect}
            />
            {selectedTemplate ? (
              <p className="mt-2 text-xs text-text-muted">{selectedTemplate.description}</p>
            ) : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="2. Request details" subtitle="Title, priority, due date, and delivery channel.">
        <div className="space-y-5">
          <div>
            <Label required>Title</Label>
            <TextInput
              value={draft.title}
              onChange={(value) => updateDraft('title', value)}
              placeholder="Short subject line that describes the request"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <Label>Priority</Label>
              <Select value={draft.priority} onValueChange={(value) => updateDraft('priority', value as RequestPriority)}>
                <SelectTrigger className="h-10 w-full border-[#b7bbc2] bg-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due</Label>
              <TextInput type="date" value={draft.due} onChange={(value) => updateDraft('due', value)} />
            </div>
            <div>
              <Label>Send via</Label>
              <Select value={draft.sourceChannel} onValueChange={(value) => updateDraft('sourceChannel', value as RequestSourceChannel)}>
                <SelectTrigger className="h-10 w-full border-[#b7bbc2] bg-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_CHANNEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="3. Recipient">
        {isExternal ? (
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <Label required>Recipient name</Label>
                <TextInput
                  value={draft.externalRecipientName}
                  onChange={(value) => updateDraft('externalRecipientName', value)}
                  placeholder="Dr. Maya Chen"
                />
              </div>
              <div>
                <Label>Organisation</Label>
                <TextInput
                  value={draft.externalRecipientOrganization}
                  onChange={(value) => updateDraft('externalRecipientOrganization', value)}
                  placeholder={selectedTemplate.recipientHint ?? 'Clinic or provider'}
                />
              </div>
              <div>
                <Label>Email</Label>
                <TextInput
                  type="email"
                  value={draft.externalRecipientEmail}
                  onChange={(value) => updateDraft('externalRecipientEmail', value)}
                  placeholder="records@example.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <TextInput
                  value={draft.externalRecipientPhone}
                  onChange={(value) => updateDraft('externalRecipientPhone', value)}
                  placeholder="+44 20 7946 0000"
                />
              </div>
            </div>
            <InfoBanner>
              External requests are sent through the channel selected above. Replies are auto-routed back into this request thread when received.
            </InfoBanner>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <Label required>Client</Label>
              <ClientSearchCombobox
                value={draft.internalClient}
                options={clientOptions}
                onChange={(client) => {
                  setDraft((prev) => ({
                    ...prev,
                    internalClient: client,
                    clientId: client?.id ?? '',
                  }));
                }}
              />
              <p className="mt-1.5 text-xs text-text-muted">
                The client must exist in the participant directory. Use Folders → add participant if missing.
              </p>
            </div>
            <InfoBanner>
              Internal requests reach the client through their preferred channel. Portal-delivered forms generate a self-serve link automatically.
            </InfoBanner>
          </div>
        )}
      </SectionCard>

      <SectionCard title="4. Linked records">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label>Policy</Label>
              <Select value={draft.policyNumber || undefined} onValueChange={(value) => updateDraft('policyNumber', value)}>
                <SelectTrigger className="h-10 w-full border-[#b7bbc2] bg-white text-sm">
                  <SelectValue placeholder="Pick a policy" />
                </SelectTrigger>
                <SelectContent>
                  {policyOptions.map((policy) => (
                    <SelectItem key={policy} value={policy}>{policy}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Case</Label>
              <Select value={draft.caseId || undefined} onValueChange={handleCaseChange}>
                <SelectTrigger className="h-10 w-full border-[#b7bbc2] bg-white text-sm">
                  <SelectValue placeholder="Pick a case" />
                </SelectTrigger>
                <SelectContent>
                  {caseOptions.map((row) => (
                    <SelectItem key={row.id} value={row.id}>
                      {`${row.id} – ${row.claimant}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Requirement</Label>
            <Select
              value={draft.requirementId || undefined}
              onValueChange={(value) => updateDraft('requirementId', value)}
            >
              <SelectTrigger className="h-10 w-full border-[#b7bbc2] bg-white text-sm">
                <SelectValue placeholder={draft.caseId ? 'Pick a requirement on this case' : 'Pick a case first'} />
              </SelectTrigger>
              <SelectContent>
                {requirementOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-text-muted">No requirements on this case yet.</div>
                ) : (
                  requirementOptions.map((req) => (
                    <SelectItem key={req.id} value={String(req.id)}>
                      {`${req.name} — ${req.status}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="mt-1.5 text-xs text-text-muted">
              Linking the request to a requirement automatically attaches incoming evidence to that requirement.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="5. Chained tasks"
        subtitle="Tasks created automatically when this request is submitted. Optional."
        action={
          <CreationSecondaryButton onClick={handleAddTask}>
            <Plus className="size-3.5" />
            Add task
          </CreationSecondaryButton>
        }
      >
        {draft.tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border-default bg-white px-4 py-6 text-center">
            <ClipboardCheck className="mx-auto size-5 text-text-muted" />
            <p className="mt-1.5 text-sm font-medium text-text-primary">No tasks yet</p>
            <p className="mt-0.5 text-xs text-text-muted">
              Add a task to chain a follow-up action (e.g. review evidence, call client) once this request is sent.
            </p>
          </div>
        ) : (
          <div className="grid min-h-[280px] grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
            <TaskNav
              tasks={draft.tasks}
              selectedId={selectedTaskId}
              onSelect={setSelectedTaskId}
              onAdd={handleAddTask}
              onRemove={handleRemoveTask}
            />
            <TaskDetailPanel
              task={selectedTask}
              onUpdate={handleUpdateTask}
            />
          </div>
        )}
      </SectionCard>

      <CreationReviewSection
          className="mb-5"
          title="6. Review"
          subtitle="Confirm everything looks correct before creating."
          open={reviewOpen}
          onOpenChange={setReviewOpen}
        >
          <RequestReviewSummary
            title={draft.title}
            templateLabel={selectedTemplate.label}
            priority={draft.priority}
            sourceChannel={draft.sourceChannel}
            mode={draft.mode}
            requesterLabel={reviewRequesterLabel}
            notes={draft.notes}
            linked={reviewLinked}
            due={draft.due || undefined}
          />
        </CreationReviewSection>

      <SectionCard title="7. Internal notes" subtitle="Visible to staff handling this request, not sent to the recipient.">
        <textarea
          value={draft.notes}
          onChange={(event) => updateDraft('notes', event.target.value)}
          placeholder="Context for the team handling the response"
          rows={4}
          className="block w-full resize-y rounded-md border border-[#b7bbc2] bg-white px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
        />
      </SectionCard>
    </FormShell>
  );
}

/* ─── Layout shell ─── */

function FormShell({
  children,
  onCancel,
  onSubmit,
  onSubmitWithTask,
  submitDisabled,
  subtitle,
  tasksCount,
  title,
}: {
  children: ReactNode;
  onCancel: () => void;
  onSubmit: () => void;
  onSubmitWithTask: () => void;
  submitDisabled: boolean;
  subtitle: string;
  tasksCount: number;
  title: string;
}) {
  return (
    <div className="flex h-full flex-col bg-surface-primary">
      <div className="shrink-0 border-b border-border-default bg-white px-4 pb-4 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold leading-tight text-text-primary">{title}</h1>
            <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1.5 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
            aria-label="Close form"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="w-full px-4 py-5 sm:px-6 lg:px-8 lg:py-6 xl:max-w-[70%]">
          {children}
        </div>
      </div>

      <div className="shrink-0 border-t border-border-default bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled}
            className="rounded-full bg-brand-blue px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-brand-blue-hover disabled:opacity-50"
          >
            {tasksCount > 0 ? `Create request \u00b7 chain ${tasksCount} ${tasksCount === 1 ? 'task' : 'tasks'}` : 'Create request'}
          </button>
          {tasksCount === 0 ? (
            <button
              type="button"
              onClick={onSubmitWithTask}
              className="rounded-full border-2 border-brand-blue px-5 py-2 text-xs font-bold uppercase tracking-wide text-brand-blue transition-colors hover:bg-brand-blue/5"
            >
              Create request &amp; add task
            </button>
          ) : null}
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold uppercase tracking-wide text-text-secondary transition-colors hover:text-text-primary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Building blocks ─── */

function SectionCard({
  action,
  children,
  subtitle,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  subtitle?: string;
  title: string;
}) {
  return (
    <section className="mb-5 flex flex-col gap-4 rounded-lg border border-border-default bg-white p-4 sm:p-5 lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-text-primary">
      {children}
      {required ? <span className="ml-0.5 text-brand-red">*</span> : null}
    </label>
  );
}

function TextInput({
  onChange,
  placeholder,
  type = 'text',
  value,
}: {
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-md border border-[#b7bbc2] bg-white px-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
    />
  );
}

function InfoBanner({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-md bg-status-info-bg px-4 py-3 text-sm text-text-secondary">
      <Info className="mt-0.5 size-4 shrink-0 text-brand-blue" />
      <p className="leading-5">{children}</p>
    </div>
  );
}

/* ─── Tasks left nav ─── */

function TaskNav({
  onAdd,
  onRemove,
  onSelect,
  selectedId,
  tasks,
}: {
  onAdd: () => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
  tasks: ChainedTaskDraft[];
}) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border-default bg-white">
      <div className="border-b border-border-default px-4 py-3">
        <h3 className="text-sm font-semibold text-text-primary">Chained tasks</h3>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tasks.map((task) => {
          const active = task.id === selectedId;
          return (
            <div
              key={task.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(task.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onSelect(task.id);
              }}
              className={`group relative flex cursor-pointer items-start justify-between gap-2 px-4 py-3 transition-colors ${
                active ? 'bg-brand-blue/10' : 'hover:bg-surface-hover'
              }`}
            >
              <div className="min-w-0">
                <p className={`truncate text-sm text-text-primary ${active ? 'font-semibold' : 'font-medium'}`}>
                  {task.title || 'New task'}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <LozengeTag
                    label={task.type ? task.type.toUpperCase() : 'NEW'}
                    type={task.type ? 'Informative' : 'Neutral'}
                    subtle
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(task.id);
                }}
                className="shrink-0 rounded p-1 text-text-muted opacity-0 transition-opacity hover:bg-surface-muted hover:text-text-primary group-hover:opacity-100"
                aria-label="Remove task"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border-default px-4 py-3">
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-brand-blue"
        >
          <Plus className="size-4" />
          Add task
        </button>
      </div>
    </div>
  );
}

function TaskDetailPanel({
  onUpdate,
  task,
}: {
  onUpdate: <K extends keyof ChainedTaskDraft>(taskId: string, key: K, value: ChainedTaskDraft[K]) => void;
  task: ChainedTaskDraft | null;
}) {
  if (!task) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-border-default bg-white p-8">
        <p className="text-sm text-text-muted">Select a task to edit its details.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border-default bg-white">
      <div className="border-b border-border-default px-5 py-4">
        <h3 className="text-base font-semibold text-text-primary">Task details</h3>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <div>
          <Label required>Title</Label>
          <TextInput
            value={task.title}
            onChange={(value) => onUpdate(task.id, 'title', value)}
            placeholder="What needs to happen next?"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Type</Label>
            <Select value={task.type || undefined} onValueChange={(value) => onUpdate(task.id, 'type', value)}>
              <SelectTrigger className="h-10 w-full border-[#b7bbc2] bg-white text-sm">
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                {TASK_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Assignee</Label>
            <Select value={task.assignee || undefined} onValueChange={(value) => onUpdate(task.id, 'assignee', value)}>
              <SelectTrigger className="h-10 w-full border-[#b7bbc2] bg-white text-sm">
                <SelectValue placeholder="Assign to" />
              </SelectTrigger>
              <SelectContent>
                {TASK_ASSIGNEE_OPTIONS.map((assignee) => (
                  <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Due window</Label>
            <Select value={task.dueWindow || undefined} onValueChange={(value) => onUpdate(task.id, 'dueWindow', value)}>
              <SelectTrigger className="h-10 w-full border-[#b7bbc2] bg-white text-sm">
                <SelectValue placeholder="Pick a window" />
              </SelectTrigger>
              <SelectContent>
                {TASK_DUE_OPTIONS.map((due) => (
                  <SelectItem key={due} value={due}>{due}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Notes</Label>
          <textarea
            value={task.description}
            onChange={(event) => onUpdate(task.id, 'description', event.target.value)}
            rows={3}
            placeholder="Add context for whoever picks up this task"
            className="block w-full resize-y rounded-md border border-[#b7bbc2] bg-white px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
          />
        </div>
      </div>
    </div>
  );
}
