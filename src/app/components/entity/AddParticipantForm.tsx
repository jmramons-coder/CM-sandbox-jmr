import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { CalendarDays, ChevronDown, Info, Mail, MapPin, Phone, X } from 'lucide-react';
import {
  COVERAGE_LIST_ROWS,
  MOCK_CLIENTS,
  PARTICIPANT_ROLE_OPTIONS,
  type MockClient,
} from '../../data/mock-entity-folders';
import { useTranslatedEntityFolder } from '../../data/useFolders';
import {
  createEmptyClientMatchInput,
  findClientDuplicateMatches,
  type ClientMatchInput,
  type ClientDuplicateMatch,
} from '../../utils/client-matching';
import { ClientDuplicateMatchList } from './ClientDuplicateMatchList';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  SubFolderFormShell,
  ClientSearchCombobox,
  RolesNav,
  RoleDetailPanel,
  type LinkedToOption,
  type RoleEntry,
} from './SubFolderFormShell';
import { InitialsAvatar } from '../ds';
import { LozengeTag } from '../LozengeTag';

type ParticipantQuickCreateType = 'individual' | 'organization';

type IndividualQuickCreateDraft = {
  suffix: string;
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  displayName: string;
  gender: string;
  language: string;
  dob: string;
};

type OrganizationQuickCreateDraft = {
  companyName: string;
  displayName: string;
  language: string;
  establishmentDate: string;
};

const EMPTY_INDIVIDUAL_DRAFT: IndividualQuickCreateDraft = {
  suffix: '',
  title: '',
  firstName: '',
  middleName: '',
  lastName: '',
  displayName: '',
  gender: '',
  language: '',
  dob: '',
};

const EMPTY_ORGANIZATION_DRAFT: OrganizationQuickCreateDraft = {
  companyName: '',
  displayName: '',
  language: '',
  establishmentDate: '',
};

let roleIdCounter = 1;

function createEmptyRole(): RoleEntry {
  return {
    id: `role-${roleIdCounter++}`,
    name: '',
    status: 'INACTIVE',
    linkedTo: '',
    role: '',
    details: {},
  };
}

