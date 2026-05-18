export interface AiSuggestedQuestion {
  id: string;
  label: string;
  fieldId?: string;
  prefillValue?: string;
}

export interface AiAssistData {
  context: string;
  recommendations: string[];
  suggestedQuestions: AiSuggestedQuestion[];
  sources: string[];
}

export type AiAssistKind = 'opportunity' | 'underwriting' | 'compliance' | 'dataQuality';
export type AiAssistSeverity = 'info' | 'attention';

export interface AiAssistTarget {
  id: string;
  sectionId: string;
  fieldId?: string;
  kind: AiAssistKind;
  severity: AiAssistSeverity;
  label: string;
  title: string;
  summary: string;
  reason: string;
  bestAction: string;
  panel: AiAssistData;
}

export const AI_ASSIST_TARGETS: AiAssistTarget[] = [
  {
    id: 'personal-identity-check',
    sectionId: 'personal',
    fieldId: 'ssn',
    kind: 'dataQuality',
    severity: 'info',
    label: 'Identity verification',
    title: 'Identity data is consistent',
    summary: 'Existing client profile matches PAS identity records.',
    reason: 'SSN, DOB, and legal name align with the prior policy profile.',
    bestAction: 'Confirm there were no recent legal name changes.',
    panel: {
      context: 'The applicant is an existing client and core identity fields match Case Management and PAS records. This lowers rework risk before submission.',
      recommendations: [
        'Confirm no recent legal name change.',
        'Verify the SSN ending shown to the applicant.',
        'Ask whether the driver license remains current.',
      ],
      suggestedQuestions: [
        { id: 'ai-personal-1', label: 'Has your legal name changed since your last application?' },
        { id: 'ai-personal-2', label: 'Can you confirm your Social Security Number ending in 7765?' },
      ],
      sources: ['Case Management · Client Profile', 'PAS · Policy GFS-IP-2024-004821'],
    },
  },
  {
    id: 'contact-delivery-ready',
    sectionId: 'contact',
    fieldId: 'email',
    kind: 'dataQuality',
    severity: 'info',
    label: 'Contact readiness',
    title: 'Contact details look ready for e-signature',
    summary: 'Email, mobile phone, and address have recent verification signals.',
    reason: 'The address was validated recently and the phone is marked as mobile.',
    bestAction: 'Confirm the email and mobile number before sending e-signature.',
    panel: {
      context: 'Reliable contact information reduces delays during e-signature delivery and policy correspondence.',
      recommendations: [
        'Confirm the email is the preferred policy correspondence address.',
        'Confirm the mobile phone can receive e-signature SMS messages.',
        'Ask whether the mailing address has changed recently.',
      ],
      suggestedQuestions: [
        { id: 'ai-contact-1', label: 'Is this the best email for policy correspondence?' },
        { id: 'ai-contact-2', label: 'Can this mobile number receive e-signature texts?' },
      ],
      sources: ['Case Management · Client Profile', 'USPS Address Validation'],
    },
  },
  {
    id: 'beneficiary-minor-check',
    sectionId: 'primary-ben',
    fieldId: 'benPrimaryName',
    kind: 'compliance',
    severity: 'attention',
    label: 'Beneficiary setup',
    title: 'Clarify beneficiary ownership details',
    summary: 'Missing beneficiary context can create downstream compliance follow-up.',
    reason: 'Minor beneficiaries or unclear relationships often require extra documentation.',
    bestAction: 'Ask whether any beneficiary is under 18 before continuing.',
    panel: {
      context: 'Beneficiary details are a common source of post-submit clarification. Capturing relationship and minor status now improves underwriting readiness.',
      recommendations: [
        'Confirm the legal relationship to the insured.',
        'Ask whether any beneficiary is a minor.',
        'Discuss a custodian or trust if needed.',
      ],
      suggestedQuestions: [
        { id: 'ai-beneficiary-1', label: 'Are any of your beneficiaries under 18?' },
        { id: 'ai-beneficiary-2', label: 'Would you like to name a contingent beneficiary as a backup?' },
      ],
      sources: ['eApp Engine', 'Catholic Life Compliance'],
    },
  },
  {
    id: 'coverage-faceAmount',
    sectionId: 'coverage-main',
    fieldId: 'faceAmount',
    kind: 'opportunity',
    severity: 'attention',
    label: 'Coverage amount',
    title: 'Coverage amount opportunity',
    summary: 'Needs analysis suggests reviewing a higher coverage range.',
    reason: 'The applicant profile suggests a higher face amount may fit the coverage need.',
    bestAction: 'Review $250K-$500K before submission.',
    panel: {
      context: 'Based on age, income profile, and whole life suitability, the applicant may benefit from reviewing a higher face amount before underwriting begins.',
      recommendations: [
        'Position $250K-$500K as the recommended range.',
        'Confirm premium comfort before proceeding.',
        'Explain the impact on long-term family protection.',
      ],
      suggestedQuestions: [
        { id: 'ai-face-1', label: 'Would you like to review a higher coverage amount before we submit?' },
        { id: 'ai-face-2', label: 'What monthly premium range would feel comfortable?' },
      ],
      sources: ['Needs Analysis Engine', 'Catholic Life Product Rules'],
    },
  },
  {
    id: 'coverage-dividendOption',
    sectionId: 'coverage-main',
    fieldId: 'dividendOption',
    kind: 'opportunity',
    severity: 'info',
    label: 'Dividend option',
    title: 'Dividend option guidance',
    summary: 'Dividend choice can shift the long-term value story.',
    reason: 'This choice can materially change the long-term value story.',
    bestAction: 'Discuss Paid-Up Additions if long-term value is important.',
    panel: {
      context: 'Dividend option selection can materially change how the policy builds value over time. Paid-Up Additions is often useful when the applicant wants long-term accumulation.',
      recommendations: [
        'Explain Paid-Up Additions in simple terms.',
        'Compare it with reducing premiums if affordability is the main concern.',
      ],
      suggestedQuestions: [
        { id: 'ai-dividend-1', label: 'Is long-term cash value growth more important than reducing premiums?' },
      ],
      sources: ['Catholic Life Product Rules'],
    },
  },
  {
    id: 'riders-waiver',
    sectionId: 'riders',
    fieldId: 'riderWaiverPremium',
    kind: 'opportunity',
    severity: 'info',
    label: 'Waiver of Premium',
    title: 'Rider protection opportunity',
    summary: 'Waiver of Premium is relevant for income earners.',
    reason: 'This rider can help keep the policy active if disability affects income.',
    bestAction: 'Consider recommending Waiver of Premium for working professionals.',
    panel: {
      context: 'Waiver of Premium can help keep the policy active during disability, which is relevant for income earners who depend on their work capacity.',
      recommendations: [
        'Ask whether premium protection during disability matters.',
        'Position it as policy continuity protection, not just an add-on.',
      ],
      suggestedQuestions: [
        { id: 'ai-waiver-1', label: 'Would it be important that premiums are waived if you become disabled?' },
      ],
      sources: ['Catholic Life Rider Guidelines'],
    },
  },
  {
    id: 'health-weight-bmi',
    sectionId: 'health-general',
    fieldId: 'weight',
    kind: 'underwriting',
    severity: 'attention',
    label: 'BMI check',
    title: 'BMI underwriting check',
    summary: 'Height and weight may trigger additional underwriting review.',
    reason: 'Height and weight drive BMI, which can affect ratings or requirements.',
    bestAction: 'Confirm measurements are current before submission.',
    panel: {
      context: 'BMI is calculated from height and weight and may trigger additional underwriting review when thresholds are exceeded.',
      recommendations: [
        'Confirm the measurements are current.',
        'Prepare the applicant for possible follow-up requirements if BMI is elevated.',
      ],
      suggestedQuestions: [
        { id: 'ai-bmi-1', label: 'Are these your most recent height and weight measurements?' },
      ],
      sources: ['Catholic Life UW Guidelines'],
    },
  },
  {
    id: 'health-conditions-reflex-ready',
    sectionId: 'health-conditions',
    kind: 'underwriting',
    severity: 'attention',
    label: 'Health conditions',
    title: 'Watch cumulative medical risk',
    summary: 'Multiple “Yes” answers can route the case to manual review.',
    reason: 'Heart disease, diabetes, and sleep apnea answers can combine into a cumulative risk flag.',
    bestAction: 'Ask each follow-up with dates, treatments, and current control.',
    panel: {
      context: 'Structured follow-ups help underwriting assess cumulative risk without returning the case for free-text clarification.',
      recommendations: [
        'Capture diagnosis dates and treatment status.',
        'Confirm medication adherence and recent test results.',
        'Set expectations for possible APS or paramedical requirements.',
      ],
      suggestedQuestions: [
        { id: 'ai-health-conditions-1', label: 'Are all conditions currently controlled with treatment?' },
        { id: 'ai-health-conditions-2', label: 'When was your most recent physician visit for this condition?' },
      ],
      sources: ['Catholic Life UW Guidelines', 'Reflex Question Engine'],
    },
  },
  {
    id: 'employment-income-suitability',
    sectionId: 'employment',
    fieldId: 'annualIncome',
    kind: 'compliance',
    severity: 'info',
    label: 'Income suitability',
    title: 'Confirm income supports the premium',
    summary: 'Income and occupation help validate suitability and underwriting requirements.',
    reason: 'Coverage and premium should align with stated income and employment stability.',
    bestAction: 'Confirm annual income and recent employment changes.',
    panel: {
      context: 'Income is used to assess suitability and may affect documentation requirements when coverage amounts are higher.',
      recommendations: [
        'Confirm annual household income.',
        'Ask whether employment changed in the last 12 months.',
        'Note hazardous duties if the occupation is higher risk.',
      ],
      suggestedQuestions: [
        { id: 'ai-employment-1', label: 'Has your employment situation changed in the last 12 months?' },
        { id: 'ai-employment-2', label: 'Does your work include hazardous duties or travel?' },
      ],
      sources: ['Suitability Engine', 'Catholic Life UW Guidelines'],
    },
  },
  {
    id: 'income-verification-threshold',
    sectionId: 'income-verification',
    fieldId: 'existingInsurance',
    kind: 'underwriting',
    severity: 'attention',
    label: 'Income verification',
    title: 'Prepare income verification context',
    summary: 'Coverage above the threshold may require financial documentation.',
    reason: 'Face amount over $250K can trigger income, net worth, and replacement review.',
    bestAction: 'Collect existing insurance and replacement intent before submission.',
    panel: {
      context: 'When face amount exceeds the verification threshold, underwriting may ask for financial context and total coverage justification.',
      recommendations: [
        'List existing life insurance in force.',
        'Confirm whether this policy replaces another policy.',
        'Prepare approximate net worth if requested.',
      ],
      suggestedQuestions: [
        { id: 'ai-income-verification-1', label: 'Do you currently have any other life insurance policies in force?' },
        { id: 'ai-income-verification-2', label: 'Is this new policy intended to replace an existing one?' },
      ],
      sources: ['Underwriting Rules', 'Catholic Life Financial Guidelines'],
    },
  },
];

