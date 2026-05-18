/**
 * eApp data layer — types, Catholic Life templates, and mock dashboard rows.
 */

/* ─── Field & section types ─── */

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'textarea';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  prefill?: string;
  prefillReason?: string;
  helpText?: string;
  half?: boolean;
  /** Only render this field when the predicate returns true (branching). */
  visibleWhen?: (answers: Record<string, unknown>) => boolean;
  /** Follow-up questions shown when this field's answer is "Yes" (reflex tree). */
  reflexFollowUps?: FormField[];
  /** Whether this follow-up field is enabled in the config. Defaults to true. */
  enabled?: boolean;
}

export interface QuestionSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  aiGenerated?: boolean;
  /** Only show this section when the predicate returns true. */
  visibleWhen?: (answers: Record<string, unknown>) => boolean;
}

export interface FormStep {
  id: string;
  label: string;
  sections: QuestionSection[];
  next?: (answers: Record<string, unknown>) => string | null;
}

export interface EAppTemplate {
  id: string;
  name: string;
  productType: string;
  category: string;
  description: string;
  carrier: string;
  steps: FormStep[];
  version?: string;
  popular?: boolean;
}

/* ─── Dashboard types ─── */

export type EAppStatus = 'Draft' | 'In Progress' | 'Under Review' | 'Submitted' | 'Approved' | 'Declined';

export interface EAppSummary {
  id: string;
  templateId: string;
  templateName: string;
  applicantName: string;
  status: EAppStatus;
  createdDate: string;
  lastModified: string;
  currentStep: string;
  completionPct: number;
}

/* ─── Whole Life template ─── */

