import type { RequestSystemStepKind } from '../../types';

export type SimpleServiceWorkflowId = 'address_change' | 'beneficiary_change';

export type SimpleServiceWorkflowDefinition = {
  id: SimpleServiceWorkflowId;
  category: 'Address Change' | 'Beneficiary Change';
  templateId: string;
  subtype: string;
  taskSubtype: string;
  taskLabel: string;
  systemSteps: Array<{ kind: RequestSystemStepKind; title: string; description?: string }>;
};

export const SIMPLE_SERVICE_WORKFLOWS: Record<SimpleServiceWorkflowId, SimpleServiceWorkflowDefinition> = {
  address_change: {
    id: 'address_change',
    category: 'Address Change',
    templateId: 'address_change',
    subtype: 'Policy service — address change',
    taskSubtype: 'address_change',
    taskLabel: 'Review address change request',
    systemSteps: [
      { kind: 'review_required', title: 'Review intake', description: 'Validate requester, policy, and submitted address.' },
      { kind: 'create_task', title: 'Service task created', description: 'Assign review task to policy administration queue.' },
      { kind: 'follow_up_client', title: 'Apply update & confirm', description: 'Update policy records and notify the client.' },
    ],
  },
  beneficiary_change: {
    id: 'beneficiary_change',
    category: 'Beneficiary Change',
    templateId: 'beneficiary_change',
    subtype: 'Policy service — beneficiary change',
    taskSubtype: 'beneficiary_change',
    taskLabel: 'Review beneficiary change request',
    systemSteps: [
      { kind: 'review_required', title: 'Review intake', description: 'Validate designation and supporting form.' },
      { kind: 'create_task', title: 'Service task created', description: 'Assign review task to policy administration queue.' },
      { kind: 'follow_up_client', title: 'Apply update & confirm', description: 'Update beneficiary records and notify the client.' },
    ],
  },
};

export function resolveSimpleServiceWorkflow(
  category?: string,
  templateId?: string,
  taskSubtype?: string,
): SimpleServiceWorkflowDefinition | null {
  if (templateId === 'address_change' || taskSubtype === 'address_change' || category === 'Address Change') {
    return SIMPLE_SERVICE_WORKFLOWS.address_change;
  }
  if (templateId === 'beneficiary_change' || taskSubtype === 'beneficiary_change' || category === 'Beneficiary Change') {
    return SIMPLE_SERVICE_WORKFLOWS.beneficiary_change;
  }
  return null;
}
