/**
 * Mock data for entity folders (Policy, Agent, Coverage, Participant).
 *
 * Policy POL-9847231 plus fully populated child entity overviews (agents,
 * coverages, participants) for the reference policy tree.
 */

import type { EntityFolderDef } from '../domain/entityFolders';

/**
 * Entity folder fixtures are authored in English here. Translated views are
 * produced by the selectors in `useFolders.ts`, which look up
 * `fixtures:entityFolders.<id>.*` keys for the active language and fall back
 * to these values when no translation is provided.
 */
export type EntityFolderRecord = EntityFolderDef;

/* ─── Policy: Tremblay, Marc ─── */

const POLICY_123: EntityFolderDef = {
  id: 'POL-9847231',
  type: 'policy',
  header: {
    title: 'POL-9847231',
    status: 'active',
    badges: [
      { label: 'Policy', tone: 'default' },
      { label: 'ACTIVE', tone: 'Informative' },
    ],
    actions: [
      { id: 'add' },
      { id: 'message' },
      { id: 'count', count: 0 },
      { id: 'more' },
    ],
  },
  tabs: [
    { id: 'information', label: 'Information' },
    { id: 'tasks', label: 'Tasks', count: 2, disabled: true },
    { id: 'documents', label: 'Documents', disabled: true },
    { id: 'requirements', label: 'Requirements', disabled: true },
    { id: 'notes', label: 'Notes', disabled: true },
    { id: 'reconciliation', label: 'Reconciliation', disabled: true },
    { id: 'business-event', label: 'Business Event', disabled: true },
    { id: 'activity-history', label: 'Activity History', disabled: true },
    { id: 'requests', label: 'Requests', disabled: true },
    { id: 'relationship', label: 'Relationship' },
  ],
  information: [
    {
      kind: 'fieldGrid',
      id: 'identification',
      title: 'IDENTIFICATION',
      layout: 'grid-3',
      fields: [
        { label: 'Carrier', value: 'Canada Life' },
        { label: 'Line of business', value: 'Life Insurance' },
        { label: 'Product type', value: 'Whole Life' },
        { label: 'Plan name', value: 'Performax Gold' },
        { label: 'Juridiction', value: 'Jurisdiction of Quebec' },
      ],
      rightPanel: {
        kind: 'timeline',
        icon: 'calendar',
        items: [
          { label: 'Issue Date', value: '2019-04-15' },
          { label: 'Effective Date', value: '2019-05-01' },
          { label: 'Termination Date', value: '-' },
        ],
      },
    },
    {
      kind: 'fieldGrid',
      id: 'policy-details',
      title: 'POLICY DETAILS',
      layout: 'grid-2',
      fields: [
        { label: 'Policy year', value: '7' },
        { label: 'Referral Source', value: 'Client Referral' },
      ],
    },
    {
      kind: 'fieldGrid',
      id: 'premium-payment',
      title: 'PREMIUM PAYMENT',
      layout: 'grid-4',
      fields: [
        { label: 'Paid to date', value: '2026-04-01' },
        { label: 'Billed to date', value: '2026-05-01' },
        { label: 'Premium paid status', value: 'Current' },
        { label: 'Premium payment end date', value: null },
        { label: 'Next billed amount', value: '$ 287.50' },
        { label: 'Grace period end date', value: null },
        { label: 'Grace amount', value: null },
      ],
    },
    {
      kind: 'fieldGrid',
      id: 'payment',
      title: 'PAYMENT',
      layout: 'grid-3',
      actions: [{ id: 'edit', label: 'EDIT', icon: 'edit' }],
      fields: [
        { label: 'Payment mode', value: 'Monthly' },
        { label: 'Payment method', value: 'Pre-authorized Debit' },
        { label: 'Day of Month', value: '1' },
      ],
    },
    {
      kind: 'tableSection',
      id: 'coverage-summary',
      title: 'COVERAGE SUMMARY',
      actions: [{ id: 'add', label: 'ADD', icon: 'add' }],
      columns: [
        { key: 'coverage', label: 'Coverage' },
        { key: 'insured', label: 'Insured' },
        { key: 'status', label: 'Status' },
        { key: 'amount', label: 'Amount', align: 'right' },
        { key: 'annualPremium', label: 'Annual premium', align: 'right' },
      ],
      rows: [
        { id: 'cs-1', cells: { coverage: 'Term 10 - Gold', insured: 'Tremblay, Marc', status: 'ACTIVE', amount: '$ 500,000.00', annualPremium: '$ 1,140.00' } },
        { id: 'cs-2', cells: { coverage: 'Term 20 - Silver', insured: 'Tremblay, Sophie', status: 'ACTIVE', amount: '$ 250,000.00', annualPremium: '$ 780.00' } },
        { id: 'cs-3', cells: { coverage: 'Whole Life - Performax', insured: 'Tremblay, Marc', status: 'ACTIVE', amount: '$ 100,000.00', annualPremium: '$ 1,320.00' } },
        { id: 'cs-4', cells: { coverage: 'Critical Illness - Basic', insured: 'Tremblay, Marc', status: 'ACTIVE', amount: '$ 50,000.00', annualPremium: '$ 210.00' } },
      ],
    },
    {
      kind: 'tableSection',
      id: 'premiums',
      title: 'PREMIUMS',
      actions: [{ id: 'add', label: 'ADD', icon: 'add' }],
      columns: [
        { key: 'type', label: 'Type' },
        { key: 'effective', label: 'Effective Date' },
        { key: 'expiry', label: 'Expiry Date' },
        { key: 'amount', label: 'Amount', align: 'right' },
      ],
      rows: [
        { id: 'pr-1', cells: { type: 'Total annual premium', effective: '-', expiry: '-', amount: '$ 3,450.00' } },
        { id: 'pr-2', cells: { type: 'Policy fee', effective: '2019-05-01', expiry: '-', amount: '$ 60.00' } },
      ],
      pagination: { perPage: 25, total: 2 },
    },
    {
      kind: 'tableSection',
      id: 'additional-info',
      title: 'ADDITIONAL INFORMATION',
      actions: [{ id: 'add', label: 'ADD', icon: 'add' }],
      columns: [
        { key: 'name', label: 'Field name', sortable: true },
        { key: 'value', label: 'Field value', sortable: true },
      ],
      rows: [
        { id: 'ai-1', cells: { name: 'Non-smoker discount', value: 'Yes' } },
        { id: 'ai-2', cells: { name: 'Multi-life discount', value: 'Yes' } },
      ],
      pagination: { perPage: 10, total: 2 },
    },
  ],
  subFolderGroups: [
    {
      type: 'agent',
      label: 'Agents',
      count: 2,
      childIds: [
        'AGT-BEAULIEU',
        'AGT-FOURNIER',
      ],
    },
    {
      type: 'coverage',
      label: 'Coverages',
      count: 4,
      childIds: [
        'COV-TERM10-GOLD',
        'COV-TERM20-SILVER',
        'COV-WL-PERFORMAX',
        'COV-CI-BASIC',
      ],
    },
    {
      type: 'participant',
      label: 'Participants',
      count: 6,
      childIds: [
        'CLI-MARC',
        'CLI-SOPHIE',
        'CLI-LUCAS',
        'CLI-EMMA',
        'CLI-GAGNON-ROBERT',
        'CLI-GAGNON-MONIQUE',
      ],
    },
  ],
};

