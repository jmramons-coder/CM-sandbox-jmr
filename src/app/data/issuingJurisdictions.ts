export type JurisdictionOption = {
  id: string;
  label: string;
  group: 'Canada' | 'United States' | 'International';
};

const CA_PROVINCES: JurisdictionOption[] = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Northwest Territories',
  'Nova Scotia',
  'Nunavut',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Yukon',
].map((label) => ({ id: `CA-${label}`, label, group: 'Canada' as const }));

const US_STATES: JurisdictionOption[] = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia',
].map((label) => ({ id: `US-${label}`, label, group: 'United States' as const }));

const COUNTRIES: JurisdictionOption[] = [
  'Canada', 'United States', 'Mexico', 'United Kingdom', 'France', 'Germany', 'Italy',
  'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Australia', 'New Zealand', 'Japan',
  'China', 'India', 'Brazil', 'Argentina', 'Colombia', 'Chile', 'South Africa', 'Nigeria',
  'Egypt', 'Morocco', 'Israel', 'United Arab Emirates', 'Saudi Arabia', 'Singapore',
  'South Korea', 'Philippines', 'Indonesia', 'Malaysia', 'Thailand', 'Vietnam', 'Poland',
  'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland', 'Portugal', 'Greece', 'Turkey',
  'Russia', 'Ukraine', 'Czech Republic', 'Austria', 'Hungary', 'Romania',
].map((label) => ({ id: `INT-${label}`, label, group: 'International' as const }));

export const ISSUING_JURISDICTIONS: JurisdictionOption[] = [
  ...CA_PROVINCES,
  ...US_STATES,
  ...COUNTRIES,
];

export function searchJurisdictions(query: string, limit = 50): JurisdictionOption[] {
  const terms = query
    .toLowerCase()
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (!terms.length) return ISSUING_JURISDICTIONS.slice(0, limit);

  return ISSUING_JURISDICTIONS.filter((option) => {
    const haystack = `${option.label} ${option.group}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  }).slice(0, limit);
}

export function findJurisdictionByLabel(label: string): JurisdictionOption | undefined {
  return ISSUING_JURISDICTIONS.find(
    (j) => j.label.toLowerCase() === label.trim().toLowerCase(),
  );
}
