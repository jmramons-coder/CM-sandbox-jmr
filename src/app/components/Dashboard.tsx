import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText } from 'lucide-react';
import { markDashboardIntroMotionPlayed, prefersReducedMotion } from './dashboard/dashboardMotion';
import { useActiveUser } from '../contexts/ActiveUserContext';
import { useDataSourceSettings } from '../contexts/PlatformSettingsContext';
import { filterDatasetBySettings, getSystemDataset } from '../data/objectRepository';
import { getDashboardViewModel } from '../data/dashboardRoleProjection';
import { getDocumentEvidence } from '../data/mock-document-evidence';
import { DashboardActivityPanel } from './dashboard/DashboardActivityPanel';
import { DashboardAiBrief } from './dashboard/DashboardAiBrief';
import { DashboardCaseHealthPanel } from './dashboard/DashboardCaseHealthPanel';
import { DashboardFocusCard } from './dashboard/DashboardFocusCard';
import { DashboardHeroSection } from './dashboard/DashboardHeroSection';
import { DashboardProgressPanel } from './dashboard/DashboardProgressPanel';
import { DashboardAiHealthPanel, DashboardTeamVelocityPanel } from './dashboard/DashboardTeamPanels';
import { DynamicDocumentSidePanel } from './DynamicDocumentSidePanel';
import { WorkspaceAssistantPanel } from './WorkspaceAssistantPanel';
import { WorkspaceObjectSidePanel } from './WorkspaceObjectSidePanel';
import { useMobileSidePanelLayout } from '../hooks/useMobileSidePanelLayout';
import { useViewportLayout } from '../hooks/useViewportLayout';
import { documentPanelContextId } from '../utils/workspacePanelContextUtils';
import { getDocumentSidePanelWidth, resolveDocumentSidePanelWidth } from '../utils/sidepanel-width';
import {
  LAYOUT_HEADER_HEIGHT_PX,
  MOBILE_SIDE_PANEL_SCRIM_Z_CLASS,
  MOBILE_SIDE_PANEL_Z_CLASS,
} from './WorkspaceSidePanelChrome';

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
  const { isCompactShell } = useViewportLayout();
  const [evidenceDocumentId, setEvidenceDocumentId] = useState<string | null>(null);
  const [panelWidth, setPanelWidth] = useState(() => getDocumentSidePanelWidth());
  const [isResizing, setIsResizing] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [activeInsightId, setActiveInsightId] = useState('');
  const { workspaceRef } = useMobileSidePanelLayout(panelWidth, sidePanelOpen);
  const mobilePanelWidth = typeof window !== 'undefined' ? window.innerWidth : panelWidth;

  const evidenceDocument = useMemo(
    () => (evidenceDocumentId ? getDocumentEvidence(evidenceDocumentId, activeDataset) : null),
    [activeDataset, evidenceDocumentId],
  );

  useEffect(() => {
    setActiveInsightId(evidenceDocument?.evidence[0]?.id ?? '');
  }, [evidenceDocument?.documentId]);

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

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - event.clientX;
      const maxWidth = Math.round(window.innerWidth * 0.75);
      if (newWidth >= 400 && newWidth <= maxWidth) {
        setPanelWidth(newWidth);
      }
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

  const openEvidence = (documentId: string) => {
    setPanelWidth((current) => resolveDocumentSidePanelWidth(current));
    setEvidenceDocumentId(documentId);
    if (isCompactShell) setSidePanelOpen(true);
  };

  const closeEvidence = () => {
    setEvidenceDocumentId(null);
    setSidePanelOpen(false);
  };

  const showEvidencePanel = Boolean(evidenceDocument) && (!isCompactShell || sidePanelOpen);
  const evidencePanelContextId = evidenceDocument
    ? documentPanelContextId(evidenceDocument.documentId)
    : '';

  const evidencePanel = evidenceDocument ? (
    <WorkspaceObjectSidePanel
      portal={!isCompactShell}
      closeOnOutsideClick={!isCompactShell}
      showResizeHandle={!isCompactShell}
      zIndexClassName={isCompactShell ? 'z-[1110]' : 'z-[190]'}
      contexts={[
        {
          id: evidencePanelContextId,
          label: evidenceDocument.documentTitle,
          icon: FileText,
          clearable: true,
        },
      ]}
      activeContextId={evidencePanelContextId}
      onChangeContext={() => undefined}
      onClearContext={closeEvidence}
      onClose={closeEvidence}
      panelWidth={isCompactShell ? mobilePanelWidth : panelWidth}
      onPanelWidthChange={setPanelWidth}
      isResizing={isResizing}
      onResizeStart={() => setIsResizing(true)}
      assistantContent={
        <WorkspaceAssistantPanel contextId={`document:${evidenceDocument.documentId}`} />
      }
    >
      <DynamicDocumentSidePanel
        embedded
        open
        onOpenChange={(open) => {
          if (!open) closeEvidence();
        }}
        document={evidenceDocument}
        activeInsightId={activeInsightId}
        onInsightChange={setActiveInsightId}
        panelWidth={panelWidth}
        isResizing={false}
        onResizeStart={() => undefined}
      />
    </WorkspaceObjectSidePanel>
  ) : null;

  const mobileEvidencePanelPortal =
    isCompactShell && showEvidencePanel && typeof document !== 'undefined'
      ? createPortal(
          <>
            <button
              type="button"
              aria-label="Close document panel"
              className={`fixed inset-0 ${MOBILE_SIDE_PANEL_SCRIM_Z_CLASS} bg-black/20 lg:hidden`}
              onClick={closeEvidence}
            />
            <div
              className={`fixed inset-x-0 ${MOBILE_SIDE_PANEL_Z_CLASS} flex min-h-0 flex-col overflow-hidden bg-white lg:hidden`}
              style={{
                top: LAYOUT_HEADER_HEIGHT_PX,
                height: `calc(100dvh - ${LAYOUT_HEADER_HEIGHT_PX}px)`,
              }}
            >
              {evidencePanel}
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <div ref={workspaceRef} className="relative flex h-full min-h-0 flex-col overflow-hidden bg-surface-primary">
      {mobileEvidencePanelPortal}
      {!isCompactShell && showEvidencePanel ? evidencePanel : null}
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="mx-auto w-full min-w-0 max-w-[1100px] space-y-3 px-4 pb-6 pt-18 sm:space-y-4 sm:px-6 sm:pb-8 sm:pt-24 lg:space-y-4 lg:px-8 lg:pb-8">
          <DashboardAiBrief viewModel={dashboardViewModel} />
          <DashboardHeroSection viewModel={dashboardViewModel} />

          <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-3">
              <DashboardFocusCard viewModel={dashboardViewModel} onOpenEvidence={openEvidence} />
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
    </div>
  );
}