/* ─── Agent: Beaulieu, Nathalie (full overview) ─── */

const AGENT_BEAULIEU: EntityFolderDef = {
  id: 'AGT-BEAULIEU',
  type: 'agent',
  parentId: 'POL-9847231',
  header: {
    title: 'Beaulieu, Nathalie',
    status: 'active',
    badges: [
      { label: 'Agent', tone: 'default' },
      { label: 'ACTIVE', tone: 'Informative' },
    ],
    avatar: { initials: 'NB', color: '#5b8abf' },
    actions: [
      { id: 'add' },
      { id: 'message' },
      { id: 'count', count: 0 },
      { id: 'more' },
    ],
  },
  tabs: [
    { id: 'information', label: 'Information' },
    { id: 'tasks', label: 'Tasks', disabled: true },
    { id: 'documents', label: 'Documents', disabled: true },
    { id: 'notes', label: 'Notes', disabled: true },
    { id: 'relationship', label: 'Relationship' },
  ],
  information: [
    {
      kind: 'fieldGrid',
      id: 'identification',
      title: 'IDENTIFICATION',
      layout: 'grid-3',
      fields: [
        { label: 'Name', value: 'Beaulieu, Nathalie' },
        { label: 'Establishment date', value: '2011-03-22' },
        { label: 'Synchronized with', value: 'Beaulieu, Nathalie', href: '#', hint: 'Agent' },
        { label: 'Language', value: 'French' },
        { label: 'Website', value: '-' },
      ],
    },
    {
      kind: 'contact',
      id: 'contact',
      title: 'CONTACT',
      emails: [{ kind: 'Business', address: 'nathalie.beaulieu@assurancesqc.ca' }],
      phones: [{ kind: 'Business', number: '+1 (418) 555-0142' }],
      addresses: [
        { kind: 'Business', address: '2800 boul. Laurier, bureau 400, Quebec, QC, G1V 0B9, Canada' },
      ],
    },
    {
      kind: 'tableSection',
      id: 'roles-summary',
      title: 'ROLES SUMMARY',
      actions: [{ id: 'add', label: 'ADD', icon: 'add' }],
      columns: [
        { key: 'role', label: 'Role' },
        { key: 'created', label: 'Created on' },
        { key: 'contract', label: 'Contract number' },
        { key: 'share', label: 'Share (%)' },
        { key: 'status', label: 'Status' },
      ],
      rows: [
        { id: 'rs-1', cells: { role: 'Primary Servicing Agent', created: '05/01/2019', contract: '9847231', share: '70.00%', status: 'ACTIVE' } },
      ],
    },
    {
      kind: 'tableSection',
      id: 'policy-relationships',
      title: 'POLICY RELATIONSHIPS',
      columns: [
        { key: 'policy', label: 'Policy' },
        { key: 'relationship', label: 'Relationship' },
        { key: 'effectiveDate', label: 'Effective date' },
        { key: 'status', label: 'Status' },
      ],
      rows: [
        {
          id: 'pr-1',
          href: '/folders/POL-9847231',
          cells: {
            policy: 'POL-9847231',
            relationship: 'Primary Servicing Agent',
            effectiveDate: '2019-05-01',
            status: 'ACTIVE',
          },
        },
      ],
    },
    {
      kind: 'tableSection',
      id: 'additional-info',
      title: 'ADDITIONAL INFORMATION',
      actions: [{ id: 'add', label: 'ADD', icon: 'add' }],
      columns: [
        { key: 'name', label: 'Field name' },
        { key: 'value', label: 'Field value' },
      ],
      rows: [],
      emptyState: {
        message:
          'There is no additional information on this entity.\nOnce added additional information will be displayed here.',
      },
    },
  ],
};

/* ─── Coverage: Term 10 - Gold (full overview) ─── */

const COVERAGE_TERM10: EntityFolderDef = {
  id: 'COV-TERM10-GOLD',
  type: 'coverage',
  parentId: 'POL-9847231',
  header: {
    title: 'Term 10 - Gold',
    status: 'active',
    badges: [
      { label: 'Coverage', tone: 'default' },
      { label: 'ACTIVE', tone: 'Informative' },
    ],
    actions: [
      { id: 'add' },
      { id: 'message' },
      { id: 'count', count: 0 },
      { id: 'more' },
    ],
  },
  tabs: [
    { id: 'information', label: 'Information' },
    { id: 'tasks', label: 'Tasks', disabled: true },
    { id: 'documents', label: 'Documents', disabled: true },
    { id: 'notes', label: 'Notes', disabled: true },
    { id: 'relationship', label: 'Relationship' },
  ],
  information: [
    {
      kind: 'fieldGrid',
      id: 'identification',
      title: 'IDENTIFICATION',
      layout: 'grid-3',
      fields: [
        { label: 'Name', value: 'Term 10 - Gold' },
        { label: 'Type', value: 'Term' },
        { label: 'Level', value: 'Base' },
        { label: 'Parent link', value: '—' },
        { label: 'Insured', value: 'Tremblay, Marc' },
        { label: 'Status', value: 'Active' },
      ],
    },
    {
      kind: 'fieldGrid',
      id: 'financial',
      title: 'FINANCIAL',
      layout: 'grid-3',
      actions: [{ id: 'edit', label: 'EDIT', icon: 'edit' }],
      fields: [
        { label: 'Coverage amount', value: '$ 500,000.00' },
        { label: 'Annual premium', value: '$ 1,140.00' },
        { label: 'Premium frequency', value: 'Monthly' },
      ],
    },
    {
      kind: 'tableSection',
      id: 'additional-info',
      title: 'ADDITIONAL INFORMATION',
      actions: [{ id: 'add', label: 'ADD', icon: 'add' }],
      columns: [
        { key: 'name', label: 'Field name' },
        { key: 'value', label: 'Field value' },
      ],
      rows: [],
      emptyState: {
        message:
          'There is no additional information on this entity.\nOnce added additional information will be displayed here.',
      },
    },
  ],
};

