# SBLI Gap Analysis Against Current Amplify Entity Schema

Current schema source: `src/app/domain/dataArchitecture.ts` / `src/app/domain/objectRefs.ts`. Target model: `/Users/jmramon/Downloads/amplify_sbli_seed_data.json`.

## Dimension 1 — Database Field Gaps
ENTITY: case_types
FIELD: id
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD TABLE/COLUMN
RATIONALE: The SBLI seed requires explicit case type records and workflow stage metadata.

ENTITY: case_types
FIELD: code
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD TABLE/COLUMN
RATIONALE: The SBLI seed requires explicit case type records and workflow stage metadata.

ENTITY: case_types
FIELD: label
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD TABLE/COLUMN
RATIONALE: The SBLI seed requires explicit case type records and workflow stage metadata.

ENTITY: case_types
FIELD: category
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD TABLE/COLUMN
RATIONALE: The SBLI seed requires explicit case type records and workflow stage metadata.

ENTITY: case_types
FIELD: sub_type
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD TABLE/COLUMN
RATIONALE: The SBLI seed requires explicit case type records and workflow stage metadata.

ENTITY: case_types
FIELD: workflow_stages
TYPE: jsonb
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD TABLE/COLUMN
RATIONALE: The SBLI seed requires explicit case type records and workflow stage metadata.

ENTITY: cases
FIELD: case_number
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name / partial semantic match
RECOMMENDED ACTION: RENAME/MAP
RATIONALE: Seed uses `case_number` to drive case headers, workflow state, or general-information UI for SBLI demos.

ENTITY: cases
FIELD: case_type_id
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed uses `case_type_id` to drive case headers, workflow state, or general-information UI for SBLI demos.

ENTITY: cases
FIELD: case_type_label
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed uses `case_type_label` to drive case headers, workflow state, or general-information UI for SBLI demos.

ENTITY: cases
FIELD: case_sub_type
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name / partial semantic match
RECOMMENDED ACTION: RENAME/MAP
RATIONALE: Seed uses `case_sub_type` to drive case headers, workflow state, or general-information UI for SBLI demos.

ENTITY: cases
FIELD: current_stage
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name / partial semantic match
RECOMMENDED ACTION: RENAME/MAP
RATIONALE: Seed uses `current_stage` to drive case headers, workflow state, or general-information UI for SBLI demos.

ENTITY: cases
FIELD: sla_due
TYPE: date
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed uses `sla_due` to drive case headers, workflow state, or general-information UI for SBLI demos.

ENTITY: cases
FIELD: sla_status
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed uses `sla_status` to drive case headers, workflow state, or general-information UI for SBLI demos.

ENTITY: cases
FIELD: created_at
TYPE: date
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name / partial semantic match
RECOMMENDED ACTION: RENAME/MAP
RATIONALE: Seed uses `created_at` to drive case headers, workflow state, or general-information UI for SBLI demos.

ENTITY: cases
FIELD: updated_at
TYPE: date
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed uses `updated_at` to drive case headers, workflow state, or general-information UI for SBLI demos.

ENTITY: cases
FIELD: context_bar
TYPE: jsonb
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name / partial semantic match
RECOMMENDED ACTION: ADD JSONB COLUMN OR MAPPER
RATIONALE: Seed uses `context_bar` to drive case headers, workflow state, or general-information UI for SBLI demos.

ENTITY: cases
FIELD: workflow
TYPE: jsonb
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name / partial semantic match
RECOMMENDED ACTION: ADD JSONB COLUMN OR MAPPER
RATIONALE: Seed uses `workflow` to drive case headers, workflow state, or general-information UI for SBLI demos.

ENTITY: cases
FIELD: general_information
TYPE: jsonb
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name / partial semantic match
RECOMMENDED ACTION: ADD JSONB COLUMN OR MAPPER
RATIONALE: Seed uses `general_information` to drive case headers, workflow state, or general-information UI for SBLI demos.

ENTITY: cases
FIELD: application_fields
TYPE: jsonb
NULLABLE: no
APPLIES TO: NB_full_uw, NB_simplified
CURRENT STATE: missing
RECOMMENDED ACTION: ADD JSONB COLUMN OR MAPPER
RATIONALE: Seed uses `application_fields` to drive case headers, workflow state, or general-information UI for SBLI demos.

ENTITY: cases
FIELD: case_sub_type
TYPE: enum
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name + missing enum values
RECOMMENDED ACTION: RENAME/MAP + ADD ENUM VALUES
RATIONALE: Current `claimSubType` supports death/disability_benefit only; seed needs waiver_of_premium, death_benefit, full_underwriting, simplified_underwriting.

ENTITY: cases
FIELD: sla_status
TYPE: enum
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing enum value
RECOMMENDED ACTION: ADD ENUM VALUE / MAP
RATIONALE: Seed uses ok|warning|breached while current SLA status uses normal|warning|breached in contextCard.

ENTITY: requirements
FIELD: name
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name
RECOMMENDED ACTION: RENAME/MAP
RATIONALE: Seed `requirements` records require `name` for SBLI utility tabs, auditability, or AI display.

ENTITY: requirements
FIELD: stage
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `requirements` records require `stage` for SBLI utility tabs, auditability, or AI display.

ENTITY: requirements
FIELD: due_date
TYPE: date
NULLABLE: yes
APPLIES TO: all case types
CURRENT STATE: wrong name
RECOMMENDED ACTION: RENAME/MAP
RATIONALE: Seed `requirements` records require `due_date` for SBLI utility tabs, auditability, or AI display.

ENTITY: requirements
FIELD: notes
TYPE: string
NULLABLE: yes
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `requirements` records require `notes` for SBLI utility tabs, auditability, or AI display.

ENTITY: tasks
FIELD: task_id
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `tasks` records require `task_id` for SBLI utility tabs, auditability, or AI display.

ENTITY: tasks
FIELD: summary
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name
RECOMMENDED ACTION: RENAME/MAP
RATIONALE: Seed `tasks` records require `summary` for SBLI utility tabs, auditability, or AI display.

ENTITY: tasks
FIELD: stage
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `tasks` records require `stage` for SBLI utility tabs, auditability, or AI display.

ENTITY: tasks
FIELD: due_date
TYPE: date
NULLABLE: yes
APPLIES TO: all case types
CURRENT STATE: wrong name
RECOMMENDED ACTION: RENAME/MAP
RATIONALE: Seed `tasks` records require `due_date` for SBLI utility tabs, auditability, or AI display.

ENTITY: tasks
FIELD: ai_generated
TYPE: boolean
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `tasks` records require `ai_generated` for SBLI utility tabs, auditability, or AI display.

ENTITY: tasks
FIELD: ai_confidence
TYPE: decimal
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `tasks` records require `ai_confidence` for SBLI utility tabs, auditability, or AI display.

ENTITY: documents
FIELD: filename
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name
RECOMMENDED ACTION: RENAME/MAP
RATIONALE: Seed `documents` records require `filename` for SBLI utility tabs, auditability, or AI display.

ENTITY: documents
FIELD: stage
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `documents` records require `stage` for SBLI utility tabs, auditability, or AI display.

ENTITY: documents
FIELD: insight
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name
RECOMMENDED ACTION: RENAME/MAP
RATIONALE: Seed `documents` records require `insight` for SBLI utility tabs, auditability, or AI display.

ENTITY: documents
FIELD: uploaded_at
TYPE: date
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name
RECOMMENDED ACTION: RENAME/MAP
RATIONALE: Seed `documents` records require `uploaded_at` for SBLI utility tabs, auditability, or AI display.

ENTITY: documents
FIELD: ai_insight
TYPE: boolean
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `documents` records require `ai_insight` for SBLI utility tabs, auditability, or AI display.

ENTITY: documents
FIELD: ai_confidence
TYPE: decimal
NULLABLE: no
APPLIES TO: CD_death, NB_full_uw, NB_simplified
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `documents` records require `ai_confidence` for SBLI utility tabs, auditability, or AI display.

ENTITY: communications
FIELD: date
TYPE: date
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name
RECOMMENDED ACTION: RENAME/MAP
RATIONALE: Seed `communications` records require `date` for SBLI utility tabs, auditability, or AI display.

ENTITY: communications
FIELD: contact
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `communications` records require `contact` for SBLI utility tabs, auditability, or AI display.

ENTITY: communications
FIELD: stage
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `communications` records require `stage` for SBLI utility tabs, auditability, or AI display.

ENTITY: communications
FIELD: summary
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name
RECOMMENDED ACTION: RENAME/MAP
RATIONALE: Seed `communications` records require `summary` for SBLI utility tabs, auditability, or AI display.

ENTITY: communications
FIELD: assignee
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `communications` records require `assignee` for SBLI utility tabs, auditability, or AI display.

ENTITY: activities
FIELD: date
TYPE: date
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name
RECOMMENDED ACTION: RENAME/MAP
RATIONALE: Seed `activities` records require `date` for SBLI utility tabs, auditability, or AI display.

ENTITY: activities
FIELD: user
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name
RECOMMENDED ACTION: RENAME/MAP
RATIONALE: Seed `activities` records require `user` for SBLI utility tabs, auditability, or AI display.

ENTITY: activities
FIELD: action
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name
RECOMMENDED ACTION: RENAME/MAP
RATIONALE: Seed `activities` records require `action` for SBLI utility tabs, auditability, or AI display.

ENTITY: activities
FIELD: stage
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `activities` records require `stage` for SBLI utility tabs, auditability, or AI display.

ENTITY: activities
FIELD: detail
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `activities` records require `detail` for SBLI utility tabs, auditability, or AI display.

ENTITY: relationships
FIELD: name
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `relationships` records require `name` for SBLI utility tabs, auditability, or AI display.

ENTITY: relationships
FIELD: type
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `relationships` records require `type` for SBLI utility tabs, auditability, or AI display.

ENTITY: relationships
FIELD: role
TYPE: string
NULLABLE: no
APPLIES TO: all case types
CURRENT STATE: wrong name
RECOMMENDED ACTION: RENAME/MAP
RATIONALE: Seed `relationships` records require `role` for SBLI utility tabs, auditability, or AI display.

ENTITY: relationships
FIELD: policy_ref
TYPE: string
NULLABLE: no
APPLIES TO: CD_death, CD_disability
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `relationships` records require `policy_ref` for SBLI utility tabs, auditability, or AI display.

ENTITY: relationships
FIELD: contact
TYPE: string
NULLABLE: no
APPLIES TO: CD_death, CD_disability, NB_full_uw
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `relationships` records require `contact` for SBLI utility tabs, auditability, or AI display.

ENTITY: relationships
FIELD: case_ref
TYPE: string
NULLABLE: no
APPLIES TO: NB_full_uw, NB_simplified
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Seed `relationships` records require `case_ref` for SBLI utility tabs, auditability, or AI display.

ENTITY: requirements
FIELD: ai_insight
TYPE: boolean
NULLABLE: yes
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Prompt requires `ai_insight` for stage-aware utility tabs or AI feature rendering.

ENTITY: requirements
FIELD: ai_confidence
TYPE: decimal
NULLABLE: yes
APPLIES TO: all case types
CURRENT STATE: missing
RECOMMENDED ACTION: ADD COLUMN
RATIONALE: Prompt requires `ai_confidence` for stage-aware utility tabs or AI feature rendering.

ENTITY: communications
FIELD: channel
TYPE: enum
NULLABLE: no
APPLIES TO: NB_simplified
CURRENT STATE: missing enum values
RECOMMENDED ACTION: ADD ENUM VALUE
RATIONALE: Seed uses sms; prompt requires portal|email|phone|sms|fax|mail, while current model lacks sms/fax/mail and includes internal_note/letter.

