import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  CheckSquare,
  ClipboardCheck,
  Compass,
  FileText,
  Gauge,
  Home,
  LayoutGrid,
  MessageSquare,
  MousePointer2,
  Settings as SettingsIcon,
  TrendingUp,
  X,
} from 'lucide-react';
import { AiActivityToast, type AiActivitySequence } from './AiActivityToast';
import { AiCueSparkle } from './AiCueSparkle';

interface PlatformGuideModalProps {
  open: boolean;
  onClose: () => void;
}

type Accent = 'blue' | 'purple' | 'green' | 'amber' | 'red';

interface KeyFact {
  label: string;
  value: string;
}

type OverlayKind = 'aiFeed' | 'mouseAccept' | 'mouseBenefit' | 'mouseConfirm' | 'mouseNewCase' | 'mouseOpenCase' | 'mouseReqTask' | 'mouseTabs' | 'zoneHighlight';

/**
 * Visible region in iframe pixels (assuming a 1440×900 virtual viewport).
 * Width drives the scale; the visible container's aspect ratio is computed
 * from `w / h`, so authors only need a focal box. An optional `overlay`
 * composites an animated annotation layer on top of the iframe.
 */
interface PreviewFocus {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  overlay?: OverlayKind;
}

/** Default focal box: full app — header + left nav + content visible. */
const FULL_APP: Pick<PreviewFocus, 'x' | 'y' | 'w' | 'h'> = { x: 0, y: 0, w: 1440, h: 820 };

/**
 * Sections group the steps in the left nav with a visual divider:
 *   intro → flow (the demo journey) → tools (settings + switcher).
 */
type GuideSection = 'intro' | 'flow' | 'tools';

interface GuideStep {
  id: string;
  navLabel: string;
  /** Defaults to `flow`. */
  section?: GuideSection;
  eyebrow: string;
  /** Optional intro paragraph rendered above the title (user-journey context). */
  intro?: { eyebrow: string; text: string };
  title: string;
  body: string;
  facts?: KeyFact[];
  bullets?: string[];
  callout?: string;
  /**
   * A flexible icon component — accepts both Lucide icons and custom React
   * components like `AiCueSparkleIcon` (the brand AI visual cue).
   */
  icon: ComponentType<{ className?: string; strokeWidth?: number; size?: number | string }>;
  accent: Accent;
  preview?: PreviewFocus;
  /** Additional previews stacked under the primary preview. */
  extraPreviews?: PreviewFocus[];
}

/**
 * Adapter so a step's title icon can be the real `AiCueSparkle` brand cue
 * (used elsewhere in the app for AI surfaces) while still satisfying the
 * shared icon-component shape.
 */
