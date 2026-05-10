import { create } from "zustand";
import { AGENTS } from "../agents/definitions";
import {
  aggregateRisks,
  buildFinalVerdict,
  detectConflicts,
  generatePrototype,
  reviewPrototype,
  runAgent,
  runSpecialist,
  summarizeStage,
} from "../agents/runner";
import { allscaleDetect } from "../services/allscale";
import { bgaSeal } from "../services/bga";
import { niaScan } from "../services/nia";
import type {
  AgentResult,
  AppView,
  CodeReview,
  FeedEvent,
  FinalVerdict,
  GovernanceCheckpoint,
  Severity,
  Specialist,
  StageId,
  StageState,
  VentureContext,
} from "../types";

interface CouncilStore {
  view: AppView;
  sessionId: string;
  isRunning: boolean;
  awaitingCheckpoint: boolean;
  startIdea: string;
  stages: StageState[];
  currentStageIndex: number;
  events: FeedEvent[];
  streamingText: Record<string, string>;
  currentThesis: string;
  confidenceHistory: { agent: string; value: number; delta: number }[];
  currentConfidence: number;
  activeRisks: { severity: Severity; description: string }[];
  specialists: Specialist[];
  generatedCode: string;
  isGeneratingCode: boolean;
  codeReview: CodeReview | null;
  isRunningCodeReview: boolean;
  governanceCheckpoints: GovernanceCheckpoint[];
  finalVerdict: FinalVerdict | null;
  submitIdea: (idea: string) => Promise<void>;
  proceedFromCheckpoint: () => Promise<void>;
  stopAtCheckpoint: () => void;
  addEvent: (event: Omit<FeedEvent, "id" | "timestamp">) => void;
  setStreamingText: (agentId: string, text: string) => void;
  resetSession: () => void;
}

const createSessionId = () =>
  `VC-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
    .toString(36)
    .toUpperCase()}`;

const stageOrder: StageId[] = ["ideation", "market_research", "prototyping"];

const createInitialStages = (): StageState[] => [
  {
    id: "ideation",
    name: "Ideation",
    status: "pending",
    agentResults: [],
    conflicts: [],
    stageVerdict: "",
    confidenceAtSeal: 50,
  },
  {
    id: "market_research",
    name: "Market Research",
    status: "pending",
    agentResults: [],
    conflicts: [],
    stageVerdict: "",
    confidenceAtSeal: 50,
  },
  {
    id: "prototyping",
    name: "Prototyping",
    status: "pending",
    agentResults: [],
    conflicts: [],
    stageVerdict: "",
    confidenceAtSeal: 50,
  },
];

const createInitialState = () => ({
  view: "session" as AppView,
  sessionId: createSessionId(),
  isRunning: false,
  awaitingCheckpoint: false,
  startIdea: "",
  stages: createInitialStages(),
  currentStageIndex: 0,
  events: [],
  streamingText: {},
  currentThesis: "Submit a startup idea to convene the venture court.",
  confidenceHistory: [{ agent: "Starting point", value: 50, delta: 0 }],
  currentConfidence: 50,
  activeRisks: [],
  specialists: [],
  generatedCode: "",
  isGeneratingCode: false,
  codeReview: null,
  isRunningCodeReview: false,
  governanceCheckpoints: [],
  finalVerdict: null,
});

type StoreSet = (
  partial:
    | Partial<CouncilStore>
    | CouncilStore
    | ((state: CouncilStore) => Partial<CouncilStore> | CouncilStore),
  replace?: false
) => void;
type StoreGet = () => CouncilStore;

function setStage(set: StoreSet, index: number, updater: (stage: StageState) => StageState) {
  set((state) => ({
    stages: state.stages.map((stage, stageIndex) => (stageIndex === index ? updater(stage) : stage)),
  }));
}

function getAgent(id: string) {
  const agent = AGENTS.find((candidate) => candidate.id === id);
  if (!agent) throw new Error(`Missing agent ${id}`);
  return agent;
}

