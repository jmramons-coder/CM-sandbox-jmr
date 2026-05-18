/**
 * Canada Life / GI demo policy tree (POL-9847231) — merged into the active dataset so
 * participants resolve to client records and agents to agent records.
 */
import type { AgentRecord, ClientRecord, PolicyParticipantRole, PolicyRecord } from './multi-case-dataset';

export const GI_DEMO_POLICY_ID = 'POL-9847231';

const ROLE_LABEL: Record<PolicyParticipantRole, string> = {
  owner: 'Policy Owner',
  insured: 'Primary Insured',
  beneficiary: 'Beneficiary',
  payer: 'Payer',
  authorized_contact: 'Authorized contact',
};

export const GI_DEMO_CLIENT_RECORDS: ClientRecord[] = [
  {
    id: 'CLI-MARC',
    kind: 'client',
    name: 'Tremblay, Marc',
    type: 'person',
    status: 'active',
    category: 'policyholder',
    language: 'French',
    summary: 'Primary insured and policy owner on POL-9847231.',
    profile: {
      gender: 'Male',
      dob: '1982-11-03',
      age: 43,
      smoker: 'No',
      email: 'marc.tremblay@bell.ca',
      phone: '+1 (418) 555-0198',
      address: '145 rue des Érables, Sainte-Foy, QC',
      parish: 'Quebec',
    },
    linkedObjects: [{ kind: 'policy', id: GI_DEMO_POLICY_ID, label: GI_DEMO_POLICY_ID }],
  },
  {
    id: 'CLI-SOPHIE',
    kind: 'client',
    name: 'Tremblay, Sophie',
    type: 'person',
    status: 'active',
    category: 'policyholder',
    language: 'French',
    profile: {
      gender: 'Female',
      dob: '1985-07-22',
      age: 40,
      email: 'sophie.tremblay@bell.ca',
      phone: '+1 (418) 555-0199',
      address: '145 rue des Érables, Sainte-Foy, QC',
      parish: 'Quebec',
    },
    linkedObjects: [{ kind: 'policy', id: GI_DEMO_POLICY_ID, label: GI_DEMO_POLICY_ID }],
  },
  {
    id: 'CLI-LUCAS',
    kind: 'client',
    name: 'Tremblay, Lucas',
    type: 'person',
    status: 'active',
    category: 'dependent',
    language: 'French',
    profile: { gender: 'Male', dob: '2008-02-14', age: 18, address: '145 rue des Érables, Sainte-Foy, QC' },
    linkedObjects: [{ kind: 'policy', id: GI_DEMO_POLICY_ID, label: GI_DEMO_POLICY_ID }],
  },
  {
    id: 'CLI-EMMA',
    kind: 'client',
    name: 'Tremblay, Emma',
    type: 'person',
    status: 'active',
    category: 'dependent',
    language: 'French',
    profile: { gender: 'Female', dob: '2011-09-03', age: 14, address: '145 rue des Érables, Sainte-Foy, QC' },
    linkedObjects: [{ kind: 'policy', id: GI_DEMO_POLICY_ID, label: GI_DEMO_POLICY_ID }],
  },
  {
    id: 'CLI-GAGNON-ROBERT',
    kind: 'client',
    name: 'Gagnon, Robert',
    type: 'person',
    status: 'active',
    category: 'relatedParty',
    language: 'French',
    profile: {
      gender: 'Male',
      email: 'robert.gagnon@videotron.ca',
      phone: '+1 (418) 555-0301',
    },
    linkedObjects: [{ kind: 'policy', id: GI_DEMO_POLICY_ID, label: GI_DEMO_POLICY_ID }],
  },
  {
    id: 'CLI-GAGNON-MONIQUE',
    kind: 'client',
    name: 'Gagnon, Monique',
    type: 'person',
    status: 'active',
    category: 'relatedParty',
    language: 'French',
    profile: { gender: 'Female', phone: '+1 (418) 555-0302' },
    linkedObjects: [{ kind: 'policy', id: GI_DEMO_POLICY_ID, label: GI_DEMO_POLICY_ID }],
  },
];

export const GI_DEMO_AGENT_RECORDS: AgentRecord[] = [
  {
    id: 'AGT-BEAULIEU',
    kind: 'agent',
    name: 'Beaulieu, Nathalie',
    status: 'active',
    producerCode: 'AGT-9847231',
    agencyName: 'Assurances QC',
    email: 'nathalie.beaulieu@assurancesqc.ca',
    phone: '+1 (418) 555-0142',
    jurisdictionSummary: 'Quebec',
    licenses: [{ id: 'LIC-BEAULIEU-QC', jurisdiction: 'Quebec', status: 'active', effectiveDate: '2011-03-22' }],
    contracts: [{ id: 'CON-BEAULIEU-9847231', carrier: 'Canada Life', status: 'active', effectiveDate: '2019-05-01' }],
    linkedObjects: [{ kind: 'policy', id: GI_DEMO_POLICY_ID, label: GI_DEMO_POLICY_ID }],
  },
  {
    id: 'AGT-FOURNIER',
    kind: 'agent',
    name: 'Fournier, Jean-Philippe',
    status: 'active',
    producerCode: 'AGT-FOURNIER',
    agencyName: 'Sun Life Financial',
    email: 'jp.fournier@sunlife.ca',
    phone: '+1 (514) 555-0237',
    jurisdictionSummary: 'Quebec',
    licenses: [{ id: 'LIC-FOURNIER-QC', jurisdiction: 'Quebec', status: 'active', effectiveDate: '2014-06-01' }],
    contracts: [{ id: 'CON-FOURNIER-9847231', carrier: 'Canada Life', status: 'active', effectiveDate: '2019-05-01' }],
    linkedObjects: [{ kind: 'policy', id: GI_DEMO_POLICY_ID, label: GI_DEMO_POLICY_ID }],
  },
];