function AiCueSparkleIcon({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center ${className ?? ''}`}>
      <AiCueSparkle size={20} className="!text-current" />
    </span>
  );
}

const STEPS: GuideStep[] = [
  {
    id: 'welcome',
    navLabel: 'Welcome',
    section: 'intro',
    eyebrow: 'Platform guide',
    title: 'Welcome to Amplify Case Management',
    body: 'A multi-case life and disability workspace for claims and service. This guide walks the canonical demo journey for Billy Bud — first task in the queue through ongoing post-approval follow-ups.\n\nPowered by an agentic AI layer that monitors cases, surfaces insights, and automates routine decisions — so assessors can focus on what matters.',
    icon: Compass,
    accent: 'blue',
    preview: { src: '/home', ...FULL_APP },
  },
  {
    id: 'my-tasks',
    navLabel: 'Start in Tasks',
    eyebrow: 'Step 1 — Tasks (My tasks)',
    intro: {
      eyebrow: 'User journey',
      text: "You're an assessor working Billy Bud's pre-approval Income Protection claim — a £6,250 / month case sitting at the Decision stage with all 7 requirements fulfilled and the AI Crew recommending Approve at 91% confidence. From here you'll record the decision and let the post-approval flow play out end-to-end.",
    },
    title: "Open Billy Bud's case from your queue",
    body: "Billy's task sits at the top of My Tasks. Jump straight to the case by clicking its case ID — either in the table column, or in the task detail side panel.",
    icon: CheckSquare,
    accent: 'blue',
    preview: { src: '/tasks', ...FULL_APP, overlay: 'mouseOpenCase' },
  },
  {
    id: 'in-case',
    navLabel: 'Inside the case',
    eyebrow: 'Step 2 — Case shell',
    title: "You're now in the case",
    body: 'Every case shares the same shell. The top of the page orients you before you drill into a tab.',
    bullets: [
      'Summary header — claimant, plan, policy, monthly benefit, status.',
      'Progress bar — current lifecycle stage (Decision pending, Plan Verification, Recovery Underway, …).',
      'Eight tabs — General information · Tasks · Requirements · Decision · Communications · Documents · Relationships · Activities.',
    ],
    icon: Briefcase,
    accent: 'blue',
    preview: { src: '/cases/CD26-5546112', ...FULL_APP, overlay: 'zoneHighlight' },
  },
  {
    id: 'requirements-decision',
    navLabel: 'Requirements & Decision',
    eyebrow: 'Step 3 — Review and decide',
    title: 'Verify requirements, then approve',
    body: 'Two tabs do the work — review the evidence, then record the call.',
    bullets: [
      'Requirements — pre-approval evidence (R-1 through R-7).',
      'Decision — review the AI recommendation and record Approve.',
    ],
    icon: ClipboardCheck,
    accent: 'blue',
    preview: {
      src: '/cases/CD26-5546112?guide=approve-flow',
      ...FULL_APP,
      overlay: 'mouseTabs',
    },
  },
  {
    id: 'post-approval-setup',
    navLabel: 'AI Crew kicks in',
    eyebrow: 'Step 4 — AI Crew, Post-Approval Setup',
    title: 'The AI Crew takes it from here',
    body: 'The moment you approve, the AI activity island appears in the bottom-left corner — a live feed of the agentic crew working in the background.',
    bullets: [
      'Highlights the death benefit case CD44-6679812 for contestability sign-off.',
      'Surfaces open requirements and document follow-ups.',
      'Pushes priority tasks to your queue.',
    ],
    callout:
      'Requires AI activity to be enabled — active by default via the bottom-left toggle.',
    icon: AiCueSparkleIcon,
    accent: 'purple',
  },
  {
    id: 'new-case',
    navLabel: 'New post-approval case',
    eyebrow: 'Step 5 — Case CD44-6679812',
    title: 'Another priority case appears in the sidebar',
    body: 'After the WOP decision on CD26-5546112, the tour surfaces the Dupont death claim CD44-6679812 — it pops into the sidebar with a pulsing blue dot. Click it to open.',
    bullets: [
      'WOP decision recorded on CD26-5546112.',
      'Death claim CD44-6679812 appears in Open Cases with an unseen dot.',
    ],
    icon: Gauge,
    accent: 'green',
    preview: {
      src: '/cases/CD26-5546112?guide=new-case-appears',
      ...FULL_APP,
      overlay: 'mouseNewCase',
    },
  },
  {
    id: 'task-pushed',
    navLabel: 'Plan verification begins',
    eyebrow: 'Step 6 — Plan verification',
    title: 'Contestability review kicks in',
    body: 'The AI crew summarizes MIB vs application evidence on the death claim. A new task drops into the queue — complete human sign-off for the $500k payout.',
    icon: Bell,
    accent: 'red',
    preview: { src: '/cases/CD44-6679812?guide=task-pushed', ...FULL_APP, overlay: 'mouseReqTask' },
  },
  {
    id: 'accept-meeting',
    navLabel: 'Accept the meeting',
    eyebrow: 'Step 7 — Human in the loop',
    title: 'Review and accept the appointment',
    body: 'Open the task to reveal the side panel. The AI-proposed meeting is ready for human confirmation.',
    bullets: [
      'ACCEPT MEETING — confirm the appointment, the task moves forward.',
      'REJECT MEETING — decline and let the AI reschedule.',
    ],
    icon: CalendarCheck,
    accent: 'blue',
    preview: {
      src: '/cases/CD44-6679812?guide=accept-meeting#tab=tasks',
      x: 0,
      y: 0,
      w: 1440,
      h: 900,
      overlay: 'mouseAccept',
    },
  },
  {
    id: 'meeting-confirmed',
    navLabel: 'Benefit increase detected',
    eyebrow: 'Step 8 — Live policy event',
    title: 'CPI benefit increase — +5%',
    body: 'While you work through the case, a live policy event fires in the background: the annual CPI indexation adjusts Billy Bud\'s monthly benefit from £6,250 to £6,562. The chip on the case header pulses to flag the change — no human edit needed.',
    icon: TrendingUp,
    accent: 'amber',
    preview: {
      src: '/cases/CD44-6679812?guide=benefit-bump',
      x: 240,
      y: 40,
      w: 1200,
      h: 520,
      overlay: 'mouseBenefit',
    },
  },
  {
    id: 'confirm-plan',
    navLabel: 'Confirm the plan',
    eyebrow: 'Step 9 — Close out the meeting',
    title: 'CONFIRM PLAN, then steady-state follow-ups',
    body: 'After the conversation with the claimant, click CONFIRM PLAN in the top-right of the case header. The Restoration Plan Interview requirement is marked Fulfilled and the case moves to Recovery Underway.',
    bullets: [
      'Post-approval requirements carry a Follow-Up Date.',
      'Use SEND FOLLOW-UP from the requirement side panel to chase them.',
    ],
    callout: 'Per-requirement actions are not wired yet — CONFIRM PLAN is the working path for the demo.',
    icon: CheckCircle2,
    accent: 'green',
    preview: {
      src: '/cases/CD44-6679812?guide=confirm-plan',
      ...FULL_APP,
      overlay: 'mouseConfirm',
    },
  },
  {
    id: 'platform-settings',
    navLabel: 'Platform settings',
    section: 'tools',
    eyebrow: 'Tools — Platform settings',
    title: 'Reconfigure the demo from the user menu',
    body: 'User avatar (top-right) → Platform settings opens a five-tab modal with everything needed to reconfigure the demo on the fly. Settings persist to localStorage across reloads.',
    icon: SettingsIcon,
    accent: 'purple',
  },
  {
    id: 'app-switcher',
    navLabel: 'App switcher',
    section: 'tools',
    eyebrow: 'Tools — App switcher',
    title: 'Hop between Equisoft products',
    body: 'The 9-dot icon (top-right) opens the App switcher.',
    bullets: [
      'Products — Equisoft Case Management plus other apps the user has access to.',
      'Resources — Platform guide (this modal) and Equisoft for advisors.',
    ],
    icon: LayoutGrid,
    accent: 'purple',
    preview: {
      src: '/home?guide=app-switcher',
      x: 780,
      y: 0,
      w: 660,
      h: 390,
    },
  },
];

const WELCOME_MODULES: { id: string; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'cases', label: 'Cases', icon: Briefcase },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'assistant', label: 'Assistant', icon: MessageSquare },
];

const WELCOME_TAGLINES: Record<string, string> = {
  home: 'Smarter decisions, faster resolutions — all in one place.',
  cases: 'Every case, every detail — one unified workspace.',
  tasks: 'Prioritized queues that keep your team moving forward.',
  documents: 'Centralized records, instant retrieval — zero friction.',
  assistant: 'Your AI co-pilot — insights, actions, and answers on demand.',
};

const SETTINGS_CATEGORIES: readonly [string, string][] = [
  ['Branding', 'Name & logos'],
  ['Modules', 'Nav toggles'],
  ['Intelligence', 'AI & cues'],
  ['Language', 'EN / FR / ES'],
  ['Roles', 'Persona'],
];

const ACCENT_BG: Record<Accent, string> = {
  blue: 'bg-[#eef4ff] text-brand-blue ring-1 ring-inset ring-[#cfdfff]',
  purple: 'bg-[#f4ecff] text-[#7a4fdc] ring-1 ring-inset ring-[#dccaf5]',
  green: 'bg-[#e8f5ec] text-brand-green ring-1 ring-inset ring-[#c5e3ce]',
  amber: 'bg-[#fdf3e2] text-[#b46b0e] ring-1 ring-inset ring-[#f1d9a8]',
  red: 'bg-[#fdecec] text-brand-red ring-1 ring-inset ring-[#f4cdcd]',
};


/* ─── Animated overlays ─────────────────────────────────────────────────── */

const CURSOR_ICON_CLASS = 'size-5 fill-text-heading text-text-heading drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]';

function CursorIcon() {
  return <MousePointer2 className={CURSOR_ICON_CLASS} strokeWidth={1.5} />;
}

const POST_APPROVAL_AI_STEPS = [
  { id: 'create-case', label: 'Creating post-approval case CD44-6679812', status: 'pending' as const },
  { id: 'nc-restore', label: 'Building restoration plan & generating requirements', status: 'pending' as const },
  { id: 'nc-task', label: 'Pushing follow-up task to your queue', status: 'pending' as const },
];

/**
 * Drives the real `AiActivityToast` component used everywhere in the app, on a
 * loop, positioned in the bottom-left of the preview frame so the overlay
 * matches the actual visual cue users see during AI Crew runs.
 */
function AiFeedOverlay() {
  const stepDelayMs = 1200;
  const cycleMs = (POST_APPROVAL_AI_STEPS.length + 1) * stepDelayMs + 1800;

  const buildSequence = useCallback(
    (): AiActivitySequence => ({
      id: `guide-aifeed-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: 'AI Crew — Post-Approval Setup',
      stepDelayMs,
      startedAt: Date.now(),
      // Each cycle gets a fresh copy so internal mutation in AiActivityToast
      // doesn't carry status across iterations.
      steps: POST_APPROVAL_AI_STEPS.map((s) => ({ ...s })),
    }),
    [],
  );

  const [sequence, setSequence] = useState<AiActivitySequence>(() => buildSequence());

  useEffect(() => {
    const id = setInterval(() => setSequence(buildSequence()), cycleMs);
    return () => clearInterval(id);
  }, [buildSequence, cycleMs]);

  return (
    <AiActivityToast
      sequence={sequence}
      onDismiss={() => {}}
      containerClassName=""
    />
  );
}

function MouseConfirmOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="pg-click-pulse pg-pulse-confirm" />
      <div className="pg-cursor pg-cursor-confirm"><CursorIcon /></div>
    </div>
  );
}

/**
 * Three-click sequence for step 7 (Accept the meeting):
 *   1) Click the Tasks tab → task list appears
 *   2) Click the first task row → side panel slides in
 *   3) Click ACCEPT MEETING in the side panel
 * 9s loop synced with `?guide=accept-meeting` in CaseView.
 */
function MouseAcceptOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="pg-click-pulse pg-pulse-accept-tab" />
      <div className="pg-click-pulse pg-pulse-accept-row" />
      <div className="pg-click-pulse pg-pulse-accept-btn" />
      <div className="pg-cursor pg-cursor-accept"><CursorIcon /></div>
    </div>
  );
}

/**
 * Animated cursor that flies from the task table over to the case-ID pill in
 * the top-right of the task detail side panel (next to the X close button) and
 * clicks it — illustrating the "open the case from the side panel" path.
 * Includes a soft light-grey hover halo that fades in beneath the pill while
 * the cursor is on target so the pill reads as hovered.
 */
function MouseOpenCaseOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="pg-hover-halo pg-hover-open-case" />
      <div className="pg-click-pulse pg-pulse-open-case" />
      <div className="pg-cursor pg-cursor-open-case"><CursorIcon /></div>
    </div>
  );
}

/**
 * Animated cursor: clicks Requirements tab → Decision tab → Record Decision button.
 * Three click pulses fire at the corresponding positions.
 */
function MouseTabsOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="pg-click-pulse pg-pulse-tabs-req" />
      <div className="pg-click-pulse pg-pulse-tabs-dec" />
      <div className="pg-click-pulse pg-pulse-tabs-record" />
      <div className="pg-cursor pg-cursor-tabs"><CursorIcon /></div>
    </div>
  );
}

/**
 * Sequential light-blue zone highlights for Step 2 (Inside the case).
 * Three zones pulse in order: header summary → progress bar → tabs.
 * 6s cycle: each zone visible for ~1.5s with a 0.3s crossfade.
 */
function ZoneHighlightOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="pg-zone pg-zone-header" />
      <div className="pg-zone pg-zone-stepper" />
      <div className="pg-zone pg-zone-tabs" />
    </div>
  );
}

function MouseNewCaseOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="pg-click-pulse pg-pulse-new-case" />
      <div className="pg-cursor pg-cursor-new-case"><CursorIcon /></div>
    </div>
  );
}

/** Cursor clicking "Platform Settings" in the user-menu dropdown (zoomed-in phase). */
function MouseSettingsOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="pg-click-pulse pg-pulse-settings" />
      <div className="pg-cursor pg-cursor-settings"><CursorIcon /></div>
    </div>
  );
}

/**
 * Full-app → bottom-left zoom preview for Step 4 (AI Crew kicks in).
 * Phase 1 (0–3s): full-app view showing the whole case screen.
 * Phase 2 (3s–end): smooth zoom into bottom-left to read the AI activity island.
 * Loops on the same cycle as AiFeedOverlay (~6.6s).
 */
function AiFeedZoomPreview() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerW, setContainerW] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const transitionRef = useRef(true);
  const [, bump] = useState(0);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    setContainerW(containerRef.current.clientWidth);
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerW(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const cycleMs = 8000;
    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(() => { timers.delete(t); if (!cancelled) fn(); }, ms);
      timers.add(t);
    };
    const cycle = () => {
      transitionRef.current = false;
      bump((n) => n + 1);
      setZoomed(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          transitionRef.current = true;
          bump((n) => n + 1);
        });
      });
      schedule(() => setZoomed(true), 2500);
      schedule(cycle, cycleMs);
    };
    cycle();
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, []);

  const FULL = { x: 0, y: 0, w: 1440, h: 820 };
  const ZOOM = { x: 0, y: 420, w: 720, h: 400 };
  const focal = zoomed ? ZOOM : FULL;

  const scale = containerW > 0 ? containerW / focal.w : 0;
  const tx = -focal.x * scale;
  const ty = -focal.y * scale;
  const containerH = containerW > 0 ? (containerW * focal.h) / focal.w : 0;
  const useTransition = transitionRef.current;

  const transformStyle = scale > 0 ? `translate(${tx}px, ${ty}px) scale(${scale})` : 'scale(0)';
  const transitionStyle = useTransition ? 'transform 0.8s ease-in-out' : 'none';

  return (
    <figure
      ref={containerRef}
      className="relative my-1 w-full overflow-hidden rounded-lg border border-border-soft bg-[#f7f8fa] shadow-[0_2px_4px_rgba(27,28,30,0.04),0_8px_24px_rgba(27,28,30,0.06)]"
      style={{
        height: containerH || undefined,
        transition: useTransition ? 'height 0.8s ease-in-out' : 'none',
      }}
    >
      <div className={`absolute inset-0 bg-[#f7f8fa] transition-opacity duration-300 ${loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="pg-shimmer absolute inset-0" />
      </div>
      <iframe
        src="/cases/CD26-5546112"
        title="Platform preview"
        tabIndex={-1}
        aria-hidden
        onLoad={() => setLoaded(true)}
        className={`pointer-events-none absolute transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          left: 0,
          top: 0,
          width: '1440px',
          height: '900px',
          transform: transformStyle,
          transformOrigin: '0 0',
          transition: transitionStyle,
        }}
      />
      {/* AI island: same transform as iframe so it zooms proportionally.
          Positioned in iframe coordinates: left nav=80px, sidebar=240px wide,
          4px inset each side → left:84px, width:232px, bottom:8px from viewport. */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: 0,
          top: 0,
          width: '1440px',
          height: '900px',
          transform: transformStyle,
          transformOrigin: '0 0',
          transition: transitionStyle,
        }}
      >
        <div className="absolute flex flex-col justify-end" style={{ left: '84px', bottom: '130px', width: '292px' }}>
          <AiFeedOverlay />
        </div>
      </div>
    </figure>
  );
}

/**
 * Combined zoomed-in → zoomed-out preview for the Platform Settings step.
 * Phase 1: zoomed into the top-right corner showing the dropdown; cursor clicks
 *          "Platform Settings".
 * Phase 2: smooth CSS-transition zoom-out to full-app view showing the modal
 *          cycling through its five tabs.
 * 13s cycle synced with UserMenu's ?guide=settings-flow hook.
 */
