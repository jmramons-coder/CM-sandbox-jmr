import { useEffect, useMemo, useRef, useState, type ComponentType, type DragEvent, type MouseEvent as ReactMouseEvent, type SVGProps } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  Check,
  ChevronDown,
  Copy,
  Database,
  FileText,
  FolderOpen,
  Globe,
  GripVertical,
  HandCoins,
  Home,
  ImagePlus,
  Inbox,
  Laptop,
  LayoutGrid,
  Lightbulb,
  MessageSquare,
  Moon,
  Palette,
  PanelRight,
  Pipette,
  Plus,
  RotateCcw,
  Download,
  Save,
  ShieldCheck,
  Sliders,
  Sun,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Switch } from './ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AiCueSparkle } from './AiCueSparkle';
import { SimpleLogo } from './SimpleLogo';
import { ModuleTabsBar, type ModuleTabItem } from './ModuleTabsBar';
import { SegmentedControl } from './ds';
import {
  DEFAULT_BRANDING,
  useBranding,
  usePlatformSettings,
  type AnatomySettings,
  type ModuleId,
  type SavedDemoConfiguration,
} from '../contexts/PlatformSettingsContext';
import { type SystemDataset } from '../data/multi-case-dataset';
import { DATASET_GENERATION_PROFILES, generateDatasetFromProfile, previewDatasetGeneration } from '../data/datasetGenerator';
import { buildDatasetGenerationPrompt } from '../data/datasetPromptBuilder';
import { validateDatasetPackage, type AmplifyDatasetPackage } from '../data/datasetPackageSchema';
import { datasetFromPackage } from '../data/datasetPackageMappers';
import { datasetRegistry, getDatasetMetadata } from '../data/datasetRegistry';
import { listAiActions } from '../data/objectRepository';
import { generatedDatasetRepository } from '../data/generatedDatasetRepository';
import { demoEnvironmentRepository } from '../data/demoEnvironmentRepository';
import { DEPLOYABLE_PRESET_REPO_PATH } from '../data/demo-environment-deploy';
import { isBuiltInDemoEnvironment } from '../data/demo-environment-presets';
import { resolveBrandingLogoSrc } from '../utils/branding-logo';
import { DATA_ADAPTER_CONTRACTS, type DatasetMetadata } from '../data/dataAdapters';
import { runDatasetQualityChecks, validateSystemDataset } from '../data/dataQualityGuards';
import { WORKFLOW_DEFINITIONS, getPrimaryWorkflowDefinition, type WorkflowDefinition } from '../domain/workflows';
import type { CaseKind, WorkObjectKind } from '../domain/objectRefs';
import {
  IMPORT_TARGETS,
  ENTITY_SCHEMA_DEFINITIONS,
  OBJECT_DOMAIN_DEFINITIONS,
  OBJECT_RELATIONSHIPS,
  countRelationshipIssuesByKind,
  countCasesByWorkflow,
  countDatasetObjects,
  findRelationshipIssues,
  getInboundRelationships,
  getOutboundRelationships,
  validateModuleBoundaryRules,
  type CatalogObjectKind,
  type DatasetObjectCounts,
  type EntitySchemaDefinition,
  type ModuleBoundaryIssue,
  type ObjectRelationshipDefinition,
  type RelationshipIssue,
} from '../domain/dataArchitecture';
import { projectCaseRecordForCatalogRow } from '../domain/claimSubTypes';
import { buildSchemaGraph, getDatasetRowsForKind, type SchemaGraphNode } from '../domain/schemaGraph';
import { ENTITY_ANATOMY_DEFINITIONS } from '../domain/entityAnatomy';
import {
  buildContentTabOverridesForKind,
  mergeCaseShellWithCaseType,
  resolveCaseAnatomyForSettings,
  resolveCaseTypeForSettings,
} from '../domain/runtimeDataConfig';
import { DEFAULT_LANGUAGE, LANGUAGES, SUPPORTED_LANGUAGES } from '../i18n/types';

export type PlatformSettingsTab = 'branding' | 'modules' | 'data' | 'intelligence' | 'language' | 'roles' | 'demo';

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

/** Wraps AiCueSparkle so it can be used as an IconType in the TABS array. */
function AiCueSparkleTabIcon({ className }: { className?: string }) {
  return <AiCueSparkle size={16} className={className} />;
}

type TabMeta = {
  id: PlatformSettingsTab;
  /** i18n key under `settings.tabs.<id>.label`. */
  labelKey: string;
  icon: IconType;
};

const TABS: TabMeta[] = [
  { id: 'branding', labelKey: 'settings:tabs.branding.label', icon: Palette },
  { id: 'modules', labelKey: 'settings:tabs.modules.label', icon: LayoutGrid },
  { id: 'data', labelKey: 'settings:tabs.data.label', icon: Database },
  { id: 'intelligence', labelKey: 'settings:tabs.intelligence.label', icon: AiCueSparkleTabIcon },
  { id: 'language', labelKey: 'settings:tabs.language.label', icon: Globe },
  { id: 'roles', labelKey: 'settings:tabs.roles.label', icon: ShieldCheck },
  { id: 'demo', labelKey: 'settings:tabs.demo.label', icon: Laptop },
];

/* ─── Modal ─── */

