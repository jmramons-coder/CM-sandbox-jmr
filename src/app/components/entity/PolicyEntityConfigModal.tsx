import { useMemo, useRef, useState, type ReactNode } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type {
  EntityField,
  EntityFieldGridSection,
  EntityTableColumn,
  EntityTableSection,
  InfoSection,
} from '../../domain/entityFolders';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export type ConfigurableInfoSection = {
  section: InfoSection;
  visible: boolean;
  hiddenFieldIds?: string[];
  hiddenColumnKeys?: string[];
};

type FieldType = 'text' | 'number' | 'date' | 'list';

type EditableField = {
  id: string;
  label: string;
  type: FieldType;
  value: string;
  options: string;
  visible: boolean;
};

type EditableSection = {
  id: string;
  visible: boolean;
  kind: InfoSection['kind'];
  title: string;
  originalSection: InfoSection;
  fields: EditableField[];
};

type DropTarget = {
  id: string;
  position: 'before' | 'after';
};

const emptyEditableField: EditableField = {
  id: '',
  label: '',
  type: 'text',
  value: '',
  options: '',
  visible: true,
};

export function PolicyEntityConfigModal({
  open,
  sections,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  sections: ConfigurableInfoSection[];
  onOpenChange: (open: boolean) => void;
  onSave: (sections: ConfigurableInfoSection[]) => void;
}) {
  const { t } = useTranslation('folders');
  const [draftSections, setDraftSections] = useState<EditableSection[]>(() => toEditableSections(sections));
  const [selectedSectionId, setSelectedSectionId] = useState(() => sections[0]?.section.id ?? '');
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [sectionDropTarget, setSectionDropTarget] = useState<DropTarget | null>(null);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [fieldDropTarget, setFieldDropTarget] = useState<DropTarget | null>(null);
  const sectionsListRef = useRef<HTMLDivElement | null>(null);

  const selectedSection = useMemo(
    () => draftSections.find((section) => section.id === selectedSectionId) ?? draftSections[0],
    [draftSections, selectedSectionId],
  );

  const canEditFields = selectedSection?.kind === 'fieldGrid' || selectedSection?.kind === 'tableSection';
  const isTableSection = selectedSection?.kind === 'tableSection';

  const savedSections = useMemo(
    () => draftSections.map(toConfigurableSection),
    [draftSections],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const nextSections = toEditableSections(sections);
      setDraftSections(nextSections);
      setSelectedSectionId(nextSections[0]?.id ?? '');
    }
    onOpenChange(nextOpen);
  };

  const addSection = () => {
    const id = `custom-${Date.now().toString(36)}`;
    setDraftSections((prev) => [...prev, createEditableFieldGridSection(id, t('entity.config.newSectionDefault'))]);
    setSelectedSectionId(id);
    window.requestAnimationFrame(() => {
      sectionsListRef.current?.scrollTo({
        top: sectionsListRef.current.scrollHeight,
        behavior: 'smooth',
      });
    });
  };

  const updateSelectedSection = (updates: Partial<EditableSection>) => {
    setDraftSections((prev) =>
      prev.map((section) => (section.id === selectedSection?.id ? { ...section, ...updates } : section)),
    );
  };

  const updateSectionDropTarget = (targetSectionId: string) => {
    if (!draggedSectionId) return;
    setSectionDropTarget(
      getDropTarget(draftSections, draggedSectionId, targetSectionId, (section) => section.id),
    );
  };

  const reorderSection = (target: DropTarget | null) => {
    if (!draggedSectionId || !target) return;
    setDraftSections((prev) => {
      return moveItemToDropTarget(prev, draggedSectionId, target, (section) => section.id);
    });
    setDraggedSectionId(null);
    setSectionDropTarget(null);
  };

  const updateField = (fieldId: string, updates: Partial<EditableField>) => {
    if (!selectedSection) return;
    setDraftSections((prev) =>
      prev.map((section) => {
        if (section.id !== selectedSection.id) return section;
        return {
          ...section,
          fields: section.fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
        };
      }),
    );
  };

  const addField = () => {
    if (!selectedSection || !canEditFields) return;
    const fieldId = `${isTableSection ? 'custom-column' : 'custom-field'}-${Date.now().toString(36)}`;
    updateSelectedSection({
      fields: [
        ...selectedSection.fields,
        {
          ...emptyEditableField,
          id: fieldId,
          label: t('entity.config.newFieldLabel'),
        },
      ],
    });
  };

  const removeField = (fieldId: string) => {
    if (!selectedSection) return;
    updateSelectedSection({
      fields: selectedSection.fields.filter((field) => field.id !== fieldId),
    });
  };

  const updateFieldDropTarget = (targetFieldId: string) => {
    if (!selectedSection || !draggedFieldId) return;
    setFieldDropTarget(
      getDropTarget(selectedSection.fields, draggedFieldId, targetFieldId, (field) => field.id),
    );
  };

  const reorderField = (target: DropTarget | null) => {
    if (!selectedSection || !draggedFieldId || !target) return;
    updateSelectedSection({
      fields: moveItemToDropTarget(selectedSection.fields, draggedFieldId, target, (field) => field.id),
    });
    setDraggedFieldId(null);
    setFieldDropTarget(null);
  };

  const save = () => {
    onSave(savedSections);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="!flex h-[min(780px,calc(100vh-48px))] !w-[calc(100vw-48px)] !max-w-[1240px] !gap-0 flex-col overflow-hidden bg-white p-0 sm:!max-w-[1240px]">
        <DialogHeader className="border-b border-border-default px-6 py-5">
          <DialogTitle>{t('entity.config.title')}</DialogTitle>
          <DialogDescription>{t('entity.config.description')}</DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)] gap-0 overflow-hidden lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col border-r border-border-default bg-surface-primary">
            <div ref={sectionsListRef} className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {draftSections.map((section) => {
                  const selected = section.id === selectedSection?.id;
                  const showPlaceholderBefore =
                    sectionDropTarget?.id === section.id && sectionDropTarget.position === 'before';
                  const showPlaceholderAfter =
                    sectionDropTarget?.id === section.id && sectionDropTarget.position === 'after';
                  return (
                    <div key={section.id}>
                      {showPlaceholderBefore ? (
                        <DropPlaceholder
                          className="h-[58px]"
                          onDragOver={() => updateSectionDropTarget(section.id)}
                          onDrop={() => reorderSection(sectionDropTarget)}
                        />
                      ) : null}
                      <div
                        role="button"
                        tabIndex={0}
                        draggable
                        onDragStart={() => setDraggedSectionId(section.id)}
                        onDragOver={(event) => {
                          event.preventDefault();
                          updateSectionDropTarget(section.id);
                        }}
                        onDrop={() => reorderSection(sectionDropTarget)}
                        onDragEnd={() => {
                          setDraggedSectionId(null);
                          setSectionDropTarget(null);
                        }}
                        onClick={() => setSelectedSectionId(section.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedSectionId(section.id);
                          }
                        }}
                        className={`w-full rounded-xl border p-3 text-left transition-colors ${
                          draggedSectionId === section.id
                            ? 'border-border-default bg-white opacity-45'
                            : selected
                              ? 'border-brand-blue/50 bg-brand-blue/10'
                              : 'border-border-default bg-white hover:border-brand-blue/30 hover:bg-surface-selected'
                        }`}
                      >
                        <span className="flex items-start gap-3">
                          <GripVertical className="mt-0.5 size-4 shrink-0 cursor-grab text-text-muted active:cursor-grabbing" />
                          <span
                            role="checkbox"
                            aria-checked={section.visible}
                            tabIndex={-1}
                            onClick={(event) => {
                              event.stopPropagation();
                              setDraftSections((prev) =>
                                prev.map((item) =>
                                  item.id === section.id ? { ...item, visible: !item.visible } : item,
                                ),
                              );
                            }}
                            className="mt-0.5"
                          >
                            <Checkbox checked={section.visible} tabIndex={-1} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-text-primary">{section.title}</span>
                            <span className="text-xs text-text-muted">
                              {t(`entity.config.sectionKinds.${section.kind}` as never)}
                            </span>
                          </span>
                        </span>
                      </div>
                      {showPlaceholderAfter ? (
                        <DropPlaceholder
                          className="mt-2 h-[58px]"
                          onDragOver={() => updateSectionDropTarget(section.id)}
                          onDrop={() => reorderSection(sectionDropTarget)}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-border-default bg-white p-4">
              <button
                type="button"
                onClick={addSection}
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-brand-blue/40 px-3 text-xs font-semibold text-brand-blue transition-colors hover:bg-surface-selected"
              >
                <Plus className="size-3.5" />
                {t('entity.config.addSection')}
              </button>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col overflow-hidden">
            {selectedSection ? (
              <>
                <div className="border-b border-border-default bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <label className="mb-1.5 block text-sm font-medium text-text-primary">
                        {t('entity.config.sectionName')}
                      </label>
                      <input
                        value={selectedSection.title}
                        onChange={(event) => updateSelectedSection({ title: event.target.value })}
                        className="h-10 w-full max-w-[520px] rounded-md border border-[#b7bbc2] bg-white px-3 text-sm font-semibold outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                  {canEditFields ? (
                    <div>
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-text-primary">{t('entity.config.fields')}</h3>
                          <p className="mt-1 text-xs leading-5 text-text-muted">{t('entity.config.fieldsHelp')}</p>
                        </div>
                        <button
                          type="button"
                          onClick={addField}
                          className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-hover"
                        >
                          <Plus className="size-3.5" />
                          {t('entity.config.addColumn')}
                        </button>
                      </div>

                      <div className="space-y-3">
                        {selectedSection.fields.length > 0 ? (
                          selectedSection.fields.map((field) => {
                            const showPlaceholderBefore =
                              fieldDropTarget?.id === field.id && fieldDropTarget.position === 'before';
                            const showPlaceholderAfter =
                              fieldDropTarget?.id === field.id && fieldDropTarget.position === 'after';
                            return (
                            <div key={field.id}>
                              {showPlaceholderBefore ? (
                                <DropPlaceholder
                                  className="h-[76px]"
                                  onDragOver={() => updateFieldDropTarget(field.id)}
                                  onDrop={() => reorderField(fieldDropTarget)}
                                />
                              ) : null}
                              <FieldEditorRow
                                field={field}
                                isTableSection={isTableSection}
                                dragging={draggedFieldId === field.id}
                                onUpdate={(updates) => updateField(field.id, updates)}
                                onRemove={() => removeField(field.id)}
                                onDragStart={() => setDraggedFieldId(field.id)}
                                onDragOver={() => updateFieldDropTarget(field.id)}
                                onDrop={() => reorderField(fieldDropTarget)}
                                onDragEnd={() => {
                                  setDraggedFieldId(null);
                                  setFieldDropTarget(null);
                                }}
                              />
                              {showPlaceholderAfter ? (
                                <DropPlaceholder
                                  className="mt-2 h-[76px]"
                                  onDragOver={() => updateFieldDropTarget(field.id)}
                                  onDrop={() => reorderField(fieldDropTarget)}
                                />
                              ) : null}
                            </div>
                            );
                          })
                        ) : (
                          <div className="rounded-lg border border-dashed border-border-default bg-surface-primary p-10 text-center text-sm text-text-muted">
                            {t('entity.config.emptyFields')}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border-default bg-surface-primary p-10 text-center text-sm text-text-muted">
                      {t('entity.config.nonFieldGrid')}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </section>
        </div>

        <DialogFooter className="border-t border-border-default bg-white px-6 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
          >
            {t('entity.config.cancel')}
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-brand-blue px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-hover"
          >
            {t('entity.config.save')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FieldEditorRow({
  field,
  isTableSection,
  dragging,
  onUpdate,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  field: EditableField;
  isTableSection: boolean;
  dragging: boolean;
  onUpdate: (updates: Partial<EditableField>) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const { t } = useTranslation('folders');

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`rounded-xl border border-border-default bg-white p-4 shadow-sm ${dragging ? 'opacity-45' : ''}`}
    >
      <div className="grid grid-cols-[24px_minmax(0,1fr)_150px] gap-3">
        <GripVertical className="mt-8 size-4 cursor-grab text-text-muted active:cursor-grabbing" />
        <div className="grid grid-cols-12 gap-3">
        <div className={isTableSection ? 'col-span-12' : 'col-span-12 md:col-span-4'}>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">{t('entity.config.columnLabel')}</label>
          <input
            value={field.label}
            onChange={(event) => onUpdate({ label: event.target.value })}
            className="h-9 w-full rounded-md border border-[#b7bbc2] bg-white px-3 text-sm outline-none disabled:bg-surface-primary disabled:text-text-muted focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
            disabled={!field.visible}
          />
        </div>
        {!isTableSection ? (
          <>
            <div className="col-span-6 md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-text-muted">{t('entity.config.fieldType')}</label>
              <Select
                value={field.type}
                disabled={!field.visible}
                onValueChange={(value) => onUpdate({ type: value as FieldType })}
              >
                <SelectTrigger className="h-9 border-[#b7bbc2] bg-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">{t('entity.config.fieldTypes.text')}</SelectItem>
                  <SelectItem value="number">{t('entity.config.fieldTypes.number')}</SelectItem>
                  <SelectItem value="date">{t('entity.config.fieldTypes.date')}</SelectItem>
                  <SelectItem value="list">{t('entity.config.fieldTypes.list')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-6 md:col-span-3">
              <label className="mb-1.5 block text-xs font-medium text-text-muted">{t('entity.config.fieldValue')}</label>
              <input
                type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                value={field.value}
                onChange={(event) => onUpdate({ value: event.target.value })}
                className="h-9 w-full rounded-md border border-[#b7bbc2] bg-white px-3 text-sm outline-none disabled:bg-surface-primary disabled:text-text-muted focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                disabled={!field.visible}
              />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="mb-1.5 block text-xs font-medium text-text-muted">{t('entity.config.listValues')}</label>
              <input
                value={field.options}
                onChange={(event) => onUpdate({ options: event.target.value })}
                disabled={!field.visible || field.type !== 'list'}
                placeholder={t('entity.config.listPlaceholder')}
                className="h-9 w-full rounded-md border border-[#b7bbc2] bg-white px-3 text-sm outline-none placeholder:text-text-muted disabled:bg-surface-primary disabled:text-text-muted focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              />
            </div>
          </>
        ) : null}
        </div>
        <div className="flex items-center justify-end gap-2">
          <label className="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-primary px-3 py-2 text-xs font-semibold text-text-primary">
            <Checkbox
              checked={field.visible}
              onCheckedChange={(checked) => onUpdate({ visible: checked === true })}
            />
            {t('entity.config.showColumn')}
          </label>
          <IconButton label={t('entity.config.removeField')} onClick={onRemove} destructive>
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function DropPlaceholder({
  className = '',
  onDragOver,
  onDrop,
}: {
  className?: string;
  onDragOver: () => void;
  onDrop: () => void;
}) {
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      className={`mb-2 rounded-xl border border-dashed border-border-default bg-[#eef0f2] ${className}`}
    />
  );
}

function IconButton({
  label,
  disabled,
  destructive,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  destructive?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        destructive
          ? 'border-brand-red/30 text-brand-red hover:bg-brand-red/10'
          : 'border-border-default text-text-secondary hover:border-brand-blue/40 hover:bg-surface-selected hover:text-brand-blue'
      }`}
    >
      {children}
    </button>
  );
}

function toEditableSections(sections: ConfigurableInfoSection[]): EditableSection[] {
  return sections.map((entry) => ({
    id: entry.section.id,
    visible: entry.visible,
    kind: entry.section.kind,
    title: entry.section.title,
    originalSection: entry.section,
    fields: entry.section.kind === 'fieldGrid'
      ? entry.section.fields.map((field, index) => toEditableField(field, index, entry.hiddenFieldIds))
      : entry.section.kind === 'tableSection'
        ? entry.section.columns.map((column) => toEditableColumn(column, entry.hiddenColumnKeys))
        : [],
  }));
}

function toEditableField(field: EntityField, index: number, hiddenFieldIds: string[] = []): EditableField {
  const value = field.value == null ? '' : String(field.value);
  const id = field.id ?? `field-${index}-${field.label.toLowerCase().replace(/\W+/g, '-')}`;
  return {
    id,
    label: field.label,
    type: inferFieldType(field.value),
    value,
    options: '',
    visible: !hiddenFieldIds.includes(id),
  };
}

function toEditableColumn(column: EntityTableColumn, hiddenColumnKeys: string[] = []): EditableField {
  return {
    ...emptyEditableField,
    id: column.key,
    label: column.label,
    visible: !hiddenColumnKeys.includes(column.key),
  };
}

function createEditableFieldGridSection(id: string, title: string): EditableSection {
  const section: EntityFieldGridSection = {
    kind: 'fieldGrid',
    id,
    title,
    layout: 'grid-2',
    fields: [],
  };
  return {
    id,
    visible: true,
    kind: 'fieldGrid',
    title,
    originalSection: section,
    fields: [],
  };
}

function toConfigurableSection(section: EditableSection): ConfigurableInfoSection {
  if (section.kind === 'fieldGrid') {
    const original = section.originalSection as EntityFieldGridSection;
    return {
      visible: section.visible,
      hiddenFieldIds: section.fields.filter((field) => !field.visible).map((field) => field.id),
      section: {
        ...original,
        title: section.title,
        fields: section.fields.map(toEntityField),
      },
    };
  }
  if (section.kind === 'tableSection') {
    const original = section.originalSection as EntityTableSection;
    return {
      visible: section.visible,
      hiddenColumnKeys: section.fields.filter((field) => !field.visible).map((field) => field.id),
      section: {
        ...original,
        title: section.title,
        columns: section.fields.map((field) => toEntityTableColumn(field, original.columns)),
        rows: original.rows.map((row) => ({
          ...row,
          cells: section.fields.reduce<Record<string, ReactNode>>((cells, field) => {
            cells[field.id] = row.cells[field.id] ?? null;
            return cells;
          }, {}),
        })),
      },
    };
  }
  return {
    visible: section.visible,
    section: {
      ...section.originalSection,
      title: section.title,
    } as InfoSection,
  };
}

function toEntityTableColumn(field: EditableField, originalColumns: EntityTableColumn[]): EntityTableColumn {
  const original = originalColumns.find((column) => column.key === field.id);
  return {
    ...(original ?? {}),
    key: field.id,
    label: field.label.trim() || '-',
  };
}

function toEntityField(field: EditableField): EntityField {
  return {
    id: field.id,
    label: field.label.trim() || '-',
    value: resolveFieldValue(field),
  };
}

function resolveFieldValue(field: EditableField) {
  if (field.type === 'number') {
    const value = Number(field.value);
    return Number.isFinite(value) ? value : field.value;
  }
  if (field.type === 'list') {
    return field.options
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .join(', ');
  }
  return field.value.trim() || null;
}

function inferFieldType(value: EntityField['value']): FieldType {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return 'date';
  return 'text';
}

function getDropTarget<T>(
  items: T[],
  draggedId: string,
  targetId: string,
  getId: (item: T) => string,
): DropTarget | null {
  if (draggedId === targetId) return null;
  const draggedIndex = items.findIndex((item) => getId(item) === draggedId);
  const targetIndex = items.findIndex((item) => getId(item) === targetId);
  if (draggedIndex < 0 || targetIndex < 0) return null;
  return {
    id: targetId,
    position: targetIndex > draggedIndex ? 'after' : 'before',
  };
}

function moveItemToDropTarget<T>(
  items: T[],
  draggedId: string,
  target: DropTarget,
  getId: (item: T) => string,
): T[] {
  if (draggedId === target.id) return items;
  const draggedItem = items.find((item) => getId(item) === draggedId);
  if (!draggedItem) return items;
  const remaining = items.filter((item) => getId(item) !== draggedId);
  const targetIndex = remaining.findIndex((item) => getId(item) === target.id);
  if (targetIndex < 0) return items;
  const next = [...remaining];
  next.splice(target.position === 'after' ? targetIndex + 1 : targetIndex, 0, draggedItem);
  return next;
}
