import { describe, expect, it } from 'vitest';
import { EMPIRE_DECISION_FLOW_RECORDS } from '../data/empire-decision-records';
import { EMPIRE_DEMO_CASE_IDS } from '../data/empireDemoCaseIds';
import { getCaseOverview } from '../data/mock-cases';
import { EMPIRE_DATASET } from '../data/empire-dataset';
import { applyDecisionToCaseWorkflow } from './applyDecisionToCaseWorkflow';

describe('applyDecisionToCaseWorkflow', () => {
  it('marks decision done while keeping underwriting next for Amélie NB standard terms', () => {
    const caseData = getCaseOverview(EMPIRE_DEMO_CASE_IDS.nbFullUw, EMPIRE_DATASET, false);
    const flow = EMPIRE_DECISION_FLOW_RECORDS[EMPIRE_DEMO_CASE_IDS.nbFullUw];
    const outcome = flow.outcomes.standard;

    applyDecisionToCaseWorkflow(caseData, {
      decisionType: 'approve',
      decisionOptionId: 'standard',
      decisionTitle: flow.options[0].title,
      decisionOutcome: outcome,
      reasonCodes: [flow.options[0].tag],
      notes: '',
      recordedBy: 'Victor Ramon',
      recordedAt: new Date().toISOString(),
    });

    expect(caseData.caseStatus).toBe('Active: Contract issuance');
    expect(caseData.workflowMeta?.status).toBe('Active: Contract issuance');

    const stages = caseData.workflowMeta?.subwayStages ?? [];
    expect(stages.find((stage) => stage.slug === 'application')?.state).toBe('done');
    expect(stages.find((stage) => stage.slug === 'req_gathering')?.state).toBe('active');
    expect(stages.find((stage) => stage.slug === 'underwriting-review')?.state).toBe('next');
    expect(stages.find((stage) => stage.slug === 'decision')?.state).toBe('done');
    expect(stages.find((stage) => stage.slug === 'decision')?.subLabel).toBe('Standard terms issued');
    expect(caseData.activeStage).toBe(4);
  });
});
