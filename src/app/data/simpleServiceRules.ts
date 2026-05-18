import type { DatasetRequestRecord, DatasetTaskRecord } from './multi-case-dataset';

export function isSimpleServiceRequestCategory(category?: string): boolean {
  return category === 'Address Change' || category === 'Beneficiary Change';
}

export function isSimpleServiceTask(task: Pick<DatasetTaskRecord, 'caseSubtype' | 'caseType'>): boolean {
  return task.caseType === 'Service' || task.caseSubtype === 'address_change' || task.caseSubtype === 'beneficiary_change';
}

export function taskHasSimpleServiceLinks(linkedObjects: DatasetTaskRecord['linkedObjects']): boolean {
  const kinds = new Set(linkedObjects.map((ref) => ref.kind));
  return kinds.has('request') && kinds.has('policy') && kinds.has('client');
}

export function requestHasSimpleServiceLinks(linkedObjects: DatasetRequestRecord['linkedObjects']): boolean {
  const kinds = new Set((linkedObjects ?? []).map((ref) => ref.kind));
  return kinds.has('policy') && kinds.has('client');
}
