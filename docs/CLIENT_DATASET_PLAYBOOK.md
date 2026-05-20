# Client dataset playbook — complete data on the first try

**Purpose:** Repeatable process to build a **new carrier demo dataset** from a client’s public website (and stakeholder input), so the sandbox is **fully usable in one pass** — not a thin skeleton followed by a second “enrichment” sprint.

**Worked example in this repo:** Guardian 1821 UK (`guardian-uk-demo`) — see also [`GUARDIAN1821_DATASET_PLAN.md`](./GUARDIAN1821_DATASET_PLAN.md) and [`GUARDIAN1821_DOCUMENT_GENERATION_TABLE.md`](./GUARDIAN1821_DOCUMENT_GENERATION_TABLE.md).

**Reference implementation:** SBLI US (`multi-case-demo`) in `src/app/data/sbli-*.ts`.

---

## 1. Why “first try complete” matters

On Guardian we initially risked the old pattern:

1. Register cases and entities quickly.
2. Ship with empty GI cards, missing `context` / `history` on requirements, weak cross-links.
3. Run validation → fix dozens of errors.
4. Add a **second enrichment pass** (documents `reqContext`, assistant replies, GI cards, activity).

That costs more time than designing the **relationship graph upfront**. The app now validates strictly (`validateSystemDataset`, `dataValidation.test.ts`) and the UI expects rich records (General Information cards, requirement context panels, task checklists, copilot grounding).

**Goal:** When you open the first case after merge, it should look like a production demo — same bar as SBLI `CD26-5546112`, not “Unknown / not in dataset / empty tabs.”

---

## 2. Outcomes (definition of done)

Before writing TypeScript, agree these with product/sales:

| Outcome | Target |
|--------|--------|
| Dataset id | Stable slug, e.g. `guardian-uk-demo` |
| Display currency | `USD`, `GBP`, etc. on `SystemDataset.displayCurrency` |
| Anchor cases | 4–6 cases covering each **product line** you must demo |
| Objects per claim case | ≥ 4 requirements, ≥ 5 tasks, ≥ 4 documents, ≥ 1 request |
| Objects per NB case | GI scoring card, ≥ 3 requirements, MIB/GP story |
| Cross-links | Every document id in `linkedDocs` exists; every task in `linkedTasks` exists |
| AI layer | `assistantResponses` + case insights keyed to **your** case ids only |
| Legacy | `legacyMockOverlayEnabled: false`; no `IP26-*` / other carrier ids |
| Tests | `npm test` green including dataset-specific assertions |
| Preset | `src/app/data/demo-environments/{client}.preset.json` with branding + `activeDatasetId` |

---

## 3. Phase A — Research from the client website (half day)

Use the public site the way a BA would — not marketing copy only.

### 3.1 Capture sheet (fill before coding)

Create a short doc (or section in the client plan MD) with:

| Section | What to extract | Example (Guardian) |
|--------|------------------|---------------------|
| **Who** | Legal entity, appointed rep, issuer | Guardian FS Ltd; Scottish Friendly issuer |
| **Channels** | Adviser, portal, phone, email | MyGuardian, 0808 173 1821, heretohelp@… |
| **Products** | Names, types (life, CI, IP, NB) | Life Protection, CI Protection, Income Protection |
| **Claims journey** | FNOL steps, SLAs, support programs | Phone FNOL → email → HALO |
| **Differentiators** | 3–5 phrases to echo in AI copy | Consultant diagnosis CI; own-occupation IP; funeral advance |
| **Money** | Currency, typical sums | GBP; £500k life; £4,200/month IP |
| **Roles** | Policyholder vs life assured vs adviser | UK “financial adviser” not “agent” |
| **Documents** | Real-world evidence types | Fit Note, consultant letter, MIB, GP report |
| **Regulatory** | Footer/disclaimer one-liner | Appointed representative wording |

**Sources to crawl:** home, products/protection, claims, advisers, contact, annual claims stats if published.

### 3.2 Map products → demo cases

One **anchor case per major storyline** (not one generic “claim”):