/* ─── Participant: Tremblay, Marc (full overview) ─── */

const PARTICIPANT_MARC: EntityFolderDef = {
  id: 'PAR-TREMBLAY-MARC',
  type: 'participant',
  parentId: 'POL-9847231',
  header: {
    title: 'Tremblay, Marc',
    status: 'active',
    badges: [
      { label: 'Participant', tone: 'default' },
      { label: 'ACTIVE', tone: 'Informative' },
    ],
    avatar: { initials: 'MT', color: '#5b8abf' },
    actions: [
      { id: 'add' },
      { id: 'message' },
      { id: 'count', count: 0 },
      { id: 'more' },
    ],
  },
  tabs: [
    { id: 'information', label: 'Information' },
    { id: 'tasks', label: 'Tasks', disabled: true },
    { id: 'documents', label: 'Documents', disabled: true },
    { id: 'notes', label: 'Notes', disabled: true },
    { id: 'relationship', label: 'Relationship' },
  ],
  information: [
    {
      kind: 'fieldGrid',
      id: 'identification',
      title: 'IDENTIFICATION',
      layout: 'grid-3',
      fields: [
        { label: 'Name', value: 'Tremblay, Marc' },
        { label: 'Date of birth', value: '1982-11-03' },
        { label: 'Gender', value: 'Male' },
        { label: 'Smoker', value: 'No' },
        { label: 'Language', value: 'French' },
      ],
    },
    {
      kind: 'contact',
      id: 'contact',
      title: 'CONTACT',
      emails: [{ kind: 'Personal', address: 'marc.tremblay@bell.ca' }],
      phones: [{ kind: 'Personal', number: '+1 (418) 555-0198' }],
      addresses: [{ kind: 'Residence', address: '145 rue des Érables, Sainte-Foy, QC, G1V 3T7, Canada' }],
    },
    {
      kind: 'tableSection',
      id: 'roles-summary',
      title: 'ROLES SUMMARY',
      actions: [{ id: 'add', label: 'ADD', icon: 'add' }],
      columns: [
        { key: 'role', label: 'Role' },
        { key: 'created', label: 'Created on' },
        { key: 'status', label: 'Status' },
      ],
      rows: [
        { id: 'rs-1', cells: { role: 'Primary Insured', created: '05/01/2019', status: 'ACTIVE' } },
        { id: 'rs-2', cells: { role: 'Policy Owner', created: '05/01/2019', status: 'ACTIVE' } },
        { id: 'rs-3', cells: { role: 'Payer', created: '05/01/2019', status: 'ACTIVE' } },
      ],
    },
    {
      kind: 'tableSection',
      id: 'additional-info',
      title: 'ADDITIONAL INFORMATION',
      actions: [{ id: 'add', label: 'ADD', icon: 'add' }],
      columns: [
        { key: 'name', label: 'Field name' },
        { key: 'value', label: 'Field value' },
      ],
      rows: [],
      emptyState: {
        message:
          'There is no additional information on this entity.\nOnce added additional information will be displayed here.',
      },
    },
  ],
};

/* ─── Client: Tremblay, Marc (top-level main entity) ─── */

const CLIENT_MARC: EntityFolderDef = {
  id: 'CLI-MARC',
  type: 'client',
  header: {
    title: 'Tremblay, Marc',
    status: 'active',
    badges: [
      { label: 'Client', tone: 'default' },
      { label: 'ACTIVE', tone: 'Informative' },
    ],
    avatar: { initials: 'MT', color: '#F7E8DF' },
    actions: [
      { id: 'add' },
      { id: 'message' },
      { id: 'count', count: 0 },
      { id: 'more' },
    ],
  },
  tabs: [
    { id: 'information', label: 'Information' },
    { id: 'tasks', label: 'Tasks', disabled: true },
    { id: 'documents', label: 'Documents', disabled: true },
    { id: 'requests', label: 'Requests', disabled: true },
    { id: 'notes', label: 'Notes', disabled: true },
    { id: 'activity-history', label: 'Activity History', disabled: true },
    { id: 'relationship', label: 'Relationship' },
  ],
  information: [
    {
      kind: 'fieldGrid',
      id: 'identification',
      title: 'IDENTIFICATION',
      layout: 'grid-3',
      fields: [
        { label: 'Name', value: 'Tremblay, Marc' },
        { label: 'Client ID', value: 'CLI-MARC' },
        { label: 'Date of birth', value: '1982-11-03' },
        { label: 'Age', value: '43' },
        { label: 'Gender', value: 'Male' },
        { label: 'Smoker', value: 'No' },
        { label: 'Language', value: 'French' },
        { label: 'Category', value: 'Policyholder' },
        { label: 'Tax ID', value: '—' },
      ],
    },
    {
      kind: 'contact',
      id: 'contact',
      title: 'CONTACT',
      emails: [{ kind: 'Personal', address: 'marc.tremblay@bell.ca' }],
      phones: [{ kind: 'Personal', number: '+1 (876) 555-0198' }],
      addresses: [{ kind: 'Residence', address: '12 Hope Road, Kingston, Kingston' }],
    },
    {
      kind: 'tableSection',
      id: 'policy-participation',
      title: 'POLICY PARTICIPATION',
      columns: [
        { key: 'policy', label: 'Policy' },
        { key: 'roles', label: 'Roles' },
        { key: 'status', label: 'Status' },
        { key: 'effective', label: 'Effective date' },
      ],
      rows: [
        {
          id: 'pp-1',
          href: '/folders/POL-9847231',
          cells: {
            policy: 'POL-9847231',
            roles: 'Primary Insured, Policy Owner, Payer',
            status: 'ACTIVE',
            effective: '2019-05-01',
          },
        },
      ],
    },
    {
      kind: 'tableSection',
      id: 'coverage-roles',
      title: 'COVERAGE ROLES',
      columns: [
        { key: 'coverage', label: 'Coverage' },
        { key: 'role', label: 'Role' },
        { key: 'amount', label: 'Amount', align: 'right' },
        { key: 'annualPremium', label: 'Annual premium', align: 'right' },
      ],
      rows: [
        { id: 'cr-1', cells: { coverage: 'Term 10 - Gold', role: 'Insured', amount: '$ 500,000.00', annualPremium: '$ 1,140.00' } },
        { id: 'cr-2', cells: { coverage: 'Whole Life - Performax', role: 'Insured', amount: '$ 100,000.00', annualPremium: '$ 1,320.00' } },
        { id: 'cr-3', cells: { coverage: 'Critical Illness - Basic', role: 'Insured', amount: '$ 50,000.00', annualPremium: '$ 210.00' } },
      ],
    },
    {
      kind: 'tableSection',
      id: 'additional-info',
      title: 'ADDITIONAL INFORMATION',
      actions: [{ id: 'add', label: 'ADD', icon: 'add' }],
      columns: [
        { key: 'name', label: 'Field name' },
        { key: 'value', label: 'Field value' },
      ],
      rows: [
        { id: 'ai-1', cells: { name: 'Source policy participant', value: 'PAR-TREMBLAY-MARC' } },
        { id: 'ai-2', cells: { name: 'Source policy', value: 'POL-9847231' } },
      ],
    },
  ],
  subFolderGroups: [],
};

