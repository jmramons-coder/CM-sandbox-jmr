import type { EntityFolderDef, EntitySubFolderGroup } from '../domain/entityFolders';
import type { AgentRecord, ClientRecord, PolicyRecord, SystemDataset } from './multi-case-dataset';
import {
  formatParticipantRoles,
  GI_DEMO_POLICY_ID,
  resolveEntityFolderId,
} from './gi-demo-entity-records';
import { getEntityFolderById } from './mock-entity-folders';

function baseTabs() {
  return [
    { id: 'information', label: 'Information' },
    { id: 'tasks', label: 'Tasks', disabled: true },
    { id: 'documents', label: 'Documents', disabled: true },
    { id: 'requests', label: 'Requests', disabled: true },
    { id: 'notes', label: 'Notes', disabled: true },
    { id: 'relationship', label: 'Relationship' },
  ];
}

export type PolicyAgentListRow = {
  id: string;
  name: string;
  roles: string;
  phone?: string;
  email?: string;
};

export type PolicyParticipantListRow = {
  id: string;
  name: string;
  roles: string;
  phone?: string;
  email?: string;
};

function buildPolicySubFolderGroups(
  dataset: SystemDataset,
  policy: PolicyRecord,
): EntitySubFolderGroup[] {
  const groups: EntitySubFolderGroup[] = [];
  const agentIds = [...new Set(policy.agents.map((agent) => agent.id))];

  if (agentIds.length > 0) {
    groups.push({
      type: 'agent',
      label: 'Agents',
      count: agentIds.length,
      childIds: agentIds,
    });
  }

  const mockStructural = getEntityFolderById(policy.id);
  const mockCoverageGroup = mockStructural?.subFolderGroups?.find((group) => group.type === 'coverage');
  if (mockCoverageGroup) {
    groups.push(mockCoverageGroup);
  }

  const participantIds = [
    ...new Set(policy.participants.map((participant) => participant.clientId)),
  ];
  if (participantIds.length > 0) {
    groups.push({
      type: 'participant',
      label: 'Participants',
      count: participantIds.length,
      childIds: participantIds,
    });
  }

  return groups;
}

export function getPolicyAgentListRows(dataset: SystemDataset, policyId: string): PolicyAgentListRow[] {
  const policy = dataset.policies.find((item) => item.id === policyId);
  if (!policy) return [];

  return policy.agents.map((agentRef) => {
    const agent = dataset.agents.find((item) => item.id === agentRef.id);
    return {
      id: agentRef.id,
      name: agent?.name ?? agentRef.label ?? agentRef.id,
      roles: agentRef.role ?? 'Agent',
      phone: agent?.phone,
      email: agent?.email,
    };
  });
}

export function getPolicyParticipantListRows(
  dataset: SystemDataset,
  policyId: string,
): PolicyParticipantListRow[] {
  const policy = dataset.policies.find((item) => item.id === policyId);
  if (!policy) return [];

  const rolesByClient = new Map<string, PolicyRecord['participants'][number]['role'][]>();
  policy.participants.forEach((participant) => {
    const roles = rolesByClient.get(participant.clientId) ?? [];
    roles.push(participant.role);
    rolesByClient.set(participant.clientId, roles);
  });

  return [...rolesByClient.entries()].map(([clientId, roles]) => {
    const client = dataset.clients.find((item) => item.id === clientId);
    return {
      id: clientId,
      name: client?.name ?? clientId,
      roles: formatParticipantRoles(roles),
      phone: client?.profile?.phone,
      email: client?.profile?.email,
    };
  });
}

