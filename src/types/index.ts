export type AgentId = "cmo" | "contrarian" | "cto" | "ceo" | "swe1" | "swe2";
export type StageId = "ideation" | "market_research" | "prototyping";
export type Position = "bullish" | "cautious" | "adversarial" | "neutral";
export type Severity = "HIGH" | "MEDIUM" | "LOW";
export type StageStatus = "pending" | "active" | "complete";
export type AppView = "session" | "verdict";

export interface AgentDefinition {
  id: AgentId;
  name: string;
  role: string;
  karpathyLens: string;
  stage: StageId;
  systemPrompt: string;
}

export interface AgentResult {
  agentId: AgentId;
  position: Position;
  karpathyLens: string;
  claim: string;
  evidence: string;
  objection: string;
  recommendation: string;
  confidence: number;
  confidenceDelta: number;
  risks: { severity: Severity; description: string }[];
  keyFindings: string[];
}

export interface NiaResult {
  competitors: { name: string; positioning: string }[];
  failedStartups: { name: string; reason: string }[];
  marketSignals: string[];
  tamEstimate: string;
}

export interface CodeReview {
  overallScore: number;
  verdict: string;
  strengths: string[];
  concerns: { severity: Severity; issue: string; suggestion: string }[];
  recommendation: "proceed" | "revise" | "rebuild";
}

export interface Specialist {
  id: string;
  name: string;
  domain: string;
  finding: string;
  ventureImpact: string;
}

export interface GovernanceCheckpoint {
  id: string;
  stageId: string;
  timestamp: Date;
  hash: string;
  confidence: number;
  verdict: string;
}

export interface Conflict {
  id: string;
  agentA: AgentId;
  agentB: AgentId;
  severity: Severity;
  summary: string;
  resolution: string;
  confidenceImpact: number;
}

export type FeedEventType =
  | "STAGE_START"
  | "AGENT_STREAMING"
  | "AGENT_COMPLETE"
  | "MARKET_RESEARCH"
  | "CONFLICT"
  | "SPECIALIST_SUMMONED"
  | "CONFIDENCE_SHIFT"
  | "STAGE_SEALED"
  | "CHECKPOINT"
  | "CODE_GENERATING"
  | "CODE_REVIEW"
  | "VERDICT";

export interface FeedEvent {
  id: string;
  timestamp: Date;
  type: FeedEventType;
  actor: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface StageState {
  id: StageId;
  name: string;
  status: StageStatus;
  agentResults: AgentResult[];
  conflicts: Conflict[];
  niaResult?: NiaResult;
  stageVerdict: string;
  confidenceAtSeal: number;
  checkpoint?: GovernanceCheckpoint;
}

export interface VentureContext {
  originalIdea: string;
  currentThesis: string;
  sessionId: string;
  stage: StageId;
  priorFindings: string[];
  confidenceHistory: { agent: string; value: number; delta: number }[];
  activeRisks: { severity: Severity; description: string }[];
  niaData?: NiaResult;
  specialists?: Specialist[];
}

export interface FinalVerdict {
  decision: "PROCEED" | "PIVOT" | "REJECT";
  confidence: number;
  institutionalSummary: string;
  ventureThesis: string;
  whyItCouldWin: string[];
  whyItCouldFail: string[];
  mvpWedge: string;
  gtmMotion: string;
  risks: { severity: Severity; description: string }[];
  actionPlan30Days: string[];
  agentSummaries: { agent: string; position: Position; claim: string }[];
  mvpCode: string;
  codeReview: CodeReview | null;
  governanceTrail: GovernanceCheckpoint[];
  specialists: Specialist[];
  sessionId: string;
  exportedAt: Date;
}
