import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { filterDatasetBySettings, getSystemDataset, listCaseSummaries } from '../data/objectRepository';
import { useDataSourceSettings } from './PlatformSettingsContext';
import type { CaseNavItem, CaseSummary } from '../types';

type CasesNavContextValue = {
  openCases: CaseNavItem[];
  pinnedCases: CaseNavItem[];
  lastActiveCaseId: string | null;
  setLastActiveCaseId: (caseId: string | null) => void;
  addOpenCase: (caseId: string, caseSummary?: CaseSummary) => void;
  removeOpenCase: (caseId: string) => void;
  clearOpenCases: () => void;
};

const CasesNavContext = createContext<CasesNavContextValue | null>(null);

function toCaseNavItem(caseMatch: CaseSummary): CaseNavItem {
  return {
    caseId: caseMatch.id,
    claimant: caseMatch.claimant,
    title: caseMatch.title,
    caseKind: caseMatch.caseKind,
    primaryPartyName: caseMatch.primaryPartyName,
    primaryPartyLabel: caseMatch.primaryPartyLabel,
    status: caseMatch.status,
    rag: caseMatch.rag,
  };
}

export function CasesNavProvider({ children }: React.PropsWithChildren) {
  const dataSource = useDataSourceSettings();
  const caseSummaries = useMemo(() => {
    const dataset = filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource);
    return listCaseSummaries(dataset);
  }, [dataSource]);
  const caseSummaryById = useMemo(() => new Map(caseSummaries.map((item) => [item.id, item])), [caseSummaries]);
  const [openCases, setOpenCases] = useState<CaseNavItem[]>(() => caseSummaries.map(toCaseNavItem));
  const [pinnedCases] = useState<CaseNavItem[]>([]);
  const [lastActiveCaseId, setLastActiveCaseId] = useState<string | null>(null);

  useEffect(() => {
    setOpenCases((prev) => {
      const valid = prev
        .filter((item) => caseSummaryById.has(item.caseId))
        .map((item) => toCaseNavItem(caseSummaryById.get(item.caseId)!));
      if (valid.length === prev.length) return valid;
      if (valid.length) {
        const validIds = new Set(valid.map((item) => item.caseId));
        return [
          ...valid,
          ...caseSummaries.filter((item) => !validIds.has(item.id)).map(toCaseNavItem),
        ];
      }
      return caseSummaries.map(toCaseNavItem);
    });
  }, [caseSummaries, caseSummaryById]);

  const addOpenCase = useCallback((caseId: string, caseSummary?: CaseSummary) => {
    setOpenCases((prev) => {
      const caseMatch = caseSummary ?? caseSummaryById.get(caseId);
      if (!caseMatch) return prev;
      const nextItem = toCaseNavItem(caseMatch);
      return [nextItem, ...prev.filter((item) => item.caseId !== caseId && caseSummaryById.has(item.caseId))];
    });
  }, [caseSummaryById]);

  const removeOpenCase = useCallback((caseId: string) => {
    setOpenCases((prev) => prev.filter((item) => item.caseId !== caseId));
  }, []);

  const clearOpenCases = useCallback(() => {
    setOpenCases([]);
  }, []);

  const value = useMemo(
    () => ({
      openCases,
      pinnedCases,
      lastActiveCaseId,
      setLastActiveCaseId,
      addOpenCase,
      removeOpenCase,
      clearOpenCases,
    }),
    [openCases, pinnedCases, lastActiveCaseId, addOpenCase, removeOpenCase, clearOpenCases],
  );

  return <CasesNavContext.Provider value={value}>{children}</CasesNavContext.Provider>;
}

export function useCasesNav() {
  const ctx = useContext(CasesNavContext);
  if (!ctx) {
    throw new Error('useCasesNav must be used within CasesNavProvider');
  }
  return ctx;
}