const WHOLE_LIFE_STEPS: FormStep[] = [
  {
    id: 'applicant',
    label: 'Applicant Information',
    sections: [
      {
        id: 'personal',
        title: 'Personal Details',
        fields: [
          { id: 'firstName', label: 'First Name', type: 'text', required: true, half: true, prefill: 'Maxime', prefillReason: 'From client profile' },
          { id: 'middleInitial', label: 'Middle Initial', type: 'text', half: true, placeholder: 'Optional' },
          { id: 'lastName', label: 'Last Name', type: 'text', required: true, half: true, prefill: 'Bouchard', prefillReason: 'From client profile' },
          { id: 'suffix', label: 'Suffix', type: 'select', options: ['Jr.', 'Sr.', 'II', 'III', 'IV'], half: true, placeholder: 'None' },
          { id: 'dob', label: 'Date of Birth', type: 'date', required: true, half: true, prefill: '1975-01-01', prefillReason: 'From client profile' },
          { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Non-binary'], required: true, half: true, prefill: 'Female', prefillReason: 'From client profile' },
          { id: 'ssn', label: 'Social Security # / Tax ID', type: 'text', required: true, placeholder: '000-00-0000', prefill: '678-56-7765', prefillReason: 'From client profile' },
          { id: 'driversLicense', label: "Driver's License Number", type: 'text', half: true, placeholder: 'Optional' },
          { id: 'dlState', label: 'DL State', type: 'select', options: ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'], half: true },
        ],
      },
      {
        id: 'contact',
        title: 'Contact Information',
        aiGenerated: true,
        fields: [
          { id: 'email', label: 'Email', type: 'text', required: true, prefill: 'maxime.bouchard@gmail.com', prefillReason: 'From client profile' },
          { id: 'phone', label: 'Phone', type: 'text', required: true, half: true, prefill: '(215) 555-0142', prefillReason: 'From client profile' },
          { id: 'phoneType', label: 'Phone Type', type: 'select', options: ['Mobile', 'Home', 'Work'], half: true, prefill: 'Mobile' },
          { id: 'address', label: 'Address', type: 'text', required: true, prefill: '1515 Market ST FL 1', prefillReason: 'From client profile' },
          { id: 'city', label: 'City', type: 'text', required: true, half: true, prefill: 'Philadelphia', prefillReason: 'From client profile' },
          { id: 'state', label: 'State', type: 'select', options: ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'], required: true, half: true, prefill: 'PA' },
          { id: 'zip', label: 'ZIP Code', type: 'text', required: true, half: true, prefill: '19102', prefillReason: 'From client profile' },
          { id: 'country', label: 'Country', type: 'select', options: ['USA', 'Canada'], half: true, prefill: 'USA' },
        ],
      },
    ],
  },
  {
    id: 'beneficiary',
    label: 'Beneficiary',
    sections: [
      {
        id: 'primary-ben',
        title: 'Primary Beneficiary',
        fields: [
          { id: 'benPrimaryName', label: 'Full Name', type: 'text', required: true },
          { id: 'benPrimaryRelation', label: 'Relationship', type: 'select', options: ['Spouse', 'Child', 'Parent', 'Sibling', 'Trust', 'Estate', 'Other'], required: true, half: true },
          { id: 'benPrimaryPct', label: 'Percentage', type: 'number', required: true, half: true, placeholder: '100', prefill: '100' },
          { id: 'benPrimaryDob', label: 'Date of Birth', type: 'date', half: true },
          { id: 'benPrimarySSN', label: 'SSN (last 4)', type: 'text', half: true, placeholder: '0000' },
        ],
      },
      {
        id: 'contingent-ben',
        title: 'Contingent Beneficiary',
        description: 'If the primary beneficiary predeceases the insured.',
        aiGenerated: true,
        fields: [
          { id: 'benContingentName', label: 'Full Name', type: 'text' },
          { id: 'benContingentRelation', label: 'Relationship', type: 'select', options: ['Spouse', 'Child', 'Parent', 'Sibling', 'Trust', 'Estate', 'Other'], half: true },
          { id: 'benContingentPct', label: 'Percentage', type: 'number', half: true, placeholder: '100' },
        ],
      },
    ],
  },
  {
    id: 'coverage',
    label: 'Coverage Selection',
    sections: [
      {
        id: 'coverage-main',
        title: 'Coverage Details',
        fields: [
          { id: 'faceAmount', label: 'Face Amount ($)', type: 'select', options: ['25,000', '50,000', '100,000', '150,000', '250,000', '500,000', '1,000,000'], required: true },
          { id: 'paymentFrequency', label: 'Payment Frequency', type: 'radio', options: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'], required: true, prefill: 'Monthly' },
          { id: 'dividendOption', label: 'Dividend Option', type: 'select', options: ['Paid-Up Additions', 'Cash', 'Reduce Premiums', 'Accumulate at Interest'], required: true },
        ],
      },
      {
        id: 'riders',
        title: 'Optional Riders',
        aiGenerated: true,
        description: 'AI-recommended riders based on applicant profile.',
        fields: [
          { id: 'riderWaiverPremium', label: 'Waiver of Premium', type: 'checkbox', helpText: 'Waives premiums if you become disabled.' },
          { id: 'riderAccidentalDeath', label: 'Accidental Death Benefit', type: 'checkbox', helpText: 'Pays additional benefit for accidental death.' },
          { id: 'riderChildTerm', label: 'Children Term Rider', type: 'checkbox', helpText: 'Term coverage for all eligible children.' },
          { id: 'riderLongTermCare', label: 'Long-Term Care Rider', type: 'checkbox', helpText: 'Accelerates death benefit for LTC needs.', visibleWhen: (a) => Number(String(a.faceAmount ?? '').replace(/,/g, '')) >= 100000 },
        ],
      },
    ],
  },
  {
    id: 'medical',
    label: 'Medical Questionnaire',
    sections: [
      {
        id: 'health-general',
        title: 'General Health',
        fields: [
          { id: 'heightFt', label: 'Height (ft)', type: 'number', required: true, half: true },
          { id: 'heightIn', label: 'Height (in)', type: 'number', required: true, half: true },
          { id: 'weight', label: 'Weight (lbs)', type: 'number', required: true },
          { id: 'smoker', label: 'Have you used tobacco products in the last 12 months?', type: 'radio', options: ['No', 'Yes'], required: true },
          { id: 'medications', label: 'Are you currently taking any medications?', type: 'radio', options: ['No', 'Yes'], required: true },
        ],
      },
      {
        id: 'tobacco-detail',
        title: 'Tobacco Use Details',
        aiGenerated: true,
        visibleWhen: (a) => a.smoker === 'Yes',
        fields: [
          { id: 'tobaccoType', label: 'Type of tobacco', type: 'select', options: ['Cigarettes', 'Cigars', 'Chewing tobacco', 'Vaping / E-cigarettes', 'Other'], required: true },
          { id: 'tobaccoFrequency', label: 'Frequency', type: 'select', options: ['Daily', 'Weekly', 'Occasionally'], required: true },
          { id: 'tobaccoQuitPlan', label: 'Do you have a plan to quit?', type: 'radio', options: ['No', 'Yes'] },
        ],
      },
      {
        id: 'medication-detail',
        title: 'Medication Details',
        aiGenerated: true,
        visibleWhen: (a) => a.medications === 'Yes',
        fields: [
          { id: 'medicationList', label: 'List all current medications', type: 'textarea', required: true, placeholder: 'Name, dosage, and reason for each medication' },
          { id: 'medicationPhysician', label: 'Prescribing physician name', type: 'text' },
        ],
      },
      {
        id: 'health-conditions',
        title: 'Health Conditions',
        fields: [
          {
            id: 'condHeart',
            label: 'Heart disease, stroke, or circulatory disorder?',
            type: 'radio',
            options: ['No', 'Yes'],
            required: true,
            reflexFollowUps: [
              { id: 'condHeart_medication', label: 'Medication name', type: 'text', enabled: true, required: true },
              { id: 'condHeart_dosage', label: 'Dosage', type: 'text', enabled: true },
              { id: 'condHeart_diagnosed', label: 'Date of diagnosis', type: 'date', enabled: true, required: true },
              { id: 'condHeart_lastReading', label: 'Last blood pressure reading (systolic/diastolic)', type: 'text', enabled: true, required: true, placeholder: 'e.g. 128/82' },
              { id: 'condHeart_physician', label: 'Treating physician', type: 'text', enabled: true },
            ],
          },
          {
            id: 'condCancer',
            label: 'Cancer, tumor, or abnormal growth?',
            type: 'radio',
            options: ['No', 'Yes'],
            required: true,
            reflexFollowUps: [
              { id: 'condCancer_type', label: 'Type of cancer or growth', type: 'text', enabled: true, required: true },
              { id: 'condCancer_diagnosed', label: 'Date of diagnosis', type: 'date', enabled: true, required: true },
              { id: 'condCancer_treatment', label: 'Treatment received', type: 'select', options: ['Surgery', 'Chemotherapy', 'Radiation', 'Immunotherapy', 'None', 'Other'], enabled: true },
              { id: 'condCancer_status', label: 'Current status', type: 'radio', options: ['In remission', 'Under treatment', 'Monitoring'], enabled: true, required: true },
              { id: 'condCancer_physician', label: 'Treating oncologist', type: 'text', enabled: false },
            ],
          },
          {
            id: 'condDiabetes',
            label: 'Diabetes or blood sugar disorder?',
            type: 'radio',
            options: ['No', 'Yes'],
            required: true,
            reflexFollowUps: [
              { id: 'condDiabetes_type', label: 'Type of diabetes', type: 'radio', options: ['Type 1', 'Type 2', 'Gestational'], enabled: true, required: true },
              { id: 'condDiabetes_hba1c', label: 'Most recent HbA1c result', type: 'text', enabled: true, required: true, placeholder: 'e.g. 6.5' },
              { id: 'condDiabetes_hba1cDate', label: 'Date of HbA1c test', type: 'date', enabled: true },
              { id: 'condDiabetes_insulin', label: 'Are you currently taking insulin?', type: 'radio', options: ['No', 'Yes'], enabled: true, required: true },
              { id: 'condDiabetes_physician', label: 'Treating physician', type: 'text', enabled: false },
            ],
          },
          {
            id: 'condMental',
            label: 'Mental health, anxiety, or depression diagnosis?',
            type: 'radio',
            options: ['No', 'Yes'],
            required: true,
            reflexFollowUps: [
              { id: 'condMental_condition', label: 'Condition diagnosed', type: 'select', options: ['Anxiety', 'Depression', 'Bipolar disorder', 'PTSD', 'Other'], enabled: true, required: true },
              { id: 'condMental_medication', label: 'Current medication', type: 'text', enabled: true },
              { id: 'condMental_dosage', label: 'Dosage', type: 'text', enabled: true },
              { id: 'condMental_hospitalized', label: 'Have you been hospitalized for this condition?', type: 'radio', options: ['No', 'Yes'], enabled: true },
              { id: 'condMental_physician', label: 'Treating provider', type: 'text', enabled: false },
            ],
          },
          {
            id: 'condRespiratory',
            label: 'Asthma, COPD, or respiratory condition?',
            type: 'radio',
            options: ['No', 'Yes'],
            required: true,
            reflexFollowUps: [
              { id: 'condResp_condition', label: 'Condition', type: 'select', options: ['Asthma', 'COPD', 'Sleep apnea', 'Other'], enabled: true, required: true },
              { id: 'condResp_cpap', label: 'Do you use a CPAP device?', type: 'radio', options: ['No', 'Yes'], enabled: true },
              { id: 'condResp_compliance', label: 'CPAP compliance rate', type: 'select', options: ['Below 50%', '50-79%', '80% or above'], enabled: true, helpText: 'Compliance >80% is favorable for underwriting.' },
              { id: 'condResp_medication', label: 'Current medication (inhaler, etc.)', type: 'text', enabled: true },
              { id: 'condResp_physician', label: 'Treating physician', type: 'text', enabled: false },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'financial',
    label: 'Financial & Occupation',
    sections: [
      {
        id: 'employment',
        title: 'Employment',
        fields: [
          { id: 'employmentStatus', label: 'Employment Status', type: 'select', options: ['Employed', 'Self-Employed', 'Retired', 'Unemployed', 'Student'], required: true },
          { id: 'employer', label: 'Employer Name', type: 'text', half: true, visibleWhen: (a) => a.employmentStatus === 'Employed' },
          { id: 'occupation', label: 'Occupation / Job Title', type: 'text', half: true, required: true },
          { id: 'annualIncome', label: 'Annual Income ($)', type: 'number', required: true },
        ],
      },
      {
        id: 'income-verification',
        title: 'Income Verification',
        aiGenerated: true,
        description: 'Required when face amount exceeds $250,000.',
        visibleWhen: (a) => Number(String(a.faceAmount ?? '').replace(/,/g, '')) >= 250000,
        fields: [
          { id: 'netWorth', label: 'Estimated Net Worth ($)', type: 'number', required: true },
          { id: 'existingInsurance', label: 'Total existing life insurance coverage ($)', type: 'number', required: true },
          { id: 'replacementPolicy', label: 'Is this application replacing an existing policy?', type: 'radio', options: ['No', 'Yes'], required: true },
        ],
      },
    ],
  },
  {
    id: 'agent',
    label: 'Agent Report',
    sections: [
      {
        id: 'agent-info',
        title: 'Agent Information',
        fields: [
          { id: 'agentName', label: 'Agent Name', type: 'text', required: true, prefill: 'Victor Ramon', prefillReason: 'Logged-in user' },
          { id: 'agentNumber', label: 'Agent Number', type: 'text', required: true, prefill: 'CL-AG-2024-0812', prefillReason: 'From agent profile' },
          { id: 'agentPhone', label: 'Agent Phone', type: 'text', half: true, prefill: '(555) 867-5309', prefillReason: 'From agent profile' },
          { id: 'agentEmail', label: 'Agent Email', type: 'text', half: true, prefill: 'victor.ramon@catholiclife.com', prefillReason: 'From agent profile' },
        ],
      },
      {
        id: 'agent-attestation',
        title: 'Agent Attestation',
        fields: [
          { id: 'attestIdentity', label: 'I have verified the identity of the applicant', type: 'checkbox', required: true },
          { id: 'attestAccuracy', label: 'All information was recorded accurately to the best of my knowledge', type: 'checkbox', required: true },
          { id: 'attestSuitability', label: 'I believe this product is suitable for the applicant\'s needs', type: 'checkbox', required: true },
          { id: 'agentNotes', label: 'Additional Notes', type: 'textarea', placeholder: 'Any additional observations or comments...' },
        ],
      },
    ],
  },
  {
    id: 'review',
    label: 'Review',
    sections: [],
  },
  {
    id: 'submission',
    label: 'Submission',
    sections: [],
  },
];

/* ─── Term Life template (shorter) ─── */

const TERM_LIFE_STEPS: FormStep[] = [
  {
    id: 'applicant',
    label: 'Applicant Information',
    sections: [
      { ...WHOLE_LIFE_STEPS[0].sections[0] },
      { ...WHOLE_LIFE_STEPS[0].sections[1] },
    ],
  },
  {
    id: 'beneficiary',
    label: 'Beneficiary',
    sections: WHOLE_LIFE_STEPS[1].sections.map((s) => ({ ...s })),
  },
  {
    id: 'coverage',
    label: 'Coverage Selection',
    sections: [
      {
        id: 'term-coverage-main',
        title: 'Term Coverage Details',
        fields: [
          { id: 'termLength', label: 'Term Length', type: 'select', options: ['10 years', '15 years', '20 years', '25 years', '30 years'], required: true },
          { id: 'faceAmount', label: 'Face Amount ($)', type: 'select', options: ['50,000', '100,000', '250,000', '500,000', '750,000', '1,000,000'], required: true },
          { id: 'paymentFrequency', label: 'Payment Frequency', type: 'radio', options: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'], required: true, prefill: 'Monthly' },
          { id: 'convertible', label: 'Convertible to permanent?', type: 'radio', options: ['No', 'Yes'], helpText: 'Option to convert to whole life without new underwriting.' },
        ],
      },
      {
        id: 'term-riders',
        title: 'Optional Riders',
        aiGenerated: true,
        fields: [
          { id: 'riderWaiverPremium', label: 'Waiver of Premium', type: 'checkbox', helpText: 'Waives premiums if you become disabled.' },
          { id: 'riderAccidentalDeath', label: 'Accidental Death Benefit', type: 'checkbox' },
          { id: 'riderReturnPremium', label: 'Return of Premium', type: 'checkbox', helpText: 'Refunds all premiums if you outlive the term.' },
        ],
      },
    ],
  },
  {
    id: 'medical',
    label: 'Medical Questionnaire',
    sections: WHOLE_LIFE_STEPS[3].sections.map((s) => ({ ...s })),
  },
  {
    id: 'review',
    label: 'Review',
    sections: [],
  },
  {
    id: 'submission',
    label: 'Submission',
    sections: [],
  },
];

/* ─── Templates ─── */

export const EAPP_TEMPLATES: EAppTemplate[] = [
  {
    id: 'tpl-whole-life',
    name: 'Catholic Life Whole Life',
    productType: 'Whole Life',
    category: 'Life Insurance',
    description: 'Permanent coverage with guaranteed cash value growth, dividends, and flexible premium options.',
    carrier: 'Catholic Life Insurance',
    steps: WHOLE_LIFE_STEPS,
    version: '2.4',
    popular: true,
  },
  {
    id: 'tpl-term-life',
    name: 'Catholic Life Term Life',
    productType: 'Term Life',
    category: 'Life Insurance',
    description: 'Affordable term coverage with convertibility options and flexible term lengths from 10 to 30 years.',
    carrier: 'Catholic Life Insurance',
    steps: TERM_LIFE_STEPS,
    version: '1.8',
    popular: true,
  },
  {
    id: 'tpl-universal-life',
    name: 'Catholic Life Universal',
    productType: 'Universal Life',
    category: 'Life Insurance',
    description: 'Flexible premium universal life policy with adjustable death benefit and cash value accumulation.',
    carrier: 'Catholic Life Insurance',
    steps: WHOLE_LIFE_STEPS,
    version: '1.2',
  },
  {
    id: 'tpl-final-expense',
    name: 'Catholic Life Final Expense',
    productType: 'Final Expense',
    category: 'Life Insurance',
    description: 'Simplified issue whole life policy designed to cover funeral costs and end-of-life expenses.',
    carrier: 'Catholic Life Insurance',
    steps: TERM_LIFE_STEPS,
    version: '3.0',
    popular: true,
  },
  {
    id: 'tpl-annuity-fixed',
    name: 'Catholic Life Fixed Annuity',
    productType: 'Fixed Annuity',
    category: 'Annuities',
    description: 'Guaranteed interest rate annuity with tax-deferred growth and flexible payout options.',
    carrier: 'Catholic Life Insurance',
    steps: TERM_LIFE_STEPS,
    version: '1.0',
  },
  {
    id: 'tpl-disability',
    name: 'Catholic Life Disability',
    productType: 'Disability',
    category: 'Health & Disability',
    description: 'Short and long-term disability coverage with own-occupation definition and benefit riders.',
    carrier: 'Catholic Life Insurance',
    steps: WHOLE_LIFE_STEPS,
    version: '2.1',
  },
  {
    id: 'tpl-group-life',
    name: 'Catholic Life Group',
    productType: 'Group Life',
    category: 'Group Benefits',
    description: 'Employer-sponsored group life insurance with voluntary supplemental coverage options.',
    carrier: 'Catholic Life Insurance',
    steps: TERM_LIFE_STEPS,
    version: '1.5',
  },
];

/* ─── Mock dashboard data ─── */

export const MOCK_EAPPS: EAppSummary[] = [
  {
    id: 'EA-2026-001',
    templateId: 'tpl-whole-life',
    templateName: 'Catholic Life Whole Life',
    applicantName: 'Maxime Bouchard',
    status: 'In Progress',
    createdDate: 'Apr 18, 2026',
    lastModified: 'Apr 22, 2026',
    currentStep: 'Medical Questionnaire',
    completionPct: 52,
  },
  {
    id: 'EA-2026-002',
    templateId: 'tpl-term-life',
    templateName: 'Catholic Life Term Life',
    applicantName: 'Robert Tremblay',
    status: 'Submitted',
    createdDate: 'Apr 10, 2026',
    lastModified: 'Apr 15, 2026',
    currentStep: 'Submission',
    completionPct: 100,
  },
  {
    id: 'EA-2026-003',
    templateId: 'tpl-whole-life',
    templateName: 'Catholic Life Whole Life',
    applicantName: 'Maria Santos',
    status: 'Under Review',
    createdDate: 'Apr 5, 2026',
    lastModified: 'Apr 20, 2026',
    currentStep: 'Review',
    completionPct: 100,
  },
  {
    id: 'EA-2026-004',
    templateId: 'tpl-term-life',
    templateName: 'Catholic Life Term Life',
    applicantName: 'James O\'Brien',
    status: 'Draft',
    createdDate: 'Apr 21, 2026',
    lastModified: 'Apr 21, 2026',
    currentStep: 'Applicant Information',
    completionPct: 8,
  },
  {
    id: 'EA-2026-005',
    templateId: 'tpl-whole-life',
    templateName: 'Catholic Life Whole Life',
    applicantName: 'Sophia Chen',
    status: 'Approved',
    createdDate: 'Mar 28, 2026',
    lastModified: 'Apr 12, 2026',
    currentStep: 'Submission',
    completionPct: 100,
  },
];

export const EAPP_KPIS = [
  { label: 'Total Applications', value: '5', trend: '↑ 2 this month', trendPositive: true },
  { label: 'In Progress', value: '2', trend: '1 near completion', trendPositive: true },
  { label: 'Submitted This Month', value: '3', trend: '↑ 1 from last month', trendPositive: true },
  { label: 'Avg. Completion Time', value: '4.2 days', trend: '↓ 0.8 days', trendPositive: true },
];
