import type { AgentDefinition, AgentResult } from "../../types";
import { ConfidenceBar } from "./ConfidenceBar";
import { StatusBadge } from "./StatusBadge";

type AgentCardProps = {
  agent: AgentDefinition;
  result?: AgentResult;
  streaming?: string;
};

export function AgentCard({ agent, result, streaming }: AgentCardProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-zinc-100">{agent.name}</h3>
          <p className="text-xs text-zinc-500">{agent.role}</p>
        </div>
        <StatusBadge label={result?.position ?? "standby"} tone={result?.position ?? "neutral"} />
      </div>
      <p className="mt-2 text-[11px] uppercase tracking-wide text-zinc-500">{agent.karpathyLens}</p>
      {streaming ? (
        <p className="mt-3 max-h-24 overflow-hidden text-xs leading-5 text-zinc-300">
          {streaming}
          <span className="text-zinc-100">▋</span>
        </p>
      ) : result ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs leading-5 text-zinc-300">{result.claim}</p>
          <ConfidenceBar value={result.confidence} />
          <p className="font-mono text-xs text-zinc-500">{result.confidence}% confidence</p>
        </div>
      ) : (
        <p className="mt-3 text-xs text-zinc-600">Awaiting stage activation.</p>
      )}
    </article>
  );
}
