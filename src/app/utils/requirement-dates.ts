import type { CaseRequirement } from '../types';

export function formatRequirementDate(value?: string) {
  if (!value || value === 'TBD') return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00`).toLocaleDateString('en-CA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  return value;
}

function isFulfilledRequirementStatus(status: CaseRequirement['status']) {
  return status === 'Fulfilled' || status === 'Waived' || status === 'Completed' || status === 'fulfilled';
}

export function requirementReceivedDateLabel(requirement: Pick<CaseRequirement, 'receivedDate' | 'status' | 'history'>) {
  if (requirement.receivedDate?.trim()) {
    return formatRequirementDate(requirement.receivedDate);
  }
  if (!isFulfilledRequirementStatus(requirement.status) || !requirement.history?.length) {
    return '—';
  }
  const receivedEvent = [...requirement.history]
    .reverse()
    .find((event) => event.dot === 'green' && /received|receipted|fulfilled|clear/i.test(event.action));
  return receivedEvent ? formatRequirementDate(receivedEvent.date) : '—';
}
