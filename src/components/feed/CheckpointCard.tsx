import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ConfidenceBar } from "../shared/ConfidenceBar";

interface CheckpointCardProps {
  stageVerdict: string;
  confidence: number;
  topRisk: string;
  nextStageName: string;
  onProceed: () => void;
  onStop: () => void;
}

export function CheckpointCard({
  stageVerdict,
  confidence,
  topRisk,
  nextStageName,
  onProceed,
  onStop,
}: CheckpointCardProps) {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-20 left-[264px] right-[312px] z-20 rounded-xl border border-white/15 bg-court-raised p-4 shadow-2xl"
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Stage complete</div>
      <blockquote className="mt-3 text-lg text-zinc-100">"{stageVerdict}"</blockquote>
      <div className="mt-4 grid grid-cols-[120px_1fr] items-center gap-3">
        <div className="font-mono text-sm text-zinc-300">Confidence: {Math.round(confidence)}%</div>
        <ConfidenceBar value={confidence} />
      </div>
      <p className="mt-3 text-xs text-zinc-500">Risk: {topRisk}</p>
      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onStop}
          className="rounded border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.03]"
        >
          Stop Here
        </button>
        <button
          type="button"
          onClick={onProceed}
          className="inline-flex items-center gap-2 rounded border border-white/10 bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-950"
        >
          Proceed to {nextStageName} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
