import { useEffect, useMemo } from 'react';
import { markDashboardIntroMotionPlayed, prefersReducedMotion } from './dashboard/dashboardMotion';
import { useActiveUser } from '../contexts/ActiveUserContext';
import { useDataSourceSettings } from '../contexts/PlatformSettingsContext';
import { filterDatasetBySettings, getSystemDataset } from '../data/objectRepository';
import { getDashboardViewModel } from '../data/dashboardRoleProjection';
import { DashboardActivityPanel } from './dashboard/DashboardActivityPanel';
import { DashboardAiBrief } from './dashboard/DashboardAiBrief';
import { DashboardCaseHealthPanel } from './dashboard/DashboardCaseHealthPanel';
import { DashboardFocusCard } from './dashboard/DashboardFocusCard';
import { DashboardHeroSection } from './dashboard/DashboardHeroSection';
import { DashboardProgressPanel } from './dashboard/DashboardProgressPanel';
import { DashboardAiHealthPanel, DashboardTeamVelocityPanel } from './dashboard/DashboardTeamPanels';

export function Dashboard() {
  const { roleView } = useActiveUser();
  const dataSource = useDataSourceSettings();
  const activeDataset = useMemo(
    () => filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource),
    [dataSource],
  );
  const dashboardViewModel = useMemo(
    () => getDashboardViewModel(roleView, activeDataset),
    [activeDataset, roleView],
  );
  const isManager = roleView === 'manager';

  useEffect(() => {
    if (prefersReducedMotion()) {
      markDashboardIntroMotionPlayed();
      return;
    }
    const timer = window.setTimeout(markDashboardIntroMotionPlayed, 800);
    return () => {
      window.clearTimeout(timer);
      markDashboardIntroMotionPlayed();
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-x-hidden overflow-y-auto bg-surface-primary">
      <div className="mx-auto w-full min-w-0 max-w-[1100px] space-y-3 px-4 pb-6 pt-18 sm:space-y-4 sm:px-6 sm:pb-8 sm:pt-24 lg:space-y-4 lg:px-8 lg:pb-8">
        <DashboardAiBrief viewModel={dashboardViewModel} />
        <DashboardHeroSection viewModel={dashboardViewModel} />

        <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            <DashboardFocusCard viewModel={dashboardViewModel} />
            <DashboardCaseHealthPanel viewModel={dashboardViewModel} />
            {isManager ? <DashboardProgressPanel viewModel={dashboardViewModel} /> : null}
          </div>

          <div className="space-y-3">
            {!isManager ? <DashboardProgressPanel viewModel={dashboardViewModel} /> : null}
            {isManager ? <DashboardTeamVelocityPanel viewModel={dashboardViewModel} /> : null}
            {isManager ? <DashboardAiHealthPanel viewModel={dashboardViewModel} /> : null}
            <DashboardActivityPanel viewModel={dashboardViewModel} />
          </div>
        </div>
      </div>
    </div>
  );
}
