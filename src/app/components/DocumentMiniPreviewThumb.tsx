import { FileText } from 'lucide-react';
import { resolveDocumentPreviewUrl } from '../utils/sbli-document-assets';

type DocumentMiniPreviewThumbProps = {
  documentId: string;
  filename?: string;
  fileUrl?: string;
  fileAvailable?: boolean;
  pageImage?: string;
  className?: string;
};

/** Compact page thumbnail for document lists and table rows. */
export function DocumentMiniPreviewThumb({
  documentId,
  filename,
  fileUrl,
  fileAvailable,
  pageImage,
  className = '',
}: DocumentMiniPreviewThumbProps) {
  const previewUrl = resolveDocumentPreviewUrl({
    documentId,
    filename,
    fileUrl,
    fileAvailable,
    pageImage,
  });

  return (
    <span
      className={`relative flex h-12 w-10 shrink-0 overflow-hidden rounded-[5px] border border-border-soft bg-[#f7f8fa] ${className}`}
    >
      {previewUrl ? (
        <img src={previewUrl} alt="" className="h-full w-full object-cover object-top" />
      ) : (
        <span className="flex h-full w-full items-center justify-center">
          <FileText className="size-4 text-text-muted" aria-hidden />
        </span>
      )}
    </span>
  );
}
