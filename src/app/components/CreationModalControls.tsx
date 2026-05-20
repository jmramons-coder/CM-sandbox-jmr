import { useEffect, useMemo, useRef, useState, type ComponentProps, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { cn } from './ui/utils';
import {
  AgentSearchOptionContent,
  CaseSearchOptionContent,
  ClientListMeta,
  InitialsAvatar,
  ListOptionSubtitle,
  type ClientListMetaProps,
} from './ds';
import { LozengeTag } from './LozengeTag';
import { getStatusLozengeType, type AppStatusContext } from '../utils/status-display';
import { useViewportLayoutOptional } from '../contexts/ViewportLayoutContext';

const ROLE_FIELD_LABEL_CLASS = 'mb-1.5 block text-sm font-medium text-text-primary';

/** Selected entity chip height — aligns with client row (name + contact line + address). */
export const CREATION_SEARCH_SELECTED_MIN_HEIGHT_CLASS = 'min-h-[6.5rem]';

/** Grid for multiple linked-entity pickers so selected chips share one height. */
export const CREATION_LINKED_ENTITIES_GRID_CLASS =
  'grid gap-4 lg:grid-cols-2 lg:items-stretch [&>*]:h-full';
const ROLE_INPUT_CLASS =
  'h-10 w-full rounded-md border border-[#b7bbc2] bg-white px-3 text-left text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-brand-blue focus:ring-1 focus:ring-brand-blue disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted';
const ROLE_SELECT_TRIGGER_CLASS =
  'h-10 w-full min-w-0 max-w-full justify-start border-[#b7bbc2] bg-white text-left text-sm [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate';

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  avatarLabel?: string;
  metadata?: string[];
  /** Client listbox: date · email · phone, then address on its own row. */
  contactMeta?: ClientListMetaProps;
  /** Policy / entity listbox: single muted line under the title (e.g. product name). */
  subtitle?: string;
  /** Agent listbox: agency · email on row 2; status aligns right on row 1. */
  agentMeta?: { agency?: string; email?: string };
  status?: string;
  /** Drives `getStatusLozengeType` for the status lozenge (defaults to entityTable). */
  statusContext?: AppStatusContext;
};

function resolveClientContactMeta(option: SelectOption): ClientListMetaProps | null {
  if (option.contactMeta) return option.contactMeta;
  if (!option.avatarLabel) return null;
  const [email, phone, address] = option.metadata ?? [];
  return {
    date: option.description,
    email,
    phone,
    address,
  };
}

function resolveCaseListSubtitle(option: SelectOption): string | undefined {
  if (option.statusContext !== 'case') return undefined;
  if (option.subtitle?.trim()) {
    const line = option.subtitle.trim();
    return line === option.label ? undefined : line;
  }
  if (option.label !== option.value) {
    return option.label.trim();
  }
  if (option.description?.trim() && option.description !== option.value) {
    return option.description.trim();
  }
  return undefined;
}

function resolveOptionSubtitle(option: SelectOption): string | undefined {
  const caseSubtitle = resolveCaseListSubtitle(option);
  if (caseSubtitle) return caseSubtitle;
  if (option.subtitle?.trim()) {
    const line = option.subtitle.trim();
    return line === option.label ? undefined : line;
  }
  if (option.avatarLabel || option.contactMeta) return undefined;
  if (option.statusContext === 'entityTable' && option.metadata?.length) {
    const productLine = option.metadata.filter(Boolean).join(' · ');
    if (!productLine) return undefined;
    const idLikeDescription =
      option.description &&
      (option.description === option.value || /^[A-Z0-9][A-Z0-9-]*$/i.test(option.description));
    if (idLikeDescription) {
      return productLine === option.label ? undefined : productLine;
    }
  }
  return undefined;
}

function renderOptionSecondary(option: SelectOption) {
  const contactMeta = resolveClientContactMeta(option);
  if (contactMeta) {
    return <ClientListMeta {...contactMeta} />;
  }
  const caseSubtitle = resolveCaseListSubtitle(option);
  if (caseSubtitle) {
    return <ListOptionSubtitle text={caseSubtitle} />;
  }
  const subtitle = resolveOptionSubtitle(option);
  if (subtitle) {
    return <ListOptionSubtitle text={subtitle} />;
  }
  return (
    <OptionMeta values={[option.description, ...(option.metadata ?? [])].filter(Boolean) as string[]} />
  );
}

function showOptionValueColumn(option: SelectOption) {
  return option.value.trim() !== option.label.trim();
}