function SettingsFlowPreview() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerW, setContainerW] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const transitionRef = useRef(true);
  const [, bump] = useState(0);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    setContainerW(containerRef.current.clientWidth);
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerW(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const cycleMs = 13000;
    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(() => { timers.delete(t); if (!cancelled) fn(); }, ms);
      timers.add(t);
    };
    const cycle = () => {
      transitionRef.current = false;
      bump((n) => n + 1);
      setZoomed(true);
      setShowCursor(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          transitionRef.current = true;
          bump((n) => n + 1);
        });
      });
      schedule(() => { setZoomed(false); setShowCursor(false); }, 2500);
      schedule(cycle, cycleMs);
    };
    cycle();
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, []);

  const ZOOM_IN = { x: 880, y: 0, w: 560, h: 360 };
  const ZOOM_OUT = { x: 0, y: 0, w: 1440, h: 820 };
  const focal = zoomed ? ZOOM_IN : ZOOM_OUT;

  const scale = containerW > 0 ? containerW / focal.w : 0;
  const tx = -focal.x * scale;
  const ty = -focal.y * scale;
  const containerH = containerW > 0 ? (containerW * focal.h) / focal.w : 0;
  const useTransition = transitionRef.current;

  return (
    <figure
      ref={containerRef}
      className="relative my-1 w-full overflow-hidden rounded-lg border border-border-soft bg-[#f7f8fa] shadow-[0_2px_4px_rgba(27,28,30,0.04),0_8px_24px_rgba(27,28,30,0.06)]"
      style={{
        height: containerH || undefined,
        transition: useTransition ? 'height 0.8s ease-in-out' : 'none',
      }}
    >
      <div className={`absolute inset-0 bg-[#f7f8fa] transition-opacity duration-300 ${loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="pg-shimmer absolute inset-0" />
      </div>
      <iframe
        src="/home?guide=settings-flow"
        title="Platform preview"
        tabIndex={-1}
        aria-hidden
        onLoad={() => setLoaded(true)}
        className={`pointer-events-none absolute transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          left: 0,
          top: 0,
          width: '1440px',
          height: '900px',
          transform: scale > 0 ? `translate(${tx}px, ${ty}px) scale(${scale})` : 'scale(0)',
          transformOrigin: '0 0',
          transition: useTransition ? 'transform 0.8s ease-in-out' : 'none',
        }}
      />
      {showCursor && <MouseSettingsOverlay />}
    </figure>
  );
}

/**
 * Two-click cursor for Step 6: click Requirements tab, then Tasks tab.
 * 9s cycle synced with CaseView ?guide=task-pushed.
 */
function MouseReqTaskOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="pg-click-pulse pg-pulse-req" />
      <div className="pg-click-pulse pg-pulse-task" />
      <div className="pg-cursor pg-cursor-req-task"><CursorIcon /></div>
    </div>
  );
}

/** Cursor hovering on the Monthly Benefit amount → popup appears. */
function MouseBenefitOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="pg-cursor pg-cursor-benefit"><CursorIcon /></div>
    </div>
  );
}

function PreviewOverlay({ kind }: { kind: OverlayKind }) {
  switch (kind) {
    case 'aiFeed':
      return <AiFeedOverlay />;
    case 'mouseAccept':
      return <MouseAcceptOverlay />;
    case 'mouseBenefit':
      return <MouseBenefitOverlay />;
    case 'mouseConfirm':
      return <MouseConfirmOverlay />;
    case 'mouseNewCase':
      return <MouseNewCaseOverlay />;
    case 'mouseReqTask':
      return <MouseReqTaskOverlay />;
    case 'mouseOpenCase':
      return <MouseOpenCaseOverlay />;
    case 'mouseTabs':
      return <MouseTabsOverlay />;
    case 'zoneHighlight':
      return <ZoneHighlightOverlay />;
  }
}

/* ─── Live preview frame ────────────────────────────────────────────────── */

/**
 * Renders a non-interactive iframe of the live app, cropped to a focal box and
 * scaled to fit the container width. The iframe is `pointer-events: none` and
 * non-tabbable so users cannot drill in or trap focus inside it.
 */
function LivePreview({ focus }: { focus: PreviewFocus }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerW, setContainerW] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    setContainerW(containerRef.current.clientWidth);
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerW(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setLoaded(false);
  }, [focus.src]);

  const scale = containerW > 0 ? containerW / focus.w : 0;
  const tx = -focus.x * scale;
  const ty = -focus.y * scale;
  const ratio = `${focus.w} / ${focus.h}`;

  return (
    <figure
      ref={containerRef}
      className="relative my-1 w-full overflow-hidden rounded-lg border border-border-soft bg-[#f7f8fa] shadow-[0_2px_4px_rgba(27,28,30,0.04),0_8px_24px_rgba(27,28,30,0.06)]"
      style={{ aspectRatio: ratio }}
    >
      <div className={`absolute inset-0 bg-[#f7f8fa] transition-opacity duration-300 ${loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="pg-shimmer absolute inset-0" />
      </div>
      <iframe
        key={focus.src}
        src={focus.src}
        title="Platform preview"
        tabIndex={-1}
        aria-hidden
        onLoad={() => setLoaded(true)}
        className={`pointer-events-none absolute transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          left: 0,
          top: 0,
          width: '1440px',
          height: '900px',
          transform: scale > 0 ? `translate(${tx}px, ${ty}px) scale(${scale})` : 'scale(0)',
          transformOrigin: '0 0',
        }}
      />
      {focus.overlay && <PreviewOverlay kind={focus.overlay} />}
    </figure>
  );
}

