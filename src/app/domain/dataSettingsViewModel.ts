import { getDatasetMetadata } from '../data/datasetRegistry';
import type { DatasetMetadata } from '../data/dataAdapters';
import { runDatasetQualityChecks, validateSystemDataset } from '../data/dataQualityGuards';
import type { SystemDataset } from '../data/multi-case-dataset';
import { countCasesByWorkflow, countDatasetObjects, findRelationshipIssues, validateModuleBoundaryRules } from './dataArchitecture';
import { buildSchemaGraph } from './schemaGraph';

export function buildDataSettingsViewModel({
  activeDataset,
  dataContexts,
  registryMetadata,
}: {
  activeDataset: SystemDataset;
  dataContexts: SystemDataset[];
  registryMetadata: DatasetMetadata[];
}) {
  const metadataById = new Map(registryMetadata.map((metadata) => [metadata.id, metadata]));
  const datasetMetadata = dataContexts.map((dataset) => getDatasetMetadata(dataset, {
    storageKind: metadataById.get(dataset.id)?.storageKind ?? 'generated',
    sourceLabel: metadataById.get(dataset.id)?.sourceLabel ?? 'Generated/imported',
    readonly: metadataById.get(dataset.id)?.readonly,
  }));
  const counts = countDatasetObjects(activeDataset);
  const workflowCounts = countCasesByWorkflow(activeDataset);
  const relationshipIssues = findRelationshipIssues(activeDataset);
  const boundaryIssues = validateModuleBoundaryRules(activeDataset);
  const systemValidation = validateSystemDataset(activeDataset);
  const qualityChecks = runDatasetQualityChecks(activeDataset);
  const schemaGraph = buildSchemaGraph({ dataset: activeDataset, relationshipIssues });

  return {
    datasetMetadata,
    metadataById,
    counts,
    workflowCounts,
    relationshipIssues,
    boundaryIssues,
    systemValidation,
    qualityChecks,
    schemaGraph,
  };
}