| Case id (you choose) | Product / sub-type | Stage in journey | Hero narrative |
|---------------------|-------------------|------------------|----------------|
| `CLM-IP-2026-0142` | Income protection | Mid — requirements | Own occupation, deferred period, HALO |
| `CLM-CI-2026-0089` | Critical illness | Near decision | Consultant diagnosis, partial payout |
| `CLM-LIFE-2026-0033` | Death / life | Post-FNOL | Funeral advance £10k, probate pending |
| `NB-2026-7721` | NB full UW | Requirements gathering | Combined life+CI, children’s rider |
| `NB-2026-8804` | NB simplified | Tele-interview done | Life Essentials, fast track |

Assign ids **once**; use them in every file (`guardianDemoCaseIds.ts`).

### 3.3 Anti-patterns to avoid

- Reusing another carrier’s case ids (`IP26-*`, `CD26-*`) in the new dataset.
- USD amounts on a UK site (or mixed currencies).
- US-only forms (APS, Social Security) when the client is UK/EU.
- Single generic claimant (“Billy Bud”) cloned without policy-specific story.
- Building cases first and adding `linkedObjects` later (guarantees broken refs).

---

## 4. Phase B — Design the graph on paper (half day)

**Do not open `guardian-case-records.ts` until this matrix exists.**

### 4.1 Entity roster

List every **client, policy, agent, application** with stable ids:

```
CLI-HARTLEY-JAMES  →  policy GDN-IP-2023-009871  →  case CLM-IP-2026-0142
AGT-SHAW-HARRIET    →  linked to all cases she advises
```

### 4.2 Cross-link matrix (per case)

For **each** case id, fill a table:

| Requirement id | Task ids | Document ids | Request id (optional) |
|----------------|----------|--------------|------------------------|
| `req_gdn_ip_001` | `task_gdn_ip_001`, `task_gdn_ip_002` | `doc_gdn_ip_fnol`, `doc_gdn_ip_employer` | — |

Rules:

- Every **document** belongs to exactly one primary case (`linkedCaseId` + `linkedObjects`).
- Every **requirement** links to a case and lists real `linkedDocs` / `linkedTasks` ids.
- Every **task** links to a case; `evidenceDocuments` must reference real document ids.
- **Requests** link to case + optional task/requirement ids.

### 4.3 General Information (GI) plan per case

Match SBLI `sbli-case-workflow-gi-records.ts`:

| Block | Required for UI |
|-------|-----------------|
| `workflowMeta` | 4 context bar slots, subway stages (one `active`), tabs, header actions |
| `generalInformation.aiSummary` | White summary card text (UK copy, £) |
| `generalInformation.cards` | At least status tiles + 1–2 content cards (claim) or scoring (NB) |
| `generalInformation.collapsibles` | Parties, policy, claim details as appropriate |
| `decisionFlow` | Claim near-decision cases |
| `underwritingScoring` | NB cases |

If this block is empty, the UI falls back to empty state — plan it in Phase B, not Phase C.

### 4.4 Document generation table (metadata-first)

Even when PDFs are not ready, define **every** document row now:

| Document id | Filename (future) | Case | Category | **Generation prompt** (for design/PDF pipeline) |

Copy the Guardian format in [`GUARDIAN1821_DOCUMENT_GENERATION_TABLE.md`](./GUARDIAN1821_DOCUMENT_GENERATION_TABLE.md). Prompts force consistent names, amounts, and policy numbers across documents and requirements.

Set `fileAvailable: false` until PDFs land in `public/documents/{client}/`.

---

## 5. Phase C — Implement in dependency order (2–5 days)

### 5.1 File tree (mirror SBLI / Guardian)

```
src/app/data/
  {client}DemoCaseIds.ts          # canonical case ids + DATASET_ID
  {client}-entity-records.ts      # clients, policies, agents, applications, CASE_ENTITY_LINKS
  {client}-case-records.ts        # case shells (kind, workflowTemplateId, primaryParty)
  {client}-case-workflow-gi-records.ts
  {client}-requirement-records.ts
  {client}-task-records.ts
  {client}-document-records.ts
  {client}-document-evidence-records.ts
  {client}-request-records.ts
  {client}-decision-records.ts
  {client}-scoring-records.ts
  {client}-assistant-responses.ts
  {client}-activity-records.ts
  {client}-dataset.ts             # assembles SystemDataset
  demo-environments/{client}.preset.json
```