ENTITY: requirements
FIELD: source
TYPE: enum
NULLABLE: yes
APPLIES TO: all case types
CURRENT STATE: wrong type / missing enum values
RECOMMENDED ACTION: ALTER COLUMN / ADD ENUM VALUES
RATIONALE: Current schema stores source as string; prompt requires governed source enum including claimant_portal, MIB, mvr_system, rx_database, ai_agent, sbli_com, broker_portal, telephony_system.


## Dimension 2 — UI / General Information Section Gaps
CASE TYPE: CD_disability
UI SECTION: Insured & policy
FIELD: product_type
JSON PATH: general_information.insured_and_policy.product_type
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: Insured & policy
FIELD: term_start
JSON PATH: general_information.insured_and_policy.term_start
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: Insured & policy
FIELD: term_end
JSON PATH: general_information.insured_and_policy.term_end
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: Insured & policy
FIELD: monthly_premium
JSON PATH: general_information.insured_and_policy.monthly_premium
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: Claim information
FIELD: rider
JSON PATH: general_information.claim_information.rider
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: Claim information
FIELD: waiting_period_satisfied
JSON PATH: general_information.claim_information.waiting_period_satisfied
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: Claim information
FIELD: diagnosis_primary
JSON PATH: general_information.claim_information.diagnosis_primary
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: Claim information
FIELD: diagnosis_secondary
JSON PATH: general_information.claim_information.diagnosis_secondary
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: Disability & occupation assessment
FIELD: occupation_class
JSON PATH: general_information.disability_assessment.occupation_class
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: Disability & occupation assessment
FIELD: disability_definition
JSON PATH: general_information.disability_assessment.disability_definition
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: Disability & occupation assessment
FIELD: unable_to_work_for_profit
JSON PATH: general_information.disability_assessment.unable_to_work_for_profit
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: Disability & occupation assessment
FIELD: rehab_potential
JSON PATH: general_information.disability_assessment.rehab_potential
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: Disability & occupation assessment
FIELD: rtw_target
JSON PATH: general_information.disability_assessment.rtw_target
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: Riders on policy
FIELD: rider_type
JSON PATH: general_information.riders_on_policy.rider_type
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: Riders on policy
FIELD: status
JSON PATH: general_information.riders_on_policy.status
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: Riders on policy
FIELD: claim_triggered
JSON PATH: general_information.riders_on_policy.claim_triggered
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: AI summary strip
FIELD: ai_summary
JSON PATH: general_information.ai_summary
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: AI summary strip
FIELD: ai_summary_confidence
JSON PATH: general_information.ai_summary_confidence
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_disability
UI SECTION: AI summary strip
FIELD: ai_summary_generated_at
JSON PATH: general_information.ai_summary_generated_at
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: Deceased insured & policy
FIELD: insured_status
JSON PATH: general_information.insured_and_policy.insured_status
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: Deceased insured & policy
FIELD: policy_status_at_death
JSON PATH: general_information.insured_and_policy.policy_status_at_death
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: Deceased insured & policy
FIELD: issue_date
JSON PATH: general_information.insured_and_policy.issue_date
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: Claim information
FIELD: contestability_period_months
JSON PATH: general_information.claim_information.contestability_period_months
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: Claim information
FIELD: policy_age_at_death_months
JSON PATH: general_information.claim_information.policy_age_at_death_months
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: Claim information
FIELD: contestability_lapsed
JSON PATH: general_information.claim_information.contestability_lapsed
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: Claim information
FIELD: manner_of_death
JSON PATH: general_information.claim_information.manner_of_death
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: Claim information
FIELD: accelerated_death_benefit_triggered
JSON PATH: general_information.claim_information.accelerated_death_benefit_triggered
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: Beneficiary information
FIELD: share_percentage
JSON PATH: general_information.beneficiary_information.share_percentage
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: Beneficiary information
FIELD: payment_method
JSON PATH: general_information.beneficiary_information.payment_method
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: Beneficiary information
FIELD: bank_verified
JSON PATH: general_information.beneficiary_information.bank_verified
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: Beneficiary information
FIELD: contingent_beneficiary
JSON PATH: general_information.beneficiary_information.contingent_beneficiary
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: Riders on policy
FIELD: rider_type
JSON PATH: general_information.riders_on_policy.rider_type
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: Riders on policy
FIELD: claim_triggered
JSON PATH: general_information.riders_on_policy.claim_triggered
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: Riders on policy
FIELD: notes
JSON PATH: general_information.riders_on_policy.notes
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: AI summary strip
FIELD: ai_summary
JSON PATH: general_information.ai_summary
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: AI summary strip
FIELD: ai_summary_confidence
JSON PATH: general_information.ai_summary_confidence
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: CD_death
UI SECTION: AI summary strip
FIELD: ai_summary_generated_at
JSON PATH: general_information.ai_summary_generated_at
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: Application intake
FIELD: distribution_channel
JSON PATH: general_information.application_intake.distribution_channel
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: Application intake
FIELD: underwriting_path
JSON PATH: general_information.application_intake.underwriting_path
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: Application intake
FIELD: underwriting_path_reason
JSON PATH: general_information.application_intake.underwriting_path_reason
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: Health profile
FIELD: mib_flag_detail
JSON PATH: general_information.health_profile.mib_flag_detail
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: Health profile
FIELD: smoker_verified_via
JSON PATH: general_information.health_profile.smoker_verified_via
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: Health profile
FIELD: hba1c_unit
JSON PATH: general_information.health_profile.hba1c_unit
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: Health profile
FIELD: hba1c_date
JSON PATH: general_information.health_profile.hba1c_date
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: AI scoring
FIELD: factors
JSON PATH: general_information.ai_scoring.factors
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: AI scoring
FIELD: net_debits
JSON PATH: general_information.ai_scoring.net_debits
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: AI scoring
FIELD: anticipated_offer
JSON PATH: general_information.ai_scoring.anticipated_offer
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: Riders selected
FIELD: rider_type
JSON PATH: general_information.riders_selected.rider_type
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: Riders selected
FIELD: status
JSON PATH: general_information.riders_selected.status
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: Riders selected
FIELD: notes
JSON PATH: general_information.riders_selected.notes
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: Conversion option
FIELD: convert_to
JSON PATH: general_information.conversion_option.convert_to
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: Conversion option
FIELD: deadline
JSON PATH: general_information.conversion_option.deadline
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: Conversion option
FIELD: new_medical_exam_required
JSON PATH: general_information.conversion_option.new_medical_exam_required
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: Application tab
FIELD: personal
JSON PATH: application_fields.personal
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: Application tab
FIELD: coverage
JSON PATH: application_fields.coverage
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: Application tab
FIELD: riders
JSON PATH: application_fields.riders
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_full_uw
UI SECTION: Application tab
FIELD: health
JSON PATH: application_fields.health
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_simplified
UI SECTION: Application intake
FIELD: same_day_coverage_eligible
JSON PATH: general_information.application_intake.same_day_coverage_eligible
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_simplified
UI SECTION: Application intake
FIELD: monthly_premium_indicative
JSON PATH: general_information.application_intake.monthly_premium_indicative
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_simplified
UI SECTION: Accelerated UW eligibility
FIELD: age_limit
JSON PATH: general_information.accelerated_uw_eligibility.age_limit
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_simplified
UI SECTION: Accelerated UW eligibility
FIELD: coverage_limit
JSON PATH: general_information.accelerated_uw_eligibility.coverage_limit
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_simplified
UI SECTION: Accelerated UW eligibility
FIELD: all_criteria_passed
JSON PATH: general_information.accelerated_uw_eligibility.all_criteria_passed
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_simplified
UI SECTION: Accelerated UW eligibility
FIELD: medical_exam_required
JSON PATH: general_information.accelerated_uw_eligibility.medical_exam_required
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_simplified
UI SECTION: Health questionnaire
FIELD: sections
JSON PATH: general_information.health_questionnaire.sections
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_simplified
UI SECTION: Health questionnaire
FIELD: interview_date
JSON PATH: general_information.health_questionnaire.interview_date
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_simplified
UI SECTION: Health questionnaire
FIELD: interview_time
JSON PATH: general_information.health_questionnaire.interview_time
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_simplified
UI SECTION: Health questionnaire
FIELD: interviewer
JSON PATH: general_information.health_questionnaire.interviewer
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_simplified
UI SECTION: Riders included
FIELD: rider_type
JSON PATH: general_information.riders_included.rider_type
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_simplified
UI SECTION: Riders included
FIELD: status
JSON PATH: general_information.riders_included.status
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_simplified
UI SECTION: Riders included
FIELD: notes
JSON PATH: general_information.riders_included.notes
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_simplified
UI SECTION: Conversion option
FIELD: convert_to
JSON PATH: general_information.conversion_option.convert_to
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_simplified
UI SECTION: Conversion option
FIELD: deadline
JSON PATH: general_information.conversion_option.deadline
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE

CASE TYPE: NB_simplified
UI SECTION: Conversion option
FIELD: new_medical_exam_required
JSON PATH: general_information.conversion_option.new_medical_exam_required
CURRENT STATE: not modeled as a typed field; generic `generalInformation.sections` can display only after mapping
ACTION: ADD TO ENTITY MODEL + ADD TO UI CARD/WIRE TO CORRECT SOURCE


## Dimension 3 — AI Section Gaps
AI FEATURE: AI case summary strip
CASE TYPES: all case types
JSON PATH: cases[].general_information.ai_summary|ai_summary_confidence|ai_summary_generated_at
CURRENT STATE: partial
ENTITY CHANGES NEEDED: cases.analysis.narrative/confidence exists, but generated_at and UI strip source mapping are missing
UI CHANGES NEEDED: Blue left-border strip above General Information cards
AGENT TYPE: ai_narrative

AI FEATURE: AI task flag
CASE TYPES: all case types
JSON PATH: cases[].tasks[].ai_generated|ai_confidence
CURRENT STATE: not modeled
ENTITY CHANGES NEEDED: tasks.ai_generated boolean, tasks.ai_confidence decimal
UI CHANGES NEEDED: Task prefix, purple AI Agent assignee tag, confidence in task detail
AGENT TYPE: ai_agent_assisted

AI FEATURE: AI document insight
CASE TYPES: CD_death, NB_full_uw, NB_simplified
JSON PATH: cases[].documents[].ai_insight|ai_confidence|insight
CURRENT STATE: partial
ENTITY CHANGES NEEDED: documents.insight text, ai_insight boolean, ai_confidence decimal
UI CHANGES NEEDED: Insight column with AI source badge
AGENT TYPE: ai_agent_assisted

AI FEATURE: AI debit/credit scoring
CASE TYPES: NB_full_uw
JSON PATH: cases[].general_information.ai_scoring
CURRENT STATE: partial
ENTITY CHANGES NEEDED: cases.underwritingScoring mapper for factors direction/points/confidence, net_debits, anticipated_offer
UI CHANGES NEEDED: Scoring card + dedicated scoring tab
AGENT TYPE: ai_agent_automated

AI FEATURE: AI contestability comparison
CASE TYPES: CD_death
JSON PATH: task_cd6120 and doc_cd44_7
CURRENT STATE: not modeled
ENTITY CHANGES NEEDED: task ai flags + document insight/confidence + source=ai_agent enum
UI CHANGES NEEDED: AI badge on task and document confidence/source tag
AGENT TYPE: ai_agent_automated

