/**
 * CLoD — Autonomous MVP Execution Layer (planner, scaffold, execution environment).
 *
 * Priority:
 * 1. `VITE_CLOD_BACKEND_URL` — FastAPI proxy ([backend/main.py](../../backend/main.py)); API key stays server-side as CLOD_*.
 * 2. `VITE_CLOD_API_KEY` (+ optional VITE_CLOD_BASE_URL, VITE_CLOD_MODEL) — call CLōD directly from the browser (key exposed in bundle).
 * 3. Mock plan when neither is configured.
 */

export interface ClodExecutionPlan {
  implementationPhases: string[];
  fileStructure: string[];
  mvpScope: string;
  implementationRisk: "low" | "medium" | "high";
  estimatedBuildWeeks: number;
}

const SYSTEM_PROMPT = `You are an engineering planner for startup MVPs. Reply with ONLY a JSON object (no markdown fences, no commentary) with exactly these keys:
- implementationPhases: array of 3 short strings (phase descriptions with rough weeks)
- fileStructure: array of 3 strings (monorepo paths or module names)
- mvpScope: one concise sentence on what to ship first
- implementationRisk: one of "low", "medium", "high"
- estimatedBuildWeeks: integer between 4 and 24`;

function extractJsonObject(text: string): Record<string, unknown> {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const parsed: unknown = JSON.parse(t);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("expected JSON object");
  }
  return parsed as Record<string, unknown>;
}

function normalizePlan(raw: Record<string, unknown>, idea: string): ClodExecutionPlan {
  const riskRaw = String(raw.implementationRisk ?? "medium").toLowerCase();
  const implementationRisk: ClodExecutionPlan["implementationRisk"] =
    riskRaw === "low" || riskRaw === "medium" || riskRaw === "high" ? riskRaw : "medium";
  let phases: unknown = raw.implementationPhases;
  let files: unknown = raw.fileStructure;
  if (!Array.isArray(phases)) phases = [];
  if (!Array.isArray(files)) files = [];
  const phaseArr = phases as unknown[];
  const fileArr = files as unknown[];
  let weeks = Number(raw.estimatedBuildWeeks);
  if (!Number.isFinite(weeks)) weeks = /construction|site/i.test(idea) ? 10 : 8;
  weeks = Math.max(4, Math.min(24, Math.round(weeks)));
  return {
    implementationPhases: phaseArr.length
      ? phaseArr.map(String).slice(0, 8)
      : ["Phase 1: foundations", "Phase 2: integrations", "Phase 3: MVP launch"],
    fileStructure: fileArr.length
      ? fileArr.map(String).slice(0, 8)
      : ["apps/web", "packages/core", "packages/integrations"],
    mvpScope: String(raw.mvpScope || "Ship a narrow vertical slice first."),
    implementationRisk,
    estimatedBuildWeeks: weeks,
  };
}

export function mockClodExecutionPlan(idea: string): ClodExecutionPlan {
  const w = /construction|site/i.test(idea) ? 10 : 8;
  return {
    implementationPhases: [
      "Week 1–2: auth, org model, project master data",
      "Week 3–5: integrations (Slack/email), notification graph",
      "Week 6+: risk signals MVP + exec reporting dashboard",
    ],
    fileStructure: [
      "apps/web — Vite dashboard",
      "packages/agents — council orchestration",
      "packages/integrations — vendor connectors (mock adapters)",
    ],
    mvpScope:
      "Ship executive digest + vendor coordination loop before advanced computer vision.",
    implementationRisk: "medium",
    estimatedBuildWeeks: w,
  };
}

async function clodChatCompletionPlan(idea: string): Promise<ClodExecutionPlan> {
  const apiKey = import.meta.env.VITE_CLOD_API_KEY;
  const base = (import.meta.env.VITE_CLOD_BASE_URL || "https://api.clod.io/v1").replace(/\/$/, "");
  const model = import.meta.env.VITE_CLOD_MODEL || "DeepSeek V3";
  if (!apiKey) return mockClodExecutionPlan(idea);

  const userPrompt = `Startup idea to plan:\n"""${idea.trim()}"""\nOutput the JSON object now.`;
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.35,
      max_completion_tokens: 1024,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`CLoD API ${res.status}: ${err.slice(0, 400)}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("CLoD response missing message content");
  const raw = extractJsonObject(content);
  return normalizePlan(raw, idea);
}

export async function realClodExecution(idea: string): Promise<ClodExecutionPlan> {
  const backend = import.meta.env.VITE_CLOD_BACKEND_URL?.replace(/\/$/, "");
  if (backend) {
    try {
      const res = await fetch(`${backend}/clod/execution-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`${res.status} ${t.slice(0, 300)}`);
      }
      const data = (await res.json()) as ClodExecutionPlan;
      return {
        ...data,
        implementationRisk:
          data.implementationRisk === "low" || data.implementationRisk === "high"
            ? data.implementationRisk
            : "medium",
      };
    } catch (e) {
      console.warn("[CLoD] Backend request failed, falling back to mock:", e);
      return mockClodExecutionPlan(idea);
    }
  }

  if (import.meta.env.VITE_CLOD_API_KEY) {
    try {
      return await clodChatCompletionPlan(idea);
    } catch (e) {
      console.warn("[CLoD] Direct API call failed, falling back to mock:", e);
      return mockClodExecutionPlan(idea);
    }
  }

  return mockClodExecutionPlan(idea);
}
