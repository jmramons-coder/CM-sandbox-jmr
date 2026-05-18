import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { getFolderOverview } from '../data/mock-folders';
import { useTranslatedFolder } from '../data/useFolders';
import { useFoldersNav } from '../contexts/FoldersNavContext';
import { CaseView } from './CaseView';

export function FolderCaseView() {
  /* Routes pass either `:subCaseId` (legacy) or `:childType` (post-entity-merge);
   * the latter slot is shared with entity-folder navigation so its name is generic. */
  const { folderId = '', subCaseId, childType } = useParams();
  const segment = subCaseId ?? childType ?? '';
  const { t } = useTranslation('folders');
  const navigate = useNavigate();
  const { addOpenFolder } = useFoldersNav();

  useEffect(() => {
    if (folderId) addOpenFolder(folderId);
  }, [folderId, addOpenFolder]);

  const folder = useTranslatedFolder(folderId);
  const subCase = folder?.subCases.find((sc) => sc.id === segment);
  const data = useMemo(() => getFolderOverview(folderId, segment), [folderId, segment]);

  if (!folder || !subCase || !data) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-muted">
        {t('folderCaseView.notFound')}
      </div>
    );
  }

  const breadcrumb = (
    <>
      <Link to="/folders" className="hover:text-[#60666e]">{t('folderCaseView.breadcrumbRoot')}</Link>
      <span className="mx-1">›</span>
      <button onClick={() => navigate(`/folders/${folderId}`)} className="hover:text-[#60666e]">
        {folderId} {folder.claimant}
      </button>
      <span className="mx-1">›</span>
      <span>{subCase.label}</span>
    </>
  );

  return (
    <CaseView
      dataOverride={data}
      singlePhase={subCase.phase}
      breadcrumb={breadcrumb}
    />
  );
}
