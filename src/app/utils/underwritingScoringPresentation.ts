import type { UnderwritingScoring } from '../domain/objectRefs';
import { deriveHumanNet, deriveRiskClass } from '../domain/scoring';

export function usesScoringSidePanel(scoring?: UnderwritingScoring | null): boolean {
  if (!scoring) return false;
  if (scoring.scoringPresentation === 'panel') return true;
  return Boolean(scoring.requirementAssessments?.length);
}

export function scoringPanelContextId(caseId?: string) {
  return caseId ? `scoring:${caseId}` : 'scoring';
}

function titleCaseRiskClass(value: string): string {
  const normalized = value.replace(/_/g, ' ').trim();
  if (!normalized) return '—';
  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatScoringHeaderSummary(scoring: UnderwritingScoring): string {
  const net = deriveHumanNet(scoring);
  const riskClass = scoring.riskClass || scoring.mappedDecision || deriveRiskClass(net);
  const netLabel = net === 0 ? '0' : net > 0 ? `+${net}` : String(net);
  return `${netLabel} · ${titleCaseRiskClass(riskClass)}`;
}

export function formatScoringCompactSummary(scoring: UnderwritingScoring): string {
  const net = deriveHumanNet(scoring);
  if (net === 0) return '0';
  return net > 0 ? `+${net}` : String(net);
}

export function formatScoringRiskLabel(scoring: UnderwritingScoring): string {
  const net = deriveHumanNet(scoring);
  const riskClass = scoring.riskClass || scoring.mappedDecision || deriveRiskClass(net);
  return titleCaseRiskClass(riskClass);
}

/** Plain-language risk class for compact UI (e.g. "Standard NT" → "Standard · Non-smoker"). */
export function formatScoringDisplayRiskLabel(scoring: UnderwritingScoring): string {
  const raw = formatScoringRiskLabel(scoring);
  if (/\sNT$/i.test(raw)) return raw.replace(/\sNT$/i, ' · Non-smoker');
  if (/\sT$/i.test(raw)) return raw.replace(/\sT$/i, ' · Smoker');
  return raw;
}

export function formatScoringCellValue(value?: string): string {
  if (!value || value.trim() === '') return '—';
  return value;
}
