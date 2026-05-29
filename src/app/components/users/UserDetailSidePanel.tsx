import { useMemo, useState } from 'react';
import { Calendar, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router';
import { MetricBarList } from '../dashboard/dashboardWidgetUtils';
import { LozengeTag } from '../LozengeTag';
import { TABLE_LINK_CLASS, TABLE_SUBTEXT_CLASS, TABLE_TEXT_CLASS } from '../ModuleCellHelpers';
import { listAvailabilityBlocks, removeAvailabilityBlock } from '../../data/userAvailabilityStore';
import { tasksForPlatformUser } from '../../data/userWorkloadProjection';
import { filterDatasetBySettings, getSystemDataset } from '../../data/objectRepository';
import type { UserDirectoryRow } from '../../domain/access/platformUser';
import { useDataSourceSettings } from '../../contexts/PlatformSettingsContext';
import { getStatusLozengeType } from '../../utils';
import { getUserHrProfile } from '../../data/userHrProfile';
import { USER_INITIALS_AVATAR_CLASS } from './userAvatarStyles';
import { UserProfileOverviewSection } from './UserProfileOverviewSection';
import { UserProfileTrainingSection } from './UserProfileTrainingSection';

type PanelTab = 'overview' | 'workload' | 'tasks' | 'training' | 'availability';

type UserDetailSidePanelProps = {
  user: UserDirectoryRow;
  isManager: boolean;
  onReassign: () => void;
  onBlockAvailability: () => void;
  onAvailabilityChanged: () => void;
};

export function UserDetailSidePanel({
  user,
  isManager,
  onReassign,
  onBlockAvailability,
  onAvailabilityChanged,
}: UserDetailSidePanelProps) {
  const navigate = useNavigate();
  const dataSource = useDataSourceSettings();
  const [tab, setTab] = useState<PanelTab>('overview');
  const dataset = useMemo(
    () => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource),
    [dataSource],
  );
  const assignedTasks = useMemo(
    () => tasksForPlatformUser(dataset, user.id),
    [dataset, user.id],
  );
  const blocks = listAvailabilityBlocks(dataSource.activeDatasetId, user.id);
  const hrProfile = useMemo(() => getUserHrProfile(user), [user]);

  const workloadBars = useMemo(() => {
    const entries = Object.entries(user.workload.byWorkType ?? {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const max = Math.max(1, ...entries.map(([, count]) => count));
    return entries.map(([label, count]) => ({
      label: label.length > 28 ? `${label.slice(0, 26)}…` : label,
      val: String(count),
      bar: Math.round((count / max) * 100),
      cls: '' as const,
    }));
  }, [user.workload.byWorkType]);

  const tabs: { id: PanelTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'workload', label: 'Workload' },
    { id: 'tasks', label: `Tasks (${assignedTasks.length})` },
    { id: 'training', label: 'Training' },
    { id: 'availability', label: 'Availability' },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="shrink-0 border-b border-border-default bg-gradient-to-b from-surface-primary to-white px-5 pb-4 pt-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex size-14 shrink-0 items-center justify-center rounded-full text-base font-semibold ring-2 ring-white ${USER_INITIALS_AVATAR_CLASS}`}
          >
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-text-heading">{user.name}</h2>
            <p className="mt-0.5 text-[13px] leading-snug text-text-secondary">{hrProfile.headline}</p>
            <p className="mt-1 truncate text-xs text-text-muted">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center rounded-md border border-border-default bg-white px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary">
                {hrProfile.department}
              </span>
              <span className="inline-flex items-center rounded-md border border-border-default bg-white px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary">
                {hrProfile.location}
              </span>
              <LozengeTag
                label={user.blockedToday ? 'Away' : user.status === 'active' ? 'Active' : user.status}
                type={user.blockedToday ? 'Warning' : 'Success'}
                subtle
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border-default px-3">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`shrink-0 px-3 py-2.5 text-xs font-semibold transition-colors ${
              tab === item.id
                ? 'border-b-2 border-brand-blue text-brand-blue'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {tab === 'overview' ? <UserProfileOverviewSection user={user} /> : null}

        {tab === 'workload' ? (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">{user.workload.trendLabel}</p>
            <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
              <div
                className={`h-full rounded-full ${
                  user.workload.capacityPct > 100 ? 'bg-brand-orange' : 'bg-brand-blue'
                }`}
                style={{ width: `${Math.min(100, user.workload.capacityPct)}%` }}
              />
            </div>
            {workloadBars.length > 0 ? (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">By task type</h3>
                <MetricBarList bars={workloadBars} />
              </div>
            ) : (
              <p className="text-sm text-text-muted">No open tasks assigned.</p>
            )}
          </div>
        ) : null}

        {tab === 'tasks' ? (
          <div className="space-y-2">
            {assignedTasks.length === 0 ? (
              <p className="text-sm text-text-muted">No open tasks.</p>
            ) : (
              assignedTasks.slice(0, 12).map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => navigate(`/tasks#task=${encodeURIComponent(task.id)}`)}
                  className="flex w-full flex-col rounded-lg border border-border-default px-3 py-2 text-left hover:bg-surface-muted"
                >
                  <span className={TABLE_TEXT_CLASS}>{task.taskType}</span>
                  <span className={TABLE_SUBTEXT_CLASS}>{task.id}</span>
                  <span className="mt-1">
                    <LozengeTag label={task.status} type={getStatusLozengeType(task.status, 'task')} />
                  </span>
                </button>
              ))
            )}
            {assignedTasks.length > 12 ? (
              <button
                type="button"
                className={TABLE_LINK_CLASS}
                onClick={() => navigate(`/tasks?assignee=${encodeURIComponent(user.name)}`)}
              >
                View all in Tasks
              </button>
            ) : null}
          </div>
        ) : null}

        {tab === 'training' ? <UserProfileTrainingSection user={user} /> : null}

        {tab === 'availability' ? (
          <div className="space-y-3">
            {blocks.length === 0 ? (
              <p className="text-sm text-text-muted">No availability blocks scheduled.</p>
            ) : (
              blocks.map((block) => (
                <div key={block.id} className="rounded-lg border border-border-default px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium capitalize text-text-primary">{block.reason.replace('_', ' ')}</span>
                    {isManager ? (
                      <button
                        type="button"
                        className="text-xs text-brand-blue underline"
                        onClick={() => {
                          removeAvailabilityBlock(dataSource.activeDatasetId, block.id);
                          onAvailabilityChanged();
                        }}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <p className="text-text-secondary">
                    {block.startDate} → {block.endDate}
                  </p>
                  {block.blocksAssignment ? (
                    <p className="text-[11px] text-brand-orange">Blocks new assignments</p>
                  ) : null}
                  {block.notes ? <p className="mt-1 text-[11px] text-text-muted">{block.notes}</p> : null}
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>

      {isManager ? (
        <div className="flex shrink-0 flex-wrap gap-2 border-t border-border-default px-5 py-4">
          <button
            type="button"
            onClick={onReassign}
            disabled={assignedTasks.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-4 py-2 text-xs font-bold uppercase text-white hover:bg-brand-blue-hover disabled:opacity-50"
          >
            <ClipboardList className="size-3.5" aria-hidden />
            Reassign work
          </button>
          <button
            type="button"
            onClick={onBlockAvailability}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-default px-4 py-2 text-xs font-semibold uppercase text-text-secondary hover:bg-surface-muted"
          >
            <Calendar className="size-3.5" aria-hidden />
            Block dates
          </button>
          <button
            type="button"
            onClick={() => navigate(`/tasks?assignee=${encodeURIComponent(user.name)}`)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-default px-4 py-2 text-xs font-semibold uppercase text-text-secondary hover:bg-surface-muted"
          >
            View tasks
          </button>
        </div>
      ) : (
        <div className="shrink-0 border-t border-border-default px-5 py-4">
          <button
            type="button"
            onClick={() => navigate(`/tasks?assignee=${encodeURIComponent(user.name)}`)}
            className="w-full rounded-full border border-border-default py-2 text-xs font-semibold uppercase text-text-secondary hover:bg-surface-muted"
          >
            View my tasks
          </button>
        </div>
      )}
    </div>
  );
}