export function getPolicyEntityView(dataset: SystemDataset, policy: PolicyRecord): EntityFolderDef {
  const participants = policy.participants.map((participant) => {
    const client = dataset.clients.find((item) => item.id === participant.clientId);
    return {
      id: `${policy.id}-${participant.clientId}-${participant.role}`,
      cells: {
        client: client?.name ?? participant.clientId,
        role: participant.role,
        effectiveDate: participant.effectiveDate ?? '-',
        allocation: participant.allocationPct ? `${participant.allocationPct}%` : '-',
      },
      href: `/folders/${participant.clientId}`,
    };
  });

  const mockStructural = policy.id === GI_DEMO_POLICY_ID ? getEntityFolderById(policy.id) : undefined;

  return {
    id: policy.id,
    type: 'policy',
    header: {
      title: policy.label,
      status: policy.status.toLowerCase() === 'active' ? 'active' : policy.status.toLowerCase() === 'draft' ? 'pending' : 'inactive',
      badges: [{ label: 'Policy', tone: 'default' }, { label: policy.status.toUpperCase(), tone: 'Informative' }],
      actions: [{ id: 'add' }, { id: 'message' }, { id: 'more' }],
    },
    tabs: [
      ...baseTabs(),
      { id: 'participants', label: 'Participants' },
      { id: 'agents', label: 'Agents' },
    ],
    information:
      mockStructural?.information ?? [
        {
          kind: 'fieldGrid',
          id: 'identification',
          title: 'IDENTIFICATION',
          layout: 'grid-3',
          fields: [
            { label: 'Policy number', value: policy.policyNumber ?? policy.id },
            { label: 'Product', value: policy.product },
            { label: 'Status', value: policy.status },
            { label: 'Product type', value: policy.productType ?? '-' },
            { label: 'Coverage amount', value: policy.coverageAmount ?? '-' },
            { label: 'Monthly benefit', value: policy.monthlyBenefit ?? '-' },
          ],
        },
        {
          kind: 'tableSection',
          id: 'participants',
          title: 'PARTICIPANTS',
          columns: [
            { key: 'client', label: 'Client' },
            { key: 'role', label: 'Role' },
            { key: 'effectiveDate', label: 'Effective date' },
            { key: 'allocation', label: 'Allocation' },
          ],
          rows: participants,
        },
        {
          kind: 'tableSection',
          id: 'agents',
          title: 'AGENTS',
          columns: [
            { key: 'agent', label: 'Agent' },
            { key: 'role', label: 'Role' },
          ],
          rows: policy.agents.map((agent) => ({
            id: `${policy.id}-${agent.id}`,
            cells: { agent: agent.label ?? agent.id, role: agent.role ?? 'Agent' },
            href: `/folders/${agent.id}`,
          })),
        },
      ],
    subFolderGroups: buildPolicySubFolderGroups(dataset, policy),
  };
}

