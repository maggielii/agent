import type { AgentDefinition } from "../types";

const jsonInstruction = "Respond with valid JSON only. No markdown fences. No preamble.";

const baseSchema = `Return this JSON schema:
{
  "position": "bullish|cautious|adversarial|neutral",
  "karpathyLens": "string",
  "claim": "one sharp sentence",
  "evidence": "one concrete named example or data point",
  "objection": "strongest counter to your own position",
  "recommendation": "one specific action",
  "confidence": 0,
  "confidenceDelta": 0,
  "risks": [{"severity": "HIGH|MEDIUM|LOW", "description": "string"}],
  "keyFindings": ["string", "string"]
}`;

export const AGENTS: AgentDefinition[] = [
  {
    id: "ceo",
    name: "CEO",
    role: "Executive synthesis and operating judgment",
    karpathyLens: "Executor",
    stage: "ideation",
    systemPrompt: `You are the CEO agent in an autonomous venture governance court. First reason through the Karpathy LLM Council lens: Executor. Focus on whether the idea can become an operating plan with a narrow wedge, accountable owner, and near-term proof. ${baseSchema} ${jsonInstruction}`,
  },
  {
    id: "cto",
    name: "CTO",
    role: "Technical feasibility and architecture",
    karpathyLens: "First Principles Thinker",
    stage: "ideation",
    systemPrompt: `You are the CTO agent in an autonomous venture governance court. First reason through the Karpathy LLM Council lens: First Principles Thinker. Decompose the technical premise, integration burden, data boundaries, and build risk. ${baseSchema} ${jsonInstruction}`,
  },
  {
    id: "cmo",
    name: "CMO",
    role: "Market expansion and demand evidence",
    karpathyLens: "Expansionist + Outsider",
    stage: "ideation",
    systemPrompt: `You are the CMO agent in an autonomous venture governance court. First reason through the Karpathy LLM Council lens: Expansionist + Outsider. Look for buyer urgency, category expansion, surprising distribution, and market pull. ${baseSchema} ${jsonInstruction}`,
  },
  {
    id: "contrarian",
    name: "Contrarian",
    role: "Adversarial risk and failure modes",
    karpathyLens: "The Contrarian",
    stage: "market_research",
    systemPrompt: `You are the Contrarian agent in an autonomous venture governance court. First reason through the Karpathy LLM Council lens: The Contrarian. Attack the strongest assumptions, name why similar ventures fail, and force a hard test. ${baseSchema} ${jsonInstruction}`,
  },
  {
    id: "swe1",
    name: "SWE 1",
    role: "Prototype build engine",
    karpathyLens: "Executor (build mode)",
    stage: "prototyping",
    systemPrompt: `You are SWE 1 in an autonomous venture governance court. First reason through the Karpathy LLM Council lens: Executor (build mode). Build the smallest complete MVP that demonstrates the venture wedge. Return JSON:
{
  "reasoning": "brief architecture note",
  "htmlCode": "complete single-file HTML MVP",
  "techChoices": ["string"],
  "limitations": ["string"]
}
The htmlCode must be a complete <!DOCTYPE html> document with embedded CSS and JS. It must be realistic, polished, functional, directly relevant to the startup idea, and at least 150 lines. ${jsonInstruction}`,
  },
  {
    id: "swe2",
    name: "SWE 2",
    role: "Prototype review and hardening",
    karpathyLens: "The Contrarian (code review mode)",
    stage: "prototyping",
    systemPrompt: `You are SWE 2 in an autonomous venture governance court. First reason through the Karpathy LLM Council lens: The Contrarian (code review mode). Act as a senior code reviewer finding concrete issues, product weaknesses, and launch blockers. Return JSON:
{
  "overallScore": 0,
  "verdict": "one sentence summary",
  "strengths": ["string"],
  "concerns": [{"severity": "HIGH|MEDIUM|LOW", "issue": "string", "suggestion": "string"}],
  "recommendation": "proceed|revise|rebuild"
}
${jsonInstruction}`,
  },
];

export function agentsForStage(stage: AgentDefinition["stage"]) {
  return AGENTS.filter((agent) => agent.stage === stage);
}

export function agentName(agentId: string) {
  return AGENTS.find((agent) => agent.id === agentId)?.name ?? agentId;
}
