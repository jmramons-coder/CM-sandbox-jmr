import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { GlobalCreateFlowModal } from '../components/GlobalCreateFlowModal';
import { filterDatasetBySettings, getSystemDataset, listCaseSummaries } from '../data/objectRepository';
import { useCasesNav } from './CasesNavContext';
import { useDataSourceSettings, usePlatformSettings, useModules } from './PlatformSettingsContext';

export type GlobalCreateEntity = 'case' | 'task' | 'request';

type GlobalCreateContextValue = {
  openCreateFlow: () => void;
  openCreate: (entity: GlobalCreateEntity) => void;
  availableEntities: GlobalCreateEntity[];
};

const GlobalCreateContext = createContext<GlobalCreateContextValue | null>(null);

const ENTITY_MODULE: Record<GlobalCreateEntity, 'cases' | 'tasks' | 'requests'> = {
  case: 'cases',
  task: 'tasks',
  request: 'requests',
};

export function GlobalCreateProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const modules = useModules();
  const dataSource = useDataSourceSettings();
  const { updateDataSource } = usePlatformSettings();
  const { addOpenCase } = useCasesNav();

  const [createFlowOpen, setCreateFlowOpen] = useState(false);
  const [createFlowEntity, setCreateFlowEntity] = useState<GlobalCreateEntity | null>(null);

  const availableEntities = useMemo(
    () =>
      (['case', 'task', 'request'] as const).filter((entity) => modules[ENTITY_MODULE[entity]] !== false),
    [modules],
  );

  const openCreateFlow = useCallback(() => {
    if (availableEntities.length === 1) {
      setCreateFlowEntity(availableEntities[0] ?? null);
    } else {
      setCreateFlowEntity(null);
    }
    setCreateFlowOpen(true);
  }, [availableEntities]);

  const openCreate = useCallback((entity: GlobalCreateEntity) => {
    setCreateFlowEntity(entity);
    setCreateFlowOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      openCreateFlow,
      openCreate,
      availableEntities,
    }),
    [availableEntities, openCreate, openCreateFlow],
  );

  return (
    <GlobalCreateContext.Provider value={value}>
      {children}
      <GlobalCreateFlowModal
        open={createFlowOpen}
        entity={createFlowEntity}
        availableEntities={availableEntities}
        dataSource={dataSource}
        onOpenChange={setCreateFlowOpen}
        onEntityChange={setCreateFlowEntity}
        onCaseCreated={({ datasetId, caseId }) => {
          const nextDataSource = { ...dataSource, activeDatasetId: datasetId };
          const createdCaseSummary = listCaseSummaries(
            filterDatasetBySettings(getSystemDataset(datasetId), nextDataSource),
          ).find((item) => item.id === caseId);
          updateDataSource({ activeDatasetId: datasetId });
          addOpenCase(caseId, createdCaseSummary);
        }}
        onTaskCreated={({ datasetId, taskId }) => {
          updateDataSource({ activeDatasetId: datasetId });
          navigate(`/tasks#task=${encodeURIComponent(taskId)}`);
        }}
        onRequestCreated={({ datasetId, requestId }) => {
          updateDataSource({ activeDatasetId: datasetId });
          navigate(`/requests#request=${encodeURIComponent(requestId)}`);
        }}
      />
    </GlobalCreateContext.Provider>
  );
}

export function useGlobalCreate() {
  const context = useContext(GlobalCreateContext);
  if (!context) {
    throw new Error('useGlobalCreate must be used within GlobalCreateProvider');
  }
  return context;
}
