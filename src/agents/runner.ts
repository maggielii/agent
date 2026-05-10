import type {
  AgentDefinition,
  AgentId,
  AgentResult,
  CodeReview,
  Conflict,
  FinalVerdict,
  Position,
  Severity,
  Specialist,
  StageId,
  StageState,
  VentureContext,
} from "../types";
import { parseJSON, streamAgent } from "../services/claude";
import { agentName } from "./definitions";

interface PrototypeBuild {
  reasoning: string;
  htmlCode: string;
  techChoices: string[];
  limitations: string[];
}

const severityRank: Record<Severity, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

function clampConfidence(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function isPosition(value: unknown): value is Position {
  return value === "bullish" || value === "cautious" || value === "adversarial" || value === "neutral";
}

function isSeverity(value: unknown): value is Severity {
  return value === "HIGH" || value === "MEDIUM" || value === "LOW";
}

function fallbackAgentResult(agent: AgentDefinition, context: VentureContext): AgentResult {
  const confidence = context.currentThesis.length > 80 ? 62 : 55;
  return {
    agentId: agent.id,
    position: agent.id === "contrarian" ? "adversarial" : "cautious",
    karpathyLens: agent.karpathyLens,
    claim: `${agent.name} recommends validating the narrowest version of the venture before scaling.`,
    evidence: "Fallback council result used because live model output was unavailable or malformed.",
    objection: "The absence of live reasoning makes the signal less decisive.",
    recommendation: "Run one buyer workflow test and capture measurable cycle-time or cost reduction.",
    confidence,
    confidenceDelta: confidence - context.confidenceHistory.at(-1)!.value,
    risks: [{ severity: "MEDIUM", description: "Decision confidence is limited by fallback analysis." }],
    keyFindings: ["Session continuity preserved.", "Evidence should be replaced with live buyer data."],
  };
}

function normalizeAgentResult(raw: Partial<AgentResult>, agent: AgentDefinition, context: VentureContext): AgentResult {
  const fallback = fallbackAgentResult(agent, context);
  const risks = Array.isArray(raw.risks)
    ? raw.risks
        .filter((risk) => risk && isSeverity(risk.severity) && typeof risk.description === "string")
        .map((risk) => ({ severity: risk.severity, description: risk.description }))
    : fallback.risks;

  return {
    agentId: agent.id,
    position: isPosition(raw.position) ? raw.position : fallback.position,
    karpathyLens: typeof raw.karpathyLens === "string" ? raw.karpathyLens : agent.karpathyLens,
    claim: typeof raw.claim === "string" ? raw.claim : fallback.claim,
    evidence: typeof raw.evidence === "string" ? raw.evidence : fallback.evidence,
    objection: typeof raw.objection === "string" ? raw.objection : fallback.objection,
    recommendation: typeof raw.recommendation === "string" ? raw.recommendation : fallback.recommendation,
    confidence: clampConfidence(typeof raw.confidence === "number" ? raw.confidence : fallback.confidence),
    confidenceDelta: Math.round(
      typeof raw.confidenceDelta === "number" ? raw.confidenceDelta : fallback.confidenceDelta
    ),
    risks,
    keyFindings: Array.isArray(raw.keyFindings)
      ? raw.keyFindings.filter((finding): finding is string => typeof finding === "string")
      : fallback.keyFindings,
  };
}

function contextPrompt(context: VentureContext, extra?: string) {
  return `Startup idea:
${context.originalIdea}

Current thesis:
${context.currentThesis}

Prior findings:
${context.priorFindings.join("\n") || "None yet."}

Confidence history:
${context.confidenceHistory.map((entry) => `${entry.agent}: ${entry.value}% (${entry.delta})`).join("\n")}

Active risks:
${context.activeRisks.map((risk) => `${risk.severity}: ${risk.description}`).join("\n") || "None yet."}

Specialists:
${context.specialists?.map((specialist) => `${specialist.name}: ${specialist.finding}`).join("\n") || "None summoned."}

${context.niaData ? `Market research:\n${JSON.stringify(context.niaData, null, 2)}` : ""}
${extra ?? ""}`;
}

export async function runAgent(agent: AgentDefinition, context: VentureContext): Promise<AgentResult> {
  try {
    const raw = await streamAgent(agent.id, agent.systemPrompt, contextPrompt(context));
    const parsed = parseJSON<Partial<AgentResult>>(raw);
    return normalizeAgentResult(parsed ?? {}, agent, context);
  } catch {
    return fallbackAgentResult(agent, context);
  }
}

export async function runSpecialist(specialist: Specialist, context: VentureContext): Promise<Specialist> {
  try {
    const raw = await streamAgent(
      specialist.id,
      `You are ${specialist.name}, a domain specialist in ${specialist.domain}. Assess this venture through your domain. Return valid JSON only:
{
  "finding": "one sentence",
  "ventureImpact": "one sentence"
}
No markdown fences. No preamble.`,
      contextPrompt(context)
    );
    const parsed = parseJSON<Partial<Specialist>>(raw);
    return {
      ...specialist,
      finding: typeof parsed?.finding === "string" ? parsed.finding : specialist.finding,
      ventureImpact: typeof parsed?.ventureImpact === "string" ? parsed.ventureImpact : specialist.ventureImpact,
    };
  } catch {
    return specialist;
  }
}

export async function generatePrototype(context: VentureContext, swe1: AgentDefinition): Promise<string> {
  try {
    const raw = await streamAgent(
      swe1.id,
      swe1.systemPrompt,
      contextPrompt(
        context,
        "Build a polished, functional single-file HTML prototype. Include realistic interactions and domain-specific copy."
      )
    );
    const parsed = parseJSON<PrototypeBuild>(raw);
    return parsed?.htmlCode && parsed.htmlCode.includes("<!DOCTYPE html>") ? parsed.htmlCode : raw;
  } catch {
    return "<!DOCTYPE html><html><body><main><h1>Prototype unavailable</h1><p>The session degraded gracefully.</p></main></body></html>";
  }
}

export async function reviewPrototype(context: VentureContext, swe2: AgentDefinition, code: string): Promise<CodeReview> {
  try {
    const raw = await streamAgent(
      swe2.id,
      swe2.systemPrompt,
      `${contextPrompt(context)}

Generated code:
${code.slice(0, 18000)}`
    );
    const parsed = parseJSON<Partial<CodeReview>>(raw);
    return normalizeCodeReview(parsed ?? {});
  } catch {
    return normalizeCodeReview({});
  }
}

function normalizeCodeReview(raw: Partial<CodeReview>): CodeReview {
  const concerns = Array.isArray(raw.concerns)
    ? raw.concerns
        .filter((concern) => concern && isSeverity(concern.severity) && typeof concern.issue === "string")
        .map((concern) => ({
          severity: concern.severity,
          issue: concern.issue,
          suggestion: typeof concern.suggestion === "string" ? concern.suggestion : "Add a hardening pass.",
        }))
    : [];

  return {
    overallScore: clampConfidence(typeof raw.overallScore === "number" ? raw.overallScore : 72),
    verdict:
      typeof raw.verdict === "string"
        ? raw.verdict
        : "The prototype is credible for internal validation but needs hardening before a pilot.",
    strengths: Array.isArray(raw.strengths)
      ? raw.strengths.filter((strength): strength is string => typeof strength === "string")
      : ["Clear workflow", "Single-file runnable prototype", "Domain-specific user path"],
    concerns:
      concerns.length > 0
        ? concerns
        : [
            {
              severity: "MEDIUM",
              issue: "Prototype relies on local demo state.",
              suggestion: "Add persistence and real integration boundaries before a pilot.",
            },
          ],
    recommendation:
      raw.recommendation === "proceed" || raw.recommendation === "revise" || raw.recommendation === "rebuild"
        ? raw.recommendation
        : "revise",
  };
}

export function detectConflicts(results: AgentResult[]): Conflict[] {
  const conflicts: Conflict[] = [];
  for (let i = 0; i < results.length; i += 1) {
    for (let j = i + 1; j < results.length; j += 1) {
      const a = results[i];
      const b = results[j];
      const spread = Math.abs(a.confidence - b.confidence);
      const opposing =
        (a.position === "bullish" && (b.position === "adversarial" || b.position === "cautious")) ||
        (b.position === "bullish" && (a.position === "adversarial" || a.position === "cautious")) ||
        a.position === "adversarial" ||
        b.position === "adversarial";
      if (opposing || spread >= 18) {
        conflicts.push({
          id: crypto.randomUUID(),
          agentA: a.agentId,
          agentB: b.agentId,
          severity: spread >= 25 || a.position === "adversarial" || b.position === "adversarial" ? "HIGH" : "MEDIUM",
          summary: `${agentName(a.agentId)} and ${agentName(b.agentId)} disagree on confidence or risk posture.`,
          resolution: "Carry the disagreement into the next stage as an explicit validation question.",
          confidenceImpact: -Math.min(12, Math.max(4, Math.round(spread / 4))),
        });
      }
    }
  }
  return conflicts.slice(0, 3);
}

export function aggregateRisks(stages: StageState[]) {
  const byDescription = new Map<string, { severity: Severity; description: string }>();
  stages
    .flatMap((stage) => stage.agentResults)
    .flatMap((result) => result.risks)
    .forEach((risk) => {
      const key = risk.description.toLowerCase();
      const current = byDescription.get(key);
      if (!current || severityRank[risk.severity] > severityRank[current.severity]) {
        byDescription.set(key, risk);
      }
    });
  return Array.from(byDescription.values()).sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);
}