/* ─── Child entity list rows (policy sub-folders) ─── */

type StubAgentRow = { id: string; name: string; roles: string; phone?: string; email?: string };
type StubCoverageRow = { id: string; name: string; type: string; level: string; amount?: string; annualPremium?: string; parent?: string };
type StubParticipantRow = { id: string; name: string; roles: string; phone?: string; email?: string };

const AGENT_STUBS: StubAgentRow[] = [
  { id: 'AGT-BEAULIEU', name: 'Beaulieu, Nathalie', roles: 'Primary Servicing Agent', phone: '+1 (418) 555-0142', email: 'nathalie.beaulieu@assurancesqc.ca' },
  { id: 'AGT-FOURNIER', name: 'Fournier, Jean-Philippe', roles: 'Additional Servicing Agent', phone: '+1 (514) 555-0237', email: 'jp.fournier@sunlife.ca' },
];

const COVERAGE_STUBS: StubCoverageRow[] = [
  { id: 'COV-TERM10-GOLD', name: 'Term 10 - Gold', type: 'Term', level: 'Base', amount: '$ 500,000.00', annualPremium: '$ 1,140.00' },
  { id: 'COV-TERM20-SILVER', name: 'Term 20 - Silver', type: 'Term', level: 'Base', amount: '$ 250,000.00', annualPremium: '$ 780.00' },
  { id: 'COV-WL-PERFORMAX', name: 'Whole Life - Performax', type: 'Whole Life', level: 'Base', amount: '$ 100,000.00', annualPremium: '$ 1,320.00' },
  { id: 'COV-CI-BASIC', name: 'Critical Illness - Basic', type: 'Critical Illness', level: 'Rider', amount: '$ 50,000.00', annualPremium: '$ 210.00', parent: 'Term 10 - Gold' },
];

/** Fallback list rows when dataset policy rows are unavailable (ids are client records). */
const PARTICIPANT_STUBS: StubParticipantRow[] = [
  { id: 'CLI-MARC', name: 'Tremblay, Marc', roles: 'Primary Insured, Policy Owner, Payer', phone: '+1 (418) 555-0198', email: 'marc.tremblay@bell.ca' },
  { id: 'CLI-SOPHIE', name: 'Tremblay, Sophie', roles: 'Coverage Insured, Contingent Owner', phone: '+1 (418) 555-0199', email: 'sophie.tremblay@bell.ca' },
  { id: 'CLI-LUCAS', name: 'Tremblay, Lucas', roles: 'Beneficiary Primary', phone: '', email: '' },
  { id: 'CLI-EMMA', name: 'Tremblay, Emma', roles: 'Beneficiary Primary', phone: '', email: '' },
  { id: 'CLI-GAGNON-ROBERT', name: 'Gagnon, Robert', roles: 'Contingent Beneficiary, Trustee', phone: '+1 (418) 555-0301', email: 'robert.gagnon@videotron.ca' },
  { id: 'CLI-GAGNON-MONIQUE', name: 'Gagnon, Monique', roles: 'Contingent Beneficiary', phone: '+1 (418) 555-0302', email: '' },
];

export const AGENT_LIST_ROWS = AGENT_STUBS;
export const COVERAGE_LIST_ROWS = COVERAGE_STUBS;
export const PARTICIPANT_LIST_ROWS = PARTICIPANT_STUBS;

const POLICY_ID = POLICY_123.id;

/** Coverage entities are list-only for now — no dataset-backed overview yet. */
function coverageStubDef(id: string, title: string): EntityFolderDef {
  return {
    id,
    type: 'coverage',
    parentId: POLICY_ID,
    header: {
      title,
      status: 'active',
      badges: [
        { label: 'Coverage', tone: 'default' },
        { label: 'ACTIVE', tone: 'Informative' },
      ],
      actions: [],
    },
    tabs: [],
    information: [],
  };
}

const COVERAGE_STUB_DEFS: EntityFolderDef[] = COVERAGE_STUBS.map((row) =>
  coverageStubDef(row.id, row.name),
);

/* ─── Relationship tab data ─── */

export type RelationshipFolderType = 'Policy' | 'Client' | 'Agent' | 'Coverage' | 'Participant';

export type RelationshipCandidate = {
  id: string;
  folderType: RelationshipFolderType;
  folderName: string;
};

