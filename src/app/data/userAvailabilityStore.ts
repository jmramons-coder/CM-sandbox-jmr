import type { AvailabilityBlock, AvailabilityBlockReason } from '../domain/access/platformUser';

const store = new Map<string, AvailabilityBlock[]>();

function storageKey(datasetId: string) {
  return `amplify-user-availability:${datasetId}`;
}

function readFromSession(datasetId: string): AvailabilityBlock[] {
  if (typeof window === 'undefined') return store.get(datasetId) ?? [];
  try {
    const raw = window.sessionStorage.getItem(storageKey(datasetId));
    if (!raw) return store.get(datasetId) ?? [];
    const parsed = JSON.parse(raw) as AvailabilityBlock[];
    store.set(datasetId, parsed);
    return parsed;
  } catch {
    return store.get(datasetId) ?? [];
  }
}

function writeToSession(datasetId: string, blocks: AvailabilityBlock[]) {
  store.set(datasetId, blocks);
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(storageKey(datasetId), JSON.stringify(blocks));
  } catch {
    // ignore quota
  }
}

export function listAvailabilityBlocks(datasetId: string, userId?: string): AvailabilityBlock[] {
  const all = readFromSession(datasetId);
  return userId ? all.filter((block) => block.userId === userId) : all;
}

export function isUserBlockedOnDate(blocks: AvailabilityBlock[], isoDate: string): boolean {
  return blocks.some(
    (block) =>
      block.blocksAssignment && block.startDate <= isoDate && isoDate <= block.endDate,
  );
}

export function addAvailabilityBlock(
  datasetId: string,
  input: {
    userId: string;
    startDate: string;
    endDate: string;
    reason: AvailabilityBlockReason;
    notes?: string;
    blocksAssignment: boolean;
    createdBy: string;
  },
): AvailabilityBlock {
  const block: AvailabilityBlock = {
    id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: input.userId,
    startDate: input.startDate,
    endDate: input.endDate,
    reason: input.reason,
    notes: input.notes,
    blocksAssignment: input.blocksAssignment,
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
  };
  const next = [...readFromSession(datasetId), block];
  writeToSession(datasetId, next);
  return block;
}

export function removeAvailabilityBlock(datasetId: string, blockId: string): void {
  const next = readFromSession(datasetId).filter((block) => block.id !== blockId);
  writeToSession(datasetId, next);
}
