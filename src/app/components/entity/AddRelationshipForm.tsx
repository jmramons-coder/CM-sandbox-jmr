import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  addEntityRelationships,
  RELATIONSHIP_CANDIDATES,
  RELATIONSHIP_FOLDER_TYPES,
  RELATIONSHIP_OPTIONS_BY_TYPE,
  type RelationshipFolderType,
} from '../../data/mock-entity-folders';
import { useTranslatedEntityFolder } from '../../data/useFolders';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { SubFolderFormShell } from './SubFolderFormShell';

type RelationshipDraft = {
  id: string;
  folderType: RelationshipFolderType | '';
  folderId: string;
  relationship: string;
  effectiveDate: string;
  expirationDate: string;
};

let draftCounter = 1;

function createDraft(): RelationshipDraft {
  return {
    id: `draft-${draftCounter++}`,
    folderType: '',
    folderId: '',
    relationship: '',
    effectiveDate: '',
    expirationDate: '',
  };
}

export function AddRelationshipForm() {
  const { t } = useTranslation('folders');
  const navigate = useNavigate();
  const params = useParams();
  const entityId = params.nestedId ?? params.childId ?? params.folderId ?? '';
  const entity = useTranslatedEntityFolder(entityId);
  const entityName = entity?.header.title ?? entityId;
  const [drafts, setDrafts] = useState<RelationshipDraft[]>(() => [createDraft()]);

  const relationshipTarget = useMemo(() => relationshipPath(params), [params]);

  const updateDraft = (id: string, patch: Partial<RelationshipDraft>) => {
    setDrafts((current) =>
      current.map((draft) => {
        if (draft.id !== id) return draft;
        const next = { ...draft, ...patch };
        if (patch.folderType) {
          next.folderId = '';
          next.relationship = '';
        }
        return next;
      }),
    );
  };

  const handleSave = () => {
    const completed = drafts
      .map((draft) => {
        const candidate = RELATIONSHIP_CANDIDATES.find((item) => item.id === draft.folderId);
        if (!draft.folderType || !candidate || !draft.relationship) return null;
        return {
          folderId: candidate.id,
          folderName: candidate.folderName,
          folderType: draft.folderType,
          relationship: draft.relationship,
          effectiveDate: draft.effectiveDate,
          expirationDate: draft.expirationDate,
          status: relationshipStatus(draft.effectiveDate, draft.expirationDate),
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    if (completed.length > 0) {
      addEntityRelationships(entityId, completed);
    }
    navigate(relationshipTarget);
  };

  return (
    <SubFolderFormShell
      title={t('entity.relationship.title')}
      onCancel={() => navigate(relationshipTarget)}
      onSubmit={handleSave}
      submitLabel={t('entity.relationship.save')}
      cancelLabel={t('entity.relationship.cancel')}
    >
      <p className="mb-5 text-sm text-text-primary">
        {t('entity.relationship.description', { name: entityName })}
      </p>

      <div className="space-y-4">
        {drafts.map((draft) => (
          <RelationshipDraftCard
            key={draft.id}
            draft={draft}
            entityName={entityName}
            onChange={(patch) => updateDraft(draft.id, patch)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setDrafts((current) => [...current, createDraft()])}
        className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-brand-blue px-4 py-2 text-[12px] font-semibold text-brand-blue transition-colors hover:bg-brand-blue/5"
      >
        <Plus className="size-3.5" />
        {t('entity.relationship.addInline')}
      </button>
    </SubFolderFormShell>
  );
}

function RelationshipDraftCard({
  draft,
  entityName,
  onChange,
}: {
  draft: RelationshipDraft;
  entityName: string;
  onChange: (patch: Partial<RelationshipDraft>) => void;
}) {
  const { t } = useTranslation('folders');
  const folderOptions = draft.folderType
    ? RELATIONSHIP_CANDIDATES.filter((candidate) => candidate.folderType === draft.folderType)
    : [];
  const selectedFolder = RELATIONSHIP_CANDIDATES.find((candidate) => candidate.id === draft.folderId);
  const relationshipOptions = draft.folderType ? RELATIONSHIP_OPTIONS_BY_TYPE[draft.folderType] : [];
  const showSentence = selectedFolder && draft.relationship;

  return (
    <section className="rounded-lg border border-border-default bg-white px-6 py-5 shadow-[0_1px_2px_rgba(27,28,30,0.04)]">
      <p className="mb-4 text-[13px] text-text-primary">
        {showSentence ? (
          <>
            <span className="font-semibold">{selectedFolder.folderName}</span>{' '}
            {t('entity.relationship.sentence', {
              folderName: '',
              relationship: draft.relationship,
              entityName,
            }).trim()}
          </>
        ) : (
          t('entity.relationship.configure')
        )}
      </p>

      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-3">
        <RelationshipSelect
          label={t('entity.relationship.fields.folderType')}
          value={draft.folderType}
          placeholder={t('entity.relationship.selectOption')}
          options={RELATIONSHIP_FOLDER_TYPES.map((type) => ({
            value: type,
            label: t(`entity.relationship.folderTypes.${type}` as never),
          }))}
          onChange={(value) => onChange({ folderType: value as RelationshipFolderType })}
        />
        <RelationshipSelect
          label={t('entity.relationship.fields.folderName')}
          value={draft.folderId}
          placeholder={t('entity.relationship.selectOption')}
          disabled={!draft.folderType}
          options={folderOptions.map((option) => ({
            value: option.id,
            label: option.folderName,
          }))}
          onChange={(folderId) => onChange({ folderId })}
        />
        <RelationshipSelect
          label={t('entity.relationship.fields.relationship')}
          value={draft.relationship}
          placeholder={t('entity.relationship.selectOption')}
          disabled={!draft.folderType}
          options={relationshipOptions.map((relationship) => ({
            value: relationship,
            label: relationship,
          }))}
          onChange={(relationship) => onChange({ relationship })}
        />
        <RelationshipDateInput
          label={t('entity.relationship.fields.effectiveDate')}
          value={draft.effectiveDate}
          onChange={(effectiveDate) => onChange({ effectiveDate })}
        />
        <RelationshipDateInput
          label={t('entity.relationship.fields.expirationDate')}
          value={draft.expirationDate}
          onChange={(expirationDate) => onChange({ expirationDate })}
        />
      </div>
    </section>
  );
}

function RelationshipSelect({
  label,
  value,
  placeholder,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-text-primary">{label}</span>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-9 border-[#b7bbc2] bg-white text-[13px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function RelationshipDateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-text-primary">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-[#b7bbc2] bg-white px-3 text-[13px] text-text-primary outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
      />
    </label>
  );
}

function relationshipStatus(effectiveDate: string, expirationDate: string): 'ACTIVE' | 'INACTIVE' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const effective = effectiveDate ? new Date(`${effectiveDate}T00:00:00`) : null;
  const expired = expirationDate ? new Date(`${expirationDate}T00:00:00`) < today : false;
  return effective && effective <= today && !expired ? 'ACTIVE' : 'INACTIVE';
}

function relationshipPath(params: ReturnType<typeof useParams>) {
  const base = params.nestedId
    ? `/folders/${params.folderId}/${params.childType}/${params.childId}/${params.nestedType}/${params.nestedId}`
    : params.childId
    ? `/folders/${params.folderId}/${params.childType}/${params.childId}`
    : `/folders/${params.folderId}`;
  return `${base}?tab=relationship`;
}
