import { useTranslation } from 'react-i18next';
import { CreateCaseModal } from './CreateCaseModal';
import { CreateRequestModal } from './CreateRequestModal';
import { CreateTaskModal } from './CreateTaskModal';
import { CreateEntityPicker } from './creation/CreateEntityPicker';
import {
  CREATION_MODAL_HEADER_CLASS,
  CreationModalBackdrop,
} from './CreationModalControls';
import { RESPONSIVE_FORM_DIALOG_CLASS } from './responsiveDialog';
import type { GlobalCreateEntity } from '../contexts/GlobalCreateContext';
import type { DataSourceSettings } from '../domain/objectRefs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

type GlobalCreateFlowModalProps = {
  open: boolean;
  entity: GlobalCreateEntity | null;
  availableEntities: GlobalCreateEntity[];
  dataSource: DataSourceSettings;
  onOpenChange: (open: boolean) => void;
  onEntityChange: (entity: GlobalCreateEntity | null) => void;
  onCaseCreated: (input: { datasetId: string; caseId: string }) => void;
  onTaskCreated: (input: { datasetId: string; taskId: string }) => void;
  onRequestCreated: (input: { datasetId: string; requestId: string }) => void;
};

export function GlobalCreateFlowModal({
  open,
  entity,
  availableEntities,
  dataSource,
  onOpenChange,
  onEntityChange,
  onCaseCreated,
  onTaskCreated,
  onRequestCreated,
}: GlobalCreateFlowModalProps) {
  const { t } = useTranslation('nav');
  const showPicker = entity === null && availableEntities.length > 1;

  const handleOpenChange = (next: boolean) => {
    if (!next) onEntityChange(null);
    onOpenChange(next);
  };

  const handleFlowBack = () => onEntityChange(null);

  return (
    <Dialog modal={false} open={open} onOpenChange={handleOpenChange}>
      {open ? <CreationModalBackdrop /> : null}
      <DialogContent
        layout="auto"
        showCloseButton
        className={RESPONSIVE_FORM_DIALOG_CLASS}
      >
        {showPicker ? (
          <>
            <DialogHeader className={CREATION_MODAL_HEADER_CLASS}>
              <DialogTitle>{t('globalCreate.title')}</DialogTitle>
              <DialogDescription>{t('globalCreate.pickDescription')}</DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 lg:px-6">
              <CreateEntityPicker entities={availableEntities} onSelect={onEntityChange} />
            </div>
          </>
        ) : null}

        {entity === 'case' ? (
          <CreateCaseModal
            embedded
            open={open}
            dataSource={dataSource}
            onCreated={onCaseCreated}
            onOpenChange={handleOpenChange}
            onFlowBack={availableEntities.length > 1 ? handleFlowBack : undefined}
          />
        ) : null}

        {entity === 'task' ? (
          <CreateTaskModal
            embedded
            open={open}
            dataSource={dataSource}
            onCreated={onTaskCreated}
            onOpenChange={handleOpenChange}
            onFlowBack={availableEntities.length > 1 ? handleFlowBack : undefined}
          />
        ) : null}

        {entity === 'request' ? (
          <CreateRequestModal
            embedded
            open={open}
            dataSource={dataSource}
            onCreated={onRequestCreated}
            onOpenChange={handleOpenChange}
            onFlowBack={availableEntities.length > 1 ? handleFlowBack : undefined}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
