import { BookOpen, Download, FileText } from 'lucide-react';

const QUERY_EXAMPLES = [
  { query: 'sophie', result: 'Finds clients where any searchable field contains sophie.' },
  { query: 'gmail, 555', result: 'Finds clients that match both gmail and 555, in any searchable field.' },
  { query: '555-0198, Hope Road', result: 'Finds clients matching both phone and address. Order does not matter.' },
  { query: 'Hope Road, 555-0198', result: 'Same result as above. Comma terms are not positional.' },
];

const DEFAULT_SEARCH_PARAMETERS = [
  'Client name',
  'Original client ID',
  'Numeric client ID',
  'Email',
  'Phone number',
  'Date of birth',
  'Address',
  'Parish',
  'Tax ID',
];

const RESPONSIVE_RULES = [
  {
    width: '< 900px',
    behavior: 'Auto-collapse the left side menu when possible. Form content uses full width. Client controls may stack. Listbox stays capped and scrollable.',
  },
  {
    width: '900-1199px',
    behavior: 'Form remains full width. Roles stack. Metadata stays on one row and truncates independently.',
  },
  {
    width: '>= 1200px',
    behavior: 'More horizontal room, but email and phone should stay close together. Do not stretch phone to the far right.',
  },
];

const CLIENT_FOLDER_SEARCH_MARKDOWN = `# Client folder search

Developer spec for the Add Participant client folder combobox.

## Purpose
This feature lets a user search existing client folders in the system before adding a participant. It helps avoid duplicate client creation and lets the user quickly select the correct client folder.

## How search works
Users can search by:
- Client name
- Original client ID
- Numeric client ID
- Email
- Phone number
- Date of birth
- Address
- Parish
- Tax ID

Users can combine multiple search values with commas, for example: \`phone, address\`.

The query is split by commas. Each part must match one of the searchable values listed above. Order does not matter, and partial values are supported.

Examples:
- \`sophie\` finds clients where any searchable field contains sophie.
- \`gmail, 555\` finds clients matching both gmail and 555.
- \`555-0198, Hope Road\` finds clients matching phone and address.
- \`Hope Road, 555-0198\` returns the same results; comma terms are not positional.

## Search help tooltip
The info icon inside the search input explains comma multi-search behavior. Keep copy short and use the compact dark tooltip style.

## Listbox content
Each option displays:
- Avatar initials.
- Client name.
- ACTIVE or INACTIVE tag next to the name.
- Numeric client ID in the top-right, formatted like \`CLI-0001\`.
- Date of birth, email, and phone on the same row.
- Address/parish on the next row when available.

## Truncation edge case
DOB, email, and phone must always stay on the same row. If there is not enough width, each value truncates individually so the user still sees all three pieces of information. On hover, the user can see the full value in a tooltip. The tooltip is only for the hovered value, not the whole row.

At 1200px and above, phone should stay close to email and must not be pushed to the far right.

## Responsiveness
- Below 900px: auto-collapse the left side menu when possible. Form content uses full width. Client controls may stack. Listbox stays capped and scrollable.
- 900-1199px: form remains full width. Roles stack. Metadata stays on one row and truncates independently.
- 1200px and above: more horizontal room, but email and phone should stay close together.

## Developer notes
- Component: \`ClientSearchCombobox\` in \`SubFolderFormShell.tsx\`.
- Data source: \`MOCK_CLIENTS\` in \`mock-entity-folders.ts\`.
- Listbox height: keep capped at \`min(340px, 30vh)\`.

## Acceptance criteria
- Typing one term searches all default parameters.
- Typing comma-separated terms applies AND matching.
- Order of comma-separated terms does not matter.
- Info icon tooltip explains comma behavior.
- Listbox never exceeds \`min(340px, 30vh)\`.
- DOB/email/phone stay on one row.
- Each truncated metadata value has its own tooltip.
- Client ID is numeric format \`CLI-0001\`.
- Auto-collapse left side menu under 900px width when possible.
- Phone stays next to email at 1200px and above.
`;

function SpecSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="doc-print-section border-b border-border-default py-5 last:border-b-0">
      <h2 className="text-[16px] font-semibold text-text-primary">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function DocumentationSpecPanel() {
  const handleExport = () => {
    window.print();
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([CLIENT_FOLDER_SEARCH_MARKDOWN], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'client-folder-search-spec.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="doc-spec-page flex h-full min-h-0 bg-surface-primary">
      <aside className="doc-print-hide hidden w-[280px] shrink-0 border-r border-border-default bg-white px-5 py-6 lg:block">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-brand-blue" />
          <h1 className="text-[16px] font-semibold text-text-primary">Documentation & Spec</h1>
        </div>
        <div className="mt-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.4px] text-text-muted">Documentation version</p>
          <button className="w-full rounded-lg border border-brand-blue/30 bg-surface-selected px-3 py-2 text-left text-[13px] font-semibold text-brand-blue">
            Client folder search
          </button>
        </div>
      </aside>

      <main className="app-scrollbar doc-print-root min-h-0 flex-1 overflow-y-auto">
        <div className="doc-print-content mx-auto max-w-[1120px] px-6 py-8 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.45px] text-text-primary">
                Contextual UI spec
              </p>
              <h1 className="mt-1 text-[28px] font-semibold text-text-primary">Client folder search</h1>
              <p className="mt-2 max-w-[760px] text-[14px] leading-relaxed text-text-secondary">
                Developer spec for the Add Participant client folder combobox.
              </p>
            </div>
            <div className="doc-print-hide flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border-default bg-white px-4 py-2 text-[12px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
              >
                <FileText className="size-3.5" />
                Export MD
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border-default bg-white px-4 py-2 text-[12px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
              >
                <Download className="size-3.5" />
                Export PDF
              </button>
            </div>
          </div>

          <div className="grid gap-5">
            <SpecSection title="Purpose">
              <p className="text-[13px] leading-relaxed text-text-secondary">
                This feature lets a user search existing client folders in the system before adding a participant.
                It helps avoid duplicate client creation and lets the user quickly select the correct client folder.
              </p>
            </SpecSection>

            <SpecSection title="How Search Works">
              <div className="space-y-4">
                <div>
                  <p className="text-[13px] font-semibold text-text-primary">User can search by typing any of these values</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {DEFAULT_SEARCH_PARAMETERS.map((parameter) => (
                      <span
                        key={parameter}
                        className="rounded-full bg-surface-primary px-2.5 py-1 text-[11px] font-semibold text-text-secondary ring-1 ring-border-soft"
                      >
                        {parameter}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-text-primary">User can combine multiple search values with commas</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                    Example: <code className="rounded bg-surface-muted px-1 py-0.5">phone, address</code>.
                    The query is split by commas and each part must match one of the searchable values listed above.
                    Users do not need to write the parameters in the same order as the listbox displays them.
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                    Partial values are supported. For example, <code className="rounded bg-surface-muted px-1 py-0.5">555, Hope</code> can match a phone number and address.
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {QUERY_EXAMPLES.map((item) => (
                    <div key={item.query} className="rounded-lg border border-border-soft bg-surface-primary p-3">
                      <code className="text-[13px] font-semibold text-text-primary">{item.query}</code>
                      <p className="mt-1 text-[12px] text-text-secondary">{item.result}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SpecSection>

            <SpecSection title="Search Help Tooltip">
              <p className="text-[13px] leading-relaxed text-text-secondary">
                The user can view multi-search details from the info tooltip inside the search input.
                The tooltip explains that comma-separated terms combine search parameters.
                Keep the text short and use the compact dark tooltip style.
              </p>
            </SpecSection>

            <SpecSection title="Listbox Content">
              <div className="space-y-2 text-[13px] leading-relaxed text-text-secondary">
                <p>Each client option displays:</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Avatar initials.</li>
                  <li>Client name.</li>
                  <li>ACTIVE or INACTIVE tag next to the name.</li>
                  <li>Numeric client ID in the top-right, formatted like <code className="rounded bg-surface-muted px-1 py-0.5">CLI-0001</code>.</li>
                  <li>Date of birth, email, and phone on the same row.</li>
                  <li>Address/parish on the next row when available.</li>
                </ul>
              </div>
            </SpecSection>

            <SpecSection title="Truncation Edge Case">
              <div className="space-y-2 text-[13px] leading-relaxed text-text-secondary">
                <p>Date of birth, email, and phone must always stay on the same row.</p>
                <p>If there is not enough width, each value truncates individually so the user still sees all three pieces of information.</p>
                <p>On hover, the user can see the full value in a tooltip. The tooltip is only for the hovered value, not the whole row.</p>
                <p>At 1200px and above, phone should stay close to email and must not be pushed to the far right.</p>
              </div>
            </SpecSection>

            <SpecSection title="Responsiveness">
              <div className="grid gap-3 md:grid-cols-3">
                {RESPONSIVE_RULES.map((rule) => (
                  <div key={rule.width} className="rounded-lg border border-border-soft bg-surface-primary p-3">
                    <p className="text-[13px] font-semibold text-text-primary">{rule.width}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">{rule.behavior}</p>
                  </div>
                ))}
              </div>
            </SpecSection>

            <SpecSection title="Developer Notes">
              <div className="space-y-2 text-[13px] leading-relaxed text-text-secondary">
                <p>Component: <code className="rounded bg-surface-muted px-1 py-0.5">ClientSearchCombobox</code> in <code className="rounded bg-surface-muted px-1 py-0.5">SubFolderFormShell.tsx</code>.</p>
                <p>Data source: <code className="rounded bg-surface-muted px-1 py-0.5">MOCK_CLIENTS</code> in <code className="rounded bg-surface-muted px-1 py-0.5">mock-entity-folders.ts</code>.</p>
                <p>Listbox height: keep capped at <code className="rounded bg-surface-muted px-1 py-0.5">min(340px, 30vh)</code>.</p>
              </div>
            </SpecSection>

            <SpecSection title="Acceptance Criteria">
              <ul className="list-disc space-y-1 pl-5 text-[13px] text-text-secondary">
                {[
                  'Typing one term searches all default parameters.',
                  'Typing comma-separated terms applies AND matching.',
                  'Order of comma-separated terms does not matter.',
                  'Info icon tooltip explains comma behavior.',
                  'Listbox never exceeds min(340px, 30vh).',
                  'DOB/email/phone stay on one row.',
                  'Each truncated metadata value has its own tooltip.',
                  'Client ID is numeric format CLI-0001.',
                  'Auto-collapse left side menu under 900px width when possible.',
                  'Phone stays next to email at 1200px and above.',
                ].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </SpecSection>
          </div>
        </div>
      </main>
    </div>
  );
}
