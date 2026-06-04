import type { SystemDataset } from './multi-case-dataset';
import { EMPIRE_DATASET_ID } from './empireDemoCaseIds';
import {
  EMPIRE_SIMPLE_DOCUMENT_EVIDENCE,
  EMPIRE_SIMPLE_DOCUMENT_RECORDS,
  EMPIRE_SIMPLE_REQUEST_RECORDS,
  EMPIRE_SIMPLE_TASK_RECORDS,
  TASK_EMP_ADDR_001_ID,
  buildEmpireAddressChangeTask,
} from './empire-simple-service-records';

export { TASK_EMP_ADDR_001_ID };

export function isEmpireDatasetId(datasetId: string): boolean {
  return datasetId === EMPIRE_DATASET_ID || datasetId.startsWith(`${EMPIRE_DATASET_ID}-workspace-copy-`);
}

function withoutAddressChangeRecords(dataset: SystemDataset): SystemDataset {
  const addressTaskIds = new Set([TASK_EMP_ADDR_001_ID]);
  const addressRequestIds = new Set(EMPIRE_SIMPLE_REQUEST_RECORDS.map((row) => row.id));
  const addressDocumentIds = new Set(EMPIRE_SIMPLE_DOCUMENT_RECORDS.map((row) => row.id));
  const addressEvidenceIds = new Set(EMPIRE_SIMPLE_DOCUMENT_EVIDENCE.map((row) => row.id));

  return {
    ...dataset,
    tasks: dataset.tasks.filter((row) => !addressTaskIds.has(row.id)),
    requests: dataset.requests.filter((row) => !addressRequestIds.has(row.id)),
    documents: dataset.documents.filter((row) => !addressDocumentIds.has(row.id)),
    documentEvidence: (dataset.documentEvidence ?? []).filter((row) => !addressEvidenceIds.has(row.id)),
  };
}

export function applyEmpireAddressChangeOverlay(dataset: SystemDataset): SystemDataset {
  if (!isEmpireDatasetId(dataset.id)) return dataset;

  const scrubbed = withoutAddressChangeRecords(dataset);
  const existingTask = dataset.tasks.find((row) => row.id === TASK_EMP_ADDR_001_ID);
  const addressTask = buildEmpireAddressChangeTask(existingTask?.status);

  return {
    ...scrubbed,
    requests: [...EMPIRE_SIMPLE_REQUEST_RECORDS, ...scrubbed.requests],
    tasks: [addressTask, ...scrubbed.tasks.filter((row) => row.id !== TASK_EMP_ADDR_001_ID)],
    documents: [...EMPIRE_SIMPLE_DOCUMENT_RECORDS, ...scrubbed.documents],
    documentEvidence: [...EMPIRE_SIMPLE_DOCUMENT_EVIDENCE, ...(scrubbed.documentEvidence ?? [])],
  };
}
