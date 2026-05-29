import { useState, type ComponentType, type SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Briefcase,
  ChevronDown,
  Download,
  FileText,
  FolderOpen,
  HandCoins,
  Home,
  Inbox,
  Lightbulb,
  MessageSquare,
  Sliders,
  Trash2,
  Users,
} from 'lucide-react';
import { AiCueSparkle } from '../AiCueSparkle';
import { BrandingHeaderPreview } from '../BrandingHeaderPreview';
import { Switch } from '../ui/switch';
import {
  usePlatformSettings,
  type ModuleId,
  type SavedDemoConfiguration,
} from '../../contexts/PlatformSettingsContext';
import { DATA_ADAPTER_CONTRACTS } from '../../data/dataAdapters';
import { DEPLOYABLE_PRESET_REPO_PATH } from '../../data/demo-environment-deploy';
import { isBuiltInDemoEnvironment } from '../../data/demo-environment-presets';
import { datasetRegistry } from '../../data/datasetRegistry';
import { DEFAULT_DATASET_ID } from '../../domain/objectRefs';

function AiCueSparkleTabIcon({ className }: { className?: string }) {
  return <AiCueSparkle className={className} size={16} />;
}

type ModuleMeta = {
  id: ModuleId;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;
};

const DEMO_MODULE_DEFS: ModuleMeta[] = [
  { id: 'home', icon: Home },
  { id: 'cases', icon: Briefcase },
  { id: 'folders', icon: FolderOpen },
  { id: 'finances', icon: HandCoins },
  { id: 'users', icon: Users },
  { id: 'tasks', icon: Sliders },
  { id: 'requests', icon: Inbox },
  { id: 'documents', icon: FileText },
  { id: 'aiActions', icon: AiCueSparkleTabIcon },
  { id: 'insights', icon: Lightbulb },
  { id: 'reports', icon: BarChart3 },
  { id: 'copilot', icon: MessageSquare },
];

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
  const enabledModules = DEMO_MODULE_DEFS.filter(({ id }) => config.settings.modules[id] !== false);
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
  const branding = config.settings.branding;
  const themeMode = config.settings.themeMode;
  const headerBackground = themeMode === 'light' ? '#ffffff' : branding.headerColor;
  const headerForeground = themeMode === 'light' ? '#1b1c1e' : branding.onHeaderColor;

  return (
    <article className={`overflow-hidden rounded-lg border bg-white shadow-[0_1px_2px_rgba(27,28,30,0.04)] ${
      active ? 'border-brand-blue/40 ring-2 ring-brand-blue/10' : 'border-border-soft'
    }`}>
      <div
        className="relative flex min-h-[56px] items-stretch"
        style={{ backgroundColor: headerBackground, color: headerForeground }}
      >
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center px-4 py-3 text-left"
        >
          <BrandingHeaderPreview
            branding={branding}
            themeMode={themeMode}
            showColorChips={false}
            variant="demo-card"
            className="min-w-0 flex-1"
          />
        </button>
        <div className="flex shrink-0 items-center self-center px-3 py-2">
          <div className="flex items-center gap-0.5 rounded-full border border-border-default/70 bg-white px-1.5 py-1 shadow-[0_2px_10px_rgba(27,28,30,0.10)]">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-muted hover:text-text-secondary"
            >
              <ChevronDown
                className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
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
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-brand-blue/10 hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
                aria-label={t('demo.exportDeployAria', { name: config.name })}
                title={t('demo.exportDeployAria', { name: config.name })}
              >
                <Download className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => deleteDemoConfiguration(config.id)}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-[#fff0ef] hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/30"
                aria-label={t('demo.deleteAria', { name: config.name })}
              >
                <Trash2 className="size-4" />
              </button>
            )}
            <div className="px-0.5" onClick={(event) => event.stopPropagation()}>
              <Switch
                checked={active}
                onCheckedChange={(checked) => setActiveDemoConfiguration(checked ? config.id : null)}
                aria-label={t('demo.activeToggleAria', { name: config.name })}
              />
            </div>
          </div>
        </div>
      </div>
      {deployHint ? (
        <p className="border-t border-border-soft bg-brand-blue/5 px-4 py-2 text-[11px] leading-snug text-brand-blue">
          {deployHint}
        </p>
      ) : null}
      {expanded ? (
        <div className="border-t border-border-soft px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
              {active ? t('demo.active') : t('demo.inactive')}
            </span>
            <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
              {config.settings.themeMode === 'light' ? t('branding.appearance.light') : t('branding.appearance.dark')}
            </span>
            {!builtIn ? (
              <span className="text-[11px] text-text-muted">
                {t('demo.savedAt', { date: formatDemoConfigurationDate(config.createdAt) })}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[12px] font-semibold text-text-primary">{config.name}</p>
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
                total: DEMO_MODULE_DEFS.length,
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
              value={`${config.settings.dataSource?.activeDatasetId ?? DEFAULT_DATASET_ID} · ${config.settings.dataSource?.mode ?? 'mock'}`}
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

export function DemoConfigurationTab() {
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
      <div className="flex flex-col gap-3">
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
