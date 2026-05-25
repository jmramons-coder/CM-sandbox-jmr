import { useMemo, useState, type ButtonHTMLAttributes } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { IdentityDocumentRecord } from '../../../domain/identityDocuments';
import type { IdentityDocumentPermissions } from '../../../domain/identityDocumentPermissions';
import { getExpiryDisplayStatus } from '../../../utils/identityDocumentValidation';
import { ModuleTableHeaderCell, ModuleTableShell } from '../../ModuleTableScaffold';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { IdentityDocumentNumberCell } from './IdentityDocumentNumberCell';

const PER_PAGE = 10;

type IdentityDocumentsTableProps = {
  documents: IdentityDocumentRecord[];
  partyId: string;
  permissions: IdentityDocumentPermissions;
  unmaskTimeoutMs: number;
  userId: string;
  unmaskedIds: Set<string>;
  onUnmaskChange: (documentId: string, unmasked: boolean) => void;
  onEdit: (documentId: string) => void;
  onDelete: (documentId: string) => void;
};

export function IdentityDocumentsTable({
  documents,
  partyId,
  permissions,
  unmaskTimeoutMs,
  userId,
  unmaskedIds,
  onUnmaskChange,
  onEdit,
  onDelete,
}: IdentityDocumentsTableProps) {
  const { t } = useTranslation('folders');
  const [page, setPage] = useState(1);
  const total = documents.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PER_PAGE;
    return documents.slice(start, start + PER_PAGE);
  }, [documents, safePage]);

  const end = Math.min(safePage * PER_PAGE, total);

  return (
    <>
      <div className="overflow-x-auto">
        <ModuleTableShell minWidth="900px">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <ModuleTableHeaderCell
                  key={col.key}
                  align={col.align}
                  className="border-border-soft bg-white px-4 py-2 text-[12px] font-medium leading-[16px] text-text-secondary"
                >
                  <span className="inline-flex items-center gap-1">
                    <span aria-hidden className="text-text-muted">⇅</span>
                    {col.label}
                  </span>
                </ModuleTableHeaderCell>
              ))}
              <th
                aria-hidden
                className="w-[36px] border-b border-border-soft bg-white px-2 py-2"
              />
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <IdentityDocumentRow
                key={row.id}
                record={row}
                partyId={partyId}
                permissions={permissions}
                unmaskTimeoutMs={unmaskTimeoutMs}
                userId={userId}
                isUnmasked={unmaskedIds.has(row.id)}
                onUnmaskChange={onUnmaskChange}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </ModuleTableShell>
      </div>
      {total > 0 ? (
        <div className="flex items-center justify-between gap-4 border-t border-border-soft px-4 py-2.5">
          <span className="text-[12px] text-text-secondary">
            {t('entity.table.results', { end, total })}
          </span>
          <div className="flex items-center gap-1 text-text-secondary">
            <PagerButton
              aria-label={t('entity.table.firstPage')}
              disabled={safePage <= 1}
              onClick={() => setPage(1)}
            >
              <ChevronsLeft className="size-3.5" />
            </PagerButton>
            <PagerButton
              aria-label={t('entity.table.previousPage')}
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-3.5" />
            </PagerButton>
            <span className="rounded-full border border-brand-blue/40 bg-surface-selected px-2 text-[12px] font-semibold text-brand-navy">
              {safePage}
            </span>
            <PagerButton
              aria-label={t('entity.table.nextPage')}
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="size-3.5" />
            </PagerButton>
            <PagerButton
              aria-label={t('entity.table.lastPage')}
              disabled={safePage >= totalPages}
              onClick={() => setPage(totalPages)}
            >
              <ChevronsRight className="size-3.5" />
            </PagerButton>
          </div>
        </div>
      ) : null}
    </>
  );
}

