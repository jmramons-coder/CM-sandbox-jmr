import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { resolveDocumentPreviewUrl } from '../utils/sbli-document-assets';

type DocumentMiniPreviewThumbProps = {
  documentId: string;
  filename?: string;
  fileUrl?: string;
  fileAvailable?: boolean;
  pageImage?: string;
  className?: string;
};

function RestrictedPreviewPlaceholder() {
  return (
    <span className="flex h-full w-full items-center justify-center bg-[#e8eaed]">
      <Lock className="size-3.5 text-[#9aa0a6]" strokeWidth={2.25} aria-hidden />
    </span>
  );
}

/** Compact page thumbnail for document lists and table rows. */
export function DocumentMiniPreviewThumb({
  documentId,
  filename,
  fileUrl,
  fileAvailable,
  pageImage,
  className = '',
}: DocumentMiniPreviewThumbProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const previewUrl = resolveDocumentPreviewUrl({
    documentId,
    filename,
    fileUrl,
    fileAvailable,
    pageImage,
  });
  const restricted = fileAvailable === false || !previewUrl || imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [documentId, previewUrl]);

  return (
    <span
      className={`relative flex h-12 w-10 shrink-0 overflow-hidden rounded-[5px] border border-border-soft bg-[#f7f8fa] ${className}`}
      aria-label={restricted ? 'Document preview restricted' : undefined}
    >
      {restricted ? (
        <RestrictedPreviewPlaceholder />
      ) : (
        <img
          src={previewUrl}
          alt=""
          className="h-full w-full object-cover object-top"
          onError={() => setImageFailed(true)}
        />
      )}
    </span>
  );
}
