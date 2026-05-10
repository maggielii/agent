/**
 * Gemini adapter — future LLM provider for CouncilOS agent reasoning.
 * Mock mode runs without VITE_GEMINI_API_KEY.
 *
 * Real integration: use @google/generative-ai with model such as gemini-2.0-flash
 * and pass structured prompts per agent role. See callGeminiAgent below.
 */

const hasKey = () => Boolean(import.meta.env.VITE_GEMINI_API_KEY);

export interface GeminiAgentRequest {
  systemHint: string;
  userIdea: string;
  agentRole: string;
}

export interface GeminiAgentReply {
  text: string;
  confidenceHint: number;
}

/** Deterministic mock for demos when no API key is set. */
export function mockGeminiAgentResponse(
  req: GeminiAgentRequest
): GeminiAgentReply {
  const seed = simpleHash(req.userIdea + req.agentRole);
  return {
    text: `Structured analysis for ${req.agentRole}: the idea "${truncate(
      req.userIdea,
      80
    )}" ${req.systemHint.slice(0, 40)}… [mock Gemini ${seed % 100}]`,
    confidenceHint: 60 + (seed % 35),
  };
}

/**
 * Placeholder for production: call Gemini REST/SDK with JSON mode or
 * function-calling for CouncilAgent-shaped output.
 */
export async function callGeminiAgent(
  req: GeminiAgentRequest
): Promise<GeminiAgentReply> {
  if (!hasKey()) {
    return Promise.resolve(mockGeminiAgentResponse(req));
  }
  // Real implementation:
  // const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  // const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  // const result = await model.generateContent({ ... });
  // return parseStructured(result);
  return mockGeminiAgentResponse(req);
}

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n)}…`;
}
