import { APP_EVENTS, STORAGE_KEYS } from '../constants/storage-keys';
import type { CaseWorkspaceObjectFocus } from './openCaseWorkspaceObject';
import { caseWorkspaceIdsMatch } from './caseWorkspaceSurface';

export function setGlobalCopilotCaseOwner(caseId: string | null): void {
  if (!caseId) {
    sessionStorage.removeItem(STORAGE_KEYS.globalCopilotCaseFocus);
    return;
  }
  sessionStorage.setItem(STORAGE_KEYS.globalCopilotCaseFocus, caseId.trim().toUpperCase());
}

export function isGlobalCopilotOwningCase(caseId: string): boolean {
  const owner = sessionStorage.getItem(STORAGE_KEYS.globalCopilotCaseFocus);
  if (!owner) return false;
  return caseWorkspaceIdsMatch(owner, caseId);
}

/** Routes task / requirement / document focus into the global AI side panel (keeps chat). */
export function requestGlobalCopilotCaseFocus(detail: CaseWorkspaceObjectFocus): boolean {
  if (!isGlobalCopilotOwningCase(detail.caseId)) return false;
  window.dispatchEvent(
    new CustomEvent<CaseWorkspaceObjectFocus>(APP_EVENTS.focusGlobalCopilotCaseObject, { detail }),
  );
  return true;
}

export type GlobalCopilotTaskOutcomeDetail = {
  taskId: string;
  alternateTaskIds?: string[];
  outcome: 'accepted' | 'amended';
};

/** Returns the global AI side panel to the active chat conversation tab. */
export function returnGlobalCopilotToAssistant(): void {
  window.dispatchEvent(new CustomEvent(APP_EVENTS.copilotReturnToAssistant));
}

/** Syncs focus-task outcome on the copilot chat after approving from a task overlay. */
export function notifyGlobalCopilotTaskOutcome(detail: GlobalCopilotTaskOutcomeDetail): void {
  window.dispatchEvent(new CustomEvent<GlobalCopilotTaskOutcomeDetail>(APP_EVENTS.copilotTaskOutcome, { detail }));
}