function OptionStatusLozenge({ option }: { option: SelectOption }) {
  if (!option.status) return null;
  const context = option.statusContext ?? 'entityTable';
  return (
    <LozengeTag
      label={option.status}
      type={getStatusLozengeType(option.status, context)}
      subtle
      size="compact"
      className="shrink-0"
    />
  );
}

export function CreationField({
  children,
  className,
  description,
  label,
  required = false,
}: {
  children: ReactNode;
  className?: string;
  description?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div className={cn('grid min-w-0 gap-1.5', className)}>
      <label className={ROLE_FIELD_LABEL_CLASS}>
        {label}
        {required ? <span className="ml-0.5 text-brand-red">*</span> : null}
      </label>
      {children}
      {description ? <p className="text-[11px] leading-snug text-text-muted">{description}</p> : null}
    </div>
  );
}

export function CreationInput({
  className,
  description,
  label,
  required,
  ...props
}: React.ComponentProps<'input'> & {
  description?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <CreationField label={label} description={description} required={required}>
      <input
        {...props}
        className={cn(
          ROLE_INPUT_CLASS,
          className,
        )}
      />
    </CreationField>
  );
}

export function CreationTextarea({
  description,
  label,
  required,
  ...props
}: React.ComponentProps<'textarea'> & {
  description?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <CreationField label={label} description={description} required={required}>
      <textarea
        {...props}
        className={cn(
          'min-h-[92px] w-full resize-y rounded-md border border-[#b7bbc2] bg-white px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-brand-blue focus:ring-1 focus:ring-brand-blue disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted',
          props.className,
        )}
      />
    </CreationField>
  );
}

