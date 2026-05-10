export type AgentStatus = "idle" | "thinking" | "complete";

export type PassStatus = "proceed" | "caution" | "fail";

export type StageStatus = "pending" | "running" | "complete";

export type FinalDecision = "Proceed" | "Pivot" | "Reject";

export interface CouncilAgent {
  id: string;
  name: string;
  role: string;
  sponsorTool?: string;
  insight: string;
  confidence: number;
  risk: string;
  recommendation: string;
  status: AgentStatus;
}

export interface JudgeOutput {
  judgeName: string;
  summary: string;
  score: number;
  confidence: number;
  passStatus: PassStatus;
  biggestConcern: string;
  nextStep: string;
}

export interface StageVerdict {
  headline: string;
  rationale: string;
}

export interface CouncilStage {
  id: string;
  name: string;
  description: string;
  status: StageStatus;
  score: number;
  riskLevel: "low" | "medium" | "high";
  agents: CouncilAgent[];
  judge: JudgeOutput;
  stageVerdict: StageVerdict;
  sponsorConnection?: string;
}

export interface GovernanceRecord {
  decisionHash: string;
  auditTrail: string[];
  publicGoodScore: number;
  governanceRationale: string;
}

export interface SponsorSummary {
  greptile: string;
  nia: string;
  clod: string;
  allscale: string;
  bga: string;
}

export interface FinalVerdict {
  decision: FinalDecision;
  confidenceScore: number;
  overallScore: number;
  biggestRisk: string;
  bestNextStep: string;
  mvpRecommendation: string;
  actionItems: string[];
  disagreements: string[];
  sponsorSummary: SponsorSummary;
  governanceRecord: GovernanceRecord;
}

export interface CouncilRunResult {
  idea: string;
  stages: CouncilStage[];
  finalVerdict: FinalVerdict;
}
