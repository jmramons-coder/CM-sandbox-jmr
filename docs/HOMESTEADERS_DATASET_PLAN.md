# Homesteaders Life Company (US) demo dataset plan

**Dataset id:** `homesteaders-us-demo`  
**Display currency:** USD  
**Channel:** Funeral home partners, myHomesteaders portal, 800-477-3633  
**Reference pattern:** Empire Life Canada modular files (`empire-*.ts`)

---

## Carrier context

| Section | Detail |
|--------|--------|
| **Who** | Homesteaders Life Company — mutual insurer, West Des Moines IA, founded 1906 |
| **Channel** | Funeral professionals, myHomesteaders policy owner portal, 800-477-3633 |
| **Products** | Preneed funeral funding, funeral plan contracts, P3 casket protection (reference only) |
| **Claims journey** | Funeral home or family notification → death certificate → funeral home assignment → benefit payment to funeral home |
| **Differentiators** | Helping people design a better farewell; funeral-home-centric distribution; preneed contract certainty |
| **Money** | USD; typical preneed sums $5,000–$15,000 |
| **Roles** | Policy owner, deceased insured, funeral director (not financial advisor), funeral home payee |

---

## Anchor cases (5)

| Case id | Product / sub-type | Stage | Hero narrative |
|---------|-------------------|-------|----------------|
| `CLM-PN-2026-0142` | Preneed death claim | Req. gathering | Death cert received; funeral home assignment to Oak Grove pending |
| `CLM-PN-2026-0287` | Preneed death claim | Decision-ready | Pay $12,500 to Riverside Memorial Chapel |
| `NB-2026-7721` | NB full UW | Req. gathering | $15,000 preneed — health questionnaire, MIB, APS overdue |
| `NB-2026-8804` | NB simplified | Personal Expressions done | $8,500 preneed — funeral home agent sale |
| `NB-2026-9905` | NB guaranteed | Contract issuance | $5,000 small preneed — PAD pending |

---

## New business underwriting tiers

### 1. Full underwriting — `ct_nb_full_uw`

**Product:** Preneed funeral plan — full evidence path  
**Case:** `NB-2026-7721` (Margaret Chen, Des Moines)

```
Application → Req. gathering → Underwriting → Decision
```

- Health questionnaire, MIB search, APS
- AI scoring card with provisional standard rating

### 2. Simplified underwriting — `ct_nb_simplified`

**Product:** Preneed funeral plan — funeral home channel with Personal Expressions planning guide

**Case:** `NB-2026-8804` (Robert Sullivan, Cedar Rapids)

```
Application → Personal Expressions guide → Underwriting → Decision
```

- Funeral director sale via partner funeral home
- No APS at this face amount for age band

### 3. Guaranteed issue — `ct_nb_guaranteed`

**Product:** Small guaranteed preneed contract

**Case:** `NB-2026-9905` (Dorothy Hayes, Omaha)

```
Application → Eligibility check → Contract issuance → Policy delivery
```

- Eligibility confirmed; PAD authorization pending

---

## Entity roster

| Entity id | Name | Role | Linked case(s) |
|-----------|------|------|----------------|
| CLI-HSL-001 | Helen Martinez | Deceased policy owner | CLM-PN-2026-0142 |
| CLI-HSL-002 | Sandra Martinez | Surviving spouse / contact | CLM-PN-2026-0142 |
| CLI-HSL-003 | James Whitfield | Deceased policy owner | CLM-PN-2026-0287 |
| CLI-HSL-004 | Linda Whitfield | Surviving spouse | CLM-PN-2026-0287 |
| CLI-HSL-005 | Margaret Chen | Applicant | NB-2026-7721 |
| CLI-HSL-006 | Robert Sullivan | Applicant | NB-2026-8804 |
| CLI-HSL-007 | Dorothy Hayes | Applicant | NB-2026-9905 |
| AGT-HSL-001 | Riverside Memorial Chapel | Funeral home partner | CLM-0287, NB-8804 |
| AGT-HSL-002 | Oak Grove Funeral Home | Funeral home partner | CLM-0142 |
| POL-HSL-PN-2015-001142 | Preneed funeral plan | In force | CLM-PN-2026-0142 |
| POL-HSL-PN-2014-002287 | Preneed funeral plan | In force | CLM-PN-2026-0287 |
| APP-7721 | Preneed plan — Margaret Chen | Underwriting | NB-2026-7721 |
| APP-8804 | Preneed plan — Robert Sullivan | Underwriting | NB-2026-8804 |
| APP-9905 | Preneed plan — Dorothy Hayes | Contract issuance | NB-2026-9905 |

---

## File map

| File | Contents |
|------|----------|
| `homesteadersDemoCaseIds.ts` | Canonical case ids + dataset id |
| `homesteaders-case-records.ts` | 5 case shells |
| `homesteaders-entity-records.ts` | Clients, policies, agents, applications, CASE_ENTITY_LINKS |
| `homesteaders-case-workflow-gi-records.ts` | Workflow meta + GI for all 5 cases |
| `homesteaders-requirement-records.ts` | ≥4 requirements per claim, ≥3 per NB |
| `homesteaders-task-records.ts` | ≥5 tasks per claim, ≥3 per NB |
| `homesteaders-document-records.ts` | Docs referenced in requirements (`fileAvailable: false`) |
| `homesteaders-document-evidence-records.ts` | Empty array (metadata-only mode) |
| `homesteaders-request-records.ts` | 5 case-linked requests |
| `homesteaders-decision-records.ts` | Decision flows for both claim cases |
| `homesteaders-scoring-records.ts` | Scoring for NB full UW only |
| `homesteaders-assistant-responses.ts` | Copilot grounding for all 5 case ids |
| `homesteaders-activity-records.ts` | ≥1 activity per case |
| `homesteaders-dataset.ts` | Assembly (`displayCurrency: 'USD'`, `legacyMockOverlayEnabled: false`) |

---

*Tagline: Helping people design a better farewell.*
