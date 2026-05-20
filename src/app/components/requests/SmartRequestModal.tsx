import { useCallback, useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import {
  ArrowUpFromLine,
  FileSearch,
  FileText,
  Inbox,
  ListChecks,
  Mail,
  Tags,
  Upload,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { CreationModalBackdrop } from '../CreationModalControls';
import { RESPONSIVE_WIDE_FORM_DIALOG_CLASS } from '../responsiveDialog';
import {
  SmartRequestUploadPreview,
  type SmartRequestUploadedFile,
} from './SmartRequestUploadPreview';

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.eml,.msg';
const MAX_FILE_MB = 25;

const UPLOAD_ACCEPTED_HINT = 'Request forms, client emails, PDFs, images, and scans';

const SMART_INTAKE_FEATURES = [
  {
    icon: Upload,
    title: 'Upload documents & forms',
    text: 'Drop PDFs, scans, and completed request forms—single files or multiple sources in one intake.',
  },
  {
    icon: Mail,
    title: 'Include client emails',
    text: 'Forward or upload email threads so context, attachments, and client intent stay with the request.',
  },
  {
    icon: Tags,
    title: 'Classify the request',
    text: 'Detect address changes, beneficiary updates, payment changes, and other service categories automatically.',
  },
  {
    icon: ListChecks,
    title: 'Draft the intake package',
    text: 'Propose the service request, linked case, requirements, and follow-up tasks from what was uploaded.',
  },
] as const;

const SMART_REQUEST_MODAL_SIZE_CLASS =
  'z-[1110] !flex h-[min(860px,calc(100vh-2rem))] max-h-[min(860px,calc(100vh-2rem))] w-[min(1240px,calc(100vw-2rem))] min-w-0 max-w-[min(1240px,calc(100vw-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(1240px,calc(100vw-2rem))]';

function classifyUploadFile(file: File): SmartRequestUploadedFile['kind'] {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf') return 'pdf';
  return 'other';
}

function fileToUploadedItem(file: File): SmartRequestUploadedFile {
  const kind = classifyUploadFile(file);
  const previewUrl = kind === 'image' || kind === 'pdf' ? URL.createObjectURL(file) : null;
  return {
    id: `upload-${crypto.randomUUID()}`,
    name: file.name,
    mimeType: file.type,
    previewUrl,
    kind,
  };
}

export function SmartRequestModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const uploadInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFiles, setUploadedFiles] = useState<SmartRequestUploadedFile[]>([]);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  const revokePreviewUrl = useCallback((url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  }, []);

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter((file) => {
      if (file.size <= MAX_FILE_MB * 1024 * 1024) return true;
      window.alert(`${file.name} exceeds ${MAX_FILE_MB}MB and was skipped.`);
      return false;
    });
    if (!valid.length) return;
    const items = valid.map(fileToUploadedItem);
    setUploadedFiles((prev) => [...prev, ...items]);
    setActiveUploadId((current) => current ?? items[0]?.id ?? null);
  }, []);

  const removeFile = useCallback(
    (id: string) => {
      setUploadedFiles((prev) => {
        const target = prev.find((file) => file.id === id);
        revokePreviewUrl(target?.previewUrl ?? null);
        const next = prev.filter((file) => file.id !== id);
        setActiveUploadId((active) => (active === id ? next[0]?.id ?? null : active));
        return next;
      });
    },
    [revokePreviewUrl],
  );

  const reset = useCallback(() => {
    setUploadedFiles((prev) => {
      prev.forEach((file) => revokePreviewUrl(file.previewUrl));
      return [];
    });
    setActiveUploadId(null);
  }, [revokePreviewUrl]);

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const list = event.target.files ? Array.from(event.target.files) : [];
    if (list.length) addFiles(list);
    event.target.value = '';
  };

  const onUploadDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const list = Array.from(event.dataTransfer.files ?? []);
    if (list.length) addFiles(list);
  };

  const showUploadEmpty = uploadedFiles.length === 0;
  const showUploadDocument = uploadedFiles.length > 0;
  const canAnalyze = uploadedFiles.length > 0;

  return (
    <Dialog modal={false} open={open} onOpenChange={handleOpenChange}>
      {open ? <CreationModalBackdrop /> : null}
      <DialogContent layout="auto" className={RESPONSIVE_WIDE_FORM_DIALOG_CLASS}>
        <DialogHeader className="shrink-0 gap-0 border-b border-border-default bg-white px-6 pb-4 pt-5">
          <div className="flex items-start gap-2">
            <Inbox className="mt-1 size-5 shrink-0 text-text-muted" aria-hidden />
            <div className="min-w-0 max-w-2xl">
              <DialogTitle className="text-xl leading-tight">Smart Request</DialogTitle>
              <DialogDescription className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                Upload source documents for AI-assisted intake. Our intelligence layer can propose the request,
                linked case, requirements, and follow-up tasks.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <input
          ref={fileInputRef}
          id={uploadInputId}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          className="sr-only"
          onChange={onFileChange}
        />

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <section
            className={`flex min-h-0 min-w-0 flex-1 flex-col lg:border-r lg:border-border-default ${
              showUploadDocument ? 'overflow-hidden' : 'border-b border-border-default lg:border-b-0'
            }`}
          >
            <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-border-default px-4 py-3">
              <div className="flex min-w-0 items-start gap-2">
                <Upload className="mt-0.5 size-4 shrink-0 text-text-secondary" aria-hidden />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-text-primary">Upload source</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
                    Add request forms, client emails, or supporting files for AI parsing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-default bg-white px-3 py-1.5 text-[11px] font-semibold text-text-secondary hover:bg-surface-muted"
              >
                <Upload className="size-3.5" />
                Add files
              </button>
            </div>

            <div
              className={`relative flex min-h-0 flex-1 flex-col ${
                showUploadDocument
                  ? 'overflow-hidden bg-white'
                  : 'app-scrollbar overflow-y-auto bg-surface-primary p-4'
              }`}
            >
              {showUploadEmpty ? (
                <div
                  className="flex h-full min-h-[420px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border-default bg-white px-6 py-10 text-center transition-colors hover:border-brand-blue/40 hover:bg-surface-selected/30"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onDrop={onUploadDrop}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="relative mb-4">
                    <FileText className="size-12 text-text-muted/40" />
                    <span className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-brand-blue text-white shadow-sm">
                      <ArrowUpFromLine className="size-4" />
                    </span>
                  </div>
                  <p className="text-[14px] font-semibold text-text-primary">Drop files here or click to upload</p>
                  <p className="mt-2 max-w-md text-[12px] leading-relaxed text-text-secondary">{UPLOAD_ACCEPTED_HINT}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-[12px] font-semibold text-white hover:bg-brand-blue-hover"
                  >
                    <Upload className="size-4" />
                    Upload
                  </button>
                  <p className="mt-3 text-[10px] text-text-muted">
                    PDF, DOCX, DOC, PNG, JPG, EML (max {MAX_FILE_MB}MB)
                  </p>
                </div>
              ) : null}

              {showUploadDocument ? (
                <SmartRequestUploadPreview
                  files={uploadedFiles}
                  activeFileId={activeUploadId}
                  onSelect={setActiveUploadId}
                  onRemove={removeFile}
                  onAddMore={() => fileInputRef.current?.click()}
                />
              ) : null}
            </div>
          </section>

          <section className="flex min-h-0 w-full flex-col bg-white lg:w-[380px] lg:shrink-0">
            <div className="shrink-0 px-4 py-3">
              <p className="text-[13px] font-semibold text-text-primary">Smart intake</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
                Turn uploaded sources into structured service requests.
              </p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-4 pb-0">
              <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto">
                <p className="text-[12px] leading-relaxed text-text-secondary">
                  Upload request forms, client emails, PDFs, and scans to create intake-ready service requests.
                  AI reads the content, identifies the request type, and helps you link cases, requirements, and
                  tasks—without manual re-keying.
                </p>
                <ul className="mt-4 space-y-3">
                  {SMART_INTAKE_FEATURES.map((item) => (
                    <li key={item.title} className="flex gap-3 rounded-lg border border-border-soft p-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-brand-blue">
                        <item.icon className="size-4" />
                      </span>
                      <div>
                        <p className="text-[12px] font-semibold text-text-primary">{item.title}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="shrink-0 space-y-2 py-3">
                <button
                  type="button"
                  disabled={!canAnalyze}
                  onClick={() => undefined}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-brand-blue-hover disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <FileSearch className="size-4" />
                  Analyze
                </button>
                <p className="text-center text-[10px] font-medium uppercase tracking-wide text-text-muted">
                  Feature under construction
                </p>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** @deprecated Use SmartRequestModal */
export const SmartUploadModal = SmartRequestModal;
