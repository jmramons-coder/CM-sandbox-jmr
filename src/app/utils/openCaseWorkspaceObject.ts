import type { NavigateFunction } from 'react-router';
import { APP_EVENTS } from '../constants/storage-keys';

export type CaseWorkspaceObjectFocus = {
  caseId: string;
  kind: 'task' | 'requirement' | 'document';
  objectId: string;
};

/** @deprecated Use CaseWorkspaceObjectFocus */
export type OpenCaseWorkspaceObjectInput = CaseWorkspaceObjectFocus;

export type FocusCaseWorkspaceObjectDetail = CaseWorkspaceObjectFocus & {
  handled?: boolean;
};

export type OpenCaseWorkspaceObjectHandler = (input: CaseWorkspaceObjectFocus) => void;

export function buildCaseWorkspaceObjectHref(input: CaseWorkspaceObjectFocus): string {
  if (input.kind === 'task') {
    return `/cases/${input.caseId}#tab=tasks&task=${encodeURIComponent(input.objectId)}`;
  }
  if (input.kind === 'document') {
    return `/cases/${input.caseId}#tab=documents&doc=${encodeURIComponent(input.objectId)}`;
  }
  return `/cases/${input.caseId}#tab=requirements&req=${encodeURIComponent(input.objectId)}`;
}

/** Case URL without task/requirement/document selection (return to chat after panel actions). */
export function buildCaseWorkspaceReturnHref(caseId: string, tab = 'tasks'): string {
  return `/cases/${caseId}#tab=${tab}`;
}

/** Navigate to the case URL and ask CaseView to open the workspace side panel + context tab. */
export function openCaseWorkspaceObject(
  navigate: NavigateFunction,
  input: OpenCaseWorkspaceObjectInput,
): void {
  navigate(buildCaseWorkspaceObjectHref(input));
  window.dispatchEvent(
    new CustomEvent<FocusCaseWorkspaceObjectDetail>(APP_EVENTS.focusCaseWorkspaceObject, {
      detail: { ...input, handled: false },
    }),
  );
}

export function parseCaseWorkspaceObjectFromHref(
  href: string,
  caseId: string,
): CaseWorkspaceObjectFocus | null {
  try {
    const url = new URL(href, window.location.origin);
    const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
    const params = new URLSearchParams(hash);
    const taskId = params.get('task');
    if (taskId) return { caseId, kind: 'task', objectId: taskId };
    const reqId = params.get('req');
    if (reqId) return { caseId, kind: 'requirement', objectId: reqId };
    const docId = params.get('doc');
    if (docId) return { caseId, kind: 'document', objectId: docId };
  } catch {
    /* relative href in tests */
  }
  const hashMatch = href.match(/#([^?]+)/);
  if (hashMatch) {
    const params = new URLSearchParams(hashMatch[1]);
    const taskId = params.get('task');
    if (taskId) return { caseId, kind: 'task', objectId: taskId };
    const reqId = params.get('req');
    if (reqId) return { caseId, kind: 'requirement', objectId: reqId };
    const docId = params.get('doc');
    if (docId) return { caseId, kind: 'document', objectId: docId };
  }
  return null;
}
