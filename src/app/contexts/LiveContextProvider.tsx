import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import { useLocation } from 'react-router';
import {
  Briefcase,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Folder,
  FolderOpen,
  LayoutDashboard,
  ListTodo,
  type LucideIcon,
} from 'lucide-react';
import { useCopilot } from './CopilotContext';
import { AiCueSparkle } from '../components/AiCueSparkle';

/* ─── Types ─── */

export type LiveContextKind =
  | 'dashboard'
  | 'tasks'
  | 'taskDetail'
  | 'cases'
  | 'caseDetail'
  | 'caseTab'
  | 'caseRequirement'
  | 'caseTask'
  | 'requests'
  | 'requestDetail'
  | 'documents'
  | 'documentDetail'
  | 'aiAction'
  | 'folders'
  | 'folderDetail'
  | 'folderCase'
  | 'copilot'
  | 'other';

export type LiveContext = {
  /** Stable identity for dedupe and as React key. */
  id: string;
  kind: LiveContextKind;
  /** Icon component for visual chips. */
  icon: ComponentType<{ className?: string; strokeWidth?: number | string }> | LucideIcon;
  /** Crumb segments, e.g. ["Cases", "IP26-5546200", "Requirements"]. */
  crumbs: string[];
  /** Short label for the pill (truncated as needed). */
  label: string;
  /** Navigation target for "go back there". */
  href: string;
  enteredAt: number;
};

export type LiveContextOverlay = Omit<LiveContext, 'enteredAt'>;

type LiveContextValue = {
  /** The currently active context (top overlay or route-derived). */
  current: LiveContext;
  /** Route-only context (no overlays applied). */
  routeContext: LiveContext;
  /** Per-session deduped history (most recent first). */
  sessionHistory: LiveContext[];
  /** Imperative subscriber for Copilot to read current context at sendMessage time. */
  getCurrentContext: () => LiveContext;
};

const LiveContextCtx = createContext<LiveContextValue | null>(null);

type OverlayRegistryValue = {
  register: (key: string, overlay: LiveContextOverlay) => void;
  unregister: (key: string) => void;
};

const OverlayRegistryCtx = createContext<OverlayRegistryValue | null>(null);

