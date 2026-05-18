import type { MockClient } from '../data/mock-entity-folders';

export type ClientMatchInput = {
  legalName: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  parish: string;
  taxId: string;
};

export type ClientDuplicateMatch = {
  client: MockClient;
  score: number;
  confidence: 'high' | 'possible' | 'low';
  reasons: string[];
};

const EMPTY_INPUT: ClientMatchInput = {
  legalName: '',
  dob: '',
  gender: '',
  email: '',
  phone: '',
  address: '',
  parish: '',
  taxId: '',
};

export function createEmptyClientMatchInput(): ClientMatchInput {
  return { ...EMPTY_INPUT };
}

export function findClientDuplicateMatches(
  input: Partial<ClientMatchInput>,
  clients: MockClient[],
  limit = 4,
): ClientDuplicateMatch[] {
  const normalizedInput = normalizeInput(input);
  if (!hasEnoughSignal(normalizedInput)) return [];

  return clients
    .map((client) => scoreClientMatch(normalizedInput, client))
    .filter((match) => match.score >= 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function scoreClientMatch(input: ClientMatchInput, client: MockClient): ClientDuplicateMatch {
  const reasons: string[] = [];
  let score = 0;

  const clientName = normalizeText(client.name);
  const clientTokens = nameTokens(client.name);
  const inputTokens = nameTokens(input.legalName);
  const clientSurname = clientTokens[0] ?? '';
  const inputSurname = inputTokens[0] ?? '';

  if (input.taxId && client.taxId && input.taxId === normalizeText(client.taxId)) {
    score += 65;
    reasons.push('Same tax ID');
  }

  if (input.email && client.email && input.email === normalizeText(client.email)) {
    score += 45;
    reasons.push('Same email');
  }

  if (input.phone && client.phone && input.phone === normalizePhone(client.phone)) {
    score += 45;
    reasons.push('Same phone');
  }

  if (input.legalName && input.legalName === clientName) {
    score += 38;
    reasons.push('Same legal name');
  } else if (input.legalName && namesOverlap(inputTokens, clientTokens)) {
    score += 24;
    reasons.push('Similar name');
  } else if (inputSurname && inputSurname === clientSurname) {
    score += 12;
    reasons.push('Same surname');
  }

  if (input.dob && input.dob === client.dob) {
    score += 32;
    reasons.push('Same date of birth');
  } else if (input.dob && sameBirthYear(input.dob, client.dob)) {
    score += 10;
    reasons.push('Same birth year');
  }

  if (input.address && client.address && normalizeAddress(input.address) === normalizeAddress(client.address)) {
    score += 24;
    reasons.push('Same household address');
  }

  if (input.parish && client.parish && input.parish === normalizeText(client.parish)) {
    score += 12;
    reasons.push('Same parish');
  }

  if (input.gender && client.gender && input.gender === normalizeText(client.gender)) {
    score += 4;
  }

  return {
    client,
    score,
    confidence: score >= 70 ? 'high' : score >= 38 ? 'possible' : 'low',
    reasons,
  };
}

function normalizeInput(input: Partial<ClientMatchInput>): ClientMatchInput {
  return {
    legalName: normalizeText(input.legalName ?? ''),
    dob: input.dob?.trim() ?? '',
    gender: normalizeText(input.gender ?? ''),
    email: normalizeEmail(input.email ?? ''),
    phone: normalizePhone(input.phone ?? ''),
    address: normalizeAddress(input.address ?? ''),
    parish: normalizeText(input.parish ?? ''),
    taxId: normalizeText(input.taxId ?? ''),
  };
}

function hasEnoughSignal(input: ClientMatchInput): boolean {
  return Boolean(
    input.legalName ||
    input.dob ||
    input.email ||
    input.phone ||
    input.address ||
    input.parish ||
    input.taxId,
  );
}

function normalizeText(value: string): string {
  return value.toLowerCase().trim().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ');
}

function normalizeEmail(value: string): string {
  return value.toLowerCase().trim();
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

function normalizeAddress(value: string): string {
  return normalizeText(value)
    .replace(/\bst\b/g, 'street')
    .replace(/\brd\b/g, 'road')
    .replace(/\bave\b/g, 'avenue');
}

function nameTokens(value: string): string[] {
  return normalizeText(value).split(' ').filter(Boolean);
}

function namesOverlap(inputTokens: string[], clientTokens: string[]): boolean {
  if (inputTokens.length === 0 || clientTokens.length === 0) return false;
  const overlap = inputTokens.filter((token) => clientTokens.includes(token));
  return overlap.length >= Math.min(2, inputTokens.length, clientTokens.length);
}

function sameBirthYear(a: string, b: string): boolean {
  return Boolean(a.slice(0, 4) && a.slice(0, 4) === b.slice(0, 4));
}