const COLUMNS = [
  { key: 'documentType', label: 'Document type' },
  { key: 'issuingJurisdiction', label: 'Issuing jurisdiction' },
  { key: 'documentNumber', label: 'Document #' },
  { key: 'issueDate', label: 'Issue date' },
  { key: 'expiryDate', label: 'Expiry date' },
  { key: 'additionalInformation', label: 'Add. information' },
] as const;

function IdentityDocumentRow({
  record,
  partyId,
  permissions,
  unmaskTimeoutMs,
  userId,
  isUnmasked,
  onUnmaskChange,
  onEdit,
  onDelete,
}: {
  record: IdentityDocumentRecord;
  partyId: string;
  permissions: IdentityDocumentPermissions;
  unmaskTimeoutMs: number;
  userId: string;
  isUnmasked: boolean;
  onUnmaskChange: (documentId: string, unmasked: boolean) => void;
  onEdit: (documentId: string) => void;
  onDelete: (documentId: string) => void;
}) {
  const expiryStatus = getExpiryDisplayStatus(record.expiryDate);

  return (
    <tr className="hover:bg-surface-hover">
      <td className="border-b border-border-soft px-4 py-3 text-[13px] text-text-primary">
        {record.documentType}
      </td>
      <td className="border-b border-border-soft px-4 py-3 text-[13px] text-text-primary">
        {record.issuingJurisdiction}
      </td>
      <td className="border-b border-border-soft px-4 py-3">
        <IdentityDocumentNumberCell
          documentId={record.id}
          partyId={partyId}
          documentType={record.documentType}
          documentNumberEncrypted={record.documentNumberEncrypted}
          isUnmasked={isUnmasked}
          onUnmaskChange={onUnmaskChange}
          unmaskTimeoutMs={unmaskTimeoutMs}
          userId={userId}
        />
      </td>
      <td className="border-b border-border-soft px-4 py-3 text-[13px] text-text-primary whitespace-nowrap">
        {record.issueDate ?? '—'}
      </td>
      <td className="border-b border-border-soft px-4 py-3 text-[13px] whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 text-text-primary">
          {record.expiryDate ?? '—'}
          {expiryStatus === 'expired' ? (
            <AlertTriangle className="size-3.5 text-red-600" aria-label="Expired" />
          ) : expiryStatus === 'warning' ? (
            <AlertTriangle className="size-3.5 text-amber-600" aria-label="Expiring soon" />
          ) : null}
        </span>
      </td>
      <td className="max-w-[200px] border-b border-border-soft px-4 py-3 text-[13px] text-text-primary">
        <span className="block truncate" title={record.additionalInformation ?? undefined}>
          {record.additionalInformation ?? '—'}
        </span>
      </td>
      <td className="border-b border-border-soft px-2 py-3 text-right">
        <RowActionsMenu
          record={record}
          permissions={permissions}
          isUnmasked={isUnmasked}
          onUnmaskChange={onUnmaskChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

function RowActionsMenu({
  record,
  permissions,
  isUnmasked,
  onUnmaskChange,
  onEdit,
  onDelete,
}: {
  record: IdentityDocumentRecord;
  permissions: IdentityDocumentPermissions;
  isUnmasked: boolean;
  onUnmaskChange: (documentId: string, unmasked: boolean) => void;
  onEdit: (documentId: string) => void;
  onDelete: (documentId: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded p-1 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
          aria-label="Row actions"
        >
          <MoreVertical className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {permissions.canUnmask ? (
          <DropdownMenuItem onSelect={() => onUnmaskChange(record.id, !isUnmasked)}>
            {isUnmasked ? 'Mask' : 'Unmask'}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          disabled={!permissions.canUpdate}
          onSelect={() => permissions.canUpdate && onEdit(record.id)}
          className={!permissions.canUpdate ? 'opacity-50' : ''}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!permissions.canDelete}
          onSelect={() => permissions.canDelete && onDelete(record.id)}
          className={!permissions.canDelete ? 'opacity-50' : ''}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PagerButton({
  children,
  disabled,
  onClick,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      {...rest}
      className="rounded p-1 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
