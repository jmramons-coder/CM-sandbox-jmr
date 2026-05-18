export type ReadinessCategory =
  | 'model'
  | 'ui_label'
  | 'workflow_behavior'
  | 'mock_content'
  | 'route_link'
  | 'assistant_content'
  | 'data_source';

export interface HardcodedSurfaceFinding {
  id: string;
  category: ReadinessCategory;
  area: string;
  files: string[];
  issue: string;
  target: string;
}

export interface ModuleContractDefinition {
  module: string;
  owns: string[];
  mustConsume: string[];
  mustNotAssume: string[];
}

export interface MigrationPhaseDefinition {
  id: string;
  label: string;
  outcome: string;
  dependencies: string[];
}

export const HARD_CODED_SURFACE_INVENTORY: HardcodedSurfaceFinding[] = [
  {
    id: 'case-overview-claim-shape',
    category: 'model',
    area: 'Case domain types',
    files: ['src/app/types/index.ts'],
    issue: 'CaseOverview requires claim-only fields such as claimantName, claimNumber, dateOfLoss, disabilityOnset, monthlyBenefit, and restorationPlan.',
    target: 'Introduce CaseRecord with caseKind, workflowTemplateId, primaryParty, participants, linkedObjects, facts, and sections.',
  },
  {
    id: 'case-view-inline-workflow',
    category: 'workflow_behavior',
    area: 'Case detail shell',
    files: ['src/app/components/CaseView.tsx'],
    issue: 'Tabs, overview sections, banners, requirement phases, and AI copy are embedded as claim workflow logic.',
    target: 'Render tabs, sections, statuses, actions, and copy from workflow definitions.',
  },
  {
    id: 'decision-benefit-adjudication',
    category: 'workflow_behavior',
    area: 'Decision surface',
    files: ['src/app/components/DecisionTab.tsx'],
    issue: 'Decision options and reason codes assume benefit adjudication and return-to-work outcomes.',
    target: 'Use workflow-specific decision options or split workflow decision renderers behind shared chrome.',
  },
  {
    id: 'claimant-labels',
    category: 'ui_label',
    area: 'List, side panel, document, task, and dashboard labels',
    files: [
      'src/app/components/CasesModule.tsx',
      'src/app/components/TaskDetailSidePanel.tsx',
      'src/app/components/DynamicDocumentSidePanel.tsx',
      'src/app/components/Dashboard.tsx',
    ],
    issue: 'Claimant is used as a universal participant label.',
    target: 'Resolve primaryPartyLabel and role labels from workflow/participant config.',
  },
  {
    id: 'routes-hardcoded-cases',
    category: 'route_link',
    area: 'Object navigation',
    files: ['src/app/components/Layout.tsx', 'src/app/components/RequestsModule.tsx', 'src/app/components/CaseView.tsx'],
    issue: 'Routes and hashes are manually assembled with /cases/${id}, #tab=requirements, and /claims external URLs.',
    target: 'Use resolveObjectLocation, resolveCaseLocation, and workflow integration URL templates.',
  },
  {
    id: 'mock-fixtures-ip-only',
    category: 'mock_content',
    area: 'Demo data',
    files: ['src/app/data/mock-cases.ts', 'src/app/data/mock-tasks.ts', 'src/app/data/mock-dashboard.ts'],
    issue: 'Fixture content is almost entirely Income Protection claim narrative.',
    target: 'Move to named datasets with coherent cross-workflow object graphs.',
  },
  {
    id: 'assistant-hardcoded-claim-replies',
    category: 'assistant_content',
    area: 'Copilot mock replies',
    files: ['src/app/components/Layout.tsx'],
    issue: 'Assistant responses include fixed claim, APS, RTW, and benefit language.',
    target: 'Load workflow/dataset-specific assistant prompts and responses from dataset content.',
  },
  {
    id: 'direct-mock-imports',
    category: 'data_source',
    area: 'Data access',
    files: ['src/app/data/mock-*.ts', 'src/app/components/*Module.tsx'],
    issue: 'Modules import mock arrays directly, making source switching and demo dataset toggles hard.',
    target: 'Read through an active object repository selected by Platform Settings.',
  },
];

export const MODULE_CONTRACTS: ModuleContractDefinition[] = [
  {
    module: 'Cases',
    owns: ['case shell', 'workflow progress', 'case-specific overview composition'],
    mustConsume: ['CaseRecord', 'WorkflowDefinition', 'ObjectRepository'],
    mustNotAssume: ['claimant', 'benefit', 'pre/post approval', 'claim decision'],
  },
  {
    module: 'Clients',
    owns: ['client profile display', 'participant role resolution'],
    mustConsume: ['ParticipantRef', 'workflow participant labels'],
    mustNotAssume: ['every primary party is a claimant'],
  },
  {
    module: 'Tasks',
    owns: ['work assignment', 'queue state', 'linked-object context'],
    mustConsume: ['ObjectRef', 'CaseRecord display helpers'],
    mustNotAssume: ['all tasks are tied to cases or claims'],
  },
  {
    module: 'Requirements',
    owns: ['workflow gates', 'needed evidence/actions', 'fulfillment state'],
    mustConsume: ['WorkflowDefinition.requirementCategories', 'ObjectRef'],
    mustNotAssume: ['all requirements are medical claim evidence'],
  },
  {
    module: 'Documents',
    owns: ['file metadata', 'evidence facts', 'document insights'],
    mustConsume: ['Document refs', 'workflow insight templates'],
    mustNotAssume: ['document subject is a claimant or medical report'],
  },
  {
    module: 'Requests',
    owns: ['intake source', 'system initiated steps', 'request-to-object automation'],
    mustConsume: ['ObjectRef', 'workflow actions'],
    mustNotAssume: ['requests only start or update claims'],
  },
  {
    module: 'Communications',
    owns: ['messages', 'calls', 'letters', 'drafts', 'notes'],
    mustConsume: ['participants', 'linked objects', 'workflow templates'],
    mustNotAssume: ['all communications are claimant letters'],
  },
  {
    module: 'Platform Settings',
    owns: ['enabled modules', 'enabled workflows', 'demo environments', 'data source selection'],
    mustConsume: ['dataset registry', 'data source settings'],
    mustNotAssume: ['branding is the only demo environment state'],
  },
];

export const MIGRATION_PHASES: MigrationPhaseDefinition[] = [
  {
    id: 'inventory',
    label: 'Inventory hardcoding',
    outcome: 'Known claim assumptions are categorized and traceable.',
    dependencies: [],
  },
  {
    id: 'domain-contract',
    label: 'Domain contract',
    outcome: 'Neutral object refs, case records, workflow IDs, facts, sections, and participants exist.',
    dependencies: ['inventory'],
  },
  {
    id: 'workflow-registry',
    label: 'Workflow registry',
    outcome: 'Claim, new business, and customer service behavior is described by data.',
    dependencies: ['domain-contract'],
  },
  {
    id: 'repository-boundary',
    label: 'Repository boundary',
    outcome: 'Modules can move from direct mocks to active datasets/data sources.',
    dependencies: ['domain-contract'],
  },
  {
    id: 'module-neutralization',
    label: 'Module neutralization',
    outcome: 'Modules render labels, links, and statuses through shared helpers/config.',
    dependencies: ['workflow-registry', 'repository-boundary'],
  },
  {
    id: 'dataset-switching',
    label: 'Dataset switching',
    outcome: 'Demo environments can restore UI, workflow, and data-source configuration.',
    dependencies: ['repository-boundary'],
  },
];
