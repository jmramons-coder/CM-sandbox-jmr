import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, Search } from 'lucide-react';
import { CaseSearchOptionContent } from './ds';
import { toCaseSummarySearchResult } from '../utils/case-display';
import { filterDatasetBySettings, getSystemDataset, listCaseSummaries } from '../data/objectRepository';
import { useDataSourceSettings } from '../contexts/PlatformSettingsContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useTranslation } from 'react-i18next';

type MobileGlobalSearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MobileGlobalSearchDialog({ open, onOpenChange }: MobileGlobalSearchDialogProps) {
  const { t } = useTranslation('nav');
  const navigate = useNavigate();
  const dataSource = useDataSourceSettings();
  const [scope, setScope] = useState<'cases' | 'clients' | 'policies' | 'agents' | 'all'>('cases');
  const [query, setQuery] = useState('');
  const [scopeOpen, setScopeOpen] = useState(false);

  const scopeOptions = [
    { id: 'cases' as const, label: 'Cases' },
    { id: 'clients' as const, label: 'Clients' },
    { id: 'policies' as const, label: 'Policies' },
    { id: 'agents' as const, label: 'Agents' },
    { id: 'all' as const, label: 'All' },
  ];
  const activeScopeLabel = scopeOptions.find((o) => o.id === scope)?.label ?? 'Cases';

  useEffect(() => {
    if (!open) {
      setQuery('');
      setScopeOpen(false);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const isRecent = !q;
    const activeDataset = filterDatasetBySettings(getSystemDataset(dataSource.activeDatasetId), dataSource);
    if (scope !== 'cases' && scope !== 'all') {
      return [];
    }
    return listCaseSummaries(activeDataset)
      .filter((item) =>
        isRecent ||
        [item.id, item.title, item.primaryPartyName ?? item.claimant, item.status]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 12)
      .map((item) => toCaseSummarySearchResult(item));
  }, [dataSource, query, scope]);

  const handleSelect = (href: string) => {
    onOpenChange(false);
    navigate(href);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent layout="below-header" showCloseButton className="flex flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border-default px-4 py-3 text-left">
          <DialogTitle className="text-base">{t('mobileNav.search')}</DialogTitle>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 py-3">
          <div className="flex shrink-0 gap-2">
            <div className="relative w-[130px] shrink-0">
              <button
                type="button"
                onClick={() => setScopeOpen((p) => !p)}
                className="flex h-11 w-full items-center justify-between rounded-lg border border-border-default bg-white px-3 text-[14px] font-medium"
              >
                {activeScopeLabel}
                <ChevronDown className="size-4 text-text-secondary" />
              </button>
              {scopeOpen ? (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-border-default bg-white py-1 shadow-lg">
                  {scopeOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setScope(option.id);
                        setScopeOpen(false);
                      }}
                      className={`block w-full px-3 py-2.5 text-left text-[14px] ${
                        scope === option.id ? 'font-semibold text-brand-blue' : 'text-text-primary'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${activeScopeLabel.toLowerCase()}...`}
                className="h-11 w-full rounded-lg border border-border-default bg-white pl-3 pr-10 text-[15px] outline-none focus:border-brand-blue"
                autoFocus
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border-default bg-white">
            {!query.trim() ? (
              <div className="px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Recent {activeScopeLabel.toLowerCase()}
              </div>
            ) : null}
            {scope !== 'cases' && scope !== 'all' ? (
              <p className="px-4 py-6 text-center text-sm text-text-secondary">
                {t('mobileNav.searchCasesOnlyHint')}
              </p>
            ) : results.length > 0 ? (
              results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.href)}
                  className="flex w-full border-b border-border-default/60 px-4 py-3 text-left last:border-0 hover:bg-surface-muted"
                >
                  <CaseSearchOptionContent
                    caseId={item.caseId}
                    caseTypeLine={item.caseTypeLine}
                    status={item.status}
                  />
                </button>
              ))
            ) : (
              <p className="px-4 py-6 text-center text-sm text-text-muted">No matching cases.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
