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

### CLoD + FastAPI backend (recommended)

Keep your CLōD API key **only on the server** (see [backend/main.py](backend/main.py)). Terminal one — Python:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: CLOD_API_KEY, CLOD_BASE_URL=https://api.clod.io/v1, CLOD_MODEL=DeepSeek V3
uvicorn main:app --reload
```

Terminal two — Vite (project root):

```bash
cp .env.example .env
# Ensure VITE_CLOD_BACKEND_URL=http://127.0.0.1:8000 (matches uvicorn default port)
npm run dev
```

Alternatively, set `VITE_CLOD_API_KEY` (and optional `VITE_CLOD_BASE_URL`, `VITE_CLOD_MODEL`) in the root `.env` to call CLōD directly from the browser (the key ships in the client bundle).

## Environment variables

Copy `.env.example` to `.env` and fill keys **only when wiring real APIs**. The demo runs in **mock mode** without any keys.

```bash
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `VITE_CLOD_BACKEND_URL` | Local FastAPI proxy URL for CLoD (default in `.env.example`: `http://127.0.0.1:8000`) |
| `VITE_CLOD_API_KEY` | Optional: call CLōD from the browser instead of the backend |
| `VITE_CLOD_BASE_URL` | Optional with direct mode; default `https://api.clod.io/v1` |
| `VITE_CLOD_MODEL` | Optional with direct mode; default `DeepSeek V3` |
| `VITE_GEMINI_API_KEY` | Future Gemini agent calls (`geminiService.ts`) |
| `VITE_GREPTILE_API_KEY` | Greptile technical due diligence API |
| `VITE_NIA_API_KEY` | Nia market intelligence API |
| `VITE_ALLSCALE_API_KEY` | AllScale orchestration API |
| `VITE_BGA_API_KEY` | BGA governance / ledger API |

Backend-only (file `backend/.env`): `CLOD_API_KEY`, `CLOD_BASE_URL`, `CLOD_MODEL`.

## Future real API integration

1. **Gemini:** Replace `callGeminiAgent` body with `@google/generative-ai`, structured JSON or tool calls per agent role.
2. **Greptile:** Swap `realGreptileReview` with authenticated requests to Greptile’s review endpoint; map into `GreptileReview`.
3. **Nia:** Implement `realNiaResearch` with live web/competitor research and structured extraction.
4. **CLoD:** Live CLōD integration via FastAPI proxy + OpenAI-compatible chat completions (`backend/main.py`, `clodService.ts`).
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