export function summarizeStage(stageId: StageId, results: AgentResult[], confidence: number) {
  const strongest = results[0]?.claim ?? "Stage completed with fallback signal.";
  if (stageId === "prototyping") {
    return confidence >= 70
      ? "Prototype is strong enough for guided buyer validation."
      : "Prototype exposes useful wedge signal but needs revision before pilot exposure.";
  }
  if (confidence >= 70) return `Positive signal: ${strongest}`;
  if (confidence >= 50) return `Conditional signal: ${strongest}`;
  return `At-risk signal: ${strongest}`;
}

export function buildFinalVerdict(params: {
  stages: StageState[];
  confidence: number;
  currentThesis: string;
  startIdea: string;
  generatedCode: string;
  codeReview: CodeReview | null;
  governanceTrail: FinalVerdict["governanceTrail"];
  specialists: Specialist[];
  sessionId: string;
}): FinalVerdict {
  const allResults = params.stages.flatMap((stage) => stage.agentResults);
  const risks = aggregateRisks(params.stages);
  const decision = params.confidence >= 70 ? "PROCEED" : params.confidence >= 50 ? "PIVOT" : "REJECT";

  return {
    decision,
    confidence: clampConfidence(params.confidence),
    institutionalSummary:
      decision === "PROCEED"
        ? "The court finds enough evidence to proceed into a constrained pilot with explicit risk controls."
        : decision === "PIVOT"
          ? "The court recommends narrowing the wedge and validating the highest-risk assumptions before committing more build."
          : "The court does not find sufficient evidence to continue without a material thesis reset.",
    ventureThesis: params.currentThesis || params.startIdea,
    whyItCouldWin: allResults
      .flatMap((result) => result.keyFindings)
      .filter(Boolean)
      .slice(0, 5),
    whyItCouldFail: risks.slice(0, 5).map((risk) => risk.description),
    mvpWedge: params.generatedCode
      ? "Use the generated prototype to test one buyer workflow and measure willingness to adopt."
      : "Define a no-code concierge workflow before investing in a complete MVP.",
    gtmMotion: "Start with founder-led discovery in one vertical segment, convert design partners, and price around measurable workflow savings.",
    risks,
    actionPlan30Days: [
      "Interview five target buyers using the stage findings as the discussion guide.",
      "Run the prototype against three realistic scenarios and record completion friction.",
      "Validate procurement, compliance, and integration blockers with one specialist buyer.",
      "Define the first paid pilot success metric and minimum implementation scope.",
    ],
    agentSummaries: allResults.map((result) => ({
      agent: agentName(result.agentId),
      position: result.position,
      claim: result.claim,
    })),
    mvpCode: params.generatedCode,
    codeReview: params.codeReview,
    governanceTrail: params.governanceTrail,
    specialists: params.specialists,
    sessionId: params.sessionId,
    exportedAt: new Date(),
  };
}

export function agentIdForSpecialist(specialist: Specialist): AgentId {
  return specialist.name.includes("Compliance") ? "contrarian" : "cto";
}