export const GI_DEMO_POLICY_RECORD: PolicyRecord = {
  id: GI_DEMO_POLICY_ID,
  kind: 'policy',
  label: 'POL-9847231',
  status: 'Active',
  product: 'Whole Life · Performax Gold',
  policyNumber: 'POL-9847231',
  productType: 'whole_life',
  coverageAmount: '$500,000',
  effectiveDate: '2019-05-01',
  issueDate: '2019-04-15',
  clientId: 'CLI-MARC',
  participants: [
    { clientId: 'CLI-MARC', role: 'owner', effectiveDate: '2019-05-01' },
    { clientId: 'CLI-MARC', role: 'insured', effectiveDate: '2019-05-01' },
    { clientId: 'CLI-MARC', role: 'payer', effectiveDate: '2019-05-01' },
    { clientId: 'CLI-SOPHIE', role: 'insured', effectiveDate: '2019-05-01' },
    { clientId: 'CLI-SOPHIE', role: 'owner', effectiveDate: '2019-05-01' },
    { clientId: 'CLI-LUCAS', role: 'beneficiary', effectiveDate: '2019-05-01', allocationPct: 50 },
    { clientId: 'CLI-EMMA', role: 'beneficiary', effectiveDate: '2019-05-01', allocationPct: 50 },
    { clientId: 'CLI-GAGNON-ROBERT', role: 'beneficiary', effectiveDate: '2019-05-01' },
    { clientId: 'CLI-GAGNON-MONIQUE', role: 'beneficiary', effectiveDate: '2019-05-01' },
  ],
  agents: [
    { kind: 'agent', id: 'AGT-BEAULIEU', label: 'Beaulieu, Nathalie', role: 'Primary Servicing Agent' },
    { kind: 'agent', id: 'AGT-FOURNIER', label: 'Fournier, Jean-Philippe', role: 'Additional Servicing Agent' },
  ],
  linkedObjects: [
    { kind: 'client', id: 'CLI-MARC', label: 'Tremblay, Marc' },
    { kind: 'client', id: 'CLI-SOPHIE', label: 'Tremblay, Sophie' },
    { kind: 'agent', id: 'AGT-BEAULIEU', label: 'Beaulieu, Nathalie' },
    { kind: 'agent', id: 'AGT-FOURNIER', label: 'Fournier, Jean-Philippe' },
  ],
};

/** Legacy participant folder ids → client ids (sidebar / bookmarks). */
export const PARTICIPANT_FOLDER_ID_ALIASES: Record<string, string> = {
  'PAR-TREMBLAY-MARC': 'CLI-MARC',
  'PAR-TREMBLAY-SOPHIE': 'CLI-SOPHIE',
  'PAR-TREMBLAY-LUCAS': 'CLI-LUCAS',
  'PAR-TREMBLAY-EMMA': 'CLI-EMMA',
  'PAR-GAGNON-ROBERT': 'CLI-GAGNON-ROBERT',
  'PAR-GAGNON-MONIQUE': 'CLI-GAGNON-MONIQUE',
};

export function resolveEntityFolderId(id: string | undefined): string | undefined {
  if (!id) return id;
  return PARTICIPANT_FOLDER_ID_ALIASES[id] ?? id;
}

export function formatParticipantRoles(roles: PolicyParticipantRole[]): string {
  return roles.map((role) => ROLE_LABEL[role] ?? role).join(', ');
}

export function mergeGiDemoEntities<T extends { clients: ClientRecord[]; policies: PolicyRecord[]; agents: AgentRecord[] }>(
  dataset: T,
): T {
  const clientIds = new Set(dataset.clients.map((row) => row.id));
  const policyIds = new Set(dataset.policies.map((row) => row.id));
  const agentIds = new Set(dataset.agents.map((row) => row.id));

  return {
    ...dataset,
    clients: [
      ...dataset.clients,
      ...GI_DEMO_CLIENT_RECORDS.filter((row) => !clientIds.has(row.id)),
    ],
    policies: [
      ...dataset.policies,
      ...(policyIds.has(GI_DEMO_POLICY_RECORD.id) ? [] : [GI_DEMO_POLICY_RECORD]),
    ],
    agents: [
      ...dataset.agents,
      ...GI_DEMO_AGENT_RECORDS.filter((row) => !agentIds.has(row.id)),
    ],
  };
}
