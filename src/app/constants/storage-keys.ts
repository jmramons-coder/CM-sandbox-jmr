/** Session storage keys used across the app shell and demo flows. */
export const STORAGE_KEYS = {
  demoAccessGranted: 'amplify-demo-access-granted',
  aiActivityEnabled: 'amplify-ai-activity',
  billyPostApproval: 'amplify-billy-post-approval',
  roleView: 'amplify-role-view',
  /** Case id when the global AI side panel owns task/requirement focus (suppresses CaseView overlay). */
  globalCopilotCaseFocus: 'amplify-global-copilot-case-focus',
  /** Briefly suppress CaseView hash task re-focus after copilot task approve (case id value). */
  suppressCaseHashTaskFocus: 'amplify-suppress-case-hash-task-focus',
} as const;

/** Window custom events for cross-component shell coordination. */
export const APP_EVENTS = {
  aiActivityToggle: 'amplify-ai-activity-toggle',
  billyFlow: 'amplify-billy-flow',
  openSidePanelContext: 'amplify-open-sidepanel-context',
  /** Opens a task or requirement in the case workspace side panel (context bar). */
  focusCaseWorkspaceObject: 'amplify-focus-case-workspace-object',
  /** Opens a task, requirement, or document in the global AI side panel context bar. */
  focusGlobalCopilotCaseObject: 'amplify-focus-global-copilot-case-object',
  /** Switches the global AI side panel back to the active chat conversation. */
  copilotReturnToAssistant: 'amplify-copilot-return-to-assistant',
  /** Patches the copilot session when a focus task is approved or amended from a task overlay. */
  copilotTaskOutcome: 'amplify-copilot-task-outcome',
  openPlatformSettings: 'amplify-open-platform-settings',
} as const;
