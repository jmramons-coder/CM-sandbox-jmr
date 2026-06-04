import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Users as UsersIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useLiveContextOverlay } from '../contexts/LiveContextProvider';
import { useActiveUser } from '../contexts/ActiveUserContext';
import { appToast } from '../utils/app-toast';
import { useDataSourceSettings, usePlatformSettings } from '../contexts/PlatformSettingsContext';
import { filterDatasetBySettings, getSystemDataset } from '../data/objectRepository';
import { getPlatformUserFromDataset } from '../data/datasetUsers';
import { getPlatformUserByName } from '../data/platformUserCatalog';
import { addAvailabilityBlock } from '../data/userAvailabilityStore';
import {
  buildUserDirectoryRows,
  filterUsersByTab,
  tasksForPlatformUser,
  userMatchesSearch,
} from '../data/userWorkloadProjection';
import { reassignTasks } from '../data/workflowActions';
import type { UserDirectoryRow, UsersTabType, UserSortableColumn } from '../domain/access/platformUser';
import type { SortDirection } from '../types';
import { FilterDropdown, ModuleTablePaginationFooter } from './index';
import { SearchBar } from './ds';
import { ModuleTabsBar } from './ModuleTabsBar';
import { useTableHorizontalScroll } from '../hooks/useTableHorizontalScroll';
import { useMobileSidePanelLayout } from '../hooks/useMobileSidePanelLayout';
import { UI_CLASS } from '../constants/design-tokens';
import { getDefaultSidePanelWidth } from '../utils/sidepanel-width';
import { pushWorkspacePanelContext, userPanelContextId } from '../utils/workspacePanelContextUtils';
import { sortUserRows } from '../utils/sort-users';
import { AvailabilityBlockModal } from './users/AvailabilityBlockModal';
import { ReassignWorkModal } from './users/ReassignWorkModal';
import { UserDetailSidePanel } from './users/UserDetailSidePanel';
import { UsersTable } from './users/UsersTable';
import { WorkspaceObjectSidePanel, type WorkspacePanelContext } from './WorkspaceObjectSidePanel';
import {
  LAYOUT_HEADER_HEIGHT_PX,
  MOBILE_SIDE_PANEL_SCRIM_Z_CLASS,
  MOBILE_SIDE_PANEL_Z_CLASS,
} from './WorkspaceSidePanelChrome';

const fontVar: CSSProperties = { fontVariationSettings: "'wdth' 100" };

