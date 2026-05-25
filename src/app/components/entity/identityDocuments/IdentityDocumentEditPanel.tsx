import type { IdentityDocumentRecord } from '../../../domain/identityDocuments';
import { MASKED_DOCUMENT_NUMBER_DISPLAY } from '../../../utils/identityDocumentCrypto';
import { Input } from '../../ui/input';
import {
  IdentityDocumentFormField,
  IdentityDocumentReadonlyField,
  IDENTITY_DOCUMENT_FORM_GRID,
} from './IdentityDocumentFormField';

type IdentityDocumentEditPanelProps = {
  record: IdentityDocumentRecord;
  additionalInformation: string;
  onAdditionalInformationChange: (value: string) => void;
};

export function IdentityDocumentEditPanel({
  record,
  additionalInformation,
  onAdditionalInformationChange,
}: IdentityDocumentEditPanelProps) {
  return (
    <div>
      <p className="mb-4 text-[12px] leading-relaxed text-text-secondary">
        Only Additional Information can be updated. To correct any other field, please delete this
        record and add a new one.
      </p>
      <div className="rounded-lg border border-border-soft bg-white p-4">
        <div className={IDENTITY_DOCUMENT_FORM_GRID}>
          <IdentityDocumentReadonlyField label="Document type" value={record.documentType} />
          <IdentityDocumentReadonlyField
            label="Issuing jurisdiction"
            value={record.issuingJurisdiction}
          />
          <IdentityDocumentReadonlyField
            label="Document #"
            value={MASKED_DOCUMENT_NUMBER_DISPLAY}
            mono
          />
          <IdentityDocumentReadonlyField
            label="Issue date"
            value={record.issueDate ?? '—'}
          />
          <IdentityDocumentReadonlyField
            label="Expiry date"
            value={record.expiryDate ?? '—'}
          />
          <IdentityDocumentFormField label="Additional information" htmlFor="idoc-additional-edit">
            <Input
              id="idoc-additional-edit"
              value={additionalInformation}
              onChange={(e) => onAdditionalInformationChange(e.target.value)}
              className="h-9 w-full text-[13px]"
              maxLength={500}
            />
          </IdentityDocumentFormField>
        </div>
      </div>
    </div>
  );
}
