/**
 * Reusable layout and DS components for sub-folder creation forms
 * (Add Participant, Add Agent, Add Coverage, etc.).
 *
 * - SubFolderFormShell: full-page form layout (header + scrollable content + footer)
 * - ClientSearchCombobox: search-and-select combobox for client folders
 * - RolesNav: left-hand role list with add/remove
 * - RoleDetailPanel: right-hand role detail with linked-to + role dropdowns
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router';
import { ChevronDown, Info, Plus, Search, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTranslatedEntityFolder } from '../../data/useFolders';
import { useFoldersNav } from '../../contexts/FoldersNavContext';
import { MOCK_CLIENTS, type MockClient } from '../../data/mock-entity-folders';
import { LozengeTag } from '../LozengeTag';
import { ClientListMeta, InitialsAvatar, ScrollArea } from '../ds';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

/* ─── Types ─── */

export type RoleEntry = {
  id: string;
  name: string;
  status: 'INACTIVE' | 'ACTIVE';
  linkedTo: string;
  role: string;
  details: Record<string, string>;
};

export type SelectOption = { value: string; label: string };

export type LinkedToOption = SelectOption & {
  meta?: {
    type?: string;
    level?: string;
    amount?: string;
    annualPremium?: string;
    parent?: string;
  };
};

type RoleDetailField = {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'number' | 'select';
  placeholder?: string;
  options?: string[];
};

