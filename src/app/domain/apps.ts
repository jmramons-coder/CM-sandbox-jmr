export type AppId = 'cm' | 'eapp';

export interface AppDef {
  id: AppId;
  name: string;
  subtitle: string;
  description: string;
  basePath: string;
  defaultPath: string;
}

export const APPS: AppDef[] = [
  {
    id: 'cm',
    name: 'Amplify Case Management',
    subtitle: 'amplify',
    description: 'Manage claims, tasks, documents, and configurable case workflows.',
    basePath: '/',
    defaultPath: '/home',
  },
  {
    id: 'eapp',
    name: 'eApp',
    subtitle: 'eapp',
    description: 'Create and manage electronic insurance applications.',
    basePath: '/eapp',
    defaultPath: '/eapp',
  },
];

export function getActiveApp(pathname: string): AppDef {
  if (pathname.startsWith('/eapp')) return APPS[1];
  return APPS[0];
}

export function getAppById(id: AppId): AppDef {
  return APPS.find((a) => a.id === id) ?? APPS[0];
}
