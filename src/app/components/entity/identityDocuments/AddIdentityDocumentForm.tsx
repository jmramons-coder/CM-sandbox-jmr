import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import type {
  IdentityDocumentDraft,
  IdentityDocumentFieldErrors,
} from '../../../domain/identityDocuments';
import { partyContextFromEntityRef } from '../../../domain/identityDocuments';
import {
  createDocument,
  findDuplicateDocument,
} from '../../../data/identityDocumentsRepository';
import { setTenantIdentityDocumentTypes } from '../../../data/identityDocumentTypes';
import { usePlatformSettings } from '../../../contexts/PlatformSettingsContext';
import { useTranslatedEntityFolder } from '../../../data/useFolders';
import {
  createEmptyIdentityDocumentDraft,
  hasValidationErrors,
  validateIdentityDocumentDraft,
} from '../../../utils/identityDocumentValidation';
import { SubFolderFormShell } from '../SubFolderFormShell';
import { IdentityDocumentAddPanel } from './IdentityDocumentAddPanel';
import { IdentityDocumentDuplicateDialog } from './IdentityDocumentDuplicateDialog';
import { identityDocumentsEntityPath } from './identityDocumentPaths';

const SANDBOX_USER_ID = 'sandbox-user';

export function AddIdentityDocumentForm() {
  const { t } = useTranslation('folders');
  const navigate = useNavigate();
  const params = useParams();
  const { settings } = usePlatformSettings();
  const entityId = params.nestedId ?? params.childId ?? params.folderId ?? '';
  const entity = useTranslatedEntityFolder(entityId);
  const entityName = entity?.header.title ?? entityId;
  const partyKind = (entity?.type ?? 'client') as 'client' | 'agent' | 'participant';

  const [drafts, setDrafts] = useState<IdentityDocumentDraft[]>(() => [
    createEmptyIdentityDocumentDraft(),
  ]);
  const [errorsByDraftId, setErrorsByDraftId] = useState<
    Record<string, IdentityDocumentFieldErrors>
  >({});
  const [duplicatePending, setDuplicatePending] = useState<IdentityDocumentDraft[] | null>(null);

  const returnPath = useMemo(() => identityDocumentsEntityPath(params), [params]);

  useEffect(() => {
    const types = settings.preferences.identityDocuments?.documentTypes;
    if (types?.length) setTenantIdentityDocumentTypes(types);
  }, [settings.preferences.identityDocuments?.documentTypes]);

  const persistDrafts = (toSave: IdentityDocumentDraft[]) => {
    const party = partyContextFromEntityRef(entityId, partyKind, entityName);
    toSave.forEach((draft) => {
      createDocument(party.partyId, draft, SANDBOX_USER_ID);
    });
    navigate(returnPath);
  };

  const handleSave = () => {
    const party = partyContextFromEntityRef(entityId, partyKind, entityName);
    const nextErrors: Record<string, IdentityDocumentFieldErrors> = {};
    let hasError = false;
    drafts.forEach((draft) => {
      const errors = validateIdentityDocumentDraft(draft);
      if (hasValidationErrors(errors)) {
        hasError = true;
        nextErrors[draft.id] = errors;
      }
    });
    setErrorsByDraftId(nextErrors);
    if (hasError) return;

    const duplicate = drafts.find((draft) =>
      findDuplicateDocument(
        party.partyId,
        draft.documentType,
        draft.issuingJurisdiction,
        draft.documentNumber,
      ),
    );
    if (duplicate) {
      setDuplicatePending(drafts);
      return;
    }
    persistDrafts(drafts);
  };

  return (
    <>
      <SubFolderFormShell
        title={t('entity.identityDocuments.addTitle', { defaultValue: 'Add identity documents' })}
        onCancel={() => navigate(returnPath)}
        onSubmit={handleSave}
        submitLabel={t('entity.identityDocuments.save', { defaultValue: 'Save' })}
        cancelLabel={t('entity.identityDocuments.cancel', { defaultValue: 'Cancel' })}
      >
        <p className="mb-5 text-sm text-text-primary">
          {t('entity.identityDocuments.addDescription', {
            name: entityName,
            defaultValue: `Add one or more identity documents for ${entityName}.`,
          })}
        </p>
        <IdentityDocumentAddPanel
          drafts={drafts}
          errorsByDraftId={errorsByDraftId}
          onUpdateDraft={(id, patch) =>
            setDrafts((current) =>
              current.map((d) => (d.id === id ? { ...d, ...patch } : d)),
            )
          }
          onRemoveDraft={(id) =>
            setDrafts((current) =>
              current.length <= 1 ? current : current.filter((d) => d.id !== id),
            )
          }
          onAddDraft={() =>
            setDrafts((current) => [...current, createEmptyIdentityDocumentDraft()])
          }
        />
      </SubFolderFormShell>
      <IdentityDocumentDuplicateDialog
        open={duplicatePending !== null}
        onOpenChange={(open) => !open && setDuplicatePending(null)}
        onProceed={() => {
          if (duplicatePending) persistDrafts(duplicatePending);
          setDuplicatePending(null);
        }}
      />
    </>
  );
}
