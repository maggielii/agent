import { useStore } from "../../store/useStore";
import { CheckpointCard } from "../feed/CheckpointCard";
import { LiveFeed } from "../feed/LiveFeed";
import { PrototypingWorkspace } from "../prototyping/PrototypingWorkspace";
import { FinalVerdict } from "../verdict/FinalVerdict";

export function MainWorkspace() {
  const view = useStore((state) => state.view);
  const finalVerdict = useStore((state) => state.finalVerdict);
  const currentStageIndex = useStore((state) => state.currentStageIndex);
  const stages = useStore((state) => state.stages);
  const awaitingCheckpoint = useStore((state) => state.awaitingCheckpoint);
  const activeRisks = useStore((state) => state.activeRisks);
  const generatedCode = useStore((state) => state.generatedCode);
  const proceedFromCheckpoint = useStore((state) => state.proceedFromCheckpoint);
  const stopAtCheckpoint = useStore((state) => state.stopAtCheckpoint);
  const currentStage = stages[currentStageIndex];
  const nextStage = stages[currentStageIndex + 1];
  const showPrototype = currentStage?.id === "prototyping" || Boolean(generatedCode);

  if (view === "verdict" && finalVerdict) {
    return (
      <main className="overflow-y-auto bg-court-base scrollbar-thin-dark">
        <FinalVerdict verdict={finalVerdict} />
      </main>
    );
  }

  return (
    <main className="relative overflow-y-auto bg-court-base scrollbar-thin-dark">
      {showPrototype ? <PrototypingWorkspace /> : <LiveFeed />}
      {awaitingCheckpoint && currentStage && (
        <CheckpointCard
          stageVerdict={currentStage.stageVerdict}
          confidence={currentStage.confidenceAtSeal}
          topRisk={activeRisks[0]?.description ?? "No critical risk recorded"}
          nextStageName={nextStage?.name ?? "Final Verdict"}
          onProceed={() => void proceedFromCheckpoint()}
          onStop={stopAtCheckpoint}
        />
      )}
    </main>
  );
}
