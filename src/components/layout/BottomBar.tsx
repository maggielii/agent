import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useStore } from "../../store/useStore";

export const SAMPLE_IDEAS = [
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
    <footer className="col-span-3 flex h-16 items-center gap-3 border-t border-white/10 bg-court-surface px-4">
      <input
        value={idea}
        onChange={(event) => setIdea(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && canSubmit) {
            void submitIdea(idea);
          }
        }}
        placeholder="Describe your startup idea..."
        disabled={isRunning}
        className="h-10 flex-1 rounded border border-white/10 bg-white/[0.03] px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <select
        aria-label="Load demo idea"
        disabled={isRunning}
        className="h-10 rounded border border-white/10 bg-court-raised px-3 text-xs text-zinc-300 outline-none disabled:cursor-not-allowed disabled:opacity-60"
        defaultValue=""
        onChange={(event) => {
          const selected = SAMPLE_IDEAS.find((sample) => sample.label === event.target.value);
          if (selected) setIdea(selected.idea);
          event.currentTarget.value = "";
        }}
      >
        <option value="" disabled>
          Load Demo
        </option>
        {SAMPLE_IDEAS.map((sample) => (
          <option key={sample.label} value={sample.label}>
            {sample.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => void submitIdea(idea)}
        className="inline-flex h-10 items-center gap-2 rounded border border-white/10 bg-zinc-100 px-4 text-sm font-medium text-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
        Summon Council
      </button>
    </footer>
  );
}
