import type { DatasetRequestRecord, DatasetTaskRecord } from './multi-case-dataset';
import { isSimpleServiceProfile, resolveWorkflowProfile } from '../domain/objectWorkflow';

export function isSimpleServiceRequestCategory(category?: string, templateId?: string): boolean {
  return isSimpleServiceProfile(resolveWorkflowProfile({ category, templateId }));
}

export function isSimpleServiceTask(task: Pick<DatasetTaskRecord, 'caseSubtype' | 'caseType'>): boolean {
  return (
    task.caseType === 'Service' ||
    isSimpleServiceProfile(
      resolveWorkflowProfile({ caseSubtype: task.caseSubtype, caseType: task.caseType }),
    )
  );
}

export function taskHasSimpleServiceLinks(linkedObjects: DatasetTaskRecord['linkedObjects']): boolean {
  const kinds = new Set(linkedObjects.map((ref) => ref.kind));
  return kinds.has('request') && kinds.has('policy') && kinds.has('client');
}

export function requestHasSimpleServiceLinks(linkedObjects: DatasetRequestRecord['linkedObjects']): boolean {
  const kinds = new Set((linkedObjects ?? []).map((ref) => ref.kind));
  return kinds.has('policy') && kinds.has('client');
}