export function AddParticipantForm() {
  const { t } = useTranslation('folders');
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const parentId = params.childId ?? params.folderId ?? '';
  const parent = useTranslatedEntityFolder(parentId);
  const existingClientId = searchParams.get('clientId');
  const existingClient = MOCK_CLIENTS.find((client) => client.id === existingClientId) ?? null;
  const isExistingClientMode = searchParams.get('mode') === 'existing' && Boolean(existingClient);

  const [selectedClient, setSelectedClient] = useState<MockClient | null>(existingClient);
  const [creatingNewClient, setCreatingNewClient] = useState(false);
  const [participantTypeMenuOpen, setParticipantTypeMenuOpen] = useState(false);
  const [quickCreateType, setQuickCreateType] = useState<ParticipantQuickCreateType>('individual');
  const [individualDraft, setIndividualDraft] = useState<IndividualQuickCreateDraft>(EMPTY_INDIVIDUAL_DRAFT);
  const [organizationDraft, setOrganizationDraft] = useState<OrganizationQuickCreateDraft>(EMPTY_ORGANIZATION_DRAFT);
  const [clientDraft, setClientDraft] = useState<ClientMatchInput>(() => createEmptyClientMatchInput());
  const [createAnyway, setCreateAnyway] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideError, setShowOverrideError] = useState(false);
  const [roles, setRoles] = useState<RoleEntry[]>(() => [createEmptyRole()]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(roles[0]?.id ?? null);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;
  const duplicateMatches = useMemo(
    () => findClientDuplicateMatches(clientDraft, MOCK_CLIENTS),
    [clientDraft],
  );
  const hasMaterialDuplicateRisk = duplicateMatches.some(
    (match) => match.confidence === 'high' || match.confidence === 'possible',
  );

  const parentTitle = parent?.header.title ?? parentId;

  useEffect(() => {
    if (existingClient) {
      setSelectedClient(existingClient);
      setCreatingNewClient(false);
    }
  }, [existingClient]);

  const linkedToOptions = useMemo<LinkedToOption[]>(() => {
    const opts: LinkedToOption[] = [{
      value: '__policy__',
      label: parentTitle,
      meta: { type: 'Policy', level: 'Contract' },
    }];
    for (const cov of COVERAGE_LIST_ROWS) {
      opts.push({
        value: cov.id,
        label: cov.name,
        meta: {
          type: cov.type,
          level: cov.level,
          amount: cov.amount,
          annualPremium: cov.annualPremium,
          parent: cov.parent,
        },
      });
    }
    return opts;
  }, [parentTitle]);

  const handleAddRole = useCallback(() => {
    const newRole = createEmptyRole();
    setRoles((prev) => [...prev, newRole]);
    setSelectedRoleId(newRole.id);
  }, []);

  const handleRemoveRole = useCallback((id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
    setSelectedRoleId((prev) => {
      if (prev !== id) return prev;
      const remaining = roles.filter((role) => role.id !== id);
      return remaining[0]?.id ?? null;
    });
  }, [roles]);

  const handleSelectRole = useCallback((id: string) => {
    setSelectedRoleId(id);
  }, []);

  const handleLinkedToChange = useCallback(
    (value: string) => {
      if (!selectedRoleId) return;
      setRoles((prev) =>
        prev.map((r) => (r.id === selectedRoleId ? { ...r, linkedTo: value } : r)),
      );
    },
    [selectedRoleId],
  );

  const handleRoleChange = useCallback(
    (value: string) => {
      if (!selectedRoleId) return;
      setRoles((prev) =>
        prev.map((r) => (r.id === selectedRoleId ? { ...r, role: value, name: value, details: {} } : r)),
      );
    },
    [selectedRoleId],
  );

  const handleRoleDetailChange = useCallback(
    (key: string, value: string) => {
      if (!selectedRoleId) return;
      setRoles((prev) =>
        prev.map((r) =>
          r.id === selectedRoleId
            ? { ...r, details: { ...r.details, [key]: value } }
            : r,
        ),
      );
    },
    [selectedRoleId],
  );

  const openQuickCreate = useCallback((type: ParticipantQuickCreateType) => {
    setSelectedClient(null);
    setCreatingNewClient(true);
    setQuickCreateType(type);
    setParticipantTypeMenuOpen(false);
    setCreateAnyway(false);
    setOverrideReason('');
    setShowOverrideError(false);
    setClientDraft(createEmptyClientMatchInput());
    setIndividualDraft(EMPTY_INDIVIDUAL_DRAFT);
    setOrganizationDraft(EMPTY_ORGANIZATION_DRAFT);
  }, []);

  const handleIndividualDraftChange = useCallback(
    (key: keyof IndividualQuickCreateDraft, value: string) => {
      setIndividualDraft((prev) => {
        const next = { ...prev, [key]: value };
        const inferredDisplayName = next.displayName || [next.lastName, next.firstName].filter(Boolean).join(', ');
        setClientDraft((draft) => ({
          ...draft,
          legalName: inferredDisplayName || [next.firstName, next.middleName, next.lastName].filter(Boolean).join(' '),
          dob: next.dob,
          gender: next.gender,
        }));
        return next;
      });
      setCreateAnyway(false);
      setOverrideReason('');
      setShowOverrideError(false);
    },
    [],
  );

  const handleOrganizationDraftChange = useCallback(
    (key: keyof OrganizationQuickCreateDraft, value: string) => {
      setOrganizationDraft((prev) => {
        const next = { ...prev, [key]: value };
        setClientDraft((draft) => ({
          ...draft,
          legalName: next.displayName || next.companyName,
          dob: next.establishmentDate,
        }));
        return next;
      });
      setCreateAnyway(false);
      setOverrideReason('');
      setShowOverrideError(false);
    },
    [],
  );

  const handleUseExistingClient = useCallback((match: ClientDuplicateMatch) => {
    setSelectedClient(match.client);
    setCreatingNewClient(false);
    setCreateAnyway(false);
    setOverrideReason('');
    setShowOverrideError(false);
  }, []);

  const handleSubmit = useCallback(() => {
    if (creatingNewClient && hasMaterialDuplicateRisk && (!createAnyway || !overrideReason)) {
      setShowOverrideError(true);
      return;
    }
    setShowOverrideError(false);
  }, [createAnyway, creatingNewClient, hasMaterialDuplicateRisk, overrideReason]);

  return (
    <SubFolderFormShell title={t('entity.addParticipant.title')} onCancel={() => navigate(-1)} onSubmit={handleSubmit}>
      <p className="mb-3 text-sm italic text-text-primary">
        {t('entity.form.requiredNotePrefix')}{' '}
        <span className="text-brand-red">*</span>
        {t('entity.form.requiredNoteSuffix')}
      </p>
      {isExistingClientMode && existingClient ? (
        <ExistingClientInfoCard client={existingClient} />
      ) : (
        <div className="rounded-lg border border-border-default bg-white p-4 sm:p-5 lg:p-6">
          <h2 className="mb-4 text-base font-semibold text-text-primary">
            {t('entity.addParticipant.detailsTitle')}
          </h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              {t('entity.addParticipant.clientFolder')}
            </label>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
              <div className="min-w-0 flex-1">
                <ClientSearchCombobox
                  value={selectedClient}
                  onChange={(client) => {
                    setSelectedClient(client);
                    if (client) setCreatingNewClient(false);
                  }}
                />
              </div>
              {!selectedClient ? (
                <>
                  <span className="text-sm text-text-muted md:shrink-0">{t('entity.addParticipant.or')}</span>
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setParticipantTypeMenuOpen((open) => !open)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand-blue px-5 py-2 text-xs font-bold uppercase tracking-wide text-brand-blue transition-colors hover:bg-brand-blue/5 md:w-auto"
                    >
                      {t('entity.addParticipant.newParticipant')}
                      <ChevronDown className="size-3.5" />
                    </button>
                    {participantTypeMenuOpen ? (
                      <div className="absolute right-0 top-full z-50 mt-1 w-[180px] overflow-hidden rounded-md border border-brand-blue bg-white py-2 shadow-[0_8px_24px_rgba(27,28,30,0.16)]">
                        <p className="px-4 pb-1 text-sm text-text-muted">
                          {t('entity.quickCreate.participantType')}
                        </p>
                        <button
                          type="button"
                          onClick={() => openQuickCreate('individual')}
                          className="block w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-selected"
                        >
                          {t('entity.quickCreate.types.individual')}
                        </button>
                        <button
                          type="button"
                          onClick={() => openQuickCreate('organization')}
                          className="block w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-selected"
                        >
                          {t('entity.quickCreate.types.organization')}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {creatingNewClient ? (
            <div className="mt-5 space-y-4 rounded-lg border border-border-default bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-text-primary">
                {t(`entity.quickCreate.${quickCreateType}.title` as never)}
              </h3>
              <button
                type="button"
                onClick={() => setCreatingNewClient(false)}
                className="rounded p-1 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                aria-label={t('entity.quickCreate.close')}
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex items-start gap-3 rounded-md bg-status-info-bg px-4 py-3 text-sm text-text-secondary">
              <Info className="mt-0.5 size-4 shrink-0 text-brand-blue" />
              <div>
                <p className="font-semibold text-text-primary">{t('entity.quickCreate.informative')}</p>
                <p className="mt-1 leading-5">{t('entity.quickCreate.infoText')}</p>
              </div>
            </div>

            {quickCreateType === 'individual' ? (
              <IndividualQuickCreateFields
                draft={individualDraft}
                onChange={handleIndividualDraftChange}
              />
            ) : (
              <OrganizationQuickCreateFields
                draft={organizationDraft}
                onChange={handleOrganizationDraftChange}
              />
            )}

            <ClientDuplicateMatchList
              matches={duplicateMatches}
              onUseExisting={handleUseExistingClient}
            />

            {hasMaterialDuplicateRisk ? (
              <div className="rounded-lg border border-border-default bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {t('entity.duplicateClient.createAnywayTitle')}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {t('entity.duplicateClient.createAnywayDescription')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateAnyway(true);
                      setShowOverrideError(false);
                    }}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                      createAnyway
                        ? 'border-brand-blue bg-surface-selected text-brand-blue'
                        : 'border-border-default bg-white text-text-secondary hover:border-brand-blue/40 hover:text-brand-blue'
                    }`}
                  >
                    {t('entity.duplicateClient.createAnyway')}
                  </button>
                </div>
                {createAnyway ? (
                  <div className="mt-4 w-full max-w-[520px]">
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">
                      {t('entity.duplicateClient.overrideReason')}
                    </label>
                    <select
                      value={overrideReason}
                      onChange={(event) => {
                        setOverrideReason(event.target.value);
                        setShowOverrideError(false);
                      }}
                      className="h-10 w-full rounded-md border border-[#b7bbc2] bg-white px-3 text-sm text-text-primary outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                    >
                      <option value="">{t('entity.duplicateClient.selectReason')}</option>
                      <option value="different-person">{t('entity.duplicateClient.reasons.differentPerson')}</option>
                      <option value="outdated-data">{t('entity.duplicateClient.reasons.outdatedData')}</option>
                      <option value="insufficient-match">{t('entity.duplicateClient.reasons.insufficientMatch')}</option>
                    </select>
                  </div>
                ) : null}
                {showOverrideError ? (
                  <p className="mt-3 text-sm font-medium text-brand-red">
                    {t('entity.duplicateClient.overrideRequired')}
                  </p>
                ) : null}
              </div>
            ) : null}
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-6 grid min-h-[320px] grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <RolesNav
          title={t('entity.addParticipant.rolesTitle')}
          roles={roles}
          selectedId={selectedRoleId}
          onSelect={handleSelectRole}
          onAdd={handleAddRole}
          onRemove={handleRemoveRole}
        />
        <RoleDetailPanel
          role={selectedRole}
          linkedToOptions={linkedToOptions}
          roleOptions={PARTICIPANT_ROLE_OPTIONS}
          onLinkedToChange={handleLinkedToChange}
          onRoleChange={handleRoleChange}
          onDetailChange={handleRoleDetailChange}
        />
      </div>
    </SubFolderFormShell>
  );
}

function ExistingClientInfoCard({ client }: { client: MockClient }) {
  const { t } = useTranslation('folders');
  const details = [
    { label: t('entity.advancedClientSearch.columns.email'), value: client.email || '-', icon: Mail },
    { label: t('entity.advancedClientSearch.columns.phone'), value: client.phone || '-', icon: Phone },
    { label: t('entity.advancedClientSearch.columns.dob'), value: client.dob || '-', icon: CalendarDays },
    { label: t('entity.advancedClientSearch.columns.address'), value: [client.address, client.parish].filter(Boolean).join(', ') || '-', icon: MapPin },
  ];
  const status = client.status ?? 'active';
  const category = client.category ? t(`entity.advancedClientSearch.filters.category.${client.category}` as never) : null;

  return (
    <section className="rounded-xl border border-border-default bg-white px-5 py-4 shadow-[0_1px_2px_rgba(27,28,30,0.04)]">
      <div className="flex items-start justify-between gap-5">
        <div className="flex min-w-0 items-center gap-4">
          <InitialsAvatar
            name={client.name}
            initials={client.initials}
            seed={client.id}
            backgroundColor={client.avatarColor}
            textColor={client.avatarTextColor}
            size="xl"
            className="ring-4 ring-surface-primary"
          />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text-muted">
              {t('entity.addParticipant.selectedClientTitle')}
            </p>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="truncate text-[20px] font-semibold leading-7 text-text-primary">{client.name}</h2>
              {category ? (
                <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-text-secondary">
                  {category}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <LozengeTag
          label={t(`entity.advancedClientSearch.filters.status.${status}` as never)}
          type={status === 'active' ? 'Success' : 'Neutral'}
          subtle
          className="shrink-0"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 overflow-hidden rounded-lg border border-border-soft bg-surface-primary sm:grid-cols-2 xl:grid-cols-4">
        {details.map((detail, index) => {
          const Icon = detail.icon;
          return (
            <div
              key={detail.label}
              className={`min-w-0 px-4 py-3 ${
                index > 0 ? 'border-t border-border-soft sm:border-t-0' : ''
              } ${
                index % 2 === 1 ? 'sm:border-l sm:border-border-soft' : ''
              } ${
                index > 0 ? 'xl:border-l xl:border-border-soft' : ''
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.35px] text-text-muted">
                <Icon className="size-3.5" />
                {detail.label}
              </div>
              <p className={`mt-1 truncate text-[13px] font-semibold ${detail.value === '-' ? 'text-text-muted' : 'text-text-primary'}`}>
                {detail.value}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ClientIdentityInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-primary">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-[#b7bbc2] bg-white px-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
      />
    </div>
  );
}

function IndividualQuickCreateFields({
  draft,
  onChange,
}: {
  draft: IndividualQuickCreateDraft;
  onChange: (key: keyof IndividualQuickCreateDraft, value: string) => void;
}) {
  const { t } = useTranslation('folders');
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
      <QuickCreateSelect label={t('entity.quickCreate.fields.suffix')} value={draft.suffix} placeholder={t('entity.quickCreate.placeholders.suffix')} options={['Jr.', 'Sr.', 'III']} onChange={(value) => onChange('suffix', value)} />
      <QuickCreateSelect label={t('entity.quickCreate.fields.title')} value={draft.title} placeholder={t('entity.quickCreate.placeholders.title')} options={['Mr.', 'Mrs.', 'Ms.', 'Dr.']} onChange={(value) => onChange('title', value)} />
      <ClientIdentityInput label={t('entity.quickCreate.fields.firstName')} value={draft.firstName} onChange={(value) => onChange('firstName', value)} />
      <ClientIdentityInput label={t('entity.quickCreate.fields.middleName')} value={draft.middleName} onChange={(value) => onChange('middleName', value)} />
      <ClientIdentityInput label={t('entity.quickCreate.fields.lastName')} value={draft.lastName} onChange={(value) => onChange('lastName', value)} />
      <ClientIdentityInput label={t('entity.quickCreate.fields.displayName')} value={draft.displayName} onChange={(value) => onChange('displayName', value)} />
      <QuickCreateSelect label={t('entity.quickCreate.fields.gender')} value={draft.gender} placeholder={t('entity.quickCreate.placeholders.gender')} options={['Male', 'Female', 'Other']} onChange={(value) => onChange('gender', value)} />
      <QuickCreateSelect label={t('entity.quickCreate.fields.language')} value={draft.language} placeholder={t('entity.quickCreate.placeholders.language')} options={['English', 'French', 'Spanish']} onChange={(value) => onChange('language', value)} />
      <div className="w-full max-w-[260px]">
        <ClientIdentityInput label={t('entity.quickCreate.fields.dob')} type="date" value={draft.dob} onChange={(value) => onChange('dob', value)} />
      </div>
    </div>
  );
}

function OrganizationQuickCreateFields({
  draft,
  onChange,
}: {
  draft: OrganizationQuickCreateDraft;
  onChange: (key: keyof OrganizationQuickCreateDraft, value: string) => void;
}) {
  const { t } = useTranslation('folders');
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
      <ClientIdentityInput label={t('entity.quickCreate.fields.companyName')} value={draft.companyName} onChange={(value) => onChange('companyName', value)} />
      <ClientIdentityInput label={t('entity.quickCreate.fields.displayNameDefault')} value={draft.displayName} onChange={(value) => onChange('displayName', value)} />
      <QuickCreateSelect label={t('entity.quickCreate.fields.language')} value={draft.language} placeholder={t('entity.quickCreate.placeholders.language')} options={['English', 'French', 'Spanish']} onChange={(value) => onChange('language', value)} />
      <div className="w-full max-w-[260px]">
        <ClientIdentityInput label={t('entity.quickCreate.fields.establishmentDate')} type="date" value={draft.establishmentDate} onChange={(value) => onChange('establishmentDate', value)} />
      </div>
    </div>
  );
}

function QuickCreateSelect({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-primary">{label}</label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="h-10 w-full border-[#1b1c1e] bg-white text-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
