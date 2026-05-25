import type {
  DashboardBlockerData,
  DashboardBriefHighlightIcon,
  DashboardBriefHighlightTone,
  DashboardCaseHealthRow,
  DashboardFocusData,
  RoleView,
} from './access/roleView';

export type { DashboardBriefHighlightIcon as DailyBriefHighlightIcon };
export type { DashboardBriefHighlightTone as DailyBriefHighlightTone };

/** Workspace surface that owns the brief card (one shared component + builder per context). */
export type DailyBriefContextId =
  | 'home'
  | 'cases'
  | 'tasks'
  | 'requests'
  | 'documents'
  | 'ai-actions';

export type DailyBriefLinkKind = 'case' | 'task' | 'request' | 'document';

export type DailyBriefSegment =
  | { type: 'text'; value: string }
  | {
      type: 'cue';
      label: string;
      tone: DashboardBriefHighlightTone;
      icon: DashboardBriefHighlightIcon;
    }
  | {
      type: 'link';
      label: string;
      route: string;
      kind: DailyBriefLinkKind;
    };

export type DailyBriefFocus = DashboardFocusData & {
  linkKind?: DailyBriefLinkKind;
};

/** Inputs for the rules-based writer (AI can replace segment generation later). */
export type DailyBriefFacts = {
  roleView: RoleView;
  subjectMode: 'cases' | 'tasks' | 'requests' | 'documents' | 'actions';
  subjectCount: number;
  subjectLabel: string;
  scopePhrase: string;
  teamScope: boolean;
  cases: DashboardCaseHealthRow[];
  blocker: DashboardBlockerData;
  focus: DailyBriefFocus;
  fallbackText: string;
};

export type DailyBriefContent = {
  contextId: DailyBriefContextId;
  title: string;
  segments: DailyBriefSegment[];
  text: string;
  /** `dynamic` today; reserved for future `ai` provider. */
  source: 'dynamic' | 'fallback';
};

export type BuildDailyBriefParams = {
  contextId: DailyBriefContextId;
  roleView: RoleView;
  fallbackText?: string;
  seedFocus?: DashboardFocusData;
  seedBlocker?: DashboardBlockerData;
};
