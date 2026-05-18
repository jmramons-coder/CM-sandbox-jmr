import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Briefcase, MoreVertical, X } from 'lucide-react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { useCasesNav } from '../contexts/CasesNavContext';
import { filterDatasetBySettings, getSystemDataset, listCaseSummaries } from '../data/objectRepository';
import { useDataSourceSettings } from '../contexts/PlatformSettingsContext';
import { useResizableSidePanel } from '../hooks/useResizableSidePanel';
import { UI_CLASS } from '../constants/design-tokens';
import { getStatusLozengeType, getStatusShort } from '../utils/status-display';
import { LozengeTag } from './LozengeTag';
import {
  SidePanelResizeStrip,
  SidePanelToggle,
} from './WorkspaceSidePanelChrome';

export function CasesWorkspace() {
  const navigate = useNavigate();
  const location = useLocation();
  const { caseId } = useParams();
  const dataSource = useDataSourceSettings();
  const { openCases, addOpenCase, removeOpenCase, clearOpenCases } = useCasesNav();
  const [seenCases, setSeenCases] = useState<Set<string>>(() => new Set(openCases.map((c) => c.caseId)));
  const [openExpanded, setOpenExpanded] = useState(true);
  const {
    panelWidth,
    sidePanelOpen,
    setSidePanelOpen,
    isResizing,
    setIsResizing,
  } = useResizableSidePanel();
  const [openCasesMenuOpen, setOpenCasesMenuOpen] = useState(false);
  const openCasesMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (caseId) setSeenCases((prev) => { if (prev.has(caseId)) return prev; const next = new Set(prev); next.add(caseId); return next; });
  }, [caseId]);

  useEffect(() => {
    if (!openCasesMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = openCasesMenuRef.current;
      if (!el || el.contains(e.target as Node)) return;
      setOpenCasesMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenCasesMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [openCasesMenuOpen]);

  // Platform guide: ?guide=new-case-appears cycle. Lives here (not in CaseView)
  // because CasesWorkspace persists across case navigations.
  // Uses window.location (initial iframe URL) + mount-only effect so that
  // in-cycle navigate() calls don't re-trigger / cancel the loop.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('guide') !== 'new-case-appears') return;

    const cycleMs = 8000;
    const addAt = 1000;
    const navAt = 2800;
    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(() => { timers.delete(t); if (!cancelled) fn(); }, ms);
      timers.add(t);
    };
    const cycle = () => {
      removeOpenCase('CD44-6679812');
      navigate('/cases/CD26-5546112?guide=new-case-appears', { replace: true });
      schedule(() => addOpenCase('CD44-6679812'), addAt);
      schedule(() => navigate('/cases/CD44-6679812', { replace: true }), navAt);
      schedule(cycle, cycleMs);
    };
    cycle();
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summaryById = useMemo(() => {
    const dataset = filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource);
    return new Map(listCaseSummaries(dataset).map((item) => [item.id, item]));
  }, [dataSource]);

  const getCaseStatusShort = (id: string) => {
    const fullStatus = summaryById.get(id)?.status ?? 'Active';
    return getStatusShort(fullStatus);
  };

  const getCaseStatusLozengeType = (id: string) => {
    const fullStatus = summaryById.get(id)?.status ?? 'Open';
    return getStatusLozengeType(fullStatus, 'case');
  };

  return (
    <div className="relative flex h-full min-h-0 min-w-0 overflow-x-visible">
      <aside
        className={`relative flex min-h-0 shrink-0 flex-col overflow-x-visible ${UI_CLASS.workspaceTopLeftRadius} ${UI_CLASS.sidePanelBackground} ${sidePanelOpen ? 'z-10 border-r border-border-default' : 'z-0 min-w-0 border-0'}`}
        style={{ width: sidePanelOpen ? panelWidth : 0 }}
      >
        {sidePanelOpen ? (
          <>
        <div className="px-5 pb-2 pt-4">
          <div className="mb-3">
            <h2 className="text-3xl font-semibold text-text-primary">Cases</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/cases')}
            className={`flex w-full items-center gap-2.5 rounded-[8px] border px-2 py-2 text-left text-sm font-semibold ${
              location.pathname === '/cases'
                ? 'border-brand-blue/40 bg-white text-brand-blue'
                : 'border-transparent bg-transparent text-text-primary hover:bg-[#f8f9fa]'
            }`}
          >
            <Briefcase className="h-[18px] w-[18px] shrink-0 opacity-[0.92]" strokeWidth={1.75} aria-hidden />
            <span>All cases</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-3">
          <div className="flex w-full items-center gap-1 px-2 py-2">
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2.5 text-left text-[13px] font-medium text-[#878f9a]"
              onClick={() => setOpenExpanded((prev) => !prev)}
            >
              <span className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border border-[#b7bbc2] text-[13px] font-normal leading-none text-[#878f9a]">
                {openExpanded ? '−' : '+'}
              </span>
              <span>Open cases</span>
            </button>
            <div className="relative shrink-0" ref={openCasesMenuRef}>
              <button
                type="button"
                aria-expanded={openCasesMenuOpen}
                aria-haspopup="menu"
                aria-label="Open cases section menu"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenCasesMenuOpen((o) => !o);
                }}
                className={`inline-flex h-7 w-[22px] shrink-0 items-center justify-center rounded-[6px] transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/25 ${
                  openCasesMenuOpen ? 'bg-surface-muted text-brand-blue' : 'text-[#868F9B]'
                }`}
              >
                <MoreVertical className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
              {openCasesMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-[90] mt-1 min-w-[148px] rounded-[8px] border border-brand-navy/20 bg-white py-1 shadow-[0_4px_14px_var(--color-brand-blue-ring)]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
                    onClick={() => {
                      clearOpenCases();
                      setOpenCasesMenuOpen(false);
                      navigate('/cases');
                    }}
                  >
                    Remove all
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
                    onClick={() => {
                      setOpenExpanded(false);
                      setOpenCasesMenuOpen(false);
                    }}
                  >
                    Collapse section
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          {openExpanded && (
            <div className="mb-3 mt-1 space-y-1">
              {openCases.map((item) => {
                const active = caseId === item.caseId || location.pathname === `/cases/${item.caseId}`;
                return (
                  <div
                    key={item.caseId}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      addOpenCase(item.caseId);
                      navigate(`/cases/${item.caseId}`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        addOpenCase(item.caseId);
                        navigate(`/cases/${item.caseId}`);
                      }
                    }}
                    className={`group flex w-full cursor-pointer items-center gap-2 rounded-[8px] border px-2 py-1.5 text-left text-sm transition-colors ${
                      active
                        ? 'border-brand-blue-border bg-white text-brand-blue'
                        : 'border-transparent text-brand-navy hover:border-brand-blue-border hover:bg-surface-selected-alt'
                    }`}
                  >
                    <span
                      className={`h-[5px] w-[5px] shrink-0 rounded-full ${
                        !seenCases.has(item.caseId)
                          ? 'bg-brand-blue shadow-[0_0_0_2px_var(--color-brand-blue-ring)] animate-pulse'
                          : active ? 'bg-brand-blue' : 'bg-[#868F9B]'
                      }`}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {item.caseId} {item.primaryPartyName ?? item.claimant}
                    </span>
                    <div className="flex items-center gap-[5px]">
                      <LozengeTag
                        label={getCaseStatusShort(item.caseId)}
                        type={getCaseStatusLozengeType(item.caseId)}
                        subtle
                        className="shrink-0"
                      />
                    </div>
                    <button
                      type="button"
                      className="hidden shrink-0 rounded p-0.5 text-[#60666e] hover:bg-[#dbdee1] group-hover:inline-flex"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const isViewing = caseId === item.caseId || location.pathname === `/cases/${item.caseId}`;
                        removeOpenCase(item.caseId);
                        if (isViewing) navigate('/cases');
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <SidePanelResizeStrip isResizing={isResizing} onResizePointerDown={() => setIsResizing(true)} />
          </>
        ) : null}
      </aside>
      <SidePanelToggle
        open={sidePanelOpen}
        panelWidth={panelWidth}
        isResizing={isResizing}
        onToggle={() => {
          setIsResizing(false);
          setSidePanelOpen((prev) => !prev);
        }}
        ariaLabelOpen="Open cases panel"
        ariaLabelClose="Close cases panel"
      />

      <div className="relative z-0 min-w-0 flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