export const AI_ASSIST_DATA: Record<string, AiAssistData> = {
  personal: {
    context:
      'Maxime Bouchard is an existing client with a prior policy (GFS-IP-2024-004821). His profile data has been verified through our Case Management system and PAS records. All pre-filled fields are sourced from his most recent policy application.',
    recommendations: [
      'SSN and DOB match PAS records — no discrepancy.',
      'Name matches identity verification on file.',
      'Consider confirming current address has not changed since last policy.',
    ],
    suggestedQuestions: [
      { id: 'sq-p1', label: 'Has your legal name changed since your last application?' },
      { id: 'sq-p2', label: 'Can you confirm your Social Security Number ending in 7765?' },
      { id: 'sq-p3', label: "Is your driver's license still current?", fieldId: 'driversLicense' },
    ],
    sources: ['Case Management · Client Profile', 'PAS · Policy GFS-IP-2024-004821'],
  },
  contact: {
    context:
      'Contact information pulled from the active client profile. The Philadelphia address was verified via USPS address validation in the last 90 days. Phone number confirmed as mobile via carrier lookup.',
    recommendations: [
      'Address validated by USPS — deliverable.',
      'Email matches prior correspondence records.',
      'Phone is a confirmed mobile number — suitable for e-signature SMS delivery.',
    ],
    suggestedQuestions: [
      { id: 'sq-c1', label: 'Are you still residing at 1515 Market ST, Philadelphia?' },
      { id: 'sq-c2', label: 'Is this the best email for policy correspondence?' },
      { id: 'sq-c3', label: 'Do you have a secondary phone number we should have on file?' },
    ],
    sources: ['Case Management · Client Profile', 'USPS Address Validation'],
  },
  'primary-ben': {
    context:
      'No existing beneficiary designations found in prior policies for this applicant. The system recommends collecting primary and contingent beneficiary information. If the beneficiary is a minor, a trust or custodial arrangement should be discussed.',
    recommendations: [
      'Verify relationship to insured matches legal documentation.',
      'If beneficiary is a minor, recommend a UTMA custodian.',
      'Confirm percentage allocations sum to 100%.',
    ],
    suggestedQuestions: [
      { id: 'sq-b1', label: 'Who would you like as your primary beneficiary?' },
      { id: 'sq-b2', label: 'Are any of your beneficiaries under 18?' },
      { id: 'sq-b3', label: 'Would you like to designate a contingent beneficiary in case the primary predeceases you?' },
    ],
    sources: ['eApp Engine', 'Catholic Life Underwriting Guidelines'],
  },
  'contingent-ben': {
    context:
      'A contingent beneficiary is recommended as a safeguard. If the primary beneficiary predeceases the insured, the contingent receives the death benefit. Without a contingent, proceeds may go through probate.',
    recommendations: [
      'A contingent beneficiary avoids probate delays.',
      'Consider naming a trust if minor children are involved.',
    ],
    suggestedQuestions: [
      { id: 'sq-cb1', label: 'Do you have someone in mind as a contingent beneficiary?' },
      { id: 'sq-cb2', label: 'Should the contingent be a trust for minor children?' },
    ],
    sources: ['eApp Engine'],
  },
  'coverage-main': {
    context:
      'Based on the applicant profile — age 50, annual income estimated at $92K — the needs analysis suggests $250K–$500K coverage is appropriate. Catholic Life Whole Life products offer dividend participation and cash value growth.',
    recommendations: [
      'Face amount of $250K–$500K aligns with income replacement needs.',
      'Monthly payment frequency minimizes lump-sum burden.',
      'Paid-Up Additions dividend option maximizes long-term cash value.',
    ],
    suggestedQuestions: [
      { id: 'sq-cv1', label: 'What face amount are you comfortable with given your monthly budget?' },
      { id: 'sq-cv2', label: 'Would you prefer to accumulate dividends or reduce premiums?' },
      { id: 'sq-cv3', label: 'Are you interested in any rider protections like Waiver of Premium?' },
    ],
    sources: ['Needs Analysis Engine', 'Catholic Life Product Rules'],
  },
  riders: {
    context:
      'Based on the applicant\'s age and coverage amount, the AI recommends reviewing Waiver of Premium and Accidental Death Benefit riders. The Long-Term Care rider becomes available at $100K+ face amounts.',
    recommendations: [
      'Waiver of Premium protects against disability — strong recommendation for working professionals.',
      'Accidental Death Benefit adds coverage at minimal cost.',
      'Child Term Rider available if the applicant has dependent children.',
    ],
    suggestedQuestions: [
      { id: 'sq-r1', label: 'Would disability protection on your premiums be important to you?' },
      { id: 'sq-r2', label: 'Do you have dependent children who might benefit from the Child Term Rider?' },
    ],
    sources: ['Underwriting Rules · PAS', 'Catholic Life Product Rules'],
  },
  'term-coverage-main': {
    context:
      'Term products offer the most affordable coverage per dollar. A 20-year term aligns with mortgage payoff timelines. The convertibility option lets the applicant switch to permanent coverage later without new underwriting.',
    recommendations: [
      '20-year term covers the remaining mortgage period.',
      'Convertibility option is valuable — recommend selecting Yes.',
      'Monthly frequency is the most common choice.',
    ],
    suggestedQuestions: [
      { id: 'sq-tc1', label: 'How many years do you need coverage for?' },
      { id: 'sq-tc2', label: 'Would you want the option to convert to permanent coverage in the future?' },
    ],
    sources: ['Needs Analysis Engine', 'Catholic Life Term Product Rules'],
  },
  'term-riders': {
    context:
      'For term products, Waiver of Premium and Return of Premium are the most popular riders. Return of Premium refunds all premiums paid if the insured outlives the term.',
    recommendations: [
      'Return of Premium adds ~30% to the base premium but appeals to cost-conscious buyers.',
      'Waiver of Premium recommended for income earners.',
    ],
    suggestedQuestions: [
      { id: 'sq-tr1', label: 'Would you prefer to get all your premiums back if you outlive the term?' },
    ],
    sources: ['Underwriting Rules · PAS'],
  },
  'health-general': {
    context:
      'No MIB hits found for this applicant. Rx check shows no prescription history on file. Height/weight will be used to calculate BMI — the system will flag if BMI exceeds 30 for additional underwriting review.',
    recommendations: [
      'BMI calculation will run automatically after height and weight are entered.',
      'If BMI > 30, expect a table rating or additional medical requirements.',
      'Tobacco status directly affects rate class — former smoker with 3+ year quit qualifies for non-tobacco rates at some carriers.',
    ],
    suggestedQuestions: [
      { id: 'sq-hg1', label: 'Have you used any tobacco products, including vaping, in the last 12 months?' },
      { id: 'sq-hg2', label: 'Are you currently on any prescription medications we should know about?' },
      { id: 'sq-hg3', label: 'When was your last routine physical exam?' },
    ],
    sources: ['MIB Check · Clean', 'Rx Check · No records', 'Catholic Life UW Guidelines'],
  },
  'health-conditions': {
    context:
      'This section screens for five major condition categories. Each "Yes" answer activates a reflex question tree with structured follow-ups. The data flows directly to the UW workbench as discrete fields — not free text. Cumulative risk from multiple conditions is assessed automatically.',
    recommendations: [
      'Heart + Sleep apnea together trigger a cumulative risk flag.',
      'Diabetes Type 1 routes to manual UW review immediately.',
      'HbA1c > 8.0 with insulin use triggers additional UW referral.',
      'Mental health conditions are assessed individually — medication compliance is key.',
    ],
    suggestedQuestions: [
      { id: 'sq-hc1', label: 'Have you ever been diagnosed with high blood pressure or hypertension?' },
      { id: 'sq-hc2', label: 'Have you had any cancer screenings in the last 2 years?' },
      { id: 'sq-hc3', label: 'Are you currently managing any chronic conditions with medication?' },
      { id: 'sq-hc4', label: 'Do you use a CPAP or other breathing device at night?' },
      { id: 'sq-hc5', label: 'Have you seen a mental health professional in the last 5 years?' },
    ],
    sources: ['Catholic Life UW Guidelines', 'Reflex Question Engine', 'MIB · Clean'],
  },
  'tobacco-detail': {
    context:
      'The applicant indicated tobacco use. Tobacco type, frequency, and quit plans directly impact rate classification. Former smokers who quit 3+ years ago may qualify for non-tobacco preferred rates.',
    recommendations: [
      'Cigarette use within 12 months = tobacco rate class.',
      'Cigar-only (≤12/year) may qualify for non-tobacco at some carriers.',
      'Vaping is classified as tobacco by Catholic Life.',
    ],
    suggestedQuestions: [
      { id: 'sq-td1', label: 'What type of tobacco do you currently use or last used?' },
      { id: 'sq-td2', label: 'How long have you been using tobacco products?' },
      { id: 'sq-td3', label: 'Have you discussed a cessation plan with your physician?' },
    ],
    sources: ['Catholic Life Tobacco Guidelines', 'Rate Classification Engine'],
  },
  'medication-detail': {
    context:
      'Medication details are cross-referenced with the Rx check database. This information routes to the UW workbench as structured data for pharmacological risk assessment.',
    recommendations: [
      'List all medications including OTC supplements.',
      'Dosage changes in the last 6 months are significant to underwriting.',
    ],
    suggestedQuestions: [
      { id: 'sq-md1', label: 'Can you list all medications you take daily, including dosages?' },
      { id: 'sq-md2', label: 'Have any of your medications or dosages changed recently?' },
    ],
    sources: ['Rx Check Database', 'UW Workbench'],
  },
  employment: {
    context:
      'Employment and income data is used for suitability assessment and to determine if income verification is needed (triggered at $250K+ face amounts). Occupation impacts risk classification for certain hazardous jobs.',
    recommendations: [
      'Income should support the premium obligation — rule of thumb is premium < 7% of income.',
      'Hazardous occupations (mining, logging, aviation) trigger additional UW review.',
      'Self-employed applicants may need 2 years of tax returns for high face amounts.',
    ],
    suggestedQuestions: [
      { id: 'sq-e1', label: 'What is your current occupation and employer?' },
      { id: 'sq-e2', label: 'Has your employment situation changed in the last 12 months?' },
      { id: 'sq-e3', label: 'What is your approximate annual household income?' },
    ],
    sources: ['Suitability Engine', 'Catholic Life UW Guidelines'],
  },
  'income-verification': {
    context:
      'Face amount exceeds $250,000. Catholic Life requires income verification for coverage above this threshold. Net worth, existing insurance, and replacement intent are assessed.',
    recommendations: [
      'Total coverage (existing + new) should not exceed 20x annual income.',
      'If replacing an existing policy, 1035 exchange options should be discussed.',
      'Net worth documentation may be requested during underwriting.',
    ],
    suggestedQuestions: [
      { id: 'sq-iv1', label: 'Do you currently have any other life insurance policies in force?' },
      { id: 'sq-iv2', label: 'Is this new policy intended to replace an existing one?' },
      { id: 'sq-iv3', label: 'What is your approximate net worth including retirement accounts?' },
    ],
    sources: ['Underwriting Rules', 'Catholic Life Financial Guidelines'],
  },
  'agent-info': {
    context:
      'Agent information is pre-filled from the logged-in session. The attestation section confirms suitability, identity verification, and accuracy — all three are required for submission.',
    recommendations: [
      'Verify all three attestation boxes are checked before proceeding.',
      'Add notes for any observations that may help the underwriter.',
      'Confirm the applicant was present and identified in person or via video.',
    ],
    suggestedQuestions: [],
    sources: ['Agent Profile · Session', 'Catholic Life Compliance'],
  },
  'agent-attestation': {
    context:
      'All three attestation checkboxes are required by Catholic Life compliance. The agent confirms identity verification, information accuracy, and product suitability. Any concerns should be documented in the notes field.',
    recommendations: [
      'Identity verification can be in-person or via secure video call.',
      'Suitability means the product matches the applicant\'s stated financial needs.',
      'Use the notes field to document any unusual circumstances.',
    ],
    suggestedQuestions: [],
    sources: ['Catholic Life Compliance', 'NAIC Suitability Standards'],
  },
};