AI FEATURE: AI accelerated UW eligibility check
CASE TYPES: NB_simplified
JSON PATH: task_nb2011, task_nb2012, doc_nb98_3, accelerated_uw_eligibility
CURRENT STATE: not modeled
ENTITY CHANGES NEEDED: task/document AI flags + accelerated_uw_eligibility jsonb
UI CHANGES NEEDED: Checklist card with pass/fail criteria
AGENT TYPE: ai_agent_automated

AI FEATURE: AI health questionnaire scoring
CASE TYPES: NB_simplified
JSON PATH: task_nb2030, health_questionnaire.sections
CURRENT STATE: not modeled
ENTITY CHANGES NEEDED: questionnaire jsonb + task confidence nullable
UI CHANGES NEEDED: AI badge with post-interview confidence
AGENT TYPE: ai_agent_automated

AI FEATURE: AI narrative generation
CASE TYPES: CD_disability
JSON PATH: task_cd5211
CURRENT STATE: not modeled
ENTITY CHANGES NEEDED: task ai_generated, ai_confidence, narrative output link
UI CHANGES NEEDED: AI task badge and confidence in task detail
AGENT TYPE: ai_narrative


## Dimension 4 — Stage Column Gap (Utility Tabs)
ENTITY: requirements
FIELD: stage
CURRENT STATE: missing
ACTION: ADD COLUMN TO TABLE + ADD COLUMN TO UI + BACKFILL DATA
DISPLAY: Stage chip — small pill with stage label, neutral background, rendered in Stage column of each utility tab table
FILTER BEHAVIOR: Stage column should support filter-by-stage dropdown to show only records from a given stage

ENTITY: tasks
FIELD: stage
CURRENT STATE: missing
ACTION: ADD COLUMN TO TABLE + ADD COLUMN TO UI + BACKFILL DATA
DISPLAY: Stage chip — small pill with stage label, neutral background, rendered in Stage column of each utility tab table
FILTER BEHAVIOR: Stage column should support filter-by-stage dropdown to show only records from a given stage

ENTITY: documents
FIELD: stage
CURRENT STATE: missing
ACTION: ADD COLUMN TO TABLE + ADD COLUMN TO UI + BACKFILL DATA
DISPLAY: Stage chip — small pill with stage label, neutral background, rendered in Stage column of each utility tab table
FILTER BEHAVIOR: Stage column should support filter-by-stage dropdown to show only records from a given stage

ENTITY: communications
FIELD: stage
CURRENT STATE: missing
ACTION: ADD COLUMN TO TABLE + ADD COLUMN TO UI + BACKFILL DATA
DISPLAY: Stage chip — small pill with stage label, neutral background, rendered in Stage column of each utility tab table
FILTER BEHAVIOR: Stage column should support filter-by-stage dropdown to show only records from a given stage

ENTITY: activities
FIELD: stage
CURRENT STATE: missing
ACTION: ADD COLUMN TO TABLE + ADD COLUMN TO UI + BACKFILL DATA
DISPLAY: Stage chip — small pill with stage label, neutral background, rendered in Stage column of each utility tab table
FILTER BEHAVIOR: Stage column should support filter-by-stage dropdown to show only records from a given stage


## Dimension 5 — Seed INSERT Statements