export function CreationSelect({
  className,
  compactOptions = false,
  description,
  disabled,
  label,
  onValueChange,
  options,
  placeholder = 'Select an option',
  required,
  value,
}: {
  className?: string;
  /** When true, show only option labels (no inline description tags). */
  compactOptions?: boolean;
  description?: string;
  disabled?: boolean;
  label: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  const selectedOption = options.find((option) => option.value === value);
  const showInlineDescription = !compactOptions;

  return (
    <CreationField label={label} description={description} required={required} className={className}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={`${ROLE_SELECT_TRIGGER_CLASS} [&>svg]:ml-auto`}>
          {selectedOption ? (
            <span className="min-w-0 flex-1 truncate text-left">{selectedOption.label}</span>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent
          position="popper"
          className="z-[1120] max-w-[min(100vw-2rem,var(--radix-select-trigger-width))] rounded-md border border-border-default bg-white shadow-[0_12px_32px_rgba(27,28,30,0.16)]"
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="rounded-[4px] py-2 pl-2 pr-8 text-sm text-text-primary focus:bg-surface-selected focus:text-text-primary"
            >
              {showInlineDescription && option.description ? (
                <span className="flex min-w-0 w-full items-center gap-2">
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  <span className="ml-auto max-w-[45%] shrink truncate rounded-[4px] bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold lowercase leading-none text-text-secondary">
                    {option.description}
                  </span>
                </span>
              ) : (
                <span className="block min-w-0 truncate">{option.label}</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CreationField>
  );
}

function optionSearchText(option: SelectOption) {
  const contact = resolveClientContactMeta(option);
  return [
    option.value,
    option.label,
    option.description,
    option.status,
    ...(option.metadata ?? []),
    contact?.date,
    contact?.email,
    contact?.phone,
    contact?.address,
    option.subtitle,
    resolveOptionSubtitle(option),
    option.agentMeta?.agency,
    option.agentMeta?.email,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function OptionMeta({ values }: { values: string[] }) {
  if (!values.length) return null;
  return (
    <div className="mt-0.5 flex min-w-0 max-w-full items-center gap-1.5 overflow-hidden text-xs text-text-muted">
      {values.map((value, index) => (
        <span key={`${value}-${index}`} className="flex min-w-0 flex-[1_1_0] items-center gap-1.5 overflow-hidden">
          {index > 0 ? <span className="shrink-0 text-border-default">·</span> : null}
          <span className="min-w-0 truncate">{value}</span>
        </span>
      ))}
    </div>
  );
}

function CreationSearchOptionRow({
  option,
  onSelect,
}: {
  option: SelectOption;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={option.disabled}
      onClick={onSelect}
      className="relative flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
    >
      {option.agentMeta ? (
        <>
          <InitialsAvatar name={option.label} initials={option.avatarLabel} seed={option.value} size="md" />
          <AgentSearchOptionContent
            name={option.label}
            agency={option.agentMeta.agency}
            email={option.agentMeta.email}
            status={option.status}
          />
        </>
      ) : option.statusContext === 'case' ? (
        <CaseSearchOptionContent
          caseId={option.label}
          caseTypeLine={resolveCaseListSubtitle(option)}
          status={option.status}
        />
      ) : option.avatarLabel ? (
        <>
          <InitialsAvatar name={option.label} initials={option.avatarLabel} seed={option.value} size="md" />
          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-semibold text-text-primary">{option.label}</span>
              <OptionStatusLozenge option={option} />
            </span>
            {renderOptionSecondary(option)}
          </span>
        </>
      ) : (
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold text-text-primary">{option.label}</span>
            <OptionStatusLozenge option={option} />
          </span>
          {renderOptionSecondary(option)}
        </span>
      )}
      {showOptionValueColumn(option) ? (
        <span className="shrink-0 text-[10px] font-semibold text-text-muted/70">{option.value}</span>
      ) : null}
    </button>
  );
}

export function CreationSearchSelect({
  description,
  disabled,
  dropdownMinWidth = 420,
  label,
  onValueChange,
  options,
  placeholder = 'Search and select',
  recentLabel = 'Recent records',
  required,
  resultsLabel = 'Search results',
  value,
}: {
  description?: string;
  disabled?: boolean;
  dropdownMinWidth?: number;
  label: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  recentLabel?: string;
  required?: boolean;
  resultsLabel?: string;
  value: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? null;
  const isShowingRecent = query.trim().length === 0;
  const results = useMemo(() => {
    const terms = query
      .split(',')
      .map((term) => term.trim().toLowerCase())
      .filter(Boolean);
    if (!terms.length) return options.filter((option) => !option.disabled).slice(0, 6);
    return options.filter((option) => terms.every((term) => optionSearchText(option).includes(term)));
  }, [options, query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open || selected || disabled) return;
    const updatePosition = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewportPadding = 12;
      const width = Math.min(
        window.innerWidth - viewportPadding * 2,
        Math.max(rect.width, dropdownMinWidth),
      );
      const left = Math.min(
        Math.max(viewportPadding, rect.left),
        window.innerWidth - width - viewportPadding,
      );
      const availableBelow = window.innerHeight - rect.bottom - viewportPadding;
      const maxHeight = Math.max(220, Math.min(360, availableBelow));
      setDropdownStyle({
        left,
        top: rect.bottom + 4,
        width,
        maxHeight,
      });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [disabled, dropdownMinWidth, open, selected]);

  return (
    <CreationField label={label} description={description} required={required} className="h-full min-w-0">
      <div ref={containerRef} className="relative flex h-full min-h-0 min-w-0 flex-col">
        {selected ? (
          <div
            className={cn(
              'relative flex h-full w-full min-w-0 max-w-full items-start gap-3 overflow-hidden rounded-lg border border-border-default bg-white px-3 py-2.5',
              CREATION_SEARCH_SELECTED_MIN_HEIGHT_CLASS,
              showOptionValueColumn(selected) ? 'pr-[7.25rem]' : 'pr-10',
            )}
          >
            {showOptionValueColumn(selected) ? (
              <span className="absolute right-10 top-2 max-w-[72px] truncate text-[10px] font-semibold text-text-muted/70">
                {selected.value}
              </span>
            ) : null}
            {selected.avatarLabel ? (
              <InitialsAvatar name={selected.label} initials={selected.avatarLabel} seed={selected.value} size="sm" />
            ) : null}
            <div className="min-w-0 flex-1 overflow-hidden">
              {selected.agentMeta ? (
                <AgentSearchOptionContent
                  name={selected.label}
                  agency={selected.agentMeta.agency}
                  email={selected.agentMeta.email}
                  status={selected.status}
                />
              ) : selected.statusContext === 'case' ? (
                <CaseSearchOptionContent
                  caseId={selected.label}
                  caseTypeLine={resolveCaseListSubtitle(selected)}
                  status={selected.status}
                />
              ) : (
                <>
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-semibold text-text-primary">{selected.label}</p>
                    <OptionStatusLozenge option={selected} />
                  </div>
                  {renderOptionSecondary(selected)}
                </>
              )}
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                onValueChange('');
                setQuery('');
                setOpen(true);
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
              className="absolute right-2 top-2.5 rounded p-1 text-text-secondary hover:bg-surface-muted hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Clear ${label}`}
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              disabled={disabled}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className="h-10 w-full rounded-md border border-[#b7bbc2] bg-white pl-9 pr-9 text-left text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-brand-blue focus:ring-1 focus:ring-brand-blue disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setOpen(true);
                  inputRef.current?.focus();
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-secondary hover:text-text-primary"
                aria-label={`Clear ${label} search`}
              >
                <X className="size-4" />
              </button>
            ) : null}
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
          </div>
        )}

        {open && !disabled && !selected && dropdownStyle ? createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[1130] overflow-y-auto overscroll-contain rounded-lg border border-border-default bg-white shadow-[0_12px_32px_rgba(27,28,30,0.16)]"
            style={dropdownStyle}
          >
            <div className="px-4 pb-1.5 pt-2.5 text-[12px] font-medium text-text-muted">
              {isShowingRecent ? recentLabel : resultsLabel}
            </div>
            {results.length > 0 ? (
              results.map((option) => (
                <CreationSearchOptionRow
                  key={option.value}
                  option={option}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                    setQuery('');
                  }}
                />
              ))
            ) : (
              <div className="px-4 py-5 text-center text-[12px] text-text-muted">No records found.</div>
            )}
          </div>,
          document.body,
        ) : null}
      </div>
    </CreationField>
  );
}

export function CreationStepRail({
  activeStep,
  canNavigateToStep,
  maxReachableStep = activeStep,
  onStepChange,
  steps,
}: {
  activeStep: number;
  canNavigateToStep?: (step: number) => boolean;
  maxReachableStep?: number;
  onStepChange?: (step: number) => void;
  steps: string[];
}) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-border-default bg-white px-6 pb-3 pt-1">
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isComplete = index < activeStep;
        const isReachable = canNavigateToStep ? canNavigateToStep(index) : index <= maxReachableStep;
        const StepWrapper = onStepChange && isReachable && !isActive ? 'button' : 'div';
        return (
          <div key={step} className="flex min-w-0 items-center gap-2">
            <StepWrapper
              type={StepWrapper === 'button' ? 'button' : undefined}
              onClick={StepWrapper === 'button' ? () => onStepChange?.(index) : undefined}
              className={`flex min-w-0 items-center gap-2 rounded-full text-left ${
                StepWrapper === 'button' ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-blue/20' : ''
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  isComplete
                    ? 'bg-brand-blue text-white'
                    : isActive
                      ? 'border border-brand-blue bg-white text-brand-blue'
                      : 'border border-border-default bg-white text-text-muted'
                }`}
              >
                {isComplete ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span className={`truncate text-[12px] font-semibold ${isActive ? 'text-text-primary' : 'text-text-muted'}`}>
                {step}
              </span>
            </StepWrapper>
            {index < steps.length - 1 ? <span className="h-px w-6 bg-border-default" /> : null}
          </div>
        );
      })}
    </div>
  );
}