export function PlatformGuideModal({ open, onClose }: PlatformGuideModalProps) {
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [welcomeModule, setWelcomeModule] = useState('home');
  const total = STEPS.length;
  const step = STEPS[stepIndex];

  const goPrev = useCallback(() => setStepIndex((idx) => Math.max(0, idx - 1)), []);
  const goNext = useCallback(
    () => setStepIndex((idx) => Math.min(total - 1, idx + 1)),
    [total],
  );
  const goTo = useCallback((idx: number) => setStepIndex(idx), []);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    setStepIndex(0);
    setWelcomeModule('home');
    requestAnimationFrame(() => setVisible(true));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') goNext();
      if (event.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, goNext, goPrev]);

  useEffect(() => {
    if (!open || step.id !== 'welcome') return;
    const el = document.querySelector('.pg-welcome-typewriter') as HTMLElement | null;
    if (!el) return;
    const text = WELCOME_TAGLINES[welcomeModule] ?? WELCOME_TAGLINES.home;
    el.textContent = '';
    el.classList.remove('done');
    let i = 0;
    const id = setInterval(() => {
      if (i < text.length) {
        el.textContent = text.slice(0, i + 1);
        i++;
      } else {
        clearInterval(id);
        el.classList.add('done');
      }
    }, 38);
    return () => clearInterval(id);
  }, [open, step.id, welcomeModule]);

  const progressPct = useMemo(
    () => Math.round(((stepIndex + 1) / total) * 100),
    [stepIndex, total],
  );

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  const Icon = step.icon;

  return createPortal(
    <div className="fixed inset-0 z-[1000]">
      <div
        className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="platform-guide-title"
        className={`absolute left-1/2 top-1/2 flex h-[min(860px,calc(100vh-48px))] w-[min(1320px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)] transition-all duration-200 ${
          visible ? 'translate-y-[-50%] opacity-100' : 'translate-y-[-48%] opacity-0'
        }`}
      >
        {/* Left nav */}
        <aside className="flex w-[260px] shrink-0 flex-col border-r border-border-soft bg-[#f7f8fa]">
          <div className="px-5 pt-5 pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
              Platform guide
            </p>
            <h2 id="platform-guide-title" className="mt-1 text-[15px] font-semibold text-text-heading">
              Demo walkthrough
            </h2>
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {STEPS.map((s, idx) => {
              const active = idx === stepIndex;
              const sectionOf = (step: GuideStep) => step.section ?? 'flow';
              const prevSection = idx > 0 ? sectionOf(STEPS[idx - 1]) : null;
              const showDivider = prevSection !== null && sectionOf(s) !== prevSection;
              const isFlow = sectionOf(s) === 'flow';
              const flowNumber = isFlow
                ? STEPS.slice(0, idx + 1).filter((step) => sectionOf(step) === 'flow').length
                : null;
              const StepIcon = s.icon;
              return (
                <div key={s.id}>
                  {showDivider && (
                    <div className="my-2 border-t border-border-soft" aria-hidden />
                  )}
                  <button
                    type="button"
                    onClick={() => goTo(idx)}
                    className={`group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors ${
                      active
                        ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                        : 'hover:bg-white/70'
                    }`}
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                        active
                          ? 'bg-brand-blue text-white'
                          : 'bg-surface-muted text-text-muted'
                      }`}
                    >
                      {flowNumber !== null ? (
                        flowNumber
                      ) : (
                        <StepIcon className="size-3.5" strokeWidth={2} />
                      )}
                    </span>
                    <span
                      className={`min-w-0 flex-1 truncate text-[13px] ${
                        active
                          ? 'font-semibold text-text-heading'
                          : 'font-medium text-text-secondary group-hover:text-text-primary'
                      }`}
                    >
                      {s.navLabel}
                    </span>
                  </button>
                </div>
              );
            })}
          </nav>
          <div className="border-t border-border-soft px-5 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                Progress
              </span>
              <span className="text-[11px] font-semibold text-text-secondary">{progressPct}%</span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border-soft">
              <div
                className="h-full rounded-full transition-all duration-300 bg-brand-blue"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 items-center justify-between border-b border-border-soft px-7 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
              {step.eyebrow}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
              aria-label="Close platform guide"
            >
              <X className="size-4" />
            </button>
          </header>

          <main className={`relative min-h-0 flex-1 px-7 py-6 ${step.id === 'welcome' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            <div
              key={step.id}
              className="mx-auto flex max-w-[840px] animate-[fadeIn_180ms_ease-out] flex-col gap-4"
            >
              {step.intro && (
                <div className="rounded-lg border border-border-soft bg-[#fafbfc] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                    {step.intro.eyebrow}
                  </p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">
                    {step.intro.text}
                  </p>
                </div>
              )}

              <div>
                <h3 className="flex items-center gap-2.5 text-[22px] font-semibold leading-tight text-text-heading">
                  <Icon
                    className="size-5 shrink-0 text-brand-blue"
                    strokeWidth={1.75}
                  />
                  <span className="min-w-0">{step.title}</span>
                </h3>
                <div className="mt-2 space-y-2 text-[13.5px] leading-relaxed text-text-secondary">
                  {step.body.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>

              {step.id === 'welcome' && (
                <div className="flex justify-center gap-1">
                  {WELCOME_MODULES.map(({ id, label, icon: MIcon }) => {
                    const active = welcomeModule === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setWelcomeModule(id)}
                        className={`flex h-[52px] w-[64px] flex-col items-center justify-center rounded-lg transition-colors ${
                          active ? 'bg-surface-selected' : 'hover:bg-surface-muted'
                        }`}
                      >
                        <MIcon className={`h-4 w-4 ${active ? 'text-brand-blue' : 'text-text-secondary'}`} />
                        <span className={`mt-1 text-[11px] leading-tight ${active ? 'font-semibold text-brand-blue' : 'font-normal text-text-secondary'}`}>
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {step.facts && step.facts.length > 0 && (
                <dl className="grid grid-cols-1 gap-2 rounded-xl border border-border-soft bg-[#fafbfc] p-3 sm:grid-cols-2">
                  {step.facts.map((fact) => (
                    <div key={fact.label} className="min-w-0">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                        {fact.label}
                      </dt>
                      <dd className="mt-0.5 truncate text-[13px] font-semibold text-text-heading">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {step.bullets && step.bullets.length > 0 && (
                <ul className="space-y-2">
                  {step.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[13.5px] leading-relaxed text-text-secondary">
                      <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-brand-blue" />
                      <span className="min-w-0">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {step.callout && (
                <div className={`rounded-lg px-3 py-2 text-[13px] leading-relaxed ${ACCENT_BG[step.accent]}`}>
                  {step.callout}
                </div>
              )}

              {step.id === 'platform-settings' && (
                <div className="grid grid-cols-5 gap-2">
                  {SETTINGS_CATEGORIES.map(([label, sub]) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-0.5 rounded-lg border border-border-soft bg-white px-2 py-2 text-center"
                    >
                      <span className="text-[12px] font-semibold text-text-heading">{label}</span>
                      <span className="text-[10.5px] leading-tight text-text-muted">{sub}</span>
                    </div>
                  ))}
                </div>
              )}

              {step.id === 'post-approval-setup'
                ? <AiFeedZoomPreview />
                : step.id === 'platform-settings'
                ? <SettingsFlowPreview />
                : step.preview && (
                  <div className="relative">
                    <LivePreview
                      focus={
                        step.id === 'welcome'
                          ? { ...step.preview, src: `/${welcomeModule === 'tasks' ? '' : welcomeModule === 'assistant' ? 'copilot' : welcomeModule}` }
                          : step.preview
                      }
                    />
                  </div>
                )
              }
              {step.extraPreviews?.map((extra, idx) => (
                <LivePreview key={`${step.id}-extra-${idx}`} focus={extra} />
              ))}
            </div>
            {step.id === 'welcome' && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex h-[180px] items-end justify-center bg-gradient-to-t from-white from-55% via-white/90 via-85% to-transparent pb-10">
                <span className="pg-welcome-typewriter text-center text-[36px] font-bold tracking-tight text-text-heading" />
              </div>
            )}
          </main>

          <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-border-soft px-7 py-4">
            <span className="text-[12px] font-medium text-text-muted">
              Step {stepIndex + 1} of {total}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-3 py-1.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
              >
                Skip tour
              </button>
              <button
                type="button"
                onClick={goPrev}
                disabled={stepIndex === 0}
                className="rounded-full border border-border-default bg-white px-4 py-1.5 text-[13px] font-semibold text-text-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              {stepIndex < total - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-full bg-brand-blue px-4 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-blue-hover"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-brand-blue px-4 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-blue-hover"
                >
                  Done
                </button>
              )}
            </div>
          </footer>
        </section>
      </div>

      <style>{GUIDE_STYLES}</style>
    </div>,
    document.body,
  );
}

/* ─── Animation styles ──────────────────────────────────────────────────── */

const GUIDE_STYLES = `
        .pg-shimmer {
          background: linear-gradient(90deg, #f7f8fa 0%, #eef0f3 40%, #f7f8fa 80%);
          background-size: 200% 100%;
          animation: pg-shimmer-sweep 1.4s ease-in-out infinite;
        }
        @keyframes pg-shimmer-sweep {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pg-welcome-typewriter::after {
          content: '|';
          animation: pg-blink 0.6s step-end infinite;
          margin-left: 2px;
          font-weight: 300;
          color: var(--color-brand-blue);
        }
        .pg-welcome-typewriter.done::after {
          animation: pg-blink-fade 0.6s step-end 3 forwards;
        }
        @keyframes pg-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pg-blink-fade {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Shared cursor + click-pulse styles. Per-step variants (.pg-cursor-confirm,
           .pg-cursor-accept) provide the actual keyframes for the flight path. */
        .pg-cursor {
          position: absolute;
        }
        .pg-click-pulse {
          position: absolute;
          width: 32px;
          height: 32px;
          margin-left: -16px;
          margin-top: -16px;
          border-radius: 9999px;
          background: rgba(0, 133, 51, 0.35);
          transform: scale(0);
          opacity: 0;
        }
        @keyframes pg-cursor-fade {
          0%, 4%   { opacity: 0; }
          12%, 88% { opacity: 1; }
          96%, 100% { opacity: 0; }
        }
        @keyframes pg-click {
          0%, 32%  { transform: scale(0); opacity: 0; }
          36%      { transform: scale(0.5); opacity: 0.85; }
          58%      { transform: scale(1.8); opacity: 0; }
          100%     { transform: scale(1.8); opacity: 0; }
        }

        /* Step 2 — Sequential zone highlights.
           Three zones in the case shell pulse in sequence on a 6s loop.
           Zones are positioned in FULL_APP { w:1440, h:820 }:
             - Header summary (badge + ID + info cards):
               x: 26.4% (380/1440), y: 10% (~82px), w: 73.6%, h: 12% (~98px)
             - Progress stepper:
               x: 26.4%, y: 22% (~180px), w: 73.6%, h: 7% (~57px)
             - Tab bar:
               x: 26.4%, y: 29% (~238px), w: 73.6%, h: 5% (~41px) */
        .pg-zone {
          position: absolute;
          border-radius: 8px;
          background: rgba(0, 98, 150, 0.08);
          border: 2px solid rgba(0, 98, 150, 0.18);
          opacity: 0;
        }
        .pg-zone-header {
          left: 27.3%;
          top: 7.3%;
          width: 71.9%;
          height: 28.3%;
          animation: pg-zone-1 6s ease-in-out infinite;
        }
        .pg-zone-stepper {
          left: 27.3%;
          top: 34.8%;
          width: 71.9%;
          height: 8%;
          animation: pg-zone-2 6s ease-in-out infinite;
        }
        .pg-zone-tabs {
          left: 27.3%;
          top: 47%;
          width: 71.9%;
          height: 8%;
          animation: pg-zone-3 6s ease-in-out infinite;
        }
        @keyframes pg-zone-1 {
          0%, 3%   { opacity: 0; }
          8%, 28%  { opacity: 1; }
          33%      { opacity: 0; }
          100%     { opacity: 0; }
        }
        @keyframes pg-zone-2 {
          0%, 33%  { opacity: 0; }
          38%, 58% { opacity: 1; }
          63%      { opacity: 0; }
          100%     { opacity: 0; }
        }
        @keyframes pg-zone-3 {
          0%, 63%  { opacity: 0; }
          68%, 88% { opacity: 1; }
          93%      { opacity: 0; }
          100%     { opacity: 0; }
        }

        /* Step 5 — Click the new post-approval case in the sidebar.
           8s cycle synced with CasesWorkspace's ?guide=new-case-appears.
           Timeline: 0s reset → 1s case appears → 1.8s cursor in → 2.8s click
           → 3.2s cursor out → 3.2–5.2s hold (2s) showing opened case → 8s loop.
           Cursor fades out right after click so it doesn't linger. */
        .pg-cursor-new-case {
          left: 14%;
          top: 55%;
          animation:
            pg-cursor-new-case-x 8s ease-in-out infinite,
            pg-cursor-new-case-y 8s ease-in-out infinite,
            pg-cursor-fade-nc 8s ease-in-out infinite;
        }
        @keyframes pg-cursor-new-case-x {
          0%, 13%  { left: 14%; }
          33%      { left: 15%; }
          100%     { left: 15%; }
        }
        @keyframes pg-cursor-new-case-y {
          0%, 13%  { top: 55%; }
          33%      { top: 27%; }
          100%     { top: 27%; }
        }
        @keyframes pg-cursor-fade-nc {
          0%, 18%  { opacity: 0; }
          25%, 35% { opacity: 1; }
          42%, 100% { opacity: 0; }
        }
        .pg-pulse-new-case {
          left: 15%;
          top: 27%;
          background: rgba(0, 98, 150, 0.30);
          animation: pg-click-new-case 8s ease-out infinite;
        }
        @keyframes pg-click-new-case {
          0%, 33%  { transform: scale(0); opacity: 0; }
          37%      { transform: scale(0.5); opacity: 0.85; }
          47%      { transform: scale(1.8); opacity: 0; }
          100%     { transform: scale(1.8); opacity: 0; }
        }

        /* Platform Settings — cursor clicks the "Platform Settings" menu item in
           the user dropdown (zoomed-in view { x:880, y:0, w:560, h:360 }).
           Dropdown trigger is at the top-right of the header. "Platform Settings"
           menu item center ≈ x:1300 y:140 in full coords.
           In zoomed view: x = (1300-880)/560 = 75%,  y = 140/360 = 39%.
           2.8s one-shot animation (overlay unmounts at 2.5s). */
        .pg-cursor-settings {
          left: 50%;
          top: 70%;
          animation:
            pg-cursor-settings-x 2.8s ease-in-out forwards,
            pg-cursor-settings-y 2.8s ease-in-out forwards,
            pg-cursor-fade-settings 2.8s ease-in-out forwards;
        }
        @keyframes pg-cursor-settings-x {
          0%, 12%  { left: 50%; }
          60%, 100% { left: 75%; }
        }
        @keyframes pg-cursor-settings-y {
          0%, 12%  { top: 70%; }
          60%, 100% { top: 42%; }
        }
        @keyframes pg-cursor-fade-settings {
          0%, 8%   { opacity: 0; }
          22%, 78% { opacity: 1; }
          92%, 100% { opacity: 0; }
        }
        .pg-pulse-settings {
          left: 75%;
          top: 42%;
          background: rgba(0, 98, 150, 0.30);
          animation: pg-click-settings 2.8s ease-out forwards;
        }
        @keyframes pg-click-settings {
          0%, 58%  { transform: scale(0); opacity: 0; }
          65%      { transform: scale(0.5); opacity: 0.85; }
          80%      { transform: scale(1.8); opacity: 0; }
          100%     { transform: scale(1.8); opacity: 0; }
        }

        /* Step 6 — Cursor clicks Requirements tab (3rd tab).
           8s cycle synced with CaseView ?guide=task-pushed.
           Requirements tab in FULL_APP { w:1440, h:820 }:
             x ≈ 43%,  y ≈ 33%.
           Timeline: cursor enters → clicks Requirements at 2s → hold →
           task badge pulses at 5s → cursor fades → 8s reset. */
        .pg-cursor-req-task {
          left: 43%;
          top: 60%;
          animation:
            pg-cursor-rt-x 8s ease-in-out infinite,
            pg-cursor-rt-y 8s ease-in-out infinite,
            pg-cursor-fade-rt 8s ease-in-out infinite;
        }
        @keyframes pg-cursor-rt-x {
          0%, 8%   { left: 43%; }
          22%, 45% { left: 43%; }
          70%, 100% { left: 43%; }
        }
        @keyframes pg-cursor-rt-y {
          0%, 8%   { top: 67%; }
          22%, 45% { top: 49%; }
          70%, 100% { top: 67%; }
        }
        @keyframes pg-cursor-fade-rt {
          0%, 5%   { opacity: 0; }
          15%, 50% { opacity: 1; }
          62%, 100% { opacity: 0; }
        }
        .pg-pulse-req {
          left: 43%;
          top: 49%;
          background: rgba(0, 98, 150, 0.30);
          animation: pg-click-req-6 8s ease-out infinite;
        }
        @keyframes pg-click-req-6 {
          0%, 23%  { transform: scale(0); opacity: 0; }
          27%      { transform: scale(0.5); opacity: 0.85; }
          38%      { transform: scale(1.8); opacity: 0; }
          100%     { transform: scale(1.8); opacity: 0; }
        }
        .pg-pulse-task {
          display: none;
        }

        /* Step 8 — Monthly Benefit hover (no click).
           Focal { x:240, y:40, w:1200, h:520 }.
           Target ≈ (58%, 44%) — on the benefit amount value.
           7s cycle synced with CaseView ?guide=benefit-bump. */
        .pg-cursor-benefit {
          left: 40%;
          top: 70%;
          animation:
            pg-cursor-benefit-x 7s ease-in-out infinite,
            pg-cursor-benefit-y 7s ease-in-out infinite,
            pg-cursor-fade-benefit 7s ease-in-out infinite;
        }
        @keyframes pg-cursor-benefit-x {
          0%, 10%  { left: 40%; }
          30%, 65% { left: 58%; }
          85%, 100% { left: 40%; }
        }
        @keyframes pg-cursor-benefit-y {
          0%, 10%  { top: 70%; }
          30%, 65% { top: 44%; }
          85%, 100% { top: 70%; }
        }
        @keyframes pg-cursor-fade-benefit {
          0%, 8%   { opacity: 0; }
          18%, 72% { opacity: 1; }
          82%, 100% { opacity: 0; }
        }

        /* Step 9 — CONFIRM PLAN button in FULL_APP { w:1440, h:820 }.
           Button sits in the case header breadcrumb row, right-aligned.
             x ≈ 1160/1440 = 80.5%,  y ≈ 74/820 = 9%
           7s cycle: click at ~2s, stepper advances at ~2.5s, hold to show change. */
        .pg-cursor-confirm {
          left: 50%;
          top: 50%;
          animation:
            pg-cursor-confirm-x 7s ease-in-out infinite,
            pg-cursor-confirm-y 7s ease-in-out infinite,
            pg-cursor-fade-confirm 7s ease-in-out infinite;
        }
        @keyframes pg-cursor-confirm-x {
          0%, 6%   { left: 50%; }
          28%, 60% { left: 80%; }
          90%, 100% { left: 50%; }
        }
        @keyframes pg-cursor-confirm-y {
          0%, 6%   { top: 50%; }
          28%, 60% { top: 9%; }
          90%, 100% { top: 50%; }
        }
        @keyframes pg-cursor-fade-confirm {
          0%, 6%   { opacity: 0; }
          16%, 68% { opacity: 1; }
          82%, 100% { opacity: 0; }
        }
        .pg-pulse-confirm {
          left: 80%;
          top: 9%;
          background: rgba(0, 133, 51, 0.35);
          animation: pg-click-confirm 7s ease-out infinite;
        }
        @keyframes pg-click-confirm {
          0%, 27%  { transform: scale(0); opacity: 0; }
          31%      { transform: scale(0.5); opacity: 0.85; }
          44%      { transform: scale(1.8); opacity: 0; }
          100%     { transform: scale(1.8); opacity: 0; }
        }

        /* Step 7 — Three-stage flow (9s cycle, synced with CaseView ?guide=accept-meeting):
             1) Click Tasks tab  at ~1.5s (17%)  → task content appears
             2) Click first row  at ~3.5s (39%)  → side panel slides in
             3) Click ACCEPT MTG at ~6.5s (72%)  → meeting accepted
           Positions in full iframe focal { w:1440, h:900 }:
             - Tasks tab center  ≈ (37%, 45%)   — 528/1440, ~402/900
             - First task row    ≈ (40%, 63%)   — ~576/1440, ~567/900
             - ACCEPT MEETING    ≈ (85%, 90%)   — panel bottom-center */
        .pg-cursor-accept {
          left: 20%;
          top: 70%;
          animation:
            pg-cursor-accept-x 9s ease-in-out infinite,
            pg-cursor-accept-y 9s ease-in-out infinite,
            pg-cursor-fade-9 9s ease-in-out infinite;
        }
        @keyframes pg-cursor-accept-x {
          0%, 4%    { left: 20%; }
          16%, 28%  { left: 37%; }   /* Tasks tab */
          38%, 56%  { left: 40%; }   /* first task row */
          72%, 86%  { left: 85%; }   /* ACCEPT MEETING */
          96%, 100% { left: 20%; }
        }
        @keyframes pg-cursor-accept-y {
          0%, 4%    { top: 70%; }
          16%, 28%  { top: 45%; }    /* Tasks tab */
          38%, 56%  { top: 63%; }    /* first task row */
          72%, 86%  { top: 90%; }    /* ACCEPT MEETING */
          96%, 100% { top: 70%; }
        }
        @keyframes pg-cursor-fade-9 {
          0%, 4%   { opacity: 0; }
          10%, 90% { opacity: 1; }
          96%, 100% { opacity: 0; }
        }
        .pg-pulse-accept-tab {
          left: 37%;
          top: 45%;
          background: rgba(0, 98, 150, 0.30);
          animation: pg-click-accept-tab 9s ease-out infinite;
        }
        @keyframes pg-click-accept-tab {
          0%, 15%  { transform: scale(0); opacity: 0; }
          19%      { transform: scale(0.5); opacity: 0.85; }
          30%      { transform: scale(1.8); opacity: 0; }
          100%     { transform: scale(1.8); opacity: 0; }
        }
        .pg-pulse-accept-row {
          left: 40%;
          top: 63%;
          background: rgba(0, 98, 150, 0.30);
          animation: pg-click-accept-row 9s ease-out infinite;
        }
        @keyframes pg-click-accept-row {
          0%, 37%  { transform: scale(0); opacity: 0; }
          41%      { transform: scale(0.5); opacity: 0.85; }
          52%      { transform: scale(1.8); opacity: 0; }
          100%     { transform: scale(1.8); opacity: 0; }
        }
        .pg-pulse-accept-btn {
          left: 85%;
          top: 90%;
          background: rgba(0, 133, 51, 0.35);
          animation: pg-click-accept-btn 9s ease-out infinite;
        }
        @keyframes pg-click-accept-btn {
          0%, 71%  { transform: scale(0); opacity: 0; }
          75%      { transform: scale(0.5); opacity: 0.85; }
          86%      { transform: scale(1.8); opacity: 0; }
          100%     { transform: scale(1.8); opacity: 0; }
        }

        /* Step 3 — Click the Requirements tab, ~1s pause, click the Decision tab,
           then the iframe self-runs the approval (CaseView's ?guide=approve-flow).
           7s cycle keeps the cursor + iframe sync (Req click ≈ 1s, Dec click ≈ 3.4s,
           iframe applies the approval ≈ 4.5s, both reset together at 7s).
           Three-click sequence on a 9s cycle:
             1) Requirements tab  at ~1s   → (43%, 49%)
             2) Decision tab      at ~3.4s → (53%, 49%)
             3) Record Decision   at ~5.5s → (90%, 55%) — top-right of Decision content
           CaseView: overview → requirements @1s → decision @3.4s → approve @5.5s → reset @9s. */
        .pg-cursor-tabs {
          left: 24%;
          top: 70%;
          animation:
            pg-cursor-tabs-x 9s ease-in-out infinite,
            pg-cursor-tabs-y 9s ease-in-out infinite,
            pg-cursor-fade-tabs 9s ease-in-out infinite;
        }
        @keyframes pg-cursor-tabs-x {
          0%, 3%   { left: 24%; }
          11%, 24% { left: 43%; }   /* Requirements */
          38%, 50% { left: 53%; }   /* Decision */
          61%, 78% { left: 90%; }   /* Record Decision */
          94%, 100% { left: 24%; }
        }
        @keyframes pg-cursor-tabs-y {
          0%, 3%   { top: 70%; }
          11%, 24% { top: 49%; }    /* tabs row */
          38%, 50% { top: 49%; }    /* tabs row */
          61%, 78% { top: 60%; }    /* Record Decision button */
          94%, 100% { top: 70%; }
        }
        @keyframes pg-cursor-fade-tabs {
          0%, 3%   { opacity: 0; }
          8%, 88%  { opacity: 1; }
          94%, 100% { opacity: 0; }
        }
        .pg-pulse-tabs-req {
          left: 43%;
          top: 49%;
          background: rgba(0, 98, 150, 0.30);
          animation: pg-click-tabs-req 9s ease-out infinite;
        }
        @keyframes pg-click-tabs-req {
          0%, 10%  { transform: scale(0); opacity: 0; }
          14%      { transform: scale(0.5); opacity: 0.85; }
          24%      { transform: scale(1.8); opacity: 0; }
          100%     { transform: scale(1.8); opacity: 0; }
        }
        .pg-pulse-tabs-dec {
          left: 53%;
          top: 49%;
          background: rgba(0, 98, 150, 0.30);
          animation: pg-click-tabs-dec 9s ease-out infinite;
        }
        @keyframes pg-click-tabs-dec {
          0%, 37%  { transform: scale(0); opacity: 0; }
          41%      { transform: scale(0.5); opacity: 0.85; }
          51%      { transform: scale(1.8); opacity: 0; }
          100%     { transform: scale(1.8); opacity: 0; }
        }
        .pg-pulse-tabs-record {
          left: 90%;
          top: 60%;
          background: rgba(0, 98, 150, 0.35);
          animation: pg-click-tabs-record 9s ease-out infinite;
        }
        @keyframes pg-click-tabs-record {
          0%, 60%  { transform: scale(0); opacity: 0; }
          64%      { transform: scale(0.5); opacity: 0.85; }
          76%      { transform: scale(1.8); opacity: 0; }
          100%     { transform: scale(1.8); opacity: 0; }
        }

        /* Shared hover halo — a light-grey rounded pill that fades in beneath
           the cursor target to read as a "hover" state on the underlying pill.
           Sized slightly smaller than the actual case-ID pill in the iframe so
           the halo stays inside the button bounds at typical preview scales. */
        .pg-hover-halo {
          position: absolute;
          width: 68px;
          height: 12px;
          margin-left: -30px;
          margin-top: -2px;
          border-radius: 9999px;
          background: rgba(0, 98, 150, 0.12);
          opacity: 0;
        }

        /* Step 1 — Click the case-ID pill in the task detail side panel header
           (just left of the X close button). The Tasks page auto-selects IT-5197
           on mount so the side panel is already open in the iframe.
           Pill center estimated against a 1440-wide app with a 480px panel:
             - pill x ≈ 1320 → 92% of FULL_APP focal { w:1440 }
             - pill y ≈  270 → 33% of FULL_APP focal { h:820 } (a couple of px
               lower than the panel header padding so the cursor lands ON the
               pill, not above it). */
        .pg-cursor-open-case {
          left: 42%;
          top: 60%;
          animation:
            pg-cursor-open-case-x 5.2s ease-in-out infinite,
            pg-cursor-open-case-y 5.2s ease-in-out infinite,
            pg-cursor-fade 5.2s ease-in-out infinite;
        }
        @keyframes pg-cursor-open-case-x {
          0%, 5%   { left: 42%; }
          32%, 78% { left: 92%; }
          95%, 100% { left: 42%; }
        }
        @keyframes pg-cursor-open-case-y {
          0%, 5%   { top: 60%; }
          32%, 78% { top: 33%; }
          95%, 100% { top: 60%; }
        }
        .pg-pulse-open-case {
          left: 92%;
          top: 33%;
          background: rgba(35, 105, 226, 0.35);
          animation: pg-click 5.2s ease-out infinite;
        }
        .pg-hover-open-case {
          left: 92%;
          top: 33%;
          animation: pg-hover-open-case 5.2s ease-in-out infinite;
        }
        @keyframes pg-hover-open-case {
          0%, 26%  { opacity: 0; }
          32%, 78% { opacity: 1; }
          88%, 100% { opacity: 0; }
        }
`;