/* ─── Route → context derivation ─── */

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function deriveRouteContext(pathname: string, search = '', hash = ''): LiveContext {
  const parts = pathname.split('/').filter(Boolean);
  const now = Date.now();

  // Dashboard
  if (parts[0] === 'dashboard') {
    return {
      id: 'route:/dashboard',
      kind: 'dashboard',
      icon: LayoutDashboard,
      crumbs: ['Dashboard'],
      label: 'Dashboard',
      href: '/dashboard',
      enteredAt: now,
    };
  }

  // Tasks (also default index)
  if (parts.length === 0 || parts[0] === 'tasks') {
    const taskId = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash || search).get('task');
    if (taskId) {
      return {
        id: `tasks:open:${taskId}`,
        kind: 'taskDetail',
        icon: ClipboardList,
        crumbs: ['Tasks', taskId],
        label: `Task ${taskId}`,
        href: `/tasks#task=${encodeURIComponent(taskId)}`,
        enteredAt: now,
      };
    }
    return {
      id: 'route:/tasks',
      kind: 'tasks',
      icon: ListTodo,
      crumbs: ['Tasks'],
      label: 'Tasks',
      href: '/tasks',
      enteredAt: now,
    };
  }

  // Documents
  if (parts[0] === 'documents') {
    return {
      id: 'route:/documents',
      kind: 'documents',
      icon: FileText,
      crumbs: ['Documents'],
      label: 'Documents',
      href: '/documents',
      enteredAt: now,
    };
  }

  // Requests
  if (parts[0] === 'requests') {
    const requestId = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash).get('request') ?? new URLSearchParams(search).get('object');
    if (requestId) {
      return {
        id: `request:${requestId}`,
        kind: 'requestDetail',
        icon: ClipboardList,
        crumbs: ['Requests', requestId],
        label: requestId,
        href: `/requests#request=${encodeURIComponent(requestId)}`,
        enteredAt: now,
      };
    }
    return {
      id: 'route:/requests',
      kind: 'requests',
      icon: ClipboardList,
      crumbs: ['Requests'],
      label: 'Requests',
      href: '/requests',
      enteredAt: now,
    };
  }

  // Copilot
  if (parts[0] === 'copilot') {
    return {
      id: 'route:/copilot',
      kind: 'copilot',
      icon: AiCueSparkle,
      crumbs: ['Assistant'],
      label: 'Assistant',
      href: '/copilot',
      enteredAt: now,
    };
  }

  // Cases
  if (parts[0] === 'cases') {
    if (parts[1]) {
      const caseId = parts[1].toUpperCase();
      const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
      const tab = hashParams.get('tab');
      const taskId = hashParams.get('task');
      const reqId = hashParams.get('req');
      if (taskId) {
        return {
          id: `case:${caseId}:task:${taskId}`,
          kind: 'caseTask',
          icon: ClipboardList,
          crumbs: ['Cases', caseId, 'Tasks', taskId],
          label: `${caseId} · Task ${taskId}`,
          href: `/cases/${caseId}#tab=tasks&task=${encodeURIComponent(taskId)}`,
          enteredAt: now,
        };
      }
      if (reqId) {
        return {
          id: `requirement:${reqId}`,
          kind: 'caseRequirement',
          icon: ClipboardCheck,
          crumbs: ['Cases', caseId, 'Requirements', reqId],
          label: `${caseId} · ${reqId}`,
          href: `/cases/${caseId}#tab=requirements&req=${encodeURIComponent(reqId)}`,
          enteredAt: now,
        };
      }
      if (tab) {
        return {
          id: `case:${caseId}:${tab}`,
          kind: 'caseTab',
          icon: Briefcase,
          crumbs: ['Cases', caseId, titleCase(tab.replace(/_/g, ' '))],
          label: `${caseId} · ${titleCase(tab.replace(/_/g, ' '))}`,
          href: `/cases/${caseId}#tab=${encodeURIComponent(tab)}`,
          enteredAt: now,
        };
      }
      return {
        id: `route:/cases/${caseId}`,
        kind: 'caseDetail',
        icon: Briefcase,
        crumbs: ['Cases', caseId],
        label: caseId,
        href: `/cases/${caseId}`,
        enteredAt: now,
      };
    }
    return {
      id: 'route:/cases',
      kind: 'cases',
      icon: Briefcase,
      crumbs: ['Cases'],
      label: 'Cases',
      href: '/cases',
      enteredAt: now,
    };
  }

  // Folders
  if (parts[0] === 'folders') {
    const folderId = parts[1];
    const subCaseId = parts[2];
    if (folderId && subCaseId) {
      return {
        id: `route:/folders/${folderId}/${subCaseId}`,
        kind: 'folderCase',
        icon: Briefcase,
        crumbs: ['Folders', folderId, subCaseId.toUpperCase()],
        label: subCaseId.toUpperCase(),
        href: `/folders/${folderId}/${subCaseId}`,
        enteredAt: now,
      };
    }
    if (folderId) {
      return {
        id: `route:/folders/${folderId}`,
        kind: 'folderDetail',
        icon: FolderOpen,
        crumbs: ['Folders', folderId],
        label: titleCase(folderId),
        href: `/folders/${folderId}`,
        enteredAt: now,
      };
    }
    return {
      id: 'route:/folders',
      kind: 'folders',
      icon: Folder,
      crumbs: ['Folders'],
      label: 'Folders',
      href: '/folders',
      enteredAt: now,
    };
  }

  // Fallback
  return {
    id: `route:${pathname || '/'}`,
    kind: 'other',
    icon: LayoutDashboard,
    crumbs: [pathname || '/'],
    label: pathname || 'Workspace',
    href: pathname || '/',
    enteredAt: now,
  };
}

/* ─── Provider ─── */

const HISTORY_LIMIT = 12;

