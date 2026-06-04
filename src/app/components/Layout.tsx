import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { ChevronDown, FileText, Menu, MessageSquare, Search } from 'lucide-react';
import { MobileNavDrawer } from './MobileNavDrawer';
import { MobileBottomNav, MOBILE_BOTTOM_NAV_CLEARANCE } from './MobileBottomNav';
import { AgentSearchOptionContent, AppToaster, CaseSearchOptionContent, InitialsAvatar } from './ds';
import { toAgentSummarySearchResult } from '../utils/agent-display';
import { toCaseSummarySearchResult } from '../utils/case-display';
import { useTranslation } from 'react-i18next';
import VerticalNav from './VerticalNav';
import { SimpleLogo } from './SimpleLogo';
import { UserMenu } from './UserMenu';
import { ProductGuideModal } from './ProductGuideModal';
import type { CopilotExecuteAction } from './AiCopilotFooter';
import { GlobalAiCopilotSidePanel } from './copilot/GlobalAiCopilotSidePanel';
import { setGlobalCopilotPanelOpenAttribute } from '../hooks/useCaseBriefCompanionPanelOpen';
import { AiCueSparkle } from './AiCueSparkle';
import { CasesNavProvider } from '../contexts/CasesNavContext';
import { GlobalCreateProvider } from '../contexts/GlobalCreateContext';
import { FoldersNavProvider } from '../contexts/FoldersNavContext';
import { CopilotProvider, useCopilot, newChatDefaultTitle, type ReplyHandler } from '../contexts/CopilotContext';
import { LiveContextProvider, useLiveContext } from '../contexts/LiveContextProvider';
import { PlatformSettingsProvider, useBranding, useDataSourceSettings, usePlatformSettings, useThemeMode } from '../contexts/PlatformSettingsContext';
import { AppSwitcher } from './AppSwitcher';
import { PresentationModeOverlay } from './presentation/PresentationModeOverlay';
import { getActiveApp } from '../domain/apps';
import { filterDatasetBySettings, getSystemDataset, listCaseSummaries } from '../data/objectRepository';
import { getDefaultSidePanelWidth } from '../utils/sidepanel-width';

import { resolveBrandingLogoSrc } from '../utils/branding-logo';

import { buildAssistantReply } from '../domain/assistantReplyBuilder';
import { buildCaseAssistantReply, buildCaseAssistantReplyForExecute } from '../domain/caseAssistantReplyBuilder';
import { extractCaseIdFromLiveContext, extractCaseIdFromPath } from '../domain/extractCaseIdFromContext';
import { resolveCaseCopilotContextFromCaseId } from '../domain/resolveCaseCopilotBriefInput';
import { useCaseContextBriefing } from '../hooks/useCaseContextBriefing';
import {
  approveNb66RequirementGatheringPackage,
  isNb66RecommendRequirementsTask,
} from '../data/nb66RequirementGatheringActions';
import { isEquisoftNb66GatheringDemo } from '../data/equisoftNb66ReqGatheringOverlay';
import { isTaskCompleteActionSuccess, runTaskWorkflowAction } from '../data/workflowActions';
import { appToast } from '../utils/app-toast';
import { useActiveUser, ActiveUserProvider } from '../contexts/ActiveUserContext';
import { APP_EVENTS, STORAGE_KEYS } from '../constants/storage-keys';
import type { LiveContext } from '../contexts/LiveContextProvider';
import { useViewportLayout } from '../hooks/useViewportLayout';
import { ViewportLayoutProvider } from '../contexts/ViewportLayoutContext';