const ROLE_DETAIL_FIELDS: Record<string, RoleDetailField[]> = {
  Beneficiary: [
    { key: 'beneficiaryType', label: 'Beneficiary type', type: 'select', options: ['Primary', 'Contingent'] },
    { key: 'relationshipToInsured', label: 'Relationship to insured', type: 'select', options: ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'] },
    { key: 'irrevocable', label: 'Irrevocable', type: 'select', options: ['No', 'Yes'] },
    { key: 'sharePercentage', label: 'Share percentage', type: 'number', placeholder: '100' },
    { key: 'effectiveDate', label: 'Effective date', type: 'date' },
    { key: 'terminationDate', label: 'Termination date', type: 'date' },
    { key: 'terminationReason', label: 'Termination reason', placeholder: 'Optional' },
  ],
  'Policy Owner': [
    { key: 'ownershipType', label: 'Ownership type', type: 'select', options: ['Sole owner', 'Joint owner', 'Contingent owner'] },
    { key: 'ownershipPercentage', label: 'Ownership percentage', type: 'number', placeholder: '100' },
    { key: 'relationshipToInsured', label: 'Relationship to insured', type: 'select', options: ['Self', 'Spouse', 'Parent', 'Other'] },
    { key: 'effectiveDate', label: 'Effective date', type: 'date' },
  ],
  'Primary Insured': [
    { key: 'insuredType', label: 'Insured type', type: 'select', options: ['Primary', 'Joint'] },
    { key: 'relationshipToOwner', label: 'Relationship to owner', type: 'select', options: ['Self', 'Spouse', 'Child', 'Other'] },
    { key: 'effectiveDate', label: 'Effective date', type: 'date' },
  ],
  Payer: [
    { key: 'billingRelationship', label: 'Billing relationship', type: 'select', options: ['Policy owner', 'Third party', 'Employer'] },
    { key: 'paymentShare', label: 'Payment share', type: 'number', placeholder: '100' },
    { key: 'effectiveDate', label: 'Effective date', type: 'date' },
  ],
};

function getRoleLifecycleStatus(role: RoleEntry): RoleEntry['status'] {
  const effectiveDate = role.details.effectiveDate;
  if (!effectiveDate) return 'INACTIVE';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const effective = new Date(`${effectiveDate}T00:00:00`);
  const terminationDate = role.details.terminationDate;
  const terminated = terminationDate
    ? new Date(`${terminationDate}T00:00:00`) < today
    : false;

  return effective <= today && !terminated ? 'ACTIVE' : 'INACTIVE';
}

/* ─── Form shell ─── */

export function SubFolderFormShell({
  title,
  children,
  onCancel,
  onSubmit,
  submitLabel,
  cancelLabel,
}: {
  title: string;
  children: ReactNode;
  onCancel: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
}) {
  const params = useParams();
  const { t } = useTranslation('folders');
  const { addOpenFolder, setFormOverlayActive } = useFoldersNav();
  const parentId = params.childId ?? params.folderId ?? '';
  const parent = useTranslatedEntityFolder(parentId);

  useEffect(() => {
    if (params.folderId) addOpenFolder(params.folderId);
  }, [params.folderId, addOpenFolder]);

  useEffect(() => {
    setFormOverlayActive(true);
    return () => setFormOverlayActive(false);
  }, [setFormOverlayActive]);

  const parentTitle = parent?.header.title ?? parentId;

  return (
    <div className="flex h-full flex-col bg-surface-primary">
      <div className="shrink-0 border-b border-border-default bg-white px-4 pb-4 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <h1 className="text-[22px] font-semibold leading-tight text-text-primary">{title}</h1>
        <p className="mt-0.5 text-sm text-text-muted">{parentTitle}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="w-full px-4 py-4 sm:px-6 lg:px-8 lg:py-6 xl:max-w-[70%]">
          {children}
        </div>
      </div>

      <div className="shrink-0 border-t border-border-default bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-full bg-brand-blue px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-brand-blue-hover"
          >
            {submitLabel ?? t('entity.form.actions.create')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold uppercase tracking-wide text-text-secondary transition-colors hover:text-text-primary"
          >
            {cancelLabel ?? t('entity.form.actions.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Client search combobox ─── */

export { type MockClient } from '../../data/mock-entity-folders';

function getClientUnitIdentifier(client: MockClient) {
  const index = MOCK_CLIENTS.findIndex((item) => item.id === client.id);
  return `CLI-${String(index >= 0 ? index + 1 : 0).padStart(4, '0')}`;
}

function clientListMetaFromMock(client: MockClient) {
  const address = [client.address, client.parish].filter(Boolean).join(', ');
  const date = client.dob ? (client.age ? `${client.dob} (${client.age})` : client.dob) : undefined;
  return {
    date,
    email: client.email,
    phone: client.phone,
    address: address || undefined,
  };
}

export function ClientFolderSearchResultRow({
  client,
  onSelect,
}: {
  client: MockClient;
  onSelect: (client: MockClient) => void;
}) {
  const status = client.status === 'inactive' ? 'INACTIVE' : 'ACTIVE';

  return (
    <button
      type="button"
      className="relative flex w-full items-center gap-3 px-4 py-3 pr-24 text-left transition-colors hover:bg-surface-hover"
      onClick={() => onSelect(client)}
    >
      <span className="absolute right-4 top-3 text-[10px] font-semibold text-text-muted/70">
        {getClientUnitIdentifier(client)}
      </span>
      <InitialsAvatar
        name={client.name}
        initials={client.initials}
        seed={client.id}
        backgroundColor={client.avatarColor}
        textColor={client.avatarTextColor}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-semibold text-text-primary">{client.name}</p>
          <LozengeTag
            label={status}
            type={status === 'ACTIVE' ? 'Informative' : 'Neutral'}
            subtle
            className="shrink-0"
          />
        </div>
        <ClientListMeta {...clientListMetaFromMock(client)} showEmptyContactPlaceholders />
      </div>
    </button>
  );
}

export function ClientSearchCombobox({
  value,
  onChange,
  options = MOCK_CLIENTS,
}: {
  value: MockClient | null;
  onChange: (client: MockClient | null) => void;
  options?: MockClient[];
}) {
  const { t } = useTranslation('folders');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const terms = query
      .split(',')
      .map((term) => term.trim().toLowerCase())
      .filter(Boolean);
    if (terms.length === 0) return options.slice(0, 5);
    return options.filter((client) => {
      const searchableText = [
        client.name,
        client.id,
        getClientUnitIdentifier(client),
        client.email,
        client.phone,
        client.dob,
        client.address,
        client.parish,
        client.taxId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return terms.every((term) => searchableText.includes(term));
    });
  }, [options, query]);
  const isShowingRecentSearches = query.trim().length === 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (value) {
    const status = value.status === 'inactive' ? 'INACTIVE' : 'ACTIVE';

    return (
      <div className="relative flex items-center gap-3 rounded-lg border border-border-default bg-white px-3 py-2 pr-20">
        <span className="absolute right-10 top-2 text-[10px] font-semibold text-text-muted/70">
          {getClientUnitIdentifier(value)}
        </span>
        <InitialsAvatar
          name={value.name}
          initials={value.initials}
          seed={value.id}
          backgroundColor={value.avatarColor}
          textColor={value.avatarTextColor}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-semibold text-text-primary">{value.name}</p>
            <LozengeTag
              label={status}
              type={status === 'ACTIVE' ? 'Informative' : 'Neutral'}
              subtle
              className="shrink-0"
            />
          </div>
          <ClientListMeta {...clientListMetaFromMock(value)} showEmptyContactPlaceholders />
        </div>
        <button
          type="button"
          onClick={() => { onChange(null); setQuery(''); }}
          className="shrink-0 rounded p-1 text-text-secondary hover:bg-surface-muted hover:text-text-primary"
          aria-label={t('entity.addParticipant.clearClient')}
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={t('entity.addParticipant.searchPlaceholder')}
          className="h-10 w-full rounded-md border border-[#b7bbc2] bg-white pl-9 pr-24 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setOpen(true);
              inputRef.current?.focus();
            }}
            className="absolute right-16 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-secondary hover:text-text-primary"
          >
            <X className="size-4.5" />
          </button>
        )}
        {query ? (
          <span className="pointer-events-none absolute right-[52px] top-1/2 h-5 w-px -translate-y-1/2 bg-border-default" />
        ) : null}
        <div className="group absolute right-8 top-1/2 -translate-y-1/2">
          <button
            type="button"
            tabIndex={-1}
            className="flex size-5 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary"
            aria-label="Search syntax help"
          >
            <Info className="size-3.5" />
          </button>
          <div className="pointer-events-none absolute bottom-full right-1/2 z-[70] mb-2 hidden w-[350px] translate-x-1/2 rounded-[4px] bg-[#5f666f] px-4 py-2 text-center text-[14px] font-normal leading-snug text-white shadow-[0_8px_18px_rgba(27,28,30,0.18)] group-hover:block">
            Quick Tip: Boost your search with comma filters like "email, phone" (e.g., gmail, 555)
            <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-[7px] border-x-transparent border-t-[#5f666f]" />
          </div>
        </div>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
      </div>

      {open && results.length > 0 && (
        <ScrollArea className="app-scrollbar-thumb-left-4 absolute inset-x-0 top-full z-50 mt-1 max-h-[min(340px,30vh)] overflow-y-auto overscroll-contain rounded-lg border border-border-default bg-white shadow-lg">
          <div className="px-4 pb-1.5 pt-2.5 text-[12px] font-medium text-text-muted">
            {isShowingRecentSearches
              ? t('entity.addParticipant.recentSearches')
              : t('entity.addParticipant.searchResults')}
          </div>
          {results.map((client) => (
            <ClientFolderSearchResultRow
              key={client.id}
              client={client}
              onSelect={(selected) => { onChange(selected); setOpen(false); setQuery(''); }}
            />
          ))}
        </ScrollArea>
      )}
    </div>
  );
}

/* ─── Roles left nav ─── */

export function RolesNav({
  title,
  roles,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
}: {
  title: string;
  roles: RoleEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useTranslation('folders');
  return (
    <div className="flex h-full flex-col rounded-lg border border-border-default bg-white">
      <div className="border-b border-border-default px-4 py-3">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {roles.map((role) => {
          const active = role.id === selectedId;
          const lifecycleStatus = getRoleLifecycleStatus(role);
          return (
            <div
              key={role.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(role.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(role.id); }}
              className={`group relative flex cursor-pointer items-start justify-between gap-2 px-4 py-3 transition-colors ${
                active
                  ? 'bg-brand-blue/10'
                  : 'hover:bg-surface-hover'
              }`}
            >
              <div className="min-w-0">
                <p className={`text-sm text-text-primary ${active ? 'font-semibold' : 'font-medium'}`}>
                  {role.name || t('entity.form.roles.newRole')}
                </p>
                <div className="mt-1">
                  <LozengeTag label={lifecycleStatus} type={lifecycleStatus === 'ACTIVE' ? 'Informative' : 'Neutral'} subtle />
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(role.id); }}
                className="shrink-0 rounded p-1 text-text-muted opacity-0 transition-opacity hover:bg-surface-muted hover:text-text-primary group-hover:opacity-100"
                aria-label={t('entity.form.roles.removeRole')}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border-default px-4 py-3">
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-brand-blue"
        >
          <Plus className="size-4" />
          {t('entity.form.roles.add')}
        </button>
      </div>
    </div>
  );
}

/* ─── Role detail panel ─── */

export function RoleDetailPanel({
  role,
  linkedToOptions,
  roleOptions,
  onLinkedToChange,
  onRoleChange,
  onDetailChange,
  emptyMessage,
}: {
  role: RoleEntry | null;
  linkedToOptions: LinkedToOption[];
  roleOptions: string[];
  onLinkedToChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onDetailChange: (key: string, value: string) => void;
  emptyMessage?: string;
}) {
  const { t } = useTranslation('folders');
  const resolvedEmptyMessage = emptyMessage ?? t('entity.form.roleDetail.empty');

  if (!role) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-border-default bg-white p-8">
        <p className="text-sm text-text-muted">{resolvedEmptyMessage}</p>
      </div>
    );
  }

  const roleDetailFields = role.role ? ROLE_DETAIL_FIELDS[role.role] ?? [] : [];

  return (
    <div className="flex h-full flex-col rounded-lg border border-border-default bg-white">
      <div className="px-5 py-4">
        <h3 className="text-base font-semibold text-text-primary">{t('entity.form.roleDetail.title')}</h3>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-5">
        <div className="w-full max-w-[520px] xl:max-w-[50%]">
          <label className="mb-1.5 block text-sm font-medium text-text-primary">{t('entity.form.roleDetail.linkedTo')}</label>
          <LinkedToCoverageCombobox
            value={role.linkedTo}
            options={linkedToOptions}
            placeholder={t('entity.form.roleDetail.selectOption')}
            onChange={onLinkedToChange}
          />
        </div>

        <div className="rounded-lg border border-border-default bg-[#f7f8f9] p-4">
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            {t('entity.form.roleDetail.role')}
            <span className="ml-0.5 text-brand-red" aria-hidden>
              *
            </span>
            <span className="sr-only">{t('entity.form.requiredSr')}</span>
          </label>
          <Select value={role.role || undefined} onValueChange={onRoleChange}>
            <SelectTrigger className="h-10 w-full border-[#b7bbc2] bg-white text-sm">
              <SelectValue placeholder={t('entity.form.roleDetail.selectRole')} />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!role.role && (
            <p className="mt-4 text-center text-sm text-text-muted">{resolvedEmptyMessage}</p>
          )}

          {roleDetailFields.length > 0 ? (
            <div className="mt-5 space-y-4 border-t border-border-default pt-4">
              <p className="text-sm font-semibold text-text-primary">
                {t('entity.form.roleDetail.relatedDetails')}
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {roleDetailFields.map((field) => (
                  <RoleSpecificField
                    key={field.key}
                    field={field}
                    value={role.details[field.key] ?? ''}
                    onChange={(value) => onDetailChange(field.key, value)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function LinkedToCoverageCombobox({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: LinkedToOption[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const selected = options.find((option) => option.value === value);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const policyOption = options[0];
  const coverageOptions = options.slice(1);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 140,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  const renderOption = (option: LinkedToOption) => (
    <button
      key={option.value}
      type="button"
      onClick={() => {
        onChange(option.value);
        setOpen(false);
      }}
      className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-surface-hover ${
        value === option.value ? 'bg-brand-blue/10' : ''
      }`}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-semibold text-text-primary">{option.label}</span>
      </span>
      {option.value !== '__policy__' ? (
        <span className="text-xs text-text-muted">{formatLinkedToMeta(option)}</span>
      ) : null}
      {option.meta?.parent ? (
        <span className="text-xs text-text-muted">Parent: {option.meta.parent}</span>
      ) : null}
    </button>
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((next) => !next)}
        className="flex min-h-10 w-full items-center justify-between gap-3 rounded-md border border-[#b7bbc2] bg-white px-3 py-2 text-left text-sm outline-none transition-colors hover:border-brand-blue focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
      >
        <span className="min-w-0">
          {selected ? (
            <>
              <span className="block truncate font-semibold text-text-primary">{selected.label}</span>
              <span className="block truncate text-xs text-text-muted">
                {formatLinkedToMeta(selected)}
              </span>
            </>
          ) : (
            <span className="text-text-muted">{placeholder}</span>
          )}
        </span>
        <ChevronDown className="size-4 shrink-0 text-text-secondary" />
      </button>
      {open && menuStyle
        ? createPortal(
          <div ref={menuRef} style={menuStyle}>
            <ScrollArea className="app-scrollbar-thumb-left-4 max-h-[300px] overflow-y-auto rounded-lg border border-border-default bg-white shadow-lg">
              {policyOption ? renderOption(policyOption) : null}
              {coverageOptions.length > 0 ? (
                <div className="px-4 pb-1.5 pt-2.5 text-[12px] font-medium text-text-muted">
                  Coverage links
                </div>
              ) : null}
              {coverageOptions.map(renderOption)}
            </ScrollArea>
          </div>,
          document.body,
        )
        : null}
    </div>
  );
}

function formatLinkedToMeta(option: LinkedToOption) {
  const meta = option.meta;
  if (!meta) return '';
  return [meta.type, meta.amount, meta.annualPremium ? `${meta.annualPremium} annual premium` : '']
    .filter(Boolean)
    .join(' · ');
}

function RoleSpecificField({
  field,
  value,
  onChange,
}: {
  field: RoleDetailField;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-primary">{field.label}</label>
      {field.type === 'select' ? (
        <Select value={value || undefined} onValueChange={onChange}>
          <SelectTrigger className="h-10 w-full border-[#b7bbc2] bg-white text-sm">
            <SelectValue placeholder={field.placeholder ?? 'Select an option'} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <input
          type={field.type ?? 'text'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className="h-10 w-full rounded-md border border-[#b7bbc2] bg-white px-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
        />
      )}
    </div>
  );
}