```sql
-- Migration-aware SBLI seed script. GAP comments mark seed fields without current schema support.
-- GAP: table 'case_types' is not represented in ENTITY_SCHEMA_DEFINITIONS; app currently uses workflow definitions / caseTypeCode.
INSERT INTO case_types (id /* code, label, category, sub_type, workflow_stages */) VALUES ('ct_claim_disability'); -- GAP: code='CD', label='Claim — Disability / Waiver of premium', category='claim', sub_type='waiver_of_premium', workflow_stages='["fnol_received","initial_triage","requirement_gathering","medical_review","decision"]'
INSERT INTO case_types (id /* code, label, category, sub_type, workflow_stages */) VALUES ('ct_claim_death'); -- GAP: code='CD', label='Claim — Death benefit', category='claim', sub_type='death_benefit', workflow_stages='["fnol_received","initial_triage","requirement_gathering","contestability_review","decision"]'
INSERT INTO case_types (id /* code, label, category, sub_type, workflow_stages */) VALUES ('ct_nb_full_uw'); -- GAP: code='NB', label='New business — Full underwriting', category='new_business', sub_type='full_underwriting', workflow_stages='["application_received","initial_review","requirement_gathering","underwriting_review","decision"]'
INSERT INTO case_types (id /* code, label, category, sub_type, workflow_stages */) VALUES ('ct_nb_simplified'); -- GAP: code='NB', label='New business — Simplified / accelerated underwriting', category='new_business', sub_type='simplified_underwriting', workflow_stages='["application_received","tele_interview","questionnaire_review","decision"]'
-- CASE CD26-5546112
-- GAP: cases.case_type_id, case_type_label, case_sub_type (NB values), current_stage, sla_due, sla_status, context_bar, workflow, updated_at are not first-class current columns.
INSERT INTO cases (id, kind, caseKind, claimSubType, caseTypeCode, workflowTemplateId, title, status, createdAt, activeStepId, owner, contextCard, workflowState, generalInformation, analysis, linkedObjects, moduleSummaries, facts, sections) VALUES ('CD26-5546112', 'case', 'claim', 'disability_benefit', 'CD', 'ct_claim_disability', 'Claim — Waiver of premium', 'pending_decision', '2026-01-30', 'decision', '{"kind":"user","id":"Victor Ramon","label":"Victor Ramon"}', '{"slot_1_label":"Claimant","slot_1_value":"Billy Bud","slot_2_label":"Policy","slot_2_value":"SBLI Term Life 20","slot_2_ref":"SBLI-TL-2021-004821","slot_3_label":"Death benefit","slot_3_value":"$500,000","slot_4_label":"SLA","slot_4_value":"Today","slot_4_alert":"danger"}', '[{"stage_id":"fnol_received","label":"FNOL received","status":"complete","order":1},{"stage_id":"initial_triage","label":"Initial triage","status":"complete","order":2},{"stage_id":"requirement_gathering","label":"Req. gathering","status":"complete","order":3},{"stage_id":"medical_review","label":"Medical review","status":"complete","order":4},{"stage_id":"decision","label":"Decision","status":"active","sub_label":"Ready","order":5}]', '{"ai_summary":"Billy Bud, insured under SBLI Term Life 20 ($500,000 / 20-year, issued Mar 2021), has filed a Waiver of Premium claim following a motorcycle accident on Jan 30, 2026 resulting in multiple leg fractures and right knee replacement. Own-occupation disability confirmed. Waiting period of 90 days satisfied Apr 30, 2026. All medical evidence received. No policy exclusions triggered. Rider conditions met — case ready for approval decision.","ai_summary_confidence":0.91,"ai_summary_generated_at":"2026-03-09","insured_and_policy":{"insured_name":"Billy Bud","date_of_birth":"1984-03-12","policy_number":"SBLI-TL-2021-004821","product":"SBLI Term Life 20","product_type":"term_life","death_benefit":500000,"term_years":20,"term_start":"2021-03-01","term_end":"2041-03-01","monthly_premium":38,"policy_status":"in_force"},"claim_information":{"claim_number":"CD26-5546112","claim_sub_type":"waiver_of_premium","rider":"Waiver of Premium rider","date_of_loss":"2026-01-30","disability_onset":"2026-01-30","waiting_period_days":90,"waiting_period_end":"2026-04-30","waiting_period_satisfied":true,"cause":"Motorcycle accident — multiple leg fractures, right knee replacement","diagnosis_primary":"S82.2","diagnosis_secondary":"M17.1","pre_existing_conditions":["Type 2 Diabetes (2016) — diet-controlled"],"exclusion_triggered":false},"disability_assessment":{"occupation":"Motorcycle courier","occupation_class":"Class 4 (manual)","disability_definition":"total_disability_unable_to_work_for_profit","total_disability_confirmed":true,"unable_to_work_for_profit":true,"last_day_worked":"2026-01-30","employer":"FastRoute Couriers Ltd","employer_contact":"hr@fastroute.com","rehab_potential":"moderate","rtw_target":"TBD post-decision"},"riders_on_policy":[{"rider_type":"waiver_of_premium","status":"active","claim_triggered":true},{"rider_type":"accidental_death_benefit","status":"active","claim_triggered":false},{"rider_type":"legacy_shield","status":"active"}]}', '{"narrative":"Billy Bud, insured under SBLI Term Life 20 ($500,000 / 20-year, issued Mar 2021), has filed a Waiver of Premium claim following a motorcycle accident on Jan 30, 2026 resulting in multiple leg fractures and right knee replacement. Own-occupation disability confirmed. Waiting period of 90 days satisfied Apr 30, 2026. All medical evidence received. No policy exclusions triggered. Rider conditions met — case ready for approval decision.","confidence":0.91,"generatedAt":"2026-03-09"}', '[]', '[]', '[]', '[]');
-- CASE CD44-6679812
-- GAP: cases.case_type_id, case_type_label, case_sub_type (NB values), current_stage, sla_due, sla_status, context_bar, workflow, updated_at are not first-class current columns.
INSERT INTO cases (id, kind, caseKind, claimSubType, caseTypeCode, workflowTemplateId, title, status, createdAt, activeStepId, owner, contextCard, workflowState, generalInformation, analysis, linkedObjects, moduleSummaries, facts, sections) VALUES ('CD44-6679812', 'case', 'claim', 'death', 'CD', 'ct_claim_death', 'Claim — Death benefit', 'pending_decision', '2026-02-03', 'contestability_review', '{"kind":"user","id":"Victor Ramon","label":"Victor Ramon"}', '{"slot_1_label":"Claimant","slot_1_value":"Marie Dupont (beneficiary)","slot_2_label":"Policy","slot_2_value":"SBLI Term Life 20","slot_2_ref":"SBLI-TL-2019-009102","slot_3_label":"Death benefit","slot_3_value":"$500,000","slot_4_label":"SLA","slot_4_value":"3d remaining","slot_4_alert":"warning"}', '[{"stage_id":"fnol_received","label":"FNOL received","status":"complete","order":1},{"stage_id":"initial_triage","label":"Initial triage","status":"complete","order":2},{"stage_id":"requirement_gathering","label":"Req. gathering","status":"complete","order":3},{"stage_id":"contestability_review","label":"Contestability review","status":"active","sub_label":"Active","order":4},{"stage_id":"decision","label":"Decision","status":"pending","order":5}]', '{"ai_summary":"Death benefit claim filed Feb 3, 2026 by Marie Dupont (spouse/primary beneficiary) following the death of insured Thomas Dupont on Jan 28, 2026. Cause of death: acute myocardial infarction. Policy SBLI-TL-2019-009102 (Term Life 20, $500,000) issued Feb 2019 — contestability window of 2 years has fully lapsed (6y 11m in force at death). APS, toxicology, and identity verification complete. No exclusions. Ready for final decision and $500k ACH payout.","ai_summary_confidence":0.95,"ai_summary_generated_at":"2026-05-10","insured_and_policy":{"insured_name":"Thomas Dupont","insured_status":"deceased","date_of_birth":"1971-06-15","date_of_death":"2026-01-28","policy_number":"SBLI-TL-2019-009102","product":"SBLI Term Life 20","product_type":"term_life","death_benefit":500000,"term_years":20,"issue_date":"2019-02-01","policy_status_at_death":"in_force"},"claim_information":{"claim_number":"CD44-6679812","claim_sub_type":"death_benefit","date_of_death":"2026-01-28","claim_filed_date":"2026-02-03","cause_of_death":"Acute myocardial infarction","icd10_code":"I21.9","manner_of_death":"natural","contestability_period_months":24,"policy_age_at_death_months":83,"contestability_lapsed":true,"exclusions_identified":false,"accelerated_death_benefit_triggered":false},"beneficiary_information":{"primary_beneficiary":"Marie Dupont","relationship":"spouse","share_percentage":100,"identity_verified":true,"address":"412 Maple St, Portland, OR","payment_method":"ach_bank_transfer","bank_verified":true,"contingent_beneficiary":"Sophie Dupont (daughter)"},"riders_on_policy":[{"rider_type":"accelerated_death_benefit","status":"active","claim_triggered":false,"notes":"Death benefit — ADB applies to terminal illness only"},{"rider_type":"accidental_death_benefit","status":"active","claim_triggered":false},{"rider_type":"legacy_shield","status":"active"}]}', '{"narrative":"Death benefit claim filed Feb 3, 2026 by Marie Dupont (spouse/primary beneficiary) following the death of insured Thomas Dupont on Jan 28, 2026. Cause of death: acute myocardial infarction. Policy SBLI-TL-2019-009102 (Term Life 20, $500,000) issued Feb 2019 — contestability window of 2 years has fully lapsed (6y 11m in force at death). APS, toxicology, and identity verification complete. No exclusions. Ready for final decision and $500k ACH payout.","confidence":0.95,"generatedAt":"2026-05-10"}', '[]', '[]', '[]', '[]');
-- CASE NB66-7622343
-- GAP: cases.case_type_id, case_type_label, case_sub_type (NB values), current_stage, sla_due, sla_status, context_bar, workflow, updated_at are not first-class current columns.
INSERT INTO cases (id, kind, caseKind, claimSubType, caseTypeCode, workflowTemplateId, title, status, createdAt, activeStepId, owner, contextCard, workflowState, generalInformation, analysis, linkedObjects, moduleSummaries, facts, sections) VALUES ('NB66-7622343', 'case', 'new_business', NULL, 'NB', 'ct_nb_full_uw', 'New business — Full underwriting', 'active', '2026-05-12', 'requirement_gathering', '{"kind":"user","id":"Victor Ramon","label":"Victor Ramon"}', '{"slot_1_label":"Applicant","slot_1_value":"Marc Tremblay","slot_2_label":"Product","slot_2_value":"SBLI Term Life 20","slot_2_ref":"APP-7622343","slot_3_label":"Death benefit","slot_3_value":"$625,000","slot_4_label":"SLA","slot_4_value":"5d remaining","slot_4_alert":null}', '[{"stage_id":"application_received","label":"App. received","status":"complete","order":1},{"stage_id":"initial_review","label":"Initial review","status":"complete","order":2},{"stage_id":"requirement_gathering","label":"Req. gathering","status":"active","sub_label":"In progress","order":3},{"stage_id":"underwriting_review","label":"UW review","status":"pending","order":4},{"stage_id":"decision","label":"Decision","status":"pending","order":5}]', '{"ai_summary":"Marc Tremblay, age 42, applied for SBLI Term Life 20 — $625,000 death benefit, 20-year term via SBLI broker network. Non-smoker, BMI 27.4. Disclosed T2 Diabetes (2019, diet-controlled, HbA1c 48). MIB hit: prior decline 2022 — explanation required. MIB flag disqualifies accelerated underwriting. Paramedical exam scheduled May 19. APS outstanding. AI preliminary scoring: +75 debits — rated offer anticipated.","ai_summary_confidence":0.88,"ai_summary_generated_at":"2026-05-13","application_intake":{"applicant_name":"Marc Tremblay","date_of_birth":"1983-06-03","application_date":"2026-05-12","distribution_channel":"sbli_broker_network","broker":"Northstar Advisory","product":"SBLI Term Life 20","product_type":"term_life","death_benefit":625000,"term_years":20,"monthly_premium_indicative":85,"underwriting_path":"traditional","underwriting_path_reason":"MIB flag — prior decline disqualifies accelerated UW"},"health_profile":{"height_in":70,"weight_lbs":192,"bmi":27.4,"bmi_classification":"overweight","smoker_status":"non_smoker","smoker_verified_via":"rx_database","disclosed_conditions":["Type 2 Diabetes (2019) — diet-controlled"],"hba1c":48,"hba1c_unit":"mmol/mol","hba1c_date":"2025-01-01","medications":["Metformin 500mg"],"mib_flag":true,"mib_flag_detail":"Prior decline — 2022, carrier unknown","family_history":["Father: MI age 58"]},"ai_scoring":{"preliminary_debit_total":75,"preliminary_credit_total":50,"net_debits":25,"anticipated_offer":"rated","scoring_status":"preliminary","factors":[{"factor":"Type 2 Diabetes (diet-controlled)","category":"medical","direction":"debit","points":50,"confidence":"high"},{"factor":"BMI 27.4","category":"build","direction":"debit","points":25,"confidence":"high"},{"factor":"Non-smoker (verified)","category":"lifestyle","direction":"credit","points":-30,"confidence":"high"},{"factor":"HbA1c well-controlled","category":"medical","direction":"credit","points":-20,"confidence":"high"},{"factor":"MIB prior decline — unresolved","category":"investigative","direction":"debit","points":50,"confidence":"pending","flag":"unresolved"},{"factor":"Father MI age 58","category":"family_history","direction":"watch","points":15,"confidence":"pending_aps"},{"factor":"Paramedical exam results","category":"medical","direction":"pending","points":null,"confidence":"awaiting"}]},"riders_selected":[{"rider_type":"accelerated_death_benefit","status":"included_free","notes":"Up to 50% of benefit — terminal illness"},{"rider_type":"waiver_of_premium","status":"selected"},{"rider_type":"accidental_death_benefit","status":"selected"}],"conversion_option":{"eligible":true,"convert_to":"SBLI Whole Life","deadline":"before_age_70","new_medical_exam_required":false}}', '{"narrative":"Marc Tremblay, age 42, applied for SBLI Term Life 20 — $625,000 death benefit, 20-year term via SBLI broker network. Non-smoker, BMI 27.4. Disclosed T2 Diabetes (2019, diet-controlled, HbA1c 48). MIB hit: prior decline 2022 — explanation required. MIB flag disqualifies accelerated underwriting. Paramedical exam scheduled May 19. APS outstanding. AI preliminary scoring: +75 debits — rated offer anticipated.","confidence":0.88,"generatedAt":"2026-05-13"}', '[]', '[]', '[]', '[]');
-- GAP: cases.application_fields does not exist; seed value for NB66-7622343: {"personal":{"full_name":"Marc Tremblay","date_of_birth":"1983-06-03","ssn_last4":"7821"},"coverage":{"product":"SBLI Term Life 20","death_benefit":625000,"term_years":20,"beneficiary_1":"Claire Tremblay (spouse) — 70%","beneficiary_2":"Thomas Tremblay (child) — 30%"},"riders":{"accelerated_death_benefit":true,"waiver_of_premium":true,"accidental_death_benefit":true},"health":{"smoker_status":"non_smoker","disclosed_condition":"T2 Diabetes — 2019","prior_decline":true,"prior_decline_year":2022}}
-- CASE NB98-9989870
-- GAP: cases.case_type_id, case_type_label, case_sub_type (NB values), current_stage, sla_due, sla_status, context_bar, workflow, updated_at are not first-class current columns.
INSERT INTO cases (id, kind, caseKind, claimSubType, caseTypeCode, workflowTemplateId, title, status, createdAt, activeStepId, owner, contextCard, workflowState, generalInformation, analysis, linkedObjects, moduleSummaries, facts, sections) VALUES ('NB98-9989870', 'case', 'new_business', NULL, 'NB', 'ct_nb_simplified', 'New business — Simplified / accelerated underwriting', 'active', '2026-05-13', 'tele_interview', '{"kind":"user","id":"Richard Daniels","label":"Richard Daniels"}', '{"slot_1_label":"Applicant","slot_1_value":"Elena Rossi","slot_2_label":"Product","slot_2_value":"SBLI Simple Term Life","slot_2_ref":"APP-998987","slot_3_label":"Death benefit","slot_3_value":"$350,000","slot_4_label":"SLA","slot_4_value":"2d remaining","slot_4_alert":"warning"}', '[{"stage_id":"application_received","label":"App. received","status":"complete","order":1},{"stage_id":"tele_interview","label":"Tele-interview","status":"active","sub_label":"Pending","order":2},{"stage_id":"questionnaire_review","label":"Questionnaire review","status":"pending","order":3},{"stage_id":"decision","label":"Decision","status":"pending","order":4}]', '{"ai_summary":"Elena Rossi, age 35, applied online for SBLI Simple Term Life — $350,000 death benefit, 20-year term. Accelerated underwriting path confirmed: age 18–50 ✓, coverage under $1M ✓, no adverse disclosures ✓, no MIB alerts ✓. Tele-interview scheduled May 17. In-house health questionnaire covers cardiovascular, respiratory, musculoskeletal, and mental health. Anticipated clean pass — standard rates likely. Same-day coverage eligible pending interview completion.","ai_summary_confidence":0.95,"ai_summary_generated_at":"2026-05-13","application_intake":{"applicant_name":"Elena Rossi","date_of_birth":"1991-01-22","application_date":"2026-05-13","distribution_channel":"direct_sbli_com","product":"SBLI Simple Term Life","product_type":"simple_term_life","death_benefit":350000,"term_years":20,"monthly_premium_indicative":22,"underwriting_path":"accelerated_no_exam","same_day_coverage_eligible":true},"accelerated_uw_eligibility":{"age_eligible":true,"age_at_entry":35,"age_limit":50,"coverage_eligible":true,"coverage_amount":350000,"coverage_limit":1000000,"adverse_disclosures":false,"mib_alert":false,"smoker_status":"non_smoker","bmi_self_declared":23.1,"bmi_classification":"normal","medical_exam_required":false,"all_criteria_passed":true},"health_questionnaire":{"sections":[{"section":"cardiovascular","status":"pending"},{"section":"respiratory","status":"pending"},{"section":"musculoskeletal","status":"pending"},{"section":"mental_health","status":"pending"}],"interview_date":"2026-05-17","interview_time":"10:00","interviewer":"Richard Daniels"},"riders_included":[{"rider_type":"accelerated_death_benefit","status":"included_free","notes":"Up to 50% of benefit — terminal illness"},{"rider_type":"legacy_shield","status":"included_free","notes":"Digital estate planning vault"}],"conversion_option":{"eligible":true,"convert_to":"SBLI Whole Life","deadline":"before_age_70","new_medical_exam_required":false}}', '{"narrative":"Elena Rossi, age 35, applied online for SBLI Simple Term Life — $350,000 death benefit, 20-year term. Accelerated underwriting path confirmed: age 18–50 ✓, coverage under $1M ✓, no adverse disclosures ✓, no MIB alerts ✓. Tele-interview scheduled May 17. In-house health questionnaire covers cardiovascular, respiratory, musculoskeletal, and mental health. Anticipated clean pass — standard rates likely. Same-day coverage eligible pending interview completion.","confidence":0.95,"generatedAt":"2026-05-13"}', '[]', '[]', '[]', '[]');
-- GAP: cases.application_fields does not exist; seed value for NB98-9989870: {"personal":{"full_name":"Elena Rossi","date_of_birth":"1991-01-22","ssn_last4":"4412"},"coverage":{"product":"SBLI Simple Term Life","death_benefit":350000,"term_years":20,"beneficiary":"Marco Rossi (spouse) — 100%"},"riders":{"accelerated_death_benefit":true,"legacy_shield":true},"health":{"smoker_status":"non_smoker","bmi_self_declared":23.1,"adverse_disclosures":false}}
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_cd26_1', 'FNOL — Waiver of Premium claim form', 'documentation', 'fulfilled', '2026-01-30', 'claimant_portal', '[{"kind":"case","id":"CD26-5546112"}]' /* 'fnol_received', 'SBLI WOP claim form submitted' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_cd26_2', 'Policy in-force & rider verification', 'compliance', 'fulfilled', '2026-02-02', 'policy_admin', '[{"kind":"case","id":"CD26-5546112"}]' /* 'initial_triage', 'WOP rider confirmed active' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_cd26_3', 'Employer Confirmation of Inability to Work', 'employment', 'fulfilled', '2026-02-10', 'employer_portal', '[{"kind":"case","id":"CD26-5546112"}]' /* 'requirement_gathering', 'FastRoute HR confirmed' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_cd26_4', 'Attending Physician Statement (APS)', 'medical', 'fulfilled', '2026-02-20', 'medical_provider', '[{"kind":"case","id":"CD26-5546112"}]' /* 'requirement_gathering', 'Dr. Chen — orthopedics, St. Luke''s' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_cd26_5', 'Surgical Report — Right Knee Replacement', 'medical', 'fulfilled', '2026-03-05', 'medical_provider', '[{"kind":"case","id":"CD26-5546112"}]' /* 'medical_review', 'St. Luke''s Hospital OR report' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_cd26_6', 'Functional Capacity Evaluation (FCE)', 'medical', 'overdue', '2026-03-10', 'specialist_upload', '[{"kind":"case","id":"CD26-5546112"}]' /* 'medical_review', 'Required to confirm total disability standard' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_cd26_7', 'Pre-disability Earnings Verification', 'financial', 'overdue', '2026-05-01', 'payroll_system', '[{"kind":"case","id":"CD26-5546112"}]' /* 'decision', 'Required to establish premium waiver period' */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd5180', 'Register WOP claim & verify rider in force', 'done', 'medium', 'Victor Ramon', '[{"kind":"case","id":"CD26-5546112"}]' /* 'CD-5180', 'fnol_received', '2026-01-30', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd5181', 'Triage: assign to life claims — WOP', 'done', 'medium', 'System', '[{"kind":"case","id":"CD26-5546112"}]' /* 'CD-5181', 'initial_triage', '2026-02-01', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd5190', 'Request employer inability-to-work confirmation', 'done', 'high', 'Victor Ramon', '[{"kind":"case","id":"CD26-5546112"}]' /* 'CD-5190', 'requirement_gathering', '2026-02-08', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd5191', 'Order APS from Dr. Chen', 'done', 'high', 'Victor Ramon', '[{"kind":"case","id":"CD26-5546112"}]' /* 'CD-5191', 'requirement_gathering', '2026-02-10', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd5203', 'Chase FCE — overdue', 'in_queue', 'high', 'Richard Daniels', '[{"kind":"case","id":"CD26-5546112"}]' /* 'CD-5203', 'medical_review', '2026-05-15', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd5210', 'Review surgical report & APS for total disability', 'done', 'high', 'Victor Ramon', '[{"kind":"case","id":"CD26-5546112"}]' /* 'CD-5210', 'medical_review', '2026-03-08', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd5211', 'AI: generate total disability assessment narrative', 'done', 'medium', 'AI Agent', '[{"kind":"case","id":"CD26-5546112"}]' /* 'CD-5211', 'medical_review', '2026-03-09', TRUE, 0.91 */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd5220', 'Chase pre-disability earnings verification', 'in_queue', 'high', 'Richard Daniels', '[{"kind":"case","id":"CD26-5546112"}]' /* 'CD-5220', 'decision', '2026-05-15', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd5221', 'Approve WOP rider — waive premiums', 'in_queue', 'high', 'Victor Ramon', '[{"kind":"case","id":"CD26-5546112"}]' /* 'CD-5221', 'decision', '2026-05-15', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_cd26_1', 'WOP_claim_form_bud.pdf', 'claim', 'validated', '2026-01-30', 'claimant_portal', 'WOP claim complete — total disability cited', TRUE, '[{"kind":"case","id":"CD26-5546112"}]' /* 'fnol_received', 'WOP claim complete — total disability cited', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_cd26_2', 'policy_SBLI_TL2021_004821.pdf', 'policy', 'validated', '2026-02-01', 'policy_admin', 'Term Life 20 in force — WOP rider confirmed active', TRUE, '[{"kind":"case","id":"CD26-5546112"}]' /* 'initial_triage', 'Term Life 20 in force — WOP rider confirmed active', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_cd26_3', 'employer_letter_fastroute.pdf', 'employment', 'validated', '2026-02-09', 'employer_portal', 'Inability to work confirmed — last day Jan 30', TRUE, '[{"kind":"case","id":"CD26-5546112"}]' /* 'requirement_gathering', 'Inability to work confirmed — last day Jan 30', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_cd26_4', 'APS_drchen_ortho.pdf', 'medical', 'validated', '2026-02-18', 'medical_provider', 'Total disability confirmed — unable to work for profit', TRUE, '[{"kind":"case","id":"CD26-5546112"}]' /* 'requirement_gathering', 'Total disability confirmed — unable to work for profit', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_cd26_5', 'surgical_report_stlukes.pdf', 'medical', 'validated', '2026-03-04', 'medical_provider', 'Right knee replacement — 6–9 month recovery', TRUE, '[{"kind":"case","id":"CD26-5546112"}]' /* 'medical_review', 'Right knee replacement — 6–9 month recovery', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_cd26_6', 'FCE_report.pdf', 'medical', 'pending_review', '2026-03-24', 'specialist_upload', 'FCE indicates total work incapacity — pending review', TRUE, '[{"kind":"case","id":"CD26-5546112"}]' /* 'medical_review', 'FCE indicates total work incapacity — pending review', FALSE, NULL */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_cd26_1', 'portal', 'inbound', 'WOP claim submitted via SBLI claimant portal', 'received', '2026-01-30', '[{"kind":"case","id":"CD26-5546112"}]' /* 'fnol_received', 'Billy Bud', 'WOP claim submitted via SBLI claimant portal', 'System' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_cd26_2', 'email', 'outbound', 'Claim acknowledged — WOP rider confirmed, next steps outlined', 'sent', '2026-02-02', '[{"kind":"case","id":"CD26-5546112"}]' /* 'initial_triage', 'Billy Bud', 'Claim acknowledged — WOP rider confirmed, next steps outlined', 'Victor Ramon' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_cd26_3', 'email', 'outbound', 'Employer inability-to-work confirmation requested', 'sent', '2026-02-05', '[{"kind":"case","id":"CD26-5546112"}]' /* 'requirement_gathering', 'FastRoute Couriers HR', 'Employer inability-to-work confirmation requested', 'Victor Ramon' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_cd26_4', 'portal', 'outbound', 'APS request sent via SBLI provider portal', 'sent', '2026-02-10', '[{"kind":"case","id":"CD26-5546112"}]' /* 'requirement_gathering', 'Dr. Chen', 'APS request sent via SBLI provider portal', 'Victor Ramon' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_cd26_5', 'email', 'outbound', 'Surgical report requested', 'sent', '2026-03-06', '[{"kind":"case","id":"CD26-5546112"}]' /* 'medical_review', 'St. Luke''s Records', 'Surgical report requested', 'Richard Daniels' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_cd26_6', 'phone', 'outbound', 'Status update — FCE appointment confirmed', 'sent', '2026-03-12', '[{"kind":"case","id":"CD26-5546112"}]' /* 'medical_review', 'Billy Bud', 'Status update — FCE appointment confirmed', 'Victor Ramon' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_cd26_7', 'email', 'outbound', 'Decision imminent — SLA notice, premium not yet waived', 'sent', '2026-05-14', '[{"kind":"case","id":"CD26-5546112"}]' /* 'decision', 'Billy Bud', 'Decision imminent — SLA notice, premium not yet waived', 'Victor Ramon' */);
-- GAP: persisted relationships table is not in ENTITY_SCHEMA_DEFINITIONS; relationships.role exists only as generic relationship label.
INSERT INTO relationships (id, source, target, relationship, scope, status /* name, type, role, policy_ref, contact, case_ref */) VALUES ('rel_cd26_1', '{"kind":"case","id":"CD26-5546112"}', '{"kind":"person","id":"rel_cd26_1","label":"Billy Bud"}', 'insured_claimant', 'main_entity', 'active' /* 'Billy Bud', 'person', 'insured_claimant', 'SBLI-TL-2021-004821', NULL, NULL */);
-- GAP: persisted relationships table is not in ENTITY_SCHEMA_DEFINITIONS; relationships.role exists only as generic relationship label.
INSERT INTO relationships (id, source, target, relationship, scope, status /* name, type, role, policy_ref, contact, case_ref */) VALUES ('rel_cd26_2', '{"kind":"case","id":"CD26-5546112"}', '{"kind":"employer","id":"rel_cd26_2","label":"FastRoute Couriers Ltd"}', 'employer_on_claim', 'main_entity', 'confirmed' /* 'FastRoute Couriers Ltd', 'employer', 'employer_on_claim', NULL, 'hr@fastroute.com', NULL */);
-- GAP: persisted relationships table is not in ENTITY_SCHEMA_DEFINITIONS; relationships.role exists only as generic relationship label.
INSERT INTO relationships (id, source, target, relationship, scope, status /* name, type, role, policy_ref, contact, case_ref */) VALUES ('rel_cd26_3', '{"kind":"case","id":"CD26-5546112"}', '{"kind":"medical_provider","id":"rel_cd26_3","label":"Dr. Chen"}', 'attending_physician', 'main_entity', 'active' /* 'Dr. Chen', 'medical_provider', 'attending_physician', NULL, 'St. Luke''s Orthopedics', NULL */);
-- GAP: persisted relationships table is not in ENTITY_SCHEMA_DEFINITIONS; relationships.role exists only as generic relationship label.
INSERT INTO relationships (id, source, target, relationship, scope, status /* name, type, role, policy_ref, contact, case_ref */) VALUES ('rel_cd26_4', '{"kind":"case","id":"CD26-5546112"}', '{"kind":"medical_provider","id":"rel_cd26_4","label":"FCE Specialist"}', 'functional_capacity_evaluator', 'main_entity', 'pending' /* 'FCE Specialist', 'medical_provider', 'functional_capacity_evaluator', NULL, NULL, NULL */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_cd26_1', 'WOP claim registered', 'system', '2026-01-30', '[{"kind":"case","id":"CD26-5546112"}]' /* 'fnol_received', 'Case created — WOP rider eligibility check triggered', 'System' */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_cd26_2', 'WOP rider confirmed active', 'system', '2026-02-01', '[{"kind":"case","id":"CD26-5546112"}]' /* 'initial_triage', 'Rider in force since policy issue Mar 2021', 'System' */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_cd26_3', 'Total disability narrative generated', 'ai', '2026-03-09', '[{"kind":"case","id":"CD26-5546112"}]' /* 'medical_review', 'Confidence 91% — total disability standard met', 'AI Agent' */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_cd26_4', '90-day waiting period satisfied', 'system', '2026-04-30', '[{"kind":"case","id":"CD26-5546112"}]' /* 'medical_review', 'Premiums retroactively waiveable from Jan 30', 'System' */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_cd26_5', 'SLA alert acknowledged', 'user', '2026-05-14', '[{"kind":"case","id":"CD26-5546112"}]' /* 'decision', 'Escalated — FCE and earnings verification still outstanding', 'Victor Ramon' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_cd44_1', 'FNOL / Death notification', 'documentation', 'fulfilled', '2026-02-03', 'claimant_portal', '[{"kind":"case","id":"CD44-6679812"}]' /* 'fnol_received', 'Filed by Marie Dupont' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_cd44_2', 'Certified Death Certificate', 'documentation', 'fulfilled', '2026-02-05', 'claimant_portal', '[{"kind":"case","id":"CD44-6679812"}]' /* 'initial_triage', 'State-issued, certified copy' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_cd44_3', 'Policy ownership & beneficiary verification', 'compliance', 'fulfilled', '2026-02-05', 'policy_admin', '[{"kind":"case","id":"CD44-6679812"}]' /* 'initial_triage', 'Marie Dupont 100% confirmed' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_cd44_4', 'Attending Physician Statement (APS)', 'medical', 'fulfilled', '2026-02-12', 'medical_provider', '[{"kind":"case","id":"CD44-6679812"}]' /* 'requirement_gathering', 'Dr. Harmon — Portland Cardiology Group' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_cd44_5', 'Toxicology Report', 'medical', 'fulfilled', '2026-02-18', 'medical_provider', '[{"kind":"case","id":"CD44-6679812"}]' /* 'requirement_gathering', 'No substances detected' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_cd44_6', 'Claimant identity verification', 'compliance', 'fulfilled', '2026-02-10', 'id_verification', '[{"kind":"case","id":"CD44-6679812"}]' /* 'requirement_gathering', 'Government ID confirmed' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_cd44_7', 'Bank account verification (ACH)', 'financial', 'fulfilled', '2026-02-12', 'claimant_portal', '[{"kind":"case","id":"CD44-6679812"}]' /* 'requirement_gathering', 'ACH routing verified for $500k payout' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_cd44_8', 'Contestability review — MIB vs. application', 'investigative', 'in_review', '2026-05-16', 'MIB', '[{"kind":"case","id":"CD44-6679812"}]' /* 'contestability_review', 'No discrepancies found — human sign-off pending' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_cd44_9', 'Coroner''s report', 'documentation', 'waived', NULL, 'assessor', '[{"kind":"case","id":"CD44-6679812"}]' /* 'contestability_review', 'Natural cause — not required' */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd6100', 'Register FNOL & verify policy in force', 'done', 'medium', 'System', '[{"kind":"case","id":"CD44-6679812"}]' /* 'CD-6100', 'fnol_received', '2026-02-03', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd6101', 'Triage: assign to life claims team', 'done', 'medium', 'Victor Ramon', '[{"kind":"case","id":"CD44-6679812"}]' /* 'CD-6101', 'initial_triage', '2026-02-04', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd6102', 'AI: verify beneficiary & ownership', 'done', 'high', 'AI Agent', '[{"kind":"case","id":"CD44-6679812"}]' /* 'CD-6102', 'initial_triage', '2026-02-04', TRUE, 0.98 */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd6103', 'AI: contestability period calculation', 'done', 'high', 'AI Agent', '[{"kind":"case","id":"CD44-6679812"}]' /* 'CD-6103', 'initial_triage', '2026-02-04', TRUE, 1 */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd6110', 'Request APS from Dr. Harmon', 'done', 'high', 'Victor Ramon', '[{"kind":"case","id":"CD44-6679812"}]' /* 'CD-6110', 'requirement_gathering', '2026-02-05', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd6111', 'Request toxicology report', 'done', 'high', 'Victor Ramon', '[{"kind":"case","id":"CD44-6679812"}]' /* 'CD-6111', 'requirement_gathering', '2026-02-05', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd6112', 'Verify claimant identity & bank details', 'done', 'high', 'Richard Daniels', '[{"kind":"case","id":"CD44-6679812"}]' /* 'CD-6112', 'requirement_gathering', '2026-02-10', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd6120', 'AI: MIB vs. application disclosure comparison', 'done', 'high', 'AI Agent', '[{"kind":"case","id":"CD44-6679812"}]' /* 'CD-6120', 'contestability_review', '2026-05-10', TRUE, 0.96 */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd6121', 'Review contestability findings & clear for decision', 'in_queue', 'high', 'Victor Ramon', '[{"kind":"case","id":"CD44-6679812"}]' /* 'CD-6121', 'contestability_review', '2026-05-16', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_cd6130', 'Approve $500,000 payout to Marie Dupont via ACH', 'pending', 'high', 'Victor Ramon', '[{"kind":"case","id":"CD44-6679812"}]' /* 'CD-6130', 'decision', NULL, FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_cd44_1', 'FNOL_death_dupont.pdf', 'claim', 'validated', '2026-02-03', 'claimant_portal', 'Death notification complete', TRUE, '[{"kind":"case","id":"CD44-6679812"}]' /* 'fnol_received', 'Death notification complete', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_cd44_2', 'death_certificate_dupont.pdf', 'legal', 'validated', '2026-02-05', 'claimant_portal', 'State-certified — cause: acute MI, natural death', TRUE, '[{"kind":"case","id":"CD44-6679812"}]' /* 'initial_triage', 'State-certified — cause: acute MI, natural death', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_cd44_3', 'policy_SBLI_TL2019_009102.pdf', 'policy', 'validated', '2026-02-05', 'policy_admin', 'Term Life 20 in force — beneficiary Marie Dupont 100%', TRUE, '[{"kind":"case","id":"CD44-6679812"}]' /* 'initial_triage', 'Term Life 20 in force — beneficiary Marie Dupont 100%', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_cd44_4', 'APS_drharmon_cardiology.pdf', 'medical', 'validated', '2026-02-11', 'medical_provider', 'Cause of death consistent with cardiac history — no red flags', TRUE, '[{"kind":"case","id":"CD44-6679812"}]' /* 'requirement_gathering', 'Cause of death consistent with cardiac history — no red flags', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_cd44_5', 'toxicology_report.pdf', 'medical', 'validated', '2026-02-17', 'medical_provider', 'No substances detected — natural cause confirmed', TRUE, '[{"kind":"case","id":"CD44-6679812"}]' /* 'requirement_gathering', 'No substances detected — natural cause confirmed', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_cd44_6', 'ID_verification_marie_dupont.pdf', 'compliance', 'validated', '2026-02-10', 'id_verification', 'Government-issued ID verified', TRUE, '[{"kind":"case","id":"CD44-6679812"}]' /* 'requirement_gathering', 'Government-issued ID verified', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_cd44_7', 'MIB_disclosure_comparison.pdf', 'investigative', 'under_review', '2026-05-10', 'ai_agent', 'No discrepancies found — application disclosures match MIB', TRUE, '[{"kind":"case","id":"CD44-6679812"}]' /* 'contestability_review', 'No discrepancies found — application disclosures match MIB', TRUE, 0.96 */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_cd44_1', 'portal', 'inbound', 'Death claim filed via SBLI claimant portal', 'received', '2026-02-03', '[{"kind":"case","id":"CD44-6679812"}]' /* 'fnol_received', 'Marie Dupont', 'Death claim filed via SBLI claimant portal', 'System' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_cd44_2', 'email', 'outbound', 'Condolences & acknowledgment — requirements letter sent', 'sent', '2026-02-04', '[{"kind":"case","id":"CD44-6679812"}]' /* 'initial_triage', 'Marie Dupont', 'Condolences & acknowledgment — requirements letter sent', 'Victor Ramon' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_cd44_3', 'portal', 'outbound', 'APS requested via provider portal', 'sent', '2026-02-05', '[{"kind":"case","id":"CD44-6679812"}]' /* 'requirement_gathering', 'Dr. Harmon', 'APS requested via provider portal', 'Victor Ramon' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_cd44_4', 'email', 'outbound', 'Identity & bank verification instructions', 'sent', '2026-02-10', '[{"kind":"case","id":"CD44-6679812"}]' /* 'requirement_gathering', 'Marie Dupont', 'Identity & bank verification instructions', 'Richard Daniels' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_cd44_5', 'email', 'outbound', 'Contestability review underway — est. 5 business days', 'sent', '2026-05-10', '[{"kind":"case","id":"CD44-6679812"}]' /* 'contestability_review', 'Marie Dupont', 'Contestability review underway — est. 5 business days', 'Victor Ramon' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_cd44_6', 'phone', 'outbound', 'Status call — review near complete, decision imminent', 'sent', '2026-05-14', '[{"kind":"case","id":"CD44-6679812"}]' /* 'contestability_review', 'Marie Dupont', 'Status call — review near complete, decision imminent', 'Victor Ramon' */);
-- GAP: persisted relationships table is not in ENTITY_SCHEMA_DEFINITIONS; relationships.role exists only as generic relationship label.
INSERT INTO relationships (id, source, target, relationship, scope, status /* name, type, role, policy_ref, contact, case_ref */) VALUES ('rel_cd44_1', '{"kind":"case","id":"CD44-6679812"}', '{"kind":"person","id":"rel_cd44_1","label":"Thomas Dupont"}', 'insured_deceased', 'main_entity', 'deceased' /* 'Thomas Dupont', 'person', 'insured_deceased', 'SBLI-TL-2019-009102', NULL, NULL */);
-- GAP: persisted relationships table is not in ENTITY_SCHEMA_DEFINITIONS; relationships.role exists only as generic relationship label.
INSERT INTO relationships (id, source, target, relationship, scope, status /* name, type, role, policy_ref, contact, case_ref */) VALUES ('rel_cd44_2', '{"kind":"case","id":"CD44-6679812"}', '{"kind":"person","id":"rel_cd44_2","label":"Marie Dupont"}', 'primary_beneficiary', 'main_entity', 'active_claimant' /* 'Marie Dupont', 'person', 'primary_beneficiary', NULL, 'marie.dupont@email.com', NULL */);
-- GAP: persisted relationships table is not in ENTITY_SCHEMA_DEFINITIONS; relationships.role exists only as generic relationship label.
INSERT INTO relationships (id, source, target, relationship, scope, status /* name, type, role, policy_ref, contact, case_ref */) VALUES ('rel_cd44_3', '{"kind":"case","id":"CD44-6679812"}', '{"kind":"person","id":"rel_cd44_3","label":"Sophie Dupont"}', 'contingent_beneficiary', 'main_entity', 'on_file' /* 'Sophie Dupont', 'person', 'contingent_beneficiary', NULL, NULL, NULL */);
-- GAP: persisted relationships table is not in ENTITY_SCHEMA_DEFINITIONS; relationships.role exists only as generic relationship label.
INSERT INTO relationships (id, source, target, relationship, scope, status /* name, type, role, policy_ref, contact, case_ref */) VALUES ('rel_cd44_4', '{"kind":"case","id":"CD44-6679812"}', '{"kind":"medical_provider","id":"rel_cd44_4","label":"Dr. Harmon"}', 'treating_cardiologist', 'main_entity', 'aps_provided' /* 'Dr. Harmon', 'medical_provider', 'treating_cardiologist', NULL, 'Portland Cardiology Group', NULL */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_cd44_1', 'Death claim registered', 'system', '2026-02-03', '[{"kind":"case","id":"CD44-6679812"}]' /* 'fnol_received', 'Case auto-created from portal submission', 'System' */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_cd44_2', 'Contestability period calculated', 'ai', '2026-02-04', '[{"kind":"case","id":"CD44-6679812"}]' /* 'initial_triage', 'Policy issued Feb 2019 — 6y 11m, contestability lapsed', 'AI Agent' */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_cd44_3', 'Beneficiary ownership verified', 'ai', '2026-02-04', '[{"kind":"case","id":"CD44-6679812"}]' /* 'initial_triage', 'Marie Dupont confirmed 100% primary beneficiary', 'AI Agent' */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_cd44_4', 'MIB vs. application comparison', 'ai', '2026-05-10', '[{"kind":"case","id":"CD44-6679812"}]' /* 'contestability_review', 'No discrepancies — cleared for human review', 'AI Agent' */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_cd44_5', 'Status call with claimant', 'user', '2026-05-14', '[{"kind":"case","id":"CD44-6679812"}]' /* 'contestability_review', 'Marie Dupont updated — decision expected May 16', 'Victor Ramon' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_nb66_1', 'Signed application form', 'documentation', 'fulfilled', '2026-05-12', 'broker_portal', '[{"kind":"case","id":"NB66-7622343"}]' /* 'application_received', 'SBLI broker network submission' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_nb66_2', 'Agent / broker licensing verification', 'compliance', 'fulfilled', '2026-05-12', 'licensing_system', '[{"kind":"case","id":"NB66-7622343"}]' /* 'application_received', NULL */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_nb66_3', 'MIB report', 'medical', 'fulfilled', '2026-05-13', 'MIB', '[{"kind":"case","id":"NB66-7622343"}]' /* 'initial_review', 'Prior decline 2022 flagged' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_nb66_4', 'MVR (Motor Vehicle Report)', 'background', 'fulfilled', '2026-05-13', 'mvr_system', '[{"kind":"case","id":"NB66-7622343"}]' /* 'initial_review', 'Clean record' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_nb66_5', 'Prescription history check', 'medical', 'fulfilled', '2026-05-13', 'rx_database', '[{"kind":"case","id":"NB66-7622343"}]' /* 'initial_review', 'Metformin confirmed — consistent' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_nb66_6', 'Attending Physician Statement (APS)', 'medical', 'overdue', '2026-05-16', 'medical_provider', '[{"kind":"case","id":"NB66-7622343"}]' /* 'requirement_gathering', 'Dr. Kowalski — diabetes management' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_nb66_7', 'Paramedical exam — blood draw & vitals', 'medical', 'scheduled', '2026-05-19', 'paramedical_vendor', '[{"kind":"case","id":"NB66-7622343"}]' /* 'requirement_gathering', 'Required — MIB flag disqualifies accelerated UW' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_nb66_8', 'Prior decline explanation letter', 'documentation', 'overdue', '2026-05-18', 'applicant', '[{"kind":"case","id":"NB66-7622343"}]' /* 'underwriting_review', 'Applicant must explain 2022 MIB hit' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_nb66_9', 'Financial justification ($625k)', 'financial', 'not_requested', NULL, 'applicant', '[{"kind":"case","id":"NB66-7622343"}]' /* 'underwriting_review', 'Pending APS & exam results' */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb4010', 'Validate SBLI application completeness', 'done', 'medium', 'System', '[{"kind":"case","id":"NB66-7622343"}]' /* 'NB-4010', 'application_received', '2026-05-12', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb4011', 'AI: verify broker licensing', 'done', 'medium', 'AI Agent', '[{"kind":"case","id":"NB66-7622343"}]' /* 'NB-4011', 'application_received', '2026-05-12', TRUE, 1 */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb4020', 'AI: order MIB + MVR + Rx', 'done', 'high', 'AI Agent', '[{"kind":"case","id":"NB66-7622343"}]' /* 'NB-4020', 'initial_review', '2026-05-13', TRUE, 1 */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb4021', 'Review MIB hit — prior decline 2022', 'done', 'high', 'Victor Ramon', '[{"kind":"case","id":"NB66-7622343"}]' /* 'NB-4021', 'initial_review', '2026-05-13', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb4022', 'AI: preliminary debit/credit scoring', 'done', 'medium', 'AI Agent', '[{"kind":"case","id":"NB66-7622343"}]' /* 'NB-4022', 'initial_review', '2026-05-13', TRUE, 0.88 */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb4030', 'Order APS from Dr. Kowalski', 'in_queue', 'high', 'Victor Ramon', '[{"kind":"case","id":"NB66-7622343"}]' /* 'NB-4030', 'requirement_gathering', '2026-05-15', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb4031', 'Schedule paramedical exam — Quest Diagnostics', 'done', 'high', 'Victor Ramon', '[{"kind":"case","id":"NB66-7622343"}]' /* 'NB-4031', 'requirement_gathering', '2026-05-14', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb4032', 'Request prior decline explanation letter', 'in_queue', 'high', 'Richard Daniels', '[{"kind":"case","id":"NB66-7622343"}]' /* 'NB-4032', 'requirement_gathering', '2026-05-18', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb4040', 'UW debit/credit scoring — final review', 'pending', 'high', 'Victor Ramon', '[{"kind":"case","id":"NB66-7622343"}]' /* 'NB-4040', 'underwriting_review', NULL, FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb4041', 'AI: generate rated offer recommendation', 'pending', 'high', 'AI Agent', '[{"kind":"case","id":"NB66-7622343"}]' /* 'NB-4041', 'underwriting_review', NULL, TRUE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb4050', 'Issue decision — rated term offer or decline', 'pending', 'high', 'Victor Ramon', '[{"kind":"case","id":"NB66-7622343"}]' /* 'NB-4050', 'decision', NULL, FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_nb66_1', 'application_tremblay_SBLI.pdf', 'application', 'validated', '2026-05-12', 'broker_portal', 'Complete — T2D disclosed, non-smoker, broker-submitted', TRUE, '[{"kind":"case","id":"NB66-7622343"}]' /* 'application_received', 'Complete — T2D disclosed, non-smoker, broker-submitted', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_nb66_2', 'MIB_report_tremblay.pdf', 'investigative', 'validated', '2026-05-13', 'MIB', 'Prior decline flagged — 2022, carrier unknown', TRUE, '[{"kind":"case","id":"NB66-7622343"}]' /* 'initial_review', 'Prior decline flagged — 2022, carrier unknown', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_nb66_3', 'MVR_tremblay.pdf', 'background', 'validated', '2026-05-13', 'mvr_system', 'No violations — clean driving record', TRUE, '[{"kind":"case","id":"NB66-7622343"}]' /* 'initial_review', 'No violations — clean driving record', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_nb66_4', 'rx_history_tremblay.pdf', 'medical', 'validated', '2026-05-13', 'rx_database', 'Metformin 500mg confirmed — consistent with disclosure', TRUE, '[{"kind":"case","id":"NB66-7622343"}]' /* 'initial_review', 'Metformin 500mg confirmed — consistent with disclosure', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_nb66_5', 'AI_prelim_risk_score.pdf', 'underwriting', 'draft', '2026-05-13', 'ai_agent', 'Preliminary +75 debit — traditional UW required', TRUE, '[{"kind":"case","id":"NB66-7622343"}]' /* 'initial_review', 'Preliminary +75 debit — traditional UW required', TRUE, 0.88 */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_nb66_1', 'portal', 'inbound', 'SBLI Term Life 20 application submitted', 'received', '2026-05-12', '[{"kind":"case","id":"NB66-7622343"}]' /* 'application_received', 'Northstar Advisory', 'SBLI Term Life 20 application submitted', 'System' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_nb66_2', 'email', 'outbound', 'Application received — traditional underwriting in progress', 'sent', '2026-05-12', '[{"kind":"case","id":"NB66-7622343"}]' /* 'application_received', 'Marc Tremblay', 'Application received — traditional underwriting in progress', 'System' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_nb66_3', 'email', 'outbound', 'MIB hit identified — prior decline explanation to follow', 'sent', '2026-05-13', '[{"kind":"case","id":"NB66-7622343"}]' /* 'initial_review', 'Marc Tremblay', 'MIB hit identified — prior decline explanation to follow', 'Victor Ramon' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_nb66_4', 'portal', 'outbound', 'APS requested — diabetes management history', 'sent', '2026-05-14', '[{"kind":"case","id":"NB66-7622343"}]' /* 'requirement_gathering', 'Dr. Kowalski', 'APS requested — diabetes management history', 'Victor Ramon' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_nb66_5', 'email', 'outbound', 'Prior decline explanation letter requested', 'sent', '2026-05-14', '[{"kind":"case","id":"NB66-7622343"}]' /* 'requirement_gathering', 'Marc Tremblay', 'Prior decline explanation letter requested', 'Richard Daniels' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_nb66_6', 'phone', 'outbound', 'Advisor briefed — paramedical exam confirmed May 19', 'sent', '2026-05-14', '[{"kind":"case","id":"NB66-7622343"}]' /* 'requirement_gathering', 'Northstar Advisory', 'Advisor briefed — paramedical exam confirmed May 19', 'Victor Ramon' */);
-- GAP: persisted relationships table is not in ENTITY_SCHEMA_DEFINITIONS; relationships.role exists only as generic relationship label.
INSERT INTO relationships (id, source, target, relationship, scope, status /* name, type, role, policy_ref, contact, case_ref */) VALUES ('rel_nb66_1', '{"kind":"case","id":"NB66-7622343"}', '{"kind":"person","id":"rel_nb66_1","label":"Marc Tremblay"}', 'applicant_proposed_insured', 'main_entity', 'active' /* 'Marc Tremblay', 'person', 'applicant_proposed_insured', NULL, NULL, 'NB66-7622343' */);
-- GAP: persisted relationships table is not in ENTITY_SCHEMA_DEFINITIONS; relationships.role exists only as generic relationship label.
INSERT INTO relationships (id, source, target, relationship, scope, status /* name, type, role, policy_ref, contact, case_ref */) VALUES ('rel_nb66_2', '{"kind":"case","id":"NB66-7622343"}', '{"kind":"broker","id":"rel_nb66_2","label":"Northstar Advisory"}', 'sbli_broker_network_submitting_agent', 'main_entity', 'active' /* 'Northstar Advisory', 'broker', 'sbli_broker_network_submitting_agent', NULL, 'advisor@northstar.com', NULL */);
-- GAP: persisted relationships table is not in ENTITY_SCHEMA_DEFINITIONS; relationships.role exists only as generic relationship label.
INSERT INTO relationships (id, source, target, relationship, scope, status /* name, type, role, policy_ref, contact, case_ref */) VALUES ('rel_nb66_3', '{"kind":"case","id":"NB66-7622343"}', '{"kind":"medical_provider","id":"rel_nb66_3","label":"Dr. Kowalski"}', 'treating_physician_diabetes', 'main_entity', 'aps_pending' /* 'Dr. Kowalski', 'medical_provider', 'treating_physician_diabetes', NULL, 'Kowalski Family Medicine', NULL */);
-- GAP: persisted relationships table is not in ENTITY_SCHEMA_DEFINITIONS; relationships.role exists only as generic relationship label.
INSERT INTO relationships (id, source, target, relationship, scope, status /* name, type, role, policy_ref, contact, case_ref */) VALUES ('rel_nb66_4', '{"kind":"case","id":"NB66-7622343"}', '{"kind":"vendor","id":"rel_nb66_4","label":"Quest Diagnostics"}', 'paramedical_exam_provider', 'main_entity', 'scheduled_2026_05_19' /* 'Quest Diagnostics', 'vendor', 'paramedical_exam_provider', NULL, NULL, NULL */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_nb66_1', 'Application registered', 'system', '2026-05-12', '[{"kind":"case","id":"NB66-7622343"}]' /* 'application_received', 'Submitted via SBLI broker portal — Northstar Advisory', 'System' */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_nb66_2', 'Broker license verified', 'ai', '2026-05-12', '[{"kind":"case","id":"NB66-7622343"}]' /* 'application_received', 'License active — appointment confirmed', 'AI Agent' */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_nb66_3', 'MIB + MVR + Rx returned', 'ai', '2026-05-13', '[{"kind":"case","id":"NB66-7622343"}]' /* 'initial_review', 'MIB hit — prior decline 2022 detected', 'AI Agent' */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_nb66_4', 'Preliminary scoring completed', 'ai', '2026-05-13', '[{"kind":"case","id":"NB66-7622343"}]' /* 'initial_review', '+75 debit — traditional UW path confirmed', 'AI Agent' */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_nb66_5', 'MIB hit reviewed', 'user', '2026-05-13', '[{"kind":"case","id":"NB66-7622343"}]' /* 'initial_review', 'Accelerated UW disqualified — traditional path required', 'Victor Ramon' */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_nb66_6', 'Paramedical exam scheduled', 'user', '2026-05-14', '[{"kind":"case","id":"NB66-7622343"}]' /* 'requirement_gathering', 'Quest Diagnostics — May 19, blood draw + vitals', 'Victor Ramon' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_nb98_1', 'Signed SBLI online application', 'documentation', 'fulfilled', '2026-05-13', 'sbli_com', '[{"kind":"case","id":"NB98-9989870"}]' /* 'application_received', 'Direct online submission' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_nb98_2', 'MIB report', 'medical', 'fulfilled', '2026-05-13', 'MIB', '[{"kind":"case","id":"NB98-9989870"}]' /* 'application_received', 'No alerts — accelerated UW confirmed' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_nb98_3', 'SBLI health questionnaire (tele-interview)', 'medical', 'scheduled', '2026-05-17', 'telephony_system', '[{"kind":"case","id":"NB98-9989870"}]' /* 'tele_interview', '4 sections — cardiovascular, respiratory, MSK, MH' */);
-- GAP: requirements.stage missing; requirements.name maps to label; due_date maps to dueDate; notes missing; source should be enum-governed.
INSERT INTO requirements (id, label, category, status, dueDate, source, linkedObjects /* stage, notes */) VALUES ('req_nb98_4', 'Identity verification', 'compliance', 'not_started', '2026-05-18', 'id_verification', '[{"kind":"case","id":"NB98-9989870"}]' /* 'questionnaire_review', 'Triggered post-interview' */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb2010', 'Validate SBLI online application', 'done', 'low', 'System', '[{"kind":"case","id":"NB98-9989870"}]' /* 'NB-2010', 'application_received', '2026-05-13', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb2011', 'AI: MIB check & accelerated UW eligibility', 'done', 'medium', 'AI Agent', '[{"kind":"case","id":"NB98-9989870"}]' /* 'NB-2011', 'application_received', '2026-05-13', TRUE, 1 */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb2012', 'AI: confirm Simple Term eligibility criteria', 'done', 'medium', 'AI Agent', '[{"kind":"case","id":"NB98-9989870"}]' /* 'NB-2012', 'application_received', '2026-05-13', TRUE, 1 */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb2020', 'Confirm tele-interview appointment', 'done', 'medium', 'System', '[{"kind":"case","id":"NB98-9989870"}]' /* 'NB-2020', 'tele_interview', '2026-05-14', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb2021', 'Conduct tele-interview — SBLI health questionnaire', 'in_queue', 'high', 'Richard Daniels', '[{"kind":"case","id":"NB98-9989870"}]' /* 'NB-2021', 'tele_interview', '2026-05-17', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb2030', 'AI: score health questionnaire responses', 'pending', 'high', 'AI Agent', '[{"kind":"case","id":"NB98-9989870"}]' /* 'NB-2030', 'questionnaire_review', '2026-05-17', TRUE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb2031', 'Review AI scoring & flag exceptions', 'pending', 'medium', 'Victor Ramon', '[{"kind":"case","id":"NB98-9989870"}]' /* 'NB-2031', 'questionnaire_review', '2026-05-18', FALSE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb2032', 'Run identity verification', 'pending', 'medium', 'AI Agent', '[{"kind":"case","id":"NB98-9989870"}]' /* 'NB-2032', 'questionnaire_review', '2026-05-18', TRUE, NULL */);
-- GAP: tasks.task_id, stage, due_date, ai_generated, ai_confidence missing; summary maps to label.
INSERT INTO tasks (id, label, status, priority, assignee, linkedObjects /* task_id, stage, due_date, ai_generated, ai_confidence */) VALUES ('task_nb2040', 'Issue decision — standard rates or refer to full UW', 'pending', 'high', 'Victor Ramon', '[{"kind":"case","id":"NB98-9989870"}]' /* 'NB-2040', 'decision', '2026-05-19', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_nb98_1', 'application_rossi_SBLI_online.pdf', 'application', 'validated', '2026-05-13', 'sbli_com', 'Complete — no adverse disclosures, non-smoker, direct SBLI.com', TRUE, '[{"kind":"case","id":"NB98-9989870"}]' /* 'application_received', 'Complete — no adverse disclosures, non-smoker, direct SBLI.com', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_nb98_2', 'MIB_report_rossi.pdf', 'investigative', 'validated', '2026-05-13', 'MIB', 'No MIB alerts — accelerated UW path confirmed', TRUE, '[{"kind":"case","id":"NB98-9989870"}]' /* 'application_received', 'No MIB alerts — accelerated UW path confirmed', FALSE, NULL */);
-- GAP: documents.stage, insight, ai_insight, ai_confidence missing; filename maps to label; uploaded_at maps to uploaded.
INSERT INTO documents (id, label, category, status, uploaded, source, aiSummary, fileAvailable, linkedObjects /* stage, insight, ai_insight, ai_confidence */) VALUES ('doc_nb98_3', 'accelerated_UW_eligibility_check.pdf', 'underwriting', 'validated', '2026-05-13', 'ai_agent', 'All SBLI Simple Term criteria passed — no exam required', TRUE, '[{"kind":"case","id":"NB98-9989870"}]' /* 'application_received', 'All SBLI Simple Term criteria passed — no exam required', TRUE, 1 */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_nb98_1', 'portal', 'inbound', 'SBLI Simple Term Life application submitted online', 'received', '2026-05-13', '[{"kind":"case","id":"NB98-9989870"}]' /* 'application_received', 'Elena Rossi', 'SBLI Simple Term Life application submitted online', 'System' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_nb98_2', 'email', 'outbound', 'Application received — no-exam path confirmed, tele-interview to follow', 'sent', '2026-05-13', '[{"kind":"case","id":"NB98-9989870"}]' /* 'application_received', 'Elena Rossi', 'Application received — no-exam path confirmed, tele-interview to follow', 'System' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_nb98_3', 'sms', 'outbound', 'SBLI tele-interview scheduled May 17 at 10:00 AM', 'sent', '2026-05-14', '[{"kind":"case","id":"NB98-9989870"}]' /* 'tele_interview', 'Elena Rossi', 'SBLI tele-interview scheduled May 17 at 10:00 AM', 'System' */);
-- GAP: communications.stage, contact, summary, assignee missing; date maps to createdAt; summary maps to subject.
INSERT INTO communications (id, channel, direction, subject, status, createdAt, linkedObjects /* stage, contact, summary, assignee */) VALUES ('comm_nb98_4', 'email', 'outbound', 'Tele-interview prep — what to expect, 4 topic areas covered', 'sent', '2026-05-14', '[{"kind":"case","id":"NB98-9989870"}]' /* 'tele_interview', 'Elena Rossi', 'Tele-interview prep — what to expect, 4 topic areas covered', 'Richard Daniels' */);
-- GAP: persisted relationships table is not in ENTITY_SCHEMA_DEFINITIONS; relationships.role exists only as generic relationship label.
INSERT INTO relationships (id, source, target, relationship, scope, status /* name, type, role, policy_ref, contact, case_ref */) VALUES ('rel_nb98_1', '{"kind":"case","id":"NB98-9989870"}', '{"kind":"person","id":"rel_nb98_1","label":"Elena Rossi"}', 'applicant_proposed_insured', 'main_entity', 'active' /* 'Elena Rossi', 'person', 'applicant_proposed_insured', NULL, NULL, 'NB98-9989870' */);
-- GAP: persisted relationships table is not in ENTITY_SCHEMA_DEFINITIONS; relationships.role exists only as generic relationship label.
INSERT INTO relationships (id, source, target, relationship, scope, status /* name, type, role, policy_ref, contact, case_ref */) VALUES ('rel_nb98_2', '{"kind":"case","id":"NB98-9989870"}', '{"kind":"person","id":"rel_nb98_2","label":"Marco Rossi"}', 'primary_beneficiary_spouse', 'main_entity', 'on_file' /* 'Marco Rossi', 'person', 'primary_beneficiary_spouse', NULL, NULL, NULL */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_nb98_1', 'Application registered', 'system', '2026-05-13', '[{"kind":"case","id":"NB98-9989870"}]' /* 'application_received', 'Submitted via SBLI.com direct portal', 'System' */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_nb98_2', 'MIB check — no alerts', 'ai', '2026-05-13', '[{"kind":"case","id":"NB98-9989870"}]' /* 'application_received', 'Clean record — accelerated UW path eligible', 'AI Agent' */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_nb98_3', 'Simple Term eligibility confirmed', 'ai', '2026-05-13', '[{"kind":"case","id":"NB98-9989870"}]' /* 'application_received', 'Age 35, $350k, no adverse disclosures — all criteria pass', 'AI Agent' */);
-- GAP: activity_events.stage and detail missing; date maps to timestamp; user maps to actor; action maps to label.
INSERT INTO activity_events (id, label, actor, timestamp, linkedObjects /* stage, detail, user */) VALUES ('act_nb98_4', 'Tele-interview scheduled', 'system', '2026-05-14', '[{"kind":"case","id":"NB98-9989870"}]' /* 'tele_interview', 'May 17 10:00 AM — SBLI health questionnaire', 'System' */);
-- GAP: table 'workflow_stages' is not represented in current entity schema.
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_claim_disability_fnol_received', 'ct_claim_disability', 'fnol_received', 1); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_claim_disability_initial_triage', 'ct_claim_disability', 'initial_triage', 2); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_claim_disability_requirement_gathering', 'ct_claim_disability', 'requirement_gathering', 3); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_claim_disability_medical_review', 'ct_claim_disability', 'medical_review', 4); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_claim_disability_decision', 'ct_claim_disability', 'decision', 5); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_claim_death_fnol_received', 'ct_claim_death', 'fnol_received', 1); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_claim_death_initial_triage', 'ct_claim_death', 'initial_triage', 2); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_claim_death_requirement_gathering', 'ct_claim_death', 'requirement_gathering', 3); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_claim_death_contestability_review', 'ct_claim_death', 'contestability_review', 4); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_claim_death_decision', 'ct_claim_death', 'decision', 5); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_nb_full_uw_application_received', 'ct_nb_full_uw', 'application_received', 1); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_nb_full_uw_initial_review', 'ct_nb_full_uw', 'initial_review', 2); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_nb_full_uw_requirement_gathering', 'ct_nb_full_uw', 'requirement_gathering', 3); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_nb_full_uw_underwriting_review', 'ct_nb_full_uw', 'underwriting_review', 4); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_nb_full_uw_decision', 'ct_nb_full_uw', 'decision', 5); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_nb_simplified_application_received', 'ct_nb_simplified', 'application_received', 1); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_nb_simplified_tele_interview', 'ct_nb_simplified', 'tele_interview', 2); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_nb_simplified_questionnaire_review', 'ct_nb_simplified', 'questionnaire_review', 3); -- GAP: workflow_stages table missing
INSERT INTO workflow_stages (id, case_type_id, stage_id, display_order) VALUES ('ct_nb_simplified_decision', 'ct_nb_simplified', 'decision', 4); -- GAP: workflow_stages table missing
```

## Seed Counts
Note: these are the counts in the supplied `amplify_sbli_seed_data.json`. They differ from the prompt guidance, which says 30 requirements, 38 tasks, 22 documents, and 18 workflow stages.

- requirements: 29
- tasks: 39
- documents: 21
- communications: 23
- relationships: 14
- activities: 20
- workflow_stages: 19