export function LiveContextProvider({ children }: React.PropsWithChildren) {
  const location = useLocation();
  const { activeSessionId, isOpen, registerContextSource } = useCopilot();

  // Overlay registry. Each registered overlay has a stable key + the overlay payload.
  // The most-recently-registered overlay wins (treated as a stack).
  const [overlays, setOverlays] = useState<Array<{ key: string; overlay: LiveContextOverlay; addedAt: number }>>([]);

  const register = useCallback((key: string, overlay: LiveContextOverlay) => {
    setOverlays((prev) => {
      const next = prev.filter((o) => o.key !== key);
      next.push({ key, overlay, addedAt: Date.now() });
      return next;
    });
  }, []);

  const unregister = useCallback((key: string) => {
    setOverlays((prev) => prev.filter((o) => o.key !== key));
  }, []);

  const overlayRegistry = useMemo<OverlayRegistryValue>(() => ({ register, unregister }), [register, unregister]);

  const routeContext = useMemo(() => deriveRouteContext(location.pathname, location.search, location.hash), [location.hash, location.pathname, location.search]);

  const current = useMemo<LiveContext>(() => {
    if (overlays.length === 0) return routeContext;
    const top = overlays[overlays.length - 1];
    return {
      ...top.overlay,
      enteredAt: top.addedAt,
    };
  }, [overlays, routeContext]);

  // Per-session histories (deduped by id, most-recent-first).
  const [sessionHistories, setSessionHistories] = useState<Record<string, LiveContext[]>>({});

  // Track the last pushed (sessionId, contextId) to avoid double-push.
  const lastPushedRef = useRef<{ sessionId: string; ctxId: string } | null>(null);

  useEffect(() => {
    // Only record into session history when the chat is open (i.e. context is "in scope" for the conversation).
    if (!isOpen) return;
    // The Assistant module itself is not a meaningful "work context" to record
    // against a conversation — it's where the conversation lives.
    if (current.kind === 'copilot') return;
    const key = { sessionId: activeSessionId, ctxId: current.id };
    if (
      lastPushedRef.current &&
      lastPushedRef.current.sessionId === key.sessionId &&
      lastPushedRef.current.ctxId === key.ctxId
    ) {
      return;
    }
    lastPushedRef.current = key;

    setSessionHistories((prev) => {
      const existing = prev[activeSessionId] ?? [];
      // Move current to front, dedupe by id, cap at HISTORY_LIMIT.
      const filtered = existing.filter((c) => c.id !== current.id);
      const next = [current, ...filtered].slice(0, HISTORY_LIMIT);
      return { ...prev, [activeSessionId]: next };
    });
  }, [activeSessionId, current, isOpen]);

  // When chat is opened, ensure the current context is recorded.
  useEffect(() => {
    if (!isOpen) {
      lastPushedRef.current = null;
    }
  }, [isOpen]);

  const currentRef = useRef(current);
  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const getCurrentContext = useCallback(() => currentRef.current, []);

  // Register with CopilotContext so sendMessage can stamp current context onto user turns.
  useEffect(() => {
    registerContextSource(getCurrentContext);
    return () => registerContextSource(null);
  }, [registerContextSource, getCurrentContext]);

  const sessionHistory = sessionHistories[activeSessionId] ?? [];

  const value = useMemo<LiveContextValue>(
    () => ({
      current,
      routeContext,
      sessionHistory,
      getCurrentContext,
    }),
    [current, routeContext, sessionHistory, getCurrentContext],
  );

  return (
    <LiveContextCtx.Provider value={value}>
      <OverlayRegistryCtx.Provider value={overlayRegistry}>{children}</OverlayRegistryCtx.Provider>
    </LiveContextCtx.Provider>
  );
}

/* ─── Hooks ─── */

export function useLiveContext(): LiveContextValue {
  const ctx = useContext(LiveContextCtx);
  if (!ctx) throw new Error('useLiveContext must be used inside LiveContextProvider');
  return ctx;
}

/**
 * Register a temporary overlay context (e.g. an open task / requirement / document).
 * Pass `null` (or a falsy `overlay`) to skip registration. The overlay is
 * automatically unregistered on unmount or when `overlay` becomes falsy.
 */
export function useLiveContextOverlay(overlay: LiveContextOverlay | null | undefined): void {
  const ctx = useContext(OverlayRegistryCtx);
  // Stable per-mount key so the same component can register/unregister consistently.
  const stableKey = useId();
  // Serialize the overlay shape we care about so we only re-register on real change.
  const serialized = overlay
    ? `${overlay.id}|${overlay.kind}|${overlay.label}|${overlay.href}|${overlay.crumbs.join('>')}`
    : '';

  useEffect(() => {
    if (!ctx) return;
    if (!overlay) {
      ctx.unregister(stableKey);
      return;
    }
    ctx.register(stableKey, overlay);
    return () => {
      ctx.unregister(stableKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, stableKey, serialized]);
}
