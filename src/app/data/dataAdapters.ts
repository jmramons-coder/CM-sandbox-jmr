import type { DataSourceConnector, DataMode } from '../domain/objectRefs';
import type { SystemDataset } from './multi-case-dataset';

export type DatasetStorageKind = 'built_in' | 'generated' | 'bundled' | 'local_database' | 'remote_database';
export type DatasetMutationKind = 'create_dataset' | 'update_dataset' | 'delete_dataset' | 'import_package' | 'migrate_dataset';

export interface DatasetMutationBoundary {
  kind: DatasetMutationKind;
  firstAdapter: DataSourceConnector;
  status: 'enabled' | 'planned';
  validation: string;
  notes: string;
}

export interface DatasetMetadata {
  id: string;
  label: string;
  description: string;
  organizationLabel?: string;
  storageKind: DatasetStorageKind;
  sourceLabel: string;
  recordCount: number;
  caseCount: number;
  caseTypeCount: number;
  documentMode?: SystemDataset['documentMode'];
  updatedAt?: string;
  readonly?: boolean;
  packageSizeBytes?: number;
}

export interface DataAdapter {
  id: DataSourceConnector;
  mode: DataMode;
  label: string;
  status: 'available' | 'planned';
  readonly: boolean;
  capabilitySummary: string;
  listMetadata: () => DatasetMetadata[];
  getDataset: (datasetId: string) => SystemDataset | undefined;
  saveDataset?: (dataset: SystemDataset) => SystemDataset[];
  deleteDataset?: (datasetId: string) => SystemDataset[];
}

export type DataAdapterContract = Pick<DataAdapter, 'id' | 'mode' | 'label' | 'status' | 'readonly' | 'capabilitySummary'>;

export const FIRST_REAL_PERSISTENCE_ADAPTER: DataSourceConnector = 'local_indexeddb';

export const DATASET_MUTATION_BOUNDARIES: DatasetMutationBoundary[] = [
  {
    kind: 'create_dataset',
    firstAdapter: FIRST_REAL_PERSISTENCE_ADAPTER,
    status: 'planned',
    validation: 'validateSystemDataset plus relationship graph validation before commit',
    notes: 'Creates imported or generated SystemDataset rows in IndexedDB after schema-version stamping.',
  },
  {
    kind: 'update_dataset',
    firstAdapter: FIRST_REAL_PERSISTENCE_ADAPTER,
    status: 'planned',
    validation: 'row-level mutation must produce a valid SystemDataset snapshot before commit',
    notes: 'UI edits remain local state until explicit dataset writes are added.',
  },
  {
    kind: 'delete_dataset',
    firstAdapter: FIRST_REAL_PERSISTENCE_ADAPTER,
    status: 'planned',
    validation: 'dataset id must resolve to a non-built-in mutable dataset',
    notes: 'Built-in demo datasets stay readonly; generated/imported datasets can be removed.',
  },
  {
    kind: 'import_package',
    firstAdapter: FIRST_REAL_PERSISTENCE_ADAPTER,
    status: 'planned',
    validation: 'validateDatasetPackage, migrateSystemDataset, then validateSystemDataset',
    notes: 'Package imports should persist as versioned SystemDataset snapshots.',
  },
  {
    kind: 'migrate_dataset',
    firstAdapter: FIRST_REAL_PERSISTENCE_ADAPTER,
    status: 'planned',
    validation: 'migration tests must preserve entity counts and relationship parity',
    notes: 'Migrations run before reads return datasets to repositories.',
  },
];

export const DATA_ADAPTER_CONTRACTS: DataAdapterContract[] = [
  {
    id: 'mock_json',
    mode: 'mock',
    label: 'Mock JSON adapter',
    status: 'available',
    readonly: false,
    capabilitySummary: 'Reads built-in and generated SystemDataset JSON packages; generated/imported datasets persist through localStorage.',
  },
  {
    id: 'local_indexeddb',
    mode: 'local_database',
    label: 'Local IndexedDB adapter',
    status: 'planned',
    readonly: true,
    capabilitySummary: 'Chosen first real persistence path. Planned durable browser database adapter with versioned SystemDataset snapshots and validated create/update/delete boundaries.',
  },
  {
    id: 'rest_api',
    mode: 'remote_database',
    label: 'REST API adapter',
    status: 'planned',
    readonly: true,
    capabilitySummary: 'Planned remote API adapter for backend-backed datasets and mutations.',
  },
  {
    id: 'database',
    mode: 'remote_database',
    label: 'Database adapter',
    status: 'planned',
    readonly: true,
    capabilitySummary: 'Planned direct database adapter; schema migrations and mutation boundaries must be defined before enabling.',
  },
  {
    id: 'mcp',
    mode: 'remote_database',
    label: 'MCP adapter',
    status: 'planned',
    readonly: true,
    capabilitySummary: 'Planned MCP-backed adapter for external data contexts and tools.',
  },
];
