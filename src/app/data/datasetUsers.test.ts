import { describe, expect, it } from 'vitest';
import { getDashboardViewModel } from './dashboardRoleProjection';
import { hydrateDatasetUsers, listDatasetPlatformUsers } from './datasetUsers';
import { datasetRegistry } from './datasetRegistry';
import {
  buildDashboardVelocityRows,
  buildUserDirectoryRows,
  dashboardVelocityTagFromRow,
} from './userWorkloadProjection';

describe('dataset users', () => {
  it('hydrates users and links task assigneeId to roster ids', () => {
    const dataset = hydrateDatasetUsers(datasetRegistry.getDataset('multi-case-demo'));
    expect(dataset.users?.length).toBeGreaterThan(0);

    const victor = listDatasetPlatformUsers(dataset).find((user) => user.name === 'Victor Ramon');
    expect(victor).toBeDefined();

    const victorTasks = dataset.tasks.filter(
      (task) => task.assigneeKind === 'user' && task.assignee === 'Victor Ramon',
    );
    expect(victorTasks.length).toBeGreaterThan(0);
    victorTasks.forEach((task) => {
      expect(task.assigneeId).toBe(victor!.id);
    });
  });

  it('keeps dashboard velocity task counts aligned with Team module rows', () => {
    const dataset = datasetRegistry.getDataset('multi-case-demo');
    const sarah = listDatasetPlatformUsers(dataset).find((user) => user.name === 'Sarah Mitchell');
    const velocity = buildDashboardVelocityRows(dataset, { managerTeamIds: sarah?.teamIds });
    const directory = buildUserDirectoryRows(dataset, dataset.id);

    velocity.forEach((row) => {
      const match = directory.find((user) => user.name === row.name);
      expect(match).toBeDefined();
      expect(row.tasks).toBe(match!.workload.openTasks);
      expect(row.overdue).toBe(match!.workload.overdueTasks);
    });
  });

  it('limits dashboard velocity to a short highlight list with actionable tags', () => {
    const dataset = datasetRegistry.getDataset('multi-case-demo');
    const sarah = listDatasetPlatformUsers(dataset).find((user) => user.name === 'Sarah Mitchell');
    const velocity = buildDashboardVelocityRows(dataset, { managerTeamIds: sarah?.teamIds });
    const directory = buildUserDirectoryRows(dataset, dataset.id).filter(
      (row) => row.role === 'assessor' || row.role === 'senior_assessor',
    );

    expect(velocity.length).toBeLessThanOrEqual(3);
    expect(velocity.length).toBeGreaterThan(0);
    velocity.forEach((row) => {
      expect(row.trendLabel).not.toBe('Available');
      expect(row.capacityPct).toBeGreaterThanOrEqual(0);
    });

    const tagged = directory.map((row) => dashboardVelocityTagFromRow(row).trendLabel);
    expect(tagged.some((label) => label.includes('overdue') || label.includes('capacity') || label.includes('clearing'))).toBe(
      true,
    );
  });

  it('projects manager dashboard velocity from the dataset', () => {
    const dataset = datasetRegistry.getDataset('multi-case-demo');
    const viewModel = getDashboardViewModel('manager', dataset);
    const victorVelocity = viewModel.velocity.find((row) => row.name === 'Victor Ramon');
    const victorRow = buildUserDirectoryRows(dataset, dataset.id).find((row) => row.name === 'Victor Ramon');

    expect(victorVelocity).toBeDefined();
    expect(victorRow).toBeDefined();
    expect(victorVelocity!.tasks).toBe(victorRow!.workload.openTasks);
  });
});