Register in `multi-case-dataset.ts` → `SYSTEM_DATASETS` (do not replace existing datasets).

### 5.2 Build order (strict)

| Step | File(s) | Why first |
|------|---------|-----------|
| 1 | `{client}DemoCaseIds.ts` | Single source of truth for ids |
| 2 | `{client}-entity-records.ts` | Policies/clients referenced everywhere |
| 3 | `{client}-case-records.ts` | Minimal shells + `linkedObjects` from step 2 |
| 4 | `{client}-case-workflow-gi-records.ts` | Merge in `withCaseWorkflowGi()` in dataset.ts |
| 5 | `{client}-document-records.ts` | Ids needed by requirements/tasks |
| 6 | `{client}-requirement-records.ts` | Full `context`, `history`, `linkedDocs`, `linkedTasks` |
| 7 | `{client}-task-records.ts` | `stage`, `summary`, `checklist`, `actions`, `evidenceDocuments` |
| 8 | `{client}-request-records.ts` | Form fields + `aiActions` / `humanActions` |
| 9 | `{client}-decision-records.ts`, `{client}-scoring-records.ts` | Per-case maps |
| 10 | `{client}-assistant-responses.ts`, `{client}-activity-records.ts` | Reference only valid ids |
| 11 | `{client}-dataset.ts` | Wire + `legacyMockOverlayEnabled: false` |

Use **factory helpers** (see `req()` in `guardian-requirement-records.ts`) so required fields get defaults; override per row for story-specific copy.

### 5.3 Minimum field checklist (validation will fail without these)

Pulled from `dataQualityGuards.ts` — treat as **first-try** requirements:

**Case (with GI record)**

- [ ] `workflowMeta.caseId` matches case id
- [ ] `contextBar`: exactly **4** slots
- [ ] `subwayStages`: exactly **one** `active`
- [ ] `generalInformation.aiSummary.text` present
- [ ] `generalInformation.collapsibles` non-empty
- [ ] GI cards have `fields`; scoring cards have `factors`

**Requirement**

- [ ] `linkedObjects` includes case
- [ ] `aiSummary`, `fulfillmentCriteria`, `context`, `history` (≥ 2 events, valid `dot`)
- [ ] `linkedDocs` / `linkedTasks` ids exist

**Task**

- [ ] `assignee`, `stage`, `summary.description`, `summary.checklist`, ≥ 1 `action`
- [ ] `linkedObjects` includes case
- [ ] AI tasks: `aiNarrative.text`

**Document**

- [ ] `linkedCaseId` + valid `linkedObjects`
- [ ] If `linkedRequirementId` set, requirement exists
- [ ] `insights` / `reqContext` aligned with requirement story (for side panels)

**Request**

- [ ] Links to case; `form` fields; `aiActions` + `humanActions` with valid `actorType` / `dotCls`

**Assistant**

- [ ] `linkedObjects` only reference ids in this dataset

---

## 6. Phase D — Validate continuously (not at the end)

```bash
npm test -- --run
```

Add a dataset block in `dataValidation.test.ts` (copy Guardian test):

- `validateSystemDataset(dataset).errors` is `[]`
- Expected case count, currency, document mode
- No foreign carrier ids in `dataset.cases`

During development, run tests after **each** record file, not after the full merge.

### 6.1 Manual smoke (10 minutes)

1. Platform Settings → select client preset → save.
2. Hard refresh `/cases/{default-case-id}` — URL must match sidebar (see `resolveCaseRouteId` in `demoCaseIds.ts`).
3. Open **each** anchor case: Overview (white summary + cards), Requirements, Tasks, Documents, Decision (if applicable).
4. Copilot: “What should I prioritise on this case?” — must cite **your** case id and UK/US copy as designed.
5. Grep repo for old carrier strings: `grep -r "IP26-\|Billy Bud\|SBLI" src/app/data/{client}` should be clean.

---

