import { createBrowserRouter, Navigate, useLocation } from "react-router";
import { Layout } from "./components/Layout";
import { TaskModule } from "./components/TaskModule";
import { UsersModule } from "./components/UsersModule";
import { CaseView } from "./components/CaseView";
import { Dashboard } from "./components/Dashboard";
import { CasesModule } from "./components/CasesModule";
import { CasesWorkspace } from "./components/CasesWorkspace";
import { DocumentModule } from "./components/DocumentModule";
import { RequestsModule } from "./components/RequestsModule";
import { AiActionsModule } from "./components/AiActionsModule";
import { CreateRequestForm } from "./components/requests/CreateRequestForm";
import { DocumentationSpecPanel } from "./components/DocumentationSpecPanel";
import { ComingSoonModule } from "./components/ComingSoonModule";
import { FoldersWorkspace } from "./components/FoldersWorkspace";
import { FoldersModule } from "./components/FoldersModule";
import {
  AddIdentityDocumentForm,
  AddParticipantForm,
  AddRelationshipForm,
  EditIdentityDocumentForm,
  EntityFolderOverview,
  EntitySubFolderListView,
  FolderRouter,
  IpOrEntitySubRouter,
} from "./components/entity";
import { CopilotFullPage } from "./components/CopilotFullPage";
import { EAppWorkspace } from "./components/eapp/EAppWorkspace";
import { EAppDashboard } from "./components/eapp/EAppDashboard";
import { EAppForm } from "./components/eapp/EAppForm";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";

function LegacyUsersRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/team${search}`} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      { index: true, element: <Navigate to="/home" replace />, ErrorBoundary: RouteErrorBoundary },
      { path: "tasks", Component: TaskModule, ErrorBoundary: RouteErrorBoundary },
      { path: "team", Component: UsersModule, ErrorBoundary: RouteErrorBoundary },
      { path: "users", Component: LegacyUsersRedirect, ErrorBoundary: RouteErrorBoundary },
      { path: "home", Component: Dashboard, ErrorBoundary: RouteErrorBoundary },
      { path: "dashboard", Component: Dashboard, ErrorBoundary: RouteErrorBoundary },
      { path: "finances", element: <ComingSoonModule moduleId="finances" />, ErrorBoundary: RouteErrorBoundary },
      { path: "requests", Component: RequestsModule, ErrorBoundary: RouteErrorBoundary },
      { path: "requests/new", Component: CreateRequestForm, ErrorBoundary: RouteErrorBoundary },
      { path: "documents", Component: DocumentModule, ErrorBoundary: RouteErrorBoundary },
      { path: "ai-actions", Component: AiActionsModule, ErrorBoundary: RouteErrorBoundary },
      { path: "insights", element: <ComingSoonModule moduleId="insights" />, ErrorBoundary: RouteErrorBoundary },
      { path: "reports", element: <ComingSoonModule moduleId="reports" />, ErrorBoundary: RouteErrorBoundary },
      { path: "documentation", Component: DocumentationSpecPanel, ErrorBoundary: RouteErrorBoundary },
      { path: "copilot", Component: CopilotFullPage, ErrorBoundary: RouteErrorBoundary },
      {
        path: "cases",
        Component: CasesWorkspace,
        ErrorBoundary: RouteErrorBoundary,
        children: [
          { index: true, Component: CasesModule, ErrorBoundary: RouteErrorBoundary },
          { path: ":caseId", Component: CaseView, ErrorBoundary: RouteErrorBoundary },
        ],
      },
      {
        path: "folders",
        Component: FoldersWorkspace,
        ErrorBoundary: RouteErrorBoundary,
        children: [
          { index: true, Component: FoldersModule, ErrorBoundary: RouteErrorBoundary },
          { path: ":folderId", Component: FolderRouter, ErrorBoundary: RouteErrorBoundary },
          /* IP keeps using :folderId/:subCaseId; entity sub-folders share the
           * same slot via IpOrEntitySubRouter. */
          { path: ":folderId/relationship/add", Component: AddRelationshipForm, ErrorBoundary: RouteErrorBoundary },
          { path: ":folderId/identity-documents/add", Component: AddIdentityDocumentForm, ErrorBoundary: RouteErrorBoundary },
          { path: ":folderId/identity-documents/:documentId/edit", Component: EditIdentityDocumentForm, ErrorBoundary: RouteErrorBoundary },
          { path: ":folderId/:childType/add", Component: AddParticipantForm, ErrorBoundary: RouteErrorBoundary },
          { path: ":folderId/:childType", Component: IpOrEntitySubRouter, ErrorBoundary: RouteErrorBoundary },
          { path: ":folderId/:childType/:childId", Component: EntityFolderOverview, ErrorBoundary: RouteErrorBoundary },
          { path: ":folderId/:childType/:childId/relationship/add", Component: AddRelationshipForm, ErrorBoundary: RouteErrorBoundary },
          { path: ":folderId/:childType/:childId/identity-documents/add", Component: AddIdentityDocumentForm, ErrorBoundary: RouteErrorBoundary },
          { path: ":folderId/:childType/:childId/identity-documents/:documentId/edit", Component: EditIdentityDocumentForm, ErrorBoundary: RouteErrorBoundary },
          { path: ":folderId/:childType/:childId/:nestedType/add", Component: AddParticipantForm, ErrorBoundary: RouteErrorBoundary },
          { path: ":folderId/:childType/:childId/:nestedType", Component: EntitySubFolderListView, ErrorBoundary: RouteErrorBoundary },
          { path: ":folderId/:childType/:childId/:nestedType/:nestedId", Component: EntityFolderOverview, ErrorBoundary: RouteErrorBoundary },
          { path: ":folderId/:childType/:childId/:nestedType/:nestedId/relationship/add", Component: AddRelationshipForm, ErrorBoundary: RouteErrorBoundary },
          { path: ":folderId/:childType/:childId/:nestedType/:nestedId/identity-documents/add", Component: AddIdentityDocumentForm, ErrorBoundary: RouteErrorBoundary },
          { path: ":folderId/:childType/:childId/:nestedType/:nestedId/identity-documents/:documentId/edit", Component: EditIdentityDocumentForm, ErrorBoundary: RouteErrorBoundary },
        ],
      },
      {
        path: "eapp",
        Component: EAppWorkspace,
        ErrorBoundary: RouteErrorBoundary,
        children: [
          { index: true, Component: EAppDashboard, ErrorBoundary: RouteErrorBoundary },
          { path: ":appId", Component: EAppForm, ErrorBoundary: RouteErrorBoundary },
        ],
      },
    ],
  },
]);
