# Empire Life (Canada) demo dataset plan

**Dataset id:** `empire-ca-demo`  
**Display currency:** CAD  
**Channel:** Advisor-led distribution — [Empire Life for advisors](https://www.empire.ca/advisor)  
**Reference pattern:** Guardian 1821 UK modular files (`guardian-*.ts`)

---

## Carrier context

| Section | Detail |
|--------|--------|
| **Who** | Empire Life Insurance Company — Canadian mutual insurer headquartered in Kingston, Ontario |
| **Channel** | Financial advisors via Empire Life Advisor Portal and advisor support line |
| **Products** | Solution 20/10 term, Guaranteed Life Protect™ (guaranteed issue), Critical illness, Disability insurance |
| **Claims journey** | Advisor or client notification → requirements gathering → medical review → decision |
| **Differentiators** | Three distinct NB underwriting tiers; compassionate advance on death claims; advisor-centric service |
| **Money** | CAD; typical sums $50k–$500k |
| **Roles** | Life insured, beneficiary, financial advisor (not "agent" in US sense) |

---

## Anchor cases (6)

| Case id | Product / sub-type | Stage | Hero narrative |
|---------|-------------------|-------|----------------|
| `CLM-DI-2026-0214` | Disability insurance | Req. gathering | Own occupation, 90-day waiting period satisfied, employer statement overdue |
| `CLM-CI-2026-0156` | Critical illness | Decision-ready | Specialist diagnosis, full $125k payout recommended |
| `CLM-LIFE-2026-0088` | Term life death | Req. gathering | Compassionate advance $15k paid, probate pending for $385k |
| `NB-2026-4401` | Solution 20 participating — full UW | Req. gathering | $500k participating whole life, APS overdue |
| `NB-2026-5512` | Solution 10 term — accelerated UW (Adult-Short + PHI) | Personal history interview | $250k, questionnaire done, PHI scheduled |
| `NB-2026-6623` | Guaranteed Life Protect™ — guaranteed issue | Contract issuance | $50k, eligibility confirmed, PAD pending |

---

## New business underwriting tiers

Empire Life's advisor channel supports three distinct underwriting paths, each with its own workflow template and subway stages:

### 1. Full underwriting — `ct_nb_full_uw`

**Product:** Solution 20 participating whole life  
**Case:** `NB-2026-4401` (Amélie Dubois, Montréal)

```
Application → Req. gathering → Underwriting → Decision
```

- MIB search, financial questionnaire, APS (attending physician statement)
- AI scoring card with provisional standard rating
- Scoring record attached (`empire-scoring-records.ts`)

### 2. Accelerated underwriting — `ct_nb_simplified`

**Product:** Solution 10® term ([Solution 10](https://www.empire.ca/insurance/solution10)) with **Adult-Short Question Set** + **Personal History Tele-Interview (PHI)** per Empire's age-and-amount grid — not a separate "simplified issue" product, but a lighter evidence path on full underwriting.

**Case:** `NB-2026-5512` (Liam O'Brien, Calgary)

```
Application → Adult-Short questionnaire → Personal history interview → Decision
```

- No APS at $250k for this age band; PHI replaces paramed
- Fast & Full e-application channel
- Platform `caseSubType`: `simplified_underwriting` (maps to accelerated path in CM)

### 3. Guaranteed issue — `ct_nb_guaranteed`

**Product:** [Guaranteed Life Protect™](https://www.empire.ca/insurance/life-insurance/guaranteed-life-protect) — permanent non-participating, ages **40–75**, no medical or lifestyle questions, max ~$50k, 24-month graded benefit on natural causes

**Case:** `NB-2026-6623` (Patricia Singh, Ottawa)

```
Application → Eligibility check → Contract issuance → Policy delivery
```

- Eligibility: age nearest 40–75, Canadian tax resident, face amount within product max
- Contract issuance: PAD, beneficiary designation, NIGO clearance — **not** "non-medical review" (Empire uses "non-medical" for application questionnaire fields, not a GI workflow stage)
- Graded benefit period applies per product rules

---

## Entity roster

| Entity id | Name | Role | Linked case(s) |
|-----------|------|------|----------------|
| CLI-EMP-001 | Marc Tremblay | Life insured | CLM-DI-2026-0214 |
| CLI-EMP-002 | Sophie Chen | Life insured | CLM-CI-2026-0156 |
| CLI-EMP-003 | Robert MacDonald | Deceased | CLM-LIFE-2026-0088 |
| CLI-EMP-004 | Margaret MacDonald | Beneficiary | CLM-LIFE-2026-0088 |
| CLI-EMP-005 | Amélie Dubois | Applicant | NB-2026-4401 |
| CLI-EMP-006 | Liam O'Brien | Applicant | NB-2026-5512 |
| CLI-EMP-007 | Patricia Singh | Applicant | NB-2026-6623 |
| AGT-EMP-001 | Jean-Philippe Morin | Advisor (QC/ON/Atlantic) | DI, LIFE, NB full, NB guaranteed |
| AGT-EMP-002 | Pacific Wealth Advisors | Advisor firm (BC/AB) | CI, NB simplified |
| POL-EMP-DI-2023-004521 | Empire Disability Insurance | In force | CLM-DI-2026-0214 |
| POL-EMP-CI-2021-008734 | Empire Critical Illness | In force | CLM-CI-2026-0156 |
| POL-EMP-LIFE-2022-003912 | Empire Term Life 20 | In force | CLM-LIFE-2026-0088 |
| APP-4401 | Solution 20 participating | Underwriting | NB-2026-4401 |
| APP-5512 | Solution 10 term | Tele-interview | NB-2026-5512 |
| APP-6623 | Guaranteed Life Protect | Contract issuance | NB-2026-6623 |

---

## File map

| File | Contents |
|------|----------|
| `empireDemoCaseIds.ts` | Canonical case ids + dataset id |
| `empire-case-records.ts` | 6 case shells |
| `empire-entity-records.ts` | Clients, policies, agents, applications, CASE_ENTITY_LINKS |
| `empire-case-workflow-gi-records.ts` | Workflow meta + GI for all 6 cases |
| `empire-requirement-records.ts` | ~3–4 requirements per case |
| `empire-task-records.ts` | ~3 tasks per case |
| `empire-document-records.ts` | Docs referenced in requirements (`fileAvailable: false`) |
| `empire-document-evidence-records.ts` | Empty array (metadata-only mode) |
| `empire-request-records.ts` | 3 case-linked requests |
| `empire-decision-records.ts` | Decision flows for DI, CI, LIFE claims |
| `empire-scoring-records.ts` | Scoring for NB full UW only |
| `empire-assistant-responses.ts` | 5 copilot responses |
| `empire-activity-records.ts` | 4 activity events |
| `empire-dataset.ts` | Assembly (`displayCurrency: 'CAD'`, `legacyMockOverlayEnabled: false`) |

---

## Registration (parent agent)

Registration in `multi-case-dataset.ts`, `datasetRegistry.ts`, and demo preset JSON is handled separately by the parent agent.
