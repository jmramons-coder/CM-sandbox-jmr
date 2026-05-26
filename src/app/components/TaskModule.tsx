import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from 'react';
import { Plus, X, Clock, ChevronDown, Kanban, List, MoreVertical, Users, Lock, Check, ArrowLeftRight, ClipboardList } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useLiveContextOverlay } from '../contexts/LiveContextProvider';
import { AiInsightInline, FilterDropdown, LozengeTag, ModuleTablePaginationFooter, ReorderIcon } from './index';
import { TaskKanbanBoard } from './tasks/TaskKanbanBoard';
import { PriorityChip, SearchBar } from './ds';
import { TaskDetailEmbeddedView, type TaskPanelNavigationPayload } from './TaskDetailSidePanel';
import { pushWorkspacePanelContext, taskPanelContextId } from '../utils/workspacePanelContextUtils';
import { CreateTaskModal } from './CreateTaskModal';
import { ModuleTabsBar } from './ModuleTabsBar';
import { Checkbox } from './ui/checkbox';
import { WorkspaceObjectSidePanel, type WorkspacePanelContext } from './WorkspaceObjectSidePanel';
import { TEAMS, CURRENT_USER } from '../data/mock-tasks';
import { filterDatasetBySettings, getSystemDataset, listTasks } from '../data/objectRepository';
import { executeTaskAction, pickUpTask, releaseTaskToQueue } from '../data/workflowActions';
import { useActiveUser } from '../contexts/ActiveUserContext';
import { useTableHorizontalScroll } from '../hooks/useTableHorizontalScroll';
import { useViewportLayout } from '../hooks/useViewportLayout';
import { APP_EVENTS, STORAGE_KEYS } from '../constants/storage-keys';
import {
  MODULE_TABLE_LAYOUT_CLASS,
  MODULE_TABLE_SUMMARY_COL_CLASS,
  moduleTableScrollContainerClass,
} from '../utils/module-table-scroll';
import { UI_CLASS } from '../constants/design-tokens';
import { getStatusLozengeType, sortTasks } from '../utils';
import { filterTasks } from '../utils/task-filters';
import { useDataSourceSettings, usePlatformSettings } from '../contexts/PlatformSettingsContext';
import type { Task, TaskViewMode, TaskTabType, SortableColumn, SortDirection } from '../types';
import { getDefaultSidePanelWidth } from '../utils/sidepanel-width';
import { ModuleMobileListCardShell } from './ModuleMobileListCard';
import { ModuleTableCheckboxColumnCell } from './ModuleTableCheckboxColumn';
import {
  isTaskAiSourced,
  MiniAiSourceBadge,
  MODULE_TABLE_CHECKBOX_COL_WIDTH,
  MODULE_TABLE_FIRST_STICKY_COL_PADDING_CLASS,
  SummaryTableColumnHeader,
  TABLE_CELL_ALIGN_CLASS,
  TABLE_LINK_CLASS,
  TABLE_LINK_TRUNCATE_CLASS,
  TABLE_SUBTEXT_CLASS,
  TABLE_TEXT_CLASS,
  TaskAssigneeAvatarStack,
  TaskSourceTag,
  TaskTableFirstColumnCell,
  TwoLineSummaryCell,
} from './ModuleCellHelpers';
import { getTaskAssigneeNames } from '../utils/task-assignees';

/** Task + case share one sticky cell so the left pack scrolls as a unit (no per-column sticky gaps). */
const TASK_TABLE_TASK_COL_WIDTH = 152;
const TASK_TABLE_CASE_COL_WIDTH = 132;
const TASK_TABLE_LEFT_PACK_WIDTH = TASK_TABLE_TASK_COL_WIDTH + TASK_TABLE_CASE_COL_WIDTH;
const TASK_TABLE_LEFT_PACK_GRID_STYLE = {
  gridTemplateColumns: `${TASK_TABLE_TASK_COL_WIDTH}px ${TASK_TABLE_CASE_COL_WIDTH}px`,
} as const;

const TASK_TABLE_STICKY_COL = {
  checkboxWidth: MODULE_TABLE_CHECKBOX_COL_WIDTH,
  packLeft: MODULE_TABLE_CHECKBOX_COL_WIDTH,
  packWidth: TASK_TABLE_LEFT_PACK_WIDTH,
} as const;

const TASK_TABLE_STATUS_WIDTH = 124;
const TASK_TABLE_ACTIONS_WIDTH = 48;
const TASK_TABLE_SCROLL_COL_MIN = 112;
const TASK_TABLE_MIN_WIDTH =
  TASK_TABLE_STICKY_COL.checkboxWidth +
  TASK_TABLE_STICKY_COL.packWidth +
  320 +
  TASK_TABLE_SCROLL_COL_MIN * 3 +
  TASK_TABLE_STATUS_WIDTH +
  TASK_TABLE_ACTIONS_WIDTH;
const TASK_TABLE_MIN_WIDTH_TEAM = TASK_TABLE_MIN_WIDTH + TASK_TABLE_SCROLL_COL_MIN;

function TaskCardMetaField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.35px] text-text-muted">{label}</p>
      <div className="mt-0.5 min-w-0 text-[12px] font-semibold leading-snug text-text-primary">{children}</div>
    </div>
  );
}

