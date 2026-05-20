# Guardian 1821 UK — Document generation table

Use this table to produce PDF assets under `/public/documents/guardian/` (or your asset pipeline). Each row maps a **dataset document id** to a generation prompt aligned with `guardian-document-records.ts` metadata and AI insights.

**Dataset id:** `guardian-uk-demo`  
**Display currency:** GBP  
**Issuer footnote (on all letters):** Products provided by Scottish Friendly Assurance Society. Guardian Financial Services Limited is an appointed representative.

| Document ID | Suggested filename | Case | Category | Generation prompt |
|-------------|-------------------|------|----------|-------------------|
| `doc_gdn_ip_fnol` | `FNOL_confirmation_hartley.pdf` | CLM-IP-2026-0142 | Claim | UK insurer-style **FNOL confirmation email** (PDF printout) to James Hartley and copy Harriet Shaw. Header Guardian 1821 / claims@guardian1821.co.uk. Body: claim ref **CLM-IP-2026-0142**, policy **GDN-IP-2023-009871**, income protection, incapacity from 10 Feb 2026, monthly benefit **£4,200**, 13-week deferred period satisfied 10 May 2026. List next steps: employer Fit Note, consultant letter, HALO support. Date 18 Mar 2026. |
| `doc_gdn_ip_employer` | `fit_note_techflow_hartley.pdf` | CLM-IP-2026-0142 | Medical | NHS-style **Fit Note** on **TechFlow Ltd** letterhead for James Hartley. Dates from 10 Feb 2026. Wording deliberately vague (“unfit for work”) **without** explicit “software engineer / own occupation” language — supports AI insight about chase for clarification. Signed occupational health. |
| `doc_gdn_ip_consultant` | `consultant_patel_hartley.pdf` | CLM-IP-2026-0142 | Medical | Private **consultant orthopaedic letter** from Dr Raj Patel re James Hartley, L4/L5 disc injury. States cannot sustain prolonged sitting/coding until reassessment **July 2026**. Professional letterhead, UK address. Supports own-occupation IP claim. |
| `doc_gdn_ip_halo` | `halo_consent_hartley.pdf` | CLM-IP-2026-0142 | Claim | One-page **HALO consent** form, Guardian branding. Life assured signature block dated 20 Mar 2026. Consent to nurse specialist contact at point of claim. |
| `doc_gdn_ip_questionnaire` | `ip_questionnaire_hartley.pdf` | CLM-IP-2026-0142 | Claim | Guardian **Income Protection claim questionnaire**: occupation Software Engineer, employer TechFlow Ltd, date incapacity 10 Feb 2026, cause lumbar disc, non-smoker, policy GDN-IP-2023-009871. |
| `doc_gdn_ci_fnol` | `ci_fnol_mitchell.pdf` | CLM-CI-2026-0089 | Claim | **Claim registration summary** for Leana Mitchell, critical illness, policy GDN-CI-2021-004455, adviser Harriet Shaw, registered 2 Apr 2026 via phone 0808 173 1821. |
| `doc_gdn_ci_diagnosis` | `consultant_oncology_mitchell.pdf` | CLM-CI-2026-0089 | Medical | **UK consultant oncologist letter** (Bristol Oncology Centre): Leana Mitchell, **invasive ductal carcinoma of right breast, stage IIA**, diagnosis date 15 Mar 2026. Formal GMC consultant signature. This is the primary faster-fairer CI evidence document. |
| `doc_gdn_ci_pathology` | `histopathology_mitchell.pdf` | CLM-CI-2026-0089 | Medical | **Histopathology report** NHS trust format corroborating invasive ductal carcinoma; biopsy details; consistent with consultant letter 2 May 2026. |
| `doc_gdn_ci_halo_plan` | `halo_plan_mitchell.pdf` | CLM-CI-2026-0089 | Claim | **HALO support plan** one-pager: chemotherapy pathway, nurse contact, adviser update schedule. |
| `doc_gdn_life_death_cert` | `death_cert_clarke.pdf` | CLM-LIFE-2026-0033 | Legal | UK **death certificate** extract: David Clarke, died 20 Apr 2026 Leeds, cause cardiac arrest. |
| `doc_gdn_life_claim_form` | `life_claim_form_clarke.pdf` | CLM-LIFE-2026-0033 | Claim | Guardian **life claim form** completed by beneficiary Sarah Clarke, policy GDN-LP-2022-118902, sum assured £500,000, bank details. |
| `doc_gdn_life_funeral` | `funeral_invoice_clarke.pdf` | CLM-LIFE-2026-0033 | Financial | **Funeral director invoice** £9,850 to Clarke family, itemised services, supports £10,000 Funeral Payment Pledge advance. |
| `doc_gdn_life_probate` | `probate_draft_clarke.pdf` | CLM-LIFE-2026-0033 | Legal | Solicitor **draft probate application** cover sheet — grant not yet issued; estate of David Clarke; beneficiary Sarah Clarke. |
| `doc_gdn_life_bank` | `bank_verification_clarke.pdf` | CLM-LIFE-2026-0033 | Financial | **Bank verification** letter for Sarah Clarke BACS details (redacted account number). |
| `doc_gdn_nb_app` | `application_sharma_life_ci.pdf` | NB-2026-7721 | Financial | **Application summary** Priya Sharma: Guardian Life and Critical Illness Protection, £350,000, children’s CI rider, APP-7721, adviser Harriet Shaw. |
| `doc_gdn_nb_fact_find` | `fact_find_sharma.pdf` | NB-2026-7721 | Financial | IFA **fact find** excerpt (Shaw & Partners): needs analysis, affordability, protection gap, Reading UK address. |
| `doc_gdn_nb_mib` | `mib_results_sharma.pdf` | NB-2026-7721 | Financial | **MIB search results** screen/report: no adverse alerts, search date 11 May 2026. |
| `doc_gdn_nb_gp_request` | `gp_report_request_sharma.pdf` | NB-2026-7721 | Medical | **GP report request letter** from Guardian underwriting to Reading Medical Centre, ordered 12 May 2026, chase note 17 May — “not yet returned”. |
| `doc_gdn_nb_children_ci` | `children_ci_sharma.pdf` | NB-2026-7721 | Financial | **Children’s CI selection form** with two children named, signed Priya Sharma. |
| `doc_gdn_nb_tele_interview` | `tele_interview_sharma.pdf` | NB-2026-7721 | Medical | **Tele-interview notes** 14 May 2026: no adverse disclosures, non-smoker, standard travel/lifestyle. Interviewer Richard Daniels. |
| `doc_gdn_nb_s_app` | `application_hughes_essentials.pdf` | NB-2026-8804 | Financial | **Life Essentials** application Oliver Hughes, £100,000, simplified UW, APP-8804. |
| `doc_gdn_nb_s_tele_schedule` | `tele_schedule_hughes.pdf` | NB-2026-8804 | Financial | **Tele-interview appointment** confirmation 19 May 2026 10:00. |

## After files exist

1. Place PDFs under `public/documents/guardian/` matching filenames above.
2. Add `getGuardianDocumentPreviewUrl()` mirroring `getSbliDocumentPreviewUrl()` in `src/app/utils/`.
3. In `guardian-dataset.ts`, enrich documents with `fileAvailable: true` and `fileUrl` (same pattern as SBLI `enrichSbliDocument`).

## Record counts (dataset)

| Domain | Count |
|--------|------:|
| Cases | 5 |
| Requirements | 22 |
| Tasks | 21 |
| Documents | 22 |
| Requests | 5 |
| Document evidence | 2 |
| Activity events | 4 |
| Assistant responses | 7 |
