import type { Params } from 'react-router';

/** Base folder URL for the entity that owns identity documents. */
export function identityDocumentsEntityPath(params: Params<string>): string {
  if (params.nestedId) {
    return `/folders/${params.folderId}/${params.childType}/${params.childId}/${params.nestedType}/${params.nestedId}`;
  }
  if (params.childId) {
    return `/folders/${params.folderId}/${params.childType}/${params.childId}`;
  }
  return `/folders/${params.folderId ?? ''}`;
}

export function identityDocumentsAddPath(params: Params<string>): string {
  return `${identityDocumentsEntityPath(params)}/identity-documents/add`;
}

export function identityDocumentEditPath(params: Params<string>, documentId: string): string {
  return `${identityDocumentsEntityPath(params)}/identity-documents/${documentId}/edit`;
}