function TaskMobileListCard({
  task,
  selected,
  restricted,
  onSelect,
  onNavigateCase,
  queueTeamId,
}: {
  task: Task;
  selected: boolean;
  restricted: boolean;
  onSelect: () => void;
  onNavigateCase: (caseId: string) => void;
  queueTeamId?: string;
}) {
  const partyName = task.primaryPartyName ?? task.claimantName;
  const partyLabel = task.primaryPartyLabel ?? 'Claimant';
  const assigneeNames = getTaskAssigneeNames(task, { queueTeamId });
  const showAiSourceBadge =
    isTaskAiSourced(task) || task.hasAI || Boolean(task.aiSummary || task.description);

  return (
    <ModuleMobileListCardShell selected={selected} restricted={restricted} onSelect={onSelect}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {showAiSourceBadge ? <MiniAiSourceBadge /> : null}
          <PriorityChip priority={task.priority} />
          <LozengeTag label={task.status} type={getStatusLozengeType(task.status, 'task')} subtle />
        </div>
        <TaskAssigneeAvatarStack names={assigneeNames} />
      </div>

      <h3 className="mb-2 text-sm font-semibold leading-snug text-text-heading">{task.taskType}</h3>

      {task.aiSummary || task.description ? (
        <div className="mb-3">
          <AiInsightInline summary={task.aiSummary ?? task.description} showSourceBadge={false} />
        </div>
      ) : null}

      <div className="mb-3 grid grid-cols-2 gap-x-3 gap-y-3">
        <TaskCardMetaField label="Case">
          {task.caseId ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onNavigateCase(task.caseId!);
              }}
              className={`${TABLE_LINK_CLASS} break-words text-left`}
            >
              {task.caseId}
            </button>
          ) : (
            <span className="text-text-muted">—</span>
          )}
        </TaskCardMetaField>
        <TaskCardMetaField label={partyLabel}>
          <span className="break-words">{partyName || '—'}</span>
        </TaskCardMetaField>
      </div>

      {!isTaskAiSourced(task) ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <TaskSourceTag task={task} />
        </div>
      ) : null}
    </ModuleMobileListCardShell>
  );
}

