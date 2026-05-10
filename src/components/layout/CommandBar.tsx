import type { ReactNode } from "react";
import { useStore } from "../../store/useStore";

const stageLabels = {
  ideation: "IDEATION",
  market_research: "MARKET RESEARCH",
  prototyping: "PROTOTYPING",
};

function StatChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 font-mono text-[11px] text-zinc-500">
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
    <header className="col-span-3 flex h-12 items-center justify-between gap-4 border-b border-white/[0.06] bg-court-surface px-4">
      <div className="flex min-w-0 flex-1 items-baseline gap-3">
        <h1 className="shrink-0 text-sm font-medium text-zinc-100">Venture Court</h1>
        <span className="hidden truncate font-mono text-[11px] text-zinc-600 sm:inline">{sessionId}</span>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
        <StatChip>{activeAgents} active</StatChip>
        <StatChip>{conflicts} conflicts</StatChip>
        <StatChip>{Math.round(currentConfidence)}%</StatChip>
        <StatChip>{stageLabel}</StatChip>
      </div>
    </header>
  );
}
