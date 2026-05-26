import type { ObjectRef, WorkObjectKind } from '../objectRefs';
import type { LinkedEntityRef } from './types';

const NAV_KIND_ORDER: WorkObjectKind[] = [
  'task',
  'case',
  'document',
  'client',
  'policy',
  'requirement',
  'application',
  'agent',
];

export function objectHref(kind: WorkObjectKind, id: string): string | undefined {
  switch (kind) {
    case 'task':
      return `/tasks#task=${encodeURIComponent(id)}`;
    case 'case':
      return `/cases/${id}`;
    case 'client':
    case 'policy':
    case 'agent':
    case 'application':
      return `/folders/${id}`;
    case 'document':
      return undefined;
    case 'request':
      return `/requests#request=${encodeURIComponent(id)}`;
    default:
      return undefined;
  }
}

export function mergeLinkedEntities(...groups: Array<LinkedEntityRef[] | undefined>): LinkedEntityRef[] {
  const seen = new Set<string>();
  const merged: LinkedEntityRef[] = [];
  for (const group of groups) {
    for (const ref of group ?? []) {
      const key = `${ref.kind}:${ref.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(ref);
    }
  }
  return merged.sort(
    (a, b) => NAV_KIND_ORDER.indexOf(a.kind) - NAV_KIND_ORDER.indexOf(b.kind),
  );
}

export function refsFromObjectRefs(refs: ObjectRef[] | undefined, labelFallback?: (kind: WorkObjectKind, id: string) => string): LinkedEntityRef[] {
  return (refs ?? []).map((ref) => ({
    kind: ref.kind,
    id: ref.kind === 'policy' ? ref.id : ref.id,
    label: ref.label ?? labelFallback?.(ref.kind, ref.id),
    href: ref.href ?? objectHref(ref.kind, ref.id),
  }));
}

export function policyRef(policyNumber: string | undefined, linkedObjects?: ObjectRef[]): LinkedEntityRef | undefined {
  const fromLink = linkedObjects?.find((ref) => ref.kind === 'policy');
  const id = fromLink?.id ?? policyNumber;
  if (!id) return undefined;
  return {
    kind: 'policy',
    id,
    label: fromLink?.label ?? id,
    href: fromLink?.href ?? objectHref('policy', id),
  };
}

export function clientRef(clientId: string | undefined, linkedObjects?: ObjectRef[]): LinkedEntityRef | undefined {
  const fromLink = linkedObjects?.find((ref) => ref.kind === 'client');
  const id = fromLink?.id ?? clientId;
  if (!id) return undefined;
  return {
    kind: 'client',
    id,
    label: fromLink?.label ?? id,
    href: fromLink?.href ?? objectHref('client', id),
  };
}
