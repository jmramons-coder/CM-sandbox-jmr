import { describe, expect, it } from 'vitest';
import { getCaseOverview } from '../mock-cases';
import { buildCaseBrief } from './buildCaseBrief';

describe('buildCaseBrief', () => {
  it('leads with client context then task-to-requirement focus', () => {
    const overview = getCaseOverview('CD44-6679812');
    expect(overview).toBeTruthy();
    const brief = buildCaseBrief({
      caseId: overview!.id,
      clientHeadline: 'Marie Dupont · Death benefit',
      aiSummary: overview!.generalInformation?.aiSummary,
      requirements: overview!.requirements.map((req) => ({
        id: req.id,
        datasetRequirementId: req.datasetRequirementId,
        name: req.name,
        status: req.status,
        linkedTasks: req.linkedTasks,
        blockingImpact: req.blockingImpact,
      })),
      tasks: [
        {
          id: 'task_cd6120',
          label: 'Review contestability findings & clear for decision',
          status: 'In Queue',
          aiGenerated: false,
        },
      ],
    });

    expect(brief?.title).toBe('Context');
    expect(brief?.segments[0]).toMatchObject({ type: 'text' });
    expect(brief?.segments.some((row) => row.type === 'cue' && row.label === 'Suggested focus')).toBe(true);
    expect(brief?.text).toMatch(/Complete .+ to fulfill .+/);
    const links = brief?.segments.filter((row) => row.type === 'link') ?? [];
    expect(links).toHaveLength(2);
    expect(links[0]).toMatchObject({ kind: 'task' });
    expect(links[1]).toMatchObject({ kind: 'requirement' });
    expect(brief?.segments.some((row) => row.type === 'cue' && row.label.includes('Contestability review'))).toBe(false);
    expect(brief?.confidence).toBe(96);
  });

  it('pairs open task with blocking requirement on CD26', () => {
    const overview = getCaseOverview('CD26-5546112');
    expect(overview).toBeTruthy();
    const openReq = overview!.requirements.find((row) => row.status === 'Pending' || row.status === 'Overdue');
    const brief = buildCaseBrief({
      caseId: overview!.id,
      clientHeadline: 'Billy Bud · Waiver of premium',
      aiSummary: overview!.generalInformation?.aiSummary,
      requirements: overview!.requirements.map((req) => ({
        id: req.id,
        datasetRequirementId: req.datasetRequirementId,
        name: req.name,
        status: req.status,
        linkedTasks: req.linkedTasks,
        blockingImpact: req.blockingImpact,
      })),
      tasks: [
        {
          id: openReq?.linkedTasks?.[0] ?? 'task_cd5203',
          label: 'Chase Functional Capacity Evaluation report',
          status: 'In Queue',
        },
      ],
    });

    expect(brief?.title).toBe('Context');
    expect(brief?.text.length).toBeGreaterThan(40);
  });
});
