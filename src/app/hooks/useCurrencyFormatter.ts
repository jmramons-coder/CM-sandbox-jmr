import { useEffect, useMemo, useState } from 'react';
import { useDataSourceSettings } from '../contexts/PlatformSettingsContext';
import { datasetRegistry } from '../data/datasetRegistry';
import { DATASET_ENVIRONMENT_CHANGED_EVENT } from '../data/datasetEnvironmentSettings';
import {
  formatCurrencyAmount,
  localizeCurrencyDisplay,
  parseDisplayCurrencyAmount,
  type DisplayCurrency,
} from '../utils/currency';

export function useCurrencyFormatter() {
  const { activeDatasetId, displayCurrency: legacyDisplayCurrency } = useDataSourceSettings();
  const [environmentRevision, setEnvironmentRevision] = useState(0);
  useEffect(() => {
    const onEnvironmentChanged = () => setEnvironmentRevision((value) => value + 1);
    window.addEventListener(DATASET_ENVIRONMENT_CHANGED_EVENT, onEnvironmentChanged);
    return () => window.removeEventListener(DATASET_ENVIRONMENT_CHANGED_EVENT, onEnvironmentChanged);
  }, []);
  const displayCurrency: DisplayCurrency = useMemo(() => {
    const dataset = datasetRegistry.getDataset(activeDatasetId);
    return dataset.displayCurrency ?? legacyDisplayCurrency ?? 'GBP';
  }, [activeDatasetId, legacyDisplayCurrency, environmentRevision]);

  return useMemo(
    () => ({
      currency: displayCurrency,
      format: (amount: number, options?: { compact?: boolean }) =>
        formatCurrencyAmount(amount, displayCurrency, options?.compact ? { compact: true } : undefined),
      localize: (value: string | undefined | null) => localizeCurrencyDisplay(value, displayCurrency),
      parse: (value?: string | null) => parseDisplayCurrencyAmount(value, displayCurrency),
    }),
    [displayCurrency],
  );
}
