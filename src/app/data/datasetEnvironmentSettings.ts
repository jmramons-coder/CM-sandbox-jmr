import type { SystemDataset } from './multi-case-dataset';
import type { DisplayCurrency } from '../utils/currency';

const STORAGE_KEY = 'amplify-dataset-environment-settings';

export const DATASET_ENVIRONMENT_CHANGED_EVENT = 'amplify-dataset-environment-changed';

function notifyEnvironmentChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(DATASET_ENVIRONMENT_CHANGED_EVENT));
}

type DatasetEnvironmentOverlay = {
  displayCurrency?: DisplayCurrency;
};

function readAll(): Record<string, DatasetEnvironmentOverlay> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, DatasetEnvironmentOverlay>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(overlays: Record<string, DatasetEnvironmentOverlay>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overlays));
}

export function getDatasetEnvironmentOverlay(datasetId: string): DatasetEnvironmentOverlay | undefined {
  return readAll()[datasetId];
}

export function setDatasetDisplayCurrency(datasetId: string, displayCurrency: DisplayCurrency) {
  const overlays = readAll();
  overlays[datasetId] = { ...overlays[datasetId], displayCurrency };
  writeAll(overlays);
  notifyEnvironmentChanged();
}

export function applyDatasetEnvironmentSettings(dataset: SystemDataset): SystemDataset {
  const overlay = getDatasetEnvironmentOverlay(dataset.id);
  return {
    ...dataset,
    displayCurrency: overlay?.displayCurrency ?? dataset.displayCurrency ?? 'GBP',
  };
}