## 7. Phase E — Documents & assets (parallel track)

Metadata can ship before PDFs.

1. Complete **document generation table** (prompt per row).
2. Generate PDFs into `public/documents/{client}/`.
3. Add `get{Client}DocumentPreviewUrl()` in `src/app/utils/`.
4. Enrich documents in `{client}-dataset.ts` with `fileAvailable: true` and `fileUrl` (SBLI `enrichSbliDocument` pattern).

Do **not** block Phase C on PDFs; do block Phase C on **document ids and insights text** matching the table.

---

## 8. Preset & branding

`demo-environments/{client}.preset.json`:

```json
{
  "dataSource": {
    "activeDatasetId": "{client}-uk-demo",
    "legacyMockOverlayEnabled": false,
    "displayCurrency": "GBP"
  },
  "branding": {
    "productName": "{Client} Case Management",
    "accentColor": "#…"
  }
}
```

Extract colours/logo from the client site; avoid reusing SBLI purple/blue unless that is the client brand.

---

## 9. Agent / AI prompt template (optional)

When using Cursor or another agent to author records, paste:

```text
You are building dataset "{datasetId}" for {carrierName} ({market}, {currency}).

Sources: {urls}

Canonical case ids (use only these):
- {CASE_A}: {one-line story}
- …

Rules:
- UK spelling / {currency} formatting
- Every requirement must include context, history, aiSummary, fulfillmentCriteria
- Every linkedDoc/linkedTask/evidenceDocument id must exist in the files you create
- generalInformation per case: aiSummary + cards + collapsibles (see sbli-case-workflow-gi-records.ts)
- legacyMockOverlayEnabled: false
- Run validateSystemDataset mentally before output

Deliver files in dependency order: entity → case → GI → documents → requirements → tasks → requests → assistant → dataset.ts
```

Include the **cross-link matrix** from Phase B in the prompt so the model does not invent orphan ids.

---

## 10. Comparison: skeleton-first vs complete-first

| Approach | When it feels fast | Hidden cost |
|----------|-------------------|-------------|
| **Skeleton-first** | Cases appear in list day 1 | Second pass for GI, validation failures, empty tabs, copilot wrong ids |
| **Complete-first** | Slower day 1–2 | One validation run, demo-ready, no “not in active dataset” confusion |

Guardian target counts (complete-first benchmark):

| Domain | Count |
|--------|------:|
| Cases | 5 |
| Requirements | 22 |
| Tasks | 21 |
| Documents | 22 |
| Requests | 5 |
| Assistant responses | 7+ |
| Activity events | 4+ |

Adjust per client; keep **ratio** (~4–5 requirements per claim case, not 0–1).

---

## 11. Related repo docs

| Doc | Use |
|-----|-----|
| [`GUARDIAN1821_DATASET_PLAN.md`](./GUARDIAN1821_DATASET_PLAN.md) | Full Guardian BA spec, product catalogue, case portfolio |
| [`GUARDIAN1821_DOCUMENT_GENERATION_TABLE.md`](./GUARDIAN1821_DOCUMENT_GENERATION_TABLE.md) | PDF prompt table template |
| [`LEGACY_MOCK_INVENTORY.md`](./LEGACY_MOCK_INVENTORY.md) | What not to wire (`mock-cases`, overlay) |
| `src/app/data/dataQualityGuards.ts` | Authoritative validation rules |
| `src/app/data/dataValidation.test.ts` | CI gates for each dataset |

---

## 12. Quick start checklist (printable)

- [ ] Website research sheet complete (§3.1)
- [ ] 4–6 case ids + stories signed off (§3.2)
- [ ] Entity roster + cross-link matrix (§4.1–4.2)
- [ ] GI plan per case (§4.3)
- [ ] Document table with prompts (§4.4)
- [ ] Code in dependency order (§5.2)
- [ ] All validation fields (§5.3)
- [ ] `npm test` green (§6)
- [ ] Preset + manual smoke (§6.1, §8)
- [ ] PDFs optional follow-up (§7)

---

*Version 1.0 — May 2026. Generalises the Guardian 1821 implementation; update when `SystemDataset` or validation rules change.*
