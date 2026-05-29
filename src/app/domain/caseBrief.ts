import type { DailyBriefContent } from './dailyBrief';

export type CaseBriefRequirementRef = {
  id: number | string;
  datasetRequirementId?: string;
  name: string;
  status: string;
  linkedTasks?: string[];
  blockingImpact?: { stage: string; impact: string } | null;
};

export type CaseBriefTaskRef = {
  id: string;
  label: string;
  status: string;
  aiGenerated?: boolean;
};

export type BuildCaseBriefInput = {
  caseId: string;
  /** Short client / case headline, e.g. "Marie Dupont · Death benefit". */
  clientHeadline: string;
  /** Narrative context (typically first sentence of case AI summary). */
  clientSummary?: string;
  aiSummary?: { text: string; confidence?: number };
  requirements: CaseBriefRequirementRef[];
  tasks: CaseBriefTaskRef[];
};

export type CaseBriefContent = DailyBriefContent & {
  confidence?: number;
};