export const CREATION_SECONDARY_BUTTON_CLASS =
  'inline-flex items-center justify-center gap-1.5 rounded-full border border-border-default bg-white px-3 py-1.5 text-xs font-semibold leading-none text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50';

export function CreationSecondaryButton({
  className,
  ...props
}: ComponentProps<'button'>) {
  return (
    <button type="button" className={cn(CREATION_SECONDARY_BUTTON_CLASS, className)} {...props} />
  );
}

/** Matches `CreationFooter` divider — grey line under the modal title block. */
export const CREATION_MODAL_HEADER_CLASS =
  'shrink-0 border-b border-border-default bg-white px-6 pb-4 pt-5';

export function CreationModalBackdrop() {
  const { isCompactShell } = useViewportLayoutOptional();
  if (isCompactShell || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[1100] bg-black/35" aria-hidden="true" />,
    document.body,
  );
}

export function CreationFooter({
  canSubmit,
  isFirstStep = true,
  isLastStep = true,
  onBack,
  onCancel,
  onFlowBack,
  onNext,
  onSubmit,
  submitLabel,
}: {
  canSubmit: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  onBack?: () => void;
  onFlowBack?: () => void;
  onCancel: () => void;
  onNext?: () => void;
  onSubmit: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between border-t border-border-default bg-surface-primary px-6 py-4">
      <CreationSecondaryButton onClick={isFirstStep ? (onFlowBack ?? onCancel) : onBack}>
        {isFirstStep && onFlowBack ? 'Back' : isFirstStep ? 'Cancel' : 'Back'}
      </CreationSecondaryButton>
      {isLastStep ? (
        <Button
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
          className="rounded-full bg-brand-blue px-5 text-white hover:bg-brand-blue-hover"
        >
          {submitLabel}
        </Button>
      ) : (
        <Button type="button" disabled={!canSubmit} onClick={onNext} className="rounded-full bg-brand-blue px-5 text-white hover:bg-brand-blue-hover">
          Continue
        </Button>
      )}
    </div>
  );
}
