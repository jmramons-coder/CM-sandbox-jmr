import { useMemo } from 'react';
import { useParams } from 'react-router';
import { useDataSourceSettings } from '../../contexts/PlatformSettingsContext';
import { getDatasetEntityFolderType } from '../../data/entityReadModels';
import { getFolderById } from '../../data/mock-folders';
import { isEntityFolderId } from '../../data/mock-entity-folders';
import { filterDatasetBySettings, getSystemDataset } from '../../data/objectRepository';
import { FolderView } from '../FolderView';
import { FolderCaseView } from '../FolderCaseView';
import { EntityFolderOverview } from './EntityFolderOverview';
import { EntitySubFolderListView } from './EntitySubFolderListView';
import { entityTypeFromSlug } from '../../domain/entityFolders';

function useActiveDatasetForFolders() {
  const dataSource = useDataSourceSettings();
  return useMemo(
    () => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource),
    [dataSource],
  );
}

/**
 * Top-level dispatcher for `/folders/:folderId`. IP folders (existing) keep
 * their dedicated FolderView; entity folders (Policy, Agent…) render the new
 * generic EntityFolderOverview.
 */
export function FolderRouter() {
  const { folderId } = useParams();
  const activeDataset = useActiveDatasetForFolders();
  const ipFolder = getFolderById(folderId ?? '');
  const isEntityKind = ipFolder?.kind === 'entity';
  const isDatasetEntity = !!getDatasetEntityFolderType(activeDataset, folderId);
  const isEntity = isEntityKind || (!ipFolder && (isEntityFolderId(folderId) || isDatasetEntity));

  if (isEntity) return <EntityFolderOverview />;
  return <FolderView />;
}

/**
 * Dispatcher for `/folders/:folderId/:subSegment`.
 *
 * - IP folder + segment that looks like a sub-case ID → FolderCaseView (legacy).
 * - Entity folder + segment that maps to a child entity slug (agents, etc.) →
 *   EntitySubFolderListView (new).
 */
export function IpOrEntitySubRouter() {
  const { folderId, childType } = useParams();
  const activeDataset = useActiveDatasetForFolders();
  const ipFolder = getFolderById(folderId ?? '');
  const looksLikeEntityType = !!entityTypeFromSlug(childType);
  const looksLikeEntityRoot =
    isEntityFolderId(folderId) || !!getDatasetEntityFolderType(activeDataset, folderId);

  if (looksLikeEntityRoot && looksLikeEntityType) {
    return <EntitySubFolderListView />;
  }
  if (ipFolder?.kind !== 'entity') {
    return <FolderCaseView />;
  }
  return <EntitySubFolderListView />;
}
