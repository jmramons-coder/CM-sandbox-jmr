import { Plus, Trash2 } from 'lucide-react';
import type { IdentityDocumentDraft, IdentityDocumentFieldErrors } from '../../../domain/identityDocuments';
import { getIdentityDocumentTypes } from '../../../data/identityDocumentTypes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Input } from '../../ui/input';
import { JurisdictionCombobox } from './JurisdictionCombobox';
import {
  IdentityDocumentFormField,
  IDENTITY_DOCUMENT_DRAFT_CARD,
  IDENTITY_DOCUMENT_FORM_GRID,
} from './IdentityDocumentFormField';

type IdentityDocumentAddPanelProps = {
  drafts: IdentityDocumentDraft[];
  errorsByDraftId: Record<string, IdentityDocumentFieldErrors>;
  onUpdateDraft: (id: string, patch: Partial<IdentityDocumentDraft>) => void;
  onRemoveDraft: (id: string) => void;
  onAddDraft: () => void;
};

export function IdentityDocumentAddPanel({
  drafts,
  errorsByDraftId,
  onUpdateDraft,
  onRemoveDraft,
  onAddDraft,
}: IdentityDocumentAddPanelProps) {
  const documentTypes = getIdentityDocumentTypes();

  return (
    <div className="space-y-4">
      {drafts.map((draft) => {
        const errors = errorsByDraftId[draft.id] ?? {};
        return (
          <div key={draft.id} className={IDENTITY_DOCUMENT_DRAFT_CARD}>
            <button
              type="button"
              onClick={() => onRemoveDraft(draft.id)}
              disabled={drafts.length <= 1}
              className="absolute right-3 top-3 rounded p-1.5 text-text-secondary hover:bg-surface-muted hover:text-red-600 disabled:opacity-30"
              aria-label="Remove document"
            >
              <Trash2 className="size-4" />
            </button>

            <div className={IDENTITY_DOCUMENT_FORM_GRID}>
              <IdentityDocumentFormField label="Document type" error={errors.documentType}>
                <Select
                  value={draft.documentType || undefined}
                  onValueChange={(v) => onUpdateDraft(draft.id, { documentType: v })}
                >
                  <SelectTrigger
                    className={`h-9 w-full text-[13px] ${errors.documentType ? 'border-red-500' : ''}`}
                  >
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </IdentityDocumentFormField>

              <IdentityDocumentFormField
                label="Issuing jurisdiction"
                error={errors.issuingJurisdiction}
              >
                <JurisdictionCombobox
                  value={draft.issuingJurisdiction}
                  onChange={(v) => onUpdateDraft(draft.id, { issuingJurisdiction: v })}
                  showError={false}
                  error={errors.issuingJurisdiction}
                />
              </IdentityDocumentFormField>

              <IdentityDocumentFormField label="Document #" error={errors.documentNumber}>
                <Input
                  value={draft.documentNumber}
                  placeholder="Type #"
                  onChange={(e) => onUpdateDraft(draft.id, { documentNumber: e.target.value })}
                  className={`h-9 w-full text-[13px] ${errors.documentNumber ? 'border-red-500' : ''}`}
                />
              </IdentityDocumentFormField>

              <IdentityDocumentFormField label="Issue date" error={errors.issueDate}>
                <Input
                  type="date"
                  value={draft.issueDate}
                  onChange={(e) => onUpdateDraft(draft.id, { issueDate: e.target.value })}
                  className={`h-9 w-full text-[13px] ${errors.issueDate ? 'border-red-500' : ''}`}
                />
              </IdentityDocumentFormField>

              <IdentityDocumentFormField label="Expiry date" error={errors.expiryDate}>
                <Input
                  type="date"
                  value={draft.expiryDate}
                  onChange={(e) => onUpdateDraft(draft.id, { expiryDate: e.target.value })}
                  className={`h-9 w-full text-[13px] ${errors.expiryDate ? 'border-red-500' : ''}`}
                />
              </IdentityDocumentFormField>

              <IdentityDocumentFormField
                label="Additional information"
                error={errors.additionalInformation}
              >
                <Input
                  value={draft.additionalInformation}
                  placeholder="Optional"
                  onChange={(e) =>
                    onUpdateDraft(draft.id, { additionalInformation: e.target.value })
                  }
                  className={`h-9 w-full text-[13px] ${
                    errors.additionalInformation ? 'border-red-500' : ''
                  }`}
                />
              </IdentityDocumentFormField>
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={onAddDraft}
        className="inline-flex items-center gap-1.5 rounded-full border border-brand-blue px-4 py-2 text-[12px] font-semibold text-brand-blue transition-colors hover:bg-brand-blue/5"
      >
        <Plus className="size-3.5" />
        Add document
      </button>
    </div>
  );
}