export function UsersModule() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roleView, profile } = useActiveUser();
  const isManager = roleView === 'manager';
  const dataSource = useDataSourceSettings();
  const { updateDataSource } = usePlatformSettings();

  const [activeTab, setActiveTab] = useState<UsersTabType>(isManager ? 'my_team' : 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<UserSortableColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedUser, setSelectedUser] = useState<UserDirectoryRow | null>(null);
  const [userPanelContexts, setUserPanelContexts] = useState<WorkspacePanelContext[]>([]);
  const [activePanelContextId, setActivePanelContextId] = useState('');
  const [panelWidth, setPanelWidth] = useState(() => getDefaultSidePanelWidth({ min: 400 }));
  const [isResizing, setIsResizing] = useState(false);
  const [tableScrollEl, setTableScrollEl] = useState<HTMLDivElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [teamFilter, setTeamFilter] = useState('All');

  const sidePanelOpen = Boolean(selectedUser);
  const { workspaceRef, isCompactShell } = useMobileSidePanelLayout(panelWidth, sidePanelOpen);
  const mobilePanelWidth = typeof window !== 'undefined' ? window.innerWidth : panelWidth;
  const { showLeftStickyEdge, showRightStickyEdge, hasHorizontalOverflow } =
    useTableHorizontalScroll(tableScrollEl);
  const userTableRightSticky = !selectedUser;

  const dataset = useMemo(
    () => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource),
    [dataSource, refreshKey],
  );

  const allRows = useMemo(
    () => buildUserDirectoryRows(dataset, dataSource.activeDatasetId),
    [dataset, dataSource.activeDatasetId, refreshKey],
  );

  const managerTeamIds = useMemo(() => {
    const self =
      getPlatformUserFromDataset(dataset, profile.name)
      ?? getPlatformUserByName(profile.name)
      ?? allRows.find((row) => row.name === profile.name);
    return self?.teamIds ?? allRows.find((row) => row.role === 'manager')?.teamIds ?? [];
  }, [allRows, dataset, profile.name]);

  const teamOptions = useMemo(() => {
    const labels = new Map<string, string>();
    allRows.forEach((row) => {
      row.teamIds.forEach((id, index) => {
        labels.set(id, row.teamLabels[index] ?? id);
      });
    });
    return ['All', ...Array.from(labels.values())];
  }, [allRows]);

  const tabRows = useMemo(() => {
    let rows = filterUsersByTab(allRows, activeTab, managerTeamIds, profile.name);
    if (!isManager) {
      const self = allRows.find((row) => row.name === profile.name);
      rows = self ? [self] : rows.filter((row) => row.name === profile.name);
    }
    if (teamFilter !== 'All') {
      rows = rows.filter((row) => row.teamLabels.includes(teamFilter));
    }
    return rows.filter((row) => userMatchesSearch(row, searchQuery));
  }, [activeTab, allRows, isManager, managerTeamIds, profile.name, searchQuery, teamFilter]);

  const sortedRows = useMemo(
    () => sortUserRows(tabRows, sortColumn, sortDirection),
    [tabRows, sortColumn, sortDirection],
  );

  const attentionCount = useMemo(
    () => filterUsersByTab(allRows, 'attention', managerTeamIds, profile.name).length,
    [allRows, managerTeamIds, profile.name],
  );
  const awayCount = useMemo(
    () => filterUsersByTab(allRows, 'away', managerTeamIds, profile.name).length,
    [allRows, managerTeamIds, profile.name],
  );
  const assessorCount = useMemo(
    () => filterUsersByTab(allRows, 'assessors', managerTeamIds, profile.name).length,
    [allRows, managerTeamIds, profile.name],
  );

  const bumpRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const openUser = useCallback((row: UserDirectoryRow | null) => {
    setSelectedUser(row);
    if (!row) {
      setActivePanelContextId('');
      navigate('/team', { replace: true });
      return;
    }
    const contextId = userPanelContextId(row.id);
    const context: WorkspacePanelContext = {
      id: contextId,
      label: row.name,
      icon: UsersIcon,
      clearable: true,
    };
    setActivePanelContextId(contextId);
    setUserPanelContexts((current) => pushWorkspacePanelContext(current, context));
    navigate(`/team?user=${encodeURIComponent(row.id)}`, { replace: true });
  }, [navigate]);

  const closeUserPanel = useCallback(() => {
    openUser(null);
  }, [openUser]);

  const handleUserPanelContextChange = useCallback((contextId: string) => {
    setActivePanelContextId(contextId);
    if (!contextId.startsWith('user:')) return;
    const userId = contextId.slice('user:'.length);
    const found = allRows.find((row) => row.id === userId);
    if (found) setSelectedUser(found);
  }, [allRows]);

  const clearUserPanelContext = useCallback((contextId: string) => {
    let nextContextId: string | undefined;
    setUserPanelContexts((current) => {
      const index = current.findIndex((context) => context.id === contextId);
      const next = index >= 0 ? current[index + 1] ?? current[index - 1] : undefined;
      nextContextId = next?.id;
      return current.filter((context) => context.id !== contextId);
    });
    if (nextContextId) {
      setActivePanelContextId(nextContextId);
      queueMicrotask(() => handleUserPanelContextChange(nextContextId!));
    } else {
      closeUserPanel();
    }
  }, [closeUserPanel, handleUserPanelContextChange]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('user');
    if (userId) {
      const found = allRows.find((row) => row.id === userId);
      if (found) {
        setSelectedUser(found);
        const contextId = userPanelContextId(found.id);
        setActivePanelContextId(contextId);
        setUserPanelContexts((current) =>
          pushWorkspacePanelContext(current, {
            id: contextId,
            label: found.name,
            icon: UsersIcon,
            clearable: true,
          }),
        );
      }
      return;
    }
    if (!isManager && !selectedUser) {
      const self = allRows.find((row) => row.name === profile.name);
      if (self) openUser(self);
    }
  }, [allRows, isManager, location.search, openUser, profile.name, selectedUser]);

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

  const userOverlay = useMemo(
    () =>
      selectedUser
        ? {
            id: `users:open:${selectedUser.id}`,
            kind: 'other' as const,
            icon: UsersIcon,
            crumbs: ['Team', selectedUser.name],
            label: selectedUser.name,
            href: `/team?user=${selectedUser.id}`,
          }
        : null,
    [selectedUser],
  );
  useLiveContextOverlay(userOverlay);

  const handleSort = (column: UserSortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleReassignConfirm = (input: {
    toUser: { name: string };
    taskIds: string[];
    reason: string;
  }) => {
    if (!selectedUser) return;
    const result = reassignTasks(dataSource.activeDatasetId, {
      taskIds: input.taskIds,
      toAssigneeName: input.toUser.name,
      actor: { name: profile.name },
      reason: input.reason || undefined,
    });
    updateDataSource({ activeDatasetId: result.datasetId });
    setReassignOpen(false);
    bumpRefresh();
    appToast.success(`Reassigned ${input.taskIds.length} task(s) to ${input.toUser.name}`);
  };

  const selectedTasks = selectedUser ? tasksForPlatformUser(dataset, selectedUser.id) : [];

  const showUserPanel =
    Boolean(selectedUser && userPanelContexts.length > 0) && (!isCompactShell || sidePanelOpen);

  const userPanel = selectedUser && userPanelContexts.length > 0 ? (
    <WorkspaceObjectSidePanel
      portal={!isCompactShell}
      closeOnOutsideClick={!isCompactShell}
      showResizeHandle={!isCompactShell}
      zIndexClassName={isCompactShell ? 'z-[1110]' : 'z-[190]'}
      contexts={userPanelContexts}
      activeContextId={activePanelContextId || userPanelContextId(selectedUser.id)}
      onChangeContext={handleUserPanelContextChange}
      onClearContext={clearUserPanelContext}
      onClose={closeUserPanel}
      panelWidth={isCompactShell ? mobilePanelWidth : panelWidth}
      onPanelWidthChange={setPanelWidth}
      isResizing={isResizing}
      onResizeStart={() => setIsResizing(true)}
    >
      <UserDetailSidePanel
        user={selectedUser}
        isManager={isManager}
        onReassign={() => setReassignOpen(true)}
        onBlockAvailability={() => setBlockOpen(true)}
        onAvailabilityChanged={bumpRefresh}
      />
    </WorkspaceObjectSidePanel>
  ) : null;

  const mobileUserPanelPortal =
    isCompactShell && showUserPanel && typeof document !== 'undefined'
      ? createPortal(
          <>
            <button
              type="button"
              aria-label="Close user panel"
              className={`fixed inset-0 ${MOBILE_SIDE_PANEL_SCRIM_Z_CLASS} bg-black/20 lg:hidden`}
              onClick={closeUserPanel}
            />
            <div
              className={`fixed inset-x-0 ${MOBILE_SIDE_PANEL_Z_CLASS} flex min-h-0 flex-col overflow-hidden bg-white lg:hidden`}
              style={{
                top: LAYOUT_HEADER_HEIGHT_PX,
                height: `calc(100dvh - ${LAYOUT_HEADER_HEIGHT_PX}px)`,
              }}
            >
              {userPanel}
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <div className={`flex h-full flex-col overflow-hidden ${UI_CLASS.workspaceTopLeftRadius}`}>
      <div className="relative z-10 shrink-0 border-b border-border-default bg-surface-primary px-6 pb-0 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="pl-[14px]">
            <h1 className="text-2xl font-semibold text-text-primary">Team</h1>
            <p className="mt-0.5 text-xs text-text-muted">
              {isManager
                ? `${allRows.length} people · ${attentionCount} need attention`
                : 'Your profile and workload'}
            </p>
          </div>
        </div>

        {isManager ? (
          <ModuleTabsBar
            tabs={[
              { id: 'my_team', label: 'My team', count: filterUsersByTab(allRows, 'my_team', managerTeamIds, profile.name).length },
              { id: 'all', label: 'All users', count: allRows.length },
              { id: 'assessors', label: 'Assessors', count: assessorCount },
              { id: 'managers', label: 'Managers', count: filterUsersByTab(allRows, 'managers', managerTeamIds, profile.name).length },
              { id: 'away', label: 'Away', count: awayCount },
              { id: 'attention', label: 'Needs attention', count: attentionCount },
            ]}
            activeId={activeTab}
            onChange={(id) => {
              setActiveTab(id as UsersTabType);
              openUser(null);
            }}
          />
        ) : null}

        <div className="flex w-full flex-wrap items-center gap-3 pb-4 pt-4 xl:flex-nowrap">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search users…" />
          {isManager && teamOptions.length > 2 ? (
            <FilterDropdown label="Team" options={teamOptions} value={teamFilter} onChange={setTeamFilter} />
          ) : null}
        </div>
      </div>

      <div ref={workspaceRef} className="relative z-0 flex min-h-0 flex-1 overflow-hidden">
        <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col bg-white transition-all">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <UsersTable
              rows={sortedRows}
              sortColumn={sortColumn}
              onSort={handleSort}
              selectedUserId={selectedUser?.id}
              onSelectUser={openUser}
              tableRightSticky={userTableRightSticky}
              setScrollEl={setTableScrollEl}
              showLeftStickyEdge={showLeftStickyEdge}
              showRightStickyEdge={showRightStickyEdge}
              hasHorizontalOverflow={hasHorizontalOverflow}
            />
            <ModuleTablePaginationFooter total={sortedRows.length} labelStyle={fontVar} />
          </div>
        </div>

        {showUserPanel && !isCompactShell ? userPanel : null}
      </div>

      {mobileUserPanelPortal}

      {selectedUser ? (
        <>
          <ReassignWorkModal
            open={reassignOpen}
            fromUser={selectedUser}
            tasks={selectedTasks}
            candidates={allRows}
            datasetId={dataSource.activeDatasetId}
            onClose={() => setReassignOpen(false)}
            onConfirm={handleReassignConfirm}
          />
          <AvailabilityBlockModal
            open={blockOpen}
            userName={selectedUser.name}
            onClose={() => setBlockOpen(false)}
            onSubmit={(input) => {
              addAvailabilityBlock(dataSource.activeDatasetId, {
                userId: selectedUser.id,
                ...input,
                createdBy: profile.name,
              });
              setBlockOpen(false);
              bumpRefresh();
              appToast.success(`Availability block saved for ${selectedUser.name}`);
            }}
          />
        </>
      ) : null}

    </div>
  );
}
