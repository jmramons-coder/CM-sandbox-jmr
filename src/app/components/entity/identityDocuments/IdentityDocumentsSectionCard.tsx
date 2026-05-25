import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { PartyContext } from '../../../domain/identityDocuments';
import {
  listActiveDocuments,
  softDeleteDocument,
} from '../../../data/identityDocumentsRepository';
import { setTenantIdentityDocumentTypes } from '../../../data/identityDocumentTypes';
import { usePlatformSettings } from '../../../contexts/PlatformSettingsContext';
import {
  useIdentityDocumentPermissions,
  useIdentityDocumentUnmaskTimeoutMs,
} from '../../../hooks/useIdentityDocumentPermissions';
import { EntitySectionCard } from '../EntitySectionCard';
import { IdentityDocumentDeleteDialog } from './IdentityDocumentDeleteDialog';
import { IdentityDocumentsTable } from './IdentityDocumentsTable';
import {
  identityDocumentEditPath,
  identityDocumentsAddPath,
} from './identityDocumentPaths';

const SANDBOX_USER_ID = 'sandbox-user';

type IdentityDocumentsSectionCardProps = {
  party: PartyContext;
  title?: string;
};

export function IdentityDocumentsSectionCard({
  party,
  title = 'IDENTITY DOCUMENTS',
}: IdentityDocumentsSectionCardProps) {
  const { t } = useTranslation('folders');
  const navigate = useNavigate();
  const params = useParams();
  const { settings } = usePlatformSettings();
  const permissions = useIdentityDocumentPermissions();
  const unmaskTimeoutMs = useIdentityDocumentUnmaskTimeoutMs();

  const [refreshKey, setRefreshKey] = useState(0);
  const [unmaskedIds, setUnmaskedIds] = useState<Set<string>>(new Set());
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    const types = settings.preferences.identityDocuments?.documentTypes;
    if (types?.length) setTenantIdentityDocumentTypes(types);
  }, [settings.preferences.identityDocuments?.documentTypes]);

  const documents = useMemo(() => {
    if (!party?.partyId) return [];
    return listActiveDocuments(party.partyId);
  }, [party?.partyId, refreshKey]);

  const bump = useCallback(() => setRefreshKey((k) => k + 1), []);

  const emptyMessage = t('entity.identityDocuments.empty', {
    name: party.displayName,
    defaultValue: `There are no identity documents associated to ${party.displayName}.`,
  });

  const goToAdd = () => navigate(identityDocumentsAddPath(params));
  const goToEdit = (documentId: string) =>
    navigate(identityDocumentEditPath(params, documentId));

  const handleUnmaskChange = (documentId: string, unmasked: boolean) => {
    setUnmaskedIds((prev) => {
      const next = new Set(prev);
      if (unmasked) next.add(documentId);
      else next.delete(documentId);
      return next;
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    softDeleteDocument(party.partyId, deleteTargetId, SANDBOX_USER_ID);
    setUnmaskedIds((prev) => {
      const next = new Set(prev);
      next.delete(deleteTargetId);
      return next;
    });
    bump();
    setDeleteTargetId(null);
  };

  const addAction = permissions.canCreate
    ? [{ id: 'add', label: 'ADD', icon: 'add' as const }]
    : undefined;

  const showEmptyState = documents.length === 0;

  return (
    <>
      <EntitySectionCard
        title={title}
        actions={addAction}
        onActionClick={(actionId) => {
          if (actionId === 'add') goToAdd();
        }}
        showKebab={false}
        bodyClassName="px-0 pb-0 pt-0"
      >
        {showEmptyState ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-10 text-center">
            <p className="max-w-md whitespace-pre-line text-[12px] leading-[18px] text-text-secondary">
              {emptyMessage}
            </p>
            {permissions.canCreate ? (
              <button
                type="button"
                onClick={goToAdd}
                className="inline-flex h-7 items-center gap-2 rounded px-2 text-[11px] font-bold uppercase tracking-[0.4px] text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
              >
                <Plus className="size-4 shrink-0" strokeWidth={2} />
                <span className="leading-none">ADD</span>
              </button>
            ) : null}
          </div>
        ) : (
          <IdentityDocumentsTable
            documents={documents}
            partyId={party.partyId}
            permissions={permissions}
            unmaskTimeoutMs={unmaskTimeoutMs}
            userId={SANDBOX_USER_ID}
            unmaskedIds={unmaskedIds}
            onUnmaskChange={handleUnmaskChange}
            onEdit={goToEdit}
            onDelete={setDeleteTargetId}
          />
        )}
      </EntitySectionCard>

      <IdentityDocumentDeleteDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
