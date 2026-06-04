import { DEMO_ENV_EQUISOFT_ID } from './demo-environment-deploy';

let activeDemoConfigurationId: string | null = DEMO_ENV_EQUISOFT_ID;

export function setActiveDemoConfigurationId(id: string | null): void {
  activeDemoConfigurationId = id;
}

export function getActiveDemoConfigurationId(): string | null {
  return activeDemoConfigurationId;
}
