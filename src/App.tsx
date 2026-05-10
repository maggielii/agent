import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "@/components/Layout/AppShell";
import { IdeaInput } from "@/components/Input/IdeaInput";
import { CouncilTimeline } from "@/components/Council/CouncilTimeline";
import { CouncilProgress } from "@/components/Council/CouncilProgress";
import { CouncilStageCard } from "@/components/Council/CouncilStageCard";
import { LoadingCouncil } from "@/components/Council/LoadingCouncil";
import { ScorePanel } from "@/components/Dashboard/ScorePanel";
import { SponsorEngine } from "@/components/Dashboard/SponsorEngine";
import { ActiveStagePanel } from "@/components/Dashboard/ActiveStagePanel";
import { FinalVerdict } from "@/components/Verdict/FinalVerdict";
import { ExportButton } from "@/components/Verdict/ExportButton";
import { createInitialStages, runCouncil } from "@/services/councilEngine";
import type { CouncilRunResult } from "@/types/council";

export default function App() {
  const [idea, setIdea] = useState("");
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState(createInitialStages);
  const [result, setResult] = useState<CouncilRunResult | null>(null);

  const activeStage = useMemo(
    () => stages.find((s) => s.status === "running"),
    [stages]
  );

  const liveOverall = useMemo(() => {
    const done = stages.filter((s) => s.status === "complete" && s.id !== "final");
    if (!done.length) return 0;
    return Math.round(done.reduce((a, s) => a + s.score, 0) / done.length);
  }, [stages]);

  const overallForPanel = result?.finalVerdict.overallScore ?? liveOverall;

  const onSummon = useCallback(async () => {
    const trimmed = idea.trim();
    if (!trimmed) return;
    setRunning(true);
    setResult(null);
    setStages(createInitialStages());

    try {
      const res = await runCouncil(trimmed, (st) => {
        setStages((prev) => prev.map((s) => (s.id === st.id ? st : s)));
      });
      setResult(res);
      setStages(res.stages);
    } finally {
      setRunning(false);
    }
  }, [idea]);

  const hasStarted = stages.some((s) => s.status !== "pending");
  const showLanding =
    !running && stages.every((s) => s.status === "pending");
  const bootingCouncil =
    running && stages.every((s) => s.status === "pending");

  return (
    <>
      <AppShell>
        <div className="grid gap-6 pb-36 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <SponsorEngine />
            <ScorePanel stages={stages} overallScore={overallForPanel} />
          </aside>

          <div className="space-y-6">
            <motion.section
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl backdrop-blur-xl md:p-6"
              initial={false}
              layout
            >
              <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Council timeline</h2>
                  <p className="text-sm text-muted-foreground">
                    Eight specialized stages run automatically — watch the boardroom deliberate.
                  </p>
                </div>
                <CouncilProgress stages={stages} />
              </div>
              <CouncilTimeline stages={stages} activeId={activeStage?.id} />
            </motion.section>

            <AnimatePresence>
              {(running || hasStarted) && (
                <ActiveStagePanel stage={activeStage ?? undefined} />
              )}
            </AnimatePresence>

            {bootingCouncil && <LoadingCouncil />}

            {showLanding && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-gradient-to-b from-white/[0.04] to-transparent px-6 py-16 text-center"
              >
                <div className="max-w-xl space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/90">
                    Boardroom canvas
                  </p>
                  <h3 className="text-2xl font-bold text-white md:text-3xl">
                    The council is idle.
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    CouncilOS is not a chatbot. It is an AI boardroom, venture governance
                    engine, and multi-agent decision system — purpose-built for agents and
                    founders who need a clear build / pivot / kill signal.
                  </p>
                </div>
              </motion.div>
            )}

            {running && hasStarted && (
              <p className="text-center text-xs text-muted-foreground">
                Council in session… stages update live.
              </p>
            )}

            {result && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <ExportButton result={result} />
              </div>
            )}

            {result && <FinalVerdict verdict={result.finalVerdict} />}

            <div className="space-y-6">
              {stages.map((s) => (
                <CouncilStageCard
                  key={s.id}
                  stage={s}
                  highlight={s.id === activeStage?.id}
                />
              ))}
            </div>
          </div>
        </div>
      </AppShell>

      <IdeaInput
        value={idea}
        onChange={setIdea}
        onSubmit={onSummon}
        disabled={running}
      />
    </>
  );
}