export type EntityRelationshipRow = {
  id: string;
  folderId: string;
  folderName: string;
  folderType: RelationshipFolderType;
  relationship: string;
  effectiveDate: string;
  expirationDate: string;
  status: 'ACTIVE' | 'INACTIVE';
};

export const RELATIONSHIP_FOLDER_TYPES: RelationshipFolderType[] = ['Policy', 'Client', 'Agent', 'Coverage', 'Participant'];

export const RELATIONSHIP_OPTIONS_BY_TYPE: Record<RelationshipFolderType, string[]> = {
  Policy: ['Policy', 'Related policy', 'Coverage context'],
  Client: ['Client', 'Primary party', 'Owner', 'Insured', 'Beneficiary', 'Payer'],
  Agent: ['Agent', 'Primary servicing agent', 'Secondary servicing agent'],
  Coverage: ['Coverage', 'Base coverage', 'Rider coverage'],
  Participant: ['Participant', 'Policy owner', 'Beneficiary', 'Payer', 'Insured'],
};

export const RELATIONSHIP_CANDIDATES: RelationshipCandidate[] = [
  { id: POLICY_123.id, folderType: 'Policy' as const, folderName: POLICY_123.header.title },
  ...PARTICIPANT_STUBS.map((participant) => ({ id: participant.id, folderType: 'Client' as const, folderName: participant.name })),
  ...AGENT_STUBS.map((agent) => ({ id: agent.id, folderType: 'Agent' as const, folderName: agent.name })),
  ...COVERAGE_STUBS.map((coverage) => ({ id: coverage.id, folderType: 'Coverage' as const, folderName: coverage.name })),
];

const RELATIONSHIP_ROWS_BY_ENTITY_ID: Record<string, EntityRelationshipRow[]> = {};

let relationshipIdCounter = 2;

export function getEntityRelationships(entityId: string | undefined): EntityRelationshipRow[] {
  if (!entityId) return [];
  return RELATIONSHIP_ROWS_BY_ENTITY_ID[entityId] ?? [];
}

export function addEntityRelationships(entityId: string, rows: Omit<EntityRelationshipRow, 'id'>[]) {
  const existing = RELATIONSHIP_ROWS_BY_ENTITY_ID[entityId] ?? [];
  const nextRows = rows.map((row) => ({
    ...row,
    id: `REL-${relationshipIdCounter++}`,
  }));
  RELATIONSHIP_ROWS_BY_ENTITY_ID[entityId] = [...existing, ...nextRows];
  return RELATIONSHIP_ROWS_BY_ENTITY_ID[entityId];
}

/* ─── Client search data (for Add Participant combobox) ─── */

export type MockClient = {
  id: string;
  name: string;
  initials: string;
  status?: 'active' | 'inactive';
  category?: 'policyholder' | 'dependent' | 'relatedParty';
  gender: string;
  dob: string;
  age: number;
  email: string;
  phone?: string;
  address?: string;
  parish?: string;
  taxId?: string;
  avatarColor: string;
  avatarTextColor?: string;
};

