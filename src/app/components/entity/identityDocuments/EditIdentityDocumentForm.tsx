import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { partyContextFromEntityRef } from '../../../domain/identityDocuments';
import {
  getDocumentById,
  updateAdditionalInfo,
} from '../../../data/identityDocumentsRepository';
import { useTranslatedEntityFolder } from '../../../data/useFolders';
import { SubFolderFormShell } from '../SubFolderFormShell';
import { IdentityDocumentEditPanel } from './IdentityDocumentEditPanel';
import { identityDocumentsEntityPath } from './identityDocumentPaths';

const SANDBOX_USER_ID = 'sandbox-user';

export function EditIdentityDocumentForm() {
  const { t } = useTranslation('folders');
  const navigate = useNavigate();
  const params = useParams();
  const documentId = params.documentId ?? '';
  const entityId = params.nestedId ?? params.childId ?? params.folderId ?? '';
  const entity = useTranslatedEntityFolder(entityId);
  const entityName = entity?.header.title ?? entityId;
  const partyKind = (entity?.type ?? 'client') as 'client' | 'agent' | 'participant';

  const returnPath = useMemo(() => identityDocumentsEntityPath(params), [params]);
  const party = partyContextFromEntityRef(entityId, partyKind, entityName);
  const record = getDocumentById(party.partyId, documentId);

  const [additionalInformation, setAdditionalInformation] = useState(
    () => record?.additionalInformation ?? '',
  );

  if (!record) {
    return <Navigate to={returnPath} replace />;
  }

  const handleSave = () => {
    updateAdditionalInfo(party.partyId, documentId, additionalInformation, SANDBOX_USER_ID);
    navigate(returnPath);
  };

  return (
    <SubFolderFormShell
      title={t('entity.identityDocuments.editTitle', { defaultValue: 'Edit identity document' })}
      onCancel={() => navigate(returnPath)}
      onSubmit={handleSave}
      submitLabel={t('entity.identityDocuments.save', { defaultValue: 'Save' })}
      cancelLabel={t('entity.identityDocuments.cancel', { defaultValue: 'Cancel' })}
    >
      <p className="mb-5 text-sm text-text-primary">
        {t('entity.identityDocuments.editDescription', {
          name: entityName,
          defaultValue: `Update additional information for ${entityName}.`,
        })}
      </p>
      <IdentityDocumentEditPanel
        record={record}
        additionalInformation={additionalInformation}
        onAdditionalInformationChange={setAdditionalInformation}
      />
    </SubFolderFormShell>
  );
}