export function TaskModule() {
  const navigate = useNavigate();
  const location = useLocation();
  const dataSource = useDataSourceSettings();
  const { updateDataSource } = usePlatformSettings();
  const { profile } = useActiveUser();
  const workflowActor = useMemo(() => ({ name: profile.name }), [profile.name]);
  const repositoryTasks = useMemo(
    () => listTasks(filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource)),
    [dataSource],
  );
  const repositoryMyTasks = useMemo(() => repositoryTasks.filter((task) => task.queue !== 'team_tasks'), [repositoryTasks]);
  const repositoryTeamTasks = useMemo(() => repositoryTasks.filter((task) => task.queue === 'team_tasks'), [repositoryTasks]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskPanelContexts, setTaskPanelContexts] = useState<WorkspacePanelContext[]>([]);
  const [activePanelContextId, setActivePanelContextId] = useState('');
  const { isCompactShell } = useViewportLayout();
  const [viewMode, setViewMode] = useState<TaskViewMode>('table');
  const setTaskViewMode = useCallback((mode: TaskViewMode) => {
    setViewMode(mode);
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortableColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [activeTab, setActiveTab] = useState<TaskTabType>('my_tasks');

  const [priorityFilter, setPriorityFilter] = useState('All');
  const [dueDateFilter, setDueDateFilter] = useState('All');
  const [slaStatusFilter, setSlaStatusFilter] = useState('All');

  const [panelWidth, setPanelWidth] = useState(() => getDefaultSidePanelWidth({ min: 400 }));
  const [isResizing, setIsResizing] = useState(false);
  const [taskTableScrollEl, setTaskTableScrollEl] = useState<HTMLDivElement | null>(null);
  const { showLeftStickyEdge, showRightStickyEdge, hasHorizontalOverflow } =
    useTableHorizontalScroll(taskTableScrollEl);
  const taskTableRightSticky = !selectedTask;

  const [myTasks, setMyTasks] = useState<Task[]>(repositoryMyTasks);
  const [teamTasks, setTeamTasks] = useState<Task[]>(repositoryTeamTasks);
  const [selectedTeamId, setSelectedTeamId] = useState(TEAMS[0].id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [teamSelectorOpen, setTeamSelectorOpen] = useState(false);
  const teamSelectorRef = useRef<HTMLDivElement | null>(null);
  const [billyPostApprovalFirst, setBillyPostApprovalFirst] = useState(false);

  const selectedTeam = TEAMS.find((t) => t.id === selectedTeamId) ?? TEAMS[0];
  const openTaskPanel = useCallback((task: Task | null) => {
    setSelectedTask(task);
    if (!task) {
      setActivePanelContextId('');
      return;
    }
    const contextId = taskPanelContextId(task.id);
    const context: WorkspacePanelContext = {
      id: contextId,
      label: task.taskId ?? task.id,
      icon: ClipboardList,
      clearable: true,
    };
    setActivePanelContextId(contextId);
    setTaskPanelContexts((current) => pushWorkspacePanelContext(current, context));
  }, []);
  const handleTaskPanelContextChange = useCallback((contextId: string) => {
    setActivePanelContextId(contextId);
    if (contextId.startsWith('document:') || contextId.startsWith('requirement:')) return;
    const id = contextId.startsWith('task:') ? contextId.slice('task:'.length) : contextId;
    const found = [...myTasks, ...teamTasks, ...repositoryTasks].find((task) => task.id === id || task.taskId === id);
    if (found) setSelectedTask(found);
  }, [myTasks, repositoryTasks, teamTasks]);
  const handleTaskPanelNavigationChange = useCallback((payload: TaskPanelNavigationPayload) => {
    setTaskPanelContexts(payload.contexts);
    setActivePanelContextId(payload.activeContextId);
  }, []);
  const clearTaskPanelContext = useCallback((contextId: string) => {
    let nextTaskId: string | undefined;
    setTaskPanelContexts((current) => {
      const index = current.findIndex((context) => context.id === contextId);
      const next = index >= 0 ? current[index + 1] ?? current[index - 1] : undefined;
      nextTaskId = next?.id;
      return current.filter((context) => context.id !== contextId);
    });
    if (nextTaskId) {
      setActivePanelContextId(nextTaskId);
      queueMicrotask(() => handleTaskPanelContextChange(nextTaskId!));
    } else {
      setSelectedTask(null);
      setActivePanelContextId('');
    }
  }, [handleTaskPanelContextChange]);
  useEffect(() => {
    setMyTasks(repositoryMyTasks);
    setTeamTasks(repositoryTeamTasks);
    setSelectedTask((current) =>
      current && repositoryTasks.some((task) => task.id === current.id) ? current : null,
    );
  }, [repositoryMyTasks, repositoryTasks, repositoryTeamTasks]);

  const isOnMyTasks = activeTab === 'my_tasks';
  const isOnTeamTasks = activeTab === 'team_tasks';

  // Live context overlay for the open task detail panel.
  const taskOverlay = useMemo(
    () =>
      selectedTask
        ? {
            id: `tasks:open:${selectedTask.id}`,
            kind: 'taskDetail' as const,
            icon: ClipboardList,
            crumbs: ['Tasks', selectedTask.id],
            label: `Task ${selectedTask.id}`,
            href: `/tasks#task=${selectedTask.id}`,
          }
        : null,
    [selectedTask],
  );
  useLiveContextOverlay(taskOverlay);

  // Restore selected task from URL hash when navigating back from the AI context history.
  useEffect(() => {
    const hash = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
    const query = location.search.startsWith('?') ? location.search.slice(1) : location.search;
    if (!hash && !query) return;
    const params = new URLSearchParams(hash || query);
    const taskId = params.get('task');
    if (!taskId) return;
    const found = [...myTasks, ...teamTasks].find(
      (t) => t.id === taskId || t.taskId === taskId,
    );
    if (found) {
      setActiveTab('all_tasks');
      openTaskPanel(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash, location.search]);

  useEffect(() => {
    const sync = () => {
      try {
        setBillyPostApprovalFirst(sessionStorage.getItem(STORAGE_KEYS.billyPostApproval) === '1');
      } catch {
        setBillyPostApprovalFirst(false);
      }
    };
    window.addEventListener(APP_EVENTS.billyFlow, sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener(APP_EVENTS.billyFlow, sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  const displayedTasks = useMemo(() => {
    if (activeTab === 'all_tasks') return repositoryTasks;
    if (isOnTeamTasks) return teamTasks;
    const base = myTasks;
    if (!billyPostApprovalFirst) return base;
    const t5197 = base.find((t) => t.id === 'IT-5197');
    const rest = base.filter((t) => t.id !== 'IT-5197');
    return [...(t5197 ? [t5197] : []), ...rest];
  }, [activeTab, isOnTeamTasks, myTasks, repositoryTasks, teamTasks, billyPostApprovalFirst]);

  const filteredTasks = useMemo(
    () =>
      filterTasks(displayedTasks, {
        searchQuery,
        priorityFilter,
        dueDateFilter,
        slaStatusFilter,
      }),
    [displayedTasks, searchQuery, priorityFilter, dueDateFilter, slaStatusFilter],
  );

  const sortedTasks = useMemo(
    () => sortTasks(filteredTasks, sortColumn, sortDirection),
    [filteredTasks, sortColumn, sortDirection],
  );

  const allTaskCount = repositoryTasks.length;
  const myOpenCount = myTasks.filter((t) => t.status !== 'Complete' && t.status !== 'Completed' && t.status !== 'Cancelled').length;
  const myDueTodayCount = myTasks.filter((t) => t.slaStatus === 'danger' || t.slaStatus === 'warning').length;
  const teamAvailableCount = teamTasks.filter((t) => !t.pickedUpBy).length;
  const teamInProgressCount = teamTasks.filter((t) => !!t.pickedUpBy).length;
  const teamOverdueCount = teamTasks.filter((t) => t.slaStatus === 'danger').length;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      const maxWidth = Math.round(window.innerWidth * 0.75);
      if (newWidth >= 400 && newWidth <= maxWidth) setPanelWidth(newWidth);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (teamSelectorRef.current && !teamSelectorRef.current.contains(e.target as Node)) {
        setTeamSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handlePickUp = useCallback((task: Task, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const result = pickUpTask(dataSource.activeDatasetId, task.id, workflowActor);
    updateDataSource({ activeDatasetId: result.datasetId });
    setActiveTab('my_tasks');
    const refreshed = listTasks(filterDatasetBySettings(getSystemDataset(result.datasetId), dataSource)).find(
      (row) => row.id === task.id,
    );
    if (refreshed) openTaskPanel(refreshed);
    setToastMessage(`Task ${task.id} picked up — now in My Tasks`);
  }, [dataSource, openTaskPanel, updateDataSource, workflowActor]);

  const handleRelease = useCallback((task: Task, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const result = releaseTaskToQueue(dataSource.activeDatasetId, task.id, workflowActor, 'team_tasks');
    updateDataSource({ activeDatasetId: result.datasetId });
    openTaskPanel(null);
    setToastMessage(`Task ${task.id} released to team queue`);
  }, [dataSource, openTaskPanel, updateDataSource, workflowActor]);

  const handleManagerRelease = useCallback((task: Task, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const result = releaseTaskToQueue(dataSource.activeDatasetId, task.id, workflowActor, 'team_tasks');
    updateDataSource({ activeDatasetId: result.datasetId });
    openTaskPanel(null);
    setToastMessage(`Task ${task.id} released back to queue`);
  }, [dataSource, openTaskPanel, updateDataSource, workflowActor]);

  const handleCompleteTask = useCallback((task: Task) => {
    const result = executeTaskAction(dataSource.activeDatasetId, task.id, 'complete', workflowActor);
    updateDataSource({ activeDatasetId: result.datasetId });
    openTaskPanel(null);
    setToastMessage(`Task ${task.id} completed`);
  }, [dataSource.activeDatasetId, openTaskPanel, updateDataSource, workflowActor]);

  const handleTaskAction = useCallback(
    (task: Task, actionType: string) => {
      const result = executeTaskAction(dataSource.activeDatasetId, task.id, actionType, workflowActor);
      updateDataSource({ activeDatasetId: result.datasetId });
      if (actionType === 'complete' || actionType === 'complete_return' || actionType === 'send_approver') {
        openTaskPanel(null);
      } else {
        const refreshed = listTasks(filterDatasetBySettings(getSystemDataset(result.datasetId), dataSource)).find(
          (row) => row.id === task.id,
        );
        if (refreshed) openTaskPanel(refreshed);
      }
      setToastMessage(`Action recorded on ${task.id}`);
    },
    [dataSource, openTaskPanel, updateDataSource, workflowActor],
  );

  const isRestricted = (task: Task) => task.requiredAuthorityLevel > CURRENT_USER.authorityLevel;

  const thStyle = "flex flex-col font-['Open_Sans:SemiBold',sans-serif] font-medium justify-center leading-[0] text-text-primary text-[14px] whitespace-nowrap";
  const fontVar: React.CSSProperties = { fontVariationSettings: "'wdth' 100" };

  return (
    <div className={`flex h-full flex-col ${UI_CLASS.workspaceTopLeftRadius} overflow-hidden`}>
      {/* Header */}
      <div className="relative z-10 border-b border-border-default bg-surface-primary px-6 pb-0 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="pl-[14px]">
            <h1 className="text-2xl font-semibold text-text-primary">Tasks</h1>
            <p className="mt-0.5 text-xs text-text-muted">
              {activeTab === 'all_tasks'
                ? `${allTaskCount} total tasks`
                : isOnMyTasks
                ? `${myOpenCount} open · ${myDueTodayCount} due today`
                : `${teamAvailableCount} available · ${teamInProgressCount} in progress`}
            </p>
          </div>
          <button onClick={() => setCreateTaskOpen(true)} className={`flex items-center justify-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-xs font-bold uppercase leading-none tracking-[0.4px] text-white ${UI_CLASS.primaryActionShadow} transition-colors hover:bg-brand-blue-hover`} style={fontVar}>
            <Plus className="h-4 w-4" />
            CREATE TASK
          </button>
        </div>

        <ModuleTabsBar
          tabs={[
            { id: 'all_tasks', label: 'All Tasks', count: allTaskCount },
            { id: 'my_tasks', label: 'My Tasks', count: myOpenCount },
            { id: 'team_tasks', label: 'Team Tasks', count: teamAvailableCount },
          ]}
          activeId={activeTab}
          onChange={(id) => {
            setActiveTab(id);
            openTaskPanel(null);
          }}
        />

        {/* Team Selector + Manager Metrics (Team Tasks only) */}
        {isOnTeamTasks && (
          <div className="flex items-center gap-4 pt-3">
            <div ref={teamSelectorRef} className="relative">
              <button
                onClick={() => setTeamSelectorOpen((p) => !p)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border-default bg-white px-3 py-1.5 text-xs font-semibold leading-none text-text-secondary transition-colors hover:bg-surface-muted"
              >
                <Users className="h-3.5 w-3.5 text-text-secondary" />
                {selectedTeam.name}
                <ChevronDown className={`h-3.5 w-3.5 text-text-secondary transition-transform ${teamSelectorOpen ? 'rotate-180' : ''}`} />
              </button>
              {teamSelectorOpen && (
                <div className="absolute left-0 top-[calc(100%+4px)] z-50 min-w-[220px] overflow-hidden rounded-lg border border-border-default bg-white shadow-[0_8px_24px_rgba(27,28,30,0.12)]">
                  {TEAMS.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => { setSelectedTeamId(team.id); setTeamSelectorOpen(false); }}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-primary ${team.id === selectedTeamId ? 'bg-surface-selected-alt font-semibold text-text-heading' : 'text-text-secondary'}`}
                    >
                      <Users className="h-3.5 w-3.5 text-text-secondary" />
                      {team.name}
                      <span className="ml-auto text-xs text-text-muted">{team.members.length} members</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {CURRENT_USER.isManager && (
              <div className="flex items-center gap-3 rounded-lg border border-[#e8eaed] bg-white px-3 py-1.5 text-xs">
                <span className="text-text-muted">Total: <span className="font-semibold text-text-primary">{teamTasks.length}</span></span>
                <span className="h-3 w-px bg-[#dbdee1]" />
                <span className="text-text-muted">Available: <span className="font-semibold text-brand-green">{teamAvailableCount}</span></span>
                <span className="h-3 w-px bg-[#dbdee1]" />
                <span className="text-text-muted">In Progress: <span className="font-semibold text-text-primary">{teamInProgressCount}</span></span>
                <span className="h-3 w-px bg-[#dbdee1]" />
                <span className="text-text-muted">Overdue: <span className={`font-semibold ${teamOverdueCount > 0 ? 'text-brand-red' : 'text-text-primary'}`}>{teamOverdueCount}</span></span>
              </div>
            )}
          </div>
        )}

        {/* Search, Filters, View Toggle */}
        <div className="flex w-full flex-wrap items-center gap-3 pb-4 pt-4 xl:flex-nowrap">
          <SearchBar
            containerClassName="order-1"
            value={searchQuery}
            onChange={setSearchQuery}
          />

          <div className="order-3 flex w-full flex-wrap items-center gap-3 xl:order-2 xl:w-auto xl:flex-none">
            <FilterDropdown label="Priority" options={['All', 'Urgent', 'High', 'Normal']} value={priorityFilter} onChange={setPriorityFilter} />
            <FilterDropdown label="Due date" options={['All', 'Today', 'This week', 'This month', 'Overdue']} value={dueDateFilter} onChange={setDueDateFilter} />
            <FilterDropdown label="SLA Status" options={['All', 'At risk', 'On track', 'Breached']} value={slaStatusFilter} onChange={setSlaStatusFilter} />
          </div>

          {!isCompactShell ? (
            <div
              className="order-2 ml-auto flex shrink-0 overflow-hidden rounded-md border border-border-default xl:order-3"
              role="group"
              aria-label="Task view"
            >
              <button
                type="button"
                onClick={() => setTaskViewMode('kanban')}
                className={`flex items-center gap-1.5 px-2.5 py-2 text-[11px] font-semibold transition-colors ${viewMode === 'kanban' ? 'bg-brand-blue text-white' : 'bg-white text-text-secondary hover:bg-surface-muted'}`}
                title="Board view"
                aria-pressed={viewMode === 'kanban'}
              >
                <Kanban className="h-4 w-4 shrink-0" />
                Board
              </button>
              <button
                type="button"
                onClick={() => setTaskViewMode('table')}
                className={`flex items-center gap-1.5 border-l border-border-default px-2.5 py-2 text-[11px] font-semibold transition-colors ${viewMode === 'table' ? 'bg-brand-blue text-white' : 'bg-white text-text-secondary hover:bg-surface-muted'}`}
                title="Table view"
                aria-pressed={viewMode === 'table'}
              >
                <List className="h-4 w-4 shrink-0" />
                Table
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* List + Side Panel */}
      <div className="relative z-0 flex min-h-0 flex-1 overflow-hidden">
        <div
          key={isCompactShell ? 'card' : viewMode}
          className={`relative z-0 flex min-h-0 min-w-0 flex-1 flex-col transition-all ${
            !isCompactShell && viewMode === 'kanban' ? 'bg-[#f4f5f7]' : 'bg-white'
          }`}
        >
          {isCompactShell ? (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-3">
                  {sortedTasks.map((task) => {
                    const restricted = isOnTeamTasks && !task.pickedUpBy && isRestricted(task);
                    return (
                      <TaskMobileListCard
                        key={task.id}
                        task={task}
                        selected={selectedTask?.id === task.id}
                        restricted={restricted}
                        onSelect={() => openTaskPanel(task)}
                        onNavigateCase={(caseId) => navigate(`/cases/${caseId}`)}
                        queueTeamId={isOnTeamTasks ? selectedTeamId : undefined}
                      />
                    );
                  })}
                </div>
              </div>
              <ModuleTablePaginationFooter total={sortedTasks.length} labelStyle={fontVar} />
            </div>
          ) : viewMode === 'kanban' ? (
            <TaskKanbanBoard
              tasks={sortedTasks}
              selectedTaskId={selectedTask?.id}
              activeTab={activeTab}
              isOnTeamTasks={isOnTeamTasks}
              isOnMyTasks={isOnMyTasks}
              onSelectTask={openTaskPanel}
              onPickUp={handlePickUp}
              onRelease={handleRelease}
              isRestricted={isRestricted}
            />
          ) : (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div
                ref={setTaskTableScrollEl}
                className={moduleTableScrollContainerClass(hasHorizontalOverflow, 'flex-1 bg-white')}
              >
                <table
                  className={MODULE_TABLE_LAYOUT_CLASS}
                  style={{ minWidth: isOnTeamTasks ? TASK_TABLE_MIN_WIDTH_TEAM : TASK_TABLE_MIN_WIDTH }}
                >
                  <colgroup>
                    <col style={{ width: TASK_TABLE_STICKY_COL.checkboxWidth }} />
                    <col style={{ width: TASK_TABLE_STICKY_COL.packWidth }} />
                    <col style={{ minWidth: 320 }} />
                    <col style={{ width: TASK_TABLE_SCROLL_COL_MIN }} />
                    <col style={{ width: TASK_TABLE_SCROLL_COL_MIN }} />
                    {isOnTeamTasks ? <col style={{ width: TASK_TABLE_SCROLL_COL_MIN }} /> : null}
                    <col style={{ width: TASK_TABLE_SCROLL_COL_MIN }} />
                    <col style={{ width: TASK_TABLE_STATUS_WIDTH }} />
                    <col style={{ width: TASK_TABLE_ACTIONS_WIDTH }} />
                  </colgroup>
                  <thead className="sticky top-0 z-[30] bg-surface-primary">
                    <tr>
                      <ModuleTableCheckboxColumnCell as="th" className="z-[34] bg-surface-primary">
                        <Checkbox className="size-4 rounded-[4px]" />
                      </ModuleTableCheckboxColumnCell>
                      <th
                        className={`relative sticky top-0 z-[35] overflow-hidden border-b border-border-default bg-surface-primary py-3 text-left align-middle ${MODULE_TABLE_FIRST_STICKY_COL_PADDING_CLASS} pr-2 ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                        style={{
                          left: TASK_TABLE_STICKY_COL.packLeft,
                          width: TASK_TABLE_STICKY_COL.packWidth,
                          minWidth: TASK_TABLE_STICKY_COL.packWidth,
                          maxWidth: TASK_TABLE_STICKY_COL.packWidth,
                        }}
                      >
                        {showLeftStickyEdge ? (
                          <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                        ) : null}
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-y-0 left-0 z-[0] h-full w-[calc(100%+3px)] bg-surface-primary"
                        />
                        <div className="relative z-[1] grid min-w-0" style={TASK_TABLE_LEFT_PACK_GRID_STYLE}>
                          <button type="button" onClick={() => handleSort('taskType')} className="group flex min-w-0 items-center gap-1 hover:text-brand-blue">
                            <div className={thStyle} style={fontVar}><p className="leading-[20px]">Task</p></div>
                            <ReorderIcon isActive={sortColumn === 'taskType'} />
                          </button>
                          <button type="button" onClick={() => handleSort('caseId')} className="group flex min-w-0 items-center gap-1 px-2 hover:text-brand-blue">
                            <div className={thStyle} style={fontVar}><p className="leading-[20px]">Case</p></div>
                            <ReorderIcon isActive={sortColumn === 'caseId'} />
                          </button>
                        </div>
                      </th>
                      <th className={`sticky top-0 border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle ${MODULE_TABLE_SUMMARY_COL_CLASS}`}>
                        <button onClick={() => handleSort('taskType')} className="group flex items-center gap-1 hover:text-brand-blue">
                          <div className={thStyle} style={fontVar}>
                            <SummaryTableColumnHeader className="leading-[20px] text-text-primary" style={fontVar} />
                          </div>
                          <ReorderIcon isActive={sortColumn === 'taskType'} />
                        </button>
                      </th>
                      <th className="sticky top-0 min-w-[112px] border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle">
                        <button onClick={() => handleSort('priority')} className="group flex items-center gap-1 hover:text-brand-blue">
                          <div className={thStyle} style={fontVar}><p className="leading-[20px]">Priority</p></div>
                          <ReorderIcon isActive={sortColumn === 'priority'} />
                        </button>
                      </th>
                      <th className="sticky top-0 min-w-[112px] border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle">
                        <button onClick={() => handleSort('product')} className="group flex items-center gap-1 hover:text-brand-blue">
                          <div className={thStyle} style={fontVar}><p className="leading-[20px]">Product</p></div>
                          <ReorderIcon isActive={sortColumn === 'product'} />
                        </button>
                      </th>
                      {isOnTeamTasks && (
                        <th className="sticky top-0 min-w-[112px] border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle">
                          <div className={thStyle} style={fontVar}>
                            <p className="leading-[20px]">Picked Up By</p>
                          </div>
                        </th>
                      )}
                      <th className="sticky top-0 min-w-[112px] border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle">
                        <button onClick={() => handleSort('origin')} className="group flex items-center gap-1 hover:text-brand-blue">
                          <div className={thStyle} style={fontVar}><p className="leading-[20px]">Source</p></div>
                          <ReorderIcon isActive={sortColumn === 'origin'} />
                        </button>
                      </th>
                      <th
                        className={`relative border-b border-border-default bg-surface-primary px-2 py-3 text-left align-middle ${
                          taskTableRightSticky ? `sticky top-0 z-[34] ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}` : ''
                        }`}
                        style={{
                          width: TASK_TABLE_STATUS_WIDTH,
                          minWidth: TASK_TABLE_STATUS_WIDTH,
                          ...(taskTableRightSticky ? { right: TASK_TABLE_ACTIONS_WIDTH } : {}),
                        }}
                      >
                        {taskTableRightSticky && showRightStickyEdge ? (
                          <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                        ) : null}
                        <button onClick={() => handleSort('status')} className="group flex items-center gap-1 hover:text-brand-blue">
                          <div className={thStyle} style={fontVar}><p className="leading-[20px]">Status</p></div>
                          <ReorderIcon isActive={sortColumn === 'status'} />
                        </button>
                      </th>
                      <th
                        className={`relative h-12 min-h-12 border-b border-border-default bg-surface-primary p-0 align-middle ${
                          taskTableRightSticky ? 'sticky top-0 right-0 z-[34] w-[48px] min-w-[48px] max-w-[48px]' : 'w-12 min-w-12 max-w-12'
                        }`}
                      >
                        {taskTableRightSticky ? (
                          <>
                            <span
                              aria-hidden
                              className="pointer-events-none absolute inset-y-0 left-0 z-[9] h-full min-h-12 w-[calc(100%+3px)] bg-surface-primary"
                            />
                            <span className="sr-only">Actions</span>
                          </>
                        ) : null}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTasks.map((task) => {
                      const locked = isOnTeamTasks && !!task.pickedUpBy;
                      const restricted = isOnTeamTasks && !task.pickedUpBy && isRestricted(task);
                      const stickyRowSurface =
                        locked
                          ? 'bg-surface-hover group-hover:bg-surface-hover'
                          : restricted
                            ? 'bg-surface-primary group-hover:bg-surface-primary'
                            : selectedTask?.id === task.id
                              ? 'bg-surface-selected-alt group-hover:bg-surface-selected-alt'
                              : 'bg-white group-hover:bg-surface-hover';
                      const cellSurface = stickyRowSurface;

                      return (
                        <tr
                          key={task.id}
                          data-keep-sidepanel="row"
                          onClick={() => { if (!restricted) openTaskPanel(task); }}
                          className={`group ${restricted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-[0.995]'}`}
                        >
                          <ModuleTableCheckboxColumnCell
                            as="td"
                            className={`z-[14] ${TABLE_CELL_ALIGN_CLASS}`}
                            surfaceClassName={stickyRowSurface}
                          >
                            <Checkbox className="size-4 rounded-[4px]" onClick={(e) => e.stopPropagation()} />
                          </ModuleTableCheckboxColumnCell>
                          <td
                            className={`relative sticky z-[15] overflow-hidden border-b border-border-default py-3 ${TABLE_CELL_ALIGN_CLASS} ${MODULE_TABLE_FIRST_STICKY_COL_PADDING_CLASS} pr-2 ${stickyRowSurface} ${showLeftStickyEdge ? 'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`}
                            style={{
                              left: TASK_TABLE_STICKY_COL.packLeft,
                              width: TASK_TABLE_STICKY_COL.packWidth,
                              minWidth: TASK_TABLE_STICKY_COL.packWidth,
                              maxWidth: TASK_TABLE_STICKY_COL.packWidth,
                            }}
                          >
                            {showLeftStickyEdge ? (
                              <span className="pointer-events-none absolute right-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                            ) : null}
                            <span
                              aria-hidden
                              className={`pointer-events-none absolute inset-y-0 left-0 z-[0] h-full w-[calc(100%+3px)] ${stickyRowSurface}`}
                            />
                            <div className="relative z-[1] grid min-w-0" style={TASK_TABLE_LEFT_PACK_GRID_STYLE}>
                              <div className="min-w-0 pr-1">
                                <TaskTableFirstColumnCell
                                  taskId={task.taskId ?? task.id}
                                  taskName={task.taskType}
                                  aiSourced={isTaskAiSourced(task)}
                                />
                              </div>
                              <div className="min-w-0 px-2">
                                {task.caseId ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); navigate(`/cases/${task.caseId}`); }}
                                      className={TABLE_LINK_TRUNCATE_CLASS}
                                      title={task.caseId}
                                    >
                                      {task.caseId}
                                    </button>
                                    <span
                                      className={`mt-0.5 block truncate ${TABLE_SUBTEXT_CLASS}`}
                                      title={task.primaryPartyName ?? task.claimantName}
                                    >
                                      {task.primaryPartyName ?? task.claimantName}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className={TABLE_SUBTEXT_CLASS}>—</span>
                                    <span
                                      className={`mt-0.5 block truncate ${TABLE_SUBTEXT_CLASS}`}
                                      title={task.primaryPartyName ?? task.claimantName}
                                    >
                                      {task.primaryPartyName ?? task.claimantName}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className={`border-b border-border-default px-2 py-3 ${TABLE_CELL_ALIGN_CLASS} ${MODULE_TABLE_SUMMARY_COL_CLASS} ${cellSurface}`}>
                            <TwoLineSummaryCell
                              title={task.aiSummary ?? task.description ?? '—'}
                              titleMaxLines={2}
                              titleWeight="normal"
                            />
                          </td>
                          <td className={`min-w-[112px] border-b border-border-default px-2 py-3 ${TABLE_CELL_ALIGN_CLASS} ${cellSurface}`}>
                            <PriorityChip priority={task.priority} />
                          </td>
                          <td className={`min-w-[112px] border-b border-border-default px-2 py-3 whitespace-nowrap ${TABLE_CELL_ALIGN_CLASS} ${cellSurface} ${TABLE_TEXT_CLASS}`}>
                            {task.product}
                          </td>
                          {isOnTeamTasks && (
                            <td className={`min-w-[112px] border-b border-border-default px-2 py-3 ${TABLE_CELL_ALIGN_CLASS} ${cellSurface}`}>
                              {task.pickedUpBy ? (
                                <span className={`whitespace-nowrap ${TABLE_SUBTEXT_CLASS}`}>{task.pickedUpBy}</span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-[#e5f5ea] px-2 py-0.5 text-[11px] font-semibold text-brand-green">Available</span>
                              )}
                            </td>
                          )}
                          <td className={`min-w-[112px] border-b border-border-default px-2 py-3 ${TABLE_CELL_ALIGN_CLASS} ${cellSurface}`}>
                            <TaskSourceTag task={task} />
                          </td>
                          <td
                            className={`relative border-b border-border-default px-2 py-3 ${TABLE_CELL_ALIGN_CLASS} ${
                              taskTableRightSticky
                                ? `sticky z-[14] ${stickyRowSurface} ${showRightStickyEdge ? 'shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]' : ''}`
                                : cellSurface
                            }`}
                            style={{
                              width: TASK_TABLE_STATUS_WIDTH,
                              minWidth: TASK_TABLE_STATUS_WIDTH,
                              ...(taskTableRightSticky ? { right: TASK_TABLE_ACTIONS_WIDTH } : {}),
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {taskTableRightSticky && showRightStickyEdge ? (
                              <span className="pointer-events-none absolute left-[-1px] top-0 z-[8] h-full w-px bg-[#dbdee1]/60" />
                            ) : null}
                            <LozengeTag label={task.status} type={getStatusLozengeType(task.status, 'task')} subtle />
                          </td>
                          <td
                            className={`relative box-border min-h-12 border-b border-border-default p-0 align-middle ${
                              taskTableRightSticky
                                ? `sticky right-0 z-[14] w-[48px] min-w-[48px] max-w-[48px] ${stickyRowSurface}`
                                : `w-12 min-w-12 max-w-12 ${cellSurface}`
                            }`}
                          >
                            {taskTableRightSticky ? (
                              <span
                                aria-hidden
                                className={`pointer-events-none absolute inset-y-0 left-0 z-[0] h-full w-[calc(100%+3px)] ${stickyRowSurface}`}
                              />
                            ) : null}
                            <div className="relative z-10 flex h-full w-full items-center justify-center">
                              {isOnTeamTasks && locked && CURRENT_USER.isManager ? (
                                <button onClick={(e) => { e.stopPropagation(); handleManagerRelease(task, e); }} className="text-brand-blue hover:text-text-heading" title="Release">
                                  <ArrowLeftRight className="h-4 w-4" />
                                </button>
                              ) : (
                                <button onClick={(e) => e.stopPropagation()} className="text-text-secondary hover:text-text-primary">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <ModuleTablePaginationFooter total={sortedTasks.length} labelStyle={fontVar} />
            </div>
          )}
        </div>

        {selectedTask && (
          <WorkspaceObjectSidePanel
            contexts={taskPanelContexts}
            activeContextId={activePanelContextId || taskPanelContextId(selectedTask.id)}
            onChangeContext={handleTaskPanelContextChange}
            onClearContext={clearTaskPanelContext}
            onClose={() => openTaskPanel(null)}
            panelWidth={panelWidth}
            onPanelWidthChange={setPanelWidth}
            isResizing={isResizing}
            onResizeStart={() => setIsResizing(true)}
          >
            <TaskDetailEmbeddedView
              task={selectedTask}
              panelWidth={panelWidth}
              onPanelWidthChange={setPanelWidth}
              onResizeStart={() => setIsResizing(true)}
              onClose={() => openTaskPanel(null)}
              navigate={navigate}
              queueContext={selectedTask.queue === 'team_tasks' ? 'team_tasks' : 'my_tasks'}
              panelContexts={taskPanelContexts}
              activePanelContextId={activePanelContextId || taskPanelContextId(selectedTask.id)}
              onPanelNavigationChange={handleTaskPanelNavigationChange}
              onPickUp={handlePickUp}
              onRelease={handleRelease}
              onManagerRelease={handleManagerRelease}
              currentUserIsManager={CURRENT_USER.isManager}
              onCompleteTask={handleCompleteTask}
              onTaskAction={handleTaskAction}
            />
          </WorkspaceObjectSidePanel>
        )}
      </div>

      {/* Success toast — bottom-right, high-contrast green */}
      {toastMessage && (
        <div
          className="fixed bottom-6 right-6 z-[200] max-w-[min(440px,calc(100vw-3rem))] animate-[fadeInUp_0.35s_ease-out]"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3 rounded-lg border-2 border-white/30 bg-[#00a651] px-5 py-4 shadow-[0_12px_40px_rgba(0,133,65,0.5),0_4px_12px_rgba(0,0,0,0.15)]">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/20">
              <Check className="h-6 w-6 text-white" strokeWidth={2.5} aria-hidden />
            </span>
            <span className="min-w-0 pt-0.5 text-base font-semibold leading-snug text-white">{toastMessage}</span>
          </div>
        </div>
      )}
      <CreateTaskModal
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        dataSource={dataSource}
        onCreated={({ datasetId, taskId }) => {
          const nextDataSource = { ...dataSource, activeDatasetId: datasetId };
          const createdTask = listTasks(filterDatasetBySettings(getSystemDataset(datasetId), nextDataSource)).find((task) => task.id === taskId);
          updateDataSource({ activeDatasetId: datasetId });
          setSearchQuery('');
          setPriorityFilter('All');
          setDueDateFilter('All');
          setSlaStatusFilter('All');
          setSortColumn(null);
          if (createdTask) {
            if (createdTask.queue === 'team_tasks') {
              setTeamTasks((current) => [createdTask, ...current.filter((task) => task.id !== createdTask.id)]);
              setActiveTab('team_tasks');
            } else {
              setMyTasks((current) => [createdTask, ...current.filter((task) => task.id !== createdTask.id)]);
              setActiveTab('my_tasks');
            }
            openTaskPanel(createdTask);
            navigate(`/tasks#task=${encodeURIComponent(taskId)}`, { replace: true });
          }
          setToastMessage(`Task ${taskId} created`);
        }}
      />
    </div>
  );
}
