import type { BuildDailyBriefParams, DailyBriefContent } from '../../domain/dailyBrief';
import type { SystemDataset } from '../multi-case-dataset';
import type { RoleView, UserProfile } from '../../domain/access/roleView';
import { gatherDailyBriefFacts } from './gatherFacts';
import { briefSegmentsToText, buildDailyBriefSegments } from './segmentBuilder';

const CONTEXT_TITLES: Record<BuildDailyBriefParams['contextId'], string> = {
  home: 'Daily brief',
  cases: 'Daily brief',
  tasks: 'Daily brief',
  requests: 'Daily brief',
  documents: 'Daily brief',
  'ai-actions': 'Daily brief',
};

export function buildDailyBrief(
  dataset: SystemDataset,
  profile: UserProfile,
  params: BuildDailyBriefParams,
): DailyBriefContent {
  const facts = gatherDailyBriefFacts(dataset, profile, params);
  const segments = buildDailyBriefSegments(facts);
  const hasDynamic = segments.some((row) => row.type !== 'text' || row.value !== facts.fallbackText);

  return {
    contextId: params.contextId,
    title: CONTEXT_TITLES[params.contextId],
    segments: segments.length ? segments : [{ type: 'text', value: facts.fallbackText }],
    text: segments.length ? briefSegmentsToText(segments) : facts.fallbackText,
    source: hasDynamic ? 'dynamic' : 'fallback',
  };
}

export function buildDailyBriefForRole(
  dataset: SystemDataset | undefined,
  roleView: RoleView,
  params: BuildDailyBriefParams,
  profile?: UserProfile,
): DailyBriefContent | null {
  if (!dataset || !profile) return null;
  return buildDailyBrief(dataset, profile, params);
}
