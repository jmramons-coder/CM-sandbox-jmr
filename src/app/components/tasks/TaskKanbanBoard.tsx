import { Lock, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import { LozengeTag } from '../index';
import { PriorityChip } from '../ds';
import { getStatusLozengeType } from '../../utils/status-display';
import { groupTasksByKanbanColumn, TASK_KANBAN_COLUMNS, type TaskKanbanColumnId } from '../../utils/task-kanban';
import { TABLE_LINK_CLASS } from '../ModuleCellHelpers';
import type { Task, TaskTabType } from '../../types';

type TaskKanbanBoardProps = {
  tasks: Task[];
  selectedTaskId?: string;
  activeTab: TaskTabType;
  isOnTeamTasks: boolean;
  isOnMyTasks: boolean;
  onSelectTask: (task: Task) => void;
  onPickUp?: (task: Task, e: React.MouseEvent) => void;
  onRelease?: (task: Task, e: React.MouseEvent) => void;
  isRestricted: (task: Task) => boolean;
};

function TaskKanbanCard({
  task,
  selected,
  locked,
  restricted,
  isOnTeamTasks,
  isOnMyTasks,
  activeTab,
  onSelect,
  onPickUp,
  onRelease,
}: {
  task: Task;
  selected: boolean;
  locked: boolean;
  restricted: boolean;
  isOnTeamTasks: boolean;
  isOnMyTasks: boolean;
  activeTab: TaskTabType;
  onSelect: () => void;
  onPickUp?: (e: React.MouseEvent) => void;
  onRelease?: (e: React.MouseEvent) => void;
}) {
  const navigate = useNavigate();
  const showPickUp = isOnTeamTasks && !task.pickedUpBy && !restricted && onPickUp;
  const showRelease =
    (isOnMyTasks || activeTab === 'all_tasks') && Boolean(task.teamOrigin) && onRelease;

  return (
    <article
      data-keep-sidepanel="kanban-card"
      onClick={() => {
        if (!restricted) onSelect();
      }}
      className={`group relative flex flex-col rounded-lg border bg-white p-3 text-left shadow-[0_1px_2px_rgba(27,28,30,0.06)] transition-all ${
        restricted
          ? 'cursor-not-allowed border-border-default opacity-55'
          : locked
            ? 'cursor-pointer border-border-default bg-surface-hover'
            : selected
              ? 'cursor-pointer border-brand-blue ring-2 ring-brand-blue/15'
              : 'cursor-pointer border-border-default hover:border-brand-blue/35 hover:shadow-[0_4px_14px_rgba(27,28,30,0.08)]'
      }`}
    >
      {restricted ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70">
          <Lock className="size-4 text-text-muted" aria-hidden />
          <span className="sr-only">Requires authority level {task.requiredAuthorityLevel}</span>
        </div>
      ) : null}

      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <PriorityChip priority={task.priority} />
          {task.slaStatus === 'danger' ? (
            <span className="rounded-full bg-[#fde5e4] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#7a1d1a]">
              SLA
            </span>
          ) : null}
        </div>
        <LozengeTag label={task.status} type={getStatusLozengeType(task.status, 'task')} subtle />
      </div>

      <p className="text-[10px] font-medium text-text-muted">{task.taskId ?? task.id}</p>
      <h3 className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-snug text-text-primary">
        {task.taskType}
      </h3>

      {(task.description ?? task.aiSummary) ? (
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-text-secondary">
          {task.description ?? task.aiSummary}
        </p>
      ) : null}

      <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-text-muted">
        {task.caseId ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/cases/${task.caseId}`);
            }}
            className={`${TABLE_LINK_CLASS} text-[10px]`}
          >
            {task.caseId}
          </button>
        ) : null}
        {task.assignedTo ? <span className="truncate">· {task.assignedTo}</span> : null}
      </div>

      {isOnMyTasks && task.teamOrigin ? (
        <p className="mt-2 inline-flex items-center gap-1 text-[10px] text-text-muted">
          <Users className="size-3 shrink-0" aria-hidden />
          {task.teamOrigin}
        </p>
      ) : null}

      {locked ? (
        <p className="mt-2 flex items-center gap-1 text-[10px] text-text-muted">
          <Lock className="size-3" aria-hidden />
          {task.pickedUpBy}
        </p>
      ) : null}

      {(showPickUp || showRelease) && (
        <div className="mt-3 flex gap-1.5 border-t border-border-soft pt-2">
          {showPickUp ? (
            <button
              type="button"
              onClick={onPickUp}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-brand-blue px-2 py-1 text-[10px] font-semibold text-white hover:bg-brand-blue-hover"
            >
              Pick up
            </button>
          ) : null}
          {showRelease ? (
            <button
              type="button"
              onClick={onRelease}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-border-default px-2 py-1 text-[10px] font-semibold text-text-secondary hover:bg-surface-muted"
            >
              Release
            </button>
          ) : null}
        </div>
      )}
    </article>
  );
}

export function TaskKanbanBoard({
  tasks,
  selectedTaskId,
  activeTab,
  isOnTeamTasks,
  isOnMyTasks,
  onSelectTask,
  onPickUp,
  onRelease,
  isRestricted,
}: TaskKanbanBoardProps) {
  const grouped = groupTasksByKanbanColumn(tasks);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#f4f5f7]">
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex h-full min-h-[420px] min-w-max items-stretch gap-3">
          {TASK_KANBAN_COLUMNS.map((column) => {
            const columnTasks = grouped[column.id as TaskKanbanColumnId];
            return (
              <section
                key={column.id}
                className="flex h-full min-h-[380px] w-[min(100%,280px)] min-w-[260px] max-w-[320px] shrink-0 flex-col rounded-lg border border-border-default/80 bg-[#eceef1]"
                aria-label={`${column.label} column`}
              >
                <header className="flex items-start justify-between gap-2 border-b border-border-default/60 px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 shrink-0 rounded-full ${column.accentClass}`} aria-hidden />
                      <h2 className="text-[12px] font-semibold text-text-primary">{column.label}</h2>
                    </div>
                    <p className="mt-0.5 pl-4 text-[10px] text-text-muted">{column.hint}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold tabular-nums text-text-secondary shadow-sm">
                    {columnTasks.length}
                  </span>
                </header>

                <div className="app-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
                  {columnTasks.length === 0 ? (
                    <p className="rounded-md border border-dashed border-border-default bg-white/60 px-3 py-6 text-center text-[11px] text-text-muted">
                      No tasks
                    </p>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskKanbanCard
                        key={task.id}
                        task={task}
                        selected={selectedTaskId === task.id}
                        locked={isOnTeamTasks && Boolean(task.pickedUpBy)}
                        restricted={isOnTeamTasks && !task.pickedUpBy && isRestricted(task)}
                        isOnTeamTasks={isOnTeamTasks}
                        isOnMyTasks={isOnMyTasks}
                        activeTab={activeTab}
                        onSelect={() => onSelectTask(task)}
                        onPickUp={onPickUp ? (e) => onPickUp(task, e) : undefined}
                        onRelease={onRelease ? (e) => onRelease(task, e) : undefined}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
