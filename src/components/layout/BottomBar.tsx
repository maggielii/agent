import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useStore } from "../../store/useStore";

const SAMPLE_IDEAS = [
  {
    label: "Construction AI",
    idea: "AI executive coordination system for construction companies - vendor management, executive digest, and decision routing for mid-market general contractors.",
  },
  {
    label: "Healthcare Claims",
    idea: "AI claims copilot for healthcare reimbursement workflows - reducing denial rates and automating prior authorization for specialty care providers.",
  },
  {
    label: "Disaster Relief",
    idea: "Blockchain-backed disaster relief funding verification system - transparent fund disbursement with on-chain audit trails for NGOs and government agencies.",
  },
  {
    label: "Manufacturing Procurement",
    idea: "AI-native procurement coordination platform for manufacturing - real-time supplier risk scoring and automated RFQ workflows for mid-market factories.",
  },
];

export function BottomBar() {
  const [idea, setIdea] = useState("");
  const submitIdea = useStore((state) => state.submitIdea);
  const isRunning = useStore((state) => state.isRunning);
  const awaitingCheckpoint = useStore((state) => state.awaitingCheckpoint);
  const canSubmit = idea.trim().length > 10 && !isRunning && !awaitingCheckpoint;

  return (
    <footer className="col-span-3 border-t border-white/[0.06] bg-court-surface px-4 py-3">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 md:flex-row md:items-end md:gap-4">
        <div className="min-w-0 flex-1">
          <label htmlFor="venture-idea" className="mb-1.5 block text-xs font-medium text-zinc-500">
            Venture thesis
          </label>
          <input
            id="venture-idea"
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && canSubmit) {
                void submitIdea(idea);
              }
            }}
            placeholder="Problem, buyer, and why now — one or two sentences is enough to start."
            disabled={isRunning}
            className="h-10 w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-zinc-100 outline-none ring-offset-court-surface placeholder:text-zinc-600 focus:border-white/[0.14] focus:ring-2 focus:ring-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <div className="flex shrink-0 flex-col gap-2 md:w-auto md:flex-row md:items-end">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 md:justify-end">
            <span className="text-xs text-zinc-600">Examples:</span>
            {SAMPLE_IDEAS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                disabled={isRunning}
                className="text-xs text-zinc-500 underline decoration-white/10 underline-offset-2 transition-colors hover:text-zinc-300 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => setIdea(sample.idea)}
              >
                {sample.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void submitIdea(idea)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-100 px-5 text-sm font-medium text-zinc-950 hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
            Start evaluation
          </button>
        </div>
      </div>
    </footer>
  );
}
