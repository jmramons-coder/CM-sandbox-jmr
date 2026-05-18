export type AppId = 'cm' | 'eapp' | 'docs';

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
  {
    id: 'docs',
    name: 'Documentation & Spec',
    subtitle: 'docs',
    description: 'Product and implementation specifications.',
    basePath: '/documentation',
    defaultPath: '/documentation',
  },
];

export function getActiveApp(pathname: string): AppDef {
  if (pathname.startsWith('/documentation')) return APPS[2];
  if (pathname.startsWith('/eapp')) return APPS[1];
  return APPS[0];
}

export function getAppById(id: AppId): AppDef {
  return APPS.find((a) => a.id === id) ?? APPS[0];
}