function resolveCopilotContextId(context?: LiveContext): string | undefined {
  if (!context) return undefined;
  if (
    context.kind === 'caseDetail'
    || context.kind === 'caseTab'
    || context.kind === 'caseRequirement'
    || context.kind === 'caseTask'
  ) {
    const match = context.href.match(/\/cases\/([^/?#]+)/);
    if (match) return `case:${match[1]}`;
  }
  if (context.kind === 'taskDetail') {
    const match = context.href.match(/task=([^&]+)/);
    if (match) return `task:${decodeURIComponent(match[1])}`;
  }
  return undefined;
}

/* ─── Layout width helpers ─── */

const GLOBAL_AI_MIN_WIDTH = 400;
const GLOBAL_AI_MAX_FACTOR = 0.7;

function clampGlobalAiWidth(innerWidth: number, width: number): number {
  const max = Math.max(GLOBAL_AI_MIN_WIDTH, Math.floor(innerWidth * GLOBAL_AI_MAX_FACTOR));
  return Math.max(GLOBAL_AI_MIN_WIDTH, Math.min(width, max));
}

function HeaderGlobalSearch() {
  const navigate = useNavigate();
  const dataSource = useDataSourceSettings();
  const [scope, setScope] = useState<'all' | 'cases' | 'clients' | 'policies' | 'agents'>('cases');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scopeOptions = [
    { id: 'cases' as const, label: 'Cases' },
    { id: 'clients' as const, label: 'Clients' },
    { id: 'policies' as const, label: 'Policies' },
    { id: 'agents' as const, label: 'Agents' },
    { id: 'all' as const, label: 'All' },
  ];
  const activeScopeLabel = scopeOptions.find((option) => option.id === scope)?.label ?? 'Cases';

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const isRecent = !q;
    const activeDataset = filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource);
    const caseResults = scope === 'clients' || scope === 'policies' || scope === 'agents' ? [] : listCaseSummaries(activeDataset).filter((item) =>
        isRecent ||
        [
          item.id,
          item.title,
          item.caseTypeCode,
          item.priority,
          item.primaryPartyName ?? item.claimant,
          item.product,
          item.status,
          item.policyNumber,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
        .slice(0, scope === 'all' ? 3 : 6)
        .map((item) => toCaseSummarySearchResult(item));
    const clientResults = scope === 'cases' || scope === 'policies' || scope === 'agents' ? [] : activeDataset.clients.filter((item) =>
        isRecent ||
        [item.id, item.name, item.profile?.email, item.profile?.phone, item.profile?.dob, item.profile?.address, item.profile?.parish, item.taxId]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
        .slice(0, scope === 'all' ? 3 : 6)
        .map((item) => ({
          id: `client-${item.id}`,
          type: 'Client' as const,
          title: item.name,
          subtitle: `${item.category ?? item.type} · ${item.status ?? 'active'}`,
          href: `/folders/${item.id}`,
        }));
    const policyResults = scope === 'cases' || scope === 'clients' || scope === 'agents' ? [] : activeDataset.policies
      .filter((item) =>
        isRecent ||
        [item.id, item.label, item.status, item.product, item.policyNumber]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
      .slice(0, scope === 'all' ? 3 : 6)
      .map((item) => ({
        id: `policy-${item.id}`,
        type: 'Policy' as const,
        title: item.label,
        subtitle: `${item.product} · ${item.status}`,
        href: `/folders/${item.id}`,
      }));
    const agentResults = scope === 'cases' || scope === 'clients' || scope === 'policies' ? [] : activeDataset.agents
      .filter((item) =>
        isRecent ||
        [item.id, item.name, item.status, item.agencyName, item.email, item.producerCode]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
      .slice(0, scope === 'all' ? 3 : 6)
      .map((item) => toAgentSummarySearchResult(item));
    return [...caseResults, ...clientResults, ...policyResults, ...agentResults].slice(0, 8);
  }, [dataSource, query, scope]);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setScopeOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    setScopeOpen(false);
    setQuery('');
    navigate(href);
  };

  return (
    <div ref={containerRef} className="absolute left-1/2 top-1/2 z-[1000] hidden w-[min(700px,52vw)] -translate-x-1/2 -translate-y-1/2 lg:block">
      <div className="flex h-8 items-center gap-2">
        <div className="relative w-[150px] shrink-0">
          <button
            type="button"
            onClick={() => {
              setScopeOpen((prev) => !prev);
              setOpen(false);
            }}
            className="flex h-8 w-full items-center justify-between rounded-[8px] border border-white/20 bg-white px-3 text-[13px] font-medium text-text-primary shadow-sm"
          >
            {activeScopeLabel}
            <ChevronDown className="size-4 text-text-secondary" />
          </button>
          {scopeOpen ? (
            <div className="absolute left-0 right-0 top-full z-[1001] mt-1 overflow-hidden rounded-xl border border-border-default bg-white py-1 shadow-[0_12px_28px_rgba(27,28,30,0.18)]">
              {scopeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setScope(option.id);
                    setScopeOpen(false);
                    setOpen(true);
                  }}
                  className={`block w-full px-3 py-2 text-left text-[13px] transition-colors hover:bg-surface-muted ${
                    scope === option.id ? 'font-semibold text-brand-blue' : 'text-text-primary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setScopeOpen(false);
              setOpen(true);
            }}
            onFocus={() => {
              setScopeOpen(false);
              setOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && results[0]) {
                const first = results[0];
                handleSelect(first.href);
              }
              if (event.key === 'Escape') {
                setOpen(false);
                setScopeOpen(false);
              }
            }}
            placeholder={`Search ${activeScopeLabel.toLowerCase()}...`}
            className="h-8 w-full rounded-[8px] border border-white/20 bg-white pl-3 pr-10 text-[13px] text-text-primary shadow-sm outline-none placeholder:text-text-placeholder focus:border-white/50"
          />
          {open ? (
        <div className="absolute left-0 right-0 top-full z-[1001] mt-2 max-h-[min(420px,60vh)] overflow-y-auto rounded-xl border border-border-default bg-white py-1.5 text-text-primary shadow-[0_12px_28px_rgba(27,28,30,0.18)]">
          {!query.trim() ? (
            <div className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.35px] text-text-muted">
              Recent {activeScopeLabel.toLowerCase()}
            </div>
          ) : null}
          {results.length > 0 ? (
            results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.href)}
                  className={`flex w-full items-center gap-3 text-left transition-colors hover:bg-surface-hover ${
                    item.type === 'Case' ? 'px-4 py-3' : 'px-3 py-2.5 hover:bg-surface-muted'
                  }`}
                >
                  {item.type === 'Case' ? (
                    <CaseSearchOptionContent
                      caseId={item.caseId}
                      caseTypeLine={item.caseTypeLine}
                      status={item.status}
                    />
                  ) : item.type === 'Agent' ? (
                    <>
                      <InitialsAvatar name={item.name} seed={item.agentId} size="sm" />
                      <AgentSearchOptionContent
                        name={item.name}
                        agency={item.agency}
                        email={item.email}
                        status={item.status}
                        titleClassName="truncate text-[13px] font-semibold text-text-primary"
                      />
                      <span className="shrink-0 text-[10px] font-semibold text-text-muted/70">{item.agentId}</span>
                    </>
                  ) : item.type === 'Client' ? (
                    <>
                      <InitialsAvatar name={item.title} seed={item.id} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-semibold text-text-primary">{item.title}</span>
                          <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[9px] font-semibold text-text-muted">
                            {item.type}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-text-secondary">{item.subtitle}</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text-secondary">
                        <FileText className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-semibold text-text-primary">{item.title}</span>
                          <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[9px] font-semibold text-text-muted">
                            {item.type}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-text-secondary">{item.subtitle}</span>
                      </span>
                    </>
                  )}
                </button>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-[12px] text-text-muted">No matching cases or clients.</div>
          )}
        </div>
      ) : null}
        </div>
      </div>
    </div>
  );
}

function splitProductName(productName: string) {
  const clean = productName.trim() || 'Amplify Case Management';
  const [first, ...rest] = clean.split(/\s+/);
  return {
    first,
    second: rest.join(' '),
  };
}

/* ─── Inner layout (consumes CopilotContext) ─── */

function LayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('nav');
  const [guideOpen, setGuideOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [globalAIWidth, setGlobalAIWidth] = useState(() => getDefaultSidePanelWidth({ min: 480 }));
  const [globalAIResizing, setGlobalAIResizing] = useState(false);
  const [caseBriefIntroReplayKey, setCaseBriefIntroReplayKey] = useState(0);
  const globalAiWasOpenRef = useRef(false);

  const {
    isOpen: globalAIOpen,
    setIsOpen: setGlobalAIOpen,
    activeMessages,
    sendMessage,
    registerReplyHandler,
    registerSideEffectHandler,
    sessions,
    activeSessionId,
    createSession,
    renameSession,
    appendTurns,
    patchSessionForTaskOutcome,
  } = useCopilot();
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId),
    [sessions, activeSessionId],
  );
  const activeSessionTitle = activeSession?.title || newChatDefaultTitle();
  const branding = useBranding();
  const dataSource = useDataSourceSettings();
  const activeDataset = useMemo(() => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource), [dataSource]);
  const themeMode = useThemeMode();
  const { settings: platformSettings, setAiActivityEnabled: setAiActivityEnabledCtx, updateDataSource } =
    usePlatformSettings();
  const { profile } = useActiveUser();
  const { current: liveContext } = useLiveContext();
  const hashParams = useMemo(
    () => new URLSearchParams(location.hash.startsWith('#') ? location.hash.slice(1) : location.hash),
    [location.hash],
  );

  const { caseId: briefingCaseId, isCaseContext, copilotContext, syncBriefing } = useCaseContextBriefing({
    greetingName: profile.name,
    dataset: activeDataset,
    anatomy: platformSettings.anatomy,
    enabledObjectDomains: dataSource.enabledObjectDomains,
    legacyMockOverlayEnabled: dataSource.legacyMockOverlayEnabled,
    selectedTaskId: hashParams.get('task'),
    selectedRequirementId: hashParams.get('req'),
    enabled: globalAIOpen,
  });

  useEffect(() => {
    const open = globalAIOpen && isCaseContext && Boolean(briefingCaseId);
    setGlobalCopilotPanelOpenAttribute(open);
    return () => setGlobalCopilotPanelOpenAttribute(false);
  }, [globalAIOpen, isCaseContext, briefingCaseId]);

  useEffect(() => {
    if (globalAIOpen && !globalAiWasOpenRef.current && isCaseContext && briefingCaseId) {
      const hasCaseBrief = activeMessages.some(
        (message) =>
          message.artifact?.kind === 'case-brief' && message.artifact.caseId === briefingCaseId,
      );
      if (!hasCaseBrief) {
        setCaseBriefIntroReplayKey((key) => key + 1);
      }
    }
    globalAiWasOpenRef.current = globalAIOpen;
  }, [globalAIOpen, isCaseContext, briefingCaseId, activeMessages]);

  const resolveCaseContext = useCallback(
    (context?: LiveContext) => {
      const caseId = extractCaseIdFromLiveContext(context) ?? extractCaseIdFromPath(location.pathname);
      if (!caseId) return null;
      return resolveCaseCopilotContextFromCaseId(caseId, {
        greetingName: profile.name,
        dataset: activeDataset,
        anatomy: platformSettings.anatomy,
        enabledObjectDomains: dataSource.enabledObjectDomains,
        legacyMockOverlayEnabled: dataSource.legacyMockOverlayEnabled,
        selectedTaskId: hashParams.get('task'),
        selectedRequirementId: hashParams.get('req'),
      });
    },
    [
      activeDataset,
      dataSource.enabledObjectDomains,
      dataSource.legacyMockOverlayEnabled,
      hashParams,
      location.pathname,
      platformSettings.anatomy,
      profile.name,
    ],
  );

  const applyCopilotTaskAction = useCallback(
    (effect: { taskId: string; actionType: 'complete' | 'request_info' }): string | null => {
      const result = runTaskWorkflowAction(
        dataSource.activeDatasetId,
        effect.taskId,
        effect.actionType,
        { name: profile.name },
      );
      if (!result) return null;
      if (effect.actionType === 'complete' && !isTaskCompleteActionSuccess(result, effect.taskId)) {
        return null;
      }
      if (effect.actionType === 'request_info' && !result.record.task) {
        return null;
      }
      updateDataSource({ activeDatasetId: result.datasetId });
      return result.datasetId;
    },
    [dataSource.activeDatasetId, profile.name, updateDataSource],
  );
  const headerLogoSrc =
    branding.logoMode === 'custom'
      ? resolveBrandingLogoSrc(
          themeMode === 'light' ? branding.logoLightDataUrl : branding.logoDarkDataUrl,
        )
      : undefined;
  const headerLogoTextFill = themeMode === 'light' ? '#1b1c1e' : '#ffffff';
  const activeApp = getActiveApp(location.pathname);
  const { isCompactShell } = useViewportLayout();
  const isFolderCreationForm = location.pathname.startsWith('/folders/') && location.pathname.endsWith('/add');
  const aiActivityEnabled = platformSettings.preferences.aiActivityEnabled;
  const aiSidePanelEnabled = platformSettings.preferences.aiSidePanelEnabled !== false;

  /* Keep legacy sessionStorage key in sync so existing listeners (CaseView, toasts) still
   * work regardless of whether the toggle was flipped in the sidebar or in the modal. */
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.aiActivityEnabled, aiActivityEnabled ? '1' : '0');
    } catch {
      /* */
    }
    try {
      window.dispatchEvent(new Event(APP_EVENTS.aiActivityToggle));
    } catch {
      /* */
    }
  }, [aiActivityEnabled]);

  useEffect(() => {
    try { sessionStorage.removeItem(STORAGE_KEYS.billyPostApproval); } catch { /* */ }
  }, []);

  useEffect(() => {
    const handler: ReplyHandler = (text, context) => {
      const caseCtx = resolveCaseContext(context);
      if (caseCtx) {
        const caseReply = buildCaseAssistantReply(activeDataset, text, caseCtx);
        if (caseReply) return caseReply;
      }
      return buildAssistantReply(activeDataset, text, resolveCopilotContextId(context));
    };
    registerReplyHandler(handler);
  }, [activeDataset, registerReplyHandler, resolveCaseContext]);

  useEffect(() => {
    registerSideEffectHandler((effect) => {
      const datasetId = applyCopilotTaskAction(effect);
      if (!datasetId) {
        const taskLabel =
          copilotContext?.focus.kind === 'task' && copilotContext.focus.task.id === effect.taskId
            ? copilotContext.focus.task.taskType
            : effect.taskId;
        appToast.error(
          effect.actionType === 'complete'
            ? `Could not approve ${taskLabel}. Try again.`
            : `Could not record amend on ${taskLabel}. Try again.`,
        );
        return false;
      }
      patchSessionForTaskOutcome(
        activeSessionId,
        effect.taskId,
        effect.actionType === 'complete' ? 'accepted' : 'amended',
      );
      const taskLabel =
        copilotContext?.focus.kind === 'task' && copilotContext.focus.task.id === effect.taskId
          ? copilotContext.focus.task.taskType
          : effect.taskId;
      appToast.success(
        effect.actionType === 'complete'
          ? `Task ${taskLabel} approved`
          : `Amend recorded on ${taskLabel}`,
      );
      return true;
    });
    return () => registerSideEffectHandler(null);
  }, [activeSessionId, applyCopilotTaskAction, copilotContext, patchSessionForTaskOutcome, registerSideEffectHandler]);

  const handleCopilotExecute = useCallback(
    (action: CopilotExecuteAction) => {
      if (action.kind === 'apply_requirement_suggestions') {
        if (!isEquisoftNb66GatheringDemo(action.caseId)) {
          appToast.error('Requirement suggestions are only available for the NB66 Equisoft demo case.');
          return;
        }
        const result = approveNb66RequirementGatheringPackage(
          dataSource.activeDatasetId,
          action.caseId,
          action.taskId,
          action.requirementIds,
          { name: profile.name },
          platformSettings.activeDemoConfigurationId,
        );
        if (!result) {
          appToast.error('Could not approve requirement package. Try again.');
          return;
        }
        updateDataSource({ activeDatasetId: result.datasetId });
        const added = result.addedCount;
        appToast.success(
          added === 1
            ? `1 requirement added to ${action.caseId}`
            : `${added} requirements added to ${action.caseId}`,
        );
        const now = Date.now();
        appendTurns(activeSessionId, [
          {
            id: `u-${now}`,
            role: 'user',
            text: `Approve ${added} selected requirement${added === 1 ? '' : 's'}`,
            at: now,
            context: liveContext,
          },
          {
            id: `a-${now + 1}`,
            role: 'assistant',
            text: `**${added}** requirement${added === 1 ? '' : 's'} added to **${action.caseId}**. Open the Requirements tab to track fulfillment.`,
            at: now + 1,
            followUps: ['Which requirements are still open?', 'What is the next task on this case?'],
            revealIntro: true,
          },
        ]);
        return;
      }

      if (action.kind !== 'task') return;

      if (
        action.actionType === 'complete' &&
        isNb66RecommendRequirementsTask(action.taskId)
      ) {
        const reply = copilotContext
          ? buildCaseAssistantReplyForExecute(copilotContext, action.actionType, action.taskId)
          : null;
        const now = Date.now();
        appendTurns(activeSessionId, [
          {
            id: `u-${now}`,
            role: 'user',
            text: 'Accept AI recommend-requirements task',
            at: now,
            context: liveContext,
          },
          {
            id: `a-${now + 1}`,
            role: 'assistant',
            text: reply?.text ?? '',
            at: now + 1,
            followUps: reply?.followUps,
          },
        ]);
        return;
      }

      const effect = { taskId: action.taskId, actionType: action.actionType };
      const taskLabel =
        copilotContext?.focus.kind === 'task' &&
        (copilotContext.focus.task.id === action.taskId ||
          copilotContext.focus.task.taskId === action.taskId)
          ? copilotContext.focus.task.taskType
          : (copilotContext?.tasks.find((row) => row.id === action.taskId)?.label ?? action.taskId);

      const refreshedDatasetId = applyCopilotTaskAction(effect);
      if (!refreshedDatasetId) {
        appToast.error(
          action.actionType === 'complete'
            ? `Could not approve ${taskLabel}. Try again.`
            : `Could not record amend on ${taskLabel}. Try again.`,
        );
        return;
      }

      patchSessionForTaskOutcome(
        activeSessionId,
        action.taskId,
        action.actionType === 'complete' ? 'accepted' : 'amended',
      );

      appToast.success(
        action.actionType === 'complete'
          ? `Task ${taskLabel} approved`
          : `Amend recorded on ${taskLabel}`,
      );

      const reply = copilotContext
        ? buildCaseAssistantReplyForExecute(copilotContext, action.actionType, action.taskId)
        : {
            text:
              action.actionType === 'complete'
                ? `**Done** — **${taskLabel}** is marked complete.`
                : `**Amend recorded** — ${taskLabel}.`,
            followUps: ['What is the next task on this case?', 'Which requirements are still open?'],
          };

      const userText = action.actionType === 'complete' ? `Accept ${taskLabel}` : `Amend ${taskLabel}`;
      const now = Date.now();
      appendTurns(activeSessionId, [
        { id: `u-${now}`, role: 'user', text: userText, at: now, context: liveContext },
        {
          id: `a-${now + 1}`,
          role: 'assistant',
          text: reply?.text ?? '',
          at: now + 1,
          artifact: reply?.artifact,
          followUps: reply?.followUps,
          revealIntro: Boolean(reply?.artifact && reply.artifact.kind !== 'case-brief'),
        },
      ]);
    },
    [
      activeSessionId,
      appendTurns,
      applyCopilotTaskAction,
      copilotContext,
      dataSource.activeDatasetId,
      liveContext,
      patchSessionForTaskOutcome,
      updateDataSource,
    ],
  );

  const handleCreateSession = useCallback(() => {
    createSession();
    window.setTimeout(() => syncBriefing(), 0);
  }, [createSession, syncBriefing]);

  useEffect(() => {
    if (!globalAIResizing) return;
    const onMove = (e: MouseEvent) => {
      const next = window.innerWidth - e.clientX;
      setGlobalAIWidth(clampGlobalAiWidth(window.innerWidth, next));
    };
    const onUp = () => setGlobalAIResizing(false);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [globalAIResizing]);

  useEffect(() => {
    const onResize = () => setGlobalAIWidth((w) => clampGlobalAiWidth(window.innerWidth, w));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isOnCopilotModule = location.pathname.startsWith('/copilot');

  const globalContextId = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const maybeCaseId = parts[1];
    if (parts[0] === 'cases' && maybeCaseId) return maybeCaseId.toUpperCase();
    return 'GLOBAL-WORKSPACE';
  }, [location.pathname]);
  const productNameParts = useMemo(() => splitProductName(branding.productName), [branding.productName]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div className="flex h-screen min-h-0 min-w-0 w-full max-w-full flex-col overflow-x-clip" style={{ backgroundColor: 'var(--brand-header)' }}>
      <header
        className={`flex h-[48px] shrink-0 items-center gap-2 px-3 isolate relative z-[1000] lg:justify-between lg:gap-0 lg:px-4 ${themeMode === 'dark' ? 'shadow-[0_2px_4px_rgba(0,0,0,0.10),0_6px_20px_rgba(0,0,0,0.08)]' : ''}`}
        style={{ backgroundColor: 'var(--brand-header)', color: 'var(--brand-on-header)' }}
      >
        <div className="flex min-w-0 items-center gap-2">
          {activeApp.id !== 'eapp' ? (
            <button
              type="button"
              className={`inline-flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-lg lg:hidden ${themeMode === 'light' ? 'hover:bg-black/[0.06]' : 'hover:bg-white/10'}`}
              aria-label={t('mobileNav.openMenu')}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
          ) : null}
          <div className="flex min-w-0 items-end gap-2">
            {headerLogoSrc ? (
              <img
                src={headerLogoSrc}
                alt={branding.productName}
                className="h-[26px] max-w-[100px] object-contain lg:h-[28px] lg:max-w-[120px]"
              />
            ) : (
              <SimpleLogo className="h-[26px] w-[80px] lg:h-[28px] lg:w-[90px]" textFill={headerLogoTextFill} />
            )}
            {branding.showProductName ? (
              <span className="mb-[1px] hidden flex-col items-start text-left leading-[0.95] opacity-85 lg:flex">
                <span className="text-[11px] font-semibold">{productNameParts.first}</span>
                {productNameParts.second ? (
                  <span className="text-[11px] font-medium">{productNameParts.second}</span>
                ) : null}
              </span>
            ) : null}
          </div>
        </div>

        <HeaderGlobalSearch />

        <div className="ml-auto flex h-full shrink-0 items-center gap-2 lg:gap-4">
          {aiSidePanelEnabled && (
            <div className="content-stretch flex gap-[8px] items-center relative shrink-0">

              <div className="relative shrink-0">
                <div className="flex flex-row items-center justify-center size-full">
                  <div className="content-stretch flex items-center justify-center relative">
                      <button
                      title={t('header.openAssistant')}
                      data-keep-sidepanel="trigger"
                      onClick={() => {
                        if (isOnCopilotModule) return;
                        if (globalAIOpen) {
                          setGlobalAIOpen(false);
                          return;
                        }
                        const detail = { handled: false };
                        window.dispatchEvent(new CustomEvent(APP_EVENTS.openSidePanelContext, { detail }));
                        if (detail.handled) return;
                        setGlobalAIOpen(true);
                      }}
                      className={`relative rounded-[9999px] shrink-0 transition-colors ${
                        themeMode === 'light' ? 'hover:bg-black/[0.06]' : 'hover:bg-white/10'
                      } ${
                        globalAIOpen || isOnCopilotModule
                          ? themeMode === 'light' ? 'bg-black/[0.08]' : 'bg-white/[0.16]'
                          : ''
                      }`}
                    >
                      <div aria-hidden="true" className="absolute border border-transparent border-solid inset-0 pointer-events-none rounded-[9999px]" />
                      <div className="flex flex-row items-center justify-center size-full">
                        <div className="content-stretch flex items-center justify-center relative p-[8px]">
                          <div className="relative">
                            <MessageSquare className="h-4 w-4" />
                            <span
                              className="absolute -right-[11px] -top-[11px] flex h-[14px] w-[14px] items-center justify-center rounded-full bg-brand-accent"
                              style={{ boxShadow: `0 0 0 1.5px var(--brand-header)` }}
                            >
                              <AiCueSparkle size={9} className="!text-white" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          <div
            className="hidden h-[16px] w-px shrink-0 opacity-25 lg:block"
            style={{ backgroundColor: 'var(--brand-on-header)' }}
          />

          <div className="relative flex shrink-0 items-center">
            <UserMenu />
          </div>

          <div className="hidden lg:block">
            <AppSwitcher />
          </div>
        </div>
      </header>

      <div className={`flex min-h-0 min-w-0 flex-1 overflow-hidden ${themeMode === 'light' ? 'bg-[#f5f5f7]' : ''}`}>
        {/* Hide the vertical nav when inside an eApp form instance (full-page form). */}
        {activeApp.id !== 'eapp' ? (
          <aside className="relative hidden w-[96px] shrink-0 lg:block">
            {themeMode === 'light' ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-[-16px] top-0 z-0 size-4 bg-surface-primary"
              />
            ) : null}
            <VerticalNav
              onOpenGuide={() => setGuideOpen(true)}
              aiActivityEnabled={aiActivityEnabled}
              onToggleAiActivity={() => {
                const next = !aiActivityEnabled;
                setAiActivityEnabledCtx(next);
                window.dispatchEvent(new Event(APP_EVENTS.aiActivityToggle));
              }}
            />
          </aside>
        ) : null}

        <main
          className={`relative z-10 min-h-0 min-w-0 w-full max-w-full flex-1 overflow-hidden ${themeMode === 'light' ? `${isFolderCreationForm ? '' : 'rounded-tl-[16px] max-lg:rounded-tl-none'} border-l border-t border-border-default bg-surface-primary shadow-[0_-2px_6px_rgba(0,0,0,0.04)] max-lg:border-l-0` : ''}`}
        >
          <div
            className="h-full min-h-0"
            style={
              activeApp.id !== 'eapp' && isCompactShell
                ? { paddingBottom: MOBILE_BOTTOM_NAV_CLEARANCE }
                : undefined
            }
          >
            <Outlet />
          </div>
        </main>
      </div>
      {activeApp.id !== 'eapp' ? (
        <MobileNavDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)}>
          <VerticalNav
            variant="drawer"
            onNavigate={() => setMobileNavOpen(false)}
            onOpenGuide={() => {
              setMobileNavOpen(false);
              setGuideOpen(true);
            }}
            aiActivityEnabled={aiActivityEnabled}
            onToggleAiActivity={() => {
              const next = !aiActivityEnabled;
              setAiActivityEnabledCtx(next);
              window.dispatchEvent(new Event(APP_EVENTS.aiActivityToggle));
            }}
          />
        </MobileNavDrawer>
      ) : null}
      {activeApp.id !== 'eapp' ? <MobileBottomNav /> : null}
      {globalAIOpen && !isOnCopilotModule && aiSidePanelEnabled ? (
        <GlobalAiCopilotSidePanel
          briefingCaseId={briefingCaseId}
          isCaseContext={isCaseContext}
          panelWidth={globalAIWidth}
          isResizing={globalAIResizing}
          onPanelWidthChange={setGlobalAIWidth}
          onResizeStart={() => setGlobalAIResizing(true)}
          onClose={() => setGlobalAIOpen(false)}
          activeSessionTitle={activeSessionTitle}
          activeSessionId={activeSessionId}
          onRenameSession={renameSession}
          onCreateSession={handleCreateSession}
          globalContextId={globalContextId}
          messages={activeMessages}
          onSendMessage={sendMessage}
          onExecuteAction={isCaseContext ? handleCopilotExecute : undefined}
          caseBriefIntroReplayKey={caseBriefIntroReplayKey}
        />
      ) : null}
    </div>
    <ProductGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    <AppToaster />
    <PresentationModeOverlay />
    </>
  );
}

/* ─── Exported Layout with providers ─── */

export function Layout() {
  return (
    <ViewportLayoutProvider>
    <ActiveUserProvider>
    <PlatformSettingsProvider>
    <CasesNavProvider>
    <GlobalCreateProvider>
    <FoldersNavProvider>
    <CopilotProvider>
      <LiveContextProvider>
        <LayoutInner />
      </LiveContextProvider>
    </CopilotProvider>
    </FoldersNavProvider>
    </GlobalCreateProvider>
    </CasesNavProvider>
    </PlatformSettingsProvider>
    </ActiveUserProvider>
    </ViewportLayoutProvider>
  );
}
