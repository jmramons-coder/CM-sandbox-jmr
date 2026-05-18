import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { CreateCaseModal } from '../components/CreateCaseModal';
import { CreateRequestModal } from '../components/CreateRequestModal';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { filterDatasetBySettings, getSystemDataset, listCaseSummaries } from '../data/objectRepository';
import { useCasesNav } from './CasesNavContext';
import { useDataSourceSettings, usePlatformSettings, useModules } from './PlatformSettingsContext';

export type GlobalCreateEntity = 'case' | 'task' | 'request';

type GlobalCreateContextValue = {
  createMenuOpen: boolean;
  setCreateMenuOpen: (open: boolean) => void;
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

  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [createCaseOpen, setCreateCaseOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createRequestOpen, setCreateRequestOpen] = useState(false);

  const availableEntities = useMemo(
    () =>
      (['case', 'task', 'request'] as const).filter((entity) => modules[ENTITY_MODULE[entity]] !== false),
    [modules],
  );

  const openCreate = useCallback((entity: GlobalCreateEntity) => {
    setCreateMenuOpen(false);
    if (entity === 'case') setCreateCaseOpen(true);
    if (entity === 'task') setCreateTaskOpen(true);
    if (entity === 'request') setCreateRequestOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      createMenuOpen,
      setCreateMenuOpen,
      openCreate,
      availableEntities,
    }),
    [availableEntities, createMenuOpen, openCreate],
  );

  return (
    <GlobalCreateContext.Provider value={value}>
      {children}
      <CreateCaseModal
        open={createCaseOpen}
        onOpenChange={setCreateCaseOpen}
        dataSource={dataSource}
        onCreated={({ datasetId, caseId }) => {
          const nextDataSource = { ...dataSource, activeDatasetId: datasetId };
          const createdCaseSummary = listCaseSummaries(
            filterDatasetBySettings(getSystemDataset(datasetId), nextDataSource),
          ).find((item) => item.id === caseId);
          updateDataSource({ activeDatasetId: datasetId });
          addOpenCase(caseId, createdCaseSummary);
        }}
      />
      <CreateTaskModal
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        dataSource={dataSource}
        onCreated={({ datasetId, taskId }) => {
          updateDataSource({ activeDatasetId: datasetId });
          navigate(`/tasks#task=${encodeURIComponent(taskId)}`);
        }}
      />
      <CreateRequestModal
        open={createRequestOpen}
        onOpenChange={setCreateRequestOpen}
        dataSource={dataSource}
        onCreated={({ datasetId, requestId }) => {
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
