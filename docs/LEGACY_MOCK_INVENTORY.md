# Legacy mock content inventory

Canonical demo data is **`SBLI_DATASET`** (`multi-case-demo`) in `src/app/data/sbli-dataset.ts`.  
Both **Equisoft** and **SBLI** presets use this dataset with `legacyMockOverlayEnabled: false`.

## Legacy ID → SBLI ID map

| Legacy ID | Legacy narrative | SBLI ID | Current workflow |
|-----------|------------------|---------|------------------|
| `IP26-5546112` | Billy Bud · UK Income Protection | `CD26-5546112` | Waiver of premium claim |
| `IP44-6679812` | Sarah Dupont · overdue APS | `CD44-6679812` | Death benefit · Thomas / Marie Dupont |
| `IP66-7622343` | Marc Tremblay · PT/rehab | `NB66-7622343` | New business · full underwriting |
| `WP66-998987` | Elena Rossi · RTW | `NB98-9989870` | New business · simplified UW |
| `IP26-5546200` | Billy post-approval | `CD26-5546112` | (same WOP case) |

Constants: `src/app/data/demoCaseIds.ts`

## AI surfaces (migration status)

| Surface | File(s) | Overlay off? | Replacement |
|---------|---------|--------------|-------------|
| Global copilot replies | `Layout.tsx` | Was `MOCK_REPLIES` | `assistantReplyBuilder.ts` + `sbli-assistant-responses.ts` |
| Seed chat history | `CopilotContext.tsx` | Yes | SBLI-named `SEED_SESSIONS` |
| Case insights journey | `caseInsightsData.ts` | Yes | Per-case bundles for `CD*` / `NB*` |
| Case copilot dock | `CaseView.tsx` | Yes | `buildAssistantReply` + dataset |
| GI AI summary | `sbli-case-workflow-gi-records.ts` | Yes | Already SBLI-aligned |
| Document evidence AI | `mock-document-evidence.ts` | Fallback only | `SBLI_DOCUMENT_EVIDENCE_RECORDS` |
| E-app field assist | `eapp/eappAiAssistData.ts` | Separate product | Out of scope for case graph |

## Legacy `mock-*.ts` files

| File | Used when overlay off? | Status |
|------|------------------------|--------|
| `mock-cases.ts` | `getCaseOverview` mapping only | **Deprecated** — overlay summaries unused |
| `mock-tasks.ts` | `CURRENT_USER`, `TEAMS` only | Tasks from dataset; teams still mock |
| `mock-documents.ts` | No | Overlay only |
| `mock-requests.ts` | No | Overlay only |
| `mock-document-evidence.ts` | Fallback if dataset miss | Prefer dataset evidence |
| `mock-folders.ts` | Yes (folders module) | **Remaining** — not SBLI case graph |
| `mock-entity-folders.ts` | Yes (entity folders) | **Remaining** |
| `mock-eapp.ts` | E-app only | **Remaining** |
| i18n `fixtures.json` | Folders labels | **Remaining** |

## Demo routes and guides

| File | Notes |
|------|--------|
| `CasesWorkspace.tsx` | Default case route → `DEMO_CASE_IDS.wopClaim` |
| `PlatformGuideModal.tsx` | Tour URLs use `CD26-5546112` |
| `CaseView.tsx` | Default param + guided flows use SBLI IDs |
| `TaskDetailSidePanel.tsx` | No `IP26` fallback |

## Related readiness entries

See `src/app/domain/systemReadiness.ts` — `assistant-hardcoded-claim-replies`, `mock-fixtures-ip-only`, `routes-hardcoded-cases`.
