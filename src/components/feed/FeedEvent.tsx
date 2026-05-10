import clsx from "clsx";
import { format } from "date-fns";
import type { CodeReview, FeedEvent as FeedEventModel, NiaResult, Position, Severity } from "../../types";
import { useStore } from "../../store/useStore";
import { StatusBadge } from "../shared/StatusBadge";

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function hasSeverity(value: unknown): value is Severity {
  return value === "HIGH" || value === "MEDIUM" || value === "LOW";
}

function hasPosition(value: unknown): value is Position {
  return value === "bullish" || value === "cautious" || value === "adversarial" || value === "neutral";
}

function renderMarketResearch(result?: NiaResult) {
  if (!result) return null;
  return (
    <div className="mt-3 grid gap-3 text-xs md:grid-cols-2">
      <div>
        <div className="mb-1 text-zinc-500">Competitors</div>
        <ul className="space-y-1 text-zinc-300">
          {result.competitors.map((competitor) => (
            <li key={competitor.name}>
              <span className="text-zinc-100">{competitor.name}</span>: {competitor.positioning}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="mb-1 text-zinc-500">Market signals</div>
        <ul className="list-inside list-disc space-y-1 text-zinc-300">
          {result.marketSignals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function renderCodeReview(review?: CodeReview) {
  if (!review) return null;
  return (
    <div className="mt-3 space-y-2 text-xs">
      <div className="font-mono text-lg text-zinc-100">{review.overallScore}/100</div>
      <p className="text-zinc-300">{review.verdict}</p>
      <div className="space-y-1">
        {review.concerns.slice(0, 2).map((concern) => (
          <div key={concern.issue} className="flex gap-2">
            <StatusBadge label={concern.severity} tone={concern.severity} />
            <span className="text-zinc-400">{concern.issue}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeedEvent({ event }: { event: FeedEventModel }) {
  const streamingText = useStore((state) => state.streamingText);
  const position = hasPosition(event.metadata?.position) ? event.metadata.position : "neutral";
  const keyFindings = asStringArray(event.metadata?.keyFindings);
  const severity = hasSeverity(event.metadata?.severity) ? event.metadata.severity : "MEDIUM";
  const marketResearch = event.metadata?.niaResult as NiaResult | undefined;
  const codeReview = event.metadata?.codeReview as CodeReview | undefined;
  const hash = typeof event.metadata?.hash === "string" ? event.metadata.hash : "";
  const agentId = typeof event.metadata?.agentId === "string" ? event.metadata.agentId : "";
  const liveText = agentId ? streamingText[agentId] : "";

  if (event.type === "STAGE_START") {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
        <div className="text-xs uppercase tracking-wider text-zinc-500">{event.actor}</div>
        <p className="mt-1 text-sm text-zinc-200">{event.content}</p>
      </div>
    );
  }

  if (event.type === "CONFLICT") {
    return (
      <div className="border-l-2 border-red-500 bg-red-500/5 p-3">
        <div className="flex items-center gap-2">
          <StatusBadge label={severity} tone={severity} />
          <span className="text-xs text-zinc-500">{format(event.timestamp, "HH:mm:ss")}</span>
        </div>
        <p className="mt-2 text-sm text-zinc-200">{event.content}</p>
      </div>
    );
  }

  if (event.type === "AGENT_COMPLETE") {
    return (
      <div className="rounded-lg border border-white/10 bg-court-surface p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-zinc-100">{event.actor}</div>
          <StatusBadge label={position} tone={position} />
        </div>
        <p className="mt-2 text-sm text-zinc-300">{event.content}</p>
        {keyFindings.length > 0 && (
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-zinc-500">
            {keyFindings.slice(0, 3).map((finding) => (
              <li key={finding}>{finding}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (event.type === "AGENT_STREAMING") {
    return (
      <div className="rounded-lg border border-white/10 bg-court-surface p-3">
        <div className="flex items-center gap-2">
          <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-zinc-300">{event.actor}</span>
          <span className="text-xs text-zinc-600">{format(event.timestamp, "HH:mm:ss")}</span>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
          {liveText || event.content}
          {liveText && <span className="text-zinc-100">▋</span>}
        </p>
      </div>
    );
  }

  if (event.type === "MARKET_RESEARCH") {
    return (
      <div className="rounded-lg border border-white/10 bg-court-surface p-3">
        <div className="text-sm font-medium text-zinc-100">{event.actor}</div>
        <p className="mt-1 text-sm text-zinc-300">{event.content}</p>
        {renderMarketResearch(marketResearch)}
      </div>
    );
  }

  if (event.type === "CONFIDENCE_SHIFT") {
    return <p className="px-1 text-xs font-mono text-amber-300">{event.content}</p>;
  }

  if (event.type === "STAGE_SEALED") {
    return (
      <div className="rounded border border-emerald-400/20 bg-emerald-400/5 p-3">
        <p className="font-mono text-xs text-emerald-400">{hash || event.content}</p>
        <p className="mt-1 text-xs text-zinc-500">Stage sealed</p>
      </div>
    );
  }

  if (event.type === "CODE_REVIEW") {
    return (
      <div className="rounded-lg border border-white/10 bg-court-surface p-3">
        <div className="text-sm font-medium text-zinc-100">{event.actor}</div>
        <p className="mt-1 text-sm text-zinc-300">{event.content}</p>
        {renderCodeReview(codeReview)}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "rounded-lg border border-white/10 bg-court-surface p-3",
        event.type === "CODE_GENERATING" && "text-zinc-300",
        event.type === "SPECIALIST_SUMMONED" && "border-indigo-400/20 bg-indigo-400/5",
        event.type === "VERDICT" && "border-emerald-400/20 bg-emerald-400/5"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-zinc-100">{event.actor}</div>
        <span className="text-xs text-zinc-600">{format(event.timestamp, "HH:mm:ss")}</span>
      </div>
      <p className="mt-2 text-sm leading-5 text-zinc-300">
        {event.content}
        {event.type === "CODE_GENERATING" && <span>...</span>}
      </p>
    </div>
  );
}
