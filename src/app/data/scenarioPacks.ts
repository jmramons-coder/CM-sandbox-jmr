import type { CaseKind } from '../domain/objectRefs';
import type { DatasetGenerationProfile } from './datasetGenerator';

export interface ScenarioPack {
  id: string;
  label: string;
  description: string;
  market: string;
  businessModel: string;
  enabledBusinessLines: CaseKind[];
  products: string[];
  personas: string[];
  agencies: string[];
  emphasis: string[];
}

export const SCENARIO_PACKS: ScenarioPack[] = [
  {
    id: 'uk-claims-carrier',
    label: 'UK claims carrier',
    description: 'Income protection and service-heavy carrier context with strong claim decision content.',
    market: 'UK',
    businessModel: 'carrier',
    enabledBusinessLines: ['claim', 'customer_service'],
    products: ['Guardian Income Protection', 'Executive Income Protection', 'Whole Life'],
    personas: ['Billy Bud', 'Sarah Dupont', 'Elena Rossi', 'James Hartley'],
    agencies: ['Guardian Direct', 'Northstar Advisory'],
    emphasis: ['claims decisions', 'medical evidence', 'service requests'],
  },
  {
    id: 'us-new-business-intake',
    label: 'US new business intake',
    description: 'US life carrier context with application intake, intake scoring, and advisor follow-up.',
    market: 'US',
    businessModel: 'carrier',
    enabledBusinessLines: ['new_business', 'customer_service'],
    products: ['Guardian Life 20', 'Executive Life', 'Universal Life'],
    personas: ['Amelia Hart', 'Marc Tremblay', 'Noah Bennett', 'Ava Collins'],
    agencies: ['Topgun Advisory', 'Northstar Advisory', 'Summit Producers'],
    emphasis: ['application completeness', 'risk evidence', 'advisor communications'],
  },
  {
    id: 'mga-agent-onboarding',
    label: 'MGA agent onboarding',
    description: 'MGA context centered on agent licensing, contracting, and appointment activation.',
    market: 'US / Canada',
    businessModel: 'mga',
    enabledBusinessLines: ['agent_onboarding', 'new_business', 'customer_service'],
    products: ['Producer Appointment', 'Carrier Contract', 'Life Application'],
    personas: ['Pete Mitchell', 'Natasha Trace', 'Victor Ramon', 'Dana Cruz'],
    agencies: ['Topgun Advisory', 'Northstar Advisory', 'Harbor MGA'],
    emphasis: ['licensing', 'contracting', 'producer readiness'],
  },
  {
    id: 'full-platform-demo',
    label: 'Full platform architecture demo',
    description: 'All business lines and entities enabled for broad platform demonstrations.',
    market: 'US / UK configurable',
    businessModel: 'platform_demo',
    enabledBusinessLines: ['claim', 'new_business', 'customer_service', 'agent_onboarding'],
    products: ['Guardian Income Protection', 'Guardian Life 20', 'Executive Life', 'Whole Life'],
    personas: ['Billy Bud', 'Amelia Hart', 'Marc Tremblay', 'Elena Rossi', 'Pete Mitchell'],
    agencies: ['Topgun Advisory', 'Northstar Advisory', 'Guardian Direct'],
    emphasis: ['relationship graph', 'utility modules', 'AI context', 'schema coverage'],
  },
];

export function getScenarioPackForProfile(profile: DatasetGenerationProfile): ScenarioPack {
  const byBusinessLine = SCENARIO_PACKS.find((pack) =>
    profile.enabledBusinessLines.every((line) => pack.enabledBusinessLines.includes(line)),
  );
  return byBusinessLine ?? SCENARIO_PACKS[SCENARIO_PACKS.length - 1];
}
