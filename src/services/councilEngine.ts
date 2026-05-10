import { STAGE_META, type CouncilStageId } from "@/data/councilConfig";
import type {
  CouncilAgent,
  CouncilStage,
  FinalDecision,
  FinalVerdict,
  GovernanceRecord,
  JudgeOutput,
  SponsorSummary,
  StageVerdict,
  CouncilRunResult,
} from "@/types/council";
import { realAllScaleOrchestration } from "./allscaleService";
import { mockGovernanceRecord, realBgaRecord } from "./bgaService";
import { realClodExecution } from "./clodService";
import { mockGeminiAgentResponse } from "./geminiService";
import { realGreptileReview } from "./greptileService";
import { realNiaResearch } from "./niaService";

const STAGE_DELAY_MS = 900;
const AGENT_STAGGER_MS = 180;

function hashIdea(idea: string): number {
  let h = 0;
  for (let i = 0; i < idea.length; i++) h = (h * 31 + idea.charCodeAt(i)) >>> 0;
  return h;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function scoreFromKeywords(idea: string, base: number): number {
  const h = hashIdea(idea);
  let s = base + (h % 12) - 6;
  const boosts = [
    /ai|agent|automation/i,
    /enterprise|b2b/i,
    /risk|compliance|security/i,
    /market|customer|revenue/i,
  ];
  boosts.forEach((re, i) => {
    if (re.test(idea)) s += 2 + (i % 3);
  });
  if (/crypto|nft|meme/i.test(idea)) s -= 12;
  return clamp(Math.round(s), 35, 94);
}

function riskFromScore(score: number): "low" | "medium" | "high" {
  if (score >= 72) return "low";
  if (score >= 55) return "medium";
  return "high";
}

function passFromScore(score: number): JudgeOutput["passStatus"] {
  if (score >= 70) return "proceed";
  if (score >= 52) return "caution";
  return "fail";
}

function aiMock(idea: string, role: string, hint: string): string {
  return mockGeminiAgentResponse({
    systemHint: hint,
    userIdea: idea,
    agentRole: role,
  }).text;
}

async function delay(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export function createInitialStages(): CouncilStage[] {
  return (Object.keys(STAGE_META) as CouncilStageId[]).map((id) =>
    emptyStage(id, "pending")
  );
}

function emptyStage(
  id: CouncilStageId,
  status: CouncilStage["status"]
): CouncilStage {
  const meta = STAGE_META[id];
  return {
    id,
    name: meta.name,
    description: meta.description,
    status,
    score: 0,
    riskLevel: "medium",
    agents: [],
    judge: {
      judgeName: "Pending",
      summary: "",
      score: 0,
      confidence: 0,
      passStatus: "caution",
      biggestConcern: "",
      nextStep: "",
    },
    stageVerdict: { headline: "", rationale: "" },
    sponsorConnection: meta.sponsorConnection,
  };
}

function buildJudge(
  name: string,
  idea: string,
  stageScore: number,
  concern: string,
  next: string
): JudgeOutput {
  return {
    judgeName: name,
    summary: `Stage assessment synthesized for "${idea.slice(0, 60)}${idea.length > 60 ? "…" : ""}" — alignment score ${stageScore}.`,
    score: stageScore,
    confidence: clamp(stageScore + (hashIdea(idea) % 9) - 4, 40, 95),
    passStatus: passFromScore(stageScore),
    biggestConcern: concern,
    nextStep: next,
  };
}

export async function runCouncil(
  idea: string,
  onStageUpdate: (stage: CouncilStage) => void
): Promise<CouncilRunResult> {
  const trimmed = idea.trim();
  const stageOrder = Object.keys(STAGE_META) as CouncilStageId[];

  const nia = await realNiaResearch(trimmed);
  const greptile = await realGreptileReview(trimmed);
  const clod = await realClodExecution(trimmed);
  const scale = await realAllScaleOrchestration(trimmed);

  const stageScores: Partial<Record<CouncilStageId, number>> = {};

  const founderScore = scoreFromKeywords(trimmed, 68);
  stageScores.founder = founderScore;

  const marketScore = clamp(
    Math.round((nia.marketAttractiveness + scoreFromKeywords(trimmed, 66)) / 2),
    40,
    94
  );
  stageScores.market = marketScore;

  const techBase =
    greptile.overallTechnicalRisk === "high" ? 58 : greptile.overallTechnicalRisk === "medium" ? 66 : 74;
  const techScore = clamp(
    Math.round((techBase + scoreFromKeywords(trimmed, 64) + (clod.implementationRisk === "high" ? -6 : 4)) / 2),
    38,
    92
  );
  stageScores.technical = techScore;

  stageScores.investor = scoreFromKeywords(trimmed, 65);
  stageScores.adversarial = scoreFromKeywords(trimmed, 62);
  stageScores.governance = clamp(
    Math.round((scoreFromKeywords(trimmed, 67) + scale.recommendedAgents / 5) / 2),
    45,
    91
  );
  stageScores.ceo = scoreFromKeywords(trimmed, 70);

  const numericStages = stageOrder.filter((id) => id !== "final") as Exclude<
    CouncilStageId,
    "final"
  >[];
  const overallScore = clamp(
    Math.round(
      numericStages.reduce((acc, id) => acc + (stageScores[id] ?? 60), 0) /
        numericStages.length
    ),
    35,
    96
  );

  let decision: FinalDecision = "Pivot";
  if (overallScore >= 75) decision = "Proceed";
  else if (overallScore < 50) decision = "Reject";

  const governanceRecord: GovernanceRecord = import.meta.env.VITE_BGA_API_KEY
    ? await realBgaRecord(trimmed, numericStages)
    : mockGovernanceRecord(trimmed, numericStages);

  const sponsorSummary: SponsorSummary = {
    greptile: `Greptile due diligence: ${greptile.architecture.slice(0, 120)}…`,
    nia: `Nia research identified ${nia.competitors.length} competitor lenses and ${nia.negativeSignals.length} negative signals.`,
    clod: `CLoD MVP plan estimates ${clod.estimatedBuildWeeks} weeks; phases: ${clod.implementationPhases[0]}`,
    allscale: `AllScale recommends ${scale.recommendedAgents} agents, mode=${scale.orchestrationMode}, ${scale.parallelTasks} parallel tasks.`,
    bga: `BGA governance hash ${governanceRecord.decisionHash} — public-good score ${governanceRecord.publicGoodScore}/100.`,
  };

  const disagreements = [
    "CTO emphasizes phased integration risk; Bear Investor highlights burn if sales cycles slip.",
    "CMO sees TAM expansion; Contrarian flags crowded category and switching costs.",
    "Visionary CEO pushes platform vision; Operator CEO insists on a narrow wedge MVP first.",
  ];

  const finalVerdictBase: Omit<FinalVerdict, "decision"> & {
    decision: FinalDecision;
  } = {
    decision,
    confidenceScore: clamp(Math.round(overallScore - 4 + (hashIdea(trimmed) % 8)), 38, 96),
    overallScore,
    biggestRisk:
      techScore < 62
        ? "Integration complexity and brittle vendor adapters under production load."
        : "GTM concentration: long enterprise cycles without a committed champion.",
    bestNextStep:
      decision === "Reject"
        ? "Stop: validate problem with paid pilots in one vertical before more build."
        : "Run a 6-week pilot with one GC + two subs; measure time-to-digest and RFI reduction.",
    mvpRecommendation: `${clod.mvpScope} First ship: ${clod.fileStructure[0]}.`,
    actionItems: [
      "Instrument a pilot success scorecard (time saved, incidents prevented).",
      "Freeze scope to one workflow (executive reporting OR vendor coordination).",
      "Pre-sign integration contracts for the top two systems of record.",
    ],
    disagreements,
    sponsorSummary,
    governanceRecord,
  };

  const stages: CouncilStage[] = [];

  for (const id of stageOrder) {
    const stage = emptyStage(id, "running");
    onStageUpdate({ ...stage });

    if (id === "founder") {
      const agents: CouncilAgent[] = [
        agent(
          "a1",
          "Founder Agent",
          "Vision and ambition",
          trimmed,
          founderScore,
          "Ambition exceeds current proof; narrow the hero workflow.",
          "Write a one-page wedge narrative and success metric.",
          undefined
        ),
        agent(
          "a2",
          "First Principles Thinker",
          "Problem validity",
          trimmed,
          founderScore - 3,
          "Problem is real but urgency varies by subcontractor maturity.",
          "Interview 8 site supers about weekly reporting pain.",
          undefined
        ),
        agent(
          "a3",
          "Outsider",
          "Assumption audit",
          trimmed,
          founderScore - 5,
          "Hidden assumption: standardized data from vendors exists.",
          "Map data sources and fall back to OCR/checklists.",
          undefined
        ),
      ];
      await animateAgents(agents, onStageUpdate, stage, founderScore);
      const judge = buildJudge(
        "Founder Judge",
        trimmed,
        founderScore,
        "Story is compelling but proof is thin.",
        "Ship a concierge MVP to validate weekly exec usage."
      );
      const sv: StageVerdict = {
        headline: founderScore >= 65 ? "Founder-market story passes first bar." : "Promising but needs proof.",
        rationale: aiMock(trimmed, "Founder Judge", "synthesize founder stage"),
      };
      completeStage(stage, agents, judge, sv, founderScore, onStageUpdate);
    } else if (id === "market") {
      const agents: CouncilAgent[] = [
        agent("m1", "CMO Agent", "TAM and viability", trimmed, marketScore, "Enterprise sales motion is heavy.", "Target mid-market ENR first.", undefined),
        agent("m2", "Customer Agent", "Demand signals", trimmed, marketScore - 2, "Buyers want ROI in 90 days.", "Pilot pricing tied to digest open-rates.", undefined),
        agent(
          "m3",
          "Nia Research Agent",
          "Competitor + market research",
          trimmed,
          marketScore + 2,
          nia.negativeSignals[0] ?? "Signal noise in procurement",
          "Differentiate on cross-vendor coordination, not generic chat.",
          "Nia"
        ),
        agent("m4", "Contrarian Market Analyst", "Negative signals", trimmed, marketScore - 8, nia.negativeSignals[1] ?? "Category fatigue", "Prove switching ROI with benchmarks.", undefined),
      ];
      agents[2].insight = `${nia.summary} Competitors: ${nia.competitors.map((c) => c.name).join(", ")}.`;
      await animateAgents(agents, onStageUpdate, stage, marketScore);
      const judge = buildJudge(
        "Market Judge",
        trimmed,
        marketScore,
        "Market is attractive but noisy; positioning must be sharp.",
        "Publish a competitor teardown using Nia signals and pick wedge."
      );
      const sv: StageVerdict = {
        headline: "Market intelligence supports a focused wedge.",
        rationale: `Trends: ${nia.trends.map((t) => t.label).join(", ")}.`,
      };
      completeStage(stage, agents, judge, sv, marketScore, onStageUpdate);
    } else if (id === "technical") {
      const agents: CouncilAgent[] = [
        agent("t1", "CTO Agent", "Architecture and feasibility", trimmed, techScore, "Integration surface dominates roadmap.", "Prioritize adapter framework + observability.", undefined),
        agent("t2", "Lead Software Engineer", "MVP plan", trimmed, techScore - 1, "Background jobs for heavy reports.", "Queue-backed workers from day one.", undefined),
        agent(
          "t3",
          "Greptile Reviewer",
          "Code quality & scalability",
          trimmed,
          techScore,
          greptile.scalabilityRisks[0],
          "Add contract tests for vendor payloads.",
          "Greptile"
        ),
        agent(
          "t4",
          "CLoD Execution Agent",
          "MVP build plan",
          trimmed,
          techScore + 1,
          clod.implementationRisk === "high" ? "Schedule risk on integrations." : "Scope is tractable.",
          `Phased delivery over ~${clod.estimatedBuildWeeks} weeks.`,
          "CLoD"
        ),
        agent("t5", "Efficiency Agent", "Removes overengineering", trimmed, techScore - 2, "Avoid multi-cloud early.", "Single region until PMF.", undefined),
      ];
      agents[2].insight = `${greptile.codeQuality} ${greptile.maintainability}`;
      agents[3].insight = `${clod.mvpScope} Structure: ${clod.fileStructure.join(", ")}.`;
      await animateAgents(agents, onStageUpdate, stage, techScore);
      const judge = buildJudge(
        "Technical Judge",
        trimmed,
        techScore,
        greptile.overallTechnicalRisk === "high" ? "Integration and scalability risk elevated." : "Engineering path is workable.",
        "Prototype the riskiest adapter with synthetic loads."
      );
      const sv: StageVerdict = {
        headline: greptile.overallTechnicalRisk === "high" ? "Technical caution — control integration risk." : "Technical feasibility is sound.",
        rationale: `${greptile.architecture}`,
      };
      completeStage(stage, agents, judge, sv, techScore, onStageUpdate);
    } else if (id === "investor") {
      const inv = stageScores.investor!;
      const agents: CouncilAgent[] = [
        agent("i1", "Bull Investor", "Upside case", trimmed, inv + 4, "Expansion into adjacent workflows.", "Map upsell narrative.", undefined),
        agent("i2", "Bear Investor", "Funding objections", trimmed, inv - 6, "CAC payback could stretch.", "Smaller pilot land-and-expand.", undefined),
        agent("i3", "Expansionist", "Adjacent markets", trimmed, inv, "Owner/operator vs GC personas differ.", "Pick one beachhead persona.", undefined),
        agent("i4", "Moat Analyst", "Defensibility", trimmed, inv - 2, "Workflow data moat is gradual.", "Own the notification graph.", undefined),
      ];
      await animateAgents(agents, onStageUpdate, stage, inv);
      const judge = buildJudge(
        "Investor Judge",
        trimmed,
        inv,
        "Bear case on spend timing vs. platform ambition.",
        "Stage-gate funding to pilot milestones."
      );
      const sv: StageVerdict = {
        headline: inv >= 68 ? "Investor case holds with disciplined GTM." : "Funding story needs sharper milestones.",
        rationale: aiMock(trimmed, "Investor Judge", "risk/reward"),
      };
      completeStage(stage, agents, judge, sv, inv, onStageUpdate);
    } else if (id === "adversarial") {
      const adv = stageScores.adversarial!;
      const agents: CouncilAgent[] = [
        agent("v1", "Contrarian", "Assumption attacks", trimmed, adv, "Underestimated change management.", "Pilot playbooks + CS.", undefined),
        agent("v2", "Failure Historian", "Analogous failures", trimmed, adv - 3, "Horizontal tools died on ROI proof.", "Laser ROI metrics.", undefined),
        agent("v3", "Security/Risk Agent", "Compliance and abuse", trimmed, adv - 2, "PII on sites and subcontractor access.", "RBAC + audit logs early.", undefined),
        agent("v4", "Skeptical Customer", "Adoption friction", trimmed, adv - 5, "Field staff won't adopt heavy UIs.", "SMS + WhatsApp surfaces.", undefined),
      ];
      await animateAgents(agents, onStageUpdate, stage, adv);
      const judge = buildJudge(
        "Adversarial Judge",
        trimmed,
        adv,
        "Adoption and compliance friction in the field.",
        "Red-team the onboarding path for subs."
      );
      const sv: StageVerdict = {
        headline: "Adversarial review surfaces execution hazards.",
        rationale: "Treat adoption and trust as first-class risks, not afterthoughts.",
      };
      completeStage(stage, agents, judge, sv, adv, onStageUpdate);
    } else if (id === "governance") {
      const gov = stageScores.governance!;
      const agents: CouncilAgent[] = [
        agent(
          "g1",
          "AllScale Orchestrator",
          "Parallel agent scaling",
          trimmed,
          gov,
          "Complexity warrants hierarchical orchestration.",
          scale.scalingStrategy,
          "AllScale"
        ),
        agent(
          "g2",
          "BGA Governance Agent",
          "Transparent governance ledger",
          trimmed,
          gov,
          "Verdict trail must be tamper-evident for audits.",
          governanceRecord.governanceRationale.slice(0, 140) + "…",
          "BGA"
        ),
        agent("g3", "Ethics / Public Good Agent", "Societal effects", trimmed, gov - 2, "Site safety positives; watch workforce displacement narrative.", "Publish responsible AI practices.", undefined),
      ];
      agents[0].insight = `Recommended ${scale.recommendedAgents} agents; ${scale.parallelTasks} parallel tasks; mode ${scale.orchestrationMode}.`;
      agents[1].insight = `Audit hash ${governanceRecord.decisionHash}; public-good score ${governanceRecord.publicGoodScore}.`;
      await animateAgents(agents, onStageUpdate, stage, gov);
      const judge = buildJudge(
        "Governance Judge",
        trimmed,
        gov,
        "Governance posture is strong; ensure external stakeholders can verify attestations.",
        "Expose exportable audit packages for sponsors and regulators."
      );
      const sv: StageVerdict = {
        headline: "Scale plan and governance ledger align with venture risk profile.",
        rationale: governanceRecord.governanceRationale,
      };
      completeStage(stage, agents, judge, sv, gov, onStageUpdate);
    } else if (id === "ceo") {
      const ceo = stageScores.ceo!;
      const agents: CouncilAgent[] = [
        agent("c1", "Visionary CEO", "Long-term potential", trimmed, ceo + 3, "Category-defining if data flywheel spins.", "Invest in workflow capture.", undefined),
        agent("c2", "Operator CEO", "Execution realism", trimmed, ceo - 4, "Needs ruthless sequencing.", "Cut features; ship weekly.", undefined),
        agent("c3", "Financial CEO", "Sustainability", trimmed, ceo - 1, "Margins hinge on services vs. software mix.", "Target 70%+ gross margin path.", undefined),
        agent("c4", "Product CEO", "PMF signals", trimmed, ceo, "Engagement must be in workflow, not dashboards.", "Embed in daily standups.",
          undefined
        ),
      ];
      await animateAgents(agents, onStageUpdate, stage, ceo);
      const judge = buildJudge(
        "CEO Judge",
        trimmed,
        ceo,
        "Tension between platform vision and operator discipline.",
        "Commit to a PMF scoreboard reviewed weekly."
      );
      const sv: StageVerdict = {
        headline: "Executive synthesis: proceed with disciplined scope if milestones hit.",
        rationale: aiMock(trimmed, "CEO Judge", "executive synthesis"),
      };
      completeStage(stage, agents, judge, sv, ceo, onStageUpdate);
    } else if (id === "final") {
      const agents: CouncilAgent[] = [
        agent(
          "f1",
          "Final Judge",
          "Venture synthesis",
          trimmed,
          overallScore,
          finalVerdictBase.biggestRisk,
          finalVerdictBase.bestNextStep,
          undefined
        ),
      ];
      agents[0].insight = `Binding recommendation: ${decision}. Overall ${overallScore}/100. ${finalVerdictBase.mvpRecommendation}`;
      await animateAgents(agents, onStageUpdate, stage, overallScore);
      const judge: JudgeOutput = {
        judgeName: "Final Judge",
        summary: `Final venture decision: ${decision}. Council confidence ${finalVerdictBase.confidenceScore}%; overall score ${overallScore}.`,
        score: overallScore,
        confidence: finalVerdictBase.confidenceScore,
        passStatus: decision === "Proceed" ? "proceed" : decision === "Pivot" ? "caution" : "fail",
        biggestConcern: finalVerdictBase.biggestRisk,
        nextStep: finalVerdictBase.bestNextStep,
      };
      const sv: StageVerdict = {
        headline: `${decision} — synthesized across all councils.`,
        rationale: "See final report for action items, sponsor layers, and governance record.",
      };
      completeStage(stage, agents, judge, sv, overallScore, onStageUpdate);
    }

    stages.push(stage);
    await delay(STAGE_DELAY_MS);
  }

  const finalVerdict: FinalVerdict = {
    ...finalVerdictBase,
    decision,
  };

  return { idea: trimmed, stages, finalVerdict };
}

function agent(
  id: string,
  name: string,
  role: string,
  idea: string,
  scoreSeed: number,
  risk: string,
  rec: string,
  sponsorTool?: string
): CouncilAgent {
  const confidence = clamp(scoreSeed + (hashIdea(id + idea) % 11) - 5, 38, 96);
  return {
    id,
    name,
    role,
    sponsorTool,
    insight: aiMock(idea, role, "agent insight"),
    confidence,
    risk,
    recommendation: rec,
    status: "idle",
  };
}

async function animateAgents(
  agents: CouncilAgent[],
  onStageUpdate: (s: CouncilStage) => void,
  stage: CouncilStage,
  stageScore: number
) {
  const filled: CouncilAgent[] = [];
  for (const a of agents) {
    filled.push({ ...a, status: "thinking" });
    onStageUpdate({
      ...stage,
      status: "running",
      score: stageScore,
      riskLevel: riskFromScore(stageScore),
      agents: [...filled],
    });
    await delay(AGENT_STAGGER_MS);
    filled[filled.length - 1] = { ...a, status: "complete" };
    onStageUpdate({
      ...stage,
      status: "running",
      score: stageScore,
      riskLevel: riskFromScore(stageScore),
      agents: [...filled],
    });
  }
}

function completeStage(
  stage: CouncilStage,
  agents: CouncilAgent[],
  judge: JudgeOutput,
  stageVerdict: StageVerdict,
  score: number,
  onStageUpdate: (s: CouncilStage) => void
) {
  stage.agents = agents.map((a) => ({ ...a, status: "complete" as const }));
  stage.judge = judge;
  stage.stageVerdict = stageVerdict;
  stage.score = score;
  stage.riskLevel = riskFromScore(score);
  stage.status = "complete";
  onStageUpdate({ ...stage });
}
