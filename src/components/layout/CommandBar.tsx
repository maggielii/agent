import type { ReactNode } from "react";
import { useStore } from "../../store/useStore";

const stageLabels = {
  ideation: "IDEATION",
  market_research: "MARKET RESEARCH",
  prototyping: "PROTOTYPING",
};

function StatChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs text-zinc-300">
      {children}
    </span>
  );
}

export function CommandBar() {
  const sessionId = useStore((state) => state.sessionId);
  const isRunning = useStore((state) => state.isRunning);
  const currentConfidence = useStore((state) => state.currentConfidence);
  const stages = useStore((state) => state.stages);
  const currentStageIndex = useStore((state) => state.currentStageIndex);
  const finalVerdict = useStore((state) => state.finalVerdict);
  const streamingText = useStore((state) => state.streamingText);
  const conflicts = stages.reduce((count, stage) => count + stage.conflicts.length, 0);
  const activeAgents = isRunning ? Math.max(1, Object.values(streamingText).filter(Boolean).length) : 0;
  const currentStage = stages[currentStageIndex]?.id;
  const stageLabel = finalVerdict ? "COMPLETE" : currentStage ? stageLabels[currentStage] : "IDEATION";

  return (
    <header className="col-span-3 flex h-12 items-center justify-between border-b border-white/10 bg-court-surface px-4">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold tracking-wide text-zinc-50">Venture Court</h1>
        <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Autonomous Venture Governance
        </span>
        <span className="font-mono text-xs text-zinc-600">{sessionId}</span>
      </div>
      <div className="flex items-center gap-2">
        <StatChip>{activeAgents} agents active</StatChip>
        <StatChip>{conflicts} conflicts</StatChip>
        <StatChip>{Math.round(currentConfidence)}% confidence</StatChip>
        <StatChip>{stageLabel}</StatChip>
      </div>
    </header>
  );
}