export function getClientEntityView(dataset: SystemDataset, client: ClientRecord): EntityFolderDef {
  const policyRows = dataset.policies
    .flatMap((policy) =>
      policy.participants
        .filter((participant) => participant.clientId === client.id)
        .map((participant) => ({
          id: `${policy.id}-${participant.role}`,
          href: `/folders/${policy.id}`,
          cells: {
            policy: policy.label,
            role: participant.role,
            status: policy.status,
            product: policy.product,
          },
        })),
    );

  return {
    id: client.id,
    type: 'client',
    header: {
      title: client.name,
      status: client.status === 'inactive' ? 'inactive' : 'active',
      avatar: {
        initials: client.name
          .split(/\s|,/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join('')
          .toUpperCase(),
        color: '#F7E8DF',
      },
      badges: [
        { label: 'Client', tone: 'default' },
        { label: (client.status ?? 'active').toUpperCase(), tone: 'Informative' },
      ],
      actions: [{ id: 'add' }, { id: 'message' }, { id: 'more' }],
    },
    tabs: baseTabs(),
    information: [
      {
        kind: 'fieldGrid',
        id: 'identification',
        title: 'IDENTIFICATION',
        layout: 'grid-3',
        fields: [
          { label: 'Name', value: client.name },
          { label: 'Client ID', value: client.id },
          { label: 'Type', value: client.type },
          { label: 'Status', value: client.status ?? 'active' },
          { label: 'Category', value: client.category ?? '-' },
          { label: 'Language', value: client.language ?? '-' },
          { label: 'Date of birth', value: client.profile?.dob ?? '-' },
          { label: 'Age', value: client.profile?.age ?? '-' },
          { label: 'Gender', value: client.profile?.gender ?? '-' },
        ],
      },
      {
        kind: 'contact',
        id: 'contact',
        title: 'CONTACT',
        emails: client.profile?.email ? [{ kind: 'Personal', address: client.profile.email }] : [],
        phones: client.profile?.phone ? [{ kind: 'Personal', number: client.profile.phone }] : [],
        addresses: client.profile?.address
          ? [
              {
                kind: 'Residence',
                address: `${client.profile.address}${client.profile.parish ? `, ${client.profile.parish}` : ''}`,
              },
            ]
          : [],
      },
      {
        kind: 'tableSection',
        id: 'policy-participation',
        title: 'POLICY PARTICIPATION',
        columns: [
          { key: 'policy', label: 'Policy' },
          { key: 'role', label: 'Role' },
          { key: 'status', label: 'Status' },
          { key: 'product', label: 'Product' },
        ],
        rows: policyRows,
        emptyState: { message: 'No policy relationships found in the active dataset.' },
      },
    ],
  };
}

export function getAgentEntityView(dataset: SystemDataset, agent: AgentRecord): EntityFolderDef {
  const policyRows = dataset.policies
    .filter((policy) => policy.agents.some((ref) => ref.id === agent.id))
    .map((policy) => ({
      id: `${agent.id}-${policy.id}`,
      href: `/folders/${policy.id}`,
      cells: {
        policy: policy.label,
        relationship: policy.agents.find((ref) => ref.id === agent.id)?.role ?? 'Agent',
        status: policy.status,
        product: policy.product,
      },
    }));

  return {
    id: agent.id,
    type: 'agent',
    header: {
      title: agent.name,
      status: agent.status === 'active' ? 'active' : agent.status === 'onboarding' ? 'pending' : 'inactive',
      avatar: {
        initials: agent.name
          .split(/\s|,/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join('')
          .toUpperCase(),
        color: '#5b8abf',
      },
      badges: [
        { label: 'Agent', tone: 'default' },
        { label: agent.status.toUpperCase(), tone: 'Informative' },
      ],
      actions: [{ id: 'add' }, { id: 'message' }, { id: 'more' }],
    },
    tabs: baseTabs(),
    information: [
      {
        kind: 'fieldGrid',
        id: 'identification',
        title: 'IDENTIFICATION',
        layout: 'grid-3',
        fields: [
          { label: 'Name', value: agent.name },
          { label: 'Producer code', value: agent.producerCode ?? '-' },
          { label: 'Status', value: agent.status },
          { label: 'Agency', value: agent.agencyName ?? '-' },
          { label: 'Email', value: agent.email ?? '-' },
          { label: 'Phone', value: agent.phone ?? '-' },
        ],
      },
      {
        kind: 'tableSection',
        id: 'policy-relationships',
        title: 'POLICY RELATIONSHIPS',
        columns: [
          { key: 'policy', label: 'Policy' },
          { key: 'relationship', label: 'Relationship' },
          { key: 'status', label: 'Status' },
          { key: 'product', label: 'Product' },
        ],
        rows: policyRows,
        emptyState: { message: 'No policy relationships found in the active dataset.' },
      },
      {
        kind: 'tableSection',
        id: 'licenses',
        title: 'LICENSES',
        columns: [
          { key: 'jurisdiction', label: 'Jurisdiction' },
          { key: 'status', label: 'Status' },
          { key: 'effectiveDate', label: 'Effective date' },
        ],
        rows: agent.licenses.map((license) => ({
          id: license.id,
          cells: {
            jurisdiction: license.jurisdiction,
            status: license.status,
            effectiveDate: license.effectiveDate ?? '-',
          },
        })),
      },
    ],
  };
}

export type DatasetEntityFolderType = 'policy' | 'client' | 'agent' | 'application';

export function getDatasetEntityFolderType(
  dataset: SystemDataset,
  id: string | undefined,
): DatasetEntityFolderType | undefined {
  const resolvedId = resolveEntityFolderId(id);
  if (!resolvedId) return undefined;
  if (dataset.policies.some((item) => item.id === resolvedId)) return 'policy';
  if (dataset.clients.some((item) => item.id === resolvedId)) return 'client';
  if (dataset.agents.some((item) => item.id === resolvedId)) return 'agent';
  if (dataset.applications.some((item) => item.id === resolvedId)) return 'application';
  return undefined;
}

export function isDatasetEntityFolderId(dataset: SystemDataset, id: string | undefined): boolean {
  return !!getDatasetEntityFolderType(dataset, id);
}

export function getEntityFolderViewFromDataset(
  dataset: SystemDataset,
  id: string | undefined,
): EntityFolderDef | undefined {
  const resolvedId = resolveEntityFolderId(id);
  if (!resolvedId) return undefined;
  const policy = dataset.policies.find((item) => item.id === resolvedId);
  if (policy) return getPolicyEntityView(dataset, policy);
  const client = dataset.clients.find((item) => item.id === resolvedId);
  if (client) return getClientEntityView(dataset, client);
  const agent = dataset.agents.find((item) => item.id === resolvedId);
  if (agent) return getAgentEntityView(dataset, agent);
  return undefined;
}