function buildContext(get: StoreGet, stage: StageId): VentureContext {
  const state = get();
  const priorFindings = [
    ...state.stages.flatMap((stageState) =>
      stageState.agentResults.flatMap((result) => [result.claim, result.evidence, ...result.keyFindings])
    ),
    ...state.specialists.flatMap((specialist) => [specialist.finding, specialist.ventureImpact]),
  ].filter(Boolean);

  return {
    originalIdea: state.startIdea,
    currentThesis: state.currentThesis,
    sessionId: state.sessionId,
    stage,
    priorFindings,
    confidenceHistory: state.confidenceHistory,
    activeRisks: state.activeRisks,
    niaData: state.stages.find((stageState) => stageState.id === "market_research")?.niaResult,
    specialists: state.specialists,
  };
}

function appendResult(set: StoreSet, get: StoreGet, stageIndex: number, result: AgentResult) {
  const previous = get().currentConfidence;
  const next = result.confidence;
  setStage(set, stageIndex, (stage) => ({ ...stage, agentResults: [...stage.agentResults, result] }));
  set((state) => ({
    currentConfidence: next,
    confidenceHistory: [
      ...state.confidenceHistory,
      { agent: result.agentId.toUpperCase(), value: next, delta: next - previous },
    ],
    currentThesis: result.recommendation,
  }));
  get().addEvent({
    type: "AGENT_COMPLETE",
    actor: result.agentId.toUpperCase(),
    content: result.claim,
    metadata: {
      position: result.position,
      keyFindings: result.keyFindings,
    },
  });
  get().addEvent({
    type: "CONFIDENCE_SHIFT",
    actor: "Confidence",
    content: `Confidence ${previous}% -> ${next}% (${next - previous >= 0 ? "+" : ""}${next - previous}%)`,
  });
  set((state) => ({
    activeRisks: aggregateRisks(state.stages),
  }));
}

async function summonSpecialists(set: StoreSet, get: StoreGet, stageIndex: number) {
  const state = get();
  const findings = state.stages.flatMap((stage) => stage.agentResults.flatMap((result) => result.keyFindings));
  try {
    const detected = await allscaleDetect(state.startIdea, findings);
    const newSpecialists = detected.filter(
      (specialist) => !state.specialists.some((existing) => existing.name === specialist.name)
    );
    const completed: Specialist[] = [];
    for (const specialist of newSpecialists) {
      get().addEvent({
        type: "SPECIALIST_SUMMONED",
        actor: specialist.name,
        content: `${specialist.domain} review added to the council context.`,
        metadata: { domain: specialist.domain },
      });
      const enriched = await runSpecialist(specialist, buildContext(get, stageOrder[stageIndex]));
      completed.push(enriched);
    }
    if (completed.length > 0) {
      set((current) => ({ specialists: [...current.specialists, ...completed] }));
    }
  } catch {
    get().addEvent({
      type: "SPECIALIST_SUMMONED",
      actor: "Specialist review",
      content: "No additional specialist context was required for this stage.",
    });
  }
}

async function sealStage(set: StoreSet, get: StoreGet, stageIndex: number) {
  const state = get();
  const stage = state.stages[stageIndex];
  const verdict = summarizeStage(stage.id, stage.agentResults, state.currentConfidence);
  const checkpoint = await bgaSeal(stage.id, verdict, state.currentConfidence);
  setStage(set, stageIndex, (current) => ({
    ...current,
    status: "complete",
    stageVerdict: verdict,
    confidenceAtSeal: state.currentConfidence,
    checkpoint,
  }));
  set((current) => ({
    governanceCheckpoints: [...current.governanceCheckpoints, checkpoint],
  }));
  get().addEvent({
    type: "STAGE_SEALED",
    actor: "Governance",
    content: checkpoint.hash,
    metadata: { hash: checkpoint.hash },
  });
  return checkpoint;
}

