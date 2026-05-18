import type { CaseKind, WorkObjectKind } from '../domain/objectRefs';
import type { DocumentGenerationMode } from './datasetGenerator';

export type DatasetPromptInput = {
  organizationLabel: string;
  market: string;
  businessModel: string;
  enabledModules: string[];
  enabledMainEntities: Array<'client' | 'policy' | 'case' | 'agent'>;
  enabledUtilityEntities: WorkObjectKind[];
  enabledBusinessLines: CaseKind[];
  targetRecordCount: number;
  historyRange: string;
  documentMode: DocumentGenerationMode;
  scenarioEmphasis: string[];
};

export function buildDatasetGenerationPrompt(input: DatasetPromptInput): string {
  return [
    'Generate an Amplify Case Management dataset package as valid JSON.',
    '',
    `Organization: ${input.organizationLabel}`,
    `Market: ${input.market}`,
    `Business model: ${input.businessModel}`,
    `Target records: ${input.targetRecordCount}`,
    `History range: ${input.historyRange}`,
    `Document mode: ${input.documentMode}`,
    `Enabled modules: ${input.enabledModules.join(', ')}`,
    `Main entities: ${input.enabledMainEntities.join(', ')}`,
    `Utility entities: ${input.enabledUtilityEntities.join(', ')}`,
    `Business lines: ${input.enabledBusinessLines.join(', ')}`,
    `Scenario emphasis: ${input.scenarioEmphasis.join(', ')}`,
    '',
    'Return JSON matching AmplifyDatasetPackage version 1.0 with:',
    '- environment',
    '- entities.clients[] with profile/contact fields when the client appears in case headers',
    '- entities.policies[] with policyNumber, productType, benefit/coverage fields, and participants[] roles: owner, insured, beneficiary, payer, authorized_contact',
    '- entities.agents[] with producerCode, contact fields, agencyName, licenses[], contracts[], and linkedObjects',
    '- entities.applications[] for new business cases',
    '- entities.cases[] linked to client/policy/agent as appropriate, including facts[], sections[], moduleSummaries[], analysis, decision, and business-line-specific details',
    '- entities.tasks[] linked to client, policy, case, agent, or combinations, including SLA, AI summary/action, queue, authority level, and panelContext',
    '- entities.documents[] with uploaded/source/fileSize, aiSummary/aiAction, fileAvailable, and placeholderReason when metadata-only',
    '- entities.requests[] as standalone intake records linked to related entities, including category, priority, sourceChannel/sourceDetail, requester, due, aiSummary, nextAction, and systemSteps[]',
    '- entities.requirements[] scoped only to cases, including due/follow-up dates, source, trigger, rag, and workflowStepId',
    '- entities.communications[], entities.notes[], and entities.events[] linked to at least one main entity or case',
    '- entities.documentEvidence[] for document review side panels and entities.assistantResponses[] for demo AI transcripts',
    '- relationships[] listing every source/target relationship',
    '',
    'Validation rules:',
    '- no orphan references',
    '- every policy has at least one participant',
    '- every case links to client, policy, agent, or a valid combination required by the business line',
    '- requirements are case-only',
    '- tasks/documents/requests can attach to any main entity',
    '- metadata-only documents must set fileAvailable false',
    '- generated content should be rich enough to replace legacy hardcoded claim mock data when the legacy overlay is turned off',
    '- every business line should include fields that drive its anatomy: claim decisions, new business intake scoring, customer service requests, and agent onboarding licensing/contracts',
  ].join('\n');
}
