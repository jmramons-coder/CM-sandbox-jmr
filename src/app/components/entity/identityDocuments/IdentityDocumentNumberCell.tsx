import { useEffect, useState } from 'react';
import {
  decryptDocumentNumber,
  MASKED_DOCUMENT_NUMBER_DISPLAY,
} from '../../../utils/identityDocumentCrypto';
import { logUnmask } from '../../../data/identityDocumentsRepository';

type IdentityDocumentNumberCellProps = {
  documentId: string;
  partyId: string;
  documentType: string;
  documentNumberEncrypted: string;
  isUnmasked: boolean;
  onUnmaskChange: (documentId: string, unmasked: boolean) => void;
  unmaskTimeoutMs: number;
  userId: string;
};

export function IdentityDocumentNumberCell({
  documentId,
  partyId,
  documentType,
  documentNumberEncrypted,
  isUnmasked,
  onUnmaskChange,
  unmaskTimeoutMs,
  userId,
}: IdentityDocumentNumberCellProps) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!isUnmasked) {
      setSecondsLeft(null);
      return undefined;
    }
    logUnmask(partyId, documentId, documentType, userId);
    const totalSec = Math.ceil(unmaskTimeoutMs / 1000);
    setSecondsLeft(totalSec);
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          onUnmaskChange(documentId, false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    const timeout = window.setTimeout(() => {
      onUnmaskChange(documentId, false);
    }, unmaskTimeoutMs);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [isUnmasked, documentId, partyId, documentType, userId, unmaskTimeoutMs, onUnmaskChange]);

  if (!isUnmasked) {
    return (
      <span className="font-mono text-[13px] tracking-wider text-text-primary">
        {MASKED_DOCUMENT_NUMBER_DISPLAY}
      </span>
    );
  }

  const plain = decryptDocumentNumber(documentNumberEncrypted);
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-mono text-[13px] text-text-primary">{plain || '—'}</span>
      {secondsLeft !== null ? (
        <span className="text-[10px] font-semibold tabular-nums text-text-muted">
          {secondsLeft}s
        </span>
      ) : null}
    </span>
  );
}