async function runStage(set: StoreSet, get: StoreGet, stageIndex: number) {
  const stageId = stageOrder[stageIndex];
  const stage = get().stages[stageIndex];
  set({ isRunning: true, awaitingCheckpoint: false, currentStageIndex: stageIndex });
  setStage(set, stageIndex, (current) => ({ ...current, status: "active" }));
  get().addEvent({
    type: "STAGE_START",
    actor: stage.name,
    content: `Stage ${stageIndex + 1} started: ${stage.name}.`,
  });

  try {
    if (stageId === "ideation") {
      for (const id of ["ceo", "cto", "cmo"]) {
        const agent = getAgent(id);
        get().addEvent({
          type: "AGENT_STREAMING",
          actor: agent.name,
          content: "Reasoning through the venture thesis.",
          metadata: { agentId: agent.id },
        });
        const result = await runAgent(agent, buildContext(get, stageId));
        appendResult(set, get, stageIndex, result);
      }
    }

    if (stageId === "market_research") {
      const niaResult = await niaScan(get().startIdea);
      setStage(set, stageIndex, (current) => ({ ...current, niaResult }));
      get().addEvent({
        type: "MARKET_RESEARCH",
        actor: "CMO",
        content: "Market findings were added to the council record.",
        metadata: { niaResult },
      });
      for (const id of ["cmo", "contrarian"]) {
        const agent = getAgent(id);
        get().addEvent({
          type: "AGENT_STREAMING",
          actor: agent.name,
          content: "Evaluating market evidence.",
          metadata: { agentId: agent.id },
        });
        const result = await runAgent(agent, buildContext(get, stageId));
        appendResult(set, get, stageIndex, result);
      }
    }

    if (stageId === "prototyping") {
      const swe1 = getAgent("swe1");
      const swe2 = getAgent("swe2");
      get().addEvent({
        type: "CODE_GENERATING",
        actor: "SWE 1",
        content: "Generating prototype",
        metadata: { agentId: swe1.id },
      });
      get().addEvent({
        type: "AGENT_STREAMING",
        actor: swe1.name,
        content: "Building the MVP prototype.",
        metadata: { agentId: swe1.id },
      });
      set({ isGeneratingCode: true });
      const generatedCode = await generatePrototype(buildContext(get, stageId), swe1);
      set({ generatedCode, isGeneratingCode: false });
      appendResult(set, get, stageIndex, {
        agentId: "swe1",
        position: "bullish",
        karpathyLens: swe1.karpathyLens,
        claim: "A functional single-file MVP prototype is ready for evaluation.",
        evidence: "The generated iframe document contains embedded interface, styling, and interaction logic.",
        objection: "A prototype does not prove integration feasibility or buyer urgency.",
        recommendation: "Use the prototype in guided discovery with target operators.",
        confidence: Math.min(85, get().currentConfidence + 8),
        confidenceDelta: 8,
        risks: [{ severity: "MEDIUM", description: "Prototype validation may not reflect production integration complexity." }],
        keyFindings: ["The MVP can be demonstrated immediately.", "Buyer feedback should focus on workflow fit."],
      });

      set({ isRunningCodeReview: true });
      get().addEvent({
        type: "AGENT_STREAMING",
        actor: swe2.name,
        content: "Reviewing prototype quality and launch risk.",
        metadata: { agentId: swe2.id },
      });
      const codeReview = await reviewPrototype(buildContext(get, stageId), swe2, generatedCode);
      set({ codeReview, isRunningCodeReview: false });
      get().addEvent({
        type: "CODE_REVIEW",
        actor: "SWE 2",
        content: codeReview.verdict,
        metadata: { codeReview },
      });
      appendResult(set, get, stageIndex, {
        agentId: "swe2",
        position: codeReview.recommendation === "rebuild" ? "adversarial" : codeReview.recommendation === "revise" ? "cautious" : "bullish",
        karpathyLens: swe2.karpathyLens,
        claim: codeReview.verdict,
        evidence: `${codeReview.overallScore}/100 review score.`,
        objection: "Code review is static and cannot replace real user testing.",
        recommendation: codeReview.recommendation === "proceed" ? "Proceed to buyer demo." : "Revise the prototype before broader exposure.",
        confidence: codeReview.overallScore,
        confidenceDelta: codeReview.overallScore - get().currentConfidence,
        risks: codeReview.concerns.map((concern) => ({ severity: concern.severity, description: concern.issue })),
        keyFindings: codeReview.strengths,
      });
    }

    const conflicts = detectConflicts(get().stages[stageIndex].agentResults);
    if (conflicts.length > 0) {
      setStage(set, stageIndex, (current) => ({ ...current, conflicts }));
      conflicts.forEach((conflict) =>
        get().addEvent({
          type: "CONFLICT",
          actor: "Council conflict",
          content: conflict.summary,
          metadata: { severity: conflict.severity },
        })
      );
      const impact = conflicts.reduce((total, conflict) => total + conflict.confidenceImpact, 0);
      set((current) => ({ currentConfidence: Math.max(0, current.currentConfidence + impact) }));
    }

    if (stageId === "ideation" || stageId === "market_research") {
      await summonSpecialists(set, get, stageIndex);
    }

    await sealStage(set, get, stageIndex);

    if (stageId === "prototyping") {
      const finalVerdict = buildFinalVerdict({
        stages: get().stages,
        confidence: get().currentConfidence,
        currentThesis: get().currentThesis,
        startIdea: get().startIdea,
        generatedCode: get().generatedCode,
        codeReview: get().codeReview,
        governanceTrail: get().governanceCheckpoints,
        specialists: get().specialists,
        sessionId: get().sessionId,
      });
      set({ finalVerdict, view: "verdict", isRunning: false, awaitingCheckpoint: false });
      get().addEvent({
        type: "VERDICT",
        actor: "CEO",
        content: `Final verdict: ${finalVerdict.decision} at ${finalVerdict.confidence}% confidence.`,
      });
      return;
    }

    set({ isRunning: false, awaitingCheckpoint: true });
    get().addEvent({
      type: "CHECKPOINT",
      actor: "Checkpoint",
      content: "User decision required before the next stage.",
    });
  } catch {
    set({ isRunning: false, isGeneratingCode: false, isRunningCodeReview: false, awaitingCheckpoint: true });
    get().addEvent({
      type: "CHECKPOINT",
      actor: "Checkpoint",
      content: "The stage degraded gracefully. Review the partial findings before continuing.",
    });
  }
}