export const MOCK_CLIENTS: MockClient[] = [
  { id: 'CLI-MARC', name: 'Tremblay, Marc', initials: 'MT', status: 'active', category: 'policyholder', gender: 'Male', dob: '1982-11-03', age: 43, email: 'marc.tremblay@bell.ca', phone: '+1 (876) 555-0198', address: '12 Hope Road, Kingston', parish: 'Kingston', avatarColor: '#F7E8DF', avatarTextColor: '#5B230F' },
  { id: 'CLI-SOPHIE', name: 'Tremblay, Sophie', initials: 'ST', status: 'active', category: 'policyholder', gender: 'Female', dob: '1985-07-22', age: 40, email: 'sophie.tremblay@bell.ca', phone: '+1 (876) 555-0199', address: '12 Hope Road, Kingston', parish: 'Kingston', avatarColor: '#EEE9F1', avatarTextColor: '#1A1739' },
  { id: 'CLI-LUCAS', name: 'Tremblay, Lucas', initials: 'LT', status: 'active', category: 'dependent', gender: 'Male', dob: '2008-02-14', age: 18, email: '', phone: '', address: '12 Hope Road, Kingston', parish: 'Kingston', avatarColor: '#F5F1E6', avatarTextColor: '#78520F' },
  { id: 'CLI-EMMA', name: 'Tremblay, Emma', initials: 'ET', status: 'active', category: 'dependent', gender: 'Female', dob: '2011-09-03', age: 14, email: '', phone: '', address: '12 Hope Road, Kingston', parish: 'Kingston', avatarColor: '#E5F2F4', avatarTextColor: '#17494A' },
  { id: 'CLI-ROBERT', name: 'Gagnon, Robert', initials: 'RG', status: 'inactive', category: 'relatedParty', gender: 'Male', dob: '1955-04-18', age: 71, email: 'robert.gagnon@videotron.ca', phone: '+1 (876) 555-0301', address: '7 Orchid Close, St. Andrew', parish: 'St. Andrew', avatarColor: '#F0F4E8', avatarTextColor: '#405B17' },
  { id: 'CLI-MONIQUE', name: 'Gagnon, Monique', initials: 'MG', status: 'inactive', category: 'relatedParty', gender: 'Female', dob: '1957-12-05', age: 68, email: '', phone: '+1 (876) 555-0302', address: '7 Orchid Close, St. Andrew', parish: 'St. Andrew', avatarColor: '#E8EEF7', avatarTextColor: '#173D6F' },
  { id: 'CLI-ANDERSON-KAREN', name: 'Anderson, Karen', initials: 'KA', status: 'active', category: 'policyholder', gender: 'Female', dob: '1979-06-12', age: 46, email: 'karen.anderson@gmail.com', phone: '+1 (876) 555-0410', address: '24 Barbican Road, Kingston', parish: 'St. Andrew', taxId: '101-224-883', avatarColor: '#F7E8DF', avatarTextColor: '#5B230F' },
  { id: 'CLI-BROWN-MICHAEL', name: 'Brown, Michael', initials: 'MB', status: 'active', category: 'policyholder', gender: 'Male', dob: '1974-01-28', age: 52, email: 'michael.brown@outlook.com', phone: '+1 (876) 555-0411', address: '88 Constant Spring Road, Kingston', parish: 'St. Andrew', taxId: '113-490-272', avatarColor: '#EEE9F1', avatarTextColor: '#1A1739' },
  { id: 'CLI-CAMPBELL-ALICIA', name: 'Campbell, Alicia', initials: 'AC', status: 'active', category: 'relatedParty', gender: 'Female', dob: '1990-08-19', age: 35, email: 'alicia.campbell@yahoo.com', phone: '+1 (876) 555-0412', address: '15 Seaview Avenue, Montego Bay', parish: 'St. James', taxId: '118-703-551', avatarColor: '#F5F1E6', avatarTextColor: '#78520F' },
  { id: 'CLI-CLARKE-DAVID', name: 'Clarke, David', initials: 'DC', status: 'inactive', category: 'policyholder', gender: 'Male', dob: '1968-03-07', age: 58, email: 'david.clarke@proton.me', phone: '+1 (876) 555-0413', address: '3 Queen Street, Morant Bay', parish: 'St. Thomas', taxId: '120-811-337', avatarColor: '#E5F2F4', avatarTextColor: '#17494A' },
  { id: 'CLI-DAVIS-NADINE', name: 'Davis, Nadine', initials: 'ND', status: 'active', category: 'policyholder', gender: 'Female', dob: '1983-10-30', age: 42, email: 'nadine.davis@icloud.com', phone: '+1 (876) 555-0414', address: '41 Manchester Road, Mandeville', parish: 'Manchester', taxId: '130-219-604', avatarColor: '#F0F4E8', avatarTextColor: '#405B17' },
  { id: 'CLI-EDWARDS-PAUL', name: 'Edwards, Paul', initials: 'PE', status: 'active', category: 'relatedParty', gender: 'Male', dob: '1959-12-14', age: 66, email: 'paul.edwards@outlook.com', phone: '+1 (876) 555-0415', address: '9 Red Hills Road, Kingston', parish: 'St. Andrew', taxId: '145-600-912', avatarColor: '#E8EEF7', avatarTextColor: '#173D6F' },
  { id: 'CLI-FOSTER-MELISSA', name: 'Foster, Melissa', initials: 'MF', status: 'active', category: 'policyholder', gender: 'Female', dob: '1988-05-24', age: 37, email: 'melissa.foster@gmail.com', phone: '+1 (876) 555-0416', address: '62 Main Street, Ocho Rios', parish: 'St. Ann', taxId: '151-934-008', avatarColor: '#F7E8DF', avatarTextColor: '#5B230F' },
  { id: 'CLI-GRANT-OMAR', name: 'Grant, Omar', initials: 'OG', status: 'inactive', category: 'relatedParty', gender: 'Male', dob: '1971-09-02', age: 54, email: '', phone: '+1 (876) 555-0417', address: '10 West Street, Port Antonio', parish: 'Portland', taxId: '162-500-319', avatarColor: '#EEE9F1', avatarTextColor: '#1A1739' },
  { id: 'CLI-HALL-SIMONE', name: 'Hall, Simone', initials: 'SH', status: 'active', category: 'policyholder', gender: 'Female', dob: '1992-02-11', age: 34, email: 'simone.hall@live.com', phone: '+1 (876) 555-0418', address: '5 Market Street, Falmouth', parish: 'Trelawny', taxId: '174-782-406', avatarColor: '#F5F1E6', avatarTextColor: '#78520F' },
  { id: 'CLI-HENRY-KEVIN', name: 'Henry, Kevin', initials: 'KH', status: 'active', category: 'dependent', gender: 'Male', dob: '2006-11-25', age: 19, email: 'kevin.henry@gmail.com', phone: '', address: '5 Market Street, Falmouth', parish: 'Trelawny', taxId: '181-604-227', avatarColor: '#E5F2F4', avatarTextColor: '#17494A' },
  { id: 'CLI-JOHNSON-PATRICIA', name: 'Johnson, Patricia', initials: 'PJ', status: 'inactive', category: 'policyholder', gender: 'Female', dob: '1962-07-18', age: 63, email: 'patricia.johnson@outlook.com', phone: '+1 (876) 555-0420', address: '17 Hospital Road, Savanna-la-Mar', parish: 'Westmoreland', taxId: '199-214-730', avatarColor: '#F0F4E8', avatarTextColor: '#405B17' },
  { id: 'CLI-KING-TREVOR', name: 'King, Trevor', initials: 'TK', status: 'active', category: 'relatedParty', gender: 'Male', dob: '1980-04-04', age: 46, email: 'trevor.king@yahoo.com', phone: '+1 (876) 555-0421', address: '27 Spanish Town Road, Spanish Town', parish: 'St. Catherine', taxId: '207-810-659', avatarColor: '#E8EEF7', avatarTextColor: '#173D6F' },
  { id: 'CLI-LEWIS-CHANTAL', name: 'Lewis, Chantal', initials: 'CL', status: 'active', category: 'policyholder', gender: 'Female', dob: '1986-12-09', age: 39, email: 'chantal.lewis@gmail.com', phone: '+1 (876) 555-0422', address: '36 East Queen Street, Kingston', parish: 'Kingston', taxId: '219-673-884', avatarColor: '#F7E8DF', avatarTextColor: '#5B230F' },
  { id: 'CLI-MILLER-DWAYNE', name: 'Miller, Dwayne', initials: 'DM', status: 'inactive', category: 'relatedParty', gender: 'Male', dob: '1976-06-21', age: 49, email: 'dwayne.miller@icloud.com', phone: '+1 (876) 555-0423', address: '14 High Street, Black River', parish: 'St. Elizabeth', taxId: '225-490-150', avatarColor: '#EEE9F1', avatarTextColor: '#1A1739' },
  { id: 'CLI-MORGAN-SASHA', name: 'Morgan, Sasha', initials: 'SM', status: 'active', category: 'policyholder', gender: 'Female', dob: '1994-01-16', age: 32, email: 'sasha.morgan@gmail.com', phone: '+1 (876) 555-0424', address: '53 Knutsford Boulevard, Kingston', parish: 'Kingston', taxId: '237-815-902', avatarColor: '#F5F1E6', avatarTextColor: '#78520F' },
  { id: 'CLI-NELSON-BRIAN', name: 'Nelson, Brian', initials: 'BN', status: 'active', category: 'policyholder', gender: 'Male', dob: '1969-08-27', age: 56, email: 'brian.nelson@bell.ca', phone: '+1 (876) 555-0425', address: '11 Harbour Street, Kingston', parish: 'Kingston', taxId: '246-103-587', avatarColor: '#E5F2F4', avatarTextColor: '#17494A' },
  { id: 'CLI-PALMER-RENEE', name: 'Palmer, Renee', initials: 'RP', status: 'inactive', category: 'dependent', gender: 'Female', dob: '2003-05-06', age: 22, email: '', phone: '', address: '11 Harbour Street, Kingston', parish: 'Kingston', taxId: '251-900-476', avatarColor: '#F0F4E8', avatarTextColor: '#405B17' },
  { id: 'CLI-REID-ANTHONY', name: 'Reid, Anthony', initials: 'AR', status: 'active', category: 'relatedParty', gender: 'Male', dob: '1951-11-13', age: 74, email: 'anthony.reid@videotron.ca', phone: '+1 (876) 555-0427', address: '8 Church Street, Lucea', parish: 'Hanover', taxId: '269-382-107', avatarColor: '#E8EEF7', avatarTextColor: '#173D6F' },
  { id: 'CLI-ROBINSON-TANYA', name: 'Robinson, Tanya', initials: 'TR', status: 'active', category: 'policyholder', gender: 'Female', dob: '1981-03-22', age: 45, email: 'tanya.robinson@outlook.com', phone: '+1 (876) 555-0428', address: '72 Main Street, May Pen', parish: 'Clarendon', taxId: '273-661-904', avatarColor: '#F7E8DF', avatarTextColor: '#5B230F' },
  { id: 'CLI-SCOTT-GABRIEL', name: 'Scott, Gabriel', initials: 'GS', status: 'inactive', category: 'relatedParty', gender: 'Male', dob: '1991-09-29', age: 34, email: 'gabriel.scott@gmail.com', phone: '+1 (876) 555-0429', address: '19 Ward Avenue, Mandeville', parish: 'Manchester', taxId: '284-771-330', avatarColor: '#EEE9F1', avatarTextColor: '#1A1739' },
  { id: 'CLI-SMITH-DENISE', name: 'Smith, Denise', initials: 'DS', status: 'active', category: 'policyholder', gender: 'Female', dob: '1977-02-02', age: 49, email: 'denise.smith@yahoo.com', phone: '+1 (876) 555-0430', address: '4 Trafalgar Road, Kingston', parish: 'St. Andrew', taxId: '291-542-086', avatarColor: '#F5F1E6', avatarTextColor: '#78520F' },
  { id: 'CLI-STEWART-ANDRE', name: 'Stewart, Andre', initials: 'AS', status: 'active', category: 'policyholder', gender: 'Male', dob: '1984-10-17', age: 41, email: 'andre.stewart@icloud.com', phone: '+1 (876) 555-0431', address: '31 Brunswick Avenue, Spanish Town', parish: 'St. Catherine', taxId: '308-461-755', avatarColor: '#E5F2F4', avatarTextColor: '#17494A' },
  { id: 'CLI-THOMAS-ERICA', name: 'Thomas, Erica', initials: 'ET', status: 'inactive', category: 'dependent', gender: 'Female', dob: '2001-07-08', age: 24, email: 'erica.thomas@gmail.com', phone: '', address: '31 Brunswick Avenue, Spanish Town', parish: 'St. Catherine', taxId: '315-204-668', avatarColor: '#F0F4E8', avatarTextColor: '#405B17' },
  { id: 'CLI-WALKER-MARLON', name: 'Walker, Marlon', initials: 'MW', status: 'active', category: 'relatedParty', gender: 'Male', dob: '1972-12-31', age: 53, email: 'marlon.walker@outlook.com', phone: '+1 (876) 555-0433', address: '44 Main Road, Annotto Bay', parish: 'St. Mary', taxId: '327-803-009', avatarColor: '#E8EEF7', avatarTextColor: '#173D6F' },
  { id: 'CLI-WILLIAMS-JANICE', name: 'Williams, Janice', initials: 'JW', status: 'active', category: 'policyholder', gender: 'Female', dob: '1965-04-26', age: 60, email: 'janice.williams@live.com', phone: '+1 (876) 555-0434', address: '28 Duke Street, Kingston', parish: 'Kingston', taxId: '336-280-194', avatarColor: '#F7E8DF', avatarTextColor: '#5B230F' },
  { id: 'CLI-WRIGHT-DONOVAN', name: 'Wright, Donovan', initials: 'DW', status: 'inactive', category: 'relatedParty', gender: 'Male', dob: '1958-06-15', age: 67, email: '', phone: '+1 (876) 555-0435', address: '6 Ocean View Drive, Negril', parish: 'Westmoreland', taxId: '349-611-742', avatarColor: '#EEE9F1', avatarTextColor: '#1A1739' },
  { id: 'CLI-YOUNG-ISABELLE', name: 'Young, Isabelle', initials: 'IY', status: 'active', category: 'policyholder', gender: 'Female', dob: '1989-11-05', age: 36, email: 'isabelle.young@gmail.com', phone: '+1 (876) 555-0436', address: '90 Hope Road, Kingston', parish: 'St. Andrew', taxId: '358-772-600', avatarColor: '#F5F1E6', avatarTextColor: '#78520F' },
  { id: 'CLI-BAKER-SEAN', name: 'Baker, Sean', initials: 'SB', status: 'active', category: 'policyholder', gender: 'Male', dob: '1978-08-01', age: 47, email: 'sean.baker@proton.me', phone: '+1 (876) 555-0437', address: '13 Molynes Road, Kingston', parish: 'St. Andrew', taxId: '366-390-285', avatarColor: '#E5F2F4', avatarTextColor: '#17494A' },
  { id: 'CLI-COOPER-LEAH', name: 'Cooper, Leah', initials: 'LC', status: 'inactive', category: 'dependent', gender: 'Female', dob: '2009-03-15', age: 17, email: '', phone: '', address: '13 Molynes Road, Kingston', parish: 'St. Andrew', taxId: '372-815-943', avatarColor: '#F0F4E8', avatarTextColor: '#405B17' },
  { id: 'CLI-DIXON-JEROME', name: 'Dixon, Jerome', initials: 'JD', status: 'active', category: 'relatedParty', gender: 'Male', dob: '1987-05-20', age: 38, email: 'jerome.dixon@yahoo.com', phone: '+1 (876) 555-0439', address: '22 Bay Street, Port Maria', parish: 'St. Mary', taxId: '381-506-200', avatarColor: '#E8EEF7', avatarTextColor: '#173D6F' },
  { id: 'CLI-EVANS-MARIE', name: 'Evans, Marie', initials: 'ME', status: 'active', category: 'policyholder', gender: 'Female', dob: '1973-09-10', age: 52, email: 'marie.evans@icloud.com', phone: '+1 (876) 555-0440', address: '16 South Camp Road, Kingston', parish: 'Kingston', taxId: '397-160-814', avatarColor: '#F7E8DF', avatarTextColor: '#5B230F' },
  { id: 'CLI-FRANCIS-LEON', name: 'Francis, Leon', initials: 'LF', status: 'inactive', category: 'policyholder', gender: 'Male', dob: '1960-01-09', age: 66, email: 'leon.francis@gmail.com', phone: '+1 (876) 555-0441', address: '45 St. James Street, Montego Bay', parish: 'St. James', taxId: '405-927-310', avatarColor: '#EEE9F1', avatarTextColor: '#1A1739' },
  { id: 'CLI-GRAHAM-CELESTE', name: 'Graham, Celeste', initials: 'CG', status: 'active', category: 'policyholder', gender: 'Female', dob: '1993-04-13', age: 33, email: 'celeste.graham@outlook.com', phone: '+1 (876) 555-0442', address: '2 Fairview Avenue, Montego Bay', parish: 'St. James', taxId: '413-680-077', avatarColor: '#F5F1E6', avatarTextColor: '#78520F' },
  { id: 'CLI-HARRIS-NOEL', name: 'Harris, Noel', initials: 'NH', status: 'active', category: 'relatedParty', gender: 'Male', dob: '1949-12-23', age: 76, email: '', phone: '+1 (876) 555-0443', address: '70 Gordon Town Road, Kingston', parish: 'St. Andrew', taxId: '424-718-966', avatarColor: '#E5F2F4', avatarTextColor: '#17494A' },
  { id: 'CLI-IRVING-ROXANNE', name: 'Irving, Roxanne', initials: 'RI', status: 'inactive', category: 'policyholder', gender: 'Female', dob: '1982-06-06', age: 43, email: 'roxanne.irving@yahoo.com', phone: '+1 (876) 555-0444', address: '34 Main Street, Old Harbour', parish: 'St. Catherine', taxId: '431-650-412', avatarColor: '#F0F4E8', avatarTextColor: '#405B17' },
  { id: 'CLI-JAMES-ERIC', name: 'James, Eric', initials: 'EJ', status: 'active', category: 'policyholder', gender: 'Male', dob: '1975-07-30', age: 50, email: 'eric.james@live.com', phone: '+1 (876) 555-0445', address: '21 Market Road, Linstead', parish: 'St. Catherine', taxId: '449-203-158', avatarColor: '#E8EEF7', avatarTextColor: '#173D6F' },
  { id: 'CLI-KNIGHT-VERONICA', name: 'Knight, Veronica', initials: 'VK', status: 'active', category: 'relatedParty', gender: 'Female', dob: '1954-02-18', age: 72, email: 'veronica.knight@gmail.com', phone: '+1 (876) 555-0446', address: '12 Church Street, Port Maria', parish: 'St. Mary', taxId: '455-902-700', avatarColor: '#F7E8DF', avatarTextColor: '#5B230F' },
  { id: 'CLI-LAWRENCE-ISAAC', name: 'Lawrence, Isaac', initials: 'IL', status: 'inactive', category: 'dependent', gender: 'Male', dob: '2012-10-03', age: 13, email: '', phone: '', address: '21 Market Road, Linstead', parish: 'St. Catherine', taxId: '462-801-330', avatarColor: '#EEE9F1', avatarTextColor: '#1A1739' },
  { id: 'CLI-MCKENZIE-JANELLE', name: 'McKenzie, Janelle', initials: 'JM', status: 'active', category: 'policyholder', gender: 'Female', dob: '1985-01-21', age: 41, email: 'janelle.mckenzie@icloud.com', phone: '+1 (876) 555-0448', address: '3 Fort Street, Montego Bay', parish: 'St. James', taxId: '470-391-651', avatarColor: '#F5F1E6', avatarTextColor: '#78520F' },
  { id: 'CLI-POWELL-MATTHEW', name: 'Powell, Matthew', initials: 'MP', status: 'active', category: 'relatedParty', gender: 'Male', dob: '1996-05-12', age: 29, email: 'matthew.powell@gmail.com', phone: '+1 (876) 555-0449', address: '18 Norman Manley Boulevard, Negril', parish: 'Westmoreland', taxId: '488-617-059', avatarColor: '#E5F2F4', avatarTextColor: '#17494A' },
];

export const PARTICIPANT_ROLE_OPTIONS = [
  'Primary Insured',
  'Policy Owner',
  'Beneficiary',
  'Payer',
];

/* ─── Registry ─── */

export const MOCK_ENTITY_FOLDERS: Record<string, EntityFolderDef> = {
  [POLICY_123.id]: POLICY_123,
  [CLIENT_MARC.id]: CLIENT_MARC,
  [AGENT_BEAULIEU.id]: AGENT_BEAULIEU,
  [COVERAGE_TERM10.id]: COVERAGE_TERM10,
  ...Object.fromEntries(COVERAGE_STUB_DEFS.filter((def) => def.id !== COVERAGE_TERM10.id).map((def) => [def.id, def])),
};

export function getEntityFolderById(id: string | undefined): EntityFolderDef | undefined {
  if (!id) return undefined;
  return MOCK_ENTITY_FOLDERS[id];
}

/** True when the id refers to a known entity folder (vs. an IP folder). */
export function isEntityFolderId(id: string | undefined): boolean {
  if (!id) return false;
  if (MOCK_ENTITY_FOLDERS[id]) return true;
  /* Conventional prefix fallback for entity ids not in the registry. */
  return /^(POL|CLI|AGT|COV|PAR)-/.test(id);
}
