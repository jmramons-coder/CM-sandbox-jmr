import { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { ChevronDown, FileText, Maximize2, Menu, MessageSquare, Pencil, Plus, Search } from 'lucide-react';
import { MobileNavDrawer } from './MobileNavDrawer';
import { MobileBottomNav, MOBILE_BOTTOM_NAV_CLEARANCE } from './MobileBottomNav';
import { AgentSearchOptionContent, CaseSearchOptionContent, InitialsAvatar } from './ds';
import { toAgentSummarySearchResult } from '../utils/agent-display';
import { toCaseSummarySearchResult } from '../utils/case-display';
import { useTranslation } from 'react-i18next';
import VerticalNav from './VerticalNav';
import { SimpleLogo } from './SimpleLogo';
import { UserMenu } from './UserMenu';
import { ProductGuideModal } from './ProductGuideModal';
import {
  AiCopilotDock,
} from './AiCopilotFooter';
import { AiCueSparkle } from './AiCueSparkle';
import { CasesNavProvider } from '../contexts/CasesNavContext';
import { GlobalCreateProvider } from '../contexts/GlobalCreateContext';
import { FoldersNavProvider } from '../contexts/FoldersNavContext';
import { CopilotProvider, useCopilot, newChatDefaultTitle, type ReplyHandler } from '../contexts/CopilotContext';
import { LiveContextProvider } from '../contexts/LiveContextProvider';
import { PlatformSettingsProvider, useBranding, useDataSourceSettings, usePlatformSettings, useThemeMode } from '../contexts/PlatformSettingsContext';
import { AppSwitcher } from './AppSwitcher';
import { getActiveApp } from '../domain/apps';
import { filterDatasetBySettings, getSystemDataset, listCaseSummaries } from '../data/objectRepository';
import { WorkspaceObjectSidePanel } from './WorkspaceObjectSidePanel';
import { getDefaultSidePanelWidth } from '../utils/sidepanel-width';

import { resolveBrandingLogoSrc } from '../utils/branding-logo';

import { buildAssistantReply } from '../domain/assistantReplyBuilder';
import type { LiveContext } from '../contexts/LiveContextProvider';
import { useViewportLayout } from '../hooks/useViewportLayout';
import { ViewportLayoutProvider } from '../contexts/ViewportLayoutContext';
import { ActiveUserProvider } from '../contexts/ActiveUserContext';
import { APP_EVENTS, STORAGE_KEYS } from '../constants/storage-keys';

function resolveCopilotContextId(context?: LiveContext): string | undefined {
  if (!context) return undefined;
  if (context.kind === 'caseDetail' || context.kind === 'caseTab' || context.kind === 'caseRequirement') {
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

/* ─── Inline editor for conversation title ─── */

function InlineTitleEditor({
  value,
  editing,
  onEditingChange,
  onCommit,
  className,
}: {
  value: string;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  onCommit: (next: string) => void;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    onEditingChange(false);
    if (next && next !== value) onCommit(next);
    else setDraft(value);
  };

  if (editing) {
    // Size the input to hug its content (draft length) instead of filling the row.
    const ch = Math.min(Math.max(draft.length + 1, 10), 42);
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            setDraft(value);
            onEditingChange(false);
          }
        }}
        style={{ width: `${ch}ch` }}
        className={`inline-block max-w-full min-w-0 rounded-md border border-brand-blue/40 bg-white px-1.5 py-0.5 text-[15px] font-semibold leading-tight tracking-tight text-text-heading outline-none focus:border-brand-blue ${
          className ?? ''
        }`}
      />
    );
  }

  return (
    <span
      className={`inline-block min-w-0 max-w-full truncate align-middle text-[15px] font-semibold leading-tight tracking-tight text-text-heading ${className ?? ''}`}
      title={value}
    >
      {value}
    </span>
  );
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

  const {
    isOpen: globalAIOpen,
    setIsOpen: setGlobalAIOpen,
    activeMessages,
    sendMessage,
    registerReplyHandler,
    sessions,
    activeSessionId,
    createSession,
    renameSession,
  } = useCopilot();
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId),
    [sessions, activeSessionId],
  );
  const activeSessionTitle = activeSession?.title || newChatDefaultTitle();
  const [renamingConversation, setRenamingConversation] = useState(false);

  const branding = useBranding();
  const dataSource = useDataSourceSettings();
  const activeDataset = useMemo(() => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource), [dataSource]);
  const themeMode = useThemeMode();
  const { settings: platformSettings, setAiActivityEnabled: setAiActivityEnabledCtx } =
    usePlatformSettings();
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
    const handler: ReplyHandler = (text, context) =>
      buildAssistantReply(activeDataset, text, resolveCopilotContextId(context));
    registerReplyHandler(handler);
  }, [activeDataset, registerReplyHandler]);

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
        <WorkspaceObjectSidePanel
          contexts={[{ id: 'assistant', label: activeSessionTitle, icon: MessageSquare }]}
          activeContextId="assistant"
          onChangeContext={() => undefined}
          onClose={() => setGlobalAIOpen(false)}
          panelWidth={globalAIWidth}
          onPanelWidthChange={setGlobalAIWidth}
          isResizing={globalAIResizing}
          onResizeStart={() => setGlobalAIResizing(true)}
          actions={
            <>
              <button
                type="button"
                onClick={() => createSession()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-default bg-white px-2.5 py-1 text-[11px] font-semibold text-text-secondary transition-colors hover:border-brand-blue hover:text-brand-blue"
                aria-label={t('aiPanel.newConversation')}
                title={t('aiPanel.newConversation')}
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                {t('aiPanel.newChat')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setGlobalAIOpen(false);
                  navigate('/copilot');
                }}
                className="shrink-0 rounded-full p-1.5 text-text-secondary hover:bg-surface-muted"
                aria-label={t('aiPanel.openFullPage')}
                title={t('aiPanel.openFullPage')}
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </>
          }
        >
          <div className="shrink-0 border-b border-[#ececec] bg-white px-5 pb-3 pt-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <AiCueSparkle size={16} className="!text-brand-accent" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                    {t('aiPanel.eyebrow')}
                  </span>
                </div>
                <div className="mt-1 flex min-w-0 items-center gap-1.5 pl-[24px]">
                  <InlineTitleEditor
                    value={activeSessionTitle}
                    editing={renamingConversation}
                    onEditingChange={setRenamingConversation}
                    onCommit={(next) => renameSession(activeSessionId, next)}
                  />
                  {renamingConversation ? null : (
                    <button
                      type="button"
                      onClick={() => setRenamingConversation(true)}
                      className="shrink-0 rounded-md p-1 text-[#a9aeb5] transition-colors hover:bg-surface-muted hover:text-text-secondary"
                      aria-label={t('aiPanel.renameConversation')}
                      title={t('aiPanel.renameConversation')}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <AiCopilotDock
            layout="panel"
            data={{ id: globalContextId }}
            messages={activeMessages}
            onSendMessage={sendMessage}
            aiPanelTab="workspace"
          />

        </WorkspaceObjectSidePanel>
      ) : null}
    </div>
    <ProductGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
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
