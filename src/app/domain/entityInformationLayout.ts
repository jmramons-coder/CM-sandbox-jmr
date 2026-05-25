import type { InfoSection } from './entityFolders';

export const IDENTITY_DOCUMENTS_SECTION_ID = 'identity-documents';

export const IDENTITY_DOCUMENTS_SECTION: InfoSection = {
  kind: 'identityDocuments',
  id: IDENTITY_DOCUMENTS_SECTION_ID,
  title: 'IDENTITY DOCUMENTS',
};

/** Insert Identity Documents after CONTACT, before other sections (AC-00). */
export function withIdentityDocumentsSection(sections: InfoSection[]): InfoSection[] {
  if (sections.some((s) => s.kind === 'identityDocuments')) return sections;

  const contactIndex = sections.findIndex((s) => s.kind === 'contact');
  const insertAt = contactIndex >= 0 ? contactIndex + 1 : sections.length;

  const next = [...sections];
  next.splice(insertAt, 0, IDENTITY_DOCUMENTS_SECTION);
  return next;
}
