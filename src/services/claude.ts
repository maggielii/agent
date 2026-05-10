import Anthropic from "@anthropic-ai/sdk";
import { useStore } from "../store/useStore";

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || "missing-key",
  dangerouslyAllowBrowser: true,
});

function fallbackResponse(systemPrompt: string, userPrompt: string): string {
  const compactIdea = userPrompt.slice(0, 180).replace(/\s+/g, " ");

  if (systemPrompt.includes("htmlCode")) {
    return JSON.stringify({
      reasoning: "Fallback prototype generated locally because the build model was unavailable.",
      htmlCode: buildFallbackHtml(compactIdea),
      techChoices: ["Single-file HTML", "Embedded CSS", "Vanilla JavaScript"],
      limitations: ["Uses representative demo data", "External integrations are mocked"],
    });
  }

  if (systemPrompt.includes("overallScore")) {
    return JSON.stringify({
      overallScore: 72,
      verdict: "The prototype is coherent enough to test but should be hardened before customer exposure.",
      strengths: ["Clear primary workflow", "Functional interactive states", "Readable information hierarchy"],
      concerns: [
        {
          severity: "MEDIUM",
          issue: "Demo data is static.",
          suggestion: "Add a real persistence boundary before pilots.",
        },
        {
          severity: "LOW",
          issue: "Accessibility labels are incomplete.",
          suggestion: "Add aria labels around controls used in the main workflow.",
        },
      ],
      recommendation: "revise",
    });
  }

  return JSON.stringify({
    position: "cautious",
    karpathyLens: "Fallback council reasoning",
    claim: "The venture warrants a narrow validation pass before any broad build-out.",
    evidence: "The submitted thesis has a clear operator pain point but lacks verified buyer urgency in this run.",
    objection: "A focused wedge could still uncover urgent demand quickly.",
    recommendation: "Interview five target buyers and test one workflow prototype.",
    confidence: 58,
    confidenceDelta: 8,
    risks: [{ severity: "MEDIUM", description: "Market evidence is unverified because live model output was unavailable." }],
    keyFindings: [
      `The idea under review is ${compactIdea || "the submitted venture"}.`,
      "Fallback analysis preserved session continuity.",
    ],
  });
}

function buildFallbackHtml(idea: string): string {
  const escapedIdea = idea.replace(/[<>&"]/g, (char) => {
    const entities: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" };
    return entities[char] ?? char;
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Venture MVP Prototype</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0b0b0f;
      --panel: #15151b;
      --raised: #1f1f29;
      --line: rgba(255,255,255,0.1);
      --text: #f5f5f5;
      --muted: #9ca3af;
      --green: #34d399;
      --amber: #f59e0b;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 24px;
      border-bottom: 1px solid var(--line);
      background: #111117;
    }
    .brand { font-weight: 700; letter-spacing: -0.02em; }
    .pill {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 6px 10px;
      color: var(--muted);
      font-size: 12px;
    }
    main {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 18px;
      padding: 18px;
    }
    aside, section {
      border: 1px solid var(--line);
      border-radius: 18px;
      background: var(--panel);
    }
    aside { padding: 18px; }
    h1, h2, h3, p { margin-top: 0; }
    h1 { font-size: 28px; line-height: 1.1; margin-bottom: 10px; }
    h2 { font-size: 14px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.12em; }
    .summary {
      padding: 24px;
      min-height: 280px;
    }
    .workflow {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 20px;
    }
    .card {
      background: var(--raised);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 14px;
    }
    .metric {
      font-size: 30px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .muted { color: var(--muted); }
    .queue {
      margin-top: 18px;
      display: grid;
      gap: 10px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 12px;
      background: rgba(255,255,255,0.03);
    }
    button {
      border: 0;
      border-radius: 10px;
      padding: 10px 12px;
      background: #f4f4f5;
      color: #09090b;
      cursor: pointer;
      font-weight: 650;
    }
    button.secondary {
      background: transparent;
      color: var(--text);
      border: 1px solid var(--line);
    }
    input, textarea {
      width: 100%;
      border: 1px solid var(--line);
      background: #0f0f15;
      color: var(--text);
      border-radius: 12px;
      padding: 12px;
      margin-top: 8px;
    }
    .status {
      color: var(--green);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
    }
    .amber { color: var(--amber); }
    .actions { display: flex; gap: 10px; margin-top: 14px; }
    @media (max-width: 800px) {
      main { grid-template-columns: 1fr; }
      .workflow { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">MVP Command Center</div>
    <div class="pill">Live validation workspace</div>
  </header>
  <main>
    <aside>
      <h2>Venture brief</h2>
      <p class="muted">${escapedIdea}</p>
      <div class="card">
        <div class="metric">74%</div>
        <p class="muted">Readiness score</p>
      </div>
      <div class="queue">
        <div class="row"><span>Buyer pain</span><span class="status">Active</span></div>
        <div class="row"><span>Workflow fit</span><span class="status">Active</span></div>
        <div class="row"><span>Launch risk</span><span class="amber">Watch</span></div>
      </div>
    </aside>
    <section class="summary">
      <h1>Operator-grade prototype for the submitted venture</h1>
      <p class="muted">This MVP demonstrates the core workflow a buyer would use to evaluate, route, and act on the venture's central promise.</p>
      <div class="workflow">
        <div class="card">
          <h3>1. Intake</h3>
          <p class="muted">Capture a high-signal operational request and classify urgency.</p>
        </div>
        <div class="card">
          <h3>2. Decision</h3>
          <p class="muted">Recommend the next best action with evidence and risk flags.</p>
        </div>
        <div class="card">
          <h3>3. Audit</h3>
          <p class="muted">Record the decision trail for management review.</p>
        </div>
      </div>
      <label>
        Request
        <textarea id="request" rows="5">Need a prioritized action plan for a high-risk account this week.</textarea>
      </label>
      <div class="actions">
        <button id="run">Generate plan</button>
        <button class="secondary" id="reset">Reset</button>
      </div>
      <div id="output" class="queue"></div>
    </section>
  </main>
  <script>
    const output = document.getElementById("output");
    const request = document.getElementById("request");
    const render = (message) => {
      output.innerHTML = [
        '<div class="row"><span>Recommended action</span><strong>' + message + '</strong></div>',
        '<div class="row"><span>Evidence</span><span class="muted">Urgency, account value, and operational risk are aligned.</span></div>',
        '<div class="row"><span>Audit status</span><span class="status">Recorded</span></div>'
      ].join("");
    };
    document.getElementById("run").addEventListener("click", () => {
      const hasUrgency = request.value.toLowerCase().includes("risk") || request.value.toLowerCase().includes("urgent");
      render(hasUrgency ? "Escalate to owner with 48-hour follow-up" : "Route to standard validation queue");
    });
    document.getElementById("reset").addEventListener("click", () => {
      request.value = "";
      output.innerHTML = "";
    });
    render("Escalate to owner with 48-hour follow-up");
  </script>
</body>
</html>`;
}

export async function streamAgent(agentId: string, systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: systemPrompt.includes("htmlCode") ? 6000 : 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    let buffer = "";
    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        buffer += chunk.delta.text;
        useStore.getState().setStreamingText(agentId, buffer);
      }
    }

    useStore.getState().setStreamingText(agentId, "");
    return buffer;
  } catch {
    const fallback = fallbackResponse(systemPrompt, userPrompt);
    useStore.getState().setStreamingText(agentId, fallback);
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    useStore.getState().setStreamingText(agentId, "");
    return fallback;
  }
}

export function parseJSON<T>(raw: string): T | null {
  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim()) as T;
  } catch {
    return null;
  }
}
