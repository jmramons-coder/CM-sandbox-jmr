/** Session storage keys used across the app shell and demo flows. */
export const STORAGE_KEYS = {
  demoAccessGranted: 'amplify-demo-access-granted',
  aiActivityEnabled: 'amplify-ai-activity',
  billyPostApproval: 'amplify-billy-post-approval',
  roleView: 'amplify-role-view',
} as const;

/** Window custom events for cross-component shell coordination. */
export const APP_EVENTS = {
  aiActivityToggle: 'amplify-ai-activity-toggle',
  billyFlow: 'amplify-billy-flow',
  openSidePanelContext: 'amplify-open-sidepanel-context',
  openPlatformSettings: 'amplify-open-platform-settings',
} as const;
