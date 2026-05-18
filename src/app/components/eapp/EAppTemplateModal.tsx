import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  FileText,
  Heart,
  Layers,
  Search,
  Shield,
  Star,
  Users,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { EAPP_TEMPLATES, type EAppTemplate } from '../../data/mock-eapp';

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  'Life Insurance': Shield,
  Annuities: Wallet,
  'Health & Disability': Heart,
  'Group Benefits': Users,
};

const PRODUCT_ICONS: Record<string, typeof FileText> = {
  'Whole Life': Shield,
  'Term Life': FileText,
  'Universal Life': Layers,
  'Final Expense': Heart,
  'Fixed Annuity': Wallet,
  Disability: Heart,
  'Group Life': Users,
};

const ALL_CATEGORIES = [...new Set(EAPP_TEMPLATES.map((t) => t.category))];

export function EAppTemplateModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return EAPP_TEMPLATES.filter((t) => {
      const matchesCategory = !activeCategory || t.category === activeCategory;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.productType.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.carrier.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const selectedTemplate = EAPP_TEMPLATES.find((t) => t.id === selected);

  const handleStart = () => {
    if (!selected) return;
    const newId = `EA-${Date.now().toString(36).toUpperCase()}`;
    onOpenChange(false);
    setSearch('');
    setActiveCategory(null);
    setSelected(null);
    navigate(`/eapp/${newId}?template=${selected}`);
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearch('');
    setActiveCategory(null);
    setSelected(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex h-[600px] w-[720px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[720px]">
        {/* Count badge — top-right corner */}
        <span className="absolute right-12 top-5 z-[2] shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-text-secondary">
          {EAPP_TEMPLATES.length} templates
        </span>

        {/* Header */}
        <div className="shrink-0 px-6 pb-4 pt-5">
          <div>
            <DialogTitle className="text-[18px] font-semibold text-text-primary">
              Application Templates
            </DialogTitle>
            <p className="mt-0.5 text-[12px] text-text-secondary">
              Search and select a product template to start a new electronic application.
            </p>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, type, or carrier..."
              className="h-9 w-full rounded-lg border border-border-default bg-white pl-9 pr-3 text-[13px] text-text-primary outline-none placeholder:text-text-placeholder focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
            />
          </div>

          {/* Category pills */}
          <div className="mt-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                !activeCategory
                  ? 'bg-brand-blue text-white'
                  : 'bg-surface-muted text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              All
            </button>
            {ALL_CATEGORIES.map((cat) => {
              const CatIcon = CATEGORY_ICONS[cat] ?? FileText;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(isActive ? null : cat)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-blue text-white'
                      : 'bg-surface-muted text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
                >
                  <CatIcon className="size-3" />
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Template list */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Search className="size-8 text-text-placeholder" />
              <p className="text-[13px] font-medium text-text-secondary">No templates found</p>
              <p className="text-[11px] text-text-muted">
                Try adjusting your search or category filter.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 z-[1]">
                <tr className="bg-white text-[10px] font-semibold uppercase tracking-wider text-text-muted shadow-[inset_0_-1px_0_var(--color-border-default)]">
                  <th className="py-2 pl-6 pr-2 text-left">Template</th>
                  <th className="px-2 py-2 text-left">Category</th>
                  <th className="px-2 py-2 text-left">Steps</th>
                  <th className="px-2 py-2 text-left">Version</th>
                  <th className="py-2 pl-2 pr-6 text-right" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((tpl) => {
                  const isSelected = selected === tpl.id;
                  return (
                    <TemplateRow
                      key={tpl.id}
                      template={tpl}
                      isSelected={isSelected}
                      onSelect={() => setSelected(tpl.id)}
                    />
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border-default bg-surface-primary px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              {selectedTemplate ? (
                <p className="truncate text-[12px] text-text-secondary">
                  Selected:{' '}
                  <span className="font-semibold text-text-primary">{selectedTemplate.name}</span>
                  <span className="mx-1.5 text-text-muted">·</span>
                  {selectedTemplate.steps.length} steps
                </p>
              ) : (
                <p className="text-[12px] text-text-muted">Select a template to continue</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-border-default bg-white px-4 py-2 text-[12px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selected}
                onClick={handleStart}
                className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[12px] font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                Start application
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TemplateRow({
  template,
  isSelected,
  onSelect,
}: {
  template: EAppTemplate;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon = PRODUCT_ICONS[template.productType] ?? FileText;

  return (
    <tr
      onClick={onSelect}
      className={`cursor-pointer border-b border-border-default transition-colors ${
        isSelected ? 'bg-surface-selected' : 'bg-white hover:bg-surface-hover'
      }`}
    >
      {/* Template name + icon + description */}
      <td className="py-3 pl-6 pr-2">
        <div className="flex items-center gap-3">
          <Icon className={`size-5 shrink-0 transition-colors ${isSelected ? 'text-brand-blue' : 'text-text-muted'}`} strokeWidth={1.5} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-text-primary">{template.name}</span>
              {template.popular ? (
                <span className="flex items-center gap-0.5 text-[9px] font-semibold text-brand-amber">
                  <Star className="size-2.5 fill-current" />
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 line-clamp-1 text-[11px] text-text-muted">{template.description}</p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-2 py-3">
        <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
          isSelected
            ? 'border-brand-blue/25 bg-surface-selected text-brand-blue'
            : 'border-border-soft bg-surface-muted text-text-secondary'
        }`}>
          {template.category}
        </span>
      </td>

      {/* Steps */}
      <td className="px-2 py-3 text-[12px] text-text-secondary">{template.steps.length}</td>

      {/* Version */}
      <td className="px-2 py-3 text-[12px] text-text-muted">
        {template.version ? `v${template.version}` : '—'}
      </td>

      {/* Selection radio */}
      <td className="py-3 pl-2 pr-6 text-right">
        <div
          className={`ml-auto flex size-4 items-center justify-center rounded-full border-2 transition-colors ${
            isSelected ? 'border-brand-blue' : 'border-border-default bg-white'
          }`}
        >
          {isSelected ? <span className="block size-2 rounded-full bg-brand-blue" /> : null}
        </div>
      </td>
    </tr>
  );
}
