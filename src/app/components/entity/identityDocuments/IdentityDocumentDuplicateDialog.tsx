import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';

type IdentityDocumentDuplicateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceed: () => void;
};

export function IdentityDocumentDuplicateDialog({
  open,
  onOpenChange,
  onProceed,
}: IdentityDocumentDuplicateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Duplicate document</DialogTitle>
          <DialogDescription>
            A document of this type from the same jurisdiction with the same number already exists
            for this party. Do you wish to proceed?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-border-default px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onProceed();
              onOpenChange(false);
            }}
            className="rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-hover"
          >
            Proceed
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