export const useStore = create<CouncilStore>((set, get) => ({
  ...createInitialState(),
  submitIdea: async (idea) => {
    const trimmed = idea.trim();
    if (trimmed.length <= 10 || get().isRunning) return;
    const sessionId = createSessionId();
    set({
      ...createInitialState(),
      sessionId,
      startIdea: trimmed,
      currentThesis: trimmed,
      stages: createInitialStages(),
      confidenceHistory: [{ agent: "Starting point", value: 50, delta: 0 }],
    });
    await runStage(set, get, 0);
  },
  proceedFromCheckpoint: async () => {
    if (!get().awaitingCheckpoint || get().isRunning) return;
    const nextStageIndex = get().currentStageIndex + 1;
    if (nextStageIndex >= stageOrder.length) return;
    await runStage(set, get, nextStageIndex);
  },
  stopAtCheckpoint: () => {
    const finalVerdict = buildFinalVerdict({
      stages: get().stages,
      confidence: get().currentConfidence,
      currentThesis: get().currentThesis,
      startIdea: get().startIdea,
      generatedCode: get().generatedCode,
      codeReview: get().codeReview,
      governanceTrail: get().governanceCheckpoints,
      specialists: get().specialists,
      sessionId: get().sessionId,
    });
    set({ finalVerdict, view: "verdict", awaitingCheckpoint: false, isRunning: false });
    get().addEvent({
      type: "VERDICT",
      actor: "CEO",
      content: `Session stopped. Current verdict: ${finalVerdict.decision}.`,
    });
  },
  addEvent: (event) =>
    set((state) => ({
      events: [
        ...state.events,
        {
          ...event,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
    })),
  setStreamingText: (agentId, text) =>
    set((state) => ({
      streamingText: { ...state.streamingText, [agentId]: text },
    })),
  resetSession: () =>
    set({
      ...createInitialState(),
      sessionId: createSessionId(),
      stages: createInitialStages(),
      confidenceHistory: [{ agent: "Starting point", value: 50, delta: 0 }],
    }),
}));

export { createInitialStages };
