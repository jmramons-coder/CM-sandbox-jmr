# Guardian 1821 — Dataset & demo context plan

**Purpose:** Define an exhaustive plan to add a **Guardian Financial Services / Guardian1821** demo dataset to the CM Multicase sandbox, distinct from the existing **SBLI (US life)** seed.

**Sources:** [Guardian1821](https://guardian1821.co.uk/), [Our protection](https://guardian1821.co.uk/our-protection/), [Why choose us](https://guardian1821.co.uk/why-choose-us/), [Making a claim](https://guardian1821.co.uk/making-a-claim/), and the current codebase (`SBLI_DATASET`, `SystemDataset`, `sbli.preset.json`).

---

## 1. Executive summary

| Dimension | SBLI (current) | Guardian 1821 (target) |
|-----------|----------------|-------------------------|
| Market | US life insurer | UK protection (adviser-led) |
| Currency | USD (`displayCurrency: "USD"`) | **GBP** (`"GBP"`) |
| Carrier products | Term life, WOP, death claim, NB UW | Life Essentials, Life Protection, CI, combined, **Income Protection**, children’s CI |
| Distribution | Carrier-centric | **Financial advisers** + **MyGuardian** policyholder portal |
| Claims emphasis | WOP + death + NB pipeline | **Claims-heavy** — phone FNOL, HALO, funeral advance, PDG charter |
| Underwriter | SBLI | Products issued by **Scottish Friendly** (Guardian is appointed rep) |
| Business lines in app | `claim`, `new_business` | `claim` (dominant), `new_business`, optional **`service`** (premium waiver / address / beneficiary) |

Recommended dataset id: **`guardian-uk-demo`**  
Recommended preset id: **`demo-guardian`**  
Target case count: **5–6 anchor cases** (vs SBLI’s 4), with **~120–140** linked objects (tasks, requirements, documents, requests).

---

## 2. Guardian business context (from public site)

### 2.1 Who they are

- **Guardian Financial Services Limited** — UK protection specialist, brand **Guardian1821**.
- Products provided by **Scottish Friendly Assurance Society**; Guardian is an **appointed representative** (regulatory framing matters for disclaimers in demo UI).
- Channels: **advisers** ([For advisers](https://guardian1821.co.uk/)), **customers** ([For customers](https://guardian1821.co.uk/), **MyGuardian**), support **0808 123 1821** / **heretohelp@guardian1821.co.uk**.

### 2.2 Product catalogue (map to policies & case types)

| Product | Type | Demo use |
|---------|------|----------|
| **Protection Menu** | Modular bundle | Policy with multiple benefits on one schedule |
| **Life Essentials** | Stand-alone life (low cost) | Simplified death claim, lower sum assured |
| **Life Protection** | Premier life | Death + **earlier terminal payout** (stage 4 cancer, MND, etc.) |
| **Critical Illness Protection** | Stand-alone CI | CI claim with **consultant diagnosis** path |
| **Life and Critical Illness Protection** | Combined | Dual-trigger claim or NB with CI rider |
| **Income Protection** | Stand-alone IP | **Monthly benefit** claim — core differentiator vs SBLI |
| **Children’s Critical Illness** | Optional rider | Paediatric CI claim / NB illustration |

### 2.3 Differentiators to reflect in case narratives

1. **Faster, fairer CI** — payout on **UK consultant written diagnosis**; partial payouts for early-stage conditions ([Why choose us](https://guardian1821.co.uk/why-choose-us/)).
2. **Life Protection pays sooner** — terminal / specified conditions before 12-month rule.
3. **Dual life for couples** — separate lives, discounted; surviving partner retains cover.
4. **Definition upgrades** — existing customers can benefit (story for retention/service case).
5. **Optional children’s CI** — blended family wording.
6. **Premium Waiver included** — premiums paid if too ill to work (link to WOP-style **service** cases, not only death/CI).
7. **Income Protection — “your actual job”** — occupation-specific incapacity (vs generic “any occupation”).
8. **HALO** — claims support at point of claim ([Making a claim](https://guardian1821.co.uk/making-a-claim/)).
9. **Guardian Anytime** — GP 24/7, second opinion, wellbeing (no claim) — dashboard activity / requests.
10. **Funeral payment pledge** — up to **£10,000** advance on life claims (PDG).
11. **PDG Claims Charter** — named claims handler, regular updates.

### 2.4 Claims journey (operational model for workflows)

From [Making a claim](https://guardian1821.co.uk/making-a-claim/):

1. Call **0808 173 1821** (claims line; note site also lists 0808 123 1821 for general).
2. Claims team captures details **by phone**.
3. **Email confirmation** + forms if needed.
4. Updates to claimant and **financial adviser**.
5. **HALO** introduction — specialist support.

**2024 published stats** (use as realism for amounts, not live data):

| Benefit | % paid | Amount (£) |
|---------|--------|------------|
| Life | 100% | 6,719,696 |
| Terminal illness | 94% | 4,916,015 |
| Critical illness | 92% | 9,065,309 |
| Children’s CI | 100% | 643,270 |
| **Total** | — | **21,344,290** |

---

## 3. Gap analysis vs current SBLI dataset

### 3.1 What reuses as-is

- `SystemDataset` shape (`multi-case-dataset.ts`).
- File split pattern: `guardian-dataset.ts` + `guardian-*-records.ts`.
- `datasetRegistry`, `objectRepository`, `filterDatasetBySettings`.
- Case graph: cases → clients, policies, agents, tasks, requirements, documents, requests.
- Workflows: claim death template, disability/IP template, NB templates (extend labels only).
- UI modules: Cases, Tasks, Documents, Requests, Copilot (with new `guardian-assistant-responses.ts`).
- `displayCurrency: "GBP"` already supported on `SystemDataset`.

### 3.2 What must change or extend

| Area | SBLI today | Guardian need |
|------|------------|----------------|
| **Claim sub-types** | `waiver_of_premium`, `death_benefit`, `disability_benefit` | Add **`critical_illness`**, **`terminal_illness`**, **`income_protection`**, **`children_ci`** in `claimSubTypes.ts` / `objectRefs` |
| **Case type codes** | `IP`, `DTH`, NB codes | UK-style: `CLM-LIFE`, `CLM-CI`, `CLM-IP`, `CLM-TI`, `NB-FULL`, `NB-SIMP` |
| **Amounts** | $500,000 death benefit | £250,000–£750,000 sums assured; IP **£3,500/month** benefit |
| **Parties** | Claimant, employer | **Policyholder**, **life assured**, **financial adviser**, **GP/consultant** |
| **Documents** | APS, surgical report | **Consultant diagnosis letter**, **HMRC/intermediary**, **DSAR**, **funeral invoice**, **employer sick note**, **IP incapacity form** |
| **Regulatory copy** | US carrier | UK: FCA appointed rep, Scottish Friendly issuer footnote |
| **Requests categories** | Claims / New business | Add **“Policy servicing”** (beneficiary, address, premium holiday) |
| **Scoring** | US UW debits | UK: **loadings**, **exclusions**, **non-standard terms**, **MIB** (UK) |
| **Branding preset** | `sbli.preset.json` | `guardian.preset.json` — Guardian colours, logo, product name |
| **Assistant / insights** | SBLI case IDs | Guardian case IDs + UK terminology |

### 3.3 Out of scope (phase 1)

- Live integration with Scottish Friendly / Guardian APIs.
- Real PDF generation (keep `documentMode: "metadata_only"` unless assets provided).
- Full Protection Menu combinatorics (one “menu” policy as exemplar is enough).

---

## 4. Recommended demo case portfolio

Design **5–6 cases** that showcase Guardian’s breadth and claims focus.

### Case A — Income Protection (in progress) — **anchor**

| Field | Example |
|-------|---------|
| ID | `CLM-IP-2026-0142` |
| Sub-type | `income_protection` |
| Policy | Guardian Income Protection — **£4,200/month**, deferred 13 weeks |
| Assured | James Hartley, 38, software engineer |
| Stage | Requirement gathering — **occupation-specific** incapacity |
| Story | Back injury; HALO engaged; adviser copied on comms |
| SLA | Amber — awaiting consultant + employer confirmation |

### Case B — Critical illness (near decision)

| Field | Example |
|-------|---------|
| ID | `CLM-CI-2026-0089` |
| Sub-type | `critical_illness` |
| Product | Critical Illness Protection |
| Assured | Leana Mitchell |
| Story | Breast cancer — **consultant diagnosis** received; partial early payout eligible |
| HALO | Active — treatment navigation |

### Case C — Life Protection + funeral advance

| Field | Example |
|-------|---------|
| ID | `CLM-LIFE-2026-0033` |
| Sub-type | `death_benefit` |
| Assured | David Clarke (deceased) |
| Story | Death claim; **£10,000 funeral advance** paid; probate pending for balance |
| Adviser | Notified per PDG charter |

### Case D — Terminal illness (Life Protection)

| Field | Example |
|-------|---------|
| ID | `CLM-TI-2026-0011` |
| Sub-type | `terminal_illness` |
| Story | Stage 4 cancer — **payout before 12-month terminal definition** (Guardian differentiator) |

### Case E — New business — full underwriting

| Field | Example |
|-------|---------|
| ID | `NB-2026-7721` |
| Sub-type | `full_underwriting` |
| Product | Life and Critical Illness Protection |
| Assured | Priya Sharma |
| Story | Combined cover; GP report outstanding; **optional children’s CI** selected |

### Case F — New business — simplified (Life Essentials)

| Field | Example |
|-------|---------|
| ID | `NB-2026-8804` |
| Sub-type | `simplified_underwriting` |
| Product | Life Essentials |
| Story | Lower sum assured; tele-interview complete; standard terms likely |

### Optional Case G — Service / premium waiver

| Field | Example |
|-------|---------|
| ID | `SRV-2026-0201` |
| Type | Service request → linked tasks |
| Story | Redundancy — **premium waiver** (included standard) for 6 months |

---

## 5. Entity & relationship model

Mirror `sbli-entity-records.ts` with UK data.

### 5.1 Clients (`guardian-entity-records.ts`)

- **Persons:** UK names, addresses (e.g. Manchester, Bristol, Edinburgh), DOB, smoker, NI number placeholder (fictional).
- **Roles:** policyholder, life assured, child, beneficiary, **financial adviser contact** (person at firm).

### 5.2 Policies

| Policy number pattern | Product label | Key fields |
|----------------------|---------------|------------|
| `GDN-LP-2022-118902` | Life Protection | Sum assured **£500,000**, premium waiver included |
| `GDN-CI-2021-004455` | Critical Illness Protection | Sum assured **£150,000** |
| `GDN-IP-2023-009871` | Income Protection | **£4,200/month**, deferred period 13 weeks |
| `GDN-LE-2024-220011` | Life Essentials | **£100,000** |
| `GDN-LC-2025-330077` | Life & CI Protection | Combined schedule |

- **Issuer footnote** on GI panel: “Provided by Scottish Friendly Assurance Society.”

### 5.3 Agents (financial advisers)

- Firm names: independent adviser practices (not “Equisoft”).
- Fields: FCA reference placeholder, agency, commission status, linked cases.

### 5.4 Applications (NB cases)

- Submission channel: adviser portal / paper.
- Premium: **£/month** or annual.

---

## 6. Workflows & requirements

### 6.1 Claim workflow templates (new or extended)

| Template ID | Phases / steps | Used by |
|-------------|----------------|---------|
| `guardian-claim-income-protection` | FNOL → eligibility → medical/occupation → decision → payment setup | Case A |
| `guardian-claim-critical-illness` | FNOL → diagnosis validation → partial/full decision | Case B |
| `guardian-claim-life-death` | FNOL → verification → **funeral advance** → probate → final payment | Case C |
| `guardian-claim-terminal` | Notification → medical director review → accelerated payout | Case D |

Reuse SBLI death/disability step IDs where possible; map Guardian labels in `guardian-case-workflow-gi-records.ts`.

### 6.2 Requirement library (per case type)

**Income protection**

- Verify deferred period elapsed.
- Employer incapacity confirmation.
- **Own occupation** incapacity evidence.
- HMRC / tax status (if applicable).
- Payment details (UK bank sort code / account).

**Critical illness**

- Consultant diagnosis on Guardian letterhead.
- Policy definitions cross-check (early partial payout).
- HALO consent & handoff.

**Life / death**

- Death certificate.
- Proof of insurable interest / beneficiary.
- **Funeral invoice** (for £10k advance).
- Probate grant (pending final balance).

**New business**

- Application form, adviser fact find, GP report, MIB (UK), tele-interview, children’s CI selection form.

Each requirement: `fulfillmentCriteria`, `linkedDocs`, `linkedTasks`, `blockingImpact` on decision (as SBLI).

### 6.3 Tasks

- Operational tasks aligned to phone FNOL model: “Register claim from call recording”, “Send confirmation email”, “Introduce HALO specialist”.
- NB tasks: “Order GP report”, “Review consultant diagnosis”, “Issue rated terms”.

### 6.4 Documents & evidence

- Metadata-only PDF names under `/public/documents/guardian/` (mirror SBLI asset pattern).
- Categories: Medical, Claim, Policy, Legal, Financial.
- Evidence panels: AI summary referencing Guardian definitions (not SBLI riders).

### 6.5 Requests

- Categories: **Claims**, **New business**, **Policy servicing**.
- Channels: **Adviser**, **Policyholder portal (MyGuardian)**, **Phone**, **Email**.
- Link requests to case creation (e.g. adviser-submitted CI notification).

### 6.6 Communications & activity (optional phase 2)

- Empty arrays acceptable initially (SBLI pattern).
- Later: adviser update emails, HALO touchpoints.

### 6.7 Decision & scoring

- `guardian-decision-records.ts` — claim decisions (approve full/partial, decline with reason).
- `guardian-scoring-records.ts` — NB with UK loadings (+50% nicotine, etc.).

### 6.8 AI layer

- `guardian-assistant-responses.ts` — curated Q&A for all case IDs.
- `caseInsightsData.ts` — add Guardian bundles keyed by case id (or dataset-aware switch).
- Copilot prompts: UK spelling, £, adviser language, HALO mentions.

---

## 7. Technical implementation plan

### Phase 0 — Foundation (1–2 days)

1. **Domain extensions**
   - Extend `ClaimSubType` + `CASE_TYPE_METADATA_BY_SUBTYPE` for CI, TI, IP, children CI.
   - Add `claimSubType` resolution for Guardian workflows.
2. **Constants**
   - `src/app/data/demoCaseIds.ts` → `guardianDemoCaseIds.ts` or shared map by dataset id.
3. **Registry**
   - `GUARDIAN_DATASET` in `guardian-dataset.ts`.
   - Register in `SYSTEM_DATASETS` array in `multi-case-dataset.ts`.
4. **Preset**
   - `src/app/data/demo-environments/guardian.preset.json`:
     - `productName`: "Guardian Case Management"
     - `displayCurrency`: "GBP"
     - Brand colours (extract from site: deep navy / teal — confirm with brand team)
     - Logo assets in `public/documents/guardian/`
5. **Validation**
   - Extend `dataValidation.test.ts` for second dataset id.
   - `validateSystemDataset(guardian)` in CI.

### Phase 1 — Core graph (3–5 days)

| File | Contents |
|------|----------|
| `guardian-entity-records.ts` | Clients, policies, agents, applications, case links |
| `guardian-case-workflow-gi-records.ts` | GI fields per case (UK labels, £ amounts) |
| `guardian-dataset.ts` | Assembles `SystemDataset` metadata |
| `guardian-requirement-records.ts` | Requirements + doc/task links |
| `guardian-task-records.ts` | Case + requirement tasks |
| `guardian-document-records.ts` + evidence | Document metadata |
| `guardian-request-records.ts` | 4–6 requests |
| `guardian-decision-records.ts` | Decision flows |
| `guardian-scoring-records.ts` | NB scoring |

**Acceptance:** Switch platform preset to Guardian → Cases list shows 5–6 UK cases; open each tab; £ formatting everywhere.

### Phase 2 — UX & AI alignment (2–3 days)

1. `guardian-assistant-responses.ts` + wire in dataset.
2. `caseInsightsData` Guardian entries (or dataset-driven builder).
3. Platform guide / demo scripts (optional Guardian tour).
4. Remove SBLI-specific strings when Guardian dataset active (`filterDatasetBySettings` already scopes lists).

### Phase 3 — Polish (1–2 days)

1. Document preview placeholders (UK forms).
2. Simple service cases (`guardian-simple-service-records.ts`) — beneficiary change.
3. Table column labels: “Sum assured” vs “Death benefit” by product.
4. Footer regulatory line on login/settings.

### Phase 4 — Deploy & enablement

1. Demo environment export includes `demo-guardian`.
2. Vercel: same app, user selects Guardian preset in Platform Settings.
3. Internal doc: case walkthrough script for sales.

---

## 8. Data quality checklist

Before merge, verify:

- [ ] All `linkedObjects` resolve (case ↔ policy ↔ client ↔ task ↔ document).
- [ ] Every case has ≥1 requirement, ≥3 tasks, ≥2 documents (claims).
- [ ] `displayCurrency` is **GBP**; no `$` in seeded strings.
- [ ] Case IDs unique; no `IP26-*` / SBLI policy numbers in Guardian set.
- [ ] `assistantResponses` reference only Guardian case IDs.
- [ ] Death claim case includes funeral advance narrative.
- [ ] IP case references **own occupation** and deferred period.
- [ ] CI case references **consultant diagnosis** path.
- [ ] NB cases use adviser + Scottish Friendly disclaimer where appropriate.
- [ ] `validateSystemDataset` passes with zero errors.
- [ ] `legacyMockOverlayEnabled: false`.

---

## 9. Branding & copy guidelines

| Topic | Guideline |
|-------|-----------|
| Spelling | UK: organisation, favour, cheque, adviser |
| Money | `£` + thousands separator: `£500,000`, `£4,200/month` |
| Roles | Financial adviser (not agent unless quoting FCA) |
| Claims phone | 0808 173 1821 (claims) in task descriptions |
| Support email | heretohelp@guardian1821.co.uk |
| Services | HALO (claims), Guardian Anytime (everyday) |
| Legal | “Guardian Financial Services Limited is an appointed representative of Scottish Friendly…” (short form in settings) |
| Avoid | SBLI, USD, US medical forms (APS from US hospital), “claimant” where “policyholder/life assured” is clearer |

---

## 10. Suggested file tree

```
src/app/data/
  guardian-dataset.ts
  guardian-entity-records.ts
  guardian-case-workflow-gi-records.ts
  guardian-requirement-records.ts
  guardian-task-records.ts
  guardian-document-records.ts
  guardian-request-records.ts
  guardian-decision-records.ts
  guardian-scoring-records.ts
  guardian-assistant-responses.ts
  guardian-simple-service-records.ts   # optional
  demo-environments/
    guardian.preset.json
public/documents/guardian/
  guardian_logo.svg
  (placeholder PDFs or reuse generic)
docs/
  GUARDIAN1821_DATASET_PLAN.md   # this file
```

---

## 11. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Claim sub-types not in UI create-case | Extend `CLAIM_CASE_SUBTYPE_VALUES` + labels before demo |
| Hardcoded SBLI in components | Grep `SBLI`, `CD26`, `Billy Bud`; gate on `activeDatasetId` |
| Currency formatters assume USD | Test with `displayCurrency: GBP` in all modules |
| Corporate firewall blocks Vercel (AI category) | IT allowlist; unrelated to dataset content |
| Product names inaccurate | Legal/commercial review of public names only |

---

## 12. Success criteria

1. User can select **Guardian** preset and work only with UK £ Guardian cases.
2. At least **one open claim per major product line**: IP, CI, Life/death, NB.
3. Case detail shows Guardian-specific GI (sum assured, deferred period, adviser, HALO flag).
4. Copilot answers “What should I prioritise?” using Guardian case ids.
5. Full validation suite passes for `guardian-uk-demo` dataset.

---

## 13. Next steps (recommended order)

1. **Stakeholder sign-off** on case portfolio (section 4) and case count.
2. **Brand assets** — logo SVG, primary hex colours from Guardian marketing.
3. **Phase 0** domain + registry + preset (empty cases smoke test).
4. **Phase 1** implement Cases A–C (claims focus) first, then D–F.
5. **Phase 2** AI + insights.
6. **Demo script** for advisers vs claims assessors.

---

*Document version: 1.0 — May 2026. Update when Guardian product names or stats change on guardian1821.co.uk.*