export function PlatformSettingsModal({
  open,
  onOpenChange,
  initialTab = 'branding',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: PlatformSettingsTab;
}) {
  const { t } = useTranslation(['settings', 'common']);
  const [tab, setTab] = useState<PlatformSettingsTab>(initialTab);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  const activeTab = TABS.find((tabMeta) => tabMeta.id === tab) ?? TABS[0];
  const activeTabLabel = t(activeTab.labelKey as never);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        layout="below-header"
        className="flex h-full overflow-hidden"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {t('settings:modal.title', { tab: activeTabLabel })}
        </DialogTitle>

        {/* ─── Left sidebar ─── */}
        <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-[#ececec] bg-surface-primary">
          <div className="px-5 pb-3 pt-5">
            <p className="text-[13px] font-semibold text-text-primary">
              {t('settings:modal.sidebarHeading')}
            </p>
          </div>
          <nav
            role="tablist"
            aria-label={t('settings:modal.sectionsLabel')}
            className="flex flex-1 flex-col gap-1 px-2"
          >
            {TABS.map((tabMeta) => {
              const active = tab === tabMeta.id;
              const Icon = tabMeta.icon;
              return (
                <button
                  key={tabMeta.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(tabMeta.id)}
                  className={`group relative flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] transition-colors ${
                    active
                      ? 'bg-[#ececec] font-semibold text-text-primary'
                      : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{t(tabMeta.labelKey as never)}</span>
                </button>
              );
            })}
          </nav>
          <SidebarFooter />
        </aside>

        {/* ─── Right content pane ─── */}
        <section className="flex h-full min-w-0 flex-1 flex-col bg-white">
          <header className="flex items-start justify-between gap-4 px-7 pb-2 pt-6">
            <div className="min-w-0">
              <h2 className="text-[17px] font-semibold text-text-primary">{activeTabLabel}</h2>
            </div>
            <button
              type="button"
              aria-label={t('common:actions.close')}
              onClick={() => onOpenChange(false)}
              className="-mr-1 -mt-1 rounded-md p-1.5 text-text-secondary hover:bg-surface-muted hover:text-text-primary"
            >
              <X className="size-4" />
            </button>
          </header>
          <div className={`app-scrollbar min-h-0 flex-1 overflow-y-auto pt-2 ${tab === 'data' ? 'px-0 pb-0' : 'px-7 pb-6'}`}>
            {tab === 'branding' ? <BrandingTab /> : null}
            {tab === 'modules' ? <ModulesTab /> : null}
            {tab === 'data' ? <DataTab /> : null}
            {tab === 'intelligence' ? <IntelligenceTab /> : null}
            {tab === 'language' ? <LanguageTab /> : null}
            {tab === 'roles' ? <RolesTab /> : null}
            {tab === 'demo' ? <DemoConfigurationTab /> : null}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Sidebar footer (reset) ─── */

function SidebarFooter() {
  const { t } = useTranslation(['settings', 'common']);
  const { resetAll, saveDemoConfiguration } = usePlatformSettings();
  const [confirm, setConfirm] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const canSave = name.trim().length > 0;

  const submitSave = () => {
    if (!canSave) return;
    saveDemoConfiguration({ name, description });
    setName('');
    setDescription('');
    setSaveOpen(false);
  };

  if (confirm) {
    return (
      <div className="border-t border-[#ececec] px-4 py-3">
        <p className="mb-2 text-[11px] text-text-secondary">{t('settings:sidebarFooter.confirmReset')}</p>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 flex-1 text-[11px]"
            onClick={() => setConfirm(false)}
          >
            {t('common:actions.cancel')}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-7 flex-1 text-[11px]"
            onClick={() => {
              resetAll();
              setConfirm(false);
            }}
          >
            {t('settings:sidebarFooter.confirmCta')}
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="border-t border-[#ececec] px-4 py-3">
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setSaveOpen(true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border-soft bg-white px-2 py-1.5 text-[12px] font-semibold text-text-primary transition-colors hover:border-brand-blue/40 hover:bg-brand-blue/5 hover:text-brand-blue"
        >
          <Save className="size-3.5" />
          <span>{t('settings:sidebarFooter.save')}</span>
        </button>
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-semibold text-[#cd2c23] transition-colors hover:bg-[#fde5e4]"
        >
          <RotateCcw className="size-3.5" />
          <span>{t('settings:sidebarFooter.resetAll')}</span>
        </button>
      </div>
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-[16px]">{t('settings:saveDialog.title')}</DialogTitle>
            <DialogDescription className="text-[12px]">
              {t('settings:saveDialog.description')}
              <span className="mt-2 block text-[11px] leading-snug text-text-muted">
                {t('settings:saveDialog.localOnlyNote')}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="demo-config-name" className="text-[11px] font-semibold text-text-secondary">
                {t('settings:saveDialog.nameLabel')}
              </Label>
              <Input
                id="demo-config-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('settings:saveDialog.namePlaceholder')}
                className="h-9 text-[13px]"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="demo-config-description" className="text-[11px] font-semibold text-text-secondary">
                {t('settings:saveDialog.descriptionLabel')}
              </Label>
              <textarea
                id="demo-config-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('settings:saveDialog.descriptionPlaceholder')}
                className="min-h-[88px] resize-none rounded-md border border-border-soft bg-white px-3 py-2 text-[13px] text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSaveOpen(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button size="sm" onClick={submitSave} disabled={!canSave}>
              {t('settings:saveDialog.saveCta')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Data tab ─── */

type DataSectionId = 'contexts' | 'tables' | 'records';
type BusinessStepLogic = {
  createTask: boolean;
  createRequirement: boolean;
  createRequest: boolean;
};

type EditableBusinessStep = {
  id: string;
  label: string;
  phaseId: string;
  tooltip: string;
  logic: BusinessStepLogic;
};

type BusinessOverviewField = {
  id: string;
  label: string;
  source: 'case' | 'primary_party' | 'policy' | 'application' | 'business_line';
  required: boolean;
};
const DATA_SECTION_TABS: Array<{ id: DataSectionId; label: string; description: string }> = [
  { id: 'contexts', label: 'Data sets', description: 'Saved datasets and active environment.' },
  { id: 'tables', label: 'Configuration', description: 'Active dataset tables and case types.' },
  { id: 'records', label: 'Records', description: 'Actual rows in the active dataset.' },
];

const MAIN_ENTITY_KINDS: WorkObjectKind[] = ['client', 'policy', 'case', 'agent'];
const UTILITY_ENTITY_KINDS: WorkObjectKind[] = ['task', 'document', 'request', 'requirement', 'communication', 'event', 'note'];

const CASE_KINDS_FOR_ANATOMY: CaseKind[] = ['claim', 'new_business', 'customer_service', 'agent_onboarding'];

function DataTab() {
  const { t } = useTranslation('settings');
  const { settings, updateDataSource, updateAnatomy } = usePlatformSettings();
  const [dataContexts, setDataContexts] = useState<SystemDataset[]>(() => datasetRegistry.listDatasets());
  const [createContextOpen, setCreateContextOpen] = useState(false);
  const activeDataset = useMemo(
    () => dataContexts.find((dataset) => dataset.id === settings.dataSource.activeDatasetId) ?? datasetRegistry.getDataset(settings.dataSource.activeDatasetId),
    [dataContexts, settings.dataSource.activeDatasetId],
  );
  const registryMetadata = useMemo(() => datasetRegistry.listMetadata(), [dataContexts]);
  const registryMetadataById = useMemo(
    () => new Map(registryMetadata.map((metadata) => [metadata.id, metadata])),
    [registryMetadata],
  );
  const datasetMetadata = useMemo<DatasetMetadata[]>(
    () => dataContexts.map((dataset) => getDatasetMetadata(dataset, {
      storageKind: registryMetadataById.get(dataset.id)?.storageKind ?? 'generated',
      sourceLabel: registryMetadataById.get(dataset.id)?.sourceLabel ?? 'Generated/imported',
      readonly: registryMetadataById.get(dataset.id)?.readonly,
    })),
    [dataContexts, registryMetadataById],
  );
  const refreshDataContexts = () => setDataContexts(datasetRegistry.listDatasets());
  const counts = useMemo(() => countDatasetObjects(activeDataset), [activeDataset]);
  const workflowCounts = useMemo(() => countCasesByWorkflow(activeDataset), [activeDataset]);
  const relationshipIssues = useMemo(() => findRelationshipIssues(activeDataset), [activeDataset]);
  const boundaryIssues = useMemo(() => validateModuleBoundaryRules(activeDataset), [activeDataset]);
  const qualityChecks = useMemo(() => runDatasetQualityChecks(activeDataset), [activeDataset]);
  const systemValidation = useMemo(() => validateSystemDataset(activeDataset), [activeDataset]);
  const aiActionRows = useMemo(() => listAiActions(activeDataset), [activeDataset]);
  const objectSurfaceReadiness = useMemo(() => [
    { id: 'cases', label: 'Cases', status: 'dataset-backed', detail: 'Cases, relationship tab, tasks, documents, requests, and history read the active dataset first.' },
    { id: 'work', label: 'Work modules', status: 'dataset-backed', detail: 'Tasks, Documents, and Requests use repository lists with legacy overlay as an explicit option.' },
    { id: 'entities', label: 'Policy / Client / Agent', status: 'hybrid', detail: 'Entity views can derive from dataset records, with fixture views still available as seed fallback.' },
    { id: 'folders', label: 'Folders navigation', status: 'hybrid', detail: 'Folder rows now include dataset entities but still merge existing fixture folders.' },
    { id: 'assistant', label: 'Assistant responses', status: 'dataset-backed', detail: 'Copilot first checks SystemDataset assistantResponses, then falls back to registered demo handlers.' },
    { id: 'ai-actions', label: 'AI Actions', status: 'dataset-backed', detail: 'AI Actions derives explicit AI records plus task, document, request, evidence, event, and assistant activity.' },
  ], []);
  const enabledDomains = settings.dataSource.enabledObjectDomains;
  const enabledWorkflows = settings.dataSource.enabledWorkflows;
  const [activeDataSection, setActiveDataSection] = useState<DataSectionId>('contexts');
  const [selectedEntityKind, setSelectedEntityKind] = useState<CatalogObjectKind>('case');
  const [selectedRecordKind, setSelectedRecordKind] = useState<CatalogObjectKind>('case');
  const [caseTypeConfigOpen, setCaseTypeConfigOpen] = useState(false);
  const [selectedBusinessLine, setSelectedBusinessLine] = useState<CaseKind>('claim');
  const [draftEnabledDomains, setDraftEnabledDomains] = useState<WorkObjectKind[]>(() => settings.dataSource.enabledObjectDomains);
  const [draftEnabledWorkflows, setDraftEnabledWorkflows] = useState<CaseKind[]>(() => settings.dataSource.enabledWorkflows);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(WORKFLOW_DEFINITIONS[0]?.steps[0]?.id ?? null);
  const [businessLineSteps, setBusinessLineSteps] = useState<Record<CaseKind, EditableBusinessStep[]>>(() =>
    CASE_KINDS_FOR_ANATOMY.reduce((acc, caseKind) => {
      const workflow = getPrimaryWorkflowDefinition(caseKind);
      const persisted = settings.anatomy.caseTypeAnatomyOverrides[caseKind]?.steps;
      acc[caseKind] = (persisted ?? workflow.steps).map((step, index) => ({
        id: step.id,
        label: step.label,
        phaseId: step.phaseId,
        tooltip: step.tooltip,
        logic: {
          createTask: step.logic?.createTask ?? index === 0,
          createRequirement: step.logic?.createRequirement ?? index === 1,
          createRequest: step.logic?.createRequest ?? false,
        },
      }));
      return acc;
    }, {} as Record<CaseKind, EditableBusinessStep[]>),
  );
  const [overviewFields, setOverviewFields] = useState<Record<CaseKind, BusinessOverviewField[]>>(() =>
    CASE_KINDS_FOR_ANATOMY.reduce((acc, caseKind) => {
      const workflow = getPrimaryWorkflowDefinition(caseKind);
      acc[caseKind] = settings.anatomy.caseTypeAnatomyOverrides[caseKind]?.overviewFields ?? [
        { id: `${caseKind}-case-id`, label: 'Case ID', source: 'case', required: true },
        { id: `${caseKind}-status`, label: 'Status', source: 'case', required: true },
        { id: `${caseKind}-primary-party`, label: workflow.primaryPartyLabel, source: 'primary_party', required: true },
        { id: `${caseKind}-business-line`, label: 'Business line', source: 'business_line', required: false },
      ];
      return acc;
    }, {} as Record<CaseKind, BusinessOverviewField[]>),
  );
  const [caseIdentificationEdits, setCaseIdentificationEdits] = useState<Partial<Record<CaseKind, string[]>>>({});
  const [caseContentTabEdits, setCaseContentTabEdits] = useState<Partial<Record<CaseKind, Record<string, boolean>>>>({});

  useEffect(() => {
    setDraftEnabledDomains(settings.dataSource.enabledObjectDomains);
    setDraftEnabledWorkflows(settings.dataSource.enabledWorkflows);
  }, [settings.dataSource.enabledObjectDomains, settings.dataSource.enabledWorkflows]);

  const draftAnatomyOverrides = useMemo(
    () =>
      CASE_KINDS_FOR_ANATOMY.reduce((acc, caseKind) => {
        acc[caseKind] = {
          ...(settings.anatomy.caseTypeAnatomyOverrides[caseKind] ?? {}),
          steps: businessLineSteps[caseKind] ?? [],
          overviewFields: overviewFields[caseKind] ?? [],
          identificationFields:
            caseIdentificationEdits[caseKind] ??
            settings.anatomy.caseTypeAnatomyOverrides[caseKind]?.identificationFields ??
            mergeCaseShellWithCaseType(caseKind)?.identificationFields ??
            mergeCaseShellWithCaseType(caseKind)?.headerFields ??
            [],
          tabs: buildContentTabOverridesForKind(caseKind, settings.anatomy, caseContentTabEdits),
        };
        return acc;
      }, {} as typeof settings.anatomy.caseTypeAnatomyOverrides),
    [
      businessLineSteps,
      overviewFields,
      settings.anatomy,
      settings.anatomy.caseTypeAnatomyOverrides,
      caseIdentificationEdits,
      caseContentTabEdits,
    ],
  );

  const configurationDirty =
    JSON.stringify(draftEnabledDomains) !== JSON.stringify(settings.dataSource.enabledObjectDomains) ||
    JSON.stringify(draftEnabledWorkflows) !== JSON.stringify(settings.dataSource.enabledWorkflows) ||
    JSON.stringify(draftAnatomyOverrides) !== JSON.stringify(settings.anatomy.caseTypeAnatomyOverrides);

  const toggleDomain = (kind: WorkObjectKind, enabled: boolean) => {
    const next = enabled
      ? Array.from(new Set([...draftEnabledDomains, kind]))
      : draftEnabledDomains.filter((item) => item !== kind);
    setDraftEnabledDomains(next);
  };

  const toggleWorkflow = (kind: CaseKind, enabled: boolean) => {
    const next = enabled
      ? Array.from(new Set([...draftEnabledWorkflows, kind]))
      : draftEnabledWorkflows.filter((item) => item !== kind);
    setDraftEnabledWorkflows(next);
  };

  const saveConfiguration = () => {
    updateDataSource({ enabledObjectDomains: draftEnabledDomains, enabledWorkflows: draftEnabledWorkflows });
    updateAnatomy({ caseTypeAnatomyOverrides: draftAnatomyOverrides });
  };

  const discardConfiguration = () => {
    setDraftEnabledDomains(settings.dataSource.enabledObjectDomains);
    setDraftEnabledWorkflows(settings.dataSource.enabledWorkflows);
    setBusinessLineSteps(CASE_KINDS_FOR_ANATOMY.reduce((acc, caseKind) => {
      const workflow = getPrimaryWorkflowDefinition(caseKind);
      const persisted = settings.anatomy.caseTypeAnatomyOverrides[caseKind]?.steps;
      acc[caseKind] = (persisted ?? workflow.steps).map((step, index) => ({
        id: step.id,
        label: step.label,
        phaseId: step.phaseId,
        tooltip: step.tooltip,
        logic: {
          createTask: step.logic?.createTask ?? index === 0,
          createRequirement: step.logic?.createRequirement ?? index === 1,
          createRequest: step.logic?.createRequest ?? false,
        },
      }));
      return acc;
    }, {} as Record<CaseKind, EditableBusinessStep[]>));
    setOverviewFields(CASE_KINDS_FOR_ANATOMY.reduce((acc, caseKind) => {
      const workflow = getPrimaryWorkflowDefinition(caseKind);
      acc[caseKind] = settings.anatomy.caseTypeAnatomyOverrides[caseKind]?.overviewFields ?? [
        { id: `${caseKind}-case-id`, label: 'Case ID', source: 'case', required: true },
        { id: `${caseKind}-status`, label: 'Status', source: 'case', required: true },
        { id: `${caseKind}-primary-party`, label: workflow.primaryPartyLabel, source: 'primary_party', required: true },
        { id: `${caseKind}-business-line`, label: 'Business line', source: 'business_line', required: false },
      ];
      return acc;
    }, {} as Record<CaseKind, BusinessOverviewField[]>));
    setCaseIdentificationEdits({});
    setCaseContentTabEdits({});
  };

  const exportDataset = (datasetId: string) => {
    const payload = datasetRegistry.exportDataset(datasetId);
    if (!payload) return;
    const dataset = datasetRegistry.getDataset(datasetId);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataset.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteDataset = (datasetId: string) => {
    datasetRegistry.deleteDataset(datasetId);
    if (settings.dataSource.activeDatasetId === datasetId) {
      updateDataSource({ activeDatasetId: 'multi-case-demo' });
    }
    refreshDataContexts();
  };

  const duplicateDataset = (datasetId: string) => {
    datasetRegistry.duplicateDataset(datasetId);
    refreshDataContexts();
  };

  const updateBusinessLineSteps = (kind: CaseKind, updater: (steps: EditableBusinessStep[]) => EditableBusinessStep[]) => {
    setBusinessLineSteps((prev) => ({
      ...prev,
      [kind]: updater(prev[kind] ?? []),
    }));
  };

  const updateOverviewFields = (kind: CaseKind, updater: (fields: BusinessOverviewField[]) => BusinessOverviewField[]) => {
    setOverviewFields((prev) => ({
      ...prev,
      [kind]: updater(prev[kind] ?? []),
    }));
  };

  const selectedWorkflow = getPrimaryWorkflowDefinition(selectedBusinessLine);
  const dataTabs = useMemo<ModuleTabItem<DataSectionId>[]>(
    () => DATA_SECTION_TABS.map((section) => ({ id: section.id, label: section.label, title: section.description })),
    [],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-7">
        <p className="text-[12px] leading-relaxed text-text-secondary">
          {t('data.intro')}
        </p>
        <div className="-mx-7">
        <ModuleTabsBar
          tabs={dataTabs.map((tab) => tab.id === 'tables' ? { ...tab, suffix: <span className="ml-1 rounded-full bg-brand-blue px-2 py-0.5 text-[10px] font-semibold text-white">Active dataset</span> } : tab)}
          activeId={activeDataSection}
          onChange={setActiveDataSection}
          className="mt-3 bg-white"
        />
        </div>
      </div>

      <div className={`min-h-0 min-w-0 ${activeDataSection === 'tables' || activeDataSection === 'contexts' || activeDataSection === 'records' ? 'flex-1 overflow-hidden pt-0' : 'overflow-y-auto overflow-x-hidden px-7 pt-4'}`}>
      {activeDataSection === 'contexts' ? (
      <>
        <DataOverviewPanel
          activeDataset={activeDataset}
          dataContexts={dataContexts}
          datasetMetadata={datasetMetadata}
          onOpenCreateContext={() => setCreateContextOpen(true)}
          onActivateDataset={(datasetId) => updateDataSource({ activeDatasetId: datasetId })}
          onDuplicateDataset={duplicateDataset}
          onDeleteDataset={deleteDataset}
          onExportDataset={exportDataset}
          onDisplayCurrencyChange={(datasetId, displayCurrency) => {
            datasetRegistry.updateDisplayCurrency(datasetId, displayCurrency);
            refreshDataContexts();
          }}
        />
        <CreateDataContextModal
          open={createContextOpen}
          onOpenChange={setCreateContextOpen}
          activeDataset={activeDataset}
          onSaved={(datasetId) => {
            refreshDataContexts();
            updateDataSource({ activeDatasetId: datasetId });
          }}
        />
      </>
      ) : null}

      {activeDataSection === 'tables' ? (
      <section className="h-full min-h-0">
        {caseTypeConfigOpen ? (
          <div className="app-scrollbar h-full min-h-0 overflow-auto">
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setCaseTypeConfigOpen(false)}
                className="mb-3 inline-flex items-center gap-1.5 rounded-md px-0 text-[12px] font-semibold text-brand-blue hover:text-brand-blue-hover"
              >
                <span aria-hidden="true">←</span>
                Back
              </button>
            </div>
            <BusinessLineConfigurator
              selectedBusinessLine={selectedBusinessLine}
              enabledWorkflows={enabledWorkflows}
              toggleWorkflow={toggleWorkflow}
              workflowCounts={workflowCounts}
              businessLineSteps={businessLineSteps}
              overviewFields={overviewFields}
              selectedStepId={selectedStepId}
              onSelectStep={setSelectedStepId}
              updateBusinessLineSteps={updateBusinessLineSteps}
              updateOverviewFields={updateOverviewFields}
            />
          </div>
        ) : (
        <DataTableBrowser
          activeDataset={activeDataset}
          activeDatasetMetadata={registryMetadataById.get(activeDataset.id)}
          configurationDirty={configurationDirty}
          onSaveConfiguration={saveConfiguration}
          onDiscardConfiguration={discardConfiguration}
          counts={counts}
          selectedEntityKind={selectedEntityKind}
          onSelectEntity={setSelectedEntityKind}
          enabledDomains={draftEnabledDomains}
          toggleDomain={toggleDomain}
          enabledWorkflows={draftEnabledWorkflows}
          toggleWorkflow={toggleWorkflow}
          selectedBusinessLine={selectedBusinessLine}
          onSelectBusinessLine={setSelectedBusinessLine}
          platformAnatomy={settings.anatomy}
          caseIdentificationEdits={caseIdentificationEdits}
          caseContentTabEdits={caseContentTabEdits}
          onCaseIdentificationChange={(kind, fields) => {
            setCaseIdentificationEdits((prev) => ({ ...prev, [kind]: fields }));
          }}
          onCaseContentTabChange={(kind, tabId, enabled) => {
            setCaseContentTabEdits((prev) => ({
              ...prev,
              [kind]: { ...prev[kind], [tabId]: enabled },
            }));
          }}
          onConfigureCaseType={(kind) => {
            setSelectedBusinessLine(kind);
            setSelectedStepId((businessLineSteps[kind] ?? [])[0]?.id ?? null);
            setCaseTypeConfigOpen(true);
          }}
          workflowCounts={workflowCounts}
          relationshipIssues={relationshipIssues}
        />
        )}
      </section>
      ) : null}

      {activeDataSection === 'records' ? (
        <DataRecordsBrowser
          activeDataset={activeDataset}
          selectedRecordKind={selectedRecordKind}
          onSelectRecordKind={setSelectedRecordKind}
          relationshipIssues={relationshipIssues}
        />
      ) : null}

      </div>

    </div>
  );
}

type DataOverviewPanelProps = {
  activeDataset: SystemDataset;
  dataContexts: SystemDataset[];
  datasetMetadata: DatasetMetadata[];
  onOpenCreateContext: () => void;
  onActivateDataset: (datasetId: string) => void;
  onDuplicateDataset: (datasetId: string) => void;
  onDeleteDataset: (datasetId: string) => void;
  onExportDataset: (datasetId: string) => void;
  onDisplayCurrencyChange: (datasetId: string, displayCurrency: 'GBP' | 'USD') => void;
};

function DataOverviewPanel({
  activeDataset,
  dataContexts,
  datasetMetadata,
  onOpenCreateContext,
  onActivateDataset,
  onDuplicateDataset,
  onDeleteDataset,
  onExportDataset,
  onDisplayCurrencyChange,
}: DataOverviewPanelProps) {
  const metadataById = useMemo(() => new Map(datasetMetadata.map((item) => [item.id, item])), [datasetMetadata]);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <SavedDataContextsList
          activeDataset={activeDataset}
          dataContexts={dataContexts}
          metadataById={metadataById}
          onActivateDataset={onActivateDataset}
          onDuplicateDataset={onDuplicateDataset}
          onDeleteDataset={onDeleteDataset}
          onExportDataset={onExportDataset}
          onDisplayCurrencyChange={onDisplayCurrencyChange}
        />
      </div>
      <div className="sticky bottom-0 z-10 border-t border-border-soft bg-white/95 px-7 py-3 backdrop-blur">
        <div className="grid gap-3 bg-white sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">Data contexts</p>
            <h3 className="mt-1 text-[14px] font-semibold leading-snug text-text-primary sm:text-[15px]">Manage workspace datasets</h3>
          </div>
          <button
            type="button"
            onClick={onOpenCreateContext}
            className="inline-flex h-8 w-full items-center justify-center rounded-full bg-brand-blue px-3 text-[11px] font-semibold text-white hover:bg-brand-blue-hover sm:w-auto"
          >
            Create & Import datasets
          </button>
        </div>
      </div>
    </section>
  );
}

function ActiveDataContextCard({
  activeDataset,
  metadata,
  counts,
  enabledDomains,
  enabledWorkflows,
  relationshipIssues,
  boundaryIssues,
  systemValidation,
  legacyMockOverlayEnabled,
  onToggleLegacyMockOverlay,
  onOpenCreateContext,
}: {
  activeDataset: SystemDataset;
  metadata?: DatasetMetadata;
  counts: ReturnType<typeof countDatasetObjects>;
  enabledDomains: WorkObjectKind[];
  enabledWorkflows: CaseKind[];
  relationshipIssues: ReturnType<typeof findRelationshipIssues>;
  boundaryIssues: ReturnType<typeof validateModuleBoundaryRules>;
  systemValidation: ReturnType<typeof validateSystemDataset>;
  legacyMockOverlayEnabled: boolean;
  onToggleLegacyMockOverlay: (checked: boolean) => void;
  onOpenCreateContext: () => void;
}) {
  const issueCount = relationshipIssues.length + boundaryIssues.length + systemValidation.errors.length;
  const warningCount = systemValidation.warnings.length;
  const healthLabel = issueCount ? 'Needs attention' : warningCount ? 'Warnings' : 'Ready';
  const businessLines = activeDataset.enabledBusinessLines?.length ? activeDataset.enabledBusinessLines : enabledWorkflows;

  return (
    <article className="overflow-hidden rounded-2xl border border-brand-blue/20 bg-white shadow-sm">
      <div className="border-b border-border-soft bg-gradient-to-br from-brand-blue/10 via-white to-surface-primary px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-blue px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">Active context</span>
              {metadata ? <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-text-secondary">{metadata.sourceLabel}</span> : null}
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                issueCount ? 'bg-[#fde5e4] text-[#cd2c23]' : warningCount ? 'bg-[#fff4dc] text-[#a36d00]' : 'bg-[#e7f4ec] text-[#008533]'
              }`}>
                {healthLabel}
              </span>
            </div>
            <h3 className="mt-3 text-[20px] font-semibold text-text-primary">{activeDataset.label}</h3>
            <p className="mt-1 max-w-[720px] text-[12px] leading-relaxed text-text-secondary">
              {activeDataset.environmentFit ?? activeDataset.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {businessLines.map((line) => (
                <span key={line} className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold capitalize text-text-secondary">
                  {line.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenCreateContext}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3px] text-white hover:bg-brand-blue-hover"
          >
            <Plus className="size-3.5" />
            Create data context
          </button>
        </div>
      </div>
      <div className="grid gap-0 divide-y divide-border-soft p-4 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        <DataMetric label="Total records" value={String(counts.total)} />
        <DataMetric label="Cases" value={String(activeDataset.cases.length)} />
        <DataMetric label="Entity domains" value={`${enabledDomains.length}/${OBJECT_DOMAIN_DEFINITIONS.length}`} />
        <DataMetric label="Document mode" value={activeDataset.documentMode?.replace('_', ' ') ?? 'metadata only'} />
      </div>
      <div className="border-t border-border-soft px-4 py-3">
        <div className="flex flex-col gap-3 rounded-xl bg-surface-primary px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold text-text-primary">Legacy claim mock overlay</p>
            <p className="mt-0.5 text-[11px] leading-snug text-text-secondary">
              Transitional fallback content can still be mixed in while the canonical data context replaces older fixtures.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${legacyMockOverlayEnabled ? 'bg-brand-blue/10 text-brand-blue' : 'bg-white text-text-muted'}`}>
              {legacyMockOverlayEnabled ? 'Included' : 'Dataset only'}
            </span>
            <Switch
              checked={legacyMockOverlayEnabled}
              onCheckedChange={onToggleLegacyMockOverlay}
              aria-label="Toggle legacy claim mock overlay"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function SavedDataContextsList({
  activeDataset,
  dataContexts,
  metadataById,
  onActivateDataset,
  onDuplicateDataset,
  onDeleteDataset,
  onExportDataset,
  onDisplayCurrencyChange,
}: {
  activeDataset: SystemDataset;
  dataContexts: SystemDataset[];
  metadataById: Map<string, DatasetMetadata>;
  onActivateDataset: (datasetId: string) => void;
  onDuplicateDataset: (datasetId: string) => void;
  onDeleteDataset: (datasetId: string) => void;
  onExportDataset: (datasetId: string) => void;
  onDisplayCurrencyChange: (datasetId: string, displayCurrency: 'GBP' | 'USD') => void;
}) {
  const { t } = useTranslation('settings');
  const [expandedContextIds, setExpandedContextIds] = useState<Record<string, boolean>>(() => ({
    [activeDataset.id]: true,
  }));

  useEffect(() => {
    setExpandedContextIds((prev) => ({ ...prev, [activeDataset.id]: true }));
  }, [activeDataset.id]);

  const activateContext = (datasetId: string) => {
    setExpandedContextIds((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        if (id !== datasetId) next[id] = false;
      });
      next[datasetId] = true;
      return next;
    });
    onActivateDataset(datasetId);
  };

  return (
    <section className="rounded-2xl border border-border-soft bg-white p-3 sm:p-4">
      <div className="min-w-0">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">Saved data contexts</p>
          <h3 className="mt-1 text-[15px] font-semibold text-text-primary">Choose the dataset powering the workspace</h3>
          <p className="mt-1 text-[11px] leading-snug text-text-secondary">
            Built-in contexts are read-only seeds. Generated or imported contexts can be duplicated, exported, and removed.
          </p>
        </div>
      </div>
      <div className="mt-3 grid gap-2">
        {dataContexts.length ? dataContexts.map((dataset) => {
          const datasetCounts = countDatasetObjects(dataset);
          const metadata = metadataById.get(dataset.id);
          const active = dataset.id === activeDataset.id;
          const expanded = expandedContextIds[dataset.id] ?? active;
          return (
            <article key={dataset.id} className={`min-w-0 overflow-hidden rounded-xl border bg-white transition-colors ${active ? 'border-brand-blue shadow-[0_0_0_2px_rgba(0,98,150,0.10)]' : 'border-border-soft'}`}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpandedContextIds((prev) => ({ ...prev, [dataset.id]: !(prev[dataset.id] ?? active) }))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setExpandedContextIds((prev) => ({ ...prev, [dataset.id]: !(prev[dataset.id] ?? active) }));
                  }
                }}
                className="grid min-w-0 gap-3 p-3 outline-none transition-colors hover:bg-surface-primary/60 sm:p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,max-content)] lg:items-start"
                aria-label={`${expanded ? 'Collapse' : 'Expand'} ${dataset.label}`}
              >
                <div className="flex min-w-0 gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-text-muted">
                    <ChevronDown className={`size-4 transition-transform ${expanded ? '' : '-rotate-90'}`} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <h4 className="min-w-0 truncate text-[13px] font-semibold text-text-primary">{dataset.label}</h4>
                      {active ? <span className="shrink-0 rounded-full bg-brand-blue px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Active</span> : null}
                    </div>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                      {dataset.organizationLabel ?? 'Data context'}{metadata ? ` · ${metadata.sourceLabel}` : ''}
                    </p>
                    <p className="mt-1.5 max-w-[720px] text-[11px] leading-snug text-text-secondary">
                      {dataset.environmentFit ?? dataset.description}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 flex-wrap items-center justify-start gap-1.5 lg:justify-end">
                  <button
                    type="button"
                    disabled={active}
                    onClick={(event) => {
                      event.stopPropagation();
                      activateContext(dataset.id);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${active ? 'bg-brand-green' : 'bg-[#d7dce2]'} disabled:cursor-default`}
                    aria-label={active ? `${dataset.label} is active` : `Activate ${dataset.label}`}
                    title={active ? 'Active' : 'Activate'}
                  >
                    <span className={`inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onExportDataset(dataset.id);
                    }}
                    className="inline-flex size-8 items-center justify-center rounded-full border border-border-soft bg-white text-text-secondary transition-colors hover:border-brand-blue/40 hover:text-brand-blue"
                    aria-label={`Export ${dataset.label}`}
                    title="Export"
                  >
                    <Upload className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDuplicateDataset(dataset.id);
                    }}
                    className="inline-flex size-8 items-center justify-center rounded-full border border-border-soft bg-white text-text-secondary transition-colors hover:border-brand-blue/40 hover:text-brand-blue"
                    aria-label={`Duplicate ${dataset.label}`}
                    title="Duplicate"
                  >
                    <Copy className="size-3.5" />
                  </button>
                  {!metadata?.readonly ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteDataset(dataset.id);
                      }}
                      className="inline-flex size-8 items-center justify-center rounded-full border border-[#f3c5c2] bg-white text-[#cd2c23] transition-colors hover:bg-[#fde5e4]"
                      aria-label={`Delete ${dataset.label}`}
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>

              {expanded ? (
                <>
                  <div className="mx-3 mb-3 grid overflow-hidden rounded-lg border border-border-soft bg-surface-primary/60 sm:grid-cols-5">
                    {[
                      ['Records', String(datasetCounts.total)],
                      ['Entities', String(dataset.objectDomains?.length ?? 0)],
                      ['Cases / types', `${dataset.cases.length} / ${dataset.enabledBusinessLines?.length ?? 0}`],
                      ['Documents', String(dataset.documents.length)],
                      ['Tasks', String(dataset.tasks.length)],
                    ].map(([label, value]) => (
                      <div key={label} className="border-b border-border-soft px-3 py-2 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
                        <p className="mt-0.5 truncate text-[12px] font-semibold text-text-primary">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border-soft px-3 py-3">
                    <p className="text-[11px] font-semibold text-text-muted">Active business lines</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                      {(dataset.enabledBusinessLines ?? []).map((line) => (
                        <div key={line} className="rounded-lg border border-border-soft bg-white px-3 py-2">
                          <p className="truncate text-[11px] font-semibold capitalize text-text-primary">{line.replace('_', ' ')}</p>
                          <p className="mt-0.5 text-[10px] text-text-muted">Enabled</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="flex flex-col gap-2 border-t border-border-soft px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <div>
                      <p className="text-[11px] font-semibold text-text-muted">{t('data.currency.label')}</p>
                      <p className="mt-0.5 text-[10px] text-text-secondary">{t('data.currency.hint')}</p>
                    </div>
                    <SegmentedControl
                      size="compact"
                      value={dataset.displayCurrency ?? 'GBP'}
                      onChange={(value) => onDisplayCurrencyChange(dataset.id, value)}
                      options={[
                        { key: 'GBP', label: t('data.currency.gbp') },
                        { key: 'USD', label: t('data.currency.usd') },
                      ]}
                    />
                  </div>
                </>
              ) : null}
            </article>
          );
        }) : (
          <div className="rounded-xl border border-dashed border-border-soft bg-surface-primary p-6 text-center">
            <p className="text-[13px] font-semibold text-text-primary">No matching data contexts</p>
            <p className="mt-1 text-[11px] text-text-secondary">Clear the search or create a new context from the current entity schema.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function DatasetHealthSummary({
  activeDataset,
  qualityChecks,
  systemValidation,
  relationshipIssues,
  boundaryIssues,
  aiActionRows,
  objectSurfaceReadiness,
  legacyMockOverlayEnabled,
}: {
  activeDataset: SystemDataset;
  qualityChecks: ReturnType<typeof runDatasetQualityChecks>;
  systemValidation: ReturnType<typeof validateSystemDataset>;
  relationshipIssues: ReturnType<typeof findRelationshipIssues>;
  boundaryIssues: ReturnType<typeof validateModuleBoundaryRules>;
  aiActionRows: ReturnType<typeof listAiActions>;
  objectSurfaceReadiness: Array<{ id: string; label: string; status: string; detail: string }>;
  legacyMockOverlayEnabled: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const errors = systemValidation.errors.length + relationshipIssues.length + boundaryIssues.length;
  const warnings = systemValidation.warnings.length + qualityChecks.filter((check) => check.status === 'warn').length;
  const ready = errors === 0;

  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-border-soft bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">Health and readiness</p>
            <h3 className="mt-1 text-[15px] font-semibold text-text-primary">{ready ? 'Ready for workspace use' : 'Needs data review'}</h3>
            <p className="mt-1 text-[11px] leading-snug text-text-secondary">
              Summary of schema validity, relationship integrity, AI action coverage, and persistence readiness.
            </p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${ready ? 'bg-[#e7f4ec] text-[#008533]' : 'bg-[#fde5e4] text-[#cd2c23]'}`}>
            {ready ? 'Ready' : `${errors} issues`}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <DataMetric label="Errors" value={String(errors)} />
          <DataMetric label="Warnings" value={String(warnings)} />
          <DataMetric label="AI actions" value={String(aiActionRows.length)} />
          <DataMetric label="Storage" value={`v${generatedDatasetRepository.storageVersion}`} />
        </div>
        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          className="mt-4 inline-flex items-center gap-1 rounded-full border border-border-soft px-3 py-1.5 text-[11px] font-semibold text-text-secondary hover:border-brand-blue/40 hover:text-brand-blue"
        >
          {showDetails ? 'Hide health details' : 'Show health details'}
          <ChevronDown className={`size-3.5 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
        </button>
        {showDetails ? (
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Quality checks</p>
              <div className="mt-2 grid gap-2">
                {qualityChecks.map((check) => (
                  <div key={check.id} className="rounded-lg bg-surface-primary px-3 py-2">
                    <p className={`text-[10px] font-semibold uppercase tracking-wide ${
                      check.status === 'pass' ? 'text-[#008533]' : check.status === 'fail' ? 'text-[#cd2c23]' : 'text-[#a36d00]'
                    }`}>
                      {check.status}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-text-primary">{check.label}</p>
                    <p className="mt-0.5 text-[10px] text-text-muted">{check.message}</p>
                  </div>
                ))}
              </div>
            </div>
            {[...systemValidation.errors, ...systemValidation.warnings].length ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Validation messages</p>
                <div className="mt-2 space-y-1.5">
                  {[...systemValidation.errors, ...systemValidation.warnings].slice(0, 8).map((item) => (
                    <p key={item} className="rounded-lg bg-surface-primary px-3 py-2 text-[10px] text-text-secondary">{item}</p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border-soft bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">What this context powers</p>
        <div className="mt-3 space-y-2">
          {objectSurfaceReadiness.map((item) => (
            <div key={item.id} className="rounded-lg bg-surface-primary px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-text-primary">{item.label}</p>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                  item.status === 'dataset-backed' ? 'bg-[#e7f4ec] text-[#008533]' : item.status === 'hybrid' ? 'bg-[#fff4dc] text-[#a36d00]' : 'bg-white text-text-muted'
                }`}>
                  {item.status}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-text-muted">{item.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <DataMetric label="Explicit AI" value={String(activeDataset.aiActions.length)} />
          <DataMetric label="Derived AI" value={String(Math.max(0, aiActionRows.length - activeDataset.aiActions.length))} />
          <DataMetric label="Demo env" value={`v${demoEnvironmentRepository.storageVersion}`} />
          <DataMetric label="Overlay" value={legacyMockOverlayEnabled ? 'On' : 'Off'} />
        </div>
      </section>
    </aside>
  );
}

function DataMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-primary px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 truncate text-[12px] font-semibold capitalize text-text-primary">{value}</p>
    </div>
  );
}

function DataTableBrowser({
  activeDataset,
  activeDatasetMetadata,
  configurationDirty,
  onSaveConfiguration,
  onDiscardConfiguration,
  counts,
  selectedEntityKind,
  onSelectEntity,
  enabledDomains,
  toggleDomain,
  enabledWorkflows,
  toggleWorkflow,
  selectedBusinessLine,
  onSelectBusinessLine,
  platformAnatomy,
  caseIdentificationEdits,
  caseContentTabEdits,
  onCaseIdentificationChange,
  onCaseContentTabChange,
  onConfigureCaseType,
  workflowCounts,
  relationshipIssues,
}: {
  activeDataset: SystemDataset;
  activeDatasetMetadata?: DatasetMetadata;
  configurationDirty: boolean;
  onSaveConfiguration: () => void;
  onDiscardConfiguration: () => void;
  counts: ReturnType<typeof countDatasetObjects>;
  selectedEntityKind: CatalogObjectKind;
  onSelectEntity: (kind: CatalogObjectKind) => void;
  enabledDomains: WorkObjectKind[];
  toggleDomain: (kind: WorkObjectKind, enabled: boolean) => void;
  enabledWorkflows: CaseKind[];
  toggleWorkflow: (kind: CaseKind, enabled: boolean) => void;
  selectedBusinessLine: CaseKind;
  onSelectBusinessLine: (kind: CaseKind) => void;
  platformAnatomy: AnatomySettings;
  caseIdentificationEdits: Partial<Record<CaseKind, string[]>>;
  caseContentTabEdits: Partial<Record<CaseKind, Record<string, boolean>>>;
  onCaseIdentificationChange: (kind: CaseKind, fields: string[]) => void;
  onCaseContentTabChange: (kind: CaseKind, tabId: string, enabled: boolean) => void;
  onConfigureCaseType: (kind: CaseKind) => void;
  workflowCounts: Record<CaseKind, number>;
  relationshipIssues: RelationshipIssue[];
}) {
  const graph = useMemo(() => buildSchemaGraph({ dataset: activeDataset, relationshipIssues }), [activeDataset, relationshipIssues]);
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null);
  const [claimWorkflowPreviewId, setClaimWorkflowPreviewId] = useState<'claim-income-protection' | 'claim-death-benefit'>('claim-income-protection');
  const previewAnatomy = useMemo(
    (): AnatomySettings => ({
      ...platformAnatomy,
      caseTypeAnatomyOverrides: {
        ...platformAnatomy.caseTypeAnatomyOverrides,
        [selectedBusinessLine]: {
          ...platformAnatomy.caseTypeAnatomyOverrides[selectedBusinessLine],
          identificationFields:
            caseIdentificationEdits[selectedBusinessLine] ??
            platformAnatomy.caseTypeAnatomyOverrides[selectedBusinessLine]?.identificationFields ??
            mergeCaseShellWithCaseType(selectedBusinessLine)?.identificationFields ??
            mergeCaseShellWithCaseType(selectedBusinessLine)?.headerFields ??
            [],
          tabs: buildContentTabOverridesForKind(selectedBusinessLine, platformAnatomy, caseContentTabEdits),
        },
      },
    }),
    [platformAnatomy, selectedBusinessLine, caseIdentificationEdits, caseContentTabEdits],
  );
  const caseAnatomyPreview = useMemo(
    () => resolveCaseAnatomyForSettings(selectedBusinessLine, previewAnatomy, enabledDomains),
    [selectedBusinessLine, previewAnatomy, enabledDomains],
  );
  const claimPreviewSubType =
    selectedBusinessLine === 'claim'
      ? claimWorkflowPreviewId === 'claim-death-benefit'
        ? ('death' as const)
        : ('disability_benefit' as const)
      : undefined;
  const caseTypeResolved = useMemo(
    () =>
      resolveCaseTypeForSettings(selectedBusinessLine, previewAnatomy, enabledDomains, {
        claimSubType: claimPreviewSubType,
      }),
    [selectedBusinessLine, previewAnatomy, enabledDomains, claimPreviewSubType],
  );
  const mergedShell = useMemo(() => mergeCaseShellWithCaseType(selectedBusinessLine), [selectedBusinessLine]);
  const linkedContextSection = mergedShell?.overviewSections.find((section) => section.id === 'linked-main-entities');
  const utilityTabs = caseAnatomyPreview?.tabsResolved.filter((tab) => tab.isUtility) ?? [];
  const workspaceTabs = caseAnatomyPreview?.tabsResolved.filter((tab) => !tab.isUtility) ?? [];
  const businessLineDefinitions = useMemo(
    () =>
      WORKFLOW_DEFINITIONS.filter((workflow, index, rows) =>
        rows.findIndex((candidate) => candidate.caseKind === workflow.caseKind) === index,
      ),
    [],
  );

  useEffect(() => {
    if (enabledWorkflows.includes(selectedBusinessLine)) return;
    const next = WORKFLOW_DEFINITIONS.find((workflow) => enabledWorkflows.includes(workflow.caseKind))?.caseKind;
    if (next) onSelectBusinessLine(next);
  }, [enabledWorkflows, selectedBusinessLine, onSelectBusinessLine]);

  useEffect(() => {
    if (selectedBusinessLine !== 'claim') setClaimWorkflowPreviewId('claim-income-protection');
  }, [selectedBusinessLine]);

  const selectedNode = graph.nodes.find((node) => node.id === selectedEntityKind) ?? graph.nodes.find((node) => node.id === 'case') ?? graph.nodes[0];
  const selectedDomain = OBJECT_DOMAIN_DEFINITIONS.find((domain) => domain.kind === selectedNode.id);
  const selectedRelationships = graph.edges.filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id);
  const selectedRelationship = selectedRelationshipId ? graph.edges.find((edge) => edge.id === selectedRelationshipId) : null;
  const isDomainKind = (kind: CatalogObjectKind): kind is WorkObjectKind =>
    OBJECT_DOMAIN_DEFINITIONS.some((domain) => domain.kind === kind);
  const labelForNode = (node: SchemaGraphNode) =>
    OBJECT_DOMAIN_DEFINITIONS.find((domain) => domain.kind === node.id)?.label ?? node.schema.tableName;
  const descriptionForNode = (node: SchemaGraphNode) =>
    OBJECT_DOMAIN_DEFINITIONS.find((domain) => domain.kind === node.id)?.description ??
    `${node.schema.tableName} is a schema-backed ${node.group} object in the active dataset model.`;
  const selectedRequiredFields = selectedNode.schema.fields.filter((field) => field.required);
  const selectedReferenceFields = selectedNode.schema.fields.filter((field) => field.ref);
  const selectedIssues = relationshipIssues.filter((issue) => issue.sourceKind === selectedNode.id || issue.targetKind === selectedNode.id);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="shrink-0 border-b border-border-soft px-4 py-3">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-[14px] font-semibold text-text-primary">{activeDataset.label}</h3>
              <span className="rounded-full bg-brand-blue px-2 py-0.5 text-[10px] font-semibold text-white">Active dataset</span>
              {activeDatasetMetadata ? <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[10px] font-semibold text-text-muted">{activeDatasetMetadata.sourceLabel}</span> : null}
            </div>
            <p className="mt-1 truncate text-[11px] text-text-secondary">{activeDataset.id} · {counts.total} records · {activeDataset.cases.length} cases</p>
          </div>
          <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
            <button
              type="button"
              disabled={!configurationDirty}
              onClick={onDiscardConfiguration}
              className="rounded-full border border-border-soft px-3 py-1.5 text-[11px] font-semibold text-text-secondary hover:border-brand-blue/40 hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
            >
              Discard
            </button>
            <button
              type="button"
              disabled={!configurationDirty}
              onClick={onSaveConfiguration}
              className="rounded-full bg-brand-blue px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-brand-blue-hover disabled:cursor-not-allowed disabled:bg-border-soft"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
      <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="app-scrollbar min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_72px_64px] border-b border-border-soft bg-surface-primary px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          <span>Table</span>
          <span>Fields</span>
          <span className="text-right" aria-label="Enabled" />
        </div>
        {graph.nodes.map((node) => {
          const domain = OBJECT_DOMAIN_DEFINITIONS.find((item) => item.kind === node.id);
          const isSelected = node.id === selectedNode.id;
          const kindLabel = domain ? (MAIN_ENTITY_KINDS.includes(domain.kind) ? 'main' : 'utility') : node.group;
          const enabled = isDomainKind(node.id) ? enabledDomains.includes(node.id) : true;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => {
                setSelectedRelationshipId(null);
                onSelectEntity(node.id);
              }}
              className={`grid w-full grid-cols-[minmax(0,1fr)_72px_64px] items-center gap-2 border-b border-border-soft px-3 py-3 text-left transition-colors ${
                isSelected ? 'bg-brand-blue/5' : 'bg-white hover:bg-surface-primary'
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-text-primary">{labelForNode(node)}</span>
                <span className="block truncate text-[10px] text-text-muted">{node.schema.tableName} · {kindLabel} · {node.recordCount} rows</span>
              </span>
              <span className="text-[11px] text-text-secondary">{node.populatedFieldCount}/{node.fieldCount}</span>
              <span className="flex justify-end" onClick={(event) => event.stopPropagation()}>
                {isDomainKind(node.id) ? (
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => toggleDomain(node.id, checked)}
                    aria-label={`Toggle ${labelForNode(node)}`}
                  />
                ) : (
                  <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[10px] font-semibold text-text-muted">schema</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <aside className="app-scrollbar min-h-0 overflow-auto border-t border-border-soft bg-white p-4 lg:border-l lg:border-t-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{selectedRelationship ? 'Relationship briefing' : 'Object briefing'}</p>
        {selectedRelationship ? (
          <>
            <h3 className="mt-1 text-[16px] font-semibold text-text-primary">{selectedRelationship.relationship.label}</h3>
            <p className="mt-1 text-[11px] text-text-muted">{selectedRelationship.source} {'->'} {selectedRelationship.target} · {selectedRelationship.relationship.cardinality}</p>
            <p className="mt-3 rounded-lg bg-surface-primary p-3 text-[11px] leading-snug text-text-secondary">{selectedRelationship.relationship.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <DataMetric label="Source" value={selectedRelationship.source} />
              <DataMetric label="Target" value={selectedRelationship.target} />
              <DataMetric label="Issues" value={String(selectedRelationship.issueCount)} />
              <DataMetric label="Path id" value={selectedRelationship.id} />
            </div>
            {relationshipIssues.filter((issue) =>
              (issue.sourceKind === selectedRelationship.source && issue.targetKind === selectedRelationship.target) ||
              (issue.sourceKind === selectedRelationship.target && issue.targetKind === selectedRelationship.source),
            ).length ? (
              <div className="mt-4 rounded-lg border border-[#f3c5c2] bg-[#fff7f7] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#cd2c23]">Validation notes</p>
                <div className="mt-2 space-y-1.5">
                  {relationshipIssues.filter((issue) =>
                    (issue.sourceKind === selectedRelationship.source && issue.targetKind === selectedRelationship.target) ||
                    (issue.sourceKind === selectedRelationship.target && issue.targetKind === selectedRelationship.source),
                  ).slice(0, 4).map((issue) => (
                    <p key={`${issue.sourceKind}-${issue.sourceId}-${issue.targetKind}-${issue.targetId}`} className="text-[10px] leading-snug text-text-secondary">{issue.message}</p>
                  ))}
                </div>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setSelectedRelationshipId(null)}
              className="mt-4 rounded-full border border-border-soft px-3 py-1.5 text-[11px] font-semibold text-text-secondary hover:border-brand-blue/40 hover:text-brand-blue"
            >
              Back to object
            </button>
          </>
        ) : (
        <>
        <h3 className="mt-1 text-[16px] font-semibold text-text-primary">{labelForNode(selectedNode)}</h3>
        <p className="mt-1 text-[11px] leading-snug text-text-secondary">{descriptionForNode(selectedNode)}</p>
        <p className="mt-1 text-[10px] text-text-muted">{selectedNode.group} object · PK {selectedNode.schema.primaryKey} · display {selectedNode.schema.displayField}</p>

        <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-lg border border-border-soft bg-surface-primary/70">
          {[
            ['Rows', String(selectedNode.recordCount)],
            ['Fields', `${selectedNode.populatedFieldCount}/${selectedNode.fieldCount}`],
            ['Relations', String(selectedRelationships.length)],
            ['Imports', selectedNode.importTarget?.supportedFormats.join(', ') ?? 'N/A'],
            ['Required', String(selectedNode.schema.fields.filter((field) => field.required).length)],
            ['Refs', String(selectedNode.schema.fields.filter((field) => field.ref).length)],
          ].map(([label, value]) => (
            <div key={label} className="border-b border-r border-border-soft px-2 py-1.5 last:border-r-0 [&:nth-child(3n)]:border-r-0 [&:nth-child(n+4)]:border-b-0">
              <p className="truncate text-[9px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
              <p className="mt-0.5 truncate text-[11px] font-semibold text-text-primary">{value}</p>
            </div>
          ))}
        </div>

        {selectedNode.id === 'case' && caseAnatomyPreview && caseTypeResolved ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-brand-blue/25 bg-brand-blue/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-blue">Case types · layout & workflow</p>
              <p className="mt-1 text-[11px] leading-snug text-text-secondary">
                Activate business lines, pick one to edit, then follow identification → context → workflow → tabs that frame the stepper → General information sections. One surface — no duplicate case-type cards.
              </p>
            </div>

            <div className="rounded-xl border border-border-soft bg-surface-primary p-3">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-text-muted">1 · Active business lines</p>
              <p className="mt-1 text-[10px] text-text-secondary">Toggle which case kinds appear in the product; counts reflect the active dataset.</p>
              <div className="mt-2 space-y-2">
                {businessLineDefinitions.map((workflow) => {
                  const enabled = enabledWorkflows.includes(workflow.caseKind);
                  const count = workflowCounts[workflow.caseKind] ?? 0;
                  return (
                    <div key={workflow.id} className="flex items-center justify-between gap-2 rounded-lg border border-border-soft bg-white px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-text-primary">{workflow.shortLabel}</p>
                        <p className="mt-0.5 text-[10px] text-text-muted">{workflow.caseNoun} · {count} cases</p>
                      </div>
                      <span onClick={(event) => event.stopPropagation()}>
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) => toggleWorkflow(workflow.caseKind, checked)}
                          aria-label={`Toggle ${workflow.shortLabel}`}
                        />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border-soft bg-surface-primary p-3">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-text-muted">2 · Select type to configure</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {businessLineDefinitions.filter((workflow) => enabledWorkflows.includes(workflow.caseKind)).map((workflow) => (
                  <button
                    key={workflow.id}
                    type="button"
                    onClick={() => onSelectBusinessLine(workflow.caseKind)}
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold transition-colors ${
                      selectedBusinessLine === workflow.caseKind
                        ? 'border-brand-blue bg-white text-brand-blue'
                        : 'border-border-soft bg-white text-text-secondary hover:border-brand-blue/40'
                    }`}
                  >
                    {workflow.shortLabel}
                  </button>
                ))}
              </div>
              {selectedBusinessLine === 'claim' && enabledWorkflows.includes('claim') ? (
                <div className="mt-3 rounded-lg border border-border-soft bg-white p-2">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-text-muted">Claim workflow template (preview)</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setClaimWorkflowPreviewId('claim-income-protection')}
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                        claimWorkflowPreviewId === 'claim-income-protection' ? 'border-brand-blue text-brand-blue' : 'border-border-soft text-text-secondary'
                      }`}
                    >
                      Disability / IP
                    </button>
                    <button
                      type="button"
                      onClick={() => setClaimWorkflowPreviewId('claim-death-benefit')}
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                        claimWorkflowPreviewId === 'claim-death-benefit' ? 'border-brand-blue text-brand-blue' : 'border-border-soft text-text-secondary'
                      }`}
                    >
                      Death benefit
                    </button>
                  </div>
                  <p className="mt-2 text-[10px] text-text-muted">
                    Saved anatomy overrides apply to the whole <span className="font-semibold">claim</span> business line; this switches only the workflow summary in section 5.
                  </p>
                </div>
              ) : null}
              {!enabledWorkflows.includes(selectedBusinessLine) ? (
                <p className="mt-2 text-[10px] font-semibold text-amber-800">Enable at least one business line above to edit layout.</p>
              ) : null}
            </div>

            {enabledWorkflows.includes(selectedBusinessLine) ? (
              <>
                <div className="rounded-lg border border-border-soft bg-white p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-text-muted">3 · Identification</p>
                  <p className="mt-1 text-[10px] text-text-muted">
                    Keys surfaced in the case header for {caseTypeResolved.workflow.shortLabel ?? selectedBusinessLine}. Save applies to this business line.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(() => {
                      const merged = mergeCaseShellWithCaseType(selectedBusinessLine);
                      const activeIds =
                        caseIdentificationEdits[selectedBusinessLine] ??
                        platformAnatomy.caseTypeAnatomyOverrides[selectedBusinessLine]?.identificationFields ??
                        merged?.identificationFields ??
                        merged?.headerFields ??
                        [];
                      const candidates = Array.from(
                        new Set([...(merged?.headerFields ?? []), ...(merged?.identificationFields ?? [])]),
                      );
                      return candidates.map((fieldId) => (
                        <label
                          key={fieldId}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border-soft bg-surface-primary px-2.5 py-1"
                        >
                          <Switch
                            checked={activeIds.includes(fieldId)}
                            onCheckedChange={(checked) => {
                              const next = checked
                                ? Array.from(new Set([...activeIds, fieldId]))
                                : activeIds.filter((id) => id !== fieldId);
                              onCaseIdentificationChange(selectedBusinessLine, next);
                            }}
                            aria-label={`Toggle identification field ${fieldId}`}
                          />
                          <span className="text-[10px] font-semibold text-text-primary">{fieldId}</span>
                        </label>
                      ));
                    })()}
                  </div>
                </div>

                <div className="rounded-lg border border-border-soft bg-white p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-text-muted">4 · Context</p>
                  <p className="mt-1 text-[10px] text-text-secondary">
                    Main catalog entities this case type expects to link for intake, routing, and workspace context cards.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {caseTypeResolved.requiredMainEntityLinks.map((kind) => (
                      <span
                        key={kind}
                        className="rounded-full bg-surface-primary px-2 py-0.5 text-[10px] font-semibold text-text-primary"
                      >
                        {OBJECT_DOMAIN_DEFINITIONS.find((domain) => domain.kind === kind)?.label ?? kind}
                      </span>
                    ))}
                  </div>
                  {linkedContextSection ? (
                    <div className="mt-3 rounded-md border border-border-soft bg-surface-primary px-2 py-2">
                      <p className="text-[10px] font-semibold text-text-primary">{linkedContextSection.label}</p>
                      <p className="mt-0.5 text-[10px] text-text-muted">{linkedContextSection.fields.join(', ')}</p>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-lg border border-border-soft bg-white p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-text-muted">5 · Workflow</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-text-primary">{caseTypeResolved.workflow.label}</span>
                    <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[9px] font-semibold text-text-muted">{caseTypeResolved.workflow.id}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-text-muted">
                    {caseTypeResolved.workflow.steps.length} steps · {caseTypeResolved.workflow.statuses.length} statuses
                  </p>
                  <p className="mt-1 line-clamp-3 text-[10px] text-text-secondary">{caseTypeResolved.workflow.statuses.map((status) => status.label).join(' · ')}</p>
                  <button
                    type="button"
                    onClick={() => onConfigureCaseType(selectedBusinessLine)}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-brand-blue px-3 py-1.5 text-[10px] font-semibold text-brand-blue hover:bg-brand-blue/5"
                  >
                    <Sliders className="size-3.5" aria-hidden />
                    Configure steps & overview fields
                  </button>
                </div>

                <div className="rounded-lg border border-border-soft bg-white p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-text-muted">6 · Tabs (workspace + utility)</p>
                  <p className="mt-1 text-[10px] text-text-secondary">
                    Workspace tabs control what appears with the case stepper; utility tabs map to dataset domains (toggle domains here or in the table list).
                  </p>
                  {workspaceTabs.length ? (
                    <div className="mt-2">
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-text-muted">Workspace</p>
                      <div className="mt-1 space-y-2">
                        {workspaceTabs.map((tab) => (
                          <div key={tab.id} className="flex items-start justify-between gap-2 rounded-md bg-surface-primary px-2.5 py-2">
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-semibold text-text-primary">{tab.label}</p>
                              <p className="mt-0.5 text-[10px] text-text-muted">Workspace tab · visibility only</p>
                            </div>
                            <span className="shrink-0" onClick={(event) => event.stopPropagation()}>
                              <Switch
                                checked={tab.enabled}
                                onCheckedChange={(checked) => onCaseContentTabChange(selectedBusinessLine, tab.id, checked)}
                                aria-label={`Toggle tab ${tab.label}`}
                              />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {utilityTabs.length ? (
                    <div className="mt-3">
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-text-muted">Utility</p>
                      <div className="mt-1 space-y-2">
                        {utilityTabs.map((tab) => (
                          <div key={tab.id} className="flex items-start justify-between gap-2 rounded-md bg-surface-primary px-2.5 py-2">
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-semibold text-text-primary">{tab.label}</p>
                              <p className="mt-0.5 text-[10px] text-text-muted">
                                {tab.utilityEntity ? `Utility tab · dataset domain ${tab.utilityEntity}` : 'Utility'}
                              </p>
                            </div>
                            <span className="shrink-0" onClick={(event) => event.stopPropagation()}>
                              {tab.utilityEntity ? (
                                <Switch
                                  checked={enabledDomains.includes(tab.utilityEntity)}
                                  onCheckedChange={(checked) => toggleDomain(tab.utilityEntity!, checked)}
                                  aria-label={`Toggle domain ${tab.utilityEntity}`}
                                />
                              ) : (
                                <Switch
                                  checked={tab.enabled}
                                  onCheckedChange={(checked) => onCaseContentTabChange(selectedBusinessLine, tab.id, checked)}
                                  aria-label={`Toggle tab ${tab.label}`}
                                />
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-lg border border-border-soft bg-white p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-text-muted">7 · General information · sections & fields</p>
                  <div className="mt-2 space-y-2">
                    {(caseAnatomyPreview.tabsResolved.find((tab) => tab.id === 'overview')?.sections?.length
                      ? caseAnatomyPreview.tabsResolved.find((tab) => tab.id === 'overview')!.sections!
                      : caseAnatomyPreview.overviewSections
                    ).map((section) => (
                      <div key={section.id} className="rounded-md border border-border-soft px-2 py-2">
                        <p className="text-[11px] font-semibold text-text-primary">{section.label}</p>
                        <p className="mt-0.5 text-[10px] text-text-muted">{section.fields.join(', ')}</p>
                        {section.subsections?.length ? (
                          <div className="mt-2 space-y-1 border-t border-border-soft pt-2">
                            {section.subsections.map((sub) => (
                              <div key={sub.id}>
                                <p className="text-[10px] font-semibold text-text-secondary">{sub.label}</p>
                                <p className="text-[10px] text-text-muted">{sub.fields.join(', ')}</p>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {selectedNode.id === 'case' ? (
          <details className="group mt-4 rounded-lg border border-border-soft bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted [&::-webkit-details-marker]:hidden">
              <span>Advanced · dataset schema fields</span>
              <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[9px] font-semibold text-text-secondary">
                {selectedNode.schema.fields.length} columns
              </span>
            </summary>
            <div className="border-t border-border-soft px-3 pb-3">
              <div className="mt-2 rounded-lg border border-border-soft">
                {selectedNode.schema.fields.map((field) => (
                  <div
                    key={field.name}
                    className="grid grid-cols-[minmax(0,1fr)_58px_64px] items-center gap-1.5 border-b border-border-soft px-2.5 py-1.5 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-text-primary">{field.name}</p>
                      {field.description ? (
                        <p className="line-clamp-1 text-[10px] text-text-muted">{field.description}</p>
                      ) : field.ref ? (
                        <p className="text-[10px] text-text-muted">ref {field.ref}</p>
                      ) : null}
                    </div>
                    <span className="rounded-full bg-surface-primary px-2 py-0.5 text-center text-[9px] font-semibold text-text-secondary">{field.type}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-center text-[9px] font-semibold ${field.required ? 'bg-brand-blue/10 text-brand-blue' : 'bg-surface-primary text-text-muted'}`}
                    >
                      {field.required ? 'required' : 'optional'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </details>
        ) : (
          <div className="mt-4 rounded-lg border border-border-soft bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Fields</p>
            <div className="mt-2 rounded-lg border border-border-soft">
              {selectedNode.schema.fields.map((field) => (
                <div
                  key={field.name}
                  className="grid grid-cols-[minmax(0,1fr)_58px_64px] items-center gap-1.5 border-b border-border-soft px-2.5 py-1.5 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-text-primary">{field.name}</p>
                    {field.description ? (
                      <p className="line-clamp-1 text-[10px] text-text-muted">{field.description}</p>
                    ) : field.ref ? (
                      <p className="text-[10px] text-text-muted">ref {field.ref}</p>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-surface-primary px-2 py-0.5 text-center text-[9px] font-semibold text-text-secondary">{field.type}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-center text-[9px] font-semibold ${field.required ? 'bg-brand-blue/10 text-brand-blue' : 'bg-surface-primary text-text-muted'}`}
                  >
                    {field.required ? 'required' : 'optional'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 rounded-lg border border-border-soft bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Relationship map</p>
            <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[9px] font-semibold text-text-muted">{selectedRelationships.length} paths</span>
          </div>
          <div className="mt-2 grid gap-2">
            {(['outgoing', 'incoming'] as const).map((direction) => {
              const relationships = selectedRelationships.filter((relationship) =>
                direction === 'outgoing' ? relationship.source === selectedNode.id : relationship.target === selectedNode.id,
              );
              return (
                <div key={direction} className="rounded-lg bg-surface-primary p-2">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-text-muted">{direction}</p>
                  <div className="mt-1.5 space-y-1.5">
                    {relationships.length ? relationships.map((relationship) => {
                      const targetLabel = direction === 'outgoing' ? relationship.target : relationship.source;
                      return (
                        <button
                          key={relationship.id}
                          type="button"
                          onClick={() => setSelectedRelationshipId(relationship.id)}
                          className="w-full rounded-md bg-white px-2.5 py-2 text-left hover:bg-brand-blue/5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-semibold text-text-primary">
                                {direction === 'outgoing' ? `${selectedNode.id} -> ${targetLabel}` : `${targetLabel} -> ${selectedNode.id}`}
                              </p>
                              <p className="mt-0.5 truncate text-[10px] text-text-muted">{relationship.relationship.label} · {relationship.relationship.cardinality}</p>
                            </div>
                            {relationship.issueCount ? <span className="shrink-0 rounded-full bg-[#fde5e4] px-2 py-0.5 text-[9px] font-semibold text-[#cd2c23]">{relationship.issueCount}</span> : null}
                          </div>
                        </button>
                      );
                    }) : (
                      <p className="rounded-md bg-white px-2.5 py-2 text-[10px] text-text-muted">No {direction} relationships</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-surface-primary px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Import rules</p>
          <p className="mt-1 text-[11px] leading-snug text-text-secondary">
            {selectedNode.importTarget
              ? `Required: ${selectedNode.importTarget.requiredFields.join(', ')}. Relationship fields: ${selectedNode.importTarget.relationshipFields.join(', ') || 'none'}.`
              : 'No import target configured for this object.'}
          </p>
        </div>
        {selectedIssues.length ? (
          <div className="mt-4 rounded-lg border border-[#f3c5c2] bg-[#fff7f7] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#cd2c23]">Validation notes</p>
            <div className="mt-2 space-y-1.5">
              {selectedIssues.slice(0, 4).map((issue) => (
                <p key={`${issue.sourceKind}-${issue.sourceId}-${issue.targetKind}-${issue.targetId}`} className="text-[10px] leading-snug text-text-secondary">{issue.message}</p>
              ))}
            </div>
          </div>
        ) : null}
        </>
        )}
      </aside>
      </div>
    </div>
  );
}

function DataRecordsBrowser({
  activeDataset,
  selectedRecordKind,
  onSelectRecordKind,
  relationshipIssues,
}: {
  activeDataset: SystemDataset;
  selectedRecordKind: CatalogObjectKind;
  onSelectRecordKind: (kind: CatalogObjectKind) => void;
  relationshipIssues: RelationshipIssue[];
}) {
  const graph = useMemo(() => buildSchemaGraph({ dataset: activeDataset, relationshipIssues }), [activeDataset, relationshipIssues]);
  const selectedNode = graph.nodes.find((node) => node.id === selectedRecordKind) ?? graph.nodes.find((node) => node.id === 'case') ?? graph.nodes[0];
  const rows = selectedNode ? getDatasetRowsForKind(activeDataset, selectedNode.id) : [];
  const domain = selectedNode ? OBJECT_DOMAIN_DEFINITIONS.find((item) => item.kind === selectedNode.id) : undefined;
  const preferredFields = selectedNode ? [
    selectedNode.schema.primaryKey,
    selectedNode.schema.displayField,
    ...(domain?.keyFields ?? []),
  ] : [];
  const tableFields = selectedNode
    ? Array.from(new Set(preferredFields))
      .map((name) => selectedNode.schema.fields.find((field) => field.name === name))
      .filter((field): field is EntitySchemaDefinition['fields'][number] => Boolean(field))
      .filter((field) => ['string', 'number', 'boolean', 'date', 'enum', 'ref'].includes(field.type))
      .slice(0, 5)
    : [];
  const formatCell = (value: unknown) => {
    if (value === undefined || value === null || value === '') return '—';
    if (Array.isArray(value)) return `${value.length} items`;
    if (typeof value === 'object') {
      const maybeLabel = (value as { label?: unknown; name?: unknown; id?: unknown }).label ?? (value as { name?: unknown }).name ?? (value as { id?: unknown }).id;
      return maybeLabel ? String(maybeLabel) : 'Object';
    }
    return String(value);
  };

  return (
    <section className="grid h-full min-h-0 overflow-hidden bg-white lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav className="app-scrollbar min-h-0 overflow-y-auto border-r border-border-default bg-[#f6f8fa] p-3">
        <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">Entities</p>
        <div className="mt-2 space-y-1">
          {graph.nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => {
                onSelectRecordKind(node.id);
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left transition-colors ${
                selectedNode?.id === node.id ? 'bg-brand-blue text-white' : 'text-text-secondary hover:bg-white hover:text-text-primary'
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-semibold">{OBJECT_DOMAIN_DEFINITIONS.find((item) => item.kind === node.id)?.label ?? node.schema.tableName}</span>
                <span className={`block truncate text-[10px] ${selectedNode?.id === node.id ? 'text-white/75' : 'text-text-muted'}`}>{node.schema.tableName}</span>
              </span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${selectedNode?.id === node.id ? 'bg-white/20 text-white' : 'bg-white text-text-muted'}`}>{node.recordCount}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="app-scrollbar min-h-0 overflow-auto">
        <div className="sticky top-0 z-10 border-b border-border-soft bg-white px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Records</p>
          <h3 className="mt-0.5 text-[15px] font-semibold text-text-primary">{selectedNode?.schema.tableName ?? 'Records'}</h3>
        </div>
        <table className="w-full min-w-[680px] border-separate border-spacing-0 text-left">
          <thead className="bg-surface-primary text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            <tr>
              {tableFields.map((field) => (
                <th key={field.name} className="border-b border-border-soft px-3 py-2">{field.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${selectedNode?.id}-${index}`} className="bg-white hover:bg-surface-primary">
                {tableFields.map((field) => (
                  <td key={field.name} className="max-w-[220px] truncate border-b border-border-soft px-3 py-2 text-[12px] text-text-primary">
                    {formatCell(row[field.name])}
                  </td>
                ))}
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={Math.max(1, tableFields.length)} className="px-4 py-10 text-center text-[12px] text-text-muted">No records in this entity.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

    </section>
  );
}

function getRowsForKind(dataset: SystemDataset, kind: WorkObjectKind): Array<Record<string, unknown>> {
  switch (kind) {
    case 'case':
      return dataset.cases.map(projectCaseRecordForCatalogRow);
    case 'client':
      return dataset.clients as unknown as Array<Record<string, unknown>>;
    case 'policy':
      return dataset.policies as unknown as Array<Record<string, unknown>>;
    case 'agent':
      return dataset.agents as unknown as Array<Record<string, unknown>>;
    case 'application':
      return dataset.applications as unknown as Array<Record<string, unknown>>;
    case 'task':
      return dataset.tasks as unknown as Array<Record<string, unknown>>;
    case 'requirement':
      return dataset.requirements as unknown as Array<Record<string, unknown>>;
    case 'document':
      return dataset.documents as unknown as Array<Record<string, unknown>>;
    case 'request':
      return dataset.requests as unknown as Array<Record<string, unknown>>;
    case 'communication':
      return dataset.communications as unknown as Array<Record<string, unknown>>;
    case 'note':
      return dataset.notes as unknown as Array<Record<string, unknown>>;
    case 'event':
      return dataset.activityEvents as unknown as Array<Record<string, unknown>>;
    default:
      return [];
  }
}

function getFieldCoverage(dataset: SystemDataset, kind: WorkObjectKind) {
  const schema = ENTITY_SCHEMA_DEFINITIONS.find((item) => item.kind === kind);
  const fields = schema?.fields ?? [];
  const rows = getRowsForKind(dataset, kind);
  const populated = fields.filter((field) =>
    rows.some((row) => {
      const value = row[field.name];
      return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== '';
    }),
  ).length;
  return { supported: fields.length, populated };
}

type CreateContextSource = 'profile' | 'duplicate' | 'import';
type CreateContextStep = 'source' | 'configure' | 'validate';

function slugifyContextId(label: string, fallback: string) {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return `${slug || fallback}-${Date.now().toString(36)}`;
}

function CreateDataContextModal({
  open,
  onOpenChange,
  activeDataset,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeDataset: SystemDataset;
  onSaved: (datasetId: string) => void;
}) {
  const [source, setSource] = useState<CreateContextSource>('profile');
  const [step, setStep] = useState<CreateContextStep>('source');
  const [selectedProfileId, setSelectedProfileId] = useState(DATASET_GENERATION_PROFILES[0]?.id ?? '');
  const selectedProfile = DATASET_GENERATION_PROFILES.find((item) => item.id === selectedProfileId) ?? DATASET_GENERATION_PROFILES[0];
  const [form, setForm] = useState({
    name: `${activeDataset.organizationLabel ?? 'Demo'} data context`,
    organizationLabel: activeDataset.organizationLabel ?? 'Demo organization',
    market: 'US / UK configurable',
    businessModel: 'carrier or MGA',
    targetRecordCount: activeDataset.targetRecordCount ?? selectedProfile?.targetRecordCount ?? 1000,
    historyRange: '2 years',
    documentMode: activeDataset.documentMode ?? selectedProfile?.documentMode ?? 'metadata_only',
    scenarioEmphasis: 'realistic relationships, no orphan records, business-line specific cases',
    enabledBusinessLines: activeDataset.enabledBusinessLines?.length ? activeDataset.enabledBusinessLines : selectedProfile?.enabledBusinessLines ?? [],
  });
  const [packageText, setPackageText] = useState('');

  useEffect(() => {
    if (!open) return;
    setStep('source');
    setSource('profile');
    setSelectedProfileId(DATASET_GENERATION_PROFILES[0]?.id ?? '');
    setPackageText('');
    setForm({
      name: `${activeDataset.organizationLabel ?? 'Demo'} data context`,
      organizationLabel: activeDataset.organizationLabel ?? 'Demo organization',
      market: 'US / UK configurable',
      businessModel: 'carrier or MGA',
      targetRecordCount: activeDataset.targetRecordCount ?? DATASET_GENERATION_PROFILES[0]?.targetRecordCount ?? 1000,
      historyRange: '2 years',
      documentMode: activeDataset.documentMode ?? DATASET_GENERATION_PROFILES[0]?.documentMode ?? 'metadata_only',
      scenarioEmphasis: 'realistic relationships, no orphan records, business-line specific cases',
      enabledBusinessLines: activeDataset.enabledBusinessLines?.length ? activeDataset.enabledBusinessLines : DATASET_GENERATION_PROFILES[0]?.enabledBusinessLines ?? [],
    });
  }, [activeDataset, open]);

  const profilePreview = selectedProfile ? previewDatasetGeneration({
    ...selectedProfile,
    label: form.name,
    organizationLabel: form.organizationLabel,
    targetRecordCount: form.targetRecordCount,
    enabledBusinessLines: form.enabledBusinessLines,
    documentMode: form.documentMode as NonNullable<SystemDataset['documentMode']>,
  }) : null;

  const generatedPrompt = buildDatasetGenerationPrompt({
    organizationLabel: form.organizationLabel,
    market: form.market,
    businessModel: form.businessModel,
    enabledModules: ['cases', 'tasks', 'requests', 'documents', 'communications'],
    enabledMainEntities: ['client', 'policy', 'case', 'agent'],
    enabledUtilityEntities: ['task', 'document', 'request', 'requirement', 'communication', 'event'],
    enabledBusinessLines: form.enabledBusinessLines,
    targetRecordCount: form.targetRecordCount,
    historyRange: form.historyRange,
    documentMode: form.documentMode as NonNullable<SystemDataset['documentMode']>,
    scenarioEmphasis: form.scenarioEmphasis.split(',').map((item) => item.trim()).filter(Boolean),
  });

  const parsedPackage = useMemo(() => {
    if (!packageText.trim()) return null;
    try {
      const parsed = JSON.parse(packageText);
      return { parsed, validation: validateDatasetPackage(parsed) };
    } catch (error) {
      return {
        parsed: null,
        validation: {
          valid: false,
          errors: [error instanceof Error ? error.message : 'Invalid JSON package.'],
          warnings: [],
        },
      };
    }
  }, [packageText]);

  const toggleBusinessLine = (line: CaseKind) => {
    setForm((prev) => ({
      ...prev,
      enabledBusinessLines: prev.enabledBusinessLines.includes(line)
        ? prev.enabledBusinessLines.filter((item) => item !== line)
        : [...prev.enabledBusinessLines, line],
    }));
  };

  const saveContext = () => {
    if (source === 'import') {
      if (!parsedPackage?.parsed || !parsedPackage.validation.valid) return;
      const imported = datasetFromPackage(parsedPackage.parsed as AmplifyDatasetPackage);
      const dataset = {
        ...imported,
        id: slugifyContextId(form.name || imported.label, imported.id),
        label: form.name || imported.label,
        organizationLabel: form.organizationLabel || imported.organizationLabel,
        environmentFit: form.scenarioEmphasis || imported.environmentFit,
      };
      datasetRegistry.saveDataset(dataset);
      onSaved(dataset.id);
      onOpenChange(false);
      return;
    }

    if (source === 'duplicate') {
      const dataset = {
        ...activeDataset,
        id: slugifyContextId(form.name, `${activeDataset.id}-copy`),
        label: form.name,
        organizationLabel: form.organizationLabel,
        environmentFit: form.scenarioEmphasis,
      };
      datasetRegistry.saveDataset(dataset);
      onSaved(dataset.id);
      onOpenChange(false);
      return;
    }

    if (!selectedProfile) return;
    const dataset = generateDatasetFromProfile({
      ...selectedProfile,
      label: form.name,
      organizationLabel: form.organizationLabel,
      targetRecordCount: form.targetRecordCount,
      enabledBusinessLines: form.enabledBusinessLines,
      documentMode: form.documentMode as NonNullable<SystemDataset['documentMode']>,
    });
    const savedDataset = {
      ...dataset,
      id: slugifyContextId(form.name, selectedProfile.id),
      label: form.name,
      organizationLabel: form.organizationLabel,
      environmentFit: form.scenarioEmphasis,
      targetRecordCount: form.targetRecordCount,
      documentMode: form.documentMode as SystemDataset['documentMode'],
    };
    datasetRegistry.saveDataset(savedDataset);
    onSaved(savedDataset.id);
    onOpenChange(false);
  };

  const packageCounts = parsedPackage?.parsed?.entities
    ? Object.entries(parsedPackage.parsed.entities as Record<string, unknown[]>)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.length : 0}`)
      .join(' · ')
    : '';
  const canSave = source !== 'import' || Boolean(parsedPackage?.parsed && parsedPackage.validation.valid);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col sm:max-w-[1180px] gap-0 overflow-hidden rounded-xl p-0"
        style={{ width: 'min(1180px, calc(100vw - 1.5rem))', height: 'min(780px, calc(100vh - 2rem))' }}
      >
        <DialogHeader className="border-b border-border-soft px-6 py-5">
          <DialogTitle>Create data context</DialogTitle>
          <DialogDescription>
            Build or import a context from the canonical entity schema, then validate and activate it for the workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden md:grid-cols-[240px_minmax(0,1fr)]">
          <div className="border-b border-border-soft bg-surface-primary p-4 md:border-b-0 md:border-r">
            {[
              ['source', '1. Starting point'],
              ['configure', '2. Scope'],
              ['validate', '3. Validate and save'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setStep(id as CreateContextStep)}
                className={`mb-2 w-full rounded-lg px-3 py-2 text-left text-[11px] font-semibold ${
                  step === id ? 'bg-brand-blue text-white' : 'bg-white text-text-secondary hover:text-text-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="app-scrollbar min-h-0 overflow-auto p-5">
            {step === 'source' ? (
              <div className="space-y-3">
                {[
                  { id: 'profile' as const, title: 'Generate from a profile', body: 'Use deterministic simulation profiles with proper entity relationships, utility records, and business-line distribution.' },
                  { id: 'duplicate' as const, title: 'Duplicate active context', body: 'Start from the current dataset and save a new editable context for iteration.' },
                  { id: 'import' as const, title: 'Import generated package', body: 'Paste an AmplifyDatasetPackage JSON payload and validate it before saving.' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSource(option.id)}
                    className={`w-full rounded-xl border p-4 text-left ${source === option.id ? 'border-brand-blue bg-brand-blue/5 ring-2 ring-brand-blue/10' : 'border-border-soft bg-white hover:border-brand-blue/30'}`}
                  >
                    <p className="text-[13px] font-semibold text-text-primary">{option.title}</p>
                    <p className="mt-1 text-[11px] leading-snug text-text-secondary">{option.body}</p>
                  </button>
                ))}
              </div>
            ) : null}

            {step === 'configure' ? (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} aria-label="Context name" className="h-9 text-[12px]" />
                  <Input value={form.organizationLabel} onChange={(event) => setForm((prev) => ({ ...prev, organizationLabel: event.target.value }))} aria-label="Organization" className="h-9 text-[12px]" />
                  <Input value={form.market} onChange={(event) => setForm((prev) => ({ ...prev, market: event.target.value }))} aria-label="Market" className="h-9 text-[12px]" />
                  <Input value={form.businessModel} onChange={(event) => setForm((prev) => ({ ...prev, businessModel: event.target.value }))} aria-label="Business model" className="h-9 text-[12px]" />
                  <Input type="number" value={form.targetRecordCount} onChange={(event) => setForm((prev) => ({ ...prev, targetRecordCount: Number(event.target.value) || 0 }))} aria-label="Target records" className="h-9 text-[12px]" />
                  <select
                    value={form.documentMode}
                    onChange={(event) => setForm((prev) => ({ ...prev, documentMode: event.target.value as SystemDataset['documentMode'] }))}
                    className="h-9 rounded-lg border border-border-soft bg-white px-3 text-[12px] text-text-secondary outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    aria-label="Document mode"
                  >
                    <option value="metadata_only">Metadata only</option>
                    <option value="sample_files">Sample files</option>
                    <option value="imported_files">Imported files</option>
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Business lines</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {WORKFLOW_DEFINITIONS.map((workflow) => {
                      const checked = form.enabledBusinessLines.includes(workflow.caseKind);
                      return (
                      <button
                        key={workflow.caseKind}
                        type="button"
                        onClick={() => toggleBusinessLine(workflow.caseKind)}
                        className={`flex min-h-[52px] items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                          checked
                            ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                            : 'border-border-soft bg-white text-text-secondary hover:border-brand-blue/40 hover:text-text-primary'
                        }`}
                      >
                        <span className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                          checked ? 'border-brand-blue bg-brand-blue text-white' : 'border-border-default bg-white'
                        }`}>
                          {checked ? <Check className="size-3" /> : null}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[12px] font-semibold">{workflow.shortLabel}</span>
                          <span className="mt-0.5 block truncate text-[10px] text-text-muted">{workflow.caseNoun}</span>
                        </span>
                      </button>
                    );
                    })}
                  </div>
                </div>
                <textarea
                  value={form.scenarioEmphasis}
                  onChange={(event) => setForm((prev) => ({ ...prev, scenarioEmphasis: event.target.value }))}
                  className="min-h-[72px] w-full resize-y rounded-lg border border-border-soft bg-white p-3 text-[12px] text-text-secondary outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  aria-label="Scenario emphasis"
                />
                {source === 'profile' ? (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Generation profile</p>
                    <div className="mt-2 grid gap-2 md:grid-cols-3">
                      {DATASET_GENERATION_PROFILES.map((profile) => {
                        const preview = previewDatasetGeneration(profile);
                        return (
                          <button
                            key={profile.id}
                            type="button"
                            onClick={() => setSelectedProfileId(profile.id)}
                            className={`rounded-xl border p-3 text-left ${selectedProfileId === profile.id ? 'border-brand-blue bg-brand-blue/5' : 'border-border-soft bg-surface-primary'}`}
                          >
                            <p className="text-[12px] font-semibold text-text-primary">{profile.label}</p>
                            <p className="mt-1 text-[10px] text-text-muted">{preview.entityCounts.case} cases · {profile.documentMode.replace('_', ' ')}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === 'validate' ? (
              <div className="space-y-4">
                {source === 'import' ? (
                  <div className="rounded-xl border border-border-soft bg-white p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Paste generated package JSON</p>
                    <textarea
                      value={packageText}
                      onChange={(event) => setPackageText(event.target.value)}
                      placeholder="Paste AmplifyDatasetPackage JSON here..."
                      className="mt-2 min-h-[180px] w-full resize-y rounded-lg border border-border-soft bg-surface-primary p-3 font-mono text-[11px] text-text-secondary outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                    {parsedPackage ? (
                      <div className="mt-3 rounded-lg bg-surface-primary p-3">
                        <p className={`text-[12px] font-semibold ${parsedPackage.validation.valid ? 'text-[#008533]' : 'text-[#cd2c23]'}`}>
                          {parsedPackage.validation.valid ? 'Package is valid and ready to save' : 'Package needs attention'}
                        </p>
                        {packageCounts ? <p className="mt-1 text-[10px] text-text-muted">{packageCounts}</p> : null}
                        {[...parsedPackage.validation.errors, ...parsedPackage.validation.warnings].slice(0, 6).map((item) => (
                          <p key={item} className="mt-1 text-[10px] text-text-secondary">{item}</p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-xl border border-border-soft bg-white p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{source === 'duplicate' ? 'Duplicate summary' : 'Generated profile preview'}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-4">
                      <DataMetric label="Context" value={form.name} />
                      <DataMetric label="Records" value={String(source === 'duplicate' ? countDatasetObjects(activeDataset).total : profilePreview?.targetRecordCount ?? form.targetRecordCount)} />
                      <DataMetric label="Business lines" value={String(form.enabledBusinessLines.length)} />
                      <DataMetric label="Document mode" value={String(form.documentMode).replace('_', ' ')} />
                    </div>
                    {source === 'profile' ? (
                      <>
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => void navigator.clipboard?.writeText(generatedPrompt)}
                            className="rounded-full border border-brand-blue px-3 py-1.5 text-[11px] font-semibold text-brand-blue hover:bg-brand-blue/5"
                          >
                            Copy prompt
                          </button>
                        </div>
                        <pre className="mt-3 max-h-[180px] overflow-auto rounded-lg bg-surface-primary p-3 text-[10px] leading-relaxed text-text-secondary">{generatedPrompt}</pre>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
        <DialogFooter className="border-t border-border-soft px-6 py-4">
          <button
            type="button"
            onClick={() => step === 'source' ? onOpenChange(false) : setStep(step === 'validate' ? 'configure' : 'source')}
            className="rounded-full border border-border-soft px-4 py-2 text-[11px] font-semibold text-text-secondary hover:border-brand-blue/40 hover:text-brand-blue"
          >
            {step === 'source' ? 'Cancel' : 'Back'}
          </button>
          {step !== 'validate' ? (
            <button
              type="button"
              onClick={() => setStep(step === 'source' ? 'configure' : 'validate')}
              className="rounded-full bg-brand-blue px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3px] text-white hover:bg-brand-blue-hover"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={saveContext}
              disabled={!canSave}
              className="rounded-full bg-brand-blue px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3px] text-white hover:bg-brand-blue-hover disabled:cursor-not-allowed disabled:bg-border-soft"
            >
              Save and activate
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateDataContextPanel({ activeDataset, onSaved }: { activeDataset: SystemDataset; onSaved?: () => void }) {
  const { updateDataSource } = usePlatformSettings();
  const [promptInput, setPromptInput] = useState({
    name: `${activeDataset.organizationLabel ?? 'Demo'} context`,
    description: activeDataset.environmentFit ?? activeDataset.description,
    organizationLabel: activeDataset.organizationLabel ?? 'Demo organization',
    market: 'US / UK configurable',
    businessModel: 'carrier or MGA',
    targetRecordCount: activeDataset.targetRecordCount ?? 1000,
    historyRange: '2 years',
    scenarioEmphasis: 'realistic relationships, no orphan records, business-line specific cases',
  });
  const [packageText, setPackageText] = useState('');
  const generatedPrompt = buildDatasetGenerationPrompt({
    organizationLabel: promptInput.organizationLabel,
    market: promptInput.market,
    businessModel: promptInput.businessModel,
    enabledModules: ['cases', 'tasks', 'requests', 'documents', 'communications'],
    enabledMainEntities: ['client', 'policy', 'case', 'agent'],
    enabledUtilityEntities: ['task', 'document', 'request', 'requirement', 'communication', 'event'],
    enabledBusinessLines: activeDataset.enabledBusinessLines ?? [],
    targetRecordCount: promptInput.targetRecordCount,
    historyRange: promptInput.historyRange,
    documentMode: activeDataset.documentMode ?? 'metadata_only',
    scenarioEmphasis: promptInput.scenarioEmphasis.split(',').map((item) => item.trim()).filter(Boolean),
  });
  const parsedPackage = useMemo(() => {
    if (!packageText.trim()) return null;
    try {
      const parsed = JSON.parse(packageText);
      return { parsed, validation: validateDatasetPackage(parsed) };
    } catch (error) {
      return {
        parsed: null,
        validation: {
          valid: false,
          errors: [error instanceof Error ? error.message : 'Invalid JSON package.'],
          warnings: [],
        },
      };
    }
  }, [packageText]);
  const packageCounts = parsedPackage?.parsed?.entities
    ? Object.entries(parsedPackage.parsed.entities as Record<string, unknown[]>)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.length : 0}`)
      .join(' · ')
    : '';
  const canSavePackage = Boolean(parsedPackage?.parsed && parsedPackage.validation.valid);
  const savePackage = () => {
    if (!parsedPackage?.parsed || !parsedPackage.validation.valid) return;
    const dataset = datasetFromPackage(parsedPackage.parsed as AmplifyDatasetPackage);
    datasetRegistry.saveDataset(dataset);
    updateDataSource({ activeDatasetId: dataset.id });
    onSaved?.();
  };

  return (
    <section className="rounded-xl border border-brand-blue/30 bg-brand-blue/5 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-blue">Create data context</p>
          <h3 className="mt-1 text-[15px] font-semibold text-text-primary">{promptInput.name}</h3>
          <p className="mt-1 max-w-[680px] text-[12px] leading-snug text-text-secondary">{promptInput.description}</p>
        </div>
        <button
          type="button"
          onClick={() => void navigator.clipboard?.writeText(generatedPrompt)}
          className="rounded-full bg-brand-blue px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3px] text-white hover:bg-brand-blue-hover"
        >
          Copy prompt
        </button>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <Input value={promptInput.name} onChange={(event) => setPromptInput((prev) => ({ ...prev, name: event.target.value }))} className="h-9 text-[12px]" aria-label="Data context name" />
        <Input value={promptInput.organizationLabel} onChange={(event) => setPromptInput((prev) => ({ ...prev, organizationLabel: event.target.value }))} className="h-9 text-[12px]" aria-label="Organization" />
        <Input type="number" value={promptInput.targetRecordCount} onChange={(event) => setPromptInput((prev) => ({ ...prev, targetRecordCount: Number(event.target.value) || 0 }))} className="h-9 text-[12px]" aria-label="Target records" />
        <Input value={promptInput.market} onChange={(event) => setPromptInput((prev) => ({ ...prev, market: event.target.value }))} className="h-9 text-[12px]" aria-label="Market" />
        <Input value={promptInput.businessModel} onChange={(event) => setPromptInput((prev) => ({ ...prev, businessModel: event.target.value }))} className="h-9 text-[12px]" aria-label="Business model" />
        <Input value={promptInput.historyRange} onChange={(event) => setPromptInput((prev) => ({ ...prev, historyRange: event.target.value }))} className="h-9 text-[12px]" aria-label="History range" />
      </div>
      <textarea
        value={promptInput.scenarioEmphasis}
        onChange={(event) => setPromptInput((prev) => ({ ...prev, scenarioEmphasis: event.target.value }))}
        className="mt-2 min-h-[58px] w-full resize-y rounded-lg border border-border-soft bg-white p-3 text-[12px] text-text-secondary outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
        aria-label="Scenario emphasis"
      />
      <pre className="mt-3 max-h-[180px] overflow-auto rounded-lg bg-white p-3 text-[10px] leading-relaxed text-text-secondary">{generatedPrompt}</pre>
      <div className="mt-4 rounded-lg border border-border-soft bg-white p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Paste generated JSON to validate</p>
        <textarea
          value={packageText}
          onChange={(event) => setPackageText(event.target.value)}
          placeholder="Paste AmplifyDatasetPackage JSON here..."
          className="mt-2 min-h-[120px] w-full resize-y rounded-lg border border-border-soft bg-surface-primary p-3 font-mono text-[11px] text-text-secondary outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
        />
        {parsedPackage ? (
          <div className="mt-2 rounded-lg bg-surface-primary p-3">
            <p className={`text-[12px] font-semibold ${parsedPackage.validation.valid ? 'text-[#008533]' : 'text-[#cd2c23]'}`}>
              {parsedPackage.validation.valid ? 'Package is valid and ready to save as data context' : 'Package needs attention'}
            </p>
            {packageCounts ? <p className="mt-1 text-[10px] text-text-muted">{packageCounts}</p> : null}
            {[...parsedPackage.validation.errors, ...parsedPackage.validation.warnings].slice(0, 6).map((item) => (
              <p key={item} className="mt-1 text-[10px] text-text-secondary">• {item}</p>
            ))}
            <button
              type="button"
              onClick={savePackage}
              disabled={!canSavePackage}
              className="mt-3 rounded-full border border-brand-blue px-3 py-1.5 text-[11px] font-semibold text-brand-blue hover:bg-brand-blue/5 disabled:cursor-not-allowed disabled:border-border-soft disabled:text-text-muted"
            >
              Save and activate data context
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DatasetPreviewPanel({
  activeDataset,
  counts,
  workflowCounts,
  relationshipIssues,
  boundaryIssues,
}: {
  activeDataset: SystemDataset;
  counts: DatasetObjectCounts;
  workflowCounts: Record<CaseKind, number>;
  relationshipIssues: RelationshipIssue[];
  boundaryIssues: ModuleBoundaryIssue[];
}) {
  const [promptInput, setPromptInput] = useState({
    organizationLabel: activeDataset.organizationLabel ?? 'Demo organization',
    market: 'US / UK configurable',
    businessModel: 'carrier or MGA',
    targetRecordCount: activeDataset.targetRecordCount ?? 1000,
    historyRange: '2 years',
    scenarioEmphasis: 'realistic relationships, no orphan records, business-line specific cases',
  });
  const generatedPrompt = buildDatasetGenerationPrompt({
    organizationLabel: promptInput.organizationLabel,
    market: promptInput.market,
    businessModel: promptInput.businessModel,
    enabledModules: ['cases', 'tasks', 'requests', 'documents', 'communications'],
    enabledMainEntities: ['client', 'policy', 'case', 'agent'],
    enabledUtilityEntities: ['task', 'document', 'request', 'requirement', 'communication', 'event'],
    enabledBusinessLines: activeDataset.enabledBusinessLines ?? [],
    targetRecordCount: promptInput.targetRecordCount,
    historyRange: promptInput.historyRange,
    documentMode: activeDataset.documentMode ?? 'metadata_only',
    scenarioEmphasis: promptInput.scenarioEmphasis.split(',').map((item) => item.trim()).filter(Boolean),
  });
  const entityRows = OBJECT_DOMAIN_DEFINITIONS
    .map((domain) => ({ ...domain, count: counts.byKind[domain.kind] }))
    .filter((domain) => domain.count > 0);

  return (
    <div className="mt-3 space-y-3">
      <div className="grid gap-3 lg:grid-cols-3">
        {datasetRegistry.listDatasets().map((dataset) => (
          <div
            key={dataset.id}
            className={`rounded-xl border p-4 ${
              dataset.id === activeDataset.id
                ? 'border-brand-blue/40 bg-brand-blue/5 ring-2 ring-brand-blue/10'
                : 'border-border-soft bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-text-primary">{dataset.label}</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  {dataset.organizationLabel ?? 'Environment'}
                </p>
              </div>
              <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                {dataset.cases.length} cases
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-[11px] leading-snug text-text-secondary">
              {dataset.environmentFit ?? dataset.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {(dataset.enabledBusinessLines ?? []).map((line) => (
                <span key={line} className="rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold capitalize text-text-muted">
                  {line.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border-soft bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <DataMetric label="Entities" value={String(counts.total)} />
          <DataMetric label="Business lines" value={String(Object.values(workflowCounts).filter(Boolean).length)} />
          <DataMetric label="Cases" value={String(activeDataset.cases.length)} />
          <DataMetric label="Validation" value={String(relationshipIssues.length + boundaryIssues.length)} />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-xl border border-border-soft bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Entity volume</p>
          <div className="mt-3 space-y-2">
            {entityRows.map((domain) => {
              const pct = counts.total ? Math.max(6, Math.round((domain.count / counts.total) * 100)) : 0;
              return (
                <div key={domain.kind}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-text-primary">{domain.label}</span>
                    <span className="text-text-muted">{domain.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-primary">
                    <div className="h-full rounded-full bg-brand-blue" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border-soft bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Representative cases</p>
          <div className="mt-2 divide-y divide-border-soft">
            {activeDataset.cases.slice(0, 5).map((item) => (
              <div key={item.id} className="grid gap-2 py-2 sm:grid-cols-[minmax(140px,0.75fr)_minmax(180px,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-text-primary">{item.id}</p>
                  <p className="truncate text-[10px] text-text-muted">{item.caseKind.replace('_', ' ')}</p>
                </div>
                <p className="truncate text-[11px] text-text-secondary">{item.title}</p>
                <span className="shrink-0 rounded-full bg-surface-primary px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                  {item.linkedObjects.length} links
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border-soft bg-surface-primary p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Demo data</p>
        <p className="mt-1 text-[12px] leading-snug text-text-secondary">
          The built-in <span className="font-semibold text-text-primary">SBLI demo cases</span> dataset is shared by the
          Equisoft and SBLI demo environments. Use <span className="font-semibold text-text-primary">Demo environment</span>{' '}
          in settings to switch branding without changing records.
        </p>
        <p className="mt-2 text-[11px] text-text-muted">
          Advanced: create a new data context from the toolbar above if you need a custom simulation or imported JSON
          package.
        </p>
      </div>
      <div className="rounded-xl border border-border-soft bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">LLM dataset prompt</p>
        <p className="mt-1 text-[11px] leading-snug text-text-secondary">
          Copy this prompt into Cursor or another LLM IDE to generate a valid dataset package.
        </p>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <Input
            value={promptInput.organizationLabel}
            onChange={(event) => setPromptInput((prev) => ({ ...prev, organizationLabel: event.target.value }))}
            className="h-9 text-[12px]"
            aria-label="Organization"
          />
          <Input
            value={promptInput.market}
            onChange={(event) => setPromptInput((prev) => ({ ...prev, market: event.target.value }))}
            className="h-9 text-[12px]"
            aria-label="Market"
          />
          <Input
            type="number"
            value={promptInput.targetRecordCount}
            onChange={(event) => setPromptInput((prev) => ({ ...prev, targetRecordCount: Number(event.target.value) || 0 }))}
            className="h-9 text-[12px]"
            aria-label="Target record count"
          />
          <Input
            value={promptInput.businessModel}
            onChange={(event) => setPromptInput((prev) => ({ ...prev, businessModel: event.target.value }))}
            className="h-9 text-[12px]"
            aria-label="Business model"
          />
          <Input
            value={promptInput.historyRange}
            onChange={(event) => setPromptInput((prev) => ({ ...prev, historyRange: event.target.value }))}
            className="h-9 text-[12px]"
            aria-label="History range"
          />
          <Input
            value={promptInput.scenarioEmphasis}
            onChange={(event) => setPromptInput((prev) => ({ ...prev, scenarioEmphasis: event.target.value }))}
            className="h-9 text-[12px]"
            aria-label="Scenario emphasis"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => void navigator.clipboard?.writeText(generatedPrompt)}
            className="rounded-full border border-brand-blue px-3 py-1.5 text-[11px] font-semibold text-brand-blue hover:bg-brand-blue/5"
          >
            Copy prompt
          </button>
        </div>
        <pre className="mt-3 max-h-[220px] overflow-auto rounded-lg bg-surface-primary p-3 text-[10px] leading-relaxed text-text-secondary">
{generatedPrompt}
        </pre>
      </div>
      <div className="rounded-xl border border-border-soft bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Case layout reference</p>
        <p className="mt-1 text-[11px] leading-snug text-text-secondary">
          Tabs, General information sections, identification keys, and workflows are edited under{' '}
          <span className="font-semibold text-text-primary">Data → Configuration</span> with the Case table selected — one consolidated briefing per business line (no duplicate cards here).
        </p>
      </div>
    </div>
  );
}

function BusinessLineConfigurator({
  selectedBusinessLine,
  enabledWorkflows,
  toggleWorkflow,
  workflowCounts,
  businessLineSteps,
  overviewFields,
  selectedStepId,
  onSelectStep,
  updateBusinessLineSteps,
  updateOverviewFields,
}: {
  selectedBusinessLine: CaseKind;
  enabledWorkflows: CaseKind[];
  toggleWorkflow: (kind: CaseKind, enabled: boolean) => void;
  workflowCounts: Record<CaseKind, number>;
  businessLineSteps: Record<CaseKind, EditableBusinessStep[]>;
  overviewFields: Record<CaseKind, BusinessOverviewField[]>;
  selectedStepId: string | null;
  onSelectStep: (id: string | null) => void;
  updateBusinessLineSteps: (kind: CaseKind, updater: (steps: EditableBusinessStep[]) => EditableBusinessStep[]) => void;
  updateOverviewFields: (kind: CaseKind, updater: (fields: BusinessOverviewField[]) => BusinessOverviewField[]) => void;
}) {
  const selectedWorkflow = getPrimaryWorkflowDefinition(selectedBusinessLine);
  const steps = businessLineSteps[selectedWorkflow.caseKind] ?? [];
  const currentOverviewFields = overviewFields[selectedWorkflow.caseKind] ?? [];
  const selectedStep = steps.find((step) => step.id === selectedStepId) ?? steps[0] ?? null;
  const enabled = enabledWorkflows.includes(selectedWorkflow.caseKind);
  const entityDependencies = selectedWorkflow.searchableObjectKinds
    .map((kind) => OBJECT_DOMAIN_DEFINITIONS.find((domain) => domain.kind === kind)?.label ?? kind)
    .slice(0, 7);
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const addStep = () => {
    const nextIndex = steps.length + 1;
    const id = `${selectedWorkflow.caseKind}-step-${Date.now().toString(36)}`;
    const newStep: EditableBusinessStep = {
      id,
      label: `New step ${nextIndex}`,
      phaseId: selectedWorkflow.phases[0]?.id ?? 'configuration',
      tooltip: 'Describe what this lifecycle step does.',
      logic: { createTask: false, createRequirement: false, createRequest: false },
    };
    updateBusinessLineSteps(selectedWorkflow.caseKind, (current) => [...current, newStep]);
    onSelectStep(id);
  };

  const reorderStep = (id: string, targetIndex: number) => {
    updateBusinessLineSteps(selectedWorkflow.caseKind, (current) => {
      const sourceIndex = current.findIndex((step) => step.id === id);
      if (sourceIndex < 0) return current;
      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      const adjustedIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
      next.splice(Math.max(0, Math.min(adjustedIndex, next.length)), 0, moved);
      return next;
    });
  };

  const removeStep = (id: string) => {
    updateBusinessLineSteps(selectedWorkflow.caseKind, (current) => {
      const next = current.filter((step) => step.id !== id);
      if (selectedStepId === id) onSelectStep(next[0]?.id ?? null);
      return next;
    });
  };

  const updateStepLogic = (logicKey: keyof BusinessStepLogic, value: boolean) => {
    if (!selectedStep) return;
    updateBusinessLineSteps(selectedWorkflow.caseKind, (current) =>
      current.map((step) =>
        step.id === selectedStep.id
          ? { ...step, logic: { ...step.logic, [logicKey]: value } }
          : step,
      ),
    );
  };

  const addOverviewField = () => {
    updateOverviewFields(selectedWorkflow.caseKind, (current) => [
      ...current,
      {
        id: `${selectedWorkflow.caseKind}-overview-${Date.now().toString(36)}`,
        label: `Overview field ${current.length + 1}`,
        source: 'case',
        required: false,
      },
    ]);
  };

  const toggleOverviewFieldRequired = (id: string, required: boolean) => {
    updateOverviewFields(selectedWorkflow.caseKind, (current) =>
      current.map((field) => (field.id === id ? { ...field, required } : field)),
    );
  };

  return (
    <div className="mt-3 space-y-4">
      <div className="rounded-xl border border-border-soft bg-white p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-blue">
                {selectedWorkflow.shortLabel}
              </span>
              <h3 className="text-[16px] font-semibold text-text-primary">{selectedWorkflow.label}</h3>
            </div>
            <p className="mt-2 max-w-[720px] text-[12px] leading-relaxed text-text-secondary">
              {getWorkflowBusinessNeed(selectedWorkflow.caseKind)}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-surface-primary px-2 py-1 text-[10px] font-semibold text-text-secondary">
                Case type: {selectedWorkflow.caseNoun}
              </span>
              <span className="rounded-full bg-surface-primary px-2 py-1 text-[10px] font-semibold text-text-secondary">
                Primary party: {selectedWorkflow.primaryPartyLabel}
              </span>
              <span className="rounded-full bg-surface-primary px-2 py-1 text-[10px] font-semibold text-text-secondary">
                {workflowCounts[selectedWorkflow.caseKind] ?? 0} cases
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${enabled ? 'bg-brand-blue/10 text-brand-blue' : 'bg-surface-primary text-text-muted'}`}>
              {enabled ? 'Activated' : 'Inactivated'}
            </span>
            <Switch
              checked={enabled}
              onCheckedChange={(checked) => toggleWorkflow(selectedWorkflow.caseKind, checked)}
              aria-label={`Toggle ${selectedWorkflow.label} business line`}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <div className="rounded-xl border border-border-soft bg-surface-primary p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Lifecycle steps</p>
                <p className="mt-1 max-w-[420px] text-[11px] leading-snug text-text-secondary">Grab a step to reorder it. Placeholder spaces show where it will land.</p>
              </div>
              <button
                type="button"
                onClick={addStep}
                className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-brand-blue px-4 py-2 text-[11px] font-bold text-white hover:bg-brand-blue-hover sm:w-auto sm:min-w-[112px]"
              >
                <Plus className="size-3.5" />
                Add step
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {dropIndex === 0 ? (
                <LifecycleDropPlaceholder
                  onDragOver={() => setDropIndex(0)}
                  onDrop={() => {
                    if (draggedStepId) reorderStep(draggedStepId, 0);
                    setDraggedStepId(null);
                    setDropIndex(null);
                  }}
                />
              ) : null}
              {steps.map((step, index) => {
                const selected = selectedStep?.id === step.id;
                return (
                  <div key={step.id}>
                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      const rect = event.currentTarget.getBoundingClientRect();
                      const nextIndex = event.clientY > rect.top + rect.height / 2 ? index + 1 : index;
                      setDropIndex(nextIndex);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const sourceId = draggedStepId ?? event.dataTransfer.getData('text/plain');
                      if (sourceId) reorderStep(sourceId, dropIndex ?? index);
                      setDraggedStepId(null);
                      setDropIndex(null);
                    }}
                    className={`grid gap-3 rounded-lg border bg-white p-3 md:grid-cols-[18px_minmax(0,1fr)_auto] md:items-center ${
                      selected ? 'border-brand-blue ring-2 ring-brand-blue/10' : 'border-border-soft'
                    } ${draggedStepId === step.id ? 'opacity-50' : ''}`}
                  >
                    <button
                      type="button"
                      draggable
                      aria-label={`Drag ${step.label}`}
                      onDragStart={(event) => {
                        setDraggedStepId(step.id);
                        setDropIndex(index);
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', step.id);
                      }}
                      onDragEnd={() => {
                        setDraggedStepId(null);
                        setDropIndex(null);
                      }}
                      className="mt-0.5 flex h-5 w-4 cursor-grab items-center justify-center text-text-muted active:cursor-grabbing"
                    >
                      <GripVertical className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => onSelectStep(step.id)} className="min-w-0 text-left">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-[10px] font-bold text-brand-blue">
                          {index + 1}
                        </span>
                        <p className="truncate text-[12px] font-semibold text-text-primary">{step.label}</p>
                      </div>
                      <p className="mt-0.5 truncate text-[10px] text-text-muted">{step.phaseId} · {step.tooltip}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      aria-label={`Delete ${step.label}`}
                      className="justify-self-end rounded-md p-1.5 text-[#cd2c23] hover:bg-[#fde5e4]"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  {dropIndex === index + 1 ? (
                    <LifecycleDropPlaceholder
                      onDragOver={() => setDropIndex(index + 1)}
                      onDrop={() => {
                        if (draggedStepId) reorderStep(draggedStepId, index + 1);
                        setDraggedStepId(null);
                        setDropIndex(null);
                      }}
                    />
                  ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border-soft bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Step logic</p>
            {selectedStep ? (
              <>
                <h4 className="mt-1 text-[14px] font-semibold text-text-primary">{selectedStep.label}</h4>
                <p className="mt-1 text-[11px] leading-snug text-text-secondary">{selectedStep.tooltip}</p>
                <div className="mt-4 space-y-3">
                  {[
                    ['createTask', 'Create task', 'Creates an assigned work item when the step starts.'],
                    ['createRequirement', 'Create requirement', 'Adds a requirement gate for evidence, validation, or review.'],
                    ['createRequest', 'Create request', 'Generates or links an intake/service request to the step.'],
                  ].map(([key, label, description]) => (
                    <div key={key} className="flex items-start justify-between gap-3 rounded-lg border border-border-soft bg-surface-primary px-3 py-2">
                      <div>
                        <p className="text-[12px] font-semibold text-text-primary">{label}</p>
                        <p className="mt-0.5 text-[10px] leading-snug text-text-secondary">{description}</p>
                      </div>
                      <Switch
                        checked={selectedStep.logic[key as keyof BusinessStepLogic]}
                        onCheckedChange={(checked) => updateStepLogic(key as keyof BusinessStepLogic, checked)}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg border border-dashed border-border-soft bg-surface-primary px-3 py-2">
                  <p className="text-[11px] font-semibold text-text-primary">Future triggers</p>
                  <p className="mt-1 text-[10px] leading-snug text-text-secondary">
                    Later this step can react to document intake, request source, data conditions, external events, or AI confidence thresholds.
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-2 text-[11px] text-text-muted">Select a lifecycle step to configure its logic.</p>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border-soft bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Overview card content</p>
              <p className="mt-1 text-[11px] text-text-secondary">
                These fields define what this business line contributes to case general information.
              </p>
            </div>
            <button
              type="button"
              onClick={addOverviewField}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border-soft bg-white px-3 py-2 text-[11px] font-bold text-text-secondary hover:border-brand-blue/40 hover:text-brand-blue sm:w-auto"
            >
              <Plus className="size-3.5" />
              Add overview field
            </button>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {currentOverviewFields.map((field) => (
              <div key={field.id} className="rounded-lg border border-border-soft bg-surface-primary px-3 py-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-text-primary">{field.label}</p>
                    <p className="mt-0.5 text-[10px] text-text-muted">Source: {field.source.replace('_', ' ')}</p>
                  </div>
                  <Switch
                    checked={field.required}
                    onCheckedChange={(checked) => toggleOverviewFieldRequired(field.id, checked)}
                    aria-label={`Toggle ${field.label} required`}
                  />
                </div>
                <p className="mt-1 text-[10px] text-text-secondary">
                  {field.required ? 'Required in overview card' : 'Optional overview field'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {entityDependencies.map((entity) => (
            <span key={entity} className="rounded-full bg-surface-primary px-2 py-1 text-[10px] font-semibold text-text-secondary">
              {entity}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function LifecycleDropPlaceholder({
  onDragOver,
  onDrop,
}: {
  onDragOver: () => void;
  onDrop: () => void;
}) {
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      className="rounded-lg border border-dashed border-brand-blue/50 bg-brand-blue/5 px-3 py-2"
    >
      <div className="h-8 rounded-md bg-white/70" />
    </div>
  );
}

function SchemaWhiteboard({
  expandedSchemaKind,
  onSelect,
  counts,
  relationshipIssues,
  dataset,
}: {
  expandedSchemaKind: WorkObjectKind;
  onSelect: (kind: WorkObjectKind) => void;
  counts: DatasetObjectCounts;
  relationshipIssues: RelationshipIssue[];
  dataset: SystemDataset;
}) {
  const selectedSchema =
    ENTITY_SCHEMA_DEFINITIONS.find((schema) => schema.kind === expandedSchemaKind) ?? ENTITY_SCHEMA_DEFINITIONS[0];
  const outbound = getOutboundRelationships(selectedSchema.kind);
  const inbound = getInboundRelationships(selectedSchema.kind);
  const selectedIssueCount = countRelationshipIssuesByKind(relationshipIssues, selectedSchema.kind);
  const selectedAnatomy = ENTITY_ANATOMY_DEFINITIONS.find((anatomy) => anatomy.kind === selectedSchema.kind);
  const selectedFieldCoverage = getFieldCoverage(dataset, selectedSchema.kind);
  const mainNodes: WorkObjectKind[] = ['client', 'policy', 'case', 'agent'];
  const utilityNodes: WorkObjectKind[] = ['task', 'document', 'request', 'requirement', 'communication', 'event'];

  return (
    <div className="mt-3 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.6fr)]">
      <div className="rounded-xl border border-border-soft bg-[#f8fafc] p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Architecture map</p>
            <p className="mt-1 text-[11px] text-text-secondary">
              Select a node to inspect fields, tabs, sections, actions, status model, and relationship paths.
            </p>
          </div>
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-text-muted">
            {OBJECT_RELATIONSHIPS.length} paths
          </span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border-soft bg-white p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]">
          <div className="pointer-events-none absolute inset-0 opacity-[0.38]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #cfd6dd 1px, transparent 0)', backgroundSize: '22px 22px' }} />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_1.2fr_1fr]">
            <div className="flex flex-col justify-center gap-4">
              <SchemaNode schemaKind="client" selected={expandedSchemaKind === 'client'} counts={counts} onSelect={onSelect} />
              <SchemaNode schemaKind="policy" selected={expandedSchemaKind === 'policy'} counts={counts} onSelect={onSelect} />
              <SchemaNode schemaKind="agent" selected={expandedSchemaKind === 'agent'} counts={counts} onSelect={onSelect} />
            </div>
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-4">
              <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
                <SchemaConnector label="participants" />
                <SchemaNode schemaKind="case" selected={expandedSchemaKind === 'case'} counts={counts} onSelect={onSelect} featured />
                <SchemaConnector label="coverage" />
              </div>
              <div className="w-full rounded-xl border border-dashed border-border-soft bg-surface-primary/80 p-3">
                <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-text-muted">Utility layer attached to selected main entities</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {utilityNodes.map((kind) => (
                    <SchemaNode key={kind} schemaKind={kind} selected={expandedSchemaKind === kind} counts={counts} onSelect={onSelect} compact />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {[
                ['Policy', 'Case', 'creates or supports work'],
                ['Client', 'Case', 'participates directly'],
                ['Agent', 'Policy', 'services / sells'],
                ['Document', 'Requirement', 'can fulfill'],
                ['Request', 'Task', 'can initiate'],
                ['Event', 'Case', 'audit trail'],
              ].map(([from, to, label]) => (
                <div key={`${from}-${to}-${label}`} className="rounded-xl border border-border-soft bg-white px-3 py-2 shadow-[0_1px_2px_rgba(27,28,30,0.04)]">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-text-primary">
                    <span>{from}</span>
                    <span className="text-brand-blue">→</span>
                    <span>{to}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border-soft bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Relationship paths</p>
          <div className="mt-2 flex flex-wrap gap-2">
          {OBJECT_RELATIONSHIPS.map((relationship) => (
            <button
              key={relationship.id}
              type="button"
              onClick={() => onSelect(relationship.source)}
              className="rounded-full border border-border-soft bg-white px-2.5 py-1 text-[10px] font-semibold text-text-secondary hover:border-brand-blue/40 hover:text-brand-blue"
            >
              {relationship.source} {'->'} {relationship.target}
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border-soft bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Inspector</p>
            <h4 className="mt-1 text-[14px] font-semibold text-text-primary">{selectedSchema.tableName}</h4>
            <p className="mt-0.5 text-[11px] text-text-muted">
              PK {selectedSchema.primaryKey} · display {selectedSchema.displayField} · {counts.byKind[selectedSchema.kind]} records
            </p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${selectedIssueCount ? 'bg-[#fde5e4] text-[#cd2c23]' : 'bg-[#e7f4ec] text-[#008533]'}`}>
            {selectedIssueCount ? `${selectedIssueCount} issues` : 'healthy'}
          </span>
        </div>
        {selectedAnatomy ? (
          <div className="mt-4 grid gap-2">
            <div className="rounded-lg bg-surface-primary px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Tabs</p>
              <p className="mt-1 text-[11px] text-text-secondary">{selectedAnatomy.tabs.map((tab) => tab.label).join(', ')}</p>
            </div>
            <div className="rounded-lg bg-surface-primary px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Sections</p>
              <p className="mt-1 text-[11px] text-text-secondary">{selectedAnatomy.overviewSections.map((section) => section.label).join(', ')}</p>
            </div>
            <div className="rounded-lg bg-surface-primary px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Actions</p>
              <p className="mt-1 text-[11px] text-text-secondary">{selectedAnatomy.actions.join(', ')}</p>
            </div>
          </div>
        ) : null}
        {selectedSchema.kind === 'case' ? (
          <div className="mt-4 rounded-lg border border-border-soft bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Case business lines</p>
            <p className="mt-1 text-[11px] text-text-secondary">
              Claim, new business, service, and agent flows share the Case entity; full tab and section layout is configured under Data → Configuration when Case is selected.
            </p>
          </div>
        ) : null}
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Fields</p>
            <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[9px] font-semibold text-text-muted">
              {selectedFieldCoverage.populated}/{selectedFieldCoverage.supported} populated
            </span>
          </div>
          <div className="mt-2 max-h-[220px] overflow-y-auto rounded-lg border border-border-soft">
            {selectedSchema.fields.map((field) => (
              <div key={field.name} className="grid grid-cols-[minmax(0,1fr)_72px_72px] items-center gap-2 border-b border-border-soft px-3 py-2 last:border-b-0">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold text-text-primary">{field.name}</p>
                  {field.ref ? <p className="text-[10px] text-text-muted">ref {field.ref}</p> : null}
                </div>
                <span className="rounded-full bg-surface-primary px-2 py-0.5 text-center text-[9px] font-semibold text-text-secondary">
                  {field.type}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-center text-[9px] font-semibold ${field.required ? 'bg-brand-blue/10 text-brand-blue' : 'bg-surface-primary text-text-muted'}`}>
                  {field.required ? 'required' : 'optional'}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <SchemaRelationshipGroup title="Outbound" relationships={outbound} empty="No outbound relations" />
          <SchemaRelationshipGroup title="Inbound" relationships={inbound} empty="No inbound relations" />
        </div>
      </div>
    </div>
  );
}

function SchemaNode({
  schemaKind,
  selected,
  counts,
  onSelect,
  featured = false,
  compact = false,
}: {
  schemaKind: WorkObjectKind;
  selected: boolean;
  counts: DatasetObjectCounts;
  onSelect: (kind: WorkObjectKind) => void;
  featured?: boolean;
  compact?: boolean;
}) {
  const schema = ENTITY_SCHEMA_DEFINITIONS.find((item) => item.kind === schemaKind);
  if (!schema) return null;
  const outbound = getOutboundRelationships(schemaKind).length;
  const inbound = getInboundRelationships(schemaKind).length;
  return (
    <button
      type="button"
      onClick={() => onSelect(schemaKind)}
      className={`rounded-xl border text-left transition-all ${
        selected
          ? 'border-brand-blue bg-white shadow-[0_4px_14px_rgba(0,98,150,0.16)]'
          : 'border-border-soft bg-white hover:border-brand-blue/35 hover:shadow-[0_2px_8px_rgba(27,28,30,0.08)]'
      } ${featured ? 'scale-[1.03] p-5 text-center' : compact ? 'p-2.5' : 'p-3'}`}
    >
      <p className={`${featured ? 'text-[16px]' : 'text-[12px]'} font-semibold text-text-primary`}>{schema.tableName}</p>
      <p className="mt-0.5 text-[10px] text-text-muted">{schema.category} · {counts.byKind[schemaKind]} records</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className="rounded-full bg-surface-primary px-1.5 py-0.5 text-[9px] font-semibold text-text-muted">
          {outbound} out
        </span>
        <span className="rounded-full bg-surface-primary px-1.5 py-0.5 text-[9px] font-semibold text-text-muted">
          {inbound} in
        </span>
      </div>
    </button>
  );
}

function SchemaConnector({ label }: { label: string }) {
  return (
    <div className="hidden items-center gap-1 lg:flex">
      <span className="h-px flex-1 bg-border-default" />
      <span className="rounded-full bg-surface-primary px-2 py-0.5 text-[9px] font-semibold text-text-muted">{label}</span>
      <span className="h-px flex-1 bg-border-default" />
    </div>
  );
}

function DatasetHealthPanel({
  relationshipIssues,
  boundaryIssues,
}: {
  relationshipIssues: RelationshipIssue[];
  boundaryIssues: ModuleBoundaryIssue[];
}) {
  const totalIssues = relationshipIssues.length + boundaryIssues.length;
  return (
    <div>
      <SectionHeader
        title="Relationship health"
        description="Check whether entities point to valid related records before a dataset is used in a demo environment."
      />
      <div className="mt-3 rounded-xl border border-border-soft bg-white p-4">
        <div className={`rounded-lg px-3 py-2 ${totalIssues ? 'bg-[#fff4e6]' : 'bg-[#e7f4ec]'}`}>
          <p className={`text-[12px] font-semibold ${totalIssues ? 'text-[#a36d00]' : 'text-[#008533]'}`}>
            {totalIssues ? `${totalIssues} validation notices found` : 'All relationships are healthy'}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-text-secondary">
            The preview validates linked entity references across cases, tasks, requirements, documents, requests, communications, and events.
          </p>
        </div>
        <div className="mt-3 space-y-2">
          {totalIssues ? [
            ...relationshipIssues.slice(0, 3).map((issue) => ({
              id: `${issue.sourceKind}-${issue.sourceId}-${issue.targetKind}-${issue.targetId}`,
              title: `${issue.sourceKind} ${issue.sourceId}`,
              message: issue.message,
            })),
            ...boundaryIssues.slice(0, 3).map((issue) => ({
              id: `${issue.kind}-${issue.entityId}`,
              title: issue.entityId,
              message: issue.message,
            })),
          ].slice(0, 5).map((issue) => (
            <div key={issue.id} className="rounded-lg bg-surface-primary px-3 py-2">
              <p className="text-[11px] font-semibold text-text-primary">{issue.title}</p>
              <p className="text-[10px] text-text-muted">{issue.message}</p>
            </div>
          )) : (
            ['Case links resolved', 'Requirement evidence resolved', 'Request initiated work resolved'].map((item) => (
              <div key={item} className="rounded-lg bg-surface-primary px-3 py-2 text-[11px] font-semibold text-text-secondary">
                {item}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SchemaRelationshipGroup({
  title,
  relationships,
  empty,
}: {
  title: string;
  relationships: ObjectRelationshipDefinition[];
  empty: string;
}) {
  return (
    <div className="rounded-lg border border-border-soft bg-surface-primary/60 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{title}</p>
      {relationships.length ? (
        <div className="mt-2 space-y-1.5">
          {relationships.map((relationship) => (
            <div key={relationship.id} className="rounded-md bg-white px-2.5 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-text-primary">
                  {relationship.source} {'->'} {relationship.target}
                </p>
                <span className="shrink-0 rounded-full bg-surface-primary px-2 py-0.5 text-[9px] font-semibold text-text-muted">
                  {relationship.cardinality}
                </span>
              </div>
              <p className="mt-1 text-[10px] leading-snug text-text-secondary">{relationship.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-text-muted">{empty}</p>
      )}
    </div>
  );
}

function getWorkflowBusinessNeed(caseKind: CaseKind): string {
  switch (caseKind) {
    case 'claim':
      return 'Adjudicate evidence, manage benefits, and coordinate recovery or closure once eligibility is established.';
    case 'new_business':
      return 'Capture application packages, resolve advisor/client gaps, and prepare clean submissions for downstream review.';
    case 'customer_service':
      return 'Verify caller authority, process policy or client updates, and close the loop with compliant confirmation.';
    default:
      return 'Manage a configurable business line through linked entities, work, evidence, and communications.';
  }
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-[14px] font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 text-[12px] leading-snug text-text-secondary">{description}</p>
    </div>
  );
}

function ImportReadinessPanel() {
  const { t } = useTranslation('settings');
  const [packageText, setPackageText] = useState('');
  const parsedPackage = useMemo(() => {
    if (!packageText.trim()) return null;
    try {
      const parsed = JSON.parse(packageText);
      return { parsed, validation: validateDatasetPackage(parsed) };
    } catch (error) {
      return {
        parsed: null,
        validation: {
          valid: false,
          errors: [error instanceof Error ? error.message : 'Invalid JSON package.'],
          warnings: [],
        },
      };
    }
  }, [packageText]);
  const packageCounts = parsedPackage?.parsed?.entities
    ? Object.entries(parsedPackage.parsed.entities as Record<string, unknown[]>)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.length : 0}`)
      .join(' · ')
    : '';
  return (
    <div>
      <SectionHeader title={t('data.import.title')} description={t('data.import.description')} />
      <div className="mt-3 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-dashed border-border-soft bg-surface-primary p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-blue">
              <Upload className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-text-primary">{t('data.import.dropTitle')}</p>
              <p className="mt-1 text-[11px] leading-snug text-text-secondary">{t('data.import.dropDescription')}</p>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3px] text-white shadow-[0_4px_10px_rgba(0,98,150,0.22)] transition-colors hover:bg-brand-blue-hover"
              >
                <Upload className="size-3.5" />
                Import data package
              </button>
              <p className="mt-2 text-[10px] leading-snug text-text-muted">
                Preview only: the import button prepares the flow but does not mutate the active dataset yet.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {IMPORT_TARGETS.slice(0, 7).map((target) => (
              <span key={target.kind} className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-text-secondary">
                {target.label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border-soft bg-white p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Environment import rules</p>
          <div className="mt-3 grid gap-3">
            {[
              {
                title: 'Case-by-case package',
                body: 'Each XML, JSON, or CSV package must declare a root case or service case so imported records land in the right business line.',
              },
              {
                title: 'Related entity manifest',
                body: 'Clients, policies, applications, requirements, tasks, documents, communications, and events travel with explicit relationships between them.',
              },
              {
                title: 'Validation before write',
                body: 'IDs, duplicate records, missing references, and unsupported entity types are checked before anything is accepted into an environment.',
              },
            ].map((rule, index) => (
              <div key={rule.title} className="rounded-lg bg-surface-primary px-3 py-2">
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-text-muted">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold text-text-primary">{rule.title}</p>
                    <p className="mt-0.5 text-[10px] leading-snug text-text-secondary">{rule.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {[
              t('data.import.steps.upload'),
              t('data.import.steps.map'),
              t('data.import.steps.validate'),
              t('data.import.steps.preview'),
            ].map((step, index) => (
              <div key={step} className="flex items-center gap-2 text-[11px] text-text-secondary">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-primary text-[10px] font-bold text-text-muted">
                  {index + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-border-soft bg-white p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Package validation preview</p>
        <textarea
          value={packageText}
          onChange={(event) => setPackageText(event.target.value)}
          placeholder="Paste AmplifyDatasetPackage JSON here..."
          className="mt-3 min-h-[160px] w-full resize-y rounded-lg border border-border-soft bg-surface-primary p-3 font-mono text-[11px] leading-relaxed text-text-secondary outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
        />
        {parsedPackage ? (
          <div className="mt-3 rounded-lg bg-surface-primary p-3">
            <p className={`text-[12px] font-semibold ${parsedPackage.validation.valid ? 'text-[#008533]' : 'text-[#cd2c23]'}`}>
              {parsedPackage.validation.valid ? 'Package is structurally valid' : 'Package needs attention'}
            </p>
            {packageCounts ? <p className="mt-1 text-[10px] text-text-muted">{packageCounts}</p> : null}
            {[...parsedPackage.validation.errors, ...parsedPackage.validation.warnings].length ? (
              <ul className="mt-2 space-y-1 text-[10px] text-text-secondary">
                {[...parsedPackage.validation.errors, ...parsedPackage.validation.warnings].slice(0, 8).map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-[6px] size-1 shrink-0 rounded-full bg-text-muted" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}


/* ─── Branding tab ─── */

const LOGO_MAX_BYTES = 500 * 1024;
const LOGO_ACCEPT = 'image/png,image/svg+xml,image/jpeg,image/webp';

type LogoSurface = 'dark' | 'light';

const SURFACE_PREVIEW_STYLE: Record<LogoSurface, string> = {
  dark: 'bg-brand-blue-hover',
  light: 'bg-surface-muted',
};

/**
 * Small pill badge that labels a logo surface. Sits inside the dropzone / preview
 * so the mapping between the label and the visual is unambiguous.
 */
function SurfaceBadge({ surface }: { surface: LogoSurface }) {
  const { t } = useTranslation('settings');
  const onDark = surface === 'dark';
  const title = onDark ? t('branding.surfaces.darkMode') : t('branding.surfaces.lightMode');
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{
        backgroundColor: onDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.06)',
        color: onDark ? '#ffffff' : '#1b1c1e',
      }}
    >
      {title}
    </span>
  );
}

function LogoSurfacePreview({ surface }: { surface: LogoSurface }) {
  const { t } = useTranslation('settings');
  return (
    <div
      className={`relative flex items-center justify-center rounded-lg border border-border-soft py-5 ${SURFACE_PREVIEW_STYLE[surface]}`}
      aria-label={t('branding.surfaces.previewAria', { surface })}
    >
      <span className="absolute left-2 top-2">
        <SurfaceBadge surface={surface} />
      </span>
      <SimpleLogo
        className="h-[32px] w-[104px]"
        textFill={surface === 'dark' ? '#ffffff' : '#1b1c1e'}
      />
    </div>
  );
}

function DefaultLogoPreview() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <LogoSurfacePreview surface="dark" />
      <LogoSurfacePreview surface="light" />
    </div>
  );
}

function splitBrandingProductName(productName: string) {
  const clean = productName.trim() || 'Amplify Case Management';
  const [first, ...rest] = clean.split(/\s+/);
  return {
    first,
    second: rest.join(' '),
  };
}

function LogoDropzone({
  surface,
  dataUrl,
  onSelect,
  onClear,
}: {
  surface: LogoSurface;
  dataUrl: string | undefined;
  onSelect: (dataUrl: string) => void;
  onClear: () => void;
}) {
  const { t } = useTranslation('settings');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onDark = surface === 'dark';
  const title = onDark ? t('branding.surfaces.darkMode') : t('branding.surfaces.lightMode');

  const readFile = (file: File | null) => {
    if (!file) return;
    setError(null);
    if (!file.type.match(/^image\/(png|svg\+xml|jpeg|webp)$/)) {
      setError(t('branding.dropzone.errors.fileType'));
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      setError(t('branding.dropzone.errors.fileSize'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onSelect(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    readFile(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const openPicker = () => inputRef.current?.click();

  /* Empty-state text colors adapt to the surface so "Drop logo, or upload" is
   * readable on both backgrounds. */
  const emptyHeadingColor = onDark ? '#ffffff' : '#1b1c1e';
  const emptyHintColor = onDark ? 'rgba(255,255,255,0.7)' : '#878f9a';
  const emptyLinkColor = onDark ? '#8bc6e0' : '#006296';

  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept={LOGO_ACCEPT}
        className="sr-only"
        onChange={(e) => readFile(e.target.files?.[0] ?? null)}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
          }
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        aria-label={
          dataUrl
            ? t('branding.surfaces.replaceAria', { surface: title.toLowerCase() })
            : t('branding.surfaces.uploadAria', { surface: title.toLowerCase() })
        }
        className={`group relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors ${
          isDragging ? 'border-brand-blue' : 'border-[#c4cbd2] hover:border-brand-blue'
        } ${SURFACE_PREVIEW_STYLE[surface]}`}
      >
        <span className="absolute left-2 top-2 z-[1]">
          <SurfaceBadge surface={surface} />
        </span>
        {dataUrl ? (
          <>
            <img
              src={dataUrl}
              alt={t('branding.surfaces.logoAlt', { surface: title })}
              className="h-[44px] max-w-[180px] object-contain"
            />
            <p className="text-[10px]" style={{ color: emptyHintColor }}>
              <span className="font-semibold" style={{ color: emptyLinkColor }}>
                {t('branding.dropzone.click')}
              </span>
              {t('branding.dropzone.orDropToReplace')}
            </p>
          </>
        ) : (
          <>
            <div className="flex size-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#e0e4e8] group-hover:ring-brand-blue">
              <ImagePlus className="size-4 text-brand-blue" />
            </div>
            <p className="text-[12px] font-semibold" style={{ color: emptyHeadingColor }}>
              {t('branding.dropzone.dropOr')}
              <span
                className="underline-offset-4 group-hover:underline"
                style={{ color: emptyLinkColor }}
              >
                {t('branding.dropzone.upload')}
              </span>
            </p>
            <p className="text-[10px]" style={{ color: emptyHintColor }}>
              {t('branding.dropzone.specs')}
            </p>
          </>
        )}
      </div>
      {error ? (
        <p className="flex items-center gap-1.5 text-[11px] text-[#cd2c23]">
          <AlertTriangle className="size-3.5 shrink-0" /> {error}
        </p>
      ) : null}
      {dataUrl ? (
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={openPicker} className="h-7 text-[11px]">
            <Upload className="size-3.5" /> {t('common:actions.replace', { ns: 'common' })}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 text-[11px] text-[#cd2c23] hover:text-[#cd2c23]"
          >
            <X className="size-3.5" /> {t('common:actions.remove', { ns: 'common' })}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function BrandingTab() {
  const { t } = useTranslation('settings');
  const branding = useBranding();
  const { updateBranding, resetBranding, settings, setThemeMode } = usePlatformSettings();
  const themeMode = settings.themeMode;
  const productNameParts = useMemo(() => splitBrandingProductName(branding.productName), [branding.productName]);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-[13px] font-semibold text-text-primary">{t('branding.productNameTitle')}</h3>
          <label className="flex items-center gap-2 text-[12px] font-medium text-text-secondary">
            <span>{t('branding.productNameShowInHeader')}</span>
            <Switch
              checked={branding.showProductName}
              onCheckedChange={(checked) => updateBranding({ showProductName: checked })}
            />
          </label>
        </div>
        <Input
          value={branding.productName}
          onChange={(e) => updateBranding({ productName: e.target.value })}
          placeholder={t('branding.productNamePlaceholder')}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-text-primary">{t('branding.logoTitle')}</h3>
          <SegmentedControl
            options={[
              { key: 'default' as const, label: t('branding.logoMode.default'), icon: AiCueSparkleTabIcon },
              { key: 'custom' as const, label: t('branding.logoMode.custom'), icon: Upload },
            ]}
            value={branding.logoMode}
            onChange={(v) => updateBranding({ logoMode: v })}
            size="compact"
            tone="neutral"
          />
        </div>
        {branding.logoMode === 'custom' ? (
          <div className="grid grid-cols-2 gap-3">
            <LogoDropzone
              surface="dark"
              dataUrl={branding.logoDarkDataUrl}
              onSelect={(dataUrl) =>
                updateBranding({ logoMode: 'custom', logoDarkDataUrl: dataUrl })
              }
              onClear={() => updateBranding({ logoDarkDataUrl: undefined })}
            />
            <LogoDropzone
              surface="light"
              dataUrl={branding.logoLightDataUrl}
              onSelect={(dataUrl) =>
                updateBranding({ logoMode: 'custom', logoLightDataUrl: dataUrl })
              }
              onClear={() => updateBranding({ logoLightDataUrl: undefined })}
            />
          </div>
        ) : (
          <DefaultLogoPreview />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-[13px] font-semibold text-text-primary">{t('branding.colors.title')}</h3>
        <div className="grid grid-cols-3 gap-3">
          <ColorField
            label={t('branding.colors.header')}
            value={branding.headerColor}
            onChange={(v) => updateBranding({ headerColor: v })}
          />
          <ColorField
            label={t('branding.colors.primary')}
            value={branding.primaryColor}
            onChange={(v) => updateBranding({ primaryColor: v })}
          />
          <ColorField
            label={t('branding.colors.accent')}
            value={branding.accentColor}
            onChange={(v) => updateBranding({ accentColor: v })}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-[13px] font-semibold text-text-primary">{t('branding.appearance.title')}</h3>
        <div className="flex items-center justify-between rounded-lg border border-border-soft bg-surface-primary px-4 py-3">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-text-primary">{t('branding.appearance.title')}</p>
            <p className="mt-0.5 text-[11px] text-text-secondary">
              Select the header surface used across the workspace.
            </p>
          </div>
          <SegmentedControl
            options={[
              { key: 'light' as const, label: t('branding.appearance.light'), icon: Sun },
              { key: 'dark' as const, label: t('branding.appearance.dark'), icon: Moon },
            ]}
            value={themeMode}
            onChange={setThemeMode}
            className="shrink-0"
            size="compact"
            tone="neutral"
          />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-[13px] font-semibold text-text-primary">{t('branding.preview.title')}</h3>
        <div
          className="flex items-center justify-between rounded-md px-4 py-3 shadow-sm"
          style={{
            backgroundColor:
              themeMode === 'light' ? '#f5f5f7' : branding.headerColor,
            color: themeMode === 'light' ? '#1b1c1e' : branding.onHeaderColor,
            border: themeMode === 'light' ? '1px solid #e0e4e8' : undefined,
          }}
        >
          <div className="flex items-end gap-2">
            {branding.logoMode === 'custom' &&
            resolveBrandingLogoSrc(
              themeMode === 'light' ? branding.logoLightDataUrl : branding.logoDarkDataUrl,
            ) ? (
              <img
                src={
                  resolveBrandingLogoSrc(
                    themeMode === 'light' ? branding.logoLightDataUrl : branding.logoDarkDataUrl,
                  )!
                }
                alt={t('branding.preview.customLogoAlt')}
                className="h-[28px] max-w-[120px] object-contain"
              />
            ) : (
              <SimpleLogo
                className="h-[28px] w-[90px]"
                textFill={themeMode === 'light' ? '#1b1c1e' : '#ffffff'}
              />
            )}
            {branding.showProductName ? (
              <span className="mb-[1px] flex flex-col items-start text-left leading-[0.95] opacity-80">
                <span className="text-[11px] font-semibold">{productNameParts.first}</span>
                {productNameParts.second ? (
                  <span className="text-[11px] font-medium">{productNameParts.second}</span>
                ) : null}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold"
              style={{ backgroundColor: branding.primaryColor, color: '#fff' }}
            >
              {t('branding.preview.primaryChip')}
            </span>
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold"
              style={{ backgroundColor: branding.accentColor, color: '#fff' }}
            >
              <AiCueSparkle size={12} className="mr-1 inline !text-white" /> {t('branding.preview.aiChip')}
            </span>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={resetBranding}>
          <RotateCcw className="size-3.5" /> {t('branding.resetBranding')}
        </Button>
      </div>
    </div>
  );
}

/* Suppress unused-warning when DEFAULT_BRANDING is imported only for type-side
 * documentation purposes elsewhere — kept for future re-use. */
void DEFAULT_BRANDING;

/* ─── HSV <-> HEX helpers ─── */

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsv(r: number, g: number, b: number) {
  const rf = r / 255;
  const gf = g / 255;
  const bf = b / 255;
  const max = Math.max(rf, gf, bf);
  const min = Math.min(rf, gf, bf);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    switch (max) {
      case rf:
        h = ((gf - bf) / d) % 6;
        break;
      case gf:
        h = (bf - rf) / d + 2;
        break;
      default:
        h = (rf - gf) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, v };
}

function hsvToRgb(h: number, s: number, v: number) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rf = 0;
  let gf = 0;
  let bf = 0;
  if (h < 60) [rf, gf, bf] = [c, x, 0];
  else if (h < 120) [rf, gf, bf] = [x, c, 0];
  else if (h < 180) [rf, gf, bf] = [0, c, x];
  else if (h < 240) [rf, gf, bf] = [0, x, c];
  else if (h < 300) [rf, gf, bf] = [x, 0, c];
  else [rf, gf, bf] = [c, 0, x];
  return { r: (rf + m) * 255, g: (gf + m) * 255, b: (bf + m) * 255 };
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

/* ─── Saturation/Value pad ─── */

function SVPad({
  hue,
  s,
  v,
  onChange,
}: {
  hue: number;
  s: number;
  v: number;
  onChange: (s: number, v: number) => void;
}) {
  const { t } = useTranslation('settings');
  const padRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromEvent = (clientX: number, clientY: number) => {
    const rect = padRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = clamp01((clientX - rect.left) / rect.width);
    const ny = clamp01((clientY - rect.top) / rect.height);
    onChange(nx, 1 - ny);
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      updateFromEvent(e.clientX, e.clientY);
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [onChange]);

  return (
    <div
      ref={padRef}
      role="slider"
      aria-label={t('branding.colorPicker.saturationAria')}
      aria-valuetext={t('branding.colorPicker.saturationValueText', {
        s: Math.round(s * 100),
        v: Math.round(v * 100),
      })}
      onMouseDown={(e) => {
        dragging.current = true;
        updateFromEvent(e.clientX, e.clientY);
      }}
      className="relative h-[140px] w-full cursor-crosshair overflow-hidden rounded-md"
      style={{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
        style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%` }}
      />
    </div>
  );
}

/* ─── Color picker popover ─── */

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const { t } = useTranslation('settings');
  const hsv = useMemo(() => hexToHsv(value), [value]);
  const [hex, setHex] = useState(value);
  const [hexEditing, setHexEditing] = useState(false);
  const [eyedropperError, setEyedropperError] = useState(false);
  const EyeDropperCtor = typeof window !== 'undefined'
    ? (window as unknown as { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper
    : undefined;
  const canUseEyeDropper = Boolean(EyeDropperCtor);

  useEffect(() => {
    if (!hexEditing) setHex(value);
  }, [value, hexEditing]);

  const commitHex = (raw: string) => {
    const cleaned = raw.trim().startsWith('#') ? raw.trim() : `#${raw.trim()}`;
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cleaned)) {
      if (cleaned.toLowerCase() !== value.toLowerCase()) onChange(cleaned);
      setHex(cleaned);
    } else {
      setHex(value);
    }
  };

  const setFromHsv = (h: number, s: number, v: number) => {
    const rgb = hsvToRgb(h, s, v);
    onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
  };

  const pickFromScreen = async () => {
    setEyedropperError(false);
    if (!EyeDropperCtor) {
      setEyedropperError(true);
      return;
    }
    try {
      const result = await new EyeDropperCtor().open();
      if (result?.sRGBHex) onChange(result.sRGBHex);
    } catch {
      /* User cancelled or browser blocked access; keep current color. */
    }
  };

  return (
    <div className="flex w-[240px] flex-col gap-3">
      <button
        type="button"
        onClick={pickFromScreen}
        disabled={!canUseEyeDropper}
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border-default bg-white px-2.5 text-[12px] font-semibold text-text-secondary transition-colors hover:border-brand-blue hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-45"
        title={canUseEyeDropper ? 'Pick a color from the logo or anywhere on screen' : 'Color sampling is not supported in this browser'}
      >
        <Pipette className="size-3.5" />
        Pick from logo
      </button>
      {eyedropperError ? (
        <p className="text-[11px] leading-snug text-text-muted">
          Browser color sampling is unavailable. Use the sliders or hex field.
        </p>
      ) : null}
      <SVPad
        hue={hsv.h}
        s={hsv.s}
        v={hsv.v}
        onChange={(s, v) => setFromHsv(hsv.h, s, v)}
      />

      {/* Hue slider */}
      <div className="relative h-3 w-full">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
          }}
        />
        <input
          aria-label={t('branding.colorPicker.hueAria')}
          type="range"
          min={0}
          max={360}
          step={1}
          value={Math.round(hsv.h)}
          onChange={(e) => setFromHsv(Number(e.target.value), hsv.s, hsv.v)}
          className="relative z-[1] h-3 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-3 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-transparent"
        />
      </div>

      {/* Hex field */}
      <div className="flex items-center gap-2">
        <span
          className="size-7 shrink-0 rounded border border-border-default"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={hexEditing ? hex : value}
          spellCheck={false}
          onFocus={() => {
            setHex(value);
            setHexEditing(true);
          }}
          onChange={(e) => setHex(e.target.value)}
          onBlur={() => {
            setHexEditing(false);
            commitHex(hex);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              setHex(value);
              setHexEditing(false);
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="flex-1 rounded border border-border-soft bg-white px-2 py-1 font-mono text-[12px] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
        />
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useTranslation('settings');
  const textInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const openPicker = () => setOpen(true);

  /**
   * Clicking anywhere on the container opens the color picker, unless the click
   * landed on the text input or the copy button.
   */
  const onContainerClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-color-field-skip="true"]')) return;
    openPicker();
  };

  const commitDraft = () => {
    setEditing(false);
    const next = draft.trim();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(next)) {
      if (next.toLowerCase() !== value.toLowerCase()) onChange(next);
    } else {
      setDraft(value);
    }
  };

  const copy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(value);
      } else {
        const el = document.createElement('textarea');
        el.value = value;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* best effort */
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            onClick={onContainerClick}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
                e.preventDefault();
                openPicker();
              }
            }}
            aria-label={t('branding.colors.fieldAria', { label })}
            className="group flex cursor-pointer items-center gap-2 rounded-md border border-border-soft bg-white px-2 py-1.5 transition-colors hover:border-[#c4cbd2] focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none size-6 shrink-0 rounded border border-border-default"
              style={{ backgroundColor: value }}
            />
            <input
              ref={textInputRef}
              data-color-field-skip="true"
              type="text"
              value={editing ? draft : value}
              onFocus={() => setEditing(true)}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitDraft}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitDraft();
                  textInputRef.current?.blur();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setDraft(value);
                  setEditing(false);
                  textInputRef.current?.blur();
                }
              }}
              onClick={(e) => e.stopPropagation()}
              spellCheck={false}
              className={`w-full cursor-text rounded px-1.5 py-0.5 font-mono text-[12px] text-text-primary outline-none transition-colors ${
                editing ? 'bg-surface-muted' : 'bg-transparent hover:bg-[#f6f7f8]'
              }`}
            />
            <button
              type="button"
              data-color-field-skip="true"
              onClick={(e) => {
                e.stopPropagation();
                copy();
              }}
              aria-label={t('branding.colors.copyAria', { label })}
              title={copied ? t('branding.colors.copied') : t('branding.colors.copyHex')}
              className="shrink-0 rounded p-1 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
            >
              {copied ? (
                <Check className="size-3.5 text-[#1f7a5b]" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={10}
          collisionPadding={16}
          className="w-auto p-3"
        >
          <ColorPicker value={value} onChange={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ─── Modules tab ─── */

/** Route prefixes that belong to each module. */
const MODULE_ROUTES: Record<ModuleId, string[]> = {
  home: ['/home', '/dashboard', '/'],
  cases: ['/cases'],
  folders: ['/folders'],
  finances: ['/finances'],
  tasks: ['/tasks'],
  requests: ['/requests'],
  documents: ['/documents'],
  aiActions: ['/ai-actions'],
  insights: ['/insights'],
  reports: ['/reports'],
  copilot: ['/copilot'],
};

/** Returns true when the current pathname belongs to the given module. */
function isOnModule(pathname: string, id: ModuleId): boolean {
  return MODULE_ROUTES[id].some((prefix) =>
    prefix === '/' ? pathname === '/' : pathname.startsWith(prefix),
  );
}

type ModuleMeta = {
  id: ModuleId;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;
};

const MODULE_DEFS: ModuleMeta[] = [
  { id: 'home', icon: Home },
  { id: 'cases', icon: Briefcase },
  { id: 'folders', icon: FolderOpen },
  { id: 'finances', icon: HandCoins },
  { id: 'tasks', icon: Sliders },
  { id: 'requests', icon: Inbox },
  { id: 'documents', icon: FileText },
  { id: 'aiActions', icon: AiCueSparkleTabIcon },
  { id: 'insights', icon: Lightbulb },
  { id: 'reports', icon: BarChart3 },
  { id: 'copilot', icon: MessageSquare },
];

function ModulesTab() {
  const { t } = useTranslation('settings');
  const {
    setModuleEnabled,
    settings,
  } = usePlatformSettings();
  const modules = settings.modules;
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggle = (id: ModuleId, enabled: boolean) => {
    setModuleEnabled(id, enabled);
    if (!enabled && isOnModule(location.pathname, id)) {
      navigate('/home');
    }
  };

  const enabledCount = Object.values(modules).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] text-text-secondary">{t('modules.intro')}</p>
      {MODULE_DEFS.map(({ id, icon: Icon }) => {
        const enabled = modules[id] ?? true;
        const isLastEnabled = enabled && enabledCount === 1;
        const label = t(`modules.definitions.${id}.label` as never);
        const description = t(`modules.definitions.${id}.description` as never);

        return (
          <div
            key={id}
            className={`overflow-hidden rounded-lg border transition-colors ${
              enabled
                ? 'border-border-soft bg-white'
                : 'border-border-soft bg-surface-primary opacity-60'
            }`}
          >
            {/* Header row */}
            <div className="flex items-center gap-4 p-4">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                  enabled ? 'bg-surface-muted' : 'bg-surface-primary'
                }`}
              >
                <Icon className={`size-4 ${enabled ? 'text-text-primary' : 'text-text-muted'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-text-primary">{label}</p>
                <p className="mt-0.5 text-[11px] text-text-secondary">{description}</p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(v) => handleToggle(id, v)}
                disabled={isLastEnabled}
                aria-label={t('modules.toggleAria', { label })}
                title={isLastEnabled ? t('modules.lastEnabledTitle') : undefined}
              />
            </div>

          </div>
        );
      })}
    </div>
  );
}

/* ─── Intelligence tab ─── */

function IntelligenceTab() {
  const { t } = useTranslation('settings');
  const {
    settings,
    setAiActivityEnabled,
    setAiSidePanelEnabled,
    setCasesAiAssistantEnabled,
    setModuleEnabled,
    setAiActivityVisible,
  } = usePlatformSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCopilotToggle = (enabled: boolean) => {
    setModuleEnabled('copilot', enabled);
    if (!enabled && isOnModule(location.pathname, 'copilot')) {
      navigate('/home');
    }
  };

  const rows: {
    key: 'assistant' | 'sidePanel' | 'caseAssistant' | 'activityFeed';
    icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;
    checked: boolean;
    onChange: (v: boolean) => void;
  }[] = [
    {
      key: 'assistant',
      icon: MessageSquare,
      checked: settings.modules.copilot !== false,
      onChange: handleCopilotToggle,
    },
    {
      key: 'sidePanel',
      icon: PanelRight,
      checked: settings.preferences.aiSidePanelEnabled !== false,
      onChange: setAiSidePanelEnabled,
    },
    {
      key: 'caseAssistant',
      icon: Briefcase,
      checked: settings.preferences.casesAiAssistantEnabled !== false,
      onChange: setCasesAiAssistantEnabled,
    },
    {
      key: 'activityFeed',
      icon: AiCueSparkleTabIcon,
      checked: settings.preferences.aiActivityVisible !== false,
      onChange: setAiActivityVisible,
    },
  ];
  /* setAiActivityEnabled isn't wired to a row but the action is still part of
   * the public surface; reference it so the unused-warning stays clean. */
  void setAiActivityEnabled;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[12px] text-text-secondary">{t('intelligence.intro')}</p>
      {rows.map(({ key, icon: Icon, checked, onChange }) => {
        const label = t(`intelligence.rows.${key}.label` as never);
        const description = t(`intelligence.rows.${key}.description` as never);
        return (
          <div
            key={key}
            className="flex items-center gap-4 py-3 transition-colors"
          >
            <Icon className={`size-5 shrink-0 ${checked ? 'text-brand-accent' : 'text-text-muted'}`} />
            <div className="min-w-0 flex-1">
              <p className={`text-[13px] font-semibold ${checked ? 'text-text-primary' : 'text-text-secondary'}`}>{label}</p>
              <p className="mt-0.5 text-[11px] text-text-secondary">{description}</p>
            </div>
            <Switch
              checked={checked}
              onCheckedChange={onChange}
              aria-label={label}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ─── Language tab ─── */

/**
 * The full multi-language picker UI lives in git history (and is gated behind
 * `LANGUAGE_FEATURE_ENABLED` in `i18n/types.ts`). Until every module is fully
 * tokenized and the FR / ES translations have been through a UX writing
 * review, this tab ships as a "Coming soon" placeholder so users see the
 * roadmap signal without the half-translated experience.
 *
 * Copy is intentionally plain English (no `t()`) because the app is hard-pinned
 * to English while the feature is off — adding partial translations here
 * would defeat the whole purpose of disabling it.
 */
function LanguageTab() {
  const supported = SUPPORTED_LANGUAGES.map((code) => LANGUAGES[code]);
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-dashed border-border-soft bg-surface-primary p-5">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-text-muted" />
          <h3 className="text-[13px] font-semibold text-text-secondary">Coming soon</h3>
        </div>
        <p className="mt-2 text-[12px] text-text-muted">
          We&rsquo;re still polishing the in-app translations. Once every module
          has been reviewed for tone and consistency, you&rsquo;ll be able to
          switch the workspace between English, French and Spanish from here.
        </p>
      </div>

      <div className="flex flex-col gap-2 opacity-60">
        {supported.map((meta) => {
          const isDefault = meta.code === DEFAULT_LANGUAGE;
          return (
            <div
              key={meta.code}
              className="flex items-start gap-3 rounded-lg border border-border-soft bg-white p-4"
            >
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
                <Globe className="size-4 text-text-muted" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <p className="text-[13px] font-semibold text-text-primary">{meta.nativeName}</p>
                  <p className="text-[11px] text-text-muted">
                    {meta.englishName} &middot; {meta.region}
                  </p>
                  {isDefault ? (
                    <span className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                      Default
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[12px] italic leading-snug text-text-secondary">
                  {meta.sample}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Demo configuration tab ─── */

function DemoConfigurationTab() {
  const { t } = useTranslation('settings');
  const { settings } = usePlatformSettings();
  const savedEnvironments = settings.demoConfigurations;
  const activeDataset = datasetRegistry.getDataset(settings.dataSource.activeDatasetId);
  const activeAdapter = DATA_ADAPTER_CONTRACTS.find((adapter) => adapter.id === settings.dataSource.connector);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[12px] text-text-secondary">{t('demo.intro')}</p>
      <div className="rounded-lg border border-border-soft bg-white p-4">
        <div className="flex items-start gap-3">
          <Sliders className="mt-0.5 size-4 shrink-0 text-brand-blue" />
          <div className="min-w-0 flex-1">
            <h3 className="text-[13px] font-semibold text-text-primary">Active data source</h3>
            <p className="mt-1 text-[12px] leading-snug text-text-secondary">
              {activeDataset?.label ?? settings.dataSource.activeDatasetId} · {settings.dataSource.mode.replace('_', ' ')} · {settings.dataSource.connector.replace('_', ' ')}
            </p>
            <p className="mt-1 text-[11px] leading-snug text-text-muted">
              {activeAdapter?.capabilitySummary ?? 'This connector is not yet registered in the adapter contract.'}
            </p>
            {activeAdapter?.status === 'planned' ? (
              <span className="mt-2 inline-flex rounded-full bg-[#fff4e6] px-2 py-0.5 text-[10px] font-semibold text-[#8a5a00]">
                Planned connector - read/write operations are gated until an adapter implementation is enabled.
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {savedEnvironments.map((config) => (
          <DemoConfigurationCard
            key={config.id}
            config={config}
            active={settings.activeDemoConfigurationId === config.id}
          />
        ))}
      </div>
      <p className="text-[11px] leading-snug text-text-muted">
        {t('demo.sharedDatasetNote')}
      </p>
    </div>
  );
}

function DemoConfigurationCard({
  config,
  active,
}: {
  config: SavedDemoConfiguration;
  active: boolean;
}) {
  const { t } = useTranslation('settings');
  const { setActiveDemoConfiguration, deleteDemoConfiguration, exportBuiltInDemoEnvironmentForDeploy } =
    usePlatformSettings();
  const [expanded, setExpanded] = useState(false);
  const [deployHint, setDeployHint] = useState<string | null>(null);
  const builtIn = isBuiltInDemoEnvironment(config.id);
  const enabledModules = MODULE_DEFS.filter(({ id }) => config.settings.modules[id] !== false);
  const enabledTypes = config.settings.caseTypes.filter((caseType) => caseType.enabled);
  const activeCaseType = config.settings.caseTypes.find(
    (caseType) => caseType.id === config.settings.activeCaseTypeId,
  );
  const aiFlags = [
    config.settings.modules.copilot !== false,
    config.settings.preferences.aiSidePanelEnabled !== false,
    config.settings.preferences.casesAiAssistantEnabled !== false,
    config.settings.preferences.aiActivityVisible !== false,
  ];
  const aiEnabledCount = aiFlags.filter(Boolean).length;

  return (
    <article className={`overflow-hidden rounded-lg border bg-white shadow-[0_1px_2px_rgba(27,28,30,0.04)] ${
      active ? 'border-brand-blue/40 ring-2 ring-brand-blue/10' : 'border-border-soft'
    }`}>
      <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-primary">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <Laptop className={`size-4 shrink-0 ${active ? 'text-brand-blue' : 'text-text-muted'}`} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[13px] font-semibold text-text-primary">{config.name}</h3>
            <p className="mt-0.5 text-[11px] text-text-muted">
              {builtIn ? t('demo.builtIn') : t('demo.savedAt', { date: formatDemoConfigurationDate(config.createdAt) })}
            </p>
          </div>
          <ChevronDown
            className={`size-4 shrink-0 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
        {builtIn ? (
          <button
            type="button"
            onClick={() => {
              const filename = exportBuiltInDemoEnvironmentForDeploy(config.id);
              if (!filename) return;
              const repoPath = DEPLOYABLE_PRESET_REPO_PATH[config.id] ?? '';
              setDeployHint(t('demo.exportDeployDone', { filename, path: repoPath }));
            }}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-brand-blue/10 hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
            aria-label={t('demo.exportDeployAria', { name: config.name })}
            title={t('demo.exportDeployAria', { name: config.name })}
          >
            <Download className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => deleteDemoConfiguration(config.id)}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-[#fff0ef] hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/30"
            aria-label={t('demo.deleteAria', { name: config.name })}
          >
            <Trash2 className="size-4" />
          </button>
        )}
        <Switch
          checked={active}
          onCheckedChange={(checked) => setActiveDemoConfiguration(checked ? config.id : null)}
          aria-label={t('demo.activeToggleAria', { name: config.name })}
        />
      </div>
      {deployHint ? (
        <p className="border-t border-border-soft bg-brand-blue/5 px-4 py-2 text-[11px] leading-snug text-brand-blue">
          {deployHint}
        </p>
      ) : null}
      {expanded ? (
        <div className="border-t border-border-soft px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
              {active ? t('demo.active') : t('demo.inactive')}
            </span>
            <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
              {config.settings.themeMode === 'light' ? t('branding.appearance.light') : t('branding.appearance.dark')}
            </span>
          </div>
          {config.description ? (
            <p className="mt-2 text-[12px] leading-snug text-text-secondary">{config.description}</p>
          ) : null}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <DemoSummaryItem
              label={t('demo.summary.branding')}
              value={config.settings.branding.productName || t('branding.productNameFallback')}
            />
            <DemoSummaryItem
              label={t('demo.summary.modules')}
              value={t('demo.summary.modulesValue', {
                enabled: enabledModules.length,
                total: MODULE_DEFS.length,
              })}
            />
            <DemoSummaryItem
              label={t('demo.summary.caseTypes')}
              value={
                config.settings.mode === 'single'
                  ? activeCaseType?.label ?? t('modules.cases.modeSummary.noActiveType')
                  : t('modules.cases.modeSummary.enabledTypes', {
                      enabled: enabledTypes.length,
                      total: config.settings.caseTypes.length,
                    })
              }
            />
            <DemoSummaryItem
              label={t('demo.summary.intelligence')}
              value={t('demo.summary.intelligenceValue', { enabled: aiEnabledCount, total: aiFlags.length })}
            />
            <DemoSummaryItem
              label="Data source"
              value={`${config.settings.dataSource?.activeDatasetId ?? 'multi-case-demo'} · ${config.settings.dataSource?.mode ?? 'mock'}`}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {enabledModules.map(({ id, icon: Icon }) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-surface-primary px-2 py-1 text-[10px] font-semibold text-text-secondary"
              >
                <Icon className="size-3" />
                {t(`modules.definitions.${id}.label` as never)}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function DemoSummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-primary px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-0.5 truncate text-[12px] font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function formatDemoConfigurationDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/* ─── Roles tab ─── */

function RolesTab() {
  const { t } = useTranslation('settings');
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-dashed border-border-soft bg-surface-primary p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-text-muted" />
          <h3 className="text-[13px] font-semibold text-text-secondary">{t('roles.comingSoon')}</h3>
        </div>
        <p className="mt-2 text-[12px] text-text-muted">{t('roles.intro')}</p>
      </div>

      <div className="flex flex-col gap-2 opacity-60">
        <RolePlaceholderRow roleKey="assessor" />
        <RolePlaceholderRow roleKey="manager" />
      </div>
    </div>
  );
}

function RolePlaceholderRow({ roleKey }: { roleKey: 'assessor' | 'manager' }) {
  const { t } = useTranslation('settings');
  const name = t(`roles.definitions.${roleKey}.name` as never);
  const description = t(`roles.definitions.${roleKey}.description` as never);
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-soft bg-white p-4">
      <div>
        <h4 className="text-[12px] font-semibold text-text-primary">{name}</h4>
        <p className="mt-1 text-[11px] text-text-secondary">{description}</p>
      </div>
      <Switch checked disabled aria-label={t('roles.rowAria', { name })} />
    </div>
  );
}
