const TERMINAL_REQUEST = new Set(['Completed', 'Rejected', 'Cancelled']);
const TERMINAL_TASK = new Set(['Completed', 'Cancelled']);
const REVIEWED_DOCUMENT = new Set(['validated', 'reviewed', 'accepted']);

export function isTerminalRequestStatus(status: string): boolean {
  return TERMINAL_REQUEST.has(status);
}

export function isTerminalTaskStatus(status: string): boolean {
  return TERMINAL_TASK.has(status);
}

export function isOpenTaskStatus(status: string): boolean {
  return !isTerminalTaskStatus(status);
}

export function isDocumentReviewedStatus(status: string | undefined): boolean {
  if (!status) return false;
  return REVIEWED_DOCUMENT.has(status.trim().toLowerCase());
}
