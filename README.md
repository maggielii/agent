# CouncilOS

CouncilOS is an **autonomous startup agent council** — a venture governance engine that takes a raw idea, routes it through specialized AI councils, scores each stage with judges, and ends with a **Final Judge** synthesis: **Proceed**, **Pivot**, or **Reject**.

It is intentionally **not a chatbot**. The product frames itself as an **AI boardroom** for agents, founders, builders, and investors who need a defensible build / pivot / kill decision.

**Hackathon prompt alignment:** *“Build something agents actually want.”* CouncilOS gives agents a structured decision substrate: councils, judges, confidence, risk, sponsor tools, and an exportable verdict JSON.

## Sponsor tracks (visible + architectural)

| Sponsor   | Role in CouncilOS |
|-----------|-------------------|
| **Nia**   | **Market Intelligence Layer** — research, competitors, trends, negative signals (`niaService.ts`). |
| **Greptile** | **Technical Due Diligence Layer** — code/architecture/maintainability/scalability (`greptileService.ts`). |
| **CLoD**  | **Autonomous MVP Execution Layer** — implementation plan, scaffold, execution-style output (`clodService.ts`). |
| **AllScale** | **Parallel Agent Scale Layer** — agent count, parallel tasks, orchestration mode (`allscaleService.ts`). |
| **BGA** (Blockchain for Good) | **Governance & trust layer** — tamper-evident audit trail, public-good score, proof-of-evaluation (`bgaService.ts`). |
| **Gemini** | **Future LLM provider** — adapter + mock in `geminiService.ts` (no key required for demo). |

## Tech stack

- Vite + React 18 + TypeScript
- Tailwind CSS (+ `tailwindcss-animate`)
- shadcn-style UI primitives (`src/components/ui/*`)
- Framer Motion
- Lucide React

## Installation

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173`).

Production build runs `tsc` then Vite:

```bash
npm run build
```

## Environment variables

Copy `.env.example` to `.env` and fill keys **only when wiring real APIs**. The demo runs in **mock mode** without any keys.

```bash
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `VITE_GEMINI_API_KEY` | Future Gemini agent calls (`geminiService.ts`) |
| `VITE_GREPTILE_API_KEY` | Greptile technical due diligence API |
| `VITE_NIA_API_KEY` | Nia market intelligence API |
| `VITE_CLOD_API_KEY` | CLoD execution / scaffold API |
| `VITE_ALLSCALE_API_KEY` | AllScale orchestration API |
| `VITE_BGA_API_KEY` | BGA governance / ledger API |

## Future real API integration

1. **Gemini:** Replace `callGeminiAgent` body with `@google/generative-ai`, structured JSON or tool calls per agent role.
2. **Greptile:** Swap `realGreptileReview` with authenticated requests to Greptile’s review endpoint; map into `GreptileReview`.
3. **Nia:** Implement `realNiaResearch` with live web/competitor research and structured extraction.
4. **CLoD:** Wire `realClodExecution` to plan/scaffold APIs; keep `ClodExecutionPlan` as the contract.
5. **AllScale:** Map `realAllScaleOrchestration` to workload graphs and pool sizing responses.
6. **BGA:** Anchor `decisionHash` / audit trail via partner ledger or signing service.

## Demo script (hackathon)

1. Paste or load the sample idea: *AI operating system for construction companies that automates project updates, vendor coordination, site risk tracking, and executive reporting.*
2. Click **Summon Council**.
3. Watch **Founder → Market → Technical → Investor → Adversarial → Governance → CEO → Final Judge** run automatically with live stage updates.
4. Point to **Nia** in Market Intelligence (competitor / trend / negative signals).
5. Point to **Greptile** in Technical Feasibility (due diligence strings + scalability risks).
6. Point to **CLoD** (MVP phases, file structure, build weeks).
7. Point to **AllScale** in Governance (agent count, parallel tasks, orchestration mode).
8. Point to **BGA** (decision hash, audit trail, public-good score, governance rationale).
9. Scroll to the **Final verdict** and click **Export JSON report** (`councilos-verdict-[timestamp].json`).

## Product summary

- **Input:** startup idea (bottom command bar).
- **Process:** eight councils with agents + judges; sponsor layers attach where specified.
- **Output:** Proceed / Pivot / Reject, scores, risks, MVP recommendation, action items, disagreements, sponsor summaries, governance record, and downloadable JSON.

---

Built for demo reliability: **no API keys required**; all sponsor calls resolve to structured mocks when keys are absent.
